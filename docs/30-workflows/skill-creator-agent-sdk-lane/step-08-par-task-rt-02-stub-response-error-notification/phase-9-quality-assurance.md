# Phase 9: 品質保証

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 9                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

実装全体の品質を監査し、型安全性・後方互換性・正常系非破壊・コード規約準拠を確認する。

## 実行タスク

- TypeScript 型チェックを実行する（`pnpm typecheck`）
- ESLint を実行する（`pnpm lint`）
- 型拡張の後方互換性を監査する
- 正常系パスが変更されていないことを監査する
- reason code の拡張性を確認する
- TASK-RT-01 とのマージ競合リスクを評価する

## 参照資料

| 資料名             | パス                                        | 説明                    |
| ------------------ | ------------------------------------------- | ----------------------- |
| Phase 3 レビュー   | `phase-3-design-review.md`                  | gate 判定と Minor Notes |
| Phase 5 実装       | `phase-5-implementation.md`                 | 実装内容                |
| Phase 8 リファクタ | `phase-8-refactoring.md`                    | リファクタリング結果    |
| 型定義             | `packages/shared/src/types/skillCreator.ts` | 型拡張箇所              |

## 実行手順

### ステップ1: 静的解析を実行する

```bash
pnpm typecheck
pnpm lint
```

- 型エラー 0 件を確認する。
- lint エラー 0 件を確認する。

### ステップ2: 後方互換性を監査する

| 観点                                 | 確認方法                        | 期待結果             |
| ------------------------------------ | ------------------------------- | -------------------- |
| `status` フィールドが optional か    | 型定義の `?` 確認               | 既存コードが壊れない |
| `degradedReason` が optional か      | 型定義の `?` 確認               | 既存コードが壊れない |
| 正常系で `status: "ok"` が設定される | 正常系テスト（TC-09, TC-10）    | GREEN                |
| 既存の IpcResult 型と互換性がある    | creatorHandlers.ts の型チェック | 型エラーなし         |

### ステップ3: 正常系非破壊を監査する

- plan() / execute() / improve() の正常系パスで、既存のフィールド（`skillName`, `agents`, etc.）が正しく設定されていることを確認する。
- 正常系テスト（TC-09, TC-10）が GREEN であることを確認する。
- 既存テスト（Phase 4 以前のテスト）が全て GREEN であることを確認する。

### ステップ4: reason code 拡張性を確認する

- 新しい reason code を追加する場合の変更箇所を列挙する:
  1. `SkillCreatorDegradedReason` 型にリテラルを追加
  2. `DEGRADED_REASON_MESSAGES` に対応メッセージを追加
  3. Facade の条件分岐に新しいケースを追加
- TypeScript の exhaustive check が機能することを確認する。

### ステップ5: TASK-RT-01 マージ競合リスクを評価する

- RT-01 と RT-02 が同時に `skillCreator.ts` の型を変更する可能性を確認する。
- 競合箇所: `RuntimeSkillCreatorPlanResponse` の型定義。
- 対策: RT-02 は `status` / `degradedReason` / `userMessage` のみ追加。RT-01 側の変更と重複しない。

## 統合テスト連携

- Phase 10 で最終レビューを実施する。

## 成果物

| 成果物       | パス         | 説明                     |
| ------------ | ------------ | ------------------------ |
| 品質監査結果 | Phase 9 出力 | 型・lint・互換性監査結果 |

## 完了条件

- [ ] `pnpm typecheck` がエラー 0 件で通る
- [ ] `pnpm lint` がエラー 0 件で通る
- [ ] 型拡張が後方互換性を維持している
- [ ] 正常系パスが非破壊である
- [ ] reason code の拡張性が確認されている
- [ ] TASK-RT-01 とのマージ競合リスクが評価されている
- [ ] **本Phase内の全タスクを100%実行完了**
