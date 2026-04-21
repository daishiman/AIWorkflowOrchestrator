# Phase 1: 要件定義書

## current fact

- `ConversationRoundStep.tsx` に `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001`、`shouldShowMainToolBadge`、`MAIN_TOOL_BADGE_ENABLED` は存在しない
- `SkillCreateWizard.tsx` は `resolveExternalIntegration(toolNames)` を使用している
- git 履歴上、関連 cleanup は PR #2199（commit `2fcca99de`）で完了済み

## 真の論点

cleanup 実装そのものではなく、workflow 文書が未実装前提のまま残っていることが問題である。

## 方針

- `implementation_mode = verify_existing`
- `taskType = NON_VISUAL`
- Phase 4 は targeted verification
- Phase 5 は diff check
- Phase 11 は screenshot 不要

## 4条件の初期判定

| 条件         | 初期判定 | 要点                          |
| ------------ | -------- | ----------------------------- |
| 矛盾なし     | 要修正   | 旧文書は TODO 存在前提だった  |
| 漏れなし     | 要修正   | outputs parity が欠落         |
| 整合性あり   | 要修正   | phase wording が混在          |
| 依存関係整合 | OK       | 依存 cleanup は履歴で確認可能 |
