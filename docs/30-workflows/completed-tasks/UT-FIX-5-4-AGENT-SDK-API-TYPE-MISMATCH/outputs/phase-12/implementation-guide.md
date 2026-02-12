# UT-FIX-5-4 実装ガイド: AgentSDKAPI 型定義不一致修正

## メタ情報

| 項目     | 内容                                              |
| -------- | ------------------------------------------------- |
| タスクID | UT-FIX-5-4                                        |
| タスク名 | AgentSDKAPI abort() 型定義不一致修正              |
| 作成日   | 2026-02-10                                        |
| 対象読者 | Part 1: 初学者・非技術者 / Part 2: 開発者・技術者 |

---

# Part 1: 概念説明（中学生レベル）

## 1.1 日常の例え話：レストランのメニューと実際の仕組み

想像してください。あなたがレストランに行って、メニューを見ています。

メニューには「料理を注文すると、すぐにお皿が出てきます」と書いてあります。でも実際にお店に行ってみると、注文後に「番号札」を渡されて、「この番号が呼ばれたら取りに来てください」と言われました。

これって、メニュー（説明）と実際の仕組みが違いますよね？

### 今回修正した問題

私たちのアプリでも同じことが起きていました。

- **メニュー（型定義）**: 「abort()を呼ぶと、すぐに終わります」
- **実際の仕組み**: 「abort()を呼ぶと、番号札（Promise）をもらって、後で完了を確認できます」

メニューには「すぐに終わる」と書いてあったのに、実際は「番号札方式」だったのです。

## 1.2 Promise とは何か？（番号札の例え）

**Promise（プロミス）** は、日本語で「約束」という意味です。

レストランで例えると：

1. **注文する** = `abort()` を呼ぶ
2. **番号札をもらう** = `Promise` を受け取る
3. **番号が呼ばれる** = 処理が完了する
4. **料理を受け取る** = 結果を使う

番号札をもらった時点では、まだ料理は来ていません。でも「後で必ず料理が来る」という約束（Promise）はもらっています。

### なぜ番号札方式が便利なのか

1. **待っている間に他のことができる** - 席で待ちながらスマホを見られる
2. **完了のタイミングが分かる** - 番号が呼ばれたら取りに行けばいい
3. **問題があれば教えてもらえる** - 「すみません、材料切れです」と連絡がくる

プログラムでも同じです。Promise があると：

1. **他の処理を続けられる** - 画面が固まらない
2. **完了を待てる** - `.then()` や `await` で完了を確認
3. **エラーを処理できる** - `.catch()` でエラーに対応

## 1.3 なぜ正しい型にすることが大事か

もしレストランのメニューと実際の仕組みが違ったら、お客さん（開発者）は混乱しますよね。

- 「メニューには『すぐ出る』と書いてあるのに、番号札を渡された...？」
- 「番号札をもらったけど、メニューには何も書いてないから、どうすればいいか分からない」

### 修正前の問題

```
メニュー（型定義）: abort() → すぐ終わる（void）
実際の仕組み:      abort() → 番号札をもらう（Promise）

開発者: 「え？メニューと違う...」
```

### 修正後

```
メニュー（型定義）: abort() → 番号札をもらう（Promise）
実際の仕組み:      abort() → 番号札をもらう（Promise）

開発者: 「メニュー通りだ！.then() や await が使える！」
```

## 1.4 まとめ

| 項目           | 修正前             | 修正後            |
| -------------- | ------------------ | ----------------- |
| メニュー（型） | すぐ終わる（void） | 番号札（Promise） |
| 実際の仕組み   | 番号札（Promise）  | 番号札（Promise） |
| 一致しているか | いいえ             | はい              |
| 開発者の体験   | 混乱する           | 期待通り動く      |

---

# Part 2: 技術的詳細（開発者向け）

## 2.1 問題の背景

UT-FIX-5-3 のPhase 12追加検証で発見された、型定義と実装の不一致問題。

### 発見された問題

```typescript
// apps/desktop/src/preload/index.ts 行104
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T>

// apps/desktop/src/preload/index.ts 行435
abort: () => safeInvoke(IPC_CHANNELS.AGENT_ABORT),
// → 実装の戻り値: Promise<void>

// apps/desktop/src/preload/types.ts 行1289（修正前）
abort: () => void;
// → 型定義の戻り値: void（不一致）
```

## 2.2 型定義変更（Before/After）

### ファイル 1: `packages/shared/src/agent/types.ts`

```typescript
// Before（行237）
abort(): void;

// After（行237）
/**
 * 実行中のクエリを中断する
 * @returns 中断処理完了時にresolveするPromise
 */
abort(): Promise<void>;
```

### ファイル 2: `apps/desktop/src/preload/types.ts`

```typescript
// Before（行1289）
abort: () => void;

// After（行1289）
abort: () => Promise<void>;
```

## 2.3 safeInvoke と ipcRenderer.invoke の戻り値型

### safeInvoke の型定義

```typescript
// apps/desktop/src/preload/index.ts
function safeInvoke<T>(channel: string, ...args: unknown[]): Promise<T> {
  if (!ALLOWED_CHANNELS.includes(channel)) {
    console.error(`Blocked IPC call to disallowed channel: ${channel}`);
    return Promise.reject(new Error(`Channel not allowed: ${channel}`));
  }
  return ipcRenderer.invoke(channel, ...args);
}
```

**重要ポイント**:

- `safeInvoke<T>` は常に `Promise<T>` を返す
- これは `ipcRenderer.invoke` の戻り値型と一致
- `abort()` は `safeInvoke(IPC_CHANNELS.AGENT_ABORT)` を呼び出すため、戻り値は `Promise<void>`

### IPC通信フロー

```
Renderer:
  window.agentSDKAPI.abort()
    ↓
Preload:
  safeInvoke(IPC_CHANNELS.AGENT_ABORT)
    → ipcRenderer.invoke("agent:abort")
    → Promise<void> を返す
    ↓
Main:
  ipcMain.handle("agent:abort", handleAbort)
    → handleAbort() が void を返す
    → invoke は Promise<void> として解決
```

## 2.4 エラーハンドリングパターン

### Promise チェーン

```typescript
agentSDKAPI
  .abort()
  .then(() => {
    console.log("Abort completed");
  })
  .catch((error) => {
    console.error("Abort failed:", error);
  });
```

### async/await

```typescript
async function handleAbort() {
  try {
    await agentSDKAPI.abort();
    console.log("Abort completed");
  } catch (error) {
    console.error("Abort failed:", error);
  }
}
```

## 2.5 後方互換性

### なぜ後方互換性が保たれるか

| 観点                  | 説明                         |
| --------------------- | ---------------------------- |
| void → Promise<void>  | サブタイプ関係により後方互換 |
| 既存呼び出しへの影響  | 戻り値未使用の場合、変更不要 |
| TypeScript 型チェック | 厳密な型チェックでも問題なし |

### 呼び出し箇所の分析

| ファイル               | 行      | 戻り値使用 | 変更要否 |
| ---------------------- | ------- | ---------- | -------- |
| agent-handler.ts       | 84, 100 | 未使用     | 不要     |
| AgentSDKPage/index.tsx | 305     | 未使用     | 不要     |
| useAgent.ts            | 170     | 未使用     | 不要     |

## 2.6 P23パターン（API二重定義の型管理）準拠

### 06-known-pitfalls.md P23からの教訓

> `window.skillAPI` と `window.electronAPI.skill` の両方に同じメソッドが存在する場合、
> 型定義ファイル（types.ts, types.d.ts）の両方を同時に更新しないと型不整合が発生する

### 本タスクでの適用

| ファイル                           | 行   | 変更内容                      |
| ---------------------------------- | ---- | ----------------------------- |
| packages/shared/src/agent/types.ts | 237  | `abort(): Promise<void>;`     |
| apps/desktop/src/preload/types.ts  | 1289 | `abort: () => Promise<void>;` |

**重要**: 2ファイルを必ず同一コミットで更新

## 2.7 テスト戦略

### 作成したテスト（24件）

| テストカテゴリ     | テスト数 | 検証内容                            |
| ------------------ | -------- | ----------------------------------- |
| 型検証             | 6        | Promise.resolve/reject の型チェック |
| 戻り値検証         | 6        | instanceof Promise, thenable 確認   |
| エラーハンドリング | 6        | catch, try-catch, reject 処理       |
| 統合テスト         | 6        | IPC経由の実際の呼び出し             |

### テストファイル

- `apps/desktop/src/preload/__tests__/agentSDKAPI.abort.test.ts` - 24テスト
- `apps/desktop/src/preload/__tests__/agentSDKAPI.types.test.ts` - 1テスト（既存）

## 2.8 関連ドキュメント

| ドキュメント            | 関連セクション                |
| ----------------------- | ----------------------------- |
| 06-known-pitfalls.md    | P23: API二重定義の型管理      |
| 04-electron-security.md | IPCセキュリティ原則           |
| interfaces-agent-sdk.md | AgentAPI インターフェース定義 |

## 2.9 変更サマリー

### 修正ファイル（2件）

1. `packages/shared/src/agent/types.ts` 行237
   - `abort(): void;` → `abort(): Promise<void>;`

2. `apps/desktop/src/preload/types.ts` 行1289
   - `abort: () => void;` → `abort: () => Promise<void>;`

### 追加ファイル（2件）

1. `apps/desktop/src/preload/__tests__/agentSDKAPI.abort.test.ts` - 24テスト
2. `apps/desktop/src/preload/__tests__/agentSDKAPI.types.test.ts` - 1テスト追加

### 品質検証結果

| 項目                | 結果        |
| ------------------- | ----------- |
| 型チェック          | PASS        |
| Lintエラー          | 0件         |
| 全テスト            | PASS        |
| Phase 10 レビュー   | PASS        |
| Phase 11 手動テスト | PASS (22件) |
