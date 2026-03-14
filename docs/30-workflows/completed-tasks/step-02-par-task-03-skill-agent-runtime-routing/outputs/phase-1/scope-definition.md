# Phase 1 要件定義 - スコープ定義

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase      | 1                                        |
| 作成日     | 2026-03-14                               |
| ステータス | completed                                |

---

## 1. 対象範囲（IN SCOPE）

### 1.1 設計ドキュメント対象

| 対象                       | 内容                                                              | 理由                     |
| -------------------------- | ----------------------------------------------------------------- | ------------------------ |
| shared runtime policy 設計 | access capability 解決と engine 選択の分離設計                    | 全 surface の統一基盤    |
| preflight 拡張設計         | auth-mode 分岐を含む preflight 契約                               | 既存保証を維持しつつ拡張 |
| terminal handoff 設計      | prompt bundle / launcher / cwd / runbook の構造                   | claude_code モード対応   |
| UI/UX 設計                 | execution bar / permission dialog / handoff card / result summary | Renderer surface 統一    |
| Internal role 設計         | Planner / Executor / Improver の責務と IPC                        | Creator service 対応     |
| IPC 契約設計               | skill:execute / agent:query / creator:xxx チャンネルの統一        | 全 surface 共通          |

### 1.2 対象ファイル（参照・設計対象）

| ファイル                         | スコープ内の関心                      |
| -------------------------------- | ------------------------------------- |
| `SkillExecutor.ts`               | auth-mode 対応・runtime policy 注入点 |
| `AgentExecutor.ts`               | auth-mode 対応・runtime policy 注入点 |
| `skillExecutionAuthPreflight.ts` | preflight 拡張設計                    |
| `SkillService.ts`                | DI 点と Creator handoff               |
| `AgentHandler.ts`                | auth-mode 動的注入                    |
| `useAgent.ts`                    | auth-mode store 参照追加              |
| `AgentChatInterface.tsx`         | streaming + permission UI             |
| `AgentSDKPage/index.tsx`         | auth/session UI contract              |
| `claude-cli/ipc-handler.ts`      | terminal handoff 受け口               |

### 1.3 system spec 同期対象

phase-12-documentation.md に記載の全 spec ファイル（workflow-ai-runtime-authmode-unification.md ほか 19 ファイル）

---

## 2. 除外範囲（OUT OF SCOPE）

| 除外事項                    | 理由                                         |
| --------------------------- | -------------------------------------------- |
| 実際のコード変更（実装）    | 本タスクは設計・仕様化のみ。実装は後続タスク |
| SkillCreatorService の実装  | 未実装コンポーネント。設計のみ対象           |
| Supabase / OAuth 認証フロー | auth-mode は既存設定値として参照するのみ     |
| MCP server 統合             | 別タスクスコープ                             |
| テストコードの変更          | 本タスクはテスト仕様定義のみ                 |
| CI/CD パイプライン変更      | 本タスクの範囲外                             |
| PR 作成 / merge             | Phase 13 で PR 素材整理のみ                  |

---

## 3. 設計の前提制約

### 3.1 アーキテクチャ制約

- Renderer → Preload → Main の一方向 IPC 依存を変えない
- `contextIsolation: true` / `nodeIntegration: false` を変えない
- 既存 IPC チャンネル名（`skill:execute` / `agent:query` 等）を互換維持する

### 3.2 auth-mode 制約

- auth-mode の値は `integrated_api` / `claude_code` の 2 択（Task01 foundation 契約）
- auth-mode の解決は execute 入口（Main Process 側）で行う。Renderer 側で local 判定しない
- auth-mode 切替は UI の mode 切替に直接反映しない（internal policy のみ）

### 3.3 UI/UX 制約

- internal role（Planner / Executor / Improver）は UI に露出しない
- job 名（`作成` / `実行` / `改善`）で統一表示
- lifecycle header に常設 `Terminal` ボタンを配置（どの job からでも terminal dock を開ける）

### 3.4 permission 制約

- preflight / permission / streaming の既存保証を破らない
- PermissionStore（rememberChoice）の動作を変えない

---

## 4. 受入基準（Acceptance Criteria）

| ID   | 基準                                                                                                     |
| ---- | -------------------------------------------------------------------------------------------------------- |
| AC-1 | runtime と auth-mode の現状経路が Skill / Agent / Creator / Agent SDK UI / Hook / CLI まで整理されている |
| AC-2 | 維持すべき preflight と permission 契約が抜き出されている                                                |
| AC-3 | 設計スコープ（IN / OUT）が明確に定義されている                                                           |
| AC-4 | terminal handoff の対象範囲が定義されている                                                              |
| AC-5 | skill-lifecycle Task03 が参照できる runtime policy interface の必要事項が特定されている                  |

---

## 5. 依存タスク

| タスク                                         | 方向       | 内容                                            |
| ---------------------------------------------- | ---------- | ----------------------------------------------- |
| Task01: ai-runtime-authmode-foundation         | 依存元     | access capability resolver / auth-mode 基本契約 |
| skill-lifecycle Task03                         | 後続提供先 | 本タスクの runtime policy 設計を参照            |
| TASK-FIX-SAFEINVOKE-TIMEOUT-001                | 並行参照   | preflight IPC timeout 設計への影響              |
| TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 | 並行参照   | auth guard との整合確認                         |

---

## 完了確認

- [x] 対象範囲（IN SCOPE）が明記されている
- [x] 除外範囲（OUT OF SCOPE）が明記されている
- [x] 設計の前提制約が定義されている
- [x] 受入基準が定義されている
