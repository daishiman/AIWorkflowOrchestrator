# Phase 5 契約差分記録

## タスク: UT-W3-ANALYTICS-HTTP-PROVIDER-001

## 対象フェーズ: Phase 5 — 契約差分

## 作成日: 2026-04-13

---

## 概要

IPC 契約（`AnalyticsSendRequest` / `AnalyticsSendResponse`）の変更有無を記録する。

---

## 契約変更の有無

| 契約要素                | 変更前   | 変更後   | 差分         |
| ----------------------- | -------- | -------- | ------------ |
| `AnalyticsSendRequest`  | 変更なし | 変更なし | **差分なし** |
| `AnalyticsSendResponse` | 変更なし | 変更なし | **差分なし** |
| IPC チャンネル名        | 変更なし | 変更なし | **差分なし** |
| ハンドラー登録ロジック  | 変更なし | 変更なし | **差分なし** |

---

## 詳細

`sendToAnalyticsProvider` は `analyticsHandler.ts` 内部の非公開関数として追加した。
IPC ハンドラーの外部インターフェース（チャンネル名・リクエスト型・レスポンス型）には一切変更がなかった。

既存の IPC 呼び出し元（`apps/web` や `apps/desktop` のレンダラープロセス）は、
今回の変更により影響を受けなかった。

---

## 新規追加した内部型

以下は `analyticsHandler.ts` 内部でのみ使用される型であり、IPC 契約には含まれない。

```typescript
interface SendToAnalyticsProviderInput {
  eventName: string;
  payload: Record<string, unknown>;
  timestamp: number;
}
```

この型は `export` されておらず、外部からは参照できない。

---

## 結論

IPC 契約の変更はなかった。
既存の呼び出し元コードの変更は不要だった。
