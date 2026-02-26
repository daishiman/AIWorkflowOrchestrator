# Phase 11: 手動テスト検証

## メタ情報

| 項目      | 内容                                                               |
| --------- | ------------------------------------------------------------------ |
| タスクID  | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                         |
| Phase     | 11                                                                 |
| 名称      | 手動テスト検証                                                     |
| 目的      | 自動テストでは検証できない運用フローと判断の再現性を手動で確認する |
| 前提Phase | Phase 10（最終レビューゲート）完了                                 |
| 次Phase   | Phase 12（ドキュメント更新）                                       |

## 目的

自動テストでは検証できない運用フローと判断の再現性を手動で確認する。具体的には、統一された検証コマンド（`quick_validate.js`）の実際の動作確認、同一入力に対する判定の一貫性検証、Phase 12 テンプレートの手順書ウォークスルー、および warning 出力の運用ルールとの整合性を検証する。

## 実行タスク

- 検証コマンド手動実行: `quick_validate.js` を各スキルに対して実行し、Error 0件と warning 分類結果を確認する
- 判定再現性テスト: 同一スキルに対する2回実行結果が完全一致すること（diff 0）を確認する
- 手順書ウォークスルー: Phase 12 テンプレートのコマンド列を初回担当者目線で実行し、詰まる箇所の有無を検証する
- warning 運用テスト: warning 出力を許容 / 要監視 / 要対応で分類し、判定時間が1分以内であることを確認する

## 参照資料

| 参照資料                   | パス                                                                                                   | 内容                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------- |
| Phase 1 要件定義           | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-1-requirements.md`                 | 受入基準（AC-001〜AC-006）      |
| Phase 2 設計               | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/phase-2-design.md`                       | 検証経路統一設計                |
| Phase 9 品質レポート       | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-9/quality-report.md`       | 自動品質検証の統合結果          |
| Phase 10 レビュー結果      | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-10/final-review-result.md` | 最終レビュー結果・指摘事項      |
| Phase 5 実装成果物         | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-5/`                        | 統一ルール・運用ルール定義      |
| Phase 6 テスト拡充成果物   | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-6/`                        | 拡充テストと回帰結果            |
| Phase 7 カバレッジ成果物   | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-7/`                        | カバレッジ判定結果              |
| Phase 8 リファクタ成果物   | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-8/`                        | 表現統一・重複排除の結果        |
| quick_validate.js          | `.claude/skills/skill-creator/scripts/quick_validate.js`                                               | 検証スクリプト正本              |
| spec-update-workflow.md    | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`                         | Phase 12 検証コマンド運用の正本 |
| phase-11-12-guide.md       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`                            | Phase 11/12 ガイド              |
| verify-unassigned-links.js | `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                         | 参照リンク検証スクリプト        |
| audit-unassigned-tasks.js  | `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`                          | 未タスク監査スクリプト          |
| 教訓集                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                                 | 過去の苦戦箇所と対策            |

## テストカテゴリ

| カテゴリ         | 目的                                                 | 判定基準                              |
| ---------------- | ---------------------------------------------------- | ------------------------------------- |
| 検証コマンド実行 | `quick_validate.js` を各スキルに対して実行し動作確認 | エラー0件、結果が出力フォーマット通り |
| 判定再現性       | 同一スキルに対する2回実行での結果一致確認            | 2回の出力が完全一致（diff 0）         |
| 手順書実行       | Phase 12 テンプレートのコマンドをそのまま実行        | 全コマンドが正常終了、詰まる箇所なし  |
| warning 解釈     | warning 出力を運用ルールに照らして判定               | 各 warning の対応が1分以内に決定可能  |

## 実行手順

### Task 1: 検証コマンド手動実行テスト

1. 以下の3つの検証コマンドを順に実行する:

   ```bash
   # task-specification-creator の検証
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator

   # aiworkflow-requirements の検証
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements

   # skill-creator の検証
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
   ```

2. 各実行結果について以下を確認する:
   - 終了コードが 0（エラーなし）であること
   - Error 件数が 0 件であること
   - Warning が分類表示されること（許容 / 要監視 / 要対応）
   - 出力フォーマットが設計書（Phase 2）で定義された形式と一致すること
   - aiworkflow-requirements は大量参照を含むため Warning が多い傾向がある点を認識した上で確認する

3. 不正なパスを指定した場合のエラーハンドリングを確認する:

   ```bash
   # 存在しないスキルパスの検証
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/non-existent-skill
   ```

   - 期待どおりのエラーメッセージが出力されること
   - スタックトレースが露出しないこと

### Task 2: 判定再現性テスト

1. 同一スキルに対して `quick_validate.js` を2回連続で実行する:

   ```bash
   # 1回目
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator > /tmp/run1.txt 2>&1

   # 2回目
   node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator > /tmp/run2.txt 2>&1

   # 差分確認
   diff /tmp/run1.txt /tmp/run2.txt
   ```

2. 判定基準:
   - diff の出力が空（差分0行）であること
   - タイムスタンプ等の動的要素がある場合は、判定結果部分のみ比較して一致すること

3. 3スキル全てに対して再現性を確認する

### Task 3: 手順書ウォークスルー

1. `spec-update-workflow.md` の検証コマンドセクションを開く
2. `phase-11-12-guide.md` の検証関連セクションを開く
3. 記載されたコマンド列を「初回担当者目線」でコピー&ペースト実行する
4. 以下の観点で確認する:
   - コマンドの実行パスに曖昧さがないか（相対パス vs 絶対パスの混在がないか）
   - 前提条件（Node.js バージョン、カレントディレクトリ）が明記されているか
   - コマンド実行後の期待結果が具体的に記載されているか
   - 「次に何をすべきか」の指示が明確か
   - 「100人中100人が同じ手順を実行し、同じ判定結果に至る」かどうかを評価する
5. 曖昧表現の検出:
   ```bash
   grep -rn "基準どおりに\|条件該当時に\|等\b\|状況を見て\|条件別に判断" \
     .claude/skills/task-specification-creator/references/spec-update-workflow.md \
     .claude/skills/task-specification-creator/references/phase-11-12-guide.md
   ```
6. 詰まった箇所がある場合は、箇所と改善案を記録する

### Task 4: warning 運用テスト

1. Task 1 の検証結果から warning 出力を収集する
2. 各 warning に対して、運用ルール（`spec-update-workflow.md` に記載）を適用する:

   | 分類   | 条件                         | 対応                                   |
   | ------ | ---------------------------- | -------------------------------------- |
   | 許容   | 既知パターン、機能影響なし   | 記録のみ、対応不要                     |
   | 要監視 | 新規パターン、潜在的影響あり | 未タスクとして記録、次回以降で対応検討 |
   | 要対応 | 機能影響あり、品質基準未達   | 即時対応必須                           |

3. Error と Warning の視覚的区別を確認する:
   - Error が Warning より先に（または視覚的に区別可能に）表示されているか
   - Phase 5 で定義した「Error 優先表示ルール」が機能しているか

4. 判定基準:
   - 各 warning の分類判定が1分以内に完了すること
   - 判定に迷う warning がある場合は、運用ルールの改善点として記録する

### Task 5: 補助スクリプト実行テスト

1. 参照切れチェック:

   ```bash
   node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
   ```

   - 参照切れ（broken link）が 0件であることを確認する

2. 違反件数チェック:

   ```bash
   node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json
   ```

   - `violations` の件数を記録する
   - Phase 10 時点の違反件数と比較し、増加がないことを確認する

### Task 6: 手動テスト結果レポート作成

1. `outputs/phase-11/manual-test-result.md` を作成する
2. テストケーステーブルを含める（下記テストケース表を使用）
3. 各テストケースの「実行結果」列に PASS / FAIL を記録する
4. 全テスト PASS の場合、総合判定を「Phase 11 PASS」と記録する
5. FAIL がある場合、不合格テストの詳細と改善提案を記録する

6. `outputs/phase-11/walkthrough-log.md` を作成する
7. 手順書ウォークスルーの記録を含める:
   - 実行した手順の詳細
   - 詰まった箇所（ある場合）と改善案
   - 曖昧表現の検出結果

## テストケース

| No  | カテゴリ     | テスト項目                      | 前提条件             | 操作手順                                                                  | 期待結果                         |
| --- | ------------ | ------------------------------- | -------------------- | ------------------------------------------------------------------------- | -------------------------------- |
| 1   | 検証コマンド | task-specification-creator 検証 | Node.js 実行環境あり | `node quick_validate.js .claude/skills/task-specification-creator` を実行 | エラー0件、warning 分類結果出力  |
| 2   | 検証コマンド | aiworkflow-requirements 検証    | 同上                 | `node quick_validate.js .claude/skills/aiworkflow-requirements` を実行    | 実行完了、warning が分類表示     |
| 3   | 検証コマンド | skill-creator 検証              | 同上                 | `node quick_validate.js .claude/skills/skill-creator` を実行              | 実行完了、結果がフォーマット通り |
| 4   | 判定再現性   | 同一スキル2回実行               | 同上                 | 同一コマンドを2回実行し `diff` で比較                                     | 出力が同一（diff 0）             |
| 5   | 手順書実行   | Phase 12 テンプレート実行       | Phase 12 仕様書あり  | テンプレートのコマンド列をコピー&ペースト実行                             | 全コマンドが正常終了             |
| 6   | warning 解釈 | warning 分類判定                | 検証結果出力あり     | warning を運用ルールで分類                                                | 各 warning の対応が1分以内に決定 |
| 7   | エッジケース | 存在しないスキルパス            | 同上                 | `node quick_validate.js .claude/skills/non-existent-skill` を実行         | 明示されたエラーメッセージ出力   |

## 統合テスト連携【必須】

- Phase 9 の品質レポートで全品質ゲートが通過済みであることを前提とする
- スクリプト実行結果の手動確認を通じて、自動テストでカバーされていない運用フローを検証する
- 手動テスト結果を Phase 12 の実装ガイド（Part 2）にコマンド実行例の実データとして反映する
- Warning 分類の結果を Phase 12 の `documentation-changelog.md` に反映する
- 手順一意性の確認結果を Phase 12 のスキルフィードバックレポートに反映する
- 手動テストで発見された問題は、Phase 12 の未タスク検出（Task 4）に引き継ぐ

## 多角的チェック観点（AIが判断）

| 観点         | 適用判断 | 理由                                                       |
| ------------ | -------- | ---------------------------------------------------------- |
| セキュリティ | 非該当   | 検証スクリプトは読み取り専用であり、書き込み操作を行わない |
| UI/UX        | 非該当   | ユーザー向け UI の変更を含まない                           |
| 運用フロー   | 該当     | Phase 12 テンプレートの実行可能性を手動で確認する必要あり  |
| 再現性       | 該当     | 同一入力に対する同一出力の保証を手動で検証する             |
| ドキュメント | 該当     | 手順書の可読性・実行可能性を初回担当者目線で検証する       |
| Warning 分類 | 該当     | Warning の運用ルール適用が人間の判断を要する               |

## 成果物

| 成果物             | パス                                                                                                  | 内容                               |
| ------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 手動テスト結果     | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-11/manual-test-result.md` | テストケーステーブルと総合判定結果 |
| ウォークスルーログ | `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-11/walkthrough-log.md`    | 手順書ウォークスルーの記録         |

## 完了条件

- [ ] テストケース No.1: task-specification-creator の検証コマンドが正常実行、エラー0件
- [ ] テストケース No.2: aiworkflow-requirements の検証コマンドが正常実行、warning が分類表示
- [ ] テストケース No.3: skill-creator の検証コマンドが正常実行、出力フォーマットが設計通り
- [ ] テストケース No.4: 判定再現性が確認されている（同一入力 → 同一出力、diff 0）
- [ ] テストケース No.5: Phase 12 テンプレートのコマンド列が全て正常終了
- [ ] テストケース No.6: 各 warning の分類判定が1分以内に完了
- [ ] テストケース No.7: 存在しないスキルパスに対して明示されたエラーメッセージが出力
- [ ] `verify-unassigned-links.js` で参照切れが 0件であることが確認されている
- [ ] `audit-unassigned-tasks.js --json` で違反件数が Phase 10 時点以下であることが確認されている
- [ ] `spec-update-workflow.md` 内に曖昧表現（「基準どおりに」「条件該当時に」「等」）がないことが grep で確認されている
- [ ] 手順書ウォークスルーで詰まる箇所がない（詰まる箇所がある場合は改善点を記録）
- [ ] `manual-test-result.md` が `outputs/phase-11/` に作成されている
- [ ] `walkthrough-log.md` が `outputs/phase-11/` に作成されている
- [ ] 総合判定（PASS / FAIL）が記録されている
- [ ] **本 Phase 内の全タスクを100%実行完了**

## サブタスク管理

| サブタスク                         | 担当   | 依存関係 | ステータス |
| ---------------------------------- | ------ | -------- | ---------- |
| Task 1: 検証コマンド手動実行       | 実行者 | なし     | pending    |
| Task 2: 判定再現性テスト           | 実行者 | Task 1   | pending    |
| Task 3: 手順書ウォークスルー       | 実行者 | なし     | pending    |
| Task 4: warning 運用テスト         | 実行者 | Task 1   | pending    |
| Task 5: 補助スクリプト実行テスト   | 実行者 | なし     | pending    |
| Task 6: 手動テスト結果レポート作成 | 実行者 | 全Task   | pending    |

## タスク100%実行確認【必須】

Phase 完了前に以下を確認する:

- [ ] 全テストケース（No.1〜No.7）が実行済みであること
- [ ] 補助スクリプト（verify-unassigned-links.js, audit-unassigned-tasks.js）が実行済みであること
- [ ] 全テストケースが PASS であること（FAIL がある場合は原因を記録し、Phase 12 に引き継ぐ）
- [ ] 手動テスト結果が `outputs/phase-11/manual-test-result.md` に保存されていること
- [ ] ウォークスルーログが `outputs/phase-11/walkthrough-log.md` に保存されていること

## 実行結果（2026-02-26）

| 項目                       | 結果                            | 証跡                                               |
| -------------------------- | ------------------------------- | -------------------------------------------------- |
| quick_validate 3スキル実行 | 完了（Error 0件）               | `outputs/phase-11/qv-*-run1.log`                   |
| 判定再現性（2回比較）      | 完了（diff 0）                  | `outputs/phase-11/qv-*.diff`                       |
| 不正パス異常系             | 完了（exit 3）                  | `outputs/phase-11/qv-invalid-path.log`             |
| 参照リンク検証             | 完了（missing 0）               | `outputs/phase-11/verify-unassigned-links.log`     |
| 監査結果分離               | 完了（current 0 / baseline 73） | `outputs/phase-11/audit-unassigned-diff-head.json` |
| 手動テスト結果レポート     | 作成済み                        | `outputs/phase-11/manual-test-result.md`           |
| ウォークスルーログ         | 作成済み                        | `outputs/phase-11/walkthrough-log.md`              |

## 次のPhase

Phase 12: ドキュメント更新（`phase-12-documentation.md`）に進む。
