# セキュリティ診断レポート

**監査日**: {{AUDIT_DATE}}
**プロジェクト**: {{PROJECT_NAME}}
**監査者**: {{AUDITOR_NAME}}
**レポートバージョン**: 1.0

---

## エグゼクティブサマリー

### 総合セキュリティ評価

**評価**: {{OVERALL_GRADE}} (A: 優秀、B: 良好、C: 改善必要、D: 重大な問題、F: 不合格)

### 脆弱性サマリー

| 重要度 | 件数 | ステータス |
|-------|------|----------|
| Critical | {{CRITICAL_COUNT}} | {{CRITICAL_STATUS}} |
| High | {{HIGH_COUNT}} | {{HIGH_STATUS}} |
| Medium | {{MEDIUM_COUNT}} | {{MEDIUM_STATUS}} |
| Low | {{LOW_COUNT}} | {{LOW_STATUS}} |

### 主要発見事項（Top 5）

1. {{FINDING_1}}
2. {{FINDING_2}}
3. {{FINDING_3}}
4. {{FINDING_4}}
5. {{FINDING_5}}

### 即座のアクション

1. ❗ {{IMMEDIATE_ACTION_1}}
2. ❗ {{IMMEDIATE_ACTION_2}}
3. ⚠️  {{IMMEDIATE_ACTION_3}}

---

## スコープと方法論

### 監査対象

- **ソースコード**: {{SOURCE_CODE_PATH}}
- **依存関係**: {{DEPENDENCY_FILES}}
- **設定ファイル**: {{CONFIG_FILES}}
- **ファイル数**: {{TOTAL_FILES}}
- **コード行数**: {{TOTAL_LINES}}

### 使用ツール

- pnpm audit / Snyk（依存関係スキャン）
- ESLint security plugin（静的解析）
- 手動コードレビュー（OWASP Top 10基準）
- {{ADDITIONAL_TOOLS}}

### 評価基準

- OWASP Top 10 (2021)
- CWE Top 25
- {{PROJECT_SPECIFIC_STANDARDS}}

---

## 主要発見事項

### 発見事項1: {{FINDING_TITLE}}

**重要度**: Critical
**CVSSスコア**: {{CVSS_SCORE}}
**カテゴリ**: OWASP {{OWASP_CATEGORY}}

**影響を受けるファイル**:
- `{{FILE_PATH_1}}` (Line {{LINE_NUMBER_1}})
- `{{FILE_PATH_2}}` (Line {{LINE_NUMBER_2}})

**脆弱性の説明**:
{{VULNERABILITY_DESCRIPTION}}

**悪用シナリオ**:
{{EXPLOITATION_SCENARIO}}

**影響範囲**:
{{IMPACT_SCOPE}}

**リスクスコア**: {{RISK_SCORE}} / 10

**修正推奨事項**:

**原則**: {{SECURITY_PRINCIPLE}}

**Before**:
```{{LANGUAGE}}
{{CODE_BEFORE}}
```

**After**:
```{{LANGUAGE}}
{{CODE_AFTER}}
```

**実装ステップ**:
1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}

**検証方法**:
{{VERIFICATION_METHOD}}

**参考資料**:
- OWASP: {{OWASP_LINK}}
- CWE: {{CWE_LINK}}

---

## 依存関係脆弱性

### Critical/High脆弱性

| パッケージ | バージョン | CVE | CVSSスコア | 修正バージョン |
|----------|-----------|-----|-----------|-------------|
| {{PKG_1}} | {{VER_1}} | {{CVE_1}} | {{SCORE_1}} | {{FIX_1}} |
| {{PKG_2}} | {{VER_2}} | {{CVE_2}} | {{SCORE_2}} | {{FIX_2}} |

### 修正コマンド

```bash
# 直接依存関係
pnpm install {{PACKAGE_NAME}}@{{FIXED_VERSION}}

# 推移的依存関係（package.jsonに追加）
{
  "overrides": {
    "{{VULNERABLE_PACKAGE}}": "^{{FIXED_VERSION}}"
  }
}
```

---

## セキュリティ設定の問題

### HTTPセキュリティヘッダー

**検出された問題**:
- {{HEADER_ISSUE_1}}
- {{HEADER_ISSUE_2}}

**推奨設定**:
```javascript
app.use(helmet({
  contentSecurityPolicy: { /* ... */ },
  hsts: { maxAge: 31536000, includeSubDomains: true }
}));
```

### CORS設定

**検出された問題**:
{{CORS_ISSUES}}

**推奨設定**:
```javascript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
```

---

## Rate Limiting推奨

### 実装が必要なエンドポイント

| エンドポイント | 現状 | 推奨設定 | 優先度 |
|-------------|------|---------|-------|
| POST /api/login | なし | 5 req/15分 | High |
| POST /api/register | なし | 3 req/1時間 | High |
| GET /api/* | なし | 100 req/1時間 | Medium |

**実装例**:
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

app.post('/api/login', loginLimiter, loginHandler);
```

---

## アクションプラン

### Phase 1: 緊急対応（即座～1週間）

| タスク | 担当 | 期限 | ステータス |
|-------|------|------|----------|
| SQLインジェクション修正 | Backend | {{DEADLINE_1}} | 未着手 |
| ハードコードAPIキー削除 | DevOps | {{DEADLINE_2}} | 未着手 |
| Rate Limiting実装 | Backend | {{DEADLINE_3}} | 未着手 |

### Phase 2: 早期対応（1-4週間）

{{PHASE_2_TASKS}}

### Phase 3: 計画的対応（1-3ヶ月）

{{PHASE_3_TASKS}}

---

## 継続的セキュリティ提案

### CI/CD統合

```yaml
# .github/workflows/security.yml
- run: pnpm audit --audit-level=moderate
- run: npx eslint --ext .js,.ts src/
- uses: snyk/actions/node@master
```

### 定期監査

- 週次: pnpm audit
- 月次: 包括的スキャン
- 四半期: 外部ペネトレーションテスト（推奨）

### セキュリティ教育

- 開発者向けセキュアコーディング研修
- OWASP Top 10勉強会
- インシデントレスポンス訓練

---

## 付録

### 用語集

- **CVSS**: Common Vulnerability Scoring System
- **CVE**: Common Vulnerabilities and Exposures
- **SAST**: Static Application Security Testing
- **XSS**: Cross-Site Scripting
- **CSRF**: Cross-Site Request Forgery

### 参考資料

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- CWE Top 25: https://cwe.mitre.org/top25/
- NIST Cybersecurity Framework

---

**レポート作成日**: {{REPORT_DATE}}
**次回監査予定**: {{NEXT_AUDIT_DATE}}
