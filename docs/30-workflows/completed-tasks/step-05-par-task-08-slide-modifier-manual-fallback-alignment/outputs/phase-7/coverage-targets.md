# Phase 7: カバレッジ計画

## メタ情報

| 項目     | 内容                                                           |
| -------- | -------------------------------------------------------------- |
| タスクID | TASK-IMP-SLIDE-MODIFIER-MANUAL-FALLBACK-ALIGNMENT-001          |
| Phase    | 7                                                              |
| 作成日   | 2026-03-23                                                     |
| 前提     | Phase 6 regression-expansion-plan.md（テスト数見積もり：57件） |

## 1. カバレッジ基準（プロジェクト標準準拠）

02-code-quality.md のカバレッジ基準をベースに本タスクの目標を設定する:

| 指標              | プロジェクト最低基準 | プロジェクト推奨基準 | 本タスク目標 |
| ----------------- | -------------------- | -------------------- | ------------ |
| Line Coverage     | 80%                  | 90%                  | 90%          |
| Branch Coverage   | 60%                  | 70%                  | 80%          |
| Function Coverage | 80%                  | 90%                  | 90%          |

本タスク目標が推奨基準を上回る（Branch）理由:

- 禁止遷移4パターン（V-08）と fallback 3経路（FB-T01〜T03）が Branch を大量に生成する
- P62 対策の apiKeySource 分岐は全て Branch として計上される
- 80% は推奨値 70% を10pt超えるが、安全性に直結する分岐のため高い基準を設定

## 2. ファイル別カバレッジ目標

### 2.1 新規作成ファイル（100% 目標）

新規作成ファイルはテストファーストで実装するため、Line/Function 100% を目標とする。

| ファイル                                                         | Line | Branch | Function |
| ---------------------------------------------------------------- | ---- | ------ | -------- |
| `packages/shared/src/slide/types.ts`（型定義のみ）               | N/A  | N/A    | N/A      |
| `apps/desktop/src/main/handlers/slide-capability-handlers.ts`    | 100% | 90%    | 100%     |
| `apps/desktop/src/main/services/slide-status-reducer.ts`（想定） | 100% | 95%    | 100%     |

注: 型定義ファイル（.ts で型のみ）はカバレッジ計測対象外。

### 2.2 既存変更ファイル（修正箇所のみ）

修正箇所のカバレッジを重点計測する（ファイル全体ではなく差分行）:

| ファイル                                           | 差分 Line | 差分 Branch | 差分 Function |
| -------------------------------------------------- | --------- | ----------- | ------------- |
| `apps/desktop/src/main/services/modifier-skill.ts` | 100%      | 100%        | 100%          |
| `apps/desktop/src/main/services/skill-executor.ts` | 90%       | 80%         | 90%           |
| `apps/desktop/src/main/handlers/slide-handlers.ts` | 100%      | 90%         | 100%          |

### 2.3 除外するファイル

| ファイル                                                  | 除外理由                              |
| --------------------------------------------------------- | ------------------------------------- |
| `apps/desktop/src/renderer/components/SlideWorkspace.tsx` | UI テストは UT-SLIDE-UI-001 で計測    |
| `apps/desktop/src/renderer/store/slideSettingsStore.ts`   | Store テストは UT-SLIDE-UI-001 で計測 |
| `apps/desktop/src/preload/ipc-channels.ts`                | 定数ファイル（実行可能コードなし）    |

## 3. テストスイート別カバレッジ寄与

### 3.1 unit テスト（V-07, V-08, V-11）の寄与

| テストファイル                      | 計測対象                       | 期待寄与    |
| ----------------------------------- | ------------------------------ | ----------- |
| `slide-status-reducer.unit.test.ts` | SlideUIStatus Reducer の全分岐 | Branch 95%+ |
| `manual-boundary.unit.test.ts`      | skill-executor.ts の lane 分岐 | Branch 80%+ |

unit テストは純粋関数のため、Branch Coverage が高くなりやすい。
V-08 の不正遷移4パターンが Branch Coverage を底上げする。

### 3.2 contract テスト（V-09）の寄与

| テストファイル                                | 計測対象                           | 期待寄与  |
| --------------------------------------------- | ---------------------------------- | --------- |
| `modifier-response-contract.contract.test.ts` | modifier-skill.ts の拡張フィールド | Line 100% |

optional フィールドの有無による分岐（undefined チェック）を全てカバー。

### 3.3 integration テスト（V-10）の寄与

| テストファイル                             | 計測対象                          | 期待寄与  |
| ------------------------------------------ | --------------------------------- | --------- |
| `slide-capability-ipc.integration.test.ts` | slide-capability-handlers.ts 全体 | Line 90%+ |

IPC handler の3レイヤー（Main → Preload → Renderer）を通じた End-to-End パスをカバー。

### 3.4 Phase 6 拡充テストの寄与

| 拡充観点         | 追加 Branch カバレッジ見込み |
| ---------------- | ---------------------------- |
| edge（EV07〜）   | +5% （自己遷移・フル遷移）   |
| edge（EV10〜）   | +3% （DTO 型ガード）         |
| error（ERR〜）   | +8% （エラーパス分岐）       |
| fallback（FB〜） | +7%（fallback 経路全パス）   |

## 4. シナリオカバレッジ

自動化テストのコードカバレッジとは別に、以下のシナリオが全て通過することを確認する:

### 4.1 正常シナリオ（Green Path）

| シナリオ ID | シナリオ名                    | 通過するテスト TC-ID              |
| ----------- | ----------------------------- | --------------------------------- |
| SC-01       | integrated lane で slide 同期 | V07-T01, V07-T02, V10-T01         |
| SC-02       | manual lane で手動復旧        | V07-T05, V07-T07, V11-T01, FB-T05 |
| SC-03       | safeStorage から API key 取得 | V10-T03, ERR-T09                  |

### 4.2 異常シナリオ（Red Path）

| シナリオ ID | シナリオ名                     | 通過するテスト TC-ID       |
| ----------- | ------------------------------ | -------------------------- |
| SC-11       | SDK タイムアウト → degraded    | ERR-T01, V08-T04           |
| SC-12       | API key なし → capability=none | V10-T05, ERR-T08, BC-AK-01 |
| SC-13       | env fallback → 警告ログ        | V10-T04, ERR-T07, FB-T01   |

### 4.3 ManualBoundary シナリオ

| シナリオ ID | シナリオ名                      | 通過するテスト TC-ID |
| ----------- | ------------------------------- | -------------------- |
| SC-21       | manual lane で auto-send しない | V11-T01              |
| SC-22       | degraded で silent retry しない | V11-T03, ERR-T01     |
| SC-23       | hidden injection が発生しない   | V11-T02, EV11-T03    |

## 5. カバレッジ計測コマンド（実装タスク向け）

実装タスク（UT-SLIDE-IMPL-001）での計測コマンド:

```bash
# unit + contract テストのカバレッジ
cd apps/desktop && pnpm vitest run \
  src/main/services/__tests__/slide-status-reducer.unit.test.ts \
  src/main/services/__tests__/manual-boundary.unit.test.ts \
  src/main/services/__tests__/modifier-response-contract.contract.test.ts \
  --coverage \
  --coverage.include="src/main/services/slide-status-reducer.ts" \
  --coverage.include="src/main/services/skill-executor.ts" \
  --coverage.include="src/main/services/modifier-skill.ts"

# integration テストのカバレッジ
cd apps/desktop && pnpm vitest run \
  src/__tests__/slide-capability-ipc.integration.test.ts \
  --coverage \
  --coverage.include="src/main/handlers/slide-capability-handlers.ts"

# 全体カバレッジ（P40 対策: apps/desktop/ ディレクトリから実行）
cd apps/desktop && pnpm vitest run --coverage
```

## 6. カバレッジ未達時の対処手順

Phase 7 で目標未達の場合:

| 未達指標       | 対処先                                     | 優先度 |
| -------------- | ------------------------------------------ | ------ |
| Line < 90%     | Phase 6 へ戻り、未カバー行のテストを追加   | P0     |
| Branch < 80%   | Phase 6 へ戻り、未カバー分岐のテストを追加 | P0     |
| Function < 90% | Phase 6 へ戻り、未テスト関数のテストを追加 | P0     |

未達の場合は以下のコマンドで未カバー箇所を特定する:

```bash
# カバレッジレポートの確認（HTML形式）
cd apps/desktop && pnpm vitest run --coverage --coverage.reporter=html
open coverage/index.html

# 未カバー行の確認（lcov形式）
grep "DA:" coverage/lcov.info | grep ",0$" | head -20
```

## 7. カバレッジ確認チェックリスト

Phase 7 完了時に以下を全て確認する:

- [ ] Line Coverage が 90% 以上
- [ ] Branch Coverage が 80% 以上（推奨 70% を超えている）
- [ ] Function Coverage が 90% 以上
- [ ] シナリオカバレッジ SC-01〜SC-23 が全て通過
- [ ] Phase 6 の edge/error/fallback テスト（28件）が全件 PASS
- [ ] Phase 4 の基本テスト（29件）が全件 PASS
- [ ] カバレッジレポートで残存する未カバー行の理由が説明可能
- [ ] `pnpm typecheck` が PASS（型安全が保たれている）
