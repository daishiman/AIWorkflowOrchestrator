# Phase 1 成果物: 受け入れ基準（AC-1〜AC-6）

## タスクID: TASK-SC-LLM-PURPOSE-WIRE-001

| ID   | 受け入れ基準                                                                                                        | 検証方法                                                                             |
| ---- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| AC-1 | `runCreateWorkflow` 内で `extract-purpose` エージェント定義を LLM に渡す処理が実装されていること                    | コードレビュー: `grep -n "llmClient\|complete\|systemPrompt" SkillCreatorService.ts` |
| AC-2 | `StructurePlanJson.purpose` に LLM の推論結果が格納されていること（raw 文字列ではないこと）                         | ユニットテスト: LLM モックの戻り値が `purpose` に反映されることを検証                |
| AC-3 | LLM 呼び出し方式（直接呼び出し: `ILLMClient.complete()`）が設計ドキュメントに明記されていること                     | Phase 2 設計書の確認                                                                 |
| AC-4 | `loadAgent` 失敗時のエラーハンドリング（null 返却）が実装されていること                                             | テスト TC-06: `loadAgent` が throw した場合に `createSkill` が正常完了すること       |
| AC-5 | LLM 呼び出し失敗時（result.success=false / throw / selected config 未選択）のエラーハンドリングが実装されていること | テスト TC-04/TC-05/TC-07: フォールバック動作の検証                                   |
| AC-6 | 既存テスト（SC-001〜SC-031）が全て PASS すること                                                                    | `pnpm --filter @repo/desktop exec vitest run __tests__/SkillCreatorService.test.ts`  |

---

## 検証可能性の確保

各 AC は以下の方法で機械的に検証可能である:

- **AC-1**: `grep -n "this\.llmClient\.complete" SkillCreatorService.ts` が1件以上ヒット
- **AC-2**: TC-01 の `expect(mockLlmClient.complete).toHaveBeenCalledTimes(1)` が PASS
- **AC-3**: `outputs/phase-2/design.md` に「Option A 採用」と「ILLMClient.complete()」の記載が存在
- **AC-4**: TC-06 が PASS（`loadAgent` throw → `createSkill` が例外なく完了）
- **AC-5**: TC-04/TC-05 が PASS（LLM 失敗/例外 → `createSkill` が例外なく完了）
- **AC-6**: vitest の全テスト PASS（終了コード 0）
