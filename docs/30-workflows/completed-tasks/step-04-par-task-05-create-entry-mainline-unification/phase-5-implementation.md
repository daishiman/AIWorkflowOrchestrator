# Phase 5: 実装

## メタ情報

| 項目      | 値                                |
| --------- | --------------------------------- |
| Phase     | 5                                 |
| 機能名    | create-entry-mainline-unification |
| 作成日    | 2026-03-26                        |
| 前提Phase | Phase 4                           |
| 後続Phase | Phase 6                           |

## 目的

create primary route を `SkillCenter -> skillCreate` に固定し、
secondary / advanced route を壊さずに UI 実装差分へ落とす。

## 実行タスク

- `SkillCenter` CTA 群を primary create entry として扱う
- `SkillCreateWizard` を destination surface として保持する
- `SkillManagementPanel` / `SkillLifecyclePanel` を secondary route として整理する
- provenance / degrade warning の mainline summary 表示を導入する

## 参照資料

| 資料名       | パス                                                                      | 説明                        |
| ------------ | ------------------------------------------------------------------------- | --------------------------- |
| Phase 2 設計 | `phase-2-design.md`                                                       | route / warning 配置        |
| test matrix  | `outputs/phase-4/test-matrix.md`                                          | regression case             |
| Task06 index | `../../step-04-par-task-06-verify-and-improve-lifecycle-surface/index.md` | verify/improve の非対象確認 |

### 現行コードアンカー

| ファイル                                                                  | 実装責務                                    |
| ------------------------------------------------------------------------- | ------------------------------------------- |
| `apps/desktop/src/renderer/views/SkillCenterView/index.tsx`               | primary CTA 表示                            |
| `apps/desktop/src/renderer/views/SkillCenterView/hooks/useSkillCenter.ts` | `skillCreate` handoff                       |
| `apps/desktop/src/renderer/App.tsx`                                       | `skillCreate` route と close 先             |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`        | destination UI                              |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | advanced create/execute/improve panel       |
| `apps/desktop/src/renderer/components/skill/SkillManagementPanel.tsx`     | advanced shell 上の create / lifecycle 切替 |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`           | primary/secondary の wording 正本           |

## 実行手順

### ステップ1: mainline entry を固定する

- `SkillCenter` の CTA から create を始める導線を primary とする。
- create mainline のラベル・説明を `skillLifecycleJourney.ts` の wording と揃える。

### ステップ2: destination surface を固定する

- create 本体は `skillCreate` view 上の `SkillCreateWizard` が担う。
- close 時は `skillCenter` へ戻す。

### ステップ3: secondary route を整理する

- `SkillManagementPanel` の `create` / `lifecycle` view は advanced route 用として残す。
- `SkillLifecyclePanel` の `onOpenWizard` は secondary route 内の移動であり、mainline entry と混同しない。

### ステップ4: warning summary を導入する

- Task03 由来の warning は mainline 上で short summary のみ表示する。
- raw diagnostics は secondary route または後続 diagnostics area へ逃がす。

## 統合テスト連携

- Phase 4 の test matrix を実装差分へ対応づける。
- create route の回帰は `SkillCenterView.cta.test.tsx` と `App.renderView.viewtype.test.tsx` を基準にする。
- secondary route の回帰は `SkillManagementPanel.integration.test.tsx` と `SkillLifecyclePanel.test.tsx` を基準にする。

## 成果物

| 成果物     | パス                        | 内容                 |
| ---------- | --------------------------- | -------------------- |
| 実装計画書 | `phase-5-implementation.md` | 実装対象と境界の記録 |

## 実装しないこと

- verify / improve result surface の詳細化
- governance / terminal handoff rule の hardening
- session / resume 契約

## 完了条件

- [ ] `SkillCenter -> skillCreate` が primary route として説明できる
- [ ] `SkillCreateWizard` が destination surface として整理されている
- [ ] `SkillManagementPanel` / `SkillLifecyclePanel` が secondary route として整理されている
- [ ] warning summary と diagnostics の配置が実装対象として分離されている
- [ ] **本Phase内の全タスクを100%実行完了**
