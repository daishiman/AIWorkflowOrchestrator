# TASK-SW-STREAM-001 設計書

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | TASK-SW-STREAM-001 |
| 作成日   | 2026-04-16         |

## 1. 進捗データ型定義

```typescript
// 進捗コールバック用の型定義（SkillCreatorService.ts 内に定義）
type SkillCreatorProgressData = {
  phase: string; // "planning" | "generating-skill" | "generating-agents" | "validating" | "done"
  percentage: number; // 10 | 40 | 70 | 90 | 100
  message: string; // 日本語の進捗メッセージ
};

type SkillCreatorProgressCallback = (
  progress: SkillCreatorProgressData,
) => void;
```

**型配置方針**: `SkillCreatorService.ts` 内に定義（単一ファイル使用）。
将来 TASK-SW-STREAM-002 と共有が必要になった場合は `packages/shared/` へ移動する（未タスク）。

## 2. `createSkill()` シグネチャ変更設計

```typescript
// 変更前
async createSkill(options: CreateSkillOptions): Promise<string>

// 変更後
async createSkill(
  options: CreateSkillOptions,
  onProgress?: SkillCreatorProgressCallback,
): Promise<string>
```

**設計ポイント**: `onProgress` はオプショナル（`?:`）のため、既存呼び出し元への破壊的変更なし。

## 3. 処理の節目での呼び出しポイント設計（5段階）

| 段階 | 呼び出しタイミング                                         | phase                 | percentage | message                              |
| ---- | ---------------------------------------------------------- | --------------------- | ---------- | ------------------------------------ |
| 1    | switch ブロック直前（ワークフロー開始前）                  | `"planning"`          | 10         | `"構造を計画しています"`             |
| 2    | SKILL.md 生成開始直前（`generate_skill_md.js` 呼び出し前） | `"generating-skill"`  | 40         | `"SKILL.md を生成しています"`        |
| 3    | タスク仕様書生成前（`generateTaskSpecs` 呼び出し前に相当） | `"generating-agents"` | 70         | `"エージェント定義を生成しています"` |
| 4    | 検証開始直前（`validateSkill` 呼び出し前）                 | `"validating"`        | 90         | `"スキルを検証しています"`           |
| 5    | 処理完了直前（`return skillDir` 直前）                     | `"done"`              | 100        | `"完了しました"`                     |

**ガード付き呼び出しパターン**:

```typescript
onProgress?.({
  phase: "planning",
  percentage: 10,
  message: "構造を計画しています",
});
```

## 4. 既存テストへの影響範囲

| テストファイル                            | 影響内容                       | 対応方針                       |
| ----------------------------------------- | ------------------------------ | ------------------------------ |
| `skillCreatorHandlers.validation.test.ts` | `createSkill` モックシグネチャ | オプショナル引数のため変更不要 |
| `skillCreatorIpc.integration.test.ts`     | 同上                           | 変更不要                       |
| `SkillCreatorService.test.ts`             | `createSkill` 呼び出し         | 変更不要                       |

## 5. TASK-SW-STREAM-002 との接続インターフェース

```typescript
// TASK-SW-STREAM-002 での使用イメージ（本タスクのスコープ外）
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  (progress) => {
    sendSkillCreatorProgress(mainWindow, progress);
  },
);
```

## 6. 検証マトリクス

| テスト対象                 | コマンド                                                               |
| -------------------------- | ---------------------------------------------------------------------- |
| SkillCreatorService テスト | `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/` |
| 型チェック                 | `pnpm --filter @repo/desktop typecheck`                                |
| lint                       | `pnpm --filter @repo/desktop lint`                                     |
| 既存統合テスト             | `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/`  |
