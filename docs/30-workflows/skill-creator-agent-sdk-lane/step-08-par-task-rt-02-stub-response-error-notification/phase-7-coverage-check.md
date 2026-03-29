# Phase 7: カバレッジチェック

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 7                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

Phase 4〜6 で作成したテストのカバレッジを計測し、未カバー箇所を特定・補完する。

## 実行タスク

- `RuntimeSkillCreatorFacade.ts` のスタブ → エラー変換パスのカバレッジを計測する
- `creatorHandlers.ts` のエラー検出パスのカバレッジを計測する
- reason code 全パターンのカバレッジを確認する
- 未カバー行を特定し、必要に応じてテストを追加する

## 参照資料

| 資料名             | パス                                                                  | 説明                      |
| ------------------ | --------------------------------------------------------------------- | ------------------------- |
| Phase 4 テスト     | `phase-4-test-creation.md`                                            | 基本テスト TC-01〜TC-10   |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`                                           | エッジケース TC-11〜TC-16 |
| Facade             | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | カバレッジ対象            |
| IPC handler        | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | カバレッジ対象            |

## 実行手順

### ステップ1: カバレッジを計測する

```bash
pnpm vitest run --coverage \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts
```

### ステップ2: カバレッジ目標を確認する

| 対象ファイル                   | 目標行カバレッジ | 目標分岐カバレッジ |
| ------------------------------ | ---------------- | ------------------ |
| `RuntimeSkillCreatorFacade.ts` | >= 80%           | >= 80%             |
| `creatorHandlers.ts`           | >= 70%           | >= 70%             |

### ステップ3: 未カバー行を特定する

- スタブ条件分岐（plan / execute / improve）の全パスがカバーされているか確認する。
- reason code 判定ロジックの全分岐がカバーされているか確認する。
- logger.warn 呼び出しがカバーされているか確認する。

### ステップ4: 不足テストを追加する

- 未カバー行に対応するテストケースを追加する。
- 追加後に再度カバレッジを計測し目標達成を確認する。

## 統合テスト連携

- Phase 9 で最終的な品質監査を実施する。

## 成果物

| 成果物             | パス           | 説明                       |
| ------------------ | -------------- | -------------------------- |
| カバレッジレポート | vitest 出力    | 行・分岐カバレッジ計測結果 |
| 追加テスト         | テストファイル | 未カバー行補完テスト       |

## 完了条件

- [ ] `RuntimeSkillCreatorFacade.ts` の行カバレッジが目標を達成している
- [ ] `creatorHandlers.ts` の行カバレッジが目標を達成している
- [ ] reason code 全パターンがカバーされている
- [ ] スタブ条件分岐の全パスがカバーされている
- [ ] **本Phase内の全タスクを100%実行完了**
