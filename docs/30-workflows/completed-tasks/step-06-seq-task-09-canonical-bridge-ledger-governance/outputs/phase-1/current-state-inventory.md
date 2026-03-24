# Phase 1 成果物: 現状棚卸しインベントリ

> タスクID: TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001
> 作成日: 2026-03-23
> Phase: 1 - 要件定義

## 1. Canonical Source Table 現状

### 1.1 台帳の三層構造

| Layer             | ファイル                                                   | 責務                                             |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| Entrypoint        | `task-workflow.md`                                         | active guide、child companion リスト             |
| Execution Ledger  | `task-workflow-active.md`                                  | 現在進行中・実行対象タスク                       |
| Completion Ledger | `task-workflow-completed.md` + 11 domain-specific children | 完了済みタスク、baseline 確定記録                |
| Backlog Registry  | `task-workflow-backlog.md`                                 | 未実施タスク、follow-up formalization の staging |

### 1.2 参照構造（Progressive Disclosure）

| 層      | パターン                                      | 例                                        |
| ------- | --------------------------------------------- | ----------------------------------------- |
| 親仕様  | entrypoint のみ（child companion 選択ガイド） | `task-workflow.md`                        |
| core    | 本質仕様                                      | `task-workflow-completed.md`              |
| details | 実装詳細                                      | `task-workflow-completed-*.md` (11 files) |
| history | 変更履歴                                      | `task-workflow-history.md`                |

## 2. State 遷移モデルの現状

### 2.1 三状態モデル

```
spec_created → implementation_ready → completed
```

| State                  | 定義                            | 遷移条件                                  |
| ---------------------- | ------------------------------- | ----------------------------------------- |
| `spec_created`         | Phase 1-3 完了、設計確定済み    | Phase 3 PASS または MINOR 指摘消化済み    |
| `implementation_ready` | Phase 4-11 完了、手動テスト終了 | Phase 11 TC 全 PASS + screenshot 収集完了 |
| `completed`            | Phase 12-13 完了、PR マージ済み | PR マージ + branch 削除確認               |

### 2.2 検出された曖昧さ

- 設計タスク（type: design）では Phase 4-7 の成果物がドキュメントのみだが、`implementation_ready` の遷移条件が実装タスクと同じ定義になっている
- Phase 10 MINOR 判定後の状態遷移が明文化されていない（MINOR 未タスク化 → Phase 11 進行は可能か？）
- `spec_created` と `implementation_ready` の境界が Phase 番号依存であり、設計タスクと実装タスクで同じ Phase 番号を使うことに起因する不整合がある

## 3. 同期手順の現状

### 3.1 同期タイミング

| Event                   | 同期対象                                                         | 担当               |
| ----------------------- | ---------------------------------------------------------------- | ------------------ |
| Phase 12 完了時         | task-workflow.md + task-workflow-backlog.md + lessons-learned.md | メインエージェント |
| 未タスク発見時          | task-workflow-backlog.md → task-specification 生成               | Phase agent        |
| Follow-up formalization | task-workflow-backlog.md status 更新 → TASK-XXX 化               | 後続フェーズ       |
| Mirror sync             | .claude/ → .agents/（rsync + diff -qr）                          | 配置担当者         |

### 3.2 同期漏れの既知問題

| Pitfall | 概要                                         | 対策状況                              |
| ------- | -------------------------------------------- | ------------------------------------- |
| P1      | LOGS.md 2ファイル更新漏れ                    | Phase 12 チェックリストで対策済み     |
| P2      | topic-map.md 再生成忘れ                      | 再生成トリガー拡大で対策済み          |
| P3      | 未タスク管理の3ステップ不完全                | 3ステップ必須化で対策済み             |
| P4      | documentation-changelog への早期「完了」記載 | 事後記録に変更で対策済み              |
| P25     | LOGS.md 2ファイル更新漏れ（再発）            | P1 と同じ対策を強化                   |
| P26     | システム仕様書更新遅延                       | Phase 12 完了時点で更新必須に変更     |
| P27     | topic-map.md 再生成トリガー判断ミス          | 削除・更新も再生成トリガーに含める    |
| P43     | サブエージェント rate limit 中断             | 3ファイル以下/エージェントに制限      |
| P51     | サブエージェントの changelog 早期完了記載    | メインエージェントが統合確認          |
| P56     | GitHub Issue Close 漏れ                      | 再評価クローズ時の同時 Close 必須化   |
| P57     | 設計タスクでの仕様書更新先送り               | 設計タスクでも Phase 12 で実更新      |
| P58     | 設計タスクでの未タスク指示書省略             | 設計タスクでも3ステップ必須           |
| P59     | 並列エージェントの件数不整合                 | changelog は最後に1エージェントが統合 |

## 4. Bridge Drift 現状

### 4.1 三種の drift パターン

| 種別                     | 症状                                     | 典型 Pitfall |
| ------------------------ | ---------------------------------------- | ------------ |
| Specification Drift      | PR 前の仕様書更新先送り                  | P26, P57     |
| Index Regeneration Drift | topic-map.md / keywords.json の stale 化 | P2, P27      |
| Mirror Sync Drift        | .claude/ と .agents/ の不整合            | MEMORY.md §3 |

### 4.2 Mirror Sync 差分（2026-03-17 時点）

差分ファイル数: 6-10 個

- indexes/keywords.json
- indexes/topic-map.md
- references/architecture-implementation-patterns-reference-ipc-fallback-validation.md
- references/interfaces-agent-sdk-executor-details.md
- references/lessons-learned-safety-gate-permission-fallback.md
- references/task-workflow-backlog.md
- task-specification-creator/references/phase-templates.md

## 5. Follow-up Formalization 現状

### 5.1 三ステップ管理（P3, P38, P58）

```
Step 1: 指示書作成 → docs/30-workflows/unassigned-task/ に独立ファイル
Step 2: 残課題テーブル登録 → task-workflow-backlog.md に追記
Step 3: 関連仕様書リンク追加 → 発見元仕様書に参照追加
```

### 5.2 Current / Baseline の切り分け

| 区分      | ファイル群                              | 更新タイミング              |
| --------- | --------------------------------------- | --------------------------- |
| Current   | lessons-learned-current.md + 最新 child | Phase 12 リアルタイム       |
| Baseline  | lessons-learned-archive-2026-03.md      | wave 完了後 archive へ移管  |
| Canonical | workflow-ai-runtime-\*.md               | classification-first で判定 |

## 6. Foundation Contract（Step-01 依存）

### 6.1 三 Concern 分解

| Concern | 名称            | 責務                                                      |
| ------- | --------------- | --------------------------------------------------------- |
| A       | capability 契約 | integratedRuntime / terminalSurface / both / none の4状態 |
| B       | state 語彙統一  | ready / blocked / unavailable の判定ロジック              |
| C       | CTA 契約        | primary / secondary CTA の表示条件と action wiring        |

### 6.2 後続タスクへの依存

- AC-4 で Step 02-09 が参照すべき canonical doc set を明示
- 本 Task（Step-06-09）は foundation 契約を前提とし、その上に governance layer を定義する
