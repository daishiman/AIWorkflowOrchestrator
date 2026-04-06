# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                                  |
| ---------- | --------------------------------------------------------------------- |
| Phase      | 9                                                                     |
| Phase名    | 品質保証                                                              |
| 対象機能   | UT-SDK-07-APPROVAL-REQUEST-SURFACE-001: approval:request surface 追加 |
| 前提Phase  | Phase 8: リファクタリング                                             |
| 次Phase    | Phase 10: 最終レビュー                                                |
| ステータス | pending                                                               |
| 作成日     | 2026-04-06                                                            |
| 更新日     | 2026-04-06                                                            |

## 目的

IPC 契約ドリフト検証・lint・typecheck・テスト全通過を確認し、品質ゲートをクリアする。

## 実行タスク

### Task 1: IPC 契約ドリフト検証

```bash
# IPC 契約チェック（孤児チャンネル・引数形式不一致の検出）
pnpm tsx apps/desktop/scripts/check-ipc-contracts.ts --report-only
```

確認項目:

- `APPROVAL_REQUEST` チャネルが Main / Preload / 型定義で整合しているか
- `onApprovalRequest` の引数型が Main 側の push データ型と一致しているか
- チャンネル孤児（片側のみ定義）がないか

### Task 2: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/shared typecheck
```

- エラー件数: 0
- `any` 型の使用箇所を確認（意図的でない `any` は修正）

### Task 3: Lint チェック

```bash
pnpm --filter @repo/desktop lint
```

- エラー件数: 0
- warning は確認し、必要に応じて修正

### Task 4: 全テスト通過確認

```bash
# approval 関連テスト
pnpm --filter @repo/desktop test -- --testPathPattern="approval"

# 回帰テスト（governance-bundle）
pnpm --filter @repo/desktop test -- --testPathPattern="governance-bundle"

# SkillLifecyclePanel 関連テスト
pnpm --filter @repo/desktop test -- --testPathPattern="SkillLifecyclePanel"
```

### Task 5: コードレビューセルフチェック

| チェック項目                                                              | 確認 |
| ------------------------------------------------------------------------- | ---- |
| `approval:request` channel がホワイトリストに登録されているか             | -    |
| `contextBridge.exposeInMainWorld` に `onApprovalRequest` が含まれているか | -    |
| cleanup が `useEffect` の return で確実に呼ばれているか                   | -    |
| expired 状態でボタンが操作できないよう `disabled` が設定されているか      | -    |
| `respondToApproval()` の引数型が正しいか                                  | -    |
| TTL カウントダウンの `setInterval` が cleanup されているか                | -    |

## 参照資料

| 資料名                    | パス                                                                           | 内容                               |
| ------------------------- | ------------------------------------------------------------------------------ | ---------------------------------- |
| IPC契約チェックリスト     | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`  | IPC 変更時の同時更新チェックリスト |
| API IPC エージェント仕様  | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`           | approval:request チャネル定義      |
| スキル実行IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc-core.md` | IPC セキュリティパターン           |

## 成果物

| 成果物           | パス                                | 説明                                   |
| ---------------- | ----------------------------------- | -------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | 各チェックの結果・IPC 契約ドリフト結果 |

## 統合テスト連携

- Phase 9 の品質保証結果は Phase 10 の最終レビューへそのまま引き継ぐ。
- approval 関連テストの結果は Phase 11 の手動テストと Phase 12 のドキュメント更新に使用する。

## 完了条件

- [ ] IPC 契約ドリフト検証が実行され、問題なしが確認されている
- [ ] `pnpm typecheck` がエラー 0 件で通過している
- [ ] `pnpm lint` がエラー 0 件で通過している
- [ ] approval 関連テストが全て GREEN である
- [ ] governance-bundle の回帰テストが GREEN である
- [ ] コードレビューセルフチェックが全て完了している
- [ ] `outputs/phase-9/quality-report.md` が作成されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
