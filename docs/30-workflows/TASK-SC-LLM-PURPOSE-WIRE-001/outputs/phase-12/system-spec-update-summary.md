# Phase 12 成果物: システム仕様書更新サマリー

## タスクID: TASK-SC-LLM-PURPOSE-WIRE-001

## 更新対象と内容

| 仕様項目                             | 変更前                                       | 変更後                                                              |
| ------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------- |
| `StructurePlanJson.purpose` の値     | `loadAgent("extract-purpose")` の raw 文字列 | LLM 推論結果（空文字・空白は `options.description` フォールバック） |
| `SkillCreatorService` コンストラクタ | `(skillsDir?, workflowsDir?)`                | `(skillsDir?, workflowsDir?, llmClient?: ILLMClient)`               |
| `runCreateWorkflow` のエラー処理     | 単一 try/catch で全エラーを処理              | loadAgent 失敗と LLM 失敗を独立した try/catch で分離処理            |

## 設計ドキュメントへの影響

| ドキュメント   | 影響         | 内容                                                           |
| -------------- | ------------ | -------------------------------------------------------------- |
| Phase 2 設計書 | 新規作成済み | LLM 呼び出し方式（Option A）・変更設計・エラーハンドリング設計 |
| tsconfig.json  | 変更済み     | `@repo/shared/services/llm/types` エイリアス追加               |

## 後続タスクへの影響

| 後続タスク                                 | 影響                                                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 | `purpose` フィールドが LLM 推論結果文字列になることで、generate_skill_md.js への入力精度が向上 |

補足: default client で後方互換を維持し、`normalizePurpose` で空文字・空白応答を `description` に戻す。
