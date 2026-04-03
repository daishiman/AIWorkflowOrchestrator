# Task03: External API Support（外部APIサポート）

## メタ情報

| 項目         | 値                                                            |
| ------------ | ------------------------------------------------------------- |
| タスクID     | TASK-SDK-SC-03                                                |
| 責務         | External API Support（外部APIサポート）                       |
| 実行順序     | step-02-par（Task01完了後に並列実行可能）                     |
| 依存先       | TASK-SDK-SC-01（SDK Session Bridge完了・IPCチャネル定数確定） |
| ブロック対象 | なし                                                          |
| ステータス   | 未実装                                                        |
| 作成日       | 2026-04-02                                                    |

## 目的

skill-creatorがスキル生成中に外部API（天気/Slack/GitHub等）連携が必要な場合に、
ユーザーがUIで外部API設定（URL/認証/メソッド）を入力できるようにする。
SDK Session中に `external-api-config-required` イベントが発行されたとき、
`ExternalApiConfigForm` を表示し、`HttpExternalApiAdapter` でGET/POST/認証/タイムアウトを実装し、
生成されたスキルに外部API接続コードが含まれるよう情報をSDKセッションに注入する。

## 対象ファイル

| ファイル                                                                       | 変更内容                                                     |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`    | 新規: fetch + AbortController + 認証3種実装                  |
| `packages/shared/src/types/skillCreatorExternalApi.ts`                         | 新規: 型定義・エラークラス・インターフェース                 |
| `apps/desktop/src/renderer/components/skill-creator/ExternalApiConfigForm.tsx` | 新規: 外部API設定フォームUIコンポーネント                    |
| `packages/shared/src/ipc/channels.ts`                                          | 変更: `SKILL_CREATOR_EXTERNAL_API_CHANNELS` オブジェクト追加 |

## 実行タスク

### Task 3-1: 型定義（packages/shared）

`packages/shared/src/types/skillCreatorExternalApi.ts` に以下を実装する:

- `IExternalApiAdapter` インターフェース（get / post / setAuth）
- `ExternalApiConfig` 型（URL / method / authType / headers）
- `SkillExternalApiContext` 型（apis配列）
- `ExternalApiAuthType` 型（none / api-key / bearer / basic）
- `ExternalApiTimeoutError` エラークラス
- `ExternalApiHttpError` エラークラス（statusCode付き）

### Task 3-2: IPCチャネル追加（packages/shared）

`packages/shared/src/ipc/channels.ts` に以下を追加する:

- `SKILL_CREATOR_EXTERNAL_API_CHANNELS` オブジェクト（`CONFIGURE_API` / `API_CONFIGURED` / `API_TEST_RESULT`）

### Task 3-3: HttpExternalApiAdapter 実装

`fetch` + `AbortController` を使用し、タイムアウト30秒・認証4種類（none / api-key / bearer / basic）を実装する。
HTTPSでないURLに対して警告ログを出力し、APIキーをログに出力しないセキュリティ要件を満たす。

### Task 3-4: ExternalApiConfigForm 実装

`external-api-config-required` イベント受信時に表示するフォームUIを実装する。
URL入力・メソッド選択（GET/POST）・認証種別選択・認証情報入力を備え、
送信時に `SKILL_CREATOR_EXTERNAL_API_CHANNELS.CONFIGURE_API` IPCを発行する。

## 並列実行の関係

```
TASK-SDK-SC-01（依存: SDK Session Bridge）
         |
    ─────┴──────────────────────
    |              |
Task-02        Task-03（本タスク）
sdk-session-ui  external-api-support
    |              |
    ─────┬──────────────────────
         |
    Task-04以降（逐次）
```

## 参照資料

| 資料名                     | パス                                                                   |
| -------------------------- | ---------------------------------------------------------------------- |
| TASK-SDK-SC-01             | `docs/30-workflows/step-01-seq-task-01-sdk-session-bridge/index.md`    |
| skillCreator型定義         | `packages/shared/src/types/skillCreator.ts`                            |
| SkillCreatorWorkflowEngine | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` |
| sdkMessageNormalizer       | `apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts`       |
| IPCチャネル定義            | `packages/shared/src/ipc/channels.ts`                                  |

## 成果物

| 成果物                         | パス                                                                                                                                          | 形式       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| タスク概要（本ファイル）       | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-02-par-task-03-external-api-support/index.md` | Markdown   |
| 型定義ファイル（新規）         | `packages/shared/src/types/skillCreatorExternalApi.ts`                                                                                        | TypeScript |
| HttpExternalApiAdapter（新規） | `apps/desktop/src/main/services/runtime/adapters/HttpExternalApiAdapter.ts`                                                                   | TypeScript |
| ExternalApiConfigForm（新規）  | `apps/desktop/src/renderer/components/skill-creator/ExternalApiConfigForm.tsx`                                                                | TSX        |
| IPCチャネル追加                | `packages/shared/src/ipc/channels.ts`                                                                                                         | TypeScript |

## 完了条件

- [ ] `IExternalApiAdapter`（get / post / setAuth）が型定義として確定している
- [ ] `ExternalApiConfig` 型が定義されている（URL / method / authType / headers）
- [ ] `HttpExternalApiAdapter` が認証4種類（none / api-key / bearer / basic）を実装している
- [ ] タイムアウト30秒で `ExternalApiTimeoutError` がスローされる
- [ ] HTTPSでないURLで警告ログが出力される
- [ ] APIキーがログに出力されない
- [ ] `ExternalApiConfigForm` が `external-api-config-required` イベントで表示される
- [ ] `skill-creator:configure-api` IPCチャネルが追加されている
- [ ] TypeScriptコンパイルエラーが0件
- [ ] 全ユニットテストがPASS
