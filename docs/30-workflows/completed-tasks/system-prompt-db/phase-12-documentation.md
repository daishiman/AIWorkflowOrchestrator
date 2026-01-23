# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 12                                     |
| Phase名    | ドキュメント更新                       |
| 前提Phase  | Phase 11                               |
| 後続Phase  | Phase 13                               |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-22                             |
| 機能名     | システムプロンプトのデータベース永続化 |

---

## 目的

実装に関するドキュメントを整備し、システム仕様を更新し、未タスクを検出する。

## 背景

コードだけでは伝わらない設計意図・使用方法・制約事項をドキュメント化し、システム仕様との整合性を維持する。また、未完了のタスクを検出してフォローアップを準備する。

---

## 実行タスク

> 以下の4タスクを順番に実行してください。（4タスク構成必須）

### タスク1: 実装ガイド作成

**目的**: 実装に関する包括的なガイドを2パート構成で作成する

**実行手順**:

**Part 1: 概念的説明（初学者・非技術者向け）**

1. システム概要を記述する
   - システムプロンプトテンプレートとは何か
   - なぜデータベース永続化が必要か
   - ユーザーにとってのメリット
2. 機能概要を記述する
   - CRUD操作の概要
   - オフライン対応の仕組み
   - マイグレーションの流れ
3. 用語集を作成する
   - テンプレート、プリセット、同期などの用語説明

**Part 2: 技術的詳細（開発者向け）**

1. アーキテクチャ概要を記述する
   - レイヤー構成（Repository → IPC → Slice）
   - データフロー図
   - 依存関係
2. API/インターフェースを記述する
   - ISystemPromptRepository インターフェース
   - IPC チャネル一覧
   - 型定義（PromptTemplate, CreatePromptTemplateInput等）
3. データベーススキーマを記述する
   - system_prompt_templates テーブル構造
   - インデックス・制約
   - リレーション
4. テスト実行ガイドを記述する
   - ユニットテスト実行方法
   - 結合テスト実行方法
5. 成果物を `outputs/phase-12/implementation-guide.md` に出力する

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`（Part 1 + Part 2を含む）

---

### タスク2: システム仕様書更新（aiworkflow-requirements）

**目的**: システム仕様書を更新し、実装との整合性を維持する

> 📖 **必須**: `references/spec-update-workflow.md` を参照してから実行すること

**実行手順**:

**Step 1: タスク完了記録（必須 - 全タスク共通）**

1. 該当する仕様書に「## 完了タスク」セクションを追加する
   - `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`（参考：類似実装）
2. 「## 関連ドキュメント」に実装ガイドリンクを追加する
   - `docs/30-workflows/system-prompt-db/outputs/phase-12/implementation-guide.md`

**Step 2: システム仕様更新（条件付き）**

更新判断基準に基づき更新要否を判断する:

| 更新が必要な場合             | 更新が不要な場合                         |
| ---------------------------- | ---------------------------------------- |
| 新規インターフェース/型追加  | 内部実装の詳細変更のみ                   |
| 既存インターフェース変更     | リファクタリング（インターフェース不変） |
| 新規定数/設定値追加          | バグ修正（仕様変更なし）                 |
| 外部連携インターフェース追加 | テスト追加のみ                           |

**本タスクの場合（新規インターフェース追加のため更新必要）**:

以下のチェックリストを実行:

- [ ] メソッドシグネチャ変更 → interfaces-system-prompt.md（新規作成）
- [ ] 新規エラークラス追加 → error-handling.md
- [ ] 新規ビジネスルール → interfaces-system-prompt.md
- [ ] 認可/認証ロジック → interfaces-system-prompt.md
- [ ] 新規定数/設定値 → interfaces-system-prompt.md
- [ ] DBスキーマ変更 → database-schema.md
- [ ] 更新したファイルの変更履歴にバージョン追記

3. 成果物を `outputs/phase-12/spec-update-checklist.md` に出力する

**期待される成果物**:

- `outputs/phase-12/spec-update-checklist.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-system-prompt.md`（新規作成）
- `.claude/skills/aiworkflow-requirements/references/database-schema.md`（更新）

---

### タスク3: ドキュメント更新履歴作成

**目的**: ドキュメント更新の変更履歴を作成する

**実行手順**:

1. 自動生成スクリプトを使用する（推奨）
   ```bash
   node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
     --workflow docs/30-workflows/system-prompt-db
   ```
2. 生成後、以下を手動で補完する
   - システム仕様更新内容の詳細
   - ソースコード変更の概要
   - 関連するIssue/PR番号
3. 成果物を `outputs/phase-12/documentation-changelog.md` に出力する

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

**変更履歴テンプレート**:

```markdown
## ドキュメント更新履歴

### 更新日: {{DATE}}

### 更新ファイル一覧

| ファイル | 更新種別  | 変更内容        |
| -------- | --------- | --------------- |
| {{FILE}} | 新規/更新 | {{DESCRIPTION}} |

### システム仕様更新

- 更新有無: あり/なし
- 更新理由: {{REASON}}
- 更新ファイル: {{FILES}}

### ソースコード変更概要

- 新規ファイル: {{COUNT}}件
- 変更ファイル: {{COUNT}}件
- 削除ファイル: {{COUNT}}件

### 関連Issue/PR

- Issue: #{{ISSUE_NUMBER}}
- PR: #{{PR_NUMBER}}
```

---

### タスク4: 未タスク検出レポート作成

**目的**: 残タスク・未完了項目を検出しレポートする（0件でも出力必須）

**実行手順**:

1. 未タスク検出スクリプトを実行する
   ```bash
   node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
     --workflow docs/30-workflows/system-prompt-db \
     --sources "packages/shared/src/repositories/,apps/desktop/src/"
   ```
2. 以下のソースから未タスクを検出する
   - Phase 11 テスト結果（FAILテスト）
   - Phase 11 発見課題（重要度「高」）
   - Phase 11 アクセシビリティ（WCAG違反）
   - コードベースのTODO/FIXMEコメント
3. 検出結果をレポートにまとめる
4. 成果物を `outputs/phase-12/unassigned-task-report.md` に出力する

**期待される成果物**:

- `outputs/phase-12/unassigned-task-report.md`

**検出結果レポートテンプレート（0件の場合）**:

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | 0件     |
| 発見課題         | 0件     |
| アクセシビリティ | 0件     |
| TODO/FIXME       | 0件     |
| **合計**         | **0件** |

## 検出タスク一覧

**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

**検出結果レポートテンプレート（検出ありの場合）**:

```markdown
## 検出結果サマリー

| ソース           | 検出数        |
| ---------------- | ------------- |
| テスト結果       | {{COUNT}}     |
| 発見課題         | {{COUNT}}     |
| アクセシビリティ | {{COUNT}}     |
| TODO/FIXME       | {{COUNT}}     |
| **合計**         | **{{TOTAL}}** |

## 検出タスク一覧

### 高優先度

| ID  | ソース     | 内容            | 推奨対応   |
| --- | ---------- | --------------- | ---------- |
| 1   | {{SOURCE}} | {{DESCRIPTION}} | {{ACTION}} |

### 中優先度

| ID  | ソース     | 内容            | 推奨対応   |
| --- | ---------- | --------------- | ---------- |
| 2   | {{SOURCE}} | {{DESCRIPTION}} | {{ACTION}} |
```

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                           | 内容         |
| -------------------- | ------------------------------------------------------------------------------ | ------------ |
| データベーススキーマ | `.claude/skills/aiworkflow-requirements/references/database-schema.md`         | 既存DB設計   |
| アーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | 設計パターン |
| チャット履歴IF       | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 類似実装参考 |

### スキル参照資料

| 参照資料               | パス                                                                                    | 内容             |
| ---------------------- | --------------------------------------------------------------------------------------- | ---------------- |
| 仕様更新ワークフロー   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | 更新判断基準     |
| 技術ドキュメントガイド | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | ドキュメント作成 |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`     | ガイド形式       |

### 前Phaseの成果物

| 参照資料           | パス                                         | 内容           |
| ------------------ | -------------------------------------------- | -------------- |
| CRUD手動テスト     | `outputs/phase-11/crud-manual-test.md`       | CRUD検証結果   |
| UI/UX検証          | `outputs/phase-11/ui-ux-test.md`             | UI/UX検証      |
| プリセット検証     | `outputs/phase-11/preset-protection-test.md` | 保護検証結果   |
| エラーハンドリング | `outputs/phase-11/error-handling-test.md`    | エラー検証結果 |

---

## 成果物

| 成果物               | パス                                          | 内容              |
| -------------------- | --------------------------------------------- | ----------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | 2パート構成ガイド |
| 仕様更新チェック     | `outputs/phase-12/spec-update-checklist.md`   | 更新確認結果      |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | 変更履歴          |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | 未タスク一覧      |

---

## 完了条件

- [ ] 実装ガイドが2パート構成で作成されている
- [ ] システム仕様書が更新されている（または更新不要の判断が記録されている）
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが作成されている（0件でも出力）
- [ ] すべての成果物が出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## タスク完了チェックリスト

| タスク | 内容                 | 完了条件                           | 状況 |
| ------ | -------------------- | ---------------------------------- | ---- |
| Task 1 | 実装ガイド作成       | Part 1 + Part 2が含まれている      | 未   |
| Task 2 | システム仕様書更新   | 更新または不要判断が記録されている | 未   |
| Task 3 | ドキュメント更新履歴 | 変更履歴が作成されている           | 未   |
| Task 4 | 未タスク検出レポート | 0件でも出力されている              | 未   |

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/system-prompt-db/phase-13-pr-creation.md`
