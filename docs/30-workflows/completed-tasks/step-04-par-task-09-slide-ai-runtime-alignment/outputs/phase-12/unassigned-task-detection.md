# Phase 12: 未タスク検出レポート

## メタ情報

| 項目           | 内容                                    |
| -------------- | --------------------------------------- |
| タスクID       | TASK-IMP-SLIDE-AI-RUNTIME-ALIGNMENT-001 |
| Phase          | 12 - 未タスク検出                       |
| 作成日         | 2026-03-19                              |
| 分類           | 設計タスク（spec_created）              |
| formalize 件数 | 4 件                                    |

---

## 結論

再監査で見つかった code drift は、task 09 の責務である「仕様策定」と切り分け、4 件の unassigned task spec として formalize した。候補止まりにはせず、backlog 反映と task file 作成まで完了している。

## 検出件数サマリー

| 分類                                     | 件数  | 状態                     |
| ---------------------------------------- | ----- | ------------------------ |
| SF-03 パターン1（型定義→実装）           | 1     | formalize 済み           |
| SF-03 パターン2（契約→テスト）           | 1     | UT-SLIDE-IMPL-001 に統合 |
| SF-03 パターン3（UI仕様→コンポーネント） | 1     | formalize 済み           |
| SF-03 パターン4（仕様書間差異→設計決定） | 1     | formalize 済み           |
| Phase 11 Note の再評価統合               | 2     | 既存 4 task に内包       |
| **合計**                                 | **4** | **全件作成済み**         |

## formalize 済み task 一覧

| ID                       | タイトル                                                              | 分類             | 優先度 | 作成ファイル                                                                                                                        | backlog  |
| ------------------------ | --------------------------------------------------------------------- | ---------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- | -------- |
| UT-SLIDE-IMPL-001        | Slide AI Runtime Alignment 実装タスク（Main Process + Zustand + IPC） | 実装             | HIGH   | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-impl-001.md`        | 追加済み |
| UT-SLIDE-UI-001          | Slide UI 4 領域コンポーネント実装タスク                               | 実装             | HIGH   | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-ui-001.md`          | 追加済み |
| UT-SLIDE-P31-001         | useSlideProject P31 パターン個別セレクタ移行                          | リファクタリング | MEDIUM | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-p31-001.md`         | 追加済み |
| UT-SLIDE-HANDOFF-DUP-001 | HandoffGuidance ローカル定義重複の解消                                | リファクタリング | LOW    | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-slide-handoff-dup-001.md` | 追加済み |

## 観点別の根拠

### 1. 型定義 / Main Process / IPC 実装

以下は design-summary / contract-matrix で定義済みだが、現行コードへ未反映のため UT-SLIDE-IMPL-001 へ集約した。

| 代表例                                                                     | 現状                                          |
| -------------------------------------------------------------------------- | --------------------------------------------- |
| `registerSlideIpcHandlers()`                                               | `apps/desktop/src/main/ipc/index.ts` で未登録 |
| `validateIpcSender` / P42 3段バリデーション                                | slide handler に未導入                        |
| `slide:reverse-sync` 契約                                                  | `manualSync()` の forward-sync 実装が残存     |
| `SLIDE_IPC_CHANNELS` / `SyncStatus idle` / `SkillExecutionResult.guidance` | shared / main / renderer 各層で未統一         |

### 2. UI コンポーネント

Phase 11 screenshot で、仕様化済み UI のうち以下が未実装または未接続と判明したため UT-SLIDE-UI-001 を独立作成した。

| UI 要素                      | 現状   |
| ---------------------------- | ------ |
| Runtime/Auth banner          | 未表示 |
| `SlideGuidanceBlock`         | 未表示 |
| `SlideWatchStatus`           | 未表示 |
| persistent terminal launcher | 未配置 |

### 3. P31 / selector drift

`useSlideProject.ts` が store 全体取得に依存しており、P31 の「個別 selector で再描画範囲を絞る」原則から外れている。これは機能仕様ではなく保守性・再購読安定性の concern なので、UT-SLIDE-P31-001 として分離した。

### 4. shared 型の重複

`HandoffBlock.tsx` 側のローカル `HandoffGuidance` 定義は small drift だが、cross-layer type の重複を温存すると後続実装時に再びズレるため、UT-SLIDE-HANDOFF-DUP-001 として切り出した。

## 再評価して独立 task 化しなかった項目

| 内容                                   | 扱い                                            |
| -------------------------------------- | ----------------------------------------------- |
| push 6 channel のテスト整備            | UT-SLIDE-IMPL-001 に内包                        |
| `SlideErrorCode` と execute 契約の整合 | 実装時の設計入力として UT-SLIDE-IMPL-001 に内包 |

## 検証結果

| 項目                        | コマンド                                                                                                                                                                                                                    | 結果                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| link 到達性                 | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/outputs/phase-12/unassigned-task-detection.md` | PASS                 |
| current workflow 観点の監査 | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`                                                                                                                  | current violations 0 |

---

## 各未タスクの詳細

### UT-SLIDE-IMPL-001: Slide AI Runtime Alignment 実装タスク

**タイトル**: Slide AI Runtime Alignment 実装タスク（Main Process + Zustand + IPC）

**分類**: 実装

**優先度**: HIGH

**根拠Phase**: Phase 1〜4（全設計成果物が実装の入力）

**スコープ**:

- `agent-client.ts` 廃止（Direct SDK import・electron-store 直読み・env fallback 排除）
- `modifier-skill.ts` 廃止（skill-executor.ts へ統合）
- `skill-executor.ts` 拡張（RuntimeResolver + IAuthKeyService 統合）
- `ipc-handlers.ts` 修正（validateIpcSender + P42 3段バリデーション + パストラバーサル検出）
- IPC チャネル名 4系統 rename（design-summary.md T-2-6 の rename テーブル準拠）
- `packages/shared/src/slide/types.ts` 修正（SyncStatus: out-of-sync → idle）
- `packages/shared/src/agent/types.ts` 修正（SkillExecutionResult に isHandoff/guidance 追加）
- `apps/desktop/src/renderer/slide/store.ts` 拡張（SlideSliceState + 個別セレクタ 15個）
- `channels.ts` 新規作成（SLIDE_IPC_CHANNELS 定数）
- Phase 4 テストコードの実装

**依存成果物**:

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-2/design-summary.md`
- `outputs/phase-2/contract-matrix.md`
- `outputs/phase-2/lane-1-design.md`
- `outputs/phase-4/test-matrix.md`

### UT-SLIDE-UI-001: Slide UI 4 領域コンポーネント実装タスク

**タイトル**: Slide UI 4 領域コンポーネント実装タスク

**分類**: 実装（UI/UX）

**優先度**: HIGH

**根拠Phase**: Phase 2 T-2-7、Phase 3 観点5（UI/UX 整合性）

**スコープ**:

- `SlideSyncCard` コンポーネント（常時表示、状態依存 CTA）
- `SlideProgressRow` コンポーネント（running 時のみ、キャンセル CTA）
- `SlideWatchStatus` コンポーネント（プロジェクト選択時）
- `SlideGuidanceBlock` コンポーネント（degraded/guidance 時、ターミナル起動 CTA）
- `SlideWorkspace.tsx` への組み込み
- Persistent Terminal Launcher（右下固定）

**依存成果物**:

- `outputs/phase-2/ui-ux-realization.md`
- `outputs/phase-2/design-summary.md` T-2-7
- UT-SLIDE-IMPL-001（Zustand slideSlice が先に実装済みであること）

### UT-SLIDE-P31-001: useSlideProject P31 パターン個別セレクタ移行

**タイトル**: useSlideProject P31 パターン個別セレクタ移行

**分類**: リファクタリング

**優先度**: MEDIUM

**根拠Phase**: Phase 3 TECH-M-01（MINOR 指摘）、Phase 11 発見事項 #8

**スコープ**:

- `apps/desktop/src/renderer/slide/useSlideProject.ts` の `useSlideProjectStore()` 全体取得を個別セレクタに移行
- P5 リスナー再登録防止（useEffect 依存配列の安全化）
- 関連テストの修正

**前提条件**: UT-SLIDE-IMPL-001 完了後（個別セレクタが実装済みであること）

### UT-SLIDE-HANDOFF-DUP-001: HandoffGuidance ローカル定義重複の解消

**タイトル**: HandoffGuidance ローカル定義重複の解消

**分類**: リファクタリング

**優先度**: LOW

**根拠Phase**: Phase 11 発見事項 #3（Note）

**スコープ**:

- `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx:3` のローカル `HandoffGuidance` 定義を削除
- `packages/shared/src/types/handoff.ts:10` の共通定義を import するよう修正
- 関連テストの修正（型変更の影響がある場合）

**前提条件**: UT-SLIDE-IMPL-001 完了後（shared 側の HandoffGuidance が確定済みであること）

## Phase 5 実装フェーズへの申し送り

以下の事項は独立した未タスクではなく、UT-SLIDE-IMPL-001 の Phase 5 実装時に担当エージェントが判断・解決すること。

1. **TECH-M-02（SyncStatus 型変更）**: `out-of-sync` → `idle` 変更時の既存テスト（行76, 102, 243）同時修正
2. **SlideErrorCode 体系の整合**: `SLIDE_E001-E999` 独自エラーコードと execute 契約の `{ code, message }` ラッパー接続方針を確定
3. **P63 対策（テストインポートパス）**: テスト作成時は既存テストのインポートパスを `grep -n "^import"` で確認してから記述
