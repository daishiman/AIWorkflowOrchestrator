# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 7                                                   |
| Phase 名   | カバレッジ確認                                      |
| 前提 Phase | Phase 6（テスト拡充）                               |
| 後続 Phase | Phase 8（リファクタリング）                         |
| ステータス | 未実施                                              |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

`classifyExecuteResult()`・`extractExecuteErrorMessage()`・修正した `executeAsync()` の変更ブロックに対して line/branch カバレッジを計測し、目標値（Line 90%+・Branch 80%+）を達成していることを確認する。

## 背景

> **[Feedback BEFORE-QUIT-002]** Phase 7 coverage が全ファイル一律指定だと局所検証の意図がぼやける。Phase 7 では coverage の対象範囲を明示し、変更したファイル/ブロック以外を対象外として書く。

本タスクの変更は `RuntimeSkillCreatorFacade.ts` の `classifyExecuteResult()` と `executeAsync()` の一部のみである。全ファイルを対象とせず、変更ブロックのカバレッジを重点的に確認する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `Phase 実行記録` または `outputs/phase-7/` へ記録する。

### タスク 1: カバレッジ対象範囲の特定

**目的**: 計測するカバレッジ対象ブロックを明示する。

**実行手順**:

1. カバレッジ対象ブロックを以下に限定する：
   - `classifyExecuteResult()` 関数（全 branch）
   - `extractExecuteErrorMessage()` 関数（全 branch）
   - `executeAsync()` 内の switch 分岐（全 case）
   - `assertNever()` 関数（runtime coverage ではなく typecheck で確認）

2. 対象外ブロック（既存の `RuntimeSkillCreatorFacade.ts` の他の関数）は今回のカバレッジ計測対象外と明記する

**期待される成果物**:

- カバレッジ対象範囲の記録

---

### タスク 2: カバレッジ計測実行

**目的**: 実際のカバレッジ数値を取得する。

**実行手順**:

1. カバレッジ付きでテストを実行する：

   ```bash
   pnpm --filter @repo/desktop test -- --coverage \
     --reporter=verbose \
     src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts \
     src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts
   ```

2. カバレッジレポートで以下を確認する：
   - `RuntimeSkillCreatorFacade.ts` の `classifyExecuteResult` 関数の line カバレッジ
   - `classifyExecuteResult` 関数の branch カバレッジ（3 outcome 全て）
   - `extractExecuteErrorMessage` 関数の line/branch カバレッジ
   - `executeAsync()` の switch 分岐の branch カバレッジ

3. 計測結果を記録する

**期待される成果物**:

- カバレッジ計測結果（line%・branch%）

---

### タスク 3: カバレッジ目標達成確認

**目的**: 目標値を達成しているかを判定し、未達の場合は Phase 6 に戻る。

**実行手順**:

1. 以下の目標値と実測値を照合する：

   | 対象ブロック                   | Line 目標 | Branch 目標 | 実測 Line | 実測 Branch |
   | ------------------------------ | --------- | ----------- | --------- | ----------- |
   | `classifyExecuteResult()`      | 90%+      | 100%        |           |             |
   | `extractExecuteErrorMessage()` | 90%+      | 100%        |           |             |
   | `executeAsync()` switch 分岐   | 90%+      | 80%+        |           |             |

2. 未達の場合は原因（未テストの branch）を特定し、Phase 6 に戻ってテストを追加する
3. 達成した場合は Phase 8 へ進む

**期待される成果物**:

- カバレッジ達成判定記録

---

## 参照資料

| 参照資料         | パス                                                                         | 内容                 |
| ---------------- | ---------------------------------------------------------------------------- | -------------------- |
| Phase 6 実行記録 | 本ワークフロー Phase 6 完了記録                                              | 追加テストの一覧     |
| カバレッジ基準   | `.claude/skills/task-specification-creator/references/coverage-standards.md` | カバレッジ目標値定義 |

---

## 成果物

| 成果物             | パス               | 内容                       |
| ------------------ | ------------------ | -------------------------- |
| カバレッジ計測記録 | （Phase 実行記録） | 実測 line%・branch% と判定 |

---

## 統合テスト連携

- 変更したファイル/ブロック以外を対象外とし、局所的なカバレッジ検証を実施する。

---

## 完了条件

- [ ] カバレッジ対象範囲が明示されている
- [ ] `classifyExecuteResult()` の line カバレッジが 90%+ である
- [ ] `classifyExecuteResult()` の branch カバレッジが 100% である（3 outcome 全て）
- [ ] `extractExecuteErrorMessage()` の line/branch カバレッジが達成されている
- [ ] `executeAsync()` switch 分岐の branch カバレッジが 80%+ である
- [ ] 未達の場合は Phase 6 に戻り追加テストを作成している

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む（目標達成の場合）

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 7 実行記録

### カバレッジ計測結果

| 対象ブロック               | Line 目標 | Branch 目標 | 実測 Line | 実測 Branch | 判定 |
| -------------------------- | --------- | ----------- | --------- | ----------- | ---- |
| classifyExecuteResult()    | 90%+      | 100%        |           |             |      |
| executeAsync() switch 分岐 | 90%+      | 80%+        |           |             |      |

### 判定

- 目標達成: Yes / No
- 未達の場合の対応:

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後、以下のファイルを実行してください：

`docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/phase-8-refactoring.md`
