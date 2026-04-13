# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 6                                                  |
| タスクID   | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001           |
| 機能名     | cronConverter 空曜日ガード処理追加                 |
| 前提Phase  | Phase 5（実装完了・Phase 4 テスト Green 確認済み） |
| 後続Phase  | Phase 7                                            |
| 作成日     | 2026-04-12                                         |
| ステータス | pending                                            |

## 目的

Phase 4 で定義したテストに加え、境界値・回帰・関連機能ケースを追加し、
`visualConfigToCron` の空文字退避ガードを広範に検証できるテストスイートを完成させる。

## 実行タスク

1. TC-07〜TC-10 を `cronConverter.edge.test.ts` に追加する
2. 既存テスト（`cronConverter.test.ts`）への回帰影響がないことを確認する

## 拡充テストシナリオ

### TC-07: 空曜日時は空文字を返す

**目的**: `weekdays: []` かつ `frequency: "weekly"` のとき、空文字 `""` が返ること。

```typescript
it("TC-07: weekdays空かつweekly → 空文字を返す", () => {
  const result = visualConfigToCron({
    frequency: "weekly",
    weekdays: [],
    hour: 9,
    minute: 0,
  });
  expect(result).toBe("");
});
```

### TC-08: weekdays の順序と重複を正規化する

**目的**: `weekdays` に重複や未ソートの値があっても、正常な cron 式に正規化されること。

```typescript
it("TC-08: weekdays の順序と重複を正規化する", () => {
  const result = visualConfigToCron({
    frequency: "weekly",
    weekdays: [5, 1, 3, 3],
    hour: 9,
    minute: 0,
  });
  expect(result).toBe("0 9 * * 1,3,5");
});
```

### TC-09: every-hour 頻度では weekdays が無視されること

**目的**: `frequency: "every-hour"` の場合、`weekdays` フィールドが存在しても
cron 式の曜日フィールドに反映されないこと。

```typescript
it("TC-09: frequency=every-hour のとき weekdays は cron 式に反映されない", () => {
  const result = visualConfigToCron({
    frequency: "every-hour",
    weekdays: [1, 3, 5],
    minute: 0,
    hour: 8,
    dayOfMonth: 1,
  });
  expect(result).toBe("0 * * * *");
});
```

### TC-10: monthly 頻度では weekdays が無視されること

**目的**: `frequency: "monthly"` の場合、`weekdays` フィールドが存在しても
cron 式の曜日フィールドに反映されないこと（月次は曜日フィールド不使用）。

```typescript
it("TC-10: frequency=monthly のとき weekdays は cron 式に反映されない", () => {
  const result = visualConfigToCron({
    frequency: "monthly",
    weekdays: [1, 3, 5], // 月水金（無視されるべき）
    hour: 8,
    minute: 0,
    dayOfMonth: 1,
  });
  expect(result).toBe("0 8 1 * *");
});
```

## 参照資料

| 資料名                     | パス                                       | 用途                       |
| -------------------------- | ------------------------------------------ | -------------------------- |
| Phase 4 テストケース       | `outputs/phase-4/test-matrix.md`           | 拡充対象のベーステスト確認 |
| Phase 5 実装結果レポート   | `outputs/phase-5/implementation-result.md` | 実装内容確認               |
| Phase 5 Green 確認レポート | `outputs/phase-5/green-confirmation.md`    | 既存 PASS ケースの確認     |

## 実行手順

### Step 1: TC-07〜TC-10 の追加

`apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts` に TC-07〜TC-10 を追記する。

### Step 2: 拡充テストの Red 確認（実装が不完全な場合）

実装が不完全なケースがある場合は Red 状態を記録してから Green にする。

### Step 3: 全件 PASS 確認

```bash
# edge テストのみ実行
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts

# 既存テストの回帰確認
pnpm vitest run apps/desktop/src/__tests__/utils/cronConverter.test.ts
```

### Step 4: 全テスト一括確認

```bash
pnpm vitest run apps/desktop/src/__tests__/utils/
```

## 統合テスト連携

テスト拡充はテストファイルへの追記のみであり、プロダクションコードへの影響はない。
TC-10（月次の曜日無視）は既存実装の動作検証であり、Phase 5 の変更とは独立している。

## サブタスク管理

| #   | サブタスク                                  | 担当   | 状態    |
| --- | ------------------------------------------- | ------ | ------- |
| 1   | TC-07〜TC-10 追加                           | 実装者 | pending |
| 2   | edge テスト全件 PASS 確認                   | 実装者 | pending |
| 3   | 既存テスト（cronConverter.test.ts）回帰確認 | 実装者 | pending |

## 成果物

| 成果物                 | パス                                       | 説明                            |
| ---------------------- | ------------------------------------------ | ------------------------------- |
| テスト拡充結果レポート | `outputs/phase-6/test-expansion-result.md` | TC-07〜TC-10 追加内容と実行結果 |

## codeArtifacts

- `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`

## 完了条件

- [ ] TC-07〜TC-10 が `cronConverter.edge.test.ts` に追加されていること
- [ ] 追加した全テストケースが Green（PASS）であること
- [ ] `cronConverter.test.ts` の既存テストが全件 PASS であること
- [ ] `outputs/phase-6/test-expansion-result.md` が作成されていること

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 7: カバレッジ確認
