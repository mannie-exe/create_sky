#!/usr/bin/env python3
"""Apply the checked Unix terminal workaround to empack 0.8.2 server exports."""

import argparse
import json
import os
from pathlib import Path
import stat
import subprocess
import tempfile
import zipfile


HELPER_NAME = "foreground-runtime.py"
HELPER = Path(__file__).with_name(HELPER_NAME)


def original_script(gui=False):
    arguments = '"$@"' if gui else 'nogui "$@"'
    return (
        '#!/usr/bin/env bash\n'
        'set -euo pipefail\n'
        'cd -- "$(dirname -- "${BASH_SOURCE[0]}")"\n'
        'JAVA_PATH="${JAVA_HOME:+$JAVA_HOME/bin/}java"\n'
        'bash ./install_pack.sh\n'
        'exec empack --workdir "$PWD" --yes instance launch --server -- '
        f'"$JAVA_PATH" {arguments}\n'
    ).encode()


def patched_script(gui=False):
    return original_script(gui).replace(
        b'bash ./install_pack.sh\n',
        b'command -v python3 >/dev/null || { echo "Python 3 is required for the empack 0.8.2 terminal workaround." >&2; exit 1; }\n'
        b'export EMPACK_RUNTIME_PROGRAM="$JAVA_PATH"\n'
        b'bash ./install_pack.sh\n',
    ).replace(b'-- "$JAVA_PATH"', b'-- "$PWD/foreground-runtime.py"')


def patch_archive(path, check=False):
    path = Path(path)
    if path.is_symlink() or not path.is_file():
        raise ValueError(f"Expected a regular archive: {path}")
    replacements = {
        "start.sh": patched_script(),
        "start_gui.sh": patched_script(gui=True),
        HELPER_NAME: HELPER.read_bytes(),
    }
    with zipfile.ZipFile(path) as source:
        names = source.namelist()
        if len(names) != len(set(names)):
            raise ValueError("Duplicate archive members")
        if source.testzip() is not None:
            raise ValueError("Archive CRC failure")
        release = json.loads(source.read(".empack-consumer/release.json"))
        if release.get("require_subscription") or not release.get("server_launch"):
            raise ValueError("Expected a snapshot server reference archive")
        for name, gui in (("start.sh", False), ("start_gui.sh", True)):
            if source.read(name) not in (original_script(gui), replacements[name]):
                raise ValueError(f"Unexpected {name}; review the empack upgrade before patching")
        if HELPER_NAME in names and source.read(HELPER_NAME) != replacements[HELPER_NAME]:
            raise ValueError("Existing runtime helper differs; refusing replacement")
        if all(name in names and source.read(name) == data for name, data in replacements.items()):
            return False
        if check:
            raise ValueError(f"Server archive needs the terminal patch: {path}")
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(dir=path.parent, suffix=".zip", delete=False) as output:
                temporary = Path(output.name)
            with zipfile.ZipFile(temporary, "w") as target:
                target.comment = source.comment
                for member in source.infolist():
                    data = replacements.get(member.filename)
                    target.writestr(member, source.read(member) if data is None else data)
                if HELPER_NAME not in names:
                    info = zipfile.ZipInfo(HELPER_NAME, date_time=(1980, 1, 1, 0, 0, 0))
                    info.create_system = 3
                    info.external_attr = (stat.S_IFREG | 0o755) << 16
                    info.compress_type = zipfile.ZIP_DEFLATED
                    target.writestr(info, replacements[HELPER_NAME])
            with zipfile.ZipFile(temporary) as check:
                if check.testzip() is not None:
                    raise ValueError("Patched archive CRC failure")
            temporary.chmod(stat.S_IMODE(path.stat().st_mode))
            source.close()  # Windows cannot replace an open source archive.
            os.replace(temporary, path)
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)
    return True


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archives", nargs="*", type=Path)
    parser.add_argument("--check", action="store_true", help="Verify patched archives without rewriting them")
    args = parser.parse_args()
    archives = args.archives
    if not archives:
        report = json.loads(subprocess.check_output(
            ["empack", "build", "--explain", "--json", "--optional-defaults"], text=True,
        ))
        if report.get("lock") != "current":
            raise ValueError("Run empack sync before packaging")
        for profile in report["profiles"]:
            recipe = profile["recipe"]
            if recipe["consumer"] == "server" and recipe["delivery"] == "references":
                if recipe["format"] != "zip" or recipe["updates"] != "snapshot":
                    raise ValueError("Workaround supports snapshot ZIP exports only")
                archives.append(Path(profile["output"]))
    if not archives:
        raise ValueError("No server reference archives selected")
    for archive in archives:
        changed = patch_archive(archive, check=args.check)
        print(f"{'Patched' if changed else 'Already patched'} {archive}")


if __name__ == "__main__":
    main()
