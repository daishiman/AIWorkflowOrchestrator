# skillAPIインターフェース設計書

## メタ情報

| 項目   | 内容                            |
| ------ | ------------------------------- |
| Phase  | 2                               |
| 作成日 | 2026-01-25                      |
| 機能名 | TASK-3-1-D-permission-dialog-ui |

---

## 1. 概要

skillAPIにpermission関連メソッドを追加し、Main Processからの権限リクエストを受信し、ユーザーの応答をMain Processに送信する機能を提供する。

---

## 2. SkillAPI インターフェース定義

### 2.1 拡張後の完全なインターフェース

```typescript
/**
 * SkillAPI - Skill 実行関連の Preload API インターフェース
 *
 * @module @repo/desktop/preload/skill-api
 */
export interface SkillAPI {
  // ==============================
  // 既存メソッド
  // ==============================

  /**
   * スキルを実行する
   * @param request - 実行リクエスト
   * @returns 実行レスポンス（executionId を含む）
   */
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;

  /**
   * ストリームメッセージを受信するコールバックを登録する
   * @param callback - メッセージ受信時のコールバック関数
   * @returns クリーンアップ関数（リスナー解除用）
   */
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;

  /**
   * 実行中のスキルを中断する
   * @param executionId - 中断対象の実行ID
   * @returns 中断成功の場合 true
   */
  abort: (executionId: string) => Promise<boolean>;

  /**
   * 実行状態を取得する
   * @param executionId - 実行ID
   * @returns 実行情報（見つからない場合 null）
   */
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

  // ==============================
  // 新規追加メソッド（Permission関連）
  // ==============================

  /**
   * 権限リクエストを受信するコールバックを登録する
   *
   * Main Processからの権限確認リクエストをリッスンし、
   * リクエスト受信時に登録されたコールバック関数を呼び出す。
   *
   * @param callback - 権限リクエスト受信時のコールバック関数
   * @returns クリーンアップ関数（リスナー解除用）
   *
   * @example
   * const cleanup = skillAPI.onPermission((request) => {
   *   console.log(`Tool: ${request.toolName}, Reason: ${request.reason}`);
   *   // ダイアログを表示する処理
   * });
   *
   * // クリーンアップ
   * cleanup();
   */
  onPermission: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;

  /**
   * 権限応答をMain Processに送信する
   *
   * ユーザーが「許可」または「拒否」を選択した後、
   * その結果をMain Processに送信する。
   *
   * @param response - 権限応答
   * @returns 送信成功の場合 true
   *
   * @example
   * await skillAPI.respondPermission({
   *   requestId: "req-123",
   *   approved: true,
   *   rememberChoice: false,
   * });
   */
  respondPermission: (response: SkillPermissionResponse) => Promise<boolean>;
}
```

---

## 3. 新規型定義

### 3.1 SkillPermissionRequest

```typescript
/**
 * スキル権限リクエスト
 *
 * Main ProcessからRenderer Processに送信される権限確認リクエスト。
 * SkillExecutor.sendPermissionRequest()で生成される。
 */
export interface SkillPermissionRequest {
  /** 一意のリクエストID（UUID v4） */
  requestId: string;

  /** スキル実行ID */
  executionId: string;

  /** 実行許可を求めるツール名 */
  toolName: string;

  /** サニタイズされたツール引数 */
  args: Record<string, unknown>;

  /** ユーザー向けの理由説明（日本語） */
  reason: string;

  /** リクエスト生成時刻（Unix timestamp） */
  timestamp?: number;
}
```

### 3.2 SkillPermissionResponse

```typescript
/**
 * スキル権限応答
 *
 * Renderer ProcessからMain Processに送信される権限応答。
 * ユーザーの「許可」「拒否」選択結果を含む。
 */
export interface SkillPermissionResponse {
  /** リクエストID（リクエストと紐付け） */
  requestId: string;

  /** 許可された場合 true、拒否された場合 false */
  approved: boolean;

  /** 「この選択を記憶する」がチェックされた場合 true */
  rememberChoice?: boolean;

  /** 拒否理由（オプション、将来拡張用） */
  rejectReason?: string;
}
```

---

## 4. 実装詳細設計

### 4.1 onPermission メソッド実装

```typescript
/**
 * onPermission - 権限リクエストリスナー登録
 */
onPermission: (
  callback: (request: SkillPermissionRequest) => void,
): (() => void) =>
  safeOn<SkillPermissionRequest>(
    IPC_CHANNELS.SKILL_PERMISSION_REQUEST,
    callback,
  ),
```

**使用するIPCチャネル**: `skill:permission:request`

**セキュリティ**: `safeOn`関数により`ALLOWED_ON_CHANNELS`に登録されたチャネルのみ許可

### 4.2 respondPermission メソッド実装

```typescript
/**
 * respondPermission - 権限応答送信
 */
respondPermission: (response: SkillPermissionResponse): Promise<boolean> =>
  safeInvoke<boolean>(IPC_CHANNELS.SKILL_PERMISSION_RESPOND, response),
```

**使用するIPCチャネル**: `skill:permission:respond`

**セキュリティ**: `safeInvoke`関数により`ALLOWED_INVOKE_CHANNELS`に登録されたチャネルのみ許可

---

## 5. エラーハンドリング

### 5.1 onPermission エラー

| エラー条件                 | 対応                         |
| -------------------------- | ---------------------------- |
| チャネルが許可リストにない | 空のクリーンアップ関数を返す |
| IPCRendererが利用不可      | コンソール警告を出力         |

### 5.2 respondPermission エラー

| エラー条件                      | 対応                           |
| ------------------------------- | ------------------------------ |
| チャネルが許可リストにない      | Promise.reject                 |
| IPC送信エラー                   | Promise.reject                 |
| requestIdが無効（Main側で検出） | Main側でログ出力、Renderer無視 |

---

## 6. 統合テスト観点

### 6.1 テスト可能な設計

- `safeOn`/`safeInvoke`をモック可能にする
- IPCチャネルを定数化し、テストで参照可能にする
- コールバック関数の呼び出しを検証可能にする

### 6.2 統合テストシナリオ

| シナリオ           | 検証内容                                   |
| ------------------ | ------------------------------------------ |
| 権限リクエスト受信 | コールバックが正しいリクエストで呼ばれる   |
| 許可応答送信       | `approved: true`が送信される               |
| 拒否応答送信       | `approved: false`が送信される              |
| rememberChoice反映 | チェック状態が正しく送信される             |
| リスナー解除       | クリーンアップ後はコールバックが呼ばれない |

---

## 7. 既存agentAPIとの比較

| 機能           | agentAPI                 | skillAPI（新規）         |
| -------------- | ------------------------ | ------------------------ |
| リクエスト受信 | `onPermission`           | `onPermission`           |
| 応答送信       | `respondPermission`      | `respondPermission`      |
| チャネル       | `agent:permission-*`     | `skill:permission:*`     |
| 型定義         | `AgentPermissionRequest` | `SkillPermissionRequest` |
| 責務           | Agent実行用              | Skill実行用              |

---

## 8. 変更影響範囲

### 8.1 変更対象ファイル

| ファイル                                | 変更内容                            |
| --------------------------------------- | ----------------------------------- |
| `apps/desktop/src/preload/skill-api.ts` | onPermission, respondPermission追加 |
| `apps/desktop/src/preload/channels.ts`  | ALLOWED_ON/INVOKE_CHANNELS更新      |

### 8.2 新規作成ファイル

| ファイル                                                          | 内容           |
| ----------------------------------------------------------------- | -------------- |
| `apps/desktop/src/preload/__tests__/skill-api.permission.test.ts` | ユニットテスト |

---

## 9. 設計判断根拠

### 9.1 agentAPIパターンの踏襲

**判断**: 既存agentAPIの`onPermission`/`respondPermission`パターンを踏襲する

**理由**:

- 一貫したAPI設計により開発者の学習コストを低減
- 実績のあるパターンでリスクを軽減
- テストパターンの流用が可能

### 9.2 専用チャネルの採用

**判断**: `skill:permission:request`/`skill:permission:respond`専用チャネルを使用

**理由**:

- agentAPIとskillAPIの責務を明確に分離
- SKILL_STREAMチャネルの複雑化を回避
- デバッグ時のトレーサビリティ向上
