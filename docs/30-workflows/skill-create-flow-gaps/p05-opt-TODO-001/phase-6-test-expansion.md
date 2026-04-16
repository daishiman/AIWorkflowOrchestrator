# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 6                                    |
| タスクID   | TASK-SW-TODO-001                     |
| 機能名     | conversation-round-step-todo-cleanup |
| 前提Phase  | Phase 5                              |
| 後続Phase  | Phase 7                              |
| 作成日     | 2026-04-15                           |
| ステータス | 未実施                               |

## 目的

Phase 5 の実装（TODOコメント整理）完了後、回帰リスクがないことを追加の観点から確認する。コメント変更のみのため新規ユニットテストは不要だが、関連ファイルへの副作用がないことを網羅的に検証する。

## 実行タスク

- 関連ファイルへの副作用確認（grep による全件検索）
- `shouldShowMainToolBadge` の動作が変化していないことの確認
- `resolveExternalIntegration` との関連整合確認
- 既存テストの全件実行による回帰確認
- 回帰確認レポートの作成

## 参照資料

| 資料名                    | パス                                                                                         | 用途             |
| ------------------------- | -------------------------------------------------------------------------------------------- | ---------------- |
| Phase 5 成果物            | `outputs/phase-5/implementation-summary.md`                                                  | 変更内容確認     |
| ConversationRoundStep.tsx | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                | 変更後コード確認 |
| 既存テスト                | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | 回帰テスト       |

## 実行手順

### 1. 関連コードへの副作用確認

```bash
# shouldShowMainToolBadge の全参照箇所を確認
grep -rn "shouldShowMainToolBadge" apps/ packages/

# isMainTool の全参照箇所を確認
grep -rn "isMainTool" apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx

# MAIN_TOOL_BADGE_ENABLED の全参照箇所を確認（パターンA でフラグ削除した場合）
grep -rn "MAIN_TOOL_BADGE_ENABLED" apps/ packages/

# 旧 TODOコメントが完全に除去されているか確認
grep -rn "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001" apps/ packages/ docs/30-workflows/
```

### 2. `resolveExternalIntegration` との関連整合確認

```bash
# resolveExternalIntegration の現行実装を確認
grep -n -A 5 "resolveExternalIntegration\|selectedOptions\[0\]" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx | head -30
```

確認観点：

- `resolveExternalIntegration` が依然として `selectedOptions[0]` を主ツールとして参照していること
- `shouldShowMainToolBadge` の `selectedOptions[0] === optionValue` という条件と一致していること
- パターンAを採用した場合、バッジの表示が変化していないこと

### 3. 既存テスト全件実行による回帰確認

```bash
# ConversationRoundStep 関連テストの全件実行
pnpm --filter @repo/desktop exec vitest run \
  src/renderer/components/skill/wizard/__tests__/

# desktop パッケージの全テスト（必要に応じて）
pnpm --filter @repo/desktop exec vitest run
```

### 4. 検証チェックリスト

| 検証項目                                                                              | 期待結果               | 結果 |
| ------------------------------------------------------------------------------------- | ---------------------- | ---- |
| `shouldShowMainToolBadge` の参照が `ConversationRoundStep.tsx` 内のみか               | 他ファイルへの参照なし | -    |
| パターンA: `MAIN_TOOL_BADGE_ENABLED` の参照が除去されているか                         | 0件                    | -    |
| パターンB: 新コメントが正確に記述されているか                                         | 内容の目視確認         | -    |
| 旧 TODOコメント（`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001`）が全ファイルで0件か      | 0件                    | -    |
| `resolveExternalIntegration` が `selectedOptions[0]` を主ツールとして参照していること | 変更なし               | -    |
| 既存テストが全 PASS                                                                   | PASS                   | -    |

## 統合テスト連携【必須】

| 判定項目               | 基準 | 結果 |
| ---------------------- | ---- | ---- |
| 副作用なし（grep確認） | 0件  | -    |
| 既存テスト全 PASS      | PASS | -    |

## 多角的チェック観点

| 観点     | 確認内容                                                                         |
| -------- | -------------------------------------------------------------------------------- |
| 矛盾     | バッジ表示ロジックと `resolveExternalIntegration` の主ツール参照が一致しているか |
| 漏れ     | 旧 TODOコメントの残留がないか（全ファイル grep で確認）                          |
| 整合性   | パターンA でフラグ削除した場合、削除箇所に参照漏れがないか                       |
| 依存関係 | 他の skill-create-flow-gaps タスクとの独立性が保たれているか                     |

## 成果物

| 成果物           | パス                                   | 説明                           |
| ---------------- | -------------------------------------- | ------------------------------ |
| 回帰確認レポート | `outputs/phase-6/regression-report.md` | 副作用確認結果・テスト実行結果 |

## 完了条件

- [ ] 関連ファイルへの副作用確認（grep 全件）が完了
- [ ] `shouldShowMainToolBadge` の参照が `ConversationRoundStep.tsx` 内のみであること確認
- [ ] 旧 TODOコメントの残留が全ファイルで0件であること確認
- [ ] `resolveExternalIntegration` との関連整合確認が完了
- [ ] 既存テストが全 PASS
- [ ] 回帰確認レポートが作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 関連コードへの副作用確認（grep 全件）
2. `resolveExternalIntegration` との関連整合確認
3. 既存テスト全件実行
4. 検証チェックリストの記録
5. 回帰確認レポートの作成

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 7: カバレッジ確認
