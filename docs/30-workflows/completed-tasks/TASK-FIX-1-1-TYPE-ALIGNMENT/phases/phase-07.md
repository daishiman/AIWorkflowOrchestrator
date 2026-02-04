# Phase 7: テストカバレッジ確認

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 7                           |
| 機能名 | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日 | 2026-02-04                  |

## 目的

Phase 6で拡充したテスト結果を検証し、カバレッジ基準を満たすことを確認する。

## 実行手順

### 1. カバレッジ再測定

```bash
pnpm test:coverage
```

### 2. 型定義ファイルのカバレッジ確認

```bash
# 対象ファイル
# packages/shared/src/types/skill.ts
# packages/shared/src/types/__tests__/skill.test.ts
```

### 3. 未達の場合の対応

カバレッジ未達や統合テスト失敗がある場合、Phase 6へ戻って拡充する。

## 参照資料

| 資料名               | パス                                                                        | 説明                   |
| -------------------- | --------------------------------------------------------------------------- | ---------------------- |
| Phase 6成果物        | `outputs/phase-6/coverage-report.md`                                        | カバレッジレポート     |
| quality-requirements | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略・カバレッジ |

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目                 | 基準 | 結果  |
| ------------------------ | ---- | ----- |
| ユニットテストLine       | 80%+ | ☐ TBD |
| ユニットテストBranch     | 60%+ | ☐ TBD |
| ユニットテストFunction   | 80%+ | ☐ TBD |
| 型定義ファイルカバレッジ | 90%+ | ☐ TBD |
| IPC型整合性テスト        | PASS | ☐ TBD |
| Store型整合性テスト      | PASS | ☐ TBD |

## 成果物

| 成果物             | パス                                 | 説明       |
| ------------------ | ------------------------------------ | ---------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | 再測定結果 |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 型定義ファイルのカバレッジが90%以上
- [ ] 全テストがPASS
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）
