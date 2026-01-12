# 実装ガイド - HistoryService DB統合

## 文書情報

| 項目     | 内容                           |
| -------- | ------------------------------ |
| タスクID | history-service-db-integration |
| Phase    | 12                             |
| 作成日   | 2026-01-12                     |
| 状態     | 完了                           |

---

# Part 1: 概念的説明

## 1. HistoryServiceとは何か

### 1.1 図書館の司書のたとえ

HistoryServiceは、ファイルの「履歴」を管理するサービスです。

**たとえ話**:
図書館で本を借りると、司書さんが「いつ誰が借りたか」を記録します。HistoryServiceは、ファイルの「司書さん」のようなものです。

- **本** = ファイル
- **貸し出し記録** = バージョン履歴
- **司書さん** = HistoryService

```
[あなた] → 「このファイルの履歴を見せて」 → [HistoryService（司書）]
                                               ↓
[履歴データ] ← 「はい、これが履歴です」 ← [データベース（記録棚）]
```

### 1.2 できること

| 機能              | 説明                       | たとえ                       |
| ----------------- | -------------------------- | ---------------------------- |
| getFileHistory    | ファイルの履歴一覧を取得   | 本の貸し出し履歴を見る       |
| getVersionDetail  | 特定バージョンの詳細を取得 | 特定の貸し出し日の詳細を見る |
| getConversionLogs | 変換ログを取得             | 本の修理記録を見る           |
| restoreVersion    | 以前のバージョンに戻す     | 以前の状態に本を復元する     |

---

## 2. shared HistoryServiceとの統合とは

### 2.1 本社と支社の連携のたとえ

Electronアプリには「Electron HistoryService」があり、共有パッケージには「shared HistoryService」があります。

**たとえ話**:
会社で考えると...

- **本社（shared HistoryService）**: 全社共通のシステムを持っている。データベースに直接アクセスできる
- **支社（Electron HistoryService）**: お客様対応をする。本社のシステムを使って仕事をする

```
[お客様（Renderer）]
        ↓ 問い合わせ
[支社（Electron HistoryService）]
        ↓ 本社システム利用
[本社（shared HistoryService）]
        ↓ データベースアクセス
[データベース（Repository）]
```

### 2.2 なぜ分けているのか

| 理由         | 説明                                          |
| ------------ | --------------------------------------------- |
| 責任の分離   | 支社はお客様対応、本社はデータ管理            |
| 再利用性     | 本社システムは他の支社（Webアプリ等）も使える |
| テスト容易性 | それぞれ独立してテストできる                  |

---

## 3. DB接続とは

### 3.1 電話回線の接続のたとえ

データベース接続は、電話をかけるようなものです。

**たとえ話**:

```
[あなた（アプリ）] → 電話をかける → [電話会社（Repository）] → [相手（Database）]
```

- **電話番号** = 接続設定
- **通話** = クエリの実行
- **電話を切る** = 接続終了

### 3.2 今回の実装

以前のElectron HistoryServiceは「スタブ実装」でした。これは「電話のふりをしていた」状態です。

```
[Before]
お客様 → 「履歴を見せて」 → 支社 → 「ダミーデータです」（実際には電話していない）

[After]
お客様 → 「履歴を見せて」 → 支社 → 本社 → データベース → 「本物のデータです」
```

---

## 4. 全体アーキテクチャ

### 4.1 ASCII図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Electron App                                  │
│                                                                          │
│  ┌──────────────┐    ┌─────────┐    ┌─────────────────────────────────┐│
│  │   Renderer   │    │   IPC   │    │       Main Process              ││
│  │  (React UI)  │────│ Bridge  │────│                                 ││
│  └──────────────┘    └─────────┘    │  ┌──────────────────────────┐  ││
│                                      │  │  Electron HistoryService │  ││
│                                      │  │     (アダプター層)        │  ││
│                                      │  └───────────┬──────────────┘  ││
│                                      │              │                  ││
│                                      │              ▼                  ││
│                                      │  ┌──────────────────────────┐  ││
│                                      │  │  shared HistoryService   │  ││
│                                      │  │     (ビジネスロジック)    │  ││
│                                      │  └───────────┬──────────────┘  ││
│                                      │              │                  ││
│                                      │              ▼                  ││
│                                      │  ┌──────────────────────────┐  ││
│                                      │  │      Repository          │  ││
│                                      │  │    (データアクセス)       │  ││
│                                      │  └───────────┬──────────────┘  ││
│                                      │              │                  ││
│                                      └──────────────┼──────────────────┘│
│                                                     │                    │
└─────────────────────────────────────────────────────┼────────────────────┘
                                                      ▼
                                            ┌──────────────┐
                                            │   SQLite     │
                                            │  Database    │
                                            └──────────────┘
```

### 4.2 データの流れ

```
1. [Renderer] ユーザーが「履歴を見る」ボタンをクリック
        ↓
2. [IPC] history:getFileHistory メッセージを送信
        ↓
3. [Electron HistoryService] メッセージを受け取り、shared HistoryServiceを呼び出す
        ↓
4. [shared HistoryService] Repositoryを使ってデータベースに問い合わせ
        ↓
5. [Repository] SQLクエリを実行
        ↓
6. [Database] データを返す
        ↓
7. 逆順でRendererまで結果が返る
        ↓
8. [Renderer] 履歴一覧を画面に表示
```

---

## 5. 用語集

| 用語           | 読み方             | 意味                                          |
| -------------- | ------------------ | --------------------------------------------- |
| HistoryService | ヒストリーサービス | 履歴を管理するサービス                        |
| DI             | ディーアイ         | Dependency Injection（依存性注入）            |
| Repository     | リポジトリ         | データベースにアクセスする層                  |
| Adapter        | アダプター         | 2つの異なる形式を変換する部品                 |
| IPC            | アイピーシー       | Inter-Process Communication（プロセス間通信） |
| Main Process   | メインプロセス     | Electronのバックエンド処理を行う部分          |
| Renderer       | レンダラー         | 画面表示を行う部分（React）                   |
| Result Type    | リザルトタイプ     | 成功/失敗を明示的に表す型                     |
| Pagination     | ページネーション   | データを分割して取得する仕組み                |

---

# Part 2: 技術的詳細

## 1. 統合アーキテクチャの詳細

### 1.1 なぜアダプターパターンを採用したか

**問題**:
shared HistoryServiceとElectron Rendererでは、型の形式が異なる。

| 項目       | shared HistoryService | Renderer   |
| ---------- | --------------------- | ---------- |
| 日時       | `Date`オブジェクト    | ISO文字列  |
| サイズ     | `sizeBytes`           | `size`     |
| ハッシュ   | `contentHash`         | `hash`     |
| 最新フラグ | `isCurrentVersion`    | `isLatest` |

**解決策**:
アダプターパターンを使用して、型を変換する。

```typescript
// shared → Renderer への変換
function toRendererVersionHistoryItem(
  shared: SharedVersionHistoryItem,
): RendererVersionHistoryItem {
  return {
    id: shared.id,
    version: shared.version,
    createdAt: shared.createdAt.toISOString(), // Date → 文字列
    size: shared.sizeBytes, // リネーム
    hash: shared.contentHash, // リネーム
    isLatest: shared.isCurrentVersion, // リネーム
    // ...
  };
}
```

### 1.2 なぜDIを使用したか

**問題**:

- shared HistoryServiceへの依存をハードコードすると、テストが困難
- LogRepositoryも必要だが、これもハードコードは避けたい

**解決策**:
コンストラクタインジェクションを使用。

```typescript
export class HistoryService {
  constructor(
    private readonly sharedHistoryService: IHistoryService, // 注入
    private readonly logRepository: LogRepository, // 注入
    private readonly logger: IConversionLogger, // 注入
  ) {}
}
```

**利点**:

- テスト時にモックを注入できる
- 依存関係が明示的になる
- 疎結合になり変更に強い

### 1.3 LogRepositoryインターフェース

shared HistoryServiceには`getConversionLogs`がないため、LogRepositoryを追加定義。

```typescript
// 変換ログのレコード型
export interface ConversionLogRecord {
  id: string;
  conversion_id: string;
  timestamp: Date;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  details: Record<string, unknown> | null;
}

// LogRepositoryインターフェース
export interface LogRepository {
  findByConversionId(
    conversionId: string,
    options?: { level?: string; limit?: number; offset?: number },
  ): Promise<ConversionLogRecord[]>;
  countByConversionId(conversionId: string, level?: string): Promise<number>;
}
```

---

## 2. 各メソッドの実装詳細

### 2.1 getFileHistory

**機能**: ファイルの履歴一覧をページネーション付きで取得

**実装ポイント**:

1. shared HistoryServiceを呼び出し
2. 結果を型変換
3. ページネーション情報を構築

```typescript
async getFileHistory(
  fileId: string,
  options?: PaginationOptions
): Promise<PaginatedResult<VersionHistoryItem>> {
  // 1. shared HistoryServiceを呼び出し
  const result = await this.sharedHistoryService.getVersionHistory(fileId, {
    limit: options?.limit ?? 20,
    offset: options?.offset ?? 0,
  });

  // 2. 成功時は型変換して返す
  if (result.success) {
    return toRendererPaginatedVersionHistory(result.data);
  }

  // 3. エラー時は空結果を返す
  this.logger.warn('Failed to get file history', { fileId, error: result.error });
  return { items: [], total: 0, hasMore: false };
}
```

**なぜこの実装か**:

- ページネーションにより大量データでも効率的
- エラー時に空結果を返すことでUIが壊れない

### 2.2 getVersionDetail

**機能**: 特定バージョンの詳細情報を取得

**実装ポイント**:

1. shared HistoryServiceから詳細取得
2. LogRepositoryからログ取得
3. 両者を結合して返す

```typescript
async getVersionDetail(conversionId: string): Promise<VersionDetailData> {
  // 1. バージョン詳細を取得
  const result = await this.sharedHistoryService.getVersionDetails(conversionId);

  // 2. ログを取得
  const logs = await this.logRepository.findByConversionId(conversionId, {
    limit: 100,
  });

  // 3. 結合して返す
  if (result.success) {
    return {
      ...toRendererVersionHistoryItem(result.data),
      logs: logs.map(toRendererConversionLog),
    };
  }

  // 4. エラー時はスタブデータ
  return createStubVersionDetail(conversionId);
}
```

**なぜこの実装か**:

- shared HistoryServiceにはログ取得機能がないため、LogRepositoryを併用
- エラー時もスタブデータを返すことでUIが機能する

### 2.3 getConversionLogs

**機能**: 変換ログをフィルタリング・ページネーション付きで取得

**実装ポイント**:

1. LogRepositoryから直接取得（shared HistoryServiceは使用しない）
2. フィルタリングオプションをサポート

```typescript
async getConversionLogs(
  conversionId: string,
  options?: LogFilterOptions
): Promise<PaginatedResult<ConversionLog>> {
  // 1. ログを取得
  const logs = await this.logRepository.findByConversionId(conversionId, {
    level: options?.level,
    limit: options?.limit ?? 50,
    offset: options?.offset ?? 0,
  });

  // 2. 総数を取得
  const total = await this.logRepository.countByConversionId(
    conversionId,
    options?.level
  );

  // 3. 型変換して返す
  return toRendererPaginatedLogs(logs, total, options);
}
```

**なぜこの実装か**:

- shared HistoryServiceにログ取得機能がないため、LogRepository直接使用
- レベル別フィルタリングでデバッグが容易

### 2.4 restoreVersion

**機能**: 以前のバージョンに復元

**実装ポイント**:

1. shared HistoryServiceのrestoreを呼び出し
2. 結果を型変換

```typescript
async restoreVersion(
  fileId: string,
  conversionId: string
): Promise<VersionHistoryItem> {
  // 1. 復元を実行
  const result = await this.sharedHistoryService.restoreVersion(
    fileId,
    conversionId
  );

  // 2. 成功時は型変換
  if (result.success) {
    return toRendererVersionHistoryItem(result.data);
  }

  // 3. エラー時はスタブ（新バージョンとして表示）
  this.logger.error('Restore failed', { fileId, conversionId, error: result.error });
  return createStubRestoredVersion(conversionId);
}
```

**なぜこの実装か**:

- shared HistoryServiceの復元ロジックを再利用
- エラー時もスタブを返すことでUIが壊れない

---

## 3. 型変換の詳細

### 3.1 Date → ISO文字列変換

IPC通信ではDateオブジェクトをシリアライズできないため、ISO文字列に変換。

```typescript
// Before: Date型
createdAt: Date;

// After: ISO文字列
createdAt: string; // "2026-01-12T12:00:00.000Z"

// 変換コード
createdAt: shared.createdAt.toISOString();
```

### 3.2 フィールドリネーム

Renderer側の型定義に合わせてフィールド名を変更。

```typescript
// shared → Renderer
sizeBytes → size
contentHash → hash
isCurrentVersion → isLatest
```

### 3.3 null安全

ログのdetailsフィールドはnullの可能性があるため、安全に処理。

```typescript
details: log.details ?? undefined;
```

---

## 4. エラーハンドリング

### 4.1 Result型パターン

shared HistoryServiceはResult型を返す。

```typescript
type Result<T, E> = { success: true; data: T } | { success: false; error: E };
```

### 4.2 エラー時の対応

| 状況                  | 対応                    |
| --------------------- | ----------------------- |
| getFileHistory失敗    | 空の結果を返す          |
| getVersionDetail失敗  | スタブデータを返す      |
| getConversionLogs失敗 | 空の結果を返す          |
| restoreVersion失敗    | スタブデータ + ログ出力 |

---

## 5. ファクトリ関数

### 5.1 createHistoryServiceWithDI

本番用のファクトリ関数。DIコンテナから依存関係を取得して注入。

```typescript
export function createHistoryServiceWithDI(
  sharedHistoryService: IHistoryService,
  logRepository: LogRepository,
  logger: IConversionLogger,
): HistoryService {
  return new HistoryService(sharedHistoryService, logRepository, logger);
}
```

### 5.2 createHistoryService（非推奨）

後方互換性のために残しているが、使用禁止。

```typescript
/**
 * @deprecated Use createHistoryServiceWithDI instead
 */
export function createHistoryService(): HistoryService {
  throw new Error(
    "createHistoryService is deprecated. Use createHistoryServiceWithDI with proper DI.",
  );
}
```

---

## 6. テスト戦略

### 6.1 テスト構成

| テストスイート    | テスト数 | 目的                         |
| ----------------- | -------- | ---------------------------- |
| getFileHistory    | 6        | ページネーション、型変換確認 |
| getVersionDetail  | 4        | 詳細取得、ログ統合確認       |
| getConversionLogs | 5        | フィルタリング確認           |
| restoreVersion    | 5        | 復元実行、エラー処理確認     |
| Type Conversion   | 5        | 全型変換パターン確認         |
| Edge Cases        | 4        | 境界条件確認                 |
| Factory Functions | 2        | DI動作確認                   |

### 6.2 モック戦略

```typescript
// shared HistoryServiceのモック
const mockSharedHistoryService = {
  getVersionHistory: vi.fn(),
  getVersionDetails: vi.fn(),
  restoreVersion: vi.fn(),
};

// LogRepositoryのモック
const mockLogRepository = {
  findByConversionId: vi.fn(),
  countByConversionId: vi.fn(),
};
```

---

## 7. ファイル構成

```
apps/desktop/src/main/services/
├── HistoryService.ts              # メイン実装（307行）
└── __tests__/
    └── HistoryService.integration.test.ts  # テスト（943行）
```

---

## 8. パフォーマンス考慮

| 操作              | 目標   | 実装方式                  |
| ----------------- | ------ | ------------------------- |
| getFileHistory    | <200ms | DB直接アクセス            |
| getVersionDetail  | <100ms | DB + LogRepository        |
| getConversionLogs | <200ms | LogRepository直接アクセス |
| restoreVersion    | <500ms | shared HistoryService経由 |

---

## 9. 今後の拡張ポイント

| 項目                   | 説明                                   |
| ---------------------- | -------------------------------------- |
| キャッシュ追加         | 頻繁にアクセスされるデータのキャッシュ |
| getVersionDetail並列化 | 詳細取得とログ取得の並列実行           |
| toRendererError活用    | エラーメッセージの国際化対応           |
