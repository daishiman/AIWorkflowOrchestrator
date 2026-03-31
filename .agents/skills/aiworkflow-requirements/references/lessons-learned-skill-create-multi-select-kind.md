# Lessons Learned / skill-creator multi_select 種別追加（TASK-RT-05）

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: TASK-RT-05 multi_select UserInputKind 追加の教訓集
> タスク完了日: 2026-03-30

---

## L-RT05-001: UserInputKind 拡張は field 追加 + kind 分岐が最安全

| 項目 | 内容 |
| --- | --- |
| 課題 | 新しい選択種別（multi_select）追加時、`selectedOptionId: string \| string[]` の union 型で統合する案があった |
| 再発条件 | 既存 4 kind の submit 経路を変更してでも型を統一しようとした場合 |
| 解決策 | `selectedOptionIds?: string[]` を独立フィールドとして追加し、既存 `selectedOptionId` を変更しないことで非破壊拡張を実現した |
| 標準ルール | IPC 送信型の拡張は optional フィールド追加 + submit 側の kind 分岐パターンを適用する。既存フィールドの型変更は P17（後方互換）違反リスクがある |
| 関連パターン | Open-Closed Principle, P17（破壊的変更禁止） |
| 関連タスク | TASK-RT-05 |

---

## L-RT05-002: input kind 切替時の stale state は useEffect + workflowSnapshot 監視で解消

| 項目 | 内容 |
| --- | --- |
| 課題 | request kind が `multi_select` → `single_select` → `multi_select` と切り替わった際、前回の `selectedOptionIds` がリセットされず stale 状態になった |
| 再発条件 | 各 kind 用の state が独立した useState で管理され、kind 変化を検知するリセット機構がない場合 |
| 解決策 | `useEffect(() => { ... }, [workflowSnapshot])` で kind の変化を監視し、requestId が変わるたびに全 kind の input state を一括リセットする |
| 標準ルール | 複数の input kind を同一コンポーネントで管理する場合、kind の切替ソース（workflowSnapshot）を `useEffect` 依存に入れ、all-reset を kind 個別ではなく一括で行う。これにより stale selection の種類間持ち越しを防ぐ |
| 関連パターン | P5（stale state 防止）、useEffect dependency management |
| 関連タスク | TASK-RT-05 |

---

## L-RT05-003: jest-dom matchers 使用前に setupFiles を確認する

| 項目 | 内容 |
| --- | --- |
| 課題 | `toBeChecked()` / `toBeDisabled()` が「Invalid Chai property」エラーで失敗すると誤認し、代替実装を検討した |
| 再発条件 | vitest の setupFiles に `@testing-library/jest-dom` が既にインポートされているにもかかわらず、事前確認なしにエラーを想定して代替実装を検討した場合 |
| 解決策 | `apps/desktop/src/test/setup.ts` を確認し、`import "@testing-library/jest-dom"` が 1 行目にあることを確認してから実行したところ全 35 テスト通過 |
| 標準ルール | jest-dom matchers 使用前に `setupFiles` に `@testing-library/jest-dom` インポートがあるかを確認する。実際のエラーを再現してから対処し、不要な代替実装を避ける |
| 関連パターン | vitest setup, @testing-library/jest-dom |
| 関連タスク | TASK-RT-05 |

---

## L-RT05-004: shared contract 変更は same-wave で canonical spec へ同期する

| 項目 | 内容 |
| --- | --- |
| 課題 | `SkillCreatorUserInputKind` の型追加は `packages/shared/` の変更であり、`skill-creator/SKILL.md` と `api-ipc-system-core.md` が旧 4 種類の記述のままになるリスクがあった |
| 再発条件 | shared 型定義を変更した後、skill spec と IPC 仕様書の同期を別タスクに後回しにした場合 |
| 解決策 | Phase 12 で same-wave として `skill-creator/SKILL.md` と `api-ipc-system-core.md` を同一ターンで更新した |
| 標準ルール | `SkillCreatorUserInputKind` のような shared contract 変更は、コード変更と canonical spec 更新を same-wave（同一 Phase 12 クローズアウト）で行う。後回しにすると次のタスクが古い仕様を参照してしまう |
| 関連パターン | same-wave sync, canonical spec SSoT |
| 関連タスク | TASK-RT-05 |

---

## L-RT05-005: worktree環境での esbuild platform mismatch 解消手順

| 項目 | 内容 |
| --- | --- |
| 課題 | worktree環境でesbuild darwin-arm64/darwin-x64 platform mismatchが発生し、Vitestが起動できなかった |
| 再発条件 | worktree 作成後に pnpm install を実行せず、または node_modules が古いままの場合 |
| 解決策 | pnpm install + pnpm --filter @repo/shared build で解消できる。解消しない場合は node_modules 完全削除後に pnpm install を再実行する |
| 標準ルール | テストインフラ問題（jest-dom DOMマッチャー未拡張）はコード回帰と区別して記録すること。環境起因のブロッカーは別タスク（UT-RT-06）で解消し、再実行タスク（TASK-RT-05-TEST-RERUN）で確認するパターンを適用する |
| 関連パターン | esbuild platform mismatch, worktree native binary |
| 関連タスク | TASK-RT-05, TASK-RT-05-TEST-RERUN, UT-RT-06 |
