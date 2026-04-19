# UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001: auth regression coverage realignment

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-COVERAGE-REALIGN-001             |
| タスク名     | auth regression coverage realignment                                |
| 分類         | 改善                                                                |
| 対象機能     | `SkillLifecyclePanel` の auth 回帰テスト責務                        |
| 優先度       | 高                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | 未実施                                                              |
| 発見元       | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001 Phase 12 再監査 |
| 発見日       | 2026-04-18                                                          |
| issue_number | 2294                                                                |

## 1. なぜこのタスクが必要か（Why）

旧 prepare フロー依存の TC-06 / TC-07 を削除した結果、現行 UI における `rapid click` と `rerender` 条件での `auth:login` 非発火保証が別契約として未整理になった。

## 2. 何を達成するか（What）

1. `SkillLifecyclePanel` 単体が守る責務と、wizard 起動先を含む統合テストが守る責務を切り分ける
2. `onOpenSkillWizard` / `onOpenWizard` / session resume start-new の後続導線で `auth:login` が混入しない保証点を定義する
3. rapid click / rerender の再現テストを現 UI へ合わせて再設計する

## 3. どのように実行するか（How）

### 3.1 前提条件

- `SkillLifecyclePanel.tsx` の導線を理解していること
- session resume prompt と wizard 起動コールバックの責務境界を把握していること

### 3.2 依存タスク

- なし

### 3.3 必要な知識

- `SkillLifecyclePanel.auth-regression.test.tsx`
- `SkillLifecyclePanel.tsx`
- `SessionResumePrompt.tsx`

### 3.4 推奨アプローチ

1. 単体テストでは「コンポーネント自身が `auth:login` を叩かない」ことを守る
2. 統合テストでは「wizard 起動先を含めても `auth:login` が混入しない」ことを守る
3. rapid click / rerender は現行 UI のボタン・state 更新で再定義する

### 3.5 実装課題と解決策

| 課題                                     | 解決策                                                |
| ---------------------------------------- | ----------------------------------------------------- |
| 旧 testid が廃止されている               | 現行 callback 導線で保証点を再定義する                |
| 連打条件の旧テストをそのまま移植できない | 現 UI のボタン・resume prompt を使って再設計する      |
| rerender 境界が曖昧                      | state 更新と props 更新の境界を仕様として先に固定する |

## 4. 実行手順

1. 現行導線ごとの責務境界を整理する
2. 単体 / 統合テストの担当範囲を決める
3. rapid click / rerender の再現条件を定義する
4. traceability を更新する

## 5. 完了条件チェックリスト

- [ ] 単体 / 統合の責務境界が明文化されている
- [ ] rapid click の再現テストが現 UI 基準で定義されている
- [ ] rerender 条件の回帰テストが定義されている

## 6. 検証方法

```bash
pnpm --filter @repo/desktop exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.auth-regression.test.tsx
```

## 7. リスクと対策

| リスク                                      | 影響度 | 対策                                              |
| ------------------------------------------- | ------ | ------------------------------------------------- |
| wizard 起動先で auth 誘導が混入しても見逃す | 高     | 統合境界のテストを追加する                        |
| 連打・再描画由来の回帰が復活する            | 高     | rapid click / rerender を別ケースとして再設計する |

## 8. 参照情報

- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/SessionResumePrompt.tsx`
- `docs/30-workflows/UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001/outputs/phase-7/traceability-matrix.md`

## 9. 備考

今回の close-out では主要導線の非発火を補強済みだが、削除した旧境界条件の再定義は次タスクで扱う。
