# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 12                                                             |
| タスクID   | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001          |
| 機能名     | Phase 11 テスト証跡の一本化テンプレート整備（edge case一覧表） |
| 前提Phase  | Phase 11                                                       |
| 後続Phase  | Phase 13                                                       |
| 作成日     | 2026-04-13                                                     |
| ステータス | pending                                                        |

## 目的

task-specification-creator SKILL.md の「Phase 12 重要仕様」に従い、6タスクを全て完了する。
本タスクは docs-only / `spec_created` タスクであるため、Step 2（新規インターフェース追加）は N/A とし、
Step 1-A〜1-C を same-wave sync で閉じる。

---

## Task 1: 実装ガイド作成（2パート構成）

### Part 1: 中学生レベル概念説明

**なぜテスト証跡を一本化するのか**

---

あなたが学校のテストを受けたとき、答えを書いた後に「なぜその答えにしたのか」を先生に聞かれることはありませんか？

もしメモが何冊にも分かれていて、「理由はノート1に書いた」「件数はノート3に書いた」「特別なケースはルーズリーフに書いた」となっていたら、先生はとても困ります。あなた自身も後から見返すときに「あれどこに書いたっけ？」となってしまいます。

ソフトウェアのテストも同じです。「何件テストしたか」「どんな特別なケースを試したか」「なぜそのルールにしたのか」が別々のファイルに散らばっていると、チームの誰かが後から確認したいときにとても時間がかかります。

**テスト証跡の一本化**とは、このバラバラなメモを「1冊の記録ノート」にまとめることです。

このノートには次の3つが必ず書かれています:

1. **テスト件数と内訳**: 「合計9件。正常系3件、異常系2件、edge case 4件」のように一目でわかる
2. **edge case 一覧表**: 「空白だけを入力したらどうなるか」「すごく長い文字を入力したらどうなるか」など特別なケースの一覧
3. **仕様判断の根拠**: 「空白は空文字として扱う」と決めた理由と、それを決めた会議の記録へのリンク

この3つが1ファイルにあれば、誰でも5分でテストの全体像を把握できます。

---

### Part 2: 技術者レベル（テンプレート構造・使い方）

**テンプレート構造**

```markdown
# Phase 11 手動テスト証跡

## テスト件数と内訳（Summary）

| カテゴリ  | 件数 | 内訳 |
| --------- | ---- | ---- |
| 正常系    | N    | ...  |
| 異常系    | N    | ...  |
| edge case | N    | ...  |
| 合計      | N    | -    |

## edge case 一覧表

| ケースID | 入力値 | 期待動作 | 実際の動作 | 仕様判断根拠 | 判定 |
| -------- | ------ | -------- | ---------- | ------------ | ---- |
| EC-001   | ...    | ...      | ...        | Issue #XXXX  | PASS |

## 仕様判断根拠

| 判断ID | 仕様判断の内容 | 根拠ドキュメント | 決定者/決定日 |
| ------ | -------------- | ---------------- | ------------- |
| SD-001 | ...            | ...              | ...           |
```

**使い方**

1. テスト実行前に「テスト件数と内訳」のカテゴリ列を埋める
2. edge case を実行しながら「実際の動作」列を埋める
3. 仕様判断が必要になったタイミングで「仕様判断根拠」テーブルに追記する
4. 全件完了後に「合計」行の件数が各カテゴリの合計と一致することを確認する

**このテンプレートが解決する問題**

| 問題                                  | 解決方法                                     |
| ------------------------------------- | -------------------------------------------- |
| テスト件数が複数ファイルに分散        | Summary テーブルを冒頭1箇所に集約            |
| edge case の網羅性が不明              | edge case 一覧表で全件を可視化               |
| 仕様判断（空白→空文字等）の根拠が不明 | 仕様判断根拠テーブルで根拠ドキュメントを明示 |

---

## Task 2: システム仕様書更新

### Step 1-A: タスク完了記録

完了タスクとして以下を記録する:

| 項目             | 内容                                                                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001                                                                                                     |
| タイトル         | Phase 11 テスト証跡の一本化テンプレート整備（edge case 一覧表）                                                                                           |
| 関連 Issue       | #2033 (CLOSED)                                                                                                                                            |
| 関連ドキュメント | `docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001/`                                                                                |
| 変更履歴         | Phase 11 manual-test-result テンプレートに edge case 一覧表・仕様判断根拠テーブルを追加。task-specification-creator Phase 11 テンプレートに同構造を反映。 |

更新対象ファイル:

- `references/task-workflow.md` の「完了タスク」セクションにエントリ追加
- `references/task-workflow-completed.md` の completed ledger と `references/task-workflow-completed-recent-2026-04e.md` の recent shard に同一エントリ追加
- `.claude/skills/aiworkflow-requirements/LOGS.md` に変更履歴エントリ追加
- `.agents/skills/aiworkflow-requirements/LOGS.md` に同一エントリ追加
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md` の「テスト証跡」関連エントリを更新

### Step 1-B: 実装状況テーブル更新

本タスクは docs-only / `spec_created` であるため、実装状況テーブルには `spec_created` を記録する（`completed` ではない）。

| タスクID                                              | ステータス更新前 | ステータス更新後 |
| ----------------------------------------------------- | ---------------- | ---------------- |
| UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001 | `pending`        | `spec_created`   |

### Step 1-C: 関連タスクテーブル更新

仕様書内の「関連タスク」テーブルのステータスを current facts へ更新する。

| 関連タスクID   | 更新前ステータス | 更新後ステータス | 備考                                   |
| -------------- | ---------------- | ---------------- | -------------------------------------- |
| Issue #2033    | OPEN             | CLOSED           | 本タスクの元 Issue                     |
| （その他関連） | （記入）         | （記入）         | Phase 12 実行時に current facts を確認 |

### Step 2: 新規インターフェース追加（N/A）

本タスクは docs-only task のため、新規 TypeScript インターフェース・API 仕様の追加はない。
Step 2 は N/A とする。

---

## Task 3: ドキュメント更新履歴作成

```bash
node scripts/generate-documentation-changelog.js \
  --task-id UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001 \
  --output outputs/phase-12/documentation-changelog.md
```

更新履歴エントリ（手動記入）:

| 日付       | バージョン | 変更内容                                                                                       | 変更者   |
| ---------- | ---------- | ---------------------------------------------------------------------------------------------- | -------- |
| 2026-04-13 | v1.0.0     | Phase 11 manual-test-result テンプレート新規作成（edge case 一覧表・仕様判断根拠テーブル追加） | （記入） |
| 2026-04-13 | v1.0.0     | task-specification-creator Phase 11 テンプレートに新構造を反映                                 | （記入） |

---

## Task 4: 未タスク検出レポート（0件でも出力必須）

```bash
node scripts/detect-unassigned-tasks.js \
  --scan docs/30-workflows/UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001 \
  --output outputs/phase-12/.tmp-unassigned-candidates.json
```

検出結果を集約した最終レポートは `outputs/phase-12/unassigned-task-detection.md` とする。

### 検出ソース一覧

| ソース                   | 確認内容                                    | 検出件数 |
| ------------------------ | ------------------------------------------- | -------- |
| 元タスク仕様書           | 「スコープ外」として明示された項目          | （記入） |
| Phase 3/10 レビュー結果  | MINOR 判定の指摘事項                        | （記入） |
| Phase 11 手動テスト      | スコープ外の発見事項・改善提案              | （記入） |
| コードコメント           | TODO/FIXME/HACK/XXX（docs-only のため N/A） | N/A      |
| `describe.skip` ブロック | 旧参照の残存（docs-only のため N/A）        | N/A      |

### 未タスク候補一覧

| 未タスクID                            | 内容 | 優先度 | 対応方針 |
| ------------------------------------- | ---- | ------ | -------- |
| （0件の場合は「検出なし」と明記する） | -    | -      | -        |

> **注記**: 0件であっても本テーブルを省略せず、「検出なし」と明示すること。

---

## Task 5: スキルフィードバックレポート（改善点なしでも出力必須）

### フィードバック記録

| 観点             | 記録内容                                                          | 重大度   |
| ---------------- | ----------------------------------------------------------------- | -------- |
| テンプレート改善 | （Phase 8〜11 を通じて発見した Phase テンプレートの漏れや曖昧さ） | （記入） |
| ワークフロー改善 | （機械検証や手順分岐の改善余地）                                  | （記入） |
| ドキュメント改善 | （再利用しやすい横断ガイドライン化の候補）                        | （記入） |

> **注記**: 改善点がない場合も「改善点なし」と明示して本テーブルを省略しないこと。

### SKILL.md へのフィードバック反映

task-specification-creator SKILL.md の「変更履歴」セクションに以下の形式でエントリを追加する:

```
| **vX.XX.XX** | **2026-04-13** | **UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001 skill-feedback 反映**:
  （フィードバック内容の要約） |
```

同エントリを `.agents/` 側 mirror にも反映する（mirror parity 維持）。

---

## Task 6: Phase 12 準拠チェック（root evidence）

Task 1〜5 と Step 1-A〜1-C / Step 2 の完了状況を 1 ファイルに集約し、skill 準拠・成果物存在・mirror parity を最終確認する。

### チェック観点

| 観点       | 記録内容                                                                                                   | 重大度   |
| ---------- | ---------------------------------------------------------------------------------------------------------- | -------- |
| 準拠確認   | Phase 12 必須タスク・成果物・完了条件との一致                                                              | （記入） |
| 成果物整合 | `outputs/phase-12/` の 6 成果物と `artifacts.json` の一致                                                  | （記入） |
| 監査整合   | `unassigned-task-detection.md` / `documentation-changelog.md` / `system-spec-update-summary.md` の相互整合 | （記入） |
| 追加注意   | planned wording の残存有無、task-workflow 同期、topic-map 再生成結果                                       | （記入） |

**出力**: `outputs/phase-12/phase12-task-spec-compliance-check.md`

---

## 実行タスク

1. Task 1 Part 1: 中学生レベルの概念説明を作成する
2. Task 1 Part 2: 技術者レベルのテンプレート構造・使い方を作成する
3. Task 2 Step 1-A: タスク完了記録を各ファイルに追記する（LOGS.md x2・topic-map.md）
4. Task 2 Step 1-B: 実装状況テーブルを `spec_created` に更新する
5. Task 2 Step 1-C: 関連タスクテーブルを current facts へ更新する
6. Task 3: ドキュメント更新履歴を作成する
7. Task 4: 未タスク検出レポートを出力する（0件でも出力必須）
8. Task 5: スキルフィードバックレポートを出力し、SKILL.md に反映する（改善点なしでも出力必須）
9. Task 6: Phase 12 準拠チェックを出力する（root evidence）

## 成果物

| 成果物                        | パス                                                     | 説明                                      |
| ----------------------------- | -------------------------------------------------------- | ----------------------------------------- |
| 実装ガイド（Part 1 + Part 2） | `outputs/phase-12/implementation-guide.md`               | 中学生レベル概念説明 + 技術者レベル詳細   |
| システム仕様更新要約          | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A/1-B/1-C の更新内容記録           |
| ドキュメント更新履歴          | `outputs/phase-12/documentation-changelog.md`            | 変更履歴エントリ                          |
| 未タスク検出レポート          | `outputs/phase-12/unassigned-task-detection.md`          | 0件でも出力必須                           |
| スキルフィードバックレポート  | `outputs/phase-12/skill-feedback-report.md`              | 改善点なしでも出力必須                    |
| 準拠チェックレポート          | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 1〜5 / Step 1-A〜1-C / Step 2 の集約 |

## 完了条件

- [ ] Task 1: 実装ガイドが Part 1（中学生レベル）・Part 2（技術者レベル）の2パート構成で作成されていること
- [ ] Task 2: Step 1-A のタスク完了記録が完了し、LOGS.md x2・topic-map.md が更新されていること
- [ ] Task 2: Step 1-B の実装状況テーブルが `spec_created` に更新されていること
- [ ] Task 2: Step 1-C の関連タスクテーブルが current facts へ更新されていること
- [ ] Task 3: ドキュメント更新履歴が作成されていること
- [ ] Task 4: 未タスク検出レポートが出力されていること（0件でも「検出なし」と明記）
- [ ] Task 5: スキルフィードバックレポートが出力されていること（改善点なしでも「改善点なし」と明記）
- [ ] Task 5: SKILL.md（`.claude/` と `.agents/` 両方）に変更履歴エントリが追加されていること
- [ ] Task 6: 準拠チェックレポートが出力されていること（root evidence）
- [ ] Task 6: `outputs/phase-12/phase12-task-spec-compliance-check.md` が生成され、Task 1〜5 / Step 1-A〜1-C / Step 2 の準拠結果が記録されていること
- [ ] `outputs/phase-12` の必須6成果物実体と `artifacts.json` の `status=spec_created` が同期している
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. Task 1 Part 1 作成
2. Task 1 Part 2 作成
3. Task 2 Step 1-A 実行
4. Task 2 Step 1-B 実行
5. Task 2 Step 1-C 実行
6. Task 3 実行
7. Task 4 実行
8. Task 5 実行
9. Task 6 実行
10. 成果物の存在確認と完了条件判定

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次の Phase

Phase 13: PR 作成
