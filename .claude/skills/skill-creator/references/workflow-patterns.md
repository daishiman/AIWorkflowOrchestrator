# ワークフローパターン（§4）

> 18-skills.md §4 の要約 + 拡張パターン集
> **相対パス**: `references/workflow-patterns.md`
> **原典**: `docs/00-requirements/18-skills.md` §4

---

## パターン一覧

| パターン       | 用途                       | 記号      |
| -------------- | -------------------------- | --------- |
| シーケンシャル | 依存関係のある順次処理     | `→`       |
| 並列実行       | 独立した同時処理           | `∥`       |
| 条件分岐       | 状況に応じた処理選択       | `◇`       |
| ループ         | 繰り返し処理               | `↺`       |
| Fan-out/Fan-in | 展開と集約                 | `⊂ ⊃`     |
| パイプライン   | ストリーム処理             | `⟹`       |
| サガ           | 分散トランザクション       | `⟿`       |
| Phase ベース   | フェーズ区切りの大規模処理 | `Phase N` |

---

## 4.1 シーケンシャル（Sequential）

依存関係のあるタスクを順次実行する基本パターン。

### 記述形式

```
A → B → C → D
```

```markdown
## ワークフロー
```

task-a → task-b → task-c → task-d

```

### Task 1: {{task-a}}
{{前提なし}}

### Task 2: {{task-b}}
**依存**: task-a の出力を使用

### Task 3: {{task-c}}
**依存**: task-b の出力を使用
```

### 適用例

- データベースマイグレーション
- ビルド＆デプロイパイプライン
- 多段階のコード生成
- 依存関係のあるAPI呼び出し

---

## 4.2 並列実行（Parallel）

独立したタスクを同時に実行し、効率を最大化するパターン。

### 記述形式

```
    ┌→ B ─┐
A → ┼→ C ─┼→ E
    └→ D ─┘
```

```markdown
## ワークフロー
```

      ┌→ task-b ─┐

start → ┼→ task-c ─┼→ aggregate
└→ task-d ─┘

```

### Task 1: 並列実行グループ

以下のTaskを**並列で実行**する：

| Task   | 責務         | 独立性          |
| ------ | ------------ | --------------- |
| task-b | {{責務B}}    | 他と依存関係なし |
| task-c | {{責務C}}    | 他と依存関係なし |
| task-d | {{責務D}}    | 他と依存関係なし |

**実行指示**: `Task tool` で複数エージェントを同時起動

### Task 2: aggregate（結果集約）
**依存**: task-b, task-c, task-d すべての完了を待機
```

### 適用例

- 複数ファイルの同時処理
- 独立したAPI呼び出し
- テストの並列実行
- 複数フォーマットへの変換

### 実装パターン

```markdown
**並列実行指示**:
以下のTaskを並列で実行する。Task toolを使用して複数エージェントを同時起動すること。

1. `agents/task-a.md` - {{責務A}}
2. `agents/task-b.md` - {{責務B}}
3. `agents/task-c.md` - {{責務C}}

**同期ポイント**: すべてのTaskが完了後、`agents/aggregate.md` を実行
```

---

## 4.3 条件分岐（Conditional）

入力や状態に応じて異なるワークフローを選択するパターン。

### 記述形式

```
      ◇ condition
     /   \
    Y     N
   /       \
task-a   task-b
```

```markdown
## ワークフロー
```

analyze → ◇ 判断ポイント
│
├─ 条件A → workflow-a
├─ 条件B → workflow-b
└─ default → workflow-default

```

### Task 1: analyze（状況分析）

入力を分析し、以下の判断基準で分岐を決定する：

| 条件             | 判断基準         | 次のワークフロー |
| ---------------- | ---------------- | ---------------- |
| {{条件A}}        | {{判断基準A}}    | workflow-a       |
| {{条件B}}        | {{判断基準B}}    | workflow-b       |
| それ以外         | デフォルト       | workflow-default |

### 分岐: workflow-a
**条件**: {{条件Aの詳細}}
**Task**: See [references/workflow-a.md](references/workflow-a.md)

### 分岐: workflow-b
**条件**: {{条件Bの詳細}}
**Task**: See [references/workflow-b.md](references/workflow-b.md)
```

### 適用例

- エラーハンドリング（エラー種別による分岐）
- 入力タイプによる処理選択
- 環境（dev/staging/prod）による分岐
- ユーザー権限による機能制限

### Switch/Case パターン

```markdown
**判断ポイント**: {{変数名}}の値

| 値       | ワークフロー      |
| -------- | ----------------- |
| `value1` | → process-type-1  |
| `value2` | → process-type-2  |
| `value3` | → process-type-3  |
| `*`      | → process-default |
```

---

## 4.4 ループ処理（Loop/Iteration）

コレクションの各要素や条件を満たすまで繰り返し処理するパターン。

### 4.4.1 For-Each ループ

```
items[] → ↺ process-item → results[]
```

```markdown
## ワークフロー
```

collect-items → ↺ process-each-item → aggregate-results

```

### Task 1: collect-items（収集）

処理対象のリストを収集する。

**出力**: `items[]` - 処理対象の配列

### Task 2: process-each-item（反復処理）

`items[]` の各要素に対して以下を実行：

| ステップ | アクション           |
| -------- | -------------------- |
| 1        | 要素を取得           |
| 2        | {{処理内容}}を実行   |
| 3        | 結果を `results[]` に追加 |

**ループ継続条件**: `items[]` の全要素を処理するまで

### Task 3: aggregate-results（集約）

`results[]` を集約して最終出力を生成。
```

### 4.4.2 While ループ

```
init → ↺ [condition?] → process → update → [condition?] → done
```

```markdown
## ワークフロー
```

initialize → ↺ check-condition → process → update-state → ↺
↓ (条件不成立)
finalize

```

### Task: iterative-process（反復処理）

**初期化**: {{初期状態を設定}}

**ループ**:
1. 条件をチェック: {{継続条件}}
2. 条件成立 → 処理を実行
3. 状態を更新
4. 1に戻る

**終了条件**: {{終了条件}}

**最大反復回数**: {{N回}}（無限ループ防止）
```

### 4.4.3 再帰パターン

```markdown
## ワークフロー
```

process-node → ↺ process-children → aggregate

```

### Task: recursive-process

**基底ケース**: {{終了条件}}
**再帰ケース**: 子要素に対して同じ処理を適用

| 深さ | 処理内容           |
| ---- | ------------------ |
| 0    | ルート要素を処理   |
| N    | 子要素を再帰処理   |
| leaf | 基底ケースで終了   |

**最大深度**: {{M}}（スタックオーバーフロー防止）
```

### 適用例

- ファイル一覧の処理
- ディレクトリツリーの探索
- ページネーションされたAPIの取得
- 条件を満たすまでのリトライ
- 再帰的なデータ構造の処理

---

## 4.5 Fan-out / Fan-in

単一入力を複数に展開し、処理後に集約するパターン。

### 記述形式

```
        ⊂ Fan-out ⊃
       /     |     \
      A      B      C
       \     |     /
        ⊂ Fan-in ⊃
```

```markdown
## ワークフロー
```

input → ⊂ split ⊃ → [A, B, C] → ⊂ merge ⊃ → output

```

### Task 1: split（分割）

入力を複数の処理単位に分割する。

**分割戦略**: {{チャンク/カテゴリ/属性}}
**出力**: `chunks[]` - 分割された処理単位

### Task 2: process-chunks（並列処理）

各チャンクを並列で処理する。

**並列度**: {{最大N}}
**各チャンクの処理**: See `agents/process-chunk.md`

### Task 3: merge（集約）

処理結果を単一の出力に集約する。

**集約戦略**: {{concat/reduce/aggregate}}
**出力**: 統合された結果
```

### 適用例

- 大規模データの分割処理
- MapReduceパターン
- 複数ソースからのデータ収集
- 分散バッチ処理

---

## 4.6 パイプライン（Pipeline）

データがステージを通過しながら変換されるパターン。

### 記述形式

```
input ⟹ stage-1 ⟹ stage-2 ⟹ stage-3 ⟹ output
```

```markdown
## ワークフロー
```

raw-data ⟹ validate ⟹ transform ⟹ enrich ⟹ output

```

### Pipeline Stages

| Stage     | 入力           | 処理         | 出力           |
| --------- | -------------- | ------------ | -------------- |
| validate  | raw-data       | {{検証}}     | validated-data |
| transform | validated-data | {{変換}}     | transformed    |
| enrich    | transformed    | {{拡張}}     | enriched       |
| output    | enriched       | {{出力}}     | final-result   |

**特徴**:
- 各ステージは前のステージの出力のみに依存
- ステージ間のインターフェースが明確
- 各ステージを個別にテスト可能
```

### 適用例

- ETL（Extract-Transform-Load）処理
- コンパイルパイプライン
- データ検証フロー
- 画像処理パイプライン

---

## 4.7 サガパターン（Saga）

長時間トランザクションを分割し、補償処理で一貫性を保つパターン。

### 記述形式

```
step-1 ⟿ step-2 ⟿ step-3
   ↓ (失敗)   ↓ (失敗)
compensate-1 ← compensate-2
```

```markdown
## ワークフロー
```

step-1 ⟿ step-2 ⟿ step-3 → success
│ │ │
↓ (失敗) ↓ (失敗) ↓ (失敗)
compensate-1 ← compensate-2 ← compensate-3

````

### Saga Steps

| Step   | 処理             | 補償処理           |
| ------ | ---------------- | ------------------ |
| step-1 | {{処理1}}        | {{補償1: ロールバック}} |
| step-2 | {{処理2}}        | {{補償2: ロールバック}} |
| step-3 | {{処理3}}        | {{補償3: ロールバック}} |

**失敗時**: 実行済みステップの補償処理を逆順で実行

### エラーハンドリング

```markdown
**Step N 失敗時**:
1. エラーを記録
2. compensate-(N-1) を実行
3. compensate-(N-2) を実行
4. ... compensate-1 まで逆順に実行
5. 最終エラー状態を報告
````

````

### 適用例

- 分散トランザクション
- マイクロサービス間の整合性
- 予約システム（複数リソースの確保）
- 支払い処理フロー

---

## 4.8 Phase ベースワークフロー

大規模タスクを明確なフェーズに分割するパターン。

### 記述形式

```markdown
## ワークフロー

````

Phase 1: 分析 → Phase 2: 設計 → Phase 3: 実装 → Phase 4: 検証

```

### Phase 1: {{Phase名}}

**目的**: {{Phaseの目的}}

**アクション**:
1. {{アクション1}}
2. {{アクション2}}

**Task**: `agents/{{task-name}}.md` を参照

**完了条件**: {{このPhaseの完了基準}}

### Phase 2: {{Phase名}}
...
```

### 適用例

- スキル作成ワークフロー
- 機能開発サイクル
- コードレビュープロセス
- 移行プロジェクト

---

## 4.9 組み合わせパターン

複数のパターンを組み合わせた複合ワークフロー。

### 4.9.1 並列 + 条件分岐

```markdown
## ワークフロー
```

analyze → ◇ type
├─ type-a → ┌→ process-a1 ─┐
│ └→ process-a2 ─┘→ merge-a
│
└─ type-b → process-b

```

### 分岐後の並列処理

**type-a の場合**:
- process-a1 と process-a2 を並列実行
- 両方完了後に merge-a で集約
```

### 4.9.2 ループ + 条件分岐

```markdown
## ワークフロー
```

↺ for each item:
◇ item.type
├─ type-a → process-a
└─ type-b → process-b

```

### 反復内の条件分岐

各アイテムに対して：
1. タイプを判定
2. タイプに応じた処理を実行
3. 次のアイテムへ
```

### 4.9.3 Phase + 並列 + 条件分岐

```markdown
## ワークフロー
```

Phase 1: 収集
collect-sources
↓
Phase 2: 処理（並列）
┌→ process-source-1 ─┐
┼→ process-source-2 ─┼→ ◇ validation
└→ process-source-3 ─┘ ├─ pass → Phase 3
└─ fail → retry (↺)
Phase 3: 出力
generate-output

```

```

---

## ワークフロー選択ガイド

| タスクの特性                 | 推奨パターン       |
| ---------------------------- | ------------------ |
| 順序が重要、依存関係あり     | シーケンシャル     |
| 独立した複数タスク           | 並列実行           |
| 条件によって処理が変わる     | 条件分岐           |
| コレクションの各要素を処理   | For-Each ループ    |
| 条件を満たすまで繰り返す     | While ループ       |
| 大規模データの分散処理       | Fan-out/Fan-in     |
| データ変換の連鎖             | パイプライン       |
| 失敗時のロールバックが必要   | サガ               |
| 複数の独立したフェーズがある | Phase ベース       |
| 複雑で上記が組み合わさる     | 組み合わせパターン |

### 判断フローチャート

```
Q1: タスクは独立して実行可能か？
├─ Yes → Q2: 複数の入力を処理するか？
│         ├─ Yes → 並列実行 or Fan-out/Fan-in
│         └─ No  → 単純タスク（シーケンシャル不要）
│
└─ No  → Q3: 条件による分岐があるか？
          ├─ Yes → Q4: 分岐は1回か複数回か？
          │         ├─ 1回   → 条件分岐
          │         └─ 複数回 → ループ + 条件分岐
          │
          └─ No  → Q5: 繰り返し処理があるか？
                    ├─ Yes → ループ（For-Each/While）
                    └─ No  → シーケンシャル or パイプライン
```

---

## ワークフロー図の記述規則

### 記号凡例

| 記号    | 意味             | 使用例            |
| ------- | ---------------- | ----------------- |
| `→`     | シーケンシャル   | `A → B → C`       |
| `∥`     | 並列実行         | `A ∥ B ∥ C`       |
| `◇`     | 条件分岐         | `◇ condition`     |
| `↺`     | ループ           | `↺ for each item` |
| `⊂ ⊃`   | Fan-out/Fan-in   | `⊂ split ⊃`       |
| `⟹`     | パイプライン     | `A ⟹ B ⟹ C`       |
| `⟿`     | サガ（補償あり） | `A ⟿ B ⟿ C`       |
| `┌ ┼ └` | 分岐線           | 並列/条件の視覚化 |
| `─ │`   | 接続線           | フロー接続        |

### 記述例

```markdown
## ワークフロー
```

                    ┌→ validate-schema ─┐

input → parse → ◇ → ┼→ validate-format ─┼→ ◇ → output
└→ validate-logic ──┘ │
└→ error-handler

```

**解説**:
1. `input` を `parse` で解析
2. 3つの検証を並列実行
3. すべて成功 → `output`
4. いずれか失敗 → `error-handler`
```

---

## Task分割の判断基準

### 分割すべき場合

| 条件                         | 理由                                 |
| ---------------------------- | ------------------------------------ |
| 思考ログが肥大する場合       | 探索・試行錯誤がメインに残ると汚れる |
| フェーズ間で責務が異なる場合 | リサーチと生成を同窓で混ぜない       |
| 入出力が明確に定義できる場合 | 各Taskが独立して検証可能             |
| 専門性が異なる場合           | 分析タスクと実装タスクは別の思考様式 |
| 並列実行の恩恵を受ける場合   | 独立したタスクは並列化で効率向上     |
| 再利用性が高い場合           | 汎用的な処理は独立Taskにする         |

### 分割しない場合

| 条件                   | 理由                             |
| ---------------------- | -------------------------------- |
| 単純なタスク           | ステップが3未満                  |
| 入出力が曖昧           | 明確な境界が定義できない         |
| 密結合で分離困難       | 分離するとオーバーヘッドが増える |
| コンテキスト共有が必須 | 分離すると情報損失が発生         |

---

## 関連リソース

- **仕様概要**: See [overview.md](overview.md) - §1-2
- **構造仕様**: See [skill-structure.md](skill-structure.md) - §3
- **出力パターン**: See [output-patterns.md](output-patterns.md) - §5
