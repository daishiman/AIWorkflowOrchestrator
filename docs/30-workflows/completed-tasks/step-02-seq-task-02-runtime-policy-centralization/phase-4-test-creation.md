# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 4                                          |
| Phase 名   | テスト作成                                 |
| タスクID   | TASK-IMP-RUNTIME-POLICY-CENTRALIZATION-001 |
| 前提 Phase | Phase 3                                    |
| 後続 Phase | Phase 5（実装）                            |
| ステータス | completed                                  |
| 作成日     | 2026-03-19                                 |
| 機能名     | runtime-policy-centralization              |

## 目的

surface 横断 runtime policy の中央集約 を future implementation で破綻なく実行できる test design を作る。
設計タスクとして、将来の実装者が迷わず着手できる具体的なテストケース仕様・モック境界定義・M-2 resolve シグネチャ確定を文書成果物として残す。

## 実行タスク

- 契約テスト設計: `phase-2-design.md` の `validation-matrix.md` 参照観点を基に、Unit / Integration / Manual の各テストケース仕様を設計する
- M-2 対処: `IRuntimePolicyResolver.resolve()` のシグネチャ（引数直接渡し vs DI 内部取得）を確定し `contract-matrix.md` に追記する
- モック戦略: `RuntimePolicyResolver` / `TerminalHandoffBuilder` / health route の mock 境界を定義し、境界をまたぐ箇所を明確にする

## 参照資料

| 参照資料                   | パス                                                                                                          | 内容                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                    | 依存順・並列可否・設計ゲート                      |
| Task index                 | docs/30-workflows/completed-tasks/step-02-seq-task-02-runtime-policy-centralization/index.md                  | 対象 task のメタ情報と受入基準                    |
| Phase 1                    | phase-1-requirements.md                                                                                       | 要件定義の確定内容                                |
| Phase 2                    | phase-2-design.md                                                                                             | 設計内容と validation matrix                      |
| Phase 3                    | phase-3-design-review.md                                                                                      | review gate の判定                                |
| 旧canonical workflow       | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                 | execution responsibility を主語にした既存問題設定 |
| 親パック UI/UX 正本        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                        | 状態語彙・CTA・handoff 契約                       |
| 親パック UI/UX 図解        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                           | 状態遷移・画面構成・導線図                        |
| 親パック監査マトリクス     | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                      | 矛盾・依存・漏れの監査軸                          |
| workflow 正本              | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md | runtime 責務再配線の current canonical            |
| resource map               | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                                                | 必要仕様の初動選定                                |
| quick reference            | .claude/skills/aiworkflow-requirements/indexes/quick-reference.md                                             | 型・IPC・UI 仕様の即時参照                        |
| interfaces-auth            | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                          | auth/access 契約の親入口                          |
| api-ipc-system             | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                           | system IPC 契約の親入口                           |
| arch-state-management      | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                    | Renderer 責務境界の親入口                         |
| Task01 index               | docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md   | foundation で固定した capability 契約             |
| api-ipc-system-core        | .claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md                                      | health route / llm IPC canonical                  |
| llm-ipc-types              | .claude/skills/aiworkflow-requirements/references/llm-ipc-types.md                                            | health / selected-config 型契約                   |
| security-electron-ipc-core | .claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md                               | preload / sender 検証の境界                       |
| arch-state-management-core | .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md                               | store ownership と selector 境界                  |

## 実行手順

### ステップ1: Phase 2 の validation-matrix.md を読み込む

`phase-2-design.md` に記載の validation matrix からテスト観点（Unit / Integration / Manual）を抽出し、観点ごとにテストケース候補をリストアップする。

### ステップ2: M-2（resolve シグネチャ）を確定し contract-matrix.md に追記する

`IRuntimePolicyResolver.resolve()` の呼び出し形式として以下の2案を比較し、1案に確定して `outputs/phase-4/resolve-signature-decision.md` に根拠を記録する。

- 案A: 呼び出し元が引数（surface / authMode / apiKey）を明示的に渡す形式
- 案B: Resolver 内部で DI 注入済みストアから取得する形式

確定後、`phase-2-design.md` の `contract-matrix.md` 相当箇所にシグネチャを追記する。

### ステップ3: テストケース仕様書を作成する

ownership table の4カテゴリ（runtime 実行可否 / health check / handoff bundle / authMode 参照）ごとに以下を記述する。

- Unit テスト: 各 concern の入出力境界、正常系・異常系・境界値
- Integration テスト: surface 横断シナリオ（Chat→Agent→Skill の連続実行）、IPC 契約の一致確認
- Manual テスト: Renderer から見える UI 状態と policy 判定結果の対応確認

成果物: `outputs/phase-4/test-case-specification.md`

### ステップ4: mock 境界定義書を作成する

以下の3境界でモック差し替え点を定義する。

- `RuntimePolicyResolver` mock: Unit テストで policy 判定ロジックのみを検証する際の境界
- `TerminalHandoffBuilder` mock: handoff bundle 生成を切り離す際の境界
- health route mock: IPC 経由の health check 応答を制御する際の境界

成果物: `outputs/phase-4/mock-strategy.md`

### ステップ5: 統合テスト連携を更新し、完了条件と次 Phase handoff を確認する

phase 固有の integration 観点を outputs とチェックリストへ反映した後、残件・blocked 条件・次 Phase 前提を記録する。

## 統合テスト連携（Phase 1〜11は必須）

Unit / Integration / Manual の test type ごとに対象シナリオを切り分ける。

- Unit: `RuntimePolicyResolver` / `TerminalHandoffBuilder` の単体入出力検証
- Integration: Chat→Agent→Skill の surface 横断連携シナリオ、health check IPC 応答検証
- Manual: Renderer 上で policy 判定結果が UI 状態に正しく反映されることの目視確認

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: 各 surface のローカル runtime 判定を中央 policy / resolver に寄せ、消費契約を統一する

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物                     | パス                                          | 内容                                                                                     |
| -------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| テストケース仕様           | outputs/phase-4/test-case-specification.md    | ownership 4カテゴリごとの Unit / Integration / Manual テストケース仕様                   |
| モック境界定義             | outputs/phase-4/mock-strategy.md              | RuntimePolicyResolver / TerminalHandoffBuilder / health route の mock 境界と差し替え方針 |
| resolve シグネチャ確定結果 | outputs/phase-4/resolve-signature-decision.md | M-2 対処結果：引数渡し vs DI 内部取得の比較根拠と確定シグネチャ                          |

## 完了条件

- [ ] テストタイプ（Unit / Integration / Manual）ごとの責務分離が定義されている
- [ ] ownership table の4カテゴリに対してテストケース仕様が網羅されている
- [ ] M-2（resolve シグネチャ）が確定され `resolve-signature-decision.md` に根拠が記録されている
- [ ] mock 境界が3境界（RuntimePolicyResolver / TerminalHandoffBuilder / health route）で定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-4/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] 前Phaseの gate 条件を満たした前提で実行手順が書かれている

## 次のPhase

- [Phase 5（実装）](./phase-5-implementation.md)
