# セキュリティ実装・入力バリデーション

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## 入力バリデーション

### バリデーション原則

| 原則               | 説明                                                 |
| ------------------ | ---------------------------------------------------- |
| サーバーサイド必須 | クライアントバリデーションは補助的なもの             |
| ホワイトリスト方式 | 許可するパターンを定義する（ブラックリストは避ける） |
| 型の強制           | 文字列で受け取った数値は明示的に変換する             |
| 長さ制限           | すべての入力に最大長を設定する                       |
| サニタイズ         | HTML/SQLエスケープを適切に行う                       |

### 入力タイプ別バリデーション

| 入力タイプ           | バリデーション項目                                         |
| -------------------- | ---------------------------------------------------------- |
| ユーザー名           | 英数字のみ、3-30文字、予約語チェック                       |
| メールアドレス       | RFC 5322準拠、ドメイン存在確認（任意）                     |
| URL                  | プロトコル制限（http/https）、ドメインホワイトリスト       |
| ファイルパス         | パストラバーサル防止、許可ディレクトリ内チェック           |
| JSON                 | スキーマバリデーション、最大サイズ制限                     |
| ファイルアップロード | MIMEタイプ、拡張子、サイズ、マジックバイトチェック         |
| ファイル変換入力     | MIMEタイプ検証、最大コンテンツ長、文字エンコーディング確認 |
| YAML/Markdown/コード | 構文検証、BOM除去、改行コード正規化、最大ネスト深度        |

### SQLインジェクション対策

**必須対策**:

- パラメータ化クエリを使用する（Drizzle ORMは標準で対応）
- ユーザー入力を直接SQL文字列に結合しない
- ORDER BY句の動的生成には列名のホワイトリストを使用する
- LIMIT/OFFSET値は数値型に変換してから使用する

**Drizzle ORM使用時の注意点**:

- rawクエリの使用は最小限に抑える
- 動的なカラム名やテーブル名には検証済みの値のみ使用する
- トランザクション内でのユーザー入力処理は特に注意する

### XSS対策

**React標準の保護**:

- JSXでの変数展開は自動的にエスケープされる
- dangerouslySetInnerHTMLは原則使用禁止

**追加対策**:

- Content Security Policyヘッダーの設定
- HTTPOnlyクッキーの使用
- ユーザー入力のサニタイズ（DOMPurify等）
- URLスキームの検証（javascript:の拒否）

### Zodスキーマによるバリデーション

認証関連の入力バリデーションにはZodスキーマを使用し、型安全性とランタイム検証を統合する。

**実装場所**: `packages/shared/schemas/auth.ts`

**主要スキーマ**:

| スキーマ              | 対象              | セキュリティ対策                  |
| --------------------- | ----------------- | --------------------------------- |
| `oauthProviderSchema` | OAuthプロバイダー | 許可プロバイダーのホワイトリスト  |
| `displayNameSchema`   | 表示名            | XSS対策（特殊文字禁止）、長さ制限 |
| `avatarUrlSchema`     | アバターURL       | HTTPSのみ許可、URL形式検証        |

### ファイル変換のセキュリティ

**実装場所**: `packages/shared/src/services/conversion/`

RAG Conversion Systemでは、外部から受け取ったファイルコンテンツを処理するため、以下のセキュリティ対策を実施しています。

#### 入力検証

**BaseConverter共通検証**:

| 検証項目             | 実装内容                     | 目的                       |
| -------------------- | ---------------------------- | -------------------------- |
| MIMEタイプ検証       | `supportedMimeTypes`との照合 | 未対応形式の拒否           |
| コンテンツ長制限     | デフォルト100,000文字        | メモリ枯渇防止             |
| 文字エンコーディング | UTF-8検証、BOM除去           | 文字化け・不正データ防止   |
| ファイルパス検証     | パストラバーサル検出         | ディレクトリ外アクセス防止 |

**コンバーター固有の検証**:

| コンバーター      | 追加検証                                   |
| ----------------- | ------------------------------------------ |
| YAMLConverter     | YAML構文検証、最大ネスト深度チェック       |
| CodeConverter     | 正規表現パターンマッチング、言語識別       |
| MarkdownConverter | フロントマター構文検証、コードブロック検証 |

#### 正規化処理によるセキュリティ

**全コンバーター共通の正規化**:

- **BOM除去**: 0xFEFF（Byte Order Mark）の自動削除
- **改行コード統一**: CRLF/CR→LF変換でパース処理の一貫性を確保
- **連続空行制限**: 3行以上の連続空行を2行に削減（DoS対策）
- **行末空白除去**: トレーリングスペースの削除

**セキュリティ上の利点**:

- 不正なバイトシーケンスの除去
- パーサーの予期しない動作を防止
- メモリ使用量の最適化

#### リソース保護

**同時実行制御**:

- 最大同時実行数: 5件（`ConversionService`で制御）
- 同時実行数超過時: `RESOURCE_EXHAUSTED`エラーを返す
- 目的: CPUとメモリの過負荷防止

**タイムアウト制御**:

- デフォルトタイムアウト: 60秒
- Promise.race()による強制終了
- 目的: 無限ループ・スタック防止

**メモリ制限**:

- 最大コンテンツ長: 100,000文字（オプションで変更可能）
- 超過時: コンテンツをトリミング（エラーにはしない）
- 目的: ヒープメモリ枯渇防止

#### エラーハンドリング

**Result型によるエラー伝播**:

- 全ての変換処理は`Result<T, RAGError>`型を返す
- 例外は全てキャッチしてRAGErrorに変換
- エラーコンテキスト（fileId, mimeType, converterId）を保持

**エラーコード分類**:

| エラーコード         | 意味         | セキュリティ影響         |
| -------------------- | ------------ | ------------------------ |
| `VALIDATION_FAILED`  | 入力検証失敗 | 不正データの拒否         |
| `CONVERSION_FAILED`  | 変換処理失敗 | 構文エラー等の安全な処理 |
| `TIMEOUT`            | タイムアウト | DoS攻撃の緩和            |
| `RESOURCE_EXHAUSTED` | リソース不足 | 過負荷の防止             |

#### 正規表現のセキュリティ

**ReDoS（Regular Expression Denial of Service）対策**:

CodeConverterとMarkdownConverterで使用される正規表現は、以下の方針で実装：

- 後方参照を避ける
- ネストした量指定子を避ける
- 固定長パターンを優先
- 正規表現タイムアウトは未実装（将来検討）

**使用正規表現の例**:

```typescript
// 関数定義（安全なパターン）
/(?:export\s+)?(?:async\s+)?function\s+(\w+)/g

// 見出し抽出（安全なパターン）
/^(#{1,6})\s+(.+)$/gm
```

#### テスト検証済みのセキュリティ

**Phase 6-8で検証済み**:

- ✅ 空ファイル処理（例外を発生させない）
- ✅ 不正なMIMEタイプ拒否
- ✅ 最大コンテンツ長のトリミング
- ✅ タイムアウト処理
- ✅ 同時実行数制御
- ✅ 100%テストカバレッジ（全ての分岐を検証）

### 新規コンバーター追加時のセキュリティチェックリスト

新しいファイル変換コンバーターを実装する際に必ず確認すべきセキュリティ要件。

#### 必須セキュリティ要件

| #   | 要件                           | 確認方法                                  | 理由                       |
| --- | ------------------------------ | ----------------------------------------- | -------------------------- |
| 1   | MIMEタイプのホワイトリスト検証 | `supportedMimeTypes`配列の定義確認        | 未対応形式の拒否           |
| 2   | 最大コンテンツ長の制限         | `trimContent()`呼び出しの確認             | メモリ枯渇防止             |
| 3   | BOM除去の実装                  | 正規化処理での0xFEFFチェック              | 不正バイトシーケンス除去   |
| 4   | 改行コード正規化               | CRLF/CR→LF変換の実装                      | パーサー保護               |
| 5   | 行末空白の除去                 | トレーリングスペース削除                  | 不要データ除去             |
| 6   | 連続空行の制限                 | 3行以上→2行の実装                         | DoS対策                    |
| 7   | ファイルパス検証               | パストラバーサル検出                      | ディレクトリ外アクセス防止 |
| 8   | タイムアウト対応               | ConversionServiceのタイムアウト機構を活用 | 無限ループ防止             |
| 9   | エラー情報の適切なマスキング   | エラーメッセージに機密情報を含めない      | 情報漏洩防止               |
| 10  | Result型でのエラー返却         | 例外をスローせずResult型を返す            | エラー処理の統一           |

#### 正規表現使用時の追加要件

**ReDoS（Regular Expression Denial of Service）対策**:

| #   | 要件                         | 例                                                 | 理由                   |
| --- | ---------------------------- | -------------------------------------------------- | ---------------------- |
| 1   | 後方参照を避ける             | `\1`, `\2` を使用しない                            | バックトラッキング削減 |
| 2   | ネストした量指定子を避ける   | `(a+)+` のようなパターンを避ける                   | 指数時間爆発の防止     |
| 3   | 固定長パターンを優先         | `\w{3,30}` ではなく `\w+` に長さチェックを別途実装 | 予測可能な性能         |
| 4   | グローバルフラグの慎重な使用 | `/pattern/g` の繰り返しマッチングに注意            | 無限ループ防止         |

**安全な正規表現の例**:

```typescript
// ✅ 安全
/^(#{1,6})\s+(.+)$/gm              // Markdown見出し
/(?:export\s+)?function\s+(\w+)/g  // 関数定義

// ⚠️ 注意が必要
/(a+)+b/                           // ネスト量指定子（ReDoSリスク）
/(.+)*end/                         // 貪欲マッチ+繰り返し（ReDoSリスク）
```

#### 入力検証の実装パターン

**BaseConverter継承時に自動適用される検証**:

- MIMEタイプ検証: `canHandle()` メソッドで自動実施
- コンテンツ長制限: `convert()` メソッドで自動トリミング
- エラーハンドリング: `convert()` メソッドでtry-catch自動適用

**コンバーター固有の追加検証**:

```typescript
protected async doConvert(
  input: ConverterInput,
  options: ConverterOptions
): Promise<Result<ConverterOutput, RAGError>> {
  try {
    const content = this.getTextContent(input);

    // カスタム検証1: 最大ネスト深度チェック（YAML等）
    const maxDepth = this.calculateDepth(content);
    if (maxDepth > 20) {
      return err(
        createRAGError(
          ErrorCodes.VALIDATION_FAILED,
          "Nesting depth exceeds maximum allowed (20)",
          { maxDepth, limit: 20 }
        )
      );
    }

    // カスタム検証2: 構文検証
    if (!this.isValidSyntax(content)) {
      return err(
        createRAGError(
          ErrorCodes.VALIDATION_FAILED,
          "Invalid syntax detected"
        )
      );
    }

    // ... 変換処理 ...
  } catch (error) {
    // エラー情報から機密情報を除外
    const sanitizedMessage = this.sanitizeErrorMessage(error);
    return err(
      createRAGError(
        ErrorCodes.CONVERSION_FAILED,
        sanitizedMessage,
        { converterId: this.id }
      )
    );
  }
}
```

#### テストでのセキュリティ検証

**必須テストケース**:

| #   | テストケース     | 目的                                     |
| --- | ---------------- | ---------------------------------------- |
| 1   | 空文字列入力     | 例外を発生させないことを確認             |
| 2   | 最大長超過入力   | トリミングが正しく動作することを確認     |
| 3   | 不正なMIMEタイプ | `canHandle()`がfalseを返すことを確認     |
| 4   | 不正な構文       | エラーを適切にハンドリングすることを確認 |
| 5   | 特殊文字入力     | XSS、SQLインジェクション対策の確認       |
| 6   | Unicode文字      | エンコーディング処理の確認               |
| 7   | BOM付き入力      | BOM除去の確認                            |
| 8   | 複数の改行コード | 正規化の確認                             |

**セキュリティテストの例**:

```typescript
describe("Security Tests", () => {
  it("should not expose file system paths in errors", async () => {
    const converter = new CustomConverter();
    const input = createTestInput({
      filePath: "/secret/config/database.yml",
    });

    // 故意にエラーを発生させる
    const result = await converter.convert(input, {});

    if (!result.success) {
      // エラーメッセージに機密パスが含まれないことを確認
      expect(result.error.message).not.toContain("/secret/config");
    }
  });

  it("should handle ReDoS attack patterns safely", async () => {
    const converter = new CustomConverter();
    const maliciousInput = "a".repeat(100000) + "!";

    const startTime = Date.now();
    const result = await converter.convert(
      createTestInput({ content: maliciousInput }),
      { timeout: 1000 },
    );
    const elapsed = Date.now() - startTime;

    // タイムアウト以内に処理が完了することを確認
    expect(elapsed).toBeLessThan(1500);
  });
});
```

#### セキュリティレビューのチェックポイント

新規コンバーター実装後、Phase 7（最終レビューゲート）で確認：

**コードレビュー観点**:

- [ ] 入力検証が適切に実装されているか
- [ ] エラーメッセージに機密情報が含まれていないか
- [ ] 正規表現がReDoS脆弱性を持たないか
- [ ] メモリ使用量が制限内に収まっているか
- [ ] タイムアウト処理が適切に動作するか
- [ ] すべてのエラーパスがテストされているか

**静的解析ツール**:

- ESLint: セキュリティルールの適用
- TypeScript: strict モードでの型チェック
- Vitest: 100%コードカバレッジの確認

**手動セキュリティテスト**:

- 大容量ファイル攻撃（>10MB）
- 深いネスト攻撃（>100階層）
- 特殊文字インジェクション（`<script>`, `'; DROP TABLE`, 等）
- ReDoSパターン（`(a+)+b`）

---

## API セキュリティ

### 認証・認可フロー

**APIエンドポイント分類**:

| 分類     | 認証要件     | 例                             |
| -------- | ------------ | ------------------------------ |
| 公開     | 不要         | ヘルスチェック、公開情報取得   |
| 認証必須 | ログイン済み | ユーザー情報、ワークフロー操作 |
| 管理者   | 管理者権限   | システム設定、ユーザー管理     |
| 内部     | Agent認証    | Local Agent通信                |

**認証チェックの実装場所**:

- Next.js Middlewareでルート全体の認証チェック
- API Routeハンドラーでの詳細な認可チェック
- データアクセス層でのオーナーシップ検証

### レート制限

| エンドポイント種別   | 制限値        | 単位           |
| -------------------- | ------------- | -------------- |
| 一般API              | 100リクエスト | 1分間/IP       |
| 認証API              | 10リクエスト  | 1分間/IP       |
| AI処理API            | 10リクエスト  | 1分間/ユーザー |
| ファイルアップロード | 5リクエスト   | 1分間/ユーザー |

**実装方針**:

- メモリベースのレート制限（Redis不要で開始可能）
- 429ステータスコードと Retry-After ヘッダーの返却
- レート超過のログ記録
- 正当なユーザーへの影響を考慮した緩やかな制限

### CORS設定

| 環境 | 許可オリジン                   |
| ---- | ------------------------------ |
| 開発 | localhost:3000, localhost:3001 |
| 本番 | 本番ドメインのみ               |

**設定項目**:

- Access-Control-Allow-Origin: 明示的なオリジン指定（ワイルドカード禁止）
- Access-Control-Allow-Methods: 必要なメソッドのみ
- Access-Control-Allow-Headers: 必要なヘッダーのみ
- Access-Control-Allow-Credentials: 認証Cookie使用時はtrue

---

## 依存関係セキュリティ

### 脆弱性管理

**監査ツール**:

| ツール     | 用途                 | 実行タイミング     |
| ---------- | -------------------- | ------------------ |
| pnpm audit | 依存関係の脆弱性検出 | CI/CD、週次        |
| Dependabot | 自動PR作成           | 常時（GitHub設定） |
| Snyk       | 詳細な脆弱性分析     | 任意（無料枠あり） |

**対応フロー**:

1. 脆弱性検出時は重大度を確認する
2. Critical/Highは即時対応（24時間以内）
3. Mediumは次回リリースまでに対応
4. Lowは定期メンテナンスで対応
5. 修正不可能な場合は代替パッケージを検討する

### 依存関係の選定基準

| 基準             | 確認項目                                     |
| ---------------- | -------------------------------------------- |
| メンテナンス状況 | 最終更新日、Issue対応状況、メンテナー数      |
| セキュリティ     | 過去の脆弱性履歴、セキュリティポリシーの有無 |
| ライセンス       | MIT、Apache 2.0等の許容ライセンス            |
| 人気度           | GitHub Stars、npm週次ダウンロード数          |
| 依存の深さ       | 間接依存の数、依存関係の複雑さ               |

### lock ファイルの管理

- pnpm-lock.yamlは必ずコミットする
- lock ファイルの手動編集は禁止
- CI/CDでは`pnpm install --frozen-lockfile`を使用
- 依存更新は個別PRで管理し、変更内容を明確化する

---

## Electron セキュリティ

### セキュリティ設定

**BrowserWindow設定の必須項目**:

| 設定                        | 推奨値 | 理由                               |
| --------------------------- | ------ | ---------------------------------- |
| nodeIntegration             | false  | Rendererからのシステムアクセス防止 |
| contextIsolation            | true   | preloadスクリプトの分離            |
| sandbox                     | true   | Chromiumサンドボックスの有効化     |
| webSecurity                 | true   | Same-Originポリシーの強制          |
| allowRunningInsecureContent | false  | HTTP上のコンテンツ実行防止         |

### Content Security Policy (CSP)

ElectronアプリにCSPを適用し、XSS攻撃を防御する。

**実装場所**: `apps/desktop/src/main/infrastructure/security/csp.ts`

**環境別設定**:

| 環境 | script-src                           | unsafe-eval | 用途               |
| ---- | ------------------------------------ | ----------- | ------------------ |
| 本番 | 'self'                               | 禁止        | 厳格なセキュリティ |
| 開発 | 'self' 'unsafe-inline' 'unsafe-eval' | 許可        | HMR対応            |

**共通設定**:

- `object-src 'none'`: プラグイン無効化
- `frame-ancestors 'none'`: クリックジャッキング対策
- `upgrade-insecure-requests`: HTTP→HTTPS自動変換

### IPC通信のセキュリティ

**preloadスクリプトでのAPI公開**:

- contextBridgeを使用して限定的なAPIのみ公開する
- チャンネル名はホワイトリストで管理する
- 引数のバリデーションをMain側で実施する
- センシティブな操作にはユーザー確認ダイアログを表示する

**IPC sender検証**:

認証関連のIPCハンドラーには`withValidation`ラッパーを適用し、不正なsenderからの呼び出しを拒否する。

**実装場所**: `apps/desktop/src/main/infrastructure/security/ipc-validator.ts`

**検証項目**:

1. webContentsに対応するBrowserWindowの存在確認
2. DevToolsからの呼び出し検出・拒否
3. 許可されたウィンドウリストとの照合

**禁止事項**:

- ipcRenderer全体の公開
- nodeモジュールの直接公開
- ファイルシステムへの無制限アクセス
- シェルコマンドの無制限実行

### 自動更新のセキュリティ

| 項目         | 要件                         |
| ------------ | ---------------------------- |
| 更新ソース   | HTTPS経由のみ                |
| 署名検証     | コード署名の検証必須         |
| ロールバック | 失敗時の自動ロールバック機能 |
| 通知         | 更新内容のユーザーへの明示   |

---
