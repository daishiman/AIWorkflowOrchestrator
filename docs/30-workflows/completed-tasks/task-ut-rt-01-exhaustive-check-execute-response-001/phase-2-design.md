# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 2                                                   |
| Phase 名   | 設計                                                |
| 前提 Phase | Phase 1（要件定義）                                 |
| 後続 Phase | Phase 3（設計レビューゲート）                       |
| ステータス | 未実施                                              |
| 作成日     | 2026-04-08                                          |
| 機能名     | task-ut-rt-01-exhaustive-check-execute-response-001 |

---

## 目的

`assertNever` ヘルパーの配置場所と `classifyExecuteResult()` / `extractExecuteErrorMessage()` の役割分担を設計し、Phase 3 レビューゲートを通過できる設計書を作成する。

## 背景

Phase 1 で確定した `RuntimeSkillCreatorExecuteResponse` union メンバー（3種）と discriminant を基に、exhaustive check パターンの具体的な実装設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。
>
> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `Phase 実行記録` または `outputs/phase-2/` へ記録する。

### タスク 1: assertNever ヘルパー設計

**目的**: `assertNever` の配置場所（ローカル vs 共有）を決定し、実装仕様を確定する。

**実行手順**:

1. `packages/shared/src/types/` に既存の `assertNever` または `exhaustiveCheck` 相当ユーティリティが存在するか確認する
2. 他ファイルでの `assertNever` 利用実績を Grep で確認する
3. 以下の判断基準で配置場所を決定する：
   - 他ファイルで使用されているなら共有ユーティリティへ
   - このファイル専用であれば `RuntimeSkillCreatorFacade.ts` のモジュールスコープへ
4. 確定した `assertNever` の実装仕様を記録する：

```typescript
// 採用する実装（モジュールスコープ追加の場合）
function assertNever(value: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(value)}`);
}
```

**期待される成果物**:

- `assertNever` 配置場所の決定と理由（Phase 実行記録）

---

### タスク 2: classifyExecuteResult 関数設計

**目的**: union メンバーを正確に分類する `classifyExecuteResult()` 関数のインターフェースと分岐ロジックを設計する。

**実行手順**:

1. Phase 1 で確認した discriminant 優先順位を整理する：
   - `"type" in result && result.type === "terminal_handoff"` → `terminal_handoff`
   - `"success" in result && result.success === true` → `success`
   - `"success" in result && result.success === false` → `error`
   - `default` で `assertNever(result)` を呼ぶ

2. 戻り値型（3種のリテラルユニオン）を設計する：

   ```typescript
   type ExecuteOutcome = "terminal_handoff" | "error" | "success";
   ```

3. 関数シグネチャを確定する：

   ```typescript
   function classifyExecuteResult(
     result: RuntimeSkillCreatorExecuteResponse,
   ): ExecuteOutcome;
   ```

4. `extractExecuteErrorMessage()` は分類ロジックに混ぜず、`executeAsync()` の `error` ブランチで使う前提を設計に明記する

5. `assertNever` の配置位置（`default` ブランチ）を設計する

**期待される成果物**:

- `classifyExecuteResult()` の設計書（インターフェース・分岐ロジック・assertNever 位置）

---

### タスク 3: executeAsync() 修正設計

**目的**: `executeAsync()` における switch 化後の各ケースの処理を設計する。

**実行手順**:

1. 現行の `classifyExecuteResult()` を使った処理の等価な switch 分岐を設計する：

   | ケース             | 処理                                                                  |
   | ------------------ | --------------------------------------------------------------------- |
   | `terminal_handoff` | 元の `terminal_handoff` パスと同じ処理                                |
   | `error`            | `phase = "error"` + `extractExecuteErrorMessage()` を snapshot に渡す |
   | `success`          | `phase = "complete"` + 既存動作と等価                                 |

2. 各ケースで `onWorkflowStateSnapshot` の呼び出し有無と引数を設計する
3. リグレッションが起きないようにするための検証ポイントを列挙する

**期待される成果物**:

- `executeAsync()` switch 化設計書（各ケースの処理と成果物表）

---

### タスク 4: テスト設計の事前確認

**目的**: Phase 4 で作成するテストケースの事前設計を確認する。

**実行手順**:

1. Phase 1 で確定した受入条件と対応するテストケース（TC-01〜TC-05）を対応付ける：

   | TC    | 入力 union メンバー                                              | 期待結果                            | 対応 AC    |
   | ----- | ---------------------------------------------------------------- | ----------------------------------- | ---------- |
   | TC-01 | `{ success: true, ... }`                                         | phase = "complete"                  | AC-1, AC-4 |
   | TC-02 | `{ success: false, ... }`                                        | phase = "error"                     | AC-1, AC-4 |
   | TC-03 | `RuntimeSkillCreatorExecuteErrorResponse`                        | phase = "error" + errorMessage 伝搬 | AC-2, AC-4 |
   | TC-04 | `{ type: "terminal_handoff", ... }`                              | 元と等価なフェーズ遷移              | AC-2       |
   | TC-05 | 型テスト: 新しい union メンバー追加時に `assertNever` が失敗する | コンパイルエラー発生                | AC-3       |

2. テストファイルの配置先を確認する：
   - `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.exhaustive.test.ts`

**期待される成果物**:

- テストケース設計表（Phase 実行記録）

---

## 参照資料

| 参照資料                     | パス                                                                                                         | 内容                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| RuntimeSkillCreatorFacade.ts | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                        | 対象実装ファイル             |
| skillCreator.ts（型定義）    | `packages/shared/src/types/skillCreator.ts`                                                                  | ExecuteResponse union 型定義 |
| Phase 1 実行記録             | 本ワークフロー Phase 1 完了記録                                                                              | union 型・命名規則 inventory |
| 親タスク仕様書               | `docs/30-workflows/completed-tasks/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-2-design.md` | 設計パターン参考             |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                                        | 内容                 |
| -------------------- | ------------------------------------------------------------------------------------------- | -------------------- |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | Facade current facts |
| 完了タスク記録       | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`              | 既存実装の正本       |

---

## 成果物

| 成果物                       | パス               | 内容                                 |
| ---------------------------- | ------------------ | ------------------------------------ |
| assertNever 設計書           | （Phase 実行記録） | 配置場所・実装仕様                   |
| classifyExecuteResult 設計書 | （Phase 実行記録） | インターフェース・分岐ロジック       |
| executeAsync() 修正設計書    | （Phase 実行記録） | switch 化後の各ケース処理            |
| テストケース設計表           | （Phase 実行記録） | TC-01〜TC-05 の入力/期待結果/対応 AC |

---

## 統合テスト連携

- `classifyExecuteResult()` の内部契約（3 outcome と各 union メンバーの対応）を設計書に反映する。
- 既存の IPC/Renderer 側インターフェースへの影響がないことを設計書に明記する。

---

## 完了条件

- [ ] `assertNever` の配置場所が決定し、実装仕様が確定している
- [ ] `classifyExecuteResult()` のインターフェースと分岐ロジックが設計されている
- [ ] `executeAsync()` の switch 化後の各ケース処理が設計されている
- [ ] Phase 4 のテストケース設計表（TC-01〜TC-05）が用意されている
- [ ] リグレッションリスクと対策が記録されている

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## Phase 実行記録

Phase 完了後、以下を記録してください：

```markdown
## Phase 2 実行記録

### 実行タスク

- タスク 1 assertNever 設計: [結果]
- タスク 2 classifyExecuteResult 設計: [結果]
- タスク 3 executeAsync() 修正設計: [結果]
- タスク 4 テスト設計事前確認: [結果]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次 Phase への引き継ぎ事項

-
```

---

## 次の Phase

完了後、以下のファイルを実行してください：

`docs/30-workflows/task-ut-rt-01-exhaustive-check-execute-response-001/phase-3-design-review.md`
