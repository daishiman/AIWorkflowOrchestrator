---
name: skill-creator
description: |
  スキルを作成・更新・プロンプト改善するためのメタスキル。
  3つのモード（create/update/improve-prompt）を提供し、
  Script Firstで100%再現可能な実行を実現する。

  Anchors:
  • Continuous Delivery (Jez Humble) / 適用: 自動化パイプライン / 目的: 決定論的実行
  • The Lean Startup (Eric Ries) / 適用: Build-Measure-Learn / 目的: 反復改善
  • Domain-Driven Design (Eric Evans) / 適用: ユビキタス言語 / 目的: 一貫した語彙

  Trigger:
  新規スキルの作成、既存スキルの更新、プロンプト改善を行う場合に使用。
  スキル作成, スキル更新, プロンプト改善, skill creation, skill update, improve prompt
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# Skill Creator

## 概要

スキルを作成・更新・プロンプト改善するためのメタスキル。
**Script First**の原則で決定論的処理を自動化し、**Progressive Disclosure**で必要なリソースのみを読み込む。

## 設計原則

| 原則 | 説明 |
|------|------|
| Script First | 決定論的処理はすべてスクリプトで実行（100%精度） |
| LLM for Judgment | LLMは判断・創造が必要な部分のみ担当 |
| Progressive Disclosure | 必要な時に必要なリソースのみ読み込み |
| Schema Driven | 入出力はJSONスキーマで検証 |
| Self-Improvement | 使用ログからスキル自身を改善 |

## モード一覧

| モード | 用途 | 開始コマンド |
|--------|------|--------------|
| create | 新規スキル作成 | `node scripts/detect_mode.mjs --request "新規スキル"` |
| update | 既存スキル更新 | `node scripts/detect_mode.mjs --request "更新" --skill-path <path>` |
| improve-prompt | プロンプト改善 | `node scripts/analyze_prompt.mjs --skill-path <path>` |
| generate-script | スクリプト生成 | 要求に応じてスクリプト生成 |

---

# Part 1: スキル作成ワークフロー

## create モードワークフロー

```
Phase 1: 分析（LLM Task）
┌─────────────────────────────────────────────────────────┐
│ analyze-request → extract-purpose → define-boundary     │
│ 📖 Read: agents/analyze-request.md (必要時)              │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 2: 設計（LLM Task + Script Validation）
┌─────────────────────────────────────────────────────────┐
│ select-anchors ─┐                                       │
│                 ├→ design-workflow → [validate-workflow]│
│ define-trigger ─┘                                       │
│ 📖 Read: agents/design-workflow.md (必要時)              │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 3: 構造計画（LLM Task + Script Validation）
┌─────────────────────────────────────────────────────────┐
│ plan-structure → [validate-plan]                        │
│ 📖 Read: agents/plan-structure.md, references/skill-structure.md │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 4: 生成（Script Task）
┌─────────────────────────────────────────────────────────┐
│ [init-skill] → [generate-skill-md] → [generate-agents]  │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 5: 検証（Script Task）
┌─────────────────────────────────────────────────────────┐
│ [validate-all] → [update-skill-list] → [log-usage]      │
└─────────────────────────────────────────────────────────┘

凡例: [script] = Script Task (100%精度), 無印 = LLM Task
```

---

# Part 2: スクリプト生成ワークフロー

## スクリプトタイプ（24種類）

スクリプトの目的に応じて最適なタイプを選択する。

### タイプ選択フローチャート
```
[ユーザー要求]
     │
     ▼
外部通信が必要? ──Yes──► API関連
│                         ├─ api-client（REST/GraphQL）
│                         ├─ webhook（受信/送信）
│                         ├─ scraper（Web取得）
│                         └─ notification（通知送信）
No
│
▼
データ処理? ──Yes──► データ処理関連
│                    ├─ parser（解析）
│                    ├─ transformer（変換）
│                    ├─ aggregator（集約）
│                    └─ file-processor（ファイル操作）
No
│
▼
永続化? ──Yes──► ストレージ関連
│                ├─ database（DB操作）
│                ├─ cache（キャッシュ）
│                └─ queue（キュー）
No
│
▼
開発支援? ──Yes──► 開発ツール関連
│                   ├─ git-ops（Git操作）
│                   ├─ test-runner（テスト）
│                   ├─ linter（Lint）
│                   ├─ formatter（フォーマット）
│                   └─ builder（ビルド）
No
│
▼
運用/デプロイ? ──Yes──► インフラ関連
│                        ├─ deployer（デプロイ）
│                        ├─ docker（コンテナ）
│                        ├─ cloud（クラウド）
│                        └─ monitor（監視）
No
│
▼
AI/ツール連携? ──Yes──► 統合関連
│                        ├─ ai-tool（AI API）
│                        ├─ mcp-bridge（MCP連携）
│                        └─ shell（シェル実行）
│
▼
└──► universal（汎用）
```

**詳細カタログ**: 📖 `references/script-types-catalog.md`（タイプ選択時に読み込み）

## スクリプト生成ワークフロー

```
Phase 1: 要件分析（LLM Task）
┌─────────────────────────────────────────────────────────┐
│ 📖 agents/analyze-script-requirement.md                 │
│                                                         │
│ Input: ユーザー要求                                      │
│ Output: script-requirement.json                         │
│   - type: スクリプトタイプ（24種類から選択）              │
│   - purpose: 目的                                        │
│   - inputs/outputs: 入出力仕様                          │
│   - dependencies: 依存関係                               │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 2: ランタイム判定（Script Task - 100%精度）
┌─────────────────────────────────────────────────────────┐
│ [detect_runtime.mjs]                                    │
│                                                         │
│ Input: script-requirement.json                          │
│ Output: runtime-config.json                             │
│   - runtime: node | python | bash | bun | deno          │
│   - confidence: 判定確信度                               │
│   - settings: ランタイム固有設定                         │
│                                                         │
│ 判定ロジック:                                            │
│   1. type → 推奨ランタイム                               │
│   2. キーワード → ランタイム（pandas→python等）          │
│   3. 依存関係 → ランタイム（pip→python, npm→node）      │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 3: 設計（LLM Task）
┌─────────────────────────────────────────────────────────┐
│ 📖 agents/design-script.md                              │
│ 📖 assets/type-{type}.md（タイプ固有指示）               │
│ 📖 references/runtime-guide.md（ランタイム別ベストプラクティス）│
│                                                         │
│ Input: requirement + runtime-config                      │
│ Output: script-design.json                              │
│   - structure: コード構造                                │
│   - functions: 関数一覧                                  │
│   - errorHandling: エラー処理方針                        │
│   - variables: テンプレート変数定義                      │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 4: 変数設計（LLM Task）
┌─────────────────────────────────────────────────────────┐
│ 📖 agents/design-variables.md                           │
│ 📖 references/variable-template-guide.md                │
│                                                         │
│ Input: script-design.json                               │
│ Output: variables.json                                  │
│   - 変数定義（名前、型、デフォルト値、変換フィルター）   │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 5: コード生成（LLM Task）
┌─────────────────────────────────────────────────────────┐
│ 📖 agents/generate-code.md                              │
│ 📖 assets/base-{runtime}.{ext}（ベーステンプレート）     │
│                                                         │
│ Input: design + variables                               │
│ Output: script-template.{ext}                           │
│   - {{変数}} プレースホルダーを含むコード                │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 6: コード展開（Script Task - 100%精度）
┌─────────────────────────────────────────────────────────┐
│ [generate_dynamic_code.mjs]                             │
│                                                         │
│ Input: script-template + variables.json                 │
│ Output: 実行可能なスクリプト                             │
│                                                         │
│ テンプレート構文:                                        │
│   - {{var}}: 基本置換                                   │
│   - {{var:default}}: デフォルト値                       │
│   - {{var | filter}}: 変換（uppercase, camelCase等）    │
│   - {{#if cond}}...{{/if}}: 条件分岐                    │
│   - {{#each arr}}...{{/each}}: 繰り返し                 │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 7: 検証（Script Task）
┌─────────────────────────────────────────────────────────┐
│ [validate-syntax] → [validate-schema] → [log-usage]     │
└─────────────────────────────────────────────────────────┘
```

---

# Part 3: 自己改善ワークフロー

## Self-Improvement Cycle

```
                    ┌─────────────────┐
                    │  スキル使用     │
                    └────────┬────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│ [log_usage.mjs] - Script Task (100%精度)               │
│                                                        │
│ 実行結果をLOGS.mdに記録:                                │
│   - タイムスタンプ                                      │
│   - 成功/失敗                                           │
│   - フェーズ                                            │
│   - 所要時間                                            │
│   - エラー内容                                          │
└────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│ [collect_feedback.mjs] - Script Task (100%精度)        │
│                                                        │
│ LOGS.mdからデータ収集・集計:                            │
│   - 使用回数、成功率                                    │
│   - エラーパターン分析                                  │
│   - 遅いフェーズ特定                                    │
└────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│ 📖 agents/analyze-feedback.md - LLM Task               │
│                                                        │
│ 収集データを分析し改善機会を特定:                       │
│   - 頻出エラーの根本原因                                │
│   - パフォーマンスボトルネック                          │
│   - ユーザビリティ改善点                                │
└────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│ 📖 agents/design-self-improvement.md - LLM Task        │
│                                                        │
│ 改善計画を設計:                                         │
│   - 変更対象（ファイル、行、内容）                      │
│   - 変更種別（add/modify/delete）                       │
│   - リスクレベル（low/medium/high）                     │
│   - 実行順序                                            │
└────────────────────────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│ [apply_self_improvement.mjs] - Script Task (100%精度)  │
│                                                        │
│ 改善計画を適用:                                         │
│   --dry-run: 実行せず内容確認                          │
│   --auto-only: 自動適用可能なもののみ                   │
│   --backup: 変更前にバックアップ                        │
│   --all: 全変更適用（レビュー済み前提）                 │
└────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  改善完了       │
                    └─────────────────┘
```

**詳細仕様**: 📖 `references/self-improvement-cycle.md`（改善実行時に読み込み）

---

# Part 4: Progressive Disclosure リソースマップ

## 読み込みタイミング

リソースは**必要な時のみ**読み込む。全てを一度に読み込まない。

### agents/ （LLM Task仕様）

| Agent | 読み込み条件 | 責務 |
|-------|-------------|------|
| [analyze-request.md](agents/analyze-request.md) | createモード開始時 | 要求分析・モード判定 |
| [extract-purpose.md](agents/extract-purpose.md) | 要求分析後 | 目的抽出・スキル名決定 |
| [define-boundary.md](agents/define-boundary.md) | 目的定義後 | 機能境界定義 |
| [define-trigger.md](agents/define-trigger.md) | 目的定義後 | 発動条件定義 |
| [select-anchors.md](agents/select-anchors.md) | 目的定義後 | 知識圧縮アンカー選定 |
| [design-workflow.md](agents/design-workflow.md) | ワークフロー設計時 | 実行フロー設計 |
| [plan-structure.md](agents/plan-structure.md) | 構造計画時 | ファイル構造計画 |
| [design-update.md](agents/design-update.md) | updateモード時 | 更新計画設計 |
| [improve-prompt.md](agents/improve-prompt.md) | improve-promptモード時 | プロンプト最適化 |
| [analyze-script-requirement.md](agents/analyze-script-requirement.md) | スクリプト生成要求時 | スクリプト要件抽出 |
| [design-script.md](agents/design-script.md) | スクリプト設計時 | スクリプト構造設計 |
| [generate-code.md](agents/generate-code.md) | コード生成時 | 実行可能コード生成 |
| [design-variables.md](agents/design-variables.md) | 変数設計時 | テンプレート変数設計 |
| [analyze-feedback.md](agents/analyze-feedback.md) | フィードバック分析時 | 改善機会特定 |
| [design-self-improvement.md](agents/design-self-improvement.md) | 改善計画時 | 改善計画設計 |

### schemas/ （入出力スキーマ）

| Schema | 読み込み条件 | 用途 |
|--------|-------------|------|
| [script-definition.json](schemas/script-definition.json) | スクリプト生成時 | スクリプト定義検証 |
| [runtime-config.json](schemas/runtime-config.json) | ランタイム判定時 | ランタイム設定検証 |
| [script-type.json](schemas/script-type.json) | タイプ選択時 | タイプ固有設定検証 |
| [variable-definition.json](schemas/variable-definition.json) | 変数設計時 | 変数定義検証 |
| [dependency-spec.json](schemas/dependency-spec.json) | 依存関係定義時 | 依存関係検証 |
| [environment-spec.json](schemas/environment-spec.json) | 環境変数定義時 | 環境変数検証 |
| [execution-result.json](schemas/execution-result.json) | 実行完了時 | 実行結果検証 |
| [feedback-record.json](schemas/feedback-record.json) | フィードバック記録時 | フィードバック検証 |

### references/ （詳細知識）

| Reference | 読み込み条件 | 内容 |
|-----------|-------------|------|
| [script-types-catalog.md](references/script-types-catalog.md) | タイプ選択時 | 24タイプの詳細カタログ |
| [runtime-guide.md](references/runtime-guide.md) | ランタイム設定時 | ランタイム別ベストプラクティス |
| [api-integration-patterns.md](references/api-integration-patterns.md) | API系スクリプト時 | API統合パターン |
| [variable-template-guide.md](references/variable-template-guide.md) | 変数設計時 | テンプレート構文ガイド |
| [self-improvement-cycle.md](references/self-improvement-cycle.md) | 自己改善時 | 改善サイクル詳細 |
| [execution-patterns.md](references/execution-patterns.md) | ワークフロー設計時 | 実行パターン |
| [overview.md](references/overview.md) | 初回のみ | 概要 |
| [core-principles.md](references/core-principles.md) | 設計時 | コア原則 |
| [skill-structure.md](references/skill-structure.md) | 構造計画時 | 構造仕様 |

### assets/ （テンプレート）

#### ベーステンプレート

| Asset | 読み込み条件 | 用途 |
|-------|-------------|------|
| [base-node.mjs](assets/base-node.mjs) | runtime=node時 | Node.jsベーステンプレート |
| [base-python.py](assets/base-python.py) | runtime=python時 | Pythonベーステンプレート |
| [base-bash.sh](assets/base-bash.sh) | runtime=bash時 | Bashベーステンプレート |
| [base-typescript.ts](assets/base-typescript.ts) | runtime=bun/deno時 | TypeScriptベーステンプレート |

#### タイプ別テンプレート（24タイプ対応）

| Asset | 読み込み条件 | 用途 |
|-------|-------------|------|
| [type-api-client.md](assets/type-api-client.md) | type=api-client時 | REST/GraphQL API呼び出し |
| [type-webhook.md](assets/type-webhook.md) | type=webhook時 | Webhook受信・送信 |
| [type-scraper.md](assets/type-scraper.md) | type=scraper時 | Webスクレイピング |
| [type-parser.md](assets/type-parser.md) | type=parser時 | データフォーマット変換 |
| [type-transformer.md](assets/type-transformer.md) | type=transformer時 | スキーマ変換・マッピング |
| [type-aggregator.md](assets/type-aggregator.md) | type=aggregator時 | データ集約・統計処理 |
| [type-file-processor.md](assets/type-file-processor.md) | type=file-processor時 | ファイル操作・圧縮 |
| [type-database.md](assets/type-database.md) | type=database時 | DB操作・マイグレーション |
| [type-cache.md](assets/type-cache.md) | type=cache時 | キャッシュ操作（Redis等） |
| [type-queue.md](assets/type-queue.md) | type=queue時 | メッセージキュー操作 |
| [type-git-ops.md](assets/type-git-ops.md) | type=git-ops時 | Git操作・GitHub連携 |
| [type-test-runner.md](assets/type-test-runner.md) | type=test-runner時 | テスト実行・結果解析 |
| [type-linter.md](assets/type-linter.md) | type=linter時 | リンター実行・修正 |
| [type-formatter.md](assets/type-formatter.md) | type=formatter時 | コードフォーマット |
| [type-builder.md](assets/type-builder.md) | type=builder時 | ビルドツール連携 |
| [type-deployer.md](assets/type-deployer.md) | type=deployer時 | デプロイ操作 |
| [type-docker.md](assets/type-docker.md) | type=docker時 | Docker操作 |
| [type-cloud.md](assets/type-cloud.md) | type=cloud時 | クラウドCLI操作 |
| [type-monitor.md](assets/type-monitor.md) | type=monitor時 | ヘルスチェック・監視 |
| [type-ai-tool.md](assets/type-ai-tool.md) | type=ai-tool時 | 外部AI連携 |
| [type-mcp-bridge.md](assets/type-mcp-bridge.md) | type=mcp-bridge時 | MCPサーバー連携 |
| [type-notification.md](assets/type-notification.md) | type=notification時 | 通知送信 |
| [type-shell.md](assets/type-shell.md) | type=shell時 | 汎用シェルスクリプト |
| [type-universal.md](assets/type-universal.md) | type=universal時 | 動的コード生成（任意目的） |

### scripts/ （決定論的処理 - 100%精度）

| Script | 用途 | 実行タイミング |
|--------|------|---------------|
| `detect_mode.mjs` | モード判定 | 開始時 |
| `detect_runtime.mjs` | ランタイム判定 | スクリプト生成時 |
| `generate_dynamic_code.mjs` | テンプレート展開 | コード生成時 |
| `collect_feedback.mjs` | フィードバック収集 | 改善分析前 |
| `apply_self_improvement.mjs` | 改善適用 | 改善計画後 |
| `init_skill.mjs` | ディレクトリ初期化 | create時 |
| `generate_skill_md.mjs` | SKILL.md生成 | create時 |
| `validate_all.mjs` | 全体検証 | 完了時 |
| `validate_schema.mjs` | スキーマ検証 | 各Phase完了時 |
| `log_usage.mjs` | 使用記録 | 実行完了時 |

---

# Part 5: 実行コマンドリファレンス

## スクリプト生成

```bash
# Phase 2: ランタイム判定（Script - 100%精度）
node scripts/detect_runtime.mjs \
  --requirement .tmp/script-requirement.json \
  --output .tmp/runtime-config.json \
  --verbose

# Phase 6: コード展開（Script - 100%精度）
node scripts/generate_dynamic_code.mjs \
  --template .tmp/script-template.mjs \
  --variables .tmp/variables.json \
  --output scripts/my-script.mjs \
  --strict
```

## 自己改善

```bash
# Step 1: フィードバック収集（Script - 100%精度）
node scripts/collect_feedback.mjs \
  --skill-path .claude/skills/my-skill \
  --output .tmp/feedback.json \
  --verbose

# Step 3: 改善適用（Script - 100%精度）
# dry-runで確認
node scripts/apply_self_improvement.mjs \
  --plan .tmp/improvement-plan.json \
  --dry-run

# 低リスクのみ適用
node scripts/apply_self_improvement.mjs \
  --plan .tmp/improvement-plan.json \
  --backup

# 全適用（レビュー済み前提）
node scripts/apply_self_improvement.mjs \
  --plan .tmp/improvement-plan.json \
  --all --backup
```

---

## ベストプラクティス

### すべきこと

| 推奨事項 | 理由 |
|----------|------|
| Script優先（決定論的処理） | 100%精度を保証 |
| LLMは判断・創造のみ | スクリプトで代替不可能な部分 |
| Progressive Disclosure | コンテキスト効率化 |
| 中間出力は.tmp/に保存 | デバッグ・再実行を容易に |
| --dry-runで事前確認 | 意図しない変更を防止 |
| --backupで安全性確保 | ロールバックを可能に |

### 避けるべきこと

| 禁止事項 | 問題点 |
|----------|--------|
| 全リソースを一度に読み込む | コンテキスト浪費 |
| Script可能な処理をLLMに任せる | 精度・再現性が低下 |
| 具体例をテンプレートに書く | AIが例に引っ張られる |
| 中間ファイルを省略 | 検証・再実行が不可能 |

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 4.0.0 | 2026-01-13 | スクリプト生成ワークフロー追加（24タイプ対応）、自己改善サイクル追加、Progressive Disclosure完全対応 |
| 3.0.0 | 2026-01-06 | 3モード対応（create/update/improve-prompt）、新規スクリプト追加 |
| 2.0.0 | 2026-01-06 | Script/LLM Task分離、スキーマ検証導入、細粒度タスク分解 |
| 1.3.0 | 2026-01-02 | agents/を責務ベースに再構成・references/を責務分離 |
| 1.0.0 | 2025-12-31 | 18-skills.md完全準拠版として新規作成 |
