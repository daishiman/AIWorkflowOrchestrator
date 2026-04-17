# progress フェーズを定数化 - タスク指示書

## メタ情報

```yaml
issue_number: 2207
```

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | FUP-SW-STREAM-001-02                          |
| タスク名     | skill-creator-progress-constants              |
| 分類         | リファクタリング                              |
| 対象機能     | SkillCreatorService - 進捗定数化              |
| 優先度       | **低**                                        |
| 見積もり規模 | 小規模                                        |
| ステータス   | 未着手                                        |
| 発見元       | TASK-SW-STREAM-001 Phase 12 未タスク検出      |
| 発見日       | 2026-04-16                                    |
| depends_on   | TASK-SW-STREAM-001（完了済み）                |
| 並行可能     | FUP-SW-STREAM-001-01（shared 型移動）と並行可 |
| 関連タスク   | TASK-SW-STREAM-001                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SW-STREAM-001 で実装した `SkillCreatorService.createSkill()` の進捗通知は、
phase 文字列・percentage 数値・message 文字列をインラインで直接記述している。

```typescript
// 現状: magic string / magic number が散在
onProgress({
  phase: "planning",
  percentage: 10,
  message: "構造を計画しています",
});
onProgress({
  phase: "generating-skill",
  percentage: 40,
  message: "SKILL.md を生成しています",
});
onProgress({
  phase: "generating-agents",
  percentage: 70,
  message: "エージェント定義を生成しています",
});
onProgress({
  phase: "validating",
  percentage: 90,
  message: "スキルを検証しています",
});
onProgress({ phase: "done", percentage: 100, message: "完了しました" });
```

### 1.2 問題点・課題

- 5箇所に `"planning"` 等の magic string が散在し、スペルミスがコンパイル時に検出されない
- `percentage: 10` 等の magic number を変更する際、複数箇所を探して修正する必要がある
- テストコードの期待値（`{ phase: "planning", percentage: 10, message: "..." }`）もインラインで重複定義されており、
  メッセージ文言を変更するとテスト修正が14箇所に波及する
- FUP-03（モード別フロー詳細化）実装時に、モードごとのフェーズセットを定数で管理していないと
  定義が爆発的に増える

### 1.3 放置した場合の影響

- percentage を 10→15 に変更する際、ソース側とテスト側の両方を修正する必要があり、
  修正漏れが発生しやすい
- FUP-03 でモード別フェーズを追加するとき、magic string の重複が倍増する

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorService.ts` 内に散在する progress の phase 文字列・percentage 数値・message 文字列を
`PROGRESS_PHASES` 定数オブジェクトに集約し、実装とテストの両方から定数参照できる状態にする。

### 2.2 最終ゴール

- `PROGRESS_PHASES` 定数が定義され、phase/percentage/message が一元管理される
- `SkillCreatorService.ts` 内の全ての `onProgress()` 呼び出しが定数を参照している
- テストの期待値が定数から導出されている
- magic string / magic number がゼロになっている

### 2.3 スコープ

#### 含むもの

- `PROGRESS_PHASES` 定数オブジェクトの定義
- `SkillCreatorService.ts` の `onProgress()` 呼び出し箇所を定数参照に変更
- `SkillCreatorService.progress.test.ts` の期待値を定数参照に変更
- TypeScript `as const` アサーションによる型安全性確保

#### 含まないもの

- phase/percentage/message の値の変更（定数化のみ）
- モード別フェーズ対応（FUP-03 のスコープ）
- shared パッケージへの移動（FUP-01 のスコープ）

### 2.4 成果物

| 種別 | 成果物                  | 配置先                                                                                |
| ---- | ----------------------- | ------------------------------------------------------------------------------------- |
| 定数 | PROGRESS_PHASES 定数    | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                         |
| 修正 | onProgress 呼び出し箇所 | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                         |
| 修正 | テスト期待値            | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts` |

---

## 3. どのように実装するか（How）

### 3.1 実装手順

#### Step 1: PROGRESS_PHASES 定数を定義

```typescript
// SkillCreatorService.ts の先頭付近に追加
const PROGRESS_PHASES = {
  planning: {
    phase: "planning" as const,
    percentage: 10,
    message: "構造を計画しています",
  },
  generatingSkill: {
    phase: "generating-skill" as const,
    percentage: 40,
    message: "SKILL.md を生成しています",
  },
  generatingAgents: {
    phase: "generating-agents" as const,
    percentage: 70,
    message: "エージェント定義を生成しています",
  },
  validating: {
    phase: "validating" as const,
    percentage: 90,
    message: "スキルを検証しています",
  },
  done: {
    phase: "done" as const,
    percentage: 100,
    message: "完了しました",
  },
} as const;
```

#### Step 2: onProgress 呼び出しを定数参照に変更

```typescript
// Before
onProgress({
  phase: "planning",
  percentage: 10,
  message: "構造を計画しています",
});

// After
onProgress(PROGRESS_PHASES.planning);
```

#### Step 3: テスト期待値を定数参照に変更

```typescript
// Before
expect(captured[0]).toEqual({
  phase: "planning",
  percentage: 10,
  message: "構造を計画しています",
});

// After
expect(captured[0]).toEqual(PROGRESS_PHASES.planning);
// または PROGRESS_PHASES を export してテストから参照する
```

### 3.2 確認コマンド

```bash
# magic string の残存確認
grep -n '"planning"\|"generating-skill"\|"generating-agents"\|"validating"\|"done"' \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts

# テスト実行
pnpm --filter @repo/desktop test -- --run SkillCreatorService.progress

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 4. 受け入れ基準（Acceptance Criteria）

| AC番号 | 条件                                                                       | 検証方法           |
| ------ | -------------------------------------------------------------------------- | ------------------ |
| AC-1   | `PROGRESS_PHASES` 定数が定義されている                                     | コードレビュー     |
| AC-2   | `SkillCreatorService.ts` 内に phase/message の magic string が残っていない | grep で確認        |
| AC-3   | `SkillCreatorService.ts` 内に percentage の magic number が残っていない    | grep で確認        |
| AC-4   | 既存の progress テスト 14 個が全て PASS                                    | vitest run         |
| AC-5   | `pnpm typecheck`（desktop）が PASS                                         | typecheck コマンド |

---

## 5. 苦戦箇所と知見

### 5.1 テスト期待値の定数共有問題

**苦戦した点**: `PROGRESS_PHASES` を `SkillCreatorService.ts` 内部に定義すると、
テストファイルからのインポートが必要になるが、実装ファイルの内部実装をテストがインポートすることへの抵抗感があった。

**知見**: 以下の 2 択で判断する：

1. **定数を export する**: テストの期待値が「実装と同一定数を参照する」ため、実装変更とテスト変更が連動する（推奨）
2. **テストに期待値をハードコードする**: 実装変更時にテストが壊れることで変更を検知できる（オラクルとしての役割）

本タスクでは、magic string/number の除去が目的なので、`PROGRESS_PHASES` を export してテストが参照するパターンが適切。

### 5.2 `as const` と型推論

**知見**: `as const` アサーションを定数全体に付与することで、
`PROGRESS_PHASES.planning.phase` の型が `string` ではなく `"planning"` リテラル型に推論される。
これにより `SkillCreatorProgressPhase` 型との互換性チェックがコンパイル時に行われる。

---

## 関連リンク

- [TASK-SW-STREAM-001 仕様書](../completed-tasks/p01-par-STREAM-001/index.md)
- [SkillCreatorService.ts](../../../../apps/desktop/src/main/services/skill/SkillCreatorService.ts)
- [SkillCreatorService.progress.test.ts](../../../../apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.progress.test.ts)
