# Phase 11: 手動テスト検証

## メタ情報

| 項目      | 値                                                                                              |
| --------- | ----------------------------------------------------------------------------------------------- |
| タスクID  | UT-IMP-PHASE12-TWO-WORKFLOW-EVIDENCE-BUNDLE-001                                                 |
| Phase     | 11                                                                                              |
| 機能名    | Phase 12 2workflow同時監査の証跡集約ガード                                                      |
| 作成日    | 2026-03-03                                                                                      |
| 前提Phase | Phase 10（最終レビュー）完了                                                                    |
| 目的      | 2workflow同時監査の証跡集約テンプレート・チェックリスト・判定手順を手動ウォークスルーで検証する |
| 成果物    | `outputs/phase-11/manual-test-result.md`, `outputs/phase-11/walkthrough-log.md`                 |

## 目的

本タスクはドキュメント改善タスク（コード実装なし・UIなし）であるため、手動テストは「証跡集約テンプレートの適用ウォークスルー」「Task 1/3/4/5 実体確認チェックリストの網羅検証」「current/baseline分離判定の動作確認」「台帳同期手順のウォークスルー」を対象とする。スクリーンショット取得は不要。

## 実行タスク

- Task 1: 2workflow同時監査テスト — 2つの既存ワークフローを対象に `verify-all-specs` / `validate-phase-output` を実行し、結果を同一フォーマットで集約できることを確認
- Task 2: Task 1/3/4/5 実体確認チェックリスト検証 — 成果物実体確認のチェック項目を全て埋められることを確認
- Task 3: current/baseline分離判定テスト — `audit-unassigned-tasks.js --json` の出力から `currentViolations.total` と `baselineViolations.total` を分離記録できることを確認
- Task 4: 台帳同期手順ウォークスルー — `task-workflow.md` / `lessons-learned.md` への同期手順が再現可能であることを確認
- Task 5: リグレッションテスト — 既存のPhase 12ワークフローと監査スクリプトが互換動作すること

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名               | パス                                                                           | 説明                 |
| -------------------- | ------------------------------------------------------------------------------ | -------------------- |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | レイヤー構成         |
| タスクワークフロー   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 完了記録・残課題規約 |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`    | 検証・証跡の品質基準 |
| ディレクトリ構成     | `.claude/skills/aiworkflow-requirements/references/directory-structure.md`     | 参照パスと配置規約   |
| 教訓集               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 過去の教訓           |
| 仕様更新ワークフロー | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Phase 12更新手順     |
| Phase 11/12ガイド    | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | 手動テスト詳細手順   |
| 既知の落とし穴       | `.claude/rules/06-known-pitfalls.md`                                           | 過去インシデント教訓 |

### タスク固有参照

| 資料名                 | パス                                         | 説明           |
| ---------------------- | -------------------------------------------- | -------------- |
| Phase 1 要件定義書     | `outputs/phase-1/requirements-definition.md` | 要件確認       |
| Phase 2 設計書         | `outputs/phase-2/architecture-design.md`     | 設計確認       |
| Phase 5 実装サマリー   | `outputs/phase-5/implementation-summary.md`  | 実装内容       |
| Phase 6 カバレッジ     | `outputs/phase-6/coverage-report.md`         | 拡充テスト結果 |
| Phase 6 統合テスト     | `outputs/phase-6/integration-test.md`        | 拡充テスト結果 |
| Phase 7 カバレッジ     | `outputs/phase-7/coverage-report.md`         | 再測定結果     |
| Phase 8 リファクタログ | `outputs/phase-8/refactoring-log.md`         | 変更履歴確認   |
| Phase 9 品質レポート   | `outputs/phase-9/quality-report.md`          | 品質判定確認   |
| Phase 10 レビュー結果  | `outputs/phase-10/final-review-result.md`    | レビュー結果   |

## テストカテゴリ

本タスクはドキュメント改善タスクのため、以下のカテゴリで手動テストを実施する:

- **機能テスト（手動ウォークスルー）**: 証跡集約テンプレート・チェックリスト・判定手順の適用確認
- **リグレッションテスト**: 既存Phase 12ワークフローと監査スクリプトの互換動作確認

## テストケース

### Task 1: 2workflow同時監査テスト

| No  | テスト項目                          | 前提条件                                                                                                                                            | 操作手順                                                                                                                                                                                                                                | 期待結果                                                                                               | 実行結果 | 備考 |
| --- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | ---- |
| 1   | verify-all-specs 2workflow同時実行  | `docs/30-workflows/skill-editor-view` と `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW` の2つのワークフローディレクトリが存在する | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-editor-view --json` と `--workflow docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW --json` を順次実行する | 両方とも正常終了し、JSON出力が返ること                                                                 |          |      |
| 2   | 結果の同一フォーマット集約          | No.1で2つのJSON出力が得られている                                                                                                                   | 2つのJSON結果を1つのMarkdownテーブルに集約する                                                                                                                                                                                          | ワークフロー名・Phase数・合格数・不合格数が1テーブルに並び、比較可能であること                         |          |      |
| 3   | validate-phase-output 2workflow実行 | 同上の2ワークフローが存在                                                                                                                           | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-editor-view` と `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW` を順次実行する                                | 両方とも正常終了し、Phase成果物の検証結果が返ること                                                    |          |      |
| 4   | 集約結果の差分確認                  | No.2の集約テーブルが完成                                                                                                                            | 2workflow間で「合格Phase数」と「不合格Phase数」の差分を視認する                                                                                                                                                                         | 差分が数値で明確に比較できること（「ワークフローA: 合格12/不合格1」「ワークフローB: 合格13/不合格0」） |          |      |

### Task 2: Task 1/3/4/5 実体確認チェックリスト検証

| No  | テスト項目                                | 前提条件                                         | 操作手順                                                                                                  | 期待結果                                                                                                                                         | 実行結果 | 備考 |
| --- | ----------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ---- |
| 5   | Task 1（実装ガイド）実体確認              | Phase 12仕様書のTask 1チェック項目一覧が確定済み | チェックリストの「Part 1 中学生レベル概念説明あり」「Part 2 技術詳細あり」の2項目を、成果物ファイルで確認 | 2項目ともチェック可能であること（ファイル存在+内容にPart 1とPart 2セクションが含まれる）                                                         |          |      |
| 6   | Task 3（documentation-changelog）実体確認 | Phase 12仕様書のTask 3チェック項目一覧が確定済み | チェックリストの「各Stepの完了結果が詳細に記録」を、成果物ファイルで確認                                  | `documentation-changelog.md` にStep 1-A〜Step 2の各完了結果が個別に記録されていること                                                            |          |      |
| 7   | Task 4（未タスク検出）実体確認            | Phase 12仕様書のTask 4チェック項目一覧が確定済み | チェックリストの「0件でも出力必須」「3ステップ全完了」を成果物ファイルで確認                              | `unassigned-task-detection.md` が存在し、検出結果サマリーテーブルが含まれていること（0件の場合も「検出タスクなし」が明記）                       |          |      |
| 8   | Task 5（スキルフィードバック）実体確認    | Phase 12仕様書のTask 5チェック項目一覧が確定済み | チェックリストの「改善点なしでも出力必須」を成果物ファイルで確認                                          | `skill-feedback-report.md` が存在し、確認観点テーブル（テンプレート改善・ワークフロー改善・ドキュメント改善・新規Pitfall候補）が含まれていること |          |      |
| 9   | チェックリスト全項目の充足確認            | No.5〜8が全てPASS                                | Phase 12仕様書の完了条件セクション全チェックボックスを確認                                                | Task 1/3/4/5の全チェック項目に対応する成果物が存在し、「実体なし」の項目が0件であること                                                          |          |      |

### Task 3: current/baseline分離判定テスト

| No  | テスト項目                                | 前提条件                           | 操作手順                                                                                         | 期待結果                                                                         | 実行結果 | 備考 |
| --- | ----------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | -------- | ---- |
| 10  | audit-unassigned-tasks JSON出力の構造確認 | `audit-unassigned-tasks.js` が存在 | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json` を実行 | JSON出力に `currentViolations` と `baselineViolations` の2つのキーが含まれること |          |      |
| 11  | current/baseline分離記録                  | No.10のJSON出力が得られている      | 出力JSONから `currentViolations.total` と `baselineViolations.total` を抽出して記録              | `current: 0, baseline: N` の形式で記録されること                                 |          |      |
| 12  | currentViolations基準の合否判定           | No.11の記録済みデータ              | `currentViolations.total === 0` で合格、`> 0` で不合格と判定                                     | baseline値に関係なく、current値のみで合否が決定されること                        |          |      |

### Task 4: 台帳同期手順ウォークスルー

| No  | テスト項目                          | 前提条件                                                                         | 操作手順                                                                                          | 期待結果                                                                                               | 実行結果 | 備考 |
| --- | ----------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | ---- |
| 13  | task-workflow.md 同期手順の再現性   | `task-workflow.md` が存在し、完了タスクセクションがある                          | Phase 12仕様書のStep 1-A手順に従い、`task-workflow.md` に完了タスクセクションの追加をシミュレート | 追加テンプレートのフィールド（タスクID・ステータス・概要・変更種別・テスト数）が全て記入可能であること |          |      |
| 14  | lessons-learned.md 同期手順の再現性 | `lessons-learned.md` が存在                                                      | Phase 12仕様書のStep 2手順に従い、教訓の追加をシミュレート                                        | 教訓テンプレートのフィールド（教訓・解決策・関連Pitfall ID・関連タスク）が全て記入可能であること       |          |      |
| 15  | LOGS.md 2ファイル同期（P1/P25対策） | `aiworkflow-requirements/LOGS.md` と `task-specification-creator/LOGS.md` が存在 | 2ファイル同時に完了エントリの追加をシミュレートし、内容が一致することを確認                       | 2ファイルの完了エントリが同一タスクID・同一日付で記録され、内容が一致すること                          |          |      |

### Task 5: リグレッションテスト

| No  | テスト項目                          | 前提条件                                     | 操作手順                                                                                                                                                                                                              | 期待結果                                                                          | 実行結果 | 備考 |
| --- | ----------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | -------- | ---- |
| 16  | verify-all-specs.js 互換動作        | 既存の完了済みワークフローディレクトリが存在 | `node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-editor-view --json` を実行                                                                             | 正常終了し、JSON出力が返ること（エラー終了しないこと）                            |          |      |
| 17  | validate-phase-output.js 互換動作   | 既存の完了済みワークフローディレクトリが存在 | `node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW` を実行                                                               | 正常終了し、Phase出力の検証結果が返ること                                         |          |      |
| 18  | verify-unassigned-links.js 互換動作 | 未タスクディレクトリが存在                   | `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行                                                                                                                            | 正常終了し、参照切れの検証結果が返ること                                          |          |      |
| 19  | audit-unassigned-tasks.js 互換動作  | 未タスクディレクトリが存在                   | `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-two-workflow-evidence-bundle-001.md` を実行 | 正常終了し、JSON出力に `currentViolations` と `baselineViolations` が含まれること |          |      |

## 統合テスト連携

| 統合テスト観点              | 確認方法                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------- |
| 自動テスト結果との整合      | Phase 9の品質成果物と手動テスト結果に矛盾がないことを確認                              |
| 既存ワークフローとの互換    | 完了済みタスク（completed-tasks/）の既存ワークフローが本改善後も正常動作することを確認 |
| Phase 12 入力情報の引き渡し | 発見事項を `manual-test-result.md` に記録し Phase 12 へ連携                            |

## 多角的チェック観点

| 観点             | 適用判断                                       | 仕様参照先                         |
| ---------------- | ---------------------------------------------- | ---------------------------------- |
| セキュリティ     | 非該当（ドキュメント改善タスク、コードなし）   | -                                  |
| UI/UX            | 非該当（仕様書・テンプレートのみ、UIなし）     | -                                  |
| アーキテクチャ   | 非該当（構造変更なし）                         | -                                  |
| パフォーマンス   | 非該当（ランタイム変更なし）                   | -                                  |
| アクセシビリティ | 非該当（UI変更なし）                           | -                                  |
| 型安全性         | 非該当（TypeScript変更なし）                   | -                                  |
| テスト戦略       | 適用（手動ウォークスルーの網羅性）             | `.claude/rules/02-code-quality.md` |
| 運用互換性       | 適用（既存スクリプトの互換動作・台帳同期手順） | `spec-update-workflow.md`          |

## 実行手順

### ステップ1: テスト環境準備

1. 本ブランチ（`feature/phase12-two-workflow-evidence-bundle`）がチェックアウトされていることを確認
2. `pnpm install` で依存関係を最新化
3. Phase 10 成果物（`outputs/phase-10/final-review-result.md`）が存在することを確認
4. テスト対象の2ワークフローディレクトリが存在することを確認:
   - `docs/30-workflows/skill-editor-view`
   - `docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW`

### ステップ2: 2workflow同時監査テスト実行（No.1〜4）

テストケース No.1〜4 を順番に実行し、結果を記録する。

検証コマンド:

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-editor-view --json
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-editor-view
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW
```

### ステップ3: Task 1/3/4/5 実体確認チェックリスト検証（No.5〜9）

テストケース No.5〜9 を実行し、Phase 12成果物の実体確認チェック項目が全て充足可能であることを確認する。

### ステップ4: current/baseline分離判定テスト実行（No.10〜12）

テストケース No.10〜12 を実行し、current/baseline分離判定の動作を確認する。

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
```

### ステップ5: 台帳同期手順ウォークスルー（No.13〜15）

テストケース No.13〜15 を実行し、`task-workflow.md` / `lessons-learned.md` / `LOGS.md` への同期手順が再現可能であることを確認する。

### ステップ6: リグレッションテスト実行（No.16〜19）

テストケース No.16〜19 を実行し、既存スクリプトの互換動作を確認する。

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/skill-editor-view --json
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/TASK-UI-05-SKILL-CENTER-VIEW
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-two-workflow-evidence-bundle-001.md
```

### ステップ7: 結果レポート作成

テスト結果を以下のファイルに記録する:

- `outputs/phase-11/manual-test-result.md`: 全テストケースの実行結果サマリー
- `outputs/phase-11/walkthrough-log.md`: ウォークスルーの詳細ログ

## 成果物

| 成果物             | パス                                     | 必須 | 説明                   |
| ------------------ | ---------------------------------------- | ---- | ---------------------- |
| 手動テスト結果     | `outputs/phase-11/manual-test-result.md` | ✅   | 手動テスト結果レポート |
| ウォークスルーログ | `outputs/phase-11/walkthrough-log.md`    | ✅   | ウォークスルー詳細ログ |

## 完了条件

- [ ] テストケース No.1〜4（2workflow同時監査テスト）が全て実行済みで結果が記録されている
- [ ] テストケース No.5〜9（Task 1/3/4/5 実体確認チェックリスト検証）が全て実行済みで結果が記録されている
- [ ] テストケース No.10〜12（current/baseline分離判定テスト）が全て実行済みで結果が記録されている
- [ ] テストケース No.13〜15（台帳同期手順ウォークスルー）が全て実行済みで結果が記録されている
- [ ] テストケース No.16〜19（リグレッションテスト）が全て実行済みで結果が記録されている
- [ ] 全19テストケースがPASSしている（FAILがある場合は原因調査と対応を記録）
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] `outputs/phase-11/walkthrough-log.md` が作成されている
- [ ] artifacts.json が更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. テスト環境準備（ブランチ確認、依存関係インストール、対象ワークフロー存在確認）
2. Task 1: 2workflow同時監査テスト No.1〜4 実行
3. Task 2: Task 1/3/4/5 実体確認チェックリスト検証 No.5〜9 実行
4. Task 3: current/baseline分離判定テスト No.10〜12 実行
5. Task 4: 台帳同期手順ウォークスルー No.13〜15 実行
6. Task 5: リグレッションテスト No.16〜19 実行
7. テスト結果レポート作成（manual-test-result.md + walkthrough-log.md）
8. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/phase12-two-workflow-evidence-bundle --phase 11
```

## 次のPhase

Phase 12: ドキュメント更新
