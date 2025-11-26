---
name: environment-isolation
description: |
  環境分離とアクセス制御スキル。開発・ステージング・本番環境の
  厳格な分離、環境間Secret共有の防止、最小権限の徹底を提供します。

  使用タイミング:
  - 環境分離戦略を設計する時
  - dev/staging/prod環境のSecret管理を分離する時
  - 環境間のアクセス制御を設定する時
  - クロスアカウントアクセスを制限する時
  - 環境固有の設定を管理する時

  Use when designing environment isolation strategy, separating
  secrets across environments, or enforcing cross-environment access control.
version: 1.0.0
---

# Environment Isolation & Access Control

## 概要

開発、ステージング、本番環境の厳格な分離は、セキュリティとデータ整合性の基盤です。
このスキルは、環境間のSecret共有を防ぎ、各環境に適した管理方式と
アクセス制御を確立します。

## 環境分離の4レベル

### レベル1: 物理的分離
- 環境毎に異なるクラウドアカウント
- 環境毎に異なるVPC/ネットワーク
- **用途**: エンタープライズ、厳格なコンプライアンス

### レベル2: 論理的分離
- Kubernetesネームスペース分離
- Railwayプロジェクト/環境グループ分離
- **用途**: 中規模プロジェクト、クラウドネイティブ

### レベル3: データ分離
- 環境毎に異なるデータベースインスタンス
- 本番データの開発環境への流入防止
- **必須**: すべてのプロジェクト

### レベル4: アクセス分離
- 環境毎に異なるIAMロール/サービスアカウント
- 開発者は開発環境のみアクセス
- **必須**: すべてのプロジェクト

## 環境別Secret管理戦略

### Development（開発環境）

**Secret管理方式**:
- ローカル: `.env.development.local` （Gitignore）
- テンプレート: `.env.example` （Gitコミット可）

**アクセス制御**:
- すべての開発者がアクセス可能
- MFA不要、承認不要

**Rotation頻度**: 不定期（必要時のみ）

**データ**: 匿名化テストデータ、本番データ使用禁止

### Staging（ステージング環境）

**Secret管理方式**:
- Railway Secrets（環境グループ: staging）
- GitHub Secrets（CI/CD: staging環境）

**アクセス制御**:
- DevOps Engineer以上
- MFA推奨、承認不要

**Rotation頻度**: 90日毎

**データ**: 本番に類似したデータ構造（匿名化）

### Production（本番環境）

**Secret管理方式**:
- Railway Secrets（環境グループ: production）
- GitHub Secrets（CI/CD: production環境、承認制）

**アクセス制御**:
- DevOps + Security Admin のみ
- MFA必須、承認必須
- Just-In-Time アクセス（最大2時間）

**Rotation頻度**: 30日毎（Critical Secret）

**データ**: 実際の顧客データ、厳格なアクセス制御

## 環境間Secret共有の防止

### アンチパターン

```typescript
// ❌ 間違い: すべての環境で同じSecret
const SHARED_API_KEY = 'sk-proj-same-key-for-all';
```

### 正しいパターン

```typescript
// ✅ 正しい: 環境毎に異なるSecret
const config = {
  development: {
    apiKey: process.env.OPENAI_API_KEY_DEV,
  },
  production: {
    apiKey: process.env.OPENAI_API_KEY_PROD,
  },
};

const secrets = config[process.env.NODE_ENV || 'development'];
```

### 環境検証

```typescript
class EnvironmentValidator {
  validateSecretIsolation(): void {
    const env = process.env.NODE_ENV;

    // 本番環境で開発パターンをチェック
    if (env === 'production') {
      const devPatterns = ['dev', 'test', 'local', 'example'];
      for (const [key, value] of Object.entries(process.env)) {
        if (devPatterns.some(p => value?.toLowerCase().includes(p))) {
          throw new Error(`Production contains dev pattern in ${key}`);
        }
      }
    }
  }
}
```

**詳細**: `resources/environment-validation.md`

## クロスアカウントアクセス制御

### 原則: デフォルト拒否

すべての環境間アクセスはデフォルトで拒否し、必要な場合のみ明示的に許可。

### 承認フロー

```typescript
async function requestProductionAccess(
  userId: string,
  duration: number,
  justification: string
): Promise<AccessGrant> {
  const approval = await sendApprovalRequest({
    userId,
    targetEnvironment: 'production',
    duration,
    justification,
  }, 'security-admin');

  if (!approval.approved) {
    throw new Error('Production access denied');
  }

  return await grantTemporaryAccess({
    userId,
    environment: 'production',
    expiresAt: Date.now() + duration,
  });
}
```

**詳細**: `resources/cross-account-access-control.md`

## データマスキングとサニタイゼーション

### 本番データの匿名化

```typescript
class DataAnonymizer {
  async anonymize(data: User[]): Promise<User[]> {
    return data.map(user => ({
      ...user,
      email: this.anonymizeEmail(user.email),
      name: this.anonymizeName(user.name),
      phone: this.anonymizePhone(user.phone),
    }));
  }

  private anonymizeEmail(email: string): string {
    const [, domain] = email.split('@');
    return `user${Math.random().toString(36).substring(7)}@${domain}`;
  }
}
```

**詳細**: `resources/data-anonymization-techniques.md`

## 環境別設定管理

### 設定ファイル分離

```
config/
├── default.ts       # すべての環境共通
├── development.ts   # 開発環境固有
├── staging.ts       # ステージング環境固有
└── production.ts    # 本番環境固有
```

**実装**:
```typescript
import defaultConfig from './default';
import prodConfig from './production';

const configs = {
  development: { ...defaultConfig, ...devConfig },
  production: { ...defaultConfig, ...prodConfig },
};

export const config = configs[process.env.NODE_ENV || 'development'];
```

**詳細**: `resources/environment-config-patterns.md`

## Railway/GitHub Actions統合

### Railway環境グループ

```
Project: MyApp
├── Environment: development
│   └── Variables: <dev値>
├── Environment: staging
│   └── Variables: <staging値>
└── Environment: production
    └── Variables: <prod値>
```

### GitHub Actions環境

```yaml
environment:
  name: ${{ github.ref == 'refs/heads/main' && 'production' || 'development' }}
```

**詳細**: `resources/platform-environment-integration.md`

## 実装チェックリスト

### 環境分離
- [ ] 開発・ステージング・本番が明確に分離されているか？
- [ ] 環境毎に異なるSecret値が設定されているか？
- [ ] 環境間のSecret共有が防止されているか？
- [ ] 本番データが開発環境で使用されていないか？

### アクセス制御
- [ ] 開発者は開発環境のみアクセス可能か？
- [ ] 本番環境へのアクセスは承認制か？
- [ ] クロス環境アクセスが適切に制限されているか？

### Rotation戦略
- [ ] 環境毎に適切なRotation頻度が設定されているか？
- [ ] 本番Secretは30日毎にRotationされるか？

## 関連スキル

- `.claude/skills/secret-management-architecture/SKILL.md` - Secret管理
- `.claude/skills/zero-trust-security/SKILL.md` - アクセス制御
- `.claude/skills/railway-secrets-management/SKILL.md` - Railway統合

## リソースファイル

- `resources/environment-validation.md` - 環境検証

## スクリプト

- `scripts/validate-environment.mjs` - 環境検証スクリプト
