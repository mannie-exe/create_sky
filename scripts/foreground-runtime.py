#!/usr/bin/env python3
"""Hand the terminal to empack's Unix runtime group, then replace this process."""

import os
import signal
import sys


if os.isatty(0):
    foreground = os.tcgetpgrp(0)
    if foreground == os.getpgid(os.getppid()):
        previous = signal.signal(signal.SIGTTOU, signal.SIG_IGN)
        try:
            os.tcsetpgrp(0, os.getpgrp())
        finally:
            signal.signal(signal.SIGTTOU, previous)

program = os.environ["EMPACK_RUNTIME_PROGRAM"]
os.execvp(program, [program, *sys.argv[1:]])
