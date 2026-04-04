# Implementation Guide: UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001

||||||| Stash base

# Phase 12: Implementation Guide — TASK-SDK-SC-02 Conversation UI

# Phase 12: Implementation Guide — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## 概要

SkillCreator の Layer3/4 verify detail に severity フィルタ（`all` / `warning+` / `error only`）を追加し、ユーザーが重要度に応じて表示を絞り込めるようにした。
||||||| Stash base
Electron Renderer 側に「質問受信・回答送信」UIコンポーネント群を実装した。
`skill-creator:question-received` IPCイベントで `UserInputQuestion` を受信し、`kind`（single_select / multi_select / free_text / secret / confirm）に応じた入力UIを表示する。ユーザーの回答は `InterviewUserAnswer` として組み立て、`UserInputAnswer` に正規化して `skill-creator:answer` IPC で送信する。

`RuntimeSkillCreatorFacade.execute()` / `improve()` に LLMAdapter ステータス確認を追加し、初期化前や失敗時にわかりやすいエラーを返せるようにした。
あわせて `execute()` の戻り値に `RuntimeSkillCreatorExecuteErrorResponse` を追加し、renderer 側では type guard で message へ正規化している。
execute ack 後は workflow snapshot を再読込し、handoff / failure を UI に反映する。

## 変更内容

||||||| Stash base

## 参照元

## Part 1: 中学生レベルの説明

### SkillLifecyclePanel.tsx

||||||| Stash base

- `docs/30-workflows/step-02-par-task-02-conversation-ui/phase-12-documentation.md`
- `outputs/phase-11/manual-test-report.md`
- `outputs/phase-11/task-sdk-sc-02/screenshots/`

### なぜ必要か

#### 新規追加

||||||| Stash base

## 新規作成ファイル

AI に「今すぐ動いて」と頼んでも、準備が終わっていないことがあります。
そのときに難しいエラーをそのまま返すと、使う人は何が悪いのか分かりません。

| 要素                            | 説明                                 |
| ------------------------------- | ------------------------------------ | --- | --- | --- | --- | ---------- |
| `SeverityFilterLevel` 型        | `"all" \| "warning+" \| "error"`     |
| `SEVERITY_FILTER_OPTIONS`       | フィルタ選択肢の定数配列             |
| `severityFilterButtonStyles`    | active/inactive のスタイル定数       |
| `filterChecksBySeverity()`      | severity に基づく check フィルタ関数 |
| `severityFilter` state          | フィルタ状態（デフォルト `"all"`）   |
| `filteredChecksByLayer` useMemo | フィルタ適用後の layer groups        |
| `severityTotalCounts` useMemo   | 各フィルタレベルの該当件数           |
|                                 |                                      |     |     |     |     | Stash base |

### コンポーネント（5ファイル）

たとえば、料理を始める前に「材料がまだ冷蔵庫に入ったまま」だと気づけるほうが助かります。
今回の変更は、その確認を `execute()` と `improve()` の最初で行うようにしたものです。

#### UI 変更

||||||| Stash base
| ファイル | Atomic Design | 役割 |
| ----------------------------------- | ------------- | -------------------------------------------- |
| `ChoiceButton.tsx` | Atom | 選択/未選択状態の単一ボタン |
| `FreeTextInput.tsx` | Atom | 自由入力テキストエリア（free_text / secret） |
| `ConversationProgress.tsx` | Atom | 「質問 N / 推定合計」形式の進捗表示 |
| `QuestionCard.tsx` | Molecule | kind に応じた質問表示・入力UI統合 |
| `SkillCreatorConversationPanel.tsx` | Organism | IPC listen・回答送信・全コンポーネント統合 |

### 何が変わったか

- verify detail セクション内（Status/Phase/Evidence/Route グリッドの下、Layer グループの上）にセグメントボタン形式のフィルタバーを追加
- `role="radiogroup"` + `aria-checked` でアクセシビリティ対応
- Layer グループへ渡すデータを `checksByLayer` → `filteredChecksByLayer` に変更
- フィルタ結果で空になった layer は非表示
  ||||||| Stash base

### テスト（5ファイル）

- AI の準備状態が `ready / initializing / failed` で分かるようになった
- `execute()` と `improve()` が同じ判断基準で止まるようになった
- `execute()` は「使えません」を構造化された戻り値で返せるようになった
- 画面側はその結果を見て、ユーザー向けの文章だけを表示する
- execute ack 後に snapshot を再取得し、failure snapshot でも即座に表示できるようになった

#### State ライフサイクル

||||||| Stash base
| ファイル | テスト数 |
| ---------------------------------------- | -------- |
| `ChoiceButton.test.tsx` | 9 |
| `FreeTextInput.test.tsx` | 9 |
| `ConversationProgress.test.tsx` | 3 |
| `QuestionCard.test.tsx` | 23 |
| `SkillCreatorConversationPanel.test.tsx` | 13 |
| **合計** | **57** |

## Part 2: 技術者向け

- `activeWorkflowId` 変更時に `"all"` にリセット
- reverify 時は filter state を維持（ユーザー体験の一貫性）
  ||||||| Stash base

## アーキテクチャ

### 変更ファイル

### SkillLifecyclePanel.test.tsx

`describe("severity フィルタ")` ブロックに 9テスト追加:

| テストID | 内容                                       |
| -------- | ------------------------------------------ |
| SF-01    | デフォルトで `all` に設定                  |
| SF-02    | `all` 選択時に全 check 表示                |
| SF-03    | `warning+` で info 非表示                  |
| SF-04    | `error` で warning/info 非表示             |
| SF-05    | 空 layer の非表示                          |
| SF-06    | 件数表示の正確性                           |
| SF-07    | reverify 後のフィルタ状態維持              |
| SF-08    | フィルタ切替後の accordion 操作            |
| SF-09    | 全 info 時の error フィルタで全 layer 消失 |

## データフロー

||||||| Stash base

### コンポーネントツリー

| 区分 | ファイル                                                                                            | 変更内容                                                                                              |
| ---- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| code | `packages/shared/src/types/skillCreator.ts`                                                         | `RuntimeSkillCreatorExecuteErrorResponse` を追加し、`RuntimeSkillCreatorExecuteResponse` union を拡張 |
| code | `packages/shared/src/types/index.ts`                                                                | 新型を barrel export に追加                                                                           |
| code | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                               | `execute()` / `improve()` の先頭に `_llmAdapterStatus` guard を追加                                   |
| code | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts` | execute / improve のエラー系テストを追加・更新                                                        |
| code | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`   | guard 有効化のための adapter 注入を追加                                                               |
| code | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`   | adapter guard 失敗時の通知を追加                                                                      |
| code | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`                | 互換性テストの期待値を更新                                                                            |
| code | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                  | structured execute error を message に正規化                                                          |
| code | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | structured execute error を message に正規化                                                          |
| code | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                              | improve 失敗時の `recordImproveFailure()` を追加                                                      |
| test | `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`                          | execute union の契約期待値を拡張                                                                      |
| test | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`    | execute ack 後の failure snapshot 再読込を追加                                                        |
| docs | `outputs/phase-11/manual-test-result.md`                                                            | NON_VISUAL 実証を記録                                                                                 |
| docs | `outputs/phase-11/manual-test-report.md`                                                            | 実施概要と所見を記録                                                                                  |
| docs | `outputs/phase-11/discovered-issues.md`                                                             | 新規 issue 0 を記録                                                                                   |
| docs | `outputs/phase-11/ui-sanity-visual-review.md`                                                       | semantic review を記録                                                                                |
| docs | `outputs/phase-12/*`                                                                                | current facts ベースに全面更新                                                                        |
| spec | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                      | current task completion record を追加                                                                 |
| spec | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`                        | Phase 11 evidence を closed 化し、Phase 10 MINOR follow-up を formalize                               |
| spec | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                    | current wave headline を追加                                                                          |
| spec | `.claude/skills/task-specification-creator/LOGS.md`                                                 | current wave headline を追加                                                                          |
| spec | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`         | execute error response の参照を追加                                                                   |
| spec | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                          | execute union の current fact を追加                                                                  |
| spec | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`         | execute union の current fact を追加                                                                  |

```
verifyDetail.checks
  → checksByLayer (useMemo: layer grouping)  [既存]
  → filteredChecksByLayer (useMemo: severity filter)  [新規]
  → VerifyLayerGroup コンポーネント
||||||| Stash base
```

SkillCreatorConversationPanel (Organism)
├── ConversationProgress (Atom)
└── QuestionCard (Molecule)
├── ChoiceButton[] (Atom)
└── FreeTextInput (Atom)

### 追加された型

```ts
export interface RuntimeSkillCreatorExecuteErrorResponse {
  success: false;
  error: { code: RuntimeSkillCreatorDegradedReason; message: string };
}

export type RuntimeSkillCreatorExecuteResponse =
  | RuntimeSkillCreatorExecuteResult
  | { type: "terminal_handoff"; bundle: TerminalHandoffBundle }
  | RuntimeSkillCreatorExecuteErrorResponse;
```

## テスト結果

||||||| Stash base

### 型マッピング

### 共通ガード

全27テスト PASS（既存18 + 新規9）
||||||| Stash base
2つの型体系をブリッジ:

```ts
if (this._llmAdapterStatus === "failed") {
  return {
    success: false,
    error: {
      code: "llm_adapter_unavailable",
      message: toActionableMessage(this._llmAdapterFailureReason),
    },
  };
}

## 完了条件チェック

- [x] severity フィルタで表示対象を切り替えられる
- [x] default の `all` 表示が現行 UI と互換
- [x] Layer grouping と accordion の操作が壊れていない
- [x] コンポーネントテストが全て PASS

## 中学生向け概念説明

### severity フィルタとは？
||||||| Stash base
- **Session Bridge 型** (`UserInputQuestion`/`UserInputAnswer`) — preload API で使用
- **Workflow 型** (`SkillCreatorUserInputRequest`/`InterviewUserAnswer`) — UI コンポーネントで使用

`SkillCreatorConversationPanel` 内の `mapQuestionToRequest()` / `mapAnswerToUserInputAnswer()` でマッピング。
`multi_select` の自由入力は `selectedValues` を保持し、ブリッジで `UserInputAnswer.value` の配列に正規化する。

### IPC 通信フロー

```

[Main] → skillCreatorSessionAPI.onQuestion() → [Panel] → QuestionCard 表示
[Panel] ← QuestionCard.onAnswer() ← [ユーザー操作]
[Panel] → skillCreatorSessionAPI.sendAnswer() → [Main]
[Main] → skillCreatorSessionAPI.onComplete() / onError() → [Panel] 終端状態

```

if (this._llmAdapterStatus === "initializing") {
  return {
    success: false,
    error: {
      code: "llm_adapter_unavailable",
      message: "LLMAdapter の初期化中です。しばらくお待ちください",
    },
  };
}
```

プログラムのチェック結果には「情報（info）」「注意（warning）」「エラー（error）」の3段階の重要度があります。チェック項目が増えると、本当に大事な「エラー」が大量の「情報」に埋もれて見つけにくくなります。
||||||| Stash base

### 状態管理

### Consumer Contract & IPC Compatibility

severity フィルタは、テレビのチャンネル切り替えのようなものです。「すべて」を選べば全チャンネルが見え、「Warning+」を選べば注意とエラーだけ、「Error」を選べばエラーだけが表示されます。
||||||| Stash base
`useReducer` による状態管理:

| 対象                                 | Before                                                                                            | After                                                            | 影響                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------- |
| `RuntimeSkillCreatorExecuteResponse` | `RuntimeSkillCreatorExecuteResult \| terminal_handoff`                                            | `+ RuntimeSkillCreatorExecuteErrorResponse`                      | renderer は `success === false` を type guard で拾う必要がある |
| `RuntimeSkillCreatorImproveResponse` | `RuntimeSkillCreatorImproveResult \| terminal_handoff \| RuntimeSkillCreatorImproveErrorResponse` | 変更なし                                                         | adapter fail は既存 wrapper に収束する                         |
| `onWorkflowStateSnapshot` 連携       | snapshot first, error message only on missing snapshot                                            | execute ack 後は `getWorkflowState` で failure snapshot を再取得 | `executeAsync()` の message 伝搬統一は backlog へ分離          |

これにより、ユーザーは「今すぐ直すべきもの」に集中できます。
||||||| Stash base

- `QUESTION_RECEIVED`: 質問受信 → questionIndex++, currentRequest 更新
- `ANSWER_SUBMITTING` / `ANSWER_SUBMITTED`: 送信中フラグ制御
- `SESSION_COMPLETE` / `SESSION_ERROR`: 終端状態

## 質問タイプ別動作

| kind            | UI                                               | 回答フィールド                         |
| --------------- | ------------------------------------------------ | -------------------------------------- |
| `single_select` | ChoiceButton リスト + 「その他（自由入力）」     | `selectedOptionId`                     |
| `multi_select`  | ChoiceButton（複数選択）+ 「その他」+ 送信ボタン | `selectedOptionIds` / `selectedValues` |
| `free_text`     | FreeTextInput (textarea)                         | `textValue`                            |
| `secret`        | FreeTextInput (input[type="password"])           | `secretValue`                          |
| `confirm`       | 「はい」「いいえ」ChoiceButton                   | `confirmed`                            |

## 品質指標

- TypeScript エラー: 0 件
- テスト: 57/57 PASS
- カバレッジ: Stmts 97.54% / Branch 86.04% / Funcs 95.83% / Lines 97.54%
- アクセシビリティ: `aria-pressed`, `role="progressbar"`, `aria-valuenow/min/max` 設定済み

## 依存関係

- **TASK-SDK-SC-01** の成果物のみに依存（`skillCreator.ts`, `skillCreatorSession.ts`, `channels.ts`）
- step-02-par 内の他タスクとは並列実行可能（依存なし）

## 使用方法

```tsx
import { SkillCreatorConversationPanel } from "./components/skill-creator/SkillCreatorConversationPanel";

<SkillCreatorConversationPanel
  onComplete={() => navigateToSkillPreview()}
  onError={(message) => setErrorMessage(message)}
/>;
```

## Phase 11 Screenshots

Phase 11 の視覚証跡は次のパスに保存済み。

- `outputs/phase-11/task-sdk-sc-02/screenshots/`
- `outputs/phase-11/task-sdk-sc-02/phase11-capture-metadata.json`
- `outputs/phase-11/task-sdk-sc-02/screenshot-plan.json`

## 未タスク

なし — 全仕様書の要件をカバー済み。

### 使い方

`SkillCreateWizard` と `SkillLifecyclePanel` は `RuntimeSkillCreatorExecuteResponse` を受け取ったら、structured error を `result.error.message` に変換して表示する。
ack だけが返る経路では `getWorkflowState(planId)` で snapshot を再読込し、handoff / failure を即時に UI へ反映する。
`verifyAndImproveLoop()` の improve 失敗時は `recordImproveFailureSnapshot()` が `recordImproveFailure()` を呼び、`improve` phase を保った failure snapshot を返す。
structured error の `code` は `llm_adapter_unavailable` なので、ユーザーには「設定を確認してください」という行動可能な文言を残せる。

### 検証

| コマンド                                                                                                                                                                                                                                                                                                                                                                                                                                                 | 結果                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `pnpm --filter @repo/shared typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                   | PASS                       |
| `pnpm --filter @repo/desktop typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                  | PASS                       |
| `pnpm --filter @repo/desktop exec eslint src/main/services/runtime/RuntimeSkillCreatorFacade.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts src/renderer/components/skill/SkillCreateWizard.tsx src/renderer/components/skill/SkillLifecyclePanel.tsx` | PASS                       |
| `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts src/renderer/components/skill/__tests__/SkillCreateWizard.llm-generation.test.tsx`                                                                              | PASS（4 files / 69 tests） |

### current / baseline

- current facts: 2026-04-04 の runtime guard 追加、typed execute error response 追加、Phase 11/12 outputs 更新
- baseline: `TASK-SDK-SC-02` の conversation UI 出力は current facts ではないため置換済み

---

## 未タスク GitHub Issue 番号記録

Phase 10 最終レビューで MINOR 指摘として formalize された未タスクの Issue 番号を記録する。

| タスクID                                                       | タイトル                                                     | Issue番号 |
| -------------------------------------------------------------- | ------------------------------------------------------------ | --------- |
| TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001 | `verifyAndImproveLoop()` での improve adapter error 通知整理 | #1896     |
| TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001         | `executeAsync()` での error message 形式統一                 | #1897     |
