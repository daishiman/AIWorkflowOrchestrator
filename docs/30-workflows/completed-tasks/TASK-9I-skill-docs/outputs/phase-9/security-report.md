# Phase 9: セキュリティレビューレポート - TASK-9I

## 実施日

2026-02-28

## レビュー対象

| ファイル                                                    | セキュリティ関連箇所                         |
| ----------------------------------------------------------- | -------------------------------------------- |
| `apps/desktop/src/main/ipc/skillHandlers.ts`（docs 部分）   | IPC ハンドラ4チャネル（4層セキュリティ実装） |
| `apps/desktop/src/main/services/skill/SkillDocGenerator.ts` | パストラバーサル防止、LLM query タイムアウト |
| `apps/desktop/src/preload/channels.ts`                      | チャネル定数・ホワイトリスト                 |
| `apps/desktop/src/preload/skill-api.ts`（docs 部分）        | `safeInvokeUnwrap` パターン使用              |

---

## 1. 4層セキュリティ検証

### 全4チャネルの Layer 別検証結果

| チャネル               | L1: sender 検証 | L2: 引数バリデーション | L3: サービス実行 | L4: エラーサニタイズ |
| ---------------------- | :-------------: | :--------------------: | :--------------: | :------------------: |
| `skill:docs:generate`  |      PASS       |          PASS          |       PASS       |         PASS         |
| `skill:docs:preview`   |      PASS       |          PASS          |       PASS       |         PASS         |
| `skill:docs:export`    |      PASS       |          PASS          |       PASS       |         PASS         |
| `skill:docs:templates` |      PASS       |          PASS          |  -（定数返却）   |         PASS         |

### Layer 1: 送信元検証（NFR-01）

全4ハンドラで `validateIpcSender()` を実行している。

```typescript
const validation = validateIpcSender(event, IPC_CHANNELS.SKILL_DOCS_*, {
  getAllowedWindows: () => [mainWindow],
});
if (!validation.valid) {
  return toIPCValidationError(validation);
}
```

- [x] `skill:docs:generate`: `validateIpcSender` 実装済み（L850-857）
- [x] `skill:docs:preview`: `validateIpcSender` 実装済み（L948-955）
- [x] `skill:docs:export`: `validateIpcSender` 実装済み（L987-994）
- [x] `skill:docs:templates`: `validateIpcSender` 実装済み（L1039-1046）
- [x] `getAllowedWindows` コールバックが正しく `[mainWindow]` を返す（P41 対策テスト HS-07 で検証済み）

### Layer 2: 引数バリデーション（NFR-02, NFR-11, NFR-12）

#### P42 準拠3段バリデーション

全文字列引数に対して以下の3段バリデーションを実施している。

| チャネル              | 引数         | typeof チェック | 空文字列チェック | trim() チェック |
| --------------------- | ------------ | :-------------: | :--------------: | :-------------: |
| `skill:docs:generate` | `skillName`  |      PASS       |       PASS       |      PASS       |
| `skill:docs:preview`  | `skillName`  |      PASS       |       PASS       |      PASS       |
| `skill:docs:export`   | `outputPath` |      PASS       |       PASS       |      PASS       |

`validateStringArg()` 共通関数により3段バリデーションを実施（P42 準拠）。

#### 許可値リストバリデーション（NFR-11, NFR-12）

| チャネル              | 引数           | 許可値                 | 判定 |
| --------------------- | -------------- | ---------------------- | ---- |
| `skill:docs:generate` | `outputFormat` | `["markdown", "html"]` | PASS |
| `skill:docs:generate` | `language`     | `["ja", "en"]`         | PASS |

不正値は即座にエラーレスポンスで拒否される。

#### 型チェック

| チャネル              | 引数                  | 検証内容                                                                  | 判定 |
| --------------------- | --------------------- | ------------------------------------------------------------------------- | ---- |
| `skill:docs:generate` | `request`             | `typeof === "object"` かつ `!== null`                                     | PASS |
| `skill:docs:generate` | `includeExamples`     | `typeof === "boolean"`                                                    | PASS |
| `skill:docs:generate` | `includeApiReference` | `typeof === "boolean"`                                                    | PASS |
| `skill:docs:generate` | `customSections`      | `undefined` 許容、存在時 `Array.isArray()` + 全要素 `typeof === "string"` | PASS |
| `skill:docs:preview`  | `args`                | `typeof === "object"` かつ `!== null`                                     | PASS |
| `skill:docs:export`   | `args`                | `typeof === "object"` かつ `!== null`                                     | PASS |
| `skill:docs:export`   | `doc`                 | `!== null` かつ `typeof === "object"`                                     | PASS |

### Layer 3: サービス実行

サービス層のエラー（スキル未検出、LLM エラー等）は catch 節で捕捉し、Layer 4 でサニタイズされる。

### Layer 4: エラーサニタイズ（NFR-03）

| チャネル               | エラーサニタイゼーション方式                                        | 判定 |
| ---------------------- | ------------------------------------------------------------------- | ---- |
| `skill:docs:generate`  | `"Skill not found"` → そのまま返却、その他 → `"Internal error"`     | PASS |
| `skill:docs:preview`   | `"Skill not found"` → そのまま返却、その他 → `"Internal error"`     | PASS |
| `skill:docs:export`    | `"Invalid output path"` → そのまま返却、その他 → `"Internal error"` | PASS |
| `skill:docs:templates` | 全て → `"Internal error"`                                           | PASS |

- [x] スタックトレースが Renderer に漏洩しない（HS-05 テストで検証済み）
- [x] ファイルパス情報が Renderer に漏洩しない（HS-06 テストで検証済み）
- [x] 内部エラーメッセージは `"Internal error"` に正規化される

---

## 2. パストラバーサル防止（NFR-08）

### IPC 層（skillHandlers.ts）

```typescript
const outputPath = a.outputPath as string;
if (outputPath.includes("..")) {
  return { success: false, error: "Invalid output path" };
}
```

- [x] `..` を含むパスを IPC 層で早期拒否（HS-03 テストで検証済み）

### サービス層（SkillDocGenerator.ts）

```typescript
private validateOutputPath(outputPath: string): void {
  const resolved = path.resolve(outputPath);
  if (resolved.includes("..") || outputPath.includes("..")) {
    throw new Error("Invalid output path: path traversal detected");
  }
}
```

- [x] `path.resolve()` で絶対パスに正規化後に `..` を検証（EC-06 テストで検証済み）
- [x] IPC 層とサービス層の2層で多層防御（Defense in Depth 原則）

---

## 3. ハードコード文字列チェック（P27 準拠）

```bash
grep -rn "safeInvoke\|safeOn" apps/desktop/src/preload/skill-api.ts | grep "skill:docs"
```

**結果**: 全てのチャネル参照が `IPC_CHANNELS.SKILL_DOCS_*` 定数を使用しており、文字列リテラルのハードコードは検出されなかった。

- [x] `skill-api.ts`: `IPC_CHANNELS.SKILL_DOCS_GENERATE` 使用
- [x] `skill-api.ts`: `IPC_CHANNELS.SKILL_DOCS_PREVIEW` 使用
- [x] `skill-api.ts`: `IPC_CHANNELS.SKILL_DOCS_EXPORT` 使用
- [x] `skill-api.ts`: `IPC_CHANNELS.SKILL_DOCS_TEMPLATES` 使用
- [x] `skillHandlers.ts`: 全4ハンドラで `IPC_CHANNELS` 定数使用
- [x] `channels.ts`: `ALLOWED_INVOKE_CHANNELS` に4チャネル登録済み

---

## 4. IPC 契約ドリフト検証（P44/P45 対策）

| 検証項目                                       | 判定 |
| ---------------------------------------------- | ---- |
| ハンドラ引数形式と Preload 呼び出し形式が一致  | PASS |
| 引数名のセマンティクスが実際の値と一致         | PASS |
| `skillName` は実際にスキル名を渡す（P45 準拠） | PASS |
| `outputPath` は実際にファイルパスを渡す        | PASS |

---

## 5. ホワイトリスト登録確認

`apps/desktop/src/preload/channels.ts` の `ALLOWED_INVOKE_CHANNELS` に以下の4チャネルが登録されている。

- [x] `IPC_CHANNELS.SKILL_DOCS_GENERATE`
- [x] `IPC_CHANNELS.SKILL_DOCS_PREVIEW`
- [x] `IPC_CHANNELS.SKILL_DOCS_EXPORT`
- [x] `IPC_CHANNELS.SKILL_DOCS_TEMPLATES`

未登録チャネルからの `safeInvoke` は Preload 層で拒否される。

---

## 6. register/unregister 独立関数（P5 対策）

- [x] `registerSkillDocsHandlers()`: 4チャネルの `ipcMain.handle` 登録
- [x] `unregisterSkillDocsHandlers()`: 4チャネルの `ipcMain.removeHandler` 解除
- [x] macOS `activate` イベント等での二重登録を防止可能な構造

---

## セキュリティ総合判定

**PASS** -- 全4チャネルで4層セキュリティが正しく実装されている。P42 準拠3段バリデーション、パストラバーサル防止（2層）、エラーサニタイズ、チャネル名定数管理（P27）、IPC 契約整合（P44/P45）、ホワイトリスト登録、register/unregister 分離（P5）の全セキュリティ要件を充足している。
