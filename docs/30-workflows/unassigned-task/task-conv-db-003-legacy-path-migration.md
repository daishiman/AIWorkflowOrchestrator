# UT-CONV-DB-003: 旧DBパスマイグレーション - タスク指示書

## メタ情報

```yaml
issue_number: 1342
```

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-CONV-DB-003                                               |
| タスク名     | 旧DBパス（~/.claude/conversations.db）からのマイグレーション |
| 分類         | 改善（データ移行）                                           |
| 対象機能     | Conversation DB                                              |
| 優先度       | MEDIUM                                                       |
| 見積もり規模 | Small (Phase 1-6簡易版)                                      |
| ステータス   | unassigned                                                   |
| 発見元       | Phase 12（TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001）          |
| 発見日       | 2026-03-19                                                   |
| 親タスク     | TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001                      |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 で DB パスを `~/.claude/conversations.db`（旧）から `app.getPath('userData')/conversations.db`（新）に変更した。しかし、既存ユーザーの旧パスにある会話データを新パスに移行する処理が未実装。

### 1.2 問題点・課題

- 旧パスにDBファイルが存在する既存ユーザーは、アプリ更新後に会話履歴が消失したように見える
- 旧DBと新DBが別々に存在し、データが分散する
- 旧パスのDBファイルが放置されストレージを消費

### 1.3 放置した場合の影響

- 既存ユーザーの会話履歴が見えなくなる（実際にはデータは旧パスに残存）
- ユーザーからの問い合わせ・不満が発生

### 苦戦箇所の教訓（TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 より）

- DB パスの解決メカニズムが `process.env.HOME || process.env.USERPROFILE || ""` というフォールバックチェーンで、環境変数の不在時にパスが空文字になるリスクがあった。`app.getPath('userData')` は Electron が保証するため安全
- P42準拠の3段バリデーション（typeof → === "" → .trim() === ""）をDBパスにも適用する必要がある
- ファイルコピー時の WAL ファイル（`-wal`, `-shm`）の取り扱いに注意。WAL チェックポイント後にコピーしないとデータ不整合が発生する
- `will-quit` でのクローズ処理がマイグレーション処理と競合する可能性。マイグレーションは `app.whenReady()` 直後の `initializeConversationDatabase()` 前に実行すべき

## 2. 何を達成するか（What）

### 2.1 目的

旧パス `~/.claude/conversations.db` にDBファイルが存在する場合、新パス `app.getPath('userData')/conversations.db` に自動移行する。

### 2.2 最終ゴール

- 旧パスのDBファイルを新パスにコピー（移動ではなくコピー、安全のため）
- コピー成功後、旧パスファイルをリネーム（`.bak` サフィックス）
- 新パスのDBで正常に Workspace Chat が動作

### 2.3 スコープ

含むもの:

- 旧パスの検出ロジック
- DB ファイル + WAL/SHM ファイルのコピー
- コピー成功後の旧ファイルリネーム
- エラー時のフォールバック（旧パスのまま使用）

含まないもの:

- 旧パスの完全削除（ユーザーに委任）
- スキーマバージョニング（UT-CONV-DB-002）

### 2.4 成果物

- マイグレーションロジックの実装
- マイグレーションテスト
- ユーザー向けログ出力

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 完了

### 3.2 依存タスク

- TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001（完了済み）
- UT-CONV-DB-002（スキーマバージョニング）は非依存（独立実行可能）

### 3.3 必要な知識・スキル

- Node.js fs API（copyFileSync, existsSync, renameSync）
- Electron app.getPath() API
- SQLite WAL モードのファイル構成（-wal, -shm）
- P42 3段バリデーション、P55 正規表現メタ文字エスケープ

### 3.4 推奨アプローチ

```typescript
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { app } from "electron";

/**
 * 旧パス ~/.claude/conversations.db から新パスへマイグレーション。
 * initializeConversationDatabase() の前に実行する。
 */
export function migrateFromLegacyPath(): void {
  const legacyPath = path.join(os.homedir(), ".claude", "conversations.db");
  const newPath = path.join(app.getPath("userData"), "conversations.db");

  // 新パスに既にDBがある場合はスキップ
  if (fs.existsSync(newPath)) return;

  // 旧パスにDBがない場合はスキップ
  if (!fs.existsSync(legacyPath)) return;

  try {
    // ディレクトリ事前作成
    fs.mkdirSync(path.dirname(newPath), { recursive: true });

    // WAL/SHMファイルも含めてコピー
    fs.copyFileSync(legacyPath, newPath);
    for (const ext of ["-wal", "-shm"]) {
      const src = legacyPath + ext;
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, newPath + ext);
      }
    }

    // 旧ファイルをリネーム（削除ではなくバックアップ）
    fs.renameSync(legacyPath, legacyPath + ".bak");
    console.log("[DB] Migrated legacy conversation DB to new path");
  } catch (error) {
    console.error("[DB] Failed to migrate legacy DB, using new path:", error);
    // フォールバック: 旧パスは残し、新パスで新規DB作成
  }
}
```

## 4. 実行手順

簡易版 Phase 1-6 で実行。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 旧パスにDBがある場合、新パスに自動コピーされる
- [ ] WAL/SHM ファイルも正しくコピーされる
- [ ] コピー成功後、旧ファイルが `.bak` にリネームされる
- [ ] 新パスに既にDBがある場合はスキップされる
- [ ] コピー失敗時のエラーハンドリングが実装されている

### 品質要件

- [ ] 既存85件テストに影響がない
- [ ] マイグレーションテストが追加されている

### ドキュメント要件

- [ ] Phase 12 で仕様書が更新されている

## 6. 検証方法

| テストケース    | 手順                   | 期待結果                     |
| --------------- | ---------------------- | ---------------------------- |
| 旧パスのみにDB  | 旧パスにDB作成→起動    | 新パスにコピー成功           |
| 新旧両方にDB    | 両パスにDB→起動        | スキップ（新パス優先）       |
| 旧パスにDBなし  | 起動                   | 何もしない                   |
| コピー中エラー  | 権限なしの新パス→起動  | フォールバック（新規DB作成） |
| WALファイルあり | 旧パスに-wal/-shm→起動 | 全ファイルコピー             |

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                                 |
| ---------------------------- | ------ | -------- | ------------------------------------ |
| コピー中にデータ破損         | 高     | 低       | コピー失敗時は旧パスを残し新規DB作成 |
| ディスク容量不足でコピー失敗 | 中     | 低       | フォールバックで新規DB作成           |
| P55: パスに正規表現メタ文字  | 低     | 低       | escapeRegExp() でマスク処理          |
| WALファイルの不整合          | 中     | 低       | -wal/-shm もセットでコピー           |

## 8. 参照情報

| 資料                           | パス                                                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| DB 実装パターン                | `.claude/skills/aiworkflow-requirements/references/database-implementation-core.md`                                           |
| Conversation DB Factory        | `apps/desktop/src/main/database/conversationDatabase.ts`                                                                      |
| IPC システムコア（旧パス記載） | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`                                                    |
| S32 DB Factory パターン        | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-fallback-validation.md` |
| 教訓（P42/P55/will-quit）      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-conversation-db-robustness.md`                             |
| P42 3段バリデーション          | `.claude/rules/06-known-pitfalls.md#P42`                                                                                      |
| P55 正規表現メタ文字           | `.claude/rules/06-known-pitfalls.md#P55`                                                                                      |

## 9. 備考

- 本タスクは TASK-FIX-CONVERSATION-DB-ROBUSTNESS-001 のスコープ外として Phase 12 で検出
- macOS: 旧 `~/.claude/conversations.db` → 新 `~/Library/Application Support/<app>/conversations.db`
- Windows: 旧 `%USERPROFILE%/.claude/conversations.db` → 新 `%APPDATA%/<app>/conversations.db`
- マイグレーション実行タイミングは `initializeConversationDatabase()` の前（main/index.ts の app.whenReady() 内）
- コピーではなく移動（rename）を使うと、クロスデバイスの場合に失敗する可能性があるためコピー+リネームを推奨
