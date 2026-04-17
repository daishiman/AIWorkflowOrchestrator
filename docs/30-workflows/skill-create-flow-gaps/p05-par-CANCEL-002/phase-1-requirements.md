# Phase 1: 要件定義

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 1                  |
| Phase名    | 要件定義           |
| 対象機能   | TASK-SW-CANCEL-002 |
| 前提Phase  | -（起点）          |
| 次Phase    | Phase 2: 設計      |
| ステータス | 未実施             |
| 作成日     | 2026-04-16         |

## 目的

Preload 層の `skillCreatorAPI` に `cancelGeneration` メソッドが存在しないことで
Renderer から `window.skillCreatorAPI.cancelGeneration()` を呼び出せない問題を特定し、
修正に必要な要件と受入条件を明確化する。

## 問題

TASK-SW-CANCEL-001 により Main プロセス側には `SKILL_CREATOR_CANCEL` チャンネルのハンドラーが実装されたが、
Preload 層に対応するメソッドがないため Renderer からキャンセルを呼び出せない。

```typescript
// 現状 — skill-creator-api.ts の SkillCreatorAPI インターフェースに存在しない
// cancelGeneration: () => Promise<IpcResult<void>>;  ← 未定義

// 現状 — channels.ts の ALLOWED_INVOKE_CHANNELS に含まれていない
// SKILL_CREATOR_CANCEL  ← 未追加
```

`apps/desktop/src/preload/types.ts:1865` に
`skillCreatorAPI: import("./skill-creator-api").SkillCreatorAPI;` が定義されているため、
`SkillCreatorAPI` インターフェースに追加するだけで型が `window.skillCreatorAPI` へ自動伝播する。

## 実行タスク

### Step 0: P50チェック（必須）

実装状態を確認し、既実装コードの重複修正を防止する。

1. `apps/desktop/src/preload/skill-creator-api.ts` の `SkillCreatorAPI` インターフェース（行 69-391 付近）を読み込み現状確認
2. `apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` を確認
3. `apps/desktop/src/preload/types.ts:1865` の `skillCreatorAPI` 型定義を確認
4. TASK-SW-CANCEL-001 の実装（`IPC_CHANNELS.SKILL_CREATOR_CANCEL` 定義）を確認

### Task 1: 問題特定と影響範囲調査

1. `SkillCreatorAPI` インターフェースに `cancelGeneration` メソッドが存在しないことを確認する
2. `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が含まれていないことを確認する
3. `IPC_CHANNELS.SKILL_CREATOR_CANCEL` が定義されていることを確認する（CANCEL-001 依存）
4. `types.ts` の `skillCreatorAPI` 型定義が `SkillCreatorAPI` に依存していることを確認する
5. Renderer 側で `cancelGeneration` を呼び出しているコードがあるか確認する

### Task 2: 受入条件の策定

1. 修正後のインターフェースとチャンネル追加の仕様を整理する
2. 型安全性の要件を明確化する（`window.skillCreatorAPI.cancelGeneration()` が型エラーなく呼べること）
3. 既存テストへの影響を評価する
4. 受入条件を5件策定する

## 受入条件

| ID   | 条件                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------- |
| AC-1 | `SkillCreatorAPI` インターフェースに `cancelGeneration: () => Promise<IpcResult<void>>` が追加されている |
| AC-2 | `cancelGeneration` の実装が `safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CANCEL)` を使用している               |
| AC-3 | `ALLOWED_INVOKE_CHANNELS` に `SKILL_CREATOR_CANCEL` が追加されている                                     |
| AC-4 | `window.skillCreatorAPI.cancelGeneration()` が型エラーなく呼び出せる                                     |
| AC-5 | 既存のPreload APIテストが全てパスし続ける                                                                |

## 参照資料

- `apps/desktop/src/preload/skill-creator-api.ts` — 実装対象（行 69-391 付近）
- `apps/desktop/src/preload/channels.ts` — `ALLOWED_INVOKE_CHANNELS` 追加対象
- `apps/desktop/src/preload/types.ts` — 行 1865 で `skillCreatorAPI` 型定義あり
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-1-analysis.md` — 問題の現状分析
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` — 解決策設計

## 統合テスト連携

- 本タスクは Preload 層の変更であり、IPC チャンネル `SKILL_CREATOR_CANCEL` を追加することで
  Renderer → Preload → Main の呼び出しチェーンが完成する
- Main プロセス側のハンドラーは TASK-SW-CANCEL-001 で実装済みであることが前提条件
- `safeInvoke` のセキュリティチェックを通過させるため `ALLOWED_INVOKE_CHANNELS` 追加が必須

## 成果物

| 成果物                             | パス                                                 |
| ---------------------------------- | ---------------------------------------------------- |
| TASK-SW-CANCEL-002-requirements.md | `outputs/phase-1/TASK-SW-CANCEL-002-requirements.md` |

## 完了条件

- [ ] 問題の根本原因（`SkillCreatorAPI` に `cancelGeneration` が未定義）が特定されている
- [ ] `ALLOWED_INVOKE_CHANNELS` 未追加によるセキュリティチェック失敗リスクが確認されている
- [ ] 受入条件（AC-1〜AC-5）が全件策定されている
- [ ] TASK-SW-CANCEL-001 の完了前提条件が明記されている

## タスク100%実行確認【必須】

- [ ] Step 0（P50チェック）を実行し、現状コードを確認した
- [ ] Task 1（問題特定と影響範囲調査）を100%実行した
- [ ] Task 2（受入条件の策定）を100%実行した
- [ ] 成果物（TASK-SW-CANCEL-002-requirements.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 2: 設計](./phase-2-design.md)
