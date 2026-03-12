# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| タスクID   | UT-IMP-WORKSPACE-PARENT-REFERENCE-SWEEP-GUARD-001                        |
| Phase      | 2                                                                        |
| Phase名    | 設計                                                                     |
| カテゴリ   | 改善                                                                     |
| 優先度     | 中                                                                       |
| ステータス | completed                                                                |
| 前提Phase  | Phase 1                                                                  |
| 後続Phase  | Phase 3                                                                  |
| Issue      | [#1173](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1173) |

## 目的

Phase 1 で確定した要件を、sweep manifest、drift guard、Phase 12 同期計画、SubAgent 境界へ変換する。Phase 3 のレビューが PASS になれば Phase 4 以降を並列化できる設計粒度まで固定する。

## 背景

Issue #1173 の本質は「親 pointer の単発修正」ではなく、「parent pointer と child workflow の非対称 root を前提にした横断 sweep を毎回再発させない設計」を作ることにある。そのため、path drift、status drift、mirror drift、Phase 12 sync drift を別 concern として分離して設計する。

## 実行タスク

- SubAgent-A: sweep manifest 設計を担当し、対象分類と探索順を定義する
- SubAgent-B: stale path / status drift guard の設計を担当し、grep ルールと validation contract を定義する
- SubAgent-C: dual root mirror sync の設計を担当し、canonical root と `diff -qr` 契約を定義する
- SubAgent-D: task-060 parent pointer と system spec sync の設計を担当し、Phase 12 更新順を定義する
- Lead: 4 concern の境界を統合し、Phase 4 以降の順序と並列化条件を固定する

### タスク1: sweep manifest 設計

**目的**: docs-only parent workflow の監査対象を決定論的に列挙する

**手順**:

1. `parent pointer / child workflow / completed-task pointer docs / legacy index / master index / interfaces / capture script / mirror root` を manifest 項目へ落とし込む
2. 各項目へ source path、expected path、status source、drift class を付与する
3. 実行順を `pointer -> indices -> interfaces -> scripts -> mirror` に固定する

### タスク2: drift guard 契約設計

**目的**: path drift / status drift / mirror drift の検出契約を分ける

**手順**:

1. path drift は `rg` パターン、status drift は status table / pointer metadata、mirror drift は `diff -qr` に分ける
2. 各 drift の fail 条件、warning 条件、記録先を定義する
3. Phase 4 で red case を書けるよう、検出入力と期待出力を表にする

### タスク3: Phase 12 同期設計

**目的**: task-workflow、ui-ux-feature-components、lessons-learned、task-060 follow-up の更新順を決める

**手順**:

1. `task-workflow.md` を台帳正本として先頭に置く
2. `ui-ux-feature-components.md` と `lessons-learned.md` を同一ターン更新対象として束ねる
3. `LOGS.md` / `SKILL.md` 更新条件、index 再生成条件、mirror sync 条件を整理する

## 参照資料

| 参照資料            | パス                                                                                                          | 説明                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Phase 1 仕様        | `phase-1-requirements.md`                                                                                     | 要件本文                  |
| 要件定義書          | `outputs/phase-1/requirements-definition.md`                                                                  | 機能要件・非機能要件      |
| 受入基準            | `outputs/phase-1/acceptance-criteria.md`                                                                      | 設計の成否基準            |
| 仕様参照マップ      | `outputs/phase-1/spec-reference-map.md`                                                                       | 読み込む正本の整理        |
| SubAgent責務分担    | `outputs/phase-1/subagent-responsibilities.md`                                                                | concern boundary の入力   |
| dual root precedent | `docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-dual-skill-root-mirror-sync-guard-001.md` | mirror drift guard の前例 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                             | パス                                                                                        | 内容                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | --------------------------------------- |
| task-workflow                        | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                        | 台帳更新の正本                          |
| ui-ux-feature-components             | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`             | parent/child feature spec の同期先      |
| lessons-learned                      | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 苦戦箇所と 5分解決カードの同期先        |
| interfaces-llm                       | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                       | child workflow evidence path の監査対象 |
| interfaces-chat-history              | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`              | child workflow evidence path の監査対象 |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | guard pattern の記述粒度                |
| error-handling                       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | validator fail-fast 設計の基準          |

## 統合テスト連携

- Phase 4 で `rg` / `diff -qr` / ledger sync の red case を切り分ける
- Phase 5 で manifest と guard contract に沿って実装順を固定する
- Phase 7 で acceptance criteria と検証ケースの追跡表を作る

## 成果物

| 成果物               | パス                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| sweep manifest 設計  | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-2/sweep-manifest-design.md` |
| drift guard 契約     | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-2/drift-guard-contract.md`  |
| concern boundary map | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-2/concern-boundary-map.md`  |
| リスク分析           | `docs/30-workflows/completed-tasks/workspace-parent-reference-sweep-guard/outputs/phase-2/risk-analysis.md`         |

## 完了条件

- [x] manifest に各監査対象の source path と expected path が定義されている
- [x] path drift / status drift / mirror drift の fail 条件が分離されている
- [x] Phase 12 同期順が `task-workflow -> feature spec -> lessons -> logs/index` の流れで固定されている
- [x] SubAgent-A から D の責務境界が重複なく定義されている
- [x] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 3: 設計レビューへ進む。
