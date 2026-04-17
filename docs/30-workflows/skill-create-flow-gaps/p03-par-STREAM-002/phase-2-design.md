# Phase 2: 設計

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 対象機能   | TASK-SW-STREAM-002          |
| 前提Phase  | Phase 1: 要件定義           |
| 次Phase    | Phase 3: 設計レビューゲート |
| ステータス | 未実施                      |
| 作成日     | 2026-04-16                  |

## 目的

`SKILL_CREATOR_CREATE` ハンドラー内の `createSkill()` 呼び出し箇所に
`onProgress` コールバックを接続する詳細設計を行う。
あわせて `SkillCreateWizard.tsx` の `streaming` prop 接続状況を確認し、
追加スコープが必要かを判断する。

## 実行タスク

### Task 1: ハンドラー変更設計

**変更対象**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

**変更前**:

```typescript
const skillDir = await skillCreatorService.createSkill(validatedArgs);
```

**変更後**:

```typescript
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

**変更箇所**: `:276`（`SKILL_CREATOR_CREATE` ハンドラー内）

### Task 2: sendSkillCreatorProgress の動作設計確認

`sendSkillCreatorProgress` の実装（:692）を確認し、コールバックから正しく呼び出せることを確認する。

```typescript
// 期待する実装（既存）
export function sendSkillCreatorProgress(
  mainWindow: BrowserWindow,
  progress: { phase: string; percentage: number; message: string },
): void {
  mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
}
```

`mainWindow` は `SKILL_CREATOR_CREATE` ハンドラーのクロージャ内で利用可能であることを確認する。

### Task 3: フロント側接続確認設計

`SkillCreateWizard.tsx` で `streaming` prop が `GenerateStep` に渡されているかを確認し、
接続状況に応じて追加スコープを決定する。

**確認項目**:

| 確認項目                                               | 確認方法                                           |
| ------------------------------------------------------ | -------------------------------------------------- |
| `streaming.stage` が `GenerateStep` に渡されているか   | `SkillCreateWizard.tsx` の props 定義と JSX を確認 |
| `streaming.percent` が `GenerateStep` に渡されているか | 同上                                               |
| `streaming.message` が `GenerateStep` に渡されているか | 同上                                               |

**接続状況に応じた方針**:

- 接続済み: フロント側の変更なし（AC-3・AC-4 は自動的に満たされる）
- 未接続: `SkillCreateWizard.tsx` に `streaming` prop の `GenerateStep` への受け渡しを追加（本タスクのスコープに追加）

### Task 4: IPC 4層整合性チェック

| 層         | 変更有無 | 確認内容                                                       |
| ---------- | -------- | -------------------------------------------------------------- |
| メイン     | あり     | `skillCreatorHandlers.ts:276` の `createSkill()` 呼び出し変更  |
| Preload    | なし     | `SkillCreatorProgress` 型は既存の Preload 型定義と一致している |
| レンダラー | 条件付き | `SkillCreateWizard.tsx` の `streaming` prop 接続状況による     |
| チャンネル | なし     | `IPC_CHANNELS.SKILL_CREATOR_PROGRESS` は既存のまま             |

### Task 5: `mainWindow` 可用性の設計確認

`SKILL_CREATOR_CREATE` ハンドラー内で `mainWindow` が利用可能かを確認する。

- `sendSkillCreatorProgress(mainWindow, progress)` の `mainWindow` 引数が
  ハンドラーのスコープ内で参照可能かを確認する
- `mainWindow` が `null` の可能性がある場合の防御設計を検討する

## 参照資料

- `outputs/phase-1/TASK-SW-STREAM-002-requirements.md` — 受入条件（AC-1〜AC-5）
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` — 実装対象
- `apps/desktop/src/renderer/components/skill-creator/SkillCreateWizard.tsx` — フロント確認対象
- `apps/desktop/src/renderer/components/skill-creator/steps/GenerateStep.tsx` — フロント確認対象

## 統合テスト連携

- 変更は `skillCreatorHandlers.ts` の1箇所のみ（最小変更原則）
- IPC チャンネル定義・Preload 型への破壊的変更なし
- `createSkill()` の第1引数・戻り値型は変更しない

## 成果物

| 成果物                       | パス                                           |
| ---------------------------- | ---------------------------------------------- |
| TASK-SW-STREAM-002-design.md | `outputs/phase-2/TASK-SW-STREAM-002-design.md` |

## 完了条件

- [ ] 変更前/後のコードが設計書に明記されている
- [ ] `sendSkillCreatorProgress` の動作確認が完了している
- [ ] フロント側 `streaming` prop の接続状況が確認され、追加スコープの有無が決定されている
- [ ] IPC 4層整合性チェックが完了している
- [ ] `mainWindow` の可用性確認が完了している

## タスク100%実行確認【必須】

- [ ] Task 1（ハンドラー変更設計）を100%実行した
- [ ] Task 2（sendSkillCreatorProgress の動作設計確認）を100%実行した
- [ ] Task 3（フロント側接続確認設計）を100%実行した
- [ ] Task 4（IPC 4層整合性チェック）を100%実行した
- [ ] Task 5（mainWindow 可用性の設計確認）を100%実行した
- [ ] 成果物（TASK-SW-STREAM-002-design.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
