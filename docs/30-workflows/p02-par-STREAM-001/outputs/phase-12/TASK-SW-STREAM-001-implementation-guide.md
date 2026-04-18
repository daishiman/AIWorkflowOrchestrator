# TASK-SW-STREAM-001 実装ガイド

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| Phase    | 12                 |
| Phase名  | ドキュメント更新   |
| タスクID | TASK-SW-STREAM-001 |
| 作成日   | 2026-04-17         |
| 状態     | 完了               |

---

## 1. 中学生レベルの概念説明

### このタスクで何を追加したか（誰でもわかる説明）

このタスクでは、スキル作成アプリの **「スキル生成中に進捗を知らせる仕組み」** を追加しました。

たとえば、ファイルをコピーするときにパソコンが「残り何%」と表示するように、スキルを作るときも「今どの作業をしているか」を外部に伝える窓口（コールバック）を作りました。

#### 追加した仕組みの流れ

```
スキル生成を開始
  ↓
「設計中です（10%）」と外部に伝える
  ↓
スキルの設計書（SKILL.md）を作る
  ↓
「SKILL.md を作っています（40%）」と外部に伝える
  ↓
エージェント定義ファイルを作る
  ↓
「エージェントを定義しています（70%）」と外部に伝える
  ↓
作ったファイルを確認する
  ↓
「確認中です（90%）」と外部に伝える
  ↓
完成！
  ↓
「完了しました（100%）」と外部に伝える
```

#### ポイント

- この「外部に伝える関数」を渡さなくても、スキル生成は普通通り完了する（省略可能）
- 進捗通知の受け口（handler/preload）は既に配線済みで、今回の修正は service 側の progress 発火条件を create モードに揃えることに集中した

## 視覚証跡

- UI/UX変更なしのため Phase 11 スクリーンショット不要

---

## 2. 技術者向け実装ガイド

### 修正ファイル

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts`

### 追加した型定義

```typescript
// 行48-58
type SkillCreatorProgressData = {
  phase: string; // フェーズ名（"planning" | "generating-skill" | "generating-agents" | "validating" | "done"）
  percentage: number; // 進捗率（0-100）
  message: string; // 表示メッセージ
};

type SkillCreatorProgressCallback = (
  progress: SkillCreatorProgressData,
) => void;
```

### シグネチャ変更

```typescript
// 変更前
async createSkill(options: CreateSkillOptions): Promise<string>

// 変更後（第2引数を追加）
async createSkill(
  options: CreateSkillOptions,
  onProgress?: SkillCreatorProgressCallback,
): Promise<string>
```

### emitProgress ヘルパーパターン

コールバック呼び出しを1箇所に集約するため、`createSkill` 内に局所ヘルパーを定義した。

```typescript
const emitProgress = (progress: SkillCreatorProgressData): void => {
  onProgress?.(progress);
};
```

### 5箇所のコールバック呼び出し

| 呼び出し順 | phase               | percentage | 位置                              |
| ---------- | ------------------- | ---------- | --------------------------------- |
| 1          | `planning`          | 10         | create モードのワークフロー開始前 |
| 2          | `generating-skill`  | 40         | SKILL.md 生成開始前               |
| 3          | `generating-agents` | 70         | エージェント定義生成開始前        |
| 4          | `validating`        | 90         | 検証開始前                        |
| 5          | `done`              | 100        | スキルディレクトリ return 直前    |

### 既存の呼び出し元への影響

オプショナル引数（`?`）のため、既存の呼び出し元（`skillCreatorHandlers.ts` 等）への変更は不要。
`skillCreatorHandlers.ts` は既に `sendSkillCreatorProgress(mainWindow, progress)` に接続されているため、
今回の修正で追加の配線作業は発生しない。

```typescript
// 既存の呼び出し（変更不要）
const skillDir = await skillCreatorService.createSkill(validatedArgs);

// progress 付きの呼び出し方（既存接続で利用）
const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  onProgress,
);
```

---

## 3. 既存接続の確認

### 接続先

`apps/desktop/src/main/ipc/skillCreatorHandlers.ts` の `SKILL_CREATOR_CREATE` ハンドラー内（行276付近）

### 接続状態

```typescript
// 既存の接続（現在のブランチでは実装済み）
const onProgress = (progress: SkillCreatorProgressData) => {
  sendSkillCreatorProgress(mainWindow, {
    phase: progress.phase,
    percentage: progress.percentage,
    message: progress.message,
  });
};

const skillDir = await skillCreatorService.createSkill(
  validatedArgs,
  onProgress,
);
```

### 確認事項

1. `SkillCreatorProgressData`（本タスク）と Preload 側の `SkillCreatorProgress` 型が一致しているか確認すること（TECH-M-03）
2. `sendSkillCreatorProgress` の呼び出しシグネチャと `SkillCreatorProgressData` の構造が整合するか確認すること
3. `onProgress` が create モード以外では発火しないことを `SkillCreatorService.progress.test.ts` で確認済みであること

---

## 完了チェックリスト

- [x] 中学生レベルの概念説明が記述されている
- [x] 技術者向け実装ガイドが完成している
- [x] 既存の handler/preload 接続との整合が明記されている
- [x] 成果物（TASK-SW-STREAM-001-implementation-guide.md）が生成されている
