# 構造化ログ追加 - タスク指示書

## メタ情報

| 項目             | 内容                          |
| ---------------- | ----------------------------- |
| タスクID         | DEBT-CODE-001                 |
| タスク名         | 構造化ログ追加                |
| 分類             | リファクタリング              |
| 対象機能         | OAuth認証（Desktop）          |
| 優先度           | 低                            |
| 見積もり規模     | 小規模                        |
| ステータス       | 未実施                        |
| 発見元           | Phase 7（最終レビューゲート） |
| 発見日           | 2025-12-22                    |
| 発見エージェント | @code-quality                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在の認証関連ログは、単純な文字列ログのため、以下の問題があります：

- タイムスタンプが含まれていない
- コンテキスト情報（ユーザーID、プロバイダー等）が不明瞭
- ログの解析・フィルタリングが困難
- トラブルシューティング時の情報不足

ログイン機能復旧プロジェクト（2025-12-22完了）の最終レビューゲートで、@code-qualityが構造化ログの追加を推奨しました。

### 1.2 問題点・課題

**現在のログ（非構造化）**:

```typescript
console.error("[Auth] OAuth initiation failed:", error.message);
console.log("Auth callback processed successfully, user:", user.email);
```

**問題点**:

- タイムスタンプなし
- ログレベルが不明確
- 機密情報（トークン）のマスキングなし
- JSON形式ではないため、ログ解析ツールで処理困難

### 1.3 放置した場合の影響

| 影響領域               | 影響度 | 説明                           |
| ---------------------- | ------ | ------------------------------ |
| トラブルシューティング | Medium | 問題発生時の原因特定が困難     |
| セキュリティ監査       | Medium | 機密情報がログに露出する可能性 |
| 運用監視               | Low    | ログ解析・可視化が困難         |
| 保守性                 | Low    | ログの一貫性不足               |

---

## 2. 何を達成するか（What）

### 2.1 目的

認証関連ログを構造化し、タイムスタンプ・コンテキスト・レベルを含める。機密情報を自動的にマスキングする。

### 2.2 最終ゴール

- ✅ 構造化ロガーユーティリティ作成
- ✅ タイムスタンプ、コンテキスト、レベルを含むログ出力
- ✅ 機密情報（トークン、パスワード）の自動マスキング
- ✅ JSON形式ログ出力（本番環境）
- ✅ 人間が読みやすい形式（開発環境）

### 2.3 スコープ

#### 含むもの

- 構造化ロガー実装（logger.ts）
- 認証関連ファイルのログ置き換え
- 機密情報マスキング機能
- ログレベル管理（DEBUG/INFO/WARN/ERROR）

#### 含まないもの

- ログのリモート送信（将来対応）
- ログローテーション（将来対応）
- ログ解析ダッシュボード（将来対応）

### 2.4 成果物

| 種別   | 成果物              | 配置先                                                                 |
| ------ | ------------------- | ---------------------------------------------------------------------- |
| 実装   | 構造化ロガー        | `apps/desktop/src/main/utils/logger.ts`                                |
| 実装   | authHandlers.ts修正 | `apps/desktop/src/main/ipc/authHandlers.ts`                            |
| 実装   | index.ts修正        | `apps/desktop/src/main/index.ts`                                       |
| 実装   | useAuthState.ts修正 | `apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts` |
| テスト | logger単体テスト    | `apps/desktop/src/main/utils/logger.test.ts`                           |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] ログイン機能復旧プロジェクト（T-02-1〜T-09-1）が完了していること
- [ ] 既存の認証コードが正常に動作していること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- T-04-1: AuthGuard実装（完了済み）

**同時実施可能なタスク**:

- DEBT-CODE-002（エラーメッセージ一元管理）
- すべてのセキュリティ関連タスク

### 3.3 必要な知識・スキル

- TypeScript
- ログベストプラクティス
- JSON形式ログ
- Node.js console API

### 3.4 推奨アプローチ

1. **環境別出力**: 開発環境は人間が読みやすい形式、本番環境はJSON形式
2. **機密情報マスキング**: access_token、refresh_token等を自動検出してマスキング
3. **ログレベル**: DEBUG/INFO/WARN/ERRORの4レベル
4. **コンテキスト情報**: オブジェクト形式で構造化されたコンテキストを含める

---

## 4. 実行手順

### Phase構成

```
Phase 1: logger実装（TDD Red）
  ↓
Phase 2: 既存ログの置き換え
  ↓
Phase 3: TDD Green確認
  ↓
Phase 4: 手動テスト
```

---

### Phase 1: logger実装（TDD Red）

#### 目的

構造化ロガーユーティリティを実装し、単体テストでRed状態を確認する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@unit-tester 構造化ロガーを実装してください。

要件:
- ログレベル（DEBUG/INFO/WARN/ERROR）
- タイムスタンプ（ISO 8601）
- コンテキスト情報（オブジェクト形式）
- 機密情報マスキング（access_token, refresh_token, password, apiKey）
- 開発環境：人間が読みやすい形式
- 本番環境：JSON形式

テストケース:
1. ログにタイムスタンプが含まれる
2. コンテキスト情報が含まれる
3. 機密情報がマスキングされる（[REDACTED]）
4. ログレベルが正しく出力される

ファイル:
- apps/desktop/src/main/utils/logger.ts（新規）
- apps/desktop/src/main/utils/logger.test.ts（新規）
```

#### 使用エージェント

- **エージェント**: @unit-tester
- **選定理由**: 単体テスト作成とTDD実践の専門家。ユーティリティ実装に最適。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名             | 活用方法                           |
| -------------------- | ---------------------------------- |
| tdd-principles       | TDD Red-Green-Refactorサイクル実践 |
| clean-code-practices | 高品質なロガー実装                 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物           | パス                                         | 内容              |
| ---------------- | -------------------------------------------- | ----------------- |
| loggerモジュール | `apps/desktop/src/main/utils/logger.ts`      | 構造化ロガー実装  |
| logger単体テスト | `apps/desktop/src/main/utils/logger.test.ts` | 3テストケース以上 |

#### 完了条件

- [ ] logger.ts実装完了
- [ ] logger.test.ts実装完了
- [ ] テスト実行でRed状態確認
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 2: 既存ログの置き換え

#### 目的

認証関連ファイルの既存ログを構造化ログに置き換える。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@code-quality 認証関連ファイルのログを構造化ログに置き換えてください。

対象ファイル:
- apps/desktop/src/main/ipc/authHandlers.ts
- apps/desktop/src/main/index.ts
- apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts

置き換え例:
console.error("[Auth] OAuth initiation failed:", error.message);
↓
logger.error("OAuth initiation failed", { provider, errorCode: error.code }, error);
```

#### 使用エージェント

- **エージェント**: @code-quality
- **選定理由**: リファクタリングの専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名               | 活用方法                     |
| ---------------------- | ---------------------------- |
| refactoring-techniques | ログ置き換えリファクタリング |
| clean-code-practices   | コード品質改善               |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物              | パス                                                                   | 内容           |
| ------------------- | ---------------------------------------------------------------------- | -------------- |
| authHandlers.ts修正 | `apps/desktop/src/main/ipc/authHandlers.ts`                            | 構造化ログ使用 |
| index.ts修正        | `apps/desktop/src/main/index.ts`                                       | 構造化ログ使用 |
| useAuthState.ts修正 | `apps/desktop/src/renderer/components/AuthGuard/hooks/useAuthState.ts` | 構造化ログ使用 |

#### 完了条件

- [ ] 全ファイルのログ置き換え完了
- [ ] console.log/console.errorの直接使用がゼロ（認証関連）
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 3: TDD Green確認

#### 目的

リファクタリング後、全テストが成功することを確認する。

#### 実行コマンド

```bash
pnpm --filter @repo/desktop test:run
```

#### 完了条件

- [ ] 全テスト成功
- [ ] テストカバレッジ維持
- [ ] ESLint/TypeScriptエラーゼロ

---

### Phase 4: 手動テスト

#### 目的

実際の動作でログが正しく出力されることを確認する。

#### テストケース

| No  | カテゴリ     | テスト項目         | 操作手順               | 期待結果                             |
| --- | ------------ | ------------------ | ---------------------- | ------------------------------------ |
| 1   | 正常系       | ログイン成功ログ   | OAuth認証完了          | 構造化ログが出力される               |
| 2   | 異常系       | ログイン失敗ログ   | 不正な認証操作         | エラーログが構造化形式で出力される   |
| 3   | セキュリティ | 機密情報マスキング | トークンを含むログ出力 | トークンが[REDACTED]に置き換えられる |

#### 実行手順

1. `pnpm --filter @repo/desktop preview` でアプリを起動
2. ターミナルログを確認
3. OAuth認証を実行
4. ログ形式を確認（タイムスタンプ、コンテキスト、レベルが含まれること）
5. 機密情報がマスキングされることを確認

#### 完了条件

- [ ] 全3テストケースがPASS
- [ ] ターミナルログが構造化形式で出力される
- [ ] 機密情報が[REDACTED]でマスキングされる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] logger実装完了
- [ ] 既存ログの置き換え完了
- [ ] 機密情報マスキング実装完了

### 品質要件

- [ ] 全ユニットテスト成功（3テストケース以上）
- [ ] 全手動テスト成功（3テストケース）
- [ ] テストカバレッジ維持
- [ ] ESLint/TypeScriptエラーゼロ

### ドキュメント要件

- [ ] 必要に応じてディレクトリ構造ドキュメント更新

---

## 6. 検証方法

### テストケース

#### ユニットテスト（logger）

1. ログにタイムスタンプが含まれる
2. コンテキスト情報が含まれる
3. 機密情報がマスキングされる

### 検証手順

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test:run logger.test.ts

# 全テスト実行
pnpm --filter @repo/desktop test:run

# 手動確認
pnpm --filter @repo/desktop preview
# ターミナルでログ形式を確認
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                           | 対応サブタスク |
| -------------------------- | ------ | -------- | ------------------------------ | -------------- |
| ログ出力パフォーマンス低下 | Low    | Low      | 本番環境でJSON形式採用         | Phase 1        |
| マスキング対象キーの漏れ   | Medium | Medium   | テストで確認、必要に応じて追加 | Phase 4        |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/login-recovery/step11-final-review.md` - 最終レビュー結果

### 参考資料

- [Structured Logging Best Practices](https://www.datadoghq.com/knowledge-center/structured-logging/)
- [Node.js Logging Best Practices](https://nodejs.org/en/learn/diagnostics/logging)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
@code-quality:
"構造化ログの追加を推奨します。
 タイムスタンプ・コンテキストを含めることで、
 トラブルシューティングが容易になります。"
```

### 補足事項

- 将来的なログ解析ツール連携を考慮した構造
- 開発環境では絵文字を使用して視認性向上
- 本番環境ではJSON形式でログ集約システムに対応
