# SkillExecutor ローカル型定義削除 - タスク指示書

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | TASK-FIX-1-2-SKILLEXECUTOR-TYPE-CLEANUP   |
| タスク名     | SkillExecutor内の重複型定義を共有型に統一 |
| 分類         | リファクタリング                          |
| 対象機能     | SkillExecutor 型定義                      |
| 優先度       | 高                                        |
| 見積もり規模 | 小規模                                    |
| ステータス   | 未実施                                    |
| 実行順序     | 01a（並列可能 — 即時着手）                |
| 発見元       | skill-system-conflict-report #1           |
| 発見日       | 2026-02-05                                |
| 関連Phase    | Phase 1（E2E接続）                        |
| 関連Issue    | Issue #622, TASK-7D                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-1-1-TYPE-ALIGNMENT は「完了」とされているが、`SkillExecutor.ts` L25-120 に6つのローカル型定義が残存しており、`@repo/shared/src/types/skill.ts` の正本型と重複している。コメント（L27）に `// @repo/shared の型と競合を避けるためローカルに定義` と記載されているが、shared 側の型が正本として確定した現在、このローカル定義は不要。

### 1.2 問題点・課題

| ローカル型                | SkillExecutor.ts | shared/types/skill.ts | 差異                                         |
| ------------------------- | ---------------- | --------------------- | -------------------------------------------- |
| `SkillStreamMessage`      | L93-108          | L446-466              | type値が異なる（旧: text/complete/retry）    |
| `SkillExecutionRequest`   | L67-74           | L310-319              | フィールド名が異なる（skillId vs skillName） |
| `SkillExecutionResponse`  | L77-81           | L324-333              | `error?: SkillExecutionError` vs `string`    |
| `ExecutionState`          | L31-36           | L519-524              | 値は同一だが定義が重複                       |
| `ExecutionInfo`           | L84-90           | L529-544              | フィールド同一だが定義が重複                 |
| `SkillExecutionErrorCode` | L110-120         | L549-558              | 値は同一だが定義が重複                       |

### 1.3 放置した場合の影響

- 型変更時に2箇所の修正が必要（漏れリスク）
- `SkillStreamMessage` の type 値不一致で Renderer 側のメッセージ処理が破綻
- `SkillExecutionRequest` の `skillId` vs `skillName` 不一致が Issue #5 の根本原因
- 開発者の混乱

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillExecutor.ts` のローカル型定義を全て削除し、`@repo/shared` の型を使用する。

### 2.2 最終ゴール

1. `SkillExecutor.ts` L25-120 のローカル型定義が全て削除
2. `@repo/shared/src/types/skill.ts` からの import に置き換え
3. SkillExecutor 内部のコードが shared 型に準拠

### 2.3 スコープ

#### 含むもの

- ローカル型定義の削除
- import 文の追加・修正
- 型差異に伴うコード修正（`skillId` → `skillName` 等）
- 影響箇所のテスト修正

#### 含まないもの

- shared 側の型定義変更
- SkillExecutor のロジック変更

### 2.4 成果物

| 成果物                      | 説明                         |
| --------------------------- | ---------------------------- |
| 修正された SkillExecutor.ts | ローカル型削除、shared型使用 |
| 修正されたテストファイル    | 型変更に伴うテスト修正       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-1-1-TYPE-ALIGNMENT 完了（完了済み）

### 3.2 依存タスク

- なし（TASK-FIX-1-1 は完了済み）

### 3.3 必要な知識

- TypeScript 型定義
- `@repo/shared` パッケージの型構造

### 3.4 推奨アプローチ

1. 6つのローカル型を1つずつ shared 型に置き換え
2. 差異がある型（SkillStreamMessage, SkillExecutionRequest, SkillExecutionResponse）は SkillExecutor 側のコードを修正
3. 差異がない型（ExecutionState, ExecutionInfo, SkillExecutionErrorCode）は単純に削除して import

---

## 4. 実行手順

### Step 1: 差異のない型の削除（3型）

#### 手順

1. `ExecutionState`, `ExecutionInfo`, `SkillExecutionErrorCode` をローカルから削除
2. `@repo/shared` から import
3. テスト実行

### Step 2: 差異のある型の移行（3型）

#### 手順

1. `SkillStreamMessage`: type 値を shared 側（`"assistant"`, `"tool_use"`, `"tool_result"`, `"status"`, `"error"`）に統一。SkillExecutor 内の旧 type 値使用箇所を修正
2. `SkillExecutionRequest`: `skillId` → `skillName` に変更。呼び出し元も修正
3. `SkillExecutionResponse`: `error` フィールドの型を shared に合わせる

### Step 3: 影響箇所の修正

#### 手順

1. `setupSkillListeners.ts` L25 の `as (message: unknown) => void` キャストが不要になるか確認
2. テスト実行・修正

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillExecutor.ts` L25-120 のローカル型定義が全て削除
- [ ] 全て `@repo/shared` の型を使用
- [ ] SkillExecutor 内部のコードが shared 型に準拠

### 品質要件

- [ ] 全テストが PASS
- [ ] 型安全性が確保（`as any`, `as unknown` の増加なし）

---

## 6. 検証方法

### テストケース

1. TypeScript コンパイルが通る（型エラーなし）
2. SkillExecutor の既存テストが PASS
3. `setupSkillListeners.ts` のキャストが解消または維持の判断

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                    |
| ------------------------------------ | ------ | -------- | --------------------------------------- |
| type 値変更で実行時の分岐が壊れる    | 高     | 中       | SkillStreamMessage の switch 文を全確認 |
| skillId → skillName で呼び出し元破壊 | 高     | 中       | grep で全参照箇所を特定してから修正     |

---

## 8. 参照情報

### 関連ドキュメント

- `packages/shared/src/types/skill.ts`
- `apps/desktop/src/main/services/skill/SkillExecutor.ts` L25-120
- `apps/desktop/src/renderer/store/slices/setupSkillListeners.ts` L25

### 関連タスク

- TASK-FIX-1-1-TYPE-ALIGNMENT（完了済み・本タスクはその残存対応）
- Issue #622（SkillStreamMessage 統合）

---

## 9. 備考

### TASK-FIX-1-1 との関係

TASK-FIX-1-1 は「完了」ステータスだが、SkillExecutor 内のローカル型が残存している。TASK-FIX-1-1 のスコープが `@repo/shared` 側の型定義に限定されており、SkillExecutor 側の消費者コードの移行が含まれていなかった可能性がある。本タスクはその残作業を完了させるもの。
