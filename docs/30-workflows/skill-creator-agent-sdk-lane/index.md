# Skill Creator Agent SDK Lane

## この階層の役割

このディレクトリは、`skill-creator` を動的に読み取り、ユーザーとの対話を通じてスキルを量産する機能の仕様書パックをまとめる入口である。

トップ直下には、実行タスクと補助資料だけを置く。

## この lane の共通前提

- `skill-creator` は単一の固定ディレクトリに存在するとは仮定しない
- repo 同梱、ユーザーホーム配下、環境変数指定、workflow/manifest が指す外部ディレクトリなど、複数候補 root を扱える前提で設計する
- resource 読み込みは固定相対パスではなく、manifest resource descriptor、candidate root、source provenance を使って解決する
- file / directory 構成差分があっても silent fallback せず、解決結果と degrade 理由を追跡できるようにする

## 現在の成熟度

この階層は「草案」を含むが、`root-workflow-pack/` と child task 分解は実装前提として固定済みである。

- 背景、制約、設計仮説の正本は `requirements-draft.md`
- 依存順、gate、task topology の正本は `root-workflow-pack/`
- 実装者向けの読順と着手判断は `executor-guide.md`

## 文書ロール

| 文書                          | 主な読者               | ここで固定するもの                         | ここで固定しないもの |
| ----------------------------- | ---------------------- | ------------------------------------------ | -------------------- |
| `requirements-draft.md`       | 企画・設計レビュー担当 | 背景、制約、設計仮説の境界                 | 実装順、PR 分割      |
| `root-workflow-pack/index.md` | 仕様設計者、実装リード | 依存順、gate、task topology                | 個別 task の実装詳細 |
| `executor-guide.md`           | 実装者                 | 読順、着手判断、変更面                     | 依存順そのものの正本 |
| `step11-par-*/index.md`       | task 担当者            | step11 並列タスクの scope / quick guide    | 他 task の最終責務   |
| `fix-step1-par-*/index.md`    | task 担当者            | step1 並列修正タスクの scope / quick guide | 他 task の最終責務   |
| `fix-step2-seq-*/index.md`    | task 担当者            | step2 直列修正タスクの scope / quick guide | 他 task の最終責務   |

- [requirements-draft.md](./requirements-draft.md)
  - 実装前の認識合わせ用の草案
- [executor-guide.md](./executor-guide.md)
  - 実装者向けの読み順、task 選定、変更面の早見表
- [root-workflow-pack/index.md](./root-workflow-pack/index.md)
  - 親 workflow 全体の Phase 1-13
  - 実装タスクではなく、全体方針と gate を定義する親仕様

## 実装タスク一覧

| タスクID    | ディレクトリ                                                                  | パターン | 責務                                                                          |
| ----------- | ----------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| TASK-SDK-01 | `step-01-seq-task-01-manifest-contract-foundation`                            | seq      | manifest 契約と動的追従境界の定義                                             |
| TASK-SDK-02 | `step-02-seq-task-02-workflow-engine-runtime-orchestration`                   | seq      | workflow engine と runtime orchestration                                      |
| TASK-SDK-03 | `step-03-par-task-03-context-budget-and-resource-selection`                   | par      | selective loading / dynamic source resolution / context budget                |
| TASK-SDK-04 | `step-03-par-task-04-user-interaction-bridge-and-phase-ui`                    | par      | user interaction bridge / phase UI 契約                                       |
| TASK-SDK-05 | `../completed-tasks/step-04-par-task-05-create-entry-mainline-unification`    | par      | create 主導線の統合                                                           |
| TASK-SDK-06 | `../completed-tasks/step-04-par-task-06-verify-and-improve-lifecycle-surface` | par      | verify / improve surface と契約                                               |
| TASK-SDK-07 | `step-05-seq-task-07-execution-governance-and-handoff-alignment`              | seq      | lane contract の適用・hardening、API / handoff / approval / disclosure の整合 |
| TASK-SDK-08 | `step-06-seq-task-08-session-persistence-and-resume-contract`                 | seq      | session persistence / resume / checkpoint の互換性契約                        |

補足:

- `TASK-SDK-08` は初回から保存機構を全面再設計する task ではなく、既存 session persistence への載せ方と invalidation 境界を固める contract-first task として扱う

## IPC修正タスク一覧（Auth Login Fix + 長時間実行対応）

スキル生成時に発生する `auth:login` IPC タイムアウトエラーの修正タスク群。
30種の思考法による多角的分析（2026-04-01 実施）に基づき設計。

| タスクID                           | ディレクトリ                                                       | ステップ | パターン | 責務                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------ | -------- | -------- | ----------------------------------------------------------------------------------------------------- |
| TASK-FIX-ENV-STRIPPING             | `fix-step0-seq-env-stripping/`                                     | step0    | seq      | SkillExecutor.ts の env オプション修正（PATH 欠落による ENOENT 解消）                                 |
| TASK-TRACE-SKILL-AUTH-001          | `../completed-tasks/fix-step1-par-investigate-skill-auth-trigger/` | step1    | par      | スキル生成→auth:login 呼び出し経路の調査・修正 ✅ 完了                                                |
| TASK-FIX-IPC-TIMEOUT-001           | `fix-step1-par-ipc-timeout-per-channel/`                           | step1    | par      | IPCチャンネル別タイムアウト設定 ✅ PR#1823 完了                                                       |
| TASK-FIX-AUTH-IPC-001              | `../completed-tasks/fix-step2-seq-auth-login-ipc-nonblocking/`     | step2    | seq      | auth:login ハンドラーの fire-and-forget 化 ✅ Phase-12 完了 #1829                                     |
| TASK-FIX-EXECUTE-PLAN-FF-001       | `fix-step3-seq-execute-plan-nonblocking/`                          | step3    | seq      | skill-creator:execute-plan の fire-and-forget 化 + 長時間実行管理                                     |
| TASK-NOTIFICATION-SERVICE-001      | `fix-step4-seq-notification-service/`                              | step4    | seq      | INotificationService + macOS 完了通知 + before-quit guard                                             |
| TASK-FIX-LIFECYCLE-PANEL-ERROR-001 | `fix-step5-seq-lifecycle-panel-error/`                             | step5    | seq      | SkillLifecyclePanel の setWorkflowError(null) 無条件クリアバグ修正（failed フェーズでエラー消去防止） |

### 推奨実行順（IPC修正タスク）

### 現在の実行状況（2026-04-01 時点）

| ステップ | タスクID                           | ステータス         | 注意事項                                                                     |
| -------- | ---------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| step0    | TASK-FIX-ENV-STRIPPING             | ✅ **完了**        | `SkillExecutor.ts` の env stripping を是正し、SDK query() の前提を復旧済み   |
| step1    | TASK-TRACE-SKILL-AUTH-001          | ✅ 完了            | —                                                                            |
| step1    | TASK-FIX-IPC-TIMEOUT-001           | ✅ 完了（PR#1823） | `auth:login` タイムアウトを 500ms に設定済み                                 |
| step2    | TASK-FIX-AUTH-IPC-001              | ✅ 完了 #1829      | **⚠️ step0 は完了済み。SDK 動作の統合検証は step0 完了後の前提で進めること** |
| step3    | TASK-FIX-EXECUTE-PLAN-FF-001       | 未着手             | step0 完了後に着手                                                           |
| step4    | TASK-NOTIFICATION-SERVICE-001      | 未着手             | step3 完了後に着手                                                           |
| step5    | TASK-FIX-LIFECYCLE-PANEL-ERROR-001 | 未着手             | step3 完了後に着手                                                           |

> **⚠️ step2 実行中の関係者へ**: `auth:login` の IPC タイムアウトは `CHANNEL_TIMEOUTS["auth:login"] = 500`（PR#1823）により **500ms** です（デフォルトの 5000ms ではありません）。参照ファイルは `apps/desktop/src/preload/ipc-utils.ts`（`main/ipc/` ではなく `preload/`）です。

```text
[step0: ✅ 完了]
fix-step0-seq-env-stripping
  SkillExecutor.ts:861 の env: { ANTHROPIC_API_KEY } → { ...process.env, ANTHROPIC_API_KEY }
  PATH が消えることで node ENOENT → "Claude Code executable not found" が発生していた。
  step0 完了により全 SDK query() 呼び出しの前提を復旧済み
              ↓ 完了後（step2 は並行して code 修正可能だが統合検証は step0 完了後）
[step1: ✅ 完了]
fix-step1-par-investigate-skill-auth-trigger ─┐  ✅ 完了
fix-step1-par-ipc-timeout-per-channel        ─┘  ✅ PR#1823 完了
              ↓ 両方完了後
[step2: ✅ 完了]
../completed-tasks/fix-step2-seq-auth-login-ipc-nonblocking  ✅ 完了 #1829
  ※ auth:login タイムアウトは 500ms（preload/ipc-utils.ts の CHANNEL_TIMEOUTS）
              ↓
[step3: 未着手]
fix-step3-seq-execute-plan-nonblocking
              ↓
[step4: 未着手]
fix-step4-seq-notification-service
              ↓
[step5: 未着手]
fix-step5-seq-lifecycle-panel-error
              ↓
          統合検証（E2E）
```

**step0 が最優先の理由:**

- `SkillExecutor.ts:861` の `env: { ANTHROPIC_API_KEY: apiKey }` が PATH を含む全環境変数を上書きする
- `spawn("node", [cli.js])` が ENOENT → SDK が "Claude Code executable not found at cli.js" と誤報する
- step2/step3 のコード修正は先行できるが、**SDK が動作しない状態では統合検証が不可能**なため step0 完了が必須

**step2 が並行実行中の状態について:**

- step2（authHandlers.ts の変更）と step0（SkillExecutor.ts の変更）は変更ファイルが独立しており、コード修正の並行作業は可能
- step0 完了後はスキル生成 E2E が動作するため、**step2 の手動テスト（Phase 11）は step0 完了後に実施すること**

**step3/step4 の追加理由:**

- `fix-step2` で auth:login を fire-and-forget 化しても、`skill-creator:execute-plan` 自体が長時間同期処理のままではタイムアウトが再発する
- step3 で execute-plan を非同期化し、step4 で完了通知インフラを整備することで根本解決する

### 根本原因サマリー

| 層               | 問題                                                                                    | タスク                         |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------ |
| env 設定層       | `env: { ANTHROPIC_API_KEY }` が PATH を上書き → `spawn("node")` ENOENT（P0 ブロッカー） | TASK-FIX-ENV-STRIPPING（完了） |
| IPC ハンドラー   | auth:login が OAuth フロー全体（最大300秒）を await                                     | TASK-FIX-AUTH-IPC-001          |
| IPC タイムアウト | auth:login チャンネルに 500ms（PR#1823）、execute-plan はデフォルト 5000ms のまま       | TASK-FIX-IPC-TIMEOUT-001       |
| 呼び出し経路     | スキル生成が意図せず auth:login をトリガーする経路が不明                                | TASK-TRACE-SKILL-AUTH-001      |
| 長時間実行       | execute-plan が同期ブロックで最大数分かかる（cancel・heartbeat 未整備）                 | TASK-FIX-EXECUTE-PLAN-FF-001   |
| 完了通知         | 非同期化後の完了・エラー通知インフラが未整備                                            | TASK-NOTIFICATION-SERVICE-001  |

## 読み方

1. まず [requirements-draft.md](./requirements-draft.md) で認識合わせを確認する
2. 次に [root-workflow-pack/index.md](./root-workflow-pack/index.md) で親 workflow の gate と依存順を確認する
3. その後 [executor-guide.md](./executor-guide.md) で実装者向けの読み順と task 選定を確認する
4. 最後に各 `step-*` ディレクトリの `index.md` と `phase-1`〜`phase-13` を読む

読むときの共通確認:

- その task が固定ディレクトリ前提を持ち込んでいないか
- `skill-creator` の source root と resource provenance を downstream へ渡しているか
- 構成差分が生じたときの degrade / warning / compatibility 条件が書かれているか
