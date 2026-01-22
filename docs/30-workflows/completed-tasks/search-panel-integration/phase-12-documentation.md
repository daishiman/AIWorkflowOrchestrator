# Phase 12: ドキュメント更新 - 検索パネル EditorView 統合

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| フェーズ   | Phase 12                                         |
| 名称       | ドキュメント更新                                 |
| 目的       | 実装ガイド作成・システム仕様書更新・未タスク検出 |
| 前提Phase  | Phase 11: 手動テスト                             |
| 次Phase    | Phase 13: PR作成                                 |
| ステータス | 未実施                                           |

---

## 目的

実装内容を文書化し、システム仕様書を必要に応じて更新する。また、残課題がないかを検出する。

---

## 実行タスク

### Task 1: 実装ガイド作成（2パート構成）

**目的**: 検索パネル EditorView 統合の実装ガイドを作成する

**実行内容**:

**Part 1: 概念的説明（初学者・非技術者向け）**

- 検索パネル統合の概要
- 機能の使い方
- キーボードショートカット一覧

**Part 2: 技術的詳細（開発者向け）**

- アーキテクチャ図
- EditorInstance インターフェースの説明
- 各フックの使い方
- カスタマイズ方法

出力先: `outputs/phase-12/implementation-guide.md`

**完了条件**:

- [ ] Part 1（概念的説明）が作成されている
- [ ] Part 2（技術的詳細）が作成されている
- [ ] 実装ガイドが `outputs/phase-12/implementation-guide.md` に出力されている

### Task 2: システム仕様書更新（aiworkflow-requirements）【重要】

**目的**: 必要に応じてシステム仕様書を更新する

**実行内容**:

📖 **必須**: `.claude/skills/task-specification-creator/references/spec-update-workflow.md` を確認する

⚠️ **2ステップで実行:**

---

#### Step 1: タスク完了記録（必須 - 全タスク共通）

**全てのタスクで必ず実行すること:**

- [ ] 該当する仕様書に「## 完了タスク」セクションを追加
- [ ] 「## 関連ドキュメント」に実装ガイドリンクを追加

**対象仕様書**:

- `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`

**追記内容**:

```markdown
## 完了タスク

- [x] Phase 5 検索パネル実装の EditorView 統合（TASK-SEARCH-INTEGRATE-001）

## 関連ドキュメント

- [実装ガイド](../../../docs/30-workflows/search-panel-integration/outputs/phase-12/implementation-guide.md)
```

---

#### Step 2: システム仕様更新（条件付き）

**更新判断基準**:

| 更新が必要な場合             | 更新が不要な場合                         |
| ---------------------------- | ---------------------------------------- |
| 新規インターフェース/型追加  | 内部実装の詳細変更のみ                   |
| 既存インターフェース変更     | リファクタリング（インターフェース不変） |
| 新規定数/設定値追加          | バグ修正（仕様変更なし）                 |
| 外部連携インターフェース追加 | テスト追加のみ                           |

**更新が必要な場合のチェックリスト**:

```
□ メソッドシグネチャ変更 → interfaces-*.md
□ 新規エラークラス追加 → error-handling.md
□ 新規ビジネスルール → interfaces-*.md
□ 認可/認証ロジック → interfaces-*.md / security-*.md
□ 新規定数/設定値 → 該当interfaces-*.md
□ DBスキーマ変更 → database-*.md
□ 更新したファイルの変更履歴にバージョン追記
```

**本タスクの判断**:

- EditorInstance インターフェースは既に ui-ux-search-panel.md に定義済み
- TextAreaEditorAdapter は内部実装のため仕様変更不要
- 統合フックは EditorView 内部の実装詳細

→ **システム仕様の更新は不要**（Step 1のタスク完了記録のみ実行）

**完了条件**:

- [ ] Step 1: タスク完了記録が仕様書に追加されている
- [ ] Step 2: システム仕様更新の要否判断が documentation-changelog.md に記録されている
- [ ] 「更新なし」の場合もその判断根拠を明記

### Task 3: ドキュメント更新履歴作成

**目的**: ドキュメント更新内容を履歴として記録する

**実行内容**:

📖 **推奨**: 自動生成スクリプトを使用

```bash
# 自動生成スクリプト実行（推奨）
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/search-panel-integration
```

**生成後、以下を手動で補完**:

- システム仕様更新内容または「更新なし」の判断根拠
- ソースコード変更の概要

```markdown
# ドキュメント更新履歴

## 概要

| 項目     | 内容                      |
| -------- | ------------------------- |
| タスクID | TASK-SEARCH-INTEGRATE-001 |
| 更新日   | {{CURRENT_DATE}}          |
| 更新者   | Claude                    |

## 更新内容

### 新規作成ドキュメント

| ドキュメント | パス                                       |
| ------------ | ------------------------------------------ |
| 実装ガイド   | `outputs/phase-12/implementation-guide.md` |

### システム仕様更新

- **更新なし**: 本タスクは既存インターフェースの統合のみであり、システム仕様の変更は不要
- **理由**: EditorInstance インターフェースは既に ui-ux-search-panel.md に定義済み

### ソースコード変更

| ファイル                                          | 変更内容         |
| ------------------------------------------------- | ---------------- |
| EditorView/index.tsx                              | SearchPanel 統合 |
| features/search/adapters/TextAreaEditorAdapter.ts | 新規作成         |
| EditorView/hooks/useEditorInstance.ts             | 新規作成         |
| EditorView/hooks/useWorkspaceSearch.ts            | 新規作成         |
| EditorView/hooks/useSearchKeyboardShortcuts.ts    | 新規作成         |
```

出力先: `outputs/phase-12/documentation-changelog.md`

**完了条件**:

- [ ] ドキュメント更新履歴が作成されている
- [ ] システム仕様更新の判断根拠が記載されている（「更新なし」の場合も明記）

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

**目的**: 残課題や未完了タスクを検出・記録する

**実行内容**:

1. 検出対象:
   - FAIL テスト
   - 重要度「高」の発見課題
   - WCAG 違反
   - TODO/FIXME コメント

2. 検出コマンド:

```bash
# TODO/FIXME 検出
grep -rn "TODO\|FIXME" apps/desktop/src/features/search/ apps/desktop/src/renderer/views/EditorView/

# または自動検出スクリプト
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --workflow docs/30-workflows/search-panel-integration \
  --sources "apps/desktop/src/features/search/,apps/desktop/src/renderer/views/EditorView/"
```

3. 検出レポート作成:

**⚠️ 重要: 0件でも必ず出力すること**

```markdown
## 検出結果サマリー

| ソース           | 検出数  |
| ---------------- | ------- |
| テスト結果       | X 件    |
| 発見課題         | X 件    |
| アクセシビリティ | X 件    |
| TODO/FIXME       | X 件    |
| **合計**         | **X件** |

## 検出タスク一覧

（検出タスクがある場合）
| # | 重要度 | ソース | 内容 | 対応方針 |
| --- | ------ | -------- | ---------- | -------------- |
| 1 | 高/中 | (ソース) | (課題内容) | (対応方針) |

（検出タスクがない場合 - 以下の形式で明記）
**検出タスクなし**

すべてのテストがPASSし、発見課題もないため、未タスクとして記録すべき項目はありません。
```

出力先: `outputs/phase-12/unassigned-task-detection.md`

**完了条件**:

- [ ] 未タスク検出レポートが作成されている（**0件でも出力必須**）
- [ ] 0件の場合は「検出タスクなし」と明記
- [ ] 検出された未タスクがある場合は `docs/30-workflows/unassigned-task/` に指示書を作成

---

## 参照資料

### Phase 11 成果物

| 参照資料       | パス                                     |
| -------------- | ---------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/manual-test-result.md` |
| 発見課題一覧   | `outputs/phase-11/discovered-issues.md`  |

### システム仕様

| 参照資料         | パス                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| 検索パネルUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md` |

### スキル参照

| 参照資料             | パス                                                                           |
| -------------------- | ------------------------------------------------------------------------------ |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` |

---

## 成果物

| 成果物               | パス                                            |
| -------------------- | ----------------------------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` |

---

## 完了条件

- [ ] 実装ガイド（Part 1 + Part 2）が作成されている
- [ ] タスク完了記録がシステム仕様書に追加されている
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポートが作成されている（0件でも出力必須）
- [ ] 全4タスクが完了している

---

## 次のPhaseへの引き継ぎ

Phase 13（PR作成）では、本Phaseで完成したドキュメントを含めて:

- コミット作成
- PR 作成
- CI/CD 完了確認
