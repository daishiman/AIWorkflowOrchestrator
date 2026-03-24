# TASK-SC-06-UI-RUNTIME-CONNECTION 実装ガイド

## Part 1: 中学生レベル概念説明

### 1. スキル自動生成フローとは（日常の例え）

**「料理店で注文するイメージ」**

この機能は、ふつうの料理店ではなく「おまかせ専門の料理店」に行くようなものです。

| 料理店での出来事                                       | アプリでの出来事                                                |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| お客さんが「おまかせで何か美味しいものをお願い」と言う | ユーザーが「何を自動化したいか」を自然言語で伝える              |
| シェフが「今日のおすすめコースはこちらです」と提案する | AI（planSkill）が「こんな手順でやってみましょう」と計画を立てる |
| お客さんが「それでお願いします」とコース料理を注文する | ユーザーが「それでお願い」と承認する                            |
| シェフが料理を作る                                     | AI（executePlan）が実際にスキルを生成する                       |
| 料理が提供される                                       | 完成したスキルがスキルリストに追加される                        |

---

### 2. Terminal Handoff とは

**「料理店が材料切れで、別の店を紹介するイメージ」**

料理店に行ったとき、シェフが「すみません、この料理に必要な材料が今日はうちにはないんです。でも、向かいのお店に行けば手に入りますよ」と教えてくれることがあります。

Terminal Handoff はこれと同じです。

- AI が「この要求は自分では対応できないけど、CLI で実行すればできますよ」と案内する
- TerminalHandoff ガイダンスに CLI コマンドが表示される
- ユーザーはターミナルでコマンドを手動実行する

AI が全部やってくれるわけではないけど、「何をすればいいか」はちゃんと教えてくれるのがポイントです。

---

### 3. フロー図（テキスト形式）

```
ユーザーが「方針を決める」クリック
      |
      v
detectMode（このタスクはどのモード？）
      |
      v
plan モード --> planSkill（AIが計画立案）
      |
      v
+-- integrated_api --> 計画表示 --> ユーザー承認 --> executePlan --> スキル完成
|
+-- terminal_handoff --> CLIガイダンス表示 --> ユーザーが手動実行
```

---

### なぜ「ローカル状態」と「Zustand Store」を両方使うのか？

料理店で例えると:

- **ローカル状態（`localPlanResult`）**: テーブルの上に置いたメニュー表。すぐ見えるが他のテーブルとは共有しない
- **Zustand Store（`currentPlanResult`）**: 厨房の大きなホワイトボード。すべてのスタッフが共有している

画面の即時反応には手元のメニュー表（ローカル状態）を使い、「計画が確定した」という事実は厨房のホワイトボード（Store）に記録します。`activePlanResult = localPlanResult ?? storePlanResult` という式がこの「どちらかを使う」仕組みを表しています。

---

## Part 2: 開発者向け実装詳細

### 1. 変更ファイル一覧

| ファイル                                                             | 変更内容                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | `handlePrepare()` 拡張: detectMode 後に planSkill を呼び出す条件分岐追加。`handleExecutePlan()` / `handleCancelPlan()` 追加。`integrated_api` / `terminal_handoff` の結果表示 JSX 追加                                                                                                            |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`               | `PlanResult` 型追加 + 5 フィールド追加（`isGenerating`, `generationProgress`, `generationError`, `currentPlanId`, `currentPlanResult`）+ 6 アクション追加（`setIsGenerating`, `setGenerationProgress`, `setGenerationError`, `setCurrentPlanId`, `setCurrentPlanResult`, `clearGenerationState`） |
| `apps/desktop/src/renderer/store/index.ts`                           | 11 個の個別セレクタ追加（P31 対策）                                                                                                                                                                                                                                                               |

---

### 2. Zustand 個別セレクタの設計（P31 対策）

合成 Hook の戻り値関数を `useEffect` 依存配列に渡すと無限ループが発生する（P31）。本実装では個別セレクタを使用:

```typescript
// 正しい使い方（個別セレクタ）
const isGenerating = useIsSkillGenerating(); // プリミティブ値
const clearState = useClearGenerationState(); // Zustand 安定参照

// 禁止（合成 Hook の戻り値関数）
const { clearGenerationState } = useAgentStore(); // 毎回新しい参照の可能性
```

**状態セレクタ（5個）**（`store/index.ts` L846-L859）

```typescript
export const useIsSkillGenerating = () =>
  useAppStore((state) => state.isGenerating);
export const useGenerationProgress = () =>
  useAppStore((state) => state.generationProgress);
export const useGenerationError = () =>
  useAppStore((state) => state.generationError);
export const useCurrentPlanId = () =>
  useAppStore((state) => state.currentPlanId);
export const useCurrentPlanResult = () =>
  useAppStore((state) => state.currentPlanResult);
```

**アクションセレクタ（6個）**（`store/index.ts` L863-L879）

```typescript
export const useSetIsSkillGenerating = () =>
  useAppStore((state) => state.setIsGenerating);
export const useSetGenerationProgress = () =>
  useAppStore((state) => state.setGenerationProgress);
export const useSetGenerationError = () =>
  useAppStore((state) => state.setGenerationError);
export const useSetCurrentPlanId = () =>
  useAppStore((state) => state.setCurrentPlanId);
export const useSetCurrentPlanResult = () =>
  useAppStore((state) => state.setCurrentPlanResult);
export const useClearGenerationState = () =>
  useAppStore((state) => state.clearGenerationState);
```

**禁止パターン**

```typescript
// 禁止: 合成 Hook の戻り値関数を依存配列に含めると無限ループ
const { clearGenerationState } = useAgentStore();
useEffect(() => {
  clearGenerationState();
}, [clearGenerationState]); // 無限ループ

// 正しい: 個別セレクタを使用
const clearGenerationState = useClearGenerationState();
useEffect(() => {
  clearGenerationState();
}, [clearGenerationState]); // 安定した参照
```

---

### 3. isGenerating ガード（R-1 対応）

`handlePrepare` / `handlePlanSkill` 冒頭に二重呼出防止ガード（`SkillLifecyclePanel.tsx` L329-L330）:

```typescript
const handlePrepare = async () => {
  const trimmedRequest = request.trim();
  if (!trimmedRequest) {
    setLocalError("まず作りたいスキルの依頼文を入力してください。");
    return;
  }

  // R-1: isGenerating ガード（二重呼出防止）
  if (isGenerating) return;

  // ... 以降の処理
};
```

ユーザーが「方針を決める」ボタンを連打しても IPC が重複して呼ばれることを防ぐ。

---

### 4. clearGenerationState の設計

5 フィールドを一括リセット（`agentSlice.ts` L1216-L1223）:

```typescript
clearGenerationState: () =>
  set({
    isGenerating: false,
    generationProgress: null,
    generationError: null,
    currentPlanId: null,
    currentPlanResult: null,
  }),
```

計画キャンセル時（`handleCancelPlan`）と実行完了時（`handleExecutePlan`）の両方で使用する。

---

### 5. Hybrid State Pattern

テスト環境（store mock が実際に state を更新しない）と実コンポーネントの state 管理を両立するため `localState ?? storeState` パターンを使用（`SkillLifecyclePanel.tsx` L210-L214）:

```typescript
// ローカル state（即座にUI反映）
const [localPlanResult, setLocalPlanResult] = useState<PlanResult | null>(null);
// Store state（クロスコンポーネント共有用）
const storePlanResult = useCurrentPlanResult();
// 表示時: ローカル優先
const activePlanResult = localPlanResult ?? storePlanResult;
```

**設計意図**: `planSkill` が返した結果はローカル状態に即座に反映して UI を更新しつつ、同時に Store にも記録する。`executePlan` 完了後は `setLocalPlanResult(null)` と `clearGenerationState()` の両方を呼んで完全にクリアする。

---

### handlePrepare の拡張フロー

```
handlePrepare()
  |-- trimmedRequest が空 --> エラー表示
  |-- isGenerating が true --> 即 return（R-1 ガード）
  |-- getSkillCreatorApi() が null --> "create" モードにフォールバック
  |-- detectMode() 呼出し
      |-- result.data === "plan" --> planSkill() を自動呼出し
      |   |-- setIsGenerating(true)
      |   |-- setGenerationProgress("計画を生成中...")
      |   |-- planSkill(trimmedRequest) 呼出し
      |   |-- 成功 --> setLocalPlanResult + setCurrentPlanResult + setCurrentPlanId
      |   |-- 失敗 --> setGenerationError
      |   |-- finally: setIsGenerating(false) + setGenerationProgress(null)
      |-- 他モード --> setDetectedMode + セッションエントリ追加
```

### handleExecutePlan のフロー

```typescript
const handleExecutePlan = async () => {
  const planId = storePlanId ?? activePlanResult?.planId;
  if (!planId) return;
  // ...
  setIsGenerating(true);
  const result = await skillCreatorApi.executePlan(planId);
  // 成功 --> fetchSkills() --> selectSkillByName() --> localPlanResult クリア --> clearGenerationState()
  // 失敗 --> setGenerationError
  // finally: setIsGenerating(false)
};
```

`planId` は `storePlanId ?? activePlanResult?.planId` の順で取得する。実行成功後は `fetchSkills()` でスキル一覧を更新し、`selectSkillByName()` で生成されたスキルを自動選択する。

### Terminal Handoff の表示条件

```typescript
// integrated_api の場合: 生成計画パネルを表示
activePlanResult?.type === "integrated_api";

// terminal_handoff の場合: guidance が存在する場合のみ表示
activePlanResult?.type === "terminal_handoff" && activePlanResult.guidance;
```

Terminal Handoff は「AI が CLI での実行を推奨する」ケース。`guidance.reason` に理由、`guidance.command` に実行すべきコマンドが入る。コマンドは `<code>` タグでインラインに表示する。
