# インターフェース設計 - スキル実行機能

## Phase 2 - タスク2: インターフェース設計

### 作成日

2026-01-18

---

## 型定義

### SkillExecutionResult

```typescript
/**
 * スキル実行結果
 */
interface SkillExecutionResult {
  /** 実行ID（UUID） */
  executionId: string;

  /** 実行ステータス */
  status: "success" | "failed";

  /** 実行出力（成功時） */
  output?: string;

  /** エラーメッセージ（失敗時） */
  error?: string;

  /** 実行開始時刻 */
  startedAt: Date;

  /** 実行完了時刻 */
  completedAt: Date;
}
```

### SkillExecuteParams

```typescript
/**
 * スキル実行パラメータ
 */
interface SkillExecuteParams {
  /** 実行対象のスキルID */
  skillId: string;

  /** オプションパラメータ（将来拡張用） */
  params?: Record<string, unknown>;
}
```

---

## skillAPI インターフェース拡張

### 現行インターフェース

```typescript
interface SkillAPI {
  listAvailable: () => Promise<OperationResult<Skill[]>>;
  listImported: () => Promise<OperationResult<Skill[]>>;
  import: (skillIds: string[]) => Promise<OperationResult<void>>;
  remove: (skillId: string) => Promise<OperationResult<void>>;
  getDetail: (skillId: string) => Promise<OperationResult<Skill>>;
}
```

### 拡張後インターフェース

```typescript
interface SkillAPI {
  // 既存メソッド
  listAvailable: () => Promise<OperationResult<Skill[]>>;
  listImported: () => Promise<OperationResult<Skill[]>>;
  import: (skillIds: string[]) => Promise<OperationResult<void>>;
  remove: (skillId: string) => Promise<OperationResult<void>>;
  getDetail: (skillId: string) => Promise<OperationResult<Skill>>;

  // 新規追加
  /**
   * スキルを実行する
   * @param skillId 実行するスキルのID
   * @param params オプションパラメータ
   * @returns 実行結果
   */
  execute: (
    skillId: string,
    params?: Record<string, unknown>,
  ) => Promise<OperationResult<SkillExecutionResult>>;
}
```

---

## OperationResult 型（既存）

```typescript
/**
 * 操作結果の統一型（packages/shared/types/skill.ts で定義済み）
 */
interface OperationResult<T> {
  /** 成功フラグ */
  success: boolean;

  /** 成功時のデータ */
  data?: T;

  /** 失敗時のエラーメッセージ */
  error?: string;
}
```

---

## IPC チャンネル契約

### リクエスト形式

```typescript
// IPC Channel: "skill:execute"
// 引数形式
interface SkillExecuteIpcArgs {
  skillId: string;
  params?: Record<string, unknown>;
}
```

### レスポンス形式

```typescript
// IPC Response
type SkillExecuteIpcResponse = OperationResult<SkillExecutionResult>;

// 成功例
{
  success: true,
  data: {
    executionId: "uuid-1234-5678",
    status: "success",
    output: "スキルが正常に実行されました",
    startedAt: "2026-01-18T10:00:00.000Z",
    completedAt: "2026-01-18T10:00:01.500Z"
  }
}

// 失敗例
{
  success: false,
  error: "スキルが見つかりません"
}
```

---

## skillAPI.execute 実装仕様

```typescript
// apps/desktop/src/renderer/preload/index.ts

execute: async (
  skillId: string,
  params?: Record<string, unknown>,
) => {
  if (hasElectronAPI(window)) {
    return window.electronAPI.invoke<OperationResult<SkillExecutionResult>>(
      "skill:execute",
      { skillId, params },
    );
  }
  // Fallback for non-electron environment
  return {
    success: false,
    error: "Electron API not available",
  };
},
```

---

## 型定義の配置場所

| 型名                   | 配置場所                             | 備考             |
| ---------------------- | ------------------------------------ | ---------------- |
| `SkillExecutionResult` | `packages/shared/src/types/skill.ts` | 共有型として定義 |
| `SkillExecuteParams`   | `packages/shared/src/types/skill.ts` | IPC引数の型      |
| `OperationResult<T>`   | `packages/shared/src/types/skill.ts` | 既存（変更なし） |

---

## エラーコード

| コード               | 説明                           |
| -------------------- | ------------------------------ |
| `SKILL_NOT_FOUND`    | 指定されたスキルが存在しない   |
| `SKILL_NOT_IMPORTED` | スキルがインポートされていない |
| `EXECUTION_FAILED`   | スキル実行中にエラーが発生     |
| `VALIDATION_ERROR`   | 引数バリデーションエラー       |
| `IPC_SECURITY_ERROR` | IPC sender検証エラー           |

---

## 完了確認

- [x] SkillExecutionResult インターフェースを設計
- [x] SkillExecuteParams インターフェースを設計
- [x] skillAPI.execute メソッドシグネチャを設計
- [x] IPC チャンネル契約を定義
- [x] 型定義の配置場所を決定
- [x] エラーコードを定義
- [x] outputs/phase-2/interface-design.md に出力
