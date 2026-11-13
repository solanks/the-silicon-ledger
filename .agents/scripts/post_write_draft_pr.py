#!/usr/bin/env python3
"""
Antigravity PostToolUse Lifecycle Hook (`post_write_draft_pr.py`)
Contract:
- Fires after `write_file` or `edit_file` completes.
- When an `.mdx` article in `src/content/articles/` is written, stages it on a
  `draft/<slug>` Git branch and writes a 10-second Mobile Visual Approval card
  into `artifactDirectoryPath` (and `./artifacts/`).
- Always outputs `{}` on stdout per the Antigravity PostToolUse contract.
"""

import json
from pathlib import Path
import subprocess
import sys


def main() -> None:
    try:
        raw_input = sys.stdin.read()
        payload = json.loads(raw_input) if raw_input.strip() else {}
    except Exception:
        print("{}")
        return

    tool_call = payload.get("toolCall", {})
    args = tool_call.get("args", {}) or {}
    file_path_str = str(args.get("Path", ""))

    if "src/content/articles/" in file_path_str and file_path_str.endswith(".mdx"):
        mdx_path = Path(file_path_str)
        slug = mdx_path.stem
        workspace_root = mdx_path.resolve().parent.parent.parent.parent

        # 1. Stage on `draft/<slug>` Git branch quietly
        try:
            branch_name = f"draft/{slug}"
            if (workspace_root / ".git").exists():
                subprocess.run(
                    ["git", "checkout", "-B", branch_name],
                    cwd=workspace_root,
                    check=False,
                    capture_output=True,
                )
                subprocess.run(
                    ["git", "add", str(mdx_path)],
                    cwd=workspace_root,
                    check=False,
                    capture_output=True,
                )
        except Exception:
            pass

        # 2. Write 10-second Mobile Approval summary to artifactDirectoryPath if provided
        artifact_dir_str = payload.get("artifactDirectoryPath")
        if artifact_dir_str:
            try:
                art_dir = Path(artifact_dir_str)
                art_dir.mkdir(parents=True, exist_ok=True)
                checklist = art_dir / f"draft_approval_{slug}.md"
                checklist.write_text(
                    f"# 10-Second Mobile Approval Card: `{slug}`\n\n"
                    f"- **Git Draft Branch**: `draft/{slug}`\n"
                    f"- **Article Path**: `{mdx_path}`\n"
                    f"- **OpenGraph 1200×630 Card**: `/og/{slug}.svg`\n"
                    f"- **Status**: Ready for mobile visual sign-off & PR merge.\n",
                    encoding="utf-8",
                )
            except Exception:
                pass

    # PostToolUse contract requires `{}` on stdout
    print("{}")


if __name__ == "__main__":
    main()
