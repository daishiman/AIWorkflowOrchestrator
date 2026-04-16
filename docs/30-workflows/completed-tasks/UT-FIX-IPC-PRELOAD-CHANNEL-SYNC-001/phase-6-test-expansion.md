# Phase 6: 拡張テスト — 型チェック確認

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 6                                   |
| タスクID   | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001 |
| 前提Phase  | Phase 5（実装完了）                 |
| 後続Phase  | Phase 7（カバレッジ確認）           |
| ステータス | completed                           |

---

## 目的

本Phaseの目的は、既存本文に記載された要件を満たすこと。

## 実行タスク

- 既存本文の手順を実行する。

## 参照資料

- 本ファイル上部のメタ情報
- `index.md`
- `phase-1-requirements.md`
- `phase-2-design.md`
- `phase-3-design-review.md`
- `phase-4-test-creation.md`
- `phase-5-implementation.md`
- `phase-6-test-expansion.md`
- `phase-7-coverage-check.md`
- `phase-8-refactoring.md`
- `phase-9-quality-assurance.md`
- `phase-10-final-review.md`
- `phase-11-manual-test.md`
- `phase-12-documentation.md`
- `phase-13-pr-creation.md`

## 成果物

- 本Phaseで定義された成果物

## 完了条件

- [x] 既存本文の完了条件をすべて満たす。

## 1. 目的

Phase 5 の実装（import追加・スプレッド展開・ホワイトリスト追加）が TypeScript の型システムと整合していることを確認する。

---

## 2. 型チェック実行手順

### Step 1: desktopパッケージの型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

期待値: **エラーなし（0 errors）**

### Step 2: sharedパッケージの型チェック（念のため）

```bash
pnpm --filter @repo/shared typecheck
```

期待値: **エラーなし（0 errors）**

### Step 3: 全パッケージ一括型チェック

```bash
pnpm typecheck
```

期待値: **エラーなし**

---

## 3. よくある型エラーと対処

### エラー例1: `Property 'EXPORT_SESSION' does not exist on type`

**原因**: `CHAT_EXPORT_CHANNELS` が `IPC_CHANNELS` にスプレッド展開されていない、またはimport漏れ。

**対処**: Phase 5 Step 1・Step 2 の内容を再確認する。

### エラー例2: `Module '"@repo/shared/src/ipc/channels"' has no exported member 'CHAT_EXPORT_CHANNELS'`

**原因**: `packages/shared/src/ipc/channels.ts` から `CHAT_EXPORT_CHANNELS` がexportされていない。

**確認コマンド**:

```bash
grep -n "export.*CHAT_EXPORT_CHANNELS\|export.*FILE_SYSTEM_CHANNELS" \
  packages/shared/src/ipc/channels.ts
```

期待値: export文が存在すること。

### エラー例3: `readonly string[]` への重複キー

**原因**: `IPC_CHANNELS` オブジェクトに同名キーが複数存在する（スプレッド展開と個別定義の重複）。

**確認コマンド**:

```bash
grep -n "WRITE_FILE\|READ_FILE" apps/desktop/src/preload/channels.ts
```

`FILE_WRITE`（`file:write`）と `WRITE_FILE`（`fs:writeFile`）は **別のキー**・別のチャネルであることに注意する。

---

## 4. ESLintチェック

```bash
pnpm --filter @repo/desktop lint
```

期待値: **エラーなし・警告なし**
