#!/usr/bin/env python3
"""
Sync requirement documents into skill resources.

Generates `.claude/skills/<skill>/resources/requirements-index.md` based on
`docs/00-requirements/requirements-skill-map.json` and updates SKILL.md
descriptions to reference the index.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Dict, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
MAPPING_PATH = ROOT / "docs/00-requirements/requirements-skill-map.json"
SKILLS_ROOT = ROOT / ".claude/skills"


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def extract_title_and_summary(path: Path) -> Tuple[str, str]:
    title = path.name
    summary = ""
    for line in read_text(path).splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            title = stripped[2:].strip()
            continue
        if title and stripped and not stripped.startswith("#"):
            if stripped.startswith(">"):
                stripped = stripped.lstrip(">").strip()
            summary = stripped
            break
    if not summary:
        summary = "要求仕様の詳細は本文を参照"
    summary = summary.replace("|", "／")
    if len(summary) > 120:
        summary = summary[:117] + "..."
    return title, summary


def load_mapping(path: Path) -> List[Dict[str, object]]:
    data = json.loads(read_text(path))
    if not isinstance(data, dict) or "requirements" not in data:
        raise ValueError("mapping file must include requirements array")
    requirements = data["requirements"]
    if not isinstance(requirements, list):
        raise ValueError("requirements must be a list")
    return requirements


def build_skill_index(skill: str, entries: List[Dict[str, str]]) -> str:
    lines = [
        "# Requirements Index",
        "",
        "## 概要",
        "",
        "docs/00-requirements 配下の要求仕様を参照するための索引です。",
        "実装時は各ドキュメント本文を読み込み、要件を漏れなく反映してください。",
        "",
        "## 対象ドキュメント",
        "",
    ]
    for entry in entries:
        doc = entry["file"]
        title = entry["title"]
        summary = entry["summary"]
        lines.extend(
            [
                f"### {title}",
                f"- パス: `{doc}`",
                f"- 目的/範囲: {summary}",
                "- 読み取り指示: 本文を必ず全文確認",
                "",
            ]
        )
    lines.extend(
        [
            "## 更新ルール",
            "",
            "- `docs/00-requirements` が更新されたら本索引も更新する",
            "- 要件を追加した場合は mapping に追記して再同期する",
            "- 変更点は SKILL.md と Level2/Level3 を更新する",
        ]
    )
    return "\n".join(lines).rstrip() + "\n"


def ensure_skill_description(skill_path: Path) -> bool:
    text = read_text(skill_path)
    if "`resources/requirements-index.md`" in text:
        return False

    lines = text.splitlines()
    if not lines or lines[0] != "---":
        return False

    try:
        end_index = lines[1:].index("---") + 1
    except ValueError:
        return False

    frontmatter = lines[: end_index + 1]
    body = lines[end_index + 1 :]

    try:
        desc_index = next(
            i for i, line in enumerate(frontmatter) if line.startswith("description: |")
        )
    except StopIteration:
        return False

    desc_lines: List[str] = []
    desc_end = desc_index + 1
    for i in range(desc_index + 1, len(frontmatter)):
        line = frontmatter[i]
        if line and not line.startswith(" "):
            desc_end = i
            break
        desc_lines.append(line)
    else:
        desc_end = len(frontmatter)

    desc_text = "\n".join(desc_lines)
    insert_line = "  - `resources/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）"
    if "📚 リソース参照:" in desc_text:
        updated_desc: List[str] = []
        in_resource = False
        inserted = False
        for line in desc_lines:
            updated_desc.append(line)
            if "📚 リソース参照:" in line:
                in_resource = True
                continue
            if in_resource and line.startswith("  - "):
                continue
            if in_resource and not line.startswith("  - "):
                if not inserted:
                    updated_desc.insert(len(updated_desc) - 1, insert_line)
                    inserted = True
                in_resource = False
        if not inserted:
            updated_desc.append(insert_line)
        desc_lines = updated_desc
    else:
        updated_desc = []
        inserted = False
        for line in desc_lines:
            if not inserted and "Use proactively" in line:
                updated_desc.append("  📚 リソース参照:")
                updated_desc.append(insert_line)
                updated_desc.append("")
                inserted = True
            updated_desc.append(line)
        if not inserted:
            updated_desc.extend(["", "  📚 リソース参照:", insert_line])
        desc_lines = updated_desc

    new_frontmatter = frontmatter[: desc_index + 1] + desc_lines + frontmatter[desc_end:]
    new_text = "\n".join(new_frontmatter + body) + "\n"
    write_text(skill_path, new_text)
    return True


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync requirement docs to skills")
    parser.add_argument("--dry-run", action="store_true", help="Show changes only")
    parser.add_argument("--skill", help="Only update the specified skill")
    args = parser.parse_args()

    requirements = load_mapping(MAPPING_PATH)
    skill_map: Dict[str, List[Dict[str, str]]] = {}
    missing_docs = []

    for item in requirements:
        file_path = item.get("file")
        skills = item.get("skills")
        if not isinstance(file_path, str) or not isinstance(skills, list):
            continue
        doc_path = ROOT / file_path
        if not doc_path.exists():
            missing_docs.append(file_path)
            continue
        title, summary = extract_title_and_summary(doc_path)
        for skill in skills:
            if args.skill and skill != args.skill:
                continue
            skill_map.setdefault(skill, []).append(
                {"file": file_path, "title": title, "summary": summary}
            )

    updated = []
    missing_skills = []
    for skill, entries in sorted(skill_map.items()):
        skill_dir = SKILLS_ROOT / skill
        if not skill_dir.exists():
            missing_skills.append(skill)
            continue
        resources_dir = skill_dir / "resources"
        resources_dir.mkdir(parents=True, exist_ok=True)
        index_path = resources_dir / "requirements-index.md"
        content = build_skill_index(skill, entries)
        if args.dry_run:
            updated.append(str(index_path))
        else:
            write_text(index_path, content)
            updated.append(str(index_path))

        skill_md = skill_dir / "SKILL.md"
        if skill_md.exists() and not args.dry_run:
            ensure_skill_description(skill_md)

    print(f"updated {len(updated)} requirement index files")
    if missing_docs:
        print("missing docs:")
        for doc in missing_docs:
            print(f"- {doc}")
    if missing_skills:
        print("missing skills:")
        for skill in missing_skills:
            print(f"- {skill}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
