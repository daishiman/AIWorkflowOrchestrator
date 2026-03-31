# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 1                                 |
| 機能名 | safety-gov-production-integration |
| 作成日 | 2026-03-31                        |

## 目的

UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001 の scope、受入条件、実装 inventory を確定する。
既存 approvalHandlers / disclosureHandlers / advancedConsoleHandlers の実装状態を調査し、production 統合に必要な変更点を明文化する。

## タスク分類

| 分類項目   | 値                                                             |
| ---------- | -------------------------------------------------------------- |
| タスク種別 | implementation task（コード修正あり）                          |
| UI task    | No（Renderer hook 修正はあるが UI コンポーネント新規追加なし） |
| docs-only  | No                                                             |

## 真の論点と4条件の初期評価

### 真の論点

ApprovalGate / approvalHandlers / disclosureHandlers / advancedConsoleHandlers は実装済みだが、production 起動経路に接続されていないため、存在しても機能していない。

### 4条件の初期評価

| 条件         | 初期評価     | 補足                                             |
| ------------ | ------------ | ------------------------------------------------ |
| 矛盾なし     | 条件付きPASS | 既存 channel / handler 設計とは矛盾していない    |
| 漏れなし     | FAIL         | UT-6〜UT-9 が未接続                              |
| 整合性あり   | 条件付きPASS | 型と責務境界は概ねあるが owner が未固定          |
| 依存関係整合 | FAIL         | Main / Preload / Renderer / cleanup の接続が未完 |

## 命名規則インベントリ

| 対象                         | 命名規則                            | 使用箇所                                                 |
| ---------------------------- | ----------------------------------- | -------------------------------------------------------- |
| workflow ディレクトリ        | kebab-case                          | `safety-gov-production-integration`                      |
| Phase ファイル               | `phase-<number>-<name>.md`          | `phase-1-requirements.md` ほか                           |
| unassigned/completed task ID | UPPER_SNAKE + numeric suffix        | `UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001`           |
| TypeScript interface         | PascalCase                          | `ExecutionAPI`, `ElectronAPI`, `IApprovalGate`           |
| hook / 関数                  | camelCase                           | `useApprovalFlow`, `registerAllIpcHandlers`, `revokeAll` |
| IPC channel                  | UPPER_SNAKE 定数 + kebab-case value | `APPROVAL_REQUEST`, `approval:request`                   |

Phase 4 以降のテスト名、artifact 名、未タスク ID はこの命名規則に合わせて記録する。

## 実行タスク

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# 対象ファイルの実装状態確認
grep -n "registerApprovalHandlers\|registerDisclosureHandlers\|registerAdvancedConsoleHandlers" \
  apps/desktop/src/main/ipc/index.ts

# approvalHandlers の実装確認
grep -n "export function register" apps/desktop/src/main/ipc/approvalHandlers.ts
grep -n "export function register" apps/desktop/src/main/ipc/disclosureHandlers.ts
grep -n "export function register" apps/desktop/src/main/ipc/advancedConsoleHandlers.ts

# Preload execution namespace の実装状態
grep -n "execution" apps/desktop/src/preload/index.ts

# APPROVAL / EXECUTION チャンネルの定義確認
grep -n "APPROVAL\|EXECUTION" apps/desktop/src/preload/channels.ts

# 既存テスト数の確認
pnpm --filter @repo/desktop test --reporter=verbose 2>&1 | grep "✓\|✗" | wc -l
```

#### 現在の実装状態（調査結果記録欄）

| ファイル                               | 状態       | 備考                                                  |
| -------------------------------------- | ---------- | ----------------------------------------------------- |
| `main/ipc/approvalHandlers.ts`         | 実装済み   | `registerApprovalHandlers(mainWindow, approvalGate)`  |
| `main/ipc/disclosureHandlers.ts`       | 実装済み   | `registerDisclosureHandlers({mainWindow, ...})`       |
| `main/ipc/advancedConsoleHandlers.ts`  | 実装済み   | `registerAdvancedConsoleHandlers({mainWindow, ...})`  |
| `main/ipc/index.ts`                    | **未登録** | 3ハンドラが `registerAllIpcHandlers` に含まれていない |
| `preload/index.ts`                     | **未公開** | `execution` namespace が contextBridge に存在しない   |
| `preload/types.ts`                     | **未定義** | execution 関連の型定義がない                          |
| `renderer/hooks/useApprovalFlow.ts`    | 未確認     | IPC 接続状態を確認する                                |
| `renderer/hooks/useAdvancedConsole.ts` | 未確認     | IPC 接続状態を確認する                                |

### 1. 機能要件の抽出

#### FR-1: IPC Handler 登録

- `registerAllIpcHandlers()` 内で `registerApprovalHandlers(mainWindow, approvalGate)` を登録する
- `registerAllIpcHandlers()` 内で `registerDisclosureHandlers({mainWindow, getProviderName, getModelName, getDestinations})` を登録する
- `registerAllIpcHandlers()` 内で `registerAdvancedConsoleHandlers({mainWindow, getTerminalLog, getCopyCommand})` を登録する

#### FR-2: ApprovalGate シングルトン

- `DefaultApprovalGate` のインスタンスを `registerAllIpcHandlers()` 内（または `main/index.ts`）で生成し、DI で `registerApprovalHandlers` に注入する

#### FR-3: Preload execution API 公開

- `preload/index.ts` の `contextBridge.exposeInMainWorld('electronAPI', {...})` に `execution` 名前空間を追加する
- `safeInvoke` / `safeOn` パターンに従う
- 型定義を `preload/types.ts` の `ElectronAPI` に追加する

#### FR-4: Approval Request Push 通知

- セッション実行中に承認要求が発生した際、Main Process から `mainWindow.webContents.send(IPC_CHANNELS.APPROVAL_REQUEST, payload)` で Renderer に Push する
- `ALLOWED_ON_CHANNELS` に `APPROVAL_REQUEST` は登録済みであることを確認する

#### FR-5: revokeAll() セッション終了連携

- セッション状態が `done` または `aborted` に遷移するハンドラ内で `approvalGate.revokeAll(sessionId)` を呼び出す
- セッション管理コードの場所を特定して実装する

#### FR-6: Renderer hooks の IPC 接続

- `useApprovalFlow.ts` が `electronAPI.execution.respondApproval()` / `onApprovalRequest()` を呼び出す
- `useAdvancedConsole.ts` が `electronAPI.execution.getTerminalLog()` / `getCopyCommand()` を呼び出す

### 2. 非機能要件の抽出

#### NFR-1: 型安全性

- `preload/types.ts` に `ExecutionAPI` インターフェースを定義し、`ElectronAPI` に追加する
- `any` 型の使用を禁止する

#### NFR-2: セキュリティ

- `approvalHandlers.ts` 既実装の sender 検証（`event.sender !== mainWindow.webContents`）を維持する
- contextBridge 経由以外の direct ipcRenderer 呼び出しを禁止する

#### NFR-3: 既存テスト互換性

- 既存 85 テストが引き続き PASS すること

### 3. 受入条件（Acceptance Criteria）

| ID   | 条件                                                             | 検証方法                                       |
| ---- | ---------------------------------------------------------------- | ---------------------------------------------- |
| AC-1 | 3つのIPC handlerが `registerAllIpcHandlers()` から登録されている | コードレビュー + handler 登録テスト            |
| AC-2 | `DefaultApprovalGate` が DI で `registerApprovalHandlers` に注入 | コードレビュー + 単体テスト                    |
| AC-3 | `electronAPI.execution` が contextBridge に公開されている        | Preload API テスト                             |
| AC-4 | approval:request push 通知が Renderer で受信される               | 統合テスト（mock mainWindow.webContents.send） |
| AC-5 | セッション終了時に `revokeAll(sessionId)` が呼び出される         | 単体テスト / 統合テスト                        |
| AC-6 | 既存 85 テスト + 新規統合テストが全 PASS                         | `pnpm --filter @repo/desktop test`             |

### 4. スコープ定義

**含む**:

- `registerAllIpcHandlers()` への3ハンドラ追加
- `DefaultApprovalGate` singleton 生成と DI 注入
- `preload/index.ts` への execution namespace 追加
- `preload/types.ts` への ExecutionAPI 型定義追加
- `useApprovalFlow.ts` / `useAdvancedConsole.ts` の IPC 接続
- 統合テストの追加

**含まない**:

- `approvalHandlers.ts` / `disclosureHandlers.ts` / `advancedConsoleHandlers.ts` のロジック変更
- 新規 UI コンポーネントの作成
- `IPC_CHANNELS` 定数の新規追加（既に定義済み）

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                              | 内容                                 |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------ |
| IPC設計仕様      | `.claude/skills/aiworkflow-requirements/references/`              | IPC チャンネル・Preload API 設計基準 |
| セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-*.md` | セキュリティ要件                     |

| 参照資料                       | パス                                                                                |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| 元タスク仕様書                 | `docs/30-workflows/completed-tasks/UT-IMP-SAFETY-GOV-PRODUCTION-INTEGRATION-001.md` |
| IPC チャンネル定数             | `apps/desktop/src/preload/channels.ts`                                              |
| 共有 IPC チャンネル            | `packages/shared/src/ipc/channels.ts`                                               |
| 既実装 approvalHandlers        | `apps/desktop/src/main/ipc/approvalHandlers.ts`                                     |
| 既実装 disclosureHandlers      | `apps/desktop/src/main/ipc/disclosureHandlers.ts`                                   |
| 既実装 advancedConsoleHandlers | `apps/desktop/src/main/ipc/advancedConsoleHandlers.ts`                              |
| ApprovalGate インターフェース  | `apps/desktop/src/main/services/runtime/ApprovalGate.ts`                            |

## 統合テスト連携【必須】

| 判定項目              | 基準 | 結果（実行時に記録） |
| --------------------- | ---- | -------------------- |
| 既存テスト Line       | 80%+ | -                    |
| 既存テスト Branch     | 60%+ | -                    |
| 既存テスト Function   | 80%+ | -                    |
| 既存 85 テスト全 PASS | 100% | -                    |

## 成果物

| 成果物     | パス                              | 説明                         |
| ---------- | --------------------------------- | ---------------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 機能要件・非機能要件・AC一覧 |

## 完了条件

- [ ] 既存ファイルの実装状態を全て調査・記録した（P50チェック完了）
- [ ] FR-1 〜 FR-6 の機能要件が定義されている
- [ ] AC-1 〜 AC-6 の受入条件が検証可能な形で定義されている
- [ ] スコープ（含む/含まない）が明確に定義されている
- [ ] `outputs/phase-1/requirements.md` に成果物が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計（IPC 4層整合性・DI パターン・型定義の設計）

**Phase 1〜3 完了前に Phase 4 へ進まないこと。**
