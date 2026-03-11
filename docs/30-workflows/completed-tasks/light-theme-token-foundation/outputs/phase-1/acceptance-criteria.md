# Phase 1 成果物: acceptance-criteria

## 受入基準（最終版）

| AC   | 判定基準                                                                 | 検証方法                                  |
| ---- | ------------------------------------------------------------------------ | ----------------------------------------- |
| AC-1 | light surface が純白依存から緩和される                                   | `tokens.css` 値レビュー + snapshot テスト |
| AC-2 | `--text-tertiary` / `--border-primary` / `--accent-primary` が定義される | token 契約テスト                          |
| AC-3 | text / border / accent の役割表が outputs に明文化される                 | `token-role-matrix.md` 検査               |
| AC-4 | token 起因 backlog 統合方針が記録される                                  | Phase 10/12 ドキュメント検査              |
| AC-5 | 後続タスクが token 契約を前提利用できる                                  | Phase 10 最終レビューで引継ぎ確認         |

## 追加検証基準（監査拡張）

| ID   | 基準                                                                                    | 検証方法                  |
| ---- | --------------------------------------------------------------------------------------- | ------------------------- |
| EX-1 | renderer 内で fallback なし未定義 token 参照が 0 件                                     | 参照監査テスト            |
| EX-2 | light/dark/kanagawa で `accent-primary` / `border-primary` / `text-tertiary` が取得可能 | DOM computed style テスト |

## 判定

- [x] AC-1〜AC-5 を確定
- [x] 実装判定に使う検証方法を確定
