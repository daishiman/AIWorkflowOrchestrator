# リファクタリング計画

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 8                                     |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日 | 2026-03-31                            |

## 変更一覧

| 変更ID | 対象ファイル                                                                         | 変更種別 | Before（要約）                                               | After（要約）                                                | 理由                                       |
| ------ | ------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------ |
| RF-001 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | 移動     | `testSemanticLayer()` がインライン定義                       | `layers/semantic-layer.ts` にエクスポート関数として移動      | 単一責務原則。層1 の変更が他層に波及しない |
| RF-002 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | 移動     | `testVisualLayer()` がインライン定義                         | `layers/visual-layer.ts` にエクスポート関数として移動        | 単一責務原則。層2 の変更が他層に波及しない |
| RF-003 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`                | 移動     | `encodeScreenshot()` がプライベート定義                      | `utils/screenshot-utils.ts` にエクスポート関数として移動     | 複数スクリプトから再利用可能にする         |
| RF-004 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | 移動     | `launchElectronApp()` がインライン定義                       | `utils/electron-launcher.ts` に移動                          | 起動オプション変更時の変更箇所を限定       |
| RF-005 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` | 移動     | `SemanticTestResult` 型定義が末尾に定義                      | `types.ts` に集約                                            | 型定義の一元管理                           |
| RF-006 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`                | 移動     | `UXEvaluationResult` 等の型定義                              | `types.ts` に集約                                            | 型定義の一元管理                           |
| RF-007 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`                | 抽出     | 個別の `console.error` / `process.exit`                      | `utils/error-handler.ts` の `handleEvaluationError()` で統一 | エラー出力フォーマットの統一とテスト容易化 |
| RF-008 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`                | 抽出     | unassigned-task 生成ロジックが `main()` 内に混在             | `evaluate-ui-ux-unassigned-task.js` として独立モジュール化   | 評価実行・記録・生成の責務を明確に分離     |
| RF-009 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`                | 抽出     | 評価結果の Markdown 変換が `saveEvaluationReport()` 内に混在 | `evaluate-ui-ux-report-formatter.js` として独立モジュール化  | フォーマット変更時の影響範囲を限定         |

## リファクタリング後のファイル構成

```
.claude/skills/task-specification-creator/scripts/
├── types.ts                           # 共通型定義（RF-005, RF-006）
├── evaluate-ui-ux-playwright.config.ts       # Playwright設定（変更なし）
├── evaluate-ui-ux-playwright-e2e.ts          # エントリポイント（テストスイートのみ）
├── evaluate-ui-ux.js                  # CLI エントリポイント（委譲のみ）
├── layers/
│   ├── semantic-layer.ts              # 層1: Semantic確認（RF-001）
│   ├── visual-layer.ts                # 層2: Visual確認（RF-002）
│   └── ai-ux-layer.ts                 # 層3: AI UX評価（Claude API委譲）
├── utils/
│   ├── screenshot-utils.ts            # スクリーンショット共通処理（RF-003）
│   ├── electron-launcher.ts           # Electron起動設定（RF-004）
│   └── error-handler.ts              # エラーハンドリング共通化（RF-007）
├── feedback/
│   ├── evaluate-ui-ux-unassigned-task.js   # unassigned-task生成（RF-008）
│   └── evaluate-ui-ux-report-formatter.js           # 評価結果Markdown変換（RF-009）
└── __tests__/
    └── evaluate-ui-ux.js.test.ts        # 単体テスト（インポートパス更新）
```

## 影響範囲

- テストへの影響: インポートパスの更新のみ
- 外部 API: 変更なし（型定義の移動のみ）
- Phase 4〜7 成果物への影響: なし（スクリプト動作は同一）

## 動作等価性の確認

| 確認項目                                       | 確認方法                                |
| ---------------------------------------------- | --------------------------------------- |
| `testSemanticLayer()` の戻り値                 | Before/After で同じ型・同じ値が返る     |
| `testVisualLayer()` のスクリーンショット保存先 | ファイルパスが変わっていないこと        |
| `evaluateUIWithClaude()` の戻り値              | モック使用で同一 JSON が返ること        |
| `generateUnassignedTasks()` の出力             | Before/After で同じファイルが生成される |
