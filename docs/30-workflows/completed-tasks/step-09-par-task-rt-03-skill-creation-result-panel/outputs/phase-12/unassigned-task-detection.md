# Phase 12: 未割り当てタスク検出

## 対象タスク: TASK-RT-03 Skill Creation Result Panel

## 後続タスク候補

| #   | タスク名                         | 概要                                                                                                                                                                  | 発見元   | 優先度 |
| --- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------ |
| 1   | レスポンシブデザイン対応         | モバイル幅（< 768px）でのパネル表示最適化。カードレイアウトの折り返し、タグの横スクロール                                                                             | Phase 11 | 低     |
| 2   | Storybook 統合                   | PlanResultDetailPanel / ExecuteResultDetailPanel / ErrorBanner の全バリエーションをビジュアルカタログとして作成。ダークモード・エラー状態・空配列等の全パターンを含む | Phase 11 | 低     |
| 3   | Verify / Improve 結果パネル      | VerifyResultDetailPanel、ImproveResultDetailPanel の実装。TASK-RT-03 と同一の result-panel-parts.tsx を再利用可能                                                     | Phase 1  | 中     |
| 4   | 仮想スクロール対応               | permissionDenials / sdkEvents が 100 件超の場合のパフォーマンス改善。react-window または @tanstack/virtual の導入                                                     | Phase 11 | 低     |
| 5   | skillSpec シンタックスハイライト | skillSpec 折りたたみ表示にマークダウン / YAML のシンタックスハイライトを追加。prism-react-renderer 等の軽量ライブラリ活用                                             | Phase 11 | 低     |

## 詳細説明

### 1. レスポンシブデザイン対応

現在のパネルはデスクトップ幅を前提としたレイアウト。Electron アプリのウィンドウリサイズ時や、将来的な Web 版対応を考慮し、以下の対応が必要:

- カード内のセクションをスタック型に切り替え
- TagList の横スクロール / 折り返し対応
- フッターの ID 表示位置調整

### 2. Storybook 統合

CLI 環境では視覚的な確認が限定的であるため、Storybook による全バリエーションのカタログ化が推奨される。以下の Story を作成:

- PlanResultDetailPanel: 正常表示、空配列、ローディング、エラー
- ExecuteResultDetailPanel: 成功、失敗、ローディング、エラー
- ErrorBanner: 再試行あり/なし、長いメッセージ

### 3. Verify / Improve 結果パネル

スキル作成ワークフローの後続フェーズ（verify / improve）の結果表示パネル。TASK-RT-03 で作成した共有部品（result-panel-parts.tsx）を再利用することで実装コストを低減可能。

### 4. 仮想スクロール対応

大量データ表示時のパフォーマンス問題。permissionDenials や sdkEvents の件数が多い場合、DOM ノード数が増大しレンダリングが重くなる可能性がある。

### 5. skillSpec シンタックスハイライト

現在はプレーンテキストとして表示されている skillSpec に、構文ハイライトを追加することで可読性を向上させる。
