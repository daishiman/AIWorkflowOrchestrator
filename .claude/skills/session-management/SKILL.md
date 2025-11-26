---
name: session-management
description: |
  セッション管理とトークンライフサイクル戦略の実装パターン。
  Cookie-based、JWT-based、Database-basedの各戦略と、
  セッション固定・ハイジャック対策、トークン更新メカニズムを提供。

  使用タイミング:
  - セッション戦略（JWT/Database）の選択と実装時
  - トークンライフサイクル（有効期限、更新、無効化）の設計時
  - セッションセキュリティ対策（固定、ハイジャック防止）の実装時
  - Cookie属性の適切な設定時
  - リフレッシュトークンローテーションの実装時

  関連スキル:
  - `.claude/skills/oauth2-flows/SKILL.md` - OAuth 2.0トークン取得
  - `.claude/skills/nextauth-patterns/SKILL.md` - NextAuth.jsセッション設定
  - `.claude/skills/security-headers/SKILL.md` - Cookie セキュリティ属性

  Use when implementing session management, designing token lifecycle,
  or securing session handling in web applications.
version: 1.0.0
---

# Session Management

## スキル概要

このスキルは、セッション管理とトークンライフサイクルの実装戦略を提供します。

**コアドメイン**:
- セッション戦略の選択（JWT vs. Database）
- トークンライフサイクル管理
- セッションセキュリティ対策
- Cookie属性の適切な設定

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

| アプリタイプ | アクセストークン | リフレッシュトークン |
|------------|----------------|------------------|
| B2B（高セキュリティ） | 15分 | 7日 |
| B2C（一般） | 1時間 | 30日 |
| 内部ツール | 8時間 | 90日 |

### トークン更新メカニズム

**自動更新**: 有効期限5分前に自動リフレッシュ
**ローテーション**: リフレッシュトークン使用時に新トークン発行

詳細な実装パターンは以下を参照:
```bash
cat .claude/skills/session-management/templates/jwt-session-template.ts
```

## セッションセキュリティ対策

### 1. Session Fixation（セッション固定）対策

**対策**: ログイン成功時にセッションID再生成

### 2. Session Hijacking（セッションハイジャック）対策

**対策**:
- Cookie属性（HttpOnly、Secure、SameSite）
- セッションタイムアウト（アイドル30分、絶対8時間）
- デバイス/IP変更検出

### 3. Concurrent Session Control（同時セッション制御）

**戦略**: Single/Multiple/Selective Invalidation

詳細な実装パターンは以下を参照:
```bash
cat .claude/skills/session-management/templates/database-session-template.ts
cat .claude/skills/session-management/resources/session-strategy-comparison.md
```

## Cookie属性の詳細設定

### 必須属性

**HttpOnly**: JavaScriptアクセス禁止（XSS対策）
**Secure**: HTTPS通信のみ（中間者攻撃対策）
**SameSite**: Strict/Lax/None（CSRF対策）

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

詳細なCookie属性ガイドは以下を参照:
```bash
cat .claude/skills/session-management/resources/cookie-attributes-guide.md
```

## トークン無効化

### ログアウト時の無効化

**処理フロー**:
1. クライアント: サーバーに無効化リクエスト
2. サーバー: セッション無効化（Database戦略）
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

### Cookie属性ガイド
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
2. JWT vs. Database vs. Hybridの評価
3. トレードオフ分析と選択
4. 選択理由の文書化

### Phase 2: 有効期限設計
1. リスク評価（データ機密性、ユーザータイプ）
2. アクセストークン有効期限設定
3. リフレッシュトークン有効期限設定
4. アイドルタイムアウト/絶対タイムアウト設計

### Phase 3: セキュリティ強化
1. Cookie属性設定（HttpOnly、Secure、SameSite）
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
2. 異常検出パターン実装（IP変更、UA変更、並行ログイン）
3. セキュリティイベントログ実装
4. アラート設定

## 判断基準

### 戦略選択の判断
- [ ] 非機能要件（スケーラビリティ、セキュリティ、コスト）は明確か？
- [ ] 即座無効化の必要性は評価されているか？
- [ ] データベース負荷は許容範囲か？
- [ ] トレードオフは文書化されているか？

### セキュリティの判断
- [ ] Cookie属性（HttpOnly、Secure、SameSite）は適切か？
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
1. **アクセストークン**: 短命（15分-1時間）
2. **リフレッシュトークン**: 長命（30日-90日）
3. **バランス**: セキュリティとユーザビリティ

### Cookie設定
1. **HttpOnly**: 常にtrue（XSS対策）
2. **Secure**: 本番環境でtrue（中間者攻撃対策）
3. **SameSite**: Lax/Strict（CSRF対策）

### セキュリティ
1. **多層防御**: Cookie + Session + Token
2. **定期検証**: 異常パターン検出
3. **即座対応**: インシデント時の一括無効化

## 関連スキル連携

### oauth2-flowsとの連携
- OAuth 2.0で取得したトークンをセッションに統合
- リフレッシュフローとトークン更新の連携

### nextauth-patternsとの連携
- NextAuth.jsのセッション戦略設定
- セッションコールバックでのカスタマイズ

### security-headersとの連携
- Cookie属性とCSRF対策の多層化
- セキュリティヘッダーとの組み合わせ

## バージョン履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0.0 | 2025-11-26 | 初版リリース - セッション管理とトークンライフサイクル |
