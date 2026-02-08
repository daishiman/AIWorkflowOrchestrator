# 設計レビュー結果: Claude Agent SDK 認証キー管理基盤

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-FIX-16-1-SDK-AUTH-INFRASTRUCTURE    |
| タスク名     | Claude Agent SDK用認証キー管理基盤の構築 |
| レビュー日   | 2026-02-08                               |
| Phase        | 3 (設計レビュー)                         |
| ドキュメント | 設計レビュー結果                         |
| 更新         | v1.1 - 追加レビュー反映                  |

---

## 判定結果

| 項目        | 結果                                   |
| ----------- | -------------------------------------- |
| **判定**    | **MINOR**                              |
| **次Phase** | 指摘対応後 Phase 4（テスト作成）へ進む |

---

## レビュー観点別評価

### 1. 要件との整合性

| 要件ID | 要件名                   | 評価 | 備考                                      |
| ------ | ------------------------ | ---- | ----------------------------------------- |
| FR-1   | 認証キーの暗号化保存     | OK   | safeStorage + electron-store で設計済み   |
| FR-2   | query() への認証キー渡し | OK   | SkillExecutor 統合設計が明確              |
| FR-3   | キー未設定時のエラー     | OK   | エラーコード 3001/3002 で設計済み         |
| FR-4   | IPC API 提供             | OK   | 4チャンネル（set/exists/validate/delete） |
| NFR-1  | セキュリティ             | OK   | Main Process 限定、ログ除外、sender 検証  |
| NFR-2  | 可用性                   | OK   | 環境変数フォールバック、遅延初期化        |
| NFR-3  | パフォーマンス           | OK   | メモリキャッシュ設計                      |

**結論**: 全要件がカバーされている。

---

### 2. セキュリティ設計

| 観点                         | 評価 | 備考                                      |
| ---------------------------- | ---- | ----------------------------------------- |
| Main Process 限定アクセス    | OK   | AuthKeyStorage/Service は Main に配置     |
| Renderer への非送信          | OK   | `auth-key:get` チャンネルは存在しない     |
| ログからの除外               | OK   | sanitizeError で `[REDACTED]` 置換        |
| IPC sender 検証              | OK   | 全ハンドラーで validateIpcSender 呼び出し |
| 暗号化                       | OK   | safeStorage API 使用                      |
| 暗号化不可時のフォールバック | OK   | 開発環境:警告、本番環境:エラー            |

**結論**: 04-electron-security.md の原則に準拠。

---

### 3. 設計品質

| 観点                 | 評価 | 備考                                            |
| -------------------- | ---- | ----------------------------------------------- |
| 単一責務原則         | OK   | Storage/Service/Handler が分離                  |
| インターフェース分離 | OK   | IAuthKeyService, IAuthKeyStorage                |
| 循環依存             | OK   | 依存方向が一方向（Handler → Service → Storage） |
| 依存性逆転           | OK   | SkillExecutor は IAuthKeyService に依存         |
| 後方互換性           | OK   | コンストラクタはオプション引数                  |

**結論**: 設計原則に準拠。

---

### 4. 型安全性

| 観点              | 評価 | 備考                                       |
| ----------------- | ---- | ------------------------------------------ |
| TypeScript 型定義 | OK   | 詳細な型定義書が提供されている             |
| エラーコード範囲  | OK   | 4001 は Infrastructure Error 範囲 (対応済) |
| Zod スキーマ      | OK   | リクエストバリデーション設計済み           |
| 型ガード          | OK   | isAuthKeyError 等を提供                    |

**結論**: 型定義は適切に設計されている。

---

### 5. IPC 設計

| 観点                 | 評価  | 備考                                     |
| -------------------- | ----- | ---------------------------------------- |
| チャンネル名         | OK    | AUTH_KEY_CHANNELS で定数化               |
| 入力バリデーション   | OK    | Zod スキーマで設計済み                   |
| sender 検証          | MINOR | 既存パターン withValidation との統一推奨 |
| エラーレスポンス形式 | OK    | { success, error? } 形式                 |

**指摘事項 M-2**: 既存の `authHandlers.ts` では `withValidation` ラッパーを使用している。新しいハンドラーでも同じパターンを使用することで一貫性を保つことを推奨。

---

### 6. 既存コードベースとの整合性

#### 6.1 channels.ts の状況

| ファイル                               | 状況  | 備考                                                                   |
| -------------------------------------- | ----- | ---------------------------------------------------------------------- |
| `apps/desktop/src/preload/channels.ts` | OK    | AUTH*KEY*\* チャンネルが追加済み、ALLOWED_INVOKE_CHANNELS にも登録済み |
| `packages/shared/src/ipc/channels.ts`  | MINOR | AUTH_KEY_CHANNELS の追加が必要（設計書に記載）                         |

**指摘事項 M-7**: 設計書では `packages/shared/src/ipc/channels.ts` に `AUTH_KEY_CHANNELS` を追加する方針だが、実際は `preload/channels.ts` にのみ存在。共有パッケージへの統合を検討。

#### 6.2 SkillExecutor.ts の現状

現在の `SkillExecutor.ts` には既に TASK-FIX-16-1 の一部として以下が実装されている:

| 項目                        | 状況   | 備考                                         |
| --------------------------- | ------ | -------------------------------------------- |
| `IAuthKeyService` の import | 実装済 | `../auth/types` から import                  |
| `authKeyService` プロパティ | 実装済 | コンストラクタでオプション引数として受け取り |
| `getApiKey()` メソッド      | 実装済 | AuthKeyService 経由 + 環境変数フォールバック |
| エラーハンドリング          | 実装済 | `AUTHENTICATION_ERROR` コードで処理          |

**指摘事項 M-8**: 設計書と実装で差異がある:

- 設計書: `IAuthKeyService` を `services/auth/IAuthKeyService.ts` に配置
- 実装: `services/auth/types.ts` から import

統一が必要。既存の `types.ts` を正とするか、設計書どおり分離するかを決定。

#### 6.3 secureStorage.ts パターン準拠

| 項目                                         | 評価 | 備考                        |
| -------------------------------------------- | ---- | --------------------------- |
| 遅延初期化パターン                           | OK   | `getStore()` パターンを踏襲 |
| safeStorage.isEncryptionAvailable() チェック | OK   | 設計書に明記                |
| 暗号化不可時のフォールバック                 | OK   | 開発/本番で分岐             |

---

### 7. 既知の落とし穴（06-known-pitfalls.md）

| ID  | 落とし穴                | 対策状況 | 備考                                       |
| --- | ----------------------- | -------- | ------------------------------------------ |
| P5  | リスナー二重登録        | OK       | registerAuthKeyHandlers は一度だけ呼び出し |
| P8  | 幽霊依存                | OK       | 依存関係が明確に定義                       |
| P12 | 外部SDK自動処理との競合 | 要確認   | SDK が apiKey オプションを受け付けるか確認 |

**指摘事項 M-3**: Claude Agent SDK が `apiKey` オプションを受け付けることを実装時に確認する必要がある。SDK のデフォルト認証処理との競合がないかも確認すること。

---

### 8. 追加確認事項

**指摘事項 M-6**: `validateKey()` メソッドが実際に API 呼び出しを行う設計になっている。これは以下の懸念がある：

- 課金が発生する可能性
- ネットワークエラー時の挙動

軽量な検証方法として `/v1/models` エンドポイント（GET）を使用するか、形式チェックのみにすることを検討。

---

## MINOR 指摘事項一覧

| ID  | 分類               | 内容                                                | 対応優先度 | 状態   |
| --- | ------------------ | --------------------------------------------------- | ---------- | ------ |
| M-1 | 型安全性           | EncryptionUnavailableError のコードを 4001 に変更   | 中         | 対応済 |
| M-2 | IPC 設計           | withValidation ラッパーの使用で既存パターンと統一   | 低         | 未対応 |
| M-3 | 統合               | SDK の apiKey オプション対応を実装時に確認          | 中         | 未対応 |
| M-4 | エラーハンドリング | AppError との関係を設計書に明記（現設計で問題なし） | 低         | 未対応 |
| M-5 | 設計明確化         | 既存 SecureStorage との関係を設計書に追記           | 低         | 未対応 |
| M-6 | API 設計           | validateKey の検証方法を検討（軽量化推奨）          | 中         | 未対応 |
| M-7 | チャンネル配置     | packages/shared への AUTH_KEY_CHANNELS 統合を検討   | 低         | 未対応 |
| M-8 | 型定義配置         | IAuthKeyService の定義位置を統一                    | 低         | 未対応 |

---

## 対応方針

### Phase 4 開始前に対応すべき項目

**なし** - M-1 は既に型定義設計書で対応済み（エラーコード 4001）。

### Phase 5 実装時の対応事項

1. **M-2**: IPC ハンドラーで `withValidation` ラッパーを使用
2. **M-3**: SDK 確認タスクとして記録
   - Claude Agent SDK のドキュメントを確認し、`apiKey` オプションの使用方法を検証
3. **M-6**: 検証方法を決定（API 呼び出し vs 形式チェック vs 軽量エンドポイント）
4. **M-8**: `IAuthKeyService` の定義位置を統一（`types.ts` に統合推奨）

### Phase 12 ドキュメント更新時の対応事項

- M-4, M-5, M-7: ドキュメント修正

---

## 結論

設計は全体として適切であり、セキュリティ原則・設計原則に準拠している。MINOR 指摘事項は設計の本質に影響しない軽微な改善点である。

**Phase 4 開始前に必須の対応項目はなし。Phase 4（テスト作成）へ進むことを推奨する。**

---

## 参照資料

- Phase 1 成果物
  - `outputs/phase-1/requirements-definition.md`
  - `outputs/phase-1/acceptance-criteria.md`
- Phase 2 成果物
  - `outputs/phase-2/architecture-design.md`
  - `outputs/phase-2/type-definitions.md`
  - `outputs/phase-2/ipc-specification.md`
- プロジェクトルール
  - `.claude/rules/04-electron-security.md`
  - `.claude/rules/02-code-quality.md`
  - `.claude/rules/06-known-pitfalls.md`
- 既存コード参照
  - `apps/desktop/src/main/infrastructure/secureStorage.ts`
  - `apps/desktop/src/main/ipc/authHandlers.ts`
  - `apps/desktop/src/main/services/skill/SkillExecutor.ts`
  - `apps/desktop/src/preload/channels.ts`
  - `packages/shared/src/ipc/channels.ts`

---

## 変更履歴

| 日付       | 版  | 変更内容                                                  |
| ---------- | --- | --------------------------------------------------------- |
| 2026-02-08 | 1.0 | 初版作成                                                  |
| 2026-02-08 | 1.1 | 追加レビュー反映（M-7, M-8 追加、既存実装との整合性確認） |
