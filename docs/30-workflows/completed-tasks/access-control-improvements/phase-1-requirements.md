# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 1                           |
| Phase名    | 要件定義                    |
| 前提Phase  | -                           |
| 後続Phase  | Phase 2                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-18                  |
| 機能名     | access-control-improvements |

---

## 目的

アクセス制御強化の機能要件・非機能要件を明確化し、OWASP A01: Broken Access Controlを解消するための認可機能要件を定義する。

## 背景

セキュリティ監査で発見されたアクセス制御の不備を修正するため、以下を明確に定義する必要がある：

1. どのメソッドに認可チェックが必要か
2. 認可チェックの入力・出力仕様
3. エラーレスポンス仕様
4. パフォーマンス要件

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 対象メソッドの特定

**目的**: 認可チェックが必要なメソッドを網羅的に特定する

**実行手順**:

1. `packages/shared/src/features/chat-history/chat-history-service.ts` を読み込む
2. 以下のメソッドを認可チェック対象として特定する：
   - `getSession(id: string)`: セッション取得
   - `deleteSession(id: string)`: セッション削除
   - `updateSession(id: string, data)`: セッション更新（存在する場合）
   - `exportToMarkdown(sessionId: string)`: Markdownエクスポート
   - `exportToJson(sessionId: string)`: JSONエクスポート
3. 各メソッドの現在のシグネチャを記録する
4. 既存の呼び出し元を調査し、影響範囲を特定する

**期待される成果物**:

- 対象メソッド一覧（メソッド名、現在のシグネチャ、呼び出し元）
- 影響範囲レポート

---

### タスク2: 機能要件の定義

**目的**: 認可チェックの機能要件を明確に定義する

**実行手順**:

1. 以下の機能要件を定義する：

   **FR-AUTH-001: セッション取得時の認可チェック**
   - 入力: sessionId, requestUserId
   - 処理: session.userId === requestUserId を検証
   - 成功時: セッションデータを返却
   - 失敗時: UnauthorizedError を投げる

   **FR-AUTH-002: セッション削除時の認可チェック**
   - 入力: sessionId, requestUserId
   - 処理: session.userId === requestUserId を検証
   - 成功時: 削除処理を実行
   - 失敗時: UnauthorizedError を投げる

   **FR-AUTH-003: セッション更新時の認可チェック**
   - 入力: sessionId, requestUserId, updateData
   - 処理: session.userId === requestUserId を検証
   - 成功時: 更新処理を実行
   - 失敗時: UnauthorizedError を投げる

   **FR-AUTH-004: エクスポート時の認可チェック**
   - 入力: sessionId, requestUserId
   - 処理: session.userId === requestUserId を検証
   - 成功時: エクスポート処理を実行
   - 失敗時: UnauthorizedError を投げる

2. 各要件のID、説明、受け入れ基準を記録する

**期待される成果物**:

- 機能要件一覧（FR-AUTH-001〜004）

---

### タスク3: 非機能要件の定義

**目的**: 認可チェックの非機能要件を定義する

**実行手順**:

1. 以下の非機能要件を定義する：

   **NFR-PERF-001: パフォーマンス影響**
   - 認可チェックによるレイテンシ増加: 最大10ms以内
   - DB問い合わせ: 既存のセッション取得クエリに含める（追加クエリなし）

   **NFR-SEC-001: セキュリティ原則**
   - Fail-Secure: エラー発生時はアクセス拒否
   - Deny by Default: 明示的な許可がない場合は拒否
   - 情報漏洩防止: エラーメッセージからセッション存在有無を推測させない

   **NFR-COMPAT-001: 後方互換性**
   - 既存のメソッドシグネチャ変更による呼び出し元の修正が必要
   - 段階的移行を可能にする設計

2. 各要件のID、説明、検証方法を記録する

**期待される成果物**:

- 非機能要件一覧（NFR-PERF-001, NFR-SEC-001, NFR-COMPAT-001）

---

### タスク4: エラーレスポンス仕様の定義

**目的**: 認可失敗時のエラーレスポンス仕様を定義する

**実行手順**:

1. UnauthorizedErrorクラスの仕様を定義する：

   ```typescript
   // エラー仕様
   class UnauthorizedError extends Error {
     name: "UnauthorizedError";
     message: "Access denied: You do not have permission to access this resource";
     code: "UNAUTHORIZED";
     statusCode: 403;
   }
   ```

2. エラーメッセージの原則を定義する：
   - セッションの存在有無を漏らさない（「セッションが見つかりません」ではなく「アクセス権限がありません」）
   - ユーザーIDを含めない（ログには記録可能）
   - 詳細なエラー情報は開発者向けログにのみ出力

**期待される成果物**:

- エラーレスポンス仕様書

---

### タスク5: 要件書の作成

**目的**: 上記で定義した要件を正式な要件書としてまとめる

**実行手順**:

1. `outputs/phase-1/` ディレクトリを作成する
2. 以下の内容を含む要件書を作成する：
   - 対象メソッド一覧
   - 機能要件一覧
   - 非機能要件一覧
   - エラーレスポンス仕様
   - 受け入れ基準
3. 要件書をレビュー可能な形式で保存する

**期待される成果物**:

- `outputs/phase-1/requirements-authorization.md`

---

## 参照資料

| 参照資料                     | パス                                                                           | 内容                 |
| ---------------------------- | ------------------------------------------------------------------------------ | -------------------- |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | 現在のサービス仕様   |
| セキュリティ設計原則         | `.claude/skills/aiworkflow-requirements/references/security-principles.md`     | Fail-Secure原則等    |
| エラーハンドリング仕様       | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラークラス設計指針 |
| OWASP A01                    | https://owasp.org/Top10/A01_2021-Broken_Access_Control/                        | アクセス制御の脆弱性 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                              | 内容                       |
| ------------------ | --------------------------------------------------------------------------------- | -------------------------- |
| チャット履歴仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`    | セッション・メッセージ仕様 |
| 認証・セキュリティ | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | 認証アーキテクチャ         |
| セキュリティ原則   | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | 認可設計原則               |

---

## 成果物

| 成果物     | パス                                            | 内容                             |
| ---------- | ----------------------------------------------- | -------------------------------- |
| 認可要件書 | `outputs/phase-1/requirements-authorization.md` | 機能要件・非機能要件・エラー仕様 |

---

## 統合テスト連携

**Phase 1での統合テスト連携アクション**:

- 認可要件（userId検証）を要件書に明記
- 統合テストで検証すべきシナリオを特定：
  - 所有者がセッションにアクセス: 成功
  - 非所有者がセッションにアクセス: UnauthorizedError
  - 存在しないセッションにアクセス: 適切なエラー（NotFoundまたはUnauthorized）

---

## 完了条件

- [ ] 対象メソッド一覧が作成されている
- [ ] 機能要件（FR-AUTH-001〜004）が定義されている
- [ ] 非機能要件（NFR-PERF-001, NFR-SEC-001, NFR-COMPAT-001）が定義されている
- [ ] エラーレスポンス仕様が定義されている
- [ ] 認可要件書が作成されている
- [ ] 統合テストシナリオが特定されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（タスク開始点）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/access-control-improvements/phase-2-design.md`
