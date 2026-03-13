# Vitest エラー隠蔽設定解消 - タスク指示書

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-FIX-10-1-VITEST-ERROR-HANDLING        |
| タスク名     | dangerouslyIgnoreUnhandledErrors設定の解消 |
| 分類         | テスト品質改善                             |
| 対象機能     | Vitest 設定                                |
| 優先度       | 中                                         |
| 見積もり規模 | 中規模                                     |
| ステータス   | 完了                                       |
| 実行順序     | 07（単独 — グループ06完了後・最終）        |
| 発見元       | skill-system-conflict-report #10           |
| 発見日       | 2026-02-05                                 |
| 完了日       | 2026-02-19                                 |
| 関連Phase    | Phase 4（品質向上）                        |
| 関連Issue    | -                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`apps/desktop/vitest.config.ts` L43 で `dangerouslyIgnoreUnhandledErrors: true` が設定されており、未処理の Promise 拒否がテストで無視される。テスト安定化のための暫定措置だが、テスト結果の信頼性を損なう。

### 1.2 問題点・課題

| 問題                                | 影響                                 |
| ----------------------------------- | ------------------------------------ |
| 未処理 Promise 拒否がテストで無視   | 非同期バグが隠蔽される               |
| テスト全 PASS の信頼性低下          | 本来失敗すべきテストが通過する可能性 |
| 名前が示す通り "dangerously" な設定 | 公式が推奨しない設定                 |

### 1.3 放置した場合の影響

- 非同期のバグ（Promise 未処理拒否）がテストで検出されない
- 本番で初めてエラーが発覚するリスク
- テストスイート全体の信頼性が疑問視される

---

## 2. 何を達成するか（What）

### 2.1 目的

`dangerouslyIgnoreUnhandledErrors: true` を `false`（デフォルト）に戻し、未処理の Promise 拒否を適切にテストで検出可能にする。

### 2.2 最終ゴール

1. `dangerouslyIgnoreUnhandledErrors` の設定が削除されている
2. 全テストが PASS（未処理拒否の根本原因を修正）
3. テスト結果の信頼性が回復

### 2.3 スコープ

#### 含むもの

- vitest.config.ts の設定変更
- 設定変更で失敗するテストの根本原因修正
- 非同期テストの適切なエラーハンドリング追加

#### 含まないもの

- テストフレームワークの変更
- 新規テストの追加

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9B-I-SDK-FORMAL-INTEGRATION 完了（SDK テスト安定化）

### 3.2 依存タスク

- TASK-FIX-11-1-SDK-TEST-ENABLEMENT（SDK テストが有効化されていること）
- TASK-9B-I-SDK-FORMAL-INTEGRATION（SDK統合が安定していること）

### 3.3 推奨アプローチ

1. 設定を `false` に変更
2. 失敗するテストを特定
3. 各テストの未処理拒否の根本原因を修正
4. 全テスト PASS を確認

---

## 4. 実行手順

### Step 1: 影響範囲の特定

#### 手順

1. `dangerouslyIgnoreUnhandledErrors: false` に変更
2. テストスイートを実行
3. 新たに失敗するテストをリストアップ

### Step 2: 根本原因修正

#### 手順

1. 各失敗テストの未処理 Promise 拒否を特定
2. 適切な `try/catch` または `.catch()` を追加
3. テスト内の非同期処理を `await` で正しく待機

### Step 3: 設定確定

#### 手順

1. 全テスト PASS を確認
2. `dangerouslyIgnoreUnhandledErrors` 行を削除

---

## 5. 完了条件チェックリスト

- [x] `dangerouslyIgnoreUnhandledErrors` が vitest.config.ts から削除
- [x] 全テストが PASS
- [x] 未処理 Promise 拒否が適切にハンドリングされている

---

## 6. 検証方法

### テストケース

1. 全テストスイート PASS
2. 意図的に未処理拒否を発生させるテスト → 検出される

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                             |
| ------------------------------------ | ------ | -------- | -------------------------------- |
| 多数のテストが失敗                   | 中     | 中       | 段階的に修正                     |
| 根本原因がプロダクションコードにある | 高     | 中       | テストとプロダクション両方を修正 |

---

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/vitest.config.ts` L43
- Vitest 公式ドキュメント（dangerouslyIgnoreUnhandledErrors）

### 関連タスク

- TASK-FIX-11-1-SDK-TEST-ENABLEMENT（SDK テスト有効化）
- TASK-9B-I-SDK-FORMAL-INTEGRATION（SDK 安定化）

---

## 9. 備考

### 暫定措置の経緯

テスト安定化のために導入された設定。SDK 統合テスト等で未処理の Promise 拒否が多発したことが原因と推定。SDK 正式統合後にこの設定を解消する。
