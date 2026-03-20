# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                  |
| ---------- | ----------------------------------------------------- |
| Phase      | 1                                                     |
| Phase 名   | 要件定義                                              |
| タスクID   | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| 前提 Phase | なし                                                  |
| 後続 Phase | Phase 2（設計）                                       |
| ステータス | not_started                                           |
| 作成日     | 2026-03-19                                            |
| 機能名     | slide-modifier-manual-fallback-alignment              |

## 目的

Slide / Modifier manual fallback alignment の現状、対象範囲、受入基準、除外範囲を明文化する。

## 実行タスク

- 現状棚卸し: Slide / Modifier manual fallback alignment に関係する codepath / doc / open gap を洗い出す
- 要件抽出: functional / non-functional / governance 要件を整理する
- 受入基準化: AC を検証可能な条件へ落とし込む
- スコープ固定: 対象・除外・依存 task を明文化する

## 参照資料

| 参照資料                   | パス                                                                                                                                          | 内容                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 親パック index             | docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md                                                                    | 依存順・並列可否・設計ゲート                      |
| Task index                 | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-05-par-task-08-slide-modifier-manual-fallback-alignment/index.md | 対象 task のメタ情報と受入基準                    |
| 旧canonical workflow       | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                                                 | execution responsibility を主語にした既存問題設定 |
| 親パック UI/UX 正本        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-realization.md                                                        | 状態語彙・CTA・handoff 契約                       |
| 親パック UI/UX 図解        | docs/30-workflows/ai-runtime-execution-responsibility-realignment/ui-ux-diagrams.md                                                           | 状態遷移・画面構成・導線図                        |
| 親パック監査マトリクス     | docs/30-workflows/ai-runtime-execution-responsibility-realignment/design-audit-matrix.md                                                      | 矛盾・依存・漏れの監査軸                          |
| workflow 正本              | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-execution-responsibility-realignment.md                                 | runtime 責務再配線の current canonical            |
| resource map               | .claude/skills/aiworkflow-requirements/indexes/resource-map.md                                                                                | 必要仕様の初動選定                                |
| quick reference            | .claude/skills/aiworkflow-requirements/indexes/quick-reference.md                                                                             | 型・IPC・UI 仕様の即時参照                        |
| interfaces-auth            | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                                                                          | auth/access 契約の親入口                          |
| api-ipc-system             | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                                                                           | system IPC 契約の親入口                           |
| arch-state-management      | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                                                                    | Renderer 責務境界の親入口                         |
| Task05 index               | docs/30-workflows/ai-runtime-execution-responsibility-realignment/tasks/step-03-par-task-05-terminal-handoff-surface-realization/index.md     | shared terminal handoff 契約                      |
| predecessor drift record   | .claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md                                                 | Task09 current code drift の記録                  |
| security-electron-ipc-core | .claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md                                                               | legacy direct path の禁止境界                     |
| ui-ux-agent-execution-core | .claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution-core.md                                                               | manual fallback card の操作契約                   |

## 実行手順

### ステップ1: 参照資料を確認する

common canonical と task 固有 canonical を読み、Slide / Modifier manual fallback alignment の調査スコープを固定する。

### ステップ2: P50 チェック（既実装状態の調査）

実装前に対象ファイルの現在状態を確認する。

```bash
git log --oneline -10 -- apps/desktop/src/renderer/slide/SlideWorkspace.tsx
rg -n "authMode|runtime|handoff|terminal|guidance|health|capability" apps/desktop/src/renderer/slide apps/desktop/src/renderer apps/desktop/src/main/services/slide docs/30-workflows/step-01-seq-task-01-execution-responsibility-contract-foundation docs/30-workflows/ai-runtime-execution-responsibility-realignment || true
```

### ステップ3: 要件・AC・除外範囲を確定する

FR/NFR、AC、依存 task、除外スコープを outputs/phase-1 用に整理する。

### ステップ4: Phase 2 への論点を残す

未確定事項を concern として 3 つ以下に正規化し、Phase 2 の設計トピックへ渡す。

## 統合テスト連携（Phase 1〜11は必須）

統合ポイント（UI state / IPC / settings / terminal handoff）を要件へ明記し、後続 task と重複しないよう境界を固定する。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: silent fallback、legacy path 残置、task ownership 衝突を review する

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物           | パス                                       | 内容                             |
| ---------------- | ------------------------------------------ | -------------------------------- |
| 要件定義書       | outputs/phase-1/requirements-definition.md | 機能要件・非機能要件・受入基準   |
| スコープ定義     | outputs/phase-1/scope-definition.md        | 対象/除外/依存境界               |
| 調査インベントリ | outputs/phase-1/current-state-inventory.md | 現状コードとドキュメントの棚卸し |

## 完了条件

- [ ] 現状コード/ドキュメントの棚卸しが完了している
- [ ] AC が検証可能な文章で定義されている
- [ ] 対象・除外・依存タスクが明記されている
- [ ] Phase 4 は Phase 1-3 完了まで開始しない条件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物パスが `outputs/phase-1/` と一致している
- [ ] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [ ] Phase 4 へ進む前提として Phase 1-3 の gate 条件が明記されている

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md)
