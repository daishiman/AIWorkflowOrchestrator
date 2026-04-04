# Phase 4: テスト作成 - SkillCreator Layer3/4 severity フィルタ追加

## メタ情報

| 項目      | 値                                                    |
| --------- | ----------------------------------------------------- |
| Phase     | 4                                                     |
| 機能名    | task-skill-creator-layer34-ui-display-severity-filter |
| 作成日    | 2026-04-03                                            |
| 前提Phase | Phase 3                                               |
| 後続Phase | Phase 5                                               |

## 目的

TDD Red フェーズとして、severity フィルタの全テストケースを作成する。テストはフィルタ条件ごとの表示/非表示を検証し、Phase 1-3 で確認した命名規則と整合するコードを書く。

## 実行タスク

### タスク1: テストデータの設計

**目的**: テストで使用する mock データを定義する。

**手順**:

1. 既存テストの mock データパターンを確認する
   ```bash
   grep -n "mockVerifyDetail\|verifyDetail.*mock\|checks.*:" apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx | head -20
   ```
2. severity 混合の mock checks を設計する
   - Layer3 に info × 2, warning × 1, error × 1
   - Layer4 に info × 1, warning × 2
   - Layer1/2 にも適宜 check を配置（フィルタ影響確認用）
3. Phase 1-3 で確認した命名規則（camelCase state, PascalCase component）との整合を検証する

**期待される成果物**: テストデータ定義

### タスク2: フィルタ表示テストケースの作成

**目的**: 各フィルタ条件での表示/非表示をテストする。

**テストケース一覧**:

| TC-ID | テストケース                                             | 検証内容                             |
| ----- | -------------------------------------------------------- | ------------------------------------ |
| TC-01 | デフォルト表示で全 check が表示される                    | filter 初期値 `all` で全件表示       |
| TC-02 | `warning+` フィルタで info が非表示になる                | `warning` + `error` のみ表示         |
| TC-03 | `error` フィルタで warning/info が非表示になる           | `error` のみ表示                     |
| TC-04 | フィルタ後 0 件の Layer が非表示になる                   | Layer の `VerifyLayerGroup` が消える |
| TC-05 | フィルタ切り替え後に accordion 状態が維持される          | `expandedLayers` が不変              |
| TC-06 | reverify 後も filter state が維持される                  | reverify mock 後に filter 不変       |
| TC-07 | 集計バッジがフィルタ後の件数を反映する                   | severity 別件数バッジの更新          |
| TC-08 | activeWorkflowId 変更で filter が `all` にリセットされる | state リセット                       |
| TC-09 | check が 0 件の場合フィルタ UI が表示されない            | 空 state 対応                        |

**手順**:

1. 各 TC を `describe('severity filter')` ブロック内に実装する
2. `fireEvent.click` でフィルタボタンを切り替える
3. `queryByText` / `queryAllByTestId` で表示/非表示を検証する

**コード配置先**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`

**期待される成果物**: 失敗するテストコード（TDD Red）

## 参照資料

| 資料名        | パス                                                                                | 説明               |
| ------------- | ----------------------------------------------------------------------------------- | ------------------ |
| Phase 2成果物 | `outputs/phase-2/design.md`                                                         | 設計書             |
| Phase 3成果物 | `outputs/phase-3/design-review-result.md`                                           | レビュー結果       |
| 既存テスト    | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx` | テストパターン参照 |

### システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                              | 内容                     |
| -------------- | --------------------------------------------------------------------------------- | ------------------------ |
| テストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | コンポーネントテスト基準 |

## 統合テスト連携

| テスト種別           | 観点             | 期待結果                         |
| -------------------- | ---------------- | -------------------------------- |
| コンポーネントテスト | フィルタ切り替え | 表示/非表示が即時反映            |
| コンポーネントテスト | Layer 非表示     | 0 件 Layer が DOM から消える     |
| コンポーネントテスト | state 独立性     | accordion と filter が干渉しない |

## 成果物

| 成果物     | パス                           | 説明             |
| ---------- | ------------------------------ | ---------------- |
| テスト計画 | `outputs/phase-4/test-plan.md` | TC一覧・mock設計 |

## 完了条件

- [ ] テストデータ（severity 混合 mock checks）を設計した
- [ ] TC-01〜TC-09 の全テストケースを実装した
- [ ] テストが全て FAIL する（TDD Red 確認）
- [ ] テストパターンが Phase 1-3 で確認した命名規則と整合している
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装
