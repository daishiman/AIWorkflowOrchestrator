# Phase 11 スクリーンショット撮影計画

## 目的

ChatView のエラーバナー表示と消去挙動を、TC-11-01 〜 TC-11-05 の 5 枚で固定して撮影する。

## 撮影計画

| TC-ID    | 撮影対象             | 撮影条件               | 証跡ファイル                                                      | 備考                 |
| -------- | -------------------- | ---------------------- | ----------------------------------------------------------------- | -------------------- |
| TC-11-01 | default 表示         | light / エラー未発生   | `outputs/phase-11/screenshots/TC-11-01-default-light.png`         | 初期状態の基準画像   |
| TC-11-02 | api-key-missing 表示 | light / API キー未設定 | `outputs/phase-11/screenshots/TC-11-02-api-key-missing-light.png` | バナー表示の基準画像 |
| TC-11-03 | error-dismissed 表示 | light / 手動クローズ後 | `outputs/phase-11/screenshots/TC-11-03-error-dismissed-light.png` | 消去後の見え方確認   |
| TC-11-04 | api-key-missing 表示 | dark / API キー未設定  | `outputs/phase-11/screenshots/TC-11-04-api-key-missing-dark.png`  | ダークテーマ確認     |
| TC-11-05 | auto-cleared 表示    | dark / 5 秒待機後      | `outputs/phase-11/screenshots/TC-11-05-auto-cleared-dark.png`     | 自動消去確認         |

## 撮影ルール

- 画像実体は `pnpm --filter @repo/desktop screenshot:chatview-error-silent-failure` で取得し、同名 PNG が配置済みである。
- 全ての証跡は `outputs/phase-11/screenshots/` 配下に置く。
- 追加の画像が出ても、TC-ID とファイル名の対応を崩さない。
