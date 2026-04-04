# Phase 7: カバレッジ確認

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| Phase    | 7                                        |
| タスクID | task-ut-p0-02-001-repeat-feedback-memory |
| 前Phase  | Phase 6: テスト実行（Green）             |
| 次Phase  | Phase 8: リファクタリング                |

---

## 目的

`verifyAndImproveLoop` 変更行と `buildImproveFeedback` 変更行のカバレッジを確認し、テストが十分に網羅しているかを検証する。

---

## 実行タスク

### タスク1: カバレッジ対象範囲の明示

#### 対象

| ファイル                       | 対象範囲                                             |
| ------------------------------ | ---------------------------------------------------- |
| `RuntimeSkillCreatorFacade.ts` | `verifyAndImproveLoop()` 内 `feedbackHistory` 関連行 |
| `RuntimeSkillCreatorFacade.ts` | `buildImproveFeedback()` 全行                        |

#### 対象外

| ファイル                       | 対象外範囲                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| `RuntimeSkillCreatorFacade.ts` | `verifyAndImproveLoop()` の既存ロジック（verify呼び出し、improve呼び出し、applyImprovement等） |

---

### タスク2: カバレッジ実行コマンド

```bash
pnpm --filter @repo/desktop exec vitest run --coverage RuntimeSkillCreatorFacade.test.ts
```

---

### タスク3: 目標

| 対象                                          | line | branch |
| --------------------------------------------- | ---- | ------ |
| `verifyAndImproveLoop` feedbackHistory 関連行 | 100% | 100%   |
| `buildImproveFeedback`                        | 100% | 100%   |

---

### タスク4: 未達時の対応

カバレッジ目標が未達の場合、Phase 6 に戻りテスト追加を行う。

| 状況                  | 対応                                             |
| --------------------- | ------------------------------------------------ |
| line カバレッジ未達   | Phase 6 に戻り、未カバー行に対するテストを追加   |
| branch カバレッジ未達 | Phase 6 に戻り、未カバー分岐に対するテストを追加 |
| 両方達成              | Phase 8 に進行                                   |

---

## 参照資料

| 参照資料           | パス                        | 内容                   |
| ------------------ | --------------------------- | ---------------------- |
| Phase 1 要件定義   | `phase-1-requirements.md`   | AC 定義、スコープ      |
| Phase 2 設計       | `phase-2-design.md`         | 型設計、ループ変更設計 |
| Phase 6 テスト実行 | `phase-6-test-expansion.md` | テスト実行結果         |

---

## 成果物

| 成果物             | パス                                 | 状態    |
| ------------------ | ------------------------------------ | ------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | pending |

---

## 完了条件

- [ ] カバレッジ対象範囲を明示した
- [ ] カバレッジ実行コマンドを実行した
- [ ] `verifyAndImproveLoop` feedbackHistory 関連行: line 100% / branch 100% を達成した
- [ ] `buildImproveFeedback`: line 100% / branch 100% を達成した
- [ ] 未達の場合は Phase 6 に戻りテスト追加を実施した
- [ ] カバレッジレポートを `outputs/phase-7/coverage-report.md` に記録した

---

## タスク100%実行確認【必須】

Phase 7 の全タスク（カバレッジ対象範囲明示、カバレッジ実行、目標達成確認、未達時対応）を100%実行し完遂した。

---

## 次Phase

Phase 8: リファクタリング -- previousImproveSummary 除去後のコード整理、命名統一を行う。

### Phase 13 blocked 条件

Phase 13（PR作成）はユーザーの明示承認後のみ実施する。
