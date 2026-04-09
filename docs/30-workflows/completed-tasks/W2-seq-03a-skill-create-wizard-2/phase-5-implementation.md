# Phase 5: 実装（TDD Green フェーズ）

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 5                                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001                 |
| 機能名     | SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2） |
| 前提Phase  | Phase 4                                                    |
| 後続Phase  | Phase 6                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | 未実施                                                     |

---

## 目的

テストを全 PASS させる最小実装を行う（TDD Green フェーズ）。

## 背景

Phase 4 で作成した Red 状態のテストを Green にする最小実装を行う。`SkillCreateWizard.tsx` を新設計（3 ステップ）で再実装し、`inferSmartDefaults` の統合と NON_VISUAL 計装ポイント 5 つの実装を行う。

---

## 実行タスク

### タスク1: 旧実装の削除・クリーンアップ

**目的**: 旧構成（不要 state を含む旧フロー）の実装を削除する

**実行手順**:

1. Phase 3 の破壊的変更一覧（`outputs/phase-3/breaking-changes.md`）を参照する
2. 以下の state を削除する：
   - `description` state
   - `options` state
   - 旧生成モード state
   - 旧生成モード setter
3. 以下のハンドラを削除する：
   - `handleGenerate()` 旧実装
   - `handleDescribeNext()` の旧生成モード分岐
   - `createSkill(description, options)` 呼び出し
4. `template` 関連の全条件分岐を削除する

**期待される成果物**:

- 旧実装削除済みの `SkillCreateWizard.tsx`

---

### タスク2: 新 state の追加

**目的**: 3 ステップウィザードの状態管理を実装する

**実行手順**:

1. 以下の state を追加する：

```typescript
const [currentStep, setCurrentStep] = useState(0);
const [skillInfoFormData, setSkillInfoFormData] =
  useState<SkillInfoFormData | null>(null);
const [smartDefaults, setSmartDefaults] = useState<SmartDefaultResult | null>(
  null,
);
```

2. 型インポートを追加する（`SkillInfoFormData`、`SmartDefaultResult`、`ConversationAnswers`）

**期待される成果物**:

- 新 state 追加済みの `SkillCreateWizard.tsx`

---

### タスク3: `inferSmartDefaults` の統合実装

**目的**: Step 0 → Step 1 遷移時に `inferSmartDefaults` を呼び出す

**実行手順**:

1. `inferSmartDefaults` のインポートを追加する：
   ```typescript
   import { inferSmartDefaults } from "@repo/shared/services/skillCreator";
   ```
2. Step 0 → Step 1 遷移ハンドラを実装する：
   ```typescript
   const handleSkillInfoNext = async (formData: SkillInfoFormData) => {
     // 計装ポイント 2: Step 0 完了
     trackEvent("wizard:step0:complete", { formData });
     // 計装ポイント 3: inferSmartDefaults 呼び出し
     try {
       const defaults = inferSmartDefaults(formData);
       trackEvent("wizard:smartDefaults:result", { defaults });
       setSmartDefaults(defaults);
     } catch (e) {
       setSmartDefaults(null);
     }
     setSkillInfoFormData(formData);
     setCurrentStep(1);
   };
   ```

**期待される成果物**:

- `inferSmartDefaults` 統合済みの `SkillCreateWizard.tsx`

---

### タスク4: NON_VISUAL 計装ポイント 5 つの実装

**目的**: 5 つの計装ポイントを実装する

**実行手順**:

1. `trackEvent` スタブ関数を定義する：
   ```typescript
   const trackEvent = (event: string, data?: unknown) => {
     console.log(event, data);
   };
   ```
2. 各計装ポイントにログ出力を追加する：
   - 計装1: `useEffect` でウィザード開始時に `wizard:start`
   - 計装2: `handleSkillInfoNext` 内で `wizard:step0:complete`
   - 計装3: `inferSmartDefaults` 結果で `wizard:smartDefaults:result`
   - 計装4: Step 1 完了時に `wizard:step1:complete`
   - 計装5: CompleteStep への遷移時に `wizard:complete`

**期待される成果物**:

- 計装ポイント 5 つ実装済みの `SkillCreateWizard.tsx`

---

### タスク5: 3 ステップ UI の実装

**目的**: `SkillInfoStep / ConversationRoundStep / CompleteStep` を統合する

**実行手順**:

1. Step 0: `<SkillInfoStep onNext={handleSkillInfoNext} />` をレンダリングする
2. Step 1: `<ConversationRoundStep smartDefaults={smartDefaults} onNext={handleConversationNext} />` をレンダリングする
3. Step 2: `<CompleteStep onClose={onClose} />` をレンダリングする
4. `currentStep` の値に応じてステップを切り替える条件分岐を実装する

**期待される成果物**:

- 3 ステップ UI 実装済みの `SkillCreateWizard.tsx`

---

### タスク6: テストが全 PASS することを確認

**目的**: TDD Green 状態を確認する

**実行手順**:

1. `pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` を実行する
2. 全テストが Green（成功）であることを確認する
3. 失敗するテストがあれば実装を修正する

**期待される成果物**:

- `outputs/phase-5/implementation-record.md`（Green 確認記録）

---

## 参照資料

| 参照資料                   | パス                                                                                        | 内容                   |
| -------------------------- | ------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 2 設計書             | `outputs/phase-2/component-design.md`                                                       | 実装設計               |
| Phase 3 破壊的変更一覧     | `outputs/phase-3/breaking-changes.md`                                                       | 削除対象               |
| Phase 4 テストケース       | `outputs/phase-4/test-cases.md`                                                             | TC-01〜TC-15           |
| 推論サービス export        | `packages/shared/src/services/skillCreator/index.ts`                                        | インポートパス確認     |
| アーキテクチャパターン P31 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 無限ループ防止         |
| アーキテクチャパターン P42 | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | バリデーション漏れ防止 |

---

## 成果物

| 成果物                        | パス                                                               | 内容                    |
| ----------------------------- | ------------------------------------------------------------------ | ----------------------- |
| 再実装コンポーネント（Green） | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | 全テスト Green の新実装 |
| 実装記録                      | `outputs/phase-5/implementation-record.md`                         | Green 確認記録          |

---

## TDD 検証

### TDD サイクル確認

```bash
# テスト実行コマンド（Green 確認）
cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

**確認項目**:

- [ ] テストが成功することを確認（Green 状態）

---

## 統合テスト連携

- `inferSmartDefaults` mock が正しく呼ばれることを確認する
- Wave 1 コンポーネントとの Props 接続が正しく動作することを確認する

---

## 完了条件

- [ ] 旧 state（`description`/`options`/旧生成モード）が削除されていること
- [ ] 新 state（`currentStep`/`skillInfoFormData`/`smartDefaults`）が追加されていること
- [ ] `inferSmartDefaults` のインポートと呼び出しが実装されていること
- [ ] NON_VISUAL 計装ポイント 5 つが実装されていること
- [ ] 3 ステップ UI（SkillInfoStep / ConversationRoundStep / CompleteStep）が動作すること
- [ ] `pnpm vitest run` で全テストが Green（成功）であることを確認していること
- [ ] P31（無限ループ）・P42（バリデーション漏れ）対策が適用されていること
- [ ] 成果物（SkillCreateWizard.tsx / implementation-record.md）が作成されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 4（テスト作成・Red 状態確認）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/W2-seq-03a-skill-create-wizard-2/phase-6-test-expansion.md`
