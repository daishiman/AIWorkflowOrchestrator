# Phase 1: 要件定義 - SkillExecutorのIPCチャネル名定数化

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 1                                  |
| Phase名    | 要件定義                           |
| 前提Phase  | -                                  |
| 後続Phase  | Phase 2 (設計)                     |
| ステータス | 未実施                             |
| 作成日     | 2026-02-08                         |
| タスクID   | TASK-FIX-12-1-IPC-HARDCODE-FIX     |
| タスク名   | SkillExecutorのIPCチャネル名定数化 |
| 分類       | リファクタリング（小規模）         |

---

## 目的

`SkillExecutor.ts` 内でハードコードされている IPC チャネル名 `"skill:stream"` を定数参照に置き換え、IPC セキュリティルール（04-electron-security.md）に準拠させる。

---

## 背景

### 現状の問題

`SkillExecutor.ts` の2箇所で IPC チャネル名がハードコード文字列として使用されている。

```typescript
// L918: sendStream() メソッド内
this.mainWindow.webContents.send("skill:stream", message);

// L1214: sendHooksStream() メソッド内
this.mainWindow.webContents.send("skill:stream", message);
```

### セキュリティルール違反

`.claude/rules/04-electron-security.md` の IPC セキュリティ原則:

> - DO: チャンネル名はホワイトリストで管理し、定数で参照
> - DON'T: ハードコード文字列でチャンネル名を指定しない

### 利用可能な定数

既に `@repo/shared/src/ipc/channels.ts` に定数が定義されており、SkillExecutor.ts でインポート済み:

```typescript
// packages/shared/src/ipc/channels.ts L77-79
export const SKILL_CHANNELS = {
  // ...
  SKILL_STREAM: "skill:stream",
  // ...
} as const;

// SkillExecutor.ts L22（既存インポート）
import { SKILL_CHANNELS } from "@repo/shared/src/ipc/channels";
```

---

## 機能要件

### FR-1: ハードコード文字列の定数化

| 要件ID | 内容                                                                  |
| ------ | --------------------------------------------------------------------- |
| FR-1-1 | L918 の `"skill:stream"` を `SKILL_CHANNELS.SKILL_STREAM` に置き換え  |
| FR-1-2 | L1214 の `"skill:stream"` を `SKILL_CHANNELS.SKILL_STREAM` に置き換え |

### FR-2: 既存機能の維持

| 要件ID | 内容                                         |
| ------ | -------------------------------------------- |
| FR-2-1 | `sendStream()` メソッドの動作に変更なし      |
| FR-2-2 | `sendHooksStream()` メソッドの動作に変更なし |
| FR-2-3 | 既存テストがすべてパスすること               |

---

## 非機能要件

### NFR-1: セキュリティ

| 要件ID  | 内容                                                |
| ------- | --------------------------------------------------- |
| NFR-1-1 | IPC チャネル名は定数参照のみ許可                    |
| NFR-1-2 | 04-electron-security.md の IPC セキュリティ原則準拠 |

### NFR-2: 保守性

| 要件ID  | 内容                                        |
| ------- | ------------------------------------------- |
| NFR-2-1 | チャネル名の一元管理（shared パッケージ）   |
| NFR-2-2 | Typo によるランタイムエラーの防止（型安全） |

---

## スコープ

### 実装範囲

- `apps/desktop/src/main/services/skill/SkillExecutor.ts` の2箇所の修正
- 既存テストの動作確認

### 除外範囲

- 新規テストの追加（既存テストで十分にカバー）
- 他ファイルの同様の問題（本タスクのスコープ外）
- channels.ts への新規定数追加（既に存在）

---

## 受け入れ基準

### AC-1: 定数化の完了

```gherkin
Given SkillExecutor.ts の sendStream() メソッド
When IPC チャネル名を参照する
Then SKILL_CHANNELS.SKILL_STREAM 定数を使用している

Given SkillExecutor.ts の sendHooksStream() メソッド
When IPC チャネル名を参照する
Then SKILL_CHANNELS.SKILL_STREAM 定数を使用している
```

### AC-2: 動作互換性

```gherkin
Given 修正後の SkillExecutor
When 既存のテストスイートを実行する
Then すべてのテストがパスする
```

### AC-3: セキュリティ準拠

```gherkin
Given SkillExecutor.ts ファイル
When "skill:stream" でハードコード文字列を検索する
Then 該当箇所が0件である（定数参照のみ）
```

---

## 参照資料

| 参照資料           | パス                                                                   | 内容                        |
| ------------------ | ---------------------------------------------------------------------- | --------------------------- |
| セキュリティルール | `.claude/rules/04-electron-security.md`                                | IPC セキュリティ原則        |
| 修正対象ファイル   | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                | L918, L1214                 |
| 定数定義           | `packages/shared/src/ipc/channels.ts`                                  | SKILL_CHANNELS.SKILL_STREAM |
| 既存テスト         | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.test.ts` | 動作確認用                  |

---

## 統合テスト連携

**該当なし**: 本タスクは動作変更を伴わないリファクタリング（IPCチャネル名の定数化）のため、統合テストへの影響はありません。既存のテストスイートがPASSすることで動作互換性を確認します。

---

## 成果物

| 成果物     | パス                                                                                          | 内容            |
| ---------- | --------------------------------------------------------------------------------------------- | --------------- |
| 要件定義書 | `docs/30-workflows/task-fix-12-1-ipc-hardcode-fix/outputs/phase-1/requirements-definition.md` | 機能/非機能要件 |

---

## 完了条件

- [ ] FR-1-1: L918 の定数化要件を文書化
- [ ] FR-1-2: L1214 の定数化要件を文書化
- [ ] FR-2: 既存機能維持の要件を明確化
- [ ] AC: 受け入れ基準が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

完了後、以下のファイルを実行:

`docs/30-workflows/task-fix-12-1-ipc-hardcode-fix/phase-2-design.md`
