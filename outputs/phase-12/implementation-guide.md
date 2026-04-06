# Phase 12: 実装ガイド — TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001

## 概要

`RuntimeSkillCreatorFacade.execute()` / `improve()` に LLMAdapter の状態ガードを追加し、初期化前・失敗時に明確なエラーを返すようにした。あわせて `RuntimeSkillCreatorExecuteErrorResponse` を追加し、renderer 側で structured error をメッセージに正規化する。

## 変更内容

- `RuntimeSkillCreatorFacade.execute()` / `improve()` の先頭に `_llmAdapterStatus` ガードを追加
- `RuntimeSkillCreatorExecuteErrorResponse` を shared types に追加
- renderer の consumer で structured error を message に正規化
- execute ack 後に workflow snapshot を再読込し、failure snapshot を UI に反映
- improve 失敗時は `recordImproveFailure()` 経由で improve phase の snapshot を保持

## Part 1: 中学生レベルの説明

### なぜ必要か

AI に仕事を頼む前に「まだ準備中」や「準備に失敗した」状態があり、そのまま実行するとわかりにくい失敗になります。最初に状態を確認して、はっきり「今は使えない」と返す必要がありました。

### 何をしたか

実行を始める前に「準備できているか」を確認し、準備ができていない場合は分かりやすいエラーを返すようにしました。これにより、失敗理由があいまいにならず、ユーザーが次にやるべきことを判断しやすくなりました。

### たとえ

自動販売機でジュースを買う前に「在庫切れ」ランプが点くのと同じです。先に教えてくれるので、無駄にボタンを押して困らなくなります。

## Part 2: 技術者向け

### 変更ファイル

- `packages/shared/src/types/skillCreator.ts`
- `packages/shared/src/types/index.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.*.test.ts`
- `packages/shared/src/types/__tests__/skillCreator.contract-parity.test.ts`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-report.md`
- `outputs/phase-11/discovered-issues.md`
- `outputs/phase-11/ui-sanity-visual-review.md`

### 追加された型

```ts
export interface RuntimeSkillCreatorExecuteErrorResponse {
  success: false;
  error: { code: RuntimeSkillCreatorDegradedReason; message: string };
}
```

`RuntimeSkillCreatorExecuteResponse` は上記 error 型を含む union に拡張される。

### エラーハンドリング

- `_llmAdapterStatus === "failed"` の場合は `llm_adapter_unavailable` を返す
- `_llmAdapterStatus === "initializing"` の場合は初期化中のメッセージを返す
- execute ack 後の snapshot 再読込により、failure path の UI 反映漏れを防止

### 影響範囲

- IPC や public channel の追加はなし
- 既存の正常系レスポンスは互換維持

### 画面証跡

本タスクは runtime guard 追加のため UI の追加変更なし。Phase 11 は NON_VISUAL の証跡で記録している。
