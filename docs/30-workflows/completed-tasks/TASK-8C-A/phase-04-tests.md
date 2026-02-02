# Phase 4: テスト作成（TDD Red） - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 4                        |
| Phase名    | テスト作成               |
| 前提Phase  | Phase 3（設計レビュー）  |
| 後続Phase  | Phase 5（実装）          |
| ステータス | 未実施                   |
| 作成日     | 2026-02-01               |
| 機能名     | TASK-8C-A: IPC統合テスト |

---

## 目的

Phase 2 で設計したテスト構造に基づき、22テストケースのテストコードを作成する（TDD Red フェーズ）。テストは実装前に作成し、全テストが「期待通りに失敗する」ことを確認する。本タスクはテストそのものが成果物であるため、テストコード自体を作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: テストファイルの雛形作成

**目的**: `skillIpc.integration.test.ts` の基本構造を作成する

**実行手順**:

1. `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts` を新規作成する
2. 以下の基本構造を記述する：

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ipcMain } from "electron";

// Electron mock
vi.mock("electron", () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn(),
    removeListener: vi.fn(),
  },
  BrowserWindow: {
    getFocusedWindow: vi.fn(() => ({
      webContents: { send: vi.fn(), id: 1 },
    })),
  },
}));

// IPC validator mock
vi.mock("../../infrastructure/security/ipc-validator", () => ({
  validateIpcSender: vi.fn(),
  toIPCValidationError: vi.fn((msg) => ({ success: false, error: msg })),
}));

describe("Skill IPC Integration", () => {
  let handlers: Map<string, (...args: unknown[]) => unknown>;
  let mockSkillService: /* SkillService mock type */;

  beforeEach(() => {
    handlers = new Map();
    vi.mocked(ipcMain.handle).mockImplementation((channel, handler) => {
      handlers.set(channel, handler);
    });
    // SkillService mock setup
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // 22 test cases follow...
});
```

3. 既存テストの import パターンを参考にし、正しい相対パスを使用する
4. テストファイルの TypeScript 型チェックがパスすることを確認する

**期待される成果物**:

- `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts`（雛形）

---

### タスク2: 基本12テストケースの実装（TC-01〜TC-12）

**目的**: 基本テストケース12件のテストコードを実装する

**実行手順**:

1. **TC-01: skill:list-available - スキル一覧取得成功**
   - `mockSkillService.scanAvailable` が `MOCK_SKILL_LIST` を返すよう設定
   - `handlers.get("skill:list-available")` を呼び出す
   - 戻り値が `{ success: true, data: MOCK_SKILL_LIST }` であることを検証
   - `mockSkillService.scanAvailable` が1回呼ばれたことを検証

2. **TC-02: skill:list-available - スキャンエラー処理**
   - `mockSkillService.scanAvailable` が `Error("Scan failed")` をスローするよう設定
   - `handlers.get("skill:list-available")` を呼び出す
   - 戻り値が `{ success: false, error: expect.stringContaining("Scan failed") }` であることを検証

3. **TC-03: skill:list-imported - インポート済みスキル取得成功**
   - `mockSkillService.listImported` が `MOCK_IMPORTED_SKILLS` を返すよう設定
   - 戻り値の `success` が `true` であることを検証

4. **TC-04: skill:import - スキルインポート成功**
   - `mockSkillService.importSkill` が成功結果を返すよう設定
   - ハンドラーに `"new-skill"` を渡して呼び出す
   - `mockSkillService.importSkill` が `"new-skill"` で呼ばれたことを検証
   - 戻り値が成功 `OperationResult` であることを検証

5. **TC-05: skill:import - 既存スキルインポートエラー**
   - `mockSkillService.importSkill` が `"Already imported"` エラーをスローするよう設定
   - 戻り値がエラー `OperationResult` であることを検証

6. **TC-06: skill:import - 存在しないスキルインポートエラー**
   - `mockSkillService.importSkill` が `"Not found"` エラーをスローするよう設定
   - 戻り値がエラー `OperationResult` であることを検証

7. **TC-07: skill:remove - スキル削除成功**
   - `mockSkillService.removeSkill` が成功するよう設定
   - ハンドラーに `"skill-to-remove"` を渡して呼び出す
   - `mockSkillService.removeSkill` が `"skill-to-remove"` で呼ばれたことを検証

8. **TC-08: skill:remove - 未インポートスキル削除エラー**
   - `mockSkillService.removeSkill` が `"Not imported"` エラーをスローするよう設定
   - 戻り値がエラー `OperationResult` であることを検証

9. **TC-09: skill:execute - 実行開始・実行ID返却**
   - `mockSkillService.execute` が `{ executionId: "exec-123" }` を返すよう設定
   - 実行リクエストオブジェクトを渡して呼び出す
   - 戻り値に `executionId` が含まれることを検証

10. **TC-10: skill:abort - 実行中止**
    - `mockSkillService.abort` が `true` を返すよう設定
    - `"exec-123"` を渡して呼び出す
    - 戻り値が `true` であることを検証

11. **TC-11: skill:permission:response - 権限応答転送**
    - 権限応答ハンドラーに `{ requestId: "req-123", approved: true }` を渡す
    - SkillService の権限応答メソッドが正しい引数で呼ばれたことを検証

12. **TC-12: skill:list-available (rescan) - 再スキャン**
    - `mockSkillService.scanAvailable` が更新されたリストを返すよう設定
    - ハンドラーを呼び出し、更新されたリストが返されることを検証

**期待される成果物**:

- TC-01〜TC-12 のテストコード（`skillIpc.integration.test.ts` に含む）

---

### タスク3: IMP-002 追加10テストケースの実装（TC-13〜TC-22）

**目的**: 設定管理・権限管理・キャッシュ機能の追加テストケースを実装する

**実行手順**:

1. **TC-13〜TC-16: skill:settings チャネル**
   - TC-13: `skill:settings:get` - 正常取得（Mock が設定オブジェクトを返す）
   - TC-14: `skill:settings:get` - 存在しないスキル（Mock がエラーをスロー）
   - TC-15: `skill:settings:update` - 正常更新（Mock が成功を返す）
   - TC-16: `skill:settings:update` - バリデーションエラー（Mock がバリデーションエラーをスロー）

2. **TC-17〜TC-19: skill:permissions チャネル**
   - TC-17: `skill:permissions:get` - 権限一覧取得（Mock が権限オブジェクトを返す）
   - TC-18: `skill:permissions:grant` - 権限付与（Mock が成功を返す、SkillService の対応メソッド呼び出し検証）
   - TC-19: `skill:permissions:revoke` - 権限取消（Mock が成功を返す、SkillService の対応メソッド呼び出し検証）

3. **TC-20〜TC-22: skill:cache チャネル**
   - TC-20: `skill:cache:get` - キャッシュ取得（Mock がキャッシュデータを返す）
   - TC-21: `skill:cache:set` - キャッシュ設定（Mock が成功を返す、設定引数の検証）
   - TC-22: `skill:cache:invalidate` - キャッシュ無効化（Mock が成功を返す）

4. IMP-002 チャネルのハンドラーが未登録の場合、テストは `handlers.get()` が `undefined` を返す形で失敗する（TDD Red の正常な失敗パターン）

**期待される成果物**:

- TC-13〜TC-22 のテストコード（`skillIpc.integration.test.ts` に含む）

---

### タスク4: テスト仕様書の作成

**目的**: テストケースの一覧と検証観点をドキュメント化する

**実行手順**:

1. 22テストケースの一覧を作成する（テストID, チャネル, テスト概要, Mock設定, 期待結果）
2. テストカバレッジ目標を記録する（`skillHandlers.ts` 行カバレッジ90%以上）
3. `outputs/phase-04/test-specification.md` に記録する

**期待される成果物**:

- `outputs/phase-04/test-specification.md`

---

### タスク5: TDD Red 確認

**目的**: 作成したテストが「正しく失敗する」ことを確認する

**実行手順**:

1. 以下のコマンドでテストを実行する：

   ```bash
   pnpm --filter @repo/desktop vitest run apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts
   ```

2. 以下を確認する：
   - テストファイルの TypeScript コンパイルが成功する
   - 基本12テストケース（TC-01〜TC-12）が「ハンドラー登録後に正しく実行される」（Mock が正しく動作する場合は PASS）
   - IMP-002 テストケース（TC-13〜TC-22）は対応ハンドラーが未実装のため失敗する（TDD Red）

3. テスト結果を記録する

**期待される成果物**:

- テスト実行結果（`outputs/phase-04/test-specification.md` に追記）

---

## 参照資料

| 参照資料             | パス                                                        | 内容                |
| -------------------- | ----------------------------------------------------------- | ------------------- |
| Phase 2 設計書       | `outputs/phase-02/integration-test-design.md`               | テスト構造設計      |
| Phase 3 レビュー結果 | `outputs/phase-03/design-review-result.md`                  | レビュー指摘事項    |
| 既存ユニットテスト   | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts` | Import パターン参考 |
| スキル型定義         | `packages/shared/src/types/skill.ts`                        | テスト型定義        |
| 実行型定義           | `packages/shared/src/types/skill-execution.ts`              | 実行関連型定義      |
| テストフィクスチャ   | `apps/desktop/src/__tests__/__fixtures__/skills/`           | テストデータ        |

---

## 成果物

| 成果物             | パス                                                               | 内容             |
| ------------------ | ------------------------------------------------------------------ | ---------------- |
| 統合テストファイル | `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts` | 22テストケース   |
| テスト仕様書       | `outputs/phase-04/test-specification.md`                           | テスト一覧・結果 |

---

## 統合テスト連携

Phase 4 は統合テスト自体を作成するPhaseである。以下の統合ポイントがテストで検証されることを確認する：

- **IPC登録統合**: `registerSkillHandlers` → `ipcMain.handle` で全チャネルが登録される
- **ハンドラー実行統合**: 登録されたハンドラーが正しい引数で `SkillService` を呼び出す
- **エラー変換統合**: `SkillService` の例外が `OperationResult` エラーに変換される
- **セキュリティ統合**: `validateIpcSender` が各ハンドラーで呼び出される

---

## 多角的チェック観点

| 観点               | 確認内容                                                  |
| ------------------ | --------------------------------------------------------- |
| テスタビリティ     | テストが独立して実行可能で、他テストに依存しないか        |
| IPC通信            | 全チャネルのハンドラーがテストされているか                |
| セキュリティ       | validateIpcSender の呼び出しがテストで検証されているか    |
| エラーハンドリング | 正常系・異常系の両方が各チャネルでテストされているか      |
| 型安全             | テストコードが TypeScript strict モードでコンパイル可能か |
| Electron固有       | ipcMain.handle の Mock が実際の動作に近いか               |

---

## 完了条件

- [ ] `skillIpc.integration.test.ts` が作成されている
- [ ] 基本12テストケース（TC-01〜TC-12）が実装されている
- [ ] IMP-002 追加10テストケース（TC-13〜TC-22）が実装されている
- [ ] テストファイルが TypeScript コンパイルに成功する
- [ ] 基本テスト（TC-01〜TC-12）の実行結果が記録されている
- [ ] テスト仕様書が `outputs/phase-04/test-specification.md` に配置されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: テストファイルの雛形作成
3. タスク2: 基本12テストケースの実装
4. タスク3: IMP-002 追加10テストケースの実装
5. タスク4: テスト仕様書の作成
6. タスク5: TDD Red 確認
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-05-implementation.md`
