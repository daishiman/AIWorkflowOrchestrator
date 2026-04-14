# Phase 4 成果物: テスト仕様書

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## テストコマンド

```bash
pnpm --filter @repo/desktop test --run apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

## テストマトリクス

| TC-ID | シナリオ           | command suite                                                     | expected result        |
| ----- | ------------------ | ----------------------------------------------------------------- | ---------------------- |
| TC-01 | ラジオボタン非表示 | queryByText("テンプレートから作成") / queryByText("LLMで生成")    | どちらもnull           |
| TC-02 | セレクタ要素非存在 | queryByTestId("generation-mode-selector")                         | null                   |
| TC-03 | Step 0→Step 1遷移  | fillStep0 → click(次へ) → waitFor(wizard-step-conversation-round) | Step 1が表示           |
| TC-04 | Step 2直接遷移不可 | fillStep0 → click(次へ) → assert(wizard-step-generate is null)    | Step 2は表示されない   |
| TC-05 | 正規フロー通過     | Step 0→1→2→3を順番に通過                                          | 各testidが順番に表示   |
| TC-06 | 旧コード残骸ゼロ   | rg "generationMode\|hasActivatedLlmMode"                          | 実装ファイルに参照なし |

## テストファイル

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`
- describe: `"TASK-SW-FIX-MODE-MGMT-001: LLM専用フロー検証"`

## Red確認方法

実装変更前にテストを実行し、TC-01〜TC-05がFAIL（ラジオボタンが存在するため）することを確認する。
TC-06はコード検索テストのため実装後に確認。
