# Phase 7: カバレッジ確認

## メタ情報

| 項目    | 値                                          |
| ------- | ------------------------------------------- |
| PhaseID | 7                                           |
| Phase名 | カバレッジ確認                              |
| Task ID | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE |
| 前Phase | 6                                           |
| 次Phase | 8                                           |
| 作成日  | 2026-04-19                                  |

## 目的

Phase 5 で追加した実装（`runUpdateWorkflow` / `runImprovePromptWorkflow`）のカバレッジを可視化する。未カバー箇所を特定し、必要であれば Phase 6 へフィードバックしてテストを追補する。

## 実行タスク

### T-7-1: カバレッジレポート生成

```bash
pnpm --filter @repo/desktop test -- --coverage SkillCreatorService
```

- HTML または text 形式のカバレッジレポートを生成する
- 生成先ディレクトリ（通常 `coverage/`）を確認する

### T-7-2: runUpdateWorkflow / runImprovePromptWorkflow のカバレッジ確認

- カバレッジレポートを開き、以下のメソッドのカバレッジ数値を確認する
  - `runUpdateWorkflow`: Line / Branch / Function カバレッジ
  - `runImprovePromptWorkflow`: Line / Branch / Function カバレッジ
- 確認した数値を下記「カバレッジ目標テーブル」の「実測値」列に記入する

### T-7-3: カバレッジ目標確認

下記テーブルの目標値を満たしているか確認する。

### T-7-4: 未カバー箇所の特定と Phase 6 へのフィードバック

- カバレッジが目標を下回っている箇所を特定する
- 未カバー行・分岐を一覧化し、追加すべきテストケースを検討する
- 目標未達の場合は Phase 6 に戻り、テストを追補してから再度 T-7-1 を実行する

## カバレッジ目標テーブル

| メソッド                   | 指標     | 目標値 | 実測値   | 判定     |
| -------------------------- | -------- | ------ | -------- | -------- |
| `runUpdateWorkflow`        | Line     | 80%+   | （記入） | （記入） |
| `runUpdateWorkflow`        | Branch   | 60%+   | （記入） | （記入） |
| `runUpdateWorkflow`        | Function | 80%+   | （記入） | （記入） |
| `runImprovePromptWorkflow` | Line     | 80%+   | （記入） | （記入） |
| `runImprovePromptWorkflow` | Branch   | 60%+   | （記入） | （記入） |
| `runImprovePromptWorkflow` | Function | 80%+   | （記入） | （記入） |

## 参照資料

| 資料名             | パス                                                                                      |
| ------------------ | ----------------------------------------------------------------------------------------- |
| 対象サービス       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                             |
| 対象テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`              |
| Phase 6 仕様書     | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-6-test-expansion.md` |

## 成果物

| 成果物               | 種別         | 説明                                             |
| -------------------- | ------------ | ------------------------------------------------ |
| `coverage-report.md` | ファイル作成 | カバレッジ目標テーブルの実測値を記入したレポート |

## 完了条件

- [ ] T-7-1: カバレッジレポートを生成した
- [ ] T-7-2: `runUpdateWorkflow` / `runImprovePromptWorkflow` のカバレッジ数値を確認した
- [ ] T-7-3: カバレッジ目標テーブルに実測値を記入し、目標値と比較した
- [ ] T-7-4: 未カバー箇所を特定し、目標未達時は Phase 6 へフィードバックした
- [ ] カバレッジ目標（Line 80%+、Branch 60%+、Function 80%+）をすべて達成した

## Phase 末端アクション

- カバレッジ目標テーブルの実測値・判定を記入した `coverage-report.md` を `outputs/` ディレクトリに保存する
- Phase 8（リファクタリング）へ移行する
