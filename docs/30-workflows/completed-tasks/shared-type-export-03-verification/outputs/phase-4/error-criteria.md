# エラー判定基準書

## 作成日

2026-01-23

## Phase 4 - Task 4-3: エラー判定基準の整理

---

## 1. エラー判定基準

### 1.1 typecheck コマンド

| 条件                               | 判定    | 説明               |
| ---------------------------------- | ------- | ------------------ |
| Exit code 0 + エラーメッセージなし | ✅ PASS | 型チェック成功     |
| Exit code 0 + 警告のみ             | ✅ PASS | 警告は許容         |
| Exit code != 0                     | ❌ FAIL | 型エラーあり       |
| Community関連の型エラー            | ❌ FAIL | 本タスクで修正必要 |

### 1.2 build コマンド

| 条件                       | 判定    | 説明               |
| -------------------------- | ------- | ------------------ |
| Exit code 0 + 成果物生成   | ✅ PASS | ビルド成功         |
| Exit code 0 + 警告のみ     | ✅ PASS | 警告は許容         |
| Exit code != 0             | ❌ FAIL | ビルドエラー       |
| 型エクスポート起因のエラー | ❌ FAIL | 本タスクで修正必要 |

### 1.3 git push コマンド

| 条件                         | 判定    | 説明           |
| ---------------------------- | ------- | -------------- |
| pre-push hook Exit code 0    | ✅ PASS | hook通過       |
| pre-push hook Exit code != 0 | ❌ FAIL | hook失敗       |
| リモート未設定               | ○ SKIP  | 検証スキップ可 |

---

## 2. 無視するエラー（既知の問題）

### 2.1 @repo/desktop 既知の問題

| 問題                   | 症状                   | 対応方針                       |
| ---------------------- | ---------------------- | ------------------------------ |
| Renderer関連ビルド警告 | 特定のRenderer関連警告 | 本タスクのスコープ外として無視 |
| 既存の型定義の問題     | 別機能の型エラー       | 別タスクで対応                 |

### 2.2 判定除外の条件

以下の条件に該当するエラーは、本タスクのFAIL判定から除外:

1. **Community型に無関係なエラー**
   - 他のモジュールの型エラー
   - 別機能のビルドエラー

2. **既知の既存問題**
   - Renderer関連の警告
   - 既存のテスト関連問題

---

## 3. エラー分類フロー

```
エラー発生
    ↓
Community型関連？
    │
    ├─ Yes → ❌ FAIL（本タスクで修正）
    │
    └─ No → 既知の問題？
              │
              ├─ Yes → ⚠️ 記録して無視
              │
              └─ No → 新規問題として記録
                      （本タスクの範囲外）
```

---

## 4. エラーメッセージパターン

### 4.1 FAIL判定とするエラー

| エラーコード | エラーメッセージパターン                                   | 対応               |
| ------------ | ---------------------------------------------------------- | ------------------ |
| TS2305       | `Module "@repo/shared" has no exported member 'Community'` | Phase 5で修正      |
| TS2307       | `Cannot find module '@repo/shared'`                        | モジュール解決確認 |
| TS2614       | `Module "@repo/shared" has no default export`              | インポート修正     |

### 4.2 無視するエラー

| パターン                      | 理由       |
| ----------------------------- | ---------- |
| `warning` を含むメッセージ    | 警告は許容 |
| `Renderer` を含む既知のエラー | 既存問題   |
| 他パッケージの型エラー        | スコープ外 |

---

## 5. 判定例

### 5.1 PASS例

```
$ pnpm --filter @repo/shared typecheck
✨  Done in 2.5s.
```

→ Exit code 0、エラーなし → ✅ PASS

### 5.2 FAIL例

```
$ pnpm --filter @repo/desktop typecheck
error TS2305: Module '"@repo/shared"' has no exported member 'Community'.
```

→ Community関連エラー → ❌ FAIL

### 5.3 無視例

```
$ pnpm --filter @repo/desktop build
(warning) Some Renderer optimization skipped
✨  Done in 15.2s.
```

→ 警告のみ、Exit code 0 → ✅ PASS（警告は無視）

---

## 6. 完了確認

- [x] 各コマンドのPASS/FAIL条件が明確に定義されている
- [x] 無視するエラー（既知の問題）が明記されている
- [x] エラー分類フローが定義されている
- [x] 判定例が記載されている
