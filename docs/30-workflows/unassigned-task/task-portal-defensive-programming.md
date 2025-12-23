# Portal 実装 - 防御的プログラミング強化 - タスク指示書

## メタ情報

| 項目             | 内容                                   |
| ---------------- | -------------------------------------- |
| タスクID         | AUTH-UI-005                            |
| タスク名         | Portal 実装 - 防御的プログラミング強化 |
| 分類             | コード品質改善                         |
| 対象機能         | AccountSection Portal実装              |
| 優先度           | 中                                     |
| 見積もり規模     | 小規模（0.5日）                        |
| ステータス       | 未実施                                 |
| 発見元           | AUTH-UI-002 最終レビュー（Phase 7）    |
| 発見日           | 2025-12-20                             |
| 発見エージェント | @code-quality（T-07-1最終レビュー）    |
| 関連タスク       | AUTH-UI-002                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

AUTH-UI-002で実装したPortalメニューは機能的に正しく動作し、全115テストが成功している。しかし、極めて稀なエッジケース（ブラウザ初期化中のdocument.body未初期化、DOM操作例外）に対するエラーハンドリングが不足しており、予期しない環境でクラッシュする可能性がある。

### 1.2 問題点・課題

**1. Portal作成時のdocument.body存在確認欠如（AccountSection/index.tsx:494-529）**:

```typescript
// 現状
{isAvatarMenuOpen && menuPosition && createPortal(
  <div role="menu" ...>...</div>,
  document.body  // document.bodyがnullの場合を考慮していない
)}
```

**問題**:

- SSRやブラウザ初期化中にdocument.bodyがnullの場合、例外が発生
- エラーログがないため、問題の原因特定が困難

**2. getBoundingClientRect()の例外未処理（AccountSection/index.tsx:127-138）**:

```typescript
// 現状
const calculateMenuPosition = useCallback((): MenuPosition | null => {
  if (!avatarButtonRef.current) return null;
  const rect = avatarButtonRef.current.getBoundingClientRect(); // 例外発生の可能性
  return {
    top: rect.bottom + 8,
    left: rect.left,
  };
}, []);
```

**問題**:

- DOM要素が無効な状態でgetBoundingClientRect()が例外を投げる可能性
- try-catchがないため、アプリケーション全体がクラッシュする

### 1.3 放置した場合の影響

| 影響領域   | 影響度 | 詳細                                                     |
| ---------- | ------ | -------------------------------------------------------- |
| 安定性     | 低     | 極めて稀だがブラウザ初期化中にエラーが発生する可能性     |
| デバッグ性 | 中     | エラー発生時の原因特定が困難（ログがない）               |
| 保守性     | 中     | 防御的プログラミングの欠如により将来的なバグリスクが増加 |
| 本番環境   | 低     | 特定のブラウザ・環境でクラッシュする可能性               |

---

## 2. 何を達成するか（What）

### 2.1 目的

Portal作成とDOM API呼び出しに防御的プログラミングを適用し、エッジケースでのエラーハンドリングとログ出力を追加することで、コードの堅牢性とデバッグ性を向上させる。

### 2.2 最終ゴール

極めて稀なエッジケース（ブラウザ初期化中、DOM操作例外）でもアプリケーションがクラッシュせず、適切なエラーログ（`[AccountSection]`プレフィックス付き）を出力して安全にフォールバックする状態を実現する。

### 2.3 スコープ

#### 含むもの

- document.bodyの存在確認（null check）
- document.body未初期化時のエラーログ出力
- getBoundingClientRect() try-catch ラッピング
- DOM例外時のフォールバック位置設定（画面中央付近）
- エラーログ出力（console.error、プレフィックス: `[AccountSection]`）
- エッジケーステスト追加（2件）

#### 含まないもの

- ユーザーへのエラー通知UI（トースト等、ログのみで十分）
- 他のDOM API操作の防御的実装（現状で問題なし）
- 他のコンポーネント（AccountSection以外）への適用
- Error Boundaryの実装（親コンポーネントで対応済み）

### 2.4 成果物

| 種別         | 成果物                                     | 配置先                                                                  |
| ------------ | ------------------------------------------ | ----------------------------------------------------------------------- |
| 実装         | 防御的プログラミングを適用したPortal描画   | apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx |
| 実装         | try-catch追加のcalculateMenuPosition()     | apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx |
| テスト       | エラーハンドリングテスト（2件）            | AccountSection/AccountSection.portal.test.tsx                           |
| ドキュメント | UI/UXガイドライン更新（16.16.9セクション） | docs/00-requirements/16-ui-ux-guidelines.md                             |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- AUTH-UI-002（Portal実装）が完了している
- AccountSection.portal.test.tsx（27テスト）が存在し、全テスト成功
- TypeScript strict mode有効
- console.errorのモックが可能（Vitest環境）

### 3.2 依存タスク

- **前提タスク**: AUTH-UI-002（完了済み）
- **後続タスク**: なし（独立したタスク）
- **並行可能タスク**: AUTH-UI-003（Viewport境界判定）、AUTH-UI-004（高コントラストモード）

### 3.3 必要な知識・スキル

| 知識領域              | 必要レベル | 詳細                                       |
| --------------------- | ---------- | ------------------------------------------ |
| 防御的プログラミング  | 中級       | null check、try-catch、フォールバック値    |
| React Error Handling  | 中級       | エラーバウンダリーとの使い分け             |
| DOM API               | 中級       | getBoundingClientRect()、document.body     |
| TypeScript            | 中級       | 型ガード、Optional Chaining、null check    |
| React Testing Library | 中級       | Object.defineProperty、console.errorモック |
| Vitest                | 中級       | モック、スパイ、例外テスト                 |

### 3.4 推奨アプローチ

**アプローチ1: Portal作成の防御的実装**

```typescript
{isAvatarMenuOpen && menuPosition && (() => {
  const portalRoot = document.body;
  if (!portalRoot) {
    console.error('[AccountSection] Portal root (document.body) not found');
    return null;
  }

  return createPortal(
    <div role="menu" ...>
      {/* メニュー項目 */}
    </div>,
    portalRoot
  );
})()}
```

**アプローチ2: getBoundingClientRect()の防御的実装**

```typescript
const calculateMenuPosition = useCallback((): MenuPosition | null => {
  if (!avatarButtonRef.current) return null;

  try {
    const rect = avatarButtonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left,
    };
  } catch (error) {
    console.error("[AccountSection] Failed to calculate menu position:", error);
    // フォールバック位置（画面中央付近）
    return {
      top: 100,
      left: 100,
    };
  }
}, []);
```

---

## 4. 実行手順

### Phase構成

```
Phase 1: 実装（null check、try-catch、エラーログ追加）
   ↓
Phase 2: テスト追加（エラーケーステスト、console.errorモック検証）
   ↓
Phase 3: ドキュメント更新（UI/UXガイドライン16.16.9更新）
```

---

### Phase 1: 実装

#### 目的

Portal作成とDOM API呼び出しに防御的プログラミング（null check、try-catch、エラーログ）を適用する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @code-quality
- **選定理由**: 防御的プログラミング、Clean Code原則、エラーハンドリングパターンの専門家。コード品質とデバッグ性向上に精通。
- **代替候補**: @logic-dev（ビジネスロジック専門だが、今回はコード品質改善のため@code-qualityが最適）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                | 活用方法                              | 選定理由                                 |
| ----------------------- | ------------------------------------- | ---------------------------------------- |
| clean-code-practices    | 防御的プログラミング、null check      | エッジケース対応のベストプラクティス適用 |
| error-handling-patterns | try-catch、フォールバック値、ログ出力 | 適切なエラーハンドリング戦略が必要       |
| refactoring-techniques  | Extract Method維持、既存コードの保全  | 既存の綺麗な構造を崩さずに改善           |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                                      | パス                             | 内容                                          |
| ------------------------------------------- | -------------------------------- | --------------------------------------------- |
| 防御的実装を追加したPortal描画              | AccountSection/index.tsx:494-529 | document.body null check、エラーログ追加      |
| 防御的実装を追加したcalculateMenuPosition() | AccountSection/index.tsx:127-145 | try-catch、フォールバック位置、エラーログ追加 |

#### 完了条件

- [ ] Portal描画でdocument.body存在確認を追加
- [ ] document.body未初期化時のエラーログ出力を追加（`[AccountSection]`プレフィックス）
- [ ] calculateMenuPosition()をtry-catchでラッピング
- [ ] DOM例外時のフォールバック位置を設定（top: 100, left: 100）
- [ ] catch節でエラーログ出力を追加（`[AccountSection]`プレフィックス）
- [ ] 既存の115テストが全て成功
- [ ] TypeScript型エラーなし
- [ ] Lintエラーなし

---

### Phase 2: テスト追加

#### 目的

document.body null ケースとgetBoundingClientRect例外ケースのエッジケーステストを追加し、エラーログが正しく出力されることを検証する。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests AccountSection/AccountSection.portal.test.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @frontend-tester
- **選定理由**: React Testing Libraryのエッジケーステスト設計専門家。Object.definePropertyやconsole.errorモックに精通。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                | 活用方法                                   | 選定理由                            |
| ----------------------- | ------------------------------------------ | ----------------------------------- |
| boundary-value-analysis | エッジケースの特定（null、例外）           | エラーハンドリングの境界値テスト    |
| test-doubles            | console.errorスパイ、Object.defineProperty | エラーログ検証とDOM操作モックが必要 |
| vitest-advanced         | vi.spyOn、モック復元、例外テスト           | Vitestの高度なモック機能が必要      |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                    | パス                                       | 内容                                          |
| ------------------------- | ------------------------------------------ | --------------------------------------------- |
| エッジケーステスト（2件） | AccountSection.portal.test.tsx（末尾追加） | document.body null、getBoundingClientRect例外 |

#### 完了条件

- [ ] 「document.bodyがnullの場合でもエラーを投げないこと」テスト追加
- [ ] 「getBoundingClientRect()が例外を投げた場合にフォールバック位置が使用されること」テスト追加
- [ ] console.errorモックでエラーログ出力を検証
- [ ] 既存テスト全成功
- [ ] 全テスト成功（115 + 新規2テスト = 117テスト）
- [ ] カバレッジ維持または向上（≥93%）

---

### Phase 3: ドキュメント更新

#### 目的

UI/UXガイドラインの16.16.9セクション（注意事項）に防御的プログラミングパターンを追加し、推奨パターンとして文書化する。

#### 使用エージェント

- **エージェント**: @spec-writer
- **選定理由**: テクニカルライターとして、ベストプラクティスを適切にドキュメント化できる。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                 | 活用方法                                   | 選定理由                               |
| ------------------------ | ------------------------------------------ | -------------------------------------- |
| technical-writing        | 防御的プログラミングパターンの明確な文書化 | 他の開発者が理解・適用できる記述が必要 |
| markdown-advanced-syntax | コードブロック、テーブルの適切な使用       | ガイドライン文書の可読性確保           |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                      | パス                                        | 内容                                           |
| --------------------------- | ------------------------------------------- | ---------------------------------------------- |
| 更新された16.16.9セクション | docs/00-requirements/16-ui-ux-guidelines.md | 防御的プログラミングパターン追記、実装例コード |

#### 完了条件

- [ ] 16.16.9「注意事項」セクションに防御的プログラミング項目追加
- [ ] document.body確認パターンが記載されている
- [ ] try-catchパターンが記載されている
- [ ] エラーログ出力の推奨形式が記載されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] document.bodyがnullの場合にnullを返す（エラーを投げない）
- [ ] getBoundingClientRect例外時にフォールバック位置を使用
- [ ] 通常動作は変更なし（既存115テスト全成功）

### 品質要件

- [ ] 全テスト成功（117テスト）
- [ ] カバレッジ維持または向上（≥93%、目標95%）
- [ ] TypeScript型エラーなし
- [ ] Lintエラーなし
- [ ] console.errorモック検証成功
- [ ] 既存115テストが全て継続成功（リグレッションなし）

### ドキュメント要件

- [ ] UI/UXガイドライン（16.16.9）が更新されている
- [ ] 防御的プログラミングパターンが文書化されている
- [ ] 実装例コードが記載されている

---

## 6. 検証方法

### テストケース

| No  | テスト項目                | 操作                                      | 期待結果                                      |
| --- | ------------------------- | ----------------------------------------- | --------------------------------------------- |
| 1   | document.bodyがnull       | document.bodyをnullに設定してレンダリング | エラーを投げず、console.errorログ出力         |
| 2   | getBoundingClientRect例外 | getBoundingClientRectをモックして例外     | フォールバック位置使用、console.errorログ出力 |
| 3   | 通常動作                  | 正常なDOM状態でメニュー操作               | 既存機能が継続動作                            |
| 4   | 既存の全機能              | すべての既存テストを実行                  | 全115テスト継続成功                           |

### 検証手順

1. **実装確認**:

   ```bash
   # null checkが追加されているか確認
   grep -A 5 "portalRoot" apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx

   # try-catchが追加されているか確認
   grep -A 10 "try {" apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx
   ```

2. **テスト実行**:

   ```bash
   pnpm vitest run AccountSection
   ```

3. **カバレッジ確認**:

   ```bash
   pnpm vitest run AccountSection --coverage
   ```

4. **console.errorログ確認**:
   ```bash
   # テスト実行時にconsole.errorモックが呼ばれることを確認
   pnpm vitest run AccountSection.portal --reporter=verbose
   ```

---

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                       | 対応Phase |
| --------------------------------- | ------ | -------- | ------------------------------------------ | --------- |
| フォールバック位置が不適切        | 低     | 低       | ユーザー視点で妥当な位置（画面中央）を設定 | Phase 1   |
| エラーログの過剰出力              | 低     | 低       | 条件分岐で必要な場合のみログ出力           | Phase 1   |
| try-catchによるパフォーマンス低下 | 低     | 極低     | try-catchのコストは無視できるレベル        | Phase 1   |
| 既存機能への影響                  | 中     | 低       | 既存115テストで回帰テスト実施              | Phase 2   |
| テストモックの複雑化              | 低     | 中       | 適切なクリーンアップ処理を実装             | Phase 2   |

---

## 8. 参照情報

### 関連ドキュメント

- [タスク実行仕様書](../auth-ui-z-index-fix/task-auth-ui-z-index-fix-specification.md)（AUTH-UI-002）
- [タスク完了報告](../auth-ui-z-index-fix/completion-summary.md)（AUTH-UI-002）
- [最終レビュー結果](../auth-ui-z-index-fix/review-final-t-07-1.md)（改善提案元）
- [UI/UXガイドライン - 16.16 Portal実装パターン](../../00-requirements/16-ui-ux-guidelines.md#1616-portal実装パターン)
- [エラーハンドリング仕様](../../00-requirements/07-error-handling.md)

### 参考実装

- [AccountSection実装](../../apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx)
- [Portalテスト](../../apps/desktop/src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx)

### 参考資料

- [Error Handling in React](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [getBoundingClientRect - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
- [Defensive Programming Best Practices](https://en.wikipedia.org/wiki/Defensive_programming)

---

## 9. 備考

### レビュー指摘の原文

```
【T-07-1 @code-quality レビュー指摘】

優先度: MEDIUM（次回リファクタリング時に対応）

#### 1. Portalエラーハンドリング追加（行77-79）
**現状**: document.bodyの存在確認なし
**提案**: null checkとエラーログ出力を追加

#### 2. getBoundingClientRect防御的実装（行32-43）
**現状**: 例外処理なし
**提案**: try-catchによる例外処理とフォールバック位置設定

**効果**: 極端なエッジケースでのクラッシュ防止、デバッグ性向上
```

### 補足事項

- エラーログのプレフィックス`[AccountSection]`で問題箇所を即座に特定可能
- フォールバック位置（100, 100）は暫定値、画面中央付近を想定
- document.bodyがnullになるケースは極めて稀（SSR、ブラウザ初期化中のみ）
- getBoundingClientRect例外も極めて稀（DOM要素が無効状態のみ）
- 既存テストは正常系のみカバー、エッジケーステストを追加することでカバレッジ向上

---

**作成日時**: 2025-12-20 23:35
**作成者**: @spec-writer（T-09-1サブタスク9.2）
**次回レビュー**: 実装完了時
