# JIT (Just-In-Time) Access パターン

## JITアクセスの概念

Just-In-Time（JIT）アクセスは、必要な時に、必要な期間だけアクセス権限を付与する
セキュリティモデルです。常時付与された権限ではなく、一時的な権限により、
攻撃面を最小化し、監査の精度を向上させます。

## JITアクセスの利点

1. **攻撃面の最小化**: 権限が常時存在しない → 侵害リスク低減
2. **監査精度の向上**: 誰が、いつ、なぜアクセスしたかが明確
3. **コンプライアンス**: 権限の時間制限によるコンプライアンス要件対応
4. **権限の適時性**: 不要になった権限が自動revoke

## 基本実装パターン

### パターン1: 時間制限付きアクセス

```typescript
interface JITAccessGrant {
  id: string;
  userId: string;
  secretName: string;
  grantedAt: Date;
  expiresAt: Date;
  justification: string;
  approvedBy: string;
  status: 'active' | 'expired' | 'revoked';
}

class JITAccessManager {
  async requestAccess(
    userId: string,
    secretName: string,
    duration: number,  // ミリ秒
    justification: string
  ): Promise<JITAccessGrant> {
    // 1. リクエスト作成
    const request = {
      userId,
      secretName,
      duration,
      justification,
      requestedAt: new Date(),
    };

    // 2. 自動承認 or 承認フロー
    const approval = await this.evaluateApprovalNeeds(secretName);

    if (approval.requiresApproval) {
      return await this.sendForApproval(request);
    }

    // 3. アクセス付与
    const grant: JITAccessGrant = {
      id: generateId(),
      userId,
      secretName,
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + duration),
      justification,
      approvedBy: 'auto',
      status: 'active',
    };

    await this.storeGrant(grant);

    // 4. 自動revoke設定
    this.scheduleRevoke(grant.id, duration);

    // 5. 監査ログ
    await this.auditLog.record({
      event: 'jit_access_granted',
      grant_id: grant.id,
      user_id: userId,
      secret_name: secretName,
      duration: duration,
      expires_at: grant.expiresAt,
    });

    return grant;
  }

  private scheduleRevoke(grantId: string, duration: number): void {
    setTimeout(async () => {
      await this.revokeAccess(grantId);
      await this.notifyUser(grant.userId, `Access to ${grant.secretName} expired`);
    }, duration);
  }

  async revokeAccess(grantId: string): Promise<void> {
    const grant = await this.getGrant(grantId);
    grant.status = 'revoked';
    await this.updateGrant(grant);

    await this.auditLog.record({
      event: 'jit_access_revoked',
      grant_id: grantId,
      revoked_at: new Date(),
    });
  }
}
```

### パターン2: 承認フロー統合

```typescript
class ApprovalWorkflow {
  async sendForApproval(request: AccessRequest): Promise<JITAccessGrant> {
    // 1. 承認者決定
    const approvers = await this.determineApprovers(request.secretName);

    // 2. 承認リクエスト送信
    const approvalRequest = await this.createApprovalRequest({
      requestId: request.id,
      approvers: approvers.map(a => a.id),
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1時間以内に承認必要
    });

    // 3. 通知送信
    for (const approver of approvers) {
      await this.sendNotification(approver, {
        type: 'approval_required',
        message: `${request.userId} requests access to ${request.secretName}`,
        justification: request.justification,
        approvalLink: this.generateApprovalLink(approvalRequest.id),
      });
    }

    // 4. 承認待ち
    return await this.waitForApproval(approvalRequest.id);
  }

  async approve(approvalRequestId: string, approverId: string): Promise<JITAccessGrant> {
    const approvalRequest = await this.getApprovalRequest(approvalRequestId);
    const request = approvalRequest.originalRequest;

    // 承認権限確認
    if (!approvalRequest.approvers.includes(approverId)) {
      throw new Error('Not authorized to approve this request');
    }

    // アクセス付与
    const grant = await this.jitAccessManager.grantAccess({
      userId: request.userId,
      secretName: request.secretName,
      duration: request.duration,
      approvedBy: approverId,
    });

    // 承認ステータス更新
    await this.updateApprovalStatus(approvalRequestId, 'approved', approverId);

    return grant;
  }
}
```

### パターン3: 緊急アクセス（Break Glass）

```typescript
class BreakGlassAccess {
  async emergencyAccess(
    userId: string,
    secretName: string,
    justification: string
  ): Promise<JITAccessGrant> {
    // 緊急アクセスは即座に付与されるが、高度に監視される

    // 1. 緊急アクセス付与
    const grant = await this.jitAccessManager.grantAccess({
      userId,
      secretName,
      duration: 30 * 60 * 1000,  // 30分のみ
      approvedBy: 'emergency_protocol',
      emergencyAccess: true,
    });

    // 2. 即座にアラート送信
    await this.sendCriticalAlert({
      severity: 'critical',
      event: 'emergency_access_granted',
      user_id: userId,
      secret_name: secretName,
      justification: justification,
      timestamp: new Date(),
    });

    // 3. Security Adminに通知
    await this.notifySecurityTeam({
      type: 'emergency_access',
      message: `Emergency access granted to ${userId} for ${secretName}`,
      action_required: 'Review and validate within 1 hour',
    });

    // 4. 事後レビュー必須
    await this.schedulePostIncidentReview(grant.id);

    return grant;
  }
}
```

## アクセス有効性チェック

### リアルタイム検証

```typescript
class AccessValidator {
  async validateActiveGrant(userId: string, secretName: string): Promise<boolean> {
    // 1. アクティブなGrant検索
    const grant = await this.findActiveGrant(userId, secretName);
    if (!grant) {
      return false;  // Grant不在
    }

    // 2. 有効期限確認
    if (grant.expiresAt < new Date()) {
      grant.status = 'expired';
      await this.updateGrant(grant);
      return false;  // 期限切れ
    }

    // 3. ステータス確認
    if (grant.status !== 'active') {
      return false;  // revoked or expired
    }

    // 4. 継続的検証（異常検知）
    const isAnomaly = await this.detectAnomaly(userId, secretName);
    if (isAnomaly) {
      // 異常検知 → Grantを即座にrevoke
      await this.revokeAccess(grant.id);
      await this.sendAlert({
        severity: 'high',
        event: 'anomaly_detected_grant_revoked',
        user_id: userId,
        grant_id: grant.id,
      });
      return false;
    }

    return true;  // 有効
  }
}
```

## 承認者決定ロジック

### 動的承認者選定

```typescript
class ApproverSelector {
  async determineApprovers(secretName: string): Promise<User[]> {
    // 1. Secretの分類取得
    const secret = await this.secretRepository.findByName(secretName);

    // 2. 分類に応じた承認者選定
    switch (secret.classification) {
      case 'critical':
        // Critical → Security Admin必須 + Secret Owner
        return [
          await this.getSecurityAdmin(),
          await this.getSecretOwner(secretName),
        ];

      case 'high':
        // High → Secret Owner or DevOps Manager
        return [
          await this.getSecretOwner(secretName) || await this.getDevOpsManager(),
        ];

      case 'medium':
      case 'low':
        // Medium/Low → 自動承認（監査ログのみ）
        return [];

      default:
        throw new Error('Unknown secret classification');
    }
  }

  private async getSecretOwner(secretName: string): Promise<User | null> {
    const secret = await this.secretRepository.findByName(secretName);
    return secret.owner ? await this.userRepository.findById(secret.owner) : null;
  }
}
```

## 監査とコンプライアンス

### JITアクセス監査レポート

```typescript
interface JITAccessReport {
  period: { start: Date; end: Date };
  grants: {
    total: number;
    approved: number;
    denied: number;
    emergency: number;
    expired: number;
    revoked: number;
  };
  averageDuration: number;
  topUsers: Array<{ userId: string; count: number }>;
  topSecrets: Array<{ secretName: string; count: number }>;
  anomalies: Array<{ grantId: string; reason: string }>;
}

class JITAuditReporter {
  async generateReport(startDate: Date, endDate: Date): Promise<JITAccessReport> {
    const grants = await this.getGrants(startDate, endDate);

    return {
      period: { start: startDate, end: endDate },
      grants: {
        total: grants.length,
        approved: grants.filter(g => g.status === 'active').length,
        denied: grants.filter(g => g.status === 'denied').length,
        emergency: grants.filter(g => g.emergencyAccess).length,
        expired: grants.filter(g => g.status === 'expired').length,
        revoked: grants.filter(g => g.status === 'revoked').length,
      },
      averageDuration: this.calculateAverageDuration(grants),
      topUsers: this.getTopUsers(grants),
      topSecrets: this.getTopSecrets(grants),
      anomalies: await this.detectAnomalies(grants),
    };
  }
}
```

## セキュリティベストプラクティス

### 1. アクセス期間の制限

- **開発環境**: 最大24時間
- **ステージング環境**: 最大8時間
- **本番環境**: 最大1-2時間
- **緊急アクセス**: 最大30分

### 2. 自動revoke

- タイマーベースの自動revoke
- 異常検知時の即座revoke
- セッション終了時のrevoke

### 3. 監査の完全性

- すべてのJITアクセスを記録
- 承認者、理由、期間を記録
- 使用状況を監視

### 4. 緊急アクセスの制御

- 緊急アクセスは短時間のみ
- Security Teamへの即座通知
- 事後レビュー必須
