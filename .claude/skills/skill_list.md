# スキル一覧

最終更新日: 2026-01-01

## 1. API Document Writer

- **エージェント名:** `.claude/agents/api-doc-writer.md`
- **エージェントの配置:** `.claude/agents/api-doc-writer.md`

| スキル名                                                     | パス                                                       | 概要                                             |
| ------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------ |
| **.claude/skills/openapi-specification/SKILL.md**            | `.claude/skills/openapi-specification/SKILL.md`            | OpenAPI 3.x仕様設計、スキーマ定義、path定義      |
| **.claude/skills/swagger-ui/SKILL.md**                       | `.claude/skills/swagger-ui/SKILL.md`                       | インタラクティブドキュメント、API Explorer構築   |
| **.claude/skills/api-versioning/SKILL.md**                   | `.claude/skills/api-versioning/SKILL.md`                   | バージョニング戦略、破壊的変更管理の実務指針     |
| **.claude/skills/request-response-examples/SKILL.md**        | `.claude/skills/request-response-examples/SKILL.md`        | cURLサンプル、SDK例、レスポンス例                |
| **.claude/skills/authentication-docs/SKILL.md**              | `.claude/skills/authentication-docs/SKILL.md`              | 認証フロー図解、トークン手順、セキュリティ注意点 |
| **.claude/skills/api-documentation-best-practices/SKILL.md** | `.claude/skills/api-documentation-best-practices/SKILL.md` | DX設計、自己完結型ドキュメントの実務指針         |

## 2. Architecture Police

- **エージェント名:** `.claude/agents/arch-police.md`
- **エージェントの配置:** `.claude/agents/arch-police.md`

| スキル名                                                  | パス                                                    | 概要                                             |
| --------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| **.claude/skills/clean-architecture-principles/SKILL.md** | `.claude/skills/clean-architecture-principles/SKILL.md` | 依存関係ルール、境界設計、レイヤー違反検出       |
| **.claude/skills/solid-principles/SKILL.md**              | `.claude/skills/solid-principles/SKILL.md`              | SRP, OCP, LSP, ISP, DIP の評価基準と検出パターン |
| **.claude/skills/dependency-analysis/SKILL.md**           | `.claude/skills/dependency-analysis/SKILL.md`           | 依存分析、循環依存、安定度評価                   |
| **.claude/skills/architectural-patterns/SKILL.md**        | `.claude/skills/architectural-patterns/SKILL.md`        | パターン選定、境界設計、準拠評価の実務指針       |
| **.claude/skills/code-smell-detection/SKILL.md**          | `.claude/skills/code-smell-detection/SKILL.md`          | スメル検出、優先度付け、アンチパターン整理       |

## 3. Auth Specialist

- **エージェント名:** `.claude/agents/auth-specialist.md`
- **エージェントの配置:** `.claude/agents/auth-specialist.md`

| スキル名                                        | パス                                          | 概要                                                       |
| ----------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| **.claude/skills/oauth2-flows/SKILL.md**        | `.claude/skills/oauth2-flows/SKILL.md`        | Authorization Code Flow、PKCE                              |
| **.claude/skills/session-management/SKILL.md**  | `.claude/skills/session-management/SKILL.md`  | セッション戦略、トークンライフサイクル、署名検証           |
| **.claude/skills/rbac-implementation/SKILL.md** | `.claude/skills/rbac-implementation/SKILL.md` | ロールベースアクセス制御、ポリシーエンジン、権限マトリクス |
| **.claude/skills/nextauth-patterns/SKILL.md**   | `.claude/skills/nextauth-patterns/SKILL.md`   | NextAuth.js設定、カスタムプロバイダー、コールバック        |
| **.claude/skills/security-headers/SKILL.md**    | `.claude/skills/security-headers/SKILL.md`    | CSP、HSTS、X-Frame-Options、CSRF対策                       |

## 4. Code Quality Manager

- **エージェント名:** `.claude/agents/code-quality.md`
- **エージェントの配置:** `.claude/agents/code-quality.md`

| スキル名                                         | パス                                           | 概要                                                      |
| ------------------------------------------------ | ---------------------------------------------- | --------------------------------------------------------- |
| **.claude/skills/eslint-configuration/SKILL.md** | `.claude/skills/eslint-configuration/SKILL.md` | Flat Config、カスタムルール、プラグイン統合               |
| **.claude/skills/prettier-integration/SKILL.md** | `.claude/skills/prettier-integration/SKILL.md` | ESLint統合、保存時自動フォーマット、設定共有              |
| **.claude/skills/static-analysis/SKILL.md**      | `.claude/skills/static-analysis/SKILL.md`      | 循環的複雑度、認知的複雑度、重複検出の実務指針            |
| **.claude/skills/code-style-guides/SKILL.md**    | `.claude/skills/code-style-guides/SKILL.md`    | スタイルガイド選定、移行、カスタマイズ                    |
| **.claude/skills/commit-hooks/SKILL.md**         | `.claude/skills/commit-hooks/SKILL.md`         | pre-commit/commit-msg/pre-push、lint-staged設計、検証運用 |

## 5. Command Architect - スラッシュコマンド作成エージェント

- **エージェント名:** `.claude/agents/command-arch.md`
- **エージェントの配置:** `.claude/agents/command-arch.md`

| スキル名                                                     | パス                                                       | 概要                                       |
| ------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------ |
| **.claude/skills/command-naming-conventions/SKILL.md**       | `.claude/skills/command-naming-conventions/SKILL.md`       | 命名規則と例外設計の整理                   |
| **.claude/skills/command-placement-priority/SKILL.md**       | `.claude/skills/command-placement-priority/SKILL.md`       | 配置判断と優先順位設計の整理               |
| **.claude/skills/command-structure-fundamentals/SKILL.md**   | `.claude/skills/command-structure-fundamentals/SKILL.md`   | コマンド構造とfrontmatter設計の整理        |
| **.claude/skills/command-arguments-system/SKILL.md**         | `.claude/skills/command-arguments-system/SKILL.md`         | 引数設計・検証・エラーメッセージ設計の整理 |
| **.claude/skills/command-basic-patterns/SKILL.md**           | `.claude/skills/command-basic-patterns/SKILL.md`           | 基本パターン選定とテンプレ適用の整理       |
| **.claude/skills/command-advanced-patterns/SKILL.md**        | `.claude/skills/command-advanced-patterns/SKILL.md`        | パターン選定、テンプレ適用、検証フロー     |
| **.claude/skills/command-activation-mechanisms/SKILL.md**    | `.claude/skills/command-activation-mechanisms/SKILL.md`    | 起動設計、トリガー設計、検証フロー         |
| **.claude/skills/command-security-design/SKILL.md**          | `.claude/skills/command-security-design/SKILL.md`          | セキュリティ制約と検証フローの整理         |
| **.claude/skills/command-error-handling/SKILL.md**           | `.claude/skills/command-error-handling/SKILL.md`           | エラーフロー設計と検証の整理               |
| **.claude/skills/command-documentation-patterns/SKILL.md**   | `.claude/skills/command-documentation-patterns/SKILL.md`   | ドキュメント設計と検証フローの整理         |
| **.claude/skills/command-best-practices/SKILL.md**           | `.claude/skills/command-best-practices/SKILL.md`           | ベストプラクティス適用と改善方針の整理     |
| **.claude/skills/command-performance-optimization/SKILL.md** | `.claude/skills/command-performance-optimization/SKILL.md` | パフォーマンス最適化と計測の整理           |
| **.claude/skills/command-agent-skill-integration/SKILL.md**  | `.claude/skills/command-agent-skill-integration/SKILL.md`  | 連携パターン設計、統合検証、複合フロー     |
| **.claude/skills/skill-name/SKILL.md**                       | `.claude/skills/skill-name/SKILL.md`                       | `@.claude/skills/skill-name/SKILL.md`      |

## 6. DB Schema Architect

- **エージェント名:** `.claude/agents/db-architect.md`
- **エージェントの配置:** `.claude/agents/db-architect.md`

| スキル名                                            | パス                                              | 概要                                                                         |
| --------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| **.claude/skills/database-normalization/SKILL.md**  | `.claude/skills/database-normalization/SKILL.md`  | 正規化設計、非正規化判断、品質検証                                           |
| **.claude/skills/indexing-strategies/SKILL.md**     | `.claude/skills/indexing-strategies/SKILL.md`     | SQLiteインデックス戦略（B-Tree、部分インデックス）                           |
| **.claude/skills/sql-anti-patterns/SKILL.md**       | `.claude/skills/sql-anti-patterns/SKILL.md`       | ジェイウォーク、EAV、Polymorphic Associations回避                            |
| **.claude/skills/json-optimization/SKILL.md**       | `.claude/skills/json-optimization/SKILL.md`       | SQLite JSON1拡張による柔軟なスキーマ設計                                     |
| **.claude/skills/foreign-key-constraints/SKILL.md** | `.claude/skills/foreign-key-constraints/SKILL.md` | 参照整合性とCASCADE動作の実務指針                                            |
| **.claude/skills/transaction-management/SKILL.md**  | `.claude/skills/transaction-management/SKILL.md`  | トランザクション分析/分離レベル/ロック戦略/ロールバック（4エージェント体制） |
| **.claude/skills/query-optimization/SKILL.md**      | `.claude/skills/query-optimization/SKILL.md`      | クエリプラン分析とパフォーマンスチューニング                                 |
| **.claude/skills/database-migrations/SKILL.md**     | `.claude/skills/database-migrations/SKILL.md`     | マイグレーション計画、移行期間、ロールバック、検証運用                       |
| **.claude/skills/drizzle-orm/SKILL.md**             | `.claude/skills/drizzle-orm/SKILL.md`             | Drizzle ORMスキーマ定義、型安全クエリ、マイグレーション管理                  |

## 7. Database Administrator (DBA)

- **エージェント名:** `.claude/agents/dba-mgr.md`
- **エージェントの配置:** `.claude/agents/dba-mgr.md`

| スキル名                                               | パス                                                 | 概要                                                   |
| ------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------ |
| **.claude/skills/database-migrations/SKILL.md**        | `.claude/skills/database-migrations/SKILL.md`        | マイグレーション計画、移行期間、ロールバック、検証運用 |
| **.claude/skills/backup-recovery/SKILL.md**            | `.claude/skills/backup-recovery/SKILL.md`            | バックアップ戦略、RPO/RTO、復旧ランブック、検証        |
| **.claude/skills/query-performance-tuning/SKILL.md**   | `.claude/skills/query-performance-tuning/SKILL.md`   | EXPLAIN QUERY PLAN、インデックス最適化、クエリ書き換え |
| **.claude/skills/database-seeding/SKILL.md**           | `.claude/skills/database-seeding/SKILL.md`           | 環境別シーディング、戦略設計、検証                     |
| **.claude/skills/connection-pooling/SKILL.md**         | `.claude/skills/connection-pooling/SKILL.md`         | 接続プール設計、サイジング、サーバーレス運用           |
| **.claude/skills/database-monitoring/SKILL.md**        | `.claude/skills/database-monitoring/SKILL.md`        | SQLite/Turso監視設計、SLI/SLO、アラート/ダッシュボード |
| **.claude/skills/vector-search-alternatives/SKILL.md** | `.claude/skills/vector-search-alternatives/SKILL.md` | ソリューション選定・VSS・外部DB・RAG（4エージェント）  |

## 8. .claude/agents/dep-mgr.md - 依存パッケージ管理者

- **エージェント名:** `.claude/agents/dep-mgr.md`
- **エージェントの配置:** `.claude/agents/dep-mgr.md`

| スキル名                                                   | パス                                                     | 概要                                                  |
| ---------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------- |
| **.claude/skills/semantic-versioning/SKILL.md**            | `.claude/skills/semantic-versioning/SKILL.md`            | Major/Minor/Patch判断、破壊的変更検出、SemVer範囲指定 |
| **.claude/skills/dependency-auditing/SKILL.md**            | `.claude/skills/dependency-auditing/SKILL.md`            | 依存監査、CVSS評価、修正計画                          |
| **.claude/skills/lock-file-management/SKILL.md**           | `.claude/skills/lock-file-management/SKILL.md`           | pnpm-lock.yaml整合性、競合解決、決定性ビルド          |
| **.claude/skills/upgrade-strategies/SKILL.md**             | `.claude/skills/upgrade-strategies/SKILL.md`             | 計画/分析/テスト/ロールアウト（4エージェント体制）    |
| **.claude/skills/monorepo-dependency-management/SKILL.md** | `.claude/skills/monorepo-dependency-management/SKILL.md` | pnpmワークスペース、バージョン同期、影響分析          |

## 9. DevOps/CI Engineer

- **エージェント名:** `.claude/agents/devops-eng.md`
- **エージェントの配置:** `.claude/agents/devops-eng.md`

| スキル名                                           | パス                                             | 概要                                                            |
| -------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- |
| **.claude/skills/ci-cd-pipelines/SKILL.md**        | `.claude/skills/ci-cd-pipelines/SKILL.md`        | GitHub ActionsのCI/CD設計、品質ゲート、並列化、キャッシュ最適化 |
| **.claude/skills/infrastructure-as-code/SKILL.md** | `.claude/skills/infrastructure-as-code/SKILL.md` | Railway、環境変数、IaC原則の実務指針                            |
| **.claude/skills/deployment-strategies/SKILL.md**  | `.claude/skills/deployment-strategies/SKILL.md`  | Blue-Green/Canary/Rolling、スモークテスト、ロールバック設計     |
| **.claude/skills/monitoring-alerting/SKILL.md**    | `.claude/skills/monitoring-alerting/SKILL.md`    | ゴールデンシグナル、アラート設計の実務指針                      |
| **.claude/skills/docker-best-practices/SKILL.md**  | `.claude/skills/docker-best-practices/SKILL.md`  | Dockerfile最適化、セキュリティ、検証運用                        |
| **.claude/skills/security-scanning/SKILL.md**      | `.claude/skills/security-scanning/SKILL.md`      | 脆弱性スキャン、SBOM、シークレット検出                          |

## 10. Domain Modeler

- **エージェント名:** `.claude/agents/domain-modeler.md`
- **エージェントの配置:** `.claude/agents/domain-modeler.md`

| スキル名                                              | パス                                                | 概要                                                                |
| ----------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| **.claude/skills/domain-driven-design/SKILL.md**      | `.claude/skills/domain-driven-design/SKILL.md`      | DDDの原則と実践パターン（Phase 1-2必須）                            |
| **.claude/skills/ubiquitous-language/SKILL.md**       | `.claude/skills/ubiquitous-language/SKILL.md`       | ユビキタス言語確立（用語抽出/定義/コード命名/維持 - 4エージェント） |
| **.claude/skills/value-object-patterns/SKILL.md**     | `.claude/skills/value-object-patterns/SKILL.md`     | 設計・実装・検出・統合（4エージェント）                             |
| **.claude/skills/domain-services/SKILL.md**           | `.claude/skills/domain-services/SKILL.md`           | ドメインサービスの配置設計（Phase 3推奨）                           |
| **.claude/skills/bounded-context/SKILL.md**           | `.claude/skills/bounded-context/SKILL.md`           | 境界定義、コンテキストマップ、統合戦略                              |
| **.claude/skills/event-driven-architecture/SKILL.md** | `.claude/skills/event-driven-architecture/SKILL.md` | イベント駆動アーキテクチャ、メッセージング、CQRS、Saga              |
| **.claude/skills/event-sourcing/SKILL.md**            | `.claude/skills/event-sourcing/SKILL.md`            | イベントソーシング、スナップショット、イベントリプレイ              |

## 11. E2E Tester Agent

- **エージェント名:** `.claude/agents/e2e-tester.md`
- **エージェントの配置:** `.claude/agents/e2e-tester.md`

| スキル名                                              | パス                                                | 概要                                                   |
| ----------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------ |
| **.claude/skills/playwright-testing/SKILL.md**        | `.claude/skills/playwright-testing/SKILL.md`        | ブラウザ自動化、セレクタ戦略、待機戦略、並列実行       |
| **.claude/skills/test-data-management/SKILL.md**      | `.claude/skills/test-data-management/SKILL.md`      | Seeding、Teardown、データ分離、トランザクション管理    |
| **.claude/skills/flaky-test-prevention/SKILL.md**     | `.claude/skills/flaky-test-prevention/SKILL.md`     | リトライロジック、明示的待機、非決定性排除、時刻モック |
| **.claude/skills/visual-regression-testing/SKILL.md** | `.claude/skills/visual-regression-testing/SKILL.md` | スクリーンショット比較、ピクセルdiff、CSS対応          |
| **.claude/skills/api-mocking/SKILL.md**               | `.claude/skills/api-mocking/SKILL.md`               | MSW、Nock、モックサーバー、リクエスト/レスポンス制御   |

## 12. Electron Architect

- **エージェント名:** `.claude/agents/electron-architect.md`
- **エージェントの配置:** `.claude/agents/electron-architect.md`

| スキル名                                          | パス                                            | 概要                                             |
| ------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| **.claude/skills/electron-architecture/SKILL.md** | `.claude/skills/electron-architecture/SKILL.md` | Main/Renderer分離、IPC設計、コンテキストブリッジ |

## 13. Electron Builder

- **エージェント名:** `.claude/agents/electron-builder.md`
- **エージェントの配置:** `.claude/agents/electron-builder.md`

| スキル名                                       | パス                                         | 概要                                   |
| ---------------------------------------------- | -------------------------------------------- | -------------------------------------- |
| **.claude/skills/electron-packaging/SKILL.md** | `.claude/skills/electron-packaging/SKILL.md` | electron-builder、コード署名、アイコン |

## 14. Electron DevOps

- **エージェント名:** `.claude/agents/electron-devops.md`
- **エージェントの配置:** `.claude/agents/electron-devops.md`

| スキル名                                          | パス                                            | 概要                                           |
| ------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------- |
| **.claude/skills/electron-packaging/SKILL.md**    | `.claude/skills/electron-packaging/SKILL.md`    | electron-builder、コード署名、アイコン         |
| **.claude/skills/electron-distribution/SKILL.md** | `.claude/skills/electron-distribution/SKILL.md` | 自動更新、リリースチャネル、配布の実務指針     |
| **.claude/skills/electron-auto-updater/SKILL.md** | `.claude/skills/electron-auto-updater/SKILL.md` | electron-updater、自動更新、段階的ロールアウト |
| **.claude/skills/electron-code-signing/SKILL.md** | `.claude/skills/electron-code-signing/SKILL.md` | コード署名、公証、証明書管理（macOS/Windows）  |

## 15. Electron Release Manager

- **エージェント名:** `.claude/agents/electron-release.md`
- **エージェントの配置:** `.claude/agents/electron-release.md`

| スキル名                                          | パス                                            | 概要                                           |
| ------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------- |
| **.claude/skills/electron-distribution/SKILL.md** | `.claude/skills/electron-distribution/SKILL.md` | 自動更新、リリースチャネル、配布の実務指針     |
| **.claude/skills/electron-auto-updater/SKILL.md** | `.claude/skills/electron-auto-updater/SKILL.md` | electron-updater、自動更新、段階的ロールアウト |
| **.claude/skills/electron-code-signing/SKILL.md** | `.claude/skills/electron-code-signing/SKILL.md` | コード署名、公証、証明書管理（macOS/Windows）  |

## 16. Electron Security Engineer

- **エージェント名:** `.claude/agents/electron-security.md`
- **エージェントの配置:** `.claude/agents/electron-security.md`

| スキル名                                                | パス                                                  | 概要                                     |
| ------------------------------------------------------- | ----------------------------------------------------- | ---------------------------------------- |
| **.claude/skills/electron-security-hardening/SKILL.md** | `.claude/skills/electron-security-hardening/SKILL.md` | サンドボックス、CSP、IPC安全性の実務指針 |

## 17. Electron UI Developer

- **エージェント名:** `.claude/agents/electron-ui-dev.md`
- **エージェントの配置:** `.claude/agents/electron-ui-dev.md`

| スキル名                                         | パス                                           | 概要                                        |
| ------------------------------------------------ | ---------------------------------------------- | ------------------------------------------- |
| **.claude/skills/electron-ui-patterns/SKILL.md** | `.claude/skills/electron-ui-patterns/SKILL.md` | BrowserWindow、メニュー、ダイアログ、トレイ |
| **.claude/skills/accessibility-wcag/SKILL.md**   | `.claude/skills/accessibility-wcag/SKILL.md`   | アクセシビリティ設計と検証フローの整理      |

## 18. Frontend Tester

- **エージェント名:** `.claude/agents/frontend-tester.md`
- **エージェントの配置:** `.claude/agents/frontend-tester.md`

| スキル名                                     | パス                                       | 概要                                               |
| -------------------------------------------- | ------------------------------------------ | -------------------------------------------------- |
| **.claude/skills/frontend-testing/SKILL.md** | `.claude/skills/frontend-testing/SKILL.md` | テストピラミッド、Vitest、RTL、Chromatic、axe-core |

## 19. Gateway Developer (外部連携ゲートウェイ開発者)

- **エージェント名:** `.claude/agents/gateway-dev.md`
- **エージェントの配置:** `.claude/agents/gateway-dev.md`

| スキル名                                         | パス                                           | 概要                                        |
| ------------------------------------------------ | ---------------------------------------------- | ------------------------------------------- |
| **.claude/skills/api-client-patterns/SKILL.md**  | `.claude/skills/api-client-patterns/SKILL.md`  | Adapter/Facade/Anti-Corruption Layer設計    |
| **.claude/skills/retry-strategies/SKILL.md**     | `.claude/skills/retry-strategies/SKILL.md`     | Exponential Backoff、Circuit Breaker        |
| **.claude/skills/http-best-practices/SKILL.md**  | `.claude/skills/http-best-practices/SKILL.md`  | ステータスコード処理、べき等性、接続管理    |
| **.claude/skills/authentication-flows/SKILL.md** | `.claude/skills/authentication-flows/SKILL.md` | 認証方式選定、トークン設計、設定検証        |
| **.claude/skills/rate-limiting/SKILL.md**        | `.claude/skills/rate-limiting/SKILL.md`        | Rate-Limitヘッダー、429処理、バックオフ戦略 |

## 20. GitHub Actions ワークフロー・アーキテクト

- **エージェント名:** `.claude/agents/gha-workflow-architect.md`
- **エージェントの配置:** `.claude/agents/gha-workflow-architect.md`

| スキル名                                                 | パス                                                   | 概要                                                                      |
| -------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------- |
| **.claude/skills/github-actions-syntax/SKILL.md**        | `.claude/skills/github-actions-syntax/SKILL.md`        | on/jobs/steps構文、トリガーイベント、スケジュール                         |
| **.claude/skills/github-actions-expressions/SKILL.md**   | `.claude/skills/github-actions-expressions/SKILL.md`   | ${{ }}式、github/env/secrets/needs コンテキスト                           |
| **.claude/skills/github-actions-debugging/SKILL.md**     | `.claude/skills/github-actions-debugging/SKILL.md`     | ACTIONS_STEP_DEBUG、ログ出力、失敗調査                                    |
| **.claude/skills/workflow-templates/SKILL.md**           | `.claude/skills/workflow-templates/SKILL.md`           | テンプレート選定・CI構築・CD構築・最適化（4エージェント）                 |
| **.claude/skills/reusable-workflows/SKILL.md**           | `.claude/skills/reusable-workflows/SKILL.md`           | workflow_call、inputs/outputs、secrets継承                                |
| **.claude/skills/matrix-builds/SKILL.md**                | `.claude/skills/matrix-builds/SKILL.md`                | strategy.matrix、include/exclude、並列実行                                |
| **.claude/skills/caching-strategies-gha/SKILL.md**       | `.claude/skills/caching-strategies-gha/SKILL.md`       | キャッシュ戦略、キー設計、ヒット率最適化、サイズ管理                      |
| **.claude/skills/secrets-management-gha/SKILL.md**       | `.claude/skills/secrets-management-gha/SKILL.md`       | GitHub Secrets、OIDC、最小権限トークン、環境変数                          |
| **.claude/skills/self-hosted-runners/SKILL.md**          | `.claude/skills/self-hosted-runners/SKILL.md`          | セルフホスト設定、スケール、セキュリティ                                  |
| **.claude/skills/parallel-jobs-gha/SKILL.md**            | `.claude/skills/parallel-jobs-gha/SKILL.md`            | needs依存、並列実行、タイムアウト制御                                     |
| **.claude/skills/conditional-execution-gha/SKILL.md**    | `.claude/skills/conditional-execution-gha/SKILL.md`    | 条件分岐設計、イベントフィルタ、検証                                      |
| **.claude/skills/artifact-management-gha/SKILL.md**      | `.claude/skills/artifact-management-gha/SKILL.md`      | アーティファクト共有、保持期間、クリーンアップ設計                        |
| **.claude/skills/deployment-environments-gha/SKILL.md**  | `.claude/skills/deployment-environments-gha/SKILL.md`  | 環境設計、承認フロー、シークレット管理                                    |
| **.claude/skills/notification-integration-gha/SKILL.md** | `.claude/skills/notification-integration-gha/SKILL.md` | Slack/Discord/Teams通知、ステータスバッジ                                 |
| **.claude/skills/cost-optimization-gha/SKILL.md**        | `.claude/skills/cost-optimization-gha/SKILL.md`        | コスト計測、ランナー選定、ストレージ管理、監視運用                        |
| **.claude/skills/docker-build-push-action/SKILL.md**     | `.claude/skills/docker-build-push-action/SKILL.md`     | build/push設計、認証/キャッシュ、検証運用                                 |
| **.claude/skills/github-api-integration/SKILL.md**       | `.claude/skills/github-api-integration/SKILL.md`       | GitHub REST/GraphQL API、GITHUB_TOKEN                                     |
| **.claude/skills/workflow-security/SKILL.md**            | `.claude/skills/workflow-security/SKILL.md`            | 権限監査・シークレット保護・サプライチェーン・PR安全設計（4エージェント） |
| **.claude/skills/composite-actions/SKILL.md**            | `.claude/skills/composite-actions/SKILL.md`            | Composite Actions 設計、入出力設計、検証                                  |
| **.claude/skills/concurrency-control/SKILL.md**          | `.claude/skills/concurrency-control/SKILL.md`          | 並行実行制御、group設計、競合回避                                         |

## 21. Hook Master

- **エージェント名:** `.claude/agents/hook-master.md`
- **エージェントの配置:** `.claude/agents/hook-master.md`

| スキル名                                                  | パス                                                    | 概要                                                |
| --------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------- |
| **.claude/skills/git-hooks-concepts/SKILL.md**            | `.claude/skills/git-hooks-concepts/SKILL.md`            | pre-commit、pre-push、ライフサイクル、Husky設定     |
| **.claude/skills/claude-code-hooks/SKILL.md**             | `.claude/skills/claude-code-hooks/SKILL.md`             | Claude Code hooks設計、イベント選定、品質ゲート検証 |
| **.claude/skills/automation-scripting/SKILL.md**          | `.claude/skills/automation-scripting/SKILL.md`          | 自動化設計、冪等性、エラー/ログ設計                 |
| **.claude/skills/linting-formatting-automation/SKILL.md** | `.claude/skills/linting-formatting-automation/SKILL.md` | ESLint/Prettier統合、lint-staged、自動修正          |
| **.claude/skills/approval-gates/SKILL.md**                | `.claude/skills/approval-gates/SKILL.md`                | 承認ゲート設計、リスク評価、変更管理の実務指針      |

## 22. Network Sync Agent (Local ⇄ Cloud)

- **エージェント名:** `.claude/agents/local-sync.md`
- **エージェントの配置:** `.claude/agents/local-sync.md`

| スキル名                                                | パス                                                  | 概要                                                                                    |
| ------------------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **.claude/skills/multipart-upload/SKILL.md**            | `.claude/skills/multipart-upload/SKILL.md`            | チャンク分割、S3 Multipart、進捗追跡、並列アップロード                                  |
| **.claude/skills/network-resilience/SKILL.md**          | `.claude/skills/network-resilience/SKILL.md`          | オフライン対応、再接続、Queue管理、整合性保証                                           |
| **.claude/skills/retry-strategies/SKILL.md**            | `.claude/skills/retry-strategies/SKILL.md`            | 指数バックオフ、ジッター、Circuit Breaker、タイムアウト                                 |
| **.claude/skills/websocket-patterns/SKILL.md**          | `.claude/skills/websocket-patterns/SKILL.md`          | 接続管理、メッセージキュー、ハートビート、Circuit Breaker（v2.0.0 - 4エージェント体制） |
| **.claude/skills/agent-architecture-patterns/SKILL.md** | `.claude/skills/agent-architecture-patterns/SKILL.md` | 専門知識と実行手順の参照の実務指針の実践ガイド                                          |
| **.claude/skills/multi-agent-systems/SKILL.md**         | `.claude/skills/multi-agent-systems/SKILL.md`         | 専門知識と実行手順の参照の実務指針の実践ガイド                                          |

## 23. Local File Watcher Agent

- **エージェント名:** `.claude/agents/local-watcher.md`
- **エージェントの配置:** `.claude/agents/local-watcher.md`

| スキル名                                               | パス                                                 | 概要                                              |
| ------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------- |
| **.claude/skills/event-driven-file-watching/SKILL.md** | `.claude/skills/event-driven-file-watching/SKILL.md` | Chokidar設定、Observer Pattern、EventEmitter      |
| **.claude/skills/debounce-throttle-patterns/SKILL.md** | `.claude/skills/debounce-throttle-patterns/SKILL.md` | デバウンス/スロットリング設計、検証、実装         |
| **.claude/skills/file-exclusion-patterns/SKILL.md**    | `.claude/skills/file-exclusion-patterns/SKILL.md`    | .gitignore互換除外パターン、glob pattern          |
| **.claude/skills/nodejs-stream-processing/SKILL.md**   | `.claude/skills/nodejs-stream-processing/SKILL.md`   | ストリーム処理、バックプレッシャー管理の実務指針  |
| **.claude/skills/graceful-shutdown-patterns/SKILL.md** | `.claude/skills/graceful-shutdown-patterns/SKILL.md` | シグナルハンドリング、リソースクリーンアップ      |
| **.claude/skills/file-watcher-security/SKILL.md**      | `.claude/skills/file-watcher-security/SKILL.md`      | パストラバーサル防止、symlink検証、サンドボックス |
| **.claude/skills/file-watcher-observability/SKILL.md** | `.claude/skills/file-watcher-observability/SKILL.md` | Prometheusメトリクス、構造化ログ、アラート        |

## 24. Logic Developer

- **エージェント名:** `.claude/agents/logic-dev.md`
- **エージェントの配置:** `.claude/agents/logic-dev.md`

| スキル名                                           | パス                                             | 概要                                                      |
| -------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| **.claude/skills/refactoring-techniques/SKILL.md** | `.claude/skills/refactoring-techniques/SKILL.md` | リファクタリング技法とコードスメル検出の実務指針          |
| **.claude/skills/tdd-red-green-refactor/SKILL.md** | `.claude/skills/tdd-red-green-refactor/SKILL.md` | テスト駆動開発とRed-Green-Refactorサイクル                |
| **.claude/skills/clean-code-practices/SKILL.md**   | `.claude/skills/clean-code-practices/SKILL.md`   | 命名改善、関数分割、重複排除の品質改善                    |
| **.claude/skills/transaction-script/SKILL.md**     | `.claude/skills/transaction-script/SKILL.md`     | パターン識別/スクリプト設計/品質検証（3エージェント体制） |
| **.claude/skills/test-doubles/SKILL.md**           | `.claude/skills/test-doubles/SKILL.md`           | テストダブル選択とモック戦略の実務指針の実践ガイド        |

## 25. ユーザーマニュアル作成者 (Manual Writer)

- **エージェント名:** `.claude/agents/manual-writer.md`
- **エージェントの配置:** `.claude/agents/manual-writer.md`

| スキル名                                             | パス                                               | 概要                                                                |
| ---------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------- |
| **.claude/skills/user-centric-writing/SKILL.md**     | `.claude/skills/user-centric-writing/SKILL.md`     | ペルソナ分析/コンテンツ作成/読みやすさレビュー（3エージェント体制） |
| **.claude/skills/tutorial-design/SKILL.md**          | `.claude/skills/tutorial-design/SKILL.md`          | 学習目標分析/パス設計/コンテンツ作成/評価設計（4エージェント体制）  |
| **.claude/skills/troubleshooting-guides/SKILL.md**   | `.claude/skills/troubleshooting-guides/SKILL.md`   | 問題分類/診断フロー/エラー説明/解決手順（4エージェント体制）        |
| **.claude/skills/information-architecture/SKILL.md** | `.claude/skills/information-architecture/SKILL.md` | ドキュメント構造、ナビゲーション、検索性                            |
| **.claude/skills/localization-i18n/SKILL.md**        | `.claude/skills/localization-i18n/SKILL.md`        | 多言語対応、文化的配慮、翻訳メモリの実務指針                        |

## 26. MCP ツール統合スペシャリスト

- **エージェント名:** `.claude/agents/mcp-integrator.md`
- **エージェントの配置:** `.claude/agents/mcp-integrator.md`

| スキル名                                          | パス                                            | 概要                                                        |
| ------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------- |
| **.claude/skills/mcp-protocol/SKILL.md**          | `.claude/skills/mcp-protocol/SKILL.md`          | MCPプロトコル仕様、JSON-RPC、サーバー・ツール・リソース定義 |
| **.claude/skills/api-connector-design/SKILL.md**  | `.claude/skills/api-connector-design/SKILL.md`  | API統合設計、認証フロー、Rate Limiting、リトライ戦略        |
| **.claude/skills/tool-security/SKILL.md**         | `.claude/skills/tool-security/SKILL.md`         | API Key管理、最小権限スコープ、入力検証、OAuth2統合         |
| **.claude/skills/resource-oriented-api/SKILL.md** | `.claude/skills/resource-oriented-api/SKILL.md` | リソースURI設計、キャッシュ戦略、バージョニング             |
| **.claude/skills/integration-patterns/SKILL.md**  | `.claude/skills/integration-patterns/SKILL.md`  | Adapter、Facade、Gateway、同期・非同期統合                  |

## 27. Meta-Agent Designer

- **エージェント名:** `.claude/agents/meta-agent-designer.md`
- **エージェントの配置:** `.claude/agents/meta-agent-designer.md`

| スキル名                                                     | パス                                                       | 概要                                             |
| ------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------ |
| **.claude/skills/agent-architecture-patterns/SKILL.md**      | `.claude/skills/agent-architecture-patterns/SKILL.md`      | アーキテクチャパターン選択と設計原則の実務指針   |
| **.claude/skills/agent-structure-design/SKILL.md**           | `.claude/skills/agent-structure-design/SKILL.md`           | YAML Frontmatter・ワークフロー設計               |
| **.claude/skills/agent-persona-design/SKILL.md**             | `.claude/skills/agent-persona-design/SKILL.md`             | ペルソナ・役割定義の実務指針の実践ガイド         |
| **.claude/skills/tool-permission-management/SKILL.md**       | `.claude/skills/tool-permission-management/SKILL.md`       | ツール権限・パス制限設定の実務指針の実践ガイド   |
| **.claude/skills/agent-dependency-design/SKILL.md**          | `.claude/skills/agent-dependency-design/SKILL.md`          | 依存関係・ハンドオフ設計の実務指針の実践ガイド   |
| **.claude/skills/multi-agent-systems/SKILL.md**              | `.claude/skills/multi-agent-systems/SKILL.md`              | マルチエージェント協調パターンの実務指針         |
| **.claude/skills/project-architecture-integration/SKILL.md** | `.claude/skills/project-architecture-integration/SKILL.md` | プロジェクト固有要件統合の実務指針の実践ガイド   |
| **.claude/skills/agent-quality-standards/SKILL.md**          | `.claude/skills/agent-quality-standards/SKILL.md`          | 品質基準・メトリクス設定の実務指針の実践ガイド   |
| **.claude/skills/agent-validation-testing/SKILL.md**         | `.claude/skills/agent-validation-testing/SKILL.md`         | 構文検証・テストケース作成の実務指針の実践ガイド |
| **.claude/skills/agent-template-patterns/SKILL.md**          | `.claude/skills/agent-template-patterns/SKILL.md`          | テンプレートパターン適用の実務指針の実践ガイド   |
| **.claude/skills/prompt-engineering-for-agents/SKILL.md**    | `.claude/skills/prompt-engineering-for-agents/SKILL.md`    | System Prompt最適化の実務指針                    |
| **.claude/skills/agent-lifecycle-management/SKILL.md**       | `.claude/skills/agent-lifecycle-management/SKILL.md`       | ライフサイクル・バージョン管理の実務指針         |

## 28. Process Manager

- **エージェント名:** `.claude/agents/process-mgr.md`
- **エージェントの配置:** `.claude/agents/process-mgr.md`

| スキル名                                                 | パス                                                   | 概要                                           |
| -------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| **.claude/skills/pm2-ecosystem-config/SKILL.md**         | `.claude/skills/pm2-ecosystem-config/SKILL.md`         | PM2設定オプション、実行モード、リソース制限    |
| **.claude/skills/log-rotation-strategies/SKILL.md**      | `.claude/skills/log-rotation-strategies/SKILL.md`      | pm2-logrotate、ログストレージ管理、世代管理    |
| **.claude/skills/memory-monitoring-strategies/SKILL.md** | `.claude/skills/memory-monitoring-strategies/SKILL.md` | メモリリーク検出、max_memory_restart設定       |
| **.claude/skills/graceful-shutdown-patterns/SKILL.md**   | `.claude/skills/graceful-shutdown-patterns/SKILL.md`   | Zero-Downtime Deployment、kill_timeout設定     |
| **.claude/skills/health-check-implementation/SKILL.md**  | `.claude/skills/health-check-implementation/SKILL.md`  | ヘルスチェックエンドポイント、wait_ready設定   |
| **.claude/skills/process-lifecycle-management/SKILL.md** | `.claude/skills/process-lifecycle-management/SKILL.md` | 専門知識と実行手順の参照の実務指針の実践ガイド |

## 29. Product Manager

- **エージェント名:** `.claude/agents/product-manager.md`
- **エージェントの配置:** `.claude/agents/product-manager.md`

| スキル名                                              | パス                                                | 概要                                                                  |
| ----------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| **.claude/skills/agile-project-management/SKILL.md**  | `.claude/skills/agile-project-management/SKILL.md`  | スクラム・カンバン手法、アジャイル原則の実務指針                      |
| **.claude/skills/sprint-planning/SKILL.md**           | `.claude/skills/sprint-planning/SKILL.md`           | スプリントゴール設定、キャパシティプランニング                        |
| **.claude/skills/user-story-mapping/SKILL.md**        | `.claude/skills/user-story-mapping/SKILL.md`        | 要件スコーピング/マップ構築/優先順位検証（3エージェント体制）         |
| **.claude/skills/estimation-techniques/SKILL.md**     | `.claude/skills/estimation-techniques/SKILL.md`     | ストーリーポイント、プランニングポーカー、ベロシティ計測、TDD工数考慮 |
| **.claude/skills/stakeholder-communication/SKILL.md** | `.claude/skills/stakeholder-communication/SKILL.md` | 進捗報告、期待値調整、透明性確保の実務指針                            |
| **.claude/skills/product-vision/SKILL.md**            | `.claude/skills/product-vision/SKILL.md`            | OKR設定、ロードマップ作成、ビジョン策定                               |
| **.claude/skills/prioritization-frameworks/SKILL.md** | `.claude/skills/prioritization-frameworks/SKILL.md` | MoSCoW法、RICE Scoring、価値評価                                      |
| **.claude/skills/metrics-tracking/SKILL.md**          | `.claude/skills/metrics-tracking/SKILL.md`          | ベロシティ、バーンダウン、サイクルタイム測定                          |
| **.claude/skills/backlog-management/SKILL.md**        | `.claude/skills/backlog-management/SKILL.md`        | バックログ整理、優先順位付け、健全性分析                              |
| **.claude/skills/risk-management/SKILL.md**           | `.claude/skills/risk-management/SKILL.md`           | リスク特定、評価、緩和戦略の実務指針の実践ガイド                      |

## 30. Prompt Engineering Specialist

- **エージェント名:** `.claude/agents/prompt-eng.md`
- **エージェントの配置:** `.claude/agents/prompt-eng.md`

| スキル名                                                  | パス                                                    | 概要                                             |
| --------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------ |
| **.claude/skills/chain-of-thought/SKILL.md**              | `.claude/skills/chain-of-thought/SKILL.md`              | 問題分解、論点整理、根拠サマリー作成             |
| **.claude/skills/few-shot-learning-patterns/SKILL.md**    | `.claude/skills/few-shot-learning-patterns/SKILL.md`    | 効果的な例示選択と文脈構成の実務指針の実践ガイド |
| **.claude/skills/role-prompting/SKILL.md**                | `.claude/skills/role-prompting/SKILL.md`                | ペルソナ設計と専門家ロール割り当ての実務指針     |
| **.claude/skills/prompt-versioning-management/SKILL.md**  | `.claude/skills/prompt-versioning-management/SKILL.md`  | バージョン管理と段階的改善の実務指針の実践ガイド |
| **.claude/skills/hallucination-prevention/SKILL.md**      | `.claude/skills/hallucination-prevention/SKILL.md`      | 幻覚抑制と根拠ベース推論の実務指針の実践ガイド   |
| **.claude/skills/structured-output/SKILL.md**             | `.claude/skills/structured-output/SKILL.md`             | JSON/XML/Markdownの構造化出力設計                |
| **.claude/skills/context-window-optimization/SKILL.md**   | `.claude/skills/context-window-optimization/SKILL.md`   | トークン予算管理、優先順位付け、圧縮・検証フロー |
| **.claude/skills/error-recovery-prompts/SKILL.md**        | `.claude/skills/error-recovery-prompts/SKILL.md`        | エラー処理と自己修正プロンプトの実務指針         |
| **.claude/skills/prompt-injection-defense/SKILL.md**      | `.claude/skills/prompt-injection-defense/SKILL.md`      | プロンプトインジェクション対策の実務指針         |
| **.claude/skills/multi-turn-conversation/SKILL.md**       | `.claude/skills/multi-turn-conversation/SKILL.md`       | 文脈保持と会話継続設計の実務指針の実践ガイド     |
| **.claude/skills/task-decomposition/SKILL.md**            | `.claude/skills/task-decomposition/SKILL.md`            | 複雑タスクの段階的分解の実務指針の実践ガイド     |
| **.claude/skills/prompt-engineering-for-agents/SKILL.md** | `.claude/skills/prompt-engineering-for-agents/SKILL.md` | 専門知識と実行手順の参照の実務指針の実践ガイド   |
| **.claude/skills/structured-output-design/SKILL.md**      | `.claude/skills/structured-output-design/SKILL.md`      | 専門知識と実行手順の参照の実務指針の実践ガイド   |
| **.claude/skills/chain-of-thought-reasoning/SKILL.md**    | `.claude/skills/chain-of-thought-reasoning/SKILL.md`    | 推論パターン選択、サマリー設計、自己一貫性       |
| **.claude/skills/prompt-testing-evaluation/SKILL.md**     | `.claude/skills/prompt-testing-evaluation/SKILL.md`     | 専門知識と実行手順の参照の実務指針の実践ガイド   |
| **.claude/skills/context-optimization/SKILL.md**          | `.claude/skills/context-optimization/SKILL.md`          | トークン最適化、遅延読み込み、参照設計           |
| **.claude/skills/agent-persona-design/SKILL.md**          | `.claude/skills/agent-persona-design/SKILL.md`          | 専門知識と実行手順の参照の実務指針の実践ガイド   |
| **.claude/skills/documentation-architecture/SKILL.md**    | `.claude/skills/documentation-architecture/SKILL.md`    | `.claude/skills/documentation-architectu         |
| **.claude/skills/best-practices-curation/SKILL.md**       | `.claude/skills/best-practices-curation/SKILL.md`       | 情報源信頼性評価、品質スコアリング、統合パターン |

## 31. Repository Developer

- **エージェント名:** `.claude/agents/repo-dev.md`
- **エージェントの配置:** `.claude/agents/repo-dev.md`

| スキル名                                           | パス                                             | 概要                                                   |
| -------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| **.claude/skills/repository-pattern/SKILL.md**     | `.claude/skills/repository-pattern/SKILL.md`     | リポジトリパターン、コレクション風API、抽象化設計      |
| **.claude/skills/orm-best-practices/SKILL.md**     | `.claude/skills/orm-best-practices/SKILL.md`     | Drizzle ORM TypeScript型安全クエリ、スキーマ定義       |
| **.claude/skills/transaction-management/SKILL.md** | `.claude/skills/transaction-management/SKILL.md` | ACID特性、分離レベル、楽観的ロック、ロールバック       |
| **.claude/skills/query-optimization/SKILL.md**     | `.claude/skills/query-optimization/SKILL.md`     | N+1問題解消、実行計画分析、インデックス活用            |
| **.claude/skills/connection-pooling/SKILL.md**     | `.claude/skills/connection-pooling/SKILL.md`     | 接続プール設計、サイジング、サーバーレス運用           |
| **.claude/skills/database-migrations/SKILL.md**    | `.claude/skills/database-migrations/SKILL.md`    | マイグレーション計画、移行期間、ロールバック、検証運用 |

## 32. Requirements Analyst

- **エージェント名:** `.claude/agents/req-analyst.md`
- **エージェントの配置:** `.claude/agents/req-analyst.md`

| スキル名                                                           | パス                                                             | 概要                                                        |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| **.claude/skills/requirements-triage/SKILL.md**                    | `.claude/skills/requirements-triage/SKILL.md`                    | MoSCoW分類、リスク評価、優先順位付けフレームワーク          |
| **.claude/skills/ambiguity-elimination/SKILL.md**                  | `.claude/skills/ambiguity-elimination/SKILL.md`                  | 5つの曖昧性パターン検出、定性→定量変換、具体化技法          |
| **.claude/skills/use-case-modeling/SKILL.md**                      | `.claude/skills/use-case-modeling/SKILL.md`                      | 要件収集/アクター識別/定義/シナリオ/図作成（5エージェント） |
| **.claude/skills/acceptance-criteria-writing/SKILL.md**            | `.claude/skills/acceptance-criteria-writing/SKILL.md`            | 受け入れ基準とテスト可能性の整理                            |
| **.claude/skills/functional-non-functional-requirements/SKILL.md** | `.claude/skills/functional-non-functional-requirements/SKILL.md` | FR/NFR分類、FURPS+/ISO 25010品質特性、測定可能性            |
| **.claude/skills/interview-techniques/SKILL.md**                   | `.claude/skills/interview-techniques/SKILL.md`                   | 5W1H質問法、オープン/クローズド質問、隠れたニーズ抽出       |
| **.claude/skills/requirements-verification/SKILL.md**              | `.claude/skills/requirements-verification/SKILL.md`              | 一貫性/完全性/検証可能性評価、品質メトリクス                |
| **.claude/skills/requirements-documentation/SKILL.md**             | `.claude/skills/requirements-documentation/SKILL.md`             | 標準ドキュメント構造、レビュー準備、ハンドオフプロトコル    |

## 33. ページ/ルーティング実装エージェント (router-dev)

- **エージェント名:** `.claude/agents/router-dev.md`
- **エージェントの配置:** `.claude/agents/router-dev.md`

| スキル名                                               | パス                                                 | 概要                                                                          |
| ------------------------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| **.claude/skills/nextjs-app-router/SKILL.md**          | `.claude/skills/nextjs-app-router/SKILL.md`          | App Router、Server Components                                                 |
| **.claude/skills/server-components-patterns/SKILL.md** | `.claude/skills/server-components-patterns/SKILL.md` | RSC、Streaming SSR、Suspense境界                                              |
| **.claude/skills/seo-optimization/SKILL.md**           | `.claude/skills/seo-optimization/SKILL.md`           | メタデータAPI、動的OG画像、sitemap.xml生成                                    |
| **.claude/skills/web-performance/SKILL.md**            | `.claude/skills/web-performance/SKILL.md`            | Core Web Vitals、画像・フォント・バンドル最適化（v2.0.0 - 4エージェント体制） |
| **.claude/skills/error-boundary/SKILL.md**             | `.claude/skills/error-boundary/SKILL.md`             | error.tsx、global-error.tsx、not-found.tsx                                    |
| **.claude/skills/data-fetching-strategies/SKILL.md**   | `.claude/skills/data-fetching-strategies/SKILL.md`   | ライブラリ選定、キャッシュ設計、エラー処理、楽観的更新                        |

## 34. Schema Definition Specialist

- **エージェント名:** `.claude/agents/schema-def.md`
- **エージェントの配置:** `.claude/agents/schema-def.md`

| スキル名                                            | パス                                              | 概要                                                                                          |
| --------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| **.claude/skills/zod-validation/SKILL.md**          | `.claude/skills/zod-validation/SKILL.md`          | Zodスキーマ設計、safeParse/refine、react-hook-form統合、API検証（v4.0.0 - 4エージェント体制） |
| **.claude/skills/type-safety-patterns/SKILL.md**    | `.claude/skills/type-safety-patterns/SKILL.md`    | TypeScript高度な型、ブランド型、型ガード関数                                                  |
| **.claude/skills/api-contract-design/SKILL.md**     | `.claude/skills/api-contract-design/SKILL.md`     | リクエスト/レスポンススキーマ、OpenAPI連携                                                    |
| **.claude/skills/form-validation/SKILL.md**         | `.claude/skills/form-validation/SKILL.md`         | フロントエンド連携、react-hook-form統合                                                       |
| **.claude/skills/data-transformation/SKILL.md**     | `.claude/skills/data-transformation/SKILL.md`     | スキーママッピング、ETL設計、品質検証、運用記録                                               |
| **.claude/skills/input-sanitization/SKILL.md**      | `.claude/skills/input-sanitization/SKILL.md`      | `.claude/skills/input-sanitization/SKILL                                                      |
| **.claude/skills/error-message-design/SKILL.md**    | `.claude/skills/error-message-design/SKILL.md`    | `.claude/skills/error-message-design/SKI                                                      |
| **.claude/skills/json-schema/SKILL.md**             | `.claude/skills/json-schema/SKILL.md`             | `.claude/skills/json-schema/SKILL.md`（Op                                                     |
| **.claude/skills/error-handling-pages/SKILL.md**    | `.claude/skills/error-handling-pages/SKILL.md`    | Next.js App Routerエラーページ設計（error.tsx/not-found.tsx/global-error.tsx）                |
| **.claude/skills/error-handling-patterns/SKILL.md** | `.claude/skills/error-handling-patterns/SKILL.md` | エラー分類、リトライ戦略、サーキットブレーカー、レジリエンスパターン                          |

## 35. Security Auditor Agent

- **エージェント名:** `.claude/agents/sec-auditor.md`
- **エージェントの配置:** `.claude/agents/sec-auditor.md`

| スキル名                                                          | パス                                                            | 概要                                                    |
| ----------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------- |
| **.claude/skills/authentication-authorization-security/SKILL.md** | `.claude/skills/authentication-authorization-security/SKILL.md` | 認証フロー設計、トークン/セッション検証、権限モデル選定 |
| **.claude/skills/cryptographic-practices/SKILL.md**               | `.claude/skills/cryptographic-practices/SKILL.md`               | 暗号要件整理、強度選定、鍵管理、監査運用                |
| **.claude/skills/security-configuration-review/SKILL.md**         | `.claude/skills/security-configuration-review/SKILL.md`         | CSP、HSTS、CORS、X-Frame-Options設定                    |
| **.claude/skills/dependency-security-scanning/SKILL.md**          | `.claude/skills/dependency-security-scanning/SKILL.md`          | 依存スキャン、CVE評価、レポート作成                     |
| **.claude/skills/code-static-analysis-security/SKILL.md**         | `.claude/skills/code-static-analysis-security/SKILL.md`         | SAST運用、検出ルール設計、脆弱性検証                    |
| **.claude/skills/rate-limiting/SKILL.md**                         | `.claude/skills/rate-limiting/SKILL.md`                         | Token Bucket、固定窓、スライディング窓、DoS対策         |
| **.claude/skills/input-sanitization/SKILL.md**                    | `.claude/skills/input-sanitization/SKILL.md`                    | DOMPurify、Zod検証、ホワイトリスト方式                  |
| **.claude/skills/security-reporting/SKILL.md**                    | `.claude/skills/security-reporting/SKILL.md`                    | CVSS評価、リスクマトリクス、修復優先度                  |
| **.claude/skills/ci-cd-pipelines/SKILL.md**                       | `.claude/skills/ci-cd-pipelines/SKILL.md`                       | GitHub ActionsのCI/CD設計と検証の実務指針               |

## 36. 機密情報管理者 (Secret Manager)

- **エージェント名:** `.claude/agents/secret-mgr.md`
- **エージェントの配置:** `.claude/agents/secret-mgr.md`

| スキル名                                                     | パス                                                       | 概要                                                          |
| ------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------- |
| **.claude/skills/secret-management-architecture/SKILL.md**   | `.claude/skills/secret-management-architecture/SKILL.md`   | Secret管理方式、階層設計、KMS統合                             |
| **.claude/skills/zero-trust-security/SKILL.md**              | `.claude/skills/zero-trust-security/SKILL.md`              | ID検証・アクセス制御・ポリシー適用・信頼評価（4エージェント） |
| **.claude/skills/gitignore-management/SKILL.md**             | `.claude/skills/gitignore-management/SKILL.md`             | .gitignore設計、除外パターン、セキュアデフォルト              |
| **.claude/skills/pre-commit-security/SKILL.md**              | `.claude/skills/pre-commit-security/SKILL.md`              | git-secrets、detect-secrets、履歴スキャン                     |
| **.claude/skills/encryption-key-lifecycle/SKILL.md**         | `.claude/skills/encryption-key-lifecycle/SKILL.md`         | AES-256-GCM、鍵ローテーション、Key Derivation                 |
| **.claude/skills/environment-isolation/SKILL.md**            | `.claude/skills/environment-isolation/SKILL.md`            | dev/staging/prod分離、最小権限、VPC設計                       |
| **.claude/skills/railway-secrets-management/SKILL.md**       | `.claude/skills/railway-secrets-management/SKILL.md`       | Railway Variables、Service Variables                          |
| **.claude/skills/github-actions-security/SKILL.md**          | `.claude/skills/github-actions-security/SKILL.md`          | GitHub Secrets、OIDC、最小権限トークン                        |
| **.claude/skills/tool-permission-management/SKILL.md**       | `.claude/skills/tool-permission-management/SKILL.md`       | Claude Codeツール権限、最小権限原則                           |
| **.claude/skills/best-practices-curation/SKILL.md**          | `.claude/skills/best-practices-curation/SKILL.md`          | 情報源信頼性評価、品質スコアリング、統合パターン              |
| **.claude/skills/project-architecture-integration/SKILL.md** | `.claude/skills/project-architecture-integration/SKILL.md` | ハイブリッドアーキテクチャ統合の実務指針                      |
| **.claude/skills/agent-architecture-patterns/SKILL.md**      | `.claude/skills/agent-architecture-patterns/SKILL.md`      | セキュリティファースト設計パターンの実務指針                  |
| **.claude/skills/context-optimization/SKILL.md**             | `.claude/skills/context-optimization/SKILL.md`             | トークン最適化、遅延読み込み、参照設計                        |

## 37. Skill Librarian

- **エージェント名:** `.claude/agents/skill-librarian.md`
- **エージェントの配置:** `.claude/agents/skill-librarian.md`

| スキル名                                               | パス                                                 | 概要                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| **.claude/skills/knowledge-management/SKILL.md**       | `.claude/skills/knowledge-management/SKILL.md`       | SECIモデル適用、暗黙知→形式知変換、知識キュレーションフレームワーク     |
| **.claude/skills/progressive-disclosure/SKILL.md**     | `.claude/skills/progressive-disclosure/SKILL.md`     | 3層開示モデル設計、メタデータ最適化、スキル発動率向上（20%→84%）        |
| **.claude/skills/documentation-architecture/SKILL.md** | `.claude/skills/documentation-architecture/SKILL.md` | 500行制約に基づくファイル分割、トピック別・レベル別・機能別分割パターン |
| **.claude/skills/context-optimization/SKILL.md**       | `.claude/skills/context-optimization/SKILL.md`       | トークン最適化、遅延読み込み、参照設計                                  |
| **.claude/skills/best-practices-curation/SKILL.md**    | `.claude/skills/best-practices-curation/SKILL.md`    | 情報源信頼性評価、品質スコアリング、統合パターン                        |
| **.claude/skills/skill-creation-workflow/SKILL.md**    | `.claude/skills/skill-creation-workflow/SKILL.md`    | 新規スキル作成・既存改善の5フェーズワークフロー、進捗トラッキング       |
| **.claude/skills/skill-librarian-commands/SKILL.md**   | `.claude/skills/skill-librarian-commands/SKILL.md`   | スキルリソース・スクリプト・テンプレート参照コマンド体系                |
| **.claude/skills/skill-name-1/SKILL.md**               | `.claude/skills/skill-name-1/SKILL.md`               | 簡潔な説明の実務指針の実践ガイドの要点整理                              |
| **.claude/skills/skill-name-2/SKILL.md**               | `.claude/skills/skill-name-2/SKILL.md`               | 簡潔な説明の実務指針の実践ガイドの要点整理                              |
| **.claude/skills/skill-name/SKILL.md**                 | `.claude/skills/skill-name/SKILL.md`                 | 専門知識と実行手順の参照の実務指針の実践ガイド                          |

## 38. Spec Writer（仕様書作成エージェント）

- **エージェント名:** `.claude/agents/spec-writer.md`
- **エージェントの配置:** `.claude/agents/spec-writer.md`

| スキル名                                                      | パス                                                        | 概要                                                                                              |
| ------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **.claude/skills/markdown-advanced-syntax/SKILL.md**          | `.claude/skills/markdown-advanced-syntax/SKILL.md`          | Mermaid図、テーブル、コードブロック活用                                                           |
| **.claude/skills/technical-documentation-standards/SKILL.md** | `.claude/skills/technical-documentation-standards/SKILL.md` | IEEE 830、DRY原則、Doc as Code                                                                    |
| **.claude/skills/api-documentation-best-practices/SKILL.md**  | `.claude/skills/api-documentation-best-practices/SKILL.md`  | OpenAPI、エンドポイント記述、リクエスト/レスポンス例                                              |
| **.claude/skills/structured-writing/SKILL.md**                | `.claude/skills/structured-writing/SKILL.md`                | DITA、トピックベース、モジュール構造                                                              |
| **.claude/skills/version-control-for-docs/SKILL.md**          | `.claude/skills/version-control-for-docs/SKILL.md`          | 4エージェント体制（ブランチ戦略/コミット規約/Changelog生成/PRレビュー）、Conventional Commits準拠 |

## 39. SRE Observer - ロギング・監視設計者

- **エージェント名:** `.claude/agents/sre-observer.md`
- **エージェントの配置:** `.claude/agents/sre-observer.md`

| スキル名                                          | パス                                            | 概要                                                              |
| ------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| **.claude/skills/structured-logging/SKILL.md**    | `.claude/skills/structured-logging/SKILL.md`    | JSON形式、ログレベル、相関ID、PIIマスキング、Winston/Pino         |
| **.claude/skills/observability-pillars/SKILL.md** | `.claude/skills/observability-pillars/SKILL.md` | ログ・メトリクス・トレース統合、OpenTelemetry、ゴールデンシグナル |
| **.claude/skills/slo-sli-design/SKILL.md**        | `.claude/skills/slo-sli-design/SKILL.md`        | SLO/SLI定義、エラーバジェット、可用性目標、レイテンシ             |
| **.claude/skills/alert-design/SKILL.md**          | `.claude/skills/alert-design/SKILL.md`          | アラート閾値、Fatigue回避、PagerDuty統合、エスカレーション        |
| **.claude/skills/distributed-tracing/SKILL.md**   | `.claude/skills/distributed-tracing/SKILL.md`   | トレース設計、スパン命名、検証運用                                |

## 40. State Manager

- **エージェント名:** `.claude/agents/state-manager.md`
- **エージェントの配置:** `.claude/agents/state-manager.md`

| スキル名                                                   | パス                                                     | 概要                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| **.claude/skills/react-hooks-advanced/SKILL.md**           | `.claude/skills/react-hooks-advanced/SKILL.md`           | useEffect依存配列、useCallback/useMemo最適化                   |
| **.claude/skills/data-fetching-strategies/SKILL.md**       | `.claude/skills/data-fetching-strategies/SKILL.md`       | ライブラリ選定、キャッシュ設計、エラー処理、楽観的更新         |
| **.claude/skills/state-lifting/SKILL.md**                  | `.claude/skills/state-lifting/SKILL.md`                  | 状態配置判断、Props Drilling回避、共通親決定                   |
| **.claude/skills/custom-hooks-patterns/SKILL.md**          | `.claude/skills/custom-hooks-patterns/SKILL.md`          | 抽出基準、合成設計、テスト観点、運用記録                       |
| **.claude/skills/error-boundary/SKILL.md**                 | `.claude/skills/error-boundary/SKILL.md`                 | Error Boundary実装、フォールバックUI、非同期エラーハンドリング |
| **.claude/skills/performance-optimization-react/SKILL.md** | `.claude/skills/performance-optimization-react/SKILL.md` | React.memo、Profiler、再レンダリング最適化                     |

## 41. UI Designer

- **エージェント名:** `.claude/agents/ui-designer.md`
- **エージェントの配置:** `.claude/agents/ui-designer.md`

| スキル名                                                   | パス                                                     | 概要                                                   |
| ---------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| **.claude/skills/design-system-architecture/SKILL.md**     | `.claude/skills/design-system-architecture/SKILL.md`     | トークン設計、規約/同期設計、整合性検証                |
| **.claude/skills/component-composition-patterns/SKILL.md** | `.claude/skills/component-composition-patterns/SKILL.md` | 合成パターン選定、API設計、再利用構造                  |
| **.claude/skills/headless-ui-principles/SKILL.md**         | `.claude/skills/headless-ui-principles/SKILL.md`         | ロジックとプレゼンテーション分離、WAI-ARIAパターン     |
| **.claude/skills/tailwind-css-patterns/SKILL.md**          | `.claude/skills/tailwind-css-patterns/SKILL.md`          | ユーティリティファースト、カスタムクラス、レスポンシブ |
| **.claude/skills/accessibility-wcag/SKILL.md**             | `.claude/skills/accessibility-wcag/SKILL.md`             | アクセシビリティ設計と検証フローの整理                 |
| **.claude/skills/apple-hig-guidelines/SKILL.md**           | `.claude/skills/apple-hig-guidelines/SKILL.md`           | iOS/macOS/visionOSネイティブ品質、3テーマ、6原則       |

## 42. Unit Tester

- **エージェント名:** `.claude/agents/unit-tester.md`
- **エージェントの配置:** `.claude/agents/unit-tester.md`

| スキル名                                            | パス                                              | 概要                                                         |
| --------------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------ |
| **.claude/skills/tdd-principles/SKILL.md**          | `.claude/skills/tdd-principles/SKILL.md`          | Red-Green-Refactorサイクル、テストファースト、小さなステップ |
| **.claude/skills/test-doubles/SKILL.md**            | `.claude/skills/test-doubles/SKILL.md`            | Mock、Stub、Spy、Fakeの使い分け、モック戦略                  |
| **.claude/skills/vitest-advanced/SKILL.md**         | `.claude/skills/vitest-advanced/SKILL.md`         | スナップショット、カバレッジ、並列実行、モック機能           |
| **.claude/skills/boundary-value-analysis/SKILL.md** | `.claude/skills/boundary-value-analysis/SKILL.md` | 境界値分析、同値分割、エッジケース、組み合わせ最適化         |
| **.claude/skills/test-naming-conventions/SKILL.md** | `.claude/skills/test-naming-conventions/SKILL.md` | Given-When-Then、should + 動詞                               |

## 43. Workflow Engine

- **エージェント名:** `.claude/agents/workflow-engine.md`
- **エージェントの配置:** `.claude/agents/workflow-engine.md`

| スキル名                                               | パス                                                 | 概要                                                         |
| ------------------------------------------------------ | ---------------------------------------------------- | ------------------------------------------------------------ |
| **.claude/skills/design-patterns-behavioral/SKILL.md** | `.claude/skills/design-patterns-behavioral/SKILL.md` | 行動パターン選定、責務分離、検証運用                         |
| **.claude/skills/plugin-architecture/SKILL.md**        | `.claude/skills/plugin-architecture/SKILL.md`        | 動的ロード、レジストリパターン、依存性注入、Plugin Lifecycle |
| **.claude/skills/interface-segregation/SKILL.md**      | `.claude/skills/interface-segregation/SKILL.md`      | ISP準拠インターフェース設計、Fat Interface検出               |
| **.claude/skills/factory-patterns/SKILL.md**           | `.claude/skills/factory-patterns/SKILL.md`           | Factory Method、Abstract Factory、Builder                    |
| **.claude/skills/open-closed-principle/SKILL.md**      | `.claude/skills/open-closed-principle/SKILL.md`      | OCP準拠拡張性設計、拡張ポイント、リファクタリング            |

## 共通スキル

| スキル名                                                     | パス                                                       | 概要                                                                           | 使用エージェント                                                                                  |
| ------------------------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| **.claude/skills/accessibility-wcag/SKILL.md**               | `.claude/skills/accessibility-wcag/SKILL.md`               | アクセシビリティ設計と検証フローの整理                                         | .claude/agents/electron-ui-dev.md, .claude/agents/ui-designer.md                                  |
| **.claude/skills/agent-architecture-patterns/SKILL.md**      | `.claude/skills/agent-architecture-patterns/SKILL.md`      | マービン・ミンスキーの『心の社会』に基づくエージェントアーキテクチャパターンと | .claude/agents/local-sync.md, .claude/agents/meta-agent-designer.md, .claude/agents/secret-mgr.md |
| **.claude/skills/agent-persona-design/SKILL.md**             | `.claude/skills/agent-persona-design/SKILL.md`             | エージェントペルソナ設計を専門とするスキル                                     | .claude/agents/meta-agent-designer.md, .claude/agents/prompt-eng.md                               |
| **.claude/skills/api-documentation-best-practices/SKILL.md** | `.claude/skills/api-documentation-best-practices/SKILL.md` | OpenAPI、Swagger、RESTful                                                      | .claude/agents/api-doc-writer.md, .claude/agents/spec-writer.md                                   |
| **.claude/skills/best-practices-curation/SKILL.md**          | `.claude/skills/best-practices-curation/SKILL.md`          | 情報源信頼性評価、品質スコアリング、統合パターン                               | .claude/agents/prompt-eng.md, .claude/agents/secret-mgr.md, .claude/agents/skill-librarian.md     |
| **.claude/skills/ci-cd-pipelines/SKILL.md**                  | `.claude/skills/ci-cd-pipelines/SKILL.md`                  | GitHub ActionsのCI/CD設計、品質ゲート、並列化最適化                            | .claude/agents/devops-eng.md, .claude/agents/sec-auditor.md                                       |
| **.claude/skills/connection-pooling/SKILL.md**               | `.claude/skills/connection-pooling/SKILL.md`               | 接続プール設計、サイジング、サーバーレス運用                                   | .claude/agents/dba-mgr.md, .claude/agents/repo-dev.md                                             |
| **.claude/skills/context-optimization/SKILL.md**             | `.claude/skills/context-optimization/SKILL.md`             | トークン最適化、遅延読み込み、参照設計                                         | .claude/agents/prompt-eng.md, .claude/agents/secret-mgr.md, .claude/agents/skill-librarian.md     |
| **.claude/skills/data-fetching-strategies/SKILL.md**         | `.claude/skills/data-fetching-strategies/SKILL.md`         | ライブラリ選定、キャッシュ設計、エラー処理、楽観的更新                         | .claude/agents/router-dev.md, .claude/agents/state-manager.md                                     |
| **.claude/skills/database-migrations/SKILL.md**              | `.claude/skills/database-migrations/SKILL.md`              | マイグレーション計画、移行期間、ロールバック、検証運用                         | .claude/agents/db-architect.md, .claude/agents/dba-mgr.md, .claude/agents/repo-dev.md             |
| **.claude/skills/documentation-architecture/SKILL.md**       | `.claude/skills/documentation-architecture/SKILL.md`       | ドキュメント構造設計、リソース分割、階層設計を専門とするスキル                 | .claude/agents/prompt-eng.md, .claude/agents/skill-librarian.md                                   |
| **.claude/skills/electron-distribution/SKILL.md**            | `.claude/skills/electron-distribution/SKILL.md`            | Electronアプリケーションの配布・自動更新専門知識                               | .claude/agents/electron-devops.md, .claude/agents/electron-release.md                             |
| **.claude/skills/electron-packaging/SKILL.md**               | `.claude/skills/electron-packaging/SKILL.md`               | Electronアプリケーションのビルド・パッケージング専門知識                       | .claude/agents/electron-builder.md, .claude/agents/electron-devops.md                             |
| **.claude/skills/error-boundary/SKILL.md**                   | `.claude/skills/error-boundary/SKILL.md`                   | ReactにおけるErrorの実務指針の実践ガイド                                       | .claude/agents/router-dev.md, .claude/agents/state-manager.md                                     |
| **.claude/skills/graceful-shutdown-patterns/SKILL.md**       | `.claude/skills/graceful-shutdown-patterns/SKILL.md`       | Node.jsアプリケーションのGraceful                                              | .claude/agents/local-watcher.md, .claude/agents/process-mgr.md                                    |
| **.claude/skills/input-sanitization/SKILL.md**               | `.claude/skills/input-sanitization/SKILL.md`               | ユーザー入力のサニタイズとセキュリティ対策を専門とするスキル。 XSS             | .claude/agents/schema-def.md, .claude/agents/sec-auditor.md                                       |
| **.claude/skills/multi-agent-systems/SKILL.md**              | `.claude/skills/multi-agent-systems/SKILL.md`              | マルチエージェントシステム設計を専門とするスキル。 エージェント間協調          | .claude/agents/local-sync.md, .claude/agents/meta-agent-designer.md                               |
| **.claude/skills/project-architecture-integration/SKILL.md** | `.claude/skills/project-architecture-integration/SKILL.md` | プロジェクト固有のアーキテクチャ設計原則を専門とするスキル                     | .claude/agents/meta-agent-designer.md, .claude/agents/secret-mgr.md                               |
| **.claude/skills/prompt-engineering-for-agents/SKILL.md**    | `.claude/skills/prompt-engineering-for-agents/SKILL.md`    | エージェント向けプロンプトエンジニアリングを専門とするスキル                   | .claude/agents/meta-agent-designer.md, .claude/agents/prompt-eng.md                               |
| **.claude/skills/query-optimization/SKILL.md**               | `.claude/skills/query-optimization/SKILL.md`               | Vlad MihaltseaとMarkus                                                         | .claude/agents/db-architect.md, .claude/agents/repo-dev.md                                        |
| **.claude/skills/rate-limiting/SKILL.md**                    | `.claude/skills/rate-limiting/SKILL.md`                    | Rate Limitingとクォータ管理のベストプラクティスを提供します                    | .claude/agents/gateway-dev.md, .claude/agents/sec-auditor.md                                      |
| **.claude/skills/retry-strategies/SKILL.md**                 | `.claude/skills/retry-strategies/SKILL.md`                 | 外部APIの一時的障害に対するリトライ戦略とサーキットブレーカーパターンを専門と  | .claude/agents/gateway-dev.md, .claude/agents/local-sync.md                                       |
| **.claude/skills/skill-name/SKILL.md**                       | `.claude/skills/skill-name/SKILL.md`                       | スキル命名と識別子設計の指針を提供するスキル                                   | .claude/agents/command-arch.md, .claude/agents/skill-librarian.md                                 |
| **.claude/skills/test-doubles/SKILL.md**                     | `.claude/skills/test-doubles/SKILL.md`                     | テストダブル（Mock、Stub、Fake                                                 | .claude/agents/logic-dev.md, .claude/agents/unit-tester.md                                        |
| **.claude/skills/tool-permission-management/SKILL.md**       | `.claude/skills/tool-permission-management/SKILL.md`       | ツール権限管理とセキュリティ制御を専門とするスキル                             | .claude/agents/meta-agent-designer.md, .claude/agents/secret-mgr.md                               |
| **.claude/skills/transaction-management/SKILL.md**           | `.claude/skills/transaction-management/SKILL.md`           | ACID特性を保証するトランザクション設計と実装を専門とするスキル                 | .claude/agents/db-architect.md, .claude/agents/repo-dev.md                                        |
