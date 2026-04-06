# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 9                                                      |
| Phase 名   | 品質保証                                               |
| 前提 Phase | Phase 8（リファクタリング）完了                        |
| 後続 Phase | Phase 10（最終レビューゲート）                         |
| ステータス | 未着手                                                 |
| 作成日     | 2026-04-06                                             |
| 機能名     | task-ut-rt-01-execute-async-snapshot-error-message-001 |

---

## 目的

定義された品質基準をすべて満たすことを検証する。本 Phase では typecheck / lint / test の一括実行により、変更が品質ゲートをすべてクリアしていることを確認する。

---

## 品質ゲート一覧

| 品質項目              | 確認内容                                                                           | 合格基準      | 結果               |
| --------------------- | ---------------------------------------------------------------------------------- | ------------- | ------------------ |
| line budget 確認      | 変更行数が最小（各パス 1 行削除 + 1 行変更 = 計 4 行変更）                         | 4 行以下      | （実施後記入）     |
| link 確認             | `onWorkflowStateSnapshot` の下流（`creatorHandlers.ts`）との接続が壊れていないこと | 接続正常      | （実施後記入）     |
| mirror parity 確認    | 型定義の変更がないため `.agents` mirror sync が不要であること                      | 不要          | 不要（型変更なし） |
| TypeScript 型チェック | `pnpm --filter @repo/desktop typecheck` がエラー 0 件で通過                        | エラー 0 件   | （実施後記入）     |
| ESLint チェック       | `pnpm --filter @repo/desktop lint` がエラー 0 件で通過                             | エラー 0 件   | （実施後記入）     |
| テスト通過            | `RuntimeSkillCreatorFacade` テストが全件 PASS                                      | 全テスト PASS | （実施後記入）     |

---

## 詳細確認項目

### line budget 確認

変更行数の上限を確認する。本タスクの変更は以下の 4 行のみであるべき:

| 変更箇所                                                     | 変更種別         | 行数     |
| ------------------------------------------------------------ | ---------------- | -------- |
| structured error パス: `if (!snapshot)` 行削除               | 削除（-1 行）    | 1 行     |
| structured error パス: `onWorkflowStateSnapshot?.(...)` 変更 | 変更（引数追加） | 1 行     |
| catch パス: `if (!snapshot)` 行削除                          | 削除（-1 行）    | 1 行     |
| catch パス: `onWorkflowStateSnapshot?.(...)` 変更            | 変更（引数追加） | 1 行     |
| **合計**                                                     |                  | **4 行** |

確認コマンド:

```bash
# 変更行数の確認
git diff HEAD -- apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | grep "^[+-]" | grep -v "^[+-][+-][+-]" | wc -l
```

### link 確認: `onWorkflowStateSnapshot` 下流接続

`onWorkflowStateSnapshot` コールバックは `creatorHandlers.ts` で以下のようにワイヤリングされている:

```typescript
// creatorHandlers.ts（変更なし）
onWorkflowStateSnapshot: (planId, snapshot, error?) => {
  mainWindow.webContents.send(SKILL_CREATOR_WORKFLOW_STATE_CHANGED, snapshot);
};
```

確認項目:

| 確認項目                                                                               | 確認方法                                                        | 期待結果               |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------- |
| `creatorHandlers.ts` の `onWorkflowStateSnapshot` 実装が変更されていないこと           | `git diff HEAD -- apps/desktop/src/main/ipc/creatorHandlers.ts` | diff なし（変更なし）  |
| `onWorkflowStateSnapshot` のシグネチャが既存のまま（第3引数 `error?` optional）        | typecheck 実行                                                  | TypeScript エラー 0 件 |
| Renderer 側の IPC ハンドラ（`SKILL_CREATOR_WORKFLOW_STATE_CHANGED`）が壊れていないこと | テスト実行                                                      | 全テスト PASS          |

### mirror parity 確認

| 確認項目                                    | 結果 | 理由                                                             |
| ------------------------------------------- | ---- | ---------------------------------------------------------------- |
| `.agents` mirror sync が必要か              | 不要 | 型定義（`RuntimeSkillCreatorExecuteErrorResponse` 等）は変更なし |
| `packages/shared/src/types/` の変更が必要か | 不要 | 既存型をそのまま使用。新規型の追加なし。                         |
| IPC チャンネル定義の変更が必要か            | 不要 | `SKILL_CREATOR_WORKFLOW_STATE_CHANGED` は変更なし                |

---

## 一括判定コマンド

以下のコマンドを**この順番で**実行し、全て PASS することを確認する:

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade"
```

### 実行結果記録

| コマンド                                                                            | 期待結果      | 実際の結果     |
| ----------------------------------------------------------------------------------- | ------------- | -------------- |
| `pnpm --filter @repo/desktop typecheck`                                             | エラー 0 件   | （実施後記入） |
| `pnpm --filter @repo/desktop lint`                                                  | エラー 0 件   | （実施後記入） |
| `pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade"` | 全テスト PASS | （実施後記入） |

---

## セキュリティチェック

| 確認項目                                     | 結果 | 備考                                                     |
| -------------------------------------------- | ---- | -------------------------------------------------------- |
| 新規の外部入力受け入れポイントが追加されたか | なし | `executeAsync()` の入力は既存の `planId` のみ            |
| エラーメッセージが UI にそのまま露出されるか | 既存 | `onWorkflowStateSnapshot` 経由の既存フロー。スコープ外。 |
| 新規依存パッケージが追加されたか             | なし | 既存コードの条件削除のみ                                 |

---

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認する:

| 品質項目   | 確認内容                                                        | 結果           |
| ---------- | --------------------------------------------------------------- | -------------- |
| 機能検証   | T-01〜T-06（structured error / catch / branch coverage）が PASS | （実施後記入） |
| 回帰確認   | 既存テスト TC-T4-01〜TC-T4-04 が PASS                           | （実施後記入） |
| 型整合     | typecheck エラー 0 件                                           | （実施後記入） |
| コード品質 | lint エラー 0 件                                                | （実施後記入） |

---

## 成果物

| 成果物                       | パス                                                                                                    | 説明                         |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 9 品質保証仕様書       | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-9-quality-assurance.md` | 本ドキュメント               |
| 品質レポート                 | `outputs/phase-9/quality-report.md`                                                                     | 品質検証結果（実施後作成）   |
| Phase 9 outputs ディレクトリ | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-9/`             | Phase 9 出力格納ディレクトリ |

---

## 完了条件

- [ ] line budget 確認（変更 4 行以下）が完了した
- [ ] link 確認（`creatorHandlers.ts` との接続が正常）が完了した
- [ ] mirror parity 確認（型定義変更なし・mirror sync 不要）が完了した
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS した
- [ ] `pnpm --filter @repo/desktop lint` が PASS した
- [ ] `pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade"` が全件 PASS した
- [ ] セキュリティチェックが完了した
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## Phase 末端アクション【必須】

- [ ] Phase 9 内の全タスクを 100% 実行完了
- [ ] 一括判定コマンドの実行結果を記録した
- [ ] 全品質ゲートをクリアし、完了を明記
- [ ] 成果物（本ドキュメント・`outputs/phase-9/quality-report.md`）が生成されていることを確認

---

## 次 Phase

Phase 9 完了後、次は **Phase 10（最終レビューゲート）** へ進む。

`docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-10-final-review.md`
