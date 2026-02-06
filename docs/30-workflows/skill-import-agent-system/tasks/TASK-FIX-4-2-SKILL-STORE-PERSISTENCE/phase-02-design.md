# Phase 2: 設計 - インポートスキルの永続化消失バグ修正

## メタ情報

| 項目   | 内容                                 |
| ------ | ------------------------------------ |
| Phase  | 2 - 設計                             |
| 機能名 | TASK-FIX-4-2-SKILL-STORE-PERSISTENCE |
| 作成日 | 2026-02-07                           |
| 依存   | Phase 1 要件定義                     |

---

## 1. 目的

Phase 1で特定された5つの潜在的問題に対する技術的解決策を設計し、実装方針を確定する。

---

## 2. 原因分析

### 2.1 主要原因の推定

調査結果から、以下の原因が考えられる：

| 順位 | 原因仮説                                     | 確信度 | 根拠                                                                |
| ---- | -------------------------------------------- | ------ | ------------------------------------------------------------------- |
| 1    | スキャン結果とインポートIDの照合ロジック不備 | 高     | `getImportedSkills()`が存在しないスキルIDをフィルタリングする可能性 |
| 2    | electron-storeの初期化タイミング問題         | 中     | `app.whenReady()`前にストアアクセスしている可能性                   |
| 3    | ストアパスの不一致（設計 vs 実装）           | 中     | 設計書と実装でパスが異なる                                          |
| 4    | 型キャストによるデータ破損の見逃し           | 低     | `as string[]`で検証なしにキャスト                                   |

### 2.2 データフロー分析

```
[アプリ起動]
    │
    ▼
[registerAllIpcHandlers(mainWindow)]
    │
    ├─▶ new Store<SkillStoreSchema>({ name: "skills" })
    │       └─▶ electron-store がストアファイルを読み込み
    │
    ├─▶ new SkillImportManager(skillStore)
    │       └─▶ store.get("importedSkillIds", []) as string[]
    │           └─▶ importedIds = new Set(stored)
    │
    └─▶ new SkillService(skillScanner, skillParser, skillImportManager)
            │
            ▼
[skill:getImported IPC呼び出し]
    │
    ▼
[skillService.getImportedSkills()]
    │
    ▼
[問題発生箇所: ここでスキャン結果とマージ？]
    │
    ▼
[Rendererに返却]
```

### 2.3 SkillService.getImportedSkills() の確認が必要

現在の`skillHandlers.ts`は`skillService.getImportedSkills()`を呼び出しているが、この実装が見つかっていない。この関数内でスキャン結果とインポートIDの照合が行われている可能性が高い。

---

## 3. 解決策設計

### 3.1 P1: スキャンキャッシュとインポートIDの不整合 - 解決策

#### 方針

インポートIDの存在確認と、不足スキル情報の補完を分離する。

#### 設計

```typescript
// SkillService.getImportedSkills() の改善設計
async getImportedSkills(): Promise<ImportedSkillInfo[]> {
  const importedIds = this.importManager.getImportedSkillIds();
  const scannedSkills = await this.scanner.getCachedSkills();

  const result: ImportedSkillInfo[] = [];
  const orphanedIds: string[] = [];

  for (const id of importedIds) {
    const skill = scannedSkills.find(s => s.id === id);
    if (skill) {
      result.push({ ...skill, imported: true });
    } else {
      // スキャン結果に存在しないIDは「孤立ID」として記録
      orphanedIds.push(id);
    }
  }

  // 孤立IDがある場合はログ出力（削除はしない - ユーザー操作に任せる）
  if (orphanedIds.length > 0) {
    this.logger.warn('[SkillService] Orphaned import IDs detected:', orphanedIds);
  }

  return result;
}
```

#### 代替案

孤立IDを自動削除するオプションも検討したが、以下の理由で採用しない：

- スキルディレクトリが一時的に読み込めない場合にデータロスが発生する
- ユーザーの意図しない削除を防ぐ

### 3.2 P2: 並列アクセスでのキャッシュ競合 - 解決策

#### 方針

シンプルなミューテックス（async-mutex）を導入し、persist操作を排他制御する。

#### 設計

```typescript
import { Mutex } from "async-mutex";

export class SkillImportManager {
  private importedIds: Set<string>;
  private store: SkillStore;
  private persistMutex = new Mutex();

  async importSkills(skillIds: string[]): Promise<ImportResult> {
    return this.persistMutex.runExclusive(async () => {
      // ... 既存のインポートロジック
      await this.persistAsync();
      return result;
    });
  }

  async removeSkill(skillId: string): Promise<RemoveResult> {
    return this.persistMutex.runExclusive(async () => {
      // ... 既存の削除ロジック
      await this.persistAsync();
      return result;
    });
  }

  private async persistAsync(): Promise<void> {
    const data = Array.from(this.importedIds);
    this.store.set(STORE_KEY, data);
  }
}
```

#### 依存関係

- `async-mutex` パッケージの追加が必要
- 代替として `p-queue` も検討可能

### 3.3 P3: store初期化での予期しない型返却 - 解決策

#### 方針

Zodによるランタイム型検証を追加する。

#### 設計

```typescript
import { z } from "zod";

const ImportedSkillIdsSchema = z.array(z.string());

export class SkillImportManager {
  constructor(store: SkillStore) {
    this.store = store;

    try {
      const rawData = this.store.get(STORE_KEY, []);
      const parseResult = ImportedSkillIdsSchema.safeParse(rawData);

      if (parseResult.success) {
        this.importedIds = new Set(parseResult.data);
        this.logger.info(
          "[SkillImportManager] Loaded:",
          parseResult.data.length,
          "items",
        );
      } else {
        this.logger.error(
          "[SkillImportManager] Invalid data format:",
          parseResult.error,
        );
        this.importedIds = new Set();
        // 破損データを修復（空配列で上書き）
        this.persist();
      }
    } catch (error) {
      this.logger.error(
        "[SkillImportManager] Failed to load from store:",
        error,
      );
      this.importedIds = new Set();
    }
  }
}
```

### 3.4 P4: DEBUGログ形式の問題 - 解決策

#### 方針

専用のLoggerを導入し、環境に応じたログレベル制御を行う。

#### 設計

```typescript
// infrastructure/logger.ts
export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export function createLogger(prefix: string): Logger {
  const isDebug =
    process.env.NODE_ENV === "development" || process.env.DEBUG === "true";

  return {
    debug: (msg, ...args) => {
      if (isDebug) console.log(`[${prefix}][DEBUG]`, msg, ...args);
    },
    info: (msg, ...args) => console.log(`[${prefix}][INFO]`, msg, ...args),
    warn: (msg, ...args) => console.warn(`[${prefix}][WARN]`, msg, ...args),
    error: (msg, ...args) => console.error(`[${prefix}][ERROR]`, msg, ...args),
  };
}
```

#### 適用箇所

- `skillHandlers.ts`: 既存のDEBUGログをLogger.debug()に置換
- `SkillImportManager.ts`: 既存のconsole.logをLoggerに置換

### 3.5 P5: エラーレスポンスの一貫性問題 - 解決策

#### 方針

すべてのIPCハンドラーで`IPCResult<T>`形式を使用する。

#### 設計

```typescript
// shared/types/ipc.ts (既存の型を活用)
export interface IPCResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// skillHandlers.ts での統一
ipcMain.handle(IPC_CHANNELS.SKILL_IMPORT, async (event, args) => {
  // ... validation ...
  try {
    const result = await skillService.importSkills(args.skillIds);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "SKILL_IMPORT_ERROR",
        message:
          error instanceof Error
            ? error.message
            : "スキルインポートに失敗しました",
      },
    };
  }
});
```

---

## 4. 修正対象ファイル一覧

| ファイルパス                                                 | 修正内容                                   | 優先度 |
| ------------------------------------------------------------ | ------------------------------------------ | ------ |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                 | DEBUGログ削除、Logger導入、エラー形式統一  | 高     |
| `apps/desktop/src/main/services/skill/SkillImportManager.ts` | 型検証追加、ミューテックス追加、Logger導入 | 高     |
| `apps/desktop/src/main/services/skill/SkillService.ts`       | getImportedSkills()の孤立ID処理追加        | 高     |
| `apps/desktop/src/main/ipc/index.ts`                         | ストア初期化の確認（必要に応じてパス修正） | 中     |
| `apps/desktop/src/main/infrastructure/logger.ts`             | 新規作成 - Logger実装                      | 中     |
| `packages/shared/src/types/ipc.ts`                           | IPCResult型の確認/追加                     | 低     |

---

## 5. テスト戦略

### 5.1 ユニットテスト

| テスト対象         | テストケース                                     |
| ------------------ | ------------------------------------------------ |
| SkillImportManager | 正常なデータロード                               |
| SkillImportManager | 空データからの初期化                             |
| SkillImportManager | 不正な型データからの初期化（フォールバック検証） |
| SkillImportManager | インポート後のpersist検証                        |
| SkillImportManager | 削除後のpersist検証                              |
| SkillImportManager | 並列インポートの整合性                           |
| SkillService       | 孤立IDの検出とログ出力                           |

### 5.2 統合テスト

| テストシナリオ                     | 検証内容                             |
| ---------------------------------- | ------------------------------------ |
| アプリ起動→インポート→終了→再起動  | インポートしたスキルが保持されている |
| スキルファイル削除後の起動         | 孤立IDがあってもクラッシュしない     |
| 複数ウィンドウからの同時インポート | データ競合が発生しない               |

### 5.3 テストファイル

| ファイル                                                                    | 対象                     |
| --------------------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/main/services/skill/__tests__/SkillImportManager.test.ts` | SkillImportManagerの単体 |
| `apps/desktop/src/main/services/skill/__tests__/SkillService.test.ts`       | SkillServiceの単体       |
| `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                 | IPCハンドラーの統合      |

---

## 6. 依存パッケージ

| パッケージ    | 用途             | 追加先           |
| ------------- | ---------------- | ---------------- |
| `async-mutex` | 並列アクセス制御 | `apps/desktop`   |
| `zod`         | ランタイム型検証 | 既存（確認のみ） |

---

## 7. 実行タスク（Phase 2）

| No  | タスク                                 | 成果物           |
| --- | -------------------------------------- | ---------------- |
| 1   | SkillService.getImportedSkills()の調査 | コード調査結果   |
| 2   | 各解決策の詳細設計                     | 本ドキュメント   |
| 3   | 修正対象ファイルの特定                 | 修正ファイル一覧 |
| 4   | テスト戦略の策定                       | テスト計画       |
| 5   | 依存パッケージの確認                   | 依存リスト       |

---

## 8. 参照資料

| 資料                   | パス                                                                                                              | 説明                         |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義       | `docs/30-workflows/skill-import-agent-system/tasks/TASK-FIX-4-2-SKILL-STORE-PERSISTENCE/phase-01-requirements.md` | -                            |
| エラーハンドリング規約 | `.claude/rules/02-code-quality.md`                                                                                | -                            |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                                              | -                            |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                             | リトライ戦略、フォールバック |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                       | Main Processパターン         |
| セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-principles.md`                                        | エラーレスポンス設計         |

---

## 9. リスク分析

| リスク                            | 影響度 | 発生確率 | 対策                         |
| --------------------------------- | ------ | -------- | ---------------------------- |
| async-mutex導入によるデッドロック | 高     | 低       | タイムアウト付きロックの検討 |
| 既存テストへの影響                | 中     | 中       | 段階的な修正とテスト実行     |
| ストアマイグレーションの必要性    | 中     | 低       | 既存データの互換性確認       |

---

## 10. 成果物

| 成果物 | パス                                                                                                        |
| ------ | ----------------------------------------------------------------------------------------------------------- |
| 設計書 | `docs/30-workflows/skill-import-agent-system/tasks/TASK-FIX-4-2-SKILL-STORE-PERSISTENCE/phase-02-design.md` |

---

## 11. 完了条件

- [ ] 5つの潜在的問題すべてに対する解決策が設計されている
- [ ] 修正対象ファイルが特定されている
- [ ] テスト戦略が策定されている
- [ ] 依存パッケージが確認されている
- [ ] リスクが分析されている

---

## 12. 次のPhase

**Phase 3: 設計レビュー** に進む

- 設計の妥当性検証
- セキュリティ観点のレビュー
- パフォーマンス影響の確認
