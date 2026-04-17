# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 6                                             |
| タスクID   | TASK-SW-STRUCT-002                            |
| 機能名     | struct-002-connect-structure-plan-to-skill-md |
| 前提Phase  | Phase 5                                       |
| 後続Phase  | Phase 7                                       |
| 作成日     | 2026-04-15                                    |
| ステータス | completed                                     |

## 目的

Phase 4 で作成した基本テストに加え、境界条件・`null` フォールバック回帰の補強テストを追加し、
テストカバレッジを向上させる。

## 実行タスク

- 境界条件テストの追加（TC-08〜TC-11）
- null フォールバック回帰の補強
- `anchors` オプショナルパターンのテスト追加
- 拡充後のテスト全件実行確認

## 参照資料

| 資料名         | パス                                                                         | 用途     |
| -------------- | ---------------------------------------------------------------------------- | -------- |
| テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` | 拡充対象 |
| Phase 2 設計書 | `outputs/phase-2/design.md`                                                  | 設計参照 |

## 追加テストケース一覧

| TC ID | テスト名                                                            | 検証内容                                                                 |
| ----- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| TC-08 | `structurePlan.anchors` が `undefined` の場合に `[]` が使われる     | `anchors ?? []` のフォールバックが機能することを検証                     |
| TC-09 | `orchestrate` モードで `structurePlan` が null のままフォールバック | `orchestrate` モードが `options.name` ベースの plan を使用することを検証 |
| TC-10 | `structurePlan.skillName` が空文字の場合の動作確認                  | 空文字の `skillName` が plan に反映される（バリデーションは別層で担保）  |
| TC-11 | `plan.workflow.trigger.keywords` が `skillName` を含む              | `keywords` 配列に `structurePlan.skillName` が含まれることを検証         |

## 実行手順

### 1. テストファイルへの追加

`apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` に以下を追加:

```typescript
describe("TC-08: anchors が undefined の場合のフォールバック", () => {
  it("structurePlan.anchors が undefined のとき [] が使われること", async () => {
    // anchors を持たない structurePlan を mock して検証
    // plan.workflow.anchors が [] であることを確認
  });
});

describe("TC-09: orchestrate モードでのフォールバック", () => {
  it("orchestrate モードで options.name ベースの plan が使われること", async () => {
    // orchestrate モードでは structurePlan が null のためフォールバック
    // plan.skillName が options.name であることを確認
  });
});

describe("TC-10: skillName が空文字の場合", () => {
  it("空文字の skillName が plan に反映されること", async () => {
    // バリデーション層ではなく plan への反映を検証
  });
});

describe("TC-11: plan.workflow.trigger.keywords に skillName が含まれる", () => {
  it("keywords 配列に structurePlan.skillName が含まれること", async () => {
    // keywords: [structurePlan.skillName] の確認
  });
});
```

### 2. 拡充後の全件実行

```bash
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts
# 期待: 全 PASS（TC-01〜TC-11）

pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/
# 期待: PASS（回帰なし）
```

## 統合テスト連携【必須】

統合テストの拡充（境界条件・null フォールバック回帰の補強）。

| 判定項目                | 基準         | 結果    |
| ----------------------- | ------------ | ------- |
| TC-08〜TC-11 の追加完了 | 全TC追加済み | pending |
| 全件テスト PASS         | TC-01〜TC-11 | pending |
| 既存テスト回帰なし      | 回帰なし     | pending |

## 多角的チェック観点

| 観点           | チェック内容                                                                            |
| -------------- | --------------------------------------------------------------------------------------- |
| anchors 境界値 | `anchors ?? []` が `undefined` と空配列の両方で正しく機能するか                         |
| モード分岐網羅 | `create` / `collaborative` / `orchestrate` の全モードでのフォールバック動作を確認したか |
| keywords 整合  | `keywords` 配列の構成が設計と一致しているか                                             |

## 成果物

| 成果物         | パス                                      | 説明                              |
| -------------- | ----------------------------------------- | --------------------------------- |
| 拡充テスト記録 | `outputs/phase-6/extended-test-record.md` | TC-08〜TC-11 追加後の全テスト記録 |

## 完了条件

- [ ] TC-08〜TC-11 が追加済み
- [ ] TC-01〜TC-11 全件が PASS している
- [ ] 既存テストが回帰なしで PASS している
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. TC-08（anchors フォールバック）追加
2. TC-09（orchestrate モードフォールバック）追加
3. TC-10（空文字 skillName）追加
4. TC-11（keywords 確認）追加
5. 拡充後の全件実行確認
6. 既存テスト回帰確認
7. 拡充テスト記録の作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 7: カバレッジ確認
