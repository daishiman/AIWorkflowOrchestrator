# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 2                   |
| Phase名    | 設計                |
| 前提Phase  | Phase 1             |
| 後続Phase  | Phase 3             |
| ステータス | 未実施              |
| 作成日     | 2026-03-03          |
| 機能名     | skill-create-wizard |

---

## 目的

Phase 1の要件定義に基づき、SkillCreateWizardのコンポーネントアーキテクチャ・状態管理・IPC設計・Preload API設計を行う。Atomic Design原則・既存パターン・プロジェクトルールに準拠した詳細設計を確定する。

---

## 前提条件

- Phase 1成果物（requirements-definition.md, acceptance-criteria.md, scope-definition.md）が完了していること
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` の `createSkill()` APIが利用可能であること

---

## 実行タスク

- 設計タスク: コンポーネント構成、状態管理、IPC/Preload契約を設計する。

| No. | タスク名                     | 目的                                      | 成果物                         |
| --- | ---------------------------- | ----------------------------------------- | ------------------------------ |
| 1   | コンポーネントアーキテクチャ | Atomic Design配置・分割設計               | `architecture-design.md`       |
| 2   | 状態管理設計                 | useState vs Zustand の選択・型定義        | `architecture-design.md`（続） |
| 3   | IPC インターフェース設計     | `skill:create` チャネルの入出力定義       | `api-specification.md`         |
| 4   | Preload API 設計             | `skill.create()` メソッドのシグネチャ定義 | `api-specification.md`（続）   |
| 5   | デザイントークン適用計画     | CSS変数の適用箇所を決定                   | `architecture-design.md`（続） |

---

## 参照資料

| 参照資料                 | パス                                                                                               | 内容                              |
| ------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 1 要件定義書       | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-1/requirements-definition.md` | 機能・非機能要件                  |
| Phase 1 受入基準         | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-1/acceptance-criteria.md`     | GWT受入基準                       |
| Phase 1 スコープ定義     | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-1/scope-definition.md`        | 実装範囲                          |
| SkillCreatorService      | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                                      | createSkill() シグネチャ          |
| CreateSkillOptions型     | `packages/shared/src/types/skillCreator.ts`                                                        | スキル作成オプション型            |
| 既存Preload skill-api    | `apps/desktop/src/preload/skill-api.ts`                                                            | 既存APIパターン（参考）           |
| IPCチャネル定数          | `apps/desktop/src/preload/channels.ts`                                                             | 既存チャネル定義・追加先          |
| SkillImportDialog        | `apps/desktop/src/renderer/components/skill/SkillImportDialog.tsx`                                 | 既存ダイアログパターン            |
| SkillAnalysisView        | `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`                                 | 既存Skillコンポーネントパターン   |
| UI/UXコンポーネント仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                            | Atomic Design・コンポーネント一覧 |
| デザインシステム仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                         | CSS変数・デザイントークン         |
| セキュリティ仕様         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                       | IPC入力バリデーション原則         |
| 実装パターン集           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`        | safeInvoke/IPC契約パターン        |
| アーキテクチャ概要       | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                       | Main/Preload/Renderer 責務分離    |
| Agent SDK スキル仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                  | SkillCreate 系の型・API契約       |
| IPC API 仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                               | IPC命名・request/response契約     |
| API 設計原則             | `.claude/skills/aiworkflow-requirements/references/api-core.md`                                    | API命名・責務境界の原則           |
| API エンドポイント一覧   | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                               | IPCカテゴリ分類の整合確認         |
| Preload セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                       | exposeInMainWorld の制約          |
| 状態管理アーキテクチャ   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                       | useState/Zustand 境界設計         |
| 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md`                                                               | P27/P31/P39/P42/P47               |

---

## 実行手順

### Step 1: コンポーネントアーキテクチャ設計

`outputs/phase-2/architecture-design.md` に以下を記載する。

#### 1-1. Atomic Design 配置

```
atoms/（既存を流用）
  - Button.tsx      … Next/Generate/Back/Close/Try Again/Create Another ボタン
  - TextArea.tsx    … describeステップの説明入力
  - Checkbox.tsx    … configureステップのオプション選択
  - Spinner.tsx     … generateステップのローディング表示
  - Badge.tsx       … 生成結果のパス表示（オプション）

molecules/（新規作成）
  - wizard/FormField.tsx（既存があれば流用）

organisms/（新規作成）
  skill/SkillCreateWizard.tsx             … ウィザード本体（organisms）
  skill/wizard/StepIndicator.tsx          … ステップ進捗表示（molecules）
  skill/wizard/DescribeStep.tsx           … Step 1: 説明入力（molecules）
  skill/wizard/ConfigureStep.tsx          … Step 2: オプション選択（molecules）
  skill/wizard/GenerateStep.tsx           … Step 3: 生成処理表示（molecules）
  skill/wizard/CompleteStep.tsx           … Step 4: 完了表示（molecules）
```

#### 1-2. コンポーネント責務分担

| コンポーネント      | 責務                                          | Props                                                                                                          |
| ------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `SkillCreateWizard` | ウィザード全体の状態管理・ステップ切り替え    | `{ onClose: () => void }`                                                                                      |
| `StepIndicator`     | 現在ステップを視覚表示（4個のインジケーター） | `{ currentStep: WizardStep; steps: WizardStep[] }`                                                             |
| `DescribeStep`      | テキストエリア・バリデーション                | `{ description: string; onChange: (v: string) => void; onNext: () => void }`                                   |
| `ConfigureStep`     | 3チェックボックス・バック/ジェネレートボタン  | `{ options: WizardOptions; onChange: (o: WizardOptions) => void; onBack: () => void; onGenerate: () => void }` |
| `GenerateStep`      | ローディング/エラー表示                       | `{ status: "loading" \| "error"; error?: string; onRetry: () => void; onCancel: () => void }`                  |
| `CompleteStep`      | 完了メッセージ・パス表示                      | `{ skillPath: string; onClose: () => void; onCreateAnother: () => void }`                                      |

#### 1-3. ファイル構成（新規作成ファイル）

```
apps/desktop/src/renderer/components/skill/
  SkillCreateWizard.tsx                              （organisms）
  wizard/
    StepIndicator.tsx
    DescribeStep.tsx
    ConfigureStep.tsx
    GenerateStep.tsx
    CompleteStep.tsx
  __tests__/
    SkillCreateWizard.test.tsx

apps/desktop/src/preload/
  skill-api.ts                                       （create() メソッド追加）
  types.ts                                           （SkillAPI型にcreate追加）

apps/desktop/src/main/ipc/
  skillHandlers.ts                                   （skill:create ハンドラー追加）

apps/desktop/src/preload/
  channels.ts                                        （SKILL_CREATE チャネル定数追加）
```

#### 1-4. デザイントークン適用計画

| UI要素              | CSS変数                 | 説明                        |
| ------------------- | ----------------------- | --------------------------- |
| ウィザード背景      | `var(--bg-primary)`     | メイン背景色                |
| ヘッダー            | `var(--bg-secondary)`   | セカンダリ背景              |
| ボーダー            | `var(--border-primary)` | 区切り線                    |
| プライマリテキスト  | `var(--text-primary)`   | メインテキスト              |
| セカンダリテキスト  | `var(--text-secondary)` | 説明テキスト                |
| アクティブステップ  | `var(--status-primary)` | StepIndicatorの現在ステップ |
| 完了ステップ        | `var(--status-success)` | StepIndicatorの完了ステップ |
| エラーテキスト      | `var(--status-error)`   | エラーメッセージ            |
| ボタン（Primary）   | `var(--status-primary)` | Next/Generateボタン         |
| ボタン（Secondary） | `var(--bg-secondary)`   | Back/Cancelボタン           |

**注意**: CSS変数ベースのスタイルテスト（P47対策）のため、variantStylesを`Record<Variant, string>`型でexportする。

### Step 2: 状態管理設計

`outputs/phase-2/architecture-design.md` に追記する。

#### 2-1. 状態配置の選択根拠

**選択: ローカル useState（Zustand不使用）**

根拠:

- ウィザードの状態はSkillCreateWizardコンポーネント内でのみ使用
- 他コンポーネントからこの状態を参照しない
- Zustandを使うのは「アプリ全体で共有する状態」に限る（P31対策、合成Hook無限ループ防止）

```typescript
// SkillCreateWizard 内部状態
type WizardStep = "describe" | "configure" | "generate" | "complete";

interface WizardOptions {
  generateTasks: boolean;
  addAgents: boolean;
  addReferences: boolean;
}

// useState による管理
const [currentStep, setCurrentStep] = useState<WizardStep>("describe");
const [description, setDescription] = useState<string>("");
const [options, setOptions] = useState<WizardOptions>({
  generateTasks: true,
  addAgents: false,
  addReferences: false,
});
const [generatedPath, setGeneratedPath] = useState<string>("");
const [generateError, setGenerateError] = useState<string>("");
const [isGenerating, setIsGenerating] = useState<boolean>(false);
```

#### 2-2. ステップ遷移ロジック

```
describe → configure: onNext()（descriptionが10文字以上の場合のみ）
configure → generate: onGenerate()（skill.create()呼び出しを含む）
generate → complete: 生成成功時に自動遷移
generate → describe: onRetry()（エラー時）
complete → describe: onCreateAnother()（descriptionとoptionsをリセット）
any → 閉じる: onClose()
```

#### 2-3. 生成処理フロー

```typescript
const handleGenerate = async () => {
  setCurrentStep("generate");
  setIsGenerating(true);
  setGenerateError("");

  try {
    const result = await window.electronAPI.skill.create({
      description,
      generateTasks: options.generateTasks,
      addAgents: options.addAgents,
      addReferences: options.addReferences,
    });
    setGeneratedPath(result.path);
    setCurrentStep("complete");
  } catch (error) {
    setGenerateError(
      error instanceof Error ? error.message : "An unexpected error occurred",
    );
    // generateステップのままでエラー表示
  } finally {
    setIsGenerating(false);
  }
};
```

### Step 3: IPC インターフェース設計

`outputs/phase-2/api-specification.md` に記載する。

#### 3-1. IPCチャネル定数追加（channels.ts）

```typescript
// apps/desktop/src/preload/channels.ts に追加
export const IPC_CHANNELS = {
  // ... 既存チャネル ...
  SKILL_CREATE: "skill:create", // ← 新規追加
} as const;
```

#### 3-2. IPCハンドラー設計（skillHandlers.ts）

```typescript
// channel: "skill:create"
// 引数: params（Preloadから渡されるオブジェクト）
// 戻り値: { path: string }

ipcMain.handle(
  IPC_CHANNELS.SKILL_CREATE,
  async (
    event,
    params: {
      description: string;
      generateTasks: boolean;
      addAgents: boolean;
      addReferences: boolean;
    },
  ) => {
    // P42対策: 3段バリデーション
    if (typeof params?.description !== "string") {
      throw new Error("description must be a string");
    }
    if (params.description === "") {
      throw new Error("description must not be empty");
    }
    if (params.description.trim() === "") {
      throw new Error("description must not be only whitespace");
    }

    // P42対策: boolean型チェック
    const generateTasks = Boolean(params.generateTasks);
    const addAgents = Boolean(params.addAgents);
    const addReferences = Boolean(params.addReferences);

    // SkillCreatorService.createSkill() 呼び出し
    // スキル名はdescriptionから自動生成（SkillCreatorService内部処理）
    const skillPath = await skillCreatorService.createSkill({
      name: generateSkillName(params.description), // 仮: descriptionから名前生成
      description: params.description,
      mode: "create",
      generateTasks,
    });

    return { path: skillPath };
  },
);
```

**注意**: `generateSkillName()` の実装はSkillCreatorServiceの`detectMode()`や内部処理に委ねる。詳細はPhase 5実装時に確認する。

#### 3-3. ハンドラー登録

```typescript
// skillHandlers.ts の registerSkillHandlers() に追加
// ホワイトリスト管理（P27対策）
const allowedChannels = [
  // ... 既存チャネル ...
  IPC_CHANNELS.SKILL_CREATE,
];
```

### Step 4: Preload API 設計

`outputs/phase-2/api-specification.md` に追記する。

#### 4-1. skill-api.ts の `create()` 追加

```typescript
// apps/desktop/src/preload/skill-api.ts に追加

export const skillApi = {
  // ... 既存メソッド ...

  /**
   * 自然言語の説明からスキルを作成する
   */
  create: (params: {
    description: string;
    generateTasks: boolean;
    addAgents: boolean;
    addReferences: boolean;
  }): Promise<{ path: string }> =>
    safeInvoke(IPC_CHANNELS.SKILL_CREATE, params),
};
```

#### 4-2. preload/types.ts の型拡張

```typescript
// SkillAPI型に create() を追加

export interface SkillAPI {
  // ... 既存メソッド定義 ...

  create: (params: {
    description: string;
    generateTasks: boolean;
    addAgents: boolean;
    addReferences: boolean;
  }) => Promise<{ path: string }>;
}
```

#### 4-3. contextBridge への expose 確認

既存の `window.electronAPI.skill` に `create` が含まれるよう、preload/index.ts（またはcontextBridge設定ファイル）でexposeされていることを確認する。

### Step 5: StepIndicatorコンポーネント設計詳細

`outputs/phase-2/architecture-design.md` に追記する。

```typescript
// StepIndicator.tsx

type WizardStep = "describe" | "configure" | "generate" | "complete";

const STEP_LABELS: Record<WizardStep, string> = {
  describe: "Describe",
  configure: "Configure",
  generate: "Generate",
  complete: "Complete",
};

const ALL_STEPS: WizardStep[] = [
  "describe",
  "configure",
  "generate",
  "complete",
];

interface StepIndicatorProps {
  currentStep: WizardStep;
}

// スタイル定義（P47対策: Record<string, string>でexport）
export const stepStyles = {
  active: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  completed: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  pending: "bg-[var(--bg-secondary)] text-[var(--text-secondary)]",
};
```

---

## 統合テスト連携【必須】

設計段階でのIPC契約を確認する:

| チェック項目         | 確認内容                                                         |
| -------------------- | ---------------------------------------------------------------- |
| IPC引数形式          | Preload側がオブジェクト`{description, generateTasks, ...}`を渡す |
| ハンドラー引数形式   | Main側が同じオブジェクト形式を受け取る（P44: 不整合防止）        |
| 引数のセマンティクス | `description`はスキルの説明文字列（P45: 命名ドリフト防止）       |
| 3段バリデーション    | 型チェック→空文字列チェック→トリム後空文字列チェック（P42）      |
| チャネル名の定数管理 | `IPC_CHANNELS.SKILL_CREATE`で参照（P27: ハードコード禁止）       |

---

## 多角的チェック観点

| 観点                 | チェック内容                                                      |
| -------------------- | ----------------------------------------------------------------- |
| Atomic Design準拠    | コンポーネントがatoms/molecules/organismsに正しく配置されているか |
| 状態管理の妥当性     | ローカルuseStateの選択が適切か（Zustand不使用の根拠が明確か）     |
| IPC契約の整合性      | Preload/Mainの引数形式が一致しているか（P44対策）                 |
| バリデーション網羅   | 3段バリデーションが全ての文字列引数に適用されているか（P42対策）  |
| デザイントークン適用 | ハードコードのカラー値が存在しないか                              |
| テスト容易性         | Props設計がmockしやすい形になっているか                           |
| アクセシビリティ     | ARIAアトリビュートが設計に含まれているか                          |
| 型安全性             | any型が使用されていないか                                         |

---

## 成果物

| 成果物             | パス                                                                                           | 内容                             |
| ------------------ | ---------------------------------------------------------------------------------------------- | -------------------------------- |
| アーキテクチャ設計 | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-2/architecture-design.md` | コンポーネント構成・状態管理設計 |
| API仕様書          | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-2/api-specification.md`   | IPC/Preload API設計              |

---

## 完了条件

- [ ] `outputs/phase-2/architecture-design.md` が作成されている
- [ ] Atomic Design配置が定義されている（atoms/molecules/organisms）
- [ ] 全コンポーネントのProps型が定義されている
- [ ] 状態管理の設計と選択根拠が記載されている（useState採用・Zustand不採用の理由）
- [ ] `WizardStep` 型と `WizardOptions` 型が定義されている
- [ ] `outputs/phase-2/api-specification.md` が作成されている
- [ ] `skill:create` IPCチャネルの入出力型が定義されている
- [ ] `skill.create()` Preload APIのシグネチャが定義されている
- [ ] 3段バリデーション設計が記載されている（P42対策）
- [ ] デザイントークン適用計画が記載されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

| No. | タスク名                     | ステータス | 成果物パス                               |
| --- | ---------------------------- | ---------- | ---------------------------------------- |
| 1   | コンポーネントアーキテクチャ | 未実施     | `outputs/phase-2/architecture-design.md` |
| 2   | 状態管理設計                 | 未実施     | `outputs/phase-2/architecture-design.md` |
| 3   | IPC インターフェース設計     | 未実施     | `outputs/phase-2/api-specification.md`   |
| 4   | Preload API 設計             | 未実施     | `outputs/phase-2/api-specification.md`   |
| 5   | デザイントークン適用計画     | 未実施     | `outputs/phase-2/architecture-design.md` |

---

## タスク100%実行確認【必須】

Phase完了後、以下を確認してください:

```markdown
## Phase 2 実行記録

### 完了タスク

- [ ] コンポーネントアーキテクチャ設計: {{完了/未完了}}
- [ ] 状態管理設計（useState選択根拠）: {{完了/未完了}}
- [ ] IPC インターフェース設計（skill:create）: {{完了/未完了}}
- [ ] Preload API 設計（skill.create()）: {{完了/未完了}}
- [ ] デザイントークン適用計画: {{完了/未完了}}

### IPC契約チェック

- [ ] Preload→Main の引数形式が一致: {{確認済み/未確認}}
- [ ] 3段バリデーション設計: {{確認済み/未確認}}
- [ ] チャネル名が定数管理: {{確認済み/未確認}}

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

`docs/30-workflows/completed-tasks/skill-create-wizard/phase-3-design-review.md`
