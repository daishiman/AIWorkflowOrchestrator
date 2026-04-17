# Phase 1: 要件定義

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 1                  |
| Phase名    | 要件定義           |
| 対象機能   | TASK-SW-STREAM-002 |
| 前提Phase  | -（起点）          |
| 次Phase    | Phase 2: 設計      |
| ステータス | 未実施             |
| 作成日     | 2026-04-16         |

## 目的

`SKILL_CREATOR_CREATE` ハンドラーが `createSkill()` を `onProgress` コールバックなしで呼び出しており、
`sendSkillCreatorProgress()` が export されているが呼び出し元が存在しないという問題を特定し、
修正に必要な要件と受入条件を明確化する。

## 問題

`apps/desktop/src/main/ipc/skillCreatorHandlers.ts:276`（現状）:

```typescript
// 変更前
const skillDir = await skillCreatorService.createSkill(validatedArgs);
// ↑ onProgress コールバックを渡していない
```

`sendSkillCreatorProgress()` は `:692` に export されているが、
`SKILL_CREATOR_CREATE` ハンドラーから一度も呼び出されていない状態。

`TASK-SW-STREAM-001` で `createSkill()` に `onProgress` 引数が追加されたため、
本タスクでその引数に実際の IPC 送信処理を接続する。

## 実行タスク

### Step 0: P50チェック（必須）

実装状態を確認し、既実装コードの重複修正を防止する。

1. `apps/desktop/src/main/ipc/skillCreatorHandlers.ts:276` の現状呼び出しを確認
2. `apps/desktop/src/main/ipc/skillCreatorHandlers.ts:692` の `sendSkillCreatorProgress` 実装を確認
3. TASK-SW-STREAM-001 が完了済みであること（`createSkill()` に `onProgress` 引数あり）を確認
4. `apps/desktop/src/renderer/components/skill-creator/SkillCreateWizard.tsx` で `streaming` prop が `GenerateStep` に渡されているか確認
5. 既存テストファイルの関連テストケースを確認

### Task 1: 問題特定と影響範囲調査

1. `skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラー（:172-284）の処理フローを確認
2. `sendSkillCreatorProgress` の実装（`mainWindow.webContents.send(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, progress)` 呼び出し）を確認
3. `createSkill()` の `onProgress` 引数（TASK-SW-STREAM-001 成果）との接続方法を確認
4. `SkillCreateWizard.tsx` で `streaming.stage` / `streaming.percent` / `streaming.message` が `GenerateStep` に渡されているか確認
5. 既存テストへの影響を評価

### Task 2: 受入条件の策定

1. コールバック接続の変更箇所（`skillCreatorHandlers.ts:276`）を明確化
2. `sendSkillCreatorProgress(mainWindow, progress)` の呼び出し仕様を整理
3. フロント側 `GenerateStep` のプログレスバー更新確認方法を整理
4. `useStreamingProgress` の `stage` 遷移確認方法を整理
5. 受入条件を5件策定

## 受入条件

| ID   | 条件                                                                                                 |
| ---- | ---------------------------------------------------------------------------------------------------- |
| AC-1 | `SKILL_CREATOR_CREATE` ハンドラーが `createSkill()` を `onProgress` コールバック付きで呼び出している |
| AC-2 | コールバック内で `sendSkillCreatorProgress(mainWindow, progress)` が呼ばれる                         |
| AC-3 | スキル生成中にフロント側 `GenerateStep` のプログレスバーが更新される                                 |
| AC-4 | `useStreamingProgress` の `stage` が `idle` 以外に遷移する                                           |
| AC-5 | 既存の `SKILL_CREATOR_CREATE` ハンドラーの正常系テストが全てパスし続ける                             |

## 参照資料

- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` — 実装対象（:276 呼び出し箇所・:692 sendSkillCreatorProgress）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — TASK-SW-STREAM-001 成果（onProgress 引数）
- `apps/desktop/src/renderer/components/skill-creator/steps/GenerateStep.tsx` — フロント側確認対象
- `apps/desktop/src/renderer/components/skill-creator/SkillCreateWizard.tsx` — streaming prop 確認対象
- `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` — フロント側（変更不要）
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-1-analysis.md` — 問題の現状分析
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` — 解決アプローチ
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-3-review.md` — 追加確認事項

## 統合テスト連携

- 本タスクは `skillCreatorHandlers.ts` の1行変更が主な修正範囲
- `createSkill()` の第1引数（`CreateSkillOptions`）・戻り値（`Promise<string>`）は変更しない
- IPC チャンネル定義（`channels.ts`）・Preload 型定義への変更はない
- `SkillCreateWizard.tsx` の `streaming` prop 接続状況によってはフロント側の修正が追加スコープになる

## 成果物

| 成果物                             | パス                                                 |
| ---------------------------------- | ---------------------------------------------------- |
| TASK-SW-STREAM-002-requirements.md | `outputs/phase-1/TASK-SW-STREAM-002-requirements.md` |

## 完了条件

- [ ] 問題の根本原因（`SKILL_CREATOR_CREATE` ハンドラーが `onProgress` を渡していない）が特定されている
- [ ] 受入条件（AC-1〜AC-5）が全件策定されている
- [ ] `SkillCreateWizard.tsx` の `streaming` prop 接続状況が確認されている
- [ ] TASK-SW-STREAM-001 との依存関係が明記されている

## タスク100%実行確認【必須】

- [ ] Step 0（P50チェック）を実行し、現状コードを確認した
- [ ] Task 1（問題特定と影響範囲調査）を100%実行した
- [ ] Task 2（受入条件の策定）を100%実行した
- [ ] 成果物（TASK-SW-STREAM-002-requirements.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 2: 設計](./phase-2-design.md)
