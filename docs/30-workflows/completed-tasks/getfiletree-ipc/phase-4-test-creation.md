# Phase 4: テスト作成 — skill:getFileTree IPC実装

## メタ情報

| 項目         | 値                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------ |
| タスクID     | UT-UI-05A-GETFILETREE-001                                                                                                |
| Phase        | 4（テスト作成）                                                                                                          |
| 前提Phase    | [phase-3-design-review.md](./phase-3-design-review.md)                                                                   |
| 作成日       | 2026-03-03                                                                                                               |
| Issue        | #948                                                                                                                     |
| 関連Pitfalls | P40（テスト実行ディレクトリ依存）, P42（.trim()バリデーション漏れ）, P41（v8カバレッジプロバイダ）, P9（テスト間リーク） |

## 目的

skill:getFileTree IPC チャネルの全レイヤー（Main Process ハンドラ、SkillFileManager サービス、Preload API）に対するテストを **テストファースト** で作成する。Red 状態（全テスト失敗）を確認し、Phase 5 の実装準備を整える。

## 実行タスク

### Task 4-1: テストケース設計

テスト対象の全パターンを設計し、テストケース一覧を作成する。

**テストケース一覧:**

| テストID | テスト名                                                   | 種別           | テスト対象       | 期待結果                                                             |
| -------- | ---------------------------------------------------------- | -------------- | ---------------- | -------------------------------------------------------------------- |
| FT-01    | 有効な skillName でファイルツリーを返却する                | 正常系         | IPCハンドラ      | `{ success: true, data: SkillFileTreeNode[] }` を返す                |
| FT-02    | 空ディレクトリのスキルで空配列を返却する                   | 正常系         | IPCハンドラ      | `{ success: true, data: [] }` を返す                                 |
| FT-03    | ネストされたディレクトリ構造を正しくツリー化する           | 正常系         | SkillFileManager | 子ノードを持つ `SkillFileTreeNode[]` を返す                          |
| FT-04    | バックアップファイルをツリーから除外する                   | 正常系         | SkillFileManager | `.backup.` / `.deleted.` 接尾辞ファイルが含まれない                  |
| FT-05    | ファイルとディレクトリが名前順でソートされる               | 正常系         | SkillFileManager | ディレクトリ先頭、ファイル後方の名前順ソート                         |
| FT-06    | 非文字列引数で VALIDATION_ERROR を返す                     | バリデーション | IPCハンドラ      | `{ success: false, error: "skillName must be ..." }` を返す          |
| FT-07    | 空文字列引数で VALIDATION_ERROR を返す                     | バリデーション | IPCハンドラ      | `{ success: false, error: "skillName must be ..." }` を返す          |
| FT-08    | スペースのみ引数で VALIDATION_ERROR を返す（P42）          | バリデーション | IPCハンドラ      | `{ success: false, error: "skillName must be ..." }` を返す          |
| FT-09    | undefined 引数で VALIDATION_ERROR を返す                   | バリデーション | IPCハンドラ      | `{ success: false, error: "skillName must be ..." }` を返す          |
| FT-10    | 不正な sender でセキュリティエラーを返す                   | セキュリティ   | IPCハンドラ      | `validateIpcSender` 失敗時のエラーオブジェクトを throw               |
| FT-11    | 存在しないスキル名で SkillNotFoundError を返す             | エラー系       | IPCハンドラ      | `{ success: false, error: "Skill not found: ..." }` を返す           |
| FT-12    | 未知のエラーで "Internal error" を返す                     | エラー系       | IPCハンドラ      | `{ success: false, error: "Internal error" }` を返す                 |
| FT-13    | スキルが見つからない場合 SkillNotFoundError をスローする   | エラー系       | SkillFileManager | `SkillNotFoundError` をスロー                                        |
| FT-14    | Preload API が safeInvokeUnwrap で正しいチャネルを呼び出す | 結合           | Preload API      | `IPC_CHANNELS.SKILL_GET_FILE_TREE` チャネルに `{ skillName }` を渡す |

### Task 4-2: Main Process ハンドラテスト作成

**対象ファイル:** `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`（既存ファイルに追加）

既存テスト（U-01〜U-26）のパターンに従い、以下のテストを追加する:

- FT-01: 正常系ツリー返却テスト
- FT-02: 空ディレクトリのテスト
- FT-06〜FT-09: P42 3段バリデーションテスト（非文字列 / 空文字列 / スペースのみ / undefined）
- FT-10: validateIpcSender セキュリティテスト
- FT-11: SkillNotFoundError ハンドリングテスト
- FT-12: 未知エラーの "Internal error" サニタイズテスト

**テスト構造:**

```typescript
describe("skill:getFileTree", () => {
  // FT-01
  it("有効な skillName でファイルツリーを返却する", async () => { ... });
  // FT-02
  it("空ディレクトリのスキルで空配列を返却する", async () => { ... });
  // FT-06
  it("非文字列引数で VALIDATION_ERROR を返す", async () => { ... });
  // FT-07
  it("空文字列引数で VALIDATION_ERROR を返す", async () => { ... });
  // FT-08
  it("スペースのみ引数で VALIDATION_ERROR を返す (P42)", async () => { ... });
  // FT-09
  it("undefined 引数で VALIDATION_ERROR を返す", async () => { ... });
  // FT-10
  it("不正な sender でセキュリティエラーを返す", async () => { ... });
  // FT-11
  it("存在しないスキル名で SkillNotFoundError を返す", async () => { ... });
  // FT-12
  it("未知のエラーで Internal error を返す", async () => { ... });
});
```

**テスト実装パターン（既存テスト U-01 に準拠）:**

```typescript
// mockSkillFileManager に getFileTree を追加
const mockSkillFileManager = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  createFile: vi.fn(),
  deleteFile: vi.fn(),
  listBackups: vi.fn(),
  restoreBackup: vi.fn(),
  isReadonly: vi.fn(),
  getFileTree: vi.fn(), // 新規追加
};

// FT-01 テスト例
it("有効な skillName でファイルツリーを返却する", async () => {
  const treeData = [
    { name: "SKILL.md", path: "SKILL.md", type: "file" as const },
    {
      name: "references",
      path: "references",
      type: "directory" as const,
      children: [
        {
          name: "guide.md",
          path: "references/guide.md",
          type: "file" as const,
        },
      ],
    },
  ];
  mockSkillFileManager.getFileTree.mockResolvedValue(treeData);
  const handler = handlerMap.get(IPC_CHANNELS.SKILL_GET_FILE_TREE);
  const result = await handler!(mockEvent, { skillName: "test-skill" });
  expect(result).toEqual({ success: true, data: treeData });
  expect(mockSkillFileManager.getFileTree).toHaveBeenCalledWith("test-skill");
});
```

### Task 4-3: SkillFileManager.getFileTree テスト作成

**対象ファイル:** `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.getFileTree.test.ts`（新規作成）

SkillFileManager の `getFileTree` メソッドに対する単体テスト:

- FT-03: ネストディレクトリ構造のツリー化
- FT-04: バックアップファイル除外
- FT-05: ファイル/ディレクトリのソート順
- FT-13: スキル未発見時の SkillNotFoundError

**テスト構造:**

```typescript
describe("SkillFileManager.getFileTree", () => {
  // FT-03
  it("ネストされたディレクトリ構造を正しくツリー化する", async () => { ... });
  // FT-04
  it("バックアップファイルをツリーから除外する", async () => { ... });
  // FT-05
  it("ファイルとディレクトリが名前順でソートされる", async () => { ... });
  // FT-13
  it("スキルが見つからない場合 SkillNotFoundError をスローする", async () => { ... });
  // 追加: 空ディレクトリのテスト
  it("空ディレクトリで空配列を返す", async () => { ... });
});
```

**テスト環境:**

- 一時ディレクトリ（`fs.mkdtemp`）を使用してスキルディレクトリを作成
- `beforeEach` で一時ディレクトリを初期化、`afterEach` で削除
- P9 対策: テスト間で状態を共有しない

### Task 4-4: Preload API テスト作成

**対象ファイル:** `apps/desktop/src/preload/__tests__/skill-api.getFileTree.test.ts`（新規作成）

Preload 層の `getFileTree` メソッドに対するテスト:

- FT-14: `safeInvokeUnwrap` が正しいチャネルとパラメータで呼び出されるか検証

**テスト構造:**

```typescript
describe("skillAPI.getFileTree", () => {
  // FT-14
  it("SKILL_GET_FILE_TREE チャネルに { skillName } を渡して呼び出す", async () => { ... });
});
```

## SubAgent 分担テーブル

| SubAgent | 担当タスク                       | 対象ファイル                                                                          |
| -------- | -------------------------------- | ------------------------------------------------------------------------------------- |
| Agent A  | Task 4-2: IPCハンドラテスト追加  | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`                       |
| Agent B  | Task 4-3: SkillFileManagerテスト | `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.getFileTree.test.ts` |
| Agent C  | Task 4-4: Preload APIテスト      | `apps/desktop/src/preload/__tests__/skill-api.getFileTree.test.ts`                    |

## 参照資料

| 資料                         | パス                                                                              | 参照目的                      |
| ---------------------------- | --------------------------------------------------------------------------------- | ----------------------------- |
| 既存ハンドラテスト           | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`                   | テストパターン・モック構成    |
| IPC契約チェックリスト        | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`     | テスト観点の網羅性確認        |
| テストコンポーネントパターン | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト設計パターン            |
| 既知の落とし穴               | `.claude/rules/06-known-pitfalls.md`                                              | P40, P42, P41, P9 の対策確認  |
| SkillFileManager 実装        | `apps/desktop/src/main/services/skill/SkillFileManager.ts`                        | walkDir/findSkillDir パターン |
| エラー定義                   | `apps/desktop/src/main/services/skill/errors.ts`                                  | エラークラス一覧              |

依存Phase参照: Phase 1, Phase 2, Phase 3

## 実行手順

1. **テストケース一覧レビュー**: 上記テストケース一覧テーブルの網羅性を確認する
2. **Agent A**: 既存 `skillFileHandlers.test.ts` に `describe("skill:getFileTree")` ブロックを追加（FT-01, FT-02, FT-06〜FT-12）
3. **Agent B**: `SkillFileManager.getFileTree.test.ts` を新規作成（FT-03〜FT-05, FT-13）
4. **Agent C**: `skill-api.getFileTree.test.ts` を新規作成（FT-14）
5. **Red 確認**: `cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillFileHandlers.test.ts src/main/services/skill/__tests__/SkillFileManager.getFileTree.test.ts src/preload/__tests__/skill-api.getFileTree.test.ts` を実行し、新規テストが全て **失敗（Red）** することを確認する

**P40 注意:** テスト実行は `cd apps/desktop` してから行う。プロジェクトルートからの実行は `vitest.config.ts` の `environment` 設定が適用されないため禁止。

## 統合テスト連携

| 連携対象                   | 観点                                         | 本Phaseでの扱い                                              |
| -------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| IPC契約（Renderer → Main） | skill:getFileTree の引数・戻り値・エラー契約 | Phase 4 の定義/成果物と api-ipc-agent.md を照合する          |
| Preload API                | safeInvokeUnwrap 経由の型安全な公開契約      | interfaces-agent-sdk-skill.md のメソッド契約と整合を維持する |
| Main Process               | validateIpcSender と P42 3段バリデーション   | security-electron-ipc.md の防御要件を満たすことを確認する    |
| テスト連携                 | 単体テスト・統合観点の引き継ぎ               | 直前Phase成果物を参照し、次Phaseへ検証条件を明示する         |

## 成果物

| 成果物                         | パス                                                                                  |
| ------------------------------ | ------------------------------------------------------------------------------------- |
| テスト設計書                   | `outputs/phase-4/test-design.md`                                                      |
| テストケース一覧               | `outputs/phase-4/test-cases.md`                                                       |
| IPCハンドラテスト（既存追加）  | `apps/desktop/src/main/ipc/__tests__/skillFileHandlers.test.ts`                       |
| SkillFileManagerテスト（新規） | `apps/desktop/src/main/services/skill/__tests__/SkillFileManager.getFileTree.test.ts` |
| Preload APIテスト（新規）      | `apps/desktop/src/preload/__tests__/skill-api.getFileTree.test.ts`                    |
| Red確認スクリーンショット      | `outputs/phase-4/test-red-confirmation.md`                                            |

## 完了条件

- [ ] テストケース一覧が正常系・異常系・セキュリティ・エッジケースを網羅している（14テストケース）
- [ ] `skillFileHandlers.test.ts` に `skill:getFileTree` の describe ブロックが追加されている
- [ ] `SkillFileManager.getFileTree.test.ts` が新規作成されている
- [ ] `skill-api.getFileTree.test.ts` が新規作成されている
- [ ] P42 3段バリデーション（型チェック → 空文字列 → トリム後空文字列）のテストが含まれている
- [ ] validateIpcSender セキュリティテストが含まれている
- [ ] 全新規テストが Red 状態（失敗）で実行確認されている
- [ ] テスト実行が `cd apps/desktop && pnpm vitest run` で行われている（P40 準拠）
- [ ] テスト間で状態が共有されていない（P9 準拠: beforeEach でリセット）

## 次Phase

全テストが Red 状態であることを確認後、[Phase 5: 実装](./phase-5-implementation.md) へ進む。
