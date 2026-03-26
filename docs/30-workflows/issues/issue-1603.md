# [#1603] [UT-SC-05-UT-3] Phase 3 コード差分分析の標準タスク化

## メタ情報

```yaml
task_id: UT-SC-05-UT-3
task_name: UT
category: -
target_feature: -
priority: MEDIUM
scale: -
status: 未実施
source_phase: -
created_date: 2026-03-25
dependencies: []
spec_path: docs/30-workflows/unassigned-task/ut-sc-05-ut-3-phase3-code-diff-analysis.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | MEDIUM |
| 規模       | -      |
| ステータス | 未実施 |

---

## 概要

UT-SC-05-IPC-DI-WIRING では Phase 1-2 で「3依存すべて未注入」を前提に設計したが、Phase 3 実行時に resourceLoader と llmAdapter は既に別タスクで注入済みだった。仕様書作成と実装実行の間にコードが変化するケースへの対策として、Phase 3（設計レビュー）に「現状コードとの差分分析」を標準タスクとして追加する。

## 現状

Phase 3 設計レビューのテンプレート（`phase-templates.md`）には以下のタスクが定義されている:

- 要件・設計整合性レビュー
- セキュリティレビュー
- テスト影響レビュー
- 判定

「仕様書の前提コードが現状コードと一致するか」の確認タスクが存在しない。

## 期待される修正

`task-specification-creator` スキルの Phase 3 テンプレートに以下を追加:

```markdown
### Task 0: 現状コード差分分析（Phase 3 開始時に必須実行）

Phase 1-2 で引用したコードスニペットと現状コードの差分を確認する。

1. `git log --oneline --since="<Phase 1 作成日>" -- <対象ファイル>` で中間コミットを確認
2. Phase 1-2 のコードスニペットと現状コードを比較
3. 差分がある場合、設計を現状コードに合わせて修正
4. 差分の有無と内容を gate-decision.md に記録
```

## 影響範囲

- `.claude/skills/task-specification-creator/references/phase-templates.md`（Phase 3 テンプレート）
- `.claude/skills/task-specification-creator/SKILL.md`（変更履歴）

## 関連仕様

- L-IPC-DI-001: 仕様書作成時点とコード乖離（lessons-learned-current.md）
- P57: 設計タスクにおける Phase 12 システム仕様書更新の先送りパターン

## 苦戦箇所（UT-SC-05-IPC-DI-WIRING での経験）

UT-SC-05 では Phase 1-2 で「3依存すべて未注入」と記載した。しかし Phase 3 実行時に調査したところ、別タスク（TASK-SC-05-IMPROVE-LLM）が先にマージされ、resourceLoader と llmAdapter は既に注入済みだった。結果、26個のサブタスクを計画したうち実際に必要だったのは「skillFileManager の1行追加」のみ。Phase 3 がなければ過剰な実装作業を行うところだった。

## 見積もり

極小（テンプレートファイル1-2箇所の追記）
