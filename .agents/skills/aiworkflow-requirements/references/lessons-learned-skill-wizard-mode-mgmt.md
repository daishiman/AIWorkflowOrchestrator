# Lessons Learned — スキルウィザード mode 管理廃止（TASK-SW-FIX-MODE-MGMT-001）

> 親ファイル: [lessons-learned-current-2026-04.md](lessons-learned-current-2026-04.md)
> 完了日: 2026-04-14 / Wave B (TASK-SW-FIX-MODE-MGMT-001)

---

## L-MODE-001: state 廃止は 6 ステップで完結させる

| 項目       | 内容                                                                                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `generationMode` / `hasActivatedLlmMode` の二重フラグを削除しようとした際、state 削除だけでは UI・props・呼び出し側への残骸が残りビルドエラーになった |
| 原因       | state の削除だけを行い、UI 側（ラジオボタン JSX）・props 型定義・呼び出し側コードの追跡が不完全だった                                                 |
| 解決策     | 廃止 6ステップを順に完結させる: ① state 削除 → ② UI 削除 → ③ props 型削除 → ④ 呼び出し側修正 → ⑤ grep で残存確認 → ⑥ DOM query で動的確認             |
| 標準ルール | state 廃止タスクでは必ず 6ステップを明示的に計画し、各ステップを phase 仕様書の完了条件に列挙する                                                     |
| 関連タスク | TASK-SW-FIX-MODE-MGMT-001                                                                                                                             |

---

## L-MODE-002: TC-06 型の動的廃止検証テストを廃止系タスクの標準に組み込む

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | grep による静的解析で残存参照ゼロを確認しても、実行時 DOM に旧要素が残るケースを見落とすリスクがあった                                                           |
| 原因       | 静的解析は「コード上に文字列がない」ことを確認するが、条件付きレンダリングや動的生成の残骸はコンパイル時には見えない                                             |
| 解決策     | TC-06 として DOM query テストを追加: `document.querySelectorAll('input[name="generationMode"]')` で 0件を assert する。grep ゼロ確認と合わせて多層防御を構成する |
| 実装例     | `const radioInputs = document.querySelectorAll('input[name="generationMode"]'); expect(radioInputs).toHaveLength(0);`                                            |
| 標準ルール | 廃止系タスクでは「静的解析（grep）+ 動的テスト（DOM query）」の 2 層確認を必須とする。TC-06 型テストケースを Phase 2 テスト設計に含める                          |
| 汎用性     | `input[name="旧フラグ名"]`、`data-testid="旧コンポーネント"`、`class="旧CSS名"` 等、任意の廃止要素に適用可能                                                     |
| 関連タスク | TASK-SW-FIX-MODE-MGMT-001                                                                                                                                        |

---

## L-MODE-003: Wave 分割実施では TDD Red フェーズを Wave A・B 同時設計する

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | Wave A（実装完了後）に Wave B で Phase 4（TDD Red フェーズ）を実施しようとしたが、実装済みのため Red 状態を作れず、TDD サイクルが機能しなかった                  |
| 原因       | Wave 計画時に Phase 4 の位置を Wave A・B 間で調整せず、Wave B 側で TDD を開始した                                                                                |
| 解決策     | Wave A（実装）と Wave B（テスト）を同時に計画する際、Phase 4（TDD Red）を Wave A 開始前に配置し、実装未完状態でテストを書いて Red を確認してから Wave A を進める |
| 制約       | Wave A 完了後に Wave B を開始するパターンでは TDD の Red フェーズが成立しない。計画時点で明示的にスケジュールに織り込む必要がある                                |
| 標準ルール | Wave 分割タスクでは Phase 2（テスト設計）と Phase 4（TDD Red）を Wave A 開始前に完了させ、Red 確認の証跡を残す                                                   |
| 関連タスク | TASK-SW-FIX-MODE-MGMT-001                                                                                                                                        |

---

## L-MODE-004: Electron 実機なしでの視覚証跡の多層防御

| 項目       | 内容                                                                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | Electron 実機起動環境が限定される状況で、視覚的な変更（ラジオボタン削除）の証跡が不足するリスクがあった                                                      |
| 原因       | スクリーンショット取得が Electron 起動を前提としており、CI や worktree 環境では取得困難なケースがある                                                        |
| 解決策     | 以下 4 層の組み合わせで視覚証跡を代替した: ① 36/36 UT PASS（DOM レンダリング確認） ② grep ゼロ確認 ③ TC-06 DOM query ④ TypeScript typecheck PASS             |
| 標準ルール | Electron 実機起動が困難な場合、UT 数・grep 確認・DOM query・typecheck の 4 点証跡セットを Phase 11 成果物として記録する。これを「NON_VISUAL 証跡」と定義する |
| 関連タスク | TASK-SW-FIX-MODE-MGMT-001                                                                                                                                    |

---

## L-MODE-005: SkillCreateWizard の確定フロー（本タスク後の正規仕様）

| 項目        | 内容                                                                                                     |
| ----------- | -------------------------------------------------------------------------------------------------------- |
| 確定フロー  | Step 0（SkillInfoStep）→ Step 1（ConversationRoundStep）→ Step 2（GenerateStep）→ Step 3（CompleteStep） |
| 廃止要素    | `generationMode` state、`hasActivatedLlmMode` state、ラジオボタン UI、`goToStep(2)` 分岐                 |
| 確立要素    | `handleStep0Next = () => goNext()` のみ（分岐なし）、LLM 専用モード一本化                                |
| Wave C 前提 | Step 1 への遷移正規化完了・generationMode 分岐除去済み（TASK-SW-FIX-STATE-DETAIL-001 着手可能）          |
| 標準ルール  | SkillCreateWizard のフロー変更時はこの確定フロー図を参照し、分岐追加を禁止する                           |
| 関連タスク  | TASK-SW-FIX-MODE-MGMT-001（Wave B）/ TASK-SW-FIX-DATAFLOW-001（Wave A）                                  |
