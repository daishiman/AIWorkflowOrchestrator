# Phase 2 テスト戦略

## 方針

- Red -> Green -> Regression の順で実施。
- Main登録漏れを最短で検出できるテストを先行追加。

## SubAgent別戦略

### SubAgent-A（Main/IPC）

- `ipc-double-registration.test.ts` に auth-key 登録/解除ライフサイクルの期待値を追加。

### SubAgent-B（Preload/API）

- 既存契約維持を静的確認（channels + preload）。

### SubAgent-C（Renderer）

- preflight 利用側テスト（`agentSlice.executeSkill.preflight.test.ts`）の回帰確認。

### SubAgent-D（統合）

- 変更後に関連テストをまとめて実行し、副作用を監査。

## 実行セット

- 必須
  - `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`
  - `apps/desktop/src/main/ipc/__tests__/authKeyHandlers.test.ts`
- 推奨
  - `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.executeSkill.preflight.test.ts`
  - `apps/desktop/src/renderer/hooks/__tests__/useSkillExecution.test.ts`

## ゲート

- Phase 4: 新規テストが失敗することを確認
- Phase 5: 実装後に新規テストが成功することを確認
- Phase 6: 回帰/異常/耐久観点を追加検証
