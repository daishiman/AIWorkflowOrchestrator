# UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE: update/improve-prompt モード未実装の修正

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-TASK-SC-LLM-PURPOSE-WIRE-001-UPDATE-MODE          |
| issue_number | 2271                                                 |
| タスク名     | SkillCreatorService update/improve-prompt モード実装 |
| 分類         | 改善                                                 |
| 対象機能     | SkillCreatorService.ts / runCreateSkill スイッチ分岐 |
| 優先度       | 高                                                   |
| 見積もり規模 | 中規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | TASK-SC-LLM-PURPOSE-WIRE-001 Phase 12 未タスク検出   |
| 発見日       | 2026-04-18                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillCreatorService.ts` の `runCreateSkill` メソッド内の switch 文において、`"update"` と `"improve-prompt"` のケースはスタブ（コメントのみ）として存在している。switch が fall-through した結果、後続の `init_skill.js` 実行（新規スキル作成フロー）が `update` / `improve-prompt` モードでも起動される。

`SkillCreatorMode` 型には `"create" | "update" | "improve-prompt" | "collaborative" | "orchestrate"` が定義されており、API 契約上は `update` / `improve-prompt` が有効なモードとして公開されている。

### 1.2 問題点・課題

- `case "update":` および `case "improve-prompt":` の本体が空（コメント `// Update workflow` のみ）
- 該当ケースに入っても処理せず fall-through し、既存スキルに対して新規作成フローが走る
- ユーザーが既存スキルを `update` リクエストで呼び出すと、スキルが上書き・再生成されるリスクがある
- `improve-prompt` モードも同様に未実装のため、prompt 改善要求が無視される

### 1.3 放置した場合の影響

- 既存スキルの更新要求が新規作成フローとして処理され、意図しないファイル上書きが発生する
- ユーザーの `improve-prompt` リクエストが反映されない（サイレント無視）
- API 契約（`SkillCreatorMode` 型）と実装が乖離した状態が継続する

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillCreatorService.ts` の `update` / `improve-prompt` モードに対応したワークフローを実装し、各モードで適切な処理が実行されるようにする。

### 2.2 最終ゴール

- `update` モード: 既存スキルを更新するワークフロー（`runUpdateWorkflow`）が実行される
- `improve-prompt` モード: スキルの prompt を改善するワークフロー（`runImprovePromptWorkflow`）が実行される
- 各モードで `init_skill.js`（新規作成スクリプト）が誤って呼ばれない
- 型チェック PASS・既存テスト全件 PASS

### 2.3 スコープ

#### 含むもの

- `case "update":` のワークフロー実装（`runUpdateWorkflow` メソッド追加）
- `case "improve-prompt":` のワークフロー実装（`runImprovePromptWorkflow` メソッド追加）
- 各モードの progress emit 設定
- 各モードのユニットテスト追加

#### 含まないもの

- `update` / `improve-prompt` モードの UI 連携変更（別タスク対象）
- `collaborative` / `orchestrate` モードの変更
- スクリプト側（`init_skill.js` 等）の変更

### 2.4 成果物

- `apps/desktop/src/main/services/skill/SkillCreatorService.ts`（`runUpdateWorkflow` / `runImprovePromptWorkflow` 追加）
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（update/improve-prompt テスト追加）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SC-LLM-PURPOSE-WIRE-001 が完了していること（`runCreateWorkflow` の LLM 統合が実装済み）
- `SkillCreatorMode` 型の定義が `packages/shared` または対象ファイルに存在すること

### 3.2 依存タスク

| タスクID                     | 依存理由                                     |
| ---------------------------- | -------------------------------------------- |
| TASK-SC-LLM-PURPOSE-WIRE-001 | `runCreateWorkflow` の実装パターンを参照する |

### 3.3 必要な知識

- `SkillCreatorService.ts` の switch 構造と `runCreateWorkflow` 実装パターン
- `executeScript` メソッドの呼び出し規約
- `emitProgress` / `shouldEmitCreateProgress` フラグの制御方法
- Vitest モックパターン（`vi.fn()` による `llmClient` モック）

### 3.4 推奨アプローチ

1. `runCreateWorkflow` の実装を参考に `runUpdateWorkflow` を実装する
2. update モードでは既存スキルのファイルを読み込んでから差分更新するフローを設計する
3. `improve-prompt` は既存の SKILL.md の `prompt` セクションのみを更新する軽量フローとする
4. progress emit は create モードと同様のフェーズ構成（`planning` → `generating-skill` → `validating`）を踏む

---

## 4. 実行手順

### Phase 構成

Phase 1〜4（要件/設計/実装/テスト）の小規模構成で対応する。

### Phase 1: 要件確認

#### 目的

update / improve-prompt 各モードの期待動作を明確化する。

#### 手順

1. `SkillCreatorMode` 型の定義を確認し、各モードの意味を整理する
2. `runCreateWorkflow` の実装を読んで再利用可能な部品を特定する
3. update / improve-prompt 固有のスクリプト（`update_skill.js` 等）の有無を確認する

#### 成果物

- モード別期待動作一覧（コメントまたは設計メモ）

#### 完了条件

- 各モードの入力・処理・出力が定義されている

---

### Phase 2: 設計

#### 目的

`runUpdateWorkflow` / `runImprovePromptWorkflow` のインターフェースと処理フローを設計する。

#### 手順

1. メソッドシグネチャ（引数・戻り値型）を定義する
2. progress フェーズ構成を決定する
3. 既存スクリプトがない場合はスタブ実装の範囲を決定する

#### 成果物

- 設計メモ（インラインコメントまたは設計文書）

#### 完了条件

- メソッドのシグネチャが確定している

---

### Phase 3: 実装

#### 目的

`case "update":` と `case "improve-prompt":` に対応する実装を追加する。

#### 手順

1. `runUpdateWorkflow(options, signal)` メソッドを追加する
2. `runImprovePromptWorkflow(options, signal)` メソッドを追加する
3. switch 文の各 case でメソッドを呼び出す
4. progress emit フラグ（`shouldEmitUpdateProgress` 等）を適切に設定する

#### 成果物

- `SkillCreatorService.ts`（実装追加済み）

#### 完了条件

- `case "update":` / `case "improve-prompt":` で新規作成フローが呼ばれない
- TypeScript 型チェック PASS

---

### Phase 4: テスト追加

#### 目的

update / improve-prompt モードのユニットテストを追加し、回帰を防ぐ。

#### 手順

1. `update` モードで `runUpdateWorkflow` が呼ばれることを検証するテストを追加する
2. `improve-prompt` モードで `runImprovePromptWorkflow` が呼ばれることを検証するテストを追加する
3. `create` モードの既存テストが引き続き PASS することを確認する

#### 成果物

- `SkillCreatorService.test.ts`（テスト追加済み）

#### 完了条件

- 全テスト PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `update` モードで `runUpdateWorkflow` が呼ばれる
- [ ] `improve-prompt` モードで `runImprovePromptWorkflow` が呼ばれる
- [ ] 各モードで `init_skill.js`（新規作成スクリプト）が呼ばれない

### 品質要件

- [ ] TypeScript 型チェック PASS
- [ ] 全ユニットテスト PASS
- [ ] `update` / `improve-prompt` モードのテストケースが追加されている

### ドキュメント要件

- [ ] 実装コメントに各モードの処理概要を記述している

---

## 6. 検証方法

### テストケース

| ケース                      | 入力                              | 期待結果                                       |
| --------------------------- | --------------------------------- | ---------------------------------------------- |
| update モード正常系         | `options.mode = "update"`         | `runUpdateWorkflow` が呼ばれる                 |
| improve-prompt モード正常系 | `options.mode = "improve-prompt"` | `runImprovePromptWorkflow` が呼ばれる          |
| create モード回帰           | `options.mode = "create"`         | `runCreateWorkflow` が呼ばれる（既存動作維持） |

### 検証手順

1. `pnpm --filter @repo/desktop test` を実行し全件 PASS を確認
2. `pnpm --filter @repo/desktop typecheck` を実行しエラー 0 を確認

---

## 7. リスクと対策

| リスク                          | 影響度 | 発生確率 | 対策                                                                    |
| ------------------------------- | ------ | -------- | ----------------------------------------------------------------------- |
| update 用スクリプトが存在しない | 中     | 高       | スタブ実装（空処理 + logger.warn）で Phase 完了とし、別タスクで詳細実装 |
| progress emit フラグの競合      | 低     | 中       | `shouldEmitCreateProgress` と別フラグを用意し排他制御する               |
| 既存テストへの回帰              | 高     | 低       | `create` モードのテストを必ず実行して確認する                           |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/` — 今回完了したタスクの実装詳細
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` — 対象ファイル
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.purpose.test.ts` — 参考テストパターン

### 参考資料

- Phase 12 未タスク検出レポート: `docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/outputs/phase-12/unassigned-task-detection.md`
- 実装ガイド: `docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/outputs/phase-12/implementation-guide.md`

---

## 9. 備考

### 苦戦箇所【記入必須】

| 項目     | 内容                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------- |
| 症状     | `update` / `improve-prompt` ケースが空のまま fall-through し、新規作成フローが誤動作する                 |
| 原因     | TASK-SC-LLM-PURPOSE-WIRE-001 で `create` モードの LLM 統合に注力した結果、他モードの実装が後回しになった |
| 対応     | Phase 12 未タスク検出で正式に識別し、本タスクとして仕様化                                                |
| 再発防止 | モード追加時は switch 全 case に最低限の実装（またはエラー throw）を入れ、スタブのみの状態でマージしない |

**Source evidence**: `docs/30-workflows/TASK-SC-LLM-PURPOSE-WIRE-001/outputs/phase-12/unassigned-task-detection.md`

### 補足事項

- `AbortError` 専用テストの弱さはレビュー指摘として残っているが、本タスクでは update/improve-prompt モードの挙動差に絞って対応する
- update 用スクリプト（`update_skill.js` 等）が存在しない場合は、スタブ実装として `logger.warn` を出力する形でも Phase を完了してよい
