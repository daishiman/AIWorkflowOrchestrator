# Phase 5: 実装

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 5                               |
| タスクID   | TASK-SC-IMPROVE-PROMPT-IMPL-001 |
| ステータス | pending                         |
| 作成日     | 2026-04-21                      |

## 目的

`runImprovePromptWorkflow()` の実処理と `case "improve-prompt"` からの呼び出しを実装し、LLM / fallback / abort の各経路を成立させる。

## 実行タスク

### Task 1: 実装対象の明確化

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.improve-prompt.test.ts`

### Task 2: 実装

- `case "improve-prompt"` から実処理を呼び出す
- prompt 改善、書き戻し、fallback、abort を実装する
- progress emission を契約どおりに並べる

### Task 3: Green 確認

- targeted test 実行
- 既存回帰テスト実行
- typecheck / lint 実行

## 参照資料

- [Phase 2: 設計](phase-2-design.md)
- [Phase 4: テスト作成](phase-4-test-creation.md)

## 実行手順

1. 実装対象を確定する
2. ワークフロー本体を実装する
3. Green 条件を確認する

## 統合テスト連携

Phase 5 では unit test と将来の manual test が同じ progress 契約とファイル更新結果を観測できるよう、外部契約名を変えない。

## 成果物

- `outputs/phase-5/implementation-diff.md`
- `outputs/phase-5/green-test-results.md`
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

## 完了条件

- [ ] `runImprovePromptWorkflow()` が実装されていること
- [ ] `improve-prompt` から実処理へ到達すること
- [ ] LLM / fallback / abort の3経路がコード上で識別できること
- [ ] Phase 4 で定義した targeted test が Green であること

## タスク 100% 実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物が `outputs/phase-5/` に出力されていること
- [ ] Phase 6 に渡す回帰観点が整理されていること

## 次 Phase

[Phase 6: テスト拡充](phase-6-test-expansion.md) へ進む。
