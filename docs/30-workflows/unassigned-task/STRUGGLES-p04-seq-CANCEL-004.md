# STRUGGLES: p04-seq-CANCEL-004 (skill-creator-cancel-renderer-hook)

> **位置づけ**: 本ドキュメントは task spec ではなく「将来の同種タスクで再発を防ぐための知見ノート」である。
> `task-specification-creator` のフォーマットには厳密準拠しない。

## メタ情報

| 項目                   | 内容                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------- |
| workflow-id            | `p04-seq-CANCEL-004`                                                               |
| 対応タスク             | `TASK-SW-CANCEL-004` (skill-creator-cancel-renderer-hook)                          |
| タスク種別             | NON_VISUAL / bugfix / `verify_existing`                                            |
| ステータス             | Phase 1-12 完了 / Phase 13 (PR作成) は user 承認待ち                               |
| 作成日                 | 2026-04-20                                                                         |
| 関連タスク (前提)      | TASK-SW-CANCEL-001 / -002 / -003 (いずれも完了済み)                                |
| 関連タスク (follow-up) | `TASK-SW-CANCEL-004-ipc-e2e-cancel-integration` (UI binding / E2E / consumer 特定) |
| 関連 Issue             | (本知見作成時点では未割当。follow-up 側で起票予定)                                 |
| 主実装ファイル         | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`                           |
| 主テストファイル       | `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts`            |

---

## 苦戦箇所と対応策

### 1. 旧テンプレート由来の「未実装前提」と実コードの矛盾

- **問題**: `docs/30-workflows/skill-create-flow-gaps/p04-seq-CANCEL-004/` から `docs/30-workflows/p04-seq-CANCEL-004/` へ workflow を移設した際、各 phase ドキュメントが「これから新規実装する」前提のまま残存し、実コード (`useCancelGeneration.ts` は既に IPC 呼び出し・local abort・stage 遷移・catch swallow まで実装済み) と乖離していた。
- **原因**: 移設時に template の `implementation_mode` / Phase 4-5 の文言が `new_implementation` 前提のまま持ち越された。`current-state-inventory` を Phase 1 で取らずに進めると false work (再実装) と false green (新規 test を書いて緑にしてしまう) を誘発する。
- **対策**:
  - Phase 1 で **必ず `current-state-inventory.md` を作成**し、対象シンボル・既存テスト・IPC 4層 (shared/preload/main/renderer) の実装状況を棚卸しする。
  - 棚卸し結果が「実装済み」を示すなら `implementation_mode: verify_existing` に切り替え、Phase 4 は targeted regression、Phase 5 は **diff check 主軸** に再定義する。
  - 旧 workflow ディレクトリを移設する場合は、template 由来の文言を grep で洗い出し、`new_implementation` / `TODO 実装` / `未実装` を残さない。
- **再発防止**:
  - 移設 PR では「移設前→移設後」の `implementation_mode` 変化を index.md に明記する。
  - Phase 1 のチェックリストに「実コードと仕様書の `mode` が一致しているか」を必須項目として追加する。

### 2. NON_VISUAL タスクにおける Phase-11 証跡 3点セットの固定化

- **問題**: UI/UX 変更を伴わない renderer hook の検証で、Phase 11 として何を残せばよいか曖昧になり、無意味なスクリーンショット要求が走りかけた。
- **原因**: Phase 11 のデフォルト template が VISUAL 前提で書かれており、NON_VISUAL タスクの省略・代替フォーマットが明記されていなかった。
- **対策**:
  - NON_VISUAL タスクでは固定文言 **「UI/UX変更なしのため Phase 11 スクリーンショット不要」** を `manual-test-result.md` 冒頭に必ず記載する。
  - 証跡 3点セットを以下に固定化:
    1. `outputs/phase-11/manual-test-checklist.md` (検証観点リスト)
    2. `outputs/phase-11/manual-test-result.md` (実行結果 + NON_VISUAL 固定文言)
    3. `outputs/phase-11/discovered-issues.md` (0件でも必ず作成)
  - 上記3点が揃っていれば NON_VISUAL Phase 11 は完了として扱う。
- **再発防止**:
  - task spec 作成時に `task_type` から NON_VISUAL を判定し、Phase 11 セクションで自動的に上記 3点セットへ落とす分岐を持つ。

### 3. workflow-local sync と global sync の責務分離 (Phase 12 Step 1-A〜1-C / Step 2)

- **問題**: Phase 12 の `system-spec-update-summary.md` で workflow-local の完了記録と global spec sync を同一ブロックに混ぜて書こうとしてしまい、後で「どちらが N/A だったのか」追跡不能になった。
- **原因**: Step 1 と Step 2 の責務境界、および Step 1 の細分化 (1-A / 1-B / 1-C) が docs 上で曖昧だった。
- **対策**: Phase 12 の `system-spec-update-summary.md` を以下4ブロックに分割して記述する:
  - **Step 1-A (workflow-local 完了記録)**: 当該 workflow ディレクトリ内の LOGS / topic-map / ledger 更新有無。
  - **Step 1-B (実装状況テーブル / task status 更新)**: master task list / 親 chain 内 status。
  - **Step 1-C (関連 task / chain 参照更新)**: 依存・派生タスク表の参照リンク。
  - **Step 2 (public contract / system spec 判定)**: 必要なら正本仕様 (`.agents/skills/aiworkflow-requirements/`) を更新。**不要なら必ず「N/A」+ 理由を明記**する。
- **再発防止**:
  - 「N/A」のみの記述は禁止し、**「N/A (理由: …)」** をテンプレート強制にする。
  - `verify_existing` タスクは Step 2 が N/A になりがちだが、その場合も「公開契約に変更なし、IPC signature 不変」など根拠を残す。

### 4. `artifacts.json` parity の維持

- **問題**: workflow root の `artifacts.json` と `outputs/artifacts.json` が片側だけ更新され、Phase 12 準拠チェック時に parity error が発覚した。
- **原因**: 成果物追加のたびに片方だけ手で書き換える運用になっており、機械的な parity 保証が無かった。
- **対策**:
  - **2ファイルは常に完全一致**させる (順序・キー・配列要素まで揃える)。
  - Phase 12 Task 12-6 (`phase12-task-spec-compliance-check.md`) の必須チェック項目に「parity OK / NG」を明示記録する。
  - 片方だけ更新する PR は Phase 12 完了とみなさない。
- **再発防止**:
  - 将来的には `diff artifacts.json outputs/artifacts.json` を CI / pre-commit で自動検査する。
  - 当面は Phase 12 compliance check の冒頭に diff 実行コマンドと結果を貼り付ける運用とする。

### 5. IPC failure swallow (C-6) と API surface no-op (C-7) の契約化

- **問題**: Renderer hook の回帰テスト観点として、IPC reject 時にエラーを UI 側へ漏らさない契約と、`window.skillCreatorAPI` 未定義時 (preload 未注入環境) の no-op safety が、当初観点リストから抜けていた。
- **原因**: Renderer hook を「単純な local abort」と捉えていたが、実際は IPC 通知を伴う非同期処理で、preload 注入状況や reject 経路まで含めた契約が必要だった。
- **対策**: 既存テストに以下2観点を必須回帰として追加する:
  - **C-6 (IPC failure swallow)**: `window.skillCreatorAPI.cancelGeneration()` が reject しても hook は throw せず、stage は `cancelled` に到達する。catch swallow が機能していること。
  - **C-7 (API surface no-op safety)**: `window.skillCreatorAPI` 自体が `undefined`、または `cancelGeneration` プロパティが未定義の場合でも、hook は例外を出さず local abort + stage 更新まで完了する (optional chaining で no-op)。
- **再発防止**:
  - IPC を伴う renderer hook の test plan template に C-6 / C-7 を **default 項目**として組み込む。
  - hook の JSDoc にも「IPC reject は swallow」「API 未注入時は no-op」を契約として明記する。

### 6. `startGeneration()` consumer の未回収と follow-up 分離

- **問題**: hook contract (cancel 側) は本 workflow で閉じたが、(a) `SkillCreateWizard` 側の cancel UI バインディング証跡、(b) `startGeneration()` が返す `AbortSignal` の実 consumer 特定、(c) E2E close test が未着手のまま残った。これらを本 workflow に詰め込もうとするとスコープが膨張する。
- **原因**: 当初スコープが「renderer hook の検証同期」に絞られていたが、上位コンポーネント・E2E まで含めると責務が混在する。
- **対策**:
  - 本 workflow のスコープは **renderer hook contract に限定**して closeする。
  - UI binding / E2E close / `AbortSignal` consumer 特定は **`TASK-SW-CANCEL-004-ipc-e2e-cancel-integration` (follow-up)** に分離して継続扱いとする。
  - Phase 12 `unassigned-task-detection.md` で follow-up を明示的に列挙する (0件偽装をしない)。
- **再発防止**:
  - hook タスクと UI binding / E2E タスクは最初から別 workflow に分けることを default とする。
  - 「同じ機能だから一緒にやる」発想は responsibilities を曖昧化するため避ける。

---

## 将来への適用 (再利用可能な原則)

- **既存実装の有無を Phase 1 で必ず確認**し、`implementation_mode` を `new_implementation` / `verify_existing` のいずれかに早期確定する。曖昧なまま Phase 4-5 に進まない。
- **NON_VISUAL タスクは Phase 11 を「3点セット + 固定文言」で閉じる**。スクリーンショットを無理に作らない。
- **Phase 12 Step 1-A / 1-B / 1-C / Step 2 は別ブロックで記述**する。N/A は理由必須。
- **`artifacts.json` parity は Phase 12 の必須通過項目**として扱い、片側更新を許容しない。
- **IPC を伴う renderer hook には C-6 (failure swallow) / C-7 (API no-op safety) を default 観点**として組み込む。
- **hook contract と UI binding / E2E は別 workflow に切る**。スコープ膨張を防ぎ follow-up を明示する。
- workflow ディレクトリ移設時は **template 由来の前提文言が残っていないかを grep で洗う**。
- **0件レポート (discovered-issues / unassigned-task / skill-feedback) も必ず生成**する。0件偽装ではなく「0件であることの証跡」として残す。

---

## 参照 (outputs / phase ドキュメント)

### workflow root

- 概要 / メタ: `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/index.md`
- artifacts inventory (root): `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/artifacts.json`
- artifacts inventory (outputs parity): `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/artifacts.json`

### phase docs

- Phase 1 (要件定義): `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/phase-1-requirements.md`
- Phase 2 (設計): `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/phase-2-design.md`
- Phase 4 (テスト作成): `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/phase-4-test-creation.md`
- Phase 5 (実装確認 / diff check): `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/phase-5-implementation.md`
- Phase 11 (NON_VISUAL 手動テスト): `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/phase-11-manual-test.md`
- Phase 12 (ドキュメント更新): `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/phase-12-documentation.md`

### outputs (苦戦箇所の根拠資料)

- Phase 1 現状棚卸し: `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-1/current-state-inventory.md`
- Phase 1 要件定義: `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-1/requirements-definition.md`
- Phase 6 テスト拡充サマリー (C-6 / C-7 追加根拠): `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-6/test-expansion-summary.md`
- Phase 7 カバレッジレポート: `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-7/coverage-report.md`
- Phase 11 NON_VISUAL 3点セット:
  - `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-11/manual-test-checklist.md`
  - `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-11/manual-test-result.md`
  - `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-11/discovered-issues.md`
- Phase 12 6成果物:
  - 実装ガイド: `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-12/implementation-guide.md`
  - システム仕様更新サマリー (Step 1-A〜1-C / Step 2): `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-12/system-spec-update-summary.md`
  - ドキュメント更新履歴 (local / global 分離): `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-12/documentation-changelog.md`
  - 未タスク検出: `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-12/unassigned-task-detection.md`
  - スキルフィードバック: `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-12/skill-feedback-report.md`
  - Phase 12 準拠チェック (root evidence): `docs/30-workflows/completed-tasks/p04-seq-CANCEL-004/outputs/phase-12/phase12-task-spec-compliance-check.md`

### follow-up タスク

- UI binding / E2E / consumer 特定: `docs/30-workflows/unassigned-task/TASK-SW-CANCEL-004-ipc-e2e-cancel-integration.md`
- 関連 IPC キャンセル系 (上位、superseded): `docs/30-workflows/completed-tasks/TASK-SC-07-IPC-CANCEL.md`

### 実コード参照

- Renderer hook 本体: `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`
- Renderer hook テスト: `apps/desktop/src/renderer/hooks/__tests__/useCancelGeneration.test.ts`
