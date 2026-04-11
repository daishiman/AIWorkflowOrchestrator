# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                        |
| ---------- | ----------------------------------------------------------- |
| Phase      | 7                                                           |
| Phase名    | カバレッジ確認                                              |
| タスクID   | UT-SKILL-WIZARD-FB-04-WORKFLOW-LEDGER-SYNC-001              |
| 機能名     | Phase 12 ledger/lane/artifacts 三者同期チェックリスト標準化 |
| タスク種別 | docs-only                                                   |
| 前提Phase  | Phase 6                                                     |
| 後続Phase  | Phase 8                                                     |
| ステータス | 未実施                                                      |
| 作成日     | 2026-04-11                                                  |

---

## 目的

Phase 4〜6 で作成・実行したテストケース（TC-01〜TC-12）が、
変更した 3 ファイルと AC-1〜AC-6 を漏れなくカバーしていることを定量的に確認する。

## 背景

docs-only タスクのため、カバレッジ確認の対象はコード行カバレッジではなく、
以下の 3 つの「完全性」指標に限定する：

1. **変更ファイルカバレッジ**: 変更した 3 ファイルが全て TC でテストされていること
2. **AC カバレッジ**: AC-1〜AC-6 が全て TC で検証されていること
3. **同期対象カバレッジ**: 5 同期対象ファイルが全て TC-05 チェックリストに含まれていること

> **[SKILL.md Feedback 5 対策]**: Phase 7 coverage 対象範囲を本 Phase の冒頭で明示する。
> 未到達 AC・未カバー変更ファイルがある場合は Phase 6 へ戻る。

---

## カバレッジ確認対象

### 確認対象1: 変更ファイルカバレッジ（目標: 100%）

| 変更ファイル                                                                                | カバーする TC | カバレッジ |
| ------------------------------------------------------------------------------------------- | ------------- | ---------- |
| `.claude/skills/task-specification-creator/SKILL.md`                                        | 未記入        | -          |
| `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 未記入        | -          |
| `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md`      | 未記入        | -          |

> 実行時に「カバーする TC」欄を埋め、全 3 ファイルに 1 件以上の TC が割り当てられていることを確認する。

### 確認対象2: AC カバレッジ（目標: 100%）

| AC   | 受け入れ基準                                                                             | 検証する TC | カバレッジ |
| ---- | ---------------------------------------------------------------------------------------- | ----------- | ---------- |
| AC-1 | `SKILL.md` の「よくある漏れ」テーブルに `[FB-04]` エントリが追加されていること           | 未記入      | -          |
| AC-2 | `phase12-task-spec-compliance-template.md` に三者同期チェックリストが追加されていること  | 未記入      | -          |
| AC-3 | 同期対象ファイル（backlog/completed/lane-index/artifacts × 2）が全件明示されていること   | 未記入      | -          |
| AC-4 | チェックリストが Phase 12 の必須完了条件として組み込まれていること                       | 未記入      | -          |
| AC-5 | `phase-12-documentation-guide.md` の Step 1-A 手順に三者同期ステップが追記されていること | 未記入      | -          |
| AC-6 | `.agents/skills/` mirror が `.claude/skills/` と同期されていること                       | 未記入      | -          |

> 実行時に「検証する TC」欄を埋め、AC-1〜AC-6 全てに 1 件以上の TC が割り当てられていることを確認する。

### 確認対象3: 同期対象カバレッジ（目標: 100%）

| No  | 同期対象ファイル                                                                      | TC-05 チェックリスト記載 | カバレッジ |
| --- | ------------------------------------------------------------------------------------- | ------------------------ | ---------- |
| 1   | `task-workflow.md`（backlog ledger）                                                  | 未記入                   | -          |
| 2   | `task-workflow-completed.md`（completed ledger）                                      | 未記入                   | -          |
| 3   | `lane/index.md`（lane index）                                                         | 未記入                   | -          |
| 4   | `outputs/artifacts.json`（workflow artifacts）                                        | 未記入                   | -          |
| 5   | `.claude/skills/task-specification-creator/outputs/artifacts.json`（skill artifacts） | 未記入                   | -          |

> 実行時に「TC-05 チェックリスト記載」欄を埋め、5 ファイル全てが記載されていることを確認する。

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-7/` へ記録する。

### タスク1: TC とカバレッジのマッピング作成

**目的**: TC-01〜TC-12 が各 AC・変更ファイル・同期対象をカバーしているかをマッピングする

**実行手順**:

1. `outputs/phase-4/test-cases.md` と `outputs/phase-6/expanded-test-cases.md` を参照し、TC-01〜TC-12 の一覧を確認する
2. 上記「確認対象1〜3」のテーブルを埋める
3. カバレッジを計算する（カバー済み件数 / 全件数 × 100%）
4. 結果を `outputs/phase-7/coverage-report.md` に記録する

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`

---

### タスク2: 未到達 AC・未カバー変更ファイルの判定

**目的**: カバレッジが 100% 未満の場合の対処を決定する

**実行手順**:

1. 変更ファイルカバレッジが 100% でない場合: 未カバーのファイルを特定する
2. AC カバレッジが 100% でない場合: 未到達の AC を特定する
3. 同期対象カバレッジが 100% でない場合: 未記載の同期ファイルを特定する
4. 未到達・未カバーが存在する場合は Phase 6 へ戻り、不足するテストケースを追加する
5. 判定結果を `outputs/phase-7/coverage-report.md` に追記する

**判定フロー**:

| 状態                                 | 判定 | 次のアクション               |
| ------------------------------------ | ---- | ---------------------------- |
| 全カバレッジ指標が 100%              | PASS | Phase 8 へ進む               |
| 1 つ以上のカバレッジ指標が 100% 未満 | FAIL | Phase 6 へ戻り TC を追加する |

**期待される成果物**:

- `outputs/phase-7/coverage-report.md`（判定結果追記）

---

## 参照資料

| 参照資料                  | パス                                                                                        | 内容                           |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 4 テストケース      | `outputs/phase-4/test-cases.md`                                                             | TC-01〜TC-06 定義              |
| Phase 6 拡充テストケース  | `outputs/phase-6/expanded-test-cases.md`                                                    | TC-07〜TC-11 の定義・実行結果  |
| Phase 6 回帰テスト結果    | `outputs/phase-6/regression-test-results.md`                                                | TC-12 の実行結果               |
| Phase 1 受け入れ基準      | `outputs/phase-1/acceptance-criteria.md`                                                    | AC-1〜AC-6 一覧                |
| Phase 1 要件定義書        | `outputs/phase-1/requirements-definition.md`                                                | 変更対象ファイル・同期対象一覧 |
| Phase 12 準拠テンプレート | `.claude/skills/task-specification-creator/assets/phase12-task-spec-compliance-template.md` | 実装済みチェックリスト確認     |

---

## 成果物

| 成果物             | パス                                 | 内容                                                    |
| ------------------ | ------------------------------------ | ------------------------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 変更ファイル・AC・同期対象の 3 指標カバレッジ結果と判定 |

---

## 統合テスト連携（Phase 1〜11は必須）

- 統合ポイント: カバレッジ結果が Phase 8（リファクタリング）・Phase 10（最終レビューゲート）で参照される
- 確認事項: `outputs/phase-7/coverage-report.md` の全カバレッジ指標が 100% であることを Phase 8 開始前に確認する
- 接続要件: Phase 7 PASS が Phase 8 への進行条件となる

---

## 完了条件

- [ ] 変更ファイルカバレッジが 100% であること（3 ファイル全てが TC でカバーされていること）
- [ ] AC カバレッジが 100% であること（AC-1〜AC-6 全てが TC で検証されていること）
- [ ] 同期対象カバレッジが 100% であること（5 同期対象ファイル全てが TC-05 チェックリストに含まれていること）
- [ ] `outputs/phase-7/coverage-report.md` が作成されていること
- [ ] 未到達 AC・未カバー変更ファイルがある場合は Phase 6 へ戻り TC を追加済みであること
- [ ] 本Phase内の全タスクを100%実行完了

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること（TC-07〜TC-12 が全て PASS であること）
- **後続**: Phase 8（リファクタリング）へ進む
- **戻り先**: カバレッジが 100% 未満の場合は Phase 6 へ戻り不足 TC を追加する

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 7 実行記録

### 実行タスク

- 変更ファイルカバレッジ: [X/3 = XX%]
- AC カバレッジ: [X/6 = XX%]
- 同期対象カバレッジ: [X/5 = XX%]
- 総合判定: [PASS/FAIL]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-skill-wizard-fb04-workflow-ledger-sync/phase-8-refactoring.md`
