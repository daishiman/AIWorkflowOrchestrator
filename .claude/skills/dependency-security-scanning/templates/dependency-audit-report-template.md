# 依存関係セキュリティ監査レポート

**監査日**: {{AUDIT_DATE}}
**プロジェクト**: {{PROJECT_NAME}}
**監査者**: @sec-auditor

---

## エグゼクティブサマリー

**総合評価**: {{OVERALL_GRADE}}

**脆弱性サマリー**:
- Critical: {{CRITICAL_COUNT}}件
- High: {{HIGH_COUNT}}件
- Medium: {{MEDIUM_COUNT}}件
- Low: {{LOW_COUNT}}件

**即座のアクション**:
{{IMMEDIATE_ACTIONS}}

---

## スキャン詳細

### スキャン対象

- **パッケージマネージャー**: {{PACKAGE_MANAGER}}
- **依存関係総数**: {{TOTAL_DEPENDENCIES}}
  - 直接依存: {{DIRECT_DEPENDENCIES}}
  - 推移的依存: {{TRANSITIVE_DEPENDENCIES}}

### 使用ツール

- {{TOOL_1}} ({{TOOL_1_VERSION}})
- {{TOOL_2}} ({{TOOL_2_VERSION}})

---

## Critical脆弱性 ({{CRITICAL_COUNT}}件)

### CVE-YYYY-XXXXX: {{VULNERABILITY_NAME}}

**影響を受けるパッケージ**: `{{PACKAGE_NAME}}@{{VULNERABLE_VERSION}}`
**CVSSスコア**: {{CVSS_SCORE}}
**重要度**: Critical

**脆弱性の説明**:
{{VULNERABILITY_DESCRIPTION}}

**影響範囲**:
{{IMPACT_DESCRIPTION}}

**修正方法**:
```bash
# アップグレード
pnpm install {{PACKAGE_NAME}}@{{FIXED_VERSION}}

# または package.json で指定
"{{PACKAGE_NAME}}": "^{{FIXED_VERSION}}"
```

**依存関係経路**:
```
{{PROJECT_NAME}}
  └─ {{PARENT_PACKAGE_1}}
       └─ {{PARENT_PACKAGE_2}}
            └─ {{VULNERABLE_PACKAGE}}  ← 脆弱性
```

**参考資料**:
- CVE詳細: https://nvd.nist.gov/vuln/detail/CVE-YYYY-XXXXX
- GitHub Advisory: {{GITHUB_ADVISORY_URL}}

---

## High脆弱性 ({{HIGH_COUNT}}件)

{{HIGH_VULNERABILITIES_LIST}}

---

## Medium/Low脆弱性

{{MEDIUM_LOW_SUMMARY}}

---

## 推移的依存関係の問題

### 修正困難な脆弱性

以下の脆弱性は推移的依存関係で、直接アップグレードできません:

| パッケージ | 経由 | CVSS | 修正方法 |
|----------|------|------|---------|
| {{PKG1}} | {{PARENT1}} | {{SCORE1}} | 親パッケージアップグレード |
| {{PKG2}} | {{PARENT2}} | {{SCORE2}} | pnpm override使用 |

**推奨アクション**:
1. 親パッケージのアップグレード確認
2. pnpm overrideまたはresolutionsの使用
3. 代替パッケージへの移行検討

---

## 修正優先順位

### P0: 即座に修正（Critical、悪用容易）

| パッケージ | CVE | 修正バージョン | コマンド |
|----------|-----|-------------|---------|
| {{PKG}} | {{CVE}} | {{VERSION}} | `pnpm install {{PKG}}@{{VERSION}}` |

### P1: 1週間以内（High、本番環境）

{{P1_LIST}}

### P2: 1ヶ月以内（Medium）

{{P2_LIST}}

### P3: 次回リリース（Low、devDependencies）

{{P3_LIST}}

---

## Supply Chain セキュリティ

### パッケージ信頼性評価

| パッケージ | ダウンロード数/週 | メンテナンス | 最終更新 | 評価 |
|----------|---------------|-----------|---------|------|
| {{PKG1}} | {{DOWNLOADS1}} | {{MAINTENANCE1}} | {{UPDATED1}} | {{SCORE1}} |

### 推奨事項

- [ ] lock file（package-lock.json）を使用
- [ ] pnpm ci 使用（pnpm install ではなく）
- [ ] 信頼できるレジストリのみ使用
- [ ] パッケージ署名検証

---

## アクションプラン

### Week 1

- [ ] Critical脆弱性修正（{{CRITICAL_COUNT}}件）
- [ ] テスト実行と検証
- [ ] 再スキャンで修正確認

### Week 2-4

- [ ] High脆弱性修正（{{HIGH_COUNT}}件）
- [ ] 推移的依存関係の親パッケージアップグレード
- [ ] 回帰テスト

### Month 2-3

- [ ] Medium脆弱性修正
- [ ] 代替パッケージへの移行検討
- [ ] CI/CD統合

---

## 継続的セキュリティ

### 自動化推奨

```yaml
# .github/workflows/security-scan.yml
name: Security Scan
on: [push, pull_request, schedule]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm audit --audit-level=moderate
```

### 定期監査

- [ ] 週次: pnpm audit実行
- [ ] 月次: Snyk スキャン
- [ ] 四半期: 包括的セキュリティ監査

---

**次のステップ**: P0脆弱性の修正を開始してください。
