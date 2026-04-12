# [#1971] feat(ipc): ConversationalInterview onError エラーコード伝搬 (IPC-ER-03)

## メタ情報

```yaml
issue_number: 1971
title: feat(ipc): ConversationalInterview onError エラーコード伝搬 (IPC-ER-03)
state: OPEN
priority: 低
scale: 小規模
category: 改善
status: 未実施
created_date: 2026-04-06
updated_date: 2026-04-06
url: https://github.com/daishiman/AIWorkflowOrchestrator/issues/1971
dependencies: []
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 概要

`ConversationalInterview` コンポーネントの `onError` コールバックシグネチャを拡張し、IPC レイヤーから伝搬されたエラーオブジェクト（またはエラーコード）を親コンポーネントに渡せるようにする。

## 問題点

現状の実装では `onError` に渡す値は以下の固定文字列のみ:

- `"回答の構築に失敗しました"` — submission ビルド失敗時
- `"回答の送信に失敗しました"` — `onSubmit` reject 時

IPC エラーオブジェクトの `message`・`code`・`cause` などが捨てられており、親コンポーネントがエラー種別に応じた処理（リトライ戦略変更、認証エラー時の再ログイン誘導など）を行えない。

## 実装方針

```typescript
// 案1: オプション引数追加（後方互換性あり・推奨）
onError?: (message: string, errorCode?: string) => void;

// catch ブロック修正
} catch (err) {
  interview.rollbackLastUserMessage();
  const errorCode = err instanceof Error && "code" in err
    ? String((err as Error & { code: unknown }).code)
    : undefined;
  onError?.("回答の送信に失敗しました", errorCode);
}
```

- `IPC-ER-03` テスト (`it.todo`) を通常の `it` に昇格させてパスさせる

## 対象ファイル

- `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.ipc-edge.test.tsx`

## 仕様書

`docs/30-workflows/unassigned-task/task-conversational-interview-onerror-code-propagation.md`

## タスクID

TASK-IPC-ER-03

## 優先度

LOW

## 見積もり規模

小規模

## 発見元

TASK-UI-02 Phase 6 未タスク検出
