# State parameter検証実装（CSRF対策） - タスク指示書

## メタ情報

| 項目             | 内容                                |
| ---------------- | ----------------------------------- |
| タスクID         | DEBT-SEC-001                        |
| タスク名         | State parameter検証実装（CSRF対策） |
| 分類             | セキュリティ                        |
| 対象機能         | OAuth認証（Desktop）                |
| 優先度           | 中                                  |
| 見積もり規模     | 小規模                              |
| ステータス       | 未実施                              |
| 発見元           | Phase 7（最終レビューゲート）       |
| 発見日           | 2025-12-22                          |
| 発見エージェント | .claude/agents/sec-auditor.md, .claude/agents/electron-security.md    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ログイン機能復旧プロジェクト（2025-12-22完了）の最終レビューゲートで、.claude/agents/sec-auditor.mdと.claude/agents/electron-security.mdがCSRF攻撃対策としてState parameter検証が未実装であることを指摘しました。

### 1.2 問題点・課題

**現在の実装状態**:

| 項目                    | 状態        | 説明                                                |
| ----------------------- | ----------- | --------------------------------------------------- |
| カスタムプロトコル      | ✅ 実装済み | `aiworkflow://auth/callback` で認証コールバック受信 |
| Refresh Token暗号化     | ✅ 実装済み | safeStorage.encryptString()で暗号化後保存           |
| Access Tokenメモリ保持  | ✅ 実装済み | Zustand storeでメモリ上のみ保持                     |
| **State parameter検証** | ❌ 未実装   | **CSRF攻撃リスクが残存**                            |

**セキュリティリスク - 攻撃シナリオ**:

1. 攻撃者が偽の認証コールバックURLを生成: `aiworkflow://auth/callback#access_token=malicious_token`
2. ソーシャルエンジニアリングでユーザーを誘導してそのURLを開かせる
3. アプリが検証なしでトークンを受け入れる
4. 攻撃者のアカウントでログインしてしまう（CSRF攻撃成功）

### 1.3 放置した場合の影響

| 影響領域         | 影響度 | 説明                                             |
| ---------------- | ------ | ------------------------------------------------ |
| セキュリティ     | Medium | CSRF攻撃のリスクが残存（ただし実際の攻撃は困難） |
| OAuth 2.0準拠    | Medium | RFC 6749推奨のCSRF対策が未実装                   |
| ユーザー体験     | Low    | 通常の使用では影響なし                           |
| コンプライアンス | Medium | セキュリティベストプラクティス違反               |

---

## 2. 何を達成するか（What）

### 2.1 目的

OAuth認証フローにState parameter検証を実装し、CSRF攻撃を防止する。RFC 6749推奨のセキュリティベストプラクティスに準拠する。

### 2.2 最終ゴール

- ✅ OAuth認証開始時にランダムなstateパラメータを生成
- ✅ stateパラメータをメモリ（Main Process）に一時保存
- ✅ コールバック受信時にstateパラメータを検証
- ✅ 不正なstateの場合はトークンを拒否しエラーログを出力
- ✅ ユーザーに分かりやすいエラーメッセージを表示

### 2.3 スコープ

#### 含むもの

- State parameter生成・保存・検証ロジックの実装
- StateManagerモジュールの作成
- authHandlers.ts、index.tsの修正
- ユニットテスト追加（StateManager）
- 手動テスト（実際のOAuth認証で検証）
- セキュリティガイドライン更新

#### 含まないもの

- PKCE実装（DEBT-SEC-002として別タスク）
- カスタムプロトコルURL詳細検証（DEBT-SEC-003として別タスク）
- セッション管理の改善（別タスク）

### 2.4 成果物

| 種別         | 成果物                           | 配置先                                                      |
| ------------ | -------------------------------- | ----------------------------------------------------------- |
| 実装         | StateManagerモジュール           | `apps/desktop/src/main/infrastructure/stateManager.ts`      |
| 実装         | authHandlers.ts修正（state生成） | `apps/desktop/src/main/ipc/authHandlers.ts:77`              |
| 実装         | index.ts修正（state検証）        | `apps/desktop/src/main/index.ts:105-188`                    |
| テスト       | StateManager単体テスト           | `apps/desktop/src/main/infrastructure/stateManager.test.ts` |
| ドキュメント | セキュリティガイドライン更新     | `docs/00-requirements/17-security-guidelines.md`            |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] ログイン機能復旧プロジェクト（T-02-1〜T-09-1）が完了していること
- [ ] OAuth認証が正常に動作していること（`Auth callback processed successfully`）
- [ ] 開発環境が正しくセットアップされていること（.envシンボリックリンク等）
- [ ] テスト環境が動作すること（`pnpm --filter @repo/desktop test:run`）

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- T-04-1: AuthGuard実装（完了済み）
- T-06-1: 品質保証（完了済み）
- T-07-1: 最終レビューゲート（完了済み）

**同時実施可能なタスク**:

- DEBT-SEC-002（PKCE実装）
- DEBT-SEC-003（URL詳細検証）
- DEBT-CODE-001（構造化ログ）

### 3.3 必要な知識・スキル

- OAuth 2.0仕様（RFC 6749）の理解
- State parameterの役割とCSRF対策の仕組み
- TypeScript/Node.jsでの乱数生成（crypto.randomBytes）
- Electron Main Processプログラミング
- Vitest単体テスト作成

### 3.4 推奨アプローチ

1. **StateManager実装**: cryptoモジュールで高エントロピーな乱数生成
2. **有効期限管理**: 10分の有効期限を設定し、期限切れstateを自動削除
3. **ワンタイムユース**: 検証成功後にstateを削除（再利用防止）
4. **プロバイダー紐付け**: stateとプロバイダーを関連付けて保存

---

## 4. 実行手順

### Phase構成

```
Phase 1: StateManager実装（TDD Red）
  ↓
Phase 2: authHandlers修正（state生成）
  ↓
Phase 3: index.ts修正（state検証）
  ↓
Phase 4: TDD Green確認
  ↓
Phase 5: 手動テスト
  ↓
Phase 6: ドキュメント更新
```

---

### Phase 1: StateManager実装（TDD Red）

#### 目的

State parameter生成・検証ロジックを実装し、単体テストでRed状態を確認する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@unit-tester StateManagerモジュールを実装してください。

要件:
- crypto.randomBytes(32)で高エントロピーなstateを生成
- stateとプロバイダーを紐付けて保存（Map使用）
- 有効期限10分を設定
- 検証成功後にstateを削除（ワンタイムユース）
- 期限切れstateの自動クリーンアップ

テストケース:
1. State生成のユニーク性
2. 正しいstateの検証成功
3. 不正なstateの検証失敗
4. プロバイダー不一致の検証失敗
5. 期限切れstateの検証失敗
6. ワンタイムユース（2回目の検証失敗）

ファイル:
- apps/desktop/src/main/infrastructure/stateManager.ts（新規）
- apps/desktop/src/main/infrastructure/stateManager.test.ts（新規）
```

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: 単体テスト作成とTDD実践の専門家。StateManagerのような純粋なロジックモジュールのテスト駆動開発に最適。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名             | 活用方法                                    |
| -------------------- | ------------------------------------------- |
| .claude/skills/tdd-principles/SKILL.md       | TDD Red-Green-Refactorサイクルの実践        |
| .claude/skills/clean-code-practices/SKILL.md | 高品質なStateManagerコードの作成            |
| .claude/skills/test-doubles/SKILL.md         | Vitest vi.useFakeTimers()でタイムテスト実施 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                 | パス                                                        | 内容                    |
| ---------------------- | ----------------------------------------------------------- | ----------------------- |
| StateManagerモジュール | `apps/desktop/src/main/infrastructure/stateManager.ts`      | State生成・検証ロジック |
| StateManager単体テスト | `apps/desktop/src/main/infrastructure/stateManager.test.ts` | 6テストケース以上       |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/desktop test:run stateManager.test.ts
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] stateManager.ts実装完了
- [ ] stateManager.test.ts実装完了（6テストケース以上）
- [ ] テスト実行でRed状態確認
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 2: authHandlers修正（state生成）

#### 目的

OAuth認証開始時にStateManagerを使用してstateパラメータを生成し、Supabase OAuth URLに含める。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@auth-specialist authHandlers.tsを修正してstate生成を追加してください。

修正内容:
- stateManagerをインポート
- ログイン開始時にstateManager.generate(provider)を呼び出し
- Supabase signInWithOAuth()のoptionsにstateを追加

ファイル: apps/desktop/src/main/ipc/authHandlers.ts:77
```

#### 使用エージェント

- **エージェント**: .claude/agents/auth-specialist.md
- **選定理由**: OAuth認証フローの専門家。Supabase Auth APIとの統合に精通。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名     | 活用方法                           |
| ------------ | ---------------------------------- |
| .claude/skills/oauth2-flows/SKILL.md | OAuth 2.0フローへのstate追加の実装 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物              | パス                                        | 内容                     |
| ------------------- | ------------------------------------------- | ------------------------ |
| authHandlers.ts修正 | `apps/desktop/src/main/ipc/authHandlers.ts` | state生成とOAuth URL追加 |

#### 完了条件

- [ ] stateManager.generate()呼び出し追加
- [ ] Supabase OAuth URLにstate追加
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 3: index.ts修正（state検証）

#### 目的

カスタムプロトコルコールバック受信時にstateパラメータを検証し、不正なstateの場合はトークン処理を拒否する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@auth-specialist index.tsのhandleAuthCallback関数を修正してstate検証を追加してください。

修正内容:
- stateManagerをインポート
- URLからstateパラメータを抽出
- stateManager.validate()でstate検証
- 検証失敗時はエラーログ出力とauth:errorイベント送信
- 検証成功時のみトークン処理を続行

ファイル: apps/desktop/src/main/index.ts:105-188
```

#### 使用エージェント

- **エージェント**: .claude/agents/auth-specialist.md
- **選定理由**: OAuth認証フローの専門家。カスタムプロトコルコールバック処理に精通。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名             | 活用方法                             |
| -------------------- | ------------------------------------ |
| .claude/skills/oauth2-flows/SKILL.md         | OAuth 2.0コールバック処理のstate検証 |
| .claude/skills/clean-code-practices/SKILL.md | エラーハンドリングの適切な実装       |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物       | パス                             | 内容                  |
| ------------ | -------------------------------- | --------------------- |
| index.ts修正 | `apps/desktop/src/main/index.ts` | state検証ロジック追加 |

#### 完了条件

- [ ] stateパラメータ抽出実装
- [ ] stateManager.validate()呼び出し追加
- [ ] 検証失敗時のエラーハンドリング実装
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 4: TDD Green確認

#### 目的

実装完了後、StateManagerのテストがすべて成功することを確認する（TDD Greenフェーズ）。

#### 実行コマンド

```bash
pnpm --filter @repo/desktop test:run stateManager.test.ts
```

#### 完了条件

- [ ] 全テストケース成功（Green状態）
- [ ] テストカバレッジ100%
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 5: 手動テスト

#### 目的

実際のOAuth認証フローでstate検証が正しく動作することを確認する。

#### テストケース

| No  | カテゴリ | テスト項目              | 操作手順                                 | 期待結果                            |
| --- | -------- | ----------------------- | ---------------------------------------- | ----------------------------------- |
| 1   | 正常系   | Google OAuth state検証  | Googleログインボタンクリック→認証完了    | ログイン成功、state検証成功ログ出力 |
| 2   | 正常系   | GitHub OAuth state検証  | GitHubログインボタンクリック→認証完了    | ログイン成功、state検証成功ログ出力 |
| 3   | 正常系   | Discord OAuth state検証 | Discordログインボタンクリック→認証完了   | ログイン成功、state検証成功ログ出力 |
| 4   | 異常系   | 不正なstate             | コールバックURLのstateパラメータを改ざん | エラー表示、ログイン失敗            |
| 5   | 異常系   | stateパラメータ欠落     | コールバックURLからstateを削除           | エラー表示、ログイン失敗            |

#### 実行手順

1. `pnpm --filter @repo/desktop preview` でアプリを起動
2. DevToolsを開く（Cmd+Option+I）
3. ターミナルログを確認
4. 各テストケースを実行
5. 結果を記録

#### 完了条件

- [ ] 全5テストケースがPASS
- [ ] ターミナルログで「State validated」が出力されることを確認
- [ ] 不正なstate時に「Invalid state parameter」が出力されることを確認

---

### Phase 6: ドキュメント更新

#### 目的

セキュリティガイドラインにState parameter検証の実装状況を反映する。

#### 更新対象

`docs/00-requirements/17-security-guidelines.md`

**更新箇所**: 17.2.1.1 Supabase Auth（Desktop）- OAuth認証フロー実装状況

```markdown
| State parameter検証 | ✅ 実装済み | stateManager.tsでCSRF対策実装 |
```

#### 完了条件

- [ ] セキュリティガイドライン更新完了
- [ ] State parameter検証が✅実装済みに変更

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] StateManager実装完了
- [ ] state生成ロジック実装完了
- [ ] state検証ロジック実装完了
- [ ] エラーハンドリング実装完了

### 品質要件

- [ ] 全ユニットテスト成功（6テストケース以上）
- [ ] 全手動テスト成功（5テストケース）
- [ ] テストカバレッジ100%（StateManager）
- [ ] ESLint/TypeScriptエラーゼロ

### ドキュメント要件

- [ ] セキュリティガイドライン更新完了

---

## 6. 検証方法

### テストケース

#### ユニットテスト（StateManager）

1. **State生成のユニーク性**: 連続生成で異なるstateが生成される
2. **正しいstateの検証成功**: 生成したstateの検証が成功する
3. **不正なstateの検証失敗**: 存在しないstateの検証が失敗する
4. **プロバイダー不一致の検証失敗**: 異なるプロバイダーでの検証が失敗する
5. **期限切れstateの検証失敗**: 10分経過後のstateの検証が失敗する
6. **ワンタイムユース**: 同じstateの2回目の検証が失敗する

#### 統合テスト

1. OAuth認証開始時にstateが生成される
2. コールバック受信時にstateが検証される
3. 不正なstateでログイン失敗する

### 検証手順

#### 自動テスト検証

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test:run stateManager.test.ts

# カバレッジ確認
pnpm --filter @repo/desktop test:coverage

# 全テスト実行
pnpm --filter @repo/desktop test:run
```

#### 手動テスト検証

```bash
# アプリ起動
pnpm --filter @repo/desktop preview

# DevToolsでネットワークタブを開く
# OAuth URL確認: state=xxx が含まれること
# コールバックURL確認: state=xxx が含まれること
# ターミナルログ確認: "State validated" が出力されること
```

---

## 7. リスクと対策

| リスク                              | 影響度 | 発生確率 | 対策                                   | 対応サブタスク |
| ----------------------------------- | ------ | -------- | -------------------------------------- | -------------- |
| Supabaseがstate送信をサポートしない | High   | Low      | ドキュメント確認、必要に応じて代替実装 | Phase 2        |
| コールバックURLにstateが含まれない  | Medium | Low      | Supabaseの実装確認、手動テストで検証   | Phase 5        |
| プロバイダー判定ロジックが不正確    | Low    | Medium   | detectProvider()の精度向上             | Phase 3        |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/login-recovery/step11-final-review.md` - 最終レビュー結果
- `docs/00-requirements/17-security-guidelines.md` - セキュリティガイドライン
- `apps/desktop/src/main/ipc/authHandlers.ts` - 既存認証ハンドラー
- `apps/desktop/src/main/index.ts` - カスタムプロトコル処理

### 参考資料

- [RFC 6749 - Section 10.12 (CSRF)](https://datatracker.ietf.org/doc/html/rfc6749#section-10.12)
- [OAuth 2.0 Security Best Current Practice - Section 4.8](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics#section-4.8)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
@sec-auditor:
"State parameterによるCSRF対策が推奨されます。
 現在の実装ではコールバックURLの検証が不十分です。"

@electron-security:
"OAuth認証フローにおいてstate検証が未実装です。
 CSRF攻撃のリスクが残存しています。"
```

### 補足事項

- Supabase Auth v2のstate対応状況は要確認
- もしSupabaseがstate送信をサポートしない場合は、代替実装を検討
- PKCE実装（DEBT-SEC-002）と組み合わせることでより強固なセキュリティを実現
