# Implementation Guide: UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001

## 概要

SkillCreator の Layer3/4 verify detail に severity フィルタ（`all` / `warning+` / `error only`）を追加し、ユーザーが重要度に応じて表示を絞り込めるようにした。

## 変更内容

### SkillLifecyclePanel.tsx

#### 新規追加

| 要素                            | 説明                                 |
| ------------------------------- | ------------------------------------ |
| `SeverityFilterLevel` 型        | `"all" \| "warning+" \| "error"`     |
| `SEVERITY_FILTER_OPTIONS`       | フィルタ選択肢の定数配列             |
| `severityFilterButtonStyles`    | active/inactive のスタイル定数       |
| `filterChecksBySeverity()`      | severity に基づく check フィルタ関数 |
| `severityFilter` state          | フィルタ状態（デフォルト `"all"`）   |
| `filteredChecksByLayer` useMemo | フィルタ適用後の layer groups        |
| `severityTotalCounts` useMemo   | 各フィルタレベルの該当件数           |

#### UI 変更

- verify detail セクション内（Status/Phase/Evidence/Route グリッドの下、Layer グループの上）にセグメントボタン形式のフィルタバーを追加
- `role="radiogroup"` + `aria-checked` でアクセシビリティ対応
- Layer グループへ渡すデータを `checksByLayer` → `filteredChecksByLayer` に変更
- フィルタ結果で空になった layer は非表示

#### State ライフサイクル

- `activeWorkflowId` 変更時に `"all"` にリセット
- reverify 時は filter state を維持（ユーザー体験の一貫性）

### SkillLifecyclePanel.test.tsx

`describe("severity フィルタ")` ブロックに 9テスト追加:

| テストID | 内容                                       |
| -------- | ------------------------------------------ |
| SF-01    | デフォルトで `all` に設定                  |
| SF-02    | `all` 選択時に全 check 表示                |
| SF-03    | `warning+` で info 非表示                  |
| SF-04    | `error` で warning/info 非表示             |
| SF-05    | 空 layer の非表示                          |
| SF-06    | 件数表示の正確性                           |
| SF-07    | reverify 後のフィルタ状態維持              |
| SF-08    | フィルタ切替後の accordion 操作            |
| SF-09    | 全 info 時の error フィルタで全 layer 消失 |

## データフロー

```
verifyDetail.checks
  → checksByLayer (useMemo: layer grouping)  [既存]
  → filteredChecksByLayer (useMemo: severity filter)  [新規]
  → VerifyLayerGroup コンポーネント
```

## テスト結果

全27テスト PASS（既存18 + 新規9）

## 完了条件チェック

- [x] severity フィルタで表示対象を切り替えられる
- [x] default の `all` 表示が現行 UI と互換
- [x] Layer grouping と accordion の操作が壊れていない
- [x] コンポーネントテストが全て PASS

## 中学生向け概念説明

### severity フィルタとは？

プログラムのチェック結果には「情報（info）」「注意（warning）」「エラー（error）」の3段階の重要度があります。チェック項目が増えると、本当に大事な「エラー」が大量の「情報」に埋もれて見つけにくくなります。

severity フィルタは、テレビのチャンネル切り替えのようなものです。「すべて」を選べば全チャンネルが見え、「Warning+」を選べば注意とエラーだけ、「Error」を選べばエラーだけが表示されます。

これにより、ユーザーは「今すぐ直すべきもの」に集中できます。
