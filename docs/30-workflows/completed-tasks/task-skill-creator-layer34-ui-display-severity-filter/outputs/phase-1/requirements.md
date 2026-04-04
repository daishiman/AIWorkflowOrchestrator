# Phase 1 成果物: 要件定義書

## P50チェック結果

- severity filter に関する既存コードは `SkillLifecyclePanel.tsx` に存在しない ✅
- `VerifyLayerGroup` コンポーネントは props: `layer, label, checks, isExpanded, onToggle` で構成
- 衝突リスク: なし

## 命名規則分析

| パターン             | 例                                                          | 適用先     |
| -------------------- | ----------------------------------------------------------- | ---------- |
| camelCase state      | `expandedLayers`, `isVerifyDetailLoading`, `severityFilter` | 新規 state |
| PascalCase component | `VerifyLayerGroup`                                          | -          |
| camelCase 定数       | `verifyCheckSeverityStyles`, `verifyLayerLabels`            | 新規定数   |
| UPPER_SNAKE 定数配列 | `VERIFY_LAYER_ORDER`, `VERIFY_SEVERITY_ORDER`               | -          |
| PascalCase 型        | `RuntimeSkillCreatorVerifyCheckSeverity`                    | 新規型     |

## タスク分類

**UIタスク**（Renderer側のみ、backend変更なし）

## 機能要件

| ID   | 要件                                                   | 優先度 |
| ---- | ------------------------------------------------------ | ------ |
| FR-1 | `all`/`warning+`/`error` の3段階で表示を切り替えられる | must   |
| FR-2 | 既定値は `all` で現行UIと互換                          | must   |
| FR-3 | フィルタ変更で check 表示が即時更新される              | must   |
| FR-4 | フィルタ後 0 件の Layer は非表示                       | must   |
| FR-5 | reverify 後もフィルタ条件が維持される                  | must   |
| FR-6 | activeWorkflowId 変更時は `all` にリセット             | must   |
| FR-7 | 集計バッジがフィルタ後の件数を反映する                 | should |

## 非機能要件

| ID    | 要件                                        | 優先度 |
| ----- | ------------------------------------------- | ------ |
| NFR-1 | フィルタ切り替えは即時反映（useMemo再計算） | must   |
| NFR-2 | セグメントコントロールは keyboard navigable | should |
| NFR-3 | ライト/ダークモード両対応（CSS変数使用）    | must   |
| NFR-4 | 既存レイアウトのグリッド構造を維持          | must   |

## 受け入れ基準

| ID   | 基準                                                      | 検証方法   |
| ---- | --------------------------------------------------------- | ---------- |
| AC-1 | `all` 選択時に全 severity の check が表示される           | 自動テスト |
| AC-2 | `warning+` 選択時に `info` check が非表示になる           | 自動テスト |
| AC-3 | `error` 選択時に `warning` と `info` check が非表示になる | 自動テスト |
| AC-4 | フィルタ変更後も Layer accordion の開閉状態が維持される   | 自動テスト |
| AC-5 | フィルタ適用後の集計バッジが filter 後の件数を反映する    | 自動テスト |
| AC-6 | reverify 後も選択した filter 条件が維持される             | 自動テスト |
| AC-7 | check 0 件の Layer が非表示になる                         | 自動テスト |
