# Secret Rotation 詳細手順

## ゼロダウンタイムRotationの5段階

### Phase 1: 新鍵生成

```typescript
class SecretRotationOrchestrator {
  async phase1_generateNewSecret(secretName: string): Promise<string> {
    console.log(`Phase 1: Generating new secret for ${secretName}`);

    let newSecret: string;

    switch (this.getSecretType(secretName)) {
      case 'database_password':
        newSecret = crypto.randomBytes(32).toString('base64');
        break;

      case 'api_key':
        // サービスプロバイダーで新キー生成
        newSecret = await this.providerAPI.createNewKey(secretName);
        break;

      case 'encryption_key':
        newSecret = crypto.randomBytes(32).toString('hex');
        break;

      default:
        newSecret = crypto.randomBytes(32).toString('base64');
    }

    await this.auditLog.record({
      event: 'rotation_phase_1_complete',
      secret_name: secretName,
      timestamp: new Date(),
    });

    return newSecret;
  }
}
```

### Phase 2: 両方の鍵を有効化（新旧並存）

```typescript
async phase2_enableBothSecrets(
  secretName: string,
  oldSecret: string,
  newSecret: string
): Promise<void> {
  console.log(`Phase 2: Enabling both secrets for ${secretName}`);

  // データベースの場合: 新ユーザー作成
  if (this.isDatabase(secretName)) {
    await this.db.execute(`
      CREATE USER app_user_new WITH PASSWORD '${newSecret}';
      GRANT ALL PRIVILEGES ON DATABASE mydb TO app_user_new;
    `);
  }

  // APIキーの場合: 両方のキーを環境変数に設定
  await this.secretManager.set(`${secretName}`, oldSecret); // 旧
  await this.secretManager.set(`${secretName}_NEW`, newSecret); // 新

  await this.auditLog.record({
    event: 'rotation_phase_2_complete',
    secret_name: secretName,
    both_secrets_active: true,
  });
}
```

### Phase 3: アプリケーションを新鍵に移行

```typescript
async phase3_migrateToNewSecret(secretName: string): Promise<void> {
  console.log(`Phase 3: Migrating applications to new secret`);

  // デプロイ設定を更新
  await this.deploymentService.updateConfig({
    [secretName]: process.env[`${secretName}_NEW`],
  });

  // ローリングリスタート（ダウンタイムなし）
  await this.deploymentService.rollingRestart({
    maxUnavailable: 1, // 同時に1インスタンスのみ再起動
    waitBetween: 30000, // 30秒待機
  });

  // 全インスタンスの移行確認
  const allMigrated = await this.verifyAllInstancesUseNewSecret(secretName);
  if (!allMigrated) {
    throw new Error('Migration incomplete - rollback required');
  }

  await this.auditLog.record({
    event: 'rotation_phase_3_complete',
    secret_name: secretName,
    migration_successful: true,
  });
}
```

### Phase 4: 旧鍵を無効化（読み取り専用）

```typescript
async phase4_deprecateOldSecret(secretName: string): Promise<void> {
  console.log(`Phase 4: Deprecating old secret`);

  // データベースの場合: 旧ユーザーを読み取り専用に
  if (this.isDatabase(secretName)) {
    await this.db.execute(`
      REVOKE ALL PRIVILEGES ON DATABASE mydb FROM app_user_old;
      GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_user_old;
    `);
  }

  // APIキーの場合: 旧キーをread-onlyに（可能であれば）
  // または単に監視を強化

  await this.auditLog.record({
    event: 'rotation_phase_4_complete',
    secret_name: secretName,
    old_secret_deprecated: true,
  });

  // 24時間監視期間を設定
  console.log('Monitoring period: 24 hours before final deletion');
}
```

### Phase 5: 監視期間後、旧鍵を完全削除

```typescript
async phase5_deleteOldSecret(secretName: string): Promise<void> {
  console.log(`Phase 5: Deleting old secret (after monitoring period)`);

  // 旧鍵へのアクセスがないことを確認
  const oldSecretUsage = await this.checkOldSecretUsage(secretName);
  if (oldSecretUsage > 0) {
    throw new Error(`Old secret still in use: ${oldSecretUsage} accesses detected`);
  }

  // データベースの場合: 旧ユーザー削除
  if (this.isDatabase(secretName)) {
    await this.db.execute(`DROP USER IF EXISTS app_user_old;`);
  }

  // 旧Secret削除
  await this.secretManager.delete(`${secretName}_OLD`);

  await this.auditLog.record({
    event: 'rotation_complete',
    secret_name: secretName,
    old_secret_deleted: true,
    timestamp: new Date(),
  });

  console.log(`✅ Rotation complete for ${secretName}`);
}
```

## Rotationタイプ別手順

### データベースパスワードRotation

```typescript
class DatabasePasswordRotation {
  async rotate(): Promise<void> {
    // 1. 新パスワード生成
    const newPassword = crypto.randomBytes(32).toString('base64');

    // 2. 新ユーザー作成
    await this.db.execute(`
      CREATE USER app_user_new WITH PASSWORD '${newPassword}';
      GRANT ALL PRIVILEGES ON DATABASE mydb TO app_user_new;
    `);

    // 3. 接続文字列更新
    const newConnectionString = `postgresql://app_user_new:${newPassword}@host/db`;
    await this.secretManager.set('DATABASE_URL_NEW', newConnectionString);

    // 4. アプリケーション再起動（ローリング）
    await this.rollingRestart();

    // 5. 旧ユーザー削除（24時間後）
    setTimeout(async () => {
      await this.db.execute(`DROP USER app_user_old;`);
    }, 24 * 60 * 60 * 1000);
  }
}
```

### APIキーRotation

```typescript
class APIKeyRotation {
  async rotate(provider: string, keyName: string): Promise<void> {
    // 1. プロバイダーで新キー生成
    const newKey = await this.providerAPI[provider].createKey({
      name: `${keyName}-new`,
      permissions: await this.getKeyPermissions(keyName),
    });

    // 2. 新キーを環境変数に追加
    await this.secretManager.set(`${keyName}_NEW`, newKey.value);

    // 3. アプリケーションコード更新（新旧フォールバック）
    // process.env[keyName + '_NEW'] || process.env[keyName]

    // 4. デプロイ
    await this.deploy();

    // 5. 新キーに完全移行
    await this.secretManager.set(keyName, newKey.value);
    await this.secretManager.delete(`${keyName}_NEW`);

    // 6. 旧キーを無効化
    await this.providerAPI[provider].revokeKey(oldKey.id);
  }
}
```

## ロールバック手順

### Rotation失敗時のロールバック

```typescript
class RotationRollback {
  async rollback(secretName: string, phase: number): Promise<void> {
    console.log(`Rolling back rotation at Phase ${phase}`);

    switch (phase) {
      case 3: // Migration失敗
        // 旧Secretに戻す
        await this.deploymentService.updateConfig({
          [secretName]: process.env[`${secretName}_OLD`],
        });
        await this.deploymentService.rollingRestart();
        break;

      case 4: // Deprecation後に問題発覚
        // 旧Secretを再度有効化
        await this.reactivateOldSecret(secretName);
        break;

      case 5: // 削除後に問題発覚
        // バックアップから復元
        await this.restoreFromBackup(secretName);
        break;
    }

    await this.auditLog.record({
      event: 'rotation_rollback',
      secret_name: secretName,
      phase: phase,
      timestamp: new Date(),
    });
  }
}
```

## Rotation自動化

### Cronベーススケジューリング

```typescript
import cron from 'node-cron';

class AutoRotationScheduler {
  setupSchedule(): void {
    // Critical Secrets: 30日毎（毎月1日）
    cron.schedule('0 0 1 * *', async () => {
      await this.rotateSecret('DATABASE_PASSWORD_PROD');
      await this.rotateSecret('STRIPE_SECRET_KEY');
    });

    // High Secrets: 90日毎（四半期初日）
    cron.schedule('0 0 1 */3 *', async () => {
      await this.rotateSecret('OPENAI_API_KEY');
      await this.rotateSecret('NEXTAUTH_SECRET');
    });
  }

  private async rotateSecret(secretName: string): Promise<void> {
    try {
      await this.rotationOrchestrator.rotate(secretName);
      await this.notifySuccess(secretName);
    } catch (error) {
      await this.notifyFailure(secretName, error);
      await this.escalateToSecurityTeam(secretName, error);
    }
  }
}
```

## チェックリスト

### Rotation実行前
- [ ] ロールバック手順が明確か？
- [ ] バックアップが取得されているか？
- [ ] 監視体制が整っているか？
- [ ] チームに事前通知したか？

### Rotation実行中
- [ ] 各Phaseが正常に完了しているか？
- [ ] アプリケーションが正常に動作しているか？
- [ ] エラーログを監視しているか？

### Rotation実行後
- [ ] 新Secretで正常に動作しているか？
- [ ] 旧Secretへのアクセスがゼロか？
- [ ] 監査ログが記録されているか？
- [ ] チームに完了を通知したか？
