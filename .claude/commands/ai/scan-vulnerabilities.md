---
description: "プロジェクトの依存関係とコードベースをスキャンし、既知の脆弱性を検出してレポートを生成します"
allowed-tools:
  - Read
  - Bash
  - Write
model: sonnet
---

# /ai:scan-vulnerabilities - 脆弱性スキャン

**目的**: プロジェクトの依存関係とコードベースを包括的にスキャンし、既知の脆弱性（CVE）を検出してレポートを生成します。

**トリガーキーワード**: vulnerability scan, 脆弱性スキャン, dependency audit, npm audit, pnpm audit, セキュリティチェック, CVE検出, 依存関係監査

---

## 📋 引数仕様

引数なし（プロジェクト全体をスキャン）

**使用例**:
```bash
/ai:scan-vulnerabilities
```

---

## 🎯 実行フロー（3フェーズ構造）

### Phase 1: 準備・環境確認

**エージェント起動**:
```
@sec-auditor を起動し、以下を依頼:
- プロジェクト構造の分析
- パッケージマネージャーの特定（npm/pnpm/yarn）
- package.json/package-lock.json の存在確認
- スキャン範囲の決定
```

**スキル参照** (Phase 1):
- `.claude/skills/project-architecture-integration/SKILL.md`: プロジェクト構造理解
- `.claude/skills/vulnerability-scanning/SKILL.md`: スキャン戦略

**期待成果物**:
- 使用パッケージマネージャーの特定
- スキャン対象の明確化
- スキャン実行計画

---

### Phase 2: 脆弱性スキャン実行

**エージェント起動**:
```
@sec-auditor と @dep-mgr を起動し、以下を依頼:

【依存関係スキャン】
- npm audit または pnpm audit の実行
- 脆弱性の重大度分類（Critical/High/Medium/Low）
- 影響範囲の特定
- スキル参照: `.claude/skills/dependency-auditing/SKILL.md`

【コードスキャン】
- 脆弱なパターンの検出（ハードコードされたシークレット等）
- セキュリティアンチパターンの特定
- スキル参照: `.claude/skills/vulnerability-scanning/SKILL.md`
```

**実行コマンド例**:
```bash
# npm の場合
npm audit --json > audit-results.json
npm audit

# pnpm の場合
pnpm audit --json > audit-results.json
pnpm audit

# yarn の場合
yarn audit --json > audit-results.json
yarn audit
```

**期待成果物**:
- 依存関係監査結果（JSON + 人間可読形式）
- 検出された脆弱性リスト
- CVE番号と重大度情報
- 修正可能な脆弱性の特定

---

### Phase 3: レポート生成・修正提案

**エージェント起動**:
```
@sec-auditor を起動し、以下を依頼:
- スキャン結果の集約・分析
- 重大度別の脆弱性分類
- 修正可能な脆弱性の自動修正提案
- 修正不可能な脆弱性の回避策提示
- 包括的レポート生成
```

**スキル参照** (Phase 3):
- `.claude/skills/vulnerability-scanning/SKILL.md`: 脆弱性評価
- `.claude/skills/dependency-auditing/SKILL.md`: 依存関係管理
- `.claude/skills/best-practices-curation/SKILL.md`: セキュリティベストプラクティス

**成果物**:
- `docs/security/vulnerability-scan-[YYYYMMDD].md`: 脆弱性スキャンレポート
  - Executive Summary（重大度別サマリー）
  - 検出された脆弱性の詳細リスト
    - CVE番号
    - 重大度（Critical/High/Medium/Low）
    - 影響を受けるパッケージ
    - 推奨される修正バージョン
  - 自動修正可能な脆弱性
  - 手動対応が必要な脆弱性
  - 回避策・緩和策
  - 次のアクションプラン

- `scripts/fix-vulnerabilities.sh` (オプション):
  - 自動修正スクリプト（npm audit fix 等）

---

## 🔍 検証項目

実行後、以下を確認してください:

- [ ] 脆弱性スキャンが正常に完了している
- [ ] レポートが `docs/security/` に生成されている
- [ ] 重大度（Critical/High/Medium/Low）が明記されている
- [ ] 各脆弱性にCVE番号が記載されている
- [ ] 修正可能/不可能が明確に分類されている
- [ ] 次のアクションプランが提示されている

---

## 📊 出力例

```markdown
# 脆弱性スキャンレポート - 2025-11-29

## Executive Summary

- **Critical**: 2件
- **High**: 5件
- **Medium**: 12件
- **Low**: 8件

## 自動修正可能（15件）

### Critical: `lodash` - Prototype Pollution (CVE-2023-XXXXX)
- **影響バージョン**: 4.17.15
- **修正バージョン**: 4.17.21
- **修正方法**: `npm update lodash`

## 手動対応が必要（12件）

### High: `express` - DoS Vulnerability (CVE-2024-XXXXX)
- **影響バージョン**: 4.17.1
- **修正バージョン**: なし（パッチ未リリース）
- **回避策**: レート制限の実装、WAFの設定

## 次のアクションプラン

1. Critical脆弱性の即時修正（npm audit fix）
2. High脆弱性の回避策実装
3. 1週間以内にパッチ適用の確認
```

---

## 📚 関連コマンド

- `/ai:security-audit` - 包括的セキュリティ監査
- `/ai:setup-rate-limiting` - DoS対策のレート制限実装
- `/ai:manage-secrets` - ハードコードされたシークレットの管理

---

## 🎓 参考資料

**エージェント仕様**:
- `.claude/agents/sec-auditor.md`: セキュリティ監査エージェント
- `.claude/agents/dep-mgr.md`: 依存関係管理エージェント

**スキル仕様**:
- `.claude/skills/vulnerability-scanning/SKILL.md`: 脆弱性スキャン手法
- `.claude/skills/dependency-auditing/SKILL.md`: 依存関係監査
- `.claude/skills/best-practices-curation/SKILL.md`: セキュリティベストプラクティス

---

## 🔄 推奨実行頻度

- **日次**: CI/CDパイプラインでの自動実行
- **週次**: 手動での詳細レビュー
- **リリース前**: 必須実行
- **新規依存関係追加時**: 即時実行
