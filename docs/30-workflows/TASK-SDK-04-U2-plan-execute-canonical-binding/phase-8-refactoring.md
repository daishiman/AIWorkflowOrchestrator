# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 8                                             |
| Phase名    | リファクタリング                              |
| 対象機能   | TASK-SDK-04-U2-plan-execute-canonical-binding |
| 前提Phase  | Phase 7: カバレッジ確認                       |
| 次Phase    | Phase 9: 品質保証                             |
| ステータス | completed                                     |
| 作成日     | 2026-03-27                                    |

## 目的

owner 分離後の重複や説明不足を整理し、必要最小限の複雑性で maintainability を上げる。

## 実行タスク

### Task 1: 命名整理

- draft / approved / current plan の名称を混在させない

### Task 2: clear 動作整理

- state clear の責務を対称化し、片消しを防ぐ

## 参照資料

| 資料名         | パス                                                                 | 説明                       |
| -------------- | -------------------------------------------------------------------- | -------------------------- |
| 要件成果物     | `outputs/phase-1/requirements-definition.md`                         | 守るべき AC                |
| 設計成果物     | `outputs/phase-2/design-document.md`                                 | owner 分離原則             |
| 実装記録       | `outputs/phase-5/implementation-record.md`                           | 整理対象の本体             |
| テスト拡充記録 | `outputs/phase-6/extended-test-record.md`                            | 壊してはいけない境界ケース |
| カバレッジ     | `phase-7-coverage-check.md`                                          | 重複削減候補               |
| 実装           | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 整理対象                   |

## 統合テスト連携

- リファクタ後も drift 検出テストの観測点を変えない
- 命名整理がテスト expectation を壊していないことを確認する

## 成果物

| 成果物               | パス                                    | 説明       |
| -------------------- | --------------------------------------- | ---------- |
| リファクタリング記録 | `outputs/phase-8/refactoring-record.md` | 簡素化判断 |

## 完了条件

- [ ] 命名と責務が整理されている
- [ ] clear 動作が対称である
- [ ] 不要な分岐が増えていない
- [ ] 最小複雑性の判断理由が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
