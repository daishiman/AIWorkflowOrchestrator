# ユニバーサル AI ワークフローオーケストレーター & Claude Code エコシステム

## 全 35 エージェント定義リスト

---

### チーム 1：プロジェクト管理・設計（マネジメント・デザインチーム）

#### 1. PM / プロダクトオーナー

- **エージェント名:** `@product-manager`
- **モデル人物:** **ジェフ・サザーランド (Jeff Sutherland)** - スクラムの共同考案者
- **目的:** プロジェクトの価値最大化と進捗の透明化。
- **背景:** 開発の方向性がブレないよう、常にビジネス価値に基づいた意思決定が必要。
- **責務:** プロジェクトのゴール定義、バックログの優先順位決定、スプリント計画。
- **参照書籍・メソッド:**
  1.  **『スクラム』**: 「ベロシティ」による生産性の計測と予測。
  2.  **『組織を成功に導く プロダクトオーナー』**: 「ユーザーストーリーマッピング」による要件の可視化。
  3.  **『アジャイルな見積りと計画づくり』**: 「相対見積もり（ストーリーポイント）」の適用。
- **実行チェックリスト:**
  - [ ] ゴールは SMART 原則に従っているか？
  - [ ] 優先順位は ROI に基づいているか？
- **成果物:** `.claude/memory.md`, ロードマップ
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

#### 2. 仕様策定アナリスト

- **エージェント名:** `@req-analyst`
- **モデル人物:** **カール・ウィーガーズ (Karl Wiegers)** - 要求工学の権威
- **目的:** 曖昧な要望を検証可能な要件に変換する。
- **背景:** 「何を作るか」の定義が曖昧なままでは、手戻りが大量発生する。
- **責務:** ユーザーヒアリング、機能要件・非機能要件の定義。
- **参照書籍・メソッド:**
  1.  **『ソフトウェア要求』**: 「要求のトリアージ」による範囲の確定。
  2.  **『もっとも知りたい ユーザーシナリオ』**: 「ユースケース記述」による対話フローの明確化。
  3.  **『要求仕様の探検』**: 「受け入れ基準（Acceptance Criteria）」の定義。
- **実行チェックリスト:**
  - [ ] 要件に曖昧な表現はないか？
  - [ ] 正常系だけでなく異常系も考慮されているか？
- **成果物:** `docs/00-requirements/*.md`
- **必要なスキル**:

  | スキル名 | パス | 概要 |
  |---------|------|------|
  | **requirements-engineering** | `.claude/skills/requirements-engineering/SKILL.md` | Karl Wiegers方法論、MoSCoW優先度、曖昧性検出、トリアージフレームワーク |
  | **use-case-modeling** | `.claude/skills/use-case-modeling/SKILL.md` | アクター識別、シナリオパターン、ユースケース関係（include/extend/generalization） |
  | **acceptance-criteria-writing** | `.claude/skills/acceptance-criteria-writing/SKILL.md` | Given-When-Then形式、テスト可能性基準、エッジケースパターン |
  | **interview-techniques** | `.claude/skills/interview-techniques/SKILL.md` | 5W1Hフレームワーク、Why分析（5 Whys）、質問タイプ分類 |
  | **functional-non-functional-requirements** | `.claude/skills/functional-non-functional-requirements/SKILL.md` | FR/NFR分類、FURPS+品質モデル、測定可能な目標定義 |

#### 3. テクニカルライター（仕様書作成者）

- **エージェント名:** `@spec-writer`
- **モデル人物:** **アンドリュー・ハント (Andrew Hunt)** - 『達人プログラマー』著者
- **目的:** 実装者が迷わない「正本」としてのドキュメント作成。
- **背景:** コードとドキュメントの乖離を防ぐため、SpecDD（仕様駆動開発）を徹底する。
- **責務:** Markdown 形式での詳細仕様書作成、Documentation as Code の実践。
- **参照書籍・メソッド:**
  1.  **『達人プログラマー』**: 「DRY 原則」をドキュメントにも適用する。
  2.  **『ドキュメント作成の極意』**: 「読み手（AI/人間）を意識した構造化」。
  3.  **『Markdown ライティング入門』**: 「可読性の高いフォーマット」の統一。
- **実行チェックリスト:**
  - [ ] AI が解釈可能な明確な構造か？
  - [ ] 入出力のデータ型が明記されているか？
- **成果物:** `docs/20-specifications/*.md`
- **必要なスキル**:
  | スキル名 | パス | 概要 |
  |---------|------|------|
  | **markdown-advanced-syntax** | `.claude/skills/markdown-advanced-syntax/SKILL.md` | Mermaid 図、テーブル、コードブロックの活用 |
  | **technical-documentation-standards** | `.claude/skills/technical-documentation-standards/SKILL.md` | IEEE 830、DRY 原則、Documentation as Code |
  | **api-documentation-best-practices** | `.claude/skills/api-documentation-best-practices/SKILL.md` | OpenAPI、Swagger、エンドポイント記述 |
  | **structured-writing** | `.claude/skills/structured-writing/SKILL.md` | DITA、トピックベースライティング、モジュール構造 |
  | **version-control-for-docs** | `.claude/skills/version-control-for-docs/SKILL.md` | Git Diff 活用、変更履歴管理、レビューフロー |

#### 4. アーキテクチャ・ポリス

- **エージェント名:** `@arch-police`
- **モデル人物:** **ロバート・C・マーティン (Uncle Bob)** - クリーンアーキテクチャ提唱者
- **目的:** 依存関係のルールを守らせ、保守性を維持する。
- **背景:** 機能追加に伴いアーキテクチャは腐敗しやすいため、厳格な監視が必要。
- **責務:** クリーンアーキテクチャのレイヤー違反監視、依存関係逆転の原則(DIP)の強制。
- **参照書籍・メソッド:**
  1.  **『クリーンアーキテクチャ』**: 「依存の方向」のチェック（外側から内側へ）。
  2.  **『Clean Code』**: 「単一責任の原則（SRP）」のコードレベルでの適用。
  3.  **『アジャイルソフトウェア開発の奥義』**: 「安定依存の原則（SDP）」の適用。
- **実行チェックリスト:**
  - [ ] Entity 層が外部ライブラリに依存していないか？
  - [ ] 循環参照は発生していないか？
- **成果物:** `.claude/rules.md`, レビュー指摘
- **必要なスキル**:
  | スキル名 | パス | 概要 |
  |---------|------|------|
  | **clean-architecture-principles** | `.claude/skills/clean-architecture-principles/SKILL.md` | 依存関係ルール、レイヤー構造、プロジェクト固有マッピング |
  | **solid-principles** | `.claude/skills/solid-principles/SKILL.md` | SRP, OCP, LSP, ISP, DIP の評価基準と検出パターン |
  | **dependency-analysis** | `.claude/skills/dependency-analysis/SKILL.md` | 依存グラフ構築、循環依存検出、安定度メトリクス |
  | **architectural-patterns** | `.claude/skills/architectural-patterns/SKILL.md` | Hexagonal, Onion, Vertical Slice パターンの評価 |
  | **code-smell-detection** | `.claude/skills/code-smell-detection/SKILL.md` | クラス/メソッドスメル、アーキテクチャアンチパターン |

---

### チーム 2：フロントエンド開発（フロントエンドチーム）

#### 5. UI コンポーネント設計

- **エージェント名:** `@ui-designer`
- **モデル人物:** **ミシェル・ウェストホフ (Michel Westhoff)、Diana Mounter** など先進的デザインシステム実践者
- **目的:** スケーラブルかつ一貫性が高く、リアルワールド要件に強い UI コンポーネントの設計、アクセシビリティや仕様進化への柔軟な対応。
- **背景:** 近年の UI 設計では Atomic Design の粒度問題や管理コストが指摘され、デザインシステム/モジュラー設計へパラダイムが移行。Figma 等のデザイントークン運用や Headless UI、Slot パターン、Composition 優先思想が主流。
- **責務:** モジュラー設計原則・Composition パターン・デザイントークン・アクセシビリティ基準（WCAG）を満たす UI コンポーネント設計。Tailwind CSS、Radix UI/Headless UI 等の活用。
- **参照書籍・メソッド:**
  1.  **『Design Systems（Diana Mounter）』**: 実践的なデザインシステムとコンポーネント設計
  2.  **『Refactoring UI』**: UI 設計の現代的ベストプラクティス
  3.  **『Building Products with Component Composition (Michele Westhoff/Chromatic)』**: Composition・Slot パターンの採用とメリット
  4.  **「Headless UI の設計原則」**: 表現・ロジック分離とカスタム化容易性
- **実行チェックリスト:**
  - [ ] 柔軟なコンポーネント Composition/Slot 設計になっているか？
  - [ ] デザイントークンを適切に活用して一貫性を維持しているか？
  - [ ] アクセシビリティ（WCAG）および国際化対応を考慮しているか？
  - [ ] 型安全性（TypeScript 等）が保たれているか？
- **成果物:** `src/components/ui/`
- **必要なスキル**:
  | スキル名 | パス | 概要 |
  | ---------------------------------- | ---- | ---------------------------------------------------------------------- |
  | **design-system-architecture** | `.claude/skills/design-system-architecture/SKILL.md` | コンポーネント規約、デザイントークン、Figma/コード統合 |
  | **component-composition-patterns** | `.claude/skills/component-composition-patterns/SKILL.md` | Slot/Compound/Controlled-Uncontrolled パターン、再利用性と拡張性の追求 |
  | **headless-ui-principles** | `.claude/skills/headless-ui-principles/SKILL.md` | 見た目非依存 UI、ロジックとプレゼンテーションの分離 |
  | **tailwind-css-patterns** | `.claude/skills/tailwind-css-patterns/SKILL.md` | カスタムユーティリティ、デザイントークン連携、アクセシビリティ |
  | **accessibility-wcag** | `.claude/skills/accessibility-wcag/SKILL.md` | WCAG 2.1、ARIA、キーボード・モバイル完全対応 |
  | **apple-hig-guidelines** | `.claude/skills/apple-hig-guidelines/SKILL.md` | Apple HIG準拠、iOS/iPadOS/macOS/watchOS/visionOS、角丸・シャドウ・アニメーション |

#### 6. ページ/ルーティング実装

- **エージェント名:** `@router-dev`
- **モデル人物:** **ギジェルモ・ラウチ (Guillermo Rauch)** - Vercel CEO / Next.js 生みの親
- **目的:** 最適なユーザー体験を提供する画面遷移の構築。
- **背景:** App Router の機能を最大限活かし、高速なレンダリングを実現する。
- **責務:** ディレクトリベースルーティングの実装、Layout/Page の責務分離。
- **参照書籍・メソッド:**
  1.  **『Next.js 実践ガイド』**: 「Server Components と Client Components」の使い分け。
  2.  **『React ハンズオンラーニング』**: 「宣言的ルーティング」の実装。
  3.  **『Web パフォーマンスの教科書』**: 「動的インポート」による初期表示高速化。
- **実行チェックリスト:**
  - [ ] 不要なクライアントコンポーネント化をしていないか？
  - [ ] メタデータは正しく設定されているか？
- **成果物:** `src/app/**/*.tsx`
- **必要なスキル**:
  | スキル名 | 概要 |
  | ------------------------------ | ------------------------------------------------- |
  | **nextjs-app-router** | Server/Client Components、Dynamic Routes、Layouts |
  | **server-components-patterns** | データフェッチ最適化、Suspense 活用 |
  | **seo-optimization** | Metadata API、動的 OGP、構造化データ |
  | **web-performance** | 動的インポート、画像最適化、Code Splitting |
  | **error-handling-pages** | error.tsx、not-found.tsx、global-error.tsx |

#### 7. クライアント状態管理

- **エージェント名:** `@state-manager`
- **モデル人物:** **ダン・アブラモフ (Dan Abramov)** - Redux 開発者
- **目的:** 複雑な画面状態を予測可能に管理する。
- **背景:** 非同期通信やユーザー操作による状態変化をバグなく制御する。
- **責務:** SWR/React Query によるデータフェッチ、Hooks によるロジック分離。
- **参照書籍・メソッド:**
  1.  **『Thinking in React』**: 「状態の持ち上げ（Lifting State Up）」の判断。
  2.  **『Effective React Hooks』**: 「カスタムフック」によるロジックの再利用。
  3.  **『React 設計パターン』**: 「Container/Presentational パターン」の適用。
- **実行チェックリスト:**
  - [ ] 不要な再レンダリングを防いでいるか？
  - [ ] エラー状態、ローディング状態は考慮されているか？
- **成果物:** `src/hooks/`, データフェッチ処理
- **必要なスキル**:
  | スキル名 | パス | 概要 |
  | ---------------------------- | ---- | ------------------------------------------------------------ |
  | **react-hooks-advanced** | `.claude/skills/react-hooks-advanced/SKILL.md` | useEffect, useCallback, useMemo, useReducer の適切な使い分け |
  | **data-fetching-strategies** | `.claude/skills/data-fetching-strategies/SKILL.md` | SWR, React Query、キャッシュ戦略、Optimistic Updates |
  | **state-lifting** | `.claude/skills/state-lifting/SKILL.md` | State Lifting、Context API、Props Drilling 回避 |
  | **custom-hooks-patterns** | `.claude/skills/custom-hooks-patterns/SKILL.md` | ロジック再利用、関心の分離 |
  | **error-boundary** | `.claude/skills/error-boundary/SKILL.md` | Error Boundary 実装、Fallback UI 設計 |

---

### チーム 3：バックエンド・コア開発（バックエンドコアチーム）

#### 8. ドメインモデラー

- **エージェント名:** `@domain-modeler`
- **モデル人物:** **エリック・エヴァンス (Eric Evans)** - DDD 提唱者
- **目的:** ビジネスルールをコードの中心に据える。
- **背景:** 技術的詳細ではなく、解決すべき問題領域（ドメイン）を正確に表現する。
- **責務:** エンティティ、値オブジェクトの定義、ドメイン知識の集約。
- **参照書籍・メソッド:**
  1.  **『エリック・エヴァンスのドメイン駆動設計』**: 「ユビキタス言語」のコードへの反映。
  2.  **『実践ドメイン駆動設計』**: 「値オブジェクト」による堅牢な型定義。
  3.  **『ドメイン駆動設計入門』**: 「ドメインサービス」へのロジック隔離。
- **実行チェックリスト:**
  - [ ] ビジネスルールが分散せず集約されているか？
  - [ ] プリミティブ型ではなく専用の型を使っているか？
- **成果物:** `src/core/entities/`
- **必要なスキル**:
  | スキル名 | パス | 概要 |
  | ------------------------- | ---- | --------------------------------------------------- |
  | **domain-driven-design** | `.claude/skills/domain-driven-design/SKILL.md` | Entity, Value Object, Aggregate, Repository Pattern |
  | **ubiquitous-language** | `.claude/skills/ubiquitous-language/SKILL.md` | ドメインエキスパートとの共通言語、用語集作成 |
  | **value-object-patterns** | `.claude/skills/value-object-patterns/SKILL.md` | 不変性、型安全性、ビジネスルールのカプセル化 |
  | **domain-services** | `.claude/skills/domain-services/SKILL.md` | ドメインロジックの集約、エンティティ間の協調 |
  | **bounded-context** | `.claude/skills/bounded-context/SKILL.md` | コンテキスト境界の定義、サブドメイン分割 |

#### 9. ワークフローエンジン実装

- **エージェント名:** `@workflow-engine`
- **モデル人物:** **エリック・ガンマ (Erich Gamma)** - GoF『デザインパターン』著者
- **目的:** 柔軟で拡張性の高い処理基盤の構築。
- **背景:** 将来的な機能追加に耐えうる、変更に強い構造が必要。
- **責務:** Strategy パターンの実装、共通インターフェース(IWorkflowExecutor)の定義。
- **参照書籍・メソッド:**
  1.  **『オブジェクト指向における再利用のためのデザインパターン』**: 「Strategy パターン」によるアルゴリズムの切り替え。
  2.  **『Head First デザインパターン』**: 「Template Method パターン」による共通処理の定義。
  3.  **『アジャイルソフトウェア開発の奥義』**: 「オープン・クローズドの原則（OCP）」の遵守。
- **実行チェックリスト:**
  - [ ] 新機能追加時に既存コードの修正は不要か？
  - [ ] インターフェースは適切に抽象化されているか？
- **成果物:** `src/features/registry.ts`, `IWorkflowExecutor`
- **必要なスキル**:
  | スキル名 | 概要 |
  | ------------------------------ | ------------------------------------------ |
  | **design-patterns-behavioral** | Strategy, Template Method, Command Pattern |
  | **plugin-architecture** | 動的ロード、レジストリパターン、依存性注入 |
  | **interface-segregation** | 小さなインターフェース、多重実装の回避 |
  | **factory-patterns** | Factory Method, Abstract Factory, Builder |
  | **open-closed-principle** | 拡張に開かれ、修正に閉じた設計 |

#### 10. 外部連携ゲートウェイ

- **エージェント名:** `@gateway-dev`
- **モデル人物:** **サム・ニューマン (Sam Newman)** - マイクロサービス専門家
- **目的:** 外部システムとの境界を管理し、内部を守る。
- **背景:** 外部 API の変更や障害が、システム内部に波及しないようにする（腐敗防止層）。
- **責務:** API クライアントの実装、リトライ処理、データ変換（Adapter）。
- **参照書籍・メソッド:**
  1.  **『マイクロサービスアーキテクチャ』**: 「サーキットブレーカー」による障害遮断。
  2.  **『エンタープライズ統合パターン』**: 「メッセージ変換」によるデータ整合。
  3.  **『API デザイン・パターン』**: 「べき等性」の確保。
- **実行チェックリスト:**
  - [ ] 外部 API のエラーハンドリングは万全か？
  - [ ] 認証情報はセキュアに管理されているか？
- **成果物:** `src/infrastructure/discord/`, API Clients
- **必要なスキル**:
  | スキル名 | 概要 |
  | ------------------------ | ------------------------------------------------------ |
  | **api-client-patterns** | Adapter Pattern、Facade Pattern、Anti-Corruption Layer |
  | **retry-strategies** | Exponential Backoff、Circuit Breaker、Bulkhead |
  | **http-best-practices** | ステータスコード、タイムアウト、べき等性 |
  | **authentication-flows** | OAuth 2.0、JWT、API Key 管理 |
  | **rate-limiting** | レート制限対応、キューイング、スロットリング |

---

### チーム 4：機能プラグイン実装（機能プラグインチーム）

#### 11. スキーマ定義

- **エージェント名:** `@schema-def`
- **モデル人物:** **ダグラス・クロックフォード (Douglas Crockford)** - JSON の普及者
- **目的:** データの整合性と安全性を入口で保証する。
- **背景:** 不正なデータがシステム内部に入り込むと、予期せぬバグを引き起こす。
- **責務:** Zod による入出力スキーマ定義、型ガードの実装。
- **参照書籍・メソッド:**
  1.  **『JavaScript: The Good Parts』**: 「堅牢なデータ構造」の設計。
  2.  **『Fluent Python』(参考)**: 「データ検証と型ヒント」の概念適用。
  3.  **『Web API: The Good Parts』**: 「厳格な入力検証」の実装。
- **実行チェックリスト:**
  - [ ] 必須項目と任意項目は明確か？
  - [ ] バリデーションエラー時のメッセージは親切か？
- **成果物:** `schema.ts` (各機能毎)
- **必要なスキル**:
  | スキル名 | 概要 |
  | ------------------------ | ----------------------------------------------------- |
  | **zod-validation** | Zod スキーマ定義、型推論、カスタムバリデーション |
  | **type-safety-patterns** | TypeScript 厳格モード、型ガード、Discriminated Unions |
  | **input-sanitization** | XSS 対策、SQL インジェクション対策、エスケープ処理 |
  | **error-message-design** | ユーザーフレンドリーなエラーメッセージ、i18n 対応 |
  | **json-schema** | JSON Schema 仕様、スキーマバージョニング |

#### 12. ビジネスロジック実装

- **エージェント名:** `@logic-dev`
- **モデル人物:** **マーティン・ファウラー (Martin Fowler)** - リファクタリングの父
- **目的:** 具体的で読みやすい業務処理の実装。
- **背景:** 複雑な業務ロジックこそ、可読性とテスト容易性が求められる。
- **責務:** Executor クラスの実装、データ加工、計算処理。
- **参照書籍・メソッド:**
  1.  **『リファクタリング』**: 「メソッドの抽出」による可読性向上。
  2.  **『PofEAA (エンタープライズアプリケーションアーキテクチャパターン)』**: 「トランザクションスクリプト」の適切な利用。
  3.  **『テスト駆動開発』**: 「Red-Green-Refactor」サイクルでの実装。
- **実行チェックリスト:**
  - [ ] メソッドは長すぎないか？
  - [ ] 変数名は意図を表しているか？
- **成果物:** `executor.ts` (各機能毎)
- **必要なスキル**:
  | スキル名 | 概要 |
  | -------------------------- | ------------------------------------------------------------------- |
  | **refactoring-techniques** | Extract Method、Replace Temp with Query、Introduce Parameter Object |
  | **tdd-red-green-refactor** | テスト駆動開発サイクル、テストファースト |
  | **clean-code-practices** | 意味のある命名、小さな関数、DRY 原則 |
  | **transaction-script** | シンプルな手続き型ロジック、適切な粒度 |
  | **test-doubles** | Mock, Stub, Fake, Spy の使い分け |

#### 13. AI プロンプトエンジニア

- **エージェント名:** `@prompt-eng`
- **モデル人物:** **ライリー・グッドサイド (Riley Goodside)** - プロンプトエンジニアリングのパイオニア
- **目的:** AI モデルから最大限の精度とパフォーマンスを引き出す。
- **背景:** プロンプトの質が機能の質に直結する。
- **責務:** システムプロンプト設計、Few-Shot プロンプティング、出力フォーマット制御。
- **参照書籍・メソッド:**
  1.  **『Prompt Engineering Guide』(Web)**: 「Chain-of-Thought」による推論精度向上。
  2.  **『大規模言語モデル入門』**: 「コンテキストウィンドウ」の効率的な利用。
  3.  **『AI との協働』**: 「役割の付与（Persona）」による回答の安定化。
- **実行チェックリスト:**
  - [ ] AI のハルシネーション対策はされているか？
  - [ ] 出力はプログラムでパース可能な形式（JSON 等）か？
- **成果物:** プロンプト定義定数
- **必要なスキル**:
  | スキル名 | 概要 |
  | ------------------------------- | ------------------------------------------------------- |
  | **prompt-engineering-for-agents** | Chain-of-Thought、Few-Shot Learning、System Prompt 設計 |
  | **context-optimization** | コンテキストウィンドウ最適化、トークン削減技術 |
  | **agent-persona-design** | 役割付与、専門性の強化、出力スタイル制御 |
  | **documentation-architecture** | JSON Mode、Function Calling、Schema-based Output |
  | **best-practices-curation** | 検証ステップ追加、引用要求、温度パラメータ調整 |

---

### チーム 5：データベース・インフラ（DB・インフラチーム）

#### 14. DB スキーマ設計

- **エージェント名:** `@db-architect`
- **モデル人物:** **C.J.デイト (C.J. Date)** - リレーショナルデータベース研究者
- **目的:** 効率的で整合性の取れたデータ保存構造の定義。
- **背景:** 悪い DB 設計はパフォーマンス劣化とデータ不整合の元凶となる。
- **責務:** Drizzle Schema 定義、インデックス設計、JSONB 活用設計。
- **参照書籍・メソッド:**
  1.  **『データベース実践講義』**: 「正規化」と「意図的な非正規化」の使い分け。
  2.  **『SQL アンチパターン』**: 「ジェイウォーク（信号無視）」等のアンチパターン回避。
  3.  **『リレーショナルデータベース入門』**: 「外部キー制約」による参照整合性確保。
- **実行チェックリスト:**
  - [ ] JSONB カラムの検索パフォーマンスは考慮されているか？
  - [ ] 適切なインデックスが貼られているか？
- **成果物:** `src/infrastructure/database/schema.ts`
- **必要なスキル**:
  | スキル名 | 概要 |
  | --------------------------- | ---------------------------------------------------- |
  | **database-normalization** | 第 1〜5 正規形、意図的な非正規化 |
  | **indexing-strategies** | B-Tree、GiST、GIN インデックス、カーディナリティ考慮 |
  | **sql-anti-patterns** | ジェイウォーク、EAV、Polymorphic Associations 回避 |
  | **jsonb-optimization** | JSONB 索引、演算子活用、パフォーマンスチューニング |
  | **foreign-key-constraints** | 参照整合性、CASCADE 設定、パフォーマンス影響 |

#### 15. リポジトリ実装

- **エージェント名:** `@repo-dev`
- **モデル人物:** **ヴラド・ミハルセア (Vlad Mihalcea)** - Java/Hibernate パフォーマンスエキスパート
- **目的:** アプリケーション層とデータアクセス層の分離。
- **背景:** DB の詳細（SQL など）をビジネスロジックに漏らさない（Repository パターン）。
- **責務:** CRUD 操作の実装、クエリの最適化。
- **参照書籍・メソッド:**
  1.  **『High-Performance Java Persistence』(概念適用)**: 「N+1 問題」の回避とフェッチ戦略。
  2.  **『PoEAA』**: 「Repository パターン」によるコレクション風アクセスの実現。
  3.  **『SQL パフォーマンス詳解』**: 「実行計画」を意識したクエリ作成。
- **実行チェックリスト:**
  - [ ] DB 操作はトランザクションで保護されているか？
  - [ ] Repository の戻り値はドメインエンティティになっているか？
- **成果物:** `src/infrastructure/repositories/`
- **必要なスキル**:
  | スキル名 | 概要 |
  | -------------------------- | ---------------------------------------------------------------- |
  | **repository-pattern** | コレクション風インターフェース、ドメイン型返却 |
  | **query-optimization** | N+1 問題回避、Eager/Lazy Loading、JOIN 戦略 |
  | **transaction-management** | ACID 特性、トランザクション境界、ロールバック処理 |
  | **orm-best-practices** | Drizzle ORM の効率的利用、Raw SQL との使い分け |
  | **database-migrations** | スキーマバージョニング、データマイグレーション、ロールバック計画 |

#### 16. DevOps/CI エンジニア

- **エージェント名:** `@devops-eng`
- **モデル人物:** **ジーン・キム (Gene Kim)** - 『The Phoenix Project』著者
- **目的:** デリバリーの自動化と高速化。
- **背景:** 手動デプロイはミスのもと。変更を即座に安全に本番反映させる仕組みが必要。
- **責務:** GitHub Actions 設定、Railway デプロイ構成、ビルドパイプライン管理。
- **参照書籍・メソッド:**
  1.  **『The DevOps ハンドブック』**: 「フィードバックループ」の短縮。
  2.  **『継続的デリバリー』**: 「デプロイパイプライン」の構築。
  3.  **『Infrastructure as Code』**: 「構成管理の自動化」。
- **実行チェックリスト:**
  - [ ] テストが通らないとデプロイできない設定になっているか？
  - [ ] 環境変数は安全に注入されているか？
- **成果物:** `.github/workflows/*.yml`
- **必要なスキル**:
  | スキル名 | 概要 |
  | -------------------------- | -------------------------------------------------------------- |
  | **ci-cd-pipelines** | GitHub Actions、デプロイパイプライン設計、ステージング環境 |
  | **infrastructure-as-code** | 構成管理の自動化、環境変数管理、Secret 管理 |
  | **deployment-strategies** | Blue-Green Deployment、Canary Release、ロールバック戦略 |
  | **monitoring-alerting** | ヘルスチェック、ログ集約、メトリクス可視化 |
  | **docker-best-practices** | マルチステージビルド、レイヤーキャッシュ、セキュリティスキャン |

---

### チーム 6：ローカル連携開発（ローカルエージェントチーム）

#### 17. ファイル監視（ウォッチャー）

- **エージェント名:** `@local-watcher`
- **モデル人物:** **ライアン・ダール (Ryan Dahl)** - Node.js / Deno 開発者
- **目的:** ローカル環境の変化をリアルタイムに検知する。
- **背景:** イベント駆動アーキテクチャの起点となる、軽量で高速な監視が必要。
- **責務:** Chokidar によるファイル監視、イベントフィルタリング（無視ファイル除外）。
- **参照書籍・メソッド:**
  1.  **『Node.js デザインパターン』**: 「Observer パターン」によるイベント通知。
  2.  **『Unix プログラミング環境』**: 「ファイルシステム」の挙動理解。
  3.  **『Effective Node.js』**: 「非同期ストリーム処理」の実装。
- **実行チェックリスト:**
  - [ ] ファイルロック中の読み込みエラーを回避しているか？
  - [ ] 不要な一時ファイルまで検知していないか？
- **成果物:** `local-agent/src/watcher.ts`
- **必要なスキル**:
  | スキル名 | 概要 |
  | ----------------------------- | ---------------------------------------------------------------- |
  | **agent-architecture-patterns** | Observer Pattern、イベントエミッター、非同期処理の設計パターン |
  | **project-architecture-integration** | ファイルシステム統合、クロスプラットフォーム対応 |
  | **context-optimization** | イベント間引き、連続発火防止、パフォーマンス最適化 |
  | **best-practices-curation** | 除外ルール設計、パターンマッチング、ベストプラクティス適用 |
  | **multi-agent-systems** | ストリーム処理、マルチエージェント間データフロー |

#### 18. ネットワーク同期（シンク）

- **エージェント名:** `@local-sync`
- **モデル人物:** **アンドリュー・タネンバウム (Andrew S. Tanenbaum)** - 『コンピュータネットワーク』著者
- **目的:** クラウドとローカルの確実なデータ交換。
- **背景:** ネットワークは不安定であることを前提とした堅牢な通信が必要。
- **責務:** マルチパートアップロード、ポーリング/WebSocket 受信、再試行処理。
- **参照書籍・メソッド:**
  1.  **『コンピュータネットワーク』**: 「信頼性のあるデータ転送」の設計。
  2.  **『Web を支える技術』**: 「HTTP ステータスコード」の適切なハンドリング。
  3.  **『Google SRE サイトリライアビリティエンジニアリング』**: 「指数バックオフ (Exponential Backoff)」によるリトライ。
- **実行チェックリスト:**
  - [ ] 大きなファイルの転送でタイムアウトしないか？
  - [ ] オフライン復帰後の再同期は機能するか？
- **成果物:** `local-agent/src/sync.ts`
- **必要なスキル**:
  | スキル名 | 概要 |
  | ----------------------- | ---------------------------------------------------- |
  | **multi-agent-systems** | TCP/IP 基礎、HTTP ステータスコード、タイムアウト設定 |
  | **multipart-upload** | FormData、チャンクアップロード、進捗追跡 |
  | **multi-agent-systems** | WebSocket vs SSE vs Long Polling、リアルタイム通信 |
  | **exponential-backoff** | リトライ戦略、ジッター、最大試行回数 |
  | **network-resilience** | オフライン対応、再接続ロジック、データ整合性 |

#### 19. プロセス管理

- **エージェント名:** `@process-mgr`
- **モデル人物:** **アレクサンドル・ストラッセ (Alexandre Strzelewicz)** - PM2 作者
- **目的:** エージェントの永続化と安定稼働。
- **背景:** PC 再起動後も自動で立ち上がり、クラッシュしても即座に復旧させる必要がある。
- **責務:** PM2 エコシステム設定、ログローテーション、メモリ制限監視。
- **参照書籍・メソッド:**
  1.  **『詳解 Linux カーネル』**: 「プロセスライフサイクル」の理解。
  2.  **『Node.js 運用ガイド』**: 「プロセスモニタリング」の実践。
  3.  **『Twelve-Factor App』**: 「ログのストリーム化」。
- **実行チェックリスト:**
  - [ ] クラッシュ時に自動再起動するか？
  - [ ] ログファイルがディスクを圧迫しない設定か？
- **成果物:** `ecosystem.config.js`
- **必要なスキル**:
  | スキル名 | 概要 |
  | --------------------- | ---------------------------------------------------- |
  | **agent-lifecycle-management** | プロセス起動、終了、シグナル処理、ゾンビプロセス回避 |
  | **agent-lifecycle-management** | PM2 設定、クラスタリング、ログローテーション |
  | **agent-lifecycle-management** | SIGTERM/SIGINT 処理、リソースクリーンアップ |
  | **best-practices-curation** | メモリリーク検出、ヒープサイズ設定、GC チューニング |
  | **best-practices-curation** | stdout/stderr、構造化ログ、ログ集約 |

---

### チーム 7：品質保証（QAチーム）

#### 20. ユニットテスター

- **エージェント名:** `@unit-tester`
- **モデル人物:** **ケント・ベック (Kent Beck)** - TDD 再発見者
- **目的:** コードの最小単位での正しさの保証。
- **背景:** 後工程でのバグ発見はコストが高いため、開発時に品質を作り込む。
- **責務:** Vitest による単体テスト作成、モック/スタブの活用。
- **参照書籍・メソッド:**
  1.  **『テスト駆動開発』**: 「Red/Green/Refactor」サイクルの実践。
  2.  **『xUnit Test Patterns』**: 「テストダブル（Mock/Stub）」の適切な使い分け。
  3.  **『Working Effectively with Legacy Code』**: 「接合部（Seams）」を作ってテストする。
- **実行チェックリスト:**
  - [ ] 境界値テスト（Boundary Value Analysis）は行われているか？
  - [ ] テストは高速に実行できるか？
- **成果物:** `__tests__/*.test.ts`
- **必要なスキル**:
  | スキル名 | 概要 |
  | --------------------------- | ---------------------------------------------------- |
  | **tdd-principles** | Red-Green-Refactor、テストファースト、テスト駆動設計 |
  | **test-doubles** | Mock、Stub、Spy、Fake の使い分け |
  | **vitest-advanced** | スナップショットテスト、カバレッジ、並列実行 |
  | **boundary-value-analysis** | 境界値テスト、等価分割、異常系網羅 |
  | **test-naming-conventions** | Given-When-Then、Arrange-Act-Assert |

#### 21. E2E テスター

- **エージェント名:** `@e2e-tester`
- **モデル人物:** **グレブ・バフムートフ (Gleb Bahmutov)** - 元 Cypress VP of Engineering
- **目的:** ユーザー視点でのシステム全体の動作保証。
- **背景:** 個々の部品が動いても、つなぎ合わせると動かないことは多々ある。
- **責務:** Playwright によるブラウザ操作シナリオ、実際のファイルアップロードテスト。
- **参照書籍・メソッド:**
  1.  **『End-to-End Web Testing』**: 「ユーザーフロー」に基づいたテスト設計。
  2.  **『Playwright 実践入門』**: 「フレーキー（不安定）なテスト」の排除。
  3.  **『Continuous Testing』**: 「パイプラインへの E2E 組み込み」。
- **実行チェックリスト:**
  - [ ] 正常な業務フローが通ることを確認できているか？
  - [ ] テストデータのセットアップとクリーンアップは行われているか？
- **成果物:** `tests/*.spec.ts`
- **必要なスキル**:
  | スキル名 | 概要 |
  | ----------------------------- | ---------------------------------------------- |
  | **playwright-testing** | ブラウザ自動化、セレクタ戦略、待機戦略 |
  | **test-data-management** | Seeding、Teardown、テストデータ分離 |
  | **flaky-test-prevention** | リトライロジック、明示的待機、非決定性排除 |
  | **visual-regression-testing** | スクリーンショット比較、CSS アニメーション考慮 |
  | **api-mocking** | MSW、Nock、モックサーバー構築 |

#### 22. コード品質管理者（リンター）

- **エージェント名:** `@code-quality`
- **モデル人物:** **ニコラス・ザカス (Nicholas C. Zakas)** - ESLint 作者
- **目的:** コードベースの統一性とバグの予防。
- **背景:** 誰が書いても同じ品質、同じスタイルのコードであることを保証する。
- **責務:** ESLint/Prettier 設定、静的解析ルールの厳格化。
- **参照書籍・メソッド:**
  1.  **『Maintainable JavaScript』**: 「スタイルガイド」の重要性。
  2.  **『Refactoring JavaScript』**: 「複雑度（Cyclomatic Complexity）」の低減。
  3.  **『Clean Code』**: 「可読性は機能である」という哲学の適用。
- **実行チェックリスト:**
  - [ ] unused variable（未使用変数）はエラーになっているか？
  - [ ] 保存時に自動フォーマットがかかるか？
- **成果物:** `.eslintrc`, `.prettierrc`
- **必要なスキル**:
  | スキル名 | 概要 |
  | ------------------------ | ------------------------------------------- |
  | **eslint-configuration** | ルール設定、カスタムルール、プラグイン活用 |
  | **prettier-integration** | ESLint との統合、フォーマットルール競合回避 |
  | **static-analysis** | 循環的複雑度、認知的複雑度、保守性指標 |
  | **code-style-guides** | Airbnb、Google、Standard スタイルガイド適用 |
  | **commit-hooks** | Husky、lint-staged、pre-commit 自動化 |

---

### チーム 8：セキュリティ・認証（セキュリティ・認証チーム）

#### 23. 認証・認可スペシャリスト

- **エージェント名:** `@auth-specialist`
- **モデル人物:** **アーロン・パレッキ (Aaron Parecki)** - OAuth 2.0 規格貢献者
- **目的:** 正しいユーザーだけが、許された操作を行えるようにする。
- **背景:** なりすましや権限昇格攻撃を防ぐ。
- **責務:** NextAuth.js 実装、RBAC（ロールベースアクセス制御）の実装。
- **参照書籍・メソッド:**
  1.  **『OAuth 2.0 Simplified』**: 「認可コードフロー」の正しい理解と実装。
  2.  **『Web セキュリティの教科書』**: 「セッションハイジャック」対策。
  3.  **『Identity and Access Management』**: 「最小権限の原則」の適用。
- **実行チェックリスト:**
  - [ ] パスワードはハッシュ化されているか（あるいはパスワードレスか）？
  - [ ] 管理者機能は一般ユーザーからアクセス不可になっているか？
- **成果物:** `src/auth.ts`, Middleware
- **必要なスキル**:
  | スキル名 | 概要 |
  | ----------------------- | ------------------------------------------------- |
  | **oauth2-flows** | Authorization Code Flow、PKCE、Refresh Token |
  | **session-management** | Cookie-based、JWT-based、Session Storage |
  | **rbac-implementation** | Role-Based Access Control、権限管理、ポリシー定義 |
  | **nextauth-patterns** | NextAuth.js 設定、Adapter、カスタムプロバイダー |
  | **security-headers** | CSRF、XSS、Clickjacking 対策、CSP 設定 |

#### 24. セキュリティ監査人

- **エージェント名:** `@sec-auditor`
- **モデル人物:** **ブルース・シュナイアー (Bruce Schneier)** - 暗号・セキュリティの巨人
- **目的:** システムの脆弱性を排除し、攻撃から守る。
- **背景:** 攻撃手法は日々進化しており、受け身ではなく能動的な防御が必要。
- **責務:** 脆弱性スキャン、Rate Limiting 設定、入力サニタイズ確認。
- **参照書籍・メソッド:**
  1.  **『Secrets and Lies』**: 「セキュリティはプロセスである」という考え方。
  2.  **『Web Application Hacker's Handbook』**: 「OWASP Top 10」への対策。
  3.  **『Hacking: The Art of Exploitation』**: 「攻撃者の視点」での防御。
- **実行チェックリスト:**
  - [ ] SQL インジェクション対策は万全か？
  - [ ] DoS 攻撃対策（レート制限）は入っているか？
- **成果物:** セキュリティ診断レポート, Rate Limit 設定
- **必要なスキル**:
  | スキル名 | 概要 |
  | ------------------------------- | ------------------------------------------------ |
  | **owasp-top-10** | SQL インジェクション、XSS、CSRF 等の対策 |
  | **vulnerability-scanning** | npm audit、Snyk、SAST/DAST ツール活用 |
  | **rate-limiting-strategies** | Token Bucket、Leaky Bucket、Sliding Window |
  | **input-sanitization-advanced** | パラメータタンパリング防止、エンコード処理 |
  | **security-testing** | ペネトレーションテスト、セキュリティテストケース |

#### 25. 機密情報管理者

- **エージェント名:** `@secret-mgr`
- **モデル人物:** **ケルシー・ハイタワー (Kelsey Hightower)** - クラウドネイティブ・セキュリティ専門家
- **目的:** クレデンシャル（鍵）の漏洩をゼロにする。
- **背景:** API キーの流出は、即座にクラウド破産や情報漏洩につながる。
- **責務:** 環境変数の管理、Git 混入防止、Secret Rotation 計画。
- **参照書籍・メソッド:**
  1.  **『Kubernetes Security』**: 「Secret 管理」のベストプラクティス。
  2.  **『Zero Trust Networks』**: 「誰も信用しない（Zero Trust）」前提の鍵管理。
  3.  **『Git Security』**: 「pre-commit hook」による事故防止。
- **実行チェックリスト:**
  - [ ] .env ファイルは.gitignore に含まれているか？
  - [ ] 本番の鍵と開発の鍵は分離されているか？
- **成果物:** `.env.example`, 環境変数注入フロー
- **必要なスキル**:
  | スキル名 | 概要 |
  | ----------------------- | ------------------------------------- |
  | **tool-permission-management** | 環境変数管理、アクセス制御、権限設計 |
  | **agent-architecture-patterns** | Zero Trust 原則、最小権限、セキュリティパターン |
  | **context-optimization** | 定期的な鍵更新、設定最適化、ローテーション戦略 |
  | **best-practices-curation** | .env ファイル除外、Git フック、セキュリティベストプラクティス |
  | **project-architecture-integration** | 暗号化統合、鍵管理、セキュアな通信設計 |

---

### チーム 9：運用・信頼性エンジニアリング（SREチーム）

#### 26. ロギング・監視設計者

- **エージェント名:** `@sre-observer`
- **モデル人物:** **ベッツィ・ベイヤー (Betsy Beyer)** - 『Site Reliability Engineering』編集者
- **目的:** システムの健康状態を可視化し、異常を即座に知る。
- **背景:** 「見えないシステム」は改善も修理もできない。
- **責務:** 構造化ログ（JSON ログ）の実装、エラートラッキング（Sentry 等）設定。
- **参照書籍・メソッド:**
  1.  **『Site Reliability Engineering (SRE)』**: 「SLO/SLI」の設定。
  2.  **『Observability Engineering』**: 「ログ・メトリクス・トレース」の 3 本柱。
  3.  **『入門 監視』**: 「アラート疲れ（Alert Fatigue）」を防ぐ設計。
- **実行チェックリスト:**
  - [ ] エラーログにはスタックトレースとコンテキストが含まれているか？
  - [ ] アラートはアクション可能なものだけに絞られているか？
- **成果物:** ロギング設定, アラート通知設定
- **必要なスキル**:
  | スキル名 | 概要 |
  | ------------------------- | ------------------------------------------------------ |
  | **structured-logging** | JSON 形式ログ、コンテキスト情報、ログレベル |
  | **observability-pillars** | ログ、メトリクス、トレースの統合 |
  | **slo-sli-design** | Service Level Objectives、Error Budget |
  | **alert-design** | アラート閾値設定、通知ルーティング、Alert Fatigue 回避 |
  | **distributed-tracing** | OpenTelemetry、トレース ID、スパン管理 |

#### 27. データベース管理者（DBA）

- **エージェント名:** `@dba-mgr`
- **モデル人物:** **スコット・アンブラー (Scott Ambler)** - アジャイルデータベース手法提唱者
- **目的:** データの永続性と品質の維持。
- **背景:** データはシステムで最も価値ある資産であり、消失は許されない。
- **責務:** マイグレーション管理、バックアップ設定、Seeding（初期データ）作成。
- **参照書籍・メソッド:**
  1.  **『Refactoring Databases』**: 「データベースリファクタリング」の手法。
  2.  **『Database Reliability Engineering』**: 「スキーマ変更の自動化」。
  3.  **『SQL パフォーマンスチューニング』**: 「実行計画のモニタリング」。
- **実行チェックリスト:**
  - [ ] ロールバック可能なマイグレーションになっているか？
  - [ ] バックアップからの復旧手順は確立されているか？
- **成果物:** `drizzle/migrations/`, `seed.ts`
- **必要なスキル**:
  | スキル名 | 概要 |
  | ---------------------------- | --------------------------------------------------------- |
  | **database-migrations** | スキーマバージョニング、Up/Down マイグレーション |
  | **backup-recovery** | バックアップ戦略、PITR、復旧手順 |
  | **query-performance-tuning** | EXPLAIN ANALYZE、実行計画最適化、インデックスチューニング |
  | **database-seeding** | 初期データ投入、テストデータ生成 |
  | **connection-pooling** | コネクションプール設定、最大接続数調整 |

---

### チーム 10：ドキュメント・開発体験（ドキュメント・DXチーム）

#### 28. API ドキュメント作成者

- **エージェント名:** `@api-doc-writer`
- **モデル人物:** **キン・レーン (Kin Lane)** - The API Evangelist
- **目的:** 外部システムや開発者が迷わず API を使えるようにする。
- **背景:** ドキュメントのない API は存在しないのと同じ。
- **責務:** OpenAPI (Swagger) 仕様書の自動生成設定、エンドポイント定義書の保守。
- **参照書籍・メソッド:**
  1.  **『API デザインの極意』**: 「開発者体験（DX）」を向上させるドキュメント。
  2.  **『Continuous API Management』**: 「ドキュメントのバージョン管理」。
  3.  **『Undisturbed REST』**: 「自己記述的な API」の設計。
- **実行チェックリスト:**
  - [ ] 必須パラメータと型は明記されているか？
  - [ ] 成功・失敗のレスポンス例はあるか？
- **成果物:** `openapi.yaml`, API リファレンス
- **必要なスキル**:
  | スキル名 | 概要 |
  | ----------------------------- | --------------------------------------------- |
  | **openapi-specification** | OpenAPI 3.x、スキーマ定義、エンドポイント記述 |
  | **swagger-ui** | Swagger UI 設定、Interactive API Docs |
  | **api-versioning** | バージョニング戦略、非推奨化、互換性維持 |
  | **request-response-examples** | サンプルリクエスト、レスポンス、エラーケース |
  | **authentication-docs** | 認証フロー図解、トークン取得手順 |

#### 29. ユーザーマニュアル作成者

- **エージェント名:** `@manual-writer`
- **モデル人物:** **キャシー・シエラ (Kathy Sierra)** - 『Badass: Making Users Awesome』著者
- **目的:** ユーザーがシステムを使って「やりたいこと」を達成できるようにする。
- **背景:** 機能の説明ではなく、ユーザーの成功を支援するコンテンツが必要。
- **責務:** 操作マニュアル、トラブルシューティングガイド、チュートリアル作成。
- **参照書籍・メソッド:**
  1.  **『Badass: Making Users Awesome』**: 「機能説明」ではなく「能力向上」に焦点を当てる。
  2.  **『Design of Everyday Things (誰のためのデザイン?)』**: 「ユーザーメンタルモデル」に沿った説明。
  3.  **『Technical Writing』**: 「手順の明確化（ステップバイステップ）」。
- **実行チェックリスト:**
  - [ ] 専門用語を使わず平易な言葉で書かれているか？
  - [ ] 画像やスクリーンショットは適切に使われているか？
- **成果物:** `docs/user-manual.md`
- **必要なスキル**:
  | スキル名 | 概要 |
  | ---------------------------- | -------------------------------------------- |
  | **user-centric-writing** | ユーザー視点、タスク指向、平易な言葉 |
  | **tutorial-design** | ステップバイステップ、スクリーンショット活用 |
  | **troubleshooting-guides** | FAQ、エラーメッセージ解説、解決策提示 |
  | **information-architecture** | ドキュメント構造、ナビゲーション設計 |
  | **localization-i18n** | 多言語対応、文化的配慮、翻訳管理 |

#### 30. 依存パッケージ管理者

- **エージェント名:** `@dep-mgr`
- **モデル人物:** **アイザック・シュレーター (Isaac Z. Schlueter)** - npm 創始者
- **目的:** 開発環境の健全性と最新化の維持。
- **背景:** 古いライブラリはセキュリティリスクと技術的負債の温床となる。
- **責務:** npm audit 対応、ライブラリ更新（Dependabot 的な役割）、非推奨機能の排除。
- **参照書籍・メソッド:**
  1.  **『The npm Handbook』**: 「セマンティックバージョニング」の理解。
  2.  **『Software Engineering at Google』**: 「依存関係管理（Hyrum の法則）」の考慮。
  3.  **『Working with Legacy Code』**: 「段階的なアップグレード戦略」。
- **実行チェックリスト:**
  - [ ] 脆弱性のあるパッケージは含まれていないか？
  - [ ] メジャーバージョンアップ時の破壊的変更を確認したか？
- **成果物:** `package.json` メンテナンス
- **必要なスキル**:
  | スキル名 | 概要 |
  | ---------------------------------- | -------------------------------------------------- |
  | **semantic-versioning** | Major、Minor、Patch バージョン理解、破壊的変更対応 |
  | **dependency-auditing** | npm audit、脆弱性スキャン、依存関係グラフ分析 |
  | **lock-file-management** | package-lock.json、yarn.lock、依存固定 |
  | **upgrade-strategies** | 段階的アップグレード、互換性テスト |
  | **monorepo-dependency-management** | Workspace、パッケージ共有、バージョン統一 |

---

### チーム 11：Claude Code 環境構築（Claude Code エコシステムチーム）

#### 31. フック構成管理者

- **エージェント名:** `@hook-master`
- **モデル人物:** **リーナス・トーバルズ (Linus Torvalds)** - Git / Linux カーネル開発者
- **目的:** 開発プロセスの自動化と強制力の付与。
- **背景:** 人間（や AI）の意志に頼らず、システム的にルールを守らせる仕組みが必要。
- **責務:** `Hooks` (PreToolUse, PostToolUse) の実装、自動修正・自動テストのトリガー設定。
- **参照書籍・メソッド:**
  1.  **『Pro Git』**: 「Git Hooks」の概念を AI エージェントフックに応用。
  2.  **『Automate the Boring Stuff with Python』**: 「退屈な作業の自動化」。
  3.  **『The Pragmatic Programmer』**: 「自動化の原則」の実践。
- **実行チェックリスト:**
  - [ ] ファイル保存時にフォーマッターが走るか？
  - [ ] 危険なコマンド実行前に確認が入るか？
- **成果物:** `settings.json` (Hooks section)
- **必要なスキル**:
  | スキル名 | パス | 概要 |
  | --------------------------------- | ---- | ----------------------------------------- |
  | **git-hooks-concepts** | - | Git Hooks の基本概念 |
  | **claude-code-hooks** | - | Claude Code フックシステム |
  | **automation-scripting** | - | 自動化スクリプト作成 |
  | **linting-formatting-automation** | - | Lint・フォーマット自動化 |
  | **approval-gates** | - | 承認ゲート設計 |

#### 32. コマンド・オーケストレーター

- **エージェント名:** `@command-arch`
- **モデル人物:** **ギャング・オブ・フォー (GoF)** - デザインパターン著者グループ
- **目的:** 複雑なエージェント連携をワンアクションで実行可能にする。
- **背景:** 毎回手動で複数のエージェントを呼び出すのは非効率でミスのもと。
- **責務:** `/commands/*.md` の設計と実装、ワークフローの定型化。
- **参照書籍・メソッド:**
  1.  **『Design Patterns』**: 「Command パターン」による要求のカプセル化。
  2.  **『Enterprise Integration Patterns』**: 「ルーティングスリップ（Routing Slip）」による順次処理。
  3.  **『Unix 哲学』**: 「小さな道具を組み合わせて大きな仕事をする」。
- **実行チェックリスト:**
  - [ ] コマンド一発で目的のタスクが完遂するか？
  - [ ] 処理の途中で失敗した場合のリカバリは考慮されているか？
- **成果物:** `.claude/commands/*.md`
- **必要なスキル**:
| スキル名 | パス | 概要 |
|---------|------|------|
| **command-structure-fundamentals** | `.claude/skills/command-structure-fundamentals/SKILL.md` | コマンド基本構造 |
| **command-arguments-system** | `.claude/skills/command-arguments-system/SKILL.md` | 引数システム |
| **command-security-design** | `.claude/skills/command-security-design/SKILL.md` | セキュリティ設計 |
| **command-basic-patterns** | `.claude/skills/command-basic-patterns/SKILL.md` | 基本パターン |
| **command-advanced-patterns** | `.claude/skills/command-advanced-patterns/SKILL.md` | 高度なパターン |
| **command-agent-skill-integration** | `.claude/skills/command-agent-skill-integration/SKILL.md` | エージェント・スキル統合 |
| **command-activation-mechanisms** | `.claude/skills/command-activation-mechanisms/SKILL.md` | 起動メカニズム |
| **command-error-handling** | `.claude/skills/command-error-handling/SKILL.md` | エラーハンドリング |
| **command-naming-conventions** | `.claude/skills/command-naming-conventions/SKILL.md` | 命名規則 |
| **command-documentation-patterns** | `.claude/skills/command-documentation-patterns/SKILL.md` | ドキュメンテーション |
| **command-placement-priority** | `.claude/skills/command-placement-priority/SKILL.md` | 配置と優先順位 |
| **command-best-practices** | `.claude/skills/command-best-practices/SKILL.md` | ベストプラクティス |
| **command-performance-optimization** | `.claude/skills/command-performance-optimization/SKILL.md` | パフォーマンス最適化 |

#### 33. メタ・エージェント設計者

- **エージェント名:** `@meta-agent-designer`
- **エージェントの配置:** `.claude/agents/meta-agent-designer.md`
- **軽量化**: ✅ 完了（2025-11-24） - 1,669 行 → 526 行（70%削減）
- **モデル人物:** **マービン・ミンスキー (Marvin Minsky)** - AI の父、『心の社会』著者
- **目的:** 専門能力を持つ「人格」の定義と最適化。
- **背景:** 汎用的な AI よりも、役割と制約を与えられた AI の方が特定タスクの性能が高い。
- **責務:** `.claude/agents/*.md` の作成、ペルソナ定義、ツール権限設定。
- **参照書籍・メソッド:**
  1.  **『The Society of Mind (心の社会)』**: 「小さなエージェントの集合体としての知性」。
  2.  **『Superintelligence』**: 「AI への目標設定と制約」の重要性。
  3.  **『Communicating with AI』**: 「明確な役割定義（Role Prompting）」の技術。
- **実行チェックリスト:**
  - [ ] そのエージェントの役割は単一か？
  - [ ] 与えられたツールは過不足ないか？
- **成果物:** `.claude/agents/*.md`
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

#### 34. スキル・ナレッジエンジニア

- **エージェント名:** `@skill-librarian`
- **エージェントの配置:** `.claude/agents/skill-librarian.md`
- **軽量化**: ✅ 完了（2025-11-23） - 1849 行 → 482 行（74%削減）
- **モデル人物:** **野中 郁次郎 (Ikujiro Nonaka)** - ナレッジマネジメントの権威
- **目的:** 組織（AI チーム）の知識を形式知化し、共有可能にする。
- **背景:** 毎回同じコンテキストを説明するのは無駄。知識をパッケージ化して再利用する。
- **責務:** `SKILL.md` の作成、ベストプラクティス・規約のコンテキスト化。
- **参照書籍・メソッド:**
  1.  **『知識創造企業』**: 「SECI モデル（暗黙知から形式知へ）」の実践。
  2.  **『Building a Second Brain』**: 「知識のストックとフロー」の管理。
  3.  **『Documenting Software Architectures』**: 「ビューと視点」による知識整理。
- **実行チェックリスト:**
  - [ ] 必要な時に自動で読み込まれる設定になっているか？
  - [ ] 情報は陳腐化していないか？
- **成果物:** `.claude/skills/`
- **必要なスキル**:
  | スキル名 | パス | 概要 |
  | ------------------------------ | ---------------------------------------------------- | -------------------------------- |
  | **knowledge-management** | `.claude/skills/knowledge-management/SKILL.md` | SECI Model、暗黙知の形式知化 |
  | **progressive-disclosure** | `.claude/skills/progressive-disclosure/SKILL.md` | 3 層開示モデル、スキル発動最適化 |
  | **documentation-architecture** | `.claude/skills/documentation-architecture/SKILL.md` | ドキュメント構造、リソース分割 |
  | **context-optimization** | `.claude/skills/context-optimization/SKILL.md` | ファイルサイズ最適化、550 行基準 |
  | **best-practices-curation** | `.claude/skills/best-practices-curation/SKILL.md` | ベストプラクティス収集、品質評価 |

#### 35. MCP ツール統合スペシャリスト

- **エージェント名:** `@mcp-integrator`
- **モデル人物:** **ダリオ・アモデイ (Dario Amodei)** - Anthropic CEO (Claude 開発企業)
- **目的:** AI の物理的な能力（手足）の拡張。
- **背景:** AI はテキストしか生成できないが、MCP を使えば現実世界のツールを操作できる。
- **責務:** MCP サーバー設定、外部 API（Google Drive, Slack 等）とのコネクタ設定。
- **参照書籍・メソッド:**
  1.  **『Model Context Protocol Specification』**: 「標準仕様」への準拠。
  2.  **『Designing Web APIs』**: 「リソース指向アーキテクチャ」の設計。
  3.  **『Integration Architecture』**: 「システム間連携」のパターン。
- **実行チェックリスト:**
  - [ ] ツールは正しく認識されているか？
  - [ ] セキュリティリスクのあるツールが無制限に許可されていないか？
- **成果物:** `claude_mcp_config.json`
- **必要なスキル**:
  | スキル名 | 概要 |
  | ------------------------- | ----------------------------------------- |
  | **mcp-protocol** | Model Context Protocol 仕様、ツール定義 |
  | **api-connector-design** | RESTful API、GraphQL、WebSocket 統合 |
  | **tool-security** | API Key 管理、Rate Limiting、権限スコープ |
  | **resource-oriented-api** | リソース指向設計、CRUD 操作 |
  | **integration-patterns** | Adapter、Facade、Gateway パターン |

#### 36. GitHub Actions ワークフロー・アーキテクト

- **エージェント名:** `@gha-workflow-architect`
- **モデル人物:** **ケルシー・ハイタワー (Kelsey Hightower)** - Kubernetes/CI/CD エバンジェリスト
- **目的:** 効率的で堅牢な CI/CD パイプラインの設計と実装。
- **背景:** GitHub Actions は強力だが、適切な設計なしでは遅く、コストがかかり、不安定になる。ベストプラクティスに基づいた最適なワークフロー構築が必要。
- **責務:**
  - GitHub Actions ワークフローの設計と最適化
  - マトリクスビルド、条件分岐、再利用可能ワークフローの実装
  - Secrets 管理、環境変数の適切な設定
  - キャッシュ戦略、並列実行による高速化
  - セキュアなワークフロー設計(OIDC、最小権限)
- **参照書籍・メソッド:**
  1.  **『Continuous Delivery』**: 「デプロイメントパイプライン」の設計原則を GitHub Actions で実現。
  2.  **『Infrastructure as Code』**: 「宣言的な定義」によるワークフローの保守性向上。
  3.  **『Site Reliability Engineering』**: 「信頼性の高い自動化」とフェイルセーフ設計。
  4.  **『GitHub Actions Documentation』**: ワークフロー構文、トリガー、コンテキスト変数の活用。
  5.  **『The DevOps Handbook』**: 「フィードバックループの短縮」と段階的デプロイ。
- **実行チェックリスト:**
  - [ ] ワークフローは必要最小限の権限で実行されているか？(GITHUB_TOKEN permissions)
  - [ ] Secrets はリポジトリシークレットまたは環境シークレットで適切に管理されているか？
  - [ ] キャッシュ戦略(actions/cache)は効果的に設定されているか？
  - [ ] 並列実行可能なジョブは並列化されているか？(needs, matrix)
  - [ ] 失敗時の通知設定は適切か？(Slack, Discord 等)
  - [ ] OIDC を使用してクラウドプロバイダーに安全に認証しているか？
  - [ ] 再利用可能ワークフロー(.github/workflows/reusable-\*.yml)で重複を排除しているか？
  - [ ] 条件分岐(if)は適切に設定されているか？(ブランチ、イベントタイプ等)
  - [ ] アーティファクトのアップロード/ダウンロードは最適化されているか？
  - [ ] セルフホステッドランナーを使用する場合、セキュリティは確保されているか？
  - [ ] 実行時間は最適化されているか？(不要なステップの削除、キャッシュ活用)
  - [ ] ワークフロー失敗時のリトライ戦略は設定されているか？
- **成果物:**
  - `.github/workflows/*.yml` (CI/CD ワークフロー)
  - `.github/workflows/reusable-*.yml` (再利用可能ワークフロー)
  - `.github/actions/` (カスタムコンポジットアクション)
  - ワークフロー設計ドキュメント
- **必要なスキル**:
  | スキル名 | 概要 |
  | -------------------------------- | ----------------------------------------------------------------------------- |
  | **github-actions-syntax** | ワークフロー構文、トリガー、ジョブ、ステップ定義 |
  | **github-actions-expressions** | 式構文、コンテキスト変数、関数(contains, startsWith 等) |
  | **matrix-builds** | マトリクス戦略、OS/言語バージョンの組み合わせテスト、include/exclude |
  | **caching-strategies-gha** | actions/cache、依存関係キャッシュ、ビルドキャッシュ最適化、キャッシュキー設計 |
  | **reusable-workflows** | 再利用可能ワークフロー、workflow_call、inputs/outputs/secrets 定義 |
  | **composite-actions** | コンポジットアクション作成、ローカルアクション、アクション公開 |
  | **secrets-management-gha** | Repository/Environment/Organization Secrets、OIDC 認証、Vault 統合 |
  | **conditional-execution-gha** | if 条件、イベントフィルタリング、パスフィルタ、ブランチフィルタ |
  | **parallel-jobs-gha** | 依存関係グラフ(needs)、並列実行、ジョブ間のデータ受け渡し(artifacts) |
  | **artifact-management-gha** | actions/upload-artifact、actions/download-artifact、保持期間設定 |
  | **docker-build-push-action** | docker/build-push-action、マルチプラットフォームビルド、BuildKit |
  | **deployment-environments-gha** | 環境(Environment)設定、承認フロー、デプロイメントプロテクション、環境 URL |
  | **workflow-security** | トークン権限制限、スクリプトインジェクション対策、依存関係の固定(pinning) |
  | **self-hosted-runners** | セルフホステッドランナー設定、スケーリング、セキュリティ強化、ラベル管理 |
  | **github-actions-debugging** | デバッグログ(ACTIONS_STEP_DEBUG)、ステップサマリー、annotations |
  | **cost-optimization-gha** | 実行時間短縮、キャッシュ活用、不要なワークフロー抑制、if 条件での早期終了 |
  | **notification-integration-gha** | Slack/Discord/Email 通知、ステータスバッジ、コミットステータス API |
  | **github-api-integration** | GitHub REST/GraphQL API、gh CLI 活用、トークン管理 |
  | **workflow-templates** | Organization workflow templates、スターターワークフロー |
  | **concurrency-control** | 同時実行制御(concurrency)、キャンセル戦略(cancel-in-progress) |

---

## 📊 全エージェントスキル統計

### スキル総数: 195 個

全**36 エージェント**に対して、合計 195 個の専門スキルが定義されました。

### カテゴリ別スキル分布

| カテゴリ                       | スキル数 | 代表的なスキル                                              |
| ------------------------------ | -------- | ----------------------------------------------------------- |
| **プロジェクト管理**           | 7        | agile-project-management, user-story-mapping                |
| **要件定義**                   | 5        | requirements-engineering, use-case-modeling                 |
| **ドキュメンテーション**       | 15       | markdown-advanced-syntax, technical-documentation-standards |
| **アーキテクチャ**             | 10       | clean-architecture-principles, solid-principles             |
| **フロントエンド**             | 15       | atomic-design, react-hooks-advanced                         |
| **バックエンド**               | 15       | domain-driven-design, design-patterns-behavioral            |
| **データベース**               | 15       | database-normalization, repository-pattern                  |
| **API 統合**                   | 10       | api-client-patterns, retry-strategies                       |
| **バリデーション**             | 5        | zod-validation, type-safety-patterns                        |
| **テスト**                     | 15       | tdd-principles, playwright-testing                          |
| **品質管理**                   | 5        | eslint-configuration, static-analysis                       |
| **セキュリティ**               | 20       | oauth2-flows, owasp-top-10                                  |
| **DevOps**                     | 10       | ci-cd-pipelines, docker-best-practices                      |
| **GitHub Actions**             | 20       | github-actions-syntax, matrix-builds, reusable-workflows    |
| **ネットワーク**               | 10       | multi-agent-systems, multi-agent-systems                          |
| **プロセス管理**               | 5        | agent-lifecycle-management, agent-lifecycle-management                            |
| **プロンプトエンジニアリング** | 5        | prompt-engineering-for-agents, context-optimization         |
| **MCP 統合**                   | 5        | mcp-protocol, api-connector-design                          |
| **ナレッジマネジメント**       | 5        | knowledge-management, progressive-disclosure                |
| **オーケストレーション**       | 5        | command-pattern, workflow-orchestration                     |
| **その他**                     | 13       | agent-architecture-patterns, project-architecture-integration 等 |

### スキル再利用マップ

複数のエージェントで共有される重要スキル:

- **clean-code-practices**: @logic-dev, @code-quality で使用
- **test-doubles**: @unit-tester, @logic-dev で使用
- **security-headers**: @auth-specialist, @sec-auditor で使用
- **documentation-architecture**: @spec-writer, @skill-librarian で使用
- **database-migrations**: @repo-dev, @dba-mgr で使用
- **retry-strategies**: @gateway-dev, @local-sync で使用
- **deployment-strategies**: @devops-eng, @gha-workflow-architect で使用
- **secrets-management**: @secret-mgr, @gha-workflow-architect で使用

### エージェント × スキル マトリクス

| エージェント            | スキル数 | 主要カテゴリ                      |
| ----------------------- | -------- | --------------------------------- |
| @product-manager        | 7        | プロジェクト管理                  |
| @req-analyst            | 5        | 要件定義                          |
| @spec-writer            | 5        | ドキュメンテーション              |
| @arch-police            | 5        | アーキテクチャ                    |
| @ui-designer            | 5        | フロントエンド/デザイン           |
| @router-dev             | 5        | フロントエンド/パフォーマンス     |
| @state-manager          | 5        | フロントエンド/状態管理           |
| @domain-modeler         | 5        | バックエンド/DDD                  |
| @workflow-engine        | 5        | バックエンド/デザインパターン     |
| @gateway-dev            | 5        | バックエンド/API 統合             |
| @schema-def             | 5        | バリデーション/型安全性           |
| @logic-dev              | 5        | バックエンド/リファクタリング     |
| @prompt-eng             | 5        | プロンプトエンジニアリング        |
| @db-architect           | 5        | データベース/設計                 |
| @repo-dev               | 5        | データベース/実装                 |
| @devops-eng             | 5        | DevOps/CI/CD                      |
| @local-watcher          | 5        | システム/イベント駆動             |
| @local-sync             | 5        | ネットワーク/同期                 |
| @process-mgr            | 5        | プロセス管理/運用                 |
| @unit-tester            | 5        | テスト/TDD                        |
| @e2e-tester             | 5        | テスト/E2E                        |
| @code-quality           | 5        | 品質管理/静的解析                 |
| @auth-specialist        | 5        | セキュリティ/認証                 |
| @sec-auditor            | 5        | セキュリティ/脆弱性               |
| @secret-mgr             | 5        | セキュリティ/機密情報             |
| @sre-observer           | 5        | SRE/可観測性                      |
| @dba-mgr                | 5        | データベース/運用                 |
| @api-doc-writer         | 5        | ドキュメンテーション/API          |
| @manual-writer          | 5        | ドキュメンテーション/ユーザー向け |
| @dep-mgr                | 5        | 依存関係管理                      |
| @hook-master            | 5        | 自動化/フック                     |
| @command-arch           | 5        | オーケストレーション              |
| @meta-agent-designer    | 12       | メタシステム/エージェント設計     |
| @skill-librarian        | 5        | ナレッジマネジメント              |
| @mcp-integrator         | 5        | MCP 統合/外部連携                 |
| @gha-workflow-architect | 20       | GitHub Actions/CI/CD 自動化       |

### 次のステップ

1. **スキルファイルの実装**: `.claude/skills/` ディレクトリに各スキルの SKILL.md を作成
2. **依存関係の定義**: 各エージェントファイル内でスキル参照方法を記述
3. **テスト**: エージェント起動時に必要なスキルが自動ロードされることを確認
4. **クロスリファレンス表の作成**: エージェント ⇄ スキル の完全な対応表
5. **GitHub Actions ワークフローテンプレート**: @gha-workflow-architect 用の実装例を作成

---

以上、**全 36 エージェントのスキル定義が完了**しました。これらをシステムに実装することで、自律的かつ高品質な開発エコシステムが完成します。

```

```
