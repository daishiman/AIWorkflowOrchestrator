# クイックリファレンス

> 最重要情報への即時アクセス
> 詳細は resource-map.md → 該当ファイル を参照

---

## よく使うパターン

### 仕様検索の分割ルール

- `search-spec.js` は **1概念1クエリ** で分割して使う
- 例: `TASK-10A-F useSkillAnalysis SkillCreateWizard` のようにまとめず、`TASK-10A-F` → `useSkillAnalysis` → `SkillCreateWizard` → `skillError` の順で個別検索する
- broad query が 0 件でも、resource-map / quick-reference / topic-map から再入場して取りこぼしを防ぐ

### Preload safeInvoke timeout を探すとき

```bash
node scripts/search-spec.js "safeInvoke" -C 3
node scripts/search-spec.js "IPC timeout" -C 3
node scripts/search-spec.js "preload invoke hang" -C 3
```

読む順番:

1. `indexes/resource-map.md` の「バグ修正（Preload safeInvoke timeout / invoke hang）」を見る
2. `references/security-electron-ipc.md` の Preload `safeInvoke` timeout セクションを見る
3. `references/architecture-implementation-patterns.md` の invoke hang containment パターンを見る
4. `references/ipc-contract-checklist.md` で channel / payload / whitelist の崩れがないか確認する

### Electron IPC パターン

```typescript
// Main Process Handler
ipcMain.handle("xxx:action", async (event, request) => {
  return { success: true, data: result };
});

// Preload API
contextBridge.exposeInMainWorld("xxxAPI", {
  action: (req) => ipcRenderer.invoke("xxx:action", req),
});

// React Hook
const result = await window.xxxAPI.action(request);
```

**詳細**: architecture-patterns.md L620-905, security-api-electron.md

### IPC transport DTO 正本化パターン

```typescript
// shared transport DTO を唯一の正本にする
export type IPCResponse<T> =
  | { success: true; data?: T }
  | { success: false; error: { code: string; message: string } };

// Main / Preload / Renderer は再定義せず import / re-export する
```

| 確認項目 | 期待値 |
|---------|--------|
| request / response / event | `packages/shared/src/types/*` の DTO と一致 |
| Preload 公開型 | local 再定義ではなく shared 型の import / re-export |
| error envelope | `success` / `data` / `error.code` / `error.message` / `guidance?` が一致 |

**詳細**: api-ipc-system.md, interfaces-auth.md, ipc-contract-checklist.md

### IPC ハンドラライフサイクル管理パターン（P5 Main Process 対策）

macOS `activate` イベントでウィンドウ再作成時の二重登録防止:

```typescript
// ❌ 二重登録例外（handle は2回目で例外送出）
app.on("activate", () => {
  mainWindowRef = createWindow();
  registerAllIpcHandlers(mainWindowRef); // Error!
});

// ✅ unregister → createWindow → register の3ステップ
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    unregisterAllIpcHandlers();           // Step 1: 全解除
    mainWindowRef = createWindow();       // Step 2: 新ウィンドウ
    registerAllIpcHandlers(mainWindowRef); // Step 3: 再登録
  }
});
```

| API | 二重登録時の動作 | 解除API |
|-----|-----------------|---------|
| `ipcMain.handle()` | 例外送出 | `removeHandler()` |
| `ipcMain.on()` | リスナー累積 | `removeAllListeners()` |

**詳細**: security-electron-ipc.md（IPC ハンドラライフサイクル管理）, architecture-implementation-patterns.md（二重登録防止パターン）
**関連 Pitfall**: 06-known-pitfalls.md#P5

### Supabase 未設定 fallback handler パターン

```typescript
if (getSupabaseClient()) {
  registerAuthHandlers(mainWindow, supabase, secureStorage);
  registerProfileHandlers(mainWindow, supabase, profileCache);
  registerAvatarHandlers(mainWindow, supabase);
} else {
  registerAuthFallbackHandlers();
  registerProfileFallbackHandlers();
  registerAvatarFallbackHandlers();
}
```

| 確認項目 | 期待値 |
| -------- | ------ |
| Profile channels | `profile:*` 11チャネルを fallback 配列へ全件登録 |
| Avatar channels | `avatar:*` 3チャネルを fallback 配列へ全件登録 |
| error envelope | `{ success: false, error: { code, message } }` に統一し、`PROFILE_ERROR_CODES.NOT_CONFIGURED` / `AVATAR_ERROR_CODES.NOT_CONFIGURED` を返す |
| registration | `ReadonlyArray` + `for...of` で宣言的登録 |
| lifecycle | 通常経路と fallback 経路を if/else 排他にする |

**詳細**: api-ipc-auth.md, architecture-auth-security.md, security-electron-ipc.md, ipc-contract-checklist.md
**完了タスク**: TASK-FIX-SUPABASE-FALLBACK-PROFILE-AVATAR-001（Profile 11ch / Avatar 3ch の fallback 実装完了）

### Result Pattern

```typescript
type Result<T, E> = { success: true; data: T } | { success: false; error: E };
```

**詳細**: interfaces-core.md L70-105

### Zustand Slice

```typescript
export const createXxxSlice: StateCreator<XxxSlice> = (set) => ({
  // state
  data: null,
  // actions
  setData: (data) => set({ data }),
});
```

**詳細**: architecture-patterns.md L141-234

### P31対策: Store Hooks無限ループ防止

合成Store Hook（`useAuthModeStore()`等）が毎回新しいオブジェクトを返すため、関数を`useEffect`依存配列に含めると無限ループ発生。

| 対策 | 方法 | 適用場面 |
|------|------|---------|
| 短期 | `useRef`ガード + 空の依存配列 | 既存コード緊急修正 |
| 長期 | 個別セレクタ再設計 | 新規実装時 |

```typescript
// ❌ 無限ループ
const { initializeAuthMode } = useAuthModeStore();
useEffect(() => { initializeAuthMode(); }, [initializeAuthMode]);

// ✅ useRefガード
const initRef = useRef(false);
useEffect(() => {
  if (!initRef.current) { initRef.current = true; initializeAuthMode(); }
}, []); // P31対策: 意図的に空の依存配列
```

**詳細**:
- 設計原則: arch-state-management.md L156-245
- 成功パターン: patterns.md（Zustand Store Hooks 無限ループ対策）
- 落とし穴: 06-known-pitfalls.md#P31

### Store selector migration / renderer direct IPC removal

```typescript
// before
const result = await window.electronAPI.skill.analyze(skillName);

// after
const analyzeSkill = useAnalyzeSkill();
await analyzeSkill(skillName);
```

| 確認項目 | 期待値 |
|---------|--------|
| 対象 | Renderer 直呼び出しを Store action / 個別セレクタへ寄せる |
| state 境界 | 共有 state は Store、UI 一時 state は local |
| 検索語 | `TASK-10A-F`, `store-driven lifecycle`, `selector migration`, `renderer direct IPC removal` |

**詳細**: arch-state-management.md, architecture-implementation-patterns.md, task-workflow.md, lessons-learned.md

### ChatPanel統合パターン（TASK-7D）

```typescript
// 条件レンダーでSkillStreamingViewを統合
{isExecuting && selectedSkillName && (
  <SkillStreamingView skillName={selectedSkillName} />
)}

// forwardRef + useImperativeHandle で外部API公開
const ChatPanel = forwardRef<ChatPanelHandle, ChatPanelProps>((props, ref) => {
  useImperativeHandle(ref, () => ({ handleImportRequest }));
});

// DisplayableStatus型（idle除外の厳密なステータス）
type DisplayableStatus = Exclude<SkillExecutionStatus, "idle">;

// Store個別セレクタで再レンダー最適化
const isExecuting = useAppStore((s) => s.skill.isExecuting);
const selectedSkillName = useAppStore((s) => s.skill.selectedSkillName);
```

**詳細**: interfaces-agent-sdk-ui.md, ui-ux-agent-execution.md, ui-ux-feature-components.md

---

## 型定義クイックアクセス

| 用途               | 型名                          | ファイル                   |
| ------------------ | ----------------------------- | -------------------------- |
| API結果            | `OperationResult<T>`          | interfaces-core.md         |
| IPC transport      | `IPCResponse<T>`              | interfaces-auth.md         |
| 認証方式状態       | `AuthModeStatus`              | interfaces-auth.md         |
| スキル情報         | `Skill`, `SkillMetadata`      | interfaces-agent-sdk.md    |
| チャットメッセージ | `ChatMessage`                 | interfaces-llm.md          |
| 会話セッション     | `ChatSession`                 | interfaces-chat-history.md |
| RAG検索結果        | `SearchResult`                | interfaces-rag-search.md   |
| エラー             | `AppError`, `ValidationError` | error-handling.md          |

---

## IPCチャンネル早見表

### 認証・ユーザー

| チャンネル         | 用途           |
| ------------------ | -------------- |
| `auth:get-session` | セッション取得 |
| `auth:sign-out`    | ログアウト     |
| `auth-mode:get`    | 現在の認証方式取得 |
| `auth-mode:set`    | 認証方式の切替 |
| `auth-mode:status` | 現在 mode の資格情報状態取得 |
| `auth-mode:validate` | 対象 mode の有効性検証 |
| `auth-mode:changed` | Main→Renderer の認証方式変更通知 |

### スキル管理

| チャンネル             | 用途           |
| ---------------------- | -------------- |
| `skill:list-available` | スキルスキャン |
| `skill:list-imported`  | インポート済み |
| `skill:execute`        | スキル実行     |
| `skill:permission`     | 権限確認       |

### チャット

| チャンネル       | 用途           |
| ---------------- | -------------- |
| `chat:send`      | メッセージ送信 |
| `chat:stream`    | ストリーミング |
| `conversation:*` | 会話履歴管理   |

**詳細**: api-endpoints.md L126-736

---

## ディレクトリ構成早見表

```
apps/
  desktop/
    src/
      main/           # Electron Main Process
        services/     # ビジネスロジック
        ipc/          # IPCハンドラ
        settings/     # 設定管理
      renderer/       # React UI
        store/        # Zustand
        views/        # ページ
        components/   # 共通コンポーネント
      preload/        # Preload API
  web/                # Next.js (将来)
packages/
  shared/             # 共通型・ユーティリティ
    src/types/        # 型定義
  ui/                 # UIコンポーネント
```

**詳細**: directory-structure.md

---

## エラーコード早見表

| プレフィックス | 種別             | 例                     |
| -------------- | ---------------- | ---------------------- |
| ERR_1xxx       | システムエラー   | ERR_1001 INTERNAL      |
| ERR_2xxx       | 認証・認可       | ERR_2006 UNAUTHORIZED  |
| ERR_3xxx       | バリデーション   | ERR_3001 INVALID_INPUT |
| ERR_4xxx       | ビジネスロジック | ERR_4001 NOT_FOUND     |

**詳細**: error-handling.md L8-230

---

## テスト基準早見表

| メトリクス        | 必須 | 推奨 |
| ----------------- | ---- | ---- |
| Line Coverage     | 80%  | 90%+ |
| Branch Coverage   | 75%  | 85%+ |
| Function Coverage | 90%  | 100% |

**詳細**: quality-requirements.md L94-256

---

## セキュリティチェックリスト

- [ ] 入力バリデーション（Zod）
- [ ] IPCチャンネルホワイトリスト
- [ ] XSS対策（DOMPurify）
- [ ] パストラバーサル防止
- [ ] 機密情報ログ出力禁止

**詳細**: security-implementation.md, security-api-electron.md

---

## 新機能追加フロー

1. **型定義**: `packages/shared/src/types/`
2. **サービス**: `apps/desktop/src/main/services/`
3. **IPCハンドラ**: `apps/desktop/src/main/ipc/`
4. **Preload API**: `apps/desktop/src/preload/`
5. **React Hook**: `apps/desktop/src/renderer/hooks/`
6. **UIコンポーネント**: `apps/desktop/src/renderer/components/`
7. **テスト**: 各ディレクトリの`__tests__/`

**詳細**: architecture-patterns.md L8-74

---

## 仕様書テンプレート選択

| 作成対象                  | テンプレート               |
| ------------------------- | -------------------------- |
| インターフェース/型定義   | interfaces-template.md     |
| アーキテクチャ/パターン   | architecture-template.md   |
| API/エンドポイント        | api-template.md            |
| Electron IPC              | ipc-channel-template.md    |
| React Hook                | react-hook-template.md     |
| サービス/ビジネスロジック | service-template.md        |
| UIコンポーネント          | ui-ux-template.md          |
| テスト仕様                | testing-template.md        |
| エラーハンドリング        | error-handling-template.md |
| セキュリティ              | security-template.md       |
| データベース              | database-template.md       |
| デプロイ/CI/CD            | deployment-template.md     |
| 技術スタック              | technology-template.md     |
| Claude Code               | claude-code-template.md    |
| ワークフロー              | workflow-template.md       |
| 汎用                      | spec-template.md           |

---

## 関連ドキュメント

| ドキュメント                 | 用途                      |
| ---------------------------- | ------------------------- |
| resource-map.md              | タスク種別→ファイル逆引き |
| topic-map.md                 | セクション・行番号詳細    |
| spec-guidelines.md           | 仕様書作成ルール          |
| spec-splitting-guidelines.md | ファイル分割ルール        |
