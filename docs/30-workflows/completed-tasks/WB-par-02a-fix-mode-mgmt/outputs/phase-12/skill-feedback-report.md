# Phase 12 成果物: スキルフィードバックレポート

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## 実装・テスト・設計を通じた改善点

### 発見点 1: 二重状態管理（generationMode + hasActivatedLlmMode）の危険性

**発見**: `generationMode` と `hasActivatedLlmMode` の2つのフラグが同期しなければならない状態は、実際に「LLMモードを選択したのにStep 1がスキップされる」バグの根本原因だった。

**再発条件**: モード切替を複数のstateで表現するとき。

**再利用手順**: ウィザードのモード管理は「単一のstate」で表現し、派生的なフラグ（`hasActivated*`）を追加しない。追加が必要な場合はuseMemoで派生させ、stateを増やさない。

### 発見点 2: TDDのRed→Greenサイクルでバグ箇所を特定できる

**発見**: Phase 4でテストを先に書くことで、「Step 0→Step 2への直接遷移」というバグを確実に再現でき、Phase 5の実装でGreenにする経路が明確になった。

**再発条件**: 複雑なstep遷移ロジックを持つウィザードコンポーネントの修正。

**再利用手順**: 修正対象の「壊れた振る舞い」をまずテストで再現（Red）してから、実装を修正する（Green）。

### 発見点 3: esbuildバージョン不整合によるVitest起動失敗

**発見**: `Host version "0.21.5" does not match binary version "0.27.2"` エラーで最初のテスト実行が失敗した。`pnpm install` で解消できた。

**再発条件**: worktreeやクリーンな環境でのテスト初回実行時。

**再利用手順**: テストが起動しない場合は `pnpm install` を最初に実行して依存バイナリを同期する。

### 発見点 4: happy-dom環境ではfireEventが必須（userEvent禁止）

**発見**: テスト環境が `happy-dom` のとき、`@testing-library/user-event` は動作しない。`fireEvent` を使う必要がある。

**再発条件**: このプロジェクトの全Vitestテスト。

**再利用手順**: ボタンクリックは `fireEvent.click(button)` を使う。`await userEvent.click()` は使わない。

## 改善提案（0件）

今回の実装・設計プロセスで追加すべき改善提案はなし。

## 判定: フィードバック4件記録済み
