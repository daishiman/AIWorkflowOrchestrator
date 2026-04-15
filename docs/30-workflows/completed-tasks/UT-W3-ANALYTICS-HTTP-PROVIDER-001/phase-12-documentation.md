# Phase 12: ドキュメント更新 - UT-W3-ANALYTICS-HTTP-PROVIDER-001

## メタ情報

| 項目         | 値                                                      |
| ------------ | ------------------------------------------------------- |
| Phase        | 12                                                      |
| タスクID     | UT-W3-ANALYTICS-HTTP-PROVIDER-001                       |
| タイトル     | Analytics HTTP プロバイダー実装（外部分析基盤への接続） |
| GitHub Issue | #2125 (CLOSED)                                          |
| 作成日       | 2026-04-14                                              |
| 状態         | 未実施                                                  |

---

## 目的

実装完了後の成果を、`task-specification-creator` と `aiworkflow-requirements` の正本へ同期する。
この Phase では実装コードは触らず、仕様・台帳・履歴・未タスク・フィードバックを分離して記録する。

---

## 必須6タスク

| Task      | 内容                                                | 主成果物                                                 |
| --------- | --------------------------------------------------- | -------------------------------------------------------- |
| Task 12-1 | 実装ガイドの作成（2パート構成）                     | `outputs/phase-12/implementation-guide.md`               |
| Task 12-2 | システム仕様書の更新（aiworkflow-requirements同期） | `outputs/phase-12/system-spec-update-summary.md`         |
| Task 12-3 | 変更履歴の記録                                      | `outputs/phase-12/documentation-changelog.md`            |
| Task 12-4 | 未タスク検出                                        | `outputs/phase-12/unassigned-task-detection.md`          |
| Task 12-5 | スキルフィードバックレポートの作成                  | `outputs/phase-12/skill-feedback-report.md`              |
| Task 12-6 | Phase 12タスク仕様準拠チェック                      | `outputs/phase-12/phase12-task-spec-compliance-check.md` |

---

### Task 12-1: 実装ガイドの作成（outputs/phase-12/implementation-guide.md）

`implementation-guide.md` は **2パート構成** とする。

#### Part 1: 中学生レベルの説明

- なぜ `AnalyticsHttpProvider` が必要かを先に書く
- 日常のたとえ話（郵便配達員・手紙の再送）を入れる
- 専門用語を使う場合はその場で簡単に説明する
- 「HTTP でイベントを送る」「失敗したらリトライする」「送れなくてもアプリを止めない」を順番を崩さずに説明する

#### Part 2: 技術者向け詳細

- `AnalyticsHttpProvider` クラスの型定義と役割を TypeScript で説明する
- `analyticsHandler.ts` Line 106 の TODO 解消の経緯を記載する
- リトライ実装（最大 3 回）のロジックを説明する
- `analyticsStore.sentCount` / `failedCount` の更新タイミングを記載する
- `ANALYTICS_ENDPOINT_URL` 環境変数の読み取りと no-op 動作を説明する
- エラーケースと後方互換性を列挙する
- 設定値・定数・引数の一覧を表にする

**実行コマンド**:

```bash
# 実装ガイドを作成する（手動で作成）
# outputs/phase-12/implementation-guide.md を新規作成する
```

---

### Task 12-2: システム仕様書の更新（aiworkflow-requirements同期）

`system-spec-update-summary.md` には、実際に更新すべき正本を1か所にまとめる。

```bash
# 変更対象の仕様書を再生成・確認する
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js

# 必要に応じて構造検証
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js
```

#### Step 1-A: 完了タスク記録

- `task-workflow-backlog.md` から `UT-W3-ANALYTICS-HTTP-PROVIDER-001` を完了扱いへ移す
- `task-workflow-completed.md` に完了記録を追加する
- `arch-execution-capability-contract.md` の analytics 関連 row を completed に更新する
- `api-ipc-system-core.md` の analytics IPC 記述へ `AnalyticsHttpProvider` 情報を追記する
- `LOGS.md` を `aiworkflow-requirements` と `task-specification-creator` の両方で更新する
- GitHub Issue #2125 の状態を確認する（すでに CLOSED）

#### Step 1-B: 実装状況テーブル更新

- `analyticsHandler.ts` Line 106 の TODO 解消を反映する
- `AnalyticsHttpProvider` クラスの新規追加を反映する
- `analyticsStore.sentCount` / `failedCount` フィールドの追加を反映する

#### Step 1-C: 関連タスクテーブル更新

- 未タスクとして残すものは明示して分類する
- 関連する analytics 機能の実装状況を current facts に合わせて更新する

#### Step 1-D: topic-map 再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
# topic-map.md と keywords.json の更新を確認する
```

#### Step 2: 必要な場合のみ system spec を更新

- `AnalyticsHttpProvider` インターフェース / 型 / 定数 / API 変更がある場合のみ更新する
- 更新不要の場合でも、理由は `system-spec-update-summary.md` に書く

---

### Task 12-3: 変更履歴の記録（outputs/phase-12/documentation-changelog.md）

`documentation-changelog.md` では、変更の前後と根拠を短く記録する。

```bash
# documentation changelog を生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001

# planned wording が残っていないことを確認
rg -n "仕様策定のみ|実行予定|保留として記録" \
  docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-12/ \
  | rg -v 'phase12-task-spec-compliance-check.md' || echo "planned wording なし"

# .claude 正本と .agents mirror の parity を確認
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
```

記録内容:

- 変更対象ファイル
- 変更理由
- current / baseline
- validator 実行結果
- `planned wording` なしの確認

あわせて次を更新する:

- `aiworkflow-requirements/LOGS.md`
- `task-specification-creator/LOGS.md`
- `aiworkflow-requirements/SKILL.md`
- `task-specification-creator/SKILL.md`
- `.claude` を正本にし、`.agents` mirror がある場合は同一 wave で同期する

---

### Task 12-4: 未タスク検出（outputs/phase-12/unassigned-task-detection.md）

`unassigned-task-detection.md` には、0件でも必ず結果を書く。

確認元:

- Phase 3 の MINOR 指摘
- Phase 10 の MINOR / residual issue
- Phase 11 の手動テストで出た所見
- `TODO` / `FIXME` / `HACK` / `XXX`

```bash
# Phase 12 の未タスク候補を確認する
rg -n "TODO|FIXME|HACK|XXX" \
  apps/desktop/src/main/services/analytics/ \
  apps/desktop/src/main/ipc/analyticsHandler.ts \
  .claude/skills/aiworkflow-requirements/references/task-workflow-*.md
```

未タスクが出た場合は `docs/30-workflows/unassigned-task/` に正式な指示書を作成する。
0件の場合は「0件確認済み」と明記する。

---

### Task 12-5: スキルフィードバックレポートの作成（outputs/phase-12/skill-feedback-report.md）

`skill-feedback-report.md` には、今回の Phase 12 を通じて見えたスキル側の改善点や再利用可能なパターンを記録する。

### 記載要件

- 改善点がある場合は、次回に向けた next action を書く
- 改善点がない場合でも、`なし` とその理由を明記する
- 基本対象は `aiworkflow-requirements` と `task-specification-creator` とする
- スキル改善を明示的に行った場合のみ `skill-creator` も含める

**確認コマンド**:

```bash
# skill feedback report を作成する（手動で作成）
# outputs/phase-12/skill-feedback-report.md を新規作成する
```

---

### Task 12-6: Phase 12タスク仕様準拠チェック

`phase12-task-spec-compliance-check.md` には、次を確認する:

- Task 12-1〜12-6 が全て完了している
- `implementation-guide.md` が 2パート構成である
- `system-spec-update-summary.md` が Step 1-A〜2 を含む
- `documentation-changelog.md` が current / baseline を含む
- `unassigned-task-detection.md` が 0件でも出力されている
- `skill-feedback-report.md` が改善点あり/なしを問わず出力されている
- `planned wording` が残っていない

```bash
# Phase 12 完了チェック
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001 --phase 12
```

#### Phase 完了登録

`phase12-task-spec-compliance-check.md` が PASS になり、Task 12-1〜12-6 が完了してから、以下を実行する。

```bash
# Phase 12 完了登録と artifacts.json 同期
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/system-spec-update-summary.md:system spec update summary,outputs/phase-12/documentation-changelog.md:documentation changelog,outputs/phase-12/unassigned-task-detection.md:unassigned task detection,outputs/phase-12/skill-feedback-report.md:skill feedback report,outputs/phase-12/phase12-task-spec-compliance-check.md:phase12 compliance check"
```

---

## 概念説明（中学生レベル）

このフェーズでやることは、ひとことで言うと「直したあとに説明書もそろえる」ことです。

たとえば、家のスイッチを直したのに説明書が古いままだと、あとで誰かが見たときに「これ、本当に今の動き？」と迷います。
そこで Phase 12 では、次の6つをまとめて整えます。

1. わかりやすい実装ガイドを書く
2. どの仕様書をどう直したかを記録する
3. 変更の履歴を残す
4. まだ残っている課題を見つけて記録する
5. スキルに関する気づきや改善点を記録する
6. このスキルと仕様書がちゃんと合っているかを確認する

これで、実装と説明書のズレを最小にできます。

---

### AnalyticsHttpProviderとは

**一言で言うと**: 分析データを外部サービスに送る「郵便配達員」のようなクラスです。

アプリを使っていると、「何回クリックされたか」「どのボタンが押されたか」などの情報（分析データ）が集まります。
この分析データを「外の会社のサービス」に届けるのが `AnalyticsHttpProvider` の仕事です。

郵便配達員が「お客さんの家に手紙を届ける」ように、
`AnalyticsHttpProvider` は「外部サービスのサーバーに分析データを届ける」のです。

| 郵便配達員の仕事             | AnalyticsHttpProvider の仕事                      |
| ---------------------------- | ------------------------------------------------- |
| 住所を確認して手紙を届ける   | `ANALYTICS_ENDPOINT_URL` を確認して HTTP 送信する |
| 届け先がなければ何もしない   | URL 未設定なら no-op（何もしない）で動作する      |
| 届けた記録をつける           | `sentCount` をインクリメントする                  |
| 届けられなかった記録をつける | `failedCount` をインクリメントする                |

---

### HTTP送信とリトライとは

**一言で言うと**: 手紙を送って返事がなければ3回まで再送する仕組みです。

インターネットの通信は、いつでも成功するわけではありません。
サーバーが混んでいたり、ネットワークが一時的に不安定だったりすることがあります。

そこで `AnalyticsHttpProvider` は、送信に失敗したときに「もう一度試す」を最大3回繰り返します。

```
1回目: 送信 → 失敗（サーバーが一時的に応答なし）
2回目: 再送 → 失敗（まだ応答なし）
3回目: 再送 → 成功！ → sentCount をインクリメント
```

3回全て失敗した場合は「送れなかった」として `failedCount` をインクリメントします。

---

### なぜエラーを握り潰すのか

**一言で言うと**: 分析データが送れなくてもアプリが止まってはいけないからです。

「分析データを送る」という機能は、アプリの本来の仕事（例: スキルを実行する、ファイルを編集する）ではありません。
あくまで「おまけの記録機能」です。

もし分析データの送信に失敗するたびにアプリが止まってしまったら、ユーザーは本来の仕事ができなくなります。
それは困ります。

そこで `AnalyticsHttpProvider` は、送信に失敗しても「あ、失敗したね。記録だけしておくよ」と静かに処理して、
アプリを止めないようにします（エラーを外に出さない＝「握り潰す」と言います）。

| 状況                      | AnalyticsHttpProvider の動作      | アプリの状態           |
| ------------------------- | --------------------------------- | ---------------------- |
| 送信成功                  | `sentCount++`                     | 正常動作               |
| 送信失敗（3回リトライ後） | `failedCount++`、エラーを握り潰す | 正常動作（止まらない） |
| URL 未設定                | 何もしない（no-op）               | 正常動作               |

---

## aiworkflow-requirements 更新対象

| 仕様書ファイル                          | 更新内容                                                                   | 必須 |
| --------------------------------------- | -------------------------------------------------------------------------- | ---- |
| `task-workflow-backlog.md`              | `UT-W3-ANALYTICS-HTTP-PROVIDER-001` を完了移管                             | 必須 |
| `task-workflow-completed.md`            | 完了記録の追加                                                             | 必須 |
| `arch-execution-capability-contract.md` | analytics HTTP provider 行を completed に更新                              | 必須 |
| `api-ipc-system-core.md`                | `analytics:send` / `analytics:get-stats` の AnalyticsHttpProvider 情報追記 | 必須 |
| `aiworkflow-requirements/LOGS.md`       | 変更履歴の追記                                                             | 必須 |
| `aiworkflow-requirements/SKILL.md`      | 変更履歴テーブルの更新                                                     | 必須 |
| `topic-map.md`                          | `AnalyticsHttpProvider` キーワードの追加                                   | 必須 |
| `keywords.json`                         | analytics 関連キーワードの更新                                             | 必須 |
| `task-specification-creator/LOGS.md`    | 変更履歴の追記                                                             | 必須 |
| `task-specification-creator/SKILL.md`   | 変更履歴テーブルの更新                                                     | 必須 |

---

## 参照資料

| 資料名                                           | パス                                                                                                        | 説明                                 |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| Phase 11 手動テスト結果                          | `outputs/phase-11/manual-test-result.md`                                                                    | 手動テストの結果                     |
| Phase 10 最終レビュー結果                        | `outputs/phase-10/final-review-result.md`                                                                   | AC-1〜AC-6 の最終照合結果            |
| Phase 1 受入基準                                 | `outputs/phase-1/acceptance-criteria.md`                                                                    | Phase 12 で回収する前提の確認元      |
| GitHub Issue #2125                               | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2125                                             | CLOSED 確認                          |
| analytics 正本                                   | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`                   | `AnalyticsHttpProvider` との関係記録 |
| 台帳正本                                         | `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md` / `task-workflow-completed.md` | 未タスク移管と完了記録               |
| Phase 12 テンプレート                            | `.claude/skills/task-specification-creator/references/phase-template-phase12.md`                            | 出力名・必須タスクの根拠             |
| 要件定義書（FR/NFR/AC/IPC4層整合性）             | `outputs/phase-1/requirements-summary.md`                                                                   | Phase 1 成果物                       |
| 設計書（クラス設計/IPC4層/リトライ/DI境界）      | `outputs/phase-2/design-summary.md`                                                                         | Phase 2 成果物                       |
| 実装サマリー（TDD Green）                        | `outputs/phase-5/implementation-summary.md`                                                                 | Phase 5 成果物                       |
| リファクタリング記録（変更なし）                 | `outputs/phase-8/refactoring-record.md`                                                                     | Phase 8 成果物                       |
| 品質検証記録（typecheck/lint/test全PASS）        | `outputs/phase-9/quality-assurance-record.md`                                                               | Phase 9 成果物                       |
| 最終レビュー書（AC-1〜AC-8突合・MAJOR指摘0件）   | `outputs/phase-10/final-review.md`                                                                          | Phase 10 成果物                      |
| 手動テスト記録（UI変更なし・自動テスト検証済み） | `outputs/phase-11/manual-test-record.md`                                                                    | Phase 11 成果物                      |

---

## 実行手順

### ステップ1: 事前チェック

Phase 12 を始める前に、次を先に確認する。

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を確認する
2. `LOGS.md` は `aiworkflow-requirements` と `task-specification-creator` の両方を更新対象に含める
3. `SKILL.md` の変更履歴テーブルを両方更新対象に含める
4. `topic-map.md` / `keywords.json` の再生成が必要かを確認する
5. `planned wording`（「仕様策定のみ」「実行予定」「保留として記録」など）を残さない
6. Phase 13 はユーザーの明示承認がない限り blocked のままにする

### ステップ2: Task 12-1 実行（実装ガイド作成）

`outputs/phase-12/implementation-guide.md` を 2パート構成で作成する。

### ステップ3: Task 12-2 実行（システム仕様書更新）

上記「Task 12-2」の Step 1-A〜1-D と Step 2 を順番に実行する。

### ステップ4: Task 12-3 実行（変更履歴記録）

上記コマンドを実行し、`documentation-changelog.md` を作成する。
LOGS.md と SKILL.md を両スキルで更新する。

### ステップ5: Task 12-4 実行（未タスク検出）

`rg` コマンドで TODO/FIXME/HACK/XXX を確認し、`unassigned-task-detection.md` を作成する。

### ステップ6: Task 12-5 実行（スキルフィードバック作成）

`skill-feedback-report.md` を作成し、改善点あり/なしを記録する。

### ステップ7: Task 12-6 実行（準拠チェック）

Task 12-1〜12-5 が全て完了していることを確認し、`phase12-task-spec-compliance-check.md` を作成する。

---

## 成果物

| 成果物                     | 配置先                                                   | 形式     |
| -------------------------- | -------------------------------------------------------- | -------- |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`               | Markdown |
| system spec update summary | `outputs/phase-12/system-spec-update-summary.md`         | Markdown |
| documentation changelog    | `outputs/phase-12/documentation-changelog.md`            | Markdown |
| unassigned task detection  | `outputs/phase-12/unassigned-task-detection.md`          | Markdown |
| skill feedback report      | `outputs/phase-12/skill-feedback-report.md`              | Markdown |
| phase 12 compliance check  | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Markdown |

---

## 完了条件

- [ ] 実装ガイドが 2パート構成（中学生レベル + 技術者向け）で作成されている
- [ ] system spec update summary が Step 1-A〜2 を含んでいる
- [ ] documentation changelog が current / baseline / validator を含んでいる
- [ ] `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` が更新されている
- [ ] `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` が更新されている
- [ ] `.claude` 正本と `.agents` mirror の差分が揃っている
- [ ] `topic-map.md` と `keywords.json` が再生成されている
- [ ] unassigned task detection が 0件でも出力されている
- [ ] skill feedback report が改善点あり/なしを問わず出力されている
- [ ] phase12-task-spec-compliance-check が PASS である
- [ ] `planned wording` が残っていない

---

## タスク100%実行確認【必須】

- [ ] T-12-1: 実装ガイド作成を完了済み（2パート構成であること）
- [ ] T-12-2: system spec update summary を完了済み（Step 1-A〜2 を含むこと）
- [ ] T-12-3: documentation changelog と履歴同期を完了済み（LOGS.md / SKILL.md 両方更新済み）
- [ ] T-12-4: unassigned task detection を完了済み（0件でも出力されていること）
- [ ] T-12-5: skill feedback report を完了済み（改善点あり/なしを含むこと）
- [ ] T-12-6: phase12-task-spec-compliance-check を完了済み（PASS であること）

---

## 次Phase

**Phase 13: PR作成** — ユーザーの明示承認がある場合のみ blocked を解除する。

**Phase 13 開始条件**: ユーザーの明示的な承認がない限り blocked のまま維持する。
