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

**核心的な考え方**:

1. **タスク仕様書を作成する**ことが目的
2. **100人中100人が同じ理解で実行できる**粒度で記述
3. 各Phaseで必要な**目的・手順・成果物・完了条件**を明確化
4. Phase完了後は**artifacts.json**で進捗を追跡

## ワークフロー

```
ユーザー要求
    ↓
decompose-task（タスク分解）
    ↓
identify-scope（スコープ定義）
    ↓
design-phases（Phase構成設計）
    ↓
generate-task-specs（タスク仕様書生成）
    ↓
┌─────────────────────────────────────┐
│ output-phase-files（ファイル出力）  │ ← 並列実行
│ update-dependencies（依存関係設定） │
└─────────────────────────────────────┘
    ↓
docs/30-workflows/{{FEATURE_NAME}}/phase-*.md
    ↓
Phase 1〜13 実行（Phase 13で /ai:diff-to-pr）
    ↓
PR作成・CI通過
    ↓
docs/30-workflows/completed-tasks/{{FEATURE_NAME}}/ へ移動
```

### 並列実行グループ

| グループ   | 含まれるTask                            | 同期ポイント        |
| ---------- | --------------------------------------- | ------------------- |
| parallel-1 | output-phase-files, update-dependencies | Phase完了           |

## システム仕様参照（aiworkflow-requirements連携）【必須】

タスク仕様書作成時、既存システム仕様との整合性を確保するため `aiworkflow-requirements` を**必ず**参照する。

### Phase別参照要件

| Phase | 参照目的                                   | 必須 |
| ----- | ------------------------------------------ | ---- |
| 1     | 既存要件・インターフェース仕様との整合確認 | ✅   |
| 2     | アーキテクチャ・API・データベース仕様参照  | ✅   |
| 3     | 設計レビュー時の仕様準拠チェック           | ✅   |
| 4     | テスト設計時の仕様参照                     | ✅   |
| 5     | 実装時の仕様準拠確認                       | ✅   |
| 6     | テスト拡充時の仕様準拠確認                 | ✅   |
| 7     | テストカバレッジ確認時の仕様参照           | ✅   |
| 8     | リファクタリング時の仕様準拠確認           | ✅   |
| 12    | 仕様変更時のドキュメント更新               | ✅   |

### 仕様書への記載形式

各Phaseドキュメントの「参照資料」セクションに以下を**必ず**含める:

```markdown
### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料 | パス | 内容 |
| -------- | ---- | ---- |
| {{SPEC_NAME}} | `.claude/skills/aiworkflow-requirements/references/{{SPEC_FILE}}.md` | {{SPEC_DESCRIPTION}} |
```

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "{{KEYWORD}}"`
**詳細フロー**: See [references/spec-update-workflow.md](references/spec-update-workflow.md)

## Phase構成（フレームワーク）

タスク仕様書は以下のPhase構成に従って生成する。

| Phase | 名称                   | 目的                                                       |
| ----- | ---------------------- | ---------------------------------------------------------- |
| 1     | 要件定義               | 目的・スコープ・受け入れ基準定義                           |
| 2     | 設計                   | アーキテクチャ・詳細設計                                   |
| 3     | 設計レビューゲート     | 要件・設計の妥当性検証                                     |
| 4     | テスト作成             | TDD: Red（失敗するテスト作成）                             |
| 5     | 実装                   | TDD: Green（テストを通す実装）                             |
| 6     | テスト拡充             | カバレッジ目標達成に向けた追加テスト（統合テスト含む）     |
| 7     | テストカバレッジ確認   | カバレッジ目標検証・統合テスト実行                         |
| 8     | リファクタリング       | TDD: Refactor（品質改善）                                  |
| 9     | 品質保証               | 静的解析・セキュリティ・性能                               |
| 10    | 最終レビューゲート     | 全体品質・整合性検証                                       |
| 11    | 手動テスト検証         | UX・実環境動作確認                                         |
| 12    | ドキュメント更新       | ドキュメント更新・仕様反映・**未タスク検出**               |
| 13    | PR作成                 | `/ai:diff-to-pr` でコミット・PR・CI確認                    |

---

## テストカバレッジ基準【必須】

### ユニットテストカバレッジ

**対象**: コードの「行」をカバー

| 指標            | 最低基準 | 推奨基準 |
| --------------- | -------- | -------- |
| Line Coverage   | 80%      | 90%      |
| Branch Coverage | 60%      | 70%      |
| Function Coverage | 80%   | 90%      |

### 結合テストカバレッジ

**対象**: モジュール間の「接続点」をカバー

| 指標                         | 目標   |
| ---------------------------- | ------ |
| APIエンドポイント            | 100%   |
| モジュール間インターフェース | 100%   |
| 正常系シナリオ               | 100%   |
| 異常系シナリオ               | 80%+   |
| 外部連携ポイント             | 100%   |

### 結合テストシナリオカテゴリ

| カテゴリ               | 検証内容                                       |
| ---------------------- | ---------------------------------------------- |
| API接続テスト          | エンドポイント疎通・レスポンス形式             |
| データフローテスト     | フロント→API→DB→API→フロントの往復             |
| エラーハンドリング     | API障害時のフロントエンド表示・リトライ        |
| 認証連携テスト         | トークン取得・リフレッシュ・期限切れ処理       |
| 状態同期テスト         | リアルタイム更新・楽観的UI更新・ロールバック   |
| インターフェース境界   | Controller ↔ Service ↔ Repository ↔ Database |

---

## 統合テスト連携（Phase 1〜11で必須）

**Phase 1〜11の各仕様書に、統合テスト連携の実施内容を必ず記載すること。**

| Phase | 統合テスト連携の必須アクション |
| ----- | ------------------------------ |
| 1     | 接続要件（API/認証/データフロー）を要件に明記 |
| 2     | 統合ポイント/契約（API・スキーマ）を設計に反映 |
| 3     | 統合テスト観点のレビューゲートを実施 |
| 4     | 統合テストシナリオを作成（API/データフロー/エラー/認証/状態同期） |
| 5     | フロント/バック接続の実装とテスト支援コード整備 |
| 6     | 統合テストの拡充（全カテゴリのカバレッジ向上） |
| 7     | 統合テストの再実行とゲート判定 |
| 8     | リファクタ後の統合テスト継続成功を確認 |
| 9     | 品質保証で統合テスト結果を確認 |
| 10    | 最終レビューで統合テスト結果を確認 |
| 11    | 手動統合テスト（UI/API接続）を確認 |

---

## Phase完了時の必須アクション【重要】

**各Phase完了時に以下を必ず実行すること:**

1. **タスク完全実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: Phase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/{{FEATURE_NAME}} --phase {{PHASE_NUMBER}}
```

**Phase別テンプレート**: See [references/phase-templates.md](references/phase-templates.md)
**出力ディレクトリ構造**: See [references/artifact-naming-conventions.md](references/artifact-naming-conventions.md)

---

## Phase 4: テスト作成【必須】

### 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

### テスト種別と責務

| テスト種別 | 責務 | カバレッジ対象 |
| ---------- | ---- | -------------- |
| ユニットテスト | コードの「行」をカバー | Line/Branch/Function |
| 統合テスト | モジュール間の「接続点」をカバー | API/インターフェース/シナリオ |

### 統合テストシナリオ設計【必須】

| シナリオカテゴリ   | 検証内容                                   |
| ------------------ | ------------------------------------------ |
| API接続テスト      | エンドポイント疎通・レスポンス形式         |
| データフローテスト | フロント→API→DB→API→フロントの往復         |
| エラーハンドリング | API障害時のフロントエンド表示・リトライ    |
| 認証連携テスト     | トークン取得・リフレッシュ・期限切れ処理   |
| 状態同期テスト     | リアルタイム更新・楽観的UI更新・ロールバック |

### 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase 6: テスト拡充【必須】

Phase 5（実装）完了後、リファクタリングに進む前にテストを拡充する。

### 目的

- 追加テストによりカバレッジ目標を達成
- フロントエンド・バックエンド統合テストを拡充
- 接続不良による画面未表示などの不具合を事前に防止

### ユニットテストカバレッジ基準

| 指標            | 最低基準 | 推奨基準 |
| --------------- | -------- | -------- |
| Line Coverage   | 80%      | 90%      |
| Branch Coverage | 60%      | 70%      |
| Function Coverage | 80%   | 90%      |

### 結合テストカバレッジ基準

| 指標                         | 目標   |
| ---------------------------- | ------ |
| APIエンドポイント            | 100%   |
| モジュール間インターフェース | 100%   |
| 正常系シナリオ               | 100%   |
| 異常系シナリオ               | 80%+   |
| 外部連携ポイント             | 100%   |

### 統合テスト拡充【必須】

| テストカテゴリ     | 検証項目                                   |
| ------------------ | ------------------------------------------ |
| API接続テスト      | エンドポイント疎通・レスポンス形式         |
| データフローテスト | フロント→API→DB→API→フロントの往復         |
| エラーハンドリング | API障害時のフロントエンド表示・リトライ    |
| 認証連携テスト     | トークン取得・リフレッシュ・期限切れ処理   |
| 状態同期テスト     | リアルタイム更新・楽観的UI更新・ロールバック |

### 実行コマンド

```bash
# ユニットテストカバレッジ確認
pnpm test:coverage

# 統合テスト実行
pnpm test:integration

# E2Eテスト実行
pnpm test:e2e
```

### 完了条件

- [ ] ユニットテストカバレッジ基準を達成
- [ ] 結合テストカバレッジ基準を達成
- [ ] 統合テストの追加が完了している
- [ ] フロントエンド・バックエンド接続テストが成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase 7: テストカバレッジ確認【必須】

Phase 6の拡充結果を検証し、**カバレッジ基準を満たすまで**ゲートとして確認する。

### 目的

- ユニットテスト・結合テストのカバレッジ達成確認
- 統合テストの成功確認（フロント・バックエンド接続を含む）
- 未達の場合はPhase 6へ戻りテスト拡充

### 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（API 100%, シナリオ 100%/80%）
- [ ] 統合テストが全て成功
- [ ] フロントエンド・バックエンド接続テストが成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase 13: タスク完了処理【必須】

Phase 13でPR作成・CI通過後、タスクディレクトリを完了タスクフォルダに移動する。

### ⚠️ PR作成に関する重要な注意【必須確認】

**PR作成は自動実行しない。必ずユーザーの明示的な許可を得てから実行すること。**

| 禁止事項 | 理由 |
|----------|------|
| 勝手にPRを作成する | レビュー前の変更がリモートに反映されてしまう |
| ユーザー確認なしで`/ai:diff-to-pr`を実行する | 意図しないブランチやコミットが作成される可能性 |
| ローカル確認をスキップする | 動作確認されていないコードがPRに含まれる |

### タスク完了フロー

```
Phase 1〜12 完了
    ↓
【必須】ローカルでの動作確認
    ↓
【必須】ユーザーにPR作成の許可を確認
    ↓
ユーザー許可後: PR作成（/ai:diff-to-pr 使用）
    ↓
CI通過確認
    ↓
タスクディレクトリを completed-tasks/ に移動
    ↓
（該当する場合）未タスク指示書を削除
    ↓
変更をコミット・プッシュ
    ↓
ワークフロー完了
```

### ローカル確認チェックリスト【PR作成前に必須】

PR作成前に以下を**必ず**確認すること:

| # | 確認項目 | コマンド例 |
|---|----------|------------|
| 1 | ビルドが成功する | `pnpm build` |
| 2 | 全テストがパスする | `pnpm test` |
| 3 | 型チェックがパスする | `pnpm typecheck` |
| 4 | Lintエラーがない | `pnpm lint` |
| 5 | 実際の動作確認（該当する場合） | `pnpm dev` で手動確認 |

### `/ai:diff-to-pr` スキルの使用

**ユーザーの許可を得た後にのみ**、`/ai:diff-to-pr` スキルを使用してPR作成を行う:

```bash
# ユーザー許可後にのみ実行
/ai:diff-to-pr
```

このスキルが実行する内容:
1. 変更差分の確認
2. コミットメッセージ生成
3. PR作成
4. CI結果確認

### 移動手順

```bash
# 1. タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/{{TASK_NAME}}/ docs/30-workflows/completed-tasks/

# 2. 移動を確認
ls docs/30-workflows/completed-tasks/ | grep {{TASK_NAME}}

# 3. 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): {{TASK_NAME}}をcompleted-tasksに移動"
git push
```

### 完了条件チェックリスト

| # | 項目 | 必須 |
|---|------|------|
| 1 | **ローカルでビルド・テスト・型チェック・Lintが全てパス** | ✅ |
| 2 | **ユーザーにPR作成の許可を確認済み** | ✅ |
| 3 | PRが作成されている | ✅ |
| 4 | CIが全て通過している | ✅ |
| 5 | タスクディレクトリが `completed-tasks/` に移動済み | ✅ |
| 6 | `artifacts.json` の `status` が `"completed"` | ✅ |
| 7 | （該当時）未タスク指示書が削除済み | 条件 |
| 8 | **本Phase内の全タスクを100%完了** | ✅ |

**詳細テンプレート**: See [references/phase-templates.md](references/phase-templates.md)

---

## Phase 12: ドキュメント更新【必須】

Phase 12では3つの必須作業を行う:

1. **実装ガイド作成**: 概念的説明と技術的詳細のドキュメント化
2. **システムドキュメント更新**: 既存ドキュメントへの反映（aiworkflow-requirements含む）
3. **未タスク検出**: 技術的負債の可視化と継続的改善

### Phase 12-1: 実装ガイド作成

実装した内容を「概念的な説明」と「技術的な詳細」の両面からドキュメント化する。

#### ドキュメント要件

| セクション | 必須 | 内容 |
| --- | --- | --- |
| 概念的な説明 | ✅ | 中学生にもわかる比喩・例え話を使った説明 |
| 全体アーキテクチャ | ✅ | ASCII図解付きのレイヤー構造説明 |
| データベース設計 | 条件 | テーブル定義 + なぜこの設計にしたか |
| 各層の実装詳細 | ✅ | コード例 + 設計意図の説明 |
| 用語集 | ✅ | 専門用語の読み方・意味・コンテキスト |

#### 記述原則

1. **Why-first（なぜ優先）**: 「何をしたか」より「なぜそうしたか」を重視
2. **対比説明**: 「悪い例」と「良い例」を並べて違いを明確化
3. **図解活用**: ASCII図でアーキテクチャ・データフロー・関係性を可視化
4. **コード注釈**: コードスニペットには必ず日本語コメントで意図を補足
5. **読み方併記**: 英語の専門用語にはカタカナ読みを付記

**テンプレート**: See [assets/implementation-guide-template.md](assets/implementation-guide-template.md)

### Phase 12-2: システムドキュメント更新

- 更新対象: `docs/00-requirements/` 配下
- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- 更新原則: 概要のみ記載、Single Source of Truth遵守

### Phase 12-3: 未タスク検出

| ソース | 確認項目 | Grepパターン例 |
| --- | --- | --- |
| Phase 3レビュー結果 | MINOR判定の指摘事項 | `outputs/phase-3/` |
| Phase 9レビュー結果 | MINOR判定の指摘事項 | `outputs/phase-9/` |
| Phase 11手動テスト結果 | スコープ外の発見事項 | `outputs/phase-11/` |
| 各Phase成果物 | 「将来対応」「TODO」「FIXME」 | `grep -r "TODO\|FIXME\|将来対応" outputs/` |
| コードベース | TODO/FIXME/HACK/XXXコメント | `grep -rn "TODO\|FIXME\|HACK\|XXX" packages/ apps/` |

**詳細仕様**: See [agents/generate-unassigned-task.md](agents/generate-unassigned-task.md)

### 出力要件

| 出力物 | 必須 | 配置先 |
| --- | --- | --- |
| 実装ガイド | ✅ | `outputs/phase-12/implementation-guide.md` |
| ドキュメント更新記録 | ✅ | `outputs/phase-12/documentation-update-log.md` |
| 未タスク検出レポート | ✅ | `outputs/phase-12/unassigned-task-report.md` |
| 未タスク指示書（該当時） | 条件 | `docs/30-workflows/unassigned-task/` |

### 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] aiworkflow-requirementsが更新されている（該当する場合）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Task仕様ナビ

| Task                     | 責務                       | 実行パターン | 入力             | 出力                  |
| ------------------------ | -------------------------- | ------------ | ---------------- | --------------------- |
| decompose-task           | タスクを単一責務に分解     | seq          | ユーザー要求     | タスク分解リスト      |
| identify-scope           | スコープ・前提・制約を定義 | seq          | タスク分解リスト | スコープ定義          |
| design-phases            | Phase構成を設計            | seq          | スコープ定義     | フェーズ設計書        |
| generate-task-specs      | タスク仕様書を生成         | seq          | フェーズ設計書   | タスク仕様書一覧      |
| output-phase-files       | 個別Markdownファイルを出力 | **par**      | タスク仕様書一覧 | phase-\*.md           |
| update-dependencies      | Phase間の依存関係を設定    | **par**      | タスク仕様書一覧 | 依存関係マップ        |
| generate-unassigned-task | 未完了タスク指示書を生成   | cond         | レビュー課題     | unassigned-task/\*.md |

**実行パターン凡例**:

- `seq`: シーケンシャル（前のTaskに依存）
- `par`: 並列実行（他と独立）
- `cond`: 条件分岐の起点
- `agg`: 集約処理（並列の終点）

**詳細仕様**: 各Taskの詳細は `agents/` ディレクトリの対応ファイルを参照
**注記**: 1 Task = 1 責務。複数責務を1ファイルに入れない。

---

## artifacts.json 更新【必須】

**各Phase完了時に `artifacts.json` を必ず更新する。** これはPhase管理・成果物追跡の中核ファイル。

### 更新タイミング

| イベント         | 更新内容                                           |
| ---------------- | -------------------------------------------------- |
| Phase完了時      | `phases.{N}.status` → `completed`、`completedAt` 追加 |
| 成果物作成時     | `phases.{N}.artifacts` に成果物情報を追加          |
| lastUpdated更新  | 常に現在のタイムスタンプに更新                     |

### 更新形式

```json
{
  "phases": {
    "{{PHASE_NUMBER}}": {
      "status": "completed",
      "completedAt": "{{ISO_TIMESTAMP}}",
      "artifacts": [
        {
          "type": "document",
          "path": "outputs/phase-{{PHASE_NUMBER}}/{{FILE_NAME}}.md",
          "description": "{{ARTIFACT_DESCRIPTION}}"
        }
      ]
    }
  }
}
```

### チェックリスト

Phase完了時に以下を**すべて**実行すること:

| # | 項目                                           | 対象ファイル                    |
| - | ---------------------------------------------- | ------------------------------- |
| 1 | Phase仕様書のステータスを `完了` に更新        | `phase-{{PHASE_NUMBER}}-*.md`   |
| 2 | Phase仕様書に `完了日` を追加                  | `phase-{{PHASE_NUMBER}}-*.md`   |
| 3 | Phase仕様書の完了条件をすべてチェック          | `phase-{{PHASE_NUMBER}}-*.md`   |
| 4 | **`artifacts.json` の該当Phaseを更新**【必須】 | `artifacts.json`                |
| 5 | `index.md` のPhase一覧テーブルを更新           | `index.md`                      |

**重要**: 項目4は必須。これを省略するとワークフロー追跡が破綻する。

**詳細**: See [references/artifact-naming-conventions.md](references/artifact-naming-conventions.md)

---

## ベストプラクティス

### すべきこと

- 各Phaseを独立したMarkdownファイルとして出力
- **各Phase完了時に `artifacts.json` を必ず更新**
- **各Phase完了時に全タスクを100%実行し、完了を明記**
- 100人中100人が同じ理解で実行できる粒度で記述
- コード成果物はプロジェクトディレクトリに配置（outputs/ではない）
- TodoWriteでサブタスクを管理し、進捗を可視化
- Phase 12でaiworkflow-requirementsを適切に更新

### 避けるべきこと

- **`artifacts.json` の更新を忘れる**
- **タスク100%実行の確認を省略する**
- 1つのファイルに全Phaseを詰め込む
- コード成果物を `outputs/` 配下に配置する
- 曖昧な表現で記述する（誰が読んでも同じ理解になるようにする）

**詳細**: See [references/quality-standards.md](references/quality-standards.md)

---

## リソース参照

### agents/（Task仕様書）

| Task             | パス                                                                         |
| ---------------- | ---------------------------------------------------------------------------- |
| タスク分解       | See [agents/decompose-task.md](agents/decompose-task.md)                     |
| スコープ特定     | See [agents/identify-scope.md](agents/identify-scope.md)                     |
| フェーズ設計     | See [agents/design-phases.md](agents/design-phases.md)                       |
| タスク仕様書生成 | See [agents/generate-task-specs.md](agents/generate-task-specs.md)           |
| 個別ファイル出力 | See [agents/output-phase-files.md](agents/output-phase-files.md)             |
| 依存関係更新     | See [agents/update-dependencies.md](agents/update-dependencies.md)           |
| 未完了タスク生成 | See [agents/generate-unassigned-task.md](agents/generate-unassigned-task.md) |

### references/（詳細知識）

| リソース                 | パス                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| Phase別テンプレート      | See [references/phase-templates.md](references/phase-templates.md)                         |
| 品質基準                 | See [references/quality-standards.md](references/quality-standards.md)                     |
| 成果物命名規則           | See [references/artifact-naming-conventions.md](references/artifact-naming-conventions.md) |
| 未完了タスクガイドライン | See [references/unassigned-task-guidelines.md](references/unassigned-task-guidelines.md)   |
| レビューゲート判定基準   | See [references/review-gate-criteria.md](references/review-gate-criteria.md)               |
| システム仕様更新         | See [references/spec-update-workflow.md](references/spec-update-workflow.md)               |
| 技術ドキュメントガイド   | See [references/technical-documentation-guide.md](references/technical-documentation-guide.md) |

### assets/（テンプレート）

| テンプレート             | パス                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------- |
| Phase仕様書テンプレート  | See [assets/phase-spec-template.md](assets/phase-spec-template.md)                     |
| 共通ヘッダーテンプレート | See [assets/common-header-template.md](assets/common-header-template.md)               |
| 共通フッターテンプレート | See [assets/common-footer-template.md](assets/common-footer-template.md)               |
| 統合テストテンプレート   | See [assets/integration-test-template.md](assets/integration-test-template.md)         |
| 未完了タスクテンプレート | See [assets/unassigned-task-template.md](assets/unassigned-task-template.md)           |
| メインタスクテンプレート | See [assets/main-task-template.md](assets/main-task-template.md)                       |
| 実装ガイドテンプレート   | See [assets/implementation-guide-template.md](assets/implementation-guide-template.md) |

### scripts/（決定論的処理）

| スクリプト                  | 用途                            | 使用例                                                                         |
| --------------------------- | ------------------------------- | ------------------------------------------------------------------------------ |
| `validate-phase-output.mjs` | Phase出力ファイル検証           | `node scripts/validate-phase-output.mjs docs/30-workflows/{{FEATURE_NAME}}`    |
| `complete-phase.mjs`        | Phase完了・成果物登録・依存更新 | `node scripts/complete-phase.mjs --workflow <path> --phase <N> --artifacts ""` |

---

## 変更履歴

| Version | Date       | Changes                                                                       |
| ------- | ---------- | ----------------------------------------------------------------------------- |
| 5.0.0   | 2026-01-10 | スキル選定機能削除、スキルフィードバック機能削除、シンプル化（aiworkflow-requirements更新は維持） |
| 4.0.0   | 2026-01-06 | Git Worktree削除、結合テストカバレッジ基準追加、テンプレート責務分離、変数化強化 |
| 3.1.0   | 2026-01-07 | Phase 6追加（テスト拡充）、Phase再番号付け（1-13）、統合テスト連携（Phase 1-11）必須化 |
| 3.0.0   | 2026-01-06 | Phase再構成（1-13）、テストカバレッジ確認Phase追加、統合テスト必須化、/ai:diff-to-pr統合 |
| 2.6.0   | 2026-01-05 | Phase 13タスク完了処理【必須】を追加、completed-tasks移動フローを明文化 |
| 2.5.0   | 2026-01-05 | 実装ガイドPart2に「なぜ」の設計理由説明を必須化、用語集セクション追加 |
| 2.0.0   | 2026-01-04 | 責務分離: skill仕様チェックをskill-creatorへ委譲、references/へ詳細移動 |
| 1.0.0   | 2025-12-28 | 初版作成                                                                      |
