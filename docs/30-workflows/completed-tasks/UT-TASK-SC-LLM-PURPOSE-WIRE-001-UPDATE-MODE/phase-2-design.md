# Phase 2: 設計

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| PhaseID    | 2                                                    |
| Phase 名   | 設計                                                 |
| タスクID   | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE          |
| タスク名   | SkillCreatorService update/improve-prompt モード実装 |
| 前 Phase   | Phase 1（要件定義）完了                              |
| 次 Phase   | Phase 3（設計レビューゲート）                        |
| 作成日     | 2026-04-19                                           |
| ステータス | 未実施                                               |

---

## 目的

`runUpdateWorkflow` および `runImprovePromptWorkflow` のインターフェースと制御境界を設計し、Phase 4 以降の実装・テスト作成が開始できる状態にする。また、`init_skill.js` が update / improve-prompt モードで呼ばれない制御フローを確定する。本 Phase では mode dispatch の正しさを主対象とし、更新アルゴリズム自体の高度化は別タスクへ持ち込まない。

---

## 背景

Phase 1 で確認した問題：

- `case "update":` / `case "improve-prompt":` が専用ワークフローを呼ばずに break
- break 後に `init_skill.js`（新規スキル初期化）が無条件実行される
- `runCreateWorkflow`（L979〜L997）が参考実装として利用可能

---

## 実行タスク

### T-2-1: runUpdateWorkflow メソッドのシグネチャ設計

以下を確定する：

- メソッド名: `runUpdateWorkflow`
- アクセス修飾子: `private async`
- 引数: `(options: CreateSkillOptions, signal?: AbortSignal)`
- 戻り値: `Promise<void>`
- エラーハンドリング: AbortError は再スロー、その他は警告ログを記録して継続

設計案：

```typescript
private async runUpdateWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<void> {
  // 1. update モード専用の処理入口とする
  // 2. init_skill.js に到達しないことを保証する
  // 3. 実際の更新ロジックはこのメソッド内に閉じ込める
  // AbortError は再スロー、その他は this.logger.warn で記録
}
```

### T-2-2: runImprovePromptWorkflow メソッドのシグネチャ設計

以下を確定する：

- メソッド名: `runImprovePromptWorkflow`
- アクセス修飾子: `private async`
- 引数: `(options: CreateSkillOptions, signal?: AbortSignal)`
- 戻り値: `Promise<void>`
- エラーハンドリング: AbortError は再スロー、その他は警告ログを記録して継続

設計案：

```typescript
private async runImprovePromptWorkflow(
  options: CreateSkillOptions,
  signal?: AbortSignal,
): Promise<void> {
  // 1. improve-prompt モード専用の処理入口とする
  // 2. init_skill.js に到達しないことを保証する
  // 3. 実際の prompt 改善ロジックはこのメソッド内に閉じ込める
  // AbortError は再スロー、その他は this.logger.warn で記録
}
```

### T-2-3: switch 文のリファクタリング設計（init_skill.js を呼ばない条件制御）

`init_skill.js` をスキップする制御方式を以下の2案から選定する：

#### 方式 A: フラグ（shouldRunInit）による条件分岐

```typescript
let shouldRunInit = true;

switch (options.mode) {
  case "update":
    emitProgress("loading-skill");
    emitProgress("analyzing");
    await this.runUpdateWorkflow(options, operationSignal);
    shouldRunInit = false;
    break;
  case "improve-prompt":
    emitProgress("loading-skill");
    emitProgress("analyzing");
    emitProgress("improving");
    await this.runImprovePromptWorkflow(options, operationSignal);
    shouldRunInit = false;
    break;
  // ... 他ケース
}

if (shouldRunInit) {
  // init_skill.js の呼び出し
  const initResult = await this.executeScript("init_skill.js", [...], operationSignal);
  // ...
}
```

#### 方式 B: early return による制御

```typescript
switch (options.mode) {
  case "update":
    emitProgress("loading-skill");
    emitProgress("analyzing");
    await this.runUpdateWorkflow(options, operationSignal);
    emitProgress("generating-skill");
    // update モード固有の後処理を行い return
    return this.buildResultForUpdate(options, skillDir);
  case "improve-prompt":
    emitProgress("loading-skill");
    emitProgress("analyzing");
    emitProgress("improving");
    await this.runImprovePromptWorkflow(options, operationSignal);
    emitProgress("generating-skill");
    // improve-prompt モード固有の後処理を行い return
    return this.buildResultForImprovePrompt(options, skillDir);
  // ... 他ケース
}
// init_skill.js の呼び出し（create / collaborative / orchestrate モードのみ到達）
```

#### 方式選定基準

| 観点               | 方式 A（フラグ）         | 方式 B（early return）     |
| ------------------ | ------------------------ | -------------------------- |
| 既存コードへの影響 | 最小限（フラグ追加のみ） | 中程度（return 追加）      |
| 可読性             | 普通                     | 高い（明示的な制御フロー） |
| テスト容易性       | 普通                     | 高い（各パスが独立）       |
| Phase 5 実装工数   | 小                       | 中                         |

方式の最終選定は Phase 3（設計レビュー）で承認を得た後、Phase 5 実装時に確定する。

### T-2-4: progress emit フェーズ構成の設計

各モードの emitProgress 呼び出し順序を確定する：

| モード           | progress フェーズ順序                                            |
| ---------------- | ---------------------------------------------------------------- |
| `update`         | `loading-skill` → `analyzing` → `updating` → `generating-skill`  |
| `improve-prompt` | `loading-skill` → `analyzing` → `improving` → `generating-skill` |
| `create`         | `planning` → `generating-skill`（既存）                          |

---

## 設計方針

### update / improve-prompt モード共通

1. 各 mode は専用メソッドへ dispatch される
2. 専用メソッド完了後、`init_skill.js` の呼び出し経路へ到達しない
3. 進捗イベントは mode ごとに固定順序で emit される
4. mode 固有の更新アルゴリズムは専用メソッド内で閉じ、`runCreateSkill` 本体へ漏らさない

### init_skill.js 回避

Phase 3 での承認を待って方式 A または方式 B を選定する。いずれの方式でも、`init_skill.js` が update / improve-prompt モードで実行されないことを単体テスト（モック検証）で担保する。

---

## 参照資料

| 資料名                     | パス                                                                                    | 用途                             |
| -------------------------- | --------------------------------------------------------------------------------------- | -------------------------------- |
| SkillCreatorService        | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                           | 実装対象・runCreateWorkflow 参照 |
| Phase 1 要件定義           | `docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE/phase-1-requirements.md` | 受け入れ基準 AC-1〜AC-5          |
| SkillCreatorService テスト | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`            | 既存テスト構造の把握             |
| アーキテクチャ参照         | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`           | サービス設計方針                 |

---

## 成果物

| 成果物             | パス                                   | 説明                              |
| ------------------ | -------------------------------------- | --------------------------------- |
| 設計書             | `outputs/phase-2/design.md`            | 本 Phase の設計内容をまとめた文書 |
| メソッドシグネチャ | `outputs/phase-2/method-signatures.md` | 2メソッドのシグネチャ・設計根拠   |

---

## 完了条件チェックボックス

- [ ] T-2-1: `runUpdateWorkflow` のシグネチャが確定している
- [ ] T-2-2: `runImprovePromptWorkflow` のシグネチャが確定している
- [ ] T-2-3: `init_skill.js` をスキップする制御方式（A または B）の候補が記録されている
- [ ] T-2-4: 各モードの progress emit フェーズ順序が確定している
- [ ] `outputs/phase-2/design.md` を出力した
- [ ] `outputs/phase-2/method-signatures.md` を出力した

---

## Phase 末端アクション

```bash
# artifacts.json の Phase 2 ステータスを更新する
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE --phase 2 \
  --artifacts "outputs/phase-2/design.md:設計書" \
  --artifacts "outputs/phase-2/method-signatures.md:メソッドシグネチャ設計"
```

Phase 2 完了後、**Phase 3（設計レビューゲート）へ進む。**
