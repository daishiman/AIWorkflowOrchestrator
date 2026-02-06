# 複数アカウントサポート - タスク指示書

## メタ情報

```yaml
issue_number: 724
```

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | TASK-AUTH-MULTI-ACCOUNT-001                   |
| タスク名     | 複数アカウントサポート                        |
| 分類         | 認証（auth）                                  |
| 対象機能     | OAuth認証（Desktop）                          |
| 優先度       | 低                                            |
| 見積もり規模 | 大規模                                        |
| ステータス   | 未着手                                        |
| 発見元       | TASK-AUTH-CALLBACK-001 Phase 1 スコープアウト |
| 発見日       | 2026-02-06                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-AUTH-CALLBACK-001（OAuth PKCE移行）のPhase 1要件定義で、複数アカウントサポートはスコープ外として除外された。現在の実装は単一アカウントのみをサポートしており、`AuthFlowOrchestrator`は`pendingFlows: Map<state, PendingAuthFlow>`で複数の**認証フロー**は並行管理できるが、**複数アカウントの同時ログイン**はサポートしていない。

### 1.2 問題点・課題

**現在の制限**:

| 項目                   | 現状                        | 理想状態                   |
| ---------------------- | --------------------------- | -------------------------- |
| 同時ログインアカウント | 1アカウントのみ             | 複数アカウント切り替え可能 |
| トークン管理           | 単一のアクセス/リフレッシュ | アカウント別に分離管理     |
| UI表示                 | 現在のユーザーのみ表示      | アカウント一覧と切り替えUI |
| セッション管理         | 1セッション                 | アカウント別セッション     |

**ユーザーシナリオ**:

- 個人アカウントと仕事用アカウントを同時に使いたい
- チーム内で複数の組織アカウントを切り替えたい

### 1.3 放置した場合の影響

| 影響領域     | 影響度 | 説明                                                 |
| ------------ | ------ | ---------------------------------------------------- |
| ユーザー体験 | Medium | アカウント切り替えのたびにログアウト→ログインが必要  |
| 生産性       | Medium | 複数組織で作業するユーザーのワークフローが中断される |
| 競合優位性   | Low    | 他のデスクトップアプリは複数アカウント対応が一般的   |

---

## 2. 何を達成するか（What）

### 2.1 目的

複数のOAuthアカウントを同時に管理し、ユーザーがアカウント間をシームレスに切り替えられるようにする。

### 2.2 最終ゴール

- アカウント追加（既存セッションを維持したまま新規ログイン）
- アカウント切り替え（アクティブアカウントの変更）
- アカウント削除（特定アカウントのログアウト）
- アカウント別のトークン分離管理
- 最大アカウント数の制限（推奨: 5アカウント）

### 2.3 スコープ

#### 含むもの

- `AccountManager` モジュール（アカウント一覧管理）
- `authSlice.ts` の複数アカウント対応（Zustand Store拡張）
- アカウント切り替えUI（ドロップダウン/サイドバー）
- アカウント別 `safeStorage` 暗号化トークン管理
- IPCチャンネル追加（`auth:switch-account`, `auth:add-account`, `auth:remove-account`）
- ユニットテスト・統合テスト

#### 含まないもの

- 組織（Organization）レベルの管理
- アカウント間のデータ共有/同期
- SSO（Single Sign-On）対応

### 2.4 成果物

| 種別         | 成果物                      | 配置先                                         |
| ------------ | --------------------------- | ---------------------------------------------- |
| 実装         | AccountManagerモジュール    | `apps/desktop/src/main/auth/accountManager.ts` |
| 実装         | authSlice複数アカウント拡張 | `apps/desktop/src/renderer/store/authSlice.ts` |
| 実装         | アカウント切り替えUI        | `apps/desktop/src/renderer/components/`        |
| 実装         | IPCハンドラ追加             | `apps/desktop/src/main/ipc/authHandlers.ts`    |
| テスト       | AccountManager単体テスト    | `apps/desktop/src/main/auth/__tests__/`        |
| ドキュメント | 設計ガイド                  | `docs/30-workflows/`                           |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] TASK-AUTH-CALLBACK-001（PKCE移行）が完了していること
- [ ] 単一アカウントでのOAuth認証が正常動作すること
- [ ] `safeStorage` によるトークン暗号化が動作すること

### 3.2 依存タスク

**先に完了している必要があるタスク**:

- TASK-AUTH-CALLBACK-001: PKCE移行（完了済み）

**同時実施可能なタスク**:

- task-auth-oauth-provider-expansion（OAuthプロバイダー追加）

### 3.3 必要な知識・スキル

- Electron `safeStorage` API（アカウント別暗号化）
- Zustand Slice パターン（状態拡張設計）
- OAuth 2.0 セッション管理
- React コンポーネント設計（Atomic Design）

### 3.4 推奨アプローチ

1. **AccountManager設計**: `Map<accountId, AccountSession>` でアカウント別セッション管理
2. **ストレージキー分離**: `safeStorage` のキーをアカウントIDでプレフィックス化（`auth_refresh_token_{accountId}`）
3. **アクティブアカウント管理**: Zustand `activeAccountId` で現在のアクティブアカウントを管理
4. **既存AuthFlowOrchestratorの活用**: PKCE移行で実装した`pendingFlows` Mapパターンを拡張

### 3.5 実装上の注意点（TASK-AUTH-CALLBACK-001の知見）

TASK-AUTH-CALLBACK-001で発見された課題と解決策。本タスク実装時の参考にすること。

| 課題                                         | 原因                                                                                                    | 解決策                                                 | 本タスクへの適用                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| カスタムプロトコルURLの`new URL()`パース失敗 | RFC 3986のauthorityコンポーネント解釈により`aiworkflow://auth/callback`の`auth`がホスト名と誤解釈される | `extractProtocolPath()`関数で独自パース実装            | アカウント別コールバック（`aiworkflow://auth/callback?account=xxx`）でも同じパース関数を使用すること |
| PKCEバリデーション定数のデッドコード化       | TDDのRed→Greenフェーズで定数を先に定義したが、実装側で別の値を使用してしまった                          | テストと実装で同一の定数ファイルをimportする設計に変更 | AccountManagerのバリデーション定数も共有定数ファイルで管理                                           |
| Zustandリスナー二重登録                      | React StrictModeの2回実行                                                                               | モジュールスコープフラグでガード                       | アカウント切り替えイベントリスナーにも同パターンを適用                                               |
| ルールファイルと仕様書の同期ギャップ         | DEBT-SEC解消後、`04-electron-security.md`の技術的負債テーブル更新を忘れた                               | 仕様書+rules+LOGS.mdの3箇所同時更新を標準化            | 新IPCチャンネル追加時に`channels.ts`ホワイトリスト + `04-electron-security.md` + 仕様書を同時更新    |

**参照先**:

- `architecture-auth-security.md` - 設計判断の背景セクション
- `skill-creator/references/patterns.md` - PKCE + ローカルHTTPサーバー認証パターン

---

## 4. 実行手順

### Phase構成

```
Phase 1: AccountManager設計・TDD Red
  ↓
Phase 2: ストレージ層拡張（safeStorage アカウント別管理）
  ↓
Phase 3: AuthFlowOrchestrator拡張（アカウント別フロー管理）
  ↓
Phase 4: Zustand Store拡張（authSlice複数アカウント対応）
  ↓
Phase 5: IPCハンドラ追加（switch/add/remove）
  ↓
Phase 6: UI実装（アカウント切り替えコンポーネント）
  ↓
Phase 7: TDD Green確認・統合テスト
  ↓
Phase 8: 手動テスト
  ↓
Phase 9: ドキュメント更新
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] アカウント追加（2つ以上のアカウントで同時ログイン）
- [ ] アカウント切り替え（アクティブアカウント変更）
- [ ] アカウント削除（特定アカウントのログアウト）
- [ ] アカウント別トークン分離管理
- [ ] 最大アカウント数制限（5アカウント）

### 品質要件

- [ ] AccountManagerユニットテスト（10テストケース以上）
- [ ] 統合テスト（アカウント切り替えフロー）
- [ ] テストカバレッジ80%以上
- [ ] ESLint/TypeScriptエラーゼロ

### ドキュメント要件

- [ ] システム仕様書更新（architecture-auth-security.md）
- [ ] IPCチャンネルドキュメント更新
- [ ] `channels.ts` ホワイトリスト更新

---

## 6. 検証方法

### ユニットテスト

1. アカウント追加成功
2. 最大数超過時のエラー
3. アカウント切り替え成功
4. 存在しないアカウントへの切り替え失敗
5. アカウント削除成功
6. アクティブアカウント削除時の自動切り替え
7. アカウント別トークン分離
8. safeStorage暗号化の正常動作

### 手動テスト

| No  | カテゴリ | テスト項目          | 操作手順                               | 期待結果                       |
| --- | -------- | ------------------- | -------------------------------------- | ------------------------------ |
| 1   | 正常系   | 2アカウント同時管理 | Google + GitHubで各1アカウントログイン | 両方のアカウントが一覧表示     |
| 2   | 正常系   | アカウント切り替え  | ドロップダウンで別アカウント選択       | UI全体がアカウントに応じて更新 |
| 3   | 正常系   | アカウント削除      | 特定アカウントをログアウト             | 一覧から削除、残りが維持       |
| 4   | 異常系   | 最大数超過          | 6アカウント目のログイン試行            | エラーメッセージ表示           |

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                         |
| ---------------------------------------- | ------ | -------- | -------------------------------------------- |
| safeStorageのキー数上限                  | Medium | Low      | アカウント数制限（5）で対応                  |
| アカウント間のデータ混在                 | High   | Medium   | AccountManagerで厳密なスコープ分離           |
| トークンリフレッシュの競合               | Medium | Medium   | アカウント別のリフレッシュキューを実装       |
| UI状態の不整合（切り替え時のフラッシュ） | Low    | High     | React Suspenseまたはローディング状態でカバー |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/main/auth/authFlowOrchestrator.ts` - 既存フロー管理（拡張ベース）
- `apps/desktop/src/main/auth/pkce.ts` - PKCE実装
- `apps/desktop/src/renderer/store/authSlice.ts` - 既存認証状態管理
- `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` - 認証アーキテクチャ
- `.claude/rules/03-state-management.md` - Zustand Sliceパターン
- `.claude/rules/04-electron-security.md` - Electron セキュリティルール

### 関連タスク

- TASK-AUTH-CALLBACK-001: PKCE移行（完了・ベース実装）
- DEBT-SEC-001/002/003: セキュリティ負債（完了）
- task-auth-oauth-provider-expansion: OAuthプロバイダー追加（同時実施可能）
- task-auth-token-refresh-optimization: トークンリフレッシュ最適化（依存関係あり）

---

## 9. 備考

### TASK-AUTH-CALLBACK-001からの設計資産

本タスクは以下のTASK-AUTH-CALLBACK-001の設計資産を活用できる:

- **`AuthFlowOrchestrator`**: `pendingFlows: Map<state, PendingAuthFlow>` パターンをアカウント別に拡張
- **`pkce.ts`**: アカウントごとに独立したPKCEフロー実行
- **`authCallbackServer.ts`**: ローカルHTTPサーバーはアカウント追加時も再利用可能
- **`extractProtocolPath()`**: カスタムプロトコルのパース処理はそのまま利用

### 苦戦ポイントの事前対策

1. **`new URL()`のカスタムプロトコル問題**: アカウントパラメータをコールバックURLに追加する場合も`extractProtocolPath()`を使い、`new URL()`を直接使わないこと
2. **Zustandリスナー二重登録**: アカウント切り替えイベントのリスナー登録にも`moduleScope`フラグパターンを適用
3. **ルール-仕様書同期**: 新IPCチャンネル追加時は`channels.ts` + `04-electron-security.md` + `architecture-auth-security.md`を同時更新
