# アーキテクチャ設計書 - ConversionLogger サービス

## 文書情報

| 項目       | 内容            |
| ---------- | --------------- |
| タスクID   | CONV-05-01      |
| 機能名     | logging-service |
| バージョン | 1.0             |
| 作成日     | 2026-01-07      |
| 作成者     | Claude Code     |

---

## 1. アーキテクチャ概要

### 1.1 採用パターン

| パターン                     | 適用箇所            | 理由                         |
| ---------------------------- | ------------------- | ---------------------------- |
| Service Layer Pattern        | ConversionLogger    | ビジネスロジックのカプセル化 |
| Repository Pattern           | LogRepository       | データアクセスの抽象化       |
| Dependency Injection         | Logger → Repository | テスト容易性・疎結合         |
| Railway Oriented Programming | エラーハンドリング  | 型安全なエラー伝播           |
| Buffer Pattern               | ログバッファリング  | I/O効率化                    |

### 1.2 設計原則

- **単一責任の原則（SRP）**: ConversionLoggerはログ記録のみを担当
- **依存性逆転の原則（DIP）**: 具象RepositoryではなくInterfaceに依存
- **開放閉鎖の原則（OCP）**: 新しいLogActionの追加が容易

---

## 2. システム構造

### 2.1 レイヤー構成

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  (変換処理サービス等 - ConversionLoggerを利用)           │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │           ConversionLogger                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │    │
│  │  │ info()   │  │ warn()   │  │ error()      │   │    │
│  │  │ batch()  │  │ flush()  │  │ dispose()    │   │    │
│  │  └──────────┘  └──────────┘  └──────────────┘   │    │
│  │                     │                            │    │
│  │              ┌──────▼──────┐                     │    │
│  │              │   Buffer    │                     │    │
│  │              │ (in-memory) │                     │    │
│  │              └──────┬──────┘                     │    │
│  └─────────────────────┼───────────────────────────┘    │
│                        │                                 │
└────────────────────────┼────────────────────────────────┘
                         │ bulkInsert()
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Repository Layer                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │        ILogRepository (Interface)                │    │
│  │  ┌──────────────┐  ┌──────────────────────────┐ │    │
│  │  │ bulkInsert() │  │ findByFileId()           │ │    │
│  │  │ findByLevel()│  │ findByDateRange()        │ │    │
│  │  └──────────────┘  └──────────────────────────┘ │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │        LogRepository (Implementation)            │    │
│  │             ↓                                    │    │
│  │        Drizzle ORM → SQLite (Turso)             │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 コンポーネント図

```
┌────────────────────────────────────────────────────────────┐
│                  packages/shared/src                        │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  services/logging/                                          │
│  ├── types.ts              # Zodスキーマ・型定義            │
│  ├── conversion-logger.ts  # ConversionLoggerクラス         │
│  └── __tests__/                                             │
│      └── conversion-logger.test.ts                          │
│                                                             │
│  repositories/                                              │
│  └── log-repository.ts     # ILogRepository Interface       │
│                            # (実装は別タスク)               │
│                                                             │
│  types/rag/                                                 │
│  └── result.ts             # Result型 (ok/err)              │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 3. クラス設計

### 3.1 クラス図

```
┌─────────────────────────────────────────────────────────────┐
│                   <<interface>>                              │
│                 IConversionLogger                            │
├─────────────────────────────────────────────────────────────┤
│ +info(input: ConversionLogInput): Promise<Result<CL, E>>    │
│ +warn(input: ConversionLogInput): Promise<Result<CL, E>>    │
│ +error(input: ConversionLogInput, e?: Error): Promise<...>  │
│ +batch(logs: BatchInput[]): Promise<Result<CL[], E>>        │
│ +flush(): Promise<Result<void, E>>                          │
│ +dispose(): void                                            │
└─────────────────────────────────────────────────────────────┘
                           △
                           │ implements
                           │
┌─────────────────────────────────────────────────────────────┐
│                    ConversionLogger                          │
├─────────────────────────────────────────────────────────────┤
│ -buffer: ConversionLog[]                                    │
│ -bufferSize: number = 100                                   │
│ -flushIntervalMs: number = 5000                             │
│ -flushTimer: NodeJS.Timeout | null                          │
│ -logRepository: ILogRepository                              │
├─────────────────────────────────────────────────────────────┤
│ +constructor(repo: ILogRepository, options?: Options)       │
│ +info(input: ConversionLogInput): Promise<Result<CL, E>>    │
│ +warn(input: ConversionLogInput): Promise<Result<CL, E>>    │
│ +error(input: ConversionLogInput, e?: Error): Promise<...>  │
│ +batch(logs: BatchInput[]): Promise<Result<CL[], E>>        │
│ +flush(): Promise<Result<void, E>>                          │
│ +dispose(): void                                            │
├─────────────────────────────────────────────────────────────┤
│ -log(level: LogLevel, input: CLInput): Promise<Result<...>> │
│ -startAutoFlush(): void                                     │
│ -shouldFlush(): boolean                                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ depends on
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   <<interface>>                              │
│                   ILogRepository                             │
├─────────────────────────────────────────────────────────────┤
│ +bulkInsert(logs: CL[]): Promise<Result<void, E>>           │
│ +findByFileId(id: string, opts?): Promise<Result<CL[], E>>  │
│ +findByLevel(level: LL, opts?): Promise<Result<CL[], E>>    │
│ +findByDateRange(from, to, opts?): Promise<Result<CL[], E>> │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 依存関係

```
ConversionLogger
    │
    ├──→ ILogRepository (Interface)
    │        依存性注入により具象から分離
    │
    ├──→ ConversionLog (Value Object)
    │        ログエントリのデータ構造
    │
    ├──→ ConversionLogInput (DTO)
    │        入力データ構造
    │
    ├──→ LogLevel (Enum)
    │        info | warn | error
    │
    └──→ LogAction (Enum)
             convert | restore | delete | chunk | embed
```

---

## 4. バッファリング戦略

### 4.1 バッファ設計

| パラメータ      | デフォルト値 | 説明                         |
| --------------- | ------------ | ---------------------------- |
| bufferSize      | 100          | バッファに保持する最大ログ数 |
| flushIntervalMs | 5000         | 自動フラッシュ間隔（ミリ秒） |

### 4.2 フラッシュトリガー

```
┌─────────────────────────────────────────────────────────┐
│                  Flush Triggers                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Size-based (サイズベース)                            │
│     ┌─────────────────────────────────────────────┐     │
│     │  buffer.length >= bufferSize                │     │
│     │  → 即座にflush()を実行                      │     │
│     └─────────────────────────────────────────────┘     │
│                                                          │
│  2. Time-based (時間ベース)                              │
│     ┌─────────────────────────────────────────────┐     │
│     │  setInterval(flush, flushIntervalMs)        │     │
│     │  → 定期的にflush()を実行                    │     │
│     └─────────────────────────────────────────────┘     │
│                                                          │
│  3. Manual (手動)                                        │
│     ┌─────────────────────────────────────────────┐     │
│     │  flush() メソッド呼び出し                   │     │
│     │  → 即座にflush()を実行                      │     │
│     └─────────────────────────────────────────────┘     │
│                                                          │
│  4. Dispose (終了時)                                     │
│     ┌─────────────────────────────────────────────┐     │
│     │  dispose() メソッド呼び出し                 │     │
│     │  → タイマー停止 + 最終flush()               │     │
│     └─────────────────────────────────────────────┘     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 4.3 バッファ操作フロー

```
log() 呼び出し
      │
      ▼
┌──────────────┐
│ ログ生成     │
│ - UUID付与   │
│ - timestamp  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ バッファ追加 │
│ buffer.push()│
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│ サイズチェック           │
│ buffer.length >= size?   │
└──────────┬───────────────┘
           │
     ┌─────┴─────┐
     │           │
    Yes         No
     │           │
     ▼           ▼
┌──────────┐  ┌──────────┐
│ flush()  │  │ return   │
│ 実行     │  │ ok(log)  │
└──────────┘  └──────────┘
```

---

## 5. エラーハンドリング戦略

### 5.1 Result型によるエラー伝播

```typescript
// 成功時
ok(conversionLog); // Success<ConversionLog>

// 失敗時
err(new Error("Repository error")); // Failure<Error>
```

### 5.2 エラーハンドリングフロー

```
┌─────────────────────────────────────────────────────────┐
│                Error Handling Flow                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ConversionLogger                                        │
│       │                                                  │
│       │ flush() → bulkInsert()                          │
│       ▼                                                  │
│  LogRepository                                           │
│       │                                                  │
│       │ DB操作                                           │
│       ▼                                                  │
│  ┌─────────────────────────────────────────┐            │
│  │           DB操作結果                     │            │
│  │  ┌─────────┐     ┌─────────────────┐    │            │
│  │  │ 成功    │     │ 失敗            │    │            │
│  │  │ ok(void)│     │ err(RAGError)   │    │            │
│  │  └────┬────┘     └────────┬────────┘    │            │
│  └───────┼───────────────────┼─────────────┘            │
│          │                   │                           │
│          ▼                   ▼                           │
│     ┌─────────┐      ┌─────────────────┐                │
│     │ バッファ │      │ エラーをそのまま │                │
│     │ クリア   │      │ 上位に返却       │                │
│     └─────────┘      └─────────────────┘                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 5.3 エラー種別

| エラー種別      | 発生箇所         | 対応                       |
| --------------- | ---------------- | -------------------------- |
| ValidationError | Zodスキーマ検証  | Result.errで返却           |
| RepositoryError | DB操作失敗       | Result.errで伝播           |
| RuntimeError    | 予期しないエラー | Result.errでラップして返却 |

---

## 6. 統合ポイント設計

### 6.1 契約定義

#### ConversionLogger → ILogRepository

```typescript
interface ILogRepository {
  /**
   * ログを一括挿入する
   * @param logs - 挿入するログの配列
   * @returns 成功時はvoid、失敗時はError
   */
  bulkInsert(logs: ConversionLog[]): Promise<Result<void, Error>>;
}
```

#### 呼び出しシーケンス

```
ConversionLogger          ILogRepository            Database
      │                        │                       │
      │  bulkInsert(logs)      │                       │
      │───────────────────────>│                       │
      │                        │  INSERT INTO ...      │
      │                        │──────────────────────>│
      │                        │                       │
      │                        │  Result<void, Error>  │
      │                        │<──────────────────────│
      │  Result<void, Error>   │                       │
      │<───────────────────────│                       │
      │                        │                       │
```

### 6.2 データフロー

```
Application
    │
    │ info({ fileId, fileName, action, message })
    ▼
ConversionLogger
    │
    │ 1. ConversionLog生成（UUID, timestamp付与）
    │ 2. バッファ追加
    │ 3. サイズチェック
    │
    │ (flush時)
    ▼
LogRepository.bulkInsert(logs)
    │
    │ Drizzle ORM
    ▼
Database (SQLite)
    │
    │ conversion_logs テーブル
    ▼
永続化完了
```

---

## 7. 設定オプション

### 7.1 コンストラクタオプション

```typescript
interface ConversionLoggerOptions {
  /** バッファサイズ（デフォルト: 100） */
  bufferSize?: number;

  /** 自動フラッシュ間隔（ミリ秒、デフォルト: 5000） */
  flushIntervalMs?: number;
}
```

### 7.2 設定例

```typescript
// デフォルト設定
const logger = new ConversionLogger(repository);

// カスタム設定
const logger = new ConversionLogger(repository, {
  bufferSize: 50, // より頻繁にフラッシュ
  flushIntervalMs: 1000, // 1秒ごとにフラッシュ
});

// 即時フラッシュ（バッファリング無効化）
const logger = new ConversionLogger(repository, {
  bufferSize: 1,
  flushIntervalMs: 0,
});
```

---

## 8. テスト戦略

### 8.1 ユニットテスト

- LogRepositoryをモックして依存を分離
- バッファ操作の検証
- フラッシュトリガーの検証
- エラーハンドリングの検証

### 8.2 統合テスト

- 実際のLogRepositoryとの接続テスト
- DB永続化の検証
- エラー伝播の検証

---

## 9. 将来拡張性

### 9.1 拡張ポイント

| 拡張項目                 | 対応方針                |
| ------------------------ | ----------------------- |
| 新LogAction追加          | Zodスキーマ拡張         |
| 外部ログサービス連携     | ILogRepositoryの別実装  |
| 非同期バッチ処理         | flush()の非同期キュー化 |
| ログレベルフィルタリング | フィルタ関数の追加      |

### 9.2 変更容易性

- Interface依存により実装の差し替えが容易
- Zodスキーマにより型定義の拡張が安全
- バッファ戦略の変更はOptions経由で設定可能
