# Phase 10 出荷準備チェックリスト

- [x] `auth-key:set/exists/validate/delete` の登録漏れが解消されている
- [x] `unregister -> register` サイクルで再登録が成立する
- [x] `auth-key:exists` 契約（`{ exists: boolean }`）が維持される
- [x] Main/Preload/Renderer の契約差分がない
- [x] 回帰テスト（76件）PASS
- [x] typecheck PASS
- [x] セキュリティ仕様（sender検証/サニタイズ）後退なし
- [x] 仕様書・成果物の依存整合が取れている

## 判定

- Release Readiness: **Ready**
