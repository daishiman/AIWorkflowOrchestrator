# Phase 6: テスト拡充

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 6                           |
| 機能名 | skill-creation-result-panel |
| 作成日 | 2026-03-29                  |

## 目的

空配列、null/undefined フィールド、極端に長いデータ、特殊文字、ダークモード、アクセシビリティ等の edge case を補う。

## 実行タスク

- 空データ edge case を追加する
- 長大データ edge case を追加する
- 特殊文字 edge case を追加する
- 状態遷移 edge case を追加する

## 参照資料

| 資料名              | パス                                     | 説明           |
| ------------------- | ---------------------------------------- | -------------- |
| Phase 4 test matrix | `outputs/phase-4/test-matrix.md`         | baseline suite |
| Phase 5 実装        | `phase-5-implementation.md`              | コンポーネント |
| panel props catalog | `outputs/phase-2/panel-props-catalog.md` | props 仕様     |

## 実行手順

### ステップ1: 空データ edge case を追加する

- agents, scripts, triggers, anchors が全て空配列 — 各セクションの表示が崩れない
- skillName が空文字列 — ヘッダーが空にならない（fallback テキスト表示）
- description が空文字列 — サブヘッダーが適切に処理される
- skillSpec が undefined — 折りたたみセクションが表示されない
- error が undefined — ErrorBanner が表示されない
- planResult と error が同時に null — 何も表示されない

### ステップ2: 長大データ edge case を追加する

- skillName が 200 文字 — テキストが折り返されるか truncate される
- description が 2000 文字 — レイアウトが崩れない
- agents が 50 エントリ — リストのスクロールまたはページネーション
- skillSpec が 10000 文字 — 折りたたみ展開時のパフォーマンス
- error メッセージが 500 文字 — ErrorBanner のレイアウト維持
- triggers が 30 エントリ — タグの折り返し表示

### ステップ3: 特殊文字 edge case を追加する

- skillName に日本語を含む — 表示が正常
- description に HTML タグを含む — XSS 防止（エスケープ表示）
- agents[].role に改行を含む — レイアウト維持
- error メッセージにスタックトレースを含む — 折り返し表示
- anchors に URL を含む — テキストとして表示（リンク化しない）

### ステップ4: 状態遷移 edge case を追加する

- isLoading が true から false へ切り替わる — スケルトンから結果表示への遷移
- planResult が null から値ありへ変更 — パネルが表示される
- currentPhase が "review" → "execute" → "verify" と連続遷移 — パネルが正しく切り替わる
- error が設定された後に planResult が設定される — error が解除されて結果が表示される
- onRetry 実行中の loading 状態 — 再試行ボタンが disabled になる

## 統合テスト連携

- Phase 7 で edge case の coverage を集計する
- Phase 9 で XSS 防止と graceful degradation を確認する

## 成果物

| 成果物         | パス                        | 説明                 |
| -------------- | --------------------------- | -------------------- |
| test expansion | `phase-6-test-expansion.md` | edge case 方針と一覧 |

## 完了条件

- [ ] 空データの edge case が定義されている
- [ ] 長大データの edge case が定義されている
- [ ] 特殊文字の edge case が定義されている
- [ ] 状態遷移の edge case が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**
