# 追加埋め込みプロバイダー実装 - タスク指示書

## メタ情報

| 項目         | 内容                          |
| ------------ | ----------------------------- |
| タスクID     | UNASSIGNED-EMB-004            |
| タスク名     | 追加埋め込みプロバイダー実装  |
| 分類         | 要件                          |
| 対象機能     | embedding-generation-pipeline |
| 優先度       | 中                            |
| 見積もり規模 | 中規模                        |
| ステータス   | 未実施                        |
| 発見元       | Phase 8: 手動テスト検証       |
| 発見日       | 2025-12-26                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 8の手動テスト実施時に、異なるユースケースへの対応が課題として認識された。

現在のシステムはOpenAI（汎用）とQwen3（軽量）の2プロバイダーをサポートしているが、以下のニーズに対応できていない。

### 1.2 問題点・課題

**ユースケース1: コード検索の精度不足**

- 問題: OpenAIの汎用埋め込みはコード検索で精度が低い場合がある
- ニーズ: コード検索に特化したプロバイダーが必要

**ユースケース2: プライバシー要件**

- 問題: 外部APIへのデータ送信が許可されない環境
- ニーズ: セルフホスト可能なプロバイダーが必要

**ユースケース3: オフライン環境・コスト削減**

- 問題: インターネット接続がない、またはAPIコストを抑えたい
- ニーズ: 完全オフラインで動作するプロバイダーが必要

### 1.3 放置した場合の影響

**短期的影響**:

- コード検索の精度が限定的
- プライバシー重視環境での利用不可
- オフライン環境での利用不可

**中長期的影響**:

- ユースケースの制限
- 市場機会の損失
- APIコストの増加

**影響度**: 中（機能拡張による価値向上）

---

## 2. 何を達成するか（What）

### 2.1 目的

Voyage AI、BGE-M3、EmbeddingGemmaの3つの埋め込みプロバイダーを追加実装し、ユースケースに応じた最適なプロバイダー選択を可能にする。

### 2.2 最終ゴール

- 合計5つのプロバイダーから選択可能（OpenAI, Qwen3, Voyage, BGE-M3, Gemma）
- 各ユースケースに最適なプロバイダーの推奨ガイド提供
- すべてのプロバイダーが同じインターフェースで動作

### 2.3 スコープ

#### 含むもの

- ✅ Voyage AIプロバイダー実装
- ✅ BGE-M3プロバイダー実装（セルフホスト）
- ✅ EmbeddingGemmaプロバイダー実装（オンデバイス）
- ✅ ProviderName型の拡張
- ✅ EmbeddingProviderFactoryの更新
- ✅ 各プロバイダーのテスト
- ✅ プロバイダー選択ガイドの作成

#### 含まないもの

- ❌ Cohere, HuggingFace等の他プロバイダー
- ❌ カスタムプロバイダーのプラグイン機構
- ❌ プロバイダー間の自動切り替えロジック

### 2.4 成果物

1. `packages/shared/src/services/embedding/providers/voyage-provider.ts`
2. `packages/shared/src/services/embedding/providers/bge-m3-provider.ts`
3. `packages/shared/src/services/embedding/providers/embedding-gemma-provider.ts`
4. 更新された`EmbeddingProviderFactory`
5. 更新された型定義（ProviderName）
6. 各プロバイダーのテストファイル（3件）
7. 統合テストファイル
8. プロバイダー選択ガイド
9. 更新された`docker-compose.yml`（BGE-M3用）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] IEmbeddingProviderインターフェースが定義済み
- [ ] EmbeddingProviderFactoryが実装済み
- [ ] 既存のOpenAI/Qwen3プロバイダーが動作
- [ ] 各プロバイダーのAPIキーまたはモデルファイルが取得可能

### 3.2 依存タスク

- UNASSIGNED-EMB-001: ファクトリーの型安全性改善（推奨）

### 3.3 必要な知識・スキル

- TypeScript
- IEmbeddingProviderインターフェース
- HTTP API呼び出し
- Docker Compose（BGE-M3用）
- Transformers.js（Gemma用）

### 3.4 推奨アプローチ

1. プロバイダーごとに段階的に実装
2. テストファーストで実装
3. 既存プロバイダーのコードを参考に
4. モックを使用したテスト

---

## 4. 実行手順

### Phase構成

```
Phase 1: Voyage AI プロバイダー実装
Phase 2: BGE-M3 プロバイダー実装
Phase 3: EmbeddingGemma プロバイダー実装
Phase 4: ファクトリー更新
Phase 5: 統合テスト
Phase 6: ドキュメント作成
```

### Phase 1: Voyage AI プロバイダー

#### 目的

コード検索特化のVoyage AIプロバイダーを実装

#### 実行手順

**Step 1**: 依存パッケージインストール

```bash
pnpm --filter @repo/shared add voyageai
```

**Step 2**: プロバイダー実装

- モデル: voyage-code-2（1536次元）
- バッチサイズ: 最大128テキスト

#### 成果物

- ✅ `voyage-provider.ts`
- ✅ `voyage-provider.test.ts`

#### 完了条件

- [ ] IEmbeddingProviderを実装
- [ ] テストが通過

### Phase 2: BGE-M3 プロバイダー

#### 目的

セルフホスト可能なBGE-M3プロバイダーを実装

#### 実行手順

**Step 1**: Docker Compose設定追加

```yaml
services:
  bge-m3:
    image: michaelfeil/infinity:latest
    ports:
      - "7997:7997"
    command: --model-name-or-path BAAI/bge-m3
```

**Step 2**: プロバイダー実装

- エンドポイント: 設定可能
- 次元数: 1024
- 多言語対応: 100+言語

#### 成果物

- ✅ `bge-m3-provider.ts`
- ✅ `bge-m3-provider.test.ts`
- ✅ 更新された`docker-compose.yml`

#### 完了条件

- [ ] セルフホストAPIに接続できる
- [ ] テストが通過

### Phase 3: EmbeddingGemma プロバイダー

#### 目的

オンデバイスで動作するプロバイダーを実装

#### 実行手順

**Step 1**: 依存パッケージインストール

```bash
pnpm --filter @repo/shared add @huggingface/transformers
```

**Step 2**: プロバイダー実装

- モデル: Xenova/all-MiniLM-L6-v2
- 次元数: 384
- オフライン動作

#### 成果物

- ✅ `embedding-gemma-provider.ts`
- ✅ `embedding-gemma-provider.test.ts`

#### 完了条件

- [ ] オフラインで動作する
- [ ] 初回実行時にモデルダウンロード

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 3つのプロバイダーが実装されている
- [ ] 各プロバイダーがIEmbeddingProviderを実装
- [ ] EmbeddingProviderFactoryで生成できる
- [ ] すべてのプロバイダーでembed()が動作する

### 品質要件

- [ ] 各プロバイダーのユニットテストがある（3件）
- [ ] 統合テストがある
- [ ] 全テストが通過する

### ドキュメント要件

- [ ] プロバイダー選択ガイドが作成されている
- [ ] セットアップ手順が記載されている
- [ ] システム要件ドキュメントが更新されている

---

## 6. 検証方法

### テストケース

| No  | プロバイダー | テストケース     | 期待結果         |
| --- | ------------ | ---------------- | ---------------- |
| 1   | Voyage AI    | 埋め込み生成     | 1536次元ベクトル |
| 2   | BGE-M3       | セルフホスト接続 | 1024次元ベクトル |
| 3   | Gemma        | オフライン動作   | 384次元ベクトル  |

### 検証手順

```bash
docker-compose up -d bge-m3
pnpm test voyage-provider
pnpm test bge-m3-provider
pnpm test embedding-gemma-provider
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                         |
| -------------------------- | ------ | -------- | ---------------------------- |
| Voyage APIキー取得の難しさ | 中     | 中       | モックテストで代替           |
| BGE-M3のセットアップ複雑さ | 中     | 中       | 詳細なセットアップガイド作成 |
| Gemmaのモデルサイズ        | 低     | 低       | ダウンロード進捗表示         |

---

## 8. 参照情報

### 関連ドキュメント

- [Phase 8 手動テスト結果](../embedding-generation-pipeline/manual-test-execution.md)
- [埋め込みプロバイダー技術仕様](../../00-requirements/03-technology-stack.md#54)

### 参考資料

- Voyage AI: https://www.voyageai.com/
- BGE-M3: https://huggingface.co/BAAI/bge-m3
- Transformers.js: https://huggingface.co/docs/transformers.js

---

## 9. 備考

### 補足事項

**プロバイダー選択ガイド**:

| ユースケース         | 推奨プロバイダー | 理由             |
| -------------------- | ---------------- | ---------------- |
| 汎用ドキュメント検索 | OpenAI           | 高品質           |
| コード検索           | Voyage AI        | コード特化       |
| プライバシー重視     | BGE-M3           | セルフホスト     |
| オフライン環境       | Gemma            | 完全オンデバイス |
| 低コスト             | Gemma            | API料金不要      |
