# Portal メニュー - Viewport境界判定実装 - タスク指示書

## メタ情報

| 項目             | 内容                                   |
| ---------------- | -------------------------------------- |
| タスクID         | AUTH-UI-003                            |
| タスク名         | Portal メニュー - Viewport境界判定実装 |
| 分類             | 改善・機能追加                         |
| 対象機能         | AccountSection アバターメニュー        |
| 優先度           | 中                                     |
| 見積もり規模     | 小規模（0.5日）                        |
| ステータス       | 未実施                                 |
| 発見元           | AUTH-UI-002 最終レビュー（Phase 7）    |
| 発見日           | 2025-12-20                             |
| 発見エージェント | @ui-designer（T-07-1最終レビュー）     |
| 関連タスク       | AUTH-UI-002                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AUTH-UI-002でReact Portalを使用してアバターメニューを実装し、WCAG 2.1 AA基準を達成したが、メニュー位置計算で画面下部の境界判定が未実装。アバターボタンが画面下部にある場合、メニューがViewport外にはみ出す可能性がある。

### 1.2 問題点・課題

**現状の実装（AccountSection/index.tsx:127-138）**:

```typescript
const calculateMenuPosition = useCallback((): MenuPosition | null => {
  if (!avatarButtonRef.current) return null;
  const rect = avatarButtonRef.current.getBoundingClientRect();
  return {
    top: rect.bottom + 8, // 常に下方向に表示
    left: rect.left,
  };
}, []);
```

**問題**:

- アバターボタンが画面下部（Y座標が高い位置）にある場合、メニューが画面外にはみ出す
- ユーザーがメニュー項目を視認・クリックできない（スクロールが必要）
- キーボードユーザーがフォーカス移動できない可能性

### 1.3 放置した場合の影響

| 影響領域         | 影響度 | 詳細                                             |
| ---------------- | ------ | ------------------------------------------------ |
| ユーザビリティ   | 中     | 画面下部でメニューが見えない、操作できない       |
| アクセシビリティ | 中     | キーボードユーザーが項目にアクセスできない可能性 |
| UX               | 中     | 期待と異なる動作（メニューが見えない）           |
| 顧客満足度       | 低     | 一部のユーザーが機能を使いづらいと感じる         |

---

## 2. 何を達成するか（What）

### 2.1 目的

Portal メニューの位置計算ロジックにViewport境界判定を追加し、画面下部でメニューが開く場合は上方向に表示することで、メニューが常にViewport内に収まるようにする。

### 2.2 最終ゴール

アバターボタンの画面上の位置（上部・中央・下部）に関わらず、メニューが常にViewport内に完全表示され、ユーザーがすべてのメニュー項目に視認・アクセス可能な状態を実現する。

### 2.3 スコープ

#### 含むもの

- Viewport高さ（window.innerHeight）とメニュー高さの比較ロジック
- 上方向表示時の位置計算（rect.top - menuHeight - 8）
- MENU_HEIGHT定数の定義
- 境界値テストケース追加（画面下部での動作検証）
- UI/UXガイドライン更新（16.16.3セクション）

#### 含まないもの

- 左右方向の境界判定（現状でメニュー幅が小さく問題なし）
- メニューサイズの動的計算（固定値で十分、将来的に必要なら別タスク）
- 他のPortal実装コンポーネントへの適用（AccountSectionのみ）
- メニュー項目数の動的変更対応（現状は固定項目数）

### 2.4 成果物

| 種別         | 成果物                                     | 配置先                                                                  |
| ------------ | ------------------------------------------ | ----------------------------------------------------------------------- |
| 実装         | 改善されたcalculateMenuPosition()関数      | apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx |
| 実装         | MENU_HEIGHT定数定義                        | apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx |
| テスト       | Viewport境界値テスト（2-3テストケース）    | AccountSection/AccountSection.portal.test.tsx                           |
| ドキュメント | UI/UXガイドライン更新（16.16.3セクション） | docs/00-requirements/16-ui-ux-guidelines.md                             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AUTH-UI-002（Portal実装）が完了している
- AccountSection.portal.test.tsx（27テスト）が存在し、全テスト成功
- MenuPosition型が定義されている（index.tsx:24-29）
- calculateMenuPosition()ヘルパー関数が実装されている（index.tsx:127-138）

### 3.2 依存タスク

- **前提タスク**: AUTH-UI-002（完了済み）
- **後続タスク**: なし（独立したタスク）
- **並行可能タスク**: AUTH-UI-004（高コントラストモード）、AUTH-UI-005（防御的プログラミング）

### 3.3 必要な知識・スキル

| 知識領域              | 必要レベル | 詳細                                        |
| --------------------- | ---------- | ------------------------------------------- |
| React Hooks           | 中級       | useCallback、useRefの理解                   |
| DOM API               | 中級       | getBoundingClientRect()、window.innerHeight |
| CSS Positioning       | 中級       | fixed position、top/bottomの計算            |
| TypeScript            | 中級       | MenuPosition型、条件分岐の型安全性          |
| React Testing Library | 中級       | 境界値テスト、window/DOMのモック            |
| Vitest                | 初級       | テスト実行、モック作成                      |

### 3.4 推奨アプローチ

**ステップ1**: MENU_HEIGHT定数を定義（実測値+余裕20px程度）

**ステップ2**: calculateMenuPosition()にViewport判定ロジック追加

**実装パターン**:

```typescript
const MENU_HEIGHT = 200; // メニューの高さ（概算値: 実測180px + 余裕20px）

const calculateMenuPosition = useCallback((): MenuPosition | null => {
  if (!avatarButtonRef.current) return null;
  const rect = avatarButtonRef.current.getBoundingClientRect();
  const menuTop = rect.bottom + 8;

  // Viewport境界判定
  if (menuTop + MENU_HEIGHT > window.innerHeight) {
    // 上方向に表示（画面下部の場合）
    return {
      top: rect.top - MENU_HEIGHT - 8,
      left: rect.left,
    };
  }

  // 下方向に表示（デフォルト）
  return {
    top: menuTop,
    left: rect.left,
  };
}, []);
```

**ステップ3**: 境界値テストを追加

**ステップ4**: 既存115テストが全成功することを確認

---

## 4. 実行手順

### Phase構成

```
Phase 1: 実装（MENU_HEIGHT定義、Viewport判定ロジック追加）
   ↓
Phase 2: テスト追加（境界値テスト、既存テスト回帰確認）
   ↓
Phase 3: ドキュメント更新（UI/UXガイドライン16.16.3更新）
```

---

### Phase 1: 実装

#### 目的

calculateMenuPosition()関数にViewport境界判定ロジックを追加し、画面下部でメニューが上方向に表示されるようにする。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @code-quality
- **選定理由**: リファクタリングとコード品質改善の専門家。条件分岐の追加と可読性維持に精通。
- **代替候補**: @ui-designer（UI実装の専門家だが、今回はロジック改善のため@code-qualityが最適）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名               | 活用方法                                              | 選定理由                           |
| ---------------------- | ----------------------------------------------------- | ---------------------------------- |
| refactoring-techniques | Extract Method維持、条件分岐の最適化                  | 既存ヘルパー関数を拡張する必要あり |
| clean-code-practices   | マジックナンバー除去（MENU_HEIGHT定数化）、意図明確化 | 定数定義と条件分岐の可読性が重要   |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                            | パス                                 | 内容                               |
| --------------------------------- | ------------------------------------ | ---------------------------------- |
| MENU_HEIGHT定数                   | AccountSection/index.tsx（先頭付近） | メニュー高さ定数（200px程度）      |
| 改善されたcalculateMenuPosition() | AccountSection/index.tsx:127-150     | Viewport判定ロジック追加（約20行） |

#### 完了条件

- [ ] MENU_HEIGHT定数を定義（値: 200px程度）
- [ ] window.innerHeightとの比較ロジックを追加
- [ ] 上方向表示時の位置計算を実装（rect.top - MENU_HEIGHT - 8）
- [ ] 既存の115テストが全て成功
- [ ] TypeScript型エラーなし
- [ ] Lintエラーなし

---

### Phase 2: テスト追加

#### 目的

画面下部でメニューが上方向に表示されることを検証する境界値テストを追加し、既存機能が継続動作することを確認する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests AccountSection/AccountSection.portal.test.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @frontend-tester
- **選定理由**: React Testing Libraryとビジュアル系の境界値テスト設計に精通。window/DOMモックの専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                | 活用方法                                       | 選定理由                             |
| ----------------------- | ---------------------------------------------- | ------------------------------------ |
| boundary-value-analysis | 境界値ケースの特定（画面下部、ギリギリ収まる） | Viewport境界の境界値テストに必須     |
| vitest-advanced         | window.innerHeightモック、非同期テスト         | DOMプロパティのモックが必要          |
| test-naming-conventions | テスト名の明確化（日本語/英語）                | 境界値テストであることを明示する必要 |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                      | パス                                       | 内容                                       |
| --------------------------- | ------------------------------------------ | ------------------------------------------ |
| 境界値テストケース（2-3件） | AccountSection.portal.test.tsx（末尾追加） | 画面下部での上方向表示、通常時の下方向表示 |

#### 完了条件

- [ ] 「画面下部でメニューが上方向に表示されること」テスト追加
- [ ] 「ギリギリ下に収まる場合は下方向表示」テスト追加（任意）
- [ ] 通常時の下方向表示テスト継続成功
- [ ] 全テスト成功（115 + 新規2-3テスト = 117-118テスト）
- [ ] カバレッジ維持（≥93%）

---

### Phase 3: ドキュメント更新

#### 目的

UI/UXガイドラインの16.16.3セクション（基本実装パターン）をViewport判定対応版に更新し、再利用可能なパターンとして文書化する。

#### 使用エージェント

- **エージェント**: @spec-writer
- **選定理由**: テクニカルライターとして、実装パターンを適切にドキュメント化できる。Single Source of Truth原則の遵守に精通。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                 | 活用方法                                     | 選定理由                                 |
| ------------------------ | -------------------------------------------- | ---------------------------------------- |
| technical-writing        | 実装パターンの明確な文書化                   | 他の開発者が理解・再利用できる記述が必要 |
| markdown-advanced-syntax | コードブロック、テーブル、リストの適切な使用 | ガイドライン文書の可読性確保             |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                      | パス                                        | 内容                                         |
| --------------------------- | ------------------------------------------- | -------------------------------------------- |
| 更新された16.16.3セクション | docs/00-requirements/16-ui-ux-guidelines.md | Viewport判定ロジック追記、サンプルコード更新 |

#### 完了条件

- [ ] 16.16.3「位置計算ヘルパー関数」セクションが更新されている
- [ ] MENU_HEIGHT定数の定義が記載されている
- [ ] Viewport判定の条件分岐が説明されている
- [ ] サンプルコードが最新版に更新されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] メニューが画面下部で上方向に表示される
- [ ] メニューが通常位置（上部・中央）で下方向に表示される（既存動作維持）
- [ ] すべてのメニュー項目がViewport内に収まる

### 品質要件

- [ ] 全テスト成功（117-118テスト）
- [ ] カバレッジ維持（≥93%）
- [ ] TypeScript型エラーなし
- [ ] Lintエラーなし
- [ ] 既存115テストが全て継続成功（リグレッションなし）

### ドキュメント要件

- [ ] UI/UXガイドライン（16.16.3）が更新されている
- [ ] 実装パターンが再利用可能な形で文書化されている

---

## 6. 検証方法

### テストケース

| No  | テスト項目                   | 操作                                   | 期待結果               |
| --- | ---------------------------- | -------------------------------------- | ---------------------- |
| 1   | 通常時（画面上部・中央）     | アバターボタンをクリック               | メニューが下方向に表示 |
| 2   | 境界値（画面下部）           | window.innerHeight=600でボタンクリック | メニューが上方向に表示 |
| 3   | 境界値（ギリギリ下に収まる） | 計算上ギリギリViewport内に収まる位置   | メニューが下方向に表示 |
| 4   | 既存の全機能                 | すべての既存テストを実行               | 全115テスト継続成功    |

### 検証手順

1. **実装確認**:

   ```bash
   # MENU_HEIGHT定数が定義されているか確認
   grep "MENU_HEIGHT" apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx
   ```

2. **テスト実行**:

   ```bash
   pnpm vitest run AccountSection
   ```

3. **カバレッジ確認**:
   ```bash
   pnpm vitest run AccountSection --coverage
   ```

---

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                    | 対応Phase |
| -------------------------------- | ------ | -------- | --------------------------------------- | --------- |
| MENU_HEIGHT固定値の不正確さ      | 低     | 中       | 余裕を持った値（実測+20px程度）を設定   | Phase 1   |
| 画面が極端に小さい場合の対応不足 | 低     | 低       | 最小ウィンドウサイズ（800x600px）を前提 | Phase 1   |
| リファクタリングによるデグレード | 中     | 低       | 既存115テストで回帰テスト実施           | Phase 2   |
| 上方向表示時のボタン隠れ         | 低     | 低       | 十分なマージン（8px）を確保             | Phase 1   |

---

## 8. 参照情報

### 関連ドキュメント

- [タスク実行仕様書](../auth-ui-z-index-fix/task-auth-ui-z-index-fix-specification.md)（AUTH-UI-002）
- [タスク完了報告](../auth-ui-z-index-fix/completion-summary.md)（AUTH-UI-002）
- [最終レビュー結果](../auth-ui-z-index-fix/review-final-t-07-1.md)（改善提案元）
- [UI/UXガイドライン - 16.16 Portal実装パターン](../../00-requirements/16-ui-ux-guidelines.md#1616-portal実装パターン)

### 参考実装

- [AccountSection実装](../../apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx)
- [Portalテスト](../../apps/desktop/src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx)

### 参考資料

- [getBoundingClientRect - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
- [Window.innerHeight - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Window/innerHeight)
- [WAI-ARIA Menu Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu/)

---

## 9. 備考

### レビュー指摘の原文

```
【T-07-1 @ui-designer レビュー指摘】

優先度: MEDIUM（将来的な改善）

#### 1. メニュー位置のViewport外判定

**現状**: メニューが画面下部で開く場合、Viewport外にはみ出す可能性

**提案**:
calculateMenuPosition()にwindow.innerHeightとの比較を追加し、
画面下部の場合は上方向に表示する。

**効果**: 画面下部でメニューがViewport外にはみ出さない
```

### 補足事項

- MENU_HEIGHT値は将来的にメニュー項目が増減した場合に調整が必要
- 現状のメニュー項目数（3-5項目）では200pxで十分
- 極端に小さい画面（<600px）は想定外（最小ウィンドウサイズ800x600pxが前提）
- 左右方向の判定は不要（メニュー幅192px、画面幅≥800pxで問題なし）

---

**作成日時**: 2025-12-20 23:30
**作成者**: @spec-writer（T-09-1サブタスク9.2）
**次回レビュー**: 実装完了時
