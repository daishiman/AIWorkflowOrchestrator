# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                                    |
| ---------- | ------------------------------------------------------- |
| Phase      | 6                                                       |
| タスクID   | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001 |
| ステータス | 未実施                                                  |
| 作成日     | 2026-04-19                                              |
| タスク種別 | NON_VISUAL（UI変更なし）                                |
| 前Phase    | 5: 実装（Green）                                        |
| 次Phase    | 7: カバレッジ確認                                       |

---

## 目的

Phase 5 で GREEN 化した TC-06相当・TC-07相当・保証点テストを基盤として、以下の観点でテストを拡充する。

1. **統合境界テスト**: wizard 起動先コンポーネント（`SessionResumePrompt` 等）を含むシナリオで `auth:login` が混入しないことを検証する
2. **境界条件・エッジケース**: 未マウント状態・props 欠損・エラー状態など、通常フローから外れた条件での `auth:login` 非発火を検証する

---

## 実行タスク

### タスク1: 統合境界テストの追加

**目的**: `SkillLifecyclePanel` から wizard が起動される統合境界シナリオで `auth:login` が混入しないことを確認する

**実行手順**:

1. `SkillLifecyclePanel.tsx` と `SessionResumePrompt.tsx` のインターフェースを確認し、wizard 起動が通る経路を特定する
2. 以下の統合境界シナリオを `auth-regression.test.tsx` に追加する
3. `pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` を実行して PASS を確認する

**追加するテストケース**:

#### AUTH-REGRESS-INTEGRATION-01: wizard 起動から SessionResumePrompt 経由の境界

| 項目         | 内容                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------- |
| 対象         | `onOpenSkillWizard` → wizard 起動先コンポーネントの呼び出し境界                                                 |
| 検証         | `auth:login` が一度も呼ばれないこと                                                                             |
| セットアップ | `SessionResumePrompt` をモックし、`onOpenSkillWizard` 呼び出し後も `mockAuthLogin` が未呼び出しであることを確認 |

```
describe("AUTH-REGRESS-INTEGRATION-01: wizard 起動先を含む統合境界で auth:login が混入しないこと", () => {
  it("onOpenSkillWizard 起動後も SessionResumePrompt 境界で auth:login が呼ばれないこと", ...)
  it("onOpenWizard 起動後も wizard 境界で auth:login が呼ばれないこと", ...)
})
```

#### AUTH-REGRESS-INTEGRATION-02: SkillLifecyclePanel のマウント・アンマウント境界

| 項目 | 内容                                                                 |
| ---- | -------------------------------------------------------------------- |
| 対象 | コンポーネントのマウント時・アンマウント時の副作用                   |
| 検証 | `render()` および `cleanup()` の前後で `auth:login` が呼ばれないこと |

```
describe("AUTH-REGRESS-INTEGRATION-02: マウント・アンマウント境界で auth:login が呼ばれないこと", () => {
  it("マウント直後に auth:login が呼ばれないこと", ...)
  it("アンマウント（cleanup）後に auth:login が呼ばれないこと", ...)
})
```

---

### タスク2: 境界条件・エッジケースの追加

**目的**: 通常フローから外れた条件（エラー状態・props 欠損・stale closure 等）での `auth:login` 非発火を検証する

**実行手順**:

1. 以下のエッジケースシナリオを `auth-regression.test.tsx` に追加する
2. 各ケースで `mockAuthLogin.not.toHaveBeenCalled()` が成立することを確認する

**追加するテストケース**:

#### AUTH-REGRESS-EDGE-01: skillError 状態での wizard 起動

| 項目 | 内容                                                                        |
| ---- | --------------------------------------------------------------------------- |
| 対象 | `mockStoreState.skillError` に値がある状態での `onOpenSkillWizard` クリック |
| 検証 | エラー表示中でも `auth:login` が呼ばれないこと                              |

#### AUTH-REGRESS-EDGE-02: isGenerating 状態での rapid click

| 項目 | 内容                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| 対象 | `mockStoreState.isGenerating = true` の状態でボタンが連続クリックされるケース |
| 検証 | 生成中状態でも `auth:login` が呼ばれないこと                                  |

#### AUTH-REGRESS-EDGE-03: props の onOpenSkillWizard が undefined に近い noop のケース

| 項目 | 内容                                                                           |
| ---- | ------------------------------------------------------------------------------ |
| 対象 | `onOpenSkillWizard` に `vi.fn()` 以外の関数（空の arrow function）を渡した場合 |
| 検証 | `auth:login` が呼ばれないこと                                                  |

#### AUTH-REGRESS-EDGE-04: 複数回 rerender 後の状態安定性

| 項目 | 内容                                                                               |
| ---- | ---------------------------------------------------------------------------------- |
| 対象 | `rerender()` を 3 回以上繰り返した後の状態                                         |
| 検証 | `auth:login` が呼ばれないこと、かつ `onOpenSkillWizard` クリックが依然機能すること |

**describe ブロック構成**:

```
describe("AUTH-REGRESS-EDGE: 境界条件・エッジケースでの auth:login 非発火保証", () => {
  describe("AUTH-REGRESS-EDGE-01: skillError 状態", () => { ... })
  describe("AUTH-REGRESS-EDGE-02: isGenerating 状態での rapid click", () => { ... })
  describe("AUTH-REGRESS-EDGE-03: onOpenSkillWizard noop のケース", () => { ... })
  describe("AUTH-REGRESS-EDGE-04: 複数回 rerender 後の状態安定性", () => { ... })
})
```

---

### タスク3: 全テストの CI PASS 確認

**目的**: Phase 6 で追加したテストを含む全テストが PASS することを確認する

**実行手順**:

1. 以下のコマンドで対象テストファイルの全ケースを確認する

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

2. 失敗したテストがある場合は、モック設定・`beforeEach` の初期化・`act` のラップ漏れを確認して修正する
3. 全 PASS を確認したら `pnpm --filter @repo/desktop test` で全体実行して既存テストへの影響がないことを確認する

---

## 参照資料

| 参照資料                 | パス                                                                                                | 内容                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 既存回帰テストファイル   | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx` | Phase 5 で GREEN 化したテスト（拡充の基盤）           |
| SkillLifecyclePanel 本体 | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                | wizard 起動経路・props インターフェースの確認         |
| SessionResumePrompt      | `apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx`                                | wizard 起動先コンポーネント（統合境界テストの参照元） |

---

## 成果物

| 成果物             | パス                                 | 内容                                                  |
| ------------------ | ------------------------------------ | ----------------------------------------------------- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md` | 追加テストの一覧・PASS 確認記録・カバレッジ観点の整理 |

---

## 統合テスト連携

**Phase 6 の統合テスト連携アクション**:

- 統合境界テスト（AUTH-REGRESS-INTEGRATION-01/02）の追加により、wizard 起動フロー全体での `auth:login` 非発火が回帰テストとして保護される
- エッジケーステスト（AUTH-REGRESS-EDGE-01〜04）の追加により、エラー状態・生成中状態での意図しない `auth:login` 呼び出しが検出される
- `pnpm --filter @repo/desktop test` での全体確認により、拡充テストが既存テスト群に悪影響を与えないことを保証する
- `outputs/phase-6/coverage-report.md` により、Phase 7 のカバレッジ確認への作業引き継ぎを明確にする

---

## 多角的チェック観点

| 観点                  | チェック内容                                                                            |
| --------------------- | --------------------------------------------------------------------------------------- |
| 統合境界の網羅性      | wizard 起動先として想定される全コンポーネントが境界テストに含まれているか               |
| エッジケースの妥当性  | 追加したエッジケースが実際のユーザー操作・状態遷移として発生しうるケースか              |
| モック設定の独立性    | 各テストが `beforeEach` の初期化によって独立して実行できるか                            |
| 既存テストへの干渉    | 追加テストが `vi.mock()` のスコープ等で既存テスト（TC-01〜TC-08）に影響を与えていないか |
| auth:login の検出精度 | `mockAuthLogin` が `window.electronAPI.auth.login` と正しく紐付いているか               |

---

## サブタスク管理

| サブタスクID | 内容                                                   | ステータス |
| ------------ | ------------------------------------------------------ | ---------- |
| ST-6-01      | AUTH-REGRESS-INTEGRATION-01（wizard 起動境界）追加     | 未実施     |
| ST-6-02      | AUTH-REGRESS-INTEGRATION-02（マウント境界）追加        | 未実施     |
| ST-6-03      | AUTH-REGRESS-EDGE-01（skillError 状態）追加            | 未実施     |
| ST-6-04      | AUTH-REGRESS-EDGE-02（isGenerating + rapid click）追加 | 未実施     |
| ST-6-05      | AUTH-REGRESS-EDGE-03（noop handler）追加               | 未実施     |
| ST-6-06      | AUTH-REGRESS-EDGE-04（複数回 rerender）追加            | 未実施     |
| ST-6-07      | 全テスト CI PASS 確認                                  | 未実施     |

---

## 完了条件

- [ ] 統合境界テスト（AUTH-REGRESS-INTEGRATION-01/02）が追加され PASS している
- [ ] エッジケーステスト（AUTH-REGRESS-EDGE-01〜04）が追加され PASS している
- [ ] 既存テスト（TC-01/TC-02/TC-04/TC-08）および Phase 5 追加テストが引き続き PASS している
- [ ] `pnpm --filter @repo/desktop test` 全体実行で既存テストが壊れていない
- [ ] `outputs/phase-6/coverage-report.md` が生成されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001/phase-7-coverage.md`
