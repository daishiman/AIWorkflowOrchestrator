# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 6                                      |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 前提Phase  | Phase 5                                |
| 後続Phase  | Phase 7                                |
| 作成日     | 2026-04-15                             |
| ステータス | completed                              |

## 目的

Phase 4 で作成した基本テストに加え、エッジケース・`sendSkillCreatorProgress` 呼び出し確認テストを追加し、
テストカバレッジを向上させる。

## 実行タスク

- エッジケーステストの追加（TC-09〜TC-12）
- `sendSkillCreatorProgress` 呼び出し回数・順序の検証テスト追加
- `SkillCreateWizard.tsx` props 接続の追加テスト（必要な場合）
- 拡充後のテスト全件実行確認

## 参照資料

| 資料名                  | パス                                                                        | 用途     |
| ----------------------- | --------------------------------------------------------------------------- | -------- |
| Phase 4 テストファイル  | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` | 拡充対象 |
| Phase 2 設計書          | `outputs/phase-2/design.md`                                                 | 設計参照 |
| skillCreatorHandlers.ts | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                         | 実装確認 |

## 追加テストケース一覧

| TC ID | テスト名                                            | 検証内容                                                                               |
| ----- | --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| TC-09 | 5段階全ての進捗フェーズが順序通り送信される         | planning → generating-skill → generating-agents → validating → done の順で呼ばれること |
| TC-10 | sendSkillCreatorProgress が合計5回呼ばれる          | コールバックが正確に5回呼ばれることを `toHaveBeenCalledTimes(5)` で検証                |
| TC-11 | onProgress コールバックなしの既存呼び出しが動作する | `createSkill(validatedArgs)` 形式（コールバックなし）でエラーが発生しないこと          |
| TC-12 | percentage が 0〜100 の範囲内であること             | 各フェーズの percentage が有効な範囲内であることを検証                                 |

## 実行手順

### 1. テストファイルへの追加

`apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` に以下を追加:

```typescript
describe("TC-09: 5段階全ての進捗フェーズが順序通り送信される", () => {
  it("planning → generating-skill → generating-agents → validating → done の順で呼ばれること", async () => {
    const callOrder: string[] = [];
    // 各コールバック呼び出し時にフェーズを記録して順序を検証
  });
});

describe("TC-10: sendSkillCreatorProgress が合計5回呼ばれる", () => {
  it("コールバックが正確に5回呼ばれること", async () => {
    // toHaveBeenCalledTimes(5) で検証
  });
});

describe("TC-11: onProgress コールバックなしの既存呼び出しが動作する", () => {
  it("コールバックなしでエラーが発生しないこと", async () => {
    // STREAM-001 の後方互換性確認（ハンドラー側での影響なし）
  });
});

describe("TC-12: percentage が 0〜100 の範囲内であること", () => {
  it("各フェーズの percentage が有効範囲内であること", async () => {
    // percentage >= 0 && percentage <= 100 を検証
  });
});
```

### 2. 拡充後の全件実行

```bash
# 拡充後のテスト全件実行
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts
# 期待: 全 PASS（TC-01〜TC-12）

# 既存テストの回帰確認
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/
# 期待: PASS（回帰なし）
```

## 統合テスト連携【必須】

統合テストの拡充（全カテゴリのカバレッジ向上）。

| 判定項目                | 基準         | 結果    |
| ----------------------- | ------------ | ------- |
| TC-09〜TC-12 の追加完了 | 全TC追加済み | pending |
| 全件テスト PASS         | TC-01〜TC-12 | pending |
| 既存テスト回帰なし      | 回帰なし     | pending |

## 多角的チェック観点

| 観点             | チェック内容                                                        |
| ---------------- | ------------------------------------------------------------------- |
| 呼び出し順序     | 5段階のフェーズが正しい順序で送信されることを検証しているか         |
| 呼び出し回数     | `sendSkillCreatorProgress` が正確に5回呼ばれることを検証しているか  |
| 後方互換性テスト | コールバックなしの呼び出しも正常動作することを検証しているか        |
| 境界値テスト     | percentage の境界値（0・100）が正しく処理されることを検証しているか |

## 成果物

| 成果物             | パス                                                                        | 説明                          |
| ------------------ | --------------------------------------------------------------------------- | ----------------------------- |
| 拡充テストスイート | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` | TC-09〜TC-12 追加後の全テスト |

## 完了条件

- [ ] TC-09〜TC-12 が追加済み
- [ ] TC-01〜TC-12 全件が PASS している
- [ ] 既存テストが回帰なしで PASS している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. TC-09（呼び出し順序）追加
2. TC-10（呼び出し回数）追加
3. TC-11（後方互換性）追加
4. TC-12（percentage 境界値）追加
5. 拡充後の全件実行確認
6. 既存テスト回帰確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 7: カバレッジ確認
