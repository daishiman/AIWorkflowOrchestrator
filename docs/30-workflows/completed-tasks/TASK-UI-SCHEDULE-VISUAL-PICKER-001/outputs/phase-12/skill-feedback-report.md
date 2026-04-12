# スキルフィードバックレポート - TASK-UI-SCHEDULE-VISUAL-PICKER-001

作成日時: 2026-04-09
対象 Phase: Phase 1-12

## フィードバックサマリー

| カテゴリ             | 件数 |
| -------------------- | ---- |
| スキル改善提案       | 2    |
| ワークフロー改善提案 | 3    |
| 設計パターン候補     | 2    |
| 合計                 | 7    |

## フィードバック一覧

### スキル改善提案

**SK-01: JSDoc コメント内 `*/` の esbuild 問題をスキル知識に組み込む**

`/** ... */` JSDoc 内に `*/` を含むテキスト（例: `ステップ値 */n`）があると
esbuild がコメント終端と誤認識してパースエラーになる。
このパターンを「コメント内でクロン式を説明するときの注意事項」としてスキル知識に追加することを推奨。

**SK-02: happy-dom 環境での `vi.stubGlobal("window", ...)` 禁止ルール**

`vi.stubGlobal` でウィンドウ全体を置き換えると React 内部の `instanceof HTMLElement` が
常に false になり、コンポーネントテストが壊れる。
テスト設定ガイドに「window.api のモックは `Object.defineProperty` を使うこと」と明記すべき。

### ワークフロー改善提案

**WF-01: カバレッジ確認はフェーズ内でインクリメンタルに行う**

Phase 7 でまとめてカバレッジ確認するより、Phase 5-6 の実装・テスト追加のタイミングで
ブランチカバレッジを随時チェックする方が効率的だった。
cronHumanizer の英語ブランチ漏れを Phase 5 時点で検出できた。

**WF-02: テストファイルの lint は実装 lint と同タイミングで実施**

実装ファイルの lint は自動フックで実施されるが、
テストファイルの未使用変数は lint 実行まで発見されなかった。
テスト作成直後に lint を実行するステップをフローに組み込むべき。

**WF-03: 統合テストの `beforeEach` 副作用を早期に確認する**

`vi.stubGlobal` による React 破壊は統合テストのみで発生した。
統合テストを小さなサニティチェックから始めることで早期検出できる。

### 設計パターン候補

**DP-01: Controlled + Uncontrolled 両対応の形式**

VisualCronPicker は `value` prop なしでも動作する（内部状態のみ）。
この「value 省略可の controlled component」パターンは他のピッカー系コンポーネントでも再利用できる。
`defaultValue` vs `value` の設計として仕様化することを推奨。

**DP-02: cronConverter / cronParser の純粋関数設計**

全変換ユーティリティを副作用のない純粋関数として実装したことで、
Vitest での単体テストが容易になり、React の外でも利用可能になった。
「UI ロジックとデータ変換ロジックを純粋関数として分離する」パターンを推奨。

## まとめ

TDD（Red→Green→Refactor）サイクルを Phase 4-8 で踏んだことで、
実装後に発覚したバグ（cronParser JSDoc, vi.stubGlobal, cronHumanizer 英語漏れ）を
テスト駆動で系統的に修正できた。

特に `Object.defineProperty` による window モックパターンは、
Electron レンダラープロセスでの testing において重要な知見であり、
プロジェクト全体の testing guideline に反映することを強く推奨する。
