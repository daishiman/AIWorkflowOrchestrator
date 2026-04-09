# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 2                                                          |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001                 |
| 機能名     | SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2） |
| 前提Phase  | Phase 1                                                    |
| 後続Phase  | Phase 3                                                    |
| 作成日     | 2026-04-08                                                 |
| ステータス | 未実施                                                     |

---

## 目的

`SkillCreateWizard.tsx` の再設計を確定する。

## 背景

Phase 1 で確定した受け入れ基準（AC-01〜AC-07）に基づき、新設計の `SkillCreateWizard.tsx` を設計する。ステップ状態管理方式、`inferSmartDefaults` の呼び出しタイミング、NON_VISUAL 計装ポイント 5 つの配置を決定する。

---

## 実行タスク

### タスク1: コンポーネント Props インターフェース設計

**目的**: `SkillCreateWizardProps` を設計する

**実行手順**:

1. `SkillCreateWizard` が受け取る Props を定義する
2. `onClose` / `isOpen` 等の必須 Props を確認する
3. Wave 1 コンポーネントの Props 仕様と整合を確認する
4. TypeScript インターフェースとして記述する

**期待される成果物**:

- Props インターフェース定義（`outputs/phase-2/component-design.md` 内）

---

### タスク2: ステップ状態管理方式の決定

**目的**: `useState` vs Zustand slice のどちらを採用するか決定する

**実行手順**:

1. ウィザード内部のみで完結する状態か、外部参照が必要か確認する
2. `useState` 採用のメリット・デメリットを評価する
3. Zustand slice 採用のメリット・デメリットを評価する
4. **推奨**: まず `useState` で実装し、必要に応じて移行する方針を確定する
5. 判断結果を `outputs/phase-2/state-management-decision.md` に記録する

**管理する状態**:

```typescript
const [currentStep, setCurrentStep] = useState(0);
const [skillInfoFormData, setSkillInfoFormData] =
  useState<SkillInfoFormData | null>(null);
const [smartDefaults, setSmartDefaults] = useState<SmartDefaultResult | null>(
  null,
);
```

**期待される成果物**:

- `outputs/phase-2/state-management-decision.md`

---

### タスク3: `inferSmartDefaults` 呼び出し設計

**目的**: 呼び出しタイミングと `SmartDefaultResult` の受け渡し方式を確定する

**実行手順**:

1. Step 0 → Step 1 遷移時に呼び出す方式を設計する
2. Props 経由の受け渡しフローを設計する
3. エラー時のフォールバック挙動を設計する（null を返す / デフォルト値を使う）
4. インポートパスを確認する（`@repo/shared/services/skillCreator`）

**設計方針**:

- Props 経由（推奨）: `SkillCreateWizard` 側で `inferSmartDefaults(formData)` を実行し、結果を `ConversationRoundStep` の Props として渡す
- Context 経由は Step が 3 つより深くネストする場合のみ検討
- Store 経由は外部参照が必要になった時点で移行

**期待される成果物**:

- `inferSmartDefaults` 呼び出しフロー設計（`outputs/phase-2/component-design.md` 内）

---

### タスク4: NON_VISUAL 計装ポイント 5 つの定義

**目的**: 5 つの計装ポイントの配置と実装方式を確定する

**実行手順**:

1. 計装ポイント 5 つを具体的に定義する
2. `console.log` または `trackEvent` スタブの使用方針を決める
3. Wave 3 の `trackEvent` 本実装への差し替え方針を設計する

**計装ポイント定義**:

| ポイント | 発生タイミング                    | ログ内容                           |
| -------- | --------------------------------- | ---------------------------------- |
| 計装1    | ウィザード開始時                  | `wizard:start` イベント            |
| 計装2    | Step 0 完了時                     | `wizard:step0:complete` + formData |
| 計装3    | `inferSmartDefaults` 呼び出し結果 | `wizard:smartDefaults:result`      |
| 計装4    | Step 1 完了時                     | `wizard:step1:complete` + answers  |
| 計装5    | ウィザード完了時                  | `wizard:complete` イベント         |

**期待される成果物**:

- `outputs/phase-2/instrumentation-points.md`

---

### タスク5: 設計書の作成

**目的**: Phase 2 の設計内容を `outputs/phase-2/component-design.md` に記録する

**実行手順**:

1. Props インターフェース設計を記録する
2. 状態管理設計を記録する
3. `inferSmartDefaults` 呼び出しフローを記録する
4. 計装ポイント 5 つを記録する
5. コンポーネント構造図を記録する

**期待される成果物**:

- `outputs/phase-2/component-design.md`

---

## 参照資料

| 参照資料               | パス                                                                                        | 内容                                   |
| ---------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 1 受け入れ基準   | `outputs/phase-1/acceptance-criteria.md`                                                    | AC-01〜AC-07                           |
| 推論サービス本体       | `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`                 | `inferSmartDefaults` API 仕様          |
| 推論サービス export    | `packages/shared/src/services/skillCreator/index.ts`                                        | export 確認                            |
| 共有型定義             | `packages/shared/src/types/skillCreator.ts`                                                 | SkillInfoFormData / SmartDefaultResult |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | S26 パターン                           |

---

## 成果物

| 成果物               | パス                                           | 内容                            |
| -------------------- | ---------------------------------------------- | ------------------------------- |
| コンポーネント設計書 | `outputs/phase-2/component-design.md`          | Props / 状態管理 / 計装ポイント |
| 状態管理決定記録     | `outputs/phase-2/state-management-decision.md` | useState vs Zustand の判断理由  |
| 計装ポイント定義     | `outputs/phase-2/instrumentation-points.md`    | 5 つの計装ポイント詳細          |

---

## 統合テスト連携

- Props 契約（`SkillCreateWizardProps`）を設計に反映する
- `inferSmartDefaults` API 契約（引数・戻り値型）を設計に反映する
- Wave 1 コンポーネントとの統合ポイントを設計に明記する

---

## 完了条件

- [ ] `SkillCreateWizardProps` インターフェースが定義されていること
- [ ] ステップ状態管理方式（`useState`）が決定・記録されていること
- [ ] `inferSmartDefaults` 呼び出しタイミングと受け渡し方式が確定していること
- [ ] NON_VISUAL 計装ポイント 5 つが具体的に定義されていること
- [ ] Wave 3 の `trackEvent` 差し替え方針が記録されていること
- [ ] 成果物（component-design.md / state-management-decision.md / instrumentation-points.md）が作成されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/W2-seq-03a-skill-create-wizard-2/phase-3-design-review.md`
