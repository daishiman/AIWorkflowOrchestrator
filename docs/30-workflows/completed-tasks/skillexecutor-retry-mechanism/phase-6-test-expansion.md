# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 6                               |
| Phase名   | テスト拡充                      |
| カテゴリ  | 品質                            |
| 機能名    | skillexecutor-retry-mechanism   |
| 作成日    | 2026-01-30                      |
| 前提Phase | Phase 5（実装）                 |
| 後続Phase | Phase 7（テストカバレッジ確認） |

## 目的

Phase 4-5で作成した基本テストに加え、エッジケース・境界値・並行実行・abort連携のテストを追加し、テストの網羅性を高める。

---

## 実行タスク

### Task 1: エッジケーステスト追加

**目的**: 境界値やエッジケースのテストを追加する。

**手順**:

1. `SkillExecutor.retry.test.ts`に以下のテストケースを追加する:
   - maxRetries=0 → リトライなしで即座にエラー
   - maxRetries=1 → 1回のみリトライ
   - baseDelayMs=0 → 待機なしでリトライ
   - maxDelayMs=baseDelayMs → キャップが効くこと
   - jitterFactor=0 → Jitterなし（決定論的delay）
   - jitterFactor=1 → 最大Jitter（0 - 2倍の範囲）
   - Retry-Afterが非常に大きい値（86400秒） → maxDelayMsでキャップされるか確認
   - Retry-Afterが0または負の値 → baseDelayMsにフォールバック
   - エラーオブジェクトがnull/undefined → `{ retryable: false }`
   - エラーオブジェクトが文字列 → `{ retryable: false }`

**期待される成果物**:

- エッジケーステスト（10ケース追加）

### Task 2: 並行リトライテスト追加

**目的**: 複数のスキル実行が同時にリトライする場合の動作を検証する。

**手順**:

1. 以下のテストケースを追加する:
   - 2つの実行が同時にリトライ → 各実行が独立してリトライする
   - 1つがリトライ中に別の実行が開始 → 互いに干渉しない
   - MAX_CONCURRENT_EXECUTIONS(5)での同時リトライ → 全実行が正しくリトライ
   - リトライ中に新規実行がMAX_CONCURRENTに達した場合 → MAX_CONCURRENT_EXCEEDED
   - 1つの実行がリトライ成功、他が失敗 → 各実行が独立して終了

**期待される成果物**:

- 並行リトライテスト（5ケース追加）

### Task 3: abort連携テスト追加

**目的**: abort()呼び出し時のリトライ動作を詳細に検証する。

**手順**:

1. 以下のテストケースを追加する:
   - リトライ待機（sleep）中にabort() → sleepが中断しAbortErrorが返る
   - リトライ開始直前にabort() → リトライせずにAbortErrorが返る
   - query()実行中にabort() → query()が中断しリトライしない
   - abort()後にリトライイベントが送信されない
   - abort()後にexecutionStatusが'aborted'になる

**期待される成果物**:

- abort連携テスト（5ケース追加）

### Task 4: ストリーミングイベント詳細テスト追加

**目的**: retryストリーミングイベントの内容を詳細に検証する。

**手順**:

1. 以下のテストケースを追加する:
   - retryイベントのtypeが'retry'であること
   - retryイベントのattemptが0始まりで1ずつ増加すること
   - retryイベントのdelayMsが計算値と一致すること（Jitter考慮）
   - retryイベントのerrorTypeがエラー種別と一致すること
   - リトライ成功後にcompleteイベントが正しく送信されること
   - リトライ最終失敗後にerrorイベントが正しく送信されること

**期待される成果物**:

- ストリーミングイベント詳細テスト（6ケース追加）

---

## 参照資料

| 参照資料       | パス                                                                               | 用途           |
| -------------- | ---------------------------------------------------------------------------------- | -------------- |
| Phase 4テスト  | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts`       | 既存テスト参照 |
| Phase 5成果物  | `docs/30-workflows/skillexecutor-retry-mechanism/outputs/phase-5/`                 | テスト結果参照 |
| 既存統合テスト | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.integration.test.ts` | パターン参考   |

---

## 統合テスト連携

abort連携、並行実行との統合テストを追加:

- 複数実行リトライ時のIPC通信の独立性
- abort()時のリソースクリーンアップの完全性

---

## 成果物

| 成果物             | パス                                                                         | 種別 |
| ------------------ | ---------------------------------------------------------------------------- | ---- |
| 拡充テストファイル | `apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts` | test |

---

## 完了条件

- [ ] エッジケーステスト: 10ケース追加
- [ ] 並行リトライテスト: 5ケース追加
- [ ] abort連携テスト: 5ケース追加
- [ ] ストリーミングイベント詳細テスト: 6ケース追加
- [ ] 合計26ケース以上の新規テストが追加されている
- [ ] Phase 4のテストと合わせて67ケース以上
- [ ] 全テストがGreen（パス）である
- [ ] 本Phase内の全タスク（Task 1-4）を100%実行完了

---

## Phase完了時必須アクション

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skillexecutor-retry-mechanism \
  --phase 6 \
  --artifacts "apps/desktop/src/main/services/skill/__tests__/SkillExecutor.retry.test.ts:テスト拡充"
```

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skillexecutor-retry-mechanism --phase 6
```

---

## Phase実行記録

| 項目              | 内容 |
| ----------------- | ---- |
| 実行タスク        |      |
| 発見事項          |      |
| 次Phaseへの引継ぎ |      |

---

## 次のPhase

→ [Phase 7: テストカバレッジ確認](./phase-7-coverage-check.md)
