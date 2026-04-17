# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 作成日     | 2026-04-16                             |
| ステータス | 完了                                   |

## 前提条件確認: TASK-SW-STREAM-001 完了確認

`SkillCreatorService.createSkill()` に `onProgress?: SkillCreatorProgressCallback` 第2引数が追加済みであることを確認した。

```
確認コマンド: grep -n "onProgress" apps/desktop/src/main/services/skill/SkillCreatorService.ts
結果:
  94:   * @param onProgress - 進捗通知コールバック
  97:  async createSkill(
  99:    onProgress?: SkillCreatorProgressCallback,
 126:      onProgress?.(progress);
 681:      // createSkill() 後続処理を継続させる
```

**判定: TASK-SW-STREAM-001 完了済み。onProgress? 引数が存在することを確認。**

## 変更対象の現状

### `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` 行276付近

```typescript
// 現在（コールバック未接続）
const skillDir = await skillCreatorService.createSkill(validatedArgs);
```

`sendSkillCreatorProgress()` は行692に定義済みだが呼び出し元がない。

## 受入条件

| AC   | 内容                                                                         | 優先度 |
| ---- | ---------------------------------------------------------------------------- | ------ |
| AC-1 | `createSkill()` 呼び出しに `onProgress` コールバックが接続されている         | 必須   |
| AC-2 | コールバック内で `sendSkillCreatorProgress(mainWindow, progress)` が呼ばれる | 必須   |
| AC-3 | `mainWindow` がクロージャスコープで正しく参照されている                      | 必須   |
| AC-4 | 既存テストへの回帰なし                                                       | 必須   |
| AC-5 | typecheck/lint 0エラー                                                       | 必須   |

## スコープ

### 変更必須ファイル

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` - 行276のコールバック接続

### 変更不要ファイル

- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` - `useStreamingProgress()` と `GenerateStep` への接続が既に実装済み

確認結果:

```
grep -n "useStreamingProgress\|streaming\|GenerateStep" SkillCreateWizard.tsx
  49: import { useStreamingProgress } from "../../hooks/useStreamingProgress";
 310: const streaming = useStreamingProgress();
 556: // ── GenerateStep 用 props 計算 ───────────────
 559: streaming.stage,
 563: const resolvedPercent = streaming.percent;
 564: const resolvedMessage = streaming.message || generationProgress || "";
 565: const resolvedPreview = streaming.previewContent;
 612: <GenerateStep ...
```

**SkillCreateWizard.tsx は既に接続済みのため変更不要。**

## 完了条件確認

- [x] STREAM-001 完了確認（onProgress? シグネチャが存在する）
- [x] 変更対象ファイルの確認
- [x] SkillCreateWizard.tsx の接続状態確認（接続済み）
- [x] 受入条件の明確化（AC-1〜AC-5）
