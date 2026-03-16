# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 3                                    |
| Phase名    | 設計レビュー                         |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001   |
| 前提Phase  | Phase 1（要件定義）、Phase 2（設計） |
| 後続Phase  | Phase 4（テスト作成）                |
| ステータス | completed                            |
| 作成日     | 2026-03-13                           |
| 更新日     | 2026-03-16                           |
| 機能名     | skill-docs-runtime-integration       |

## 目的

Phase 1-2 の設計成果物を多角的にレビューし、Task01 契約との整合性、TASK-9I 系の既存仕様との衝突有無、セキュリティ要件の充足を検証する。

## 実行タスク

- T-3-1: Phase 1-2 の設計成果物を 6 観点でレビューし、判定根拠を明記する
- T-3-2: 既知 Pitfall（P23/P32/P34/P42/P44/P45/P48/P54）の再発有無を監査する

### T-3-1: 設計成果物の多角的レビュー

以下の 6 観点でレビューを実施し、PASS / MINOR / MAJOR の判定根拠を整理する。

#### 観点 1: stub 排除の完全性

- production 経路で stubQueryFn が残らないことを確認する
- LLMDocQueryAdapter が stub 以外の実装を持つことを確認する
- テスト環境では stub を DI 注入可能であることを確認する

#### 観点 2: 失敗ポリシーの明確性

- retryable と non-retryable の分類が曖昧でないかを確認する
- 7 エラー種別の各コード・カテゴリ・retryable フラグが矛盾しないかを確認する
- timeout → guidance → handoff の遷移が明確に定義されているかを確認する

#### 観点 3: Task01 契約との整合

- Access Matrix の 4 path（integrated-api / terminal-handoff / terminal-only / guidance-only）と Skill Docs の 3 path が矛盾しないかを確認する
- fail-fast ポリシー（silent fallback 禁止、見かけ成功排除）が守られているかを確認する
- consumer subscription をアプリ内自動実行に使わない制約が貫かれているかを確認する

#### 観点 4: TASK-9I 系の既存仕様との衝突

- UT-9I-001（LLM プロバイダ連携）との責務境界が明確かを確認する
- UT-9I-002（テンプレート CRUD）との責務境界が明確かを確認する
- 既存の 4 チャンネル IPC 契約（型定義、引数、戻り値）を壊さないかを確認する
- DocGenerationRequest / GeneratedDoc の型拡張が後方互換かを確認する

#### 観点 5: セキュリティ要件の充足

- 4 層検証（sender / P42 / 入力制約 / エラー境界）が維持されているかを確認する
- エラーサニタイゼーション（内部情報の Renderer 非送出）が維持されているかを確認する
- パストラバーサル防御（export チャンネル）の二重防御が維持されているかを確認する

#### 観点 6: UI/UX 整合

- 7 状態の状態遷移が UI/UX 正本と整合しているかを確認する
- マイクロコピー方針が Task01 正本に準拠しているかを確認する
- Guidance Block / Handoff Card の表示パターンが全 surface 共通 UI パターンに従っているかを確認する

### T-3-2: 既知の落とし穴チェック

Phase 1-2 の設計が以下の既知の落とし穴に抵触しないかを確認する。

| Pitfall | チェック項目                                                   |
| ------- | -------------------------------------------------------------- |
| P23     | 型定義の更新対象ファイルが全てリストアップされているか         |
| P32     | shared types と preload types の同時更新が設計に含まれているか |
| P34     | 遅延初期化が必要な DI の Setter Injection 設計が明確か         |
| P42     | 全文字列引数に .trim() バリデーションが含まれているか          |
| P44     | IPC ハンドラと Preload API のインターフェースが一致しているか  |
| P45     | 引数名がセマンティクスに一致しているか                         |
| P48     | non-null assertion (!) が使用されていないか                    |
| P54     | safeRegister パターンの適用判断が明確か                        |

## レビューゲート

設計レビューの判定基準は `.claude/skills/task-specification-creator/references/review-gate-criteria.md` に従う。

| 判定  | 条件                     | 次のアクション         |
| ----- | ------------------------ | ---------------------- |
| PASS  | 重大な問題がない         | Phase 4 に進む         |
| MINOR | 軽微な指摘がある         | 指摘を記録して次へ進む |
| MAJOR | 戻り先が必要な問題がある | 下表の戻り先へ戻す     |

| 問題の種類                 | 戻り先              |
| -------------------------- | ------------------- |
| 要件の問題（scope 不足等） | Phase 1（要件定義） |
| 設計の問題（契約不整合等） | Phase 2（設計）     |
| Task01 契約との衝突        | Phase 1（要件定義） |
| TASK-9I 系との型互換性問題 | Phase 2（設計）     |
| セキュリティ要件の欠落     | Phase 2（設計）     |

## 参照資料

| 参照資料            | パス                                                                                                              | 内容                                  |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md`                                                                                         | 要件定義の成果物を確認する            |
| Phase 2（設計）     | `phase-2-design.md`                                                                                               | 設計の成果物を確認する                |
| pack parent index   | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                      | 依存グラフと共通方針を確認する        |
| pack design audit   | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                        | 監査の結論と禁止事項を確認する        |
| pack UI/UX 正本     | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`                                          | 全 surface 共通 UI パターンを確認する |
| SkillDocGenerator   | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体を確認する               |
| ipc index           | `apps/desktop/src/main/ipc/index.ts`                                                                              | queryFn DI の current path を確認する |
| task UT-9I-001      | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクを確認する        |
| task UT-9I-002      | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-002-template-crud.md`            | テンプレート CRUD タスクを確認する    |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                   | パス                                                                                                              | 内容                                             |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-details.md`                                      | Skill Docs IPC 正本（4 チャンネル契約）          |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                                      | registerSkillDocsHandlers の Pattern 3 構成      |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference-share-debug-analytics.md` | DocGenerationRequest / GeneratedDoc 型定義正本   |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-advanced.md`                             | 4 層検証（sender / P42 / 入力制約 / エラー境界） |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                              | TASK-9I 完了履歴と UT-9I-001/002 未タスク正本    |

## 実行手順

### ステップ1: Phase 1-2 の成果物を全て読み込む

requirements-definition.md, scope-definition.md, design-summary.md, contract-matrix.md, ui-ux-realization.md を読み込む。

### ステップ2: T-3-1 の 6 観点でレビューを実施する

各観点について PASS / MINOR / MAJOR を判定し、根拠を成果物に記録する。

### ステップ3: T-3-2 の Pitfall チェックを実施する

8 つの Pitfall について設計が抵触していないかを確認する。

### ステップ4: 総合判定を下す

全観点の結果を統合し、Phase 4 に進めるか、戻り先が必要かを判定する。

## 統合テスト連携

以下の接続点が Phase 1 と Phase 2 に整合するかをレビューする:

- queryFn: LLMDocQueryAdapter の DI 経路が SkillDocGenerator と接続可能か
- provider adapter: isAvailable() の判定が access matrix と連動するか
- timeout: Promise.race(30s) → DocOperationResult.error の伝播が一貫しているか
- retry: exponential backoff の設計が IPC レスポンスと Renderer 表示に反映されるか
- guidance: capability 判定結果が UI 状態遷移と一致するか

## 成果物

| 成果物           | パス                                      | 内容                                          |
| ---------------- | ----------------------------------------- | --------------------------------------------- |
| 設計レビュー報告 | `outputs/phase-3/design-review-report.md` | 6 観点 + Pitfall チェックの判定根拠を記録する |

## 完了条件

- [ ] 6 観点全てで PASS または MINOR 判定が出ている
- [ ] MAJOR 指摘 0 件
- [ ] Task01 契約との矛盾がない
- [ ] TASK-9I 系の既存 4 チャンネル IPC 契約を壊さないことが確認されている
- [ ] 4 層セキュリティ検証の維持が確認されている
- [ ] 8 つの Pitfall チェックが全て PASS している
- [ ] UI/UX 正本との整合が確認されている

## 次のPhase

- [Phase 4（テスト作成）](./phase-4-test-creation.md) に進む
