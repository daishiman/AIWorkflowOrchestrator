---
name: .claude/skills/security-reporting/SKILL.md
description: |
  セキュリティ診断レポート生成のベストプラクティスを提供します。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/security-reporting/resources/risk-scoring-methodology.md`: Risk Scoring Methodologyリソース

  - `.claude/skills/security-reporting/templates/security-report-template.md`: Security Reportテンプレート

  - `.claude/skills/security-reporting/scripts/generate-security-report.mjs`: Generate Security Reportスクリプト

version: 1.0.0
---

# Security Reporting

## スキル概要

セキュリティ診断レポートの作成と構造化の専門知識を提供します。

**専門分野**:

- レポート構造設計
- リスク評価とスコアリング
- 優先順位付けとトリアージ
- 修正推奨事項の作成
- ステークホルダーコミュニケーション

---

## 1. レポート構造

### 標準テンプレート

**セクション構成**:

1. **エグゼクティブサマリー** (1 ページ)
2. **スコープと方法論** (0.5 ページ)
3. **主要発見事項** (1-2 ページ)
4. **脆弱性詳細リスト** (5-10 ページ)
5. **リスク評価** (1 ページ)
6. **修正推奨事項** (2-3 ページ)
7. **アクションプラン** (1 ページ)
8. **付録** (参考資料、用語集)

---

## 2. エグゼクティブサマリー

### 記載内容

**概要**:

- 監査日時と対象システム
- 総合セキュリティ評価（A-F 等級）
- 検出された脆弱性数（Critical/High/Medium/Low 別）
- 最も重要な 3-5 個の発見事項
- 推奨される即座のアクション

**例**:

```markdown
# エグゼクティブサマリー

**監査日**: 2025-11-26
**対象**: AI Workflow Orchestrator Web Application
**総合評価**: B（Good、改善の余地あり）

## 主要発見事項

- **Critical: 2 件** - SQL インジェクション、ハードコードされた API キー
- **High: 5 件** - Rate Limiting 未実装、XSS 脆弱性
- **Medium: 8 件** - セキュリティヘッダー不足、CORS 設定
- **Low: 3 件** - 情報漏洩（エラーメッセージ）

## 即座のアクション

1. ❗ SQL インジェクション脆弱性を修正（src/api/users.js:45）
2. ❗ ハードコードされた API キーを環境変数に移行
3. ⚠️ 認証エンドポイントに Rate Limiting を実装
```

---

## 3. 脆弱性詳細テンプレート

### 標準フォーマット

**各脆弱性の記載項目**:

```markdown
### [脆弱性 ID]: [脆弱性タイプ]

**重要度**: Critical
**CVSS スコア**: 9.8
**カテゴリ**: OWASP A03 - Injection

**影響を受けるファイル**:

- `src/api/users.js` (Line 45)
- `src/controllers/auth.js` (Line 128)

**脆弱性の説明**:
SQL クエリに対してユーザー入力が文字列連結されており、攻撃者が任意の SQL 文を実行可能です。

**悪用シナリオ**:
攻撃者が userId パラメータに`1' OR '1'='1`を注入することで、すべてのユーザー情報を取得可能。

**影響範囲**:

- データベース全体への不正アクセス
- ユーザーデータの漏洩
- データ改ざん・削除の可能性

**修正推奨事項**:
パラメータ化クエリを使用して SQL インジェクションを防止:
\`\`\`javascript
// 修正前
const query = `SELECT * FROM users WHERE id = ${userId}`;

// 修正後
const query = 'SELECT \* FROM users WHERE id = $1';
db.query(query, [userId]);
\`\`\`

**参考資料**:

- OWASP SQL Injection: https://owasp.org/www-community/attacks/SQL_Injection
- CWE-89: SQL Injection
```

---

## 4. リスク評価とスコアリング

### リスクマトリクス

**計算式**:

```
リスクスコア = CVSS × 悪用容易性 × 影響範囲

悪用容易性（Exploitability）:
  3.0 = 既知のエクスプロイトツール存在
  2.0 = PoC（概念実証）公開済み
  1.5 = 技術的に実現可能
  1.0 = 理論的のみ

影響範囲（Scope）:
  2.0 = 全ユーザー、全データ
  1.5 = 重要データ・機能
  1.0 = 限定的
  0.5 = 最小限
```

**優先順位決定**:

```
リスクスコア >= 18.0 → P0（即座に修正）
リスクスコア 12.0-17.9 → P1（1週間以内）
リスクスコア 6.0-11.9 → P2（1ヶ月以内）
リスクスコア < 6.0 → P3（次回リリース）
```

---

## 5. 修正推奨事項の作成

### 具体的な実装ガイド

**含めるべき要素**:

1. **原則**: セキュリティ原則の説明
2. **Before/After**: 修正前後のコード比較
3. **実装ステップ**: 段階的な修正手順
4. **テスト方法**: 修正が有効か検証する方法
5. **参考資料**: OWASP、CWE、RFC リンク

**例**:

```markdown
## 修正推奨: SQL インジェクション対策

### 原則

すべての SQL クエリはパラメータ化し、ユーザー入力を直接クエリ文字列に含めない。

### 修正手順

1. 文字列連結クエリを特定
2. パラメータ化クエリに書き換え（$1、$2...）
3. 入力検証を追加（型チェック、範囲チェック）
4. ORM の使用を検討（Drizzle、Prisma）

### 実装例

\`\`\`typescript
// Before
const query = `SELECT * FROM users WHERE id = ${userId}`;

// After
const query = 'SELECT \* FROM users WHERE id = $1';
const result = await db.query(query, [userId]);
\`\`\`

### 検証方法

- SQL インジェクションペイロード（`1' OR '1'='1`）でテスト
- エスケープが正しく行われていることを確認

### 参考資料

- OWASP SQL Injection Prevention
- CWE-89: Improper Neutralization of Special Elements
```

---

## 6. アクションプラン

### 優先順位付きタスクリスト

**フォーマット**:

```markdown
## アクションプラン

### Phase 1: 緊急対応（即座～ 1 週間）

| タスク                                       | 担当         | 期限       | ステータス |
| -------------------------------------------- | ------------ | ---------- | ---------- |
| SQL インジェクション修正（src/api/users.js） | Backend Team | 2025-11-28 | 未着手     |
| ハードコード API キーを環境変数に移行        | DevOps       | 2025-11-27 | 未着手     |
| 認証エンドポイントに Rate Limiting 実装      | Backend Team | 2025-11-29 | 未着手     |

### Phase 2: 早期対応（1-4 週間）

| タスク                                | 担当          | 期限       | ステータス |
| ------------------------------------- | ------------- | ---------- | ---------- |
| XSS 脆弱性修正（全 5 箇所）           | Frontend Team | 2025-12-10 | 未着手     |
| CORS 設定の見直し                     | Backend Team  | 2025-12-05 | 未着手     |
| セキュリティヘッダー追加（Helmet.js） | Backend Team  | 2025-12-08 | 未着手     |

### Phase 3: 計画的対応（1-3 ヶ月）

| タスク                              | 担当    | 期限       | ステータス |
| ----------------------------------- | ------- | ---------- | ---------- |
| 依存関係の脆弱性修正（Medium 8 件） | DevOps  | 2025-12-31 | 未着手     |
| セキュリティテストケース作成        | QA Team | 2026-01-15 | 未着手     |
| CI/CD セキュリティスキャン統合      | DevOps  | 2026-01-31 | 未着手     |
```

---

## 7. ステークホルダー別レポート

### 経営層向け

**焦点**:

- ビジネスリスクと影響
- コンプライアンス状況
- 修正コストと工数
- 投資対効果（ROI）

**言語**: 非技術的、ビジネス用語

---

### 開発チーム向け

**焦点**:

- 技術的詳細とコード例
- 具体的な修正方法
- 実装ステップ
- テスト方法

**言語**: 技術的、コード中心

---

### 監査・コンプライアンス向け

**焦点**:

- 規格準拠（OWASP、CWE、NIST）
- 証跡と監査ログ
- 修正検証プロセス
- 継続的監視計画

**言語**: 標準準拠、プロセス重視

---

## 8. レポート生成チェックリスト

### 完全性

- [ ] エグゼクティブサマリーが含まれているか？
- [ ] すべての検出脆弱性が文書化されているか？
- [ ] リスクスコアが各脆弱性に付与されているか？
- [ ] 修正推奨事項が具体的か？
- [ ] アクションプランが優先順位付けされているか？

### 明確性

- [ ] 非技術者が理解できるサマリーか？
- [ ] 技術者が実装できる詳細度か？
- [ ] コード例が含まれているか？
- [ ] 参考資料へのリンクがあるか？

### 実行可能性

- [ ] 修正タスクが具体的か？
- [ ] 担当と期限が割り当てられているか？
- [ ] 修正の優先順位が明確か？
- [ ] フォローアップ計画があるか？

---

## リソース・スクリプト・テンプレート

### リソース

- `resources/report-structure-guide.md`: レポート構造ガイド
- `resources/risk-scoring-methodology.md`: リスクスコアリング手法
- `resources/stakeholder-communication.md`: ステークホルダーコミュニケーション

### スクリプト

- `scripts/generate-security-report.mjs`: レポート自動生成
- `scripts/calculate-risk-scores.mjs`: リスクスコア計算
- `scripts/create-action-plan.mjs`: アクションプラン生成

### テンプレート

- `templates/security-report-template.md`: セキュリティレポートテンプレート
- `templates/vulnerability-detail-template.md`: 脆弱性詳細テンプレート
- `templates/action-plan-template.md`: アクションプランテンプレート

---

## 関連スキル

- `.claude/skills/owasp-top-10/SKILL.md`: 脆弱性分類
- `.claude/skills/vulnerability-scanning/SKILL.md`: スキャン結果
- `.claude/skills/dependency-security-scanning/SKILL.md`: 依存関係監査

---

## 変更履歴

### v1.0.0 (2025-11-26)

- 初版リリース
- .claude/agents/sec-auditor.md エージェントからレポート生成知識を抽出
- レポート構造、リスク評価、修正推奨、アクションプラン作成を定義
