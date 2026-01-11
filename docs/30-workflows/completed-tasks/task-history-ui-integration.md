# 履歴UIコンポーネント統合 - タスク指示書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | task-req-history-integration-001           |
| タスク名     | 履歴UIコンポーネントのアプリケーション統合 |
| 分類         | 要件                                       |
| 対象機能     | 履歴/ログ表示UI                            |
| 優先度       | 高                                         |
| 見積もり規模 | 中規模（M）                                |
| ステータス   | 未実施                                     |
| 発見元       | Phase 11（手動テスト検証）                 |
| 発見日       | 2026-01-10                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

CONV-05-03で開発した履歴/ログ表示UIコンポーネントは、単体テストで動作が検証されているが、実際のElectronアプリケーションにはまだ統合されていない。コンポーネントは以下の場所に配置されている：

- `apps/desktop/src/renderer/components/history/`
- `apps/desktop/src/renderer/hooks/`

### 1.2 問題点・課題

- コンポーネントが実環境でテストされていない
- ユーザーが履歴/ログ表示機能を利用できない状態
- IPC通信が実際のメインプロセスと連携していない

### 1.3 放置した場合の影響

- 開発した機能（テストカバレッジ94.43%達成）がユーザーに提供されない
- 実環境での問題が発見できない
- CONV-05シリーズ（履歴/ログ管理機能）が完結しない

---

## 2. 何を達成するか（What）

### 2.1 目的

履歴/ログ表示UIコンポーネントをElectronアプリケーションに統合し、ユーザーが利用可能な状態にする。

### 2.2 最終ゴール

- 履歴一覧画面が表示される
- バージョン詳細が確認できる
- 変換ログが表示・フィルタできる
- バージョン復元が実行できる

### 2.3 スコープ

#### 含むもの

- HistoryPage.tsxの作成（ページコンポーネント）
- ルーティング設定
- preloadスクリプトの設定（task-req-history-preload-001）
- IPCハンドラーの登録（task-req-history-ipc-001）
- グローバル型定義（global.d.ts）の追加

#### 含まないもの

- 新機能の追加
- パフォーマンス最適化（仮想スクロール等）
- UIデザインの変更

### 2.4 成果物

| 成果物               | 説明                         | 配置先                              |
| -------------------- | ---------------------------- | ----------------------------------- |
| HistoryPage.tsx      | 履歴表示ページコンポーネント | apps/desktop/src/renderer/pages/    |
| preload.ts更新       | historyAPIの公開             | apps/desktop/src/main/              |
| historyHandlers.ts   | IPCハンドラー                | apps/desktop/src/main/ipc/          |
| global.d.ts更新      | HistoryAPI型定義             | apps/desktop/src/renderer/          |
| ルーティング設定更新 | 履歴ページへのルート         | apps/desktop/src/renderer/App.tsx等 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- CONV-05-01（履歴データ永続化）が完了していること
- CONV-05-02（履歴取得サービス）が完了していること
- CONV-05-03（履歴UIコンポーネント）が完了していること

### 3.2 依存タスク

| タスク     | 説明                 | ステータス |
| ---------- | -------------------- | ---------- |
| CONV-05-01 | 履歴データ永続化     | 完了       |
| CONV-05-02 | 履歴取得サービス     | 完了       |
| CONV-05-03 | 履歴UIコンポーネント | 完了       |

### 3.3 必要な知識・スキル

- Electron IPC通信（contextBridge, ipcMain, ipcRenderer）
- React Router（ルーティング設定）
- TypeScriptのグローバル型定義

### 3.4 推奨アプローチ

1. integration-guide.md の手順に従って統合
2. 段階的に動作確認しながら進める
3. DevToolsでエラーがないことを確認

---

## 4. 実行手順

### Phase構成

本タスクは以下のサブタスクで構成される：

1. preloadスクリプト設定（task-req-history-preload-001）
2. IPCハンドラー登録（task-req-history-ipc-001）
3. HistoryPage.tsx作成とルーティング設定
4. 統合テスト（task-req-history-manual-test-001）

### Phase 1: 要件定義

#### 使用スキル

| スキル名                | パス                                              | 選定理由                                    |
| ----------------------- | ------------------------------------------------- | ------------------------------------------- |
| aiworkflow-requirements | `.claude/skills/aiworkflow-requirements/SKILL.md` | 既存仕様との整合性確認（Trigger: 仕様参照） |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

- **参照**: `.claude/skills/` 配下のスキル一覧, スキルリスト`.claude/skills/skill-list.md`
- **選定方法**: スキルのSKILL.md内「Trigger」キーワードと「Anchors」を参照し、タスクに最も適したスキルを選択

#### 目的

システム仕様との整合性を確認し、統合要件を明確化する。

#### 成果物

- 統合要件ドキュメント

#### 完了条件

- [ ] システム仕様（ui-ux-history-panel.md）を確認済み
- [ ] IPC通信チャンネル名が仕様と一致
- [ ] 型定義が仕様と一致

### Phase 2: 設計

#### 使用スキル

| スキル名             | パス                                           | 選定理由                                          |
| -------------------- | ---------------------------------------------- | ------------------------------------------------- |
| electron-ui-patterns | `.claude/skills/electron-ui-patterns/SKILL.md` | Electron IPC設計パターン（Trigger: preload, IPC） |

#### 目的

統合アーキテクチャを設計する。

#### 成果物

- 統合設計ドキュメント

#### 完了条件

- [ ] preloadスクリプトの設計完了
- [ ] IPCハンドラーの設計完了
- [ ] ルーティング設計完了

### Phase 3〜5: 実装

#### Phase 3: preloadスクリプト設定

**参照タスク**: task-req-history-preload-001

```typescript
// preload.ts への追加内容
contextBridge.exposeInMainWorld("historyAPI", {
  getFileHistory: (fileId: string, options?: PaginationOptions) =>
    ipcRenderer.invoke("history:getFileHistory", fileId, options),
  getVersionDetail: (conversionId: string) =>
    ipcRenderer.invoke("history:getVersionDetail", conversionId),
  getConversionLogs: (conversionId: string, options?: LogFilterOptions) =>
    ipcRenderer.invoke("history:getConversionLogs", conversionId, options),
  restoreVersion: (fileId: string, conversionId: string) =>
    ipcRenderer.invoke("history:restoreVersion", fileId, conversionId),
});
```

#### Phase 4: IPCハンドラー登録

**参照タスク**: task-req-history-ipc-001

```typescript
// historyHandlers.ts
import { ipcMain } from "electron";
import { HistoryService } from "../services/HistoryService";

export function registerHistoryHandlers(historyService: HistoryService): void {
  ipcMain.handle("history:getFileHistory", async (_, fileId, options) => {
    try {
      const result = await historyService.getFileHistory(fileId, options);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error };
    }
  });
  // ... 他のハンドラー
}
```

#### Phase 5: HistoryPage.tsx作成

```typescript
// apps/desktop/src/renderer/pages/HistoryPage.tsx
import { VersionHistory } from "../components/history/VersionHistory";
import { VersionDetail } from "../components/history/VersionDetail";
import { RestoreDialog } from "../components/history/RestoreDialog";
// ... コンポーネント実装
```

### Phase 6〜11: テスト・品質保証

**参照タスク**: task-req-history-manual-test-001

#### 完了条件

- [ ] コンポーネントが正しく表示される
- [ ] IPC通信が正常に動作する
- [ ] エラーハンドリングが機能する
- [ ] DevToolsにエラーがない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 履歴一覧が表示される
- [ ] バージョン詳細が表示される
- [ ] 変換ログが表示される
- [ ] ログレベルフィルタが動作する
- [ ] バージョン復元が実行できる
- [ ] ページネーション（追加読み込み）が動作する

### 品質要件

- [ ] TypeScript型エラーがない
- [ ] ESLintエラーがない
- [ ] DevToolsにコンソールエラーがない
- [ ] 既存テストが全てパスする

### ドキュメント要件

- [ ] 統合手順がドキュメント化されている
- [ ] 型定義が追加されている

---

## 6. 検証方法

### テストケース

| ケース | 操作                         | 期待結果                   |
| ------ | ---------------------------- | -------------------------- |
| TC-01  | 履歴ページに遷移             | 履歴一覧が表示される       |
| TC-02  | バージョンを選択             | 詳細パネルが表示される     |
| TC-03  | ログレベルをフィルタ         | フィルタ結果が表示される   |
| TC-04  | 復元ボタンをクリック         | 確認ダイアログが表示される |
| TC-05  | 復元を実行                   | バージョンが復元される     |
| TC-06  | 追加読み込みボタンをクリック | 追加データが読み込まれる   |

### 検証手順

1. アプリケーションを起動: `pnpm --filter @repo/desktop dev`
2. 履歴画面に遷移
3. 各機能を手動で確認
4. DevToolsでエラーがないことを確認

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                     |
| -------------------- | ------ | -------- | ------------------------ |
| IPC通信エラー        | 高     | 中       | チャンネル名の一致を確認 |
| 型エラー             | 中     | 中       | global.d.tsの追加を確認  |
| HistoryService未実装 | 高     | 低       | CONV-05-02の完了を確認   |
| ルーティング競合     | 低     | 低       | 既存ルート設定を確認     |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                       | 内容                              |
| ------------------- | -------------------------------------------------------------------------- | --------------------------------- |
| 履歴/ログ表示UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` | コンポーネント・型定義・IPC仕様   |
| Electron UIパターン | `.claude/skills/electron-ui-patterns/SKILL.md`                             | IPC通信エラーハンドリングパターン |

### 関連ドキュメント

| ドキュメント       | パス                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| 実装ガイド         | `docs/30-workflows/history-ui-components/outputs/phase-12/implementation-guide.md` |
| 統合ガイド         | `docs/30-workflows/history-ui-components/outputs/phase-12/integration-guide.md`    |
| コンポーネント仕様 | `apps/desktop/src/renderer/components/history/types.ts`                            |

### 参考資料

- [Electron contextBridge](https://www.electronjs.org/docs/latest/api/context-bridge)
- [Electron ipcMain](https://www.electronjs.org/docs/latest/api/ipc-main)

---

## 9. 備考

### 発見経緯

Phase 11（手動テスト検証）において、コンポーネントの単体テストは完了しているが、実際のアプリケーションへの統合が未実施であることが判明。

### 補足事項

- 本タスクは以下のサブタスクに分解されています：
  - task-req-history-preload-001（preload設定）
  - task-req-history-ipc-001（IPCハンドラー）
  - task-req-history-manual-test-001（統合テスト）
- 統合完了後、CONV-05シリーズは完結となります
