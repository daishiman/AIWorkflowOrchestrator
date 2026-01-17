# Phase 2: 依存関係マップ

## メタ情報

| 項目       | 内容          |
| ---------- | ------------- |
| タスクID   | SKILL-IPC-001 |
| Phase      | 2             |
| 実行日     | 2026-01-16    |
| ステータス | 完了          |

---

## 依存関係図

```
registerSkillHandlers(mainWindow, skillService)
    │
    ├── mainWindow: BrowserWindow
    │   └── (既存のmainWindowを使用)
    │
    └── skillService: SkillService
        ├── skillScanner: SkillScanner
        │   └── basePath: string
        │       └── path.join(app.getPath("userData"), ".claude", "skills")
        │
        ├── skillParser: SkillParser
        │   └── (依存なし)
        │
        └── skillImportManager: SkillImportManager
            └── store: ElectronStore
                └── new Store({ name: "skills" })
```

---

## 各クラスの依存関係詳細

### SkillScanner

| 依存項目   | 型       | 生成方法                                                  |
| ---------- | -------- | --------------------------------------------------------- |
| `basePath` | `string` | `path.join(app.getPath("userData"), ".claude", "skills")` |

**ファイル**: `apps/desktop/src/main/services/skill/SkillScanner.ts`

### SkillParser

| 依存項目 | 型  | 生成方法 |
| -------- | --- | -------- |
| なし     | -   | 引数なし |

**ファイル**: `apps/desktop/src/main/services/skill/SkillParser.ts`

### SkillImportManager

| 依存項目 | 型              | 生成方法                        |
| -------- | --------------- | ------------------------------- |
| `store`  | `ElectronStore` | `new Store({ name: "skills" })` |

**ファイル**: `apps/desktop/src/main/services/skill/SkillImportManager.ts`

### SkillService

| 依存項目        | 型                   | 生成方法                             |
| --------------- | -------------------- | ------------------------------------ |
| `scanner`       | `SkillScanner`       | `new SkillScanner(skillBasePath)`    |
| `parser`        | `SkillParser`        | `new SkillParser()`                  |
| `importManager` | `SkillImportManager` | `new SkillImportManager(skillStore)` |

**ファイル**: `apps/desktop/src/main/services/skill/SkillService.ts`

---

## 外部依存ライブラリ

| ライブラリ       | 用途                       | 既にインストール済み  |
| ---------------- | -------------------------- | --------------------- |
| `electron`       | app.getPath, BrowserWindow | ✅                    |
| `electron-store` | スキルインポート状態永続化 | ✅                    |
| `path`           | パス操作                   | ✅ (Node.js built-in) |

---

## インポートパス確認

| モジュール              | インポートパス      | 状態    |
| ----------------------- | ------------------- | ------- |
| `registerSkillHandlers` | `./skillHandlers`   | ✅ 存在 |
| `SkillScanner`          | `../services/skill` | ✅ 存在 |
| `SkillParser`           | `../services/skill` | ✅ 存在 |
| `SkillImportManager`    | `../services/skill` | ✅ 存在 |
| `SkillService`          | `../services/skill` | ✅ 存在 |
| `Store`                 | `electron-store`    | ✅ 存在 |
| `app`                   | `electron`          | ✅ 存在 |
| `path`                  | `path`              | ✅ 存在 |

---

## skillBasePath設定

### 推奨パス

```typescript
const skillBasePath = path.join(app.getPath("userData"), ".claude", "skills");
```

### 理由

- `app.getPath("userData")` は各OSで適切なユーザーデータディレクトリを返す
  - macOS: `~/Library/Application Support/AIWorkflowOrchestrator`
  - Windows: `%APPDATA%/AIWorkflowOrchestrator`
  - Linux: `~/.config/AIWorkflowOrchestrator`
- `.claude/skills` はClaude Codeのスキルディレクトリ構造と一致

---

## 完了条件チェックリスト

- [x] 既存のIPCハンドラー登録パターンを分析した
- [x] 追加するインポート文を設計した
- [x] SkillServiceのインスタンス化方法を決定した
- [x] registerSkillHandlers呼び出しの配置場所を決定した
