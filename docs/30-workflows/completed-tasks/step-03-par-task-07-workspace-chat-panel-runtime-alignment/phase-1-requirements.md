# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                         |
| ---------- | -------------------------------------------- |
| Phase      | 1                                            |
| Phase名    | 要件定義                                     |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001 |
| 前提Phase  | なし                                         |
| 後続Phase  | Phase 2（設計）                              |
| ステータス | not_started                                  |
| 作成日     | 2026-03-13                                   |
| 機能名     | workspace-chat-panel-runtime-alignment       |

## 目的

Workspace Chat Panel（Task08）の current gap を整理し、API runtime streaming / file context handoff / conversation 永続化 / terminal handoff に必要な要件を定義する。streaming と context handoff が分散している現状を棚卸しし、`Integrated API Runtime` と `Claude Code Terminal Surface` の両立に必要な capability、authority、非機能要件を確定する。

## P50 チェック（既実装状態の調査）

> P50: Phase 4 開始前に対象ファイルの `git log` と現在のコードを確認し、既に実装済みかどうかを判定する。

### 調査コマンド

```bash
# 1. 対象ファイルの直近変更履歴を確認する
git log --oneline -10 -- apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx
git log --oneline -10 -- apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts
git log --oneline -10 -- apps/desktop/src/renderer/views/WorkspaceView/index.tsx
git log --oneline -10 -- apps/desktop/src/main/handlers/llm.ts
git log --oneline -10 -- apps/desktop/src/main/repositories/conversationRepository.ts
git log --oneline -10 -- apps/desktop/src/main/utils/buildMessages.ts

# 2. streaming 関連の TODO / stub / placeholder を検索する
grep -rn "TODO\|FIXME\|stub\|placeholder\|HACK" \
  apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx \
  apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts \
  apps/desktop/src/main/handlers/llm.ts \
  apps/desktop/src/main/utils/buildMessages.ts

# 3. access capability / authMode / runtime の local 判定を検索する
grep -rn "authMode\|accessCapability\|isApiKeyMode\|subscription" \
  apps/desktop/src/renderer/views/WorkspaceView/ \
  apps/desktop/src/main/handlers/llm.ts

# 4. terminal handoff / launcher の既存実装を検索する
grep -rn "terminal\|handoff\|launcher\|Claude Code" \
  apps/desktop/src/renderer/views/WorkspaceView/

# 5. conversation 永続化の current path を検索する
grep -rn "saveConversation\|loadConversation\|conversationRepository" \
  apps/desktop/src/renderer/views/WorkspaceView/ \
  apps/desktop/src/main/handlers/llm.ts

# 6. streaming cancel の current path を検索する
grep -rn "cancel\|abort\|AbortController" \
  apps/desktop/src/renderer/views/WorkspaceView/ \
  apps/desktop/src/main/handlers/llm.ts
```

### 調査結果の記録先

- `outputs/phase-1/requirements-definition.md` の冒頭セクション「P50 調査結果」に記録する
- 既実装箇所は Phase 4-5 を「検証・補完」モードに切り替える判断材料とする

## 実行タスク

### T1-1: inventory 整理

以下の 6 機能の current path（ファイル名、関数名、IPC チャンネル名）を整理する。

| 機能              | 調査対象                                                   | 確認ポイント                                     |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| stream            | `useWorkspaceChatController.ts` / `llm.ts`                 | `llm:stream-chat` の呼び出しと chunk 受信経路    |
| cancel            | `useWorkspaceChatController.ts` / `llm.ts`                 | `llm:cancel-stream` の呼び出しと AbortController |
| selected files    | `WorkspaceChatPanel.tsx` / `useWorkspaceChatController.ts` | context chips UI と file content 取得経路        |
| mention           | `WorkspaceChatPanel.tsx`                                   | mention picker の current 実装とデータソース     |
| conversation 保存 | `useWorkspaceChatController.ts` / `conversationRepository` | 保存トリガー、保存タイミング、永続化先           |
| selected config   | `useWorkspaceChatController.ts` / `llm.ts`                 | provider / model の選択状態と IPC への渡し方     |

### T1-2: authority 整理

以下の 5 関心ごとの最終判定主体（Main Process / Renderer / Preload）を列挙する。

| 関心ごと          | 想定判定主体    | 確認ポイント                                                    |
| ----------------- | --------------- | --------------------------------------------------------------- |
| access capability | Main Process    | `isIntegratedRuntimeAvailable` の判定ロジックと消費元           |
| provider / model  | Main Process    | selected config の validation と fallback 有無                  |
| file context      | Main Process    | file read の permission check と size limit enforcement         |
| conversation      | Main + Renderer | 保存は Main、表示状態は Renderer の責務分離が正しいか           |
| stream lifecycle  | Main Process    | stream 開始 / chunk 送信 / error / cancel の lifecycle 管理主体 |

### T1-3: gap 整理

以下の 3 カテゴリで gap を検出する。

| カテゴリ                         | 検出対象                                                                                 |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| local-only state                 | Renderer 側で access capability を独自判定している箇所（Task01 の access matrix 未消費） |
| workspace surface 固有 fail-fast | API key 不足 / provider 未設定 / model 未選択時の早期拒否が実装されているか              |
| guidance 不足                    | unavailable / blocked 状態で「次に何をすべきか」が表示されているか                       |

### T1-4: 非機能要件整理

| 非機能要件                    | 確認ポイント                                      | 定義する内容                       |
| ----------------------------- | ------------------------------------------------- | ---------------------------------- |
| streaming latency             | 初回 chunk 表示までの許容時間、chunk 間隔の上限   | SLA 値と計測方法                   |
| file context size limit       | selected files の合計サイズ上限、超過時の振る舞い | 上限バイト数と truncation 戦略     |
| conversation 永続化タイミング | 送信ごとか、session 終了時か、定期保存か          | 保存タイミングとデータロス許容範囲 |

## 参照資料

### ソースコード

| 参照資料                   | パス                                                                                | 内容                                                              |
| -------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| WorkspaceChatPanel         | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`              | workspace chat UI surface を確認する                              |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | stream / selected config / file context handoff を確認する        |
| WorkspaceView              | `apps/desktop/src/renderer/views/WorkspaceView/index.tsx`                           | panel 統合位置と file preview 連携を確認する                      |
| llm handlers               | `apps/desktop/src/main/handlers/llm.ts`                                             | `llm:stream-chat` / cancel / selected config authority を確認する |
| conversation repository    | `apps/desktop/src/main/repositories/conversationRepository.ts`                      | conversation 永続化の current path を確認する                     |
| buildMessages              | `apps/desktop/src/main/utils/buildMessages.ts`                                      | message 正規化と file context handoff を確認する                  |
| completed task 059a        | `docs/30-workflows/completed-tasks/task-059a-ui-04b-workspace-chat-panel/index.md`  | 既存 UI / streaming 正本を確認する                                |

### システム仕様（aiworkflow-requirements）

> 実装前に以下の正本仕様を確認し、既存設計との整合性を確保する。

| 参照資料                                        | パス                                                                                                   | 内容                                                                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| interfaces-llm                                  | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                  | workspace chat と conversation の正本                                                                                  |
| llm-streaming                                   | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`                                   | stream chat / cancel 契約の正本                                                                                        |
| ui-ux-feature-components                        | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                        | Workspace Chat Panel UI の正本                                                                                         |
| ui-ux-navigation                                | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                                | workspace 導線の正本                                                                                                   |
| arch-state-management                           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                           | selected files / state handoff の正本                                                                                  |
| workflow-apikey-chat-tool-integration-alignment | `.claude/skills/aiworkflow-requirements/references/workflow-apikey-chat-tool-integration-alignment.md` | selected config と auth key の既存ルール                                                                               |
| error-handling                                  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                  | fail-fast / guidance / silent の error category 定義（streaming failure / file read failure / API key 不足の分類根拠） |
| security-electron-ipc                           | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                           | IPC sender 検証 / path traversal 防止 / error masking の正本                                                           |

### 親パック正本

| 参照資料          | パス                                                                       | 内容                                                        |
| ----------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- |
| パック index      | `docs/30-workflows/ai-runtime-authmode-unification/index.md`               | access matrix 方針と Task08 の責務定義                      |
| UI/UX realization | `docs/30-workflows/ai-runtime-authmode-unification/ui-ux-realization.md`   | Workspace Chat Panel の UI/UX 正本（UX-04 screenshot 契約） |
| design audit      | `docs/30-workflows/ai-runtime-authmode-unification/design-audit-matrix.md` | 設計監査結論と抽象の正しさ判定                              |

## 実行手順

### ステップ0: P50 チェック（既実装状態の調査）

1. 「P50 チェック」セクションの調査コマンドを実行する
2. 対象 6 ファイルの直近コミット履歴と TODO / stub / placeholder の残存状況を記録する
3. access capability の local 判定、terminal handoff、conversation 永続化の既実装状態を判定する
4. 結果を `outputs/phase-1/requirements-definition.md` の「P50 調査結果」セクションに記録する

### ステップ1: 参照資料の確認

以下の読み順序で参照資料を確認する。

1. **親パック index.md** — Task08 の責務（streaming と context handoff が分散 -> API runtime streaming と terminal handoff を両立）を確認する
2. **ui-ux-realization.md** — Workspace Chat Panel の Surface 別 UI/UX 定義（主要状態: zero / streaming / cancel / guidance / compact、Screenshot 契約 UX-04）を確認する
3. **interfaces-llm.md** — `llm:stream-chat` / conversation の IPC 契約を確認する
4. **llm-streaming.md** — streaming の chunk format / cancel protocol を確認する
5. **arch-state-management.md** — selected files / state handoff の Zustand slice 構成を確認する
6. **workflow-apikey-chat-tool-integration-alignment.md** — selected config と auth key の既存ルールを確認する
7. **completed task 059a index.md** — 既存 UI / streaming 実装の正本を確認する

### ステップ2: ソースコード調査

対象ファイルの具体的な確認ポイント。

| ファイル                        | 確認ポイント                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `WorkspaceChatPanel.tsx`        | context chips の props、composer の送信ハンドラ、mention picker の実装状況、compact width 対応 |
| `useWorkspaceChatController.ts` | stream 開始/停止の lifecycle、selected config の取得元、file context の渡し方、cancel の実装   |
| `WorkspaceView/index.tsx`       | WorkspaceChatPanel の配置、file preview との連携、panel 間の state 共有                        |
| `llm.ts`（handlers）            | `llm:stream-chat` の引数形式、AbortController の管理、error envelope の形式                    |
| `conversationRepository.ts`     | CRUD メソッドの signature、保存トリガー、永続化先（SQLite / file / memory）                    |
| `buildMessages.ts`              | message 正規化の入力形式、file context の結合方法、system prompt の挿入位置                    |

### ステップ3: 実行タスクの順次実施

1. **T1-1 inventory 整理** を実施し、6 機能の current path を表形式で記録する
2. **T1-2 authority 整理** を実施し、5 関心ごとの判定主体を表形式で記録する
3. **T1-3 gap 整理** を実施し、local-only state / fail-fast / guidance の gap を列挙する
4. **T1-4 非機能要件整理** を実施し、latency / size limit / 永続化タイミングの要件を確定する

### ステップ4: system spec との整合確認

以下の整合チェックを実施する。

| チェック対象         | 照合先                                               | 確認内容                                                          |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| IPC 契約             | `interfaces-llm.md` / `llm-streaming.md`             | `llm:stream-chat` の引数形式と chunk format が一致しているか      |
| UI 状態              | `ui-ux-realization.md` UX-04                         | zero / streaming / cancel / guidance / compact の 5 状態が網羅か  |
| state handoff        | `arch-state-management.md`                           | selected files が Zustand slice 経由で正しく渡されているか        |
| security             | `security-electron-ipc.md`                           | sender 検証と error masking が IPC handler に実装されているか     |
| selected config 契約 | `workflow-apikey-chat-tool-integration-alignment.md` | provider / model の取得と validation が既存ルールに準拠しているか |

### ステップ5: 成果物と完了条件の確認

成果物パス、完了条件チェックリスト、Phase 2 への handoff 情報を確認して記録する。

## 統合テスト連携

| テスト観点            | 接続要件                                                                 | 検証方法                                                  |
| --------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------- |
| stream 接続           | `llm:stream-chat` IPC が正しい引数で呼ばれ、chunk が Renderer に到達する | IPC mock + chunk sequence assertion                       |
| cancel 接続           | cancel 操作で `llm:cancel-stream` が呼ばれ、stream が停止する            | AbortController mock + state transition assertion         |
| selected files 接続   | context chips に表示された file の内容が buildMessages に渡される        | file content mock + message array assertion               |
| mention 接続          | mention picker の選択結果が message に含まれる                           | mention data mock + message content assertion             |
| conversation 保存接続 | message 送受信後に conversationRepository.save が呼ばれる                | repository mock + save timing assertion                   |
| access capability     | access matrix が `unavailable` の時に stream が開始されない              | capability mock + CTA disabled assertion                  |
| selected config 接続  | provider / model の選択が `llm:stream-chat` の引数に反映される           | config mock + IPC argument assertion                      |
| terminal handoff      | handoff 状態で terminal launcher が表示され、auto-send が発生しない      | state mock + launcher visibility + no-auto-send assertion |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 確認内容                                                                                                                                                         |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| UI/UX              | WorkspaceChatPanel の 5 状態（zero / streaming / cancel / guidance / compact）が UX-04 に準拠しているか                                                          |
| アーキテクチャ     | streaming（Main -> Renderer chunk push）、file context（Renderer -> Main file read）、conversation（Main 永続化）の責務分離が正しいか                            |
| API 設計           | `llm:stream-chat` の引数形式（provider, model, messages, selectedFiles）と `llm:cancel-stream` の cancel protocol が `llm-streaming.md` に準拠しているか         |
| エラーハンドリング | stream failure（network error / timeout / provider error）と file read failure（permission denied / file not found）の error code と guidance が定義されているか |
| セキュリティ       | IPC sender 検証、file path traversal 防止、error message masking が実装されているか                                                                              |
| 状態管理           | selected files / selected config / conversation state が Zustand slice で管理され、local-only state が残存していないか                                           |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## 成果物

| 成果物       | パス                                         | 内容                                         |
| ------------ | -------------------------------------------- | -------------------------------------------- |
| 要件整理     | `outputs/phase-1/requirements-definition.md` | P50 調査結果、要件、制約、受入基準を整理する |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 対象範囲と除外範囲を明記する                 |

## 完了条件

- [ ] P50 チェック結果が `outputs/phase-1/requirements-definition.md` に記録されている
- [ ] stream / cancel / selected files / mention / conversation / selected config の inventory が表形式で整理されている
- [ ] access capability / provider / model / file context / conversation / stream lifecycle の authority が列挙されている
- [ ] local-only state / workspace surface 固有 fail-fast / guidance 不足の gap が後続設計へ割り当てられている
- [ ] streaming latency / file context size limit / conversation 永続化タイミングの非機能要件が定義されている
- [ ] system spec（interfaces-llm / llm-streaming / arch-state-management / security-electron-ipc / workflow-apikey-chat-tool-integration-alignment）との整合確認が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

| サブタスクID | 内容                 | 依存先 | ステータス  |
| ------------ | -------------------- | ------ | ----------- |
| ST-1-0       | P50 チェック実施     | なし   | not_started |
| ST-1-1       | T1-1 inventory 整理  | ST-1-0 | not_started |
| ST-1-2       | T1-2 authority 整理  | ST-1-1 | not_started |
| ST-1-3       | T1-3 gap 整理        | ST-1-2 | not_started |
| ST-1-4       | T1-4 非機能要件整理  | ST-1-1 | not_started |
| ST-1-5       | system spec 整合確認 | ST-1-3 | not_started |
| ST-1-6       | 成果物作成・完了確認 | ST-1-5 | not_started |

## タスク 100% 実行確認【必須】

以下のコマンドで成果物の存在と完了条件の充足を検証する。

```bash
# 1. 成果物ファイルの存在確認
ls -la outputs/phase-1/requirements-definition.md
ls -la outputs/phase-1/scope-definition.md

# 2. P50 チェック結果の記録確認
grep -c "P50 調査結果" outputs/phase-1/requirements-definition.md

# 3. inventory テーブルの存在確認（6 機能分）
grep -c "stream\|cancel\|selected files\|mention\|conversation\|selected config" outputs/phase-1/requirements-definition.md

# 4. authority テーブルの存在確認（5 関心ごと分）
grep -c "access capability\|provider.*model\|file context\|conversation\|stream lifecycle" outputs/phase-1/requirements-definition.md

# 5. gap 整理の存在確認
grep -c "local-only\|fail-fast\|guidance" outputs/phase-1/requirements-definition.md

# 6. 非機能要件の存在確認
grep -c "latency\|size limit\|永続化" outputs/phase-1/requirements-definition.md

# 7. system spec 整合確認の記録
grep -c "整合確認" outputs/phase-1/requirements-definition.md
```

## 受入基準（番号付き）

Phase 4 進入前に以下の全基準が充足されていることを確認する。

| AC-ID | 受入基準                                                                                                                                                                               | 検証方法                                                                   |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| AC-01 | 6 機能（stream / cancel / selected files / mention / conversation / selected config）の current path が表形式で整理されている                                                          | `outputs/phase-1/requirements-definition.md` のテーブル確認                |
| AC-02 | 5 関心ごと（access capability / provider-model / file context / conversation / stream lifecycle）の判定主体が列挙されている                                                            | 同上                                                                       |
| AC-03 | local-only state / fail-fast 欠如 / guidance 不足の 3 カテゴリ gap が後続設計タスクに割り当てられている                                                                                | gap テーブルの「割り当て先」列が空でない                                   |
| AC-04 | streaming latency の SLA 値・計測方法、file context size limit の上限・truncation 戦略、conversation 永続化タイミングが定義されている                                                  | 各 SLA 値が具体的な数値または基準で記載されている                          |
| AC-05 | system spec 5 ファイル（interfaces-llm / llm-streaming / arch-state-management / security-electron-ipc / workflow-apikey-chat-tool-integration-alignment）との整合確認が記録されている | 整合確認テーブルに「一致/差異」が記載されている                            |
| AC-06 | P50 チェック結果（対象 6 ファイルの git log、stub/placeholder 残存状況）が記録されている                                                                                               | `outputs/phase-1/requirements-definition.md` の P50 調査結果セクション確認 |

## Phase 4 進入ゲート

> **重要**: Phase 1〜3 が全て完了するまで Phase 4 へ進まない。

| ゲート条件                                            | 確認方法                                                      |
| ----------------------------------------------------- | ------------------------------------------------------------- |
| Phase 1 の全受入基準（AC-01〜AC-06）が充足されている  | 完了条件チェックリストが全て checked                          |
| Phase 2 の設計が Phase 1 の gap を全てカバーしている  | T3-1 整合性検証テーブルに漏れがない                           |
| Phase 3 のレビューゲートが PASS または MINOR 解決済み | `outputs/phase-3/design-review-report.md` の判定が PASS/MINOR |

## 次のPhase

- [Phase 2（設計）](./phase-2-design.md) に進む
- Phase 2 へ引き渡す情報: inventory 表、authority 表、gap 一覧、非機能要件定義、P50 調査結果、受入基準 AC-01〜AC-06
