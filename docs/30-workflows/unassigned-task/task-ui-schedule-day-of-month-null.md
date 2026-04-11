# TASK-UI-SCHEDULE-DOM-NULL-001 DayOfMonthSelector dayOfMonth=null 時の明示的ガード処理 - タスク指示書

## メタ情報

```yaml
issue_number: 2076
```

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | TASK-UI-SCHEDULE-DOM-NULL-001                            |
| タスク名     | DayOfMonthSelector dayOfMonth=null 時の明示的ガード処理  |
| 分類         | 改善（防御的プログラミング）                             |
| 対象機能     | `cronConverter.ts` / `DayOfMonthSelector.tsx`            |
| 優先度       | 低                                                       |
| 見積もり規模 | 極小規模                                                 |
| ステータス   | 未実施                                                   |
| 発見元       | TASK-UI-SCHEDULE-VISUAL-PICKER-001 Phase 12 未タスク検出 |
| 発見日       | 2026-04-09                                               |
| 前提タスク   | TASK-UI-SCHEDULE-VISUAL-PICKER-001（Phase 1-12完了済み） |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`VisualCronConfig.dayOfMonth` は `number | null` 型で定義されている。`frequency: "monthly"` において `dayOfMonth: null` の場合、`cronConverter.ts` は初期値 `1`（1日）をデフォルトとして使用しているが、このデフォルト挙動が明示的に文書化されていない。

### 1.2 問題点・課題

- `dayOfMonth: null` が渡された場合に何が起きるかが JSDoc・テストで未定義
- 実害はないが、将来の開発者が挙動を誤解するリスクがある
- コードリーディング時に「null の場合は何が起きる？」という疑問が生じる

### 1.3 放置した場合の影響

- 将来的に `null` の意味が「デフォルト（1日）」から「未選択（無効状態）」に変わった場合にバグになりうる
- ドキュメント不足による保守コスト増大

## 2. 何を達成するか（What）

### 2.1 目的

`dayOfMonth: null` 時の挙動を明示的にドキュメント化・コード化し、将来の誤解を防ぐ。

### 2.2 最終ゴール

`visualConfigToCron({ frequency: "monthly", dayOfMonth: null, ... })` の挙動が明確化されており、テストで保護されている状態にする。

### 2.3 スコープ

#### 含むもの

- `cronConverter.ts` の `null` 処理に対する明示的ガードと JSDoc 追記
- テストケース追加（null 入力時の期待値を明確化）

#### 含まないもの

- UI の変更
- バックエンドの変更
- `dayOfMonth` の型変更

### 2.4 成果物

- `cronConverter.ts` の JSDoc 更新（null 時の挙動説明）
- テストケース追加

## 3. どのように実行するか（How）

### 3.1 前提条件

- `cronConverter.ts` が実装済みであること

### 3.2 依存タスク

なし。

### 3.3 必要な知識

- `cronConverter.ts` の月次 cron 生成ロジック

### 3.4 推奨アプローチ

最もシンプルなアプローチ:

```typescript
/**
 * @param config.dayOfMonth - 実行日。null の場合は 1日（月初）をデフォルトとして使用する
 */
const day = config.dayOfMonth ?? 1;
```

## 4. 実行手順

### Phase構成

テスト追加 → JSDoc 更新 → 確認

### Phase 1: ドキュメントとテスト追加

#### 手順

1. `cronConverter.test.ts` に `dayOfMonth: null` のテストケースを追加する
2. `cronConverter.ts` の JSDoc を更新し、`null` 時の挙動を明記する
3. 全テストが PASS することを確認する

#### 完了条件

`dayOfMonth: null` 時の挙動がテスト・JSDoc で明示されていること。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `{ frequency: "monthly", dayOfMonth: null }` のテストケースが存在し PASS する

### 品質要件

- [ ] 既存テスト全件 PASS

### ドキュメント要件

- [ ] `cronConverter.ts` の JSDoc に `null` 時の挙動が記載されている

## 6. 検証方法

### テストケース

```typescript
it("dayOfMonth が null の場合は 1日（月初）を使用する", () => {
  const config: VisualCronConfig = {
    frequency: "monthly",
    dayOfMonth: null,
    hour: 9,
    minute: 0,
  };
  expect(visualConfigToCron(config)).toBe("0 9 1 * *");
});
```

### 検証手順

```bash
pnpm vitest run src/__tests__/utils/cronConverter.test.ts
```

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                             |
| -------------------------- | ------ | -------- | -------------------------------- |
| デフォルト値変更による回帰 | 低     | 低       | テストでデフォルト値を固定化する |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/utils/cronConverter.ts`
- `apps/desktop/src/renderer/types/visualCronConfig.ts`
- `apps/desktop/src/__tests__/utils/cronConverter.test.ts`

## 9. 備考

### 苦戦箇所の記録（TASK-UI-SCHEDULE-VISUAL-PICKER-001 より）

このタスクは実害がないため TASK-UI-SCHEDULE-VISUAL-PICKER-001 のスコープでは対処しなかった。しかし「nullの場合はどうなるのか？」という問いに対して「初期値が使われる」という暗黙的な挙動に頼っているのは、将来の保守者への負債。こうした「実害なし・ドキュメントなし」のケースを段階的に解消することが、コードベースの健全性維持につながる。

### 補足事項

優先度は低。ただし他の cron 関連タスク（TASK-UI-SCHEDULE-CRON-WEEKDAYS-GUARD-001 等）と同時に実施すると効率が高い。
