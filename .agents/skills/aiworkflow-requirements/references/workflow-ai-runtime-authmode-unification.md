# AI Runtime/AuthMode Unification ワークフロー仕様

> 本ドキュメントは AIWorkflowOrchestrator の仕様書です。  
> 管理: `.claude/skills/aiworkflow-requirements/references/`

---

## 概要

`TASK-IMP-AI-RUNTIME-AUTHMODE-UNIFICATION-001`（step-01 foundation）で確定した、  
`Integrated API Runtime` と `Claude Code Terminal Surface` の責務分離を全AI surfaceへ伝搬するための正本。

本仕様は「設計タスクの成果物同期」に特化し、実装タスク（Task02-Task10）へ安全に handoff するための必須更新点を定義する。

**トリガー**: `ai-runtime-authmode`, `auth mode unification`, `settings authmode`, `access capability`, `terminal surface`, `Task06 settings review`

---

## 今回の確定事項（2026-03-13）

| 観点 | 確定内容 |
| --- | --- |
| capability 基盤 | `integratedRuntime` / `terminalSurface` / `both` / `none` を foundation 契約に固定 |
| UI語彙 | Settings 表示語彙を `ready` / `blocked` / `unavailable` に統一 |
| terminal 境界 | auto send / hidden prompt injection / silent fallback を禁止 |
| Phase 11 証跡 | 設定画面3領域レビュー（TC-11-00）を含む 4ケースの screenshot を保存 |
| 後続タスク反映 | Task02,03,10,04,06,07,05,08,09 の `index.md` に Step-01 参照を追加 |

## Step-03 Task06 再監査追補（2026-03-17）

- `step-03-par-task-06-main-chat-settings-runtime-sync` を再監査し、Phase 11 スクリーンショットを実画像へ更新（`phase11-capture-metadata.json`）。
- `AI_CHECK_CONNECTION` は「廃止完了」ではなく **legacy 互換残置** と判定し、primary health 経路を `llm:check-health` に固定。
- `llm:check-health` 契約を実装準拠（`status: connected/disconnected/error`, `latency`, `checkedAt: Date`）へ同期。
- Task06 未タスク `UT-TASK06-001..004` を `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` へ formalize し、backlog へ登録。
- Phase 11 で `selector/prompt` と `terminal launcher` が PARTIAL 判定となったため、Task06 の follow-up 管理へ移管。

## Step-04 Task09 再監査追補（2026-03-19）

- `step-04-par-task-09-slide-ai-runtime-alignment` を再監査し、Phase 11 screenshot 5件を current workflow 配下へ取得した。
- live preview は esbuild native binary mismatch により停止したため、`phase11-capture-metadata.json` に fallback 理由を固定した。
- task 09 の primary target は **workflow self を含む10ファイル** (`workflow-ai-runtime-authmode-unification.md` / `api-ipc-system-core.md` / `interfaces-agent-sdk-skill-advanced.md` / `arch-electron-services-details-part2.md` / `ui-ux-feature-components-details.md` / `arch-state-management-advanced.md` / `security-electron-ipc-core.md` / `task-workflow-completed.md` / `task-workflow-backlog.md` / `lessons-learned-ipc-preload-runtime.md`) とした。
- current code drift として `registerSlideIpcHandlers()` 未接続、legacy channel 名残存、`agent-client.ts` の direct SDK path、`modifier-skill.ts` 残存、SlideWorkspace UI 4領域未反映を記録した。
- follow-up 未タスク `UT-SLIDE-IMPL-001` / `UT-SLIDE-UI-001` / `UT-SLIDE-P31-001` / `UT-SLIDE-HANDOFF-DUP-001` を formalize した。
- 2026-03-21 current branch では `UT-SLIDE-UI-001` を完了、`UT-SLIDE-P31-001` を吸収済みへ更新した。
- 2026-03-22 `TASK-IMP-SLIDE-RUNTIME-ALIGNMENT-001`（#1363）で `UT-SLIDE-IMPL-001` を実装完了。D1-D6 drift 全件解消、`registerSlideIpcHandlers()` Main IPC index 接続済み、`UT-SLIDE-HANDOFF-DUP-001` を解消済みへ更新した。

### task 09 再監査結果サマリー（2026-03-19）

| 項目 | 結果 |
| --- | --- |
| `verify-all-specs` | PASS（13/13, warnings 0） |
| `validate-phase-output` | PASS |
| `validate-phase11-screenshot-coverage` | PASS |
| `validate-phase12-implementation-guide` | PASS |
| `verify-unassigned-links --source outputs/phase-12/unassigned-task-detection.md` | PASS |
| `audit-unassigned-tasks --diff-from HEAD` | PASS（currentViolations=0） |
| 画面判定 | `1 PASS / 4 PARTIAL` |
| repo-wide `verify-unassigned-links` | task 09 外の既存 missing link 6 件で FAIL（baseline 管理） |

### task 09 で今回反映した内容

| 観点 | 反映内容 |
| --- | --- |
| system spec | IPC / runtime / UI / state / security / backlog / lessons の 10 正本へ task 09 実態を同期 |
| 画面検証 | current workflow 配下へ screenshot 5件、`manual-test-result.md`、`phase11-capture-metadata.json` を固定 |
| 未タスク | 実装・UI・P31・handoff 重複の 4 件を `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/` へ formalize |
| skill 更新 | `task-specification-creator` / `skill-creator` に Phase 12 再監査の実更新ルールを反映 |

### task 09 の苦戦箇所と簡潔解決

| 苦戦箇所 | 再発条件 | 簡潔解決 |
| --- | --- | --- |
| live preview が `esbuild` mismatch で起動しない | worktree の native binary が current arch と不整合 | harness + static review board に切り替え、metadata と `manual-test-result.md` に failure reason を固定する |
| repo-wide link 監査と task-scope 監査が混ざる | global `verify-unassigned-links.js` をそのまま完了判定へ使う | `--source outputs/phase-12/unassigned-task-detection.md` を task 正本にし、global 失敗は baseline として分離する |
| `spec_created` が計画記述で止まりやすい | docs-heavy task で `.claude` 正本更新を後回しにする | system spec / lessons / backlog / skill / mirror parity を同ターンで閉じる |

---

## 再監査追補（2026-03-14）

- `TC-11-00-settings-authmode-review-board.png` を再取得し、設定画面3領域の判読性を再確認した。
- validator 適用マトリクスを再確認し、`verify-all-specs` / `validate-phase-output` は Task01-Task10 全10タスクで PASS、`validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` は Step-01 のみ PASS（残り9タスクは Phase 11/12 `not_started` のため未適用）と判定した。
- `phase-12-documentation.md` のステータスを `completed` へ同期し、完了チェックを `[x]` へ更新した。
- `task-imp-ai-runtime-permission-resolver-placement-001.md` / `task-imp-ai-runtime-test-separation-criteria-001.md` / `task-imp-spec-only-phase-workflow-optimization-001.md` を 9セクション形式へ是正した。
- 未タスク監査は `verify-unassigned-links=223/223`、`currentViolations=0` / `baselineViolations=133` を確認し、baseline は既存正規化タスクで継続管理とした。
- Step-02 Task10 は `TC-11-01..06` の screenshot を current workflow 配下で再取得し、`validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` を PASS へ回復した。
- Step-02 Task02 も `TC-11-01..03` の screenshot を同日取得し、`validate-phase11-screenshot-coverage` と `validate-phase12-implementation-guide` を PASS 化した。
- Step-02 Task02 実装差分（`RuntimeResolver` / `AnthropicLLMAdapter` / `TerminalHandoffBuilder` / `chatEditAPI` contextBridge 公開 / `workspacePath` 境界検証）を system spec 正本へ同期した。
- Step-02 Task10 の再参照未タスク `task-fix-worktree-native-binary-guard-001.md` は 9見出し形式へ是正し、`audit-unassigned-tasks --target-file` で `currentViolations=0` を確認した。

---

## current canonical set（2026-03-14 wave）

| 区分 | canonical docs |
| --- | --- |
| workflow 正本 | `references/workflow-ai-runtime-authmode-unification.md` |
| parent docs（契約境界） | `references/ui-ux-settings.md`, `references/interfaces-auth.md`, `references/api-ipc-system.md` |
| 台帳・教訓 | `references/task-workflow.md`, `references/lessons-learned.md` |
| index 導線 | `indexes/resource-map.md`, `indexes/quick-reference.md`, `indexes/topic-map.md`, `indexes/keywords.json` |
| 旧名互換台帳 | `references/legacy-ordinal-family-register.md` |
| 運用ログ | `LOGS.md` |
| follow-up 未タスク | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md` |
| Task09 設計成果物 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/` |
| mirror root | canonical=`.claude/skills/aiworkflow-requirements/` / mirror=`.agents/skills/aiworkflow-requirements/` |

---

## artifact inventory（Step-01 + system spec sync）

| 種別 | ファイル | 用途 |
| --- | --- | --- |
| Phase 11 結果 | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | 調査レポートで TC-ID 相当の証跡連携を確認 |
| Phase 11 plan | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | 調査レポートで capture 対象の現状を確認 |
| 設定画面レビュー調査 | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | 設定画面3領域の判読性確認（TC-11-00 相当） |
| Phase 12 同期計画 | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | 仕様書別 SubAgent 分担（調査レポート参照） |
| Phase 12 フィードバック | `docs/30-workflows/TASK-FIX-SKILL-DOCS-SPEC-FOUNDATION/task-05-phase-1-3-source-investigation-report.md` | 再利用パターンの抽出（調査レポート参照） |
| 画面再取得スクリプト | `apps/desktop/scripts/capture-ai-runtime-authmode-review-board.mjs` | `TC-11-00` 再取得の実行実体 |
| follow-up 未タスク | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md` | 契約テスト/回帰テスト責務分離の継続改善 |
| runtime routing closure 成果物 | `docs/30-workflows/completed-tasks/runtime-routing-integration-closure/outputs/` | Phase 1-12 の全成果物（Task03 runtime routing 統合） |
| RuntimeResolver 共通サービス | `apps/desktop/src/main/services/runtime/RuntimeResolver.ts` | Skill/Agent/ChatEdit 共通の runtime 判定 |

### task 09 artifact inventory（2026-03-19）

| 種別 | ファイル | 用途 |
| --- | --- | --- |
| Phase 11 plan | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-11/screenshot-plan.json` | TC-11-01..05 と fallback route 定義 |
| Phase 11 metadata | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-11/screenshots/phase11-capture-metadata.json` | fallback 理由と capture 時刻の正本 |
| Phase 11 screenshot | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-11/screenshots/` | SlideWorkspace current UI の実画像証跡 |
| Phase 11 result | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-11/manual-test-result.md` | capture method / Apple review / PASS-PARTIAL 判定の正本 |
| workflow 成果物 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/` | Phase 1-12 の spec_created 成果物一式 |
| Phase 12 summary | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-12/system-spec-update-summary.md` | Step 1-A〜1-G / Step 2 の実績 |
| Phase 12 changelog | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-12/documentation-changelog.md` | 再監査の時系列記録 |
| Phase 12 compliance | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-12/phase12-task-spec-compliance-check.md` | validator / parity / artifacts sync の root evidence |
| Phase 12 unassigned | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-12/unassigned-task-detection.md` | 4件 formalize の正本 |
| follow-up 未タスク | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-impl-001.md` ほか 4 件 | 実装収束と UI / P31 / handoff 重複の formalized backlog |

---

## parent docs と依存関係

| parent doc | この workflow で参照する理由 |
| --- | --- |
| `ui-ux-settings.md` | 設定画面3領域（認証方式カード / APIキー入力 / APIキー一覧）の表示契約を固定するため |
| `interfaces-auth.md` | capability 基盤（`integratedRuntime` / `terminalSurface` / `both` / `none`）の型契約を維持するため |
| `api-ipc-system.md` | runtime 解決経路と設定反映 IPC 契約を後続タスクへ伝搬するため |
| `task-workflow.md` | 完了台帳、検証証跡、関連未タスクを追跡するため |
| `lessons-learned.md` | 苦戦箇所と簡潔解決手順を再利用可能にするため |
| `legacy-ordinal-family-register.md` | 旧 filename から semantic filename への逆引きを維持するため |

---

## 旧 filename 互換管理

旧 filename が残るケースは `legacy-ordinal-family-register.md` で一元管理する。  
本タスク群で確認済みの代表例は `outputs/phase-9/qa-checklist.md`（旧）→ `outputs/phase-9/quality-assurance-checklist.md`（現行）で、互換管理行を同台帳に登録済み。

---

## 設定画面レビューの必須改善対象

添付レビューで指摘された設定画面の3領域を、Task06 を中心に後続タスクへ継承する。

1. 認証方式カード（`Claude Agent SDK 認証方式`）
2. Claude Agent SDK APIキー入力
3. APIキー設定一覧

### 改善契約

| 領域 | 契約 |
| --- | --- |
| 認証方式カード | 上位 capability 状態と表示語彙を 1:1 で同期する |
| SDK APIキー入力 | 保存/削除結果の guidance を access card と同一語彙で表示する |
| APIキー設定一覧 | provider 行の登録状態と上位 card 状態の矛盾を許容しない |

---

## 後続タスクへの伝搬先

| タスク | 反映内容 |
| --- | --- |
| step-02-par-task-02-workspace-chat-edit-runtime-activation | foundation 契約 + settings review 参照 |
| step-02-par-task-03-skill-agent-runtime-routing | foundation 契約 + settings review 参照 **(UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 で完了: 2026-03-15)** |
| step-02-par-task-10-claude-code-terminal-surface | foundation 契約 + settings review 参照 |
| step-03-par-task-04-skill-docs-runtime-integration | foundation 契約 + settings review 参照 **(TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 で完了: 2026-03-16)** |
| step-03-par-task-06-main-chat-settings-runtime-sync | 設定画面3領域を必須改善対象として明示 |
| step-03-par-task-07-workspace-chat-panel-runtime-alignment | foundation 契約 + settings review 参照 |
| step-03-seq-task-05-chatpanel-real-chat-wiring | foundation 契約 + settings review 参照 |
| step-04-par-task-08-rag-embedding-extraction-runtime | foundation 契約 + settings review 参照 |
| step-04-par-task-09-slide-ai-runtime-alignment | foundation 契約 + settings review 参照 **(TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 で完了: 2026-03-19)** |

### task 09 の primary target（2026-03-19）

| concern | primary target |
| --- | --- |
| workflow 正本 | `references/workflow-ai-runtime-authmode-unification.md` |
| IPC canonical | `references/api-ipc-system-core.md` |
| runtime / modifier 境界 | `references/interfaces-agent-sdk-skill-advanced.md`, `references/arch-electron-services-details-part2.md` |
| UI canonical | `references/ui-ux-feature-components-details.md` |
| state canonical | `references/arch-state-management-advanced.md` |
| security canonical | `references/security-electron-ipc-core.md` |
| ledger / backlog | `references/task-workflow-completed.md`, `references/task-workflow-backlog.md` |
| lessons | `references/lessons-learned-ipc-preload-runtime.md` |

---

## SubAgent 編成（関心ごと分離）

| SubAgent | 関心ごと | 主担当 |
| --- | --- | --- |
| A | foundation 契約監査 | Step-01 outputs / artifacts 整合 |
| B | Phase 11 証跡監査 | screenshot plan / result / coverage |
| C | 後続タスク伝搬 | Task02-Task10 index 参照更新 |
| D | system spec 同期 | task-workflow / lessons / index / logs |
| Lead | 最終整合 | validator 実行と差分統合 |

---

## 同種課題の5分解決カード

1. 先に Step-01 の `artifacts.json` と実ファイル名を突合する。  
2. Phase 11 は `phase-11-manual-test.md` の TC-ID と `manual-test-result.md` の証跡列を揃える。  
3. 設定画面レビュー画像を `TC-11-00` として明示管理し、後続タスク参照へ接続する。  
4. system spec は `workflow + task-workflow + lessons + indexes + LOGS` の順で同期する。  
5. `verify-all-specs` / `validate-phase-output` は全workflowで実行し、`validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` は `phase-12-documentation=completed` の workflow に限定して実行する（`not_started` は未適用として記録）。  

---

## 最適なファイル形成

| 情報 | 最適な反映先 |
| --- | --- |
| foundation 要点と設定レビュー反映 | `workflow-ai-runtime-authmode-unification.md` |
| 完了台帳と検証証跡 | `task-workflow.md` |
| 苦戦箇所と再発防止 | `lessons-learned.md` |
| 読み込み導線 | `indexes/resource-map.md`, `indexes/quick-reference.md` |
| 運用ログ | `LOGS.md` |

---

## 関連ドキュメント

| ドキュメント | 用途 |
| --- | --- |
| [ui-ux-settings.md](./ui-ux-settings.md) | Settings 表示契約 |
| [interfaces-auth.md](./interfaces-auth.md) | auth/capability 型契約 |
| [api-ipc-system.md](./api-ipc-system.md) | IPC 経路と runtime 解決契約 |
| [task-workflow.md](./task-workflow.md) | 完了台帳 |
| [lessons-learned.md](./lessons-learned.md) | 再利用手順 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
| --- | --- | --- |
| 2026-03-22 | 1.0.11 | TASK-IMP-SLIDE-RUNTIME-ALIGNMENT-001（#1363）で UT-SLIDE-IMPL-001 実装完了。D1-D6 drift 全件解消、registerSlideIpcHandlers() Main IPC index 接続済み、UT-SLIDE-HANDOFF-DUP-001 解消済み。follow-up 3件（CI-DRIFT-SCAN / GUIDANCE-UI / IPC-TEMPLATE）を backlog 登録 |
| 2026-03-19 | 1.0.10 | Step-04 Task09 の再監査追補を拡張。validator 実値、Phase 12 root evidence、task09 固有の苦戦箇所と簡潔解決、artifact inventory 補完を反映 |
| 2026-03-19 | 1.0.9 | Step-04 Task09 の再監査追補。slide primary target 再定義、Phase 11 screenshot 5件と fallback metadata、current code drift、UT-SLIDE 4件 formalize を反映 |
| 2026-03-17 | 1.0.8 | Step-03 Task06 の再監査結果を追補。Phase 11 実画像証跡（ハーネス）への更新、`AI_CHECK_CONNECTION` legacy 方針明確化、`llm:check-health` 実装契約同期、UT-TASK06-001..004 formalize を反映 |
| 2026-03-15 | 1.0.7 | Step-02 Task03 (skill-agent-runtime-routing) を UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001 で完了同期。`RuntimeResolver` 共通化、`TerminalHandoffCard`、`handoffGuidance` store 統合を反映。`arch-electron-services-details.md` に RuntimeResolver サービス詳細セクションを追加 |
| 2026-03-14 | 1.0.6 | Phase 12 再確認を追補。`verify-unassigned-links=223/223` へ更新し、再参照未タスク `task-fix-worktree-native-binary-guard-001.md` の 9見出し是正と `target-file` 監査 PASS（current=0）を記録 |
| 2026-03-14 | 1.0.5 | Step-02 Task02/Task10 の Phase 11/12 再監査結果を追補。Task10 `TC-11-01..06`、Task02 `TC-11-01..03` を current workflow 配下へ証跡化し、`validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` PASS を明記。あわせて Task02 実装差分（RuntimeResolver/AnthropicLLMAdapter/TerminalHandoffBuilder/chatEditAPI contextBridge/workspacePath 検証）の正本同期を追加 |
| 2026-03-14 | 1.0.4 | branch 横断再確認の validator 適用範囲を明文化。`verify-all-specs` / `validate-phase-output` は 10/10 PASS、`validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` は Step-01 のみ適用対象（他9件は `not_started`）であることを追補 |
| 2026-03-14 | 1.0.3 | `phase-12-documentation` ステータス同期、未タスク3件のフォーマット是正、未タスク監査値（`227/227`, `current=0`, `baseline=134`）を追補 |
| 2026-03-14 | 1.0.2 | `current canonical set` / `artifact inventory` / parent docs / legacy filename 互換管理を追加し、follow-up 未タスク `task-imp-ai-runtime-test-separation-criteria-001.md` と同一 wave で同期 |
| 2026-03-14 | 1.0.1 | 再監査追補として `TC-11-00` 証跡を再取得し、Task01-Task10 全体 validator 再実行結果（all PASS）を反映 |
| 2026-03-13 | 1.0.0 | Task01 foundation の再監査結果、設定画面3領域レビュー反映、後続9タスク伝搬、Phase 11/12 必須成果物補完を統合した workflow 正本を新規作成 |
