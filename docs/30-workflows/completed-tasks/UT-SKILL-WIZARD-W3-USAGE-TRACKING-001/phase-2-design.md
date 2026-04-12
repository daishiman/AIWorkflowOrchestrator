# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase 番号 | 2                                     |
| Phase 名   | 設計                                  |
| 前提 Phase | 1（要件定義）                         |
| 後続 Phase | 3（設計レビューゲート）               |
| ステータス | 未実施                                |
| 作成日     | 2026-04-11                            |
| タスク ID  | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001 |

---

## 目的

`skill_wizard_*` 型定義の追加設計を行い、各計装ポイント（P-1〜P-6）の責務境界を確定する。
テスト戦略（TDD サイクル・モック方針・カバレッジ計測手順）を文書化し、Phase 4 の TDD Red
フェーズで迷いなくテストコードを書ける状態を作る。

具体的には以下の 3 点を達成する：

1. 既存 `SkillWizardEvents` 型との整合性を維持しながら、4 つの新規イベント型を設計する
2. `SkillCreateWizard.tsx` での `useEffect` + `useRef` パターンによる abandon 発火制御を設計する
3. Vitest + `vi.mock` を使ったスタブ全分岐テスト戦略を文書化する

---

## 実行タスク

### タスク 1: skill*wizard*\* イベント型定義の設計

**目的**: Phase 5 の実装で使用する型定義の完全な仕様を設計する。

**手順**:

1. `apps/desktop/src/renderer/utils/trackEvent.ts` を読み、現在の `SkillWizardEvents` 型の構造を確認する
2. 以下の 4 つの新規イベントに対して、型定義の詳細仕様を決定する：

   **`skill_wizard_open`**
   - ペイロード型: `{ source: 'lifecycle_panel' | 'direct' }`
   - `source` の値は `SkillCreateWizard` コンポーネントの呼び出し元（props 経由または環境変数）から決定する
   - `source` prop が渡されない場合のデフォルト値を `'direct'` とする

   **`skill_wizard_step_complete`**
   - ペイロード型: `{ step: number; stepName: string }`
   - `step` は 0 始まりの整数（`STEPS` 配列のインデックス）
   - `stepName` は `STEPS[step]` の値（例: `'スキル情報入力'`, `'詳細設定'`, `'生成'`）
   - Step 3（完了）は `skill_wizard_step_complete` ではなく `skill_wizard_next_action` で計装するため除外

   **`skill_wizard_next_action`**
   - 既存の `skill_wizard_next_action` 型（`action: 'execute' | 'open_editor' | 'create_another'`）は**置き換え**る
   - 新しいペイロード型: `{ action: 'edit' | 'execute' | 'close' }`
   - Breaking Change の対応: 既存の `skill_wizard_next_action` 呼び出し箇所（`SkillCreateWizard.tsx` 内）を全て新型に更新する
   - 検索コマンド: `grep -rn "skill_wizard_next_action" apps/desktop/src/renderer/` で呼び出し箇所を列挙する

   **`skill_wizard_abandon`**
   - ペイロード型: `{ lastStep: number }`
   - `lastStep` は `useRef<number>` で追跡する現在のステップインデックス（0〜3）
   - ウィザードが Step 3（完了）まで到達した場合は `abandon` を発火しない

3. 拡張方針を決定する：
   - `SkillWizardEvents` 型に 4 つの新規キーを追加する（ユニオン型ではなくオブジェクト型に新規プロパティを追加）
   - 旧 `skill_wizard_next_action` のペイロード型を新型で上書きする（既存呼び出し箇所の修正を Phase 5 で実施）
   - `skill_wizard_started` / `skill_wizard_step1_completed` / `skill_wizard_generation_completed` / `skill_skeleton_quality_feedback` の 4 つの既存イベントは**削除しない**（後方互換維持）

4. 型定義の最終形（設計書に記載する型定義案）を `outputs/phase-2/type-definition-design.md` に記録する

**完了判定**: 4 つの新規イベントの型定義仕様が全て決定し、既存イベントとの整合性確認が完了していること

---

### タスク 2: 計装ポイントの責務境界設計

**目的**: 各計装ポイント（P-1〜P-6）の実装方針を確定する。

**手順**:

1. **P-1: skill_wizard_open（SkillCreateWizard マウント時）**
   - `useEffect(() => { trackEvent('skill_wizard_open', { source }); }, [])` のパターンを採用する
   - `source` props を `SkillCreateWizardProps` に追加する設計とする（型: `'lifecycle_panel' | 'direct'`、デフォルト: `'direct'`）
   - 既存の `SkillCreateWizard` コンポーネントの props インターフェースに `source?` を追加する行番号を特定する

2. **P-2〜P-4: skill_wizard_step_complete（各ステップ完了ハンドラ）**
   - `handleStep0Next` 関数の末尾に `trackEvent('skill_wizard_step_complete', { step: 0, stepName: STEPS[0] })` を追加する設計とする
   - `handleGenerate(method)` 関数（Step 1 完了）の末尾に `trackEvent('skill_wizard_step_complete', { step: 1, stepName: STEPS[1] })` を追加する設計とする
   - Step 2（生成）完了時の `GenerateStep` から `SkillCreateWizard` に通知されるコールバック（`onGenerationComplete` 等）の末尾に `trackEvent('skill_wizard_step_complete', { step: 2, stepName: STEPS[2] })` を追加する設計とする
   - 各ハンドラ関数の名称と追加位置（既存コードの関数末尾）をコード設計書に記録する

3. **P-5: skill_wizard_abandon（SkillCreateWizard アンマウント時）**
   - `useRef<number>(0)` で現在のステップを追跡する `currentStepRef` を設計する
   - 各 `trackEvent('skill_wizard_step_complete', ...)` 呼び出し後に `currentStepRef.current = stepIndex` を更新する設計とする
   - `useRef<boolean>(false)` で完了フラグを追跡する `isCompletedRef` を設計する
   - Step 3 到達時（CompleteStep 表示時）に `isCompletedRef.current = true` を設定する設計とする
   - `useEffect` クリーンアップ関数で `if (!isCompletedRef.current) { trackEvent('skill_wizard_abandon', { lastStep: currentStepRef.current }); }` を発火する設計とする

4. **P-6: skill_wizard_next_action（CompleteStep ネクストアクション選択時）**
   - `CompleteStep` コンポーネントの `nextActions` 配列の `onClick` ハンドラを変更する設計とする
   - 変更方針 A（採用）: `CompleteStep` の各アクション `onClick` 内で直接 `trackEvent` を呼び出す（`CompleteStep` に `trackEvent` を import する）
   - 変更方針 B（不採用）: 親コンポーネントでラップしてから渡す（責務が分散するため不採用）
   - アクションと `action` 値のマッピング: `onExecuteNow` → `'execute'` / `onOpenInEditor` → `'edit'` / `onCreateAnother` → `'close'`
   - `onClose`（後方互換ボタン）のクリックは `skill_wizard_next_action` を発火しない

5. 設計内容を `outputs/phase-2/design.md` に記録する

**完了判定**: P-1〜P-6 の実装方針（追加場所・コード例・採用/不採用理由）が全て文書化されていること

---

### タスク 3: テスト戦略の確定

**目的**: Phase 4 の TDD Red フェーズで迷いなくテストコードを書けるよう、テスト戦略を文書化する。

**手順**:

1. **trackEvent.ts のスタブ化テスト戦略**
   - `vi.mock` を使った `trackEvent` のモック設定を設計する
     ```
     vi.mock('../../utils/trackEvent', () => ({
       trackEvent: vi.fn(),
     }));
     ```
   - dev/prod 環境分岐（`process.env.NODE_ENV`）のテスト方法を設計する：
     - dev 分岐テスト: `vi.spyOn(console, 'info')` を使い `console.info` が呼ばれることを確認
     - prod 分岐テスト: `import.meta.env.PROD` または `process.env.NODE_ENV = 'production'` 設定後に `console.info` が呼ばれないことを確認
   - カバレッジ 100% 達成のために必要なテストケースを列挙する：
     1. dev 環境で `trackEvent` を呼ぶと `console.info` が呼ばれること
     2. prod 環境で `trackEvent` を呼ぶと `console.info` が呼ばれないこと
     3. 型安全性: 存在しないイベント名を渡すと TypeScript コンパイルエラーになること（コンパイル時検証）

2. **SkillCreateWizard.tsx 計装テスト戦略**
   - テストファイル: `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx`
   - 各テストケースで `trackEvent` を `vi.mock` でモックし、`beforeEach(() => vi.clearAllMocks())` でリセットする
   - テストケース設計（Phase 4 で実装する Red ケース）：
     1. マウント時に `trackEvent('skill_wizard_open', { source: 'direct' })` が呼ばれること（AC-5 / P-1）
     2. `source='lifecycle_panel'` props でマウントすると `trackEvent('skill_wizard_open', { source: 'lifecycle_panel' })` が呼ばれること（AC-5 / P-1）
     3. Step 0 完了ハンドラ呼び出し後に `trackEvent('skill_wizard_step_complete', { step: 0, stepName: 'スキル情報入力' })` が呼ばれること（AC-5 / P-2）
     4. Step 1 完了ハンドラ呼び出し後に `trackEvent('skill_wizard_step_complete', { step: 1, stepName: '詳細設定' })` が呼ばれること（AC-5 / P-3）
     5. Step 2 完了後に `trackEvent('skill_wizard_step_complete', { step: 2, stepName: '生成' })` が呼ばれること（AC-5 / P-4）
     6. Step 3 未到達でアンマウントすると `trackEvent('skill_wizard_abandon', { lastStep: 0 })` が呼ばれること（AC-5 / P-5）
     7. Step 3 到達後にアンマウントすると `trackEvent('skill_wizard_abandon', ...)` が呼ばれないこと（AC-5 / P-5）

3. **CompleteStep.tsx 計装テスト戦略**
   - テストファイル: `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`（または既存テスト）
   - テストケース設計（Phase 4 で実装する Red ケース）：
     1. `onExecuteNow` ボタンクリック時に `trackEvent('skill_wizard_next_action', { action: 'execute' })` が呼ばれること（AC-6 / P-6）
     2. `onOpenInEditor` ボタンクリック時に `trackEvent('skill_wizard_next_action', { action: 'edit' })` が呼ばれること（AC-6 / P-6）
     3. `onCreateAnother` ボタンクリック時に `trackEvent('skill_wizard_next_action', { action: 'close' })` が呼ばれること（AC-6 / P-6）
     4. `onClose` ボタンクリック時に `trackEvent` が呼ばれないこと（AC-6 / P-6 の除外ケース）

4. **NON_VISUAL 証跡取得方針**
   - テスト実行コマンド: `pnpm --filter @repo/desktop test:run -- --coverage`
   - カバレッジレポート出力先: `apps/desktop/coverage/`
   - 証跡として保存するファイル: `coverage/lcov-report/index.html` の該当ファイル行カバレッジ
   - Phase 11 では screenshot を取得せず、`vitest --reporter=verbose` の出力テキストをコピーして証跡とする

5. **TDD サイクルの適用範囲**
   - Phase 4: Red（全テストが失敗することを確認）
   - Phase 5: Green（最小実装でテストを通過させる）
   - Phase 6: Refactor（テストを保ちながらコードを整理する）
   - Phase 4〜6 は TDD サイクルの 1 周として扱い、Phase 4 終了時点で全テストが Red 状態であることを必須とする

6. 設計内容を `outputs/phase-2/test-strategy.md` に記録する

**完了判定**: trackEvent.ts / SkillCreateWizard.tsx / CompleteStep.tsx の各テスト戦略・モック設定・全テストケース一覧が文書化されていること

---

## 参照資料

| ファイルパス                                                               | 参照目的                                     |
| -------------------------------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/renderer/utils/trackEvent.ts`                            | 既存型定義・スタブ分岐構造の確認             |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`         | ハンドラ関数名・props 構造・useEffect の確認 |
| `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`       | nextActions 配列・onClick 構造の確認         |
| `apps/desktop/src/renderer/utils/__tests__/`                               | 既存スタブ化パターンの確認                   |
| `docs/30-workflows/UT-SKILL-WIZARD-W3-USAGE-TRACKING-001/outputs/phase-1/` | Phase 1 成果物（計装ポイント一覧等）の参照   |

---

## 成果物

| 成果物ファイル                              | 内容                                                       |
| ------------------------------------------- | ---------------------------------------------------------- |
| `outputs/phase-2/design.md`                 | 計装ポイント P-1〜P-6 の実装方針・責務境界設計             |
| `outputs/phase-2/type-definition-design.md` | 4 つの新規イベント型定義仕様・既存型との整合性確認結果     |
| `outputs/phase-2/test-strategy.md`          | テスト戦略（モック方針・全テストケース一覧・証跡取得方針） |

---

## 完了条件

- [ ] `skill_wizard_open` / `skill_wizard_step_complete` / `skill_wizard_next_action` / `skill_wizard_abandon` の全 4 イベントの型定義仕様が設計されている
- [ ] 既存 `skill_wizard_next_action`（旧ペイロード型）との差分と移行方針が記録されている
- [ ] abandon イベントの発火タイミング制御方針（`useRef<boolean>` による完了フラグ）が決定されている
- [ ] P-6 の実装方針（CompleteStep 内で直接 `trackEvent` を呼ぶ）が採用/不採用理由とともに文書化されている
- [ ] `trackEvent.ts` スタブ全分岐テスト戦略が文書化されている（dev/prod 両分岐のカバレッジ 100% 達成方法を含む）
- [ ] SkillCreateWizard.tsx の 7 テストケースが一覧化されている
- [ ] CompleteStep.tsx の 4 テストケースが一覧化されている
- [ ] NON_VISUAL 証跡取得方針（Vitest coverage + verbose reporter）が決定されている

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスク（タスク 1〜3）を 100% 実行完了
- [ ] 各タスクの実行結果を明記（決定した型定義・設計方針・テストケース一覧を記録）
- [ ] 成果物 3 件（design.md / type-definition-design.md / test-strategy.md）が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 2 ステータスを `completed` に更新
