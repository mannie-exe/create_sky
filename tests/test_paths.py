import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import paths


class PathTests(unittest.TestCase):
    def test_partial_overrides_preserve_defaults_and_resolve_from_project(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'data').mkdir()
            (root / 'data/local.example.json').write_text(json.dumps({
                'server': 'instances/server',
                'vanilla': '~/minecraft-client.jar',
                'java': '/opt/jdk/bin',
            }))
            with patch.object(paths, 'ROOT', root):
                defaults = paths.paths()
                self.assertEqual(defaults['server'], (root / 'instances/server').resolve())
                self.assertEqual(defaults['vanilla'], (Path.home() / 'minecraft-client.jar').resolve())
                (root / 'data/local.json').write_text('{"vanilla":"assets/client.jar"}')
                configured = paths.paths()
                self.assertEqual(configured['vanilla'], (root / 'assets/client.jar').resolve())
                self.assertEqual(configured['server'], defaults['server'])
                self.assertEqual(configured['java'], defaults['java'])

    def test_malformed_local_config_is_not_silently_ignored(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'data').mkdir()
            (root / 'data/local.example.json').write_text('{}')
            (root / 'data/local.json').write_text('{broken')
            with patch.object(paths, 'ROOT', root):
                with self.assertRaises(json.JSONDecodeError):
                    paths.paths()
