# cronConverter weekdays=[] ガード処理追加 - タスク指示書

## メタ情報

```yaml
issue_number: 2081
task_id: TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001
status: open
priority: medium
scale: small
task_type: BUGFIX
```

| 項目         | 内容                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | TASK-CRON-CONVERTER-WEEKDAYS-GUARD-001                                 |
| タスク名     | cronConverter weekdays=[] 時の不正出力ガード処理追加                   |
| 分類         | バグ修正（API 契約堅牢化）                                             |
| 対象機能     | cronConverter / `visualConfigToCron` / weekly モード                   |
| 優先度       | 中（`priority:medium`）                                                |
| 見積もり規模 | 小規模（`scale:small`）                                                |
| ステータス   | 未実施（`status:open`）                                                |
| 発見元       | TASK-UI-SCHEDULE-VISUAL-PICKER-001 Phase 12（Task 12-4: 未タスク検出） |
| 発見日       | 2026-04-09                                                             |
| タスク分類   | BUGFIX タスク（API 契約堅牢化）                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`cronConverter.ts` の `visualConfigToCron()` 関数は、`frequency: "weekly"` で `weekdays: []`（空配列）を渡した場合に `"0 9 * * "` のような不正な cron 式を生成してしまう。

### 1.2 問題点・課題

1. **不正な cron 式の生成**: `weekdays: []` の場合、weekday フィールドが空文字になり `"0 9 * * "` という 5 フィールド構文違反の cron 式が出力される。
2. **UI 依存の安全保証**: 現在は VisualCronPicker が UI レベルで weekdays が空のまま保存できないよう制御しているが、API を直接呼び出す場合は不正な式が生成される（単一責任原則違反）。
3. **将来のリスク**: API を内部から直接呼び出すケース（バッチ処理・テスト等）で予測不可能な動作が発生する可能性がある。

### 1.3 放置した場合の影響

- `visualConfigToCron` の API 直接利用時に不正な cron 式が生成される
- UI 側の入力バリデーションに安全性が依存する（防御的設計の欠如）
- テストコードで直接呼び出す際のエラーが見つかりにくい

---

## 2. 何を達成するか（What）

### 2.1 目的

`visualConfigToCron()` が `weekdays: []` を受け取った場合に、明確なエラーを投げるか安全な既定値を返すようにし、API 契約を堅牢にする。

### 2.2 最終ゴール

`visualConfigToCron({ frequency: "weekly", weekdays: [], ... })` が：

- **Option A**: `InvalidConfigError` を投げる（API 呼び出し元に明示的に伝達）
- **Option B**: 既定値 `[0]`（日曜）を使用して有効な cron 式を返す

どちらを採用するかは Phase 2 設計で決定する。

### 2.3 スコープ

**含むもの**:

- `cronConverter.ts` の `visualConfigToCron()` に weekdays 空配列チェックを追加
- テストケース追加（`weekdays: []` / `weekdays: [0]` / `weekdays: [0, 1, 2, 3, 4]`）
- API 仕様コメント（JSDoc）の更新

**含まないもの**:

- UI 側の入力バリデーション強化（既存のまま）
- monthly / daily 等の他の frequency への影響（weekdays は weekly 専用）
- cron 式の意味論的バリデーション（別タスク: TASK-CRON-SEMANTIC-VALIDATION-001）

### 2.4 成果物

- `apps/desktop/src/renderer/utils/cronConverter.ts`（ガード追加）
- テストケース更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-UI-SCHEDULE-VISUAL-PICKER-001` の実装完了
- `cronConverter.ts` のコード理解

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識

- cron 式の weekday フィールド（0-6、0=日曜）
- TypeScript のカスタムエラークラス定義
- `visualConfigToCron` の内部実装

### 3.4 推奨アプローチ

**Option A（推奨）: InvalidConfigError を投げる**

```typescript
function weeklyToCron(config: VisualCronConfig): string {
  if (config.weekdays.length === 0) {
    throw new InvalidConfigError(
      "weekly モードでは weekdays に最低1つの曜日が必要です",
    );
  }
  // 既存の変換ロジック...
}
```

**理由**: API 契約として「weekdays が空は無効な入力」と明示することで、呼び出し元が適切に処理しやすい。UI 側は既にバリデーション済みなので影響なし。

---

## 4. 実行手順

### Phase 1-3: 要件・設計（短期）

- Option A（例外）vs Option B（既定値）の最終判断
- `InvalidConfigError` のエラー型定義
- JSDoc API 仕様の更新内容確定

### Phase 4: テスト設計

```typescript
describe("visualConfigToCron - weekly weekdays guard", () => {
  it("weekdays=[] で InvalidConfigError を投げる", () => {
    expect(() =>
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [],
        hour: 9,
        minute: 0,
        dayOfMonth: 1,
      }),
    ).toThrow(InvalidConfigError);
  });

  it("weekdays=[0] で '0 9 * * 0' を返す", () => {
    expect(
      visualConfigToCron({
        frequency: "weekly",
        weekdays: [0],
        hour: 9,
        minute: 0,
        dayOfMonth: 1,
      }),
    ).toBe("0 9 * * 0");
  });
});
```

### Phase 5: 実装

- `cronConverter.ts` の `weeklyToCron()` にガード追加
- `InvalidConfigError` クラス定義（または既存エラー型の再利用）

### Phase 6-10: テスト・レビュー

- 既存テスト 100% PASS 確認
- 新規テストケース PASS 確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `visualConfigToCron({ frequency: "weekly", weekdays: [], ... })` が `InvalidConfigError` を投げる（Option A 採用時）
- [ ] `weekdays=[0]` 等の有効なケースは既存通り動作する
- [ ] 既存テスト 100% PASS（回帰なし）

### 品質要件

- [ ] 新規テストケース PASS（`weekdays: []` / `weekdays: [0]` / `weekdays: [1, 2, 3, 4, 5]`）
- [ ] TypeScript 型エラーなし

### ドキュメント要件

- [ ] `visualConfigToCron` の JSDoc に `@throws InvalidConfigError` の記述
- [ ] API 仕様に「weekdays が空の場合の挙動」を明記

---

## 6. 検証方法

### テストケース

| 入力                              | 期待結果                  | 備考             |
| --------------------------------- | ------------------------- | ---------------- |
| `weekdays: []`                    | `InvalidConfigError`      | 空配列は不正入力 |
| `weekdays: [0]`                   | `"0 9 * * 0"`             | 日曜のみ         |
| `weekdays: [1, 2, 3, 4, 5]`       | `"0 9 * * 1,2,3,4,5"`     | 平日             |
| `weekdays: [0, 1, 2, 3, 4, 5, 6]` | `"0 9 * * 0,1,2,3,4,5,6"` | 毎日（全曜日）   |

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                           |
| -------------------------------------- | ------ | -------- | ---------------------------------------------- |
| 既存コードが `weekdays: []` で直接呼ぶ | 中     | 低       | `grep -r "visualConfigToCron" src/` で事前確認 |
| Option B 採用で UI の動作が変わる      | 低     | 低       | Option A（例外）推奨で UI への影響を回避       |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/outputs/phase-12/unassigned-task-detection.md`（MEDIUM-02）
- `apps/desktop/src/renderer/utils/cronConverter.ts`

---

## 9. 備考

### 苦戦箇所

| 項目     | 内容                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| 症状     | `weekdays: []` で不正な cron 式が生成されるが、UI ではエラー表示があるため普段は気づかない |
| 原因     | `visualConfigToCron` が呼び出し前提として「weekdays は必ず 1 件以上」を暗黙に期待していた  |
| 対応予定 | 明示的なガード + エラー投げでAPI 契約を明確化                                              |
| 再発防止 | Phase 2 設計で「入力バリデーション責務は呼び出し元 vs 変換関数どちらが持つか」を決定する   |

### 発見経緯

TASK-UI-SCHEDULE-VISUAL-PICKER-001 の Phase 12 (Task 12-4: 未タスク検出) において MEDIUM-02 として検出。UI レベルでの防御により実害は現在なしだが、API 契約の堅牢化のためフォローアップタスクとして分離した。

実装規模が小さいため、`TASK-CRON-SEMANTIC-VALIDATION-001`（MEDIUM-01）より先に着手することを推奨する。
