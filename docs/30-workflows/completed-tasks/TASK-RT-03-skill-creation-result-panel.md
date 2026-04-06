# スキル生成結果の詳細表示パネル追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1884
```

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | TASK-RT-03                                                          |
| タスク名     | スキル生成結果の詳細表示パネル追加                                  |
| 分類         | 新機能（Runtime系・UI）                                             |
| 対象機能     | Skill Creator Agent SDK Lane - スキル生成結果表示                   |
| 優先度       | 中                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | 未実施                                                              |
| 発見元       | P0是正パック（ギャップ分析）                                        |
| 発見日       | 2026-04-04                                                          |
| Step         | 09（並列実行可能）                                                  |
| 依存タスク   | TASK-RT-02（スタブ応答排除）、TASK-RT-06（SDKメッセージ契約正規化） |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Skill Creator Agent SDK Lane は `plan()` → `execute()` → `verify()` の3段階フローでスキルを生成する。各フローはそれぞれ固有の結果データを返す:

| フェーズ | 結果型                             | 主な内容                                              |
| -------- | ---------------------------------- | ----------------------------------------------------- |
| plan     | `RuntimeSkillCreatorPlanResult`    | planId・skillName・agents・scripts・triggers          |
| execute  | `RuntimeSkillCreatorExecuteResult` | executeId・success・persistResult（ファイルパス一覧） |
| verify   | `RuntimeSkillCreatorVerifyDetail`  | checks[]（layer1〜4の PASS/FAIL 一覧）                |

現状の `SkillLifecyclePanel.tsx` は各フェーズの「成功/失敗フラグ」のみを状態（Jotai atoms）として保持しており、詳細データはユーザーの目に触れない。`PlanResultDetailPanel` と `ExecuteResultDetailPanel` は既にファイルとして存在しているが、verify フェーズの結果を統合表示する `SkillCreationResultPanel` が存在しない。フロー全体を通じた結果サマリーをユーザーが確認できる UI が欠けている。

### 1.2 問題点・課題

1. **plan結果の不可視**: `RuntimeSkillCreatorPlanResult` が返す `skillName`・`agents`・`scripts`・`triggers`・`anchors` は設計上重要な情報だが、ユーザーは確認できない。ユーザーはどのようなスキル設計になったか分からないまま「execute」ボタンを押すことになる。

2. **生成ファイルの不可視**: `RuntimeSkillCreatorExecuteResult.persistResult` には生成されたファイルのパス一覧 (`files: string[]`) が含まれるが、ユーザーには表示されない。どのファイルが生成されたか確認する手段がない。

3. **verify 結果の不可視**: `RuntimeSkillCreatorVerifyDetail.checks` には `layer1〜layer4` の各チェック項目と `severity`（`info`/`warning`/`error`）、`summary` が含まれるが、一覧表示する UI がない。PASS/FAIL の個別項目をユーザーが確認できない。

4. **部分成功の表示が困難**: plan は成功・verify は一部失敗という「部分成功」状態において、ユーザーに何が成功して何が失敗したかを伝えるコンポーネントが存在しない。

### 1.3 放置した場合の影響

- ユーザーがスキル生成の品質を自分で判断できず、verify が一部失敗していても気づかずに後続処理を進める
- verify FAIL の原因（どの layer・どの severity）が分からないため、ユーザーが修正指示を出せない
- `improve()` フェーズへの移行判断をユーザーが適切に行えない（改善すべき点が見えていないため）
- TASK-RT-02 でスタブ排除・エラー通知が整備されても、正常系の詳細がユーザーに届かない状態が続く

---

## 2. 何を達成するか（What）

### 2.1 目的

スキル作成フロー（plan → execute → verify）が完了または失敗した際に、各フェーズの詳細結果をユーザーが一覧確認できる `SkillCreationResultPanel` コンポーネントを実装し、`SkillLifecyclePanel` へ統合する。

### 2.2 最終ゴール

- plan フェーズ完了時: `RuntimeSkillCreatorPlanResult` の内容（skillName・推定ステップ数・agents一覧・scripts一覧・triggers・anchors）を表示する
- execute フェーズ完了時: `RuntimeSkillCreatorExecuteResult` の内容（success フラグ・生成ファイルパス一覧・sessionId・エラー詳細）を表示する
- verify フェーズ完了時: `RuntimeSkillCreatorVerifyDetail` の checks[] を layer ごとにグループ化し、PASS/FAIL/severity を一覧表示する
- 部分成功（例: planは成功、verifyは一部FAILチェックあり）の状態を視覚的に区別して表示できる
- フロー全体の完了/失敗サマリーをワンパネルで確認できる

### 2.3 スコープ

**含むもの:**

- `RuntimeSkillCreatorPlanResult` / `RuntimeSkillCreatorExecuteResult` / `RuntimeSkillCreatorVerifyDetail` の型定義の確認・整備（`packages/shared/src/types/skillCreator.ts` を参照し、不足があれば追加）
- `SkillCreationResultPanel` コンポーネントの新規作成（`apps/desktop/src/renderer/components/skill/` 配下）
- 既存の `PlanResultDetailPanel` / `ExecuteResultDetailPanel` との重複回避・統合
- `SkillLifecyclePanel` への `SkillCreationResultPanel` の統合（完了/失敗時の詳細表示として呼び出し）
- 生成されたスキルファイルの一覧表示（`persistResult.files` のファイルパス表示）
- verify checks の layer1〜layer4 グループ化表示と severity ごとのバッジ表示
- ユニットテスト（`SkillCreationResultPanel.test.tsx`）の作成

**含まないもの:**

- スキルファイルの書き出し処理（`SkillFileWriter.persist()` の呼び出し）— P0-05 の責務
- verify engine の実装・変更 — P0-01 の責務
- APIキー管理UI — TASK-RT-04 の責務
- `improve()` フェーズの UI 変更 — 別タスクの責務
- Storybook story の作成（推奨するが必須ではない）

### 2.4 成果物

| 成果物                                | 説明                       |
| ------------------------------------- | -------------------------- |
| `SkillCreationResultPanel.tsx`        | 新規コンポーネント         |
| `SkillCreationResultPanel.test.tsx`   | ユニットテスト             |
| `SkillLifecyclePanel.tsx`（変更）     | 既存コンポーネントへの統合 |
| `skillCreator.ts`（変更・必要時のみ） | 型不足があれば追記         |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

**TASK-RT-02 の完了が必須:**

- `plan()` / `execute()` がスタブ応答を返さず、明示的な `{ success, error }` 形式を返すことが保証されていること
- `SkillLifecyclePanel` がエラー応答を正しく受け取れる状態であること

**TASK-RT-06 の完了が必須:**

- `SkillCreatorSdkEvent` の正規化が完了し、各フェーズから `SkillCreationResultPanel` が受け取るデータ形式が安定していること
- 特に `RuntimeSkillCreatorExecuteResult.sdkEvents` の型が確定していること

**補足:** RT-02 と RT-06 が未完了の場合、本タスクは型定義確認（Phase 1）とコンポーネント設計（Phase 2）のみ先行可能。Phase 3 以降は RT-02/RT-06 の完了を待つ。

### 3.2 依存タスク

| タスクID   | 関係 | 何に依存するか                                               |
| ---------- | ---- | ------------------------------------------------------------ |
| TASK-RT-02 | 前提 | execute/plan がスタブ返却しないこと                          |
| TASK-RT-06 | 前提 | `sdkEvents` / `SkillCreatorSdkEvent` の型が安定していること  |
| TASK-RT-04 | 参考 | APIキー状態が `SkillLifecyclePanel` にどう伝わるかの設計参照 |

### 3.3 必要な知識

| 知識領域                          | 参照先                                                                                              |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| 型定義（PlanResult等）            | `packages/shared/src/types/skillCreator.ts`（`RuntimeSkillCreatorPlanResult` 等を参照）             |
| SkillLifecyclePanelの状態管理     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                |
| 既存の詳細パネル                  | `apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.tsx`                              |
|                                   | `apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx`                           |
| Jotai atoms の使い方              | `apps/desktop/src/renderer/store/` 配下の `useCurrentPlanResult` / `useWorkflowSnapshot` 等のフック |
| Tailwind CSS によるスタイリング   | プロジェクト全体の Tailwind 設定（`tailwind.config.ts`）                                            |
| Vitest によるコンポーネントテスト | 既存の `*.test.tsx` ファイルのパターンを参照                                                        |

### 3.4 推奨アプローチ

1. **先に型を固める**: `packages/shared/src/types/skillCreator.ts` の `RuntimeSkillCreatorPlanResult`・`RuntimeSkillCreatorExecuteResult`・`RuntimeSkillCreatorVerifyDetail` の3型を確認し、`SkillCreationResultPanel` が受け取る props の型定義を先に設計する
2. **既存パネルを活用**: `PlanResultDetailPanel` / `ExecuteResultDetailPanel` が既に存在する場合は、これらをラップまたは再利用する形で `SkillCreationResultPanel` を設計する（重複実装を避ける）
3. **段階的な表示**: plan完了 → execute完了 → verify完了 の各段階で段階的に情報を追加表示するデザインパターン（Accordion または Timeline）を採用する
4. **verify checks のグループ化**: `RuntimeSkillCreatorVerifyCheck.layer` (`"layer1" | "layer2" | "layer3" | "layer4"`) でグループ化し、severity (`"info" | "warning" | "error"`) をバッジで表示する。これは `SkillAnalysisView.tsx` の実装パターンを参考にする

---

## 4. 実行手順

### Phase 構成

```
Phase 1: 型確認（30分）
Phase 2: コンポーネント設計（30分）
Phase 3: コンポーネント実装（90分）
Phase 4: SkillLifecyclePanelへの統合（45分）
Phase 5: テスト（45分）
Phase 6: 完了確認（15分）
```

---

### Phase 1: 型確認

**目標:** `SkillCreationResultPanel` が受け取るデータ型を確定する

**手順 1-1: 既存型の確認**

`packages/shared/src/types/skillCreator.ts` を参照し、以下の型が含む全フィールドを把握する:

```typescript
// 確認対象の型
RuntimeSkillCreatorPlanResult; // plan() の戻り値
RuntimeSkillCreatorExecuteResult; // execute() の戻り値
RuntimeSkillCreatorVerifyDetail; // verify detail IPC の戻り値
RuntimeSkillCreatorVerifyCheck; // verify の個別チェック項目
RuntimeSkillCreatorVerifyCheckSeverity; // "info" | "warning" | "error"
```

**手順 1-2: 型の不足確認**

`SkillCreationResultPanel` に渡すための props 型を設計し、不足フィールドがあれば `skillCreator.ts` に追記する。ただし既存型の変更は最小限とし、新規フィールドのみ追加する。

**手順 1-3: props 型の定義**

`SkillCreationResultPanel.tsx` の冒頭に以下のような props 型を定義する（例）:

```typescript
export interface SkillCreationResultPanelProps {
  /** plan フェーズの結果。plan未完了時は null */
  planResult: RuntimeSkillCreatorPlanResult | null;
  /** execute フェーズの結果。execute未完了時は null */
  executeResult: RuntimeSkillCreatorExecuteResult | null;
  /** verify フェーズの詳細結果。verify未完了時は null */
  verifyDetail: RuntimeSkillCreatorVerifyDetail | null;
  /** パネルを閉じるコールバック（オプション） */
  onClose?: () => void;
}
```

**完了条件:** 3型のフィールド全量が把握でき、props型が定義されていること

---

### Phase 2: コンポーネント設計

**目標:** `SkillCreationResultPanel` の UI 設計を決定する

**手順 2-1: 既存パネルの確認**

以下のファイルを参照し、再利用可能な要素を特定する:

- `apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.tsx`
- `apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx`
- `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`（verify checks の表示参考）

**手順 2-2: 表示レイアウトの決定**

以下の表示構造を採用する（変更可能だが、以下を基本とする）:

```
SkillCreationResultPanel
├── ヘッダー: 「スキル生成結果」（フロー全体の成功/部分成功/失敗バッジ付き）
├── セクション 1: Plan 結果
│   ├── スキル名・説明
│   ├── 推定ステップ数
│   ├── Agents 一覧（name: role）
│   ├── Scripts 一覧（name: purpose）
│   └── Triggers / Anchors 一覧
├── セクション 2: Execute 結果
│   ├── 成功/失敗ステータス
│   ├── 生成ファイルパス一覧（persistResult.files）
│   └── エラー詳細（失敗時のみ）
└── セクション 3: Verify 結果
    ├── 全体ステータス（pass/fail）
    ├── Layer 1〜4 ごとのチェック一覧
    │   └── 各チェック: severity バッジ + summary + evidenceSummary
    └── 次のアクション（nextAction に基づく推奨表示）
```

**手順 2-3: 部分成功の表示設計**

以下のルールで全体ステータスバッジを決定する:

| planResult | executeResult.success | verifyDetail.status | 全体ステータス |
| ---------- | --------------------- | ------------------- | -------------- |
| null       | -                     | -                   | 進行中         |
| あり       | false                 | -                   | 実行失敗       |
| あり       | true                  | "fail"              | 検証失敗       |
| あり       | true                  | "pass"              | 完了           |
| あり       | true                  | "pending"           | 検証中         |

**完了条件:** レイアウトと部分成功の表示ルールが文書化またはコードコメントとして定義されていること

---

### Phase 3: コンポーネント実装

**目標:** `SkillCreationResultPanel.tsx` を実装する

**手順 3-1: ファイルの新規作成**

```
apps/desktop/src/renderer/components/skill/SkillCreationResultPanel.tsx
```

**手順 3-2: Plan結果セクションの実装**

`planResult` が null でない場合に表示するセクションを実装する。以下の項目を必ず含める:

```typescript
// planResult の表示対象フィールド
planResult.skillName; // スキル名
planResult.description; // 説明
planResult.estimatedSteps; // 推定ステップ数
planResult.agents; // Array<{ name: string; role: string }>
planResult.scripts; // Array<{ name: string; purpose: string }>
planResult.triggers; // string[]
planResult.anchors; // string[]
```

**手順 3-3: Execute結果セクションの実装**

`executeResult` が null でない場合に表示するセクションを実装する。以下の項目を必ず含める:

```typescript
// executeResult の表示対象フィールド
executeResult.success; // 成功フラグ
executeResult.error; // エラーメッセージ（失敗時）
executeResult.persistResult?.files; // 生成ファイルパス一覧（string[]）
executeResult.sessionId; // セッションID（デバッグ用、折りたたみ可）
```

**手順 3-4: Verify結果セクションの実装**

`verifyDetail` が null でない場合に表示するセクションを実装する。checks[] を `layer` でグループ化して表示する:

```typescript
// グループ化例
const checksByLayer = verifyDetail.checks.reduce(
  (acc, check) => {
    if (!acc[check.layer]) acc[check.layer] = [];
    acc[check.layer].push(check);
    return acc;
  },
  {} as Record<string, RuntimeSkillCreatorVerifyCheck[]>,
);

// 各チェックの表示対象フィールド
check.id; // チェックID
check.layer; // "layer1" | "layer2" | "layer3" | "layer4"
check.severity; // "info" | "warning" | "error" → バッジの色に使用
check.summary; // チェック内容の要約
check.evidenceSummary; // 根拠の要約（オプション）
```

**手順 3-5: 全体ステータスバッジの実装**

Phase 2 の手順 2-3 で設計したルールに基づき、ヘッダー部分に全体ステータスバッジを実装する。

**完了条件:**

- `SkillCreationResultPanel.tsx` が型エラーなくビルドできること
- `pnpm --filter @repo/desktop typecheck` がパスすること
- plan/execute/verify それぞれが null の場合にも表示が崩れないこと

---

### Phase 4: SkillLifecyclePanelへの統合

**目標:** `SkillLifecyclePanel.tsx` に `SkillCreationResultPanel` を統合する

**手順 4-1: 表示タイミングの決定**

`SkillLifecyclePanel` の既存状態（`useCurrentPlanResult`・`useWorkflowSnapshot`・`useSkillExecutionStatus` 等の Jotai atom フック）を参照し、以下のタイミングで `SkillCreationResultPanel` を表示する:

- `currentPhase` が `"verify"` 以降になった場合（verify詳細取得後）
- execute が完了し `executeResult` が取得できた場合
- フロー全体が `"handoff"` に移行した場合

**手順 4-2: データの受け渡し**

以下のフックから取得したデータを `SkillCreationResultPanel` の props に渡す:

```typescript
// SkillLifecyclePanel 内での使用例
const currentPlanResult = useCurrentPlanResult(); // RuntimeSkillCreatorPlanResult | null
const workflowSnapshot = useWorkflowSnapshot(); // SkillCreatorWorkflowUiSnapshot | null

// executeResult は workflowSnapshot の phaseArtifacts から取得
// （extractExecuteResultFromWorkflowSnapshot 関数が既に実装済み）
const executeResult = workflowSnapshot
  ? extractExecuteResultFromWorkflowSnapshot(workflowSnapshot)
  : null;

// verifyDetail は別途 getVerifyDetail IPC を呼び出して取得
// （useGetVerifyDetail または直接 API 呼び出し）
```

**手順 4-3: 表示位置の決定**

`SkillLifecyclePanel` のレンダリングツリーで `SkillCreationResultPanel` を配置する位置を決定する。既存の `PlanResultDetailPanel` / `ExecuteResultDetailPanel` との重複がないよう注意する。

**手順 4-4: 重複パネルの整理**

既存の `PlanResultDetailPanel` / `ExecuteResultDetailPanel` が `SkillCreationResultPanel` と情報が重複する場合、以下のいずれかを選択する:

1. 既存パネルを `SkillCreationResultPanel` 内部から呼び出す形に変更する
2. 既存パネルを `SkillCreationResultPanel` で置き換える（後方互換性に注意）

**完了条件:**

- `SkillLifecyclePanel.tsx` が型エラーなくビルドできること
- `pnpm --filter @repo/desktop typecheck` がパスすること
- 開発環境でパネルの表示が確認できること

---

### Phase 5: テスト

**目標:** `SkillCreationResultPanel` のユニットテストを作成し、通過させる

**手順 5-1: テストファイルの作成**

```
apps/desktop/src/renderer/components/skill/SkillCreationResultPanel.test.tsx
```

**手順 5-2: テストケースの実装**

以下のケースを必ずカバーする:

```typescript
// テストケース一覧
describe("SkillCreationResultPanel", () => {
  // ケース 1: 全データが null（初期状態）
  it("全props が null の場合にエラーなく描画される");

  // ケース 2: planResult のみあり
  it("planResult のみ渡された場合に plan セクションが表示される");
  it("planResult の skillName が表示される");
  it("planResult の agents 一覧が表示される");
  it("planResult の scripts 一覧が表示される");

  // ケース 3: executeResult の成功
  it("executeResult.success=true の場合に成功表示になる");
  it("executeResult.persistResult.files が表示される");

  // ケース 4: executeResult の失敗
  it("executeResult.success=false の場合に失敗表示になる");
  it("executeResult.error が表示される");

  // ケース 5: verifyDetail の pass
  it("verifyDetail.status=pass の場合に全体ステータスが「完了」になる");

  // ケース 6: verifyDetail の fail
  it("verifyDetail.status=fail の場合に checks が layer ごとに表示される");
  it("severity=error のチェックが適切なバッジで表示される");

  // ケース 7: 部分成功
  it(
    "executeResult.success=true かつ verifyDetail.status=fail の場合に「検証失敗」バッジが表示される",
  );
});
```

**手順 5-3: テストの実行**

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreationResultPanel"
```

**完了条件:** 全テストケースがパスし、カバレッジが 80% 以上であること

---

### Phase 6: 完了確認

**手順 6-1: 静的解析の実行**

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# テスト
pnpm --filter @repo/desktop test
```

**手順 6-2: 目視確認**

ローカル開発環境（`pnpm --filter @repo/desktop dev`）を起動し、以下の目視確認を行う:

1. スキル作成フローを実行し、plan完了後に plan セクションが表示されることを確認する
2. execute完了後に execute セクションが表示され、ファイルパスが表示されることを確認する
3. verify完了後に verify セクションが表示され、layer 別チェック一覧が表示されることを確認する
4. verify が一部失敗した場合に全体ステータスが「検証失敗」になることを確認する

---

## 5. 完了条件チェックリスト

### 型定義

- [ ] `RuntimeSkillCreatorPlanResult` の全フィールドが把握・整理されている
- [ ] `RuntimeSkillCreatorExecuteResult` の全フィールドが把握・整理されている
- [ ] `RuntimeSkillCreatorVerifyDetail` の全フィールド（特に `checks[]`）が把握・整理されている
- [ ] `SkillCreationResultPanelProps` 型が定義されている

### コンポーネント

- [ ] `SkillCreationResultPanel.tsx` が新規作成されている
- [ ] plan セクション: `skillName`・`agents`・`scripts`・`triggers`・`anchors` が表示される
- [ ] execute セクション: `success` フラグ・`persistResult.files` 一覧が表示される
- [ ] execute セクション: 失敗時に `error` メッセージが表示される
- [ ] verify セクション: `checks[]` が `layer` でグループ化されて表示される
- [ ] verify セクション: 各チェックの `severity` がバッジで表示される
- [ ] 全体ステータスバッジが部分成功パターンを正しく判定する
- [ ] 全 props が null の場合にもエラーなくレンダリングされる

### 統合

- [ ] `SkillLifecyclePanel.tsx` に `SkillCreationResultPanel` が統合されている
- [ ] 適切なタイミング（verify完了後またはhandoff移行後）に表示される
- [ ] 既存の `PlanResultDetailPanel` / `ExecuteResultDetailPanel` との重複が整理されている
- [ ] `useCurrentPlanResult` / `useWorkflowSnapshot` から正しくデータが渡されている

### テスト・品質

- [ ] `SkillCreationResultPanel.test.tsx` が作成されている
- [ ] 全テストケースがパスしている
- [ ] `pnpm --filter @repo/desktop typecheck` がパスしている
- [ ] `pnpm --filter @repo/desktop lint` がパスしている（eslint エラーなし）

---

## 6. 検証方法

### 6.1 自動検証

```bash
# 型チェック（エラー0件が合格基準）
pnpm --filter @repo/desktop typecheck

# Lint（エラー0件が合格基準）
pnpm --filter @repo/desktop lint

# ユニットテスト（全ケース PASS が合格基準）
pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreationResultPanel"
```

### 6.2 手動検証シナリオ

**シナリオ A: 正常フロー（plan → execute → verify pass）**

1. `SkillLifecyclePanel` を開く
2. スキル作成プロンプトを入力し、plan を実行する
3. plan 完了後、`SkillCreationResultPanel` の plan セクションに `skillName`・`agents`・`scripts` が表示されることを確認する
4. execute を実行し、完了後に `persistResult.files` が表示されることを確認する
5. verify が pass になり、全体ステータスが「完了」バッジになることを確認する

**シナリオ B: 部分成功（verify 一部 FAIL）**

1. verify が `fail` になる条件でスキル作成を実行する
2. verify セクションに `layer` 別のチェック一覧が表示されることを確認する
3. `severity=error` のチェックがエラーバッジで強調されることを確認する
4. 全体ステータスが「検証失敗」バッジになることを確認する

**シナリオ C: execute 失敗**

1. execute が `success=false` になる条件で実行する（RT-02 完了後に可能）
2. execute セクションに `error` メッセージが表示されることを確認する
3. 全体ステータスが「実行失敗」バッジになることを確認する

---

## 7. リスクと対策

| リスク                                                            | 影響度 | 対策                                                                                      |
| ----------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------- | -------- | -------- | --------------------------------------------------- |
| RT-06 未完了により `sdkEvents` の型が安定しない                   | 高     | Phase 3 の実装開始前に RT-06 の完了を確認する。未完了の場合は Phase 1-2 のみ先行する      |
| RT-02 未完了により execute の実際のデータが取得できない           | 高     | Phase 3-4 の実装前に RT-02 の完了を確認する。モックデータでの実装は可                     |
| `SkillLifecyclePanel` の既存 Jotai atoms との競合                 | 中     | 新規の atom は追加せず、`useCurrentPlanResult` / `useWorkflowSnapshot` を最大限再利用する |
| `PlanResultDetailPanel` / `ExecuteResultDetailPanel` との表示重複 | 中     | Phase 2 で既存パネルの使用箇所を全確認し、重複を事前に設計で排除する                      |
| verify checks のグループ化ロジックで layer の文字列が変わる可能性 | 低     | `RuntimeSkillCreatorVerifyCheck.layer` の型定義（`"layer1"                                | "layer2" | "layer3" | "layer4"`）に依存するため、型定義を参照して実装する |
| 部分成功の判定ロジックが複雑化し、テストが困難になる              | 低     | Phase 2 で判定ルールを表として文書化し、テストケースに1:1対応させる                       |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                          | パス                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| スタブ応答排除タスク（依存）          | `docs/30-workflows/unassigned-task/TASK-RT-02-stub-response-error-notification.md`          |
| SDKメッセージ契約正規化タスク（依存） | `docs/30-workflows/unassigned-task/TASK-RT-06-claude-sdk-message-contract-normalization.md` |
| LLMAdapterエラー伝播タスク（関連）    | `docs/30-workflows/unassigned-task/TASK-RT-01-llm-adapter-error-propagation.md`             |

### 関連ファイル

| ファイル                                                                  | 役割                                                          |
| ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`      | 統合先の親コンポーネント（状態管理・Jotai atoms使用）         |
| `apps/desktop/src/renderer/components/skill/PlanResultDetailPanel.tsx`    | plan結果の既存表示コンポーネント（再利用または統合対象）      |
| `apps/desktop/src/renderer/components/skill/ExecuteResultDetailPanel.tsx` | execute結果の既存表示コンポーネント（再利用または統合対象）   |
| `apps/desktop/src/renderer/components/skill/SkillAnalysisView.tsx`        | verify checks 表示の参考実装                                  |
| `packages/shared/src/types/skillCreator.ts`                               | 全型定義の参照先（PlanResult / ExecuteResult / VerifyDetail） |

### 型定義クイックリファレンス

```typescript
// plan() の結果（packages/shared/src/types/skillCreator.ts より）
interface RuntimeSkillCreatorPlanResult {
  planId: string;
  skillSpec: string;
  estimatedSteps: number;
  skillName: string;
  description: string;
  agents: Array<{ name: string; role: string }>;
  scripts: Array<{ name: string; purpose: string }>;
  triggers: string[];
  anchors: string[];
  adapterStatus?: LLMAdapterStatus;
}

// execute() の結果
interface RuntimeSkillCreatorExecuteResult {
  executeId: string;
  skillName: string;
  success: boolean;
  error?: string;
  sessionId?: string;
  persistResult?: { skillPath: string; files: string[] } | null;
  persistError?: string | null;
  sdkEvents?: SkillCreatorSdkEvent[];
}

// verify detail の戻り値
interface RuntimeSkillCreatorVerifyDetail {
  planId: string;
  currentPhase:
    | "plan"
    | "review"
    | "execute"
    | "verify"
    | "improve"
    | "reverify"
    | "handoff";
  status: "pending" | "pass" | "fail";
  message?: string;
  nextAction?: "review" | "improve" | "handoff";
  checks: RuntimeSkillCreatorVerifyCheck[];
  evidenceCount: number;
  route: RuntimeSkillCreatorVerifyDetailRoute;
}

// verify の個別チェック項目
interface RuntimeSkillCreatorVerifyCheck {
  id: string;
  layer: "layer1" | "layer2" | "layer3" | "layer4";
  severity: "info" | "warning" | "error";
  summary: string;
  evidenceSummary?: string;
}
```

### 苦戦箇所の記録

本タスクで予想される難所と対処方針を記録する（作業中に更新すること）:

1. **3段階の結果型を1つのパネルで統合表示する設計**
   - 対処方針: Phase 2 でレイアウトを先に確定し、各セクションを独立した子コンポーネントとして実装する。`SkillCreationResultPanel` はコンテナとして機能し、props の null チェックで各セクションの表示を制御する

2. **RT-06未完了状態でのデータ形式不安定**
   - 対処方針: Phase 1-2 は RT-06 完了前に実施可能。Phase 3 以降は RT-06 完了後に着手する。暫定的に `sdkEvents` は optional として扱い、存在する場合のみ表示する

3. **Jotai atomsの状態管理の複雑化**
   - 対処方針: 新規 atom を追加しない。`useCurrentPlanResult`・`useWorkflowSnapshot` の既存フックから全データを取得する設計を優先する。どうしても新規 atom が必要な場合は、`verifyDetailAtom` のみ追加を許容する（`useCurrentPlanResult` と同じ命名規則で）

4. **部分成功状態の表示設計**
   - 対処方針: Phase 2 の手順 2-3 で定義した判定テーブルを基に実装する。テーブルの各行がユニットテストの1ケースに対応するよう設計する

---

## 9. 備考

- 本タスクは TASK-RT-02 と TASK-RT-06 の完了後に Phase 3 以降を実施すること。それ以前は Phase 1-2 のみ先行可能
- `SkillCreationResultPanel` は `SkillLifecyclePanel` に統合するが、独立したコンポーネントとして設計し、将来的に他のコンテキストでも再利用できる構造にすること
- verify の `nextAction`（`"review" | "improve" | "handoff"`）に基づいた推奨アクションボタンは、UI の改善効果が高い場合に追加を検討する（本タスクの必須スコープ外）
- Storybook story の作成は推奨するが、本タスクの完了条件に含まない
- テスト実行コマンド: `pnpm --filter @repo/desktop test -- --testPathPattern="SkillCreationResultPanel"`
- 型チェックコマンド: `pnpm --filter @repo/desktop typecheck`
- ビルドコマンド: `pnpm --filter @repo/desktop build`
