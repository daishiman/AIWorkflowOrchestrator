# [#1369] "[UT-RAG-08-003] Embedding 仕様差分 SD-E01〜07 の仕様書更新"

## メタ情報

```yaml
task_id: UT-RAG-08-003
task_name: Embedding 仕様差分 SD-E01〜07 の仕様書更新
category: 仕様更新
target_feature: rag-embedding-extraction-runtime
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 10 最終レビュー（task-08 RAG Embedding）
created_date: 2026-03-19
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-rag-08-003-embedding-spec-sync.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

task-08（RAG Embedding Extraction Runtime）の実装フェーズ（Phase 5）において、
既存仕様書に記載されていたスペックと実際の実装の間に複数の差分が生じた。

L-RAG-04 の原則「実装先行時は仕様書を実装に合わせる」（P50 チェックで発見）に従い、
仕様書側を実装の実態に合わせて更新する必要がある。

### 1.2 問題点・課題（SD-E01〜07）

以下の7つの仕様差分が検出された:

| 差分ID | 対象               | 仕様書の記述          | 実装の実態                      |
| ------ | ------------------ | --------------------- | ------------------------------- |
| SD-E01 | 割り当て           | EMB-001 = OpenAI      | EMB-001 = Qwen3                 |
| SD-E02 | 割り当て           | EMB-002 = Qwen3       | EMB-002 = OpenAI                |
| SD-E03 | OpenAI 次元数      | 1536                  | 3072                            |
| SD-E04 | Qwen3 次元数       | 768                   | 4096                            |
| SD-E05 | PipelineOutput     | フィールド欠落        | `embeddingDim`フィールドあり    |
| SD-E06 | embed() シグネチャ | `text: string`        | `input: string \| string[]`     |
| SD-E07 | Provider列挙型     | `"openai" \| "qwen3"` | `"openai" \| "qwen3-embedding"` |

### 1.3 放置した場合の影響

**短期的影響**:

- 仕様書を参照した開発者が誤った次元数・割り当てで実装し、ベクトル検索が失敗する
- 型定義の仕様書とコードの乖離がテストの偽陽性を生む

**中長期的影響**:

- 仕様ドリフトが蓄積し、将来の HybridRAGFactory 配線時に根本的な混乱を招く
- SD-E06 のシグネチャ差分は embedBatch() との境界を曖昧にし、API 破壊変更のリスクを高める

**影響度**: 中（仕様書ドリフトによるチーム認知コスト増大）

---

## 2. 何を達成するか（What）

### 2.1 目的

SD-E01〜SD-E07 の7差分を仕様書側で修正し、実装と仕様の整合性を回復する。

### 2.2 最終ゴール

- 3つの対象仕様書が実装の実態を正確に反映している
- 次元数・Provider列挙型・API シグネチャが一貫している
- topic-map.md が再生成されている

### 2.3 スコープ

#### 含むもの

- `llm-embedding.md` の Provider 割り当て・次元数更新（SD-E01〜E04）
- `interfaces-rag-chunk-embedding.md` の PipelineOutput フィールド追加（SD-E05）
- `api-internal-embedding.md` の embed() シグネチャ・Provider列挙型更新（SD-E06、SD-E07）
- topic-map.md の再生成

#### 含まないもの

- 実装コードの変更（仕様書の更新のみ）
- SD-E01〜07 以外の差分修正
- embedBatch() の設計変更

### 2.4 成果物

1. 更新済み `llm-embedding.md`
2. 更新済み `interfaces-rag-chunk-embedding.md`
3. 更新済み `api-internal-embedding.md`
4. 再生成済み `indexes/topic-map.md`

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] task-08 Phase 5（実装）が完了している
- [ ] 実装コードの実際の次元数・シグネチャが確定している
- [ ] 対象仕様書ファイルの現在の記述を Read で確認済み

### 3.2 依存タスク

- task-08（RAG Embedding Extraction Runtime）の Phase 5 完了が前提

### 3.3 必要な知識・スキル

- aiworkflow-requirements スキルによる仕様書参照
- Markdown テーブル・コードブロック編集
- generate-index.js スクリプトの実行方法

### 3.4 推奨アプローチ

1. 対象仕様書を Read で読み込み、差分箇所を特定する
2. SD-E01〜E04: Provider 割り当てテーブルと次元数を修正
3. SD-E05: PipelineOutput 型定義に `embeddingDim: number` フィールドを追加
4. SD-E06: embed() のシグネチャを `input: string | string[]` に統一
5. SD-E07: Provider 列挙型の `"qwen3"` を `"qwen3-embedding"` に修正
6. node scripts/generate-index.js で topic-map.md を再生成

### 3.5 苦戦ポイント

**L-RAG-04 原則の適用判断**（P50 チェックで発見されたパターン）:

実装先行時は仕様書を実装に合わせるのが原則だが、SD-E01/E02（割り当て逆転）は
「単純なミスか、意図的な設計変更か」の判断が必要。

対応方針: 実装コードの Provider ファクトリーを `grep` で確認し、
実際にどちらの列挙値がどの Provider クラスに対応しているかを検証してから更新する。

**SD-E06 のシグネチャ変更に伴う後方互換性**:

`text: string` → `input: string | string[]` はインターフェース変更になるため、
既存の呼び出し元を `grep` で確認し、破壊的変更がないかを確認すること。

---

## 4. Phase 構成

```
Phase 1: 現状確認（Read による差分箇所の特定）
Phase 2: llm-embedding.md 更新（SD-E01〜E04）
Phase 3: interfaces-rag-chunk-embedding.md 更新（SD-E05）
Phase 4: api-internal-embedding.md 更新（SD-E06、SD-E07）
Phase 5: topic-map.md 再生成
Phase 6: 整合性確認
```

### Phase 1: 現状確認

**目的**: 差分箇所を特定し、更新内容を確定する

**実行手順**:

```bash
grep -n "EMB-001\|EMB-002\|1536\|768\|embed(" \
  .claude/skills/aiworkflow-requirements/references/llm-embedding.md

grep -n "embeddingDim\|PipelineOutput" \
  .claude/skills/aiworkflow-requirements/references/interfaces-rag-chunk-embedding.md

grep -n "embed(\|qwen3\|openai" \
  .claude/skills/aiworkflow-requirements/references/api-internal-embedding.md
```

**完了条件**:

- [ ] 7差分の対象行番号が特定されている

### Phase 2: llm-embedding.md 更新

**目的**: SD-E01〜E04 を修正する

**更新内容**:

| 箇所          | 変更前 | 変更後          |
| ------------- | ------ | --------------- |
| EMB-001       | OpenAI | Qwen3-Embedding |
| EMB-002       | Qwen3  | OpenAI          |
| OpenAI 次元数 | 1536   | 3072            |
| Qwen3 次元数  | 768    | 4096            |

**完了条件**:

- [ ] Provider 割り当てが実装コードと一致する
- [ ] 次元数が実装コードと一致する

### Phase 3: interfaces-rag-chunk-embedding.md 更新

**目的**: SD-E05 を修正する（PipelineOutput フィールド追加）

**更新内容**:

```typescript
// 追加するフィールド
interface PipelineOutput {
  // ... 既存フィールド ...
  embeddingDim: number; // SD-E05: 追加
}
```

**完了条件**:

- [ ] `embeddingDim` フィールドが PipelineOutput に追加されている

### Phase 4: api-internal-embedding.md 更新

**目的**: SD-E06、SD-E07 を修正する

**更新内容**:

- embed() シグネチャ: `text: string` → `input: string | string[]`
- Provider 列挙型: `"qwen3"` → `"qwen3-embedding"`

**完了条件**:

- [ ] embed() シグネチャが更新されている
- [ ] Provider 列挙型が更新されている

### Phase 5: topic-map.md 再生成

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

**完了条件**:

- [ ] `indexes/topic-map.md` が再生成されている
- [ ] `indexes/keywords.json` が更新されている

---

## 5. 完了条件チェックリスト

### 仕様更新要件

- [ ] SD-E01: EMB-001 割り当てが Qwen3-Embedding に更新されている
- [ ] SD-E02: EMB-002 割り当てが OpenAI に更新されている
- [ ] SD-E03: OpenAI 次元数が 3072 に更新されている
- [ ] SD-E04: Qwen3 次元数が 4096 に更新されている
- [ ] SD-E05: PipelineOutput に `embeddingDim` フィールドが追加されている
- [ ] SD-E06: embed() シグネチャが `input: string | string[]` に更新されている
- [ ] SD-E07: Provider 列挙型が `"qwen3-embedding"` に更新されている

### インデックス更新要件

- [ ] topic-map.md が再生成されている
- [ ] keywords.json が更新されている

### 整合性確認要件

- [ ] 実装コードと仕様書の Provider 割り当てが一致している
- [ ] 実装コードと仕様書の次元数が一致している

---

## 6. 検証方法

### 検証コマンド

```bash
# SD-E03/E04 次元数確認
grep -rn "3072\|4096" apps/desktop/src/ packages/shared/src/

# SD-E07 Provider 列挙型確認
grep -rn "qwen3-embedding\|\"qwen3\"" apps/desktop/src/ packages/shared/src/

# インデックス再生成確認
git diff --stat -- .claude/skills/aiworkflow-requirements/indexes/
```

### 検証テーブル

| 検証ID | 確認内容                    | 期待結果                      |
| ------ | --------------------------- | ----------------------------- |
| V-01   | llm-embedding.md の割り当て | EMB-001=Qwen3, EMB-002=OpenAI |
| V-02   | OpenAI 次元数               | 3072                          |
| V-03   | Qwen3 次元数                | 4096                          |
| V-04   | PipelineOutput 型定義       | embeddingDim フィールドあり   |
| V-05   | embed() シグネチャ          | input: string \| string[]     |
| V-06   | Provider 列挙型             | "qwen3-embedding" を含む      |
| V-07   | topic-map.md 更新日時       | 現在日時                      |

---

## 7. リスクと対策

| リスク                              | 影響度 | 発生確率 | 対策                                        |
| ----------------------------------- | ------ | -------- | ------------------------------------------- |
| SD-E01/E02 が意図的な設計変更だった | 高     | 低       | 実装コードの Provider ファクトリーで確認    |
| embed() シグネチャ変更が破壊的      | 中     | 中       | grep で呼び出し元を事前確認                 |
| 他の仕様書に波及する差分がある      | 中     | 低       | 更新後に aiworkflow-requirements で横断検索 |

---

## 8. 参照情報

- 発見元タスク: step-04-par-task-08-rag-embedding-extraction-runtime
- 関連仕様書:
  - `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`
  - `.claude/skills/aiworkflow-requirements/references/interfaces-rag-chunk-embedding.md`
  - `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`
- 関連パターン: L-RAG-04（実装先行時の仕様書更新原則）、P50（既実装防御の発見）

---

## 9. 備考

- このタスクは純粋な仕様書更新であり、プロダクションコードの変更は不要
- 更新後は .claude/skills/ と .agents/skills/ の mirror sync も実施すること（MEMORY.md §3 参照）
- SD-E01/E02 の割り当て逆転は、実装前の設計変更が仕様書に反映されなかったことが原因と推測
