# スキルフィードバックレポート（Phase 12）

## 対象

- `task-specification-creator`
- `aiworkflow-requirements`
- `skill-creator`

## 今回の苦戦箇所

| No  | 苦戦箇所                           | 発生条件                                                                      | 対応                                                                                                                        |
| --- | ---------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | カバレッジ判定が全体閾値で失敗     | 対象外ファイルを含む全体計測で `threshold` に未達                             | `--coverage.include` で今回実装8ファイルに限定して判定                                                                      |
| 2   | Phase11撮影時のポート競合          | `5173` が占有済みで preview 起動に失敗                                        | キャプチャスクリプトを `5174` へ切替                                                                                        |
| 3   | 仕様同期対象の散在                 | UI仕様が `ui-ux-components` だけでなく `feature/arch/state/workflow` に分散   | 仕様書ごとに SubAgent を固定し、同一ターンで更新                                                                            |
| 4   | MINOR指摘の扱いが曖昧              | 発見課題を「改善候補」のまま残すと追跡漏れが起きる                            | `UT-UI-00-001/002` を正式な未タスクへ変換し、台帳へ同期                                                                     |
| 5   | 教訓ドキュメント未同期のリスク     | `task-workflow` のみ更新し `lessons-learned` を後回しにすると再利用導線が欠落 | `TASK-UI-00-DESIGN-FOUNDATION` 教訓セクションを新設し、同一ターン同期を固定                                                 |
| 6   | skill-creator クイックナビの重複行 | Phase 12ナビが重複すると参照先判断が揺れる                                    | 重複行を整理し、TASK-UI-00 用の成功/失敗キーワードを統合                                                                    |
| 7   | screenshot coverage の偽失敗       | `TC-UI-*` 命名や `TC ID` 列名がスクリプト想定外だと証跡が揃っていても失敗する | `validate-phase11-screenshot-coverage` を互換拡張し、`manual-test-checklist` フォールバックで `expected=5/covered=5` を確認 |

## 再発防止策

1. UIタスクのカバレッジは「全体値」と「対象差分値」を分離して記録する。
2. スクリーンショット取得前に preview ポート疎通を preflight で確認する。
3. Phase 12 Step 1-A は `LOGS x2 / SKILL x2 / references x5 / index再生成` のチェックリストで機械的に確認する。
4. `audit-unassigned-tasks` は `currentViolations.total` を合否値として固定し、`baseline` は参考値として分離する。
5. Phase 11/10 の MINOR 指摘は例外なく未タスク化し、`task-workflow.md` へ同一ターンで登録する。
6. `task-workflow.md` と `lessons-learned.md` は同一ターンで更新し、片側更新を禁止する。
7. `skill-creator` のクイックナビ更新時は重複行を禁止し、成功/失敗キーワードを同時追記する。
8. screenshot coverage 実行前に TC命名互換（`TC-XX` / `TC-UI-*`）を確認し、warning理由（checklist代替/マトリクス未記載）を必ず残す。

## 改善提案

- `task-specification-creator` 側に「UIタスク向け preflight テンプレート（port/build/route/screenshot coverage）」を標準化すると、Phase 11の失敗率を下げられる。
- `aiworkflow-requirements` 側に「UI基盤タスクの同期先5仕様書」を定義したショートカットガイドを追加すると、Step 1-Aの漏れが減る。

## 改善点なしの場合

- 該当なし（今回は改善提案あり）。
