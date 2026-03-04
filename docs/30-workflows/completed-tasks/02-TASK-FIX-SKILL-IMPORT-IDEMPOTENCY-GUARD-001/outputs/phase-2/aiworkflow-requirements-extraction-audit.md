# aiworkflow-requirements 抽出網羅性監査

## メタ情報

| 項目     | 内容                                        |
| -------- | ------------------------------------------- |
| タスクID | TASK-FIX-SKILL-IMPORT-IDEMPOTENCY-GUARD-001 |
| 監査日   | 2026-03-04                                  |
| 監査対象 | 実装済みブランチ差分（Main/Store/UI Hook）  |
| 目的     | 必要仕様の抽出漏れゼロと依存整合の確認      |

## SubAgent Team（関心ごと分離）

| SubAgent                  | 責務                                        | 実行方式        |
| ------------------------- | ------------------------------------------- | --------------- |
| A: IPC/Service Agent      | Main IPC・Service契約の必要仕様抽出         | 並列            |
| B: Store/UI Agent         | Renderer Store・UI Hook契約の必要仕様抽出   | 並列            |
| C: Workflow/Quality Agent | ワークフロー整合・Phaseテンプレート準拠監査 | A/B完了後に直列 |

## 監査手順

1. `indexes/resource-map.md` を起点に、バグ修正（IPC/状態管理）で必須の仕様カテゴリを特定した。
2. `search-spec.js` で `skill import` と `importedSkills` を検索し、該当仕様を抽出した。
3. 実装対象ファイル名（`skillHandlers.ts`、`SkillService.ts`、`agentSlice.ts`、`useSkillCenter.ts`）で `references/` 全体を逆引きし、参照候補を列挙した。
4. 候補を「必須」「条件付き」「非対象」に分類し、index.md の参照仕様一覧へ反映した。

## 抽出結果（必須仕様）

| 種別                 | 仕様ファイル                                         | 必須理由                      | 抽出根拠                   |
| -------------------- | ---------------------------------------------------- | ----------------------------- | -------------------------- |
| 起点                 | `indexes/resource-map.md`                            | 読み込み対象決定の一次起点    | タスク種別逆引き           |
| 起点                 | `indexes/quick-reference.md`                         | IPC/型契約の早見確認          | 初期整合確認               |
| IPC契約              | `references/api-ipc-agent.md`                        | `skill:import` 成功判定の正本 | `skillHandlers.ts` 逆引き  |
| 型契約               | `references/interfaces-agent-sdk-skill.md`           | `ImportedSkill` / Store契約   | `agentSlice.ts` 逆引き     |
| 状態管理             | `references/arch-state-management.md`                | 冪等ガード責務の正本          | `importedSkills` 検索      |
| UI機能               | `references/ui-ux-feature-components.md`             | `useSkillCenter` 契約の正本   | `useSkillCenter.ts` 逆引き |
| UI構造               | `references/arch-ui-components.md`                   | Skill Centerの責務境界確認    | `agentSlice.ts` 逆引き     |
| Service構造          | `references/arch-electron-services.md`               | Main Service層責務確認        | `SkillService.ts` 逆引き   |
| 実装規約             | `references/architecture-implementation-patterns.md` | IPCドリフト再発防止           | パターン適用               |
| API一覧              | `references/api-endpoints.md`                        | API公開面の契約整合           | API一覧照合                |
| IPCセキュリティ      | `references/security-electron-ipc.md`                | sender検証・境界防御          | IPC境界監査                |
| Electronセキュリティ | `references/security-api-electron.md`                | Preload公開面の補助要件       | API境界監査                |
| 例外方針             | `references/error-handling.md`                       | 冪等早期終了時のエラー整合    | 例外分類確認               |
| 運用台帳             | `references/task-workflow.md`                        | `completed` 運用整合          | Phase 12運用確認           |

## 条件付き仕様（今回は参照のみ）

| 仕様ファイル                              | 判定     | 理由                                                          |
| ----------------------------------------- | -------- | ------------------------------------------------------------- |
| `references/ipc-contract-checklist.md`    | 条件付き | IPC追加時のチェックに有効。今回は仕様書作成段階のため参照のみ |
| `references/ipc-type-resolution-guide.md` | 条件付き | IPC引数型変更が発生した場合に必須。今回は契約確認の補助参照   |
| `references/quality-requirements.md`      | 条件付き | 実装後のカバレッジ検証で必須。今回は目標値定義のみ反映        |
| `references/lessons-learned.md`           | 条件付き | 再発防止知見の補助参照。正本契約ではない                      |

## 非対象とした仕様

| 仕様ファイル群       | 非対象理由                 |
| -------------------- | -------------------------- |
| `database-*.md`      | DBスキーマ変更を伴わない   |
| `deployment*.md`     | デプロイ手順変更を伴わない |
| `interfaces-rag*.md` | RAG機能を変更しない        |

## 多角思考監査（20観点）

| 思考法             | 監査観点                     | 結果                                               |
| ------------------ | ---------------------------- | -------------------------------------------------- |
| 水平思考           | 別カテゴリ仕様の見落とし探索 | `security-api-electron.md` を追加対象に昇格        |
| 逆説思考           | 「更新不要」の前提破壊       | `サブタスク管理` 欠落を検出                        |
| システム思考       | Main/Preload/Rendererの連鎖  | IPC境界仕様を必須化                                |
| 垂直思考           | 1ファイル単位の深掘り        | `skill:import` 契約を API正本で固定                |
| 類推思考           | 過去ドリフト事例との比較     | `architecture-implementation-patterns.md` を必須化 |
| if思考             | 旧保存データ混在の仮定       | `interfaces-agent-sdk-skill.md` を必須化           |
| 素人思考           | 初見実行者が迷う点の抽出     | 参照仕様を用途付きテーブル化                       |
| トレードオン思考   | 網羅性と可読性の両立         | 必須/条件付き/非対象の3層化                        |
| プラスサム思考     | 品質と速度の同時向上         | 並列抽出 + 直列統合を採用                          |
| 2軸思考            | 重要度×変更可能性            | 必須仕様を14件に限定                               |
| 価値提案思考       | 読む価値が高い順序設計       | resource-map起点で読込順を固定                     |
| why思考            | 参照理由の明示               | すべての仕様に必須理由を付与                       |
| 改善思考           | 現状との差分改善             | 全Phaseに `サブタスク管理` を追加                  |
| 戦略的思考         | 実装証跡と仕様更新を同時固定 | `completed` 前提へ統一                             |
| ダブル・ループ思考 | 判定基準そのものの見直し     | `completed` 前提記述を破棄                         |
| 抽象化思考         | 共通パターン化               | 全Phase共通の確認項目を統一                        |
| プロセス思考       | 手順の再現性確保             | 抽出手順を4ステップで固定                          |
| 仮説思考           | 参照漏れ仮説の検証           | 逆引きgrepで漏れゼロを確認                         |
| 論点思考           | 争点分解（漏れ/矛盾/依存）   | 論点別に監査結果を分離記録                         |
| 因果関係ループ     | 再発ループの遮断             | 仕様抽出漏れ→契約ドリフト→再修正の連鎖を遮断       |

## 矛盾・漏れ・整合・依存チェック

| チェック項目 | 結果 | 根拠                                       |
| ------------ | ---- | ------------------------------------------ |
| 矛盾         | なし | 実装済み成果物と Phase実行記録の整合を確認 |
| 漏れ         | なし | 必須仕様14件を index と監査票へ反映        |
| 整合性       | 整合 | Phase 1-13 のセクション構成を統一          |
| 依存関係     | 整合 | Phase依存、仕様依存、SubAgent依存を明文化  |

## 廃棄した案と採用案

| 区分 | 内容                                                        | 判定理由                                      |
| ---- | ----------------------------------------------------------- | --------------------------------------------- |
| 廃棄 | UI証跡を省略し自動テストのみで完了とする案                  | Phase 11画面証跡必須要件に反する              |
| 採用 | 実装 + テスト + 画面証跡 + 仕様同期を同一ターンで完了する案 | Phase 1-12 実行要求と整合し、監査再現性が高い |

## 結論

- `aiworkflow-requirements` から今回タスクに必要な仕様は、必須14件・条件付き4件に分類して抽出済み。
- 抽出漏れゼロを満たすため、index.md と各Phase仕様書へ参照導線を追加済み。
- 実装・検証済みの前提でテンプレート準拠を再同期し、仕様書としての再現性を確保した。
