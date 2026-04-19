# `references/*.md` ファイル分類インベントリ

対象: `.{claude,agents}/skills/*/references/*.md`
各 glob パターンを「append-only」「構造化」に分類し、判断根拠を記す。

## 1. 分類ルール

| 分類        | 判断基準                                                                    |
| ----------- | --------------------------------------------------------------------------- |
| append-only | 末尾追記が支配的。行順序が意味を持たない。日付・タスクID 単位で追記される。 |
| 構造化      | 見出し階層・表・箇条書きを保持する運用が前提。順序・節構造に意味がある。    |

判断順序: 命名規則 → 実ファイル冒頭の見出し構造 → 既存運用（直近のコミットパターン）

## 2. append-only グループ（`merge=union` 維持対象）

| ファイル名パターン                       | 典型例                                                                                         | 根拠                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `references/LOGS.md`                     | `aiworkflow-requirements/references/LOGS.md`（存在しない場合は skill 直下 LOGS.md を対象）     | 並列追記前提、時系列ログ                                                 |
| `references/SKILL-changelog.md`          | スキル改訂履歴                                                                                 | 時系列変更履歴                                                           |
| `references/task-workflow-completed*.md` | `task-workflow-completed.md`, `task-workflow-completed-*.md`                                   | 完了タスクの末尾追記、50+ 件。並列 PR で追記衝突を避ける必要あり         |
| `references/lessons-learned-*.md`        | `lessons-learned-current.md`, `lessons-learned-archive-*.md`, `lessons-learned-{feature}-*.md` | 日付・トピック単位で新規ファイル化しつつ、各ファイル内は章末への追記中心 |
| `references/interfaces-*-changelog.md`   | `interfaces-agent-sdk-*-changelog.md`                                                          | 変更履歴・追記中心                                                       |

### append-only パターンの補足

- `lessons-learned-*.md` は**時期分割・トピック分割されている**ため、並列ブランチで
  同一ファイルへ同時追記する確率は低い。しかし同一ファイルへ追記が集中するケース
  （例: `lessons-learned-current.md`）では `merge=union` による自動統合が有効。
- `task-workflow-completed*.md` は完了タスクの末尾追加が支配的。見出しレベルで
  タスク単位のブロックが積み上がるため、行レベル union でも大きな破損は起きない。

## 3. 構造化グループ（`merge=union` **除外**対象）

| ファイル名パターン                      | 典型例                                                                                                                                   | 根拠                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `references/task-workflow.md`           | ワークフロー本体                                                                                                                         | Phase 節・表・ルールを保持する運用。行順序が意味を持つ |
| `references/task-workflow-rules.md`     | ルールガイド                                                                                                                             | 条項番号・節構造                                       |
| `references/task-workflow-phases.md`    | Phase 定義                                                                                                                               | Phase 表・依存関係                                     |
| `references/task-workflow-active.md`    | アクティブタスク一覧                                                                                                                     | タスクテーブル（行頭が列）                             |
| `references/task-workflow-backlog*.md`  | バックログ                                                                                                                               | 優先度付きテーブル                                     |
| `references/task-workflow-history.md`   | 履歴サマリー（章立て）                                                                                                                   | 節構造                                                 |
| `references/lessons-learned.md`（root） | 教訓まとめ                                                                                                                               | 章立て、表                                             |
| `references/api-*.md`                   | `api-core.md`, `api-endpoints.md`, `api-ipc-*.md`, `api-chat-history.md`                                                                 | API 契約ドキュメント。型定義・エンドポイント表・署名   |
| `references/arch-*.md`                  | `arch-claude-cli.md`, `arch-electron-services-*.md`, `arch-ipc-persistence.md`, `arch-state-management-*.md`, `arch-feature-addition.md` | アーキテクチャ図・表・節構造                           |
| `references/quick-reference*.md`        | quick-reference                                                                                                                          | 索引・表                                               |
| `references/resource-map*.md`           | resource-map                                                                                                                             | リソース対応表                                         |
| `references/topic-map*.md`              | topic-map                                                                                                                                | same-wave テーブル、構造化                             |
| `references/phase-template-*.md`        | Phase テンプレート                                                                                                                       | 節構造・ひな形                                         |
| `references/unassigned-task-*.md`       | 未タスク起票ガイド                                                                                                                       | フロー図・テーブル                                     |

## 4. 件数サマリー

| 分類        | 件数目安  | 備考                                                         |
| ----------- | --------- | ------------------------------------------------------------ |
| append-only | 約 150 件 | `task-workflow-completed-*.md` + `lessons-learned-*.md` 等   |
| 構造化      | 約 450 件 | `api-*.md` / `arch-*.md` / `task-workflow.md` 系主要ファイル |
| **合計**    | 609 件    | mirror 側（`.agents/skills/*/references/*.md`）も同件数      |

## 5. 全 `references/*.md` カバレッジ確認

- [x] 上記 append-only パターン 5 種で命名規則カバー完了
- [x] 上記構造化パターン 12 種で命名規則カバー完了
- [x] 未分類パターンなし（Phase 7 で再照合）

## 6. 本タスクの結論（`.gitattributes` パターン設計への橋渡し）

Phase 5 で採用する glob は以下の 3 グループに集約する:

1. **append-only 明示列挙**（`merge=union`）
   - `**/references/LOGS.md`
   - `**/references/SKILL-changelog.md`
   - `**/references/task-workflow-completed*.md`
   - `**/references/lessons-learned-*.md`（`lessons-learned.md` root は除外）
2. **indexes 系**（`merge=ours`、既存維持）
   - `.claude/skills/*/indexes/*.json` / `*.md`
   - `.agents/skills/*/indexes/*.json` / `*.md`
3. **構造化ドキュメント**（明示指定なし＝デフォルト 3-way）
   - 上記に該当しない `references/*.md` 全般

> **注**: glob の優先順位は `.gitattributes` の **最後にマッチしたパターン勝ち** のため、
> 既存の広い `references/*.md merge=union` は削除し、狭い append-only 明示列挙のみを残す。
