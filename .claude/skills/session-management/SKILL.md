---
name: session-management
description: |
  セッション管理とトークンライフサイクル戦略の実装パターン。

  📚 リソース参照:
  このスキルには以下のリソースが含まれています。
  必要に応じて該当するリソースを参照してください:

  - `.claude/skills/session-management/resources/cookie-attributes-guide.md`: Cookie Attributes Guideリソース
  - `.claude/skills/session-management/resources/session-strategy-comparison.md`: Session Strategy Comparisonリソース

  - `.claude/skills/session-management/templates/database-session-template.ts`: Database Sessionテンプレート
  - `.claude/skills/session-management/templates/jwt-session-template.ts`: Jwt Sessionテンプレート

  - `.claude/skills/session-management/scripts/validate-session-config.mjs`: Validate Session Configスクリプト

version: 1.0.0
---

# Session Management

## スキル概要

このスキルは、セッション管理とトークンライフサイクルの実装戦略を提供します。

**コアドメイン**:

- セッション戦略の選択（JWT vs. Database）
- トークンライフサイクル管理
- セッションセキュリティ対策
- Cookie 属性の適切な設定

**専門家の思想**:

- **OWASP**: セッション管理のセキュリティベストプラクティス
- **核心概念**: セキュアで効率的、ユーザビリティを損なわないセッション管理

## セッション戦略の比較

### 1. JWT-based Session（ステートレス）

**メリット/デメリット**:

- ✅ スケーラビリティ、分散システム、パフォーマンス
- ❌ 即座無効化困難、動的権限変更に弱い

**適用**: マイクロサービス、高トラフィック、サーバーレス

### 2. Database-based Session（ステートフル）

**メリット/デメリット**:

- ✅ 即座無効化、動的権限変更、セキュリティ
- ❌ データベース負荷、スケーラビリティ課題

**適用**: 高セキュリティ、即座ログアウト必須、詳細追跡

### 3. Hybrid Session

**戦略**: JWT（基本情報）+ Database（詳細/検証）
**適用**: 両方のメリットが必要な場合

## トークンライフサイクル管理

### 有効期限戦略

| アプリタイプ          | アクセストークン | リフレッシュトークン |
| --------------------- | ---------------- | -------------------- |
| B2B（高セキュリティ） | 15 分            | 7 日                 |
| B2C（一般）           | 1 時間           | 30 日                |
| 内部ツール            | 8 時間           | 90 日                |

### トークン更新メカニズム

**自動更新**: 有効期限 5 分前に自動リフレッシュ
**ローテーション**: リフレッシュトークン使用時に新トークン発行

詳細な実装パターンは以下を参照:

```bash
cat .claude/skills/session-management/templates/jwt-session-template.ts
```

## セッションセキュリティ対策

### 1. Session Fixation（セッション固定）対策

**対策**: ログイン成功時にセッション ID 再生成

### 2. Session Hijacking（セッションハイジャック）対策

**対策**:

- Cookie 属性（HttpOnly、Secure、SameSite）
- セッションタイムアウト（アイドル 30 分、絶対 8 時間）
- デバイス/IP 変更検出

### 3. Concurrent Session Control（同時セッション制御）

**戦略**: Single/Multiple/Selective Invalidation

詳細な実装パターンは以下を参照:

```bash
cat .claude/skills/session-management/templates/database-session-template.ts
cat .claude/skills/session-management/resources/session-strategy-comparison.md
```

## Cookie 属性の詳細設定

### 必須属性

**HttpOnly**: JavaScript アクセス禁止（XSS 対策）
**Secure**: HTTPS 通信のみ（中間者攻撃対策）
**SameSite**: Strict/Lax/None（CSRF 対策）

### 推奨設定

```typescript
{
  httpOnly: true,
  secure: true, // 本番環境
  sameSite: 'lax', // 一般的アプリ
  maxAge: 3600, // 秒単位
  path: '/', // 必要最小限のパス
}
```

詳細な Cookie 属性ガイドは以下を参照:

```bash
cat .claude/skills/session-management/resources/cookie-attributes-guide.md
```

## トークン無効化

### ログアウト時の無効化

**処理フロー**:

1. クライアント: サーバーに無効化リクエスト
2. サーバー: セッション無効化（Database 戦略）
3. サーバー: Cookie クリア（Max-Age=0）
4. クライアント: ローカルストレージクリア、リダイレクト

### セキュリティインシデント時の一括無効化

**処理**: すべてのセッション + リフレッシュトークン無効化 + ユーザー通知

詳細な実装パターンは以下を参照:

```bash
cat .claude/skills/session-management/templates/database-session-template.ts
```

## リソース参照

### セッション戦略比較

```bash
cat .claude/skills/session-management/resources/session-strategy-comparison.md
```

### Cookie 属性ガイド

```bash
cat .claude/skills/session-management/resources/cookie-attributes-guide.md
```

### トークン更新パターン

```bash
cat .claude/skills/session-management/resources/token-refresh-patterns.md
```

### セキュリティ対策詳細

```bash
cat .claude/skills/session-management/resources/session-security-measures.md
```

## スクリプト実行

### セッション設定検証

```bash
node .claude/skills/session-management/scripts/validate-session-config.mjs <config-file>
```

## テンプレート参照

### JWT セッション実装

```bash
cat .claude/skills/session-management/templates/jwt-session-template.ts
```

### Database セッション実装

```bash
cat .claude/skills/session-management/templates/database-session-template.ts
```

## 実装ワークフロー

### Phase 1: 戦略選択

1. 非機能要件分析（スケーラビリティ、セキュリティ、コスト）
2. JWT vs. Database vs. Hybrid の評価
3. トレードオフ分析と選択
4. 選択理由の文書化

### Phase 2: 有効期限設計

1. リスク評価（データ機密性、ユーザータイプ）
2. アクセストークン有効期限設定
3. リフレッシュトークン有効期限設定
4. アイドルタイムアウト/絶対タイムアウト設計

### Phase 3: セキュリティ強化

1. Cookie 属性設定（HttpOnly、Secure、SameSite）
2. セッション固定対策実装
3. セッションハイジャック対策実装
4. 同時セッション制御実装（必要に応じて）

### Phase 4: 無効化メカニズム

1. ログアウト処理実装（クライアント・サーバー両側）
2. トークンローテーション実装
3. 一括無効化機能実装
4. セキュリティインシデント対応手順定義

### Phase 5: モニタリング

1. セッションメトリクス収集（アクティブセッション数、平均時間）
2. 異常検出パターン実装（IP 変更、UA 変更、並行ログイン）
3. セキュリティイベントログ実装
4. アラート設定

## 判断基準

### 戦略選択の判断

- [ ] 非機能要件（スケーラビリティ、セキュリティ、コスト）は明確か？
- [ ] 即座無効化の必要性は評価されているか？
- [ ] データベース負荷は許容範囲か？
- [ ] トレードオフは文書化されているか？

### セキュリティの判断

- [ ] Cookie 属性（HttpOnly、Secure、SameSite）は適切か？
- [ ] セッション固定対策は実装されているか？
- [ ] セッションハイジャック対策は多層化されているか？
- [ ] 異常検出パターンは実装されているか？

### 運用の判断

- [ ] セッションメトリクスは収集されているか？
- [ ] セキュリティイベントはログに記録されているか？
- [ ] インシデント対応手順は定義されているか？
- [ ] 一括無効化機能は実装されているか？

## ベストプラクティス

### セッション戦略選択

1. **デフォルト**: JWT-based（スケーラビリティ重視）
2. **高セキュリティ**: Database-based（即座無効化必須）
3. **ハイブリッド**: 両方の利点を活用（複雑性増）

### トークン有効期限

1. **アクセストークン**: 短命（15 分-1 時間）
2. **リフレッシュトークン**: 長命（30 日-90 日）
3. **バランス**: セキュリティとユーザビリティ

### Cookie 設定

1. **HttpOnly**: 常に true（XSS 対策）
2. **Secure**: 本番環境で true（中間者攻撃対策）
3. **SameSite**: Lax/Strict（CSRF 対策）

### セキュリティ

1. **多層防御**: Cookie + Session + Token
2. **定期検証**: 異常パターン検出
3. **即座対応**: インシデント時の一括無効化

## 関連スキル連携

### oauth2-flows との連携

- OAuth 2.0 で取得したトークンをセッションに統合
- リフレッシュフローとトークン更新の連携

### nextauth-patterns との連携

- NextAuth.js のセッション戦略設定
- セッションコールバックでのカスタマイズ

### security-headers との連携

- Cookie 属性と CSRF 対策の多層化
- セキュリティヘッダーとの組み合わせ

## バージョン履歴

| バージョン | 日付       | 変更内容                                              |
| ---------- | ---------- | ----------------------------------------------------- |
| 1.0.0      | 2025-11-26 | 初版リリース - セッション管理とトークンライフサイクル |
