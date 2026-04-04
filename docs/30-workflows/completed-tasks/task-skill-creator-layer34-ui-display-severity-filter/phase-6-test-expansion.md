# Phase 6: テスト拡充 - SkillCreator Layer3/4 severity フィルタ追加

## メタ情報

| 項目      | 値                                                    |
| --------- | ----------------------------------------------------- |
| Phase     | 6                                                     |
| 機能名    | task-skill-creator-layer34-ui-display-severity-filter |
| 作成日    | 2026-04-03                                            |
| 前提Phase | Phase 5                                               |
| 後続Phase | Phase 7                                               |

## 目的

Phase 4 のコアテストに加えて、fail path・境界値・回帰ガードのテストを追加する。

## 実行タスク

### タスク1: fail path テストの追加

**目的**: 異常系・エッジケースのテストを追加する。

**手順**:

1. verifyDetail が null / checks が空配列のケースを追加する
2. 全 check が単一 severity のエッジケースを追加する

**テストケース**:

| TC-ID | テストケース                                          | 検証内容        |
| ----- | ----------------------------------------------------- | --------------- |
| TC-10 | verifyDetail が null の場合フィルタ UI が表示されない | null guard      |
| TC-11 | checks が空配列の場合フィルタ UI が表示されない       | 空 state        |
| TC-12 | 全 check が info のとき `error` フィルタで 0 件表示   | 全 Layer 非表示 |
| TC-13 | 全 check が error のとき `all` で全件表示される       | edge case       |

### タスク2: 回帰ガードテストの追加

**目的**: 既存の Layer grouping / accordion 機能が壊れていないことを保証する。

**手順**:

1. filter 変更後に accordion 操作が正常か検証するテストを追加する
2. severity icon/style の回帰テストを追加する
3. 複数回切り替えの安定性テストを追加する

**テストケース**:

| TC-ID | テストケース                                           | 検証内容       |
| ----- | ------------------------------------------------------ | -------------- |
| TC-14 | filter 変更後も Layer 開閉が正常に動作する             | accordion 回帰 |
| TC-15 | filter 変更後も severity icon/style が正しく表示される | スタイル回帰   |
| TC-16 | 複数回のフィルタ切り替えで状態が安定する               | state 安定性   |

### タスク3: アクセシビリティテストの追加

**目的**: セグメントコントロールの a11y を検証する。

**手順**:

1. ARIA role / state 属性の存在を検証するテストを追加する
2. キーボード操作での切り替えテストを追加する

**テストケース**:

| TC-ID | テストケース                                   | 検証内容      |
| ----- | ---------------------------------------------- | ------------- |
| TC-17 | セグメントコントロールに `role="group"` がある | ARIA role     |
| TC-18 | 選択中ボタンに `aria-pressed="true"` がある    | ARIA state    |
| TC-19 | キーボード操作でフィルタ切り替えができる       | keyboard a11y |

**コード配置先**: `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`

## 参照資料

| 資料名        | パス                                        | 説明           |
| ------------- | ------------------------------------------- | -------------- |
| Phase 4成果物 | `outputs/phase-4/test-plan.md`              | コアテスト計画 |
| Phase 5成果物 | `outputs/phase-5/implementation-summary.md` | 実装内容       |

### システム仕様（aiworkflow-requirements）

| 参照資料       | パス                                                                              | 内容                     |
| -------------- | --------------------------------------------------------------------------------- | ------------------------ |
| テストパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | コンポーネントテスト基準 |

## 統合テスト連携

| テスト        | 期待結果                                                  |
| ------------- | --------------------------------------------------------- |
| 全テスト PASS | `pnpm --filter @repo/desktop test -- SkillLifecyclePanel` |

## 成果物

| 成果物             | パス                                       | 説明               |
| ------------------ | ------------------------------------------ | ------------------ |
| テスト拡充レポート | `outputs/phase-6/test-expansion-report.md` | 追加 TC 一覧と結果 |

## 完了条件

- [ ] fail path テスト（TC-10〜TC-13）を追加した
- [ ] 回帰ガードテスト（TC-14〜TC-16）を追加した
- [ ] アクセシビリティテスト（TC-17〜TC-19）を追加した
- [ ] 全テスト（TC-01〜TC-19）が PASS する
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認
