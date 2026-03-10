# Phase 6: テスト拡充

## メタ情報

| 項目      | 値                                  |
| --------- | ----------------------------------- |
| Phase     | 6                                   |
| タスクID  | TASK-10A-G                          |
| 機能名    | task-10a-g-lifecycle-test-hardening |
| 作成日    | 2026-03-10                          |
| 前提Phase | Phase 5 完了                        |
| 次Phase   | Phase 7                             |

## 目的

Phase 5 で Green 化したテスト群の coverage を測定し、不足分岐を埋める。G1 は巨大な `skillHandlers.ts` 全体ではなく `skill:create` に対する handler-scope coverage を主指標とし、G2/G3 は targeted suite と関連ファイル coverage を併用して判断する。

## 実行タスク

- Task 1: coverage を測定する
- Task 2: 未カバー分岐を分類する
- Task 3: edge case を追加する
- Task 4: 再実行し記録を残す

### Task 1: coverage 測定

#### 測定コマンド

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx

cd apps/desktop && pnpm exec tsx scripts/coverage-by-handler.ts \
  --file src/main/ipc/skillHandlers.ts \
  --target skill:create \
  --coverage coverage/coverage-final.json
```

#### coverage 対象

| 対象                           | 主指標                  | 補助指標                                  |
| ------------------------------ | ----------------------- | ----------------------------------------- |
| G1: `skill:create` handler     | handler-scope coverage  | `skillHandlers.ts` 全体 coverage は参考値 |
| G2: lifecycle UI / store       | targeted suite coverage | 関連コンポーネント・hook の file coverage |
| G3: ChatPanel skill management | targeted suite coverage | `ChatPanel.tsx` 該当導線の file coverage  |

#### 基準値

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### Task 2: ギャップ分析

#### G1

- `description` の境界値
- `options` shape の境界
- sender 検証の失敗分岐
- service 例外と `null` 戻り値

#### G2

- `fetchSkills` の再取得連鎖
- `skillError` の更新とクリア
- `currentAnalysis` の上書き / クリア
- hook / selector stability

#### G3

- executing guard
- panel toggle の往復
- 初期状態へのリセット

### Task 3: 追加テスト作成

#### G1 追加候補

| ID        | テスト名                                          | 検証内容     |
| --------- | ------------------------------------------------- | ------------ |
| G1-EXT-01 | 超長文字列 description                            | 境界値       |
| G1-EXT-02 | Unicode description                               | 文字列処理   |
| G1-EXT-03 | `options` に余剰キーがあっても service へ透過する | object shape |
| G1-EXT-04 | sender 検証で callback window 不正時に拒否する    | セキュリティ |
| G1-EXT-05 | service 例外が内部情報を露出しない                | サニタイズ   |

#### G2 追加候補

| ID        | テスト名                                                | 検証内容   |
| --------- | ------------------------------------------------------- | ---------- |
| G2-EXT-01 | create 成功後に `fetchSkills` が重複呼出しされない      | 競合防止   |
| G2-EXT-02 | analyze 実行順序を shuffle しても状態リークしない       | 順序独立性 |
| G2-EXT-03 | improve 成功後に `currentAnalysis` が確実にクリアされる | 後処理     |
| G2-EXT-04 | selector が不要な再評価を起こさない                     | P31/P48    |

#### G3 追加候補

| ID        | テスト名                                      | 検証内容  |
| --------- | --------------------------------------------- | --------- |
| G3-EXT-01 | executing 中にクリックしても panel が開かない | guard     |
| G3-EXT-02 | 開閉を繰り返しても state leak しない          | isolation |

### Task 4: 再実行

```bash
cd apps/desktop && pnpm vitest run \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx \
  --sequence.shuffle

cd apps/desktop && pnpm vitest run --coverage \
  src/main/ipc/__tests__/skillHandlers.create.test.ts \
  src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx \
  src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx
```

## 参照資料

| 参照資料               | パス                                                                              | 使用目的                              |
| ---------------------- | --------------------------------------------------------------------------------- | ------------------------------------- |
| 品質要件               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | coverage 基準                         |
| テストパターン         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | edge case / isolation                 |
| エラー仕様             | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 異常系追加観点                        |
| 教訓                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | handler-scope coverage / shuffle 教訓 |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                              | P41 参照                              |
| Phase 5 Green レポート | `outputs/phase-5/g1-g2-g3-green-report.md`                                        | 追加対象の回帰基準                    |

## 成果物

| 成果物                  | パス                                                                                       | 説明                             |
| ----------------------- | ------------------------------------------------------------------------------------------ | -------------------------------- |
| G1 テストコード（拡充） | `apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts`                         | handler-scope を埋める追加テスト |
| G2 テストコード（拡充） | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` | lifecycle / selector 追加テスト  |
| G3 テストコード（拡充） | `apps/desktop/src/renderer/components/chat/__tests__/ChatPanel.skill-management.test.tsx`  | guard / isolation 追加テスト     |
| coverage レポート       | `outputs/phase-6/coverage-report.md`                                                       | coverage 実績                    |

## 既知の落とし穴チェックリスト

- [ ] P9: 追加テストでも reset を徹底した
- [ ] P13: タイマー使用時のみ `advanceTimersByTime` を使った
- [ ] P39: `fireEvent` を使った
- [ ] P40: `cd apps/desktop &&` で実行した
- [ ] P41: v8 coverage の解釈誤りを避けた
- [ ] `--sequence.shuffle` で順序依存を確認した

## 統合テスト連携

| 分類          | G1                     | G2             | G3              |
| ------------- | ---------------------- | -------------- | --------------- |
| 境界値        | description / options  | state reset    | toggle state    |
| 異常系        | sender / service error | `skillError`   | executing guard |
| 順序依存      | -                      | shuffle        | 開閉反復        |
| coverage 粒度 | handler-scope          | targeted suite | targeted suite  |

## 完了条件

- [ ] G1 handler-scope coverage が基準以上
- [ ] G2/G3 targeted suite coverage が基準以上
- [ ] 追加テスト後も全テスト Green
- [ ] `--sequence.shuffle` で順序依存がない
- [ ] coverage レポートが保存されている

## 次Phase

Phase 7: カバレッジ確認
