# 拡張設計書

## メタ情報

| 項目     | 内容                      |
| -------- | ------------------------- |
| Phase    | 2                         |
| タスクID | UT-SKILL-WIZARD-W3-seq-04 |
| 作成日   | 2026-04-08                |
| 状態     | completed                 |

---

## 1. 拡張方針の概要

現行実装は renderer-local の薄い抽象（開発時 `console.info`、本番 no-op）として閉じる。  
将来の analytics 基盤接続は **呼び出し側（`SkillCreateWizard.tsx`）を一切変更しない**ことを原則とし、`trackEvent.ts` 内部の sink 境界を差し替えるだけで対応できる設計とする。

---

## 2. 現行実装（Phase A: Stub）

```
trackEvent(eventName, payload)
  └── NODE_ENV !== "production" → console.info("[trackEvent]", eventName, payload)
  └── production                → no-op
```

- 目的: 開発時のログ確認のみ
- 依存: なし（外部サービス・IPC・ストア不使用）
- 変更コスト: ゼロ（実装済み）

---

## 3. 将来拡張ロードマップ

### Phase A: Stub（現行 / 本タスクのスコープ）

| 項目           | 内容                                 |
| -------------- | ------------------------------------ |
| sink           | `console.info`（dev）/ no-op（prod） |
| 外部依存       | なし                                 |
| 呼び出し側変更 | 不要                                 |

### Phase B: ローカル集計（将来）

| 項目           | 内容                                                     |
| -------------- | -------------------------------------------------------- |
| sink           | renderer-local の `EventStore`（メモリ or localStorage） |
| 外部依存       | なし（renderer 内完結）                                  |
| 呼び出し側変更 | 不要                                                     |
| 変更箇所       | `trackEvent.ts` の sink 部分のみ                         |

```typescript
// Phase B での差し替えイメージ（trackEvent.ts 内部のみ変更）
export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  if (process.env.NODE_ENV !== "production") {
    console.info("[trackEvent]", eventName, payload);
  }
  localEventStore.push({ eventName, payload, timestamp: Date.now() });
}
```

### Phase C: Analytics Adapter 接続（将来）

| 項目           | 内容                                                       |
| -------------- | ---------------------------------------------------------- |
| sink           | `AnalyticsAdapter`（IPC 経由 or 外部 API）                 |
| 外部依存       | IPC チャンネル or HTTP エンドポイント                      |
| 呼び出し側変更 | 不要                                                       |
| 変更箇所       | `trackEvent.ts` の sink 部分 + `AnalyticsAdapter` 実装追加 |

```typescript
// Phase C での差し替えイメージ（trackEvent.ts 内部のみ変更）
export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  if (process.env.NODE_ENV !== "production") {
    console.info("[trackEvent]", eventName, payload);
  }
  analyticsAdapter.send(eventName, payload);
}
```

---

## 4. sink 境界の設計原則

```
┌─────────────────────────────────────────────┐
│  呼び出し側（SkillCreateWizard.tsx）         │
│  trackEvent("skill_wizard_started", {})      │
│  ※ 変更なし（Phase A → B → C 全段階）       │
└─────────────────┬───────────────────────────┘
                  │ import
┌─────────────────▼───────────────────────────┐
│  trackEvent.ts                               │
│  ┌──────────────────────────────────────┐   │
│  │ SkillWizardEvents 型定義（不変）      │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │ sink（Phase ごとに差し替え）          │   │
│  │  Phase A: console.info / no-op       │   │
│  │  Phase B: + localEventStore.push()   │   │
│  │  Phase C: + analyticsAdapter.send()  │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 5. 避けること（Over-engineering 防止）

| 避ける設計                                       | 理由                                               |
| ------------------------------------------------ | -------------------------------------------------- |
| 現時点での `EventStore` 実装                     | 今は集計・表示要件がなく、早期実装はムダになる     |
| `SkillAnalytics` / `AnalyticsStore` への直接接続 | execution-centric 基盤と UI 計装は責務が異なる     |
| `trackEvent` の async 化                         | 計装は軽量副作用であり非同期化は複雑性を増すだけ   |
| イベント型の過度な分割（ファイル分割）           | 1 ファイルで管理できる規模であり、分割コストが高い |
| IPC 経由の main プロセス転送（現時点）           | renderer-local で完結できる間は IPC を増やさない   |

---

## 6. SkillAnalytics / AnalyticsStore との責務分離

| 基盤             | 責務                                           | W3 trackEvent との関係  |
| ---------------- | ---------------------------------------------- | ----------------------- |
| `SkillAnalytics` | スキル実行ログ（実行開始・完了・エラー）の記録 | 直接接続しない          |
| `AnalyticsStore` | 実行ログの IPC 経由永続化                      | 直接接続しない          |
| `trackEvent.ts`  | ウィザード UI 操作パターンの開発時ログ         | renderer-local に閉じる |

**接続が必要になる条件**: UI 計装イベントを execution ログと統合したダッシュボードを構築する場合。その際も呼び出し側は変更せず `trackEvent.ts` の sink に adapter を追加する。

---

## 完了条件チェックリスト

- [x] 将来の差し替えは 1 つの sink 境界として記述されていること
- [x] Phase A / B / C の段階的移行が矛盾なく記述されていること
- [x] 呼び出し側（`SkillCreateWizard.tsx`）を変更しない原則が明記されていること
- [x] `SkillAnalytics` / `AnalyticsStore` との分離方針が明記されていること
- [x] Over-engineering 防止の方針が明記されていること
- [x] 矛盾なし・漏れなし
