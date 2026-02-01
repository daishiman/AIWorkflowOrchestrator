# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値         |
| ------ | ---------- |
| Phase  | 11         |
| 機能名 | TASK-8C-G  |
| 作成日 | 2026-02-01 |

## 目的

自動テストでは検証できない観点（検証スクリプトの手動実行、フィクスチャファイルの目視確認、skill-fixture-runnerスキルの動作確認）を手動で実施する。

## 実行タスク

- 検証スクリプト手動実行: 各検証スクリプトを新規フィクスチャに対して手動実行し、出力を確認
- skill-fixture-runner動作確認: run-all-validations.jsを全フィクスチャに対して実行
- フィクスチャファイル目視確認: 各フィクスチャの内容が設計どおりであることを目視確認

## 参照資料

| 資料名               | パス                                         | 説明             |
| -------------------- | -------------------------------------------- | ---------------- |
| Phase 2 設計書       | `outputs/phase-02/fixture-design.md`         | フィクスチャ設計 |
| Phase 5 実装サマリ   | `outputs/phase-05/implementation-summary.md` | 実装フィクスチャ |
| Phase 6 テスト拡充   | `outputs/phase-06/test-expansion-result.md`  | 追加テスト一覧   |
| Phase 7 カバレッジ   | `outputs/phase-07/coverage-report.md`        | カバレッジ結果   |
| Phase 8 リファクタ   | `outputs/phase-08/refactoring-log.md`        | リファクタ内容   |
| Phase 9 品質レポート | `outputs/phase-09/quality-report.md`         | 品質検証結果     |
| Phase 10 レビュー    | `outputs/phase-10/final-review-result.md`    | レビュー判定     |

## テストカテゴリ

- **機能テスト**: 検証スクリプトの正常系/異常系動作
- **境界値テスト**: boundary-skillの各境界値が正しいこと
- **エラーパターンテスト**: 各エラーフィクスチャの検証エラーが適切であること

## テストケーステンプレート

### 1. 検証スクリプト手動実行

| No  | テスト項目                                          | 操作手順                                                                                                                                                       | 期待結果                                   | 実行結果 |
| --- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------- |
| M-1 | validate-skill-structure.js + boundary-skill        | `node .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js --target apps/desktop/src/__tests__/__fixtures__/skill-creator/boundary-skill`   | `valid: true` のJSON出力                   | 未実施   |
| M-2 | validate-skill-md.js + boundary-skill               | `node .claude/skills/skill-fixture-runner/scripts/validate-skill-md.js --target apps/desktop/src/__tests__/__fixtures__/skill-creator/boundary-skill/SKILL.md` | `valid: true` のJSON出力                   | 未実施   |
| M-3 | validate-skill-structure.js + forbidden-files-skill | 同上（パス変更）                                                                                                                                               | `valid: false`、README.md検出エラー        | 未実施   |
| M-4 | validate-skill-md.js + missing-fields-skill         | 同上（パス変更）                                                                                                                                               | `valid: false`、name/description欠落エラー | 未実施   |
| M-5 | validate-skill-structure.js + invalid-name-skill    | 同上（パス変更）                                                                                                                                               | `valid: false`、kebab-case違反エラー       | 未実施   |
| M-6 | validate-agents.js + empty-agents-skill             | 同上（パス変更）                                                                                                                                               | `valid: false`、.mdファイルなしエラー      | 未実施   |
| M-7 | validate-schemas.js + invalid-schema-skill          | 同上（パス変更）                                                                                                                                               | `valid: false`、$schema/type欠落エラー     | 未実施   |

### 2. run-all-validations.js 統合実行

| No   | テスト項目                              | 操作手順                                                                                                                                                | 期待結果                           | 実行結果 |
| ---- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | -------- |
| M-8  | run-all-validations.js + boundary-skill | `node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js --target apps/desktop/src/__tests__/__fixtures__/skill-creator/boundary-skill` | `overall: valid`                   | 未実施   |
| M-9  | run-all-validations.js + minimal-skill  | 同上（パス変更）                                                                                                                                        | `overall: valid`、スキップログあり | 未実施   |
| M-10 | run-all-validations.js --target未指定   | `node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js`                                                                               | EXIT_CODE=2                        | 未実施   |

### 3. フィクスチャ目視確認

| No   | テスト項目                            | 確認内容                                | 期待結果              | 実行結果 |
| ---- | ------------------------------------- | --------------------------------------- | --------------------- | -------- |
| M-11 | boundary-skill/SKILL.md name長        | nameフィールドの文字数をカウント        | 64文字                | 未実施   |
| M-12 | boundary-skill/SKILL.md description長 | descriptionフィールドの文字数をカウント | 10文字                | 未実施   |
| M-13 | boundary-skill/SKILL.md セクション    | Anchors/Triggerセクションの存在         | 両方存在              | 未実施   |
| M-14 | invalid-name-skill/SKILL.md name      | nameフィールドが非kebab-case            | 大文字/アンダースコア | 未実施   |
| M-15 | forbidden-files-skill/README.md       | README.mdの存在                         | 存在する              | 未実施   |

## 統合テスト連携

| テスト項目         | 確認内容                                 | 期待結果 | 実行結果 |
| ------------------ | ---------------------------------------- | -------- | -------- |
| スクリプト手動実行 | 7スクリプト×フィクスチャの組み合わせ実行 | 期待通り | 未実施   |
| run-all統合実行    | 3パターンの統合実行                      | 期待通り | 未実施   |
| フィクスチャ目視   | 5件のフィクスチャ内容確認                | 設計通り | 未実施   |

## 成果物

| 成果物     | パス                                     | 説明           |
| ---------- | ---------------------------------------- | -------------- |
| テスト結果 | `outputs/phase-11/manual-test-result.md` | 手動テスト結果 |

## 完了条件

- [ ] 全手動テストケース（M-1～M-15）が実行済み
- [ ] 全手動テストケースがPASS
- [ ] 検証スクリプトの手動実行結果が期待通り
- [ ] フィクスチャファイルの目視確認が完了
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新
