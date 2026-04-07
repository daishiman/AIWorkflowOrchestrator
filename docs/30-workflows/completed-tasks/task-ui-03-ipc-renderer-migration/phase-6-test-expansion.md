# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 6                                 |
| Phase名    | テスト拡充                        |
| 機能名     | task-ui-03-ipc-renderer-migration |
| 前提Phase  | Phase 5: 実装                     |
| 次Phase    | Phase 7: カバレッジ確認           |
| ステータス | pending                           |
| 作成日     | 2026-04-07                        |

## 目的

移行後の各コンポーネントに対してエッジケース・エラーケースのテストを追加し、IPC経路移行の堅牢性を高める。

## 実行タスク

### Task 1: エッジケーステスト追加

**ImprovementProposalPanel** の境界条件:

- `skillCreatorAPI.applyRuntimeImprovement` が reject した場合のエラーハンドリング
- API未応答時のUI状態（ローディング中）

**GovernanceSummaryPanel** の境界条件:

- `skillCreatorAPI.getGovernanceState` が undefined を返した場合
- API呼び出しが失敗した場合の表示

### Task 2: リグレッションテスト

変更した2コンポーネントの既存機能が維持されていることを確認:

```bash
pnpm --filter @repo/desktop test -- --run --reporter=verbose
```

### Task 3: チャネル命名規則ガイドライン（成果物作成）

`outputs/phase-6/channel-naming-guide.md` に命名規則を文書化する:

- 現在の `skill-creator:*` プレフィックスの使用パターン
- 新規チャネル追加時の命名方針
- session系 vs runtime系の命名区別ガイド

## 参照資料

| 資料名   | パス                                       | 説明     |
| -------- | ------------------------------------------ | -------- |
| 実装記録 | `outputs/phase-5/implementation-record.md` | 変更内容 |
| 設計書   | `outputs/phase-2/design-document.md`       | 設計方針 |

## 統合テスト連携

全コンポーネントの統合テスト継続成功を確認する:

```bash
pnpm --filter @repo/desktop test:integration
```

## 成果物

| 成果物             | パス                                      | 説明                         |
| ------------------ | ----------------------------------------- | ---------------------------- |
| テスト拡充レポート | `outputs/phase-6/test-expansion.md`       | 追加テストケース一覧         |
| チャネル命名規則   | `outputs/phase-6/channel-naming-guide.md` | 命名規則ガイドライン（AC-5） |

## 完了条件

- [ ] エッジケーステストが追加されている
- [ ] リグレッションテストが全て PASS
- [ ] チャネル命名規則ガイドライン（AC-5）が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
