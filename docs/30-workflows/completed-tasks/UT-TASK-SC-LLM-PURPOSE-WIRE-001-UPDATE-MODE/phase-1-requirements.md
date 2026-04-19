# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| PhaseID    | 1                                                    |
| Phase 名   | 要件定義                                             |
| タスクID   | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE          |
| タスク名   | SkillCreatorService update/improve-prompt モード実装 |
| 前 Phase   | -（本タスクの起点）                                  |
| 次 Phase   | Phase 2（設計）                                      |
| 作成日     | 2026-04-19                                           |
| ステータス | 未実施                                               |

---

## 目的

`SkillCreatorService.ts` の `runCreateSkill` 内 switch 文において、`case "update":` および `case "improve-prompt":` が専用ワークフローを呼び出さずに fall-through するバグの要件境界を固定する。修正後の期待動作・受け入れ基準・影響範囲を明文化し、Phase 2 以降の設計・実装の判断基準とする。

---

## 背景

### switch 文の問題

`apps/desktop/src/main/services/skill/SkillCreatorService.ts` の `runCreateSkill` メソッド（L381〜L421）に以下の switch 文が存在する：

```typescript
switch (options.mode) {
  case "collaborative":
    emitProgress("interview");
    await this.runCollaborativeWorkflow(options, operationSignal);
    emitProgress("consensus");
    break;
  case "orchestrate":
    emitProgress("engine-selection");
    await this.runOrchestrateWorkflow(options, operationSignal);
    break;
  case "create":
    emitProgress("planning");
    // runCreateWorkflow を呼び出す（正常実装済み）
    break;
  case "update":
    emitProgress("loading-skill");
    emitProgress("analyzing");
    break; // runUpdateWorkflow を呼ばずに終了（バグ）
  case "improve-prompt":
    emitProgress("loading-skill");
    emitProgress("analyzing");
    emitProgress("improving");
    break; // runImprovePromptWorkflow を呼ばずに終了（バグ）
}
```

switch 文の break 後、`init_skill.js`（新規スキル初期化スクリプト）が無条件に実行される（L430〜）。

### SkillCreatorMode 型定義

```typescript
type SkillCreatorMode =
  | "collaborative"
  | "orchestrate"
  | "create"
  | "update"
  | "improve-prompt";
```

全5モードのうち、`collaborative` / `orchestrate` / `create` は専用ワークフローメソッドが実装済みだが、`update` / `improve-prompt` は未実装。

### fall-through 問題の影響

| モード           | 期待動作                    | 実際の動作                           |
| ---------------- | --------------------------- | ------------------------------------ |
| `update`         | 既存スキルを差分更新        | `init_skill.js` が実行され新規初期化 |
| `improve-prompt` | SKILL.md の prompt のみ更新 | `init_skill.js` が実行され新規初期化 |

---

## Step 0: P50 チェック（前提確認）

Phase 1 開始前に以下のコマンドで現状実装を確認する：

```bash
# switch 文の update / improve-prompt ケースを確認
grep -n "case \"update\"\|case \"improve-prompt\"\|runUpdateWorkflow\|runImprovePromptWorkflow" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts

# init_skill.js の呼び出し箇所を確認
grep -n "init_skill.js" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts

# runCreateWorkflow の実装パターンを確認（設計参考）
grep -n "private async runCreateWorkflow\|private async runCollaborativeWorkflow\|private async runOrchestrateWorkflow" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts

# 既存テストファイルのパスを確認
ls apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts
```

---

## 実行タスク

- [ ] T-1-1: 対象ファイルのコードを読み、switch 文 L381〜L421 の全ケースを把握する
- [ ] T-1-2: update モードの期待動作を文書化する（既存スキルの読み込み・差分更新フロー）
- [ ] T-1-3: improve-prompt モードの期待動作を文書化する（SKILL.md prompt セクションのみ更新）
- [ ] T-1-4: `runCreateWorkflow` の実装パターン（L979〜L997）を確認し、設計参考情報を記録する
- [ ] T-1-5: 既存テストファイルのパスと既存テスト構造を確認する
- [ ] T-1-6: `init_skill.js` が呼ばれない条件を明確化する（early return またはフラグ使用）
- [ ] T-1-7: 受け入れ基準 AC-1〜AC-5 を定義する

---

## 受け入れ基準

### AC-1: update モードの期待動作が文書化されている

update モードで `runCreateSkill` を呼び出した場合：

- 既存スキルのファイル群（SKILL.md 等）を読み込む
- スキルの内容を分析する
- 差分更新（ユーザー指示に基づき SKILL.md を更新）を実行する
- `init_skill.js` は**呼ばれない**
- progress イベントとして `loading-skill` → `analyzing` → `updating` の順で emitProgress される

### AC-2: improve-prompt モードの期待動作が文書化されている

improve-prompt モードで `runCreateSkill` を呼び出した場合：

- 既存スキルのファイル群（SKILL.md 等）を読み込む
- SKILL.md の prompt セクションのみを分析する
- prompt セクションのみを改善する（軽量フロー）
- `init_skill.js` は**呼ばれない**
- progress イベントとして `loading-skill` → `analyzing` → `improving` の順で emitProgress される

### AC-3: runCreateWorkflow の実装パターンが確認されている

- `private async runCreateWorkflow(options, signal)` のシグネチャが記録されている
- 戻り値の型（`Promise<StructurePlanJson | null>`）が記録されている
- エラーハンドリングパターン（AbortError の再スロー、その他は null 返却）が記録されている

### AC-4: 既存テストファイルのパスが確認されている

- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` が存在することを確認済み
- 既存テストの describe / it ブロック構造が把握されている

### AC-5: init_skill.js が呼ばれない条件が明確化されている

以下のいずれかの方式で `init_skill.js` をスキップする条件が明文化されている：

- **方式 A（フラグ）**: switch 文内で `shouldRunInit` フラグを `false` に設定し、init_skill.js の呼び出し箇所で条件分岐する
- **方式 B（early return）**: update / improve-prompt の処理完了後に return し、init_skill.js 以降のコードに到達させない
- どちらの方式が採用されるかは Phase 2 で決定する

---

## 参照資料

| 資料名                       | パス                                                                          | 用途                             |
| ---------------------------- | ----------------------------------------------------------------------------- | -------------------------------- |
| SkillCreatorService          | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                 | バグ箇所の特定・実装パターン参照 |
| SkillCreatorService テスト   | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`  | 既存テスト構造の把握             |
| TASK-SC-LLM-PURPOSE-WIRE-001 | `docs/30-workflows/completed-tasks/TASK-SC-LLM-PURPOSE-WIRE-001/index.md`     | 依存タスクの実装内容確認         |
| アーキテクチャ参照           | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md` | サービス設計方針                 |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`   | テストカバレッジ基準             |

---

## 成果物

| 成果物       | パス                                     | 説明                          |
| ------------ | ---------------------------------------- | ----------------------------- |
| 要件定義書   | `outputs/phase-1/requirements.md`        | 本 Phase の要件をまとめた文書 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md` | AC-1〜AC-5 のチェックリスト   |

---

## 完了条件チェックボックス

- [ ] T-1-1: switch 文の全ケースを把握した
- [ ] T-1-2: update モードの期待動作を文書化した
- [ ] T-1-3: improve-prompt モードの期待動作を文書化した
- [ ] T-1-4: runCreateWorkflow の実装パターンを記録した
- [ ] T-1-5: 既存テストファイルのパスと構造を確認した
- [ ] T-1-6: init_skill.js が呼ばれない条件の方式候補を明確化した
- [ ] T-1-7: 受け入れ基準 AC-1〜AC-5 を定義した
- [ ] `outputs/phase-1/requirements.md` を出力した
- [ ] `outputs/phase-1/acceptance-criteria.md` を出力した

---

## Phase 末端アクション

```bash
# artifacts.json の Phase 1 ステータスを更新する
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE --phase 1 \
  --artifacts "outputs/phase-1/requirements.md:要件定義書" \
  --artifacts "outputs/phase-1/acceptance-criteria.md:受け入れ基準 AC-1〜AC-5"
```

Phase 1 完了後、**Phase 2（設計）へ進む。Phase 1 完了前に Phase 4 以降へ進むことを禁止する。**
