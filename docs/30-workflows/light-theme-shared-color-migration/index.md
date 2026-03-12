# TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001: ライトテーマ shared 色直書き移行

## ユーザーからの元の指示

```text
ライトモードで今設定していますが、ライトモードの白がきつすぎてチカチカして見にくいです。あと文字に関しても、ライトモードの白色と背景の色と文字の色が同じような色を使っていて、現状文字が見えないという状況になっています。この辺調査して対策を行ってください。全てのライトモードの機能全て共通です。実装は不要なので、まずプラモードで設定してください。調査してください。

/.claude/skills/task-specification-creator/ スキルのタスク仕様書作成の内容を本ワークツリーの本ブランチの変更分に、漏れなくすべて反映させることを最優先とする。/.claude/skills/aiworkflow-requirements/ から今回の実装で必要な情報を漏れなく抽出すること。今はタスク実行は不要で、仕様書作成に専念すること。Phase 1-3 の設計書関係が先で、commit / PR は禁止。仕様書ごとに SubAgent に切り分け、並列化可能な関心ごとは分離して進めること。
```

## タスク概要

### 目的

ライトテーマ全体で発生している可読性問題のうち、**theme token を使わずに直書きされた色クラスの移行**に単一責務で対処する。代表的には `text-white`、`bg-white/5`、`border-white/10`、`bg-slate-*`、`bg-zinc-*` の除去と、semantic token ベースへの統一を扱う。

### 背景

- 調査時点で renderer 配下に hardcoded light/dark 前提の色指定が広く残っていた
- Settings / Dashboard / Auth / WorkspaceSearch のように複数ドメインへまたがるため、token 基盤 task と分けないと修正単位が崩れる
- selector / shell / panel の責務が混ざるため、Batch A-D と lane 分離で進める必要がある

### 最終ゴール

- high-hit file 群の色直書き移行を小さな batch に分けて実行できる
- token foundation を唯一の色契約とし、renderer 側の直書き色依存を減らす
- regression guard task が監査しやすい形で対象ファイルと batch 境界を固定する

### 成果物一覧

| 種別              | 成果物                       | 配置先                                                                 |
| ----------------- | ---------------------------- | ---------------------------------------------------------------------- |
| workflow          | メイン task 仕様書           | `docs/30-workflows/light-theme-shared-color-migration/index.md`        |
| phase specs       | Phase 1-13 仕様書            | `docs/30-workflows/light-theme-shared-color-migration/phase-*.md`      |
| artifact registry | canonical artifacts registry | `docs/30-workflows/light-theme-shared-color-migration/artifacts.json`  |
| phase outputs     | Phase別成果物置き場          | `docs/30-workflows/light-theme-shared-color-migration/outputs/phase-*` |

## メタ情報

| 項目         | 内容                                                              |
| ------------ | ----------------------------------------------------------------- |
| タスクID     | TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001                   |
| タスク種別   | 修正                                                              |
| 優先度       | 高                                                                |
| ステータス   | spec_created                                                      |
| 依存タスク   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001                         |
| 関連タスク   | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001                |
| 発見元       | 2026-03-11 ライトモード調査                                       |
| 作成ブランチ | `docs/task-fix-light-theme-shared-color-migration-specs-20260312` |

## 参照ファイル

- `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`
- `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`
- `apps/desktop/src/renderer/components/molecules/ThemeSelector/index.tsx`
- `apps/desktop/src/renderer/views/AuthView/index.tsx`
- `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx`
- `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.tsx`
- `apps/desktop/src/renderer/components/organisms/WorkspaceSearch/WorkspaceSearchPanel.tsx`
- `apps/desktop/src/renderer/views/SettingsView/index.tsx`
- `apps/desktop/src/renderer/components/organisms/SettingsCard/index.tsx`
- `apps/desktop/src/renderer/views/DashboardView/index.tsx`
- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`

## 受入基準

| ID   | 基準                                                                                                                                                                                                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | 代表 shared view / component が semantic token ベースへ移行される                                                                                                                                                                                                |
| AC-2 | 実コード監査結果に基づき `ThemeSelector` / `AuthModeSelector` / `AuthKeySection` / `AccountSection` / `ApiKeysSection` / `AuthView` / `WorkspaceSearchPanel` を優先対象に含み、`SettingsView` / `SettingsCard` / `DashboardView` は verification-only に分離する |
| AC-3 | 対象スコープ内で `text-white` / `bg-slate-*` / `bg-zinc-*` 依存を段階的に除去する計画がある                                                                                                                                                                      |
| AC-4 | 既存の Settings/Auth/AgentView 関連 light contrast backlog との重複を防ぐ整理方針がある                                                                                                                                                                          |
| AC-5 | 後続の regression guard task が検証しやすいファイル単位の修正バッチに分かれている                                                                                                                                                                                |

## スコープ

**含む**:

- shared layout / major view / high-hit organism のハードコード色移行
- 対象ファイルの優先順位付け
- view ごとの修正バッチ設計
- 既存 backlog の統合方針

**含まない**:

- `tokens.css` の light theme 基礎値設計
- contrast 自動監査や screenshot guard の恒久化
- commit / PR / 実装実行

## 優先対象ファイル

| 優先度 | 対象                                                                                      |
| ------ | ----------------------------------------------------------------------------------------- |
| P1     | `apps/desktop/src/renderer/components/molecules/ThemeSelector/index.tsx`                  |
| P1     | `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx`                |
| P1     | `apps/desktop/src/renderer/components/settings/AuthKeySection/AuthKeySection.tsx`         |
| P1     | `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`                 |
| P1     | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`                 |
| P1     | `apps/desktop/src/renderer/views/AuthView/index.tsx`                                      |
| P1     | `apps/desktop/src/renderer/components/organisms/WorkspaceSearch/WorkspaceSearchPanel.tsx` |
| Verify | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                  |
| Verify | `apps/desktop/src/renderer/components/organisms/SettingsCard/index.tsx`                   |
| Verify | `apps/desktop/src/renderer/views/DashboardView/index.tsx`                                 |
| P2     | `ProfileSection` / `TimezoneSelector` / `LocaleSelector`                                  |
| P2     | `AuthTimeoutFallback` / `AgentView` 周辺の直書き箇所                                      |

## Atent Team / SubAgent 実行方針

| Lane | 担当関心ごと                                                                        | 実行タイミング | 並列可否                   |
| ---- | ----------------------------------------------------------------------------------- | -------------- | -------------------------- |
| A    | `aiworkflow-requirements` 仕様抽出、inventory correction、token/component 境界確定  | Phase 1-2      | 直列                       |
| B    | shared selector / Settings organisms（ThemeSelector / AuthMode / AuthKey / APIKey） | Phase 2        | Lane A 後、C と並列可      |
| C    | Auth surface / WorkspaceSearchPanel の移行設計                                      | Phase 2        | Lane A 後、B と並列可      |
| D    | verification-only lane（SettingsView / SettingsCard / DashboardView）               | Phase 2-3      | B/C 後、最後に確認         |
| E    | Codex 実装 lane（将来）                                                             | Phase 5以降    | Phase 1-3 completed 後のみ |

## ユーザー指定ポリシー

- Phase 1-3 の設計完了までは Phase 4 以降へ進まない
- 実装は現時点で行わない
- commit / PR はユーザー承認まで禁止
- 必要な実装は将来 Codex lane に委譲可能だが、本 task spec では設計を先行する
- `aiworkflow-requirements` の system spec を各 Phase の参照資料へ反映する

## 正本 skill 参照

| 種別                       | パス                                                                        | 用途                               |
| -------------------------- | --------------------------------------------------------------------------- | ---------------------------------- |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md`                        | Phase 1-13 骨格と validator の正本 |
| phase templates            | `.claude/skills/task-specification-creator/references/phase-templates.md`   | 必須セクション確認                 |
| phase 11/12 guide          | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | Phase 11/12 の必須運用確認         |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`                           | resource-map 起点の仕様抽出正本    |
| resource map               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`            | 今回必要な system spec の入口      |

## aiworkflow-requirements 抽出セット

| 関心ごと                     | 正本仕様                                                                                                                                                                                                                                    | 抽出理由                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| design token / contrast      | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                                                                                                                                                                  | token scope と component scope の境界を固定する              |
| settings domain              | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                                                                                                                                                       | `AccountSection` / `ApiKeysSection` / `ThemeSelector` の正本 |
| feature component            | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                                                                                                                             | `AuthView` / `WorkspaceSearchPanel` の機能記録先             |
| shared component 原則        | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                                                                                                     | 共通 selector / section の責務確認                           |
| search / portal              | `.claude/skills/aiworkflow-requirements/references/ui-ux-search-panel.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-portal-patterns.md`                                                                                     | WorkspaceSearch surface、dialog/portal の再利用境界          |
| renderer state               | `.claude/skills/aiworkflow-requirements/references/rag-desktop-state.md`, `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                                      | search/settings state と verification-only lane の境界       |
| auth / IPC contract          | `.claude/skills/aiworkflow-requirements/references/api-ipc-auth.md`, `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`                                                                                                  | AuthKey/AuthMode surface が依存する IPC 契約確認             |
| auth / security architecture | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`, `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`, `.claude/skills/aiworkflow-requirements/references/security-principles.md` | 公開 auth shell と設定 UI の安全境界を維持する               |
| implementation patterns      | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                                                                                                                                                 | batch ごとの修正粒度と再利用パターン                         |
| quality / test               | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`, `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`          | Phase 4-11 の品質基準                                        |
| task 台帳 / lessons          | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`, `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                                                | `spec_created` 記録と再発防止の同期先                        |

## 分解戦略

| 思考軸         | 判断                                                        | 採用理由                                                               |
| -------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------- |
| 抽象化思考     | token 契約を前提にし、画面側は適用だけ扱う                  | cause と effect を分離できる                                           |
| 水平思考       | Settings / Auth / Dashboard / Search を共通問題として束ねる | domain 別に割るより hardcoded color という共通病理でまとめた方が効率的 |
| 2軸思考        | 影響範囲 × 修正難度で Batch A-D を分ける                    | review と並列実行の両立ができる                                        |
| トレードオン   | 一括置換を捨て、batch 方式を採用                            | 速度を少し落として安全性と再利用性を取る                               |
| エレガンス判定 | view 群ごとに責務は分けるが token 再設計は含めない          | 単一責務のまま現実的な作業単位になる                                   |

## create-mode 完了条件

- `task-specification-creator` create-mode の Phase 1-5 を反映し、`artifacts.json` は canonical schema に合わせる
- `outputs/phase-1` から `outputs/phase-13` までの成果物置き場を事前作成する
- `validate-phase-output.js` と `verify-all-specs.js` を通してから仕様書完成とみなす
- `aiworkflow-requirements` は resource-map / quick-reference 起点で必要仕様だけを抽出する

## 再設計監査（2026-03-12）

| 観点                 | 内容                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| inventory correction | root/index の旧棚卸しを、`outputs/phase-1/requirements-definition.md` の現行 inventory に合わせて補正する                           |
| primary targets      | `ThemeSelector` / `AuthModeSelector` / `AuthKeySection` / `AccountSection` / `ApiKeysSection` / `AuthView` / `WorkspaceSearchPanel` |
| verification-only    | `SettingsView` / `SettingsCard` / `DashboardView` は hardcoded color 主因ではなく regression 確認専用 lane とする                   |
| phase gate           | Phase 1-3 が completed になるまで、Phase 4 以降は planned のまま保持する                                                            |
| status policy        | workflow 全体は `spec_created`、実装・commit・PR は未着手のまま維持する                                                             |

## 既存 backlog との関係

| 既存指示書                                                                                                                                     | 位置づけ                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-fix-settings-light-theme-contrast-001.md`              | Settings shell 観点を本タスクへ統合                     |
| `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-imp-auth-timeout-fallback-light-contrast-guard-001.md` | timeout fallback の個別 light contrast を参照           |
| `docs/30-workflows/completed-tasks/task-ui-03-agent-view-enhancement/unassigned-task/task-ut-ui-03-light-secondary-text-contrast-001.md`       | token 起因分は Task 1、component 起因分は本タスクで参照 |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス |
| ----- | ---------------- | -------------------------------------------------------------- | ---------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | completed  |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | completed  |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | completed  |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | planned    |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | planned    |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | planned    |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | planned    |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | planned    |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | planned    |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | planned    |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | planned    |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | planned    |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked    |
