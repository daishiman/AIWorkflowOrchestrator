# execution-governance-and-handoff-alignment - 実装ガイド

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| 機能名   | execution-governance-and-handoff-alignment |
| 作成日   | 2026-03-26                                 |
| 対象読者 | 開発者・技術者・学習者                     |

## Part 1

### なぜ必要か

この task は、「そのまま自動で進めてよい場面」と「人が確認してから進める場面」の約束をそろえるためにあります。ここが決まっていないと、同じアプリの中でも、ある画面では勝手に進み、別の画面では止まり、説明も足りない、というばらつきが起きます。

Skill Creator は計画作成、実行、改善の 3 つをまたぐので、この約束事が特に重要です。ここで扱う「進み方のルール」（governance）をそろえておかないと、ある画面ではそのまま進み、別の画面ではターミナル引き継ぎ（handoff）になり、また別の画面では注意書きが出ない、というずれが起きます。

### 何をするか

Task07 では次の 4 点をそろえます。

| 項目               | 内容                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------- |
| 進む順番           | まずアプリ内実行（`integrated_api`）、無理なときだけ引き継ぎ（`terminal_handoff`）にする |
| 引き継ぎの案内     | 共通の案内形式（`HandoffGuidance`）で、人が自分で続けられるようにする                    |
| 確認と説明         | 危険操作の確認（approval）と AI 利用情報の説明（disclosure）を分ける                     |
| 越えてはいけない線 | 勝手に実行しない、隠し入力しない、認証情報を横流ししない                                 |

### 日常の例え

たとえば、店で高額な買い物をするときの流れに似ています。店員がその場で決めてよいことと、本人確認が必要なこと、あとで自分で窓口へ行って手続きすることは分かれています。Task07 はその「どこまで自動、どこから本人が操作、どの情報を必ず見せるか」を先に決める役目です。

### 先に覚えるポイント

- アプリ内で進められるなら、まずはそこで処理する
- 進められないときだけ、ターミナル引き継ぎを出す
- 引き継ぎは「人が自分で続けるための案内」であり、自動実行ではない
- 危険操作の確認と、AI を使っている説明は別もの

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

## 現行差分メモ

この workflow は `spec_created` の docs-only task として閉じているため、ここでは「完了断定」ではなく、現ブランチで確認できた関連差分を記録する。

### 関連ファイル

| ファイル                                                             | 変更内容                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `apps/desktop/src/preload/skill-creator-api.ts`                      | `respondToApproval()` / `getDisclosureInfo()` を shared channel 経由で追加     |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` | disclosure summary 表示、handoff 時の disclosure fetch、console-only TODO 解消 |

### 関連テストファイル

| ファイル                                                                     | テスト数 | 観点                                                             |
| ---------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------- |
| `apps/desktop/src/preload/__tests__/skill-creator-api.governance.test.ts`    | 7        | shared channel 再利用、専用 channel 非存在                       |
| `apps/desktop/src/main/services/runtime/__tests__/governance-bundle.test.ts` | 18       | 5 観点横断（route / consumer / handoff / approval / disclosure） |

### 実装時確認項目

| AC   | 状態     | 証跡 / 補足                                                       |
| ---- | -------- | ----------------------------------------------------------------- |
| AC-1 | 確認済み | `RuntimePolicyResolver` route priority                            |
| AC-2 | 確認済み | `isConsumerToken()` reject                                        |
| AC-3 | 確認済み | `TerminalHandoffBuilder.buildForSurface()` + MB-1〜4              |
| AC-4 | 一部確認 | disclosure は接続済み。approval request surface は未接続          |
| AC-5 | 確認済み | `creatorHandlers.ts` 経由、surface に route authority なし        |
| AC-6 | 一部未了 | route state 固定は確認済み。Phase 11 screenshot evidence は未取得 |

### UI 証跡参照

- Phase 11 walkthrough: `outputs/phase-11/manual-test-result.md`
- screenshot gap inventory: `outputs/phase-11/screenshot-plan.json`
- 未完了 evidence の formalize: `outputs/phase-12/unassigned-task-detection.md`
