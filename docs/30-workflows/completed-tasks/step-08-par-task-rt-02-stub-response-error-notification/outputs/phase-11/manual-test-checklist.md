# Phase 11 Manual Test Checklist

## テストケース

| ID       | 内容                              | 期待結果                                     | 結果      |
| -------- | --------------------------------- | -------------------------------------------- | --------- |
| TC-11-01 | 参照ファイルパスの実在確認        | 全ファイルが存在                             | ✅ PASS   |
| TC-11-02 | plan logical error の仕様記述追跡 | facade→ipc→renderer の導線が自己完結         | ✅ PASS   |
| TC-11-03 | execute 抑止の記述確認            | execute() false-success 修正を要求していない | ✅ PASS   |
| TC-11-04 | execute llmAdapter guard          | explicit error response が返る               | ✅ PASS   |
| TC-11-05 | UI エラー表示                     | error message と再試行導線が表示される       | ✅ PASS   |
| NV-11-01 | screenshot 昇格判定               | UI 証跡を保存して監査可能な状態にする        | ✅ VISUAL |

## 参照リンク実在確認

- ✅ `RuntimeSkillCreatorFacade.ts`
- ✅ `creatorHandlers.ts`
- ✅ `skillCreator.ts`
- ✅ `SkillLifecyclePanel.tsx`
- ✅ `SkillCreateWizard.tsx`

## screenshot 昇格判定

code wave を含むため、Phase 11 は current screenshots を `outputs/phase-11/screenshots/` に保存し、証跡リンクを結果ファイルに残す運用へ統一。

保存済み証跡:

- `TC-01-step1-initial-dark.png`
- `TC-02-step1-filled-dark.png`
- `TC-03-step2-configure-dark.png`
- `TC-06-step3-error-dark.png`
- `RT-02-01-skill-create-wizard-error-dark.png`
- `RT-02-02-skill-lifecycle-error-state.png`
