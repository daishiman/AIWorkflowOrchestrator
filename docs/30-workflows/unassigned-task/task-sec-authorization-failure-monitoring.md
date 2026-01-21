# 認可失敗監視・アラート機能 - タスク指示書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | SEC-MONITOR-001                            |
| タスク名     | 認可失敗監視・アラート機能                 |
| 分類         | セキュリティ                               |
| 対象機能     | ChatHistoryService、認可チェック全般       |
| 優先度       | 低                                         |
| 見積もり規模 | 中規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 12（SECURITY-001システム仕様更新時） |
| 発見日       | 2026-01-19                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SECURITY-001タスクでChatHistoryServiceに認可チェック機能（UnauthorizedError）を実装した。現在、認可失敗時にはエラーがスローされるが、その発生を監視・記録する仕組みがない。

**aiworkflow-requirements参照**:

- `references/error-handling.md` - ERR_2006 UNAUTHORIZED、UnauthorizedErrorクラス
- `references/interfaces-chat-history.md` - 認可チェック対象メソッド

### 1.2 問題点・課題

**現在の実装状態**:

- UnauthorizedErrorはスローされるがログ記録なし
- 繰り返しの認可失敗を検知する仕組みなし
- 攻撃パターン（総当たりアクセス等）の検出不可

**セキュリティ上の問題**:

- 不正アクセス試行を検知できない
- セキュリティインシデントの事前検知ができない
- OWASP A09:2021（Security Logging and Monitoring Failures）非準拠

### 1.3 放置した場合の影響

| 影響領域         | 影響度 | 説明                                           |
| ---------------- | ------ | ---------------------------------------------- |
| 攻撃検知         | High   | 不正アクセス試行を検知できず、被害拡大の可能性 |
| インシデント対応 | Medium | 事後調査に必要なログがない                     |
| OWASP A09準拠    | Medium | Security Logging and Monitoring Failures非準拠 |
| コンプライアンス | Low    | セキュリティ監査で指摘される可能性             |

---

## 2. 何を達成するか（What）

### 2.1 目的

認可失敗（UnauthorizedError）の発生を監視・記録し、繰り返しの認可失敗を検知してアラートを発生させる。

### 2.2 最終ゴール

- ✅ UnauthorizedError発生時の自動ログ記録
- ✅ 認可失敗の統計情報収集
- ✅ 繰り返し認可失敗の検知（閾値ベース）
- ✅ アラート発生機能（コンソール/ファイル）
- ✅ 認可失敗レポート生成

### 2.3 スコープ

#### 含むもの

- UnauthorizedError発生時のログ記録サービス
- 認可失敗カウンター（ユーザー/セッション/時間帯別）
- 閾値ベースのアラート発生機能
- 認可失敗レポート生成機能

#### 含まないもの

- リアルタイム通知（Slack/Discord連携等）- 将来対応
- 機械学習ベースの異常検知 - 将来対応
- ブロック/ロックアウト機能 - 将来対応
- ダッシュボードUI - 将来対応

### 2.4 成果物

| 種別         | 成果物                      | 配置先                                                                 |
| ------------ | --------------------------- | ---------------------------------------------------------------------- |
| 実装         | AuthorizationMonitorService | `packages/shared/src/services/authorization-monitor-service.ts`        |
| 実装         | authorization-logger.ts     | `packages/shared/src/infrastructure/logging/authorization-logger.ts`   |
| 実装         | ChatHistoryService修正      | `packages/shared/src/features/chat-history/chat-history-service.ts`    |
| テスト       | モニタリングテスト          | `packages/shared/src/services/__tests__/authorization-monitor.test.ts` |
| ドキュメント | security-operations.md更新  | `.claude/skills/aiworkflow-requirements/references/`                   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [x] SECURITY-001（ChatHistoryService認可チェック）が完了していること
- [x] UnauthorizedErrorクラスが実装されていること
- [ ] ログ基盤（Logger）が整備されていること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- SECURITY-001: ChatHistoryService認可チェック（完了済み）

**推奨（先に完了推奨）**:

- AUDIT-001: 監査ログ実装

**同時実施可能なタスク**:

- SEC-IPC-001: IPC層認可バリデーション

### 3.3 必要な知識

- TypeScript サービス実装
- ログ記録・構造化ログ
- カウンター/統計情報管理
- 閾値ベースアラート設計

### 3.4 推奨アプローチ

1. **AuthorizationMonitorService作成**: UnauthorizedError発生を監視するサービス
2. **authorization-logger作成**: 構造化ログ出力専用ロガー
3. **ChatHistoryService連携**: エラー発生時にモニターサービスへ通知
4. **閾値アラート実装**: 繰り返し失敗検知とアラート発生

---

## 4. 実行手順

### Phase構成

```
Phase 1: AuthorizationMonitorService実装
  ↓
Phase 2: authorization-logger実装
  ↓
Phase 3: ChatHistoryService連携
  ↓
Phase 4: 閾値アラート機能実装
  ↓
Phase 5: テスト作成・実行
  ↓
Phase 6: ドキュメント更新
```

---

### Phase 1: AuthorizationMonitorService実装

#### 目的

認可失敗イベントを収集・管理するサービスを実装する。

#### 手順

1. `packages/shared/src/services/authorization-monitor-service.ts`を新規作成
2. 以下のメソッドを実装:
   - `recordAuthorizationFailure(details: AuthorizationFailureDetails): void`
   - `getFailureCount(userId: string, windowMinutes: number): number`
   - `getFailureStatistics(): AuthorizationStatistics`
   - `clearOldRecords(retentionMinutes: number): void`

#### 実装例

```typescript
// authorization-monitor-service.ts
import { UnauthorizedError } from "../errors";

export interface AuthorizationFailureDetails {
  userId: string;
  sessionId?: string;
  resourceType: string;
  resourceId?: string;
  timestamp: Date;
  ipAddress?: string;
}

export interface AuthorizationStatistics {
  totalFailures: number;
  failuresByUser: Map<string, number>;
  failuresByResourceType: Map<string, number>;
  recentFailures: AuthorizationFailureDetails[];
}

export class AuthorizationMonitorService {
  private failures: AuthorizationFailureDetails[] = [];
  private readonly maxRecords = 10000;
  private readonly alertThreshold = 5; // 5分間に5回失敗でアラート
  private readonly alertWindowMinutes = 5;

  recordAuthorizationFailure(details: AuthorizationFailureDetails): void {
    this.failures.push(details);
    this.checkAlertThreshold(details.userId);
    this.trimOldRecords();
  }

  private checkAlertThreshold(userId: string): void {
    const recentCount = this.getFailureCount(userId, this.alertWindowMinutes);
    if (recentCount >= this.alertThreshold) {
      this.emitAlert(userId, recentCount);
    }
  }

  private emitAlert(userId: string, count: number): void {
    console.warn(
      `[SECURITY ALERT] User ${userId} has ${count} authorization failures in ${this.alertWindowMinutes} minutes`,
    );
    // 将来: 外部通知システムへの連携
  }

  // ... 他のメソッド実装
}
```

#### 完了条件

- [ ] AuthorizationMonitorService作成完了
- [ ] 4メソッド実装完了
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 2: authorization-logger実装

#### 目的

認可失敗を構造化ログとして出力する専用ロガーを実装する。

#### 手順

1. `packages/shared/src/infrastructure/logging/authorization-logger.ts`を新規作成
2. 構造化ログ形式で認可失敗を出力
3. ログレベル、タイムスタンプ、詳細情報を含む

#### 実装例

```typescript
// authorization-logger.ts
import { AuthorizationFailureDetails } from "../../services/authorization-monitor-service";

export interface AuthorizationLogEntry {
  level: "warn" | "error";
  event: "AUTHORIZATION_FAILURE";
  timestamp: string;
  details: AuthorizationFailureDetails;
  alertTriggered: boolean;
}

export function logAuthorizationFailure(
  details: AuthorizationFailureDetails,
  alertTriggered: boolean = false,
): void {
  const entry: AuthorizationLogEntry = {
    level: alertTriggered ? "error" : "warn",
    event: "AUTHORIZATION_FAILURE",
    timestamp: new Date().toISOString(),
    details,
    alertTriggered,
  };

  if (alertTriggered) {
    console.error(JSON.stringify(entry));
  } else {
    console.warn(JSON.stringify(entry));
  }
}
```

#### 完了条件

- [ ] authorization-logger.ts作成完了
- [ ] 構造化ログ出力実装完了
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 3: ChatHistoryService連携

#### 目的

ChatHistoryServiceでUnauthorizedErrorが発生した際に、AuthorizationMonitorServiceへ通知する。

#### 手順

1. `chat-history-service.ts`を開く
2. AuthorizationMonitorServiceをDI経由で注入
3. `verifySessionOwnership`失敗時にモニターサービスへ通知

#### 実装例

```typescript
// chat-history-service.ts
private async verifySessionOwnership(
  sessionId: string,
  requestUserId: string,
): Promise<ChatSession> {
  const session = await this.sessionRepository.findById(sessionId);

  if (!session || session.userId !== requestUserId) {
    // モニターサービスへ通知
    this.authorizationMonitor.recordAuthorizationFailure({
      userId: requestUserId,
      sessionId,
      resourceType: RESOURCE_TYPE.SESSION,
      resourceId: sessionId,
      timestamp: new Date(),
    });

    throw new UnauthorizedError(
      UNAUTHORIZED_ERROR_MESSAGE,
      RESOURCE_TYPE.SESSION,
      sessionId,
    );
  }

  return session;
}
```

#### 完了条件

- [ ] AuthorizationMonitorService注入完了
- [ ] verifySessionOwnership修正完了
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 4: 閾値アラート機能実装

#### 目的

繰り返し認可失敗を検知し、アラートを発生させる機能を実装する。

#### 閾値設定

| 閾値種別           | デフォルト値 | 説明                       |
| ------------------ | ------------ | -------------------------- |
| alertThreshold     | 5            | アラート発生までの失敗回数 |
| alertWindowMinutes | 5            | 集計対象の時間窓（分）     |
| maxRecords         | 10000        | 保持する最大レコード数     |

#### 完了条件

- [ ] 閾値設定の外部化
- [ ] アラート発生ロジック実装完了
- [ ] アラートテスト作成完了

---

### Phase 5: テスト作成・実行

#### 目的

認可失敗監視機能が正しく動作することを確認する。

#### テストケース

| No  | カテゴリ | テスト項目           | 期待結果                 |
| --- | -------- | -------------------- | ------------------------ |
| 1   | 正常系   | 認可失敗記録         | failuresに追加される     |
| 2   | 正常系   | 失敗カウント取得     | 正しいカウントが返る     |
| 3   | 正常系   | 統計情報取得         | 正しい統計が返る         |
| 4   | アラート | 閾値未満の失敗       | アラートなし             |
| 5   | アラート | 閾値到達の失敗       | アラート発生             |
| 6   | 境界値   | 古いレコードのクリア | 古いレコードが削除される |

#### 完了条件

- [ ] テスト6件すべてPASS
- [ ] カバレッジ80%以上

---

### Phase 6: ドキュメント更新

#### 目的

aiworkflow-requirementsのシステム仕様を更新する。

#### 手順

1. `references/security-operations.md`にモニタリング仕様を追記
2. `references/error-handling.md`にモニタリング連携を追記
3. SKILL.mdの変更履歴を更新

#### 完了条件

- [ ] security-operations.md更新完了
- [ ] error-handling.md更新完了
- [ ] SKILL.md変更履歴追記

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] AuthorizationMonitorService実装完了
- [ ] authorization-logger実装完了
- [ ] ChatHistoryService連携完了
- [ ] 閾値アラート機能実装完了

### 品質要件

- [ ] テスト6件すべてPASS
- [ ] ESLint/TypeScriptエラーゼロ
- [ ] カバレッジ80%以上

### ドキュメント要件

- [ ] security-operations.md更新
- [ ] error-handling.md更新
- [ ] SKILL.md変更履歴追記

---

## 6. 検証方法

### テストケース

#### 単体テスト

1. recordAuthorizationFailure - 記録追加
2. getFailureCount - カウント取得
3. getFailureStatistics - 統計取得
4. checkAlertThreshold - 閾値未満
5. checkAlertThreshold - 閾値到達
6. clearOldRecords - 古いレコードクリア

### 検証手順

```bash
# テスト実行
pnpm --filter @repo/shared test authorization-monitor

# 型チェック
pnpm --filter @repo/shared typecheck

# Lint
pnpm --filter @repo/shared lint
```

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                         |
| ------------------ | ------ | -------- | ---------------------------- |
| メモリ使用量増大   | Medium | Medium   | maxRecords制限とクリア処理   |
| アラート疲れ       | Low    | Low      | 適切な閾値設定とチューニング |
| パフォーマンス低下 | Low    | Low      | 非同期処理とバッチ処理       |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/error-handling.md` - UnauthorizedError仕様
- `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` - 認可チェック仕様
- `.claude/skills/aiworkflow-requirements/references/security-operations.md` - セキュリティ運用

### 参考資料

- [OWASP A09:2021 - Security Logging and Monitoring Failures](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/)
- [Structured Logging Best Practices](https://www.scalyr.com/blog/structured-logging/)

---

## 9. 備考

### 発見経緯

SECURITY-001タスクのPhase 12（システム仕様更新）において、aiworkflow-requirementsの`error-handling.md`を更新した際、UnauthorizedErrorの発生を監視する仕組みが不足していることを検出した。

### 補足事項

- このタスクはSECURITY-001の拡張タスクとして位置づけられる
- 将来的にはリアルタイム通知（Slack/Discord連携）を追加予定
- アラート閾値は運用状況に応じて調整可能にすること
- AUDIT-001（監査ログ）との連携も検討すること
