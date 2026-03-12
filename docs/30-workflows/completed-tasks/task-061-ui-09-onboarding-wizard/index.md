# TASK-UI-09-ONBOARDING-WIZARD: はじめよう - タスク実行仕様書

## ユーザーからの元の指示

```text
/.claude/skills/task-specification-creator/ タスク仕様書作成skill（@.claude/skills/task-specification-creator/）に従ってディレクトリを作成して各タスク仕様書を作成して。各タスクごとの最適なタスク仕様書を確実に作成して。まずは、適切なブランチを切ってから、タスク仕様書を作成してください。そして、システムの仕様書スキルの内容も反映させること。
システム仕様書スキル：/aiworkflow-requirements （@.claude/skills/aiworkflow-requirements/）
今は、タスクの実行は現状不要です。仕様書を作成することに専念すること。

並列実行できる部分は、並列で処理を行ってください。ただし、直列で実行するべき箇所は直列で実行すること。
関心ごとの分離の本質を元に、複数のエージェントで関心ごとを分離できる奴は分離して並列サブエージェントで進めてください。
ただし、phase1-3の設計書関係が作成できてから、次のphaseに進めること。設計書がないとタスク仕様書は作成できない。
```

## タスク概要

### 目的

初回起動時だけ表示する 4 ステップの「はじめよう」ウィザードを、現行 Renderer shell、Store、Preload 契約に沿って実装できる状態まで分解する。

### 背景

- 参照元タスク本文には UI 体験と完成条件が十分に書かれている
- そのまま実装へ進むと `window.electronAPI.config` のような現行コードに存在しない契約を前提にしてしまう
- `dashboard` の内部 `ViewType`、`settings` 公開シェル、`SkillCenter` の import 導線、`useDisplayName()` の表示名解決を同時に扱うため、Phase 1-3 で設計補正を固定する必要がある

### 最終ゴール

- `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/` に Phase 1-13 の仕様書を揃える
- Phase 1-3 で UI/状態/永続化/導線/テスト境界を確定する
- 実装フェーズでは既存 shell 契約を崩さず、オーバーレイ形式でオンボーディングを組み込める

### 成果物一覧

| 種別 | 成果物 | 配置先 |
| --- | --- | --- |
| workflow | メイン task 仕様書 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/index.md` |
| phase specs | Phase 1-13 仕様書 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/phase-*.md` |
| artifact registry | canonical artifacts registry | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/artifacts.json` |
| phase outputs | Phase 1-3 成果物 | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-*` |
| verification | 仕様書検証レポート | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/verification-report.md` |

## メタ情報

| 項目 | 内容 |
| --- | --- |
| タスクID | TASK-UI-09-ONBOARDING-WIZARD |
| 種別 | UI仕様書作成 |
| 優先度 | low |
| ステータス | completed_with_minor_open_items |
| 作成ブランチ | `task/task-061-ui-09-onboarding-wizard-specs` |
| workflow パス | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/` |
| 参照元タスク | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-061-ui-09-onboarding-wizard.md` |
| 依存ゲート | `task-057`, `task-058a`, `task-058b`, `task-059a`, `task-059b`, `task-058c`, `task-058d`, `task-058e`, `task-030` 完了後 |

## 参照ファイル

- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-061-ui-09-onboarding-wizard.md`
- `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/task-000-master-index.md`
- `apps/desktop/src/renderer/App.tsx`
- `apps/desktop/src/renderer/views/DashboardView/index.tsx`
- `apps/desktop/src/renderer/views/DashboardView/components/dashboardContent.ts`
- `apps/desktop/src/renderer/views/SettingsView/index.tsx`
- `apps/desktop/src/renderer/store/index.ts`
- `apps/desktop/src/renderer/store/slices/settingsSlice.ts`
- `apps/desktop/src/renderer/components/atoms/SuggestionBubble/index.tsx`
- `apps/desktop/src/renderer/components/atoms/EmptyState/index.tsx`
- `apps/desktop/src/preload/index.ts`
- `apps/desktop/src/main/ipc/storeHandlers.ts`
- `apps/desktop/src/main/ipc/validation.ts`

## 受入基準

| ID | 基準 |
| --- | --- |
| AC-01 | オンボーディングは新しい `ViewType` を追加せず、`dashboard` 上のフルスクリーンオーバーレイとして設計されている |
| AC-02 | 永続化は既存 `window.electronAPI.store.get/set` と `window.electronAPI.theme.set` を使う設計へ補正されている |
| AC-03 | `window.electronAPI.config` を前提にしない |
| AC-04 | Step 1 の名前入力は `settingsSlice.userProfile.name` と `useDisplayName()` の fallback 設計に接続されている |
| AC-05 | Step 2 の AI 応答はローカルモックだけで成立し、実 API 呼び出しを含まない |
| AC-06 | Step 3 のカード表示名と実 import に使う `skillName` を分離している |
| AC-07 | Step 4 のテーマ切替は `useSetThemeMode()` 相当の個別セレクタを使う前提で設計されている |
| AC-08 | 設定画面からの再表示導線は `settings` 公開シェル契約と矛盾しない |
| AC-09 | Phase 1-13 を `completed`、workflow status を `completed_with_minor_open_items` として明示している |
| AC-10 | Atent Team / SubAgent の直列区間と並列区間が仕様書に固定されている |

## 設計補正マトリクス

| 元タスク本文の前提 | 現行コードの事実 | 本 workflow で採用する設計 |
| --- | --- | --- |
| `window.electronAPI.config` を呼ぶ | 現行 preload は `window.electronAPI.store` と `theme` を公開している | 完了フラグと選択済みツールは `store:get/set`、テーマは `theme:set` を使う |
| `onboardingUserName` を electron-store に置く | `DashboardView` は `useDisplayName()` を使い、現状は auth profile しか見ない | Step 1 完了時に `settingsSlice.userProfile.name` を更新し、`useDisplayName()` の fallback 拡張を設計へ含める |
| オンボーディング専用画面を前提にしている | `App.tsx` は `dashboard` / `settings` / `skillCenter` を現行 shell で制御している | `dashboard` 上の modal overlay として統合し、内部 `ViewType` を変えない |
| Step 3 のカード名がそのまま import 対象になる | `importSkill(skillName)` は実 `skillName` を要求する | 表示 copy と実 `skillName` を分離し、`availableSkillsMetadata` から実在 skill を選ぶ |

## スコープ

**含む**

- Phase 1-13 の task 仕様書作成
- Phase 1-3 の設計成果物作成
- UI shell 組み込み、状態管理、永続化、テーマ切替、設定再表示、Skill import 導線の設計
- aiworkflow-requirements 正本からの必要仕様抽出

**含まない**

- 実コード実装
- テスト実行
- commit / push / PR
- `task-workflow.md` を completed へ同期する作業

## Atent Team / SubAgent 編成

| Lane | 担当関心ごと | 実行順序 | 並列可否 |
| --- | --- | --- | --- |
| SubAgent-A | 参照元タスク分析、aiworkflow 抽出、契約差分固定 | 最初 | 直列 |
| SubAgent-B | App shell / navigation / settings rerun / persistence 設計 | A 後 | C と並列 |
| SubAgent-C | Step copy / mock response / skill card / theme / responsive 設計 | A 後 | B と並列 |
| SubAgent-D | 設計レビュー、traceability、Phase 4-13 planning | B/C 後 | 直列 |
| Codex lane | 将来の実装実行 lane | Phase 4 以降 | Phase 1-3 完了後のみ |

## aiworkflow-requirements 抽出対象

| 仕様書 | 適用ポイント |
| --- | --- |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | Tap & Discover、UX 言語、SuggestionBubble、EmptyState mood |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` | shared component の再利用境界 |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | Dashboard Home、SkillCreateWizard、mobile overlay、画面証跡運用 |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md` | `dashboard` / `settings` / overlay / keyboard navigation 契約 |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md` | `settings` 公開シェル、未認証時 reset 除外、再表示導線 |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | `currentView` 正規化、local state 優先、P31 個別セレクタ |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | preload 境界、既存 IPC 再利用、Renderer からの直接 Node 使用禁止 |
| `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 完了台帳と Phase 12 同期先 |

## 実行ポリシー

- Phase 1-12 の成果物と workflow 本文を同一ターンで completed へそろえる
- `App.tsx` と `ViewType` 契約を壊す設計を禁止する
- commit / PR はユーザー明示承認後に Phase 13 で実施する
- Step 3 の import 対象は実在 `skillName` を固定した curated list から選ぶ
- Phase 4-12 の成果物、Phase 11 screenshot 証跡、Phase 12 compliance check を current workflow 配下へ保持する

### 追加の仕様作成ルール

- minor open item は unassigned task へ formalize し、本体 workflow は completed_with_minor_open_items として閉じる
- 仕様実行ログ・スクリーンショット監査は Phase 11 / 12 実績に合わせて保持する

## Phase 一覧

| Phase | 名称 | ファイル | ステータス |
| --- | --- | --- | --- |
| 1 | 要件定義 | [phase-1-requirements.md](./phase-1-requirements.md) | completed |
| 2 | 設計 | [phase-2-design.md](./phase-2-design.md) | completed |
| 3 | 設計レビュー | [phase-3-design-review.md](./phase-3-design-review.md) | completed |
| 4 | テスト作成 | [phase-4-test-creation.md](./phase-4-test-creation.md) | completed |
| 5 | 実装 | [phase-5-implementation.md](./phase-5-implementation.md) | completed |
| 6 | テスト拡充 | [phase-6-test-expansion.md](./phase-6-test-expansion.md) | completed |
| 7 | カバレッジ確認 | [phase-7-coverage-check.md](./phase-7-coverage-check.md) | completed |
| 8 | リファクタリング | [phase-8-refactoring.md](./phase-8-refactoring.md) | completed |
| 9 | 品質保証 | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md) | completed |
| 10 | 最終レビュー | [phase-10-final-review.md](./phase-10-final-review.md) | completed |
| 11 | 手動テスト | [phase-11-manual-test.md](./phase-11-manual-test.md) | completed |
| 12 | ドキュメント更新 | [phase-12-documentation.md](./phase-12-documentation.md) | completed |
| 13 | PR作成 | [phase-13-pr-creation.md](./phase-13-pr-creation.md) | completed |

## Phase 1-3 完了条件

- `outputs/phase-1/` に要件・スコープ・受入基準・SubAgent 責務が出力されている
- `outputs/phase-2/` にコンポーネント、状態/永続化、導線、仕様抽出、traceability が出力されている
- `outputs/phase-3/` に design review の判定と指摘一覧が出力されている
- root `artifacts.json` と `outputs/artifacts.json` が current 実績と同期している

## 再設計監査メモ

| 観点 | 結論 |
| --- | --- |
| shell integration | `App.tsx` catch-all route に onboarding gate を差し込み、`dashboard` の上へ scrim + modal を載せる |
| display name | `useDisplayName()` は `profile.displayName` に加えて `settingsSlice.userProfile.name` を fallback に含める |
| persistence | `onboarding.completed` と `onboarding.selectedSkillName` は `electronAPI.store`、名前は `settingsSlice.userProfile.name` で保持する |
| tool import | Step 3 は表示ラベルではなく `skillName` を持つ curated card data を使い、完了時に既存 `importSkill(skillName)` を非同期で呼ぶ |
| rerun path | SettingsView に「はじめようを再表示」を追加し、`onboarding.completed=false` と `currentView="dashboard"` を同一フローで扱う |
