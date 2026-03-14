# Phase 4 テスト計画書: TASK-SKILL-LIFECYCLE-04

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-04                                 |
| Phase      | 4（テスト作成）                                         |
| 作成日     | 2026-03-14                                              |
| ステータス | 完了                                                    |
| 前提成果物 | `outputs/phase-3/design-review-result.md`（PASS確認済） |
| 後続Phase  | Phase 5（実装）                                         |

---

## 1. テスト戦略

### 1-1. 3レーン構成

本タスクのテストは以下の3レーンで実施する。各レーンは独立して実行可能であり、
Phase 5 実装では RED → GREEN → Refactor サイクルに従う。

| レーン              | 対象                    | テストフレームワーク | テストファイル配置先                                                              |
| ------------------- | ----------------------- | -------------------- | --------------------------------------------------------------------------------- |
| Unit（単体）        | 純粋関数・ロジック      | Vitest               | `packages/shared/src/__tests__/scoring-gate.test.ts`                              |
| Integration（統合） | Store連携・IPC ハンドラ | Vitest               | `apps/desktop/src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts`   |
|                     |                         |                      | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                       |
| UI（Component）     | React コンポーネント    | Vitest + happy-dom   | `apps/desktop/src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx`      |
|                     |                         |                      | `apps/desktop/src/renderer/components/skill/__tests__/ScoringGateBanner.test.tsx` |

### 1-2. TDD 方針: RED → GREEN → Refactor

1. **RED**: 本計画書のテストケースをテストコードとして記述する。この時点では全件 FAIL。
2. **GREEN**: Phase 5 実装で最小限のコードを追加して全件 PASS にする。
3. **Refactor**: Phase 8 でコード品質を改善しつつテストを PASS に維持する。

### 1-3. 環境制約

- `happy-dom` 環境では `userEvent` ではなく `fireEvent` を使用する（P39対策）
- 派生セレクタ（`.filter()` / `.map()`）には `useShallow` を適用する（P48対策）
- テスト間で状態を共有しない。`beforeEach` で Store をリセットする（P9対策）

---

## 2. 単体テスト一覧（Unit Tests）

対象ファイル: `packages/shared/src/types/skill-improver.ts`（新規追加関数）

### 2-1. normalizeScore（4ケース）

| テストID   | 入力  | 期待出力 | 観点                          |
| ---------- | ----- | -------- | ----------------------------- |
| UT-NORM-01 | `50`  | `50`     | 正常値はそのまま返す          |
| UT-NORM-02 | `-1`  | `0`      | 下限クランプ（負数 → 0）      |
| UT-NORM-03 | `101` | `100`    | 上限クランプ（101以上 → 100） |
| UT-NORM-04 | `NaN` | `0`      | NaN / 非有限値は 0 として扱う |

```typescript
// テストコードひな形（packages/shared/src/__tests__/scoring-gate.test.ts）
describe("normalizeScore", () => {
  it("UT-NORM-01: 正常値 50 はそのまま 50 を返す", () => {
    expect(normalizeScore(50)).toBe(50);
  });
  it("UT-NORM-02: -1 は下限クランプされて 0 を返す", () => {
    expect(normalizeScore(-1)).toBe(0);
  });
  it("UT-NORM-03: 101 は上限クランプされて 100 を返す", () => {
    expect(normalizeScore(101)).toBe(100);
  });
  it("UT-NORM-04: NaN は 0 を返す", () => {
    expect(normalizeScore(NaN)).toBe(0);
  });
});
```

### 2-2. getScoreGate 境界値（10ケース）

設計書（`outputs/phase-2/score-model-design.md` セクション4-3）確定の境界値に従う。

| テストID     | 入力スコア | 期待 gate         | canSave | canUse | isRecommended | 境界種別       |
| ------------ | ---------- | ----------------- | ------- | ------ | ------------- | -------------- |
| UT-GATE-01a  | `0`        | NEEDS_IMPROVEMENT | false   | false  | false         | 下限           |
| UT-GATE-01b  | `30`       | NEEDS_IMPROVEMENT | false   | false  | false         | 中間値         |
| UT-GATE-01c  | `59`       | NEEDS_IMPROVEMENT | false   | false  | false         | 上限境界       |
| UT-GATE-02a  | `60`       | SAVE_ALLOWED      | true    | false  | false         | 下限境界       |
| UT-GATE-02b  | `79`       | SAVE_ALLOWED      | true    | false  | false         | 上限境界       |
| UT-GATE-03a  | `80`       | USE_ALLOWED       | true    | true   | false         | 下限境界       |
| UT-GATE-03b  | `99`       | USE_ALLOWED       | true    | true   | false         | 上限境界       |
| UT-GATE-04a  | `100`      | RECOMMENDED       | true    | true   | true          | 固定値（満点） |
| UT-GATE-ERR1 | `-1`       | NEEDS_IMPROVEMENT | false   | false  | false         | 範囲外（負数） |
| UT-GATE-ERR2 | `101`      | RECOMMENDED       | true    | true   | true          | 範囲外（正超） |
| UT-GATE-ERR3 | `NaN`      | NEEDS_IMPROVEMENT | false   | false  | false         | 非数値入力     |

> `101` 以上は `normalizeScore()` で 100 にクランプされるため `RECOMMENDED` となる。

```typescript
// テストコードひな形
describe("getScoreGate 境界値", () => {
  const cases = [
    {
      id: "UT-GATE-01a",
      score: 0,
      gate: "NEEDS_IMPROVEMENT",
      canSave: false,
      canUse: false,
      isRecommended: false,
    },
    {
      id: "UT-GATE-01b",
      score: 30,
      gate: "NEEDS_IMPROVEMENT",
      canSave: false,
      canUse: false,
      isRecommended: false,
    },
    {
      id: "UT-GATE-01c",
      score: 59,
      gate: "NEEDS_IMPROVEMENT",
      canSave: false,
      canUse: false,
      isRecommended: false,
    },
    {
      id: "UT-GATE-02a",
      score: 60,
      gate: "SAVE_ALLOWED",
      canSave: true,
      canUse: false,
      isRecommended: false,
    },
    {
      id: "UT-GATE-02b",
      score: 79,
      gate: "SAVE_ALLOWED",
      canSave: true,
      canUse: false,
      isRecommended: false,
    },
    {
      id: "UT-GATE-03a",
      score: 80,
      gate: "USE_ALLOWED",
      canSave: true,
      canUse: true,
      isRecommended: false,
    },
    {
      id: "UT-GATE-03b",
      score: 99,
      gate: "USE_ALLOWED",
      canSave: true,
      canUse: true,
      isRecommended: false,
    },
    {
      id: "UT-GATE-04a",
      score: 100,
      gate: "RECOMMENDED",
      canSave: true,
      canUse: true,
      isRecommended: true,
    },
    {
      id: "UT-GATE-ERR1",
      score: -1,
      gate: "NEEDS_IMPROVEMENT",
      canSave: false,
      canUse: false,
      isRecommended: false,
    },
    {
      id: "UT-GATE-ERR2",
      score: 101,
      gate: "RECOMMENDED",
      canSave: true,
      canUse: true,
      isRecommended: true,
    },
    {
      id: "UT-GATE-ERR3",
      score: NaN,
      gate: "NEEDS_IMPROVEMENT",
      canSave: false,
      canUse: false,
      isRecommended: false,
    },
  ] as const;

  it.each(cases)(
    "$id: score=$score → gate=$gate",
    ({ score, gate, canSave, canUse, isRecommended }) => {
      const result = getScoreGate(score);
      expect(result.gate).toBe(gate);
      expect(result.canSave).toBe(canSave);
      expect(result.canUse).toBe(canUse);
      expect(result.isRecommended).toBe(isRecommended);
    },
  );
});
```

### 2-3. getScoreGateResult フラグ（4ケース）

`ScoringGateResult` の各フィールドが正しく設定されることを確認する。

| テストID   | gate              | 確認フィールド                   | 期待値                |
| ---------- | ----------------- | -------------------------------- | --------------------- |
| UT-FLAG-01 | NEEDS_IMPROVEMENT | canSave / canUse / isRecommended | false / false / false |
| UT-FLAG-02 | SAVE_ALLOWED      | canSave / canUse / isRecommended | true / false / false  |
| UT-FLAG-03 | USE_ALLOWED       | canSave / canUse / isRecommended | true / true / false   |
| UT-FLAG-04 | RECOMMENDED       | canSave / canUse / isRecommended | true / true / true    |

```typescript
describe("getScoreGateResult フラグ", () => {
  it("UT-FLAG-01: NEEDS_IMPROVEMENT は全フラグ false", () => {
    const r = getScoreGate(0);
    expect(r.canSave).toBe(false);
    expect(r.canUse).toBe(false);
    expect(r.isRecommended).toBe(false);
  });
  it("UT-FLAG-02: SAVE_ALLOWED は canSave=true, canUse=false", () => {
    const r = getScoreGate(60);
    expect(r.canSave).toBe(true);
    expect(r.canUse).toBe(false);
    expect(r.isRecommended).toBe(false);
  });
  it("UT-FLAG-03: USE_ALLOWED は canSave=true, canUse=true, isRecommended=false", () => {
    const r = getScoreGate(80);
    expect(r.canSave).toBe(true);
    expect(r.canUse).toBe(true);
    expect(r.isRecommended).toBe(false);
  });
  it("UT-FLAG-04: RECOMMENDED は全フラグ true", () => {
    const r = getScoreGate(100);
    expect(r.canSave).toBe(true);
    expect(r.canUse).toBe(true);
    expect(r.isRecommended).toBe(true);
  });
});
```

### 2-4. calculateScoreFromBreakdown（4ケース）

`computeTotalScore()` の均等平均算出を検証する。

| テストID    | 入力 breakdown（clarity/specificity/completeness/reproducibility/security） | 期待 totalScore | 観点                       |
| ----------- | --------------------------------------------------------------------------- | --------------- | -------------------------- |
| UT-SCORE-01 | 80 / 80 / 80 / 80 / 80                                                      | `80`            | 均等値の平均               |
| UT-SCORE-02 | 100 / 60 / 80 / 40 / 70                                                     | `70`            | 不均等値の平均（四捨五入） |
| UT-SCORE-03 | 0 / 0 / 0 / 0 / 0                                                           | `0`             | 全項目 0                   |
| UT-SCORE-04 | 110 / -10 / 80 / 80 / 80                                                    | `68`            | 範囲外値のクランプ後平均   |

> UT-SCORE-04 の期待値算出: normalizeScore(110)=100, normalizeScore(-10)=0, 残り80×3 → (100+0+80+80+80)/5 = 68

```typescript
describe("computeTotalScore（calculateScoreFromBreakdown）", () => {
  it("UT-SCORE-01: 全項目80の均等平均は80", () => {
    const bd = {
      clarity: 80,
      specificity: 80,
      completeness: 80,
      reproducibility: 80,
      security: 80,
    };
    expect(computeTotalScore(bd)).toBe(80);
  });
  it("UT-SCORE-02: 不均等値の平均（端数四捨五入）", () => {
    const bd = {
      clarity: 100,
      specificity: 60,
      completeness: 80,
      reproducibility: 40,
      security: 70,
    };
    expect(computeTotalScore(bd)).toBe(70);
  });
  it("UT-SCORE-03: 全項目0の平均は0", () => {
    const bd = {
      clarity: 0,
      specificity: 0,
      completeness: 0,
      reproducibility: 0,
      security: 0,
    };
    expect(computeTotalScore(bd)).toBe(0);
  });
  it("UT-SCORE-04: 範囲外値はnormalizeScoreでクランプ後に平均算出", () => {
    const bd = {
      clarity: 110,
      specificity: -10,
      completeness: 80,
      reproducibility: 80,
      security: 80,
    };
    expect(computeTotalScore(bd)).toBe(68);
  });
});
```

**単体テスト小計**: 4 + 10 + 4 + 4 = **22ケース**（UT-GATE-ERR3含む11ケースに修正、合計22）

> 注: 指示書記載の「18ケース」は UT-GATE-ERR1〜ERR3 を含まない基本ケース数。本計画では設計書確定の境界値を全件収録するため22ケースとなる。

---

## 3. 統合テスト一覧（Integration Tests）

### 3-1. previousAnalysis 保持（2ケース）

対象: `agentSlice` の `previousAnalysis` フィールド更新ロジック。

| テストID   | シナリオ                                              | 確認内容                                                   |
| ---------- | ----------------------------------------------------- | ---------------------------------------------------------- |
| IT-PREV-01 | 改善実行前に `captureScoreBeforeImprovement()` を呼ぶ | `previousAnalysis` が改善前の `currentAnalysis` と一致する |
| IT-PREV-02 | スキル切り替え時に Store をリセットする               | `previousAnalysis` が `null` にリセットされる              |

```typescript
describe("previousAnalysis 保持", () => {
  beforeEach(() => {
    useAppStore.getState().resetSkillState();
  });

  it("IT-PREV-01: 改善実行前にpreviousAnalysisにスナップショットが保存される", async () => {
    const store = useAppStore.getState();
    const mockAnalysis: SkillAnalysis = {
      overallScore: 73 /* ... */,
    } as SkillAnalysis;
    store.setCurrentAnalysis(mockAnalysis);
    store.captureScoreBeforeImprovement();
    expect(store.previousAnalysis).toEqual(mockAnalysis);
  });

  it("IT-PREV-02: スキル切り替え時にpreviousAnalysisがnullにリセットされる", () => {
    const store = useAppStore.getState();
    store.resetSkillState();
    expect(store.previousAnalysis).toBeNull();
  });
});
```

### 3-2. スコア差分 Δ 計算（3ケース）

対象: `currentAnalysis.overallScore - previousAnalysis.overallScore` の算出ロジック。

| テストID    | previousScore | currentScore | 期待 Δ | 期待表示色    | 観点                       |
| ----------- | ------------- | ------------ | ------ | ------------- | -------------------------- |
| IT-DELTA-01 | `73`          | `85`         | `+12`  | 緑（success） | スコア上昇                 |
| IT-DELTA-02 | `80`          | `65`         | `-15`  | 赤（error）   | スコア低下                 |
| IT-DELTA-03 | `null`        | `85`         | `null` | 非表示        | previousScore なし（初回） |

```typescript
describe("スコア差分Δ計算", () => {
  it("IT-DELTA-01: スコア上昇（73→85）でΔ+12が算出される", () => {
    const delta = computeScoreDelta(85, 73);
    expect(delta).toBe(12);
  });
  it("IT-DELTA-02: スコア低下（80→65）でΔ-15が算出される", () => {
    const delta = computeScoreDelta(65, 80);
    expect(delta).toBe(-15);
  });
  it("IT-DELTA-03: previousScoreがnullの場合はΔがnullを返す", () => {
    const delta = computeScoreDelta(85, null);
    expect(delta).toBeNull();
  });
});
```

### 3-3. evaluatePrompt Preload API（2ケース）

対象: `apps/desktop/src/preload/skill-api.ts` の `evaluatePrompt()` と `skillHandlers.ts` の P42 バリデーション。

| テストID  | 入力                                            | 期待結果                         | 観点                               |
| --------- | ----------------------------------------------- | -------------------------------- | ---------------------------------- |
| IT-IPC-01 | `{ skillName: "test", prompt: "valid prompt" }` | `PromptEvaluation`（score あり） | 正常系: IPC 往復で評価結果を返す   |
| IT-IPC-02 | `{ skillName: "test", prompt: "   " }`          | `VALIDATION_ERROR`（P42 違反）   | 異常系: スペースのみ prompt を拒否 |

```typescript
describe("evaluatePrompt Preload API", () => {
  it("IT-IPC-01: 有効なpromptを渡すとPromptEvaluationが返る", async () => {
    const mockHandler = vi.fn().mockResolvedValue({
      success: true,
      data: { score: 85, feedback: "Good", breakdown: null },
    });
    ipcMain.handle("skill:optimize:evaluate", mockHandler);

    const result = await window.electronAPI.skill.evaluatePrompt(
      "test-skill",
      "valid prompt",
    );
    expect(result.score).toBeDefined();
    expect(typeof result.score).toBe("number");
  });

  it("IT-IPC-02: スペースのみのpromptはVALIDATION_ERRORを返す（P42準拠）", async () => {
    await expect(
      window.electronAPI.skill.evaluatePrompt("test-skill", "   "),
    ).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
```

**統合テスト小計**: 2 + 3 + 2 = **7ケース**

---

## 4. UI テスト一覧（Component Tests）

### 4-1. ScoreDisplay にスコア差分バッジが表示される（3ケース）

対象: `apps/desktop/src/renderer/components/skill/ScoreDisplay.tsx`（`previousScore` props 追加後）

| テストID    | currentScore | previousScore | 期待バッジ表示 | 期待色クラス      |
| ----------- | ------------ | ------------- | -------------- | ----------------- |
| UI-DELTA-01 | `85`         | `73`          | `+12`（上昇）  | success（緑）     |
| UI-DELTA-02 | `65`         | `80`          | `-15`（低下）  | error（赤）       |
| UI-DELTA-03 | `85`         | `undefined`   | バッジ非表示   | -（レンダーなし） |

> P39対策: `fireEvent` を使用。`userEvent` は happy-dom 環境で使用禁止。

```typescript
describe("ScoreDisplay スコア差分バッジ", () => {
  it("UI-DELTA-01: previousScore=73, currentScore=85のときΔ+12バッジが表示される", () => {
    render(<ScoreDisplay score={85} previousScore={73} />);
    expect(screen.getByText("+12")).toBeInTheDocument();
  });

  it("UI-DELTA-02: previousScore=80, currentScore=65のときΔ-15バッジが表示される", () => {
    render(<ScoreDisplay score={65} previousScore={80} />);
    expect(screen.getByText("-15")).toBeInTheDocument();
  });

  it("UI-DELTA-03: previousScoreがundefinedのときバッジが表示されない", () => {
    render(<ScoreDisplay score={85} />);
    expect(screen.queryByTestId("score-delta-badge")).toBeNull();
  });
});
```

### 4-2. ScoringGateBanner が gate に応じた表示をする（4ケース）

対象: `apps/desktop/src/renderer/components/skill/ScoringGateBanner.tsx`（新規コンポーネント）

| テストID   | gate              | 期待バナーテキスト（一部）     | 期待 variant |
| ---------- | ----------------- | ------------------------------ | ------------ |
| UI-GATE-01 | NEEDS_IMPROVEMENT | 「スコアが低すぎます」         | error        |
| UI-GATE-02 | SAVE_ALLOWED      | 「保存できます」               | warning      |
| UI-GATE-03 | USE_ALLOWED       | 「スキルは利用可能な品質です」 | success      |
| UI-GATE-04 | RECOMMENDED       | 「このスキルは推奨品質です」   | success      |

```typescript
describe("ScoringGateBanner", () => {
  it("UI-GATE-01: NEEDS_IMPROVEMENTのときerror variantのバナーが表示される", () => {
    render(<ScoringGateBanner gate="NEEDS_IMPROVEMENT" score={40} />);
    expect(screen.getByText(/スコアが低すぎます/)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveAttribute("data-variant", "error");
  });

  it("UI-GATE-02: SAVE_ALLOWEDのときwarning variantのバナーが表示される", () => {
    render(<ScoringGateBanner gate="SAVE_ALLOWED" score={70} />);
    expect(screen.getByText(/保存できます/)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveAttribute("data-variant", "warning");
  });

  it("UI-GATE-03: USE_ALLOWEDのときsuccess variantのバナーが表示される", () => {
    render(<ScoringGateBanner gate="USE_ALLOWED" score={85} />);
    expect(screen.getByText(/利用可能な品質/)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveAttribute("data-variant", "success");
  });

  it("UI-GATE-04: RECOMMENDEDのときsuccess variantで推奨テキストが表示される", () => {
    render(<ScoringGateBanner gate="RECOMMENDED" score={100} />);
    expect(screen.getByText(/推奨品質/)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveAttribute("data-variant", "success");
  });
});
```

**UI テスト小計**: 3 + 4 = **7ケース**

---

## 5. 要件ID ↔ テストID 対応表

| 要件ID | 要件内容                               | カバーするテストID                                                           |
| ------ | -------------------------------------- | ---------------------------------------------------------------------------- |
| REQ-01 | prompt品質の5軸評価                    | UT-SCORE-01, UT-SCORE-02, UT-SCORE-03, UT-SCORE-04                           |
| REQ-02 | skill品質評価（分析・リスク）          | IT-IPC-01（SkillAnalysis受け取り確認）                                       |
| REQ-03 | 実行結果品質評価（EP-4）               | IT-IPC-01（evaluateAfterUse は同チャンネル再利用）                           |
| REQ-04 | EP-1 作成時採点                        | IT-IPC-01, UI-GATE-01〜04                                                    |
| REQ-05 | EP-2 改善時採点                        | IT-PREV-01, IT-PREV-02, IT-DELTA-01, IT-DELTA-02, IT-DELTA-03                |
| REQ-06 | EP-3 利用前採点（任意・ブロックなし）  | IT-IPC-01                                                                    |
| REQ-07 | EP-4 利用後再評価                      | IT-IPC-01（evaluateAfterUse 経路）                                           |
| REQ-08 | ゲート NEEDS_IMPROVEMENT（0-59）       | UT-GATE-01a, UT-GATE-01b, UT-GATE-01c, UT-GATE-ERR1, UI-GATE-01              |
| REQ-09 | ゲート SAVE_ALLOWED（60-79）           | UT-GATE-02a, UT-GATE-02b, UI-GATE-02                                         |
| REQ-10 | ゲート USE_ALLOWED（80-99）            | UT-GATE-03a, UT-GATE-03b, UI-GATE-03                                         |
| REQ-11 | ゲート RECOMMENDED（100）              | UT-GATE-04a, UT-GATE-ERR2, UI-GATE-04                                        |
| REQ-12 | Task03 連携契約（canSave/canUse 制御） | UT-FLAG-01, UT-FLAG-02, UT-FLAG-03, UT-FLAG-04, IT-IPC-01                    |
| REQ-13 | Task05 連携契約（利用前/後評価）       | IT-IPC-01, IT-IPC-02                                                         |
| REQ-14 | Preload API evaluatePrompt() 追加      | IT-IPC-01, IT-IPC-02                                                         |
| REQ-15 | スコア差分（Δ）表示                    | IT-DELTA-01, IT-DELTA-02, IT-DELTA-03, UI-DELTA-01, UI-DELTA-02, UI-DELTA-03 |

---

## 6. 実行コマンド

### 6-1. 単体テスト（packages/shared）

```bash
# ScoringGate 関連の純粋関数テスト
pnpm --filter @repo/shared exec vitest run src/__tests__/scoring-gate.test.ts
```

### 6-2. 統合テスト（IPC ハンドラ・Store・Hook）

```bash
# Store・Hook 連携テスト
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts

# IPC ハンドラ + evaluatePrompt バリデーションテスト
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillHandlers.test.ts
```

### 6-3. UI コンポーネントテスト

```bash
# ScoreDisplay（差分バッジ）
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx

# ScoringGateBanner（ゲート別表示）
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/ScoringGateBanner.test.tsx
```

### 6-4. 全テスト一括実行

```bash
# Phase 5 実装後の Green 確認用コマンド
pnpm --filter @repo/shared exec vitest run \
  && pnpm --filter @repo/desktop exec vitest run \
    src/renderer/components/skill/__tests__/ScoreDisplay.test.tsx \
    src/renderer/components/skill/__tests__/ScoringGateBanner.test.tsx \
    src/renderer/components/skill/__tests__/useSkillAnalysis.test.ts \
    src/main/ipc/__tests__/skillHandlers.test.ts
```

---

## 7. カバレッジ目標（Phase 7 基準）

| 指標              | 最低基準 | 推奨基準 | 根拠                                                |
| ----------------- | -------- | -------- | --------------------------------------------------- |
| Line Coverage     | 80%      | **90%+** | `.claude/rules/02-code-quality.md` Phase 7 推奨基準 |
| Branch Coverage   | 60%      | **70%+** | 同上                                                |
| Function Coverage | 80%      | **90%+** | 同上                                                |

### 7-1. カバレッジ確認コマンド

```bash
# packages/shared のカバレッジ確認
pnpm --filter @repo/shared exec vitest run --coverage \
  --coverage.include="src/types/skill-improver.ts"

# apps/desktop のカバレッジ確認
pnpm --filter @repo/desktop exec vitest run --coverage \
  --coverage.include="src/renderer/components/skill/ScoreDisplay.tsx" \
  --coverage.include="src/renderer/components/skill/ScoringGateBanner.tsx" \
  --coverage.include="src/renderer/components/skill/hooks/useSkillAnalysis.ts" \
  --coverage.include="src/main/ipc/skillHandlers.ts"
```

### 7-2. カバレッジ未達時の対応

カバレッジが最低基準（Line 80% / Branch 60% / Function 80%）を下回った場合、Phase 6（テスト拡充）で不足ケースを追加する。Phase 7 でカバレッジ基準の充足を最終確認する。

---

## 8. テストケース総括

| レーン      | 対象関数/コンポーネント        | ケース数 |
| ----------- | ------------------------------ | -------- |
| Unit        | normalizeScore                 | 4        |
| Unit        | getScoreGate（境界値）         | 11       |
| Unit        | getScoreGateResult（フラグ）   | 4        |
| Unit        | computeTotalScore（breakdown） | 4        |
| Integration | previousAnalysis 保持          | 2        |
| Integration | スコア差分 Δ 計算              | 3        |
| Integration | evaluatePrompt Preload API     | 2        |
| UI          | ScoreDisplay 差分バッジ        | 3        |
| UI          | ScoringGateBanner              | 4        |
| **合計**    |                                | **37**   |

> 基本18ケース（指示書記載）に加え、設計書確定の ERR ケース（3件）、Δ算出テスト（3件）、Store保持テスト（2件）、IPC異常系（1件）、UIテスト（7件）を追加収録。
> Phase 6 でカバレッジ不足が判明した場合に追加する。

---

## 完了条件チェックリスト

- [x] 単体/統合/UI の3レーン構成が定義されている
- [x] normalizeScore のテスト4ケースが定義されている
- [x] getScoreGate の境界値テスト10ケース（+ERR3件）が定義されている
- [x] getScoreGateResult フラグの4ケースが定義されている
- [x] computeTotalScore の4ケースが定義されている
- [x] previousAnalysis 保持テスト2ケースが定義されている
- [x] スコア差分 Δ 計算テスト3ケースが定義されている
- [x] evaluatePrompt Preload API テスト2ケースが定義されている
- [x] ScoreDisplay 差分バッジ UI テスト3ケースが定義されている
- [x] ScoringGateBanner UI テスト4ケースが定義されている
- [x] 要件ID REQ-01〜REQ-15 の全件がテストIDにマッピングされている
- [x] 実行コマンドが pnpm --filter 形式で記載されている
- [x] カバレッジ目標（Line 90%+ / Branch 70%+ / Function 90%+）が定義されている
- [x] TDD 方針（RED → GREEN → Refactor）が明記されている

---

## 次 Phase へ引き渡し事項

Phase 5（実装）では以下の順序でテストを RED → GREEN にする:

1. `normalizeScore` / `getScoreGate` / `computeTotalScore` を `packages/shared` に追加（UT-NORM / UT-GATE / UT-FLAG / UT-SCORE を GREEN）
2. `agentSlice` に `previousAnalysis` フィールドを追加（IT-PREV を GREEN）
3. `computeScoreDelta()` ユーティリティを追加（IT-DELTA を GREEN）
4. Preload `evaluatePrompt()` を追加、P42 バリデーション確認（IT-IPC を GREEN）
5. `ScoreDisplay` に `previousScore` props と差分バッジを追加（UI-DELTA を GREEN）
6. `ScoringGateBanner` コンポーネントを新規作成（UI-GATE を GREEN）

Phase 5 実装制約（Phase 3 MINOR 指摘の引き継ぎ）:

- P42 準拠 3段バリデーション（型チェック → 空文字列 → トリム空文字列）を全 IPC 引数に適用
- P44 パターン防止: Preload API の引数名を `prompt` に統一（セマンティクス一致）
- P45 パターン防止: ハンドラ・サービス・マネージャー全層で引数名を統一
- P31 対策: `previousAnalysis` セレクタは個別セレクタとして定義し、合成 Hook に含めない
