# Phase 12: ドキュメント整備

## メタ情報

| 項目       | 内容                                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Phase      | 12                                                                                                     |
| タスクID   | TASK-LOGS-ARCHIVE-POLICY-001                                                                           |
| 機能名     | LOGS.md アーカイブポリシー詳細化                                                                       |
| 前提Phase  | Phase 1, Phase 2, Phase 3（Phase 4-11 は本タスクでは文書整備主体のため軽量運用）                       |
| 後続Phase  | Phase 13                                                                                               |
| 作成日     | 2026-04-19                                                                                             |
| Issue      | [#2282](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282)（CLOSED・本仕様書作成は継続） |
| ブランチ   | `docs/task-spec-TASK-LOGS-ARCHIVE-POLICY-001`                                                          |
| ステータス | completed                                                                                              |

## 目的

`TASK-LOGS-ARCHIVE-POLICY-001` の最終ドキュメント整備フェーズとして、Phase 2 で
確定したアーカイブポリシー（閾値 300 行 / 30 KB / 月次、パス規則 `logs-archive-YYYY-MM.md`）
を実文書に落とし込み、`aiworkflow-requirements` スキルの 3 インデックス（`quick-reference`
/ `topic-map` / `resource-map`）へ反映し、完了ドキュメントとして `completed-tasks/`
配下への移管手順まで含めてクローズ可能な状態に整える。
また、本タスクが文書整備タスクである特性上、Phase 12 では **中学生レベルの概念説明**
を正本ポリシー文書および本 Phase 12 文書の冒頭付近に必須で含める。

## 中学生レベル概念説明（必須セクション）

task-specification-creator skill の規定により、Phase 12 では専門知識のない読者（中学生レベル）
でも理解できる平易な説明を含める必要がある。本タスクのキー概念を以下のとおり解説する。

### Q1. LOGS.md とは何か？

LOGS.md とは、各スキル（Claude Code のスキル）が「何をいつどう動いたか」を
記録しておくメモ帳のようなファイルである。スキルが新しくなったり、ルールが変わったり、
問題が見つかったりするたびに、日記のようにそのファイルへ追記していく。

- **例**: スキル「task-specification-creator」には
  `.claude/skills/task-specification-creator/LOGS.md` があり、そこに「2026-03-15 にルール A を
  追加した」「2026-04-01 にバグ B を修正した」といった記録が積み重なっている。
- **役割**: あとでスキルの挙動を振り返るときに、このメモを見れば過去の変更履歴がすぐ分かる。

### Q2. アーカイブとは何か？

ノートがどんどん太くなって開くのが大変になったら、古いページを別のノートに移して、
いま使うノートを薄く保つ — これが「アーカイブ」である。

- **対象**: LOGS.md（現役メモ帳）
- **移し先**: `logs-archive-YYYY-MM.md`（月ごとの別ファイル）
- **残すもの**: LOGS.md には最近のログだけ残し、古いログは年月名のファイルに移動する
- **例え**: 夏休みの日記帳が厚くなりすぎたら、「7 月」「8 月」と月ごとのファイルに分けるイメージ

### Q3. なぜ統一ポリシーが必要なのか？

スキルごとに「いつアーカイブするか」「移し先のファイル名はどうするか」がバラバラだと、
以下のような困りごとが起きる：

1. **Git マージが衝突しやすい**: 同じ LOGS.md を複数人が同時に編集すると、
   どこをどう統合するか毎回迷う。ファイルが大きいほど衝突も増える。
2. **後から探しにくい**: スキルごとにファイル名が違うと、「2026 年 3 月のログはどこ？」
   と聞かれても答えられない。
3. **mirror（`.agents/` への写し）が壊れやすい**: `.claude/` と `.agents/` の両方に
   同じ内容を保つ仕組みがあるが、命名がバラバラだと同期ミスに気づきにくい。

そのため本タスクでは、全スキル共通で
「**300 行超・30 KB 超・月次** のいずれかを満たしたら、`logs-archive-YYYY-MM.md`
という名前で同じフォルダにアーカイブする」という統一ルールを文書化する。

### 用語まとめ表

| 用語                        | やさしい意味                                                  |
| --------------------------- | ------------------------------------------------------------- |
| LOGS.md                     | スキルの「日記帳」。変更履歴をためていくファイル              |
| アーカイブ                  | 古い日記帳のページを別のノートへ移して、現役を薄く保つ操作    |
| `logs-archive-YYYY-MM.md`   | 移し先ファイルの決まった名前（例: `logs-archive-2026-04.md`） |
| 閾値                        | 「これを超えたらアーカイブする」という目安の値                |
| mirror                      | `.claude/` のファイルを `.agents/` にもそっくり写すしくみ     |
| topic-map / quick-reference | 「どこに何があるか」を探すための目次ファイル                  |

## 実行タスク

1. 正本ポリシー文書 `logs-archive-policy.md` の執筆（Phase 2 D-1〜D-4 の内容を反映）
2. `.agents/` 側 mirror ファイルへの同期手順記述
3. `aiworkflow-requirements` スキルの 3 インデックス更新
   - `indexes/topic-map.md`
   - `indexes/quick-reference.md`
   - `indexes/resource-map.md`
4. `CHANGELOG.md` 追記（プロジェクトルート、または対象が存在する場合は `aiworkflow-requirements` 配下）
5. 関連タスクへのクロスリファレンス記述
6. 完了ドキュメントとして `docs/30-workflows/completed-tasks/logs-archive-policy-001/` への移管手順整理
7. Phase 13 への引き継ぎ情報整備

## canonical 6成果物

| Task      | 成果物                     | パス                                                     |
| --------- | -------------------------- | -------------------------------------------------------- |
| Task 12-1 | implementation guide       | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | documentation changelog    | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | unassigned-task detection  | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | compliance check           | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

## 参照資料

| 資料名                             | パス                                                                              | 用途                  |
| ---------------------------------- | --------------------------------------------------------------------------------- | --------------------- |
| Phase 1 要件                       | `docs/30-workflows/logs-archive-policy-001/phase-1-requirements.md`               | 計測データ・背景      |
| Phase 2 設計                       | `docs/30-workflows/logs-archive-policy-001/phase-2-design.md`                     | D-1〜D-4 決定事項     |
| Phase 3 設計レビュー               | `docs/30-workflows/logs-archive-policy-001/phase-3-design-review.md`              | F-001〜F-005 指摘事項 |
| Issue #2282                        | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282                   | 要件原本（CLOSED）    |
| aiworkflow-requirements SKILL.md   | `.claude/skills/aiworkflow-requirements/SKILL.md`                                 | 正本スキル本体        |
| topic-map                          | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                     | 参照追加先            |
| quick-reference                    | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`               | 参照追加先            |
| resource-map                       | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                  | 参照追加先            |
| 既存月次アーカイブ（feb）          | `.claude/skills/task-specification-creator/references/logs-archive-2026-feb.md`   | legacy 表記例         |
| 既存月次アーカイブ（march）        | `.claude/skills/task-specification-creator/references/logs-archive-2026-march.md` | legacy 表記例         |
| 既存インデックス                   | `.claude/skills/task-specification-creator/references/logs-archive-index.md`      | インデックス既存形式  |
| TASK-CONFLICT-PREVENT-001 成果物   | `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/`                  | 前提タスク（発火源）  |
| task-specification-creator logs 群 | `.claude/skills/task-specification-creator/references/logs-archive-*.md`          | クロスリファレンス先  |

## 実行手順

### 1. 正本ポリシー文書の作成

作成先: `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`

Phase 2 の D-1〜D-4 を踏まえ、以下 6 セクションを必須で含める。

| セクション            | 記載内容                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------- | --------------- |
| 1. 適用範囲           | `.claude/skills/*/LOGS.md` および `.agents/skills/*/LOGS.md`、除外対象                   |
| 2. アーカイブ閾値     | 300 行超 / 30 KB 超 / 月次（OR 条件）                                                    |
| 3. archive 先パス規則 | `logs-archive-YYYY-MM.md`（同一ディレクトリ配置、正規表現 `^logs-archive-\d{4}-(0[1-9]   | 1[0-2])\.md$`） |
| 4. アーカイブ手順     | 6 ステップ（閾値検知 → ログ抽出 → アーカイブ追記 → 元ログ削除 → mirror sync → 動作確認） |
| 5. 運用ルール         | 見直しサイクル 6 か月・最終更新日明記・判定タイミング（毎月初に前月分評価）              |
| 6. 参照               | task-specification-creator 既存 logs-archive-\*.md 群へのリンク                          |

さらに Phase 3 の Findings 対応として以下を追記：

- **F-001**: legacy 表記（`logs-archive-2026-feb.md`, `logs-archive-2026-march.md`）は
  そのまま残置し、新規は数値月 YYYY-MM 形式で統一する旨を明記
- **F-003**: 判定タイミングは「毎月初の第 1 営業日に前月分を評価」と固定
- **F-004**: 最終更新日と次回見直し予定日（+ 6 か月後）をポリシー文書冒頭に記載
- **F-005**: ポリシー違反検知時のエスカレーション先を明記（まず自動検知スクリプト or レビュワー、
  未解決なら Issue として `labels: skills, logs-archive` で起票）
- **NON_VISUAL 視覚証跡**: `## 視覚証跡` セクションに
  `UI/UX変更なしのため Phase 11 スクリーンショット不要` と明記する

### 2. mirror ファイルの同期

作成先: `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md`

- `.claude/` 正本と完全同一内容で作成
- `diff .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` で差分ゼロを検証
- TASK-CONFLICT-PREVENT-001 の mirror sync 機構が `references/` を対象にしていることを
  Phase 3 R-3 の REQUIRES VERIFICATION 事項として再確認し、結果を本 Phase 文書末尾に記録

### 3. 3 インデックスへの反映

#### 3.1 `indexes/topic-map.md`

```markdown
- [logs-archive-policy.md](../references/logs-archive-policy.md) — LOGS.md アーカイブ閾値（300 行 / 30 KB / 月次）・パス規則（logs-archive-YYYY-MM.md）・手順の正本ポリシー
```

配置カテゴリ: 既存の「運用・ログ管理」セクション（無ければ新設）

#### 3.2 `indexes/quick-reference.md`

```markdown
| logs-archive-policy | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` | LOGS.md アーカイブ閾値・パス規則・手順 | TASK-LOGS-ARCHIVE-POLICY-001 |
```

- カラム形式は既存エントリに合わせる
- キーワード欄に「logs, archive, 300行, 30KB, logs-archive-YYYY-MM」を含める

#### 3.3 `indexes/resource-map.md`

- `references/` カテゴリに `logs-archive-policy.md` を追加
- 関連タスク欄に TASK-LOGS-ARCHIVE-POLICY-001 / TASK-CONFLICT-PREVENT-001 を列挙

### 4. CHANGELOG.md 追記

追記先候補：

| 候補                                                                  | 追記内容                                                                                                       |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| プロジェクトルート `CHANGELOG.md`（存在する場合）                     | `### docs\n- TASK-LOGS-ARCHIVE-POLICY-001: LOGS.md アーカイブポリシー統一文書化（#2282）`                      |
| `.claude/skills/aiworkflow-requirements/CHANGELOG.md`（存在する場合） | 同上の略記＋正本パス記載                                                                                       |
| `.claude/skills/aiworkflow-requirements/LOGS.md`                      | `2026-04-19: TASK-LOGS-ARCHIVE-POLICY-001 logs-archive-policy.md を references/ 追加・topic-map 反映（#2282）` |

いずれも存在しない場合は LOGS.md 追記のみ行い、CHANGELOG 新規作成はスコープ外とする。

### 4.5 Step 1 / Step 2 の境界

- **Step 1-A〜1-G**: 完了記録、関連ドキュメント、LOGS、index 再生成、validator 実行を記録する
- **Step 2**: interface / API / architecture の新規変更がないため、今回は
  `aiworkflow-requirements` の domain spec 追加更新は **no-op judgment** として記録する
- 判断根拠は `system-spec-update-summary.md` と `documentation-changelog.md` の両方へ残す

### 5. 関連タスクへのクロスリファレンス

ポリシー文書の「6. 参照」セクションおよび本 Phase 12 文書の末尾に以下を明記：

- **TASK-CONFLICT-PREVENT-001**: 本タスクの発火源（`unassigned-task-detection.md` が起点）。
  mirror sync 機構を本タスクで利用する。
  - 参照先: `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/`
- **task-specification-creator の logs-archive-\*.md 群**: 命名規則と月次運用実績の先例
  - `.claude/skills/task-specification-creator/references/logs-archive-2026-feb.md`
  - `.claude/skills/task-specification-creator/references/logs-archive-2026-march.md`
  - `.claude/skills/task-specification-creator/references/logs-archive-index.md`
  - `.claude/skills/task-specification-creator/references/logs-archive-legacy.md`

### 6. 完了ドキュメント移管手順

本タスクのクローズ時には、`docs/30-workflows/logs-archive-policy-001/` 一式を
`docs/30-workflows/completed-tasks/logs-archive-policy-001/` へ移管する。

#### 移管条件（すべて満たした時に実施）

1. Phase 13 の PR がマージ済み
2. 正本ポリシー文書と mirror が `diff` で差分ゼロ
3. 3 インデックス更新が反映済み（`grep logs-archive-policy` で検出可能）
4. Issue #2282 が CLOSED 状態（既に CLOSED のため現時点で満たす）

#### 移管コマンド例（ユーザー承認後に実施）

```bash
# 移管先ディレクトリ作成
mkdir -p docs/30-workflows/completed-tasks/logs-archive-policy-001

# git mv で履歴を保持して移管
git mv docs/30-workflows/logs-archive-policy-001/*.md \
       docs/30-workflows/completed-tasks/logs-archive-policy-001/

# 移管結果確認
ls docs/30-workflows/completed-tasks/logs-archive-policy-001/
```

移管自体は Phase 13 の PR には含めず、クローズ後の別コミットで実施する
（completed-tasks 移管は本タスク後続の運用作業として分離）。

## 受け入れ基準（AC）

| ID   | 受け入れ基準                                                                                                      | 検証方法                                                               |
| ---- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| AC-1 | 正本 `logs-archive-policy.md` が 6 セクション + F-001/F-003/F-004/F-005 対応を含む                                | ファイル存在 + セクション見出し grep                                   |
| AC-2 | mirror `.agents/skills/.../logs-archive-policy.md` が正本と `diff` ゼロ                                           | `diff` コマンドで差分ゼロ                                              |
| AC-3 | topic-map / quick-reference / resource-map の 3 インデックスに `logs-archive-policy` 参照が追加されている         | `grep logs-archive-policy indexes/*.md` で 3 ファイル全てヒット        |
| AC-4 | 中学生レベル概念説明セクションが Phase 12 文書内に必須項目として含まれる                                          | 本 Phase 12 文書の「中学生レベル概念説明」セクション存在確認           |
| AC-5 | 関連タスク（TASK-CONFLICT-PREVENT-001、task-specification-creator logs 群）へのクロスリファレンスが記載されている | ポリシー文書「6. 参照」および本 Phase 12 「5. 関連タスク」節の記載確認 |
| AC-6 | CHANGELOG.md / LOGS.md のいずれかへ追記済み                                                                       | 追記箇所の存在確認                                                     |
| AC-7 | completed-tasks 移管手順が記述されている                                                                          | 「6. 完了ドキュメント移管手順」節の記載確認                            |
| AC-8 | Phase 13 への引き継ぎ事項が明示されている                                                                         | 末尾「Phase 13 への引き継ぎ」節の記載確認                              |

## スコープ

### 含むもの

- 正本ポリシー文書 `logs-archive-policy.md` の執筆
- mirror ファイル同期と差分ゼロ確認
- `aiworkflow-requirements` 3 インデックス更新
- CHANGELOG / LOGS 追記
- 関連タスクへのクロスリファレンス記述
- completed-tasks 移管手順の記述

### 含まないもの

- アーカイブ自動化スクリプトの実装（別タスク）
- 既存 LOGS.md への遡及アーカイブ実行（別タスク）
- completed-tasks 移管そのものの実行（Phase 13 後の運用作業として分離）
- `.claude/CLAUDE.md` や他スキルの SKILL.md 本体改修（スコープ外）
- mirror sync 機構自体の改修（TASK-CONFLICT-PREVENT-001 範疇）

## リスクと対策

| リスク                                               | 影響度 | 対策                                                                               |
| ---------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| mirror sync が `references/` 配下を同期しない        | 中     | 手動コピーで同一性を確保し、Phase 3 R-3 の REQUIRES VERIFICATION を本 Phase で決着 |
| 3 インデックスのうち 1 つでも参照追加漏れ            | 中     | AC-3 で 3 ファイル全ヒットを検証条件にする                                         |
| 中学生レベル説明が技術用語に偏る                     | 低     | 用語まとめ表と Q&A 形式で平易化、専門用語は初出時に補足                            |
| legacy 表記（feb/march）と新規表記の共存ルールが曖昧 | 中     | ポリシー文書 F-001 対応節で明示、既存ファイルは改名しない方針を固定                |
| Issue #2282 が既に CLOSED のため追跡先が不明瞭       | 低     | Phase 13 で `Refs #2282` により言及し、新規 Issue は起票しない                     |
| completed-tasks 移管を Phase 13 と混同               | 低     | 本 Phase 12 で「Phase 13 後の運用作業」と分離明記                                  |

## Phase 13 への引き継ぎ

- 成果物一覧（下記「成果物」表）
- コミット対象パスリスト
  - `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`
  - `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md`
  - `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
  - `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`
  - `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`
  - `docs/30-workflows/logs-archive-policy-001/phase-1-requirements.md`
  - `docs/30-workflows/logs-archive-policy-001/phase-2-design.md`
  - `docs/30-workflows/logs-archive-policy-001/phase-3-design-review.md`
  - `docs/30-workflows/logs-archive-policy-001/phase-12-documentation.md`
  - `docs/30-workflows/logs-archive-policy-001/phase-13-pr-creation.md`
  - （存在すれば）CHANGELOG.md / LOGS.md 追記分
- Issue #2282 は CLOSED 状態だが PR 本文に `Refs #2282` で言及する（Close は不要）
- `--no-verify` は禁止（CLAUDE.md 規定）
- push / PR 作成はユーザー明示指示があるまで実行しない

## 成果物

| 成果物                      | パス                                                                       | 種別     |
| --------------------------- | -------------------------------------------------------------------------- | -------- |
| 正本ポリシー文書            | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 新規作成 |
| mirror ポリシー文書         | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 新規作成 |
| topic-map 更新              | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`              | 既存更新 |
| quick-reference 更新        | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`        | 既存更新 |
| resource-map 更新           | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`           | 既存更新 |
| CHANGELOG / LOGS 追記       | プロジェクトルートまたは aiworkflow-requirements 配下                      | 既存更新 |
| Phase 12 文書（本ファイル） | `docs/30-workflows/logs-archive-policy-001/phase-12-documentation.md`      | 新規作成 |

## 完了条件

- [ ] 正本ポリシー文書が 6 セクション + Findings 対応を含めて作成済み
- [ ] mirror ポリシー文書が正本と差分ゼロ
- [ ] 3 インデックス全てに参照追加済み
- [ ] CHANGELOG / LOGS への追記完了
- [ ] クロスリファレンス記述完了
- [ ] completed-tasks 移管手順記述完了
- [ ] Phase 13 引き継ぎ情報記述完了
- [ ] 中学生レベル概念説明セクション記載済み
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] Phase 2 D-1〜D-4 と Phase 3 F-001〜F-005 対応状況を明記
- [ ] 中学生レベル説明が技術者外にも伝わるレベルで記述済み
- [ ] 実行記録を残した

## 次 Phase

Phase 13: PR 作成（push/PR 作成はユーザー明示指示があるまで実行しない）
