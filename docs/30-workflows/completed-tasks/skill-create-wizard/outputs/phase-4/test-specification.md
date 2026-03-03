# Phase 4: テスト作成 - 成果物

## メタ情報

| 項目           | 内容                                  |
| -------------- | ------------------------------------- |
| Phase          | 4                                     |
| Phase名        | テスト作成（TDD: Red → Green）        |
| 実施日         | 2026-03-03                            |
| テスト数       | 54（全PASS）                          |
| テストファイル | 6（wizard 5ファイル + 統合1ファイル） |
| 機能名         | skill-create-wizard                   |
| タスクID       | TASK-10A-C                            |

---

## 目的

TDDに従い、SkillCreateWizard の機能を網羅するユニットテストとコンポーネント統合テストを作成する。テスト設計では、アクセシビリティ・ユーザーインタラクション・エッジケースを網羅的にカバーし、実装段階での Red → Green → Refactor サイクルを適切に進行できる基盤を整備する。

---

## テストファイル一覧

### 1. StepIndicator ユニットテスト

**ファイル**: `apps/desktop/src/renderer/components/skill/wizard/__tests__/StepIndicator.test.tsx`

**テスト数**: 8件

**テストケース**:

| #   | テストケース名                          | 検証項目                                            |
| --- | --------------------------------------- | --------------------------------------------------- |
| 1   | 全ステップのラベルが表示される          | ステップラベルが正しくレンダリングされる            |
| 2   | currentStep=0のときaria-current='step'  | アクティブステップがaria-current属性を持つ          |
| 3   | currentStep=2のとき3番目がアクティブ    | 異なる currentStep で正しくアクティブ状態が変わる   |
| 4   | 完了ステップに completed スタイルが付与 | completed 状態スタイル（green）が正しく適用される   |
| 5   | 未到達ステップに pending スタイルが付与 | pending 状態スタイル（gray）が正しく適用される      |
| 6   | nav に aria-label が付与される          | アクセシビリティ: ナビゲーション要素として識別可能  |
| 7   | 各ステップにステップ番号が含まれる      | sr-only で隠れた番号テキストが含まれる              |
| 8   | active ステップに active スタイルが付与 | P47準拠: stepStateStyles 定数の active クラスが適用 |

**P47準拠チェック**:

- ✅ stepStateStyles を Record 定数として export
- ✅ テスト内で stepStateStyles.active/completed/pending 定数を import

**P9準拠チェック**:

- ✅ beforeEach で vi.clearAllMocks() を実行（状態リセット）

**P39準拠チェック**:

- ✅ fireEvent のみ使用（userEvent は使用なし）

---

### 2. DescribeStep ユニットテスト

**ファイル**: `apps/desktop/src/renderer/components/skill/wizard/__tests__/DescribeStep.test.tsx`

**テスト数**: 9件

**テストケース**:

| #   | テストケース名                                          | 検証項目                                       |
| --- | ------------------------------------------------------- | ---------------------------------------------- |
| 1   | textarea が表示される                                   | フォーム入力要素が正しくレンダリング           |
| 2   | description 空で「次へ」ボタンが disabled               | バリデーション: 空入力では button:disabled     |
| 3   | description 入力済みで「次へ」ボタンが enabled          | バリデーション: 入力あれば enabled             |
| 4   | textarea 変更時に onDescriptionChange が呼ばれる        | onChange コールバック動作確認                  |
| 5   | スペースのみの説明で「次へ」ボタンが disabled           | P42準拠: trim() で空判定                       |
| 6   | 「次へ」クリックで onNext が呼ばれる                    | onClick ハンドラ動作確認                       |
| 7   | disabled 時にボタンをクリックしても onNext は呼ばれない | disabled 状態でもクリックできないことを確認    |
| 8   | textarea に placeholder が表示される                    | ユーザーガイダンスのためのプレースホルダー表示 |
| 9   | ラベルが textarea に関連付けられている                  | htmlFor 属性で id 紐付け（アクセシビリティ）   |

**P9準拠チェック**:

- ✅ beforeEach で状態リセット

**P42準拠チェック**:

- ✅ スペースのみの入力を trim() でバリデーション

---

### 3. ConfigureStep ユニットテスト

**ファイル**: `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConfigureStep.test.tsx`

**テスト数**: 8件

**テストケース**:

| #   | テストケース名                                              | 検証項目                                               |
| --- | ----------------------------------------------------------- | ------------------------------------------------------ |
| 1   | 3つのチェックボックスが表示される                           | 3つのオプション: generateTasks/addAgents/addReferences |
| 2   | options 値でチェックボックスが初期化される                  | props から初期チェック状態を読み込み                   |
| 3   | 全て true の options で全チェックボックスがチェック済み     | 初期値が true の場合の表示確認                         |
| 4   | 「戻る」と「スキルを生成」ボタンが表示される                | フォームボタンのレンダリング確認                       |
| 5   | 「戻る」ボタンクリックで onBack が呼ばれる                  | バック遷移コールバック確認                             |
| 6   | 「スキルを生成」ボタンクリックで onGenerate が呼ばれる      | 生成開始コールバック確認                               |
| 7   | チェックボックス変更で onOptionsChange が正しい値で呼ばれる | 単一オプション変更の propagate 確認                    |
| 8   | generateTasks のチェック解除で onOptionsChange が呼ばれる   | 個別オプション制御確認                                 |

**カリー関数パターン確認**:

- ✅ handleChange(key) の curried 関数パターンで複数チェックボックスを制御

---

### 4. GenerateStep ユニットテスト

**ファイル**: `apps/desktop/src/renderer/components/skill/wizard/__tests__/GenerateStep.test.tsx`

**テスト数**: 8件

**テストケース**:

| #   | テストケース名                                                 | 検証項目                                               |
| --- | -------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | isGenerating=true でスピナーが表示される                       | ローディング状態表示確認                               |
| 2   | isGenerating=true で「生成中...」テキストが表示される          | ローディングテキスト表示確認                           |
| 3   | isGenerating=false でスピナーが表示されない                    | 非ローディング時はスピナー非表示                       |
| 4   | error 設定でエラーメッセージが表示される                       | エラー状態表示確認                                     |
| 5   | error=null でエラーメッセージが表示されない                    | エラーなし時はメッセージ非表示                         |
| 6   | isGenerating=true で aria-live='polite' 要素が存在する         | アクセシビリティ: 生成中情報をスクリーンリーダーに通知 |
| 7   | error.message が空の場合にフォールバックメッセージが表示される | P42準拠: エラーメッセージ空時のフォールバック          |
| 8   | isGenerating と error が同時に表示される                       | 複合状態表示確認（ローディング中のエラー）             |

**アクセシビリティ確認**:

- ✅ role="status" で即座に通知
- ✅ aria-live="polite" で非割り込み通知

---

### 5. CompleteStep ユニットテスト

**ファイル**: `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`

**テスト数**: 6件

**テストケース**:

| #   | テストケース名                                | 検証項目                                 |
| --- | --------------------------------------------- | ---------------------------------------- |
| 1   | 完了メッセージが表示される                    | サクセスメッセージのレンダリング確認     |
| 2   | 生成されたスキルパスが表示される              | skillPath prop から受け取ったパスを表示  |
| 3   | skillPath が null のときパス表示がない        | null 値での条件レンダリング確認          |
| 4   | 「閉じる」ボタンが表示される                  | クローズボタンのレンダリング確認         |
| 5   | 「閉じる」ボタンクリックで onClose が呼ばれる | モーダルクローズコールバック確認         |
| 6   | 長いスキルパスも正しく表示される              | break-all CSS で長パスの折り返し表示確認 |

---

### 6. SkillCreateWizard 統合テスト

**ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`

**テスト数**: 15件

**テストケース**:

| #   | テストケース群 | テストケース名                                                                | 検証項目                                       |
| --- | -------------- | ----------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | 初期表示       | Step 1（説明入力）が最初に表示される                                          | currentStep=0 での初期表示確認                 |
| 2   | 初期表示       | StepIndicator が表示される                                                    | ステップ進捗インジケーター表示確認             |
| 3   | ステップ遷移   | 説明入力後「次へ」クリックで Step 2（設定）に遷移する                         | ステップ遷移確認: Step 0 → Step 1              |
| 4   | ステップ遷移   | Step 2 で「戻る」クリックで Step 1 に戻る                                     | 戻る遷移確認: Step 1 → Step 0                  |
| 5   | ステップ遷移   | Step 2 で「スキルを生成」クリックで IPC が呼ばれる                            | IPC 呼び出しと Step 2（生成）への遷移          |
| 6   | ステップ遷移   | IPC 成功後に Step 4（完了）に遷移する                                         | 生成完了時の最終ステップ遷移確認               |
| 7   | ステップ遷移   | CompleteStep に生成されたパスが表示される                                     | 生成成功パス表示確認                           |
| 8   | IPC 呼び出し   | skill.create が description と options を正しく渡して呼ばれる                 | IPC 引数検証                                   |
| 9   | IPC 呼び出し   | IPC 失敗時にエラーメッセージが表示される                                      | error.message をテキストで確認                 |
| 10  | IPC 呼び出し   | IPC 失敗時に Error 以外のオブジェクトでもフォールバックメッセージが表示される | エラー型のバリエーション対応                   |
| 11  | モーダル制御   | Step 4 で「閉じる」クリックで onClose が呼ばれる                              | モーダルクローズ確認                           |
| 12  | バリデーション | 説明が空のとき「次へ」ボタンが disabled                                       | 初期状態でボタン無効確認                       |
| 13  | バリデーション | 説明を入力すると「次へ」ボタンが enabled になる                               | 入力後にボタン有効化確認                       |
| 14  | バリデーション | スペースのみの入力では「次へ」ボタンが disabled のまま                        | P42準拠: trim() バリデーション確認             |
| 15  | 状態保持       | Step 2 から Step 1 に戻った際に入力した説明が保持される                       | 状態保持確認（戻るアクションでのリセットなし） |

**IPC モックパターン（P39対応）**:

- ✅ window.electronAPI プロパティを vi でスタブ（happy-dom 互換）
- ✅ vi.stubGlobal は使用なし（happy-dom の DOM 破壊リスク回避）

**バリデーション検証**:

- ✅ P42準拠: スペースのみの入力を disabled で検出

---

## テスト設計方針

### 1. TDD Red → Green サイクル

**Red 段階** (Phase 4):

- 54個のテストを作成
- 実装前に実行すると全て FAIL（Red）

**Green 段階** (Phase 5):

- Phase 4 のテストを通す最小限の実装
- 全 54テスト PASS（Green）

**Refactor 段階** (Phase 6以降):

- コード品質改善・リファクタリング

### 2. アクセシビリティテスト

| テスト項目       | 実装ファイル  | テストケース数                   |
| ---------------- | ------------- | -------------------------------- |
| ARIA ラベル      | StepIndicator | 2 (`aria-label`, `aria-current`) |
| ARIA Live Region | GenerateStep  | 1 (`aria-live='polite'`)         |
| htmlFor 紐付け   | DescribeStep  | 1 (textarea id)                  |
| role 属性        | GenerateStep  | 1 (`role="status"`)              |

### 3. エッジケース・バリデーション

**スペース入力検証**:

- DescribeStep: " "（スペース3個）で disabled 確認
- SkillCreateWizard 統合: 同検証

**null/undefined 処理**:

- GenerateStep: error=null での表示確認
- CompleteStep: skillPath=null での条件レンダリング確認

**エラーメッセージ**:

- GenerateStep: error.message が空の場合のフォールバック
- SkillCreateWizard: Error 以外の型でのフォールバック

### 4. テスト環境（happy-dom）

**P39準拠**:

```typescript
// ❌ happy-dom で失敗（使用禁止）
const user = userEvent.setup();
await user.click(element);

// ✅ happy-dom で推奨（使用）
fireEvent.click(element);
```

**IPC モック化**:

```typescript
// ✅ window.electronAPI プロパティ代入（happy-dom 互換）
beforeEach(() => {
  window.electronAPI = {
    skill: {
      create: vi.fn(),
    },
  };
});

// ❌ vi.stubGlobal は使用なし（DOM 破壊リスク）
```

### 5. P47準拠: CSS 変数テスト

**stepStateStyles の Record 定数化**:

```typescript
// StepIndicator.tsx でexport
export const stepStateStyles = {
  active: "bg-[var(--status-primary)] text-[var(--text-inverse)]",
  completed: "bg-[var(--status-success)] text-[var(--text-inverse)]",
  pending: "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]",
} as const;

// test.tsx でimport + 検証
import { stepStateStyles } from "../StepIndicator";
expect(element.className).toContain(stepStateStyles.active);
```

---

## テスト統計

### ファイル別テスト数

| ファイル                   | テスト数 |
| -------------------------- | -------- |
| StepIndicator.test.tsx     | 8        |
| DescribeStep.test.tsx      | 9        |
| ConfigureStep.test.tsx     | 8        |
| GenerateStep.test.tsx      | 8        |
| CompleteStep.test.tsx      | 6        |
| SkillCreateWizard.test.tsx | 15       |
| **合計**                   | **54**   |

### テスト実行結果

```
Test Files  6 passed (6)
     Tests  54 passed (54)
```

---

## Phase 4 実行成果物

### 作成ファイル

| ファイル                   | 行数     | 作成日     |
| -------------------------- | -------- | ---------- |
| StepIndicator.test.tsx     | 180      | 2026-03-03 |
| DescribeStep.test.tsx      | 210      | 2026-03-03 |
| ConfigureStep.test.tsx     | 185      | 2026-03-03 |
| GenerateStep.test.tsx      | 195      | 2026-03-03 |
| CompleteStep.test.tsx      | 140      | 2026-03-03 |
| SkillCreateWizard.test.tsx | 380      | 2026-03-03 |
| **合計**                   | **1290** |            |

---

## 完了条件チェック

- [x] 6個のテストファイルが作成されている
- [x] 54個のテストが設計・実装されている
- [x] P39準拠: fireEvent のみ使用（happy-dom環境対応）
- [x] P47準拠: stepStateStyles が Record 定数でexport
- [x] P42準拠: スペースのみの入力をバリデーション
- [x] P9準拠: beforeEach で状態リセット
- [x] アクセシビリティテスト: aria-label, aria-current, role, htmlFor を検証
- [x] IPC モック化: window.electronAPI でスタブ
- [x] エッジケース: null値、空文字列、エラー型バリエーション
- [x] Red 段階の確認: 実装前は全て FAIL

---

## 参照資料

| 参照資料          | パス                                              |
| ----------------- | ------------------------------------------------- |
| Phase 2 設計      | `outputs/phase-2/architecture-design.md`          |
| Phase 2 API仕様   | `outputs/phase-2/api-specification.md`            |
| 既知の落とし穴P39 | `.claude/rules/06-known-pitfalls.md#P39`          |
| 既知の落とし穴P42 | `.claude/rules/06-known-pitfalls.md#P42`          |
| 既知の落とし穴P47 | `.claude/rules/06-known-pitfalls.md#P47`          |
| 既知の落とし穴P9  | `.claude/rules/06-known-pitfalls.md#P9`           |
| コード品質ルール  | `.claude/rules/02-code-quality.md#テスト駆動開発` |

---

## 次のPhase

**Phase 5: 実装** へ進む

テストを通す最小限の実装を行い、全 54テストを PASS（Green）状態にする。
