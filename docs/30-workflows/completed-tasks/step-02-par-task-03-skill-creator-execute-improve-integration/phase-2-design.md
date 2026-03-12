# Phase 2: 設計

## メタ情報

| 項目   | 値                                                            |
| ------ | ------------------------------------------------------------- |
| Phase  | 2                                                             |
| 機能名 | step-02-par-task-03-skill-creator-execute-improve-integration |
| 作成日 | 2026-03-11                                                    |

## 目的

Skill Creator の表導線を `SkillManagementPanel` 上の単一セッションに統合し、`作成 -> 実行 -> 改善` を 1 画面で完結させる設計を確定する。

## 実行タスク

- API位置づけ決定: `skillCreatorAPI` を表 API ではなく内部モード判定・検証エンジンとして定義する
- セッション設計: `SkillManagementPanel` 上の session card と wizard の責務境界を設計する
- 状態遷移設計: create / execute / improve の handoff と selection 更新を設計する
- 内部オーケストレーション設計: Planner / Executor / Improver の責務分離と IPC 境界を設計する
- テスト観点整理: Phase 4 以降で検証する正常系・失敗系・UI 契約を設計へ落とし込む

## 参照資料

| 資料名                    | パス                                                                                                      | 説明                             |
| ------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件定義          | `outputs/phase-1/requirements-definition.md`                                                              | 機能要件と非機能要件             |
| Phase 1 受け入れ基準      | `outputs/phase-1/acceptance-criteria.md`                                                                  | 完了判定の基準                   |
| Phase 1 スコープ定義      | `outputs/phase-1/scope-definition.md`                                                                     | 対象範囲と除外範囲               |
| Phase 1 SubAgent分担      | `outputs/phase-1/subagent-ownership.md`                                                                   | 関心ごとの分担                   |
| Task01 Phase 2            | `../step-01-seq-task-01-lifecycle-journey-foundation/phase-2-design.md`                                   | Journey 基盤の設計参照           |
| Task02 Phase 2            | `../../skill-lifecycle-unification/tasks/step-02-par-task-02-chat-platform-unification/phase-2-design.md` | 共通会話基盤の設計参照           |
| UI/UX コンポーネント仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                           | Skill Center と panel の UI 契約 |
| 状態管理仕様              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                              | Redux slice と handoff 契約      |
| API / IPC 仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                      | Main / Preload / Renderer 契約   |
| Electron IPC セキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                              | preload 境界と許可方針           |

## 実行手順

### ステップ1: 既存 API と UI 導線を棚卸しする

`skill.create` / `skill.execute` / `skill.analyze` / `skill.applyImprovements` / `skill.autoImprove` と `skillCreatorAPI.detectMode` / `validateSkill` の責務をコードベースから確定する。

### ステップ2: 単一セッション導線を設計する

`SkillManagementPanel` の list view に session card を追加し、自然言語入力、生成結果、実行結果、改善結果を 1 つのセッション状態に集約する。

### ステップ3: wizard の縮退方針を設計する

`SkillCreateWizard` は「詳細設定で作成する」補助導線へ縮退し、一次導線は session card に統一する。

### ステップ4: 内部オーケストレーション境界を定義する

Planner / Executor / Improver の責務を UI 文言から切り離し、内部ログ・分析結果・進捗へ限定して露出する。

## 統合テスト連携

Phase 4 で以下の統合観点をテスト仕様へ反映する。

| 統合観点        | 接続対象                                           | 検証内容                                    |
| --------------- | -------------------------------------------------- | ------------------------------------------- |
| create handoff  | `window.electronAPI.skill.create`                  | 自然言語入力から skill 作成へ遷移できること |
| execute handoff | `agentSlice.executeSkill`                          | 作成後の選択 skill を実行へ引き継げること   |
| improve handoff | `window.electronAPI.skill.analyze` / `autoImprove` | 実行結果から改善へ遷移できること            |
| internal engine | `window.electronAPI.skillCreator.detectMode`       | モード判定が UI ヒントとして表示されること  |

## 成果物

| 成果物                       | パス                                               | 説明                                     |
| ---------------------------- | -------------------------------------------------- | ---------------------------------------- |
| アーキテクチャ設計           | `outputs/phase-2/architecture-design.md`           | 表導線と内部エンジンの責務分離           |
| セッション状態設計           | `outputs/phase-2/session-state-design.md`          | 画面状態と handoff 契約                  |
| 内部オーケストレーション設計 | `outputs/phase-2/internal-orchestration-design.md` | Planner / Executor / Improver の責務定義 |

## 完了条件

- [ ] `skillCreatorAPI` の位置づけが内部エンジンとして明文化されている
- [ ] 単一セッション導線の状態遷移が定義されている
- [ ] wizard の縮退方針が定義されている
- [ ] Phase 4 の統合テスト観点へ接続されている
