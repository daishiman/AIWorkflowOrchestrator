# Phase 2 成果物: 統一API設計書

## 作成日: 2026-02-05

## 統一SkillAPIインターフェース

仕様書 specification.md §5.4 に準拠し、API#1をベースに拡張。

```typescript
/**
 * 統一SkillAPI インターフェース
 * specification.md §5.4 準拠
 */
export interface SkillAPI {
  // ===== 一覧・管理 =====

  /** 利用可能なスキル一覧を取得 */
  list: () => Promise<SkillMetadata[]>;

  /** インポート済みスキル一覧を取得 */
  getImported: () => Promise<ImportedSkill[]>;

  /** スキルをインポート */
  import: (skillName: string) => Promise<ImportedSkill>;

  /** スキルを削除 */
  remove: (skillName: string) => Promise<void>;

  /** スキルを再スキャン */
  rescan: () => Promise<SkillMetadata[]>;

  // ===== 実行 =====

  /** スキルを実行 */
  execute: (request: SkillExecutionRequest) => Promise<SkillExecutionResponse>;

  /** 実行中のスキルを中断 */
  abort: (executionId: string) => Promise<void>;

  /** 実行状態を取得（仕様書外追加: 実用性のため保持） */
  getExecutionStatus: (executionId: string) => Promise<ExecutionInfo | null>;

  // ===== イベント =====

  /** ストリームメッセージを受信 */
  onStream: (callback: (message: SkillStreamMessage) => void) => () => void;

  /** 完了イベントを受信 */
  onComplete: (callback: (data: { executionId: string }) => void) => () => void;

  /** エラーイベントを受信 */
  onError: (
    callback: (data: { executionId: string; error: string }) => void,
  ) => () => void;

  // ===== 権限 =====

  /** 権限リクエストを受信 */
  onPermissionRequest: (
    callback: (request: SkillPermissionRequest) => void,
  ) => () => void;

  /** 権限応答を送信 */
  sendPermissionResponse: (
    response: SkillPermissionResponse,
  ) => Promise<{ success: boolean }>;
}
```

**メソッド数**: 13メソッド（仕様書12メソッド + getExecutionStatus 1メソッド）

---

## 設計判断

| #   | 判断項目                | 選択肢A                              | 選択肢B                               | 決定                       | 理由                                                  |
| --- | ----------------------- | ------------------------------------ | ------------------------------------- | -------------------------- | ----------------------------------------------------- |
| 1   | 戻り値型                | `OperationResult<T>` ラッパー        | 直接型 (`T` or `throw`)               | **B: 直接型**              | 仕様書§5.4準拠、呼び出し元でアンラップ不要            |
| 2   | execute引数             | `SkillExecutionRequest` オブジェクト | `(skillId, params)` 分割              | **A: オブジェクト**        | 仕様書準拠、拡張性高い                                |
| 3   | import引数              | `skillName: string` 単体             | `skillIds: string[]` 配列             | **A: 単体**                | 仕様書§5.4準拠、現行skillSlice.tsの利用パターンに合致 |
| 4   | 公開方法                | `window.electronAPI.skill` のみ      | `window.skillAPI` も残す              | **A: 単一公開**            | API攻撃面最小化、混乱防止                             |
| 5   | abort戻り値             | `Promise<boolean>`                   | `Promise<void>`                       | **B: void**                | 仕様書§5.4準拠                                        |
| 6   | remove戻り値            | `Promise<boolean>`                   | `Promise<void>`                       | **B: void**                | 仕様書§5.4準拠                                        |
| 7   | respondToPermission     | sync void                            | async `Promise<{ success: boolean }>` | **async維持**              | IPC通信は本質的に非同期、実用的                       |
| 8   | respondToPermission命名 | `respondToPermission` (仕様書)       | `sendPermissionResponse` (現行)       | **sendPermissionResponse** | 現行コード5箇所で使用中、変更コスト > メリット        |
| 9   | getExecutionStatus      | 削除（仕様書に未定義）               | 保持                                  | **保持**                   | 実用的機能、IPCチャンネル定義済み                     |

---

## IPCチャンネル対応表

| APIメソッド                   | IPCチャンネル定数           | チャンネル文字列            | 通信方向 | 通信種別 |
| ----------------------------- | --------------------------- | --------------------------- | -------- | -------- |
| `list()`                      | `SKILL_LIST`                | `skill:list`                | R→M      | invoke   |
| `getImported()`               | `SKILL_GET_IMPORTED`        | `skill:getImported`         | R→M      | invoke   |
| `import(skillName)`           | `SKILL_IMPORT`              | `skill:import`              | R→M      | invoke   |
| `remove(skillName)`           | `SKILL_REMOVE`              | `skill:remove`              | R→M      | invoke   |
| `rescan()`                    | `SKILL_SCAN`                | `skill:scan`                | R→M      | invoke   |
| `execute(request)`            | `SKILL_EXECUTE`             | `skill:execute`             | R→M      | invoke   |
| `abort(executionId)`          | `SKILL_ABORT`               | `skill:abort`               | R→M      | invoke   |
| `getExecutionStatus(id)`      | `SKILL_GET_STATUS`          | `skill:get-status`          | R→M      | invoke   |
| `onStream(cb)`                | `SKILL_STREAM`              | `skill:stream`              | M→R      | on       |
| `onComplete(cb)`              | `SKILL_COMPLETE`            | `skill:complete`            | M→R      | on       |
| `onError(cb)`                 | `SKILL_ERROR`               | `skill:error`               | M→R      | on       |
| `onPermissionRequest(cb)`     | `SKILL_PERMISSION_REQUEST`  | `skill:permission:request`  | M→R      | on       |
| `sendPermissionResponse(res)` | `SKILL_PERMISSION_RESPONSE` | `skill:permission:response` | R→M      | invoke   |

---

## データフロー設計

### invoke通信（R→M→R）

```
Renderer            Preload                 Main Process
   |                   |                         |
   |-- call API ------>|                         |
   |                   |-- safeInvoke(ch) ------>|
   |                   |                         |-- handle(ch) -->
   |                   |                         |<-- return ------
   |                   |<-- resolve/reject ------|
   |<-- result/throw --|                         |
```

### on通信（M→R）

```
Main Process        Preload                 Renderer
   |                   |                         |
   |-- send(ch, data)->|                         |
   |                   |-- safeOn callback ----->|
   |                   |                         |-- setState -->
```

---

## エラーハンドリング設計

| エラーパターン     | Preload層の処理                    | Renderer層の処理                          |
| ------------------ | ---------------------------------- | ----------------------------------------- |
| IPC通信エラー      | `safeInvoke`がPromise.rejectを返す | try/catchでキャッチ、エラーメッセージ表示 |
| チャンネル未許可   | `safeInvoke`が即座にrejectを返す   | 同上                                      |
| Main Processエラー | ipcRenderer.invokeのrejectが伝播   | 同上                                      |
| タイムアウト       | Electronデフォルト動作             | skillError状態に設定                      |

**重要**: `OperationResult<T>` ラッパーは使用せず、エラー時は直接throwする。
