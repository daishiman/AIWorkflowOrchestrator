# 継続的検証の実装

## 概要

継続的検証は、Zero Trustの核心原則の一つです。
一度認証したユーザーを信用し続けるのではなく、すべてのアクセスを
毎回検証することで、セキュリティを確保します。

## セッショントークン管理

### 短命トークン実装

```typescript
interface SessionToken {
  userId: string;
  issuedAt: Date;
  expiresAt: Date;
  mfaVerified: boolean;
  ipAddress: string;
  deviceId: string;
}

class SessionTokenManager {
  private readonly TOKEN_TTL = 15 * 60 * 1000; // 15分

  async createToken(userId: string, context: AccessContext): Promise<string> {
    const session: SessionToken = {
      userId,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + this.TOKEN_TTL),
      mfaVerified: context.mfaVerified,
      ipAddress: context.ipAddress,
      deviceId: context.deviceId,
    };

    const token = await this.encryptSession(session);
    await this.storeSession(token, session);

    return token;
  }

  async validateToken(token: string): Promise<SessionToken> {
    const session = await this.getSession(token);

    if (!session) {
      throw new Error('Invalid session token');
    }

    if (session.expiresAt < new Date()) {
      await this.deleteSession(token);
      throw new Error('Session expired');
    }

    return session;
  }
}
```

## コンテキストベース検証

### アクセスコンテキストの収集

```typescript
interface AccessContext {
  userId: string;
  ipAddress: string;
  location: { country: string; city: string };
  timestamp: Date;
  deviceId: string;
  userAgent: string;
}

class ContextCollector {
  collectContext(req: Request): AccessContext {
    return {
      userId: req.user.id,
      ipAddress: req.ip,
      location: this.geolocate(req.ip),
      timestamp: new Date(),
      deviceId: this.extractDeviceId(req),
      userAgent: req.headers['user-agent'],
    };
  }

  private geolocate(ip: string): { country: string; city: string } {
    // IP geolocation service
    return geoip.lookup(ip);
  }

  private extractDeviceId(req: Request): string {
    // デバイス指紋から一意ID生成
    return crypto.createHash('sha256')
      .update(req.headers['user-agent'] + req.headers['accept-language'])
      .digest('hex');
  }
}
```

### コンテキストベースリスク評価

```typescript
class RiskEvaluator {
  async evaluateRisk(context: AccessContext, user: User): Promise<number> {
    let riskScore = 0;

    // 時間帯リスク
    const hour = context.timestamp.getHours();
    if (hour < 6 || hour > 22) {
      riskScore += 0.2; // 営業時間外
    }

    // 地理的リスク
    if (!user.knownLocations.some(loc => loc.country === context.location.country)) {
      riskScore += 0.3; // 新しい地域
    }

    // デバイスリスク
    if (!user.knownDevices.includes(context.deviceId)) {
      riskScore += 0.3; // 新しいデバイス
    }

    // IPレピュテーション
    if (await this.isIPSuspicious(context.ipAddress)) {
      riskScore += 0.5; // 疑わしいIP
    }

    return Math.min(riskScore, 1.0); // 0-1の範囲
  }

  async isIPSuspicious(ip: string): Promise<boolean> {
    // IPレピュテーションサービス連携
    const reputation = await ipReputationService.check(ip);
    return reputation.score < 0.5;
  }
}
```

## 適応的認証

### リスクベースMFA要求

```typescript
class AdaptiveAuthenticationManager {
  async accessSecret(
    secretName: string,
    userId: string,
    context: AccessContext
  ): Promise<string> {
    // 1. リスク評価
    const user = await this.getUser(userId);
    const riskScore = await this.riskEvaluator.evaluateRisk(context, user);

    // 2. リスクに応じた認証レベル決定
    if (riskScore > 0.7) {
      // 高リスク → MFA必須 + 承認必要
      if (!context.mfaVerified) {
        throw new Error('MFA verification required');
      }
      await this.requestManagerApproval(userId, secretName);

    } else if (riskScore > 0.4) {
      // 中リスク → MFA必須
      if (!context.mfaVerified) {
        throw new Error('MFA verification required');
      }

    } else {
      // 低リスク → 通常認証のみ
    }

    // 3. Secret取得
    return await this.getSecret(secretName);
  }
}
```

## 異常検知実装

### 機械学習ベース異常検知

```typescript
interface UserBehaviorProfile {
  userId: string;
  usualAccessTimes: number[]; // 時間帯の分布（0-23）
  usualLocations: string[]; // 通常のアクセス地域
  usualFrequency: number; // 平均アクセス頻度（回/日）
  usualSecretTypes: string[]; // 通常アクセスするSecretタイプ
}

class MLAnomalyDetector {
  async buildUserProfile(userId: string): Promise<UserBehaviorProfile> {
    const history = await this.getAccessHistory(userId, 90); // 過去90日

    return {
      userId,
      usualAccessTimes: this.extractTimeDistribution(history),
      usualLocations: this.extractLocations(history),
      usualFrequency: history.length / 90,
      usualSecretTypes: this.extractSecretTypes(history),
    };
  }

  async detectAnomaly(
    event: AccessEvent,
    profile: UserBehaviorProfile
  ): Promise<{ isAnomaly: boolean; score: number; reasons: string[] }> {
    const deviations = {
      time: this.compareTime(event.timestamp.getHours(), profile.usualAccessTimes),
      location: this.compareLocation(event.location, profile.usualLocations),
      frequency: this.compareFrequency(event.recentCount, profile.usualFrequency),
      secretType: this.compareSecretType(event.secretType, profile.usualSecretTypes),
    };

    // 重み付きスコア計算
    const score =
      deviations.time * 0.2 +
      deviations.location * 0.3 +
      deviations.frequency * 0.3 +
      deviations.secretType * 0.2;

    const reasons = [];
    if (deviations.time > 0.7) reasons.push('Unusual access time');
    if (deviations.location > 0.7) reasons.push('New location');
    if (deviations.frequency > 0.7) reasons.push('Abnormal frequency');
    if (deviations.secretType > 0.7) reasons.push('Unusual secret type');

    return {
      isAnomaly: score > 0.8,
      score,
      reasons,
    };
  }

  private compareTime(hour: number, usualTimes: number[]): number {
    // 通常アクセス時間帯との偏差計算
    const distribution = usualTimes.reduce((acc, time) => {
      acc[time] = (acc[time] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const accessProbability = distribution[hour] || 0;
    return 1 - (accessProbability / Math.max(...Object.values(distribution)));
  }
}
```

## 再認証トリガー

### 条件付き再認証

```typescript
class ReAuthenticationManager {
  async checkReAuthNeed(
    session: SessionToken,
    action: string,
    resource: string
  ): Promise<boolean> {
    // 1. セッション有効期限
    if (session.expiresAt < new Date()) {
      return true; // 再認証必要
    }

    // 2. 重要な操作
    const criticalActions = ['rotate', 'delete', 'write'];
    if (criticalActions.includes(action)) {
      // MFA検証が1時間以上前
      if (Date.now() - session.mfaVerifiedAt > 60 * 60 * 1000) {
        return true; // MFA再検証必要
      }
    }

    // 3. Critical Secretへのアクセス
    const secretMeta = await this.getSecretMetadata(resource);
    if (secretMeta.classification === 'critical') {
      // Critical Secretは毎回MFA
      if (!session.mfaVerified || Date.now() - session.mfaVerifiedAt > 15 * 60 * 1000) {
        return true;
      }
    }

    return false; // 再認証不要
  }
}
```

## アラートと対応

### 異常検知時の自動対応

```typescript
class AnomalyResponseSystem {
  async handleAnomaly(event: AccessEvent, anomaly: AnomalyDetection): Promise<void> {
    // 1. アラート送信
    await this.sendAlert({
      severity: anomaly.score > 0.9 ? 'critical' : 'high',
      event: 'anomaly_detected',
      user: event.userId,
      secret: event.secretName,
      score: anomaly.score,
      reasons: anomaly.reasons,
    });

    // 2. 自動対応
    if (anomaly.score > 0.9) {
      // 非常に疑わしい → アクセスブロック + セッション無効化
      await this.revokeSession(event.sessionToken);
      await this.blockAccess(event.userId, event.secretName, 3600000); // 1時間ブロック

    } else if (anomaly.score > 0.8) {
      // 疑わしい → MFA要求
      await this.requestMFA(event.userId);

    } else {
      // やや疑わしい → ログ記録のみ
      await this.auditLog.record({
        event: 'anomaly_detected_low_severity',
        details: anomaly,
      });
    }

    // 3. Security Teamに通知
    if (anomaly.score > 0.8) {
      await this.notifySecurityTeam({
        type: 'anomaly',
        user: event.userId,
        score: anomaly.score,
        actionTaken: anomaly.score > 0.9 ? 'blocked' : 'mfa_requested',
      });
    }
  }
}
```

## 実装チェックリスト

- [ ] セッショントークンの有効期限が短い（15分-1時間）か？
- [ ] すべてのアクセスが毎回検証されるか？
- [ ] リスクスコアに基づく適応的認証が実装されているか？
- [ ] 異常検知メカニズムが動作しているか？
- [ ] 異常検知時の自動対応が設定されているか？
- [ ] Security Teamへのアラート通知が機能するか？
