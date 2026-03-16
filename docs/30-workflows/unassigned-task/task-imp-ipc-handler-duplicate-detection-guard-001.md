# IPC handler 同名ファイル重複の自動検出ガード

## メタ情報

```yaml
issue_number: 1269
```

## メタ情報

| 項目         | 内容                                                                             |
| ------------ | -------------------------------------------------------------------------------- |
| タスクID     | task-imp-ipc-handler-duplicate-detection-guard-001                               |
| タスク名     | IPC handler 同名ファイル重複の自動検出ガード                                     |
| 分類         | 改善                                                                             |
| 対象機能     | IPC handler（Main Process ファイル構成）                                         |
| 優先度       | 低                                                                               |
| 見積もり規模 | 小規模                                                                           |
| ステータス   | 未実施                                                                           |
| 発見元       | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 Phase 2（P58 - 同名ファイル二重存在） |
| 発見日       | 2026-03-15                                                                       |

## 1. なぜこのタスクが必要か（Why）

### 背景

UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 の設計フェーズ（Phase 2）で、`chatEditHandlers.ts` が `ipc/` ディレクトリと `handlers/` ディレクトリの2箇所に存在することが判明した（P58）。テスト対象の正本判定に `grep -rn "registerChatEditHandlers"` を手動実行して IPC 版を正本と判定したが、この判定プロセスは手動であり、将来的に同様の混乱が再発するリスクがある。

### 問題点・課題

- `apps/desktop/src/main/ipc/` と `apps/desktop/src/main/handlers/` に同名の TypeScript ファイルが存在する
- 開発者（人間・AI エージェント含む）が誤ったファイルを編集・テスト対象にする可能性
- `ipc/` と `handlers/` の責務境界が暗黙的で、ドキュメント化されていない

### 放置した場合の影響

| 影響領域        | 影響                                                     |
| --------------- | -------------------------------------------------------- |
| 開発効率        | 同名ファイルの正本判定に毎回 grep が必要                 |
| コード品質      | 誤ったファイルへのテスト追加・機能変更が発生するリスク   |
| AI エージェント | Claude Code 等のエージェントが誤ファイルを読み込む可能性 |

## 2. 何を達成するか（What）

### 目的

`ipc/` と `handlers/` ディレクトリ間の同名ファイル重複を CI で自動検出し、責務境界を明文化する。

### 最終ゴール

- 同名ファイル検出スクリプトが CI で実行される
- 新規の同名ファイル追加時に CI が警告を出す
- `ipc/` と `handlers/` の責務境界がドキュメント化される

### スコープ

**含むもの**:

- `ipc/` と `handlers/` の同名ファイル検出スクリプト
- CI 統合（既存 lint ジョブへの追加）
- 責務境界ドキュメント（`ipc/` = IPC channel handler、`handlers/` = service-level handler）

**含まないもの**:

- ファイルのリネーム・統合（別タスクで検討）
- `ipc/` `handlers/` 以外のディレクトリの重複検出

### 成果物

| 種別 | 成果物                               | 配置先                                                    |
| ---- | ------------------------------------ | --------------------------------------------------------- |
| 実装 | 同名ファイル検出スクリプト           | `scripts/` 配下                                           |
| 設定 | npm script / CI 連携                 | `package.json`, `.github/workflows/`                      |
| 文書 | `ipc/` vs `handlers/` 責務境界ガイド | `.claude/skills/aiworkflow-requirements/references/` 配下 |

## 3. どのように実行するか（How）

### 前提条件

なし（独立して実行可能）

### 推奨アプローチ

1. `apps/desktop/src/main/ipc/` と `apps/desktop/src/main/handlers/` のファイル名一覧を取得
2. basename ベースで重複を検出するスクリプトを作成
3. 重複が見つかった場合、各ファイルの export パターンと責務を報告
4. npm script として `check:ipc-handler-duplicates` を追加
5. 既存 lint ジョブに統合

### 実装課題と解決策（親タスクからの教訓）

| 課題                       | 発見経緯                                                    | 解決策                                                                         | 教訓                                           |
| -------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------- |
| P58 同名ファイルの正本判定 | chatEditHandlers.ts が2箇所に存在し、テスト対象の特定に混乱 | basename 一致の自動検出 + export パターン（`register*Handlers`）による正本識別 | 手動 grep 判定を CI 自動化すべき               |
| 責務境界の暗黙性           | `ipc/` と `handlers/` の違いが明文化されていない            | 責務境界ガイドを仕様書に追加し、新規ファイル追加時のルールを定義               | ディレクトリの責務はドキュメント化して共有する |

## 4. 実行手順

### 概要ステップ

1. `apps/desktop/src/main/ipc/` と `apps/desktop/src/main/handlers/` のファイル名一覧を取得
2. basename ベースで重複を検出するスクリプトを作成
3. 重複が見つかった場合、各ファイルの export パターンと責務を報告
4. npm script として `check:ipc-handler-duplicates` を追加
5. 既存 lint ジョブに統合

### Phase 構成

| Phase | 名称                           | 内容                                           |
| ----- | ------------------------------ | ---------------------------------------------- |
| 1-3   | 要件定義・設計・レビュー       | 検出ロジック設計、CI 統合方式の決定            |
| 4     | テスト作成                     | 重複検出・非検出のテストケース                 |
| 5     | 実装                           | 検出スクリプト + npm script + CI 統合          |
| 6-7   | テスト拡充・カバレッジ         | エッジケース（空ディレクトリ、`.d.ts` 除外等） |
| 8-10  | リファクタリング〜最終レビュー | 品質検証                                       |
| 11-13 | 手動テスト〜完了               | 文書更新・PR                                   |

## 5. 完了条件チェックリスト

- [ ] 同名ファイル検出スクリプトがローカルで実行できる
- [ ] 重複がある場合に警告を出力する
- [ ] CI で自動実行される
- [ ] `ipc/` vs `handlers/` の責務境界が仕様書に反映される

## 6. 検証方法

### 実行コマンド

```bash
pnpm run check:ipc-handler-duplicates
```

### テストケース

| #   | テストケース               | 入力条件                                                           | 期待結果                                   |
| --- | -------------------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| 1   | 既存の重複を検出できること | 現在の `ipc/chatEditHandlers.ts` と `handlers/chatEditHandlers.ts` | 重複として報告（既知の許容重複として注釈） |
| 2   | 新規重複を検出できること   | `ipc/` に `testHandler.ts` を作成し、`handlers/` にも同名を作成    | 新規重複として警告                         |
| 3   | 重複なしで正常終了すること | 全ファイル名がユニーク                                             | exit code 0                                |

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                         |
| ------------------------ | ------ | -------- | ---------------------------- |
| 既存の意図的重複の誤検出 | 中     | 高       | 許容リストで既知の重複を除外 |
| CI 実行時間増加          | 低     | 低       | ファイル名比較のみで軽量     |

## 8. 参照情報

### ソースコード

- `apps/desktop/src/main/ipc/` — IPC channel handler ディレクトリ
- `apps/desktop/src/main/handlers/` — service-level handler ディレクトリ
- `apps/desktop/src/main/ipc/chatEditHandlers.ts` — P58 で検出された重複ファイル（正本）
- `apps/desktop/src/main/handlers/chatEditHandlers.ts` — P58 で検出された重複ファイル（別責務）

### 仕様書・ルール

- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` — P58 教訓
- `.claude/rules/06-known-pitfalls.md` — P58（同名ファイル二重存在）
- `.claude/skills/skill-creator/references/patterns.md` — IPC Handler テストパターン（P58/P61派生）
- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md` — 未タスク仕様書ガイドライン

## 9. 備考

### 補足事項

- 本タスクは P58 の「手動 grep 判定」を CI 自動化する改善タスク。
- 優先度は「低」だが、AI エージェントが誤ファイルを読み込むリスクを低減する意義がある。
- 既存の同名ファイルは「意図的な責務分離」であることを許容リストで明示する。
