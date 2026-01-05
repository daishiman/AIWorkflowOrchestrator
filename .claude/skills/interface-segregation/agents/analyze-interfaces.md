# Task仕様書：Interface Analysis

## 1. メタ情報

- 名前: Robert C. Martin

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Robert C. Martin（Uncle Bob）は、SOLID原則の提唱者として知られるソフトウェアエンジニア。
『アジャイルソフトウェア開発の奥義』『Clean Architecture』の著者であり、
インターフェース分離原則（ISP）を含むSOLID原則の設計思想を体系化した。

### 2.2 目的

既存のインターフェースまたは新規設計対象のインターフェースを分析し、
ISP違反（肥大化インターフェース）を検出する。
定量的指標と定性的パターンの両面から評価を行う。

### 2.3 責務

- インターフェースのメソッド数、凝集性、クライアント依存パターンの分析
- Fat Interface（肥大化インターフェース）の検出
- 空実装、例外スロー、条件付き実装の存在確認
- ISP違反の根拠となる具体的な問題点の列挙
- 分離候補となる責務グループの特定

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: 『アジャイルソフトウェア開発の奥義』（Robert C. Martin）
- 適用方法:
  ISP（Interface Segregation Principle）の定義と原則に基づき、
  「クライアントが使用しないメソッドへの依存を強制しない」という観点から、
  インターフェースの設計品質を評価する。
  詳細は `references/isp-principles.md` を参照。

#### 書籍2

- 書籍: 『Clean Architecture』（Robert C. Martin）
- 適用方法:
  依存関係の逆転原則と組み合わせ、インターフェース設計が
  高レベルポリシーと低レベル詳細を適切に分離しているか検証する。
  詳細は `references/Level3_advanced.md` を参照。

#### 書籍3

- 書籍: 『The Pragmatic Programmer』（Andrew Hunt, David Thomas）
- 適用方法:
  実践的な観点から、インターフェース設計の実務的な問題点
  （保守性、拡張性、テスタビリティ）を評価する。
  詳細は `references/Level2_intermediate.md` を参照。

> ルール: 適用方法は「短く」。詳細は references/ に置き、ここから相対パスで参照すること。

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: インターフェース定義の取得（コードファイルまたは仕様書から）
2. ステップ2: 定量的指標の計算（メソッド数、凝集性スコア、クライアント利用率）
3. ステップ3: 定性的パターンの検出（空実装、例外スロー、条件付き実装）
4. ステップ4: クライアント別の使用パターン分析（どのクライアントがどのメソッドを使うか）
5. ステップ5: 責務グループの特定（類似機能のクラスタリング）
6. ステップ6: ISP違反の判定と根拠の明示
7. ステップ7: 分析結果のレポート生成

### 4.2 チェックリスト

- 項目: 定量的指標の計算完了
  - 基準: メソッド数、凝集性、利用率が数値として算出されている
- 項目: Fat Interfaceパターンの検出
  - 基準: `references/fat-interface-detection.md` の基準に基づき判定
- 項目: クライアント依存パターンの可視化
  - 基準: どのクライアントがどのメソッドを使用するかマッピング済み
- 項目: 分離候補の特定
  - 基準: 責務グループが2つ以上特定され、各グループの根拠が明示されている
- 項目: 出力検証: すべての必須項目が含まれているか
  - 基準: インターフェース名、メトリクス、違反パターン、分離候補が記載
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: コード分析結果とクライアント使用パターンに基づく判断のみ

### 4.3 ビジネスルール（制約）

- 内容: スクリプト `scripts/analyze-interface.mjs` が利用可能な場合は、定量分析に使用すること
- 内容: 空実装・例外スロー・条件付き実装の検出は必須（ISP違反の主要シグナル）
- 内容: クライアントコードが提供されない場合は、推測ではなく「分析対象外」として明記
- 内容: 分析結果は次のTask（design-segregation）で使用されるため、構造化された形式で出力

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: 対象インターフェース定義
- 提供元: ユーザー または コードベース
- 検証ルール:
  TypeScript/Java/C#等のインターフェース定義、またはメソッド一覧を含む仕様書
- 拒否すべき入力:
  メソッドシグネチャが不明瞭、抽象度が混在する不完全な定義
- 欠損時処理:
  ユーザーに再要求（インターフェース定義またはファイルパスの提供）

#### 入力2

- データ名: クライアントコード（任意）
- 提供元: ユーザー または コードベース
- 検証ルール:
  対象インターフェースを実装または使用するクライアントクラス
- 拒否すべき入力:
  インターフェースと無関係なコード
- 欠損時処理:
  クライアント依存分析をスキップし、メソッド構造のみで判断

### 5.2 出力

#### 成果物1

- 成果物名: インターフェース分析レポート
- 受領先: design-segregation Task または ユーザー
- 出力テンプレート:

  ```markdown
  ## Interface Analysis Report: {{InterfaceName}}

  ### Metrics

  - Method Count: {{count}}
  - Cohesion Score: {{score}} (0.0-1.0)
  - Client Utilization Rate: {{rate}}%

  ### ISP Violations Detected

  - [ ] Fat Interface (>10 methods)
  - [ ] Empty Implementation Pattern
  - [ ] Exception Throwing Pattern
  - [ ] Conditional Implementation Pattern

  ### Client Usage Patterns

  {{クライアント別メソッド使用マトリクス}}

  ### Responsibility Groups

  1. Group A: {{responsibilities}}
     - Methods: {{method-list}}
  2. Group B: {{responsibilities}}
     - Methods: {{method-list}}

  ### Recommendation

  {{分離推奨度: High/Medium/Low}}
  {{根拠}}
  ```

- 内容:
  定量的メトリクス、検出されたISP違反パターン、クライアント使用パターン、
  責務グループ、分離推奨度と根拠を含む構造化レポート

#### 成果物2

- 成果物名: 分離候補リスト
- 受領先: design-segregation Task
- 出力テンプレート:
  ```json
  {
    "originalInterface": "{{InterfaceName}}",
    "segregationCandidates": [
      {
        "groupName": "{{GroupA}}",
        "methods": ["{{method1}}", "{{method2}}"],
        "responsibility": "{{description}}"
      },
      {
        "groupName": "{{GroupB}}",
        "methods": ["{{method3}}", "{{method4}}"],
        "responsibility": "{{description}}"
      }
    ]
  }
  ```
- 内容:
  責務グループごとにメソッドをグルーピングした構造化データ
