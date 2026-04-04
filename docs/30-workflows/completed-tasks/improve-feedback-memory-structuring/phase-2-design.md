# Phase 2: 設計

## メタ情報

| 項目     | 内容                                     |
| -------- | ---------------------------------------- |
| Phase    | 2                                        |
| タスクID | task-ut-p0-02-001-repeat-feedback-memory |
| 前Phase  | Phase 1: 要件定義                        |
| 次Phase  | Phase 3: 設計レビューゲート              |

---

## 目的

`ImproveFeedbackHistory` 型の設計、`verifyAndImproveLoop()` のループ変更設計、`buildImproveFeedback()` のプロンプト設計を行い、Phase 4 以降の実装に必要な全設計を確定する。

---

## 実行タスク

### タスク1: ImproveFeedbackHistory 型設計

#### 1.1 型定義

```typescript
// packages/shared/src/types/skillCreator.ts に追加

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

#### 1.2 DI 境界の型配置判断

| 条件                         | 判定                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------- |
| 使用箇所                     | `RuntimeSkillCreatorFacade.ts`（Main process のみ）                          |
| レイヤー境界をまたぐか       | No — Main process 内で完結                                                   |
| 複数の具象クラスで共有するか | No — `verifyAndImproveLoop()` 内のローカルスコープのみ                       |
| **判定結果**                 | `packages/shared/src/types/skillCreator.ts` に配置（既存の shared 型と同居） |

**理由**: `RuntimeSkillCreatorVerifyCheck` など関連型が既に `packages/shared/` に定義されており、同一ファイルに配置することで型の発見性と一貫性を保つ。将来 Renderer 側で履歴を表示する拡張時にも `shared` に置いてあれば追加作業が不要。

#### 1.3 型互換性検証テーブル（Phase 3 で確認）

| Factory/関数                  | 返す型/引数型              | 注入先/消費先                           | 互換性（Phase 3 で確認） |
| ----------------------------- | -------------------------- | --------------------------------------- | ------------------------ |
| `buildImproveFeedback`        | `ImproveFeedbackHistory[]` | `verifyAndImproveLoop`                  | TBD                      |
| `summarizeImproveSuggestions` | `string`                   | `ImproveFeedbackHistory.improveSummary` | TBD                      |

---

### タスク2: verifyAndImproveLoop() 変更設計

#### 2.1 concern ごとの target topology

| concern           | 変更対象                                    | 変更内容                                                                       |
| ----------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| 型定義            | `packages/shared/src/types/skillCreator.ts` | `ImproveFeedbackHistory` 型追加                                                |
| feedback 蓄積     | `RuntimeSkillCreatorFacade.ts` L340-518     | `previousImproveSummary: string` → `feedbackHistory: ImproveFeedbackHistory[]` |
| feedback 組み立て | `RuntimeSkillCreatorFacade.ts` L1644-1656   | `buildImproveFeedback()` 引数・実装変更                                        |
| export            | `packages/shared/src/types/skillCreator.ts` | `ImproveFeedbackHistory` を export に追加                                      |

**lane 数**: 2（型定義 lane + ロジック lane）— 3 以下に収まる。

#### 2.2 Before/After 比較

**Before（現在のコード）:**

```typescript
// L355: 初期化
let previousImproveSummary = "";

// L422-425: improve 呼び出し前
const feedback = buildImproveFeedback(failedChecks, previousImproveSummary);

// L498: improve 後の更新
previousImproveSummary = summarizeImproveSuggestions(suggestions);
```

**After（変更後のコード）:**

```typescript
// 初期化: 空配列に変更
const feedbackHistory: ImproveFeedbackHistory[] = [];

// improve 呼び出し前: 全履歴を渡す
const feedback = buildImproveFeedback(failedChecks, feedbackHistory);

// improve 後の更新: 新しい履歴エントリを push
feedbackHistory.push({
  attempt: attemptCount,
  failedChecks: failedChecks.map((c) => c.checkId ?? c.name),
  improveSummary: summarizeImproveSuggestions(suggestions),
});
```

#### 2.3 新規作成・修正ファイルパス一覧

| 操作 | ファイルパス                                                                         | 変更内容                                 |
| ---- | ------------------------------------------------------------------------------------ | ---------------------------------------- |
| 修正 | `packages/shared/src/types/skillCreator.ts`                                          | `ImproveFeedbackHistory` 型追加 + export |
| 修正 | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                | ループ内変数・buildImproveFeedback 変更  |
| 修正 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.test.ts` | テストケース追加・既存テスト更新         |

---

### タスク3: buildImproveFeedback() プロンプト設計

#### 3.1 Before（現在の実装）

```typescript
function buildImproveFeedback(
  checks: RuntimeSkillCreatorVerifyCheck[],
  previousImproveSummary: string,
): string {
  const feedback = formatVerifyChecksAsFeedback(checks);
  const summary = previousImproveSummary.trim();

  if (feedback === "" || summary === "") {
    return feedback;
  }

  return `${feedback}\n\n## 前回の改善要約\n${summary}`;
}
```

#### 3.2 After（変更後の設計）

```typescript
function buildImproveFeedback(
  checks: RuntimeSkillCreatorVerifyCheck[],
  history: ImproveFeedbackHistory[],
): string {
  const feedback = formatVerifyChecksAsFeedback(checks);

  if (history.length === 0) {
    return feedback;
  }

  // 未解決チェック（全試行で繰り返し失敗しているもの）を抽出
  const currentFailedIds = checks.map((c) => c.checkId ?? c.name);
  const persistentChecks = currentFailedIds.filter((id) =>
    history.every((h) => h.failedChecks.includes(id)),
  );

  const historySection = history
    .map(
      (h) =>
        `### 試行 ${h.attempt}/${history.length + 1}\n` +
        `- 失敗チェック: ${h.failedChecks.join(", ")}\n` +
        `- 試みた改善: ${h.improveSummary}`,
    )
    .join("\n\n");

  const persistentWarning =
    persistentChecks.length > 0
      ? `\n\n**繰り返し失敗中のチェック**: ${persistentChecks.join(", ")}\n` +
        `上記は過去の全試行で解決できていません。根本的に異なるアプローチが必要です。`
      : "";

  return (
    `${feedback}\n\n` +
    `## 過去の改善試行履歴（${history.length}回試行済み）\n\n` +
    `以下は過去に試みた改善とその結果です。同じアプローチは繰り返さず、異なる戦略を提案してください。` +
    `${persistentWarning}\n\n${historySection}`
  );
}
```

#### 3.3 プロンプト設計の意図

| 設計判断                                                                     | 理由                                                           |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| セクション名を「前回の改善要約」→「過去の改善試行履歴（N回試行済み）」に変更 | 試行回数を明示し、LLM に残り試行の緊急度を伝える               |
| 各試行に番号・失敗チェック・改善要約を構造化                                 | LLM が試行間の違いを明確に認識できるようにする                 |
| 「同じアプローチは繰り返さず」の指示文を追加                                 | LLM に明示的に多様性を要求し、重複提案を抑制する               |
| `persistentChecks`（繰り返し失敗チェック）を強調表示                         | 全試行で未解決のチェックに対し、根本的に異なるアプローチを促す |
| `history.length === 0` で早期リターン                                        | 初回試行時は従来と同じ出力を維持（後方互換性）                 |

#### 3.4 出力例（3回目の improve 時）

```markdown
## 検証失敗項目

- [FAIL] L2-SECTION-STRUCTURE: SKILL.md に必須セクションが不足
- [FAIL] L3-AGENT-FORMAT: agents/ のフォーマット不正

## 過去の改善試行履歴（2回試行済み）

以下は過去に試みた改善とその結果です。同じアプローチは繰り返さず、異なる戦略を提案してください。

**繰り返し失敗中のチェック**: L3-AGENT-FORMAT
上記は過去の全試行で解決できていません。根本的に異なるアプローチが必要です。

### 試行 1/3

- 失敗チェック: L2-SECTION-STRUCTURE, L3-AGENT-FORMAT
- 試みた改善: SKILL.md にセクション追加、agents/ のヘッダー修正

### 試行 2/3

- 失敗チェック: L3-AGENT-FORMAT
- 試みた改善: agents/ のテーブルフォーマットを修正
```

---

### タスク4: validation matrix

| テストコマンド                                                                     | 検証内容                                              | Phase |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------- | ----- |
| `pnpm --filter @repo/shared build`                                                 | ImproveFeedbackHistory 型の TypeScript コンパイル確認 | 5     |
| `pnpm --filter @repo/desktop exec vitest run RuntimeSkillCreatorFacade.test.ts`    | 全既存テスト + 新規テストの PASS                      | 4-6   |
| `pnpm --filter @repo/desktop exec vitest run formatVerifyChecksAsFeedback.test.ts` | feedback フォーマットテストの PASS                    | 6     |
| `pnpm typecheck`                                                                   | 型チェック全体の PASS                                 | 9     |
| `pnpm lint`                                                                        | ESLint 全体の PASS                                    | 9     |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                       | パス                                                                                                 | 内容                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| RuntimeSkillCreatorFacade 仕様 | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`          | Facade の責務・統合仕様                    |
| verify→improve 閉ループ教訓    | `.claude/skills/aiworkflow-requirements/references/lessons-learned-phase12-workflow-lifecycle.md`    | TASK-P0-02 の設計教訓                      |
| Governance Hooks Phase Policy  | `.claude/skills/aiworkflow-requirements/references/lessons-learned-governance-hooks-phase-policy.md` | improve = edit 可、new file 不可の権限設定 |

---

## 成果物

| 成果物         | パス                              | 状態      |
| -------------- | --------------------------------- | --------- |
| Phase 2 設計書 | `phase-2-design.md`（本ファイル） | completed |

---

## 完了条件

- [x] `ImproveFeedbackHistory` 型を設計した（フィールド定義・配置先決定）
- [x] DI 境界の型配置判断を実施した
- [x] concern ごとの target topology をテーブル化した（2 lane）
- [x] `verifyAndImproveLoop()` の Before/After を設計した
- [x] `buildImproveFeedback()` のプロンプト設計を完了した
- [x] 新規作成・修正ファイルパス一覧を記載した
- [x] validation matrix をコマンド単位で定義した

---

## タスク100%実行確認【必須】

Phase 2 の全タスク（型設計、ループ変更設計、プロンプト設計、validation matrix）を100%実行し完遂した。

---

## 次Phase

Phase 3: 設計レビューゲート — PASS/MINOR/MAJOR 判定を行い、Phase 4 進行可否を決定する。

**Phase 1-3 完了前に Phase 4 へ進まないこと。**
