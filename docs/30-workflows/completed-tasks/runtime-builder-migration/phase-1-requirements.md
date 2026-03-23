# Phase 1: 要件定義

## メタ情報

| 項目     | 内容                                                       |
| -------- | ---------------------------------------------------------- |
| タスクID | UT-RUNTIME-BUILDER-MIGRATION-001                           |
| Phase    | 1（要件定義）                                              |
| 由来     | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 設計 GAP |
| Issue    | #1461                                                      |
| 作成日   | 2026-03-23                                                 |

---

## 1. 目的

`TerminalHandoffBuilder` に `buildForSurface(request, surfaceType, reason)` 統一メソッドを追加し、旧メソッドに `@deprecated` タグを付与する。Consumer Adapter 実装者が surface ごとに個別の build メソッドを誤って使用するリスクを排除する。

---

## 2. 現状分析

### 2.1 TerminalHandoffBuilder の二重存在

| 場所                                  | クラス名               | 主要メソッド                              | 返却型                  | 呼び出し元                        |
| ------------------------------------- | ---------------------- | ----------------------------------------- | ----------------------- | --------------------------------- |
| `chat-edit/TerminalHandoffBuilder.ts` | TerminalHandoffBuilder | `build(request, reason)`                  | `HandoffGuidance`       | `ipc/chatEditHandlers.ts:180`     |
| `runtime/TerminalHandoffBuilder.ts`   | TerminalHandoffBuilder | `build(prompt, cwd, options)`             | `TerminalHandoffBundle` | `RuntimeSkillCreatorFacade.ts:72` |
| 同上                                  | 同上                   | `buildForAgentExecution(request, reason)` | `HandoffGuidance`       | `ipc/agentHandlers.ts:69`         |
| 同上                                  | 同上                   | `buildForSkillExecution(request, reason)` | `HandoffGuidance`       | `ipc/skillHandlers.ts:393`        |

### 2.2 問題点

1. **統一エントリーポイントの欠如**: surface ごとに個別メソッドが存在し、新しい surface 追加時に新メソッドが必要
2. **二重クラスの混在**: chat-edit 用と runtime 用で別クラスが存在し、naming collision のリスク
3. **TerminalHandoffBundle の内部型漏洩リスク**: `RuntimeSkillCreatorFacade` が `build()` で `TerminalHandoffBundle` を直接取得し、Renderer に `bundle` として渡している

---

## 3. 要件一覧

### 3.1 機能要件

| ID   | 要件                                                                                                                       | 優先度 |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-1 | `runtime/TerminalHandoffBuilder` に `buildForSurface(request, surfaceType, reason)` メソッドを追加する                     | Must   |
| FR-2 | `surfaceType` は `"chat-edit" \| "runtime" \| "skill-docs"` の3値を受け付ける                                              | Must   |
| FR-3 | 戻り値は `HandoffGuidance` 型（`TerminalHandoffBundle` ではない）                                                          | Must   |
| FR-4 | 旧メソッド（`build`, `buildForAgentExecution`, `buildForSkillExecution`）に `@deprecated` JSDoc を付与する                 | Must   |
| FR-5 | 旧メソッドの呼び出し元を `buildForSurface()` に移行する                                                                    | Must   |
| FR-6 | 未知の `surfaceType` が渡された場合はエラーを throw する（P62 対策: DEFAULT_CONFIG fallback 禁止）                         | Must   |
| FR-7 | `chat-edit/TerminalHandoffBuilder` の `build()` 呼び出し元を `runtime/TerminalHandoffBuilder.buildForSurface()` に移行する | Must   |

### 3.2 非機能要件

| ID    | 要件                                                               | 優先度 |
| ----- | ------------------------------------------------------------------ | ------ |
| NFR-1 | `terminalCommand` に API key を含めない（P55 準拠）                | Must   |
| NFR-2 | shell injection 対策（sanitizePrompt 維持）                        | Must   |
| NFR-3 | `TerminalHandoffBundle` は Renderer に渡さない（IPC 非通過型維持） | Must   |

---

## 4. surfaceType 別の BuildRequest 設計

### 4.1 統一リクエスト型

```typescript
type BuildForSurfaceRequest =
  | { surfaceType: "chat-edit"; request: SendWithContextRequest }
  | {
      surfaceType: "runtime";
      request: AgentHandoffBuildRequest | SkillHandoffBuildRequest;
    }
  | { surfaceType: "skill-docs"; request: SkillDocsHandoffBuildRequest };
```

### 4.2 surfaceType × contextSummary フォーマット

| surfaceType  | contextSummary フォーマット                        | 情報源                         |
| ------------ | -------------------------------------------------- | ------------------------------ |
| "chat-edit"  | `command={type} files={fileList} workspace={name}` | SendWithContextRequest         |
| "runtime"    | `surface=agent\|skill skill={id\|name}`            | Agent/SkillHandoffBuildRequest |
| "skill-docs" | `surface=skill-docs query={queryText}`             | SkillDocsHandoffBuildRequest   |

---

## 5. 移行対象の呼び出し元

| ファイル                       | 行      | 現在の呼び出し                                | 移行後                                               |
| ------------------------------ | ------- | --------------------------------------------- | ---------------------------------------------------- |
| `ipc/chatEditHandlers.ts`      | 179     | `builder.build(args, reason)`                 | `builder.buildForSurface(args, "chat-edit", reason)` |
| `ipc/agentHandlers.ts`         | 64-76   | `builder.buildForAgentExecution(req, reason)` | `builder.buildForSurface(req, "runtime", reason)`    |
| `ipc/skillHandlers.ts`         | 392-404 | `builder.buildForSkillExecution(req, reason)` | `builder.buildForSurface(req, "runtime", reason)`    |
| `RuntimeSkillCreatorFacade.ts` | 72-76   | `builder.build(prompt, cwd)`                  | `builder.buildForSurface(req, "runtime", reason)`    |

---

## 6. 受入基準

- [ ] AC-1: `buildForSurface()` メソッドが `runtime/TerminalHandoffBuilder.ts` に実装されている
- [ ] AC-2: 旧メソッド（`build`, `buildForAgentExecution`, `buildForSkillExecution`）に `@deprecated` JSDoc が付与されている
- [ ] AC-3: `buildForSurface()` の unit test が 12 件以上（3 surfaceType × 4 reason パターン）作成されている
- [ ] AC-4: 4箇所の呼び出し元が全て `buildForSurface()` に移行されている
- [ ] AC-5: `llm-workspace-chat-edit.md` の `buildForSurface()` 仕様が更新されている
- [ ] AC-6: 未知の `surfaceType` でエラーが throw される（P62 準拠）

---

## 7. スコープ外

- chat-edit/TerminalHandoffBuilder.ts の完全削除（移行後の残存ファイルは別タスクで削除を検討）
- TerminalHandoffCard コンポーネントの変更
- Renderer 側の変更
- Skill Docs consumer の実装（`skill-docs` surfaceType のハンドラ接続は別タスク）

---

## 8. 参照資料

| 参照資料                            | パス                                                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 未タスク指示書                      | `docs/30-workflows/unassigned-task/UT-RUNTIME-BUILDER-MIGRATION-001.md`                                                         |
| design-summary.md                   | `docs/30-workflows/completed-tasks/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/design-summary.md`  |
| contract-matrix.md                  | `docs/30-workflows/completed-tasks/step-03-par-task-05-terminal-handoff-surface-realization/outputs/phase-2/contract-matrix.md` |
| llm-workspace-chat-edit.md          | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                                                  |
| HandoffGuidance 型                  | `packages/shared/src/types/handoff.ts`                                                                                          |
| runtime/TerminalHandoffBuilder.ts   | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`                                                              |
| chat-edit/TerminalHandoffBuilder.ts | `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`                                                            |

---

## 統合テスト連携

本 Phase は要件定義のため、統合テストの追加・更新は不要。`buildForSurface()` の統合テスト設計は Phase 6 で実施する。

---

## 多角的チェック観点

| 観点           | 確認内容                                                            | 該当        |
| -------------- | ------------------------------------------------------------------- | ----------- |
| セキュリティ   | P55（API key非漏洩）、P62（fallback禁止）の要件が定義されているか   | FR-6, NFR-1 |
| 型安全性       | discriminated union + exhaustive check の設計方針が明記されているか | FR-6        |
| アーキテクチャ | 二重Builderクラスの扱いが検討されているか                           | Section 2.2 |

---

## サブタスク管理

Phase 実行開始時に以下のサブタスクを作成すること:

- [ ] 現状のメソッド一覧を調査する
- [ ] 要件一覧（FR/NFR）を定義する
- [ ] surfaceType 別の BuildRequest 設計を行う
- [ ] 移行対象の呼び出し元を特定する
- [ ] 受入基準を定義する

## タスク100%実行確認【必須】

- [ ] 全サブタスクが完了している
- [ ] 成果物が完了条件を満たしている

---

## 次 Phase

Phase 2（設計）へ進む。
