# Phase 2 契約一覧 - Skill Docs Runtime Integration

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| タスクID   | TASK-IMP-SKILL-DOCS-AI-RUNTIME-001 |
| Phase      | 2                                  |
| 作成日     | 2026-03-16                         |
| ステータス | completed                          |

---

## 1. IPC チャンネル契約

### 4 チャンネルの入出力型とセキュリティ層

| チャンネル           | 入力型                 | 出力型                                 | セキュリティ層                                    |
| -------------------- | ---------------------- | -------------------------------------- | ------------------------------------------------- |
| skill:docs:generate  | `DocGenerationRequest` | `DocOperationResult<GeneratedDoc>`     | Layer 1-4（sender / P42 / 入力制約 / エラー境界） |
| skill:docs:preview   | `DocPreviewRequest`    | `DocOperationResult<string>`           | Layer 1-4（sender / P42 / 入力制約 / エラー境界） |
| skill:docs:export    | `DocExportRequest`     | `DocOperationResult<{ path: string }>` | Layer 1-4（sender / P42 / 入力制約 / エラー境界） |
| skill:docs:templates | なし                   | `DocOperationResult<DocTemplate[]>`    | Layer 1-2（sender / P42）                         |

### セキュリティ層の詳細

| Layer | 名称               | 内容                                                                                  |
| ----- | ------------------ | ------------------------------------------------------------------------------------- |
| 1     | Sender 検証        | `validateIpcSender(event)` で送信元ウィンドウを検証する                               |
| 2     | P42 バリデーション | 文字列引数に 3 段バリデーション（型チェック -> 空文字列 -> トリム空文字列）を適用する |
| 3     | 入力制約           | skillName の長さ制限（255 文字）、format の enum 制約を検証する                       |
| 4     | エラー境界         | 内部エラーをサニタイズし、パス/APIキー/スタックトレースを Renderer に送らない         |

### 入力型の詳細

```typescript
// 既存型（packages/shared/src/types/skill-docs.ts）- 変更なし
interface DocGenerationRequest {
  skillName: string;
  format: "markdown" | "html";
  sections?: string[];
  templateId?: string;
}

interface DocPreviewRequest {
  skillName: string;
  format: "markdown" | "html";
}

interface DocExportRequest {
  skillName: string;
  format: "markdown" | "html";
  outputPath: string;
}
```

---

## 2. DocOperationResult<T> ジェネリクス伝播

### 型定義

```typescript
// 配置先: packages/shared/src/types/skill-docs.ts（新規追加）
interface DocOperationResult<T> {
  success: boolean;
  data?: T;
  error?: DocError;
}

interface DocError {
  code: number;
  category:
    | "VALIDATION"
    | "BUSINESS"
    | "EXTERNAL_SERVICE"
    | "INFRASTRUCTURE"
    | "INTERNAL";
  message: string;
  retryable: boolean;
  retryAfterMs?: number;
  guidance?: DocErrorGuidance;
}

interface DocErrorGuidance {
  reason: string;
  action: string;
  handoffAvailable: boolean;
}
```

### チャンネル別ジェネリクス伝播

| IPC チャンネル       | T の具象型         | 成功時の data 例                                        |
| -------------------- | ------------------ | ------------------------------------------------------- |
| skill:docs:generate  | `GeneratedDoc`     | `{ title, content, sections, metadata }`                |
| skill:docs:preview   | `string`           | `"<h1>Skill Name</h1><p>Description...</p>"`            |
| skill:docs:export    | `{ path: string }` | `{ path: "/Users/.../skill-docs/my-skill.md" }`         |
| skill:docs:templates | `DocTemplate[]`    | `[{ id: "default", name: "Default", sections: [...] }]` |

### 後方互換マッピング

| 既存形式                            | 新形式                                   | 互換性       |
| ----------------------------------- | ---------------------------------------- | ------------ |
| `{ success: true, data: T }`        | `{ success: true, data: T }`             | 完全互換     |
| `{ success: false, error: string }` | `{ success: false, error: DocError }`    | 拡張互換     |
| Renderer での `result.error` 参照   | `result.error?.message` で文字列取得可能 | 読み替え必要 |

---

## 3. DI 経路図

### LLMDocQueryAdapter -> SkillDocGenerator -> IPC Handler

```
┌─────────────────────────────────────────────────────────────────────┐
│ ipc/index.ts (registerAllIpcHandlers)                               │
│                                                                     │
│  ┌──────────────┐    ┌──────────────────────┐                       │
│  │ AuthKeyService│───>│ LLMDocQueryAdapter   │                       │
│  │   (既存)      │    │   (新規)             │                       │
│  └──────────────┘    │                      │                       │
│                      │  .query(prompt)      │──── bind ───┐        │
│  ┌──────────────┐    │  .isAvailable()      │             │        │
│  │RuntimeResolver│───>│  .getProviderName()  │             │        │
│  │   (既存)      │    └──────────────────────┘             │        │
│  └──────────────┘                                         ▼        │
│                                                    ┌──────────┐    │
│                                                    │ queryFn  │    │
│                                                    │ :LLMQuery│    │
│                                                    │  Fn      │    │
│                                                    └────┬─────┘    │
│                                                         │          │
│                                                         ▼          │
│                                              ┌──────────────────┐  │
│                                              │SkillDocGenerator │  │
│                                              │  (既存・変更なし) │  │
│                                              └────────┬─────────┘  │
│                                                       │            │
│  ┌──────────────────────────────────┐                  │            │
│  │ SkillDocsCapabilityResolver     │                  │            │
│  │   (新規)                         │                  │            │
│  │                                  │                  │            │
│  │  AuthKeyService ──> resolve()   │                  │            │
│  │  RuntimeResolver ──>            │                  │            │
│  └─────────────┬────────────────────┘                  │            │
│                │                                       │            │
│                ▼                                       ▼            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ registerSkillDocsHandlers(mainWindow, generator, resolver) │   │
│  │                                                             │   │
│  │  skill:docs:generate  ── capability check ── generate()    │   │
│  │  skill:docs:preview   ── capability check ── preview()     │   │
│  │  skill:docs:export    ── capability check ── export()      │   │
│  │  skill:docs:templates ── (no capability check) ── list()   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### DI 注入タイミング

| 順序 | 処理                               | ファイル            | 備考                                   |
| ---- | ---------------------------------- | ------------------- | -------------------------------------- |
| 1    | AuthKeyService 生成                | ipc/index.ts (既存) | 変更なし                               |
| 2    | RuntimeResolver 生成               | ipc/index.ts (既存) | 変更なし                               |
| 3    | LLMDocQueryAdapter 生成            | ipc/index.ts (新規) | authKeyService, runtimeResolver を注入 |
| 4    | queryFn 決定                       | ipc/index.ts (新規) | `await adapter.isAvailable()` で分岐   |
| 5    | SkillDocGenerator 生成             | ipc/index.ts (変更) | queryFn を注入（シグネチャ変更なし）   |
| 6    | SkillDocsCapabilityResolver 生成   | ipc/index.ts (新規) | authKeyService, runtimeResolver を注入 |
| 7    | registerSkillDocsHandlers 呼び出し | ipc/index.ts (変更) | 第3引数に resolver を追加              |

---

## 4. State 契約

### UI 状態型

```typescript
// 配置先: apps/desktop/src/renderer (コンポーネント内)
type SkillDocsUIState =
  | "ready"
  | "generating"
  | "result"
  | "timeout-guidance"
  | "rate-limit-wait"
  | "error-guidance"
  | "guidance-only";
```

### DocOperationResult から UI 状態への変換ルール

| DocOperationResult の条件                      | UI 状態          |
| ---------------------------------------------- | ---------------- |
| `success === true`                             | result           |
| `error.code === 2001 \|\| error.code === 2002` | guidance-only    |
| `error.code === 3001`                          | timeout-guidance |
| `error.code === 3002`                          | rate-limit-wait  |
| `error.code === 3003 \|\| error.code === 4001` | error-guidance   |
| `error.code === 5001`                          | error-guidance   |
| IPC 呼び出し中                                 | generating       |
| 初期表示（capability === "guidance-only"）     | guidance-only    |
| 初期表示（capability !== "guidance-only"）     | ready            |

---

## 5. Runtime 契約

### Capability 判定契約

```typescript
// 配置先: packages/shared/src/types/skill-docs.ts
type SkillDocsCapability =
  | "integrated-api"
  | "guidance-only"
  | "terminal-handoff";
```

| capability       | API key 有効 | LLM 到達可能 | docs 生成  | terminal handoff |
| ---------------- | ------------ | ------------ | ---------- | ---------------- |
| integrated-api   | true         | true         | 実行する   | 不要             |
| guidance-only    | false        | -            | 実行しない | 導線表示         |
| terminal-handoff | true         | false        | 実行しない | 導線表示         |

### Terminal Handoff 境界

| 許可する操作                                 | 禁止する操作                     |
| -------------------------------------------- | -------------------------------- |
| prompt context のコピー（copy to clipboard） | terminal へのコマンド自動送信    |
| working directory の表示                     | terminal への prompt 自動注入    |
| suggested command の表示                     | consumer subscription の自動利用 |
| terminal アプリへの遷移導線                  | docs 生成の自動フォールバック    |

---

## 6. 変更対象ファイル一覧

### 新規作成（3 ファイル）

| ファイル                                                              | 責務                      | 依存先                          |
| --------------------------------------------------------------------- | ------------------------- | ------------------------------- |
| `apps/desktop/src/main/services/skill/LLMDocQueryAdapter.ts`          | LLM プロバイダアダプター  | AuthKeyService, RuntimeResolver |
| `apps/desktop/src/main/services/skill/DocErrorMapper.ts`              | エラー正規化マッパー      | なし（純粋関数）                |
| `apps/desktop/src/main/services/skill/SkillDocsCapabilityResolver.ts` | capability 判定リゾルバー | AuthKeyService, RuntimeResolver |

### 変更（3 ファイル）

| ファイル                                              | 変更内容                                                   | 影響範囲               |
| ----------------------------------------------------- | ---------------------------------------------------------- | ---------------------- |
| `packages/shared/src/types/skill-docs.ts`             | DocOperationResult / DocError / DocErrorGuidance 型追加    | 型定義のみ（後方互換） |
| `apps/desktop/src/main/ipc/index.ts`                  | adapter / resolver 生成、DI 注入経路の更新                 | L786-793 付近          |
| `apps/desktop/src/main/ipc/handlers/skillHandlers.ts` | capability チェック追加、DocOperationResult レスポンス対応 | L1049-1271 付近        |

### 型定義更新箇所（P23/P32 準拠）

| 型名                  | 配置ファイル                              | Preload 側への影響                     |
| --------------------- | ----------------------------------------- | -------------------------------------- |
| DocOperationResult<T> | `packages/shared/src/types/skill-docs.ts` | Renderer で import して使用する        |
| DocError              | `packages/shared/src/types/skill-docs.ts` | Renderer で import して使用する        |
| DocErrorGuidance      | `packages/shared/src/types/skill-docs.ts` | Renderer で import して使用する        |
| LLMDocQueryAdapter    | `packages/shared/src/types/skill-docs.ts` | Main Process 専用（Renderer 参照なし） |
| SkillDocsCapability   | `packages/shared/src/types/skill-docs.ts` | Renderer で初期状態判定に使用する      |

### 型定義の更新順序（P23 準拠）

1. `packages/shared/src/types/skill-docs.ts`（共有型定義 - 正本）
2. `apps/desktop/src/preload/types.ts`（DocOperationResult の re-export が必要な場合のみ）
3. `apps/desktop/src/main/services/skill/*.ts`（実装ファイル）

---

## 7. Pitfall 対策の設計への反映

| Pitfall | 内容                       | 本設計での対策                                                           |
| ------- | -------------------------- | ------------------------------------------------------------------------ |
| P23     | API 二重定義の型管理       | 型定義は `packages/shared` に一元配置。re-export で参照する              |
| P32     | 型定義の二箇所同時更新     | shared -> preload の更新順序を明示。同一コミットで更新する               |
| P34     | 遅延初期化 DI              | IPC 初期化時に全依存が利用可能なため Constructor Injection で十分        |
| P42     | .trim() バリデーション漏れ | 既存 4 層セキュリティの Layer 2 を維持。新規入力フィールドにも適用する   |
| P44     | IPC インターフェース不整合 | ハンドラ引数と Preload API の型を shared types で統一する                |
| P45     | 引数命名の契約ドリフト     | 引数名はセマンティクスに一致させる（skillName = スキル名）               |
| P48     | non-null assertion 禁止    | `result.data!` を使わず `result.data ?? fallback` で実行時検証する       |
| P54     | safeRegister 不適合        | 戻り値不要のハンドラは safeRegister、要のものは個別 try-catch を使用する |
| P55     | 正規表現メタ文字           | エラーメッセージのパスマスクに `escapeRegExp()` を適用する               |
