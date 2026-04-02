# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 11                                         |
| 機能名 | ut-safety-gov-disclosure-runtime-injection |
| 作成日 | 2026-04-02                                 |

## 目的

ExecutionConsole disclosure の runtime 注入が実装どおりに機能するかを確認する。
本 workflow は Main IPC の変更のみで新規 renderer surface を追加しないため、
Phase 11 は non-visual evidence を正本として実施する。

## 実行タスク

- タスク1: 手動テストシナリオ設計
- タスク2: subscription / api-key / fallback の値確認
- タスク3: sender 検証・例外処理の確認
- タスク4: 手動テスト結果レポート作成

## 実行手順

### ステップ1: 手動テストシナリオ設計

| TC       | テストシナリオ                    | 期待結果                            |
| -------- | --------------------------------- | ----------------------------------- |
| NV-11-01 | subscription 相当の runtime state | `Claude Code CLI`                   |
| NV-11-02 | api-key 相当の runtime state      | `Anthropic API`                     |
| NV-11-03 | fallback                          | `unknown`                           |
| NV-11-04 | 不正 sender / 例外                | `UNAUTHORIZED` / `DISCLOSURE_ERROR` |

### ステップ2: 値確認

```bash
# disclosure handler 単体確認
pnpm --filter @repo/desktop test -- --run apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts
```

### ステップ3: 手動テスト結果レポート作成

テスト結果を `outputs/phase-11/manual-test-result.md` に記録する。

記録内容:

- 各 TC の結果（PASS / FAIL）
- 期待値と実際の表示値
- 発見した問題点（スコープ外の問題は `outputs/phase-11/discovered-issues.md` に記録）

## 参照資料

| 資料名                          | パス                                                             | 説明                       |
| ------------------------------- | ---------------------------------------------------------------- | -------------------------- |
| Phase 2 設計書                  | `phase-2-design.md`                                              | aiServiceName 期待値の設計 |
| ExecutionConsole コンポーネント | `apps/desktop/src/renderer/components/`                          | disclosure 表示の参照元    |
| テストファイル                  | `apps/desktop/src/main/ipc/__tests__/disclosureHandlers.test.ts` | 自動テストとの対比参照     |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果   |
| ---------------------- | ---- | ------ |
| ユニットテストLine     | 80%+ | 未計測 |
| ユニットテストBranch   | 60%+ | 未計測 |
| ユニットテストFunction | 80%+ | 未計測 |
| 手動テスト TC-01       | PASS | -      |
| 手動テスト TC-02       | PASS | -      |
| 手動テスト TC-03       | PASS | -      |

## 成果物

| 成果物                 | パス                                     | 説明                          |
| ---------------------- | ---------------------------------------- | ----------------------------- |
| 手動テスト結果レポート | `outputs/phase-11/manual-test-result.md` | 各 TC の PASS/FAIL 記録       |
| 発見事項レポート       | `outputs/phase-11/discovered-issues.md`  | スコープ外問題（0件でも出力） |

## 完了条件

- [ ] NV-11-01〜NV-11-04 が PASS している
- [ ] 手動テスト結果レポートが作成されている
- [ ] 発見事項レポートが出力されている（0件でも出力）
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

| タスク                     | 状態 | 備考 |
| -------------------------- | ---- | ---- |
| 手動テストシナリオ設計     | -    | -    |
| runtime 値確認             | -    | -    |
| sender / 例外確認          | -    | -    |
| 手動テスト結果レポート作成 | -    | -    |
| 発見事項レポート作成       | -    | -    |

## 次のPhase

Phase 12: ドキュメント更新 → [phase-12-documentation.md](phase-12-documentation.md)

**ゲート**: 手動テスト TC-01 / TC-02 が PASS 後にのみ Phase 12 へ進む。
