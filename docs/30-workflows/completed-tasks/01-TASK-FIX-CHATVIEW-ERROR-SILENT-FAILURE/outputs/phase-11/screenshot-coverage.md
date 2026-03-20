# Phase 11 スクリーンショットカバレッジ

## カバレッジマトリクス

| TC-ID    | 判定 | カバー対象     | 証跡ファイル                                                      | 確認ポイント                |
| -------- | ---- | -------------- | ----------------------------------------------------------------- | --------------------------- |
| TC-11-01 | PASS | 初期表示       | `outputs/phase-11/screenshots/TC-11-01-default-light.png`         | バナー非表示 / 入力可能状態 |
| TC-11-02 | PASS | API キー未設定 | `outputs/phase-11/screenshots/TC-11-02-api-key-missing-light.png` | ライトテーマのバナー表示    |
| TC-11-03 | PASS | 手動消去       | `outputs/phase-11/screenshots/TC-11-03-error-dismissed-light.png` | 閉じた後にバナーが消える    |
| TC-11-04 | PASS | API キー未設定 | `outputs/phase-11/screenshots/TC-11-04-api-key-missing-dark.png`  | ダークテーマのバナー表示    |
| TC-11-05 | PASS | 自動消去       | `outputs/phase-11/screenshots/TC-11-05-auto-cleared-dark.png`     | 5 秒後に消える              |

## 参照ルール

- `manual-test-result.md` と同じ TC-ID を使う。
- 証跡ファイル名は実体 PNG と完全一致する。
- 画像差し替え時はファイル名を変えず、内容だけ更新する。
