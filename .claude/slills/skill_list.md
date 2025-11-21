# スキル追記用テンプレート

このファイルには、残りのエージェント(3-35)に追記するスキル定義をまとめています。

## 3. テクニカルライター
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **markdown-advanced-syntax** | Mermaid図、テーブル、コードブロックの活用 |
| **technical-documentation-standards** | IEEE 830、DRY原則、Documentation as Code |
| **api-documentation-best-practices** | OpenAPI、Swagger、エンドポイント記述 |
| **structured-writing** | DITA、トピックベースライティング、モジュール構造 |
| **version-control-for-docs** | Git Diff活用、変更履歴管理、レビューフロー |
```

## 4. アーキテクチャ・ポリス
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **clean-architecture-principles** | 依存関係逆転、レイヤー分離、境界の明確化 |
| **solid-principles** | SRP, OCP, LSP, ISP, DIP の実践 |
| **dependency-analysis** | 循環参照検出、依存関係可視化、メトリクス分析 |
| **architectural-patterns** | Hexagonal, Onion, Ports and Adapters |
| **code-smell-detection** | God Object, Feature Envy, Long Method等の検出 |
```

## 5. UIコンポーネント設計
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **design-system-architecture** | コンポーネント規約、デザイントークン、Figma/コード統合 |
| **component-composition-patterns** | Slot/Compound/Controlled-Uncontrolledパターン、再利用性と拡張性の追求 |
| **headless-ui-principles** | 見た目非依存UI、ロジックとプレゼンテーションの分離 |
| **tailwind-css-patterns** | カスタムユーティリティ、デザイントークン連携、アクセシビリティ |
| **accessibility-wcag** | WCAG 2.1、ARIA、キーボード・モバイル完全対応 |
```

## 6. ページ/ルーティング実装
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **nextjs-app-router** | Server/Client Components、Dynamic Routes、Layouts |
| **server-components-patterns** | データフェッチ最適化、Suspense活用 |
| **seo-optimization** | Metadata API、動的OGP、構造化データ |
| **web-performance** | 動的インポート、画像最適化、Code Splitting |
| **error-handling-pages** | error.tsx、not-found.tsx、global-error.tsx |
```

## 7. クライアント状態管理
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **react-hooks-advanced** | useEffect, useCallback, useMemo, useReducerの適切な使い分け |
| **data-fetching-strategies** | SWR, React Query、キャッシュ戦略、Optimistic Updates |
| **state-lifting** | State Lifting、Context API、Props Drilling回避 |
| **custom-hooks-patterns** | ロジック再利用、関心の分離 |
| **error-boundary** | Error Boundary実装、Fallback UI設計 |
```

## 8. ドメインモデラー
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **domain-driven-design** | Entity, Value Object, Aggregate, Repository Pattern |
| **ubiquitous-language** | ドメインエキスパートとの共通言語、用語集作成 |
| **value-object-patterns** | 不変性、型安全性、ビジネスルールのカプセル化 |
| **domain-services** | ドメインロジックの集約、エンティティ間の協調 |
| **bounded-context** | コンテキスト境界の定義、サブドメイン分割 |
```

## 9. ワークフローエンジン実装
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **design-patterns-behavioral** | Strategy, Template Method, Command Pattern |
| **plugin-architecture** | 動的ロード、レジストリパターン、依存性注入 |
| **interface-segregation** | 小さなインターフェース、多重実装の回避 |
| **factory-patterns** | Factory Method, Abstract Factory, Builder |
| **open-closed-principle** | 拡張に開かれ、修正に閉じた設計 |
```

## 10. 外部連携ゲートウェイ
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **api-client-patterns** | Adapter Pattern、Facade Pattern、Anti-Corruption Layer |
| **retry-strategies** | Exponential Backoff、Circuit Breaker、Bulkhead |
| **http-best-practices** | ステータスコード、タイムアウト、べき等性 |
| **authentication-flows** | OAuth 2.0、JWT、API Key管理 |
| **rate-limiting** | レート制限対応、キューイング、スロットリング |
```

## 11. スキーマ定義
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **zod-validation** | Zodスキーマ定義、型推論、カスタムバリデーション |
| **type-safety-patterns** | TypeScript厳格モード、型ガード、Discriminated Unions |
| **input-sanitization** | XSS対策、SQLインジェクション対策、エスケープ処理 |
| **error-message-design** | ユーザーフレンドリーなエラーメッセージ、i18n対応 |
| **json-schema** | JSON Schema仕様、スキーマバージョニング |
```

## 12. ビジネスロジック実装
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **refactoring-techniques** | Extract Method、Replace Temp with Query、Introduce Parameter Object |
| **tdd-red-green-refactor** | テスト駆動開発サイクル、テストファースト |
| **clean-code-practices** | 意味のある命名、小さな関数、DRY原則 |
| **transaction-script** | シンプルな手続き型ロジック、適切な粒度 |
| **test-doubles** | Mock, Stub, Fake, Spy の使い分け |
```

## 13. AIプロンプトエンジニア
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **prompt-engineering-advanced** | Chain-of-Thought、Few-Shot Learning、System Prompt設計 |
| **llm-context-management** | コンテキストウィンドウ最適化、トークン削減技術 |
| **persona-prompting** | 役割付与、専門性の強化、出力スタイル制御 |
| **structured-output** | JSON Mode、Function Calling、Schema-based Output |
| **hallucination-mitigation** | 検証ステップ追加、引用要求、温度パラメータ調整 |
```

## 14. DBスキーマ設計
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **database-normalization** | 第1〜5正規形、意図的な非正規化 |
| **indexing-strategies** | B-Tree、GiST、GIN インデックス、カーディナリティ考慮 |
| **sql-anti-patterns** | ジェイウォーク、EAV、Polymorphic Associations回避 |
| **jsonb-optimization** | JSONB索引、演算子活用、パフォーマンスチューニング |
| **foreign-key-constraints** | 参照整合性、CASCADE設定、パフォーマンス影響 |
```

## 15. リポジトリ実装
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **repository-pattern** | コレクション風インターフェース、ドメイン型返却 |
| **query-optimization** | N+1問題回避、Eager/Lazy Loading、JOIN戦略 |
| **transaction-management** | ACID特性、トランザクション境界、ロールバック処理 |
| **orm-best-practices** | Drizzle ORMの効率的利用、Raw SQLとの使い分け |
| **database-migrations** | スキーマバージョニング、データマイグレーション、ロールバック計画 |
```

## 16. DevOps/CIエンジニア
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **ci-cd-pipelines** | GitHub Actions、デプロイパイプライン設計、ステージング環境 |
| **infrastructure-as-code** | 構成管理の自動化、環境変数管理、Secret管理 |
| **deployment-strategies** | Blue-Green Deployment、Canary Release、ロールバック戦略 |
| **monitoring-alerting** | ヘルスチェック、ログ集約、メトリクス可視化 |
| **docker-best-practices** | マルチステージビルド、レイヤーキャッシュ、セキュリティスキャン |
```

## 17. ファイル監視 (Watcher)
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **event-driven-architecture** | Observer Pattern、イベントエミッター、非同期処理 |
| **file-system-apis** | fs.watch vs chokidar、ファイルロック対応、クロスプラットフォーム |
| **debouncing-throttling** | イベント間引き、連続発火防止 |
| **ignore-patterns** | .gitignore互換、glob pattern、除外ルール設計 |
| **nodejs-streams** | Readable/Writable Stream、バックプレッシャー |
```

## 18. ネットワーク同期 (Sync)
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **http-networking** | TCP/IP基礎、HTTPステータスコード、タイムアウト設定 |
| **multipart-upload** | FormData、チャンクアップロード、進捗追跡 |
| **websocket-polling** | WebSocket vs SSE vs Long Polling、リアルタイム通信 |
| **exponential-backoff** | リトライ戦略、ジッター、最大試行回数 |
| **network-resilience** | オフライン対応、再接続ロジック、データ整合性 |
```

## 19. プロセス管理
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **process-lifecycle** | プロセス起動、終了、シグナル処理、ゾンビプロセス回避 |
| **pm2-ecosystem** | PM2設定、クラスタリング、ログローテーション |
| **graceful-shutdown** | SIGTERM/SIGINT処理、リソースクリーンアップ |
| **memory-management** | メモリリーク検出、ヒープサイズ設定、GCチューニング |
| **log-streaming** | stdout/stderr、構造化ログ、ログ集約 |
```

## 20. ユニットテスター
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **tdd-principles** | Red-Green-Refactor、テストファースト、テスト駆動設計 |
| **test-doubles** | Mock、Stub、Spy、Fake の使い分け |
| **vitest-advanced** | スナップショットテスト、カバレッジ、並列実行 |
| **boundary-value-analysis** | 境界値テスト、等価分割、異常系網羅 |
| **test-naming-conventions** | Given-When-Then、Arrange-Act-Assert |
```

## 21. E2Eテスター
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **playwright-testing** | ブラウザ自動化、セレクタ戦略、待機戦略 |
| **test-data-management** | Seeding、Teardown、テストデータ分離 |
| **flaky-test-prevention** | リトライロジック、明示的待機、非決定性排除 |
| **visual-regression-testing** | スクリーンショット比較、CSSアニメーション考慮 |
| **api-mocking** | MSW、Nock、モックサーバー構築 |
```

## 22. コード品質管理者 (Linter)
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **eslint-configuration** | ルール設定、カスタムルール、プラグイン活用 |
| **prettier-integration** | ESLintとの統合、フォーマットルール競合回避 |
| **static-analysis** | 循環的複雑度、認知的複雑度、保守性指標 |
| **code-style-guides** | Airbnb、Google、Standard スタイルガイド適用 |
| **commit-hooks** | Husky、lint-staged、pre-commit 自動化 |
```

## 23. 認証・認可スペシャリスト
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **oauth2-flows** | Authorization Code Flow、PKCE、Refresh Token |
| **session-management** | Cookie-based、JWT-based、Session Storage |
| **rbac-implementation** | Role-Based Access Control、権限管理、ポリシー定義 |
| **nextauth-patterns** | NextAuth.js設定、Adapter、カスタムプロバイダー |
| **security-headers** | CSRF、XSS、Clickjacking対策、CSP設定 |
```

## 24. セキュリティ監査人
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **owasp-top-10** | SQLインジェクション、XSS、CSRF等の対策 |
| **vulnerability-scanning** | npm audit、Snyk、SAST/DASTツール活用 |
| **rate-limiting-strategies** | Token Bucket、Leaky Bucket、Sliding Window |
| **input-sanitization-advanced** | パラメータタンパリング防止、エンコード処理 |
| **security-testing** | ペネトレーションテスト、セキュリティテストケース |
```

## 25. 機密情報管理者
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **secret-management** | 環境変数、Vault、Secrets Manager活用 |
| **zero-trust-security** | Zero Trust原則、最小権限、境界防御 |
| **secret-rotation** | 定期的な鍵更新、ローテーション自動化 |
| **gitignore-patterns** | .envファイル除外、pre-commit hook |
| **encryption-basics** | 暗号化アルゴリズム、鍵管理、TLS/SSL |
```

## 26. ロギング・監視設計者
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **structured-logging** | JSON形式ログ、コンテキスト情報、ログレベル |
| **observability-pillars** | ログ、メトリクス、トレースの統合 |
| **slo-sli-design** | Service Level Objectives、Error Budget |
| **alert-design** | アラート閾値設定、通知ルーティング、Alert Fatigue回避 |
| **distributed-tracing** | OpenTelemetry、トレースID、スパン管理 |
```

## 27. データベース管理者 (DBA)
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **database-migrations** | スキーマバージョニング、Up/Downマイグレーション |
| **backup-recovery** | バックアップ戦略、PITR、復旧手順 |
| **query-performance-tuning** | EXPLAIN ANALYZE、実行計画最適化、インデックスチューニング |
| **database-seeding** | 初期データ投入、テストデータ生成 |
| **connection-pooling** | コネクションプール設定、最大接続数調整 |
```

## 28. APIドキュメント作成者
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **openapi-specification** | OpenAPI 3.x、スキーマ定義、エンドポイント記述 |
| **swagger-ui** | Swagger UI設定、Interactive API Docs |
| **api-versioning** | バージョニング戦略、非推奨化、互換性維持 |
| **request-response-examples** | サンプルリクエスト、レスポンス、エラーケース |
| **authentication-docs** | 認証フロー図解、トークン取得手順 |
```

## 29. ユーザーマニュアル作成者
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **user-centric-writing** | ユーザー視点、タスク指向、平易な言葉 |
| **tutorial-design** | ステップバイステップ、スクリーンショット活用 |
| **troubleshooting-guides** | FAQ、エラーメッセージ解説、解決策提示 |
| **information-architecture** | ドキュメント構造、ナビゲーション設計 |
| **localization-i18n** | 多言語対応、文化的配慮、翻訳管理 |
```

## 30. 依存パッケージ管理者
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **semantic-versioning** | Major、Minor、Patch バージョン理解、破壊的変更対応 |
| **dependency-auditing** | npm audit、脆弱性スキャン、依存関係グラフ分析 |
| **lock-file-management** | package-lock.json、yarn.lock、依存固定 |
| **upgrade-strategies** | 段階的アップグレード、互換性テスト |
| **monorepo-dependency-management** | Workspace、パッケージ共有、バージョン統一 |
```

## 31. フック構成管理者
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **git-hooks-concepts** | pre-commit、pre-push、commit-msg等の理解 |
| **claude-code-hooks** | UserPromptSubmit、PreToolUse、PostToolUse |
| **automation-scripting** | シェルスクリプト、Node.jsスクリプト |
| **linting-formatting-automation** | 保存時自動フォーマット、コミット前Lint |
| **approval-gates** | 危険操作の承認フロー、確認プロンプト |
```

## 32. コマンド・オーケストレーター
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **command-pattern** | Command パターン、要求のカプセル化 |
| **workflow-orchestration** | エージェント連携、順次/並列実行、エラーハンドリング |
| **cli-design-principles** | 直感的なコマンド名、引数設計、ヘルプ出力 |
| **idempotency-design** | 冪等性保証、リトライ安全性 |
| **routing-slip-pattern** | タスクルーティング、処理チェーン |
```

## 33. メタ・エージェント設計者
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **agent-persona-design** | ペルソナ定義、役割の明確化、制約設定 |
| **tool-permission-management** | 最小権限、ツールアクセス制御 |
| **multi-agent-systems** | エージェント間協調、メッセージパッシング |
| **prompt-engineering-for-agents** | System Prompt、Few-Shot Examples |
| **agent-lifecycle-management** | 起動、実行、終了、状態管理 |
```

## 34. スキル・ナレッジエンジニア
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **knowledge-management** | SECI Model、暗黙知の形式知化 |
| **progressive-disclosure** | 3層開示モデル、情報の段階的提供 |
| **documentation-architecture** | ドキュメント構造、リソース分割、メタデータ設計 |
| **context-optimization** | トークン効率、必要情報の抽出 |
| **best-practices-curation** | ベストプラクティスの収集、更新、共有 |
```

## 35. MCPツール統合スペシャリスト
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **mcp-protocol** | Model Context Protocol仕様、ツール定義 |
| **api-connector-design** | RESTful API、GraphQL、WebSocket統合 |
| **tool-security** | API Key管理、Rate Limiting、権限スコープ |
| **resource-oriented-api** | リソース指向設計、CRUD操作 |
| **integration-patterns** | Adapter、Facade、Gateway パターン |
```

## 36. GitHub Actions ワークフロー・アーキテクト
```markdown
##### 📚 必要なスキル

| スキル名 | 概要 |
|---------|------|
| **github-actions-syntax** | ワークフロー構文、トリガー、ジョブ、ステップ定義 |
| **github-actions-expressions** | 式構文、コンテキスト変数、関数(contains, startsWith等) |
| **matrix-builds** | マトリクス戦略、OS/言語バージョンの組み合わせテスト、include/exclude |
| **caching-strategies-gha** | actions/cache、依存関係キャッシュ、ビルドキャッシュ最適化、キャッシュキー設計 |
| **reusable-workflows** | 再利用可能ワークフロー、workflow_call、inputs/outputs/secrets定義 |
| **composite-actions** | コンポジットアクション作成、ローカルアクション、アクション公開 |
| **secrets-management-gha** | Repository/Environment/Organization Secrets、OIDC認証、Vault統合 |
| **conditional-execution-gha** | if条件、イベントフィルタリング、パスフィルタ、ブランチフィルタ |
| **parallel-jobs-gha** | 依存関係グラフ(needs)、並列実行、ジョブ間のデータ受け渡し(artifacts) |
| **artifact-management-gha** | actions/upload-artifact、actions/download-artifact、保持期間設定 |
| **docker-build-push-action** | docker/build-push-action、マルチプラットフォームビルド、BuildKit |
| **deployment-environments-gha** | 環境(Environment)設定、承認フロー、デプロイメントプロテクション、環境URL |
| **workflow-security** | トークン権限制限、スクリプトインジェクション対策、依存関係の固定(pinning) |
| **self-hosted-runners** | セルフホステッドランナー設定、スケーリング、セキュリティ強化、ラベル管理 |
| **github-actions-debugging** | デバッグログ(ACTIONS_STEP_DEBUG)、ステップサマリー、annotations |
| **cost-optimization-gha** | 実行時間短縮、キャッシュ活用、不要なワークフロー抑制、if条件での早期終了 |
| **notification-integration-gha** | Slack/Discord/Email通知、ステータスバッジ、コミットステータスAPI |
| **github-api-integration** | GitHub REST/GraphQL API、gh CLI活用、トークン管理 |
| **workflow-templates** | Organization workflow templates、スターターワークフロー |
| **concurrency-control** | 同時実行制御(concurrency)、キャンセル戦略(cancel-in-progress) |
```
