# Renderer側エラーメッセージUI表示E2E確認 - タスク指示書

## メタ情報

```yaml
issue_number: 1947
```

## メタ情報

| 項目         | 内容                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------- |
| タスクID     | UT-RT-03-E2E-ERROR-MESSAGE-001                                                                     |
| タスク名     | Renderer側エラーメッセージUI表示E2E確認                                                            |
| 分類         | 改善（E2Eテスト・動作確認）                                                                        |
| 対象機能     | SkillLifecyclePanel / SkillCreateWizard / onWorkflowStateSnapshot エラー第3引数                    |
| 優先度       | 中                                                                                                 |
| 見積もり規模 | 中規模                                                                                             |
| ステータス   | 未実施                                                                                             |
| 発見元       | Phase 11 既知の制限 / Phase 1 スコープ外（TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001） |
| 発見日       | 2026-04-06                                                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UT-RT-01 では `RuntimeSkillCreatorFacade.executeAsync()` の Main 層におけるエラーメッセージ伝搬パスを統一した。この実装により、`onWorkflowStateSnapshot(planId, snapshot, errorMessage?)` の第3引数としてエラーメッセージが IPC ブリッジを経由して Renderer に届く設計になっている。

しかし TASK-UT-RT-01 のスコープは Main 層のみであり、Renderer 側（`SkillLifecyclePanel.tsx` / `SkillCreateWizard.tsx`）で実際に UI にエラーメッセージが表示されるかの確認はスコープ外とされた。

IPC ワイヤリング（preload の `safeOn<T, R>()` 可変長引数対応）は既存のため低リスクだが、E2E レベルでの確認が未実施のままである。

### 1.2 問題点・課題

- `onWorkflowStateSnapshot` の `error?` 引数が Renderer の `applyWorkflowSnapshot()` で受け取られているが、実際の UI 表示（エラーメッセージのトースト・バナー・ログ表示など）が確認されていない
- `SkillLifecyclePanel.tsx` の `workflowError` state と、Main 層から届く `errorMessage` の接続が E2E レベルで動作保証されていない
- Renderer 側のユニットテスト（TC-EP-01〜TC-EP-08）は `applyWorkflowSnapshot` の内部動作を検証しているが、実際の IPC を通じた End-to-End パスは未確認

### 1.3 放置した場合の影響

- Main 層のエラーメッセージが正しく伝搬しているにも関わらず、Renderer の UI に表示されないまま運用される可能性
- ユーザーがスキル実行時のエラー原因を把握できず、デバッグが困難になる
- E2E テスト不在により、将来の IPC 仕様変更でサイレントに動作が壊れるリスク

---

## 2. 何を達成するか（What）

### 2.1 目的

`executeAsync()` のエラーメッセージが IPC を経由して Renderer の UI に正しく表示されることを E2E レベルで確認・保証する。

### 2.2 最終ゴール

- Playwright を使った E2E テストで「スキル実行エラー時に UI にエラーメッセージが表示される」シナリオが PASS する
- または Electron の実機起動による手動検証でエラーメッセージ表示を確認しドキュメント化
- `SkillLifecyclePanel` の `workflowError` state がエラー発生時に UI に反映されることが自動テストで保証される

### 2.3 スコープ

#### 含むもの

- `SkillLifecyclePanel.tsx` と `SkillCreateWizard.tsx` のエラー表示 UI の特定
- Playwright E2E テストの作成（スキル実行エラーシナリオ）
- 手動テストが E2E テストの代替となる場合、手動テスト手順書とキャプチャ
- Phase 1-12 ワークフロー成果物

#### 含まないもの

- Main 層の `executeAsync()` 変更（TASK-UT-RT-01 完了済み）
- IPC ブリッジ（preload）の変更
- エラー表示 UI のデザイン改善（別タスク）
- 他の IPC チャネルの E2E 確認

### 2.4 成果物

- Playwright E2E テスト（`apps/desktop/e2e/skill-execution-error.spec.ts` 等）
- または手動テスト結果レポート（スクリーンショット付き）
- Phase 1-12 ワークフロー成果物

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001 が完了していること ✅
- Electron アプリがローカルでビルド・起動可能であること
- Playwright が設定済みであること（または手動テストで代替）

### 3.2 依存タスク

- TASK-UT-RT-01（完了済み）— Main 層のエラーメッセージ伝搬実装
- UT-RT-02-EXHAUSTIVE-CHECK-001（並列実行可能）— exhaustive check 導入タスク

### 3.3 必要な知識

- Playwright による Electron E2E テストのセットアップ
- `SkillLifecyclePanel.tsx` の state 管理（`workflowError`・`applyWorkflowSnapshot`）
- IPC ブリッジ（`preload/skill-creator-api.ts`）の `safeOn()` 可変長引数パターン
- `onWorkflowStateSnapshot(planId, snapshot, errorMessage?)` のシグネチャ

### 3.4 推奨アプローチ

#### ステップ1: Renderer 側のエラー表示箇所を特定

```bash
grep -n "workflowError\|setWorkflowError\|error" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

エラーメッセージが UI のどのコンポーネントに表示されるかを特定する。

#### ステップ2: E2E テストシナリオ設計

```typescript
// 例: skill-execution-error.spec.ts
test("スキル実行エラー時にエラーメッセージが表示される", async ({
  electronApp,
}) => {
  // Main 層のエラーを意図的に発生させる（モックまたは実際のエラー条件）
  // SkillLifecyclePanel にエラーメッセージが表示されることを確認
  await expect(page.locator('[data-testid="workflow-error"]')).toContainText(
    "期待するエラーメッセージ",
  );
});
```

#### ステップ3: Playwright E2E テスト or 手動テスト実施

Playwright E2E が困難な場合は手動テストで代替：

1. Electron アプリを起動
2. スキル実行でエラーを発生させる
3. UI にエラーメッセージが表示されることをスクリーンショットで記録

### 3.5 実装課題と解決策（TASK-UT-RT-01からの学び）

| 課題                                              | 原因                                                                                 | 解決策                                                           | 教訓                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | --------------------------------------------------------------- |
| IPC ブリッジの可変長引数が E2E で正しく動作するか | `safeOn<T, R extends unknown[]>()` の generics が runtime で正しく展開されるか不確定 | 実際の IPC を通じた E2E テストで確認する                         | 型レベルの確認だけでなく runtime 動作を E2E で必ず確認する      |
| error 永続化と handoff フェーズの相互作用         | `currentPhase === 'handoff'` 時に `setWorkflowError(null)` を呼ばない設計            | E2E でエラー後に handoff 遷移しても error が保持されることを確認 | Main/Renderer 層の両方にまたがるロジックは E2E レベルで検証必須 |
| Electron Playwright 環境のセットアップ複雑性      | `@playwright/test` と Electron の統合が複雑                                          | 既存 Playwright 設定を確認し、`playwright.config.ts` を踏襲する  | E2E フレームワークは先行タスクの設定を再利用して工数を削減する  |

### 3.6 システム仕様書参照テーブル

| 仕様書                                    | 参照セクション               | 用途                            |
| ----------------------------------------- | ---------------------------- | ------------------------------- |
| ipc-skill-creator.md                      | onWorkflowStateSnapshot 仕様 | IPC イベントの第3引数の契約確認 |
| ui-skill-lifecycle-panel.md               | workflowError 状態管理       | UI のエラー表示箇所の特定       |
| testing-e2e-playwright.md（存在する場合） | Electron E2E 設定            | Playwright 設定の参照           |

---

## 4. 実行手順

### Phase構成

| Phase | 名称                         | 目的                                                |
| ----- | ---------------------------- | --------------------------------------------------- |
| 1     | 要件定義                     | Renderer の UI エラー表示箇所の特定・E2E 環境確認   |
| 2     | 設計                         | E2E テストシナリオ設計・手動テスト手順書設計        |
| 3     | 設計レビュー                 | レビューゲート                                      |
| 4     | テスト作成                   | Playwright E2E テスト作成（または手動テスト手順書） |
| 5     | 実装（必要な場合）           | Renderer 側に `data-testid` 属性を追加など          |
| 6-7   | テスト実施・カバレッジ確認   | E2E テスト実行・結果記録                            |
| 8-9   | リファクタリング・品質検証   | テスト安定性確認・CI 統合                           |
| 10-13 | レビュー・ドキュメント・完了 | 最終レビュー・PR                                    |

### Phase 1: 要件定義

#### 目的

Renderer の UI でエラーが表示される箇所を特定し、E2E テストの実現可能性を評価する

#### 手順

1. `SkillLifecyclePanel.tsx` の `workflowError` state が UI のどこに表示されるかを確認
2. `SkillCreateWizard.tsx` のエラー表示ロジックを確認
3. 既存の Playwright E2E テスト設定（`playwright.config.ts`）を確認
4. E2E テスト vs 手動テスト vs コンポーネントテストの最適な検証方法を決定

#### 成果物

- UI エラー表示箇所マップ
- 検証方法の決定（E2E / 手動 / その他）

#### 完了条件

- [ ] UI のエラー表示箇所が特定されている
- [ ] 検証方法が決定されている

### Phase 4-5: テスト作成・実施

#### 目的

エラーメッセージが UI に表示されることを自動または手動で確認する

#### 手順

**E2E テストを選択した場合:**

1. エラー発生を引き起こす条件（モックまたは実条件）を設定
2. `page.locator('[data-testid="workflow-error"]')` でエラー表示を確認
3. `expect(errorElement).toContainText(expectedMessage)` でアサート

**手動テストを選択した場合:**

1. Electron アプリを `pnpm --filter @repo/desktop dev` で起動
2. スキル実行でエラーを意図的に発生させる（無効な設定など）
3. UI にエラーメッセージが表示されることをスクリーンショットで記録
4. `docs/30-workflows/task-ut-rt-03-e2e-error-message-001/outputs/phase-11/` に記録

#### 成果物

- E2E テストファイル（または手動テスト結果レポート）

#### 完了条件

- [ ] エラーメッセージが UI に表示されることが確認済み
- [ ] 確認方法（自動 or 手動）が記録されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] スキル実行エラー時に UI にエラーメッセージが表示される
- [ ] `workflowError` state が IPC 経由で受け取った `errorMessage` を正しく表示する
- [ ] handoff フェーズ後もエラーメッセージが保持される（UI 上で確認）

### 品質要件

- [ ] E2E テストが CI で PASS する（または手動テストレポートが完成している）
- [ ] TypeScript 型チェックエラー 0 件
- [ ] ESLint エラー 0 件

### ドキュメント要件

- [ ] 実装ガイド（Phase 12 成果物）
- [ ] UI エラー表示の動作確認レポート（スクリーンショット付き）
- [ ] documentation-changelog.md

---

## 6. 検証方法

### テストケース

| #   | シナリオ                                  | 期待結果                                       |
| --- | ----------------------------------------- | ---------------------------------------------- |
| 1   | スキル実行で structured error が発生する  | UI にエラーメッセージ文字列が表示される        |
| 2   | スキル実行で catch パスのエラーが発生する | UI にエラーメッセージ文字列が表示される        |
| 3   | エラー後に handoff フェーズに遷移する     | エラーメッセージが UI に保持される（消えない） |
| 4   | execute/verify を再実行する               | エラーメッセージが UI からクリアされる         |

### 検証手順

1. `pnpm --filter @repo/desktop exec playwright test e2e/skill-execution-error.spec.ts`
   （または手動テスト手順書に従った操作）
2. エラーメッセージが UI に表示されることをスクリーンショットで確認
3. `pnpm --filter @repo/desktop typecheck && pnpm --filter @repo/desktop lint`

---

## 7. リスクと対策

| リスク                                              | 影響度 | 発生確率 | 対策                                                                                |
| --------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------- |
| Playwright の Electron 統合設定が複雑で時間がかかる | 中     | 中       | 既存の E2E テスト設定を確認し、新規設定不要なら既存を活用。困難なら手動テストで代替 |
| エラー表示 UI が実装されていない                    | 高     | 低       | `workflowError` state の表示箇所を Phase 1 で確認し、未実装なら実装タスクを追加     |
| CI 環境で Electron が起動できない                   | 中     | 中       | 手動テストで代替。CI 統合は将来タスクとする                                         |
| IPC の error 引数が Renderer で受け取られていない   | 高     | 低       | `safeOn()` の可変長引数対応は確認済みだが、Phase 1 で再確認する                     |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` — UI エラー表示の実装
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.error-persistence.test.tsx` — 既存ユニットテスト
- `apps/desktop/src/preload/skill-creator-api.ts` — IPC ブリッジの可変長引数実装
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — Main 層の実装（TASK-UT-RT-01 完了済み）

### 関連タスク

- TASK-UT-RT-01-EXECUTE-ASYNC-SNAPSHOT-ERROR-MESSAGE-001（完了済み）— Main 層の前提タスク
- UT-RT-02-EXHAUSTIVE-CHECK-001（並列実行可能）— exhaustive check 導入タスク

---

## 9. 備考

### 苦戦箇所（TASK-UT-RT-01からの知見）

**苦戦点**: IPC ブリッジの可変長引数対応確認の複雑さ

- `safeOn<T, R extends unknown[]>()` の generics パターンで REST パラメータをサポートしているが、実際の IPC 通信での動作確認が必要
- 型レベルでは正しくても、Electron の contextBridge を通じた runtime での動作は別途確認が必要
- **教訓**: IPC ブリッジの型定義と runtime 動作の両方を検証することが重要

**苦戦点**: Main/Renderer 層にまたがるエラー永続化ロジックの相互依存

- `executeAsync()` のエラー伝搬と `applyWorkflowSnapshot()` のエラー永続化が連動している
- どちらかのユニットテストのみでは全体動作を保証できない
- **教訓**: 層をまたぐロジックは E2E テストで統合的に検証することが必須

### 補足事項

- IPC ワイヤリングは既存実装があるため、エラー表示 UI の有無の確認が最優先
- `workflowError` state が UI コンポーネントにバインドされているか確認すること
- E2E テストが困難な場合は、手動テストレポート（Phase 11 形式）で代替可能
- 将来的には Playwright + Electron の E2E CI 統合を別タスクで実施することを推奨
