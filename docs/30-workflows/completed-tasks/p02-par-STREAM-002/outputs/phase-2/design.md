# Phase 2: 設計書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 作成日     | 2026-04-16                             |
| ステータス | 完了                                   |

## コールバック接続設計

### 変更箇所

**ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`
**変更行**: 276付近

```typescript
// 変更前
const skillDir = await skillCreatorService.createSkill(validatedArgs);

// 変更後
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

### 設計ポイント

- `sendSkillCreatorProgress(mainWindow, progress)` は同ファイルの行692に定義済み
- `mainWindow` はハンドラーのクロージャスコープで参照可能
- コールバックはインライン関数として定義（可読性と局所性の確保）

## 配線フロー

```
SkillCreatorService.createSkill()
  └─ onProgress コールバック呼び出し
       └─ sendSkillCreatorProgress(mainWindow, progress)
            └─ mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress)
                 └─ Preload: safeOn(SKILL_CREATOR_PROGRESS, callback)
                      └─ useStreamingProgress: updateProgress() → Zustand store
                           └─ GenerateStep: プログレスバー更新
```

## SkillCreateWizard.tsx 確認結果

接続済みのため変更不要:

| 確認項目                    | 状態 | 備考                                              |
| --------------------------- | ---- | ------------------------------------------------- |
| useStreamingProgress import | 済み | 行49: `import { useStreamingProgress } from ...`  |
| streaming 変数              | 済み | 行310: `const streaming = useStreamingProgress()` |
| GenerateStep props 接続     | 済み | 行559-565: stage/percent/message が全て接続済み   |

## IPC 4層整合性チェック

| 層                | ファイル                                            | 確認内容                                            | 状態   |
| ----------------- | --------------------------------------------------- | --------------------------------------------------- | ------ |
| 1. 定数定義       | `packages/shared/src/ipc/channels.ts`               | `SKILL_CREATOR_PROGRESS` が定義済み                 | 確認済 |
| 2. ホワイトリスト | `apps/desktop/src/preload/channels.ts`              | `SKILL_CREATOR_PROGRESS` が `safeOn` 対象に含まれる | 確認済 |
| 3. ハンドラー     | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | `sendSkillCreatorProgress` が `send()` を呼ぶ       | 確認済 |
| 4. Preload API    | `apps/desktop/src/preload/skill-creator-api.ts`     | `onProgress` が `safeOn` で登録済み                 | 確認済 |

**判定**: `SKILL_CREATOR_PROGRESS` チャンネルはすでに4層で定義済み。本タスクでの追加定義は不要（コールバック接続のみで機能する）。

## 既存テストへの影響範囲

| テストファイル                                                                | 影響内容                                                  | 対応方針                          |
| ----------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------- |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts` | `createSkill` のモックが第2引数（コールバック）を受け取る | モックは `vi.fn()` のため影響なし |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`     | 同上                                                      | 同上                              |

`createSkill: vi.fn()` はどんな引数でも受け取るため、既存テストへの影響なし。

## 検証マトリクス

| テスト対象           | テストコマンド                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| ハンドラー統合テスト | `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/`                                      |
| 型チェック           | `pnpm --filter @repo/desktop typecheck`                                                                    |
| lint                 | `pnpm --filter @repo/desktop lint`                                                                         |
| 新規テスト           | `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` |

## 完了条件確認

- [x] コールバック接続設計確定
- [x] sendSkillCreatorProgress 配線フロー設計済み
- [x] SkillCreateWizard.tsx props 接続方針決定（接続済みのため変更不要）
- [x] 4層整合性チェック完了
- [x] 既存テストへの影響範囲設計済み
- [x] 検証マトリクス定義済み
