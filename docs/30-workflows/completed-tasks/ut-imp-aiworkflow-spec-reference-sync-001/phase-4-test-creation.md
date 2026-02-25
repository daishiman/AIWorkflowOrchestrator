# Phase 4: テスト作成（検証シナリオ設計） - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| Phase名    | テスト作成（検証シナリオ設計）            |
| 機能名     | ut-imp-aiworkflow-spec-reference-sync-001 |
| タスクID   | UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001 |
| 前提Phase  | Phase 3                                   |
| 後続Phase  | Phase 5                                   |
| ステータス | 未実施                                    |
| 作成日     | 2026-02-25                                |

## 目的

Phase 5（仕様書更新実装）で追加する同期ルール・チェックリストが正しく機能するかを検証するシナリオとテストケースを設計する。本タスクはコード実装を伴わないため、テストケースは検証スクリプト実行結果と手動確認項目で構成する。

## 背景

本タスクは仕様書修正のみタスクであり、`apps/` や `packages/` 配下のコード変更はない。通常の TDD Red Phase で作成するユニットテストの代わりに、仕様書の同期整合を検証するスクリプト実行と手動検証のシナリオを設計する。

## 実行タスク

### タスク1: 検証シナリオ設計

**目的**: Phase 5 で仕様書を更新した後に実行する検証シナリオの全体像を設計する

**実行手順**:

1. 以下の5つの検証シナリオを `outputs/phase-4/test-specification.md` に記載する
2. 各シナリオに対して「入力」「期待される出力」「判定基準」を定義する
3. 検証スクリプトのコマンドと手動確認項目を分類する

**検証シナリオ一覧**:

| シナリオID | シナリオ名                    | 検証手段                                   | 判定基準                              |
| ---------- | ----------------------------- | ------------------------------------------ | ------------------------------------- |
| VS-001     | 未タスク参照リンク整合        | `verify-unassigned-links.js` 実行          | 出力が `ALL_LINKS_EXIST`、exit code 0 |
| VS-002     | topic-map.md 索引再生成       | `generate-index.js` 実行後の diff 確認     | 再生成後に差分が発生しない            |
| VS-003     | task-workflow.md 参照先実在   | `test -f <path>` で参照パス全件確認        | 全参照パスが実在する                  |
| VS-004     | SKILL validator 有効判定      | SKILL.md の validator セクション実行       | 対象スキルが有効判定（PASS）          |
| VS-005     | 3点同期チェックリスト検証可能 | task-workflow.md / SKILL.md / LOGS.md 突合 | 3ファイル間でタスク完了記録が一致     |

---

### タスク2: テストケース詳細設計

**目的**: 各検証シナリオを具体的なテストケースに分解し、正常系・異常系・境界値を含む実行可能な手順として記述する

**実行手順**:

1. `outputs/phase-4/test-cases.md` を作成する
2. 以下のテストケースを記載する（正常系・異常系・境界値を含む）

**テストケース一覧**:

#### Case 1: verify-unassigned-links.js で参照切れ検出（正常系）

```
テストケースID: TC-001
シナリオ: VS-001
分類: 正常系
前提条件: Phase 5 の仕様書更新が完了し、全参照リンクが正しく設定されている
実行コマンド:
  node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
期待結果:
  - exit code: 0
  - 出力に `ALL_LINKS_EXIST` が含まれる
  - missing: 0 件
失敗時の対応:
  - missing ファイルのパスを修正するか、参照を削除する
  - Phase 5 に戻り修正を実施する
```

#### Case 2: verify-unassigned-links.js で参照切れ検出（異常系 - unassigned参照残存）

```
テストケースID: TC-001-E1
シナリオ: VS-001
分類: 異常系
前提条件: 完了済みタスクの unassigned-task/ 参照が残存している
実行コマンド:
  node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
期待結果:
  - exit code: 非0
  - 出力に missing ファイルパスが列挙される
  - 残存する参照のファイル名が特定される
検証目的:
  - 参照切れを正しくエラーとして検出できることを確認する
```

#### Case 3: generate-index.js 実行後に topic-map.md が最新化される（正常系）

```
テストケースID: TC-002
シナリオ: VS-002
分類: 正常系
前提条件: Phase 5 の仕様書更新が完了している
実行コマンド:
  cd .claude/skills/aiworkflow-requirements && node scripts/generate-index.js
  cd .claude/skills/task-specification-creator && node scripts/generate-index.js
検証コマンド:
  git diff --stat -- .claude/skills/*/references/topic-map.md
期待結果:
  - generate-index.js が正常終了する（exit code 0）
  - topic-map.md に差分がない（Phase 5 で既に再生成済みの場合）
  - 差分がある場合は Phase 5 での再生成漏れとしてフラグする
失敗時の対応:
  - Phase 5 に戻り topic-map.md の再生成を実施する
```

#### Case 4: task-workflow.md の参照先が全て実在する（正常系）

```
テストケースID: TC-003
シナリオ: VS-003
分類: 正常系
前提条件: Phase 5 の仕様書更新が完了している
実行手順:
  1. task-workflow.md 内のバッククォート囲みファイルパスを抽出する
  2. 各パスに対して `test -f <path>` で実在確認する
検証コマンド:
  grep -oP '`[^`]+\.md`' .claude/skills/aiworkflow-requirements/references/task-workflow.md | \
    tr -d '`' | while read -r p; do test -f "$p" || echo "MISSING: $p"; done
期待結果:
  - `MISSING:` 出力が 0 件
失敗時の対応:
  - 非実在パスの参照を修正または削除する
```

#### Case 5: SKILL validator で対象スキルが有効判定になる（正常系）

```
テストケースID: TC-004
シナリオ: VS-004
分類: 正常系
前提条件: Phase 5 の仕様書更新が完了している
実行手順:
  1. aiworkflow-requirements/SKILL.md の validator セクションを確認する
  2. task-specification-creator/SKILL.md の validator セクションを確認する
検証基準:
  - SKILL.md の構造が validator の期待フォーマットに準拠している
  - 変更履歴テーブルに本タスクの記録が存在する
失敗時の対応:
  - SKILL.md のフォーマットを修正する
```

#### Case 6: 3点同期チェックリスト全項目が検証可能である（正常系）

```
テストケースID: TC-005
シナリオ: VS-005
分類: 正常系
前提条件: Phase 5 の仕様書更新が完了している
実行手順:
  1. task-workflow.md の完了タスクセクションにタスク記録があるか確認する
  2. aiworkflow-requirements/SKILL.md の変更履歴に記録があるか確認する
  3. task-specification-creator/SKILL.md の変更履歴に記録があるか確認する
  4. aiworkflow-requirements/LOGS.md にタスク記録があるか確認する
  5. task-specification-creator/LOGS.md にタスク記録があるか確認する
検証コマンド:
  grep -c "UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001" \
    .claude/skills/aiworkflow-requirements/references/task-workflow.md \
    .claude/skills/aiworkflow-requirements/SKILL.md \
    .claude/skills/task-specification-creator/SKILL.md \
    .claude/skills/aiworkflow-requirements/LOGS.md \
    .claude/skills/task-specification-creator/LOGS.md
期待結果:
  - 5ファイル全てで 1 件以上のマッチがある
失敗時の対応:
  - 記録漏れのファイルを特定し、Phase 5 で追記する
```

#### Case 7: LOGS.md 片方のみ更新時の不整合検出（異常系）

```
テストケースID: TC-005-E1
シナリオ: VS-005
分類: 異常系
前提条件: aiworkflow-requirements/LOGS.md のみ更新し、task-specification-creator/LOGS.md が未更新
実行手順:
  1. 上記 TC-005 の検証コマンドを実行する
  2. task-specification-creator/LOGS.md のマッチ数が 0 であることを確認する
期待結果:
  - task-specification-creator/LOGS.md で 0 件マッチが検出される
  - 不整合として記録される
検証目的:
  - LOGS.md 2ファイル更新漏れ（P1/P25 パターン）を検出可能であることを確認する
```

#### Case 8: 空の台帳での検証（境界値）

```
テストケースID: TC-005-B1
シナリオ: VS-005
分類: 境界値
前提条件: task-workflow.md の残課題テーブルが空（全タスク完了済み）
実行手順:
  1. 残課題テーブルの行数が 0 であることを確認する
  2. verify-unassigned-links.js を実行する
期待結果:
  - exit code: 0（空テーブルはエラーではない）
  - 参照切れは発生しない
検証目的:
  - 空の台帳が正常状態として扱われることを確認する
```

#### Case 9: baseline/current 分離テスト（正常系）

```
テストケースID: TC-006
シナリオ: VS-001（拡張）
分類: 正常系
前提条件: verify-unassigned-links.js の出力に既存違反（baseline）と今回追加違反（current）が混在する
実行手順:
  1. verify-unassigned-links.js を実行し、出力を取得する
  2. git diff で今回の変更ファイルリストを取得する
  3. 違反リストと変更ファイルリストを突合し、current 違反のみを抽出する
検証コマンド:
  # 今回の変更ファイルを取得
  git diff --name-only HEAD~1..HEAD -- .claude/skills/
  # 検証スクリプト実行
  node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
期待結果:
  - baseline 違反は「既存課題（スコープ外）」として分類される
  - current 違反は「今回修正必須」として分類される
  - 両者が混同されない
失敗時の対応:
  - current 違反を Phase 5 で修正する
  - baseline 違反は未タスクとして記録する
```

---

### タスク3: 統合検証シナリオ設計

**目的**: 検証スクリプト間の連携テスト（リンク検証 -> 索引再生成 -> SKILL検証の順序実行）を設計する

**実行手順**:

1. `outputs/phase-4/integration-test-design.md` を作成する
2. 以下の統合検証シナリオを記載する

```
統合テストケースID: IT-001
テスト名: 検証スクリプト順次実行
実行順序:
  Step 1: verify-unassigned-links.js 実行 → 参照切れ 0 件確認
  Step 2: generate-index.js 実行（aiworkflow-requirements + task-specification-creator）
  Step 3: topic-map.md の差分確認
  Step 4: SKILL validator 実行
  Step 5: 3点同期突合（grep コマンド）
全体判定基準:
  - 5 Step 全てが PASS であること
  - 1 Step でも FAIL の場合は Phase 5 に戻る
```

---

### タスク4: 検証結果テンプレート作成

**目的**: Phase 6 で使用する検証結果記録テンプレートを事前に準備する

**実行手順**:

1. `outputs/phase-4/test-specification.md` に結果記録テンプレートを含める
2. テンプレートは以下の形式とする:

```markdown
## 検証結果サマリ

| TC-ID     | シナリオ | 分類     | 結果      | 備考 |
| --------- | -------- | -------- | --------- | ---- |
| TC-001    | VS-001   | 正常系   | PASS/FAIL |      |
| TC-001-E1 | VS-001   | 異常系   | PASS/FAIL |      |
| TC-002    | VS-002   | 正常系   | PASS/FAIL |      |
| TC-003    | VS-003   | 正常系   | PASS/FAIL |      |
| TC-004    | VS-004   | 正常系   | PASS/FAIL |      |
| TC-005    | VS-005   | 正常系   | PASS/FAIL |      |
| TC-005-E1 | VS-005   | 異常系   | PASS/FAIL |      |
| TC-005-B1 | VS-005   | 境界値   | PASS/FAIL |      |
| TC-006    | VS-001拡 | 正常系   | PASS/FAIL |      |
| IT-001    | 統合     | 統合検証 | PASS/FAIL |      |

## 全体判定

- [ ] 正常系テストケース全件 PASS
- [ ] 異常系テストケースがエラーを正しく検出することを確認
- [ ] 境界値テストケースが正常に処理されることを確認
- [ ] 統合検証が全 Step PASS
- [ ] FAIL 項目は Phase 5 に戻り修正済み
```

---

### タスク5: 要件-テスト対応表作成

**目的**: Phase 1 の受入基準と検証シナリオの対応関係を明示する

**実行手順**:

1. `outputs/phase-4/test-specification.md` に以下の対応表を記載する

| 受入基準 | テストケース               | カバー範囲       |
| -------- | -------------------------- | ---------------- |
| AC-1     | TC-001, TC-001-E1          | 参照リンク検証   |
| AC-2     | TC-005, TC-005-E1          | 3点同期検証      |
| AC-3     | TC-003（転記結果の検証）   | 苦戦箇所転記検証 |
| AC-4     | TC-006                     | baseline/current |
| AC-5     | TC-005（曖昧表現grep検証） | 明確性検証       |

## 参照資料

| 参照資料                      | パス                                                                           | 内容                           |
| ----------------------------- | ------------------------------------------------------------------------------ | ------------------------------ |
| 要件定義（Phase 1成果物）     | `outputs/phase-1/requirements-definition.md`                                   | 機能要件・非機能要件           |
| 設計書（Phase 2成果物）       | `outputs/phase-2/architecture-design.md`                                       | 同期ルール・チェックリスト設計 |
| 設計レビュー（Phase 3成果物） | `outputs/phase-3/design-review-result.md`                                      | 設計妥当性検証結果             |
| verify-unassigned-links.js    | `.claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` | リンク検証スクリプト           |
| generate-index.js             | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`             | 索引再生成スクリプト           |
| task-workflow.md              | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 更新対象仕様書                 |
| spec-update-workflow.md       | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | 仕様更新ワークフロー           |
| phase-11-12-guide.md          | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | Phase 11/12 実行ガイド         |
| acceptance-criteria           | `outputs/phase-1/acceptance-criteria.md`                                       | Phase 1 成果物                 |
| scope-definition              | `outputs/phase-1/scope-definition.md`                                          | Phase 1 成果物                 |
| sync-rule-design              | `outputs/phase-2/sync-rule-design.md`                                          | Phase 2 成果物                 |

## システム仕様（aiworkflow-requirements + task-specification-creator）参照

| 仕様書                  | 参照セクション                       | 参照理由                     |
| ----------------------- | ------------------------------------ | ---------------------------- |
| task-workflow.md        | 残課題テーブル、完了タスクセクション | 同期対象のデータソース       |
| spec-update-workflow.md | Step 1-A 〜 Step 1-E                 | 更新ワークフローの検証基準   |
| lessons-learned.md      | P1, P2, P3, P4, P25, P43             | 過去の落とし穴の再発防止確認 |

## 実行手順

### ステップ 1: テスト仕様書作成

1. `outputs/phase-4/test-specification.md` を作成する
2. 検証シナリオ一覧（VS-001 〜 VS-005）を記載する
3. 要件-テスト対応表を記載する
4. 検証結果テンプレートを記載する

### ステップ 2: テストケース詳細作成

1. `outputs/phase-4/test-cases.md` を作成する
2. 正常系テストケース（TC-001 〜 TC-006）を記載する
3. 異常系テストケース（TC-001-E1, TC-005-E1）を記載する
4. 境界値テストケース（TC-005-B1）を記載する

### ステップ 3: 統合テスト設計作成

1. `outputs/phase-4/integration-test-design.md` を作成する
2. 統合テストケース IT-001 を記載する
3. 検証スクリプト間の実行順序と依存関係を記載する

### ステップ 4: セルフレビュー

1. Phase 1 の受入基準（AC-1 〜 AC-5）に対応するテストケースが漏れなく存在するか確認する
2. 各テストケースの実行コマンドがコピー&ペーストで実行可能か確認する
3. PASS/FAIL の判定基準に曖昧表現が含まれていないか確認する

## 統合テスト連携

本タスクはコード実装を伴わないため、コードレベルの統合テストは不要。代わりに以下の統合検証を実施する:

| 統合検証項目                        | 検証手段                                        | Phase 6 で実施 |
| ----------------------------------- | ----------------------------------------------- | -------------- |
| リンク検証スクリプト正常動作        | `verify-unassigned-links.js` 実行               | はい           |
| 索引再生成スクリプト正常動作        | `generate-index.js` 実行                        | はい           |
| 3点同期の突合                       | grep コマンドによるタスクID検索                 | はい           |
| 検証スクリプト順次実行（IT-001）    | リンク検証 -> 索引再生成 -> SKILL検証の連続実行 | はい           |
| baseline/current 分離判定（TC-006） | git diff と検証出力の突合                       | はい           |

## 多角的チェック観点

| 観点         | 確認内容                                                     | 判定基準                 |
| ------------ | ------------------------------------------------------------ | ------------------------ |
| 完全性       | 5つの検証シナリオと9つのテストケースが全て設計されている     | 5/5 シナリオ、9/9 ケース |
| 実行可能性   | 各テストケースの実行コマンドがコピー&ペーストで実行可能      | 全コマンド実行可能       |
| 判定明確性   | PASS/FAIL の判定基準が曖昧でない                             | 全ケースに明確な基準     |
| 再現性       | 同一環境で繰り返し実行しても同一結果が得られる               | 冪等な検証手段のみ使用   |
| 網羅性       | Phase 1 要件定義の全受入基準（AC-1 〜 AC-5）をカバーしている | 要件-テスト対応表完備    |
| 異常系カバー | 異常系・境界値テストケースが含まれている                     | 異常系2件、境界値1件     |

## 成果物

| 成果物           | パス                                         | 内容                               |
| ---------------- | -------------------------------------------- | ---------------------------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`      | 検証シナリオ全体設計・結果テンプレ |
| テストケース一覧 | `outputs/phase-4/test-cases.md`              | 9件のテストケース詳細              |
| 統合テスト設計   | `outputs/phase-4/integration-test-design.md` | 統合検証シナリオ IT-001            |

## 完了条件

- [ ] 5つの検証シナリオ（VS-001 〜 VS-005）が `outputs/phase-4/test-specification.md` に記載されている
- [ ] 正常系テストケース6件（TC-001 〜 TC-006）が `outputs/phase-4/test-cases.md` に記載されている
- [ ] 異常系テストケース2件（TC-001-E1, TC-005-E1）が `outputs/phase-4/test-cases.md` に記載されている
- [ ] 境界値テストケース1件（TC-005-B1）が `outputs/phase-4/test-cases.md` に記載されている
- [ ] 統合テストケース1件（IT-001）が `outputs/phase-4/integration-test-design.md` に記載されている
- [ ] 各テストケースに「実行コマンド」または「実行手順」が明記されている
- [ ] 各テストケースに「期待結果」と「失敗時の対応」が明記されている
- [ ] baseline/current 分離テスト（TC-006）が既存違反と今回差分違反を正しく分離できる設計になっている
- [ ] 検証結果テンプレートが `outputs/phase-4/test-specification.md` に含まれている
- [ ] Phase 1 の受入基準（AC-1 〜 AC-5）と検証シナリオの対応関係が確認できる

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1 〜 タスク5）を100%実行完了
- [ ] 各タスクの完了を明記
- [ ] 成果物3件が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 4 ステータスを `completed` に更新

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/ut-imp-aiworkflow-spec-reference-sync-001/phase-5-implementation.md`
