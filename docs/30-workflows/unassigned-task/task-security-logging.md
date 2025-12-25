# セキュリティログ機能実装 - タスク指示書

## メタ情報

| 項目             | 内容                               |
| ---------------- | ---------------------------------- |
| タスクID         | SECURITY-004                       |
| タスク名         | セキュリティイベントログ機能の実装 |
| 分類             | セキュリティ                       |
| 対象機能         | chat-history（監査ログ）           |
| 優先度           | 低                                 |
| 見積もり規模     | 小規模                             |
| ステータス       | 未実施                             |
| 発見元           | Phase 6 - セキュリティ監査         |
| 発見日           | 2024-12-23                         |
| 発見エージェント | .claude/agents/sec-auditor.md      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

セキュリティ監査（T-06-2）で、セキュリティイベントのログ記録が不足していることが指摘されました：

**OWASP A09: Security Logging and Monitoring Failures** に関連する推奨事項：

現状、以下のセキュリティイベントがログ記録されていません：

- セッション作成/削除
- 認証試行（将来機能）
- エクスポート操作
- 認可失敗（SECURITY-001実装後）

### 1.2 問題点・課題

1. **監査証跡の欠如**: セキュリティインシデント発生時の調査が困難
2. **不正アクセス検出の遅延**: 異常なアクセスパターンの検出ができない
3. **コンプライアンスリスク**: 規制要件（GDPR等）への対応が不十分

### 1.3 放置した場合の影響

**セキュリティ影響度**: Info（推奨事項レベル）

- **インシデント対応の遅延**: 不正アクセスの事後調査が困難
- **コンプライアンス違反**: 監査ログ要件を満たせない（規制対象の場合）
- **運用可視性の低下**: システムの使用状況が不透明

**緩和要因**:

- デスクトップアプリでローカル実行（外部攻撃リスク低）
- 現時点で規制対象外
- シングルユーザー環境で監査ニーズ低

**将来ニーズ**:

- マルチユーザー環境では必須
- クラウド版リリース時に監査ログが規制要件となる可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

セキュリティイベント（セッション操作、認可失敗、エクスポート等）を構造化ログとして記録し、OWASP A09への対応を強化する。

### 2.2 最終ゴール

- ✅ SecurityLoggerクラスが実装されている
- ✅ 主要なセキュリティイベントがログ記録されている
- ✅ ログが構造化されている（JSON形式）
- ✅ ログローテーション機構が実装されている
- ✅ ログ検索機能が実装されている（基本的なgrep可能レベル）

### 2.3 スコープ

#### 含むもの

- SecurityLoggerクラスの実装
- 以下のイベントログ記録：
  - セッション作成 (`session_created`)
  - セッション削除 (`session_deleted`)
  - セッション更新 (`session_updated`)
  - エクスポート実行 (`export_performed`)
  - 認可失敗 (`authorization_failed`)
- ログファイル出力（JSON Lines形式）
- ログローテーション（サイズベース）

#### 含まないもの

- 中央集約ログ管理（Elasticsearch等）
- リアルタイムアラート
- ログ分析・可視化ツール
- 外部SIEMサービス連携

### 2.4 成果物

| 種別         | 成果物               | 配置先                                                                |
| ------------ | -------------------- | --------------------------------------------------------------------- |
| 機能         | SecurityLoggerクラス | `packages/shared/src/lib/security-logger.ts`                          |
| 機能         | ログローテーション   | `packages/shared/src/lib/log-rotation.ts`                             |
| テスト       | ログ記録テスト       | `packages/shared/src/lib/__tests__/security-logger.test.ts`           |
| ドキュメント | ログ仕様書           | `docs/30-workflows/chat-history-persistence/security-logging-spec.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- セキュリティ監査（T-06-2）が完了していること
- アクセス制御強化（SECURITY-001）が実装されていること（推奨）

### 3.2 依存タスク

- T-06-2: セキュリティ監査（完了）
- SECURITY-001: アクセス制御強化（推奨）

### 3.3 必要な知識・スキル

- ログ記録のベストプラクティス
- JSON Lines形式
- Node.js fs/promises
- ログローテーション戦略

### 3.4 推奨アプローチ

**ログ形式**: JSON Lines（NDJSON）

```json
{"timestamp":"2024-12-23T13:45:00.000Z","level":"info","event":"session_created","userId":"user-001","targetId":"session-123","metadata":{}}
{"timestamp":"2024-12-23T13:50:00.000Z","level":"warn","event":"authorization_failed","userId":"user-002","targetId":"session-123","metadata":{"reason":"not_owner"}}
```

**ログローテーション**: サイズベース（10MB）

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義（ログ要件）
Phase 1: 設計（ログ形式・ローテーション設計）
Phase 2: 設計レビューゲート
Phase 3: テスト作成（TDD: Red）
Phase 4: 実装（TDD: Green）
Phase 5: リファクタリング
Phase 6: 品質保証
Phase 7: 最終レビューゲート
Phase 8: 手動テスト検証
Phase 9: ドキュメント更新
```

---

### Phase 0-3: 要件定義～テスト作成（簡略記載）

各フェーズの詳細は、実行時に担当エージェントが判断します。

---

### Phase 4: 実装（TDD: Green）

#### T-04-1: SecurityLoggerクラス実装

##### 目的

セキュリティイベントを構造化ログとして記録するクラスを実装する。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:implement-business-logic security-logger
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/sre-observer.md`
- **選定理由**: ログ記録・監視の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                        | 活用方法               |
| ----------------------------------------------- | ---------------------- |
| .claude/skills/log-rotation-strategies/SKILL.md | ログローテーション実装 |
| .claude/skills/metrics-tracking/SKILL.md        | ログイベント定義       |
| .claude/skills/clean-code-practices/SKILL.md    | 可読性の高い実装       |

- **参照**: `.claude/skills/skill_list.md`

##### 成果物

| 成果物               | パス                                         | 内容               |
| -------------------- | -------------------------------------------- | ------------------ |
| SecurityLoggerクラス | `packages/shared/src/lib/security-logger.ts` | ログ記録機能       |
| ログローテーション   | `packages/shared/src/lib/log-rotation.ts`    | ローテーション機能 |

##### 実装例

```typescript
interface SecurityEvent {
  timestamp: string;
  level: "info" | "warn" | "error";
  event:
    | "session_created"
    | "session_deleted"
    | "export_performed"
    | "authorization_failed";
  userId: string;
  targetId: string;
  metadata: Record<string, unknown>;
}

class SecurityLogger {
  private logFilePath: string;

  constructor(logFilePath: string) {
    this.logFilePath = logFilePath;
  }

  async log(event: SecurityEvent): Promise<void> {
    const logLine = JSON.stringify(event) + "\n";
    await fs.appendFile(this.logFilePath, logLine, "utf-8");
    await this.rotateIfNeeded();
  }

  private async rotateIfNeeded(): Promise<void> {
    // ログファイルが10MBを超えたらローテーション
  }
}
```

##### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test:run security-logger
```

- [ ] すべてのテストが成功することを確認（Green状態）

##### 完了条件

- [ ] SecurityLoggerクラスが実装されている
- [ ] JSON Lines形式でログ出力される
- [ ] ログローテーションが実装されている
- [ ] すべてのテストが成功している

##### 依存関係

- **前提**: T-03-1
- **後続**: T-04-2

---

#### T-04-2: サービス層へのログ統合

##### 目的

chat-history-service の各メソッドにログ記録を組み込む。

##### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:implement-business-logic logging-integration
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/logic-dev.md`
- **選定理由**: ビジネスロジック層への統合実装の専門家
- **参照**: `.claude/agents/agent_list.md`

##### 実装対象メソッド

```typescript
// ログ記録を追加するメソッド
async createSession(userId: string, options?: CreateSessionOptions): Promise<ChatSession>
async deleteSession(id: string, requestUserId: string): Promise<boolean>
async updateSession(id: string, requestUserId: string, data: UpdateChatSession): Promise<boolean>
async exportToMarkdown(sessionId: string, requestUserId: string, options?: ExportOptions): Promise<string>
async exportToJson(sessionId: string, requestUserId: string, options?: ExportOptions): Promise<string>
```

##### 完了条件

- [ ] 全対象メソッドにログ記録が追加されている
- [ ] ログが適切なタイミングで記録される（成功時のみ/失敗時も）
- [ ] すべてのテストが成功している

##### 依存関係

- **前提**: T-04-1
- **後続**: T-05-1

---

### Phase 5-9: リファクタリング～ドキュメント更新（簡略記載）

各フェーズは標準的な流れに従います。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SecurityLoggerクラスが実装されている
- [ ] 主要セキュリティイベントがログ記録されている
- [ ] ログが構造化されている（JSON Lines）
- [ ] ログローテーション機能が実装されている

### 品質要件

- [ ] 全ユニットテスト成功
- [ ] ログ機能のカバレッジ100%
- [ ] パフォーマンス影響が最小限（<1%）

### ドキュメント要件

- [ ] ログ仕様書が作成されている
- [ ] システムドキュメントが更新されている

---

## 6. 検証方法

### ログ出力確認

```bash
# ログファイルの確認
cat ~/.local/share/AIWorkflowOrchestrator/logs/security.log

# JSON形式の検証
jq . ~/.local/share/AIWorkflowOrchestrator/logs/security.log
```

### ログ検索テスト

```bash
# 特定ユーザーのログを検索
grep '"userId":"user-001"' security.log

# 認可失敗イベントのみ検索
grep '"event":"authorization_failed"' security.log
```

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                           |
| ---------------------------- | ------ | -------- | ------------------------------ |
| ログ肥大化によるディスク圧迫 | 中     | 中       | ログローテーション、圧縮機能   |
| パフォーマンス劣化           | 低     | 低       | 非同期書き込み、バッファリング |
| ログ情報の機密性             | 中     | 低       | ログ暗号化、アクセス制御       |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/chat-history-persistence/security-audit-report.md` - セキュリティ監査レポート
- `.claude/agents/sre-observer.md` - SREエージェント
- `.claude/skills/log-rotation-strategies/SKILL.md` - ログローテーション戦略

### 参考資料

- [OWASP A09: Security Logging Failures](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/)
- [OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)
- [JSON Lines](https://jsonlines.org/)

---

## 9. 備考

### レビュー指摘の原文

```
### 4. A09: セキュリティログの不足（Info）

**重大度**: Info（推奨事項）

**現状**: セキュリティイベントの明示的なログ記録なし

**推奨対策**:
セキュリティイベントロガーの実装
```

### 補足事項

**ログ記録のベストプラクティス**:

1. **記録すべきイベント**: 認証試行、認可失敗、機密データアクセス、設定変更
2. **記録すべき情報**: タイムスタンプ、イベント種別、ユーザーID、対象リソース、結果
3. **記録すべきでない情報**: パスワード、トークン、APIキー等の機密情報

**将来拡張**:

- 外部ログ管理サービス（Datadog, Splunk）への送信
- リアルタイムアラート（異常パターン検出時）
- ログ分析・可視化ダッシュボード
