# Main Process DI 組み立て責務設計 - タスク指示書

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | UT-RAG-08-012                                   |
| タスク名     | Main Process DI 組み立て責務設計                |
| 分類         | 設計                                            |
| 対象機能     | rag-embedding-extraction-runtime / Main Process |
| 優先度       | 中                                              |
| 見積もり規模 | 小規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 3 設計レビュー MINOR 指摘（M-06）         |
| 発見日       | 2026-03-19                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-08 Phase 3（設計レビュー）において、Embedding Provider の注入タイミングと
DI 組み立て責務が Main Process の startup sequence で未定義と指摘された（M-06）。

現在の設計では `EmbeddingProviderFactory` をどこで初期化し、
`aiHandlers.ts` にいつ・どのように注入するかが明示されていない。

また、L-RAG-06 が指摘する「`ILLMClient` 型と実際の Provider インターフェースの乖離」が
DI 組み立て設計と交差しており、型安全な注入経路の設計が必要。

### 1.2 問題点・課題

**M-06: provider 注入タイミングが未定義**

Main Process の startup sequence において:

1. `EmbeddingProviderFactory` の初期化タイミングが未定義
2. どのモジュールが Factory を所有するかが未定義
3. `ILLMClient` と `IEmbeddingProvider` の型境界が曖昧
4. BrowserWindow 生成後に注入が必要な依存がある場合（P34 パターン）の対処が未定義

**L-RAG-06: `ILLMClient` 型乖離との交差**

- `ILLMClient` は LLM（テキスト生成）用の型定義
- `IEmbeddingProvider` は Embedding（ベクトル化）用の型定義
- 現状の設計では両者が混在している可能性があり、DI 注入経路が不明確

### 1.3 放置した場合の影響

**短期的影響**:

- HybridRAGFactory の実配線タスクで DI 組み立て方法が未定義のため、
  アドホックな実装が入り込む
- P61（DIP 違反が Phase 10 まで検出されない）と同じパターンで後戻りが発生する

**中長期的影響**:

- Main Process の startup sequence が肥大化し、
  「どこで何を初期化するか」の認知コストが増大する
- テスト時の DI 差し替えが困難になる（P35 参照）

**影響度**: 中（HybridRAGFactory 配線時のアーキテクチャ品質に直接影響）

---

## 2. 何を達成するか（What）

### 2.1 目的

Main Process の startup sequence における DI 組み立て責務を設計し、
`EmbeddingProviderFactory` の初期化・注入タイミングを明確にする。

### 2.2 最終ゴール

- Main Process startup sequence の DI 組み立て設計図が存在する
- `ILLMClient` と `IEmbeddingProvider` の型境界が明確に定義されている
- P34（Setter Injection）パターンの適用判断が文書化されている
- `aiHandlers.ts` の DI 注入ポイントが明確になっている

### 2.3 スコープ

#### 含むもの

- Main Process startup sequence の DI 組み立て設計ドキュメント作成
- `ILLMClient` と `IEmbeddingProvider` の型境界整理
- P34（Setter Injection vs Constructor Injection）の適用判断
- `aiHandlers.ts` への設計コメント追加

#### 含まないもの

- 実際の DI コードの実装
- `ILLMClient` 型定義の変更（別タスク、L-RAG-06 対応）
- EmbeddingProviderFactory の実装変更

### 2.4 成果物

1. DI 設計ドキュメント: `outputs/phase-2/di-assembly-design.md`
2. `aiHandlers.ts` への設計コメント追加
3. 関連仕様書（phase-2-design.md）への更新リンク追加

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] Main Process の startup sequence（`main.ts` または `index.ts`）の現在の構造を Read で確認済み
- [ ] `EmbeddingProviderFactory` の現在のコンストラクタ引数を確認済み
- [ ] P34（Setter Injection パターン）の知識がある
- [ ] `ILLMClient` の型定義を確認済み

### 3.2 依存タスク

- UT-RAG-08-010（AI_INDEX 排他制御設計）と並行設計が可能
- HybridRAGFactory 実装タスク（実配線のトリガー）

### 3.3 必要な知識・スキル

- Electron Main Process の lifecycle 設計
- DI パターン（Constructor Injection / Setter Injection / Factory Pattern）
- P34（遅延初期化が必要な依存の DI パターン選択）
- TypeScript インターフェース設計

### 3.4 推奨アプローチ

**Step 1: 現状調査**

Main Process の startup sequence を調査し、既存の DI 組み立てパターンを把握する。

```bash
# Main Process の初期化フローを確認
grep -n "new\|register\|create\|Factory\|Provider" \
  apps/desktop/src/main/main.ts

# EmbeddingProviderFactory の現在の定義
grep -rn "EmbeddingProviderFactory\|IEmbeddingProvider" \
  apps/desktop/src/main/ packages/shared/src/
```

**Step 2: DI 組み立て設計の決定**

P34 の判断基準に従い、以下を決定する:

| 依存オブジェクト          | 注入方式              | 理由                                      |
| ------------------------- | --------------------- | ----------------------------------------- |
| EmbeddingProviderFactory  | Constructor Injection | BrowserWindow 生成前に準備可能            |
| EmbeddingProvider（具体） | Setter Injection      | Provider 選択がユーザー設定に依存する場合 |
| aiHandlers の service     | Constructor Injection | startup 時に確定可能                      |

**Step 3: ILLMClient vs IEmbeddingProvider の型境界整理**

```
ILLMClient        → テキスト生成（chat / completion）用
IEmbeddingProvider → ベクトル化（embed）用

DI 組み立て時に両インターフェースを混在させない。
```

### 3.5 苦戦ポイント

**L-RAG-02 + L-RAG-06 の交差**:

AI_INDEX が not-in-scope の状態では、`aiHandlers.ts` に注入するサービスが
どの Provider インターフェースを必要とするかが確定しない。

対応方針: DI 設計では「プレースホルダー注入ポイント」を定義し、
実配線タスクで具体的な型を差し込めるように設計する。

具体的には、`registerAIHandlers(deps: AIHandlerDependencies)` のような
依存オブジェクトのバンドル型を先行定義し、型シグネチャを固定することで
実装時の認知コストを下げる。

**P34 Setter Injection 選択時の gotcha**:

EmbeddingProvider がユーザー設定（どの Provider を使うか）に依存する場合、
Setter Injection が必要になるが、この場合 `null` チェックが至る所に必要になる。
設計時に「未設定時の fallback 動作」を決定しておくこと。

---

## 4. Phase 構成

```
Phase 1: 現状調査（Main Process startup sequence の把握）
Phase 2: ILLMClient / IEmbeddingProvider 型境界整理
Phase 3: DI 組み立て設計図の作成
Phase 4: AIHandlerDependencies 型シグネチャ設計
Phase 5: 設計ドキュメント作成 + コメント追加
```

### Phase 1: 現状調査

**実行コマンド**:

```bash
grep -n "new\|register\|Factory\|Provider\|handler" \
  apps/desktop/src/main/main.ts | head -50

find apps/desktop/src/main -name "*.ts" | xargs grep -l "EmbeddingProvider\|ILLMClient"
```

**完了条件**:

- [ ] Main Process の startup sequence の現在の DI パターンを把握している
- [ ] EmbeddingProviderFactory の依存関係を特定している

### Phase 2: 型境界整理

**成果物**（設計ドキュメント内のセクション）:

```typescript
// DI 型境界の明示
interface AIHandlerDependencies {
  embeddingProvider: IEmbeddingProvider; // NOT ILLMClient
  // llmClient: ILLMClient;  // AI_INDEX には不要
}
```

**完了条件**:

- [ ] `ILLMClient` と `IEmbeddingProvider` の使用箇所が整理されている

### Phase 3: DI 組み立て設計図

DI シーケンス図（テキスト形式）:

```
app-ready
  └── initializeProviders()
        ├── new EmbeddingProviderFactory(config)  [Constructor Injection]
        └── factory.create(providerName)
              └── embeddingProvider

BrowserWindow-ready
  └── registerHandlers(deps)
        └── registerAIHandlers({ embeddingProvider })  [Setter Injection]
```

**完了条件**:

- [ ] 初期化シーケンスが文書化されている
- [ ] P34 の適用判断が記録されている

### Phase 4: AIHandlerDependencies 型シグネチャ設計

`aiHandlers.ts` に追加する型定義案:

```typescript
// TODO(UT-RAG-08-012): DI 組み立て設計に基づく型定義
// 実配線は HybridRAGFactory 完成後のタスクで行う
export interface AIHandlerDependencies {
  embeddingProvider: IEmbeddingProvider;
}
```

**完了条件**:

- [ ] `AIHandlerDependencies` 型が設計ドキュメントに定義されている

### Phase 5: 設計ドキュメント作成 + コメント追加

**完了条件**:

- [ ] `di-assembly-design.md` が作成されている
- [ ] `aiHandlers.ts` に設計コメントが追加されている

---

## 5. 完了条件チェックリスト

- [ ] DI 組み立て設計ドキュメントが作成されている
- [ ] `ILLMClient` と `IEmbeddingProvider` の型境界が整理されている
- [ ] EmbeddingProviderFactory の注入タイミングが決定・文書化されている
- [ ] P34（Setter vs Constructor Injection）の適用判断が記録されている
- [ ] `AIHandlerDependencies` 型シグネチャが設計されている
- [ ] `aiHandlers.ts` に TODO コメントが追加されている
- [ ] HybridRAGFactory 実装時の DI 再評価ポイントが明記されている

---

## 6. 検証方法

### 検証テーブル

| 確認項目                     | 期待結果                                         |
| ---------------------------- | ------------------------------------------------ |
| di-assembly-design.md の存在 | ファイルが outputs/phase-2/ 配下に作成されている |
| 型境界の整理                 | ILLMClient と IEmbeddingProvider が明確に分離    |
| P34 適用判断の記録           | Constructor / Setter Injection の選択理由が記載  |
| aiHandlers.ts コメント       | UT-RAG-08-012 を参照する TODO が存在する         |
| AIHandlerDependencies 型     | 設計ドキュメントに型シグネチャが定義されている   |

---

## 7. リスクと対策

| リスク                                        | 影響度 | 発生確率 | 対策                                           |
| --------------------------------------------- | ------ | -------- | ---------------------------------------------- |
| HybridRAGFactory の設計変更で DI 設計が陳腐化 | 中     | 中       | 設計を「プレースホルダー」として柔軟に記述する |
| P35 の大規模テスト修正が発生                  | 中     | 中       | DI 設計時にテストの差し替え容易性を評価する    |
| ILLMClient 型変更との競合                     | 低     | 低       | L-RAG-06 タスクとの調整を明示する              |
| Setter Injection で null アクセスが発生       | 高     | 低       | 未設定時の fallback 動作を設計段階で決定       |

---

## 8. 参照情報

- 発見元: Phase 3 設計レビューレポート（task-08）
- 関連パターン:
  - P34（遅延初期化が必要な依存の DI パターン選択）
  - P35（DI 追加時のテストモック大規模修正）
  - P61（DIP 違反が Phase 10 まで検出されない）
- 関連制約:
  - L-RAG-02（AI_INDEX が not-in-scope）
  - L-RAG-06（ILLMClient 型乖離）
- 対象ファイル:
  - `apps/desktop/src/main/main.ts`（または `apps/desktop/src/main/index.ts`）
  - `apps/desktop/src/main/handlers/aiHandlers.ts`

---

## 9. 備考

- このタスクは「設計と型シグネチャ定義」のみ。実際の DI 配線は HybridRAGFactory 完成後に行う
- `AIHandlerDependencies` 型はプロダクションコードに追加してよい（型定義のみ、実装なし）
- P57 の教訓（設計タスクでも Phase 12 のシステム仕様書更新を先送りしない）に従い、
  このタスク完了時に関連仕様書を実際に更新すること
- L-RAG-06（ILLMClient 型乖離）が別タスクで解決された場合、本タスクの設計を再評価すること
