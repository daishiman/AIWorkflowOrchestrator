# 実装パターン総合ガイド / reference bundle

> 親仕様書: [architecture-implementation-patterns.md](architecture-implementation-patterns.md)
> 役割: reference bundle

## IPC データフロー型ギャップパターン（UT-IPC-DATA-FLOW-TYPE-GAPS-001 2026-02-24実装）

### S19: IPC Date型シリアライズパターン

> **発見タスク**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
> **関連Pitfall**: なし（新規パターン）

#### 問題

IPC境界（Main Process ↔ Renderer）でDate型フィールドを送信する際、JSONシリアライズにより型情報が失われる。JavaScript の `JSON.stringify(new Date())` は文字列を返すが、形式が実装依存になるリスクがある。

#### 解決策

ISO 8601文字列を統一基準として採用し、Main Process側で明示的に `.toISOString()` で変換する。

```typescript
// Main Process（ハンドラ戻り値）
interface SkillScheduleResponse {
  nextRun: string; // ISO 8601
  lastRun: string | null; // ISO 8601, nullable
  createdAt: string; // ISO 8601
}

const response: SkillScheduleResponse = {
  nextRun: schedule.nextRun.toISOString(),
  lastRun: schedule.lastRun?.toISOString() ?? null,
  createdAt: schedule.createdAt.toISOString(),
};

// Renderer側（受信後の復元）
const nextRun = new Date(response.nextRun);
const lastRun = response.lastRun ? new Date(response.lastRun) : null;
```

#### 適用基準

| 条件                            | 適用                                 |
| ------------------------------- | ------------------------------------ |
| IPC境界を越えるDate型フィールド | 必須                                 |
| 同一プロセス内のDate型          | 不要（Date型のまま使用）             |
| nullable な Date フィールド     | `string \| null; // ISO 8601` と定義 |

#### 仕様書での型注記

仕様書レベルでは、Date型フィールドに `// ISO 8601` コメントを付与する：

```typescript
interface BackendType {
  scheduledAt: Date; // バックエンド側の型
}

interface IPCResponseType {
  scheduledAt: string; // ISO 8601（IPC送信用）
}
```

### S20: IPC引数object形式統一パターン

> **発見タスク**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
> **関連Pitfall**: P44（引数型不整合）, P45（引数命名ドリフト）

#### 問題

positional形式（`safeInvoke(channel, arg1, arg2)`）のIPC引数は、引数の順序を間違えたり、引数名のセマンティクスが不明確になるリスクがある。P44/P45で発見されたインターフェース不整合は、全てpositional形式に起因していた。

#### 解決策

全IPC引数をobject形式に統一し、Args型定義を新規作成する。

```typescript
// ❌ positional形式（P44リスク）
safeInvoke("skill:editor:read", skillName, relativePath);

// ✅ object形式 + Args型定義
interface SkillEditorReadArgs {
  skillName: string;
  relativePath: string;
}

safeInvoke("skill:editor:read", {
  skillName,
  relativePath,
} satisfies SkillEditorReadArgs);

// ハンドラ側（P42準拠3段バリデーション）
ipcMain.handle(
  "skill:editor:read",
  async (event, args: SkillEditorReadArgs) => {
    // フィールドごとに3段バリデーション
    if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }
    if (
      typeof args?.relativePath !== "string" ||
      args.relativePath.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "relativePath must be a non-empty string",
      };
    }
    return service.readFile(args.skillName.trim(), args.relativePath.trim());
  },
);
```

#### Args型定義テンプレート

```typescript
// 命名規則: {Channel}Args（例: SkillEditorReadArgs）
interface {Channel}Args {
  // フィールド名は実際の値のセマンティクスに合致させる（P45対策）
  fieldName: string;  // 必須フィールド
  optionalField?: string;  // オプショナルフィールド
}
```

#### 移行時の注意点

1. Preload側とHandler側を同時に変更する（P23/P32準拠）
2. テストの引数も新しいobject形式に更新する
3. 内部サービスメソッドの引数名もセマンティクスに合わせて統一する（P45対策）

### S21: 仕様書間型ギャップ検出パターン

> **発見タスク**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
> **関連Pitfall**: なし（新規パターン）

#### 問題

バックエンド型定義（task-9a〜task-9j）とフロントエンドProps定義（task-030, task-031b）の間に、以下のカテゴリの型ギャップが潜在する：

| ギャップカテゴリ       | 説明                                               | 検出方法                            |
| ---------------------- | -------------------------------------------------- | ----------------------------------- |
| Date型シリアライズ     | IPC境界でのDate→string変換未定義                   | `grep -c "Date" task-*.md`          |
| 状態値セット不一致     | バックエンドとフロントエンドのenum値セットが異なる | 型定義の目視比較                    |
| コールバック引数不明確 | UIコンポーネントのコールバック引数が仕様書で未定義 | Props定義とイベントハンドラの照合   |
| 変換ロジック未記載     | バックエンド戻り値→UI表示の変換ロジックが不在      | データフローの端点追跡              |
| 購読パターン未定義     | safeOnのcleanupやStrictMode対策が未記載            | useEffect内のIPC購読パターン検索    |
| 引数形式不整合         | positional vs object形式の不一致                   | `grep -c "safeInvoke.*," task-*.md` |

#### 検出手順

1. バックエンド仕様書の全型定義をリストアップ
2. フロントエンド仕様書のProps定義をリストアップ
3. 型名の対応表を作成（例: `SkillSchedule` ↔ `ScheduleViewProps`）
4. 各対応ペアのフィールド型を比較し、ギャップを分類
5. ギャップマトリクス（Gap×ファイル）を作成
6. Gap別に修正→ファイル間検証のサイクルで修正

#### 検証コマンド例

```bash
# Date型フィールドの数を各ファイルで確認
for f in task-9*.md; do echo "$f: $(grep -c 'Date' $f)"; done

# ISO 8601注記の追加状況を確認
grep -c "ISO 8601" task-*.md

# positional引数パターンの検出
grep -n "safeInvoke.*,.*," task-*.md

# object形式引数パターンの確認
grep -n "safeInvoke.*{" task-*.md
```

### S22: AUTH IPC登録一元化パターン（UT-IPC-AUTH-HANDLE-DUPLICATE-001 2026-02-25実装）

> **発見タスク**: UT-IPC-AUTH-HANDLE-DUPLICATE-001
> **関連Pitfall**: P5（二重登録）, P44（契約ドリフト）, P45（命名ドリフト）

#### 問題

AUTH系IPCでは、通常経路（Supabaseあり）とfallback経路（Supabaseなし）で
`ipcMain.handle` の登録式が重複しやすく、監査ノイズと修正漏れの原因になる。

#### 解決策

通常経路は共通登録ヘルパー、fallback経路は配列定義 + ループ登録に統一する。

```typescript
// 通常経路: authHandlers.ts
const registerValidatedAuthHandler = <TArgs extends unknown[]>(
  channel: AuthInvokeChannel,
  handler: (event: IpcMainInvokeEvent, ...args: TArgs) => Promise<unknown>,
): void => {
  ipcMain.handle(
    channel,
    withValidation(channel, handler, { getAllowedWindows: () => [mainWindow] }),
  );
};

registerValidatedAuthHandler(IPC_CHANNELS.AUTH_LOGIN, async (_event, args) => {
  /* ... */
});

// fallback経路: ipc/index.ts
const fallbackAuthHandlers: ReadonlyArray<
  readonly [string, () => Promise<unknown>]
> = [
  [IPC_CHANNELS.AUTH_LOGIN, async () => notConfiguredResponse],
  [IPC_CHANNELS.AUTH_LOGOUT, async () => notConfiguredResponse],
  [IPC_CHANNELS.AUTH_GET_SESSION, async () => ({ success: true, data: null })],
  [IPC_CHANNELS.AUTH_REFRESH, async () => notConfiguredResponse],
  [
    IPC_CHANNELS.AUTH_CHECK_ONLINE,
    async () => ({ success: true, data: { online: net.isOnline() } }),
  ],
];

for (const [channel, handler] of fallbackAuthHandlers) {
  ipcMain.handle(channel, handler);
}
```

#### 適用チェックリスト

- [ ] 通常経路/ fallback 経路の両方で AUTH 5チャネルが過不足なく登録される
- [ ] `ipcMain.handle(IPC_CHANNELS.AUTH_*)` の重複直書きを残さない
- [ ] 既存契約（引数/戻り値/エラーコード）を変更しない
- [ ] fallback回帰テスト（`auth:get-session`, `auth:check-online`）を追加する

#### 検証コマンド

```bash
rg -n "ipcMain\\.handle\\(\\s*IPC_CHANNELS\\.AUTH_" \
  apps/desktop/src/main/ipc/authHandlers.ts \
  apps/desktop/src/main/ipc/index.ts
```

期待結果: 0件

#### 再利用テンプレート（目的/場所/検証）

| Step | 目的     | 場所                                        | 実行                                                  | 成功基準                                        |
| ---- | -------- | ------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| 1    | 対象固定 | `apps/desktop/src/main/ipc/`                | AUTH 5チャネルを2経路（通常/fallback）で列挙          | 対象漏れ0件                                     |
| 2    | 実装修正 | `authHandlers.ts`, `index.ts`               | 通常=共通登録ヘルパー、fallback=配列/ループ登録へ統一 | `ipcMain.handle(IPC_CHANNELS.AUTH_*)` 直書き0件 |
| 3    | 回帰検証 | `__tests__/ipc-double-registration.test.ts` | fallback含む重複登録防止テスト実行                    | PASS                                            |
| 4    | 仕様同期 | `references/` + `task-workflow.md`          | 実装内容/苦戦箇所/完了記録を同一ターンで更新          | リンク切れ0件                                   |

| 監査の落とし穴                       | 対処                                             |
| ------------------------------------ | ------------------------------------------------ |
| 全体監査FAILをそのまま差分FAILと扱う | baseline（全体）と current（変更範囲）を分離判定 |
| 完了移管後の参照更新漏れ             | `verify-unassigned-links.js` を完了条件に固定    |

---



---

## 続き

後半コンテンツは分割ファイルを参照:
- [architecture-implementation-patterns-reference-ipc-naming.md](architecture-implementation-patterns-reference-ipc-naming.md) — IPCチャネル命名監査パターン以降
