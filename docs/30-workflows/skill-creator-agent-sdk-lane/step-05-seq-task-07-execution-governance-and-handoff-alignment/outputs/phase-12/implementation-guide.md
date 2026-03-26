# execution-governance-and-handoff-alignment - 実装ガイド

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| 機能名   | execution-governance-and-handoff-alignment |
| 作成日   | 2026-03-26                                 |
| 対象読者 | 開発者・技術者・学習者                     |

## Part 1

### なぜ必要か

この task が必要なのは、「AI でそのまま続けるのか」「人がターミナルへ持っていくのか」「危ない操作を確認するのか」「AI を使っている事実をどう見せるのか」が別々に決まっていると、画面ごとに言い方や動きがばらばらになるからです。

Skill Creator は計画作成、実行、改善の 3 つをまたぐので、ここで governance をまとめておかないと、ある画面では API で動き、別の画面では勝手に handoff され、また別の画面では承認や開示の説明が抜ける、というずれが起きます。

### 何をするか

Task07 では次の 4 点をそろえます。

| 項目                  | 内容                                                              |
| --------------------- | ----------------------------------------------------------------- |
| route priority        | `integrated_api` を正規、`terminal_handoff` を補助として固定する  |
| handoff guidance      | shared `HandoffGuidance` を使って、人が自分で続けられる案内を返す |
| approval / disclosure | 危険操作の確認と、AI 利用情報の説明を別々に扱う                   |
| manual boundary       | 勝手に実行しない、隠し入力しない、認証情報を横流ししない          |

### 日常の例え

たとえば、店で高額な買い物をするときの流れに似ています。店員がその場で決めてよいことと、本人確認が必要なこと、あとで自分で窓口へ行って手続きすることは分かれています。Task07 はその「どこまで自動、どこから本人が操作、どの情報を必ず見せるか」を先に決める役目です。

### 先に覚えるポイント

- API 実行ができるなら、まずはそこで処理する
- API 実行ができないときだけ、ターミナル handoff を出す
- handoff は「人が自分で続けるための案内」であり、自動実行ではない
- 承認と開示は似て見えても役割が違う

## Part 2

### 型定義（TypeScript）

```ts
type RuntimeDecision =
  | {
      type: "integrated_api";
      apiKey: string;
      permissionMode?: "default" | "acceptEdits" | "bypassPermissions";
    }
  | {
      type: "terminal_handoff";
      bundle: TerminalHandoffBundle;
    };

interface HandoffGuidance {
  terminalCommand: string;
  contextSummary: string;
  reason: string;
}

type ApprovalStatus =
  | { approved: true; token: string; approvedAt: number }
  | {
      approved: false;
      reason: "not_requested" | "rejected" | "expired" | "already_used";
    };
```

### API / CLI シグネチャ

```ts
class RuntimePolicyResolver {
  resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>;
  resolveWithService(authMode: AuthMode): Promise<RuntimeDecision>;
}

class TerminalHandoffBuilder {
  buildForSurface(
    request: BuildForSurfaceRequest,
    reason: HandoffGuidance["reason"],
  ): HandoffGuidance;
}

class DefaultApprovalGate {
  grantApproval(sessionId: string, operationId: string): ApprovalStatus;
  checkApproval(
    sessionId: string,
    operationId: string,
    token: string,
  ): ApprovalStatus;
}
```

```ts
// Renderer -> Main
skillCreatorAPI.executePlan(
  planId: string,
  skillSpec: string,
  authMode?: AuthMode,
  apiKey?: string | null,
): Promise<IpcResult<RuntimeSkillCreatorExecuteResponse>>;

// Shared governance channel
electronAPI.invoke("approval:respond", { sessionId, operationId, approved });
electronAPI.invoke("execution:get-disclosure-info");
```

### 使用例

```ts
const decision = await runtimePolicyResolver.resolveWithService("api-key");

if (decision.type === "terminal_handoff") {
  const guidance = handoffBuilder.buildForSurface(
    {
      surfaceType: "runtime",
      runtimeType: "skill",
      skillName: "skill-creator",
      prompt: "現在のコンテキストで続行してください",
    },
    "terminal_handoff",
  );

  setHandoffGuidance(guidance);
  return;
}

const result = await skillCreatorApi.executePlan(planId, skillSpec);
```

### エラーハンドリング

- consumer auth token を API key として受け取った場合は reject する
- approval token が期限切れなら `expired` を返し、再承認を促す
- disclosure fetch が unavailable でも execution authority を Renderer へ移さない
- handoff guidance 作成時は prompt を sanitize し、危険文字や secret をそのまま渡さない

### エッジケース

| ケース                           | 対応方針                                       |
| -------------------------------- | ---------------------------------------------- |
| API key なし + subscription 有効 | `terminal_handoff` に切り替える                |
| degraded + subscription 無効     | no-auth handoff として案内する                 |
| consumer token                   | API key として受け付けない                     |
| approval token 再利用            | `already_used` を返す                          |
| disclosure handler unavailable   | graceful degradation し、approval と混同しない |
| visible handoff 未接続           | console-only を不具合として扱う                |

### 設定項目と定数一覧

| 項目               | 値 / 候補                              | 用途                                                           |
| ------------------ | -------------------------------------- | -------------------------------------------------------------- |
| route type         | `integrated_api`, `terminal_handoff`   | 実行レーンの固定                                               |
| shared handoff DTO | `HandoffGuidance`                      | surface 間の統一 DTO                                           |
| approval TTL       | `300` 秒                               | one-time approval token の有効期限                             |
| channel            | `approval:request`, `approval:respond` | shared approval contract                                       |
| channel            | `execution:get-disclosure-info`        | AI 開示情報取得                                                |
| Manual Boundary    | MB-1〜MB-4                             | 自動送信・隠し注入・headless 実行・credential passthrough 禁止 |

### テスト構成

Task07 の回帰観点は次の 5 群に分ける。

| 観点                | 内容                                            |
| ------------------- | ----------------------------------------------- |
| route coverage      | API key、subscription、degraded、consumer token |
| handoff coverage    | `HandoffGuidance`、sanitize、visible handoff    |
| approval coverage   | grant / expired / already_used                  |
| disclosure coverage | fetch / fallback / summary 表示                 |
| downstream coverage | Task05 / 06 / 08 との責務分離                   |
