---
name: .claude/skills/dependency-security-scanning/SKILL.md
description: |
    依存関係の脆弱性スキャンとSCA（Software Composition Analysis）のベストプラクティスを提供します。
    pnpm audit、Snyk、OSSスキャンツールを使用した既知脆弱性の検出、
    CVE評価、CVSS スコアリング、修正可能性の評価、推移的依存関係の分析を行います。
    📚 このスキルの使用タイミング:
    - 依存関係の脆弱性スキャン時
    - package.json、requirements.txt等のレビュー時
    - CI/CDパイプラインへのセキュリティスキャン統合時
    - 既知のCVE（Common Vulnerabilities and Exposures）チェック時
    - ライブラリアップグレード計画時
    - Supply Chain攻撃リスク評価時
    🔍 評価対象:
    - 直接依存関係の脆弱性
    - 推移的依存関係（間接依存）の脆弱性
    - CVSS スコアとリスク評価
    - 修正バージョンの利用可能性
    - ライセンスコンプライアンス
    Use this skill when running dependency audits, reviewing package updates,
    or integrating security scanning into CI/CD pipelines.

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/dependency-security-scanning/resources/cve-evaluation-guide.md`: CVE識別子の理解とCVSSスコアリングの評価ガイド
  - `.claude/skills/dependency-security-scanning/templates/dependency-audit-report-template.md`: 依存関係監査レポートの標準テンプレート
  - `.claude/skills/dependency-security-scanning/scripts/run-dependency-scan.mjs`: 依存関係の脆弱性スキャンを実行する自動化スクリプト

  Use proactively when implementing .claude/skills/dependency-security-scanning/SKILL.md patterns or solving related problems.
version: 1.0.0
---

# Dependency Security Scanning

## スキル概要

依存関係のセキュリティスキャンと Software Composition Analysis（SCA）の専門知識を提供します。

**専門分野**:

- pnpm audit、Snyk 等のツール活用
- CVE（Common Vulnerabilities and Exposures）評価
- CVSS（Common Vulnerability Scoring System）スコアリング
- 推移的依存関係の脆弱性分析
- Supply Chain 攻撃リスク評価

---

## 1. スキャンツールの選択

### Node.js/JavaScript

**ツール比較**:
| ツール | カバレッジ | 速度 | CI/CD 統合 | 無料プラン | 推奨度 |
|-------|----------|------|----------|----------|-------|
| **pnpm audit** | 中 | 高速 | ✅ | ✅ | ✅ 基本 |
| **pnpm audit** | 中 | 高速 | ✅ | ✅ | ✅ 基本 |
| **yarn audit** | 中 | 高速 | ✅ | ✅ | ✅ 基本 |
| **Snyk** | 高 | 中速 | ✅ | ✅ | ✅ 推奨 |
| **Dependabot** | 中 | - | ✅ | ✅ | ✅ GitHub |
| **pnpm-check** | 中 | 高速 | ⚠️ | ✅ | ⚠️ 補助 |

**実行例**:

```bash
# pnpm audit
pnpm audit --json > audit-report.json

# 重要度フィルタ
pnpm audit --audit-level=moderate

# 自動修正
pnpm audit fix

# Snyk
snyk test --json > snyk-report.json
snyk monitor  # 継続的監視
```

---

### Python

**ツール**:

- `pip-audit`: pip 専用監査ツール
- `safety`: PyPI 脆弱性 DB
- `Snyk`: 多言語対応

**実行例**:

```bash
# pip-audit
pip-audit --format json > audit-report.json

# safety
safety check --json
```

---

## 2. スキャン結果の解析

### pnpm audit 出力構造

**JSON 形式**:

```json
{
  "vulnerabilities": {
    "package-name": {
      "name": "package-name",
      "severity": "high",
      "isDirect": false,
      "via": ["another-package"],
      "effects": [],
      "range": "1.0.0 - 1.5.0",
      "nodes": ["node_modules/package-name"],
      "fixAvailable": {
        "name": "parent-package",
        "version": "2.0.0",
        "isSemVerMajor": true
      }
    }
  },
  "metadata": {
    "vulnerabilities": {
      "info": 0,
      "low": 2,
      "moderate": 5,
      "high": 3,
      "critical": 1
    }
  }
}
```

**重要フィールド**:

- `severity`: 重要度（info、low、moderate、high、critical）
- `isDirect`: 直接依存 vs 推移的依存
- `fixAvailable`: 修正バージョンの有無
- `via`: 依存関係経路

---

### CVSS スコアリング

**スコア範囲**:

```
0.0: None
0.1-3.9: Low
4.0-6.9: Medium
7.0-8.9: High
9.0-10.0: Critical
```

**ベクトル文字列例**:

```
CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H
```

**要素**:

- AV（Attack Vector）: ネットワーク、隣接、ローカル
- AC（Attack Complexity）: 低、高
- PR（Privileges Required）: なし、低、高
- UI（User Interaction）: なし、要
- C/I/A（Confidentiality/Integrity/Availability Impact）

**判断基準**:

- [ ] CVSS 7.0 以上（High/Critical）は優先修正対象か？
- [ ] Attack Vector: Network の脆弱性は重視されているか？

---

## 3. 修正可能性の評価

### 直接依存関係

**修正パターン**:

```bash
# 直接依存パッケージのアップグレード
pnpm install package-name@latest

# または特定バージョン
pnpm install package-name@2.0.0
```

**判断**:

- fixAvailable: true → 自動修正可能
- isSemVerMajor: true → 破壊的変更の可能性

---

### 推移的依存関係

**問題**: 間接的な依存関係の脆弱性

**修正アプローチ**:

1. **親パッケージのアップグレード**: 親が新しいバージョンで修正済み依存を使用
2. **pnpm override**: package.json でバージョンを強制
   ```json
   {
     "overrides": {
       "vulnerable-package": "^2.0.0"
     }
   }
   ```
3. **代替パッケージ**: 親パッケージを別のものに置き換え

**判断基準**:

- [ ] 推移的依存関係も含めてスキャンしているか？
- [ ] 親パッケージのアップグレード計画があるか？
- [ ] override の使用は文書化されているか？

---

## 4. 脆弱性の優先順位付け

### リスクマトリクス

**計算式**:

```
リスクスコア = CVSS スコア × 悪用可能性 × 影響範囲

悪用可能性:
  - 既知のエクスプロイト存在: 1.5
  - PoC（概念実証）存在: 1.2
  - 理論的のみ: 1.0

影響範囲:
  - 本番環境で使用: 1.5
  - 開発環境のみ: 1.0
  - devDependencies: 0.8
```

**優先順位**:

```
1. Critical + 既知のエクスプロイト + 本番環境 → 即座に修正
2. High + PoC存在 + 本番環境 → 早期修正（1週間以内）
3. Medium + 本番環境 → 計画的修正（1ヶ月以内）
4. Low または devDependencies → 監視、次回更新時に対応
```

**判断基準**:

- [ ] Critical/High 脆弱性は即座に修正計画があるか？
- [ ] devDependencies の脆弱性は適切に評価されているか？

---

## 5. CI/CD 統合

### GitHub Actions 例

```yaml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: pnpm ci

      - name: Run pnpm audit
        run: pnpm audit --audit-level=moderate
        continue-on-error: true

      - name: Snyk Security Scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

**判断基準**:

- [ ] プルリクエストでスキャンが自動実行されるか？
- [ ] Critical/High 脆弱性でビルドが失敗するか？
- [ ] スキャン結果がレビュー可能な形式で保存されるか？

---

## 6. Supply Chain 攻撃対策

### リスク

**攻撃パターン**:

- 正規パッケージの侵害（maintainer 乗っ取り）
- Typosquatting（名前類似パッケージ）
- 依存関係混入（正規パッケージに悪意ある依存追加）

**検出**:

```bash
# パッケージの信頼性チェック
pnpm view package-name

# 最終更新、maintainer、ダウンロード数を確認
```

**対策**:

- [ ] lock file（package-lock.json）使用で依存固定
- [ ] pnpm ci 使用（pnpm install ではなく）
- [ ] 信頼できるレジストリのみ使用
- [ ] パッケージ署名検証（pnpm v7+）

---

## リソース・スクリプト・テンプレート

### リソース

- `resources/cve-evaluation-guide.md`: CVE 評価ガイド
- `resources/dependency-update-strategy.md`: 依存更新戦略
- `resources/supply-chain-security.md`: サプライチェーンセキュリティ

### スクリプト

- `scripts/run-dependency-scan.mjs`: 依存関係スキャン実行
- `scripts/analyze-audit-results.mjs`: 監査結果分析
- `scripts/check-outdated-packages.mjs`: 古いパッケージチェック

### テンプレート

- `templates/dependency-audit-report-template.md`: 監査レポートテンプレート
- `templates/vulnerability-triage-template.md`: 脆弱性トリアージテンプレート

---

## 関連スキル

- `.claude/skills/owasp-top-10/SKILL.md`: A06（脆弱で古いコンポーネント）
- `.claude/skills/security-reporting/SKILL.md`: レポート生成
- `.claude/skills/ci-cd-pipelines/SKILL.md`: CI/CD 統合

---

## 変更履歴

### v1.0.0 (2025-11-26)

- 初版リリース
- .claude/agents/sec-auditor.md エージェントから依存関係スキャン知識を抽出
- pnpm audit、Snyk、CVE 評価、Supply Chain 攻撃対策を定義
