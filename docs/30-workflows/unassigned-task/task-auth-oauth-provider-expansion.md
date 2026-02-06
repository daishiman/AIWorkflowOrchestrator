# OAuthプロバイダー追加 - タスク指示書

## メタ情報

```yaml
issue_number: 725
```

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | TASK-AUTH-PROVIDER-001                        |
| タスク名     | OAuthプロバイダー追加（Apple/Microsoft）      |
| 分類         | 認証（auth）                                  |
| 対象機能     | OAuth認証（Desktop）                          |
| 優先度       | 低                                            |
| 見積もり規模 | 中規模                                        |
| ステータス   | 未着手                                        |
| 発見元       | TASK-AUTH-CALLBACK-001 Phase 1 スコープアウト |
| 発見日       | 2026-02-06                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-AUTH-CALLBACK-001（OAuth PKCE移行）のPhase 1で、OAuthプロバイダー追加はスコープ外として除外された。現在Google/GitHub/Discordの3プロバイダーのみサポートしている。PKCE移行完了によりAuthorization Code Flowの基盤が整い、新規プロバイダー追加の技術的障壁が下がった。

### 1.2 問題点・課題

**現在のプロバイダーサポート状況**:

| プロバイダー | ステータス    | PKCE対応 | 備考                                |
| ------------ | ------------- | -------- | ----------------------------------- |
| Google       | ✅ サポート済 | ✅       | TASK-AUTH-CALLBACK-001で移行完了    |
| GitHub       | ✅ サポート済 | ✅       | TASK-AUTH-CALLBACK-001で移行完了    |
| Discord      | ✅ サポート済 | ✅       | TASK-AUTH-CALLBACK-001で移行完了    |
| Apple        | ❌ 未対応     | -        | macOSネイティブアプリとして需要あり |
| Microsoft    | ❌ 未対応     | -        | 企業ユーザーからの需要              |

### 1.3 放置した場合の影響

| 影響領域     | 影響度 | 説明                                            |
| ------------ | ------ | ----------------------------------------------- |
| ユーザー体験 | Medium | Apple/Microsoftアカウントユーザーが利用できない |
| 企業導入     | Medium | Microsoft Entra ID連携なしでは企業導入が困難    |
| macOS統合    | Low    | Apple Sign-Inなしではネイティブ感が損なわれる   |

---

## 2. 何を達成するか（What）

### 2.1 目的

Apple Sign-InおよびMicrosoft（Entra ID）をOAuthプロバイダーとして追加し、ユーザーの認証選択肢を拡充する。

### 2.2 最終ゴール

- Apple Sign-InでのログインをSupabase Auth経由で実装
- Microsoft（Entra ID）でのログインをSupabase Auth経由で実装
- 既存のPKCEフロー基盤を活用
- プロバイダー追加が容易なアーキテクチャを確立

### 2.3 スコープ

#### 含むもの

- Supabase Dashboard でのプロバイダー設定（手動作業指示書として文書化）
- `authHandlers.ts` のプロバイダーリスト拡張
- プロバイダー固有の設定（Apple: `nonce` 対応、Microsoft: テナント設定）
- `OAuthProvider` 型の拡張（`packages/shared/types/auth.ts`）
- 認証UIへのボタン追加
- ユニットテスト・統合テスト

#### 含まないもの

- Supabase以外の認証プロバイダー（Auth0, Firebase Auth等）
- カスタムOIDCプロバイダー
- SAML対応

### 2.4 成果物

| 種別         | 成果物                          | 配置先                                         |
| ------------ | ------------------------------- | ---------------------------------------------- |
| 実装         | OAuthProvider型拡張             | `packages/shared/types/auth.ts`                |
| 実装         | authHandlers.tsプロバイダー追加 | `apps/desktop/src/main/ipc/authHandlers.ts`    |
| 実装         | プロバイダー設定モジュール      | `apps/desktop/src/main/auth/providerConfig.ts` |
| 実装         | 認証UI ボタン追加               | `apps/desktop/src/renderer/components/`        |
| ドキュメント | Supabase設定手順書              | `docs/30-workflows/`                           |
| テスト       | プロバイダー別テスト            | `apps/desktop/src/main/auth/__tests__/`        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] TASK-AUTH-CALLBACK-001（PKCE移行）が完了していること
- [ ] Supabase DashboardでApple/Microsoftプロバイダーが有効化されていること
- [ ] Apple Developer Account（Apple Sign-In用）が利用可能であること
- [ ] Microsoft Entra IDアプリ登録が完了していること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- TASK-AUTH-CALLBACK-001: PKCE移行（完了済み）

**同時実施可能なタスク**:

- task-auth-multi-account-support（複数アカウントサポート）
- task-auth-token-refresh-optimization（トークンリフレッシュ最適化）

### 3.3 必要な知識・スキル

- Apple Sign-In仕様（ASAuthorizationAppleIDProvider）
- Microsoft Identity Platform（OAuth 2.0 / OpenID Connect）
- Supabase Auth プロバイダー設定
- PKCE（RFC 7636）- TASK-AUTH-CALLBACK-001で実装済みの基盤を理解

### 3.4 推奨アプローチ

1. **プロバイダー設定の抽象化**: `ProviderConfig` インターフェースで各プロバイダーの差異を吸収
2. **Supabase Auth依存**: 認証フロー自体はSupabase Auth SDKに委譲し、プロバイダー固有ロジックは最小限に
3. **段階的追加**: Apple → Microsoft の順で段階的に追加（Apple Sign-Inのほうがシンプル）

### 3.5 実装上の注意点（TASK-AUTH-CALLBACK-001の知見）

| 課題                                         | 原因                                    | 解決策                                   | 本タスクへの適用                                                                                                                                 |
| -------------------------------------------- | --------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| カスタムプロトコルURLの`new URL()`パース失敗 | RFC 3986のauthorityコンポーネント解釈   | `extractProtocolPath()`で独自パース      | プロバイダー別コールバックパスを追加する場合も`extractProtocolPath()`を使用。`new URL("aiworkflow://auth/callback/apple")`は正しくパースされない |
| PKCEバリデーション定数のデッドコード化       | TDDでテスト用定数と実装用定数が乖離     | 共有定数ファイルで一元管理               | プロバイダー別の設定値（scope, nonce要否等）も定数ファイルで管理                                                                                 |
| プロバイダー固有のトークンレスポンス差異     | Apple Sign-Inは初回のみメールを返す     | プロバイダー別のレスポンスパーサーを実装 | `ProviderConfig.parseTokenResponse()` メソッドで差異を吸収                                                                                       |
| ルールファイルと仕様書の同期ギャップ         | 仕様書更新後にrulesファイル更新を忘れた | 3箇所同時更新を標準化                    | `OAuthProvider`型拡張時に`auth.ts` + `architecture-auth-security.md` + 仕様書を同時更新                                                          |

**参照先**:

- `architecture-auth-security.md` - 認証フローアーキテクチャ
- `skill-creator/references/patterns.md` - PKCE + ローカルHTTPサーバー認証パターン

---

## 4. 実行手順

### Phase構成

```
Phase 1: Supabase プロバイダー設定調査・設定手順書作成
  ↓
Phase 2: OAuthProvider型拡張・ProviderConfig設計（TDD Red）
  ↓
Phase 3: Apple Sign-In実装
  ↓
Phase 4: Microsoft（Entra ID）実装
  ↓
Phase 5: 認証UI更新（ログインボタン追加）
  ↓
Phase 6: TDD Green確認・統合テスト
  ↓
Phase 7: 手動テスト（全プロバイダー）
  ↓
Phase 8: ドキュメント更新
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Apple Sign-Inでログイン成功
- [ ] Microsoft（Entra ID）でログイン成功
- [ ] 既存プロバイダー（Google/GitHub/Discord）に影響なし
- [ ] PKCE フローが全プロバイダーで動作

### 品質要件

- [ ] プロバイダー別ユニットテスト（各5テストケース以上）
- [ ] 既存テスト全PASS（リグレッションなし）
- [ ] テストカバレッジ80%以上
- [ ] ESLint/TypeScriptエラーゼロ

### ドキュメント要件

- [ ] Supabaseプロバイダー設定手順書
- [ ] `architecture-auth-security.md` 更新
- [ ] `OAuthProvider` 型定義の更新記録

---

## 6. 検証方法

### ユニットテスト

1. Apple Sign-InのPKCEフロー開始
2. Apple Sign-Inのトークンレスポンスパース
3. Microsoft Entra IDのPKCEフロー開始
4. Microsoft Entra IDのトークンレスポンスパース
5. 未対応プロバイダーのエラーハンドリング
6. プロバイダー設定の妥当性検証

### 手動テスト

| No  | カテゴリ | テスト項目           | 操作手順                                   | 期待結果                       |
| --- | -------- | -------------------- | ------------------------------------------ | ------------------------------ |
| 1   | 正常系   | Apple Sign-In        | Appleログインボタンクリック→認証完了       | ログイン成功、ユーザー情報表示 |
| 2   | 正常系   | Microsoft Entra ID   | Microsoftログインボタンクリック→認証完了   | ログイン成功、ユーザー情報表示 |
| 3   | 正常系   | 既存プロバイダー維持 | Google/GitHub/Discordでログイン            | 既存動作に変化なし             |
| 4   | 異常系   | 未設定プロバイダー   | Supabase未設定のプロバイダーでログイン試行 | 分かりやすいエラーメッセージ   |

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                             |
| -------------------------------------------- | ------ | -------- | ------------------------------------------------ |
| Apple Developer Account費用（年$99）         | Low    | High     | プロジェクト予算で対応                           |
| Apple Sign-Inの`nonce`要件                   | Medium | Medium   | Supabase Auth SDKの`nonce`パラメータサポート確認 |
| Microsoft Entra IDのテナント設定の複雑さ     | Medium | Medium   | 設定手順書を詳細に作成                           |
| プロバイダー固有のエラーレスポンス形式の違い | Low    | High     | `ProviderConfig.parseError()` で吸収             |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/auth/authFlowOrchestrator.ts` - 認証フロー管理
- `apps/desktop/src/main/auth/pkce.ts` - PKCE実装
- `packages/shared/types/auth.ts` - OAuthProvider型定義
- `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`
- `.claude/rules/04-electron-security.md`

### 関連タスク

- TASK-AUTH-CALLBACK-001: PKCE移行（完了・基盤）
- task-auth-multi-account-support: 複数アカウントサポート（同時実施可能）

### 参考資料

- Apple Sign-In Documentation
- Microsoft Identity Platform Documentation
- Supabase Auth Provider Configuration

---

## 9. 備考

### TASK-AUTH-CALLBACK-001の設計資産活用

- **AuthFlowOrchestrator**: プロバイダーパラメータを拡張するだけで新プロバイダーに対応可能
- **PKCE基盤**: `pkce.ts` のcode_verifier/code_challenge生成はプロバイダー非依存で設計済み
- **ローカルHTTPサーバー**: `authCallbackServer.ts` は全プロバイダーで共通利用可能
- **State管理**: 5分TTLのCSRF防止もプロバイダー非依存

### 苦戦ポイントの事前対策

1. **Apple Sign-Inの初回のみメール返却**: `identity_token` からメール情報を取得し、初回ログイン時にユーザープロファイルを保存。2回目以降は保存済み情報を使用
2. **カスタムプロトコルURLパース**: プロバイダー名をパスに含める場合（`/auth/callback/apple`等）、`extractProtocolPath()`のパース結果から正しくプロバイダーを特定すること
3. **定数管理**: プロバイダー別のscope/nonce要否は`ProviderConfig`型で型安全に定義し、デッドコード化を防止
