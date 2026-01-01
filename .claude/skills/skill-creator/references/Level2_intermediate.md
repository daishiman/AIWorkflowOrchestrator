# Level 2: Intermediate

## 概要

18-skills.md仕様に完全準拠したスキルを作成・更新するためのメタスキル。
「スキルを作るためのスキル」として、仕様の全セクション（§1-11）を反映したワークフロー、Task仕様書、検証スクリプト、テンプレートを提供する。

resources/・scripts/・templates/ は目的に応じて必要な分だけ作成する前提で運用を整理します。

## 前提条件

- Level 1 の内容を理解している
- SKILL.md の適用範囲を説明できる
- 18-skills.md 仕様の各セクション（§1-11）の役割を把握している

## 詳細ガイド

### 必要な知識・情報

- 主要トピック: Skill構造仕様、ワークフローパターン、出力パターン、命名規則
- 実務指針: 新規スキル作成時、既存スキル更新時、スキル構造検証時
- Task仕様書: `agents/analyze-requirements.md`, `agents/design-structure.md`, `agents/implement-skill.md`, `agents/validate-and-iterate.md`

### 判断基準と検証観点

- 回避事項: descriptionでMarkdown記法を使用しない、README.md等の補助ドキュメントを作成しない、絶対パスや../を含む相対パスを使用しない

### リソース運用

- `references/spec-overview.md`: 18-skills.md §1-2の要約（把握する知識: Skillとは、責務境界、コア原則）
- `references/skill-structure.md`: 18-skills.md §3の詳細（把握する知識: 標準フォルダ構造、SKILL.md仕様、agents/仕様、scripts/仕様、references/仕様、assets/仕様）
- `references/workflow-patterns.md`: 18-skills.md §4の詳細（把握する知識: シーケンシャルワークフロー、条件分岐ワークフロー）
- `references/output-patterns.md`: 18-skills.md §5の詳細（把握する知識: テンプレートパターン、例示パターン）
- `references/creation-update-process.md`: 18-skills.md §6の詳細（把握する知識: 新規作成フロー、更新フロー、各ステップの詳細）
- `references/feedback-loop.md`: 18-skills.md §7の詳細（把握する知識: フィードバックループの目的、実装方式、log_usage.mjs）
- `references/quality-standards.md`: 18-skills.md §8の詳細（把握する知識: チェックリスト、ベストプラクティス）
- `references/naming-conventions.md`: 18-skills.md §9-10の詳細（把握する知識: スキル名規則、ファイル名規則、相対パス記述規則）

### スクリプト運用

- `scripts/init_skill.mjs`: スキルディレクトリ初期化（引数: <skill-name> --path .claude/skills --resources agents,references）
- `scripts/quick_validate.mjs`: 構造検証（引数: .claude/skills/<skill-name>）
- `scripts/log_usage.mjs`: フィードバック記録（引数: --result success|failure --phase "Phase N" --agent "agent-name"）

### テンプレート運用

- `assets/skill-template.md`: SKILL.md テンプレート（frontmatter + 本文構造）
- `assets/agent-task-template.md`: agents/\*.md テンプレート（Task仕様書フォーマット）
- `assets/script-task-template.mjs`: タスク実行スクリプト雛形
- `assets/script-validator-template.mjs`: 制約検証スクリプト雛形

### 成果物要件

- SKILL.md は 500行以内、詳細は references/ に外部化
- agents/\*.md はTask仕様書テンプレに準拠
- scripts/ は冪等性・エラー出力・引数検証を実装
- 相対パスでリソースを参照

## 実践手順

1. 構造設計書で必要リソースを選定
2. `scripts/init_skill.mjs` を `--resources` 付きで実行
3. `references/` から必要な知識を選定して参照（必要時のみ）
4. `agents/` にTask仕様書を作成（必要時のみ）
5. `scripts/` に決定論的処理を実装（必要時のみ）
6. `assets/` にテンプレートを配置（必要時のみ）
7. `scripts/quick_validate.mjs` で構造を検証
8. `scripts/log_usage.mjs` で実行記録を残す

## チェックリスト

- [ ] リソースから必要な知識を抽出できた
- [ ] スクリプトの役割と実行順を把握している
- [ ] テンプレートで成果物の形式を揃えた
- [ ] Task仕様書が標準フォーマットに準拠している
- [ ] 相対パスで正しくリソースを参照している
