# OAuth プロバイダー自動検出機能 - タスク指示書

## メタ情報

```yaml
issue_number: 732
```

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | UT-SEC-001                               |
| タスク名     | OAuth プロバイダー自動検出機能の実装     |
| 分類         | セキュリティ / 機能強化                  |
| 対象機能     | 認証フロー（State parameter検証）        |
| 優先度       | 低                                       |
| 見積もり規模 | 小規模                                   |
| ステータス   | 未実施                                   |
| 発見元       | Phase 12（DEBT-SEC-001実装時の設計乖離） |
| 発見日       | 2026-02-06                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

DEBT-SEC-001（State parameter CSRF防御）の実装時、当初の設計書では `validate(state, provider)` メソッドでstateとプロバイダーの両方を検証する予定だった。しかし、現在のImplicit FlowコールバックURLにはプロバイダー情報が含まれておらず、`detectProvider()` 関数も未実装のため、プロバイダー照合なしの `consumeState(state)` メソッドを採用した。

### 1.2 問題点・課題

| 問題                         | 詳細                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------- |
| プロバイダー未検証           | `consumeState()` はstateの存在・有効期限・ワンタイム性のみを検証                |
| 設計との乖離                 | 当初設計の `validate(state, provider)` が未実装                                 |
| クロスプロバイダー攻撃リスク | 理論上、Googleで開始したフローのstateをGitHubコールバックで使用可能（低リスク） |

### 1.3 放置した場合の影響

- **直接的影響**: 現在のセキュリティは最低限確保されており、即時リスクは低い
- **将来的リスク**: マルチプロバイダー環境でのstate横取り攻撃の理論的可能性
- **監査対応**: セキュリティ監査でプロバイダー検証不足を指摘される可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

OAuthコールバック処理時にプロバイダーを自動検出し、state生成時のプロバイダーと照合することで、クロスプロバイダー攻撃を防止する。

### 2.2 最終ゴール

- `detectProvider(callbackData)` 関数の実装
- `StateManager.validate(state, provider)` メソッドの有効化
- 現行の `consumeState()` を非推奨化し、`validate()` に移行
- ユニットテストカバレッジ 90% 以上

### 2.3 スコープ

#### 含むもの

- `detectProvider()` 関数の新規実装
- `StateManager.validate(state, provider)` の実装
- 既存フローへの統合（authHandlers.ts, customProtocol.ts）
- ユニットテスト・結合テストの追加

#### 含まないもの

- 新規OAuthプロバイダーの追加
- OAuth設定の変更
- Supabase Auth API の変更

### 2.4 成果物

| 成果物               | パス                                                             |
| -------------------- | ---------------------------------------------------------------- |
| プロバイダー検出関数 | `apps/desktop/src/main/auth/providerDetection.ts`                |
| StateManager拡張     | `apps/desktop/src/main/infrastructure/stateManager.ts`           |
| ユニットテスト       | `apps/desktop/src/main/auth/__tests__/providerDetection.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- DEBT-SEC-001（State parameter実装）が完了していること
- 現在のOAuthフローが正常動作していること

### 3.2 依存タスク

| タスクID               | 内容                     | ステータス |
| ---------------------- | ------------------------ | ---------- |
| DEBT-SEC-001           | State parameter CSRF防御 | **完了**   |
| TASK-AUTH-CALLBACK-001 | OAuth PKCE移行           | **完了**   |

### 3.3 必要な知識

- OAuth 2.0 / OpenID Connect フロー
- Supabase Auth のコールバック仕様
- ElectronのカスタムプロトコルURL構造

### 3.4 推奨アプローチ

1. **コールバックデータの分析**: 各プロバイダー（Google, GitHub, Discord）のコールバックURL構造を調査
2. **検出ロジック設計**: コールバックURLまたはトークンのclaimsからプロバイダーを特定する方法を設計
3. **StateManager拡張**: `validate(state, provider)` メソッドを追加
4. **既存フローへの統合**: `consumeState()` から `validate()` への移行

### 3.5 実装課題と解決策（DEBT-SEC-001からの学び）

| 課題                                    | 解決策                                                                  |
| --------------------------------------- | ----------------------------------------------------------------------- |
| コールバックURLにプロバイダー情報がない | access_tokenをデコードし、`iss` (issuer) claimからプロバイダーを特定    |
| Implicit FlowではJWTのみで情報が限定    | `id_token` が存在する場合はそれを優先、なければ `access_token` から推測 |
| プロバイダー固有のURL形式               | 各プロバイダーのissuer URLをマッピングテーブルで管理                    |

**参照**: `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` セクション「技術的負債」

### 3.6 プロバイダー検出ロジック案

```typescript
// issuer URL → プロバイダーマッピング
const ISSUER_MAPPING: Record<string, OAuthProvider> = {
  "https://accounts.google.com": "google",
  "https://github.com": "github",
  "https://discord.com": "discord",
};

function detectProvider(idToken: string): OAuthProvider | null {
  const payload = decodeJwtPayload(idToken);
  const issuer = payload.iss;
  return ISSUER_MAPPING[issuer] ?? null;
}
```

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 概要                                  |
| ----- | ------------ | ------------------------------------- |
| 1     | 要件定義     | 各プロバイダーのコールバック仕様調査  |
| 2     | 設計         | 検出ロジック・StateManager拡張設計    |
| 3     | 設計レビュー | セキュリティ観点でのレビュー          |
| 4     | テスト作成   | TDDでテストケース作成                 |
| 5     | 実装         | `detectProvider()`, `validate()` 実装 |
| 6-9   | 品質保証     | カバレッジ確認、リファクタリング      |
| 10    | 最終レビュー | セキュリティレビュー                  |
| 11    | 手動テスト   | 各プロバイダーでの動作確認            |
| 12    | ドキュメント | security-implementation.md更新        |

### Phase 1: 要件定義（詳細）

#### 目的

各OAuthプロバイダーのコールバックデータ構造を調査し、プロバイダー検出の可能性を確認

#### 手順

1. Google OAuthコールバックの `id_token` / `access_token` 構造を確認
2. GitHub OAuthコールバックのデータ構造を確認
3. Discord OAuthコールバックのデータ構造を確認
4. 各プロバイダーで共通の検出可能フィールドを特定

#### 成果物

- プロバイダー別コールバック仕様書（調査結果）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `detectProvider()` が Google/GitHub/Discord を正しく識別する
- [ ] `StateManager.validate(state, provider)` がプロバイダー照合を行う
- [ ] プロバイダー不一致時に適切なエラーを返す
- [ ] 既存の `consumeState()` が内部的に `validate()` を使用するように変更

### 品質要件

- [ ] ユニットテストカバレッジ 90% 以上
- [ ] 各プロバイダーでの手動テスト完了
- [ ] セキュリティレビュー PASS

### ドキュメント要件

- [ ] `architecture-auth-security.md` の技術的負債テーブル更新（UT-SEC-001解消）
- [ ] `security-implementation.md` にプロバイダー検出ロジック追加
- [ ] Phase 12実装ガイド作成

---

## 6. 検証方法

### テストケース

| テストID | シナリオ                                    | 期待結果                         |
| -------- | ------------------------------------------- | -------------------------------- |
| T1       | Googleログイン → Googleコールバック         | state検証成功                    |
| T2       | Googleログイン → GitHubコールバック（偽装） | PROVIDER_MISMATCH エラー         |
| T3       | 不明なプロバイダー                          | UNKNOWN_PROVIDER エラー          |
| T4       | 有効期限切れstate                           | STATE_EXPIRED エラー（既存動作） |

### 検証手順

1. 開発環境で各プロバイダーのOAuthフローを実行
2. 意図的にプロバイダー不一致のコールバックを送信し、エラーハンドリングを確認
3. `pnpm --filter @repo/desktop test` でユニットテスト実行

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                 |
| -------------------------------- | ------ | -------- | ---------------------------------------------------- |
| id_tokenが利用不可なプロバイダー | 中     | 低       | access_tokenからの代替検出ロジックを用意             |
| JWTデコードエラー                | 中     | 低       | 検出失敗時は現行の `consumeState()` にフォールバック |
| 新規プロバイダー追加時の対応漏れ | 低     | 中       | ISSUER_MAPPINGを設定ファイル化                       |

---

## 8. 参照情報

### 関連ドキュメント

- [architecture-auth-security.md](/.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md) - 技術的負債 UT-SEC-001
- [security-implementation.md](/.claude/skills/aiworkflow-requirements/references/security-implementation.md) - PKCE/State実装詳細
- [interfaces-auth.md](/.claude/skills/aiworkflow-requirements/references/interfaces-auth.md) - 認証インターフェース定義

### 参考資料

- [OpenID Connect Core 1.0 - ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken)
- [JWT RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)

---

## 9. 備考

### 発見時の原文

DEBT-SEC-001 Phase 12完了記録より：

```
| 課題ID     | 内容                                                                                      | 対応方針                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| UT-SEC-001 | consumeState()がプロバイダー未検証。detectProvider実装でvalidate(state, provider)に置換可能 | DEBT-SEC-002（PKCE実装）のスコープに統合。Authorization Code Flowへの移行時に自然に解消 |
```

### 補足事項

- 現在のセキュリティは最低限確保されており、このタスクは「防御の深度を増す」ための改善
- PKCE実装（TASK-AUTH-CALLBACK-001）完了後も、Implicit Flowとの並行運用期間中はこの機能が有効
- 将来的にAuthorization Code Flow完全移行後は、この機能の必要性を再評価する
