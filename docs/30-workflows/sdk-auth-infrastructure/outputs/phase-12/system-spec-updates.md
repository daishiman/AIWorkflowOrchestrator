# システム仕様書更新レポート

> タスク: TASK-FIX-16-1 Claude Agent SDK用認証キー管理基盤
> 日付: 2026-02-08
> Phase: 12 ドキュメント

---

## 概要

Claude Agent SDK用認証キー管理基盤（TASK-FIX-16-1）の機能開発内容を、aiworkflow-requirements スキルのシステム仕様書に反映しました。

---

## 更新した仕様書一覧

| 仕様書                           | 更新内容                                                   | バージョン      |
| -------------------------------- | ---------------------------------------------------------- | --------------- |
| security-principles.md           | Claude Agent SDK認証キー管理セクション追加                 | v1.2.0 → v1.3.0 |
| api-ipc-system.md                | auth-key IPCチャンネル4種の仕様追加                        | v1.1.0 → v1.2.0 |
| api-endpoints.md                 | Desktop IPC APIサマリーにSDK認証キーカテゴリ追加           | v2.1.0 → v2.2.0 |
| interfaces-agent-sdk-executor.md | AUTHENTICATION_ERROR追加、AuthKeyService統合セクション追加 | v1.3.0 → v1.4.0 |

---

## 詳細な変更内容

### 1. security-principles.md

**追加セクション**: Claude Agent SDK 認証キー管理（TASK-FIX-16-1）

- **アーキテクチャ**: AuthKeyService、AuthKeyStorage、IPCハンドラー、Preload API、SkillExecutor統合
- **セキュリティ設計**: safeStorage暗号化、Renderer分離、フォーマット検証、環境変数フォールバック
- **IPCチャンネル**: auth-key:set, auth-key:exists, auth-key:validate, auth-key:delete
- **エラーコード**: 3001-3004（External Service Error）、4001-4002（Infrastructure Error）
- **実装ファイルパス**: 4ファイル

### 2. api-ipc-system.md

**追加セクション**: Claude Agent SDK 認証キー管理 IPC チャネル（TASK-FIX-16-1）

- **チャンネル一覧**: 4チャンネル（set/exists/validate/delete）
- **型定義**: AuthKeySetRequest/Response, AuthKeyExistsResponse, AuthKeyValidateRequest/Response, AuthKeyDeleteResponse
- **セキュリティ設計**: 暗号化、Renderer分離、IPC検証、フォーマット検証、ログ出力制限
- **実装ファイル**: ハンドラー、サービス、チャンネル定義、Preload API

### 3. api-endpoints.md

**追加行**: Desktop IPC APIサマリーテーブルにSDK認証キーカテゴリを追加

| カテゴリ    | チャンネル例                                                      | 詳細              |
| ----------- | ----------------------------------------------------------------- | ----------------- |
| SDK認証キー | auth-key:set, auth-key:exists, auth-key:validate, auth-key:delete | api-ipc-system.md |

### 4. interfaces-agent-sdk-executor.md

**更新内容**:

1. **概要テーブル**: 認証依存 `IAuthKeyService` 追加
2. **SkillExecutionErrorCode テーブル**: `AUTHENTICATION_ERROR` 追加
3. **AuthKeyService 統合セクション新設**:
   - DI パラメータ: `authKeyService?: IAuthKeyService`
   - キー取得優先順位: AuthKeyService → 環境変数
   - キー未設定時: AUTHENTICATION_ERROR エラー
   - コンストラクタパラメータ一覧
   - キー取得フロー（4ステップ）

---

## 実装ファイル（参照用）

| ファイル                                                | 説明                     |
| ------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/main/services/auth/AuthKeyService.ts` | 認証キー管理サービス     |
| `apps/desktop/src/main/services/auth/types.ts`          | 型定義・インターフェース |
| `apps/desktop/src/main/ipc/authKeyHandlers.ts`          | IPCハンドラー            |
| `apps/desktop/src/preload/authKeyApi.ts`                | Preload API              |
| `apps/desktop/src/preload/channels.ts`                  | チャンネル定義           |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | SDK統合（getApiKey追加） |

---

## エラーコード一覧

| コード | 名称                   | 説明                  | カテゴリ               |
| ------ | ---------------------- | --------------------- | ---------------------- |
| 3001   | AUTH_KEY_NOT_SET       | 認証キー未設定        | External Service Error |
| 3002   | AUTH_KEY_INVALID       | 認証キー無効          | External Service Error |
| 3003   | VALIDATION_FAILED      | バリデーションエラー  | External Service Error |
| 3004   | NETWORK_ERROR          | ネットワークエラー    | External Service Error |
| 4001   | ENCRYPTION_UNAVAILABLE | safeStorage暗号化不可 | Infrastructure Error   |
| 4002   | STORAGE_ERROR          | ストレージエラー      | Infrastructure Error   |

---

## 確認チェックリスト

- [x] security-principles.md 更新
- [x] api-ipc-system.md 更新
- [x] api-endpoints.md 更新
- [x] interfaces-agent-sdk-executor.md 更新
- [x] 各仕様書の変更履歴更新
- [ ] topic-map.md 再生成（未実施：手動で `node generate-index.js` 実行が必要）

---

## 次のステップ

1. `node generate-index.js` を実行して topic-map.md を再生成
2. 必要に応じて architecture-overview.md に AuthKeyService を追加
3. 必要に応じて interfaces-auth.md に IAuthKeyService インターフェースを追加

---

## 関連ドキュメント

- [security-principles.md](../../../.claude/skills/aiworkflow-requirements/references/security-principles.md)
- [api-ipc-system.md](../../../.claude/skills/aiworkflow-requirements/references/api-ipc-system.md)
- [api-endpoints.md](../../../.claude/skills/aiworkflow-requirements/references/api-endpoints.md)
- [interfaces-agent-sdk-executor.md](../../../.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md)
