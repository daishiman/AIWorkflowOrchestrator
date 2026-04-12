# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                            |
| ---------- | --------------------------------------------------------------- |
| Phase      | 8                                                               |
| 前提 Phase | 7（カバレッジ確認）                                             |
| 後続 Phase | 9（品質保証）                                                   |
| タスクID   | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                           |
| タスク分類 | NON_VISUAL（Renderer 内部の計装のみ / 視覚差分なし）            |
| 担当 AC    | なし（品質向上目的。AC-7〜AC-9 のカバレッジを低下させないこと） |

---

## 目的

Phase 5 で挿入した計装コードを対象に、重複パターンの除去と命名揺れの修正を行う。
UI の見た目・動作・テスト結果には一切影響を与えない純粋なリファクタリングのみを行う。
リファクタリング後は Phase 7 で達成したカバレッジ目標（trackEvent.ts 100% /
SkillCreateWizard.tsx 90%+ / CompleteStep.tsx 90%+）を維持すること。

---

## 実行タスク

### タスク 1: 計装コードの重複除去

#### 手順 1-1: `SkillCreateWizard.tsx` の計装コードで重複パターンを特定する

Phase 5 の実装後、`SkillCreateWizard.tsx` には以下の `trackEvent` 呼び出しが存在する：

1. `useEffect` 内: `trackEvent("skill_wizard_open", { source: source ?? 'direct' })`
2. クリーンアップ内: `trackEvent("skill_wizard_abandon", { lastStep: currentStepRef.current })`
3. `handleStep0Next` 内: `trackEvent("skill_wizard_step_complete", { step: 0, stepName: "スキル情報入力" })`
4. `handleStep0NextFromLlm` 内: `trackEvent("skill_wizard_step_complete", { step: 0, stepName: "スキル情報入力" })`
5. `handleGenerate` 内 Step 1: `trackEvent("skill_wizard_step_complete", { step: 1, stepName: "詳細設定" })`
6. `handleGenerate` 内 Step 2: `trackEvent("skill_wizard_step_complete", { step: 2, stepName: "生成" })`
7. `handleExecutePlan` 内 Step 2: `trackEvent("skill_wizard_step_complete", { step: 2, stepName: "生成" })`

以下の重複パターンを確認する：

- **重複A**: 呼び出し 3 と 4 は同一のペイロード `{ step: 0, stepName: "スキル情報入力" }` を持つ。
  `handleStep0Next` と `handleStep0NextFromLlm` は両方とも Step 0 完了イベントを発火している。
- **重複B**: 呼び出し 6 と 7 は同一のペイロード `{ step: 2, stepName: "生成" }` を持つ。
  `handleGenerate` と `handleExecutePlan` の両方で Step 2 完了イベントを発火している。

#### 手順 1-2: 共通ロジックの切り出しを判断する

**重複A（Step 0 完了）の対処**:

`handleStep0Next` と `handleStep0NextFromLlm` は処理内容が異なるため、
関数として統合することは適切でない。
`STEPS[0]` を直接参照することで `stepName` の文字列リテラル重複を除去する：

```typescript
// Before（2箇所に同一文字列リテラル）
trackEvent("skill_wizard_step_complete", {
  step: 0,
  stepName: "スキル情報入力",
});

// After（STEPS 配列から参照）
trackEvent("skill_wizard_step_complete", { step: 0, stepName: STEPS[0] });
```

`STEPS` は同一ファイルに定義済みの定数（`export const STEPS = ["スキル情報入力", "詳細設定", "生成", "完了"]`）
であるため、追加の依存関係は発生しない。

同様に Step 1 / Step 2 も `STEPS[1]` / `STEPS[2]` に置き換える：

```typescript
trackEvent("skill_wizard_step_complete", { step: 1, stepName: STEPS[1] });
trackEvent("skill_wizard_step_complete", { step: 2, stepName: STEPS[2] });
```

**重複B（Step 2 完了の 2 箇所）の対処**:

`handleGenerate`（テンプレートモード）と `handleExecutePlan`（LLM モード）の両方に
`trackEvent("skill_wizard_step_complete", { step: 2, stepName: STEPS[2] })` が存在する。
この 2 箇所は呼び出し文脈が異なる（別の async 関数内）ため、
ヘルパー関数への抽出は over-abstraction となる。
`STEPS[2]` による参照統一のみとし、関数化は行わない。

#### 手順 1-3: `useRef` の命名を確認する

Phase 5 で追加した `useRef` の変数名を確認し、既存の `useRef` 変数との一貫性を確認する：

| 変数名                           | 型                | 役割                                |
| -------------------------------- | ----------------- | ----------------------------------- |
| `wizardCompletedRef`             | `useRef<boolean>` | 完了ステップ到達フラグ              |
| `currentStepRef`                 | `useRef<number>`  | クロージャ外からの currentStep 参照 |
| `generationLockRef`              | `useRef<boolean>` | 生成二重呼出防止（既存）            |
| `llmGenerationRequestIdRef`      | `useRef<number>`  | LLM リクエスト ID（既存）           |
| `templateGenerationRequestIdRef` | `useRef<number>`  | テンプレートリクエスト ID（既存）   |

命名に揺れがないこと（`Ref` サフィックスの統一）を確認する。
問題がなければ変更不要。

---

### タスク 2: 命名揺れ修正

#### 手順 2-1: `skill_wizard_` プレフィックスの一貫性を確認する

`trackEvent.ts` の `SkillWizardEvents` 型に定義されているすべてのキーを列挙し、
プレフィックスの一貫性を確認する。

確認対象キー一覧（Phase 5 実装後の想定）:

```
skill_wizard_started
skill_wizard_step1_completed
skill_wizard_generation_completed
skill_skeleton_quality_feedback
skill_wizard_next_action
skill_wizard_open
skill_wizard_step_complete
skill_wizard_abandon
```

`skill_skeleton_quality_feedback` は `skill_wizard_` プレフィックスを持たない。
これは既存イベントであり Wave 3 の変更スコープ外であるため、本タスクでは変更しない。
（変更する場合は既存の呼び出し箇所が Breaking Change になるため、別タスクで扱う。）

その他のキーに `skill_wizard_` プレフィックスが付いていることを確認する。
問題がなければ変更不要。

#### 手順 2-2: ペイロードキー名の一貫性を確認する

以下のテーブルで各イベントのペイロードキー名を確認し、命名揺れがないことを検証する。

| 対象                                      | Before                                  | After     | 理由                                                                               |
| ----------------------------------------- | --------------------------------------- | --------- | ---------------------------------------------------------------------------------- |
| `skill_wizard_step_complete` のキー名     | `step: number`                          | 変更なし  | `stepNumber` より `step` が簡潔でコンポーネント側の変数名とも一致しており変更不要  |
| `skill_wizard_step_complete` のキー名     | `stepName: string`                      | 変更なし  | `name` や `label` より意味が明確なため変更不要                                     |
| `skill_wizard_open` のキー名              | `source: 'lifecycle_panel' \| 'direct'` | 変更なし  | `origin` でも可だが既存テストが `source` で書かれているため変更不要                |
| `skill_wizard_abandon` のキー名           | `lastStep: number`                      | 変更なし  | `currentStep` や `stepIndex` より「最後にいたステップ」の意図が明確なため変更不要  |
| `skill_wizard_next_action` の `action` 値 | `"open_editor"`                         | `"edit"`  | タスク要件（AC-3）で `'edit'` と定義されているため Phase 5 で変更済み。再確認のみ  |
| `skill_wizard_next_action` の `action` 値 | `"create_another"`                      | `"close"` | タスク要件（AC-3）で `'close'` と定義されているため Phase 5 で変更済み。再確認のみ |

「変更なし」の行は確認のみ行い、実際のファイル変更は発生しない。
「Phase 5 で変更済み」の行は、Phase 5 の変更が正しく反映されているかを確認する。

確認方法:

```bash
# trackEvent.ts の skill_wizard_next_action 型を確認する
grep -A 3 "skill_wizard_next_action" \
  apps/desktop/src/renderer/utils/trackEvent.ts
```

出力に `action: 'edit' | 'execute' | 'close'` が含まれていることを確認する。

#### 手順 2-3: `CompleteStep.tsx` の `nextActions` 配列の `action` 値を確認する

```bash
grep -A 5 "action:" \
  apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx
```

以下の 3 値がすべて存在することを確認する：

- `action: "execute" as const`
- `action: "edit" as const`
- `action: "close" as const`

1 つでも欠けている場合は Phase 5 の実装が不完全であるため、Phase 5 へ戻って修正する。

---

### タスク 3: リファクタリング後の検証

#### 手順 3-1: TypeScript 型チェックを実行する

```bash
pnpm --filter @repo/desktop typecheck
```

エラー件数が 0 であることを確認する。
エラーが出た場合は、エラーメッセージのファイル名・行番号・内容を読み、
対応する箇所を修正してから再実行する。

#### 手順 3-2: 全テストが PASS することを確認する（回帰なし）

```bash
pnpm --filter @repo/desktop test:run
```

失敗したテストケースが 0 件であることを確認する。
失敗したテストがある場合は、リファクタリングの変更内容（STEPS 参照への置き換えなど）が
テストの期待値と一致しているか確認し、テストまたは実装を修正する。

#### 手順 3-3: カバレッジが維持されていることを確認する

```bash
pnpm --filter @repo/desktop test:coverage -- \
  --coverage.include="src/renderer/utils/trackEvent.ts" \
  --coverage.include="src/renderer/components/skill/SkillCreateWizard.tsx" \
  --coverage.include="src/renderer/components/skill/wizard/CompleteStep.tsx"
```

Phase 7 で達成した以下の数値が維持されていることを確認する：

| ファイル                | 目標     |
| ----------------------- | -------- |
| `trackEvent.ts`         | 100%     |
| `SkillCreateWizard.tsx` | 90% 以上 |
| `CompleteStep.tsx`      | 90% 以上 |

数値が低下した場合は、リファクタリングによってテストの実行パスが変わっていないか確認し、
必要であれば Phase 6 へ戻ってテストを修正する。

---

## 完了条件

- [ ] `STEPS[0]` / `STEPS[1]` / `STEPS[2]` 参照への置き換えが完了し、文字列リテラルの重複が除去されている
- [ ] `skill_wizard_next_action` の `action` 値が `'edit' | 'execute' | 'close'` であることを確認した
- [ ] `CompleteStep.tsx` の `nextActions` 配列の `action` 値がすべて正しいことを確認した
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS する（エラー 0 件）
- [ ] `pnpm --filter @repo/desktop test:run` が全 PASS する（回帰なし）
- [ ] カバレッジが Phase 7 の達成値以上を維持している（trackEvent.ts 100% / SkillCreateWizard.tsx 90%+ / CompleteStep.tsx 90%+）
