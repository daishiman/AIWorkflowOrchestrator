# Phase 5: 実装

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 5                                          |
| 機能名     | phase12-subagent-artifact-guard            |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| タスク名   | Phase 12 SubAgent成果物固定ガード          |
| Issue      | #955                                       |
| 分類       | 改善（docs/chore）                         |
| 前提Phase  | Phase 4                                    |
| 後続Phase  | Phase 6                                    |
| 作成日     | 2026-03-03                                 |
| ステータス | pending                                    |

## 目的

Phase 4 で設計した Red テストを Green にするために、テンプレート・運用手順・監査ルールを実装する。具体的には、`spec-update-summary.md` テンプレートの標準化、`spec-sync-subagent-report.md` テンプレート作成、三点突合チェックリスト実装、監査基準ルール実装を行う。

## 背景

Phase 12 の運用品質を固定するには、テンプレートの再利用可能な構造、SubAgent 責務の1:1マッピング原則、三点突合による説明可能な判定、currentViolations=0 を合否基準とする監査ルールが必要である。本Phase ではこれらを成果物として実装する。

## SubAgent分担

| SubAgent | 担当                                                        |
| -------- | ----------------------------------------------------------- |
| A        | テンプレート標準化（spec-update-summary / subagent-report） |
| B        | 三点突合チェックリスト・監査基準ルール実装                  |
| C        | task-workflow.md / lessons-learned.md 同期手順実装          |

## 実行タスク

### Task 5-1: spec-update-summary テンプレート標準化

テンプレート準拠構造で再利用可能な `spec-update-summary.md` を実装する。

**実装内容:**

- `## メタ情報` セクション（1セクション原則を強制）
  - タスクID、タスク名、Phase、作成日、SubAgent数
- `## 更新対象仕様書一覧` セクション
  - テーブル形式: 仕様書パス / 更新種別 / 担当SubAgent / ステータス
- `## 各仕様書の更新内容` セクション
  - 仕様書ごとの変更概要・変更行数・変更理由
- `## 三点突合チェック結果` セクション
  - phase-12-documentation.md との整合結果
  - documentation-changelog.md との整合結果
  - 判定: PASS / FAIL

**テンプレート配置先:** `.claude/skills/skill-creator/assets/phase12-system-spec-retrospective-template.md`

### Task 5-2: spec-sync-subagent-report テンプレート作成

1仕様書=1SubAgent の責務/依存/完了条件テーブルテンプレートを実装する。

**実装内容:**

- SubAgent責務マッピングテーブル
  - 列: SubAgent ID / 担当仕様書 / 責務（1文で記述） / 依存（前提ファイル一覧） / 完了条件（チェックリスト形式）
- SubAgent実行結果テーブル
  - 列: SubAgent ID / 開始時刻 / 終了時刻 / ツール使用数 / ステータス / 備考
- 1仕様書=1SubAgent 制約の明記
  - 3ファイル以下/SubAgent の分割ルール（P43対策）

**テンプレート配置先:** `.claude/skills/skill-creator/assets/phase12-spec-sync-subagent-template.md`

### Task 5-3: 三点突合チェックリスト実装

`phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` の3ファイル間突合手順を明文化する。

**実装内容:**

- 突合チェックポイント一覧
  1. タスクID一致: 3ファイル全てに同一タスクIDが記載されている
  2. 更新仕様書リスト一致: 更新対象の仕様書パスが全ファイルで一致
  3. Step 2判定整合: phase-12-doc の Step 2 結果と summary の判定が一致
  4. Step完了記録整合: changelog の各Step完了結果と summary の詳細が対応
  5. SubAgent数整合: subagent-report のSubAgent数と更新仕様書数が整合
- 判定基準
  - 全チェックポイント PASS → 三点突合 PASS
  - 1件以上 FAIL → 三点突合 FAIL（FAIL箇所を明記）

**配置先:** `outputs/phase-5/three-way-reconciliation-checklist.md`

### Task 5-4: 監査基準ルール実装

current/baseline 分離判定ルールおよび `## メタ情報` 1セクション原則を実装する。

**実装内容:**

- `audit-unassigned-tasks.js` の判定ルール拡張
  - `currentViolations`: 本タスクで新規に発生した違反（FAIL基準）
  - `baselineViolations`: 既知の既存違反（PASS/FAIL判定に影響しない）
  - 合否判定: `currentViolations === 0` → PASS
- メタ情報1セクション原則の検証ルール
  - `## メタ情報` の出現回数が正確に1回であることを検証
  - 2回以上出現した場合は FAIL

**配置先:** スクリプト拡張は既存の `audit-unassigned-tasks.js` に追加

### Task 5-5: task-workflow.md 同期手順

本タスクの残課題テーブル登録手順を実装する。

**実装内容:**

- task-workflow.md の残課題テーブルに本タスク情報を追加する手順書
- 完了後のステータス更新手順
- 関連仕様書への参照リンク追加手順

### Task 5-6: lessons-learned.md 同期手順

関連未タスク導線を追加する手順を実装する。

**実装内容:**

- lessons-learned.md への P43 関連教訓の追加・更新手順
- SubAgent rate limit 対策（3ファイル以下/SubAgent）の明記手順
- 三点突合ルールの教訓としての記録手順

## 参照資料

| 資料名                 | パス                                                                           | 用途                       |
| ---------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| Phase 4 成果物         | `phase-4-test-creation.md`                                                     | 依存入力（テスト設計）     |
| Phase 4 テスト仕様     | `outputs/phase-4/test-specification.md`                                        | Red テストケース           |
| spec-update-workflow   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 2判定基準             |
| Phase 12テンプレート   | `.claude/skills/task-specification-creator/references/phase-templates.md`      | テンプレート構造定義       |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                           | P43（SubAgent rate limit） |
| タスク実行ワークフロー | `.claude/rules/05-task-execution.md`                                           | Phase 12チェックリスト     |
| task-workflow正本      | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 残課題テーブル形式         |
| lessons-learned正本    | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 教訓記録形式               |

## 統合テスト連携

- テンプレート出力（Task 5-1, 5-2）が監査スクリプト（Task 5-4）の入力フォーマットに適合することを確認
- 三点突合チェックリスト（Task 5-3）が3ファイル全ての生成後に実行可能であることを確認
- Phase 4 の Red テストが全て Green に変わることを確認

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                                                    | 参照仕様                     |
| ------------------ | ----------------------------------------------------------- | ---------------------------- |
| テンプレート再利用 | テンプレートが他タスクでそのまま流用可能な構造か            | `spec-update-workflow.md`    |
| 責務明確性         | 1仕様書=1SubAgent が強制される仕組みがテンプレートにあるか  | `05-task-execution.md`       |
| 判定再現性         | 三点突合とcurrentViolations判定が誰が実行しても同じ結果か   | `06-known-pitfalls.md` (P43) |
| 同期完全性         | task-workflow.md と lessons-learned.md の両方に導線があるか | `task-workflow.md`           |

## 成果物

| 成果物                           | パス                                        | 内容                             |
| -------------------------------- | ------------------------------------------- | -------------------------------- |
| 実装サマリー                     | `outputs/phase-5/implementation-summary.md` | 実装内容と変更ファイル一覧       |
| spec-update-summary テンプレート | テンプレート配置先（Task 5-1参照）          | 標準化されたテンプレートファイル |
| subagent-report テンプレート     | テンプレート配置先（Task 5-2参照）          | SubAgent責務テーブルテンプレート |
| 三点突合チェックリスト           | 配置先（Task 5-3参照）                      | 3ファイル間突合手順書            |
| 監査基準ルール                   | 既存スクリプト拡張（Task 5-4参照）          | current/baseline分離判定ルール   |

## 完了条件

- [ ] spec-update-summary テンプレート（Task 5-1）が作成されている
- [ ] spec-sync-subagent-report テンプレート（Task 5-2）が作成されている
- [ ] 三点突合チェックリスト（Task 5-3）が実装されている
- [ ] 監査基準ルール（Task 5-4）が実装されている
- [ ] task-workflow.md 同期手順（Task 5-5）が記録されている
- [ ] lessons-learned.md 同期手順（Task 5-6）が記録されている
- [ ] Phase 4 の Red テストが全て Green に変わっている
- [ ] Phase 6 への引き継ぎ情報が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料（Phase 4成果物、spec-update-workflow、phase-templates）を確認する。
2. Task 5-1: spec-update-summary テンプレートを作成する。
3. Task 5-2: spec-sync-subagent-report テンプレートを作成する。
4. Task 5-3: 三点突合チェックリストを実装する。
5. Task 5-4: 監査基準ルールを実装する。
6. Task 5-5: task-workflow.md 同期手順を記録する。
7. Task 5-6: lessons-learned.md 同期手順を記録する。
8. Phase 4 の Red テストを実行し、全て Green であることを確認する。
9. 成果物を `outputs/phase-5/` に作成する。
10. 完了条件を全件チェックする。

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（5-1〜5-6）を100%実行完了
- [ ] Phase内で定義した成果物を全件記録
- [ ] 引き継ぎ情報を明記

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard
```

## Phase実行記録

| 項目         | 記録    |
| ------------ | ------- |
| 実行タスク   | pending |
| 発見事項     | pending |
| 引き継ぎ事項 | pending |

## 次のPhase

Phase 6: テスト拡充
