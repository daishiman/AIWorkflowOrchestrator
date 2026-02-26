# Phase 1: 要件定義

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 1                                                                      |
| Phase名    | 要件定義                                                               |
| タスクID   | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                                   |
| タスク名   | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）  |
| 機能名     | ut-type-skill-identifier-branded-001                                   |
| 前提Phase  | なし                                                                   |
| 後続Phase  | Phase 2                                                                |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#867](https://github.com/daishiman/AIWorkflowOrchestrator/issues/867) |

## 目的

`skill.id` と `skill.name` を型レベルで分離し、コンパイル時に取り違えを検出できる受け入れ基準を確定する。

## 背景

Issue #867 は Renderer 層で `skill.id` を IPC 引数として渡したことで、`skill:import` が期待する `skillName` と不一致になり、インポート失敗が再発しうる構造を示している。文字列識別子の意味差を型で固定し、再発を防ぐ要件定義が必要。

## Atent Team編成

| 役割       | 担当         | 責務                       |
| ---------- | ------------ | -------------------------- |
| Lead       | 統合担当     | 判定基準と除外スコープ確定 |
| SubAgent-A | 型要件担当   | SkillId/SkillName要件定義  |
| SubAgent-B | UI/Store担当 | Renderer/Store境界要件整理 |
| SubAgent-C | IPC契約担当  | Main/Preload契約要件整理   |

## 実行タスク

- SubAgent-A（型要件）: Branded Type 導入の機能要件・非機能要件を定義する
- SubAgent-B（境界要件）: `selectedIds -> skillNames` 変換境界の要件を定義する
- SubAgent-C（契約要件）: `skill:import` と関連 IPC 契約を要件化する
- Lead（統合判定）: 完了条件・除外範囲・依存タスク関係を確定する

## 参照資料

| 参照資料                    | パス                                                                        | 内容              |
| --------------------------- | --------------------------------------------------------------------------- | ----------------- |
| 元未タスク指示書            | `docs/30-workflows/unassigned-task/task-type-skill-identifier-branded.md`   | Why/What/How 正本 |
| Issue                       | `https://github.com/daishiman/AIWorkflowOrchestrator/issues/867`            | 受け入れ背景      |
| task-spec create workflow   | `.claude/skills/task-specification-creator/references/create-workflow.md`   | 仕様書作成手順    |
| task-spec quality standards | `.claude/skills/task-specification-creator/references/quality-standards.md` | Phase品質基準     |

### システム仕様（aiworkflow-requirements）

> 実装前に以下を確認し、既存仕様との整合を確保する。

| 参照資料                             | パス                                                                                        | 内容                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill 型定義と既存課題                     |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S14 境界変換パターン                       |
| api-ipc-agent                        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | `skill:import` 契約                        |
| security-skill-ipc                   | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | sender検証と入力検証                       |
| security-api-electron                | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge/IPC 公開面のセキュリティ要件 |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | skill slice 状態契約                       |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | エラー分類                                 |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | テスト基準                                 |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 残課題台帳との整合                         |
| resource-map                         | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                            | 必要仕様の抽出根拠                         |
| topic-map                            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                               | 参照セクション特定                         |

## 実行手順

1. Lead がスコープと除外項目を確定する（直列）。
2. SubAgent-A/B/C が要件抽出を並列実行する（並列）。
3. Lead が3系統の要件を統合し、受け入れ基準を単一表へ統合する（直列）。
4. 依存タスク `UT-FIX-SKILL-IPC-NAMING-P45-001` と `UT-FIX-5-1-001` の境界を明記する（直列）。

## 統合テスト連携

| 観点         | 連携内容                                  |
| ------------ | ----------------------------------------- |
| Renderer→IPC | `onImport` 引数の型と値を整合確認         |
| IPC→Main     | `skill:import` 引数検証とエラー伝播を確認 |
| 回帰防止     | `skill.id` が渡らない否定条件を固定       |

## 多角的チェック観点（AIが判断）

| 観点               | 適用内容                            |
| ------------------ | ----------------------------------- |
| セキュリティ       | IPC sender 検証と文字列検証の要件化 |
| アーキテクチャ     | shared 型定義の単一正本化           |
| API/IPC契約        | Renderer/Preload/Main の引数整合    |
| エラーハンドリング | VALIDATION_ERROR の返却条件固定     |
| テスタビリティ     | 型テストと統合テストの分離          |

## 成果物

| 成果物         | パス                                         | 説明                  |
| -------------- | -------------------------------------------- | --------------------- |
| 要件定義       | `outputs/phase-1/requirements-definition.md` | FR/NFR と受け入れ基準 |
| スコープ定義   | `outputs/phase-1/scope-definition.md`        | 対象/非対象の確定     |
| 変換境界定義   | `outputs/phase-1/boundary-definition.md`     | id/name 境界ルール    |
| SubAgent責務表 | `outputs/phase-1/subagent-team-plan.md`      | Atent Team 分担       |

## 完了条件

- [ ] Branded Type 導入の機能要件と非機能要件が文書化されている
- [ ] `skill.id` と `skill.name` の境界条件が明文化されている
- [ ] 除外スコープが明示されている
- [ ] SubAgent の並列担当と Lead の直列統合手順が記載されている
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] 完了条件チェックを更新済み

## 依存関係

- **前提**: なし
- **後続**: Phase 2

## サブタスク管理

- [ ] 参照資料確認
- [ ] SubAgent-A/B/C の要件抽出
- [ ] Lead 統合レビュー
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物パスが `artifacts.json` と整合
- [ ] 次Phaseへの引き継ぎ事項を記録

## 次のPhase

Phase 2: [phase-2-design.md](phase-2-design.md)
