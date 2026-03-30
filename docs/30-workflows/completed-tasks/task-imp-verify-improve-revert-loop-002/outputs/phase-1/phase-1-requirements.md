# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 1                                       |
| 機能名 | task-imp-verify-improve-revert-loop-002 |
| 作成日 | 2026-03-30                              |

## 目的

verify → improve → re-verify 自動閉ループに必要な要件を確定し、既存実装との差分を明らかにする。

## タスク分類

| 項目           | 値                           |
| -------------- | ---------------------------- |
| タスク種別     | 機能追加                     |
| UI task        | No                           |
| docs-only task | No                           |
| コード変更     | Yes（Main層 + Shared Types） |

## P50チェック: 既実装状態の調査

### 対象ファイルの現状

| ファイル                            | 現状                                                                                                                    | 本タスクでの扱い                                                                                                         |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `SkillCreatorWorkflowEngine.ts`     | `recordVerifyFailure()` で verify→improve 遷移可能だが、手動呼び出しが必要。`recordVerifyPass()` 未実装。自動ループなし | `recordVerifyPass()` / `recordImproveAttempt()` / `getImproveAttemptCount()` 実装、自動閉ループのオーケストレーション    |
| `RuntimeSkillCreatorFacade.ts`      | `verifySkill()` は結果を返すだけ。`improve()` / `applyImprovement()` は独立メソッド。パイプラインなし                   | verify→improve→re-verify を自動実行するパイプラインエントリーポイント追加                                                |
| `SkillCreatorVerificationEngine.ts` | Layer 1/2 の verify チェックが完成済み。`verify(skillDir)` → `RuntimeSkillCreatorVerifyCheck[]`                         | 変更不要。閉ループから呼び出す側                                                                                         |
| `skillCreator.ts`（Shared Types）   | `SkillCreatorWorkflowPhase` = 6種。`SkillCreatorVerifyResult` に `status` / `nextAction` あり。retry関連フィールドなし  | `SkillCreatorVerifyResult` に `improveAttemptCount` / `maxImproveRetry` / `loopExhausted` / `failedChecksSummary` を追加 |

### P50判定

| 判定     | 根拠                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 新規実装 | 閉ループの自動オーケストレーションは未実装。基盤部品（verify / improve / applyImprovement）は存在するが、接続パイプラインがない |

## 実行タスク

### Task 1-1: SkillCreatorWorkflowEngine の既存 API 精査

**対象**: `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`

既存の公開メソッド:

| メソッド                   | 用途                                  | 閉ループとの関係                         |
| -------------------------- | ------------------------------------- | ---------------------------------------- |
| `recordPlanResult()`       | plan→review 遷移                      | 直接関係なし                             |
| `recordExecuteStart()`     | review→execute / improve→execute 遷移 | re-execute 時に使用（improve→execute）   |
| `recordExecuteResult()`    | execute→verify 遷移                   | re-verify 前の execute 完了記録          |
| `recordExecutionFailure()` | execute→review 遷移（エラー時）       | 閉ループ中の execute 失敗時ハンドリング  |
| `recordVerifyFailure()`    | verify→improve/review 遷移            | 既存だが自動閉ループ内での呼び出しが必要 |
| `submitUserInput()`        | ユーザー判断の受付                    | 閉ループ外の手動操作用                   |
| `requestReverify()`        | 手動 re-verify 要求                   | UI からの手動操作用。閉ループとは分離    |

**追加が必要なメソッド**:

| メソッド                   | 目的                                       |
| -------------------------- | ------------------------------------------ |
| `recordVerifyPass()`       | verify 成功時の状態遷移を記録              |
| `recordImproveAttempt()`   | verify 失敗時の improve 開始と試行回数記録 |
| `getImproveAttemptCount()` | 現在の improve 試行回数を取得              |

### Task 1-2: SkillCreatorVerifyResult の拡張要件

**現行フィールド** (`skillCreator.ts` L500-509):

```typescript
interface SkillCreatorVerifyResult {
  status: "pending" | "pass" | "fail";
  reason?: SkillCreatorWorkflowFailureReason;
  message?: string;
  nextAction?: "review" | "improve" | "handoff";
  updatedAt: string;
}
```

**追加が必要なフィールド**:

| フィールド            | 型        | 説明                                      |
| --------------------- | --------- | ----------------------------------------- |
| `improveAttemptCount` | `number`  | 現在の improve 試行回数（0から開始）      |
| `maxImproveRetry`     | `number`  | 最大 improve 試行回数（デフォルト: 3）    |
| `loopExhausted`       | `boolean` | maxRetry 到達で閉ループが停止したかどうか |
| `failedChecksSummary` | `string`  | improve フィードバック生成用の失敗要約    |

**設計方針**:

- `SkillCreatorWorkflowUiSnapshot` は拡張しない
- 閉ループの状態は `verifyResult` 経由で参照する

### Task 1-3: RuntimeSkillCreatorVerifyCheck → improve フィードバック変換要件

**現行**: `RuntimeSkillCreatorVerifyCheck` 型:

```typescript
interface RuntimeSkillCreatorVerifyCheck {
  id: string; // "L1-001", "L2-003" 等
  layer: number; // 1 or 2
  severity: "error" | "warning" | "info";
  summary: string; // チェック概要
  passed: boolean;
}
```

**変換要件**:

1. `severity === "error"` のチェックを優先的に improve フィードバックに含める
2. `severity === "warning"` は補足情報として追加
3. `severity === "info"`（PASS）は除外
4. フィードバック文字列フォーマット:

   ```
   以下の検証チェックに失敗しました。修正してください:

   [ERROR] L1-001: SKILL.md が存在しません
   [ERROR] L2-003: SKILL.md に "Trigger" セクションがありません
   [WARNING] L1-004: references/ ディレクトリが見つかりません
   ```

5. 変換関数: `formatVerifyChecksAsFeedback(checks: RuntimeSkillCreatorVerifyCheck[]): string`

### Task 1-4: maxImproveRetry の設計要件

| 項目             | 値                                                      |
| ---------------- | ------------------------------------------------------- |
| デフォルト値     | 3                                                       |
| 設定方法         | `RuntimeSkillCreatorFacadeDeps` の optional フィールド  |
| 最小値           | 1                                                       |
| 最大値           | 10（安全上限）                                          |
| 到達時の動作     | `verifyResult.loopExhausted: true` を設定しループ停止   |
| 到達時の状態遷移 | `currentPhase` を `"review"` に遷移（ユーザー判断要求） |

### Task 1-5: 閉ループの全体フロー要件

```
1. Facade.verifyAndImproveLoop(planId, skillDir, skillName, authMode, apiKey?) 呼び出し
   │
   ├─ 2. verificationEngine.verify(skillDir) 実行
   │     └─ checks: RuntimeSkillCreatorVerifyCheck[]
   │
   ├─ 3. 全チェック PASS ?
   │     ├─ YES → workflowEngine.recordVerifyPass(planId, checks)
   │     │        └─ 閉ループ正常終了
   │     │
    │     └─ NO → 4. improveAttemptCount < maxImproveRetry ?
    │              ├─ YES → 5. 自動 improve サイクル
    │              │        ├─ failedChecks = checks.filter(c => !c.passed)
    │              │        ├─ workflowEngine.recordImproveAttempt(planId, failedChecks)
    │              │        ├─ formatVerifyChecksAsFeedback(failedChecks)
    │              │        ├─ Facade.improve(skillName, feedback, authMode, apiKey)
    │              │        ├─ Facade.applyImprovement(skillName, suggestions)
    │              │        └─ → 2 へ戻る（re-verify）
    │              │
    │              └─ NO → 6. verifyResult.loopExhausted = true
    │                       ├─ workflowEngine.recordVerifyFailure(planId, message, "review")
    │                       └─ ユーザーに判断を委ねる
   │
   └─ 7. improve 中にエラー発生
          ├─ LLM エラー → ループ停止、エラー記録
          └─ apply エラー → ループ停止、エラー記録
```

### Task 1-6: エラーハンドリング要件

| エラーケース                        | 発生箇所                      | ハンドリング                                                                          |
| ----------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| verify 実行エラー                   | `verificationEngine.verify()` | ループ停止、エラーを `verifyResult.message` に記録                                    |
| improve LLM 呼び出し失敗            | `Facade.improve()`            | ループ停止、エラー記録、`currentPhase` を `"review"` に遷移                           |
| improve 結果の apply 失敗           | `Facade.applyImprovement()`   | ループ停止、エラー記録、`currentPhase` を `"review"` に遷移                           |
| improve 結果が空（suggestions: []） | `Facade.improve()`            | ループ停止、「改善提案なし」としてユーザーに報告                                      |
| maxImproveRetry 到達                | ループカウンタ                | `verifyResult.loopExhausted: true`、`currentPhase` を `"review"` に遷移               |
| `verificationEngine` 未DI           | Facade                        | 警告ログ出力のうえで空配列を返し、既存 `verifySkill()` の graceful degradation を維持 |

### Task 1-7: 受入基準（AC）

| AC   | 要件                                                                  | 検証方法                                                                         |
| ---- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| AC-1 | verify 全チェック PASS 時に `recordVerifyPass()` が呼ばれ状態遷移する | UT: 全 PASS の checks で呼び出し → `verifyResult.status === "pass"` 確認         |
| AC-2 | verify 失敗時に自動で improve が起動される                            | UT: 失敗 checks → `improve()` + `applyImprovement()` が呼ばれる                  |
| AC-3 | improve 後に自動で re-verify が実行される                             | UT: improve 成功後 → `verify()` が再度呼ばれる                                   |
| AC-4 | maxImproveRetry 到達時にループが停止し `loopExhausted` になる         | UT: 3回失敗後 → `verifyResult.loopExhausted: true`、4回目の improve は呼ばれない |
| AC-5 | improve 中のエラーでループが安全に停止する                            | UT: LLM エラー → ループ停止、エラーが `verifyResult.message` に記録              |
| AC-6 | `RuntimeSkillCreatorFacade` に閉ループエントリーポイントが追加される  | UT: `verifyAndImproveLoop()` メソッドの存在と正しい動作                          |
| AC-7 | 既存の手動 `reverifyWorkflow()` が影響を受けない                      | UT: 既存テスト 22件+ が全て PASS（リグレッションなし）                           |

## 参照資料

| 資料名                | パス                                                                                  | 説明                      |
| --------------------- | ------------------------------------------------------------------------------------- | ------------------------- |
| WorkflowEngine        | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                | 拡張対象                  |
| Facade                | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                 | パイプライン追加先        |
| VerificationEngine    | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`            | verify 実行元（変更なし） |
| 型定義                | `packages/shared/src/types/skillCreator.ts`                                           | 型追加先                  |
| WorkflowEngine テスト | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts` | リグレッション確認対象    |
| Facade テスト         | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts`  | リグレッション確認対象    |

## 統合テスト連携

| 観点           | 内容                                                                                   |
| -------------- | -------------------------------------------------------------------------------------- |
| ユニットテスト | WorkflowEngine 単体テスト + Facade パイプラインテスト（verify/improve をモック）       |
| 結合テスト     | VerificationEngine + Facade の閉ループ統合テスト（実ファイルシステム上のスキルで検証） |

## 多角的チェック観点

| 観点               | 適用 | 理由                                                                              |
| ------------------ | ---- | --------------------------------------------------------------------------------- |
| セキュリティ       | ✅   | LLM 応答を improve に渡す際の入力バリデーション                                   |
| エラーハンドリング | ✅   | LLM 障害、verify 障害、apply 障害の3段階エラーハンドリング                        |
| アーキテクチャ     | ✅   | Facade（オーケストレーション）→ Engine（状態管理）→ VerificationEngine の責務分離 |
| 無限ループ防止     | ✅   | `maxImproveRetry` による上限制御が必須                                            |

## 完了条件

- [ ] WorkflowEngine の既存 API が精査され、追加メソッドがリストアップされている
- [ ] `SkillCreatorVerifyResult` の拡張フィールドが定義されている
- [ ] verify チェック → improve フィードバック変換要件が設計されている
- [ ] `maxImproveRetry` の仕様が決定されている
- [ ] 閉ループの全体フロー要件が確定している
- [ ] エラーハンドリング要件が6ケース定義されている
- [ ] AC-1〜AC-7 が定義されている
- [ ] P50チェックで新規実装と判定
- [ ] タスク分類を記録（Non-UI, Non-docs-only, Main層+Shared Types変更）
- [ ] **本Phase内の全タスクを100%実行完了**
