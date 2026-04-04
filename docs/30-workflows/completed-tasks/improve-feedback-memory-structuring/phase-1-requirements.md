# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 1                                                  |
| タスクID   | task-ut-p0-02-001-repeat-feedback-memory           |
| タスク名   | verify→improve ループの feedback memory 構造化改善 |
| タスク分類 | 改善（内部ロジック改善、IPC/UI 変更なし）          |
| 前Phase    | -                                                  |
| 次Phase    | Phase 2: 設計                                      |

---

## 目的

`verifyAndImproveLoop()` 内の feedback memory を文字列型から構造化配列に変更し、LLM が全試行の失敗履歴を参照して重複のない改善策を提案できるようにする。

---

## Step 0: P50チェック（必須）

### 実装状態確認

| 確認項目                            | 結果                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------- |
| `ImproveFeedbackHistory` 型の存在   | **未定義** — `packages/shared/src/types/skillCreator.ts` に定義なし                               |
| `previousImproveSummary` の現在の型 | `string` — `RuntimeSkillCreatorFacade.ts:355` で `let previousImproveSummary = ""` として初期化   |
| `buildImproveFeedback` の現在の引数 | `(checks: RuntimeSkillCreatorVerifyCheck[], previousImproveSummary: string): string` — L1644-1656 |
| 関連テストの存在                    | `RuntimeSkillCreatorFacade.test.ts:838-973` に2回ループの前回要約参照テストあり                   |
| 3回以上ループの履歴テスト           | **未テスト** — Issue #1773 で対応予定                                                             |

### 命名規則分析

| パターン | 既存例                                                            | 規則       |
| -------- | ----------------------------------------------------------------- | ---------- |
| 型名     | `RuntimeSkillCreatorVerifyCheck`, `RuntimeSkillCreatorFacadeDeps` | PascalCase |
| 変数名   | `previousImproveSummary`, `failedChecks`, `maxImproveRetry`       | camelCase  |
| 関数名   | `buildImproveFeedback`, `formatVerifyChecksAsFeedback`            | camelCase  |
| テスト名 | `describe("verifyAndImproveLoop")` + `it("...")` 形式             | 日本語可   |

---

## 実行タスク

### タスク1: 要件の本質的目的の特定

**真の論点**: `verifyAndImproveLoop()` の feedback が文字列型で直前 1 回分しか保持しないため、LLM が全試行を俯瞰した改善策を立案できない。

**why now**: TASK-P0-02 で `maxImproveRetry`（デフォルト3）が導入されたが、feedback memory が 1 回分のままなので、3 回ループの効果が頭打ちになっている。

**why this way**: LLM は構造化されたフィードバック（試行番号・失敗チェック・改善要約の配列）を受け取ることで、過去の試みと異なるアプローチを選択できる。文字列連結では試行境界が曖昧になる。

### タスク2: 依存関係・責務境界の確認

| コンポーネント                   | 責務                                         | 状態所有権           |
| -------------------------------- | -------------------------------------------- | -------------------- |
| `RuntimeSkillCreatorFacade`      | public bridge（plan/execute/improve/verify） | 所有しない           |
| `SkillCreatorWorkflowEngine`     | phase/state 管理                             | workflow state owner |
| `verifyAndImproveLoop()`         | verify→improve→re-verify 閉ループ            | ループ内 local state |
| `buildImproveFeedback()`         | feedback 文字列の組み立て                    | stateless function   |
| `formatVerifyChecksAsFeedback()` | チェック結果のフォーマット                   | stateless function   |

**変更の影響範囲**: `verifyAndImproveLoop()` 内のローカル変数と `buildImproveFeedback()` のシグネチャのみ。外部インターフェース（IPC、Renderer）への影響なし。

### タスク3: 価値とコストの不均衡確認

| 観点     | 評価                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 価値     | 3 回ループの有効活用率向上、verify 通過率の改善、LLM トークン効率の改善        |
| コスト   | 型定義追加（1型）、関数シグネチャ変更（1箇所）、ループ内ロジック修正（〜20行） |
| 均衡判定 | **低コスト・高価値** — 変更箇所が局所的かつ影響範囲が閉じている                |

### タスク4: 4条件の評価

| 条件   | 評価                                                                                     |
| ------ | ---------------------------------------------------------------------------------------- |
| 価値性 | LLM の重複提案を排除し、maxImproveRetry の効果を最大化する。ユーザーの verify 通過率向上 |
| 実現性 | 変更箇所が `RuntimeSkillCreatorFacade.ts` 内に閉じており、小規模スコープで実装可能       |
| 整合性 | 責務境界（Facade = public bridge）を変えない。ImproveFeedbackHistory は shared 型で定義  |
| 運用性 | 既存テスト（2回ループ）を拡張するだけで回帰を検証可能。IPC/UI 変更なし                   |

---

## 受入条件（Acceptance Criteria）

| AC ID | 条件                                                                                                     | 検証方法       | 優先度 |
| ----- | -------------------------------------------------------------------------------------------------------- | -------------- | ------ |
| AC-1  | `ImproveFeedbackHistory` 型が `packages/shared/src/types/skillCreator.ts` に定義されていること           | code-review    | must   |
| AC-2  | `verifyAndImproveLoop()` が `ImproveFeedbackHistory[]` を蓄積し、各 improve 呼び出し時に全履歴を渡すこと | automated-test | must   |
| AC-3  | `buildImproveFeedback()` が全試行の失敗チェックと改善要約を含む feedback 文字列を生成すること            | automated-test | must   |
| AC-4  | 3 回ループ実行時に、試行 3 の feedback に試行 1・2 の情報が含まれていること                              | automated-test | must   |

---

## 前提条件

| 条件                                                                 | 種別       | 状態 |
| -------------------------------------------------------------------- | ---------- | ---- |
| TASK-P0-02 で `maxImproveRetry` と基本ループが実装済み               | dependency | met  |
| `verifyAndImproveLoop()` が `while(true)` ループで動作している       | technical  | met  |
| `buildImproveFeedback()` が stateless な pure function である        | technical  | met  |
| `packages/shared/src/types/skillCreator.ts` が shared 型定義ファイル | technical  | met  |

---

## 制約

| 制約                                                    | 種別      | 影響度 |
| ------------------------------------------------------- | --------- | ------ |
| IPC チャンネルの追加・変更は行わない                    | technical | high   |
| Renderer 側の UI 変更は行わない                         | technical | high   |
| `maxImproveRetry` のデフォルト値（3）は変更しない       | business  | medium |
| 既存の 2 回ループテストが回帰しないこと                 | quality   | high   |
| `previousImproveSummary` を完全に除去し、新型に置換する | technical | medium |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                       | パス                                                                                                            | 内容                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| RuntimeSkillCreatorFacade 仕様 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                     | Facade の責務・統合仕様           |
| verify→improve 閉ループ教訓    | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`               | TASK-P0-02 の設計教訓             |
| Skill Creator IPC 教訓         | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | 責務分離・session 統合教訓        |
| Agent IPC コア仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`                                       | verify/improve IPC チャンネル定義 |

### 対象ソースコード

| ファイル                                                                             | 行番号    | 内容                              |
| ------------------------------------------------------------------------------------ | --------- | --------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | 340-518   | `verifyAndImproveLoop()` メソッド |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | 355       | `previousImproveSummary` 初期化   |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | 422-425   | `buildImproveFeedback()` 呼び出し |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | 498       | `previousImproveSummary` 更新     |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | 1644-1656 | `buildImproveFeedback()` 関数定義 |
| `packages/shared/src/types/skillCreator.ts`                                          | -         | 型定義追加先                      |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | 838-973   | 既存 2 回ループテスト             |

---

## 実行手順

1. P50チェック結果を確認（上記 Step 0）
2. 命名規則を確認（上記 Step 0）
3. 受入条件 AC-1〜AC-4 を定義（上記）
4. スコープ・前提条件・制約を確定（上記）

---

## 成果物

| 成果物             | パス                                    | 状態      |
| ------------------ | --------------------------------------- | --------- |
| Phase 1 要件定義書 | `phase-1-requirements.md`（本ファイル） | completed |

---

## 完了条件

- [x] P50チェックで既存実装状態を確認した
- [x] 命名規則を分析・記録した
- [x] タスク分類（改善、IPC/UI 変更なし）を明示した
- [x] AC-1〜AC-4 を検証可能な形で定義した
- [x] スコープ（含む/含まない）を明確化した
- [x] 前提条件・制約を列挙した
- [x] 参照資料（aiworkflow-requirements + ソースコード）を特定した

---

## タスク100%実行確認【必須】

Phase 1 の全タスク（P50チェック、命名規則分析、要件定義、AC定義、スコープ定義）を100%実行し完遂した。

---

## 次Phase

Phase 2: 設計 — `ImproveFeedbackHistory` 型の topology、`verifyAndImproveLoop()` 変更設計、`buildImproveFeedback()` プロンプト設計を行う。

**Phase 1-3 完了前に Phase 4 へ進まないこと。**
