# Light Theme Token Foundation 実装ガイド

## Part 1: 中学生向けの説明

### なぜこの対応が必要だったか

画面が明るすぎると、目が疲れて文章が読みづらくなります。今回の問題は、ライトテーマの背景が白すぎて、文字との差が小さく見える場面があったことです。

### 日常生活での例え

白いノートに黒いペンで書くと、いちばん読みやすくなります。でも、メモ欄や付箋まで全部同じ濃さだと見分けにくくなります。今回の修正は「土台は白」「大事な文字は黒」「補助情報は少しだけ薄くする」というルールを全画面でそろえる作業です。

### この機能でできること

| 機能         | 説明                                            | 例                                     |
| ------------ | ----------------------------------------------- | -------------------------------------- |
| 背景の階層化 | 白背景を基準に、カードや hover だけ段階をつける | 画面全体とカード背景を見分けやすくする |
| 文字の階層化 | 重要度で文字色を分ける                          | 見出しと補助文の読み分けがしやすい     |
| テーマ整合   | light/dark/kanagawa で同じ token 名を使う       | テーマを変えても UI の意味が崩れにくい |

## Part 2: 開発者向け実装詳細

### 型定義（TypeScript）

```typescript
interface TokenContractCheckResult {
  token: string;
  existsInLight: boolean;
  existsInDark: boolean;
  existsInKanagawa: boolean;
}

type ThemeName = "light" | "dark" | "kanagawa-dragon";
```

### APIシグネチャ / CLIシグネチャ

- APIシグネチャ: `window.electronAPI.theme.getTheme(): Promise<ThemeName>`
- CLIシグネチャ:

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/styles/tokens.light-theme.contract.test.ts
```

### 変更要点

- `tokens.css` で light background を white base、text を black base へ変更。
- `globals.css` で renderer-wide compatibility bridge を追加し、legacy neutral utility を light 基準へ補正。
- 必須 token を3テーマで定義。
- fallback なし未定義参照の検出テストを追加。

### 使用例

```typescript
const helperTextClass = "text-[var(--text-tertiary)]";
const borderClass = "border-[var(--border-primary)]";
const accentClass = "text-[var(--accent-primary)]";
```

```bash
pnpm --filter @repo/desktop exec node scripts/capture-light-theme-token-foundation-phase11.mjs
```

### エラーハンドリング

- `vitest` 失敗時は token 欠落名を先に確認し、`tokens.css` 定義漏れを修正する。
- screenshot 失敗時は dev server 起動確認（`127.0.0.1:4173`）と selector drift を確認する。

### エッジケース

- テーマ切替時に `resolvedTheme` が未設定だと light で撮影できないため、harness で query theme を許可した。
- App shell 経由で画面到達が不安定な場合は dedicated harness route を使う。

### 設定項目と定数一覧

| 項目                       | 値                      | 用途                     |
| -------------------------- | ----------------------- | ------------------------ |
| `PHASE11_CAPTURE_BASE_URL` | `http://127.0.0.1:4173` | screenshot base URL      |
| viewport                   | `1440x900`              | representative capture   |
| required tokens            | 10件                    | contract test 最低セット |
