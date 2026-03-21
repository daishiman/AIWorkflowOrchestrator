# System Spec Update Summary

- タスク: TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001
- 作成日: 2026-03-21
- canonical root: `.claude/skills/aiworkflow-requirements/`
- 対象 workflow: `docs/30-workflows/runtime-policy-resolver-4state/`
- focused lane: `TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001`

---

## Step 1-A: タスク完了記録

### 更新が必要なファイル

| ファイル                                                                 | 更新内容                                                                                                                       |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `references/task-workflow-backlog.md`                                    | focused lane 完了に伴い row を backlog から外し、follow-up 2件（public IPC wiring / subscription service integration）を追加。 |
| `references/task-workflow-completed.md`                                  | 本タスクを implementation task の completed record として再記録し、Phase 12 follow-up 2件を明記。                              |
| `references/task-workflow.md`                                            | backlog / completed child companion の説明を current state に更新。                                                            |
| `references/workflow-ai-runtime-execution-responsibility-realignment.md` | current snapshot から stale gap を除去し、internal `creatorHandlers.ts` と public `skill-creator:*` の境界を明記。             |
| `references/arch-execution-capability-contract.md`                       | `TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001` を completed 扱いへ更新し、残課題 2件を contract follow-up として参照。        |
| `references/lessons-learned-phase12-workflow-lifecycle.md`               | manual-test / artifact parity / internal-public contract の教訓を追加。                                                        |
| `references/lessons-learned-current.md`                                  | current index の変更履歴を更新。                                                                                               |
| `LOGS.md` / `SKILL.md`                                                   | aiworkflow-requirements / task-specification-creator の双方へ今回の close-out を記録。                                         |

### 親タスクとの同期

- 親タスク: `TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001`
- 本タスク（focused lane）は親タスクのサブセット実装として位置づけられる
- broader consumer 実装は親タスクに残す

---

## Step 1-B: 実装状況テーブル

| タスク ID                                                    | ステータス変更 | 変更前                         | 変更後                                                          |
| ------------------------------------------------------------ | -------------- | ------------------------------ | --------------------------------------------------------------- |
| `TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001`              | 実装完了       | backlog 側の focused lane 記録 | `task-workflow-completed.md` の implementation completed record |
| `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001`                | 新規未タスク   | 未登録                         | backlog 登録済み                                                |
| `UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001` | 新規未タスク   | 未登録                         | backlog 登録済み                                                |

---

## Step 1-C: 関連タスクテーブル

- `rg -n "TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001|UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001|UT-IMP-RUNTIME-POLICY-SUBSCRIPTION-SERVICE-INTEGRATION-001" .claude/skills/aiworkflow-requirements/references/` で関連参照先を確認した
- 関連参照先:
  - `task-workflow-backlog.md`
  - `task-workflow-completed.md`
  - `workflow-ai-runtime-execution-responsibility-realignment.md`
  - `arch-execution-capability-contract.md`
  - `lessons-learned-phase12-workflow-lifecycle.md`

---

## Step 2: システム仕様更新の判断

### 変更範囲の評価

| 変更対象                                   | 変更の有無 | 理由                                                                                                                                                                |
| ------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/shared` の capability contract   | 変更あり   | `RuntimePolicyResolver` / `RuntimeSkillCreatorFacade` / `creatorHandlers.ts` が `ExecutionCapabilityInput` と `AccessCapability` authority を実消費するようになった |
| `RuntimePolicyResolver.ts` の service path | 変更あり   | `resolve()` は authority 消費へ移行済み、`resolveFromServices()` には subscription service follow-up が残る                                                         |
| `creatorHandlers.ts` の IPC 境界           | 変更あり   | raw `authMode` / `apiKey` を `buildCapabilityInput()` で internal capability 語彙へ正規化                                                                           |
| public preload / app registration          | 変更なし   | 実アプリの public surface は引き続き `skill-creator:*` であり、本タスクでは変更していない                                                                           |

### 判断

- direct caller lane の capability bridge は current code に反映済みであり、implementation task として completed ledger へ記録する
- public preload / app registration は変更していないため、「public IPC 更新済み」とは記録しない
- public Skill Creator IPC wiring と subscription service integration は独立 follow-up として formalize する
- broader consumer 収束は引き続き `TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001` に残す

---

## Step 3: IPC 契約検証

### internal adapter

| チャンネル        | 変更内容                                                        |
| ----------------- | --------------------------------------------------------------- |
| `creator:plan`    | `buildCapabilityInput()` で `ExecutionCapabilityInput` に正規化 |
| `creator:execute` | `terminalSurface` の handoff 結果を透過                         |
| `creator:improve` | `apiKeyDegraded` 未指定時に `false` を補完                      |

### `buildCapabilityInput()` の契約

```typescript
// IPC args（境界外語彙）→ ExecutionCapabilityInput（境界内語彙）への変換
function buildCapabilityInput(args: {
  authMode?: string; // 旧語彙: "subscription" | "apiKey" | その他
  apiKey?: string | null;
  apiKeyDegraded?: boolean;
}): ExecutionCapabilityInput {
  return {
    apiKeyValid: typeof args.apiKey === "string" && args.apiKey.trim() !== "",
    subscriptionValid: args.authMode === "subscription",
    apiKeyDegraded: args.apiKeyDegraded ?? false,
  };
}
```

### P42 準拠バリデーション確認

すべての文字列引数（`prompt`、`planId`、`skillName`、`feedback`）に3段バリデーションを適用済み:

1. `typeof args?.xxx !== "string"` （型チェック）
2. `args.xxx === ""` （空文字列チェック）
3. `args.xxx.trim() === ""` （トリム後空文字列チェック）

### P45 引数命名確認

- `authMode` は IPC boundary の外向き語彙として残存するが、`buildCapabilityInput()` より内側では `ExecutionCapabilityInput` の語彙（`apiKeyValid`、`subscriptionValid`）のみを使用
- `authMode` という名前が capability 語彙と混在する箇所がないことを確認済み

### public contract 判定

- 実アプリの登録点は `apps/desktop/src/main/ipc/index.ts` の `registerSkillCreatorHandlers` であり、`registerCreatorHandlers` は未接続
- preload 側の公開チャンネルは `IPC_CHANNELS.SKILL_CREATOR_* = skill-creator:*` が正本
- よって本タスクは internal adapter 実装の完了であり、public IPC / preload 統合は `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001` へ分離する

---

## Validation / Mirror Sync

| コマンド                                                                                                                                            | 結果                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                                                             | PASS（378ファイル分類、`indexes/topic-map.md` / `indexes/keywords.json` 再生成） |
| `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/runtime-policy-resolver-4state --regenerate` | PASS（13/13 phase files）                                                        |
| `pnpm --filter @repo/shared typecheck`                                                                                                              | PASS                                                                             |
| `pnpm --filter @repo/desktop typecheck`                                                                                                             | PASS                                                                             |
| `rsync -av --checksum ./.claude/skills/ ./.agents/skills/`                                                                                          | PASS                                                                             |
| `diff -qr ./.claude/skills/ ./.agents/skills/`                                                                                                      | PASS（差分なし）                                                                 |
