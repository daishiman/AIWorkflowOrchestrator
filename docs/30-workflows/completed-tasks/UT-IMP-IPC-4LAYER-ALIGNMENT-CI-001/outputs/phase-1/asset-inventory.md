# Phase 1 成果物: 既存資産棚卸し

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 1                                  |
| タスク | タスク1: 既存資産棚卸し            |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## 1. 既存検証スクリプト: check-ipc-contracts.ts

### 基本情報

| 項目     | 値                                            |
| -------- | --------------------------------------------- |
| パス     | `apps/desktop/scripts/check-ipc-contracts.ts` |
| 行数     | 584行                                         |
| 言語     | TypeScript                                    |
| 実行方式 | Node.js (ts実行)                              |
| 検証対象 | main handler <-> preload (safeInvoke/safeOn)  |

### 検証ルール

| ルール | 名称                 | 検出対象                                     | 重要度  |
| ------ | -------------------- | -------------------------------------------- | ------- |
| R-01   | main-only orphan     | mainで登録されpreloadに未使用のチャネル      | warning |
| R-02   | arg pattern mismatch | main/preload間の引数パターン不一致           | error   |
| R-03   | literal channel name | 定数でなく文字列リテラルで書かれたチャネル名 | warning |
| R-04   | preload-only orphan  | preloadで使用されmainに未登録のチャネル      | error   |

### 主要関数

| 関数                      | 責務                                                     |
| ------------------------- | -------------------------------------------------------- |
| `extractMainHandlers()`   | main/ipc/\*.ts から `ipcMain.handle/on` を正規表現で抽出 |
| `extractPreloadEntries()` | preload/\*.ts から `safeInvoke/safeOn` を正規表現で抽出  |
| `resolveChannelMap()`     | チャネル定数オブジェクトから `KEY: "value"` マップを構築 |
| `mergeChannelMaps()`      | 複数ファイルのチャネルマップをマージ                     |
| `matchAndValidate()`      | handler/preload のチャネル集合を比較しドリフト検出       |
| `generateReport()`        | markdown / JSON 形式でレポート生成                       |

### 検証対象範囲（カバー/未カバー）

| 検証                          | カバー | 備考                     |
| ----------------------------- | ------ | ------------------------ |
| main handler <-> preload 呼出 | YES    | R-01〜R-04 で検出        |
| shared -> preload 整合性      | **NO** | 今回の新スクリプトで補完 |
| renderer -> shared 整合性     | **NO** | 今回の新スクリプトで補完 |
| 引数パターン不一致            | YES    | R-02 で検出              |
| チャネル命名規則違反          | YES    | R-03 で検出              |

---

## 2. 4層ファイル現状分析

### Layer 1: shared channels.ts（正本）

| 項目                 | 値                                             |
| -------------------- | ---------------------------------------------- |
| パス                 | `packages/shared/src/ipc/channels.ts`          |
| 行数                 | 235行                                          |
| エクスポートパターン | `export const XXX_CHANNELS = { ... } as const` |
| 命名規則             | `domain:operation` 形式                        |

#### 定義されたチャネルグループ

| グループ名                            | チャネル数 | 例                              |
| ------------------------------------- | ---------- | ------------------------------- |
| `CHAT_EXPORT_CHANNELS`                | 2          | `chat:exportSession`            |
| `FILE_SYSTEM_CHANNELS`                | 3          | `dialog:showSaveDialog`         |
| `SKILL_CHANNELS`                      | 14         | `skill:list`, `skill:execute`   |
| `NOTIFICATION_CHANNELS`               | 6          | `notification:get-history`      |
| `HISTORY_SEARCH_CHANNELS`             | 2          | `history:search`                |
| `APPROVAL_CHANNELS`                   | 2          | `approval:respond`              |
| `EXECUTION_CHANNELS`                  | 3          | `execution:get-disclosure-info` |
| `SKILL_CREATOR_SESSION_CHANNELS`      | 6          | `skill-creator:start-session`   |
| `SKILL_CREATOR_EXTERNAL_API_CHANNELS` | 3          | `skill-creator:configure-api`   |
| `SKILL_CREATOR_RUNTIME_CHANNELS`      | 3          | `skill-creator:progress`        |
| 個別 export (4件)                     | 4          | `skill-creator:output-ready`    |

**合計**: `IPC_CHANNELS` に集約された約 48 チャネル

### Layer 2: preload channels.ts（ホワイトリスト）

| 項目                    | 値                                          |
| ----------------------- | ------------------------------------------- |
| パス                    | `apps/desktop/src/preload/channels.ts`      |
| 行数                    | 783行                                       |
| IPC_CHANNELS 定義数     | 約 250 チャネル（独自定義 + shared import） |
| ALLOWED_INVOKE_CHANNELS | 約 296 エントリ                             |
| ALLOWED_ON_CHANNELS     | 約 56 エントリ                              |

#### shared からの import

```typescript
import {
  APPROVAL_CHANNELS,
  EXECUTION_CHANNELS,
  SKILL_CREATOR_EXTERNAL_API_CHANNELS,
  SKILL_CREATOR_OUTPUT_READY,
  SKILL_CREATOR_OUTPUT_OVERWRITE_APPROVED,
  SKILL_CREATOR_OPEN_SKILL,
  SKILL_CREATOR_SESSION_CHANNELS,
  SKILL_CREATOR_RUNTIME_CHANNELS,
  SKILL_CREATOR_VERIFY,
} from "@repo/shared/src/ipc/channels";
```

**注意点**: preload は独自の `IPC_CHANNELS` を定義しており、shared の `IPC_CHANNELS` とは **別物**。shared よりも大幅に多いチャネルを含む。

### Layer 3: main handlers（実装）

| 項目                | 値                                                                      |
| ------------------- | ----------------------------------------------------------------------- |
| パス                | `apps/desktop/src/main/ipc/`                                            |
| ハンドラファイル数  | 55ファイル（テスト含む）                                                |
| `ipcMain.handle/on` | 214件（テストファイル含む全体）                                         |
| 登録パターン        | `ipcMain.handle('channel', handler)` / `ipcMain.on('channel', handler)` |

#### 主要ハンドラファイル一覧

- `agentHandlers.ts` (8件)
- `skillHandlers.ts` (31件)
- `creatorHandlers.ts` (19件)
- `profileHandlers.ts` (11件)
- `skillCreatorHandlers.ts` (12件)
- `session-persistence-handler.ts` (9件)
- `searchHandlers.ts` (7件)
- `skillFileHandlers.ts` (7件)
- `systemPromptHandlers.ts` (7件)
- その他 30+ ファイル

### Layer 4: renderer（消費者）

| 項目                | 値                                            |
| ------------------- | --------------------------------------------- |
| パス                | `apps/desktop/src/renderer/`                  |
| ProductionSink.ts   | **存在しない**                                |
| IPC呼び出しパターン | `window.electronAPI.*` 経由のメソッド呼び出し |
| 対象ファイル数      | 40+ ファイル                                  |

#### renderer の IPC 使用パターン

renderer は `window.electronAPI` 経由で preload が `contextBridge.exposeInMainWorld` で公開した API を呼び出す。直接 `safeInvoke`/`safeOn` を呼び出すのではなく、preload が構築した高レベル API（例: `electronAPI.file.read()`, `electronAPI.skill.list()`）を利用する。

**重要な設計判断**: renderer 層の検証は `safeInvoke`/`safeOn` ではなく、preload の `index.ts` 内で `safeInvoke(IPC_CHANNELS.XXX)` として呼ばれるチャネルを対象とする。renderer が直接チャネル名を知ることはなく、preload API を通じて間接的に使用する。

---

## 3. 既存CIワークフロー

| 項目      | 値                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| パス      | `.github/workflows/ci.yml`                                                                                          |
| トリガー  | push (main), pull_request (main), merge_group, workflow_dispatch                                                    |
| 主要 jobs | lint, typecheck, build-shared, test-shared, test-desktop, e2e-desktop, check-module-sync, security, coverage, build |
| IPC検証   | **なし**（現状未組み込み）                                                                                          |
| Node.js   | v22                                                                                                                 |
| pnpm      | action-setup@v4                                                                                                     |

---

## 4. 既存スクリプトと新規スクリプトの機能差分

| 検証項目                  | check-ipc-contracts.ts | verify-ipc-4layer.js (新規) |
| ------------------------- | ---------------------- | --------------------------- |
| shared -> preload 整合性  | -                      | Rule-1                      |
| preload -> main 整合性    | R-01, R-04             | Rule-2                      |
| renderer -> shared 整合性 | -                      | Rule-3                      |
| 引数パターン不一致        | R-02                   | -（スコープ外）             |
| 文字列リテラル検出        | R-03                   | -（スコープ外）             |
| チャネル存在性検証        | 部分的                 | 4層全網羅                   |
| CI統合                    | なし                   | GitHub Actions job          |
| 外部依存                  | TypeScript実行環境必要 | Node.js 標準のみ            |

**結論**: 2つのスクリプトは**補完関係**にあり、機能重複は preload<->main の存在性検証のみ。新規スクリプトは「チャネル存在性の4層横断検証」、既存スクリプトは「引数パターン・命名規則の品質検証」に特化している。

---

## 5. 前タスク成果物の棚卸し

| コミット    | 内容                                                |
| ----------- | --------------------------------------------------- |
| `e58e7cc58` | 完了タスクドキュメント整理・スキルメタデータ同期    |
| `6d42260b8` | Renderer エラーメッセージ UI 表示 E2E 確認          |
| `c3f5bb584` | analytics HTTP送信機能コメント化・Dashboard UI削除  |
| `904282dcd` | スキル名パターン shared 一元化 + cronConverter 修正 |
| `d9070f804` | VisualCronPicker UIバリデーション実装               |

**新規作業との差異**: 今回は既存コードの変更ではなく、新規 CI スクリプトの追加。既存ファイルへの影響は `.github/workflows/ci.yml` への job 追加のみ。
