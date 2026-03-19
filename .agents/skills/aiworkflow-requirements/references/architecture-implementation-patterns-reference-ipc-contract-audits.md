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

## IPCチャネル命名監査の運用パターン（UT-IPC-CHANNEL-NAMING-AUDIT-001 2026-02-25実施）

### 問題

チャネル命名規則を策定しても、横断監査を定期実行しないと「対象内完了」と「対象外ノイズ（例: AUTH重複式）」が混在し、完了判定と未タスク化の境界が曖昧になる。

### 解決パターン

#### 1. 監査結果を 3 区分で分類する

| 区分         | 判定                   | 対応               |
| ------------ | ---------------------- | ------------------ |
| 対象内・重大 | 仕様/実装ブロッカー    | 現タスクで即時是正 |
| 対象内・軽微 | 命名揺れ/記述不足      | リネーム計画に登録 |
| 対象外・軽微 | 別ドメイン由来のノイズ | 未タスクへ分離登録 |

#### 2. 台帳更新を同一ターンで実施する

1. `task-workflow.md` の対象行を完了化（`spec_created` を含む）
2. 新規未タスクがある場合は `unassigned-task/` に指示書を作成
3. `verify-unassigned-links.js` 実行でリンク切れを機械検証

#### 3. 重複式ノイズの再発防止コマンドを固定化する

```bash
# AUTH系 handle 登録の重複式確認
rg -n "ipcMain\\.handle\\(IPC_CHANNELS\\.AUTH_" apps/desktop/src/main/ipc

# チャネル命名監査の対象/対象外を分離確認
jq '.duplicateHandlers | length' /tmp/ut-ipc-usage-analysis.json
jq '[.duplicateHandlers[] | select(.expr | test("SKILL"))] | length' /tmp/ut-ipc-usage-analysis.json
```

### 適用指針

- 仕様書修正のみタスクでも、`Step 1-A/1-C/1-D`（完了記録・関連台帳・索引再生成）を省略しない。
- 「対象外の検出」を理由に完了判定を遅延させず、未タスク分離で追跡性を維持する。
- 未タスク化した項目は、元タスクの Phase 12 レポートと `task-workflow.md` の双方から辿れる状態にする。

---

## 未タスク監査スコープ分離パターン（UT-IMP-UNASSIGNED-AUDIT-SCOPE-CONTROL-001）

### 問題

未タスク監査を全体実行のみで運用すると、既存違反（baseline）が今回変更（current）の合否判定を覆い隠し、Phase 12 の完了判定が不安定になる。

### 解決パターン

#### 1. 判定軸を current / baseline に分離する

| 監査モード | コマンド                                                | 用途                       | fail条件                      |
| ---------- | ------------------------------------------------------- | -------------------------- | ----------------------------- |
| 対象監査   | `audit-unassigned-tasks.js --json --target-file <path>` | 今回変更の合否判定         | `currentViolations.total > 0` |
| 差分監査   | `audit-unassigned-tasks.js --json --diff-from <ref>`    | 複数変更ファイルの合否判定 | `currentViolations.total > 0` |
| 全体監査   | `audit-unassigned-tasks.js --json`                      | 既存資産健全性の監視       | 全体違反 > 0                  |

#### 2. Phase 12 の記録を2段構成で固定する

1. `unassigned-task-detection.md` に current/baseline を分離記録する
2. baseline違反は未タスク化の候補として管理し、今回タスクの完了判定とは分離する

#### 3. 完了済み未タスク指示書の移管を同一ターンで実施する

1. `unassigned-task/` → `completed-tasks/unassigned-task/` へ物理移動
2. `task-workflow.md` の参照パスを同期更新
3. `verify-unassigned-links.js` で参照整合を確認

#### 4. Phase 12 準拠確認チェーン（skill-creator連携）を固定する

```bash
# 1) 仕様準拠
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/<workflow> --strict
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/<workflow>

# 2) 未タスク参照整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source .claude/skills/aiworkflow-requirements/references/task-workflow.md

# 3) スキル構造検証（system skill-creator）
node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
```

### 適用指針

- full監査結果をそのまま「今回差分fail」と解釈しない。
- 完了判定は current、負債管理は baseline に責務分離する。
- 台帳更新と物理移管を同一ターンで処理し、運用ドリフトを防止する。

---

## 共有型インポート標準パターン（TASK-10A-D）

### 問題

Electron 3プロセスモデル（Main/Preload/Renderer）で型定義が各層に分散すると、型不整合の発見が遅延する。特に Renderer 側で `unknown[]` プレースホルダ型を使用した場合、コンパイルは通るが実行時に型不一致が顕在化する（P23/P24/P32 の繰り返しパターン）。

### 解決パターン

#### 1. 型定義の配置ルール

| 型の種類           | 配置先                                           | 例                                            |
| ------------------ | ------------------------------------------------ | --------------------------------------------- |
| ドメインモデル型   | `@repo/shared` (`packages/shared/src/`)          | `Skill`, `SkillLifecycleState`, `Suggestion`  |
| Store Slice 状態型 | `@repo/shared` からimport + Slice固有の拡張      | `AgentSliceState extends { skills: Skill[] }` |
| Preload API 型     | `apps/desktop/src/preload/types.ts`              | `ElectronSkillAPI`, `SkillBridgeAPI`          |
| IPC ハンドラ引数型 | Main Process 内で定義、`@repo/shared` の型を参照 | `handler(event, skillName: string)`           |

#### 2. 新規型追加時のチェックリスト

1. `@repo/shared` に型定義を追加
2. `pnpm --filter @repo/shared build` で共有パッケージをビルド
3. Preload `types.ts` の API 型定義を更新
4. Store Slice の型を `@repo/shared` からの import に変更
5. `pnpm typecheck` で全パッケージの型整合性を検証

#### 3. 禁止パターン

| 禁止パターン                        | 理由                                       | 正しいパターン                     |
| ----------------------------------- | ------------------------------------------ | ---------------------------------- |
| `unknown[]` プレースホルダ型        | 型安全性が失われ、実行時エラーの発見が遅延 | `@repo/shared` から具体型をimport  |
| Slice 内での独自型定義              | Store と Preload で型が乖離する            | `@repo/shared` の型をre-export     |
| `as unknown as TargetType` キャスト | 型不整合を隠蔽する                         | 共有型を統一してキャスト不要にする |

### 適用指針

- 新規 IPC チャネル追加時は P23/P32 準拠で `@repo/shared` → Preload → Store の順に型を定義する
- 既存の `unknown[]` 型は発見次第、具体型への置換を未タスク化する
- `pnpm typecheck` は型変更後に必ず全パッケージ（`--filter @repo/shared && --filter @repo/desktop`）で実行する

---

## IPC レスポンス Wrapper パターン（UT-06-003 2026-03-17実装）

### S35: IPC ハンドラレスポンスの統一 Wrapper 形式

> **発見タスク**: UT-06-003
> **関連Pitfall**: P60（IPC テスト応答形式の不一致）

#### 問題

IPC ハンドラのレスポンス形式が統一されていないと、テスト設計（Phase 4）と実装（Phase 5）の間でアサーション形式が乖離する。フラットな `{ code, message }` 形式を期待するテストに対して、実装が `{ success, error: { code, message } }` の wrapper 形式を返すと、全テストの修正が必要になる。

#### 解決策

IPC ハンドラのレスポンスは以下の統一 wrapper 形式を使用する。

```typescript
// 成功レスポンス
interface IPCSuccessResponse<T> {
  success: true;
  data: T;
}

// エラーレスポンス
interface IPCErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type IPCResponse<T> = IPCSuccessResponse<T> | IPCErrorResponse;
```

#### テスト設計時の必須確認事項

| チェック項目 | 確認方法 |
| --- | --- |
| 既存ハンドラのレスポンス形式 | `grep -rn "success:" apps/desktop/src/main/handlers/` |
| wrapper 形式の統一性 | Phase 2 設計書にレスポンス型を明記 |
| テストアサーション | `result.error.code` 形式で記述 |

#### コード例

```typescript
// IPC ハンドラ実装
ipcMain.handle("safety-gate:validate", async (_event, args) => {
  try {
    const result = await safetyGate.validateToolExecution(args);
    return { success: true, data: result };
  } catch (error: unknown) {
    // P49 準拠: in 演算子パターンでエラーを検証
    if (
      error != null &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string"
    ) {
      return { success: false, error: { code: error.code, message: String(error.message ?? "") } };
    }
    return { success: false, error: { code: "INTERNAL_ERROR", message: "Unknown error" } };
  }
});

// テストアサーション（wrapper 形式に合わせる）
expect(result).toEqual({
  success: false,
  error: { code: "VALIDATION_ERROR", message: expect.any(String) },
});
```

#### 適用基準

| 条件 | 適用 |
| --- | --- |
| 新規 IPC ハンドラ | 必須（wrapper 形式を使用） |
| 既存 IPC ハンドラ | 変更時に wrapper 形式へ統一を推奨 |
| Phase 4 テスト設計 | Phase 2 のレスポンス型定義を参照して記述 |

---

