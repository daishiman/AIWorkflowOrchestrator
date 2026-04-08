# Lessons Learned: Skill Wizard Redesign (W2-seq-03a)

> 区分: 教訓記録（lessons-learned）
> タスクID: UT-SKILL-WIZARD-W2-seq-03a
> 完了日: 2026-04-08

---

## タスク概要

| 項目 | 値 |
| --- | --- |
| タスクID | UT-SKILL-WIZARD-W2-seq-03a |
| 完了日 | 2026-04-08 |
| ステータス | Phase 12 完了 / Phase 13 blocked |
| 対象ファイル | `SkillCreateWizard.tsx`, `GenerateStep.tsx`, `CompleteStep.tsx` |
| 成果物 | `docs/30-workflows/W2-seq-03a-skill-create-wizard/` |

---

## 実装パターン（将来参照用）

### Pattern 1: Smart Default Inference（大小文字不問推論）

```typescript
const purposeLower = formData.purpose.toLowerCase();
if (purposeLower.includes('slack')) return { tool: 'slack', ... };
if (purposeLower.includes('github')) return { tool: 'github', ... };
if (purposeLower.includes('notion')) return { tool: 'notion', ... };
```

- 文字列判定は必ず `toLowerCase()` してから `includes()` で検索する
- 大文字 `Slack` / 小文字 `slack` / 混在 `SLACK` のすべてを同等に扱う
- scheduled / realtime / code / structured も同様のパターンで判定

### Pattern 2: State Reset with Preservation（formData保持・生成結果リセット）

`handleRetry()` では以下の分離方針を採用：

- **保持する state**: `formData`（ユーザー入力）
- **リセットする state**: `answers`, `skillPath`, `generationError`

```typescript
const handleRetry = () => {
  // formDataは保持（ユーザー入力を損なわない）
  setAnswers(null);
  setSkillPath(null);
  setGenerationError(null);
  setCurrentStep(STEP_GENERATE); // 生成ステップに戻る
};
```

UXを損なわずリトライ可能にするパターン。ユーザーが入力した情報を再入力させない。

### Pattern 3: Double-call Prevention（二重呼び出し防止）

`generationLockRef`（`useRef`）と `isGenerating`（`useState`）の両方で防止：

```typescript
const generationLockRef = useRef(false);
const [isGenerating, setIsGenerating] = useState(false);

const handleGenerate = async (method: GenerationMethod) => {
  if (generationLockRef.current) return; // Ref: レンダリング非同期に安全
  generationLockRef.current = true;
  setIsGenerating(true); // State: 表示制御（ボタン無効化など）に使用
  try {
    // ...生成処理...
  } finally {
    generationLockRef.current = false;
    setIsGenerating(false);
  }
};
```

- `useRef` はレンダリングサイクルに依存せず即時参照可能（非同期競合に安全）
- `useState` はUIの表示制御（ボタン `disabled` など）にのみ使用
- 両者を組み合わせることで、非同期処理中のUI整合性を保証

### Pattern 4: Wizard Orchestration State（複数 state の責務分離）

```typescript
// Step 0: ユーザー入力
const [formData, setFormData] = useState<SkillInfoFormData | null>(null);
// Step 1: スマートデフォルト（formDataから自動推論）
const [smartDefaults, setSmartDefaults] = useState<SmartDefaultResult | null>(null);
// Step 2: 生成結果（LLM応答）
const [answers, setAnswers] = useState<ConversationAnswers | null>(null);
// Complete: 保存パス
const [skillPath, setSkillPath] = useState<string | null>(null);
```

各 state の責務を明確に分離し、ステップ間のデータフローを一方向に保つ。

### Pattern 5: Conditional External Integration Display（条件付き外部連携表示）

```typescript
// CompleteStep内
const hasExternalIntegration = !!resolveExternalIntegration(formData);
const externalToolName = resolveExternalIntegration(formData)?.toolName ?? null;
```

- `hasExternalIntegration` フラグで外部連携セクションの表示/非表示を制御
- `externalToolName` で「Slack連携が設定されています」などの具体的メッセージ表示

---

## 苦戦箇所

| # | 苦戦箇所 | 再発条件 | 解決策 |
| --- | --- | --- | --- |
| 1 | `inferSmartDefaults()` の大小文字不問対応 | 自然言語入力を文字列判定する場合 | `toLowerCase()` してから `includes()` を使う |
| 2 | `handleGenerate` の二重呼び出し | ユーザーが連打した場合や非同期処理が遅い場合 | `generationLockRef` + `isGenerating` の二重ガード |
| 3 | `handleRetry` でどの state を保持するか | リトライ時のUX設計 | ユーザー入力（`formData`）を保持、生成結果のみリセット |
| 4 | テスト名の表現ゆれ | テストケース追加時 | 「リトライ」に統一（「復帰」「やり直し」は使わない） |

---

## 非ブロッカー改善候補（skill-feedback-report.md より）

### 1. resolveExternalIntegration() のツール名対応表を定数に切り出す

現状は `if-else` や `switch` で判定しているが、ツール名と判定条件の対応表を定数 `EXTERNAL_TOOL_MAP` として切り出すと追加・変更が安全になる。

```typescript
// 例: 切り出し後のイメージ
const EXTERNAL_TOOL_MAP: Array<{ keyword: string; toolName: string }> = [
  { keyword: 'slack', toolName: 'Slack' },
  { keyword: 'github', toolName: 'GitHub' },
  { keyword: 'notion', toolName: 'Notion' },
];
```

### 2. テスト名の「復帰」「やり直し」「リトライ」表現を統一

現状のテスト名に表現ゆれがある。今後は「リトライ」に統一する。

```typescript
// 推奨
it('リトライ時にformDataを保持し生成結果をリセットする')
// 非推奨
it('復帰時にformDataを保持する') // "復帰" は使わない
it('やり直し後に...')           // "やり直し" は使わない
```

### 3. Phase 11 証跡スクリーンショットの命名規則（TC-11-xx-...形式）を明文化

`skillPath` 表示確認や外部連携チェックリスト確認の画像は重要証跡。
命名規則を task spec や index.md に記載する。

```
TC-11-01-complete-step-skill-path-display.png
TC-11-02-complete-step-external-integration.png
TC-11-03-generate-step-retry-button.png
```

---

## 依存関係

| 方向 | タスクID | 内容 |
| --- | --- | --- |
| 先行 | W0-seq-01 | `SkillInfoFormData` / `SmartDefaultResult` 型定義 |
| 先行 | W0-seq-02（UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001） | `inferSmartDefaults()` サービス実装 |
| 先行 | W1-par-02a | `SkillInfoStep`（Step 0 フォーム）実装 |
| 先行 | W1-par-02d | `SkillLifecyclePanel` ウィザード遷移ボタン化 |
| 後続 | W3-seq-04 | Skill生成実行処理（LLM呼び出し実装） |

---

## 関連ファイル

| ファイル | 用途 |
| --- | --- |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | ウィザード本体 |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | 生成ステップ |
| `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | 完了ステップ |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.W2-seq-03a.test.tsx` | W2-seq-03a 単体テスト |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx` | Store統合テスト |
| `docs/30-workflows/W2-seq-03a-skill-create-wizard/` | タスク仕様書ディレクトリ |
| `outputs/phase-12/skill-feedback-report.md` | フィードバックレポート |
