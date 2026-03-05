# Phase 5 実装サマリー

## 実装方針

- Redで固定した DI欠落を、Main composition root の配線修正で最小差分解消。

## 実施内容

1. `registerSkillHandlers` のシグネチャを拡張
   - `authKeyService?: IAuthKeyService` を受け取り、`SkillExecutor` へ注入。
2. `registerAllIpcHandlers` の初期化順を修正
   - `AuthKeyService` を先行生成し、`registerSkillHandlers` と `registerAuthKeyHandlers` / `registerAuthModeHandlers` で同一インスタンスを共有。
3. 回帰テスト追加
   - `ipc-double-registration.test.ts` に同一インスタンス注入検証を追加。

## Red -> Green

- Red（実装前）
  - `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/ipc-double-registration.test.ts`
  - 失敗: `registerSkillHandlers` に第3引数未注入。
- Green（実装後）
  - 同コマンドで 14/14 PASS。

## 影響

- 外部IPC契約変更なし。
- 内部DI配線のみ修正。
