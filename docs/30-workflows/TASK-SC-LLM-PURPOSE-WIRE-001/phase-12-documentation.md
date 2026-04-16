# Phase 12: ドキュメント更新 -- extract-purpose LLM 実結果差し替え

## メタ情報

| 項目       | 値                           |
| ---------- | ---------------------------- |
| Phase番号  | 12                           |
| 機能名     | llm-purpose-wire             |
| タスクID   | TASK-SC-LLM-PURPOSE-WIRE-001 |
| 作成日     | 2026-04-16                   |
| 依存 Phase | Phase 11（手動テスト）       |

## 目的

TASK-SC-LLM-PURPOSE-WIRE-001 の実装完了を受け、実装ガイド・system spec 更新サマリー・更新履歴・未タスク検出・スキルフィードバック・準拠チェックの 6 成果物を同一 wave で閉じる。
Step 1-A〜1-G と Step 2 を、current facts と validator 実測値に基づいて記録し、planned wording を残さずに閉じる。

## 実行タスク（全6タスク必須）

### Task 12-1: 実装ガイド作成

`outputs/phase-12/implementation-guide.md` を作成する。

- Part 1 は中学生レベルの概念説明とし、日常の例え話と `たとえば` を必ず含める
- Part 1 は「なぜ必要か」を先に説明し、その後で「何をするか」を説明する
- Part 2 は開発者向け詳細とし、`interface` または `type`、API シグネチャ、使用例、エラーハンドリング、エッジケース、設定可能なパラメータや定数一覧を省略しない
- Part 2 では current contract と target delta を分け、実装済みと書く前に今回 wave の更新対象を明確にする
- 変更がない部分は no-op として明記し、差分を捏造しない

検証には `references/phase12-checklist-definition.md` と `validate-phase12-implementation-guide.js` を使う。

### Task 12-2: システム仕様書更新

`outputs/phase-12/system-spec-update-summary.md` を新規作成し、Step 1-A〜1-G と Step 2 の実施結果を記録する。

#### Step 1-A: タスク完了記録

- `## 完了タスク` セクションを関連仕様書に追加する
- `## 関連ドキュメント` セクションに実装ガイドへのリンクを追加する
- `.claude/skills/aiworkflow-requirements/LOGS.md` を更新する
- `.claude/skills/task-specification-creator/LOGS.md` を更新する
- `.claude/skills/aiworkflow-requirements/SKILL.md` の変更履歴を更新する
- `.claude/skills/task-specification-creator/SKILL.md` の変更履歴を更新する
- `skill-creator` を更新した場合のみ、`.claude/skills/skill-creator/LOGS.md` と `.claude/skills/skill-creator/SKILL.md` も同波で更新する

#### Step 1-B: 実装状況テーブル更新

- 実装完了タスクは `completed` に更新する
- 仕様書作成のみのタスクに限り `spec_created` を使う
- 更新対象の仕様書が実在することを事前に確認する

#### Step 1-C: 関連タスクテーブル更新

- `grep -rn "TASK-SC-LLM-PURPOSE-WIRE-001" .claude/skills/aiworkflow-requirements/references/` を実行する
- マッチした仕様書の関連タスクや未タスク候補のステータスを current facts に合わせて更新する
- `task-workflow.md` / `task-workflow-completed.md` / `references/` の値が食い違う場合は同一 wave で是正する

#### Step 1-D: topic-map.md 再生成

- `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行する
- `aiworkflow-requirements/indexes/topic-map.md` の行番号が current facts と一致することを確認する

#### Step 1-E: 未タスク指示書とリンク整合

- 未タスク候補がある場合は `docs/30-workflows/unassigned-task/` に指示書を作成する
- `task-workflow.md` の残課題テーブルへ登録する
- 関連仕様書へ参照リンクを追加する
- `verify-unassigned-links.js` と `audit-unassigned-tasks.js` の結果を記録する

#### Step 1-F: DevOps / UI / screenshot の追加同期

- このタスクでは原則 N/A だが、関連 spec に CI / UI / screenshot 要件がある場合のみ追記する
- N/A の場合でも理由を `system-spec-update-summary.md` に残す

#### Step 1-G: 検証コマンド順次実行

- `quick_validate.js` で `skill-creator` / `task-specification-creator` / `aiworkflow-requirements` を確認する
- `validate_all.js` / `verify-all-specs` / `audit --diff-from HEAD` / `validate-phase-output` など、必要な validator を実行する
- `current` と `baseline` を分離し、同じ値に見えても混在させない

#### Step 2: システム仕様更新

- 新規インターフェース、既存インターフェース変更、新規定数、API 変更がある場合のみ実施する
- このタスクでは、実際に system spec を更新したか、N/A かを `system-spec-update-summary.md` に明記する
- internal 実装のみで public contract 変更がない場合は N/A とし、判断根拠を残す

### Task 12-3: ドキュメント更新履歴

`outputs/phase-12/documentation-changelog.md` を作成する。

- 変更したファイル一覧を列挙する
- Step 1-A で更新した `.claude/skills/aiworkflow-requirements/LOGS.md` / `.claude/skills/task-specification-creator/LOGS.md` / 変更した `SKILL.md` の canonical path を列挙する
- validator 実行結果、current / baseline、artifacts 同期結果を記録する
- `outputs/phase-12/*.md` の 6 成果物が same-wave で揃っていることを記録する
- `system-spec-update-summary.md` と `phase12-task-spec-compliance-check.md` の値を一致させる
- planned wording（`計画` / `予定` / `TODO` など）を残さない
- `documentation-changelog.md` は全タスク完了後に作成する

### Task 12-4: 未タスク検出レポート

`outputs/phase-12/unassigned-task-detection.md` を作成する。0件でも必須。

基本ソースは Phase 11 手動テスト結果、Phase 3/10 の MINOR 指摘、TODO/FIXME/HACK/XXX、そしてこのタスク固有の未解決リスクとする。

検出観点は次のとおり。

| 検出観点               | 内容                                         |
| ---------------------- | -------------------------------------------- |
| purpose 文字列の正規化 | トリミング、改行除去、長さ制限の要否         |
| LLM タイムアウト設定   | purpose 抽出専用の timeout が必要か          |
| 空文字列フォールバック | 空文字時のデフォルト値や再試行が必要か       |
| 追加の統合テスト       | 実 LLM なしでも後続 contract を確認できるか  |
| 後方互換               | `llmClient` 省略時の挙動を追加で固定すべきか |

未タスクが 1 件以上ある場合は、物理ファイル作成・残課題登録・参照リンク追加の 3 ステップを全て実施する。

### Task 12-5: スキルフィードバックレポート

`outputs/phase-12/skill-feedback-report.md` を作成する。

- フィードバック対象は `task-specification-creator` と `aiworkflow-requirements`
- 必要に応じて `skill-creator` への派生改善も同じレポートに含める
- 改善点がない場合も「改善点なし」と明記する

### Task 12-6: phase12-task-spec-compliance-check

`outputs/phase-12/phase12-task-spec-compliance-check.md` を作成し、Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 の根拠を 1 ファイルに集約する。

#### SubAgent 分担

| SubAgent | 関心ごと                  | 主担当                                                     | 完了条件                                                                                         |
| -------- | ------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| A        | workflow 状態             | `phase-12-documentation.md` と `outputs/phase-12` 実体突合 | Task 12-1〜12-5、進捗 100%、`task-workflow.md` / `task-workflow-completed.md` / completed が一致 |
| B        | implementation guide 品質 | Part 1 / Part 2 の必須要素確認                             | `たとえば`、型、API、エッジケース、設定が揃う                                                    |
| C        | system spec 同期          | task-workflow / lessons / logs への転記                    | 実装内容、苦戦箇所、5分解決カードが同期                                                          |
| D        | 未タスク整合              | 配置先、監査値、リンク確認                                 | `docs/30-workflows/unassigned-task/` と `currentViolations=0` が一致                             |
| E        | validator 実行            | verify / validate / mirror parity                          | 検証値が outputs と system spec で一致                                                           |

#### 最低限必要な内容

- `outputs/phase-12/` の 6 成果物の存在確認
- Task 12-1〜12-5 の実質監査
- Step 1-A〜1-G の実更新確認
- Step 2 の実施有無と理由
- `artifacts.json` と `outputs/artifacts.json` の parity
- planned wording の残置なし確認
- current と baseline の分離記録

## 参照資料

| 資料名                          | パス                                                                                        | 用途                         |
| ------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 11 手動テスト結果         | `docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/outputs/phase-11/manual-test-result.md`     | non-visual の前提確認        |
| Phase 12 ドキュメント更新ガイド | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | Task 12-1〜12-6 の詳細       |
| Phase 12 チェックリスト定義     | `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`      | 実体確認の基準               |
| システム仕様更新ワークフロー    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`              | Step 1 / Step 2 / validation |
| Phase 12 タスク仕様準拠チェック | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | compliance-check の骨格      |

## 成果物

| 成果物                       | パス                                                     | 形式     |
| ---------------------------- | -------------------------------------------------------- | -------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`               | Markdown |
| システム仕様書更新サマリー   | `outputs/phase-12/system-spec-update-summary.md`         | Markdown |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`            | Markdown |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`          | Markdown |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`              | Markdown |
| Phase 12 準拠チェック        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Markdown |

## 完了条件

- [ ] implementation-guide.md の Part 1 と Part 2 が作成されている
- [ ] system-spec-update-summary.md が作成され、Step 1 / Step 2 の判断が記録されている
- [ ] documentation-changelog.md が全タスク完了後に作成されている
- [ ] unassigned-task-detection.md が 0 件でも作成されている
- [ ] skill-feedback-report.md が作成されている
- [ ] phase12-task-spec-compliance-check.md が作成されている
- [ ] aiworkflow-requirements/LOGS.md と task-specification-creator/LOGS.md が更新されている
- [ ] aiworkflow-requirements/SKILL.md と task-specification-creator/SKILL.md の変更履歴が更新されている
- [ ] topic-map.md の再生成要否が判断され、必要なら実行されている
- [ ] `artifacts.json` と `outputs/artifacts.json` の parity を記録している
- [ ] `phase-12-documentation.md` のステータスと成果物実体が同期している
- [ ] planned wording が残っていない
- [ ] **本Phase内の全タスクを100%実行完了**

## 次の Phase

Phase 13: PR作成（`phase-13-pr-creation.md`）
