# Phase 12 実装ガイド

## タスク: UT-W3-ANALYTICS-HTTP-PROVIDER-001

## 対象フェーズ: Phase 12 — ドキュメント・振り返り

## 作成日: 2026-04-13

---

# Part 1: 中学生レベルの説明

## 「アナリティクスって何？」

たとえば、あなたがスマホアプリを使っているとします。
アプリの開発者は「どのボタンが一番押されているか」「どのページで操作をやめてしまうか」を知りたいと思っています。
その情報を集める仕組みを **アナリティクス（分析）** といいます。

---

## 今回作ったものは何？

今回作ったのは、「アプリの中で何かが起きたとき、その情報をこっそりインターネット経由で報告する係」です。

### 例え話: 学校の連絡係

学校でクラスの出来事を先生に報告する係がいると想像してください。

- 「田中さんがボタンを押しました」→ 係が報告書を書いて先生に送る
- 係が途中で転んでも（エラーが起きても）、クラスの授業（アプリの動作）は止まらない
- 報告書を送るのに 5 秒以上かかりそうなら、諦めて次の仕事に移る（タイムアウト）
- 授業中（テスト・開発中）は報告しない。本番の授業のときだけ報告する

これが今回作った `sendToAnalyticsProvider` という関数の役割です。

---

## どんな条件のときに報告するの？

| 条件                                                  | 報告する？ |
| ----------------------------------------------------- | ---------- |
| 本番環境（production）で、送り先 URL が設定されている | する       |
| 開発中（development）                                 | しない     |
| テスト中（test）                                      | しない     |
| 送り先 URL が設定されていない                         | しない     |

---

## エラーが起きても大丈夫な理由

報告係（`sendToAnalyticsProvider`）が失敗しても、授業（IPC ハンドラー）には伝えません。
`try { ... } catch { }` という仕組みで、エラーをそっと握り潰しています。

これにより、外部サービスが壊れていても、アプリ本体は問題なく動き続けます。

---

# Part 2: 技術者レベルの説明

## 実装概要

`analyticsHandler.ts` に `sendToAnalyticsProvider` 関数を追加した。
この関数は IPC ハンドラー内部から呼び出される非公開関数であり、`ANALYTICS_ENDPOINT_URL` に設定された外部エンドポイントへ HTTP POST でイベントを送信する。

---

## アーキテクチャ上の位置づけ

```
Renderer Process
    │  IPC (analytics:send)
    ▼
Main Process
  analyticsHandler.ts
    ├── IPC ハンドラー（公開）
    │     - 入力バリデーション
    │     - IPC レスポンス返却
    │     - sendToAnalyticsProvider の呼び出し
    └── sendToAnalyticsProvider（非公開）
          - 環境チェック（NODE_ENV / ANALYTICS_ENDPOINT_URL）
          - AbortController によるタイムアウト制御（5000ms）
          - fetch による HTTP POST 送信
          - エラー握り潰し（IPC 応答保護）
```

---

## 実装の核心部分

```typescript
const ANALYTICS_TIMEOUT_MS = 5000;

async function sendToAnalyticsProvider(
  event: SendToAnalyticsProviderInput,
): Promise<void> {
  const url = process.env.ANALYTICS_ENDPOINT_URL;
  if (!url) return;
  if (process.env.NODE_ENV !== "production") return;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ANALYTICS_TIMEOUT_MS);

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: event.eventName,
        payload: event.payload,
        timestamp: event.timestamp,
      }),
      signal: controller.signal,
    });
  } catch {
    // エラーを握り潰し、IPC 応答を壊さない
  } finally {
    clearTimeout(timeoutId);
  }
}
```

---

## 設計上の重要な決定

### 1. 早期 return パターン

`if (!url) return` / `if (NODE_ENV !== "production") return` の形で条件を先頭に集約した。
ネストを減らし、正常系コードの可読性を確保した。

### 2. エラー握り潰し

`catch {}` で全例外を握り潰した。アナリティクス送信の失敗はアプリの機能を損なうべきではないという設計方針に基づく。

### 3. AbortController によるタイムアウト

外部サービス障害時に IPC 応答がブロックされることを防ぐため、5000ms でタイムアウトする設計とした。`finally` で `clearTimeout` を呼び出し、正常完了時のタイマー残存も防いだ。

### 4. 非公開関数

`export` を付けず、`analyticsHandler.ts` 内部のみで使用する設計とした。
HTTP 送信の実装詳細を外部から隠蔽し、IPC ハンドラー層との責務を分離した。

---

## テスト戦略

- `vi.stubGlobal("fetch", vi.fn())` でグローバル `fetch` をモックした
- `afterEach(() => vi.unstubAllGlobals())` でテスト間の干渉を防いだ
- `NODE_ENV` と `ANALYTICS_ENDPOINT_URL` は各テストで明示的に設定・クリアした
- 合計 25 件のテストで全コードパスをカバーした（AC カバレッジ 100%）

## Phase 11 証跡

- `outputs/phase-11/manual-test-result.md` は `NON_VISUAL` 判定であり、スクリーンショットは生成していない。
- 本タスクは docs-only のため、`outputs/phase-11/screenshots/` は使用しない。
