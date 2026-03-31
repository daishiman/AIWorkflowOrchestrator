# Red テスト結果（TDD Red フェーズ）

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 4                                     |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日 | 2026-03-31                            |
| 状態   | Red フェーズ（実装前・期待失敗状態）  |

## 概要

TDD の Red フェーズとして、Phase 5 実装前に全テストが「失敗する（Red）」状態であることを記録する。Phase 5 実装後にすべてのテストが Green になることを目標とする。

## 予想される失敗理由

### SEM テスト（層1 Semantic）

| テストID     | 失敗理由                                                         | 失敗種別                                |
| ------------ | ---------------------------------------------------------------- | --------------------------------------- |
| SEM-001〜007 | `apps/desktop/tests/e2e/phase11-semantic-layer.test.ts` が未作成 | `MODULE_NOT_FOUND` / テストファイルなし |

### VIS テスト（層2 Visual）

| テストID     | 失敗理由                                                                                      | 失敗種別                    |
| ------------ | --------------------------------------------------------------------------------------------- | --------------------------- |
| VIS-001〜007 | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts` が未作成 | テストファイルなし          |
| VIS-001〜007 | ベースライン画像（`outputs/phase-11/screenshots/`）が未生成                                   | `--update-snapshots` 未実行 |

### API/SAVE/TASK テスト（層3 AI UX 評価スクリプト）

| テストID      | 失敗理由                                                                       | 失敗種別                                               |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------ |
| API-001〜005  | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js` が未作成 | `MODULE_NOT_FOUND`                                     |
| SAVE-001〜004 | `saveEvaluationReport()` 関数が未作成                                          | `TypeError: saveEvaluationReport is not a function`    |
| TASK-001〜004 | `generateUnassignedTasks()` 関数が未作成                                       | `TypeError: generateUnassignedTasks is not a function` |

### PAY テスト（payload 検証）

| テストID | 失敗理由                                                         | 失敗種別           |
| -------- | ---------------------------------------------------------------- | ------------------ |
| PAY-001  | `apps/desktop/tests/e2e/phase11-semantic-layer.test.ts` が未作成 | テストファイルなし |

## Red フェーズ確認コマンド

```bash
# Playwright テスト（失敗確認）
npx playwright test apps/desktop/tests/e2e/phase11-semantic-layer.test.ts \
  --config=.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts
# 期待: "Error: Cannot find module" または "Test file not found"

# Vitest 単体テスト（失敗確認）
pnpm vitest run .claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts
# 期待: "Error: Cannot find module '../evaluate-ui-ux.js'"
```

## Phase 5 実装後の期待状態

Phase 5 実装完了後に以下のコマンドで全テスト Green を確認する:

```bash
# 1. ベースライン生成（初回）
npx playwright test .claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts \
  --config=.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts \
  --update-snapshots

# 2. Semantic + Visual テスト実行
npx playwright test apps/desktop/tests/e2e/phase11-semantic-layer.test.ts \
  --config=.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright.config.ts
# 期待: 14 passed (SEM-001〜007 + VIS-001〜007)

# 3. AI 評価スクリプト単体テスト
pnpm vitest run .claude/skills/task-specification-creator/scripts/__tests__/evaluate-ui-ux.test.ts
# 期待: 14 passed (API/SAVE/TASK 計 14 件)
```

## テスト総数

| カテゴリ          | テスト数  | Red フェーズ状態                              |
| ----------------- | --------- | --------------------------------------------- |
| SEM + PAY         | 8 件      | 全失敗（ファイル未作成）                      |
| VIS               | 7 件      | 全失敗（ファイル未作成 + ベースライン未生成） |
| API + SAVE + TASK | 13 件     | 全失敗（ファイル未作成）                      |
| **合計**          | **28 件** | **全 Red**                                    |
