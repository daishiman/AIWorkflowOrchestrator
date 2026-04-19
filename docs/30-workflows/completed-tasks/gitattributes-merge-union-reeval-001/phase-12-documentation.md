# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 12                                        |
| タスクID   | TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001 |
| 機能名     | gitattributes-merge-union-reeval          |
| 前提Phase  | Phase 11                                  |
| 後続Phase  | Phase 13                                  |
| 作成日     | 2026-04-19                                |
| ステータス | completed                                 |

## 目的

`.gitattributes` のマージ戦略再評価結果を恒久ドキュメント化し、`task-specification-creator` の Phase 12 必須 6 成果物（Task 1〜6）を漏れなく揃える。Step 1-A〜1-C による完了タスク記録・実装状況・関連タスク同期を完了し、Step 2 の判断（新規インターフェース追加なし → N/A）を明示する。

## 背景

本タスクは `references/*.md` に対する `merge=union` 適用範囲を append-only ファイルに限定し、構造化ドキュメントを除外する設定変更タスクである。コード変更は伴わず `.gitattributes` 1 ファイルとマージドライバ登録スクリプトのみが対象となるため、Step 2 のインターフェース更新は不要となる一方、運用ドキュメント（実装ガイド・システム仕様）と未タスク検出・スキルフィードバックの整備が長期保守性の鍵となる。

## 実行タスク

### Task 1: 実装ガイド作成（Part 1 + Part 2 の 2 部構成）

**目的**: 中学生レベルの直感的説明（Part 1）と技術者レベルの厳密説明（Part 2）の両方を残し、将来の保守者・新規参加者の理解コストを最小化する。

**実行手順**:

1. Part 1（中学生レベル）に以下の例え話を必ず含める。
   - 「Git のマージはお家の引っ越しに似ている。同じ部屋に 2 人が同時に荷物を入れると、誰のがどこにあるか分からなくなる」
   - 「`.gitattributes` は『この部屋には誰の荷物を優先するか』を書いておくメモ」
   - 「`merge=union`（ユニオン）は『どっちの荷物も全部置いておく』作戦。日記帳みたいに後ろへ追記するファイルだけに使う」
   - 「`merge=ours`（アワーズ）は『今いる人の荷物を優先』作戦。自動生成される目次みたいに、後で作り直せるファイルに使う」
2. Part 2（技術者レベル）に以下を記述する。
   - インターフェース/型定義（TypeScript）
   - API シグネチャと使用例
   - エラーハンドリングとエッジケース
   - 設定可能なパラメータと定数の一覧
   - `merge=union` のラインベース挙動と適用条件 / 不適用条件
   - カスタムドライバ `merge=ours` の登録（`setup-merge-drivers.sh` の `git config merge.ours.driver true` の意味）
   - `.gitattributes` の glob 構文（`**` / `*` / `/` の挙動差）と本タスクで採用したパターン精緻化方針
   - `git check-attr merge <file>` による属性検証手順
   - 新規 `references/` ファイル追加時の再評価フロー（append-only か構造化かの判定 → 必要なら `.gitattributes` 更新）
3. `## 視覚証跡` セクションに以下を記載する。
   - 「UI/UX変更なしのため Phase 11 スクリーンショット不要」
   - 代替証跡: `phase-10/final-review-result.md`、`phase-11/manual-test-result.md`

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

### Task 2: システム仕様更新（Step 1-A〜1-C 必須 + Step 2 判断）

**目的**: `aiworkflow-requirements` の 4 系統ドキュメント（完了タスク記録 / 実装状況 / 関連タスク / インターフェース）を本タスクの完了に揃える。

**実行手順**:

#### Step 1-A: 完了タスク記録 / リンク / 履歴 / LOGS / topic-map 同期

1. 完了タスク記録に `TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001` を追記する。
2. 関連ドキュメントリンク（`.gitattributes` / `setup-merge-drivers.sh` / Issue #2281）を一覧化する。
3. 変更履歴（before / after の `merge=union` 適用範囲）を記録する。
4. **2 系統 LOGS.md** を同期する（mirror parity 必須）。
   - `.claude/skills/aiworkflow-requirements/LOGS.md`
   - `.agents/skills/aiworkflow-requirements/LOGS.md`
5. `topic-map.md` の same-wave エントリを更新し、本タスクと TASK-CONFLICT-PREVENT-001 を「マージ戦略系」として束ねる。

#### Step 1-B: 実装状況テーブル更新

1. 該当エントリのステータスを `完了` に変更する。
2. 完了日（2026-04-19）と本タスク ID をリンクとして埋め込む。

#### Step 1-C: 関連タスクテーブル更新

1. TASK-CONFLICT-PREVENT-001 の完了記録に「後続再評価: TASK-GITATTRIBUTES-MERGE-UNION-REEVAL-001」を追記する。
2. 双方向リンクが切れていないことを `validate-references.js` 相当で確認する。

#### Step 2: インターフェース更新判定

- 本タスクは `.gitattributes` のパターン変更のみで、API / 型 / 定数 / 設定値の追加は **なし**。
- 判定: **N/A（新規インターフェース追加なし）**
- `system-spec-update-summary.md` に「Step 2 は N/A、理由: `.gitattributes` の glob パターン精緻化のみで公開インターフェースに影響しない」と明記する。

**期待される成果物**:

- `outputs/phase-12/system-spec-update-summary.md`

### Task 3: ドキュメント更新履歴生成

**目的**: 変更ファイル一覧と validator 実行結果を機械生成し、planned wording を残さない確定版として保存する。

**実行手順**:

1. `node scripts/generate-documentation-changelog.js` を実行する。
2. 出力に Phase 12 の全成果物パスが含まれていることを確認する。
3. mirror parity（`.claude/` と `.agents/` の同期）が validator で OK と判定されていることを確認する。

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

### Task 4: 未タスク検出レポート（0 件でも出力必須）

**目的**: 本タスクで閉じない事項を formalize し、後続タスク化候補を明文化する。

**実行手順**:

1. 以下 3 候補を検出候補として評価し、`unassigned-task-detection.md` に記録する（採否は理由付きで判断）。
   - **候補 A**: `setup-merge-drivers.sh` の自動実行化（`session-init.sh` 連携で初回 clone 時に自動登録）
   - **候補 B**: `references/` 配下の新規ファイル追加時に分類カテゴリ（append-only / 構造化）を Markdown front-matter で宣言する規約
   - **候補 C**: `.gitattributes` の lint スクリプト整備（pattern 重複・順序・mirror parity の自動検査）
2. 採用判定したものは `unassigned-task/` 配下への起票候補として task_id 命名案を併記する。
3. `current`（今回新規に検出したもの）と `baseline`（既知の非ゴール / 継続監視項目）を分離して記録する。
4. 0 件採用となった場合も `unassigned-task-detection.md` を必ず出力する（「採用 0 件、検討経緯のみ記録」）。

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`

### Task 5: スキルフィードバックレポート（改善点なしでも出力必須）

**目的**: `task-specification-creator` / `aiworkflow-requirements` スキルへの改善提案を残し、プロセス改善ループを駆動する。

**実行手順**:

1. 以下 2 観点を評価し、`skill-feedback-report.md` に記録する。
   - **テンプレート改善**: マージ戦略系（`.gitattributes` / hooks）タスク向けテンプレートが不在 → 本タスクをモデルケースとして追加候補とする
   - **ワークフロー改善**: NON_VISUAL タスクで Phase 11 のシミュレーションテスト形式（一時 git リポジトリでの挙動再現）が標準化されていない → MT-01〜MT-05 形式の汎用化を提案
2. 改善点なしの場合も「観点 X は改善余地なし」と明記して必ず出力する。

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`

### Task 6: Phase 12 準拠チェック

**目的**: Task 1〜5 の全成果物が `task-specification-creator` の Phase 12 仕様に準拠していることを root evidence として残す。

**実行手順**:

1. 6 成果物が `outputs/phase-12/` 配下に存在することを確認する。
2. 各成果物のファイル名・必須セクション・記載内容を Phase 12 テンプレートと突合する。
3. Step 1-A〜1-C 実施 / Step 2 判定 / 視覚証跡 NON_VISUAL 表記の 3 点を確認する。
4. 結果を `phase12-task-spec-compliance-check.md` に記録する。

**期待される成果物**:

- `outputs/phase-12/phase12-task-spec-compliance-check.md`

## 参照資料

| 参照資料                       | パス                                                                             | 内容                          |
| ------------------------------ | -------------------------------------------------------------------------------- | ----------------------------- |
| Phase 12 テンプレート          | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` | 6 成果物仕様                  |
| Phase 11 手動テスト結果        | `outputs/phase-11/manual-test-result.md`                                         | NON_VISUAL evidence           |
| Phase 10 最終レビュー結果      | `outputs/phase-10/final-review-result.md`                                        | 判定根拠                      |
| Phase 5 実装サマリー           | `outputs/phase-5/implementation-summary.md`                                      | `.gitattributes` 修正要約     |
| `aiworkflow-requirements` LOGS | `.claude/skills/aiworkflow-requirements/LOGS.md`                                 | Step 1-A 同期対象（一次）     |
| `aiworkflow-requirements` LOGS | `.agents/skills/aiworkflow-requirements/LOGS.md`                                 | Step 1-A 同期対象（mirror）   |
| topic-map                      | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                    | same-wave 整理                |
| 関連完了タスク                 | TASK-CONFLICT-PREVENT-001                                                        | Step 1-C リンク双方向更新対象 |
| 元 Issue                       | <https://github.com/daishiman/AIWorkflowOrchestrator/issues/2281>                | 背景                          |

## 成果物

| 成果物                       | パス                                                     | 内容                                         |
| ---------------------------- | -------------------------------------------------------- | -------------------------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Part 1 中学生レベル + Part 2 技術者レベル    |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C 完了 + Step 2 = N/A            |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | validator 実行結果 + 変更ファイル一覧        |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | 候補 A / B / C の採否判定                    |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | テンプレート改善 + ワークフロー改善の 2 観点 |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 6 成果物の準拠判定 root evidence             |

## 統合テスト連携【必須】

| 判定項目                                                          | 基準 | 結果    |
| ----------------------------------------------------------------- | ---- | ------- |
| Task 1 実装ガイドが Part 1 / Part 2 の 2 部構成で揃っている       | 完了 | pending |
| Task 1 視覚証跡セクションに NON_VISUAL 明記と代替証跡参照がある   | 完了 | pending |
| Task 2 Step 1-A の 2 系統 LOGS.md 同期が完了している              | 完了 | pending |
| Task 2 Step 1-B / 1-C / Step 2 = N/A 判定が記録されている         | 完了 | pending |
| Task 3 documentation changelog が generator 実行で生成されている  | 完了 | pending |
| Task 4 未タスク検出レポートが採用 0 件でも出力されている          | 完了 | pending |
| Task 5 スキルフィードバックレポートが改善点なしでも出力されている | 完了 | pending |
| Task 6 Phase 12 準拠チェックが 6 成果物全てを判定している         | 完了 | pending |

## 完了条件

- [ ] Task 1〜6 の 6 成果物が `outputs/phase-12/` 配下に揃っている
- [ ] 実装ガイド Part 1 に「お家の引っ越し」「メモ」の例え話が含まれている
- [ ] 実装ガイド Part 2 に `merge=union` / `merge=ours` / `git check-attr` / `setup-merge-drivers.sh` / 再評価フローが記載されている
- [ ] 視覚証跡セクションに NON_VISUAL 明記と代替証跡（`phase-10/final-review-result.md`、`phase-11/manual-test-result.md`）参照がある
- [ ] Step 1-A で 2 系統 LOGS.md（`.claude/` / `.agents/`）の同期と topic-map same-wave 更新が完了している
- [ ] Step 1-B で実装状況テーブルが `完了` に更新されている
- [ ] Step 1-C で TASK-CONFLICT-PREVENT-001 への双方向リンクが追記されている
- [ ] Step 2 が N/A 判定として理由付きで記録されている
- [ ] documentation changelog が generator で生成され mirror parity OK と判定されている
- [ ] 未タスク検出レポートに候補 A / B / C の採否判定が記録されている
- [ ] スキルフィードバックレポートにテンプレート改善・ワークフロー改善の 2 観点が記録されている
- [ ] Phase 12 準拠チェックが root evidence として残されている
