# Phase 9: 品質保証

## メタ情報

| 項目       | 値             |
| ---------- | -------------- |
| Phase      | 9              |
| 機能名     | TASK-RALLY-006 |
| 前提Phase  | Phase 8        |
| 後続Phase  | Phase 10       |
| ステータス | pending        |

## SubAgentチーム編成

| SubAgent   | 担当                                 | 実行形態               |
| ---------- | ------------------------------------ | ---------------------- |
| SubAgent-A | typecheck・lint 最終実行             | **並列**               |
| SubAgent-B | 受け入れ基準 AC-1〜AC-6 全件チェック | **並列**               |
| SubAgent-C | 統合品質判定                         | **直列**（A・B完了後） |

## 品質チェックコマンド

```bash
# 型チェック
pnpm typecheck

# lint チェック
pnpm lint

# テスト全件実行
pnpm --filter @repo/desktop test
```

## 受け入れ基準 最終確認

| AC   | 内容                                                                                        | 結果    |
| ---- | ------------------------------------------------------------------------------------------- | ------- |
| AC-1 | L675-708 の useEffect 依存配列から `workflowSnapshot?.planId` が除去されていること          | pending |
| AC-2 | エフェクトのトリガーが `activePlanResult?.planId` または `storePlanId` の変化のみとなること | pending |
| AC-3 | `react-hooks/exhaustive-deps` ESLint ルールが警告を出さないこと                             | pending |
| AC-4 | planId の値がエフェクト内で正しく参照されていること（ref または直接参照）                   | pending |
| AC-5 | `pnpm typecheck` がエラーなしで通過すること                                                 | pending |
| AC-6 | `pnpm lint` がエラーなしで通過すること                                                      | pending |

## 完了条件

- [ ] typecheck がエラーなしで通過
- [ ] lint がエラーなしで通過（exhaustive-deps 警告ゼロ）
- [ ] 全テストが PASS
- [ ] AC-1〜AC-6 が全件 PASS

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了

## 次のPhase

Phase 10: 最終レビュー
