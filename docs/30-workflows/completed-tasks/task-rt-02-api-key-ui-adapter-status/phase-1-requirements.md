# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                   |
| ------ | ------------------------------------ |
| Phase  | 1                                    |
| 機能名 | task-rt-02-api-key-ui-adapter-status |
| 作成日 | 2026-03-29                           |
| 分類   | UI task                              |

## 目的

APIキー管理画面に必要な接続状態表示要件を、既存 public contract 再利用前提で定義する。Task の主眼は「状態の可視化と再試行導線」であり、「Skill Creator private runtime 状態の public 化」ではない。

## 実行タスク

- 要件抽出: UI表示、retry、a11y、既存フロー非破壊の要件を固定する
- 境界整理: public/private、global/local の責務境界を明記する
- 受入基準作成: 実装と検証に直結する AC を定義する

## 背景

`ApiKeysSection` は既に `apiKey.list/save/delete/validate` を使う独立 UI であり、`llm.checkHealth(providerId)` も既存 public IPC として存在する。したがって、本 task では新規 IPC と shared 型を増やさず、既存 contract を組み合わせて UI 状態を導出する。

## 実行手順

### Step 0: P50チェック（既実装状態の調査）

```bash
rg -n "ApiKeysSection|ProviderStatus|apiKey\\.list|apiKey\\.validate" \
  apps/desktop/src/renderer/components/organisms/ApiKeysSection \
  apps/desktop/src/preload/types.ts

rg -n "LLM_CHECK_HEALTH|handleCheckHealth|HealthCheckResult" \
  apps/desktop/src/preload/channels.ts \
  apps/desktop/src/main/handlers/llm.ts \
  packages/shared/src/types/llm/schemas
```

### P50チェック結果（2026-03-29）

| 対象                        | 現状                                                                   |
| --------------------------- | ---------------------------------------------------------------------- |
| `ApiKeysSection`            | provider 一覧と save/delete/validate を局所 state で保持済み           |
| `ProviderStatus`            | `registered/not_registered` だけを保持                                 |
| `llm.checkHealth`           | 既存 public IPC と preload surface が存在                              |
| global `llmSlice`           | provider 選択と health cache を持つが、Settings 専用 state ではない    |
| `RuntimeSkillCreatorFacade` | `llmAdapterStatus` は private runtime 状態であり Settings 契約ではない |

### 真の論点

1. APIキー管理画面でどの状態を見せるべきか
2. その状態をどの契約から取得するべきか
3. Settings 局所 concern を global contract に拡張すべきか
4. retry UX を最小変更で成立させるには何が必要か
5. skill 準拠 4条件をどう満たすか

## 機能要件（FR）

| ID    | 要件                                                                                        | 優先度 |
| ----- | ------------------------------------------------------------------------------------------- | ------ |
| FR-01 | APIキー管理画面は provider 一覧表示後、登録済み provider に対して health check を実行できる | must   |
| FR-02 | UI は health check 進行中を `initializing` 相当の状態として表示できる                       | must   |
| FR-03 | `HealthCheckResult.status` を `ready/failed` 表示に正規化できる                             | must   |
| FR-04 | `failed` 行に再確認 CTA を表示できる                                                        | must   |
| FR-05 | 再確認実行後、対象 provider 行のみ状態を再計算できる                                        | must   |
| FR-06 | `errorMessage` があれば failure reason として補助表示できる                                 | should |
| FR-07 | API key 未登録 provider には health check を強制しない                                      | must   |

## 非機能要件（NFR）

| ID     | 要件                                                                                         | 優先度 |
| ------ | -------------------------------------------------------------------------------------------- | ------ |
| NFR-01 | 新規 public IPC チャンネル、shared 型、global slice を追加しない                             | must   |
| NFR-02 | preload 公開境界は既存 `window.electronAPI.llm` / `window.electronAPI.apiKey` の範囲に留める | must   |
| NFR-03 | retry 中は対象行だけ loading / disabled を表示する                                           | must   |
| NFR-04 | WCAG 2.1 AA に必要な status / busy / retry ラベルを満たす                                    | must   |
| NFR-05 | 既存 API key の save / delete / validate 導線を壊さない                                      | must   |

## 受け入れ基準（AC）

| ID   | 基準                                                                                 | 検証方法       |
| ---- | ------------------------------------------------------------------------------------ | -------------- |
| AC-1 | 初回表示で `apiKey.list()` の provider 一覧が表示される                              | automated-test |
| AC-2 | 登録済み provider の health check 中に `initializing` 表示が出る                     | automated-test |
| AC-3 | `HealthCheckResult.status === "connected"` のとき `ready` 表示になる                 | automated-test |
| AC-4 | `HealthCheckResult.status !== "connected"` のとき `failed` 表示と再確認 CTA が出る   | automated-test |
| AC-5 | 再確認 CTA 実行後、対象 provider 行のみ結果が更新される                              | automated-test |
| AC-6 | `errorMessage` がある場合に補助テキストまたは tooltip で確認できる                   | manual-test    |
| AC-7 | API key 未登録 provider では health check を走らせず、既存の登録導線だけが表示される | automated-test |
| AC-8 | ライト/ダークテーマとキーボード操作で視認性と操作性を維持できる                      | manual-test    |
| AC-9 | 既存の save / delete / validate / list フローに回帰がない                            | automated-test |

## スコープ

### 含む

- `ApiKeysSection` の局所 state 拡張
- 接続状態バッジ UI
- per-provider health check 実行と retry CTA
- 既存 `llm.checkHealth` と `apiKey.list` の組み合わせ
- UI / a11y / retry のテスト

### 含まない

- 新規 public IPC チャンネル追加
- `RuntimeSkillCreatorFacade` private 状態の public 化
- 新規 shared 型追加
- global `llmSlice` の永続 state 追加
- chat runtime や Skill Creator runtime の挙動変更

## 前提条件

| 条件                                                         | 種別      | ステータス |
| ------------------------------------------------------------ | --------- | ---------- |
| `window.electronAPI.apiKey.list` が使用可能                  | technical | met        |
| `window.electronAPI.llm.checkHealth` が使用可能              | technical | met        |
| `ApiKeysSection` が局所 state で provider 一覧を保持している | technical | met        |
| `HealthCheckResult` が `connected/disconnected/error` を返す | technical | met        |

## 参照資料

| 参照資料         | パス                                                                              | 内容                                   |
| ---------------- | --------------------------------------------------------------------------------- | -------------------------------------- |
| API key 一覧契約 | `apps/desktop/src/preload/types.ts`                                               | `ProviderStatus`, `ApiKeyListResponse` |
| LLM health 契約  | `packages/shared/src/types/llm/schemas/health.ts`                                 | `HealthCheckResult`                    |
| LLM IPC 実装     | `apps/desktop/src/main/handlers/llm.ts`                                           | `handleCheckHealth()`                  |
| Settings UI 実装 | `apps/desktop/src/renderer/components/organisms/ApiKeysSection/index.tsx`         | 現行 UI 構造                           |
| IPC ガイド       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc-core.md` | preload 境界                           |

## 統合テスト連携【必須】

| 判定項目                   | 基準 | 結果   |
| -------------------------- | ---- | ------ |
| `apiKey.list` 契約         | 100% | 未実施 |
| `llm.checkHealth` 契約     | 100% | 未実施 |
| Settings UI シナリオ正常系 | 100% | 未実施 |
| Settings UI シナリオ異常系 | 80%+ | 未実施 |

接続要件: `apiKey.list` / `llm.checkHealth` → `ApiKeysSection` 局所 state → badge / retry CTA

## 成果物

| 成果物     | パス                              | 説明                 |
| ---------- | --------------------------------- | -------------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | FR/NFR/AC と境界判断 |

## 完了条件

- [ ] 機能要件と非機能要件が定義されている
- [ ] public/private と global/local の境界が明示されている
- [ ] 受け入れ基準が検証可能な形で定義されている
- [ ] P50チェックが完了している
- [ ] スコープ（含む/含まない）が明確である
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計
