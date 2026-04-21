# Phase 5: 実装

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| タスクID   | TASK-RALLY-002                         |
| 機能名     | restored-pending-request-clarification |
| 前提Phase  | Phase 4                                |
| 後続Phase  | Phase 6                                |
| 作成日     | 2026-04-21                             |
| ステータス | pending                                |

## 目的

Phase 2 で設計したコメント追加と useEffect を `ConversationalInterview.tsx` に実装する。

## 実装手順

1. `ConversationalInterview.tsx` を開き、`pendingRequest` 合成式の直上にコメントを追加する
2. `workflowSnapshot?.awaitingUserInput` が更新されたときに `restoredPendingRequest` をクリアする `useEffect` を追加する
3. `pnpm --filter @repo/desktop typecheck` でエラーがないことを確認する
4. `pnpm --filter @repo/desktop lint` で exhaustive-deps 警告が出ないことを確認する
5. Phase 4 で作成したシナリオテストが GREEN になることを確認する
6. 既存テストが全て通過することを確認する

## 変更対象ファイル

| ファイル                                                                 | 変更種別 | 変更内容                                                                 |
| ------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------ |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | 追加     | pendingRequest合成式へのコメント + restoredPendingRequestクリアuseEffect |

## 実装上の注意事項

- `useEffect` の依存配列は `[workflowSnapshot?.awaitingUserInput?.requestId]` のみとする
- `restoredPendingRequest` を依存配列に含めると無限ループになるため含めない
- コメントは優先ルールの説明のみとし、実装詳細は含めない
- 本タスクは ConversationalInterview.tsx への最初の変更であり、後続変更（RALLY-010〜013）の基盤となる

## 参照資料

| 資料名       | パス                                    | 用途                        |
| ------------ | --------------------------------------- | --------------------------- |
| 変更設計書   | `outputs/phase-2/change-design.md`      | コメント内容・useEffect設計 |
| テスト仕様書 | `outputs/phase-4/test-specification.md` | GREEN確認対象のテスト       |

## 成果物

| 成果物           | パス                                        | 説明                                       |
| ---------------- | ------------------------------------------- | ------------------------------------------ |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 追加したコメント・useEffect の内容サマリー |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更したファイルパスと変更種別             |
| 検証結果         | `outputs/phase-5/verification-result.md`    | typecheck/lint/test の実行結果             |

## 完了条件

- [ ] コメントが追加されている
- [ ] useEffect が追加されている
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過（exhaustive-deps 含む）
- [ ] シナリオテストが GREEN
- [ ] 既存テストが全て通過
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] AC-1〜AC-5 全PASS確認
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 6: テスト拡充
