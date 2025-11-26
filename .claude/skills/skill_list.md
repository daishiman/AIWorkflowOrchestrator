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

| スキル名                      | 概要                                                             |
| ----------------------------- | ---------------------------------------------------------------- |
| **agent-structure-design** | エージェント構造設計、YAML Frontmatter、必須セクション |
| **agent-architecture-patterns** | アーキテクチャパターン、循環依存検出、単一責任原則 |
| **context-optimization** | トークン最適化、文書サイズ管理、効率的コミュニケーション |
```

## 18. ネットワーク同期 (Sync)

- **エージェント名:** `@local-sync`
- **エージェントの配置:** `.claude/agents/local-sync.md`

```markdown
- **必要なスキル**:

| スキル名                | 概要                                                 |
| ----------------------- | ---------------------------------------------------- |
| **agent-architecture-patterns** | アーキテクチャパターン、循環依存検出、単一責任原則 |
| **best-practices-curation** | ベストプラクティスの収集、評価、統合、更新 |
| **context-optimization** | トークン使用量の最小化と必要情報の効率的抽出 |
```

## 19. プロセス管理

- **エージェント名:** `@process-mgr`
- **エージェントの配置:** `.claude/agents/process-mgr.md`

```markdown
- **必要なスキル**:

| スキル名              | 概要                                                 |
| --------------------- | ---------------------------------------------------- |
| **agent-lifecycle-management** | エージェント起動、実行、終了、状態管理 |
| **multi-agent-systems** | エージェント間協調、メッセージパッシング |
| **best-practices-curation** | ベストプラクティスの収集、評価、統合、更新 |
```

## 20. ユニットテスター

- **エージェント名:** `@unit-tester`
- **エージェントの配置:** `.claude/agents/unit-tester.md`

```markdown
- **必要なスキル**:

| スキル名                    | 概要                                                 |
| --------------------------- | ---------------------------------------------------- |
| **tdd-red-green-refactor**  | Red-Green-Refactor、テストファースト、テスト駆動設計 |
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
| **tool-permission-management** | ツール権限管理、最小権限原則 |
| **best-practices-curation** | セキュリティベストプラクティス、コード品質基準 |
| **project-architecture-integration** | ハイブリッドアーキテクチャ（shared/features）、データベース設計、REST API |
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
```
