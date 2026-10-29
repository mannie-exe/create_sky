"""Accept an export only after its isolated server exits cleanly."""
import subprocess


def run_capture(command, *, cwd, log, complete, timeout=600):
    complete.unlink(missing_ok=True)
    try:
        with log.open('w') as output:
            result = subprocess.run(command, cwd=cwd, stdout=output,
                                    stderr=subprocess.STDOUT, timeout=timeout)
        fatal = ('Encountered an unexpected exception', 'Exception stopping the server',
                 'Uncaught exception in server thread', 'OutOfMemoryError')
        text = log.read_text(errors='replace')
        if result.returncode or not complete.is_file() or any(marker in text for marker in fatal):
            raise RuntimeError(f'Runtime export failed; inspect {log}')
    except BaseException:
        complete.unlink(missing_ok=True)
        raise
