# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                                                   |
| ------ | ---------------------------------------------------- |
| Phase  | 8                                                    |
| 機能名 | ut-imp-task-sdk-04-phase12-canonical-path-resync-001 |
| 作成日 | 2026-03-27                                           |

## 目的

close-out 証跡の重複説明と語彙の揺れを削減し、同じ事実を複数の言い回しで書かない構造へ整える。

## 実行タスク

- path 表記を正規化する
- `spec_created` judgement の語彙を正規化する
- follow-up 導線の表記を正規化する
- verification note の重複を削減する

## 参照資料

| 資料名       | パス                        | 説明              |
| ------------ | --------------------------- | ----------------- |
| Phase 1 要件 | `phase-1-requirements.md`   | current fact 語彙 |
| Phase 2 設計 | `phase-2-design.md`         | 正規化対象        |
| Phase 5 実装 | `phase-5-implementation.md` | 実更新対象        |
| Phase 6 拡充 | `phase-6-test-expansion.md` | drift 再発観点    |
| Phase 7 監査 | `phase-7-coverage-check.md` | coverage 結果     |

### システム仕様（aiworkflow-requirements）

| 参照資料         | パス                                                                                              | 内容                          |
| ---------------- | ------------------------------------------------------------------------------------------------- | ----------------------------- |
| lessons          | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`                    | close-out 語彙の一貫性        |
| Phase 12 lessons | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md` | stale evidence 再発防止の語彙 |

## 実行手順

1. path は completed-tasks 配下の current path に統一する
2. judgement は `spec_created` 維持の表現へ統一する
3. follow-up は `UT-SC-02-006` と `TASK-SDK-04-U1..U3` を同じ粒度で記述する
4. verification note は current code と local environment blocker を分離して書く

## 成果物

| 成果物           | パス                     | 説明               |
| ---------------- | ------------------------ | ------------------ |
| refactoring 方針 | `phase-8-refactoring.md` | 語彙と表記の正規化 |

## 統合テスト連携

- Phase 9 は Phase 8 の正規化結果が wording guard を満たすか確認する。
- Phase 10 は Phase 8 の語彙整理が最終レビューで崩れていないか確認する。

## 完了条件

- [ ] path 表記が正規化されている
- [ ] judgement 語彙が正規化されている
- [ ] follow-up 導線の表記が正規化されている
- [ ] verification note の重複が削減されている
- [ ] **本Phase内の全タスクを100%実行完了**
