# runtime policy centralization 実装収束タスク

| 項目       | 値                                                                      |
| ---------- | ----------------------------------------------------------------------- |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001       |
| 優先度     | 高                                                                      |
| 依存       | Task02 設計成果物、Task03-09 の downstream 仕様、Task01 foundation 契約 |
| 関連タスク | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001（Phase 12 最終再監査）       |

---

## 目的

Task02 で確定した runtime policy centralization 設計を、actual consumer 実装、shared transport、テストまで含めて current code に反映する。

## 背景

最終再監査で以下の gap を確認した。

- `apps/desktop/src/main/ipc/skillHandlers.ts` と `agentHandlers.ts` が旧 `RuntimeResolver` 系に依存している
- `apps/desktop/src/main/ipc/aiHandlers.ts` が runtime policy を経由せず、`AI_CHECK_CONNECTION` legacy handler を保持している
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` が resolve 結果を実行制御に使っていない
- shared runtime decision transport と cross-process test coverage が不足している

## 実行範囲

1. main process の consumer を `RuntimePolicyResolver` / policy contract に統一する
2. AI Chat / Skill / Agent / Skill Creator の execute path を central policy へ接続する
3. 必要な shared type / preload / IPC contract を packages/shared 基準で同期する
4. unit / integration / regression test を追加し、close-out の妥当性を証明する

## 実行手順

1. `apps/desktop/src/main/ipc/index.ts` の composition root を確認し、resolver の生成と注入経路を一元化する
2. `skillHandlers.ts` / `agentHandlers.ts` / `aiHandlers.ts` を runtime policy consumption contract に合わせて修正する
3. `RuntimeSkillCreatorFacade.ts` で decision を実際の実行可否へ反映する
4. 必要な shared transport 型を `packages/shared` と preload 契約へ昇格する
5. targeted test を追加する
6. `pnpm --filter @repo/desktop test`、必要な targeted suite、typecheck を実行する

## 完了条件

- [ ] main process の centralization consumer が `RuntimePolicyResolver` 契約へ統一されている
- [ ] AI Chat / Skill / Agent / Skill Creator の各経路で policy decision が実際に消費されている
- [ ] shared runtime decision transport が cross-process で参照可能になっている
- [ ] regression test が追加され、centralization の主要経路をカバーしている
- [ ] cleanup task（`UT-CLEANUP-AI-CHECK-CONNECTION-001` / `UT-CLEANUP-RUNTIME-RESOLVER-001`）へ進める条件が明確になっている
