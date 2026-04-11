# TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 cronConverter 空曜日ガード処理追加 - タスク指示書

## メタ情報

```yaml
issue_number: 2075
```

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001                 |
| タスク名     | cronConverter 空曜日ガード処理追加                       |
| 分類         | バグ修正（防御的プログラミング強化）                     |
| 対象機能     | `cronConverter.ts` / `visualConfigToCron`                |
| 優先度       | 中                                                       |
| 見積もり規模 | 極小規模                                                 |
| ステータス   | 未実施                                                   |
| 発見元       | TASK-UI-SCHEDULE-VISUAL-PICKER-001 Phase 12 未タスク検出 |
| 発見日       | 2026-04-09                                               |
| 前提タスク   | TASK-UI-SCHEDULE-VISUAL-PICKER-001（Phase 1-12完了済み） |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`cronConverter.ts` の `visualConfigToCron` 関数は `frequency: "weekly"` かつ `weekdays: []`（空配列）の場合に、`"0 9 * * "` のようにフィールドが空の不正な cron 式を生成してしまう。

### 1.2 問題点・課題

- UI（VisualCronPicker）側では曜日未選択時にエラーを表示しているため、通常のユーザー操作では発生しない
- しかし `visualConfigToCron` を直接 API として呼び出すコード（テスト・他コンポーネント・将来の統合）では不正な cron 式が返る可能性がある
- `"0 9 * * "` を ScheduleStore / SkillScheduler に渡すと動作未定義

### 1.3 放置した場合の影響

- 将来の統合で直接 `visualConfigToCron` を呼び出すコードが不正な cron 式を受け取り、デバッグ困難なバグになりうる
- テストで意図せず不正な式が生成されても検出されない

## 2. 何を達成するか（What）

### 2.1 目的

`visualConfigToCron` に防御的ガード処理を追加し、`weekdays: []` の場合は明示的なエラーまたは安全なフォールバック値を返すようにする。

### 2.2 最終ゴール

`visualConfigToCron({ frequency: "weekly", weekdays: [], ... })` が呼ばれた場合に、不正な cron 式を出力しない。

### 2.3 スコープ

#### 含むもの

- `cronConverter.ts` の `visualConfigToCron` 関数へのガード処理追加
- 既存テストへの空曜日ケース追加

#### 含まないもの

- UI 側の変更（VisualCronPicker のバリデーションは既に実装済み）
- バックエンドの変更

### 2.4 成果物

- 更新された `cronConverter.ts`
- 追加テストケース（`cronConverter.test.ts` または `cronConverter.edge.test.ts`）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `cronConverter.ts` が実装済みであること

### 3.2 依存タスク

なし。

### 3.3 必要な知識

- `cronConverter.ts` の `visualConfigToCron` 関数の仕様

### 3.4 推奨アプローチ

2つのアプローチが考えられる（実装者が判断する）:

**アプローチ A: 例外を投げる（厳格）**

```typescript
if (config.frequency === "weekly" && config.weekdays.length === 0) {
  throw new Error("weekdays must not be empty for weekly frequency");
}
```

**アプローチ B: フォールバック値を返す（寛容）**

```typescript
const weekdayField =
  config.weekdays.length > 0 ? config.weekdays.join(",") : "0"; // 日曜日をデフォルトに設定
```

呼び出し側で適切にエラーハンドリングされることが保証できる場合は A を推奨。

## 4. 実行手順

### Phase構成

テスト追加（Red）→ ガード処理実装（Green）→ 既存テスト回帰確認

### Phase 1: 実装

#### 手順

1. `cronConverter.edge.test.ts` に `weekdays: []` のテストケースを追加する（Red）
2. `visualConfigToCron` にガード処理を追加する（Green）
3. 全テストが PASS することを確認する

#### 完了条件

`weekdays: []` でガード処理が動作し、不正な cron 式が生成されないこと。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `{ frequency: "weekly", weekdays: [] }` で不正な cron 式が生成されない
- [ ] 正常ケース（weekdays に値あり）は引き続き PASS する

### 品質要件

- [ ] 既存テスト全件 PASS
- [ ] 追加テストケースが存在する

### ドキュメント要件

- [ ] `cronConverter.ts` の JSDoc を更新する（ガード処理の仕様を記載）

## 6. 検証方法

### テストケース

```typescript
it("weekdays が空配列の場合はエラーまたはフォールバックを返す", () => {
  const config: VisualCronConfig = {
    frequency: "weekly",
    weekdays: [],
    hour: 9,
    minute: 0,
  };
  // アプローチ A の場合:
  expect(() => visualConfigToCron(config)).toThrow();
  // アプローチ B の場合:
  expect(visualConfigToCron(config)).toBe("0 9 * * 0");
});
```

### 検証手順

```bash
pnpm vitest run src/__tests__/utils/cronConverter.test.ts
pnpm vitest run src/__tests__/utils/cronConverter.edge.test.ts
```

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                        |
| ------------------------------------ | ------ | -------- | ------------------------------------------- |
| 既存コードが空配列を渡している可能性 | 中     | 低       | grep で `weekdays: \[\]` を検索して確認する |
| フォールバック値（日曜）が不適切     | 低     | 低       | アプローチ A（例外）を優先して検討する      |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/utils/cronConverter.ts`
- `apps/desktop/src/__tests__/utils/cronConverter.edge.test.ts`
- `docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/outputs/phase-12/implementation-guide.md`

## 9. 備考

### 苦戦箇所の記録（TASK-UI-SCHEDULE-VISUAL-PICKER-001 より）

TASK-UI-SCHEDULE-VISUAL-PICKER-001 の実装中、VisualCronPicker の UI 側バリデーションが先行して実装されたため、`visualConfigToCron` 関数の防御的プログラミングが後回しになった。UI と純粋関数の責務分離において、純粋関数は UI に依存せず独自にガード処理を持つべきという教訓。

### 補足事項

UI 側のバリデーション（`weekdays.length === 0` でエラー表示）は既に実装済み。本タスクはそのガードを API レベルでも保証するための多層防御。
