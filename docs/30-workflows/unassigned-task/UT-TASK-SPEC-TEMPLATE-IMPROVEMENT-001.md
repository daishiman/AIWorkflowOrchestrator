# task-specification-creator テンプレートの validator 必須見出し強化 - タスク指示書

## メタ情報

```yaml
issue_number: 1917
```

## メタ情報

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-TASK-SPEC-TEMPLATE-IMPROVEMENT-001                              |
| タスク名     | task-specification-creator テンプレートの validator 必須見出し強化 |
| 分類         | 改善                                                               |
| 対象機能     | task-specification-creator skill / Phase 12 テンプレート           |
| 優先度       | 中                                                                 |
| 見積もり規模 | 小規模                                                             |
| ステータス   | 未実施                                                             |
| 発見元       | TASK-P0-01 Phase 12 skill-feedback-report                          |
| 発見日       | 2026-04-04                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-P0-01（verify 実行エンジン）の Phase 12 skill-feedback-report 実行時に、以下の 2 点の構造的な問題が発見された。

1. `implementation-guide-template.md` の validator（`validate-phase12-implementation-guide.js`）は `### 使用例` の有無をコンテンツ内のキーワード検索（`/使用例|利用例/i`）で判定しているが、`## Part 2` 配下に `### 使用例` が必須見出しとしてテンプレートに固定されていないため、見出し名が異なると検出漏れが発生する。テンプレートの「validator 最小骨格」セクションには `### 使用例` が記載されているが、validator 側の `extractSection` 関数は `## Part 2` を `##` レベルの次の見出しまでしか切り出さないため、`### 使用例` が `## Part 2` の直下ではなく後続セクション（`## 1. アーキテクチャ概要` 等）の配下に埋もれた場合に検査対象外となる。
2. `documentation-changelog-template.md` のメタ情報テーブルに `変更者`、`関連 Issue / PR`、`validator 実行結果`、`current / baseline`、`artifacts 同期結果` が必須フィールドとして定義されていないため、Phase 12 の成果物として記録すべきトレーサビリティ情報が欠落しやすい。

### 1.2 問題点・課題

- **validator の構造的な検査漏れ**: `hasUsageExample()` 関数はコンテンツ全文からキーワードを検索するが、`extractSection()` で `## Part 2` を切り出す際に `##` レベルの次の見出しで切断されるため、`### 使用例` が `## Part 2` 直後ではなく後続の `##` 見出し配下にある場合に Part 2 セクションとして認識されない。テンプレートの構造上、`## Part 2` の直後に `## 1. アーキテクチャ概要` が来るため、`### 使用例` は `extractSection` の戻り値に含まれず、`part2_usage_example` チェックが意図通りに機能しない。
- **changelog テンプレートの必須フィールド不足**: 誰が変更したか、どの Issue/PR に紐づくか、validator の実行結果はどうだったかという情報がテンプレートに含まれていないため、後から変更を追跡・検証する際に手動で情報を収集する必要がある。
- **手動確認への依存**: validator が構造的に検査できない項目は、実行者の注意力に依存しており、タスク実行のたびに同じ見落としが繰り返されるリスクがある。

### 1.3 放置した場合の影響

- Phase 12 の実装ガイド作成時に「使用例」セクションが欠落しても validator が検出できず、品質基準を満たさないドキュメントが成果物として出力され続ける。
- changelog のトレーサビリティが不完全なまま蓄積され、後日の監査やレビュー時に変更の根拠を追跡できなくなる。
- 同じ構造的問題を持つタスクが繰り返し実行されるたびに手動確認コストが発生し、スケーラビリティが低下する。

---

## 2. 何を達成するか（What）

### 2.1 目的

`implementation-guide-template.md` と `documentation-changelog-template.md` のテンプレート構造を改善し、validator が必須セクションを確実に検査できるようにする。併せて changelog テンプレートに必須フィールドを追加し、Phase 12 成果物のトレーサビリティを向上させる。

### 2.2 最終ゴール

1. `validate-phase12-implementation-guide.js` が `### 使用例` 見出しの有無を確実に検査できる状態になっている。
2. `implementation-guide-template.md` の `## Part 2` 配下に `### 使用例` が必須見出しとして固定されている。
3. `documentation-changelog-template.md` のメタ情報テーブルに以下の必須フィールドが追加されている:
   - 変更者
   - 関連 Issue / PR
   - validator 実行結果
   - current / baseline
   - artifacts 同期結果
4. 既存のテストが全て PASS し、新規テストが追加されている。

### 2.3 スコープ

#### 含むもの

- `implementation-guide-template.md` のテンプレート構造修正
- `validate-phase12-implementation-guide.js` の `extractSection` ロジック修正または `### 使用例` 見出し検査の追加
- `validate-phase12-implementation-guide.js` の既存テスト更新・新規テスト追加
- `documentation-changelog-template.md` への必須フィールド追加
- `documentation-changelog-template.md` の品質チェックリスト更新

#### 含まないもの

- Phase 12 以外のテンプレート改修
- validator の全面的なリファクタリング（今回は `### 使用例` 検査の確実化に限定）
- 他の skill のテンプレート修正

### 2.4 成果物

| 成果物                             | ファイルパス                                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 修正済みテンプレート（実装ガイド） | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`                        |
| 修正済み validator スクリプト      | `.claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js`               |
| 修正済みテンプレート（changelog）  | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md`                     |
| 新規/更新テストファイル            | `.claude/skills/task-specification-creator/scripts/__tests__/validate-phase12-implementation-guide.test.*` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 環境が利用可能であること
- pnpm による依存関係がインストール済みであること
- `validate-phase12-implementation-guide.js` の現行動作を理解していること

### 3.2 依存タスク

- なし（独立して実行可能）

### 3.3 必要な知識

- `validate-phase12-implementation-guide.js` の `extractSection()` 関数の動作原理（正規表現 `/\n##\s+/` で次の `##` 見出しまで切り出す仕組み）
- `implementation-guide-template.md` の 2 パート構成（Part 1: 概念説明、Part 2: 技術詳細）
- `documentation-changelog-template.md` の Step 1-A 〜 Step 2 の記録構造
- Vitest によるテスト記述方法

### 3.4 推奨アプローチ

**アプローチ A（推奨）: validator 側で `### 使用例` 見出しを直接検査する**

1. `buildChecks()` 内の `part2_usage_example` チェックを、`extractSection` で切り出した `part2` 変数ではなく、ドキュメント全体から `### 使用例` 見出しの存在を検査するように変更する。
2. テンプレートの「validator 最小骨格」セクションの記載と実際の validator ロジックを一致させる。

**アプローチ B: テンプレート構造を修正して `extractSection` の切り出し範囲を拡大する**

1. `## Part 2` の直後にある `## 1. アーキテクチャ概要` を `### 1. アーキテクチャ概要` に変更し、Part 2 セクション配下に収まるようにする。
2. ただし、この変更は既存の出力済みドキュメントとの互換性に影響する可能性があるため、アプローチ A を優先する。

---

## 4. 実行手順

### Phase構成

| Phase | 名前                 | 目的                                                                           |
| ----- | -------------------- | ------------------------------------------------------------------------------ |
| 1     | 現状分析・テスト追加 | 問題の再現確認と失敗テストの作成                                               |
| 2     | テンプレート修正     | implementation-guide-template.md と documentation-changelog-template.md の修正 |
| 3     | validator 修正       | validate-phase12-implementation-guide.js の検査ロジック修正                    |
| 4     | 検証・回帰テスト     | 全テスト PASS の確認と手動検証                                                 |

### Phase 1: 現状分析・テスト追加

#### 目的

問題を再現する失敗テストを作成し、修正後のゴールを明確にする。

#### 手順

1. `validate-phase12-implementation-guide.js` の既存テストファイルを確認する。
2. `### 使用例` が `## Part 2` 直後ではなく後続の `##` セクション配下にあるケースのテストを追加する（このテストは現状で FAIL することを確認する）。
3. `extractSection()` が `## Part 2` をどこまで切り出すかをテストで確認する。

#### 成果物

- 失敗テストケース（`### 使用例` 見出し検査の不備を再現）

#### 完了条件

- 新規テストが FAIL することを確認済み（問題の再現に成功）

### Phase 2: テンプレート修正

#### 目的

テンプレートの構造を修正し、必須見出しと必須フィールドを明確化する。

#### 手順

1. `implementation-guide-template.md` の「validator 最小骨格」セクションの記載が実際のテンプレート本体と一致しているか確認し、不一致があれば修正する。
2. `## Part 2` 配下の見出し構造を整理し、`### 使用例` が validator の検査対象として確実に含まれる位置に配置する。
3. `documentation-changelog-template.md` のメタ情報テーブルに以下のフィールドを追加する:
   - `変更者`: `{{AUTHOR}}`
   - `関連 Issue / PR`: `{{ISSUE_PR_LINK}}`
   - `validator 実行結果`: `{{VALIDATOR_RESULT}}`
   - `current / baseline`: `{{CURRENT_BASELINE}}`
   - `artifacts 同期結果`: `{{ARTIFACTS_SYNC_RESULT}}`
4. `documentation-changelog-template.md` の品質チェックリストに上記フィールドの記入確認項目を追加する。

#### 成果物

- 修正済み `implementation-guide-template.md`
- 修正済み `documentation-changelog-template.md`

#### 完了条件

- テンプレートの「validator 最小骨格」セクションとテンプレート本体の見出しが一致している
- changelog テンプレートに 5 つの必須フィールドが追加されている

### Phase 3: validator 修正

#### 目的

`validate-phase12-implementation-guide.js` が `### 使用例` 見出しを確実に検査できるようにする。

#### 手順

1. `buildChecks()` 内の `part2_usage_example` チェックを修正する。以下のいずれかの方法を採用する:
   - **方法 A**: ドキュメント全体（`content`）から `### 使用例` 見出しの存在を正規表現 `/^###\s+使用例/m` で検査する。
   - **方法 B**: `extractSection()` の切り出しロジックを修正し、`## Part 2` から文末までを対象にする。
2. `hasUsageExample()` 関数がコードブロック付きの使用例を要求する現行ロジックを維持しつつ、見出し検査を追加する。
3. テンプレートの「validator 最小骨格」に記載された全見出し（`### 型定義`、`### 使用例`、`### エラーハンドリング`、`### エッジケース`、`### 設定項目と定数一覧`、`### テスト構成`）について、個別の見出し存在チェックを追加することを検討する。

#### 成果物

- 修正済み `validate-phase12-implementation-guide.js`

#### 完了条件

- Phase 1 で作成した失敗テストが PASS に変わる
- `### 使用例` 見出しが存在しない実装ガイドに対して validator がエラーを報告する

### Phase 4: 検証・回帰テスト

#### 目的

全テストの PASS と既存動作への影響がないことを確認する。

#### 手順

1. `pnpm vitest run` で関連テストを全件実行する。
2. 既存の Phase 12 成果物（過去のワークフロー出力）に対して修正後の validator を実行し、回帰がないことを確認する。
3. テンプレートから新規に実装ガイドを作成した場合に、validator が全チェック PASS となることを確認する。

#### 成果物

- テスト実行結果ログ
- 回帰テスト結果

#### 完了条件

- 全テスト PASS
- 既存の Phase 12 成果物に対する回帰なし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `validate-phase12-implementation-guide.js` が `### 使用例` 見出しの有無を確実に検査できる
- [ ] `### 使用例` が欠落した実装ガイドに対して validator がエラーを報告する
- [ ] `documentation-changelog-template.md` に `変更者` フィールドが追加されている
- [ ] `documentation-changelog-template.md` に `関連 Issue / PR` フィールドが追加されている
- [ ] `documentation-changelog-template.md` に `validator 実行結果` フィールドが追加されている
- [ ] `documentation-changelog-template.md` に `current / baseline` フィールドが追加されている
- [ ] `documentation-changelog-template.md` に `artifacts 同期結果` フィールドが追加されている

### 品質要件

- [ ] 全既存テストが PASS している
- [ ] 新規テストが追加されている（`### 使用例` 見出し検査の正常系・異常系）
- [ ] 既存の Phase 12 成果物に対する回帰がない
- [ ] TypeScript 型チェックが PASS している
- [ ] ESLint エラーがない

### ドキュメント要件

- [ ] `implementation-guide-template.md` の「validator 最小骨格」セクションとテンプレート本体の見出しが一致している
- [ ] `documentation-changelog-template.md` の品質チェックリストに新規必須フィールドの確認項目が追加されている

---

## 6. 検証方法

### テストケース

| No. | テストケース                                                   | 入力                                     | 期待結果                                |
| --- | -------------------------------------------------------------- | ---------------------------------------- | --------------------------------------- |
| 1   | `### 使用例` が Part 2 配下に正しく存在する                    | テンプレート準拠の実装ガイド             | `part2_usage_example`: OK               |
| 2   | `### 使用例` 見出しが欠落している                              | `### 使用例` を削除した実装ガイド        | `part2_usage_example`: NG（エラー報告） |
| 3   | `### 使用例` が `## Part 2` の直後ではなく後続 `##` 配下にある | 現行テンプレート構造の実装ガイド         | 修正後: OK（修正前: NG）                |
| 4   | changelog テンプレートに必須フィールドが含まれる               | 修正後テンプレートから生成した changelog | 5 つの必須フィールドが全て存在          |
| 5   | 既存の Phase 12 成果物に対する回帰テスト                       | 過去のワークフロー出力                   | 既存チェックの結果が変わらない          |

### 検証手順

1. テストの実行:
   ```bash
   pnpm vitest run --reporter=verbose -- validate-phase12-implementation-guide
   ```
2. validator の手動実行:
   ```bash
   node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow <ワークフローディレクトリ> --json
   ```
3. changelog テンプレートの必須フィールド確認:
   ```bash
   grep -c '変更者\|関連 Issue / PR\|validator 実行結果\|current / baseline\|artifacts 同期結果' .claude/skills/task-specification-creator/assets/documentation-changelog-template.md
   ```

---

## 7. リスクと対策

| リスク                                                                         | 影響度 | 発生確率 | 対策                                                                                |
| ------------------------------------------------------------------------------ | ------ | -------- | ----------------------------------------------------------------------------------- |
| validator 修正により既存の Phase 12 成果物が FAIL になる                       | 高     | 中       | 修正前に既存成果物の validator 結果をベースラインとして記録し、回帰テストで比較する |
| テンプレート構造変更が既存出力済みドキュメントと非互換になる                   | 中     | 低       | テンプレート本体の見出し追加に留め、既存見出しの名称変更は行わない                  |
| `extractSection` の修正が他のチェック項目に副作用を与える                      | 中     | 低       | アプローチ A（見出し直接検査）を優先し、`extractSection` 自体は変更しない方針を推奨 |
| changelog テンプレートへのフィールド追加が既存ワークフローの出力と不整合になる | 低     | 中       | 新規フィールドにはプレースホルダ（`{{...}}`）を設定し、既存出力には影響しない       |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                | パス                                                                                         |
| --------------------------- | -------------------------------------------------------------------------------------------- |
| 実装ガイドテンプレート      | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`          |
| validator スクリプト        | `.claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js` |
| changelog テンプレート      | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md`       |
| Phase 12 ドキュメントガイド | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`       |
| Phase 12 完了チェックリスト | `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md`      |

### 参考資料

- TASK-P0-01 Phase 12 skill-feedback-report（本タスクの発見元）
- `.claude/skills/task-specification-creator/references/phase-12-tasks-guide.md`

---

## 9. 備考

### 苦戦箇所（TASK-P0-01 での知見）

`validate-phase12-implementation-guide.js` が使用例セクションの有無を検査しない構造で、手動確認に頼る必要があった。テンプレート側で必須見出しを固定しないと、同じ見落としが繰り返される。

具体的には、`extractSection()` 関数が `## Part 2` から次の `##` レベル見出し（`## 1. アーキテクチャ概要`）までしか切り出さないため、`### 使用例` が Part 2 セクションの一部として認識されない。テンプレートの「validator 最小骨格」セクションには `### 使用例` が必須見出しとして記載されているにもかかわらず、validator のロジックがその構造に対応していなかった。この不一致が根本原因であり、テンプレートと validator の両方を同期的に修正する必要がある。

### 補足事項

- 本タスクは小規模であり、1 セッションで完了可能と見積もる。
- アプローチ A（validator 側で `### 使用例` 見出しを直接検査）を推奨する。`extractSection` のロジック変更は影響範囲が広いため、最小限の変更で問題を解決する方針が望ましい。
