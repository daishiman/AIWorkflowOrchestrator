# ログイン履歴・監査ログ実装 - タスク指示書

## メタ情報

| 項目             | 内容                       |
| ---------------- | -------------------------- |
| タスクID         | AUDIT-001                  |
| タスク名         | ログイン履歴・監査ログ実装 |
| 分類             | 改善                       |
| 対象機能         | OAuth認証（Desktop）       |
| 優先度           | 低                         |
| 見積もり規模     | 中規模                     |
| ステータス       | 未実施                     |
| 発見元           | ユーザー要望（Phase 9）    |
| 発見日           | 2025-12-22                 |
| 発見エージェント | -                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

セキュリティ監査、不正アクセス検知、ユーザー行動分析のため、ログイン履歴と監査ログの記録が必要です。

### 1.2 問題点・課題

**現在の実装状態**:

- ログイン成功/失敗の記録なし
- IP address、User-Agentの記録なし
- 不正アクセス検知機能なし
- ログイン履歴のUI表示なし

**セキュリティ上の問題**:

- 不正アクセスがあっても検出できない
- ユーザーが自分のログイン履歴を確認できない
- セキュリティインシデント発生時の調査が困難

### 1.3 放置した場合の影響

| 影響領域         | 影響度 | 説明                                       |
| ---------------- | ------ | ------------------------------------------ |
| セキュリティ監査 | Medium | 監査証跡がないため、コンプライアンス違反   |
| インシデント対応 | High   | 不正アクセス検知・調査が困難               |
| ユーザー体験     | Low    | ユーザーが自分のログイン履歴を確認できない |

---

## 2. 何を達成するか（What）

### 2.1 目的

ログイン履歴・監査ログを記録し、セキュリティ監査と不正アクセス検知を可能にする。

### 2.2 最終ゴール

- ✅ ログイン成功/失敗の記録
- ✅ IP address、User-Agent、デバイス情報の記録
- ✅ ログイン履歴のDB保存
- ✅ ログイン履歴UI表示（Settings画面）
- ✅ 不正アクセス検知（異常な場所からのログイン等）

### 2.3 スコープ

#### 含むもの

- ログイン履歴テーブル作成（auth_logs）
- ログイン時の監査ログ記録
- ログイン履歴UI実装
- 不正アクセス検知ロジック（基本版）

#### 含まないもの

- 詳細な不正検知（機械学習等、将来対応）
- ログの長期保存・アーカイブ（将来対応）
- ログ解析ダッシュボード（将来対応）

### 2.4 成果物

| 種別             | 成果物                     | 配置先                                                        |
| ---------------- | -------------------------- | ------------------------------------------------------------- |
| 実装             | auth_logsテーブル          | `packages/shared/infrastructure/database/schema/auth_logs.ts` |
| 実装             | auditLogger実装            | `apps/desktop/src/main/services/auditLogger.ts`               |
| 実装             | authHandlers.ts修正        | `apps/desktop/src/main/ipc/authHandlers.ts`                   |
| 実装             | LoginHistoryコンポーネント | `apps/desktop/src/renderer/components/LoginHistory/`          |
| マイグレーション | auth_logsテーブル作成      | `packages/shared/infrastructure/database/migrations/`         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] ログイン機能復旧プロジェクト（T-02-1〜T-09-1）が完了していること
- [ ] OAuth認証が正常に動作していること
- [ ] Drizzle ORM環境が整っていること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- T-04-1: AuthGuard実装（完了済み）

**推奨（先に完了推奨）**:

- DEBT-CODE-001（構造化ログ）

**同時実施可能なタスク**:

- すべてのセキュリティ関連タスク
- UX-001、UX-002

### 3.3 必要な知識・スキル

- Drizzle ORM（スキーマ定義、マイグレーション）
- セキュリティ監査ログの設計
- React コンポーネント実装
- IP address取得（Electron）

### 3.4 推奨アプローチ

1. **DBスキーマ設計**: auth_logsテーブルにログイン情報を記録
2. **監査ログ記録**: ログイン成功/失敗時に自動的に記録
3. **UI実装**: Settings画面にログイン履歴を表示
4. **異常検知**: 異常な場所/デバイスからのログインを検出

---

## 4. 実行手順

### Phase構成

```
Phase 1: auth_logsテーブル作成（マイグレーション）
  ↓
Phase 2: auditLogger実装
  ↓
Phase 3: authHandlers修正（監査ログ記録）
  ↓
Phase 4: LoginHistoryコンポーネント実装
  ↓
Phase 5: テスト実行
```

---

### Phase 1: auth_logsテーブル作成

#### 目的

ログイン履歴を保存するためのauth_logsテーブルをDrizzle ORMで作成する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@db-architect auth_logsテーブルを作成してください。

スキーマ:
- id (UUID, primary key)
- user_id (UUID, foreign key)
- provider (google/github/discord)
- event_type (LOGIN_SUCCESS/LOGIN_FAILED/LOGOUT)
- ip_address (TEXT)
- user_agent (TEXT)
- device_info (TEXT)
- location (TEXT, optional)
- created_at (TIMESTAMP)

ファイル:
- packages/shared/infrastructure/database/schema/auth_logs.ts（新規）
- packages/shared/infrastructure/database/migrations/xxx_create_auth_logs.ts（新規）
```

#### 使用エージェント

- **エージェント**: .claude/agents/db-architect.md
- **選定理由**: データベース設計の専門家。スキーマ設計とマイグレーション作成に最適。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名               | 活用方法               |
| ---------------------- | ---------------------- |
| .claude/skills/database-normalization/SKILL.md | 適切なスキーマ設計     |
| .claude/skills/indexing-strategies/SKILL.md    | 検索パフォーマンス向上 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物            | パス                                                          | 内容                  |
| ----------------- | ------------------------------------------------------------- | --------------------- |
| auth_logsスキーマ | `packages/shared/infrastructure/database/schema/auth_logs.ts` | テーブル定義          |
| マイグレーション  | `packages/shared/infrastructure/database/migrations/`         | auth_logsテーブル作成 |

#### 完了条件

- [ ] auth_logsスキーマ定義完了
- [ ] マイグレーション作成完了
- [ ] マイグレーション実行成功
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 2: auditLogger実装

#### 目的

ログイン イベントを記録するauditLoggerサービスを実装する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@logic-dev auditLoggerサービスを実装してください。

要件:
- logLoginSuccess()メソッド
- logLoginFailed()メソッド
- logLogout()メソッド
- IP address/User-Agent取得
- auth_logsテーブルへの保存

ファイル: apps/desktop/src/main/services/auditLogger.ts（新規）
```

#### 使用エージェント

- **エージェント**: .claude/agents/logic-dev.md
- **選定理由**: ビジネスロジック実装の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名             | 活用方法             |
| -------------------- | -------------------- |
| .claude/skills/clean-code-practices/SKILL.md | 高品質なサービス実装 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物          | パス                                            | 内容                 |
| --------------- | ----------------------------------------------- | -------------------- |
| auditLogger実装 | `apps/desktop/src/main/services/auditLogger.ts` | 監査ログ記録サービス |

#### 完了条件

- [ ] auditLogger.ts実装完了
- [ ] logLoginSuccess/Failed/Logout実装完了
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 3: authHandlers修正（監査ログ記録）

#### 目的

認証ハンドラーにauditLoggerを統合し、ログイン イベントを自動記録する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@auth-specialist authHandlers.tsを修正して監査ログ記録を追加してください。

修正内容:
- auditLoggerをインポート
- ログイン成功時にlogLoginSuccess()呼び出し
- ログイン失敗時にlogLoginFailed()呼び出し
- ログアウト時にlogLogout()呼び出し

ファイル: apps/desktop/src/main/ipc/authHandlers.ts
```

#### 使用エージェント

- **エージェント**: .claude/agents/auth-specialist.md
- **選定理由**: 認証フローの専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名     | 活用方法                    |
| ------------ | --------------------------- |
| .claude/skills/oauth2-flows/SKILL.md | OAuth認証フローへの監査追加 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物              | パス                                        | 内容             |
| ------------------- | ------------------------------------------- | ---------------- |
| authHandlers.ts修正 | `apps/desktop/src/main/ipc/authHandlers.ts` | 監査ログ記録追加 |

#### 完了条件

- [ ] auditLogger呼び出し追加
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 4: LoginHistoryコンポーネント実装

#### 目的

Settings画面にログイン履歴を表示するUIを実装する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@ui-designer LoginHistoryコンポーネントを実装してください。

要件:
- ログイン履歴一覧表示
- プロバイダー、日時、IP address、デバイス情報表示
- 最新10件表示（ページネーション）
- 異常なログインは警告表示

ファイル: apps/desktop/src/renderer/components/LoginHistory/（新規）
```

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: UIコンポーネント実装の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名              | 活用方法                   |
| --------------------- | -------------------------- |
| .claude/skills/custom-hooks-patterns/SKILL.md | Reactカスタムフック実装    |
| .claude/skills/clean-code-practices/SKILL.md  | 高品質なコンポーネント実装 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                     | パス                                                 | 内容           |
| -------------------------- | ---------------------------------------------------- | -------------- |
| LoginHistoryコンポーネント | `apps/desktop/src/renderer/components/LoginHistory/` | ログイン履歴UI |

#### 完了条件

- [ ] LoginHistory実装完了
- [ ] ログイン履歴表示実装完了
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 5: テスト実行

#### 目的

監査ログ記録とUI表示が正しく動作することを確認する。

#### テストケース

| No  | カテゴリ | テスト項目           | 操作手順                       | 期待結果                      |
| --- | -------- | -------------------- | ------------------------------ | ----------------------------- |
| 1   | 正常系   | ログイン成功ログ記録 | OAuth認証でログイン            | auth_logsテーブルに記録される |
| 2   | 正常系   | ログイン履歴UI表示   | Settings画面でログイン履歴表示 | 最新10件が表示される          |
| 3   | 正常系   | ログアウトログ記録   | ログアウト実行                 | auth_logsテーブルに記録される |

#### 完了条件

- [ ] 全3テストケースがPASS
- [ ] auth_logsテーブルにログが記録される
- [ ] UI で履歴が正しく表示される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] auth_logsテーブル作成完了
- [ ] auditLogger実装完了
- [ ] authHandlers監査ログ記録完了
- [ ] LoginHistory UI実装完了

### 品質要件

- [ ] 全手動テスト成功（3テストケース）
- [ ] マイグレーション実行成功
- [ ] ESLint/TypeScriptエラーゼロ

### ドキュメント要件

- [ ] データベース設計ドキュメント更新

---

## 6. 検証方法

### テストケース

#### 統合テスト

1. ログイン成功時にauth_logsに記録される
2. ログイン失敗時にauth_logsに記録される
3. ログアウト時にauth_logsに記録される

### 検証手順

```bash
# マイグレーション実行
pnpm --filter @repo/shared db:migrate

# アプリ起動
pnpm --filter @repo/desktop preview

# OAuth認証でログイン
# Settings画面でログイン履歴を確認
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                           | 対応サブタスク |
| -------------------------- | ------ | -------- | ------------------------------ | -------------- |
| ログの肥大化               | Medium | High     | 定期的なログローテーション実装 | Phase 1        |
| IP address取得失敗         | Low    | Medium   | エラーハンドリング実装         | Phase 2        |
| プライバシー懸念（IP記録） | Medium | Low      | プライバシーポリシー明記       | Phase 4        |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/15-database-design.md` - データベース設計
- `docs/00-requirements/17-security-guidelines.md` - セキュリティガイドライン

### 参考資料

- [Audit Logging Best Practices](https://www.owasp.org/index.php/Logging_Cheat_Sheet)
- [GDPR Compliance for Logging](https://gdpr.eu/data-processing/)

---

## 9. 備考

### 補足事項

- ログは個人情報（IP address等）を含むため、プライバシーポリシーに明記
- ログ保存期間は90日を推奨（調整可能）
- 異常なログイン検知の基準は、ユーザーの通常の利用パターンに基づいて調整
- ログイン履歴はユーザー自身のみ閲覧可能（管理者権限なし）
