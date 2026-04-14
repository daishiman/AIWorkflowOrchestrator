# Phase 8: リファクタリング記録

## タスク: TASK-SW-FIX-STATE-DETAIL-001

## Task 1: 命名整理

### 確認結果

| 変数/関数名                | ファイル                  | 判定 | 備考                                                                         |
| -------------------------- | ------------------------- | ---- | ---------------------------------------------------------------------------- |
| `internalAnswers`          | ConversationRoundStep.tsx | OK   | 内部状態を明示する命名で一貫                                                 |
| `isInternalChangeRef`      | ConversationRoundStep.tsx | OK   | `Ref` suffix でrefであることが明示されている                                 |
| `q5SeriRef`                | SkillCreateWizard.tsx     | OK   | `Seri` はserializeの略。短すぎる可能性があるが既存コードの命名スタイルと一致 |
| `generationLockRef`        | SkillCreateWizard.tsx     | OK   | 既存変数名を変更なし。lockedの意味が明確                                     |
| `showTemplateCancelButton` | GenerateStep.tsx          | OK   | 表示条件を直接記述する命名で可読性高                                         |

**変更なし** — 命名は一貫しており変更不要

### ハンドラー名確認

| 箇所                               | 命名                   | 判定 |
| ---------------------------------- | ---------------------- | ---- |
| `onCancel` prop (GenerateStep)     | camelCase, "on" prefix | OK   |
| `onCancelPlan` prop (GenerateStep) | camelCase, "on" prefix | OK   |

**変更なし**

## Task 2: useEffect 依存配列の整理

### ConversationRoundStep.tsx

```tsx
// Effect 1: 内部状態 → 親通知
useEffect(() => {
  isInternalChangeRef.current = true;
  onAnswersChange(internalAnswers);
}, [internalAnswers, onAnswersChange]);

// Effect 2: 親 prop → 内部リセット
useEffect(() => {
  if (isInternalChangeRef.current) {
    isInternalChangeRef.current = false;
    return;
  }
  setInternalAnswers(
    applySmartDefaults(answers ?? createEmptyAnswers(), smartDefaults),
  );
}, [answers, smartDefaults]);
```

**判定: 最小限** — 各 effect の deps は実際に使用する値のみ含まれている

- Effect 1: `internalAnswers`（変化の源）、`onAnswersChange`（コールバック、安定性確保のため）
- Effect 2: `answers`（外部変化検出）、`smartDefaults`（デフォルト適用に必要）

exhaustive-deps ルール: 準拠。`isInternalChangeRef` は ref のため deps 不要（React の仕様）

### SkillCreateWizard.tsx

```tsx
// q5 変化検出 effect
useEffect(() => {
  const q5Ser = JSON.stringify(answers.q5);
  if (q5Ser === q5SeriRef.current) return;
  q5SeriRef.current = q5Ser;
  const defaults = smartDefaults ?? DEFAULT_SMART_DEFAULTS;
  const integration = resolveExternalIntegration(answers.q5, defaults.tool);
  setHasExternalIntegration(integration.hasExternalIntegration);
  setExternalToolName(integration.externalToolName);
}, [answers, smartDefaults]);
```

**判定: 最小限** — `answers` を dep にすることで q5 変化を含む全 answers 変化を監視。内部で `q5SeriRef` による content diff を取ることで不要な再計算を防止

exhaustive-deps ルール: `q5SeriRef` は ref のため deps 不要。他は全て使用変数。準拠

## Task 3: ロジック重複の除去

### resolveExternalIntegration 呼び出し箇所

検索結果: SkillCreateWizard.tsx 内で2箇所の呼び出しが存在するかを確認した。

| 箇所                          | 目的                   | 判定     |
| ----------------------------- | ---------------------- | -------- |
| 初期化時（問題18修正 effect） | q5変化時の再計算       | 新規追加 |
| 生成完了時 or 遷移時          | 完了画面表示時の値設定 | 既存     |

重複ではなく責務が異なる呼び出しのため、共通化は不要と判断。

### generationLockRef リセット処理

`generationLockRef.current = false` は `handleGenerate` の `finally` ブロック内の1箇所のみ。重複なし。

## 最小複雑性の判断理由

| 修正項目                   | 複雑性 | 判断理由                                                                    |
| -------------------------- | ------ | --------------------------------------------------------------------------- |
| 問題12: useEffect 分割     | 低     | 既存の1 effect を2 effect に分割するだけ。`isInternalChangeRef` は3行の追加 |
| 問題13: mode prop 追加     | 低     | オプショナル prop 1つと JSX 条件分岐1つのみ                                 |
| 問題18: q5SeriRef + effect | 低     | ref 1つ + effect 1つ（約10行）。`JSON.stringify` は標準API                  |
| 問題19: finally 順序変更   | 最低   | 2行の移動のみ                                                               |

**結論**: 4件の修正はすべて最小変更量で実装されており、リファクタリングによる複雑性削減の余地はない。
