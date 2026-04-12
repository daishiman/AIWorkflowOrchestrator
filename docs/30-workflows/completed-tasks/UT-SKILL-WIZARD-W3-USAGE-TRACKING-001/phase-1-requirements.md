# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase 番号 | 1                                                        |
| Phase 名   | 要件定義                                                 |
| 前提 Phase | なし                                                     |
| 後続 Phase | 2（設計）                                                |
| ステータス | 未実施                                                   |
| 作成日     | 2026-04-11                                               |
| 機能名     | スキルウィザード使用率計装（trackEvent / Wave 3）        |
| タスク分類 | **NON_VISUAL**（Renderer 内部の計装のみ / 視覚差分なし） |
| タスク ID  | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                    |

---

## 目的

`trackEvent.ts` の現状スタブ化パターンを調査し、`skill_wizard_*` 系イベントの計装ポイントを確定する。
AC-1〜AC-9 の全受入条件を仕様書に明記し、Phase 2 以降の設計作業に必要な入力情報を揃える。

具体的には以下の 3 点を達成する：

1. `trackEvent.ts` の現在の実装（型定義・スタブパターン・呼び出し規約）を文書化する
2. `SkillCreateWizard.tsx` および `CompleteStep.tsx` の対象コンポーネントを読んで、5 つの計装ポイントの場所とペイロード仕様を確定する
3. AC-1〜AC-9 を本 Phase の成果物に明記し、カバレッジ目標を確定する

---

## 背景

`skill-wizard-redesign-lane` では Wave 0〜2 にわたってスキル作成ウィザードを全面改善した。
改善の効果を定量評価するためには使用率データが必要だが、現状はウィザードが開かれた回数・
各ステップの完了率・中断率・ネクストアクションの選択傾向を収集する仕組みが存在しない。

Issue #2018 は、Wave 3 の最終ステップとして、改善後のウィザードに計装（instrumentation）を
追加することを要求している。本 Phase 1 は、その計装を正確に設計するための要件を確定する。

`trackEvent.ts` はすでに `apps/desktop/src/renderer/utils/` に存在し、
`skill_wizard_started` / `skill_wizard_step1_completed` などの前世代イベントが定義されている。
本タスクでは以下の 4 つの新規イベントを追加する：

- `skill_wizard_open`
- `skill_wizard_step_complete`
- `skill_wizard_next_action`（既存の型定義と重複するため再設計が必要）
- `skill_wizard_abandon`

---

## 実行タスク

### タスク 1: trackEvent.ts の現状調査

**目的**: 既存実装の全容を把握し、新規イベント追加時の影響範囲を特定する。

**手順**:

1. `apps/desktop/src/renderer/utils/trackEvent.ts` をファイル全体で読む
2. `SkillWizardEvents` 型に定義されている全イベント名とペイロード型を一覧表として記録する
   - 現在定義されているイベント：`skill_wizard_started`, `skill_wizard_step1_completed`, `skill_wizard_generation_completed`, `skill_skeleton_quality_feedback`, `skill_wizard_next_action`
3. `trackEvent` 関数の実装（dev: `console.info` / prod: no-op の分岐）を確認し、その分岐構造を記録する
4. `trackEvent` がスタブ化されているか（vi.mock / vi.spyOn で上書き可能か）を確認するために、既存テストファイル（`apps/desktop/src/renderer/utils/__tests__/`）の内容を確認する
5. `skill_wizard_next_action` が既存型に存在することを確認し、新規 `skill_wizard_next_action` ペイロード型（`action: 'edit' | 'execute' | 'close'`）との差分（既存: `action: 'execute' | 'open_editor' | 'create_another'`）を記録する
6. `@repo/shared/types/skillCreator` から `SkillCategory` を import している事実を記録する（型依存の把握）

**完了判定**: 既存イベント一覧・分岐構造・既存 `skill_wizard_next_action` との差分が文書化されていること

---

### タスク 2: 計装ポイントの確定

**目的**: `SkillCreateWizard.tsx` と `CompleteStep.tsx` のどこにどのイベントを計装するかを特定する。

**手順**:

1. `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` をファイル全体で読む
2. コンポーネントのマウント時に実行される `useEffect`（依存配列が空 `[]`）の有無を確認する
   - 存在しない場合、`skill_wizard_open` を発火する `useEffect` の追加箇所をファイルの行番号で特定する
3. コンポーネントのアンマウント時のクリーンアップ処理（`useEffect` の return 関数）の有無を確認する
   - 未完了判定に使用する state 変数（ステップ完了フラグ）の候補を特定する
4. 各ステップの「次へ」進行時のハンドラ関数（`handleStep0Next` / `handleGenerate` 等）を全て列挙する
   - それぞれのハンドラが何番目のステップに対応するかをコード行番号とともに記録する
5. `STEPS` 定数（`["スキル情報入力", "詳細設定", "生成", "完了"]`）を確認し、各ステップのインデックス（0〜3）と `stepName` の対応表を作成する
6. `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` をファイル全体で読む
7. `nextActions` 配列の 3 つのアクション（`onExecuteNow` / `onOpenInEditor` / `onCreateAnother`）の `onClick` ハンドラを確認する
   - 各アクションを `skill_wizard_next_action` のペイロード `action` 値（`'execute'` / `'edit'` / `'close'`）にマッピングする対応表を作成する

**計装ポイント対応表（確定内容）**:

| 計装ポイント | イベント名                   | 発火場所                                        | ペイロード                                   |
| ------------ | ---------------------------- | ----------------------------------------------- | -------------------------------------------- |
| P-1          | `skill_wizard_open`          | SkillCreateWizard: マウント時 useEffect         | `{ source: 'lifecycle_panel' \| 'direct' }`  |
| P-2          | `skill_wizard_step_complete` | SkillCreateWizard: Step 0 完了ハンドラ          | `{ step: 0, stepName: 'スキル情報入力' }`    |
| P-3          | `skill_wizard_step_complete` | SkillCreateWizard: Step 1 完了ハンドラ          | `{ step: 1, stepName: '詳細設定' }`          |
| P-4          | `skill_wizard_step_complete` | SkillCreateWizard: Step 2 完了ハンドラ          | `{ step: 2, stepName: '生成' }`              |
| P-5          | `skill_wizard_abandon`       | SkillCreateWizard: アンマウント時クリーンアップ | `{ lastStep: number }`                       |
| P-6          | `skill_wizard_next_action`   | CompleteStep: ネクストアクション選択時          | `{ action: 'edit' \| 'execute' \| 'close' }` |

**完了判定**: 6 つの計装ポイント全てについてファイルパス・関数名・行番号・ペイロード仕様が記録されていること

---

### タスク 3: AC の固定

**目的**: Phase 2 以降の実装・テスト作業の基準となる受入条件を仕様書に明記する。

**手順**:

1. 以下の AC-1〜AC-9 を本仕様書の「受入条件」セクションに転記し、各 AC の検証方法を付記する
2. テストカバレッジ目標（trackEvent.ts: 100%、SkillCreateWizard.tsx: 90%+、CompleteStep.tsx: 90%+）を確定する
3. タスク分類を NON_VISUAL として記録し、Phase 11 では screenshot を取得せず Vitest coverage 結果を主証跡とすることを明記する

**受入条件**:

| AC   | 内容                                                                                | 検証方法                                                     |
| ---- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| AC-1 | `trackEvent` に `skill_wizard_open` イベントが型安全に定義・呼び出しできる          | TypeScript コンパイルエラーなし + テスト呼び出し成功         |
| AC-2 | `trackEvent` に `skill_wizard_step_complete` イベントが型安全に定義・呼び出しできる | TypeScript コンパイルエラーなし + テスト呼び出し成功         |
| AC-3 | `trackEvent` に `skill_wizard_next_action` イベントが型安全に定義・呼び出しできる   | TypeScript コンパイルエラーなし + テスト呼び出し成功         |
| AC-4 | `trackEvent` に `skill_wizard_abandon` イベントが型安全に定義・呼び出しできる       | TypeScript コンパイルエラーなし + テスト呼び出し成功         |
| AC-5 | `SkillCreateWizard.tsx` の 5 つの計装ポイントでイベントが正しく発火する             | Vitest: trackEvent mock の toHaveBeenCalledWith アサーション |
| AC-6 | `CompleteStep.tsx` で `skill_wizard_next_action` が選択時に発火する                 | Vitest: trackEvent mock の toHaveBeenCalledWith アサーション |
| AC-7 | `trackEvent.ts` のスタブの全分岐でテストカバレッジ 100% を達成する                  | `pnpm vitest run --coverage` 結果で branches: 100%           |
| AC-8 | `SkillCreateWizard.tsx` のテストカバレッジが 90% 以上を維持する                     | `pnpm vitest run --coverage` 結果で lines/branches: 90%+     |
| AC-9 | `CompleteStep.tsx` のテストカバレッジが 90% 以上を維持する                          | `pnpm vitest run --coverage` 結果で lines/branches: 90%+     |

**完了判定**: AC-1〜AC-9 の全条件と検証方法、カバレッジ目標、NON_VISUAL 記録が本 Phase 成果物に含まれていること

---

## 参照資料

| ファイルパス                                                         | 参照目的                                |
| -------------------------------------------------------------------- | --------------------------------------- |
| `apps/desktop/src/renderer/utils/trackEvent.ts`                      | 既存イベント型・スタブパターンの確認    |
| `apps/desktop/src/renderer/utils/__tests__/`                         | 既存テストのスタブ化パターン確認        |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | 計装ポイント（P-1〜P-5）の特定          |
| `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | 計装ポイント（P-6）の特定               |
| `docs/30-workflows/UT-SKILL-WIZARD-W3-USAGE-TRACKING-001/index.md`   | タスク全体概要・AC 一覧の参照           |
| `docs/30-workflows/skill-wizard-redesign-lane/index.md`              | Wave レーン概要（Wave 0〜3 の文脈把握） |

---

## 成果物

| 成果物ファイル                                    | 内容                                                      |
| ------------------------------------------------- | --------------------------------------------------------- |
| `outputs/phase-1/requirements.md`                 | 要件定義書（AC-1〜AC-9・カバレッジ目標・NON_VISUAL 記録） |
| `outputs/phase-1/instrumentation-points.md`       | 計装ポイント一覧（P-1〜P-6 の詳細）                       |
| `outputs/phase-1/existing-trackEvent-analysis.md` | 既存 trackEvent 分析（現イベント一覧・分岐構造・差分）    |

---

## 統合テスト連携

本タスクは NON_VISUAL 分類のため、UI スクリーンショットによる証跡は不要である。
統合テストの連携要件として以下を明記する：

- **認証不要**: `trackEvent` は Renderer 内のローカル関数であり、IPC 通信・外部 API 認証は不要
- **データフロー**: `trackEvent(eventName, payload)` → dev 環境では `console.info` 出力 / prod では no-op → 将来的に analytics sink に差し替え可能
- **モック方針**: テストでは `vi.mock('../../utils/trackEvent')` または `vi.spyOn` を使用して `trackEvent` を差し替え、実際の `console.info` を発火させずに呼び出し検証を行う
- **CI 要件**: `pnpm --filter @repo/desktop test:run` が全テスト通過することを Phase 4 以降の CI 基準とする

---

## 完了条件

- [ ] `trackEvent.ts` の現状スタブ化パターン（dev/prod 分岐）が文書化されている
- [ ] 既存イベント 5 種（`skill_wizard_started` / `skill_wizard_step1_completed` / `skill_wizard_generation_completed` / `skill_skeleton_quality_feedback` / `skill_wizard_next_action`）が一覧化されている
- [ ] 既存 `skill_wizard_next_action` と新規 `skill_wizard_next_action` のペイロード型差分が記録されている
- [ ] 6 つの計装ポイント（P-1〜P-6）が特定・確定されている（ファイルパス・関数名・ペイロード）
- [ ] AC-1〜AC-9 が検証方法とともに仕様書に明記されている
- [ ] タスク分類（NON_VISUAL）が記録されている
- [ ] カバレッジ目標（trackEvent.ts: 100% / SkillCreateWizard.tsx: 90%+ / CompleteStep.tsx: 90%+）が確定している

---

## Phase 末端アクション【必須】

- [ ] 本 Phase 内の全タスク（タスク 1〜3）を 100% 実行完了
- [ ] 各タスクの実行結果を明記（完了した内容・確認した事実を箇条書きで記録）
- [ ] 成果物 3 件（requirements.md / instrumentation-points.md / existing-trackEvent-analysis.md）が全て生成されていることを確認
- [ ] `artifacts.json` の Phase 1 ステータスを `completed` に更新
