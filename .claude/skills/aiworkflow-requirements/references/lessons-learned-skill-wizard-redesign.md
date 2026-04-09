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

| 項目       | 内容                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題       | `normalizeSelectedOption()` の switch 文が q1/q3/q5/q6 の 4 ケースに分散しており、新しい `SmartDefaultResult` フィールドを追加する際に「型定義（`ConversationAnswers`）」「マッピング（`QUESTION_OPTION_VALUES`）」「switch 文」の 3 箇所を同時更新する必要がある |
| 再発条件   | SmartDefaultResult のフィールドが増えるたびに normalizeSelectedOption の switch 文に新ケースを追加し忘れると、新フィールドのデフォルト値が正規化されずに raw 値のままUIラベルとして表示される                                                   |
| 解決策     | 将来的には `SEMANTIC_LABEL_MAP: Record<QuestionKey, Record<string, string>>` のような宣言的マッピングテーブルに集約することで更新箇所を 1 箇所に削減できる。現在の switch 文は各 QuestionKey に対応するマッピングを 1 オブジェクトに統一する形にリファクタリング可能 |
| 標準ルール | semantic デフォルト正規化ロジックは宣言的テーブルで管理し、新フィールド追加時はテーブル 1 箇所の更新で完結するよう設計する                                                                                                                      |
| 関連タスク | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                               |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`                                                                                                                                                               |

### L-CRS-002: worktree と main ブランチの仕様書ステータス同期不整合

| 項目       | 内容                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 課題       | main ブランチで完了済みのタスク（`ut-health-policy-runtime-injection`）の spec files が worktree 内に `spec_created` ステータスのまま残留した。worktree が別タスク専用に切られた際に main 側の完了状態が worktree に反映されないことが原因 |
| 再発条件   | worktree 作成後に main 側でタスクが完了し `docs/30-workflows/` から spec が削除・移動された場合、worktree では依然として旧 spec が存在し続ける                                                                                    |
| 解決策     | worktree 作成時（または作業開始時）に `docs/30-workflows/` の仕様書ステータスを `git diff main -- docs/30-workflows/` で main と照合する。main 側で削除済みの spec は worktree からも削除またはアーカイブへ移動する              |
| 標準ルール | worktree 独立性を保ちつつ、Phase 1 のタスク開始時チェックとして「main ブランチでの完了済み spec の残留がないか」を確認する手順を追加する                                                                                          |
| 関連タスク | UT-SKILL-WIZARD-W1-CONVERSATION-ROUND-STEP-001                                                                                                                                                                                  |
| 関連削除   | `docs/30-workflows/ut-health-policy-runtime-injection/` 削除（worktree 内残留解消）                                                                                                                                             |

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
