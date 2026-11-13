#!/usr/bin/env python3
"""
Antigravity PreToolUse Lifecycle Hook (`pre_write_spec_guard.py`)
Contract:
- Reads camelCase JSON from stdin (`toolCall.name`, `toolCall.args`, `workspacePaths`, etc.)
- Enforces `draft: true` mode on new `.mdx` articles in `src/content/articles/` so the agent
  cannot publish blind to production without a Git PR & 10-second mobile visual approval.
- Outputs JSON `{"decision": "allow", ...}` to stdout.
"""

import json
import re
import sys


def main() -> None:
    try:
        raw_input = sys.stdin.read()
        payload = json.loads(raw_input) if raw_input.strip() else {}
    except Exception:
        print(json.dumps({"decision": "allow"}))
        return

    tool_call = payload.get("toolCall", {})
    args = tool_call.get("args", {}) or {}
    path = str(args.get("Path", ""))
    content = str(args.get("Content", ""))

    # Only inspect .mdx files inside src/content/articles/
    if "src/content/articles/" not in path or not path.endswith(".mdx"):
        print(json.dumps({"decision": "allow"}))
        return

    # If writing a full MDX file with frontmatter, ensure `draft: true` is set
    if content.startswith("---") and "draft:" not in content[:600]:
        updated_content = re.sub(
            r"^---\n",
            "---\ndraft: true\n",
            content,
            count=1,
        )
        print(
            json.dumps(
                {
                    "decision": "allow",
                    "reason": "Injected `draft: true` into MDX frontmatter to enforce Git PR & visual approval workflow.",
                    "overwrite": {
                        "Path": path,
                        "Content": updated_content,
                        "Overwrite": args.get("Overwrite", True),
                    },
                }
            )
        )
        return

    print(json.dumps({"decision": "allow"}))


if __name__ == "__main__":
    main()
