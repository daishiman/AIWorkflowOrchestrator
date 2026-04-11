# TASK-UI-SCHEDULE-HUMANIZER-I18N-001 cronHumanizer 多言語（zh/ko等）対応 - タスク指示書

## メタ情報

```yaml
issue_number: 2077
```

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | TASK-UI-SCHEDULE-HUMANIZER-I18N-001                      |
| タスク名     | cronHumanizer 多言語（zh/ko等）対応                      |
| 分類         | 機能追加（国際化）                                       |
| 対象機能     | `cronHumanizer.ts`                                       |
| 優先度       | 低                                                       |
| 見積もり規模 | 小規模                                                   |
| ステータス   | 未実施                                                   |
| 発見元       | TASK-UI-SCHEDULE-VISUAL-PICKER-001 Phase 12 未タスク検出 |
| 発見日       | 2026-04-09                                               |
| 前提タスク   | TASK-UI-SCHEDULE-VISUAL-PICKER-001（Phase 1-12完了済み） |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`cronHumanizer.ts` の `humanizeCron` 関数は `locale: "ja" | "en"` のみをサポートしている。アプリが将来的に中国語（zh）・韓国語（ko）等の言語ユーザーを対象とする場合、スケジュール設定のプレビューテキストが英語または日本語で表示されてしまう。

### 1.2 問題点・課題

- 現在のロケール型定義が `"ja" | "en"` に固定されており、追加が容易ではない
- 各言語の曜日名・月名・頻度表現を網羅するための翻訳データが不足している

### 1.3 放置した場合の影響

- 多言語対応が必要になった際に、`cronHumanizer.ts` の大規模改修が必要になる
- ロケール型定義の変更が型安全性を損なうリスクがある

## 2. 何を達成するか（What）

### 2.1 目的

`cronHumanizer.ts` の国際化アーキテクチャを整備し、新しいロケール（zh/ko等）を追加しやすい構造にする。

### 2.2 最終ゴール

`humanizeCron(expr, { locale: "zh" })` のように呼び出すことで、中国語テキストが返る状態にする。

### 2.3 スコープ

#### 含むもの

- `cronHumanizer.ts` の翻訳データ構造のリファクタリング（ロケールマップ化）
- 少なくとも zh（中国語簡体字）のロケールデータ追加
- 既存 ja/en テストの回帰確認

#### 含まないもの

- UI のロケール切り替え機能
- バックエンドの変更
- ko/fr/de等の全言語対応（zh のみを最初の拡張例として追加）

### 2.4 成果物

- リファクタリングされた `cronHumanizer.ts`（ロケールマップ構造）
- zh ロケールデータ
- テストケース追加

## 3. どのように実行するか（How）

### 3.1 前提条件

- `cronHumanizer.ts` が実装済みであること

### 3.2 依存タスク

なし。

### 3.3 必要な知識

- i18n 設計パターン（ロケールマップ・フォールバック）
- 中国語の曜日・時間表現

### 3.4 推奨アプローチ

現在の実装（言語別 if/else）をロケールマップ方式に変更する:

```typescript
const LOCALE_DATA: Record<string, LocaleMessages> = {
  ja: { weekdays: ["日", "月", "火", "水", "木", "金", "土"], ... },
  en: { weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], ... },
  zh: { weekdays: ["日", "一", "二", "三", "四", "五", "六"], ... },
};

function humanizeCron(expr: string, options: { locale?: string } = {}): string {
  const locale = options.locale ?? "ja";
  const messages = LOCALE_DATA[locale] ?? LOCALE_DATA["en"]; // fallback to English
  // ...
}
```

フォールバック（未対応ロケールは英語）を実装することで、新ロケール追加前でも動作を保証する。

## 4. 実行手順

### Phase構成

設計（ロケールマップ化）→ zh 追加 → テスト拡充 → 回帰確認

### Phase 1: リファクタリング

#### 手順

1. `cronHumanizer.ts` のロケール処理を `LOCALE_DATA` マップに抽出する
2. 既存 ja/en テストが引き続き PASS することを確認する

#### 成果物

- リファクタリング済み `cronHumanizer.ts`

### Phase 2: zh ロケール追加

#### 手順

1. zh の翻訳データを `LOCALE_DATA` に追加する
2. zh のテストケースを追加する

#### 完了条件

`humanizeCron("0 9 * * 1", { locale: "zh" })` が `"毎週一曜日の09:00"` 相当の中国語テキストを返すこと。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `humanizeCron("0 9 * * 1", { locale: "zh" })` が中国語テキストを返す
- [ ] 未対応ロケールは英語にフォールバックする

### 品質要件

- [ ] 既存 ja/en テスト全件 PASS
- [ ] zh テストケースが追加されている

### ドキュメント要件

- [ ] `cronHumanizer.ts` の JSDoc に対応ロケール一覧が記載されている

## 6. 検証方法

### テストケース

```typescript
describe("zh ロケール", () => {
  it("毎週月曜を中国語で説明できる", () => {
    expect(humanizeCron("0 9 * * 1", { locale: "zh" })).toContain("一");
  });
});
```

### 検証手順

```bash
pnpm vitest run src/__tests__/utils/cronHumanizer.test.ts
```

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                              |
| ------------------------------------ | ------ | -------- | ------------------------------------------------- |
| 翻訳の不正確さ                       | 低     | 中       | ネイティブスピーカーによるレビューを推奨          |
| ロケールマップ化による既存テスト破壊 | 中     | 低       | リファクタリング前後でスナップショット比較        |
| フォールバック挙動の未テスト         | 低     | 中       | `{ locale: "fr" }` 等のフォールバックテストを追加 |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/utils/cronHumanizer.ts`
- `apps/desktop/src/__tests__/utils/cronHumanizer.test.ts`
- `docs/30-workflows/TASK-UI-SCHEDULE-VISUAL-PICKER-001/outputs/phase-12/implementation-guide.md`

## 9. 備考

### 苦戦箇所の記録（TASK-UI-SCHEDULE-VISUAL-PICKER-001 より）

TASK-UI-SCHEDULE-VISUAL-PICKER-001 の実装中、`cronHumanizer.ts` の英語ブランチで曜日範囲表示時のカバレッジ漏れが発生した（Phase 7 で発見）。現状の if/else 構造は、言語ごとに分岐が増えるにつれて保守が困難になる。ロケールマップ方式への移行により、この問題を根本的に解消できる。

カバレッジ確認（Phase 7）でインクリメンタルに発見される英語ブランチ漏れは、if/else 構造の弱点を示している。

### 補足事項

優先度は低。ただしアプリの多言語対応方針が決まった段階で早期に対処することを推奨する。ロケールマップ化は i18n ライブラリ（react-i18next 等）導入前の暫定対応として有効。
