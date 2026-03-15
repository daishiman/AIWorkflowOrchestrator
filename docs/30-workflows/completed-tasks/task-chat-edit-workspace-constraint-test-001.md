# UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001 workspacePath セキュリティ検証テスト実装 - タスク指示書

## メタ情報

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-CHAT-EDIT-WORKSPACE-CONSTRAINT-TEST-001                         |
| タスク名     | workspacePath セキュリティ検証テスト実装（TC-WS-01〜06）           |
| 分類         | テスト追加                                                         |
| 対象機能     | chatEditHandlers.ts / workspacePath 制約ガード                     |
| 優先度       | 高                                                                 |
| 見積もり規模 | 中規模                                                             |
| ステータス   | 完了（Phase 1-12 完了 / Phase 13 未実施）                          |
| 発見元       | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 Phase 12（2026-03-14） |
| 発見日       | 2026-03-14                                                         |
| issue_number | 1222                                                               |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 において、`chatEditHandlers.ts` に workspacePath セキュリティ検証ロジックを追加した。具体的には `isAllowedPath(ctx.filePath, [args.workspacePath])` を呼び出すことで、コンテキストファイルが指定 workspace 内に収まっているか検証する仕組みを実装した。

しかし、この検証パス（正常系・異常系ともに）の単体テストおよび統合テストが十分に整備されていない。セキュリティ系の防御コードがテスト未カバーのまま放置されると、将来のリファクタリングで無音で壊れるリスクがある。

### 1.2 問題点・課題

- `isAllowedPath` が実際に呼ばれているかを確認するテストが存在しない。
- workspacePath 未指定時のスキップ動作が検証されていない。
- パストラバーサル攻撃（`../../` 等）に対するガード動作が自動テストで保証されていない。
- 複数コンテキストファイルのうち 1 つだけ workspace 外にある場合の挙動が未検証。
- 空コンテキスト配列のエッジケースが未検証。

### 1.3 放置した場合の影響

- セキュリティ検証ロジックが将来のリファクタリングで意図せず削除・迂回されてもテストが検知できない。
- コードカバレッジレポートで `isAllowedPath` 呼び出しブロックが未カバーとなり、品質基準（Branch Coverage 60% 以上）を下回る可能性がある。
- パストラバーサル攻撃ガードの動作保証がなく、セキュリティ監査で指摘を受けるリスクがある。

## 2. 何を達成するか（What）

### 2.1 目的

`chatEditHandlers.ts` の workspacePath セキュリティ検証ロジック（TC-WS-01〜06）を網羅する単体テスト・統合テストを実装し、防御コードが常に機能していることを自動検証できる状態にする。

### 2.2 最終ゴール

1. TC-WS-01〜06 の全テストケースが Vitest で PASS する。
2. `chatEditHandlers.ts` の workspacePath 検証ブランチの Branch Coverage が 70% 以上になる。
3. パストラバーサル攻撃パターンの入力に対して `PERMISSION_DENIED` エラーが返ることが自動テストで保証される。

### 2.3 スコープ

#### 含むもの

- `chatEditHandlers.ts` の workspacePath 検証ロジックに対する単体テスト（TC-WS-01〜06）
- モック adapter・RuntimeResolver を用いた統合テスト
- パストラバーサル攻撃パターンのセキュリティテスト

#### 含まないもの

- `isAllowedPath` 関数そのものの実装変更
- chatEditHandlers.ts 以外のハンドラのテスト追加
- E2E テスト（Playwright 等）での検証
- workspacePath 検証ロジックの機能追加・仕様変更

### 2.4 成果物

- `chatEditHandlers.test.ts`（新規または既存ファイルへのテスト追加）
  - TC-WS-01〜06 の全テストケース実装
- カバレッジレポート（`pnpm --filter @repo/desktop exec vitest run --coverage` の出力）

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 の実装が main ブランチにマージ済みであること
- `apps/desktop` パッケージのテスト環境が正常に動作すること（happy-dom 環境）
- `pnpm install` が完了していること

### 3.2 依存タスク

- TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（完了・実装の前提）

### 3.3 実行手順

#### Phase A: 現状調査

1. 正本の `chatEditHandlers.ts` を特定する（後述 P58 対策）。

   ```bash
   grep -rn "import.*chatEditHandlers" apps/desktop/src/
   # 結果から正本ファイルを特定する
   ```

2. 既存のテストファイルを確認する。

   ```bash
   find apps/desktop/src -name "chatEditHandlers*" -o -name "chat-edit*"
   ```

3. `isAllowedPath` の実装を確認する。

   ```bash
   grep -rn "isAllowedPath" apps/desktop/src/
   ```

4. `AuthMode` の型定義正本を確認する（後述 P57 対策）。

   ```bash
   grep -rn "AuthMode" packages/shared/src/
   ```

5. `ChatEditService` の Factory パターンを確認する（後述 P61 対策）。

   ```bash
   grep -rn "ChatEditService\|RuntimeResolver" apps/desktop/src/main/
   ```

#### Phase B: テストケース実装（TC-WS-01〜06）

以下の 6 テストケースを実装する。テスト環境は happy-dom のため `fireEvent` を使用し、`userEvent` は禁止（P39 対策）。

**TC-WS-01: workspace 内ファイルコンテキストの PASS**

```typescript
it("TC-WS-01: workspacePath 指定時、workspace 内のファイルコンテキストは PASS する", async () => {
  const args = {
    workspacePath: "/home/user/project",
    context: [{ filePath: "/home/user/project/src/index.ts" }],
    // その他の必須引数
  };
  const result = await handler(args);
  expect(result.success).toBe(true);
});
```

**TC-WS-02: workspace 外ファイルコンテキストの PERMISSION_DENIED**

```typescript
it("TC-WS-02: workspacePath 指定時、workspace 外のファイルコンテキストは PERMISSION_DENIED を返す", async () => {
  const args = {
    workspacePath: "/home/user/project",
    context: [{ filePath: "/etc/passwd" }],
  };
  const result = await handler(args);
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("PERMISSION_DENIED");
});
```

**TC-WS-03: workspacePath 未指定時の検証スキップ**

```typescript
it("TC-WS-03: workspacePath 未指定時、ファイルコンテキストの検証がスキップされる", async () => {
  const args = {
    // workspacePath を指定しない
    context: [{ filePath: "/etc/passwd" }],
  };
  // isAllowedPath が呼ばれないことを検証
  expect(mockIsAllowedPath).not.toHaveBeenCalled();
});
```

**TC-WS-04: パストラバーサル攻撃パターンのガード**

```typescript
it("TC-WS-04: workspacePath がパストラバーサル攻撃パターンを含む場合、PERMISSION_DENIED を返す", async () => {
  const args = {
    workspacePath: "/home/user/project",
    context: [{ filePath: "/home/user/project/../../etc/passwd" }],
  };
  const result = await handler(args);
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("PERMISSION_DENIED");
});
```

**TC-WS-05: 複数コンテキストのうち 1 つが workspace 外の場合**

```typescript
it("TC-WS-05: 複数コンテキストのうち1つが workspace 外の場合、全体が PERMISSION_DENIED になる", async () => {
  const args = {
    workspacePath: "/home/user/project",
    context: [
      { filePath: "/home/user/project/src/index.ts" }, // OK
      { filePath: "/etc/passwd" }, // NG
    ],
  };
  const result = await handler(args);
  expect(result.success).toBe(false);
  expect(result.error?.code).toBe("PERMISSION_DENIED");
});
```

**TC-WS-06: 空のコンテキスト配列の正常処理**

```typescript
it("TC-WS-06: 空のコンテキスト配列の場合、検証がスキップされて正常処理される", async () => {
  const args = {
    workspacePath: "/home/user/project",
    context: [],
  };
  // isAllowedPath が呼ばれず、正常に処理が完了する
  expect(mockIsAllowedPath).not.toHaveBeenCalled();
});
```

#### Phase C: カバレッジ確認

```bash
cd apps/desktop
pnpm exec vitest run src/main/ipc/chatEditHandlers.test.ts --coverage
```

Branch Coverage が 70% 以上であることを確認する。未達の場合は Phase B に戻り追加テストを実装する。

#### Phase D: 全テストの疎通確認

```bash
pnpm --filter @repo/desktop test
```

既存テストへの影響がないことを確認する。

### 3.4 苦戦箇所と対策

#### P57: AuthMode 値の乖離

- **問題**: 設計書では `"integrated"` / `"terminal"` / `"hybrid"` と記載されているが、実コードの型定義は `"subscription" | "api-key"` 等と異なる可能性がある。
- **対策**: Phase A Step 4 で以下を実行し、型定義の正本を確認してからテストのモック値を設定する。

  ```bash
  grep -rn "AuthMode" packages/shared/src/
  # 型定義ファイルの実際の値を確認する
  ```

- **影響**: AuthMode に依存するモックの期待値を設計書の値のまま書くとテストが失敗する。必ず実コードの型定義に合わせること。

#### P58: 同名ファイルの二重存在

- **問題**: `handlers/chatEditHandlers.ts` と `ipc/chatEditHandlers.ts` が共存している可能性がある。どちらが実際に IPC ハンドラとして登録されているかが不明。
- **対策**: Phase A Step 1 で import パスを grep して正本を特定してからテスト対象を決定する。

  ```bash
  grep -rn "import.*chatEditHandlers" apps/desktop/src/
  grep -rn "chatEditHandlers" apps/desktop/src/main/index.ts
  ```

- **影響**: 間違ったファイルにテストを追加しても動作するが、実際の IPC ハンドラはカバーされない。

#### P59: Preload API 未公開

- **問題**: `exposeChatEditAPI()` が `preload/index.ts` で呼ばれておらず、`window.chatEditAPI` が `undefined` になっている可能性がある。この場合、統合テストで Preload 経由の呼び出しが失敗する。
- **対策**: 単体テストでは Preload を介さずハンドラを直接テストする。Preload API の公開状態は以下で確認する。

  ```bash
  grep -rn "exposeChatEditAPI\|chatEditAPI" apps/desktop/src/preload/
  ```

- **影響**: Preload 未公開の場合、統合テストのスコープを「ハンドラ直接テスト」に絞る。Preload 公開の修正は本タスクスコープ外とし、別タスクとして起票する。

#### P61: ChatEditService の動的アダプタ注入

- **問題**: `ChatEditService` は RuntimeResolver の結果に応じて毎回 `new ChatEditService(adapter)` で生成する Factory パターンを採用している。テスト時に RuntimeResolver をモックしないと、実際の AI サービスに接続しようとする。
- **対策**: テスト時はモック adapter を直接注入し、RuntimeResolver をモックで差し替える。

  ```typescript
  // テスト内でのモック設定例
  const mockAdapter = {
    execute: vi.fn().mockResolvedValue({ success: true }),
  };
  vi.mock("../RuntimeResolver", () => ({
    resolveRuntime: vi.fn().mockReturnValue(mockAdapter),
  }));
  ```

- **影響**: RuntimeResolver をモックしないとテストが外部 AI サービスに接続し、不安定なテストになる。

### 3.5 同種課題の簡潔解決手順（5ステップ）

新しいセキュリティ検証ロジックにテストを追加する際の標準手順:

1. **正本特定**: `grep -rn "import.*{ハンドラ名}"` で実際に使われているファイルを特定する。
2. **型確認**: `grep -rn "AuthMode\|{関連型}"  packages/shared/src/` で型定義の実値を確認する。
3. **モック設計**: Factory / DI パターンのモック注入点を特定し、`vi.mock()` でサービス依存を切り離す。
4. **テスト実装**: 正常系（PASS）→ 異常系（PERMISSION_DENIED）→ エッジケース（空配列・パストラバーサル）の順に実装する。
5. **カバレッジ検証**: `--coverage` でブランチカバレッジを確認し、70% 未達なら追加テストを実装する。

## 4. 受入基準

### 機能要件

- [ ] TC-WS-01: workspacePath 指定時、workspace 内ファイルは PASS する
- [ ] TC-WS-02: workspacePath 指定時、workspace 外ファイルは `PERMISSION_DENIED` エラーを返す
- [ ] TC-WS-03: workspacePath 未指定時、`isAllowedPath` が呼ばれずに処理が続行する
- [ ] TC-WS-04: パストラバーサル攻撃パターン（`../../`）に対して `PERMISSION_DENIED` を返す
- [ ] TC-WS-05: 複数コンテキストのうち 1 つでも workspace 外なら全体が `PERMISSION_DENIED` を返す
- [ ] TC-WS-06: 空のコンテキスト配列で `isAllowedPath` が呼ばれずに正常処理される

### 品質要件

- [ ] TC-WS-01〜06 の全テストが Vitest で PASS する
- [ ] `chatEditHandlers.ts` の workspacePath 検証ブランチの Branch Coverage が 70% 以上
- [ ] 既存テストへの影響がない（`pnpm --filter @repo/desktop test` が全 PASS）
- [ ] P42 準拠: 文字列引数に `.trim() === ""` チェックが実装されていることをテストで確認する

### ドキュメント要件

- [ ] 本指示書が `docs/30-workflows/unassigned-task/` に作成済み
- [ ] `task-workflow.md` の残課題テーブルに本タスクが登録されている
- [ ] テスト実装後に `documentation-changelog.md` へ変更内容を記録する

## 5. 参照資料

### 関連実装ファイル

- `apps/desktop/src/main/ipc/chatEditHandlers.ts`（または `handlers/chatEditHandlers.ts`：P58 対策で正本を確認）
- `apps/desktop/src/preload/index.ts`（P59: Preload 公開状態確認）
- `packages/shared/src/`（P57: AuthMode 型定義正本）

### 関連タスク

- TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001（親タスク・実装元）

### 関連ルール・教訓

- `.claude/rules/06-known-pitfalls.md` — P39（happy-dom では `fireEvent` 使用）、P42（`.trim()` バリデーション）、P44（IPC インターフェース不整合）
- `.claude/rules/04-electron-security.md` — IPC セキュリティ原則・パストラバーサル攻撃防止
- `.claude/rules/02-code-quality.md` — テスト駆動開発・カバレッジ基準

### 参考仕様書

- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
