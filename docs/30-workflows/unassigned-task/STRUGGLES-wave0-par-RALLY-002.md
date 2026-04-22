# STRUGGLES: wave0-par-RALLY-002 (restoredPendingRequest合成ルール明確化)

> **位置づけ**: 本ドキュメントは task spec ではなく「将来の同種タスクで再発を防ぐための知見ノート」である。
> `task-specification-creator` のフォーマットには厳密準拠しない。

## メタ情報

| 項目                   | 内容                                                                                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| workflow-id            | `wave0-par-RALLY-002`                                                                                                                                                           |
| 対応タスク             | `TASK-RALLY-002` (restoredPendingRequest合成ルール明確化)                                                                                                                       |
| タスク種別             | NON_VISUAL / renderer / `verify_existing`                                                                                                                                       |
| ステータス             | Phase 1-12 完了 / Phase 13 (PR作成) は user 承認待ち                                                                                                                            |
| 作成日                 | 2026-04-22                                                                                                                                                                      |
| 関連タスク (前提)      | なし                                                                                                                                                                            |
| 関連タスク (follow-up) | `TASK-RALLY-002-MANUAL-VERIFY-001` (Electron実機検証) / `TASK-RALLY-002-VITEST-RERUN-001` (vitest再実行) / `TASK-RALLY-002-HANDOFF-VALIDATION-001` (RALLY-010〜013 handoff検証) |
| 主実装ファイル         | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                                                                                                        |
| 主テストファイル       | `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx`                                                                  |

---

## 苦戦箇所と対応策

### 1. restore UI と submission 生成元の乖離検出

- **問題**: `verify_existing` タスクにもかかわらず、レビュー段階で実害バグが見つかった。「コメント整流のみ」と早期に固定されたが、実装には requestId drift を防ぐロジック修正が必要だった。
- **原因**: Phase 3（設計レビュー）で「既存実装の確認」にとどまり、`buildSubmission` の引数が旧い `workflowSnapshot.awaitingUserInput` を参照していることを見落とした。`ConversationalInterview.tsx` の `pendingRequest` 合成式と `submitAnswer` の `buildSubmission` 呼び出し箇所について、restore state が経路に入ったときの引数オブジェクトを追跡していなかった。
- **対策**:
  1. `submitAnswer` callback の依存値に `pendingRequest` を追加。
  2. `buildSubmission` の引数を `{ ...workflowSnapshot, awaitingUserInput: pendingRequest }` に修正。
  3. 送信成功直後の `setRestoredPendingRequest(null)` を削除し、新 snapshot 到着時にクリアするよう変更。
  4. `pendingRequest` の non-null check を追加。
- **再発防止**: `verify_existing` でも Phase 3 レビュー時に「useCallback 依存配列」と「buildSubmission の引数オブジェクト」を必ずリストアップし、restore state が関与する全呼び出しを追跡する。「コメント整流のみ」は early close にならないよう、データフロー追跡を Phase 1 チェックリストに必須追加する。

### 2. esbuild version mismatch による vitest 実行不可

- **問題**: worktree 環境の `pnpm --filter @repo/desktop test` でホストバージョン 0.21.5 とバイナリバージョン 0.25.12 の不整合が発生。新規テストファイル 529 行を作成したが vitest で動作検証できない状態が続いた。
- **原因**: worktree は `node_modules` を monorepo ルートと共有するが、worktree 内で `pnpm install` しても esbuild バイナリの解決パスが main のものを参照してしまう。worktree 固有の `node_modules` に再インストールされないため、バージョン不整合が残る。
- **対策**: Phase 5 の verification-result.md に環境制約として明記し、typecheck + eslint で静的検証を実施。代替証跡として `outputs/phase-10/final-review-result.md` と `outputs/phase-11/manual-test-result.md` を活用し、動的検証は follow-up タスク `TASK-RALLY-002-VITEST-RERUN-001` に委ねた。
- **再発防止**: worktree での esbuild 使用前に `node -e "require('esbuild')" && esbuild --version` で version 確認を行う。不整合があれば `node_modules/.pnpm/esbuild*/` を削除して `pnpm install` し直す。それでも解消しない場合は main 環境でのテストを前提として仕様書に記録し、follow-up タスクとして明示的に分離する。

### 3. restore state clear のタイミング最適化

- **問題**: 当初は送信成功直後に `setRestoredPendingRequest(null)` していたが、新 snapshot がまだ到着していない間に通常フローへ切り替わるため、race condition の可能性があった。
- **原因**: "submit が成功したら restore state は不要" という直感的な理解が、非同期 snapshot 更新フローのタイムラインと合っていなかった。非同期通信では「アクション完了」と「次の状態到達」が別タイミングであることを意識していなかった。
- **対策**: clear 条件を変更し、`workflowSnapshot?.awaitingUserInput?.requestId` の変化を監視して新しい requestId が到着したときだけ復元状態を clear するよう修正。`useEffect` で `[workflowSnapshot?.awaitingUserInput?.requestId]` を依存配列に持ち、新旧 requestId 比較で clear を判定する実装に変更した。
- **再発防止**: restore state を持つコンポーネントでは「状態のクリア条件」を「アクション完了時」ではなく「次の状態が到達した時」に設計する。この原則を Phase 2（設計）の「状態遷移図」必須作成ルールとして追加する。

---

## 将来への適用 (再利用可能な原則)

- **`verify_existing` でもデータフロー追跡は必須**: restore state が絡む `useCallback` は依存配列・引数オブジェクト・分岐経路を Phase 3 レビュー前に全列挙する。「コメント整流のみ」という early close の誘惑に乗らない。
- **worktree での esbuild 使用前はバージョン確認**: `node -e "require('esbuild')" && esbuild --version` を実行し、不整合が確認されたら即座に follow-up タスクに分離して静的検証で代替証跡を用意する。
- **restore state のクリアは「次の状態到達時」に設計**: 「アクション完了時」クリアは非同期フローで race condition を生む。状態遷移図を Phase 2 で必ず作成し、クリア条件を明示する。
- **環境制約は仕様書に記録し follow-up に分離**: 動的検証不可の制約は隠蔽せず、代替証跡（typecheck / eslint）と follow-up タスク ID をセットで記録する。

---

## 参照 (outputs / phase ドキュメント)

### workflow root

- 概要 / メタ: `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/index.md`
- artifacts inventory: `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/artifacts.json`

### phase docs

- Phase 1 (要件定義): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-1-requirements.md`
- Phase 2 (設計): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-2-design.md`
- Phase 3 (設計レビュー): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-3-design-review.md`
- Phase 4 (テスト作成): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-4-test-creation.md`
- Phase 5 (実装): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-5-implementation.md`
- Phase 6 (テスト拡充): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-6-test-expansion.md`
- Phase 7 (カバレッジ確認): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-7-coverage-check.md`
- Phase 8 (リファクタリング): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-8-refactoring.md`
- Phase 9 (品質保証): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-9-quality-assurance.md`
- Phase 10 (最終レビュー): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-10-final-review.md`
- Phase 11 (NON_VISUAL 手動テスト): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-11-manual-test.md`
- Phase 12 (ドキュメント更新): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-12-documentation.md`
- Phase 13 (PR作成): `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-13-pr-creation.md`

### outputs (苦戦箇所の根拠資料)

- Phase 10 最終レビュー: `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/outputs/phase-10/final-review-result.md`
- Phase 11 NON_VISUAL 手動テスト: `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/outputs/phase-11/manual-test-result.md`

### follow-up タスク

- Electron 実機検証: `TASK-RALLY-002-MANUAL-VERIFY-001`
- vitest 再実行: `TASK-RALLY-002-VITEST-RERUN-001`
- RALLY-010〜013 handoff 検証: `TASK-RALLY-002-HANDOFF-VALIDATION-001`

### 実コード参照

- renderer コンポーネント本体: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`
- テストファイル: `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx`
