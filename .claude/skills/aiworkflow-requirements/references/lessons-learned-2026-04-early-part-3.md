# Lessons Learned 2026-04 前半（2026-03-25～2026-04-08） — Part 3

> 分割元: lessons-learned-2026-04-early.md
> 範囲: UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001 教訓（2026-04-08） 〜 UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001: SkillLifecyclePanel ウィザード遷移ボタン化

## UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001 教訓（2026-04-08）

### L-RV-001: テスト文字列の実文字数を必ず数えて確認する

| 項目       | 内容                                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | EC-09 で `"十文字以上の目的"` を「10文字以上の目的文字列」として使い、minLength バリデーションが通過してしまうはずが実際にはテスト失敗した         |
| 原因       | `"十文字以上の目的"` は日本語7文字であり、minLength: 10 の条件を満たさなかった。目視で「十文字以上と書いてあるから10文字以上だろう」と誤認したため |
| 解決策     | テスト文字列を書く前に `"...".length` で実文字数を確認する。日本語の場合、漢数字表記の意味と実際の文字数は別物                                     |
| 再発防止   | minLength / maxLength を境界にするテストケースは、文字列の実 `.length` 値を先にコメントとして記載してからテストを書く                              |
| 関連タスク | UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001                                                                                                          |

### L-RV-002: pure function バリデーションは Zod なしでも型安全を達成できる

| 項目       | 内容                                                                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 設計判断   | `validateSkillName` / `validatePurpose` / `validateSkillInfoForm` を Zod スキーマではなく TypeScript 純粋関数として実装した                                                                                                         |
| 利点       | ① `packages/shared` への Zod 依存追加なし ② 戻り値型（`SkillInfoFieldValidationResult` / `SkillInfoFormValidationResult`）が明示的で、呼び出し元の型推論が効く ③ テストが純粋な入出力検証で完結し、スキーマ定義とのズレが発生しない |
| 適用条件   | バリデーションルールが「文字数制限」「空白チェック」程度のシンプルなケースに有効。複雑な依存検証が必要な場合は Zod の方が保守性が高い                                                                                               |
| 関連タスク | UT-SKILL-WIZARD-W0-RUNTIME-VALIDATION-001                                                                                                                                                                                           |

---

## UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 教訓（2026-04-08）

### L-CRS-001: ConversationRoundStep semantic デフォルト正規化の設計的分散

| 項目         | 内容                                                                                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `normalizeSelectedOption()` の switch 文が q1/q3/q5/q6 の 4 ケースに分散しており、新しい `SmartDefaultResult` フィールドを追加する際に「型定義（`ConversationAnswers`）」「マッピング（`QUESTION_OPTION_VALUES`）」「switch 文」の 3 箇所を同時更新する必要がある    |
| 再発条件     | SmartDefaultResult のフィールドが増えるたびに normalizeSelectedOption の switch 文に新ケースを追加し忘れると、新フィールドのデフォルト値が正規化されずに raw 値のままUIラベルとして表示される                                                                        |
| 解決策       | 将来的には `SEMANTIC_LABEL_MAP: Record<QuestionKey, Record<string, string>>` のような宣言的マッピングテーブルに集約することで更新箇所を 1 箇所に削減できる。現在の switch 文は各 QuestionKey に対応するマッピングを 1 オブジェクトに統一する形にリファクタリング可能 |
| 標準ルール   | semantic デフォルト正規化ロジックは宣言的テーブルで管理し、新フィールド追加時はテーブル 1 箇所の更新で完結するよう設計する                                                                                                                                           |
| 関連タスク   | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                                                       |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                                                                                                                                                                                        |

### L-CRS-002: worktree と main ブランチの仕様書ステータス同期不整合

| 項目       | 内容                                                                                                                                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | main ブランチで完了済みのタスク（`ut-health-policy-runtime-injection`）の spec files が worktree 内に `spec_created` ステータスのまま残留した。worktree が別タスク専用に切られた際に main 側の完了状態が worktree に反映されないことが原因 |
| 再発条件   | worktree 作成後に main 側でタスクが完了し `docs/30-workflows/` から spec が削除・移動された場合、worktree では依然として旧 spec が存在し続ける                                                                                             |
| 解決策     | worktree 作成時（または作業開始時）に `docs/30-workflows/` の仕様書ステータスを `git diff main -- docs/30-workflows/` で main と照合する。main 側で削除済みの spec は worktree からも削除またはアーカイブへ移動する                        |
| 標準ルール | worktree 独立性を保ちつつ、Phase 1 のタスク開始時チェックとして「main ブランチでの完了済み spec の残留がないか」を確認する手順を追加する                                                                                                   |
| 関連タスク | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                             |
| 関連削除   | `docs/30-workflows/ut-health-policy-runtime-injection/` 削除（worktree 内残留解消）                                                                                                                                                        |

---

## W0-seq-02 SmartDefault推論サービス実装 教訓（2026-04-08）

### L-SMART-DEFAULT-001: inferSmartDefaults の三軸推論設計

- **苦戦箇所**: Slack / GitHub / Notion を判定するツール推論・タイミング推論・フォーマット推論の3軸が混在すると、テストケースの責務が不明確になる。
- **解決策**: `inferSmartDefaults()` を「ツール推論 → タイミング推論 → フォーマット推論」の順で直列パイプラインとし、各軸の推論を独立した private 関数に分離した。ユニットテスト33件はすべて軸単位のアサーション。
- **標準ルール**: 複数軸の推論を持つサービスは、軸ごとに private 関数を切り出し、統合関数はパイプライン呼び出しのみにする。テストは軸ごとに分割して責務を明確化する。
- **関連タスク**: W0-seq-02, UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001

### L-SMART-DEFAULT-002: SmartDefaultResult / SkillInfoFormData の root export 追加

- **状況**: `packages/shared/src/index.ts` への export 追加を後回しにしたため、renderer 側 import がコンパイルエラーになった。
- **解決策**: 共有型は実装と同ターンで `src/index.ts` に export する。
- **再発防止**: shared パッケージに新型を追加する際は Phase 2 設計成果物に root export 追加を必須 checklist として入れる。

---

## UT-HEALTH-POLICY-RUNTIME-INJECTION-001 healthPolicy DI注入 教訓（2026-04-08）

### L-HEALTH-DI-001: RuntimeSkillCreatorFacade への optional DI 追加パターン

- **苦戦箇所**: `RuntimeSkillCreatorFacade` のコンストラクタに `healthPolicy?: HealthPolicy` を追加する際、既存のテストが引数順序の変更で全壊するリスクがあった。
- **解決策**: 末尾 optional 引数として追加し、`RuntimePolicyResolver` の第3引数へ接続。既存テストは無変更で PASS。
- **標準ルール**: Facade への DI 追加は末尾 optional パラメータ優先。引数順序が固定された既存テストを壊さずに拡張できる。
- **関連タスク**: UT-HEALTH-POLICY-RUNTIME-INJECTION-001

### L-HEALTH-DI-002: improve/plan 両テストへの対称適用

- **状況**: `RuntimeSkillCreatorFacade.improve.test.ts` にのみ healthPolicy テストを追加し、`plan.test.ts` への対称追加を後回しにした。
- **教訓**: DI 対象が複数の operation（plan/improve）を持つ場合、同一ターンで両方のテストを更新しないと非対称状態が残る。

---

## W1-par-02a SkillInfoStep実装（DescribeStep再設計）教訓（2026-04-08）

### L-SKILL-INFO-STEP-001: DescribeStep → SkillInfoStep の破壊的改名理由

- **背景**: `DescribeStep` はウィザード Step 0 の役割を「説明入力」に限定した命名だったが、実際には skill名・カテゴリ・タグ等の複合情報入力フォームへと要件が拡張された。
- **解決策**: `SkillInfoStep` に改名し、フォームフィールドを `SkillInfoFormData` 型で一元管理。スクリーンショット証跡 TC-01〜TC-08 で UI 検証を実施。
- **標準ルール**: ウィザード Step コンポーネントの命名は「操作動詞（Describe）」ではなく「対象ドメイン（SkillInfo）」ベースにする。拡張時の改名コストを下げるため。
- **関連タスク**: W1-par-02a, UT-SKILL-WIZARD-W1-par-02a

### L-SKILL-INFO-STEP-002: arch-state-management-skill-creator.md の current facts 是正

- **状況**: `arch-state-management-skill-creator.md` に `generationMode` の古い記述と DescribeStep への参照が残り、仕様書と実装が乖離していた。
- **解決策**: 同ターンで `SkillInfoStep` への参照に更新し、current facts として是正。
- **再発防止**: コンポーネント改名時は arch-state-management 系ドキュメントを必ず同ターンで更新する。

---

## UT-SKILL-WIZARD-W2-seq-03b wizard exports 教訓（2026-04-08）

### L-WIZARD-EXPORT-001: barrel export の「今回の差分」と「既に廃止済み」を分けて記録する

- **苦戦箇所**: `wizard/index.ts` の export 整理で、`DescribeStep` の削除と `ConfigureStep` 系の既廃止を同じ粒度で書くと、実差分と履歴が混ざって見える。
- **解決策**: current diff では実際に変更した `DescribeStep` / `DescribeStepProps` と `SkillInfoStepProps` だけを明示し、`ConfigureStep` 系は「既に削除済み」と注記する。
- **標準ルール**: barrel export の記録は「今回の差分」「既存の廃止済み」「維持エクスポート」を分けて書き、実コードとの差分を 1 対 1 にする。

### L-WIZARD-EXPORT-002: NON_VISUAL の証跡は actual test case と no-op 記録を一致させる

- **苦戦箇所**: Phase 11 の証跡で、実際の 13 テスト内容と `@deprecated` JSDoc などの未検証項目が混ざると、再現時に証跡の信頼性が落ちる。
- **解決策**: 手動テスト結果・証跡インデックス・スクリーンショット計画を同じ語彙に揃え、UI 変更がない場合は `no-op` と明示する。
- **標準ルール**: NON_VISUAL タスクでは、screenshot を「不要」と書くだけでなく、代替証跡とテスト名を完全一致させる。

---

## Google Calendar スキル新規追加 教訓（2026-04-08）

### L-GOOGLE-CAL-001: サービスアカウント + Slack Webhook の複合認証設計

- **苦戦箇所**: Google Calendar API（サービスアカウント認証）と Slack API（Webhook URL）の2種類の認証方式を1スキルで管理する際、環境変数の命名規則と設定ガイドを分離しないと混乱が生じた。
- **解決策**: `references/google-calendar-setup.md` と `references/slack-setup.md` を別ファイルに分離し、各認証の設定手順を独立管理。`scripts/setup_check.js` で Phase 1 の環境確認を自動化した。
- **標準ルール**: 複数外部サービスを扱うスキルは、サービスごとに setup ガイドを別ファイルに分離する。単一 README に混在させない。

### L-GOOGLE-CAL-002: googleapis パッケージの pnpm workspace 配置

- **状況**: `googleapis ^144.0.0` を `.claude/skills/google/package.json` に配置したが、workspace の pnpm に認識されるか確認が必要だった。
- **解決策**: スキルディレクトリを独立 package として扱い、`node_modules` は `scripts/` 実行時に `pnpm install` で解決する設計とした。
- **適用**: Claude Code スキルでのみ使う外部 npm パッケージは、スキルディレクトリ直下の `package.json` に閉じ込める。

---

## UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001: SkillLifecyclePanel ウィザード遷移ボタン化

### L-WIZARD-001: 固定値プロンプトによる実行フロー安定化

| 項目       | 内容                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | UIのtextarea入力に依存した実行フローで、入力値の存在確認ロジックが複雑化していた                                                             |
| 原因       | `executionPrompt` stateを通じた自由入力を許可していたため、`canExecuteSkill`判定が3条件以上に肥大化                                          |
| 解決策     | `defaultExecutionPrompt`定数を導入し、UIからの入力を排除。`canExecuteSkill`を「アダプター正常・スキル選択済み・実行中でない」の3条件に簡約化 |
| 再発防止   | スキル実行フローの「入力値」は定数化を検討する。UIに入力欄を設けると条件分岐が増えるため、UIとロジックを早期に分離する                       |
| 関連タスク | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001                                                                                            |

### L-WIZARD-002: 責務別props分離パターン（ウィザード・スキル・設定の導線分離）

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | 画面遷移の導線が1つのcallbackに混在しそうになっていた                                                                                                            |
| 原因       | `onOpenWizard` / `onOpenSkillWizard` / `onOpenSettings` を同一propsにまとめようとしていた                                                                        |
| 解決策     | 導線の責務ごとにpropsを分離。`onOpenWizard`（新規スキル作成）、`onOpenSkillWizard`（既存スキルウィザード）、`onOpenSettings`（設定画面）を独立したpropとして定義 |
| 再発防止   | 複数の画面遷移が必要なコンポーネントは、遷移先の「責務」ごとにpropsを分割する。1つのcallbackで分岐するとテスタビリティが下がる                                   |
| 関連タスク | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001                                                                                                                |

### L-WIZARD-003: 部分完了タスクの引き継ぎ管理

| 項目       | 内容                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | 前タスク(PR#2036)で実装済みの要素（`skill-lifecycle-request-input`削除、ウィザードボタン追加）と、今タスクの新規作業（`skill-lifecycle-execution-input`削除）が混在し、Phase 1の現状分析が複雑化 |
| 原因       | タスク分割時に「前タスクのcarry-over要素」を明示するセクションがPhase 1にない                                                                                                                    |
| 解決策     | Phase 1の要件定義着手前に「前タスクのcurrent facts」を棚卸しし、今タスクで新規実施する作業との差異を明確化する                                                                                   |
| 再発防止   | Phase 1 requirement definitionに「前タスクcarry-over確認」セクションを追加する。`git log --oneline -5`と`current code`の照合を初手で行う                                                         |
| 関連タスク | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001                                                                                                                                                |

### L-WIZARD-004: describe.skip内の旧testid参照残存リスク

| 項目       | 内容                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `llm-generation.test.tsx` と `auth-regression.test.tsx` の `describe.skip` ブロック内に、削除済みtestid `skill-lifecycle-request-input` が残存 |
| 原因       | UIコンポーネントのtestidを変更・削除した際、`skip`されているテストファイルへの影響確認を省略していた                                           |
| 解決策     | testid削除時は`grep -r "testid名" --include="*.test.*"`で全テストファイルを検索し、skipブロック内の参照も確認する                              |
| 再発防止   | Phase 12準拠チェックに「削除したtestidがskipブロック内に残っていないか確認」を追加する。残存している場合はcleanupタスクをbacklogに登録する     |
| 関連タスク | UT-SKILL-WIZARD-W1-LIFECYCLE-PANEL-TRANSITION-001                                                                                              |

> 注記（2026-04-08 分離）:
>
> - UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 教訓（L-HP-001/002/003）と TASK-FIX-WORKTREE-CONFLICT-001 教訓（L-WC-001/002/003）は [lessons-learned-health-policy-worktree-2026-04.md](lessons-learned-health-policy-worktree-2026-04.md) へ移動しました。
> - スキルウィザード関連教訓（L-CRS-001/002, L-SMART-DEFAULT-001/002, L-HEALTH-DI-001/002, L-SKILL-INFO-STEP-001/002, L-WIZARD-EXPORT-001/002, L-GOOGLE-CAL-001/002）は [lessons-learned-skill-wizard-redesign.md](lessons-learned-skill-wizard-redesign.md) へ移動しました。
> - W3-seq-04 使用率計装教訓（L-W3-TRACK-001/002, L-WIZARD-LANE-CLEANUP-001）は [lessons-learned-w3-usage-tracking-2026-04.md](lessons-learned-w3-usage-tracking-2026-04.md) へ移動しました。

---
