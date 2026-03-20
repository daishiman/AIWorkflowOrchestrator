# [#1371] "[UT-RAG-08-005] ILLMClient 型定義統一"

## メタ情報

```yaml
task_id: UT-RAG-08-005
task_name: ILLMClient 型定義統一
category: リファクタリング
target_feature: RAG/Embedding 抽出ランタイム - LLM クライアント型定義
priority: 中
scale: S（0.5〜1日）
status: 未実施
source_phase: step-04-par-task-08-rag-embedding-extraction-runtime Phase 12 未タスク検出
created_date: 2026-03-19
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-rag-08-005-illmclient-type-unification.md
```

| 項目       | 内容          |
| ---------- | ------------- |
| 優先度     | 中            |
| 規模       | S（0.5〜1日） |
| ステータス | 未実施        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`packages/shared/src/services/search/crag/types.ts` と `packages/shared/src/types/llm/types.ts` の2ファイルに、それぞれ `ILLMClient` という同名のインターフェースが定義されている。型名は同じだが、メソッドシグネチャが異なるため、DI（依存性注入）の文脈で両者を共用することができない。

親タスク（step-04-par-task-08）の実装中にこの乖離が発覚し、型エラーを回避するために `any` 型による回避策が採用された（UT-RAG-08-004 の課題にも繋がる）。

### 1.2 問題点・課題

**シグネチャ比較:**

```typescript
// crag/types.ts
interface ILLMClient {
  complete(options: {
    prompt: string;
    [key: string]: unknown;
  }): Promise<string>;
}

// llm/types.ts
interface ILLMClient {
  complete(prompt: string, options?: Record<string, unknown>): Promise<string>;
}
```

- 同名のため `grep` による発見が困難（L-RAG-06 教訓）
- `crag/` モジュールと `llm/` モジュール間で DI 配線時にのみ型不整合が顕在化する
- `hybrid-rag-engine.ts` で `any` 型を使用する根本原因になっている（L428, L442, L461）
- 将来的に LLM クライアントを追加・変更する際に、どちらのシグネチャに従うべきか不明確

### 1.3 放置した場合の影響

- UT-RAG-08-004（HybridRAGEngine any 型安全化）の前提条件が満たされない
- UT-RAG-08-002（HybridRAGFactory 実配線）で型エラーが発生しやすくなる
- `any` 型の使用が恒久化し、P19（型キャストによる実行時検証バイパス）違反が固定される
- 新規 LLM クライアント実装時にシグネチャ選択の混乱が生じる

## 2. 何を達成するか（What）

### 2.1 目的

`ILLMClient` インターフェースを単一の定義に統一し、`crag/` と `llm/` の両モジュールが同じインターフェースに依存できる状態にする。

### 2.2 最終ゴール

- `ILLMClient` インターフェースが `packages/shared` 内の1箇所にのみ定義される
- `crag/types.ts` と `llm/types.ts` は統一された定義をインポートして使用する
- 既存のすべての `ILLMClient` 利用箇所が型エラーなしにコンパイルできる

### 2.3 スコープ（含む / 含まない）

**含む:**

- `crag/types.ts` の `ILLMClient` 定義と `llm/types.ts` の `ILLMClient` 定義のシグネチャ比較・統一
- 統一された型定義を適切な場所（`packages/shared/src/types/llm/types.ts` または新規共有ファイル）に配置
- `crag/types.ts` から重複定義を削除し、統一定義へのインポートに置換
- 型変更に伴う既存コードの修正
- TypeScript コンパイルエラーがなくなることの確認

**含まない:**

- LLM クライアントの実装クラス自体の変更
- `any` 型の除去（UT-RAG-08-004 のスコープ）

### 2.4 成果物

- `packages/shared/src/types/llm/types.ts`（統一 `ILLMClient` 定義）
- `packages/shared/src/services/search/crag/types.ts`（重複定義削除、インポートに置換）
- 影響範囲の修正ファイル一覧（documentation として記録）

## 3. どのように実行するか（How）

### 3.1 前提条件

- `packages/shared` の TypeScript コンパイルが現状で通っていること（または通っていない場合は状況を把握していること）

### 3.2 依存タスク

なし（本タスクは独立して実施可能）

### 3.3 必要な知識

- TypeScript インターフェース設計
- P23（API 二重定義の型管理複雑性）
- P32（型定義の二箇所同時更新必須）
- P44（IPC インターフェース不整合）— シグネチャ乖離の検出パターン

### 3.4 推奨アプローチ

1. 両ファイルの `ILLMClient` 定義を読み、シグネチャを比較する
2. 利用箇所を `grep` で特定する:
   ```bash
   grep -rn "ILLMClient" packages/shared/src/ --include="*.ts"
   ```
3. 統一シグネチャを決定する（後方互換性と利用頻度を考慮）
4. `packages/shared/src/types/llm/types.ts` に統一定義を配置する
5. `crag/types.ts` の重複定義を削除し、`llm/types.ts` からインポートするように変更する
6. コンパイルエラー箇所を修正する
7. 全テストが PASS することを確認する

### 3.5 実装課題と解決策（親タスクからの教訓）

**L-RAG-06: 同名異シグネチャの型が grep では発見しにくい**

- **問題**: `grep -rn "ILLMClient"` を実行すると型名の使用箇所は見つかるが、「どのファイルの型が使われているか」は型定義ファイルを直接読まないと判別できない。DI 配線時にのみ型不整合が顕在化するため、実装完了まで問題に気づかないことがある
- **解決策**:
  1. まず型定義ファイル（`types.ts`）を直接確認してシグネチャを比較する
  2. 統一後は `crag/types.ts` に同名型を定義せず、必ずインポートを使用する
  3. インポート元を確認するコマンドを検証に含める:
     ```bash
     grep -rn "from.*crag/types" packages/shared/src/ | grep "ILLMClient"
     grep -rn "from.*llm/types" packages/shared/src/ | grep "ILLMClient"
     ```

**P23（API 二重定義）・P32（二箇所同時更新）対策**:

- シグネチャ統一の際は、両ファイルを同時に（1コミットで）変更する
- 変更後は `pnpm --filter @repo/shared typecheck` で型整合性を検証する

**シグネチャ統一方針の判断基準**:

- `complete(options: { prompt: string; ... })` はオプション拡張が容易
- `complete(prompt: string, options?)` は呼び出しがシンプル
- 既存の実装クラス・呼び出し箇所の多数派に合わせることを推奨
- 変更量が少ない方を統一先とすることで手戻りリスクを下げる

## 4. 実行手順（Phase構成）

### Phase 1: 現状把握

- [ ] `crag/types.ts` の `ILLMClient` シグネチャを確認する
- [ ] `llm/types.ts` の `ILLMClient` シグネチャを確認する
- [ ] `grep -rn "ILLMClient"` で全利用箇所を特定し、各箇所がどちらの型を使用しているか確認する

### Phase 2: 統一方針決定

- [ ] 利用箇所の多数派シグネチャを統一先として選定する
- [ ] 変更が必要なファイルのリストを作成する

### Phase 3: 型定義統一

- [ ] `llm/types.ts` の `ILLMClient` を統一シグネチャに更新する（または現状維持）
- [ ] `crag/types.ts` の `ILLMClient` 定義を削除し、`llm/types.ts` からインポートする

### Phase 4: 影響範囲修正

- [ ] コンパイルエラー箇所を修正する
- [ ] `pnpm --filter @repo/shared typecheck` が PASS することを確認する

### Phase 5: テスト確認

- [ ] `pnpm --filter @repo/shared test` が PASS することを確認する

## 5. 完了条件チェックリスト

- [ ] `ILLMClient` の定義が `packages/shared` 内で1箇所のみになっている
- [ ] `crag/types.ts` に `ILLMClient` の定義が存在せず、インポートのみになっている
- [ ] `pnpm --filter @repo/shared typecheck` が PASS する
- [ ] `pnpm --filter @repo/shared test` が PASS する
- [ ] 変更ファイル一覧が備考セクションに記録されている

## 6. 検証方法

```bash
# 型チェック
pnpm --filter @repo/shared typecheck

# ILLMClient の定義箇所確認（1箇所のみであること）
grep -rn "interface ILLMClient" packages/shared/src/ --include="*.ts"

# 利用箇所確認（インポート元が統一されていること）
grep -rn "ILLMClient" packages/shared/src/ --include="*.ts"

# テスト実行
pnpm --filter @repo/shared test
```

## 7. リスクと対策

| リスク                                     | 影響度 | 対策                                                              |
| ------------------------------------------ | ------ | ----------------------------------------------------------------- |
| シグネチャ変更によるコンパイルエラー多発   | 中     | Phase 1 で変更量を事前見積もりし、多い場合は段階移行を検討        |
| テストのモック型が変更対象シグネチャに依存 | 中     | テストファイルも含めて全利用箇所を Phase 1 で特定する             |
| crag/ モジュールの外部利用者への影響       | 低     | `packages/shared` 内部のみの変更であるため、外部 API に影響しない |

## 8. 参照情報

### 関連ドキュメント

- `packages/shared/src/services/search/crag/types.ts`
- `packages/shared/src/types/llm/types.ts`
- `.claude/rules/06-known-pitfalls.md#P23`（API 二重定義の型管理複雑性）
- `.claude/rules/06-known-pitfalls.md#P32`（型定義の二箇所同時更新必須）
- `.claude/rules/06-known-pitfalls.md#P44`（IPC インターフェース不整合）
- `docs/30-workflows/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/phase-12-documentation.md`

### 関連タスク

| タスクID      | 関係                                           |
| ------------- | ---------------------------------------------- |
| UT-RAG-08-004 | HybridRAGEngine any 型安全化（本タスクの後続） |
| UT-RAG-08-002 | HybridRAGFactory 実配線（本タスクの後続）      |

## 9. 備考

- 本タスクは「型の整理」のみで実装変更を伴わないため、工数は小さい（S規模）
- 実施順序の推奨: UT-RAG-08-005 → UT-RAG-08-004 → UT-RAG-08-002
- 変更完了後に変更したファイルの一覧をここに追記すること
