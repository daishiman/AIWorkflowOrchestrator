# Deprecated Property Migration — ワークフローインデックス

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | TASK-FIX-13-1-DEPRECATED-PROPERTY-MIGRATION         |
| タスク名     | deprecated型プロパティの正式移行                    |
| 分類         | リファクタリング（型定義クリーンアップ）            |
| 対象機能     | 共有型定義（skill.ts）                              |
| 優先度       | 低                                                  |
| 見積もり規模 | 小規模                                              |
| ステータス   | 完了                                                |
| 完了日       | 2026-02-13                                          |
| 関連Issue    | skill-system-conflict-report #13                    |
| ブランチ     | feature/TASK-FIX-13-1-deprecated-property-migration |

---

## Phase 一覧

| Phase | 名称                   | 仕様書                                               | ステータス |
| ----- | ---------------------- | ---------------------------------------------------- | ---------- |
| 1-3   | 要件〜設計レビュー     | Phase 1-3は小規模タスクのため簡略化                  | 完了       |
| 4     | テスト作成             | TDD Red: skill-deprecated-removal.test.ts            | 完了       |
| 5     | 実装                   | deprecated定義削除、参照移行                         | 完了       |
| 6-7   | テスト拡充〜カバレッジ | 8テスト全PASS                                        | 完了       |
| 8-9   | リファクタリング〜品質 | typecheck/lint 0エラー                               | 完了       |
| 10    | 最終レビュー           | PASS                                                 | 完了       |
| 11    | 手動テスト             | grep確認で残存参照なし                               | 完了       |
| 12    | ドキュメント           | 仕様書更新、未タスク検出（UT-TYPE-DATETIME-DOC-001） | 完了       |
| 13    | 完了                   | 成果物最終確認                                       | 完了       |

---

## 成果物レジストリ

📄 [artifacts.json](artifacts.json)

---

## 関連ドキュメント

- [タスク指示書](../skill-import-agent-system/tasks/completed-task/06b-task-fix-13-1-deprecated-property-migration.md)
- [型定義仕様](../../../.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md)
- [実装教訓](../../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md)

---

## 主要成果物

| 成果物       | パス                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| 型定義更新   | `packages/shared/src/types/skill.ts`                                                               |
| 型回帰テスト | `packages/shared/src/types/__tests__/skill-deprecated-removal.test.ts`                             |
| 検出未タスク | `docs/30-workflows/unassigned-task/task-ut-type-datetime-doc-001-datetime-representation-guide.md` |
