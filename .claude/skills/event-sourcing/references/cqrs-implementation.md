# CQRS実装ガイド

> 相対パス: `references/cqrs-implementation.md`
> 原典: CQRS Journey (Microsoft), Implementing DDD (Vaughn Vernon)

---

## CQRSアーキテクチャ

```
Command → Write Model → Events → Event Store
                          ↓
                      Projection
                          ↓
Query   → Read Model  → Read Database
```

---

## コンポーネント

| コンポーネント | 責務                 |
| -------------- | -------------------- |
| Command        | 意図を表現（命令形） |
| CommandHandler | コマンド検証と実行   |
| Event          | 起きた事実（過去形） |
| EventHandler   | イベント処理         |
| Projection     | Read Model構築       |
| QueryHandler   | 読み取りクエリ処理   |

---

## Write Model設計

### アグリゲート

| 要素                   | 説明                   |
| ---------------------- | ---------------------- |
| uncommittedEvents      | 未保存のイベントリスト |
| apply()                | イベントを状態に適用   |
| getUncommittedEvents() | 未保存イベント取得     |

### コマンドハンドラー

1. ビジネスルール検証
2. アグリゲート取得
3. コマンド実行（イベント発行）
4. イベント保存

---

## Read Model設計

### 特徴

| 項目     | 説明                         |
| -------- | ---------------------------- |
| 非正規化 | クエリ最適化のためデータ重複 |
| 用途別   | 複数のRead Model可能         |
| 整合性   | 結果整合性（Eventual）       |

### Projection実装

| ステップ | 処理                |
| -------- | ------------------- |
| 購読     | イベントを監視      |
| 変換     | イベント→Read Model |
| 永続化   | Read DB更新         |

---

## 結果整合性

```
T0: イベント保存
T1: Projection開始
T2: Read Model更新完了

T0~T2: 整合性なし（古いデータ）
T2以降: 整合性あり
```

### 対策

| 戦略           | 説明                     |
| -------------- | ------------------------ |
| バージョン確認 | minVersionで整合性検証   |
| リアルタイム   | イベントから直接再構築   |
| UI通知         | 更新完了をユーザーに通知 |

---

## 適用判断

| 条件                     | CQRS適用 |
| ------------------------ | -------- |
| 読み書きパターンが異なる | ○        |
| 独立スケーリング必要     | ○        |
| 複雑なドメインロジック   | ○        |
| シンプルなCRUD           | ×        |
| リアルタイム整合性必須   | △        |
