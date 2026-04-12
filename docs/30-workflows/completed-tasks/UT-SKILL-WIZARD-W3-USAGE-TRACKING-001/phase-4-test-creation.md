# Phase 4: TDD Red：テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase 番号 | 4                                          |
| Phase 名   | TDD Red：テスト作成                        |
| 前提 Phase | 3（設計レビューゲート：PASS または MINOR） |
| 後続 Phase | 5（実装）                                  |
| ステータス | 未実施                                     |
| 作成日     | 2026-04-11                                 |
| タスク ID  | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001      |

---

## 目的

TDD の Red フェーズとして、`skill_wizard_*` 計装に対するテストコードを先に作成し、
**全テストが失敗（Red）している状態**を作る。

Phase 5（実装）では、ここで作成したテストを全て Green にすることが目標となる。
Phase 4 終了時点でテストが 1 件でも通過している場合は、実装が先行してしまっているため要確認とする。

---

## Private Method テスト方針

`SkillCreateWizard.tsx` のハンドラ関数（`handleStep0Next` 等）は React コンポーネント内部の
クロージャとして定義されており、コンポーネント外から直接呼び出すことはできない。
以下の 2 つの方針のいずれかを使用する。

**方針 A（推奨）: public callback 経由**

- テスト内で `render(<SkillCreateWizard ... />)` した後、
  対象ステップの「次へ」ボタン（`data-testid` 属性で特定）を `fireEvent.click()` または `userEvent.click()` で押下することで、
  内部ハンドラを間接的に発火させる。
- `data-testid` の命名例: `skill-info-step-submit`（Step 0）/ `conversation-round-step-generate`（Step 1）
- この方針を優先する理由: コンポーネントの内部実装に依存せず、ユーザー操作を模倣するためリファクタリング耐性が高い。

**方針 B（代替）: `(component as unknown as ComponentPrivate)` キャスト**

- TypeScript の型システムを迂回して内部関数に直接アクセスする方法。
- 使用例: `(result.current as unknown as { handleStep0Next: () => void }).handleStep0Next()`
- この方針は内部実装への依存が強いため、方針 A が使用できない場合のみ採用する。
- 採用した場合は、テストコード内に `// NOTE: 方針Bを使用。内部実装変更時に要更新` のコメントを必須とする。

---

## テストコマンド

```bash
# trackEvent.ts スタブ全分岐テスト
pnpm --filter @repo/desktop test:run -- src/renderer/utils/__tests__/trackEvent.test.ts

# SkillCreateWizard.tsx 計装テスト
pnpm --filter @repo/desktop test:run -- src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx

# CompleteStep.tsx 計装テスト
pnpm --filter @repo/desktop test:run -- src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx

# 全テスト一括実行（カバレッジなし）
pnpm --filter @repo/desktop test:run

# カバレッジ付き実行（Phase 7 以降で使用）
pnpm --filter @repo/desktop test:run -- --coverage
```

---

## 実行タスク

### タスク 1: trackEvent.ts スタブ全分岐テスト作成（AC-7 対応）

**対象ファイル**: `apps/desktop/src/renderer/utils/__tests__/trackEvent.test.ts`（新規作成または既存ファイルへの追記）

**目的**: `trackEvent.ts` の dev/prod 分岐を全てカバーし、カバレッジ 100% を達成するためのテストを作成する。

**手順**:

1. `apps/desktop/src/renderer/utils/__tests__/` ディレクトリに `trackEvent.test.ts` が存在するか確認する
   - 存在する場合: 既存ファイルの内容を読み、既存テストケースとの重複を避けながら追記する
   - 存在しない場合: 新規作成する

2. ファイル先頭に以下の import と mock 設定を記述する：

   ```typescript
   import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
   import { trackEvent } from "../trackEvent";
   ```

3. 以下のテストケースを全て記述する（Phase 4 時点では全て Red になること）：

   **テストスイート 1: dev 環境での console.info 出力（分岐 A）**
   - テスト名: `dev環境でtrackEventを呼ぶとconsole.infoが呼ばれること`
   - 設定: `vi.stubEnv('NODE_ENV', 'development')` または `process.env.NODE_ENV = 'development'`
   - 検証: `const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})` を使い、`trackEvent('skill_wizard_open', { source: 'direct' })` 呼び出し後に `expect(consoleSpy).toHaveBeenCalledWith('[trackEvent]', 'skill_wizard_open', { source: 'direct' })` を確認

   **テストスイート 2: prod 環境での no-op（分岐 B）**
   - テスト名: `prod環境でtrackEventを呼ぶとconsole.infoが呼ばれないこと`
   - 設定: `vi.stubEnv('NODE_ENV', 'production')` または `process.env.NODE_ENV = 'production'`
   - 検証: `const consoleSpy = vi.spyOn(console, 'info')` の後、`trackEvent('skill_wizard_open', { source: 'direct' })` を呼び出し `expect(consoleSpy).not.toHaveBeenCalled()` を確認
   - teardown: `afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); })` を使って環境変数を元に戻す

   **テストスイート 3: 新規 skill_wizard_open イベントの型安全呼び出し**
   - テスト名: `skill_wizard_openイベントをsource: lifecycle_panelで呼べること`
   - 検証: `trackEvent('skill_wizard_open', { source: 'lifecycle_panel' })` がエラーなく実行できること（実行時エラーが発生しないこと）

   **テストスイート 4: 新規 skill_wizard_step_complete イベントの型安全呼び出し**
   - テスト名: `skill_wizard_step_completeイベントをstep:0で呼べること`
   - 検証: `trackEvent('skill_wizard_step_complete', { step: 0, stepName: 'スキル情報入力' })` がエラーなく実行できること

   **テストスイート 5: 新規 skill_wizard_next_action イベントの型安全呼び出し**
   - テスト名: `skill_wizard_next_actionイベントをaction:editで呼べること`
   - 検証: `trackEvent('skill_wizard_next_action', { action: 'edit' })` がエラーなく実行できること
   - テスト名: `skill_wizard_next_actionイベントをaction:executeで呼べること`
   - 検証: `trackEvent('skill_wizard_next_action', { action: 'execute' })` がエラーなく実行できること
   - テスト名: `skill_wizard_next_actionイベントをaction:closeで呼べること`
   - 検証: `trackEvent('skill_wizard_next_action', { action: 'close' })` がエラーなく実行できること

   **テストスイート 6: 新規 skill_wizard_abandon イベントの型安全呼び出し**
   - テスト名: `skill_wizard_abandonイベントをlastStep:0で呼べること`
   - 検証: `trackEvent('skill_wizard_abandon', { lastStep: 0 })` がエラーなく実行できること

   **テストスイート 7: 既存イベントの回帰テスト**
   - テスト名: `既存イベントskill_wizard_startedが引き続き呼べること`
   - 検証: `trackEvent('skill_wizard_started', {})` がエラーなく実行できること
   - テスト名: `既存イベントskill_wizard_step1_completedが引き続き呼べること`
   - 検証: `trackEvent('skill_wizard_step1_completed', { method: 'complete', skippedAtQuestion: null })` がエラーなく実行できること

4. テストを実行し、全ケースが Red（失敗）であることを確認する（AC-1〜4 はまだ実装されていないため失敗するはず）
   - テストスイート 3〜7 は TypeScript コンパイルエラーで失敗する（新しい型がまだ存在しないため）
   - テストスイート 1〜2 は実装済みの分岐を確認するため、既存のコードで通過する可能性がある
   - **重要**: テストスイート 1〜2 が通過していても Phase 4 として問題ない（dev/prod 分岐はすでに実装済みのため）

**完了判定**: `trackEvent.test.ts` に 10 件以上のテストケースが記述されており、新規イベント型（AC-1〜4）に対応するテストが TypeScript コンパイルエラーで Red 状態であること

---

### タスク 2: SkillCreateWizard.tsx 計装テスト作成（AC-5, AC-8 対応）

**対象ファイル**: `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`（既存ファイルへの追記）

**目的**: `SkillCreateWizard.tsx` の 5 つの計装ポイント（P-1〜P-5）に対するテストを作成する。

**前提確認**: テスト作成前に以下を確認する

1. `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx` を読む
2. 既存のテストケースの構造（describe/it のネスト・beforeEach の設定・モックの設定）を把握する
3. `trackEvent` のモックがすでに設定されているかを確認する（設定済みの場合は追記のみ）

**手順**:

1. ファイルの先頭 import セクションに以下を追加する（未追加の場合のみ）：

   ```typescript
   import { trackEvent } from "../../../utils/trackEvent";
   vi.mock("../../../utils/trackEvent", () => ({
     trackEvent: vi.fn(),
   }));
   ```

2. `beforeEach` に以下を追加する（未追加の場合のみ）：

   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

3. 以下の 7 つのテストケースを `describe('計装（trackEvent）', () => { ... })` ブロック内に追記する：

   **ケース TC-SCW-01: マウント時の skill_wizard_open 発火（デフォルト source）**
   - テスト名: `マウント時にskill_wizard_openがsource:directで発火すること`
   - 操作: `render(<SkillCreateWizard />)` を呼び出す（`source` prop なし）
   - 検証: `expect(trackEvent).toHaveBeenCalledWith('skill_wizard_open', { source: 'direct' })`

   **ケース TC-SCW-02: マウント時の skill_wizard_open 発火（source props 指定）**
   - テスト名: `source=lifecycle_panelを渡すとskill_wizard_openがlifecycle_panelで発火すること`
   - 操作: `render(<SkillCreateWizard source="lifecycle_panel" />)` を呼び出す
   - 検証: `expect(trackEvent).toHaveBeenCalledWith('skill_wizard_open', { source: 'lifecycle_panel' })`

   **ケース TC-SCW-03: Step 0 完了時の skill_wizard_step_complete 発火**
   - テスト名: `Step0完了時にskill_wizard_step_completeがstep:0で発火すること`
   - 操作: `render(<SkillCreateWizard />)` 後、Step 0 の送信ボタン（`data-testid="skill-info-step-submit"` 等）を `userEvent.click()` で押下する
   - 検証: `expect(trackEvent).toHaveBeenCalledWith('skill_wizard_step_complete', { step: 0, stepName: 'スキル情報入力' })`
   - 注記: ボタンの `data-testid` 値は `SkillInfoStep.tsx` を読んで実際の値を使用すること

   **ケース TC-SCW-04: Step 1 完了時の skill_wizard_step_complete 発火**
   - テスト名: `Step1完了時にskill_wizard_step_completeがstep:1で発火すること`
   - 操作: Step 1 に遷移後（または直接 `currentStep=1` を初期設定して）、Step 1 の「生成開始」ボタンを押下する
   - 検証: `expect(trackEvent).toHaveBeenCalledWith('skill_wizard_step_complete', { step: 1, stepName: '詳細設定' })`

   **ケース TC-SCW-05: Step 2 完了時の skill_wizard_step_complete 発火**
   - テスト名: `Step2完了時にskill_wizard_step_completeがstep:2で発火すること`
   - 操作: Step 2 の生成完了コールバックをトリガーする
   - 検証: `expect(trackEvent).toHaveBeenCalledWith('skill_wizard_step_complete', { step: 2, stepName: '生成' })`

   **ケース TC-SCW-06: 未完了でアンマウント時の skill_wizard_abandon 発火**
   - テスト名: `Step3未到達でアンマウントするとskill_wizard_abandonが発火すること`
   - 操作: `const { unmount } = render(<SkillCreateWizard />)` 後、Step 0 のまま `unmount()` を呼ぶ
   - 検証: `expect(trackEvent).toHaveBeenCalledWith('skill_wizard_abandon', { lastStep: 0 })`

   **ケース TC-SCW-07: Step 3 到達後アンマウント時の skill_wizard_abandon 非発火**
   - テスト名: `Step3到達後にアンマウントするとskill_wizard_abandonが発火しないこと`
   - 操作: Step 3（完了ステップ）まで進めた後、`unmount()` を呼ぶ
   - 検証: `expect(trackEvent).not.toHaveBeenCalledWith('skill_wizard_abandon', expect.anything())`

4. テストを実行し、TC-SCW-01〜TC-SCW-07 が全て Red（失敗）であることを確認する
   - 失敗理由: `SkillCreateWizard.tsx` にまだ計装コードが追加されていないため

**完了判定**: `SkillCreateWizard.test.tsx` に TC-SCW-01〜TC-SCW-07 の 7 ケースが追記されており、全て Red 状態であること

---

### タスク 3: CompleteStep.tsx 計装テスト作成（AC-6, AC-9 対応）

**対象ファイル**: `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`（既存ファイルへの追記、または新規作成）

**目的**: `CompleteStep.tsx` のネクストアクション選択時の `skill_wizard_next_action` 発火テストを作成する。

**前提確認**: テスト作成前に以下を確認する

1. `apps/desktop/src/renderer/components/skill/wizard/__tests__/` ディレクトリを確認し、`CompleteStep.test.tsx` の有無を確認する
2. 存在する場合: 既存テストケースの構造を把握してから追記する
3. 存在しない場合: 新規作成する

**手順**:

1. ファイルの先頭 import セクションに以下を追加する（未追加の場合のみ）：

   ```typescript
   import { describe, it, expect, vi, beforeEach } from "vitest";
   import { render, screen } from "@testing-library/react";
   import userEvent from "@testing-library/user-event";
   import { CompleteStep } from "../CompleteStep";
   import { trackEvent } from "../../../../utils/trackEvent";

   vi.mock("../../../../utils/trackEvent", () => ({
     trackEvent: vi.fn(),
   }));
   ```

   - 注記: `CompleteStep.test.tsx` が `wizard/__tests__/` に置かれる場合の `trackEvent` の相対パスは `../../../../utils/trackEvent` である（`__tests__` → `wizard` → `skill` → `components` → `renderer` → `utils`）

2. `beforeEach` に以下を追加する（未追加の場合のみ）：

   ```typescript
   beforeEach(() => {
     vi.clearAllMocks();
   });
   ```

3. 以下の 4 つのテストケースを `describe('計装（trackEvent）', () => { ... })` ブロック内に追記する：

   **ケース TC-CS-01: 今すぐ実行するボタン押下時の発火**
   - テスト名: `今すぐ実行するボタン押下時にskill_wizard_next_actionがaction:executeで発火すること`
   - 操作: `render(<CompleteStep onExecuteNow={vi.fn()} />)` 後、`data-testid="complete-step-action-execute"` のボタンを `userEvent.click()` で押下する
   - 検証: `expect(trackEvent).toHaveBeenCalledWith('skill_wizard_next_action', { action: 'execute' })`

   **ケース TC-CS-02: エディタで開くボタン押下時の発火**
   - テスト名: `エディタで開くボタン押下時にskill_wizard_next_actionがaction:editで発火すること`
   - 操作: `render(<CompleteStep onOpenInEditor={vi.fn()} />)` 後、`data-testid="complete-step-action-open-editor"` のボタンを `userEvent.click()` で押下する
   - 検証: `expect(trackEvent).toHaveBeenCalledWith('skill_wizard_next_action', { action: 'edit' })`

   **ケース TC-CS-03: 別のスキルを作るボタン押下時の発火**
   - テスト名: `別のスキルを作るボタン押下時にskill_wizard_next_actionがaction:closeで発火すること`
   - 操作: `render(<CompleteStep onCreateAnother={vi.fn()} />)` 後、`data-testid="complete-step-action-create-another"` のボタンを `userEvent.click()` で押下する
   - 検証: `expect(trackEvent).toHaveBeenCalledWith('skill_wizard_next_action', { action: 'close' })`

   **ケース TC-CS-04: 閉じるボタン押下時の非発火（後方互換ケース）**
   - テスト名: `閉じるボタン押下時にskill_wizard_next_actionが発火しないこと`
   - 操作: `render(<CompleteStep onClose={vi.fn()} />)` 後、閉じるボタン（`text='閉じる'` 等で特定）を `userEvent.click()` で押下する
   - 検証: `expect(trackEvent).not.toHaveBeenCalledWith('skill_wizard_next_action', expect.anything())`

4. テストを実行し、TC-CS-01〜TC-CS-03 が Red（失敗）であることを確認する
   - TC-CS-04 は `CompleteStep.tsx` の `onClose` ボタンに `trackEvent` が呼ばれていないため Green になる可能性がある
   - TC-CS-01〜TC-CS-03 の失敗理由: `CompleteStep.tsx` にまだ `trackEvent` 呼び出しが追加されていないため

**完了判定**: `CompleteStep.test.tsx` に TC-CS-01〜TC-CS-04 の 4 ケースが追記されており、TC-CS-01〜TC-CS-03 が Red 状態であること

---

## Phase 4 全体の完了条件

- [ ] `trackEvent.test.ts` の新規テストケースが全て作成されている（最低 10 件）
- [ ] `SkillCreateWizard.test.tsx` に TC-SCW-01〜TC-SCW-07 の 7 ケースが追記されている
- [ ] `CompleteStep.test.tsx` に TC-CS-01〜TC-CS-04 の 4 ケースが追記されている
- [ ] AC-1〜AC-4 対応の新規イベント型テストが TypeScript コンパイルエラーで Red になっている
- [ ] AC-5 対応の SkillCreateWizard 計装テスト（TC-SCW-01〜07）が Red になっている
- [ ] AC-6 対応の CompleteStep 計装テスト（TC-CS-01〜03）が Red になっている
- [ ] 全テスト実行コマンド（`pnpm --filter @repo/desktop test:run`）の結果を `outputs/phase-4/test-run-red.log` に記録している

---

## 成果物

| 成果物ファイル                                                                      | 内容                                          |
| ----------------------------------------------------------------------------------- | --------------------------------------------- |
| `apps/desktop/src/renderer/utils/__tests__/trackEvent.test.ts`                      | trackEvent.ts スタブ全分岐テスト（新規/追記） |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`   | 計装テスト追記（TC-SCW-01〜07）               |
| `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` | 計装テスト（TC-CS-01〜04）                    |
| `outputs/phase-4/test-run-red.log`                                                  | Red 状態のテスト実行ログ（全失敗ケース一覧）  |

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスク（タスク 1〜3）を 100% 実行完了
- [ ] 全テストケースの Red 状態を確認し、失敗理由（コンパイルエラー or アサーション失敗）を記録
- [ ] `outputs/phase-4/test-run-red.log` にテスト実行結果を保存
- [ ] `artifacts.json` の Phase 4 ステータスを `completed` に更新
