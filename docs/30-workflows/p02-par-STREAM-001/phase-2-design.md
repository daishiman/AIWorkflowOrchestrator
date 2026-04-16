# Phase 2: 設計

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 2                           |
| Phase名    | 設計                        |
| 対象機能   | TASK-SW-STREAM-001          |
| 前提Phase  | Phase 1: 要件定義           |
| 次Phase    | Phase 3: 設計レビューゲート |
| ステータス | 未実施                      |
| 作成日     | 2026-04-16                  |

## 目的

`createSkill()` にオプショナルな `onProgress` コールバック引数を追加し、
処理の5節目でコールバックを呼び出す詳細設計を行う。

## 実行タスク

### Task 1: シグネチャ変更設計

**変更対象**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

**変更前**:

```typescript
async createSkill(options: CreateSkillOptions): Promise<string>
```

**変更後**:

```typescript
async createSkill(
  options: CreateSkillOptions,
  onProgress?: (progress: { phase: string; percentage: number; message: string }) => void,
): Promise<string>
```

### Task 2: 進捗通知型定義設計

コールバック引数の型をインラインで定義するか、名前付き型として切り出すかを検討する。

**方針A（推奨）**: `SkillCreatorProgress` 型をファイル内で定義する

```typescript
type SkillCreatorProgress = {
  phase: string;
  percentage: number;
  message: string;
};

async createSkill(
  options: CreateSkillOptions,
  onProgress?: (progress: SkillCreatorProgress) => void,
): Promise<string>
```

**方針B**: インラインで定義する（型名なし）

**採用方針**: 方針A（`SkillCreatorProgress` 型を定義）

- Preload 側の `SkillCreatorProgress` 型（`apps/desktop/src/preload/skill-creator-api.ts`）との名称整合性を保つ
- 将来の型拡張（`detail` フィールド追加等）に対応しやすい

### Task 3: コールバック呼び出し箇所の設計

`createSkill()` 内部の以下5箇所でコールバックを呼び出す。

| 呼び出し箇所               | phase                 | percentage | message                              |
| -------------------------- | --------------------- | ---------- | ------------------------------------ |
| `runCreateWorkflow` 開始前 | `"planning"`          | 10         | `"構造を計画しています"`             |
| SKILL.md 生成開始前        | `"generating-skill"`  | 40         | `"SKILL.md を生成しています"`        |
| エージェント定義生成開始前 | `"generating-agents"` | 70         | `"エージェント定義を生成しています"` |
| 検証開始前                 | `"validating"`        | 90         | `"スキルを検証しています"`           |
| スキルディレクトリ返却前   | `"done"`              | 100        | `"完了しました"`                     |

コールバック呼び出しのヘルパーパターン:

```typescript
// onProgress が undefined の場合は何もしない（AC-7）
onProgress?.({
  phase: "planning",
  percentage: 10,
  message: "構造を計画しています",
});
```

### Task 4: `create` モード以外へのコールバック設計

`createSkill()` は `collaborative` / `orchestrate` / `create` の各モードを switch で振り分ける。
コールバック呼び出しは `create` モード専用フロー内に配置するか、共通フローに配置するかを検討する。

**方針**: `create` モードの処理フロー内に限定して配置する

- `collaborative` / `orchestrate` モードは進捗通知の設計外（TASK-SW-STREAM-002 スコープ外）
- `done` コールバックはモード共通で最後に呼び出す（スキルディレクトリ返却前）

### Task 5: IPC 4層整合性チェック

本タスクは `SkillCreatorService` の内部メソッドシグネチャ変更であり、
IPC チャンネル定義（`channels.ts`）や Preload 型定義への変更はない。

- `SKILL_CREATOR_CREATE` ハンドラーの IPC チャンネルは変更しない
- `createSkill()` の第1引数・戻り値型は変更しない
- 4層整合性チェックは TASK-SW-STREAM-002 のスコープで行う

## 参照資料

- `outputs/phase-1/TASK-SW-STREAM-001-requirements.md` — 受入条件（AC-1〜AC-8）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 実装対象
- `apps/desktop/src/preload/skill-creator-api.ts` — `SkillCreatorProgress` 型参照

## 統合テスト連携

- `createSkill()` の公開シグネチャ変更（引数追加）は後方互換（オプショナル）であり、統合ポイントへの影響なし
- TASK-SW-STREAM-002 がコールバックを `sendSkillCreatorProgress` に接続するため、本タスクで定義した `SkillCreatorProgress` 型との整合性を保つ

## 成果物

| 成果物                       | パス                                           |
| ---------------------------- | ---------------------------------------------- |
| TASK-SW-STREAM-001-design.md | `outputs/phase-2/TASK-SW-STREAM-001-design.md` |

## 完了条件

- [ ] 変更前/後のシグネチャが設計書に明記されている
- [ ] `SkillCreatorProgress` 型定義の方針（方針A）が確定している
- [ ] 5つのコールバック呼び出し箇所と引数が設計書に明記されている
- [ ] `create` モード以外へのコールバック設計方針が決定されている
- [ ] IPC 4層整合性チェックが不要と判断されている

## タスク100%実行確認【必須】

- [ ] Task 1（シグネチャ変更設計）を100%実行した
- [ ] Task 2（進捗通知型定義設計）を100%実行した
- [ ] Task 3（コールバック呼び出し箇所の設計）を100%実行した
- [ ] Task 4（`create` モード以外へのコールバック設計）を100%実行した
- [ ] Task 5（IPC 4層整合性チェック）を100%実行した
- [ ] 成果物（TASK-SW-STREAM-001-design.md）が生成されている
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 3: 設計レビューゲート](./phase-3-design-review.md)
