# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 6                                                                 |
| Phase名    | テスト拡充                                                        |
| 対象機能   | UT-PHASE-SPEC-FORMAT-IMPROVEMENT-001 Phase 仕様書テンプレート改修 |
| 前提Phase  | Phase 5: 実装                                                     |
| 次Phase    | Phase 7: カバレッジ確認                                           |
| ステータス | pending                                                           |
| 作成日     | 2026-04-06                                                        |
| 更新日     | 2026-04-06                                                        |

## 目的

Phase 4 で定義した TC-01〜TC-07 に加え、docs-only / spec_created の証跡境界、Phase 11 docs-only evidence、Phase 12 root evidence、artifacts parity の漏れを防ぐエッジケースと回帰ガードを追加する。

## 実行タスク

1. TC-08〜TC-11 のエッジケースを追加する
2. RG-01〜RG-02 の回帰ガードを定義する
3. Phase 11 docs-only evidence と Phase 12 root evidence への引き継ぎを明確化する

### Task 6-1: エッジケーステストケースの追加

| TC    | 検証内容                                                   | 検証方法                 | 期待結果                                                             |
| ----- | ---------------------------------------------------------- | ------------------------ | -------------------------------------------------------------------- |
| TC-08 | Phase 12 で Task 12-6 の root evidence が定義されている    | 仕様書・テンプレート確認 | root evidence に artifacts parity が含まれ、成果物に明記される       |
| TC-09 | docs-only Step 1-B が `spec_created` で固定されている      | 仕様書・テンプレート確認 | `completed` ではなく `spec_created` が明記される                     |
| TC-10 | Phase 11 docs-only evidence が正本へ整合している           | 仕様書・テンプレート確認 | `manual-test-checklist.md` 必須、`TC-ID ↔ evidence` 記録が明記される |
| TC-11 | 既存の完了済みタスク仕様書との非互換が発生しないことの確認 | 既存ファイルの grep 確認 | 既存仕様書が改修後のテンプレートのガイドラインに矛盾しない           |

### Task 6-2: 回帰ガードの定義

**回帰ガード RG-01**: Phase 12 の root evidence が成果物一覧に残っていることの確認

```bash
# Phase 12 の成果物一覧に root evidence が含まれていることを確認
rg -n "phase12-task-spec-compliance-check.md" \
  docs/30-workflows/ut-phase-spec-format-improvement-001/phase-12-documentation.md
```

**回帰ガード RG-02**: Phase 11 docs-only の証跡要件が落ちていないことの確認

```bash
# Phase 11 仕様書で checklist / result の必須要件が明記されていることを確認
rg -n "manual-test-checklist.md|TC-ID ↔ evidence" \
  docs/30-workflows/ut-phase-spec-format-improvement-001/phase-11-manual-test.md
```

### Task 6-3: Phase 11 エッジケースの確認

docs-only タスクの Phase 11 手動テストで以下のエッジケースを確認:

| エッジケース                                          | 確認内容                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------------ |
| `IS_NON_VISUAL` が未設定                              | docs-only であることを Blocker 扱いとし、未タスク化または再設計に戻す    |
| テンプレートエンジンなしで直接編集した場合            | Handlebars タグが残留した場合の検出方法を定義する                        |
| Phase 11 で発見した追加問題の記録方法                 | `discovered-issues.md` への記録手順が明確か                              |
| Phase 12 root evidence の中身が空に近い場合の扱い     | `phase12-task-spec-compliance-check.md` で PASS 断言を禁止する方針を明記 |
| `artifacts.json` と `outputs/artifacts.json` の不一致 | 同期前に completed 判定へ進めないことを確認する                          |

## 参照資料

| 資料名               | パス                            |
| -------------------- | ------------------------------- |
| Phase 4 テストケース | `outputs/phase-4/test-cases.md` |
| Phase 5 実装結果     | git diff（実装後の差分）        |

## 成果物

Phase 4 の `outputs/phase-4/test-cases.md` にエッジケース（TC-08〜TC-11）と回帰ガード（RG-01〜RG-02）を追記する。

## 統合テスト連携

- Phase 7 のカバレッジ確認で TC-08〜TC-11 と RG-01〜RG-02 の網羅を検証する。
- Phase 11 の docs-only evidence と Phase 12 の root evidence にも、この拡張結果を引き継ぐ。

## 完了条件

- [ ] TC-08〜TC-11 のエッジケーステストケースが追加されている
- [ ] RG-01〜RG-02 の回帰ガードが定義されている
- [ ] Phase 11 のエッジケースが確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
