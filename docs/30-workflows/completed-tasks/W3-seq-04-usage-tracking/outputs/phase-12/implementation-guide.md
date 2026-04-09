# 実装ガイド: 使用率計装（W3-seq-04）

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 12                        |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## Part 1: 中学生向け説明

### 「使用率計装」って何？

たとえば、お店でお客さんがどの棚に一番多く立ち止まるかを記録するために、天井にカメラを設置することがあります。でも「誰が来た」という個人情報ではなく、「どの棚が人気か」という行動のパターンだけを記録します。

ソフトウェアでも同じことをします。ユーザーがアプリのどの機能をどう使っているかを記録することで、「この機能はみんなよく使っている」「こっちの機能は誰も使っていない」ということがわかります。これを **使用率計装（usage tracking）** と呼びます。

---

### このタスクで何をしたの？

「スキル作成ウィザード」というスキルを作る手順を案内する画面があります。ユーザーがこの画面をどのように使っているかを記録するために、5 つの「記録ポイント」を追加しました。

| 記録ポイント               | たとえば…                                                |
| -------------------------- | -------------------------------------------------------- |
| ウィザードを開いたとき     | お店に入ってきたことを記録する                           |
| 質問に答えて次へ進んだとき | 1 番の棚から 2 番の棚に移動したことを記録する            |
| スキルの生成が完了したとき | 商品をカゴに入れたことを記録する                         |
| 品質の感想を送ったとき     | 「この商品はよかった」とアンケートに答えたことを記録する |
| 次のアクションを選んだとき | 「このあとどうする？」を選んで、その選択を記録する       |

---

### 記録はどうやってするの？

`trackEvent` という関数（命令）を使います。たとえば、お店の入口に立ったとき（ウィザードを開いたとき）は、こう書きます：

```typescript
trackEvent("skill_wizard_started", {});
```

「`skill_wizard_started`（スキル作成ウィザードが始まった）」というメッセージを送ります。今は開発中なので、このメッセージはパソコンの「コンソール」という画面に表示されるだけです。将来は、集計サーバーに送られる予定です。

---

### 本番環境では表示されないの？

はい。`trackEvent` は開発中（`NODE_ENV=development`）のときだけコンソールに表示されます。本番のアプリ（`NODE_ENV=production`）では何も表示しません。これは、ユーザーに余計な情報を見せないようにするためです。

---

### 型安全ってどういうこと？

たとえば、学校の出席簿に「名前」欄には名前しか書けないようなルールがあるとします。「好きな食べ物」を書こうとしたら先生に止められます。

TypeScript の「型安全」も同じです。`skill_wizard_started` のイベントは空のデータ（`{}`）しか受け付けません。もし余計なデータを追加しようとすると、コードを書いた時点でエラーが出て教えてくれます。これにより、間違ったデータを記録してしまうミスを防げます。

---

## Part 2: 開発者向け説明

### 設計概要

`trackEvent` は renderer プロセス内部の軽量な計装関数です。`SkillAnalytics` / `AnalyticsStore` は execution-centric の既存基盤であり、W3-seq-04 の UI イベント計装とは独立した抽象として実装しています。IPC / preload 契約への変更はありません。

Phase 11 は NON_VISUAL（UI 変更なし）であり、スクリーンショットではなく console / automation evidence を主証跡としています。

---

### TypeScript 型定義

```typescript
// apps/desktop/src/renderer/utils/trackEvent.ts
import type { SkillCategory } from "@repo/shared/types/skillCreator";

export type SkillWizardEvents = {
  /** ウィザード起動時（空 payload） */
  skill_wizard_started: Record<string, never>;

  /** Step 1 完了またはスキップ時 */
  skill_wizard_step1_completed: {
    method: "complete" | "skip";
    skippedAtQuestion: number | null; // complete なら null、skip なら 1-indexed
  };

  /** LLM 生成完了時（成功時のみ発火） */
  skill_wizard_generation_completed: {
    method: "complete" | "skip";
    category: SkillCategory; // @repo/shared/types/skillCreator から参照
    hasExternalIntegration: boolean;
  };

  /** 骨格品質フィードバック（👍/👎）送信時 */
  skill_skeleton_quality_feedback: {
    satisfied: boolean;
    generationMethod: "complete" | "skip"; // Step 1 の method と同値
  };

  /** CompleteStep でのネクストアクション選択時 */
  skill_wizard_next_action: {
    action: "execute" | "open_editor" | "create_another";
  };
};
```

---

### API シグネチャ

```typescript
export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void;
```

- `eventName`: `SkillWizardEvents` のキー。型外の値はコンパイルエラーになる。
- `payload`: `eventName` に対応する型。payload の型ミスマッチもコンパイルエラーになる。
- 戻り値: `void`（fire-and-forget）

---

### 使用例（5 計装ポイント）

```typescript
// 1. ウィザード起動（useEffect マウント時）
useEffect(() => {
  trackEvent("skill_wizard_started", {});
}, []);

// 2. Step 1 完了（handleGenerate 先頭）
trackEvent("skill_wizard_step1_completed", {
  method, // "complete" | "skip"
  skippedAtQuestion: skippedAt ?? null, // resolveSkippedAtQuestion() で算出
});

// 3. 生成完了（createSkill 成功後・catch の外）
trackEvent("skill_wizard_generation_completed", {
  method,
  category: result.category,
  hasExternalIntegration: result.hasExternalIntegration ?? false,
});

// 4. 品質フィードバック（handleQualityFeedback 内）
trackEvent("skill_skeleton_quality_feedback", {
  satisfied,
  generationMethod, // Step 1 の method を state で保持
});

// 5. ネクストアクション（各ハンドラ先頭）
trackEvent("skill_wizard_next_action", { action: "execute" });
trackEvent("skill_wizard_next_action", { action: "open_editor" });
trackEvent("skill_wizard_next_action", { action: "create_another" });
```

---

### resolveSkippedAtQuestion ヘルパー

```typescript
// SkillCreateWizard.tsx からエクスポートされるユーティリティ
export function resolveSkippedAtQuestion(
  answers: ConversationAnswers,
): number | null {
  const keys = ["q1", "q2", "q3", "q4", "q5", "q6"] as const;
  const firstUnanswered = keys.findIndex((k) => !answers[k]?.selectedOption);
  return firstUnanswered === -1 ? null : firstUnanswered + 1; // 1-indexed
}
```

---

### エラーハンドリング

`trackEvent` 自体は例外をスローしない（TC-07 で確認済み）。

LLM 生成失敗時に `skill_wizard_generation_completed` が発火しないよう、`try/catch` の外に計装コードを配置しない:

```typescript
try {
  const result = await createSkill(...);
  // ここで発火（成功時のみ）
  trackEvent("skill_wizard_generation_completed", { ... });
} catch (error) {
  // ここでは発火しない
}
```

---

### エッジケース

| ケース                            | 動作                                                                |
| --------------------------------- | ------------------------------------------------------------------- |
| production 環境                   | `console.info` 出力なし（no-op）                                    |
| dev StrictMode 二重マウント       | `skill_wizard_started` が 2 回出力される場合があるが prod では 1 回 |
| 「今すぐ生成する」押下時の method | 全 6 問が回答済みなら `complete`、未回答が残るなら `skip`           |
| LLM 生成失敗                      | `skill_wizard_generation_completed` は発火しない                    |
| `skill_wizard_started` の payload | `{}` のみ。余計なキーは型エラーになる                               |
| 複数回フィードバック              | 押下回数分だけ `skill_skeleton_quality_feedback` が発火する         |

---

### 将来の sink 差し替え

現在は `console.info` のみの no-op スタブ。将来の分析基盤接続時は `trackEvent.ts` の実装のみ変更すればよく、呼び出し側（`SkillCreateWizard.tsx`）の変更は不要。

```typescript
// 将来の差し替えイメージ
export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  if (process.env.NODE_ENV !== "production") {
    console.info("[trackEvent]", eventName, payload);
  }
  // 差し替え先: analyticsAdapter.send(eventName, payload);
}
```

---

### 設定可能な定数・参照先

| 項目                   | 値・参照先                                |
| ---------------------- | ----------------------------------------- |
| `SkillCategory` 型     | `@repo/shared/types/skillCreator`         |
| イベント名マップ       | `SkillWizardEvents`（`trackEvent.ts` 内） |
| dev 出力プレフィックス | `"[trackEvent]"`（固定）                  |
| prod 判定条件          | `process.env.NODE_ENV !== "production"`   |
