# Runtime Policy Centralization 実装ガイド

## Part 1: 概念説明（中学生レベル）

### 「Runtime Policy Centralization」って何？

#### なぜ必要か

同じアプリの中なのに、画面ごとに「使える」「使えない」の判定が違うと、使う人は毎回ルールを覚え直す必要がある。
まず必要なのは、どの画面でも同じ答えが返ることだ。

#### 何をするか

たとえば、会社のビルで各フロアが勝手に入館判断するのではなく、守衛室が一度だけ判断する形にそろえる。
Runtime Policy Centralization は、その「守衛室」をアプリの中に作る考え方だ。

#### 日常アナロジー: 会社の入館ルールを守衛室が一元管理する

大きな会社のビルを想像してください。

**今の状態（問題）:**

- 会社の各フロア（Chat / Agent / Skill）が、それぞれ独自に「この人は入れる」「この人はダメ」を判断している
- 1階の受付では「社員証を見せて」、2階の会議室では「招待メールを確認して」、3階の開発室では「部長の許可を見せて」と、バラバラのルール
- 来訪者（ユーザー）は「どこに行っても同じ会社なのに、なぜ対応が違うの？」と混乱する

**あるべき姿（ゴール）:**

- 守衛室（RuntimePolicyResolver）が入館ルールを一元管理する
- 各フロアは守衛室に「この人、入れていい？」と聞くだけ
- 守衛室は「入館OK（integrated_api）」か「別の窓口へ案内して（terminal_handoff）」の2択で回答
- 来訪者はどのフロアに行っても同じルールで案内される

#### 3つのお約束

1. **判定は守衛室だけ**: 各フロアが独自に入館判定してはダメ（Renderer で authMode を見て判断するのは禁止）
2. **健康診断は本社の医務室で**: 「接続できるか」のチェックは1つのルート（`llm:check-health`）だけ使う
3. **案内状は統一フォーマット**: 別窓口に案内するときの案内状（HandoffGuidance）は共通の書式で

---

## Part 2: 開発者向け実装詳細

### 実装順序

Task03 → Task04（+ Task05 並列可） → Task06/07/08 → Task09 の順序で実装する。

各 Task の要点:

1. **Task03**: `IRuntimePolicyResolver` インターフェース確定 + `SurfaceType` 定義 + `packages/shared` への型移動。最初に着手する。
2. **Task04**: AI Chat ハンドラーに `resolve()` 組み込み。`aiHandlers.ts` を修正する。
3. **Task05**: `TerminalHandoffBuilder` に `buildForSurface()` 統一メソッド追加。Task04 と並列可。
4. **Task06-08**: 各 surface のハンドラー修正。Task04 完了後に着手する。
5. **Task09**: RuntimeResolver deprecated 削除 + `AI_CHECK_CONNECTION` cleanup。全 Task 完了後に実施する。

### 2026-03-21 時点のコードスナップショット

- `apps/desktop/src/main/services/runtime/RuntimeResolver.ts` は依然として残っており、deprecated cleanup は未着手。
- `apps/desktop/src/main/ipc/skillHandlers.ts` は `RuntimeResolver` 型を受け取る構成のままで、`IRuntimePolicyResolver` への全面移行は未実施。
- `apps/desktop/src/main/ipc/aiHandlers.ts` は `RuntimePolicyResolver` を使わず、`AI_CHAT` を直接 LLM adapter へ流し、`AI_CHECK_CONNECTION` legacy handler も残置している。
- つまり Task02 の Phase 12 完了は **spec-only close-out** であり、centralization 実装本体は Task03-09 に残っている。
- この branch では補助的な品質改善として `RuntimeSkillCreatorFacade.test.ts` を追加したが、Task02 の consumer 実装完了を意味するものではない。

### DD-1〜DD-6 の適用方法

| DD   | 内容                                                   | 適用タイミング |
| ---- | ------------------------------------------------------ | -------------- |
| DD-1 | RuntimePolicyResolver を正規リゾルバーとして確定       | Task03         |
| DD-2 | apiKey の IPC 送信禁止（`sanitizeForRenderer()`）      | Task04         |
| DD-3 | `AI_CHECK_CONNECTION` 廃止トリガーを Step 完了時に設定 | Task09         |
| DD-4 | HandoffGuidance を `packages/shared` で管理            | Task03         |
| DD-5 | SurfaceType enum を `packages/shared` で定義           | Task03         |
| DD-6 | Renderer health 判定は表示目的のみ                     | Task04         |

### M-1・M-2 未解決事項

- **M-1（RuntimeDecisionForRenderer 型）**: Phase 5 で定義済み（sanitize-type-addendum.md 参照）。Task04 実装時に `packages/shared/src/types/` にファイル作成する。
- **M-2（resolve シグネチャ）**: Phase 4 で確定済み（resolve-signature-decision.md 参照）。案A（引数明示型）を採用。`resolve(authMode, apiKey)` のシグネチャを維持する。

### TypeScript 型定義

```ts
export type SurfaceType = "aiChat" | "skill" | "agent" | "skillCreator";

export interface RuntimeDecisionForRenderer {
  executionResponsibility: "integrated_api" | "terminal_handoff";
  healthStatus: "connected" | "disconnected" | "unknown";
  reason?: string;
}
```

### 使用例

使用例:

```ts
const decision = await runtimePolicyResolver.resolve(authMode, apiKey);

if (decision.executionResponsibility === "terminal_handoff") {
  return handoffBuilder.buildForSurface("aiChat", decision);
}

return llmAdapter.chat(payload);
```

### エラーハンドリング

- `resolve()` が失敗した場合は silent fallback せず、`reason` を伴う blocked/unavailable 相当の応答へ正規化する
- `llm:check-health` が失敗した場合は legacy route に戻さず、disconnect 理由を UI へ渡す
- shared transport へ昇格した型は renderer 向けに sanitize して返す

### エッジケース

- API key が空文字、trim 後空文字、未設定のケース
- surface ごとに handoff 文言は異なるが responsibility 判定は同一であるケース
- legacy `RuntimeResolver` と `RuntimePolicyResolver` が混在している移行途中のケース

### 設定項目と定数一覧

| 項目                      | 内容                                        |
| ------------------------- | ------------------------------------------- |
| `SurfaceType`             | 判定対象 surface の識別子                   |
| `executionResponsibility` | `integrated_api` / `terminal_handoff` の2値 |
| `healthStatus`            | `connected` / `disconnected` / `unknown`    |
| `llm:check-health`        | health check の primary route               |
| `AI_CHECK_CONNECTION`     | cleanup 対象の legacy route                 |

### Policy Consumption Contract 4原則の適用チェックリスト

各 surface の IPC ハンドラー実装時に以下を確認すること:

- [ ] 原則1: `resolve()` 経由のみで runtime 判定しているか
- [ ] 原則2: `llm:check-health` 経由のみで health check しているか
- [ ] 原則3: `buildForSurface()` 経由のみで handoff 構築しているか
- [ ] 原則4: 型は `packages/shared` からのみ import しているか

### 禁止事項（実装時に必ず確認）

以下のパターンはすべて禁止。コードレビューで検出された場合は差し戻しとなる。

- surface 内での silent fallback（`DEFAULT_CONFIG` への暗黙 fallback）
- Renderer での `authMode` 参照による runtime 分岐
- `AI_CHECK_CONNECTION` の新規参照
- `buildForAgentExecution` / `buildForSkillExecution` の新規使用
- `TerminalHandoffBundle` / `RuntimeResolution` の Renderer import
