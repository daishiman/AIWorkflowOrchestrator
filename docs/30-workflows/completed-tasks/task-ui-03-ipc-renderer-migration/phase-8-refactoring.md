# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 8                                 |
| Phase名    | リファクタリング                  |
| 機能名     | task-ui-03-ipc-renderer-migration |
| 前提Phase  | Phase 7: カバレッジ確認           |
| 次Phase    | Phase 9: 品質保証                 |
| ステータス | pending                           |
| 作成日     | 2026-04-07                        |

## 目的

動作を変えずに移行後のコードの品質を改善する。

## 参照資料

| 資料名  | パス                        | 説明           |
| ------- | --------------------------- | -------------- |
| Phase 7 | `phase-7-coverage-check.md` | カバレッジ確認 |
| Phase 5 | `phase-5-implementation.md` | 実装参照       |
| Phase 2 | `phase-2-design.md`         | 設計方針       |

## 実行タスク

- 不要な `electronAPI` 参照を確認する
- `window.skillCreatorAPI` の型定義を整理する
- テスト全PASSを確認する

### Task 1: 不要なimport除去確認

移行後のコンポーネントで `window.electronAPI` への型参照が不要になっていないか確認する:

```bash
# 移行コンポーネントで残存している electronAPI 参照を確認
grep -n "electronAPI" apps/desktop/src/renderer/components/skill/ImprovementProposalPanel.tsx
grep -n "electronAPI" apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx
```

### Task 2: 型定義の整理

`window.skillCreatorAPI` の型定義が明示されているか確認し、必要であれば型アノテーションを整理する。

### Task 3: テスト全PASS確認

リファクタリング後もテストが全て PASS することを確認する:

```bash
pnpm --filter @repo/desktop test -- --run
pnpm --filter @repo/desktop typecheck
```

## 統合テスト連携

リファクタ後の統合テスト継続成功を確認:

```bash
pnpm --filter @repo/desktop test
```

## 成果物

| 成果物               | パス                                 | 説明                       |
| -------------------- | ------------------------------------ | -------------------------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | 変更内容（なし含む）の記録 |

## 完了条件

- [ ] 不要な `electronAPI` 参照が除去されている（またはなしを確認済み）
- [ ] テストが継続して全て PASS
- [ ] typecheck エラーなし
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
