# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase      | 5                                  |
| Phase名    | 実装                               |
| 前提Phase  | Phase 4 (テスト作成)               |
| 後続Phase  | Phase 6 (テスト拡充)               |
| ステータス | 未実施                             |
| 作成日     | 2026-02-08                         |
| タスクID   | TASK-FIX-12-1-IPC-HARDCODE-FIX     |
| タスク名   | SkillExecutorのIPCチャネル名定数化 |
| 分類       | リファクタリング（小規模）         |

---

## 目的

TDD Green フェーズ: ハードコードされた `"skill:stream"` を `SKILL_CHANNELS.SKILL_STREAM` 定数に置き換える。

## 背景

IPC セキュリティルール（04-electron-security.md）に準拠し、チャネル名を定数参照に統一する。既に `SKILL_CHANNELS` はインポートされているため、修正は2行のみ。

---

## 修正対象

| ファイル                                                | 行番号 | 修正内容                                         |
| ------------------------------------------------------- | ------ | ------------------------------------------------ |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | L918   | `"skill:stream"` → `SKILL_CHANNELS.SKILL_STREAM` |
| `apps/desktop/src/main/services/skill/SkillExecutor.ts` | L1214  | `"skill:stream"` → `SKILL_CHANNELS.SKILL_STREAM` |

---

## 参照資料

| 参照資料   | パス                                                    | 内容               |
| ---------- | ------------------------------------------------------- | ------------------ |
| 対象コード | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 修正対象           |
| 定数定義   | `packages/shared/src/ipc/channels.ts`                   | SKILL_CHANNELS定義 |
| IPCルール  | `.claude/rules/04-electron-security.md`                 | セキュリティルール |

---

## 成果物

| 成果物         | パス                                                    | 内容           |
| -------------- | ------------------------------------------------------- | -------------- |
| 修正済みコード | `apps/desktop/src/main/services/skill/SkillExecutor.ts` | 定数参照に変更 |

---

## 実装手順

### Step 1: 現状確認

**L918 (sendStream メソッド内)**:

```typescript
// 修正前
this.mainWindow.webContents.send("skill:stream", message);
```

**L1214 (sendHooksStream メソッド内)**:

```typescript
// 修正前
this.mainWindow.webContents.send("skill:stream", message);
```

### Step 2: import文の確認

**L22 で既にインポート済み**:

```typescript
import { SKILL_CHANNELS } from "@repo/shared/src/ipc/channels";
```

追加のインポートは不要。

### Step 3: コード修正

**L918 (sendStream メソッド内)**:

```typescript
// 修正後
this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message);
```

**L1214 (sendHooksStream メソッド内)**:

```typescript
// 修正後
this.mainWindow.webContents.send(SKILL_CHANNELS.SKILL_STREAM, message);
```

### Step 4: 型安全性確認

`SKILL_CHANNELS.SKILL_STREAM` は `"skill:stream"` と同じ値を返す定数であり、型安全性が保証される:

```typescript
// packages/shared/src/ipc/channels.ts より
export const SKILL_CHANNELS = {
  SKILL_STREAM: "skill:stream",
  // ...
} as const;
```

---

## 品質チェック

### TypeScript コンパイル確認

```bash
pnpm --filter @repo/desktop typecheck
```

### ESLint 確認

```bash
pnpm --filter @repo/desktop lint
```

---

## 統合テスト連携

**該当なし**: 本タスクは動作変更を伴わないリファクタリング（IPCチャネル名の定数化）のため、統合テストへの影響はありません。既存のテストスイートがPASSすることで動作互換性を確認します。

---

## 完了条件

- [ ] L918 が `SKILL_CHANNELS.SKILL_STREAM` に変更されている
- [ ] L1214 が `SKILL_CHANNELS.SKILL_STREAM` に変更されている
- [ ] TypeScriptコンパイルエラーがない
- [ ] ESLint警告がない

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-fix-12-1-ipc-hardcode-fix/phase-6-test-expansion.md`
