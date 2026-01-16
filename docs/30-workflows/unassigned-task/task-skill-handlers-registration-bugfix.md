# Skill IPCハンドラー登録漏れ修正 - タスク指示書

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| タスクID     | SKILL-IPC-001                   |
| タスク名     | Skill IPCハンドラー登録漏れ修正 |
| 分類         | バグ修正                        |
| 対象機能     | Agent画面 - スキル管理機能      |
| 優先度       | 高                              |
| 見積もり規模 | 小規模                          |
| ステータス   | 未実施                          |
| 発見元       | 手動テスト（開発時確認）        |
| 発見日       | 2026-01-14                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Agent画面でスキル一覧を表示するために `skillAPI.listImported()` が呼び出されるが、
対応するIPCハンドラー `skill:list-imported` がメインプロセスに登録されていないため、
画面が無限ローディング状態になる。

### 1.2 問題点・課題

- `apps/desktop/src/main/ipc/skillHandlers.ts` にハンドラー実装は存在する
- しかし `apps/desktop/src/main/ipc/index.ts` の `registerAllIpcHandlers()` で呼び出されていない
- 結果として以下のエラーが繰り返し発生:

```
Error: No handler registered for 'skill:list-imported'
```

### 1.3 放置した場合の影響

- Agent画面が完全に使用不能（無限ローディング）
- スキル管理機能（一覧、インポート、削除）が全て動作しない
- ユーザー体験の著しい低下

---

## 2. 何を達成するか（What）

### 2.1 目的

`registerSkillHandlers` を `registerAllIpcHandlers` から呼び出し、
スキル管理IPCハンドラーを正しく登録する。

### 2.2 最終ゴール

- Agent画面でスキル一覧が正常に表示される
- スキルのインポート・削除機能が動作する
- エラーログ `No handler registered for 'skill:list-imported'` が出なくなる

### 2.3 スコープ

#### 含むもの

- `registerSkillHandlers` のインポート追加
- `SkillService` とその依存関係のインスタンス化
- `registerSkillHandlers(mainWindow, skillService)` の呼び出し追加

#### 含まないもの

- スキル実行機能の実装（別タスク: handleExecute未実装）
- AgentExecutionViewのIPCリスナー設定（Phase 5-9待ち）

### 2.4 成果物

| 成果物                               | 説明               |
| ------------------------------------ | ------------------ |
| `apps/desktop/src/main/ipc/index.ts` | ハンドラー登録追加 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `skillHandlers.ts` が正しく実装されていること（確認済み）
- `SkillService` とその依存クラスが存在すること（確認済み）

### 3.2 依存タスク

なし

### 3.3 必要な知識

- Electron IPC通信の仕組み
- 依存性注入パターン

### 3.4 推奨アプローチ

1. `index.ts` に必要なインポートを追加
2. `SkillScanner`, `SkillParser`, `SkillImportManager`, `SkillService` をインスタンス化
3. `registerSkillHandlers(mainWindow, skillService)` を呼び出す

---

## 4. 実行手順

### Phase構成

小規模タスクのため、単一Phaseで完了。

### Phase 1: 実装・テスト

#### 目的

IPCハンドラー登録を追加し、Agent画面の動作を確認する。

#### 手順

1. `apps/desktop/src/main/ipc/index.ts` を開く

2. 以下のインポートを追加:

```typescript
import { registerSkillHandlers } from "./skillHandlers";
import {
  SkillScanner,
  SkillParser,
  SkillImportManager,
  SkillService,
} from "../services/skill";
import Store from "electron-store";
import { app } from "electron";
import path from "path";
```

3. `registerAllIpcHandlers` 関数内に以下を追加:

```typescript
// Register Skill Management handlers
const skillBasePath = path.join(app.getPath("userData"), ".claude", "skills");
const skillStore = new Store({ name: "skills" });
const skillScanner = new SkillScanner(skillBasePath);
const skillParser = new SkillParser();
const skillImportManager = new SkillImportManager(skillStore);
const skillService = new SkillService(
  skillScanner,
  skillParser,
  skillImportManager,
);
registerSkillHandlers(mainWindow, skillService);
```

4. `pnpm --filter @repo/desktop dev` でアプリを起動

5. Agent画面を開き、スキル一覧が表示されることを確認

#### 成果物

- 修正された `apps/desktop/src/main/ipc/index.ts`

#### 完了条件

- [ ] Agent画面でスキル一覧が表示される
- [ ] コンソールに `No handler registered for 'skill:list-imported'` エラーが出ない
- [ ] 既存のテストがパスする

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Agent画面でスキル一覧が正常に読み込まれる
- [ ] スキルのインポート機能が動作する
- [ ] スキルの削除機能が動作する
- [ ] スキルの詳細表示が動作する

### 品質要件

- [ ] TypeScript型エラーがない
- [ ] ESLintエラーがない
- [ ] 既存のユニットテストがパスする

### ドキュメント要件

- [ ] 必要に応じてCHANGELOG.mdに記載

---

## 6. 検証方法

### テストケース

| #   | テストケース                                    | 期待結果                                         |
| --- | ----------------------------------------------- | ------------------------------------------------ |
| 1   | アプリ起動後、サイドバーから「Agent」をクリック | スキル一覧が表示される（ローディングが終了する） |
| 2   | 「インポート」ボタンをクリック                  | 利用可能なスキルのダイアログが表示される         |
| 3   | スキルを選択して詳細パネルを表示                | スキルの詳細情報が表示される                     |
| 4   | コンソールログを確認                            | `skill:list-imported` 関連のエラーがない         |

### 検証手順

```bash
# 1. アプリをビルド・起動
pnpm --filter @repo/desktop dev

# 2. Agent画面を開く

# 3. コンソールログを確認
# エラーが出ていないことを確認

# 4. テスト実行
pnpm --filter @repo/desktop test
```

---

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                             |
| --------------------------------- | ------ | -------- | ------------------------------------------------ |
| `SkillScanner` のbasePath設定ミス | 中     | 低       | 既存のスキルディレクトリ構造を確認してパスを設定 |
| `electron-store` の設定競合       | 低     | 低       | 専用のstore名 `skills` を使用                    |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                 | パス                                                    |
| ---------------------------- | ------------------------------------------------------- |
| Skill Management Backend設計 | `docs/30-workflows/agent-003-skill-management-backend/` |

### 関連コード

| ファイル                                               | 役割                                       |
| ------------------------------------------------------ | ------------------------------------------ |
| `apps/desktop/src/main/ipc/skillHandlers.ts`           | IPCハンドラー実装（既存）                  |
| `apps/desktop/src/main/services/skill/SkillService.ts` | スキルサービス（既存）                     |
| `apps/desktop/src/main/ipc/index.ts`                   | ハンドラー登録エントリポイント（修正対象） |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`  | Agent画面UI                                |

---

## 9. 備考

### 発見時のエラーログ

```
Error occurred in handler for 'skill:list-imported': Error: No handler registered for 'skill:list-imported'
    at Session.<anonymous> (node:electron/js2c/browser_init:2:107393)
    at Session.emit (node:events:519:28)
```

### 補足事項

- このタスクはAgent機能の基盤であり、早急に対応が必要
- スキル実行機能（handleExecute）は別タスクとして対応予定
