# UT-UI-05A-IMPLEMENTATION-CLOSURE-001 エレガンス整合監査

## 目的

`task-specification-creator` と `aiworkflow-requirements` を正本として、仕様書群の矛盾・漏れ・依存不整合をゼロ化する。

## 監査視点（統合）

| 思考レンズ         | 監査対象                                        | 判定                            |
| ------------------ | ----------------------------------------------- | ------------------------------- |
| 水平思考           | 13 Phase 横断で命名・成果物形式を比較           | 不整合を修正済み                |
| 垂直思考           | Phase 1→13 の依存鎖を検証                       | `artifacts.json` 依存を是正済み |
| システム思考       | UI/状態管理/IPC/品質ゲートの相互作用を確認      | 仕様抽出マトリクス化済み        |
| 逆説思考           | 「最小修正で悪化する箇所」を探索                | Phase 12 成果物名の不一致を除去 |
| 類推思考           | 過去タスク（TASK-UI-05A/B）監査パターンを再利用 | 命名・台帳更新ルールを適用      |
| if思考             | getFileTree 実装有無の分岐を想定                | 未実装時の契約参照を明示        |
| 素人思考           | 初見読者が迷うパス/名称を抽出                   | 実装パスを現行構造へ統一        |
| トレードオン思考   | 厳密性と保守性を同時達成                        | 中央マトリクス化で両立          |
| プラスサム思考     | 検証強化とドキュメント簡潔性を両立              | 参照を集約し重複記述を削減      |
| 2軸思考            | 影響度×修正コストで優先順位化                   | 高影響3点を先行修正             |
| 価値提案思考       | 実装者が迷わない仕様へ再編                      | 命名・成果物・依存の一貫化      |
| why思考            | 不整合発生の根因を特定                          | 旧命名混在と参照先ドリフト      |
| 改善思考           | 再発防止の仕組み化                              | strict検証 + 抽出マトリクス     |
| 戦略的思考         | 仕様正本への追従優先順位を定義                  | task-spec準拠を最優先化         |
| ダブル・ループ思考 | 個別修正だけでなく運用規則を更新                | SubAgent責務表を index に追加   |
| 抽象化思考         | 個別課題を「契約整合」に抽象化                  | 命名規約/成果物規約に集約       |
| プロセス思考       | 発見→分類→修正→再検証を固定化                   | 3段検証コマンドを実施           |
| 仮説思考           | strict警告ゼロで運用負荷低下を仮説化            | 警告ゼロを確認                  |
| 論点思考           | 論点を命名/依存/参照漏れへ分解                  | 3論点すべて是正済み             |
| 因果関係ループ     | 命名不整合→実装誤読→品質低下を遮断              | 命名統一でループ遮断            |

## 検出した主要不整合と修正

| 不整合                                                                                                                    | 修正内容                                                    |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Phase 12 成果物名が `unassigned-task-report.md` で混在                                                                    | `unassigned-task-detection.md` に統一（Phase 3/12/13 同期） |
| Hook/コンポーネント命名が Phase 間で不一致（`useKeyboardSave` vs `useSaveShortcut`, `ReadOnlyBadge` vs `ReadOnlyBanner`） | Phase 12/13 を設計基準名へ統一                              |
| FileTree ARIA role が `listbox` と `tree` で混在                                                                          | `role="tree"` / `role="treeitem"` に統一                    |
| `artifacts.json` 依存が簡略化されていた                                                                                   | canonical 依存グラフ（Phase 12/13）へ修正                   |
| aiworkflow 要件参照が散在し、抜け確認が困難                                                                               | `index.md` に仕様抽出マトリクスを新設                       |

## 再検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/skill-editor-view-closure --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/skill-editor-view-closure
```

結果: 13/13, エラー0, 警告0。
