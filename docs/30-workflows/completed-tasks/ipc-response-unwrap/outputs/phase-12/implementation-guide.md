# 実装ガイド: IPC レスポンスラッパー展開 (safeInvokeUnwrap)

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | UT-FIX-IPC-RESPONSE-UNWRAP-001          |
| GitHub Issue | #816                                    |
| 対象ファイル | `apps/desktop/src/preload/skill-api.ts` |
| 作成日       | 2026-02-14                              |

---

## Part 1: 概念説明（専門知識がなくても理解できる説明）

### なぜこの修正が必要だったのか

アプリの「スキル一覧」画面を開くと、画面がクラッシュしてしまうバグがありました。原因は「包装紙を剥がさずに商品を渡していた」ことです。

### お店の例えで理解する

お店（Main Process = アプリの裏側で動いているプログラム）で商品を注文すると、商品は必ず **包装紙**（`{ success: true, data: 商品 }` という入れ物）に包まれて届きます。

問題は、受付（Preload 層 = お店とお客さんの間にいる仲介者）が **包装紙ごとお客さんに渡していた** ことです。お客さん（画面 = Renderer）は「商品の一覧をください」と頼んだのに、「包装紙に包まれた何か」を受け取ったので、「これ、一覧じゃないじゃん！」とエラーを起こしてしまいました。

**修正内容**: 受付（Preload 層）に「包装紙を剥がして中身だけ渡す係」を追加しました。これが `safeInvokeUnwrap` です。

### 図で見る流れ

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Renderer（お客さん）                                        │
│    │                                                        │
│    │ "スキル一覧ちょうだい"                                   │
│    ▼                                                        │
│  Preload（受付）  ← ★ safeInvokeUnwrap がここで働く         │
│    │                                                        │
│    │ IPC通信（お店への注文）                                  │
│    ▼                                                        │
│  Main Process（お店）                                        │
│    │                                                        │
│    │ 注文処理完了！商品を包装紙に包んで返す                    │
│    │                                                        │
│    │  { success: true, data: [...スキル一覧...] }            │
│    │  ^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^^^^^                 │
│    │  包装紙の情報       中身（本当の商品）                    │
│    ▼                                                        │
│  Preload（受付）                                             │
│    │                                                        │
│    │ ★ 包装紙を剥がす！                                      │
│    │   { success: true, data: [...スキル一覧...] }           │
│    │                    ↓ ここだけ取り出す                    │
│    │   [...スキル一覧...]                                    │
│    ▼                                                        │
│  Renderer（お客さん） ← 中身だけ受け取れる！                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### もし注文が失敗したら？

包装紙に「失敗」と書いてあったら（`{ success: false, error: "理由" }`）、受付はお客さんに「注文が失敗しました」というエラーを伝えます。壊れた商品をそのまま渡すことはしません。

### 修正前と修正後の違い

| 状態   | お客さん（Renderer）が受け取るもの                         | 結果                                 |
| ------ | ---------------------------------------------------------- | ------------------------------------ |
| 修正前 | `{ success: true, data: [スキル1, スキル2] }` (包装紙付き) | エラー（「これは一覧じゃない！」）   |
| 修正後 | `[スキル1, スキル2]` (中身だけ)                            | 正常動作（「一覧だ、表示しよう！」） |

---

## Part 2: 開発者向け技術詳細

### 1. safeInvokeUnwrap<T> のシグネチャと実装

```typescript
/**
 * IpcResult<T> - Main Process IPC ハンドラのレスポンスラッパー型
 *
 * skillHandlers.ts のハンドラは以下の形式でレスポンスを返す:
 * - 成功: { success: true, data: T }
 * - 失敗: { success: false, error: string }
 */
interface IpcResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * safeInvokeUnwrap - IPC レスポンスラッパーを展開して data フィールドを返す
 *
 * Main Process の IPC ハンドラが { success: true, data: T } 形式で返す
 * レスポンスを展開し、T を直接返す。
 * { success: false, error: string } の場合は Error をスローする。
 *
 * @param channel - IPC チャンネル名
 * @param args - IPC 引数
 * @returns data フィールドの値（型 T）
 * @throws Error - success が false の場合、または IPC 通信エラーの場合
 */
async function safeInvokeUnwrap<T>(
  channel: string,
  ...args: unknown[]
): Promise<T> {
  const result = await safeInvoke<IpcResult<T>>(channel, ...args);
  if (!result.success) {
    throw new Error(result.error || `IPC call failed: ${channel}`);
  }
  return result.data as T;
}
```

#### 設計上のポイント

| ポイント                                 | 説明                                                                                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `IpcResult<T>` は `export` しない        | ファイルスコープの内部型。Renderer 層に公開しない                                                                                        |
| `safeInvoke` を内部で呼び出す            | チャンネルホワイトリスト検証を既存の `safeInvoke` に委譲。セキュリティ検証のバイパスなし                                                 |
| `result.error \|\| デフォルトメッセージ` | error が空文字列や undefined の場合にフォールバック                                                                                      |
| `result.data as T`                       | `success === true` を確認した後のみ実行。P19（型キャストによる実行時検証バイパス）への対策として `success` の boolean 判定を実行時に行う |

### 2. IpcResult<T> 型定義

```typescript
interface IpcResult<T> {
  success: boolean; // true: 成功、false: 失敗
  data?: T; // 成功時のデータ（success === true のとき存在）
  error?: string; // 失敗時のエラーメッセージ（success === false のとき存在）
}
```

Main Process の `skillHandlers.ts` が返すレスポンス形式と一致する:

```typescript
// skillHandlers.ts の応答パターン
return { success: true, data: skills }; // 成功
return { success: false, error: "..." }; // 失敗
```

### 3. 使用例

#### 正常系: スキル一覧取得

```typescript
// Preload 層（skill-api.ts）
list: (): Promise<SkillMetadata[]> =>
  safeInvokeUnwrap(IPC_CHANNELS.SKILL_LIST),

// Renderer 層での呼び出し
const skills = await window.electronAPI.skill.list();
// skills は SkillMetadata[] 型（ラッパーなし）
skills.forEach(skill => console.log(skill.name)); // 正常動作
```

#### 異常系: エラーハンドリング

```typescript
try {
  const skills = await window.electronAPI.skill.list();
} catch (error) {
  // Main Process 側で { success: false, error: "スキャンに失敗しました" } が返った場合
  // error.message === "スキャンに失敗しました"
  console.error("スキル取得失敗:", error.message);
}
```

#### 特殊ケース: import() は safeInvoke のまま

```typescript
// SKILL_IMPORT ハンドラは skillService.importSkills() を直接返す
// （{ success, data } ラッパーで包まない）ため safeInvoke を維持
import: (skillName: string): Promise<ImportedSkill> =>
  safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName),
```

### 4. 新しいスキルメソッドを追加する手順

新しい IPC ハンドラが `{ success, data }` 形式で応答するスキルメソッドを追加する場合のステップ:

#### Step 1: Main Process 側のハンドラ応答形式を確認する

```typescript
// skillHandlers.ts を確認
ipcMain.handle(IPC_CHANNELS.SKILL_NEW_METHOD, async (event, args) => {
  // { success: true, data: ... } 形式で返している場合 → safeInvokeUnwrap を使用
  // 直接値を返している場合 → safeInvoke をそのまま使用
  return { success: true, data: result };
});
```

#### Step 2: channels.ts にチャンネルを追加（未追加の場合）

```typescript
// channels.ts
export const IPC_CHANNELS = {
  // ...
  SKILL_NEW_METHOD: "skill:new-method",
} as const;

// ALLOWED_INVOKE_CHANNELS にも追加
export const ALLOWED_INVOKE_CHANNELS = [
  // ...
  IPC_CHANNELS.SKILL_NEW_METHOD,
];
```

#### Step 3: SkillAPI インターフェースにメソッドを追加

```typescript
export interface SkillAPI {
  // ...
  newMethod: (args: NewMethodArgs) => Promise<NewMethodResult>;
}
```

#### Step 4: skillAPI オブジェクトに実装を追加

```typescript
export const skillAPI: SkillAPI = {
  // ...

  // ハンドラが { success, data } 形式の場合:
  newMethod: (args: NewMethodArgs): Promise<NewMethodResult> =>
    safeInvokeUnwrap(IPC_CHANNELS.SKILL_NEW_METHOD, args),

  // ハンドラが直接値を返す場合:
  // newMethod: (args: NewMethodArgs): Promise<NewMethodResult> =>
  //   safeInvoke(IPC_CHANNELS.SKILL_NEW_METHOD, args),
};
```

#### Step 5: テストを追加

```typescript
// skill-api.unwrap.test.ts に追加
describe("newMethod()", () => {
  it("NewMethodResult を直接返す", async () => {
    mockInvoke.mockResolvedValue({ success: true, data: mockResult });

    const result = await skillAPI.newMethod(args);

    expect(result).toEqual(mockResult);
  });

  it("エラーレスポンス時に例外をスローする", async () => {
    mockInvoke.mockResolvedValue({ success: false, error: "失敗" });

    await expect(skillAPI.newMethod(args)).rejects.toThrow("失敗");
  });
});
```

### 5. 修正前後の比較表

| 項目                   | 修正前                                             | 修正後                                                        |
| ---------------------- | -------------------------------------------------- | ------------------------------------------------------------- |
| `list()` の実装        | `safeInvoke(IPC_CHANNELS.SKILL_LIST)`              | `safeInvokeUnwrap(IPC_CHANNELS.SKILL_LIST)`                   |
| `getImported()` の実装 | `safeInvoke(IPC_CHANNELS.SKILL_GET_IMPORTED)`      | `safeInvokeUnwrap(IPC_CHANNELS.SKILL_GET_IMPORTED)`           |
| `rescan()` の実装      | `safeInvoke(IPC_CHANNELS.SKILL_SCAN)`              | `safeInvokeUnwrap(IPC_CHANNELS.SKILL_SCAN)`                   |
| `import()` の実装      | `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)` | `safeInvoke(IPC_CHANNELS.SKILL_IMPORT, skillName)` (変更なし) |
| Renderer が受け取る値  | `{ success: true, data: [...] }` (ラッパー付き)    | `[...]` (展開済み)                                            |
| エラーハンドリング     | なし（ラッパーオブジェクトがそのまま渡される）     | `success: false` 時に `Error` をスロー                        |
| 型安全性               | 型注釈と実行時の値が不一致                         | `IpcResult<T>` を介して型推論が正しく機能                     |
| テスト数               | 138 テスト                                         | 163 テスト（+25 追加）                                        |

### 6. 関連ファイル一覧

| ファイル                                                           | 役割                                                                        |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `apps/desktop/src/preload/skill-api.ts`                            | `safeInvokeUnwrap` 関数と `IpcResult<T>` 型の定義、4メソッドの実装          |
| `apps/desktop/src/preload/__tests__/skill-api.unwrap.test.ts`      | `safeInvokeUnwrap` のユニットテスト（25テスト）                             |
| `apps/desktop/src/preload/__tests__/skill-api.test.ts`             | 既存 SkillAPI テスト（83テスト、モック値を `{ success, data }` 形式に更新） |
| `apps/desktop/src/preload/__tests__/skill-api.unification.test.ts` | 統合テスト（25テスト、モック値を `{ success, data }` 形式に更新）           |
| `apps/desktop/src/preload/channels.ts`                             | IPC チャンネル名定数とホワイトリスト定義                                    |
| `apps/desktop/src/main/ipc/skillHandlers.ts`                       | Main Process 側の IPC ハンドラ（変更なし）                                  |

### 7. セキュリティ上の注意点

- `safeInvokeUnwrap` は内部で `safeInvoke` を呼び出しており、チャンネルホワイトリスト検証は維持されている
- エラーメッセージは Main Process 側で生成されたものをそのまま Renderer に伝播する。Main Process 側でのエラーサニタイズが前提
- `IpcResult<T>` 型は `export` していないため、Renderer 層からは参照できない
