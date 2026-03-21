# Phase 7: カバレッジ確認

## メタ情報

| 項目          | 内容                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 7                                                                                                                         |
| 機能名        | チャット向けコンパクトモデルセレクタ共通コンポーネント作成 (TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT)                      |
| 作成日        | 2026-03-21                                                                                                                |
| 担当          | -                                                                                                                         |
| ステータス    | 未着手                                                                                                                    |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-6-test-expansion.md` |

## 目的

プロジェクトのカバレッジ基準（Line: 80%以上、Branch: 60%以上、Function: 80%以上）を `InlineModelSelector.tsx` が満たしているか確認する。基準未達の場合は Phase 6 へ戻りテストを追加する。

## 実行タスク

### タスク1: カバレッジ計測

```bash
# apps/desktop ディレクトリから実行（P40対策）
cd apps/desktop

# 対象ファイルのカバレッジ計測
pnpm vitest run --coverage \
  src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx

# カバレッジサマリーを確認
# カバレッジレポートは coverage/ ディレクトリに出力される
cat coverage/coverage-summary.json | grep -A 10 '"InlineModelSelector"'
```

### タスク2: カバレッジ基準の確認

以下の基準に対して各ファイルのカバレッジを確認する。

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**確認対象ファイル**:

| ファイル                                                           | 確認内容                                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` | 全コンポーネントロジック・条件分岐・イベントハンドラーのカバレッジ |

**P41 注意点**:

Vitest の v8 カバレッジプロバイダーは、インライン arrow function（例: `() => setIsOpen(false)`）を独立した関数としてカウントする。useEffect 内のクリーンアップ関数や条件付きコールバックが実行されない場合、Function Coverage が大幅に低下することがある。T10-5（フォーカス管理テスト）等でクリーンアップ関数の実行を明示的に検証すること。

### タスク3: カバレッジ結果の記録

| ファイル                | Line | Branch | Function | 基準達成 |
| ----------------------- | ---- | ------ | -------- | -------- |
| InlineModelSelector.tsx | -    | -      | -        | -        |

（Phase 7 実行時に記入）

### タスク4: 判定

| 判定                   | 条件                                         | アクション     |
| ---------------------- | -------------------------------------------- | -------------- |
| PASS（Phase 8 へ進む） | `InlineModelSelector.tsx` が最低基準を満たす | Phase 8 へ     |
| FAIL（Phase 6 へ戻る） | `InlineModelSelector.tsx` が最低基準を下回る | Phase 6 へ戻る |

## 参照資料

### コード品質ルール

| 資料名         | パス                               |
| -------------- | ---------------------------------- |
| カバレッジ基準 | `.claude/rules/02-code-quality.md` |

### 前Phase成果物

| 資料名             | パス                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Phase 6 テスト拡充 | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-6-test-expansion.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                 | 対策                                             |
| ---------- | ------------------------------------ | ------------------------------------------------ |
| P40        | テスト実行ディレクトリ依存           | `apps/desktop` から実行する                      |
| P41        | v8カバレッジのインライン関数カウント | useEffect クリーンアップ関数を明示的にテストする |

## 実行手順

1. **タスク1の実施**: カバレッジを計測する
2. **タスク2の実施**: 基準値と比較する
3. **タスク3の実施**: 結果を記録する
4. **タスク4の判定**: PASS/FAIL を決定する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこの Phase で確認・更新する
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと 1 対 1 で突合する

## 成果物

| 成果物                       | パス                                                                                                                | 説明               |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Phase 7 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT/phase-7-coverage.md` | カバレッジ確認結果 |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/01-TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT --phase 7
```

## 完了条件

- [ ] カバレッジ計測コマンドを実行した
- [ ] `InlineModelSelector.tsx` のカバレッジを確認した
- [ ] タスク3の結果テーブルに数値を記入した
- [ ] PASS/FAIL の判定を行った
- [ ] FAIL の場合、Phase 6 へ戻り追加テストを実施した

## 次のPhase

- PASS: Phase 8: リファクタリング（`phase-8-refactoring.md`）
- FAIL: Phase 6: テスト拡充（`phase-6-test-expansion.md`）へ戻る
