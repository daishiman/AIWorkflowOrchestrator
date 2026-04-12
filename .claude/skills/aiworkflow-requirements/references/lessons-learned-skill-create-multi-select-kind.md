# Lessons Learned / skill-creator multi_select 種別追加（TASK-RT-05）

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: TASK-RT-05 multi_select UserInputKind 追加の教訓集
> タスク完了日: 2026-03-30

---

## L-RT05-001: UserInputKind 拡張は field 追加 + kind 分岐が最安全

| 項目         | 内容                                                                                                                                           |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | 新しい選択種別（multi_select）追加時、`selectedOptionId: string \| string[]` の union 型で統合する案があった                                   |
| 再発条件     | 既存 4 kind の submit 経路を変更してでも型を統一しようとした場合                                                                               |
| 解決策       | `selectedOptionIds?: string[]` を独立フィールドとして追加し、既存 `selectedOptionId` を変更しないことで非破壊拡張を実現した                    |
| 標準ルール   | IPC 送信型の拡張は optional フィールド追加 + submit 側の kind 分岐パターンを適用する。既存フィールドの型変更は P17（後方互換）違反リスクがある |
| 関連パターン | Open-Closed Principle, P17（破壊的変更禁止）                                                                                                   |
| 関連タスク   | TASK-RT-05                                                                                                                                     |

---

## L-RT05-002: input kind 切替時の stale state は useEffect + workflowSnapshot 監視で解消

| 項目         | 内容                                                                                                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | request kind が `multi_select` → `single_select` → `multi_select` と切り替わった際、前回の `selectedOptionIds` がリセットされず stale 状態になった                                                                |
| 再発条件     | 各 kind 用の state が独立した useState で管理され、kind 変化を検知するリセット機構がない場合                                                                                                                      |
| 解決策       | `useEffect(() => { ... }, [workflowSnapshot])` で kind の変化を監視し、requestId が変わるたびに全 kind の input state を一括リセットする                                                                          |
| 標準ルール   | 複数の input kind を同一コンポーネントで管理する場合、kind の切替ソース（workflowSnapshot）を `useEffect` 依存に入れ、all-reset を kind 個別ではなく一括で行う。これにより stale selection の種類間持ち越しを防ぐ |
| 関連パターン | P5（stale state 防止）、useEffect dependency management                                                                                                                                                           |
| 関連タスク   | TASK-RT-05                                                                                                                                                                                                        |

---

## L-RT05-003: jest-dom matchers 使用前に setupFiles を確認する

| 項目         | 内容                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `toBeChecked()` / `toBeDisabled()` が「Invalid Chai property」エラーで失敗すると誤認し、代替実装を検討した                                                    |
| 再発条件     | vitest の setupFiles に `@testing-library/jest-dom` が既にインポートされているにもかかわらず、事前確認なしにエラーを想定して代替実装を検討した場合            |
| 解決策       | `apps/desktop/src/test/setup.ts` を確認し、`import "@testing-library/jest-dom"` が 1 行目にあることを確認してから実行したところ全 35 テスト通過               |
| 標準ルール   | jest-dom matchers 使用前に `setupFiles` に `@testing-library/jest-dom` インポートがあるかを確認する。実際のエラーを再現してから対処し、不要な代替実装を避ける |
| 関連パターン | vitest setup, @testing-library/jest-dom                                                                                                                       |
| 関連タスク   | TASK-RT-05                                                                                                                                                    |

---

## L-RT05-004: shared contract 変更は same-wave で canonical spec へ同期する

| 項目         | 内容                                                                                                                                                                                                |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `SkillCreatorUserInputKind` の型追加は `packages/shared/` の変更であり、`skill-creator/SKILL.md` と `api-ipc-system-core.md` が旧 4 種類の記述のままになるリスクがあった                            |
| 再発条件     | shared 型定義を変更した後、skill spec と IPC 仕様書の同期を別タスクに後回しにした場合                                                                                                               |
| 解決策       | Phase 12 で same-wave として `skill-creator/SKILL.md` と `api-ipc-system-core.md` を同一ターンで更新した                                                                                            |
| 標準ルール   | `SkillCreatorUserInputKind` のような shared contract 変更は、コード変更と canonical spec 更新を same-wave（同一 Phase 12 クローズアウト）で行う。後回しにすると次のタスクが古い仕様を参照してしまう |
| 関連パターン | same-wave sync, canonical spec SSoT                                                                                                                                                                 |
| 関連タスク   | TASK-RT-05                                                                                                                                                                                          |

---

## L-MSO-001: SmartDefaultResult の型は不変を維持し、UI層で変換を吸収する

| 項目         | 内容                                                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `QuestionAnswer.selectedOption: string \| null` → `selectedOptions: string[]` 変更時に、`SmartDefaultResult`（`string \| null` × 6）も変更するか議論が生じた        |
| 再発条件     | SmartDefault推論サービスとUI入力型が密結合しており、型を一括変更しようとした場合                                                                                    |
| 解決策       | `SmartDefaultResult` の型を変更せず、UI層の `createQuestionAnswer()` で `string → [string]` 変換を吸収した                                                          |
| 標準ルール   | SmartDefault推論層の型は不変を維持し、UI層の変換関数（`createQuestionAnswer()` 等）で差分を吸収する。これにより SmartDefaultResult の backward compatibility を保つ |
| 関連パターン | Adapter Pattern, backward compatibility                                                                                                                             |
| 関連タスク   | skill-wizard-multi-select-options                                                                                                                                   |

---

## L-MSO-003: トリガー型選択肢（Q3パターン）のフォールバックは Phase 2 設計で明文化する

| 項目         | 内容                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | Q3「定期実行」選択で scheduleConfig が展開される設計で、SmartDefaults 経由の初期化パスで「定期実行」が `selectedOptions` に含まれないことがあった |
| 再発条件     | 「特定選択肢が他の動作をトリガー」するパターンで、SmartDefaults 経由の初期化パスを Phase 2 設計書に記載しなかった場合                             |
| 解決策       | `handleCronChange`/`handleTimezoneChange` にフォールバック（自動追加）ロジックを追加し、コメントで意図を明示した                                  |
| 標準ルール 1 | SmartDefaults 経由でフィールドが設定される可能性がある選択肢は、Phase 2 設計時に「初期化パス別のフォールバック動作」を仕様書に記載する            |
| 標準ルール 2 | トリガー型選択肢のフォールバックは「保証する関数」単位で実装し、コメントで意図を明示する                                                          |
| 関連パターン | SmartDefaults initialization, trigger option pattern                                                                                              |
| 関連タスク   | skill-wizard-multi-select-options                                                                                                                 |

---

## L-MSO-004: スクリーンショット取得ハーネスは終了処理をテンプレート化する

| 項目         | 内容                                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | Playwright による画面証跡取得スクリプト実行後、開発サーバーのポートが解放されないまま残ることがあった                              |
| 再発条件     | 画面証跡取得スクリプトでブラウザ・サーバーの明示的な終了処理を実装しなかった場合                                                   |
| 解決策       | 終了待ち・ポート解放確認のステップを標準化し、Phase 4 必須アクションとして提案（FB-MSO-003）                                       |
| 標準ルール   | 画面証跡自動化スクリプトには `try { ... } finally { browser.close(); server.close(); }` パターンを標準化し、ポート解放を確実にする |
| 関連パターン | Playwright teardown, port release                                                                                                  |
| 関連タスク   | skill-wizard-multi-select-options                                                                                                  |

---

## L-RT05-005: worktree環境での esbuild platform mismatch 解消手順

| 項目         | 内容                                                                                                                                                                                                        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | worktree環境でesbuild darwin-arm64/darwin-x64 platform mismatchが発生し、Vitestが起動できなかった                                                                                                           |
| 再発条件     | worktree 作成後に pnpm install を実行せず、または node_modules が古いままの場合                                                                                                                             |
| 解決策       | pnpm install + pnpm --filter @repo/shared build で解消できる。解消しない場合は node_modules 完全削除後に pnpm install を再実行する                                                                          |
| 標準ルール   | テストインフラ問題（jest-dom DOMマッチャー未拡張）はコード回帰と区別して記録すること。環境起因のブロッカーは別タスク（UT-RT-06）で解消し、再実行タスク（TASK-RT-05-TEST-RERUN）で確認するパターンを適用する |
| 関連パターン | esbuild platform mismatch, worktree native binary                                                                                                                                                           |
| 関連タスク   | TASK-RT-05, TASK-RT-05-TEST-RERUN, UT-RT-06                                                                                                                                                                 |
