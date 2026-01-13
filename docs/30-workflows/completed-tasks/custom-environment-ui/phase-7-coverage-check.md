# Phase 7: カバレッジ確認

## メタ情報

| 項目   | 値                    |
| ------ | --------------------- |
| Phase  | 7                     |
| 機能名 | custom-environment-ui |
| 作成日 | 2026-01-13            |

## 目的

テストカバレッジを確認し、目標に達していない場合は追加テストを作成する。

## 実行タスク

- カバレッジ計測: Vitestでカバレッジレポート生成
- ギャップ分析: カバレッジ不足箇所の特定
- 追加テスト作成: 不足箇所に対するテスト追加

## 参照資料

| 資料名     | パス                                 | 説明         |
| ---------- | ------------------------------------ | ------------ |
| Phase 6    | `outputs/phase-6/coverage-report.md` | 拡充後の結果 |
| テスト計画 | `outputs/phase-4/test-plan.md`       | テスト戦略   |

### システム仕様（aiworkflow-requirements）

> カバレッジ確認時に以下のシステム仕様を参照してください。

| 参照資料             | パス                                                                     | 内容               |
| -------------------- | ------------------------------------------------------------------------ | ------------------ |
| テストカバレッジ戦略 | `.claude/skills/aiworkflow-requirements/references/test-msw-coverage.md` | カバレッジ目標基準 |

---

## カバレッジ目標

| メトリクス     | 目標値 |
| -------------- | ------ |
| 行カバレッジ   | 80%    |
| 分岐カバレッジ | 60%    |
| 関数カバレッジ | 80%    |

---

## カバレッジ計測手順

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test:coverage

# HTMLレポート確認
open apps/desktop/coverage/index.html
```

---

## 対象ファイル別目標

| ファイル                                                                     | 行   | 分岐 | 関数 |
| ---------------------------------------------------------------------------- | ---- | ---- | ---- |
| `packages/shared/src/types/agent.ts`                                         | 100% | N/A  | N/A  |
| `apps/desktop/src/renderer/utils/sanitize.ts`                                | 90%  | 80%  | 100% |
| `apps/desktop/src/renderer/store/slices/agentSlice.ts`                       | 80%  | 60%  | 80%  |
| `apps/desktop/src/renderer/components/organisms/SplitLayout/`                | 80%  | 60%  | 80%  |
| `apps/desktop/src/renderer/components/organisms/HTMLPreviewEnvironment/`     | 85%  | 70%  | 80%  |
| `apps/desktop/src/renderer/components/organisms/MarkdownPreviewEnvironment/` | 80%  | 60%  | 80%  |
| `apps/desktop/src/renderer/components/molecules/EnvironmentSelector/`        | 80%  | 60%  | 80%  |
| `apps/desktop/src/renderer/components/organisms/ExecutionEnvironment/`       | 80%  | 60%  | 80%  |

---

## カバレッジギャップ対応

### ギャップが見つかった場合

1. カバレッジレポートで未カバー行を特定
2. 該当箇所のテストケースを追加
3. 再度カバレッジを計測
4. 目標達成まで繰り返す

### 優先度

| 優先度 | 対象                                  |
| ------ | ------------------------------------- |
| 高     | セキュリティ関連（sanitize、sandbox） |
| 高     | 状態管理（agentSlice）                |
| 中     | UIコンポーネント                      |
| 中     | ユーティリティ関数                    |

---

## 統合テスト連携【必須】

統合ポイントのカバレッジを確認する:

| 統合ポイント           | カバレッジ確認事項                    |
| ---------------------- | ------------------------------------- |
| agentSlice拡張         | 全アクションがテストされている        |
| SplitLayout↔親         | Props経由の状態更新がカバーされている |
| ExecutionEnvironment   | 全環境タイプの分岐がカバーされている  |
| HTMLPreviewEnvironment | sandbox/CSP適用パスがカバーされている |

---

## 成果物

| 成果物             | パス                                   | 説明           |
| ------------------ | -------------------------------------- | -------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.html` | HTMLレポート   |
| ギャップ分析       | `outputs/phase-7/gap-analysis.md`      | 不足箇所一覧   |
| 追加テストリスト   | `outputs/phase-7/additional-tests.md`  | 追加したテスト |

---

## 完了条件

- [ ] カバレッジレポートが生成されている
- [ ] 行カバレッジが80%以上
- [ ] 分岐カバレッジが60%以上
- [ ] 関数カバレッジが80%以上
- [ ] ギャップ分析が完了している
- [ ] 統合ポイントのカバレッジが確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. カバレッジ計測の実行
2. カバレッジレポートの確認
3. ギャップ分析（不足箇所の特定）
4. 追加テストの作成（必要な場合）
5. 再計測（目標達成まで）
6. 統合ポイントのカバレッジ確認
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# カバレッジ計測
pnpm --filter @repo/desktop test:coverage

# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/custom-environment-ui --phase 7
```

## 次のPhase

Phase 8: リファクタリング
