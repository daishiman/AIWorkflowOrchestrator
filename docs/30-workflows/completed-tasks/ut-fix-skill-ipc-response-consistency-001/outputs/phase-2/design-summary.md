# Phase 2: 設計サマリー

## 担当

- SubAgent-A（設計）

## 採用方針

- 方針C（契約プロファイル明示 + Preload単一利用体験）を採用。
- Main の返却形式はチャネルごとに維持しつつ、Preload で Renderer 向け契約を一意化する。

## TO-BE 設計

1. `skill:execute`

- Main: `{ success, data: SkillExecutionResponse }` を維持
- Preload: `safeInvokeUnwrap<SkillExecutionResponse>` を適用
- Renderer: `SkillExecutionResponse` を直接受け取る

2. `skill:remove`

- Main: `RemoveResult` を維持
- Preload: `Promise<RemoveResult>` へ型同期（`safeInvoke`）
- Renderer: 既存呼び出しは返却値未使用のため非破壊

3. `list/getImported/rescan`

- 既存 `safeInvokeUnwrap` 運用を維持し、契約表へ明記

## 変更順序

1. Main/Preload 契約表の確定
2. Preload API の execute/remove 修正
3. `apps/desktop/src/preload/types.ts` 同期
4. Renderer 利用箇所の型追従
5. テスト（Main → Preload → Renderer）の順で更新

## 完了条件

- [x] `safeInvoke` / `safeInvokeUnwrap` 採用ルールを定義
- [x] 変更順序を Main→Preload→Renderer→Test で固定
- [x] Phase 3 レビュー観点を引き継ぎ済み
