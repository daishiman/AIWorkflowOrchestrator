# スキル安全性評価・ファイルツリー IPC 仕様

> 親仕様書: [api-ipc-agent-core.md](api-ipc-agent-core.md)
> 役割: スキル安全性評価（SafetyGate）とファイルツリー取得のIPC仕様

---

## スキル安全性評価 IPC チャネル（UT-06-003）

スキルの安全性を評価し、SafetyGateResult を返す IPC チャネル。スキル公開前の安全性チェックに使用する。

**実装ファイル**:

- チャンネル定義: `apps/desktop/src/preload/channels.ts`（`SKILL_EVALUATE_SAFETY`）
- IPCハンドラー: `apps/desktop/src/main/ipc/safetyGateHandlers.ts`
- Preload API: `apps/desktop/src/preload/skill-api.ts`（`evaluateSafety`）
- 型定義: `packages/shared/src/types/safety-gate.ts`

### チャネル仕様

| 項目 | 内容 |
| --- | --- |
| チャネル名 | `skill:evaluate-safety` |
| 定数名 | `SKILL_EVALUATE_SAFETY` |
| 方向 | Renderer → Main |
| 引数 | `skillName: string` |
| 成功レスポンス | `{ success: true, data: SafetyGateResult }` |
| 失敗レスポンス | `{ success: false, error: { code: string, message: string } }` |
| ハンドラ | `safetyGateHandlers.ts` |
| 実装タスク | UT-06-003 |

### バリデーション・セキュリティ

| 対策 | 実装 | 返却仕様 |
| --- | --- | --- |
| Sender 検証 | `validateIpcSender(event, mainWindow)` | 不正時 `toIPCValidationError` |
| 入力検証 | P42 準拠3段（型/空文字/trim） | `VALIDATION_ERROR` |
| エラーサニタイズ | `sanitizeErrorMessage(error)` | 内部情報は `"Internal error"` |

### SafetyGateResult 型

`packages/shared/src/types/safety-gate.ts` で定義される共有型。5種類のセキュリティチェック結果を集約する。

| チェック種別 | 内容 |
| --- | --- |
| critical | 危険コマンドパターン検出 |
| high | 高リスク操作の検出 |
| no-approval | 承認不要ツールの使用 |
| all-low | 全ツールがlow risk |
| protected-path | 保護パスへのアクセス検出 |

### DefaultSafetyGate DI 構成

`apps/desktop/src/main/ipc/index.ts` で `PermissionStore` をハンドラスコープ外に抽出して `DefaultSafetyGate` と共有する。

| 依存 | 提供元 | 共有方法 |
| --- | --- | --- |
| `permissionStore` | `index.ts` のスコープ外変数 | SafetyGate と skillHandlers で同一インスタンスを参照 |
| `metadataProvider` | `SkillMetadataProvider` インスタンス | Constructor Injection |
| `protectedPaths` | `DANGEROUS_PATTERNS.PROTECTED_PATHS` | Constructor Injection |

### 関連未タスク

| 未タスクID | 概要 | 優先度 | 指示書 |
| --- | --- | --- | --- |
| ~~UT-06-003-PRELOAD-API-IMPL~~ | ~~Preload 層 safeInvoke 呼び出し追加~~ | ~~高~~ | ~~`docs/30-workflows/safety-gate-preload-api/`~~ **完了 2026-03-23** |
| UT-06-003-METADATA-PROVIDER-IMPL | stub metadataProvider を SkillMetadataProvider 実装に置換 | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-06-003-metadata-provider-impl.md` |
| UT-06-003-DIP-REFACTOR | unregisterSafetyGateHandlers 追加（P5 対策） | 中 | `docs/30-workflows/completed-tasks/step-04-par-task-09-slide-ai-runtime-alignment/unassigned-task/task-ut-06-003-dip-refactor.md` |

---

## スキルファイルツリー取得 IPC チャネル（TASK-UI-05A）

スキルディレクトリのファイルツリー構造を取得する IPC チャネル。SkillEditorView のファイルツリーパネルで使用する。

### チャネル仕様

| 項目 | 内容 |
| --- | --- |
| チャネル名 | `skill:getFileTree` |
| 方向 | Renderer → Main |
| 引数 | `skillName: string` |
| 戻り値 | `{ tree: FileNode[] }` |
| バリデーション | P42準拠3段（型チェック → 空文字列 → trim空文字列） |
| セキュリティ | パストラバーサル検証、送信元ウィンドウ検証 |
| 実装状況 | 未実装（UT-UI-05A-GETFILETREE-001 で対応予定） |
| 関連タスク | TASK-UI-05A-SKILL-EDITOR-VIEW |
| 未タスク正本 | `docs/30-workflows/completed-tasks/skill-editor-view-closure/unassigned-task/task-ui-05a-getfiletree-ipc-implementation.md` |

### FileNode 型定義

```typescript
interface FileNode {
  name: string;
  path: string; // スキルルートからの相対パス
  type: "file" | "directory";
  children?: FileNode[];
}
```

---

## 変更履歴

| バージョン | 日付 | 内容 |
| --- | --- | --- |
| 1.0.0 | 2026-03-17 | `api-ipc-agent-core.md` から分割。UT-06-003（skill:evaluate-safety）・TASK-UI-05A（skill:getFileTree）の仕様を統合 |
