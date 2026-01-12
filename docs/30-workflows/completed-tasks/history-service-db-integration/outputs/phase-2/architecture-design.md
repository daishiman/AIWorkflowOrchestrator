# アーキテクチャ設計書 - HistoryService DB統合

## 文書情報

| 項目     | 内容                           |
| -------- | ------------------------------ |
| タスクID | history-service-db-integration |
| Phase    | 2                              |
| 作成日   | 2026-01-12                     |
| 状態     | 完了                           |

---

## 1. 統合パターン比較検討

### 1.1 候補パターン

| パターン  | 説明                                            | 既存コード変更 | 型安全性 | 実装難度 |
| --------- | ----------------------------------------------- | -------------- | -------- | -------- |
| パターンA | 直接統合（shared HistoryServiceをそのまま使用） | 大             | 低       | 低       |
| パターンB | アダプター統合（型変換層を介して統合）          | 中             | 高       | 中       |
| パターンC | ファサード統合（新しいファサードクラスで統合）  | 大             | 高       | 高       |

### 1.2 各パターンの詳細評価

#### パターンA: 直接統合

**メリット:**

- 実装が単純
- コード量が少ない

**デメリット:**

- shared型とRenderer型の差異を解消できない（`Date` vs `string`、`sizeBytes` vs `size`）
- 既存のIPCハンドラーインターフェースを破壊する
- フロントエンドのコード変更が必要

**評価: 不採用**

#### パターンB: アダプター統合

**メリット:**

- 既存IPCインターフェースを維持できる
- 型変換責務が明確
- テスト容易性が高い
- shared HistoryServiceに変更不要

**デメリット:**

- 型変換のオーバーヘッド（軽微）
- 中間レイヤーの追加

**評価: 採用**

#### パターンC: ファサード統合

**メリット:**

- 柔軟性が高い
- 将来の拡張に対応しやすい

**デメリット:**

- 実装が複雑
- 既存コードと重複する可能性
- 過剰設計のリスク

**評価: 不採用（過剰設計）**

### 1.3 決定: パターンB アダプター統合

**選定理由:**

1. Phase 1で特定した型差異（Date↔string, sizeBytes↔size等）を吸収可能
2. 既存の22件のIPCハンドラーテストを維持可能
3. shared HistoryService（CONV-05-02実装）に変更不要
4. 単一責務原則に従い、Electron HistoryServiceが変換責務を担当

---

## 2. 統合アーキテクチャ

### 2.1 全体構成図

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Renderer Process                                   │
│  ┌─────────────────┐                                                        │
│  │   HistoryPanel  │                                                        │
│  │   (React UI)    │                                                        │
│  └────────┬────────┘                                                        │
│           │ window.historyAPI                                               │
│           ▼                                                                 │
│  ┌─────────────────┐                                                        │
│  │   Preload       │                                                        │
│  │   (contextBridge)│                                                       │
│  └────────┬────────┘                                                        │
└───────────┼─────────────────────────────────────────────────────────────────┘
            │ IPC (ipcRenderer.invoke)
            ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Main Process                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    IPC Handlers (historyHandlers.ts)                │    │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐       │    │
│  │  │getFileHistory   │ │getVersionDetail │ │restoreVersion   │ ...   │    │
│  │  └────────┬────────┘ └────────┬────────┘ └────────┬────────┘       │    │
│  └───────────┼───────────────────┼───────────────────┼─────────────────┘    │
│              │                   │                   │                      │
│              ▼                   ▼                   ▼                      │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              Electron HistoryService (Adapter Layer)                │    │
│  │                                                                     │    │
│  │  [型変換責務]                                                       │    │
│  │  - shared型 → Renderer型 変換                                       │    │
│  │  - Date → ISO8601文字列                                             │    │
│  │  - sizeBytes → size, contentHash → hash                             │    │
│  │  - isCurrentVersion → isLatest                                      │    │
│  │                                                                     │    │
│  │  [依存性]                                                           │    │
│  │  - shared HistoryService (DI)                                       │    │
│  │  - IConversionLogger (DI)                                           │    │
│  └────────────────────────────────┬────────────────────────────────────┘    │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              shared HistoryService (CONV-05-02)                     │    │
│  │                                                                     │    │
│  │  [メソッド]                                                         │    │
│  │  - getFileHistory(fileId, options)                                  │    │
│  │  - getVersionDetail(conversionId)                                   │    │
│  │  - restoreToVersion(fileId, conversionId)                           │    │
│  │  - getVersionDiff(conversionIdA, conversionIdB)                     │    │
│  │  - getLatestVersion(fileId)                                         │    │
│  │  - getVersionCount(fileId)                                          │    │
│  └────────────────────────────────┬────────────────────────────────────┘    │
│                                   │                                         │
│                                   ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        Repository Layer                             │    │
│  │  ┌─────────────────────────┐  ┌─────────────────────────┐          │    │
│  │  │  ConversionRepository  │  │    FileRepository       │          │    │
│  │  └───────────┬─────────────┘  └───────────┬─────────────┘          │    │
│  └──────────────┼────────────────────────────┼──────────────────────────┘    │
│                 │                            │                              │
│                 ▼                            ▼                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Drizzle ORM Layer                              │    │
│  │  ┌─────────────────────────────────────────────────────────────┐   │    │
│  │  │                        SQLite (Turso)                       │   │    │
│  │  └─────────────────────────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 コンポーネント責務

| コンポーネント                    | 責務                                         |
| --------------------------------- | -------------------------------------------- |
| HistoryPanel (Renderer)           | UI表示、ユーザー操作ハンドリング             |
| IPC Handlers                      | Renderer-Main間の通信、Result型ラッピング    |
| Electron HistoryService (Adapter) | shared→Renderer型変換、ログ変換、DI受け取り  |
| shared HistoryService             | ビジネスロジック（履歴取得、差分計算、復元） |
| ConversionRepository              | conversionsテーブルのCRUD操作                |
| FileRepository                    | filesテーブルの読み取り                      |
| Drizzle ORM                       | SQLクエリ実行、トランザクション管理          |

---

## 3. メソッドマッピング

### 3.1 IPCチャンネル → Electron HistoryService → shared HistoryService

| IPCチャンネル               | Electron HistoryService | shared HistoryService | 備考                         |
| --------------------------- | ----------------------- | --------------------- | ---------------------------- |
| `history:getFileHistory`    | `getFileHistory()`      | `getFileHistory()`    | 型変換あり                   |
| `history:getVersionDetail`  | `getVersionDetail()`    | `getVersionDetail()`  | 型変換あり + ログ取得        |
| `history:getConversionLogs` | `getConversionLogs()`   | ー                    | ログ専用メソッド（別途検討） |
| `history:restoreVersion`    | `restoreVersion()`      | `restoreToVersion()`  | 型変換あり                   |

### 3.2 変換ログ取得について

**課題**: shared HistoryServiceには`getConversionLogs`メソッドが存在しない

**対応方針**:

1. 変換ログはDBの`conversion_logs`テーブルから直接取得する
2. Electron HistoryServiceに`getConversionLogs`の実装を追加
3. LogRepositoryまたはLogQueryServiceを利用（既存実装を確認）

---

## 4. エラーハンドリング設計

### 4.1 エラーフロー

```
shared HistoryService
  └─ Result<T, Error> を返却
       │
       ▼
Electron HistoryService (Adapter)
  └─ Result型をそのまま伝搬
     └─ 型変換エラーがあれば独自のErrorを返却
       │
       ▼
IPC Handlers
  └─ Result型をRenderer型Result<T>に変換
       │
       ▼
Renderer Process
  └─ success/errorに基づいてUI表示
```

### 4.2 エラー種別とマッピング

| 発生箇所                | エラー種別       | Rendererへの伝搬        |
| ----------------------- | ---------------- | ----------------------- |
| ConversionRepository    | DB_QUERY_ERROR   | `success: false, error` |
| shared HistoryService   | RECORD_NOT_FOUND | `success: false, error` |
| Electron HistoryService | 型変換エラー     | `success: false, error` |
| IPC Handler             | 通信エラー       | `success: false, error` |

### 4.3 エラーメッセージ変換

```typescript
// shared側エラー
Error: "Conversion not found: conv-123"

// Renderer側表示
{
  success: false,
  error: new Error("指定されたバージョンが見つかりません")
}
```

---

## 5. 実装順序

### 5.1 推奨実装フロー

```
Step 1: Electron HistoryService のシグネチャ変更
        - コンストラクタでDI受け取りを追加
        - 戻り値型をResult型に統一

Step 2: 型変換ユーティリティ実装
        - toRendererVersionHistoryItem()
        - toRendererConversionLog()

Step 3: getFileHistory() の実装
        - shared HistoryService呼び出し
        - 型変換適用
        - 既存テスト確認

Step 4: getVersionDetail() の実装
        - shared HistoryService呼び出し
        - ログ取得追加
        - 型変換適用

Step 5: getConversionLogs() の実装
        - ログ取得ロジック実装
        - フィルタリング対応

Step 6: restoreVersion() の実装
        - shared HistoryService呼び出し
        - 型変換適用

Step 7: IPCハンドラー調整
        - 既存22テストが通ることを確認
        - Result型のラップ処理確認

Step 8: 統合テスト作成・実行
```

---

## 6. Electron環境固有の考慮事項

### 6.1 Main/Renderer分離

| 項目             | 考慮事項                                              |
| ---------------- | ----------------------------------------------------- |
| DB接続           | Main ProcessでのみDB接続を行う                        |
| IPC通信          | 既存チャンネル名を維持（`history:*`）                 |
| エラー伝搬       | Error.messageのみを伝搬（スタックトレースは含めない） |
| contextIsolation | preloadスクリプト経由でのAPI公開を維持                |

### 6.2 データベース接続

- SQLite（Turso）はMain Processで初期化
- シングルトンパターンでDB接続を管理
- アプリ終了時にコネクションをクローズ

---

## 7. 完了確認

- [x] 統合パターンが決定されている（アダプター統合）
- [x] アーキテクチャ図が作成されている
- [x] コンポーネント責務が明確化されている
- [x] エラーハンドリング方針が決定されている
- [x] 実装順序が定義されている
- [x] Electron固有の考慮事項が文書化されている
