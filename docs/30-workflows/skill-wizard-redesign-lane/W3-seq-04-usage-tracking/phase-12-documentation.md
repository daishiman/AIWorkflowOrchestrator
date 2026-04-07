# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 12                           |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04    |
| 機能名     | 使用率計装（usage tracking） |
| 前提Phase  | Phase 11                     |
| 後続Phase  | Phase 13                     |
| 作成日     | 2026-04-07                   |
| ステータス | pending                      |

## 目的

task-specification-creator / aiworkflow-requirements の正本に照らして、Phase 12 canonical 6成果物をそろえ、NON_VISUAL 証跡を含む実装・テスト・レビュー結果をドキュメントへ同期する。  
`trackEvent` の型安全化と 5 つの計装ポイントが、後続の再監査で再現できる粒度まで整理された状態を目指す。  
既存の `SkillAnalytics` / `AnalyticsStore` は execution-centric なので、W3 の UI 計装は renderer-local の薄い抽象として説明を閉じる。

## 実行オーケストレーション

| SubAgent | 主担当                                                   | 並列条件                        |
| -------- | -------------------------------------------------------- | ------------------------------- |
| A        | `implementation-guide.md` Part 1 草案                    | B と並列可                      |
| B        | `implementation-guide.md` Part 2 草案                    | A と並列可                      |
| C        | `outputs/phase-12/system-spec-update-summary.md`         | Part 2 の更新対象確定後に並列可 |
| D        | `outputs/phase-12/documentation-changelog.md`            | C と並列可                      |
| E        | `outputs/phase-12/unassigned-task-detection.md`          | D と並列可                      |
| F        | `outputs/phase-12/skill-feedback-report.md`              | E と並列可                      |
| G        | `outputs/phase-12/phase12-task-spec-compliance-check.md` | 全成果物固定後に実行            |

## 必須6タスク

### Task 12-1: 実装ガイド作成

Part 1（中学生レベル）と Part 2（開発者レベル）の 2 部構成で作成する。  
 Part 1 では日常の例え話と「なぜ必要か」を先に説明し、Part 2 では TypeScript の型定義、API シグネチャ、使用例、エラーハンドリング、エッジケース、設定可能な定数を整理する。  
 作成時は `たとえば` を含め、`validate-phase12-implementation-guide.js` とチェックリストで要件を確認する。

**このタスクで必ず明記する内容**

- `trackEvent` は renderer 内部の軽量な計装関数であること
- `SkillWizardEvents` を型安全な payload map として扱うこと
- `skill_wizard_started` は空 payload であり、source 依存を持たないこと
- `SkillCategory` の参照元が `packages/shared/src/types/skill.ts` であること
- `SkillAnalytics` / `AnalyticsStore` は execution-centric であり、W3 の UI 計装とは分離して扱うこと
- Phase 11 は NON_VISUAL であり、スクリーンショットではなく console / automation evidence を主証跡にすること

### Task 12-2: システム仕様更新

#### Step 1-A: 完了タスク記録・関連リンク・変更履歴

- `docs/30-workflows/skill-wizard-redesign-lane/index.md` の W3-seq-04 ステータスを `completed` へ更新する
- `phase-12-documentation.md` 内に完了記録を残し、`outputs/phase-12/implementation-guide.md` へのリンクを追加する
- 変更履歴に `system-spec-update-summary.md` / `documentation-changelog.md` の更新理由を記録する

#### Step 1-B: 実装状況テーブル更新

- W3-seq-04 の実装状況を `pending` から `completed` へ更新する
- Phase 11 が NON_VISUAL であることを実装状況に反映する

#### Step 1-C: 関連タスク・依存関係更新

- W2-seq-03a から W3-seq-04 への依存関係が崩れていないことを確認する
- 追加した AC-01〜AC-05 と Phase 4 / 6 / 7 / 11 の対応を確認し、関連タスク表に反映する

#### Step 1-D: インデックス・トピック再生成

- `docs/30-workflows/skill-wizard-redesign-lane/index.md` と関連 topic map の整合を確認する
- 必要な場合のみ `generate-index.js` を再実行し、再生成理由を記録する

#### Step 1-E: 未タスク検出・配置監査

- `audit-unassigned-tasks` の current / baseline を分離して記録する
- 0 件でも `outputs/phase-12/unassigned-task-detection.md` を出力し、検査範囲を明記する

#### Step 1-F: 近接成果物との同期

- `manual-test-report.md` / `manual-test-checklist.md` / `manual-test-result.md` / `discovered-issues.md` の記録粒度を Phase 12 へ引き継ぐ
- `skill-feedback-report.md` に改善点がない場合も、その理由を残す

#### Step 1-G: 検証結果・パリティ確認

- `validate-phase12-implementation-guide.js` と各種 validator の結果を記録する
- planned wording が `outputs/phase-12/*.md` に残っていないことを確認する
- `artifacts.json` と `outputs/artifacts.json` の parity を記録する

#### Step 2: 仕様更新の要否判定

`trackEvent` は renderer-local utility として閉じるため、IPC / preload の契約変更は発生しない。  
そのため本タスクの Step 2 は **no-op（N/A）** とし、将来 `SkillWizardEvents` を shared type に移す場合のみ `interfaces-*` / `api-*` / `security-*` の更新を行う。  
更新不要と判断した場合でも、その理由を `system-spec-update-summary.md` と `documentation-changelog.md` の双方に明記する。

### Task 12-3: 更新履歴作成

`documentation-changelog.md` を生成し、更新したファイル、validator 結果、current / baseline の区別、NON_VISUAL 判定を記録する。  
planned wording は残さず、実際に更新した内容のみを current facts として書く。
`outputs/phase-12/system-spec-update-summary.md` と `outputs/phase-12/phase12-task-spec-compliance-check.md` にも同じ current facts を転記する。

### Task 12-4: 未タスク検出

プロジェクト全体で UT-SKILL-WIZARD-W3-seq-04 に関連する未着手タスクを検出し、0 件でも `outputs/phase-12/unassigned-task-detection.md` を出力する。  
検出結果が 0 件の場合でも、0 件である理由と確認範囲を明記する。

### Task 12-5: スキルフィードバック作成

実装・テスト・設計を通じて見つかった改善点を記録する。改善点が 0 件でも `skill-feedback-report.md` を作成し、0 件である理由を残す。
改善対象が `skill-creator` に及ぶ場合のみ、その差分も記録する。

### Task 12-6: phase12-task-spec-compliance-check

Task 12-1〜12-5 と Step 1-A〜1-G / Step 2 の完了を 1 つの成果物に集約して、今回の Phase 12 が `task-specification-creator` と `aiworkflow-requirements` の両方に照らして仕様どおりに閉じていることを確認する。  
`outputs/phase-12/system-spec-update-summary.md` / `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` の値が一致していることに加え、validator 実測値、artifact existence、mirror parity、Phase 11 evidence の実ファイル根拠も結び付ける。

## 参照資料

| 資料名                   | パス                                                 | 用途              |
| ------------------------ | ---------------------------------------------------- | ----------------- |
| 手動テストレポート       | `outputs/phase-11/manual-test-report.md`             | Phase 11 成果物   |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`             | Phase 11 成果物   |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`          | Phase 11 成果物   |
| 拡張テストケース         | `outputs/phase-6/expanded-test-cases.md`             | Phase 6 成果物    |
| カバレッジ計画           | `outputs/phase-7/coverage-plan.md`                   | Phase 7 成果物    |
| リファクタ計画           | `outputs/phase-8/refactoring-plan.md`                | Phase 8 成果物    |
| 最終レビュー結果         | `outputs/phase-10/final-review-result.md`            | Phase 10 成果物   |
| 実装サマリー             | `outputs/phase-5/implementation-summary.md`          | Phase 5 成果物    |
| 拡張設計書               | `outputs/phase-2/extension-design.md`                | Phase 2 成果物    |
| task-spec 正本           | `.claude/skills/task-specification-creator/SKILL.md` | Phase 12 判定基準 |
| system spec 正本         | `.claude/skills/aiworkflow-requirements/SKILL.md`    | 更新対象基準      |

## 実行タスク

1. Task 12-1: `implementation-guide.md` を Part 1 / Part 2 で作成する。
2. Task 12-2 Step 1-A: 完了記録、関連リンク、変更履歴の根拠をまとめる。
3. Task 12-2 Step 1-B: W3-seq-04 の実装状況を `completed` へ更新する。
4. Task 12-2 Step 1-C: 依存関係と関連タスクの整合を確認する。
5. Task 12-2 Step 2: 仕様更新の要否を判定し、no-op（N/A）なら理由を残す。
6. Task 12-3〜12-6: changelog・未タスク・フィードバック・準拠チェックを出力する。

## 統合テスト連携

- Phase 11 の NON_VISUAL 記録を `implementation-guide.md` と `system-spec-update-summary.md` にそのまま引き継ぐ。
- Phase 11 の `manual-test-report.md` / `manual-test-checklist.md` / `manual-test-result.md` を current facts として同期する。
- Phase 4 / 6 / 7 の AC-01〜AC-05 対応と Phase 9 / 10 の判定結果が、Phase 12 の根拠と一致していることを確認する。
- `outputs/phase-12/phase12-task-spec-compliance-check.md` で 6 成果物の実体と記述内容の同値性を確認する。
- Phase 12 の 6 成果物は `outputs/phase-12/implementation-guide.md` / `outputs/phase-12/system-spec-update-summary.md` / `outputs/phase-12/documentation-changelog.md` / `outputs/phase-12/unassigned-task-detection.md` / `outputs/phase-12/skill-feedback-report.md` / `outputs/phase-12/phase12-task-spec-compliance-check.md` で固定する。

## 成果物

| 成果物                   | パス                                                     | 説明                        |
| ------------------------ | -------------------------------------------------------- | --------------------------- |
| 実装ガイド               | `outputs/phase-12/implementation-guide.md`               | Part 1 / Part 2 構成        |
| システム仕様更新サマリー | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-G / Step 2 記録 |
| 更新履歴                 | `outputs/phase-12/documentation-changelog.md`            | ドキュメント更新履歴        |
| 未タスク検出             | `outputs/phase-12/unassigned-task-detection.md`          | 検出結果（0 件でも作成）    |
| スキルフィードバック     | `outputs/phase-12/skill-feedback-report.md`              | 改善点（0 件でも作成）      |
| 仕様準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | Task 12-1〜12-6 の確認      |

## Phase 12 実装ガイド要件

- Part 1: 中学生向け説明・日常例・専門用語の即時説明を含める。
- Part 2: TypeScript 型・API シグネチャ・使用例・エラーハンドリング・エッジケース・設定値一覧を含める。
- 未タスク検出レポートは 0 件でも必ず出力する。
- スキルフィードバックは改善点 0 件でも必ず出力する。

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] Task 12-1 実装ガイドが Part 1 / Part 2 で完成していること
- [ ] Task 12-2 Step 1-A / 1-B / 1-C / 1-D / 1-E / 1-F / 1-G / Step 2 が全て実施されていること
- [ ] Task 12-3 更新履歴が作成されていること
- [ ] Task 12-4 未タスク検出レポートが作成されていること（0 件でも）
- [ ] Task 12-5 フィードバックレポートが作成されていること（0 件でも）
- [ ] Task 12-6 仕様準拠チェックが PASS であること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. Task 12-1: 実装ガイド作成
3. Task 12-2: システム仕様更新（Step 1-A/1-B/1-C/Step 2）
4. Task 12-3〜12-6: changelog・未タスク・フィードバック・準拠チェック出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 13: PR 作成
