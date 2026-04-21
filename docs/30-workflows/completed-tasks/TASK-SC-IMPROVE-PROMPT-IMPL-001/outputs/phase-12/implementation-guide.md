# implementation-guide: TASK-SC-IMPROVE-PROMPT-IMPL-001

## Part 1: 実装内容

**たとえ話（中学生レベル）**: SKILL.md は使い方カードで、`improve-prompt` はその説明文だけを読みやすく直す役目です。説明文が曖昧だと次に使う人が迷うため、LLM または改善スクリプトで自動的に書き直します。今回の修正では、改善した説明をあとから新規作成用の処理で上書きしないように流れも整えました。

### 変更ファイル

**`apps/desktop/src/main/services/skill/SkillCreatorService.ts`**

- `case "improve-prompt":` にスタブから実処理呼び出しへ修正
- `runImprovePromptWorkflow()` メソッドを新規追加
- improve-prompt 実行後に `init_skill.js` / `generate_skill_md.js` へ流れないように修正
- LLM 返却値が frontmatter を壊しても original frontmatter を保持する保護を追加

ワークフロー:

```text
loading-skill -> analyzing -> [runImprovePromptWorkflow] -> improving -> validating -> done
```

LLM あり: `fs.readFile` -> `resourceLoader.loadAgent("improve-prompt")` -> `llmClient.generate` -> `frontmatter保全` -> `fs.writeFile`
LLM なし / 失敗時: `improveSkill(name, true)` フォールバック

## Part 2: 技術詳細

### インターフェース

```ts
private async runImprovePromptWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<void>
```

### 分岐

- `llmClient` 不在: `improveSkill(options.name, true)` へ即フォールバック
- `readFile` / `loadAgent` / `llmClient.generate` 失敗: abort 以外は `improveSkill()` へフォールバック
- success: original frontmatter を維持したまま改善本文のみ書き戻す

### 主要定数・契約

- `PROGRESS_FLOWS["improve-prompt"]`: `loading-skill(10) -> analyzing(30) -> improving(65) -> validating(90) -> done(100)`
- `SKILL_FRONTMATTER_PATTERN`: original YAML frontmatter の保持に使用

### エラーハンドリング

- `AbortError` は握りつぶさず rethrow
- abort 以外の LLM 系失敗は `improveSkill()` に退避
- generic bootstrap は `improve-prompt` では走らせず、改善結果の上書きを防止

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
代替証跡は `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md` を参照する。

## 受入基準達成

| AC                                | 達成 |
| --------------------------------- | ---- |
| AC-001: SKILL.md 実際に改善       | ✓    |
| AC-002: LLM 経路                  | ✓    |
| AC-003: fallback 経路             | ✓    |
| AC-004: AbortSignal               | ✓    |
| AC-005: 新規テスト PASS (11/11)   | ✓    |
| AC-006: 既存テスト PASS (148/148) | ✓    |
| AC-007: typecheck / lint PASS     | ✓    |
