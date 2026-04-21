# Lessons Learned: UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001 主ツールバッジ実装

> 区分: 教訓記録（lessons-learned）
> タスクID: UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001
> 完了日: 2026-04-13
> 注記: 2026-04-15 に `UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` が完了し、`MAIN_TOOL_BADGE_ENABLED` / `shouldShowMainToolBadge()` / 主ツールバッジ JSX は current 実装から削除済み。以下は historical pattern として参照する。

---

## タスク概要

| 項目         | 値                                                                            |
| ------------ | ----------------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001                                          |
| タスク名     | スキルウィザード Q5 複数選択時の「主ツール」UI表示                            |
| 完了日       | 2026-04-13                                                                    |
| ステータス   | Phase 12 完了 / Phase 13 blocked                                              |
| 対象ファイル | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` |
| 成果物       | `docs/30-workflows/ut-skill-wizard-mso-main-tool-ui-001/`                     |

---

## 実装パターン（将来参照用）

### Pattern 1: visual label と accessible name の分離（ARIA 責務分離）

```typescript
// ボタンの accessible name は aria-labelledby で固定（変更しない）
<button aria-labelledby={`option-label-${optionValue}`} ...>
  <span id={`option-label-${optionValue}`}>{label}</span>
  {showBadge && (
    <span
      aria-label="主ツールとして使用される"
      aria-describedby={`badge-desc-${optionValue}`}
    >
      主ツール
    </span>
  )}
</button>
```

- `aria-labelledby` でボタン名を選択肢テキストに固定する（バッジがあっても button name は変わらない）
- バッジは `aria-label` / `aria-describedby` で補助情報として関連付け
- これにより `screen.getByRole("button", { name: "Slack" })` の exact match がそのまま使える

### Pattern 2: 機能フラグ制御可能バッジ設計

```typescript
// 単一箇所で有効/無効を制御できる
const MAIN_TOOL_BADGE_ENABLED = true;

function shouldShowMainToolBadge(
  questionKey: string,
  optionValue: string,
  selectedOptions: string[],
): boolean {
  return (
    MAIN_TOOL_BADGE_ENABLED &&
    questionKey === "q5" &&
    selectedOptions.length >= 2 &&
    selectedOptions[0] === optionValue
  );
}
```

- `MAIN_TOOL_BADGE_ENABLED` フラグで将来の削除を容易にする
- 削除時: フラグ・関数・JSX・テスト（TC-1〜TC-6）の4箇所のみ変更
- Q5 かつ 2選択以上 かつ 先頭値が条件（先頭値優先ロジックの明示化）

### Pattern 3: NON_VISUAL タスクでのバッジ削除手順

`UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001` 完了時に実施したバッジ削除手順:

1. `shouldShowMainToolBadge` 関数と `MAIN_TOOL_BADGE_ENABLED` 定数を削除
2. `aria-describedby` を含むバッジ JSX を削除
3. テストケース TC-1〜TC-6 を削除（回帰テストは残す）
4. 本タスク status を `completed` → `superseded` に更新

---

## L-MSO-001: visual label と accessible name は別管理する

| 項目       | 内容                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------ |
| 課題       | button 内に視覚バッジを追加すると、accessible name まで変わる前提を持ちやすい              |
| 原因       | `aria-label` を button 直接に付けると button 名が上書きされる                              |
| 解決策     | `aria-labelledby` でボタン名を選択肢テキストに固定し、バッジに `aria-describedby` を付ける |
| 標準ルール | ボタン内に補助表示を追加する場合は、button 名を変えてよいか Phase 2 で確認する             |
| 関連タスク | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001                                                       |

## L-MSO-002: exact match テストを壊さないバッジ追加パターン

| 項目       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| 課題       | `getByRole("button", { name: "Slack" })` のような exact match テストが、バッジ追加で壊れる   |
| 原因       | button 内のテキストが accessible name に結合されてしまう                                     |
| 解決策     | `aria-labelledby` で参照するスパンにのみ button 名テキストを入れ、バッジは別スパンに分離する |
| 標準ルール | 「見た目のラベルと意味のラベルを分けると、テストは exact match で安定する」                  |
| 関連タスク | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001                                                         |

## L-MSO-003: 削除容易性を保ったまま条件分岐バッジを実装する

| 項目       | 内容                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| 課題       | 暫定バッジ（後続タスクで削除予定）を追加するとき、削除箇所が散らばりやすい                                  |
| 原因       | バッジのロジックをコンポーネント各所に埋め込むと、削除時に見落としが生じる                                  |
| 解決策     | `MAIN_TOOL_BADGE_ENABLED` フラグと `shouldShowMainToolBadge()` 関数を一本化し、削除手順をドキュメント化する |
| 標準ルール | 将来削除予定のバッジは機能フラグ + 専用関数 + 削除手順書の3点セットで実装する                               |
| 関連タスク | UT-SKILL-WIZARD-MSO-MAIN-TOOL-UI-001                                                                        |

---

## スキル改善提案（task-specification-creator への反映事項）

| 提案                                 | 内容                                                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Phase 2 チェック追加                 | 「visual label が accessible name を変えてよいか」を Phase 2 設計で確認する項目を追加する               |
| Phase 11 必須項目化                  | スクリーンショット保存先（`outputs/phase-11/screenshots/`）と証跡ファイル名を Phase 11 の必須項目にする |
| aiworkflow-requirements テンプレート | UI の current contract 記録時に button 名と補助ラベルを分けて書くテンプレートを追加する                 |
