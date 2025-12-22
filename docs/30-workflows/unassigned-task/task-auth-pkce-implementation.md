# PKCE実装（OAuth 2.1準拠） - タスク指示書

## メタ情報

| 項目             | 内容                          |
| ---------------- | ----------------------------- |
| タスクID         | DEBT-SEC-002                  |
| タスク名         | PKCE実装（OAuth 2.1準拠）     |
| 分類             | セキュリティ                  |
| 対象機能         | OAuth認証（Desktop）          |
| 優先度           | 低                            |
| 見積もり規模     | 小規模                        |
| ステータス       | 未実施                        |
| 発見元           | Phase 7（最終レビューゲート） |
| 発見日           | 2025-12-22                    |
| 発見エージェント | @auth-specialist              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

OAuth 2.1では、すべてのOAuthクライアント（Webアプリ、ネイティブアプリ、SPAを問わず）にPKCE（Proof Key for Code Exchange）の実装が必須となります。

ログイン機能復旧プロジェクト（2025-12-22完了）の最終レビューゲートで、@auth-specialistがPKCE未実装を技術的負債として指摘しました。

### 1.2 問題点・課題

**攻撃シナリオ（PKCE未実装時）**:

1. 攻撃者がOAuth認可コードを横取り
2. 横取りしたコードでアクセストークンを取得
3. ユーザーのアカウントに不正アクセス

**現在の実装状態**:

- ✅ Implicit Flow（トークンを直接URLフラグメントで受け取る）
- ❌ Authorization Code Flow with PKCE未実装
- ❌ 認可コード横取り攻撃のリスクが残存（理論上）

### 1.3 放置した場合の影響

| 影響領域         | 影響度 | 説明                                                  |
| ---------------- | ------ | ----------------------------------------------------- |
| セキュリティ     | Low    | Implicit Flowでも基本的なセキュリティは確保されている |
| OAuth 2.1準拠    | Medium | 将来的にPKCE必須となる可能性                          |
| ユーザー体験     | なし   | 通常の使用では影響なし                                |
| コンプライアンス | Low    | Supabase Auth v2がまだImplicit Flowをサポート中       |

---

## 2. 何を達成するか（What）

### 2.1 目的

OAuth 2.1仕様に準拠したPKCE実装を追加し、認可コード横取り攻撃を防止する。

### 2.2 最終ゴール

- ✅ code_verifier生成（高エントロピーな乱数）
- ✅ code_challenge生成（SHA-256ハッシュ）
- ✅ OAuth認証開始時にcode_challengeを送信
- ✅ コールバック受信時にcode_verifierでトークン交換
- ✅ code_verifierのセキュアな保存

### 2.3 スコープ

#### 含むもの

- PKCEManager実装
- code_verifier/code_challenge生成ロジック
- authHandlers.ts修正（code_challenge送信）
- index.ts修正（code_verifierでトークン交換）
- Supabase PKCEサポート状況の調査・確認
- ユニットテスト追加

#### 含まないもの

- State parameter検証（DEBT-SEC-001として別タスク）
- カスタムプロトコルURL詳細検証（DEBT-SEC-003として別タスク）
- セッション管理の改善（別タスク）

### 2.4 成果物

| 種別         | 成果物                       | 配置先                                                     |
| ------------ | ---------------------------- | ---------------------------------------------------------- |
| 実装         | PKCEManagerモジュール        | `apps/desktop/src/main/infrastructure/pkceManager.ts`      |
| 実装         | authHandlers.ts修正          | `apps/desktop/src/main/ipc/authHandlers.ts`                |
| 実装         | index.ts修正                 | `apps/desktop/src/main/index.ts`                           |
| テスト       | PKCEManager単体テスト        | `apps/desktop/src/main/infrastructure/pkceManager.test.ts` |
| ドキュメント | セキュリティガイドライン更新 | `docs/00-requirements/17-security-guidelines.md`           |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] ログイン機能復旧プロジェクト（T-02-1〜T-09-1）が完了していること
- [ ] OAuth認証が正常に動作していること
- [ ] Supabase Auth v2のPKCE対応状況を確認済みであること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- T-04-1: AuthGuard実装（完了済み）
- T-06-1: 品質保証（完了済み）
- T-07-1: 最終レビューゲート（完了済み）

**同時実施可能なタスク**:

- DEBT-SEC-001（State parameter検証）
- DEBT-SEC-003（URL詳細検証）
- DEBT-CODE-001（構造化ログ）

### 3.3 必要な知識・スキル

- OAuth 2.0/2.1仕様の理解
- PKCE（Proof Key for Code Exchange）の仕組み
- SHA-256ハッシュ生成（Node.js crypto）
- Supabase Auth API
- Electron Main Processプログラミング

### 3.4 推奨アプローチ

1. **Supabase PKCEサポート確認**: ドキュメント・実装確認が最優先
2. **PKCEManager実装**: code_verifier/code_challenge生成ロジック
3. **有効期限管理**: 10分の有効期限設定
4. **ワンタイムユース**: 検証成功後にverifierを削除

---

## 4. 実行手順

### Phase構成

```
Phase 1: Supabase PKCEサポート状況調査
  ↓
Phase 2: PKCEManager実装（TDD Red）
  ↓
Phase 3: authHandlers修正（code_challenge送信）
  ↓
Phase 4: index.ts修正（code_verifierでトークン交換）
  ↓
Phase 5: TDD Green確認
  ↓
Phase 6: 手動テスト
  ↓
Phase 7: ドキュメント更新
```

---

### Phase 1: Supabase PKCEサポート状況調査

#### 目的

Supabase Auth v2がPKCEをサポートしているか確認し、実装可能性を判断する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
Supabase Auth v2のPKCE対応状況を調査してください。

確認事項:
- signInWithOAuth()がcode_challengeパラメータをサポートするか
- exchangeCodeForSession()メソッドが使用可能か
- 公式ドキュメントでのPKCE記載

参考: https://supabase.com/docs/guides/auth
```

#### 使用エージェント

- **エージェント**: @auth-specialist
- **選定理由**: OAuth認証実装の専門家。Supabase Auth APIの仕様確認に最適。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名     | 活用方法                      |
| ------------ | ----------------------------- |
| oauth2-flows | OAuth 2.0/2.1仕様の理解と調査 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物       | パス                                                          | 内容               |
| ------------ | ------------------------------------------------------------- | ------------------ |
| 調査レポート | `docs/30-workflows/unassigned-task/supabase-pkce-research.md` | PKCE対応状況まとめ |

#### 完了条件

- [ ] Supabase PKCEサポート状況を確認
- [ ] 実装可能性を判断
- [ ] 代替案を検討（サポートされていない場合）

---

### Phase 2: PKCEManager実装（TDD Red）

#### 目的

PKCE code_verifier/code_challenge生成・検証ロジックを実装し、単体テストでRed状態を確認する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@unit-tester PKCEManagerモジュールを実装してください。

要件:
- code_verifier生成（43-128文字のランダム文字列）
- code_challenge生成（SHA-256ハッシュ→Base64URL）
- verifierとプロバイダーを紐付けて保存
- 有効期限10分設定
- 検証成功後にverifierを削除（ワンタイムユース）

テストケース:
1. code_verifierの長さが43-128文字
2. code_challengeが正しくSHA-256ハッシュされている
3. verifier取得成功
4. 存在しないverifier取得で null
5. 期限切れverifier取得で null
6. ワンタイムユース（2回目の取得で null）

ファイル:
- apps/desktop/src/main/infrastructure/pkceManager.ts（新規）
- apps/desktop/src/main/infrastructure/pkceManager.test.ts（新規）
```

#### 使用エージェント

- **エージェント**: @unit-tester
- **選定理由**: 単体テスト作成とTDD実践の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名             | 活用方法                           |
| -------------------- | ---------------------------------- |
| tdd-principles       | TDD Red-Green-Refactorサイクル実践 |
| clean-code-practices | 高品質なPKCEManagerコード作成      |
| test-doubles         | Vitest vi.useFakeTimers()活用      |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                | パス                                                       | 内容                   |
| --------------------- | ---------------------------------------------------------- | ---------------------- |
| PKCEManagerモジュール | `apps/desktop/src/main/infrastructure/pkceManager.ts`      | PKCE生成・検証ロジック |
| PKCEManager単体テスト | `apps/desktop/src/main/infrastructure/pkceManager.test.ts` | 6テストケース以上      |

#### 完了条件

- [ ] pkceManager.ts実装完了
- [ ] pkceManager.test.ts実装完了
- [ ] テスト実行でRed状態確認
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 3: authHandlers修正（code_challenge送信）

#### 目的

OAuth認証開始時にcode_challengeを生成し、Supabase OAuth URLに含める。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@auth-specialist authHandlers.tsを修正してcode_challenge送信を追加してください。

修正内容:
- pkceManagerをインポート
- ログイン開始時にpkceManager.generate(provider)を呼び出し
- Supabase signInWithOAuth()のoptionsにcode_challenge/code_challenge_methodを追加

ファイル: apps/desktop/src/main/ipc/authHandlers.ts
```

#### 使用エージェント

- **エージェント**: @auth-specialist
- **選定理由**: OAuth 2.1/PKCE実装の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名     | 活用方法                            |
| ------------ | ----------------------------------- |
| oauth2-flows | OAuth 2.0/2.1フローへのPKCE追加実装 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物              | パス                                        | 内容                   |
| ------------------- | ------------------------------------------- | ---------------------- |
| authHandlers.ts修正 | `apps/desktop/src/main/ipc/authHandlers.ts` | code_challenge送信追加 |

#### 完了条件

- [ ] pkceManager.generate()呼び出し追加
- [ ] Supabase OAuth URLにcode_challenge追加
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 4: index.ts修正（code_verifierでトークン交換）

#### 目的

カスタムプロトコルコールバック受信時、code_verifierを使用してトークンを交換する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
@auth-specialist index.tsのhandleAuthCallback関数を修正してPKCEトークン交換を追加してください。

修正内容:
- pkceManagerをインポート
- URLからcodeパラメータを抽出
- pkceManager.getVerifier()でcode_verifier取得
- supabase.auth.exchangeCodeForSession()でトークン交換

ファイル: apps/desktop/src/main/index.ts:105-188
```

#### 使用エージェント

- **エージェント**: @auth-specialist
- **選定理由**: OAuth 2.1/PKCE実装の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名             | 活用方法                            |
| -------------------- | ----------------------------------- |
| oauth2-flows         | OAuth 2.1コールバック処理のPKCE実装 |
| clean-code-practices | エラーハンドリングの適切な実装      |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物       | パス                             | 内容                         |
| ------------ | -------------------------------- | ---------------------------- |
| index.ts修正 | `apps/desktop/src/main/index.ts` | PKCEトークン交換ロジック追加 |

#### 完了条件

- [ ] codeパラメータ抽出実装
- [ ] pkceManager.getVerifier()呼び出し追加
- [ ] exchangeCodeForSession()実装
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 5: TDD Green確認

#### 目的

実装完了後、PKCEManagerのテストがすべて成功することを確認する。

#### 実行コマンド

```bash
pnpm --filter @repo/desktop test:run pkceManager.test.ts
```

#### 完了条件

- [ ] 全テストケース成功（Green状態）
- [ ] テストカバレッジ100%
- [ ] ESLint/TypeScriptエラーなし

---

### Phase 6: 手動テスト

#### 目的

実際のOAuth認証フローでPKCEが正しく動作することを確認する。

#### テストケース

| No  | カテゴリ | テスト項目         | 操作手順                               | 期待結果     |
| --- | -------- | ------------------ | -------------------------------------- | ------------ |
| 1   | 正常系   | Google OAuth PKCE  | Googleログインボタンクリック→認証完了  | ログイン成功 |
| 2   | 正常系   | GitHub OAuth PKCE  | GitHubログインボタンクリック→認証完了  | ログイン成功 |
| 3   | 正常系   | Discord OAuth PKCE | Discordログインボタンクリック→認証完了 | ログイン成功 |

#### 実行手順

1. `pnpm --filter @repo/desktop preview` でアプリを起動
2. DevToolsでネットワークタブを開く
3. OAuth URL確認：code_challenge/code_challenge_methodが含まれること
4. 認証完了後、正常にログインできること

#### 完了条件

- [ ] 全3テストケースがPASS
- [ ] OAuth URLにcode_challengeが含まれることを確認
- [ ] ターミナルログで「PKCE token exchange successful」が出力されることを確認

---

### Phase 7: ドキュメント更新

#### 目的

セキュリティガイドラインにPKCE実装状況を反映する。

#### 更新対象

`docs/00-requirements/17-security-guidelines.md`

**更新箇所**: 17.2.1.1 Supabase Auth（Desktop）- OAuth認証フロー実装状況

```markdown
| PKCE実装 | ✅ 実装済み | pkceManager.tsでOAuth 2.1準拠実装 |
```

#### 完了条件

- [ ] セキュリティガイドライン更新完了
- [ ] PKCE実装が✅実装済みに変更

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] PKCEManager実装完了
- [ ] code_verifier生成ロジック実装完了
- [ ] code_challenge生成ロジック実装完了
- [ ] トークン交換ロジック実装完了

### 品質要件

- [ ] 全ユニットテスト成功（6テストケース以上）
- [ ] 全手動テスト成功（3テストケース）
- [ ] テストカバレッジ100%（PKCEManager）
- [ ] ESLint/TypeScriptエラーゼロ

### ドキュメント要件

- [ ] セキュリティガイドライン更新完了
- [ ] Supabase PKCE対応状況を調査レポートに記録

---

## 6. 検証方法

### テストケース

#### ユニットテスト（PKCEManager）

1. code_verifierの長さが43-128文字
2. code_challengeが正しくSHA-256ハッシュされている
3. verifier取得成功
4. 存在しないverifier取得でnull
5. 期限切れverifier取得でnull
6. ワンタイムユース（2回目の取得でnull）

#### 統合テスト

1. OAuth認証開始時にcode_challengeが生成される
2. コールバック受信時にcode_verifierでトークン交換される
3. 正常にログインできる

### 検証手順

#### 自動テスト検証

```bash
# ユニットテスト実行
pnpm --filter @repo/desktop test:run pkceManager.test.ts

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
# OAuth URL確認: code_challenge=xxx が含まれること
# code_challenge_method=S256 が含まれること
```

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                         | 対応サブタスク |
| -------------------------------------- | ------ | -------- | -------------------------------------------- | -------------- |
| Supabase Auth v2がPKCEをサポートしない | High   | Medium   | Implicit Flow継続、タスク延期                | Phase 1        |
| exchangeCodeForSession()メソッド不在   | High   | Medium   | Supabaseドキュメント確認、代替実装検討       | Phase 1        |
| Implicit FlowとPKCE Flowの並行が必要   | Medium | Medium   | フロー判定ロジック追加（codeパラメータ有無） | Phase 4        |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/login-recovery/step11-final-review.md` - 最終レビュー結果
- `docs/00-requirements/17-security-guidelines.md` - セキュリティガイドライン
- `apps/desktop/src/main/ipc/authHandlers.ts` - 既存認証ハンドラー
- `apps/desktop/src/main/index.ts` - カスタムプロトコル処理

### 参考資料

- [RFC 7636 - PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
- [OAuth 2.1 Draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-10)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
@auth-specialist:
"PKCE実装が推奨されます。OAuth 2.1準拠のため、
 code_verifier/code_challenge生成と検証を実装してください。"
```

### 補足事項

- **重要**: Supabase Auth v2がPKCEをサポートしているか確認が必須
- もしPKCEが未サポートの場合は、Implicit Flow継続となり、このタスクは延期
- State parameter検証（DEBT-SEC-001）と組み合わせることで、より強固なセキュリティを実現
- 実装工数はSupabase対応状況により変動する可能性あり
