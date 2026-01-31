# Phase 7: テストカバレッジ確認

## メタ情報

| 項目         | 内容                                |
| ------------ | ----------------------------------- |
| フェーズ番号 | 7                                   |
| フェーズ名   | テストカバレッジ確認                |
| カテゴリ     | 品質                                |
| 機能名       | task-imp-permission-readable-ui-001 |
| タスク名     | PermissionDialog 人間可読UI改善     |
| GitHub Issue | #585                                |
| 作成日       | 2026-01-30                          |
| ステータス   | pending                             |

---

## 目的

Phase 5の実装とPhase 6の拡充テストに対して、テストカバレッジが基準を満たしているか測定・確認する。基準未達の場合はPhase 6に戻って追加テストを作成する。

---

## タスク

- Task 1: カバレッジ測定の実行
  - `permissionDescriptions.ts` のカバレッジを測定する
  - `PermissionDialog.tsx` のカバレッジを測定する
  - 各ファイルのLine, Branch, Function カバレッジを記録する

- Task 2: カバレッジ基準との照合
  - Line Coverage: 80%以上（推奨90%）であることを確認する
  - Branch Coverage: 60%以上（推奨70%）であることを確認する
  - Function Coverage: 80%以上（推奨90%）であることを確認する
  - 基準未達の場合は未カバー箇所を特定する

- Task 3: カバレッジレポート作成
  - 測定結果をレポート形式でまとめる
  - カバレッジ未達の場合は改善提案を記載する
  - PASS/FAIL判定を行う

---

## 参照資料

| ドキュメント   | パス                                                                   | 説明               |
| -------------- | ---------------------------------------------------------------------- | ------------------ |
| Phase 5実装    | `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts` | カバレッジ測定対象 |
| Phase 5実装    | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`      | カバレッジ測定対象 |
| カバレッジ基準 | `coverage-standards.md` (task-specification-creator)                   | カバレッジ閾値     |

---

## 手順

### Task 1 実行手順

1. カバレッジ測定コマンドを実行する：
   ```bash
   cd apps/desktop && npx vitest run --coverage src/renderer/components/skill/__tests__/permissionDescriptions.test.ts src/renderer/components/skill/__tests__/PermissionDialog.readable.test.tsx src/renderer/components/skill/__tests__/PermissionDialog.test.tsx
   ```
2. カバレッジレポートの出力を確認する
3. ファイル別のLine, Branch, Functionカバレッジを記録する

### Task 2 実行手順

1. 以下の基準と照合する：

| 指標     | 最低基準 | 推奨基準 | 実測値（測定後記入） |
| -------- | -------- | -------- | -------------------- |
| Line     | 80%      | 90%      | （測定後記入）       |
| Branch   | 60%      | 70%      | （測定後記入）       |
| Function | 80%      | 90%      | （測定後記入）       |

2. 基準未達の場合は、未カバー行・分岐を特定する
3. Phase 6に戻って追加テストを作成する必要がある場合は、具体的な追加箇所を特定する

### Task 3 実行手順

1. カバレッジレポートを `outputs/phase-7/coverage-report.md` に出力する
2. 以下のフォーマットで記載する：
   - 全体サマリー
   - ファイル別カバレッジ
   - 未カバー箇所（ある場合）
   - PASS/FAIL判定
   - 改善提案（FAIL時のみ）

---

## カバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**FAIL時の対応**: Phase 6に戻り、不足テストを追加する。

---

## 統合テストアクション

| カテゴリ       | 確認内容                                       |
| -------------- | ---------------------------------------------- |
| テスタビリティ | カバレッジ測定ツールが正常に動作しているか確認 |

---

## 成果物

| 成果物名           | パス                                 | 種別     | 説明                     |
| ------------------ | ------------------------------------ | -------- | ------------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | document | テストカバレッジ測定結果 |

---

## 完了条件

- [ ] カバレッジ測定が実行されている
- [ ] Line Coverage が 80% 以上
- [ ] Branch Coverage が 60% 以上
- [ ] Function Coverage が 80% 以上
- [ ] カバレッジレポートが作成されている
- [ ] 成果物 `outputs/phase-7/coverage-report.md` が生成されている
- [ ] （基準未達の場合）Phase 6に戻って追加テストを作成済み

---

## 次のフェーズ

Phase 8: リファクタリング → TDD Refactor
