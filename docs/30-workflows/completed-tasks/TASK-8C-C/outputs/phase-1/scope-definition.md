# Phase 1: スコープ定義

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| タスクID | TASK-8C-C                          |
| 機能名   | E2Eテスト - インポート・実行フロー |
| 作成日   | 2026-02-02                         |

## スコープ内

### 実装対象

| カテゴリ             | 対象                           |
| -------------------- | ------------------------------ |
| テストファイル       | `skillImportExecution.e2e.ts`  |
| テストケース数       | 7件（基本6件 + 再スキャン1件） |
| テストフレームワーク | Vitest + Playwright            |
| テスト対象アプリ     | Electronデスクトップアプリ     |

### テスト対象フロー

| フロー         | テストケース数 | 内容                       |
| -------------- | -------------- | -------------------------- |
| Import Flow    | 3件            | ダイアログ表示・詳細・実行 |
| Execution Flow | 3件            | ストリーミング・停止・中止 |
| Rescan Flow    | 1件            | 再スキャン実行             |

### 検証対象コンポーネント

| コンポーネント     | ファイル                 | 検証内容             |
| ------------------ | ------------------------ | -------------------- |
| SkillSelector      | `SkillSelector.tsx`      | スキル選択UI         |
| SkillImportDialog  | `SkillImportDialog.tsx`  | インポートダイアログ |
| SkillStreamingView | `SkillStreamingView.tsx` | 実行中ビュー         |
| ChatInput          | `ChatInput.tsx`          | プロンプト入力       |

### 使用フィクスチャ

| フィクスチャ  | パス                                           | 用途           |
| ------------- | ---------------------------------------------- | -------------- |
| test-skill    | `__tests__/__fixtures__/skills/test-skill/`    | 実行テスト用   |
| another-skill | `__tests__/__fixtures__/skills/another-skill/` | 複数スキル確認 |
| invalid-skill | `__tests__/__fixtures__/skills/invalid-skill/` | 無効スキル除外 |

## スコープ外

| カテゴリ         | 除外項目                           | 理由                |
| ---------------- | ---------------------------------- | ------------------- |
| ユニットテスト   | 個別コンポーネントのユニットテスト | 他タスクで実装済み  |
| IPCテスト        | IPC通信の詳細テスト                | TASK-8C-Aで実装     |
| スキャナーテスト | SkillScannerの詳細テスト           | TASK-8C-Bで実装     |
| フィクスチャ作成 | テストフィクスチャの作成           | TASK-8C-Eで実装済み |
| UI実装           | 新規UIコンポーネントの実装         | TASK-7Dで実装済み   |
| エラーUI         | エラー時の詳細なUI検証             | 正常系フロー優先    |

## 技術的制約

| 制約         | 内容                                  |
| ------------ | ------------------------------------- |
| Node.js環境  | Electron Main Processでの実行         |
| ブラウザAPI  | Playwright経由でのElectron操作        |
| 非同期処理   | waitFor/expect.toBeVisibleでの待機    |
| フィクスチャ | TEST_SKILLS_DIR環境変数での指定       |
| テスト分離   | beforeEachでのresetForTesting呼び出し |

## 接続ポイント

### IPC通信

| チャンネル    | 用途             | 検証方法               |
| ------------- | ---------------- | ---------------------- |
| skill:import  | スキルインポート | page.evaluate経由      |
| skill:execute | スキル実行       | UI操作経由             |
| skill:abort   | 実行中止         | 停止ボタンクリック経由 |
| skill:rescan  | 再スキャン       | 再スキャンボタン経由   |

### UI-State連携

| 状態            | 監視対象             | 検証方法           |
| --------------- | -------------------- | ------------------ |
| importedSkills  | インポート済みリスト | セレクタで表示確認 |
| isExecuting     | 実行中フラグ         | 停止ボタン表示確認 |
| executionStatus | 実行ステータス       | キャンセル表示確認 |

## 成果物サマリー

| 成果物            | パス                                                     |
| ----------------- | -------------------------------------------------------- |
| E2Eテストファイル | `apps/desktop/src/__tests__/skillImportExecution.e2e.ts` |
| 依存フィクスチャ  | `apps/desktop/src/__tests__/__fixtures__/skills/`        |
