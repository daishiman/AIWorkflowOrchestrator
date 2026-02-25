# 実装ガイド（Phase 12）

## Part 1: 概念説明（非専門向け）

### なぜ必要だったか（先に理由）

この修正が必要だった理由は、同じ「実行結果」を受け取る処理なのに、場所ごとに受け取り方が違っていたためです。

具体的には、次の2つがズレていました。

- ここでいう Main は「裏側で実処理を行う場所」、Preload は「画面と裏側の受け渡し役」です。
- `skill:execute`: Main 側は `{ success, data }` 形式で返すのに、Preload 側でその前提が揃っていない箇所があった
- `skill:remove`: Main 側は削除結果オブジェクトを返すのに、Preload 側は「何も返らない」扱いだった

このままだと、画面側が結果を取り違え、`executionId` を取れない・削除結果を見失う、という不具合が再発しやすくなります。

#### 日常生活での例え

宅配便の受け取りに例えると、伝票には「箱の中身」と「配達成功フラグ」がセットで書かれているのに、受け取る人が中身だけ見たり、逆に伝票を無視してしまう状態です。  
受け取りルールを統一しないと、届いたのに「届いていない」と判断する事故が起きます。

### 何を直したか

- `skill:execute`:
  - Main の `{ success, data }` 形式を Preload 側で正しく展開して返すように統一
- `skill:remove`:
  - Preload の戻り値を `Promise<void>` から `Promise<RemoveResult>` に変更
  - Main と Preload の契約を一致

結果として、画面側は `executionId` と削除結果を同じルールで安全に扱えるようになりました。

---

## Part 2: 技術詳細（実装者向け）

### インターフェース/型定義

```ts
// Before
execute(request: SkillExecutionRequest): Promise<SkillExecutionResponse>;
remove(skillName: string): Promise<void>;

// After
execute(request: SkillExecutionRequest): Promise<SkillExecutionResponse>; // safeInvokeUnwrapでMain wrapperを展開
remove(skillName: string): Promise<RemoveResult>;
```

```ts
type RemoveResult = {
  success: boolean;
  removedPath?: string;
  backupPath?: string;
  message?: string;
};
```

### APIシグネチャと使用例

```ts
// preload
execute: (request: SkillExecutionRequest) =>
  safeInvokeUnwrap<SkillExecutionResponse>(
    IPC_CHANNELS.SKILL_EXECUTE,
    request,
    "skill.execute"
  ),

remove: (skillName: string) =>
  safeInvoke<RemoveResult>(
    IPC_CHANNELS.SKILL_REMOVE,
    skillName,
    "skill.remove"
  ),
```

```ts
// renderer usage
const execution = await window.electronAPI.skill.execute(req);
const removeResult = await window.electronAPI.skill.remove("my-skill");
```

### 実際に変更したファイル

#### 実装

- `apps/desktop/src/preload/skill-api.ts`
  - `execute`: `safeInvoke` → `safeInvokeUnwrap`
  - `remove`: `Promise<void>` → `Promise<RemoveResult>`
  - `RemoveResult` import 追加

#### テスト

- `apps/desktop/src/preload/__tests__/skill-api.test.ts`
  - `RemoveResult` fixture 追加
  - `remove` 期待値を `RemoveResult` に更新
  - `execute` モックを wrapper 形式へ更新
- `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts`
  - `execute` モックを wrapper 形式へ更新
  - `remove` 期待値を `RemoveResult` に更新

#### システム仕様書（aiworkflow-requirements）

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
  - 旧チャンネル名（`skill:list-imported`, `skill:list-available`）を現行名に更新
  - `skill:remove` / `skill:execute` 戻り値記述を現行契約へ更新
- `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`
  - SkillAPI インターフェース表の `abort` を `Promise<void>` に更新
  - `list/getImported/rescan/import/remove` と関連チャネル記述を現行APIへ補強

### エラーハンドリングとエッジケース

- `skill:execute`
  - Main 側が `{ success: false, error }` を返した場合、Preload 側で例外化される
  - Renderer は `try/catch` で扱う
- `skill:remove`
  - `skillName` が空文字・不正値なら Main の検証で拒否
  - 削除不能時は `RemoveResult.success === false` または例外で返却されるため、呼び出し側は両方に対応

### 設定可能パラメータ・定数

| 項目            | 値                           | 用途                                       |
| --------------- | ---------------------------- | ------------------------------------------ |
| IPCチャンネル   | `IPC_CHANNELS.SKILL_EXECUTE` | 実行要求                                   |
| IPCチャンネル   | `IPC_CHANNELS.SKILL_REMOVE`  | 削除要求                                   |
| Preloadラッパー | `safeInvokeUnwrap`           | wrapper `{ success, data }` を展開して返す |
| Preloadラッパー | `safeInvoke`                 | 直接返却型（`RemoveResult`）をそのまま返す |

### 検証コマンド（実行済み）

```bash
corepack pnpm --dir apps/desktop exec vitest run \
  src/preload/__tests__/skill-api.test.ts \
  src/preload/__tests__/skill-api.unwrap.test.ts \
  src/preload/__tests__/skill-api.unification.test.ts

corepack pnpm --dir apps/desktop exec vitest run \
  src/main/ipc/__tests__/skillHandlers.test.ts \
  src/main/ipc/__tests__/skillHandlers.execute.test.ts \
  src/main/ipc/__tests__/skillHandlers.validation.test.ts

corepack pnpm --dir apps/desktop exec vitest run \
  src/renderer/hooks/__tests__/useSkillExecution.test.ts \
  src/renderer/store/slices/__tests__/agentSlice.skill-integration.test.ts \
  src/renderer/store/slices/__tests__/agentSlice.execution.test.ts

corepack pnpm --dir apps/desktop run typecheck
corepack pnpm lint
```

### 検証結果

- Preload関連: 133 tests PASS
- Main関連: 145 tests PASS
- Renderer関連: 116 tests PASS
- Typecheck: PASS
- Lint: Error 0 / Warning 4（スコープ外）

### セキュリティ維持確認

- `validateIpcSender` の実装は未変更。
- P42 バリデーション実装は未変更。
- チャンネルホワイトリスト定義は未変更。
