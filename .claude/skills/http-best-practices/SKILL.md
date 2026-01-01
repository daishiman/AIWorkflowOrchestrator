---
name: http-best-practices
description: |
  HTTPプロトコルの仕様に基づき、RESTful APIおよびWebサービス実装における正しく効率的な通信設計を提供します。
  ステータスコード、ヘッダー管理、キャッシュ戦略、コネクション最適化、セキュリティヘッダー、冪等性設計の実装パターンを網羅します。

  📖 参照書籍:
  - 『HTTP/2 in Action』（Barry Pollard）: HTTP/2、キャッシュ戦略、パフォーマンス最適化
  - 『RESTful Web Services』（Leonard Richardson, Sam Ruby）: REST設計原則、ステータスコード活用

  📚 リソース参照:
  - `references/Level1_basics.md`: HTTPの基本概念と判断軸
  - `references/Level2_intermediate.md`: ステータスコード、ヘッダー、キャッシュの実装パターン
  - `references/Level3_advanced.md`: HTTP/2、コネクションプーリング、キャッシュ最適化
  - `references/Level4_expert.md`: 高負荷環境での HTTP設計、自動化とモニタリング
  - `references/status-codes.md`: 2xx/3xx/4xx/5xxステータスコードの選択基準
  - `references/headers-best-practices.md`: 標準ヘッダー、セキュリティヘッダー、カスタムヘッダー設計
  - `references/connection-management.md`: Keep-Alive、コネクションプーリング、HTTP/2最適化
  - `references/idempotency.md`: 冪等性設計と冪等キー実装パターン
  - `references/caching-strategies.md`: キャッシュ戦略、CDN活用、キャッシュ無効化パターン
  - `references/legacy-skill.md`: 旧SKILL.mdの全文
  - `scripts/validate-http-client.mjs`: HTTPクライアント実装の検証
  - `scripts/analyze-headers.mjs`: ヘッダー設計の分析とセキュリティ確認
  - `scripts/log_usage.mjs`: 使用記録・自動評価スクリプト
  - `scripts/validate-skill.mjs`: スキル構造検証スクリプト
  - `assets/http-client-template.ts`: HTTPクライアント実装テンプレート
  - `assets/api-response-template.json`: APIレスポンス設計テンプレート
  - `references/requirements-index.md`: 要求仕様の索引（docs/00-requirements と同期）

  使用タイミング: RESTful API設計、HTTPクライアント実装、キャッシュ戦略設計、セキュリティヘッダー設定

version: 1.1.0
level: 1
last_updated: 2025-12-31
references:
  - book: "HTTP/2 in Action"
    author: "Barry Pollard"
    concepts:
      - "HTTPプロトコル仕様"
      - "キャッシュ戦略"
      - "パフォーマンス最適化"
  - book: "RESTful Web Services"
    author: "Leonard Richardson, Sam Ruby"
    concepts:
      - "REST設計原則"
      - "ステータスコード活用"
      - "リソース設計"
---

# HTTP Best Practices

## 概要

HTTPプロトコルの仕様に基づき、RESTful APIおよびWebサービス実装における正しく効率的な通信設計を提供します。

ステータスコード選択、ヘッダー管理、キャッシュ戦略、コネクション最適化、セキュリティヘッダー設定、冪等性設計の実装パターンを網羅し、APIレスポンス設計、エラーハンドリング、パフォーマンス最適化を支援します。

詳細な知識体系と実装パターンは `references/Level1_basics.md`（基本概念）および `references/Level2_intermediate.md`（実装パターン）を参照してください。

## ワークフロー

### Phase 1: HTTP通信設計の要件と判断軸の明確化

**目的**: API設計のための通信仕様要件を理解し、HTTPプロトコルの活用パターンを決定する基盤を整備する

**背景**: HTTPの実装パターン（ステータスコード選択、キャッシュ戦略、コネクション管理等）はAPI要件と密接に関連するため、まず通信要件を明確化することが設計の正確性を確保する

**ゴール**: APIの機能仕様、エラーハンドリング方針、キャッシュ要件が整理された状態

**読み込むスキル**:

- `.claude/skills/http-best-practices/SKILL.md`（このファイル）

**アクション**:

1. `references/Level1_basics.md` でHTTPの基本概念を確認
2. API仕様に基づき、適用すべきHTTPパターン（ステータスコード、ヘッダー、キャッシュ等）を特定
3. セキュリティ要件に基づき、必要なセキュリティヘッダーを洗い出す

**期待成果物**:

- HTTP通信設計要件書
- 適用候補のHTTPパターンリスト
- セキュリティヘッダー仕様書（案）

**完了条件**:

- [ ] API機能仕様が明確化されている
- [ ] 適用すべきHTTPパターンが特定されている
- [ ] セキュリティ要件が整理されている

### Phase 2: HTTP仕様の詳細設計と実装パターン決定

**目的**: Phase 1で特定したHTTPパターンについて、HTTPプロトコル仕様に基づいた詳細設計を実施し、実装方針を決定する

**背景**: ステータスコード選択、ヘッダー管理、キャッシュ戦略、冪等性設計にはそれぞれ活用すべきパターンがあり、詳細なガイドに基づいた設計が不可欠である

**ゴール**: API実装仕様書が完成し、HTTPクライアント実装方針が決定された状態

**読み込むスキル**:

- `.claude/skills/http-best-practices/SKILL.md`

**アクション**:

1. `references/Level2_intermediate.md` から各HTTPパターンの詳細を確認
2. `references/status-codes.md` でステータスコード選択基準を確認し、各エンドポイントのコード体系を決定
3. `references/headers-best-practices.md` で標準ヘッダーとセキュリティヘッダーを設計
4. `references/connection-management.md` でコネクション管理戦略（Keep-Alive、HTTP/2等）を決定
5. `references/idempotency.md` で冪等性が必要なリクエスト（PUT、DELETE等）の実装パターンを確認
6. `references/caching-strategies.md` でキャッシュ戦略（Cache-Control、ETag等）を設計

**期待成果物**:

- REST API仕様書（ステータスコード、ヘッダー、レスポンス形式）
- HTTPクライアント実装設計書
- キャッシュ戦略設計書
- セキュリティヘッダー実装チェックリスト

**完了条件**:

- [ ] 全エンドポイントのステータスコードが決定されている
- [ ] HTTPヘッダー仕様が確定されている
- [ ] キャッシュ戦略とコネクション管理方針が決定されている
- [ ] 冪等性実装の方針が明確化されている

### Phase 3: 実装検証と記録

**目的**: Phase 2で決定した設計の実装可能性を検証し、実行記録を保存して継続的改善に貢献する

**背景**: HTTP実装の検証と記録が、スキルの改善につながる重要なフィードバックループを形成する

**ゴール**: HTTP実装が検証完了し、実行記録が保存された状態

**読み込むスキル**: なし

**アクション**:

1. `scripts/analyze-headers.mjs` でセキュリティヘッダー実装を検証
2. `scripts/validate-http-client.mjs` でHTTPクライアント実装を検証
3. `assets/http-client-template.ts` を参照して実装が仕様に準拠しているか確認
4. 検証結果に基づき、必要な実装修正を実施
5. `scripts/log_usage.mjs` で実行記録を保存

**期待成果物**:

- HTTP実装検証レポート
- 実装改善提案書（必要に応じて）
- 更新された実行記録（LOGS.md）

**完了条件**:

- [ ] すべてのHTTP検証スクリプトが実行完了している
- [ ] 検証結果に基づく改善提案が整理されている
- [ ] log_usage.mjs で実行記録が保存されている

## Task仕様ナビ

このスキルが提供する主要なタスク領域と、各タスク実行時に活用すべきリソースのマッピング表です。

| タスク領域               | 主要な判断軸                                                                             | 参照リソース                                          | スクリプト検証                                 |
| ------------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------------- |
| **ステータスコード設計** | 成功/リダイレクト/クライアント/サーバーエラーの選択、各業務シナリオへのマッピング        | `status-codes.md`、`Level2_intermediate.md`           | スクリプト実行（検証スクリプト不要）           |
| **ヘッダー管理**         | 標準ヘッダー活用、セキュリティヘッダー（CORS、CSP、X-Frame-Options）、キャッシュヘッダー | `headers-best-practices.md`、`Level2_intermediate.md` | `analyze-headers.mjs`                          |
| **キャッシュ戦略**       | Cache-Control、ETag、Last-Modified、CDN連携、キャッシュ無効化パターン                    | `caching-strategies.md`、`Level3_advanced.md`         | テンプレート参照：`api-response-template.json` |
| **コネクション管理**     | Keep-Alive、Connection プーリング、HTTP/2、タイムアウト設定                              | `connection-management.md`、`Level3_advanced.md`      | `validate-http-client.mjs`                     |
| **冪等性設計**           | Idempotency-Key実装、重複リクエスト対策、トランザクション管理                            | `idempotency.md`、`Level2_intermediate.md`            | テンプレート参照：`http-client-template.ts`    |
| **エラーハンドリング**   | エラーレスポンス形式、エラーコード体系、クライアント/サーバーエラー対応                  | `status-codes.md`、`Level2_intermediate.md`           | `validate-http-client.mjs`                     |
| **パフォーマンス最適化** | 圧縮、バッチリクエスト、ページング、Range リクエスト                                     | `Level3_advanced.md`、`connection-management.md`      | スクリプト実行（検証スクリプト不要）           |

## ベストプラクティス

### すべきこと

- **ステータスコード仕様を定義**: REST API設計時は、各エンドポイント・操作に対して標準ステータスコード（2xx、3xx、4xx、5xx）を明示的に定義する
- **セキュリティヘッダーを標準化**: CORS、CSP、X-Frame-Options、X-Content-Type-Options、Strict-Transport-Securityは、すべてのエンドポイントで一元設定する
- **キャッシュ戦略を文書化**: Cache-Control、ETag、Last-Modified等のキャッシュ関連ヘッダーは、リソース種別ごとに明示的に定義する
- **冪等性を保証する実装**: POST（リソース作成）以外のメソッド（PUT、DELETE、PATCH）およびべき等なPOSTについては、Idempotency-Keyを活用して冪等性を確保する
- **接続管理の最適化**: Keep-Alive、HTTP/2、コネクションプーリングを活用して、不要な接続確立オーバーヘッドを削減する
- **エラーレスポンス形式の統一**: すべてのエラーレスポンスで統一的なJSON構造（`{ error: { code, message, details } }`など）を採用する
- **HTTPクライアント実装の検証**: リトライロジック、タイムアウト設定、ヘッダー管理を含むHTTPクライアント実装は、`scripts/validate-http-client.mjs`で検証する

### 避けるべきこと

- **不適切なステータスコード選択**: 401（Unauthorized）を認可エラーに、403（Forbidden）を認証エラーに使用するなど、意味を誤った選択を避ける
- **セキュリティヘッダーの欠落**: CORS、CSP等のセキュリティヘッダーなしでAPIを公開しない
- **キャッシュ無効化戦略なし**: キャッシュが有効化されても、無効化パターン（キャッシュバスティング、バージョニング等）が定義されていない状況を避ける
- **冪等性の無視**: 外部APIとの連携時に、失敗時の重複リクエストに対する冪等性保証がない実装を避ける
- **接続オーバーヘッドの放置**: HTTP/1.1のコネクション再利用を無視し、リクエストごとにTCP接続を確立する実装を避ける
- **一般的なエラーレスポンス**: エラーメッセージが各エンドポイントで異なる形式で返される実装を避ける
- **スクリプト検証なしの実装**: `scripts/analyze-headers.mjs`、`scripts/validate-http-client.mjs`の実行結果を確認せずに実装を確定させない

## 関連スキル

このスキルと関連し、API設計およびHTTP通信設計において相補的な役割を果たすスキルは以下の通りです：

| スキル                       | パス                                             | 関係性                                 | 活用タイミング           |
| ---------------------------- | ------------------------------------------------ | -------------------------------------- | ------------------------ |
| **API設計**                  | `.claude/skills/api-contract-design/SKILL.md`    | HTTP仕様に基づくAPIコントラクト設計    | API仕様定義時            |
| **ネットワークセキュリティ** | `.claude/skills/network-resilience/SKILL.md`     | HTTPS、TLS/SSL、通信経路のセキュリティ | インフラ設計時           |
| **キャッシュ戦略**           | `.claude/skills/caching-strategies-gha/SKILL.md` | キャッシュレイヤー設計、CDN活用        | パフォーマンス最適化時   |
| **エラー処理設計**           | `.claude/skills/error-message-design/SKILL.md`   | ユーザーフレンドリーなエラーメッセージ | エラーハンドリング設計時 |

## リソース参照

各タスク実装時に活用可能なリソースとその用途を整理します：

### レベル別ガイド

| リソース                           | 対象者               | 用途                                                                 |
| ---------------------------------- | -------------------- | -------------------------------------------------------------------- |
| `references/Level1_basics.md`       | すべてのエージェント | HTTPプロトコルの基本概念、標準仕様、判断軸の理解                     |
| `references/Level2_intermediate.md` | エージェント、設計者 | ステータスコード、ヘッダー、キャッシュの実装パターン、具体的な設計例 |
| `references/Level3_advanced.md`     | 設計者、アーキテクト | HTTP/2最適化、コネクションプーリング、高負荷環境での設計             |
| `references/Level4_expert.md`       | アーキテクト         | 自動化、監視、組織的HTTP設計文化                                     |

### 技術別ガイド

| リソース                              | 対象技術         | 活用シーン                                 |
| ------------------------------------- | ---------------- | ------------------------------------------ |
| `references/status-codes.md`           | ステータスコード | 2xx/3xx/4xx/5xx選択、各操作へのマッピング  |
| `references/headers-best-practices.md` | HTTPヘッダー     | 標準ヘッダー活用、セキュリティヘッダー設定 |
| `references/connection-management.md`  | コネクション管理 | Keep-Alive、HTTP/2、タイムアウト設定       |
| `references/idempotency.md`            | 冪等性設計       | Idempotency-Key実装、重複リクエスト対策    |
| `references/caching-strategies.md`     | キャッシュ戦略   | Cache-Control、ETag、無効化パターン        |

### スクリプト・テンプレート

| ファイル                               | 説明                             | 実行時期                      |
| -------------------------------------- | -------------------------------- | ----------------------------- |
| `scripts/validate-http-client.mjs`     | HTTPクライアント実装の検証       | Phase 3（実装確定前）         |
| `scripts/analyze-headers.mjs`          | セキュリティヘッダーの分析       | Phase 2/3（ヘッダー設計時）   |
| `scripts/log_usage.mjs`                | 実行記録・自動評価               | Phase 3（タスク完了時）       |
| `scripts/validate-skill.mjs`           | スキル構造検証                   | 任意（検証時）                |
| `assets/http-client-template.ts`    | HTTPクライアント実装テンプレート | Phase 2（クライアント実装時） |
| `assets/api-response-template.json` | APIレスポンス設計テンプレート    | Phase 2（レスポンス設計時）   |

## コマンドリファレンス

### リソース読み取り

```bash
cat .claude/skills/http-best-practices/references/Level1_basics.md
cat .claude/skills/http-best-practices/references/Level2_intermediate.md
cat .claude/skills/http-best-practices/references/Level3_advanced.md
cat .claude/skills/http-best-practices/references/Level4_expert.md
cat .claude/skills/http-best-practices/references/status-codes.md
cat .claude/skills/http-best-practices/references/headers-best-practices.md
cat .claude/skills/http-best-practices/references/connection-management.md
cat .claude/skills/http-best-practices/references/idempotency.md
cat .claude/skills/http-best-practices/references/caching-strategies.md
cat .claude/skills/http-best-practices/references/legacy-skill.md
```

### スクリプト実行

```bash
node .claude/skills/http-best-practices/scripts/validate-http-client.mjs --help
node .claude/skills/http-best-practices/scripts/analyze-headers.mjs --help
node .claude/skills/http-best-practices/scripts/log_usage.mjs --help
node .claude/skills/http-best-practices/scripts/validate-skill.mjs --help
```

### テンプレート参照

```bash
cat .claude/skills/http-best-practices/assets/http-client-template.ts
cat .claude/skills/http-best-practices/assets/api-response-template.json
```

## 変更履歴

| Version | Date       | Changes                                                                             |
| ------- | ---------- | ----------------------------------------------------------------------------------- |
| 1.1.0   | 2025-12-31 | 18-skills.md仕様に基づく完全更新。Phase詳細化、Task仕様ナビ追加、リソース参照体系化 |
| 1.0.0   | 2025-12-24 | Spec alignment and required artifacts added                                         |
