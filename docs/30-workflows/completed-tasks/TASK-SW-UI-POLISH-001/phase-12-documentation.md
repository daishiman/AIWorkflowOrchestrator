# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                                                             |
| -------- | ------------------------------------------------------------------------------ |
| Phase    | 12                                                                             |
| タスクID | TASK-SW-UI-POLISH-001                                                          |
| 機能名   | スキルウィザード UI仕上げ（CSS変数監査・カテゴリ選択上限・アニメーション追加） |
| 作成日   | 2026-04-14                                                                     |
| 前提     | Phase 11 完了済み（手動テスト PASS）                                           |
| 状態     | 未着手                                                                         |

## 目的

実装完了後に、Phase 11 の visual evidence を根拠として、実装ガイド・仕様更新サマリー・変更履歴・未タスク検出・スキルフィードバック・準拠チェックの 6 成果物を同波で閉じる。

---

## 実行タスク

| Task | 内容                             | 主成果物                                                 |
| ---- | -------------------------------- | -------------------------------------------------------- |
| 12-1 | 実装ガイド作成                   | `outputs/phase-12/implementation-guide.md`               |
| 12-2 | システム仕様更新                 | `outputs/phase-12/system-spec-update-summary.md`         |
| 12-3 | ドキュメント更新履歴作成         | `outputs/phase-12/documentation-changelog.md`            |
| 12-4 | 未タスク検出レポート作成         | `outputs/phase-12/unassigned-task-detection.md`          |
| 12-5 | スキルフィードバックレポート作成 | `outputs/phase-12/skill-feedback-report.md`              |
| 12-6 | Phase 12 準拠チェック            | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

- Task 12-1: 実装ガイド作成（Part 1 / Part 2）
- Task 12-2: システム仕様更新（Step 1-A〜C、Step 2 の要否判定）
- Task 12-3: ドキュメント更新履歴と `artifacts.json` 同期
- Task 12-4: 未タスク検出レポート作成
- Task 12-5: スキルフィードバックレポート作成
- Task 12-6: Phase 12 準拠チェック作成

---

## 出力成果物

| 成果物                       | パス                                                     | 最低限必要な内容                                                        |
| ---------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2、Phase 11 証跡の参照                                    |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1 / Step 2 の結果と N/A 理由                                       |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | 変更ファイル、validator 結果、current/baseline、`artifacts.json` parity |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 0 件でも summary を残す                                                 |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | 改善点あり / なし を明記                                                |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 の完了確認                                              |

---

## Task 1: 実装ガイド作成【必須】

### 2パート構成

| パート | 対象読者         | 内容                                                                                   |
| ------ | ---------------- | -------------------------------------------------------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念説明。日常の例え話を必ず含め、`なぜ必要か` → `何をするか` の順で説明する           |
| Part 2 | 開発者・技術者   | 技術的詳細。型定義、API シグネチャ、使用例、エラーハンドリング、設定可能な定数を含める |

### Part 1 の必須要件

- 日常生活の例え話を 1 つ以上含める
- 専門用語は使わない。使う場合はその場で言い換える
- 「なぜ必要か」を先に書き、その後に「何をするか」を書く

### Part 2 の必須要件

- `SkillInfoFormData`、`MAX_CATEGORY_COUNT`、`handleCategoryClick`、`isAtLimit` などの型と責務を明示する
- API シグネチャと使用例を記載する
- エラーハンドリングとエッジケースを説明する
- 設定可能なパラメータと定数を一覧化する
- **VISUAL タスク** なので `outputs/phase-11/manual-test-result.md`、`outputs/phase-11/phase11-capture-metadata.json`、screenshot references を必ず参照する
- `screenshots/.gitkeep` の削除は行わない

---

## Task 2: システム仕様更新【必須】

### Step 1-A: 完了記録

- 関連する仕様書に「完了タスク」セクションを追加する
- 関連ドキュメントに実装ガイドへのリンクを追加する
- 変更履歴に今回のバージョンを追記する
- 関連する `task-workflow.md` / `task-workflow-completed.md` がある場合は同波で同期する
- `LOGS.md` x2 と `SKILL.md` history x2 を同波で更新する
- 見出しや行番号が変わった場合は `topic-map.md` を再生成する

### Step 1-B: 実装状況テーブル

- 実装が終わっている場合は `completed`
- 仕様書作成のみの追跡なら `spec_created`
- このタスクでは、実装済みの UI 変更を反映する前提で `completed` を使う

### Step 1-C: 関連タスクテーブル

- `関連タスク`
- `未タスク候補`
- `残課題`

上記の table を横断して、状態を current facts に合わせる。

### Step 2: system spec sync

- 新規インターフェース / 型 / API / 設定値の追加がある場合のみ実施する
- このタスクでは local UI constant の追加と CSS クラス変更に留まるため、原則は N/A
- Step 2 を N/A にした場合は、その理由を `system-spec-update-summary.md` に明記する

---

## Task 3: ドキュメント更新履歴作成【必須】

- `documentation-changelog.md` を作成する
- 変更ファイル、validator 結果、current/baseline、`artifacts.json` parity を記録する
- `artifacts.json` の更新結果をここに反映する

---

## Task 4: 未タスク検出レポート作成【必須】

- Phase 3 / Phase 10 / Phase 11 の MINOR、スコープ外発見、`TODO` / `FIXME` / `HACK` / `XXX` を確認する
- 0 件でも `unassigned-task-detection.md` を出力する
- 0 件の場合も「調査したが未タスク化対象なし」と明記する

---

## Task 5: スキルフィードバックレポート作成【必須】

- 改善点がある場合は列挙する
- 改善点がない場合でも「改善点なし」として必ず出力する
- `task-specification-creator` と `aiworkflow-requirements` の次回改善に役立つ知見を 1 つ以上残す

---

## Task 6: Phase 12 準拠チェック【必須】

- Task 12-1〜12-5 がすべて揃っているか確認する
- Phase 11 証跡と `phase11-capture-metadata.json` の参照が `implementation-guide.md` に含まれているか確認する
- `documentation-changelog.md` と `system-spec-update-summary.md` の判断が一致しているか確認する
- `phase12-task-spec-compliance-check.md` を root evidence として残す

---

## Phase 12 完了条件

- [ ] Task 12-1〜12-6 の成果物がすべて出力済み
- [ ] 実装ガイドの Part 1 / Part 2 が skill 要件を満たしている
- [ ] Phase 11 の visual evidence が Part 2 から参照されている
- [ ] Step 2 の要否判断と理由が記録済み
- [ ] 未タスク検出レポートが 0 件でも出力済み
- [ ] スキルフィードバックレポートが改善点なしでも出力済み
- [ ] Phase 12 準拠チェックが PASS
