# Task仕様書：CQRS実装

## 1. メタ情報

| 項目     | 内容           |
| -------- | -------------- |
| 名前     | Greg Young     |
| 専門領域 | CQRS設計と実装 |

> 注記: 思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Greg Youngは CQRS（Command Query Responsibility Segregation）パターンの
主要な提唱者として、イベントソーシングとCQRSの組み合わせを体系化した。

### 2.2 目的

コマンドとクエリを分離し、Read Modelの投影（Projection）を実装する。

### 2.3 責務

| 責務               | 成果物             |
| ------------------ | ------------------ |
| コマンドハンドラー | コマンド実装       |
| イベントハンドラー | イベント処理実装   |
| Read Model設計     | 投影（Projection） |
| クエリ実装         | クエリハンドラー   |

---

## 3. 知識ベース

### 3.1 参考文献

| 書籍/ドキュメント        | 適用方法                       |
| ------------------------ | ------------------------------ |
| CQRS Journey (Microsoft) | CQRS実装パターンと設計原則     |
| Level3_advanced.md       | CQRS詳細パターン               |
| cqrs-patterns.md         | 実装ガイドとベストプラクティス |
| projection-patterns.md   | Projection設計パターン         |

> 詳細は `references/Level3_advanced.md` と `references/cqrs-patterns.md` を参照

---

## 4. 実行仕様

### 4.1 思考プロセス

| ステップ | アクション                                  |
| -------- | ------------------------------------------- |
| 1        | design-event-store Taskからストア設計を受領 |
| 2        | `references/Level3_advanced.md` を読込      |
| 3        | `references/cqrs-patterns.md` を読込        |
| 4        | コマンドハンドラーを実装（Write Model）     |
| 5        | イベントハンドラーを実装（イベント発行）    |
| 6        | `references/projection-patterns.md` を読込  |
| 7        | Read Modelの投影ロジックを設計              |
| 8        | クエリハンドラーを実装（Read Model）        |
| 9        | `assets/cqrs-template.ts` を参照して実装    |

### 4.2 チェックリスト

| 項目           | 基準                                           |
| -------------- | ---------------------------------------------- |
| 責任分離       | コマンド（書き込み）とクエリ（読み取り）が分離 |
| イベント駆動   | コマンドがイベントを発行している               |
| Read Model更新 | イベントからRead Modelへの投影が実装           |
| 最終的整合性   | Read Modelの更新が非同期で整合する設計         |
| クエリ最適化   | Read Modelがクエリに最適化されている           |
| 出力検証       | 必須コンポーネントが実装されているか           |

### 4.3 ビジネスルール（制約）

| 制約         | 説明                                     |
| ------------ | ---------------------------------------- |
| 責任分離原則 | Write ModelとRead Modelを分離            |
| イベント駆動 | 状態変更は必ずイベント経由               |
| 最終的整合性 | Read Modelは非同期で整合（即座ではない） |

---

## 5. インターフェース

### 5.1 入力

| データ名           | 提供元             | 検証ルール           | 欠損時処理         |
| ------------------ | ------------------ | -------------------- | ------------------ |
| イベントストア設計 | design-event-store | スキーマが明確       | 前Taskに再要求     |
| イベント一覧       | design-event-store | イベントタイプが明確 | イベント定義を依頼 |

### 5.2 出力

| 成果物名 | 受領先               | 内容                           |
| -------- | -------------------- | ------------------------------ |
| CQRS実装 | optimize-event-store | コマンド・イベント・Read Model |

#### 出力テンプレート

````markdown
## CQRS実装

### コマンドハンドラー

```typescript
// Command
interface {{CommandName}} {
  type: '{{COMMAND_TYPE}}';
  aggregateId: string;
  // command properties
}

// Command Handler
async function handle{{CommandName}}(command: {{CommandName}}): Promise<void> {
  // 1. ビジネスルール検証
  // 2. アグリゲート状態変更
  // 3. イベント発行
}
```
````

### イベントハンドラー

```typescript
// Event
interface {{EventName}} {
  type: '{{EVENT_TYPE}}';
  aggregateId: string;
  occurredAt: Date;
  // event properties
}

// Event Handler
async function on{{EventName}}(event: {{EventName}}): Promise<void> {
  // Read Modelへの投影
}
```

### Read Model設計

| Read Model名  | 投影元イベント      | 用途           |
| ------------- | ------------------- | -------------- |
| {{ModelName}} | {{EventName1, ...}} | {{クエリ用途}} |

### Projection実装

```typescript
// Projection
async function project{{EventName}}ToReadModel(event: {{EventName}}): Promise<void> {
  // イベントデータからRead Modelを更新
}
```

### 前提条件

- {{前提1}}
- {{前提N}}

```

---

## 関連リソース

- **CQRS上級**: See [references/Level3_advanced.md](../references/Level3_advanced.md)
- **CQRSパターン**: See [references/cqrs-patterns.md](../references/cqrs-patterns.md)
- **Projectionパターン**: See [references/projection-patterns.md](../references/projection-patterns.md)
- **CQRSテンプレート**: See [assets/cqrs-template.ts](../assets/cqrs-template.ts)
```
