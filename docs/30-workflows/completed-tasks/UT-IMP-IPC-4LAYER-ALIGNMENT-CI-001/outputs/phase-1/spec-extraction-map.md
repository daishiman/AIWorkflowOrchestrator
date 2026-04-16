# Phase 1 成果物: 仕様マッピング

| 項目   | 内容                               |
| ------ | ---------------------------------- |
| Phase  | 1                                  |
| タスク | タスク4: 仕様マッピング            |
| 機能名 | UT-IMP-IPC-4LAYER-ALIGNMENT-CI-001 |
| 作成日 | 2026-04-14                         |

---

## 1. 仕様抽出起点

| 起点           | パス                                                                                                                      | 用途                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| IPC命名監査    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-naming.md`          | IPC命名規則と監査パターン  |
| IPC契約監査    | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-contract-audits.md` | データフロー型ギャップ検出 |
| リソースマップ | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`                                                          | 仕様抽出起点               |

---

## 2. 仕様カテゴリ分類

### 2.1 IPC アーキテクチャ仕様

| 仕様ID   | 仕様名                     | 関連要件 | Current Code Anchor                               |
| -------- | -------------------------- | -------- | ------------------------------------------------- |
| SPEC-A01 | 4層 IPC アーキテクチャ     | FR-1〜3  | `packages/shared/src/ipc/channels.ts` (正本定義)  |
| SPEC-A02 | チャネル命名規則           | FR-6     | `domain:operation` 形式 (例: `skill:list`)        |
| SPEC-A03 | preload セキュリティモデル | FR-1     | `ALLOWED_INVOKE_CHANNELS` / `ALLOWED_ON_CHANNELS` |
| SPEC-A04 | contextBridge API公開      | FR-3     | `apps/desktop/src/preload/index.ts` L138-179      |

### 2.2 IPC インターフェース仕様

| 仕様ID   | 仕様名                        | 関連要件 | Current Code Anchor                                        |
| -------- | ----------------------------- | -------- | ---------------------------------------------------------- |
| SPEC-I01 | shared チャネル定義パターン   | FR-1     | `export const XXX_CHANNELS = { ... } as const`             |
| SPEC-I02 | 個別 export パターン          | FR-1     | `export const SKILL_CREATOR_OUTPUT_READY = "..." as const` |
| SPEC-I03 | IPC_CHANNELS 集約オブジェクト | FR-1     | `export const IPC_CHANNELS = { ...spread } as const`       |
| SPEC-I04 | preload IPC_CHANNELS (独自)   | FR-2     | `apps/desktop/src/preload/channels.ts` L16-422             |
| SPEC-I05 | safeInvoke/safeOn ラッパー    | FR-3     | `apps/desktop/src/preload/index.ts` L115-136               |
| SPEC-I06 | ipcMain.handle 登録パターン   | FR-2     | `ipcMain.handle('channel', async (event, ...) => ...)`     |

### 2.3 セキュリティ仕様

| 仕様ID   | 仕様名                    | 関連要件   | Current Code Anchor                      |
| -------- | ------------------------- | ---------- | ---------------------------------------- |
| SPEC-S01 | チャネルホワイトリスト    | FR-1, FR-2 | `ALLOWED_INVOKE_CHANNELS` (296 エントリ) |
| SPEC-S02 | on チャネルホワイトリスト | FR-1       | `ALLOWED_ON_CHANNELS` (56 エントリ)      |
| SPEC-S03 | 未許可チャネルのブロック  | FR-4       | `safeInvoke` での `includes()` チェック  |

### 2.4 CI/ワークフロー仕様

| 仕様ID   | 仕様名              | 関連要件 | Current Code Anchor                           |
| -------- | ------------------- | -------- | --------------------------------------------- |
| SPEC-W01 | CI パイプライン構成 | AC-7     | `.github/workflows/ci.yml`                    |
| SPEC-W02 | build-shared 依存   | AC-7     | `needs: [build-shared]` パターン              |
| SPEC-W03 | 既存IPC契約チェック | NFR-3    | `apps/desktop/scripts/check-ipc-contracts.ts` |

---

## 3. 仕様 -> 要件 マッピング

| 仕様ID   | 要件ID     | 関係性                                                     |
| -------- | ---------- | ---------------------------------------------------------- |
| SPEC-A01 | FR-1〜3    | 4層アーキテクチャが検証の前提                              |
| SPEC-A02 | FR-6       | 命名規則に基づく正規表現パターン設計                       |
| SPEC-A03 | FR-1       | ホワイトリストが Rule-1 の検証対象                         |
| SPEC-A04 | FR-3       | contextBridge が renderer -> preload の接点                |
| SPEC-I01 | FR-1       | shared パーサーが解析するパターン                          |
| SPEC-I02 | FR-1       | 個別 export もパーサー対象に含める                         |
| SPEC-I03 | FR-1       | IPC_CHANNELS 集約が「shared で定義された全チャネル」の定義 |
| SPEC-I04 | FR-2       | preload 独自 IPC_CHANNELS が preload パーサーの対象        |
| SPEC-I05 | FR-3       | safeInvoke/safeOn が renderer 使用チャネルの代理指標       |
| SPEC-I06 | FR-2       | main パーサーが解析するパターン                            |
| SPEC-S01 | FR-1, FR-2 | invoke ホワイトリストが Rule-1, Rule-2 の検証対象          |
| SPEC-S02 | FR-1       | on ホワイトリストが Rule-1 の検証対象                      |
| SPEC-S03 | FR-4       | 未許可チャネルブロックの自動検証                           |
| SPEC-W01 | AC-7       | CI 統合先のワークフロー構成                                |
| SPEC-W02 | AC-7       | shared ビルド依存の正確な設定                              |
| SPEC-W03 | NFR-3      | 共存対象の既存スクリプト仕様                               |

---

## 4. Current Code Anchor 一覧

| Anchor ID | ファイルパス                                       | 行範囲   | 内容                         |
| --------- | -------------------------------------------------- | -------- | ---------------------------- |
| CCA-01    | `packages/shared/src/ipc/channels.ts`              | L1-235   | 4層正本チャネル定義          |
| CCA-02    | `apps/desktop/src/preload/channels.ts`             | L1-783   | preload ホワイトリスト定義   |
| CCA-03    | `apps/desktop/src/preload/index.ts`                | L115-136 | safeInvoke/safeOn 定義       |
| CCA-04    | `apps/desktop/src/preload/index.ts`                | L138-    | electronAPI オブジェクト構築 |
| CCA-05    | `apps/desktop/src/main/ipc/`                       | 全体     | ipcMain.handle/on ハンドラ群 |
| CCA-06    | `apps/desktop/scripts/check-ipc-contracts.ts`      | L1-584   | 既存 IPC 契約チェッカー      |
| CCA-07    | `.github/workflows/ci.yml`                         | 全体     | CI パイプライン定義          |
| CCA-08    | `apps/desktop/src/preload/skill-api.ts`            | 全体     | スキル API (safeInvoke 使用) |
| CCA-09    | `apps/desktop/src/preload/skill-creator-api.ts`    | 全体     | スキルクリエイター API       |
| CCA-10    | `apps/desktop/src/preload/api/notification-api.ts` | 全体     | 通知 API (safeInvoke 使用)   |

---

## 5. 未カバー仕様（スコープ外）

| 仕様                                | スコープ外の理由                             |
| ----------------------------------- | -------------------------------------------- |
| IPC 引数型定義の整合性              | 既存 check-ipc-contracts.ts が R-02 でカバー |
| チャネル名のリテラル使用検出        | 既存 check-ipc-contracts.ts が R-03 でカバー |
| AST ベースの精密解析                | NFR-2 (外部依存なし) の制約                  |
| renderer コンポーネントの網羅テスト | 本タスクはCIスクリプト実装のみ               |
