# Skill Creator 作成・実行・改善統合ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。
> 管理: `.claude/skills/aiworkflow-requirements/references/`

---

## 概要

Task03 で実装した `SkillLifecycleSessionCard` を中心に、`SkillManagementPanel` 上で `作成 -> 実行 -> 改善` を 1 セッションで継続するための標準ワークフローを定義する。実装内容、苦戦箇所、仕様書別の責務分離、最短再利用手順をこの 1 ファイルに集約する。

**トリガー**: `Skill Creator` の create / execute / improve 導線統合、session card、wizard secondary route、Task03 再監査、Phase 12 system spec 同期

**実装日**: 2026-03-11  
**再監査日**: 2026-03-12

---

## フェーズ構造

### フェーズ一覧

| Phase | 名称 | 入力 | 出力 |
| --- | --- | --- | --- |
| Phase 1 | UI入口統合 | `SkillManagementPanel` / existing skill views | `SkillLifecycleSessionCard` 一次導線 |
| Phase 2 | handoff / state 接続 | `skillCreator:*` / `skill:*` / `agentSlice` | create 後継続、execute guard、improve summary |
| Phase 3 | 検証・再監査 | targeted tests、typecheck、Phase 11 capture | 30 tests PASS、5 screenshots、Apple review |
| Phase 4 | 仕様同期 | UI / state / IPC / security / task / lessons | system spec 正本 + mirror sync |

### フロー

1. list view の先頭で自然言語 prompt を受ける。
2. `skillCreator.detectMode()` で mode hint を出し、`作成する` を起点に create を開始する。
3. create 成功時に返却 `path` から skill 名を抽出し、`selectSkillByName()` へ handoff する。
4. 同じ card で `実行する` / `分析する` / `全自動改善` を継続し、結果 summary を session-local に閉じる。
5. `SkillCreateWizard` は `詳細設定で作成する` の secondary route として残し、主導線の代替にしない。
6. Phase 11 証跡、Phase 12 補助成果物、`.claude` 正本 / `.agents` mirror を同一ターンで同期する。

### SubAgent 編成（関心ごと分離）

| SubAgent | 担当仕様書 | 主責務 | 完了条件 |
| --- | --- | --- | --- |
| SubAgent-A | `ui-ux-navigation.md` | Skill Center 入口と session handoff の同期 | 入口 / 補助導線 / handoff が読める |
| SubAgent-B | `ui-ux-feature-components.md`, `arch-ui-components.md` | session surface と component boundary の同期 | card / wizard / analysis の責務が読める |
| SubAgent-C | `arch-state-management.md` | local state、global error、execute guard の同期 | state ownership が読める |
| SubAgent-D | `api-ipc-agent.md`, `interfaces-agent-sdk-skill.md` | detect / validate / create handoff 契約の同期 | UI から IPC / type 契約へ辿れる |
| SubAgent-E | `ui-ux-agent-execution.md`, `security-skill-execution.md` | execute 入口と permission boundary の同期 | 実行入口追加と安全境界が分離されている |
| SubAgent-F | `task-workflow.md` | 完了台帳、検証証跡、Phase 12 guard の同期 | 検証値と苦戦箇所が台帳化済み |
| SubAgent-G | `lessons-learned.md` | 再発条件付き教訓と 5 分解決カードの同期 | 次回の短手順が残る |
| Lead | 本ファイル | 仕様書別成果物を 1 か所へ集約 | 最短参照先として機能する |

---

## 今回実装内容（2026-03-11 実装 / 2026-03-12 再監査）

| 観点 | 実装内容 |
| --- | --- |
| UI入口 | `SkillManagementPanel` list view の先頭に `SkillLifecycleSessionCard` を追加し、自然言語 prompt から開始する一次導線へ統一 |
| mode hint | `window.electronAPI.skillCreator.detectMode()` を card に接続し、create 前に意図を可視化 |
| validation | `window.electronAPI.skillCreator.validateSkill()` を non-blocking で使い、create 後の validation summary を card に表示 |
| create handoff | create 成功時に `path` の basename を抽出し、`selectSkillByName()` へ接続して同一セッション継続を保証 |
| execute guard | `activeSkillName` と `trimmedPrompt` の両方が揃った時だけ `実行する` を有効化し、空 prompt 実行を防止 |
| improve flow | `分析する` / `全自動改善` を同カードに接続し、`currentAnalysis` の要約だけを残して判断に必要な情報へ縮約 |
| secondary route | `SkillCreateWizard` は `詳細設定で作成する` から到達する supporting route とし、主導線との競合を排除 |
| error boundary | lifecycle error は card 内に閉じ、panel global error は一覧管理系だけに残して責務を分離 |
| worktree capture | Phase 11 capture script から Vite binary hardcode 依存を外し、worktree でも 5 状態 screenshot を再取得できるようにした |
| Phase 12 | `phase12-task-spec-compliance-check.md`、`verification-report.md`、`.claude` 正本 / `.agents` mirror を再監査値へ同期 |

---

## 苦戦箇所と再発防止

| 苦戦箇所 | 再発条件 | 今回の対処 | 標準ルール |
| --- | --- | --- | --- |
| stale success message が後続 action まで残る | create success を消さずに execute / improve を続ける | 後続 action 開始時に `setSessionMessage(null)` を実行 | multi-step card は stale success を先に消す |
| lifecycle error と panel global error が二重表示になる | list/import 系 error と session 系 error を同じ alert 面へ流す | `shouldShowGlobalSkillError()` で lifecycle 系文言を除外 | panel root error と local error は分離する |
| `.claude` 正本と `.agents` mirror の root が workflow 本文で混線する | 再監査前に mirror 側パスが phase doc / outputs に残る | current workflow は `.claude/skills/...` を正本へ統一し、touch した差分だけ mirror sync | root は `.claude` を正本、`.agents` は mirror と明記する |
| `complete-phase.js` が array-based `artifacts.json` で unsafe | workflow ごとの差分を見ずに汎用完了 script を使う | Task03 は manual sync に切り替え、guard を task-spec 側へ残した | artifacts schema が揺れる workflow では script を盲信しない |
| capture script が worktree の Vite 実体に依存する | `node_modules/vite/bin/vite.js` 固定など install 形態前提で起動する | Vite binary を探索し `/opt/homebrew/bin/node` で起動する方式へ変更 | screenshot harness は worktree install 形態の差を吸収する |
| Phase 12 補助成果物を台帳だけ先に更新して実体が欠ける | `artifacts.json` と changelog を先に閉じてファイル存在確認を後回しにする | 実ファイル作成、`verify-all-specs`、`verification-report.md` 更新を同一ターンで実施 | 補助成果物は「実体作成 -> 台帳登録 -> 再検証」の順で固定する |
| light theme の visual hierarchy が LOW 所見のまま残る | 主導線成立確認と UI polish を同じ accept 判定で閉じようとする | `UT-SKILL-LIFECYCLE-03-LIGHT-VISUAL-HIERARCHY-001` を起票し、acceptance と改善 backlog を分離した | LOW 所見でも再利用価値があるなら独立未タスクへ切り出す |

---

## 仕様書別 SubAgent 実行ログ

| SubAgent | 担当仕様書 | 実装内容の反映先 | 苦戦箇所の反映先 | 検証証跡 |
| --- | --- | --- | --- | --- |
| SubAgent-A | `references/ui-ux-navigation.md` | `Skill Creator session handoff（TASK-SKILL-LIFECYCLE-03）` | `Task03 の所見` | Phase 11 screenshot 5件 |
| SubAgent-B | `references/ui-ux-feature-components.md` | `Skill Creator Session Integration（TASK-SKILL-LIFECYCLE-03 / current workflow）` | `実装時の苦戦箇所（TASK-SKILL-LIFECYCLE-03）` | targeted tests 30件、Apple review |
| SubAgent-B | `references/arch-ui-components.md` | `Skill Creator Session Integration アーキテクチャパターン（TASK-SKILL-LIFECYCLE-03 / current workflow）` | `苦戦箇所` | layer / error boundary の整合確認 |
| SubAgent-C | `references/arch-state-management.md` | `Skill Creator Session Integration（TASK-SKILL-LIFECYCLE-03）` | `実装時の苦戦箇所サマリ` | execute guard、local/global state |
| SubAgent-D | `references/api-ipc-agent.md` | `Task03 表導線との接続（TASK-SKILL-LIFECYCLE-03）` | `本ファイル: 苦戦箇所と再発防止` | `skillCreator:detect-mode` / `skillCreator:validate` / `skill:*` 接続確認 |
| SubAgent-D | `references/interfaces-agent-sdk-skill.md` | `Task03 handoff 契約（TASK-SKILL-LIFECYCLE-03）` | `本ファイル: 苦戦箇所と再発防止` | create path -> skillName handoff 契約確認 |
| SubAgent-E | `references/ui-ux-agent-execution.md` | `Skill Creator session からの継続実行（TASK-SKILL-LIFECYCLE-03）` | `本ファイル: 苦戦箇所と再発防止` | `activeSkillName + trimmedPrompt` guard |
| SubAgent-E | `references/security-skill-execution.md` | `Task03 session card の扱い（TASK-SKILL-LIFECYCLE-03）` | `本ファイル: 苦戦箇所と再発防止` | permission boundary / allowed tools 不変確認 |
| SubAgent-F | `references/task-workflow.md` | `TASK-SKILL-LIFECYCLE-03 Skill Creator 表導線化と作成・実行・改善統合` | 同節 `苦戦箇所` | verification report、Phase 12 guard |
| SubAgent-G | `references/lessons-learned.md` | Task03 関連教訓節 | Task03 関連教訓節 | 5分解決カード、再発条件付き教訓 |

---

## 同種課題の5分解決カード

1. まず `workflow-skill-creator-execute-improve-integration.md` で全体像と苦戦箇所を確認する。
2. UI は `SkillLifecycleSessionCard` を一次導線、`SkillCreateWizard` を secondary route に固定する。
3. create 後の継続は `path -> basename -> selectSkillByName()` の handoff を先に作る。
4. error は card local と panel global を分け、`execute` は `activeSkillName + trimmedPrompt` の二重条件で guard する。
5. 仕上げは targeted tests、typecheck、Phase 11 screenshot 5件、Phase 12 補助成果物の実体確認を同一ターンで行う。

---

## 関連改善タスク

| タスクID | 概要 | 優先度 | 参照 |
| --- | --- | --- | --- |
| UT-SKILL-LIFECYCLE-03-LIGHT-VISUAL-HIERARCHY-001 | `SkillLifecycleSessionCard` の light theme helper text / placeholder / summary hierarchy 改善 | 低 | `docs/30-workflows/unassigned-task/task-ut-skill-lifecycle-03-light-visual-hierarchy-001.md` |

---

## 最適なファイル形成（責務マトリクス）

| 関心ごと | 最適な反映先 | 理由 |
| --- | --- | --- |
| 入口 / handoff / route 位置づけ | `ui-ux-navigation.md` | Skill Center から Skill Creator への導線正本 |
| session surface の挙動 | `ui-ux-feature-components.md` | card / wizard / analysis の機能正本 |
| component layer 境界 | `arch-ui-components.md` | panel / card / detail view の責務正本 |
| local state / global error / guard | `arch-state-management.md` | state ownership と UI 可用条件の正本 |
| IPC 接続面 | `api-ipc-agent.md` | `skillCreator:*` と `skill:*` の橋渡し正本 |
| handoff 型契約 | `interfaces-agent-sdk-skill.md` | create path / skillName 継続の型境界正本 |
| 実行 UI 入口 | `ui-ux-agent-execution.md` | Skill Creator から Agent 実行へ継続する入口正本 |
| permission / allowed tools | `security-skill-execution.md` | UI surface 追加が security boundary を変えないことの正本 |
| 完了証跡と検証値 | `task-workflow.md` | 台帳としての正本 |
| 苦戦箇所と短手順 | `lessons-learned.md` | 再発防止の正本 |
| 最短再利用の起点 | `workflow-skill-creator-execute-improve-integration.md` | 分散情報の集約ハブ |

---

## 検証コマンド（最小セット）

| コマンド | 目的 | 合格条件 |
| --- | --- | --- |
| `/opt/homebrew/bin/node node_modules/vitest/vitest.mjs run src/renderer/components/skill/__tests__/SkillManagementPanel.lifecycle-session.test.tsx src/renderer/components/skill/__tests__/SkillManagementPanel.lifecycle-failure.test.tsx src/renderer/components/skill/__tests__/SkillManagementPanel.test.tsx src/renderer/components/skill/__tests__/SkillManagementPanel.integration.test.tsx` | Task03 UI 回帰 | PASS（30 tests） |
| `pnpm --filter @repo/desktop exec tsc --noEmit` | 型整合 | PASS |
| `/opt/homebrew/bin/node apps/desktop/scripts/capture-task-skill-creator-lifecycle-phase11.mjs` | 代表状態 screenshot 再取得 | 5件取得完了 |
| `node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/completed-tasks/step-02-par-task-03-skill-creator-execute-improve-integration` | TC と screenshot の整合 | PASS |
| `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/step-02-par-task-03-skill-creator-execute-improve-integration --json` | Phase 1-13 実体監査 | PASS |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | 今回差分の未タスク監査 | `currentViolations=0` |

---

## 関連ドキュメント

| ドキュメント | 説明 |
| --- | --- |
| [ui-ux-navigation.md](./ui-ux-navigation.md) | Skill Center 入口と session handoff |
| [ui-ux-feature-components.md](./ui-ux-feature-components.md) | session card / wizard / analysis の機能仕様 |
| [arch-ui-components.md](./arch-ui-components.md) | component boundary と layer 構成 |
| [arch-state-management.md](./arch-state-management.md) | local state、execute guard、error boundary |
| [api-ipc-agent.md](./api-ipc-agent.md) | `skillCreator:*` と `skill:*` の IPC 接続面 |
| [interfaces-agent-sdk-skill.md](./interfaces-agent-sdk-skill.md) | create path -> skillName handoff 契約 |
| [ui-ux-agent-execution.md](./ui-ux-agent-execution.md) | Skill Creator から Agent 実行への継続入口 |
| [security-skill-execution.md](./security-skill-execution.md) | permission boundary と allowed tools |
| [task-workflow.md](./task-workflow.md) | 完了台帳、検証証跡、苦戦箇所 |
| [lessons-learned.md](./lessons-learned.md) | 再発条件付き教訓と 5 分解決カード |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-12 | 1.0.1 | TASK-SKILL-LIFECYCLE-03 の関連改善タスク `UT-SKILL-LIFECYCLE-03-LIGHT-VISUAL-HIERARCHY-001` を追加し、visual hierarchy の LOW 所見を acceptance 判定から分離して再利用導線へ接続 |
| 2026-03-12 | 1.0.0 | TASK-SKILL-LIFECYCLE-03 の実装内容、苦戦箇所、SubAgent 分担、最短再利用手順を集約する workflow spec を新規作成 |
