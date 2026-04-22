# Phase 5: 実装（TDD Green フェーズ）

## メタ情報

| 項目       | 内容             |
| ---------- | ---------------- |
| Phase      | 5                |
| タスクID   | UT-CANCEL-004-01 |
| ステータス | 完了             |
| 作成日     | 2026-04-22       |
| タスク種別 | NON_VISUAL       |
| 実装モード | `"new"`          |
| 前Phase    | 4: テスト作成    |
| 次Phase    | 6: テスト拡充    |

## 目的

Phase 4 の Red を最小変更で Green 化する。変更対象は `agentSlice.ts` と `SkillCreateWizard.tsx` の 2 ファイルであり、public IPC shape は変更しない。

## 実行タスク

### Step 1: `agentSlice.ts` 型定義更新

- `createSkill` に `signal?: AbortSignal` を第4引数として追加する

### Step 2: `agentSlice.ts` 実装更新

- `signal?.aborted` の early return を追加する
- `window.electronAPI.skill.create()` 呼び出しは `{ description, options, context }` を維持する

### Step 3: `SkillCreateWizard.tsx` 更新

- `const signal = startGeneration();`
- `createSkill(..., signal)` の第4引数追加

### Step 4: Green 確認

- focused test を実行する
- typecheck を実行する

## 参照資料

| 参照資料       | パス                                                               | 内容           |
| -------------- | ------------------------------------------------------------------ | -------------- |
| Phase 4 結果   | `outputs/phase-4/red-test-result.md`                               | Red テスト結果 |
| Renderer store | `apps/desktop/src/renderer/store/slices/agentSlice.ts`             | 実装対象       |
| Wizard         | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | 実装対象       |

## 実行手順

1. 型定義を更新する
2. 実装を更新する
3. Wizard を更新する
4. Green と typecheck を確認する

## 統合テスト連携

- Phase 6 で aborted / 互換 / Wizard の追加ケースを拡充する
- Main 側 cancel IPC は既存証跡をそのまま使う

## 多角的チェック観点（AIが判断）

| 観点         | チェック内容                                          |
| ------------ | ----------------------------------------------------- |
| 矛盾なし     | IPC 引数へ `signal` を追加していないか                |
| 漏れなし     | store / wizard の両方が更新対象になっているか         |
| 整合性       | current contract どおり Renderer guard になっているか |
| 依存関係整合 | Main 側停止が cancel IPC に残っているか               |

## サブタスク管理

| サブタスクID | 内容        | ステータス |
| ------------ | ----------- | ---------- |
| ST-5-01      | 型定義更新  | 未実施     |
| ST-5-02      | 実装更新    | 未実施     |
| ST-5-03      | Wizard 更新 | 未実施     |
| ST-5-04      | Green 確認  | 未実施     |

## 成果物

- `outputs/phase-5/implementation-summary.md`

## 完了条件

- [ ] `createSkill` の第4引数が追加されている
- [ ] aborted guard が追加されている
- [ ] IPC 引数 shape が維持されている
- [ ] Wizard から第4引数が渡っている
- [ ] focused test が Green になっている

## タスク 100% 実行確認【必須】

- [ ] 全タスクを実行した
- [ ] Green 化を確認した
- [ ] artifacts と成果物名が一致している

## 次Phase

[phase-6-test-expansion.md](phase-6-test-expansion.md)
