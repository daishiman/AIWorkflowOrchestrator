# Phase 1: 要件定義 - Slide Workspace UI 4領域実装

## メタ情報

| 項目     | 内容                         |
| -------- | ---------------------------- |
| Phase    | 1                            |
| 機能名   | ut-slide-ui-001              |
| タスク名 | Slide Workspace UI 4領域実装 |
| 作成日   | 2026-03-21                   |

## 目的

SlideWorkspace に実装する 4領域 UI コンポーネントの要件を正本仕様から抽出し、受入基準を定義する。

## 実行タスク

| #   | タスク名                    | 目的                                                      |
| --- | --------------------------- | --------------------------------------------------------- |
| 1   | 正本仕様からの要件抽出      | UI 4領域の仕様を正本から抽出・整理                        |
| 2   | 現行実装との GAP 分析       | 現行 SlideWorkspace と正本の差分を明確化                  |
| 3   | 依存タスク状態確認          | UT-SLIDE-IMPL-001 の前提条件を確認                        |
| 4   | 受入基準定義                | 完了判定に使用する具体的な基準を策定                      |
| 5   | store語彙とUI語彙の境界確定 | 現行 `SyncStatus` と `SlideUIStatus` の責務境界を固定する |

- 要件整理: 正本抽出、GAP分析、依存境界、受入基準、store語彙とUI語彙の分離を確定する。

## 参照資料

| 資料                                                                                                                    | 用途                                              |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-details.md`                                 | UI 4領域の正本設計                                |
| `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                              | slide IPC / SyncStatus / SlideUIStatus 契約       |
| `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference.md`                                  | handoffGuidance / stale state / selector 境界     |
| `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`                         | runtime / auth-mode / terminal handoff の背景仕様 |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-ipc-preload-runtime.md`                              | Task09 教訓                                       |
| `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-2/ui-ux-realization.md` | task-09 Phase 2 UI設計成果物                      |

## 実行手順

### Task 1: 正本仕様からの要件抽出

1. `ui-ux-feature-components-details.md` の L177-L247 を読み、4領域コンポーネントの仕様を抽出する
2. 各コンポーネントの Props 型・状態マッピング・CTA を整理する
3. task-09 Phase 2 `ui-ux-realization.md` のカラーパレット・マイクロコピーを転記する

#### 4領域コンポーネント要件

| コンポーネント     | 責務                                   | Props 概要                                                       |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------- |
| SlideSyncCard      | 同期状態バッジ + メタ情報表示          | `SlideUIStatus`(4状態) + `lastSyncedAt` + `degradedReason?`      |
| SlideProgressRow   | 進捗バー + メッセージ + キャンセル CTA | `percent` + `message` + `onCancel()`                             |
| SlideWatchStatus   | ファイル監視状態と同期方向表示         | `watching: boolean` + `syncDirection` + `watchPath?`             |
| SlideGuidanceBlock | 設定ガイダンス / エラー復旧手順        | `variant`(guidance/degraded) + `steps[]` + primary/secondary CTA |

#### 状態 → UI マッピング

| SlideUIStatus | Badge 色     | Progress | Guidance | Primary CTA |
| ------------- | ------------ | -------- | -------- | ----------- |
| `synced`      | systemGreen  | 非表示   | 非表示   | 同期を実行  |
| `running`     | systemBlue   | 表示     | 非表示   | キャンセル  |
| `degraded`    | systemOrange | 非表示   | 表示     | 再試行      |
| `guidance`    | systemBlue   | 非表示   | 表示     | API設定     |

#### カラーパレット（Apple HIG System Colors）

| 状態             | Light     | Dark      |
| ---------------- | --------- | --------- |
| synced           | `#34C759` | `#30D158` |
| running/guidance | `#007AFF` | `#0A84FF` |
| degraded         | `#FF9500` | `#FF9F0A` |
| error text       | `#FF3B30` | `#FF453A` |

### Task 2: 現行実装との GAP 分析

1. 現行 `SlideWorkspace.tsx` の構造を確認する
2. 正本との差分を以下のテーブルで整理する

| 領域         | 現行実装                           | 正本要件                              | GAP                     |
| ------------ | ---------------------------------- | ------------------------------------- | ----------------------- |
| empty state  | open CTA あり                      | open CTA                              | なし                    |
| synced state | project path + sync badge          | + runtime/auth badge + watch status   | runtime/auth badge 欠如 |
| out-of-sync  | 手動同期ボタンのみ                 | reverse-sync + guidance/degraded 導線 | 導線と用語が不一致      |
| running      | SkillPhasePanel 内 progress/cancel | + direction/watch/runtime 情報        | runtime 情報欠如        |
| degraded     | error alert のみ                   | terminal launcher + handoff reason    | handoff 導線欠如        |
| guidance     | 存在しない                         | 設定不足時の CTA + terminal launcher  | 全体欠如                |

### Task 3: 依存タスク状態確認

1. `UT-SLIDE-IMPL-001` の完了状態を確認する
2. 以下の状態ソースが実装済みか確認する:
   - slide store: `syncStatus`, `isWatching`, `currentPhase`, `error`
   - IPC payload: `direction`, `watching`
   - app/runtime store: `handoffGuidance`, `terminalCommand`
3. 未実装の場合、本タスクのスコープに含めるか判断する

**判断基準**: store フィールドが未実装の場合、本タスクでは**モック状態でUI実装**し、store接続は UT-SLIDE-IMPL-001 完了後に結合する。

### Task 4: 受入基準定義

#### 機能要件

- [ ] `SlideSyncCard` が synced / running / degraded / guidance の4状態を表示できる
- [ ] `SlideProgressRow` が running 時に進捗バー + メッセージ + キャンセルボタンを表示する
- [ ] `SlideWatchStatus` が watcher active/inactive と `syncDirection` を表示する
- [ ] `SlideGuidanceBlock` が guidance/degraded の2バリアントで CTA + 理由を表示する
- [ ] Persistent Terminal Launcher が全状態で右下固定表示される
- [ ] degraded 時に failure reason + retry CTA + terminal fallback CTA が表示される
- [ ] guidance 時に設定導線 CTA + terminal launcher CTA が表示される

#### 品質要件

- [ ] Apple HIG System Colors 準拠（コントラスト比 4.5:1 以上）
- [ ] キーボード操作で全 CTA にアクセス可能
- [ ] ARIA ラベルが各 UI 要素へ明示的に付与されている
- [ ] 個別セレクタパターン使用（P31/P48 対策）
- [ ] テストカバレッジ: Line 80%+, Branch 60%+

#### ドキュメント要件

- [ ] Phase 11 スクリーンショット（5状態: empty / synced / guidance / running / degraded）
- [ ] task-09 workflow の Phase 11/12 成果物更新
- [ ] aiworkflow-requirements の UI 正本が実装済み状態へ同期

### Task 5: store語彙とUI語彙の境界確定

1. 現行 store / IPC 語彙:
   - `SyncStatus`: `"idle" | "syncing" | "synced" | "error"` を正本とする
   - legacy drift が残る場合は `out-of-sync` / `manualSync` のような内部語彙を UI へ露出しない
2. UI 語彙:
   - `SlideUIStatus`: `"synced" | "running" | "degraded" | "guidance"`
3. **判断**: 本タスクでは store / IPC 契約を直接変更せず、UI 層で派生状態へ変換する
   - `running`: `isExecuting` または `syncStatus === "syncing"`
   - `degraded`: `error` または `syncStatus === "error"`
   - `guidance`: `handoffGuidance` が存在
   - `synced`: 上記以外

## 統合テスト連携

本 Phase では実行不要。Phase 4 以降でテスト設計に使用する。

## 多角的チェック観点

| 観点             | チェック項目                                                     |
| ---------------- | ---------------------------------------------------------------- |
| UI/UX            | Apple HIG 準拠カラー、8px グリッド、角丸 8-12px                  |
| アクセシビリティ | コントラスト比 4.5:1、ARIA ラベル、キーボードナビゲーション      |
| 状態管理         | P31/P48 対策、個別セレクタ使用、useShallow 適用                  |
| セキュリティ     | P62 三層防御（UI disabled / Controller guard / Main validation） |
| エラー処理       | degraded/guidance 状態の回復導線                                 |

## 成果物

| ファイル                                     | 説明                  |
| -------------------------------------------- | --------------------- |
| `outputs/phase-1/requirements-definition.md` | 要件定義書            |
| `outputs/phase-1/gap-analysis.md`            | 現行実装との GAP 分析 |

## 完了条件

- [ ] 4領域コンポーネントの要件が Props 型レベルで定義されている
- [ ] 現行 store / IPC 語彙から `SlideUIStatus` 4状態への導出ルールが定義されている
- [ ] 現行実装との GAP が項目化されている
- [ ] 受入基準が機能要件・品質要件・ドキュメント要件の3軸で定義されている
- [ ] 依存タスク（UT-SLIDE-IMPL-001）との境界が明確

## サブタスク管理

```
- [ ] 正本仕様からの要件抽出
- [ ] 現行実装との GAP 分析
- [ ] 依存タスク状態確認
- [ ] 受入基準定義
- [ ] SyncStatus 型語彙の確定
```

## タスク 100% 実行確認

- [ ] 全サブタスクが完了している
- [ ] 成果物が outputs/phase-1/ に配置されている
- [ ] 完了条件の全項目にチェックが入っている

## 次の Phase

Phase 2: 設計（phase-2-design.md）
