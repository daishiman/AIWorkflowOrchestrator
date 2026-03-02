# Phase 12: スキルフィードバックレポート

## メタ情報

| 項目      | 値                            |
| --------- | ----------------------------- |
| タスク ID | TASK-UI-05A-SKILL-EDITOR-VIEW |
| 作成日    | 2026-03-02                    |

## ワークフロー改善点

### 1. CSS変数の仕様書レベルでの検証

Phase 5（実装）で使用するCSS変数名が、tokens.css に定義済みかをPhase 3（設計レビュー）時点で検証するチェックリスト項目を追加すべき。本タスクでは `--accent-color` と `--border-color` が未定義のまま実装され、Phase 11で初めて検出された。

**提案**: Phase 3 設計レビューに「CSS変数の定義済みチェック」項目を追加。

### 2. テストと実装のインターフェース事前合意

Phase 4（テスト作成）と Phase 5（実装）で異なるエージェントが作業する場合、Props名やコールバック名の不一致が発生しやすい。本タスクでは `onSave/onDiscard` vs `onSaveAndContinue/onDiscardAndContinue` の不一致が発生した。

**提案**: Phase 4 完了時にインターフェース定義ファイル（types.ts）を確定し、Phase 5 はそれを参照する運用にする。

### 3. コンテキスト継続時の成果物追跡

3セッションにわたる長期タスクでは、前セッションの subagent が作成したファイル（expanded-tests.test.tsx）が古いインターフェースで残っている問題が発生した。

**提案**: セッション継続時に `git diff --stat` で前セッションからの差分を確認する手順を追加。

## 技術的教訓

### 1. P31パターンの予防的適用

`useFileTree` の useEffect 依存配列を `[refreshTree]` から `[skillName]` に変更。Phase 10 レビューで MINOR として検出された。新規 Hook 作成時は、useEffect の依存配列にuseCallbackの戻り値を含めないように注意。

### 2. 非制御コンポーネントパターンの有効性

FileTreePanel の `expandedDirs` を親から制御する設計と、コンポーネント内部で管理する設計の両方が検討された。内部管理（非制御）パターンにすることで、親コンポーネントのPropsが簡潔になり、テストも単純化された。

### 3. happy-dom環境での fireEvent 必須

P39（happy-dom環境でのuserEvent非互換）が再確認された。全テストで `fireEvent` を使用し、非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包むパターンを徹底。

## スキル改善提案

### task-specification-creator への提案

1. **Phase 4-5 インターフェース合意メカニズム**: Phase 4 完了成果物に「確定インターフェース定義」を必須化
2. **CSS変数チェックリスト**: Phase 3 レビューに「使用CSS変数の tokens.css 定義済み確認」を追加

### aiworkflow-requirements への提案

1. **tokens.css デザイントークン一覧**: 利用可能なCSS変数の一覧を仕様書に追加（現状は実装ファイルを直接参照するしかない）

## 新規Pitfall候補

### P48候補: CSS変数名の未定義使用

- **教訓**: Tailwind arbitrary values で `var(--accent-color)` のような未定義CSS変数を使用しても、ビルドエラーにならない。実行時にスタイルが適用されないだけで、視覚的なバグとして検出が遅れる
- **解決策**: Phase 3 設計レビューで使用するCSS変数を tokens.css と突合確認する
- **関連タスク**: TASK-UI-05A-SKILL-EDITOR-VIEW

### P49候補: マルチセッションでのsubagent成果物陳腐化

- **教訓**: 長期タスクで複数セッションにまたがる場合、前セッションのsubagentが作成したファイルが古いインターフェースのまま残ることがある。expanded-tests.test.tsx が古い API名（selectFile, refresh, isModified等）で19テスト失敗
- **解決策**: セッション継続時に `git diff --stat` + `pnpm vitest run` で前セッションからの差分と全テスト結果を確認
- **関連タスク**: TASK-UI-05A-SKILL-EDITOR-VIEW
