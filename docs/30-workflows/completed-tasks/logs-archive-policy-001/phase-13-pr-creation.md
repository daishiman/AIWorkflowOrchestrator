# Phase 13: PR 作成

## メタ情報

| 項目       | 内容                                                                               |
| ---------- | ---------------------------------------------------------------------------------- |
| Phase      | 13                                                                                 |
| タスクID   | TASK-LOGS-ARCHIVE-POLICY-001                                                       |
| 機能名     | LOGS.md アーカイブポリシー詳細化                                                   |
| 前提Phase  | Phase 12                                                                           |
| 後続Phase  | なし（最終 Phase）                                                                 |
| 作成日     | 2026-04-19                                                                         |
| Issue      | [#2282](https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282)（CLOSED） |
| ブランチ   | `docs/task-spec-TASK-LOGS-ARCHIVE-POLICY-001`                                      |
| ステータス | blocked                                                                            |

## 目的

Phase 12 で整備した `logs-archive-policy.md`（正本 + mirror）、3 インデックス更新、
および Phase 1-3 / Phase 12 の各仕様書を 1 本の PR として提出するための、
コミットメッセージ規約・PR タイトル / 本文テンプレート・CI チェック項目・レビュワー指定・
Issue #2282 とのクロスリファレンス方針を確定する。

**本 Phase は blocked 状態で運用する。** commit / push / PR 作成はユーザーの
明示指示があるまで実行しない。

## 重要な前提（絶対遵守）

### push / PR 作成はユーザー明示指示時のみ

- 本 Phase 内の手順に記載されたコマンドは **いかなる場合も自動実行しない**
- 「PR 出して」「push して」といった曖昧な依頼でも、ブランチ名・対象コミット・
  レビュワーの詳細を再確認してから実行する（worktree 上の push / PR は明示承認必須）
- worktree の削除も同様にユーザー承認なしに実行しない

### `--no-verify` は絶対禁止（CLAUDE.md 規定）

- `git commit --no-verify` / `git commit -n` / `git push --no-verify` を **使用しない**
- pre-commit フック（lint-staged）・pre-push フック（全テスト実行）は必ず実行される前提
- フック失敗時の対処:
  1. エラーを読み、原因を修正する
  2. それでも回避が必要な場合は `.skip` + Issue 起票で対処（本タスクでは基本不要）

### pre-commit / pre-push フック実行前提

| フック     | 実行内容                                  | 想定時間     |
| ---------- | ----------------------------------------- | ------------ |
| pre-commit | lint-staged（Prettier / ESLint 自動修正） | 10-30 秒     |
| pre-push   | 全テスト実行（Vitest / 関連 Playwright）  | 数分〜十数分 |

本タスクは文書のみの変更のため、実質的には Prettier フォーマット程度しか走らない
想定だが、フックをスキップする運用は一切行わない。

## 実行タスク

1. 変更サマリーの作成（`change-summary.md` 相当を本 Phase 文書内に内包）
2. コミットメッセージ案の確定
3. PR タイトル・本文テンプレートの確定
4. CI チェック項目の洗い出し
5. レビュワー候補の記載
6. ローカル確認結果記録（blocked 状態としての現状記録）
7. Issue #2282（CLOSED）との相互参照方針確定

## 参照資料

| 資料名   | パス                                                                  | 用途                        |
| -------- | --------------------------------------------------------------------- | --------------------------- |
| Phase 10 | `outputs/phase-10/final-review-result.md`                             | 最終レビュー結果            |
| Phase 11 | `outputs/phase-11/TASK-LOGS-ARCHIVE-POLICY-001-manual-test-report.md` | NON_VISUAL primary evidence |
| Phase 12 | `outputs/phase-12/documentation-changelog.md`                         | close-out 要約              |

## 実行手順

1. blocked 状態のまま変更サマリー、PR タイトル、PR 本文テンプレートを確定する
2. ユーザー承認後にのみ commit / push / PR 作成へ進む
3. `--no-verify` を使わず、Phase 10-12 の成果物を参照して PR 情報を埋める

## コミット対象ファイル

| 分類            | パス                                                                       |
| --------------- | -------------------------------------------------------------------------- |
| 正本ポリシー    | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` |
| mirror ポリシー | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` |
| インデックス    | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`              |
| インデックス    | `.claude/skills/aiworkflow-requirements/indexes/quick-reference.md`        |
| インデックス    | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`           |
| 仕様書          | `docs/30-workflows/logs-archive-policy-001/phase-1-requirements.md`        |
| 仕様書          | `docs/30-workflows/logs-archive-policy-001/phase-2-design.md`              |
| 仕様書          | `docs/30-workflows/logs-archive-policy-001/phase-3-design-review.md`       |
| 仕様書          | `docs/30-workflows/logs-archive-policy-001/phase-12-documentation.md`      |
| 仕様書          | `docs/30-workflows/logs-archive-policy-001/phase-13-pr-creation.md`        |
| （任意）        | `CHANGELOG.md` / `.claude/skills/aiworkflow-requirements/LOGS.md` 追記     |

## コミットメッセージ規約

### 基本フォーマット

```
docs(logs-archive-policy): TASK-LOGS-ARCHIVE-POLICY-001 ポリシー文書確定 (#2282)
```

- **type**: `docs`（文書のみの変更）
- **scope**: `logs-archive-policy`
- **subject**: タスク ID + 内容 + Issue 番号
- 末尾の `(#2282)` は Issue CLOSED 状態でも本文で参照可能にするため明示

### 複数コミットに分割する場合（推奨案）

| コミット順 | メッセージ                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------- |
| 1          | `docs(logs-archive-policy): TASK-LOGS-ARCHIVE-POLICY-001 Phase1-3 仕様書追加 (#2282)`           |
| 2          | `docs(logs-archive-policy): TASK-LOGS-ARCHIVE-POLICY-001 正本/mirror ポリシー文書追加 (#2282)`  |
| 3          | `docs(logs-archive-policy): TASK-LOGS-ARCHIVE-POLICY-001 aiworkflow 3 インデックス更新 (#2282)` |
| 4          | `docs(logs-archive-policy): TASK-LOGS-ARCHIVE-POLICY-001 Phase12-13 仕様書追加 (#2282)`         |

または 1 コミット集約（PR サイズ次第）：

```
docs(logs-archive-policy): TASK-LOGS-ARCHIVE-POLICY-001 ポリシー文書確定 (#2282)
```

### HEREDOC での commit 例（ユーザー承認後のみ実行）

```bash
git commit -m "$(cat <<'EOF'
docs(logs-archive-policy): TASK-LOGS-ARCHIVE-POLICY-001 ポリシー文書確定 (#2282)

- LOGS.md アーカイブ閾値（300 行 / 30 KB / 月次）を統一ポリシーとして文書化
- パス規則 logs-archive-YYYY-MM.md を正規表現で固定
- .claude / .agents mirror 両側に配置し topic-map / quick-reference / resource-map へ反映
- Phase 1-3 + Phase 12-13 仕様書を docs/30-workflows/ へ追加

Refs #2282
EOF
)"
```

## PR タイトル

```
docs(logs-archive-policy): TASK-LOGS-ARCHIVE-POLICY-001 ポリシー文書確定 (#2282)
```

## PR 本文テンプレート

```markdown
## Summary

- `TASK-LOGS-ARCHIVE-POLICY-001`（Issue #2282, CLOSED）の成果として、`.claude/skills/*/LOGS.md`
  および `.agents/skills/*/LOGS.md` のアーカイブ閾値（300 行 / 30 KB / 月次）とパス規則
  （`logs-archive-YYYY-MM.md`）を **統一ポリシー文書** として確定
- 正本 `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` を追加し、
  `.agents/` mirror を同期（`diff` 差分ゼロ）
- `aiworkflow-requirements` スキルの 3 インデックス（`topic-map` / `quick-reference` / `resource-map`）
  に参照を追加
- Phase 1-3（要件 / 設計 / 設計レビュー）および Phase 12-13（ドキュメント整備 / PR 作成）の
  仕様書を `docs/30-workflows/logs-archive-policy-001/` に配置
- 既存 legacy 表記（`logs-archive-2026-feb.md` 等）は残置し、新規は数値月 YYYY-MM 形式で統一

## Related

- Refs #2282（CLOSED、本 PR はポリシー文書の最終確定）
- Depends on: `TASK-CONFLICT-PREVENT-001`（発火源・mirror sync 機構の利用元）
- See also: `.claude/skills/task-specification-creator/references/logs-archive-*.md` 群

## Scope

- 文書のみの変更（コード変更なし）
- アーカイブ自動化スクリプト実装および過去 LOGS.md への遡及適用は別タスク

## Test plan

- [ ] `diff .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` が差分ゼロ
- [ ] `grep -l "logs-archive-policy" .claude/skills/aiworkflow-requirements/indexes/*.md` で 3 ファイル全ヒット
- [ ] ポリシー文書の 6 必須セクション（適用範囲 / 閾値 / パス規則 / 手順 / 運用ルール / 参照）が全て存在
- [ ] 命名規則正規表現 `^logs-archive-\d{4}-(0[1-9]|1[0-2])\.md$` が既存ファイル名と衝突しない
  - 既存 `logs-archive-2026-feb.md` / `logs-archive-2026-march.md` は legacy として残置
- [ ] pre-commit フック（Prettier / ESLint）が PASS
- [ ] pre-push フック（全テスト実行）が PASS
- [ ] Phase 1-3, 12-13 の全仕様書がメタ情報テーブルを含む

## Reviewers

- 本タスク発火元（TASK-CONFLICT-PREVENT-001）担当者
- `aiworkflow-requirements` スキルオーナー
- 文書方針レビュー: @daishiman

## Notes

- Issue #2282 は既に CLOSED のため本 PR では **`Refs #2282`** で言及のみ行い、
  再 Close 操作は不要
- `--no-verify` は使用していない（CLAUDE.md 規定遵守）
- completed-tasks 配下への移管は本 PR マージ後、別コミットで実施（本 PR スコープ外）
```

## CI チェック項目

| 項目                      | 内容                                                        | 期待結果 |
| ------------------------- | ----------------------------------------------------------- | -------- |
| pre-commit: Prettier      | 変更ファイルのフォーマット                                  | PASS     |
| pre-commit: ESLint        | 変更ファイルの Lint（Markdown 対象外なら実質 no-op）        | PASS     |
| pre-push: Vitest          | 全ユニットテスト実行                                        | PASS     |
| pre-push: 型チェック      | TypeScript（本 PR は文書のみなので影響なし想定）            | PASS     |
| GitHub Actions: lint/test | CI 全ワークフロー                                           | PASS     |
| Markdown リンク整合性     | 相対パスで参照している資料が実在する                        | 手動確認 |
| mirror 対称性             | `.claude/` と `.agents/` の `logs-archive-policy.md` が一致 | 手動確認 |

## レビュワー指定

| 区分 | 候補                                        | 確認観点                          |
| ---- | ------------------------------------------- | --------------------------------- |
| 必須 | `@daishiman`（プロジェクトオーナー）        | 方針・全体整合                    |
| 推奨 | TASK-CONFLICT-PREVENT-001 担当              | mirror sync 機構の整合性          |
| 推奨 | `aiworkflow-requirements` スキルオーナー    | インデックス更新整合              |
| 任意 | `task-specification-creator` スキルオーナー | Phase 12 中学生レベル説明の妥当性 |

## Issue #2282 との相互参照

- **現状**: Issue #2282 は既に CLOSED
- **方針**: PR 本文 / コミットメッセージに **`Refs #2282`** を含める（`Closes #2282` は使わない）
  - CLOSED 状態の Issue に対して `Closes` キーワードは不要で、`Refs` により GitHub 上で
    Issue と PR が相互リンクされる
- **追跡**: 本タスクのトレーサビリティは以下で担保
  - PR タイトルおよび全コミットメッセージに `(#2282)` を記載
  - Phase 1-3, 12-13 仕様書の各メタ情報テーブルに Issue リンクを記載
  - `logs-archive-policy.md` 冒頭または「参照」セクションに `#2282` 記載

## ローカル確認結果（blocked 状態として記録）

### 現時点の状態

- Phase 12 成果物: **作成済み**（PR は blocked のまま）
- commit: **未実行**（ユーザー承認待ち）
- push: **未実行**（ユーザー承認待ち）
- PR 作成: **未実行**（ユーザー承認待ち）

## 成果物

| 成果物  | パス                          | 説明                       |
| ------- | ----------------------------- | -------------------------- |
| PR 情報 | `outputs/phase-13/pr-info.md` | blocked 状態の PR 計画メモ |

### ユーザー承認後に実施する確認コマンド

```bash
# 1. 正本と mirror の差分ゼロ確認
diff .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
     .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md

# 2. 3 インデックスへの参照追加確認
grep -l "logs-archive-policy" .claude/skills/aiworkflow-requirements/indexes/*.md

# 3. 命名規則正規表現の既存ファイル衝突確認（空行が返ることを確認）
ls .claude/skills/*/references/logs-archive-*.md 2>/dev/null \
  | grep -vE "logs-archive-(\d{4}-(0[1-9]|1[0-2])|index|legacy|2026-(feb|march))\.md$" || echo "OK"

# 4. 仕様書 5 本の存在確認
ls docs/30-workflows/logs-archive-policy-001/phase-*.md
```

## ユーザー承認後のコマンド例（現時点では実行しない）

```bash
# 1. ブランチ作成（既存なら checkout）
git checkout -b docs/task-spec-TASK-LOGS-ARCHIVE-POLICY-001

# 2. ステージング（ファイル名を具体的に指定、git add -A は使わない）
git add .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
        .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md \
        .claude/skills/aiworkflow-requirements/indexes/topic-map.md \
        .claude/skills/aiworkflow-requirements/indexes/quick-reference.md \
        .claude/skills/aiworkflow-requirements/indexes/resource-map.md \
        docs/30-workflows/logs-archive-policy-001/

# 3. コミット（--no-verify は絶対禁止）
git commit -m "$(cat <<'EOF'
docs(logs-archive-policy): TASK-LOGS-ARCHIVE-POLICY-001 ポリシー文書確定 (#2282)

- LOGS.md アーカイブ閾値（300 行 / 30 KB / 月次）を統一ポリシーとして文書化
- パス規則 logs-archive-YYYY-MM.md を正規表現で固定
- .claude / .agents mirror 両側に配置し 3 インデックスへ反映
- Phase 1-3, 12-13 仕様書を docs/30-workflows/ へ追加

Refs #2282
EOF
)"

# 4. push（ユーザー明示指示後のみ）
git push -u origin docs/task-spec-TASK-LOGS-ARCHIVE-POLICY-001

# 5. PR 作成（ユーザー明示指示後のみ）
gh pr create \
  --title "docs(logs-archive-policy): TASK-LOGS-ARCHIVE-POLICY-001 ポリシー文書確定 (#2282)" \
  --body-file /tmp/pr-body.md \
  --reviewer daishiman
```

## 禁止事項

| 禁止項目                              | 根拠                                       |
| ------------------------------------- | ------------------------------------------ |
| ユーザー承認なしの commit             | CLAUDE.md / worktree 上の明示承認必須方針  |
| ユーザー承認なしの push               | CLAUDE.md / worktree 上の明示承認必須方針  |
| ユーザー承認なしの PR 作成            | CLAUDE.md / worktree 上の明示承認必須方針  |
| `git commit --no-verify` / `-n`       | CLAUDE.md「Git操作の禁止事項」絶対禁止条項 |
| `git push --no-verify`                | CLAUDE.md「Git操作の禁止事項」絶対禁止条項 |
| main / master への force push         | CLAUDE.md Git Safety Protocol              |
| `git add -A` / `git add .` の常用     | 秘匿情報混入リスク回避のため個別指定を推奨 |
| worktree の無断削除                   | feedback_no_worktree_delete.md             |
| `git commit --amend` による既存上書き | CLAUDE.md「常に新規コミットを作成」        |

## 受け入れ基準（AC）

| ID   | 受け入れ基準                                                                                                        | 検証方法                                                      |
| ---- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| AC-1 | コミットメッセージ規約が `docs(logs-archive-policy): TASK-LOGS-ARCHIVE-POLICY-001 ... (#2282)` 形式で定義されている | 本 Phase 文書「コミットメッセージ規約」節の確認               |
| AC-2 | PR タイトル・本文テンプレートが確定している                                                                         | 本 Phase 文書「PR タイトル」「PR 本文テンプレート」節の確認   |
| AC-3 | `--no-verify` 禁止が明記されている                                                                                  | 本 Phase 文書「禁止事項」表および冒頭注記の確認               |
| AC-4 | push / PR 作成はユーザー明示指示時のみと明記されている                                                              | 本 Phase 文書「重要な前提」節および「禁止事項」表の確認       |
| AC-5 | pre-commit / pre-push フック実行前提が記述されている                                                                | 本 Phase 文書「pre-commit / pre-push フック実行前提」節の確認 |
| AC-6 | CI チェック項目が列挙されている                                                                                     | 本 Phase 文書「CI チェック項目」表の確認                      |
| AC-7 | レビュワー指定が記述されている                                                                                      | 本 Phase 文書「レビュワー指定」表の確認                       |
| AC-8 | Issue #2282（CLOSED）への `Refs #2282` 参照方針が明記されている                                                     | 本 Phase 文書「Issue #2282 との相互参照」節の確認             |
| AC-9 | ユーザー承認後のコマンド例が実行可能な形で記述されている                                                            | コマンド例ブロックの記述確認                                  |

## スコープ

### 含むもの

- コミットメッセージ規約定義
- PR タイトル / 本文テンプレート策定
- CI チェック項目洗い出し
- レビュワー候補整理
- Issue #2282 との相互参照方針確定
- ユーザー承認後コマンド例の整備（実行はしない）

### 含まないもの

- commit / push / PR 作成の実行（ユーザー明示指示時のみ）
- completed-tasks 配下への移管（本 PR マージ後の別作業）
- Issue #2282 の再オープン / 再 Close 操作
- mirror sync 機構自体の改修（TASK-CONFLICT-PREVENT-001 範疇）
- 自動化スクリプト / 遡及適用（別タスク）

## リスクと対策

| リスク                                            | 影響度 | 対策                                                              |
| ------------------------------------------------- | ------ | ----------------------------------------------------------------- |
| ユーザー承認なしの自動 push / PR 作成             | 高     | 本 Phase で明文化 + worktree 上の明示承認必須方針を参照           |
| `--no-verify` の誤用                              | 高     | CLAUDE.md 絶対禁止条項を複数箇所で明示                            |
| pre-push テスト失敗による push 不可               | 中     | 文書のみの変更のため影響なし想定、万一失敗時は原因修正で対応      |
| Issue #2282 CLOSED 状態での参照誤り               | 低     | `Refs #2282`（`Closes` 不使用）で統一                             |
| mirror 差分発生（正本と `.agents/` の内容不一致） | 中     | Phase 12 AC-2 と本 Phase ローカル確認コマンドで `diff` ゼロを検証 |
| コミットサイズ過大による PR レビュー困難          | 低     | 複数コミット分割案を提示（上記規約節参照）                        |

## 完了条件

- [ ] コミットメッセージ規約を記録した
- [ ] PR タイトル・本文テンプレートを記録した
- [ ] CI チェック項目を記録した
- [ ] レビュワー指定を記録した
- [ ] `--no-verify` 禁止を明記した
- [ ] push / PR 作成はユーザー明示指示時のみと明記した
- [ ] Issue #2282 との `Refs` 参照方針を記録した
- [ ] ユーザー承認後のコマンド例を記録した
- [ ] **commit / push / PR を実行していない**（blocked gate）
- [ ] 本 Phase 内の全タスクを 100% 実行完了（blocked gate）

## 次Phase

なし（最終 Phase）

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物（本 Phase 文書）を生成
- [ ] ユーザーの許可なしに commit / push / PR を実行していない
- [ ] `--no-verify` を使用していない
- [ ] 実行記録を残した

## タスク完了

Phase 13 は **blocked** 状態で完了。ユーザー明示指示があるまで commit / push / PR 作成は実行しない。
承認後は本 Phase 内の「ユーザー承認後のコマンド例」に従って実施する。
