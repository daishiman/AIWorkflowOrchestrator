# TASK-P0-02: verify→improve→re-verify 閉ループ 実装ガイド

## Part 1: 概念説明

### なぜ必要か

AIがスキル（自動化レシピ）を作成した後、そのスキルに不備がないかチェックする仕組みが既にあります。しかし、不備が見つかるたびに人間が手動で修正するのは非効率です。この閉ループは、チェック→自動修正→再チェックのサイクルを人手なしで回し、スキルの品質を自動的に引き上げる仕組みです。

### 何をするか

1. **検証（verify）**: スキルに問題がないかチェックする
2. **改善（improve）**: 問題が見つかったら、AIが自動で修正案を作って適用する
3. **再検証（re-verify）**: 修正後にもう一度チェックする
4. 全問題が解消されるか、決められた回数（デフォルト3回）に達するまで2→3を繰り返す

### たとえば

たとえば、テストの答え合わせをして、間違えた問題を復習して解き直し、もう一度答え合わせをする、という勉強法を想像してください。全問正解になるか、「最大3回まで」と決めた回数に達したら終了。この「答え合わせ→復習→再チャレンジ」のサイクルを、プログラムが自動で行うのがこの閉ループです。

### 今回作ったもの

- `recordVerifyPass()` — 全チェック合格を記録するメソッド
- `recordImproveAttempt()` — 改善試行を記録し、試行回数を管理するメソッド
- `getImproveAttemptCount()` — 現在の改善試行回数を取得するメソッド
- `verifyAndImproveLoop()` — 上記を組み合わせた閉ループパイプライン
- `verifyAndImproveLoop()` の feedback memory — 前回の改善要約を次回 feedback に織り込む補助
- `formatVerifyChecksAsFeedback()` — チェック結果をAIへのフィードバック文字列に変換するユーティリティ

---

## Part 2: 技術詳細

### 型定義

#### SkillCreatorVerifyResult 拡張フィールド

```typescript
interface SkillCreatorVerifyResult {
  // 既存フィールド...
  /** 現在の improve 試行回数（閉ループ内でのカウント、0開始） */
  improveAttemptCount?: number;
  /** 最大 improve 試行回数 */
  maxImproveRetry?: number;
  /** maxRetry 到達によりループが停止したか */
  loopExhausted?: boolean;
  /** 失敗した verify チェックの要約 */
  failedChecksSummary?: string;
}
```

#### RuntimeSkillCreatorVerifyAndImproveResult

```typescript
interface RuntimeSkillCreatorVerifyAndImproveResult {
  /** 最終的な verify 結果 */
  finalStatus: "pass" | "fail" | "error";
  /** 実行した improve の回数 */
  totalAttempts: number;
  /** 最終的な verify チェック結果 */
  finalChecks: RuntimeSkillCreatorVerifyCheck[];
  /** ループが maxRetry で停止したか */
  loopExhausted: boolean;
  /** エラーが発生した場合のメッセージ */
  errorMessage?: string;
  /** ワークフロー状態スナップショット */
  workflowSnapshot: SkillCreatorWorkflowUiSnapshot;
}
```

#### RuntimeSkillCreatorFacadeDeps 拡張

```typescript
interface RuntimeSkillCreatorFacadeDeps {
  // 既存フィールド...
  /** verify→improve→re-verify ループの最大試行回数（デフォルト: 3） */
  maxImproveRetry?: number;
}
```

### API シグネチャ

| メソッド                       | シグネチャ                                                         | 戻り値                                               |
| ------------------------------ | ------------------------------------------------------------------ | ---------------------------------------------------- |
| `recordVerifyPass`             | `(planId: string, checks: RuntimeSkillCreatorVerifyCheck[])`       | `SkillCreatorWorkflowStateSnapshot`                  |
| `recordImproveAttempt`         | `(planId: string, failedChecks: RuntimeSkillCreatorVerifyCheck[])` | `SkillCreatorWorkflowStateSnapshot`                  |
| `getImproveAttemptCount`       | `(planId: string)`                                                 | `number`                                             |
| `verifyAndImproveLoop`         | `(planId, skillDir, skillName, authMode, apiKey?)`                 | `Promise<RuntimeSkillCreatorVerifyAndImproveResult>` |
| `formatVerifyChecksAsFeedback` | `(checks: RuntimeSkillCreatorVerifyCheck[])`                       | `string`                                             |

### 使用例

```typescript
const result = await facade.verifyAndImproveLoop(
  planId,
  skillDir,
  skillName,
  authMode,
);

if (result.finalStatus === "pass") {
  // 全チェック PASS
} else if (result.loopExhausted) {
  // maxRetry 到達 — ユーザー判断を要求
} else {
  // エラー
  console.error(result.errorMessage);
}
```

### エラーハンドリング

| エラー種別               | finalStatus | 動作                                                  |
| ------------------------ | ----------- | ----------------------------------------------------- |
| verify 実行エラー        | `"error"`   | ループ即停止                                          |
| LLM improve 呼び出し失敗 | `"error"`   | ループ停止、errorMessage に記録                       |
| apply 失敗（applied: 0） | `"fail"`    | ループ停止、"review" に遷移                           |
| improve 結果が空         | `"fail"`    | ループ停止、「改善提案なし」                          |
| verificationEngine 未DI  | N/A         | console.warn 出力、全PASS扱い（graceful degradation） |

### エッジケース

- `maxImproveRetry` の範囲外値: 1未満は1にクランプ、10超は10にクランプ
- 同一修正の繰り返し（MR-01）: 将来の改善候補として記録済み
- `verifyAndImproveLoop()` は直前の改善要約を次回 feedback に追記し、同一修正の反復を抑制する

### 設定項目

| パラメータ        | 型       | デフォルト | 範囲 | 説明                                |
| ----------------- | -------- | ---------- | ---- | ----------------------------------- |
| `maxImproveRetry` | `number` | 3          | 1-10 | verify→improve ループの最大試行回数 |

### テスト構成

| テストファイル                           | 対象                                                             | テスト数 |
| ---------------------------------------- | ---------------------------------------------------------------- | -------- |
| `formatVerifyChecksAsFeedback.test.ts`   | フィードバック変換                                               | 9件      |
| `SkillCreatorWorkflowEngine.test.ts`     | recordVerifyPass / recordImproveAttempt / getImproveAttemptCount | 41件     |
| `RuntimeSkillCreatorFacade.test.ts`      | verifyAndImproveLoop                                             | 37件     |
| `SkillCreatorVerificationEngine.test.ts` | リグレッション確認                                               | 25件     |
