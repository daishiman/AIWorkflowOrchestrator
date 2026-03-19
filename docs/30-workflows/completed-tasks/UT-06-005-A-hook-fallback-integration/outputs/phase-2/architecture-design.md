# Phase 2 成果物: アーキテクチャ設計

## メタ情報

| 項目      | 値                                                                                     |
| --------- | -------------------------------------------------------------------------------------- |
| タスク ID | UT-06-005-A                                                                            |
| フェーズ  | Phase 2 - 設計                                                                         |
| 作成日    | 2026-03-17                                                                             |
| 参照      | `outputs/phase-1/requirements-definition.md`, `outputs/phase-1/acceptance-criteria.md` |

## 統合後の PreToolUse フロー

```
PreToolUse Hook (SkillExecutor.ts L1127-1184)
  │
  ├── [既存] FR-001: 危険コマンドチェック
  │     └── NG → block (proceed: false)
  │
  ├── [既存] FR-002: 保護パスチェック
  │     └── NG → block (proceed: false)
  │
  ├── [既存] FR-003: ツール実行開始通知
  │
  └── [新規] FR-101〜FR-106: handlePermissionCheck(executionId, toolName, args, signal)
        │
        ├── sendPermissionRequestWithTimeout(executionId, toolName, args, signal)
        │     │
        │     ├── Promise.race([
        │     │     sendPermissionRequest(...),
        │     │     timeoutPromise(DEFAULT_TIMEOUT_MS)
        │     │   ])
        │     │
        │     ├── タイムアウト検知 (FR-102)
        │     │     └── clearTimeout → throw PermissionTimeoutError
        │     │
        │     └── 応答取得 → SkillPermissionResponse を返す
        │
        ├── response.approved === true
        │     └── return { proceed: true }（後続処理継続）
        │
        └── response.approved === false
              │
              ├── try {
              │     processPermissionFallback(response, context)  [FR-101]
              │       │
              │       ├── action: "approved" → return { proceed: true }
              │       │
              │       ├── action: "skip" (FR-104)
              │       │     └── executeSkipFlow() → return { proceed: false }
              │       │
              │       ├── action: "retry" (FR-103)
              │       │     ├── retryCount < PERMISSION_MAX_RETRIES → retry ループ
              │       │     └── retryCount >= PERMISSION_MAX_RETRIES (FR-106)
              │       │           └── executeAbortFlow("max_retries") → throw
              │       │
              │       └── action: "abort" (FR-105)
              │             └── throw AbortError
              │   }
              └── catch (e) [NFR-101: fail-closed]
                    └── executeAbortFlow("error") → throw
```

## 主要設計方針

### 方針 1: FR-001〜FR-003 との非干渉

`handlePermissionCheck` は FR-001〜FR-003 の処理が全て完了した後に呼び出す。既存の `{ proceed: false }` による早期リターンパスには一切触れない。

### 方針 2: Promise.race によるタイムアウト制御

```
sendPermissionRequestWithTimeout:
  Promise.race([
    sendPermissionRequest(executionId, toolName, args, signal),
    new Promise<never>((_, reject) =>
      setTimeout(() => {
        reject(new PermissionTimeoutError(...));
      }, DEFAULT_TIMEOUT_MS)
    )
  ])
```

`clearTimeout` でタイマーを解放してメモリリークを防ぐ。

### 方針 3: while ループによる retry 制御

```
handlePermissionCheck:
  let retryCount = 0;
  while (true) {
    const response = await sendPermissionRequestWithTimeout(...);
    if (response.approved) return { proceed: true };
    const fallback = await processPermissionFallback(response, context);
    if (fallback.action === "retry") {
      if (retryCount >= PERMISSION_MAX_RETRIES) {
        await executeAbortFlow("max_retries");
        throw ...;
      }
      retryCount++;
      continue;  // ← ループ再実行
    }
    // skip / abort / approved の処理
    ...
  }
```

### 方針 4: fail-closed（NFR-101）

`handlePermissionCheck` 全体を try-catch で囲み、予期しない例外が発生した場合は `executeAbortFlow("error")` を呼び出して安全に停止する。

## コンポーネント配置

全ての新規コンポーネントは `apps/desktop/src/main/services/skill/SkillExecutor.ts` 内に配置する。DI の境界は `PermissionFlowContext`（既存型）を使用する。

| コンポーネント                     | 配置場所                                  | 種別                   |
| ---------------------------------- | ----------------------------------------- | ---------------------- |
| `PermissionTimeoutError`           | `SkillExecutor.ts` ファイルスコープ       | クラス（Error 継承）   |
| `sendPermissionRequestWithTimeout` | `SkillExecutor` クラス                    | private async メソッド |
| `handlePermissionCheck`            | `SkillExecutor` クラス                    | private async メソッド |
| `PreToolUse Hook` 修正箇所         | `SkillExecutor` クラス（L1127-1184 付近） | 既存メソッドの修正     |

## 既存コードとの変更境界

```
変更前 (L1127-1184 付近):
  async preToolUseHook(...): Promise<{ proceed: boolean }> {
    // FR-001 処理...
    // FR-002 処理...
    // FR-003 処理...
    return { proceed: true };  ← ここを修正
  }

変更後:
  async preToolUseHook(...): Promise<{ proceed: boolean }> {
    // FR-001 処理...（変更なし）
    // FR-002 処理...（変更なし）
    // FR-003 処理...（変更なし）
    return await this.handlePermissionCheck(executionId, toolName, args, signal);  ← 追加
  }
```
