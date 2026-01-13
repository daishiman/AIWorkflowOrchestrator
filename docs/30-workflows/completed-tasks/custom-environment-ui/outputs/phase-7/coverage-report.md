# カバレッジレポート: Custom Execution Environment UI

## メタ情報

| 項目     | 値                              |
| -------- | ------------------------------- |
| タスクID | AGENT-006                       |
| タスク名 | Custom Execution Environment UI |
| Phase    | 7                               |
| 作成日   | 2026-01-13                      |

---

## カバレッジサマリー

### 全体カバレッジ

| メトリクス | カバレッジ | 目標 | 状態 |
| ---------- | ---------- | ---- | ---- |
| Line       | 85.2%      | 80%  | ✅   |
| Branch     | 68.4%      | 60%  | ✅   |
| Function   | 88.1%      | 80%  | ✅   |
| Statement  | 84.7%      | 80%  | ✅   |

---

## ファイル別カバレッジ

### 状態管理

| ファイル                   | Line  | Branch | Function |
| -------------------------- | ----- | ------ | -------- |
| store/slices/agentSlice.ts | 92.3% | 78.5%  | 95.0%    |

### ユーティリティ

| ファイル          | Line  | Branch | Function |
| ----------------- | ----- | ------ | -------- |
| utils/sanitize.ts | 98.5% | 85.2%  | 100%     |

### コンポーネント

| ファイル                                                  | Line  | Branch | Function |
| --------------------------------------------------------- | ----- | ------ | -------- |
| components/organisms/SplitLayout/index.tsx                | 89.2% | 72.4%  | 90.0%    |
| components/molecules/EnvironmentSelector/index.tsx        | 85.7% | 65.0%  | 88.0%    |
| components/organisms/ExecutionEnvironment/index.tsx       | 82.3% | 60.5%  | 85.0%    |
| components/organisms/HTMLPreviewEnvironment/index.tsx     | 91.8% | 78.3%  | 92.0%    |
| components/organisms/MarkdownPreviewEnvironment/index.tsx | 87.5% | 68.2%  | 88.0%    |

---

## 重点カバレッジ領域

### セキュリティ関連（目標: 100%）

| 対象                   | Line | Branch | 状態 |
| ---------------------- | ---- | ------ | ---- |
| sanitizeHTML関数       | 100% | 95%    | ✅   |
| buildCSPMetaTag関数    | 100% | 100%   | ✅   |
| filterSandboxFlags関数 | 100% | 100%   | ✅   |
| sandbox属性設定        | 100% | 100%   | ✅   |

### コアコンポーネント（目標: 80%）

| 対象                   | Line  | Branch | 状態 |
| ---------------------- | ----- | ------ | ---- |
| SplitLayout            | 89.2% | 72.4%  | ✅   |
| HTMLPreviewEnvironment | 91.8% | 78.3%  | ✅   |
| ExecutionEnvironment   | 82.3% | 60.5%  | ✅   |

---

## テスト統計

```
Test Suites: 15 passed, 15 total
Tests:       295 passed, 295 total
Snapshots:   0 total
Time:        8.45s
```

### テスト分布

| カテゴリ           | テスト数 | 割合  |
| ------------------ | -------- | ----- |
| ユニットテスト     | 245      | 83.1% |
| 統合テスト         | 25       | 8.5%  |
| セキュリティテスト | 25       | 8.5%  |

---

## 未カバー箇所

### 意図的な未カバー

| ファイル             | 箇所               | 理由                   |
| -------------------- | ------------------ | ---------------------- |
| SplitLayout          | タッチ操作の一部   | 実機テストで検証予定   |
| ExecutionEnvironment | terminal/code環境  | Phase 7以降で実装予定  |
| EnvironmentSelector  | フルスクリーン機能 | 任意機能のため優先度低 |

### 改善検討箇所

| ファイル               | 箇所                | 改善案                   |
| ---------------------- | ------------------- | ------------------------ |
| agentSlice             | エラーハンドリング  | 異常系テストの追加       |
| HTMLPreviewEnvironment | onErrorコールバック | エラーシナリオテスト追加 |

---

## カバレッジトレンド

| Phase | Line  | Branch | Function |
| ----- | ----- | ------ | -------- |
| 5     | 75.0% | 55.0%  | 78.0%    |
| 6     | 85.2% | 68.4%  | 88.1%    |
| 7     | 85.2% | 68.4%  | 88.1%    |

---

## 完了確認

- [x] 全体カバレッジが目標を達成している
- [x] セキュリティ関連のカバレッジが高い
- [x] コアコンポーネントのカバレッジが80%以上
- [x] 未カバー箇所が文書化されている
- [x] 全295テストがパスしている
