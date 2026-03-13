# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 2                                  |
| Phase名    | 設計                               |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| 前提Phase  | Phase 1（要件定義）                |
| 後続Phase  | Phase 3（設計レビュー）            |
| ステータス | not_started                        |
| 作成日     | 2026-03-13                         |
| 機能名     | skill-docs-runtime-integration     |

## 目的

Skill Docs を共通 runtime 契約に接続する設計を確定する。

## 実行タスク

- adapter 設計: queryFn を runtime resolver 配下の provider adapter として設計する
- 失敗ポリシー設計: timeout、retry、rate limit、guidance、terminal handoff messaging の方針を定義する
- error mapping 設計: IPC エラー正規化と public contract の境界を定義する

## 設計方針

- queryFn 実装は docs 生成専用でも runtime 契約は Task01 に合わせる
- production 経路では stub を許容しない
- renderer 依存を増やさず main process だけで解決する

## Atent Team / SubAgent 分担

| 役割               | 主担当                                          |
| ------------------ | ----------------------------------------------- |
| Doc Runtime Agent  | queryFn と provider adapter を整理する          |
| Error Policy Agent | timeout、retry、rate limit、guidance を整理する |
| Spec Sync Agent    | TASK-9I 関連の正本仕様を抽出する                |

## 参照資料

| 参照資料            | パス                                                                                                              | 内容                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Phase 1（要件定義） | `phase-1-requirements.md`                                                                                         | 依存する前提成果物を確認する                      |
| pack parent index   | `docs/30-workflows/ai-runtime-authmode-unification/index.md`                                                      | 実行順序、依存グラフ、共通方針の正本を確認する    |
| pack design audit   | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md`                                        | 多角的監査の結論、禁止事項、依存整合を確認する    |
| pack UI/UX 図解     | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-diagrams.md`                                             | 5図セットの画面構成、状態遷移、CTA 導線を確認する |
| SkillDocGenerator   | `apps/desktop/src/main/services/skill/SkillDocGenerator.ts`                                                       | docs 生成本体を確認する                           |
| ipc index           | `apps/desktop/src/main/ipc/index.ts`                                                                              | queryFn DI の current path を確認する             |
| task UT-9I-001      | `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md` | 既存 stub 排除タスクを確認する                    |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                   | パス                                                                              | 内容                                                            |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| api-ipc-agent              | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | Skill Docs IPC 正本                                             |
| architecture-overview      | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`      | registerSkillDocsHandlers の構成正本                            |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill Docs 関連未タスクと public contract 正本                  |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | sender、path validation、error envelope の正本                  |
| task-workflow              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`              | TASK-9I の完了履歴と未タスク正本                                |
| pack UI/UX 正本            | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`          | docs generation の ready / generating / guidance 状態を確認する |

## UI/UX リアライズ

| 観点           | 内容                                                                      |
| -------------- | ------------------------------------------------------------------------- |
| 画面構成       | docs generation sheet、result summary、guidance block の 3 領域で構成する |
| Primary CTA    | `docs を生成`                                                             |
| Secondary CTA  | `再試行` `guidance を確認`                                                |
| 状態           | `ready` `generating` `timeout` `guidance` を扱う                          |
| マイクロコピー | timeout では失敗理由だけでなく、再試行か handoff かを同じブロックに示す   |

## 実行手順

### ステップ1: 参照資料を確認する

この Phase で使う code path、前提 Phase、system spec を確認し、Skill Docs 生成の AI runtime 統合 の対象範囲を固定する。

### ステップ2: 実行タスクを上から順に実施する

設計 の実行タスクを上から順に処理し、順序を崩さずに成果物へ反映する。

### ステップ3: system spec との整合を確認する

aiworkflow-requirements の正本と照合し、契約、UI、security、state のズレを残さない。

### ステップ4: 成果物と完了条件を確認する

成果物パス、完了条件、次の Phase への handoff を確認して記録する。

## 統合テスト連携

queryFn、provider adapter、timeout、retry、guidance の契約、state、IPC、security 境界を設計へ反映する。

## 成果物

| 成果物       | パス                                   | 内容                                                 |
| ------------ | -------------------------------------- | ---------------------------------------------------- |
| 設計サマリー | `outputs/phase-2/design-summary.md`    | 責務境界、依存関係、接続順序を整理する               |
| 契約一覧     | `outputs/phase-2/contract-matrix.md`   | IPC、state、runtime 契約を一覧化する                 |
| UI/UX 実体化 | `outputs/phase-2/ui-ux-realization.md` | docs generation sheet と guidance の見せ方を整理する |

## 完了条件

- [ ] queryFn の置換設計が明文化されている
- [ ] 失敗ポリシーが Task01 契約に揃っている
- [ ] docs generation の状態表示と guidance が定義されている

## 次のPhase

- [Phase 3（設計レビュー）](./phase-3-design-review.md) に進む
