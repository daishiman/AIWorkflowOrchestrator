# Test Specification — Phase 4

## 方針: verify_existing（RED テストなし、既存挙動の固定）

## テストファイル

- **ファイル名**: `ConversationalInterview.restoredPendingRequest.test.tsx`
- **配置**: `apps/desktop/src/renderer/components/skill/__tests__/`
- **フレームワーク**: Vitest + `@testing-library/react`
- **環境**: `@vitest-environment happy-dom`

## 正常系シナリオ定義

### TC-S3-01: 通常フロー — snapshot フォールバック

```
前提条件:
  - restoredPendingRequest = null（初期状態）
  - workflowSnapshot.awaitingUserInput = { requestId: "req-s3", kind: "single_select", prompt: "..." }
操作:
  - コンポーネントをレンダリング
期待結果:
  - pendingRequest === workflowSnapshot.awaitingUserInput（フォールバック先）
  - single_select chips が表示される
```

### TC-S1-01: 復元フロー — restoredPendingRequest 優先

```
前提条件:
  - Q1 (single_select) を submit → 履歴に追加
  - workflowSnapshot が Q2 (free_text) に更新
  - undo 実行 → restoredPendingRequest = Q1
  - workflowSnapshot.awaitingUserInput = Q2（requestId 異なる）
操作:
  - undo ボタンクリック
期待結果:
  - pendingRequest === restoredPendingRequest（Q1 が優先）
  - single_select chips が表示（Q1 の widget）
  - free_text input が非表示（Q2 の widget ではない）
```

### TC-S2-01: クリア条件 — requestId 変化でリセット

```
前提条件:
  - S-1 のセットアップ後（restoredPendingRequest = Q1、snapshot = Q2）
  - workflowSnapshot が Q3（新 requestId）に更新
操作:
  - workflowSnapshot を Q3 に変更（rerender）
期待結果:
  - クリア条件 useEffect が発火し restoredPendingRequest = null
- pendingRequest = Q3（snapshot フォールバック）
- free_text input が表示（Q3 の widget）
```

## 異常系・境界シナリオ定義

### TC-EC6-01: undo 復元中の再送信は restored requestId を使う

```
前提条件:
  - Q1 (single_select) を submit
  - workflowSnapshot が Q2 (free_text) に更新
  - undo 実行 → restoredPendingRequest = Q1
操作:
  - Q1 の別選択肢を選んで再送信
期待結果:
  - submission.requestId === Q1.requestId
  - submission.selectedOptionId は再選択した値
```

### TC-EC7-01: 再送信成功後も新 snapshot 到着まで restored UI を維持

```
前提条件:
  - undo 復元中で pendingRequest = Q1, snapshot.awaitingUserInput = Q2
操作:
  - Q1 を再送信し、その直後は親 snapshot をまだ更新しない
期待結果:
  - restoredPendingRequest は維持される
  - single_select widget が継続表示される
  - 新しい requestId の snapshot 到着時のみ通常フローへ戻る
```

## テストファイルの設計原則（verify_existing）

- 復元 UI と送信 payload の不整合を防ぐ regression guard を優先する
- `pendingRequest` の表示と submission 生成元が一致していることを固定する
- 既存フローを壊さず、undo 復元境界の契約だけを明文化する
