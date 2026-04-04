# Phase 11: 手動テスト事前確認表

## メタ情報

| 項目     | 内容                               |
| -------- | ---------------------------------- |
| Phase    | 11                                 |
| 対象機能 | UT-RT-06-ESBUILD-ARCH-MISMATCH-001 |
| 分類     | NON_VISUAL                         |
| 作成日   | 2026-03-30                         |

## チェック対象

| TC-ID | Task | No  | テスト項目               | 操作手順                                         | 期待結果                           |
| ----- | ---- | --- | ------------------------ | ------------------------------------------------ | ---------------------------------- |
| TC-01 | 1    | 1   | Node.js arch 確認        | `node -e "console.log(process.arch)"`            | install/run の arch 一致           |
| TC-02 | 1    | 2   | esbuild バイナリ存在確認 | `ls node_modules/.pnpm/ \| grep @esbuild+darwin` | current arch 対応の darwin-\* 存在 |
| TC-03 | 1    | 3   | Node.js platform 確認    | `node -e "console.log(process.platform)"`        | `darwin`                           |
| TC-04 | 2    | 1   | vitest 起動確認          | `pnpm vitest run`                                | esbuild エラーなし                 |
| TC-05 | 2    | 2   | テスト結果記録           | vitest 出力確認                                  | テスト件数・結果あり               |
| TC-06 | 2    | 3   | esbuild エラー不在確認   | 出力に esbuild 含まないか                        | エラーなし                         |
| TC-07 | 3    | 1   | RT-06 SDK 正規化テスト   | `pnpm vitest run ...sdk-normalization.test.ts`   | PASS/FAIL 判定あり                 |
| TC-08 | 3    | 2   | テスト件数記録           | 上記結果の件数確認                               | 全件数記録                         |
| TC-09 | 4    | 1   | ドキュメント存在確認     | prevention-procedure.md 存在確認                 | ファイル存在                       |
| TC-10 | 4    | 2   | 手順の明確性確認         | 新規開発者視点で通読                             | 明確で実行可能                     |
| TC-11 | 4    | 3   | コマンド正確性確認       | コマンド構文確認                                 | コピペ実行可能                     |
| TC-12 | 4    | 4   | 診断コマンド網羅性確認   | 環境診断コマンドの網羅性                         | arch/バイナリ/vitest 網羅          |

## 完了条件

- [x] すべての確認項目が記録されている
- [x] NON_VISUAL 方針が明記されている
- [x] 手動テスト結果と整合している
