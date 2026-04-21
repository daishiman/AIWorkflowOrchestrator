# Phase 4: Red テスト計画

## タスクID: TASK-SC-CREATOR-UPDATE-IMPL-001

## 方針

- 既存 `SkillCreatorService.test.ts` の末尾に `describe("runUpdateWorkflow")` ブロックを追加
- `createSkill()` public API 経由でテストするため、内部実装を直接呼ばない
- 既存の beforeEach モックセットアップを継承し、上書きする形で各 TC を構成する

## 追加するテストブロック

```
describe("runUpdateWorkflow (TASK-SC-CREATOR-UPDATE-IMPL-001)", () => {
  - update-TC-01: 既存 SKILL.md からの purpose 読み込み
  - update-TC-02: LLM による purpose 再生成
  - update-TC-03: LLM 失敗時フォールバック
  - update-TC-04: SKILL.md 不存在時の description フォールバック
  - update-TC-05: AbortSignal 中断
  - update-TC-06: progress emit 順序
})
```

## モック設定

| モック対象               | update-TC-01          | update-TC-02          | update-TC-03          | update-TC-04 |
| ------------------------ | --------------------- | --------------------- | --------------------- | ------------ |
| `fs.readFile` (SKILL.md) | frontmatter付きMD返す | frontmatter付きMD返す | frontmatter付きMD返す | ENOENT       |
| `llmClient.generate`     | なし                  | JSON summary 返す     | Error スロー          | なし         |
| `ScriptExecutor.execute` | success:true          | success:true          | success:true          | success:true |

## 実装前の Red 確認

`runUpdateWorkflow()` が存在しない状態（stub のみ）では:

- update-TC-01〜06: SC-020 は既存進捗 emit のみで通るが、purpose 再生成・フォールバック検証は失敗する
- 実装後に Green になることを確認する
