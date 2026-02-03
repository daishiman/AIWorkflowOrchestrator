# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 7                                |
| タスク | TASK-9C スキル改善・自動修正機能 |
| 作成日 | 2026-02-03                       |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。

## 実行タスク

- カバレッジ再測定: テストカバレッジの再計測
- ギャップ確認: 未達成項目の特定
- 統合テスト実行: 統合テストの実行と結果確認

## 実行手順

### 1. カバレッジ再測定

```bash
# カバレッジ計測
pnpm --filter @repo/desktop test:coverage

# HTMLレポート確認（ブラウザで開く）
open apps/desktop/coverage/index.html
```

### 2. 統合テスト実行

```bash
# 統合テスト実行
pnpm --filter @repo/desktop test -- --grep "integration"

# IPC統合テスト
pnpm --filter @repo/desktop test -- --grep "IPC"
```

### 3. カバレッジ判定

| モジュール         | Line    | Branch  | Function | 判定 |
| ------------------ | ------- | ------- | -------- | ---- |
| SkillAnalyzer.ts   | \_\_\_% | \_\_\_% | \_\_\_%  |      |
| SkillImprover.ts   | \_\_\_% | \_\_\_% | \_\_\_%  |      |
| PromptOptimizer.ts | \_\_\_% | \_\_\_% | \_\_\_%  |      |
| skillHandlers.ts   | \_\_\_% | \_\_\_% | \_\_\_%  |      |

**基準**:

- Line Coverage: 80%+ (推奨 90%+)
- Branch Coverage: 60%+ (推奨 70%+)
- Function Coverage: 80%+ (推奨 90%+)

### 4. 未達の場合の対応

カバレッジ未達や統合テスト失敗がある場合:

1. 不足箇所を特定
2. Phase 6へ戻ってテスト追加
3. 再度Phase 7を実行

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目               | 基準 | 結果 |
| ---------------------- | ---- | ---- |
| SkillAnalyzer Line     | 80%+ |      |
| SkillAnalyzer Branch   | 60%+ |      |
| SkillImprover Line     | 80%+ |      |
| SkillImprover Branch   | 60%+ |      |
| PromptOptimizer Line   | 80%+ |      |
| PromptOptimizer Branch | 60%+ |      |
| IPC統合テスト          | 100% |      |
| バックアップテスト     | 100% |      |

## カバレッジレポートテンプレート

```markdown
## カバレッジ確認結果

**測定日**: 2026-02-XX
**判定**: [PASS / FAIL]

### サマリー

| モジュール      | Line | Branch | Function | 判定 |
| --------------- | ---- | ------ | -------- | ---- |
| SkillAnalyzer   | 85%  | 72%    | 90%      | PASS |
| SkillImprover   | 82%  | 65%    | 88%      | PASS |
| PromptOptimizer | 88%  | 70%    | 92%      | PASS |
| skillHandlers   | 80%  | 60%    | 85%      | PASS |

### 統合テスト結果

| テストスイート          | PASS | FAIL | SKIP |
| ----------------------- | ---- | ---- | ---- |
| skill:analyze           | 5    | 0    | 0    |
| skill:improve           | 8    | 0    | 0    |
| skill:optimize          | 3    | 0    | 0    |
| skill:optimize:variants | 2    | 0    | 0    |
| skill:optimize:evaluate | 2    | 0    | 0    |

### 未カバー領域（FAIL時のみ）

| ファイル | 行番号 | 理由 | 対応方針 |
| -------- | ------ | ---- | -------- |
|          |        |      |          |
```

## 成果物

| 成果物             | パス                                  | 説明               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | 再測定結果         |
| 統合テスト結果     | `outputs/phase-7/integration-test.md` | 統合テスト実行結果 |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] IPC統合テストが全て成功
- [ ] バックアップ/復元テストが全て成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. カバレッジ再測定
2. 各モジュールのカバレッジ判定
3. 統合テスト実行
4. IPC統合テスト確認
5. バックアップ/復元テスト確認
6. カバレッジレポート作成
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] カバレッジ基準を達成（Line 80%+, Branch 60%+）
- [ ] カバレッジレポートが出力されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-9C-skill-improver --phase 7
```

---

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
