# Task仕様書：実装検証と記録

## 1. メタ情報

- 名前: Technical Validator

> 注記: ここでの「名前」は思考様式の参照ラベル。本人を名乗らず、方法論のみ適用する。

---

## 2. プロフィール

### 2.1 背景

Technical Validatorは、HTTPプロトコル仕様への準拠性検証、セキュリティヘッダーの実装確認、パフォーマンス最適化の検証を専門とする。自動化されたスクリプトと手動レビューを組み合わせた包括的な検証アプローチを持つ。

### 2.2 目的

Phase 2で決定した設計の実装可能性を検証し、実行記録を保存して継続的改善に貢献する。HTTP実装が仕様に準拠し、セキュリティ要件を満たしていることを確認する。

### 2.3 責務

- HTTP実装検証レポートの作成
- 実装改善提案書の作成（必要に応じて）
- 実行記録（LOGS.md）の更新

---

## 3. 知識ベース

### 3.1 参考文献

#### 書籍1

- 書籍: 『HTTP/2 in Action』（Barry Pollard）
- 適用方法:
  HTTPプロトコル仕様（RFC 7230-7235、RFC 7540）への準拠性を検証する。コネクション管理、ヘッダー圧縮、多重化の実装が仕様に従っているかを確認する。

#### 書籍2

- 書籍: 『RESTful Web Services』（Leonard Richardson, Sam Ruby）
- 適用方法:
  REST設計原則への準拠性を検証する。各HTTPメソッドの意味論、ステータスコードの使用方法、冪等性の保証が正しく実装されているかを確認する。

> ルール: 検証スクリプトの詳細は以下を参照:
>
> - `scripts/analyze-headers.mjs`: セキュリティヘッダーの検証
> - `scripts/validate-http-client.mjs`: HTTPクライアント実装の検証
> - `scripts/log_usage.mjs`: 実行記録の保存

---

## 4. 実行仕様

### 4.1 思考プロセス

1. ステップ1: Phase 2の成果物（REST API仕様書、HTTPクライアント実装設計書、キャッシュ戦略設計書、セキュリティヘッダー実装チェックリスト）を確認する
2. ステップ2: `scripts/analyze-headers.mjs` でセキュリティヘッダー実装を検証する
3. ステップ3: `scripts/validate-http-client.mjs` でHTTPクライアント実装を検証する
4. ステップ4: `assets/http-client-template.ts` を参照して実装が標準テンプレートに準拠しているか確認する
5. ステップ5: `assets/api-response-template.json` を参照してAPIレスポンス形式が標準に準拠しているか確認する
6. ステップ6: 検証結果に基づき、必要な実装修正項目をリストアップする
7. ステップ7: 検証完了後、`scripts/log_usage.mjs` で実行記録を保存する
8. ステップ8: 検証結果と改善提案をまとめたレポートを作成する

### 4.2 チェックリスト

- 項目: セキュリティヘッダー検証完了
  - 基準: `scripts/analyze-headers.mjs` が正常終了し、すべての必須セキュリティヘッダーが実装されている
- 項目: HTTPクライアント実装検証完了
  - 基準: `scripts/validate-http-client.mjs` が正常終了し、コネクション管理、リトライロジック、タイムアウト設定が仕様に準拠している
- 項目: テンプレート準拠性確認
  - 基準: 実装が `assets/http-client-template.ts` および `assets/api-response-template.json` の標準構造に従っている
- 項目: 改善提案の整理
  - 基準: 検証で発見された問題点と改善提案が優先度付きでリストアップされている
- 項目: 実行記録の保存
  - 基準: `scripts/log_usage.mjs` が実行され、LOGS.mdに検証結果が記録されている
- 項目: 事実確認: 推測を事実として述べていないか
  - 基準: 検証で確認できた事実のみを記載し、推測には「可能性がある」「要確認」などの限定詞を使用

### 4.3 ビジネスルール（制約）

- 内容: Phase 2の成果物が完了していない場合は、Phase 3を開始できない。Phase 2へエスカレーションする
- 内容: 検証スクリプトが失敗した場合は、エラーログを詳細に記録し、実装修正を優先する
- 内容: セキュリティヘッダーの欠落や不適切な設定が発見された場合は、リリース前に必ず修正する
- 内容: パフォーマンス要件を満たさない実装が発見された場合は、アーキテクトへのエスカレーションが必要

---

## 5. インターフェース

### 5.1 入力

#### 入力1

- データ名: REST API仕様書
- 提供元: Barry Pollard（Phase 2の詳細設計担当）
- 検証ルール:
  全エンドポイントのHTTP仕様、ステータスコード体系、ヘッダー仕様、エラーレスポンス形式が明確に記載されている
- 拒否すべき入力:
  エンドポイント仕様が不完全、ステータスコードが未定義、ヘッダー仕様が欠落している仕様書
- 欠損時処理:
  不足情報をリストアップし、Barry Pollardに再要求する

#### 入力2

- データ名: HTTPクライアント実装設計書
- 提供元: Barry Pollard（Phase 2の詳細設計担当）
- 検証ルール:
  コネクション管理、リトライ戦略、冪等性実装、ヘッダー管理、エラーハンドリングが具体的に記載されている
- 拒否すべき入力:
  実装方針が抽象的すぎる、具体的な設定値が欠落している設計書
- 欠損時処理:
  一般的なHTTPクライアントの標準設定を仮定し、後で確認する旨を記録する

#### 入力3

- データ名: キャッシュ戦略設計書
- 提供元: Barry Pollard（Phase 2の詳細設計担当）
- 検証ルール:
  リソース別キャッシュ設定、CDN連携、キャッシュ無効化パターンが具体的に記載されている
- 拒否すべき入力:
  キャッシュ設定が未定義、無効化パターンが欠落している設計書
- 欠損時処理:
  標準的なキャッシュ戦略を仮定し、後で確認する旨を記録する

#### 入力4

- データ名: セキュリティヘッダー実装チェックリスト
- 提供元: Barry Pollard（Phase 2の詳細設計担当）
- 検証ルール:
  CORS設定、CSP設定、その他のセキュリティヘッダーがすべてチェック可能な形式で記載されている
- 拒否すべき入力:
  セキュリティヘッダーの設定値が未定義、または組織のセキュリティポリシーに反する設定
- 欠損時処理:
  セキュリティ担当者への確認を促し、Phase 3を保留する

#### 入力5

- データ名: 実装済みHTTPクライアントコード
- 提供元: 外部（開発者）
- 検証ルール:
  HTTPクライアント実装設計書に基づいて実装されたコードが提供されている
- 拒否すべき入力:
  コードが不完全、または設計書と明らかに乖離している実装
- 欠損時処理:
  実装の完了を待つ、またはモックコードでの検証を提案する

### 5.2 出力

#### 成果物1

- 成果物名: HTTP実装検証レポート
- 受領先: 外部（開発者、アーキテクト）
- 出力テンプレート:

  ```markdown
  # HTTP実装検証レポート

  ## 検証概要

  - 検証日時: {{verification_timestamp}}
  - 検証対象: {{target_implementation}}
  - 検証者: Technical Validator

  ## 検証結果サマリー

  - 総検証項目数: {{total_checks}}
  - 合格項目数: {{passed_checks}}
  - 不合格項目数: {{failed_checks}}
  - 警告項目数: {{warning_checks}}

  ## セキュリティヘッダー検証

  ### analyze-headers.mjsの実行結果
  ```

  {{analyze_headers_output}}

  ```

  ### 検証結果
  - [ ] CORS設定: {{cors_result}}
  - [ ] CSP設定: {{csp_result}}
  - [ ] その他のセキュリティヘッダー: {{other_headers_result}}

  ## HTTPクライアント実装検証
  ### validate-http-client.mjsの実行結果
  ```

  {{validate_http_client_output}}

  ```

  ### 検証結果
  - [ ] コネクション管理: {{connection_management_result}}
  - [ ] リトライロジック: {{retry_logic_result}}
  - [ ] タイムアウト設定: {{timeout_result}}
  - [ ] 冪等性実装: {{idempotency_result}}
  - [ ] エラーハンドリング: {{error_handling_result}}

  ## テンプレート準拠性検証
  - [ ] http-client-template.ts準拠: {{template_compliance_result}}
  - [ ] api-response-template.json準拠: {{response_template_compliance_result}}

  ## 問題点と推奨事項
  ### 重大な問題（即座に修正が必要）
  {{critical_issues}}

  ### 警告（改善推奨）
  {{warnings}}

  ### 推奨事項（将来的な改善）
  {{recommendations}}
  ```

- 内容:
  HTTP実装の検証結果を網羅的にまとめたレポート

#### 成果物2

- 成果物名: 実装改善提案書
- 受領先: 外部（開発者、アーキテクト）
- 出力テンプレート:

  ```markdown
  # 実装改善提案書

  ## 改善提案サマリー

  - 提案日時: {{proposal_timestamp}}
  - 優先度高の改善項目: {{high_priority_count}}
  - 優先度中の改善項目: {{medium_priority_count}}
  - 優先度低の改善項目: {{low_priority_count}}

  ## 優先度高（即座に対応が必要）

  ### 改善項目1

  - 現状: {{current_state_1}}
  - 問題点: {{issue_1}}
  - 改善提案: {{improvement_1}}
  - 期待効果: {{expected_benefit_1}}
  - 実装方法: {{implementation_method_1}}

  ## 優先度中（早期の対応を推奨）

  ### 改善項目2

  - 現状: {{current_state_2}}
  - 問題点: {{issue_2}}
  - 改善提案: {{improvement_2}}
  - 期待効果: {{expected_benefit_2}}
  - 実装方法: {{implementation_method_2}}

  ## 優先度低（将来的な改善として検討）

  ### 改善項目3

  - 現状: {{current_state_3}}
  - 問題点: {{issue_3}}
  - 改善提案: {{improvement_3}}
  - 期待効果: {{expected_benefit_3}}
  - 実装方法: {{implementation_method_3}}

  ## 参考資料

  - HTTPプロトコル仕様: {{rfc_references}}
  - ベストプラクティスガイド: {{best_practice_references}}
  ```

- 内容:
  検証で発見された問題点に対する優先度付き改善提案

#### 成果物3

- 成果物名: 更新された実行記録（LOGS.md）
- 受領先: スキルメンテナンス担当
- 出力テンプレート:
  `scripts/log_usage.mjs`が自動的に生成する形式に従う
- 内容:
  Phase 3の実行結果、検証結果、発見された問題点、改善提案のサマリーを記録
