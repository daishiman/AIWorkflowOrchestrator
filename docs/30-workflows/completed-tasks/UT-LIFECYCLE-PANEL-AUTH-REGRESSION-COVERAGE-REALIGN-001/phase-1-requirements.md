# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 1                                                       |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001 |
| ステータス | 未実施                                                  |
| 作成日     | 2026-04-19                                              |

## 目的

TC-06 / TC-07 が削除された経緯と旧 prepare フローへの依存内容を調査し、現行 UI における保証の空白箇所を特定する。`SkillLifecyclePanel` 単体テストが担うべき責務と、wizard 起動先を含む統合テストが担うべき責務の境界を事実ベースで確定し、Phase 2 の設計に向けた入力データを収集する。

## P50 チェック結果

| 確認項目                          | 判定     | 根拠                                                                                                    |
| --------------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| current branch に既存実装があるか | No       | 本 workflow 作成時点の変更対象は仕様書一式であり、対象テスト追加はこれから実装する                      |
| upstream に実装済み差分があるか   | 調査必須 | `UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001` の close-out を `git log` / `git show` で確認する |
| implementation_mode               | `new`    | 既存コード検証だけでは完了せず、新規テストケース追加と証跡更新が必要                                    |
| targeted run 事前列挙             | 済       | `SkillLifecyclePanel.auth-regression.test.tsx` を起点に単体実行する                                     |

## 実行タスク

### Step 0: P50 チェック（前提確認）

- 既存テストファイルの確認: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` の現在の内容・テストID・実行結果を把握する
- 以下のコマンドで現行テストが PASS していることを確認する

  ```bash
  pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
  ```

- `git log --oneline -10` で `UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001` の成果物コミットを特定し、削除された TC-06 / TC-07 の内容を確認する
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` の現在の実装を確認し、`onOpenSkillWizard` / `onOpenWizard` / `handleSessionStartNew` の呼び出し構造を把握する
- targeted run 一覧を `outputs/phase-1/spec-extraction-map.md` 冒頭に固定する
  - `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`

### Step 1: 現行テスト調査

- `SkillLifecyclePanel.auth-regression.test.tsx` に現在存在するテストケースを全件列挙し、テストIDと保証内容を整理する
- 削除された TC-06（rapid click での `auth:login` 非発火）・TC-07（rerender での `auth:login` 非発火）が旧 prepare フローのどの部分に依存していたかを git diff で確認する
- `SessionResumePrompt.tsx` との連携箇所を `SkillLifecyclePanel.tsx` から特定する
- `authModeSlice.ts` の `setMode()` が呼ばれる条件を実装コードから確認する

### Step 2: 責務境界分析

以下の観点で `SkillLifecyclePanel` 単体テストと統合テストの責務を切り分ける。

**単体テストが担うべき責務（候補）:**

- `onOpenSkillWizard` / `onOpenWizard` 呼び出し時に `auth:login` が発火しない
- `handleSessionStartNew` 呼び出し時に `auth:login` が発火しない
- rapid click（連打）時に `auth:login` が重複発火しない
- rerender 時（props 変化・state 更新）に `auth:login` が再発火しない
- `authModeSlice.setMode()` の呼び出し契約

**統合テストが担うべき責務（候補）:**

- wizard 起動先コンポーネント内での `auth:login` 非混入
- session resume フロー全体での認証状態遷移
- 複数コンポーネント間での auth イベント伝播

境界の判定基準として「`SkillLifecyclePanel` のモック境界より内側か外側か」を用い、分析結果を `responsibility-boundary.md` に記載する。

### Step 3: 保証点定義

以下の導線について、「どのコードパスで `auth:login` が発火しうるか」を分析し、非発火保証の実現可能性を確認する。

| 導線                           | 実装位置                  | 確認観点                               |
| ------------------------------ | ------------------------- | -------------------------------------- |
| スキル作成ウィザードを開く     | `onOpenSkillWizard`       | コールバック呼び出し時の副作用有無     |
| 詳細ウィザードを開く           | `onOpenWizard`            | コールバック呼び出し時の副作用有無     |
| セッション削除後に新規開始する | `handleSessionStartNew()` | 関数内の ipc 呼び出しと auth イベント  |
| rapid click 条件               | 連打イベント              | デバウンス・フラグ・useCallback 依存   |
| rerender 条件                  | props/state 変化          | useEffect 依存配列・レンダリング副作用 |

各保証点の確認結果を `guarantee-points.md` に記載し、単体テストで検証可能なものと統合テストで検証すべきものを明示する。

## 参照資料

- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`（現行テストファイル）
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`（実装ファイル）
- `apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx`（連携コンポーネント）
- `apps/desktop/src/renderer/store/slices/authModeSlice.ts`（認証状態スライス）
- GitHub Issue #2294（CLOSED）のコメント・実装記録
- `UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001` の成果物コミット（削除された TC-06/TC-07 の内容）

## 実行手順

1. `SkillLifecyclePanel.auth-regression.test.tsx` を読み込み、現在の全テストケース一覧を抽出して `outputs/phase-1/spec-extraction-map.md` に記載する
2. `git log --oneline -10` および `git show <commit>` で TC-06 / TC-07 の削除内容を確認し、旧依存箇所を記録する
3. `SkillLifecyclePanel.tsx` を読み込み、auth 関連の呼び出し構造を `outputs/phase-1/guarantee-points.md` にまとめる
4. Step 2 の境界分析を実施し、判定結果を `outputs/phase-1/responsibility-boundary.md` に記載する
5. Step 3 の保証点定義を完了し、Phase 2 での設計対象を確定する

## 統合テスト連携

Phase 1 は調査・分析フェーズであるため、コード変更は行わない。既存テストが引き続き PASS していることを以下で確認し、調査作業が既存テストを破壊していないことを記録する。

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

## 多角的チェック観点

- 網羅性: TC-06 / TC-07 以外に削除または `.skip` 化されたテストケースが存在しないかを確認する
- 命名の整合性: 新規に定義する保証点のテストID（TC-06 相当・TC-07 相当）が既存 TC 番号と重複しないかを確認する
- 依存性の確認: `handleSessionStartNew` が `SessionResumePrompt` 経由で呼ばれるか、直接呼ばれるかを確認し、責務境界に影響しないかを検証する
- モック境界: テスト内で `ipcRenderer` や `auth:login` チャンネルがどのようにモックされているかを確認し、非発火保証の検証方法として有効かを評価する

## サブタスク管理

| サブタスクID | 内容                              | 担当 Step |
| ------------ | --------------------------------- | --------- |
| ST-1-01      | 現行テストケースの全件列挙        | Step 1    |
| ST-1-02      | TC-06 / TC-07 削除内容の復元調査  | Step 1    |
| ST-1-03      | auth 関連呼び出し構造の整理       | Step 1    |
| ST-1-04      | 責務境界の分析・判定              | Step 2    |
| ST-1-05      | 保証点の定義と Phase 2 入力の確定 | Step 3    |

## 成果物

- `outputs/phase-1/responsibility-boundary.md`（単体テスト vs 統合テストの責務境界。導線ごとに「単体」「統合」「両方」の分類と判定根拠を記載）
- `outputs/phase-1/guarantee-points.md`（保証点の定義。各導線で `auth:login` が発火しない条件・確認方法・モック戦略を記載）
- `outputs/phase-1/spec-extraction-map.md`（現行テストの全件マップ。テストID・保証内容・旧 TC との対応・空白保証点の一覧を記載）

## 完了条件

- [ ] 現行 `SkillLifecyclePanel.auth-regression.test.tsx` の全テストケースが `spec-extraction-map.md` に列挙されている
- [ ] 削除された TC-06 / TC-07 の旧依存内容が確認済みで記録されている
- [ ] 単体テストと統合テストの責務境界が `responsibility-boundary.md` に判定根拠とともに記載されている
- [ ] `onOpenSkillWizard` / `onOpenWizard` / `handleSessionStartNew` / rapid click / rerender の5導線すべてに保証点が定義されている
- [ ] 既存テストが `vitest run` で引き続き PASS している

## タスク 100% 実行確認【必須】

以下を順番に確認すること:

1. `spec-extraction-map.md` に現行テストファイルの全テストケースが漏れなく記載されているか
2. TC-06 / TC-07 の削除内容を git コマンドで実際に確認したか
3. `responsibility-boundary.md` の5導線すべてに「単体」「統合」「両方」の分類が付与されているか
4. `guarantee-points.md` の各保証点にモック戦略（検証方法）が記載されているか
5. 既存テストが PASS していることを確認したか

## 次 Phase

Phase 2（設計）へ進む。`responsibility-boundary.md` / `guarantee-points.md` / `spec-extraction-map.md` を入力として、TC-06 相当・TC-07 相当の新規テストケース設計と責務境界テーブルの確定を行う。
