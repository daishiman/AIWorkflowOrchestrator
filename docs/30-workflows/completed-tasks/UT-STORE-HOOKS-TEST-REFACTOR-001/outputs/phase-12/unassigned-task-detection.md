# 未タスク検出レポート: UT-STORE-HOOKS-TEST-REFACTOR-001

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | UT-STORE-HOOKS-TEST-REFACTOR-001 |
| Phase    | 12                               |
| 作成日   | 2026-02-12                       |
| 検出件数 | **2件**                          |

---

## 検出ソースと結果

### 1. 元タスク仕様書のスコープ外項目

- 確認結果: スコープ外項目なし
- 本タスクは agentSlice.selectors.test.ts のテストパターン移行に限定されており、スコープ外の作業は発生しなかった

### 2. Phase 3/10 レビュー結果

- Phase 3（設計レビュー）: PASS判定、MINOR指摘なし
- Phase 10（最終レビュー）: PASS判定、MINOR指摘なし
- 未タスク化が必要な指摘事項は0件

### 3. Phase 11 手動テスト結果

- テストリファクタリングタスクのため、Phase 11はテスト実行の再確認が中心
- スコープ外の発見事項: **1件（Vitest環境ディレクティブ不統一）**

### 3-b. Phase 12 実装苦戦箇所

- テストヘルパー関数の重複パターンを検出: **1件（テストヘルパー関数重複）**

### 4. コードコメント内の TODO/FIXME/HACK/XXX

- 対象ファイル: `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`
- `grep` 結果: **0件**
- TODO/FIXME/HACK/XXXコメントは存在しない

### 5. documentation-changelog 記録過程での不整合

- 不整合検出: なし
- 全Stepで想定どおりの結果が得られた

---

## 検出タスク一覧

| タスクID                          | タスク名                            | 優先度 | 規模   | 発見元                         | 指示書パス                                                                           |
| --------------------------------- | ----------------------------------- | ------ | ------ | ------------------------------ | ------------------------------------------------------------------------------------ |
| task-ref-vitest-env-directive-001 | Vitest環境ディレクティブ標準化      | 低     | 小規模 | Phase 11（スコープ外発見事項） | `docs/30-workflows/unassigned-task/task-ref-vitest-env-directive-standardization.md` |
| task-ref-store-test-helpers-001   | Store Hooksテストヘルパー関数共通化 | 低     | 中規模 | Phase 12（実装苦戦箇所）       | `docs/30-workflows/unassigned-task/task-ref-store-test-helpers-unification.md`       |

### 4ステップ完了確認

| ステップ | 作業内容                             | ステータス |
| -------- | ------------------------------------ | ---------- |
| 1        | 指示書作成（unassigned-task/に配置） | 完了       |
| 2        | 物理ファイル存在確認                 | 完了       |
| 3        | task-workflow.md残課題テーブルに登録 | 完了       |
| 4        | 関連仕様書にリンク追加               | 完了       |

---

## 結論

検出された未タスク: **2件**

本タスクはテストリファクタリング（既存テストの改善）が主目的だが、追加調査により以下の2件の未タスクが検出された:

1. **Vitest環境ディレクティブ不統一**（Phase 11手動テストで発見）: テストファイル間で `@vitest-environment` ディレクティブの使用が統一されていない
2. **テストヘルパー関数重複**（Phase 12実装苦戦箇所で発見）: Store Hooksテストで使用するヘルパー関数が複数ファイルに重複定義されている

---

## 既存の関連未タスク（参考）

以下は親タスク（UT-STORE-HOOKS-REFACTOR-001）から検出済みの未タスクであり、本タスクの成果物には影響しない。

| タスクID                      | 内容                       | ステータス | 備考               |
| ----------------------------- | -------------------------- | ---------- | ------------------ |
| UT-STORE-HOOKS-REFACTOR-002   | 状態セレクタのJSDoc追加    | 未実施     | Phase 10 MINOR検出 |
| UT-STORE-HOOKS-REFACTOR-003   | 合成Hook移行               | 未実施     | Phase 10 MINOR検出 |
| UT-FIX-APP-INITAUTH-CHECK-001 | App.tsx initializeAuth確認 | 未実施     | Phase 10 MINOR検出 |
