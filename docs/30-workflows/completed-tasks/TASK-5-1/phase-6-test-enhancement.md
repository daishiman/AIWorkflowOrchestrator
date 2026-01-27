# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                        |
| -------- | ------------------------- |
| Phase    | 6                         |
| タスクID | TASK-5-1                  |
| タスク名 | SkillAPI 実装（Preload）  |
| 機能名   | skill-import-agent-system |
| 作成日   | 2026-01-27                |

## 目的

Phase 5の実装に対してテストを拡充し、カバレッジ目標を達成する。

## 実行タスク

- カバレッジ分析: テストカバレッジの測定と不足領域の特定
- 統合テスト追加: IPC通信テストの拡充
- エッジケーステスト: 境界値・異常系テストの追加

## 参照資料

| 資料名       | パス                                    | 説明          |
| ------------ | --------------------------------------- | ------------- |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | Phase 4成果物 |
| 実装コード   | `apps/desktop/src/preload/skill-api.ts` | Phase 5成果物 |

---

## ユニットテストカバレッジ基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 結合テストカバレッジ基準

| 指標           | 目標 |
| -------------- | ---- |
| IPCチャネル    | 100% |
| APIメソッド    | 100% |
| 正常系シナリオ | 100% |
| 異常系シナリオ | 80%+ |

---

## テスト拡充項目

### 追加ユニットテスト

| カテゴリ               | テストケース                |
| ---------------------- | --------------------------- |
| execute                | タイムアウト時の動作        |
| execute                | 不正な引数での呼び出し      |
| abort                  | 既に完了した実行の中断      |
| abort                  | 存在しないexecutionIdの中断 |
| getExecutionStatus     | 複数回連続呼び出し          |
| onStream               | 複数リスナー登録            |
| onStream               | クリーンアップ後の再登録    |
| onPermissionRequest    | リスナー未登録時の動作      |
| sendPermissionResponse | 重複応答送信                |

### セキュリティテスト拡充

| カテゴリ   | テストケース                     |
| ---------- | -------------------------------- |
| safeInvoke | 空文字列チャネル                 |
| safeInvoke | null/undefinedチャネル           |
| safeInvoke | インジェクション試行             |
| safeOn     | 許可リストにないチャネル登録試行 |
| safeOn     | イベント発火時のコンテキスト検証 |

### 統合テスト拡充

| シナリオ     | 検証内容                                |
| ------------ | --------------------------------------- |
| 完全フロー   | execute → stream → complete             |
| エラーフロー | execute → error → クリーンアップ        |
| 中断フロー   | execute → abort → クリーンアップ        |
| 権限フロー   | permissionRequest → response → continue |

---

## 実行手順

### 1. カバレッジ測定

```bash
pnpm --filter @repo/desktop test:coverage -- skill-api
```

### 2. ギャップ分析

- 未到達の行/分岐/関数を特定
- セキュリティテスト不足領域を特定

### 3. 追加テスト作成

```typescript
// 追加テスト例
describe("skillAPI - edge cases", () => {
  describe("execute", () => {
    it("should handle timeout", async () => {
      // タイムアウトテスト
    });

    it("should reject invalid request", async () => {
      // 不正引数テスト
    });
  });

  describe("security", () => {
    it("should reject empty channel name", async () => {
      // 空チャネル拒否テスト
    });

    it("should reject null channel name", async () => {
      // nullチャネル拒否テスト
    });
  });
});
```

### 4. 統合テスト実行

```bash
pnpm --filter @repo/desktop test -- skill-api
```

---

## 成果物

| 成果物             | パス                                                   | 説明               |
| ------------------ | ------------------------------------------------------ | ------------------ |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`                   | カバレッジ分析結果 |
| 追加テストコード   | `apps/desktop/src/preload/__tests__/skill-api.test.ts` | 拡充テスト         |

---

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 全IPCチャネルがテストされている
- [ ] 全APIメソッドがテストされている
- [ ] 異常系テストが追加されている
- [ ] セキュリティテストが拡充されている
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 7: テストカバレッジ確認
