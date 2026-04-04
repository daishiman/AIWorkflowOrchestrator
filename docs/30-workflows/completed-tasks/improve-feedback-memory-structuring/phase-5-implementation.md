# Phase 5: 実装

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| Phase    | 5                                        |
| タスクID | task-ut-p0-02-001-repeat-feedback-memory |
| 前Phase  | Phase 4: テスト作成                      |
| 次Phase  | Phase 6: テスト拡充                      |

---

## 目的

`ImproveFeedbackHistory` 型定義と `verifyAndImproveLoop()` 改修を実装し、Phase 4 のテストを Green にする。

---

## 実行タスク

### タスク1: 既存テスト回帰確認の先行実行（baseline 確認）

Phase 4 で追加したテストを除いた既存テストが PASS であることを確認する。

```bash
pnpm --filter @repo/desktop exec vitest run RuntimeSkillCreatorFacade.test.ts
```

既存テスト結果を baseline として記録し、Phase 5 実装後の回帰確認に使用する。

---

### タスク2: ImproveFeedbackHistory 型定義

**対象ファイル**: `packages/shared/src/types/skillCreator.ts`

1. Phase 2 タスク1 で設計した型定義を追加:

```typescript
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

2. export 確認: `skillCreator.ts` の既存 export パターンに従い、型が外部から import 可能であることを確認

```bash
pnpm --filter @repo/shared build
```

---

### タスク3: verifyAndImproveLoop() 改修

**対象ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

Phase 2 タスク2 の Before/After 設計に従い、以下を変更する:

#### 3.1 変数の置換

```typescript
// Before
let previousImproveSummary = "";

// After
const feedbackHistory: ImproveFeedbackHistory[] = [];
```

#### 3.2 buildImproveFeedback 呼び出しの変更

```typescript
// Before
const feedback = buildImproveFeedback(failedChecks, previousImproveSummary);

// After
const feedback = buildImproveFeedback(failedChecks, feedbackHistory);
```

#### 3.3 履歴蓄積の変更

```typescript
// Before
previousImproveSummary = summarizeImproveSuggestions(suggestions);

// After
feedbackHistory.push({
  attempt: attemptCount,
  failedChecks: failedChecks.map((c) => c.checkId ?? c.name),
  improveSummary: summarizeImproveSuggestions(suggestions),
});
```

#### 3.4 import 追加

```typescript
import type { ImproveFeedbackHistory } from "@repo/shared/types/skillCreator";
```

---

### タスク4: buildImproveFeedback() 更新

**対象ファイル**: `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`

Phase 2 タスク3 の設計に従い、以下を変更する:

#### 4.1 シグネチャ変更

```typescript
// Before
function buildImproveFeedback(
  checks: RuntimeSkillCreatorVerifyCheck[],
  previousImproveSummary: string,
): string;

// After
function buildImproveFeedback(
  checks: RuntimeSkillCreatorVerifyCheck[],
  history: ImproveFeedbackHistory[],
): string;
```

#### 4.2 実装変更

- `history.length === 0` での早期リターン（後方互換性維持）
- 全試行履歴を構造化フォーマットで出力
- 各試行に番号・失敗チェック・改善要約を含む
- 「同じアプローチは避け、異なる戦略を提案してください」の指示文を追加

---

### タスク5: MINOR 解決

#### TECH-M-01: checkId null 安全性

`failedChecks.map((c) => c.checkId ?? c.name)` の null 安全性を確認する:

- `checkId` が `undefined` の場合に `name` にフォールバックされることを確認
- `checkId` と `name` の両方が `undefined` のケースが型定義上存在するか確認
- 必要に応じてフォールバック値（例: `"unknown"`）を追加

#### TECH-M-02: プロンプト言語統一

`buildImproveFeedback` の出力テキストの言語を `improvePromptConstants.ts` と統一する:

- 既存の `improvePromptConstants.ts` のプロンプト言語（日本語/英語）を確認
- セクション名「過去の改善試行履歴」の言語を統一
- 指示文「同じアプローチは避け、異なる戦略を提案してください」の言語を統一

---

### タスク6: テスト Green 確認

Phase 4 で作成したテストが全て PASS であることを確認する:

```bash
pnpm --filter @repo/desktop exec vitest run RuntimeSkillCreatorFacade.test.ts
```

- TC-01〜TC-06 が全て PASS
- 既存テスト（L838-973）が引き続き PASS（回帰なし）

---

## 新規作成・修正ファイルパス一覧

| 操作 | ファイルパス                                                                         | 変更内容                                 |
| ---- | ------------------------------------------------------------------------------------ | ---------------------------------------- |
| 修正 | `packages/shared/src/types/skillCreator.ts`                                          | `ImproveFeedbackHistory` 型追加 + export |
| 修正 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | ループ内変数・buildImproveFeedback 変更  |
| 修正 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | Phase 4 で追加済みのテストケース         |

---

## 参照資料

| 参照資料                       | パス                                                                                                 | 内容                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 1 要件定義               | `phase-1-requirements.md`                                                                            | AC 定義、スコープ                          |
| Phase 2 設計                   | `phase-2-design.md`                                                                                  | 型設計、ループ変更設計、プロンプト設計     |
| Phase 3 設計レビュー           | `phase-3-design-review.md`                                                                           | MINOR 追跡テーブル（TECH-M-01, TECH-M-02） |
| Phase 4 テスト作成             | `phase-4-test-creation.md`                                                                           | テストケース設計書                         |
| RuntimeSkillCreatorFacade 仕様 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`          | Facade の責務・統合仕様                    |
| improvePromptConstants         | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`                                   | プロンプト言語参照（TECH-M-02）            |
| Governance Hooks Phase Policy  | `.claude/skills/aiworkflow-requirements/references/lessons-learned-governance-hooks-phase-policy.md` | improve = edit 可、new file 不可の権限設定 |

---

## 成果物

| 成果物       | パス                                      | 状態    |
| ------------ | ----------------------------------------- | ------- |
| Phase 5 実装 | `phase-5-implementation.md`（本ファイル） | pending |

---

## 完了条件

- [ ] タスク1: 既存テスト baseline を記録した
- [ ] タスク2: `ImproveFeedbackHistory` 型を `skillCreator.ts` に追加した
- [ ] タスク2: `pnpm --filter @repo/shared build` が PASS
- [ ] タスク3: `verifyAndImproveLoop()` の `previousImproveSummary` を `feedbackHistory: ImproveFeedbackHistory[]` に置換した
- [ ] タスク3: ループ内で `feedbackHistory.push()` により履歴蓄積する実装を追加した
- [ ] タスク3: `buildImproveFeedback` 呼び出しの引数を変更した
- [ ] タスク4: `buildImproveFeedback()` の第2引数を `string` → `ImproveFeedbackHistory[]` に変更した
- [ ] タスク4: `history.length === 0` での早期リターンを実装した（後方互換性）
- [ ] タスク5: TECH-M-01 `checkId ?? name` の null 安全性を確認・対応した
- [ ] タスク5: TECH-M-02 プロンプト言語を `improvePromptConstants.ts` と統一した
- [ ] タスク6: Phase 4 テスト（TC-01〜TC-06）が全て PASS
- [ ] タスク6: 既存テスト（L838-973）が引き続き PASS

---

## タスク100%実行確認【必須】

Phase 5 の全タスク（baseline 確認、型定義追加、verifyAndImproveLoop 改修、buildImproveFeedback 更新、MINOR 解決、テスト Green 確認）を100%実行し完遂すること。

---

## 次Phase

Phase 6: テスト拡充 — エッジケース・回帰テスト・fail path のテストを追加する。

**Phase 5 完了前に Phase 6 へ進まないこと。**
