# Phase 4: テスト作成

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| Phase        | 4                                        |
| タスクID     | TASK-SKILL-CREATOR-BEFORE-QUIT-GUARD-001 |
| ステータス   | 未実施                                   |
| 担当         | 実装者                                   |
| 見積もり時間 | 1h                                       |

## 目的

TDD Red フェーズとして既存の `RuntimeSkillCreatorFacade.notification.test.ts` を確認し、`hasRunningExecution()` の動作が AC-4・AC-5 を満たしていることを再検証する。既存の TC-B-01〜03 は確認のみで、重複ファイルは作らない。

## 実行タスク

1. 既存テスト（TC-B-01〜TC-B-03）の動作確認
2. 既存の `RuntimeSkillCreatorFacade.notification.test.ts` に TC-F-04〜TC-F-08 が含まれていることを確認
3. テストが **Green**（既実装で通過）であることを確認し、同一ファイルへ追記する
4. テスト実行コマンドの確認

## 参照資料

| 参照資料         | パス                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| Phase 2 設計     | `phase-2-design.md`                                                                               |
| Phase 3 レビュー | `phase-3-design-review.md`                                                                        |
| Facade 実装      | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                             |
| 既存テスト       | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` |
| 既存ガード       | `apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts`                                     |

## 実行手順

### ステップ 1: 既存テストの動作確認

```bash
pnpm --filter @repo/desktop test \
  apps/desktop/src/main/ipc/__tests__/beforeQuitGuard.test.ts
```

TC-B-01〜TC-B-03 が全て PASS することを確認する。

### ステップ 2: 既存テストファイルの確認

`RuntimeSkillCreatorFacade.notification.test.ts` にある以下のケースを確認する。

| ケース  | 検証内容                                                     |
| ------- | ------------------------------------------------------------ |
| TC-F-04 | `execute` 実行中は `hasRunningExecution()` が `true` を返す  |
| TC-F-05 | `execute` 完了後は `hasRunningExecution()` が `false` を返す |
| TC-F-06 | 並行2件実行中は `hasRunningExecution()` が `true` を返す     |
| TC-F-07 | 1件完了後も残り1件実行中なら `true` を維持する               |
| TC-F-08 | 全件完了後に `hasRunningExecution()` が `false` に戻る       |

### ステップ 3: テスト実行

```bash
# Facade 通知/実行状態テスト実行
pnpm --filter @repo/desktop test \
  apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts

# 全関連テスト実行
pnpm --filter @repo/desktop test --run
```

## 統合テスト連携

本 Phase は `beforeQuitGuard` と `hasRunningExecution` の **ユニットテスト** のみ。
統合テストは Phase 11 手動テストで対応。

## 成果物

| 成果物                                         | パス                                                                                              | 説明                                |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------- |
| RuntimeSkillCreatorFacade.notification.test.ts | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts` | TC-F-04〜TC-F-08 の確認・必要時追記 |

## 完了条件

- [ ] 既存 TC-B-01〜TC-B-03 が PASS することを確認
- [ ] `RuntimeSkillCreatorFacade.notification.test.ts` の TC-F-04〜TC-F-08 を確認
- [ ] 必要な追加ケースがあれば同一ファイルへ追記
- [ ] テストが Green（既実装）であることを確認

## タスク 100% 実行確認【必須】

- [ ] 全テストケース（TC-F-04〜TC-F-08）を確認した
- [ ] テスト実行を確認した
- [ ] Phase 5 実装の方向性（変更なし or 軽微な修正）を確定した

## 次 Phase

Phase 4 完了後、Phase 5（実装）に進む。
TC-F が全て Green であれば Phase 5 は「検証のみ」となる。
