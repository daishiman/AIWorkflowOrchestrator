# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 1                                                      |
| Phase 名   | 要件定義                                               |
| 前提 Phase | -（このタスクの起点）                                  |
| 後続 Phase | Phase 2（設計）                                        |
| ステータス | 完了                                                   |
| 作成日     | 2026-04-06                                             |
| 機能名     | task-ut-rt-01-execute-async-snapshot-error-message-001 |

---

## 目的

`RuntimeSkillCreatorFacade.executeAsync()` のエラー伝搬パスに存在する不一致を特定し、修正スコープ・受入条件・命名規則 inventory を確定する。

---

## Step 0: P50 チェック（必須）

### 対象ファイル確認済み事項

**対象ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

現状実装（行 1032-1057）を確認済み:

```typescript
// structured error パス（行 1032-1043）
if (isStructuredError) {
  const errorResponse = executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {  // 問題: snapshot が存在する場合はエラーメッセージが渡されない
    this.onWorkflowStateSnapshot?.(planId, null, errorResponse.error.message);
  }
}

// catch パス（行 1044-1057）
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  if (!snapshot) {  // 問題: snapshot が存在する場合はエラーメッセージが渡されない
    this.onWorkflowStateSnapshot?.(planId, null, errorMessage);
  }
```

**`onWorkflowStateSnapshot` シグネチャ**（行 970-974）確認済み:

```typescript
onWorkflowStateSnapshot?: (
  planId: string,
  snapshot: SkillCreatorWorkflowUiSnapshot | null,
  error?: string,   // 第3引数は optional
) => void;
```

**確認結果**:

- `onWorkflowStateSnapshot` の第3引数 `error?` が optional であることを確認済み
- structured error パス・catch パスともに `if (!snapshot)` 条件が存在し、snapshot が取得できた場合はエラーメッセージが伝搬されない問題が確認済み
- TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 は完了済みであり、`RuntimeSkillCreatorExecuteErrorResponse` 型は `packages/shared/src/types/skillCreator.ts` に定義済みであることを前提とする

---

## タスク分類

**実装タスク（改善）**

本タスクは docs-only task ではない。`RuntimeSkillCreatorFacade.ts` の `executeAsync()` メソッドに対するコード修正と、対応するテストの追加が含まれる小規模な改善タスクである。

---

## 背景・問題の詳細

### 問題の本質

`executeAsync()` は `execute()` を内部で呼び出す fire-and-forget 型ラッパーである。`execute()` が `success: false` の structured error を返した場合でも、そのエラーメッセージ（`error.code` / `error.message`）が `onWorkflowStateSnapshot` へ伝搬されない。

具体的には以下の2つのパスで問題が存在する:

| ケース                               | 現状の挙動                                                                                                    | 期待する挙動                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| structured error（`success: false`） | `triggerPhaseTransition("error")` のみ。snapshot がある場合は `onWorkflowStateSnapshot` に error が渡されない | snapshot の有無に関わらず常に `onWorkflowStateSnapshot` に error.message を渡す |
| catch（例外スロー）                  | snapshot がない場合のみ `onWorkflowStateSnapshot?.(planId, null, errorMessage)` を呼び出す                    | snapshot の有無に関わらず常に `onWorkflowStateSnapshot` に errorMessage を渡す  |

### 影響

- adapter ステータスガードが `execute()` で発動した場合（API キー未設定など）、Renderer 側の UI にはエラー理由が表示されない
- ユーザーは「スキル実行に失敗した」という事実は確認できるが、その原因（「API キーを設定してください」など）を UI から読み取れない
- adapter guard の投資効果（actionable message の提供）が `executeAsync()` 経由の呼び出しでは得られない

---

## スコープ

### 含むもの

- `RuntimeSkillCreatorFacade.executeAsync()` の structured error パスにおける `onWorkflowStateSnapshot` へのエラーメッセージ伝搬修正
- `executeAsync()` の catch パスにおける同様の修正
- `executeAsync()` のエラーパスを対象としたテストの追加（T-01〜T-06）

### 含まないもの

- `SkillCreatorWorkflowEngine` の内部 snapshot 生成ロジックの変更
- `execute()` / `improve()` / `plan()` 自体のエラーハンドリング変更
- Renderer 側（`SkillCreateWizard.tsx` / `SkillLifecyclePanel.tsx`）の UI 変更
- 新規エラーコードの追加
- `onWorkflowStateSnapshot` のシグネチャ変更（既存のまま）

---

## 受入条件（Acceptance Criteria）

- **AC-1**: `executeAsync()` が structured error（`success: false`）を受け取った時、snapshot の有無に関わらず `onWorkflowStateSnapshot` にエラーメッセージが伝搬される
  - 修正後: `this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorResponse.error.message)` を snapshot の有無に関わらず呼び出す
- **AC-2**: catch ブロックでも snapshot の有無に関わらずエラーメッセージが伝搬される
  - 修正後: `this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage)` を snapshot の有無に関わらず呼び出す
- **AC-3**: TypeScript コンパイルエラーが 0 件（`pnpm --filter @repo/desktop typecheck` が PASS）
- **AC-4**: structured error 伝搬シナリオの新規テスト T-01〜T-06 が全て PASS する

---

## テストケース一覧（Phase 4〜6 で実装）

| ID   | シナリオ                                                                                                                                           | 期待結果                                                                                              |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| T-01 | `execute()` が `{ success: false, error: { code: "llm_adapter_unavailable", message: "API キーを設定してください" } }` を返し、snapshot が存在する | `onWorkflowStateSnapshot` が snapshot と `"API キーを設定してください"` を第3引数に渡して呼び出される |
| T-02 | `execute()` が例外をスローし、snapshot が存在する                                                                                                  | `onWorkflowStateSnapshot` が snapshot と `error.message` を第3引数に渡して呼び出される                |
| T-03 | `execute()` が `{ type: "terminal_handoff", bundle: ... }` を返す                                                                                  | `onWorkflowStateSnapshot` の第3引数は `undefined` / フェーズが `complete` に遷移する                  |
| T-04 | `execute()` が `{ success: true, ... }` などの正常結果を返す                                                                                       | `onWorkflowStateSnapshot` の第3引数は `undefined` / フェーズが `complete` に遷移する                  |
| T-05 | `execute()` が structured error を返し、snapshot が `null` / `undefined` の場合                                                                    | `onWorkflowStateSnapshot` の第2引数は `null` / 第3引数は `error.message` になる                       |
| T-06 | `execute()` が `Error` 以外の値を throw し、snapshot が `null` / `undefined` の場合                                                                | `onWorkflowStateSnapshot` の第2引数は `null` / 第3引数は `String(error)` になる                       |

---

## 既存コードの命名規則 inventory

Phase 1 で分析した既存コードの命名規則（Phase 4 TDD Red 時に整合確認必須）:

| カテゴリ               | 命名パターン         | 具体例                                                                                      |
| ---------------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| メソッド名             | camelCase            | `executeAsync`, `triggerPhaseTransition`, `getWorkflowState`, `onWorkflowStateSnapshot`     |
| 変数名                 | camelCase            | `planId`, `executeResult`, `errorResponse`, `errorMessage`, `snapshot`, `isStructuredError` |
| 型名                   | PascalCase           | `RuntimeSkillCreatorExecuteErrorResponse`, `SkillCreatorWorkflowUiSnapshot`, `AuthMode`     |
| プライベートフィールド | camelCase            | `workflowEngine`, `ownerInstanceId`                                                         |
| 条件判定変数           | camelCase（boolean） | `isStructuredError`                                                                         |
| IPC チャンネル         | kebab-case           | `skill-creator:execute-plan`                                                                |

---

## 依存関係

| 依存タスク                                      | 依存理由                                                               |
| ----------------------------------------------- | ---------------------------------------------------------------------- |
| TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 | structured error 型（`RuntimeSkillCreatorExecuteErrorResponse`）の前提 |

---

## 参照資料

| 参照資料                       | パス                                                                                                    | 内容                                         |
| ------------------------------ | ------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 対象実装ファイル               | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                   | `executeAsync()` 実装（行 991-1057）         |
| 型定義                         | `packages/shared/src/types/skillCreator.ts`                                                             | `RuntimeSkillCreatorExecuteErrorResponse` 等 |
| 元タスク指示書                 | `docs/30-workflows/unassigned-task/task-ut-rt-01-execute-async-snapshot-error-message-001.md`           | 詳細背景・推奨アプローチ                     |
| 親タスク Phase 10 最終レビュー | `docs/30-workflows/completed-tasks/ut-rt-01-execute-improve-adapter-guard-001/phase-10-final-review.md` | MINOR 指摘の原文                             |

---

## 成果物

| 成果物                       | パス                                                                                               | 内容                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義             | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-1-requirements.md` | 本ドキュメント               |
| Phase 1 outputs ディレクトリ | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-1/`        | Phase 1 出力格納ディレクトリ |

---

## 統合テスト連携

接続要件: `onWorkflowStateSnapshot` コールバックは Renderer IPC チャンネル `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` へワイヤリングされる。エラーメッセージが第3引数として渡されることで、既存の IPC ワイヤリング（`creatorHandlers.ts`）を経由して Renderer 側でエラー理由を表示できるようになる。IPC シグネチャ変更は不要であることを確認済み。

---

## 完了条件

- [x] P50 チェック完了（対象ファイルの現状実装確認済み）
- [x] タスク分類を明記（実装タスク（改善）— docs-only task ではない）
- [x] スコープ（含む / 含まない）が明記済み
- [x] 受入条件 AC-1〜AC-4 が本文に列挙済み
- [x] テストケース T-01〜T-06 が定義済み
- [x] 既存コードの命名規則 inventory が記録済み
- [x] Phase 1-3 完了前に Phase 4 へ進まない gate を設定済み

---

## Phase 末端アクション【必須】

- [x] Phase 1 内の全タスクを 100% 実行完了
- [x] P50 チェックを実行し、完了を明記
- [x] スコープ・AC・命名規則 inventory を確定し、完了を明記
- [x] 成果物（本ドキュメント）が生成されていることを確認

---

## 次 Phase

Phase 1 完了。次は **Phase 2（設計）** へ進む。

`docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-2-design.md`
