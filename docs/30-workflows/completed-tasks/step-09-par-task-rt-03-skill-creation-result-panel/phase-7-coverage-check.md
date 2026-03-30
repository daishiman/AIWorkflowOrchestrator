# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 7                           |
| 機能名 | skill-creation-result-panel |
| 作成日 | 2026-03-29                  |

## 目的

PlanResultDetailPanel / ExecuteResultDetailPanel / ErrorBanner の全表示フィールド、raw detail 保持、props パターン、SkillLifecyclePanel 統合のテストカバレッジを確認する。terminal_handoff は既存 handoff 導線に残し、詳細パネルに含めない。

## 実行タスク

- PlanResultDetailPanel の表示フィールド coverage を確認する
- ExecuteResultDetailPanel の表示フィールド coverage を確認する
- ErrorBanner の coverage を確認する
- SkillLifecyclePanel 統合の coverage を確認する
- edge case の coverage を確認する

## 参照資料

| 資料名                 | パス                                     | 説明           |
| ---------------------- | ---------------------------------------- | -------------- |
| Phase 4 test matrix    | `outputs/phase-4/test-matrix.md`         | baseline suite |
| Phase 5 実装           | `phase-5-implementation.md`              | 実装対象       |
| Phase 6 test expansion | `phase-6-test-expansion.md`              | edge case      |
| panel props catalog    | `outputs/phase-2/panel-props-catalog.md` | props 仕様     |

## 実行手順

### ステップ1: PlanResultDetailPanel の coverage を集計する

| 表示フィールド | 正常表示 test | null/空 test | 長大データ test | 特殊文字 test |
| -------------- | ------------- | ------------ | --------------- | ------------- |
| skillName      | T-PRP-01      | Step1-空     | Step2-200文字   | Step3-日本語  |
| description    | T-PRP-01      | Step1-空     | Step2-2000文字  | Step3-HTML    |
| estimatedSteps | T-PRP-09      | —            | —               | —             |
| agents         | T-PRP-11      | T-PRP-05     | Step2-50件      | Step3-改行    |
| scripts        | T-PRP-01      | T-PRP-06     | —               | —             |
| triggers       | T-PRP-01      | T-PRP-07     | Step2-30件      | —             |
| anchors        | T-PRP-01      | T-PRP-08     | —               | Step3-URL     |
| skillSpec      | T-PRP-10      | Step1-undef  | Step2-10000文字 | —             |
| planId         | T-PRP-12      | —            | —               | —             |

### ステップ1-補足: raw plan detail の coverage を集計する

| 観点                      | 正常保持 test | edge case | handoff  |
| ------------------------- | ------------- | --------- | -------- |
| raw plan detail retention | T-PRP-13      | T-INT-07  | T-PRP-14 |

### ステップ2: ExecuteResultDetailPanel の coverage を集計する

| 表示フィールド    | 正常表示 test | エラー test | edge case      |
| ----------------- | ------------- | ----------- | -------------- |
| skillName         | T-ERP-01      | T-ERP-02    | 空文字列       |
| success badge     | T-ERP-01      | T-ERP-02    | —              |
| error message     | —             | T-ERP-06    | Step2-500文字  |
| retry button      | —             | T-ERP-07    | Step4-disabled |
| executeId         | T-ERP-08      | —           | —              |
| sessionId         | T-ERP-09      | —           | —              |
| resultSubtype     | T-ERP-09      | —           | —              |
| stopReason        | T-ERP-09      | —           | —              |
| permissionDenials | T-ERP-10      | —           | Step2-20件     |
| sdkEvents         | T-ERP-10      | —           | Step2-100件    |
| sourceProvenance  | T-ERP-10      | —           | Step3-長大path |

### ステップ3: props パターン coverage を集計する

| コンポーネント           | null     | loading  | error    | 正常     | 成功     | 失敗     |
| ------------------------ | -------- | -------- | -------- | -------- | -------- | -------- |
| PlanResultDetailPanel    | T-PRP-02 | T-PRP-03 | T-PRP-04 | T-PRP-01 | —        | —        |
| ExecuteResultDetailPanel | T-ERP-03 | T-ERP-04 | T-ERP-05 | —        | T-ERP-01 | T-ERP-02 |
| ErrorBanner              | —        | —        | T-ERR-01 | —        | —        | —        |

### ステップ4: SkillLifecyclePanel 統合 coverage を集計する

| state 遷移            | test                | edge case      |
| --------------------- | ------------------- | -------------- |
| plan → review         | T-INT-01            | —              |
| execute → verify      | T-INT-02            | —              |
| plan 中（結果なし）   | T-INT-03            | —              |
| review → execute 遷移 | T-INT-04            | Step4-連続遷移 |
| plan エラー           | T-INT-05            | —              |
| execute エラー        | T-INT-06            | —              |
| raw detail open/close | T-INT-07            | Step4-再 open  |
| terminal_handoff 導線 | T-PRP-14 / T-ERP-11 | —              |

## 統合テスト連携

- Phase 9 で coverage gap が品質リスクを残していないか監査する
- Phase 10 で AC-1〜AC-8 のテスト網羅性を最終判定する

## 成果物

| 成果物         | パス                        | 説明              |
| -------------- | --------------------------- | ----------------- |
| coverage check | `phase-7-coverage-check.md` | coverage 観点本文 |

## 完了条件

- [ ] PlanResultDetailPanel の全表示フィールドに test case がある
- [ ] ExecuteResultDetailPanel の全表示フィールドに test case がある
- [ ] 全 props パターンの coverage がある
- [ ] SkillLifecyclePanel 統合の coverage がある
- [ ] raw plan / execute detail の保持・破棄 coverage がある
- [ ] terminal_handoff の既存導線維持 coverage がある
- [ ] edge case の coverage が Phase 6 と整合している
- [ ] **本Phase内の全タスクを100%実行完了**
