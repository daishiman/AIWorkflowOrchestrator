# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| Phase    | 11                                                     |
| タスクID | TASK-SW-CANCEL-004                                     |
| 前Phase  | [phase-10-final-review.md](phase-10-final-review.md)   |
| 次Phase  | [phase-12-documentation.md](phase-12-documentation.md) |
| 目的     | NON_VISUAL code task として代替証跡を固定する          |

## 目的

NON_VISUAL code task として代替証跡を固定する。

## 実行タスク

### タスク1: NON_VISUAL 代替証跡の整理

**目的**: screenshot 不要の理由と primary evidence を明示する。

**実行手順**:

1. NON_VISUAL 代替証跡方針を記録する。
2. Phase 9 / Phase 10 成果物を primary evidence として紐づける。
3. `manual-test-result.md` に視覚証跡セクションを定義する。

**期待される成果物**:

- manual-test-result.md
- evidence 対応表

### タスク2: 補助成果物の作成

**目的**: checklist と discovered issues を 0件でも残す。

**実行手順**:

1. 手動テストチェックリストを作成する。
2. discovered issues を記録する。

**期待される成果物**:

- manual-test-checklist.md
- discovered-issues.md

## NON_VISUAL 代替証跡方針

本タスクは NON_VISUAL code task のため UI スクリーンショットは不要。
ただし、Electron アプリ上での手動確認が環境として可能な場合は任意で実施する。

### 代替証跡（必須）

| 証跡                                      | パス                                      |
| ----------------------------------------- | ----------------------------------------- |
| final-review-result.md（Phase 10 成果物） | `outputs/phase-10/final-review-result.md` |
| quality-gate-report.md（Phase 9 成果物）  | `outputs/phase-9/quality-gate-report.md`  |

## 手動確認チェックリスト

### 自動テストで代替可能な確認（必須）

| 項目                                                           | 確認方法                                                  | 結果 |
| -------------------------------------------------------------- | --------------------------------------------------------- | ---- |
| `useCancelGeneration` 全テスト pass                            | `pnpm --filter @repo/desktop test -- useCancelGeneration` | [ ]  |
| IPC チャンネル許可リストに `SKILL_CREATOR_CANCEL` あり         | `channels.ts` コードリーディング                          | [ ]  |
| `contextBridge.exposeInMainWorld("skillCreatorAPI", ...)` あり | `preload/index.ts` L646 確認                              | [ ]  |

### Electron アプリ上での手動確認（任意）

| 項目                                            | 期待結果                         |
| ----------------------------------------------- | -------------------------------- |
| スキル生成中にキャンセルボタンを押す            | Main の LLM 処理が中断される     |
| キャンセル後に UI が `cancelled` 状態を表示する | `streamingStage === "cancelled"` |
| キャンセル後に再度スキル生成を開始できる        | 新しい生成が正常に開始される     |

## Discovered Issues の記録

手動確認で発見した問題を `outputs/phase-11/discovered-issues.md` に記録する。
問題がない場合も「発見された問題なし」と記録する。

## 参照資料

- `docs/30-workflows/TASK-SW-CANCEL-004/phase-9-quality-assurance.md`
- `docs/30-workflows/TASK-SW-CANCEL-004/phase-10-final-review.md`
- `.agents/skills/task-specification-creator/references/phase-11-test-report-template.md`

## 成果物

| 成果物                   | パス                                        |
| ------------------------ | ------------------------------------------- |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` |
| 発見された問題           | `outputs/phase-11/discovered-issues.md`     |

### manual-test-result.md の必須記載

```
## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要。
代替証跡は outputs/phase-10/final-review-result.md と outputs/phase-9/quality-gate-report.md。
```

## 統合テスト連携

- Phase 9 / 10 の自動テスト証跡を、NON_VISUAL の primary evidence として再利用する。
- 手動操作が任意でも、evidence は `manual-test-result.md` に集約して Phase 12 へ渡す。

## 完了条件

- [ ] 自動テストによる代替証跡が記録されている
- [ ] `manual-test-result.md` に視覚証跡セクション（NON_VISUAL 代替宣言）がある
- [ ] `manual-test-checklist.md` が作成されている
- [ ] `discovered-issues.md` が作成されている（0 件でも記録）
