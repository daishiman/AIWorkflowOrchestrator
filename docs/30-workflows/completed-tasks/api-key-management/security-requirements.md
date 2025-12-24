# APIプロバイダーAPIキー管理 - セキュリティ要件定義書

> **ドキュメント種別**: セキュリティ要件定義書（非機能要件）
> **対象タスク**: T-00-2: セキュリティ要件定義
> **作成日**: 2025-12-10
> **ステータス**: ドラフト
> **参照**: `docs/00-requirements/17-security-guidelines.md`

---

## 1. セキュリティ要件概要

### 1.1 目的

APIキー管理機能におけるセキュリティリスクを最小化し、APIキーの漏洩・不正利用を防止する。

### 1.2 脅威モデル

| 脅威                          | 影響度 | 発生確率 | リスクレベル |
| ----------------------------- | ------ | -------- | ------------ |
| APIキーの漏洩（クラウド破産） | 致命的 | 低       | 高           |
| ログファイルへの出力          | 高     | 中       | 高           |
| XSS攻撃によるキー窃取         | 高     | 低       | 中           |
| DevToolsからの不正アクセス    | 中     | 低       | 中           |
| 不正なIPC呼び出し             | 中     | 低       | 中           |
| メモリダンプからの漏洩        | 中     | 極低     | 低           |

### 1.3 セキュリティ設計原則

| 原則             | 適用方法                                          |
| ---------------- | ------------------------------------------------- |
| 最小権限         | Renderer側からはAPIキーの値に直接アクセスさせない |
| 多層防御         | 暗号化 + IPC検証 + ログ除外の組み合わせ           |
| フェイルセキュア | エラー時はアクセス拒否をデフォルトとする          |
| 完全な仲介       | すべてのAPIキーアクセスをMain Processで検証       |

---

## 2. 暗号化要件（NFR: Non-Functional Requirements）

### NFR-SEC-001: 保存時の暗号化

**カテゴリ**: セキュリティ - データ保護

**指標**: APIキーの暗号化率

**目標値**: 100%（すべてのAPIキーが暗号化保存される）

**測定方法**: electron-storeに保存されるデータを直接確認し、平文でないことを検証

**重要度**: Critical

**詳細要件**:

- Electron safeStorage APIを使用してOSのキーチェーン（macOS）/Credential Manager（Windows）で暗号化
- safeStorageが利用不可能な場合は、警告をログに出力し、平文保存は開発環境でのみ許可
- 本番ビルドではsafeStorage利用不可時にエラーとして処理

**受け入れ基準**:

```gherkin
Scenario: APIキーの暗号化保存（正常系）
  Given safeStorage APIが利用可能である
  When ユーザーがAPIキーを保存する
  Then APIキーはsafeStorage.encryptString()で暗号化される
  And electron-storeにはBase64エンコードされた暗号文が保存される
  And 保存されたデータからは元のAPIキーを復元できない（safeStorageなしで）

Scenario: safeStorage利用不可時（開発環境）
  Given NODE_ENV が "development" である
  And safeStorage.isEncryptionAvailable() が false を返す
  When ユーザーがAPIキーを保存する
  Then 警告ログ "[ApiKeyStorage] Encryption not available" が出力される
  And APIキーは平文で保存される

Scenario: safeStorage利用不可時（本番環境）
  Given NODE_ENV が "production" である
  And safeStorage.isEncryptionAvailable() が false を返す
  When ユーザーがAPIキーを保存する
  Then エラー "Secure storage is not available" が返される
  And APIキーは保存されない
```

---

### NFR-SEC-002: 復号化時のセキュリティ

**カテゴリ**: セキュリティ - データ保護

**指標**: 復号化されたAPIキーの露出範囲

**目標値**: Main Processのみ（Renderer側への露出ゼロ）

**測定方法**: IPC通信の監査、Renderer側コンソールログの確認

**重要度**: Critical

**詳細要件**:

- 復号化処理はMain Processでのみ実行
- 復号化されたAPIキーはRenderer側に直接返さない
- ワークフロー実行時にのみMain Process内でAPIキーを使用

**受け入れ基準**:

```gherkin
Scenario: APIキー取得時のRenderer側露出防止
  Given OpenAIのAPIキーが保存されている
  When Renderer側から apiKey:get チャネルを呼び出す
  Then "Operation not allowed from Renderer" エラーが返される
  And APIキーの値は返されない

Scenario: ワークフロー実行時のAPIキー使用
  Given OpenAIのAPIキーが保存されている
  When Main ProcessでAI APIを呼び出す必要がある
  Then Main Process内でAPIキーを復号化して使用する
  And 使用後はメモリ上のAPIキー参照を速やかにクリアする
```

---

## 3. アクセス制御要件

### NFR-SEC-003: IPC通信のsender検証

**カテゴリ**: セキュリティ - アクセス制御

**指標**: 不正なIPC呼び出しの拒否率

**目標値**: 100%（すべての不正呼び出しを拒否）

**測定方法**: withValidation()ラッパーの適用確認、セキュリティログの監査

**重要度**: High

**詳細要件**:

- 全APIキー関連IPCハンドラーに `withValidation()` を適用
- DevToolsからの呼び出しを拒否
- 許可されたBrowserWindowからの呼び出しのみ受け付け

**実装パターン**（`apps/desktop/src/main/infrastructure/security/ipc-validator.ts` 参照）:

```typescript
// APIキーハンドラーへの適用例
ipcMain.handle(
  "apiKey:save",
  withValidation(
    "apiKey:save",
    async (event, { provider, apiKey }) => {
      // 保存処理
    },
    { getAllowedWindows: () => [mainWindow] },
  ),
);
```

**受け入れ基準**:

```gherkin
Scenario: 正当なウィンドウからのIPC呼び出し
  Given mainWindowが許可リストに含まれている
  When mainWindowからapiKey:saveを呼び出す
  Then 呼び出しが許可される
  And 保存処理が実行される

Scenario: DevToolsからの不正呼び出し
  Given DevToolsが開いている
  When DevToolsコンソールからapiKey:saveを呼び出す
  Then IPC_FORBIDDEN エラーが返される
  And セキュリティログに警告が記録される
  And 保存処理は実行されない

Scenario: 未許可ウィンドウからの呼び出し
  Given 新規作成されたBrowserWindowがある
  And そのウィンドウは許可リストに含まれていない
  When そのウィンドウからapiKey:saveを呼び出す
  Then IPC_FORBIDDEN エラーが返される
  And セキュリティログに警告が記録される
```

---

### NFR-SEC-004: 入力バリデーション

**カテゴリ**: セキュリティ - 入力検証

**指標**: 不正入力の拒否率

**目標値**: 100%

**測定方法**: Zodスキーマによるバリデーションテスト

**重要度**: High

**詳細要件**:

- プロバイダー種別はenum値のみ許可（ホワイトリスト方式）
- APIキーは文字列型、最小1文字、最大256文字
- インジェクション攻撃パターンを含む入力を拒否

**Zodスキーマ定義**:

```typescript
// 許可されるプロバイダー（ホワイトリスト）
const aiProviderSchema = z.enum(["openai", "anthropic", "google", "xai"]);

// APIキースキーマ
const apiKeySchema = z.object({
  provider: aiProviderSchema,
  apiKey: z
    .string()
    .min(1, "APIキーを入力してください")
    .max(256, "APIキーが長すぎます")
    .refine((key) => !/[<>'";&|]/.test(key), "無効な文字が含まれています"),
});
```

**受け入れ基準**:

```gherkin
Scenario: 有効なプロバイダーとAPIキー
  Given provider が "openai" である
  And apiKey が "sk-test1234567890" である
  When バリデーションを実行する
  Then バリデーションが成功する

Scenario: 無効なプロバイダー
  Given provider が "invalid-provider" である
  When バリデーションを実行する
  Then "Invalid enum value" エラーが返される

Scenario: インジェクション攻撃パターン
  Given apiKey が "<script>alert('xss')</script>" である
  When バリデーションを実行する
  Then "無効な文字が含まれています" エラーが返される

Scenario: 空のAPIキー
  Given apiKey が "" である
  When バリデーションを実行する
  Then "APIキーを入力してください" エラーが返される

Scenario: 過度に長いAPIキー
  Given apiKey が 300文字の文字列である
  When バリデーションを実行する
  Then "APIキーが長すぎます" エラーが返される
```

---

## 4. ログ出力からの機密情報漏洩防止要件

### NFR-SEC-005: APIキーのログ出力禁止

**カテゴリ**: セキュリティ - 情報漏洩防止

**指標**: ログファイル内のAPIキー出現数

**目標値**: 0（絶対にログ出力しない）

**測定方法**: 全ログファイルの`sk-`、`xai-`パターン検索、コードレビュー

**重要度**: Critical

**詳細要件**:

- APIキーの値をconsole.log/warn/errorに出力しない
- エラーログにはプロバイダー種別のみ記録（キー値は記録しない）
- デバッグ目的でもAPIキーをログ出力しない

**禁止パターン**:

```typescript
// 禁止: APIキーをログ出力
console.log(`Saving API key: ${apiKey}`);
console.error(`Invalid key: ${apiKey}`);

// 許可: プロバイダー情報のみログ出力
console.log(`[ApiKeyStorage] Saving key for provider: ${provider}`);
console.error(`[ApiKeyStorage] Validation failed for provider: ${provider}`);
```

**受け入れ基準**:

```gherkin
Scenario: APIキー保存時のログ出力
  Given ユーザーがOpenAIのAPIキーを保存する
  When 保存処理が実行される
  Then ログには "[ApiKeyStorage] Saved key for provider: openai" が出力される
  And ログにはAPIキーの値が含まれない

Scenario: APIキー検証失敗時のログ出力
  Given ユーザーが無効なAPIキーを検証する
  When 検証処理が実行される
  Then ログには "[ApiKeyValidator] Validation failed for provider: openai" が出力される
  And ログにはAPIキーの値が含まれない
  And ログにはエラーの種類（401 Unauthorized等）が出力される

Scenario: 例外発生時のスタックトレース
  Given APIキー関連処理で例外が発生する
  When スタックトレースがログに出力される
  Then スタックトレースにはAPIキーの値が含まれない
```

---

### NFR-SEC-006: エラーメッセージの安全性

**カテゴリ**: セキュリティ - 情報漏洩防止

**指標**: エラーメッセージ内の機密情報露出

**目標値**: 0（機密情報を含むエラーメッセージなし）

**測定方法**: UIに表示されるエラーメッセージの監査

**重要度**: High

**詳細要件**:

- ユーザー向けエラーメッセージにはAPIキーを含めない
- 内部エラーの詳細をユーザーに露出しない
- エラーコードとユーザーフレンドリーなメッセージの分離

**受け入れ基準**:

```gherkin
Scenario: 無効なAPIキーのエラーメッセージ
  Given ユーザーが無効なAPIキーを入力した
  When 検証が失敗する
  Then "APIキーが無効です。正しいキーを入力してください。" が表示される
  And エラーメッセージにAPIキーの値は含まれない
  And エラーメッセージにAPIエンドポイントの詳細は含まれない

Scenario: 内部エラー発生時のメッセージ
  Given 保存処理中に予期せぬエラーが発生した
  When エラーがユーザーに表示される
  Then "保存に失敗しました。しばらく経ってから再試行してください。" が表示される
  And スタックトレースはユーザーに表示されない
```

---

## 5. Electronセキュリティ設定要件

### NFR-SEC-007: contextIsolation設定

**カテゴリ**: セキュリティ - Electron設定

**指標**: contextIsolation設定値

**目標値**: true（必須）

**測定方法**: BrowserWindow設定の確認

**重要度**: Critical

**詳細要件**:

- contextIsolation: true を維持
- preloadスクリプト経由でのみRenderer側にAPIを公開
- Node.jsのグローバルオブジェクトをRenderer側に露出しない

**受け入れ基準**:

```gherkin
Scenario: contextIsolation設定の確認
  Given デスクトップアプリが起動する
  When BrowserWindowが作成される
  Then webPreferences.contextIsolation が true である
  And webPreferences.nodeIntegration が false である
  And webPreferences.sandbox が true である
```

---

### NFR-SEC-008: preloadスクリプトでのAPI公開制限

**カテゴリ**: セキュリティ - Electron設定

**指標**: 公開されるAPIの数

**目標値**: 必要最小限（保存・削除・一覧・検証のみ）

**測定方法**: preloadスクリプトのコードレビュー

**重要度**: High

**詳細要件**:

- contextBridge.exposeInMainWorld()で公開するAPIを最小限に
- APIキーの値を返すAPIは公開しない
- 各APIはZodスキーマでバリデーション済みの引数のみ受け付け

**公開API一覧**（限定的）:

| API             | 用途     | 引数             | 戻り値                                |
| --------------- | -------- | ---------------- | ------------------------------------- |
| apiKey.save     | 保存     | provider, apiKey | { success, error? }                   |
| apiKey.delete   | 削除     | provider         | { success, error? }                   |
| apiKey.list     | 一覧取得 | なし             | { providers: { name, registered }[] } |
| apiKey.validate | 検証     | provider, apiKey | { valid, error? }                     |

**注意**: `apiKey.get` は公開しない（Main Process内でのみ使用）

**受け入れ基準**:

```gherkin
Scenario: 公開APIの確認
  Given アプリが起動している
  When Renderer側でwindow.electronAPI.apiKeyを確認する
  Then save, delete, list, validate メソッドのみが存在する
  And get メソッドは存在しない
```

---

## 6. セキュリティチェックリスト

### 6.1 開発時チェックリスト

- [ ] APIキーの値がconsole.log/warn/errorに出力されていないか
- [ ] エラーメッセージにAPIキーが含まれていないか
- [ ] IPC handlerにwithValidation()が適用されているか
- [ ] Zodスキーマでバリデーションしているか
- [ ] safeStorageで暗号化しているか

### 6.2 コードレビューチェックリスト

- [ ] APIキーを含む変数名が適切か（key, secretなど明確な命名）
- [ ] try-catchでエラーハンドリングし、機密情報を露出していないか
- [ ] テストコードにハードコードされたAPIキーがないか
- [ ] .envファイルに本物のAPIキーがコミットされていないか

### 6.3 リリース前チェックリスト

- [ ] pnpm auditで脆弱性がないか確認
- [ ] safeStorage.isEncryptionAvailable()がtrueであることを確認
- [ ] contextIsolation: trueであることを確認
- [ ] 不要なconsole.log文が削除されているか確認
- [ ] 本番ビルドでDevToolsが無効化されているか確認

---

## 7. 用語集

| 用語                 | 定義                                                      |
| -------------------- | --------------------------------------------------------- |
| safeStorage          | ElectronのOS提供キーチェーンを使用した暗号化API           |
| contextIsolation     | preloadスクリプトとRenderer側のコンテキストを分離する設定 |
| withValidation       | IPC呼び出し元を検証するラッパー関数                       |
| IPC                  | Inter-Process Communication（プロセス間通信）             |
| XSS                  | Cross-Site Scripting（クロスサイトスクリプティング攻撃）  |
| インジェクション攻撃 | 不正な入力によってシステムの動作を操作する攻撃            |

---

## 8. 関連ドキュメント

| ドキュメント                                                     | 用途                                       |
| ---------------------------------------------------------------- | ------------------------------------------ |
| `docs/00-requirements/17-security-guidelines.md`                 | プロジェクト全体のセキュリティガイドライン |
| `apps/desktop/src/main/infrastructure/security/ipc-validator.ts` | IPC検証の実装パターン                      |
| `apps/desktop/src/main/infrastructure/secureStorage.ts`          | 既存の暗号化ストレージ実装                 |
| `apps/desktop/src/main/ipc/validation.ts`                        | 入力バリデーションユーティリティ           |

---

## 9. 品質メトリクス

| メトリクス               | 目標値 | 測定方法                                |
| ------------------------ | ------ | --------------------------------------- |
| 暗号化カバレッジ         | 100%   | 全APIキーがsafeStorageで暗号化          |
| IPC検証カバレッジ        | 100%   | 全APIキーIPCにwithValidation適用        |
| ログ漏洩検出数           | 0件    | grep検索でAPIキーパターンが検出されない |
| バリデーションカバレッジ | 100%   | 全入力がZodスキーマで検証               |

---

## 変更履歴

| バージョン | 日付       | 変更内容 | 作成者       |
| ---------- | ---------- | -------- | ------------ |
| 1.0.0      | 2025-12-10 | 初版作成 | .claude/agents/req-analyst.md |
