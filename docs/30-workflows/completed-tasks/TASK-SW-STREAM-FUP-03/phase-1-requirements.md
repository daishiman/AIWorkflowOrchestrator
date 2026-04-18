# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                  |
| ---------- | --------------------- |
| Phase      | 1                     |
| Phase名    | 要件定義              |
| 対象機能   | TASK-SW-STREAM-FUP-03 |
| 前提Phase  | -（起点）             |
| 次Phase    | Phase 2: 設計         |
| ステータス | 未実施                |
| 作成日     | 2026-04-17            |

## 目的

`SkillCreatorService.createSkill()` の進捗通知を `create` モード専用の5段階フローから mode 別 progress flow の単一集約へ再設計する要件と受入条件を明確化する。

## 背景・問題

TASK-SW-STREAM-001 で実装した5段階フロー（planning → generating-skill → generating-agents → validating → done）は `create` モードのみを想定しており、他モードでは意味が通じないメッセージが表示される。

### 現状の問題

```typescript
// SkillCreatorService.ts 現状（全モード共通）
emitProgress({ phase: "planning", percentage: 10, message: "構造を計画しています" });

switch (options.mode) {
  case "collaborative":
    await this.runCollaborativeWorkflow(...); // ← 独自フェーズ通知なし
  case "orchestrate":
    await this.runOrchestrateWorkflow(...);   // ← 独自フェーズ通知なし
  // ...
}
```

`collaborative` モードはインタビュー → 合意形成という独自フローがあるが、ユーザーには「構造を計画しています」と表示されてしまう。

### 一次結論

1. 真の論点は、progress emission contract の所有権を `createSkill()` に集約できているかである。
2. 依存境界は main process service 層のみで、IPC / Preload / Renderer 層は変更しない。
3. 価値は「各 mode で正しい進捗が見えること」、コストは「内部 progress flow の再構成」であり、後者は限定的である。
4. 改善優先順位は、progress flow の単一集約を先に決め、その後にテストと Phase 12 文書を揃えること。
5. 4条件（矛盾なし・漏れなし・整合性あり・依存関係整合）は、progress flow の単一集約と create 回帰保持で PASS する。

### モード別フェーズ設計（要件）

| モード           | フェーズ列                                                                                                      |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| `create`         | planning(10%) → generating-skill(40%) → generating-agents(70%) → validating(90%) → done(100%)                   |
| `collaborative`  | interview(10%) → consensus(35%) → generating-skill(60%) → generating-agents(80%) → validating(90%) → done(100%) |
| `orchestrate`    | engine-selection(15%) → generating-skill(45%) → generating-agents(75%) → validating(90%) → done(100%)           |
| `update`         | loading-skill(10%) → analyzing(30%) → generating-skill(60%) → validating(90%) → done(100%)                      |
| `improve-prompt` | loading-skill(10%) → analyzing(30%) → improving(65%) → validating(90%) → done(100%)                             |

## 実行タスク

### Step 0: P50チェック（必須）

実装状態を確認し、既実装コードの重複修正を防止する。

1. `SkillCreatorService.ts` の `createSkill()` メソッドで `emitProgress` が呼ばれる箇所（行番号）を確認
2. `runCollaborativeWorkflow` / `runOrchestrateWorkflow` の現状シグネチャと内部フローを確認
3. `update` / `improve-prompt` モードのワークフローメソッドが存在するか確認
4. 既存テストファイル（`SkillCreatorService.progress.test.ts` または類似）の件数と内容を確認
5. FUP-02（定数化タスク）の完了状態を確認し、定数化済みフェーズ名があるか記録する

### Task 1: 問題特定と影響範囲調査

1. `createSkill()` 内の全 `emitProgress` 呼び出し箇所（行番号・phase・percentage・message）を列挙する
2. `switch (options.mode)` の各ケースで mode 固有 progress をどう割り当てるかを特定する
3. `runCollaborativeWorkflow` / `runOrchestrateWorkflow` の内部フロー（処理節目）を分析する
4. `update` / `improve-prompt` モードが進捗 contract をどこで持つべきか確認する
5. 既存テスト（14件）がどのモードをカバーしているか確認し、回帰リスクを評価する

### Task 2: 受入条件の策定

1. 各モード（5種）のフェーズ列と percentage 値を確定する
2. `onProgress` が `undefined` の場合の安全動作を確認する
3. percentage 値の単調増加制約を確認する
4. 受入条件（AC-1〜AC-8）を策定する

## 受入条件

| ID   | 条件                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------- |
| AC-1 | `create` モードの5段階フローが既存通り動作する（emitProgress の phase/percentage/message が変わらない） |
| AC-2 | `collaborative` モードで `interview`・`consensus` フェーズが通知される                                  |
| AC-3 | `orchestrate` モードで `engine-selection` フェーズが通知される                                          |
| AC-4 | `update` モードで `loading-skill`・`analyzing` フェーズが通知される                                     |
| AC-5 | `improve-prompt` モードで `loading-skill`・`analyzing`・`improving` フェーズが通知される                |
| AC-6 | 既存14テストケースが全てpass（回帰なし）                                                                |
| AC-7 | 各モードの `percentage` 値が単調増加し 0〜100 の範囲に収まる                                            |
| AC-8 | `onProgress` が未指定の場合（`undefined`）でもエラーが発生しない                                        |

## タスク分類

| 項目       | 内容                                    |
| ---------- | --------------------------------------- |
| タスク種別 | NON_VISUAL（UI/UX変更なし）             |
| 変更層     | main process service層のみ              |
| 破壊的変更 | なし（`onProgress` はオプショナル引数） |

## 参照資料

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 実装対象
- `docs/30-workflows/unassigned-task/TASK-SW-STREAM-FUP-03-MODE-SPECIFIC-PROGRESS.md` — 問題背景
- TASK-SW-STREAM-001 仕様書 — onProgress引数の原点

## 統合テスト連携

- 要件と受入条件を後続の設計・テスト Phase に引き継ぐ。

## 成果物

| 成果物                                | パス                                                    |
| ------------------------------------- | ------------------------------------------------------- |
| TASK-SW-STREAM-FUP-03-requirements.md | `outputs/phase-1/TASK-SW-STREAM-FUP-03-requirements.md` |

## 完了条件

- [ ] Step 0（P50チェック）を実行し、現状コードのemitProgress箇所を全件把握した
- [ ] 各モードの独自フェーズ列と percentage 値が確定している
- [ ] FUP-02の完了状態が確認されている
- [ ] 受入条件（AC-1〜AC-8）が全件策定されている
- [ ] 成果物（TASK-SW-STREAM-FUP-03-requirements.md）が生成されている

## タスク100%実行確認【必須】

- [ ] Step 0（P50チェック）を実行した
- [ ] Task 1（問題特定と影響範囲調査）を100%実行した
- [ ] Task 2（受入条件の策定）を100%実行した
- [ ] artifacts.json が更新されている

## 次 Phase

→ [Phase 2: 設計](./phase-2-design.md)
