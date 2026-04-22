# 実装ガイド: qualityInsights フィールド定義の正本追記

> Phase 12 Task 1 成果物
> 作成日: 2026-04-21

---

## Part 1

### なぜ必要か

ソフトウェア開発では「どんなデータが、どんな意味を持ち、誰が書き込み、誰が管理するか」をどこかに記録しておかないと、後から読んだ人が使い方を誤ってしまいます。`qualityInsights` という項目がプログラムの中にはあったのに、その説明書にはまだ書かれていませんでした。説明書に書き加えることで、未来の担当者がルールを知らずに壊してしまうのを防ぎます。

### 何をするか

`task-specification-creator` というスキル（機能）が持っている `qualityInsights` という章にある 10 個の実フィールドについて、「何のためのデータか」「誰が書き込むか」「誰が管理するか」を正式な説明書（`evals-schema-spec.md`）にそろえて書きます。確認時は `TASK_ID` プレースホルダを含む 11 検証ポイントで漏れを見ます。

### 日常の例え

たとえば、図書館に「新しい言葉の辞書」があるとします。その辞書に `qualityInsights` という章があり、仕事の品質を測る 10 個の言葉が並んでいます。でも辞書の本文には「この言葉の意味は？」「誰がこの欄に書き込む？」「誰が正しい内容を管理する？」という説明がまだ書かれていませんでした。

辞書編集者（このタスクの担当者）が、各ページを開いて丁寧に「この言葉は〇〇という意味です」「この欄はタスク担当者が Phase 12 のとき書き込みます」「管理責任者はタスク担当者です」と書き加えました。たとえば `patternAdoptionRate`（パターン採用率）というページには「0.0〜1.0 の数値で、親スキルのパターンがどれだけ使われているかを表す」と書き加えるイメージです。

### 今回行ったこと

`evals-schema-spec.md` の §6（qualityInsights セクション）に以下を追記しました:

1. **§6 テーブル修正**: 実際の実装と異なっていた `taskMetrics` のフラット構造（`createdCount` 等 7 フィールド）を、正しいタスク ID キー辞書構造（`{TASK_ID}.completedPhases` 等 5 サブフィールド）に修正
2. **§6.1 運用ルール追記**: writer（Phase 12 closeout 担当者）・更新タイミング・運用責任を追記
3. **§8 変更履歴追記**: 2026-04-21 の修正記録を追加
4. **quick-reference.md**: `qualityInsights` クイックアクセスセクションを追加
5. **completed ledger / topic-map**: close-out の検索導線と履歴追跡を same-wave で同期

---

## Part 2

### 追記対象フィールド一覧

| フィールド                                                      | 型                       | 意味                                     |
| --------------------------------------------------------------- | ------------------------ | ---------------------------------------- |
| `qualityInsights.patternAdoptionRate`                           | number (0.0〜1.0)        | parent-skill pattern の採用率            |
| `qualityInsights.coverageTargetHitRate`                         | number (0.0〜1.0)        | coverage target 達成率                   |
| `qualityInsights.unassignedTaskDetectionRate`                   | number (0.0〜1.0)        | 未タスク検出率                           |
| `qualityInsights.notes`                                         | string                   | 運用者メモ（Phase 12 closeout 時に追記） |
| `qualityInsights.taskMetrics`                                   | Record\<string, object\> | 完了タスク ID キー辞書                   |
| `qualityInsights.taskMetrics.{TASK_ID}.completedPhases`         | number (1〜13)           | 完了 Phase 数                            |
| `qualityInsights.taskMetrics.{TASK_ID}.totalTests`              | number (0以上)           | 総テスト数（docs-only は 0）             |
| `qualityInsights.taskMetrics.{TASK_ID}.avgCoverage`             | number (0.0〜100.0)      | 平均カバレッジ（%）                      |
| `qualityInsights.taskMetrics.{TASK_ID}.systemSpecsUpdated`      | number (0以上)           | 更新したシステム仕様書数                 |
| `qualityInsights.taskMetrics.{TASK_ID}.unassignedTasksDetected` | number (0以上)           | Phase 12 で検出した未タスク数            |

### 追記方針

- **正本**: `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` §6
- **mirror**: `.agents/skills/aiworkflow-requirements/references/evals-schema-spec.md`（同一内容でコピー）
- **フォーマット**: §2 の standard schema 表と同形式（`フィールド | 型 | 意味` 3 列テーブル）
- **行数制約**: 500 行以内を維持（追記後 192 行）
- **変更履歴**: §8 に `Date | 変更内容` 形式でエントリを追加

### writer と運用責任の定義

- **writer**: 各タスクの Phase 12 closeout を実行するタスク担当者（人間）
- **更新タイミング**: 各タスクの Phase 12 closeout 時（`taskMetrics` に 1 エントリ追加、rate 系フィールドを再計算）
- **運用責任**: タスク担当者。自動更新スクリプトは現状 0 件（将来は `log_usage.js` 拡張で自動化予定）
- **reader**: 現状 0 件（将来は `select_skill.js` 等が消費する設計）

### 確認コマンド

```bash
# フィールド存在確認
grep -F "qualityInsights.patternAdoptionRate" \
  .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md

# 全フィールド網羅確認（11 検証ポイント）
for field in \
  "qualityInsights.patternAdoptionRate" \
  "qualityInsights.coverageTargetHitRate" \
  "qualityInsights.unassignedTaskDetectionRate" \
  "qualityInsights.notes" \
  "qualityInsights.taskMetrics" \
  "TASK_ID" "completedPhases" "totalTests" \
  "avgCoverage" "systemSpecsUpdated" "unassignedTasksDetected"; do
  grep -qF "$field" .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md \
    && echo "PASS: $field" || echo "FAIL: $field"
done

# mirror sync 確認
diff -qr .claude/skills/aiworkflow-requirements/ .agents/skills/aiworkflow-requirements/
# 期待: 出力 0 行

# 行数確認
wc -l .claude/skills/aiworkflow-requirements/references/evals-schema-spec.md
# 期待: 500 行以内
```

### エッジケース

| ケース                                      | 対処方針                                                                                     |
| ------------------------------------------- | -------------------------------------------------------------------------------------------- |
| フィールド名の揺れ（`quality_insights` 等） | snake_case v1 系は §3 に記載済み。§6 は camelCase v2 系のみ定義する（混在禁止）              |
| 既存 §6 記述との重複                        | §2 の `qualityInsights.*` サマリ行（§6 参照リンク）は削除しない。2 段構成（概要→詳細）が正当 |
| 500 行超過                                  | Phase 8 リファクタリングで確認。追記後 192 行のため余裕あり                                  |
| taskMetrics のエントリ追加漏れ              | Phase 12 closeout チェックリストで `taskMetrics.{TASK_ID}` の追記を必須手順に含める          |

---

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要。本タスクは docs-only（Markdown 仕様書の追記のみ）であり、Renderer / UI への変更がない。
