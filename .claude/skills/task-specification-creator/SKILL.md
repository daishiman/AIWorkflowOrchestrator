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
| Script First | 決定論的処理はスクリプトで実行（100%精度） |
| LLM for Judgment | LLMは判断・創造が必要な部分のみ担当 |
| Progressive Disclosure | 必要な時に必要なリソースのみ読み込み |
| Schema Driven | 入出力はJSONスキーマで検証 |
| Self-Improvement | 使用ログからスキル自身を改善 |

## モード一覧

| モード | 用途 | 開始条件 |
|--------|------|----------|
| **create** | 新規タスク仕様書作成 | ユーザーから新規タスク依頼（推奨） |
| execute | Phase実行 | タスク仕様書に基づくPhase実行 |
| update | 仕様書更新 | 既存仕様書の修正・更新 |
| detect-unassigned | 未タスク検出 | Phase 12での残課題検出 |

---

# Part 1: タスク仕様書作成ワークフロー（createモード）

```
Phase 1: 分析（LLM Task）
┌─────────────────────────────────────────────────────────┐
│ decompose-task → identify-scope → design-phases         │
│ 📖 Read: agents/decompose-task.md (必要時)               │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 2: 生成（LLM Task + Script Validation）
┌─────────────────────────────────────────────────────────┐
│ generate-task-specs → [validate-schema]                 │
│ 📖 Read: agents/generate-task-specs.md (必要時)          │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 3: 出力（Script Task - 100%精度）
┌─────────────────────────────────────────────────────────┐
│ [init-artifacts] → [generate-phase-files]               │
│ ┌─────────────────────────────────────────┐              │
│ │ output-phase-files   ← 並列実行          │              │
│ │ update-dependencies ←                  │              │
│ └─────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 4: 個別検証（Script Task - 100%精度）
┌─────────────────────────────────────────────────────────┐
│ [validate-phase-output]                                 │
└─────────────────────────────────────────────────────────┘
                            ↓
Phase 5: 全体整合性検証（Script + LLM - 自動実行）【必須】
┌─────────────────────────────────────────────────────────┐
│ [verify-all-specs] ← 13ファイル一括検証                  │
│     ├── 構造検証: 必須セクション・フォーマット           │
│     ├── 整合性検証: Phase間依存・参照資料               │
│     ├── 品質検証: 曖昧表現・検証可能性                  │
│     └── 完全性検証: 全13 Phase揃っているか              │
│                         ↓                               │
│ verify-specs (LLM) ← 品質基準チェック（必要時）          │
│ 📖 Read: agents/verify-specs.md                         │
│                         ↓                               │
│ 検証レポート生成 → outputs/verification-report.md       │
└─────────────────────────────────────────────────────────┘
                            ↓
         ┌──────────────────┴──────────────────┐
         ↓                                     ↓
    [検証PASS]                            [検証FAIL]
         ↓                                     ↓
Phase 6: 完了                           Phase 2へ戻り修正
┌─────────────────────────────────────────────────────────┐
│ [log-usage] → 完了                                      │
└─────────────────────────────────────────────────────────┘

凡例: [script] = Script Task (100%精度), 無印 = LLM Task
```

## Phase 5 検証項目詳細

| カテゴリ | 検証項目 | 自動/手動 |
|----------|----------|-----------|
| **構造** | 必須セクション（メタ情報/目的/実行タスク/参照資料/成果物/完了条件） | 自動 |
| **構造** | Markdownフォーマット正常性 | 自動 |
| **整合性** | Phase間依存関係（前Phase成果物が参照されているか） | 自動 |
| **整合性** | 参照資料パスの存在確認 | 自動 |
| **品質** | 曖昧表現の検出（「適切に」「必要に応じて」「など」） | 自動 |
| **品質** | 完了条件の検証可能性 | LLM |
| **品質** | 100人中100人が同じ理解で実行できるか | LLM |
| **完全性** | Phase 1〜13の全ファイル存在確認 | 自動 |
| **完全性** | index.md（メインタスク仕様書）存在確認 | 自動 |
| **完全性** | artifacts.json整合性 | 自動 |

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

リソースは**必要な時のみ**読み込む。

## agents/ （LLM Task仕様）

| Agent | 読み込み条件 | 責務 |
|-------|-------------|------|
| [decompose-task.md](agents/decompose-task.md) | createモード開始時 | タスク分解・責務抽出 |
| [identify-scope.md](agents/identify-scope.md) | 分解後 | スコープ・前提・制約定義 |
| [design-phases.md](agents/design-phases.md) | スコープ定義後 | Phase構成設計 |
| [generate-task-specs.md](agents/generate-task-specs.md) | Phase設計後 | タスク仕様書生成 |
| [output-phase-files.md](agents/output-phase-files.md) | 仕様書生成後 | ファイル出力 |
| [update-dependencies.md](agents/update-dependencies.md) | 仕様書生成後 | 依存関係設定 |
| [verify-specs.md](agents/verify-specs.md) | **Phase 5全体検証時（自動検証後）** | **LLM品質検証** |
| [generate-unassigned-task.md](agents/generate-unassigned-task.md) | Phase 12で未タスク検出時 | 未タスク指示書生成 |

## schemas/ （入出力スキーマ）

| Schema | 読み込み条件 | 用途 |
|--------|-------------|------|
| [mode.json](schemas/mode.json) | モード判定時 | モード定義検証 |
| [task-definition.json](schemas/task-definition.json) | タスク分解時 | タスク定義検証 |
| [phase-spec.json](schemas/phase-spec.json) | Phase仕様書生成時 | Phase仕様書検証 |
| [artifact-definition.json](schemas/artifact-definition.json) | 成果物登録時 | 成果物定義検証 |
| [unassigned-task.json](schemas/unassigned-task.json) | 未タスク生成時 | 未タスク指示書検証 |
| [verification-report.json](schemas/verification-report.json) | **Phase 5全体検証時** | **検証レポート検証** |

## references/ （詳細知識）

| Reference | 読み込み条件 | 内容 |
|-----------|-------------|------|
| [phase-templates.md](references/phase-templates.md) | Phase仕様書生成時 | Phase別テンプレート集 |
| [quality-standards.md](references/quality-standards.md) | 品質チェック時 | 品質基準詳細 |
| [artifact-naming-conventions.md](references/artifact-naming-conventions.md) | ファイル出力時 | 命名規則・配置先 |
| [review-gate-criteria.md](references/review-gate-criteria.md) | Phase 3/10実行時 | レビュー判定基準 |
| [unassigned-task-guidelines.md](references/unassigned-task-guidelines.md) | 未タスク検出時 | 未タスクガイドライン |
| [spec-update-workflow.md](references/spec-update-workflow.md) | Phase 12実行時 | 仕様更新フロー |
| [technical-documentation-guide.md](references/technical-documentation-guide.md) | Phase 12実行時 | 技術ドキュメント作成 |
| [self-improvement-cycle.md](references/self-improvement-cycle.md) | 改善分析時 | 自己改善サイクル |

## assets/ （テンプレート）

| Asset | 読み込み条件 | 用途 |
|-------|-------------|------|
| [phase-spec-template.md](assets/phase-spec-template.md) | Phase仕様書生成時 | Phase仕様書テンプレート |
| [common-header-template.md](assets/common-header-template.md) | ファイル生成時 | 共通ヘッダー |
| [common-footer-template.md](assets/common-footer-template.md) | ファイル生成時 | 共通フッター |
| [integration-test-template.md](assets/integration-test-template.md) | Phase 4/6実行時 | 統合テストテンプレート |
| [unassigned-task-template.md](assets/unassigned-task-template.md) | 未タスク生成時 | 未タスク指示書テンプレート |
| [main-task-template.md](assets/main-task-template.md) | タスク仕様書生成時 | メインタスクテンプレート |
| [implementation-guide-template.md](assets/implementation-guide-template.md) | Phase 12実行時 | 実装ガイドテンプレート |

## scripts/ （決定論的処理 - 100%精度）

| Script | 読み込み条件 | 用途 |
|--------|-------------|------|
| `detect-mode.js` | 開始時 | create/update/execute/detect-unassigned判定 |
| `validate-phase-output.js` | 各Phase完了時 | Phase出力ファイル検証 |
| `complete-phase.js` | 各Phase完了時 | Phase完了・成果物登録・依存更新 |
| `init-artifacts.js` | create時 | ワークフローディレクトリ初期化 |
| `verify-all-specs.js` | **Phase 5全体検証時（自動）** | **13ファイル一括検証・レポート生成** |
| `detect-unassigned-tasks.js` | Phase 12実行時 | TODO/FIXME検出 |
| `validate-schema.js` | スキーマ検証時 | JSON Schema検証 |
| `log-usage.js` | 全モード完了時 | 使用ログ記録 |

---

# Part 5: 実行コマンドリファレンス

## 全体整合性検証【Phase 5 - 必須】

```bash
# 13ファイル一括検証（Script Task - 100%精度・自動実行）
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}}

# 厳格モード（警告もエラーとして扱う）
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --strict

# JSON形式で出力
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --json
```

**検証結果**: `outputs/verification-report.md` に出力
**判定**: PASS → Phase 6（完了）へ / FAIL → Phase 2へ戻り修正

## Phase出力検証

```bash
# Phase出力の検証（Script Task - 100%精度）
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/{{FEATURE_NAME}} \
  --phase {{PHASE_NUMBER}}
```

## Phase完了処理

```bash
# Phase完了・成果物登録（Script Task - 100%精度）
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --phase {{PHASE_NUMBER}} \
  --artifacts "outputs/phase-{{PHASE_NUMBER}}/{{FILE}}.md:{{DESCRIPTION}}"
```

## 未タスク検出

```bash
# コードベースからTODO/FIXME検出（Script Task - 100%精度）
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
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

## システム仕様更新ガイドライン

Phase 12でシステム仕様の更新が必要かを判断する際は、以下を参照:

📖 **[spec-update-workflow.md](references/spec-update-workflow.md)**: 更新判断基準・フローチャート

| 更新が必要な場合 | 更新が不要な場合 |
|------------------|------------------|
| 新規インターフェース/型追加 | 内部実装の詳細変更のみ |
| 既存インターフェース変更 | リファクタリング（インターフェース不変） |
| 新規定数/設定値追加 | バグ修正（仕様変更なし） |
| 外部連携インターフェース追加 | テスト追加のみ |

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
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
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
| **verify-specs** | **全13仕様書の品質検証** | **seq** | **検証レポート** | **PASS/FAIL判定** |
| generate-unassigned-task | 未完了タスク指示書を生成 | cond | レビュー課題 | unassigned-task/\*.md |

**実行パターン凡例**:
- `seq`: シーケンシャル（前のTaskに依存）
- `par`: 並列実行（他と独立）
- `cond`: 条件分岐の起点

---

# Part 10: Phase 11/12 実行ガイダンス

## Phase 11: 手動テスト検証

### 実行フロー

```
1. 関連する自動テストを全て実行して確認
   ↓
2. テストカテゴリを特定（機能/エラーハンドリング/アクセシビリティ/統合）
   ↓
3. 各カテゴリのテスト項目を実行・記録
   ↓
4. 結果を outputs/phase-11/manual-test-result.md に出力
   ↓
5. 発見課題を outputs/phase-11/discovered-issues.md に出力
```

### テスト結果レポート形式

```markdown
## テストカテゴリ別結果

### 機能テスト（正常系）

| TC-ID  | 機能         | 期待結果             | 結果 | 備考 |
| ------ | ------------ | -------------------- | ---- | ---- |
| TC-001 | {{機能名}}   | {{期待される動作}}   | PASS |      |

### エラーハンドリングテスト（異常系）

| TC-ID  | 状況               | 期待結果               | 結果 | 備考 |
| ------ | ------------------ | ---------------------- | ---- | ---- |
| TC-101 | {{異常状況}}       | {{期待されるエラー}}   | PASS |      |

### アクセシビリティテスト

| TC-ID  | 要件                     | 結果 | WCAG違反 |
| ------ | ------------------------ | ---- | -------- |
| TC-201 | キーボードナビゲーション | PASS | なし     |

### 統合テスト連携

| テスト項目         | 結果 | 課題有無 |
| ------------------ | ---- | -------- |
| IPC接続            | PASS | なし     |
```

## Phase 12: ドキュメント更新

### 必須タスク

1. **実装ガイド作成**（2パート構成必須）
   - Part 1: 概念的説明（初学者・非技術者向け）
   - Part 2: 技術的詳細（開発者向け）

2. **ドキュメント更新履歴作成**
   - 作成・更新したファイル一覧

3. **未タスク検出レポート作成**（0件でも出力必須）
   - FAILテスト、重要度「高」課題、WCAG違反を検出
   - 検出されなくても「検出タスクなし」と明記

4. **システム仕様書更新**（aiworkflow-requirements）
   - 📖 Read: `references/spec-update-workflow.md`
   - タスク完了ステータスセクションを追加
   - 変更履歴にバージョン追記

### 未タスク検出レポート形式（0件の場合）

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | 0件     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

---

## 変更履歴

| Version | Date | Changes |
|---------|------|---------|
| **7.3.0** | **2026-01-17** | **Phase 12-2システム仕様更新ガイダンス強化: spec-update-workflow.mdに更新判断基準・フローチャート追加、aiworkflow-requirements更新タイミング明確化** |
| 7.2.0 | 2026-01-17 | Phase 11/12実行ガイダンス追加: テスト結果レポート形式、未タスク検出レポート形式（0件含む）、システム仕様書更新手順 |
| 7.1.0 | 2026-01-17 | Phase 5「全体整合性検証」追加: verify-all-specs.js（自動13ファイル一括検証）、verify-specs.md（LLM品質検証）、verification-report.json追加 |
| 7.0.0 | 2026-01-17 | skill-creator v5.3準拠リファクタリング: Progressive Disclosure完全化、スクリプト拡張子.js統一、リソースマップ整理 |
| 6.1.0 | 2026-01-14 | タスク完了ワークフロー追加: unassigned-task→completed-tasks移動・ステータス更新 |
| 6.0.0 | 2026-01-13 | skill-creator最新仕様準拠リファクタリング: Script First原則明確化、Progressive Disclosure完全対応、schemas/追加、Self-Improvement基盤追加 |
| 5.1.0 | 2026-01-13 | Phase 12-2システムドキュメント更新を強化 |
| 5.0.0 | 2026-01-10 | スキル選定機能削除、シンプル化 |
| 4.0.0 | 2026-01-06 | Git Worktree削除、結合テストカバレッジ基準追加 |
| 3.1.0 | 2026-01-07 | Phase 6追加（テスト拡充）、統合テスト連携必須化 |
| 3.0.0 | 2026-01-06 | Phase再構成（1-13）、/ai:diff-to-pr統合 |
