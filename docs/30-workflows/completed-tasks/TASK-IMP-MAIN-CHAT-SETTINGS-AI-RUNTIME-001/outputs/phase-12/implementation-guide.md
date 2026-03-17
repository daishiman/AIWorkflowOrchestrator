# Phase 12: 実装ガイド

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 12                                         |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | implementation-guide.md                    |
| 作成日   | 2026-03-17                                 |

---

## Part 1: 概念説明（中学生レベル）

### 1.1 なぜ必要か

この改善が必要だった理由は、同じアプリなのに画面ごとで「どの AI を使っているか」「今使える状態か」の見え方がずれていたためです。

たとえば学校の教室で、出欠を先生と係が別々の名簿で管理していると、Aさんが「出席」だったり「欠席」だったりして混乱します。今回の課題も同じで、Chat と Settings が別ルートで状態を持つと、利用者が誤った表示を信じてしまいます。

### 1.2 何をするか

この機能でできることは、AI 実行と状態表示の入口を一本化し、どの画面でも同じ状態を見せることです。具体的には次の4点です。

1. Chat 送信時に Provider/Model を必ず明示する
2. health check の窓口を `llm:check-health` に統一する
3. authMode の語彙を `ready/blocked/unavailable` に統一する
4. Settings 変更を Chat の表示へ即時反映する

### 1.3 日常の例えでの全体イメージ

- 受付の一本化の例え: 病院の窓口を1つにすると、診察券の情報が食い違わない
- メニューボード同期の例え: 厨房でメニューを変えたら、店内ボードと注文端末が同時更新される
- 用語統一の例え: 成績評価を「A/B/C」に決めると、先生ごとの言い換えが消える

---

## Part 2: 開発者向け実装詳細

### 2.1 変更概要（GAP/DRIFT 対応）

| 課題ID    | 実装ポイント                                     | 期待される効果                                             |
| --------- | ------------------------------------------------ | ---------------------------------------------------------- |
| GAP-01/03 | `providerId` / `modelId` を送信必須化            | 暗黙 fallback 排除                                         |
| GAP-02    | `AI_CHECK_CONNECTION` legacy化（新規利用禁止）   | health check の primary 経路を `llm:check-health` に一本化 |
| DRIFT-1   | authMode 語彙統一                                | UI/IPC 間の意味ズレ解消                                    |
| GAP-05    | API key 更新時に adapter cache クリア            | 鍵更新後の再認証不整合回避                                 |
| DRIFT-2   | `AuthKeySection` を Access Capability 配下へ移動 | 設定導線の一貫性向上                                       |

### 2.2 TypeScript インターフェース/型定義

```typescript
export type AuthMode = "ready" | "blocked" | "unavailable";

export interface AIChatRequest {
  message: string;
  systemPrompt: string;
  ragEnabled?: boolean;
  providerId: LLMProviderId;
  modelId: string;
}

export interface HealthCheckRequest {
  providerId: LLMProviderId;
}

export function isLLMProviderId(value: unknown): value is LLMProviderId {
  return (
    typeof value === "string" &&
    LLM_PROVIDER_IDS.includes(value as LLMProviderId)
  );
}
```

### 2.3 APIシグネチャ / CLIシグネチャ

```typescript
window.electronAPI.ai.chat(request: AIChatRequest): Promise<AIChatResponse>
window.electronAPI.llm.checkHealth(providerId: LLMProviderId): Promise<HealthCheckResult>
window.electronAPI.authMode.set(mode: AuthMode): Promise<{ success: boolean; error?: { code: string; message: string } }>
window.electronAPI.apiKey.set(args: { providerId: LLMProviderId; key: string }): Promise<{ success: boolean; error?: { code: string; message: string } }>
```

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  --workflow docs/30-workflows/ai-runtime-authmode-unification/tasks/step-03-par-task-06-main-chat-settings-runtime-sync
```

### 2.4 使用例

```tsx
const submitChat = async (message: string) => {
  if (!isLLMProviderId(selectedProviderId) || !selectedModelId) {
    setError("プロバイダーとモデルを Settings で選択してください");
    return;
  }

  await window.electronAPI.ai.chat({
    message,
    systemPrompt: currentPrompt?.content ?? "",
    ragEnabled,
    providerId: selectedProviderId,
    modelId: selectedModelId,
  });
};

const runHealthCheck = async () => {
  if (!isLLMProviderId(selectedProviderId)) return;
  const result = await window.electronAPI.llm.checkHealth(selectedProviderId);
  setHealthStatus(result.status);
};
```

### 2.5 エラーハンドリング

- 入力検証エラー: `providerId/modelId` が未設定、または `mode` が空文字の場合は `VALIDATION_ERROR` を返す
- 語彙不一致エラー: `authMode` に `auto/ask/deny` が来た場合は拒否して新語彙へ移行を促す
- API key 不正エラー: 空文字・空白のみを拒否し、成功時のみ adapter cache を破棄する
- UI 表示エラー: Chat 送信前チェックで弾いた場合はユーザー向けメッセージを表示して送信を止める

### 2.6 エッジケース

- 起動直後に provider 選択前で送信ボタンが押された場合
- Settings 変更直後に Chat 側の古い state を読んだ場合
- API key 更新直後に旧 adapter instance が残っていた場合
- health check 実行中に provider が切り替わった場合
- 旧語彙 `auto/ask/deny` が外部入力で混入した場合

### 2.7 設定項目と定数一覧

| 種別     | 名前                 | 用途                                        |
| -------- | -------------------- | ------------------------------------------- |
| 設定項目 | `selectedProviderId` | 現在選択中の Provider                       |
| 設定項目 | `selectedModelId`    | 現在選択中の Model                          |
| 設定項目 | `authMode`           | 実行可否状態（`ready/blocked/unavailable`） |
| 設定項目 | `ragEnabled`         | RAG 利用の ON/OFF                           |
| 定数一覧 | `LLM_PROVIDER_IDS`   | 有効 Provider ID の許可リスト               |
| 定数一覧 | `VALIDATION_ERROR`   | 入力検証失敗時の標準エラーコード            |

### 2.8 実装後の最小テスト観点

1. `AI_CHECK_CONNECTION` を新規導線で呼び出していないこと（legacy互換以外）
2. Chat 送信で `providerId/modelId` が常に送信 payload に入ること
3. provider/model 未選択時に送信が中断され、UI エラーが出ること
4. `authMode:set` が旧語彙を拒否し、新語彙のみ受理すること
5. API key 更新後に adapter cache がクリアされること
