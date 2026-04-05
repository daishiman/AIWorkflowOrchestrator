# Phase 2: 統合トポロジー設計

## 統合トポロジー（Concern 別）

| Concern                 | Owner                     | 入力                       | 出力                          | 備考                |
| ----------------------- | ------------------------- | -------------------------- | ----------------------------- | ------------------- |
| SDK セッション実行      | SkillExecutor             | SkillExecuteRequest        | sdkEvents                     | 既存                |
| LLM 応答パース          | parseLlmResponseToContent | sdkEvents                  | SkillGeneratedContent \| null | 既存                |
| skillName 方針          | RuntimeSkillCreatorFacade | planResult.skillName       | skillNameToPersist            | raw pass-through    |
| ファイル書き出し        | SkillFileWriter.persist   | (skillName, content, opt)  | PersistResult                 | 既存                |
| 結果返却                | RuntimeSkillCreatorFacade | persistResult/persistError | executeResult                 | 既存                |
| OutputHandler（別系統） | SkillCreatorOutputHandler | sessionOutput              | `.claude/skills/{dirName}`    | toSlug は path-safe |

## データフロー（要約）

```
RuntimeSkillCreatorFacade.execute()
  |
  +-- parseLlmResponseToContent(sdkEvents)
  |     -> content | null
  |
  +-- if content != null and skillFileWriter injected
  |     -> skillFileWriter.persist(planResult.skillName, content, { overwrite: true })
  |
  +-- return { ...executeResult, persistResult, persistError }
```

## テストで守るべきこと（Current Facts）

- persist-integration は 22件（`F-01〜F-06`, `E-10〜E-16`, `E-21〜E-29`）
- 正常系は `E-*` ではなく `F-01/F-02`
- `E-11` は PATH_TRAVERSAL（正常系ではない）
