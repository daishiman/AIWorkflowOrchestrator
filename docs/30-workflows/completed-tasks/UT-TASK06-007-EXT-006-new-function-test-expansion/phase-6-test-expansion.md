# Phase 6: テスト拡充 - 新関数テスト拡充

## メタ情報

| 項目    | 値                                                     |
| ------- | ------------------------------------------------------ |
| Phase   | 6                                                      |
| 機能名  | UT-TASK06-007-EXT-006-new-function-test-expansion      |
| 作成日  | 2026-03-21                                             |
| 前Phase | [phase-5-implementation.md](phase-5-implementation.md) |

## 目的

Phase 5 の全件 PASS 確認後、追加テストが本当に必要かを再評価し、Line Coverage 95%以上の基準に対して不足がないことを判定する。今回の記録では、評価結果を「追加済み」または「69件で十分」のどちらかに固定してから Phase 7 に進む。

## 実行タスク

- Task 6-1: Phase 5 の69件 PASS を前提に追加テスト要否を判定する
- Task 6-2: 未カバー行と分岐の性質を分析する
- Task 6-3: 追加候補テストが既存69件と重複しないか評価する
- Task 6-4: 追加不要の場合は理由を記録する
- Task 6-5: 現行69件が継続して PASS することを再確認する

## 参照資料

| 資料名            | パス                                                   | 説明                       |
| ----------------- | ------------------------------------------------------ | -------------------------- |
| Phase 4成果物     | [phase-4-test-creation.md](phase-4-test-creation.md)   | 既実装テスト20件           |
| Phase 5成果物     | [phase-5-implementation.md](phase-5-implementation.md) | Green確認済み69件          |
| 対象スクリプト    | `apps/desktop/scripts/check-ipc-contracts.ts`          | カバレッジ対象ソースコード |
| テスト設計記録    | `outputs/phase-4/test-design.md`                       | Phase 4 成果物             |
| Green確認レポート | `outputs/phase-5/green-confirmation.md`                | Phase 5 成果物             |

## 実行手順

### ステップ1: カバレッジ計測

```bash
pnpm --filter @repo/desktop exec vitest run \
  scripts/__tests__/check-ipc-contracts.test.ts \
  --coverage --coverage.include='scripts/check-ipc-contracts.ts'
```

判定基準:

- Line Coverage 95%以上
- Branch Coverage 70%以上
- Function Coverage 95%以上

### ステップ2: 追加候補の再評価

Phase 4 実装と最新テストを照合した結果、以下の候補はすでに既存69件に吸収済み、または今回の達成基準には不要と判断した。

| 候補                                                  | 判定     | 理由                                                                                                         |
| ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `normalizeTypeAnnotation` の複合変換                  | 見送り   | 未カバー行は CLI 出力・終了経路に偏っており、型正規化の追加ケースでは改善しない                              |
| `isPrimitiveTypeAnnotation` の大量 union / 括弧ケース | 見送り   | 現行の union / intersection / empty / readonly / undefined / custom で要件を満たし、Branch 91.55% を達成済み |
| generic 付き `safeOn` / `safeInvoke`                  | 実施済み | T-R-05 が generic 付き `safeInvoke` / `safeOn` を同時に検証している                                          |
| `mergeChannelMaps` の存在しないファイル               | 見送り   | 今回の受入範囲は「空入力・定義なし・先勝ち」であり、例外伝播は対象外                                         |

### ステップ3: 結論

追加テストは **不要** と判断した。理由は以下の通り。

1. カバレッジ計測で Line 95.79% / Branch 91.55% / Function 100% を達成した。
2. 未カバー行（564-569, 576-584）は CLI の終了コード・report 出力分岐であり、今回追加した5関数/パターンのテスト拡張対象外だった。
3. 新規20件の内訳が Phase 1 の FR-1〜FR-4 と一致し、冗長な追加でテスト密度だけを増やす必要がなかった。

### ステップ4: 現行69件の再確認

```bash
pnpm --filter @repo/desktop exec vitest run scripts/__tests__/check-ipc-contracts.test.ts
```

期待: `Tests  69 passed (69)`

## 統合テスト連携

Phase 7 でカバレッジ基準（Line Coverage 95%以上）の充足を正式記録する。今回の判定では差し戻し不要。

## 成果物

| 成果物       | パス                                                         | 説明                               |
| ------------ | ------------------------------------------------------------ | ---------------------------------- |
| テストコード | `apps/desktop/scripts/__tests__/check-ipc-contracts.test.ts` | 追加不要判定後の最終テストファイル |

## 完了条件

- [x] Phase 5 の全69件 PASS が前提として確認されている
- [x] カバレッジ計測を実施し、95%以上であることが確認されている
- [x] 不足カバレッジ候補を評価し、追加不要の理由が記録されている
- [x] 69件が継続して PASS していること
- [x] **本Phase内の全タスクを100%実行完了**

## 次Phase

Phase 7（カバレッジ確認）に進む。今回の判定では差し戻し不要。
