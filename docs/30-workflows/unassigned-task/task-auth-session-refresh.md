# セッション自動リフレッシュ実装 - タスク指示書

## メタ情報

| 項目             | 内容                           |
| ---------------- | ------------------------------ |
| タスクID         | UX-002                         |
| タスク名         | セッション自動リフレッシュ実装 |
| 分類             | 改善                           |
| 対象機能         | OAuth認証（Desktop）           |
| 優先度           | 中                             |
| 見積もり規模     | 中規模                         |
| ステータス       | 未実施                         |
| 発見元           | ユーザー要望（Phase 9）        |
| 発見日           | 2025-12-22                     |
| 発見エージェント | -                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在の実装では、Access Tokenの有効期限が切れると、ユーザーが再ログインする必要があります。ユーザー体験を向上させるため、有効期限切れ前に自動的にトークンをリフレッシュする機能が必要です。

### 1.2 問題点・課題

**現在の実装状態**:

- Access Tokenの有効期限: 1時間
- 有効期限切れ時: ユーザーが手動で再ログイン
- Refresh Tokenは保存されているが、自動リフレッシュ機能なし

**ユーザー体験の問題**:

- アプリ使用中に突然ログアウトされる
- 作業が中断される
- 再ログイン操作が必要

### 1.3 放置した場合の影響

| 影響領域     | 影響度 | 説明                                   |
| ------------ | ------ | -------------------------------------- |
| ユーザー体験 | High   | 頻繁な再ログインでユーザーストレス増加 |
| 生産性       | Medium | 作業中断による生産性低下               |
| 離脱率       | Medium | 煩雑さによるアプリ使用離脱の可能性     |

---

## 2. 何を達成するか（What）

### 2.1 目的

Access Token有効期限切れ前に自動的にRefresh Tokenを使用してトークンをリフレッシュし、ユーザーの作業を中断させない。

### 2.2 最終ゴール

- ✅ Access Token有効期限の監視
- ✅ 有効期限5分前に自動リフレッシュ開始
- ✅ バックグラウンドでトークンリフレッシュ実行
- ✅ リフレッシュ失敗時の適切なハンドリング
- ✅ ユーザーへの通知（オプション）

### 2.3 スコープ

#### 含むもの

- トークンリフレッシュスケジューラー実装
- authSlice修正（自動リフレッシュロジック）
- リフレッシュ失敗時のフォールバック処理
- ユニットテスト追加

#### 含まないもの

- ログイン履歴記録（AUDIT-001として別タスク）
- オフライン時の動作（別タスク）

### 2.4 成果物

| 種別   | 成果物                          | 配置先                                                         |
| ------ | ------------------------------- | -------------------------------------------------------------- |
| 実装   | TokenRefreshScheduler           | `apps/desktop/src/main/services/tokenRefreshScheduler.ts`      |
| 実装   | authHandlers.ts修正             | `apps/desktop/src/main/ipc/authHandlers.ts`                    |
| 実装   | authSlice修正                   | `apps/desktop/src/renderer/store/slices/authSlice.ts`          |
| テスト | TokenRefreshScheduler単体テスト | `apps/desktop/src/main/services/tokenRefreshScheduler.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] ログイン機能復旧プロジェクト（T-02-1〜T-09-1）が完了していること
- [ ] OAuth認証が正常に動作していること
- [ ] Refresh Tokenが正しく保存されていること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- T-04-1: AuthGuard実装（完了済み）
- T-06-1: 品質保証（完了済み）

**同時実施可能なタスク**:

- UX-001（エラーUX改善）
- すべての技術的負債タスク

### 3.3 必要な知識・スキル

- TypeScript
- setInterval/setTimeoutによるスケジューリング
- Supabase Auth refresh API
- Electron Main Process
- Zustand状態管理

### 3.4 推奨アプローチ

1. **有効期限監視**: Access Tokenのexpiresを監視し、5分前にリフレッシュ開始
2. **バックグラウンド処理**: ユーザーの操作を妨げないよう非同期で実行
3. **エラーハンドリング**: リフレッシュ失敗時はログアウトまたはリトライ
4. **タイマー管理**: アプリ終了時にタイマーをクリーンアップ

---

## 4. 実行手順

### Phase構成

```
Phase 1: TokenRefreshScheduler実装（TDD Red）
  ↓
Phase 2: authSlice修正（自動リフレッシュ連携）
  ↓
Phase 3: TDD Green確認
  ↓
Phase 4: 手動テスト
```

---

### Phase 1: TokenRefreshScheduler実装（TDD Red）

#### 目的

トークンリフレッシュをスケジュールするサービスを実装し、単体テストでRed状態を確認する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@unit-tester TokenRefreshSchedulerを実装してください。

要件:
- Access Token有効期限の監視
- 有効期限5分前にリフレッシュ開始
- setTimeoutによるスケジューリング
- スケジューラーのstart/stop/reset機能
- リフレッシュ失敗時のコールバック

テストケース:
1. スケジューラー開始
2. 有効期限5分前にコールバック実行
3. スケジューラー停止
4. スケジューラーリセット

ファイル:
- apps/desktop/src/main/services/tokenRefreshScheduler.ts（新規）
- apps/desktop/src/main/services/tokenRefreshScheduler.test.ts（新規）
```

#### 使用エージェント

- **エージェント**: @unit-tester
- **選定理由**: サービス実装とTDD実践の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名             | 活用方法                           |
| -------------------- | ---------------------------------- |
| tdd-principles       | TDD Red-Green-Refactorサイクル実践 |
| clean-code-practices | 高品質なサービス実装               |
| test-doubles         | Vitest vi.useFakeTimers()活用      |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                          | パス                                                           | 内容                               |
| ------------------------------- | -------------------------------------------------------------- | ---------------------------------- |
| TokenRefreshScheduler実装       | `apps/desktop/src/main/services/tokenRefreshScheduler.ts`      | トークンリフレッシュスケジューラー |
| TokenRefreshScheduler単体テスト | `apps/desktop/src/main/services/tokenRefreshScheduler.test.ts` | 4テストケース以上                  |

#### 完了条件

- [ ] tokenRefreshScheduler.ts実装完了
- [ ] tokenRefreshScheduler.test.ts実装完了
- [ ] テスト実行でRed状態確認
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 2: authSlice修正（自動リフレッシュ連携）

#### 目的

ログイン成功時にTokenRefreshSchedulerを開始し、自動リフレッシュを有効化する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@auth-specialist authSliceを修正して自動リフレッシュを追加してください。

修正内容:
- ログイン成功時にTokenRefreshSchedulerを開始
- リフレッシュコールバックでauth:refresh IPC呼び出し
- ログアウト時にスケジューラーを停止

ファイル:
- apps/desktop/src/renderer/store/slices/authSlice.ts（修正）
- apps/desktop/src/main/ipc/authHandlers.ts（修正）
```

#### 使用エージェント

- **エージェント**: @auth-specialist
- **選定理由**: 認証状態管理の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名      | 活用方法                          |
| ------------- | --------------------------------- |
| state-lifting | Zustand状態管理とIPC連携          |
| oauth2-flows  | OAuth 2.0トークンリフレッシュ実装 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物              | パス                                                  | 内容                         |
| ------------------- | ----------------------------------------------------- | ---------------------------- |
| authSlice修正       | `apps/desktop/src/renderer/store/slices/authSlice.ts` | 自動リフレッシュロジック追加 |
| authHandlers.ts修正 | `apps/desktop/src/main/ipc/authHandlers.ts`           | リフレッシュIPC実装          |

#### 完了条件

- [ ] authSlice修正完了
- [ ] TokenRefreshScheduler連携完了
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 3: TDD Green確認

#### 目的

実装完了後、全テストが成功することを確認する。

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

実際のアプリ使用で自動リフレッシュが正しく動作することを確認する。

#### テストケース

| No  | カテゴリ | テスト項目                       | 操作手順                          | 期待結果                         |
| --- | -------- | -------------------------------- | --------------------------------- | -------------------------------- |
| 1   | 正常系   | 自動リフレッシュ成功             | ログイン後55分待機                | 自動的にトークンリフレッシュ     |
| 2   | 異常系   | リフレッシュ失敗                 | Refresh Token削除してリフレッシュ | ログアウトまたはログイン画面表示 |
| 3   | 正常系   | ログアウト時のスケジューラー停止 | ログアウト実行                    | スケジューラーが停止             |

#### 実行手順

1. `pnpm --filter @repo/desktop preview` でアプリを起動
2. OAuth認証でログイン
3. ターミナルログでスケジューラー開始を確認
4. 55分待機（またはシステム時刻を変更してテスト）
5. 自動リフレッシュが実行されることを確認

#### 完了条件

- [ ] 全3テストケースがPASS
- [ ] ターミナルログで「Token refreshed automatically」が出力される
- [ ] リフレッシュ失敗時に適切にハンドリングされる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] TokenRefreshScheduler実装完了
- [ ] 自動リフレッシュロジック実装完了
- [ ] リフレッシュ失敗時のハンドリング実装完了

### 品質要件

- [ ] 全ユニットテスト成功（4テストケース以上）
- [ ] 全手動テスト成功（3テストケース）
- [ ] テストカバレッジ維持
- [ ] ESLint/TypeScriptエラーゼロ

### ドキュメント要件

- [ ] 必要に応じてアーキテクチャドキュメント更新

---

## 6. 検証方法

### テストケース

#### ユニットテスト（TokenRefreshScheduler）

1. スケジューラー開始
2. 有効期限5分前にコールバック実行
3. スケジューラー停止
4. スケジューラーリセット

### 検証手順

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test:run tokenRefreshScheduler.test.ts

# 全テスト実行
pnpm --filter @repo/desktop test:run

# 手動確認
pnpm --filter @repo/desktop preview
# 55分待機して自動リフレッシュを確認
```

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                 | 対応サブタスク |
| ---------------------------------- | ------ | -------- | ------------------------------------ | -------------- |
| リフレッシュ時のネットワークエラー | High   | Medium   | リトライロジック実装、オフライン検出 | Phase 2        |
| タイマーのメモリリーク             | Medium | Low      | アプリ終了時にタイマークリーンアップ | Phase 1        |
| 有効期限の判定ロジック不正確       | Medium | Low      | ユニットテストで確認                 | Phase 1        |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/ipc/authHandlers.ts` - 既存認証ハンドラー
- `apps/desktop/src/renderer/store/slices/authSlice.ts` - 認証状態管理
- `docs/00-requirements/17-security-guidelines.md` - セキュリティガイドライン

### 参考資料

- [OAuth 2.0 Token Refresh](https://datatracker.ietf.org/doc/html/rfc6749#section-6)
- [Supabase Auth Refresh](https://supabase.com/docs/reference/javascript/auth-refreshsession)

---

## 9. 備考

### 補足事項

- リフレッシュのタイミングは有効期限の5分前を推奨（調整可能）
- バックグラウンドで実行するため、ユーザー操作を妨げない
- リフレッシュ失敗時は、ユーザーに分かりやすいメッセージを表示してログイン画面に遷移
- オフライン時のリフレッシュ失敗は許容し、オンライン復帰時にリトライ
