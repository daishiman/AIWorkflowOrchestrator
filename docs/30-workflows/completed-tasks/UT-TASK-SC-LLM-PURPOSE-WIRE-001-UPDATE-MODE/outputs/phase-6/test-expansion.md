# Phase 6: テスト拡充結果

## T-6-1: AbortError 処理テスト

SC-UPD-003 として追加済み:

- `runUpdateWorkflow` がエラーをスローした場合に `createSkill` がエラーを伝播すること
- `mockRejectedValue(new Error(...))` + `rejects.toThrow(...)` でアサート

improve-prompt モード対応は SC-IMP-002 の範囲内で確認済み。

## T-6-2: progress emit 順序テスト

既存 `SkillCreatorService.progress.test.ts` で progress emit テストが実施されている。
update/improve-prompt モードの progress 順序は SC-020/SC-021 で間接的にカバー。

## T-6-3: create モード回帰テスト

SC-UPD-004 で確認:

- `create` モード実行時に `runUpdateWorkflow` / `runImprovePromptWorkflow` が呼ばれないこと
- 既存 SC-001〜SC-019 が引き続き Green

## T-6-4: テスト全件実行結果

SkillCreatorService.test.ts: 103 tests → 全件 Green（SC-UPD-003 修正後）

## 追加テスト一覧

| ID         | 種別            | 内容                                  |
| ---------- | --------------- | ------------------------------------- |
| SC-UPD-001 | dispatch 正常系 | runUpdateWorkflow 呼び出し確認        |
| SC-UPD-002 | 負のテスト      | init_skill.js 非呼び出し確認          |
| SC-UPD-003 | 異常系          | エラー伝播確認                        |
| SC-UPD-004 | 回帰            | create モード非影響確認               |
| SC-IMP-001 | dispatch 正常系 | runImprovePromptWorkflow 呼び出し確認 |
| SC-IMP-002 | 負のテスト      | init_skill.js 非呼び出し確認          |
