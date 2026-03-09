# 型定義設計: IPC Handler Graceful Degradation

## メタ情報

| 項目     | 値                                               |
| -------- | ------------------------------------------------ |
| タスクID | 10-TASK-FIX-IPC-HANDLER-GRACEFUL-DEGRADATION-001 |
| Phase    | 2 - 設計                                         |
| 作成日   | 2026-03-08                                       |

## 1. HandlerRegistrationFailure

### 1.1 型定義

```typescript
/**
 * IPC ハンドラ登録時の失敗情報
 * safeRegister ヘルパーが例外をキャッチした際に生成される
 */
export interface HandlerRegistrationFailure {
  /** 失敗したハンドラ登録関数の名前（例: "registerSkillHandlers"） */
  handlerName: string;

  /** キャッチされたエラーオブジェクト（unknown 型） */
  error: unknown;

  /** エラーコード（Infrastructure Error: 4001） */
  errorCode: number;

  /** エラーメッセージ（error.message または String(error)） */
  message: string;
}
```

### 1.2 設計判断

| 項目             | 判断                       | 理由                                                  |
| ---------------- | -------------------------- | ----------------------------------------------------- |
| `error: unknown` | `unknown` 型を使用         | catch 句の型に合わせ、型安全を維持する                |
| `errorCode`      | `number` 型（固定値 4001） | エラーカテゴリ体系に準拠。将来の拡張性を確保          |
| `message`        | `string` 型                | ログ出力・デバッグ用の人間可読なメッセージ            |
| `handlerName`    | `string` 型                | 関数名をそのまま保持。enum 化は過剰なため文字列で十分 |

## 2. IpcHandlerRegistrationResult

### 2.1 型定義

```typescript
/**
 * registerAllIpcHandlers の戻り値
 * 全ハンドラの登録結果をまとめた構造体
 */
export interface IpcHandlerRegistrationResult {
  /** 登録に成功したハンドラグループ数 */
  successCount: number;

  /** 登録に失敗したハンドラグループ数 */
  failureCount: number;

  /** 失敗詳細の配列（失敗がない場合は空配列） */
  failures: HandlerRegistrationFailure[];
}
```

### 2.2 設計判断

| 項目           | 判断                     | 理由                                                     |
| -------------- | ------------------------ | -------------------------------------------------------- |
| `successCount` | 明示的に保持             | `totalCount - failureCount` で計算可能だが、利便性のため |
| `failureCount` | `failures.length` の冗長 | 直接アクセスの利便性。配列の length 参照と意図が明確     |
| `failures`     | 空配列を許容             | 全成功時でも型安全にアクセス可能                         |

### 2.3 不変条件

```
successCount + failureCount === (safeRegister 呼び出し総数)
failureCount === failures.length
successCount >= 0
failureCount >= 0
```

## 3. 型の配置場所

### 3.1 配置先

`apps/desktop/src/main/ipc/index.ts` のモジュールスコープに定義する。

### 3.2 エクスポート方針

- `HandlerRegistrationFailure`: `export` する（テストでの型参照に必要）
- `IpcHandlerRegistrationResult`: `export` する（テストでの型参照に必要）
- `safeRegister`: エクスポートしない（内部ヘルパー。テストは `registerAllIpcHandlers` 経由で間接検証）

### 3.3 将来の移動候補

型定義が他のモジュールからも参照される場合は、`apps/desktop/src/main/ipc/types.ts` への分離を検討する。現時点では `index.ts` 内で十分。
