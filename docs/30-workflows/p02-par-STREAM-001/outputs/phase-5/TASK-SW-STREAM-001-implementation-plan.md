# TASK-SW-STREAM-001 実装計画書

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 5                                                                 |
| Phase名    | 実装                                                              |
| 対象タスク | TASK-SW-STREAM-001                                                |
| 対象機能   | SkillCreatorService.createSkill() onProgress コールバック引数追加 |
| 作成日     | 2026-04-17                                                        |
| 状態       | 完了                                                              |
| 担当       | AIエージェント（ポストモーテム記録）                              |

## 概要

本ドキュメントは、`SkillCreatorService.createSkill()` に `onProgress?` コールバック引数を追加した
実装内容のポストモーテム記録である。実装はコミット `36ed8ad03` にてメインブランチにマージ済みである。

---

## 実装済み内容の記録

### 実装対象ファイル

```
apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

---

### 1. SkillCreatorProgressData 型定義の追加

ファイル上部（既存の型定義付近、L50〜L58）に以下の型が追加された:

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

**設計上の注意点:**

- 型名は当初設計書では `SkillCreatorProgress` だったが、実装では `SkillCreatorProgressData` に変更された
- `SkillCreatorProgressCallback` 型エイリアスも同時に追加された
- 両型ともファイルスコープの `type` であり、外部エクスポートはしていない

---

### 2. createSkill シグネチャ変更

```typescript
// 変更前
async createSkill(options: CreateSkillOptions): Promise<string>

// 変更後（実装済み、L160〜L163）
async createSkill(
  options: CreateSkillOptions,
  onProgress?: SkillCreatorProgressCallback,
): Promise<string>
```

`onProgress` はオプショナル引数（`?`）のため、既存の呼び出し元は変更不要（後方互換性を維持）。

---

### 3. emitProgress ヘルパー関数の追加

`createSkill()` 内部（L193〜L195）に以下のローカルヘルパーが追加された:

```typescript
const emitProgress = (progress: SkillCreatorProgressData): void => {
  onProgress?.(progress);
};
```

オプショナルチェーン（`?.`）により、`onProgress` が `undefined` の場合は何も実行しない（AC-7 対応）。

---

### 4. 5箇所のコールバック呼び出し実装

`createSkill()` 内の以下5箇所に `emitProgress` 呼び出しが追加された:

#### 段階1: planning（モード別ワークフロー開始直前、L203〜L208）

```typescript
// 段階1: planning（モード別ワークフロー開始直前）
emitProgress({
  phase: "planning",
  percentage: 10,
  message: "構造を計画しています",
});
```

対応AC: AC-2

#### 段階2: generating-skill（SKILL.md 生成開始直前、L240〜L245）

```typescript
// 段階2: generating-skill（SKILL.md 生成開始直前）
emitProgress({
  phase: "generating-skill",
  percentage: 40,
  message: "SKILL.md を生成しています",
});
```

対応AC: AC-3

#### 段階3: generating-agents（エージェント定義生成開始直前、L332〜L337）

```typescript
// 段階3: generating-agents（エージェント定義・タスク仕様書生成開始直前）
emitProgress({
  phase: "generating-agents",
  percentage: 70,
  message: "エージェント定義を生成しています",
});
```

対応AC: AC-4

#### 段階4: validating（スキル検証開始直前、L349〜L354）

```typescript
// 段階4: validating（スキル検証開始直前）
emitProgress({
  phase: "validating",
  percentage: 90,
  message: "スキルを検証しています",
});
```

対応AC: AC-5

#### 段階5: done（完了、L363）

```typescript
// 段階5: done（完了）
emitProgress({ phase: "done", percentage: 100, message: "完了しました" });
```

対応AC: AC-6

---

### 5. 実装上の決定事項

| 事項                            | 決定内容                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| コールバック呼び出し方式        | `emitProgress` ローカルヘルパー経由（直接 `onProgress?.()` ではなくラップ）         |
| オプショナルチェーン            | `onProgress?.()` でラップすることで `undefined` 時の安全性を確保（AC-7）            |
| コールバック位置                | 各処理の「開始直前」に配置（処理完了後ではなく、開始を通知する設計）                |
| collaborative/orchestrateモード | `planning` フェーズは switch 文の前に配置されており、全モードで planning が発火する |
| done フェーズ                   | `validateSkill` 成功後・`return skillDir` の直前に配置                              |
| エラー時の done                 | try-catch により検証失敗時は done が呼ばれない（TC-13 で検証済み）                  |

---

## 型チェック・lint 確認済み記録

| 確認項目                                    | 結果 | 備考                                            |
| ------------------------------------------- | ---- | ----------------------------------------------- |
| TypeScript 型チェック                       | OK   | `pnpm --filter @repo/desktop typecheck` 0エラー |
| ESLint                                      | OK   | `pnpm --filter @repo/desktop lint` 0エラー      |
| Prettier フォーマット                       | OK   | pre-commit フック経由で自動適用済み             |
| `SkillCreatorService.progress.test.ts` 追加 | 完了 | TC-01〜TC-14 全件 Green                         |

---

## 実装前後のシグネチャ比較

### 変更前（想定）

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

**後方互換性**: オプショナル引数追加のため、既存の全ての呼び出し元は変更不要。
IPC 契約・Preload 層への影響なし。

---

## TDD Green フェーズ確認コマンド（実装後）

```bash
# 進捗コールバック専用テスト実行
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillCreatorService.progress"

# 回帰テスト実行（collaborative モード等）
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillCreatorService" \
  --grep "collaborative"

# 全テスト実行
pnpm --filter @repo/desktop test -- \
  --testPathPattern="SkillCreatorService"

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

---

## 参照資料

- `docs/30-workflows/p02-par-STREAM-001/phase-5-implementation.md` — Phase 5 実行計画書
- `docs/30-workflows/p02-par-STREAM-001/outputs/phase-4/TASK-SW-STREAM-001-test-design.md` — テスト設計書
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 実装ファイル（L50〜L58, L160〜L363）
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` — 進捗テストファイル

---

## 完了チェックリスト

- [x] `SkillCreatorProgressData` 型定義が追加されている（L50〜L54）
- [x] `SkillCreatorProgressCallback` 型エイリアスが追加されている（L56〜L58）
- [x] `createSkill()` シグネチャに `onProgress?: SkillCreatorProgressCallback` が追加されている
- [x] `emitProgress` ローカルヘルパーが追加されている
- [x] planning/10% コールバック呼び出しが実装されている（AC-2）
- [x] generating-skill/40% コールバック呼び出しが実装されている（AC-3）
- [x] generating-agents/70% コールバック呼び出しが実装されている（AC-4）
- [x] validating/90% コールバック呼び出しが実装されている（AC-5）
- [x] done/100% コールバック呼び出しが実装されている（AC-6）
- [x] `onProgress` 未指定でもエラーなし（オプショナルチェーン実装、AC-7）
- [x] TypeScript 型チェック 0エラー
- [x] ESLint 0エラー
- [x] `SkillCreatorService.progress.test.ts` が追加され TC-01〜TC-14 全件 Green
