# Phase 5: 環境設定確認書

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 5                            |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

## 1. テスト環境設定

### 1.1 Vitest設定

| 設定項目       | 値                       | 確認状況 |
| -------------- | ------------------------ | -------- |
| テストランナー | Vitest                   | ✅       |
| environment    | happy-dom                | ✅       |
| include        | `src/**/*.test.{ts,tsx}` | ✅       |
| testTimeout    | 10000 (ユニット)         | ✅       |
| setupFiles     | `./src/test/setup.ts`    | ✅       |

### 1.2 E2Eテスト設定

| 設定項目           | 値                      | 備考                 |
| ------------------ | ----------------------- | -------------------- |
| テストファイル     | `skillSelection.e2e.ts` | 本タスクで作成       |
| タイムアウト       | 60000ms (beforeAll)     | Electron起動時間考慮 |
| 環境変数           | `NODE_ENV=test`         | テストモード         |
| スキルディレクトリ | `TEST_SKILLS_DIR`       | フィクスチャパス     |

### 1.3 Electron起動設定

```typescript
const electronConfig = {
  args: [path.join(__dirname, "../../dist/main/index.js")],
  env: {
    ...process.env,
    NODE_ENV: "test",
    TEST_SKILLS_DIR: path.join(__dirname, "__fixtures__/skills"),
  },
};
```

## 2. フィクスチャ確認

### 2.1 テストスキルフィクスチャ

| フィクスチャ                                                            | 存在 | 内容                |
| ----------------------------------------------------------------------- | ---- | ------------------- |
| `apps/desktop/src/__tests__/__fixtures__/skills/test-skill/SKILL.md`    | ✅   | name: test-skill    |
| `apps/desktop/src/__tests__/__fixtures__/skills/another-skill/SKILL.md` | ✅   | name: another-skill |

### 2.2 test-skill/SKILL.md 内容

```yaml
---
name: test-skill
description: E2Eテスト用のスキル
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
---
```

## 3. IPC API確認

### 3.1 resetForTesting API

| 項目                 | 確認内容                                     | 状況 |
| -------------------- | -------------------------------------------- | ---- |
| API存在              | `window.electronAPI?.skill?.resetForTesting` | ⚠️   |
| 呼び出し可能         | beforeEachで呼び出し                         | ✅   |
| オプショナル呼び出し | `?.()` で安全に呼び出し                      | ✅   |

**注記**: resetForTesting APIは実装されていない可能性があるため、オプショナルチェイニングで安全に呼び出す設計としている。

### 3.2 スキル関連API

| API                          | 用途                     | 確認状況 |
| ---------------------------- | ------------------------ | -------- |
| `skill.getAvailableSkills()` | 利用可能スキル取得       | ✅       |
| `skill.getImportedSkills()`  | インポート済みスキル取得 | ✅       |
| `skill.selectSkill(name)`    | スキル選択               | ✅       |

## 4. ビルド確認

### 4.1 ビルドコマンド

```bash
# デスクトップアプリビルド
pnpm --filter @repo/desktop build

# 確認項目
# - dist/main/index.js が存在すること
# - dist/preload/index.js が存在すること
# - dist/renderer/ が存在すること
```

### 4.2 ビルド成果物

| ファイル                | 存在確認 | 備考             |
| ----------------------- | -------- | ---------------- |
| `dist/main/index.js`    | 要確認   | E2Eテストで参照  |
| `dist/preload/index.js` | 要確認   | IPC API公開      |
| `dist/renderer/`        | 要確認   | Rendererバンドル |

## 5. 環境変数

| 変数名            | 値                    | 用途               |
| ----------------- | --------------------- | ------------------ |
| `NODE_ENV`        | `test`                | テストモード識別   |
| `TEST_SKILLS_DIR` | `__fixtures__/skills` | テスト用スキルパス |

## 6. 依存パッケージ

| パッケージ           | バージョン | 用途             |
| -------------------- | ---------- | ---------------- |
| vitest               | ^3.x       | テストランナー   |
| playwright           | ^1.x       | E2E Electron操作 |
| @vitejs/plugin-react | ^4.x       | React対応        |

## 7. テスト実行コマンド

```bash
# E2Eテスト実行（ビルド後）
pnpm --filter @repo/desktop build && pnpm --filter @repo/desktop test:e2e

# 特定ファイルのみ
pnpm --filter @repo/desktop test skillSelection.e2e.ts
```

## 完了チェック

- [x] テストフィクスチャとの連携が確認されている
- [x] Electron IPC APIの呼び出し設計が完了
- [x] 環境変数設定が定義されている
- [x] ビルド確認手順が明記されている
- [x] テスト実行コマンドが記載されている
