# Phase 1 スコープ定義

## 含むもの

- `phase11-current-build-preflight-core.mjs` と thin CLI wrapper の追加
- capture script への shared preflight 統合
- package script 追加
- Phase 1-12 outputs の作成
- `.claude/skills/**` 正本と `.agents/skills/**` mirror の関連仕様同期

## 含まないもの

- `ThemeSelector` / `AuthView` / `WorkspaceSearchPanel` の配色 remediation
- `UT-FIX-WORKTREE-NATIVE-BINARY-GUARD-001` が扱う汎用 native 修復
- commit / PR / Issue 状態変更

## 境界条件

- baseUrl fallback は loopback のみ許可する。
- build 成果物が無い場合、capture は実行しない。
- current workflow の Phase 11 では preflight result と screenshot evidence を同じ証跡束に残す。
