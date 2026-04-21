# Skill Import Stability 仕様書 横断監査（2026-03-04）

## 目的

`TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001` / `TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001` / `TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001` の3仕様書が、
本ブランチの実装差分14ファイルを漏れなくカバーし、相互矛盾なく実行可能であることを検証する。

## SubAgent編成（関心ごと分離）

| SubAgent | 担当仕様書        | 責務                             |
| -------- | ----------------- | -------------------------------- |
| SA-01    | 01-reconciliation | Main Service 復元互換（id/name） |
| SA-02    | 02-idempotency    | IPC + Store 冪等契約             |
| SA-03    | 03-metadata-guard | Renderer UI 欠損耐性             |
| SA-X     | Cross Audit       | 依存関係、矛盾、漏れ、重複の監査 |

## 差分ファイル完全カバレッジ

| #   | 変更ファイル                                                                                       | 主担当仕様書 | 関心ごと                           |
| --- | -------------------------------------------------------------------------------------------------- | ------------ | ---------------------------------- |
| 1   | `apps/desktop/src/main/services/skill/SkillService.ts`                                             | 01           | id/name 互換復元ロジック           |
| 2   | `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`                              | 01           | 後方互換テスト                     |
| 3   | `apps/desktop/src/main/ipc/skillHandlers.ts`                                                       | 02           | 冪等時の `skill:import` 戻り値契約 |
| 4   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                                        | 02           | importedCount=0 成功系テスト       |
| 5   | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                             | 02           | 再インポート早期return             |
| 6   | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts`            | 02           | IPC未呼び出し保証                  |
| 7   | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts`                          | 03           | description欠損防御                |
| 8   | `apps/desktop/src/renderer/views/SkillCenterView/hooks/useFeaturedSkills.ts`                       | 03           | 配列欠損防御                       |
| 9   | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillCard.tsx`                         | 03           | 表示欠損防御                       |
| 10  | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx` | 03           | サブリソース欠損防御               |
| 11  | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts`                 | 03           | 欠損入力回帰テスト                 |
| 12  | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useFeaturedSkills.test.ts`              | 03           | 欠損入力回帰テスト                 |
| 13  | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCard.test.tsx`                     | 03           | 欠損入力回帰テスト                 |
| 14  | `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillDetailPanel.test.tsx`              | 03           | 欠損入力回帰テスト                 |

## aiworkflow-requirements 抽出完全性

| 観点               | 必須仕様                                                   | 抽出先   |
| ------------------ | ---------------------------------------------------------- | -------- |
| Main Service 契約  | `arch-electron-services.md`                                | 01/02    |
| IPC 契約           | `api-ipc-agent.md`, `api-endpoints.md`                     | 01/02    |
| 型契約             | `interfaces-agent-sdk-skill.md`                            | 01/02/03 |
| State設計          | `arch-state-management.md`                                 | 02/03    |
| UIアーキ           | `arch-ui-components.md`                                    | 02/03    |
| UI機能             | `ui-ux-feature-components.md`, `ui-ux-components.md`       | 02/03    |
| テスト戦略         | `testing-component-patterns.md`, `quality-requirements.md` | 03       |
| セキュリティ境界   | `security-electron-ipc.md`                                 | 01/02    |
| 実装パターン       | `architecture-implementation-patterns.md`                  | 01/02/03 |
| エラーハンドリング | `error-handling.md`                                        | 01/02/03 |
| 台帳同期           | `task-workflow.md`                                         | 01/02/03 |

## 20思考フレーム適用ログ

| 思考法             | 監査の問い                            | 改善アクション                                               |
| ------------------ | ------------------------------------- | ------------------------------------------------------------ |
| 水平思考           | 3仕様書以外の切り口はあるか           | 差分ファイル起点の横断監査ファイルを新設                     |
| 逆説思考           | 成功条件が失敗を誘発していないか      | 「spec PASSだが差分未対応」を禁止するカバレッジ表を追加      |
| システム思考       | Main/IPC/Rendererが循環破綻しないか   | 01→02→03の依存方向を明記                                     |
| 垂直思考           | 仕様根拠は一次情報まで降りられるか    | aiworkflow referencesをファイル単位で明示                    |
| 類推思考           | 既知障害と同型か                      | `importedSkills` 系過去障害（P44系）を参照仕様へ追加         |
| if思考             | 欠損入力が来たらどうなるか            | 03で配列/description欠損の防御とテストを必須化               |
| 素人思考           | 非実装者が読んで追えるか              | 仕様書に変更ファイル一覧を追加                               |
| トレードオン思考   | 厳密性と実行速度を両立できるか        | 横断監査1枚 + 各仕様書の最小追記で両立                       |
| プラスサム思考     | 3仕様書が互いに価値を毀損していないか | 境界ファイルの主担当を固定し重複修正を防止                   |
| 2軸思考            | 影響度×変更頻度で優先度は適切か       | Main契約（高影響）を01/02で先行固定                          |
| 価値提案思考       | 利用者価値は何か                      | 再インポート不要・クラッシュゼロを主要価値として固定         |
| why思考            | なぜこの仕様が必要か                  | 各仕様書へ「背景→原因→対策」を追記                           |
| 改善思考           | 既存仕様の何を削るべきか              | 汎用記述を削減し差分直接対応の記述へ置換                     |
| 戦略的思考         | 先に固定すべきボトルネックはどこか    | `skill:import` 契約と `getImportedSkills` 互換を先行固定     |
| ダブル・ループ思考 | 手順自体の誤りはないか                | Phase 12へ Step 1-A〜1-E / Step 2 の厳格手順を固定           |
| 抽象化思考         | 再利用可能な原則にできるか            | 「差分ファイル完全カバレッジ」テンプレート化                 |
| プロセス思考       | 再現可能な順序か                      | 抽出→分担→整合→検証の4段を固定                               |
| 仮説思考           | 何が漏れやすいか                      | 依存Phase成果物の参照漏れ仮説を検証し参照資料へ統合          |
| 論点思考           | 真の争点は何か                        | 「仕様PASS」ではなく「差分網羅」が争点と定義                 |
| 因果関係ループ     | 再発ループは何か                      | 参照漏れ→解釈差→実装ドリフトのループを遮断する監査項目を追加 |

## 矛盾・漏れ・整合・依存の監査結果

| 監査項目                                       | 結果                                            |
| ---------------------------------------------- | ----------------------------------------------- |
| 矛盾（担当重複/責務競合）                      | なし（主担当を固定）                            |
| 漏れ（14差分ファイル未割当）                   | なし                                            |
| 整合（task-specification-creator 13Phase構造） | あり（3仕様書ともPASS）                         |
| 依存関係（01/02/03）                           | 明示済み（01=復元基盤、02=冪等契約、03=UI防御） |

## 検証ログ

- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/01-TASK-FIX-SKILL-IMPORTED-STATE-RECONCILIATION-001`
- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/02-TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001`
- `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001`
