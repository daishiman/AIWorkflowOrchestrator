# UT-UI-03-A11Y-DIALOG-001: AdvancedSettingsPanel ダイアログ a11y 強化

## メタ情報

```yaml
issue_number: 1030
```

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| タスクID   | UT-UI-03-A11Y-DIALOG-001                            |
| タスク名   | AdvancedSettingsPanel ダイアログ a11y 強化          |
| 親タスクID | TASK-UI-03-AGENT-VIEW-ENHANCEMENT                   |
| 分類       | アクセシビリティ改善                                |
| 対象機能   | AgentView > AdvancedSettingsPanel                   |
| 優先度     | 低                                                  |
| 見積もり   | 小規模（1-2時間）                                   |
| ステータス | 一部実装済み（属性追加済み・テスト未追加）          |
| 発見元     | TASK-UI-03-AGENT-VIEW-ENHANCEMENT Phase 10 MINOR #2 |
| 発見日     | 2026-03-07                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AdvancedSettingsPanel はモデル選択・許可モード変更・記憶済み許可リセットを行うモーダル的なオーバーレイパネルである。Phase 5 実装時点では `role="dialog"` が未設定であり、スクリーンリーダーがダイアログとして認識できない状態だった。Phase 10 最終レビューで MINOR #2 として検出され、`role="dialog"` + `aria-modal="true"` + `aria-label="詳細設定"` の属性は既にコンポーネントに追加済みである。

しかし、以下の2点が未完了のまま残っている:

1. **テストケースの追加**: `AdvancedSettingsPanel.test.tsx` に `role="dialog"` の存在を検証するテストが含まれていない
2. **フォーカストラップの実装**: ESC キーによるクローズは実装されているが、Tab キーによるフォーカストラップ（ダイアログ内にフォーカスを閉じ込める動作）が未実装

### 1.2 問題点

| #   | 問題                                   | 現状                                | あるべき姿                                           |
| --- | -------------------------------------- | ----------------------------------- | ---------------------------------------------------- |
| 1   | dialog ロール属性のテスト未追加        | a11y テストは `tabIndex=0` 確認のみ | `role="dialog"` + `aria-modal` + `aria-label` を検証 |
| 2   | フォーカストラップ未実装               | ESC キーハンドリングのみ            | Tab/Shift+Tab でダイアログ内にフォーカスを閉じ込める |
| 3   | ダイアログ開閉時のフォーカス管理未実装 | 開閉時にフォーカスが移動しない      | 開: パネル内にフォーカス移動、閉: トリガー要素に復帰 |

### 1.3 放置した場合の影響

- **WCAG 2.1 AA 非準拠**: ダイアログパターン（WAI-ARIA Authoring Practices）のフォーカストラップ要件を満たさない
- **テスト回帰リスク**: `role="dialog"` が将来の修正で意図せず削除されても検出できない
- **スクリーンリーダーユーザーのUX低下**: ダイアログ外にフォーカスが漏れ、背景コンテンツと混同する可能性がある

### 1.4 TASK-UI-03 実装時の苦戦箇所と教訓

Phase 5 実装時に `role="radiogroup"`、`role="dialog"`、`aria-label` 不整合などのアクセシビリティ属性が不足していた。z-index 管理は Phase 2 設計時に事前設計テーブルを作成したことで問題なく進んだが、ARIA 属性については Phase 4 テスト設計に WCAG 準拠テストケースを含めていなかったため、Phase 10 で初めて検出された。

**教訓**: UIコンポーネント実装時にアクセシビリティを「後から追加する」前提で進めると、Phase 10 まで検出が遅延する。Phase 4 テスト設計時に `role` 属性、`aria-label`/`aria-labelledby`、キーボード操作、コントラスト比の4項目を必須チェック対象とすべきである。

**参照**: [lessons-learned.md - TASK-UI-03 アクセシビリティ属性の段階的検出パターン](../../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md)

---

## 2. 何を達成するか（What）

### 2.1 目的

AdvancedSettingsPanel の WCAG 2.1 AA ダイアログパターン準拠を完了し、テストで回帰を防止する。

### 2.2 最終ゴール

- `role="dialog"` + `aria-modal="true"` + `aria-label="詳細設定"` がテストで検証されている
- Tab キーによるフォーカストラップが実装されている
- ダイアログ開閉時のフォーカス管理が実装されている
- 既存テストが全て PASS する

### 2.3 スコープ

#### 含むもの

- `AdvancedSettingsPanel.test.tsx` への dialog ロール検証テスト追加
- フォーカストラップの実装（Tab/Shift+Tab）
- ダイアログ開閉時のフォーカス管理の実装
- フォーカストラップ関連のテスト追加

#### 含まないもの

- `role="dialog"` + `aria-modal="true"` + `aria-label="詳細設定"` の属性追加（実装済み）
- ESC キーハンドリング（実装済み）
- 他のコンポーネントのアクセシビリティ改善（UT-UI-03-A11Y-LABEL-001、UT-UI-03-A11Y-RADIOGROUP-001 で対応）

### 2.4 成果物

| 成果物                                    | 説明                                      |
| ----------------------------------------- | ----------------------------------------- |
| 修正済み AdvancedSettingsPanel.tsx        | フォーカストラップ + フォーカス管理の追加 |
| 追加テスト AdvancedSettingsPanel.test.tsx | dialog ロール + フォーカストラップ検証    |

---

## 3. どう実装するか（How）

### 3.1 前提条件

- TASK-UI-03-AGENT-VIEW-ENHANCEMENT が完了していること
- `role="dialog"` + `aria-modal="true"` + `aria-label="詳細設定"` が既に実装済みであること

### 3.2 依存タスク

| タスクID                          | 関係 | 状況 |
| --------------------------------- | ---- | ---- |
| TASK-UI-03-AGENT-VIEW-ENHANCEMENT | 先行 | 完了 |

### 3.3 必要な知識

| 知識領域                     | 参照先                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| AdvancedSettingsPanel 実装   | `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx`                |
| 既存テスト                   | `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/AdvancedSettingsPanel.test.tsx` |
| WAI-ARIA Dialog パターン     | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/                                              |
| WCAG 2.1 AA 準拠要件         | `.claude/rules/01-architecture.md#アクセシビリティ`                                                 |
| P39: happy-dom userEvent制限 | `.claude/rules/06-known-pitfalls.md#P39`                                                            |
| 実装教訓                     | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                              |

### 3.4 実装手順

#### Step 1: dialog ロール検証テストの追加

`AdvancedSettingsPanel.test.tsx` のアクセシビリティテスト describe ブロックに以下を追加:

```tsx
it("role=dialog と aria-modal=true と aria-label が設定されている", () => {
  render(<AdvancedSettingsPanel {...defaultProps} />);

  const dialog = screen.getByRole("dialog");
  expect(dialog).toHaveAttribute("aria-modal", "true");
  expect(dialog).toHaveAttribute("aria-label", "詳細設定");
});
```

#### Step 2: フォーカストラップの実装

`AdvancedSettingsPanel.tsx` の既存 ESC キーハンドラに Tab キーフォーカストラップを追加:

```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-label="詳細設定"
  className={panelClasses}
>
```

フォーカストラップのロジック:

```tsx
useEffect(() => {
  if (!isOpen) return;

  const panelEl = document.querySelector(
    '[data-testid="advanced-settings-panel"]',
  );
  if (!panelEl) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }

    if (e.key === "Tab") {
      const focusableEls = panelEl.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [isOpen, onClose]);
```

#### Step 3: フォーカストラップのテスト追加

```tsx
it("Tab キーでフォーカスがダイアログ内に閉じ込められる", async () => {
  render(<AdvancedSettingsPanel {...defaultProps} />);

  const dialog = screen.getByRole("dialog");
  expect(dialog).toBeInTheDocument();

  // フォーカス可能な要素が存在することを確認
  const buttons = screen.getAllByRole("button");
  expect(buttons.length).toBeGreaterThan(0);
});
```

**注意**: P39 対策により happy-dom 環境では `userEvent` を使用せず `fireEvent` のみ使用すること。

### 3.5 ESC キーのフォーカストラップ確認

ESC キーによるダイアログクローズは既に実装・テスト済み（`AdvancedSettingsPanel.test.tsx` 135-144行目）。フォーカストラップ実装時に ESC キーハンドラとの競合がないことを確認する。

### 3.6 テスト方針

| TC-ID  | 検証項目                                       | 期待結果                         |
| ------ | ---------------------------------------------- | -------------------------------- |
| TC-001 | `role="dialog"` が設定されている               | `getByRole("dialog")` で取得可能 |
| TC-002 | `aria-modal="true"` が設定されている           | 属性値が `"true"`                |
| TC-003 | `aria-label="詳細設定"` が設定されている       | 属性値が `"詳細設定"`            |
| TC-004 | Tab キーでフォーカスがダイアログ内に留まる     | 最後の要素から最初の要素にループ |
| TC-005 | Shift+Tab キーで逆方向にフォーカスがループする | 最初の要素から最後の要素にループ |
| TC-006 | ESC キーでダイアログが閉じる（回帰テスト）     | `onClose` が呼ばれる             |

---

## 4. 影響範囲

### 変更対象ファイル

| ファイル                                                                                            | 変更内容                                         |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx`                | フォーカストラップ + フォーカス管理の追加        |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/AdvancedSettingsPanel.test.tsx` | dialog ロール検証 + フォーカストラップテスト追加 |

### 影響を受ける可能性のあるコンポーネント

| コンポーネント | 影響 | 理由                                 |
| -------------- | ---- | ------------------------------------ |
| AgentView      | なし | AdvancedSettingsPanel の内部変更のみ |

### リスク

| リスク                           | 影響度 | 発生確率 | 対策                                          |
| -------------------------------- | ------ | -------- | --------------------------------------------- |
| フォーカストラップと ESC の競合  | 低     | 低       | 既存 ESC テストで回帰を検出                   |
| happy-dom でのフォーカス制御制限 | 中     | 中       | P39 準拠で fireEvent のみ使用、DOM 操作で検証 |

---

## 5. 参照資料

### 関連ドキュメント

| ドキュメント             | パス                                                                           | 参照理由                       |
| ------------------------ | ------------------------------------------------------------------------------ | ------------------------------ |
| UIコンポーネント仕様     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`      | AgentView コンポーネント構成   |
| UI/UX デザイン原則       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md` | WCAG 準拠要件                  |
| 実装教訓                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | TASK-UI-03 a11y 苦戦箇所       |
| アーキテクチャ a11y 要件 | `.claude/rules/01-architecture.md#アクセシビリティ`                            | WCAG 2.1 AA コントラスト比基準 |
| P39 happy-dom 制限       | `.claude/rules/06-known-pitfalls.md#P39`                                       | テスト環境制約                 |

### 関連タスク

| タスクID                          | 関係 | 説明                                      |
| --------------------------------- | ---- | ----------------------------------------- |
| TASK-UI-03-AGENT-VIEW-ENHANCEMENT | 親   | AgentView Enhancement 本体タスク          |
| UT-UI-03-A11Y-LABEL-001           | 並行 | 停止ボタン aria-label 不一致修正          |
| UT-UI-03-A11Y-RADIOGROUP-001      | 並行 | モデル選択リストに role="radiogroup" 追加 |

---

## 6. 完了条件

### 機能要件

- [ ] `role="dialog"` + `aria-modal="true"` + `aria-label="詳細設定"` がテストで検証されている
- [ ] Tab キーによるフォーカストラップが実装されている
- [ ] Shift+Tab キーによる逆方向フォーカスループが実装されている
- [ ] ダイアログ開閉時のフォーカス管理が実装されている（実装判断は Phase 2 で確定）
- [ ] ESC キーハンドリングとの競合がないことが確認されている

### 品質要件

- [ ] 既存テストが全て PASS
- [ ] 新規テスト（TC-001 ~ TC-006）が全て PASS
- [ ] 型チェック（`pnpm typecheck`）が PASS
- [ ] Lint チェック（`pnpm lint`）が PASS

### ドキュメント要件

- [ ] CHANGELOG への記録
- [ ] 変更理由がコードコメントに記載されている
