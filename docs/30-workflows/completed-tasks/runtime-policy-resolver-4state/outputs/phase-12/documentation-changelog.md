# Documentation Changelog

- タスク: TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001
- 作成日: 2026-03-21
- Phase: 12（ドキュメント）

---

## Step 1-A: タスク完了記録

### Canonical Skill Files（`.claude/skills/aiworkflow-requirements/`）

| ファイル                                                                 | 変更内容                                                                          |
| ------------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `references/task-workflow.md`                                            | backlog/completed child companion の説明を current state へ更新。                 |
| `references/task-workflow-backlog.md`                                    | focused lane を削除し、follow-up 2件を追加。                                      |
| `references/task-workflow-completed.md`                                  | 本タスクを implementation task の completed record として再記録。                 |
| `references/workflow-ai-runtime-execution-responsibility-realignment.md` | stale snapshot を是正し、public `skill-creator:*` 未統合を follow-up として固定。 |
| `references/arch-execution-capability-contract.md`                       | capability bridge 完了と残課題 2件を contract 系 follow-up として同期。           |
| `references/lessons-learned-phase12-workflow-lifecycle.md`               | manual evidence / artifact parity / internal-public contract の教訓を追加。       |
| `references/lessons-learned-current.md`                                  | current index の変更履歴を更新。                                                  |
| `LOGS.md` / `SKILL.md`                                                   | aiworkflow-requirements / task-specification-creator の変更履歴を更新。           |

### Index 再生成

| ファイル                | 変更内容                               |
| ----------------------- | -------------------------------------- |
| `indexes/topic-map.md`  | `generate-index.js` 実行により再生成。 |
| `indexes/keywords.json` | `generate-index.js` 実行により再生成。 |

---

## Step 1-B: 実装ファイル変更一覧

### 1. `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

**変更種別**: `execute()` の capability 消費是正

- `terminalSurface` では `SkillExecutor` を呼ばず handoff bundle を返すよう修正
- `both` では integrated 経路を優先して `SkillExecutor` へ委譲
- `none` は unreachable guard として明示的に throw

### 2. `apps/desktop/src/main/ipc/creatorHandlers.ts`

**変更種別**: internal IPC adapter の capability 正規化

- raw `authMode` / `apiKey` / `apiKeyDegraded` を `buildCapabilityInput()` で `ExecutionCapabilityInput` へ変換
- `execute` は terminal handoff を透過
- `improve` は `apiKeyDegraded` 未指定時に `false` を補完

### 3. `apps/desktop/src/main/services/runtime/__tests__/RuntimePolicyResolver.test.ts`

**変更種別**: decision shape 検証補強

- `integratedRuntime` / `both` が capability-only decision を返すことを明示
- `terminalSurface` のみ bundle を持つ shape であることを確認

### 4. `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`

**変更種別**: execute 分岐の回帰防止

- `terminalSurface` が handoff bundle を返し、`SkillExecutor` を呼ばないことを確認
- `both` が integrated 経路を優先することを確認

### 5. `apps/desktop/src/main/ipc/__tests__/creatorHandlers.test.ts`

**変更種別**: new adapter test

- 3 channel 登録確認
- `ExecutionCapabilityInput` 正規化確認
- terminal handoff 透過確認
- unregister 確認

### 6. workflow / outputs / unassigned task docs

**変更種別**: close-out 整合化

- `phase-11-manual-test.md` / `manual-test-checklist.md` / `manual-test-result.md` を non-visual evidence へ整合化
- `system-spec-update-summary.md` / `documentation-changelog.md` / `phase12-task-spec-compliance-check.md` の stale wording と task ID drift を解消
- 未タスク 2件を formalize し、`outputs/phase-12/unassigned-task-detection.md` に記録

---

## Step 2: システム仕様更新の判断記録

- direct caller lane の capability bridge は current code と system spec の双方に同期済み
- public preload / app registration の未接続状態を「未完」として formalize し、過大申告を除去した
- broader consumer 実装は `TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-IMPLEMENTATION-CLOSURE-001` に範囲外として残す

---

## Step 3: IPC 契約検証記録

- internal `creator:*` adapter と `creatorHandlers.test.ts` は capability bridge 契約に一致
- public `skill-creator:*` preload surface は本タスクの変更対象外であり、follow-up `UT-IMP-RUNTIME-SKILL-CREATOR-IPC-WIRING-001` に切り出した
- internal adapter を public contract 更新済みと誤記しないよう summary を修正した

---

## 検証結果

| コマンド                                                                                                                                                                                    | 結果                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`                                                                                                                     | PASS                                |
| `node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/runtime-policy-resolver-4state --regenerate`                                         | PASS                                |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/runtime-policy-resolver-4state`                                                          | PASS（31項目, 0エラー, 0警告）      |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/runtime-policy-resolver-4state --strict`                                           | PASS（13/13, errors 0, warnings 0） |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/runtime-policy-resolver-4state`                               | PASS（10/10）                       |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/runtime-policy-resolver-4state/outputs/phase-12/unassigned-task-detection.md` | PASS（2/2, missing 0）              |
| `pnpm --filter @repo/shared typecheck`                                                                                                                                                      | PASS                                |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                     | PASS                                |
| `diff -qr ./.claude/skills/ ./.agents/skills/`                                                                                                                                              | PASS（差分なし）                    |

## current / baseline 判定

- current 判定は `verify-unassigned-links --source outputs/phase-12/unassigned-task-detection.md` の 2件を正とした
- repo-wide baseline 監査は今回の close-out 判定には混ぜず、current workflow の formalized follow-up のみを完了条件に使った
