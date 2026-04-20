# LOGS.md アーカイブポリシー

## メタ情報

| 項目           | 内容                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| タスクID       | TASK-LOGS-ARCHIVE-POLICY-001                                             |
| Issue          | [#2282](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282) |
| 最終更新日     | 2026-04-19                                                               |
| 次回見直し日   | 2026-10-19（6 か月後）                                                   |
| 見直しサイクル | 6 か月毎                                                                 |
| ステータス     | active                                                                   |

> F-004 対応: 最終更新日と次回見直し日を必ずセットで記載する。

## 1. 適用範囲

### 1.1 対象

- `.claude/skills/*/LOGS.md`（正本側の全 skill）
- `.agents/skills/*/LOGS.md`（mirror 側の全 skill）

### 1.2 除外

- `docs/**/LOGS.md`（別途 task-workflow で管理）
- `.worktrees/**/LOGS.md`（worktree 廃棄時に削除）
- テンポラリな作業ログ（個人作業用）

## 2. アーカイブ閾値

以下のいずれか 1 つ以上を満たした時点でアーカイブ対象とする（OR 条件・ハイブリッド方式）。

| 閾値種別     | 値       | 判定コマンド例                 |
| ------------ | -------- | ------------------------------ |
| 行数         | 300 行超 | `wc -l LOGS.md`                |
| バイトサイズ | 30 KB 超 | `wc -c LOGS.md`（30720 バイト） |
| 期間         | 月次     | カレンダー経過                 |

### 2.1 判定タイミングの固定（F-003 対応）

- 判定日: 毎月初の第 1 営業日に前月分を評価する
- 実行日: 判定日から 3 営業日以内にアーカイブを実行する
- 月末判定は採用しない（月末作業が属人化するリスクを回避するため）
- 判定主体: 該当 skill の管理者または担当者

### 2.2 閾値根拠

Phase 1 計測結果（2026-04-19 時点）:

| skill                      | 行数 | サイズ(KB) | 300行超 | 30KB超 |
| -------------------------- | ---- | ---------- | ------- | ------ |
| claude-agent-sdk           | 336  | 26.4       | 超      | 未達   |
| skill-creator              | 2542 | 123.0      | 超      | 超     |
| aiworkflow-requirements    | 2908 | 571.4      | 超      | 超     |
| task-specification-creator | 3158 | 233.9      | 超      | 超     |

claude-agent-sdk（26.4 KB / 336 行）のように、行数閾値と KB 閾値の
どちらか片方のみで発火するケースがあるため OR 条件が必要。

## 3. archive 先パス規則

### 3.1 パス構造

```
.claude/skills/<skill-name>/LOGS.md                                     # 現役ログ
.claude/skills/<skill-name>/references/logs-archive-<YYYY-MM>.md        # canonical 月次アーカイブ
.agents/skills/<skill-name>/LOGS.md                                     # mirror 現役
.agents/skills/<skill-name>/references/logs-archive-<YYYY-MM>.md        # mirror 月次
```

### 3.2 ファイル命名規則

- 正規表現: `^logs-archive-\d{4}-(0[1-9]|1[0-2])\.md$`
- 採用例: `logs-archive-2026-04.md`、`logs-archive-2026-12.md`
- 不採用例: `logs-archive-202604.md`（ハイフン欠落）、`logs-archive-2026-4.md`（0 埋めなし）

### 3.3 legacy 表記との共存（F-001 対応）

既存のアーカイブには以下の legacy 表記があり、これらは残置・リネーム禁止。

| 種別            | 実例                                                                 | 対応     |
| --------------- | -------------------------------------------------------------------- | -------- |
| 月名英語スペル  | `logs-archive-2026-feb.md` / `logs-archive-2026-march.md`            | 残置     |
| トピック拡張形式| `logs-archive-2026-01-agent-sdk-deps-renderer-api.md` 等（30 件超）  | 残置     |
| index / legacy  | `logs-archive-index.md` / `logs-archive-legacy.md`                   | 残置     |

- 2026-04 以降の新規月次アーカイブは必ず `references/` 配下に YYYY-MM 数値形式で作成する
- legacy ファイルと新形式は同一ディレクトリで共存可能
- 検索は `logs-archive-*.md` のワイルドカードで両形式を捕捉する運用とする
- トピック拡張形式（`YYYY-MM-<topic>.md`）は aiworkflow-requirements 配下の既存運用であり、本ポリシーで禁止はしない

## 4. アーカイブ手順

以下 6 ステップを順番に実行する。

1. 閾値超過の検知
   - 毎月 1 日に `wc -l LOGS.md` と `wc -c LOGS.md` を各 skill について実行
   - 300 行 OR 30 KB OR 前月から 1 か月経過のいずれかを満たす skill を特定
2. 当月末までのログ抽出
   - 前月分のログエントリを `LOGS.md` から抽出
   - 抽出範囲は「前月 1 日 00:00 〜 前月末 23:59」のタイムスタンプまたは見出し
3. `logs-archive-YYYY-MM.md` への追記
   - `references/` 配下に新規作成し、既存があれば末尾追記
   - 既存 legacy ファイルは触らない
4. LOGS.md から当該月分ログを削除
   - 現役 LOGS.md から移動済みエントリを削除し現役ログを軽量化
   - `git diff` で削除範囲が抽出範囲と一致することを確認
5. mirror sync 実行
   - `.agents/skills/<skill-name>/` 側に同等の変更を反映
   - sync 機構が対応している場合は自動、未対応の場合は手動コピー
   - 参照: TASK-CONFLICT-PREVENT-001 成果物
6. 動作確認
   - `.claude/` と `.agents/` の両側で `ls references/logs-archive-*.md` による存在確認
   - `diff .claude/skills/<skill-name>/references/logs-archive-<YYYY-MM>.md .agents/skills/<skill-name>/references/logs-archive-<YYYY-MM>.md` で差分ゼロ確認
   - `wc -l LOGS.md` で現役ログが閾値以下に戻ったこと確認

### 4.1 失敗時の再実行条件

- 抽出範囲と `git diff` が一致しない場合は、削除を取り消して抽出手順からやり直す
- mirror 側に差分が残る場合は手動同期後に `diff` を再実行する
- `references/` 配下以外へ新規ファイルを作成した場合は close-out 前に canonical 配置へ移す

## 5. 運用ルール

### 5.1 見直しサイクル

- 6 か月毎に本ポリシーを見直す
- 最終更新日・次回見直し日は冒頭メタ情報テーブルに必ず記載
- 次回見直しトリガ: 2026-10-19

### 5.2 変更時の手続き

- 本ポリシーを変更する際は本文末尾の CHANGELOG セクションに日付・変更内容・変更者を追記
- 閾値変更時は計測根拠（skill 別行数・サイズ）を明記
- 変更は mirror `.agents/` 側にも同時反映（diff=0 を維持）

### 5.3 エスカレーションフロー（F-005 対応）

ポリシー違反が検知された場合は以下のフローで対応する。

| 違反種別             | 検知方法                            | 一次対応                       | エスカレーション先             |
| -------------------- | ----------------------------------- | ------------------------------ | ------------------------------ |
| アーカイブ未実施     | 月次閾値超過のまま翌月 1 日を迎える | 該当 skill 担当が当月内に実施  | aiworkflow-requirements 管理者 |
| 命名規則違反         | 正規表現マッチ失敗                  | 新規ファイルをリネームして是正 | task-specification-creator     |
| mirror 同期漏れ      | `diff` で差分検出                   | 手動コピーで即時是正           | TASK-CONFLICT-PREVENT-001 担当 |
| ポリシー文書の陳腐化 | 6 か月を超えて未更新                | 見直し Issue を起票            | プロジェクトオーナー           |

- 一次対応で解消できない場合は GitHub Issue を起票し、該当エスカレーション先をアサインする
- 同一違反が 3 回以上連続した場合は本ポリシー自体の見直しを検討する
- ポリシー違反検知を自動化する案は MINOR（本タスク範囲外）とする

## 6. 参照

### 6.1 既存アーカイブ実例

- legacy 月名形式: `.claude/skills/task-specification-creator/references/logs-archive-2026-feb.md`
- legacy 月名形式: `.claude/skills/task-specification-creator/references/logs-archive-2026-march.md`
- トピック拡張形式: `.claude/skills/aiworkflow-requirements/references/logs-archive-2026-*-*.md`（30 件超）
- index/legacy: `.claude/skills/task-specification-creator/references/logs-archive-index.md`

### 6.2 関連タスク

- 前提タスク: TASK-CONFLICT-PREVENT-001（mirror sync 機構）
- 本タスク: TASK-LOGS-ARCHIVE-POLICY-001
- 起票 Issue: [#2282](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282)

### 6.3 関連インデックス

- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
- `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`

## 7. CHANGELOG

| 日付       | 変更内容                                                         | 変更者 |
| ---------- | ---------------------------------------------------------------- | ------ |
| 2026-04-19 | 初版作成（TASK-LOGS-ARCHIVE-POLICY-001 / Issue #2282 Close 直後）| AI     |
