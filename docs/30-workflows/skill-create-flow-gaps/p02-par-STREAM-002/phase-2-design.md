# Phase 2: 設計

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| タスクID   | TASK-SW-STREAM-002                     |
| 機能名     | skill-creator-handlers-progress-wiring |
| 前提Phase  | Phase 1                                |
| 後続Phase  | Phase 3                                |
| 作成日     | 2026-04-15                             |
| ステータス | pending                                |

## 目的

`skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラーで `createSkill()` 呼び出しに
`onProgress` コールバックを接続し、`sendSkillCreatorProgress(mainWindow, progress)` に配線する
詳細設計を確定する。
また `SkillCreateWizard.tsx` における `GenerateStep` への props 接続設計も行う。

## 実行タスク

- ハンドラーへのコールバック接続設計（変更箇所・変更内容の確定）
- `sendSkillCreatorProgress` との配線設計
- `SkillCreateWizard.tsx` の props 接続設計（必要な場合）
- 4層整合性チェック（IPC チャンネル定数・ホワイトリスト・ハンドラー・Preload API）
- 既存テストへの影響範囲の設計
- 検証マトリクスの定義

## 参照資料

| 資料名                  | パス                                                                                    | 用途                      |
| ----------------------- | --------------------------------------------------------------------------------------- | ------------------------- |
| Phase 1 成果物          | `outputs/phase-1/requirements-definition.md`                                            | 要件・AC 参照             |
| phase-2-solution.md     | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` | 解決策設計（アプローチB） |
| phase-3-review.md       | `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-3-review.md`   | 3.5節・4層整合確認        |
| skillCreatorHandlers.ts | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                     | 変更対象                  |
| SkillCreatorService.ts  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                           | STREAM-001 成果物確認     |
| SkillCreateWizard.tsx   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                      | props 接続確認            |

## 実行手順

### 1. ハンドラーへのコールバック接続設計

`apps/desktop/src/main/ipc/skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラー内、
`skillCreatorService.createSkill(validatedArgs)` の呼び出し箇所を以下のように変更する:

```typescript
// 変更前（:276 付近）
const skillDir = await skillCreatorService.createSkill(validatedArgs);

// 変更後
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

**設計ポイント**:

- `sendSkillCreatorProgress(mainWindow, progress)` は同ファイルの `:692` に定義済み
- `mainWindow` はハンドラーのクロージャスコープで参照可能
- コールバックはインライン関数として定義（可読性と局所性の確保）

### 2. `sendSkillCreatorProgress` との配線設計

```typescript
// sendSkillCreatorProgress の呼び出しシグネチャ（既存コード参照）
export function sendSkillCreatorProgress(
  mainWindow: BrowserWindow,
  progress: { phase: string; percentage: number; message: string },
): void {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress);
  }
}
```

**配線の流れ**:

```
SkillCreatorService.createSkill()
  └─ onProgress コールバック呼び出し
       └─ sendSkillCreatorProgress(mainWindow, progress)
            └─ mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress)
                 └─ Preload: safeOn(SKILL_CREATOR_PROGRESS, callback)
                      └─ useStreamingProgress: updateProgress() → Zustand store
                           └─ GenerateStep: プログレスバー更新
```

### 3. `SkillCreateWizard.tsx` の props 接続設計

Phase 1 の確認結果を踏まえ、`useStreamingProgress()` の戻り値が `GenerateStep` に渡されているか
確認する。未接続の場合は以下の接続を追加する:

```typescript
// SkillCreateWizard.tsx での想定接続パターン
const streaming = useStreamingProgress();

// GenerateStep へのレンダリング
<GenerateStep
  stage={streaming.stage}
  percent={streaming.percent}
  message={streaming.message}
/>
```

**判定基準**:

- 接続済みの場合: `SkillCreateWizard.tsx` の変更不要
- 未接続の場合: Phase 5 の実装スコープに `SkillCreateWizard.tsx` を追加

### 4. IPC 4層整合性チェック

本タスクでは既存の IPC チャンネル `SKILL_CREATOR_PROGRESS` を使用するため、
チャンネル定義自体の変更は不要。4層が整合していることを確認する:

| 層                | ファイル                                            | 確認内容                                              | 状態   |
| ----------------- | --------------------------------------------------- | ----------------------------------------------------- | ------ |
| 1. 定数定義       | `packages/shared/src/ipc/channels.ts`               | `SKILL_CREATOR_PROGRESS` が定義済みか                 | 確認要 |
| 2. ホワイトリスト | `apps/desktop/src/preload/channels.ts`              | `SKILL_CREATOR_PROGRESS` が `safeOn` 対象に含まれるか | 確認要 |
| 3. ハンドラー     | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` | `sendSkillCreatorProgress` が `send()` を呼ぶ設計     | 確認要 |
| 4. Preload API    | `apps/desktop/src/preload/skill-creator-api.ts`     | `onProgress` が `safeOn` で登録済みか                 | 確認要 |

**判定**: `SKILL_CREATOR_PROGRESS` チャンネルはすでに4層で定義済みのため、
本タスクでの追加定義は不要（コールバック接続のみで機能する）。

### 5. 既存テストへの影響範囲の設計

| テストファイル                                                                | 影響内容                                            | 対応方針                                                    |
| ----------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts` | `createSkill` 呼び出しのモックに第2引数が追加される | モックの `createSkill` がコールバック引数を受け取るよう更新 |
| `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`     | 同上                                                | 同上                                                        |

### 6. 検証マトリクス

| テスト対象           | テストコマンド                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| ハンドラー統合テスト | `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/`                                      |
| 型チェック           | `pnpm --filter @repo/desktop typecheck`                                                                    |
| lint                 | `pnpm --filter @repo/desktop lint`                                                                         |
| 新規テスト           | `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreatorHandlers.progress.test.ts` |

## 統合テスト連携【必須】

コールバック配線の4層整合（定数・ホワイトリスト・ハンドラー・Preload）を設計に反映済み。

| 判定項目              | 基準     | 結果    |
| --------------------- | -------- | ------- |
| 4層整合性確認         | 確認済み | pending |
| シグネチャ互換性      | 後方互換 | pending |
| `mainWindow` 参照確認 | PASS     | pending |

## 多角的チェック観点

| 観点               | チェック内容                                                                   |
| ------------------ | ------------------------------------------------------------------------------ |
| 4層整合性          | `SKILL_CREATOR_PROGRESS` チャンネルが4層全てで整合しているか                   |
| mainWindow 参照    | コールバック内で `mainWindow` が正しく参照できるか（クロージャスコープ確認）   |
| コールバック型整合 | `sendSkillCreatorProgress` の第2引数型と `onProgress` の引数型が一致しているか |
| GenerateStep接続   | `useStreamingProgress` の戻り値が `GenerateStep` に渡される設計になっているか  |

## 成果物

| 成果物 | パス                        | 説明                                                                       |
| ------ | --------------------------- | -------------------------------------------------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | コールバック接続設計・4層整合確認・GenerateStep props 設計・検証マトリクス |

## 完了条件

- [ ] ハンドラーへのコールバック接続設計が確定済み（変更箇所・変更内容）
- [ ] `sendSkillCreatorProgress` との配線フローが設計済み
- [ ] `SkillCreateWizard.tsx` の props 接続方針が決定済み（接続済みか未接続かの判定）
- [ ] 4層整合性チェックが完了済み
- [ ] 既存テストへの影響範囲が設計済み
- [ ] 検証マトリクスが定義済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. ハンドラーへのコールバック接続設計
2. `sendSkillCreatorProgress` との配線設計
3. `SkillCreateWizard.tsx` の props 接続設計
4. IPC 4層整合性チェック
5. 既存テストへの影響範囲確認
6. 検証マトリクス定義
7. 成果物の出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 3: 設計レビューゲート
