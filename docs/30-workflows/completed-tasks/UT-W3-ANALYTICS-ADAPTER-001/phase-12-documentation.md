# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                                         |
| ---------- | ------------------------------------------------------------ |
| Phase      | 12                                                           |
| タスクID   | UT-W3-ANALYTICS-ADAPTER-001                                  |
| タスク名   | trackEvent analytics adapter差し替え（本番分析基盤への接続） |
| 前提Phase  | Phase 11                                                     |
| 後続Phase  | Phase 13                                                     |
| 作成日     | 2026-04-11                                                   |
| ステータス | 完了（Phase 12 close-out / Phase 13 blocked）                |

## 目的

実装ガイド作成（Part 1/2）・システム仕様書更新（Step 1-A〜1-D）・
ドキュメント更新履歴作成・未タスク検出レポート作成・スキルフィードバックレポート作成・
Phase 12仕様適合チェックを行う。

## Phase 12 記録分離方針

- `実行タスク`はplan、`Phase実行記録`と`outputs/phase-12/*.md`はcurrent factとして扱う
- `phase12-task-spec-compliance-check.md`はTask/Step/validator/artifacts.json/current-baselineの同値性を集約するroot evidenceとして必ず作成する
- 仕様更新の有無は`documentation-changelog.md`と`system-spec-update-summary.md`で同じ結論にする

## 実行タスク

### Task 12-1: 実装ガイド作成（2パート構成）

**目的**: 初学者向けPart 1と技術者向けPart 2の2パート構成で実装ガイドを作成する

**実行手順**:

**Part 1（中学生レベル）**:

1. 日常生活での例え話を含める（たとえば analytics = 「お店の入退店カウンター」等）
2. 専門用語を使わず、「なぜ必要か」を先に説明する
3. no-opスタブ→本番sinkへの差し替えを平易に説明する
4. IPC経由通信を「受付窓口（Preload）→内線電話（IPC）→バックオフィス（Main）」等で例える

**Part 2（技術者レベル）**:

1. `AnalyticsAdapter`インターフェース/型定義（TypeScript）を記載する
2. IPCチャネル名・`ALLOWED_INVOKE_CHANNELS`追加箇所を記載する
3. `analyticsAdapter.ts`のAPIシグネチャと使用例を記載する
4. オフラインキューのパラメータ（上限件数・TTL）を一覧化する
5. エラーハンドリング（no-opフォールバック）とエッジケースを説明する
6. **実装済みコードからgrepで識別子を確認する**（identifier drift防止、[Feedback W1-02b-3]対策）
7. validator要件（対象ファイル・コマンド・合格条件）を明記する

**期待される成果物**:

- `outputs/phase-12/implementation-guide.md`

### Task 12-2: システム仕様書更新（Step 1-A〜1-D + 条件付きStep 2）

**目的**: aiworkflow-requirementsシステム仕様書を更新する

**Step 1-A: タスク完了記録**:

- 「完了タスク」セクションに追加
- 関連ドキュメントリンク
- 変更履歴（LOGS.md×2）
- `aiworkflow-requirements/SKILL.md` 変更履歴更新
- `task-specification-creator/SKILL.md` 変更履歴更新
- topic-map.md/keywords.json更新

**Step 1-B: 実装状況テーブル更新**:

- 実装完了: `未実施` → `完了`
- 仕様書作成のみの場合: `spec_created`

**Step 1-C: 関連タスクテーブル更新**:

- 仕様書内の「関連タスク」「未タスク候補」テーブルのステータス更新

**Step 1-D: topic-map.md / keywords.json 再生成**:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js \
  --workflow docs/30-workflows/UT-W3-ANALYTICS-ADAPTER-001 --regenerate
```

**Step 2（条件付き）**:

- 新規インターフェース（`AnalyticsAdapter`型）追加時はStep 2を実施する
- 新規IPCチャネル定義追加時はStep 2を実施する

**期待される成果物**:

- `outputs/phase-12/system-spec-update-summary.md`

### Task 12-3: ドキュメント更新履歴作成

**目的**: 全Step（1-A/1-B/1-C/1-D/Step 2）の結果を記録した更新履歴を作成する

**実行手順**:

1. 全Step（1-A/1-B/1-C/1-D + 条件付きStep 2）の結果を個別に明記する
2. 「該当なし」も記録する
3. workflow-local同期とglobal skill syncを別ブロックで記録する（[FB-BEFORE-QUIT-003]対策）
4. `artifacts.json`と`outputs/artifacts.json`が同期していることを確認する

**期待される成果物**:

- `outputs/phase-12/documentation-changelog.md`

### Task 12-4: 未タスク検出レポート作成（0件でも必須）

**目的**: 残課題・スコープ外発見事項を`current`と`baseline`に分離して記録する

**確認ソース**:

- 元タスク仕様書のスコープ外明示項目
- Phase 3/10レビュー結果のMINOR判定指摘事項
- Phase 11手動テストのスコープ外発見事項
- コードコメントのTODO/FIXME/HACK/XXX
- `describe.skip`ブロック

```bash
# 未タスク検出スクリプト
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src --output .tmp/unassigned-candidates.json
```

**候補（既知）**:

- analytics ダッシュボードUI・集計機能（スコープ外）
- `SkillAnalytics`/`AnalyticsStore`との統合（スコープ外）
- analytics providerのA/Bテスト切り替え機能

**期待される成果物**:

- `outputs/phase-12/unassigned-task-detection.md`（0件でも必須）

### Task 12-5: スキルフィードバックレポート作成（改善点なしでも必須）

**目的**: task-specification-creatorスキルへのフィードバックを記録する

**記録観点**:

- テンプレート改善: Phase仕様書テンプレートの漏れや曖昧さ
- ワークフロー改善: 機械検証や手順分岐の改善余地
- ドキュメント改善: 横断ガイドライン化の候補

**期待される成果物**:

- `outputs/phase-12/skill-feedback-report.md`（改善点なしでも必須）

### Task 12-6: Phase 12仕様適合チェック

**目的**: Phase 12の全成果物が仕様要件を満たしているかをroot evidenceとして確認する

**実行手順**:

1. Task/Step/validator/artifacts.json/current-baselineの同値性を確認する
2. `index.md` の phase status が `artifacts.json` と一致していることを確認する
3. 以下の成果物が全て存在することを確認する:
   - `outputs/phase-12/implementation-guide.md` ✓
   - `outputs/phase-12/system-spec-update-summary.md` ✓
   - `outputs/phase-12/documentation-changelog.md` ✓
   - `outputs/phase-12/unassigned-task-detection.md` ✓
   - `outputs/phase-12/skill-feedback-report.md` ✓
   - `outputs/phase-12/phase12-task-spec-compliance-check.md` ✓
4. `artifacts.json`のステータスが更新されていることを確認する

**期待される成果物**:

- `outputs/phase-12/phase12-task-spec-compliance-check.md`（root evidence）

## 三者同期チェックリスト（[FB-04]対策）

Phase 12 close-out前に以下の5ファイルを同一waveで同期する:

| ファイル                                    | 同期内容               | 状態 |
| ------------------------------------------- | ---------------------- | ---- |
| `artifacts.json`（workflow root）           | フェーズステータス更新 | [ ]  |
| `outputs/artifacts.json`（outputs root）    | 成果物一覧・参照整合   | [ ]  |
| aiworkflow-requirements/LOGS.md             | タスク完了記録         | [ ]  |
| task-specification-creator/LOGS.md          | 使用ログ追記           | [ ]  |
| task-workflow.md または相当ランインデックス | ワークフロー状態更新   | [ ]  |

## 参照資料

| 参照資料                       | パス                                                                                   |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| Phase 11 手動テスト結果        | `outputs/phase-11/manual-test-result.md`                                               |
| spec-update-workflow           | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         |
| phase-12-documentation-guide   | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` |
| FB-04: 三者同期チェック        | `.claude/skills/task-specification-creator/SKILL.md`                                   |
| FB-BEFORE-QUIT-003: 同期分離   | `.claude/skills/task-specification-creator/SKILL.md`                                   |
| W1-02b-3: identifier drift防止 | `.claude/skills/task-specification-creator/SKILL.md`                                   |

## 成果物

| 成果物                   | パス                                                     | 内容                           |
| ------------------------ | -------------------------------------------------------- | ------------------------------ |
| 実装ガイド（Part 1/2）   | `outputs/phase-12/implementation-guide.md`               | 中学生レベル+技術者レベル      |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-D + Step 2結果     |
| ドキュメント更新履歴     | `outputs/phase-12/documentation-changelog.md`            | 全Step結果記録                 |
| 未タスク検出レポート     | `outputs/phase-12/unassigned-task-detection.md`          | current/baseline分離記録       |
| スキルFBレポート         | `outputs/phase-12/skill-feedback-report.md`              | テンプレート・ワークフロー改善 |
| Phase 12適合チェック     | `outputs/phase-12/phase12-task-spec-compliance-check.md` | root evidence                  |

## 完了条件

- [ ] `implementation-guide.md` Part 1（日常の例え話含む）・Part 2（型定義・API）作成完了
- [ ] `implementation-guide.md`にvalidator要件（対象ファイル・コマンド・合格条件）が記録されていること
- [ ] `system-spec-update-summary.md` Step 1-A/1-B/1-C/1-D結果記録完了
- [ ] `documentation-changelog.md` 全Stepの結果を個別明記（「該当なし」も記録）
- [ ] `unassigned-task-detection.md` 作成完了（0件でも必須）
- [ ] `skill-feedback-report.md` 作成完了（改善点なしでも必須）
- [ ] `phase12-task-spec-compliance-check.md` root evidence作成完了
- [ ] `aiworkflow-requirements/SKILL.md` と `task-specification-creator/SKILL.md` の変更履歴更新完了
- [ ] `topic-map.md/keywords.json` 再生成完了
- [ ] 三者同期チェックリスト（5ファイル同一wave）完了
- [ ] `implementation-guide.md`内の識別子がgrepで実装と一致することを確認済み
- [ ] 本Phase内の全タスクを100%実行完了

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

## 次のPhase

Phase 13: PR作成（ユーザー明示承認後のみ）
