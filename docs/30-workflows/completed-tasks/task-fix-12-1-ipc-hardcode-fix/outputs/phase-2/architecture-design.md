# Phase 2: 設計書

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | TASK-FIX-12-1-IPC-HARDCODE-FIX                        |
| フェーズ     | Phase 2: 設計                                         |
| 作成日       | 2026-02-09                                            |
| ステータス   | 完了                                                  |
| 前提成果物   | `outputs/phase-1/requirements-definition.md`          |
| 対象ファイル | apps/desktop/src/main/services/skill/SkillExecutor.ts |

---

## 1. アーキテクチャ概要

### 1.1 レイヤー構成

本タスクはリファクタリングであり、レイヤー構成に変更はない。

```
┌─────────────────────────────────────────────────────────────┐
│ Renderer Process                                            │
│  └─ IPC Listener: SKILL_CHANNELS.SKILL_STREAM              │
├─────────────────────────────────────────────────────────────┤
│ Main Process                                                │
│  └─ SkillExecutor.ts                                       │
│      ├─ sendStream()       → webContents.send(SKILL_STREAM)│
│      └─ sendHooksStream()  → webContents.send(SKILL_STREAM)│
├─────────────────────────────────────────────────────────────┤
│ Shared Package (@repo/shared)                               │
│  └─ ipc/channels.ts                                        │
│      └─ SKILL_CHANNELS.SKILL_STREAM = "skill:stream"       │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 依存方向

```
SkillExecutor.ts
  ↓ import
@repo/shared/src/ipc/channels.ts (SKILL_CHANNELS)
```

- 依存方向: Main Process → Shared Package（下位層への一方向依存）
- 01-architecture.md の依存方向ルールに準拠

---

## 2. 変更設計

### 2.1 インポート確認

**現状（L22）**: SKILL_CHANNELS は既にインポート済み

```typescript
import { SKILL_CHANNELS } from "@repo/shared/src/ipc/channels";
```

**変更**: 不要（既存インポートをそのまま使用）

### 2.2 変更箇所1: sendStream() メソッド

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`
**行番号**: L918

#### Before

```typescript
private sendStream(message: SkillStreamMessage): void {
  // BrowserWindow が有効かチェック
  if (this.mainWindow.isDestroyed()) {
    return;
  }

  // IPC 経由で Renderer に送信
  this.mainWindow.webContents.send("skill:stream", message);  // ← ハードコード
}
```

#### After

```typescript
private sendStream(message: SkillStreamMessage): void {
  // BrowserWindow が有効かチェック
  if (this.mainWindow.isDestroyed()) {
    return;
  }

  // IPC 経由で Renderer に送信
  this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message);  // ← 定数参照
}
```

### 2.3 変更箇所2: sendHooksStream() メソッド

**ファイル**: `apps/desktop/src/main/services/skill/SkillExecutor.ts`
**行番号**: L1214

#### Before

```typescript
private sendHooksStream(message: HooksStreamMessage): void {
  try {
    if (this.mainWindow.isDestroyed()) {
      return;
    }
    this.mainWindow.webContents.send("skill:stream", message);  // ← ハードコード
  } catch (error) {
    // IPC送信エラーはログ出力のみで処理を継続
    console.error("[SkillExecutor] Failed to send hooks stream:", error);
  }
}
```

#### After

```typescript
private sendHooksStream(message: HooksStreamMessage): void {
  try {
    if (this.mainWindow.isDestroyed()) {
      return;
    }
    this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message);  // ← 定数参照
  } catch (error) {
    // IPC送信エラーはログ出力のみで処理を継続
    console.error("[SkillExecutor] Failed to send hooks stream:", error);
  }
}
```

---

## 3. 影響範囲分析

### 3.1 コード変更影響

| 対象             | 変更内容                      | 影響     |
| ---------------- | ----------------------------- | -------- |
| SkillExecutor.ts | 2箇所の文字列を定数参照に変更 | 直接変更 |
| テストファイル   | 変更不要                      | 影響なし |
| Preload/Renderer | 変更不要                      | 影響なし |
| channels.ts      | 変更不要                      | 影響なし |

### 3.2 ランタイム動作

| 項目                   | 変更前             | 変更後                        | 比較     |
| ---------------------- | ------------------ | ----------------------------- | -------- |
| 送信チャネル名         | `"skill:stream"`   | `SKILL_CHANNELS.SKILL_STREAM` | 同一値   |
| メッセージフォーマット | SkillStreamMessage | SkillStreamMessage            | 変更なし |
| 送信タイミング         | 変更なし           | 変更なし                      | 同一     |
| エラーハンドリング     | 変更なし           | 変更なし                      | 同一     |

**結論**: ランタイム動作に変更なし。既存テストはそのまま PASS する。

### 3.3 テスト変更不要の理由

既存テスト（SkillExecutor.test.ts）では、IPC 送信を以下のようにモックしている:

```typescript
expect(mockWebContents.send).toHaveBeenCalledWith(
  "skill:stream",
  expect.objectContaining({ ... })
);
```

`SKILL_CHANNELS.SKILL_STREAM` の値は `"skill:stream"` であるため、テストのアサーションはそのまま成功する。

---

## 4. セキュリティ考慮事項

### 4.1 IPC セキュリティ原則との整合性

| 原則                                         | 対応状況 | 説明                               |
| -------------------------------------------- | -------- | ---------------------------------- |
| チャンネル名はホワイトリストで管理           | 準拠     | channels.ts で一元管理済み         |
| 定数で参照                                   | 準拠     | SKILL_CHANNELS.SKILL_STREAM で参照 |
| ハードコード文字列でチャンネル名を指定しない | 準拠     | 本タスクで解消                     |

### 4.2 セキュリティリスク

- **リスク**: なし
- **理由**: ランタイム動作に変更なく、セキュリティ上の新たな問題は発生しない

---

## 5. リスク分析

### 5.1 技術的リスク

| リスク                         | 発生確率 | 影響度 | 対策                           |
| ------------------------------ | -------- | ------ | ------------------------------ |
| 変更ミスによるチャネル名不一致 | 低       | 高     | 定数参照により人為的ミスを排除 |
| インポート漏れ                 | 最低     | 中     | L22 で既にインポート済み       |
| テスト失敗                     | 最低     | 低     | 値が同一のため失敗しない       |

### 5.2 リスク軽減策

1. **変更後の grep 確認**: プロダクションコードに残存ハードコードがないことを確認
2. **テスト実行**: 全既存テストの PASS を確認
3. **型チェック**: TypeScript コンパイルエラーがないことを確認

---

## 6. 実装ガイドライン

### 6.1 変更手順

1. SkillExecutor.ts を開く
2. L918 の `"skill:stream"` を `SKILL_CHANNELS.SKILL_STREAM` に置換
3. L1214 の `"skill:stream"` を `SKILL_CHANNELS.SKILL_STREAM` に置換
4. ファイル保存
5. テスト実行で動作確認

### 6.2 検証コマンド

```bash
# 残存ハードコード確認
grep -n '"skill:stream"' apps/desktop/src/main/services/skill/SkillExecutor.ts

# テスト実行
pnpm --filter @repo/desktop test -- SkillExecutor

# 型チェック
pnpm --filter @repo/desktop typecheck
```

---

## 7. 完了条件チェックリスト

- [ ] インポート確認: SKILL_CHANNELS が L22 でインポート済み
- [ ] 変更箇所1: L918 の置換完了
- [ ] 変更箇所2: L1214 の置換完了
- [ ] セキュリティ原則: 準拠確認
- [ ] 影響範囲: 限定的（SkillExecutor.ts のみ）
- [ ] テスト変更: 不要であることを確認

---

## 8. 次フェーズ

Phase 3: 設計レビュー → `outputs/phase-3/design-review-result.md`
