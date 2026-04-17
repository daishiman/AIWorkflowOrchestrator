# TASK-SW-STREAM-001 要件定義書

## 作成情報

| 項目   | 内容                                |
| ------ | ----------------------------------- |
| Phase  | 1                                   |
| 作成日 | 2026-04-17                          |
| 状態   | 完了                                |
| 担当   | TASK-SW-STREAM-001 実行エージェント |

---

## Step 0: P50チェック結果

### `createSkill()` シグネチャ確認

**確認対象**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**確認結果（実装済み）**:

```typescript
// 実装済み（TASK-SW-STREAM-001 対応後のシグネチャ）
async createSkill(
  options: CreateSkillOptions,
  onProgress?: SkillCreatorProgressCallback,
): Promise<string>
```

本チェック時点で実装は既にマージ済みであることが判明。本タスク仕様書の各フェーズ出力はポストモーテムドキュメントとして記録する。

### 処理節目（行番号）

| 節目                           | 行番号 | フェーズ                |
| ------------------------------ | ------ | ----------------------- |
| planning コールバック          | L204   | planning (10%)          |
| generating-skill コールバック  | L241   | generating-skill (40%)  |
| generating-agents コールバック | L333   | generating-agents (70%) |
| validating コールバック        | L350   | validating (90%)        |
| done コールバック              | L363   | done (100%)             |

### 既存テスト確認

`__tests__/SkillCreatorService.test.ts` には onProgress に特化したテストケース（TC-01〜TC-10）は未追加。既存テストは STRUCT-001・CANCEL-003 等の別タスク向け。

### `sendSkillCreatorProgress` 確認

`skillCreatorHandlers.ts:692` の `sendSkillCreatorProgress` は `export` 済み。`createSkill()` の `onProgress` 引数接続は TASK-SW-STREAM-002 スコープ。

---

## Task 1: 問題特定と影響範囲調査

### 問題の根本原因

**ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts:276`（修正前）

```typescript
// 問題のあった呼び出し（修正前）
const skillDir = await skillCreatorService.createSkill(validatedArgs);
// ↑ onProgress コールバックを渡す手段がなかった
```

`SkillCreatorService.createSkill()` には進捗コールバック引数が存在せず、
`sendSkillCreatorProgress()` が呼ばれることなく、フロント側の `useStreamingProgress` フックが
IPC メッセージを受信できない状態だった。

### 影響範囲

| 層         | 影響                                              |
| ---------- | ------------------------------------------------- |
| Service層  | `createSkill()` にコールバック引数なし → 追加     |
| IPC層      | TASK-SW-STREAM-002 で接続（本タスク外）           |
| Preload層  | 変更不要（既存 `SkillCreatorProgress` 型と整合）  |
| Renderer層 | 変更不要（`useStreamingProgress` 既存実装で対応） |

### 後続タスク TASK-SW-STREAM-002 との接続点

本タスクで `createSkill()` に `onProgress?` 引数が追加されることで、
TASK-SW-STREAM-002 は `skillCreatorHandlers.ts` 側で以下のように接続できる:

```typescript
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

---

## Task 2: 受入条件の策定

### コールバック型定義

```typescript
type SkillCreatorProgressData = {
  phase: string; // フェーズ識別子
  percentage: number; // 進捗パーセンテージ (0-100)
  message: string; // ユーザー向けメッセージ
};

type SkillCreatorProgressCallback = (
  progress: SkillCreatorProgressData,
) => void;
```

> **Note**: 仕様書では `SkillCreatorProgress` として定義していたが、
> 実装では `SkillCreatorProgressData` / `SkillCreatorProgressCallback` として実装された。
> Phase 3 レビューで MINOR として記録する。

### 5つの節目と引数

| 順番 | phase                 | percentage | message                              |
| ---- | --------------------- | ---------- | ------------------------------------ |
| 1    | `"planning"`          | 10         | `"構造を計画しています"`             |
| 2    | `"generating-skill"`  | 40         | `"SKILL.md を生成しています"`        |
| 3    | `"generating-agents"` | 70         | `"エージェント定義を生成しています"` |
| 4    | `"validating"`        | 90         | `"スキルを検証しています"`           |
| 5    | `"done"`              | 100        | `"完了しました"`                     |

### 受入条件（AC-1〜AC-8）

| ID   | 条件                                                                      | 達成状態 |
| ---- | ------------------------------------------------------------------------- | -------- |
| AC-1 | `createSkill()` の第2引数に `onProgress?: (...) => void` が追加されている | ✅ 達成  |
| AC-2 | `runCreateWorkflow` 開始前に `planning` / 10% で呼び出される              | ✅ 達成  |
| AC-3 | SKILL.md 生成開始前に `generating-skill` / 40% で呼び出される             | ✅ 達成  |
| AC-4 | エージェント定義生成開始前に `generating-agents` / 70% で呼び出される     | ✅ 達成  |
| AC-5 | 検証開始前に `validating` / 90% で呼び出される                            | ✅ 達成  |
| AC-6 | 完了時に `done` / 100% で呼び出される                                     | ✅ 達成  |
| AC-7 | `onProgress` 未指定の場合でもエラーが発生しない                           | ✅ 達成  |
| AC-8 | 既存テストが全てパスし続ける                                              | ✅ 達成  |

---

## 完了チェックリスト

- [x] Step 0（P50チェック）を実行し、現状コードを確認した
- [x] Task 1（問題特定と影響範囲調査）を100%実行した
- [x] Task 2（受入条件の策定）を100%実行した
- [x] 成果物（TASK-SW-STREAM-001-requirements.md）が生成されている
