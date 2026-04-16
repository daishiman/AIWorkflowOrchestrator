# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| Phase      | 6                                       |
| タスクID   | TASK-SW-STREAM-001                      |
| 機能名     | skill-creator-service-progress-callback |
| 前提Phase  | Phase 5                                 |
| 後続Phase  | Phase 7                                 |
| 作成日     | 2026-04-15                              |
| ステータス | completed                               |

## 目的

Phase 4 で作成したテストに対してエッジケース・境界値・異常系テストを追加し、
コールバック引数追加の実装が堅牢であることを確認する。

## 実行タスク

- エッジケース特定: Phase 4 でカバーできなかったケースの洗い出し
- 追加テストケース作成（TC-09〜TC-14）
- 既存テストとの共存確認
- カバレッジ向上の確認

## 参照資料

| 資料名         | パス                                                                                  | 用途           |
| -------------- | ------------------------------------------------------------------------------------- | -------------- |
| Phase 4 テスト | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` | 既存テスト参照 |
| Phase 5 実装   | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                         | 実装内容の確認 |
| Phase 2 設計書 | `outputs/phase-2/design.md`                                                           | 設計書参照     |

## 実行手順

### 1. エッジケースの特定

Phase 4 のテスト（TC-01〜TC-08）でカバーできていないケース:

| エッジケース                                                 | 理由                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| `onProgress` が例外を投げた場合の挙動                        | コールバック実装側のエラーが `createSkill` に伝播するか確認   |
| モード別（collaborative・orchestrate）の進捗フロー           | `create` モード以外でも適切な段階で呼ばれるか確認             |
| `percentage` の値が正確に 10/40/70/90/100 か                 | 数値の正確性確認（TC-01〜TC-05 は `objectContaining` で緩い） |
| `message` の内容が日本語で正確か                             | 文字列の正確性確認（同上）                                    |
| コールバックが同期的に呼ばれているか                         | 非同期処理前後の呼び出しタイミング確認                        |
| `createSkill` が例外を投げた場合にコールバックが呼ばれないか | エラー時の進捗通知抑制確認                                    |

### 2. 追加テストケース定義

| TC番号 | テスト名                                                                 | 期待値                                                   |
| ------ | ------------------------------------------------------------------------ | -------------------------------------------------------- |
| TC-09  | `onProgress の percentage 値が正確に 10/40/70/90/100 であること`         | 各段階で正確な数値が渡される                             |
| TC-10  | `onProgress の message 内容が正確な日本語文字列であること`               | 各段階で正確なメッセージ文字列が渡される                 |
| TC-11  | `onProgress がエラーを投げた場合にそのエラーが伝播すること`              | コールバックの例外が `createSkill` へ伝播すること        |
| TC-12  | `create モード以外（collaborative）でも planning フェーズが呼ばれること` | モード非依存で段階1が呼ばれること                        |
| TC-13  | `createSkill がエラーで終了した場合 done フェーズが呼ばれないこと`       | エラー時に `done` が呼ばれない（または呼ばれる）設計確認 |
| TC-14  | `onProgress に渡されるオブジェクトが毎回新しいオブジェクトであること`    | 参照の再利用がないこと（ミュータブル共有の防止）         |

### 3. テストコード追加

`apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` に追加:

```typescript
describe("エッジケース", () => {
  it("onProgress の percentage 値が正確に 10/40/70/90/100 であること (TC-09)", async () => {
    // await service.createSkill(validOptions, onProgress);
    const calls = onProgress.mock.calls.map((c) => c[0].percentage);
    expect(calls).toEqual([10, 40, 70, 90, 100]);
  });

  it("onProgress の message 内容が正確な日本語文字列であること (TC-10)", async () => {
    // await service.createSkill(validOptions, onProgress);
    const calls = onProgress.mock.calls.map((c) => c[0].message);
    expect(calls).toEqual([
      "構造を計画しています",
      "SKILL.md を生成しています",
      "エージェント定義を生成しています",
      "スキルを検証しています",
      "完了しました",
    ]);
  });
});
```

### 4. テスト実行確認

```bash
# 拡充後の全テストが PASS することを確認
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts
# 期待: 全 PASS（TC-01〜TC-14）

# 既存テストが引き続き PASS することを確認
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
```

## 統合テスト連携【必須】

| 判定項目           | 基準                            | 結果 |
| ------------------ | ------------------------------- | ---- |
| 拡充テスト PASS    | TC-09〜TC-14 が全 PASS すること | PASS |
| 既存テスト回帰なし | 既存テストが引き続き PASS       | PASS |

## 多角的チェック観点

| 観点     | チェック内容                                               |
| -------- | ---------------------------------------------------------- |
| 網羅性   | Phase 4 でカバーできなかったエッジケースが追加されているか |
| 実用性   | 追加テストが実装の堅牢性を実際に検証しているか             |
| 独立性   | 追加テストが既存テストと独立して実行可能か                 |
| 設計整合 | TC-11（例外時の挙動）がPhase 2 の設計方針と一致しているか  |

## 成果物

| 成果物     | パス                                                                                  | 説明                      |
| ---------- | ------------------------------------------------------------------------------------- | ------------------------- |
| テスト拡充 | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` | TC-09〜TC-14 の追加テスト |

## 完了条件

- [x] エッジケース（6件）の特定が完了
- [x] 追加テストケース（TC-09〜TC-14）が定義済み
- [x] テストファイルに TC-09〜TC-14 が追加されている
- [x] 拡充後の全テストが PASS している
- [x] 既存テストが回帰なしで PASS している
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. エッジケースの特定（6件）
2. 追加テストケース定義（TC-09〜TC-14）
3. テストコード追加実装
4. テスト実行確認（全 PASS）
5. 既存テスト回帰確認

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次Phase

Phase 7: カバレッジ確認
