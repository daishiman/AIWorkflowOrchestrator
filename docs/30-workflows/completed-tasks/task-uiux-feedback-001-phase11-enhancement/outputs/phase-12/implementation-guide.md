# Implementation Guide: Phase 11 UI/UX 3層評価フィードバックループ

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 12                                    |
| 機能名   | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日   | 2026-03-31                            |
| タスクID | TASK-UIUX-FEEDBACK-001                |

## Part 1: 概念説明

### なぜ必要か

画面チェックを 1 人で全部やると、見落としが出やすい。だから「同じ基準で何度でも確認できる仕組み」を先に固定する必要がある。

### 何をするか

「意味」「見た目」「使いやすさ」を別々に見る 3 人の検査係を用意するイメージで考える。

| 層  | 役割     | たとえ                                       |
| --- | -------- | -------------------------------------------- |
| 層1 | Semantic | 持ち物の名前札がちゃんと付いているかを見る人 |
| 層2 | Visual   | 昨日の写真と見比べて変な崩れがないかを見る人 |
| 層3 | AI UX    | 初めて使う人が迷わないかを代わりに点検する人 |

### なぜ必要か

人手だけだと、毎回同じ基準で確認し続けるのが難しい。3層に分けると、どこで問題が起きたかを切り分けやすくなる。

### どこに証跡を置くか

この workflow では、証跡を `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-11/` に集める。現時点では実測前なので、`screenshots/phase11-capture-metadata.json` は `not_run`、画像は placeholder だけになっている。

## Part 2: 技術説明

### current 実体

3層評価の正本は workflow 直下ではなく、スキル正本側にある。

```text
.claude/skills/task-specification-creator/
├── agents/evaluate-ui-ux.md
├── scripts/evaluate-ui-ux-playwright.config.ts
├── scripts/evaluate-ui-ux-playwright-e2e.ts
├── scripts/evaluate-ui-ux.js
├── scripts/evaluate-ui-ux-prompt-loader.js
├── scripts/evaluate-ui-ux-screenshot.js
├── scripts/evaluate-ui-ux-report-formatter.js
├── scripts/evaluate-ui-ux-unassigned-task.js
├── scripts/evaluate-ui-ux-types.d.ts
└── scripts/__tests__/
    ├── evaluate-ui-ux.test.ts
    └── evaluate-ui-ux-prompt-loader.test.ts
```

### 実行フロー

```text
Playwright config
  -> evaluate-ui-ux-playwright-e2e.ts
     -> testSemanticLayer()
     -> testVisualLayer()
  -> screenshots を current workflow へ保存
  -> evaluate-ui-ux.js
     -> loadPrompt()
     -> encodeScreenshot()
     -> Anthropic API
     -> saveEvaluationReport()
     -> generateUnassignedTasks()
```

### 主要インターフェース

```ts
type Severity = "HIGH" | "MEDIUM" | "LOW";

interface UXEvaluationResult {
  usabilityIssues: Array<{
    id: string;
    description: string;
    severity: Severity;
  }>;
  accessibilityConcerns: Array<{
    id: string;
    concern: string;
    wcagCriteria: string;
    severity: Severity;
  }>;
  improvements: Array<{
    priority: number;
    suggestion: string;
    effort: Severity;
  }>;
}
```

### API/CLI シグネチャ

```bash
npx playwright test \
  --config .claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts
```

```bash
node .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js \
  --screenshot "docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-11/screenshots/*.png" \
  --output docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-11 \
  --task-id TASK-UIUX-FEEDBACK-001
```

### 使用例

```bash
# baseline 生成
npx playwright test \
  --config .claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts \
  --update-snapshots

# AI UX 評価
node .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js \
  --screenshot "docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-11/screenshots/*.png" \
  --output docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-11 \
  --task-id TASK-UIUX-FEEDBACK-001
```

### エラーハンドリング

- screenshot 引数がない場合は CLI usage を出して終了する
- Claude API の戻り値が text でない場合は error を投げる
- prompt loader は必須セクションが見つからなければ error を投げる
- HIGH 問題だけを `unassigned-task/` 化し、MEDIUM/LOW はレポートのみに残す

### エッジケース

- screenshot が 0 件なら evaluator は error で停止する
- `task-id` を渡さないと default 文脈になるため、workflow ごとに明示する
- placeholder screenshot は completed evidence ではない
- Phase 11 実測前は `spec_created` / `not_run` を維持する

### 設定項目と定数一覧

| 項目              | 値                                       | 説明                                |
| ----------------- | ---------------------------------------- | ----------------------------------- |
| モデル            | `claude-opus-4-5`                        | `evaluate-ui-ux.js` の current 設定 |
| `max_tokens`      | `2048`                                   | Claude API 応答上限                 |
| `maxDiffPixels`   | `50`                                     | Visual 比較の閾値                   |
| screenshot 出力先 | `docs/.../outputs/phase-11/screenshots/` | current workflow 配下               |

### テスト

| テストファイル                                           | 主対象                 |
| -------------------------------------------------------- | ---------------------- |
| `scripts/__tests__/evaluate-ui-ux.test.ts`               | API / save / task 生成 |
| `scripts/__tests__/evaluate-ui-ux-prompt-loader.test.ts` | section 抽出 / 置換    |

### スクリーンショット参照

- 現在の placeholder: `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-11/screenshots/scaffold-placeholder.png`
- current metadata: `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/outputs/phase-11/screenshots/phase11-capture-metadata.json`

この 2 つは「まだ実行していない」ことを示すだけで、Phase 11 完了証跡ではない。

## Part 3: 未タスク Issue 一覧（Phase 12 起票）

TASK-UIUX-FEEDBACK-001 の開発中に発見した未タスクを以下の Issue として起票した。

| Issue                                                                    | タスクID                                   | タイトル                                                      | 優先度 | 規模   |
| ------------------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------- | ------ | ------ |
| [#1797](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1797) | UT-UIUX-PLAYWRIGHT-E2E-COMPLETE-001        | Playwright E2E テスト骨格の実装完成（UI/UX 3層評価 Layer1/2） | 中     | 中規模 |
| [#1798](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1798) | UT-UIUX-EVALUATE-ERROR-HANDLING-001        | evaluate-ui-ux.js エラーハンドリング強化                      | 低     | 小規模 |
| [#1799](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1799) | UT-UIUX-MIRROR-SYNC-CI-001                 | .claude/.agents skills mirror sync CI/CD 自動検出             | 低     | 小規模 |
| [#1800](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1800) | UT-UIUX-PLACEHOLDER-EVIDENCE-VALIDATOR-001 | Phase 11/12 placeholder-only evidence 自動バリデーター実装    | 低     | 小規模 |

### 起票日

2026-03-31

### 起票根拠

- #1797: `evaluate-ui-ux-playwright-e2e.ts` がスケルトン状態のまま残存
- #1798: `parseEvaluationResponse()` 外層の try-catch 不足・タイムアウト未対応
- #1799: `.claude/` vs `.agents/` の mirror divergence を CI が自動検出できない
- #1800: `status: "not_run"` / placeholder ファイルが Phase 完了扱いになる構造的問題
