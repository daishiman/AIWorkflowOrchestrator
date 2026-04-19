# Phase 11: 手動テスト

## メタ情報

| 項目    | 値                                          |
| ------- | ------------------------------------------- |
| PhaseID | 11                                          |
| Task ID | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE |
| 前Phase | 10                                          |
| 次Phase | 12                                          |
| 作成日  | 2026-04-19                                  |

## 目的

- ユニットテストで確認できない動作を手動で検証する
- 各モードの動作が仕様通りであることを最終確認する

## NON_VISUAL 方針

このタスクは UI 変更を伴わない内部ロジックの修正のみを対象とする。

- `UI/UX変更なしのため Phase 11 スクリーンショット不要`
- 検証は vitest によるユニットテストの実行ログを証跡とする
- placeholder のみの証跡（空欄・「確認済み」の記載のみ）は PASS 扱いにしない

## テストケーステーブル

| TC ID | テスト内容                                                    | 確認方法                                                  | 期待結果                                                                 | 結果                |
| ----- | ------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------- |
| TC-01 | update モードで `runUpdateWorkflow` が呼ばれる                | vitest 実行ログで spy/mock 呼び出しを確認                 | `runUpdateWorkflow` が 1 回呼ばれ、`runInitWorkflow` が呼ばれない        | [ ] PASS / [ ] FAIL |
| TC-02 | improve-prompt モードで `runImprovePromptWorkflow` が呼ばれる | vitest 実行ログで spy/mock 呼び出しを確認                 | `runImprovePromptWorkflow` が 1 回呼ばれ、`runInitWorkflow` が呼ばれない | [ ] PASS / [ ] FAIL |
| TC-03 | create モードの既存動作が変わらない（回帰確認）               | vitest 実行ログで既存テストが全件グリーンであることを確認 | create モード関連テストが全件 PASS                                       | [ ] PASS / [ ] FAIL |

## 実行タスク

### T-11-1: 全件テスト実行（最終確認）

```bash
pnpm --filter @repo/desktop test
```

- 実行ログを `outputs/phase-11/test-result-final.txt` に保存する
- TC-01〜TC-03 に対応するテストケース名とその結果をログから抜粋する

### T-11-2: manual-test-checklist.md 作成

- `outputs/phase-11/manual-test-checklist.md` を作成する
- TC-01〜TC-03 の各項目について確認手順と期待結果を記載する

### T-11-3: manual-test-result.md 作成

- `outputs/phase-11/manual-test-result.md` を作成する
- TC ID と証跡（ログ抜粋・ファイルパス等）を対応付けて記載する
- placeholder のみの記載は認めない

### T-11-4: discovered-issues.md 作成

- `outputs/phase-11/discovered-issues.md` を作成する
- テスト中に発見した問題点・懸念点を記載する（なければ「発見なし」と明記）

## 参照資料

| 資料名             | パス                                                                                     | 用途                         |
| ------------------ | ---------------------------------------------------------------------------------------- | ---------------------------- |
| 対象サービス       | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                            | 手動確認対象の制御フロー把握 |
| 対象テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`             | TC-01〜TC-03 の対応確認      |
| Phase 10 仕様書    | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-10-final-review.md` | 最終レビュー結果の引き継ぎ   |

## 成果物テーブル

| 成果物                   | パス                                        | 必須 |
| ------------------------ | ------------------------------------------- | ---- |
| テスト実行ログ           | `outputs/phase-11/test-result-final.txt`    | 必須 |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | 必須 |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | 必須 |
| 発見された問題点         | `outputs/phase-11/discovered-issues.md`     | 必須 |

## 完了条件

- [ ] T-11-1: 全件テストがグリーンであることを実行ログで確認した
- [ ] T-11-2: `manual-test-checklist.md` が作成されている（placeholder のみは不可）
- [ ] T-11-3: `manual-test-result.md` が TC ID と証跡の対応付きで作成されている
- [ ] T-11-4: `discovered-issues.md` が作成されている（発見なしの場合も明記）
- [ ] TC-01〜TC-03 の全件が PASS と確認された
