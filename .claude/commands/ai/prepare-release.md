---
description: |
  リリース準備の完全自動化を行うコマンド。

  テスト → 品質チェック → セキュリティ監査 → ドキュメント → ビルド の全工程を実行し、
  本番環境デプロイ可能な状態を保証します。

  🤖 起動エージェント（Phase別）:
  - Phase 1: `.claude/agents/unit-tester.md` - 全テスト実行、カバレッジ検証
  - Phase 2: `.claude/agents/code-quality.md` - SOLID原則、Clean Code、コードスメル検出
  - Phase 3: `.claude/agents/sec-auditor.md` - OWASP Top 10、脆弱性スキャン
  - Phase 4: `.claude/agents/spec-writer.md` - CHANGELOG、リリースノート、API仕様書更新
  - Phase 5: `.claude/agents/devops-eng.md` - ビルド検証、Railway設定確認

  📚 利用可能スキル（エージェントが参照）:
  **テスト（Phase 1）:**
  - `.claude/skills/tdd-principles/SKILL.md` - TDD手法、Red-Green-Refactor
  - `.claude/skills/test-doubles/SKILL.md` - Mock/Stub/Spy、テストダブル
  - `.claude/skills/boundary-value-analysis/SKILL.md` - 境界値テスト、エッジケース
  - `.claude/skills/flaky-test-prevention/SKILL.md` - 不安定テスト防止策

  **品質（Phase 2）:**
  - `.claude/skills/solid-principles/SKILL.md` - SOLID原則評価基準
  - `.claude/skills/clean-code-practices/SKILL.md` - Clean Code原則、リファクタリング
  - `.claude/skills/code-smell-detection/SKILL.md` - コードスメル検出パターン
  - `.claude/skills/refactoring-techniques/SKILL.md` - 安全なリファクタリング手法

  **セキュリティ（Phase 3）:**
  - `.claude/skills/owasp-top-10/SKILL.md` - OWASP脆弱性対策
  - `.claude/skills/dependency-security-scanning/SKILL.md` - 依存関係脆弱性スキャン
  - `.claude/skills/security-configuration-review/SKILL.md` - セキュリティ設定レビュー

  **ドキュメント（Phase 4）:**
  - `.claude/skills/semantic-versioning/SKILL.md` - MAJOR.MINOR.PATCH規則
  - `.claude/skills/version-control-for-docs/SKILL.md` - ドキュメント変更履歴管理
  - `.claude/skills/api-documentation-best-practices/SKILL.md` - API仕様書ベストプラクティス

  **デプロイ（Phase 5）:**
  - `.claude/skills/infrastructure-as-code/SKILL.md` - IaC、デプロイ自動化
  - `.claude/skills/deployment-strategies/SKILL.md` - Blue-Green、Canary デプロイ
  - `.claude/skills/ci-cd-pipelines/SKILL.md` - CI/CDパイプライン設計

  ⚙️ このコマンドの設定:
  - argument-hint: "[version]"（必須、semver形式: v1.2.3）
  - allowed-tools: 5エージェント起動と検証用
    • Task: 5エージェント起動用
    • Bash: テスト実行、ビルド、依存関係監査用
    • Read: コード・ドキュメント確認用
    • Write: CHANGELOG、リリースノート生成用
    • Edit: バージョン番号更新用
  - model: sonnet（標準的なリリース準備タスク）

  📋 成果物:
  - 全テスト合格（カバレッジ60%以上）
  - 品質レポート（`.claude/docs/quality/release-${version}-quality.md`）
  - セキュリティレポート（`.claude/docs/security/release-${version}-security.md`）
  - CHANGELOG.md（更新）
  - リリースノート（`docs/releases/${version}.md`）
  - ビルド成果物（`pnpm build` 成功）
  - package.json（バージョン更新）

  🎯 品質ゲート（すべて合格必須）:
  - ✅ 全テスト合格（unit, integration, e2e）
  - ✅ カバレッジ60%以上（重要ロジック80%以上）
  - ✅ 型チェック合格（strict モード、any型なし）
  - ✅ ESLint合格（エラーなし、警告最小化）
  - ✅ セキュリティ監査合格（critical/high脆弱性なし）
  - ✅ ビルド成功
  - ✅ ドキュメント最新化

  トリガーキーワード: release, リリース準備, deploy preparation, 本番デプロイ, quality gate
argument-hint: "[version]"
allowed-tools:
  - Task
  - Bash
  - Read
  - Write
  - Edit
model: sonnet
---

# リリース準備自動化

このコマンドは、本番環境デプロイ前のリリース準備を完全自動化します。

## 📋 実行フロー

### Phase 1: バージョン確認

**引数検証**:
```bash
# バージョン番号（必須、semver形式）
version: "$ARGUMENTS"（例: v1.2.3, v2.0.0-beta.1）

# semver形式検証
[v]MAJOR.MINOR.PATCH[-prerelease][+build]
```

### Phase 2: 全テスト実行（unit-tester）

**使用エージェント**: `.claude/agents/unit-tester.md`

**エージェントへの依頼内容**:
```markdown
リリース${version}の全テストを実行してください。

**要件**:
1. ユニットテスト実行（`pnpm test`）
2. 統合テスト実行（該当する場合）
3. E2Eテスト実行（クリティカルパスのみ）
4. カバレッジ検証（60%以上、重要ロジック80%以上）
5. Flaky Test検出（不安定なテストの除去）

**品質ゲート**:
- すべてのテスト合格（失敗0件）
- カバレッジ60%以上達成
- Flaky Testなし

**スキル参照**:
- `.claude/skills/tdd-principles/SKILL.md`
- `.claude/skills/flaky-test-prevention/SKILL.md`

**成果物**:
- テストレポート（合格/失敗、カバレッジ、実行時間）
```

### Phase 3: 品質チェック（code-quality）

**使用エージェント**: `.claude/agents/code-quality.md`

**エージェントへの依頼内容**:
```markdown
リリース${version}のコード品質をレビューしてください。

**要件**:
1. 型チェック（`pnpm typecheck`）
2. ESLint（`pnpm lint`、エラーなし、警告最小化）
3. Prettier（`pnpm format --check`、フォーマット統一）
4. SOLID原則チェック
5. コードスメル検出（長い関数、複雑な条件分岐、重複コード）

**品質ゲート**:
- 型エラーなし
- ESLintエラーなし
- SOLID原則違反なし
- Critical/High コードスメルなし

**スキル参照**:
- `.claude/skills/solid-principles/SKILL.md`
- `.claude/skills/clean-code-practices/SKILL.md`
- `.claude/skills/code-smell-detection/SKILL.md`

**成果物**:
- `.claude/docs/quality/release-${version}-quality.md`（品質レポート、改善提案）
```

### Phase 4: セキュリティ監査（sec-auditor）

**使用エージェント**: `.claude/agents/sec-auditor.md`

**エージェントへの依頼内容**:
```markdown
リリース${version}のセキュリティ監査を実施してください。

**要件**:
1. 依存関係脆弱性スキャン（`pnpm audit`）
2. OWASP Top 10チェック（A01-A10）
3. 環境変数チェック（ハードコード検出、.env.example最新化）
4. 認証・認可チェック（該当する場合）
5. 機密情報漏洩チェック（ログ、エラーメッセージ）

**品質ゲート**:
- Critical/High脆弱性なし
- OWASP Top 10違反なし
- 機密情報ハードコードなし

**スキル参照**:
- `.claude/skills/owasp-top-10/SKILL.md`
- `.claude/skills/dependency-security-scanning/SKILL.md`
- `.claude/skills/security-configuration-review/SKILL.md`

**成果物**:
- `.claude/docs/security/release-${version}-security.md`（セキュリティレポート、脆弱性リスト、修正提案）
```

### Phase 5: ドキュメント更新（spec-writer）

**使用エージェント**: `.claude/agents/spec-writer.md`

**エージェントへの依頼内容**:
```markdown
リリース${version}のドキュメントを更新してください。

**要件**:
1. CHANGELOG.md更新:
   - バージョン番号と日付
   - Added（新機能）
   - Changed（変更）
   - Fixed（バグ修正）
   - Deprecated（非推奨）
   - Removed（削除）
   - Security（セキュリティ修正）

2. リリースノート作成（`docs/releases/${version}.md`）:
   - ハイライト（主要な変更）
   - 破壊的変更（Breaking Changes）
   - 移行ガイド（必要時）
   - 既知の問題

3. API仕様書更新（該当する場合）
4. README.md更新（バージョンバッジ、新機能紹介）

**スキル参照**:
- `.claude/skills/semantic-versioning/SKILL.md`
- `.claude/skills/version-control-for-docs/SKILL.md`

**成果物**:
- `CHANGELOG.md`（更新）
- `docs/releases/${version}.md`（リリースノート）
- `README.md`（更新）
```

### Phase 6: ビルド検証（devops-eng）

**使用エージェント**: `.claude/agents/devops-eng.md`

**エージェントへの依頼内容**:
```markdown
リリース${version}のビルドを検証してください。

**要件**:
1. ビルド実行（`pnpm build`）
2. ビルド成果物確認（`.next/`）
3. Railway設定確認（`railway.json`）
4. 環境変数確認（`.env.example`とRailway Secretsの整合性）
5. package.json バージョン更新

**品質ゲート**:
- ビルド成功
- 環境変数整合性確保
- package.json バージョン正確

**スキル参照**:
- `.claude/skills/infrastructure-as-code/SKILL.md`
- `.claude/skills/ci-cd-pipelines/SKILL.md`

**成果物**:
- package.json（version: ${version}）
- ビルド成果物（`.next/`）
- ビルドレポート（サイズ、警告等）
```

### Phase 7: 最終検証と完了報告

**実行内容**:
1. 全品質ゲートの合格確認
2. 成果物の存在確認
3. Next Steps提示

## 使用例

```bash
/ai:prepare-release v1.2.3
```

自動実行:
1. 全テスト実行（unit, integration, e2e）
2. 品質チェック（typecheck, lint, format）
3. セキュリティ監査（pnpm audit, OWASP）
4. ドキュメント更新（CHANGELOG, リリースノート）
5. ビルド検証（pnpm build）
6. 完了報告

## 品質ゲート詳細

### レベル1: 必須（fail-fast）

すべて合格必須、1つでも失敗したら即座に中止:
- ✅ 全テスト合格
- ✅ 型チェック合格
- ✅ ビルド成功

### レベル2: 重要（warning）

警告を出すが続行可能:
- ⚠️ テストカバレッジ60%未満
- ⚠️ ESLint警告あり
- ⚠️ Medium脆弱性あり

### レベル3: 推奨（info）

情報提供のみ:
- ℹ️ バンドルサイズ増加
- ℹ️ 依存関係更新可能
- ℹ️ ドキュメント改善余地

## トラブルシューティング

### テスト失敗でリリース中止

**解決策**: Phase 2を単独実行して修正
```bash
/ai:run-all-tests
```

### セキュリティ監査失敗

**解決策**: 脆弱性修正
```bash
# 自動修正可能な場合
pnpm audit fix

# 手動修正必要な場合
/ai:security-audit
```

### ビルドエラー

**解決策**: 型エラー、インポートエラーを修正
```bash
pnpm typecheck
pnpm lint
pnpm build
```

## 参照

- unit-tester: `.claude/agents/unit-tester.md`
- code-quality: `.claude/agents/code-quality.md`
- sec-auditor: `.claude/agents/sec-auditor.md`
- spec-writer: `.claude/agents/spec-writer.md`
- devops-eng: `.claude/agents/devops-eng.md`
