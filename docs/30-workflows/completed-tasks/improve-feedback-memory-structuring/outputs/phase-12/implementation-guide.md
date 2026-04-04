# 実装ガイド: verify→improve ループの feedback memory 構造化改善

## Part 1: 概念説明（中学生レベル）

### まず、なぜ必要か

前回の失敗を覚えていないと、同じ間違いをくり返してしまいます。だから、前回のメモを残す仕組みが必要です。

### 何をするか

過去の失敗を 1 回分だけではなく、試行ごとの記録として全部残します。

### 料理のレシピを3回試す話

想像してください。あなたは新しい料理に挑戦しています。

- **1回目**: レシピ通りに作ったけど、塩が多すぎた → 「塩が多すぎた」とメモする
- **2回目**: メモを見て塩を減らしたけど、今度は火が強すぎた → 「塩多すぎ」「火が強すぎ」と2つメモ
- **3回目**: **2つのメモを全部見て**、塩を減らし火も弱くした → 成功！

もし、メモが「直前の1回分しか残らない」仕組みだったらどうでしょう？

- 3回目のとき、「火が強すぎた」というメモしか見えず、「塩が多すぎた」ことを忘れてしまいます
- また塩を多くしてしまうかもしれません

これが今回の改善です。**過去の全てのメモを残す仕組み**にしたことで、3回目には1回目と2回目の両方の失敗を見ながら、賢い判断ができるようになりました。

### プログラムでの例え

- **料理** = AIが作ったスキルファイル
- **レシピの試行** = verify（検証）→ improve（改善）のループ
- **メモ** = feedback memory（フィードバックメモリ）
- **改善前**: 直前1回分のメモだけ（`string` = ただの文字列）
- **改善後**: 全回分のメモ帳（`ImproveFeedbackHistory[]` = 構造化された配列）

---

## Part 2: 技術者レベル

### 1. ImproveFeedbackHistory 型定義

```typescript
// packages/shared/src/types/skillCreator.ts

/** verify→improve ループの 1 試行分の履歴 */
export interface ImproveFeedbackHistory {
  /** 試行番号（1始まり） */
  attempt: number;
  /** verify で失敗したチェック項目の ID リスト */
  failedChecks: string[];
  /** improve が生成した改善要約 */
  improveSummary: string;
}
```

**配置先**: `packages/shared/src/types/skillCreator.ts`（既存の `RuntimeSkillCreatorImproveSuggestion` の直前）

**export**: `packages/shared/src/types/index.ts` から re-export 済み

### 2. buildImproveFeedback API シグネチャ

```typescript
function buildImproveFeedback(
  checks: RuntimeSkillCreatorVerifyCheck[],
  history: ImproveFeedbackHistory[],
): string;
```

| 引数       | 型                                 | 説明                                 |
| ---------- | ---------------------------------- | ------------------------------------ |
| `checks`   | `RuntimeSkillCreatorVerifyCheck[]` | 現在の verify 失敗チェック           |
| `history`  | `ImproveFeedbackHistory[]`         | 過去の全試行履歴（空配列で初回）     |
| **戻り値** | `string`                           | LLM に渡す feedback プロンプト文字列 |

### 3. Before / After

#### Current Contract（Before）

```typescript
let previousImproveSummary = "";
// ...
const feedback = buildImproveFeedback(failedChecks, previousImproveSummary);
// ...
previousImproveSummary = summarizeImproveSuggestions(suggestions);
```

- 直前 1 回分の改善要約のみ保持
- 試行 3 は試行 1 の情報を参照不可

#### Target Delta（After）

```typescript
const feedbackHistory: ImproveFeedbackHistory[] = [];
// ...
const feedback = buildImproveFeedback(failedChecks, feedbackHistory);
// ...
feedbackHistory.push({
  attempt: attemptCount,
  failedChecks: failedChecks.map((c) => c.id),
  improveSummary: summarizeImproveSuggestions(suggestions),
});
```

- 全試行の履歴を `ImproveFeedbackHistory[]` 配列に蓄積
- 試行 N は試行 1〜N-1 の全情報を参照可能

### 4. 使用例

```typescript
// 3回目の improve 呼び出し時の feedback 出力例:

// ## 検証失敗項目
// 以下の検証チェックに失敗しました。修正してください:
// [ERROR] L3-AGENT: agents/ のフォーマット不正
//
// ## 過去の改善試行履歴（2回試行済み）
// 以下は過去に試みた改善とその結果です。同じアプローチは繰り返さず、異なる戦略を提案してください。
//
// **繰り返し失敗中のチェック**: L3-AGENT
// 上記は過去の全試行で解決できていません。根本的に異なるアプローチが必要です。
//
// ### 試行 1/3
// - 失敗チェック: L2-SECTION, L3-AGENT
// - 試みた改善: - SKILL.md: セクション追加 (改善パターン: Clarity)
//
// ### 試行 2/3
// - 失敗チェック: L3-AGENT
// - 試みた改善: - agents/: テーブルフォーマット修正 (改善パターン: Fix)
```

### 5. エラーハンドリング

| シナリオ                         | 挙動                                                                    |
| -------------------------------- | ----------------------------------------------------------------------- |
| `verifySkill` 例外               | `feedbackHistory` は破壊されず、エラーレスポンスを返却                  |
| `improve` 例外                   | `feedbackHistory` は蓄積前のため影響なし。エラーレスポンスを返却        |
| `suggestions` が空               | ループ停止（「改善提案なし」）。`feedbackHistory.push()` は実行されない |
| `applyImprovement.applied === 0` | ループ停止。`feedbackHistory.push()` は実行されない                     |

### 6. エッジケースと設定可能なパラメータ / 定数一覧

#### 設定可能なパラメータ

| パラメータ        | デフォルト値 | 説明                  |
| ----------------- | ------------ | --------------------- |
| `maxImproveRetry` | 3            | 最大 improve 試行回数 |

#### 定数一覧

| 定数                       | 用途                        |
| -------------------------- | --------------------------- |
| `DEGRADED_REASON_MESSAGES` | fail 時の固定メッセージ定義 |

| エッジケース               | 挙動                                                                              |
| -------------------------- | --------------------------------------------------------------------------------- |
| `maxImproveRetry=1`        | 初回 improve で `feedbackHistory` は空。履歴蓄積なしで loopExhausted              |
| `maxImproveRetry=0`        | improve 試行なしで即座に loopExhausted                                            |
| 全試行で同じチェックが失敗 | `persistentChecks` に含まれ、「根本的に異なるアプローチが必要」の警告が出力される |

### 7. 変更ファイル一覧

| ファイル                                                                             | 変更内容                                                     |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `packages/shared/src/types/skillCreator.ts`                                          | `ImproveFeedbackHistory` 型追加                              |
| `packages/shared/src/types/index.ts`                                                 | export 追加                                                  |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | `verifyAndImproveLoop` 改修 + `buildImproveFeedback` 更新    |
| `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | テスト 13 件追加（TC-01〜TC-06, EC-01〜EC-04, BF-01〜BF-04） |
