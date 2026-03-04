# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 4                                          |
| 機能名     | phase12-subagent-artifact-guard            |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001 |
| タスク名   | Phase 12 SubAgent成果物固定ガード          |
| Issue      | #955                                       |
| 分類       | 改善（docs/chore）                         |
| 前提Phase  | Phase 3                                    |
| 後続Phase  | Phase 5                                    |
| 作成日     | 2026-03-03                                 |
| ステータス | pending                                    |

## 目的

SubAgent責務固定と三点突合ルールの検証テストを先行作成する（Red状態）。テンプレート構造検証・三点突合検証・監査スクリプト検証・SubAgent責務テーブル形式検証のテストケースを設計し、Phase 5 実装の品質ゲートとして機能させる。

## 背景

Phase 12 の仕様同期では、SubAgent 責務の不明確さと検証証跡の欠如が繰り返し課題となっている。本Phase では「コード実装」ではなく「ドキュメント運用改善」のテスト先行設計を行い、テンプレートと監査スクリプトの合否判定基準を固定する。

## SubAgent分担

| SubAgent | 担当                                                                |
| -------- | ------------------------------------------------------------------- |
| A        | テンプレート構造検証テスト（spec-update-summary / subagent-report） |
| B        | 三点突合検証テスト（phase-12-doc / changelog / summary）            |
| C        | 監査スクリプト検証テスト（audit-unassigned-tasks.js）               |

## 実行タスク

### Task 4-1: テンプレート構造検証テスト設計

`spec-update-summary.md` および `spec-sync-subagent-report.md` のテンプレート準拠をチェックするテストケースを設計する。

**検証項目:**

- `spec-update-summary.md` の必須セクション存在チェック
  - `## メタ情報`（1セクション原則）
  - `## 更新対象仕様書一覧`
  - `## 各仕様書の更新内容`
  - `## 三点突合チェック結果`
- `spec-sync-subagent-report.md` の必須構造チェック
  - 1仕様書=1SubAgent のマッピングテーブル
  - 各SubAgentの「責務」「依存」「完了条件」列の存在
  - SubAgent数と更新対象仕様書数の一致

**テスト手法:** `rg`/`grep` ベースの形式検証スクリプト（シェルスクリプト or Node.js）

### Task 4-2: 三点突合検証テスト設計

`phase-12-documentation.md` / `documentation-changelog.md` / `spec-update-summary.md` の3ファイル間の整合性を検証するテストケースを設計する。

**検証項目:**

- 3ファイル間のタスクID一致
- 3ファイル間の更新対象仕様書リスト一致
- Step 2 判定結果（更新あり/なし）の整合
- documentation-changelog の各Step完了結果と spec-update-summary の対応

**テスト手法:** 3ファイルからキー情報を抽出し、差分を検出するスクリプト

### Task 4-3: 監査スクリプト検証テスト設計

`audit-unassigned-tasks.js` の `currentViolations` / `baselineViolations` 分離判定をテストするケースを設計する。

**検証項目:**

- `currentViolations=0` の場合: PASS 判定
- `currentViolations>=1` の場合: FAIL 判定
- `baselineViolations` は PASS/FAIL 判定に影響しないこと
- baseline 分離前後でのカウント整合性
- 空の未タスクレポート（0件）での正常動作

**テスト手法:** テスト用フィクスチャファイルを入力とした判定結果の検証

### Task 4-4: SubAgent責務テーブル検証テスト設計

1仕様書=1SubAgent の責務/依存/完了条件テーブルの形式検証テストを設計する。

**検証項目:**

- テーブルヘッダに「SubAgent」「担当仕様書」「責務」「依存」「完了条件」列が存在
- 各行の「担当仕様書」が実在するファイルパスと一致
- 1つのSubAgentが複数仕様書を担当していないこと（1:1マッピング原則）
- 全更新対象仕様書がいずれかのSubAgentにアサインされていること（漏れなし）

**テスト手法:** Markdownテーブルパーサーによる構造検証

## 参照資料

| 資料名                 | パス                                                                           | 用途                       |
| ---------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| Phase 1 成果物         | `outputs/phase-1/requirements-definition.md`                                   | 依存入力（要件定義）       |
| Phase 2 成果物         | `outputs/phase-2/architecture-design.md`                                       | 依存入力（設計）           |
| Phase 3 成果物         | `outputs/phase-3/design-review-result.md`                                      | 依存入力（設計レビュー）   |
| spec-update-workflow   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 2判定基準             |
| Phase 12テンプレート   | `.claude/skills/task-specification-creator/references/phase-templates.md`      | テンプレート構造定義       |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                           | P43（SubAgent rate limit） |
| タスク実行ワークフロー | `.claude/rules/05-task-execution.md`                                           | Phase 12チェックリスト     |

## 統合テスト連携

- テンプレート構造テスト → 監査スクリプトテスト → 結果判定テスト のフロー検証
- テンプレート出力が監査スクリプトの入力フォーマットに適合することの確認
- 三点突合テストが3ファイル全ての生成後に実行可能であることの確認

## 多角的チェック観点（AIが判断）

| 観点               | 確認内容                                      | 参照仕様                     |
| ------------------ | --------------------------------------------- | ---------------------------- |
| テンプレート整合性 | 必須フィールドの網羅、メタ情報1セクション原則 | `spec-update-workflow.md`    |
| 三点突合完全性     | 3ファイル間の全チェックポイント定義           | `phase-templates.md`         |
| 監査再現性         | currentViolations/baseline判定の決定論的再現  | `06-known-pitfalls.md` (P43) |
| SubAgent責務明確性 | 1仕様書=1SubAgent の強制と漏れ検出            | `05-task-execution.md`       |

## 成果物

| 成果物           | パス                                    | 内容                                           |
| ---------------- | --------------------------------------- | ---------------------------------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md` | テンプレート・三点突合・監査のテストケース一覧 |
| テストケース詳細 | `outputs/phase-4/test-cases.md`         | 各テストの入力・期待値・判定基準               |

## 完了条件

- [ ] テンプレート構造検証テスト（Task 4-1）の全ケースが定義されている
- [ ] 三点突合検証テスト（Task 4-2）の全チェックポイントが網羅されている
- [ ] 監査スクリプト検証テスト（Task 4-3）の全判定パターンが定義されている
- [ ] SubAgent責務テーブル検証テスト（Task 4-4）の形式チェックが定義されている
- [ ] 全テストケースが Red 状態（未実装で失敗する）であることが確認されている
- [ ] Phase 3 成果物との整合が確認されている
- [ ] Phase 5 への引き継ぎ情報が記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料（Phase 1-3成果物、spec-update-workflow、phase-templates）を確認する。
2. Task 4-1: テンプレート構造検証テストケースを設計する。
3. Task 4-2: 三点突合検証テストケースを設計する。
4. Task 4-3: 監査スクリプト検証テストケースを設計する。
5. Task 4-4: SubAgent責務テーブル検証テストケースを設計する。
6. 成果物を `outputs/phase-4/` に作成する。
7. 完了条件を全件チェックする。

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（4-1〜4-4）を100%実行完了
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

Phase 5: 実装
