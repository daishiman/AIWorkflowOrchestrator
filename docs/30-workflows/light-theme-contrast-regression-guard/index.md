# TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001: ライトテーマ contrast 回帰ガード

## ユーザーからの元の指示

```text
ライトモードで今設定していますが、ライトモードの白がきつすぎてチカチカして見にくいです。あと文字に関しても、ライトモードの白色と背景の色と文字の色が同じような色を使っていて、現状文字が見えないという状況になっています。この辺調査して対策を行ってください。全てのライトモードの機能全て共通です。実装は不要なので、まずプラモードで設定してください。調査してください。

/.claude/skills/task-specification-creator/ スキルのタスク仕様書作成の内容を本ワークツリーの本ブランチの変更分に、漏れなくすべて反映させることを最優先とする。/.claude/skills/aiworkflow-requirements/ から今回の実装で必要な情報を漏れなく抽出すること。今はタスク実行は不要で、仕様書作成に専念すること。Phase 1-3 の設計書関係が先で、commit / PR は禁止。仕様書ごとに SubAgent に切り分け、並列化可能な関心ごとは分離して進めること。
```

## タスク概要

### 目的

ライトテーマ不具合の再発を防ぐため、**visual regression / hardcoded color audit / Phase 11 checklist** を整備する。token 修正や component 移行そのものは扱わず、継続的に drift を検出する guard へ単一責務で分離する。

### 背景

- token 修正と component 移行だけでは再発防止にならず、light mode drift を継続検知する仕組みが必要
- screenshot source pinning、current/baseline 分離、hardcoded color grep などの運用知識が散在していた
- validator / audit / checklist を別 task にしないと、修正 task 側の責務が再び肥大化する

### 最終ゴール

- representative 4 画面の screenshot matrix と audit ルールを単独で運用できる
- future execution で token foundation / shared migration とプラスサムに連携できる
- Phase 11 / 12 に light theme contrast の証跡運用が固定化される

### 成果物一覧

| 種別              | 成果物                       | 配置先                                                                    |
| ----------------- | ---------------------------- | ------------------------------------------------------------------------- |
| workflow          | メイン task 仕様書           | `docs/30-workflows/light-theme-contrast-regression-guard/index.md`        |
| phase specs       | Phase 1-13 仕様書            | `docs/30-workflows/light-theme-contrast-regression-guard/phase-*.md`      |
| artifact registry | canonical artifacts registry | `docs/30-workflows/light-theme-contrast-regression-guard/artifacts.json`  |
| phase outputs     | Phase別成果物置き場          | `docs/30-workflows/light-theme-contrast-regression-guard/outputs/phase-*` |

## メタ情報

| 項目         | 内容                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------ |
| タスクID     | TASK-IMP-LIGHT-THEME-CONTRAST-REGRESSION-GUARD-001                                         |
| タスク種別   | 改善                                                                                       |
| 優先度       | 中                                                                                         |
| ステータス   | not_started                                                                                |
| 依存タスク   | TASK-FIX-LIGHT-THEME-TOKEN-FOUNDATION-001, TASK-FIX-LIGHT-THEME-SHARED-COLOR-MIGRATION-001 |
| 発見元       | 2026-03-11 ライトモード調査                                                                |
| 作成ブランチ | `task-20260311-light-theme-specs`                                                          |

## 参照ファイル

- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `apps/desktop/src/renderer/views/SettingsView/index.tsx`
- `apps/desktop/src/renderer/views/DashboardView/index.tsx`
- `apps/desktop/src/renderer/views/AuthView/index.tsx`
- `apps/desktop/src/renderer/components/organisms/WorkspaceSearch/WorkspaceSearchPanel.tsx`

## 受入基準

| ID   | 基準                                                                       |
| ---- | -------------------------------------------------------------------------- |
| AC-1 | light theme representative screen の screenshot matrix が定義される        |
| AC-2 | hardcoded color drift を検出する audit ルールが定義される                  |
| AC-3 | Phase 11 手動テストで light theme contrast を必須確認項目にできる          |
| AC-4 | current/baseline を分離した未タスク・evidence 運用が明記される             |
| AC-5 | 今回の 3 タスクを future execution で並列運用できる guard 形態になっている |

## スコープ

**含む**:

- representative screenshot matrix
- hardcoded color audit ルール / grep パターン / 対象ディレクトリ定義
- Phase 11 manual checklist / discovered-issues 連携設計
- current/baseline 分離ルール

**含まない**:

- `tokens.css` の修正
- component/view の色置換
- commit / PR / 実装実行

## Atent Team / SubAgent 実行方針

| Lane | 担当関心ごと                              | 実行タイミング | 並列可否            |
| ---- | ----------------------------------------- | -------------- | ------------------- |
| A    | system spec / workflow validator 参照整理 | Phase 1-2      | 直列                |
| B    | screenshot matrix / visual checklist 設計 | Phase 2        | Lane A 後に開始     |
| C    | hardcoded color audit 設計                | Phase 2        | Lane B と並列可     |
| D    | Codex 実装 lane（将来）                   | Phase 5以降    | Phase 3 PASS 後のみ |

## ユーザー指定ポリシー

- Phase 1-3 の設計書が完成するまで次 Phase に進まない
- 実装は現時点で不要
- commit / PR はユーザー承認まで禁止
- 必要な実装は将来 Codex lane に委譲可能
- `aiworkflow-requirements` の仕様と `task-specification-creator` の validator 運用を明記する

## 正本 skill 参照

| 種別                       | パス                                                                        | 用途                                  |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------------------- |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md`                        | Phase 1-13 骨格と validator の正本    |
| phase templates            | `.claude/skills/task-specification-creator/references/phase-templates.md`   | 必須セクション確認                    |
| phase 11/12 guide          | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` | screenshot / evidence / Phase 12 運用 |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`                           | resource-map 起点の仕様抽出正本       |
| resource map               | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`            | 今回必要な system spec の入口         |

## aiworkflow-requirements 抽出セット

| 関心ごと                      | 正本仕様                                                                                                                                                                                                                                                                                                         | 抽出理由                               |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| screenshot / quality          | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                                                                                                                                                                                                                      | Phase 4-11 の品質基準                  |
| component / HIG               | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                                                                                                                                                                                                                                          | UIレビュー観点の正本                   |
| design principles             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`                                                                                                                                                                                                                                   | contrast / hierarchy 判定基準          |
| feature record                | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                                                                                                                                                                                                                  | representative feature の同期先        |
| navigation / settings         | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`, `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`                                                                                                                                                                   | representative screen のルート責務確認 |
| task 台帳                     | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                                                                                                                                                                                                                             | current/baseline 運用の同期先          |
| lessons                       | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                                                                                                                                                                                                                           | screenshot 教訓の同期先                |
| component test                | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                                                                                                                                                                                                                                | validator / audit テストの設計基準     |
| accessibility / e2e / fixture | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`, `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`, `.claude/skills/aiworkflow-requirements/references/testing-fixtures.md`, `.claude/skills/aiworkflow-requirements/references/testing-playwright-e2e.md` | screenshot / WCAG / harness / E2E 方針 |

## 分解戦略

| 思考軸         | 判断                                                                | 採用理由                                     |
| -------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| 逆説思考       | 修正 task に guard を混ぜない                                       | 再発防止の運用設計が後回しになりにくい       |
| システム思考   | current / baseline / screenshot source pinning を同一 task に束ねる | evidence drift を一か所で管理できる          |
| 類推思考       | 過去の screenshot 再監査教訓を guard へ昇格する                     | 単発の学びを恒久運用へ変えられる             |
| why思考        | 「なぜ再発したか」を運用設計として残す                              | token 修正だけでは再発しうるため             |
| エレガンス判定 | validator / audit / checklist の 3 点セットで閉じる                 | 実装修正に依存しない再利用可能な task になる |

## create-mode 完了条件

- `task-specification-creator` create-mode の Phase 1-5 を反映し、`artifacts.json` は canonical schema に合わせる
- `outputs/phase-1` から `outputs/phase-13` までの成果物置き場を事前作成する
- `validate-phase-output.js` と `verify-all-specs.js` を通してから仕様書完成とみなす
- `aiworkflow-requirements` は resource-map / quick-reference 起点で必要仕様だけを抽出する

## 既存 backlog / 教訓との関係

| 既存文書                                                                                                                                       | 位置づけ                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `docs/30-workflows/completed-tasks/TASK-FIX-SAFEINVOKE-TIMEOUT-001/unassigned-task/task-imp-auth-timeout-fallback-light-contrast-guard-001.md` | light screenshot 再監査の発見源                        |
| `references/task-workflow.md` の `UT-IMP-WORKSPACE-PHASE11-CURRENT-BUILD-CAPTURE-GUARD-001`                                                    | current build / screenshot source pinning の教訓を継承 |
| `references/lessons-learned.md` の light theme review 教訓                                                                                     | manual review と drift 検出の再利用元                  |

## Phase 一覧

| Phase | 名称             | ファイル                                                       | ステータス  |
| ----- | ---------------- | -------------------------------------------------------------- | ----------- |
| 1     | 要件定義         | [phase-1-requirements.md](./phase-1-requirements.md)           | not_started |
| 2     | 設計             | [phase-2-design.md](./phase-2-design.md)                       | not_started |
| 3     | 設計レビュー     | [phase-3-design-review.md](./phase-3-design-review.md)         | not_started |
| 4     | テスト作成       | [phase-4-test-creation.md](./phase-4-test-creation.md)         | not_started |
| 5     | 実装             | [phase-5-implementation.md](./phase-5-implementation.md)       | not_started |
| 6     | テスト拡充       | [phase-6-test-expansion.md](./phase-6-test-expansion.md)       | not_started |
| 7     | カバレッジ確認   | [phase-7-coverage-check.md](./phase-7-coverage-check.md)       | not_started |
| 8     | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md)             | not_started |
| 9     | 品質検証         | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | not_started |
| 10    | 最終レビュー     | [phase-10-final-review.md](./phase-10-final-review.md)         | not_started |
| 11    | 手動テスト       | [phase-11-manual-test.md](./phase-11-manual-test.md)           | not_started |
| 12    | ドキュメント     | [phase-12-documentation.md](./phase-12-documentation.md)       | not_started |
| 13    | PR作成           | [phase-13-pr-creation.md](./phase-13-pr-creation.md)           | blocked     |
