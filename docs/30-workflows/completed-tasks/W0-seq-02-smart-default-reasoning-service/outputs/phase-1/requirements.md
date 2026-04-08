# Phase 1: 要件定義 — severity フィルタ追加

## タスクID: UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001

## タスク分類

- UI task（Renderer コンポーネントの変更あり）

## 機能要件

### FR-1: severity フィルタ state

- `all` / `warning+` / `error` の3段階フィルタ
- デフォルト値は `all`（現行 UI 互換）
- `reverify` 後も filter state を維持する

### FR-2: フィルタ UI コントロール

- verify detail ヘッダー近辺にセグメントボタン形式のフィルタを配置
- 各ボタンに該当件数を表示
- アクティブなフィルタが視覚的に識別可能

### FR-3: 表示条件制御

- `all`: 全 check を表示（現行動作）
- `warning+`: severity が `warning` または `error` の check のみ表示
- `error`: severity が `error` の check のみ表示
- フィルタ結果で空になった layer は非表示にする
- Layer grouping と accordion の状態はフィルタ切替で破綻しない

### FR-4: 件数バッジ整合性

- Layer ヘッダーの severity count バッジはフィルタ後の件数を反映
- フィルタ前の総件数も参照可能（フィルタボタン上で確認可能）

## 非機能要件

### NFR-1: 後方互換

- `all` 選択時に現行表示と完全互換
- 既存テストが壊れないこと

### NFR-2: パフォーマンス

- フィルタ切替は useMemo でメモ化し再描画コストを最小化

### NFR-3: アクセシビリティ

- フィルタボタンは role="radiogroup" でセマンティックに実装
- aria-checked でアクティブ状態を伝達

## スコープ外

- backend の check 生成ロジック変更
- severity の再定義
- 永続化されたユーザー設定
