# Phase 1: 要件定義 - SkillCreator Layer3/4 verify detail の severity フィルタ追加

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 1                                                |
| 機能名 | skill-creator-layer34-ui-display-severity-filter |
| 作成日 | 2026-04-03                                       |

## 目的

タスクの目的、スコープ、受け入れ基準を明文化する。

## P50チェック: 既実装状態の調査

```bash
grep -n "expandedLayers\|checksByLayer\|VerifyLayerGroup" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
grep -n "severityFilter\|SeverityFilterLevel\|filterChecksBySeverity" apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

**調査結果**: UT-SDK-L34-UI-DISPLAY-001（Layer grouping）が実装済みで、`expandedLayers` state、`checksByLayer` useMemo、`VerifyLayerGroup` コンポーネントが存在する。severity フィルタは未実装。

## タスク分類

- UI task（Renderer コンポーネントの変更あり）

## 機能要件 (FR)

### FR-01: severity フィルタ state の追加

- `SeverityFilterLevel` 型を `"all" | "warning+" | "error"` として定義する
- `severityFilter` state のデフォルト値は `"all"` とする

### FR-02: フィルタ UI コントロールの追加

- verify detail ヘッダー近辺にセグメントボタン形式のフィルタバーを配置する
- 3つのボタン: `すべて (all)` / `警告以上 (warning+)` / `エラーのみ (error)`

### FR-03: 表示フィルタリングロジック

- `filterChecksBySeverity(checks, filter)` 関数を実装する
- `all`: 全 check を表示（フィルタなし）
- `warning+`: `info` severity の check を除外し、`warning` と `error` のみ表示する
- `error`: `error` severity の check のみ表示する

### FR-04: フィルタ後の空 Layer 非表示

- フィルタ適用後に check が0件になった Layer グループは非表示にする

### FR-05: フィルタボタンへのカウントバッジ表示

- 各フィルタレベルに該当する check 件数をバッジとして表示する
- `severityTotalCounts` useMemo で件数を計算する

### FR-06: フィルタ state のライフサイクル管理

- reverify 実行後もフィルタ state を維持する
- `activeWorkflowId` 変更時にフィルタ state を `"all"` にリセットする

## 非機能要件 (NFR)

### NFR-01: 後方互換性

- `all` フィルタ選択時の表示は、severity フィルタ導入前の表示と完全に一致すること

### NFR-02: useMemo メモ化によるパフォーマンス確保

- `filteredChecksByLayer` と `severityTotalCounts` を useMemo でメモ化し、不要な再計算を防止する

### NFR-03: アクセシビリティ

- フィルタバーに `role="radiogroup"` を設定する
- 各ボタンに `aria-checked` 属性を設定する

## 受け入れ基準 (AC)

- AC-01: severity フィルタの切り替えで表示内容が正しく絞り込まれる
- AC-02: デフォルト `all` の表示が、severity フィルタ導入前の現行 UI と同一である
- AC-03: フィルタ適用時も Layer grouping / accordion の動作が破綻しない
- AC-04: 全コンポーネントテスト（SF-01〜SF-09 含む）が PASS する

## スコープ

### 含むもの

- `SkillLifecyclePanel.tsx` への severity フィルタ state・ロジック・UI の追加
- verify detail ヘッダー近辺のフィルタコントロール配置
- Layer グループ / individual check の表示条件制御
- 対応するコンポーネントテスト（SF-01〜SF-09）の追加

### 含まないもの

- backend の check 生成ロジック変更
- severity レベルの再定義（既存の info/warning/error をそのまま使用）
- フィルタ設定のユーザー永続化

## 参照資料

| 資料名             | パス                                                                                         | 説明                    |
| ------------------ | -------------------------------------------------------------------------------------------- | ----------------------- |
| タスク仕様書       | `docs/30-workflows/unassigned-task/task-skill-creator-layer34-ui-display-severity-filter.md` | 元仕様                  |
| 先行タスク         | UT-SDK-L34-UI-DISPLAY-001                                                                    | Layer grouping 実装済み |
| 対象コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                         | メイン UI               |
| 対象テスト         | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`          | コンポーネントテスト    |

## 成果物

| 成果物     | パス                                    | 説明             |
| ---------- | --------------------------------------- | ---------------- |
| 要件定義書 | `phase-1-requirements.md`（本ファイル） | FR/NFR/AC の定義 |
| 出力コピー | `outputs/phase-1/requirements.md`       | FR/NFR/AC の出力 |

## 完了条件

- [ ] 機能要件が全て抽出されている
- [ ] 受け入れ基準が検証可能な形で定義されている
- [ ] FR/NFR 分類と優先度が設定されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## 次のPhase

Phase 2: 設計
