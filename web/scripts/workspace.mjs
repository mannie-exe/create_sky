import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { domains, validateDomain } from '../src/lib/domains.mjs'
import { compile, root } from './compile.mjs'
import { authoring, configuredPack } from './authoring.mjs'
const hash = (text) => crypto.createHash('sha256').update(text).digest('hex')

export function workspace() {
  let busy = false
  return {
    name: 'atlas-local-workspace',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/__atlas/')) return next()
        const send = (status, value) => {
          res.writeHead(status, {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          })
          res.end(JSON.stringify(value))
        }
        const address = req.socket.remoteAddress
        if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address))
          return send(403, { error: 'Local workspace only' })
        if (
          !/^(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(
            req.headers.host ?? '',
          )
        )
          return send(403, { error: 'Loopback host required' })
        if (
          req.headers.origin &&
          req.headers.origin !== `http://${req.headers.host}`
        )
          return send(403, { error: 'Same-origin requests required' })
        try {
          if (req.method === 'GET' && req.url === '/__atlas/authoring')
            return send(200, await authoring(await configuredPack(root)).read())
          if (req.method === 'GET' && req.url === '/__atlas/authoring/audit')
            return send(
              200,
              await authoring(await configuredPack(root)).audit(),
            )
          if (req.method === 'GET' && req.url === '/__atlas/workspace') {
            const files = {}
            for (const name of domains) {
              const text = await fs.readFile(
                path.join(root, 'data/authored', name + '.yml'),
                'utf8',
              )
              files[name] = { text, revision: hash(text) }
            }
            return send(200, { files })
          }
          if (req.method === 'GET' && req.url === '/__atlas/status') {
            const snapshot = JSON.parse(
              await fs.readFile(
                path.join(root, 'data/generated/runtime/snapshot.json'),
                'utf8',
              ),
            )
            const current = await promisify(execFile)(
              'python3',
              [path.join(root, 'scripts/fingerprint.py')],
              { cwd: root },
            )
            return send(200, {
              stale: current.stdout.trim() !== snapshot.sourceFingerprint,
              changedDuringExport: snapshot.sourceChangedDuringExport,
              busy,
            })
          }
          if (
            req.method !== 'POST' ||
            req.headers['content-type'] !== 'application/json'
          )
            return send(405, { error: 'Use JSON POST' })
          if (!req.headers.origin)
            return send(403, { error: 'Origin header required for writes' })
          let body = ''
          for await (const chunk of req) {
            body += chunk
            if (Buffer.byteLength(body) > 1100000)
              return send(413, { error: 'Request too large' })
          }
          const input = JSON.parse(body)
          if (busy)
            return send(409, {
              error: 'Another edit is compiling; retry after refresh',
            })
          if (
            ['/__atlas/authoring/save', '/__atlas/authoring/generate'].includes(
              req.url,
            )
          ) {
            busy = true
            try {
              const editor = authoring(await configuredPack(root))
              return send(
                200,
                req.url.endsWith('/save')
                  ? await editor.save(input)
                  : await editor.generate(input),
              )
            } finally {
              busy = false
            }
          }
          if (req.url === '/__atlas/refresh') {
            busy = true
            try {
              for (const script of ['runtime.py', 'extract.py'])
                await promisify(execFile)(
                  'python3',
                  [path.join(root, 'scripts', script)],
                  { cwd: root, timeout: 660000, maxBuffer: 2 * 1024 * 1024 },
                )
              await compile()
              return send(200, { refreshed: true })
            } finally {
              busy = false
            }
          }
          if (req.url === '/__atlas/export') {
            const text = await fs.readFile(
              path.join(root, 'data/authored/recipes.yml'),
              'utf8',
            )
            validateDomain('recipes', text)
            busy = true
            try {
              await compile()
              await promisify(execFile)(
                'python3',
                [path.join(root, 'scripts/export_patch.py')],
                { cwd: root },
              )
              return send(200, { url: '/generated/create-sky-atlas-patch.zip' })
            } finally {
              busy = false
            }
          }
          const name = req.url.slice('/__atlas/domain/'.length)
          if (
            !req.url.startsWith('/__atlas/domain/') ||
            !domains.includes(name)
          )
            return send(404, { error: 'Unknown domain' })
          validateDomain(name, input.text)
          const file = path.join(root, 'data/authored', name + '.yml'),
            before = await fs.readFile(file, 'utf8')
          if (hash(before) !== input.revision)
            return send(409, {
              error: 'File changed on disk. Reload before saving.',
            })
          busy = true
          try {
            await fs.writeFile(file + '.tmp', input.text)
            await fs.rename(file + '.tmp', file)
            try {
              await compile()
            } catch (error) {
              await fs.writeFile(file, before)
              await compile().catch(() => {})
              throw error
            }
            return send(200, { revision: hash(input.text) })
          } finally {
            busy = false
          }
        } catch (error) {
          send(400, { error: error.message })
        }
      })
    },
  }
}
