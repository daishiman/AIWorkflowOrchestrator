#!/usr/bin/env python3
"""
Update Level1-4 resources for skills based on current SKILL.md and assets.
"""
from __future__ import annotations

import argparse
import os
import re
from pathlib import Path
from typing import Dict, List, Tuple


ROOT = Path(__file__).resolve().parents[1]
SKILLS_ROOT = ROOT / ".claude/skills"

READ_VERBS = (
    "check",
    "validate",
    "analyze",
    "scan",
    "audit",
    "review",
    "inspect",
    "list",
    "report",
    "summarize",
    "collect",
    "verify",
    "diagnose",
    "test",
)
WRITE_VERBS = (
    "apply",
    "update",
    "fix",
    "sync",
    "generate",
    "build",
    "create",
    "write",
    "import",
    "export",
    "migrate",
    "rotate",
    "backup",
    "restore",
)

GENERIC_BEST_PRACTICE_PATTERNS = (
    "resources/Level1",
    "resources/Level2",
    "resources/Level3",
    "resources/Level4",
    "SKILL.md",
)

EXCLUDED_TOPIC_KEYWORDS = (
    "概要",
    "前提",
    "詳細",
    "実践",
    "チェックリスト",
    "コマンドリファレンス",
    "ディレクトリ",
    "変更履歴",
    "ベストプラクティス",
    "ワークフロー",
    "Phase",
    "Skill",
    "スキル",
    "リソース参照",
    "テンプレート参照",
    "参照書籍",
    "Requirements Index",
    "対象ドキュメント",
    "更新ルール",
)


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def extract_frontmatter(text: str) -> str:
    match = re.match(r"^---\n(.*?)\n---\n", text, re.S)
    return match.group(1) if match else ""


def extract_description(frontmatter: str) -> str:
    match = re.search(
        r"^description:\s*\|\n(.*?)(?=\n\w[\w-]*:|\n$)",
        frontmatter,
        re.S | re.M,
    )
    return match.group(1).rstrip() if match else ""


def extract_name(frontmatter: str) -> str:
    match = re.search(r"^name:\s*(.+)$", frontmatter, re.M)
    return match.group(1).strip().strip('"') if match else ""


def parse_description_lists(desc_text: str) -> Tuple[Dict[str, str], List[str], str]:
    desc_map: Dict[str, str] = {}
    books: List[str] = []
    use_line = ""
    in_books = False
    in_refs = False
    for line in desc_text.splitlines():
        stripped = line.strip()
        if stripped.startswith("Use proactively"):
            use_line = stripped
        if stripped.startswith("📖"):
            in_books = True
            in_refs = False
            continue
        if stripped.startswith(("📚", "🧰", "🗂")):
            in_books = False
            in_refs = True
            continue
        if stripped.startswith("Use proactively"):
            in_books = False
            in_refs = False
            continue
        if in_books:
            if stripped.startswith("- "):
                books.append(stripped[2:])
            continue
        if in_refs:
            if stripped.startswith("- "):
                match = re.match(r"-\s+`([^`]+)`\s*:\s*(.+)", stripped)
                if match:
                    desc_map[match.group(1)] = match.group(2).strip()
            continue
    return desc_map, books, use_line


def extract_section(text: str, heading: str) -> str:
    pattern = rf"^##\s+{re.escape(heading)}\n(.*?)(?=\n##\s|\Z)"
    match = re.search(pattern, text, re.S | re.M)
    return match.group(1).strip() if match else ""


def normalize_summary(summary: str) -> str:
    cleaned = summary.strip()
    if not cleaned or cleaned in (">", "＞"):
        return ""
    return cleaned


def extract_summary(text: str) -> str:
    section = extract_section(text, "概要")
    if not section:
        return ""
    lines = []
    for line in section.splitlines():
        if not line.strip():
            break
        lines.append(line.strip())
    return normalize_summary(" ".join(lines))


def extract_best_practices(text: str) -> Tuple[List[str], List[str]]:
    section = extract_section(text, "ベストプラクティス")
    best_do: List[str] = []
    best_avoid: List[str] = []
    if not section:
        return best_do, best_avoid
    match_do = re.search(r"^###\s+すべきこと\n(.*?)(?=\n###\s|\Z)", section, re.S | re.M)
    if match_do:
        for line in match_do.group(1).splitlines():
            if line.strip().startswith("- "):
                best_do.append(line.strip()[2:])
    match_avoid = re.search(
        r"^###\s+避けるべきこと\n(.*?)(?=\n###\s|\Z)", section, re.S | re.M
    )
    if match_avoid:
        for line in match_avoid.group(1).splitlines():
            if line.strip().startswith("- "):
                best_avoid.append(line.strip()[2:])
    return best_do, best_avoid


def filter_generic(items: List[str]) -> List[str]:
    return [item for item in items if not any(pat in item for pat in GENERIC_BEST_PRACTICE_PATTERNS)]


def list_files(dir_path: Path, suffix: str | None = None) -> List[str]:
    if not dir_path.is_dir():
        return []
    items: List[str] = []
    for name in sorted(os.listdir(dir_path)):
        path = dir_path / name
        if not path.is_file():
            continue
        if suffix and not name.endswith(suffix):
            continue
        items.append(name)
    return items


def prioritize_resources(resources: List[str]) -> List[str]:
    return sorted(resources, key=lambda name: (1 if "legacy" in name else 0, name))


def classify_scripts(scripts: List[str]) -> Tuple[List[str], List[str], List[str]]:
    read: List[str] = []
    write: List[str] = []
    other: List[str] = []
    for script in scripts:
        base = os.path.splitext(script)[0]
        verb = base.split("-")[0].split("_")[0]
        if verb in READ_VERBS:
            read.append(script)
        elif verb in WRITE_VERBS:
            write.append(script)
        else:
            other.append(script)
    return read, write, other


def fallback_desc(path: str) -> str:
    name = os.path.splitext(os.path.basename(path))[0].replace("-", " ").replace("_", " ")
    if path.startswith("scripts/"):
        return f"{name} を支援するスクリプト"
    if path.startswith("templates/"):
        return f"{name} のテンプレート"
    return f"{name} の補助ガイド"


def format_entries(paths: List[str], desc_map: Dict[str, str], topics: Dict[str, List[str]] | None = None) -> List[str]:
    lines = []
    topics = topics or {}
    for path in paths:
        desc = desc_map.get(path) or fallback_desc(path)
        topic_list = topics.get(path, [])
        if topic_list:
            topic_text = " / ".join(topic_list)
            lines.append(f"- `{path}`: {desc}（把握する知識: {topic_text}）")
        else:
            lines.append(f"- `{path}`: {desc}")
    return lines


def humanize(name: str) -> str:
    return name.replace("-", " ")


def skill_fallback_summary(skill_name: str) -> str:
    if not skill_name:
        return "このスキルの基本的な使い方を整理する。"
    return f"{humanize(skill_name)} に関するベストプラクティスと判断基準を整理するスキル。"


def is_excluded_topic(topic: str) -> bool:
    return any(keyword in topic for keyword in EXCLUDED_TOPIC_KEYWORDS)


def extract_resource_topics(path: Path) -> List[str]:
    topics: List[str] = []
    try:
        for line in read_text(path).splitlines():
            stripped = line.strip()
            if not stripped:
                continue
            if stripped.startswith("## "):
                candidate = stripped[3:].strip()
                if not is_excluded_topic(candidate):
                    topics.append(candidate)
            elif stripped.startswith("### "):
                candidate = stripped[4:].strip()
                if not is_excluded_topic(candidate):
                    topics.append(candidate)
            elif stripped.startswith("# ") and not topics:
                candidate = stripped[2:].strip()
                if not is_excluded_topic(candidate):
                    topics.append(candidate)
            if len(topics) >= 3:
                break
    except OSError:
        return []
    return topics


def collect_topic_keywords(resources: List[str], topics_map: Dict[str, List[str]]) -> List[str]:
    seen = set()
    keywords: List[str] = []
    for res in resources:
        rel = f"resources/{res}"
        topics = topics_map.get(rel, [])
        if topics:
            for topic in topics:
                if topic in seen or is_excluded_topic(topic):
                    continue
                seen.add(topic)
                keywords.append(topic)
        else:
            base = os.path.splitext(res)[0].replace("-", " ")
            if base and base not in seen and not is_excluded_topic(base):
                seen.add(base)
                keywords.append(base)
        if len(keywords) >= 6:
            break
    return keywords


def build_level1(summary: str, use_line: str, books: List[str], best_do: List[str], best_avoid: List[str],
                 templates: List[str], fallback_summary: str, topics: List[str]) -> str:
    overview = summary or fallback_summary
    content = [
        "# Level 1: Basics",
        "",
        "## 概要",
        "",
        overview,
        "",
        "SKILL.md の内容だけで完結する基本運用を扱います。",
        "",
        "## 前提条件",
        "",
        "- SKILL.md の概要とワークフローを読了している",
        "- 対象タスクの目的と成果物を把握している",
        "",
        "## 詳細ガイド",
        "",
        "### 使用タイミング",
    ]
    content.append(f"- {use_line}" if use_line else "- 基本方針の共有や初回の適用時に使用する")
    content.extend(
        [
            "",
            "### 必要な知識",
            f"- 対象領域: {overview}",
        ]
    )
    if topics:
        content.append("- 主要概念: " + " / ".join(topics[:5]))
    if best_do:
        for item in best_do[:3]:
            content.append(f"- 実務指針: {item}")
    else:
        content.append("- 実務指針: SKILL.md のベストプラクティスを守る")
    content.extend(
        [
            "",
            "### 判断基準",
        ]
    )
    if best_avoid:
        for item in best_avoid[:3]:
            content.append(f"- 避けるべき判断: {item}")
    else:
        content.append("- 目的・前提・成果物要件が揃っているかを確認する")
    content.extend(
        [
            "",
            "### 成果物の最小要件",
        ]
    )
    if templates:
        content.append("- テンプレートの必須項目を満たしている")
        content.append(f"- 主要テンプレート: `templates/{templates[0]}`")
        if len(templates) > 1:
            content.append(f"- 参照テンプレート: `templates/{templates[1]}`")
    else:
        content.append("- 目的・前提・判断根拠・次のアクションが明記されている")
    content.extend(["", "### 参照書籍"])
    if books:
        content.extend([f"- {book}" for book in books])
    else:
        content.append("- 参照書籍はありません")
    content.extend(
        [
            "",
            "### 主要リソース",
            "- `SKILL.md`: スキルの目的・前提・判断基準の基礎",
            "",
            "### 主要テンプレート",
        ]
    )
    if templates:
        for tpl in templates[:2]:
            content.append(f"- `templates/{tpl}`: このレベルでは参照のみ")
    else:
        content.append("- テンプレートはありません")
    content.extend(
        [
            "",
            "## 実践手順",
            "",
            "1. SKILL.md の概要と目的を確認する",
            "2. 適用タイミングと成果物の期待値を言語化する",
            "3. 作業の冒頭で前提条件が満たされているか確認する",
            "",
            "## チェックリスト",
            "",
            "- [ ] スキルの適用タイミングを説明できる",
            "- [ ] 必要な知識と判断基準を整理できた",
        ]
    )
    if templates:
        content.append("- [ ] テンプレートの必須項目を把握している")
    else:
        content.append("- [ ] 成果物の最小要件を満たしている")
    return "\n".join(content) + "\n"


def build_level2(summary: str, resources: List[str], scripts: List[str], templates: List[str],
                 desc_map: Dict[str, str], topics_map: Dict[str, List[str]], best_do: List[str],
                 best_avoid: List[str], fallback_summary: str, topics: List[str]) -> str:
    overview = summary or fallback_summary
    content = [
        "# Level 2: Intermediate",
        "",
        "## 概要",
        "",
        overview,
        "",
        "resources/・scripts/・templates/ の活用を前提とした運用を整理します。",
        "",
        "## 前提条件",
        "",
        "- Level 1 の内容を理解している",
        "- SKILL.md の適用範囲を説明できる",
        "",
        "## 詳細ガイド",
        "",
        "### 必要な知識・情報",
    ]
    if topics:
        content.append("- 主要トピック: " + " / ".join(topics[:6]))
    else:
        content.append("- SKILL.md の内容を前提に運用する")
    if best_do:
        content.append("- 実務指針: " + " / ".join(best_do[:3]))
    content.extend(["", "### 判断基準と検証観点"])
    if best_avoid:
        for item in best_avoid[:3]:
            content.append(f"- 回避事項: {item}")
    else:
        content.append("- 検証に使う指標やチェック項目を明確にする")
    content.extend(["", "### リソース運用"])
    if resources:
        content.extend(format_entries([f"resources/{r}" for r in resources], desc_map, topics_map))
    else:
        content.append("- 追加リソースはありません")
    content.extend(["", "### スクリプト運用"])
    if scripts:
        content.extend(format_entries([f"scripts/{s}" for s in scripts], desc_map))
    else:
        content.append("- スクリプトはありません")
    content.extend(["", "### テンプレート運用"])
    if templates:
        content.extend(format_entries([f"templates/{t}" for t in templates], desc_map))
    else:
        content.append("- テンプレートはありません")
    content.extend(["", "### 成果物要件"])
    if templates:
        content.append("- テンプレートの構成・必須項目を反映する")
    else:
        content.append("- 判断根拠と次のアクションが明確な成果物を作る")
    content.extend(["", "## 実践手順", ""])
    steps: List[str] = []
    if resources:
        steps.append("利用するリソースを選定し、適用順を決める")
    else:
        steps.append("SKILL.md と Level1 を軸に手順を整理する")
    if scripts:
        steps.append("スクリプトは `--help` で引数を確認し、検証系から実行する")
    if templates:
        steps.append("テンプレートを使い成果物の形式を統一する")
    if "log_usage.mjs" in scripts:
        steps.append("`scripts/log_usage.mjs` で実行記録を残す")
    if not steps:
        steps.append("作業内容を簡潔にメモしておく")
    for i, step in enumerate(steps, 1):
        content.append(f"{i}. {step}")
    content.extend(
        [
            "",
            "## チェックリスト",
            "",
        ]
    )
    if resources:
        content.append("- [ ] リソースから必要な知識を抽出できた")
    else:
        content.append("- [ ] Level1 の指針のみで作業を完結できる")
    if scripts:
        content.append("- [ ] スクリプトの役割と実行順を把握している")
    else:
        content.append("- [ ] スクリプト不要であることを確認した")
    if templates:
        content.append("- [ ] テンプレートで成果物の形式を揃えた")
    else:
        content.append("- [ ] 成果物要件を満たしている")
    return "\n".join(content) + "\n"


def build_level3(summary: str, resources: List[str], scripts: List[str], templates: List[str],
                 desc_map: Dict[str, str], topics_map: Dict[str, List[str]], fallback_summary: str) -> str:
    overview = summary or fallback_summary
    content = [
        "# Level 3: Advanced",
        "",
        "## 概要",
        "",
        overview,
        "",
        "Progressive Disclosure 設計とトークン最適化の実践方法を整理します。",
        "",
        "## 前提条件",
        "",
        "- Level 2 の運用を完了している",
        "- リソース/スクリプト/テンプレートの位置を把握している",
        "",
        "## 詳細ガイド",
        "",
        "### Progressive Disclosure 設計",
        "- まず Level1/Level2 で要点だけを確認し、必要に応じて詳細リソースへ拡張する",
        "- 説明量が過剰な場合は要約を作り、必要な箇所のみを参照する",
        "",
        "### トークン最適化",
        "- 目的に直結しない情報は後回しにし、必須項目を優先して読み込む",
        "- 参照回数が多い資料は要点メモを作って再利用する",
        "",
        "### 高度知識の扱い",
    ]
    advanced_resources = [
        r for r in resources if any(key in r for key in ["pattern", "reference", "troubleshooting"])
    ]
    if advanced_resources:
        content.extend(format_entries([f"resources/{r}" for r in advanced_resources], desc_map, topics_map))
    else:
        content.append("- 専用の高度リソースはありません")
    content.extend(["", "### 判断基準"])
    if advanced_resources:
        content.append("- 詳細な判断が必要なときのみ高度リソースを読み込む")
    content.append("- 検証が必要な場合は参照系スクリプトを優先する")
    content.extend(["", "### スクリプト分類"])
    read_scripts, write_scripts, other_scripts = classify_scripts(scripts)
    if read_scripts:
        content.append("- 参照系: " + ", ".join(f"`scripts/{s}`" for s in read_scripts))
    if write_scripts:
        content.append("- 更新系: " + ", ".join(f"`scripts/{s}`" for s in write_scripts))
    if other_scripts:
        content.append("- その他: " + ", ".join(f"`scripts/{s}`" for s in other_scripts))
    if not scripts:
        content.append("- スクリプトはありません")
    if templates:
        content.append("- テンプレートは出力一貫性の維持に活用する")
    else:
        content.append("- テンプレートはありません")
    content.extend(["", "## 実践手順", ""])
    steps = [
        "必要最低限の情報に絞って参照範囲を決める",
        "不足が見えたら高度リソースを追加で読み込む",
    ]
    if scripts:
        steps.append("参照系スクリプトで検証し、必要なら更新系スクリプトを実行する")
    if templates:
        steps.append("テンプレートで表現の差異を最小化する")
    steps.append("情報量が多い場合は要約を作成して再利用する")
    for i, step in enumerate(steps, 1):
        content.append(f"{i}. {step}")
    content.extend(
        [
            "",
            "## チェックリスト",
            "",
            "- [ ] 参照範囲を段階的に広げる設計ができた",
        ]
    )
    if scripts:
        content.append("- [ ] スクリプトの種類に応じて実行順を調整した")
    else:
        content.append("- [ ] スクリプトが不要であることを確認した")
    if templates:
        content.append("- [ ] テンプレートで成果物の一貫性を保った")
    else:
        content.append("- [ ] 成果物要件を満たしている")
    content.append("- [ ] トークン消費を抑えるため要約や分割を行った")
    return "\n".join(content) + "\n"


def build_level4(summary: str, scripts: List[str], desc_map: Dict[str, str], fallback_summary: str) -> str:
    overview = summary or fallback_summary
    content = [
        "# Level 4: Expert",
        "",
        "## 概要",
        "",
        overview,
        "",
        "フィードバックループを回しながらスキルを改善する方法を整理します。",
        "",
        "## 前提条件",
        "",
        "- Level 3 の運用を完了している",
        "- スクリプトの実行とログ更新ができる",
        "",
        "## 詳細ガイド",
        "",
        "### フィードバックループ",
        "- `EVALS.json`: 評価観点の定義",
        "- `CHANGELOG.md`: 変更履歴の記録",
        "- `LOGS.md`: 運用ログの蓄積",
    ]
    if scripts:
        content.extend(format_entries([f"scripts/{s}" for s in scripts], desc_map))
    else:
        content.append("- スクリプトはありません")
    content.extend(
        [
            "",
            "### 改善に必要な知識",
            "- 評価結果とログを照合し、改善ポイントを特定する",
            "- 変更が必要な resources/・templates/・scripts/ を特定する",
            "",
            "### 評価と記録",
            "- 実行結果を LOGS.md に残し、評価観点を EVALS.json に反映する",
            "",
            "## 実践手順",
            "",
            "1. 運用ログを確認し、改善対象を洗い出す",
            "2. 必要な変更を resources/・templates/・scripts/ に反映する",
        ]
    )
    if scripts:
        content.append("3. スクリプトで検証し、変更内容を記録する")
        content.append("4. CHANGELOG.md に更新内容を記載し、EVALS.json を調整する")
    else:
        content.append("3. CHANGELOG.md に更新内容を記載し、EVALS.json を調整する")
    content.extend(
        [
            "",
            "## チェックリスト",
            "",
            "- [ ] フィードバックループの各要素が更新されている",
        ]
    )
    if scripts:
        content.append("- [ ] スクリプトで検証を実施した")
    else:
        content.append("- [ ] スクリプトが不要であることを確認した")
    content.append("- [ ] 変更内容を CHANGELOG.md に記録した")
    return "\n".join(content) + "\n"


def update_skill(skill_dir: Path) -> None:
    skill_path = skill_dir / "SKILL.md"
    if not skill_path.exists():
        return
    text = read_text(skill_path)
    frontmatter = extract_frontmatter(text)
    desc_text = extract_description(frontmatter)
    desc_map, books, use_line = parse_description_lists(desc_text)
    summary = extract_summary(text)
    skill_name = extract_name(frontmatter) or skill_dir.name
    fallback_summary = skill_fallback_summary(skill_name)
    best_do, best_avoid = extract_best_practices(text)
    best_do = filter_generic(best_do)
    best_avoid = filter_generic(best_avoid)

    resources_dir = skill_dir / "resources"
    scripts_dir = skill_dir / "scripts"
    templates_dir = skill_dir / "templates"

    resources = [f for f in list_files(resources_dir, ".md") if not f.startswith("Level")]
    resources = prioritize_resources(resources)
    scripts = list_files(scripts_dir, ".mjs")
    templates = list_files(templates_dir)

    topics_map: Dict[str, List[str]] = {}
    for res in resources:
        rel_path = f"resources/{res}"
        topics_map[rel_path] = extract_resource_topics(resources_dir / res)

    topic_keywords = collect_topic_keywords(resources, topics_map)

    level1 = build_level1(summary, use_line, books, best_do, best_avoid, templates, fallback_summary, topic_keywords)
    level2 = build_level2(
        summary, resources, scripts, templates, desc_map, topics_map, best_do, best_avoid, fallback_summary, topic_keywords
    )
    level3 = build_level3(summary, resources, scripts, templates, desc_map, topics_map, fallback_summary)
    level4 = build_level4(summary, scripts, desc_map, fallback_summary)

    resources_dir.mkdir(parents=True, exist_ok=True)
    write_text(resources_dir / "Level1_basics.md", level1)
    write_text(resources_dir / "Level2_intermediate.md", level2)
    write_text(resources_dir / "Level3_advanced.md", level3)
    write_text(resources_dir / "Level4_expert.md", level4)


def main() -> int:
    parser = argparse.ArgumentParser(description="Update skill level resources")
    parser.add_argument("--skill", help="Only update the specified skill")
    args = parser.parse_args()

    for name in sorted(os.listdir(SKILLS_ROOT)):
        if args.skill and name != args.skill:
            continue
        skill_dir = SKILLS_ROOT / name
        if skill_dir.is_dir():
            update_skill(skill_dir)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
