# Phase 5: 実装（TDD Green）

## メタ情報

| 項目   | 値                                               |
| ------ | ------------------------------------------------ |
| Phase  | 5                                                |
| 機能名 | skill-creator-layer34-ui-display-severity-filter |
| 作成日 | 2026-04-03                                       |

## 目的

Phase 4 で作成した失敗テストを全て通す最小限の実装を行う（TDD Green フェーズ）。

## 実行タスク

### タスク1: 型定義・定数・フィルタ関数の追加

- 目的: severity フィルタの基盤となる型・定数・純粋関数を定義する
- 手順:
  1. `SeverityFilterLevel` 型を定義: `"all" | "warning+" | "error"`
  2. `SEVERITY_FILTER_OPTIONS` 定数を定義: ラベルと値の配列
  3. `severityFilterButtonStyles` 定数を定義: 各フィルタレベルのスタイル定義
  4. `filterChecksBySeverity(checks, filter)` 純粋関数を実装
     - `all`: 全件返却
     - `warning+`: `severity` が `"error"` または `"warning"` のもの
     - `error`: `severity` が `"error"` のもの
- 配置: `SkillLifecyclePanel.tsx` の既存ユーティリティ群の後
- 期待出力: 型定義・定数・フィルタ関数

### タスク2: state と useMemo の追加

- 目的: フィルタ状態管理と派生データのメモ化を実装する
- 手順:
  1. `severityFilter` state を追加（初期値: `"all"`）
  2. `filteredChecksByLayer` useMemo を追加: `checksByLayer` に `filterChecksBySeverity` を適用し、layer ごとにフィルタ済み checks を返す
  3. `severityTotalCounts` useMemo を追加: 各 severity レベルの件数を集計
  4. `activeWorkflowId` 変更時に `severityFilter` を `"all"` にリセットする useEffect を追加
- 期待出力: state・useMemo・useEffect

### タスク3: フィルタバー UI の追加

- 目的: ユーザーが severity フィルタを切り替えるためのセグメントボタンバーを実装する
- 手順:
  1. `role="radiogroup"` のコンテナ要素を作成
  2. `SEVERITY_FILTER_OPTIONS` を map して各ボタンを生成
  3. 各ボタンに `aria-checked` と `data-testid="severity-filter-${option.value}"` を設定
  4. 件数バッジを表示（`severityTotalCounts` を使用）
  5. `severityFilterButtonStyles` でアクティブ/非アクティブのスタイルを切り替え
- 配置: verify detail セクション内、Layer グループの上
- 期待出力: セグメントボタンバー UI

### タスク4: VerifyLayerGroup への filteredData 適用

- 目的: フィルタ結果を既存の Layer グループ表示に反映する
- 手順:
  1. `checksByLayer` の参照を `filteredChecksByLayer` に差し替え
  2. フィルタ後に checks が 0件の layer は非表示にする
  3. 既存の accordion 開閉ロジックへの影響がないことを確認
- 期待出力: フィルタ済みデータによる表示更新

## 参照資料

| 資料名       | パス                                                                 | 説明                    |
| ------------ | -------------------------------------------------------------------- | ----------------------- |
| 設計書       | `phase-2-design.md`                                                  | 型・関数・UI設計        |
| テスト仕様   | `phase-4-test-creation.md`                                           | SF-01〜SF-08 テスト定義 |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 実装対象                |

## 成果物

| 成果物     | パス                                                                 | 説明                           |
| ---------- | -------------------------------------------------------------------- | ------------------------------ |
| 実装コード | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | 型・定数・関数・state・UI 追加 |

## TDD検証

| 項目           | 期待                               |
| -------------- | ---------------------------------- |
| テスト実行結果 | GREEN（SF-01〜SF-08 全て PASS）    |
| 既存テスト     | TC-01〜TC-19 全て PASS（回帰なし） |

## 完了条件

- [ ] SF-01〜SF-08 のテストが全て PASS している
- [ ] 既存テスト（TC-01〜TC-19）が全て PASS している
- [ ] `SeverityFilterLevel` 型・`SEVERITY_FILTER_OPTIONS`・`severityFilterButtonStyles`・`filterChecksBySeverity` が実装されている
- [ ] `severityFilter` state・`filteredChecksByLayer` useMemo・`severityTotalCounts` useMemo が実装されている
- [ ] フィルタバー UI が `role="radiogroup"` で正しくレンダリングされている
- [ ] `activeWorkflowId` 変更時にフィルタが `"all"` にリセットされる
- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 6: テスト拡充
