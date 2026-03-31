# Phase 3: 設計レビュー

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 3                                 |
| 機能名 | ut-sdk06-layer34-verify-expansion |
| 作成日 | 2026-03-31                        |

## 目的

Phase 2 で設計した Layer3/4 テスト設計を、整合性・実現性・テスト品質の観点でレビューし、Phase 4 着手の可否を判定する。

## 実行タスク

- fixture 拡張設計のレビュー（Layer1/2 との整合性確認）
- 結合テスト設計のレビュー（mock 戦略の妥当性確認）
- チェック ID 体系のレビュー（`L3-001`〜`L4-003` の網羅性確認）
- skill 準拠・エレガンス・30思考法適用のレビューを行い、根拠を outputs に残す
- Phase 4 着手の go/no-go 判定

## 参照資料

| 資料名                     | パス                                                 | 説明                            |
| -------------------------- | ---------------------------------------------------- | ------------------------------- |
| Phase 1 要件               | `phase-1-requirements.md`                            | Layer3/4 チェック項目一覧       |
| Phase 2 設計               | `phase-2-design.md`                                  | fixture 拡張と結合テスト設計    |
| task-specification-creator | `.claude/skills/task-specification-creator/SKILL.md` | Phase 1-13 / Phase 12/13 の正本 |
| aiworkflow-requirements    | `.claude/skills/aiworkflow-requirements/SKILL.md`    | canonical spec 参照・更新の正本 |

## skill準拠・30思考法レビュー

| 観点                            | 確認内容                                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| task-specification-creator 準拠 | Phase 1-13 の構造、Phase 12 の 2 パート構成、Phase 13 blocked、validation コマンド、完了条件が揃っているか |
| aiworkflow-requirements 準拠    | current facts / boundary / no-op 根拠 / current-baseline 分離の観点が混ざっていないか                      |
| 30思考法の適用                  | 論理・構造・メタ・システム・戦略・問題解決の各カテゴリが Phase 1-3 に割り当てられているか                  |
| エレガンス                      | 1つのテスト目的に複数責務を混ぜず、parallelize 可能な部分が直列化されていないか                            |

## 4条件レビュー（矛盾なし・漏れなし・整合性あり・依存関係整合）

| 条件         | 確認内容                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------- |
| 矛盾なし     | scope 記述（含む/含まない）と Phase 4-12 の実行タスクが衝突していないこと                 |
| 漏れなし     | AC-1〜AC-8 と check ID / test case の写像が成立すること                                   |
| 整合性あり   | `Layer3/4`、`check ID`、`severity`、`fixture`、`loop` の語彙が全 Phase で一致していること |
| 依存関係整合 | fixture 拡張が先、unit が次、loop が後、QA/docs が最後の依存順が維持されていること        |

## 30思考法レビュー補助

| カテゴリ     | 監査観点           | この task での確認ポイント                                             |
| ------------ | ------------------ | ---------------------------------------------------------------------- |
| 論理分析系   | 前提・結論の妥当性 | check ID と severity が一意に定義されているか                          |
| 構造分解系   | 分割の適切性       | fixture / unit / integration / QA / docs が分離されているか            |
| メタ・抽象系 | 前提の再点検       | test first に対して implementation が先走っていないか                  |
| システム系   | 依存と波及         | fixture helper の拡張順が loop test より先になっているか               |
| 戦略・価値系 | 価値とコスト       | 早期に edge case を増やしすぎて初期スコープを膨らませていないか        |
| 問題解決系   | 根本原因           | 現在の不足がテスト観点の漏れなのか、結合定義の漏れなのかを区別できるか |

## レビュー観点

### 観点1: fixture 拡張の Layer1/2 互換性

- 既存 `createSkillFixture` のインターフェースを変更しないか確認する
- 新規フィールド（`referenceFiles`, `skillMdReferenceLinks`）は optional であるか確認する
- 既存テストケース（T-ENG-01〜T-FAC-02）が新フィールドの影響を受けないことを確認する

### 観点2: 結合テストの実現性

- `RuntimeSkillCreatorFacade.verifySkill()` が実際に engine の `verify()` を呼ぶかどうかを確認する
- verify→improve→reverify ループで fixture を直接書き換える方式が安定しているか確認する
- テストの実行時間が他の Layer1/2 テストと比較して著しく遅くならないか確認する

### 観点3: チェック ID 体系の網羅性

- L3-001〜L3-004 と L4-001〜L4-003 がすべての AC を満たすか確認する
- 各チェック ID に対して pass/fail の両シナリオが定義可能か確認する
- L4-002（references 整合性）の実装難易度が高すぎないか確認する

### 観点4: デグレリスク

- Layer3/4 テスト追加後に既存 Layer1/2 テストが影響を受けないことを確認する
- `layer` フィールドの型拡張（`"layer3"` | `"layer4"` 追加）が既存型を破壊しないか確認する

## 設計レビュー判定基準

| 判定  | 条件                                                                  |
| ----- | --------------------------------------------------------------------- |
| PASS  | 全観点で懸念なし、または MINOR 指摘のみ                               |
| MINOR | 軽微な懸念あり。Phase 4 着手は可能だが、指摘を記録して Phase 6 で対処 |
| MAJOR | 重大な懸念あり。Phase 2 の設計修正が必要                              |

## 統合テスト連携

- PASS / MINOR の場合、Phase 4 着手を承認する
- MAJOR の場合、Phase 2 へ差し戻して設計を修正する
- MINOR 指摘は Phase 12 まで追跡する

## 成果物

| 成果物                               | パス                                                      | 説明                                                                       |
| ------------------------------------ | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| 設計レビュー書                       | `phase-3-design-review.md`                                | レビュー結果と go/no-go 判定                                               |
| design review gate                   | `outputs/phase-3/design-review-gate.md`                   | PASS/MINOR/MAJOR 判定と指摘の要約（実測値は Phase 9/12 で補完）            |
| skill compliance and elegance review | `outputs/phase-3/skill-compliance-and-elegance-review.md` | skill準拠・30思考法・4条件・エレガンスの監査結果（Phase 1-3 の結論を固定） |

## 完了条件

- [ ] 全4観点のレビューが完了している
- [ ] go/no-go 判定が記録されている
- [ ] MINOR 以上の指摘が全て追跡対象として記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
