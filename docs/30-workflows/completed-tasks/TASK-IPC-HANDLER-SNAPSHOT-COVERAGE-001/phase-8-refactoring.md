# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 8                                      |
| タスクID   | TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001 |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-19                             |
| 前Phase    | 7: カバレッジ確認                      |
| 次Phase    | 9: 品質保証                            |

---

## 目的

Wave 1〜2 で増えた registration snapshot テストの重複を見直し、
共通化した方が総複雑性を下げる場合のみ shared test utility を導入する。
共通化が利益を上回らない場合は、非導入判断と理由を `refactoring-log.md` に残す。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 重複パターンの特定

**目的**: `apps/desktop/src/main/ipc/__tests__/` 配下の全スナップショットテストから、重複しているmockパターンを洗い出す

**実行手順**:

1. `apps/desktop/src/main/ipc/__tests__/` 配下の全テストファイルを列挙する
2. 各テストファイルで使用されているipcMain mockの実装を確認する
3. 以下の観点で重複パターンを特定する
   - `vi.fn()` でモックされた `ipcMain.handle` / `ipcMain.on` のセットアップコード
   - キャプチャした呼び出し引数を取り出すヘルパー処理
   - `beforeEach` / `afterEach` のリセット処理
4. 重複箇所をBefore/After/理由の形式で記録する

**重複パターン例（Before）**:

```typescript
// 各テストファイルで繰り返されるmockセットアップ
const handleCalls: Array<[string, IpcMainInvokeEvent, ...unknown[]]> = [];
const mockIpcMain = {
  handle: vi.fn((channel, handler) => {
    handleCalls.push([channel, handler]);
  }),
  on: vi.fn(),
  removeHandler: vi.fn(),
};
beforeEach(() => {
  handleCalls.length = 0;
  vi.clearAllMocks();
});
```

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md` の重複パターン特定セクション

---

### タスク2: shared test utility の要否判断と設計

**目的**: 重複パターンをヘルパー関数に抽出すべきか判断し、必要な場合のみ shared utility を配置する

**実行手順**:

1. 重複量・変更箇所数・可読性改善量を比較し、導入判断を記録する
2. 導入する場合のみ、ヘルパー関数の設計を決定する
   - ファイル名: `apps/desktop/src/main/ipc/__tests__/helpers/ipcMainMock.ts`
   - 公開する関数・型の一覧を決定する
3. 導入判断が Yes の場合のみヘルパー関数を実装する

**実装例（After）**:

```typescript
// apps/desktop/src/main/ipc/__tests__/helpers/ipcMainMock.ts

export type CapturedHandle = {
  channel: string;
  handler: (...args: unknown[]) => unknown;
};

export type MockIpcMain = {
  handle: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  removeHandler: ReturnType<typeof vi.fn>;
  capturedHandles: () => CapturedHandle[];
  capturedOnChannels: () => string[];
};

/**
 * ipcMain のモックを生成する。
 * 各テストの beforeEach で呼び出すことで、テスト間の状態漏れを防ぐ。
 */
export function createMockIpcMain(): MockIpcMain {
  const handles: CapturedHandle[] = [];
  const onChannels: string[] = [];
  return {
    handle: vi.fn((channel, handler) => handles.push({ channel, handler })),
    on: vi.fn((channel) => onChannels.push(channel)),
    removeHandler: vi.fn(),
    capturedHandles: () => [...handles],
    capturedOnChannels: () => [...onChannels],
  };
}
```

4. 実装した場合は helper ファイルに TypeScript 型エラーがないことを確認する（`pnpm --filter @repo/desktop typecheck`）

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md` の導入判断セクション
- `apps/desktop/src/main/ipc/__tests__/helpers/ipcMainMock.ts`（導入した場合のみ）

---

### タスク3: 既存テストへのshared utility適用（または非導入の記録）

**目的**: タスク2の判断結果に基づき、shared utility を導入する場合は全スナップショットテストに適用する。非導入と判断した場合は理由を記録し、テストファイルの変更なしでこのタスクを完了とする。

> タスク2で「非導入」と判断した場合は、手順1〜3をスキップして手順4のみ実施する。

**実行手順（導入する場合）**:

1. 各テストファイルの重複コードをshared utilityの呼び出しに置き換える
2. 置き換え後にテストを実行して全テストがPASSすることを確認する

```bash
pnpm vitest run apps/desktop/src/main/ipc/__tests__/
```

3. 各テストファイルについて変更内容をBefore/After/理由の形式で `refactoring-log.md` に記録する

**Before/After/理由テーブル記入例（導入した場合）**:

| ファイル                                       | Before（変更前）             | After（変更後）              | 理由                                  |
| ---------------------------------------------- | ---------------------------- | ---------------------------- | ------------------------------------- |
| `creatorHandlers.registrationSnapshot.test.ts` | mockIpcMain をインライン定義 | `createMockIpcMain()` を使用 | DRY原則に従いmockセットアップを共通化 |
| `skillHandlers.registrationSnapshot.test.ts`   | handleCalls 配列を手動管理   | `capturedHandles()` を使用   | キャプチャロジックの重複排除          |

**実行手順（非導入の場合）**:

4. `refactoring-log.md` に以下を記録する
   - 非導入の判断理由（タスク2の記録を引用）
   - テストファイルの変更なし（変更行数: 0）を明記
   - 将来的に導入を再検討すべき条件（ファイル数が増えた場合など）

**期待される成果物**:

- 更新済みスナップショットテストファイル群（導入した場合のみ）
- `outputs/phase-8/refactoring-log.md` のBefore/After/理由テーブル（導入した場合）または非導入理由の記録（非導入の場合）

---

### タスク4: リファクタリング後のテスト継続確認

**目的**: shared utility適用後（または非導入確定後）も全スナップショットテストが正常にPASSすることを最終確認する。このタスクは shared utility の導入有無に関わらず必ず実施する。

**実行手順**:

1. 全テストを実行する

```bash
pnpm vitest run apps/desktop/src/main/ipc/__tests__/
```

2. 全テストがPASSすることを確認する
3. スナップショットの内容がリファクタリング前後で変わっていないことを確認する（`git diff` で確認）
   - 非導入の場合はテストファイル・スナップショットファイルに差分がないことを確認する
4. 結果を `refactoring-log.md` のテスト継続確認セクションに記録する

**期待される成果物**:

- `outputs/phase-8/refactoring-log.md` のテスト継続確認セクション（全PASS確認・実行時間・git diff結果）

---

## 参照資料

| 参照資料                 | パス                                                                         | 内容                       |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------------- |
| Phase 6/7成果物          | `outputs/phase-6/`, `outputs/phase-7/`                                       | テスト拡充・カバレッジ結果 |
| スナップショットテスト群 | `apps/desktop/src/main/ipc/__tests__/`                                       | リファクタリング対象       |
| IPC Handler Pattern      | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | IPCハンドラー登録パターン  |

### システム仕様（aiworkflow-requirements）

> リファクタリング時に必ず以下のシステム仕様を確認し、仕様に準拠した状態を維持してください。

| 参照資料   | パス                                                                   | 内容                 |
| ---------- | ---------------------------------------------------------------------- | -------------------- |
| 記述ガイド | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md` | 仕様記述・命名の基準 |

---

## 成果物

| 成果物                   | パス                                                                | 内容                                             |
| ------------------------ | ------------------------------------------------------------------- | ------------------------------------------------ |
| shared test utility      | `apps/desktop/src/main/ipc/__tests__/helpers/ipcMainMock.ts`        | mockセットアップ共通ヘルパー（導入した場合のみ） |
| リファクタリングログ     | `outputs/phase-8/refactoring-log.md`                                | Before/After/理由テーブル                        |
| 更新済みテストファイル群 | `apps/desktop/src/main/ipc/__tests__/*registrationSnapshot.test.ts` | shared utility適用済み                           |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 8の統合テスト連携アクション**:

- shared utility導入後も全スナップショットテストがPASSし、統合テストの安定性が維持されることを確認する
- スナップショットの内容（チャンネル名一覧）がリファクタリング前後で変化していないことをgit diffで確認する
- shared utilityのTypeScript型定義が正しく、型エラーが発生しないことを確認する

---

## 多角的チェック観点（AIが判断）

| 観点                     | チェック内容                                                           |
| ------------------------ | ---------------------------------------------------------------------- |
| DRY原則の適用            | 全テストファイルで同一のmockパターンが排除されているか                 |
| 型安全性                 | shared utilityの型定義が厳密で、`any` を使っていないか                 |
| テスト独立性の維持       | shared utility使用後もテスト間の状態漏れ（mockの使い回し）がないか     |
| スナップショット不変性   | リファクタリングによりスナップショットの内容が意図せず変化していないか |
| handle/on 両対応         | shared utilityが `handle` と `on` の両方をキャプチャできるか           |
| 保守コスト削減の定量評価 | 変更前後のコード行数差分（削減行数）を記録しているか                   |

---

## サブタスク管理

| サブタスクID | 内容                             | ステータス |
| ------------ | -------------------------------- | ---------- |
| ST-8-01      | 重複パターン特定                 | 未実施     |
| ST-8-02      | shared test utility設計と実装    | 未実施     |
| ST-8-03      | 既存テストへのshared utility適用 | 未実施     |
| ST-8-04      | リファクタリング後テスト継続確認 | 未実施     |

---

## 完了条件

- [ ] 重複しているipcMain mockパターンが特定されている
- [ ] shared utility を導入する場合は `apps/desktop/src/main/ipc/__tests__/helpers/ipcMainMock.ts` が実装されている
- [ ] shared utility を導入しない場合は、その理由と非導入判断が `refactoring-log.md` に記録されている
- [ ] 全スナップショットテストファイルがshared utilityを使うように更新されている
- [ ] `outputs/phase-8/refactoring-log.md` にBefore/After/理由テーブルが記録されている
- [ ] リファクタリング後に `pnpm vitest run` で全テストがPASSしている
- [ ] スナップショットの内容がリファクタリング前後で変化していない（`git diff` で確認）

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-IPC-HANDLER-SNAPSHOT-COVERAGE-001/phase-9-quality.md`
