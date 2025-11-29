---
description: "包括的なセキュリティ監査を実施し、脆弱性、権限設定、認証・認可の問題を検出してレポートを生成します"
argument-hint: "[scope: all|auth|api|database] - 監査スコープ（デフォルト: all）"
allowed-tools:
  - Read
  - Grep
  - Bash
  - Write
model: opus
---

# /ai:security-audit - 包括的セキュリティ監査

**目的**: プロジェクト全体またはスコープ指定領域のセキュリティ監査を実施し、OWASP Top 10、権限設定、認証・認可の脆弱性を検出してレポートを生成します。

**トリガーキーワード**: security audit, セキュリティ監査, 脆弱性検査, セキュリティレビュー, OWASP, 権限チェック, 認証監査, セキュリティスキャン

---

## 📋 引数仕様

- **$1 (scope)**: 監査スコープ
  - `all` (デフォルト): 全領域を監査
  - `auth`: 認証・認可システムのみ
  - `api`: APIエンドポイントとセキュリティ
  - `database`: データベースアクセスとクエリ

**使用例**:
```bash
/ai:security-audit
/ai:security-audit auth
/ai:security-audit api
/ai:security-audit database
```

---

## 🎯 実行フロー（3フェーズ構造）

### Phase 1: 準備・分析

**エージェント起動**:
```
@sec-auditor を起動し、以下を依頼:
- スコープ: $1 (デフォルト: all)
- プロジェクト構造の分析
- セキュリティ監査対象の特定
- OWASP Top 10 チェックリスト準備
```

**スキル参照** (Phase 1):
- `.claude/skills/owasp-top-10/SKILL.md`: OWASP Top 10 脆弱性パターン
- `.claude/skills/vulnerability-scanning/SKILL.md`: 脆弱性スキャン手法
- `.claude/skills/project-architecture-integration/SKILL.md`: プロジェクト構造理解

**期待成果物**:
- 監査対象ファイル一覧
- チェックリスト
- リスク評価基準

---

### Phase 2: 監査実行

**エージェント起動**:
```
スコープに応じて適切なエージェントを起動:

【auth スコープ】
@auth-specialist を起動し、以下を依頼:
- 認証フロー検証
- セッション管理チェック
- パスワードポリシー確認
- OAuth/JWT実装レビュー
- スキル参照: `.claude/skills/oauth2-flows/SKILL.md`
- スキル参照: `.claude/skills/nextauth-patterns/SKILL.md`

【api スコープ】
@sec-auditor を起動し、以下を依頼:
- APIエンドポイントの権限チェック
- 入力検証の確認
- CSRF/XSS対策レビュー
- レート制限実装確認
- スキル参照: `.claude/skills/rate-limiting-strategies/SKILL.md`

【database スコープ】
@sec-auditor を起動し、以下を依頼:
- SQLインジェクション対策確認
- データベース権限レビュー
- クエリパラメータ化チェック
- スキル参照: `.claude/skills/vulnerability-scanning/SKILL.md`

【all スコープ】
上記すべてのエージェントを順次起動
```

**エージェント依頼内容**:
- 該当スコープのセキュリティ脆弱性検出
- npm audit / pnpm audit 実行
- 依存関係の脆弱性チェック
- コードレビュー実施

**期待成果物**:
- 検出された脆弱性リスト（重大度付き）
- 依存関係監査結果
- コードレビュー所見

---

### Phase 3: レポート生成・検証

**エージェント起動**:
```
@sec-auditor を起動し、以下を依頼:
- 監査結果の集約
- セキュリティレポート生成
- 修正推奨事項の提示
- 優先度付け
```

**スキル参照** (Phase 3):
- `.claude/skills/best-practices-curation/SKILL.md`: セキュリティベストプラクティス
- `.claude/skills/tool-permission-management/SKILL.md`: 権限設定最適化

**成果物**:
- `docs/security/audit-report-[YYYYMMDD].md`: 包括的セキュリティ監査レポート
  - Executive Summary
  - 検出された脆弱性（重大度別）
  - 修正推奨事項（優先度順）
  - 依存関係監査結果
  - 次回監査の推奨事項

---

## 🔍 検証項目

実行後、以下を確認してください:

- [ ] 監査レポートが `docs/security/` に生成されている
- [ ] 重大度（Critical/High/Medium/Low）が明記されている
- [ ] 各脆弱性に修正推奨事項が記載されている
- [ ] npm audit / pnpm audit の結果が含まれている
- [ ] 次のアクションプランが明確である

---

## 📚 関連コマンド

- `/ai:scan-vulnerabilities` - 脆弱性スキャンのみ実施
- `/ai:setup-auth` - 認証システムの実装
- `/ai:manage-secrets` - 機密情報管理
- `/ai:setup-rate-limiting` - レート制限実装

---

## 🎓 参考資料

**エージェント仕様**:
- `.claude/agents/sec-auditor.md`: セキュリティ監査エージェント
- `.claude/agents/auth-specialist.md`: 認証専門エージェント

**スキル仕様**:
- `.claude/skills/owasp-top-10/SKILL.md`: OWASP Top 10 脆弱性パターン
- `.claude/skills/vulnerability-scanning/SKILL.md`: 脆弱性スキャン手法
- `.claude/skills/oauth2-flows/SKILL.md`: OAuth 2.0 フロー実装
- `.claude/skills/nextauth-patterns/SKILL.md`: NextAuth.js パターン
- `.claude/skills/rate-limiting-strategies/SKILL.md`: レート制限戦略
