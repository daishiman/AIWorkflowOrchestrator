# SkillExecutor リトライ機構 - タスク指示書

## メタ情報

```yaml
issue_number: 584
```

## メタ情報

| 項目         | 内容                           |
| ------------ | ------------------------------ |
| タスクID     | TASK-SKILL-RETRY-001           |
| タスク名     | SkillExecutor リトライ機構実装 |
| 分類         | 改善                           |
| 対象機能     | SkillExecutor (Main Process)   |
| 優先度       | 中                             |
| 見積もり規模 | 中規模                         |
| ステータス   | 未実施                         |
| 発見元       | aiworkflow-requirements残課題  |
| 発見日       | 2026-01-30                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-1-A（SkillExecutor実装）でClaude Agent SDK query() API統合を完了したが、一時的なネットワーク障害やAPI rate limitに対するリトライ機構は未実装である。現在はエラー発生時に即座に失敗として処理される。

### 1.2 問題点・課題

- 一時的なネットワーク障害でスキル実行が失敗する
- API rate limit (429) 発生時に自動リトライされない
- タイムアウトエラー発生時のリカバリー手段がない
- ユーザーが手動で再実行する必要がある

### 1.3 放置した場合の影響

- ネットワーク不安定時のユーザー体験が低下
- API rate limit到達時に手動リトライが必要
- スキル実行の信頼性が低下
- エラー率が高くなりユーザー離脱につながる可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillExecutorにExponential Backoff with Jitterパターンのリトライ機構を実装し、一時的なエラーからの自動回復を可能にする。

### 2.2 最終ゴール

- 一時的なネットワークエラー（ECONNRESET, ETIMEDOUT）で自動リトライ
- API rate limit (429) 発生時にRetry-Afterヘッダーに基づくリトライ
- 設定可能なリトライ回数・間隔
- リトライ状態のストリーミング通知（UI側で表示可能）

### 2.3 スコープ

#### 含むもの

- SkillExecutorへのリトライロジック追加
- リトライ設定の型定義
- リトライ状態のストリーミングイベント追加
- ユニットテスト

#### 含まないもの

- 永続的なエラー（認証エラー、無効なリクエスト）のリトライ
- リトライ設定のUI
- リトライ履歴の永続化

### 2.4 成果物

| 成果物                   | ファイルパス                                                                 |
| ------------------------ | ---------------------------------------------------------------------------- |
| リトライロジック         | `apps/desktop/src/main/services/skill/SkillExecutor.ts` (更新)               |
| リトライ設定型           | `packages/shared/src/types/skill.ts` (追加)                                  |
| ストリーミングイベント型 | `packages/shared/src/types/skill.ts` (追加)                                  |
| ユニットテスト           | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-1-A（SkillExecutor実装）が完了していること
- Claude Agent SDK query() APIの使用方法を理解していること
- Exponential Backoff with Jitterパターンを理解していること

### 3.2 依存タスク

| タスクID   | タスク名          | 状態 |
| ---------- | ----------------- | ---- |
| TASK-3-1-A | SkillExecutor実装 | 完了 |

### 3.3 必要な知識

- Exponential Backoff with Jitterアルゴリズム
- HTTP エラーコード（429, 5xx）
- Node.js async/await パターン
- TypeScript 型定義

### 3.4 推奨アプローチ

1. リトライ対象エラーの定義（RetryableError型）
2. Exponential Backoff with Jitter実装
3. SkillExecutor.execute()へのリトライラッパー追加
4. リトライ状態のストリーミングイベント発行
5. テスト作成

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 目的                         |
| ----- | ------------ | ---------------------------- |
| 1     | 要件定義     | 詳細要件の明確化             |
| 2     | 設計         | リトライロジック設計         |
| 3     | 設計レビュー | 設計品質確認                 |
| 4     | テスト作成   | TDDによるテスト先行作成      |
| 5     | 実装         | リトライ機構実装             |
| 6-10  | 品質保証     | テスト拡充・リファクタリング |
| 11-13 | 完了処理     | 手動テスト・ドキュメント・PR |

### Phase 5: 実装

#### 目的

SkillExecutorにリトライ機構を追加する。

#### 手順

1. リトライ設定型を定義
   ```typescript
   interface RetryConfig {
     maxRetries: number; // デフォルト: 3
     baseDelayMs: number; // デフォルト: 1000
     maxDelayMs: number; // デフォルト: 30000
     retryableErrors: string[];
   }
   ```
2. isRetryableError()関数を実装
3. calculateBackoff()関数を実装（Exponential Backoff with Jitter）
4. SkillExecutor.executeWithRetry()メソッドを追加
5. ストリーミングイベント `skill:retry` を追加

#### 成果物

- 更新されたSkillExecutor.ts
- 追加された型定義

#### 完了条件

- リトライロジックが正しく動作する
- 設定可能なリトライ回数が機能する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ネットワークエラー（ECONNRESET）で自動リトライが行われる
- [ ] API rate limit (429) で自動リトライが行われる
- [ ] 5xxエラーで自動リトライが行われる
- [ ] 最大リトライ回数を超えたらエラーとして終了する
- [ ] リトライ間隔がExponential Backoff with Jitterで計算される
- [ ] `skill:retry`イベントがストリーミングで通知される

### 品質要件

- [ ] TypeScript strictモードでエラーなし
- [ ] ESLintエラーなし
- [ ] テストカバレッジ90%以上
- [ ] Prettierフォーマット済み

### ドキュメント要件

- [ ] RetryConfigのJSDocコメント
- [ ] リトライ対象エラー一覧の記載

---

## 6. 検証方法

### テストケース

| #   | テストケース        | 期待結果                       |
| --- | ------------------- | ------------------------------ |
| 1   | ECONNRESET発生時    | 自動リトライが行われる         |
| 2   | 429エラー発生時     | Retry-Afterに基づきリトライ    |
| 3   | 503エラー発生時     | 自動リトライが行われる         |
| 4   | 401エラー発生時     | リトライせず即座にエラー       |
| 5   | maxRetries到達時    | エラーとして終了               |
| 6   | リトライ成功時      | 正常にレスポンスが返る         |
| 7   | skill:retryイベント | UI側でリトライ状態を受信できる |

### 検証手順

1. ネットワーク障害をシミュレートするモックを作成
2. 各テストケースを実行
3. リトライ回数とバックオフ間隔を確認

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                                    |
| ------------------------ | ------ | -------- | --------------------------------------- |
| 無限リトライ             | 高     | 低       | maxRetriesで上限を設定                  |
| バックオフ間隔が長すぎる | 中     | 中       | maxDelayMsで上限を設定                  |
| リトライ中のユーザー操作 | 中     | 中       | abort()でリトライをキャンセル可能にする |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                     | パス                                                 |
| -------------------------------- | ---------------------------------------------------- |
| interfaces-agent-sdk-executor.md | `.claude/skills/aiworkflow-requirements/references/` |
| SkillExecutor実装仕様            | TASK-3-1-Aタスク成果物                               |

### 参考資料

- [Exponential Backoff And Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/) - AWSアーキテクチャブログ
- [Claude API Rate Limits](https://docs.anthropic.com/en/docs/rate-limits) - Anthropic公式ドキュメント

---

## 9. 備考

### アルゴリズム詳細

Exponential Backoff with Jitter:

```typescript
const delay = Math.min(
  maxDelayMs,
  baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000,
);
```

### 補足事項

- Retry-Afterヘッダーがある場合はそれを優先
- ユーザーがabort()を呼び出した場合はリトライを即座に中止
- リトライ回数はログに記録し、監視可能にする
