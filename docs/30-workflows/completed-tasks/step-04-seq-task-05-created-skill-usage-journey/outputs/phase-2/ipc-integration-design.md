# IPC連携設計

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-05                  |
| Phase      | 2                                        |
| Phase名    | 設計                                     |
| 成果物種別 | IPC連携設計                              |
| 作成日     | 2026-03-15                               |
| 前提       | phase-1-requirements.md                  |
| 準拠ルール | P42, P44, P45, ipc-contract-checklist.md |

## 目的

作成済みスキルの利用導線に必要な IPC 連携を設計する。新規チャネルを最小化し、既存チャネルの再利用を基本方針とする。

---

## 1. IPC 基本方針

| 方針         | 内容                                                                                         |
| ------------ | -------------------------------------------------------------------------------------------- |
| 新規最小化   | 新規 IPC チャネルは追加しない。既存チャネルの再利用で全要件をカバーする                      |
| ローカル優先 | お気に入り・最近使った記録はユーザーローカルの設定であり、Zustand persist で管理。IPC 不要   |
| 型契約厳守   | 既存チャネルの引数型・戻り値型を変更しない。型契約は `packages/shared/src/types/` で一元管理 |
| P42 準拠     | 全 IPC 引数に3段バリデーション（型チェック → 空文字列 → トリム空文字列）を適用               |

---

## 2. IPC チャネル一覧

### 利用するチャネル（全て既存）

| チャネル名                | 新規/既存 | 用途                                | 引数型                         | 戻り値型           |
| ------------------------- | --------- | ----------------------------------- | ------------------------------ | ------------------ |
| `skill:optimize:evaluate` | 既存      | EP-3 利用前評価 / EP-4 利用後再評価 | `SkillOptimizeEvaluateRequest` | `PromptEvaluation` |
| `skill:list`              | 既存      | スキル一覧取得                      | なし                           | `ImportedSkill[]`  |

### 新規チャネル不要の根拠

| 機能                    | IPC 不要の理由                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| お気に入り管理          | ユーザーローカルの UI 設定であり、サーバー同期は不要。Zustand persist（localStorage）で管理 |
| 最近使った記録          | Renderer Store 内で管理。Agent 実行完了時に `addRecentlyUsed(skillName)` を呼ぶのみ         |
| 実行結果保持            | セッション限定データ。agentSlice の `lastExecutionResult` で管理                            |
| 再評価スコア保持        | セッション限定データ。agentSlice の `postExecutionScore` で管理                             |
| `skill:favorite:toggle` | Phase 1 で検討したが、ローカルストレージ管理に決定したため不要                              |

---

## 3. EP-3 利用前評価の IPC 呼び出しフロー

### シーケンス図

```
[Workspace スキル選択ドロップダウン]
    |
    | (1) ユーザーがスキルを選択
    v
[Renderer: WorkspaceSkillSelector]
    |
    | (2) skill:optimize:evaluate を呼び出し
    |     引数: { prompt: selectedSkill.promptContent }
    v
[Preload: safeInvoke(IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE, request)]
    |
    v
[Main: skill:optimize:evaluate ハンドラ]
    |
    | (3) P42準拠 3段バリデーション
    |     - typeof request?.prompt === "string"
    |     - request.prompt !== ""
    |     - request.prompt.trim() !== ""
    |
    | (4) PromptEvaluator.evaluate(prompt) 実行
    v
[戻り値: PromptEvaluation { score, breakdown?, feedback[] }]
    |
    v
[Renderer: WorkspaceSkillSelector]
    |
    | (5) getScoreGateResult(evaluation.score) でゲート判定
    v
[ScoringGateBanner 表示]
    |
    +--- USE_ALLOWED / RECOMMENDED → 情報バナー（緑系）「利用可能です」
    +--- SAVE_ALLOWED → 警告バナー（オレンジ系）「改善を推奨します」
    +--- NEEDS_IMPROVEMENT → 注意バナー（赤系）「改善が必要です」
    |
    v
[実行はブロックしない — バナー表示のみ]
```

### 重要設計判断: EP-3 はブロックしない

EP-3（利用前評価）のバナーは情報提供のみであり、スキルの実行をブロックしない。理由:

1. ユーザーの意思決定を尊重する（利用可否はユーザーが判断）
2. 評価スコアはあくまで参考値であり、実用性を保証するものではない
3. `NEEDS_IMPROVEMENT` でも特定コンテキストでは有用な場合がある

---

## 4. EP-4 利用後再評価の IPC 呼び出しフロー

### シーケンス図

```
[Agent 実行完了]
    |
    | (1) ExecutionResultSummary を agentSlice に保存
    |     setLastExecutionResult(result)
    |     addRecentlyUsed(skillName)
    v
[PostExecutionActionBar]
    |
    | (2) ユーザーが「再評価する」ボタンを押下（任意操作）
    v
[Renderer: PostExecutionScorePanel]
    |
    | (3) skill:optimize:evaluate を呼び出し
    |     引数: { prompt: skill.promptContent }
    v
[Preload: safeInvoke(IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE, request)]
    |
    v
[Main: skill:optimize:evaluate ハンドラ]
    |
    | (4) P42準拠 3段バリデーション（EP-3 と同一ロジック）
    |
    | (5) PromptEvaluator.evaluate(prompt) 実行
    v
[戻り値: PromptEvaluation { score, breakdown?, feedback[] }]
    |
    v
[Renderer: PostExecutionScorePanel]
    |
    | (6) getScoreGateResult(evaluation.score) でゲート判定
    | (7) calculateScoreDelta(previousScore, evaluation.score) でデルタ算出
    | (8) setPostExecutionScore(gateResult) で Store 更新
    v
[ScoreDelta 表示]
    |
    +--- delta >= +3  → 緑 / 上矢印 / 「スコアが向上しました」
    +--- -2 <= delta <= +2 → グレー / 変化なし / 「スコアに大きな変化はありません」
    +--- delta <= -3  → 赤 / 下矢印 / 「スコアが低下しました」
    |
    v
[改善導線 CTA]
    |
    +--- 「改善する」→ SkillAnalysisView（Task03 改善フロー）
    +--- 「このまま使う」→ 閉じる
```

### EP-4 の任意性

EP-4（利用後再評価）はユーザーの任意操作である。Agent 実行完了後に自動的に再評価を実行しない。理由:

1. 再評価には API コストが発生する
2. ユーザーが結果に満足している場合、再評価は不要
3. 改善の意思がある場合にのみ再評価を実行する方が合理的

---

## 5. 型契約テーブル

### skill:optimize:evaluate

| 項目        | 型                                                   | 定義場所                                      |
| ----------- | ---------------------------------------------------- | --------------------------------------------- |
| 引数型      | `SkillOptimizeEvaluateRequest`                       | `packages/shared/src/types/skill-improver.ts` |
| 戻り値型    | `PromptEvaluation`                                   | `packages/shared/src/types/skill-improver.ts` |
| Preload API | `window.electronAPI.skill.optimizeEvaluate(request)` | `apps/desktop/src/preload/types.ts`           |

```typescript
// 引数型（既存）
export interface SkillOptimizeEvaluateRequest {
  prompt: string;
}

// 戻り値型（既存）
export interface PromptEvaluation {
  score: number;
  breakdown?: EvaluationBreakdown;
  feedback: string[];
}
```

### skill:list

| 項目        | 型                                | 定義場所                            |
| ----------- | --------------------------------- | ----------------------------------- |
| 引数型      | なし                              | -                                   |
| 戻り値型    | `ImportedSkill[]`                 | `apps/desktop/src/preload/types.ts` |
| Preload API | `window.electronAPI.skill.list()` | `apps/desktop/src/preload/types.ts` |

---

## 6. P42 準拠: 3段バリデーション

### skill:optimize:evaluate ハンドラのバリデーション

```typescript
ipcMain.handle(
  IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE,
  async (_event, request: unknown) => {
    // P42: 3段バリデーション
    // 段1: 型チェック
    if (
      request == null ||
      typeof request !== "object" ||
      !("prompt" in request) ||
      typeof (request as Record<string, unknown>).prompt !== "string"
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "prompt must be a string",
      };
    }

    const prompt = (request as { prompt: string }).prompt;

    // 段2: 空文字列チェック
    if (prompt === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "prompt must not be empty",
      };
    }

    // 段3: トリム空文字列チェック
    if (prompt.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "prompt must not be whitespace only",
      };
    }

    return promptEvaluator.evaluate(prompt);
  },
);
```

---

## 7. P44/P45 準拠: 引数名とセマンティクスの一致確認

| チャネル名                | 引数名   | 実際に渡す値           | セマンティクス一致 | 備考                       |
| ------------------------- | -------- | ---------------------- | ------------------ | -------------------------- |
| `skill:optimize:evaluate` | `prompt` | スキルのプロンプト本文 | 一致               | 既存チャネルのため変更なし |
| `skill:list`              | なし     | -                      | -                  | 引数なし                   |

> P44/P45 チェック結果: 利用する既存チャネルは全て引数名とセマンティクスが一致している。新規チャネルは追加しないため、P44/P45 違反のリスクは発生しない。

---

## 8. Renderer 側の呼び出しパターン

### EP-3 利用前評価（Workspace スキル選択時）

```typescript
// WorkspaceSkillSelector.tsx
import { getScoreGateResult } from "@repo/shared/types/skill-improver";

const handleSkillSelect = useCallback(async (skillName: string) => {
  // スキル選択時にバックグラウンドで評価を実行
  try {
    const evaluation = await window.electronAPI.skill.optimizeEvaluate({
      prompt: selectedSkill.promptContent,
    });
    const gateResult = getScoreGateResult(evaluation.score);
    setPreEvaluationResult(gateResult);
  } catch {
    // 評価失敗時はバナーを非表示（ブロックしない）
    setPreEvaluationResult(null);
  }
}, []);
```

### EP-4 利用後再評価（Agent 実行後、ユーザー任意）

```typescript
// PostExecutionScorePanel.tsx
import {
  getScoreGateResult,
  calculateScoreDelta,
} from "@repo/shared/types/skill-improver";

const handleReEvaluate = useCallback(async () => {
  setIsEvaluating(true);
  try {
    const evaluation = await window.electronAPI.skill.optimizeEvaluate({
      prompt: skill.promptContent,
    });
    const gateResult = getScoreGateResult(evaluation.score);
    const delta = calculateScoreDelta(previousScore, evaluation.score);

    setPostExecutionScore(gateResult);
    setScoreDelta(delta);
  } catch {
    // 再評価失敗時はエラーメッセージを表示
    setEvaluationError("再評価に失敗しました。もう一度お試しください。");
  } finally {
    setIsEvaluating(false);
  }
}, [skill.promptContent, previousScore, setPostExecutionScore]);
```

---

## 9. エラーハンドリング

| エラーケース                       | エラーコード     | Renderer 側の対応                             |
| ---------------------------------- | ---------------- | --------------------------------------------- |
| prompt が文字列でない              | VALIDATION_ERROR | 表示しない（開発時のみログ出力）              |
| prompt が空文字列                  | VALIDATION_ERROR | 表示しない（開発時のみログ出力）              |
| prompt がスペースのみ              | VALIDATION_ERROR | 表示しない（開発時のみログ出力）              |
| LLM API 呼び出し失敗               | EXTERNAL_SERVICE | 「評価に失敗しました」トースト表示            |
| PromptEvaluator 内部エラー         | INTERNAL_ERROR   | 「評価に失敗しました」トースト表示            |
| タイムアウト（safeInvoke 5秒制限） | TIMEOUT          | EP-3: バナー非表示 / EP-4: リトライボタン表示 |

---

## 10. データフロー概要図

```
                           既存IPC
                    +-----------------------+
                    |                       |
[Skill Center]      |  skill:list           |
  skill:list -------+-----> Main Process    |
  <-- ImportedSkill[]      (SkillService)   |
                    |                       |
[Workspace]         | skill:optimize:       |
  EP-3 評価 --------+  evaluate             |
  <-- PromptEvaluation    (PromptEvaluator) |
                    |                       |
[Agent 実行後]      | skill:optimize:       |
  EP-4 再評価 ------+  evaluate             |
  <-- PromptEvaluation    (PromptEvaluator) |
                    |                       |
                    +-----------------------+

                    ローカル管理（IPC不要）
                    +-----------------------+
                    |                       |
[お気に入り]        | Zustand persist       |
  toggleFavorite ---+-> localStorage        |
                    |                       |
[最近使った]        | Zustand persist       |
  addRecentlyUsed --+-> localStorage        |
                    |                       |
[実行結果]          | agentSlice            |
  setLastResult ----+-> メモリ（非永続）    |
                    |                       |
[再評価スコア]      | agentSlice            |
  setPostScore -----+-> メモリ（非永続）    |
                    |                       |
                    +-----------------------+
```
