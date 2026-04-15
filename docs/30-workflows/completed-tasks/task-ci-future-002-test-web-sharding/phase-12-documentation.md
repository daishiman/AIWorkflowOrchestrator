# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                  |
| -------- | ------------------- |
| Phase    | 12                  |
| タスクID | TASK-CI-FUTURE-002  |
| タスク名 | test-web シャード化 |
| 作成日   | 2026-04-15          |

## 目的

実装完了後の成果を、`task-specification-creator` と `aiworkflow-requirements` の正本へ同期する。この Phase では実装コード（CI 設定）は触らず、仕様・台帳・履歴・未タスク・フィードバックを分離して記録する。

---

## 中学生レベル概念説明

このフェーズでやることは、ひとことで言うと「直したあとに説明書もそろえる」ことです。

たとえば、学校の運動会で「リレーの走者を 1 人から 3 人に増やした」とします。でも競技規則書が古いまま「走者 1 人」と書いてあったら、あとで見た人が混乱してしまいます。

test-web のシャード化は、テストを複数の担当者に分担するようなものです。今まで 1 人でやっていたテスト確認作業を、2 人・3 人で同時にやれるようにした、というイメージです。早く終わるし、それぞれの担当範囲も明確になります。

Phase 12 では、この「分担体制に変えた」という事実を、次の 5 つにまとめて記録します。

1. **わかりやすい実装ガイドを書く** — 中学生向けと技術者向けの 2 段階で説明する
2. **どの仕様書をどう直したかを記録する** — 台帳・バックログ・完了記録を更新する
3. **変更の履歴を残す** — いつ・何を・なぜ変えたかを changelog に書く
4. **まだ残っている課題を見つけて記録する** — 0 件でも必ず書く
5. **このスキルと仕様書がちゃんと合っているかを確認する** — フィードバックレポートとして出力する

これで、実装と説明書のズレを最小にできます。

---

## 事前チェック【必須】

Phase 12 を始める前に、次を先に確認する。

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を確認する
2. `LOGS.md` は `aiworkflow-requirements` と `task-specification-creator` の両方を更新対象に含める
3. `SKILL.md` の変更履歴テーブルを両方更新対象に含める
4. `topic-map.md` / `keywords.json` の再生成が必要かを確認する
5. 予定表現（「仕様策定のみ」「実行予定」「保留として記録」）を残さない
6. Phase 13 は user approval がない限り blocked のままにする

---

## 実行タスク

1. Task 12-1: 2 パート構成の実装ガイド作成 (`outputs/phase-12/implementation-guide.md`)
2. Task 12-2: システム仕様更新サマリー作成 (`outputs/phase-12/system-spec-update-summary.md`)
3. Task 12-3: ドキュメント更新履歴作成と `artifacts.json` / 履歴同期 (`outputs/phase-12/documentation-changelog.md`)
4. Task 12-4: 未割り当てタスク検出レポート作成 (`outputs/phase-12/unassigned-task-detection.md`)
5. Task 12-5: スキルフィードバックレポート作成 (`outputs/phase-12/skill-feedback-report.md`)
6. Task 12-6: Phase 12 仕様準拠チェック作成 (`outputs/phase-12/phase12-task-spec-compliance-check.md`)

---

## 参照資料

| 資料名                    | パス                                                                                                                  | 説明                              |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                                                                              | NON_VISUAL smoke test の結果      |
| Phase 10 最終レビュー結果 | `outputs/phase-10/final-review-result.md`                                                                             | AC-1〜AC-6 の最終照合結果         |
| Phase 3 設計レビュー結果  | `outputs/phase-3/design-review-result.md`                                                                             | MINOR / MAJOR の確認元            |
| Phase 1 受入基準          | `outputs/phase-1/acceptance-criteria.md`                                                                              | Phase 12 で回収する前提の確認元   |
| GitHub Issue #2168        | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2168                                                       | 進捗コメント更新対象              |
| 台帳正本                  | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` / `task-workflow-completed.md`           | 未タスク移管と完了記録            |
| Phase 12 テンプレート     | `.claude/skills/task-specification-creator/references/phase-template-phase12.md` / `phase-template-phase12-detail.md` | 出力名・必須タスクの根拠          |
| 親タスク成果物            | `docs/30-workflows/completed-tasks/task-ci-optimization-001/`                                                         | test-desktop シャード化の参照実装 |

---

## 実行手順

### Task 12-1: 実装ガイド作成

`implementation-guide.md` は 2 パート構成とする。

#### Part 1: 中学生レベルの説明

- **なぜ必要かを先に書く**: テストが増えると 1 人でやるより分担したほうが早いことを説明する
- **日常のたとえ話を最低 1 つ入れる**: 「テストを複数の担当者に分担するようなもの」「運動会のリレーを複数走者に分担するようなもの」
- **専門用語を使う場合は、その場で簡単に説明する**:
  - シャード → 「分担グループ」
  - matrix → 「同時に実行する設定のパターン一覧」
  - GitHub Actions → 「コードを変更したときに自動でテストしてくれる仕組み」
- **「テストをシャードに分ける」「なぜそれが必要か」を、順番を崩さずに説明する**

#### Part 2: 技術者向け詳細

- Vitest シャーディング（`--shard=N/M` オプション）の仕組みを説明する
- GitHub Actions matrix 戦略の設定方法を yaml サンプルで示す
- シャード数の計算式を明記する:
  - `現在のテストファイル数 ÷ 目標シャード時間 ≒ 推奨シャード数`
  - `GitHub Free Tier 上限 20 - 既存ジョブ並列数 = 追加可能シャード数上限`
- 実行時間ベースライン比較の結果を記載する
- 変更対象ファイルと変更内容の一覧を表にする:

| ファイル                        | 変更内容                                           |
| ------------------------------- | -------------------------------------------------- |
| `.github/workflows/ci.yml`      | `test-web` ジョブへの `strategy.matrix.shard` 追加 |
| `apps/backend/vitest.config.ts` | シャード設定（必要な場合のみ修正）                 |

- 並列数の内訳と計算根拠を表で示す

### Task 12-2: システム仕様更新サマリー作成

`system-spec-update-summary.md` には、実際に更新すべき正本を 1 か所にまとめる。

```bash
# 変更対象の仕様書を再生成・確認する
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js

# 構造検証が必要な場合は実行する
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js
```

#### Step 1-A: 完了タスク記録

- `task-workflow-backlog.md` から `TASK-CI-FUTURE-002` を完了扱いへ移す
- `task-workflow-completed.md` に完了記録を追加する:
  - タスクID: `TASK-CI-FUTURE-002`
  - 完了日: 実装完了日
  - 成果: `test-web` ジョブのシャード化、実行時間短縮
  - GitHub Issue: #2168（クローズ済み）
- `LOGS.md` を `aiworkflow-requirements` と `task-specification-creator` の両方で更新する
- GitHub Issue #2168 に進捗コメントを追加する（close は Phase 13 blocked 解除後）

#### Step 1-B: 実装状況テーブル更新

- CI 最適化タスク一覧テーブルの `TASK-CI-FUTURE-002` 行を更新する:
  - ステータス: `未実施` → `完了`
  - spec_path: `docs/30-workflows/task-ci-future-002-test-web-sharding/`
  - 完了日: 実装完了日
- `test-web` ジョブのシャード数・並列数内訳を CI 設定ドキュメントに反映する

#### Step 1-C: 関連タスクテーブル更新

- `TASK-CI-OPT-001`（親タスク）との関連を記録する:
  - `TASK-CI-FUTURE-002` は `TASK-CI-OPT-001` の Phase 12 で検出された未タスクとして実装した旨を記録する
- 未タスクとして残すものは明示して分類する

#### Step 2: 新規インターフェース追加時のみ

本タスクは CI 設定ファイルのみの変更であるため、新規インターフェース / 型 / 定数 / API 変更は発生しない。以下を `system-spec-update-summary.md` に明記する:

- 「内部実装（CI 設定）のみの変更であるため、API / IPC 契約の更新は不要」
- 更新不要の理由を明記する

### Task 12-3: ドキュメント更新履歴と履歴同期

`documentation-changelog.md` では、変更の前後と根拠を短く記録する。

```bash
# ドキュメント更新履歴を生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/task-ci-future-002-test-web-sharding

# Phase 12 完了登録と artifacts.json 同期
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/task-ci-future-002-test-web-sharding \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/system-spec-update-summary.md:システム仕様更新サマリー,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未割り当てタスク検出,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート,outputs/phase-12/phase12-task-spec-compliance-check.md:Phase 12 仕様準拠チェック"

# 予定表現が残っていないことを確認
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/task-ci-future-002-test-web-sharding/outputs/phase-12/ \
  | rg -v 'phase12-task-spec-compliance-check.md' || echo "予定表現なし"

# .claude 正本と .agents mirror の parity を確認
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

記録する内容:

- 変更対象ファイル（`.github/workflows/ci.yml`、必要時 `apps/backend/vitest.config.ts`）
- 変更理由（test-web テスト実行時間の短縮・スケーラビリティ向上）
- current / baseline（シャード化前後の並列数・実行時間）
- validator 実行結果
- 予定表現なしの確認

あわせて次を更新する:

- `aiworkflow-requirements/LOGS.md`
- `task-specification-creator/LOGS.md`
- `aiworkflow-requirements/SKILL.md`
- `task-specification-creator/SKILL.md`
- `.claude` を正本にし、`.agents` mirror がある場合は同一 wave で同期する

### Task 12-4: 未割り当てタスク検出レポート

`unassigned-task-detection.md` には、**0 件でも必ず結果を書く**。

確認元:

- Phase 3 の MINOR 指摘
- Phase 10 の MINOR / residual issue
- Phase 11 の NON_VISUAL smoke test で出た所見
- `TODO` / `FIXME` / `HACK` / `XXX`
- GitHub Free Tier 並列上限に関する今後の検討事項

```bash
# Phase 12 の未タスク候補を確認する
rg -n "TODO|FIXME|HACK|XXX" \
  docs/30-workflows/task-ci-future-002-test-web-sharding \
  .github/workflows/ci.yml \
  .claude/skills/aiworkflow-requirements/references/task-workflow-*.md

# CI 並列数の余裕を確認する
grep -n "shard:" .github/workflows/ci.yml
```

未タスクが出た場合は `docs/30-workflows/unassigned-task/` に正式な指示書を作成する。

典型的な未タスク候補（例）:

- `test-web` のシャード数を将来増やす際の手順ドキュメント整備
- Codecov への `web` coverage アップロード対応（現状は `desktop` のみ）
- `test-web` の実行時間モニタリング設定

### Task 12-5: スキルフィードバックレポート

`skill-feedback-report.md` には、**改善点がなくても `改善点なし` と書く**。

以下の観点でフィードバックを記録する:

| 観点                              | 確認内容                                                      |
| --------------------------------- | ------------------------------------------------------------- |
| task-specification-creator スキル | Phase 仕様書のテンプレートは CI 設定タスクに適していたか      |
| aiworkflow-requirements スキル    | 正本参照・更新フローはスムーズだったか                        |
| Phase 11 の手順                   | NON_VISUAL 判定・ローカルシャード実行手順は明確だったか       |
| CI 最適化ナレッジ                 | GitHub Free Tier 並列上限の計算方法が仕様書に明記されていたか |

### Task 12-6: Phase 12 仕様準拠チェック

`phase12-task-spec-compliance-check.md` には、次を確認する:

- Task 12-1〜12-6 が全て完了している
- `implementation-guide.md` が 2 パート構成である
- Part 1 に日常のたとえ話が含まれている
- Part 2 にシャード数計算式・並列数内訳が含まれている
- `system-spec-update-summary.md` が Step 1-A〜2 を含む
- `documentation-changelog.md` が current / baseline を含む
- `unassigned-task-detection.md` が 0 件でも出力されている
- `skill-feedback-report.md` が省略されていない

```bash
# Phase 12 完了チェック
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/task-ci-future-002-test-web-sharding --phase 12
```

## 記録欄

- 実施日:
- 実施者:
- 検証結果:
- 備考:

---

## 統合テスト連携

- Phase 11 の NON_VISUAL smoke test 結果を Phase 12 の根拠に使う
- 仕様書更新後に、Phase 10 の AC 記録と矛盾しないことを確認する
- Phase 13 は user approval 取得まで blocked のまま維持する

---

## サブタスク管理

| ID     | タスク名                         | ステータス |
| ------ | -------------------------------- | ---------- |
| T-12-1 | 実装ガイド作成（2 パート構成）   | 未実施     |
| T-12-2 | システム仕様更新サマリー作成     | 未実施     |
| T-12-3 | ドキュメント更新履歴同期         | 未実施     |
| T-12-4 | 未割り当てタスク検出             | 未実施     |
| T-12-5 | スキルフィードバックレポート作成 | 未実施     |
| T-12-6 | Phase 12 仕様準拠チェック        | 未実施     |

---

## 成果物

| 成果物                       | 配置先                                                   | 形式     |
| ---------------------------- | -------------------------------------------------------- | -------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Markdown |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Markdown |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | Markdown |
| 未割り当てタスク検出         | `outputs/phase-12/unassigned-task-detection.md`          | Markdown |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | Markdown |
| Phase 12 仕様準拠チェック    | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Markdown |

---

## 完了条件

- [ ] 実装ガイドが 2 パート構成で作成されている（Part 1: 中学生向け、Part 2: 技術者向け）
- [ ] Part 1 に日常のたとえ話が含まれている
- [ ] Part 2 にシャード数計算式・並列数内訳表が含まれている
- [ ] `## 実行タスク` が表と `- Task 12-X:` 箇条書きの両方で記載されている
- [ ] システム仕様更新サマリーが Step 1-A〜2 を含んでいる
- [ ] `TASK-CI-FUTURE-002` が `task-workflow-completed.md` に記録されている
- [ ] ドキュメント更新履歴が current / baseline / validator を含んでいる
- [ ] `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` が更新されている
- [ ] `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` が更新されている
- [ ] `.claude` 正本と `.agents` mirror の差分が揃っている
- [ ] `topic-map.md` と `keywords.json` が再生成されている
- [ ] 未割り当てタスク検出が 0 件でも出力されている
- [ ] スキルフィードバックレポートが省略されていない
- [ ] Phase 12 仕様準拠チェックが PASS である
- [ ] 予定表現が残っていない

---

## タスク 100% 実行確認【必須】

- [ ] T-12-1: 実装ガイド作成（2 パート構成）を完了済み
- [ ] T-12-2: システム仕様更新サマリー作成を完了済み
- [ ] T-12-3: ドキュメント更新履歴作成と履歴同期を完了済み
- [ ] T-12-4: 未割り当てタスク検出を完了済み（0 件でも出力済み）
- [ ] T-12-5: スキルフィードバックレポート作成を完了済み（改善点なしでも出力済み）
- [ ] T-12-6: Phase 12 仕様準拠チェックを完了済み

---

## 次 Phase

**Phase 13: PR 作成** — ユーザーの明示承認がある場合のみ blocked を解除する。

**Phase 13 開始条件**: user approval がない限り blocked のまま維持する。
