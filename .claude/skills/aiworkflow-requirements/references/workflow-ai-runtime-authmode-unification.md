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

---

## 再監査追補（2026-03-14）

- `TC-11-00-settings-authmode-review-board.png` を再取得し、設定画面3領域の判読性を再確認した。
- validator 適用マトリクスを再確認し、`verify-all-specs` / `validate-phase-output` は Task01-Task10 全10タスクで PASS、`validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` は Step-01 のみ PASS（残り9タスクは Phase 11/12 `not_started` のため未適用）と判定した。
- `phase-12-documentation.md` のステータスを `completed` へ同期し、完了チェックを `[x]` へ更新した。
- `task-imp-ai-runtime-permission-resolver-placement-001.md` / `task-imp-ai-runtime-test-separation-criteria-001.md` / `task-imp-spec-only-phase-workflow-optimization-001.md` を 9セクション形式へ是正した。
- 未タスク監査は `verify-unassigned-links=227/227`、`currentViolations=0` / `baselineViolations=134` を確認し、baseline は既存正規化タスクで継続管理とした。

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
| follow-up 未タスク | `docs/30-workflows/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md` |
| mirror root | canonical=`.claude/skills/aiworkflow-requirements/` / mirror=`.agents/skills/aiworkflow-requirements/` |

---

## artifact inventory（Step-01 + system spec sync）

| 種別 | ファイル | 用途 |
| --- | --- | --- |
| Phase 11 結果 | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-11/manual-test-result.md` | TC-ID と screenshot の 1:1 対応 |
| Phase 11 plan | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-11/screenshot-plan.json` | capture 対象の固定 |
| 設定画面レビュー証跡 | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-11/screenshots/TC-11-00-settings-authmode-review-board.png` | 認証方式カード/APIキー入力/APIキー設定一覧の判読性確認 |
| Phase 12 同期計画 | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-12/system-spec-sync-plan.md` | 仕様書別 SubAgent 分担 |
| Phase 12 フィードバック | `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-01-seq-task-01-ai-runtime-authmode-foundation/outputs/phase-12/skill-feedback-report.md` | 再利用パターンの抽出 |
| 画面再取得スクリプト | `apps/desktop/scripts/capture-ai-runtime-authmode-review-board.mjs` | `TC-11-00` 再取得の実行実体 |
| follow-up 未タスク | `docs/30-workflows/unassigned-task/task-imp-ai-runtime-test-separation-criteria-001.md` | 契約テスト/回帰テスト責務分離の継続改善 |

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
| step-02-par-task-03-skill-agent-runtime-routing | foundation 契約 + settings review 参照 |
| step-02-par-task-10-claude-code-terminal-surface | foundation 契約 + settings review 参照 |
| step-03-par-task-04-skill-docs-runtime-integration | foundation 契約 + settings review 参照 |
| step-03-par-task-06-main-chat-settings-runtime-sync | 設定画面3領域を必須改善対象として明示 |
| step-03-par-task-07-workspace-chat-panel-runtime-alignment | foundation 契約 + settings review 参照 |
| step-03-seq-task-05-chatpanel-real-chat-wiring | foundation 契約 + settings review 参照 |
| step-04-par-task-08-rag-embedding-extraction-runtime | foundation 契約 + settings review 参照 |
| step-04-par-task-09-slide-ai-runtime-alignment | foundation 契約 + settings review 参照 |

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
| 2026-03-14 | 1.0.4 | branch 横断再確認の validator 適用範囲を明文化。`verify-all-specs` / `validate-phase-output` は 10/10 PASS、`validate-phase11-screenshot-coverage` / `validate-phase12-implementation-guide` は Step-01 のみ適用対象（他9件は `not_started`）であることを追補 |
| 2026-03-14 | 1.0.3 | `phase-12-documentation` ステータス同期、未タスク3件のフォーマット是正、未タスク監査値（`227/227`, `current=0`, `baseline=134`）を追補 |
| 2026-03-14 | 1.0.2 | `current canonical set` / `artifact inventory` / parent docs / legacy filename 互換管理を追加し、follow-up 未タスク `task-imp-ai-runtime-test-separation-criteria-001.md` と同一 wave で同期 |
| 2026-03-14 | 1.0.1 | 再監査追補として `TC-11-00` 証跡を再取得し、Task01-Task10 全体 validator 再実行結果（all PASS）を反映 |
| 2026-03-13 | 1.0.0 | Task01 foundation の再監査結果、設定画面3領域レビュー反映、後続9タスク伝搬、Phase 11/12 必須成果物補完を統合した workflow 正本を新規作成 |
