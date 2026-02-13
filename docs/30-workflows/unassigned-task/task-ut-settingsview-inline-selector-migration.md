# SettingsView残存インラインセレクタの個別セレクタ移行 - タスク指示書

## メタ情報

```yaml
issue_number: 802
```

## メタ情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | UT-SETTINGSVIEW-INLINE-SELECTOR-001                     |
| タスク名     | SettingsView残存インラインセレクタの個別セレクタ移行    |
| 分類         | リファクタリング                                        |
| 対象機能     | SettingsView（設定画面）                                |
| 優先度       | 低                                                      |
| 見積もり規模 | 小規模                                                  |
| ステータス   | 未実施                                                  |
| 発見元       | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 Phase 10（MINOR #2） |
| 発見日       | 2026-02-13                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-AGENTVIEW-INFINITE-LOOP-001のPhase 10最終レビューでMINOR指摘として検出された。SettingsViewコンポーネントにはインラインセレクタ（`useAppStore((s) => s.xxx)` の直接使用）が残存している。

現在の残存箇所は以下の3箇所:

1. `SettingsView/index.tsx`: `useAppStore((state) => state.autoSyncEnabled)` — 自動同期設定の状態取得
2. `SettingsView/index.tsx`: `useAppStore((state) => state.setAutoSyncEnabled)` — 自動同期設定のアクション取得
3. `SettingsView/ProfileSection/index.tsx`: `useAppStore((state) => state.profile)` — プロフィール情報の状態取得

UT-STORE-HOOKS-REFACTOR-001で53個の個別セレクタを追加し、UT-FIX-AGENTVIEW-INFINITE-LOOP-001でAgentViewの個別セレクタ移行パターンが確立された。同じパターンをSettingsViewにも適用すべきである。

### 1.2 問題点・課題

- SettingsViewのインラインセレクタは現時点ではP31（無限ループ）リスクが低い（アクション関数をuseEffect依存配列に含めていないため）
- しかし、今後の機能追加でuseEffect依存配列にアクション関数を追加した場合、P31と同じ無限ループが発生する潜在リスクがある
- コードベース内でセレクタ使用パターンが不統一（SettingsView内でも一部は個別セレクタ、一部はインラインセレクタ）になっており、保守性が低下している
- 新規開発者がインラインセレクタパターンを模倣するリスクがある

### 1.3 放置した場合の影響

- 将来的にSettingsViewに機能追加する際、useEffectの依存配列にインラインセレクタ経由のアクション関数を含めてしまい、P31無限ループが再発するリスクがある
- コードベース内でセレクタ使用パターンが不統一のままとなり、コードレビューで判断基準が曖昧になる
- AgentView（個別セレクタ移行済み）とSettingsView（一部インライン残存）で異なるパターンが混在し、新規参画者の学習コストが増加する

---

## 2. 何を達成するか（What）

### 2.1 目的

SettingsView内の残存インラインセレクタを個別セレクタHookに移行し、コンポーネント内のセレクタ使用パターンを統一する。

### 2.2 最終ゴール

- SettingsView配下の全コンポーネントでインラインセレクタ（`useAppStore((s) => s.xxx)` の直接使用）が0件である
- 不足している個別セレクタHook（`useAutoSyncEnabled`, `useSetAutoSyncEnabled`, `useProfile`等）がstore/index.tsに追加されている
- SettingsView固有のuseEffect依存配列が安定参照のみで構成されている
- 既存テストが全てPASSしている

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/renderer/views/SettingsView/` 配下のコンポーネント修正（index.tsx, ProfileSection/index.tsx）
- 不足している個別セレクタHookの`store/index.ts`への追加
- 対応テストの更新（SettingsView.test.tsx, ProfileSection.test.tsx）

#### 含まないもの

- 他Viewコンポーネント（ChatView, DashboardView等）の移行（UT-STORE-HOOKS-REFACTOR-003で対応）
- 合成Hook（useAuthModeStore, useLLMStore, useSkillStore等）の廃止
- SettingsSlice内部のリファクタリング

### 2.4 成果物

| 成果物                               | パス・説明                                                              |
| ------------------------------------ | ----------------------------------------------------------------------- |
| 修正済みSettingsViewコンポーネント   | `apps/desktop/src/renderer/views/SettingsView/index.tsx`                |
| 修正済みProfileSectionコンポーネント | `apps/desktop/src/renderer/views/SettingsView/ProfileSection/index.tsx` |
| 追加済み個別セレクタHook             | `apps/desktop/src/renderer/store/index.ts` への新規セレクタ追加         |
| 更新済みテストファイル群             | インラインセレクタのモック更新（必要に応じて）                          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-AGENTVIEW-INFINITE-LOOP-001が完了していること
- UT-STORE-HOOKS-REFACTOR-001が完了していること
- 個別セレクタが `store/index.ts` にエクスポートされていること（既存セレクタが参考になる）

### 3.2 依存タスク

| タスクID                           | タスク名                              | ステータス |
| ---------------------------------- | ------------------------------------- | ---------- |
| UT-FIX-AGENTVIEW-INFINITE-LOOP-001 | AgentView無限ループ修正               | 完了       |
| UT-STORE-HOOKS-REFACTOR-001        | Zustand Store Hooks個別セレクタ再設計 | 完了       |

### 3.3 必要な知識

- Zustand セレクタパターン（個別セレクタの命名規則・設計パターン）
- React useEffect依存配列の挙動
- P31（無限ループ問題）の理解
- SettingsViewのコンポーネント構成

### 3.4 推奨アプローチ

1. **調査**: SettingsView配下のインラインセレクタ使用箇所を全数確認する
   ```bash
   grep -rn "useAppStore((s\|state)" apps/desktop/src/renderer/views/SettingsView/ --include="*.tsx" --include="*.ts" | grep -v ".test." | grep -v ".spec."
   ```
2. **セレクタ追加**: 不足している個別セレクタHookをstore/index.tsに追加する
   - `useAutoSyncEnabled` — `state.autoSyncEnabled`
   - `useSetAutoSyncEnabled` — `state.setAutoSyncEnabled`
   - `useProfile`（既存の`useUserProfile`と重複がないか確認。`useUserProfile`は`state.profile`を取得済みなので流用可能）
3. **置換**: インラインセレクタを個別セレクタHookに置換する

   ```typescript
   // Before（インラインセレクタ）
   const autoSyncEnabled = useAppStore((state) => state.autoSyncEnabled);
   const setAutoSyncEnabledAction = useAppStore(
     (state) => state.setAutoSyncEnabled,
   );

   // After（個別セレクタ）
   const autoSyncEnabled = useAutoSyncEnabled();
   const setAutoSyncEnabledAction = useSetAutoSyncEnabled();
   ```

4. **依存配列確認**: useEffect依存配列が安定参照のみで構成されていることを確認する
5. **テスト確認**: 既存テストが全てPASSすることを確認する
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/views/SettingsView/
   ```

---

## 3.5 実装課題と解決策（親タスクからの教訓）

> 親タスク UT-FIX-AGENTVIEW-INFINITE-LOOP-001 および UT-STORE-HOOKS-REFACTOR-001 の実行時に遭遇した課題と解決策。同様の課題を回避するための参照情報。

| #   | 課題                                      | 発見経緯                                                                           | 解決策                                                                        | 教訓                                                                       |
| --- | ----------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Zustand合成Hookが毎回新オブジェクトを返す | SettingsViewで設定画面が無限ループ（P31）                                          | 個別セレクタHook（`useAppStore((s) => s.specificValue)`）に移行する           | 合成Hook（useXxxStore()）の戻り値関数はuseEffect依存配列に含めてはいけない |
| 2   | 個別セレクタの命名規則の統一              | 53個のセレクタを追加する際に命名が不統一になりかけた                               | `use` + パスカルケース状態名の規則を確立する（useAuthMode, useSetAuthMode等） | セレクタ追加前に命名規則を確認し、既存パターンに合わせる                   |
| 3   | happy-dom環境でのuserEvent非互換          | テスト追加時にuserEvent.setup()でSymbolエラーが発生し、49/53テストが一斉に失敗した | fireEventを使用する。非同期ハンドラはact()で包む                              | テスト追加時はhappy-dom環境制約を意識する（P39参照）                       |

### 参照リンク

- `.claude/rules/06-known-pitfalls.md` P31（Zustand Store Hooks無限ループ）
- `.claude/rules/06-known-pitfalls.md` P39（happy-dom環境でのuserEvent非互換）
- `.claude/rules/03-state-management.md` Zustand設計原則
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`

---

## 4. 実行手順

### Phase構成

| Phase | 名称                     | 目的                                         |
| ----- | ------------------------ | -------------------------------------------- |
| 1-3   | 要件定義・設計・レビュー | インラインセレクタの全数調査と移行計画策定   |
| 4-5   | テスト修正・実装         | 個別セレクタ追加、インラインセレクタ置換     |
| 6-9   | テスト拡充・品質検証     | カバレッジ確認、リファクタリング、品質検証   |
| 10-13 | レビュー・完了           | 最終レビュー、手動テスト、ドキュメント、完了 |

### Phase 1-3: 要件定義・設計・レビュー

#### 目的

SettingsView配下のインラインセレクタを全数調査し、不足セレクタの設計を行う

#### 手順

1. 以下のコマンドでインラインセレクタ使用箇所を全数調査する:
   ```bash
   grep -rn "useAppStore((s\|state)" apps/desktop/src/renderer/views/SettingsView/ --include="*.tsx" --include="*.ts" | grep -v ".test." | grep -v ".spec."
   ```
2. 既存の個別セレクタHook一覧を確認し、流用可能なセレクタを特定する:
   - `useUserProfile`（`state.profile`を取得）が既存かどうか確認
   - `useAutoSyncEnabled`, `useSetAutoSyncEnabled` が未定義であれば新規追加を計画
3. 不足セレクタの命名規則を既存パターンに合わせて決定する
4. 設計レビューを実施する

#### 成果物

- インラインセレクタ使用箇所調査レポート（ファイルパス、行番号、セレクタ対象）
- 追加セレクタ一覧（名前、取得対象、既存/新規の区分）

#### 完了条件

- [ ] 全使用箇所がリスト化されている
- [ ] 各使用箇所に対応する個別セレクタHookが決定されている
- [ ] 設計レビューがPASSまたはMINOR判定である

### Phase 4-5: テスト修正・実装

#### 目的

個別セレクタHookを追加し、インラインセレクタを置換する

#### 手順

1. store/index.tsに不足している個別セレクタHookを追加する:
   ```typescript
   // Settings selectors
   /** 自動同期設定を取得 */
   export const useAutoSyncEnabled = () =>
     useAppStore((state) => state.autoSyncEnabled);
   /** 自動同期設定を更新するアクション */
   export const useSetAutoSyncEnabled = () =>
     useAppStore((state) => state.setAutoSyncEnabled);
   ```
2. SettingsView/index.tsxのインラインセレクタを個別セレクタに置換する:

   ```typescript
   // Before
   import { useAppStore, useAuthMode, ... } from "../../store";
   const autoSyncEnabled = useAppStore((state) => state.autoSyncEnabled);
   const setAutoSyncEnabledAction = useAppStore((state) => state.setAutoSyncEnabled);

   // After
   import { useAutoSyncEnabled, useSetAutoSyncEnabled, useAuthMode, ... } from "../../store";
   const autoSyncEnabled = useAutoSyncEnabled();
   const setAutoSyncEnabledAction = useSetAutoSyncEnabled();
   ```

3. ProfileSection/index.tsxのインラインセレクタを個別セレクタに置換する:

   ```typescript
   // Before
   import { useAppStore } from "../../../store";
   const profile = useAppStore((state) => state.profile);

   // After（useUserProfileが既存の場合）
   import { useUserProfile } from "../../../store";
   const profile = useUserProfile();
   ```

4. 各ファイル変更後にTypeScriptエラーがないことを確認する
5. 既存テストを実行して全PASSを確認する:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/views/SettingsView/
   ```

#### 成果物

- 個別セレクタ追加済みstore/index.ts
- インラインセレクタ置換済みSettingsViewコンポーネント群

#### 完了条件

- [ ] store/index.tsに不足セレクタが追加されている
- [ ] SettingsView配下のインラインセレクタ使用が0件である
- [ ] TypeScriptエラーがない
- [ ] 既存テストが全PASSしている

### Phase 6-9: テスト拡充・カバレッジ確認・リファクタリング・品質検証

#### 目的

移行後のテストカバレッジ維持確認と品質検証

#### 手順

1. カバレッジレポートを生成し、移行前後でカバレッジが低下していないことを確認する
2. `pnpm typecheck` を実行してTypeScriptエラーがないことを確認する
3. `pnpm lint` を実行してESLintエラーがないことを確認する
4. `cd apps/desktop && pnpm vitest run` で全テストを実行する

#### 成果物

- 品質検証完了レポート

#### 完了条件

- [ ] TypeScript型チェックがPASS
- [ ] ESLintチェックがPASS
- [ ] 全テストがPASS

### Phase 10-13: レビュー・手動テスト・ドキュメント・完了

#### 目的

最終品質確認、ドキュメント更新、タスク完了

#### 手順

1. 最終レビューを実施する（移行の網羅性、セレクタ命名の一貫性を確認）
2. アプリを起動し、設定画面の動作を手動確認する:
   - 自動同期チェックボックスのON/OFFが正常に動作すること
   - プロフィール情報が正しく表示されること
   - AuthMode設定が正常に動作すること（既に個別セレクタ移行済み）
3. Phase 12の成果物（実装ガイド、ドキュメント更新）を作成する
4. PR準備

#### 成果物

- Phase 12成果物一式
- PR

#### 完了条件

- [ ] 最終レビューがPASS
- [ ] 手動テストで設定画面が正常動作している
- [ ] ドキュメントが更新されている
- [ ] PR準備が完了している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SettingsView/index.tsxのインラインセレクタが0件である
- [ ] SettingsView/ProfileSection/index.tsxのインラインセレクタが0件である
- [ ] 不足している個別セレクタHookがstore/index.tsに追加されている
- [ ] SettingsView配下で `useAppStore` の直接importが0件である（テストファイル除く）
- [ ] 設定画面の既存機能が正常に動作する（自動同期、プロフィール表示、AuthMode設定）

### 品質要件

- [ ] TypeScript型チェックが通る（`pnpm typecheck`）
- [ ] ESLintエラーがない（`pnpm lint`）
- [ ] 全テストがPASS（`cd apps/desktop && pnpm vitest run`）
- [ ] useEffect依存配列が安定参照のみで構成されている

### ドキュメント要件

- [ ] 追加セレクタの一覧がドキュメントに記録されている
- [ ] 移行完了ファイル一覧が記録されている

---

## 6. 検証方法

### テストケース

| No.   | テストケース                                        | 期待結果                                                                       |
| ----- | --------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| TC-01 | grep検索でSettingsView配下のインラインセレクタが0件 | `grep -rn "useAppStore((s\|state)" SettingsView/                               | grep -v test` が0件を返す |
| TC-02 | 自動同期チェックボックスのON/OFFが正常に動作        | 設定画面で自動同期のON/OFFを切り替えてstoreに反映される                        |
| TC-03 | プロフィール情報が正しく表示される                  | 設定画面でプロフィール情報（通知設定、データ管理）が正常表示される             |
| TC-04 | 全自動テストがPASS                                  | `cd apps/desktop && pnpm vitest run src/renderer/views/SettingsView/` が全PASS |
| TC-05 | useEffect依存配列に不安定参照がない                 | ESLint `react-hooks/exhaustive-deps` warningが0件                              |
| TC-06 | 設定画面で無限ループが発生しない                    | DevToolsのConsoleで連続ログ出力がないことを確認                                |

### 検証手順

1. インラインセレクタ使用箇所を再検索し0件であることを確認する:
   ```bash
   grep -rn "useAppStore((s\|state)" apps/desktop/src/renderer/views/SettingsView/ --include="*.tsx" --include="*.ts" | grep -v ".test." | grep -v ".spec."
   ```
2. useAppStoreの直接importがないことを確認する:
   ```bash
   grep -rn "useAppStore" apps/desktop/src/renderer/views/SettingsView/ --include="*.tsx" | grep -v ".test." | grep -v "import"
   ```
3. 全テストを実行する:
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/views/SettingsView/
   ```
4. アプリを起動し、設定画面を操作して正常動作を確認する

---

## 7. リスクと対策

| リスク                                              | 影響度 | 発生確率 | 対策                                                                                   |
| --------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------- |
| インラインセレクタ置換で再レンダリング特性が変化    | 中     | 低       | renderCount検証テストを追加して変更前後のレンダリング回数を確認する                    |
| 新規セレクタHook追加でstore/index.tsが肥大化        | 低     | 中       | ドメイン別（Settings selectors等）にexportをグルーピングし可読性を維持する             |
| SettingsView固有のuseEffect依存配列に不安定参照残存 | 高     | 低       | 全useEffectの依存配列を人的レビューで確認し、ESLint exhaustive-deps warningが0件を確認 |
| useUserProfileとuseProfileの命名重複                | 低     | 中       | 既存セレクタ一覧を確認し、既存のuseUserProfile（state.profile取得）を流用する          |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                           | パス                                                                         | 参照セクション                               |
| -------------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------- |
| P31: Zustand Store Hooks無限ループ     | `.claude/rules/06-known-pitfalls.md`                                         | P31セクション                                |
| P39: happy-dom環境でのuserEvent非互換  | `.claude/rules/06-known-pitfalls.md`                                         | P39セクション                                |
| 状態管理ルール                         | `.claude/rules/03-state-management.md`                                       | Zustand設計原則セクション                    |
| 状態管理仕様書                         | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` | 全体                                         |
| UT-FIX-AGENTVIEW-INFINITE-LOOP-001教訓 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`       | UT-FIX-AGENTVIEW-INFINITE-LOOP-001セクション |

### 関連ファイル

| ファイル                                                                                        | 説明                           |
| ----------------------------------------------------------------------------------------------- | ------------------------------ |
| `apps/desktop/src/renderer/store/index.ts`                                                      | 既存の個別セレクタ定義・追加先 |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`                                        | メイン移行対象（2箇所）        |
| `apps/desktop/src/renderer/views/SettingsView/ProfileSection/index.tsx`                         | 移行対象（1箇所）              |
| `apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx`                            | テスト更新対象                 |
| `apps/desktop/src/renderer/views/SettingsView/ProfileSection/__tests__/ProfileSection.test.tsx` | テスト更新対象                 |

### 関連タスク

| タスクID                           | 関係性                 | ステータス |
| ---------------------------------- | ---------------------- | ---------- |
| UT-FIX-AGENTVIEW-INFINITE-LOOP-001 | 親タスク（発見元）     | 完了       |
| UT-STORE-HOOKS-REFACTOR-001        | 個別セレクタ基盤タスク | 完了       |
| UT-STORE-HOOKS-REFACTOR-003        | 関連タスク（全体移行） | 未実施     |

---

## 9. 備考

### レビュー指摘の原文

```
UT-FIX-AGENTVIEW-INFINITE-LOOP-001 Phase 10 MINOR #2:
「SettingsView内のインラインセレクタ: P31リスク低い（アクション関数を依存配列に含めていない）」
```

### 補足事項

- 本タスクの規模は小規模（3箇所のインラインセレクタ置換 + 最大2個のセレクタHook追加）であり、1-2時間程度で完了見込み
- `useUserProfile`（`state.profile`を取得するセレクタ）が既にstore/index.tsに存在する場合、ProfileSection向けの新規セレクタ追加は不要。既存セレクタの流用を優先する
- テストファイル内のuseAppStoreモックは移行対象外とする。テストでは`vi.mocked(useAppStore)`パターンが確立されているため、テスト構造の変更は最小限に留める
- happy-dom環境でのテスト実行時はuserEventを使用せずfireEventを使用すること（P39参照）
- テスト実行は `cd apps/desktop && pnpm vitest run` で行うこと（P40対策）
- UT-STORE-HOOKS-REFACTOR-003（合成Hookを使用している全コンポーネントの段階的移行）とスコープが一部重複するが、本タスクはSettingsView限定の小規模対応として独立実行可能

### 現在のインラインセレクタ残存箇所（2026-02-13時点）

| ファイル                                | 行番号  | セレクタ対象               | P31リスク |
| --------------------------------------- | ------- | -------------------------- | --------- |
| `SettingsView/index.tsx`                | 26行目  | `state.autoSyncEnabled`    | 低        |
| `SettingsView/index.tsx`                | 27-29行 | `state.setAutoSyncEnabled` | 低        |
| `SettingsView/ProfileSection/index.tsx` | 37行目  | `state.profile`            | 低        |

---

## 変更履歴

| バージョン | 日付       | 変更内容 |
| ---------- | ---------- | -------- |
| 1.0.0      | 2026-02-13 | 初版作成 |
