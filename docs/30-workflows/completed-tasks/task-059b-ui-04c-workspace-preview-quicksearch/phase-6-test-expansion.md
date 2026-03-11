# Phase 6: テスト拡充

## メタ情報

| 項目         | 値                                             |
| ------------ | ---------------------------------------------- |
| タスクID     | TASK-UI-04C-WORKSPACE-PREVIEW                  |
| 機能名       | task-059b-ui-04c-workspace-preview-quicksearch |
| Phase        | 6                                              |
| ステータス   | completed                                      |
| 作成日       | 2026-03-11                                     |
| 担当SubAgent | SubAgent-C                                     |

## 目的

Phase 4 で作成した基本テストに加えて、境界値、異常系、回帰観点を追加し、PreviewPanel と QuickFileSearch の実運用リスクを減らす。

## 実行タスク

- 境界値テスト追加: 空文字、巨大ファイル、未知拡張子のケースを追加する
- 異常系テスト追加: `file:read` エラーと timeout のケースを追加する
- 回帰テスト追加: 04A watcher と 04C preview の連携ケースを追加する
- a11yテスト追加: dialog focus trap と live region のケースを追加する
- スナップショット入力整理: Phase 11 用の手動検証項目を更新する

## 参照資料

| 参照資料 | パス                        | 説明       |
| -------- | --------------------------- | ---------- |
| Phase 4  | `phase-4-test-creation.md`  | 基本テスト |
| Phase 5  | `phase-5-implementation.md` | 実装計画   |

### システム仕様（aiworkflow-requirements）

| 参照資料     | パス                                                                                        | 本Phaseで使う理由              |
| ------------ | ------------------------------------------------------------------------------------------- | ------------------------------ |
| テスト規約   | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テストパターン統一             |
| a11yガイド   | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                | keyboard / aria 拡充           |
| 実装パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P5/P31/P39/P40 回帰観点の固定  |
| lessons      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去失敗パターンの再発防止反映 |
| 品質要件     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 拡充対象優先順位               |

## 実行手順

### ステップ1: 境界値ケースを追加

| ケースID | ケース                       |
| -------- | ---------------------------- |
| TC-06-01 | 空 query で結果 0 件表示     |
| TC-06-02 | 同名ファイル複数時の順位安定 |
| TC-06-03 | 非対応拡張子で Source 固定   |
| TC-06-04 | 画像メタ情報欠損時 fallback  |

### ステップ2: 異常系ケースを追加

| ケースID | ケース                             |
| -------- | ---------------------------------- |
| TC-06-05 | `file:read` reject 時に alert 表示 |
| TC-06-06 | timeout 時に再読み込み導線表示     |
| TC-06-07 | sanitize 失敗時に Source fallback  |

### ステップ3: 回帰ケースを追加

| ケースID | ケース                                                                   |
| -------- | ------------------------------------------------------------------------ |
| TC-06-08 | watcher 通知で preview 再描画                                            |
| TC-06-09 | panel 切替時に QuickSearch 状態が破綻しない                              |
| TC-06-10 | mobile overlay でモーダル focus が閉じない                               |
| TC-06-11 | watcher の再登録が発生せず listener が単一に維持される（P5）             |
| TC-06-12 | timeout(5秒) + retry(1秒間隔3回) 後に復帰導線が表示される                |
| TC-06-13 | Task 5D 用語（プレビュー/コード表示/ファイルをすばやく探す）が維持される |
| TC-06-14 | JSON/YAML 整形失敗時に Source fallback とエラー表示へ遷移する            |
| TC-06-15 | SourceView が read-only を維持し、ダブルクリック導線が回帰しない         |
| TC-06-16 | ErrorBoundary reset で preview が復旧し、iframe crash が親UIへ波及しない |

## 統合テスト連携

| 観点         | Phase 7 へ引き継ぐ内容                         |
| ------------ | ---------------------------------------------- |
| coverage入力 | 追加ケースを coverage 対象一覧へ反映           |
| manual入力   | Phase 11 screenshot ケースと対応づけ           |
| 回帰入力     | 04A watcher 契約回帰と P5 再発防止ケースを固定 |

## 成果物

| 成果物         | パス                                     | 説明           |
| -------------- | ---------------------------------------- | -------------- |
| 回帰拡充計画   | `outputs/phase-6/regression-matrix.md`   | 追加ケース一覧 |
| 異常系一覧     | `outputs/phase-6/error-case-matrix.md`   | 失敗系ケース   |
| a11y追加ケース | `outputs/phase-6/accessibility-cases.md` | keyboard/aria  |

## 完了条件

- [ ] 境界値テストを追加している
- [ ] 異常系テストを追加している
- [ ] watcher 連携の回帰テストを追加している
- [ ] a11y テストを追加している
- [ ] timeout/retry と UX語彙の回帰ケースを追加している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

1. 境界値ケース追加
2. 異常系ケース追加
3. 回帰ケース追加
4. a11y ケース追加
5. 完了条件の自己検証

## タスク100%実行確認

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] `outputs/phase-6/` に作成すべき成果物を定義済み
- [ ] `artifacts.json` へ登録すべき成果物を確認済み
- [ ] `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-059b-ui-04c-workspace-preview-quicksearch` を再実行できる状態

## 次のPhase

[Phase 7: テストカバレッジ確認](./phase-7-coverage-check.md)
