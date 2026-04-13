# Implementation Guide: UT-W3-ANALYTICS-STORE-INTEGRATION-001

## Part 1: 初学者・中学生向け説明

### なぜこの機能が必要か

たとえば、学校で先生が毎時間「今日○○さんは出席した」と出席簿に記録するように、AIWorkflowOrchestrator でもスキル（AI に頼める作業）を実行するたびに「いつ・どのスキルが・どんな結果だったか」を自動記録する仕組みが必要です。

先生が毎回手動でメモしなくても出席簿に自動記録されるように、開発者がスキルを実行するたびに細かいイベント送信のコードを書かなくても、スキルの実行開始・完了・エラーが自動的に記録されます。

これにより、後から「このスキルは何回使われたか」「どのくらいの割合でエラーが起きているか」といった分析ができるようになります。

### 何をするか

- スキルが**始まった**とき → 自動的に記録
- スキルが**正常に終わった**とき → 完了までの時間も含めて記録
- スキルが**エラーで終わった**とき → エラーの内容を記録

---

## Part 2: 開発者向け技術詳細

### SkillAnalyticsEvent 型定義

```typescript
// packages/shared/src/types/skill-analytics.ts

/** renderer-side スキル実行ライフサイクルイベント種別 */
export type SkillAnalyticsEventType = "start" | "complete" | "error";

/**
 * renderer-side スキル実行ライフサイクルイベント
 * analyticsSlice から analyticsAdapter へ送信されるイベントのドメイン型
 */
export interface SkillAnalyticsEvent {
  type: SkillAnalyticsEventType;
  skillId: string;
  timestamp: string; // ISO 8601
  duration?: number; // ミリ秒（complete のみ）
  error?: string; // エラーメッセージ（error のみ）
}
```

### 公開 export

- `packages/shared/src/types/index.ts` で `SkillAnalyticsEventType` / `SkillAnalyticsEvent` を再公開
- `packages/shared/index.ts` でも同じ型を再公開し、`@repo/shared` から参照可能にする

### analyticsSlice の Zustand slice シグネチャ

```typescript
// apps/desktop/src/renderer/store/slices/analyticsSlice.ts

export const useAnalyticsStore = create<AnalyticsSlice>()(() => ({
  trackSkillStart:    (skillId: string) => void,
  trackSkillComplete: (skillId: string, duration: number) => void,
  trackSkillError:    (skillId: string, error: string | Error) => void,
}));
```

### agentSlice 側の wiring

- `apps/desktop/src/renderer/store/slices/agentSlice.ts` で `useAnalyticsStore` を呼び出す
- `executeSkill` 開始時に start を送信する
- 完了時は execution id と duration を使って complete を送信する
- エラー時は error を送信し、abort 時も analytics context を解放する

### 各アクションの API シグネチャと使用例

```typescript
// スキル実行開始時
useAnalyticsStore.getState().trackSkillStart("my-skill-id");
// → analyticsAdapter.send("skill_start", { type: "start", skillId: "my-skill-id", timestamp: "..." })

// スキル実行完了時（duration はミリ秒）
useAnalyticsStore.getState().trackSkillComplete("my-skill-id", 1500);
// → analyticsAdapter.send("skill_complete", { type: "complete", skillId: "...", timestamp: "...", duration: 1500 })

// スキル実行エラー時（string または Error オブジェクトを受け付ける）
useAnalyticsStore
  .getState()
  .trackSkillError("my-skill-id", new Error("timeout"));
// → analyticsAdapter.send("skill_error", { type: "error", skillId: "...", timestamp: "...", error: "timeout" })
```

### trackEvent 公開 API（変更なし）

```typescript
// apps/desktop/src/renderer/utils/trackEvent.ts
// このシグネチャは本タスクで変更していない（AC-3）
export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void;
```

### エラーハンドリングとエッジケース

| ケース                           | 動作                                       |
| -------------------------------- | ------------------------------------------ |
| `analyticsAdapter.send()` が例外 | `try/catch` で捕捉、UI への伝播なし        |
| `skillId` が空文字               | そのまま送信（バリデーションしない）       |
| `duration` が負の値              | そのまま送信（バリデーションしない）       |
| `error` が Error オブジェクト    | `error.message` を文字列として送信         |
| 並列スキル実行                   | 各アクションは独立して動作、イベントは分離 |

### 設定可能なパラメータと定数

本実装に設定可能なパラメータや定数はない（action-only 設計）。
`analyticsAdapter` のキュー上限（500件）・TTL（7日）は `analyticsAdapter.ts` で管理。

### 依存関係

```
agentSlice
    ↓
analyticsSlice
    ↓
analyticsAdapter（getAnalyticsAdapter() で取得）
    ↓
IPC Bridge → Main プロセス
```

循環依存なし。`trackEvent` への依存は意図的に持たない（AC-3）。
`SkillAnalyticsEventType` / `SkillAnalyticsEvent` は `packages/shared/src/types/index.ts` と `packages/shared/index.ts` から公開される。
