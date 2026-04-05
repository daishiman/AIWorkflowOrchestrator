# Phase 4: テスト作成（TDD: Red） - 会話型インタビュー UI

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| Phase名    | テスト作成（TDD: Red）                 |
| 前提Phase  | Phase 3（設計レビューゲート）          |
| 後続Phase  | Phase 5（実装）                        |
| ステータス | 未実施                                 |
| 作成日     | 2026-04-04                             |
| 機能名     | TASK-P0-06-conversational-interview-ui |
| Issue      | #1889                                  |

---

## 目的

Phase 2の設計に基づくテストシナリオを作成し、テストが失敗する状態（Red）を確立する。TDDの原則に従い、実装前にテストを記述することで、要件の抜け漏れを防止し、実装スコープを明確に制御する。

## 背景

Phase 3の設計レビューゲートでPASS判定を受け、Phase 4に進行可能となった。本タスクは既存テストファイルの**拡張**が中心であり、新規テストファイルの作成は行わない。既存の `ConversationalInterview.test.tsx` と `useInterviewState.test.ts` に対してテストケースを追加する。

---

## 実行タスク

### タスク1: 事前確認 — 既存テスト・ユーティリティの重複検出

**目的**: 既存テストコードとの重複を防止し、テスト基盤の健全性を確認する。

**実行手順**:

1. 既存テストファイルの確認

```bash
# 既存テストファイルの一覧と行数を確認
wc -l apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx
wc -l apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts

# 既存のdescribe/itブロックを確認（重複防止）
grep -n "describe\|it(" \
  apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx

grep -n "describe\|it(" \
  apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts
```

2. テストユーティリティの確認

```bash
# テストヘルパー・モック定義の確認
grep -rn "mock\|vi.fn\|vi.mock" \
  apps/desktop/src/renderer/components/skill/__tests__/ --include="*.ts" --include="*.tsx" | head -30

# 共通テストユーティリティの確認
ls apps/desktop/src/renderer/test-utils/ 2>/dev/null || echo "No test-utils directory"
```

3. import副作用の確認

```bash
# テストファイルのimport構造を確認
head -30 apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx
head -30 apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts
```

**期待される成果物**:

- 既存テストのインベントリ（テストケース数、カバー済み要件）
- 追加が必要なテストケースの差分リスト

---

### タスク2: ConversationalInterview.test.tsx の拡張テスト設計

**目的**: `ConversationalInterview.tsx` の拡張機能に対するテストケースを設計する。

#### テストケース一覧

| テストID | describe                  | it                                                                                | 対応FR | 対応AC |
| -------- | ------------------------- | --------------------------------------------------------------------------------- | ------ | ------ |
| CT-01    | 各InputKindのレンダリング | `single_select` の質問が表示されたとき、SingleSelectChipsがレンダリングされる     | FR-01  | AC-1   |
| CT-02    | 各InputKindのレンダリング | `multi_select` の質問が表示されたとき、MultiSelectCheckboxがレンダリングされる    | FR-01  | AC-1   |
| CT-03    | 各InputKindのレンダリング | `free_text` の質問が表示されたとき、FreeTextInputがレンダリングされる             | FR-01  | AC-1   |
| CT-04    | 各InputKindのレンダリング | `secret` の質問が表示されたとき、SecretInputがレンダリングされる                  | FR-01  | AC-1   |
| CT-05    | 各InputKindのレンダリング | `confirm` の質問が表示されたとき、ConfirmButtonsがレンダリングされる              | FR-01  | AC-1   |
| CT-06    | 送信フロー                | `single_select` で選択後に送信ボタンを押すと onSubmit が呼ばれる                  | FR-01  | AC-1   |
| CT-07    | 送信フロー                | `multi_select` でチェック後に送信ボタンを押すと onSubmit が呼ばれる               | FR-01  | AC-1   |
| CT-08    | 送信フロー                | `free_text` でテキスト入力後に送信ボタンを押すと onSubmit が呼ばれる              | FR-01  | AC-1   |
| CT-09    | 送信フロー                | `secret` で値入力後に送信ボタンを押すと onSubmit が呼ばれる                       | FR-01  | AC-1   |
| CT-10    | 送信フロー                | `confirm` でボタンを押すと即時に onSubmit が呼ばれる                              | FR-01  | AC-1   |
| CT-11    | undo操作                  | `single_select` でundo実行後、以前の選択状態が復元される                          | FR-06  | AC-6   |
| CT-12    | undo操作                  | `multi_select` でundo実行後、以前の選択状態が復元される                           | FR-06  | AC-6   |
| CT-13    | undo操作                  | `free_text` でundo実行後、以前のテキスト内容が復元される                          | FR-06  | AC-6   |
| CT-14    | undo操作                  | `secret` でundo実行後、値が空文字で復元される（セキュリティ）                     | FR-06  | AC-6   |
| CT-15    | undo操作                  | `confirm` でundo実行後、以前の選択状態が復元される                                | FR-06  | AC-6   |
| CT-16    | バリデーション            | `single_select` で未選択のまま送信すると `role="alert"` エラーが表示される        | FR-07  | AC-7   |
| CT-17    | バリデーション            | `multi_select` で未チェックのまま送信すると `role="alert"` エラーが表示される     | FR-07  | AC-7   |
| CT-18    | バリデーション            | `free_text` で空文字のまま送信すると `role="alert"` エラーが表示される            | FR-07  | AC-7   |
| CT-19    | バリデーション            | `secret` で空文字のまま送信すると `role="alert"` エラーが表示される               | FR-07  | AC-7   |
| CT-20    | APIキーガイダンス         | `apiKeyStatus="not_set"` かつ `secret` 種別のとき、ガイダンスバナーが表示される   | FR-05  | AC-5   |
| CT-21    | APIキーガイダンス         | ガイダンスバナーの「外部API設定を開く」クリックで onOpenApiKeySettings が呼ばれる | FR-05  | AC-5   |
| CT-22    | APIキーガイダンス         | `apiKeyStatus="configured"` のとき、ガイダンスバナーが表示されない                | FR-05  | AC-5   |
| CT-23    | 進捗バー                  | `InterviewProgressBar` に current/total が正しく渡される                          | FR-04  | AC-4   |
| CT-24    | 送信中状態制御            | `isSubmitting=true` のとき送信ボタンが disabled になる                            | FR-08  | AC-8   |
| CT-25    | 自動スクロール            | 新しいメッセージ追加後にチャットエリアが最下部にスクロールする                    | FR-09  | AC-9   |
| CT-26    | data-testid               | 必須の data-testid 属性が全て存在する                                             | NFR-06 | -      |

#### テスト記述パターン

```typescript
// CT-20: APIキーガイダンスの表示テスト例（Red状態で記述）
describe("APIキーガイダンス", () => {
  it('apiKeyStatus="not_set" かつ secret 種別のとき、ガイダンスバナーが表示される', () => {
    render(
      <ConversationalInterview
        {...defaultProps}
        pendingRequest={secretRequest}
        apiKeyStatus="not_set"
        onOpenApiKeySettings={vi.fn()}
      />
    );
    expect(
      screen.getByTestId("api-key-guidance-banner")
    ).toBeInTheDocument();
  });
});
```

---

### タスク3: useInterviewState.test.ts の拡張テスト設計

**目的**: `useInterviewState` フックの拡張機能に対するテストケースを設計する。

#### テストケース一覧

| テストID | describe                | it                                                                            | 対応FR | 対応AC |
| -------- | ----------------------- | ----------------------------------------------------------------------------- | ------ | ------ |
| UT-01    | addAssistantMessage     | 同一questionIdの質問が重複追加されない                                        | FR-02  | AC-2   |
| UT-02    | addAssistantMessage     | 新しい質問が追加されると currentStepIndex がインクリメントされる              | FR-04  | AC-4   |
| UT-03    | undo                    | undo実行で最後のuser/assistantメッセージペアが削除される                      | FR-06  | AC-6   |
| UT-04    | undo                    | undo実行で currentStepIndex がデクリメントされる                              | FR-06  | AC-6   |
| UT-05    | undo                    | メッセージが1件以下のときundo実行しても状態が変化しない                       | FR-06  | AC-6   |
| UT-06    | rollbackLastUserMessage | 最後のuserメッセージが削除される                                              | FR-06  | AC-6   |
| UT-07    | buildSubmission         | `single_select` の回答から正しい SkillCreatorUserInputSubmission が構築される | FR-01  | AC-1   |
| UT-08    | buildSubmission         | `multi_select` の回答から正しい SkillCreatorUserInputSubmission が構築される  | FR-01  | AC-1   |
| UT-09    | buildSubmission         | `free_text` の回答から正しい SkillCreatorUserInputSubmission が構築される     | FR-01  | AC-1   |
| UT-10    | buildSubmission         | `secret` の回答から正しい SkillCreatorUserInputSubmission が構築される        | FR-01  | AC-1   |
| UT-11    | buildSubmission         | `confirm` の回答から正しい SkillCreatorUserInputSubmission が構築される       | FR-01  | AC-1   |
| UT-12    | reset                   | reset呼び出しで全状態が初期値に戻る                                           | FR-03  | AC-3   |
| UT-13    | syncTotalSteps          | syncTotalSteps呼び出しで totalSteps が更新される                              | FR-04  | AC-4   |
| UT-14    | syncTotalSteps          | syncTotalSteps に0以下の値を渡しても totalSteps が負にならない                | FR-04  | AC-4   |
| UT-15    | P0-06/P0-08境界         | useInterviewState に localStorage への保存ロジックが含まれていない            | FR-03  | AC-3   |
| UT-16    | P0-06/P0-08境界         | ファイル先頭にスコープ境界コメントが存在する                                  | FR-03  | AC-3   |

#### テスト記述パターン

```typescript
// UT-01: addAssistantMessage重複防止テスト例（Red状態で記述）
describe("addAssistantMessage", () => {
  it("同一questionIdの質問が重複追加されない", () => {
    const { result } = renderHook(() => useInterviewState());

    act(() => {
      result.current.addAssistantMessage(mockQuestion);
      result.current.addAssistantMessage(mockQuestion); // 同一ID
    });

    const assistantMessages = result.current.messages.filter(
      (m) => m.role === "assistant",
    );
    expect(assistantMessages).toHaveLength(1);
  });
});
```

---

### タスク4: 統合テストシナリオの設計

**目的**: Session API↔ConversationalInterview のエンドツーエンドフローを検証する統合テストシナリオを設計する。

#### 統合テストシナリオ一覧

| シナリオID | シナリオ名                     | 概要                                                                                            | 対応FR       |
| ---------- | ------------------------------ | ----------------------------------------------------------------------------------------------- | ------------ |
| IT-01      | 基本フロー: 質問→回答→次の質問 | `question-received` → ユーザー回答 → `answer` 送信 → 次の `question-received` のサイクルを検証  | FR-01, FR-02 |
| IT-02      | 全InputKind順次テスト          | 5種類のInputKindを順番に受信し、それぞれ回答・送信するフルフロー                                | FR-01        |
| IT-03      | APIキー設定要求フロー          | `external-api-config-required` 受信 → ガイダンス表示 → 設定画面遷移 → `api-configured` のフロー | FR-05        |
| IT-04      | セッション完了フロー           | 最終質問の回答後に `session-complete` を受信し、UIが完了状態に遷移する                          | FR-02        |
| IT-05      | エラーハンドリングフロー       | `session-error` を受信したときのUIの挙動を検証                                                  | FR-02        |
| IT-06      | undoフロー（InputKind横断）    | 複数質問に回答後、undoで前の質問に戻り再回答する                                                | FR-06        |

#### 統合テストの実装方針

- `SkillCreatorConversationPanel` をレンダリングし、Session APIのモックを通じてIPCイベントをシミュレートする
- 各IPCチャンネルの `on`/`invoke` をモックし、Push型イベントのシミュレーションを行う
- テストファイル: `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx` 内の `describe("統合テスト")` ブロック、または必要に応じて `SkillCreatorConversationPanel.test.tsx`

---

### タスク5: テスト実行と Red 状態の確認

**目的**: 作成したテストが全て失敗すること（Red状態）を確認する。

**実行手順**:

1. テストの実行

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState)"
```

2. 失敗テストの確認

```bash
# 失敗テスト数のカウント（全テストがFAILであることを確認）
pnpm --filter @repo/desktop test -- --testPathPattern="skill/(ConversationalInterview|useInterviewState)" 2>&1 | grep -E "Tests:|FAIL|PASS"
```

3. Red状態の記録

- 新規追加テストが全て FAIL であることを確認
- 既存テストが PASS のまま維持されていることを確認（regression check）

**期待される結果**:

- 新規追加テスト: 全て FAIL（Red状態）
- 既存テスト: 全て PASS（regression なし）

---

### タスク6: トレーサビリティマトリクス

**目的**: 要件→テストの対応関係を一覧化し、カバレッジの網羅性を確認する。

| FR-ID | AC-ID | テストID（CT/UT）                 | カバー状態 |
| ----- | ----- | --------------------------------- | ---------- |
| FR-01 | AC-1  | CT-01〜CT-10, UT-07〜UT-11        | カバー済み |
| FR-02 | AC-2  | UT-01, UT-02, IT-01, IT-04, IT-05 | カバー済み |
| FR-03 | AC-3  | UT-12, UT-15, UT-16               | カバー済み |
| FR-04 | AC-4  | CT-23, UT-02, UT-13, UT-14        | カバー済み |
| FR-05 | AC-5  | CT-20, CT-21, CT-22, IT-03        | カバー済み |
| FR-06 | AC-6  | CT-11〜CT-15, UT-03〜UT-06, IT-06 | カバー済み |
| FR-07 | AC-7  | CT-16〜CT-19                      | カバー済み |
| FR-08 | AC-8  | CT-24                             | カバー済み |
| FR-09 | AC-9  | CT-25                             | カバー済み |

---

## 参照資料

| 資料名           | パス                                                                                    | 説明                                |
| ---------------- | --------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 1 要件定義 | `phase-1-requirements.md`                                                               | FR-01〜FR-09, AC-1〜AC-9            |
| Phase 2 設計     | `phase-2-design.md`                                                                     | アーキテクチャ設計、data-testid一覧 |
| Phase 3 レビュー | `phase-3-design-review.md`                                                              | 設計レビューPASS判定                |
| 既存テスト       | `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.test.tsx` | 拡張対象テストファイル              |
| 既存テスト       | `apps/desktop/src/renderer/components/skill/__tests__/useInterviewState.test.ts`        | 拡張対象テストファイル              |
| Issue #1889      | GitHub Issue                                                                            | TASK-P0-06の詳細仕様                |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで作成:

| カテゴリ            | シナリオ                                                                             | テストID | 確認状態 |
| ------------------- | ------------------------------------------------------------------------------------ | -------- | -------- |
| IPC接続テスト       | Session API → ConversationalInterview の質問配信サイクル                             | IT-01    | 設計済み |
| 型変換テスト        | UserInputQuestion → SkillCreatorUserInputRequest → InterviewMessage の型変換チェーン | IT-02    | 設計済み |
| InputKind統合テスト | 全5種InputKindのエンドツーエンドフロー                                               | IT-02    | 設計済み |
| APIキー連携テスト   | external-api-config-required → ガイダンス → configure-api → api-configured           | IT-03    | 設計済み |
| エラーハンドリング  | session-error 受信時のUI挙動                                                         | IT-05    | 設計済み |
| undo統合テスト      | 複数質問回答後のundo→再回答フロー                                                    | IT-06    | 設計済み |

---

## 成果物

| 成果物                     | パス                                       | 説明                                           |
| -------------------------- | ------------------------------------------ | ---------------------------------------------- |
| テスト仕様書               | `outputs/phase-4/test-specification.md`    | テストケース一覧（CT-26件 + UT-16件 + IT-6件） |
| Red結果記録                | `outputs/phase-4/red-test-result.md`       | 新規テストの全件FAIL確認記録                   |
| トレーサビリティマトリクス | `outputs/phase-4/traceability-matrix.md`   | FR→テストIDの対応表                            |
| 統合テスト計画             | `outputs/phase-4/integration-test-plan.md` | IT-01〜IT-06のシナリオ詳細                     |

---

## 完了条件

- [ ] 既存テストファイルのインベントリが作成されている
- [ ] ConversationalInterview.test.tsx の拡張テストケース（CT-01〜CT-26）が設計されている
- [ ] useInterviewState.test.ts の拡張テストケース（UT-01〜UT-16）が設計されている
- [ ] 統合テストシナリオ（IT-01〜IT-06）が設計されている
- [ ] テスト実行コマンドが確認されている
- [ ] 新規追加テストが全て FAIL（Red状態）であることが確認されている
- [ ] 既存テストが全て PASS（regressionなし）であることが確認されている
- [ ] トレーサビリティマトリクスで全FR/ACがカバーされていることが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 5: 実装（TDD: Green） → `phase-5-implementation.md`
