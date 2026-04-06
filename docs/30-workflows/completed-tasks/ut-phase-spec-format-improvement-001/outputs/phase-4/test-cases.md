# Phase 4 Test Cases

## メタ情報

| 項目   | 値                     |
| ------ | ---------------------- |
| Phase  | 4                      |
| タイプ | docs-only / NON_VISUAL |

## テストケース

| TC    | 検証内容                         | 期待結果                                       |
| ----- | -------------------------------- | ---------------------------------------------- |
| TC-01 | Phase 12 仕様書の分離構造確認    | Task/Step が別セクション                       |
| TC-02 | Phase 11 docs-only evidence 確認 | `manual-test-checklist.md` 必須                |
| TC-03 | Phase 12 root evidence 確認      | `phase12-task-spec-compliance-check.md` を含む |
| TC-04 | Task/Step 分離の可読性確認       | plan と current fact が判別可能                |
| TC-05 | Handlebars 構文確認              | エラーなし                                     |
| TC-06 | 既存フォーマット互換性           | 破壊的変更なし                                 |
| TC-07 | unassigned-task テンプレート確認 | 苦戦箇所欄が明確                               |

## エッジケース追加（Phase 6: TC-08〜TC-11）

| TC    | 検証内容                                                            | 期待結果                                                                         |
| ----- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| TC-08 | Phase 12 で Task 12-6 の root evidence が成果物一覧に定義されている | `phase12-task-spec-compliance-check.md` が成果物・root evidence として明記される |
| TC-09 | docs-only Step 1-B が `spec_created` で固定されている               | `completed` に置き換えず `spec_created` を維持                                   |
| TC-10 | Phase 11 docs-only evidence が正本へ整合している                    | `manual-test-checklist.md` 必須、`TC-ID ↔ evidence` 記録が明記される             |
| TC-11 | 既存の完了済みタスク仕様書との非互換が発生しない                    | 既存 Phase 1〜10 の仕様書がテンプレート変更に矛盾しない                          |

## 回帰ガード（Phase 6: RG-01〜RG-02）

| RG    | 検証コマンド                                                                                                                        | 期待結果                                    |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| RG-01 | `rg -n "phase12-task-spec-compliance-check.md" docs/30-workflows/ut-phase-spec-format-improvement-001/phase-12-documentation.md`    | 成果物一覧に root evidence が存在する       |
| RG-02 | `rg -n "manual-test-checklist.md\|TC-ID ↔ evidence" docs/30-workflows/ut-phase-spec-format-improvement-001/phase-11-manual-test.md` | Phase 11 docs-only 証跡要件が明記されている |

## 追加データ

```yaml
IS_PHASE_11: true
IS_NON_VISUAL: true
IS_PHASE_12: true
```
