# SkillCreatorProgressData を shared へ移動 - タスク指示書

## メタ情報

```yaml
issue_number: 2206
```

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | FUP-SW-STREAM-001-01                     |
| タスク名     | skill-creator-progress-shared-type-move  |
| 分類         | リファクタリング                         |
| 対象機能     | SkillCreatorService - 型定義共有化       |
| 優先度       | **低**                                   |
| 見積もり規模 | 小規模                                   |
| ステータス   | 未着手                                   |
| 発見元       | TASK-SW-STREAM-001 Phase 12 未タスク検出 |
| 発見日       | 2026-04-16                               |
| depends_on   | TASK-SW-STREAM-002（IPC 配線）完了後     |
| 関連タスク   | TASK-SW-STREAM-001 / TASK-SW-STREAM-002  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SW-STREAM-001 で `SkillCreatorService.ts` 内にローカル定義した `SkillCreatorProgressData` 型は、
現時点では Main Process の内部 API としてのみ機能している。

しかし TASK-SW-STREAM-002（IPC 配線）が完了すると、Renderer Process 側でも
`ipcRenderer.on('skill-creator:progress', (_, data: SkillCreatorProgressData) => ...)` のように
同じ型を参照する必要が生じる。

### 1.2 問題点・課題

- `SkillCreatorProgressData` が `apps/desktop/src/main/services/skill/SkillCreatorService.ts` にローカル定義されている
- Main Process 専用のモジュールから型をインポートすると、Renderer Process のバンドルが汚染される
- `packages/shared/` を使わずに型を共有しようとすると、型の重複定義またはパスの依存問題が発生する

### 1.3 放置した場合の影響

- TASK-SW-STREAM-002 完了後、renderer 側で `SkillCreatorProgressData` 型を独自定義または重複定義する羽目になる
- 型の乖離（phase 文字列のスペルミス等）がコンパイルエラーではなく実行時エラーとして現れる可能性がある

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorProgressData` 型を `packages/shared/` へ移動し、
Main Process / Renderer Process の両側から同一の型定義を参照できる状態にする。

### 2.2 最終ゴール

- `packages/shared/src/types/skillCreatorProgress.ts` に型定義が存在する
- `SkillCreatorService.ts` および `skillCreatorHandlers.ts` が shared からインポートしている
- Renderer Process 側でも同じパスから型をインポートできる
- 既存のテストが全てパスする

### 2.3 スコープ

#### 含むもの

- `SkillCreatorProgressData` 型の `packages/shared/` への移動
- `SkillCreatorService.ts` のインポート更新
- `skillCreatorHandlers.ts` のインポート更新（TASK-SW-STREAM-002 完了後）
- `packages/shared/src/index.ts` への re-export 追加
- 既存テストのインポートパス更新

#### 含まないもの

- IPC 配線の実装（TASK-SW-STREAM-002 のスコープ）
- Renderer 側での型利用実装（後続タスクのスコープ）
- 型の内容変更（移動のみ）

### 2.4 成果物

| 種別      | 成果物                            | 配置先                                                              |
| --------- | --------------------------------- | ------------------------------------------------------------------- |
| 型定義    | skillCreatorProgress.ts           | `packages/shared/src/types/skillCreatorProgress.ts`                 |
| re-export | index.ts 更新                     | `packages/shared/src/index.ts`                                      |
| 修正      | SkillCreatorService.ts インポート | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`       |
| テスト    | インポートパス更新                | `apps/desktop/src/main/services/skill/__tests__/*.progress.test.ts` |

---

## 3. どのように実装するか（How）

### 3.1 実装手順

#### Step 1: shared パッケージに型ファイルを作成

```typescript
// packages/shared/src/types/skillCreatorProgress.ts
export type SkillCreatorProgressPhase =
  | "planning"
  | "generating-skill"
  | "generating-agents"
  | "validating"
  | "done";

export interface SkillCreatorProgressData {
  phase: SkillCreatorProgressPhase;
  percentage: number;
  message: string;
}
```

#### Step 2: shared の index.ts に re-export を追加

```typescript
// packages/shared/src/index.ts への追記
export type {
  SkillCreatorProgressData,
  SkillCreatorProgressPhase,
} from "./types/skillCreatorProgress";
```

#### Step 3: SkillCreatorService.ts のローカル型定義を削除してインポートに変更

```typescript
// Before
type SkillCreatorProgressPhase = "planning" | "generating-skill" | ...;
interface SkillCreatorProgressData { ... }

// After
import type { SkillCreatorProgressData } from "@repo/shared";
```

#### Step 4: テストのインポートパスを更新

```typescript
// SkillCreatorService.progress.test.ts
import type { SkillCreatorProgressData } from "@repo/shared";
```

### 3.2 確認コマンド

```bash
# 型チェック
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop typecheck

# テスト
pnpm --filter @repo/desktop test -- --run SkillCreatorService.progress
```

---

## 4. 受け入れ基準（Acceptance Criteria）

| AC番号 | 条件                                                              | 検証方法           |
| ------ | ----------------------------------------------------------------- | ------------------ |
| AC-1   | `packages/shared/src/types/skillCreatorProgress.ts` が存在する    | ファイル存在確認   |
| AC-2   | `@repo/shared` から `SkillCreatorProgressData` をインポートできる | typecheck PASS     |
| AC-3   | `SkillCreatorService.ts` 内にローカル型定義が残っていない         | grep で確認        |
| AC-4   | 既存の progress テスト 14 個が全て PASS                           | vitest run         |
| AC-5   | `pnpm typecheck`（desktop）が PASS                                | typecheck コマンド |

---

## 5. 苦戦箇所と知見

### 5.1 実施タイミングの判断

**苦戦した点**: IPC 配線（TASK-SW-STREAM-002）の前後どちらで型移動を行うべきか判断が難しかった。

**知見**: 型移動は IPC 配線の**後**が適切。理由は以下の通り：

- IPC 配線前の型移動は「将来 Renderer が使う型」を先行して shared に置くことになり、
  現時点では Dead Code となる
- Renderer 側の IPC 実装が固まってから移動することで、
  Renderer が実際に使うフィールド（phase/percentage/message の型）が確定した状態で移動できる
- 移動先のパスは IPC 配線の実装者と合意してから変更する方が破壊範囲を最小化できる

### 5.2 monorepo の型共有パターン

**知見**: Electron monorepo では `packages/shared/` が Main/Renderer の唯一の安全な型共有場所。
`apps/desktop/src/main/` からの型インポートを Renderer 側で行うと、
webpack/vite がバンドル時に Main Process 専用モジュール（Node.js APIs）を引き込もうとしてエラーになる。

---

## 関連リンク

- [TASK-SW-STREAM-001 仕様書](../completed-tasks/p01-par-STREAM-001/index.md)
- [TASK-SW-STREAM-002 仕様書](../completed-tasks/p02-par-STREAM-002/index.md)
- [packages/shared/src/index.ts](../../../../packages/shared/src/index.ts)
