# 手動テスト実装ガイド - 履歴/ログ表示UI

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| タスクID | task-req-history-manual-test-001 |
| タスク名 | history-manual-testing           |
| 作成日   | 2026-01-17                       |
| Phase    | 12                               |

---

# Part 1: 概念的説明（初学者・非技術者向け）

## 1. 手動テストの目的と重要性

### なぜ手動テストが必要か

自動テストは高速で繰り返し実行できる強力なツールですが、以下の観点では人間の判断が必要です：

1. **視覚的な確認**: レイアウト崩れ、色のコントラスト、アニメーションの滑らかさ
2. **ユーザビリティ**: 直感的に操作できるか、ユーザーが迷わないか
3. **実環境特有の問題**: メモリ使用量、CPU負荷、他アプリとの競合
4. **アクセシビリティ**: スクリーンリーダーでの読み上げ体験

### 自動テストだけでは不十分な理由

| 観点         | 自動テスト                 | 手動テスト                 |
| ------------ | -------------------------- | -------------------------- |
| 実行速度     | 高速（数秒〜数分）         | 低速（数十分〜数時間）     |
| 再現性       | 100%                       | テスターの経験に依存       |
| 主観的評価   | 不可能                     | 可能                       |
| エッジケース | 定義済みのケースのみ       | 探索的に発見可能           |
| コスト       | 初期コスト高、運用コスト低 | 初期コスト低、運用コスト高 |

## 2. テスト対象機能の概要

### 履歴表示機能とは

履歴表示機能は、ユーザーがファイル変換を行った記録を一覧・詳細表示し、必要に応じて過去のバージョンに戻す（復元する）機能です。

```
┌─────────────────────────────────────────────────────────────┐
│  履歴表示画面                                                │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────┐  ┌───────────────────────────────┐   │
│  │ バージョン一覧    │  │ 詳細パネル                    │   │
│  │                   │  │                               │   │
│  │ v3 (現在) ◀━━━━  │  │ バージョン: v3                │   │
│  │ v2               │  │ 作成日: 2026-01-15            │   │
│  │ v1               │  │ 変換ログ: 15件                │   │
│  │                   │  │                               │   │
│  │ [もっと見る]     │  │ [このバージョンに復元]        │   │
│  └───────────────────┘  └───────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### ユーザーにとっての価値

1. **安心感**: 変換を失敗しても過去のバージョンに戻せる
2. **トレーサビリティ**: いつ・どのような変換が行われたかを追跡できる
3. **デバッグ支援**: 変換ログを確認することで問題の原因を特定できる

## 3. テストカテゴリの説明

### 機能テスト（正常系）

「正しく動作するか」を確認するテストです。

- **何をテストするか**: ボタンをクリックしたら期待通りの画面が表示されるか
- **例**: 「履歴一覧」ボタンをクリックしたら、履歴一覧が表示される

### エラーハンドリングテスト（異常系）

「問題が起きたときに適切に対応できるか」を確認するテストです。

- **何をテストするか**: ネットワーク障害やデータベースエラー時にユーザーに分かりやすいメッセージが表示されるか
- **例**: サーバーに接続できないとき、「接続できません。再試行してください」と表示される

### アクセシビリティテスト

「誰でも使えるか」を確認するテストです。

- **何をテストするか**: 視覚障害者がスクリーンリーダーで操作できるか、キーボードのみで操作できるか
- **例**: Tabキーだけですべてのボタンにアクセスできる

---

# Part 2: 技術的詳細（開発者・技術者向け）

## 1. テスト対象コンポーネントの詳細

### コンポーネント構成と責務

```
apps/desktop/src/renderer/components/history/
├── VersionHistory.tsx      # バージョン履歴一覧の表示
├── VersionDetail.tsx       # 選択バージョンの詳細表示
├── ConversionLogs.tsx      # 変換ログの一覧・フィルタ表示
├── RestoreDialog.tsx       # バージョン復元の確認ダイアログ
├── types.ts                # 型定義
└── __tests__/              # テストファイル
```

### カスタムフックの役割

| フック            | 責務                     | 状態管理                           |
| ----------------- | ------------------------ | ---------------------------------- |
| useVersionHistory | バージョン履歴の取得     | history, isLoading, error, hasMore |
| useVersionDetail  | バージョン詳細の取得     | version, logs, isLoading, error    |
| useConversionLogs | 変換ログの取得・フィルタ | logs, isLoading, error, hasMore    |
| useRestore        | バージョン復元処理       | isLoading, error, isSuccess        |

### IPCチャンネルの設計

```
Renderer Process                 Main Process
─────────────────────────────────────────────────────────

  VersionHistory                 HistoryService
       │                              │
       │ history:getFileHistory       │
       │────────────────────────────►│
       │                              │ SQLite Query
       │◄────────────────────────────│
       │                              │
  VersionDetail                       │
       │ history:getVersionDetail     │
       │────────────────────────────►│
       │◄────────────────────────────│
       │                              │
       │ history:restoreVersion       │
       │────────────────────────────►│
       │◄────────────────────────────│
```

## 2. テスト実行手順の詳細

### 環境準備コマンド

```bash
# 1. 依存関係のインストール
pnpm install

# 2. 共有パッケージのビルド
pnpm --filter @repo/shared build

# 3. デスクトップアプリの起動
pnpm --filter @repo/desktop dev
```

### 自動テストの実行方法

```bash
# history関連テストのみ実行
pnpm --filter @repo/desktop test -- --run --reporter=verbose \
  'src/main/ipc/__tests__/historyHandlers.test.ts' \
  'src/main/services/__tests__/HistoryService.integration.test.ts' \
  'src/preload/__tests__/historyAPI.test.ts' \
  'src/renderer/components/history/__tests__/*.test.tsx' \
  'src/renderer/hooks/__tests__/useVersionHistory.test.ts' \
  'src/renderer/pages/__tests__/HistoryPage.test.tsx'
```

### テストケースの実行方法

| テストケース          | 操作手順                                        | 確認ポイント               |
| --------------------- | ----------------------------------------------- | -------------------------- |
| TC-001 履歴一覧表示   | 1. アプリ起動 → 2. 履歴ページに遷移             | 履歴一覧が表示される       |
| TC-004 バージョン選択 | 1. 履歴一覧表示 → 2. アイテムをクリック         | 詳細パネルが表示される     |
| TC-009 復元ダイアログ | 1. 詳細パネル表示 → 2. 「復元」ボタンをクリック | 確認ダイアログが表示される |
| TC-201 キーボード操作 | 1. Tab キーで移動 → 2. Enter で選択             | すべての機能にアクセス可能 |

### 結果の記録方法

テスト結果は以下の形式で `outputs/phase-11/manual-test-result.md` に記録します：

```markdown
| TC-ID  | 機能         | 期待結果             | 結果 | 備考 |
| ------ | ------------ | -------------------- | ---- | ---- |
| TC-001 | 履歴一覧表示 | 履歴一覧が表示される | PASS |      |
```

## 3. トラブルシューティング

### よくある問題と解決方法

#### 問題1: アプリが起動しない

```bash
# 症状
Error: Cannot find module '@repo/shared'

# 解決方法
pnpm --filter @repo/shared build
```

#### 問題2: 履歴データが表示されない

```bash
# 症状
履歴一覧が空状態で表示される

# 確認ポイント
1. ファイル変換を少なくとも1回実行しているか確認
2. DevToolsのConsoleでエラーがないか確認
3. SQLiteデータベースファイルが存在するか確認
```

#### 問題3: IPCエラーが発生する

```bash
# 症状
Error: No handler registered for 'history:getFileHistory'

# 解決方法
1. メインプロセスが正常に起動しているか確認
2. preload.tsでhistoryAPIがexportされているか確認
```

### デバッグ手法

#### 1. DevToolsでのデバッグ

```bash
# DevToolsを開く（Mac）
Cmd + Option + I

# Consoleタブでhistory APIの確認
window.historyAPI
```

#### 2. IPCメッセージのデバッグ

```typescript
// メインプロセスでIPCメッセージをログ出力
ipcMain.handle("history:getFileHistory", async (event, fileId) => {
  console.log("[IPC] history:getFileHistory called with:", fileId);
  // ...
});
```

#### 3. Reactコンポーネントのデバッグ

```typescript
// React DevTools で状態を確認
// または console.log でデバッグ
const { history, isLoading, error } = useVersionHistory(fileId);
console.log("History state:", { history, isLoading, error });
```

---

## 4. 補足資料

### 関連ドキュメント

| ドキュメント        | パス                                                                       |
| ------------------- | -------------------------------------------------------------------------- |
| 履歴/ログ表示UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` |
| アクセシビリティ    | `.claude/skills/aiworkflow-requirements/references/ui-ux-advanced.md`      |

### テストファイル一覧

| ファイル                             | テスト数 | カバー範囲             |
| ------------------------------------ | -------- | ---------------------- |
| `historyHandlers.test.ts`            | 22       | IPC通信                |
| `HistoryService.integration.test.ts` | 31       | DB統合                 |
| `historyAPI.test.ts`                 | 28       | Preload API            |
| `VersionHistory.test.tsx`            | 22       | 履歴一覧コンポーネント |
| `VersionDetail.test.tsx`             | 20       | 詳細表示コンポーネント |
| `ConversionLogs.test.tsx`            | 19       | ログ表示コンポーネント |
| `RestoreDialog.test.tsx`             | 12       | 復元ダイアログ         |
| `useVersionHistory.test.ts`          | 10       | 履歴取得フック         |
| `useVersionDetail.test.ts`           | 8        | 詳細取得フック         |
| `HistoryPage.test.tsx`               | 18       | ページ統合             |

---

## Phase 12 実行記録

### 実行タスク

- 実装ガイド作成（Part 1: 概念的説明）: **完了**
- 実装ガイド作成（Part 2: 技術的詳細）: **完了**

### 発見事項

- 良かった点:
  - テスト実行コマンドが明確で再現性が高い
  - IPCチャンネル設計がシンプルで理解しやすい

- 問題点:
  - 特になし

- 改善提案:
  - 特になし
