# UT-UI-055-001 - EmptyState（light）境界線コントラスト改善

## メタ情報

| 項目         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| タスクID     | UT-UI-055-001                                                 |
| タスク名     | EmptyState（light）境界線コントラスト改善                     |
| 分類         | 改善                                                          |
| 対象機能     | Organisms Foundation（CardGrid empty state）                  |
| 優先度       | 中                                                            |
| 見積もり規模 | 小規模                                                        |
| ステータス   | 未実施                                                        |
| 発見元       | Phase 11 手動テスト（TASK-UI-00-FOUNDATION-REFLECTION-AUDIT） |
| 発見日       | 2026-03-05                                                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`task-055-ui-00-foundation-reflection-audit` の Phase 11 視覚検証で、light テーマ時の empty card 境界線が弱く、カード境界の認識が遅れることを確認した。

### 1.2 問題点・課題

- ダークテーマと比較して light テーマの境界線コントラストが不足
- 低輝度ディスプレイでカード境界が背景に埋もれやすい

### 1.3 放置した場合の影響

- 情報グルーピングの視認性が低下し、可読性と探索効率が悪化する
- Apple HIG / WCAG AA の視覚一貫性基準から逸脱しやすい

---

## 2. 何を達成するか（What）

### 2.1 目的

light テーマの EmptyState 境界線コントラストを調整し、カード境界の視認性を dark テーマ同等レベルまで引き上げる。

### 2.2 最終ゴール

- EmptyState の境界線が light テーマで明確に識別できる
- 既存ダークテーマや hover/active 状態への副作用がない

### 2.3 スコープ

#### 含むもの

- EmptyState を利用する CardGrid empty 状態の border token/opacity 調整
- スナップショット更新と視覚回帰確認

#### 含まないもの

- EmptyState 以外のコンポーネント配色変更
- レイアウト構造や文言変更

### 2.4 成果物

- EmptyState style 修正コード
- テスト更新（スナップショット/スタイル検証）
- Phase 11 再撮影証跡（対象画面）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-UI-00-ORGANISMS` の実装資産が最新であること
- `apps/desktop` のテストがローカルで実行できること

### 3.2 依存タスク

- `TASK-UI-00-FOUNDATION-REFLECTION-AUDIT`（Phase 1〜12 完了）

### 3.3 必要な知識

- CSS token 設計（light/dark）
- React Testing Library / Vitest
- Playwright スクリーンショット取得

### 3.4 推奨アプローチ

- 境界線色を直接ハードコードせず token 経由で調整する
- light/dark で差分が明確になる最小変更に限定する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                 | 発見経緯                                      | 解決策                                                   | 教訓                                                         |
| ------------------------------------ | --------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------ |
| UI課題をドキュメント上で放置しやすい | Phase 11 で `UI-055-011` が open のまま残った | 未タスク指示書を正本化し、task-workflow 残課題へ同時登録 | 視覚課題は「検出→未タスク化→台帳登録」を同一ターンで実施する |
| 検証根拠が主観に寄りやすい           | “見えにくい” の定義が曖昧                     | 修正前後で同一画面スクショを比較し、レビュー観点を固定   | UI改善タスクは再撮影証跡を必須成果物にする                   |

---

## 4. 実行手順

### Phase構成

- Phase A: 影響範囲特定
- Phase B: 実装・テスト
- Phase C: 視覚検証・台帳同期

### Phase A: 影響範囲特定

1. EmptyState/CardGrid の border 関連 token と適用箇所を洗い出す
2. light/dark で差分が出るスタイル条件を確認する

### Phase B: 実装・テスト

1. light テーマ向け境界線 token/opacity を調整する
2. コンポーネントテスト（必要ならスナップショット）を更新する
3. `pnpm --filter @repo/desktop test` で対象テストを実行する

### Phase C: 視覚検証・台帳同期

1. 対象画面（empty light）を再撮影する
2. Phase 11 manual-test-result / discovered-issues を更新する
3. task-workflow / ui-ux-components へ反映し、完了化する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] light EmptyState の境界線視認性が改善している
- [ ] dark テーマの見た目を退行させていない

### 品質要件

- [ ] 関連ユニットテストが PASS
- [ ] 対象画面の再撮影証跡が保存されている

### ドキュメント要件

- [ ] Phase 11 課題状態が open → closed（または mitigated）へ更新
- [ ] task-workflow 残課題テーブルの状態が同期されている

---

## 6. 検証方法

### テストケース

- TC-055-302（Empty状態表示 light/desktop）再検証

### 検証手順

1. 対象コンポーネントテストを実行して PASS を確認
2. 同一ルート・同一viewportで修正後スクリーンショットを取得
3. 改善前後で境界線視認性を比較しレビュー記録を残す

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                  |
| ---------------------------------------- | ------ | -------- | ----------------------------------------------------- |
| 境界線を強めすぎて情報密度が過剰に見える | 中     | 中       | token調整を段階的に行い、視覚レビューで閾値を固定する |
| dark テーマへ副作用が波及する            | 中     | 低       | light専用条件で差分を限定し、dark再撮影で回帰確認する |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/task-055-ui-00-foundation-reflection-audit/outputs/phase-11/discovered-issues.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`

### 参考資料

- Apple Human Interface Guidelines（Color and Contrast）

---

## 9. 備考

### レビュー指摘の原文（要約）

`UI-055-011`: light empty状態の境界線コントラストが弱い。

### 補足事項

`UI-055-012`（mobile grid 行間）は任意改善として別管理とし、本タスクの必須スコープ外とする。
