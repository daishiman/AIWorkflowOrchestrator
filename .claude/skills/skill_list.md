# スキル追記用テンプレート

## 1. PM / プロダクトオーナー

- **エージェント名:** `@product-manager`
- **エージェントの配置:** `.claude/agents/product-manager.md`

```markdown
- **必要なスキル**:
  | スキル名 | 概要 |
  |---------|------|
  | **agile-project-management** | スクラム・カンバンの実践知識、バックログ管理手法 |
  | **user-story-mapping** | ユーザーストーリーの作成、優先順位付け、エピック分割 |
  | **estimation-techniques** | ストーリーポイント、プランニングポーカー、相対見積もり |
  | **stakeholder-communication** | ステークホルダー管理、進捗報告、期待値調整 |
  | **product-vision** | ビジョンボード作成、OKR 設定、プロダクトロードマップ策定 |
  | **prioritization-frameworks** | MoSCoW 法、RICE Scoring、Kano Model |
  | **metrics-tracking** | ベロシティ計測、バーンダウンチャート、リードタイム分析 |
```

## 2. 仕様策定アナリスト

- **エージェント名:** `@req-analyst`
- **エージェントの配置:** `.claude/agents/req-analyst.md`

```markdown
- **必要なスキル**:
  | スキル名 | 概要 |
  |---------|------|
  | **requirements-engineering** | 要件定義手法、トリアージ、受け入れ基準の記述 |
  | **use-case-modeling** | ユースケース図作成、アクター定義、シナリオ記述 |
  | **acceptance-criteria-writing** | Given-When-Then 形式、テスト可能な条件定義 |
  | **interview-techniques** | ヒアリングスキル、要求抽出、曖昧性除去 |
  | **functional-non-functional-requirements** | 機能要件と非機能要件分類と定義 |
```

## 3. テクニカルライター

- **エージェント名:** `@spec-writer`
- **エージェントの配置:** `.claude/agents/spec-writer.md`

```markdown
- **必要なスキル**:

| スキル名                              | 概要                                             |
| ------------------------------------- | ------------------------------------------------ |
| **markdown-advanced-syntax**          | Mermaid 図、テーブル、コードブロックの活用       |
| **technical-documentation-standards** | IEEE 830、DRY 原則、Documentation as Code        |
| **api-documentation-best-practices**  | OpenAPI、Swagger、エンドポイント記述             |
| **structured-writing**                | DITA、トピックベースライティング、モジュール構造 |
| **version-control-for-docs**          | Git Diff 活用、変更履歴管理、レビューフロー      |
```

## 4. アーキテクチャ・ポリス

- **エージェント名:** `@arch-police`
- **エージェントの配置:** `.claude/agents/arch-police.md`

```markdown
- **必要なスキル**:

| スキル名                          | 概要                                           |
| --------------------------------- | ---------------------------------------------- |
| **clean-architecture-principles** | 依存関係逆転、レイヤー分離、境界の明確化       |
| **solid-principles**              | SRP, OCP, LSP, ISP, DIP の実践                 |
| **dependency-analysis**           | 循環参照検出、依存関係可視化、メトリクス分析   |
| **architectural-patterns**        | Hexagonal, Onion, Ports and Adapters           |
| **code-smell-detection**          | God Object, Feature Envy, Long Method 等の検出 |
```

## 5. UI コンポーネント設計

- **エージェント名:** `@ui-designer`
- **エージェントの配置:** `.claude/agents/ui-designer.md`

```markdown
- **必要なスキル**:

| スキル名                           | 概要                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------- |
| **design-system-architecture**     | コンポーネント規約、デザイントークン、Figma/コード統合                 |
| **component-composition-patterns** | Slot/Compound/Controlled-Uncontrolled パターン、再利用性と拡張性の追求 |
| **headless-ui-principles**         | 見た目非依存 UI、ロジックとプレゼンテーションの分離                    |
| **tailwind-css-patterns**          | カスタムユーティリティ、デザイントークン連携、アクセシビリティ         |
| **accessibility-wcag**             | WCAG 2.1、ARIA、キーボード・モバイル完全対応                           |
```

## 6. ページ/ルーティング実装

- **エージェント名:** `@router-dev`
- **エージェントの配置:** `.claude/agents/router-dev.md`

```markdown
- **必要なスキル**:

| スキル名                       | 概要                                              |
| ------------------------------ | ------------------------------------------------- |
| **nextjs-app-router**          | Server/Client Components、Dynamic Routes、Layouts |
| **server-components-patterns** | データフェッチ最適化、Suspense 活用               |
| **seo-optimization**           | Metadata API、動的 OGP、構造化データ              |
| **web-performance**            | 動的インポート、画像最適化、Code Splitting        |
| **error-handling-pages**       | error.tsx、not-found.tsx、global-error.tsx        |
```

## 7. クライアント状態管理

- **エージェント名:** `@state-manager`
- **エージェントの配置:** `.claude/agents/state-manager.md`

```markdown
- **必要なスキル**:

| スキル名                     | 概要                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| **react-hooks-advanced**     | useEffect, useCallback, useMemo, useReducer の適切な使い分け |
| **data-fetching-strategies** | SWR, React Query、キャッシュ戦略、Optimistic Updates         |
| **state-lifting**            | State Lifting、Context API、Props Drilling 回避              |
| **custom-hooks-patterns**    | ロジック再利用、関心の分離                                   |
| **error-boundary**           | Error Boundary 実装、Fallback UI 設計                        |
```

## 8. ドメインモデラー

- **エージェント名:** `@domain-modeler`

- **エージェントの配置:** `.claude/agents/domain-modeler.md`

```markdown
- **必要なスキル**:

| スキル名                  | 概要                                                |
| ------------------------- | --------------------------------------------------- |
| **domain-driven-design**  | Entity, Value Object, Aggregate, Repository Pattern |
| **ubiquitous-language**   | ドメインエキスパートとの共通言語、用語集作成        |
| **value-object-patterns** | 不変性、型安全性、ビジネスルールのカプセル化        |
| **domain-services**       | ドメインロジックの集約、エンティティ間の協調        |
| **bounded-context**       | コンテキスト境界の定義、サブドメイン分割            |
```

## 9. ワークフローエンジン実装

- **エージェント名:** `@workflow-engine`

- **エージェントの配置:** `.claude/agents/workflow-engine.md`

```markdown
- **必要なスキル**:

| スキル名                       | 概要                                       |
| ------------------------------ | ------------------------------------------ |
| **design-patterns-behavioral** | Strategy, Template Method, Command Pattern |
| **plugin-architecture**        | 動的ロード、レジストリパターン、依存性注入 |
| **interface-segregation**      | 小さなインターフェース、多重実装の回避     |
| **factory-patterns**           | Factory Method, Abstract Factory, Builder  |
| **open-closed-principle**      | 拡張に開かれ、修正に閉じた設計             |
```

## 10. 外部連携ゲートウェイ

- **エージェント名:** `@gateway-dev`

- **エージェントの配置:** `.claude/agents/gateway-dev.md`

```markdown
- **必要なスキル**:

| スキル名                 | 概要                                                   |
| ------------------------ | ------------------------------------------------------ |
| **api-client-patterns**  | Adapter Pattern、Facade Pattern、Anti-Corruption Layer |
| **retry-strategies**     | Exponential Backoff、Circuit Breaker、Bulkhead         |
| **http-best-practices**  | ステータスコード、タイムアウト、べき等性               |
| **authentication-flows** | OAuth 2.0、JWT、API Key 管理                           |
| **rate-limiting**        | レート制限対応、キューイング、スロットリング           |
```

## 11. スキーマ定義

- **エージェント名:** `@schema-def`

- **エージェントの配置:** `.claude/agents/schema-def.md`

```markdown
- **必要なスキル**:

| スキル名                 | 概要                                                  |
| ------------------------ | ----------------------------------------------------- |
| **zod-validation**       | Zod スキーマ定義、型推論、カスタムバリデーション      |
| **type-safety-patterns** | TypeScript 厳格モード、型ガード、Discriminated Unions |
| **input-sanitization**   | XSS 対策、SQL インジェクション対策、エスケープ処理    |
| **error-message-design** | ユーザーフレンドリーなエラーメッセージ、i18n 対応     |
| **json-schema**          | JSON Schema 仕様、スキーマバージョニング              |
```

## 12. ビジネスロジック実装

- **エージェント名:** `@logic-dev`

- **エージェントの配置:** `.claude/agents/logic-dev.md`

```markdown
- **必要なスキル**:

| スキル名                   | 概要                                                                |
| -------------------------- | ------------------------------------------------------------------- |
| **refactoring-techniques** | Extract Method、Replace Temp with Query、Introduce Parameter Object |
| **tdd-red-green-refactor** | テスト駆動開発サイクル、テストファースト                            |
| **clean-code-practices**   | 意味のある命名、小さな関数、DRY 原則                                |
| **transaction-script**     | シンプルな手続き型ロジック、適切な粒度                              |
| **test-doubles**           | Mock, Stub, Fake, Spy の使い分け                                    |
```

## 13. AI プロンプトエンジニア

- **エージェント名:** `@prompt-eng`

- **エージェントの配置:** `.claude/agents/prompt-eng.md`

```markdown
- **必要なスキル**:

| スキル名                        | 概要                                                    |
| ------------------------------- | ------------------------------------------------------- |
| **prompt-engineering-advanced** | Chain-of-Thought、Few-Shot Learning、System Prompt 設計 |
| **llm-context-management**      | コンテキストウィンドウ最適化、トークン削減技術          |
| **persona-prompting**           | 役割付与、専門性の強化、出力スタイル制御                |
| **structured-output**           | JSON Mode、Function Calling、Schema-based Output        |
| **hallucination-mitigation**    | 検証ステップ追加、引用要求、温度パラメータ調整          |
```

## 14. DB スキーマ設計

- **エージェント名:** `@db-architect`

- **エージェントの配置:** `.claude/agents/db-architect.md`

```markdown
- **必要なスキル**:

| スキル名                    | 概要                                                 |
| --------------------------- | ---------------------------------------------------- |
| **database-normalization**  | 第 1〜5 正規形、意図的な非正規化                     |
| **indexing-strategies**     | B-Tree、GiST、GIN インデックス、カーディナリティ考慮 |
| **sql-anti-patterns**       | ジェイウォーク、EAV、Polymorphic Associations 回避   |
| **jsonb-optimization**      | JSONB 索引、演算子活用、パフォーマンスチューニング   |
| **foreign-key-constraints** | 参照整合性、CASCADE 設定、パフォーマンス影響         |
```

## 15. リポジトリ実装

- **エージェント名:** `@repo-dev`
- **エージェントの配置:** `.claude/agents/repo-dev.md`

```markdown
- **必要なスキル**:

| スキル名                   | 概要                                                             |
| -------------------------- | ---------------------------------------------------------------- |
| **repository-pattern**     | コレクション風インターフェース、ドメイン型返却                   |
| **query-optimization**     | N+1 問題回避、Eager/Lazy Loading、JOIN 戦略                      |
| **transaction-management** | ACID 特性、トランザクション境界、ロールバック処理                |
| **orm-best-practices**     | Drizzle ORM の効率的利用、Raw SQL との使い分け                   |
| **database-migrations**    | スキーマバージョニング、データマイグレーション、ロールバック計画 |
```

## 16. DevOps/CI エンジニア

- **エージェント名:** `@devops-eng`
- **エージェントの配置:** `.claude/agents/devops-eng.md`

```markdown
- **必要なスキル**:

| スキル名                   | 概要                                                           |
| -------------------------- | -------------------------------------------------------------- |
| **ci-cd-pipelines**        | GitHub Actions、デプロイパイプライン設計、ステージング環境     |
| **infrastructure-as-code** | 構成管理の自動化、環境変数管理、Secret 管理                    |
| **deployment-strategies**  | Blue-Green Deployment、Canary Release、ロールバック戦略        |
| **monitoring-alerting**    | ヘルスチェック、ログ集約、メトリクス可視化                     |
| **docker-best-practices**  | マルチステージビルド、レイヤーキャッシュ、セキュリティスキャン |
```

## 17. ファイル監視 (Watcher)

- **エージェント名:** `@local-watcher`
- **エージェントの配置:** `.claude/agents/local-watcher.md`

```markdown
- **必要なスキル**:

| スキル名                      | 概要                                                             |
| ----------------------------- | ---------------------------------------------------------------- |
| **event-driven-architecture** | Observer Pattern、イベントエミッター、非同期処理                 |
| **file-system-apis**          | fs.watch vs chokidar、ファイルロック対応、クロスプラットフォーム |
| **debouncing-throttling**     | イベント間引き、連続発火防止                                     |
| **ignore-patterns**           | .gitignore 互換、glob pattern、除外ルール設計                    |
| **nodejs-streams**            | Readable/Writable Stream、バックプレッシャー                     |
```

## 18. ネットワーク同期 (Sync)

- **エージェント名:** `@local-sync`
- **エージェントの配置:** `.claude/agents/local-sync.md`

```markdown
- **必要なスキル**:

| スキル名                | 概要                                                 |
| ----------------------- | ---------------------------------------------------- |
| **http-networking**     | TCP/IP 基礎、HTTP ステータスコード、タイムアウト設定 |
| **multipart-upload**    | FormData、チャンクアップロード、進捗追跡             |
| **websocket-polling**   | WebSocket vs SSE vs Long Polling、リアルタイム通信   |
| **exponential-backoff** | リトライ戦略、ジッター、最大試行回数                 |
| **network-resilience**  | オフライン対応、再接続ロジック、データ整合性         |
```

## 19. プロセス管理

- **エージェント名:** `@process-mgr`
- **エージェントの配置:** `.claude/agents/process-mgr.md`

```markdown
- **必要なスキル**:

| スキル名              | 概要                                                 |
| --------------------- | ---------------------------------------------------- |
| **process-lifecycle** | プロセス起動、終了、シグナル処理、ゾンビプロセス回避 |
| **pm2-ecosystem**     | PM2 設定、クラスタリング、ログローテーション         |
| **graceful-shutdown** | SIGTERM/SIGINT 処理、リソースクリーンアップ          |
| **memory-management** | メモリリーク検出、ヒープサイズ設定、GC チューニング  |
| **log-streaming**     | stdout/stderr、構造化ログ、ログ集約                  |
```

## 20. ユニットテスター

- **エージェント名:** `@unit-tester`
- **エージェントの配置:** `.claude/agents/unit-tester.md`

```markdown
- **必要なスキル**:

| スキル名                    | 概要                                                 |
| --------------------------- | ---------------------------------------------------- |
| **tdd-principles**          | Red-Green-Refactor、テストファースト、テスト駆動設計 |
| **test-doubles**            | Mock、Stub、Spy、Fake の使い分け                     |
| **vitest-advanced**         | スナップショットテスト、カバレッジ、並列実行         |
| **boundary-value-analysis** | 境界値テスト、等価分割、異常系網羅                   |
| **test-naming-conventions** | Given-When-Then、Arrange-Act-Assert                  |
```

## 21. E2E テスター

- **エージェント名:** `@e2e-tester`
- **エージェントの配置:** `.claude/agents/e2e-tester.md`

```markdown
- **必要なスキル**:

| スキル名                      | 概要                                           |
| ----------------------------- | ---------------------------------------------- |
| **playwright-testing**        | ブラウザ自動化、セレクタ戦略、待機戦略         |
| **test-data-management**      | Seeding、Teardown、テストデータ分離            |
| **flaky-test-prevention**     | リトライロジック、明示的待機、非決定性排除     |
| **visual-regression-testing** | スクリーンショット比較、CSS アニメーション考慮 |
| **api-mocking**               | MSW、Nock、モックサーバー構築                  |
```

## 22. コード品質管理者 (Linter)

- **エージェント名:** `@code-quality`
- **エージェントの配置:** `.claude/agents/code-quality.md`

```markdown
- **必要なスキル**:

| スキル名                 | 概要                                        |
| ------------------------ | ------------------------------------------- |
| **eslint-configuration** | ルール設定、カスタムルール、プラグイン活用  |
| **prettier-integration** | ESLint との統合、フォーマットルール競合回避 |
| **static-analysis**      | 循環的複雑度、認知的複雑度、保守性指標      |
| **code-style-guides**    | Airbnb、Google、Standard スタイルガイド適用 |
| **commit-hooks**         | Husky、lint-staged、pre-commit 自動化       |
```

## 23. 認証・認可スペシャリスト

- **エージェント名:** `@auth-specialist`
- **エージェントの配置:** `.claude/agents/auth-specialist.md`

```markdown
- **必要なスキル**:

| スキル名                | 概要                                              |
| ----------------------- | ------------------------------------------------- |
| **oauth2-flows**        | Authorization Code Flow、PKCE、Refresh Token      |
| **session-management**  | Cookie-based、JWT-based、Session Storage          |
| **rbac-implementation** | Role-Based Access Control、権限管理、ポリシー定義 |
| **nextauth-patterns**   | NextAuth.js 設定、Adapter、カスタムプロバイダー   |
| **security-headers**    | CSRF、XSS、Clickjacking 対策、CSP 設定            |
```

## 24. セキュリティ監査人

- **エージェント名:** `@sec-auditor`
- **エージェントの配置:** `.claude/agents/sec-auditor.md`

```markdown
- **必要なスキル**:

| スキル名                        | 概要                                             |
| ------------------------------- | ------------------------------------------------ |
| **owasp-top-10**                | SQL インジェクション、XSS、CSRF 等の対策         |
| **vulnerability-scanning**      | npm audit、Snyk、SAST/DAST ツール活用            |
| **rate-limiting-strategies**    | Token Bucket、Leaky Bucket、Sliding Window       |
| **input-sanitization-advanced** | パラメータタンパリング防止、エンコード処理       |
| **security-testing**            | ペネトレーションテスト、セキュリティテストケース |
```

## 25. 機密情報管理者

- **エージェント名:** `@secret-mgr`
- **エージェントの配置:** `.claude/agents/secret-mgr.md`

```markdown
- **必要なスキル**:

| スキル名                | 概要                                  |
| ----------------------- | ------------------------------------- |
| **secret-management**   | 環境変数、Vault、Secrets Manager 活用 |
| **zero-trust-security** | Zero Trust 原則、最小権限、境界防御   |
| **secret-rotation**     | 定期的な鍵更新、ローテーション自動化  |
| **gitignore-patterns**  | .env ファイル除外、pre-commit hook    |
| **encryption-basics**   | 暗号化アルゴリズム、鍵管理、TLS/SSL   |
```

## 26. ロギング・監視設計者

- **エージェント名:** `@sre-observer`
- **エージェントの配置:** `.claude/agents/sre-observer.md`

```markdown
- **必要なスキル**:

| スキル名                  | 概要                                                   |
| ------------------------- | ------------------------------------------------------ |
| **structured-logging**    | JSON 形式ログ、コンテキスト情報、ログレベル            |
| **observability-pillars** | ログ、メトリクス、トレースの統合                       |
| **slo-sli-design**        | Service Level Objectives、Error Budget                 |
| **alert-design**          | アラート閾値設定、通知ルーティング、Alert Fatigue 回避 |
| **distributed-tracing**   | OpenTelemetry、トレース ID、スパン管理                 |
```

## 27. データベース管理者 (DBA)

- **エージェント名:** `@dba-mgr`
- **エージェントの配置:** `.claude/agents/dep-mgr.md`

```markdown
- **必要なスキル**:

| スキル名                     | 概要                                                      |
| ---------------------------- | --------------------------------------------------------- |
| **database-migrations**      | スキーマバージョニング、Up/Down マイグレーション          |
| **backup-recovery**          | バックアップ戦略、PITR、復旧手順                          |
| **query-performance-tuning** | EXPLAIN ANALYZE、実行計画最適化、インデックスチューニング |
| **database-seeding**         | 初期データ投入、テストデータ生成                          |
| **connection-pooling**       | コネクションプール設定、最大接続数調整                    |
```

## 28. API ドキュメント作成者

- **エージェント名:** `@api-doc-writer`
- **エージェントの配置:** `.claude/agents/api-doc-writer.md`

```markdown
- **必要なスキル**:

| スキル名                      | 概要                                          |
| ----------------------------- | --------------------------------------------- |
| **openapi-specification**     | OpenAPI 3.x、スキーマ定義、エンドポイント記述 |
| **swagger-ui**                | Swagger UI 設定、Interactive API Docs         |
| **api-versioning**            | バージョニング戦略、非推奨化、互換性維持      |
| **request-response-examples** | サンプルリクエスト、レスポンス、エラーケース  |
| **authentication-docs**       | 認証フロー図解、トークン取得手順              |
```

## 29. ユーザーマニュアル作成者

- **エージェント名:** `@manual-writer`
- **エージェントの配置:** `.claude/agents/manual-writer.md`

```markdown
- **必要なスキル**:

| スキル名                     | 概要                                         |
| ---------------------------- | -------------------------------------------- |
| **user-centric-writing**     | ユーザー視点、タスク指向、平易な言葉         |
| **tutorial-design**          | ステップバイステップ、スクリーンショット活用 |
| **troubleshooting-guides**   | FAQ、エラーメッセージ解説、解決策提示        |
| **information-architecture** | ドキュメント構造、ナビゲーション設計         |
| **localization-i18n**        | 多言語対応、文化的配慮、翻訳管理             |
```

## 30. 依存パッケージ管理者

- **エージェント名:** `@dep-mgr`
- **エージェントの配置:** `.claude/agents/dep-mgr.md`

```markdown
- **必要なスキル**:

| スキル名                           | 概要                                               |
| ---------------------------------- | -------------------------------------------------- |
| **semantic-versioning**            | Major、Minor、Patch バージョン理解、破壊的変更対応 |
| **dependency-auditing**            | npm audit、脆弱性スキャン、依存関係グラフ分析      |
| **lock-file-management**           | package-lock.json、yarn.lock、依存固定             |
| **upgrade-strategies**             | 段階的アップグレード、互換性テスト                 |
| **monorepo-dependency-management** | Workspace、パッケージ共有、バージョン統一          |
```

## 31. フック構成管理者

- **エージェント名:** `@hook-master`
- **エージェントの配置:** `.claude/agents/hook-master.md`

```markdown
- **必要なスキル**:

| スキル名                          | 概要                                      |
| --------------------------------- | ----------------------------------------- |
| **git-hooks-concepts**            | pre-commit、pre-push、commit-msg 等の理解 |
| **claude-code-hooks**             | UserPromptSubmit、PreToolUse、PostToolUse |
| **automation-scripting**          | シェルスクリプト、Node.js スクリプト      |
| **linting-formatting-automation** | 保存時自動フォーマット、コミット前 Lint   |
| **approval-gates**                | 危険操作の承認フロー、確認プロンプト      |
```

## 32. コマンド・オーケストレーター

- **エージェント名:** `@command-arch`
- **エージェントの配置:** `.claude/agents/command-arch.md`

```markdown
- **必要なスキル**:

| スキル名                   | 概要                                                |
| -------------------------- | --------------------------------------------------- |
| **command-pattern**        | Command パターン、要求のカプセル化                  |
| **workflow-orchestration** | エージェント連携、順次/並列実行、エラーハンドリング |
| **cli-design-principles**  | 直感的なコマンド名、引数設計、ヘルプ出力            |
| **idempotency-design**     | 冪等性保証、リトライ安全性                          |
| **routing-slip-pattern**   | タスクルーティング、処理チェーン                    |
```

## 33. メタ・エージェント設計者

- **エージェント名:** `@meta-agent-designer`
- **エージェントの配置:** `.claude/agents/meta-agent-designer.md`

```markdown
- **必要なスキル**:

| スキル名                          | 概要                                     |
| --------------------------------- | ---------------------------------------- |
| **agent-persona-design**          | ペルソナ定義、役割の明確化、制約設定     |
| **tool-permission-management**    | 最小権限、ツールアクセス制御             |
| **multi-agent-systems**           | エージェント間協調、メッセージパッシング |
| **prompt-engineering-for-agents** | System Prompt、Few-Shot Examples         |
| **agent-lifecycle-management**    | 起動、実行、終了、状態管理               |
```

## 34. スキル・ナレッジエンジニア

- **エージェント名:** `@skill-librarian`
- **エージェントの配置:** `.claude/agents/skill-librarian.md`

```markdown
- **必要なスキル**:

| スキル名 | パス | 概要 |
|---------|------|------|
| **knowledge-management** | `.claude/skills/knowledge-management/SKILL.md` | SECI Model、暗黙知の形式知化 |
| **progressive-disclosure** | `.claude/skills/progressive-disclosure/SKILL.md` | 3層開示モデル、スキル発動最適化 |
| **documentation-architecture** | `.claude/skills/documentation-architecture/SKILL.md` | ドキュメント構造、リソース分割 |
| **context-optimization** | `.claude/skills/context-optimization/SKILL.md` | ファイルサイズ最適化、550行基準 |
| **best-practices-curation** | `.claude/skills/best-practices-curation/SKILL.md` | ベストプラクティス収集、品質評価 |
```

## 35. MCP ツール統合スペシャリスト

- **エージェント名:** `@mcp-integrator`
- **エージェントの配置:** `.claude/agents/mcp-integrator.md`

```markdown
- **必要なスキル**:

| スキル名                  | 概要                                      |
| ------------------------- | ----------------------------------------- |
| **mcp-protocol**          | Model Context Protocol 仕様、ツール定義   |
| **api-connector-design**  | RESTful API、GraphQL、WebSocket 統合      |
| **tool-security**         | API Key 管理、Rate Limiting、権限スコープ |
| **resource-oriented-api** | リソース指向設計、CRUD 操作               |
| **integration-patterns**  | Adapter、Facade、Gateway パターン         |
```

## 36. GitHub Actions ワークフロー・アーキテクト

- **エージェント名:** `@gha-workflow-architect`
- **エージェントの配置:** `.claude/agents/gha-workflow-architect.md`

```markdown
- **必要なスキル**:

| スキル名                         | 概要                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------- |
| **github-actions-syntax**        | ワークフロー構文、トリガー、ジョブ、ステップ定義                              |
| **github-actions-expressions**   | 式構文、コンテキスト変数、関数(contains, startsWith 等)                       |
| **matrix-builds**                | マトリクス戦略、OS/言語バージョンの組み合わせテスト、include/exclude          |
| **caching-strategies-gha**       | actions/cache、依存関係キャッシュ、ビルドキャッシュ最適化、キャッシュキー設計 |
| **reusable-workflows**           | 再利用可能ワークフロー、workflow_call、inputs/outputs/secrets 定義            |
| **composite-actions**            | コンポジットアクション作成、ローカルアクション、アクション公開                |
| **secrets-management-gha**       | Repository/Environment/Organization Secrets、OIDC 認証、Vault 統合            |
| **conditional-execution-gha**    | if 条件、イベントフィルタリング、パスフィルタ、ブランチフィルタ               |
| **parallel-jobs-gha**            | 依存関係グラフ(needs)、並列実行、ジョブ間のデータ受け渡し(artifacts)          |
| **artifact-management-gha**      | actions/upload-artifact、actions/download-artifact、保持期間設定              |
| **docker-build-push-action**     | docker/build-push-action、マルチプラットフォームビルド、BuildKit              |
| **deployment-environments-gha**  | 環境(Environment)設定、承認フロー、デプロイメントプロテクション、環境 URL     |
| **workflow-security**            | トークン権限制限、スクリプトインジェクション対策、依存関係の固定(pinning)     |
| **self-hosted-runners**          | セルフホステッドランナー設定、スケーリング、セキュリティ強化、ラベル管理      |
| **github-actions-debugging**     | デバッグログ(ACTIONS_STEP_DEBUG)、ステップサマリー、annotations               |
| **cost-optimization-gha**        | 実行時間短縮、キャッシュ活用、不要なワークフロー抑制、if 条件での早期終了     |
| **notification-integration-gha** | Slack/Discord/Email 通知、ステータスバッジ、コミットステータス API            |
| **github-api-integration**       | GitHub REST/GraphQL API、gh CLI 活用、トークン管理                            |
| **workflow-templates**           | Organization workflow templates、スターターワークフロー                       |
| **concurrency-control**          | 同時実行制御(concurrency)、キャンセル戦略(cancel-in-progress)                 |
```
