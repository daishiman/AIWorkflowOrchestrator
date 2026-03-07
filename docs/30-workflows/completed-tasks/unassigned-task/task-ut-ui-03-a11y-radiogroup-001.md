# UT-UI-03-A11Y-RADIOGROUP-001: SkillChip群コンテナに role="radiogroup" 追加

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | UT-UI-03-A11Y-RADIOGROUP-001                 |
| タスク名     | SkillChip群コンテナに role="radiogroup" 追加 |
| 親タスクID   | TASK-UI-03-AGENT-VIEW-ENHANCEMENT            |
| 分類         | アクセシビリティ改善                         |
| 対象機能     | AgentView - SkillChipリスト                  |
| 優先度       | 低                                           |
| 見積もり規模 | 極小                                         |
| ステータス   | 実装済み（テスト未確認）                     |
| 発見元       | Phase 10 最終レビュー MINOR #1               |
| 発見日       | 2026-03-07                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AgentView の SkillChip コンポーネント群は、ユーザーが実行対象のスキルを1つ選択するラジオボタンとして機能している。しかし、Phase 5 実装時点ではコンテナ要素に `role="radiogroup"` が未設定であり、スクリーンリーダーがこれらのチップをラジオボタングループとして認識できなかった。WCAG 2.1 AA の「1.3.1 情報と関係性」および「4.1.2 名前・役割・値」に違反する状態であった。

Phase 10 最終レビュー MINOR #1 で検出され、Phase 5 実装中に修正が適用された（`apps/desktop/src/renderer/views/AgentView/index.tsx` 332-335行目）。本タスクは、修正内容のテスト網羅性を確認し、テストが不足している場合に追加することを目的とする。

### 1.2 問題点

| #   | 問題                                                                    | 影響レベル |
| --- | ----------------------------------------------------------------------- | ---------- |
| 1   | SkillChip群コンテナに `role="radiogroup"` が未設定だった                | WCAG違反   |
| 2   | `aria-label` が未設定で、グループの目的がスクリーンリーダーに伝わらない | WCAG違反   |
| 3   | テスト設計時にWCAG準拠テストケースが含まれていなかった                  | 品質保証   |

### 1.3 放置した場合の影響

- アクセシビリティ監査（Lighthouse、axe-core）で不合格となる
- 視覚障害ユーザーがスクリーンリーダーでツール選択操作を正しく認識できない
- WCAG 2.1 AA 準拠を掲げるプロジェクト方針との矛盾が発生する

### 1.4 TASK-UI-03 実装時の苦戦箇所と教訓

| #   | 苦戦箇所                                             | 原因                                                                                           | 教訓                                                                 |
| --- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | Phase 5 実装時にa11y属性を見落とした                 | コンポーネントの視覚的デザインとインタラクション実装に注力し、WAI-ARIA属性の付与を後回しにした | 実装チェックリストにWAI-ARIA属性確認項目を含める                     |
| 2   | Phase 4 テスト設計時にWCAGテストケースを含めなかった | テスト設計が機能要件（選択・実行・表示）に偏り、非機能要件（a11y）のテストケースが欠落した     | Phase 4 テスト設計時にWCAG 2.1 AA準拠テストケースを必ず含める        |
| 3   | Phase 10 レビューまで検出されなかった                | Phase 6（テスト拡充）・Phase 9（品質検証）でもa11y観点の検証が行われなかった                   | Phase 9 品質検証にaxe-coreまたはjest-axeによる自動a11y検証を追加する |

**対策済み**: Phase 4 にa11yテスト設計を含める推奨が `task-specification-creator/references/phase-templates.md` に追加済み。

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillChip群コンテナに `role="radiogroup"` と `aria-label="ツール選択"` を設定し、WCAG 2.1 AA の「1.3.1 情報と関係性」および「4.1.2 名前・役割・値」を満たす。

### 2.2 最終ゴール

- SkillChip群コンテナがスクリーンリーダーでラジオボタングループとして認識される
- テストで `role="radiogroup"` と `aria-label` の存在が検証されている

### 2.3 スコープ

**含む:**

- `AgentView/index.tsx` の SkillChip群コンテナへの `role="radiogroup"` + `aria-label` 追加（実装済み）
- `AgentView.layout.test.tsx` への radiogroup 存在確認テスト追加

**含まない:**

- 個別 SkillChip への `role="radio"` + `aria-checked` 追加（別タスク UT-UI-03-A11Y-LABEL-001 で対応）
- キーボードナビゲーション（矢印キーによるフォーカス移動）の実装

### 2.4 成果物

| #   | 成果物                        | パス                                                                            |
| --- | ----------------------------- | ------------------------------------------------------------------------------- |
| 1   | 修正済みAgentView（実装済み） | `apps/desktop/src/renderer/views/AgentView/index.tsx`                           |
| 2   | テストファイル                | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.layout.test.tsx` |

---

## 3. どう実装するか（How）

### 3.1 実行手順

1. `apps/desktop/src/renderer/views/AgentView/index.tsx` のSkillChip群を囲むdivに `role="radiogroup"` と `aria-label="ツール選択"` を追加する（実装済み・確認のみ）
2. `AgentView.layout.test.tsx` に radiogroup の存在確認テストを追加する
3. テストを実行し PASS を確認する

### 3.2 コード例

```tsx
// 修正前
<div className="flex flex-wrap gap-4 justify-center">
  {skills.map((skill) => (
    <SkillChip key={skill.name || skill.id} ... />
  ))}
</div>

// 修正後（実装済み: index.tsx 332-335行目）
<div
  role="radiogroup"
  aria-label="ツール選択"
  className="flex flex-wrap gap-4 justify-center"
>
  {skills.map((skill) => (
    <SkillChip key={skill.name || skill.id} ... />
  ))}
</div>
```

### 3.3 テスト方針

```tsx
// AgentView.layout.test.tsx に追加するテストケース
describe("アクセシビリティ", () => {
  it("SkillChip群コンテナにrole='radiogroup'が設定されている", () => {
    render(<AgentView />);
    const radiogroup = screen.getByRole("radiogroup", { name: "ツール選択" });
    expect(radiogroup).toBeInTheDocument();
  });
});
```

---

## 4. 影響範囲

| 対象ファイル                                                                    | 変更内容                                            | リスク |
| ------------------------------------------------------------------------------- | --------------------------------------------------- | ------ |
| `apps/desktop/src/renderer/views/AgentView/index.tsx`                           | `role="radiogroup"` + `aria-label` 追加（実装済み） | 極低   |
| `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.layout.test.tsx` | radiogroup 存在確認テスト追加                       | 極低   |

---

## 5. 参照資料

| #   | 資料                                                                                                | 参照目的                         |
| --- | --------------------------------------------------------------------------------------------------- | -------------------------------- |
| 1   | `arch-ui-components.md` のAgentView階層                                                             | コンポーネント構成の確認         |
| 2   | `ui-ux-design-principles.md` のアクセシビリティ原則                                                 | WCAG 2.1 AA 準拠基準             |
| 3   | `lessons-learned.md` の「アクセシビリティ属性の段階的検出パターン」                                 | 同種の問題の再発防止             |
| 4   | `06-known-pitfalls.md`                                                                              | 既知の落とし穴パターン確認       |
| 5   | [WCAG 2.1 - 1.3.1 情報と関係性](https://www.w3.org/WAI/WCAG21/Understanding/info-and-relationships) | WAI-ARIA radiogroup の要件       |
| 6   | [WCAG 2.1 - 4.1.2 名前・役割・値](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value)      | アクセシブルな名前とロールの要件 |
| 7   | `task-specification-creator/references/phase-templates.md`                                          | Phase 4 a11yテスト設計の推奨追加 |

---

## 6. 完了条件

- [ ] `role="radiogroup"` + `aria-label="ツール選択"` が `AgentView/index.tsx` のSkillChip群コンテナに設定されている（実装済み・確認のみ）
- [ ] `AgentView.layout.test.tsx` に radiogroup の存在確認テストが追加されている
- [ ] テストが PASS する
- [ ] `pnpm lint` がエラーなく通る
- [ ] `pnpm typecheck` がエラーなく通る
