# Phase 4: テスト作成 — Rule-1 PASS確認コマンド一覧

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 4                                   |
| タスクID   | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001 |
| 前提Phase  | なし（Phase 5実装前に方針確認）     |
| 後続Phase  | Phase 5（実装）                     |
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

## 1. テスト方針

本タスクの修正は `apps/desktop/src/preload/channels.ts` への文字列追加のみであるため、自動テストは **既存の検証スクリプトの実行結果** で確認する。

新規テストコードは追加しない（`verify-ipc-4layer.cjs` 自体がテストの役割を担う）。

---

## 2. 確認コマンド一覧

### 2.1 メイン検証コマンド（最重要）

```bash
# プロジェクトルートで実行
node scripts/verify-ipc-4layer.cjs
```

### 2.2 Rule-1のみ絞り込み確認

```bash
node scripts/verify-ipc-4layer.cjs 2>&1 | grep -E "Rule-1|PASS|FAIL"
```

### 2.3 対象12チャネルが出力に含まれないことを確認

```bash
node scripts/verify-ipc-4layer.cjs 2>&1 | grep -E \
  "chat:exportSession|chat:previewExport|fs:writeFile|fs:readFile|\
skill-creator:start-session|skill-creator:answer|\
skill-creator:question-received|skill-creator:session-complete|\
skill-creator:session-error|skill-creator:external-api-config-required|\
skill-creator:api-configured|skill-creator:api-test-result"
```

期待値: **何も出力されない**（違反チャネルが残っていないこと）

---

## 3. 期待される出力

### 修正前（現在の失敗状態）

```
[Rule-1] shared で定義されたチャネルが preload ホワイトリストに未登録: FAIL
  - chat:exportSession
  - chat:previewExport
  - fs:writeFile
  - fs:readFile
  - skill-creator:start-session
  - skill-creator:answer
  - skill-creator:question-received
  - skill-creator:session-complete
  - skill-creator:session-error
  - skill-creator:external-api-config-required
  - skill-creator:api-configured
  - skill-creator:api-test-result
```

### 修正後（目標状態）

```
[Rule-1] shared で定義されたチャネルが preload ホワイトリストに未登録: PASS
```

---

## 4. 事前確認コマンド（実装前に実行）

```bash
# CHAT_EXPORT_CHANNELS が preload に import されているか確認
grep -n "CHAT_EXPORT_CHANNELS" apps/desktop/src/preload/channels.ts

# FILE_SYSTEM_CHANNELS が preload に import されているか確認
grep -n "FILE_SYSTEM_CHANNELS" apps/desktop/src/preload/channels.ts

# IPC_CHANNELS に EXPORT_SESSION キーが存在するか確認
grep -n "EXPORT_SESSION\|PREVIEW_EXPORT\|WRITE_FILE\|READ_FILE" \
  apps/desktop/src/preload/channels.ts

# SKILL_CREATOR_SESSION_CHANNELS のスプレッド展開確認
grep -n "SKILL_CREATOR_SESSION_CHANNELS" apps/desktop/src/preload/channels.ts
```

**重要**: `CHAT_EXPORT_CHANNELS` と `FILE_SYSTEM_CHANNELS` が `IPC_CHANNELS` にスプレッド展開されていない場合は、Phase 5 でimport追加も必要となる。
