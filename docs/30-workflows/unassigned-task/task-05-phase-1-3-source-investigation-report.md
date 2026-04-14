# Task05 ソースコード調査レポート

## メタ情報

```yaml
issue_number: 2158
task_id: TASK-05-SOURCE-INVESTIGATION
```

| 項目     | 内容                                           |
| -------- | ---------------------------------------------- |
| 調査ID   | TASK-05-SOURCE-INVESTIGATION                   |
| 調査対象 | SkillDocGenerator と IPC 層の現状把握          |
| 調査日   | 2026-03-16                                     |
| 調査員   | source-researcher (task #3)                    |
| 目的     | Phase 1-3 仕様書作成前の現状把握とギャップ分析 |

---

## 調査結果サマリー

### 1. stubQueryFn の現状

#### **場所**

`apps/desktop/src/main/ipc/index.ts` (L786-793)

#### **実装内容**

```typescript
const stubQueryFn = async (prompt: string) => ({
  content: `Generated content for: ${prompt.slice(0, 50)}`,
});
const skillDocGenerator = new SkillDocGeneratorCls(
  stubQueryFn,
  skillFileManager,
);
registerSkillDocsHandlers(mainWindow, skillDocGenerator);
```

#### **評価**

| 項目                  | 状態 | 詳細                                              |
| --------------------- | ---- | ------------------------------------------------- |
| Constructor Injection | ✅   | DI パターン正しく実装（テスト時モック差し替え可） |
| テスト可能性          | ✅   | `LLMQueryFn` 型で抽象化済み                       |
| 本番実装              | ❌   | **固定値 stub のみ** — 実プロバイダ接続なし       |
| エラー処理            | ❌   | 失敗シナリオ処理なし                              |
| タイムアウト          | ❌   | SkillDocGenerator 側で実装（stub では無視）       |
| APIキー管理           | ❌   | stub では不要だが、本番では未定義                 |

#### **問題点**

- TASK-9I Phase 10 で MINOR 指摘を受けた「暫定実装」が残存
- 本番環境では疑似応答のみ返却される
- 後続タスク（UT-9I-001）との依存関係が未確立

---

### 2. queryFn の型定義

#### **型定義**

ファイル: `SkillDocGenerator.ts` (L18-19)

```typescript
/** LLM query 関数の型（DI用） */
export type LLMQueryFn = (prompt: string) => Promise<{ content: string }>;
```

#### **引数・戻り値仕様**

| 属性 | 形式                           | 説明                         |
| ---- | ------------------------------ | ---------------------------- |
| 入力 | `prompt: string`               | LLM に問い合わせるプロンプト |
| 出力 | `Promise<{ content: string }>` | LLM 応答コンテンツ           |

#### **現状の課題**

1. **IPC バリデーション層との分離**
   - `LLMQueryFn` 型自体に P42 バリデーション指定がない
   - IPC ハンドラ側で `validateStringArg()` で事前検証

2. **エラー型の欠落**
   - 戻り値がただの `Promise<{ content: string }>`
   - エラーケース（API キー未設定・429・5xx）を表現する方法がない
   - 呼び出し側が `throw` で例外処理に頼っている

3. **型定義の二重化リスク（P32 対策）**
   - `@repo/shared` に共有型が定義されていない可能性
   - Main Process と Preload 層で型不整合が発生する可能性

#### **推奨改修**

```typescript
// 拡張案（UT-9I-001 で検討）
export type LLMQueryFn = (
  prompt: string,
) => Promise<
  | { success: true; content: string }
  | { success: false; code: string; message: string }
>;
```

---

### 3. エラーハンドリングの現状

#### **SkillDocGenerator レイヤー** (L248-256)

```typescript
const result = await Promise.race([
  this.queryFn(prompt),
  new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error("LLM query timeout")),
      LLM_TIMEOUT_MS, // 30_000ms
    ),
  ),
]);
```

#### **IPC ハンドラレイヤー** (L1142-1156)

```typescript
catch (error) {
  if (error instanceof Error && error.message.startsWith("Skill not found")) {
    return { success: false, error: error.message };
  }
  if (error instanceof Error && error.message.includes("Document generation failed")) {
    return { success: false, error: "Document generation failed" };
  }
  return { success: false, error: "Internal error" };
}
```

#### **エラーハンドリング機構の評価**

| 機構                | 状態 | 実装内容                      | 評価                                           |
| ------------------- | ---- | ----------------------------- | ---------------------------------------------- |
| タイムアウト        | ✅   | `Promise.race()` + 30秒       | 適切（LLM_TIMEOUT_MS 定数化）                  |
| リトライ            | ❌   | なし                          | UT-9I-001 で追加必須                           |
| レート制限（429）   | ❌   | なし                          | 指数バックオフ実装が必要                       |
| サーバエラー（5xx） | ❌   | なし                          | 一時的エラーの分類が必要                       |
| 汎用化              | ✅   | `sanitizeErrorMessage()` 関数 | スタックトレース・パス・機密情報マスク実装済み |

#### **IPC エラーレスポンス形式**

**現行形式**:

```typescript
{ success: false, error: string }
```

**問題**:

- エラー分類情報がない（UI 側で適切な再試行判定ができない）
- ユーザーへの表示内容がすべて英語の汎用メッセージ（UX 低い）

**推奨改修**:

```typescript
{
  success: false,
  error: string,           // ユーザーメッセージ
  errorCode?: string,      // 分類コード: VALIDATION_ERROR, API_KEY_MISSING, RATE_LIMIT, SERVER_ERROR, TIMEOUT
  retryable?: boolean,     // UI が再試行を提案すべきか
}
```

---

### 4. IPC チャンネルと handler

#### **チャンネル定義**

ファイル: `preload/channels.ts` (L211-214)

```typescript
SKILL_DOCS_GENERATE: "skill:docs:generate",
SKILL_DOCS_PREVIEW: "skill:docs:preview",
SKILL_DOCS_EXPORT: "skill:docs:export",
SKILL_DOCS_TEMPLATES: "skill:docs:templates",
```

#### **ハンドラ登録関数**

ファイル: `skillHandlers.ts` (L1049-1271)

```typescript
export function registerSkillDocsHandlers(
  mainWindow: BrowserWindow,
  skillDocGenerator: SkillDocGenerator,
): void;
```

#### **各ハンドラの実装状況**

| チャンネル           | 実装行 | Sender 検証 | 引数バリデーション | エラー処理 | 評価   |
| -------------------- | ------ | ----------- | ------------------ | ---------- | ------ |
| skill:docs:generate  | 1054   | ✅          | ✅ P42準拠         | ⚠️ 基本的  | 機能的 |
| skill:docs:preview   | 1162   | ✅          | ✅ P42準拠         | ⚠️ 基本的  | 機能的 |
| skill:docs:export    | 1201   | ✅          | ✅ P42準拠         | ⚠️ 基本的  | 機能的 |
| skill:docs:templates | 1253   | ✅          | 簡易               | ⚠️ 基本的  | 機能的 |

#### **バリデーション実装** (L808-819)

```typescript
function validateStringArg(
  value: unknown,
  argName: string,
): { success: false; error: string } | null {
  if (typeof value !== "string" || value.trim() === "") {
    return {
      success: false,
      error: `${argName} must be a non-empty string`,
    };
  }
  return null;
}
```

**評価**:

- ✅ **P42 準拠**: 型チェック → 空文字列 → トリム空文字列 の3段バリデーション実装
- ✅ 再利用可能な関数に抽出済み
- ✅ 許可値リスト検証（`VALID_OUTPUT_FORMATS`, `VALID_LANGUAGES`）

#### **Sender 検証** (L1057-1064)

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_DOCS_GENERATE, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  return toIPCValidationError(validation);
}
```

**評価**:

- ✅ 全ハンドラで実施
- ✅ `getAllowedWindows` コールバック パターン（P5 準拠）

#### **ハンドラ登録・解除**

```typescript
export function unregisterSkillDocsHandlers(): void {
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_GENERATE);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_PREVIEW);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_EXPORT);
  ipcMain.removeHandler(IPC_CHANNELS.SKILL_DOCS_TEMPLATES);
}
```

**評価**:

- ✅ `registerAllIpcHandlers()` で正しく呼び出し
- ✅ 対応する `unregister` 関数も実装（デアクティベーション対応）

---

### 5. terminal handoff の現状

#### **実装状況**

| 対象                | ハンドラ                  | 実装状態        | 分岐ロジック                             |
| ------------------- | ------------------------- | --------------- | ---------------------------------------- |
| skill:execute       | skillHandlers.ts L318-346 | ✅ **実装済み** | RuntimeResolver.resolve() → handoff 判定 |
| skill:docs:generate | skillHandlers.ts L1054    | ❌ **未実装**   | —                                        |
| skill:docs:preview  | skillHandlers.ts L1162    | ❌ **未実装**   | —                                        |

#### **skill:execute の handoff 分岐実装** (L318-346)

```typescript
// Runtime routing: handoff 分岐
if (runtimeResolver) {
  const resolution = await runtimeResolver.resolve();
  if (resolution.type === "handoff") {
    const builder = new TerminalHandoffBuilder();
    const guidance = builder.buildForSkillExecution(
      {
        skillName: hasSkillName ? args.skillName : undefined,
        skillId: hasSkillName ? undefined : args.skillId,
        prompt: hasSkillName ? args.prompt : undefined,
        workingDirectory:
          hasSkillName && typeof args.workingDirectory === "string"
            ? args.workingDirectory
            : undefined,
      },
      resolution.reason,
    );
    const handoffResponse: SkillExecutionResponse = {
      executionId: `handoff-${Date.now()}`,
      success: false,
      error: resolution.reason,
      handoff: true,
      guidance,
    };
    return {
      success: true,
      data: handoffResponse,
    };
  }
}
```

#### **TerminalHandoffBuilder** (services/runtime/TerminalHandoffBuilder.ts)

```typescript
buildForSkillExecution(
  request: SkillHandoffBuildRequest,
  reason: string,
): HandoffGuidance {
  const prompt =
    request.prompt?.trim() ||
    (request.skillName?.trim()
      ? `「${request.skillName}」のスキル実行を続けてください`
      : "最新のコンテキストでスキル実行を続けてください");
  // ...
  return {
    terminalCommand: bundle.suggestedCommand,
    contextSummary: `surface=agent skill=${skillId}`,
    reason,
  };
}
```

#### **評価**

| 項目                   | 状態 | 説明                                    |
| ---------------------- | ---- | --------------------------------------- |
| skill:execute への実装 | ✅   | 完全実装済み                            |
| RuntimeResolver 統合   | ✅   | ipc/index.ts で DI 注入済み（L633-636） |
| handoff ガイダンス生成 | ✅   | TerminalHandoffBuilder で自動生成       |
| docs:generate への拡張 | ❌   | **検討中** — UT-9I-001 で判断予定       |

#### **検討事項**

- docs 生成も handoff 対象か？（長時間実行だと handoff は不要かもしれない）
- handoff 対象だとしても、docs には「skill名」の概念がないため、guidance 生成方法が異なる

---

### 6. UT-9I-001 との関係

#### **親タスク**

- **TASK-9I**: Skill Docs Generator 実装（✅ 完了、Phase 10 MINOR 指摘あり）

#### **UT-9I-001 仕様書の位置付け**

ファイル: `docs/30-workflows/completed-tasks/TASK-9I-skill-docs/unassigned-task/task-ut-9i-001-llm-provider-integration.md`

#### **UT-9I-001 の構成**

| Phase | 名称     | 目的                             | 本タスク（Task05）との関係                 |
| ----- | -------- | -------------------------------- | ------------------------------------------ |
| A     | 設計     | プロバイダ選定・失敗ポリシー定義 | **前提条件** — Task05 Phase 1 で実施すべき |
| B     | 実装     | LLMQueryFn 実装 + DI 接続        | **実装対象** — Task05 Phase 5 で実施       |
| C     | 検証     | 失敗系含むテスト                 | **テスト対象** — Task05 Phase 4/6 で実施   |
| D     | 仕様同期 | 6仕様書更新 + topic-map 再生成   | **Phase 12 対象**                          |

#### **UT-9I-001 から Task05 への要件波及**

**要件1: プロバイダ選定**

```
UT-9I-001 Phase A で「OpenAI か Anthropic か Gemini か」を決定
→ Task05 Phase 1 で「接続対象 API」として仕様化
```

**要件2: 失敗シナリオ定義**

```
UT-9I-001 Phase A で以下を決定:
- APIキー未設定時の動作
- HTTP 429（レート制限）時の再試行ポリシー
- HTTP 5xx（サーバエラー）時のフォールバック
- ネットワークタイムアウト時の判定基準
→ Task05 Phase 1 で「エラー分類コード」と「UI 表示形式」として仕様化
```

**要件3: DI 注入ポイント**

```
UT-9I-001 Phase B で実装される:
- LLM プロバイダ接続コード（e.g., llm-client.ts）
- ipc/index.ts での注入
→ Task05 Phase 2 で「DI 契約」として仕様化
```

#### **整合性リスク**

| リスク                      | 影響                        | 対策                                                     |
| --------------------------- | --------------------------- | -------------------------------------------------------- |
| プロバイダ未決定            | Task05 Phase 1 で空白が発生 | UT-9I-001 Phase A 完了を Task05 Phase 1 の前提条件にする |
| 型定義二重化（P32）         | Main / Preload 層の型不整合 | `@repo/shared` に共有型を定義し、両層で参照              |
| IPC 契約ドリフト（P44/P45） | 引数・戻り値の命名不一致    | ipc-contract-checklist.md に従い、Phase 1 で確定         |

---

### 7. Phase 1-3 仕様書に反映すべきポイント

#### **Phase 1（要件定義）に追加すべき項目**

##### 1.1 プロバイダ選定の明記

```markdown
### 対象 LLM プロバイダ

【Phase A-1 で決定】

- プロバイダ名: [OpenAI / Anthropic / Gemini] ← 決定待ち
- API エンドポイント: [URL]
- 認証スキーム: [API Key / Bearer Token / OAuth]
- APIキー取得方法: [環境変数 / electron-store / etc.]
```

##### 1.2 失敗シナリオと分類コード定義

```markdown
### エラー分類コードテーブル

| コード          | HTTP | 原因           | UI 再試行 | 復旧戦略       |
| --------------- | ---- | -------------- | --------- | -------------- |
| API_KEY_MISSING | 401  | APIキー未設定  | 不可      | 設定画面へ誘導 |
| API_KEY_INVALID | 403  | APIキー無効    | 不可      | キー再入力     |
| RATE_LIMIT      | 429  | レート制限     | 可能      | 指数バックオフ |
| SERVER_ERROR    | 5xx  | サーバエラー   | 可能      | 指数バックオフ |
| TIMEOUT         | -    | 30秒超過       | 可能      | 自動リトライ   |
| NETWORK_ERROR   | -    | ネットワーク断 | 可能      | 自動リトライ   |
```

##### 1.3 LLM 呼び出しの SLA（Service Level Agreement）

```markdown
### パフォーマンス要件

- **成功レスポンス時間**: 5秒～30秒（プロバイダ依存）
- **タイムアウト閾値**: 30秒（SkillDocGenerator で実装済み）
- **リトライ上限**: [未定義] ← UT-9I-001 で決定
- **レート制限**: [プロバイダの RPM / TPM 上限に依存]
```

#### **Phase 2（設計）に追加すべき項目**

##### 2.1 LLM クライアントの実装方針

```markdown
### Main Process への LLM クライアント追加

#### モジュール構成
```

apps/desktop/src/main/
├── services/llm/
│ ├── LLMClient.ts ← 新規（プロバイダ抽象化層）
│ ├── providers/
│ │ ├── OpenAIProvider.ts ← 新規（プロバイダ実装）
│ │ └── AnthropicProvider.ts ← 新規（プロバイダ実装）
│ └── **tests**/
│ └── LLMClient.test.ts
└── ipc/
└── index.ts ← 修正（queryFn DI 注入）

````

#### DI 注入ポイント

```typescript
// ipc/index.ts の registerAllIpcHandlers()
const llmClient = new LLMClient(
  process.env.LLM_PROVIDER,  // "openai" or "anthropic"
  process.env.LLM_API_KEY,
);
const queryFn = (prompt: string) => llmClient.query(prompt);
const skillDocGenerator = new SkillDocGeneratorCls(
  queryFn,
  skillFileManager,
);
````

- ✅ stub は本番環境では **絶対禁止**（environment 判定で制御）
- ✅ 実装コード側で failure fallback を用意

````

##### 2.2 IPC レスポンス形式の統一

```markdown
### IPC エラーレスポンス形式

#### 現行（不十分）

```json
{ "success": false, "error": "Internal error" }
````

#### 推奨（拡張）

```json
{
  "success": false,
  "error": "APIキーが設定されていません",
  "errorCode": "API_KEY_MISSING",
  "retryable": false
}
```

#### エラーコード定義

```typescript
type DocErrorCode =
  | "VALIDATION_ERROR"
  | "SKILL_NOT_FOUND"
  | "API_KEY_MISSING"
  | "API_KEY_INVALID"
  | "RATE_LIMIT"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR";
```

````

##### 2.3 terminal handoff の適用範囲

```markdown
### Terminal Handoff 対応

#### 対応予定ハンドラ

| ハンドラ | 現状 | Phase 2 での判定 |
|---------|------|-----------------|
| skill:execute | ✅ 実装済み | 維持 |
| skill:docs:generate | ❌ 未実装 | 【検討中】docs は長時間実行が必須？ |
| skill:docs:preview | ❌ 未実装 | docs 同様、検討対象外の可能性 |

#### 判定基準

【UT-9I-001 Phase A で決定】
- docs 生成は「ユーザーの操作を待つ」か「バックグラウンド実行」か？
- handoff は「ユーザーが Claude Code を離れる」シナリオなので、バックグラウンド実行であれば不要
````

#### **Phase 3（レビュー）に追加すべき項目**

##### 3.1 UT-9I-001 との整合性確認

```markdown
### UT-9I-001 との依存関係検証

#### チェックリスト

- [ ] UT-9I-001 Phase A で「プロバイダ」が決定済みか？
  - [ ] 決定済みなら、Task05 Phase 1 に反映
  - [ ] 未決定なら、Task05 Phase 1 は「プロバイダ TBD」と記載

- [ ] エラー分類コードが UT-9I-001 と一致しているか？
  - [ ] IPC 返却形式が共通か？
  - [ ] 再試行判定ロジックが共通か？

- [ ] LLMQueryFn の型定義が @repo/shared で共有化されているか？（P32対策）
  - [ ] Main Process 側で定義
  - [ ] Preload/Renderer 側で参照

- [ ] IPC チャンネル名が hardcode されていないか？（P27対策）
  - [ ] IPC_CHANNELS 定数で一元化

#### MINOR 指摘への対応（TASK-9I Phase 10）

- [ ] 「stubQueryFn の暫定実装」が本仕様書で明記されている
- [ ] UT-9I-001 での実装予定が参照されている
- [ ] 本番環境での動作保証方法が明記されている

### Preload / UI 層との契約確認

- [ ] Preload 層が IPC ハンドラの新エラーコード（errorCode フィールド）に対応しているか？
- [ ] UI 層が「再試行ボタン」「設定へ遷移」などのアクション分岐を実装予定か？
```

##### 3.2 既知の落とし穴への対策

```markdown
### 既知の落とし穴チェック（.claude/rules/ 準拠）

**P23: API二重定義の型管理複雑性**

- [ ] LLMQueryFn 型が SkillDocGenerator.ts と @repo/shared で重複定義されていないか？
- [ ] 変更時に両箇所を同時更新する仕組みがあるか？

**P32: 型定義の二箇所同時更新必須**

- [ ] Main Process の `LLMQueryFn` 定義
- [ ] `@repo/shared/types/llm.ts` での公開型
      → 変更時は両ファイルを同時 commit する

**P42: 文字列引数の .trim() バリデーション**

- [ ] IPC ハンドラで skillName 等の `.trim()` チェック実施済み（L812）
- [ ] LLM クライアント層でも prompt のトリム・バリデーション実施予定か？

**P44: IPC ハンドラとPreload のインターフェース不整合**

- [ ] skill:docs:generate ハンドラの引数形式
- [ ] Preload/skill-docs-api.ts の呼び出し形式
      → 両者が一致していることを確認（ipc-contract-checklist.md 準拠）

**P48: useShallow未適用による派生セレクタ無限ループ**

- [ ] Renderer 側でキャッシュ・選択ロジックがあれば、useShallow を適用
```

---

## ギャップ分析

### 本仕様書作成に必須な決定事項

| #   | 決定事項                                         | 現状     | Task05 での対応                           |
| --- | ------------------------------------------------ | -------- | ----------------------------------------- |
| 1   | LLM プロバイダ（OpenAI / Anthropic など）        | 決定なし | Phase 1 で決定 ← UT-9I-001 Phase A と連携 |
| 2   | APIキー取得・管理方法                            | 決定なし | Phase 1 で決定                            |
| 3   | エラー分類コード体系                             | 決定なし | Phase 1 で UT-9I-001 と協調決定           |
| 4   | IPC レスポンス形式（errorCode フィールド追加か） | 決定なし | Phase 2 設計で決定                        |
| 5   | Preload API の契約（引数・戻り値）               | 決定なし | Phase 2 設計で決定                        |
| 6   | docs:generate への handoff 適用                  | 決定なし | Phase 2 でスコープ判定                    |
| 7   | LLM クライアントの実装場所・方式                 | 決定なし | Phase 2 設計で決定                        |

### リソース依存

| 依存先タスク                         | 依存内容                     | Task05 での使用                |
| ------------------------------------ | ---------------------------- | ------------------------------ |
| UT-9I-001 Phase A                    | プロバイダ・失敗ポリシー決定 | Phase 1 基盤として必須         |
| TASK-9I Phase 12                     | 仕様書更新実績               | 参考（同じ Phase 12 パターン） |
| `.claude/rules/05-task-execution.md` | Phase 12 チェックリスト      | Phase 3 完了時に実施           |
| `aiworkflow-requirements`            | API・セキュリティ仕様        | Phase 2 設計基盤               |

---

## 推奨アクション

### 【即時】（Task05 開始前）

1. **UT-9I-001 Phase A 完了を確認**
   - プロバイダ決定済みか
   - エラー分類コード定義済みか

2. **LLM クライアント実装方式を技術検討**
   - SkillDocGenerator が呼ぶだけか？
   - 他のハンドラも LLM 呼び出しするか？

3. **Preload / UI 層との協力合意**
   - errorCode フィールド対応予定か？
   - UI 再試行ロジック実装予定か？

### 【Phase 1】

1. **要件定義ドキュメント作成**
   - 上記「Phase 1 仕様書に反映すべきポイント」を全て記載

2. **UT-9I-001 成果物の組み込み**
   - プロバイダ・APIキー取得方法を明文化
   - エラー分類コード 7 種類を定義表として記載

### 【Phase 2】

1. **設計ドキュメント作成**
   - LLM クライアント実装方針を明記
   - IPC レスポンス形式の拡張を明記
   - DI 注入ポイントを図示

2. **IPC 契約確定**
   - ipc-contract-checklist.md に従い、Phase 3 前に確定

### 【Phase 3】

1. **UT-9I-001 との整合性検証**
   - 7 つのチェック項目を全て確認

2. **既知の落とし穴対策確認**
   - P23, P32, P42, P44, P48 への対策が明記されているか確認

---

## 結論

本調査により、以下が明らかになりました：

1. ✅ **SkillDocGenerator は DI 可能な良い設計** — Constructor Injection パターン正しく実装

2. ❌ **LLM プロバイダ実装が決定されていない** — UT-9I-001 との連携が必須

3. ❌ **エラーハンドリングが基本的** — IPC レスポンス形式の拡張が必要（errorCode 追加）

4. ✅ **IPC ハンドラは P42 準拠バリデーション実装済み** — セキュリティ基盤は整っている

5. ⚠️ **terminal handoff は skill:execute のみ** — docs:generate への適用は検討中

**Task05 Phase 1-3 仕様書は、上記 7 つのポイントを網羅し、UT-9I-001 との依存関係を明記する形で作成すること。**
