# Phase 12 Task 5: スキルフィードバックレポート

## タスク: TASK-IMP-CHATPANEL-REAL-AI-CHAT-001

## ステータス: completed

## ワークフロー改善点

### WF-1: 設計タスクの Phase 4-5 モード切替判定の早期化

**現状**: Phase 4（テスト作成）開始後に「設計タスクなのでスタブベース」という判断をしている。
**改善提案**: Phase 1 の P50 チェック結果に基づき、Phase 4 開始前にテスト戦略（スタブモック vs 実装テスト）を明示的に決定するステップを追加する。設計タスクでは TDD Red-Green の代わりに「設計検証テスト」（コンポーネント契約・状態遷移の検証）をデフォルトとする。

### WF-2: NON_VISUAL 判定の worktree 環境制約の文書化

**現状**: Phase 11 で worktree 環境での Electron 起動不可が判明し、NON_VISUAL 判定を適用した。
**改善提案**: Phase 11 仕様書テンプレートに「worktree 環境制約チェック」セクションを追加し、@repo/shared のビルド依存関係がある場合は事前に NON_VISUAL 判定のパスを用意する。

### WF-3: Phase 9 型チェック修正のフィードバックループ

**現状**: Phase 9 で tsc エラー 2件（providerId 型不一致、onSend prop 不存在）を修正した。これらは Phase 5 で検出可能だった。
**改善提案**: Phase 5 完了条件に `tsc --noEmit PASS` を必須化する（現在は Phase 9 で初めて実行）。設計タスクでもスタブの型整合性を Phase 5 で確認する。

## 技術的教訓

### TL-1: streaming 配線における disabled/canSubmit の二重制御

ComposerArea の `disabled` と `canSubmit` の関係: streaming 中は `canSubmit=false` だが `disabled=false`（キャンセル操作を許可するため）。この設計意図がテスト（EC-06）で混乱を招いた。`disabled={!canSubmit && !isStreaming}` という条件式は直感的ではない。

**教訓**: 状態から派生する UI 制御が複数ある場合、各制御の設計意図をコンポーネントの JSDoc に明記する。

### TL-2: P62 DEFAULT_CONFIG fallback 禁止の ChatPanel への波及

Provider/Model 未選択時に `blocked` 状態に遷移する設計は、ユーザー初回起動時の UX に影響する。ErrorGuidance → Settings 誘導の CTA が必要。

**教訓**: fallback 禁止は安全性向上だが、UX への影響を設計段階で明示的に評価する。状態機械の `blocked` 状態の UI は P62 と UX の両立を意識して設計する。

### TL-3: 8 状態 × 4 capability の組み合わせ爆発

ChatPanelStatus (8) × AccessCapability (4) = 32 通りの組み合わせがあるが、有効な組み合わせは限定的。`blocked` は `none` capability でのみ発生し、`handoff` は `terminalSurface` でのみ発生する。

**教訓**: 状態機械設計時に「有効な組み合わせマトリクス」を Phase 2 で明示的に定義し、Phase 4 のテストケース生成に活用する。

## スキル改善提案

### SK-1: task-specification-creator への改善

**提案**: Phase 12 仕様書テンプレートの Task 4（未タスク検出）に「設計タスクの場合の簡易版パス」を追加する。設計タスクでは `docs/30-workflows/unassigned-task/` への独立指示書ファイル作成を後続実装タスクに委譲できることを明記する（P58 の文脈で）。

### SK-2: aiworkflow-requirements への改善

**提案**: `ui-ux-feature-components.md` に ChatPanel の状態×capability 有効組み合わせマトリクスを追加し、無効な組み合わせを明示する。これにより後続の実装タスクでのテストケース漏れを防止できる。

## 新規 Pitfall 候補

### 候補なし

Phase 6-11 の実行中に 06-known-pitfalls.md に未登録の新規パターンは発見されなかった。既存の P39（fireEvent のみ使用）、P40（テスト実行ディレクトリ依存）、P62（DEFAULT_CONFIG fallback 禁止）、P63（インポートパス誤り）が正しく適用され、回避に成功した。
