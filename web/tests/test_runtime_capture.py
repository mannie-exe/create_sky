import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from runtime_capture import run_capture


class RuntimeCaptureTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.complete = self.root / 'complete.json'

    def run_fixture(self, code, timeout=5):
        run_capture([sys.executable, '-c', code], cwd=self.root,
                    log=self.root / 'runtime.log', complete=self.complete, timeout=timeout)

    def test_normal_shutdown_accepts_completed_export_despite_optional_diagnostics(self):
        self.run_fixture("from pathlib import Path; Path('complete.json').write_text('{}'); print('ERROR optional native backend unavailable')")
        self.assertTrue(self.complete.exists())

    def test_zero_exit_does_not_hide_shutdown_crash(self):
        with self.assertRaises(RuntimeError):
            self.run_fixture("from pathlib import Path; Path('complete.json').write_text('{}'); print('Encountered an unexpected exception')")
        self.assertFalse(self.complete.exists())

    def test_nonzero_exit_invalidates_complete_marker(self):
        with self.assertRaises(RuntimeError):
            self.run_fixture("from pathlib import Path; Path('complete.json').write_text('{}'); raise SystemExit(1)")
        self.assertFalse(self.complete.exists())

    def test_stale_marker_cannot_certify_missing_export(self):
        self.complete.write_text('{}')
        with self.assertRaises(RuntimeError):
            self.run_fixture('pass')
        self.assertFalse(self.complete.exists())

    def test_timeout_invalidates_capture(self):
        with self.assertRaises(subprocess.TimeoutExpired):
            self.run_fixture("from pathlib import Path; import time; Path('complete.json').write_text('{}'); time.sleep(5)", timeout=0.2)
        self.assertFalse(self.complete.exists())
