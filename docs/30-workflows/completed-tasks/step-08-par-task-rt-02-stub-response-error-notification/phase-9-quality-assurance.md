# Phase 9: 品質保証

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 9                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

union 追加が自然で、過剰設計や契約ドリフトを残していないことを確認する。

## 実行タスク

- typecheck / lint / tests を実行する
- union 契約の自然さを確認する
- RT-01 / RT-03 との境界を確認する

## 参照資料

| 資料名             | パス                                        | 説明               |
| ------------------ | ------------------------------------------- | ------------------ |
| Phase 5 実装       | `phase-5-implementation.md`                 | 実装内容           |
| Phase 8 リファクタ | `phase-8-refactoring.md`                    | 共通化後の形       |
| 型定義             | `packages/shared/src/types/skillCreator.ts` | union 契約の確認先 |

## 実行手順

### 品質観点

| 観点         | 確認方法                               | 期待結果                   |
| ------------ | -------------------------------------- | -------------------------- |
| 型自然性     | `pnpm typecheck`                       | narrowing に無理がない     |
| 契約整合     | plan / improve / handoff の union 確認 | shape が一貫している       |
| UX整合       | renderer error 表示                    | false-success が消えている |
| 過剰設計排除 | `status` 系フィールド追加の不在        | 不要フィールドなし         |
| 依存境界     | RT-01 / RT-03 と責務比較               | 競合しない                 |

## 統合テスト連携

- Phase 10 で AC 充足を最終レビューする

## 成果物

| 成果物       | パス                                | 説明    |
| ------------ | ----------------------------------- | ------- |
| 品質監査結果 | `outputs/phase-9/quality-report.md` | QA 結果 |

## 完了条件

- [ ] `pnpm typecheck` / `pnpm lint` / `pnpm vitest run` の結果が記録されている
- [ ] 過剰な field 追加がない
- [ ] RT-01 / RT-03 との境界が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**
