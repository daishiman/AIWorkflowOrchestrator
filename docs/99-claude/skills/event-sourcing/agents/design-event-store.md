# Task仕様書：イベントストア設計

## 1. メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| 名前     | Vaughn Vernon      |
| 専門領域 | イベントストア実装 |

> 注記: 思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Vaughn Vernonは『Implementing Domain-Driven Design』の著者として、
イベントストアの実装パターンとアグリゲート設計の詳細を体系化した。

### 2.2 目的

イベントの永続化スキーマを設計し、バージョニング戦略を決定する。

### 2.3 責務

| 責務                   | 成果物             |
| ---------------------- | ------------------ |
| イベントストアスキーマ | ストアスキーマ設計 |
| バージョニング戦略     | バージョン管理方針 |
| ストリーム設計         | ストリーム構造     |
| パフォーマンス設計     | インデックス戦略   |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント                 | 適用方法                   |
| --------------------------------- | -------------------------- |
| Implementing Domain-Driven Design | イベントストア実装パターン |
| Level2_intermediate.md            | ストア設計の詳細           |
| event-store-design.md             | 実装パターンと注意点       |
| event-versioning.md               | バージョニング戦略         |

> 詳細は `references/Level2_intermediate.md` と `references/event-store-design.md` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                         |
| -------- | -------------------------------------------------- |
| 1        | analyze-events Taskからイベント一覧を受領          |
| 2        | `references/Level2_intermediate.md` を読込         |
| 3        | `references/event-store-design.md` を読込          |
| 4        | イベントストアのスキーマを設計                     |
| 5        | イベントストリームの境界を決定（アグリゲート単位） |
| 6        | イベントバージョニング戦略を決定                   |
| 7        | インデックス戦略を設計                             |
| 8        | `assets/event-store-template.ts` を参照して実装    |

### 4.2 チェックリスト

| 項目             | 基準                               |
| ---------------- | ---------------------------------- |
| ストリーム境界   | アグリゲート単位でストリームが分離 |
| イベント順序保証 | ストリーム内の順序が保証される設計 |
| バージョン管理   | イベントスキーマの進化に対応できる |
| 不変性           | イベントの更新・削除ができない設計 |
| パフォーマンス   | 適切なインデックスが設計されている |
| 出力検証         | 必須フィールドが含まれているか     |

### 4.3 ビジネスルール（制約）

| 制約           | 説明                                 |
| -------------- | ------------------------------------ |
| 不変性原則     | イベントは追記のみ（Append-Only）    |
| ストリーム境界 | アグリゲートごとにストリームを分ける |
| 順序保証       | ストリーム内の順序は厳密に保証       |

---

## 5. インターフェース

### 5.1 入力

| データ名         | 提供元         | 検証ルール             | 欠損時処理         |
| ---------------- | -------------- | ---------------------- | ------------------ |
| イベント一覧     | analyze-events | イベント名と属性が明確 | 前Taskに再要求     |
| アグリゲート境界 | analyze-events | 境界が明確に定義       | 境界の明確化を依頼 |

### 5.2 出力

| 成果物名           | 受領先         | 内容                     |
| ------------------ | -------------- | ------------------------ |
| イベントストア設計 | implement-cqrs | スキーマ・バージョン戦略 |

#### 出力テンプレート

````markdown
## イベントストア設計

### ストアスキーマ

```sql
CREATE TABLE event_store (
  id BIGSERIAL PRIMARY KEY,
  stream_id VARCHAR(255) NOT NULL,
  event_type VARCHAR(255) NOT NULL,
  event_version INT NOT NULL,
  event_data JSONB NOT NULL,
  metadata JSONB,
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW(),
  sequence_number BIGINT NOT NULL,
  UNIQUE (stream_id, sequence_number)
);

CREATE INDEX idx_stream_id ON event_store(stream_id);
CREATE INDEX idx_event_type ON event_store(event_type);
CREATE INDEX idx_occurred_at ON event_store(occurred_at);
```
````

### ストリーム設計

| アグリゲート  | ストリームID形式     | 例          |
| ------------- | -------------------- | ----------- |
| {{Aggregate}} | {{aggregate}}-{{id}} | order-12345 |

### バージョニング戦略

| 戦略         | 適用方法                                     |
| ------------ | -------------------------------------------- |
| {{strategy}} | {{event_version フィールドでバージョン管理}} |

### インデックス戦略

| インデックス名 | 対象カラム | 目的               |
| -------------- | ---------- | ------------------ |
| idx_stream_id  | stream_id  | ストリーム読み取り |
| idx_event_type | event_type | イベント種別検索   |

### 前提条件

- {{前提1}}
- {{前提N}}

```

---

## 関連リソース

- **イベントストア中級**: See [references/Level2_intermediate.md](../references/Level2_intermediate.md)
- **ストア設計パターン**: See [references/event-store-design.md](../references/event-store-design.md)
- **バージョニング**: See [references/event-versioning.md](../references/event-versioning.md)
- **ストアテンプレート**: See [assets/event-store-template.ts](../assets/event-store-template.ts)
```
