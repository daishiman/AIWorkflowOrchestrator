# TASK-SKILL-LIFECYCLE-05 実装ガイド

## メタ情報

| 項目       | 値                         |
| ---------- | -------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-05    |
| タスク名   | 作成済みスキルを使う主導線 |
| Phase      | 12                         |
| 成果物種別 | 実装ガイド                 |
| 作成日     | 2026-03-15                 |
| タスク種別 | 設計タスク                 |

---

## Part 1: 概念説明（中学生レベル）

なぜ必要か: スキルを作っても使われないと価値が出ないため、作成後に自然に使える導線を先に設計する必要があります。  
何をするか: 「作成直後」「あとから」「履歴から再利用」の3導線と、実行後の改善ループを1つの流れとしてつなげます。

### 第1章: スキルを「作るだけで終わり」にしないために

想像してみてください。あなたが料理のレシピを1日かけて考えました。
でも、そのレシピをメモ帳にしまったまま、一度も料理しなかったら？
それと同じことが「スキル」でも起きます。

AIWorkflowOrchestrator では、スキルを「料理のレシピ」と考えます。

- 作ったレシピをすぐに試せる導線 = 「今すぐ使う」ボタン
- 後でゆっくり使う棚 = 「Skill Center」
- 前回作った料理の記録 = 「履歴」

この3つの経路が、「作ったが使われないスキル」をなくします。

---

### 第2章: 3つの使い方

| 使い方     | 例え                                       | 実際の動作                                             |
| ---------- | ------------------------------------------ | ------------------------------------------------------ |
| 作ってすぐ | 料理を作ったら、熱いうちに食べる           | スキル作成完了 → 「今すぐ使う」CTA → Agent 実行        |
| 後から使う | 冷蔵庫にしまって、食べたい時に取り出す     | Skill Center の一覧/検索 → 詳細 → 「使う」→ Agent 実行 |
| また使う   | 先週作った料理がおいしかったので、もう一度 | Agent 履歴 → 前回の設定を復元 → 再実行                 |

#### シナリオA: 作ってすぐ使う

あなたが今、料理のレシピを書き終えました。キッチンには材料がそろっています。
「今すぐ使う」ボタンを押すと、レシピの品質チェック（採点）が行われます。
合格点なら、そのままキッチン（Agent 実行画面）に連れて行ってくれます。

#### シナリオB: 後から使う

以前作ったレシピを「冷蔵庫」（Skill Center）にしまっておきます。
食べたい時に冷蔵庫を開けて、レシピを選んで、料理を始めます。
お気に入りのレシピには「星マーク」をつけて、すぐ見つけられるようにできます。

#### シナリオC: また使う

先週作った料理がおいしかったので、もう一度作りたい。
「履歴」タブを開くと、前回の料理の記録が残っています。
「もう一度」ボタンを押すと、前回と同じ設定で料理を再開できます。

---

### 第3章: 品質の見える化（お料理の「星評価」）

レストランのメニューに「おすすめ」と書いてあると、
どのお料理を頼めばいいか迷わなくなりますよね。

スキルも同じです。各スキルには「品質スコア」があります:

| 評価レベル                    | 点数    | 意味                         |
| ----------------------------- | ------- | ---------------------------- |
| 推奨（RECOMMENDED）           | 100点   | 自信を持って使えます         |
| 利用可（USE_ALLOWED）         | 80-99点 | 普通に使えます               |
| 保存可（SAVE_ALLOWED）        | 60-79点 | 使えますが改善を推奨します   |
| 改善必須（NEEDS_IMPROVEMENT） | 0-59点  | 今は使わず、先に直しましょう |

この評価は Skill Center の一覧画面に小さなバッジで表示されます。
バッジは色（赤/黄/緑）とアイコンと文字の3つの方法で品質を伝えるので、
色が見えにくい人にもわかるように設計されています。

---

### 第4章: 使って気に入らなかったら？（改善へのループ）

料理を食べてみて「もう少し塩を足したいな」と思ったら、
次回のレシピに「塩を増やす」とメモしますよね。

Agent でスキルを実行した後、結果が気に入らなければ
「改善する」ボタンで Skill Creator（レシピ編集画面）に戻れます。
改善 → 再採点 → また使う、という「改善のループ」が設計されています。

```
実行 → 結果確認 → 「改善する」ボタン
  → Skill Creator で修正
  → 再採点（品質スコア更新）
  → また使う（再実行）
```

このループのおかげで、スキルは使うたびに良くなっていきます。

---

## Part 2: 開発者向け実装詳細

### セクション A: コンポーネント階層と新規コンポーネント

#### 新規コンポーネント一覧

| コンポーネント名          | Atomic レベル | 配置ファイル（予定）                                          | 責務                                     |
| ------------------------- | ------------- | ------------------------------------------------------------- | ---------------------------------------- |
| `ScoreGateBadge`          | atoms         | `components/atoms/ScoreGateBadge/index.tsx`                   | ScoringGate バッジ（色+アイコン+ラベル） |
| `SkillCard`               | molecules     | `components/molecules/SkillCard/index.tsx`                    | スキル一覧カード                         |
| `SkillDetailPanel`        | organisms     | `components/organisms/SkillDetailPanel/index.tsx`             | スキル詳細サイドパネル                   |
| `PostExecutionActionBar`  | organisms     | `views/AgentView/components/PostExecutionActionBar/index.tsx` | 実行後アクションバー                     |
| `RecommendedSkillSection` | molecules     | `views/SkillCenterView/components/RecommendedSkillSection/`   | おすすめスキルセクション                 |

#### コンポーネント階層図

```
SkillCenterView
  +-- RecommendedSkillSection
  |     +-- SkillCard (ScoreGateBadge 内包)
  +-- RecentlyUsedSection
  |     +-- SkillCard (ScoreGateBadge 内包)
  +-- SavedSkillList
  |     +-- SkillCard (ScoreGateBadge 内包)
  +-- SkillDetailPanel (サイドパネル)
        +-- ScoreGateBadge
        +-- CTA ボタン群

AgentView
  +-- ExecutionResultSection
        +-- PostExecutionActionBar
              +-- ScoreGateBadge (実行結果の品質表示)
              +-- CTA ボタン群 (再実行/改善/完了/terminal)
```

#### ScoreGateBadge 実装仕様

```typescript
// P46: HTMLAttributes との衝突を避けるため Omit を使用
interface ScoreGateBadgeProps extends Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "content"
> {
  gate: ScoringGate; // 'NEEDS_IMPROVEMENT' | 'SAVE_ALLOWED' | 'USE_ALLOWED' | 'RECOMMENDED'
  score: number;
  size: "sm" | "md";
  showLabel?: boolean; // default: true
}

// P47: CSS変数ベーススタイルは Record 定数でエクスポートしてテストで参照可能にする
export const GATE_BADGE_VARIANT_STYLES: Record<ScoringGate, string> = {
  NEEDS_IMPROVEMENT: "bg-[var(--status-error)] text-[var(--text-inverse)]",
  SAVE_ALLOWED: "bg-[var(--status-warning)] text-[var(--text-inverse)]",
  USE_ALLOWED: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  RECOMMENDED: "bg-[var(--status-success)] text-[var(--text-inverse)]",
};

// アクセシビリティ: 色+アイコン+テキストの3重表現
export const GATE_BADGE_ICONS: Record<ScoringGate, string> = {
  NEEDS_IMPROVEMENT: "exclamation-circle", // 赤 + 警告アイコン + 「改善必須」
  SAVE_ALLOWED: "arrow-down-circle", // 黄 + 保存アイコン + 「保存可」
  USE_ALLOWED: "check-circle", // 緑 + チェックアイコン + 「利用可」
  RECOMMENDED: "star", // 緑 + 星アイコン + 「推奨」
};

export const GATE_BADGE_LABELS: Record<ScoringGate, string> = {
  NEEDS_IMPROVEMENT: "改善必須",
  SAVE_ALLOWED: "保存可",
  USE_ALLOWED: "利用可",
  RECOMMENDED: "推奨",
};
```

#### PostExecutionActionBar 実装仕様

```typescript
interface PostExecutionActionBarProps {
  onRerun: () => void;
  onImprove: (
    skillName: string,
    executionResult: ExecutionResultSummary,
  ) => void;
  onComplete: () => void;
  onTerminalHandoff: (skillName: string) => void;
  executionResult: ExecutionResultSummary;
  gate: ScoringGate;
  score: number;
}
```

CTA ボタンの表示/非表示/有効/無効は `getCtaConfig()` 関数で制御する（セクション C 参照）。

---

### セクション B: 状態管理実装詳細

#### skillSlice 拡張

```typescript
// 追加フィールド
interface SkillSliceState {
  favoriteSkillNames: Set<string>; // Zustand persist の customStorage で Set 型シリアライズ
  recentlyUsedSkills: { name: string; usedAt: string }[]; // 最大20件、usedAt: ISO 8601
}

// P31/P48 準拠の個別セレクタ
export const useFavoriteSkillNames = () =>
  useAppStore((state) => state.favoriteSkillNames);

// P48: 配列を返す派生セレクタは useShallow 必須
import { useShallow } from "zustand/react/shallow";

export const useRecentlyUsedSkills = () =>
  useAppStore(useShallow((state) => state.recentlyUsedSkills));

// お気に入りフィルタ（P48: filter は新しい配列参照を返すため useShallow 必須）
export const useFavoriteSkills = () =>
  useAppStore(
    useShallow((state) =>
      state.skills.filter((s) => state.favoriteSkillNames.has(s.name)),
    ),
  );

// お気に入り判定（boolean プリミティブ: useShallow 不要）
export const useIsFavorite = (skillName: string) =>
  useAppStore((state) => state.favoriteSkillNames.has(skillName));

// アクション
export const useToggleFavorite = () =>
  useAppStore((state) => state.toggleFavorite);

export const useAddRecentlyUsed = () =>
  useAppStore((state) => state.addRecentlyUsed);
```

#### agentSlice 拡張

```typescript
// 追加フィールド
interface AgentSliceState {
  lastExecutionResult: ExecutionResultSummary | null;
  postExecutionScore: ScoringGateResult | null;
}

// リセットタイミング: スキル変更時 or Agent画面離脱時
export const useLastExecutionResult = () =>
  useAppStore((state) => state.lastExecutionResult);

export const usePostExecutionScore = () =>
  useAppStore((state) => state.postExecutionScore);

export const useSetLastExecutionResult = () =>
  useAppStore((state) => state.setLastExecutionResult);

export const useClearPostExecutionState = () =>
  useAppStore((state) => state.clearPostExecutionState);
```

#### customStorage での Set 型シリアライズ

```typescript
// customStorage の getItem での Set 復元（P19/P49 準拠: 実行時型検証）
const customStorage = {
  getItem: (name: string) => {
    const raw = localStorage.getItem(name);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (parsed == null || typeof parsed !== "object") return null;

    const state = parsed as Record<string, unknown>;

    // Set<string> の復元: Array.isArray() で実行時型検証
    if ("favoriteSkillNames" in state) {
      const rawFavorites = state.favoriteSkillNames;
      state.favoriteSkillNames = new Set(
        Array.isArray(rawFavorites)
          ? rawFavorites.filter((item: unknown) => typeof item === "string")
          : [],
      );
    }

    return state;
  },
  setItem: (name: string, value: unknown) => {
    const state = value as Record<string, unknown>;
    // Set → Array に変換して JSON シリアライズ
    if (state.favoriteSkillNames instanceof Set) {
      state.favoriteSkillNames = [...state.favoriteSkillNames];
    }
    localStorage.setItem(name, JSON.stringify(state));
  },
  removeItem: (name: string) => localStorage.removeItem(name),
};
```

---

### セクション C: CTA 制御ロジック実装ガイド

#### getCtaConfig 関数

```typescript
interface CtaConfig {
  useEnabled: boolean; // 「今すぐ使う」「使う」ボタンの有効/無効
  saveEnabled: boolean; // 「保存して後で使う」ボタンの有効/無効
  improveType: "optional" | "recommended" | "required";
}

// ScoringGate に基づく CTA 有効/無効制御
function getCtaConfig(gate: ScoringGate): CtaConfig {
  switch (gate) {
    case "RECOMMENDED":
    case "USE_ALLOWED":
      return { useEnabled: true, saveEnabled: true, improveType: "optional" };
    case "SAVE_ALLOWED":
      return {
        useEnabled: false,
        saveEnabled: true,
        improveType: "recommended",
      };
    case "NEEDS_IMPROVEMENT":
      return {
        useEnabled: false,
        saveEnabled: false,
        improveType: "required",
      };
  }
}
```

#### CTA マトリクス（16パターン）

| ScoringGate       | 今すぐ使う | 保存して後で使う | 改善する         | 完了      |
| ----------------- | ---------- | ---------------- | ---------------- | --------- |
| RECOMMENDED       | Primary    | Secondary        | Text-link        | Secondary |
| USE_ALLOWED       | Primary    | Secondary        | Text-link        | Secondary |
| SAVE_ALLOWED      | disabled   | Primary          | Secondary (推奨) | Text-link |
| NEEDS_IMPROVEMENT | disabled   | disabled         | Primary (必須)   | disabled  |

#### getCTAVisibility 関数（PostExecutionActionBar 用）

```typescript
interface PostExecutionCTAVisibility {
  rerun: "visible" | "hidden";
  improve: "visible" | "hidden";
  complete: "visible" | "hidden";
  terminal: "visible" | "hidden";
}

function getCTAVisibility(
  gate: ScoringGate,
  hasTerminalAccess: boolean,
): PostExecutionCTAVisibility {
  return {
    rerun:
      gate === "RECOMMENDED" || gate === "USE_ALLOWED" ? "visible" : "hidden",
    improve: "visible", // 全ゲートで改善は表示（ラベルが変化）
    complete: gate !== "NEEDS_IMPROVEMENT" ? "visible" : "hidden",
    terminal: hasTerminalAccess ? "visible" : "hidden",
  };
}
```

---

### セクション D: IPC 連携実装ガイド

#### 使用チャネル一覧

| 操作                | チャネル                  | 新規/既存 | P42 バリデーション必須箇所           |
| ------------------- | ------------------------- | --------- | ------------------------------------ |
| 利用前評価 (EP-3)   | `skill:optimize:evaluate` | 既存      | skillName: 型 → 空文字 → trim 空文字 |
| 利用後再評価 (EP-4) | `skill:optimize:evaluate` | 既存      | skillName: 型 → 空文字 → trim 空文字 |
| スキル一覧取得      | `skill:list`              | 既存      | なし（引数なし）                     |

お気に入りは Zustand persist でローカル管理するため、新規 IPC チャネルは不要。

#### EP-3/EP-4 の区別方法

EP-3（利用前評価）と EP-4（利用後再評価）は同じ `skill:optimize:evaluate` チャネルを使用する。
区別は呼び出し元のコンテキストで行い、IPC レベルでは同一のリクエスト/レスポンス型を使用する。

```typescript
// EP-3: スキル利用前に呼び出し（Skill Center/Workspace から）
const ep3Result = await window.electronAPI.skill.evaluate(skillName);

// EP-4: スキル実行完了後に呼び出し（PostExecutionActionBar から、任意実行）
const ep4Result = await window.electronAPI.skill.evaluate(skillName);
// EP-4 の結果は postExecutionScore に格納し、UI でデルタ表示に使用
```

#### P42 準拠 3段バリデーション

```typescript
// IPC ハンドラ側（Main Process）
ipcMain.handle("skill:optimize:evaluate", async (_event, skillName: string) => {
  // P42: 3段バリデーション
  if (typeof skillName !== "string") {
    throw { code: "VALIDATION_ERROR", message: "skillName must be a string" };
  }
  if (skillName === "") {
    throw { code: "VALIDATION_ERROR", message: "skillName must not be empty" };
  }
  if (skillName.trim() === "") {
    throw {
      code: "VALIDATION_ERROR",
      message: "skillName must not be whitespace only",
    };
  }
  return skillService.evaluate(skillName.trim());
});
```

---

### セクション E: テスト実装の注意点

#### Pitfall 対策一覧

| Pitfall | 対象                              | 対策                                                                              |
| ------- | --------------------------------- | --------------------------------------------------------------------------------- |
| P13     | recentlyUsedSkills の usedAt 更新 | タイマーテストは `advanceTimersByTime` で1ステップずつ進める。`runAllTimers` 禁止 |
| P39     | 全コンポーネントテスト            | happy-dom 環境では `userEvent` を使用せず `fireEvent` を使用                      |
| P41     | ScoreGateBadge                    | インライン arrow function が v8 カバレッジでカウントされることを考慮              |
| P46     | ScoreGateBadge                    | `Omit<HTMLAttributes, "content">` で HTML 標準属性との衝突を回避                  |
| P47     | ScoreGateBadge テスト             | `GATE_BADGE_VARIANT_STYLES` をテスト側で import して期待値を生成                  |
| P48     | 派生セレクタテスト                | `useFavoriteSkills` 等の配列返却セレクタは `useShallow` 適用を検証                |
| P31     | Store セレクタテスト              | 個別セレクタ使用を検証。合成 Hook 使用テストは追加しない                          |

#### テストファイル構成（予定）

```
__tests__/
  components/
    atoms/ScoreGateBadge.test.tsx
    molecules/SkillCard.test.tsx
    organisms/SkillDetailPanel.test.tsx
    organisms/PostExecutionActionBar.test.tsx
  store/
    skillSlice-favorites.test.ts
    skillSlice-recentlyUsed.test.ts
    agentSlice-postExecution.test.ts
  logic/
    getCtaConfig.test.ts
    getCTAVisibility.test.ts
```

#### テスト記述例（P39/P47 準拠）

```typescript
import { fireEvent } from "@testing-library/react";
import { GATE_BADGE_VARIANT_STYLES } from "@/components/atoms/ScoreGateBadge";

describe("ScoreGateBadge", () => {
  it("RECOMMENDED ゲートで推奨スタイルが適用される", () => {
    const { container } = render(
      <ScoreGateBadge gate="RECOMMENDED" score={100} size="md" />,
    );
    const badge = container.querySelector("[data-testid='score-gate-badge']");
    // P47: Record定数をimportして期待値を生成
    expect(badge?.className).toContain(
      GATE_BADGE_VARIANT_STYLES.RECOMMENDED,
    );
  });

  it("NEEDS_IMPROVEMENT ゲートでaria-labelが設定される", () => {
    const { getByLabelText } = render(
      <ScoreGateBadge gate="NEEDS_IMPROVEMENT" score={45} size="sm" />,
    );
    // WCAG 2.1 AA: 色以外の情報伝達手段
    expect(getByLabelText("改善必須: 45点")).toBeDefined();
  });
});
```

---

### セクション F: 画面遷移フロー（実装時参照用）

#### シナリオA: 作成直後 → 即時利用

```
SkillCreator (作成完了)
  → EP-1 採点
  → ScoringGate 判定
  → [USE_ALLOWED/RECOMMENDED] → 「今すぐ使う」CTA (Primary)
  → Workspace (スキル自動選択)
  → Agent (実行)
  → PostExecutionActionBar (再実行/改善/完了/terminal)
```

#### シナリオB: Skill Center → 再利用

```
Skill Center
  → SkillCard 一覧 (ScoreGateBadge 表示)
  → SkillCard クリック → SkillDetailPanel (サイドパネル)
  → 「使う」CTA
  → Workspace (スキル選択)
  → Agent (実行)
  → PostExecutionActionBar
```

#### シナリオC: 履歴 → 再実行

```
Agent 画面 → 履歴タブ
  → 過去実行エントリ選択
  → パラメータ復元
  → 「もう一度使う」CTA
  → Agent (再実行、前回設定復元)
  → PostExecutionActionBar
```

#### 改善フィードバックループ

```
PostExecutionActionBar
  → 「改善する」CTA
  → SkillAnalysisView (skillName + executionResult を受け渡し)
  → Task03 改善フロー
  → EP-2 再採点
  → ScoringGate 再判定
  → Skill Center or Agent (再利用導線に復帰)
```

---

### セクション G: 設定と定数

| 定数名                              | 値    | 用途                              |
| ----------------------------------- | ----- | --------------------------------- |
| `MAX_RECENTLY_USED_SKILLS`          | `20`  | recentlyUsedSkills の最大保持件数 |
| `SCORE_GATE_THRESHOLD_RECOMMENDED`  | `100` | RECOMMENDED ゲート閾値            |
| `SCORE_GATE_THRESHOLD_USE_ALLOWED`  | `80`  | USE_ALLOWED ゲート閾値            |
| `SCORE_GATE_THRESHOLD_SAVE_ALLOWED` | `60`  | SAVE_ALLOWED ゲート閾値           |

---

### セクション H: エラーハンドリング

| エラー種別       | コード範囲 | 対応方針                                                 |
| ---------------- | ---------- | -------------------------------------------------------- |
| VALIDATION_ERROR | 1000-1999  | skillName の3段バリデーション失敗時にユーザーに明示通知  |
| IPC_TIMEOUT      | 3000-3999  | skill:optimize:evaluate のタイムアウト時に再試行導線表示 |
| SKILL_NOT_FOUND  | 2000-2999  | 削除済みスキルの再実行試行時に再作成導線を表示           |

---

### セクション I: 依存タスクとの契約

| 依存先             | 契約内容                                                     | 遵守確認           |
| ------------------ | ------------------------------------------------------------ | ------------------ |
| Task01 画面責務    | Workspace は「文脈準備」のみ。探索一覧は Skill Center で実施 | Phase 3 で確認済み |
| Task04 EP-3/EP-4   | `skill:optimize:evaluate` のI/O型をそのまま使用              | Phase 9 で確認済み |
| Task04 ScoringGate | 4段階ゲート定義をそのまま使用（拡張なし）                    | Phase 2 で確認済み |

---

### セクション J: API 使用例

使用例（Renderer から評価→CTA 判定まで）:

```ts
import {
  getCTAVisibilityFromScore,
  type CTAVisibility,
} from "@repo/shared/types";

async function evaluateAndResolveCta(
  skillName: string,
): Promise<CTAVisibility> {
  const result = await window.electronAPI.skill.evaluatePrompt(skillName);
  const score = result?.data?.score ?? 0;
  return getCTAVisibilityFromScore(score);
}
```

使用例（Phase 11 画面証跡カバレッジ検証）:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/completed-tasks/step-04-seq-task-05-created-skill-usage-journey
```

---

### セクション K: エッジケース

| エッジケース                       | 想定される問題                          | 対処                                                                |
| ---------------------------------- | --------------------------------------- | ------------------------------------------------------------------- |
| スキルが0件                        | Skill Center が空表示で行き止まりになる | Empty State で create 導線を常に表示する                            |
| スコア境界値（59/60/79/80/99/100） | CTA の有効/無効が逆転する               | `getCTAVisibilityFromScore` の境界値テストで固定する                |
| IPC タイムアウト                   | EP-3/EP-4 が完了せず UI が固まる        | `IPC_TIMEOUT` を通知し、再試行導線を出す                            |
| 履歴データ欠損                     | 再実行時にパラメータ復元できない        | `lastExecutionResult` が null のときは default 実行へフォールバック |
