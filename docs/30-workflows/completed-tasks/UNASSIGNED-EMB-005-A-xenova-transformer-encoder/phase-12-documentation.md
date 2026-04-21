# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| Phase        | 12                                                       |
| タスクID     | UNASSIGNED-EMB-005-A                                     |
| タスク名     | XenovaTransformerEncoder 実装（IEncoder 具体実装クラス） |
| タスク種別   | NON_VISUAL                                               |
| ステータス   | 完了                                                     |
| 作成日       | 2026-04-20                                               |
| 前Phase      | 11: 手動テスト                                           |
| 次Phase      | 13: PR 作成                                              |
| GitHub Issue | #2312（CLOSED）                                          |

## 目的

`task-specification-creator` の Phase 12 固定成果物と、
`aiworkflow-requirements` の正本同期フローに沿って close-out を行う。
本 Phase は required 6 artifacts を揃え、Step 1 と Step 2 を混同せず、
必要な正本だけを更新対象として記録する。

## Part 1: 中学生レベルの概念説明

### Late Chunking

長い文章を AI に読ませるとき、先に細かく切ってから読むと前後のつながりが弱くなります。
Late Chunking は、まず文章全体を読ませてから後で区切る方法です。
丸ごと焼いたピザをあとで切るイメージで、全体の流れを保ったまま部分ごとの特徴を取り出せます。

### IEncoder

`IEncoder` は、「文章を渡すと決まった形の結果を返す」という約束です。
飲み物の注文票が決まっていれば、自販機が違っても同じ押し方で買えるのと同じです。

### XenovaTransformerEncoder

`XenovaTransformerEncoder` は、その約束を `@xenova/transformers` で実際に動かす部品です。
`LateChunkingService` から見れば「同じ注文票で使える自販機」が一台増えることになります。

## Part 2: Phase 12 必須タスク

### Task 1: implementation-guide.md 作成

**成果物**: `outputs/phase-12/implementation-guide.md`

必須内容:

- Part 1 の中学生レベル説明を転記する
- 技術者向けに `XenovaTransformerEncoder` の契約、依存、エラー分類、使用例を記録する
- `outputs/phase-2/error-decision-table.md` と `outputs/phase-6/expansion-test-result.md` を参照する
- `## 視覚証跡` セクションに次を明記する

```md
UI/UX変更なしのため Phase 11 スクリーンショット不要
代替証跡: `outputs/phase-10/final-review-result.md` と
`outputs/phase-11/manual-test-result.md`
```

### Task 2: system-spec-update-summary.md 作成

**成果物**: `outputs/phase-12/system-spec-update-summary.md`

Step 1（全 task で必須）:

- Step 1-A: workflow 完了記録の対象と更新先を記録する
- Step 1-B: 本タスクは実装完了を扱うため `completed` 判定を前提にし、例外があれば理由を残す
- Step 1-C: 親タスク `UNASSIGNED-EMB-005` と関連未タスクの更新有無を記録する
- Step 1-D: `indexes/topic-map.md` / `indexes/keywords.json` の再生成要否を記録する
- Step 1-E: `.claude` canonical / `.agents` mirror の同期対象を記録する
- Step 1-F: `LOGS.md` 更新有無を記録する
- Step 1-G: validation 実行結果を要約する

Step 2（条件付き）:

- public API、embedding architecture、internal API 説明に変化がある場合のみ実施する
- 実施対象は、存在確認できた正本に限定する

**Step 2 の候補ファイル**:

| 区分               | 正本候補                                                                                                                       | 更新理由                                       |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| embedding overview | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                                                           | Late Chunking の concrete encoder 追加反映     |
| architecture       | `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md`                                         | Late Chunking 構成・利用可能コンポーネント反映 |
| internal API       | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`                                                  | public/internal contract 変更の有無を記録      |
| ledger             | `.claude/skills/aiworkflow-requirements/LOGS.md`                                                                               | close-out 記録                                 |
| indexes            | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` / `.claude/skills/aiworkflow-requirements/indexes/keywords.json` | 検索可能性の同期                               |

`system-spec-update-summary.md` には、各候補について `updated` / `no-op` / `follow-up` の
判定と根拠を書くこと。

### Task 3: documentation-changelog.md 作成

**成果物**: `outputs/phase-12/documentation-changelog.md`

必須内容:

- 変更ファイル一覧（実施 / no-op / follow-up）
- validation / verify / link check の結果
- Phase 10 MINOR 指摘の追跡結果
- Step 1 と Step 2 の判断が `system-spec-update-summary.md` と矛盾しないこと

### Task 4: unassigned-task-detection.md 作成

**成果物**: `outputs/phase-12/unassigned-task-detection.md`

必須内容:

- 0件でも summary を残す
- 契約→実装、契約→テスト、renderer/Electron 統合、キャッシュパス連携などの follow-up 候補を確認する
- 未タスクがある場合は `docs/30-workflows/unassigned-task/` への配置判断を書く

### Task 5: skill-feedback-report.md 作成

**成果物**: `outputs/phase-12/skill-feedback-report.md`

必須内容:

- 改善点なしでも出力する
- `task-specification-creator` 観点: この task に対して過剰だったテンプレ要求
- `aiworkflow-requirements` 観点: どの正本を見れば十分だったか、不要だった追跡を何に絞れたか
- 今回の知見をテンプレートへ戻すなら何を軽量化すべきか

### Task 6: phase12-task-spec-compliance-check.md 作成

**成果物**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

必須内容:

- Task 1〜5 の完了確認
- required 6 artifacts の存在確認
- planned wording 残存確認
- canonical 名の一致確認
- `manual-test-result.md` を参照していることの確認

## 参照資料

| 参照資料                  | パス                                                                                   | 内容                                            |
| ------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Phase 12 テンプレート     | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`       | 必須 6 成果物、Step 1 / Step 2、NON_VISUAL 分岐 |
| 仕様同期フロー            | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1 / Step 2 / validation の区別             |
| embedding 正本            | `.claude/skills/aiworkflow-requirements/references/llm-embedding.md`                   | Late Chunking 型・説明                          |
| architecture 正本         | `.claude/skills/aiworkflow-requirements/references/architecture-embedding-pipeline.md` | 構成と責務                                      |
| internal API 正本         | `.claude/skills/aiworkflow-requirements/references/api-internal-embedding.md`          | API と契約                                      |
| indexes                   | `.claude/skills/aiworkflow-requirements/indexes/`                                      | topic-map / keywords                            |
| Phase 11 primary evidence | `outputs/phase-11/manual-test-result.md`                                               | NON_VISUAL 手動確認の正本                       |

## 成果物一覧

| ファイル                                                 | 説明                         | ステータス |
| -------------------------------------------------------- | ---------------------------- | ---------- |
| `outputs/phase-12/implementation-guide.md`               | Part 1 + Part 2 + 視覚証跡   | 作成済み   |
| `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の判断と根拠 | 作成済み   |
| `outputs/phase-12/documentation-changelog.md`            | 変更履歴と validation 結果   | 作成済み   |
| `outputs/phase-12/unassigned-task-detection.md`          | 未タスク検出結果             | 作成済み   |
| `outputs/phase-12/skill-feedback-report.md`              | skill へのフィードバック     | 作成済み   |
| `outputs/phase-12/phase12-task-spec-compliance-check.md` | Phase 12 準拠チェック        | 作成済み   |

## 完了条件

- [x] required 6 artifacts がすべて作成されている
- [x] `implementation-guide.md` に中学生レベル説明と技術者向け説明がある
- [x] `system-spec-update-summary.md` に Step 1 / Step 2 の判定と根拠がある
- [x] Step 2 の対象が存在確認済みの正本ファイルに限定されている
- [x] `documentation-changelog.md` と `system-spec-update-summary.md` の判断が一致している
- [x] `unassigned-task-detection.md` が 0件でも出力されている
- [x] `skill-feedback-report.md` が改善点なしでも出力されている
- [x] `phase12-task-spec-compliance-check.md` が Task 1〜5 と required 6 artifacts を検証している

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UNASSIGNED-EMB-005-A-xenova-transformer-encoder/phase-13-pr.md`
