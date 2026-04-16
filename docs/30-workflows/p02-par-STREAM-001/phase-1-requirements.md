# Phase 1: 要件定義

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 1                  |
| Phase名    | 要件定義           |
| 対象機能   | TASK-SW-STREAM-001 |
| 前提Phase  | -（起点）          |
| 次Phase    | Phase 2: 設計      |
| ステータス | 未実施             |
| 作成日     | 2026-04-16         |

## 目的

`SkillCreatorService.createSkill()` に進捗コールバック引数が欠落しており、
`sendSkillCreatorProgress()` が呼び出されないためフロント側のプログレス表示が常に初期状態のまま
という問題を特定し、修正に必要な要件と受入条件を明確化する。

## 問題

`apps/desktop/src/main/ipc/skillCreatorHandlers.ts:692` の `sendSkillCreatorProgress` は
`export` されているが、`SKILL_CREATOR_CREATE` ハンドラー（:172-284）内では
`skillCreatorService.createSkill()` を呼ぶだけで進捗通知は一切送信されない。

```typescript
// skillCreatorHandlers.ts:276（現状）
const skillDir = await skillCreatorService.createSkill(validatedArgs);
// ↑ onProgress コールバックを渡す手段がない
```

`SkillCreatorService.createSkill()` は現在以下のシグネチャを持つ:

```typescript
async createSkill(options: CreateSkillOptions): Promise<string>
```

進捗データをコールバック経由で外部に通知する仕組みがなく、フロント側の
`useStreamingProgress` フックが IPC メッセージを受信できない状態である。

## 実行タスク

### Step 0: P50チェック（必須）

実装状態を確認し、既実装コードの重複修正を防止する。

1. `apps/desktop/src/main/services/skill/SkillCreatorService.ts` の `createSkill` メソッドシグネチャを確認
2. 処理節目（switch 文内の各モード・SKILL.md 生成・エージェント定義生成・検証）の行番号を確認
3. 既存テストファイルの関連テストケースを確認
4. `skillCreatorHandlers.ts:692` の `sendSkillCreatorProgress` の実装を確認

### Task 1: 問題特定と影響範囲調査

1. `createSkill()` の現状実装を確認（シグネチャ・処理フロー）
2. `sendSkillCreatorProgress` の現状（export されているが呼び出し元なし）を確認
3. フロント側 `useStreamingProgress.ts` の期待する受信フォーマット（`phase` / `percentage` / `message`）を確認
4. 後続タスク TASK-SW-STREAM-002 との接続点（ハンドラー側でのコールバック接続）を確認
5. 既存テストへの影響（オプショナル引数のため破壊的変更なし）を評価

### Task 2: 受入条件の策定

1. コールバック型定義（`{ phase: string; percentage: number; message: string }`）を整理
2. 5つの節目と対応するコールバック引数を明確化
3. オプショナル引数によるデフォルト動作（`undefined` 時に呼び出さない）を明確化
4. 受入条件を8件策定

## 受入条件

| ID   | 条件                                                                                                                                                  |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | `createSkill()` の第2引数に `onProgress?: (progress: { phase: string; percentage: number; message: string }) => void` が追加されている                |
| AC-2 | `runCreateWorkflow` 開始時に `onProgress` が `{ phase: "planning", percentage: 10, message: "構造を計画しています" }` で呼び出される                  |
| AC-3 | SKILL.md 生成開始時に `onProgress` が `{ phase: "generating-skill", percentage: 40, message: "SKILL.md を生成しています" }` で呼び出される            |
| AC-4 | エージェント定義生成時に `onProgress` が `{ phase: "generating-agents", percentage: 70, message: "エージェント定義を生成しています" }` で呼び出される |
| AC-5 | 検証開始時に `onProgress` が `{ phase: "validating", percentage: 90, message: "スキルを検証しています" }` で呼び出される                              |
| AC-6 | 完了時に `onProgress` が `{ phase: "done", percentage: 100, message: "完了しました" }` で呼び出される                                                 |
| AC-7 | `onProgress` が未指定の場合（`undefined`）でもエラーが発生しない（既存の呼び出し元は変更不要）                                                        |
| AC-8 | 既存テスト（`collaborative` モード・`orchestrate` モード等）が全てパスし続ける                                                                        |

## 参照資料

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 実装対象
- `apps/desktop/src/main/ipc/skillCreatorHandlers.ts` — `sendSkillCreatorProgress` の定義（後続タスクスコープ）
- `apps/desktop/src/renderer/hooks/useStreamingProgress.ts` — フロント側の期待するフォーマット確認
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-1-analysis.md` — 問題1の現状分析
- `docs/30-workflows/skill-create-flow-gaps/00-task-spec-design-docs/phase-2-solution.md` — 解決アプローチA・B

## 統合テスト連携

- 本タスクは `SkillCreatorService.ts` 内部の変更のみを対象とする
- `createSkill()` の第1引数（`CreateSkillOptions`）と戻り値（`Promise<string>`）は変更しない
- 引数追加はオプショナルのため、IPC/Preload 層への破壊的変更はない
- 接続要件: TASK-SW-STREAM-002 が本タスクの成果（`onProgress` 引数）を前提としてハンドラー側で接続する

## 成果物

| 成果物                             | パス                                                 |
| ---------------------------------- | ---------------------------------------------------- |
| TASK-SW-STREAM-001-requirements.md | `outputs/phase-1/TASK-SW-STREAM-001-requirements.md` |

## 完了条件

- [ ] 問題の根本原因（`createSkill()` に `onProgress` 引数がなく `sendSkillCreatorProgress` が呼ばれない）が特定されている
- [ ] 受入条件（AC-1〜AC-8）が全件策定されている
- [ ] コールバック接続を TASK-SW-STREAM-002 へ分離する方針が明記されている
- [ ] 後続タスク TASK-SW-STREAM-002 との接続点が確認されている

## タスク100%実行確認【必須】

- [ ] Step 0（P50チェック）を実行し、現状コードを確認した
- [ ] Task 1（問題特定と影響範囲調査）を100%実行した
- [ ] Task 2（受入条件の策定）を100%実行した
- [ ] 成果物（TASK-SW-STREAM-001-requirements.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 2: 設計](./phase-2-design.md)
