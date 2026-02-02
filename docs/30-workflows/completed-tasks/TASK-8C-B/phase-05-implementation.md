# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目     | 値                           |
| -------- | ---------------------------- |
| Phase    | 5                            |
| タスクID | TASK-8C-B                    |
| タスク名 | E2Eテスト - スキル選択フロー |
| 作成日   | 2026-02-02                   |

## 目的

Phase 4で作成したE2Eテストを通過させるため、必要な環境設定とフィクスチャを整備する。

## 実行タスク

- 環境設定: E2Eテスト実行環境の設定
- フィクスチャ整備: TASK-8C-Eで作成されたテストフィクスチャとの連携
- 型定義: window.electronAPI の型定義確認

## 参照資料

| 資料名                | パス                                                | 説明             |
| --------------------- | --------------------------------------------------- | ---------------- |
| テストファイル        | `apps/desktop/src/__tests__/skillSelection.e2e.ts`  | Phase 4成果物    |
| TASK-8C-Eフィクスチャ | `apps/desktop/src/__tests__/__fixtures__/skills/`   | 依存タスク成果物 |
| Electron IPC仕様      | `aiworkflow-requirements: security-electron-ipc.md` | IPC仕様          |

## 実行手順

### 1. テストフィクスチャ連携確認

**TASK-8C-Eで作成されるフィクスチャ構造**:

```
apps/desktop/src/__tests__/__fixtures__/skills/
└── test-skill/
    └── SKILL.md
```

**確認項目**:

- [ ] `TEST_SKILLS_DIR` 環境変数でフィクスチャディレクトリを指定
- [ ] test-skillフィクスチャが存在する
- [ ] フィクスチャがスキルスキャン時に検出される

### 2. Electron IPC連携

**resetForTesting API の確認**:

```typescript
// preload.ts で公開されるAPI
interface SkillAPI {
  resetForTesting?: () => Promise<void>;
  // その他のAPI
}

// window.electronAPI.skill で利用可能
```

**必要な実装確認**:

- [ ] `window.electronAPI.skill.resetForTesting` が実装されている
- [ ] テスト用の状態リセット処理が動作する

### 3. Vitest + Playwright設定

**vitest.config.ts での E2E設定確認**:

```typescript
// E2E テスト用の設定
{
  test: {
    include: ['**/*.e2e.ts'],
    testTimeout: 30000, // E2Eは長めに設定
  },
}
```

## 統合テスト連携【必須】

| 実装項目     | 内容                              |
| ------------ | --------------------------------- |
| フィクスチャ | TASK-8C-E成果物との連携確認       |
| IPC API      | resetForTesting実装確認           |
| ビルド       | dist/main/index.js が存在すること |

## アーキテクチャ層別実装

| 層           | 実装観点                 | 実装ファイル配置                           |
| ------------ | ------------------------ | ------------------------------------------ |
| テスト環境   | Vitest + Playwright 設定 | `apps/desktop/vitest.config.ts`            |
| フィクスチャ | テスト用スキルデータ     | `apps/desktop/src/__tests__/__fixtures__/` |
| Preload      | resetForTesting API公開  | `apps/desktop/src/preload/index.ts`        |

## 成果物

| 成果物         | パス                                   | 説明                 |
| -------------- | -------------------------------------- | -------------------- |
| 環境設定確認書 | `outputs/phase-5/environment-setup.md` | 環境設定の確認結果   |
| 連携確認書     | `outputs/phase-5/integration-check.md` | フィクスチャ連携確認 |

## 完了条件

- [ ] テストフィクスチャとの連携が確認されている
- [ ] Electron IPCのresetForTesting APIが動作する
- [ ] E2Eテストが実行可能な環境が整っている
- [ ] すべてのテストが成功状態（Green）
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# ビルド確認
pnpm --filter @repo/desktop build

# テスト実行
pnpm --filter @repo/desktop test:e2e

# 確認項目
# - [ ] 6件のテストが成功することを確認（Green状態）
```

## 次のPhase

Phase 6: テスト拡充
