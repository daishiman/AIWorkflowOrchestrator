---
description: |
  機能の完全な開発サイクルを実行する包括的なワークフローコマンド。

  要件定義 → 設計 → 実装 → テスト → レビュー の全フェーズを自動化します。
  TDD、Clean Architecture、ハイブリッド構造に準拠した機能開発を実現します。

  🤖 起動エージェント（Phase別）:
  - Phase 1: `.claude/agents/product-manager.md` - 機能価値定義、優先順位決定
  - Phase 2: `.claude/agents/req-analyst.md` - 要件整理、ユースケース、受け入れ基準
  - Phase 3: `.claude/agents/spec-writer.md` - 詳細仕様書作成（TDD準拠）
  - Phase 4: `.claude/agents/domain-modeler.md` - ドメインモデル設計
  - Phase 5: `.claude/agents/ui-designer.md` - UIコンポーネント設計（必要時）
  - Phase 6: `.claude/agents/logic-dev.md` - ビジネスロジック実装（Executor、Repository）
  - Phase 7: `.claude/agents/unit-tester.md` - ユニットテスト作成（TDD: Red-Green-Refactor）
  - Phase 8: `.claude/agents/code-quality.md` - コード品質レビュー
  - Phase 9: `.claude/agents/sec-auditor.md` - セキュリティ監査

  📚 利用可能スキル（エージェントが参照）:
  **要件・設計（Phase 1-4）:**
  - `.claude/skills/user-story-mapping/SKILL.md` - ユーザーストーリー作成、優先順位付け
  - `.claude/skills/acceptance-criteria-writing/SKILL.md` - Given-When-Then形式、受け入れ基準
  - `.claude/skills/use-case-modeling/SKILL.md` - ユースケース図、アクター識別
  - `.claude/skills/bounded-context/SKILL.md` - コンテキスト境界定義、DDD
  - `.claude/skills/ubiquitous-language/SKILL.md` - ドメイン用語統一
  - `.claude/skills/clean-architecture-principles/SKILL.md` - 依存関係ルール、レイヤー分離
  - `.claude/skills/component-composition-patterns/SKILL.md` - Slot/Compound パターン
  - `.claude/skills/accessibility-wcag/SKILL.md` - WCAG 2.1準拠、ARIA

  **実装・テスト（Phase 5-7）:**
  - `.claude/skills/repository-pattern/SKILL.md` - Repository実装、データアクセス抽象化
  - `.claude/skills/transaction-management/SKILL.md` - トランザクション管理、ACID特性
  - `.claude/skills/zod-validation/SKILL.md` - Zodスキーマ定義、型推論
  - `.claude/skills/tdd-principles/SKILL.md` - Red-Green-Refactor、テストファースト
  - `.claude/skills/test-doubles/SKILL.md` - Mock/Stub/Spy パターン
  - `.claude/skills/boundary-value-analysis/SKILL.md` - 境界値テスト、エッジケース

  **品質・セキュリティ（Phase 8-9）:**
  - `.claude/skills/clean-code-practices/SKILL.md` - Clean Code原則、リファクタリング
  - `.claude/skills/solid-principles/SKILL.md` - SOLID原則評価
  - `.claude/skills/code-smell-detection/SKILL.md` - コードスメル検出
  - `.claude/skills/owasp-top-10/SKILL.md` - OWASP脆弱性対策
  - `.claude/skills/input-validation-patterns/SKILL.md` - 入力検証パターン
  - `.claude/skills/authentication-patterns/SKILL.md` - 認証・認可パターン

  ⚙️ このコマンドの設定:
  - argument-hint: "[feature-name]"（必須）
  - allowed-tools: 9エージェント起動と全開発プロセス用
    • Task: 9エージェント起動用
    • Read: 既存コード・ドキュメント確認用
    • Write: ドキュメント・コード生成用
    • Edit: コード編集用
    • Bash: テスト実行、Git操作用
    • Grep, Glob: コード検索用
  - model: opus（複雑な9エージェント調整が必要）

  📋 成果物（ハイブリッド構造準拠）:
  - `docs/00-requirements/features/[feature-name].md`（要件定義）
  - `docs/20-specifications/features/[feature-name].md`（詳細仕様、TDD準拠）
  - `src/shared/core/entities/[entity].ts`（エンティティ、必要時）
  - `src/features/[feature-name]/`（機能プラグイン）:
    - `schema.ts`（Zod入出力スキーマ）
    - `executor.ts`（ビジネスロジック、IWorkflowExecutor実装）
    - `__tests__/executor.test.ts`（ユニットテスト、TDD）
  - `src/shared/infrastructure/repositories/[repository].ts`（Repository、必要時）
  - `src/app/components/[component].tsx`（UIコンポーネント、必要時）
  - 品質レポート（`.claude/docs/quality/[feature-name]-review.md`）
  - セキュリティレポート（`.claude/docs/security/[feature-name]-audit.md`）

  🎯 品質基準（master_system_design.md準拠）:
  - TDD: テスト → 実装の順序厳守（Red-Green-Refactor）
  - Clean Architecture: 依存方向遵守（app → features → infrastructure → core）
  - ハイブリッド構造: shared/（共通）とfeatures/（機能プラグイン）の責務分離
  - テストカバレッジ: 60%以上（重要ロジック80%以上）
  - 型安全性: TypeScript strict モード、any型禁止
  - セキュリティ: OWASP Top 10準拠、入力バリデーション必須

  トリガーキーワード: full feature, complete development, 機能開発, TDD, end-to-end, 完全開発サイクル
argument-hint: "[feature-name]"
allowed-tools:
  - Task
  - Read
  - Write
  - Edit
  - Bash
  - Grep
  - Glob
model: opus
---

# 機能完全開発サイクル

このコマンドは、機能の要件定義から実装・テスト・レビューまでの全サイクルを自動化します。

## 📋 実行フロー

### Phase 1: 機能価値定義（product-manager）

**使用エージェント**: `.claude/agents/product-manager.md`

**エージェントへの依頼内容**:

```markdown
機能「${feature-name}」の価値定義とバックログ優先順位を決定してください。

**要件**:

1. ビジネス価値の明確化（Why: なぜこの機能が必要か）
2. ユーザーストーリー作成（As a - I want - So that形式）
3. 優先順位決定（ROI、RICE Scoring等）
4. 成功指標の定義（KPI、メトリクス）

**スキル参照**:

- `.claude/skills/user-story-mapping/SKILL.md`
- `.claude/skills/prioritization-frameworks/SKILL.md`
- `.claude/skills/product-vision/SKILL.md`

**成果物**:

- `docs/00-requirements/features/${feature-name}.md`（ビジネス価値、ユーザーストーリー、優先順位、成功指標）
```

### Phase 2: 要件定義（req-analyst）

**使用エージェント**: `.claude/agents/req-analyst.md`

**エージェントへの依頼内容**:

```markdown
機能「${feature-name}」の要件を整理し、ユースケースと受け入れ基準を定義してください。

**入力**: Phase 1の成果物（`docs/00-requirements/features/${feature-name}.md`）

**要件**:

1. 機能要件（Functional Requirements）の詳細化
2. 非機能要件（Non-Functional Requirements）の定義
3. ユースケース作成（正常系・異常系）
4. 受け入れ基準（Acceptance Criteria）の定義（Given-When-Then形式）

**プロジェクト制約**:

- TDD必須（仕様 → テスト → 実装の順序）
- ハイブリッド構造（shared/ と features/ の責務明確化）
- Clean Architecture（依存方向: app → features → infrastructure → core）

**スキル参照**:

- `.claude/skills/use-case-modeling/SKILL.md`
- `.claude/skills/acceptance-criteria-writing/SKILL.md`
- `.claude/skills/functional-non-functional-requirements/SKILL.md`

**成果物**:

- `docs/00-requirements/features/${feature-name}.md`（要件追加: ユースケース、受け入れ基準、TDDフロー）
```

### Phase 3: 詳細仕様作成（spec-writer）

**使用エージェント**: `.claude/agents/spec-writer.md`

**エージェントへの依頼内容**:

```markdown
機能「${feature-name}」の詳細仕様書を作成してください。

**入力**: Phase 2の成果物（要件定義）

**要件**:

1. データモデル設計（入出力スキーマ、Zod定義）
2. API設計（エンドポイント、HTTPメソッド、レスポンス形式）
3. ビジネスロジック仕様（Executorの処理フロー）
4. テストケース定義（TDD: 先にテストを書く準備）
5. エラーハンドリング仕様（7.1-7.3章準拠）

**プロジェクト構造準拠**（master_system_design.md 4章）:

- `src/features/${feature-name}/schema.ts`: 入出力スキーマ
- `src/features/${feature-name}/executor.ts`: IWorkflowExecutor実装
- `src/features/${feature-name}/__tests__/`: テストファイル

**スキル参照**:

- `.claude/skills/api-documentation-best-practices/SKILL.md`
- `.claude/skills/zod-validation/SKILL.md`

**成果物**:

- `docs/20-specifications/features/${feature-name}.md`（詳細仕様、データモデル、API、テストケース、TDD準拠）
```

### Phase 4: ドメインモデル設計（domain-modeler）

**使用エージェント**: `.claude/agents/domain-modeler.md`

**エージェントへの依頼内容**:

```markdown
機能「${feature-name}」のドメインモデルを設計してください。

**入力**: Phase 3の成果物（詳細仕様）

**要件**:

1. エンティティ設計（必要な場合のみ、`src/shared/core/entities/`）
2. バリューオブジェクト設計
3. 集約の境界決定
4. ドメインイベント定義（必要時）
5. ユビキタス言語の定義（用語集）

**Clean Architecture準拠**:

- エンティティは外部依存ゼロ（`src/shared/core/entities/`）
- インターフェース定義（`src/shared/core/interfaces/`）
- エラークラス（`src/shared/core/errors/`）

**スキル参照**:

- `.claude/skills/bounded-context/SKILL.md`
- `.claude/skills/ubiquitous-language/SKILL.md`
- `.claude/skills/clean-architecture-principles/SKILL.md`

**成果物**:

- `src/shared/core/entities/${entity}.ts`（必要時のみ）
- `src/shared/core/interfaces/${interface}.ts`（必要時のみ）
- ドメインモデル図（仕様書に追記）
```

### Phase 5: UI設計（ui-designer、必要時のみ）

**使用エージェント**: `.claude/agents/ui-designer.md`

**条件**: UIコンポーネントが必要な機能の場合のみ実行

**エージェントへの依頼内容**:

```markdown
機能「${feature-name}」のUIコンポーネントを設計してください。

**入力**: Phase 3の詳細仕様

**要件**:

1. コンポーネント構成設計（Composition Pattern、Slot Pattern）
2. デザイントークン活用（Tailwind CSS）
3. アクセシビリティ（WCAG 2.1準拠、ARIA）
4. レスポンシブデザイン
5. エラー状態・ローディング状態の設計

**プロジェクト構造**:

- `src/app/components/${feature-name}/`（Presentation Layer）

**スキル参照**:

- `.claude/skills/component-composition-patterns/SKILL.md`
- `.claude/skills/accessibility-wcag/SKILL.md`
- `.claude/skills/tailwind-css-patterns/SKILL.md`

**成果物**:

- `src/app/components/${feature-name}/*.tsx`（UIコンポーネント）
- Storybookストーリー（オプション）
```

### Phase 6: ビジネスロジック実装（logic-dev）

**使用エージェント**: `.claude/agents/logic-dev.md`

**エージェントへの依頼内容**:

```markdown
機能「${feature-name}」のビジネスロジックを実装してください。

**入力**: Phase 3の詳細仕様、Phase 4のドメインモデル

**要件**:

1. スキーマ定義（`schema.ts`）:
   - Zod入力スキーマ
   - Zod出力スキーマ
   - TypeScript型エクスポート

2. Executor実装（`executor.ts`）:
   - IWorkflowExecutor インターフェース実装
   - type プロパティ設定
   - execute メソッド実装
   - エラーハンドリング（7.1-7.3章準拠）
   - リトライ可否判定（canRetry メソッド）

3. Repository実装（必要時）:
   - IRepository インターフェース実装
   - Drizzle ORM使用
   - トランザクション管理

4. Registry登録:
   - `src/features/registry.ts` に追加

**プロジェクト構造準拠**:

- `src/features/${feature-name}/schema.ts`
- `src/features/${feature-name}/executor.ts`
- `src/shared/infrastructure/repositories/${repository}.ts`（必要時）

**スキル参照**:

- `.claude/skills/repository-pattern/SKILL.md`
- `.claude/skills/transaction-management/SKILL.md`
- `.claude/skills/zod-validation/SKILL.md`

**成果物**:

- `src/features/${feature-name}/schema.ts`
- `src/features/${feature-name}/executor.ts`
- `src/shared/infrastructure/repositories/`（必要時）
- `src/features/registry.ts`（更新）
```

### Phase 7: テスト作成（unit-tester、TDD）

**使用エージェント**: `.claude/agents/unit-tester.md`

**エージェントへの依頼内容**:

```markdown
機能「${feature-name}」のユニットテストを作成してください。

**TDD必須**: テストは Phase 6の実装前に作成すべきでしたが、実装後の場合も完全なテストを作成

**要件**:

1. テストファイル作成:
   - `src/features/${feature-name}/__tests__/executor.test.ts`
   - `src/features/${feature-name}/__tests__/schema.test.ts`

2. テストケース（Phase 3の仕様書から）:
   - 正常系（Happy Path）
   - 異常系（Error Cases、バリデーションエラー）
   - エッジケース（境界値、nullish値）

3. モック設計（外部依存）:
   - AI API: vi.mock()
   - Repository: vi.mock()
   - 時刻: vi.setSystemTime()

4. カバレッジ目標:
   - Executor: 80%以上
   - スキーマバリデーション: 100%

**スキル参照**:

- `.claude/skills/tdd-principles/SKILL.md`
- `.claude/skills/test-doubles/SKILL.md`
- `.claude/skills/boundary-value-analysis/SKILL.md`

**成果物**:

- `src/features/${feature-name}/__tests__/executor.test.ts`
- `src/features/${feature-name}/__tests__/schema.test.ts`
- カバレッジレポート（80%以上達成）
```

### Phase 8: コード品質レビュー（code-quality）

**使用エージェント**: `.claude/agents/code-quality.md`

**エージェントへの依頼内容**:

```markdown
機能「${feature-name}」のコード品質をレビューしてください。

**レビュー対象**: `src/features/${feature-name}/`

**要件**:

1. SOLID原則チェック:
   - 単一責任原則（SRP）
   - 開放閉鎖原則（OCP）
   - リスコフ置換原則（LSP）
   - インターフェース分離原則（ISP）
   - 依存性逆転原則（DIP）

2. Clean Code原則:
   - 意味のある命名
   - 関数の単一責任
   - コメント最小化（自己説明的コード）
   - エラーハンドリングの適切性

3. コードスメル検出:
   - 長い関数（>50行）
   - 複雑な条件分岐（cyclomatic complexity > 10）
   - 重複コード

4. 静的解析:
   - TypeScript型チェック（`pnpm typecheck`）
   - ESLint（`pnpm lint`）
   - Prettier（`pnpm format --check`）

**スキル参照**:

- `.claude/skills/solid-principles/SKILL.md`
- `.claude/skills/clean-code-practices/SKILL.md`
- `.claude/skills/code-smell-detection/SKILL.md`

**成果物**:

- `.claude/docs/quality/${feature-name}-review.md`（品質レポート、改善提案）
```

### Phase 9: セキュリティ監査（sec-auditor）

**使用エージェント**: `.claude/agents/sec-auditor.md`

**エージェントへの依頼内容**:

```markdown
機能「${feature-name}」のセキュリティ監査を実施してください。

**監査対象**: `src/features/${feature-name}/`, `src/app/api/`（該当する場合）

**要件**:

1. OWASP Top 10チェック:
   - A01: Broken Access Control
   - A02: Cryptographic Failures
   - A03: Injection（SQL, XSS, Command）
   - A04: Insecure Design
   - その他

2. 入力バリデーション:
   - Zodスキーマの網羅性
   - サニタイゼーション処理
   - 境界値チェック

3. 認証・認可（該当する場合）:
   - トークン検証
   - 権限チェック
   - セッション管理

4. 機密情報管理:
   - 環境変数化（ハードコード禁止）
   - ログ出力のマスキング

**スキル参照**:

- `.claude/skills/owasp-top-10/SKILL.md`
- `.claude/skills/input-validation-patterns/SKILL.md`
- `.claude/skills/authentication-patterns/SKILL.md`

**成果物**:

- `.claude/docs/security/${feature-name}-audit.md`（セキュリティレポート、脆弱性リスト、修正提案）
```

### Phase 10: 統合完了報告

**実行内容**:

1. 全Phaseの成果物確認
2. 品質基準達成確認
3. Next Steps提示

**完了報告**:

```markdown
## 機能開発完了: ${feature-name}

### 成果物

✅ 要件定義: docs/00-requirements/features/${feature-name}.md
✅ 詳細仕様: docs/20-specifications/features/${feature-name}.md
✅ エンティティ: src/shared/core/entities/（必要時）
✅ 機能実装: src/features/${feature-name}/

- schema.ts（Zod入出力スキーマ）
- executor.ts（IWorkflowExecutor実装）
- **tests**/（ユニットテスト、カバレッジ80%+）
  ✅ Repository: src/shared/infrastructure/repositories/（必要時）
  ✅ UIコンポーネント: src/app/components/（必要時）
  ✅ 品質レポート: .claude/docs/quality/${feature-name}-review.md
✅ セキュリティレポート: .claude/docs/security/${feature-name}-audit.md

### 品質指標

- テストカバレッジ: XX%（目標: 60%以上、重要ロジック80%以上）
- 型安全性: ✅ strict モード、any型なし
- SOLID原則: ✅ 全原則遵守
- セキュリティ: ✅ OWASP Top 10準拠

### Next Steps

1. 統合テスト作成（API エンドポイント、E2E）
2. ドキュメント最終化（README、API仕様書）
3. PRレビュー依頼
4. デプロイ準備（staging環境）
```

## 使用例

### 基本的な使用

```bash
/ai:full-feature-development youtube-summarize
```

対話的に以下を実行:

1. ビジネス価値の確認
2. 要件整理（ユースケース、受け入れ基準）
3. 詳細仕様作成（データモデル、API、テストケース）
4. ドメインモデル設計
5. UIコンポーネント設計（必要時）
6. ビジネスロジック実装（Executor、Repository、Registry登録）
7. ユニットテスト作成（TDD、カバレッジ80%以上）
8. コード品質レビュー（SOLID、Clean Code）
9. セキュリティ監査（OWASP Top 10）
10. 完了報告

## 設計原則（master_system_design.md準拠）

### TDD（Test-Driven Development）

```
Red → Green → Refactor

1. Red: テストを先に書く（失敗を確認）
2. Green: 最小限の実装でテストをパスさせる
3. Refactor: コードをリファクタリング（テストは維持）
```

### ハイブリッド構造

```
src/
├── shared/（共通インフラ）
│   ├── core/（ドメイン共通、外部依存ゼロ）
│   │   ├── entities/
│   │   ├── interfaces/
│   │   └── errors/
│   └── infrastructure/（外部サービス接続）
│       ├── database/
│       ├── ai/
│       └── discord/
└── features/（機能プラグイン、垂直スライス）
    └── ${feature-name}/
        ├── schema.ts
        ├── executor.ts
        └── __tests__/
```

### 機能追加の具体例（YouTube要約）

**Phase 1-3**: 要件 → 仕様作成
**Phase 4**: エンティティ不要（外部API依存のため）
**Phase 5**: UI不要（Discord経由のため）
**Phase 6**: 実装

```typescript
// src/features/youtube-summarize/schema.ts
export const inputSchema = z.object({
  url: z.string().url(),
  language: z.enum(["ja", "en"]).default("ja"),
});

// src/features/youtube-summarize/executor.ts
export class YouTubeSummarizeExecutor implements IWorkflowExecutor {
  type = "YOUTUBE_SUMMARIZE";
  async execute(input, context) {
    // AI処理
  }
}

// src/features/registry.ts に追加
["YOUTUBE_SUMMARIZE", new YouTubeSummarizeExecutor()];
```

**Phase 7**: テスト作成（`__tests__/executor.test.ts`、カバレッジ80%以上）
**Phase 8-9**: 品質・セキュリティレビュー

## トラブルシューティング

### エージェント起動エラー

**原因**: エージェントファイルが存在しない

**解決策**:

```bash
ls .claude/agents/ | grep -E "(product-manager|req-analyst|spec-writer|domain-modeler|ui-designer|logic-dev|unit-tester|code-quality|sec-auditor)"
```

### テストカバレッジ不足

**原因**: テストケースが不十分

**解決策**:

- Phase 7を再実行
- 異常系・エッジケースを追加
- モックを適切に設計

### Clean Architecture違反

**原因**: 依存方向が逆転

**解決策**:

- ESLint（eslint-plugin-boundaries）で検出
- 依存関係を修正（app → features → infrastructure → core）

## 参照

### エージェント

- product-manager: `.claude/agents/product-manager.md`
- req-analyst: `.claude/agents/req-analyst.md`
- spec-writer: `.claude/agents/spec-writer.md`
- domain-modeler: `.claude/agents/domain-modeler.md`
- ui-designer: `.claude/agents/ui-designer.md`
- logic-dev: `.claude/agents/logic-dev.md`
- unit-tester: `.claude/agents/unit-tester.md`
- code-quality: `.claude/agents/code-quality.md`
- sec-auditor: `.claude/agents/sec-auditor.md`

### プロジェクト設計

- master_system_design.md: `docs/00-requirements/master_system_design.md`
