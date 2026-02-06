# Phase 1: 要件定義

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| Phase    | 1                       |
| 機能名   | auth-callback-urlscheme |
| 作成日   | 2026-02-05              |
| タスクID | TASK-AUTH-CALLBACK-001  |

---

## 目的

OAuth認証コールバックの受信方式をImplicit FlowからAuthorization Code Flow + PKCEに移行し、ローカルHTTPサーバーとカスタムURLスキームのハイブリッド方式で不特定多数のユーザーが安全に利用できる認証フローの要件を定義する。

---

## 実行タスク

- Task 1: 機能要件の定義と文書化 - OAuth認証コールバック処理に必要な全機能要件を洗い出す
- Task 2: 非機能要件の定義 - セキュリティ・パフォーマンス・プラットフォーム互換性の要件を定義する
- Task 3: 受け入れ基準の策定 - 各要件の検証可能な完了条件を定める
- Task 4: スコープ定義 - 本タスクの範囲と範囲外を明確化する

---

## 参照資料

| 参照資料                   | パス                                                                              | 内容                              |
| -------------------------- | --------------------------------------------------------------------------------- | --------------------------------- |
| 元タスク指示書             | `docs/30-workflows/unassigned-task/task-auth-callback-url-scheme.md`              | 元の要件と背景情報                |
| 認証インターフェース仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | AuthUser型、OAuthプロバイダー定義 |
| 認証セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | 認証基盤設計、カスタムプロトコル  |
| Electron IPCセキュリティ   | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | IPC通信セキュリティ原則           |
| セキュリティ実装仕様       | `.claude/skills/aiworkflow-requirements/references/security-implementation.md`    | 多層防御、データ保護戦略          |
| 既存カスタムプロトコル実装 | `apps/desktop/src/main/protocol/customProtocol.ts`                                | 現在のURLスキーム登録処理         |
| 既存認証ハンドラー         | `apps/desktop/src/main/ipc/authHandlers.ts`                                       | 現在のOAuth認証IPCハンドラー      |
| OAuthエラーハンドラー      | `apps/desktop/src/main/auth/oauth-error-handler.ts`                               | OAuthエラー検出・マッピング       |
| devMockAuth                | `apps/desktop/src/renderer/utils/devMockAuth.ts`                                  | 一時的な認証スキップ処理          |
| 認証状態管理               | `apps/desktop/src/renderer/store/slices/authSlice.ts`                             | Zustand認証Store                  |
| electron-builder設定       | `apps/desktop/electron-builder.yml`                                               | URLスキーム登録設定               |

---

## 実行手順

### Task 1: 機能要件定義

以下の機能要件を定義し、文書化する:

| ID     | 要件                                                                         | 優先度 |
| ------ | ---------------------------------------------------------------------------- | ------ |
| FR-001 | Authorization Code Flow + PKCEでSupabase OAuthを開始する                     | 必須   |
| FR-002 | code_verifierをcrypto.randomBytesで生成し、code_challengeをSHA-256で算出する | 必須   |
| FR-003 | OAuth開始時にstateパラメータを生成し、Main ProcessのMapに保存する            | 必須   |
| FR-004 | ローカルHTTPサーバーを127.0.0.1の動的ポートで起動する                        | 必須   |
| FR-005 | HTTPサーバーでauthorization_codeとstateを受信する                            | 必須   |
| FR-006 | 受信したstateを保存済みの値と照合し、不一致時は認証を拒否する                | 必須   |
| FR-007 | authorization_codeとcode_verifierでトークン交換する                          | 必須   |
| FR-008 | トークン交換後にSupabase.auth.setSession()でセッションを確立する             | 必須   |
| FR-009 | Refresh TokenをsafeStorage.encryptString()で暗号化し保存する                 | 必須   |
| FR-010 | コールバック受信後にHTTPサーバーを停止する                                   | 必須   |
| FR-011 | HTTPレスポンスに「認証完了」HTMLを返却する                                   | 必須   |
| FR-012 | 認証完了後にElectronウィンドウをフォアグラウンドに表示する                   | 必須   |
| FR-013 | カスタムURLスキーム（aiworkflow://）をOSに登録する（パッケージ版UX向上用）   | 必須   |
| FR-014 | 認証エラー時にRenderer ProcessにIPC経由でエラー情報を送信する                | 必須   |
| FR-015 | 既存のOAuthプロバイダー（Google, GitHub, Discord）を全てサポートする         | 必須   |
| FR-016 | devMockAuth.tsの一時修正（`return true;`）を削除し本来のロジックを復元する   | 必須   |
| FR-017 | HTTPサーバーの起動ポートをRenderer Processに通知する                         | 必須   |

### Task 2: 非機能要件定義

| ID      | 要件                                                              | 基準値                           |
| ------- | ----------------------------------------------------------------- | -------------------------------- |
| NFR-001 | コールバック受信からセッション確立までの処理時間                  | 500ms以内                        |
| NFR-002 | HTTPサーバーの起動時間                                            | 200ms以内                        |
| NFR-003 | macOS 12+、Windows 10+、Ubuntu 22.04+ で動作する                  | 3プラットフォーム対応必須        |
| NFR-004 | 開発ビルド（`pnpm --filter @repo/desktop dev`）で認証フローが動作 | パッケージ化不要で動作           |
| NFR-005 | PKCE code_verifierは43-128文字のBase64URL文字列                   | RFC 7636 Section 4.1準拠         |
| NFR-006 | stateパラメータは32バイト以上のランダム文字列                     | CSRF対策として十分なエントロピー |
| NFR-007 | HTTPサーバーは認証完了後30秒以内に停止する                        | リソースリーク防止               |
| NFR-008 | 暗号化不可環境でのフォールバック動作                              | 警告表示しつつ認証を継続         |

### Task 3: 受け入れ基準策定

以下を検証可能な形式で定義する:

1. `pnpm --filter @repo/desktop dev` で起動し、Google OAuth認証を完了できる
2. macOS/Windows/Linuxの開発ビルドで認証フローが正常に完了する
3. パッケージ版（`pnpm --filter @repo/desktop build`）でも同様に動作する
4. 不正なstateパラメータでコールバックした場合、認証が拒否される
5. code_verifier/code_challengeのペアが正しく生成・検証される
6. HTTPサーバーが認証完了後に停止し、ポートが解放される
7. devMockAuth.tsの`return true;`が削除され、開発環境でも実際の認証フローが使用される
8. 既存のテスト（oauth-error-handler, authSlice等）が全て引き続きパスする

### Task 4: スコープ定義

**含むもの**:

- Authorization Code Flow + PKCE の実装
- ローカルHTTPサーバーによるコールバック受信
- State parameter検証によるCSRF対策
- カスタムURLスキーム登録（パッケージ版UX向上）
- devMockAuth.ts の一時修正の復元
- DEBT-SEC-001/002/003 の解消
- 既存テストとの整合性維持
- TASK-FIX-GOOGLE-LOGIN-001の成果物維持: authListenerRegisteredフラグ（リスナー二重登録防止）、resetAuthListenerFlag()テスト用関数、calculateRefreshTokenExpiry()関数のPKCEフローでの維持
- waitForSession()関数の必要性評価と維持/削除の判断

**含まないもの**:

- Supabase側のOAuth設定変更（リダイレクトURL追加のみ必要）
- 認証UI（AuthView）の変更
- 複数アカウントサポート
- OAuth プロバイダーの追加
- バックエンド（Next.js Web）の認証フロー変更

---

## 多角的チェック観点

### セキュリティ観点（security-\*.md）

- PKCE code_verifierの生成にcrypto.randomBytesを使用しているか
- State parameterが十分なエントロピーを持つか
- トークンがRenderer Processに露出しないか
- HTTPサーバーが127.0.0.1のみでリッスンしているか（外部アクセス不可）
- security-implementation.mdの4レイヤー防御モデル（フロントエンド/API境界/ビジネスロジック/データアクセス）に基づき、各セキュリティ対策がどのレイヤーに対応するかを確認しているか

### アーキテクチャ観点（architecture-\*.md）

- Main Process / Renderer Process / Preloadの責務分離が維持されているか
- IPC通信のホワイトリストに新規チャネルが追加されているか

### Electron固有観点

- contextIsolation/sandbox設定が維持されているか
- CSP設定との互換性があるか

---

## 統合テスト連携

| カテゴリ     | テスト対象                                   |
| ------------ | -------------------------------------------- |
| セキュリティ | PKCE code_verifier/code_challenge生成・検証  |
| セキュリティ | State parameter生成・照合                    |
| 通信         | ローカルHTTPサーバーの起動・停止・レスポンス |
| IPC          | Main→Renderer認証状態通知                    |
| エラー処理   | OAuthエラー時のフォールバック                |

---

## 成果物

| 成果物       | パス                                         | 説明                 |
| ------------ | -------------------------------------------- | -------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件定義 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能な完了条件   |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 範囲と除外事項       |

---

## 完了条件

- [ ] 機能要件FR-001〜FR-017が全て文書化されている
- [ ] 非機能要件NFR-001〜NFR-008が基準値とともに定義されている
- [ ] 受け入れ基準が8項目以上あり、全て検証可能な形式で記述されている
- [ ] スコープ定義に「含むもの」「含まないもの」が明記されている
- [ ] 3つの成果物ファイルが`outputs/phase-1/`に配置されている
- [ ] 技術的負債DEBT-SEC-001/002/003の解消が要件に含まれている
- [ ] 本Phase内の全タスクを100%実行完了している

---

## タスク100%実行確認

- [ ] Task 1: 機能要件定義 - 完了
- [ ] Task 2: 非機能要件定義 - 完了
- [ ] Task 3: 受け入れ基準策定 - 完了
- [ ] Task 4: スコープ定義 - 完了

---

## 次のPhase

[Phase 2: 設計](phase-2-design.md)
