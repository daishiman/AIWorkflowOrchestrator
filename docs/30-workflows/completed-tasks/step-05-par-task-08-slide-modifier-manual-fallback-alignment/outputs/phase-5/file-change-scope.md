# Phase 5: 変更スコープ

## メタ情報

| 項目     | 内容                                                  |
| -------- | ----------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001 |
| Phase    | 5                                                     |
| 作成日   | 2026-03-23                                            |
| 前提     | Phase 2 contract-matrix.md（ownership テーブル）      |

## 1. スコープの読み方

本タスクは設計タスクであり、プロダクションコードの変更はない。
本文書は「将来の実装タスクが変更するファイルの一覧」を定義する設計文書である。

- **対象ファイル（実装タスクで変更する）**: 実装タスクの Phase 4-5 で変更
- **除外ファイル（本タスクでは変更しない）**: 明示的に除外理由を記録

## 2. 対象ファイル一覧

### 2.1 新規作成ファイル

| ファイルパス                                                                           | 担当タスク        | 作成理由                                                    |
| -------------------------------------------------------------------------------------- | ----------------- | ----------------------------------------------------------- |
| `packages/shared/src/slide/types.ts`                                                   | UT-SLIDE-IMPL-001 | SlideUIStatus / SlideCapabilityDTO の共有型定義             |
| `apps/desktop/src/main/handlers/slide-capability-handlers.ts`                          | UT-SLIDE-IMPL-001 | `slide:capability:get` / `slide:capability:changed` handler |
| `apps/desktop/src/main/services/__tests__/slide-status-reducer.unit.test.ts`           | UT-SLIDE-IMPL-001 | V-07, V-08 テスト                                           |
| `apps/desktop/src/main/services/__tests__/manual-boundary.unit.test.ts`                | UT-SLIDE-IMPL-001 | V-11 テスト                                                 |
| `apps/desktop/src/main/services/__tests__/modifier-response-contract.contract.test.ts` | UT-SLIDE-IMPL-001 | V-09 テスト                                                 |
| `apps/desktop/src/__tests__/slide-capability-ipc.integration.test.ts`                  | UT-SLIDE-IMPL-001 | V-10 テスト                                                 |

### 2.2 既存ファイルの変更

| ファイルパス                                              | 変更内容                                                     | 担当タスク        | 変更 Gate                       |
| --------------------------------------------------------- | ------------------------------------------------------------ | ----------------- | ------------------------------- |
| `apps/desktop/src/main/handlers/slide-handlers.ts`        | `registerSlideCapabilityHandlers()` の呼び出しを追加         | UT-SLIDE-IMPL-001 | 実装順序3 完了後                |
| `apps/desktop/src/preload/ipc-channels.ts`                | `SLIDE_CAPABILITY_GET` / `SLIDE_CAPABILITY_CHANGED` 定数追加 | UT-SLIDE-IMPL-001 | 実装順序3 完了後                |
| `apps/desktop/src/preload/types.ts`                       | `SlideCapabilityDTO` / `SlideUIStatus` の型宣言追加          | UT-SLIDE-IMPL-001 | 実装順序2 完了後（P32 対策）    |
| `apps/desktop/src/main/services/modifier-skill.ts`        | `fallback_reason` / `suggested_action` フィールドの追加      | UT-SLIDE-IMPL-001 | 実装順序4 完了後                |
| `apps/desktop/src/main/services/skill-executor.ts`        | integrated/manual lane 分岐の実装                            | UT-SLIDE-IMPL-001 | 実装順序5 完了後                |
| `apps/desktop/src/renderer/components/SlideWorkspace.tsx` | UI 4領域（progress/guidance/fallback/terminal）の実装        | UT-SLIDE-UI-001   | 実装順序6 完了後                |
| `apps/desktop/src/renderer/store/slideSettingsStore.ts`   | `useSlideCapability` 個別セレクタの追加（P31 対策）          | UT-SLIDE-UI-001   | 実装順序6 完了後                |
| `apps/desktop/src/main/integrations/agent-client.ts`      | Agent SDK adapter 経由への移行（legacy path 削除）           | UT-SLIDE-IMPL-001 | 実装順序7 完了後（Task09 承認） |

### 2.3 変更ファイルの依存グラフ

```
packages/shared/src/slide/types.ts （新規）
  ├─→ apps/desktop/src/preload/types.ts
  ├─→ apps/desktop/src/main/handlers/slide-capability-handlers.ts （新規）
  │       └─→ apps/desktop/src/main/handlers/slide-handlers.ts
  ├─→ apps/desktop/src/main/services/skill-executor.ts
  └─→ apps/desktop/src/renderer/store/slideSettingsStore.ts
        └─→ apps/desktop/src/renderer/components/SlideWorkspace.tsx

apps/desktop/src/preload/ipc-channels.ts
  ├─→ apps/desktop/src/main/handlers/slide-capability-handlers.ts
  └─→ apps/desktop/src/renderer/（window.electronAPI 経由）
```

## 3. 除外ファイル一覧

### 3.1 本タスクでは変更しない（Task09 governance に委譲）

| ファイルパス                                                  | 除外理由                                                         |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| `apps/desktop/src/main/integrations/agent-client.ts` (現時点) | Task09 governance 承認後に UT-SLIDE-IMPL-001 が変更（実装順序7） |
| `apps/desktop/src/preload/slide-api.ts`（IPC namespace 統一） | IPC channel リネームは Task09 governance で一括管理              |

### 3.2 スコープ外（他タスクが所有）

| ファイルパス                                                   | 所有タスク                        | 理由                                      |
| -------------------------------------------------------------- | --------------------------------- | ----------------------------------------- |
| `apps/desktop/src/renderer/components/TerminalHandoffCard.tsx` | Task05 / UT-SLIDE-HANDOFF-DUP-001 | Task05 共有 DTO の変更は Task05 ownership |
| `apps/desktop/src/main/handlers/terminalHandlers.ts`           | Task05                            | terminal handoff は Task05 所有           |
| `apps/desktop/src/renderer/components/ChatView/`               | 他タスク                          | Slide とは独立したコンポーネントツリー    |
| `apps/desktop/src/main/handlers/skillCreatorHandlers.ts`       | Task01                            | Skill Creator は別 ownership              |

### 3.3 調査が必要だが変更の可否が未確定

| ファイルパス                                                | 調査理由                                                    | 調査担当          |
| ----------------------------------------------------------- | ----------------------------------------------------------- | ----------------- |
| `apps/desktop/src/main/handlers/slideSettingsHandlers.ts`   | `registerSlideIpcHandlers()` の現在の構造を確認する必要あり | UT-SLIDE-IMPL-001 |
| `apps/desktop/src/renderer/views/SlideView.tsx`（存在確認） | SlideWorkspace の親コンポーネントが存在するか確認           | UT-SLIDE-UI-001   |

## 4. ModifierResponse 拡張の影響範囲調査コマンド

実装タスク開始時に以下のコマンドで consumer を再調査する（V-09 対応）:

```bash
# ModifierResponse の全消費箇所
grep -rn "ModifierResponse" apps/desktop/src/ --include="*.ts" --include="*.tsx"

# fallback_reason / suggested_action の既存参照（現時点では0件のはず）
grep -rn "fallback_reason\|suggested_action" apps/desktop/src/

# SlideCapabilityDTO の既存参照（現時点では0件のはず）
grep -rn "SlideCapabilityDTO\|SlideUIStatus" apps/desktop/src/

# agent-client.ts の direct SDK 利用箇所
grep -rn "agent-client\|@anthropic-ai/sdk" apps/desktop/src/main/
```

## 5. ファイル数サマリー

| カテゴリ         | ファイル数 | 担当タスク                                          |
| ---------------- | ---------- | --------------------------------------------------- |
| 新規作成         | 6          | UT-SLIDE-IMPL-001（5）+ UT-SLIDE-UI-001（0）+テスト |
| 既存変更         | 8          | UT-SLIDE-IMPL-001（6）+ UT-SLIDE-UI-001（2）        |
| 除外（委譲）     | 3          | Task05 / Task09 / UT-SLIDE-HANDOFF-DUP-001          |
| 除外（調査待ち） | 2          | UT-SLIDE-IMPL-001 / UT-SLIDE-UI-001 で調査          |
| **合計（対象）** | **14**     |                                                     |

## 6. ownership 衝突チェック

Phase 2 contract-matrix.md § 3 の ownership テーブルとの整合を確認する:

| ファイル                 | Phase 2 ownership          | 本文書の担当タスク                         | 整合   |
| ------------------------ | -------------------------- | ------------------------------------------ | ------ |
| agent-client.ts          | UT-SLIDE-IMPL-001          | UT-SLIDE-IMPL-001                          | OK     |
| modifier-skill.ts        | UT-SLIDE-IMPL-001          | UT-SLIDE-IMPL-001                          | OK     |
| skill-executor.ts        | Task08 → UT-SLIDE-IMPL-001 | UT-SLIDE-IMPL-001                          | OK     |
| SlideWorkspace.tsx       | UT-SLIDE-UI-001            | UT-SLIDE-UI-001                            | OK     |
| slideSettingsStore.ts    | 共有（IPC check 付き）     | UT-SLIDE-UI-001（capability セレクタ追加） | OK     |
| slideSettingsHandlers.ts | 共有（IPC check 付き）     | 調査待ち（変更の可否未確定）               | 要確認 |
