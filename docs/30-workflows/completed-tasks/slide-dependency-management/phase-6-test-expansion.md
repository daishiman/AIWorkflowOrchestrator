# Phase 6: テスト拡充 - スライド依存関係管理システム

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 6                                         |
| タスクID   | task-feat-slide-dependency-management-003 |
| 名称       | テスト拡充                                |
| ステータス | 未実施                                    |
| 依存Phase  | Phase 5                                   |

---

## 目的

追加テストによりカバレッジ目標を達成し、統合テストを拡充する。

---

## 使用スキル

| スキル名          | パス                                        | 選定理由                              |
| ----------------- | ------------------------------------------- | ------------------------------------- |
| test-coverage     | `.claude/skills/test-coverage/SKILL.md`     | カバレッジ分析（Trigger: カバレッジ） |
| edge-case-testing | `.claude/skills/edge-case-testing/SKILL.md` | エッジケーステスト（Trigger: 境界値） |

**実行方法**: 各スキルのSKILL.mdを読み込み、スキルを参照して実行

---

## 統合テスト連携【必須】

### Phase 6での統合テスト連携アクション

統合テストの拡充（全カテゴリのカバレッジ向上）を行う。

**拡充対象**:

| カテゴリ           | 現状 | 目標 | 追加テスト                               |
| ------------------ | ---- | ---- | ---------------------------------------- |
| IPC通信            | -    | 100% | エラーケース、タイムアウト、競合         |
| データフロー       | -    | 100% | 複数変更の連続、大量データ               |
| エラーハンドリング | -    | 80%+ | ネットワークエラー、ファイルアクセス失敗 |
| 状態同期           | -    | 100% | 競合状態、ロールバック                   |

---

## 実行手順

### Step 1: カバレッジ分析

```bash
# カバレッジレポート生成
pnpm --filter @repo/shared test:coverage
pnpm --filter @repo/desktop test:coverage

# カバレッジギャップの特定
# - Line Coverage < 80%の箇所
# - Branch Coverage < 60%の箇所
# - Function Coverage < 80%の箇所
```

### Step 2: 追加ユニットテスト

#### エッジケーステスト

```typescript
// file-watcher.edge-cases.test.ts
describe("SlideWatcher Edge Cases", () => {
  it("should handle file deletion during watching", async () => {
    // ファイル削除時の動作
  });

  it("should handle rapid successive changes", async () => {
    // 連続した高速変更
  });

  it("should handle very large files", async () => {
    // 大容量ファイルの処理
  });

  it("should handle special characters in path", async () => {
    // パス内の特殊文字
  });

  it("should handle network drive paths", async () => {
    // ネットワークドライブパス
  });
});

// skill-executor.edge-cases.test.ts
describe("SkillExecutor Edge Cases", () => {
  it("should handle timeout during skill execution", async () => {
    // タイムアウト処理
  });

  it("should handle concurrent skill executions", async () => {
    // 同時実行の排他制御
  });

  it("should handle skill crash recovery", async () => {
    // クラッシュからの復旧
  });
});
```

### Step 3: 統合テスト拡充

```typescript
// slide-integration-extended.test.ts
describe("Extended Integration Tests", () => {
  describe("IPC通信の拡充", () => {
    it("should handle IPC timeout gracefully", async () => {
      // IPCタイムアウト
    });

    it("should queue concurrent IPC calls", async () => {
      // 同時IPCコールのキュー処理
    });

    it("should handle IPC disconnect and reconnect", async () => {
      // 切断と再接続
    });
  });

  describe("データフローの拡充", () => {
    it("should handle rapid file changes without data loss", async () => {
      // 高速連続変更でのデータ整合性
    });

    it("should maintain consistency during skill execution", async () => {
      // スキル実行中の整合性
    });
  });

  describe("エラーハンドリングの拡充", () => {
    it("should display user-friendly error messages", async () => {
      // ユーザーフレンドリーなエラー表示
    });

    it("should log errors for debugging", async () => {
      // デバッグ用ログ出力
    });

    it("should recover from transient failures", async () => {
      // 一時的障害からの回復
    });
  });

  describe("状態同期の拡充", () => {
    it("should handle state conflicts", async () => {
      // 状態競合の処理
    });

    it("should rollback on sync failure", async () => {
      // 同期失敗時のロールバック
    });
  });
});
```

### Step 4: UIコンポーネントテスト拡充

```typescript
// SlideWorkspace.extended.test.tsx
describe("SlideWorkspace Extended Tests", () => {
  it("should show loading state during project open", () => {
    // プロジェクトオープン中のローディング表示
  });

  it("should handle keyboard shortcuts", () => {
    // キーボードショートカット
  });

  it("should be accessible with screen readers", () => {
    // スクリーンリーダー対応
  });

  it("should handle window resize", () => {
    // ウィンドウリサイズ対応
  });
});
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 使用スキルの実行（各スキルごとに1タスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## 成果物

| 成果物             | パス                                            | 説明                 | 必須 |
| ------------------ | ----------------------------------------------- | -------------------- | ---- |
| カバレッジレポート | `outputs/phase-6/coverage-report.md`            | カバレッジ分析結果   | ✅   |
| 統合テスト結果     | `outputs/phase-6/integration-test.md`           | 統合テスト実行結果   | ✅   |
| 追加テストコード   | `packages/*/src/**/*.test.ts`（プロジェクト内） | 追加したテストコード | ✅   |

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> テスト拡充時に必ず以下のシステム仕様を確認し、テスト観点に反映してください。

| 参照資料             | パス                                                                     | 内容                    |
| -------------------- | ------------------------------------------------------------------------ | ----------------------- |
| Electron IPC設計     | `.claude/skills/aiworkflow-requirements/references/electron-ipc-spec.md` | IPC通信仕様             |
| Agent SDK統合        | `.claude/skills/aiworkflow-requirements/references/agent-sdk-spec.md`    | Agent SDK統合仕様       |
| 状態管理ガイドライン | `.claude/skills/aiworkflow-requirements/references/state-management.md`  | Zustand使用ガイドライン |

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-dependency-management --phase 6

# Phase完了・成果物登録
node .claude/skills/task-specification-creator/scripts/complete-phase.mjs \
  --workflow docs/30-workflows/slide-dependency-management --phase 6 --artifacts "coverage-report.md,integration-test.md"
```

---

## 完了条件チェックリスト

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成
- [ ] 統合テストの追加が完了している
- [ ] フロントエンド・バックエンド接続テストが成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## スキルフィードバック記録

| スキル            | 結果    | 備考 |
| ----------------- | ------- | ---- |
| test-coverage     | pending | -    |
| edge-case-testing | pending | -    |

---

## 前後Phase

- 前: [Phase 5: 実装](phase-5-implementation.md)
- 次: [Phase 7: カバレッジ確認](phase-7-coverage-check.md)
