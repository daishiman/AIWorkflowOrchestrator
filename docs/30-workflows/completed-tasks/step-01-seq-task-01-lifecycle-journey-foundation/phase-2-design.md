# Phase 2: 設計

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| Phase      | 2                                                      |
| Phase名    | 設計                                                   |
| タスクID   | TASK-SKILL-LIFECYCLE-01                                |
| タスク名   | スキルライフサイクル一次導線・画面責務基盤             |
| 機能名     | skill-lifecycle-journey-foundation                     |
| 前提Phase  | [phase-1-requirements.md](./phase-1-requirements.md)   |
| 後続Phase  | [phase-3-design-review.md](./phase-3-design-review.md) |
| ステータス | completed                                              |
| 作成日     | 2026-03-11                                             |

## 目的

一次導線、画面責務、advanced 導線、Task02-05 依存契約を、実装可能かつレビュー可能な設計へ落とし込む。

## Atent Team 編成

| 役割       | 担当              | 責務                                       |
| ---------- | ----------------- | ------------------------------------------ |
| Lead       | 設計統合          | 採用案決定、設計全体整合                   |
| SubAgent-A | Journey Agent     | 一次導線シーケンス、開始地点/完了地点設計  |
| SubAgent-B | Surface Agent     | 画面責務マトリクス、表示ラベル、説明責務   |
| SubAgent-C | Contract Agent    | Task02-05 の入力・出力・禁止事項設計       |
| SubAgent-D | System Spec Agent | `.claude` 正本仕様の抽出順序と更新候補整理 |

## 実行タスク

- 一次導線シーケンス設計: `開始 -> 意図確認 -> 作成/選択 -> 品質判定 -> 実行 -> 改善/再評価` を定義する
- 画面責務設計: 主要画面の主責務、禁止責務、handoff をマトリクス化する
- advanced 方針設計: hidden / advanced 導線の残置条件、昇格条件、撤去条件を定義する
- 依存契約設計: Task02-05 の入力、出力、禁止事項、受け渡し責務を定義する
- 抽出経路設計: aiworkflow-requirements から必要仕様を読む順序と検索語を確定する

## 参照資料

| 参照資料               | パス                                                                      | 内容                        |
| ---------------------- | ------------------------------------------------------------------------- | --------------------------- |
| Phase 1 要件           | `outputs/phase-1/requirements-definition.md`                              | 要件正本                    |
| Phase 1 スコープ       | `outputs/phase-1/scope-definition.md`                                     | 対象範囲                    |
| Phase 1 導線棚卸し     | `outputs/phase-1/journey-entry-inventory.md`                              | 入口一覧                    |
| app shell              | `apps/desktop/src/renderer/App.tsx`                                       | shell 構造                  |
| nav contract           | `apps/desktop/src/renderer/navigation/navContract.ts`                     | ViewType と導線契約         |
| Skill management panel | `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`     | create/improve handoff 実体 |
| public view guard      | `apps/desktop/src/renderer/utils/shouldResetUnauthenticatedView.ts`       | `settings` 公開 shell 契約  |
| AppLayout              | `apps/desktop/src/renderer/components/organisms/AppLayout/index.tsx`      | Global shell                |
| GlobalNavStrip         | `apps/desktop/src/renderer/components/organisms/GlobalNavStrip/index.tsx` | desktop/tablet 導線         |
| MobileNavBar           | `apps/desktop/src/renderer/components/organisms/MobileNavBar/index.tsx`   | mobile 導線                 |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                                        | 内容                                                 |
| --------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| UIナビゲーション      | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                     | nav 正本、legacy/rollback の扱い                     |
| feature components    | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | Skill Center / Workspace / Agent / lifecycle catalog |
| state management      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | `navigationSlice` `uiSlice` view ownership           |
| architecture overview | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | shell と view 配置                                   |
| Agent UI              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`              | 実行面の UI 契約                                     |
| Agent execution       | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                | 実行ログ、権限確認、進捗 surface                     |
| Workspace Chat/Edit   | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`              | workspace と chat/edit 境界                          |
| UI原則                | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`              | HIG/WCAG/用語整合                                    |
| 実装パターン          | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 層分離とドリフト回避                                 |

## 実行手順

1. SubAgent-A/B/C/D が一次導線、画面責務、依存契約、仕様抽出順序を並列設計する。
2. Lead が 4 案を統合し、一次導線を 1 本に固定する。
3. `Skill Center` `Workspace` `Agent` `Chat` `Skill Creator` と `SkillManagementPanel` の主責務と禁止責務を決定する。
4. `settings` 公開 shell と `VITE_USE_GLOBAL_NAV_STRIP` rollback を例外条件として分離し、主要導線へ逆流させない設計にする。
5. advanced 導線の「残す」「移す」「隠す」判定基準を決定する。
6. Task02-05 の依存契約を `入力` `出力` `禁止事項` の 3 列で定義する。

## 統合テスト連携

| 観点         | 連携内容                                                                          |
| ------------ | --------------------------------------------------------------------------------- |
| ルーティング | `App.tsx` と `navContract.ts` の route/view 整合をテスト対象にする                |
| UI責務       | 画面ごとの責務重複を smoke test と review checklist へ落とし込む                  |
| 状態管理     | `navigationSlice` `uiSlice` と view local state の ownership を検証対象にする     |
| 例外設計     | `settings` bypass と rollback flag が主要導線を壊さないことを review 観点に加える |

## 多角的チェック観点

| 観点             | 適用内容                                                   |
| ---------------- | ---------------------------------------------------------- |
| UI/UX            | 入口の一意性、用語統一、説明責務                           |
| アーキテクチャ   | shell/view/store の境界、rollback の隔離                   |
| API/IPC契約      | 実行体験が既存 Agent / Workspace 契約と衝突しないこと      |
| アクセシビリティ | 主要導線がキーボード操作と小画面で理解可能であること       |
| テスタビリティ   | route・label・handoff が検証可能な粒度で定義されていること |

## 成果物

| 成果物             | パス                                               | 説明                               |
| ------------------ | -------------------------------------------------- | ---------------------------------- |
| 一次導線シーケンス | `outputs/phase-2/primary-journey-sequence.md`      | 開始地点から改善までの流れ         |
| 画面責務マトリクス | `outputs/phase-2/surface-responsibility-matrix.md` | 画面別の責務・禁止事項             |
| advanced 導線方針  | `outputs/phase-2/advanced-route-policy.md`         | hidden / advanced の扱い           |
| 依存契約表         | `outputs/phase-2/dependency-contracts.md`          | Task02-05 契約                     |
| 仕様抽出マップ     | `outputs/phase-2/spec-extraction-map.md`           | aiworkflow-requirements の参照順序 |

## 完了条件

- [x] 一次導線が 1 本のシーケンスとして定義されている
- [x] 主要画面の責務と禁止責務が重複なく定義されている
- [x] advanced 導線の残置条件と昇格条件が定義されている
- [x] Task02-05 の依存契約が定義されている
- [x] aiworkflow-requirements の参照順序と検索語が定義されている
- [x] 本Phase内の全タスクを100%実行完了

## 依存関係

- 前提: [phase-1-requirements.md](./phase-1-requirements.md)
- 後続: [phase-3-design-review.md](./phase-3-design-review.md)

## サブタスク管理

- [x] 参照資料確認
- [x] SubAgent-A/B/C/D 設計
- [x] Lead 統合判断
- [x] 成果物作成
- [x] 完了条件検証

## タスク100%実行確認

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物が Phase 3-5 から参照可能
- [x] route / state / view 責務が同じ言葉で定義されている

## 次のPhase

Phase 3: [phase-3-design-review.md](./phase-3-design-review.md)
