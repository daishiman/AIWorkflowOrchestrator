# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                                             |
| ------ | -------------------------------------------------------------- |
| Phase  | 11                                                             |
| 機能名 | task-ut-rt-01-verify-and-improve-loop-adapter-notification-001 |
| 作成日 | 2026-04-06                                                     |

## 目的

Main プロセス内の変更のみで表示層の変更がないため、`NON_VISUAL` 分類として自動テスト結果を主証跡にする。

## 実行タスク

- Task 11-1: テスト分類判定（VISUAL / NON_VISUAL）
- Task 11-2: NON_VISUAL 判定の記録
- Task 11-3: Phase 12 開始条件確認

## 参照資料

| 資料名                | パス                                                                  | 説明                      |
| --------------------- | --------------------------------------------------------------------- | ------------------------- |
| Phase 10 最終確認結果 | -                                                                     | AC-1〜AC-6 PASS 確認      |
| 対象実装ファイル      | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | Main プロセス内の変更対象 |

## 実行手順

### Step 1: Task 11-1 テスト分類判定

**分類判定基準**:

| 分類       | 条件                                    |
| ---------- | --------------------------------------- |
| VISUAL     | 表示層の変更あり                        |
| NON_VISUAL | Main プロセスのみの変更、表示層変更なし |

**本タスクの判定**: `NON_VISUAL`

**判定根拠**:

- 変更対象は `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` のみ
- `INotificationService.notify()` と `recordImproveFailureSnapshot()` の変更は Main プロセス内で完結する
- 表示層の更新やレイアウト変更はない

### Step 2: Task 11-2 記録

`NON_VISUAL` 判定のため、手動観測ではなく自動テスト結果を主証跡にする。

| 記録項目     | 内容                                        |
| ------------ | ------------------------------------------- |
| 自動テスト名 | T-VL-01〜07、T-REG-01                       |
| テスト件数   | 8件                                         |
| 記録種別     | NON_VISUAL                                  |
| 理由         | Main プロセス内の関数呼び出しのみで完結する |

**テスト実行コマンド**:

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="notification"
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
```

### Step 3: Task 11-3 Phase 12 開始条件確認

- [ ] NON_VISUAL 判定の根拠が明記されている
- [ ] 手動テストチェックリストが作成されている
- [ ] 手動テスト結果が作成されている
- [ ] 発見課題が `outputs/phase-11/discovered-issues.md` に記録されている
- [ ] T-VL-01〜07 + T-REG-01 が全て PASS している

## 統合テスト連携【必須】

| 連携アクション | 内容                     |
| -------------- | ------------------------ |
| 手動統合確認   | 自動テストで代替確認済み |

## 成果物

| 成果物                   | 配置先                                      |
| ------------------------ | ------------------------------------------- |
| NON_VISUAL判定記録       | 本ファイル内（Step 1 に記載）               |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    |
| 発見課題一覧             | `outputs/phase-11/discovered-issues.md`     |

## 完了条件

- [ ] NON_VISUAL 判定の根拠が明記されている
- [ ] 手動テストチェックリストが作成されている
- [ ] 手動テスト結果が作成されている
- [ ] 発見課題一覧が作成されている
- [ ] T-VL-01〜07 + T-REG-01 全て PASS

## タスク100%実行確認【必須】

Phase 11 完了時に以下を確認すること:

- [ ] Task 11-1（テスト分類判定）を完全に実行した
- [ ] Task 11-2（記録）を完全に実行した
- [ ] Task 11-3（Phase 12 開始条件確認）を完全に実行した

## 次Phase

→ [Phase 12: ドキュメント更新](phase-12-documentation.md)

**Phase 11→12 の遷移条件**: NON_VISUAL 判定記録と自動テスト代替記録が完了していること
