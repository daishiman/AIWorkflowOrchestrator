# TASK-FIX-12-1-IPC-HARDCODE-FIX 実装ガイド

## メタ情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-FIX-12-1-IPC-HARDCODE-FIX                          |
| 作成日       | 2026-02-09                                              |
| 対象ファイル | `apps/desktop/src/main/services/skill/SkillExecutor.ts` |
| 変更箇所     | L918, L1214                                             |

---

# Part 1: 概念的説明（中学生レベル）

## IPC（Inter-Process Communication）とは？

IPC は「プログラムの部品同士がメッセージをやり取りする仕組み」です。

Electron アプリは、大きく分けて2つの部品で動いています:

1. **Main プロセス**: パソコンと直接やり取りする「裏方」の部品
2. **Renderer プロセス**: 画面を表示する「表舞台」の部品

この2つの部品は別々に動いているため、お互いに直接話しかけることができません。そこで、IPC という「伝言ゲーム」の仕組みを使って情報をやり取りします。

```
[Main] ──IPC──> [Renderer]
  裏方         表舞台

例: 「計算が終わったよ！結果は100だよ」
```

## チャンネル名とは？

チャンネル名は、メッセージの「宛先の名前」です。

たくさんのメッセージが行き来する中で、どのメッセージがどこに届くべきかを区別するために使います。テレビのチャンネルと同じように、番号（名前）を合わせないとメッセージが届きません。

```
チャンネル "skill:stream"  → スキル実行の進捗を伝える
チャンネル "auth:login"    → ログイン結果を伝える
チャンネル "file:save"     → ファイル保存の結果を伝える
```

## 定数化とは？

定数化は「同じ値を1箇所に登録して、名前で参照する仕組み」です。

### 日常の例え: 電話番号を連絡先に登録する

**登録しない場合（ハードコード）:**

```
毎回「090-1234-5678」と手入力
  ↓
間違えて「090-1234-5679」と入力してしまうリスク
  ↓
電話がつながらない！
```

**登録する場合（定数化）:**

```
「田中さん」として登録 → 090-1234-5678
  ↓
名前から選ぶだけ
  ↓
絶対に番号を間違えない！
```

プログラムでも同じです:

**ハードコード（危険）:**

```typescript
// 毎回文字を直接書く
send("skill:stream", data); // どこかで "skill:streem" と打ち間違えるかも
```

**定数化（安全）:**

```typescript
// 1箇所に登録
const SKILL_CHANNELS = {
  SKILL_STREAM: "skill:stream",
};

// 名前で参照（打ち間違えると赤線が出て教えてくれる）
send(SKILL_CHANNELS.SKILL_STREAM, data);
```

---

# Part 2: 技術的詳細

## 変更前（ハードコード）

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

// L918: sendStream メソッド
private sendStream(message: SkillStreamMessage): void {
  if (this.mainWindow.isDestroyed()) {
    return;
  }
  this.mainWindow.webContents.send("skill:stream", message);  // ← ハードコード
}

// L1214: sendHooksStream メソッド
private sendHooksStream(message: HooksStreamMessage): void {
  try {
    if (this.mainWindow.isDestroyed()) {
      return;
    }
    this.mainWindow.webContents.send("skill:stream", message);  // ← ハードコード
  } catch (error) {
    console.error("[SkillExecutor] Failed to send hooks stream:", error);
  }
}
```

### 問題点

1. **タイポのリスク**: `"skill:stream"` を `"skill:streem"` と打ち間違えてもコンパイルエラーにならない
2. **保守性の低下**: チャンネル名を変更する際、複数箇所を手動で修正する必要がある
3. **コード規約違反**: 04-electron-security.md の「ハードコード文字列でチャンネル名を指定しない」ルールに違反

## 変更後（定数参照）

```typescript
// apps/desktop/src/main/services/skill/SkillExecutor.ts

// L22: import追加
import { SKILL_CHANNELS } from "@repo/shared/src/ipc/channels";

// L918: sendStream メソッド
private sendStream(message: SkillStreamMessage): void {
  if (this.mainWindow.isDestroyed()) {
    return;
  }
  this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message);  // ← 定数参照
}

// L1214: sendHooksStream メソッド
private sendHooksStream(message: HooksStreamMessage): void {
  try {
    if (this.mainWindow.isDestroyed()) {
      return;
    }
    this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message);  // ← 定数参照
  } catch (error) {
    console.error("[SkillExecutor] Failed to send hooks stream:", error);
  }
}
```

## SKILL_CHANNELS オブジェクトの型定義

```typescript
// packages/shared/src/ipc/channels.ts

export const SKILL_CHANNELS = {
  /** スキル一覧取得 */
  LIST_AVAILABLE: "skill:list",
  /** インポート済みスキル取得 */
  LIST_IMPORTED: "skill:getImported",
  /** スキルインポート */
  IMPORT: "skill:import",
  /** スキル削除 */
  REMOVE: "skill:remove",
  /** スキル詳細取得 */
  GET_DETAIL: "skill:get-detail",
  /** スキル実行 */
  SKILL_EXECUTE: "skill:execute",
  /** スキル中断 */
  SKILL_ABORT: "skill:abort",
  /** スキルストリーム */
  SKILL_STREAM: "skill:stream", // ← 今回使用する定数
  /** 権限リクエスト */
  SKILL_PERMISSION_REQUEST: "skill:permission:request",
  /** 権限レスポンス */
  SKILL_PERMISSION_RESPONSE: "skill:permission:response",
} as const;

// 型定義（リテラル型として推論される）
type SkillChannels = typeof SKILL_CHANNELS;
// SKILL_CHANNELS.SKILL_STREAM は "skill:stream" リテラル型
```

## 定数化の理由

| 理由           | 説明                                                               |
| -------------- | ------------------------------------------------------------------ |
| タイポ防止     | 定数名を間違えるとTypeScriptコンパイルエラーになり、即座に検出可能 |
| 保守性向上     | チャンネル名の変更が1箇所で済む                                    |
| コード規約遵守 | 04-electron-security.md の IPC セキュリティ原則に準拠              |
| 型安全性       | `as const` によりリテラル型として推論され、型チェックが厳密        |
| IDE サポート   | 自動補完・定義ジャンプが使える                                     |

## エラーハンドリング（コンパイル時検出の例）

### タイポした場合

```typescript
// 間違った定数名
this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREEM, message);
//                                              ^^^^^^^^^^^^
// Error: Property 'SKILL_STREEM' does not exist on type 'typeof SKILL_CHANNELS'.
// Did you mean 'SKILL_STREAM'?
```

### 正しい定数名

```typescript
// 正しい定数名
this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message);
// OK - コンパイル成功
```

---

## 変更ファイル一覧

| ファイル                                                | 変更種別 | 内容                                       |
| ------------------------------------------------------- | -------- | ------------------------------------------ |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 修正     | L918, L1214 のハードコードを定数参照に変更 |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 追加     | L22 に import 文追加                       |

---

## テスト結果

| 指標       | 結果 |
| ---------- | ---- |
| 全テスト   | PASS |
| 型チェック | PASS |
| Lint       | PASS |
| カバレッジ | 維持 |

---

## 関連ドキュメント

- [04-electron-security.md](/.claude/rules/04-electron-security.md) - IPC セキュリティ原則
- [security-electron-ipc.md](/.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md) - Electron IPC セキュリティ詳細
- [packages/shared/src/ipc/channels.ts](/packages/shared/src/ipc/channels.ts) - チャンネル定数定義
