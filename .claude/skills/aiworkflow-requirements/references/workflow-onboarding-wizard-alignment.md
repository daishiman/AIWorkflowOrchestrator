# Onboarding Wizard / Settings rerun ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`
> テンプレート: `skill-creator/assets/phase12-system-spec-retrospective-template.md` と `phase12-spec-sync-subagent-template.md` を元に再編

---

## 概要

`TASK-UI-09-ONBOARDING-WIZARD` で実装した onboarding overlay と Settings rerun 契約の正本。
今回の実装内容、苦戦箇所、再利用手順、仕様書別の責務分離を 1 ファイルへ集約し、次回の同種課題で `task-workflow.md` / `ui-ux-settings.md` / `ui-ux-navigation.md` / `lessons-learned.md` を個別に横断しなくて済むようにする。

**トリガー**: `onboarding wizard`, `settings rerun`, `force-open`, `onboarding.hasCompleted`, `system preview readability`, `TC-ID drift`, `follow-up unassigned drift`
**実行環境**: `apps/desktop` current build、Phase 11 screenshot 6件、Phase 12 system spec 同期
**検索キーワード**: `onboarding wizard`, `settings rerun`, `force-open local state`, `system preview`, `TC-11-04`, `follow-up contract drift`

---

## 仕様書別 SubAgent 編成

| SubAgent | 関心ごと | 主担当仕様書 / 実装 | 目的 |
| --- | --- | --- | --- |
| SubAgent-A | UIカタログ | `ui-ux-components.md` | 追加コンポーネント、完了タスク、実装内容と苦戦箇所サマリーを一覧化する |
| SubAgent-B | 機能仕様 / 画面証跡 | `ui-ux-feature-components.md` | overlay flow、screenshot 6件、5分解決カード、関連未タスクを同期する |
| SubAgent-C | 導線契約 | `ui-ux-navigation.md`, `ui-ux-settings.md` | overlay 表示条件、Settings rerun、`system` preview readability を正本へ固定する |
| SubAgent-D | 状態契約 | `arch-state-management.md` | `onboarding.hasCompleted` と local state ownership、completion handoff を整理する |
| SubAgent-E | 台帳 / 未タスク | `task-workflow.md`, `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` | 完了記録、検証値、既存 follow-up backlog の配置と本文契約を同期する |
| SubAgent-F | 教訓化 | `lessons-learned.md` | 苦戦箇所を再発条件付きで残し、5分解決カードへ変換する |
| Lead | 統合入口 | `workflow-onboarding-wizard-alignment.md`, `indexes/resource-map.md`, `indexes/quick-reference.md` | 次回の参照入口を 1 つにまとめる |

---

## 今回実装した内容（2026-03-13）

| 観点 | 実装内容 | 主要ファイル |
| --- | --- | --- |
| overlay surface | 初回起動時に通常画面の上へ Onboarding Wizard overlay を表示する 4 step + completion flow を追加した | `apps/desktop/src/renderer/components/organisms/OnboardingWizard/index.tsx`, `apps/desktop/src/renderer/App.tsx` |
| rerun contract | `SettingsView` header の `はじめてガイドを再表示` から `handleOpenOnboarding()` を呼び、force-open local state で再表示する | `apps/desktop/src/renderer/views/SettingsView/index.tsx`, `apps/desktop/src/renderer/App.tsx` |
| persist contract | `onboarding.hasCompleted` / `onboarding.userName` / `onboarding.selectedStarterTool` / `onboarding.lastCompletedAt` を保存し、rerun 時は `hasCompleted` を書き換えない | `apps/desktop/src/renderer/App.tsx` |
| visual evidence | `TC-11-01..06` の screenshot 6件を current build で取得し、`TC-11-04` で `system` preview readability を再確認した | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/outputs/phase-11/screenshots/` |
| current verification | `verify-all-specs=13/13`, `validate-phase-output=28項目`, `validate-phase11-screenshot-coverage=6/6`, `verify-unassigned-links=220/220`, `audit current=0 / baseline=134` を再取得した | workflow `outputs/verification-report.md`, `outputs/phase-12/*.md` |
| follow-up resweep | 既存 follow-up 2件の配置と本文契約を再同期し、Phase 11 manual note 由来の mobile Step 3 改善余地を新規未タスクとして formalize した | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-test-hardening-guard-001.md`, `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-settings-onboarding-rerun-discoverability-001.md`, `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-mobile-starter-card-order-001.md` |

---

## 苦戦箇所と再発防止

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| rerun と persist save の責務がずれる | rerun 起動時に persisted flag まで変更する | rerun は force-open local state、persist save は completion のみへ分離した | `hasCompleted` は completion だけが更新する |
| `TC-ID` と screenshot 命名がずれる | capture 前に coverage matrix を固めない | `TC-11-01..06` と `screenshots/*.png` を 1 対 1 に固定した | 画面検証要求がある UI は `TC-ID ↔ png` を先に決める |
| `system` preview の split-theme で text contrast が崩れる | inner card にも dark/light split をそのまま適用する | split 表現は outer card に残し、inner card は readable surface に戻した | split-theme UI は outer/inner surface を分離して判定する |
| mobile first fold が崩れる | desktop 用 step indicator を mobile に流用する | `grid-cols-2 sm:grid-cols-4` に変更して再撮影した | mobile wizard は first fold の主コンテンツ可視性を screenshot で確認する |
| 既存 follow-up 未タスクが旧契約を保持する | system spec だけ直し、`docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` の本文を再読しない | `2.2` / `3.1` / `3.5` / 検証手順を current contract へそろえた | Phase 12 の 0 件報告でも既存 follow-up backlog の本文 drift を点検する |
| mobile selected card prominence が first fold 評価に埋もれる | `TC-11-05` の合格を first fold 可視性だけで判断し、selected card の位置を別観点で見ない | manual note の改善余地を `UT-IMP-ONBOARDING-MOBILE-STARTER-CARD-ORDER-001` として formalize した | mobile wizard は first fold と selected-state prominence を別項目で評価する |

---

## 同種課題の 5 分解決カード

1. `onboarding.hasCompleted` と overlay 表示条件を先に固定する。
2. rerun は force-open local state、completion は persist save として責務を分離する。
3. `TC-ID ↔ screenshots/*.png` を capture 前に確定する。
4. `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` の既存 follow-up 本文も current contract へ再同期する。
5. `task-workflow` / `ui-ux-feature-components` / `ui-ux-navigation` / `ui-ux-settings` / `lessons-learned` を同一ターンで閉じる。

---

## 最適なファイル形成

| 情報の種類 | 最適な反映先 | 反映理由 |
| --- | --- | --- |
| 実装全体像、SubAgent 分担、苦戦箇所の統合入口 | `workflow-onboarding-wizard-alignment.md` | task-061 のような UI + rerun + Phase 12 再監査を 1 ファイルで再現できる |
| 追加コンポーネント一覧、完了タスク、実装サマリー | `ui-ux-components.md` | UI カタログとして一覧性が高い |
| overlay flow、画面証跡、関連未タスク、5分解決カード | `ui-ux-feature-components.md` | 機能単位で再利用しやすい |
| overlay 表示条件、`system` preview 契約 | `ui-ux-navigation.md` | 画面導線と visual contract の正本 |
| rerun button、force-open callback、Settings 責務 | `ui-ux-settings.md` | Settings 導線の責務を独立管理できる |
| persist key、dismiss / forcedOpen / completion の ownership | `arch-state-management.md` | state 境界と保存責務を明示できる |
| 完了記録、検証値、follow-up 配置確認 | `task-workflow.md` | 台帳として追跡できる |
| 苦戦箇所、再発条件、5分解決カード | `lessons-learned.md` | 次回の短時間解決に直結する |
| follow-up 指示書本文 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` | 実際に着手する人が読む実行仕様を current contract に保てる |

---

## 検証コマンド（最小セット）

| コマンド | 目的 | 合格条件 |
| --- | --- | --- |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard --json` | workflow 仕様準拠確認 | `13/13 phases pass` |
| `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard` | Phase 出力構造確認 | `28項目 pass` |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard --json` | `TC-ID ↔ screenshot` 整合確認 | `covered=6` |
| `node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard --json` | Part 1 / Part 2 要件確認 | `ok=true` |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | 未タスクリンク検証 | `220 / 220`, `missing=0` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | 今回差分の unassigned-task 監査 | `currentViolations=0` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-test-hardening-guard-001.md` | follow-up 1件目の個別品質確認 | `currentViolations=0` |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD --target-file docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-settings-onboarding-rerun-discoverability-001.md` | follow-up 2件目の個別品質確認 | `currentViolations=0` |
| `diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements` | canonical / mirror 差分確認 | 差分 0 |

---

## 関連改善タスク

| 未タスクID | 概要 | 参照 |
| --- | --- | --- |
| UT-IMP-ONBOARDING-TEST-HARDENING-GUARD-001 | onboarding rerun / already-completed / warning / coverage の guard を integration test で強化する | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-test-hardening-guard-001.md` |
| UT-IMP-SETTINGS-ONBOARDING-RERUN-DISCOVERABILITY-001 | Settings で rerun 入口が埋もれないよう、IA と copy を改善する | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-settings-onboarding-rerun-discoverability-001.md` |
| UT-IMP-ONBOARDING-MOBILE-STARTER-CARD-ORDER-001 | mobile Step 3 で selected starter card を first fold 内の最優先位置で理解しやすくする | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/unassigned-task/task-imp-onboarding-mobile-starter-card-order-001.md` |

---

## 関連ドキュメント

| ドキュメント | 用途 |
| --- | --- |
| [ui-ux-components.md](./ui-ux-components.md) | UI カタログと完了タスク一覧 |
| [ui-ux-feature-components.md](./ui-ux-feature-components.md) | onboarding wizard 機能仕様 |
| [ui-ux-navigation.md](./ui-ux-navigation.md) | overlay 表示条件と visual contract |
| [ui-ux-settings.md](./ui-ux-settings.md) | rerun button と callback 契約 |
| [arch-state-management.md](./arch-state-management.md) | persist key と local state ownership |
| [task-workflow.md](./task-workflow.md) | 完了台帳と検証証跡 |
| [lessons-learned.md](./lessons-learned.md) | 苦戦箇所と 5 分解決カード |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-13 | 1.0.1 | Phase 11 manual note の selected starter card 改善余地を `UT-IMP-ONBOARDING-MOBILE-STARTER-CARD-ORDER-001` として追加し、first fold 可視性と selected-state prominence を別観点で扱う再利用ルールを追記した |
| 2026-03-13 | 1.0.0 | TASK-UI-09-ONBOARDING-WIZARD の統合正本を新規作成。実装内容、苦戦箇所、5分解決カード、仕様書別 SubAgent 編成、follow-up backlog resweep、最適なファイル形成を集約した |
