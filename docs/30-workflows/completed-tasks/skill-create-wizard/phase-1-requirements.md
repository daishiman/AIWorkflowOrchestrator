# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 1                   |
| Phase名    | 要件定義            |
| 前提Phase  | なし                |
| 後続Phase  | Phase 2             |
| ステータス | 未実施              |
| 作成日     | 2026-03-03          |
| 機能名     | skill-create-wizard |

---

## 目的

SkillCreateWizard の機能要件・非機能要件を抽出し、4ステップウィザードの各ステップの入力・出力・振る舞いを定義する。受入基準（GWT形式）を明文化し、後続Phaseで実装すべき内容を確定する。

---

## 背景

TASK-9B（SkillCreatorService）が完了し、スキルを自然言語の説明から自動生成するバックエンド基盤が整った。しかし、Renderer側にはウィザードUIが存在しないため、ユーザーがスキル生成を操作するUIが必要。本Phaseでは、4ステップウィザード（describe → configure → generate → complete）の要件を定義する。

---

## 実行タスク

- 要件定義タスク: FR/NFR/受入基準/エラーケース/スコープ境界を定義する。

| No. | タスク名           | 目的                                       | 成果物                             |
| --- | ------------------ | ------------------------------------------ | ---------------------------------- |
| 1   | 機能要件定義       | 4ステップの入力・出力・振る舞いを明文化    | `requirements-definition.md`       |
| 2   | 非機能要件定義     | アクセシビリティ・パフォーマンス要件を定義 | `requirements-definition.md`（続） |
| 3   | 受入基準（AC）定義 | GWT形式でテスト可能な受入基準を作成        | `acceptance-criteria.md`           |
| 4   | エラーケース定義   | 空入力・生成失敗・ネットワークエラーを定義 | `acceptance-criteria.md`（続）     |
| 5   | スコープ定義       | TASK-10A-C スコープ境界を明文化            | `scope-definition.md`              |

---

## 参照資料

| 参照資料                 | パス                                                                              | 内容                              |
| ------------------------ | --------------------------------------------------------------------------------- | --------------------------------- |
| タスクindex.md           | `docs/30-workflows/completed-tasks/skill-create-wizard/index.md`                  | タスク概要・成果物一覧            |
| SkillCreatorService      | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                     | createSkill() APIシグネチャ       |
| CreateSkillOptions型     | `packages/shared/src/types/skillCreator.ts`                                       | 生成オプションの型定義            |
| UI/UXコンポーネント仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | コンポーネント設計原則            |
| デザインシステム仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`        | Design Tokens、カラーシステム     |
| Agent SDK スキル仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Skill API / 型定義の正本          |
| IPC API 仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | `skill:create` チャネル設計基準   |
| Preload セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`      | contextBridge 公開ルール          |
| 既存SkillImportDialog    | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`                | ダイアログパターン参考            |
| SkillAnalysisView        | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                | Skillコンポーネントの既存パターン |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                              | P31/P39/P42/P47対策               |

---

## 実行手順

### Step 1: 機能要件定義

以下の要件を `outputs/phase-1/requirements-definition.md` に記載する。

#### 1-1. ウィザード全体要件

```
FR-001: SkillCreateWizardは4ステップ（describe→configure→generate→complete）で構成される
FR-002: 各ステップはStepIndicatorで進捗を視覚表示する
FR-003: describeステップからconfigureステップへの遷移は「Next」ボタンで行う
FR-004: configureステップからgenerateステップへの遷移はユーザーが「Generate」ボタンを押すことで行う（自動遷移しない）
FR-005: generateステップでは生成処理中にローディングスピナーを表示する
FR-006: 生成完了後、completeステップに自動遷移する
FR-007: 生成エラー時はgenerateステップにエラーメッセージを表示し、describeステップへの「Try Again」ボタンを提供する
FR-008: onClose()コールバックをPropsとして受け取り、ウィザード終了時に呼び出す
```

#### 1-2. describeステップ要件

```
FR-010: テキストエリア（TextAreaコンポーネント）でスキルの説明を入力できる
FR-011: プレースホルダーテキスト: "Describe what you want the skill to do..."
FR-012: 最小文字数: 10文字。10文字未満の場合、「Next」ボタンを非活性にする
FR-013: 最大文字数: 2000文字。超過した場合はエラーメッセージを表示する
FR-014: フォーカス時はアウトラインを表示する（アクセシビリティ）
```

#### 1-3. configureステップ要件

```
FR-020: 以下3つのチェックボックス（Checkboxコンポーネント）を表示する
  - generateTasks: "Generate task specifications" (default: true)
  - addAgents: "Configure agent settings" (default: false)
  - addReferences: "Add reference materials" (default: false)
FR-021: 各チェックボックスにはラベルと説明テキストを表示する
FR-022: 「Back」ボタンでdescribeステップに戻れる
FR-023: 「Generate」ボタンでgenerate処理を開始する
```

#### 1-4. generateステップ要件

```
FR-030: ローディング中はSpinnerコンポーネントを中央に表示する
FR-031: 進捗メッセージ: "Creating your skill..."
FR-032: 生成処理はskill.create() Preload APIを介してIPCで実行する
FR-033: 生成成功時はcompleteステップに自動遷移する
FR-034: 生成失敗時は以下を表示する:
  - エラーメッセージ（サニタイズ済み）
  - "Try Again" ボタン（describeステップにリセット）
  - "Cancel" ボタン（onClose()を呼び出す）
```

#### 1-5. completeステップ要件

```
FR-040: 完了メッセージ: "Skill created successfully!"
FR-041: 生成されたスキルのパス（スキル名）を表示する
FR-042: "Open Skill" ボタン: SkillEditorでスキルを開く（別タスクスコープ外のため今回は不活性）
FR-043: "Close" ボタン: onClose()を呼び出す
FR-044: "Create Another" ボタン: ウィザードをdescribeステップにリセットする
```

### Step 2: 非機能要件定義

`outputs/phase-1/requirements-definition.md` に追記する。

```
NFR-001: [アクセシビリティ] WCAG 2.1 AA 準拠
  - コントラスト比 4.5:1 以上（テキスト）、3:1 以上（UI部品）
  - キーボード操作で全機能にアクセス可能
  - ARIA ラベル（aria-label, aria-describedby）を明示的に付与
  - Tabキーでフォーカス移動、Enterキーでボタン操作

NFR-002: [パフォーマンス] 不要な再レンダー防止
  - チェックボックスの状態変更はウィザード全体を再レンダーしない
  - Zustand個別セレクタを使用（P31対策）

NFR-003: [セキュリティ] IPC入力バリデーション
  - IPCハンドラーでの3段バリデーション（型チェック→空文字列→トリム空文字列）（P42対策）
  - チャネル名は IPC_CHANNELS 定数で管理（P27対策）

NFR-004: [テスト環境] happy-dom互換
  - テストでは fireEvent を使用（userEvent禁止、P39対策）
  - CSS変数テストは Record<Variant, string> 定数でアサーション（P47対策）

NFR-005: [型安全] TypeScript strict
  - any型の使用禁止
  - CreateSkillOptionsの型を完全に使用する
```

### Step 3: 受入基準（AC）定義

`outputs/phase-1/acceptance-criteria.md` に GWT形式で記載する。

#### 正常系シナリオ

```gherkin
Feature: SkillCreateWizard - スキル作成ウィザード

# describeステップ
Scenario: 有効な説明を入力してconfigureステップに進む
  Given SkillCreateWizardが表示されている（describeステップ）
  When テキストエリアに10文字以上のスキル説明を入力する
  And "Next" ボタンをクリックする
  Then configureステップが表示される
  And StepIndicatorが2番目のステップをアクティブとして表示する

Scenario: configureオプションを設定してgenerate処理を開始する
  Given configureステップが表示されている
  When generateTasks チェックボックスがチェック済みであることを確認する
  And "Generate" ボタンをクリックする
  Then generateステップが表示される
  And ローディングスピナーが表示される
  And "Creating your skill..." テキストが表示される

Scenario: スキル生成が成功してcompleteステップに遷移する
  Given generateステップが表示されている
  And skill.create() がスキルパスを返す
  When 生成処理が完了する
  Then completeステップが表示される
  And "Skill created successfully!" が表示される
  And 生成されたスキルのパスが表示される

Scenario: 「Create Another」でウィザードをリセットする
  Given completeステップが表示されている
  When "Create Another" ボタンをクリックする
  Then describeステップに戻る
  And テキストエリアがクリアされている
  And configureオプションがデフォルト値にリセットされている

Scenario: 「Close」でウィザードを閉じる
  Given completeステップが表示されている
  When "Close" ボタンをクリックする
  Then onClose() が呼び出される
```

#### 異常系シナリオ

```gherkin
# バリデーションエラー
Scenario: 説明が10文字未満の場合「Next」ボタンが非活性
  Given SkillCreateWizardが表示されている（describeステップ）
  When テキストエリアに9文字以下を入力する
  Then "Next" ボタンが非活性（disabled）になる
  And ユーザーは次のステップに進めない

Scenario: 説明が空の場合「Next」ボタンが非活性
  Given SkillCreateWizardが表示されている（describeステップ）
  When テキストエリアが空の状態
  Then "Next" ボタンが非活性（disabled）になる

Scenario: 説明が2000文字超の場合エラーメッセージを表示
  Given SkillCreateWizardが表示されている（describeステップ）
  When テキストエリアに2001文字以上を入力する
  Then エラーメッセージ "Description must not exceed 2000 characters" が表示される
  And "Next" ボタンが非活性になる

# 生成エラー
Scenario: スキル生成が失敗してエラーを表示する
  Given generateステップが表示されている
  And skill.create() がエラーを返す
  When 生成処理が失敗する
  Then エラーメッセージが表示される
  And "Try Again" ボタンが表示される
  And "Cancel" ボタンが表示される

Scenario: 「Try Again」でdescribeステップにリセットする
  Given generateステップでエラーが表示されている
  When "Try Again" ボタンをクリックする
  Then describeステップに戻る
  And 以前に入力した説明が保持される

Scenario: 生成中に「Cancel」でウィザードを閉じる（エラー時）
  Given generateステップでエラーが表示されている
  When "Cancel" ボタンをクリックする
  Then onClose() が呼び出される
```

#### アクセシビリティシナリオ

```gherkin
Scenario: キーボードのみで全操作が可能
  Given SkillCreateWizardが表示されている
  When Tabキーでフォーカスを移動する
  Then 全てのインタラクティブ要素にフォーカスが当たる
  And フォーカスインジケーターが視覚的に確認できる

Scenario: テキストエリアにARIAラベルが設定されている
  Given SkillCreateWizardが表示されている（describeステップ）
  Then テキストエリアに aria-label または aria-labelledby が設定されている

Scenario: ローディング状態がスクリーンリーダーに伝わる
  Given generateステップが表示されている（ローディング中）
  Then aria-busy="true" または role="status" が設定されている
```

### Step 4: スコープ定義

`outputs/phase-1/scope-definition.md` に記載する。

**TASK-10A-C のスコープ（含む）:**

- `SkillCreateWizard.tsx` コンポーネント本体
- `wizard/` サブコンポーネント（StepIndicator, DescribeStep, ConfigureStep, GenerateStep, CompleteStep）
- `skill:create` IPCハンドラー追加（SkillCreatorService呼び出し）
- `skill.create()` Preload API追加
- `preload/types.ts` 型定義追加
- `SkillCreateWizard.test.tsx` テスト

**スコープ外（後続タスク）:**

- SkillManagementPanelとの統合（TASK-10A-D）
- "Open Skill" ボタンの実際の動作（SkillEditorとの連携）
- Zustandストアへの作成スキル状態の追加

---

## 統合テスト連携【必須】

| 接続要件カテゴリ   | 記載内容                                            |
| ------------------ | --------------------------------------------------- |
| IPC接続            | `skill:create` チャネルの入出力定義                 |
| 状態管理           | ウィザード状態はローカル useState（Zustand不使用）  |
| コンポーネント連携 | onClose()コールバックによる親コンポーネントとの連携 |

---

## 多角的チェック観点

| 観点             | チェック内容                                   |
| ---------------- | ---------------------------------------------- |
| 完全性           | 4ステップ全ての要件が定義されているか          |
| テスト可能性     | 全ACがGWT形式で記述されているか                |
| アクセシビリティ | WCAG 2.1 AA準拠の要件が含まれているか          |
| セキュリティ     | IPC入力バリデーション要件が含まれているか      |
| スコープ境界     | TASK-10A-D（統合）との境界が明確か             |
| 既知パターン準拠 | P31/P39/P42/P47 の対策が要件に反映されているか |

---

## 成果物

| 成果物       | パス                                                                                               | 内容              |
| ------------ | -------------------------------------------------------------------------------------------------- | ----------------- |
| 要件定義書   | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-1/requirements-definition.md` | 機能・非機能要件  |
| 受入基準     | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-1/acceptance-criteria.md`     | AC定義（GWT形式） |
| スコープ定義 | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-1/scope-definition.md`        | 実装範囲          |

---

## 完了条件

- [ ] `outputs/phase-1/requirements-definition.md` が作成されている
- [ ] 機能要件（FR-001〜FR-044）が全て記載されている
- [ ] 非機能要件（NFR-001〜NFR-005）が全て記載されている
- [ ] `outputs/phase-1/acceptance-criteria.md` が作成されている
- [ ] 正常系・異常系・アクセシビリティのGWTシナリオが記載されている
- [ ] `outputs/phase-1/scope-definition.md` が作成されている
- [ ] TASK-10A-Dとのスコープ境界が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

| No. | タスク名         | ステータス | 成果物パス                                   |
| --- | ---------------- | ---------- | -------------------------------------------- |
| 1   | 機能要件定義     | 未実施     | `outputs/phase-1/requirements-definition.md` |
| 2   | 非機能要件定義   | 未実施     | `outputs/phase-1/requirements-definition.md` |
| 3   | 受入基準定義     | 未実施     | `outputs/phase-1/acceptance-criteria.md`     |
| 4   | エラーケース定義 | 未実施     | `outputs/phase-1/acceptance-criteria.md`     |
| 5   | スコープ定義     | 未実施     | `outputs/phase-1/scope-definition.md`        |

---

## タスク100%実行確認【必須】

Phase完了後、以下を確認してください:

```markdown
## Phase 1 実行記録

### 完了タスク

- [ ] 機能要件定義（FR-001〜FR-044）: {{完了/未完了}}
- [ ] 非機能要件定義（NFR-001〜NFR-005）: {{完了/未完了}}
- [ ] 受入基準定義（正常系・異常系・アクセシビリティ）: {{完了/未完了}}
- [ ] スコープ定義: {{完了/未完了}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/skill-create-wizard/phase-2-design.md`
