# Phase 4: テスト作成（Red）

## メタ情報

| 項目       | 内容                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------- |
| Phase      | 4                                                                                                                 |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001                                                           |
| ステータス | 未実施                                                                                                            |
| 作成日     | 2026-04-19                                                                                                        |
| タスク種別 | NON_VISUAL（UI変更なし）                                                                                          |
| 入力       | 既存テストファイル `SkillLifecyclePanel.auth-regression.test.tsx`（TC-01/TC-02/TC-04/TC-08 が PASS している状態） |

---

## 目的

TDD の Red フェーズとして、旧 prepare フロー依存で削除された TC-06 / TC-07 の責務を現行 UI に合わせて再設計し、新テストケースを作成する。

- **TC-06相当（rapid click）**: `onOpenSkillWizard` を連続クリックしても `auth:login` が一度も呼ばれないことを保証する
- **TC-07相当（rerender）**: `SkillLifecyclePanel` が state/props 変更で再レンダリングされても `auth:login` が呼ばれないことを保証する
- **統合境界テスト**: wizard 起動先を含む統合境界で `auth:login` が混入しないことを保証する

この時点では実装が未整備のため、テストが「期待どおり FAIL」する状態（Red）が正しい。
Phase 5 でテストコードを実装して GREEN に移行する。

---

## 実行タスク

以下のテストケース定義と実行手順に従って Red 状態を作る。

- TC-06 / TC-07 / TC-GUARD 群のスタブを定義する
- Red 実行結果を `failing-test-list.md` に記録する

## テストケース定義

### TC-06相当: rapid click — 連続クリック時に auth:login が呼ばれないこと

**テストID**: `AUTH-REGRESS-RAPID-CLICK-06`

| 項目     | 内容                                                                                     |
| -------- | ---------------------------------------------------------------------------------------- |
| 対象     | `onOpenSkillWizard` ボタンの連続クリック                                                 |
| 検証     | `auth:login` が 0 回呼ばれていること（`expect(mockAuthLogin).not.toHaveBeenCalled()`）   |
| 再現方法 | `userEvent.click()` または `fireEvent.click()` を複数回連続で呼び出す（3〜5回程度）      |
| 失敗条件 | いずれか 1 回でも `auth:login` が呼ばれた場合                                            |
| 初回実行 | テストが定義されていないため FAIL（Red 状態）→ Phase 5 でテストコードを実装して GREEN 化 |

**describe ブロック構成**:

```
describe("TC-06: rapid click — onOpenSkillWizard を連続クリックしても auth:login が呼ばれないこと", () => {
  it("3回連続クリックしても auth:login が呼ばれないこと", ...)
  it("5回連続クリックしても auth:login が呼ばれないこと", ...)
})
```

---

### TC-07相当: rerender — 再レンダリング時に auth:login が呼ばれないこと

**テストID**: `AUTH-REGRESS-RERENDER-07`

| 項目     | 内容                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| 対象     | `SkillLifecyclePanel` の state/props 変更による再レンダリング                                              |
| 検証     | `auth:login` が 0 回呼ばれていること（`expect(mockAuthLogin).not.toHaveBeenCalled()`）                     |
| 再現方法 | `rerender()` API を使用し、`skillName` や `onOpenWizard` などの props を変更して再レンダリングを発生させる |
| 失敗条件 | 再レンダリング後に `auth:login` が呼ばれた場合                                                             |
| 初回実行 | テストが定義されていないため FAIL（Red 状態）→ Phase 5 でテストコードを実装して GREEN 化                   |

**describe ブロック構成**:

```
describe("TC-07: rerender — 再レンダリング時に auth:login が呼ばれないこと", () => {
  it("skillName props 変更による rerender で auth:login が呼ばれないこと", ...)
  it("onOpenWizard props 変更による rerender で auth:login が呼ばれないこと", ...)
  it("store 状態変化（isGenerating: true→false）による rerender で auth:login が呼ばれないこと", ...)
})
```

---

### onOpenSkillWizard / onOpenWizard / handleSessionStartNew の保証点テスト

**テストID**: `AUTH-REGRESS-HANDLER-GUARANTEE`

| 項目     | 内容                                                                                                     |
| -------- | -------------------------------------------------------------------------------------------------------- |
| 対象     | `onOpenSkillWizard`・`onOpenWizard`・`handleSessionStartNew` の呼び出し経路                              |
| 検証     | 各ハンドラーが呼ばれた際に `auth:login` が呼ばれないこと、および各ハンドラー自体が期待どおり呼ばれること |
| 失敗条件 | `auth:login` が呼ばれた場合、または期待したハンドラーが呼ばれていない場合                                |
| 初回実行 | テストが定義されていないため FAIL（Red 状態）→ Phase 5 でテストコードを実装して GREEN 化                 |

**describe ブロック構成**:

```
describe("AUTH-REGRESS-HANDLER-GUARANTEE: onOpenSkillWizard/onOpenWizard/handleSessionStartNew の auth:login 非混入保証", () => {
  it("onOpenSkillWizard ボタン押下時に onOpenSkillWizard が呼ばれ auth:login が呼ばれないこと", ...)
  it("onOpenWizard ボタン押下時に onOpenWizard が呼ばれ auth:login が呼ばれないこと", ...)
})
```

---

### 統合境界テスト

**テストID**: `AUTH-REGRESS-INTEGRATION-BOUNDARY`

| 項目     | 内容                                                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- |
| 対象     | SkillLifecyclePanel → wizard 起動先コンポーネントの統合境界                                               |
| 検証     | wizard 起動（`onOpenSkillWizard` / `onOpenWizard`）から始まる一連のフローで `auth:login` が混入しないこと |
| 失敗条件 | 統合境界のいずれかで `auth:login` が呼ばれた場合                                                          |
| 初回実行 | テストが定義されていないため FAIL（Red 状態）→ Phase 6 で拡充する                                         |

---

## テストファイルの構造仕様

対象ファイル: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx`

既存テスト（TC-01/TC-02/TC-04/TC-08）の後に以下のブロックを追記する。

**ファイルコメントブロックへの追記**:

```
 * 追加テストケース（UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001）:
 *   TC-06相当: AUTH-REGRESS-RAPID-CLICK-06 — rapid click 時に auth:login が呼ばれないこと
 *   TC-07相当: AUTH-REGRESS-RERENDER-07 — rerender 時に auth:login が呼ばれないこと
 *   AUTH-REGRESS-HANDLER-GUARANTEE — handler 呼び出し保証点
```

**モック設定**: 既存の `mockAuthLogin`・`mockStoreState`・`window.electronAPI` のセットアップを再利用する。追加でモックが必要な場合は `beforeEach` 内で定義する。

---

## 実行手順

1. `SkillLifecyclePanel.auth-regression.test.tsx` を開き、TC-06相当・TC-07相当・保証点テストのスタブ（空の `it` ブロック）を追記する
2. `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` を実行する
3. 追加した `it` ブロックが「No test found」または「期待する失敗」として FAIL していることを確認する（Red 状態の確認）
4. 既存の TC-01/TC-02/TC-04/TC-08 が引き続き PASS していることを確認する
5. インポートエラー・モック設定エラーが発生していないことを確認する
6. 確認内容を `outputs/phase-4/failing-test-list.md` に記録する

---

## 参照資料

| 参照資料                 | パス                                                                                                | 内容                                          |
| ------------------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 既存回帰テストファイル   | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | TC-01〜TC-08 の既存テスト（モック設計の参照） |
| SkillLifecyclePanel 本体 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | `onOpenSkillWizard` / `onOpenWizard` の実装   |
| SessionResumePrompt      | `apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx`                                | wizard 起動先コンポーネント                   |

---

## 成果物

| 成果物               | パス                                   | 内容                                         |
| -------------------- | -------------------------------------- | -------------------------------------------- |
| Red 状態テストリスト | `outputs/phase-4/failing-test-list.md` | 新規追加テストが FAIL していることの確認記録 |

---

## 統合テスト連携

**Phase 4 の統合テスト連携アクション**:

- 新規テストが「期待どおり FAIL」していることを確認することで、Phase 5 のテスト実装が正しく機能するかを検証する基盤を作る
- 既存テスト（TC-01/TC-02/TC-04/TC-08）が PASS し続けることで、既存の回帰保護が維持されていることを確認する
- `outputs/phase-4/failing-test-list.md` の記録により、Phase 5 への作業受け渡しを明確にする

---

## 完了条件

- [ ] TC-06相当・TC-07相当・保証点テスト・統合境界テストのスタブが `auth-regression.test.tsx` に追記されている
- [ ] 追加テストがインポートエラー・モック設定エラーなしに「期待どおり FAIL」している
- [ ] 既存の TC-01/TC-02/TC-04/TC-08 が引き続き PASS している
- [ ] `outputs/phase-4/failing-test-list.md` に FAIL の確認記録が記載されている

---

## タスク100%実行確認【必須】

1. TC-06相当・TC-07相当・保証点テストのスタブが全て追記されているか
2. 追加したスタブが「実行されて FAIL」しており、インポートエラー等ではないことを確認したか
3. 既存テスト 4 件（TC-01/TC-02/TC-04/TC-08）が全て PASS していることを確認したか
4. `failing-test-list.md` に実行ログを記録したか

---

## 次Phase

Phase 5（実装 Green）へ進む。追加したスタブにテストコードを実装し、全テストを PASS させる。
