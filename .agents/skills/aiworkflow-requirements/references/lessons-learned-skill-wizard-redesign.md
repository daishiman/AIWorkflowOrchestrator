# Lessons Learned: Skill Wizard Redesign (W2-seq-03a)

> 区分: 教訓記録（lessons-learned）
> タスクID: UT-SKILL-WIZARD-W2-seq-03a
> 完了日: 2026-04-08

---

## タスク概要

| 項目         | 値                                                                  |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-W2-seq-03a                                          |
| 完了日       | 2026-04-08                                                          |
| ステータス   | Phase 12 完了 / Phase 13 blocked                                    |
| 対象ファイル | `SkillCreateWizard.tsx`, `GenerateStep.tsx`, `CompleteStep.tsx`     |
| 成果物       | `docs/30-workflows/completed-tasks/W2-seq-03a-skill-create-wizard/` |

---

## 実装パターン（将来参照用）

### Pattern 1: Smart Default Inference（大小文字不問推論）

```typescript
const purposeLower = formData.purpose.toLowerCase();
if (purposeLower.includes('slack')) return { tool: 'slack', ... };
if (purposeLower.includes('github')) return { tool: 'github', ... };
if (purposeLower.includes('notion')) return { tool: 'notion', ... };
```

- 文字列判定は必ず `toLowerCase()` してから `includes()` で検索する
- 大文字 `Slack` / 小文字 `slack` / 混在 `SLACK` のすべてを同等に扱う
- scheduled / realtime / code / structured も同様のパターンで判定

### Pattern 2: State Reset with Preservation（formData保持・生成結果リセット）

`handleRetry()` では以下の分離方針を採用：

- **保持する state**: `formData`（ユーザー入力）
- **リセットする state**: `answers`, `skillPath`, `generationError`

```typescript
const handleRetry = () => {
  // formDataは保持（ユーザー入力を損なわない）
  setAnswers(null);
  setSkillPath(null);
  setGenerationError(null);
  setCurrentStep(STEP_GENERATE); // 生成ステップに戻る
};
```

UXを損なわずリトライ可能にするパターン。ユーザーが入力した情報を再入力させない。

### Pattern 3: Double-call Prevention（二重呼び出し防止）

`generationLockRef`（`useRef`）と `isGenerating`（`useState`）の両方で防止：

```typescript
const generationLockRef = useRef(false);
const [isGenerating, setIsGenerating] = useState(false);

const handleGenerate = async (method: GenerationMethod) => {
  if (generationLockRef.current) return; // Ref: レンダリング非同期に安全
  generationLockRef.current = true;
  setIsGenerating(true); // State: 表示制御（ボタン無効化など）に使用
  try {
    // ...生成処理...
  } finally {
    generationLockRef.current = false;
    setIsGenerating(false);
  }
};
```

- `useRef` はレンダリングサイクルに依存せず即時参照可能（非同期競合に安全）
- `useState` はUIの表示制御（ボタン `disabled` など）にのみ使用
- 両者を組み合わせることで、非同期処理中のUI整合性を保証

### Pattern 4: Wizard Orchestration State（複数 state の責務分離）

```typescript
// Step 0: ユーザー入力
const [formData, setFormData] = useState<SkillInfoFormData | null>(null);
// Step 1: スマートデフォルト（formDataから自動推論）
const [smartDefaults, setSmartDefaults] = useState<SmartDefaultResult | null>(
  null,
);
// Step 2: 生成結果（LLM応答）
const [answers, setAnswers] = useState<ConversationAnswers | null>(null);
// Complete: 保存パス
const [skillPath, setSkillPath] = useState<string | null>(null);
```

各 state の責務を明確に分離し、ステップ間のデータフローを一方向に保つ。

### Pattern 5: Conditional External Integration Display（条件付き外部連携表示）

```typescript
// CompleteStep内
const hasExternalIntegration = !!resolveExternalIntegration(formData);
const externalToolName = resolveExternalIntegration(formData)?.toolName ?? null;
```

- `hasExternalIntegration` フラグで外部連携セクションの表示/非表示を制御
- `externalToolName` で「Slack連携が設定されています」などの具体的メッセージ表示

---

## 苦戦箇所

| #   | 苦戦箇所                                  | 再発条件                                     | 解決策                                                 |
| --- | ----------------------------------------- | -------------------------------------------- | ------------------------------------------------------ |
| 1   | `inferSmartDefaults()` の大小文字不問対応 | 自然言語入力を文字列判定する場合             | `toLowerCase()` してから `includes()` を使う           |
| 2   | `handleGenerate` の二重呼び出し           | ユーザーが連打した場合や非同期処理が遅い場合 | `generationLockRef` + `isGenerating` の二重ガード      |
| 3   | `handleRetry` でどの state を保持するか   | リトライ時のUX設計                           | ユーザー入力（`formData`）を保持、生成結果のみリセット |
| 4   | テスト名の表現ゆれ                        | テストケース追加時                           | 「リトライ」に統一（「復帰」「やり直し」は使わない）   |

---

## 非ブロッカー改善候補（skill-feedback-report.md より）

### 1. resolveExternalIntegration() のツール名対応表を定数に切り出す

現状は `if-else` や `switch` で判定しているが、ツール名と判定条件の対応表を定数 `EXTERNAL_TOOL_MAP` として切り出すと追加・変更が安全になる。

```typescript
// 例: 切り出し後のイメージ
const EXTERNAL_TOOL_MAP: Array<{ keyword: string; toolName: string }> = [
  { keyword: "slack", toolName: "Slack" },
  { keyword: "github", toolName: "GitHub" },
  { keyword: "notion", toolName: "Notion" },
];
```

### 2. テスト名の「復帰」「やり直し」「リトライ」表現を統一

現状のテスト名に表現ゆれがある。今後は「リトライ」に統一する。

```typescript
// 推奨
it("リトライ時にformDataを保持し生成結果をリセットする");
// 非推奨
it("復帰時にformDataを保持する"); // "復帰" は使わない
it("やり直し後に..."); // "やり直し" は使わない
```

### 3. Phase 11 証跡スクリーンショットの命名規則（TC-11-xx-...形式）を明文化

`skillPath` 表示確認や外部連携チェックリスト確認の画像は重要証跡。
命名規則を task spec や index.md に記載する。

```
TC-11-01-complete-step-skill-path-display.png
TC-11-02-complete-step-external-integration.png
TC-11-03-generate-step-retry-button.png
```

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
| 項目         | 内容                                                                                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `normalizeSelectedOption()` の switch 文が q1/q3/q5/q6 の 4 ケースに分散しており、新しい `SmartDefaultResult` フィールドを追加する際に「型定義（`ConversationAnswers`）」「マッピング（`QUESTION_OPTION_VALUES`）」「switch 文」の 3 箇所を同時更新する必要がある    |
| 再発条件     | SmartDefaultResult のフィールドが増えるたびに normalizeSelectedOption の switch 文に新ケースを追加し忘れると、新フィールドのデフォルト値が正規化されずに raw 値のままUIラベルとして表示される                                                                        |
| 解決策       | 将来的には `SEMANTIC_LABEL_MAP: Record<QuestionKey, Record<string, string>>` のような宣言的マッピングテーブルに集約することで更新箇所を 1 箇所に削減できる。現在の switch 文は各 QuestionKey に対応するマッピングを 1 オブジェクトに統一する形にリファクタリング可能 |
| 標準ルール   | semantic デフォルト正規化ロジックは宣言的テーブルで管理し、新フィールド追加時はテーブル 1 箇所の更新で完結するよう設計する                                                                                                                                           |
| 関連タスク   | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                                                       |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                                                                                                                                                                                        |
| 項目         | 内容                                                                                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `normalizeSelectedOption()` の switch 文が q1/q3/q5/q6 の 4 ケースに分散しており、新しい `SmartDefaultResult` フィールドを追加する際に「型定義（`ConversationAnswers`）」「マッピング（`QUESTION_OPTION_VALUES`）」「switch 文」の 3 箇所を同時更新する必要がある    |
| 再発条件     | SmartDefaultResult のフィールドが増えるたびに normalizeSelectedOption の switch 文に新ケースを追加し忘れると、新フィールドのデフォルト値が正規化されずに raw 値のままUIラベルとして表示される                                                                        |
| 解決策       | 将来的には `SEMANTIC_LABEL_MAP: Record<QuestionKey, Record<string, string>>` のような宣言的マッピングテーブルに集約することで更新箇所を 1 箇所に削減できる。現在の switch 文は各 QuestionKey に対応するマッピングを 1 オブジェクトに統一する形にリファクタリング可能 |
| 標準ルール   | semantic デフォルト正規化ロジックは宣言的テーブルで管理し、新フィールド追加時はテーブル 1 箇所の更新で完結するよう設計する                                                                                                                                           |
| 関連タスク   | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                                                       |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                                                                                                                                                                                        |
| 項目         | 内容                                                                                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題         | `normalizeSelectedOption()` の switch 文が q1/q3/q5/q6 の 4 ケースに分散しており、新しい `SmartDefaultResult` フィールドを追加する際に「型定義（`ConversationAnswers`）」「マッピング（`QUESTION_OPTION_VALUES`）」「switch 文」の 3 箇所を同時更新する必要がある    |
| 再発条件     | SmartDefaultResult のフィールドが増えるたびに normalizeSelectedOption の switch 文に新ケースを追加し忘れると、新フィールドのデフォルト値が正規化されずに raw 値のままUIラベルとして表示される                                                                        |
| 解決策       | 将来的には `SEMANTIC_LABEL_MAP: Record<QuestionKey, Record<string, string>>` のような宣言的マッピングテーブルに集約することで更新箇所を 1 箇所に削減できる。現在の switch 文は各 QuestionKey に対応するマッピングを 1 オブジェクトに統一する形にリファクタリング可能 |
| 標準ルール   | semantic デフォルト正規化ロジックは宣言的テーブルで管理し、新フィールド追加時はテーブル 1 箇所の更新で完結するよう設計する                                                                                                                                           |
| 関連タスク   | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                                                       |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                                                                                                                                                                                        |
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

## UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 教訓（2026-04-11）

### L-SKIP-001: `describe.skip` 内 testid の CI 非検出問題

| 項目             | 内容                                                                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001                                                                                                                                                                           |
| 課題             | UI リファクタリング（`skill-lifecycle-request-input` textarea → 遷移ボタン化）後、削除した testid への参照が `describe.skip` ブロック内に残存していた。CI はスキップブロックを実行しないため、旧参照が無音で残り続ける |
| 再現条件         | testid を削除・改名する UI 変更時に、`describe.skip` で囲まれたテストブロックが存在する場合                                                                                                                            |
| 解決策           | testid 削除後に `grep -rn "削除したtestid" apps/desktop/src/renderer/components/` でスキップブロック内を含む全参照を確認し、残存していれば同一 wave で削除する                                                         |
| 標準ルール       | testid 削除・改名タスクでは Phase 5 完了チェックとして `grep -rn` による全参照確認を必須にする。`describe.skip` は CI から見えない「死角」であり、スキップブロック内の旧参照は next cleanup タスクに積み残されやすい   |
| 影響ファイル     | `SkillLifecyclePanel.llm-generation.test.tsx`（11 箇所削除）、`SkillLifecyclePanel.auth-regression.test.tsx`（fillCreateRequest を no-op 化）                                                                          |
| 削除フィクスチャ | `indexes-skill/SKILL.md`（用途廃止のフィクスチャスキル）                                                                                                                                                               |

### L-SKIP-002: NON_VISUAL タスクの describe.skip 内 cleanup チェックリスト不在

| 項目       | 内容                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Phase 5（実装）の完了チェックリストに「削除 testid の describe.skip 内残存確認」が明示されておらず、FB-02 として Phase 12 で初めて検出された |
| 解決策     | Phase 5 仕様書テンプレートに「testid 削除タスクの場合、`grep -rn "<削除testid>" apps/` でスキップブロック内残存を確認する」を追加する        |
| 関連スキル | task-specification-creator Phase 5 チェックリスト / patterns-lessons-and-pitfalls.md                                                         |

---

## UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 教訓（2026-04-08）

### L-CRS-001: ConversationRoundStep semantic デフォルト正規化の設計的分散

| 項目       | 内容                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `normalizeSelectedOption()` の switch 文が q1/q3/q5/q6 の 4 ケースに分散しており、新しい `SmartDefaultResult` フィールドを追加する際に「型定義（`ConversationAnswers`）」「マッピング（`QUESTION_OPTION_VALUES`）」「switch 文」の 3 箇所を同時更新する必要がある |
| 再発条件   | SmartDefaultResult のフィールドが増えるたびに normalizeSelectedOption の switch 文に新ケースを追加し忘れると、新フィールドのデフォルト値が正規化されずに raw 値のままUIラベルとして表示される                                                   |
| 解決策     | 将来的には `SEMANTIC_LABEL_MAP: Record<QuestionKey, Record<string, string>>` のような宣言的マッピングテーブルに集約することで更新箇所を 1 箇所に削減できる。現在の switch 文は各 QuestionKey に対応するマッピングを 1 オブジェクトに統一する形にリファクタリング可能 |
| 標準ルール | semantic デフォルト正規化ロジックは宣言的テーブルで管理し、新フィールド追加時はテーブル 1 箇所の更新で完結するよう設計する                                                                                                                      |
| 関連タスク | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                               |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                                                                                                                                                               |

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

## UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 教訓（2026-04-11）

### L-SKIP-001: `describe.skip` 内 testid の CI 非検出問題

| 項目             | 内容                                                                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001                                                                                                                                                                           |
| 課題             | UI リファクタリング（`skill-lifecycle-request-input` textarea → 遷移ボタン化）後、削除した testid への参照が `describe.skip` ブロック内に残存していた。CI はスキップブロックを実行しないため、旧参照が無音で残り続ける |
| 再現条件         | testid を削除・改名する UI 変更時に、`describe.skip` で囲まれたテストブロックが存在する場合                                                                                                                            |
| 解決策           | testid 削除後に `grep -rn "削除したtestid" apps/desktop/src/renderer/components/` でスキップブロック内を含む全参照を確認し、残存していれば同一 wave で削除する                                                         |
| 標準ルール       | testid 削除・改名タスクでは Phase 5 完了チェックとして `grep -rn` による全参照確認を必須にする。`describe.skip` は CI から見えない「死角」であり、スキップブロック内の旧参照は next cleanup タスクに積み残されやすい   |
| 影響ファイル     | `SkillLifecyclePanel.llm-generation.test.tsx`（11 箇所削除）、`SkillLifecyclePanel.auth-regression.test.tsx`（fillCreateRequest を no-op 化）                                                                          |
| 削除フィクスチャ | `indexes-skill/SKILL.md`（用途廃止のフィクスチャスキル）                                                                                                                                                               |

### L-SKIP-002: NON_VISUAL タスクの describe.skip 内 cleanup チェックリスト不在

| 項目       | 内容                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Phase 5（実装）の完了チェックリストに「削除 testid の describe.skip 内残存確認」が明示されておらず、FB-02 として Phase 12 で初めて検出された |
| 解決策     | Phase 5 仕様書テンプレートに「testid 削除タスクの場合、`grep -rn "<削除testid>" apps/` でスキップブロック内残存を確認する」を追加する        |
| 関連スキル | task-specification-creator Phase 5 チェックリスト / patterns-lessons-and-pitfalls.md                                                         |

---

## UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 教訓（2026-04-08）

### L-CRS-001: ConversationRoundStep semantic デフォルト正規化の設計的分散

| 項目       | 内容                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `normalizeSelectedOption()` の switch 文が q1/q3/q5/q6 の 4 ケースに分散しており、新しい `SmartDefaultResult` フィールドを追加する際に「型定義（`ConversationAnswers`）」「マッピング（`QUESTION_OPTION_VALUES`）」「switch 文」の 3 箇所を同時更新する必要がある |
| 再発条件   | SmartDefaultResult のフィールドが増えるたびに normalizeSelectedOption の switch 文に新ケースを追加し忘れると、新フィールドのデフォルト値が正規化されずに raw 値のままUIラベルとして表示される                                                   |
| 解決策     | 将来的には `SEMANTIC_LABEL_MAP: Record<QuestionKey, Record<string, string>>` のような宣言的マッピングテーブルに集約することで更新箇所を 1 箇所に削減できる。現在の switch 文は各 QuestionKey に対応するマッピングを 1 オブジェクトに統一する形にリファクタリング可能 |
| 標準ルール | semantic デフォルト正規化ロジックは宣言的テーブルで管理し、新フィールド追加時はテーブル 1 箇所の更新で完結するよう設計する                                                                                                                      |
| 関連タスク | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                               |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                                                                                                                                                               |

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

## UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 教訓（2026-04-11）

### L-SKIP-001: `describe.skip` 内 testid の CI 非検出問題

| 項目             | 内容                                                                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001                                                                                                                                                                           |
| 課題             | UI リファクタリング（`skill-lifecycle-request-input` textarea → 遷移ボタン化）後、削除した testid への参照が `describe.skip` ブロック内に残存していた。CI はスキップブロックを実行しないため、旧参照が無音で残り続ける |
| 再現条件         | testid を削除・改名する UI 変更時に、`describe.skip` で囲まれたテストブロックが存在する場合                                                                                                                            |
| 解決策           | testid 削除後に `grep -rn "削除したtestid" apps/desktop/src/renderer/components/` でスキップブロック内を含む全参照を確認し、残存していれば同一 wave で削除する                                                         |
| 標準ルール       | testid 削除・改名タスクでは Phase 5 完了チェックとして `grep -rn` による全参照確認を必須にする。`describe.skip` は CI から見えない「死角」であり、スキップブロック内の旧参照は next cleanup タスクに積み残されやすい   |
| 影響ファイル     | `SkillLifecyclePanel.llm-generation.test.tsx`（11 箇所削除）、`SkillLifecyclePanel.auth-regression.test.tsx`（fillCreateRequest を no-op 化）                                                                          |
| 削除フィクスチャ | `indexes-skill/SKILL.md`（用途廃止のフィクスチャスキル）                                                                                                                                                               |

### L-SKIP-002: NON_VISUAL タスクの describe.skip 内 cleanup チェックリスト不在

| 項目       | 内容                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Phase 5（実装）の完了チェックリストに「削除 testid の describe.skip 内残存確認」が明示されておらず、FB-02 として Phase 12 で初めて検出された |
| 解決策     | Phase 5 仕様書テンプレートに「testid 削除タスクの場合、`grep -rn "<削除testid>" apps/` でスキップブロック内残存を確認する」を追加する        |
| 関連スキル | task-specification-creator Phase 5 チェックリスト / patterns-lessons-and-pitfalls.md                                                         |

---

## UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 実装知見（2026-04-11）

### L-ICON-001: native title 属性の screenshot キャプチャには overlay 注入が必要

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | `title` 属性で実装した tooltip が Playwright / Puppeteer の screenshot に映らない |
| 原因       | ブラウザ native UI（OSレンダリング）はスクリーンショットAPI外にあるため capture 不可 |
| 解決策     | capture script 内で `title` の値を読んで DOM に一時 overlay 要素を注入し、screenshot 後に除去 |
| 再発防止   | Phase 11 evidence が必要な UI tooltip は、capture script 側で overlay プロキシを用意する |
| 関連タスク | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |

### L-ICON-002: 複合ボタン（icon + label）のテストは within(button) で構造を固定する

| 項目       | 内容 |
| ---------- | ---- |
| 症状       | カテゴリボタン内に `<span aria-hidden>⚡</span><span>自動化</span>` が含まれると、`getByRole("button")` で icon テキストと label が混在しマッチが不安定になる |
| 原因       | `screen.getByText()` はグローバル検索のため、button 内の span と button 外のテキストが衝突する |
| 解決策     | `const btn = screen.getByRole("button", { name: /自動化/ }); within(btn).getByText("⚡")` のように `within(button)` スコープで検証する |
| 再発防止   | icon + label の複合ボタンコンポーネントのテストは、必ず `within(element)` でスコープを絞る |
| 関連タスク | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |

---

## UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001 教訓（2026-04-08）

### L-CRS-001: ConversationRoundStep semantic デフォルト正規化の設計的分散

| 項目       | 内容                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `normalizeSelectedOption()` の switch 文が q1/q3/q5/q6 の 4 ケースに分散しており、新しい `SmartDefaultResult` フィールドを追加する際に「型定義（`ConversationAnswers`）」「マッピング（`QUESTION_OPTION_VALUES`）」「switch 文」の 3 箇所を同時更新する必要がある |
| 再発条件   | SmartDefaultResult のフィールドが増えるたびに normalizeSelectedOption の switch 文に新ケースを追加し忘れると、新フィールドのデフォルト値が正規化されずに raw 値のままUIラベルとして表示される                                                   |
| 解決策     | 将来的には `SEMANTIC_LABEL_MAP: Record<QuestionKey, Record<string, string>>` のような宣言的マッピングテーブルに集約することで更新箇所を 1 箇所に削減できる。現在の switch 文は各 QuestionKey に対応するマッピングを 1 オブジェクトに統一する形にリファクタリング可能 |
| 標準ルール | semantic デフォルト正規化ロジックは宣言的テーブルで管理し、新フィールド追加時はテーブル 1 箇所の更新で完結するよう設計する                                                                                                                      |
| 関連タスク | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                               |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                                                                                                                                                               |

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

## UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001 教訓（2026-04-11）

### L-SKIP-001: `describe.skip` 内 testid の CI 非検出問題

| 項目             | 内容                                                                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID         | UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001                                                                                                                                                                           |
| 課題             | UI リファクタリング（`skill-lifecycle-request-input` textarea → 遷移ボタン化）後、削除した testid への参照が `describe.skip` ブロック内に残存していた。CI はスキップブロックを実行しないため、旧参照が無音で残り続ける |
| 再現条件         | testid を削除・改名する UI 変更時に、`describe.skip` で囲まれたテストブロックが存在する場合                                                                                                                            |
| 解決策           | testid 削除後に `grep -rn "削除したtestid" apps/desktop/src/renderer/components/` でスキップブロック内を含む全参照を確認し、残存していれば同一 wave で削除する                                                         |
| 標準ルール       | testid 削除・改名タスクでは Phase 5 完了チェックとして `grep -rn` による全参照確認を必須にする。`describe.skip` は CI から見えない「死角」であり、スキップブロック内の旧参照は next cleanup タスクに積み残されやすい   |
| 影響ファイル     | `SkillLifecyclePanel.llm-generation.test.tsx`（11 箇所削除）、`SkillLifecyclePanel.auth-regression.test.tsx`（fillCreateRequest を no-op 化）                                                                          |
| 削除フィクスチャ | `indexes-skill/SKILL.md`（用途廃止のフィクスチャスキル）                                                                                                                                                               |

### L-SKIP-002: NON_VISUAL タスクの describe.skip 内 cleanup チェックリスト不在

| 項目       | 内容                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | Phase 5（実装）の完了チェックリストに「削除 testid の describe.skip 内残存確認」が明示されておらず、FB-02 として Phase 12 で初めて検出された |
| 解決策     | Phase 5 仕様書テンプレートに「testid 削除タスクの場合、`grep -rn "<削除testid>" apps/` でスキップブロック内残存を確認する」を追加する        |
| 関連スキル | task-specification-creator Phase 5 チェックリスト / patterns-lessons-and-pitfalls.md                                                         |

---

## 依存関係

| 方向 | タスクID                                                    | 内容                                              |
| ---- | ----------------------------------------------------------- | ------------------------------------------------- |
| 先行 | W0-seq-01                                                   | `SkillInfoFormData` / `SmartDefaultResult` 型定義 |
| 先行 | W0-seq-02（UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001） | `inferSmartDefaults()` サービス実装               |
| 先行 | W1-par-02a                                                  | `SkillInfoStep`（Step 0 フォーム）実装            |
| 先行 | W1-par-02d                                                  | `SkillLifecyclePanel` ウィザード遷移ボタン化      |
| 後続 | W3-seq-04                                                   | Skill生成実行処理（LLM呼び出し実装）              |

---

## 関連ファイル

| ファイル                                                                                            | 用途                     |
| --------------------------------------------------------------------------------------------------- | ------------------------ |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                  | ウィザード本体           |
| `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`                                | 生成ステップ             |
| `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                                | 完了ステップ             |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.W2-seq-03a.test.tsx`        | W2-seq-03a 単体テスト    |
| `apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.store-integration.test.tsx` | Store統合テスト          |
| `docs/30-workflows/completed-tasks/W2-seq-03a-skill-create-wizard/`                                 | タスク仕様書ディレクトリ |
| `outputs/phase-12/skill-feedback-report.md`                                                         | フィードバックレポート   |

## UT-SKILL-WIZARD-FB-03 フィールド独立推論性 教訓（2026-04-11）

### L-FB03-001: `format` は `category` からのみ推論する

- **症状**: `format` が `purpose` でも推論されるように読めると、設計レビューで責務境界が曖昧になる
- **解決策**: `purpose -> tool/timing` と `category -> format` を文書上で分離し、`format` は category-only と固定した
- **標準ルール**: `format` の説明は category-only を最初に書く
- **関連タスク**: UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001

### L-FB03-002: `purpose` と `category` の責務は同じ段落に閉じ込めない

- **症状**: 1 文でまとめると、どのフィールドが何を決めるか読み手が迷う
- **解決策**: `purpose` と `category` を見出しレベルで分け、表でも役割を分離した
- **標準ルール**: field independence は見出しと表の両方で二重化して書く
- **関連タスク**: UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001

### L-FB03-003: docs-only close-out でも artifacts / logs / lessons の同波更新が必要

- **症状**: 実装変更がなくても、台帳・ログ・lesson がずれると後続の Phase 13 で誤読が残る
- **解決策**: outputs 6件に加えて `task-workflow` / `LOGS` / `SKILL` / lessons を same-wave で更新した
- **標準ルール**: docs-only close-out でも completed ledger と skill logs を必ず更新する
- **関連タスク**: UT-SKILL-WIZARD-FB-03-FALLBACK-SPEC-CLARIFICATION-001

---

## TASK-SC-07 LLM生成フロー接続 教訓（2026-04-09）

### L-SC07-LLM-001: Request-ID ガード / キャンセル競合回避パターン

| 項目         | 内容                                                                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状         | `planSkill` → `executePlan` の非同期フロー中にユーザーがウィザードを閉じると、旧リクエストの応答が後続の state に混入し、`generationError` が残留したまま次回フローが開始される                                                            |
| 原因         | キャンセル後も `setGenerationError` / `setGenerationProgress` のコールバックが発火し続ける                                                                                                                                                 |
| 解決策       | `requestIdRef = useRef(0)` でリクエスト番号を単調増加させ、コールバック冒頭で `if (requestId !== requestIdRef.current) return` による失効チェックを行う。キャンセル時は `resetStreamingProgress()` を呼んで全 streaming state を初期化する |
| 標準ルール   | 非同期ウィザードフローでは必ずリクエスト ID ガードを実装する。`useRef` で同期的にチェックし、`useState` のコールバックは失効後に発火しても state を汚染しないようにする                                                                    |
| 関連タスク   | TASK-SC-07                                                                                                                                                                                                                                 |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                                                                                                                                                         |

### L-SC07-LLM-002: getWorkflowState による fail snapshot 検出

| 項目       | 内容                                                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `executePlan` が `terminal_handoff` を返した場合、UI が成功画面に遷移してしまい、失敗が検出されない                                                                    |
| 解決策     | `executePlan` 完了後に `getWorkflowState(planId)` を再呼び出しし、`phase === 'terminal_handoff'` を検出した場合は `generationError` を設定して GenerateStep にとどまる |
| 標準ルール | LLM 生成フロー完了後は必ず `getWorkflowState` で snapshot を再取得し、`terminal_handoff` / `failed` フェーズを明示的にチェックする                                     |
| 関連タスク | TASK-SC-07                                                                                                                                                             |

### L-SC07-LLM-003: scheduleバリデーション競合（生成フローのブロック防止）

| 項目       | 内容                                                                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `ConversationRoundStep` に schedule 関連の validation が残っており、cron 文字列が不完全な状態でも「Invalid」判定が発火し、生成ボタンが disabled のまま解除されなかった                         |
| 原因       | schedule/timing バリデーションは「保存確定時」に行うべき責務だが、実装では `canProceed` 計算に混入していた                                                                                     |
| 解決策     | schedule バリデーションは `ConversationRoundStep` の `canProceed` から除外し、ウィザード完了直前（`persistSkill` 呼び出し前）のみで検証する設計に統一した（コミット `97ff1d08d`, `39be7030b`） |
| 標準ルール | ウィザードの「進む/生成」ボタンの活性化条件に保存系バリデーションを混ぜない。段階的な入力フローでは「今このステップで必要な情報が揃っているか」のみで `canProceed` を判定する                  |
| 関連タスク | TASK-SC-07, UT-SKILL-WIZARD-W3-seq-04                                                                                                                                                          |

---

## skill-wizard-multi-select-options QuestionAnswer複数選択対応 教訓（2026-04-09）

### L-MULTISEL-001: selectedOptions: string[] への型移行とトグル選択設計

| 項目       | 内容                                                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 症状       | `QuestionAnswer.selectedOption: string \| null` の旧設計では、複数選択時に全選択肢を一つの文字列に連結するか複数の `QuestionAnswer` を作成するかの決定が曖昧だった |
| 解決策     | `selectedOptions: string[]` に一本化し、トグル選択は `includes` 判定 + 配列の追加・除去で実装。`SmartDefaultResult` のフィールドを `string[]` に統一して連携させた |
| 標準ルール | 複数選択 state は `string \| null` の union 型ではなく `string[]` で管理する。空選択は `[]`（空配列）で表現し、null は使わない                                     |
| 関連タスク | skill-wizard-multi-select-options, #2078                                                                                                                           |

### L-MULTISEL-002: SmartDefault連携時の既存選択との配列マージ

| 項目       | 内容                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 症状       | `inferSmartDefaults()` の結果を `ConversationRoundStep` に渡す際、ユーザーが手動で選択した選択肢とSmartDefault推論値が上書き競合した                             |
| 解決策     | SmartDefault値を「初期値」として扱い、ユーザーがトグル操作を行った後は SmartDefault を適用しない。`hasUserModified` フラグで手動操作済みを検出し、二重適用を防ぐ |
| 標準ルール | 推論デフォルト値とユーザー入力の競合防止には「ユーザーが一度でも触れたらデフォルトを上書きしない」の原則を適用する                                               |
| 関連タスク | skill-wizard-multi-select-options, #2078                                                                                                                         |

> 詳細な W3-seq-04 使用率計装パターン（L-W3-TRACK-001/002）は → [lessons-learned-w3-usage-tracking-2026-04.md](lessons-learned-w3-usage-tracking-2026-04.md) を参照

---

## UT-SKILL-WIZARD-W2-seq-03b Phase-12 close-out 教訓（2026-04-12）

### L-ARTIFACTS-001: artifacts.json 二重管理問題

| 項目       | 内容                                                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b                                                                                                                                        |
| 問題       | `artifacts.json`（ルート相当）と `outputs/artifacts.json` の二重管理によりドリフトが発生。どちらが正本か不明瞭な状態で Phase 12 close-out を迎えるケースがあった  |
| 再発条件   | Phase 12 close-out 時に両ファイルの同期確認が抜けた場合。特に worktree 内で outputs/ 配下だけを更新し、ルート相当の artifacts.json への反映を忘れた場合に発生する |
| 対策       | Phase 12 close-out チェックリストに「`artifacts.json`（ルート相当）と `outputs/artifacts.json` の内容が一致しているか確認する」を必須項目として追加する           |
| 将来対策   | 自動同期スクリプト化を推奨: `scripts/sync-artifacts.js` を作成し、両ファイルの差分を検出・自動マージできる仕組みを整備する                                        |
| 標準ルール | Phase 12 close-out では artifacts.json の二重管理ドリフトを必ずチェックする。自動化前は手動で両ファイルを diff して確認する                                       |
| 関連タスク | UT-SKILL-WIZARD-W2-seq-03b                                                                                                                                        |

### L-CANONICAL-001: Phase-12 canonical 成果物の命名規約

| 項目       | 内容                                                                                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b                                                                                                                                              |
| 問題       | `outputs/phase-12/` 内で「canonical 6件」と「補助ファイル」が混在し、命名規約が不統一だった。どのファイルが canonical かを判別するコストが高かった                      |
| 再発条件   | canonical 成果物と補助ファイルを同一ディレクトリに配置する際に命名規約を定めていない場合                                                                                |
| 対策       | Phase-12 canonical 成果物は `{task-id}-{semantic-name}.md` 形式で統一する。例: `UT-SKILL-WIZARD-W2-seq-03b-close-out-report.md`                                         |
| 判断基準   | `artifacts.json` に列挙されているものが canonical、それ以外（作業メモ・下書き・中間成果物）は補助ファイルとして別ディレクトリまたはプレフィックス（`_` など）で区別する |
| 標準ルール | Phase-12 close-out 開始前に、canonical 成果物の命名規約を仕様書または `artifacts.json` のコメントとして明示しておく。artifacts.json に掲載 = canonical の原則を徹底する |
| 関連タスク | UT-SKILL-WIZARD-W2-seq-03b                                                                                                                                              |
