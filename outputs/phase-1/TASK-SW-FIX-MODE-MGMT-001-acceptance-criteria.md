# Phase 1 成果物: 受け入れ基準書（AC-1〜AC-5）

## タスクID: TASK-SW-FIX-MODE-MGMT-001

| AC-ID | 受け入れ基準                                                                          | 検証コマンド / 方法                                            | 合否 |
| ----- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---- |
| AC-1  | Step 0 からラジオボタン（「テンプレートから作成」「LLMで生成」）が削除されている      | `queryByText("テンプレートから作成")` が null / TC-01, TC-02   | PASS |
| AC-2  | `generationMode` state が `SkillCreateWizard.tsx` から完全に削除されている            | `grep -rn "generationMode" apps/desktop/src/` で実装コード 0件 | PASS |
| AC-2  | `hasActivatedLlmMode` state が `SkillCreateWizard.tsx` から完全に削除されている       | `grep -rn "hasActivatedLlmMode" apps/desktop/src/` で 0件      | PASS |
| AC-3  | Step 0 の「次へ」が常に Step 1（ConversationRoundStep）へ遷移する                     | TC-03                                                          | PASS |
| AC-4  | Step 1（Q1〜Q6）が LLM モードでもスキップされない                                     | TC-04, TC-05                                                   | PASS |
| AC-5  | 既存テンプレートモードのテストが全件 PASS または LLM 専用化に伴い適切に更新されている | TC-01〜TC-06 全 PASS + pnpm test                               | PASS |

### 品質要件チェック

| 項目                  | 基準                             | 結果                  |
| --------------------- | -------------------------------- | --------------------- |
| `pnpm lint`           | 0 エラー                         | Phase 9 で確認        |
| `pnpm typecheck`      | 0 エラー                         | Phase 9 で確認        |
| テストカバレッジ      | SkillCreateWizard.tsx で 80%以上 | Phase 7 で確認        |
| generationMode 残骸   | 全ファイルで 0 件                | PASS（grep 確認済み） |
| template 条件分岐残骸 | 全ファイルで 0 件                | PASS（grep 確認済み） |
