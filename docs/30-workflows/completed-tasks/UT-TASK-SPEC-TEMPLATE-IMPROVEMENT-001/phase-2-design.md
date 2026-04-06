# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                               |
| ---------- | ------------------------------------------------------------------ |
| Phase      | 2                                                                  |
| 機能名     | UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001                              |
| タスク名   | task-specification-creator テンプレートの validator 必須見出し強化 |
| 前提Phase  | Phase 1                                                            |
| 後続Phase  | Phase 3                                                            |
| 作成日     | 2026-04-06                                                         |
| ステータス | 完了                                                               |

## 目的

Phase 1 で確定した修正要件に基づき、validator と template の具体的な修正設計を定義する。

## 背景

Phase 1 の分析結果：

- `extractSection()` が `## Part 2` → 次の `##` で切断され `### 使用例` が検査対象外
- `documentation-changelog-template.md` に 5 つの必須フィールドが欠落

## 実行タスク

### タスク1: validator 修正設計

**目的**: `part2_usage_example` チェックの確実な検査ロジックを設計する

**実行手順**:

1. `buildChecks()` 関数内の `part2_usage_example` チェックの現行ロジックを記録する
2. アプローチ A（全文検索）は採用せず、scope が広すぎる理由を記録する
3. アプローチ B の設計を定義する:
   - `extractSection()` を `^##\s+Part\s+\d+\b` を境界として切り出す
   - Part 2 内の内部 `##` セクションを保持したまま `part2_usage_example` を評価する
4. 修正後の関数シグネチャと期待動作を定義する
5. 既存チェックへの副作用がないことを設計段階で確認する

**期待される成果物**:

- `outputs/phase-2/design-document.md`

---

### タスク2: テンプレート修正設計

**目的**: `implementation-guide-template.md` の `## Part 2` 構造修正方針を設計する

**実行手順**:

1. `## Part 2` の現行構造を記録する
2. `### 使用例` を Part 2 配下に残したまま、内部 `##` セクションがあっても validator が検査できることを前提に整合を確認する
3. 既存見出しの名称変更は避け、最小変更でテンプレートと validator の整合を取る修正方針を設計する

**期待される成果物**:

- `outputs/phase-2/design-document.md`（更新）

---

### タスク3: changelog テンプレート修正設計

**目的**: `documentation-changelog-template.md` への必須フィールド追加設計を行う

**実行手順**:

1. 現行のメタ情報テーブル構造を記録する
2. 追加する 5 フィールドのプレースホルダ形式を定義する:
   - `変更者`: `{{AUTHOR}}`
   - `関連 Issue / PR`: `{{ISSUE_PR_LINK}}`
   - `validator 実行結果`: `{{VALIDATOR_RESULT}}`
   - `current / baseline`: `{{CURRENT_BASELINE}}`
   - `artifacts 同期結果`: `{{ARTIFACTS_SYNC_RESULT}}`
3. 品質チェックリストへの追加項目を定義する

**期待される成果物**:

- `outputs/phase-2/design-document.md`（更新）

---

## 参照資料

| 参照資料               | パス                                                                                         | 用途           |
| ---------------------- | -------------------------------------------------------------------------------------------- | -------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`                                                 | Phase 1 成果物 |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`                                                     | Phase 1 成果物 |
| validator スクリプト   | `.claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js` | 設計対象の現状 |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`          | 設計対象の現状 |
| changelog テンプレート | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md`       | 設計対象の現状 |

## 統合テスト連携

- validator の入力（Markdown コンテンツ）と出力（チェック結果 JSON）のインターフェースを設計に明記する
- テスト境界ケース（`### 使用例` が存在する/しない/位置が異なる）を設計段階で列挙する

## 成果物

| 成果物 | パス                                 | 内容                            |
| ------ | ------------------------------------ | ------------------------------- |
| 設計書 | `outputs/phase-2/design-document.md` | validator・テンプレート修正設計 |

## 完了条件

- [ ] validator 修正のアプローチが決定しており、設計書に記述されている
- [ ] テンプレート修正の方針が設計書に記述されている
- [ ] changelog テンプレートの 5 フィールド追加設計が完了している
- [ ] 設計が Phase 1 の受け入れ基準を全て満たしていることを確認した
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク 100% 実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビューゲート
