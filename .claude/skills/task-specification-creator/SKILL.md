---
name: task-specification-creator
description: |
  ユーザーから与えられたタスクを単一責務の原則に基づいて分解し、
  Phase 1からPhase 13までの実行可能なタスク仕様書ドキュメントを生成する。

  Anchors:
  • Clean Code (Robert C. Martin) / 適用: 単一責務の原則 / 目的: タスク分解の基準
  • Continuous Delivery (Jez Humble) / 適用: フェーズゲート / 目的: 品質パイプライン構築
  • Domain-Driven Design (Eric Evans) / 適用: ユビキタス言語 / 目的: 一貫した用語設計

  Trigger:
  タスク仕様書作成, タスク分解, ワークフロー設計, 実行計画作成
  Use when creating task specifications for complex development tasks.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# Task Specification Creator

## 概要

ユーザーからの開発タスクを分解し、Phase 1〜Phase 13の実行可能なタスク仕様書を生成するスキル。

## 設計原則

| 原則 | 説明 |
|------|------|
| Script First | 決定論的処理はすべてスクリプトで実行（100%精度） |
| LLM for Judgment | LLMは判断・創造が必要な部分のみ担当 |
| Progressive Disclosure | 必要な時に必要なリソースのみ読み込み |
| Schema Driven | 入出力はJSONスキーマで検証 |
| Self-Improvement | 使用ログからスキル自身を改善 |

## モード一覧

| モード | 用途 | 開始条件 |
|--------|------|----------|
| create | 新規タスク仕様書作成 | ユーザーから新規タスク依頼 |
| execute | Phase実行 | タスク仕様書に基づくPhase実行 |
| update | 仕様書更新 | 既存仕様書の修正・更新 |
| detect-unassigned | 未タスク検出 | Phase 12での残課題検出 |

---

# Part 1: タスク仕様書作成ワークフロー

## create モードワークフロー

```
Phase 1: 分析（LLM Task）
┌─────────────────────────────────────────────────────────┐
│ decompose-task → identify-scope → design-phases         │
│ 📖 Read: agents/decompose-task.md (必要時)               │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 2: 生成（LLM Task + Script Validation）
┌─────────────────────────────────────────────────────────┐
│ generate-task-specs → [validate-spec-schema]            │
│ 📖 Read: agents/generate-task-specs.md (必要時)          │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 3: 出力（Script Task - 100%精度）
┌─────────────────────────────────────────────────────────┐
│ [init-workflow] → [generate-phase-files] → [init-artifacts] │
│ ┌─────────────────────────────────────────┐              │
│ │ output-phase-files   ← 並列実行          │              │
│ │ update-dependencies ←                  │              │
│ └─────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 4: 検証（Script Task - 100%精度）
┌─────────────────────────────────────────────────────────┐
│ [validate-phase-output] → [log-usage]                   │
└─────────────────────────────────────────────────────────┘

凡例: [script] = Script Task (100%精度), 無印 = LLM Task
```

---

# Part 2: Phase実行ワークフロー

## Phase構成（標準フレームワーク）

| Phase | 名称 | 目的 | カテゴリ |
|-------|------|------|----------|
| 1 | 要件定義 | 目的・スコープ・受け入れ基準定義 | 要件 |
| 2 | 設計 | アーキテクチャ・詳細設計 | 設計 |
| 3 | 設計レビューゲート | 要件・設計の妥当性検証 | ゲート |
| 4 | テスト作成 | TDD: Red（失敗するテスト作成） | TDD-Red |
| 5 | 実装 | TDD: Green（テストを通す実装） | TDD-Green |
| 6 | テスト拡充 | カバレッジ目標達成に向けた追加テスト | 品質 |
| 7 | テストカバレッジ確認 | カバレッジ目標検証・統合テスト実行 | 品質 |
| 8 | リファクタリング | TDD: Refactor（品質改善） | TDD-Refactor |
| 9 | 品質保証 | 静的解析・セキュリティ・性能 | 品質 |
| 10 | 最終レビューゲート | 全体品質・整合性検証 | ゲート |
| 11 | 手動テスト検証 | UX・実環境動作確認 | 検証 |
| 12 | ドキュメント更新 | ドキュメント更新・仕様反映・未タスク検出 | 文書化 |
| 13 | PR作成 | `/ai:diff-to-pr` でコミット・PR・CI確認 | 完了 |

## Phase実行フロー

```
Phase N 開始
    ↓
📖 Read: phase-N-*.md（仕様書読み込み）
    ↓
[validate-prerequisites] ← Script Task
    ↓
LLM Task: 仕様書に基づくタスク実行
    ↓
成果物生成
    ↓
[complete-phase] ← Script Task (100%精度)
    ├── artifacts.json 更新
    └── 依存Phase 参照資料 更新
    ↓
[validate-phase-output] ← Script Task
    ↓
Phase N+1 へ
```

---

# Part 3: テストカバレッジ基準

## ユニットテストカバレッジ

| 指標 | 最低基準 | 推奨基準 |
|------|----------|----------|
| Line Coverage | 80% | 90% |
| Branch Coverage | 60% | 70% |
| Function Coverage | 80% | 90% |

## 結合テストカバレッジ

| 指標 | 目標 |
|------|------|
| APIエンドポイント | 100% |
| モジュール間インターフェース | 100% |
| 正常系シナリオ | 100% |
| 異常系シナリオ | 80%+ |
| 外部連携ポイント | 100% |

## 統合テストシナリオカテゴリ

| カテゴリ | 検証内容 |
|----------|----------|
| API接続テスト | エンドポイント疎通・レスポンス形式 |
| データフローテスト | フロント→API→DB→API→フロントの往復 |
| エラーハンドリング | API障害時のフロントエンド表示・リトライ |
| 認証連携テスト | トークン取得・リフレッシュ・期限切れ処理 |
| 状態同期テスト | リアルタイム更新・楽観的UI更新・ロールバック |

---

# Part 4: Progressive Disclosure リソースマップ

## 読み込みタイミング

リソースは**必要な時のみ**読み込む。全てを一度に読み込まない。

### agents/ （LLM Task仕様）

| Agent | 読み込み条件 | 責務 |
|-------|-------------|------|
| [decompose-task.md](agents/decompose-task.md) | createモード開始時 | タスク分解・責務抽出 |
| [identify-scope.md](agents/identify-scope.md) | 分解後 | スコープ・前提・制約定義 |
| [design-phases.md](agents/design-phases.md) | スコープ定義後 | Phase構成設計 |
| [generate-task-specs.md](agents/generate-task-specs.md) | Phase設計後 | タスク仕様書生成 |
| [output-phase-files.md](agents/output-phase-files.md) | 仕様書生成後 | ファイル出力 |
| [update-dependencies.md](agents/update-dependencies.md) | 仕様書生成後 | 依存関係設定 |
| [generate-unassigned-task.md](agents/generate-unassigned-task.md) | Phase 12で未タスク検出時 | 未タスク指示書生成 |

### schemas/ （入出力スキーマ）

| Schema | 読み込み条件 | 用途 |
|--------|-------------|------|
| [task-definition.json](schemas/task-definition.json) | タスク分解時 | タスク定義検証 |
| [phase-spec.json](schemas/phase-spec.json) | Phase仕様書生成時 | Phase仕様書検証 |
| [artifact-definition.json](schemas/artifact-definition.json) | 成果物登録時 | 成果物定義検証 |
| [unassigned-task.json](schemas/unassigned-task.json) | 未タスク生成時 | 未タスク指示書検証 |

### references/ （詳細知識）

| Reference | 読み込み条件 | 内容 |
|-----------|-------------|------|
| [phase-templates.md](references/phase-templates.md) | Phase仕様書生成時 | Phase別テンプレート集 |
| [quality-standards.md](references/quality-standards.md) | 品質チェック時 | 品質基準詳細 |
| [artifact-naming-conventions.md](references/artifact-naming-conventions.md) | ファイル出力時 | 命名規則・配置先 |
| [review-gate-criteria.md](references/review-gate-criteria.md) | Phase 3/10実行時 | レビュー判定基準 |
| [unassigned-task-guidelines.md](references/unassigned-task-guidelines.md) | 未タスク検出時 | 未タスクガイドライン |
| [spec-update-workflow.md](references/spec-update-workflow.md) | Phase 12実行時 | 仕様更新フロー |
| [technical-documentation-guide.md](references/technical-documentation-guide.md) | Phase 12実行時 | 技術ドキュメント作成 |

### assets/ （テンプレート）

| Asset | 読み込み条件 | 用途 |
|-------|-------------|------|
| [phase-spec-template.md](assets/phase-spec-template.md) | Phase仕様書生成時 | Phase仕様書テンプレート |
| [common-header-template.md](assets/common-header-template.md) | ファイル生成時 | 共通ヘッダー |
| [common-footer-template.md](assets/common-footer-template.md) | ファイル生成時 | 共通フッター |
| [integration-test-template.md](assets/integration-test-template.md) | Phase 4/6実行時 | 統合テストテンプレート |
| [unassigned-task-template.md](assets/unassigned-task-template.md) | 未タスク生成時 | 未タスク指示書テンプレート |
| [main-task-template.md](assets/main-task-template.md) | タスク仕様書生成時 | メインタスクテンプレート |
| [implementation-guide-template.md](assets/implementation-guide-template.md) | Phase 12実行時 | 実装ガイドテンプレート |

### scripts/ （決定論的処理 - 100%精度）

| Script | 用途 | 実行タイミング |
|--------|------|---------------|
| `validate-phase-output.mjs` | Phase出力ファイル検証 | 各Phase完了時 |
| `complete-phase.mjs` | Phase完了・成果物登録・依存更新 | 各Phase完了時 |
| `init-workflow.mjs` | ワークフローディレクトリ初期化 | create時 |
| `detect-unassigned-tasks.mjs` | TODO/FIXME検出 | Phase 12実行時 |
| `log-usage.mjs` | 使用ログ記録 | 全モード完了時 |
| `collect-feedback.mjs` | フィードバック収集 | 改善分析前 |

---

# Part 5: 実行コマンドリファレンス

## Phase出力検証

```bash
# Phase出力の検証（Script Task - 100%精度）
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs \
  docs/30-workflows/{{FEATURE_NAME}} \
  --phase {{PHASE_NUMBER}}
```

## Phase完了処理

```bash
# Phase完了・成果物登録（Script Task - 100%精度）
node .claude/skills/task-specification-creator/scripts/complete-phase.mjs \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --phase {{PHASE_NUMBER}} \
  --artifacts "outputs/phase-{{PHASE_NUMBER}}/{{FILE}}.md:{{DESCRIPTION}}"
```

## 未タスク検出

```bash
# コードベースからTODO/FIXME検出（Script Task - 100%精度）
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.mjs \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --sources "packages/,apps/"
```

---

# Part 6: システム仕様参照（aiworkflow-requirements連携）

## Phase別参照要件

| Phase | 参照目的 | 必須 |
|-------|----------|------|
| 1 | 既存要件・インターフェース仕様との整合確認 | ✅ |
| 2 | アーキテクチャ・API・データベース仕様参照 | ✅ |
| 3 | 設計レビュー時の仕様準拠チェック | ✅ |
| 4 | テスト設計時の仕様参照 | ✅ |
| 5 | 実装時の仕様準拠確認 | ✅ |
| 6 | テスト拡充時の仕様準拠確認 | ✅ |
| 7 | テストカバレッジ確認時の仕様参照 | ✅ |
| 8 | リファクタリング時の仕様準拠確認 | ✅ |
| 12 | 仕様変更時のドキュメント更新 | ✅ |

## 仕様書への記載形式

各Phaseドキュメントの「参照資料」セクションに以下を**必ず**含める:

```markdown
### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス | 内容 |
| -------- | ---- | ---- |
| {{SPEC_NAME}} | `.claude/skills/aiworkflow-requirements/references/{{SPEC_FILE}}.md` | {{SPEC_DESCRIPTION}} |
```

---

# Part 7: 重要ルール

## Phase完了時の必須アクション

**各Phase完了時に以下を必ず実行すること:**

1. **タスク完全実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.mjs` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

## PR作成に関する重要な注意

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項 | 理由 |
|----------|------|
| 勝手にPRを作成する | レビュー前の変更がリモートに反映されてしまう |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする | 動作確認されていないコードがPRに含まれる |

## ローカル確認チェックリスト（PR作成前に必須）

| # | 確認項目 | コマンド例 |
|---|----------|------------|
| 1 | ビルドが成功する | `pnpm build` |
| 2 | 全テストがパスする | `pnpm test` |
| 3 | 型チェックがパスする | `pnpm typecheck` |
| 4 | Lintエラーがない | `pnpm lint` |
| 5 | 実際の動作確認（該当する場合） | `pnpm dev` で手動確認 |

---

# Part 8: ベストプラクティス

## すべきこと

| 推奨事項 | 理由 |
|----------|------|
| Script優先（決定論的処理） | 100%精度を保証 |
| LLMは判断・創造のみ | スクリプトで代替不可能な部分 |
| Progressive Disclosure | コンテキスト効率化 |
| 各Phaseを独立したMarkdownファイルとして出力 | 管理・追跡の容易さ |
| 各Phase完了時に `artifacts.json` を必ず更新 | ワークフロー追跡の基盤 |
| 100人中100人が同じ理解で実行できる粒度で記述 | 実行可能性の保証 |
| TodoWriteでサブタスクを管理 | 進捗の可視化 |

## 避けるべきこと

| 禁止事項 | 問題点 |
|----------|--------|
| 全リソースを一度に読み込む | コンテキスト浪費 |
| Script可能な処理をLLMに任せる | 精度・再現性が低下 |
| `artifacts.json` の更新を忘れる | ワークフロー追跡が破綻 |
| 1つのファイルに全Phaseを詰め込む | 管理・追跡が困難 |
| コード成果物を `outputs/` 配下に配置する | 実装と成果物の混同 |
| 曖昧な表現で記述する | 実行可能性が低下 |

---

# Part 9: Task仕様ナビ

| Task | 責務 | 実行パターン | 入力 | 出力 |
|------|------|--------------|------|------|
| decompose-task | タスクを単一責務に分解 | seq | ユーザー要求 | タスク分解リスト |
| identify-scope | スコープ・前提・制約を定義 | seq | タスク分解リスト | スコープ定義 |
| design-phases | Phase構成を設計 | seq | スコープ定義 | フェーズ設計書 |
| generate-task-specs | タスク仕様書を生成 | seq | フェーズ設計書 | タスク仕様書一覧 |
| output-phase-files | 個別Markdownファイルを出力 | **par** | タスク仕様書一覧 | phase-\*.md |
| update-dependencies | Phase間の依存関係を設定 | **par** | タスク仕様書一覧 | 依存関係マップ |
| generate-unassigned-task | 未完了タスク指示書を生成 | cond | レビュー課題 | unassigned-task/\*.md |

**実行パターン凡例**:
- `seq`: シーケンシャル（前のTaskに依存）
- `par`: 並列実行（他と独立）
- `cond`: 条件分岐の起点

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| 6.1.0 | 2026-01-14 | タスク完了ワークフロー追加: unassigned-task→completed-tasks移動・ステータス更新の手順をunassigned-task-guidelines.mdに追加 |
| 6.0.0 | 2026-01-13 | skill-creator最新仕様準拠リファクタリング: Script First原則明確化、Progressive Disclosure完全対応、schemas/追加、Self-Improvement基盤追加 |
| 5.1.0 | 2026-01-13 | Phase 12-2システムドキュメント更新を強化 |
| 5.0.0 | 2026-01-10 | スキル選定機能削除、シンプル化 |
| 4.0.0 | 2026-01-06 | Git Worktree削除、結合テストカバレッジ基準追加 |
| 3.1.0 | 2026-01-07 | Phase 6追加（テスト拡充）、統合テスト連携必須化 |
| 3.0.0 | 2026-01-06 | Phase再構成（1-13）、/ai:diff-to-pr統合 |
