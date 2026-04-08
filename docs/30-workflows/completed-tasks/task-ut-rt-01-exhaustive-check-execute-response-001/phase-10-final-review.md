# Phase 10: 最終レビューゲート - タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 10                                                  |
| Phase 名   | 最終レビューゲート                                  |
| 前提 Phase | Phase 9（品質保証）                                 |
| 後続 Phase | Phase 11（手動テスト）                              |
| ステータス | 未実施                                              |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

Phase 1 で確定した受入条件 AC-1〜AC-8 を全件確認し、blocker がなければ Phase 11 へ進む。MINOR 指摘は未タスク候補として記録する。

## 背景

最終レビューゲートは実装・テスト・リファクタリング・品質保証の全工程を終えた後に行う総合判定。ここで PASS することで Phase 11 手動テストへ進める。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `Phase 実行記録` へ記録する。

### タスク 1: 受入条件の最終確認

**目的**: Phase 1 で確定した AC-1〜AC-8 が全て達成されていることを確認する。

**実行手順**:

1. 以下の受入条件チェックリストを確認する：

   | AC   | 受入条件                                                                                        | 確認結果 |
   | ---- | ----------------------------------------------------------------------------------------------- | -------- |
   | AC-1 | `classifyExecuteResult()` + `switch` + `assertNever` で 3 outcome が分岐されている              | □        |
   | AC-2 | `RuntimeSkillCreatorExecuteResponse` の全 union メンバー（3種）が 3 outcome に対応している      | □        |
   | AC-3 | `assertNever` による exhaustive check が `default` ブランチに組み込まれている                   | □        |
   | AC-4 | `extractExecuteErrorMessage()` により error message が `onWorkflowStateSnapshot` に伝搬している | □        |
   | AC-5 | 追加テストが全 union ケース（TC-01〜TC-09）をカバーしている                                     | □        |
   | AC-6 | `pnpm --filter @repo/desktop typecheck` がエラーなしで通る                                      | □        |
   | AC-7 | `pnpm --filter @repo/desktop lint` がエラーなしで通る                                           | □        |
   | AC-8 | `pnpm --filter @repo/desktop test` が全て PASS する                                             | □        |

2. 未達の AC があれば MAJOR/CRITICAL として記録し、対応する Phase へ戻る

**期待される成果物**:

- 受入条件最終確認記録

---

### タスク 2: 実装品質レビュー

**目的**: `classifyExecuteResult()` / `extractExecuteErrorMessage()` / `assertNever` の実装品質が基準を満たしているかを確認する。

**実行手順**:

1. 以下の観点でコードを最終確認する：
   - `classifyExecuteResult()` の discriminant 判定順序が正確か
   - `extractExecuteErrorMessage()` の fallback と message 正規化が正確か
   - `assertNever` が `default` ブランチに配置されているか
   - 各 switch case の処理が元の動作と等価か
   - コメントが意図を具体的に説明しているか

2. 問題があれば重要度（MAJOR/MINOR）を判定して記録する

**期待される成果物**:

- 実装品質レビュー記録

---

### タスク 3: MINOR 指摘の未タスク候補登録

**目的**: MINOR 判定の指摘事項を未タスク候補として記録する。

**実行手順**:

1. Phase 3 および Phase 10 で発生した MINOR 指摘を洗い出す
2. 以下のスコープ外事項を未タスク候補として記録する：
   - `verifyAndImproveLoop()` 内の `terminal_handoff` / `success` 判定の exhaustive check 化
   - 他 consumer ファイルの exhaustive check 化

3. 未タスク候補を Phase 実行記録に記録する（Phase 12 の未タスク検出で正式 formalize する）

**期待される成果物**:

- 未タスク候補リスト

---

### タスク 4: 最終レビュー判定

**目的**: 全レビュー結果を総合して PASS/MINOR/MAJOR/CRITICAL を判定する。

**実行手順**:

1. タスク 1〜3 の結果を集約する
2. 以下の判定基準に従って判定する：

   | 判定     | 条件                              | 次のアクション                 |
   | -------- | --------------------------------- | ------------------------------ |
   | PASS     | AC-1〜AC-8 全て達成、blocker なし | Phase 11 へ進行                |
   | MINOR    | AC は達成、軽微な改善余地あり     | 未タスク化して Phase 11 へ進行 |
   | MAJOR    | AC 未達あり（修正可能）           | 影響範囲に応じた Phase へ戻る  |
   | CRITICAL | 根本的な設計問題                  | Phase 1/2 へ戻りユーザー確認   |

3. 判定結果を Phase 実行記録に記録する

---

## 参照資料

| 参照資料             | パス                                                                           | 内容               |
| -------------------- | ------------------------------------------------------------------------------ | ------------------ |
| Phase 1 受入条件     | 本ワークフロー Phase 1 完了記録                                                | AC-1〜AC-8         |
| Phase 9 品質保証     | 本ワークフロー Phase 9 完了記録                                                | 品質チェック結果   |
| review-gate-criteria | `.claude/skills/task-specification-creator/references/review-gate-criteria.md` | レビューゲート基準 |

---

## 成果物

| 成果物               | パス               | 内容                             |
| -------------------- | ------------------ | -------------------------------- |
| 最終レビュー判定記録 | （Phase 実行記録） | PASS/MINOR/MAJOR/CRITICAL と理由 |
| 未タスク候補リスト   | （Phase 実行記録） | Phase 12 での formalize 対象     |

---

## 統合テスト連携

- 最終レビューで受入条件全件を確認する。

---

## 完了条件

- [ ] 受入条件 AC-1〜AC-8 が全て達成されていることが確認されている
- [ ] 実装品質レビューが実施されている
- [ ] MINOR 指摘が未タスク候補として記録されている
- [ ] レビュー判定（PASS/MINOR/MAJOR/CRITICAL）が記録されている

---

## レビューゲート

### レビュー結果判定

| 判定     | 条件                         | 次のアクション                        |
| -------- | ---------------------------- | ------------------------------------- |
| PASS     | 全受入条件達成・blocker なし | Phase 11 へ進行                       |
| MINOR    | 軽微な指摘あり               | 未タスク化して Phase 11 へ進行        |
| MAJOR    | 重大な問題あり               | 影響範囲に応じて Phase 8/5/4/2 へ戻る |
| CRITICAL | 致命的な問題あり             | Phase 1 へ戻りユーザー確認            |

### 戻り先決定基準

| 問題の種類                  | 戻り先                |
| --------------------------- | --------------------- |
| AC-1〜AC-3 未達（実装問題） | Phase 5（実装）       |
| AC-4 未達（リグレッション） | Phase 5（実装）       |
| AC-5 未達（テスト不足）     | Phase 6（テスト拡充） |
| AC-6〜AC-8 未達             | Phase 8（リファクタ） |
| 設計根本問題                | Phase 2（設計）       |

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 9（品質保証）が完了していること
- **後続**: Phase 11（手動テスト）へ進む（PASS/MINOR の場合）

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 10 実行記録

### 受入条件確認結果

| AC         | 達成  | 備考 |
| ---------- | ----- | ---- |
| AC-1〜AC-8 | ✅/❌ |      |

### 最終レビュー判定

**判定**: [PASS / MINOR / MAJOR / CRITICAL]

### 未タスク候補

| 候補                                     | 理由                 |
| ---------------------------------------- | -------------------- |
| verifyAndImproveLoop exhaustive check 化 | スコープ外・将来対応 |

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後（PASS/MINOR の場合）、以下のファイルを実行してください：

`docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/phase-11-manual-test.md`
