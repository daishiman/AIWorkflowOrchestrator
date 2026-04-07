# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 8                                                                     |
| Phase名    | リファクタリング                                                      |
| 対象機能   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request surface 追加 |
| 前提Phase  | Phase 7: カバレッジ確認                                               |
| 次Phase    | Phase 9: 品質保証                                                     |
| ステータス | pending                                                               |
| 作成日     | 2026-04-06                                                            |
| 更新日     | 2026-04-06                                                            |

## 目的

テストが GREEN を維持したまま、コードの可読性・保守性を向上させる。重複削除・型改善・命名の最適化を行う。

## 実行タスク

### Task 1: 重複・冗長コードの確認

以下の観点で実装コードを確認する:

- `SkillLifecyclePanel.tsx` の approval ロジックが他のコンポーネントと重複していないか
- TTL カウントダウンのロジックが重複実装されていないか（custom hook 化が適切か）
- エラーハンドリングのパターンが既存コードと統一されているか

### Task 2: TTL custom hook の評価

TTL カウントダウンロジックが十分複雑な場合、`useApprovalTTL` として custom hook に抽出することを検討する:

**抽出を推奨するケース**:

- TTL ロジックが 20 行以上になっている
- 複数箇所で同様のカウントダウンが使用される予定

**抽出しないケース**:

- TTL ロジックが単純（5 行以下）
- このコンポーネント固有のロジックである

### Task 3: 命名・型の最適化

- `ApprovalRequest` 型が適切な名前空間に配置されているか
- コンポーネントの Props 型名が命名規則に準拠しているか（`XxxProps` パターン）
- `onApprovalRequest` の命名が既存 listener のパターンと統一されているか

### Task 4: リファクタリング後のテスト確認

```bash
# 全テストが引き続き GREEN であることを確認
pnpm --filter @repo/desktop test -- --testPathPattern="approval"

# 回帰テスト（governance-bundle）
pnpm --filter @repo/desktop test -- --testPathPattern="governance-bundle"

# 型チェック
pnpm --filter @repo/desktop typecheck
```

**重要**: リファクタリングにより既存テストが FAIL した場合は、即座に差し戻す。

## 参照資料

| 資料名             | パス                                       | 説明                     |
| ------------------ | ------------------------------------------ | ------------------------ |
| Phase 7 カバレッジ | `outputs/phase-7/coverage-verification.md` | カバレッジ不足箇所の参照 |

## 成果物

| 成果物               | パス                                 | 説明                                   |
| -------------------- | ------------------------------------ | -------------------------------------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md` | 変更内容・変更理由・テスト継続確認結果 |

## 統合テスト連携

- Phase 8 での命名・型・責務の整理は Phase 9 の品質保証と Phase 10 の最終レビューで再確認する。
- テスト継続確認結果は Phase 11 の手動テストと Phase 12 のドキュメント更新に引き継ぐ。

## 完了条件

- [ ] 重複コードの確認と削除（または「重複なし」の明記）を行った
- [ ] TTL custom hook 抽出の評価結果を記録した
- [ ] 命名・型の最適化を行った
- [ ] リファクタリング後に全テストが GREEN であることを確認した
- [ ] `outputs/phase-8/refactoring-log.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 9: 品質保証](./phase-9-quality-assurance.md)
