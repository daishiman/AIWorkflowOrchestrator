# 検証マトリクス — TASK-SC-CREATOR-UPDATE-IMPL-001

> Phase 2 成果物 / 作成日: 2026-04-21

---

## 1. 概要

本ドキュメントは `runUpdateWorkflow()` 実装の検証観点と期待結果を整理する。  
各観点は typecheck / unit test / update path / cancel path の4軸で構成する。

---

## 2. 検証観点テーブル

### 2-1. Typecheck（型検査）

| ID         | 観点                                                                      | 期待結果             | 確認方法         |
| ---------- | ------------------------------------------------------------------------- | -------------------- | ---------------- |
| TC-TYPE-01 | `runUpdateWorkflow()` の戻り値型が `Promise<StructurePlanJson \| null>`   | コンパイルエラーなし | `pnpm typecheck` |
| TC-TYPE-02 | `structurePlan` への代入（`case "update":` 内）が型整合                   | コンパイルエラーなし | `pnpm typecheck` |
| TC-TYPE-03 | `fs.readFile()` の戻り値（string）が適切に処理される                      | コンパイルエラーなし | `pnpm typecheck` |
| TC-TYPE-04 | `signal?: AbortSignal` の省略可能引数が正しく型定義される                 | コンパイルエラーなし | `pnpm typecheck` |
| TC-TYPE-05 | `StructurePlanJson.features` が `string[]` 型（空配列 `[]` の代入可能性） | コンパイルエラーなし | `pnpm typecheck` |

---

### 2-2. Unit Test（単体テスト）

| ID       | 観点                                                          | テストファイル                                    | 期待結果                                                                                                |
| -------- | ------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| TC-UT-01 | `createSkill({ mode: "update" })` が成功し skillDir を返す    | `SkillCreatorService.test.ts` SC-020              | resolve(skillDir)                                                                                       |
| TC-UT-02 | update モードで `llmClient.generate` が呼ばれる               | 新規テスト or SC-020 拡張                         | `mockLlmClient.generate` が 1 回呼ばれる                                                                |
| TC-UT-03 | update モードで `fs.readFile` が SKILL.md パスで呼ばれる      | 新規テスト                                        | `readFile` の引数が `*/SKILL.md` にマッチ                                                               |
| TC-UT-04 | LLM 失敗時に `fs.readFile` の内容でフォールバック             | 新規テスト                                        | `generate` reject 時も resolve(skillDir)                                                                |
| TC-UT-05 | `llmClient` 未注入でも update モードが成功する                | SC-020 の llmClient なしバリアント                | resolve(skillDir)                                                                                       |
| TC-UT-06 | SKILL.md が存在しない場合（readFile 失敗）でも成功            | 新規テスト                                        | resolve(skillDir)（ENOENT を graceful に処理）                                                          |
| TC-UT-07 | `structurePlan.purpose` に LLM 生成値が格納される             | 新規テスト                                        | generateSkillMd に渡される plan の purpose が LLM 値と一致                                              |
| TC-UT-08 | progress emit シーケンスが `PROGRESS_FLOWS.update` と一致する | `SkillCreatorService.progress.test.ts` または新規 | onProgress コールバックの呼び出し順序: loading-skill → analyzing → generating-skill → validating → done |

---

### 2-3. Update Path（update モード処理フロー）

| ID       | 観点                                                                                       | 期待結果                                                                               |
| -------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| TC-UP-01 | `runUpdateWorkflow()` が `throwIfAborted()` を少なくとも 1 回呼ぶ                          | abort 前の呼び出しで AbortError が伝播する                                             |
| TC-UP-02 | purpose 解決の優先順位が LLM > 既存 SKILL.md > description の順                            | LLM 成功時は LLM 値。LLM 失敗・SKILL.md あり時は SKILL.md 値。両方なし時は description |
| TC-UP-03 | `features` フィールドが空配列 `[]`                                                         | `generateSkillMd()` に渡される `StructurePlanJson.features` が `[]`                    |
| TC-UP-04 | `agents` フィールドが `["extract-purpose"]`                                                | `generateSkillMd()` に渡される `StructurePlanJson.agents` が `["extract-purpose"]`     |
| TC-UP-05 | `runUpdateWorkflow()` が `null` を返した場合、`ensureSkillMdExists()` が呼ばれる           | `structurePlan === null` の分岐（L487-509）が `update` モードに適用される              |
| TC-UP-06 | `case "update":` の try/catch が `runUpdateWorkflow()` の非 abort 例外を捕捉し null にする | `runUpdateWorkflow()` が throw した場合も `createSkill()` は resolve する              |

---

### 2-4. Cancel Path（キャンセル処理フロー）

| ID       | 観点                                                                                            | 期待結果                                                                                     |
| -------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --- | --------------------------------------- |
| TC-CP-01 | `runUpdateWorkflow()` 呼び出し前に abort 済みの場合、AbortError がスローされる                  | `emitProgress("loading-skill")` 後・`runUpdateWorkflow()` 前の `throwIfAborted()` が機能する |
| TC-CP-02 | `runUpdateWorkflow()` 内の `fs.readFile()` 中に abort した場合、AbortError が伝播する           | `throwIfAborted()` が readFile 後に配置されていること                                        |
| TC-CP-03 | `runUpdateWorkflow()` 内の `extractPurposeWithLlm()` 中に abort した場合、AbortError が伝播する | `extractPurposeWithLlm()` が signal を受け取り abort を rethrow する                         |
| TC-CP-04 | `case "update":` の catch ブロックが AbortError を rethrow する                                 | `isAbortError(error)                                                                         |     | operationSignal.aborted` の条件で throw |
| TC-CP-05 | キャンセル後、`cleanupCancelledSkillDir()` が呼ばれる                                           | `existedBefore = false` かつ abort の場合、skillDir が削除される                             |
| TC-CP-06 | `cancelCurrentOperation()` 後に `currentAbortController` が null になる                         | finally ブロックのリセット処理が機能する                                                     |

---

## 3. 検証フェーズマッピング

| 検証 ID 群     | 実施フェーズ                         | 担当                          |
| -------------- | ------------------------------------ | ----------------------------- |
| TC-TYPE-01〜05 | Phase 5（実装後即時）                | CI typecheck                  |
| TC-UT-01〜08   | Phase 4（TDD Red）→ Phase 5（Green） | Vitest                        |
| TC-UP-01〜06   | Phase 5〜6                           | Vitest                        |
| TC-CP-01〜06   | Phase 5〜6                           | Vitest（cancel.test.ts 参照） |

---

## 4. 境界値テスト補足

| ケース                        | 入力条件                          | 期待動作                                                        |
| ----------------------------- | --------------------------------- | --------------------------------------------------------------- |
| SKILL.md が空ファイル         | `readFile` が空文字列を返す       | purpose フォールバックで `options.description` を使用           |
| LLM が空文字列を返す          | `generate` が `""` を返す         | `normalizePurposeResponse("")` が `""` を返し、フォールバックへ |
| skillName が最大長（100文字） | `options.name.length === 100`     | バリデーション通過、正常処理                                    |
| `llmClient` が `undefined`    | コンストラクタに渡さない          | `extractPurposeWithLlm()` が `null` を返す→フォールバック       |
| SKILL.md が読み取り権限なし   | `readFile` が EACCES でリジェクト | null フォールバック（non-fatal）                                |
