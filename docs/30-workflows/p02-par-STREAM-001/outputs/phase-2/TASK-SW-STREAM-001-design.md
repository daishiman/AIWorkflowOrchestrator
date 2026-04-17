# TASK-SW-STREAM-001 設計書

## 作成情報

| 項目   | 内容                                               |
| ------ | -------------------------------------------------- |
| Phase  | 2                                                  |
| 作成日 | 2026-04-17                                         |
| 状態   | 完了                                               |
| 参照   | outputs/phase-1/TASK-SW-STREAM-001-requirements.md |

---

## Task 1: シグネチャ変更設計

### 変更前

```typescript
async createSkill(options: CreateSkillOptions): Promise<string>
```

### 変更後（実装済み）

```typescript
async createSkill(
  options: CreateSkillOptions,
  onProgress?: SkillCreatorProgressCallback,
): Promise<string>
```

オプショナル引数（`?:`）により後方互換性を維持。既存呼び出し元への変更不要。

---

## Task 2: 進捗通知型定義設計

### 採用方針: 方針A（名前付き型として定義）

**実装済み型定義** (`SkillCreatorService.ts:46-58`):

```typescript
/**
 * 進捗コールバック用の型定義
 * TASK-SW-STREAM-001: createSkill() の onProgress 引数に使用する
 */
type SkillCreatorProgressData = {
  phase: string;
  percentage: number;
  message: string;
};

type SkillCreatorProgressCallback = (
  progress: SkillCreatorProgressData,
) => void;
```

> **仕様との差異（MINOR）**: 仕様書では型名を `SkillCreatorProgress` としていたが、
> 実装では `SkillCreatorProgressData` / `SkillCreatorProgressCallback` の2型に分割して定義。
> 意図は同一であり、型の責務が明確化されているため MINOR 扱い。

**採用理由**:

- Preload 側の `SkillCreatorProgress` 型との名称整合（将来の統一対象として記録）
- 将来の型拡張（`detail` フィールド追加等）に対応しやすい
- コールバック型を `SkillCreatorProgressCallback` として分離し、読みやすさを向上

---

## Task 3: コールバック呼び出し箇所の設計

### emitProgress ヘルパーパターン（実装済み）

`createSkill()` 内部でヘルパー関数を定義してコールバックをラップ:

```typescript
const emitProgress = (progress: SkillCreatorProgressData): void => {
  onProgress?.(progress);
};
```

オプショナルチェーン（`?.`）により `onProgress` が `undefined` の場合は安全にスキップ（AC-7）。

### 5箇所の呼び出し設計（実装済み）

| 位置                       | phase                 | percentage | message                              | 実装行 |
| -------------------------- | --------------------- | ---------- | ------------------------------------ | ------ |
| switch 文開始前            | `"planning"`          | 10         | `"構造を計画しています"`             | L204   |
| SKILL.md 生成開始前        | `"generating-skill"`  | 40         | `"SKILL.md を生成しています"`        | L241   |
| エージェント定義生成開始前 | `"generating-agents"` | 70         | `"エージェント定義を生成しています"` | L333   |
| 検証開始前                 | `"validating"`        | 90         | `"スキルを検証しています"`           | L350   |
| return 直前                | `"done"`              | 100        | `"完了しました"`                     | L363   |

---

## Task 4: `create` モード以外へのコールバック設計

### 採用方針

`planning` コールバック（段階1）は switch 文より前に実行されるため、
**全モード共通**で発火する設計となっている（仕様から変更）。

```typescript
// 段階1: planning（モード別ワークフロー開始直前）
emitProgress({
  phase: "planning",
  percentage: 10,
  message: "構造を計画しています",
});

switch (options.mode) {
  case "collaborative": ...
  case "orchestrate": ...
  case "create": ...
}
```

`generating-skill` / `generating-agents` / `validating` は `create` モードの処理フロー内に配置。
`done` は return 直前（共通）。

> **MINOR**: `collaborative` / `orchestrate` モードでも `planning` が発火する。
> TASK-SW-STREAM-002 スコープ外だが、仕様との差異として記録。

---

## Task 5: IPC 4層整合性チェック

| 層          | 変更有無 | 確認結果                                       |
| ----------- | -------- | ---------------------------------------------- |
| IPC Channel | なし     | `SKILL_CREATOR_CREATE` チャンネル変更なし      |
| Preload型   | なし     | 第1引数・戻り値型（`Promise<string>`）変更なし |
| IPC Handler | なし     | TASK-SW-STREAM-002 スコープで対応              |
| Renderer    | なし     | `useStreamingProgress` 既存実装で対応済み      |

**結論**: 本タスクの変更は `SkillCreatorService.ts` 内部のみ。IPC/Preload 層への破壊的変更なし。

---

## 完了チェックリスト

- [x] Task 1（シグネチャ変更設計）を100%実行した
- [x] Task 2（進捗通知型定義設計）を100%実行した
- [x] Task 3（コールバック呼び出し箇所の設計）を100%実行した
- [x] Task 4（`create` モード以外へのコールバック設計）を100%実行した
- [x] Task 5（IPC 4層整合性チェック）を100%実行した
- [x] 成果物（TASK-SW-STREAM-001-design.md）が生成されている
