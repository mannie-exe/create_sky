"""Check the temporary server-export patch without running Minecraft."""

import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile


SCRIPT = Path(__file__).resolve().parents[1] / "scripts/patch-server-archives.py"
SPEC = importlib.util.spec_from_file_location("server_archives", SCRIPT)
PATCH = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PATCH)


class ServerArchiveTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.path = Path(self.temporary.name) / "server.zip"

    def archive(self, changed=False, helper=None):
        files = {
            "start.sh": PATCH.original_script() + (b"# unexpected\n" if changed else b""),
            "start_gui.sh": PATCH.original_script(gui=True),
            ".empack-consumer/release.json": json.dumps({"server_launch": {"kind": "jar"}}).encode(),
            "start.bat": b"windows remains unchanged",
            "install_pack.sh": b"preparation remains unchanged",
            "game/server.properties": b"level-seed=123\n",
        }
        if helper is not None:
            files[PATCH.HELPER_NAME] = helper
        with zipfile.ZipFile(self.path, "w") as archive:
            for name, data in files.items():
                archive.writestr(name, data)
        return files

    def test_patches_only_unix_launchers_and_is_idempotent(self):
        before = self.archive()
        self.assertTrue(PATCH.patch_archive(self.path))
        with zipfile.ZipFile(self.path) as archive:
            for name, data in before.items():
                if name not in ("start.sh", "start_gui.sh"):
                    self.assertEqual(archive.read(name), data)
            self.assertEqual(archive.read(PATCH.HELPER_NAME), PATCH.HELPER.read_bytes())
            self.assertEqual(archive.getinfo(PATCH.HELPER_NAME).external_attr >> 16 & 0o777, 0o755)
            self.assertIn(b"instance launch --server", archive.read("start.sh"))
            self.assertIn(b"bash ./install_pack.sh", archive.read("start.sh"))
        digest = hashlib.sha256(self.path.read_bytes()).digest()
        self.assertFalse(PATCH.patch_archive(self.path))
        self.assertEqual(hashlib.sha256(self.path.read_bytes()).digest(), digest)

    def test_unknown_launcher_is_rejected_without_writing(self):
        self.archive(changed=True)
        before = self.path.read_bytes()
        with self.assertRaisesRegex(ValueError, "Unexpected start.sh"):
            PATCH.patch_archive(self.path)
        self.assertEqual(self.path.read_bytes(), before)

    def test_unknown_helper_is_rejected_without_writing(self):
        self.archive(helper=b"unrelated helper")
        before = self.path.read_bytes()
        with self.assertRaisesRegex(ValueError, "Existing runtime helper"):
            PATCH.patch_archive(self.path)
        self.assertEqual(self.path.read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
