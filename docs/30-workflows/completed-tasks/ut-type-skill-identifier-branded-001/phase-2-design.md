# Phase 2: 設計

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| Phase      | 2                                                                      |
| Phase名    | 設計                                                                   |
| タスクID   | UT-TYPE-SKILL-IDENTIFIER-BRANDED-001                                   |
| タスク名   | Skill識別子Branded Type導入（SkillId / SkillName コンパイル時型区別）  |
| 機能名     | ut-type-skill-identifier-branded-001                                   |
| 前提Phase  | Phase 1                                                                |
| 後続Phase  | Phase 3                                                                |
| ステータス | 未実施                                                                 |
| 作成日     | 2026-02-25                                                             |
| Issue      | [#867](https://github.com/daishiman/AIWorkflowOrchestrator/issues/867) |

## 目的

`SkillId` / `SkillName` を shared 正本へ追加し、Renderer・Main・Preload の境界変換設計を確定する。

## 背景

既存仕様では `string` が単一扱いのため、実装者が命名規約だけで区別する構造になっている。型システムで強制する設計に変えることで、レビュー依存を減らす。

## Atent Team編成

| 役割       | 担当         | 責務                                   |
| ---------- | ------------ | -------------------------------------- |
| Lead       | 設計統合     | 方式決定と依存関係整理                 |
| SubAgent-A | shared型設計 | Brand 型・変換関数設計                 |
| SubAgent-B | Renderer設計 | SkillImportDialog/AgentView 変換点設計 |
| SubAgent-C | IPC設計      | Main/Preload 引数・戻り値設計          |
| SubAgent-D | テスト設計   | 型テスト配置と失敗条件設計             |

## 実行タスク

- SubAgent-A（型設計）: `packages/shared/src/types/skill.ts` の型追加案を作成する
- SubAgent-B（UI設計）: Renderer 境界での `SkillId -> SkillName` 変換フローを設計する
- SubAgent-C（IPC設計）: `skill:import` 契約との整合と fallback 方針を設計する
- SubAgent-D（テスト設計）: type test / unit test / integration test のマトリクスを設計する
- Lead（統合）: 採用設計を単一仕様に統合する

## 参照資料

| 参照資料                  | パス                                                                           | 内容               |
| ------------------------- | ------------------------------------------------------------------------------ | ------------------ |
| 依存Phase 1               | `phase-1-requirements.md`                                                      | 要件と受け入れ基準 |
| task-spec phase templates | `.claude/skills/task-specification-creator/references/phase-templates.md`      | 必須構成           |
| task-spec review criteria | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | Phase 3判定基準    |
| 要件定義                  | `outputs/phase-1/requirements-definition.md`                                   | Phase 1 成果物     |
| スコープ定義              | `outputs/phase-1/scope-definition.md`                                          | Phase 1 成果物     |
| 変換境界定義              | `outputs/phase-1/boundary-definition.md`                                       | Phase 1 成果物     |
| SubAgent責務表            | `outputs/phase-1/subagent-team-plan.md`                                        | Phase 1 成果物     |

### システム仕様（aiworkflow-requirements）

| 参照資料                             | パス                                                                                        | 内容                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| interfaces-agent-sdk-skill           | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | SkillImportDialog 契約                  |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S14 / P44 / P45                         |
| api-ipc-agent                        | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | `skill:import` 契約                     |
| security-skill-ipc                   | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | trim 検証要件                           |
| security-api-electron                | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | contextBridge と IPC 公開境界の安全要件 |
| arch-state-management                | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | skill slice 型                          |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | Validation Error 契約設計               |
| quality-requirements                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | TDD/カバレッジ設計基準                  |
| technology-core                      | `.claude/skills/aiworkflow-requirements/references/technology-core.md`                      | TypeScript 制約                         |

## 実行手順

1. SubAgent-A/B/C/D が設計案を並列で作成する（並列）。
2. Lead が案を比較し採用案を決定する（直列）。
3. 型変換関数の命名規則と実装位置を確定する（直列）。
4. コード変更順序を `shared -> renderer -> main/preload -> tests` で固定する（直列）。

## 統合テスト連携

| 観点     | 連携内容                                           |
| -------- | -------------------------------------------------- |
| 型整合   | shared 型変更が renderer/main へ伝播することを確認 |
| 契約整合 | IPC 引数 `skillName` の整合を確認                  |
| 回帰     | 既存 import フローの仕様を維持                     |

## 多角的チェック観点（AIが判断）

| 観点           | 適用内容                              |
| -------------- | ------------------------------------- |
| アーキテクチャ | shared 正本型に一元化                 |
| API/IPC契約    | Main/Preload/Renderer の型契約同期    |
| セキュリティ   | IPC バリデーション条件維持            |
| パフォーマンス | 型導入の実行時オーバーヘッド 0 を確認 |
| テスタビリティ | 失敗条件テスト先行作成                |

## 成果物

| 成果物               | パス                                            | 説明           |
| -------------------- | ----------------------------------------------- | -------------- |
| 型設計書             | `outputs/phase-2/branded-type-design.md`        | Brand 型設計   |
| 境界変換設計         | `outputs/phase-2/boundary-conversion-design.md` | id/name 変換点 |
| IPC整合設計          | `outputs/phase-2/ipc-contract-alignment.md`     | IPC整合        |
| テスト設計マトリクス | `outputs/phase-2/test-matrix.md`                | テスト戦略     |

## 完了条件

- [ ] Brand 型の定義場所と公開方法が確定している
- [ ] Renderer 境界変換の設計が確定している
- [ ] IPC 契約の整合条件が確定している
- [ ] テスト設計マトリクスが Phase 4 に引き継ぎ可能な状態である
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスク成果物が生成済み
- [ ] 完了条件チェックを更新済み

## 依存関係

- **前提**: Phase 1
- **後続**: Phase 3

## サブタスク管理

- [ ] 参照資料確認
- [ ] SubAgent-A/B/C/D 設計作成
- [ ] Lead 採用判断
- [ ] 成果物作成
- [ ] 完了条件検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物パスが `artifacts.json` と整合
- [ ] 次Phaseへの引き継ぎ事項を記録

## 次のPhase

Phase 3: [phase-3-design-review.md](phase-3-design-review.md)
