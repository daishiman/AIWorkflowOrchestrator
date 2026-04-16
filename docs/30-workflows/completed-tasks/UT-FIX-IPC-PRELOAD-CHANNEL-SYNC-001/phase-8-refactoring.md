# Phase 8: リファクタリング — コメント整理・セクション構成確認

## メタ情報

| 項目       | 値                                  |
| ---------- | ----------------------------------- |
| Phase      | 8                                   |
| タスクID   | UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001 |
| 前提Phase  | Phase 7（カバレッジ確認完了）       |
| 後続Phase  | Phase 9（品質確認）                 |
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

## 1. 方針

本タスクは1ファイルへのエントリ追加のみであり、大規模なリファクタリングは行わない。以下の最小限の整理のみ実施する。

---

## 2. 確認項目

### 2.1 import ブロックのアルファベット順整合

追加した `CHAT_EXPORT_CHANNELS` と `FILE_SYSTEM_CHANNELS` が import ブロック内でアルファベット順になっているか確認する。

期待する順序（抜粋）:

```typescript
import {
  APPROVAL_CHANNELS,
  CHAT_EXPORT_CHANNELS,      // C
  EXECUTION_CHANNELS,        // E
  FILE_SYSTEM_CHANNELS,      // F
  SKILL_CREATOR_EXTERNAL_API_CHANNELS,
  ...
} from "@repo/shared/src/ipc/channels";
```

### 2.2 IPC_CHANNELS 内のコメント統一

追加したスプレッド展開箇所のコメントが既存のスタイルと統一されているか確認する。

既存スタイル例:

```typescript
// Chat Edit operations
CHAT_EDIT_READ_FILE: "chat-edit:read-file",
```

追加箇所のコメントスタイル:

```typescript
// Chat Export operations (UT-FIX-IPC-PRELOAD-CHANNEL-SYNC-001)
...CHAT_EXPORT_CHANNELS,
```

タスクIDをコメントに含めることで変更履歴を追跡可能にする。

### 2.3 ALLOWED_INVOKE_CHANNELS 内のセクション区切り確認

追加エントリが適切なセクション（`// Chat Export channels`・`// File System channels`・`// Skill Creator Session invoke channels`）で区切られているか確認する。

### 2.4 ALLOWED_ON_CHANNELS 内のセクション区切り確認

追加エントリが適切なセクション（`// Skill Creator Session on-channels`・`// Skill Creator External API on-channels`）で区切られているか確認する。

---

## 3. 変更禁止事項

以下はリファクタリング対象外とする。

- 既存エントリの順序変更
- 既存コメントの書き換え
- チャネル文字列の修正
- `IPC_CHANNELS` オブジェクトの構造変更
