import os
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from archive_output import archive_bytes, publish


class ArchiveOutput(unittest.TestCase):
    def test_order_independent_and_unchanged_output_is_not_rewritten(self):
        date = (2026, 10, 23, 0, 0, 0)
        data = archive_bytes({'b': b'two', 'a': b'one'}, date)
        self.assertEqual(data, archive_bytes({'a': b'one', 'b': b'two'}, date))
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'output.zip'
            self.assertTrue(publish(path, data))
            os.utime(path, ns=(1000000000, 1000000000))
            self.assertFalse(publish(path, data))
            self.assertFalse(publish(path, data, check=True))
            self.assertEqual(path.stat().st_mtime_ns, 1000000000)

    def test_check_preserves_stale_output_and_does_not_create_missing_output(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'output.zip'
            with self.assertRaisesRegex(ValueError, 'missing or stale'):
                publish(path, b'new', check=True)
            self.assertFalse(path.exists())
            path.write_bytes(b'old')
            with self.assertRaisesRegex(ValueError, 'missing or stale'):
                publish(path, b'new', check=True)
            self.assertEqual(path.read_bytes(), b'old')
            self.assertEqual(list(Path(folder).iterdir()), [path])
