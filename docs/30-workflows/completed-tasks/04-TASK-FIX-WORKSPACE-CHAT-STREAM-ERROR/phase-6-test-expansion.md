# Phase 6: テスト拡充

## メタ情報

| 項目          | 値                                                                                    |
| ------------- | ------------------------------------------------------------------------------------- |
| Phase番号     | 6                                                                                     |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                              |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                                  |
| 作成日        | 2026-03-20                                                                            |
| 前Phase成果物 | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-5-implementation.md` |

## 目的

Phase 5の実装後にカバレッジレポートを取得し、不足しているテストケースを特定して補完する。境界値・異常系・エッジケースを中心にテストを追加し、Phase 7のカバレッジ基準（Line 80%以上・Branch 60%以上）を達成する。

## 実行タスク

### Task 1: カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/views/WorkspaceView \
  --coverage \
  --coverage.reporter=text \
  --coverage.include="src/renderer/views/WorkspaceView/**"
```

レポートから以下を確認する:

- `mapLLMErrorToStreamingError.ts`: Line/Branch カバレッジ
- `StreamingErrorDisplay.tsx`: Line/Branch カバレッジ
- `useWorkspaceChatController.ts`: 追加差分のカバレッジ

### Task 2: 不足テストの特定と追加

#### 2-A: mapLLMErrorToStreamingError の不足ケース

カバレッジレポートを確認して未カバーの分岐に対してテストを追加する。

追加候補:

- エラーオブジェクトの `code` が空文字列の場合
- `error.message` が空文字列の場合
- 各エラーコードの `code` フィールドが返される値の一致確認

#### 2-B: StreamingErrorDisplay の不足ケース

追加候補:

- `hint` が空文字列の場合（表示/非表示）
- キーボード操作でのボタン実行（`keyDown` イベント）
- `aria-live="assertive"` の確認
- ダークモードクラスの確認（クラス名テスト）

#### 2-C: useWorkspaceChatController の不足ケース

追加候補:

- `onStreamError` が `isStreaming === false` の状態で呼ばれた場合（ガード確認）
- `retryLastMessage` を `streamingError.retryable === false` の状態で呼んだ場合（何もしない確認）
- `dismissStreamingError` 後に `streamingError === null` かつ `errorMessage === null` の両方を確認
- Settings遷移ハンドラが正しく呼ばれるかの統合テスト

### Task 3: エラー後の状態リカバリ統合テスト

`WorkspaceChatPanel` レベルでの統合テストを追加する（必要に応じて）。

```typescript
// apps/desktop/src/renderer/views/WorkspaceView/__tests__/WorkspaceChatPanel.errorRecovery.test.tsx
describe("WorkspaceChatPanel - error recovery", () => {
  it("エラー発生後にメッセージ送信が可能な状態に戻る", async () => {
    // isStreaming, isSending が false に戻ることを確認
  });

  it("dismissStreamingError 後に新規メッセージが送信できる", async () => {
    // エラーdismiss後の入力フィールドが有効になることを確認
  });
});
```

### Task 4: テスト実行と確認

```bash
# 全テスト実行
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView

# カバレッジ再計測
cd apps/desktop && pnpm vitest run \
  src/renderer/views/WorkspaceView \
  --coverage
```

## 参照資料

| ドキュメント     | パス                                                                                  | 参照目的             |
| ---------------- | ------------------------------------------------------------------------------------- | -------------------- |
| Phase 4 テスト   | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-4-test-creation.md`  | 既存テストケース一覧 |
| Phase 5 実装     | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-5-implementation.md` | 実装ファイルパス     |
| コード品質ルール | `.claude/rules/02-code-quality.md`                                                    | カバレッジ基準       |
| P39 happy-dom    | `.claude/rules/06-known-pitfalls.md`                                                  | userEvent禁止        |

## 実行手順

1. **Task 1**: カバレッジレポートを取得して不足箇所を特定する
2. **Task 2**: 不足テストケースをファイル別に追加する
3. **Task 3**: 統合テストが必要と判断した場合は追加する
4. **Task 4**: 全テストを再実行してカバレッジ基準を確認する
5. 基準未達の場合は Phase 7 でフィードバックを受けて Task 2 に戻る

## 統合テスト連携

- `useWorkspaceChatController.runtime.test.ts` に `R-25`〜`R-27` を追加し、retry 重複保存防止と dismiss clear を固定する。
- `WorkspaceChatPanel.runtime.test.tsx` に `U-07` を追加し、banner 表示時の inline fallback 抑止を固定する。
- Phase 11 screenshot の 5 シナリオと runtime test の責務分離を意識して test を増やす。

## 成果物

| 成果物                       | パス                                                                                  | 形式       |
| ---------------------------- | ------------------------------------------------------------------------------------- | ---------- |
| 追加テストファイル群         | `apps/desktop/src/renderer/views/WorkspaceView/**/__tests__/`                         | TypeScript |
| Phase 6 仕様書（本ファイル） | `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-6-test-expansion.md` | Markdown   |

## 完了条件

- [ ] カバレッジレポートを取得して不足テストケースを特定済み
- [ ] `mapLLMErrorToStreamingError.ts` の追加ケースを補完済み
- [ ] `StreamingErrorDisplay.tsx` の追加ケースを補完済み
- [ ] `useWorkspaceChatController.ts` の追加ケースを補完済み
- [ ] 全テストが Green であること
- [ ] P39準拠: `fireEvent` を使用（`userEvent` 不使用）
- [ ] Phase 7 カバレッジ確認に進める状態であること

## 次Phase

Phase 7: カバレッジ確認 (`phase-7-coverage-check.md`)
