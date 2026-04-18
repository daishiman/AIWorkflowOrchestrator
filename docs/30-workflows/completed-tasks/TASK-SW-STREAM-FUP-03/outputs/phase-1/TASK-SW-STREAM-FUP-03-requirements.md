# TASK-SW-STREAM-FUP-03 要件定義

## P50チェック結果

### emitProgress 呼び出し箇所（Phase 1 調査時点）

| 箇所                 | 旧 phase          | percentage | 備考                     |
| -------------------- | ----------------- | ---------- | ------------------------ |
| switch 前            | planning          | 10         | 全モード共通（問題箇所） |
| init_skill 後        | generating-skill  | 40         | 全モード共通             |
| generateTaskSpecs 前 | generating-agents | 70         | 全モード共通             |
| validateSkill 前     | validating        | 90         | 全モード共通             |
| validateSkill 後     | done              | 100        | 全モード共通             |

### ワークフローメソッド状態

| メソッド                 | 状態                   | progress 通知 |
| ------------------------ | ---------------------- | ------------- |
| runCollaborativeWorkflow | stub（loadAgent のみ） | なし          |
| runOrchestrateWorkflow   | stub（engine取得のみ） | なし          |
| runCreateWorkflow        | 実装済み               | なし          |
| runUpdateWorkflow        | 未実装                 | なし          |
| runImprovePromptWorkflow | 未実装                 | なし          |

### FUP-02 状態

未完了。定数化は SkillCreatorService.ts 内 private 定義に閉じる方針。

## モード別フェーズ列（確定値）

| モード         | フェーズ列                                                                       | percentage         |
| -------------- | -------------------------------------------------------------------------------- | ------------------ |
| create         | planning → generating-skill → generating-agents → validating → done              | 10/40/70/90/100    |
| collaborative  | interview → consensus → generating-skill → generating-agents → validating → done | 10/35/60/80/90/100 |
| orchestrate    | engine-selection → generating-skill → generating-agents → validating → done      | 15/45/75/90/100    |
| update         | loading-skill → analyzing → generating-skill → validating → done                 | 10/30/60/90/100    |
| improve-prompt | loading-skill → analyzing → improving → validating → done                        | 10/30/65/90/100    |

## 受入条件（AC-1〜AC-8）確定

| ID   | 条件                                                         | 検証方法       |
| ---- | ------------------------------------------------------------ | -------------- |
| AC-1 | create モードの5段階フローが既存通り                         | TC-14 (FUP-03) |
| AC-2 | collaborative で interview・consensus が通知                 | TC-01, TC-02   |
| AC-3 | orchestrate で engine-selection が通知                       | TC-05          |
| AC-4 | update で loading-skill・analyzing が通知                    | TC-08, TC-09   |
| AC-5 | improve-prompt で loading-skill・analyzing・improving が通知 | TC-11, TC-12   |
| AC-6 | 既存テスト全件 PASS                                          | vitest run     |
| AC-7 | percentage 単調増加・0〜100                                  | TC-19〜21      |
| AC-8 | onProgress 未指定でもエラーなし                              | TC-15〜18      |
