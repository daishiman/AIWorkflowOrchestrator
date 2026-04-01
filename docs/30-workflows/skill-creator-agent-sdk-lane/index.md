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

## IPC修正タスク一覧（Auth Login Fix）

スキル生成時に発生する `auth:login` IPC タイムアウトエラーの修正タスク群。
30種の思考法による多角的分析（2026-04-01 実施）に基づき設計。

| タスクID                  | ディレクトリ                                                       | ステップ | パターン | 責務                                           |
| ------------------------- | ------------------------------------------------------------------ | -------- | -------- | ---------------------------------------------- |
| TASK-TRACE-SKILL-AUTH-001 | `../completed-tasks/fix-step1-par-investigate-skill-auth-trigger/` | step1    | par      | スキル生成→auth:login 呼び出し経路の調査・修正 |
| TASK-FIX-IPC-TIMEOUT-001  | `fix-step1-par-ipc-timeout-per-channel/`                           | step1    | par      | IPCチャンネル別タイムアウト設定                |
| TASK-FIX-AUTH-IPC-001     | `fix-step2-seq-auth-login-ipc-nonblocking/`                        | step2    | seq      | auth:login ハンドラーの fire-and-forget 化     |

### 推奨実行順（IPC修正タスク）

```text
[step1: 並列実行]
fix-step1-par-investigate-skill-auth-trigger ─┐
fix-step1-par-ipc-timeout-per-channel        ─┘
              ↓ 両方完了後
[step2: 直列実行]
fix-step2-seq-auth-login-ipc-nonblocking
              ↓
          統合検証（E2E）
```

**step1 を先に実施する理由:**

- `investigate` でスキル生成→auth:login の不要な呼び出し経路を特定・除去する
- 経路除去が完了した状態で `fix-step2` の設計スコープが確定する
- `ipc-timeout` は変更ファイルが独立しているため step1 と並列実行可能

### 根本原因サマリー

| 層               | 問題                                                     | タスク                    |
| ---------------- | -------------------------------------------------------- | ------------------------- |
| IPC ハンドラー   | auth:login が OAuth フロー全体（最大300秒）を await      | TASK-FIX-AUTH-IPC-001     |
| IPC タイムアウト | 全チャンネル共通 5000ms で長時間処理に不適切             | TASK-FIX-IPC-TIMEOUT-001  |
| 呼び出し経路     | スキル生成が意図せず auth:login をトリガーする経路が不明 | TASK-TRACE-SKILL-AUTH-001 |

## 読み方

1. まず [requirements-draft.md](./requirements-draft.md) で認識合わせを確認する
2. 次に [root-workflow-pack/index.md](./root-workflow-pack/index.md) で親 workflow の gate と依存順を確認する
3. その後 [executor-guide.md](./executor-guide.md) で実装者向けの読み順と task 選定を確認する
4. 最後に各 `step-*` ディレクトリの `index.md` と `phase-1`〜`phase-13` を読む

読むときの共通確認:

- その task が固定ディレクトリ前提を持ち込んでいないか
- `skill-creator` の source root と resource provenance を downstream へ渡しているか
- 構成差分が生じたときの degrade / warning / compatibility 条件が書かれているか
