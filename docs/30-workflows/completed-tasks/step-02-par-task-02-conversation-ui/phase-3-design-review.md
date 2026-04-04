# Phase 3: 設計レビュー — Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目      | 値              |
| --------- | --------------- |
| Phase番号 | 3               |
| 機能名    | conversation-ui |
| タスクID  | TASK-SDK-SC-02  |
| 作成日    | 2026-04-02      |
| 依存Phase | Phase 2（設計） |

## 目的

Phase 2 の設計が要件・依存関係・整合性の観点で正しいかを4条件で検証する。

## 実行タスク

### Task 3-1: 矛盾なしの検証

**検証項目**: 各質問タイプで UI が正しく切り替わり、矛盾する表示が発生しないこと

| 検証ポイント                   | 期待する動作                                                            | 状態 |
| ------------------------------ | ----------------------------------------------------------------------- | ---- |
| `type=single_select` のとき    | ChoiceButton リスト + 末尾に「その他（自由入力）」を常時表示            | OK   |
| `type=multi_select` のとき     | ChoiceButton リスト（複数選択）+ 末尾に「その他（自由入力）」を常時表示 | OK   |
| `type=free_text` のとき        | FreeTextInput のみ表示（isSecret=false）、ChoiceButton は表示しない     | OK   |
| `type=secret` のとき           | FreeTextInput のみ表示（isSecret=true）、ChoiceButton は表示しない      | OK   |
| `type=confirm` のとき          | 「はい」「いいえ」ChoiceButton のみ表示、FreeTextInput は表示しない     | OK   |
| 「その他（自由入力）」未選択時 | FreeTextInput は非表示（isFreeTextVisible=false）                       | OK   |
| 「その他（自由入力）」選択時   | FreeTextInput が展開表示される（isFreeTextVisible=true）                | OK   |
| `session-complete` 受信時      | 完了状態へ遷移し、全入力が無効化される                                  | OK   |
| `session-error` 受信時         | エラー状態へ遷移し、全入力が無効化される                                | OK   |

**結論**: 矛盾なし。各タイプは相互に排他的に制御され、「その他（自由入力）」の表示制御も一貫している。

### Task 3-2: 漏れなしの検証

**検証項目**: `SkillCreatorUserInputRequest.kind` の全タイプが処理されているか

| タイプ          | QuestionCard の処理                             | FreeTextInput の状態         | ChoiceButton の状態          |
| --------------- | ----------------------------------------------- | ---------------------------- | ---------------------------- |
| `single_select` | ChoiceButton リスト（単一選択・即時送信）       | 「その他」選択時のみ展開     | request.options + 「その他」 |
| `multi_select`  | ChoiceButton リスト（複数選択・送信ボタンあり） | 「その他」選択時のみ展開     | request.options + 「その他」 |
| `free_text`     | FreeTextInput のみ（isSecret=false）            | 常に表示                     | 表示しない                   |
| `secret`        | FreeTextInput のみ（isSecret=true）             | 常に表示（パスワードマスク） | 表示しない                   |
| `confirm`       | 「はい」「いいえ」ChoiceButton のみ             | 表示しない                   | 「はい」「いいえ」のみ       |

**結論**: 漏れなし。5タイプ全てに対する処理分岐が設計されている。

### Task 3-3: 整合性の検証

**検証項目**: IPCチャネル定数が `channels.ts` のエクスポートを使用しているか

```typescript
// 正しい参照（channels.ts のエクスポートを使用）
import { SKILL_CREATOR_SESSION_CHANNELS } from "@repo/shared/src/ipc/channels";

// 誤った参照（文字列リテラルの直書きは禁止）
// window.api.on('skill-creator:question-received', ...)  ← NG
// window.api.invoke('skill-creator:answer', ...)         ← NG
```

| 検証ポイント                                              | 状態 |
| --------------------------------------------------------- | ---- |
| `SKILL_CREATOR_SESSION_CHANNELS.QUESTION_RECEIVED` を使用 | OK   |
| `SKILL_CREATOR_SESSION_CHANNELS.ANSWER` を使用            | OK   |
| 文字列リテラルの直書きなし                                | OK   |
| `@repo/shared/src/ipc/channels` からインポート            | OK   |

**結論**: 整合性あり。IPCチャネル定数は全て `channels.ts` のエクスポートから参照する設計になっている。

### Task 3-4: 依存関係整合の検証

**検証項目**: TASK-SDK-SC-01 の成果物のみに依存しているか

| 依存先                                         | 依存の種類                                                                                  | 許容性                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- |
| `packages/shared/src/types/index.ts`           | UserInputQuestion / UserInputAnswer / SkillCreatorUserInputRequest / InterviewUserAnswer 型 | OK（TASK-SDK-SC-01 成果物）      |
| `packages/shared/src/ipc/channels.ts`          | IPC チャネル定数                                                                            | OK（TASK-SDK-SC-01 成果物）      |
| `react`                                        | UIフレームワーク                                                                            | OK（外部依存）                   |
| `apps/desktop/src/renderer` の他コンポーネント | なし                                                                                        | OK（本タスクで新規作成するため） |
| step-02-par 内の他タスク成果物                 | なし                                                                                        | OK（並列実行のため依存なし）     |

**結論**: 依存関係整合あり。TASK-SDK-SC-01 の成果物のみを参照し、並列実行タスクとは独立している。

### Task 3-5: 設計上の問題点と対策

| 問題点                                            | 対策                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `multi_select` の選択状態管理が複雑               | QuestionCard 内部で `selectedChoices: string[]` を useState で管理する          |
| 「その他（自由入力）」の表示タイミングが不明確    | `isFreeTextVisible` を QuestionCard 内部状態として管理する                      |
| `secret` タイプで Shift+Enter 改行は不要          | FreeTextInput の `isSecret=true` 時は Shift+Enter の挙動を無効化する            |
| IPCリスナーのクリーンアップ漏れリスク             | `useEffect` の cleanup 関数でリスナーを必ず解除する                             |
| `isSubmitting` 中の重複送信リスク                 | `isSubmitting=true` 時は全ての ChoiceButton と FreeTextInput を disabled にする |
| 「その他（自由入力）」を `request.options` に含む | `FREE_TEXT_LABEL` 定数で識別し、`request.options` の末尾に追加して判定する      |
| `session-complete` / `session-error` の扱いが曖昧 | Panel が終端状態を所有し、UI の disable / callback を一元化する                 |

### Task 3-6: 判定後の戻り先

| 判定  | 戻り先            | 判断基準                                     |
| ----- | ----------------- | -------------------------------------------- |
| PASS  | Phase 4           | 要件・設計・依存関係が整合し、追加修正が不要 |
| MINOR | Phase 2           | 実装判断の細部を詰めれば解消する差異         |
| MAJOR | Phase 1 / Phase 2 | 要件の再定義または設計の再構成が必要         |

## 参照資料

| 資料名           | パス                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| Phase 1 要件定義 | `phase-1-requirements.md`                                                   |
| Phase 2 設計     | `phase-2-design.md`                                                         |
| UI/UX 親仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     |
| IPC 正本         | `.claude/skills/aiworkflow-requirements/references/api-ipc-system.md`       |
| 品質・テスト正本 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` |

## 実行手順

1. 矛盾なし・漏れなし・整合性あり・依存関係整合を順に確認する
2. `UserInputQuestion` / `UserInputAnswer` / `SkillCreatorUserInputRequest` / `InterviewUserAnswer` と IPC の canonical 参照を照合する
3. simpler alternative と再構成案を比較する
4. Phase 4 へ進めるか、Phase 2 へ戻すかを判定する

## 統合テスト連携

- Phase 4 の Red テストに進める条件をこのレビューで固定する
- Phase 9 / 10 の再確認観点として指摘事項を流用する
- FAIL 時の戻り先を Phase 2 に固定する

## 多角的チェック観点（AIが判断）

| カテゴリ     | 思考法                                                               | 主な観点                                 |
| ------------ | -------------------------------------------------------------------- | ---------------------------------------- |
| 論理分析系   | 批判的思考、演繹思考、帰納的思考、アブダクション、垂直思考           | type 分岐、IPC 参照、検証結果の妥当性    |
| 構造分解系   | 要素分解、MECE、2軸思考、プロセス思考                                | UI / state / IPC / test の分割妥当性     |
| メタ・抽象系 | メタ思考、抽象化思考、ダブル・ループ思考                             | 前提の妥当性、再構成の必要性             |
| 発想・拡張系 | ブレインストーミング、水平思考、逆説思考、類推思考、if思考、素人思考 | より簡潔な代替案、state reset の設計     |
| システム系   | システム思考、因果関係分析、因果ループ                               | 送信・再表示・無効化の連鎖、責務境界     |
| 戦略・価値系 | トレードオン思考、プラスサム思考、価値提案思考、戦略的思考           | ユーザー価値と実装コストの均衡           |
| 問題解決系   | why思考、改善思考、仮説思考、論点思考、KJ法                          | 根本原因、改善論点、レビュー指摘の束ね方 |

## サブタスク管理

- 3-1〜3-4 は並列に検証する
- 3-5 は 3-1〜3-4 の結果を統合して記録する
- Phase 4 へ進むかどうかの判定は 3-5 完了後に行う

## 成果物

| 成果物                       | パス                       | 形式     |
| ---------------------------- | -------------------------- | -------- |
| 設計レビュー書（本ファイル） | `phase-3-design-review.md` | Markdown |

## 完了条件

- [ ] 矛盾なしの検証: 全タイプで UI が正しく切り替わることを確認した
- [ ] 漏れなしの検証: 5タイプ（single_select/multi_select/free_text/secret/confirm）が全て処理されることを確認した
- [ ] 整合性の検証: IPCチャネル定数が `channels.ts` のエクスポートを使っていることを確認した
- [ ] 依存関係整合の検証: TASK-SDK-SC-01 の成果物のみに依存していることを確認した
- [ ] 設計上の問題点と対策を記録した

## タスク100%実行確認【必須】

- [ ] 4 条件の検証が完了した
- [ ] 30 思考法の観点をレビューへ反映した
- [ ] Phase 4 へ進める/戻すの判定が明記された

## 次の Phase: Phase 4 (phase-4-test-creation.md)
