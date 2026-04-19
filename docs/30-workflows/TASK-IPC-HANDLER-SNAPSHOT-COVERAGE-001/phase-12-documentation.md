# Phase 12: ドキュメント更新

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| Phase        | 12                                              |
| タスクID     | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001          |
| タスク名     | IPC handler registration snapshot coverage 拡張 |
| タスク種別   | docs-only / NON_VISUAL                          |
| ステータス   | 完了                                            |
| 作成日       | 2026-04-19                                      |
| GitHub Issue | #2269（CLOSED）                                 |

## 目的

registration snapshot coverage 拡張の実施結果を、
`task-specification-creator` と `aiworkflow-requirements` の
正本運用フローに沿ってドキュメントへ同期する。
本 Phase の正本は `outputs/phase-12/` 配下の成果物群であり、
planned wording を残さず、更新有無と判断根拠を明記する。

## 必須タスク一覧

### Task 1: 実装ガイド作成

**成果物**: `outputs/phase-12/implementation-guide.md`

Part 1（中学生レベル）必須要件:

- 日常の例え話を使って「なぜ必要か」を先に説明する
- 専門用語は最小限にし、使う場合は直後に説明する
- 今回のタスクが「IPC登録契約の見える化」であることを説明する

Part 2（技術者向け）必須要件:

- registration snapshot の対象母集団の定義
- `REG-SNAP` / `REG-DEDUP` / `REG-COUNT` の契約
- `handle only` / `mixed` / `on only` の扱い
- テストファイル命名規則
- 使用コマンド、CI計測方法、例外扱いのルール

NON_VISUAL タスクのため、`implementation-guide.md` には以下を必ず含める:

```md
## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要
代替証跡: `outputs/phase-10/final-review-result.md` と
`outputs/phase-11/manual-test-result.md`
```

### Task 2: システム仕様更新サマリー作成

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

Step 1（全 task で必須）:

- Step 1-A: workflow 完了記録の対象と記録先を列挙する
- Step 1-B: 実装状況を `completed` または `spec_created` のどちらで記録するか判断する
- Step 1-C: 関連タスク、未タスク候補、依存関係の更新有無を整理する
- Step 1-D: `topic-map.md` / `keywords.json` の再生成要否を判断する
- Step 1-E: `.claude` / `.agents` の mirror 影響範囲を整理する
- Step 1-F: `LOGS.md` 更新有無を整理する
- Step 1-G: 検証コマンドの実行結果を要約する

Step 2（条件付き）:

- interface / API / architecture / state / security 契約に変更がある場合のみ
  `aiworkflow-requirements` 正本へ同期する
- 更新先の正本は `docs/10-requirements` や `docs/20-design` ではなく、
  `.claude/skills/aiworkflow-requirements/` と `.agents/skills/aiworkflow-requirements/`
  の運用フローに従う
- Step 2 を行わない場合も、不要と判断した根拠を残す

### Task 3: ドキュメント更新履歴作成

**成果物**: `outputs/phase-12/documentation-changelog.md`

必須記録:

- 更新日時
- 更新ファイル一覧
- Step 1 / Step 2 の実施有無
- validator / verify / link check の結果
- Phase 10 MINOR 指摘があれば追跡結果

### Task 4: 未タスク検出レポート作成

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

- 0件でも必須
- docs-only task として、契約→実装、契約→テスト、仕様書間差異、後続Wave課題を確認する
- 未タスクがある場合は `docs/30-workflows/unassigned-task/` への配置先を明記する

### Task 5: スキルフィードバックレポート作成

**成果物**: `outputs/phase-12/skill-feedback-report.md`

- 改善点なしでも必須
- 有効だった運用
- 詰まった点
- 今後テンプレートへ取り込みたい改善

### Task 6: Phase 12 準拠チェック

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

- Task 1〜5 の完了確認
- ファイル名一致確認
- planned wording 残存確認
- `artifacts.json` との一致確認

## 参照資料

| 参照資料               | パス                                                                             | 内容                                      |
| ---------------------- | -------------------------------------------------------------------------------- | ----------------------------------------- |
| Phase 12 テンプレート  | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` | docs-only / SF-02 / SF-03 の補足          |
| システム仕様更新フロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`   | Step 1 / Step 2 / validation の正本フロー |
| 仕様記述ガイド         | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`           | 仕様書の命名・記述ルール                  |
| topic-map / keywords   | `.claude/skills/aiworkflow-requirements/indexes/`                                | 再生成対象判断                            |

## 成果物一覧

| ファイル                                                 | 説明                                     | ステータス |
| -------------------------------------------------------- | ---------------------------------------- | ---------- |
| `outputs/phase-12/implementation-guide.md`               | 実装ガイド（Part 1 + Part 2 + 視覚証跡） | 作成済み   |
| `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の判断結果               | 作成済み   |
| `outputs/phase-12/documentation-changelog.md`            | 更新履歴・validator 結果                 | 作成済み   |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出レポート                     | 作成済み   |
| `outputs/phase-12/skill-feedback-report.md`              | スキルフィードバック                     | 作成済み   |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 仕様適合チェック                | 作成済み   |

## 完了条件

- [ ] `implementation-guide.md` が Part 1 / Part 2 / 視覚証跡を含んでいる
- [ ] `system-spec-update-summary.md` に Step 1 / Step 2 の判断結果が記録されている
- [ ] `documentation-changelog.md` に validator / verify 結果が記録されている
- [ ] `unassigned-task-detection.md` が 0件でも出力されている
- [ ] `skill-feedback-report.md` が改善点なしでも出力されている
- [ ] `phase12-task-spec-compliance-check.md` が Task 1〜5 の完了を検証している
- [ ] planned wording が残っていない
- [ ] `artifacts.json` の Phase 12 定義と成果物名が一致している

## タスク100%実行確認【必須】

- [ ] Task 1〜6 の成果物が全て存在する
- [ ] 全成果物が空でない
- [ ] `.claude` / `.agents` / `outputs/phase-12` の整合判断が記録されている
- [ ] `docs/30-workflows/unassigned-task/` への配置要否が記録されている
- [ ] validator / verify / link check の結果が `documentation-changelog.md` に残っている
