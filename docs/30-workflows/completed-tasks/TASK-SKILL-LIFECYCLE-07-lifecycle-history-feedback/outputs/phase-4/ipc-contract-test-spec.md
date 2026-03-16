# IPC契約テスト仕様書

## メタ情報

| 項目       | 内容                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 4                                                                                                                                              |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                                                        |
| 作成日     | 2026-03-16                                                                                                                                     |
| ステータス | TDD Red フェーズ（全テストケースは実装前に作成され、実行時点では全て失敗する）                                                                 |
| 入力成果物 | `outputs/phase-2/data-flow-design.md`, `outputs/phase-2/publish-metrics-interface-design.md`                                                   |
| 出力パス   | `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-4/ipc-contract-test-spec.md` |

> **Red フェーズの明示**
> 本仕様書に記載する全テストケースは、Phase 5 実装開始前の時点では **全て失敗する（Red 状態）** ことを意図して設計されている。IPC チャンネル定数・ハンドラ・Preload bridge のいずれも存在しない状態でテストを実行すると `ReferenceError` または `TypeError` が発生することが期待される。

---

## 1. テスト対象ファイルと配置

| テストファイル                                                           | テスト対象                                             |
| ------------------------------------------------------------------------ | ------------------------------------------------------ |
| `packages/shared/src/__tests__/ipc-channels.test.ts`                     | `IPC_CHANNELS` 定数定義の完全性                        |
| `apps/desktop/src/main/handlers/__tests__/lifecycle-ipc-handler.test.ts` | lifecycle 系 IPC ハンドラ                              |
| `apps/desktop/src/main/handlers/__tests__/feedback-ipc-handler.test.ts`  | feedback 系 IPC ハンドラ                               |
| `apps/desktop/src/main/handlers/__tests__/metrics-ipc-handler.test.ts`   | metrics 系 IPC ハンドラ（Task08 インターフェース含む） |
| `apps/desktop/src/preload/__tests__/skill-lifecycle-preload.test.ts`     | Preload bridge の引数渡し・P42バリデーション           |

---

## 2. チャンネル定義テスト

### 2-1. IPC_CHANNELS 定数の完全性

| テストID   | テスト名                                                   | 検証方法                                                                              | 期待値                                                        | 分類 |
| ---------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---- |
| IPC-CH-001 | `SKILL_GET_LIFECYCLE_EVENTS` チャンネルが登録されている    | `IPC_CHANNELS.SKILL_GET_LIFECYCLE_EVENTS` にアクセス                                  | `"skill:getLifecycleEvents"` を返す                           | 正常 |
| IPC-CH-002 | `SKILL_RECORD_LIFECYCLE_EVENT` チャンネルが登録されている  | `IPC_CHANNELS.SKILL_RECORD_LIFECYCLE_EVENT` にアクセス                                | 文字列値を返す（ハードコードなし）                            | 正常 |
| IPC-CH-003 | `SKILL_GET_AGGREGATE_VIEW` チャンネルが登録されている      | `IPC_CHANNELS.SKILL_GET_AGGREGATE_VIEW` にアクセス                                    | 文字列値を返す                                                | 正常 |
| IPC-CH-004 | `SKILL_FEEDBACK_SUBMIT` チャンネルが登録されている         | `IPC_CHANNELS.SKILL_FEEDBACK_SUBMIT` にアクセス                                       | `"skill:feedback:submit"` または同等の値を返す                | 正常 |
| IPC-CH-005 | `SKILL_FEEDBACK_UPDATE_STATUS` チャンネルが登録されている  | `IPC_CHANNELS.SKILL_FEEDBACK_UPDATE_STATUS` にアクセス                                | 文字列値を返す                                                | 正常 |
| IPC-CH-006 | `SKILL_GET_PUBLISH_READINESS` チャンネルが登録されている   | `IPC_CHANNELS.SKILL_GET_PUBLISH_READINESS` にアクセス                                 | `"skill:getPublishReadiness"` を返す                          | 正常 |
| IPC-CH-007 | `SKILL_GET_SKILL_HEALTH_REPORT` チャンネルが登録されている | `IPC_CHANNELS.SKILL_GET_SKILL_HEALTH_REPORT` にアクセス                               | `"skill:getSkillHealthReport"` を返す                         | 正常 |
| IPC-CH-008 | `SKILL_LIFECYCLE_EVENT_EMITTED` チャンネルが登録されている | `IPC_CHANNELS.SKILL_LIFECYCLE_EVENT_EMITTED` にアクセス                               | `"skill:lifecycle_event_emitted"` を返す                      | 正常 |
| IPC-CH-009 | ハードコード文字列がソースコードに存在しない               | `grep -rn '"skill:' apps/desktop/src/main/handlers/` で文字列リテラルを検索           | `IPC_CHANNELS` 定数参照のみが存在し、直接文字列リテラルがない | 正常 |
| IPC-CH-010 | `IPC_CHANNELS` オブジェクトが `as const` で凍結されている  | `IPC_CHANNELS` の型が `Record<string, string>` でなく各値が `string` literal 型である | TypeScript コンパイルで各値の型が literal 型                  | 正常 |

---

## 3. 引数バリデーションテスト（P42準拠3段バリデーション）

### 3-1. lifecycle:getEvents ハンドラ

| テストID   | テスト名                                      | 入力                                      | 期待値                                                                                            | 分類 |
| ---------- | --------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- | ---- |
| IPC-LF-001 | 有効な skillName で正常レスポンスを返す       | `"code-review"`                           | `{ success: true, data: { events: [...], total: number } }`                                       | 正常 |
| IPC-LF-002 | skillName が string 以外（Stage 1）を拒否する | `123`（number 型）                        | `{ success: false, error: { code: "VALIDATION_ERROR", message: "skillName must be a string" } }`  | 異常 |
| IPC-LF-003 | skillName が空文字列（Stage 2）を拒否する     | `""`                                      | `{ success: false, error: { code: "VALIDATION_ERROR", message: "skillName must not be empty" } }` | 異常 |
| IPC-LF-004 | skillName がスペースのみ（Stage 3）を拒否する | `"   "`                                   | `{ success: false, error: { code: "VALIDATION_ERROR", message: "skillName must not be blank" } }` | 異常 |
| IPC-LF-005 | skillName の前後スペースをトリムして処理する  | `"  code-review  "`                       | `"code-review"` として処理され正常レスポンス                                                      | 正常 |
| IPC-LF-006 | limit が正の整数であれば受け入れる            | `{ skillName: "code-review", limit: 10 }` | 正常レスポンス（最大 10 件）                                                                      | 正常 |
| IPC-LF-007 | limit が 0 以下の場合はデフォルト値を使用する | `{ skillName: "code-review", limit: 0 }`  | デフォルト件数で正常レスポンス                                                                    | 境界 |

### 3-2. feedback:submit ハンドラ

| テストID   | テスト名                                          | 入力                                                                              | 期待値                                                    | 分類 |
| ---------- | ------------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- | ---- |
| IPC-FB-001 | 有効な user_rating フィードバックを受け入れる     | `{ skillName: "code-review", feedbackType: "user_rating", value: 4 }`             | `{ success: true, data: { feedbackId: "<uuid>" } }`       | 正常 |
| IPC-FB-002 | skillName がスペースのみで拒否する（P42 Stage 3） | `{ skillName: "   ", feedbackType: "user_rating", value: 4 }`                     | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | 異常 |
| IPC-FB-003 | feedbackType が許可値外で拒否する                 | `{ skillName: "code-review", feedbackType: "unknown_type", value: 4 }`            | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | 異常 |
| IPC-FB-004 | user_rating の value が 1-5 範囲外で拒否する      | `{ skillName: "code-review", feedbackType: "user_rating", value: 6 }`             | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | 異常 |
| IPC-FB-005 | user_text の value が 500 文字超で拒否する        | `{ skillName: "code-review", feedbackType: "user_text", value: "a".repeat(501) }` | `{ success: false, error: { code: "VALIDATION_ERROR" } }` | 異常 |

### 3-3. feedback:updateStatus ハンドラ

| テストID   | テスト名                                                            | 入力                                                     | 期待値                                                                              | 分類 |
| ---------- | ------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---- |
| IPC-FS-001 | 有効な feedbackId と status で正常処理する                          | `{ feedbackId: "<uuid>", status: "applied" }`            | `{ success: true }`                                                                 | 正常 |
| IPC-FS-002 | feedbackId がスペースのみで拒否する（P42 Stage 3）                  | `{ feedbackId: "   ", status: "applied" }`               | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                           | 異常 |
| IPC-FS-003 | status が "pending" で拒否する（終端状態への遷移以外は不可）        | `{ feedbackId: "<uuid>", status: "pending" }`            | `{ success: false, error: { code: "VALIDATION_ERROR" } }`                           | 異常 |
| IPC-FS-004 | 存在しない feedbackId で NOT_FOUND エラーを返す                     | `{ feedbackId: "non-existent-uuid", status: "applied" }` | `{ success: false, error: { code: "NOT_FOUND" } }`                                  | 異常 |
| IPC-FS-005 | applied 状態のフィードバックを dismissed に変更しようとして拒否する | 既に applied のフィードバックに対して dismissed を送信   | `{ success: false, error: { code: "INVALID_STATUS_TRANSITION", errorCode: 2001 } }` | 異常 |

---

## 4. レスポンス型テスト

### 4-1. 成功レスポンスの形式

| テストID   | テスト名                                                                   | 検証対象                             | 期待値                                                                                   | 分類 |
| ---------- | -------------------------------------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------------------------------- | ---- |
| IPC-RS-001 | 成功レスポンスが `{ success: true, data: T }` 形式である                   | lifecycle:getEvents の成功レスポンス | `response.success === true`, `"data" in response`                                        | 正常 |
| IPC-RS-002 | 失敗レスポンスが `{ success: false, error: { code, message } }` 形式である | バリデーションエラーレスポンス       | `response.success === false`, `response.error.code`, `response.error.message` が存在する | 正常 |
| IPC-RS-003 | エラーコードが文字列型である                                               | 全エラーレスポンス                   | `typeof response.error.code === "string"`                                                | 正常 |
| IPC-RS-004 | エラーメッセージが文字列型である                                           | 全エラーレスポンス                   | `typeof response.error.message === "string"`                                             | 正常 |
| IPC-RS-005 | 内部エラー情報（スタックトレース・パス等）が含まれない                     | エラーレスポンスのサニタイズ検証     | `response.error.message` に絶対パス・スタックトレースが含まれない                        | 正常 |

---

## 5. Task08 メトリクス API テスト

### 5-1. `skill:getPublishReadiness`

| テストID   | テスト名                                                                 | 入力                                              | 期待値                                                                                                                                                               | 分類 |
| ---------- | ------------------------------------------------------------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- |
| IPC-PR-001 | 有効な skillName で PublishReadinessMetrics を返す                       | `"code-review"`（評価・実行履歴が存在するスキル） | `{ success: true, data: { skillId, skillName, qualityScore, stabilityScore, stabilityWindowSize, usageCount, hasCriticalFeedback, lastEvaluatedAt, calculatedAt } }` | 正常 |
| IPC-PR-002 | qualityScore が 0〜100 の範囲に収まる                                    | 正常なスキル                                      | `data.qualityScore === null \|\| (data.qualityScore >= 0 && data.qualityScore <= 100)`                                                                               | 正常 |
| IPC-PR-003 | stabilityScore が 0.0〜1.0 の範囲に収まる                                | 正常なスキル                                      | `data.stabilityScore === null \|\| (data.stabilityScore >= 0 && data.stabilityScore <= 1.0)`                                                                         | 正常 |
| IPC-PR-004 | 評価履歴がない場合 qualityScore が null を返す                           | 評価イベントが0件のスキル                         | `data.qualityScore === null`                                                                                                                                         | 境界 |
| IPC-PR-005 | 実行履歴がない場合 stabilityScore が null を返す                         | 実行イベントが0件のスキル                         | `data.stabilityScore === null`                                                                                                                                       | 境界 |
| IPC-PR-006 | hasCriticalFeedback が boolean 型である                                  | critical フィードバックが存在するスキル           | `typeof data.hasCriticalFeedback === "boolean"`                                                                                                                      | 正常 |
| IPC-PR-007 | critical フィードバックが存在する場合 hasCriticalFeedback が true になる | severity: "critical" の FeedbackAction が存在     | `data.hasCriticalFeedback === true`                                                                                                                                  | 正常 |
| IPC-PR-008 | 存在しない skillName で NOT_FOUND エラーを返す                           | `"non-existent-skill"`                            | `{ success: false, error: { code: "NOT_FOUND", message: "Skill not found" } }`                                                                                       | 異常 |
| IPC-PR-009 | skillName がスペースのみで VALIDATION_ERROR を返す（P42 Stage 3）        | `"   "`                                           | `{ success: false, error: { code: "VALIDATION_ERROR", message: "skillName must not be blank" } }`                                                                    | 異常 |

### 5-2. readinessLevel 判定（`calculatePublishReadiness`）

> この関数は Task08 の実装対象。Phase 4 では Task07 が提供するデータ形式が Task08 の判定に使えることを検証する。

| テストID   | テスト名                                                                 | 入力 `PublishReadinessMetrics`                                                            | 期待 `ReadinessResult.level`                             | 分類 |
| ---------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------- | ---- |
| IPC-RL-001 | 全条件クリアで "ready" を返す                                            | `{ qualityScore: 80, stabilityScore: 0.9, usageCount: 10, hasCriticalFeedback: false }`   | `"ready"`                                                | 正常 |
| IPC-RL-002 | hasCriticalFeedback が true で "not_ready" を返す                        | `{ qualityScore: 90, stabilityScore: 0.95, usageCount: 20, hasCriticalFeedback: true }`   | `"not_ready"`, `reason: "CRITICAL_FEEDBACK_EXISTS"`      | 正常 |
| IPC-RL-003 | usageCount が threshold 未満で "not_ready" を返す                        | `{ qualityScore: 80, stabilityScore: 0.9, usageCount: 4, hasCriticalFeedback: false }`    | `"not_ready"`, `reason: "INSUFFICIENT_USAGE"`            | 境界 |
| IPC-RL-004 | qualityScore が threshold 未満で "not_ready" を返す                      | `{ qualityScore: 69, stabilityScore: 0.9, usageCount: 10, hasCriticalFeedback: false }`   | `"not_ready"`, `reason: "QUALITY_SCORE_BELOW_THRESHOLD"` | 境界 |
| IPC-RL-005 | stabilityScore が threshold 未満で "review_needed" を返す                | `{ qualityScore: 80, stabilityScore: 0.79, usageCount: 10, hasCriticalFeedback: false }`  | `"review_needed"`, `reason: "STABILITY_BELOW_THRESHOLD"` | 境界 |
| IPC-RL-006 | qualityScore が null で "not_ready" を返す（null は 0 として扱う）       | `{ qualityScore: null, stabilityScore: 0.9, usageCount: 10, hasCriticalFeedback: false }` | `"not_ready"`, `reason: "QUALITY_SCORE_BELOW_THRESHOLD"` | 境界 |
| IPC-RL-007 | stabilityScore が null で "review_needed" を返す（null は 0 として扱う） | `{ qualityScore: 80, stabilityScore: null, usageCount: 10, hasCriticalFeedback: false }`  | `"review_needed"`, `reason: "STABILITY_BELOW_THRESHOLD"` | 境界 |

### 5-3. `skill:getSkillHealthReport`

| テストID   | テスト名                                                         | 入力                     | 期待値                                                                                                                    | 分類 |
| ---------- | ---------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ---- |
| IPC-HR-001 | 有効な skillName で SkillHealthReport を返す                     | `"code-review"`          | `{ skillId, skillName, publishReadiness, recentExecutionSummary, scoreHistory, feedbackSummary, generatedAt }` が全て存在 | 正常 |
| IPC-HR-002 | recentExecutionSummary の数値フィールドが非負整数である          | 実行履歴があるスキル     | `totalExecutions >= 0`, `successCount >= 0`, `failureCount >= 0`, `timeoutCount >= 0`                                     | 正常 |
| IPC-HR-003 | scoreHistory が評価日時昇順で並ぶ                                | 複数評価履歴があるスキル | `scoreHistory[i].evaluatedAt <= scoreHistory[i+1].evaluatedAt`                                                            | 正常 |
| IPC-HR-004 | feedbackSummary.avgUserRating がレーティング未入力で null を返す | ユーザーレーティングなし | `feedbackSummary.avgUserRating === null`                                                                                  | 境界 |
| IPC-HR-005 | 存在しない skillName で NOT_FOUND エラーを返す                   | `"non-existent-skill"`   | `{ success: false, error: { code: "NOT_FOUND" } }`                                                                        | 異常 |

---

## 6. Preload bridge テスト（P45: IPC引数命名の契約ドリフト防止）

### 6-1. Preload 側の引数渡しとハンドラ側の受け取りの一致

| テストID   | テスト名                                                                       | 検証方法                                                                          | 期待値                                                                     | 分類 |
| ---------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---- |
| IPC-PL-001 | Preload の `getLifecycleEvents(skillName)` がハンドラに skillName 文字列を渡す | `safeInvoke(IPC_CHANNELS.SKILL_GET_LIFECYCLE_EVENTS, skillName)` の第2引数を検証  | ハンドラの第2引数が文字列型の `skillName` として受け取られる               | 正常 |
| IPC-PL-002 | Preload の `submitFeedback(payload)` がハンドラに正しい形式で渡す              | `safeInvoke(IPC_CHANNELS.SKILL_FEEDBACK_SUBMIT, payload)` の payload 構造を検証   | ハンドラの引数の `skillName`, `feedbackType`, `value` が正しく取得できる   | 正常 |
| IPC-PL-003 | Preload の `getPublishReadiness(skillName)` がハンドラに skillName を渡す      | `safeInvoke(IPC_CHANNELS.SKILL_GET_PUBLISH_READINESS, skillName)` の第2引数を検証 | ハンドラの第2引数が `skillName` として受け取られる（`skillId` ではない）   | 正常 |
| IPC-PL-004 | チャンネル名が文字列リテラルではなく定数で指定される                           | Preload ソースコードを `grep` で検索                                              | `safeInvoke("skill:..."` のような文字列リテラル形式が存在しない（P27対策） | 正常 |

---

## 7. テストケース件数サマリー

| カテゴリ                             | 件数   |
| ------------------------------------ | ------ |
| チャンネル定義テスト                 | 10     |
| lifecycle:getEvents バリデーション   | 7      |
| feedback:submit バリデーション       | 5      |
| feedback:updateStatus バリデーション | 5      |
| レスポンス型テスト                   | 5      |
| getPublishReadiness テスト           | 9      |
| readinessLevel 判定テスト            | 7      |
| getSkillHealthReport テスト          | 5      |
| Preload bridge テスト                | 4      |
| **合計**                             | **57** |

---

## 8. テスト実装ガイドライン

```typescript
// packages/shared/src/__tests__/ipc-channels.test.ts

import { describe, it, expect } from "vitest";
import { IPC_CHANNELS } from "../ipc/channels";

describe("IPC_CHANNELS 定数", () => {
  it("IPC-CH-001: SKILL_GET_LIFECYCLE_EVENTS が登録されている", () => {
    // Phase 5 実装前は TypeError が発生する（Red 状態）
    expect(IPC_CHANNELS.SKILL_GET_LIFECYCLE_EVENTS).toBe(
      "skill:getLifecycleEvents",
    );
  });

  it("IPC-CH-006: SKILL_GET_PUBLISH_READINESS が登録されている", () => {
    expect(IPC_CHANNELS.SKILL_GET_PUBLISH_READINESS).toBe(
      "skill:getPublishReadiness",
    );
  });
});
```

```typescript
// apps/desktop/src/main/handlers/__tests__/metrics-ipc-handler.test.ts

import { describe, it, expect, beforeEach, vi } from "vitest";
import { handleGetPublishReadiness } from "../lifecycle-ipc-handler";
import { createMockPublishReadinessMetrics } from "../../__test-utils__/factories";

describe("skill:getPublishReadiness ハンドラ", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("IPC-PR-009: skillName がスペースのみで VALIDATION_ERROR を返す（P42 Stage 3）", async () => {
    // Phase 5 実装前は ReferenceError が発生する（Red 状態）
    const result = await handleGetPublishReadiness(
      {} as Electron.IpcMainInvokeEvent,
      "   ",
    );
    expect(result.success).toBe(false);
    expect(result.error.code).toBe("VALIDATION_ERROR");
    expect(result.error.message).toContain("blank");
  });
});
```

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 4_
