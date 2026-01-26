---
id: TASK-4-1
tier: 1
title: IPCチャネル定義
phase: 4
depends_on: [TASK-1-1]
parallel_with: []
blocks: [TASK-4-2, TASK-5-1]
status: pending
priority: high
estimated_complexity: small
tags: [backend, preload, ipc]
---

# IPCチャネル定義

## 概要

スキルインポート機能で使用する全ての IPC チャネル名を定義する。

## 入力

- 既存の IPC チャネルパターン（`apps/desktop/src/preload/channels.ts`）

## 出力

- IPC チャネル定数の追加

## 実装詳細

### チャネル定義

```typescript
// apps/desktop/src/preload/channels.ts に追加

export const SKILL_CHANNELS = {
  // スキルディスカバリー
  /** 全スキル一覧取得（キャッシュあり） */
  SKILL_LIST: "skill:list",
  /** スキル再スキャン（キャッシュ無効化） */
  SKILL_SCAN: "skill:scan",

  // インポート管理
  /** スキルをインポート */
  SKILL_IMPORT: "skill:import",
  /** スキルを削除（アンインポート） */
  SKILL_REMOVE: "skill:remove",
  /** インポート済みスキル一覧取得 */
  SKILL_GET_IMPORTED: "skill:getImported",
  /** スキル情報更新 */
  SKILL_UPDATE: "skill:update",

  // 実行
  /** スキル実行開始 */
  SKILL_EXECUTE: "skill:execute",
  /** 実行中止 */
  SKILL_ABORT: "skill:abort",

  // ストリーミングイベント（Main → Renderer）
  /** ストリーミングメッセージ */
  SKILL_STREAM: "skill:stream",
  /** 実行完了 */
  SKILL_COMPLETE: "skill:complete",
  /** エラー発生 */
  SKILL_ERROR: "skill:error",

  // 権限確認
  /** 権限確認リクエスト（Main → Renderer） */
  SKILL_PERMISSION_REQUEST: "skill:permission:request",
  /** 権限確認応答（Renderer → Main） */
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",
} as const;

export type SkillChannel = (typeof SKILL_CHANNELS)[keyof typeof SKILL_CHANNELS];
```

### チャネル用途一覧

| チャネル                    | 方向 | 用途               | ペイロード                                        |
| --------------------------- | ---- | ------------------ | ------------------------------------------------- |
| `skill:list`                | R→M  | スキル一覧取得     | なし                                              |
| `skill:scan`                | R→M  | 再スキャン         | なし                                              |
| `skill:import`              | R→M  | インポート         | `skillName: string`                               |
| `skill:remove`              | R→M  | 削除               | `skillName: string`                               |
| `skill:getImported`         | R→M  | インポート済み取得 | なし                                              |
| `skill:update`              | R→M  | 更新               | `skillName: string, data: Partial<ImportedSkill>` |
| `skill:execute`             | R→M  | 実行開始           | `SkillExecutionRequest`                           |
| `skill:abort`               | R→M  | 実行中止           | `executionId: string`                             |
| `skill:stream`              | M→R  | ストリーミング     | `SkillStreamMessage`                              |
| `skill:complete`            | M→R  | 完了通知           | `{ executionId: string }`                         |
| `skill:error`               | M→R  | エラー通知         | `{ executionId: string, error: string }`          |
| `skill:permission:request`  | M→R  | 権限確認要求       | `PermissionRequest`                               |
| `skill:permission:response` | R→M  | 権限確認応答       | `PermissionResponse`                              |

※ R→M: Renderer → Main, M→R: Main → Renderer

## ファイル

| 操作 | パス                                   |
| ---- | -------------------------------------- |
| 修正 | `apps/desktop/src/preload/channels.ts` |

## 依存パッケージ

なし

## 完了条件

- [ ] `SKILL_CHANNELS` オブジェクトが定義されている
- [ ] 全13チャネルが定義されている
- [ ] `SkillChannel` 型がエクスポートされている
- [ ] 既存のチャネル定義と重複がない
- [ ] TypeScript コンパイルエラーがない

## テスト要件

- 静的解析のみ（ランタイムテスト不要）

## 参考資料

- [specification.md - 5.3 IPCチャネル定義](../specification.md)
- 既存パターン: `apps/desktop/src/preload/channels.ts`
