# Implementation Guide

## 何を直したか

この修正は、Runtime Skill Creator の失敗系 workflow state が途中で壊れないようにするためのものです。実行が失敗しても `review` に戻り、次に何を確認するかを state に残せるようにしました。

## 実装ポイント

1. engine に transition guard を入れて、許可されていない phase jump を止めた。
2. engine の artifact 保存を append に変えて、失敗履歴を残せるようにした。
3. `success:false` と reject を `verification_review` 付きの `review` へ戻した。
4. verify fail review で prompt を残し、再レビューに必要な説明を state に保存した。

## 変更ファイル

- `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.workflow-orchestration.test.ts`

## 検証

- targeted runtime workflow tests は PASS
- wider runtime suite は `ManifestLoader.test.ts` の alias 解決失敗が残る
