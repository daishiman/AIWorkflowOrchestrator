# Main Process DI 組み立て責務の設計 - タスク指示書

## メタ情報

```yaml
issue_number: 1378
```

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | UT-RAG-08-012                               |
| タスク名     | Main Process DI 組み立て責務の設計          |
| 分類         | 設計                                        |
| 対象機能     | Main Process / DI / BrowserWindow / Factory |
| 優先度       | 中                                          |
| 見積もり規模 | 小規模                                      |
| ステータス   | 未実施                                      |
| 発見元       | Phase 10 MINOR（P3-M06）                    |
| 発見日       | 2026-03-19                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`EmbeddingService` と `HybridRAGFactory` を Main Process でいつ・どこで組み立てるかが未定義になっている。遅延初期化か Factory Pattern かを決めないと、後続の実装がぶれる。

### 1.2 問題点・課題

- DI の注入タイミングが曖昧だと初期化順序のバグが起きる
- BrowserWindow 生成前後の責務が混ざる
- 依存関係がわからないとテストもしづらい

### 1.3 放置した場合の影響

- Main Process の初期化バグが増える
- `AI_INDEX` 実装の前提が固定できない
- service と factory の責務が逆転する

---

## 2. 何を達成するか（What）

### 2.1 目的

Main Process における DI 組み立て責務を決め、初期化順序を固定する。

### 2.2 最終ゴール

- 注入タイミングが明確になる
- 遅延初期化か Factory Pattern かが決まる
- 後続実装が迷わない

### 2.3 スコープ

#### 含むもの

- Main Process の DI 方針設計
- BrowserWindow 生成後の注入タイミング整理
- 後続タスクへの前提化

#### 含まないもの

- DI コンテナの全面再設計
- 画面レイアウト変更

### 2.4 成果物

- DI 組み立て設計メモ
- 後続タスク向け前提整理

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 初期化順序の候補を比較できること
- 依存注入の責務を 1 箇所に集約する方針が必要

### 3.2 依存タスク

- UT-RAG-08-010
- UT-RAG-08-002

### 3.3 必要な知識

- Dependency Injection
- Lazy initialization
- Electron Main Process の起動順序

### 3.4 推奨アプローチ

BrowserWindow の生成前後で何を組み立てるかを分ける。注入の入口を増やさず、責務を明文化する。

---

## 4. 実行手順

### Phase 1: 候補整理

#### 目的

DI 方針の候補を比較する。

#### 手順

1. setter injection と factory pattern を比較する
2. 依存の遅延初期化要否を決める
3. 注入タイミングを洗い出す

#### 完了条件

- 方針候補が整理されている

### Phase 2: 設計決定

#### 目的

採用方針を固定する。

#### 手順

1. 組み立て責務を決める
2. 初期化順序を文書化する
3. 後続タスクに渡す

#### 完了条件

- 責務境界が明確

### Phase 3: 確認

#### 目的

後続実装に使えるか確かめる。

#### 手順

1. 設計メモをレビューする
2. 依存関係を確認する
3. 矛盾をなくす

#### 完了条件

- 実装に進める

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] DI の組み立て責務が決まっている
- [ ] 注入タイミングが明確になっている

### 品質要件

- [ ] 初期化順序の曖昧さがない
- [ ] 後続タスクが迷わない

### ドキュメント要件

- [ ] 設計判断を残している

---

## 6. 検証方法

### テストケース

- TC-001: 初期化順序が説明できる
- TC-002: 責務の境界が一意
- TC-003: 後続実装の前提として読める

### 検証手順

1. 設計メモを確認する
2. 依存タスクとの整合を見る
3. 例外ケースを確認する

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                           |
| -------------------------- | ------ | -------- | ------------------------------ |
| 初期化順序が曖昧なまま残る | 高     | 中       | 生成前後で責務を分けて明記する |
| DI が広がりすぎる          | 中     | 中       | 入口を 1 つに絞る              |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/outputs/phase-2/contract-matrix.md`
- `docs/30-workflows/completed-tasks/ai-runtime-authmode-unification/tasks/step-04-par-task-08-rag-embedding-extraction-runtime/outputs/phase-12/unassigned-task-detection.md`

### 参考資料

- `apps/desktop/src/main/`
- `packages/shared/src/services/search/hybrid-rag-factory.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Main Process における EmbeddingService / HybridRAGFactory の DI 注入タイミングと責務が未定義。
```

### 補足事項

設計だけで終わらせず、後続実装へ橋渡しする。
