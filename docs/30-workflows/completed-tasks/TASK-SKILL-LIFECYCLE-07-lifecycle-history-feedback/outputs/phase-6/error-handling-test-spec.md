# エラーハンドリングテスト仕様書

## メタ情報

| 項目       | 内容                                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase      | 6（テスト拡充）                                                                                                                                                |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                                                                        |
| 作成日     | 2026-03-16                                                                                                                                                     |
| 入力成果物 | `outputs/phase-4/*.md`, `outputs/phase-5/*.md`                                                                                                                 |
| テスト状態 | Red（Phase 5 実装後に Green へ移行）                                                                                                                           |
| 実装先     | `packages/shared/src/skill/lifecycle/__tests__/error-handling.test.ts`, `apps/desktop/src/renderer/store/slices/__tests__/lifecycleHistorySlice.error.test.ts` |

---

## 1. 目的

Phase 4 テスト仕様では主に正常系と境界値を重点的にカバーしたが、以下のエラーハンドリング観点が不足していた。

- persist 保存タイムアウト・IPC 応答タイムアウト
- 無効データ（型違い・未来タイムスタンプ・不整合）のバリデーション
- persist 破損データからの復旧

本仕様書でこれらを補完する。

---

## 2. テストケース一覧

### 2-1. タイムアウトテスト

| テストID   | テストケース                                               | 入力・シナリオ                                                 | 期待結果                                                                                                            | 分類   |
| ---------- | ---------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------ |
| ERR-TO-001 | persist 保存がタイムアウトした場合フォールバックで動作する | localStorage.setItem をモックして3秒遅延させる                 | State の events は正常に更新される（persist 失敗時もインメモリ State は有効）、`error` フィールドにメッセージが設定 | 異常系 |
| ERR-TO-002 | IPC 応答が5秒以内に返らない場合タイムアウトエラーになる    | `syncFromPersistence` の IPC 呼び出しをモックして6秒遅延させる | `isLoading` が false に戻る、`error` に "タイムアウト" 相当のメッセージが設定される                                 | 異常系 |
| ERR-TO-003 | タイムアウト後のリトライが不可であること                   | ERR-TO-002 の状態から再度 `syncFromPersistence` を呼び出す     | 新たな IPC 呼び出しが発行される（前回の pending Promise は破棄される）                                              | 異常系 |
| ERR-TO-004 | タイムアウト中に recordEvent が呼び出されても State は有効 | `syncFromPersistence` がタイムアウト中に `recordEvent` を実行  | recordEvent は正常に State を更新する（同期処理とは独立）                                                           | 正常系 |

### 2-2. 無効データバリデーションテスト

| テストID   | テストケース                                           | 入力                                                                                          | 期待結果                                                                                  | 分類   |
| ---------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------ |
| ERR-VD-001 | metadata の score が文字列型の場合バリデーションエラー | `createLifecycleEvent({...defaults, metadata: { score: "abc" } as any})`                      | Error を throw、またはスコアが ScoreDataPoint に含まれない（型ガードで除外）              | 異常系 |
| ERR-VD-002 | 未来の timestamp（現在時刻+1日）を持つイベントの処理   | `createLifecycleEvent({...defaults, timestamp: futureISO})`                                   | イベントは記録されるが、`buildAggregateView` の集計で正しく扱われる（ソート順が一貫する） | 境界値 |
| ERR-VD-003 | eventType と category の不整合が検出される             | `eventType: "skill:executed"` に対して `category: "creation"` を手動設定（as any でバイパス） | `EVENT_CATEGORY_MAP` による自動導出が優先され、`category: "execution"` となる             | 異常系 |
| ERR-VD-004 | feedbackType と value 型の不一致が検出される           | `createFeedback({ feedbackType: "user_rating", value: "not-a-number" as any })`               | バリデーションエラーを throw、またはランタイム型ガードで拒否                              | 異常系 |
| ERR-VD-005 | user_rating の value が 0（範囲外: 1-5）の場合拒否     | `createFeedback({ feedbackType: "user_rating", value: 0 })`                                   | バリデーションエラー（value は 1-5 の整数のみ許可）                                       | 異常系 |
| ERR-VD-006 | user_rating の value が 6（範囲外: 1-5）の場合拒否     | `createFeedback({ feedbackType: "user_rating", value: 6 })`                                   | バリデーションエラー                                                                      | 異常系 |
| ERR-VD-007 | user_text の value が 501 文字の場合拒否               | `createFeedback({ feedbackType: "user_text", value: "a".repeat(501) })`                       | バリデーションエラー（最大500文字制限）                                                   | 異常系 |
| ERR-VD-008 | user_text の value が空文字列の場合拒否                | `createFeedback({ feedbackType: "user_text", value: "" })`                                    | バリデーションエラー                                                                      | 異常系 |
| ERR-VD-009 | improvement_suggestion の priority が不正値の場合拒否  | `value: { targetSection: "prompt_template", suggestion: "test", priority: "urgent" as any }`  | `isImprovementSuggestion()` 型ガードが false を返す、またはバリデーションエラー           | 異常系 |

### 2-3. 破損データ復旧テスト

| テストID   | テストケース                                                     | 入力・シナリオ                                                                                | 期待結果                                                                                       | 分類   |
| ---------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------ |
| ERR-CR-001 | persist ストレージが破損した場合、初期状態にフォールバックする   | localStorage に `"lifecycle-history"` キーで不正 JSON（`"{broken"`）を設定して Store を初期化 | Store が `initialState` で起動する（`events: []`, `aggregateViews: {}`, `lastSyncedAt: null`） | 異常系 |
| ERR-CR-002 | persist ストレージに不正な JSON が格納されている場合の復旧       | localStorage に `"lifecycle-history"` キーで `"null"` を設定                                  | Store が `initialState` で起動する                                                             | 異常系 |
| ERR-CR-003 | persist の version が不一致の場合マイグレーションが実行される    | localStorage に `version: 0` のデータを設定して Store を初期化                                | `migrate` 関数が呼ばれ、`lastSyncedAt: null` が追加される（v0 -> v1 マイグレーション）         | 異常系 |
| ERR-CR-004 | persist の version が未来のバージョン（version: 99）の場合の処理 | localStorage に `version: 99` のデータを設定                                                  | フォールバック動作（初期状態にリセット、またはそのままロード）                                 | 異常系 |
| ERR-CR-005 | feedbackSlice の persist が破損した場合の復旧                    | localStorage に `"feedback-store"` キーで不正データを設定して feedbackSlice を初期化          | `feedbacksBySkillId: {}`, `isSubmitting: false`, `lastError: null` で初期化される              | 異常系 |

---

## 3. テスト実装方針

### 3-1. テストファイル構成

```
packages/shared/src/skill/lifecycle/__tests__/
  error-handling.test.ts         # ERR-VD-*（バリデーション関連）

apps/desktop/src/renderer/store/slices/__tests__/
  lifecycleHistorySlice.error.test.ts  # ERR-TO-*, ERR-CR-*（Store・persist関連）
```

### 3-2. 既知パターン対策

| パターン | 対策                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------ |
| P9       | `beforeEach` で localStorage をクリアし、Store を初期状態にリセット                              |
| P13      | タイムアウトテストでは `vi.useFakeTimers()` + `vi.advanceTimersByTime(5000)` で1ステップずつ進行 |
| P49      | metadata の型ガードテスト（ERR-VD-001）は `in` 演算子による実行時検証を確認                      |
| P39      | Store テストは happy-dom 不要（純粋ロジックテスト）。UI テストが必要な場合は `fireEvent` を使用  |

### 3-3. テストデータ依存

- `createMockLifecycleEvent()`, `createMockFeedback()` ファクトリを使用
- タイムアウトテストでは IPC 呼び出しを `vi.fn()` でモック化

---

## 4. テストケース件数サマリー

| カテゴリ                       | 件数   |
| ------------------------------ | ------ |
| タイムアウトテスト             | 4      |
| 無効データバリデーションテスト | 9      |
| 破損データ復旧テスト           | 5      |
| **合計**                       | **18** |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 6_
