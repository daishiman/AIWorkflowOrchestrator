# Phase 2: 設計 - SkillExecutorのIPCチャネル名定数化

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 2                                  |
| Phase名    | 設計                               |
| 前提Phase  | Phase 1 (要件定義)                 |
| 後続Phase  | Phase 3 (設計レビュー)             |
| ステータス | 未実施                             |
| 作成日     | 2026-02-08                         |
| タスクID   | TASK-FIX-12-1-IPC-HARDCODE-FIX     |
| タスク名   | SkillExecutorのIPCチャネル名定数化 |

---

## 目的

ハードコードされた IPC チャネル名を定数参照に置き換える具体的な変更内容を設計する。

---

## 前提条件

- Phase 1 の要件定義完了
- `SKILL_CHANNELS.SKILL_STREAM` 定数が既に定義済み
- `SkillExecutor.ts` で既に `SKILL_CHANNELS` をインポート済み

---

## アーキテクチャ概要

### レイヤー構成（変更なし）

```
Renderer Process
    ↑ skill:stream (IPC送信)
Main Process [SkillExecutor.ts]
    ↓ SKILL_CHANNELS.SKILL_STREAM 定数を使用
@repo/shared [channels.ts]
    - SKILL_CHANNELS.SKILL_STREAM = "skill:stream"
```

### 依存関係（既存）

```typescript
// SkillExecutor.ts L22（既存インポート）
import { SKILL_CHANNELS } from "@repo/shared/src/ipc/channels";
```

---

## 変更設計

### 変更箇所1: sendStream() メソッド

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`

**変更前** (L918):

```typescript
private sendStream(message: SkillStreamMessage): void {
  if (this.mainWindow.isDestroyed()) {
    return;
  }
  this.mainWindow.webContents.send("skill:stream", message);
}
```

**変更後**:

```typescript
private sendStream(message: SkillStreamMessage): void {
  if (this.mainWindow.isDestroyed()) {
    return;
  }
  this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message);
}
```

### 変更箇所2: sendHooksStream() メソッド

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`

**変更前** (L1214):

```typescript
private sendHooksStream(message: HooksStreamMessage): void {
  try {
    if (this.mainWindow.isDestroyed()) {
      return;
    }
    this.mainWindow.webContents.send("skill:stream", message);
  } catch (error) {
    console.error("[SkillExecutor] Failed to send hooks stream:", error);
  }
}
```

**変更後**:

```typescript
private sendHooksStream(message: HooksStreamMessage): void {
  try {
    if (this.mainWindow.isDestroyed()) {
      return;
    }
    this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message);
  } catch (error) {
    console.error("[SkillExecutor] Failed to send hooks stream:", error);
  }
}
```

---

## インポート確認

### 既存インポート（変更不要）

```typescript
// L22: 既にインポート済み
import { SKILL_CHANNELS } from "@repo/shared/src/ipc/channels";
```

新規インポートは不要。既存のインポートを活用。

---

## 影響範囲分析

### 影響を受けるファイル

| ファイル              | 変更 | 理由                     |
| --------------------- | ---- | ------------------------ |
| SkillExecutor.ts      | Yes  | ハードコード → 定数参照  |
| channels.ts           | No   | 定数は既に定義済み       |
| SkillExecutor.test.ts | No   | 動作は同一のため変更不要 |

### テスト影響

- 既存テストはハードコード文字列 `"skill:stream"` でモックを設定
- 定数参照後も実行時の値は同一（`"skill:stream"`）のため、テスト変更不要
- 動作互換性を確保

---

## セキュリティ考慮事項

### IPC セキュリティ原則への準拠

| 原則                           | 対応状況 |
| ------------------------------ | -------- |
| チャネル名はホワイトリスト管理 | 準拠     |
| 定数で参照                     | 準拠     |
| ハードコード文字列禁止         | 準拠     |

### 参照ルール

- `.claude/rules/04-electron-security.md` - IPC セキュリティ原則

---

## リスク分析

| リスク         | 可能性 | 影響度 | 対策                           |
| -------------- | ------ | ------ | ------------------------------ |
| 定数値の不一致 | 低     | 高     | 既存定義を使用するため低リスク |
| テスト失敗     | 低     | 中     | 値が同一のため影響なし         |
| 型エラー       | 低     | 低     | TypeScript 型チェックで検出    |

---

## 実装手順

1. `SkillExecutor.ts` L918 の文字列リテラルを `SKILL_CHANNELS.SKILL_STREAM` に置換
2. `SkillExecutor.ts` L1214 の文字列リテラルを `SKILL_CHANNELS.SKILL_STREAM` に置換
3. 型チェック実行（`pnpm --filter @repo/desktop typecheck`）
4. テスト実行（`pnpm --filter @repo/desktop test`）
5. ハードコード検索で0件確認（`grep -n '"skill:stream"' SkillExecutor.ts`）

---

## 成果物

| 成果物             | パス                                                    |
| ------------------ | ------------------------------------------------------- |
| 設計ドキュメント   | 本ファイル                                              |
| 変更コード（予定） | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |

---

## 統合テスト連携

**該当なし**: 本タスクは動作変更を伴わないリファクタリング（IPCチャネル名の定数化）のため、統合テストへの影響はありません。既存のテストスイートがPASSすることで動作互換性を確認します。

---

## 完了条件

- [ ] 変更箇所1（L918）の設計完了
- [ ] 変更箇所2（L1214）の設計完了
- [ ] インポート確認完了（新規追加不要）
- [ ] 影響範囲分析完了
- [ ] セキュリティ考慮事項の確認

---

## 次のPhase

完了後、以下のファイルを実行:

`docs/30-workflows/task-fix-12-1-ipc-hardcode-fix/phase-3-design-review.md`
