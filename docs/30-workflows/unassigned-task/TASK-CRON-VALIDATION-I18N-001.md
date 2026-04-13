# cronバリデーションエラーメッセージ i18n 対応 - タスク指示書

## メタ情報

| 項目         | 内容                                                |
| ------------ | --------------------------------------------------- |
| タスクID     | TASK-CRON-VALIDATION-I18N-001                       |
| タスク名     | cronバリデーションエラーメッセージ i18n 対応        |
| 分類         | 改善                                                |
| タスク種別   | non_visual                                          |
| 対象機能     | スケジュール設定バリデーション                      |
| 優先度       | 低                                                  |
| 見積もり規模 | 小規模                                              |
| ステータス   | 未着手                                              |
| 発見元       | TASK-CRON-SEMANTIC-VALIDATION-001 Phase 12 申し送り |
| 発見日       | 2026-04-12                                          |
| GitHub Issue | #2112                                               |
| 関連Issue    | #2082 延長改善                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-CRON-SEMANTIC-VALIDATION-001` の実装において、cronバリデーションのエラーメッセージを
`CRON_VALIDATION_ERRORS` 定数として中央管理する設計が採用された。

現在の `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts` では、
エラーメッセージが日本語にハードコードされている。

```typescript
const CRON_VALIDATION_ERRORS = {
  EMPTY: "cron式を入力してください",
  INVALID_FORMAT: "cron式の形式が正しくありません",
  INVALID_DATE: "指定した日付は存在しません（例: 2月31日）",
} as const;
```

また `validateTimezone` / `validateCronExpression` 内にも以下のようにインラインで
日本語メッセージが含まれている。

```typescript
return `cron式は5フィールド必要です（現在: ${fields.length}フィールド）`;
return "タイムゾーンを入力してください";
return `無効なタイムゾーンです: ${value}`;
```

### 1.2 問題点・課題

アプリが将来的に多言語展開（英語・中国語等）をサポートする場合、
文字列を直接書き換える手術的な修正が多数の箇所で必要になる。
現状は定数 `CRON_VALIDATION_ERRORS` で日本語文字列を管理しているため、
i18n 対応時の変更箇所は最小化されているが、翻訳辞書と共存させる仕組みが存在しない。

### 1.3 放置した場合の影響

- 多言語対応の際に `scheduleConfigValidator.ts` の全エラーメッセージを手動で書き換える必要がある
- インライン文字列（フィールド数エラー・タイムゾーンエラー）はコンスタント管理外であり、見落としリスクがある
- `as const` による TypeScript 型推論（文字列リテラル型）の恩恵を活かしたまま翻訳辞書と接続する設計が自明でない

---

## 2. 何を達成するか（What）

### 2.1 目的

`CRON_VALIDATION_ERRORS` 定数（および関数内インライン文字列）を i18n 翻訳辞書と接続できる形に
リファクタリングし、将来の多言語対応コストをゼロに近づける。

### 2.2 最終ゴール

- `scheduleConfigValidator.ts` のすべてのユーザー向けエラーメッセージが、
  翻訳キーまたは翻訳関数経由で返却される状態
- 既存の日本語テストが破壊されず、かつ i18n キーへの切り替えもテスト可能な状態
- TypeScript の型安全性（`as const` / リテラル型）が維持されている状態

### 2.3 スコープ

#### 含むもの

- `CRON_VALIDATION_ERRORS` 定数の翻訳キー化（または翻訳関数注入）
- `validateCronExpression` / `validateTimezone` 内のインライン日本語文字列の整理
- 既存 i18n ライブラリの有無調査（`next-i18next` / `react-i18next` / `i18next` 等）
- 既存ライブラリが存在しない場合の最小構成設計（翻訳辞書ファイルの配置案）
- 既存ユニットテストの i18n 対応（テストが日本語文字列に直接依存しない形への修正）

#### 含まないもの

- UI コンポーネント側（`ScheduleDialog` / `ConversationRoundStep`）の翻訳対応
- アプリ全体の i18n 基盤整備（本タスクはバリデーション層のみを対象とする）
- 英語以外のロケール翻訳辞書の作成（日本語・英語の2言語を最小ゴールとする）

### 2.4 成果物

- リファクタリング済み `scheduleConfigValidator.ts`
- 翻訳辞書ファイル（例: `locales/ja/scheduleValidator.json` / `locales/en/scheduleValidator.json`）
- 修正済みユニットテスト（`scheduleConfigValidator.test.ts` / `scheduleConfigValidator.edge.test.ts`）

---

## 3. どのように実装するか（How）

### 3.1 前提条件

- プロジェクトに既存 i18n ライブラリが導入済みかを先に確認する
- 既存ライブラリが存在する場合はその API に従う
- 存在しない場合は「翻訳関数を外部から注入するパターン」で最小設計を行う

### 3.2 依存タスク

なし（単独実行可能）

### 3.3 必要な知識

- TypeScript `as const` とリテラル型の仕組み
- i18n 設計の基本（翻訳キー / 翻訳辞書 / 翻訳関数 `t(key)` パターン）
- `next-i18next` または `react-i18next` の基本的な使い方（既存ライブラリが判明した場合）
- 依存性注入（Dependency Injection）の基本概念

### 3.4 推奨アプローチ

#### アプローチA: 翻訳関数注入パターン（既存 i18n ライブラリ不明時の最小実装）

`validateCronExpression` / `validateTimezone` に翻訳関数 `t` を引数として受け取る形にする。
デフォルト値に日本語フォールバック関数を設定することで、既存呼び出し元の変更を最小化できる。

```typescript
// 翻訳キー定義（型安全を保つ）
export const CRON_VALIDATION_KEYS = {
  EMPTY: "cron.validation.empty",
  INVALID_FORMAT: "cron.validation.invalidFormat",
  INVALID_DATE: "cron.validation.invalidDate",
  FIELD_COUNT: "cron.validation.fieldCount",
  INVALID_TIMEZONE: "cron.validation.invalidTimezone",
  EMPTY_TIMEZONE: "cron.validation.emptyTimezone",
} as const;

export type CronValidationKey =
  (typeof CRON_VALIDATION_KEYS)[keyof typeof CRON_VALIDATION_KEYS];

// 翻訳関数の型
type TranslateFn = (
  key: CronValidationKey,
  params?: Record<string, unknown>,
) => string;

// 日本語フォールバック辞書（移行期間中の後方互換）
const JA_FALLBACK: Record<CronValidationKey, string> = {
  [CRON_VALIDATION_KEYS.EMPTY]: "cron式を入力してください",
  [CRON_VALIDATION_KEYS.INVALID_FORMAT]: "cron式の形式が正しくありません",
  [CRON_VALIDATION_KEYS.INVALID_DATE]:
    "指定した日付は存在しません（例: 2月31日）",
  [CRON_VALIDATION_KEYS.FIELD_COUNT]: "cron式は5フィールド必要です",
  [CRON_VALIDATION_KEYS.INVALID_TIMEZONE]: "無効なタイムゾーンです",
  [CRON_VALIDATION_KEYS.EMPTY_TIMEZONE]: "タイムゾーンを入力してください",
};

const defaultT: TranslateFn = (key, params) => {
  let msg = JA_FALLBACK[key] ?? key;
  // 簡易パラメータ展開（例: {count} → 実値）
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      msg = msg.replace(`{${k}}`, String(v));
    });
  }
  return msg;
};

export function validateCronExpression(
  value: string,
  t: TranslateFn = defaultT,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return t(CRON_VALIDATION_KEYS.EMPTY);

  const fields = trimmed.split(/\s+/);
  if (fields.length !== 5) {
    return t(CRON_VALIDATION_KEYS.FIELD_COUNT, { count: fields.length });
  }
  // ... 以降のバリデーションロジックは変更なし
}
```

#### アプローチB: 既存 i18n ライブラリ連携パターン（`react-i18next` が導入済みの場合）

```typescript
// react-i18next の useTranslation フックから取得した t 関数を渡す
import { useTranslation } from "react-i18next";

function ScheduleDialogForm() {
  const { t } = useTranslation("scheduleValidator");
  const errors = validateSkillWizardScheduleConfig(config, t);
  // ...
}
```

#### 翻訳辞書ファイルの配置案

```
apps/desktop/src/locales/
  ja/
    scheduleValidator.json   # 日本語（現行の日本語文字列をそのまま移植）
  en/
    scheduleValidator.json   # 英語翻訳
```

```json
// locales/ja/scheduleValidator.json
{
  "cron": {
    "validation": {
      "empty": "cron式を入力してください",
      "invalidFormat": "cron式の形式が正しくありません",
      "invalidDate": "指定した日付は存在しません（例: 2月31日）",
      "fieldCount": "cron式は5フィールド必要です（現在: {{count}}フィールド）",
      "invalidTimezone": "無効なタイムゾーンです: {{value}}",
      "emptyTimezone": "タイムゾーンを入力してください"
    }
  }
}
```

```json
// locales/en/scheduleValidator.json
{
  "cron": {
    "validation": {
      "empty": "Please enter a cron expression",
      "invalidFormat": "Invalid cron expression format",
      "invalidDate": "The specified date does not exist (e.g., Feb 31)",
      "fieldCount": "Cron expression requires 5 fields (current: {{count}} fields)",
      "invalidTimezone": "Invalid timezone: {{value}}",
      "emptyTimezone": "Please enter a timezone"
    }
  }
}
```

### 3.5 既存テストの修正方針

現在のテストは日本語文字列に直接依存している。i18n 対応後は以下のいずれかで対応する。

**方針1（推奨）**: テストでもデフォルト翻訳関数（`defaultT`）を使用し、期待値を翻訳キーではなく
日本語フォールバック文字列のまま保持する。後方互換を維持しつつ、翻訳キー単体のテストを別途追加する。

**方針2**: テストに翻訳キーを期待値として使うモック `t` 関数を渡し、
ビジネスロジックの正しさを翻訳キーで検証する。

```typescript
// 方針2のテスト例
const mockT: TranslateFn = (key) => key; // キーをそのまま返す

it("空文字のとき EMPTY キーを返す", () => {
  expect(validateCronExpression("", mockT)).toBe(CRON_VALIDATION_KEYS.EMPTY);
});
```

---

## 4. 苦戦箇所記録（前回タスクからの知見）

以下は `TASK-CRON-SEMANTIC-VALIDATION-001` での苦戦箇所として、
Phase 12 `skill-feedback-report.md` に記録された内容です。本タスク実施時の参考にしてください。

### 4.1 Phase 11 スクリーンショットの CI 自動化が困難

Phase 11（手動テスト）のスクリーンショット取得はアプリ起動環境が必要なため、
CI パイプラインでの自動実行が難しかった。
本タスク（non_visual）では UI 変更が発生しないため、Phase 11 は N/A または
「テスト出力ログのみ」で代替可能とする。

### 4.2 進捗表の completed 同期忘れ

Phase 1〜12 の進捗表を実装完了時に `completed` へ同期し忘れるケースが発生した。
本タスクでは Phase 完了直後に進捗表を更新するチェックリストを Phase ごとに設ける。

### 4.3 `as const` と翻訳辞書の共存設計

`CRON_VALIDATION_ERRORS` は `as const` により TypeScript の文字列リテラル型が得られており、
誤タイプ防止に効果的だった。

i18n 対応では「翻訳キーを `as const` で型安全に管理しつつ、翻訳関数に渡す」設計が
`as const` の恩恵を維持したまま翻訳辞書と共存させる有力な方式である。

具体的には以下のトレードオフを検討すること。

| 方式                             | TypeScript 型安全 | 翻訳辞書との共存 | 既存コードへの影響     |
| -------------------------------- | ----------------- | ---------------- | ---------------------- |
| `as const` キー定数 + 注入 `t`   | 高                | 容易             | 最小（引数追加のみ）   |
| エラーメッセージを直接文字列返却 | 低（現状）        | 困難             | なし                   |
| Zod `.message()` への移行        | 中                | 要検討           | 大（スキーマ書き換え） |

**推奨**: アプローチA（翻訳関数注入パターン）を採用し、`CRON_VALIDATION_KEYS` を
`as const` で管理する方式。

---

## 5. 受け入れ基準

### 機能要件

- [ ] `scheduleConfigValidator.ts` のすべてのユーザー向けエラーメッセージが、
      翻訳キー定数 (`CRON_VALIDATION_KEYS`) 経由で管理されている
- [ ] `validateCronExpression` / `validateTimezone` / `validateSkillWizardScheduleConfig` が
      翻訳関数 `t` を受け取れるシグネチャになっている
- [ ] `t` 引数を省略した場合は日本語フォールバック（現行動作）を維持する
- [ ] 日本語翻訳辞書ファイルが作成されている（`locales/ja/scheduleValidator.json`）
- [ ] 英語翻訳辞書ファイルが作成されている（`locales/en/scheduleValidator.json`）

### 品質要件

- [ ] `pnpm --filter @repo/desktop test` が全テスト PASS
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0件
- [ ] `pnpm --filter @repo/desktop lint` が警告 0件
- [ ] 既存の `scheduleConfigValidator.test.ts` / `scheduleConfigValidator.edge.test.ts` が
      変更後も PASS（後方互換維持）

### ドキュメント要件

- [ ] Phase 12 close-out 時に本ファイル（TASK-CRON-VALIDATION-I18N-001.md）の
      ステータスを「完了」に更新する

---

## 6. 実行 Phase 構成

| Phase | 内容                                          | 目安 |
| ----- | --------------------------------------------- | ---- |
| 1     | 既存 i18n ライブラリ調査・設計決定            | 0.5h |
| 2     | 翻訳キー定数 / 翻訳辞書ファイル作成           | 0.5h |
| 3     | `scheduleConfigValidator.ts` リファクタリング | 1h   |
| 4     | テスト修正・新規テスト追加                    | 1h   |
| 5     | 品質確認（typecheck / lint / test）           | 0.5h |
| 6     | ドキュメント更新・PR 作成                     | 0.5h |

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                                  |
| -------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------- |
| 既存 i18n ライブラリが存在せず基盤整備が必要になる | 高     | 中       | アプローチA（翻訳関数注入）で i18n ライブラリ非依存の最小実装に留める |
| `t` 引数追加により既存呼び出し元のコンパイルエラー | 中     | 低       | `t` をオプション引数（デフォルト `defaultT`）にして後方互換を維持する |
| テストが翻訳文字列に依存していて修正コストが高い   | 中     | 中       | 方針1（フォールバック文字列をそのまま期待値に使用）で対応する         |
| `as const` キー定数と辞書ファイルのキーが乖離する  | 低     | 低       | TypeScript の `keyof` + 辞書型で乖離をコンパイル時に検出する          |

---

## 8. 参照情報

### 関連ファイル

- 対象ファイル: `apps/desktop/src/renderer/utils/scheduleConfigValidator.ts`
- 関連テスト: `apps/desktop/src/__tests__/utils/scheduleConfigValidator.test.ts`
- 関連テスト: `apps/desktop/src/__tests__/utils/scheduleConfigValidator.edge.test.ts`
- 関連 UI consumer: `apps/desktop/src/renderer/views/ScheduleManager/components/ScheduleDialog.tsx`
- 関連 UI consumer: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`

### 関連タスク・Issue

- 前タスク: `docs/30-workflows/TASK-CRON-SEMANTIC-VALIDATION-001/`
- 関連 GitHub Issue: #2082
- 申し送り元: `docs/30-workflows/TASK-CRON-SEMANTIC-VALIDATION-001/outputs/phase-12/skill-feedback-report.md`

### 参考資料

- [react-i18next 公式ドキュメント](https://react.i18next.com/)
- [i18next 公式ドキュメント](https://www.i18next.com/)
- TypeScript `as const` リテラル型: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types
