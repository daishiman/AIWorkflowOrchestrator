# Phase 2: 設計レポート

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | SKILL-IPC-001 |
| Phase      | 2             |
| 実行日     | 2026-01-16    |
| ステータス | 完了          |

---

## タスク1: 既存パターンの分析

### 既存IPCハンドラー登録パターン

`apps/desktop/src/main/ipc/index.ts` の分析結果:

#### パターン1: 引数なしのハンドラー

```typescript
registerFileHandlers();
registerStoreHandlers();
registerDashboardHandlers();
```

#### パターン2: mainWindowのみを引数に取るハンドラー

```typescript
registerWindowHandlers(mainWindow);
registerDialogHandlers(mainWindow);
```

#### パターン3: mainWindow + サービスを引数に取るハンドラー

```typescript
const historyService = createHistoryServiceWithDI(...);
registerHistoryHandlers(mainWindow, historyService);

const apiKeyStorage = createApiKeyStorage();
registerApiKeyHandlers(mainWindow, apiKeyStorage);
```

### registerSkillHandlersに適用するパターン

`registerSkillHandlers` は **パターン3** に該当:

- `mainWindow: BrowserWindow` - sender検証用
- `skillService: SkillService` - ビジネスロジック

---

## タスク2: 修正設計

### 追加インポート文

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

### SkillServiceのインスタンス化方法

```typescript
// Skill Management handlers
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

### registerSkillHandlers呼び出しの配置場所

`registerAllIpcHandlers` 関数の末尾、`registerAgentExecutionHandlers(mainWindow);` の後に配置:

```typescript
// Register Agent Execution handlers (AGENT-005)
registerAgentExecutionHandlers(mainWindow);

// Register Skill Management handlers (SKILL-IPC-001)
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

---

## タスク3: 統合テスト連携

### 設計の整合性確認

| 項目                     | 状態      | 備考                                      |
| ------------------------ | --------- | ----------------------------------------- |
| 既存登録パターン準拠     | ✅ 準拠   | パターン3（mainWindow + service）         |
| SkillServiceの依存性注入 | ✅ 設計済 | 3つの依存を明示的にインスタンス化         |
| sender検証の適用         | ✅ 実装済 | skillHandlers.ts内でvalidateIpcSender使用 |

---

## Phase 2 実行記録

### 実行タスク

- [x] タスク1: 既存パターンの分析
- [x] タスク2: 修正設計の作成
- [x] タスク3: 依存関係の確認

### 発見事項

- 良かった点: 既存のindex.tsは明確なパターンに従っており、追加が容易
- 問題点: なし
- 改善提案: SkillService生成をファクトリ関数化することでテスト容易性向上が可能（将来検討）

### 次Phaseへの引き継ぎ事項

- 修正は1ファイル（index.ts）のみ
- 追加コード量は約10行程度
- 既存テストへの影響なし（新規ハンドラー追加のみ）
