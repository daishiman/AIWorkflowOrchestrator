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

| スキル名 | パス | 概要 |
|---------|------|------|
| **requirements-engineering** | `.claude/skills/requirements-engineering/SKILL.md` | Karl Wiegers方法論、MoSCoW優先度、曖昧性検出、トリアージフレームワーク |
| **use-case-modeling** | `.claude/skills/use-case-modeling/SKILL.md` | アクター識別、シナリオパターン、ユースケース関係（include/extend/generalization） |
| **acceptance-criteria-writing** | `.claude/skills/acceptance-criteria-writing/SKILL.md` | Given-When-Then形式、テスト可能性基準、エッジケースパターン |
| **interview-techniques** | `.claude/skills/interview-techniques/SKILL.md` | 5W1Hフレームワーク、Why分析（5 Whys）、質問タイプ分類 |
| **functional-non-functional-requirements** | `.claude/skills/functional-non-functional-requirements/SKILL.md` | FR/NFR分類、FURPS+品質モデル、測定可能な目標定義 |
```

## 3. テクニカルライター

- **エージェント名:** `@spec-writer`
- **エージェントの配置:** `.claude/agents/spec-writer.md`

```markdown
- **必要なスキル**:

| スキル名                              | パス | 概要                                             |
| ------------------------------------- | ---- | ------------------------------------------------ |
| **markdown-advanced-syntax**          | `.claude/skills/markdown-advanced-syntax/SKILL.md` | Mermaid 図、テーブル、コードブロックの活用       |
| **technical-documentation-standards** | `.claude/skills/technical-documentation-standards/SKILL.md` | IEEE 830、DRY 原則、Documentation as Code        |
| **api-documentation-best-practices**  | `.claude/skills/api-documentation-best-practices/SKILL.md` | OpenAPI、Swagger、エンドポイント記述             |
| **structured-writing**                | `.claude/skills/structured-writing/SKILL.md` | DITA、トピックベースライティング、モジュール構造 |
| **version-control-for-docs**          | `.claude/skills/version-control-for-docs/SKILL.md` | Git Diff 活用、変更履歴管理、レビューフロー      |
```

## 4. アーキテクチャ・ポリス

- **エージェント名:** `@arch-police`
- **エージェントの配置:** `.claude/agents/arch-police.md`

```markdown
- **必要なスキル**:

| スキル名                          | パス | 概要                                           |
| --------------------------------- | ---- | ---------------------------------------------- |
| **clean-architecture-principles** | `.claude/skills/clean-architecture-principles/SKILL.md` | 依存関係ルール、レイヤー構造、プロジェクト固有マッピング |
| **solid-principles**              | `.claude/skills/solid-principles/SKILL.md` | SRP, OCP, LSP, ISP, DIP の評価基準と検出パターン |
| **dependency-analysis**           | `.claude/skills/dependency-analysis/SKILL.md` | 依存グラフ構築、循環依存検出、安定度メトリクス |
| **architectural-patterns**        | `.claude/skills/architectural-patterns/SKILL.md` | Hexagonal, Onion, Vertical Slice パターンの評価 |
| **code-smell-detection**          | `.claude/skills/code-smell-detection/SKILL.md` | クラス/メソッドスメル、アーキテクチャアンチパターン |
```

## 5. UI コンポーネント設計

- **エージェント名:** `@ui-designer`
- **エージェントの配置:** `.claude/agents/ui-designer.md`

```markdown
- **必要なスキル**:

| スキル名                           | パス | 概要                                                                   |
| ---------------------------------- | ---- | ---------------------------------------------------------------------- |
| **design-system-architecture**     | `.claude/skills/design-system-architecture/SKILL.md` | コンポーネント規約、デザイントークン、Figma/コード統合                 |
| **component-composition-patterns** | `.claude/skills/component-composition-patterns/SKILL.md` | Slot/Compound/Controlled-Uncontrolled パターン、再利用性と拡張性の追求 |
| **headless-ui-principles**         | `.claude/skills/headless-ui-principles/SKILL.md` | 見た目非依存 UI、ロジックとプレゼンテーションの分離                    |
| **tailwind-css-patterns**          | `.claude/skills/tailwind-css-patterns/SKILL.md` | カスタムユーティリティ、デザイントークン連携、アクセシビリティ         |
| **accessibility-wcag**             | `.claude/skills/accessibility-wcag/SKILL.md` | WCAG 2.1、ARIA、キーボード・モバイル完全対応                           |
| **apple-hig-guidelines**           | `.claude/skills/apple-hig-guidelines/SKILL.md` | Apple HIG準拠設計、iOS/iPadOS/macOS/watchOS/visionOS対応、角丸・シャドウ・アニメーション |
```

## 6. ページ/ルーティング実装

- **エージェント名:** `@router-dev`
- **エージェントの配置:** `.claude/agents/router-dev.md`

```markdown
- **必要なスキル**:

| スキル名                       | パス | 概要                                              |
| ------------------------------ | ---- | ------------------------------------------------- |
| **nextjs-app-router**          | `.claude/skills/nextjs-app-router/SKILL.md` | App Routerアーキテクチャ、Server/Client Components分離、Dynamic Routes |
| **server-components-patterns** | `.claude/skills/server-components-patterns/SKILL.md` | サーバーサイドデータフェッチ、Suspense活用、キャッシュ戦略 |
| **seo-optimization**           | `.claude/skills/seo-optimization/SKILL.md` | Metadata API、OGP/Twitter Cards、構造化データ（JSON-LD） |
| **web-performance**            | `.claude/skills/web-performance/SKILL.md` | 動的インポート、next/image最適化、Code Splitting、Core Web Vitals |
| **error-handling-pages**       | `.claude/skills/error-handling-pages/SKILL.md` | error.tsx、not-found.tsx、global-error.tsx、loading.tsx |
```

## 7. クライアント状態管理

- **エージェント名:** `@state-manager`
- **エージェントの配置:** `.claude/agents/state-manager.md`

```markdown
- **必要なスキル**:

| スキル名                     | パス | 概要                                                         |
| ---------------------------- | ---- | ------------------------------------------------------------ |
| **react-hooks-advanced**     | `.claude/skills/react-hooks-advanced/SKILL.md` | useEffect, useCallback, useMemo, useReducer の適切な使い分け |
| **data-fetching-strategies** | `.claude/skills/data-fetching-strategies/SKILL.md` | SWR, React Query、キャッシュ戦略、Optimistic Updates         |
| **state-lifting**            | `.claude/skills/state-lifting/SKILL.md` | State Lifting、Context API、Props Drilling 回避              |
| **custom-hooks-patterns**    | `.claude/skills/custom-hooks-patterns/SKILL.md` | ロジック再利用、関心の分離                                   |
| **error-boundary**           | `.claude/skills/error-boundary/SKILL.md` | Error Boundary 実装、Fallback UI 設計                        |
```

## 8. ドメインモデラー

- **エージェント名:** `@domain-modeler`

- **エージェントの配置:** `.claude/agents/domain-modeler.md`

```markdown
- **必要なスキル**:

| スキル名                  | パス | 概要                                                |
| ------------------------- | ---- | --------------------------------------------------- |
| **domain-driven-design**  | `.claude/skills/domain-driven-design/SKILL.md` | Entity, Value Object, Aggregate, Repository Pattern |
| **ubiquitous-language**   | `.claude/skills/ubiquitous-language/SKILL.md` | ドメインエキスパートとの共通言語、用語集作成        |
| **value-object-patterns** | `.claude/skills/value-object-patterns/SKILL.md` | 不変性、型安全性、ビジネスルールのカプセル化        |
| **domain-services**       | `.claude/skills/domain-services/SKILL.md` | ドメインロジックの集約、エンティティ間の協調        |
| **bounded-context**       | `.claude/skills/bounded-context/SKILL.md` | コンテキスト境界の定義、サブドメイン分割            |
```

## 9. ワークフローエンジン実装

- **エージェント名:** `@workflow-engine`

- **エージェントの配置:** `.claude/agents/workflow-engine.md`

```markdown
- **参照スキル（パス: `.claude/skills/[スキル名]/SKILL.md`）**:

| スキル名                       | パス | 概要                                                |
| ------------------------------ | ---- | --------------------------------------------------- |
| **design-patterns-behavioral** | `.claude/skills/design-patterns-behavioral/SKILL.md` | Strategy, Template Method, Command, Chain of Responsibility, Observer, State |
| **plugin-architecture**        | `.claude/skills/plugin-architecture/SKILL.md` | レジストリパターン、動的ロード、依存性注入、プラグインライフサイクル |
| **interface-segregation**      | `.claude/skills/interface-segregation/SKILL.md` | ISP準拠設計、Fat Interface検出、ロールベースインターフェース |
| **factory-patterns**           | `.claude/skills/factory-patterns/SKILL.md` | Factory Method, Abstract Factory, Builder, Registry Factory |
| **open-closed-principle**      | `.claude/skills/open-closed-principle/SKILL.md` | 拡張メカニズム、OCP準拠パターン、OCPへのリファクタリング |
```

## 10. 外部連携ゲートウェイ

- **エージェント名:** `@gateway-dev`

- **エージェントの配置:** `.claude/agents/gateway-dev.md`

```markdown
- **必要なスキル**:

| スキル名                 | パス | 概要                                                   |
| ------------------------ | ---- | ------------------------------------------------------ |
| **api-client-patterns**  | `.claude/skills/api-client-patterns/SKILL.md` | Adapter Pattern、Facade Pattern、Anti-Corruption Layer |
| **retry-strategies**     | `.claude/skills/retry-strategies/SKILL.md` | Exponential Backoff、Circuit Breaker、Bulkhead         |
| **http-best-practices**  | `.claude/skills/http-best-practices/SKILL.md` | ステータスコード、タイムアウト、べき等性               |
| **authentication-flows** | `.claude/skills/authentication-flows/SKILL.md` | OAuth 2.0、JWT、API Key 管理                           |
| **rate-limiting**        | `.claude/skills/rate-limiting/SKILL.md` | レート制限対応、キューイング、スロットリング           |
```

## 11. スキーマ定義

- **エージェント名:** `@schema-def`

- **エージェントの配置:** `.claude/agents/schema-def.md`

```markdown
- **必要なスキル**:

| スキル名                 | パス                                                  | 概要                                                  |
| ------------------------ | ----------------------------------------------------- | ----------------------------------------------------- |
| **zod-validation**       | `.claude/skills/zod-validation/SKILL.md`              | Zod スキーマ定義、型推論、カスタムバリデーション      |
| **type-safety-patterns** | `.claude/skills/type-safety-patterns/SKILL.md`        | TypeScript 厳格モード、型ガード、Discriminated Unions |
| **input-sanitization**   | `.claude/skills/input-sanitization/SKILL.md`          | XSS 対策、SQL インジェクション対策、エスケープ処理    |
| **error-message-design** | `.claude/skills/error-message-design/SKILL.md`        | ユーザーフレンドリーなエラーメッセージ、i18n 対応     |
| **json-schema**          | `.claude/skills/json-schema/SKILL.md`                 | JSON Schema 仕様、スキーマバージョニング              |
```

## 12. ビジネスロジック実装

- **エージェント名:** `@logic-dev`

- **エージェントの配置:** `.claude/agents/logic-dev.md`

```markdown
- **必要なスキル**:

| スキル名                   | パス | 概要                                                                |
| -------------------------- | ---- | ------------------------------------------------------------------- |
| **refactoring-techniques** | `.claude/skills/refactoring-techniques/SKILL.md` | Extract Method、Replace Temp with Query、Introduce Parameter Object |
| **tdd-red-green-refactor** | `.claude/skills/tdd-red-green-refactor/SKILL.md` | テスト駆動開発サイクル、テストファースト                            |
| **clean-code-practices**   | `.claude/skills/clean-code-practices/SKILL.md` | 意味のある命名、小さな関数、DRY 原則                                |
| **transaction-script**     | `.claude/skills/transaction-script/SKILL.md` | シンプルな手続き型ロジック、適切な粒度                              |
| **test-doubles**           | `.claude/skills/test-doubles/SKILL.md` | Mock, Stub, Fake, Spy の使い分け                                    |
```

## 13. AI プロンプトエンジニア

- **エージェント名:** `@prompt-eng`

- **エージェントの配置:** `.claude/agents/prompt-eng.md`

```markdown
- **必要なスキル**:

| スキル名 | パス | 概要 |
|---------|------|------|
| **prompt-engineering-for-agents** | `.claude/skills/prompt-engineering-for-agents/SKILL.md` | エージェント向けプロンプト設計、システムプロンプト最適化 |
| **context-optimization** | `.claude/skills/context-optimization/SKILL.md` | コンテキストウィンドウ最適化、トークン削減技術 |
| **agent-persona-design** | `.claude/skills/agent-persona-design/SKILL.md` | エージェントペルソナ設計、役割付与、専門性の強化 |
| **documentation-architecture** | `.claude/skills/documentation-architecture/SKILL.md` | ドキュメント構造設計、階層化 |
| **best-practices-curation** | `.claude/skills/best-practices-curation/SKILL.md` | ベストプラクティス収集、品質検証、評価基準 |
| **structured-output-design** | `.claude/skills/structured-output-design/SKILL.md` | JSON Mode、Function Calling、Schema-based Output |
| **hallucination-prevention** | `.claude/skills/hallucination-prevention/SKILL.md` | 3層防御、パラメータ調整、検証ステップ |
| **few-shot-learning-patterns** | `.claude/skills/few-shot-learning-patterns/SKILL.md` | 例示設計、Shot数戦略、ドメイン別パターン |
| **chain-of-thought-reasoning** | `.claude/skills/chain-of-thought-reasoning/SKILL.md` | CoT推論、Self-Consistency、推論パターン |
| **prompt-testing-evaluation** | `.claude/skills/prompt-testing-evaluation/SKILL.md` | A/Bテスト、評価メトリクス、自動評価 |
| **prompt-versioning-management** | `.claude/skills/prompt-versioning-management/SKILL.md` | バージョン管理、デプロイ戦略、ロールバック |
```

## 14. DB スキーマ設計

- **エージェント名:** `@db-architect`
- **エージェントの配置:** `.claude/agents/db-architect.md`
- **バージョン:** v2.0.0
- **ステータス:** ✅ 実装完了

```markdown
- **必要なスキル**:

| スキル名                    | パス | 概要 |
| --------------------------- | ---- | ---- |
| **database-normalization**  | `.claude/skills/database-normalization/SKILL.md` | 第 1〜5 正規形、BCNF、意図的な非正規化、更新異常回避 |
| **indexing-strategies**     | `.claude/skills/indexing-strategies/SKILL.md` | B-Tree、GIN、GiST、BRIN インデックス、部分インデックス、式インデックス |
| **sql-anti-patterns**       | `.claude/skills/sql-anti-patterns/SKILL.md` | ジェイウォーク、EAV、Polymorphic Associations、25種のアンチパターン回避 |
| **jsonb-optimization**      | `.claude/skills/jsonb-optimization/SKILL.md` | GINインデックス、jsonb_path_ops、@>演算子最適化、Zodスキーマ統合 |
| **foreign-key-constraints** | `.claude/skills/foreign-key-constraints/SKILL.md` | CASCADE動作戦略、ソフトデリート統合、循環参照回避 |
| **transaction-management**  | `.claude/skills/transaction-management/SKILL.md` | ACID特性、分離レベル（READ COMMITTED〜SERIALIZABLE）、楽観的/悲観的ロック、デッドロック回避 |
| **query-optimization**      | `.claude/skills/query-optimization/SKILL.md` | EXPLAIN ANALYZE、N+1問題検出、JOINアルゴリズム選択、インデックスチューニング |
| **database-migrations**     | `.claude/skills/database-migrations/SKILL.md` | Drizzle Kit、ゼロダウンタイムマイグレーション、ロールバック計画、Expand-Contract |
```

## 15. リポジトリ実装

- **エージェント名:** `@repo-dev`
- **エージェントの配置:** `.claude/agents/repo-dev.md`

```markdown
- **必要なスキル**:

| スキル名                   | パス | 概要                                                             |
| -------------------------- | ---- | ---------------------------------------------------------------- |
| **repository-pattern**     | `.claude/skills/repository-pattern/SKILL.md` | コレクション風インターフェース、ドメイン型返却                   |
| **query-optimization**     | `.claude/skills/query-optimization/SKILL.md` | N+1 問題回避、Eager/Lazy Loading、JOIN 戦略                      |
| **transaction-management** | `.claude/skills/transaction-management/SKILL.md` | ACID 特性、トランザクション境界、ロールバック処理                |
| **orm-best-practices**     | `.claude/skills/orm-best-practices/SKILL.md` | Drizzle ORM の効率的利用、Raw SQL との使い分け                   |
| **database-migrations**    | `.claude/skills/database-migrations/SKILL.md` | スキーマバージョニング、データマイグレーション、ロールバック計画 |
```

## 16. DevOps/CI エンジニア

- **エージェント名:** `@devops-eng`
- **エージェントの配置:** `.claude/agents/devops-eng.md`

```markdown
- **必要なスキル**:

| スキル名                   | パス                                              | 概要                                                           |
| -------------------------- | ------------------------------------------------- | -------------------------------------------------------------- |
| **ci-cd-pipelines**        | `.claude/skills/ci-cd-pipelines/SKILL.md`         | GitHub Actions、デプロイパイプライン設計、ステージング環境     |
| **infrastructure-as-code** | `.claude/skills/infrastructure-as-code/SKILL.md`  | 構成管理の自動化、環境変数管理、Secret 管理                    |
| **deployment-strategies**  | `.claude/skills/deployment-strategies/SKILL.md`   | Blue-Green Deployment、Canary Release、ロールバック戦略        |
| **monitoring-alerting**    | `.claude/skills/monitoring-alerting/SKILL.md`     | ヘルスチェック、ログ集約、メトリクス可視化                     |
| **docker-best-practices**  | `.claude/skills/docker-best-practices/SKILL.md`   | マルチステージビルド、レイヤーキャッシュ、セキュリティスキャン |
| **security-scanning**      | `.claude/skills/security-scanning/SKILL.md`       | 依存関係脆弱性、コンテナスキャン、SBOM生成、シークレット検出   |
```

## 17. ファイル監視 (Watcher)

- **エージェント名:** `@local-watcher`
- **エージェントの配置:** `.claude/agents/local-watcher.md`

```markdown
- **必要なスキル**:

| スキル名 | パス | 概要 |
|---------|------|------|
| **event-driven-file-watching** | `.claude/skills/event-driven-file-watching/SKILL.md` | Chokidarによるファイル監視、Observer Pattern、EventEmitter設計 |
| **debounce-throttle-patterns** | `.claude/skills/debounce-throttle-patterns/SKILL.md` | イベント最適化、連続発火防止、デバウンス・スロットリング実装 |
| **file-exclusion-patterns** | `.claude/skills/file-exclusion-patterns/SKILL.md` | .gitignore互換除外パターン、glob pattern、効率的フィルタリング |
| **nodejs-stream-processing** | `.claude/skills/nodejs-stream-processing/SKILL.md` | ストリーム処理、バックプレッシャー管理、大容量ファイル処理 |
| **graceful-shutdown-patterns** | `.claude/skills/graceful-shutdown-patterns/SKILL.md` | シグナルハンドリング、リソースクリーンアップ、終了処理 |
| **file-watcher-security** | `.claude/skills/file-watcher-security/SKILL.md` | パストラバーサル防止、シンボリックリンク検証、サンドボックス |
| **file-watcher-observability** | `.claude/skills/file-watcher-observability/SKILL.md` | Prometheusメトリクス、構造化ログ、アラート設計 |
```

## 18. ネットワーク同期 (Sync)

- **エージェント名:** `@local-sync`
- **エージェントの配置:** `.claude/agents/local-sync.md`

```markdown
- **必要なスキル**:

| スキル名                        | パス                                                     | 概要                                                         |
| ------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| **multipart-upload**            | `.claude/skills/multipart-upload/SKILL.md`               | FormData、チャンクアップロード、進捗追跡、チェックサム検証   |
| **network-resilience**          | `.claude/skills/network-resilience/SKILL.md`             | オフラインキュー、再接続ロジック、状態同期、データ整合性     |
| **retry-strategies**            | `.claude/skills/retry-strategies/SKILL.md`               | 指数バックオフ、ジッター、サーキットブレーカー               |
| **multi-agent-systems**         | `.claude/skills/multi-agent-systems/SKILL.md`            | エージェント間連携、ハンドオフプロトコル                     |
| **agent-architecture-patterns** | `.claude/skills/agent-architecture-patterns/SKILL.md`    | エージェント構造、依存スキル設計パターン                     |
```

## 19. プロセス管理

- **エージェント名:** `@process-mgr`
- **エージェントの配置:** `.claude/agents/process-mgr.md`

```markdown
- **必要なスキル**:

| スキル名              | パス | 概要                                                 |
| --------------------- | ---- | ---------------------------------------------------- |
| **pm2-ecosystem-config** | `.claude/skills/pm2-ecosystem-config/SKILL.md` | PM2設定オプション、クラスタリング、環境変数管理 |
| **process-lifecycle-management** | `.claude/skills/process-lifecycle-management/SKILL.md` | プロセス状態、シグナル処理、子プロセス管理 |
| **graceful-shutdown-patterns** | `.claude/skills/graceful-shutdown-patterns/SKILL.md` | シャットダウンシーケンス、リソースクリーンアップ、接続ドレイン |
| **log-rotation-strategies** | `.claude/skills/log-rotation-strategies/SKILL.md` | pm2-logrotate、Winston、ログ集約、ディスク管理 |
| **memory-monitoring-strategies** | `.claude/skills/memory-monitoring-strategies/SKILL.md` | メモリメトリクス、リーク検出、ヒープ分析 |
```

## 20. ユニットテスター

- **エージェント名:** `@unit-tester`
- **エージェントの配置:** `.claude/agents/unit-tester.md`

```markdown
- **必要なスキル**:

| スキル名 | パス | 概要 |
|---------|------|------|
| **tdd-principles** | `.claude/skills/tdd-principles/SKILL.md` | Red-Green-Refactorサイクル、テストファースト、小さなステップ |
| **test-doubles** | `.claude/skills/test-doubles/SKILL.md` | Mock、Stub、Spy、Fake、Dummyの使い分け |
| **vitest-advanced** | `.claude/skills/vitest-advanced/SKILL.md` | テスト構造、モッキング、非同期テスト、カバレッジ最適化 |
| **boundary-value-analysis** | `.claude/skills/boundary-value-analysis/SKILL.md` | 境界値テスト、等価分割、エッジケース網羅 |
| **test-naming-conventions** | `.claude/skills/test-naming-conventions/SKILL.md` | Should形式、Given-When-Then、Arrange-Act-Assert |
```

## 21. E2E テスター

- **エージェント名:** `@e2e-tester`
- **エージェントの配置:** `.claude/agents/e2e-tester.md`

```markdown
- **必要なスキル**:

| スキル名 | パス | 概要 |
|---------|------|------|
| **playwright-testing** | `.claude/skills/playwright-testing/SKILL.md` | Playwrightブラウザ自動化、セレクタ戦略、待機戦略 |
| **test-data-management** | `.claude/skills/test-data-management/SKILL.md` | Seeding、Teardown、テストデータ分離 |
| **flaky-test-prevention** | `.claude/skills/flaky-test-prevention/SKILL.md` | リトライロジック、明示的待機、非決定性排除 |
| **visual-regression-testing** | `.claude/skills/visual-regression-testing/SKILL.md` | スクリーンショット比較、CSS アニメーション考慮 |
| **api-mocking** | `.claude/skills/api-mocking/SKILL.md` | MSW、Nock、モックサーバー構築 |
```

## 22. コード品質管理者 (Linter)

- **エージェント名:** `@code-quality`
- **エージェントの配置:** `.claude/agents/code-quality.md`

```markdown
- **必要なスキル**:

| スキル名                 | パス | 概要                                        |
| ------------------------ | ---- | ------------------------------------------- |
| **eslint-configuration** | `.claude/skills/eslint-configuration/SKILL.md` | ESLintルール設定、パーサー、プラグイン統合、競合解決  |
| **prettier-integration** | `.claude/skills/prettier-integration/SKILL.md` | Prettier統合、責務分離、エディタ統合、自動フォーマット戦略 |
| **static-analysis**      | `.claude/skills/static-analysis/SKILL.md` | 循環的複雑度、認知的複雑度、保守性指標、Code Smells検出      |
| **code-style-guides**    | `.claude/skills/code-style-guides/SKILL.md` | Airbnb、Google、Standard スタイルガイド選択と適用 |
| **commit-hooks**         | `.claude/skills/commit-hooks/SKILL.md` | Husky、lint-staged統合、pre-commit品質ゲート       |
```

## 23. 認証・認可スペシャリスト

- **エージェント名:** `@auth-specialist`
- **エージェントの配置:** `.claude/agents/auth-specialist.md`

```markdown
- **必要なスキル**:

| スキル名 | パス | 概要 |
| ----------------------- | ---- | ---- |
| **oauth2-flows** | `.claude/skills/oauth2-flows/SKILL.md` | Authorization Code Flow、PKCE、Refresh Token、セキュリティベストプラクティス、トークンストレージ戦略 |
| **session-management** | `.claude/skills/session-management/SKILL.md` | JWT/Database/Hybrid戦略、Cookie属性設定、トークンライフサイクル、セッション固定・ハイジャック対策 |
| **rbac-implementation** | `.claude/skills/rbac-implementation/SKILL.md` | ロール設計、権限モデル、多層アクセス制御（ミドルウェア/APIルート/データ層）、ポリシーエンジン |
| **nextauth-patterns** | `.claude/skills/nextauth-patterns/SKILL.md` | NextAuth.js v5設定、プロバイダー設定、Drizzleアダプター統合、セッションコールバック、型安全性 |
| **security-headers** | `.claude/skills/security-headers/SKILL.md` | CSP、HSTS、X-Frame-Options、Referrer-Policy、CSRF/XSS対策、Cookie属性安全化 |
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


## 26. ロギング・監視設計者

- **エージェント名:** `@sre-observer`
- **エージェントの配置:** `.claude/agents/sre-observer.md`

```markdown
- **必要なスキル**:

| スキル名 | パス | 概要 |
|---------|------|------|
| **structured-logging** | `.claude/skills/structured-logging/SKILL.md` | JSON 形式ログ、コンテキスト情報、ログレベル、相関ID、PIIマスキング |
| **observability-pillars** | `.claude/skills/observability-pillars/SKILL.md` | ログ、メトリクス、トレースの統合、OpenTelemetry、サンプリング戦略 |
| **slo-sli-design** | `.claude/skills/slo-sli-design/SKILL.md` | Service Level Objectives、Error Budget、SLI設計 |
| **alert-design** | `.claude/skills/alert-design/SKILL.md` | アラート閾値設定、通知ルーティング、Alert Fatigue 回避、適応的閾値 |
| **distributed-tracing** | `.claude/skills/distributed-tracing/SKILL.md` | OpenTelemetry、トレース ID、スパン管理、W3C Trace Context |
```

## 27. データベース管理者 (DBA)

- **エージェント名:** `@dba-mgr`
- **エージェントの配置:** `.claude/agents/dba-mgr.md`

```markdown
- **必要なスキル**:

| スキル名 | パス | 概要 |
|---------|------|------|
| **database-migrations** | `.claude/skills/database-migrations/SKILL.md` | Drizzle ORM マイグレーション、Up/Down可逆的変更、移行期間パターン |
| **backup-recovery** | `.claude/skills/backup-recovery/SKILL.md` | 多層防御バックアップ、PITR、RPO/RTO設計、災害復旧計画 |
| **query-performance-tuning** | `.claude/skills/query-performance-tuning/SKILL.md` | EXPLAIN ANALYZE、インデックス戦略、N+1問題解決 |
| **database-seeding** | `.claude/skills/database-seeding/SKILL.md` | 環境別Seeding、べき等性設計、ファクトリパターン |
| **connection-pooling** | `.claude/skills/connection-pooling/SKILL.md` | サーバーレス対応、接続数最適化、タイムアウト設定 |
| **pgvector-optimization** | `.claude/skills/pgvector-optimization/SKILL.md` | ベクトルDB設計、HNSW/IVFFlat、RAGパターン |
| **database-monitoring** | `.claude/skills/database-monitoring/SKILL.md` | PostgreSQL統計、スロークエリ監視、アラート設計 |
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

| スキル名                           | パス | 概要                                               |
| ---------------------------------- | ---- | -------------------------------------------------- |
| **semantic-versioning**            | `.claude/skills/semantic-versioning/SKILL.md` | Major、Minor、Patch バージョン理解、破壊的変更対応 |
| **dependency-auditing**            | `.claude/skills/dependency-auditing/SKILL.md` | npm/pnpm audit、CVSS評価、脆弱性スキャン      |
| **lock-file-management**           | `.claude/skills/lock-file-management/SKILL.md` | pnpm-lock.yaml、整合性検証、競合解決             |
| **upgrade-strategies**             | `.claude/skills/upgrade-strategies/SKILL.md` | 段階的アップグレード、TDD統合、ロールバック                 |
| **monorepo-dependency-management** | `.claude/skills/monorepo-dependency-management/SKILL.md` | pnpm Workspace、バージョン同期、影響分析          |
```

## 31. フック構成管理者

- **エージェント名:** `@hook-master`
- **エージェントの配置:** `.claude/agents/hook-master.md`

```markdown
- **必要なスキル**:

| スキル名 | パス | 概要 |
|---------|------|------|
| **git-hooks-concepts** | - | Git Hooks の基本概念 |
| **claude-code-hooks** | - | Claude Code フックシステム |
| **automation-scripting** | - | 自動化スクリプト作成 |
| **linting-formatting-automation** | - | Lint・フォーマット自動化 |
| **approval-gates** | - | 承認ゲート設計 |
```

## 32. コマンド・オーケストレーター

- **エージェント名:** `@command-arch`
- **エージェントの配置:** `.claude/agents/command-arch.md`

```markdown
- **必要なスキル**:

| スキル名 | パス | 概要 |
|---------|------|------|
| **command-structure-fundamentals** | `.claude/skills/command-structure-fundamentals/SKILL.md` | Claude Codeスラッシュコマンドの基本構造 |
| **command-arguments-system** | `.claude/skills/command-arguments-system/SKILL.md` | コマンド引数システム（$ARGUMENTS、位置引数） |
| **command-security-design** | `.claude/skills/command-security-design/SKILL.md` | コマンドのセキュリティ設計 |
| **command-basic-patterns** | `.claude/skills/command-basic-patterns/SKILL.md` | 4つの基本実装パターン |
| **command-advanced-patterns** | `.claude/skills/command-advanced-patterns/SKILL.md` | 高度な実装パターン（パイプライン、メタコマンド、インタラクティブ） |
| **command-agent-skill-integration** | `.claude/skills/command-agent-skill-integration/SKILL.md` | コマンド、エージェント、スキルの統合（三位一体） |
| **command-activation-mechanisms** | `.claude/skills/command-activation-mechanisms/SKILL.md` | コマンドの起動メカニズム |
| **command-error-handling** | `.claude/skills/command-error-handling/SKILL.md` | コマンドのエラーハンドリング |
| **command-naming-conventions** | `.claude/skills/command-naming-conventions/SKILL.md` | コマンドの命名規則 |
| **command-documentation-patterns** | `.claude/skills/command-documentation-patterns/SKILL.md` | コマンドのドキュメンテーション |
| **command-placement-priority** | `.claude/skills/command-placement-priority/SKILL.md` | コマンドの配置場所と優先順位 |
| **command-best-practices** | `.claude/skills/command-best-practices/SKILL.md` | コマンド設計のベストプラクティス |
| **command-performance-optimization** | `.claude/skills/command-performance-optimization/SKILL.md` | コマンドのパフォーマンス最適化 |
```

## 33. メタ・エージェント設計者

- **エージェント名:** `@meta-agent-designer`
- **エージェントの配置:** `.claude/agents/meta-agent-designer.md`

```markdown
- **必要なスキル**:

  | スキル名 | パス | 概要 |
  |---------|------|------|
  | **agent-architecture-patterns** | `.claude/skills/agent-architecture-patterns/SKILL.md` | オーケストレーター・ワーカー、ハブアンドスポーク、パイプライン、ステートマシンパターン |
  | **agent-structure-design** | `.claude/skills/agent-structure-design/SKILL.md` | YAML Frontmatter設計、システムプロンプト構造、5段階ワークフロー設計 |
  | **agent-dependency-design** | `.claude/skills/agent-dependency-design/SKILL.md` | スキル依存、エージェント依存、ハンドオフプロトコル、循環依存検出 |
  | **agent-quality-standards** | `.claude/skills/agent-quality-standards/SKILL.md` | 5カテゴリ品質基準（構造、設計原則、セキュリティ、ドキュメンテーション、統合） |
  | **agent-validation-testing** | `.claude/skills/agent-validation-testing/SKILL.md` | 正常系・エッジケース・異常系テスト、YAML/Markdown構文検証 |
  | **agent-template-patterns** | `.claude/skills/agent-template-patterns/SKILL.md` | 再利用可能エージェントテンプレート、変数設計、インスタンス化スクリプト |
  | **project-architecture-integration** | `.claude/skills/project-architecture-integration/SKILL.md` | ハイブリッドアーキテクチャ（shared/features）、データベース設計、REST API |
  | **agent-persona-design** | `.claude/skills/agent-persona-design/SKILL.md` | ペルソナ定義、役割の明確化、制約設定 |
  | **tool-permission-management** | `.claude/skills/tool-permission-management/SKILL.md` | 最小権限、ツールアクセス制御 |
  | **multi-agent-systems** | `.claude/skills/multi-agent-systems/SKILL.md` | エージェント間協調、メッセージパッシング |
  | **prompt-engineering-for-agents** | `.claude/skills/prompt-engineering-for-agents/SKILL.md` | System Prompt、Few-Shot Examples |
  | **agent-lifecycle-management** | `.claude/skills/agent-lifecycle-management/SKILL.md` | 起動、実行、終了、状態管理 |
```

## 34. スキル・ナレッジエンジニア

- **エージェント名:** `@skill-librarian`
- **エージェントの配置:** `.claude/agents/skill-librarian.md`

```markdown
- **必要なスキル**:

| スキル名 | パス | 概要 |
|---------|------|------|
| **knowledge-management** | `.claude/skills/knowledge-management/SKILL.md` | SECIモデルに基づく組織知識の形式知化と共有 |
| **progressive-disclosure** | `.claude/skills/progressive-disclosure/SKILL.md` | 3層開示モデルによるトークン効率と知識スケーラビリティの両立 |
| **documentation-architecture** | `.claude/skills/documentation-architecture/SKILL.md` | ドキュメント構造設計、リソース分割、階層設計 |
| **context-optimization** | `.claude/skills/context-optimization/SKILL.md` | トークン使用量の最小化と必要情報の効率的抽出 |
| **best-practices-curation** | `.claude/skills/best-practices-curation/SKILL.md` | ベストプラクティスの収集、評価、統合、更新 |
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
```

---

## 共通スキル（複数エージェントで使用）

以下のスキルは、上記の特定エージェントに限らず、複数のエージェントで共有されます。

### WebSocket通信パターン

- **スキル名:** `websocket-patterns`
- **パス:** `.claude/skills/websocket-patterns/SKILL.md`
- **バージョン:** v1.0.0

```markdown
- **概要**: WebSocketによる双方向リアルタイム通信パターン

| リソース名 | パス | 概要 |
|-----------|------|------|
| **connection-lifecycle** | `.claude/skills/websocket-patterns/resources/connection-lifecycle.md` | 接続ライフサイクル（open/close/error/message）、状態遷移管理 |
| **heartbeat-strategies** | `.claude/skills/websocket-patterns/resources/heartbeat-strategies.md` | Ping-Pongによる接続維持と死活監視 |
| **message-queueing** | `.claude/skills/websocket-patterns/resources/message-queueing.md` | 接続断時のメッセージバッファリングと順序保証送信 |

- **使用エージェント**: @local-sync, @gateway-dev
```

---

## 新規スキル - E2Eテスト関連 (2025-11-26 追加)

以下のスキルは @e2e-tester エージェント専用に作成されました:

| スキル名 | パス | 概要 |
|---------|------|------|
| **playwright-testing** | `.claude/skills/playwright-testing/SKILL.md` | Playwrightブラウザ自動化、セレクタ戦略、待機戦略 |
| **test-data-management** | `.claude/skills/test-data-management/SKILL.md` | Seeding、Teardown、テストデータ分離 |
| **flaky-test-prevention** | `.claude/skills/flaky-test-prevention/SKILL.md` | リトライロジック、明示的待機、非決定性排除 |
| **visual-regression-testing** | `.claude/skills/visual-regression-testing/SKILL.md` | スクリーンショット比較、CSS アニメーション考慮 |
| **api-mocking** | `.claude/skills/api-mocking/SKILL.md` | MSW、Nock、モックサーバー構築 |

---

## 新規スキル - セキュリティ監査関連 (2025-11-26 追加)

以下のスキルは @sec-auditor エージェント軽量化に伴い作成されました:

| スキル名 | パス | 概要 |
|---------|------|------|
| **authentication-authorization-security** | `.claude/skills/authentication-authorization-security/SKILL.md` | 認証・認可機構のセキュリティ評価、OAuth 2.0、JWT、RBAC/ABAC |
| **cryptographic-practices** | `.claude/skills/cryptographic-practices/SKILL.md` | 暗号化アルゴリズム評価、CSPRNG、鍵管理、弱い暗号排除 |
| **security-configuration-review** | `.claude/skills/security-configuration-review/SKILL.md` | セキュリティヘッダー、CORS、環境変数、CSP設定レビュー |
| **dependency-security-scanning** | `.claude/skills/dependency-security-scanning/SKILL.md` | 依存関係脆弱性スキャン、npm audit、Snyk、CVE評価 |
| **code-static-analysis-security** | `.claude/skills/code-static-analysis-security/SKILL.md` | SAST、SQLインジェクション、XSS、コマンドインジェクション検出 |
| **security-reporting** | `.claude/skills/security-reporting/SKILL.md` | セキュリティレポート生成、リスク評価、アクションプラン策定 |

---

## 新規スキル - Secret管理関連 (2025-11-26 追加)

以下のスキルは @secret-mgr エージェント専用に作成されました:

| スキル名 | パス | 概要 |
|---------|------|------|
| **secret-management-architecture** | `.claude/skills/secret-management-architecture/SKILL.md` | Secret管理方式選択、階層的管理設計、アクセス制御マトリクス、Rotation戦略 |
| **zero-trust-security** | `.claude/skills/zero-trust-security/SKILL.md` | Zero Trust 5原則、RBAC/ABAC実装、JITアクセス、継続的検証、異常検知 |
| **gitignore-management** | `.claude/skills/gitignore-management/SKILL.md` | .gitignore設計、機密ファイルパターン、プロジェクト固有除外、検証手法 |
| **pre-commit-security** | `.claude/skills/pre-commit-security/SKILL.md` | pre-commit hook実装、機密情報検出パターン、Git履歴スキャン、git-secrets/gitleaks統合 |
| **encryption-key-lifecycle** | `.claude/skills/encryption-key-lifecycle/SKILL.md` | 暗号化アルゴリズム選定、鍵生成・保管・使用・Rotation・廃棄の全フェーズ |
| **environment-isolation** | `.claude/skills/environment-isolation/SKILL.md` | 環境分離4レベル、環境別Secret管理、クロスアカウント制御、データマスキング |
| **railway-secrets-management** | `.claude/skills/railway-secrets-management/SKILL.md` | Railway Secrets、Variables、Neon Plugin自動注入、Railway CLI、一時ファイルセキュリティ |
| **github-actions-security** | `.claude/skills/github-actions-security/SKILL.md` | GitHub Secrets、Environment Secrets、ログマスキング、CI/CD品質ゲート統合 |

---

## 新規スキル - SRE/オブザーバビリティ関連 (2025-11-26 追加)

以下のスキルは @sre-observer エージェント専用に作成されました:

| スキル名 | パス | 概要 |
|---------|------|------|
| **structured-logging** | `.claude/skills/structured-logging/SKILL.md` | JSON形式ログ、ログレベル階層、相関ID体系、PIIマスキング、ログスキーマ設計 |
| **observability-pillars** | `.claude/skills/observability-pillars/SKILL.md` | ログ・メトリクス・トレース三本柱統合、OpenTelemetry、サンプリング戦略、高カーディナリティデータ |
| **slo-sli-design** | `.claude/skills/slo-sli-design/SKILL.md` | SLI設計、SLO設定フレームワーク、エラーバジェット計算・管理、ダッシュボード可視化 |
| **alert-design** | `.claude/skills/alert-design/SKILL.md` | アクション可能アラート設計、Alert Fatigue回避、適応的閾値、通知ルーティング |
| **distributed-tracing** | `.claude/skills/distributed-tracing/SKILL.md` | トレース構造設計、W3C Trace Context、スパン設計、ボトルネック特定 |

---

## 新規スキル - 認証・認可関連 (2025-11-26 追加)

以下のスキルは @auth-specialist エージェント軽量化により作成されました:

| スキル名 | パス | 概要 |
|---------|------|------|
| **oauth2-flows** | `.claude/skills/oauth2-flows/SKILL.md` | OAuth 2.0認可フロー（Authorization Code、PKCE、Refresh Token）、セキュリティベストプラクティス、トークンストレージ戦略 |
| **session-management** | `.claude/skills/session-management/SKILL.md` | セッション戦略（JWT/Database/Hybrid）、Cookie属性設定、トークンライフサイクル管理、セッション固定・ハイジャック対策 |
| **rbac-implementation** | `.claude/skills/rbac-implementation/SKILL.md` | ロールベースアクセス制御、ロール設計、権限モデル、多層アクセス制御、ポリシーエンジン構築 |
| **nextauth-patterns** | `.claude/skills/nextauth-patterns/SKILL.md` | NextAuth.js v5設定パターン、プロバイダー設定、Drizzleアダプター統合、セッションコールバックカスタマイズ |
| **security-headers** | `.claude/skills/security-headers/SKILL.md` | セキュリティヘッダー設定（CSP、HSTS、X-Frame-Options）、CSRF/XSS対策、Cookie属性安全化 |
```

---

## 新規スキル - ユーザーマニュアル作成関連 (2025-11-27 追加)

以下のスキルは @manual-writer エージェント軽量化（v2.0.0）により作成されました:

| スキル名 | パス | 概要 |
|---------|------|------|
| **user-centric-writing** | `.claude/skills/user-centric-writing/SKILL.md` | ユーザー中心ライティング、Kathy Sierraの5原則、タスク指向、平易な言葉、Flesch可読性測定スクリプト |
| **tutorial-design** | `.claude/skills/tutorial-design/SKILL.md` | チュートリアル設計、3段階学習パスモデル、ステップバイステップ構造、完了時間見積もりスクリプト |
| **troubleshooting-guides** | `.claude/skills/troubleshooting-guides/SKILL.md` | 診断フロー設計、エラー分類体系（1000-5999）、FAQ構造設計、解決策優先度付け |
| **information-architecture** | `.claude/skills/information-architecture/SKILL.md` | ドキュメント階層設計、3クリックルール、ナビゲーションパターン、サイトマップテンプレート、リンク検証スクリプト |
| **localization-i18n** | `.claude/skills/localization-i18n/SKILL.md` | 国際化対応、翻訳しやすい文章設計、多言語ディレクトリ構造、文化的配慮、翻訳準備度チェックスクリプト |

### スキル詳細

#### user-centric-writing
- **パス**: `.claude/skills/user-centric-writing/SKILL.md`
- **リソース**: `resources/plain-language-guide.md` - 平易な言葉ガイド、技術用語→日常語変換辞書
- **テンプレート**: `templates/persona-template.md` - ユーザーペルソナ定義テンプレート
- **スクリプト**: `scripts/measure-readability.mjs` - Flesch Reading Ease スコア測定

#### tutorial-design
- **パス**: `.claude/skills/tutorial-design/SKILL.md`
- **リソース**: `resources/learning-path-design.md` - 学習パス設計ガイド（レベル1-3構造）
- **テンプレート**: `templates/tutorial-template.md` - 標準チュートリアルテンプレート
- **スクリプト**: `scripts/estimate-completion-time.mjs` - チュートリアル完了時間見積もり

#### troubleshooting-guides
- **パス**: `.claude/skills/troubleshooting-guides/SKILL.md`
- **リソース**: `resources/problem-classification.md` - 問題分類とエスカレーションフロー
- **テンプレート**: `templates/diagnosis-flow-template.md` - 診断フローチャートテンプレート
- **テンプレート**: `templates/error-explanation-template.md` - エラー解説テンプレート

#### information-architecture
- **パス**: `.claude/skills/information-architecture/SKILL.md`
- **リソース**: `resources/navigation-patterns.md` - ナビゲーション設計パターン集
- **テンプレート**: `templates/sitemap-template.md` - サイトマップ設計テンプレート
- **スクリプト**: `scripts/validate-links.mjs` - 内部リンク整合性検証

#### localization-i18n
- **パス**: `.claude/skills/localization-i18n/SKILL.md`
- **リソース**: `resources/translation-ready-writing.md` - 翻訳準備ライティングガイド
- **テンプレート**: `templates/multilingual-doc-template.md` - 多言語ドキュメント構造テンプレート
- **スクリプト**: `scripts/check-translation-ready.mjs` - 翻訳準備度チェック・スコアリング
