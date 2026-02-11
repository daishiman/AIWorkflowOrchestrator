# アーキテクチャ設計書: SkillService.executeSkill() の SkillExecutor 委譲

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| タスクID | TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION |
| Phase    | 2                                     |
| 作成日   | 2026-02-11                            |

---

## 1. 概要

本ドキュメントでは、`skill:execute` IPCハンドラーから `SkillExecutor.execute()` への委譲パターンのアーキテクチャを定義する。

---

## 2. 現在のアーキテクチャ (Before)

```
Renderer                    Main Process
+-------------------+       +---------------------------------------+
| useSkillExecution |       | skillHandlers.ts                      |
|     hook          |       | +-----------------------------------+ |
|                   |------>| | skill:execute handler             | |
|                   |       | |   |                               | |
|                   |       | |   v                               | |
|                   |       | | SkillService.executeSkill()       | |
|                   |       | |   |                               | |
|                   |       | |   v                               | |
|                   |       | | [STUB: 常に成功を返す]            | |
|                   |       | +-----------------------------------+ |
|                   |<------|                                       |
|                   |       | SkillExecutor (未使用)                |
+-------------------+       +---------------------------------------+
```

### 問題点

1. `SkillService.executeSkill()` はスタブ実装で、実際のスキル実行が行われない
2. 完全実装済みの `SkillExecutor` が使用されていない
3. ストリーミング、リトライ、中断などの機能が利用できない

---

## 3. 新しいアーキテクチャ (After)

```
Renderer                    Main Process
+-------------------+       +---------------------------------------+
| useSkillExecution |       | skillHandlers.ts                      |
|     hook          |       | +-----------------------------------+ |
|                   |------>| | skill:execute handler             | |
|                   |       | |   |                               | |
|                   |       | |   v                               | |
|                   |       | | SkillService.getSkillById()       | |
|                   |       | |   |                               | |
|                   |       | |   v                               | |
|                   |       | | SkillExecutor.execute()           | |
|                   |       | |   |                               | |
|                   |       | |   v                               | |
|                   |       | | SDK query() + Stream               | |
|                   |       | +-----------------------------------+ |
|                   |<------|         |                             |
|                   |       |         v (SKILL_STREAM)              |
| onSkillStream     |<======| mainWindow.webContents.send()         |
+-------------------+       +---------------------------------------+
```

---

## 4. 設計判断

| 判断項目                          | 選択                   | 理由                                          |
| --------------------------------- | ---------------------- | --------------------------------------------- |
| SkillService.executeSkill()の扱い | 非推奨化 + @deprecated | 既存のテストコードへの影響を最小化            |
| SkillExecutorのインスタンス管理   | モジュールレベル変数   | 既存パターン（\_skillExecutorInstance）を維持 |
| パラメータ変換                    | ハンドラー内で実施     | 責務を明確に分離                              |
| ストリーミング                    | 既存の仕組みを流用     | SKILL_CHANNELS.SKILL_STREAM経由               |
| Skill → SkillMetadata 変換        | 明示的な変換関数       | 型安全性を確保                                |

---

## 5. コンポーネント図

```
+------------------+     +------------------+     +------------------+
|    Renderer      |     |     Preload      |     |      Main        |
+------------------+     +------------------+     +------------------+
|                  |     |                  |     |                  |
| useSkill-        |     | safeInvoke()     |     | skillHandlers.ts |
| Execution()      |---->| contextBridge    |---->|                  |
|                  |     |                  |     | +-------------+  |
|                  |     |                  |     | | skill:      |  |
| onSkillStream()  |<----| safeOn()         |<----| | execute     |  |
|                  |     |                  |     | | handler     |  |
+------------------+     +------------------+     | +------+------+  |
                                                  |        |         |
                                                  |        v         |
                                                  | +-------------+  |
                                                  | | Skill-      |  |
                                                  | | Service     |  |
                                                  | | .getSkill-  |  |
                                                  | | ById()      |  |
                                                  | +------+------+  |
                                                  |        |         |
                                                  |        v         |
                                                  | +-------------+  |
                                                  | | Skill-      |  |
                                                  | | Executor    |  |
                                                  | | .execute()  |  |
                                                  | +------+------+  |
                                                  |        |         |
                                                  |        v         |
                                                  | +-------------+  |
                                                  | | SDK query() |  |
                                                  | +------+------+  |
                                                  |        |         |
                                                  |        v         |
                                                  | [SKILL_STREAM]   |
                                                  +------------------+
```

---

## 6. シーケンス図

### 6.1 正常系

```
Renderer          Preload           Main                     SDK
   |                 |                |                        |
   |--execute()----->|                |                        |
   |                 |--safeInvoke--->|                        |
   |                 |                |--getSkillById()        |
   |                 |                |<--Skill                |
   |                 |                |                        |
   |                 |                |--execute()------------>|
   |                 |                |                        |
   |                 |                |<--stream.text----------|
   |<--SKILL_STREAM--|<--send---------|                        |
   |                 |                |                        |
   |                 |                |<--stream.complete------|
   |<--SKILL_STREAM--|<--send---------|                        |
   |                 |                |                        |
   |<--response------|<--return-------|                        |
   |                 |                |                        |
```

### 6.2 エラー系（スキル未発見）

```
Renderer          Preload           Main
   |                 |                |
   |--execute()----->|                |
   |                 |--safeInvoke--->|
   |                 |                |--getSkillById()
   |                 |                |<--null
   |                 |                |
   |<--error---------|<--return-------|
   | (SKILL_NOT_FOUND)|               |
```

### 6.3 中断フロー

```
Renderer          Preload           Main                     SDK
   |                 |                |                        |
   |--execute()----->|                |                        |
   |                 |--safeInvoke--->|--execute()------------>|
   |                 |                |                        |
   |--abort()------->|                |                        |
   |                 |--safeInvoke--->|                        |
   |                 |                |--abort()               |
   |                 |                |--AbortController       |
   |                 |                |                        |
   |<--SKILL_STREAM--|<--send---------|<--AbortError-----------|
   | (error: aborted)|                |                        |
   |                 |                |                        |
```

---

## 7. クラス図

### 7.1 変更対象

```
+-----------------------------------------------------------+
|                     skillHandlers.ts                       |
+-----------------------------------------------------------+
| - _skillExecutorInstance: SkillExecutor | null            |
+-----------------------------------------------------------+
| + registerSkillHandlers(mainWindow, skillService): void   |
| + unregisterSkillHandlers(): void                         |
| - extractPromptFromParams(params): string          [NEW]  |
| - convertToSkillMetadata(skill): SkillMetadata     [NEW]  |
+-----------------------------------------------------------+

+-----------------------------------------------------------+
|                      SkillService.ts                       |
+-----------------------------------------------------------+
| - cache: Map<string, Skill>                               |
| - lastScanTime: Date | null                               |
+-----------------------------------------------------------+
| + scanAvailableSkills(forceRefresh): SkillScanResult      |
| + getImportedSkills(): Skill[]                            |
| + importSkills(skillIds): ImportResult                    |
| + removeSkill(skillId): RemoveResult                      |
| + getSkillById(id): Skill | null                          |
| + clearCache(): void                                      |
| + getSkillByName(name): ImportedSkill | null              |
| + getSkillsDirectory(): string                            |
| + executeSkill(skillId, params): SkillRunResult  [@deprecated]  |
+-----------------------------------------------------------+

+-----------------------------------------------------------+
|                     SkillExecutor.ts                       |
+-----------------------------------------------------------+
| - mainWindow: BrowserWindow                               |
| - activeExecutions: Map<string, ExecutionContext>         |
| - permissionResolver: PermissionResolver                  |
| - permissionStore: IPermissionStore | null                |
| - authKeyService: IAuthKeyService | null                  |
+-----------------------------------------------------------+
| + execute(request, skill): SkillExecutionResponse         |
| + abort(executionId): boolean                             |
| + getActiveExecutions(): ExecutionInfo[]                  |
| + getExecutionStatus(executionId): ExecutionInfo | undef  |
| + createHooks(executionId): Hooks                         |
| + sanitizeArgs(args, depth): Record<string, unknown>      |
| + getPermissionReason(toolName, args): string             |
| + handlePermissionResponse(...): void                     |
| + sendPermissionRequest(...): SkillPermissionResponse     |
+-----------------------------------------------------------+
```

---

## 8. データフロー

### 8.1 入力データ

| フィールド       | 型                        | 必須 | 説明               |
| ---------------- | ------------------------- | ---- | ------------------ |
| `skillId`        | `string`                  | Yes  | スキルID           |
| `params`         | `Record<string, unknown>` | No   | 実行パラメータ     |
| `params.prompt`  | `string`                  | No   | プロンプト         |
| `params.message` | `string`                  | No   | メッセージ（互換） |
| `params.timeout` | `number`                  | No   | タイムアウト(ms)   |

### 8.2 内部データ変換

```typescript
// IPC引数 → SkillExecutionRequest
{
  skillId: args.skillId,           // そのまま
  params: args.params              // そのまま
}
    ↓
{
  prompt: extractPromptFromParams(args.params),  // 変換
  skillId: args.skillId,
  timeout: args.params?.timeout as number | undefined
}

// Skill → SkillMetadata
{
  id: skill.id,
  name: skill.name,
  slug: skill.slug,
  description: skill.description,
  path: skill.path,
  triggers: skill.triggers,
  anchors: skill.anchors,
  allowedTools: skill.allowedTools
  // lastModified は除外
}
```

### 8.3 出力データ

#### 成功時

```typescript
{
  success: true,
  data: {
    executionId: string
  }
}
```

#### 失敗時

```typescript
{
  success: false,
  error: string,           // ユーザー向けメッセージ
  errorCode?: string       // デバッグ用コード
}
```

---

## 9. エラーハンドリング設計

### 9.1 エラーコードマッピング

#### IPCハンドラー独自エラー（SkillExecutor呼び出し前）

| エラー状況             | errorCode                | カテゴリ          |
| ---------------------- | ------------------------ | ----------------- |
| スキル未発見           | SKILL_NOT_FOUND          | Business (2xxx)   |
| SkillExecutor未初期化  | EXECUTOR_NOT_INITIALIZED | Internal (5xxx)   |
| 引数バリデーション失敗 | VALIDATION_FAILED        | Validation (1xxx) |

#### SkillExecutorエラー（SDK実行中）

| エラー状況     | errorCode               | カテゴリ                |
| -------------- | ----------------------- | ----------------------- |
| 認証エラー     | AUTHENTICATION_ERROR    | External Service (3xxx) |
| 実行失敗       | EXECUTION_FAILED        | External Service (3xxx) |
| タイムアウト   | TIMEOUT                 | External Service (3xxx) |
| ユーザー中断   | ABORTED                 | Business (2xxx)         |
| 同時実行数超過 | MAX_CONCURRENT_EXCEEDED | Business (2xxx)         |

### 9.2 エラー処理フロー

```
                    skill:execute handler
                           |
                           v
                    [引数バリデーション]
                           |
              +-----------++-----------+
              |                        |
         (無効)                    (有効)
              |                        |
              v                        v
    return { success: false,     [getSkillById()]
             error: "...",             |
             errorCode: "..." }  +-----+-----+
                                 |           |
                              (null)     (Skill)
                                 |           |
                                 v           v
                    return { success: false, [execute()]
                             error: "...",      |
                             errorCode: "..." } |
                                          +-----+-----+
                                          |           |
                                      (error)    (success)
                                          |           |
                                          v           v
                            [convertToSkillError] return { success: true }
                                          |
                                          v
                            return { success: false }
```

---

## 10. セキュリティ設計

### 10.1 維持するセキュリティ機構

| 機構                       | 説明                      | 変更 |
| -------------------------- | ------------------------- | ---- |
| validateIpcSender()        | IPC送信元の検証           | なし |
| safeInvoke/safeOn          | 安全なIPC呼び出しパターン | なし |
| IPC_CHANNELSホワイトリスト | チャンネル名の定数管理    | なし |
| AuthKeyService             | APIキーの安全な管理       | なし |
| ログサニタイズ             | 機密情報のマスキング      | なし |

### 10.2 セキュリティチェックポイント

1. **ハンドラー入口**: `validateIpcSender()` で送信元検証
2. **パラメータ検証**: `skillId` の存在と型チェック
3. **スキル存在確認**: `getSkillById()` で存在確認
4. **実行時**: `SkillExecutor` の既存セキュリティ機構（PreToolUse Hooksなど）

---

## 11. 実装ファイル一覧

| ファイル                                               | 変更内容                                  | 優先度 |
| ------------------------------------------------------ | ----------------------------------------- | ------ |
| `apps/desktop/src/main/ipc/skillHandlers.ts`           | skill:executeハンドラー修正、新規関数追加 | P0     |
| `apps/desktop/src/main/services/skill/SkillService.ts` | executeSkillに@deprecatedコメント追加     | P1     |

### 新規追加関数

| 関数名                  | 配置先           | 説明                       |
| ----------------------- | ---------------- | -------------------------- |
| extractPromptFromParams | skillHandlers.ts | paramsからpromptを抽出     |
| convertToSkillMetadata  | skillHandlers.ts | Skill → SkillMetadata 変換 |

---

## 12. 統合ポイント

| 統合ポイント   | 契約定義                                            |
| -------------- | --------------------------------------------------- |
| Renderer → IPC | skill:execute({ skillId: string, params?: object }) |
| IPC → Executor | SkillExecutionRequest, SkillMetadata                |
| Executor → SDK | SDK query() API, AbortSignal                        |
| SDK → Renderer | SKILL_STREAM (SkillStreamMessage)                   |

---

## 13. テスト戦略

### 13.1 ユニットテスト

- `extractPromptFromParams()` の単体テスト
- `convertToSkillMetadata()` の単体テスト
- skill:executeハンドラーのモックテスト

### 13.2 統合テスト

- IPC → SkillExecutor経路の動作確認
- ストリーミングメッセージの配信確認
- エラーハンドリングの動作確認

### 13.3 E2Eテスト

- アプリ起動 → スキル選択 → 実行 → 結果表示のフロー確認
