# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 1                                              |
| Phase名    | 要件定義                                       |
| 前提Phase  | -                                              |
| 後続Phase  | Phase 2                                        |
| ステータス | completed                                      |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |
| タスクID   | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 |

---

## 目的

タスクの受入条件、タスク分類、コードインベントリを確定する。
本タスクは新規 UI コンポーネントの実装に加えて、`ConfigureStep.tsx` から `ConversationRoundStep.tsx` への置換と wizard export 更新を含む。
既存コードの参照パターン・型定義・UI ウィジェットの確認と、削除対象の参照残りをゼロにすることが最重要となる。

---

## タスク分類（Phase 1 時点）

- **タスク種別**: NON_VISUAL タスク（Renderer 内部実装のみ / 視覚差分なし）
- **影響 Process**: Renderer（ブラウザ環境）
- **新規追加コンポーネント**: `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`
- **参照する既存型**: `ConversationAnswers`、`SmartDefaultResult`、`QuestionAnswer`（`@repo/shared`）
- **参照する既存 API**: `inferSmartDefaults()`（`@repo/shared`）

---

## Step 0: P50チェック【必須】

Phase 1 開始前に、対象ファイルと依存型の存在を確認する。

```bash
# 型定義の確認
grep -n "ConversationAnswers\|SmartDefaultResult\|QuestionAnswer\|SkillWizardScheduleConfig" \
  packages/shared/src/types/skillCreator.ts

# inferSmartDefaults の公開確認
grep -n "inferSmartDefaults" \
  packages/shared/src/services/skillCreator/index.ts

# 既存ウィザードコンポーネントの確認
ls apps/desktop/src/renderer/components/skill/wizard/

# ConversationRoundStep の既存確認
ls apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx 2>/dev/null \
  && echo "EXISTS" || echo "NOT FOUND"

# 既存インタビューウィジェットの確認
ls apps/desktop/src/renderer/components/skill/interview-widgets/
```

---

## 実行タスク

### タスク1: コードインベントリ確認

**目的**: 依存型・API・既存コンポーネントを把握する

**実行手順**:

1. `packages/shared/src/types/skillCreator.ts` で `ConversationAnswers`、`SmartDefaultResult`、`QuestionAnswer`、`SkillWizardScheduleConfig` の型定義を精読する
2. `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts` で `inferSmartDefaults()` の入力・出力・null フォールバック挙動を確認する
3. `apps/desktop/src/renderer/components/skill/wizard/` 配下の既存ステップコンポーネント（`SkillInfoStep.tsx`、`ConfigureStep.tsx`）と `wizard/index.ts` の export パターンを参照する
4. `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` と `apps/desktop/src/renderer/components/skill/InterviewProgressBar.tsx` の実装を参照し、既存の質問表示 UI パターンと進捗表示パターンを把握する
5. `apps/desktop/src/renderer/components/skill/interview-widgets/` の利用可能ウィジェットを確認する

**期待される成果物**:

- `outputs/phase-1/code-inventory.md` — 参照対象ファイル一覧

---

### タスク2: 受入条件（AC）の確定

**目的**: Phase 全体を通じて満たすべき受入条件を明文化する

**受入条件（AC）**:

| AC    | 内容                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------------------------------- |
| AC-1  | `ConversationRoundStep` コンポーネントが `apps/desktop/src/renderer/components/skill/wizard/` に存在する            |
| AC-2  | Props として `smartDefaults: SmartDefaultResult` と `onComplete: (answers: ConversationAnswers) => void` を受け取る |
| AC-3  | 6問（Q1〜Q6）が「質問N/6」形式の進捗インジケーターとともに表示される                                                |
| AC-4  | ページ 1 には Q1〜Q3、ページ 2 には Q4〜Q6 が表示される                                                             |
| AC-5  | `smartDefaults` の各フィールドが対応する質問の初期値（プリフィル）として表示される                                  |
| AC-6  | `smartDefaults` のフィールドが `null` の場合、該当質問は空欄（未選択 / 空文字）で表示される                         |
| AC-7  | ページ 1 の「次へ」ボタン押下でページ 2 に遷移する                                                                  |
| AC-8  | ページ 2 の「完了」ボタン押下で `onComplete(answers)` が呼ばれる                                                    |
| AC-9  | `onComplete` には現時点の `ConversationAnswers` 型の回答データが渡される                                            |
| AC-10 | `pnpm --filter @repo/desktop typecheck` が PASS する                                                                |
| AC-11 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` が PASS する           |
| AC-12 | ページ 1 の「戻る」ボタン押下で `onBack` が呼ばれる                                                                 |
| AC-13 | `ConfigureStep.tsx` が削除され、`WizardOptions` 参照が `rg` で 0 件である                                           |

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md` — AC-1〜AC-13 一覧

---

### タスク3: スコープ確定

**目的**: 変更対象ファイルと変更外ファイルを明確にする

**含むもの（スコープ内）**:

- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` の新規作成（Step 1 コンポーネント本体）
- 6問（Q1〜Q6）の質問定義と選択肢の定義
- ページング状態管理（ページ 1/2 の切り替え）
- 「質問N/6」進捗インジケーターの表示
- `inferSmartDefaults()` の結果をプリフィル値として反映するロジック
- `null` フォールバックハンドリング（null の場合は空欄 / プレースホルダー表示）
- `ConversationAnswers` 型の回答状態管理と親への callback
- ページ 1 の戻る導線（`onBack` が渡された場合のみ表示）
- `apps/desktop/src/renderer/components/skill/wizard/index.ts` の export 更新（`ConversationRoundStep` 追加）
- `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx` の削除
- `WizardOptions` 参照の削除（`rg` で 0 件確認）
- 対応するユニットテスト（`apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`）

**含まないもの（スコープ外）**:

- Q3 スケジュール設定 UI の詳細実装（別タスク候補）
- Step 0（`SkillInfoStep.tsx`）の実装（W1-par-02a が担当）
- Step 2（`CompleteStep.tsx`）の実装（W1-par-02c が担当）
- アニメーション・トランジション効果（別タスク候補）

**成果物ファイル**:

| 種別     | ファイル                                                                                     |
| -------- | -------------------------------------------------------------------------------------------- |
| 新規作成 | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                |
| 新規作成 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` |
| 削除     | `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`                        |

**期待される成果物**:

- `outputs/phase-1/scope-definition.md` — スコープ定義書

---

## 参照資料

| 資料名                               | パス                                                                                  | 説明                                     |
| ------------------------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------- |
| 型定義（ConversationAnswers 等）     | `packages/shared/src/types/skillCreator.ts`                                           | ConversationAnswers / SmartDefaultResult |
| inferSmartDefaults 実装              | `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`           | 推論 API（null フォールバック動作）      |
| inferSmartDefaults public export     | `packages/shared/src/services/skillCreator/index.ts`                                  | @repo/shared からの export 経路          |
| 既存進捗バー                         | `apps/desktop/src/renderer/components/skill/InterviewProgressBar.tsx`                 | 既存表示コンポーネント                   |
| 既存ウィザードコンポーネント（参考） | `apps/desktop/src/renderer/components/skill/wizard/`                                  | 実装パターン参照                         |
| 既存 wizard export 集約              | `apps/desktop/src/renderer/components/skill/wizard/index.ts`                          | export 接続点                            |
| ConversationalInterview（参考）      | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`              | 既存質問 UI パターン                     |
| interview-widgets（参考）            | `apps/desktop/src/renderer/components/skill/interview-widgets/`                       | SingleSelectChips 等のウィジェット       |
| skill-wizard-redesign-lane 設計根拠  | `docs/30-workflows/skill-wizard-redesign-lane/index.md`                               | Wave 設計全体像                          |
| unassigned task 仕様書（元仕様）     | `docs/30-workflows/unassigned-task/UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001.md` | 詳細仕様参照                             |

---

## 成果物

| 成果物               | 配置先                                   | 形式     |
| -------------------- | ---------------------------------------- | -------- |
| 受入条件ドキュメント | `outputs/phase-1/acceptance-criteria.md` | Markdown |
| コードインベントリ   | `outputs/phase-1/code-inventory.md`      | Markdown |
| スコープ定義書       | `outputs/phase-1/scope-definition.md`    | Markdown |

---

## 完了条件

- [ ] P50チェックを実行し、型定義・API・既存コンポーネントの存在を確認済みであること
- [ ] AC-1〜AC-13 が全て定義・文書化されていること
- [ ] NON_VISUAL タスクとして分類されていることが記録されていること
- [ ] 変更対象ファイル一覧（新規作成 2種）が確定していること
- [ ] `outputs/phase-1/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

Phase 1 完了時に以下を確認して記録すること:

- [ ] T-01-1: P50チェック（型定義・API の存在確認）実行済み
- [ ] T-01-2: AC-1〜AC-13 を `outputs/phase-1/acceptance-criteria.md` に記録済み
- [ ] T-01-3: コードインベントリを `outputs/phase-1/code-inventory.md` に記録済み
- [ ] T-01-4: スコープを `outputs/phase-1/scope-definition.md` に記録済み

---

## 次Phase

**Phase 2: 設計** — Props インターフェース・状態管理・質問定義定数・プリフィル変換純粋関数を設計する。

**ゲート条件**: Phase 1 の全完了条件を満たさない場合、Phase 2 へ進まないこと。
