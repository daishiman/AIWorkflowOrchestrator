# TASK-RT-02: stub-response-error-notification

## 概要

`RuntimeSkillCreatorFacade.plan()` は `llmAdapter` / `resourceLoader` が不足した場合でも空の成功結果を返し、`improve()` も同系統の degraded 条件で空提案を返す。これにより renderer は「失敗」ではなく「何も起きていない成功」に見える。本タスクは false-success を explicit error contract に置き換え、UI が理由付きで失敗を表示できる状態へ再設計する。

今回のエレガント改善では、既存仕様の `status/degradedReason/userMessage` 横展開案を破棄し、**既存の union 契約に合わせた explicit error response** へ統一する。`execute()` には同型の degraded スタブが存在しないため、責務を「不正な plan の実行防止」に限定する。

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| タスクID   | TASK-RT-02                                                    |
| タスク種別 | バグ修正 / 契約整理                                           |
| 優先度     | P1                                                            |
| ステータス | implementation_complete                                       |
| 上流ゲート | `../skill-creator-agent-sdk-lane/requirements-draft.md`       |
| 親pack     | `../skill-creator-agent-sdk-lane/root-workflow-pack/index.md` |
| 依存タスク | なし（TASK-RT-01 と並列可）                                   |
| 後続タスク | TASK-RT-03                                                    |
| 作成日     | 2026-03-29                                                    |
| 更新日     | 2026-04-04                                                    |

## 実装状況サマリー（2026-04-04時点）

### 実装済み

| 項目                                         | ファイル                                             | 備考                                                                |
| -------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------- |
| `plan()` の `buildDegradedError()` ガード    | `RuntimeSkillCreatorFacade.ts`                       | false-success を explicit error union へ置換済み                    |
| `improve()` の `buildDegradedError()` ガード | `RuntimeSkillCreatorFacade.ts`                       | 空 suggestions 返却を explicit error response へ置換済み            |
| `execute()` の `!this.llmAdapter` ガード     | `RuntimeSkillCreatorFacade.ts`                       | integrated_api 経路で明示的に failure を返却                        |
| 共通 shared types 追加                       | `packages/shared/src/types/skillCreator.ts`          | `RuntimeSkillCreatorDegradedReason`, `PlanErrorResponse` 等         |
| UI フィードバック経路                        | `SkillLifecyclePanel.tsx / SkillCreateWizard.tsx`    | plan logical error の表示を共通契約として保持し、execute 抑止を実施 |
| 回帰テスト                                   | `RuntimeSkillCreatorFacade.stub-elimination.test.ts` | execute / plan の degraded 回帰が PASS                              |

### PR 制約

- commit / push / PR はユーザー明示承認まで実行しない
- phase 13 は blocked のまま保持する

## 受入基準

| ID   | 基準                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------- |
| AC-1 | `plan()` が runtime 未初期化時に空成功結果ではなく explicit error response を返す                        |
| AC-2 | `execute()` は degraded plan を成功扱いで前進させず、renderer が実行開始を抑止する                       |
| AC-3 | `improve()` が degraded 条件で空提案ではなく explicit error response を返す                              |
| AC-4 | logical error には machine-readable reason code と user-facing message が含まれる                        |
| AC-5 | IPC outer wrapper は transport / validation failure 専用とし、logical error は union response として運ぶ |
| AC-6 | `SkillLifecyclePanel` / `SkillCreateWizard` が logical error を表示し、再試行導線を維持する              |
| AC-7 | 正常系と terminal handoff 系の公開契約を壊さない                                                         |

## スコープ

**含む**

- `RuntimeSkillCreatorPlanResponse` への error union 追加
- `RuntimeSkillCreatorImproveResponse` の degraded stub を explicit error response へ変更
- 共通 reason code とメッセージマップの設計
- `creatorHandlers.ts` での transport error / logical error の境界整理
- `SkillLifecyclePanel.tsx` / `SkillCreateWizard.tsx` の plan error 表示と execute 抑止
- ユニットテストと renderer テストの再設計

**含まない**

- `llmAdapter` 自体の初期化失敗通知強化（TASK-RT-01）
- 自動再接続・self-healing
- verify / reverify 系 degraded contract の変更
- 新規 IPC チャネル追加
- commit / PR 作成

## 実装事実アンカー

| ファイル                                                              | current facts                                                                | TASK-RT-02 での扱い                           |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `plan()` に stub success、`improve()` に空 suggestions 返却がある            | explicit error union へ置換                   |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `execute()` 自体は `SkillExecutor.execute()` 委譲で degraded stub を持たない | invalid plan の実行防止へ責務限定             |
| `packages/shared/src/types/skillCreator.ts`                           | `RuntimeSkillCreatorImproveErrorResponse` は既に存在                         | `plan()` 側にも同型 error union を追加        |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | outer `IpcResult` は validation / exception を運ぶ                           | logical error は `data` union のまま返す      |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | `improve()` には error response type guard がある                            | `plan()` 側にも同等 guard を追加              |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`    | create flow の plan / execute UX を持つ                                      | plan logical error の表示を共通契約として保持 |

## 設計要約

### エレガントな解決策

1. `plan()` と `improve()` にだけ explicit error union を導入する
2. reason code は `error.code` に集約し、別フィールドを増やさない
3. outer `IpcResult.success` は transport / validation failure だけに使う
4. renderer は `plan` logical error を早期表示し、`execute` ボタンを押させない
5. `execute()` の戻り値契約は既存の `success/error` 形を維持する

### 30思考法の統合結論

| カテゴリ     | 適用した思考法                                       | 結論                                                                            |
| ------------ | ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| 論理分析系   | 批判的思考 / 演繹 / 帰納 / アブダクション / 垂直思考 | 「3レスポンス一律 status 追加」は実コードと矛盾、既存 union 再利用が妥当        |
| 構造分解系   | 要素分解 / MECE / 2軸 / プロセス思考                 | 問題は `plan` と `improve` の false-success、`execute` は downstream guard 問題 |
| メタ・抽象系 | メタ思考 / 抽象化思考 / ダブル・ループ思考           | 失敗は payload 形状ではなく error semantics の混線                              |
| 発想・拡張系 | ブレスト / 水平 / 逆説 / 類推 / if / 素人思考        | `improve` の既存 error wrapper を `plan` に類推展開するのが最小変更             |
| システム系   | システム思考 / 因果関係分析 / 因果ループ             | 空成功結果 → UI 無反応 → 再試行不能の悪循環を切る                               |
| 戦略・価値系 | トレードオン / プラスサム / 価値提案 / 戦略的思考    | 新フィールド追加を減らしつつ UX と型整合を両立                                  |
| 問題解決系   | why / 改善 / 仮説 / 論点 / KJ法                      | 真の論点は「失敗を成功として運んでいる」こと                                    |

## 要件レビュー一次結論

| 観点               | 結論                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 真の論点           | false-success contract を explicit error contract へ変えること                                                                                 |
| 依存関係・責務境界 | Facade は reason code を決定、IPC は transport と logical を分離、renderer は表示と抑止のみ                                                    |
| 価値とコスト       | `plan` / `improve` の union 追加と UI guard で効果が大きい                                                                                     |
| 改善優先順位       | 1. 型契約 2. Facade 3. renderer 4. handler 5. tests 6. docs close-out                                                                          |
| 4条件評価          | 矛盾なし: execute 責務を縮小 / 漏れなし: plan+improve+UI+IPC を包含 / 整合性: union pattern 再利用 / 依存関係整合: RT-01, RT-03 と競合しにくい |

## ディレクトリ構成

```text
step-08-par-task-rt-02-stub-response-error-notification/
├── index.md
├── artifacts.json
├── outputs/
│   └── artifacts.json
├── phase-1-requirements.md
├── phase-2-design.md
├── phase-3-design-review.md
├── phase-4-test-creation.md
├── phase-5-implementation.md
├── phase-6-test-expansion.md
├── phase-7-coverage-check.md
├── phase-8-refactoring.md
├── phase-9-quality-assurance.md
├── phase-10-final-review.md
├── phase-11-manual-test.md
├── phase-12-documentation.md
└── phase-13-pr-creation.md
```

## Phase 一覧

- [phase-1-requirements.md](./phase-1-requirements.md)
- [phase-2-design.md](./phase-2-design.md)
- [phase-3-design-review.md](./phase-3-design-review.md)
- [phase-4-test-creation.md](./phase-4-test-creation.md)
- [phase-5-implementation.md](./phase-5-implementation.md)
- [phase-6-test-expansion.md](./phase-6-test-expansion.md)
- [phase-7-coverage-check.md](./phase-7-coverage-check.md)
- [phase-8-refactoring.md](./phase-8-refactoring.md)
- [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)
- [phase-10-final-review.md](./phase-10-final-review.md)
- [phase-11-manual-test.md](./phase-11-manual-test.md)
- [phase-12-documentation.md](./phase-12-documentation.md)
- [phase-13-pr-creation.md](./phase-13-pr-creation.md)
