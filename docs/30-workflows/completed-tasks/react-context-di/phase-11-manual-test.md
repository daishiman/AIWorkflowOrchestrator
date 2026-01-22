# Phase 11: 手動テスト検証 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 11                             |
| Phase名    | 手動テスト検証                 |
| 前提Phase  | Phase 10（最終レビューゲート） |
| 後続Phase  | Phase 12（ドキュメント更新）   |
| ステータス | 未実施                         |
| 作成日     | 2026-01-22                     |
| 機能名     | React Context DI実装           |

---

## 目的

UX・実環境動作確認を行い、実際の使用シナリオで正しく動作することを検証する。

## 背景

Phase 1〜10で自動テストと品質チェックが完了した。本Phaseでは、実環境での動作確認と、実際の使用シナリオに基づいた手動テストを実施する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 自動テスト実行確認

**目的**: 関連する自動テストを全て実行して確認する。

**実行手順**:

1. 全テストを実行:

   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/features/chat-history/
   ```

2. 統合テストを実行:

   ```bash
   pnpm --filter @repo/desktop test -- --run apps/desktop/src/features/chat-history/__tests__/ChatHistoryIntegration.test.tsx
   ```

3. テスト結果を確認
4. 結果を `outputs/phase-11/automated-test-result.md` に記録

**期待される成果物**:

- `outputs/phase-11/automated-test-result.md`

---

### タスク2: 機能テスト（正常系）

**目的**: 正常系の機能テストを実施する。

**実行手順**:

1. 以下のテストケースを実施:

   | TC-ID  | 機能                                | 期待結果                         | 結果 | 備考 |
   | ------ | ----------------------------------- | -------------------------------- | ---- | ---- |
   | TC-001 | Provider内でuseChatHistory          | Context値が取得できる            |      |      |
   | TC-002 | createSession.execute呼び出し       | セッション作成が成功する         |      |      |
   | TC-003 | addUserMessage.execute呼び出し      | ユーザーメッセージ追加が成功する |      |      |
   | TC-004 | addAssistantMessage.execute呼び出し | AIメッセージ追加が成功する       |      |      |
   | TC-005 | togglePinned.execute呼び出し        | ピン留め切替が成功する           |      |      |
   | TC-006 | searchSessions.execute呼び出し      | セッション検索が成功する         |      |      |
   | TC-007 | isReady状態確認                     | 初期化後trueになる               |      |      |

2. テスト結果を `outputs/phase-11/functional-test-result.md` に記録

**期待される成果物**:

- `outputs/phase-11/functional-test-result.md`

---

### タスク3: エラーハンドリングテスト（異常系）

**目的**: 異常系のエラーハンドリングテストを実施する。

**実行手順**:

1. 以下のテストケースを実施:

   | TC-ID  | 状況                         | 期待結果                       | 結果 | 備考 |
   | ------ | ---------------------------- | ------------------------------ | ---- | ---- |
   | TC-101 | Provider外でuseChatHistory   | エラーがスローされる           |      |      |
   | TC-102 | Repository未指定でProvider   | エラーがスローされる           |      |      |
   | TC-103 | Use Case実行失敗             | エラーが適切に伝播される       |      |      |
   | TC-104 | 不正な引数でUse Case呼び出し | バリデーションエラーが返される |      |      |

2. テスト結果を `outputs/phase-11/error-handling-test-result.md` に記録

**期待される成果物**:

- `outputs/phase-11/error-handling-test-result.md`

---

### タスク4: 統合テスト（Provider-Hook連携）

**目的**: Provider-Hook間の連携を検証する。

**実行手順**:

1. 以下のテストケースを実施:

   | TC-ID  | テスト項目                   | 期待結果                       | 結果 | 備考 |
   | ------ | ---------------------------- | ------------------------------ | ---- | ---- |
   | TC-201 | Provider注入確認             | 全Use Casesが利用可能          |      |      |
   | TC-202 | カスタムRepository注入       | 注入したRepositoryが使用される |      |      |
   | TC-203 | MockProvider使用             | モック値が返される             |      |      |
   | TC-204 | MockProviderのoverrides      | 部分上書きが機能する           |      |      |
   | TC-205 | 複数コンポーネントでHook使用 | 同じContext値が共有される      |      |      |

2. テスト結果を `outputs/phase-11/integration-test-result.md` に記録

**期待される成果物**:

- `outputs/phase-11/integration-test-result.md`

---

### タスク5: 発見課題記録

**目的**: 手動テストで発見した課題を記録する。

**実行手順**:

1. 発見した課題を以下の形式で記録:

   | 課題ID | 概要 | 重要度   | 対応方針 |
   | ------ | ---- | -------- | -------- |
   | ?      | ?    | 高/中/低 | ?        |

2. 課題を `outputs/phase-11/discovered-issues.md` に記録

**期待される成果物**:

- `outputs/phase-11/discovered-issues.md`

---

### タスク6: 手動テスト結果レポート作成

**目的**: Phase 11の手動テスト結果を集約し、レポートを作成する。

**実行手順**:

1. タスク1〜5の結果を集約
2. 手動テスト結果レポートを `outputs/phase-11/manual-test-result.md` に作成
3. 以下のセクションを含める:

   ```markdown
   ## テストカテゴリ別結果

   ### 機能テスト（正常系）

   | TC-ID  | 機能       | 期待結果           | 結果 | 備考 |
   | ------ | ---------- | ------------------ | ---- | ---- |
   | TC-001 | {{機能名}} | {{期待される動作}} | PASS |      |

   ### エラーハンドリングテスト（異常系）

   | TC-ID  | 状況         | 期待結果             | 結果 | 備考 |
   | ------ | ------------ | -------------------- | ---- | ---- |
   | TC-101 | {{異常状況}} | {{期待されるエラー}} | PASS |      |

   ### 統合テスト

   | テスト項目   | 結果 | 課題有無 |
   | ------------ | ---- | -------- |
   | Provider注入 | PASS | なし     |
   ```

**期待される成果物**:

- `outputs/phase-11/manual-test-result.md`

---

## 参照資料

### 前Phase成果物

| 参照資料 | パス                                | 内容             |
| -------- | ----------------------------------- | ---------------- |
| 最終判定 | `outputs/phase-10/final-verdict.md` | 最終レビュー結果 |

---

## 成果物

| 成果物                 | パス                                             | 内容              |
| ---------------------- | ------------------------------------------------ | ----------------- |
| 自動テスト結果         | `outputs/phase-11/automated-test-result.md`      | 自動テスト確認    |
| 機能テスト結果         | `outputs/phase-11/functional-test-result.md`     | 正常系テスト      |
| エラーハンドリング結果 | `outputs/phase-11/error-handling-test-result.md` | 異常系テスト      |
| 統合テスト結果         | `outputs/phase-11/integration-test-result.md`    | Provider-Hook連携 |
| 発見課題               | `outputs/phase-11/discovered-issues.md`          | 課題一覧          |
| 手動テストレポート     | `outputs/phase-11/manual-test-result.md`         | 総合結果レポート  |

---

## 統合テスト連携（Phase 11は必須）

手動統合テスト（Provider注入確認）を実施:

- Provider経由で全Use Casesが利用可能
- カスタムRepository注入が機能する
- MockProviderでテストが可能

---

## 完了条件

- [ ] タスク1: 自動テスト実行確認完了
- [ ] タスク2: 機能テスト（正常系）完了
- [ ] タスク3: エラーハンドリングテスト（異常系）完了
- [ ] タスク4: 統合テスト（Provider-Hook連携）完了
- [ ] タスク5: 発見課題記録完了
- [ ] タスク6: 手動テスト結果レポート作成完了
- [ ] 全成果物が `outputs/phase-11/` に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート）が完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/react-context-di/phase-12-documentation.md`
