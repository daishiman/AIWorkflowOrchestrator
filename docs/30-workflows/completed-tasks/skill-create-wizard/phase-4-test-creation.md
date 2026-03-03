# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 4                   |
| Phase名    | テスト作成          |
| 前提Phase  | Phase 3             |
| 後続Phase  | Phase 5             |
| ステータス | 未実施              |
| 作成日     | 2026-03-03          |
| 機能名     | skill-create-wizard |
| タスクID   | TASK-10A-C          |

---

## 目的

TDDのRed段階として、Phase 2で設計した SkillCreateWizard の全コンポーネントに対するテストを実装より先に作成する。受け入れ基準に基づき、失敗するテストを作成してから実装に進む。

ウィザードの4ステップ（describe → configure → generate → complete）とサブコンポーネントのテストを網羅し、IPC モック・エラーケース・アクセシビリティも検証する。

## 背景

設計レビューが完了し、設計の妥当性が確認された。TDDのプラクティスに従い、まずテストを作成して期待される動作を明確にしてから実装に進む。

**重要制約**:

- P39: happy-dom環境では `userEvent` を禁止し `fireEvent` を使用すること
- P40: テスト実行は `cd apps/desktop && pnpm vitest run` で実施（モノレポルートからは不可）
- P9: `beforeEach` でコンポーネント・モック状態を完全リセットすること
- P47: CSS変数スタイルテストはRecord定数exportパターンを使用すること
- P46: HTMLAttributes型衝突は `Omit` で解決すること

---

## 実行タスク

- テスト設計タスク: コンポーネント/統合テストのRedケースを作成する。

> 以下のタスクを順番に実行してください。

### タスク1: StepIndicator のテスト作成

**目的**: ウィザードステップ表示コンポーネントのユニットテストを作成する

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/wizard/__tests__/StepIndicator.test.tsx`

2. 以下のテストケースを実装する:

```typescript
// apps/desktop/src/renderer/components/skill/wizard/__tests__/StepIndicator.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepIndicator } from "../StepIndicator";

const STEPS = ["説明入力", "設定", "生成", "完了"];

describe("StepIndicator", () => {
  describe("ステップ表示", () => {
    it("全ステップのラベルが表示される", () => {
      // 4つのステップラベルが全て表示されることを確認
    });

    it("currentStep=0 のとき最初のステップがアクティブになる", () => {
      // aria-current="step" が最初のステップに設定されることを確認
    });

    it("currentStep=2 のとき3番目のステップがアクティブになる", () => {
      // aria-current="step" が3番目のステップに設定されることを確認
    });

    it("完了したステップには completed 状態が付与される", () => {
      // currentStep より前のステップに completed クラスが付くことを確認
    });

    it("未到達ステップには pending 状態が付与される", () => {
      // currentStep より後のステップに pending クラスが付くことを確認
    });
  });

  describe("アクセシビリティ", () => {
    it("aria-label が付与されている", () => {
      // role="navigation" または適切な aria-label が存在することを確認
    });

    it("各ステップにステップ番号が含まれる", () => {
      // スクリーンリーダー向けに番号情報があることを確認
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/StepIndicator.test.tsx`

---

### タスク2: DescribeStep のテスト作成

**目的**: スキル説明入力ステップコンポーネントのユニットテストを作成する

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`

2. 以下のテストケースを実装する:

```typescript
// apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DescribeStep } from "../DescribeStep";

describe("DescribeStep", () => {
  const mockOnNext = vi.fn();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("初期レンダリング", () => {
    it("説明入力テキストエリアが表示される", () => {
      // textarea要素が存在することを確認
    });

    it("説明が空の場合「次へ」ボタンが disabled になる", () => {
      // description='' のとき「次へ」ボタンが disabled なことを確認
    });

    it("説明が入力済みの場合「次へ」ボタンが enabled になる", () => {
      // description='テスト説明' のとき「次へ」ボタンが enabled なことを確認
    });
  });

  describe("入力インタラクション", () => {
    it("テキストエリア入力で onDescriptionChange が呼び出される", () => {
      // fireEvent.change でコールバックが呼ばれることを確認
      // ⚠️ P39: userEvent は使用禁止、fireEvent を使用
    });

    it("スペースのみの入力では「次へ」ボタンが disabled のまま", () => {
      // '   ' (スペースのみ) では disabled なことを確認
    });

    it("「次へ」ボタンクリックで onNext が呼び出される", () => {
      // enabled 状態でクリックしたときコールバックが呼ばれることを確認
    });

    it("「次へ」ボタンが disabled のとき onNext は呼び出されない", () => {
      // disabled 状態でクリックしてもコールバックが呼ばれないことを確認
    });
  });

  describe("プレースホルダー・ラベル", () => {
    it("適切なプレースホルダーテキストが表示される", () => {
      // textarea に placeholder 属性があることを確認
    });

    it("ラベルがテキストエリアに関連付けられている", () => {
      // htmlFor または aria-label が設定されていることを確認
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`

---

### タスク3: ConfigureStep のテスト作成

**目的**: スキル生成オプション設定ステップのユニットテストを作成する

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConfigureStep.test.tsx`

2. 以下のテストケースを実装する:

```typescript
// apps/desktop/src/renderer/components/skill/wizard/__tests__/ConfigureStep.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ConfigureStep } from "../ConfigureStep";

describe("ConfigureStep", () => {
  const defaultOptions = {
    generateTasks: true,
    addAgents: false,
    addReferences: false,
  };
  const mockOnBack = vi.fn();
  const mockOnGenerate = vi.fn();
  const mockOnOptionsChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("チェックボックス表示", () => {
    it("generateTasks チェックボックスが表示される", () => {
      // ラベル「タスク生成」またはgenerateTasksのチェックボックスが存在することを確認
    });

    it("addAgents チェックボックスが表示される", () => {
      // ラベル「エージェント追加」またはaddAgentsのチェックボックスが存在することを確認
    });

    it("addReferences チェックボックスが表示される", () => {
      // ラベル「参照追加」またはaddReferencesのチェックボックスが存在することを確認
    });

    it("options の値に従いチェック状態が初期化される", () => {
      // generateTasks=true のとき checked、addAgents=false のとき unchecked
    });
  });

  describe("ボタン", () => {
    it("「戻る」ボタンが表示される", () => {
      // 「戻る」テキストのボタンが存在することを確認
    });

    it("「スキルを生成」ボタンが表示される", () => {
      // 「スキルを生成」テキストのボタンが存在することを確認
    });

    it("「戻る」ボタンクリックで onBack が呼び出される", () => {
      // fireEvent.click で onBack コールバックが呼ばれることを確認
    });

    it("「スキルを生成」ボタンクリックで onGenerate が呼び出される", () => {
      // fireEvent.click で onGenerate コールバックが呼ばれることを確認
    });
  });

  describe("チェックボックスインタラクション", () => {
    it("generateTasks チェックボックス変更で onOptionsChange が呼ばれる", () => {
      // チェック/アンチェックで正しい options が渡されることを確認
    });

    it("addAgents チェックボックス変更で onOptionsChange が呼ばれる", () => {
      // チェック/アンチェックで正しい options が渡されることを確認
    });

    it("addReferences チェックボックス変更で onOptionsChange が呼ばれる", () => {
      // チェック/アンチェックで正しい options が渡されることを確認
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConfigureStep.test.tsx`

---

### タスク4: GenerateStep のテスト作成

**目的**: スキル生成中ステップのユニットテストを作成する

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`

2. 以下のテストケースを実装する:

```typescript
// apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GenerateStep } from "../GenerateStep";

describe("GenerateStep", () => {
  describe("ローディング状態", () => {
    it("isGenerating=true のときスピナーまたはローディングUIが表示される", () => {
      // ローディングインジケーターが存在することを確認
    });

    it("isGenerating=true のとき進捗テキストが表示される", () => {
      // 「生成中...」等のテキストが表示されることを確認
    });

    it("isGenerating=false かつエラーなしのとき、ローディングUIが非表示", () => {
      // ローディングインジケーターが存在しないことを確認
    });
  });

  describe("エラー状態", () => {
    it("error が設定されているときエラーメッセージが表示される", () => {
      // エラーメッセージが表示されることを確認
    });

    it("error が null のときエラーメッセージが非表示", () => {
      // エラーメッセージが存在しないことを確認
    });

    it("エラーメッセージに error.message の内容が含まれる", () => {
      // 'スキル生成に失敗しました' 等のメッセージが含まれることを確認
    });
  });

  describe("アクセシビリティ", () => {
    it("ローディング中に aria-live アナウンスが行われる", () => {
      // aria-live="polite" または aria-live="assertive" が存在することを確認
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`

---

### タスク5: CompleteStep のテスト作成

**目的**: スキル生成完了ステップのユニットテストを作成する

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`

2. 以下のテストケースを実装する:

```typescript
// apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CompleteStep } from "../CompleteStep";

describe("CompleteStep", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("完了UI", () => {
    it("完了メッセージが表示される", () => {
      // 「スキルが作成されました」等の完了メッセージが表示されることを確認
    });

    it("生成されたスキルパスが表示される", () => {
      // skillPath='/path/to/skill' が画面に表示されることを確認
    });

    it("skillPath が null のときパス表示がない", () => {
      // パス情報が表示されないことを確認
    });
  });

  describe("ボタン操作", () => {
    it("「閉じる」ボタンが表示される", () => {
      // 「閉じる」テキストのボタンが存在することを確認
    });

    it("「閉じる」ボタンクリックで onClose が呼び出される", () => {
      // fireEvent.click で onClose コールバックが呼ばれることを確認
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`

---

### タスク6: SkillCreateWizard 統合テストの作成

**目的**: ウィザード全体のステップ遷移・完了フロー・IPC呼び出しの統合テストを作成する

**実行手順**:

1. テストファイルを作成する:
   - `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`

2. 以下のテストケースを実装する:

```typescript
// apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SkillCreateWizard } from "../SkillCreateWizard";

// IPC モック設定
const mockCreate = vi.fn();

describe("SkillCreateWizard", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({ path: "/path/to/new-skill" });
    // window.electronAPI.skill.create をモック
    vi.stubGlobal("window", {
      electronAPI: {
        skill: {
          create: mockCreate,
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("初期表示", () => {
    it("Step 1（describe）が最初に表示される", () => {
      // StepIndicator が Step 1 をアクティブにし、DescribeStep が表示されることを確認
    });

    it("StepIndicator に全4ステップが表示される", () => {
      // 「説明入力」「設定」「生成」「完了」の4ラベルが存在することを確認
    });
  });

  describe("ステップ遷移", () => {
    it("説明入力後「次へ」クリックで Step 2（configure）に遷移する", () => {
      // fireEvent.change でテキスト入力 → fireEvent.click で「次へ」 → ConfigureStep が表示
    });

    it("Step 2 で「戻る」クリックで Step 1（describe）に戻る", () => {
      // Step 2 で「戻る」をクリックすると DescribeStep が再表示されることを確認
    });

    it("Step 2 で「スキルを生成」クリックで Step 3（generate）に遷移し IPC を呼ぶ", async () => {
      // 「スキルを生成」クリック後 GenerateStep が表示され mockCreate が呼ばれることを確認
    });

    it("IPC 成功後に Step 4（complete）に遷移する", async () => {
      // mockCreate が resolve した後 CompleteStep が表示されることを確認
    });

    it("CompleteStep に生成されたパスが表示される", async () => {
      // '/path/to/new-skill' が CompleteStep に表示されることを確認
    });
  });

  describe("IPC 呼び出し", () => {
    it("skill.create が description と options を正しく渡して呼ばれる", async () => {
      // mockCreate.mock.calls[0][0] に正しいパラメータが渡されることを確認
    });

    it("IPC 失敗時に GenerateStep にエラーが表示される", async () => {
      // mockCreate.mockRejectedValue(new Error('生成失敗')) → エラーメッセージ表示を確認
    });
  });

  describe("モーダル制御", () => {
    it("Step 4 で「閉じる」クリックで onClose が呼ばれる", async () => {
      // 完了後「閉じる」ボタンクリックで mockOnClose が呼ばれることを確認
    });
  });

  describe("バリデーション", () => {
    it("説明が空のとき Step 1 で「次へ」ボタンが disabled", () => {
      // 初期状態で「次へ」ボタンが disabled なことを確認
    });

    it("説明を入力すると「次へ」ボタンが enabled になる", () => {
      // 入力後に「次へ」ボタンが enabled なことを確認
    });
  });
});
```

**期待される成果物**:

- `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`

---

### タスク7: テスト仕様書の作成

**目的**: テストケース設計の根拠と網羅性を文書化する

**実行手順**:

1. テスト仕様書を作成する:
   - `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-4/test-specification.md`

2. 以下の内容を記載する:

```markdown
## SkillCreateWizard テスト仕様書

### テスト対象コンポーネント

| コンポーネント    | テストファイル                      | テスト種別     |
| ----------------- | ----------------------------------- | -------------- |
| SkillCreateWizard | SkillCreateWizard.test.tsx          | 統合テスト     |
| StepIndicator     | wizard/**tests**/StepIndicator.test | ユニットテスト |
| DescribeStep      | wizard/**tests**/DescribeStep.test  | ユニットテスト |
| ConfigureStep     | wizard/**tests**/ConfigureStep.test | ユニットテスト |
| GenerateStep      | wizard/**tests**/GenerateStep.test  | ユニットテスト |
| CompleteStep      | wizard/**tests**/CompleteStep.test  | ユニットテスト |

### テストケース設計方針

- happy-dom 環境制約により `fireEvent` を使用（`userEvent` 禁止: P39）
- 各テストは `beforeEach` で完全独立（P9）
- IPC は `vi.stubGlobal` で `window.electronAPI` をモック
- CSS変数スタイルは Record 定数 export パターンで検証（P47）
```

**期待される成果物**:

- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-4/test-specification.md`

---

### タスク8: テスト実行確認（Red 状態）

**目的**: 全テストが失敗状態（Red）であることを確認する

**実行手順**:

1. テストを実行する（実装ファイルがないため全て失敗するはず）:

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
pnpm vitest run src/renderer/components/skill/wizard/__tests__/
```

2. 全テストが失敗することを確認する

3. Red 状態確認レポートを作成する:
   - `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-4/test-red-status.md`

**期待される成果物**:

- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-4/test-red-status.md`

---

## 実行手順

1. Phase 2 の設計成果物を確認し、テスト対象コンポーネントとインターフェースを把握する
2. テストファイルのディレクトリ構造を作成する（`wizard/__tests__/`）
3. 各サブコンポーネント（StepIndicator, DescribeStep, ConfigureStep, GenerateStep, CompleteStep）の単体テストを作成する
4. SkillCreateWizard 統合テスト（ステップ遷移、完了フロー、エラーフロー）を作成する
5. IPC モック（`window.electronAPI.skill.create`）を設定し、非同期テストを作成する
6. テストを実行し、全件 FAIL（Red）を確認する: `cd apps/desktop && pnpm vitest run src/renderer/components/skill/`
7. テスト仕様書（`outputs/phase-4/test-specification.md`）とテスト Red ステータス（`outputs/phase-4/test-red-status.md`）を作成する

---

## 参照資料

| 参照資料                 | パス                                                                                           | 内容                        |
| ------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------- |
| Phase 1 要件定義         | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-1-requirements.md`                | 要件・ACに対するテスト観点  |
| Phase 2 設計             | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-2/architecture-design.md` | テスト対象の設計            |
| Phase 2 API仕様          | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-2/api-specification.md`   | IPC/Preload の契約観点      |
| Phase 3 設計レビュー     | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-3-design-review.md`               | レビュー指摘の反映          |
| UI/UX コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                        | コンポーネント仕様          |
| 実装パターン集           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`    | テストパターン（P39,P47等） |
| Agent SDK スキル仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`              | Skill API 型境界の検証      |
| IPC API 仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                           | IPC request/response 契約   |
| コンポーネントテスト仕様 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`              | UIテスト設計パターン        |
| アクセシビリティ試験仕様 | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`                   | WCAG テスト観点             |
| 既存テスト参照           | `apps/desktop/src/renderer/components/skill/__tests__/SkillAnalysisView.test.tsx`              | テストスタイル参考          |

---

## 統合テスト連携

**Phase 4 での必須アクション**:

- [ ] ウィザード全体のステップ遷移テストシナリオを作成
- [ ] IPC 呼び出し成功・失敗シナリオを作成
- [ ] バリデーション（空入力 disabled）シナリオを作成
- [ ] エラーハンドリングシナリオを作成
- [ ] アクセシビリティテストシナリオを作成（ARIA属性）

---

## 多角的チェック観点

- **型安全性**: Props の型定義が適切か（P46: HTMLAttributes 衝突に注意）
- **テスト独立性**: `beforeEach` でのモック・状態リセットが行われているか
- **IPC モック品質**: `vi.stubGlobal` で `window.electronAPI` が正しくモックされているか
- **happy-dom 制約**: `userEvent` が混入していないか（`fireEvent` のみ使用）
- **アクセシビリティ**: ARIA属性、キーボード操作のテストが含まれているか

---

## 成果物

| 成果物                   | パス                                                                                          | 内容           |
| ------------------------ | --------------------------------------------------------------------------------------------- | -------------- |
| StepIndicator テスト     | `apps/desktop/src/renderer/components/skill/wizard/__tests__/StepIndicator.test.tsx`          | ユニットテスト |
| DescribeStep テスト      | `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`           | ユニットテスト |
| ConfigureStep テスト     | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConfigureStep.test.tsx`          | ユニットテスト |
| GenerateStep テスト      | `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`           | ユニットテスト |
| CompleteStep テスト      | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`           | ユニットテスト |
| SkillCreateWizard テスト | `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`             | 統合テスト     |
| テスト仕様書             | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-4/test-specification.md` | テスト設計文書 |
| Red 状態確認             | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-4/test-red-status.md`    | テスト失敗確認 |

---

## 完了条件

- [ ] StepIndicator のユニットテストが作成されている
- [ ] DescribeStep のユニットテストが作成されている（P39: fireEvent 使用）
- [ ] ConfigureStep のユニットテストが作成されている（P39: fireEvent 使用）
- [ ] GenerateStep のユニットテストが作成されている
- [ ] CompleteStep のユニットテストが作成されている
- [ ] SkillCreateWizard の統合テストが作成されている（IPC モック含む）
- [ ] テスト仕様書が作成されている
- [ ] 全テストが失敗状態（Red）であることが確認されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（タスク1〜8）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（テストファイル6本 + 仕様書 + Red確認）が全て生成されていることを確認
- [ ] artifacts.json の Phase 4 ステータスを更新

---

## サブタスク管理

Phase 4 完了後に以下を確認:

- テストファイルが `git status` で untracked として存在する
- `cd apps/desktop && pnpm vitest run src/renderer/components/skill` でエラーが出る（Red 状態）
- 次 Phase の実装者が参照できるようにテストファイルのパスを artifacts.json に記録

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS で完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/skill-create-wizard/phase-5-implementation.md`
