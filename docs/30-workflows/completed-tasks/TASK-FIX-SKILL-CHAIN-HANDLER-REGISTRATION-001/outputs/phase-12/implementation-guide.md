# Phase 12: 実装ガイド

## メタ情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| タスクID | TASK-FIX-SKILL-CHAIN-HANDLER-REGISTRATION-001 |
| Phase    | 12 - Task 1: 実装ガイド                       |
| 作成日   | 2026-03-03                                    |

---

## Part 1: 概念説明（中学生レベル）

### 「郵便局の配達員登録」で理解する IPC ハンドラ登録

#### 登場人物

- **郵便局** = Electron の Main Process（アプリの中心）
- **配達員** = IPC ハンドラ（特定のお仕事を担当する人）
- **配達員名簿** = `registerAllIpcHandlers()` 関数（誰がどの仕事をするかの一覧表）
- **お客さん** = Renderer Process（画面側のプログラム）

#### 何が起きていたか

ある日、郵便局に新しい配達員が入ってきました。「スキルチェーン一覧」という仕事を担当する配達員です。

この配達員は既に制服を着て（`registerSkillChainHandlers` 関数は実装済み）、仕事のやり方も覚えています（ハンドラのロジックは完成済み）。

でも、**配達員名簿に名前を書き忘れていた**のです！

お客さんが「スキルチェーンの一覧を見せてください」と窓口に来ても、名簿に載っていない配達員は呼び出せません。「そんな配達員はいません」とエラーになってしまいます。

#### どう直したか

配達員名簿（`registerAllIpcHandlers` 関数）に、新しい配達員の名前を追加しました。たったこれだけです。

```
名簿に追加した内容:
- スキルチェーン担当の配達員（registerSkillChainHandlers）を呼び出す
- 配達員に必要な道具（SkillChainStore, SkillChainExecutor）も渡す
```

#### macOS の Dock クリック時（activate イベント）

macOS では、Dock のアイコンをクリックするとアプリが再アクティブになります。このとき、全配達員が一度退勤して（`unregisterAllIpcHandlers`）、改めて出勤し直します（`registerAllIpcHandlers`）。

名簿に名前がないと、この「出勤し直し」のときにも呼ばれないので、Dock クリック後にスキルチェーン機能が動かなくなります。今回の修正で名簿に追加したので、再アクティブ後も正常に動きます。

---

## Part 2: 技術者向け実装詳細

### 変更サマリー

| 項目           | 内容                                         |
| -------------- | -------------------------------------------- |
| 変更ファイル数 | 1（プロダクションコード） + 1（テスト）      |
| 変更行数       | 約15行（import 3行 + 呼出 5行 + テスト 7行） |
| 破壊的変更     | なし                                         |
| 新規公開API    | なし（既存の内部配線修正）                   |

### 変更箇所 1: `apps/desktop/src/main/ipc/index.ts`

#### import 追加

```typescript
import { registerSkillChainHandlers } from "./skillHandlers";
import { SkillChainStore } from "../services/skill/SkillChainStore";
import { SkillChainExecutor } from "../services/skill/SkillChainExecutor";
```

#### `registerAllIpcHandlers()` 内に呼出追加

```typescript
// Skill Chain handlers
const chainStoragePath = path.join(homeDir, ".claude", "skill-chains.json");
const chainStore = new SkillChainStore(chainStoragePath);
const chainExecutor = new SkillChainExecutor(
  async (skillName: string, input: unknown) => {
    const result = await skillService.executeSkill(skillName, {
      prompt: typeof input === "string" ? input : JSON.stringify(input),
    });
    return result;
  },
);
registerSkillChainHandlers(mainWindow, chainStore, chainExecutor);
```

### 変更箇所 2: `apps/desktop/src/main/ipc/__tests__/ipc-double-registration.test.ts`

#### モック追加

```typescript
vi.mock("../skillHandlers", () => ({
  registerSkillChainHandlers: vi.fn(),
}));
vi.mock("../../services/skill/SkillChainStore", () => ({
  SkillChainStore: vi.fn(),
}));
vi.mock("../../services/skill/SkillChainExecutor", () => ({
  SkillChainExecutor: vi.fn(),
}));
```

#### テスト追加

```typescript
it("should call registerSkillChainHandlers during registration", () => {
  registerAllIpcHandlers(mockWindow);
  expect(registerSkillChainHandlers).toHaveBeenCalled();
});
```

### IPC 契約テーブル

`registerSkillChainHandlers` が登録する IPC チャンネル：

| チャンネル            | 引数                    | 戻り値                              | バリデーション                 |
| --------------------- | ----------------------- | ----------------------------------- | ------------------------------ |
| `skill:chain:list`    | なし                    | `IpcResult<SkillChainDefinition[]>` | sender 検証                    |
| `skill:chain:get`     | `chainId: string`       | `IpcResult<SkillChainDefinition>`   | sender + P42 3段バリデーション |
| `skill:chain:save`    | `chain: object`         | `IpcResult<SkillChainDefinition>`   | sender + object + name 検証    |
| `skill:chain:delete`  | `chainId: string`       | `IpcResult<{deleted: boolean}>`     | sender + P42 3段バリデーション |
| `skill:chain:execute` | `{chainId, variables?}` | `IpcResult<SkillChainResult>`       | sender + 複合バリデーション    |

### P42 準拠 3段バリデーション

文字列引数（`chainId` 等）には以下の3段チェックを適用：

```typescript
// 1. 型チェック
if (typeof chainId !== "string") {
  throw VALIDATION_ERROR;
}
// 2. 空文字列チェック
if (chainId === "") {
  throw VALIDATION_ERROR;
}
// 3. トリム空文字列チェック
if (chainId.trim() === "") {
  throw VALIDATION_ERROR;
}
```

### 関連する既知の落とし穴

| Pitfall | 内容                         | 本タスクでの対策                                                 |
| ------- | ---------------------------- | ---------------------------------------------------------------- |
| P5      | リスナー二重登録             | `unregisterAllIpcHandlers()` → `registerAllIpcHandlers()` フロー |
| P42     | `.trim()` バリデーション漏れ | 3段バリデーション適用                                            |
| P44     | IPC インターフェース不整合   | Preload 側と引数形式を一致させた実装                             |
| P45     | 引数命名の契約ドリフト       | セマンティクスに一致する引数名を使用                             |
