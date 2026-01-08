# ドメインモデル設計書 - ConversionLogger サービス

## 文書情報

| 項目       | 内容            |
| ---------- | --------------- |
| タスクID   | CONV-05-01      |
| 機能名     | logging-service |
| バージョン | 1.0             |
| 作成日     | 2026-01-07      |
| 作成者     | Claude Code     |

---

## 1. ユビキタス言語（Ubiquitous Language）

### 1.1 用語集

| 用語           | 英語               | 定義                                         |
| -------------- | ------------------ | -------------------------------------------- |
| 変換ログ       | ConversionLog      | ファイル変換処理の単一ログエントリ           |
| ログレベル     | LogLevel           | ログの重要度（info, warn, error）            |
| ログアクション | LogAction          | ログが記録する処理種別（convert, restore等） |
| ログ入力       | ConversionLogInput | ログ記録時に外部から受け取る入力データ       |
| バッファ       | Buffer             | メモリ上のログ一時保存領域                   |
| フラッシュ     | Flush              | バッファ内ログをDBに永続化する操作           |
| ロガー         | ConversionLogger   | ログ記録を担当するサービス                   |
| ログリポジトリ | LogRepository      | ログのDB永続化を担当するインターフェース     |

### 1.2 コンテキストマップ

```
┌─────────────────────────────────────────────────────────────────┐
│                    Conversion Context                            │
│                    （変換処理コンテキスト）                       │
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   File      │    │ Conversion  │    │   Chunk     │         │
│  │  ファイル   │───>│    変換     │───>│  チャンク   │         │
│  └─────────────┘    └──────┬──────┘    └─────────────┘         │
│                            │                                     │
│                            │ logs                                │
│                            ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Logging Context                          │   │
│  │                  （ログ記録コンテキスト）                  │   │
│  │                                                           │   │
│  │  ┌─────────────────┐    ┌─────────────────────┐          │   │
│  │  │ ConversionLog   │<───│ ConversionLogger    │          │   │
│  │  │    変換ログ     │    │      ロガー         │          │   │
│  │  └─────────────────┘    └─────────────────────┘          │   │
│  │                                                           │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. ドメインモデル概要

### 2.1 モデル構成

```
┌─────────────────────────────────────────────────────────────────┐
│                      Domain Model                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────┐                                          │
│  │   <<value object>>│                                          │
│  │     LogLevel      │                                          │
│  │  ─────────────────│                                          │
│  │  info | warn |    │                                          │
│  │  error            │                                          │
│  └───────────────────┘                                          │
│                                                                  │
│  ┌───────────────────┐                                          │
│  │   <<value object>>│                                          │
│  │     LogAction     │                                          │
│  │  ─────────────────│                                          │
│  │  convert|restore| │                                          │
│  │  delete|chunk|    │                                          │
│  │  embed            │                                          │
│  └───────────────────┘                                          │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     <<entity>>                             │  │
│  │                   ConversionLog                            │  │
│  │  ─────────────────────────────────────────────────────────│  │
│  │  id: string (UUID)           ← 識別子                      │  │
│  │  timestamp: Date             ← 作成日時                    │  │
│  │  level: LogLevel             ← ログレベル                  │  │
│  │  fileId: string              ← 対象ファイルID              │  │
│  │  fileName: string            ← 対象ファイル名              │  │
│  │  conversionId?: string       ← 変換処理ID（オプション）    │  │
│  │  action: LogAction           ← アクション種別              │  │
│  │  message: string             ← ログメッセージ              │  │
│  │  details?: Record<...>       ← 追加情報（オプション）      │  │
│  │  durationMs?: number         ← 処理時間（オプション）      │  │
│  │  errorStack?: string         ← エラースタック（オプション）│  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                       <<DTO>>                              │  │
│  │                 ConversionLogInput                         │  │
│  │  ─────────────────────────────────────────────────────────│  │
│  │  fileId: string              ← 必須                        │  │
│  │  fileName: string            ← 必須                        │  │
│  │  conversionId?: string       ← オプション                  │  │
│  │  action: LogAction           ← 必須                        │  │
│  │  message: string             ← 必須                        │  │
│  │  details?: Record<...>       ← オプション                  │  │
│  │  durationMs?: number         ← オプション                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. 値オブジェクト（Value Objects）

### 3.1 LogLevel

**定義**: ログの重要度を表す列挙型

```typescript
type LogLevel = "info" | "warn" | "error";
```

**値の意味**:

| 値    | 意味   | 使用場面           |
| ----- | ------ | ------------------ |
| info  | 情報   | 正常処理の記録     |
| warn  | 警告   | 注意が必要な状況   |
| error | エラー | 処理失敗・例外発生 |

**不変条件**:

- 3つの値のいずれかでなければならない
- 大文字小文字を区別する（小文字のみ有効）

### 3.2 LogAction

**定義**: ログが記録する処理種別を表す列挙型

```typescript
type LogAction = "convert" | "restore" | "delete" | "chunk" | "embed";
```

**値の意味**:

| 値      | 意味         | 使用場面                   |
| ------- | ------------ | -------------------------- |
| convert | 変換         | ファイル形式変換           |
| restore | 復元         | 変換前状態への復元         |
| delete  | 削除         | ファイル・変換データの削除 |
| chunk   | チャンク分割 | テキストのチャンク分割処理 |
| embed   | 埋め込み     | ベクトル埋め込み生成       |

**不変条件**:

- 5つの値のいずれかでなければならない
- 拡張性: 新しいアクションは列挙に追加

---

## 4. エンティティ（Entities）

### 4.1 ConversionLog

**定義**: ファイル変換処理の単一ログエントリ

**識別子**: `id` (UUID)

**ライフサイクル**:

1. 作成: ConversionLoggerのlog()メソッドで生成
2. バッファ保存: メモリバッファに一時保存
3. 永続化: flush()でDBに保存
4. 参照: 検索クエリで取得

**属性**:

| 属性         | 型                      | 必須 | 説明                   |
| ------------ | ----------------------- | ---- | ---------------------- |
| id           | string (UUID)           | ○    | 一意識別子             |
| timestamp    | Date                    | ○    | 作成日時               |
| level        | LogLevel                | ○    | ログレベル             |
| fileId       | string                  | ○    | 対象ファイルID         |
| fileName     | string                  | ○    | 対象ファイル名         |
| conversionId | string                  | -    | 変換処理ID             |
| action       | LogAction               | ○    | アクション種別         |
| message      | string                  | ○    | ログメッセージ         |
| details      | Record<string, unknown> | -    | 追加情報               |
| durationMs   | number                  | -    | 処理時間（ミリ秒）     |
| errorStack   | string                  | -    | エラースタックトレース |

**不変条件**:

```typescript
// INV-001: idは有効なUUID形式
invariant(isValidUUID(id), "id must be a valid UUID");

// INV-002: timestampは過去または現在の日時
invariant(timestamp <= new Date(), "timestamp cannot be in the future");

// INV-003: levelは有効な値
invariant(["info", "warn", "error"].includes(level), "invalid log level");

// INV-004: actionは有効な値
invariant(
  ["convert", "restore", "delete", "chunk", "embed"].includes(action),
  "invalid log action",
);

// INV-005: fileIdは空文字列でない
invariant(fileId.length > 0, "fileId cannot be empty");

// INV-006: fileNameは空文字列でない
invariant(fileName.length > 0, "fileName cannot be empty");

// INV-007: messageは空文字列でない
invariant(message.length > 0, "message cannot be empty");

// INV-008: durationMsは非負（存在する場合）
invariant(
  durationMs === undefined || durationMs >= 0,
  "durationMs cannot be negative",
);
```

**振る舞い**:

- エンティティは生成後は不変（Immutable）
- 変更が必要な場合は新しいインスタンスを生成

---

## 5. DTO（Data Transfer Objects）

### 5.1 ConversionLogInput

**定義**: ログ記録時に外部から受け取る入力データ

**用途**: ConversionLoggerのinfo/warn/error/batchメソッドの引数

**属性**:

| 属性         | 型                      | 必須 | 説明               |
| ------------ | ----------------------- | ---- | ------------------ |
| fileId       | string                  | ○    | 対象ファイルID     |
| fileName     | string                  | ○    | 対象ファイル名     |
| conversionId | string                  | -    | 変換処理ID         |
| action       | LogAction               | ○    | アクション種別     |
| message      | string                  | ○    | ログメッセージ     |
| details      | Record<string, unknown> | -    | 追加情報           |
| durationMs   | number                  | -    | 処理時間（ミリ秒） |

**ConversionLogとの関係**:

```
ConversionLogInput               ConversionLog
      │                                │
      │    ┌─────────────────┐         │
      │───>│ ConversionLogger│────────>│
      │    │     .info()     │         │
      │    └─────────────────┘         │
      │                                │
      │  Input → 生成処理 → Entity    │
      │  - id追加（UUID生成）          │
      │  - timestamp追加（現在時刻）   │
      │  - level追加（メソッドに依存） │
      │                                │
```

---

## 6. ドメインサービス

### 6.1 ConversionLogger（概念設計）

**定義**: 変換ログの記録を担当するドメインサービス

**責務**:

- ConversionLogエンティティの生成
- バッファリングによるログ蓄積
- LogRepositoryを通じた永続化

**依存関係**:

```
ConversionLogger
      │
      ├──→ LogLevel (Value Object)
      ├──→ LogAction (Value Object)
      ├──→ ConversionLog (Entity)
      ├──→ ConversionLogInput (DTO)
      └──→ ILogRepository (Interface)
```

---

## 7. 集約（Aggregates）

### 7.1 ConversionLog集約

本ドメインではConversionLogは独立したエンティティとして扱い、集約は定義しない。

**理由**:

- ログエントリ間に整合性制約がない
- 各ログは独立して生成・永続化される
- トランザクション境界はバルクインサート単位

---

## 8. リポジトリインターフェース

### 8.1 ILogRepository

**定義**: ログの永続化を担当するリポジトリインターフェース

```typescript
interface ILogRepository {
  /**
   * ログを一括挿入する
   */
  bulkInsert(logs: ConversionLog[]): Promise<Result<void, Error>>;

  /**
   * ファイルIDでログを検索する
   */
  findByFileId(
    fileId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<Result<ConversionLog[], Error>>;

  /**
   * ログレベルでログを検索する
   */
  findByLevel(
    level: LogLevel,
    options?: { limit?: number; offset?: number },
  ): Promise<Result<ConversionLog[], Error>>;

  /**
   * 日付範囲でログを検索する
   */
  findByDateRange(
    from: Date,
    to: Date,
    options?: { limit?: number; offset?: number },
  ): Promise<Result<ConversionLog[], Error>>;
}
```

---

## 9. ドメインモデル図

### 9.1 クラス図

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Domain Model Class Diagram                      │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐       ┌──────────────┐       ┌──────────────────────────┐
│  <<enum>>    │       │  <<enum>>    │       │      <<interface>>       │
│  LogLevel    │       │  LogAction   │       │     ILogRepository       │
├──────────────┤       ├──────────────┤       ├──────────────────────────┤
│ info         │       │ convert      │       │ +bulkInsert(logs)        │
│ warn         │       │ restore      │       │ +findByFileId(id, opts)  │
│ error        │       │ delete       │       │ +findByLevel(level, opts)│
│              │       │ chunk        │       │ +findByDateRange(...)    │
│              │       │ embed        │       └──────────────────────────┘
└──────────────┘       └──────────────┘                    △
        │                     │                            │
        │                     │                            │ uses
        ▼                     ▼                            │
┌─────────────────────────────────────────────────────────────────────────┐
│                           <<entity>>                                     │
│                         ConversionLog                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ +id: string                                                              │
│ +timestamp: Date                                                         │
│ +level: LogLevel                                                         │
│ +fileId: string                                                          │
│ +fileName: string                                                        │
│ +conversionId?: string                                                   │
│ +action: LogAction                                                       │
│ +message: string                                                         │
│ +details?: Record<string, unknown>                                       │
│ +durationMs?: number                                                     │
│ +errorStack?: string                                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    △
                                    │ creates
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                         <<service>>                                      │
│                       ConversionLogger                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ -buffer: ConversionLog[]                                                 │
│ -repository: ILogRepository                                              │
├─────────────────────────────────────────────────────────────────────────┤
│ +info(input: CLInput): Promise<Result<CL, E>>                           │
│ +warn(input: CLInput): Promise<Result<CL, E>>                           │
│ +error(input: CLInput, e?: Error): Promise<Result<CL, E>>               │
│ +batch(logs: BatchInput[]): Promise<Result<CL[], E>>                    │
│ +flush(): Promise<Result<void, E>>                                      │
│ +dispose(): void                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ input
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           <<DTO>>                                        │
│                      ConversionLogInput                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ +fileId: string                                                          │
│ +fileName: string                                                        │
│ +conversionId?: string                                                   │
│ +action: LogAction                                                       │
│ +message: string                                                         │
│ +details?: Record<string, unknown>                                       │
│ +durationMs?: number                                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. 検証チェックリスト

- [x] すべてのドメイン概念が対応するコード構造を持つ
- [x] ユビキタス言語がコードで一貫して使用される
- [x] エンティティは明確な識別子とライフサイクルを持つ
- [x] 値オブジェクトは不変である
- [x] すべてのビジネス不変条件が定義されている
- [x] ドメインロジックはインフラから分離されている
