# セッション戦略の比較分析

## 評価軸

| 評価軸               | JWT-based  | Database-based | Hybrid    |
| -------------------- | ---------- | -------------- | --------- |
| **スケーラビリティ** | ⭐⭐⭐⭐⭐ | ⭐⭐           | ⭐⭐⭐    |
| **即座無効化**       | ❌         | ✅             | ✅        |
| **セキュリティ**     | ⭐⭐⭐     | ⭐⭐⭐⭐⭐     | ⭐⭐⭐⭐  |
| **パフォーマンス**   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐         | ⭐⭐⭐⭐  |
| **実装複雑度**       | ⭐⭐       | ⭐⭐⭐         | ⭐⭐⭐⭐  |
| **運用コスト**       | ⭐⭐       | ⭐⭐⭐⭐       | ⭐⭐⭐    |
| **ステートレス性**   | ✅         | ❌             | ⚠️ 部分的 |

## JWT-based Session

### 詳細メリット

**スケーラビリティ**:

- サーバー側セッションストア不要 → 水平スケールが容易
- ロードバランサー不要（どのサーバーでも検証可能）
- サーバーレスアーキテクチャに最適

**パフォーマンス**:

- データベースアクセス不要 → レイテンシ削減
- メモリ使用量削減（サーバー側でセッション保持不要）
- トークン検証は高速（署名検証のみ）

**ステートレス性**:

- RESTful API設計に適合
- マイクロサービス間での認証情報共有が容易

### 詳細デメリット

**即座無効化の課題**:

- トークン有効期限まで無効化不可
- ログアウト後もトークンが有効（短い有効期限で軽減）
- セキュリティインシデント時の対応遅延

**ペイロードサイズ**:

- ユーザー情報増加でCookie肥大化
- 4KB制限に注意（Cookie サイズ上限）
- ネットワーク転送量増加

**セキュリティリスク**:

- トークン盗難時の影響が大きい
- リフレッシュトークンなしでは長期トークン必要 → リスク増

**動的権限変更**:

- ユーザーロール変更が即座に反映されない
- トークン再発行まで古い権限で動作

### 対策パターン

**即座無効化の代替案**:

```typescript
// トークンブラックリスト（Redis）
async function isTokenRevoked(jti: string): Promise<boolean> {
  return await redis.exists(`revoked:${jti}`);
}

async function revokeToken(jti: string, expiresIn: number): Promise<void> {
  await redis.setex(`revoked:${jti}`, expiresIn, "1");
}
```

**ペイロードサイズ削減**:

```typescript
// 最小情報のみJWTに含める
const jwtPayload = {
  sub: user.id, // ユーザーID
  role: user.role, // ロールのみ
  jti: tokenId, // トークンID
  exp: expiresAt, // 有効期限
};
// 詳細情報はDBから取得
```

## Database-based Session

### 詳細メリット

**即座無効化**:

- データベースから削除 → 即座に無効化
- すべてのサーバーで即座に反映
- セキュリティインシデント時の迅速対応

**動的権限変更**:

- ユーザーロール変更が即座に反映
- セッション情報を動的に更新可能

**詳細追跡**:

- セッション開始時刻、最終アクティビティ時刻
- IPアドレス、User-Agent、デバイス情報
- セッション履歴の完全な記録

### 詳細デメリット

**データベース負荷**:

- すべてのリクエストでDBアクセス → レイテンシ増加
- 高トラフィック時のボトルネック
- データベース接続プール管理が必要

**スケーラビリティ課題**:

- セッションストアのスケールが必要
- 分散システムでのセッション共有が複雑
- セッションレプリケーションのオーバーヘッド

**運用コスト**:

- セッションストレージの管理とメンテナンス
- 古いセッションのクリーンアップジョブ必要
- バックアップとリカバリー戦略が必要

### 対策パターン

**データベース負荷軽減**:

```typescript
// セッションキャッシュ（Redis）
async function getSession(sessionId: string): Promise<Session | null> {
  // Redisから取得
  let session = await redis.get(`session:${sessionId}`);

  if (!session) {
    // キャッシュミス → DBから取得
    session = await db.sessions.findOne({ id: sessionId });
    if (session) {
      // Redisにキャッシュ（TTL: 5分）
      await redis.setex(`session:${sessionId}`, 300, JSON.stringify(session));
    }
  }

  return session ? JSON.parse(session) : null;
}
```

**古いセッションクリーンアップ**:

```typescript
// Cron Job: 毎日実行
async function cleanupExpiredSessions(): Promise<void> {
  const cutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  await db.sessions.deleteMany({
    lastActivityAt: { $lt: cutoffDate },
  });

  console.log("Expired sessions cleaned up");
}
```

## Hybrid Session

### 実装パターン

**基本方針**:

- 頻繁にアクセスする情報 → JWT
- セキュリティ重要情報 → Database
- 重要操作時のみDB検証

**実装例**:

```typescript
// JWTに最小情報
interface JWTSession {
  userId: string;
  role: "ADMIN" | "USER" | "GUEST";
  sessionId: string; // DB参照用
  exp: number;
}

// 一般的な操作
async function checkBasicAuth(jwt: JWTSession): Promise<boolean> {
  // JWTのみで判断（高速）
  return jwt.role !== "GUEST";
}

// 重要操作（パスワード変更、決済等）
async function checkCriticalAuth(jwt: JWTSession): Promise<boolean> {
  // DB検証（セキュリティ優先）
  const session = await db.sessions.findOne({
    id: jwt.sessionId,
    active: true,
  });

  return session !== null && session.userId === jwt.userId;
}
```

## 選択ガイドライン

### JWT-based を選択すべき場合

- ✅ マイクロサービスアーキテクチャ
- ✅ サーバーレス環境
- ✅ 高トラフィック（>10,000 req/sec）
- ✅ 分散システム
- ❌ 即座ログアウトが必須
- ❌ 動的権限変更が頻繁

### Database-based を選択すべき場合

- ✅ 高セキュリティ要求
- ✅ 即座無効化が必須
- ✅ 詳細なセッション追跡が必要
- ✅ 動的権限変更が頻繁
- ❌ 高トラフィック
- ❌ データベース負荷を避けたい

### Hybrid を選択すべき場合

- ✅ 両方のメリットが必要
- ✅ 操作によってセキュリティレベルを変えたい
- ⚠️ 実装複雑度を許容できる
- ⚠️ メンテナンスコストを許容できる

## パフォーマンス最適化

### JWT-based の最適化

- ペイロードサイズ最小化（必要最小限の情報）
- 署名アルゴリズム選択（RS256推奨、HS256も可）
- トークンキャッシュ（同一リクエスト内での再利用）

### Database-based の最適化

- セッションキャッシュ（Redis等）
- インデックス最適化（sessionId、userId）
- 接続プール設定
- 読み取り専用レプリカ活用

### Hybrid の最適化

- 重要操作のみDB検証（コスト削減）
- DB検証結果のキャッシュ（短時間）
- 非同期検証（ユーザー体験優先）

## セキュリティ比較

### 盗難時の影響

**JWT-based**:

- 影響範囲: トークン有効期限まで
- 対策: 短い有効期限（15分-1時間）
- 無効化: ブラックリスト実装で可能（複雑）

**Database-based**:

- 影響範囲: 検出から無効化まで（数秒-数分）
- 対策: 即座無効化
- 無効化: シンプル（DBから削除）

### 権限昇格攻撃

**JWT-based**:

- リスク: トークン有効期限まで古い権限で動作
- 対策: 短い有効期限、critical操作時のDB検証

**Database-based**:

- リスク: 低（権限変更が即座に反映）
- 対策: セッション更新時に権限再読み込み

## まとめ

**選択のポイント**:

1. **スケーラビリティ優先** → JWT-based
2. **セキュリティ優先** → Database-based
3. **バランス型** → Hybrid

**推奨アプローチ**:

- 小-中規模アプリ: Database-based（シンプル、セキュア）
- 大規模アプリ: JWT-based + Redis blacklist（スケーラブル）
- エンタープライズ: Hybrid（要件に応じて使い分け）

**参照**:

- 実装テンプレート: `.claude/skills/session-management/templates/`
- セキュリティ対策: `.claude/skills/session-management/resources/session-security-measures.md`
