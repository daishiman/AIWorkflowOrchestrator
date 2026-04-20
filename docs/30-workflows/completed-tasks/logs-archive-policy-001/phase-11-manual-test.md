# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 11                               |
| タスクID   | TASK-LOGS-ARCHIVE-POLICY-001     |
| 機能名     | LOGS.md アーカイブポリシー詳細化 |
| 前提Phase  | Phase 10                         |
| 後続Phase  | Phase 12                         |
| 作成日     | 2026-04-19                       |
| ステータス | completed                        |

## 本タスクにおける手動テストの位置づけ

本タスクは **文書作成のみで実装コード変更を伴わない**。そのため、
Phase 11 の手動テストは UI の見た目確認や Electron 実画面の検証ではなく、
以下の **文書運用シミュレーション**として実施する。

- 別 worktree でブランチを checkout し、ポリシー文書が両パス（`.claude/` と `.agents/`）に存在することを目視確認
- 架空のダミー `LOGS.md`（規定サイズ超過ケース）を手元に用意し、ポリシー文書に従って閾値判定とパス命名規則の解釈が一意に決まることを確認
- ポリシー文書記載のエスカレーションフローを読み合わせ、実行可能性（担当者・連絡手段・フォールバック）に曖昧性がないことを確認

**スクリーンショットは不要**（文書のみのタスクのため UI 表示対象が存在しない）。
一次証跡は `outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md` とする。
`implementation-guide.md` の `## 視覚証跡` には
`UI/UX変更なしのため Phase 11 スクリーンショット不要` と明記する。

## 目的

Phase 10 まででポリシー文書が成果物として確定した後、別 worktree 環境で checkout
→ 文書存在確認 → 閾値判定の読み合わせ → エスカレーションフローの読み合わせ
という手動運用シミュレーションを実施し、ポリシーが運用担当者（人 / AI エージェント）に
とって一意に解釈可能で、かつ実行可能であることを最終確認する。

## 実行タスク

- 別 worktree でタスクブランチを checkout
- ポリシー文書が `.claude/` / `.agents/` 両パスに存在することの目視確認
- ダミー `LOGS.md` を用いた閾値判定シミュレーション（行数・サイズ・月次）
- パス命名規則（`logs-archive-YYYY-MM.md`）の適用確認
- エスカレーションフローの読み合わせ確認
- 手動テスト結果の記録（`outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md`）

## 参照資料

| 資料名                       | パス                                                                       | 用途                       |
| ---------------------------- | -------------------------------------------------------------------------- | -------------------------- |
| Phase 10 最終レビュー        | `docs/30-workflows/logs-archive-policy-001/phase-10-final-review.md`       | 最終レビュー結果の引継ぎ   |
| Phase 9 品質保証             | `docs/30-workflows/logs-archive-policy-001/phase-9-quality-assurance.md`   | 品質ゲート通過の前提       |
| ポリシー文書（正本）         | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 読み合わせ対象             |
| ポリシー文書（mirror）       | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 読み合わせ対象             |
| topic-map.md                 | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`              | 参照追加の確認             |
| 既存 logs-archive-\*.md 実例 | `.claude/skills/task-specification-creator/references/logs-archive-*.md`   | 命名規則の legacy/新規比較 |

## 事前準備

- Phase 10 が PASS 判定済みであること
- タスクブランチがローカルまたはリモートで参照可能であること
- 別 worktree を作成できる状態（`git worktree add` が実行可能）であること

> 注意: worktree の**削除は明示的なユーザー許可なしに行わない**。本 Phase では作成と
> checkout のみ行い、削除はユーザー確認後に別途実施する。

## 実行手順

### 1. 別 worktree でタスクブランチを checkout

```bash
# メインリポジトリ側で別 worktree を作成（ブランチ名は実環境に合わせる）
git worktree add \
  ../task-20260419-175507-wt-4-verify \
  <task-branch-name>

cd ../task-20260419-175507-wt-4-verify
```

### 2. ポリシー文書が両パスに存在することの目視確認

```bash
# 正本の存在確認
ls -la .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md

# mirror の存在確認
ls -la .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md

# 両者の同一性確認
diff \
  .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
  .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md
# 期待: exit 0（差分なし）

# topic-map.md への参照エントリ確認
rg -n "logs-archive-policy" \
  .claude/skills/aiworkflow-requirements/indexes/topic-map.md
# 期待: 1 行以上ヒット
```

**記録**: `outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md` に「正本 / mirror / topic-map 参照の 3 点存在を目視確認済み」と明記。

### 3. ダミー LOGS.md を用いた閾値判定シミュレーション

ポリシー文書記載の閾値（行数 300 行超 / サイズ 30 KB 超 / 月次）が、
現実の `LOGS.md` に対して一意に判定できるかを手元で検証する。

#### 3-1. ダミーファイルの用意（一時ディレクトリ）

```bash
# 作業用一時ディレクトリ（コミット対象外）
mkdir -p /tmp/logs-archive-policy-verify && cd /tmp/logs-archive-policy-verify

# ケース A: 行数超過（350 行・20 KB 相当）
python3 -c "print('\n'.join([f'- 2026-03-{(i%30)+1:02d}: sample log entry {i}' for i in range(350)]))" \
  > LOGS-caseA.md

# ケース B: サイズ超過（200 行・約 35 KB）
python3 -c "print('\n'.join(['- sample log with long description '+ 'x'*150 for _ in range(200)]))" \
  > LOGS-caseB.md

# ケース C: 月次のみ該当（150 行・15 KB、先月分含む）
python3 -c "print('\n'.join([f'- 2026-03-{(i%28)+1:02d}: short entry {i}' for i in range(150)]))" \
  > LOGS-caseC.md

# ケース D: 閾値すべて未達（対象外）
python3 -c "print('\n'.join([f'- 2026-04-{(i%19)+1:02d}: entry {i}' for i in range(50)]))" \
  > LOGS-caseD.md

# 計測
wc -l LOGS-case*.md
wc -c LOGS-case*.md
```

#### 3-2. 閾値判定の読み合わせ

ポリシー文書を開きながら、各ケースでアーカイブすべきか否かを判定する。

| ケース | 行数   | サイズ   | 期間条件           | ポリシー判定（期待）                | 実判定     |
| ------ | ------ | -------- | ------------------ | ----------------------------------- | ---------- |
| A      | 350 行 | 約 20 KB | 当月               | **archive 対象**（行数 300 行超）   | 手動で記録 |
| B      | 200 行 | 約 35 KB | 当月               | **archive 対象**（サイズ 30 KB 超） | 手動で記録 |
| C      | 150 行 | 約 15 KB | 先月分のログを含む | **archive 対象**（月次判定）        | 手動で記録 |
| D      | 50 行  | 約 3 KB  | 当月               | **archive 対象外**（全閾値未達）    | 手動で記録 |

**記録**: 各ケースの期待判定と実判定が一致することを task 固有 report に表形式で記載。

#### 3-3. パス命名規則の適用確認

ケース A・B・C に対し、ポリシー文書記載のパス規則を適用した場合のファイル名が一意に決まることを確認する。

| ケース | 対象期間 | 期待されるアーカイブ先パス                                                | 実適用     |
| ------ | -------- | ------------------------------------------------------------------------- | ---------- |
| A      | 2026-03  | `.claude/skills/<skill>/logs-archive-2026-03.md`（mirror: `.agents/...`） | 手動で記録 |
| B      | 2026-04  | `.claude/skills/<skill>/logs-archive-2026-04.md`（mirror: `.agents/...`） | 手動で記録 |
| C      | 2026-03  | `.claude/skills/<skill>/logs-archive-2026-03.md`（既存があれば末尾追記）  | 手動で記録 |

**確認事項**:

- ファイル名が `^logs-archive-\d{4}-(0[1-9]|1[0-2])\.md$` に合致すること
- 既存 legacy（`logs-archive-2026-feb.md` / `logs-archive-2026-march.md`）との共存方針（Phase 3 F-001）がポリシー文書に明記されていること
- mirror パスが対称となること

### 4. エスカレーションフローの読み合わせ確認

ポリシー文書内の「エスカレーションフロー」セクション（Phase 3 F-005 対応）を読み合わせ、
実行可能性を評価する。

| 観点               | 確認内容                                                                       | 結果       |
| ------------------ | ------------------------------------------------------------------------------ | ---------- |
| 担当者の明確性     | 違反検知時の一次対応者（人 or AI エージェント）が明記されているか              | 手動で記録 |
| 連絡手段の明確性   | Issue 起票先リポジトリ・ラベル・テンプレートが特定可能か                       | 手動で記録 |
| フォールバック手段 | mirror sync 失敗時の手動コピー手順が記述されているか                           | 手動で記録 |
| 判定タイミング     | 月次判定のタイミング（月初 or 月末、JST 何時）が明記されているか（F-003 対応） | 手動で記録 |
| 見直しサイクル     | 次回見直し予定日が冒頭メタ情報に記載されているか（F-004 対応）                 | 手動で記録 |

**記録**: 各観点で「明確」「要追記」「不明瞭」のいずれかで判定し task 固有 report に記載。
「要追記」「不明瞭」が 1 件でもあった場合は Phase 5 へ戻り、ポリシー文書を修正する。

### 5. 判定ルール

| 観点                       | 期待する状態                                                                        | 結果 |
| -------------------------- | ----------------------------------------------------------------------------------- | ---- |
| 両パス存在                 | 正本・mirror が両方存在し `diff` 差分ゼロ                                           | PASS |
| topic-map 参照             | `topic-map.md` にポリシー文書への参照が存在する                                     | PASS |
| 閾値判定の一意性           | ケース A〜D で期待判定と実判定が一致する                                            | PASS |
| パス命名規則の一意性       | ケース A〜C で生成ファイル名が正規表現に合致し、legacy との共存方針が明記されている | PASS |
| エスカレーション実行可能性 | 担当者 / 連絡手段 / フォールバック / タイミング / 見直し日がすべて明確              | PASS |
| NON_VISUAL 方針            | スクリーンショット不要の理由が task 固有 report に明記されている                    | PASS |

## 統合テスト連携【必須】

| 判定項目           | 基準                                                                                             | 結果 |
| ------------------ | ------------------------------------------------------------------------------------------------ | ---- |
| manual-test-result | `outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md` を primary evidence とする | PASS |
| NON_VISUAL 方針    | screenshot 不要理由が固定文で説明される                                                          | PASS |
| 正本 / mirror      | 差分ゼロ確認が可能                                                                               | PASS |

## 受け入れ基準（AC）

| ID   | 受け入れ基準                                                                                            | 検証方法                                    |
| ---- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| AC-1 | 別 worktree で checkout 後、正本・mirror 両方の存在が目視確認されている                                 | 手順 2 の `ls` / `diff` 出力記録            |
| AC-2 | ダミー LOGS.md ケース A〜D で閾値判定が一意に決まることが記録されている                                 | 手順 3-2 の判定表が全一致                   |
| AC-3 | ケース A〜C で `logs-archive-YYYY-MM.md` 命名規則が適用可能であることが記録されている                   | 手順 3-3 の命名適用表が全一致               |
| AC-4 | エスカレーションフローが担当者・連絡手段・フォールバック・タイミング・見直し日まで明確である            | 手順 4 の観点表で「要追記」「不明瞭」がゼロ |
| AC-5 | 本 Phase が `NON_VISUAL` であり screenshot 不要である旨が記録されている                                 | task 固有 report の方針記述                 |
| AC-6 | 手動テスト結果が `outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md` に保存されている | ファイル存在確認                            |

## スコープ

### 含むもの

- 別 worktree での checkout と文書存在確認
- ダミー LOGS.md による閾値判定シミュレーション
- パス命名規則の適用確認
- エスカレーションフローの読み合わせ
- 手動テスト結果の記録（`NON_VISUAL` 方針に基づく）

### 含まないもの

- UI / Electron 実画面のスクリーンショット取得（本タスクは文書のみで UI 対象なし）
- 実際の LOGS.md の移動 / アーカイブ実行（別タスクで自動化スクリプトとして実装）
- ダミーファイルのリポジトリへのコミット（`/tmp/` で作業し作業後破棄）
- 別 worktree の削除（ユーザー明示許可なしに削除しない）

## リスクと対策

| リスク                                           | 影響度 | 対策                                                                                |
| ------------------------------------------------ | ------ | ----------------------------------------------------------------------------------- |
| 別 worktree 作成時にブランチ名不明               | 低     | 事前に `git branch -a` でブランチ名を確認し、タスク起票 Issue 内に記録              |
| ダミー LOGS.md 作成手順が Python 依存            | 低     | 代替として `seq` / `printf` を用いる bash ワンライナーも手順に含める                |
| エスカレーションフローの読み合わせが主観的になる | 中     | 「担当者 / 連絡手段 / フォールバック / タイミング / 見直し日」の 5 観点で機械的判定 |
| worktree 誤削除によるローカル作業消失            | 中     | ユーザー許可なく worktree を削除しない旨を手順冒頭に明記                            |
| ポリシー改訂が手動テスト中に入った場合の不整合   | 低     | Phase 10 PASS 以降は文書凍結、本 Phase 中は修正しない                               |

## 多角的チェック観点

| 観点             | チェック内容                                                |
| ---------------- | ----------------------------------------------------------- |
| docs-only 妥当性 | UI ではなく文書運用シミュレーションとして自己完結しているか |
| NON_VISUAL 証跡  | screenshot 不要理由と manual-test-result の役割が一致するか |
| 命名一意性       | archive パスと月次判定が一意に解釈できるか                  |

## サブタスク管理

- [ ] worktree 存在確認
- [ ] ケース A〜D 判定シミュレーション
- [ ] エスカレーション読み合わせ

## 次Phaseへの引き継ぎ

### Phase 12（ドキュメント更新）に引き継ぐ事項

- 手動テスト結果（`outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md`）
- ケース A〜D の判定結果と命名規則適用結果（ポリシー運用例として参照可能）
- エスカレーションフロー読み合わせの発見事項（追記推奨項目があれば記録）
- `NON_VISUAL` 方針記録（screenshot 不要理由）

### 未解決事項

- なし（全 AC PASS が完了条件）。PASS しない場合は Phase 5 または Phase 10 へ戻る。

## 成果物

| 成果物         | パス                                                                  | 説明                                                            |
| -------------- | --------------------------------------------------------------------- | --------------------------------------------------------------- |
| 手動テスト結果 | `outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md` | 存在確認 / 閾値判定 / 命名規則 / エスカレーション読み合わせ結果 |

## 完了条件

- [ ] 別 worktree で checkout 完了し、正本・mirror の存在が目視確認済み
- [ ] ダミー LOGS.md ケース A〜D で閾値判定が一意に決まることを記録済み
- [ ] ケース A〜C で `logs-archive-YYYY-MM.md` 命名規則が適用可能であることを記録済み
- [ ] エスカレーションフローの 5 観点読み合わせで「要追記」「不明瞭」がゼロ
- [ ] `NON_VISUAL` 方針と screenshot 不要の理由を記録済み
- [x] 手動テスト結果が `outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md` に保存済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [x] 本 Phase 内の全タスクを 100% 実行完了
- [x] task 固有 manual test report の primary evidence 方針を固定した
- [x] NON_VISUAL 方針を明記した
