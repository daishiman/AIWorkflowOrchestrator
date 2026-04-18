# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 前提Phase  | -                                      |
| 後続Phase  | Phase 2                                |
| 作成日     | 2026-04-15                             |
| ステータス | completed                              |

## 目的

`TASK-SW-STREAM-002` は未実装コードを新規追加するタスクではなく、
current branch に既に存在する progress wiring 実装と workflow 成果物を
close-out / current facts へ同期するための仕様固定タスクとして扱う。
本 Phase では P50 チェックで既実装状態を確定し、
以降の Phase を「追加実装」ではなく「確認・証跡整備・整合性監査」に切り替える。

## 実行タスク

- P50 チェック: `skillCreatorHandlers.ts` / `SkillCreateWizard.tsx` / `useStreamingProgress.ts` / `GenerateStep.tsx` / `SkillCreatorService.ts` を読んで current facts を確定する
- `createSkill(validatedArgs, onProgress)` 配線が既に存在することを確認し、断絶がないことを記録する
- `GenerateStep` への `stage` / `percent` / `message` 伝播経路を確認し、コード事実とドキュメントの境界を確定する
- `TASK-SW-STREAM-001` を前提とする close-out task として分類する
- AC-1〜AC-4 を「既存実装確認 + Phase 11/12 証跡」で検証できる形に固定する

## 参照資料

| 資料名                  | パス                                                                 | 用途                  |
| ----------------------- | -------------------------------------------------------------------- | --------------------- |
| phase-1-analysis.md     | `docs/30-workflows/00-task-spec-design-docs/phase-1-analysis.md`     | 元分析の確認          |
| phase-2-solution.md     | `docs/30-workflows/00-task-spec-design-docs/phase-2-solution.md`     | 設計方針の確認        |
| phase-3-review.md       | `docs/30-workflows/00-task-spec-design-docs/phase-3-review.md`       | 粒度・スコープ確認    |
| TASK-SW-STREAM-001 仕様 | `docs/30-workflows/completed-tasks/p01-par-STREAM-001/`              | 前提タスク確認        |
| skillCreatorHandlers.ts | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                  | current facts 確認    |
| SkillCreateWizard.tsx   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | props 接続確認        |
| useStreamingProgress.ts | `apps/desktop/src/renderer/hooks/useStreamingProgress.ts`            | IPC 受信経路確認      |
| GenerateStep.tsx        | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | progress 表示契約確認 |

## 実行手順

### 0. P50チェック: 既実装状態の調査

```bash
git log --oneline -10 -- apps/desktop/src/main/ipc/skillCreatorHandlers.ts
rg -n "createSkill|sendSkillCreatorProgress" apps/desktop/src/main/ipc/skillCreatorHandlers.ts
rg -n "useStreamingProgress|GenerateStep|streaming\\." apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
rg -n "onProgress|planning|generating-skill|generating-agents|validating|done" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

### 1. current facts の固定

| 確認対象                     | 確認内容                                                                                              | 判定     |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- | -------- |
| `skillCreatorHandlers.ts`    | `createSkill(validatedArgs, (progress) => sendSkillCreatorProgress(mainWindow, progress))` が存在する | 実装済み |
| `sendSkillCreatorProgress()` | `mainWindow.isDestroyed()` ガード付きで `IPC_CHANNELS.SKILL_CREATOR_PROGRESS` を送信する              | 実装済み |
| `SkillCreatorService.ts`     | `onProgress?` 引数と 5 段階 progress emit が存在する                                                  | 実装済み |
| `SkillCreateWizard.tsx`      | `streaming.stage/percent/message/previewContent` が `GenerateStep` へ渡される                         | 実装済み |
| `useStreamingProgress.ts`    | preload の `onProgress` 受信結果を Zustand store へ反映する                                           | 実装済み |

### 2. close-out 境界の確定

- 本 task の主責務は `未実装箇所の追加` ではなく `既実装の確認・証跡整備・workflow parity` である。
- `SKILL_CREATOR_PROGRESS` チャンネル名や payload shape の public contract 変更は含まない。
- `apps/backend/` の追加更新は不要であり、`apps/desktop/` と既存 `packages/shared/src/ipc/channels.ts` の整合確認が中心となる。

### 3. 前提タスクの確認

```bash
rg -n "onProgress|SkillCreatorProgressData" apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

`TASK-SW-STREAM-001` 完了済みを前提とし、Phase 2 以降は `STREAM-001` の public contract を消費する close-out として扱う。

### 4. 受け入れ基準の固定

| ID   | 受け入れ基準                                                                                                        | 検証方法                |
| ---- | ------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| AC-1 | `SKILL_CREATOR_CREATE` ハンドラーで `createSkill()` の第2引数に `onProgress` コールバックが接続されていること       | コード確認 + 既存テスト |
| AC-2 | `sendSkillCreatorProgress(mainWindow, progress)` が IPC 経由で進捗を送信できること                                  | コード確認 + 既存テスト |
| AC-3 | `SkillCreateWizard.tsx` で `useStreamingProgress()` の戻り値が `GenerateStep` に渡されること                        | コード確認              |
| AC-4 | Phase 11/12 の close-out 証跡が `NON_VISUAL` 方針と整合し、手動テスト結果・補助証跡・実装ガイドへ反映されていること | Phase 11/12 成果物確認  |

### 5. タスク分類

| 分類項目   | 値                                               |
| ---------- | ------------------------------------------------ |
| タスク種別 | close-out / docs-and-evidence hardening          |
| UIタスク   | NON_VISUAL                                       |
| テスト種別 | 既存ユニット/統合テスト + workflow evidence 監査 |
| 依存       | TASK-SW-STREAM-001                               |

### 6. スコープ外

- `SkillCreatorService.createSkill()` 内部の progress emit ロジック変更
- 新しい IPC チャンネルや payload field の追加
- UI デザイン変更やスクリーンショット取得必須化

## 統合テスト連携【必須】

| 判定項目                           | 基準 | 結果      |
| ---------------------------------- | ---- | --------- |
| P50 current facts 固定             | 完了 | completed |
| `SkillCreateWizard.tsx` props 確認 | 完了 | completed |
| 前提タスク完了確認                 | 完了 | completed |

## 多角的チェック観点

| 観点             | チェック内容                                                                         |
| ---------------- | ------------------------------------------------------------------------------------ |
| 前提タスク整合   | `TASK-SW-STREAM-001` の `onProgress?` 契約を正しく前提化しているか                   |
| 4層整合性        | shared channel / preload / main handler / renderer hook の整合が取れているか         |
| GenerateStep接続 | `useStreamingProgress` の戻り値が `GenerateStep` に渡る経路を current facts 化したか |
| スコープ境界     | 追加実装と close-out 記録を混同していないか                                          |

## 成果物

| 成果物       | パス                                         | 説明                       |
| ------------ | -------------------------------------------- | -------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | current facts と AC の固定 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な AC-1〜AC-4 一覧 |

## 完了条件

- [x] P50チェック実施済み（既実装状態を確認）
- [x] `sendSkillCreatorProgress` / `createSkill` / renderer 伝播経路の current facts を確認済み
- [x] `SkillCreateWizard.tsx` の `GenerateStep` への props 接続状況を確認済み
- [x] 前提タスク（TASK-SW-STREAM-001）の完了確認基準を定義済み
- [x] AC-1〜AC-4 が close-out 前提で定義されている
- [x] タスク分類を宣言済み
- [x] スコープ外との境界が明確
- [x] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. P50チェック（対象ファイルの現状確認）
2. current facts の固定
3. `SkillCreateWizard.tsx` の props 接続確認
4. 前提タスク（TASK-SW-STREAM-001）完了確認
5. 受け入れ基準（AC-1〜AC-4）の固定
6. タスク分類の宣言
7. スコープ外の明確化
8. 成果物の出力

## タスク100%実行確認【必須】

- [x] 本Phase内の全タスクを100%実行完了
- [x] 成果物テーブル記載のファイルを全件生成
- [x] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [x] 実行記録を残した

## 次Phase

Phase 2: 設計
