# Phase 9: 品質保証 - UT-SDK-07-PHASE11-SCREENSHOT-EVIDENCE-001

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 9                                         |
| Phase名    | 品質保証                                  |
| 前提Phase  | Phase 8（N/A）                            |
| 後続Phase  | Phase 10                                  |
| ステータス | complete                                  |
| 作成日     | 2026-04-06                                |
| 機能名     | ut-sdk-07-phase11-screenshot-evidence-001 |

---

## 目的

Phase 11 手動テストの実施前に、前提条件・設計品質・evidence 保存先の整合性を一括確認する。

---

## 実行タスク

- 前提確認コマンドで evidence 保存先と screenshot-plan.json を確認する
- 品質保証チェックリストで Phase 1〜3 の設計整合を確認する
- スコープ外混入の有無を確認する

### タスク1: 前提確認チェック

**目的**: Phase 11 を問題なく実施できる状態か確認する。

```bash
# TASK-SDK-07 Phase 11 出力ディレクトリの存在確認
ls docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/ 2>/dev/null \
  && echo "OK: ディレクトリ存在" || echo "NG: ディレクトリ未存在"

# screenshot-plan.json の存在確認
ls docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshot-plan.json 2>/dev/null \
  && echo "OK: screenshot-plan.json 存在" || echo "NG: ファイル未存在"

# screenshots ディレクトリの存在確認（なければ作成要）
ls docs/30-workflows/step-05-seq-task-07-execution-governance-and-handoff-alignment/outputs/phase-11/screenshots/ 2>/dev/null \
  && echo "OK: screenshots/ 存在" || echo "INFO: screenshots/ 未作成（Phase 11 で作成）"

# SkillLifecyclePanel の HandoffGuidance 実装確認
grep -n "HandoffGuidance\|terminal_handoff" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx 2>/dev/null | head -10
```

---

### タスク2: 品質保証チェックリスト

| チェック項目                                                                                                                                                                        | 結果 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| Phase 1 の AC-1〜AC-6 が Phase 2 の設計で網羅されているか                                                                                                                           | □    |
| capture ID が 3 件（TC-11-01・TC-11-02・TC-11-03）定義されているか                                                                                                                  | □    |
| evidence bundle（manual-test-checklist / manual-test-report / discovered-issues / ui-sanity-visual-review / screenshot-coverage / phase11-capture-metadata.json）が設計されているか | □    |
| evidence 保存先パスが実在するディレクトリ（または作成予定）か                                                                                                                       | □    |
| Phase 4〜8 が N/A として記録されているか                                                                                                                                            | □    |
| TASK-SDK-07 の実装完了が前提として明記されているか                                                                                                                                  | □    |
| コード変更が発生しないことが確認できているか                                                                                                                                        | □    |

---

### タスク3: スコープ外の混入確認

| 確認項目                                         | 結果 |
| ------------------------------------------------ | ---- |
| Approval request surface が含まれていないか      | □    |
| 新規自動テストが含まれていないか                 | □    |
| SkillLifecyclePanel.tsx の変更が含まれていないか | □    |

---

## 参照資料

| 参照資料         | パス                       | 内容             |
| ---------------- | -------------------------- | ---------------- |
| Phase 1 要件     | `phase-1-requirements.md`  | AC・スコープ定義 |
| Phase 2 設計     | `phase-2-design.md`        | 操作シナリオ     |
| Phase 3 レビュー | `phase-3-design-review.md` | レビュー結果     |

---

## 成果物

| 成果物       | パス                               | 内容             |
| ------------ | ---------------------------------- | ---------------- |
| 品質確認結果 | `outputs/phase-9/quality-check.md` | チェック結果一覧 |

---

## 統合テスト連携

- Phase 10 の最終レビュー判定を前提に Phase 11 の手動テストへ進む
- Phase 11 の screenshot evidence と `manual-test-result.md` を Phase 12 で集約する

## 完了条件

- [ ] 前提確認コマンドを全て実行し結果を記録した
- [ ] 品質保証チェックリストが全て OK または対応方針を記録した
- [ ] スコープ外の混入がないことを確認した

## タスク100%実行確認【必須】

全完了条件を確認し、Phase 9 が完了したことを記録すること。

## 次Phase

Phase 10: 最終レビューゲート
