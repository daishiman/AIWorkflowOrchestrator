# Portal メニュー - 高コントラストモード対応 - タスク指示書

## メタ情報

| 項目             | 内容                                       |
| ---------------- | ------------------------------------------ |
| タスクID         | AUTH-UI-004                                |
| タスク名         | Portal メニュー - 高コントラストモード対応 |
| 分類             | アクセシビリティ改善                       |
| 対象機能         | AccountSection アバターメニュー            |
| 優先度           | 中                                         |
| 見積もり規模     | 小規模（0.25日）                           |
| ステータス       | 未実施                                     |
| 発見元           | AUTH-UI-002 最終レビュー（Phase 7）        |
| 発見日           | 2025-12-20                                 |
| 発見エージェント | @ui-designer（T-07-1最終レビュー）         |
| 関連タスク       | AUTH-UI-002                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AUTH-UI-002で実装したPortalメニューは通常モードでWCAG 2.1 AA基準（コントラスト比4.5:1以上）を達成している。しかし、視覚障害者向けの高コントラストモード（`@media (prefers-contrast: high)`）には未対応であり、より優れたアクセシビリティ提供の機会がある。

### 1.2 問題点・課題

**現状の実装（AccountSection/index.tsx:507）**:

```typescript
className = "w-full px-4 py-2 text-white hover:bg-white/10";
```

**問題**:

- 高コントラストモード設定時にメニュー項目のボーダーが不明瞭
- メニュー項目間の境界が視認しづらい
- ホバー状態の変化が分かりにくい（bg-white/10では薄すぎる）
- WCAG 2.1 AAA基準対応への移行が困難

### 1.3 放置した場合の影響

| 影響領域           | 影響度 | 詳細                                           |
| ------------------ | ------ | ---------------------------------------------- |
| アクセシビリティ   | 中     | 視覚障害者がメニュー項目を識別しづらい         |
| WCAG 2.1 AAA準拠   | 低     | AAA基準への将来的対応が困難になる              |
| インクルーシブ設計 | 中     | 多様なユーザーニーズへの対応不足               |
| ブランドイメージ   | 低     | アクセシビリティへの配慮不足と見なされる可能性 |

---

## 2. 何を達成するか（What）

### 2.1 目的

CSSメディアクエリ`@media (prefers-contrast: high)`を使用して、高コントラストモード時にメニュー項目のボーダーとホバー状態を強調表示し、視覚障害者により優れたアクセシビリティを提供する。

### 2.2 最終ゴール

高コントラストモード設定のユーザーが、メニュー項目の境界とホバー状態を明確に識別でき、すべての操作をストレスなく実行できる状態を実現する。通常モードのユーザー体験は維持する。

### 2.3 スコープ

#### 含むもの

- `@media (prefers-contrast: high)` メディアクエリ追加
- メニュー項目ボーダーの強調（border border-white）
- ホバー状態のコントラスト強化（bg-white/30）
- Tailwind CSS arbitrary variants使用（`[@media(prefers-contrast:high)]:`構文）
- アクセシビリティテスト追加（高コントラストモード検証）

#### 含まないもの

- 通常モードのスタイル変更（既にWCAG 2.1 AA達成済み）
- 他のコンポーネントへの適用（AccountSectionのみ、将来的に展開は別タスク）
- ダークモード・ライトモード分岐（高コントラストは両モード共通で対応）
- 高コントラストモード自動検出機能（ブラウザ標準機能を使用）

### 2.4 成果物

| 種別         | 成果物                                     | 配置先                                                                  |
| ------------ | ------------------------------------------ | ----------------------------------------------------------------------- |
| 実装         | 高コントラストモード対応className          | apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx |
| テスト       | 高コントラストモード表示テスト             | AccountSection/AccountSection.a11y.test.tsx                             |
| ドキュメント | UI/UXガイドライン更新（16.16.8セクション） | docs/00-requirements/16-ui-ux-guidelines.md                             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AUTH-UI-002（Portal実装）が完了している
- Tailwind CSS v3.1+（arbitrary variants対応）が利用可能
- AccountSection.a11y.test.tsx（15テスト）が存在し、全テスト成功
- axe-core自動テストで違反なし

### 3.2 依存タスク

- **前提タスク**: AUTH-UI-002（完了済み）
- **後続タスク**: なし（独立したタスク）
- **並行可能タスク**: AUTH-UI-003（Viewport境界判定）、AUTH-UI-005（防御的プログラミング）

### 3.3 必要な知識・スキル

| 知識領域                        | 必要レベル | 詳細                                        |
| ------------------------------- | ---------- | ------------------------------------------- |
| CSS Media Queries               | 中級       | prefers-contrast、prefers-color-scheme理解  |
| Tailwind CSS Arbitrary Variants | 中級       | `[@media(...)]:`構文の使用                  |
| アクセシビリティ                | 中級       | WCAG 2.1 AAA、視覚障害者向けUI設計          |
| React Testing Library           | 中級       | メディアクエリのモック（window.matchMedia） |
| Vitest                          | 初級       | モック作成、アサーション                    |

### 3.4 推奨アプローチ

**ステップ1**: Tailwind CSS arbitrary variantsで高コントラストモード対応を追加

**ステップ2**: アクセシビリティテストで検証

**実装パターン（推奨 - Tailwind CSS）**:

```typescript
<button
  role="menuitem"
  className="
    w-full px-4 py-2 text-white
    hover:bg-white/10
    [@media(prefers-contrast:high)]:border
    [@media(prefers-contrast:high)]:border-white
    [@media(prefers-contrast:high)]:hover:bg-white/30
  "
>
  アップロード
</button>
```

**代替アプローチ（カスタムCSS）**:

```css
@media (prefers-contrast: high) {
  [role="menuitem"] {
    border: 1px solid white;
  }
  [role="menuitem"]:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
}
```

---

## 4. 実行手順

### Phase構成

```
Phase 1: 実装（className更新、arbitrary variants追加）
   ↓
Phase 2: テスト追加（高コントラストモード検証、axe-core確認）
   ↓
Phase 3: ドキュメント更新（UI/UXガイドライン16.16.8更新）
```

---

### Phase 1: 実装

#### 目的

メニュー項目のclassNameに高コントラストモード対応のarbitrary variantsを追加し、ボーダーとホバー状態を強調表示する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @ui-designer
- **選定理由**: アクセシビリティとデザインシステムの専門家。Tailwind CSS arbitrary variantsに精通し、WCAG基準対応の経験豊富。
- **代替候補**: @code-quality（コード品質専門だが、今回はUI/アクセシビリティのため@ui-designerが最適）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名           | 活用方法                                   | 選定理由                           |
| ------------------ | ------------------------------------------ | ---------------------------------- |
| accessibility-wcag | WCAG 2.1 AAA対応、視覚障害者向けUI設計     | 高コントラストモードはWCAG AAA関連 |
| tailwind-advanced  | Arbitrary Variants活用、メディアクエリ統合 | Tailwind CSSの高度な機能が必要     |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                            | パス                                | 内容                                        |
| --------------------------------- | ----------------------------------- | ------------------------------------------- |
| 高コントラストモード対応className | AccountSection/index.tsx:507, 518等 | arbitrary variants追加（3-5箇所のmenuitem） |

#### 完了条件

- [ ] 全メニュー項目に`[@media(prefers-contrast:high)]:border`追加
- [ ] 全メニュー項目に`[@media(prefers-contrast:high)]:border-white`追加
- [ ] 全メニュー項目に`[@media(prefers-contrast:high)]:hover:bg-white/30`追加
- [ ] 既存の115テストが全て成功
- [ ] TypeScript型エラーなし
- [ ] Lintエラーなし

---

### Phase 2: テスト追加

#### 目的

高コントラストモード時にボーダーが表示されることを検証するテストを追加し、通常モードとaxe-core自動テストも継続成功することを確認する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests AccountSection/AccountSection.a11y.test.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @frontend-tester
- **選定理由**: アクセシビリティテストとメディアクエリモックの専門家。axe-core統合とReact Testing Library活用に精通。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名           | 活用方法                              | 選定理由                       |
| ------------------ | ------------------------------------- | ------------------------------ |
| accessibility-wcag | WCAG基準検証、axe-coreテスト          | アクセシビリティ準拠確認が必要 |
| vitest-advanced    | window.matchMediaモック、非同期テスト | メディアクエリのモックが必要   |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                              | パス                                     | 内容                           |
| ----------------------------------- | ---------------------------------------- | ------------------------------ |
| 高コントラストモードテスト（1-2件） | AccountSection.a11y.test.tsx（末尾追加） | 高コントラスト時のスタイル検証 |

#### 完了条件

- [ ] 「高コントラストモード時にボーダーが表示されること」テスト追加
- [ ] 通常モード表示テスト継続成功
- [ ] axe-core自動テストで違反なし（継続）
- [ ] 全テスト成功（115 + 新規1-2テスト = 116-117テスト）
- [ ] カバレッジ維持（≥93%）

---

### Phase 3: ドキュメント更新

#### 目的

UI/UXガイドラインの16.16.8セクション（ベストプラクティス）に高コントラストモード対応を追加し、再利用可能なパターンとして文書化する。

#### 使用エージェント

- **エージェント**: @spec-writer
- **選定理由**: テクニカルライターとして、アクセシビリティパターンを適切にドキュメント化できる。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                 | 活用方法                               | 選定理由                                 |
| ------------------------ | -------------------------------------- | ---------------------------------------- |
| technical-writing        | アクセシビリティパターンの明確な文書化 | 他の開発者が理解・再利用できる記述が必要 |
| markdown-advanced-syntax | コードブロック、テーブルの適切な使用   | ガイドライン文書の可読性確保             |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                      | パス                                        | 内容                                         |
| --------------------------- | ------------------------------------------- | -------------------------------------------- |
| 更新された16.16.8セクション | docs/00-requirements/16-ui-ux-guidelines.md | 高コントラストモード対応パターン追記、実装例 |

#### 完了条件

- [ ] 16.16.8「ベストプラクティス」セクションが更新されている
- [ ] 高コントラストモード対応の実装例が記載されている
- [ ] Tailwind CSS Arbitrary Variants構文が説明されている
- [ ] 代替アプローチ（カスタムCSS）も記載されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 高コントラストモード時にメニュー項目にボーダーが表示される
- [ ] 高コントラストモード時にホバー状態が強調される（bg-white/30）
- [ ] 通常モード時は既存スタイル維持（リグレッションなし）

### 品質要件

- [ ] 全テスト成功（116-117テスト）
- [ ] カバレッジ維持（≥93%）
- [ ] axe-core違反なし（継続）
- [ ] TypeScript型エラーなし
- [ ] Lintエラーなし
- [ ] 既存115テストが全て継続成功

### ドキュメント要件

- [ ] UI/UXガイドライン（16.16.8）が更新されている
- [ ] 実装パターンが再利用可能な形で文書化されている

---

## 6. 検証方法

### テストケース

| No  | テスト項目           | 操作                                | 期待結果                       |
| --- | -------------------- | ----------------------------------- | ------------------------------ |
| 1   | 通常モード           | デフォルト状態でメニュー表示        | ボーダーなし、既存スタイル維持 |
| 2   | 高コントラストモード | prefers-contrast:highでメニュー表示 | ボーダー表示、ホバー強調       |
| 3   | axe-core自動テスト   | axe-coreでスキャン                  | WCAG違反なし                   |
| 4   | 既存の全機能         | すべての既存テストを実行            | 全115テスト継続成功            |

### 検証手順

1. **実装確認**:

   ```bash
   # arbitrary variantsが追加されているか確認
   grep "@media(prefers-contrast:high)" apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx
   ```

2. **テスト実行**:

   ```bash
   pnpm vitest run AccountSection
   ```

3. **カバレッジ確認**:

   ```bash
   pnpm vitest run AccountSection --coverage
   ```

4. **axe-core確認**:
   ```bash
   pnpm vitest run AccountSection.a11y
   ```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                    | 対応Phase |
| -------------------------- | ------ | -------- | --------------------------------------- | --------- |
| Tailwind CSSバージョン依存 | 中     | 低       | Arbitrary Variantsサポート確認（v3.1+） | Phase 1   |
| ブラウザ互換性             | 低     | 低       | matchMediaのポリフィル（必要に応じて）  | Phase 2   |
| 既存スタイルとの競合       | 低     | 低       | CSS詳細度を確認、必要に応じて!important | Phase 1   |
| 通常モードへの影響         | 中     | 低       | 既存テストで回帰テスト実施              | Phase 2   |

---

## 8. 参照情報

### 関連ドキュメント

- [タスク実行仕様書](../auth-ui-z-index-fix/task-auth-ui-z-index-fix-specification.md)（AUTH-UI-002）
- [タスク完了報告](../auth-ui-z-index-fix/completion-summary.md)（AUTH-UI-002）
- [最終レビュー結果](../auth-ui-z-index-fix/review-final-t-07-1.md)（改善提案元）
- [UI/UXガイドライン - 16.3.4 アクセシビリティ対応](../../00-requirements/16-ui-ux-guidelines.md#1634-アクセシビリティ対応コントラスト比)

### 参考実装

- [AccountSection実装](../../apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx)
- [アクセシビリティテスト](../../apps/desktop/src/renderer/components/organisms/AccountSection/AccountSection.a11y.test.tsx)

### 参考資料

- [prefers-contrast - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast)
- [Tailwind CSS Arbitrary Variants](https://tailwindcss.com/docs/hover-focus-and-other-states#using-arbitrary-variants)
- [WCAG 2.1 AAA - Contrast Enhanced](https://www.w3.org/WAI/WCAG21/Understanding/contrast-enhanced.html)

---

## 9. 備考

### レビュー指摘の原文

```
【T-07-1 @ui-designer レビュー指摘】

優先度: MEDIUM（将来的な改善）

#### 2. 高コントラストモード対応

**現状**: カラーコントラスト比は基準達成済みだが、高コントラストモード未対応

**提案**:
@media (prefers-contrast: high) でメニュー項目にボーダーを追加。

**効果**: 視覚障害者により優れたアクセシビリティ提供
```

### 補足事項

- Tailwind CSS v3.1以降でarbitrary variantsが利用可能
- prefers-contrast は Chrome 96+、Firefox 101+、Safari 14.1+ でサポート
- 通常モードのスタイルには一切影響しない（メディアクエリで分離）
- 将来的に他のコンポーネントにも同様のパターンを適用可能

---

**作成日時**: 2025-12-20 23:35
**作成者**: @spec-writer（T-09-1サブタスク9.2）
**次回レビュー**: 実装完了時
