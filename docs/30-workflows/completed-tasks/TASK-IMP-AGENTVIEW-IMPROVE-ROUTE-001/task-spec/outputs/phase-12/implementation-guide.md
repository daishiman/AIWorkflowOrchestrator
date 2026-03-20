# Phase 12: 実装ガイド

## TASK-IMP-AGENTVIEW-IMPROVE-ROUTE-001

---

## Part 1: 概念説明（中学生レベル）

### なぜ必要か

AgentView で実行が終わった直後は、「次に改善を見る」という自然な流れが生まれます。ここで一度 SkillCenter へ戻してしまうと、利用者は何をするかを考え直す必要があり、流れが切れます。

### この機能でできること

たとえば、お店で商品を買った後、「この商品をもっと良くできるかも」と思ったときのことをイメージしてください。

今までは：

1. レジ（AgentView）で商品を受け取る → おしまい
2. もし改善したければ、一度お店の入口（SkillCenter）に戻って、「改善コーナー（SkillAnalysis）」を自分で探す必要があった

今回の改善後：

1. レジ（AgentView）で商品を受け取る
2. レジの横に「改善コーナーに行きませんか？」の案内板（CTAバナー）が出る
3. 案内板をタップすると改善コーナーに直行できる
4. 改善コーナーから「レジに戻る」ボタンで戻れる
5. 改善コーナーから「もう一度実行する」ボタンでレジに戻って再実行もできる

### ポイント

- 案内板は「商品を受け取った後」にだけ出る（実行中や未選択では出ない）
- 従来の「お店の入口に戻る」ボタン（onClose）はそのまま残っている
- レジから来たときだけ「レジに戻る」ボタンが出る。お店の入口から来たときは出ない

---

## Part 2: 開発者向け実装詳細

### 0. 何が変わるか

AgentView 完了画面から `skillAnalysis` へ直接 handoff できるようになり、Agent 起点のときだけ戻り導線と再実行導線が有効になります。UI 追加だけに見えますが、実際には feature state と navigation state の責務を壊さずに round-trip を成立させる変更です。

### 1. TypeScript 型定義

```ts
type ViewType =
  | "dashboard"
  | "workspace"
  | "chat"
  | "agent"
  | "skillCenter"
  | "skillAnalysis";

interface SkillAnalysisViewProps {
  skillName: string;
  onClose: () => void;
  onNavigateBack?: () => void;
  onNavigateToAgent?: () => void;
}
```

### 2. コンポーネント変更

#### SkillAnalysisView.tsx

- Props に `onNavigateBack?: () => void` / `onNavigateToAgent?: () => void` を追加
- オプション props のため後方互換性あり
- `onNavigateBack` 存在時: ヘッダー左に ArrowLeft + 「戻る」リンク
- `onNavigateToAgent` 存在時: フッター右端に「エージェントで再実行」ボタン
- 既存 `onClose` は不変

#### AgentView/index.tsx

- `canOfferAnalysis` を useMemo で導出（3条件: selectedSkillName.trim() 非空 + completed + !isExecuting）
- `handleNavigateToAnalysis` を useCallback で定義（P42 trim 付き）
- CTA バナーを RecentExecutionList の直前に配置
- `useSetCurrentView` / `useSetCurrentSkillName` 個別セレクタで取得（P31 対策）

#### App.tsx

- `viewHistory` をフックで取得
- `skillAnalysis` case 内で `viewHistory[length-2] === "agent"` で Agent 起点判定
- Agent 起点時のみ `onNavigateBack` / `onNavigateToAgent` を注入

### 3. APIシグネチャ / CLIシグネチャ

```ts
const handleNavigateToAnalysis: () => void;
const onNavigateBack: (() => void) | undefined;
const onNavigateToAgent: (() => void) | undefined;
```

```bash
PATH=/opt/homebrew/bin:$PATH /opt/homebrew/bin/pnpm --filter @repo/desktop run screenshot:skill-lifecycle-routing-step03
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js --workflow docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route
```

### 4. CTA 表示条件の導出ロジック

```typescript
const canOfferAnalysis = useMemo(() => {
  if (!selectedSkillName || selectedSkillName.trim().length === 0) return false;
  if (skillExecutionStatus !== "completed") return false;
  if (isExecuting) return false;
  return true;
}, [selectedSkillName, skillExecutionStatus, isExecuting]);
```

### 5. 使用例

```tsx
<SkillAnalysisView
  skillName={currentSkillName ?? "demo-skill"}
  onClose={() => {
    setCurrentView("skillCenter");
    setCurrentSkillName(null);
  }}
  onNavigateBack={isFromAgent ? () => goBack() : undefined}
  onNavigateToAgent={isFromAgent ? () => setCurrentView("agent") : undefined}
/>
```

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js --workflow docs/30-workflows/skill-lifecycle-routing/tasks/step-03-seq-task-04-agentview-improve-route
```

### 6. P31 対策（個別セレクタ）

全ての state / action は個別セレクタで取得:

- `useSelectedSkillName()` / `useSkillExecutionStatus()` / `useIsSkillExecuting()`
- `useSetCurrentView()` / `useSetCurrentSkillName()`（新規追加）

### 7. Agent 起点判定

```typescript
const previousView = Array.isArray(viewHistory)
  ? viewHistory[viewHistory.length - 2]
  : undefined;
const isFromAgent = previousView === "agent";
```

新規 state (`previousView`, `entrySource` 等) は追加しない。既存 `viewHistory` で判定可能。

### 8. エラーハンドリング

| ケース                                 | 処理                                                                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `selectedSkillName` が `null` / 空文字 | `handleNavigateToAnalysis()` は即 return し、CTA も出さない                                    |
| `selectedSkillName` が空白のみ         | `trim()` 後の長さ 0 として扱い、誤遷移を防ぐ                                                   |
| `viewHistory` が不足                   | `onNavigateBack` / `onNavigateToAgent` を `undefined` にし、SkillCenter 起点と同じ表示へ落とす |
| screenshot capture が x64 Node で失敗  | arm64 Node/Pnpm 経路へ切り替え、Phase 11 の証跡を再取得する                                    |

### 9. エッジケース

| ケース                               | 挙動                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------- |
| `selectedSkillName` が空白のみ       | CTA 非表示（P42 trim チェック）                                                          |
| `viewHistory` が1要素のみ            | Agent 起点ではないため optional props は渡さない                                         |
| `onClose` と `onNavigateBack` の共存 | close は `skillCenter`、戻るは `goBack()` で責務を分離する                               |
| `onNavigateToAgent` 実行後の履歴     | `["...", "agent", "skillAnalysis", "agent"]` のように新しい `agent` エントリが追加される |

### 10. 設定項目と定数一覧

| 項目               | 値 / 契約                                        |
| ------------------ | ------------------------------------------------ |
| CTA region label   | `スキル改善提案`                                 |
| CTA button label   | `スキルを分析・改善する`                         |
| destination view   | `skillAnalysis`                                  |
| rerun destination  | `agent`                                          |
| screenshot command | `screenshot:skill-lifecycle-routing-step03`      |
| visual evidence    | `TC-11-01..06` + `phase11-capture-metadata.json` |
