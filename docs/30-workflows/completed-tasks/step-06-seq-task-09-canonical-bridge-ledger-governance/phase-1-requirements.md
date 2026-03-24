# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                            |
| ---------- | ----------------------------------------------- |
| Phase      | 1                                               |
| Phase 名   | 要件定義                                        |
| タスクID   | TASK-IMP-CANONICAL-BRIDGE-LEDGER-GOVERNANCE-001 |
| 前提 Phase | なし                                            |
| 後続 Phase | Phase 2（設計）                                 |
| ステータス | completed                                       |
| 作成日     | 2026-03-19                                      |
| 機能名     | canonical-bridge-ledger-governance              |

## 目的

canonical bridge / workflow ledger governance の現状、対象範囲、受入基準、除外範囲を明文化する。

## 実行タスク

- 現状棚卸し: canonical bridge / workflow ledger governance に関係する codepath / doc / open gap を洗い出す
- 要件抽出: functional / non-functional / governance 要件を整理する
- 受入基準化: AC を検証可能な条件へ落とし込む
- スコープ固定: 対象・除外・依存 task を明文化する

## 参照資料

| 参照資料     | パス                                                                                              | 内容                                   |
| ------------ | ------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Task index   | docs/30-workflows/completed-tasks/step-06-seq-task-09-canonical-bridge-ledger-governance/index.md | 対象 task のメタ情報と受入基準         |
| 共通参照資料 | [index.md#共通参照資料](./index.md#共通参照資料)                                                  | 親パック・workflow・audit 等の共通参照 |

## 実行手順

### ステップ1: 参照資料を確認する

common canonical と task 固有 canonical を読み、canonical bridge / workflow ledger governance の調査スコープを固定する。

### ステップ2: P50 チェック（既実装状態の調査）

実装前に対象ファイルの現在状態を確認する。

```bash
git log --oneline -10 -- docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation/index.md
rg -n "authMode|runtime|handoff|terminal|guidance|health|capability" docs/30-workflows/completed-tasks/step-01-seq-task-01-execution-responsibility-contract-foundation docs/30-workflows/ai-runtime-execution-responsibility-realignment .claude/skills/aiworkflow-requirements/references || true
```

### ステップ3: 要件・AC・除外範囲を確定する

FR/NFR、AC、依存 task、除外スコープを outputs/phase-1 用に整理する。

### ステップ4: Phase 2 への論点を残す

未確定事項を concern として 3 つ以下に正規化し、Phase 2 の設計トピックへ渡す。

## 統合テスト連携（Phase 1〜11は必須）

統合ポイント（UI state / IPC / settings / terminal handoff）を要件へ明記し、後続 task と重複しないよう境界を固定する。

## 多角的チェック観点（AIが判断）

| 観点                   | 適用判断                                | 仕様参照先                                                            |
| ---------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| UI/UX                  | 画面/CTA/状態語彙が関係する場合         | `aiworkflow-requirements: ui-ux-*`                                    |
| アーキテクチャ         | 責務境界・state・service 設計を触る場合 | `aiworkflow-requirements: arch-*`                                     |
| IPC/Preload            | Main-Renderer 契約を扱う場合            | `aiworkflow-requirements: api-ipc-*`, `security-electron-ipc-core.md` |
| ワークフローガバナンス | ledger / backlog / lessons を触る場合   | `aiworkflow-requirements: task-workflow*`, `lessons-learned*`         |

**この task 固有の重点**: bridge drift、status ambiguity、ledger inconsistency を review する

## サブタスク管理

Phase 実行開始時に、TodoWrite 相当で以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の反映（Phase 1〜11）
4. 成果物パスと outputs/phase-N の整合確認
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## 成果物

| 成果物           | パス                                       | 内容                             |
| ---------------- | ------------------------------------------ | -------------------------------- |
| 要件定義書       | outputs/phase-1/requirements-definition.md | 機能要件・非機能要件・受入基準   |
| スコープ定義     | outputs/phase-1/scope-definition.md        | 対象/除外/依存境界               |
| 調査インベントリ | outputs/phase-1/current-state-inventory.md | 現状コードとドキュメントの棚卸し |

## 完了条件

- [x] 現状コード/ドキュメントの棚卸しが完了している
- [x] AC が検証可能な文章で定義されている
- [x] 対象・除外・依存タスクが明記されている
- [x] Phase 4 は Phase 1-3 完了まで開始しない条件が明記されている
- [x] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 各成果物パスが `outputs/phase-1/` と一致している
- [x] `artifacts.json` と `outputs/artifacts.json` の更新方針が確認されている
- [x] Phase 4 へ進む前提として Phase 1-3 の gate 条件が明記されている

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md)
