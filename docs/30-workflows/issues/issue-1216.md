# [#1216] "[UT-IMP-CHAT-EDIT-LEGACY-STUB-CLEANUP-001] handlers/chatEditHandlers.ts レガシースタブの削除"

## メタ情報

```yaml
task_id: UT-IMP-CHAT-EDIT-LEGACY-STUB-CLEANUP-001
task_name: handlers/chatEditHandlers.ts レガシースタブの削除
category: リファクタリング（ref）
target_feature: -
priority: 低
scale: 小規模
status: 未着手
source_phase: TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 実装wave（2026-03-14）
created_date: 2026-03-14
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-chat-edit-legacy-stub-cleanup-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未着手 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 の実装中に、`chatEditHandlers.ts` が2箇所に存在することが判明した:

1. `apps/desktop/src/main/handlers/chatEditHandlers.ts` — **未使用のレガシースタブ**（`ipc/index.ts` からインポートされていない）
2. `apps/desktop/src/main/ipc/chatEditHandlers.ts` — **実際に使用されるファイル**（`ipc/index.ts` から直接インポート）

間違ったファイル（handlers/）を編集してしまい、TypeScript エラー `TS2554: Expected 3 arguments, but got 4` で初めて気付いた。これは lessons-learned-current.md v1.29.89 の苦戦箇所1（P57相当）として記録済み。

### 1.2 問題点・課題

- 同名ファイルが2箇所に存在し、どちらが正本か一見して分からない
- 開発者が誤ったファイルを編集するリスクがある
- handlers/ 内のファイルは dead code として残存しており、メンテナンスコストを増やす

### 1.3 放置した場合の影響

- 今後も開発者が誤ったファイルを編集し、TypeScript エラーやランタイムバグの原因となる
- dead code がコードベースに残り続け、可読性・保守性が低下する
- コードレビュー時に「どちらが正しいファイルか」の確認コストが継続的に発生する

## 2. 何を達成するか（What）

### 2.1 目的

レガシースタブ `apps/desktop/src/main/handlers/chatEditHandlers.ts` を安全に削除し、同名ファイル問題を解消する。

### 2.2 最終ゴール

- `chatEditHandlers.ts` が `apps/desktop/src/main/ipc/` 配下の1箇所のみに存在する状態
- 既存機能に回帰がないことが確認された状態

### 2.3 スコープ

**含むもの:**

- `apps/desktop/src/main/handlers/chatEditHandlers.ts` の削除
- handlers/ ディレクトリ内の他のファイルが本当に使用されているか確認
- 関連するインポート文やテストの確認

**含まないもの:**

- `ipc/chatEditHandlers.ts` の変更
- 新機能の追加
- handlers/ ディレクトリ全体の棚卸し（chatEditHandlers.ts 以外は本タスクのスコープ外）

### 2.4 成果物

| 成果物             | パス                                                         |
| ------------------ | ------------------------------------------------------------ |
| 削除対象ファイル   | `apps/desktop/src/main/handlers/chatEditHandlers.ts`（削除） |
| task-workflow 更新 | 完了記録追加                                                 |

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 が完了していること（正本ファイルが安定していること）
- `pnpm typecheck` と `pnpm test` が現時点で PASS していること

### 3.2 依存タスク

| タスクID                                    | 状態   | 依存関係                   |
| ------------------------------------------- | ------ | -------------------------- |
| TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 | 実装中 | 正本ファイルの安定化が前提 |

### 3.3 必要な知識

- Electron Main Process の IPC ハンドラ登録構造
- モノレポ内のファイル参照関係の調査方法（grep）

### 3.4 推奨アプローチ

1. 削除前に `grep` で全参照を洗い出し、handlers/ からのインポートが存在しないことを確認
2. ファイル削除後に `pnpm typecheck` と `pnpm test` で回帰がないことを検証
3. handlers/ ディレクトリ内の他ファイルの使用状況も確認し、追加の dead code があれば備考に記録

## 4. 実行手順

### Phase A: 影響調査

1. `grep -rn "handlers/chatEditHandlers" apps/desktop/src/` で handlers/ からのインポートが存在しないことを確認
2. `handlers/` ディレクトリ内の他のファイルの使用状況を確認
3. テストファイル内で handlers/ のファイルを直接参照していないか確認

### Phase B: 削除実行

1. `apps/desktop/src/main/handlers/chatEditHandlers.ts` を削除
2. `pnpm typecheck` で型チェック通過を確認
3. `pnpm test` で関連テスト PASS を確認

### Phase C: ドキュメント同期

1. task-workflow に完了記録を追加
2. lessons-learned に参照を追加

## 5. 完了条件チェックリスト

### 機能要件

- [ ] レガシースタブファイル `apps/desktop/src/main/handlers/chatEditHandlers.ts` が削除されている
- [ ] 同名ファイルが `apps/desktop/src/main/ipc/chatEditHandlers.ts` の1箇所のみ存在する

### 品質要件

- [ ] `pnpm typecheck` PASS
- [ ] 既存テスト全 PASS
- [ ] 既存機能回帰なし

### ドキュメント要件

- [ ] task-workflow に完了記録追加
- [ ] system spec 同期

## 6. 検証方法

```bash
# chatEditHandlers.ts が1ファイルのみ存在することを確認
find . -name "chatEditHandlers.ts" -not -path "*/node_modules/*"

# 回帰なしを確認
pnpm typecheck && pnpm test
```

## 7. リスクと対策

| リスク                                          | 影響度 | 発生確率 | 対策                             |
| ----------------------------------------------- | ------ | -------- | -------------------------------- |
| handlers/ の他ファイルが間接的に使用されている  | 中     | 低       | grep で全参照を事前確認          |
| テストが handlers/ のファイルを直接参照している | 中     | 低       | テストファイル内の import も確認 |

## 8. 参照情報

| 種別                       | パス・URL                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| 苦戦箇所記録               | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` v1.29.89 苦戦箇所1 |
| 正しいインポート元         | `apps/desktop/src/main/ipc/index.ts`                                                              |
| 正本ファイル               | `apps/desktop/src/main/ipc/chatEditHandlers.ts`                                                   |
| 削除対象（レガシースタブ） | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                                              |

## 9. 備考

- 本タスクは P57（同名ファイル二重存在による誤編集）の根本対策である
- `handlers/` ディレクトリ全体の棚卸しも検討すべきだが、本タスクのスコープは chatEditHandlers.ts に限定する
- handlers/ ディレクトリ内に他の dead code が発見された場合は、別途未タスクとして起票することを推奨する
