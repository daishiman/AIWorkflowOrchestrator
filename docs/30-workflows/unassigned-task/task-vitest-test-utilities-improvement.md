# Vitestテスト共通ユーティリティ整備 - タスク指示書

## メタ情報

```yaml
issue_number: 684
```

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | TASK-IMP-VITEST-UTILS-001                              |
| タスク名     | Vitestテスト共通ユーティリティ整備                     |
| 分類         | 改善                                                   |
| 対象機能     | テスト基盤（Vitest）                                   |
| 優先度       | 中                                                     |
| 見積もり規模 | 小規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | TASK-9A-A（SkillFileManager単体テスト）Phase 5-6実装中 |
| 発見日       | 2026-02-03                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9A-A（SkillFileManager単体テスト、137テスト、98%+カバレッジ）の実装中に、VitestでのESModuleモッキングにおいて以下の課題が繰り返し発生した：

1. **ESModuleモッキング制約**: `vi.spyOn(fs, 'readFile')` が `Cannot redefine property: readFile` エラーを発生
2. **エラークラス不一致**: 空入力時のエラークラスが内部実装により変わりうる
3. **一時ディレクトリ管理**: バックアップファイルテストで一時ディレクトリの作成・削除が冗長化

これらの課題は今後の単体テスト実装でも繰り返し発生する可能性が高い。

### 1.2 問題点・課題

| 課題                   | 発生時のエラー                                  | 現在の回避策                             |
| ---------------------- | ----------------------------------------------- | ---------------------------------------- |
| ESModuleモッキング制約 | `Cannot redefine property: readFile`            | 実際のエラー条件（存在しないパス）を使用 |
| エラークラス不一致     | `Expected: SkillNotFoundError, Received: Error` | `.rejects.toThrow()` で汎用アサーション  |
| 一時ディレクトリ管理   | テストごとにmkdtemp/rm-rf処理が重複             | 各テストで個別実装                       |

### 1.3 放置した場合の影響

- 新規テスト実装時に同じ課題で時間を浪費（推定: 1-2時間/タスク）
- 回避策が統一されず、テストコードの一貫性が低下
- 課題解決パターンが属人知識化し、チーム全体に共有されない

---

## 2. 何を達成するか（What）

### 2.1 目的

ESModuleモッキング回避パターンと一時ディレクトリ管理を共通ユーティリティとして整備し、今後のテスト実装を効率化する。

### 2.2 最終ゴール

- テスト共通ユーティリティファイルが作成されている
- ESModuleモッキング回避パターンがドキュメント化されている
- 一時ディレクトリ管理ヘルパーが提供されている
- 既存テストからユーティリティが参照可能

### 2.3 スコープ

#### 含むもの

- `apps/desktop/src/main/test-utils/` ディレクトリ作成
- ESModuleテストパターンガイド（MDファイル）
- 一時ディレクトリ管理ヘルパー関数
- 汎用エラーアサーションヘルパー

#### 含まないもの

- 既存テストのリファクタリング（将来タスク）
- E2Eテスト用ユーティリティ（別タスク）
- 新規モジュールの単体テスト

### 2.4 成果物

| 成果物                       | パス                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| テストユーティリティ         | `apps/desktop/src/main/test-utils/index.ts`                  |
| 一時ディレクトリヘルパー     | `apps/desktop/src/main/test-utils/tempDir.ts`                |
| ESModuleテストパターンガイド | `apps/desktop/src/main/test-utils/ESMODULE_TESTING.md`       |
| ユーティリティテスト         | `apps/desktop/src/main/test-utils/__tests__/tempDir.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9A-A（SkillFileManager実装）が完了していること ✅
- Vitestテスト環境が構築されていること ✅
- `architecture-implementation-patterns.md` のESModuleパターンが記録されていること ✅

### 3.2 依存タスク

| タスクID  | タスク名                   | ステータス |
| --------- | -------------------------- | ---------- |
| TASK-9A-A | SkillFileManager単体テスト | 完了       |

### 3.3 必要な知識

- Vitest API（vi.mock, vi.doMock, vi.spyOn）
- Node.js fs/promises API
- TypeScript

### 3.4 推奨アプローチ

#### 3.4.1 システム仕様書参照（実装前必須）

| 参照資料                     | パス                                                                                        | 内容                              |
| ---------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| アーキテクチャ実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | ESModuleモッキングパターン v1.6.0 |
| 開発ガイドライン             | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | Vitestテスト固有の問題 v1.4.0     |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | TASK-9A-A実績 v1.6.0              |
| テストコンポーネントパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テストパターン集                  |

#### 3.4.2 実装パターン

```typescript
// tempDir.ts - 一時ディレクトリヘルパー
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export interface TempDirContext {
  path: string;
  cleanup: () => Promise<void>;
}

export async function createTempDir(prefix = "test-"): Promise<TempDirContext> {
  const path = await mkdtemp(join(tmpdir(), prefix));
  return {
    path,
    cleanup: async () => {
      await rm(path, { recursive: true, force: true });
    },
  };
}

// 使用例（テスト内）
describe("FileManager", () => {
  let tempDir: TempDirContext;

  beforeEach(async () => {
    tempDir = await createTempDir("skill-test-");
  });

  afterEach(async () => {
    await tempDir.cleanup();
  });
});
```

---

## 4. 実行手順

### Phase構成

標準13Phase構成（小規模タスク向け簡略版）

### Phase 1: 要件定義

#### 目的

ユーティリティの要件を明確化

#### 手順

1. TASK-9A-Aで遭遇した課題を整理
2. 必要なユーティリティ関数を列挙
3. システム仕様書との整合性を確認

#### 成果物

- `outputs/phase-1/requirements-summary.md`

#### 完了条件

- 必要なユーティリティが明確化されている

### Phase 2-5: 設計・実装

#### 目的

ユーティリティ関数の設計と実装

#### 手順

1. `test-utils/` ディレクトリ構造を設計
2. 一時ディレクトリヘルパーを実装
3. ESModuleテストガイドを作成
4. エクスポート設定

#### 成果物

- `apps/desktop/src/main/test-utils/index.ts`
- `apps/desktop/src/main/test-utils/tempDir.ts`
- `apps/desktop/src/main/test-utils/ESMODULE_TESTING.md`

#### 完了条件

- ユーティリティがエクスポートされている
- TypeScript型エラーがない

### Phase 6-9: テスト・品質保証

#### 目的

ユーティリティのテストと品質確認

#### 手順

1. tempDir.tsのユニットテスト作成
2. 既存テストからの参照テスト
3. カバレッジ確認

#### 成果物

- `apps/desktop/src/main/test-utils/__tests__/tempDir.test.ts`

#### 完了条件

- テストカバレッジ80%以上
- 全テストがパス

### Phase 10-12: レビュー・ドキュメント

#### 目的

最終レビューとドキュメント更新

#### 手順

1. コードレビュー
2. システム仕様書更新（testing-component-patterns.md）
3. 実装ガイド作成

#### 成果物

- `outputs/phase-12/implementation-guide.md`

#### 完了条件

- システム仕様書が更新されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `createTempDir()` が一時ディレクトリを作成できる
- [ ] `cleanup()` が一時ディレクトリを削除できる
- [ ] ESModuleテストガイドが作成されている
- [ ] index.tsからエクスポートされている

### 品質要件

- [ ] テストカバレッジ80%以上
- [ ] TypeScript型エラーがない
- [ ] ESLint/Prettierエラーがない

### ドキュメント要件

- [ ] ESModuleテストガイドが作成されている
- [ ] testing-component-patterns.mdにユーティリティ参照が追加されている
- [ ] 実装ガイドが作成されている

---

## 6. 検証方法

### テストケース

| TC-ID               | テスト内容           | 期待結果                     |
| ------------------- | -------------------- | ---------------------------- |
| TC-VITEST-UTILS-001 | createTempDir()      | 一時ディレクトリが作成される |
| TC-VITEST-UTILS-002 | cleanup()            | 一時ディレクトリが削除される |
| TC-VITEST-UTILS-003 | 既存テストからの参照 | インポートエラーがない       |

### 検証手順

1. ユニットテスト実行
   ```bash
   pnpm --filter @repo/desktop test test-utils
   ```
2. 型チェック
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                              |
| -------------------- | ------ | -------- | --------------------------------- |
| 既存テストとの競合   | 低     | 低       | 新規ディレクトリに配置            |
| パス解決エラー       | 中     | 低       | tsconfig.jsonのpaths設定確認      |
| 一時ディレクトリ残存 | 低     | 中       | cleanup()のエラーハンドリング強化 |

---

## 8. 参照情報

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                                        | 内容                         |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| アーキテクチャ実装パターン   | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | ESModuleモッキングパターン   |
| 開発ガイドライン             | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`               | Vitestトラブルシューティング |
| テストコンポーネントパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`           | テストパターン集             |
| 品質要件                     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | TASK-9A-A実績                |

### 関連ドキュメント

- TASK-9A-A実装ガイド: `outputs/phase-12/implementation-guide.md`
- ドキュメント更新履歴: `outputs/phase-12/documentation-changelog.md`

### 参考資料

- Vitest Mocking: https://vitest.dev/guide/mocking.html
- Node.js fs/promises: https://nodejs.org/api/fs.html#promises-api

---

## 9. 備考

### TASK-9A-Aで遭遇した課題（原文記録）

```
課題1: ESModuleモッキング制約
- エラー: Cannot redefine property: readFile
- 原因: ESModuleエクスポートは読み取り専用プロパティ
- 解決: vi.spyOn()を使わず、実際のエラー条件（存在しないパス等）を使用

課題2: 空入力エラークラス不一致
- エラー: Expected: SkillNotFoundError, Received: Error
- 原因: 空文字列入力時のエラークラスが内部実装により変化
- 解決: .rejects.toThrow() で汎用アサーション

課題3: バックアップファイルテスト
- 問題: 一時ディレクトリの作成・削除コードが重複
- 解決: createTempDir() ヘルパー関数を作成（本タスクで共通化）
```

### 関連タスク

| タスクID  | 関係性                      |
| --------- | --------------------------- |
| TASK-9A-A | 発見元（SkillFileManager）  |
| TASK-9A-B | 関連（IPC統合テストで使用） |

### 補足事項

- 本タスクで作成するユーティリティは、将来のMain Processテストで再利用可能
- Renderer Process用ユーティリティは別タスクで対応
- 既存テストのリファクタリングは優先度低として別タスク化を推奨
