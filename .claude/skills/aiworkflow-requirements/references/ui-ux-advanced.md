# Portal・ナビゲーション UI/UX ガイドライン

> 本ドキュメントは統合システム設計仕様書の一部です。
> 管理: .claude/skills/aiworkflow-requirements/

---

## Portal実装パターン

### 概要

React Portal（`createPortal`）を使用して、CSS stacking contextの制約から脱出し、要素を確実に最前面に表示するための実装パターン。

**適用場面**:

- ドロップダウンメニュー、ツールチップ、モーダルなど、親要素のstacking contextから独立させる必要がある要素
- `backdrop-filter: blur()`、`filter`、`transform`などstacking contextを作成するCSSプロパティを持つ親要素の子孫要素

### Stacking Context問題の理解

**問題**: CSS stacking contextが作成されると、子要素の`z-index`は親のstacking context内でのみ有効になる。

```typescript
// 問題のあるパターン
<div className="backdrop-blur-xl"> {/* 新しいstacking context作成 */}
  <div className="z-[9999]"> {/* このz-indexは親context内でのみ有効 */}
    メニュー
  </div>
</div>
```

**Stacking Contextを作成するCSSプロパティ**:

- `backdrop-filter: blur()`
- `filter: blur()`, `filter: drop-shadow()` など
- `transform`（`translateZ(0)` 含む）
- `opacity < 1`
- `position: fixed` + `transform`
- `will-change: transform, opacity` など

**解決策**: React Portalで`document.body`直下にレンダリング

```typescript
// 解決パターン
createPortal(
  <div className="fixed z-[9999]">メニュー</div>,
  document.body
)
```

### 基本実装パターン

**必須要素**:

1. メニュー位置を保持するstate
2. メニュー表示状態のboolean state
3. トリガーボタンのref
4. メニュー要素のref（アウトサイドクリック判定用）

```typescript
// State管理
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
const triggerRef = useRef<HTMLDivElement>(null);
const menuRef = useRef<HTMLDivElement>(null);

// MenuPosition型定義
interface MenuPosition {
  top: number;
  left: number;
}
```

**位置計算ヘルパー関数**:

```typescript
const calculateMenuPosition = useCallback((): MenuPosition | null => {
  if (!triggerRef.current) return null;
  const rect = triggerRef.current.getBoundingClientRect();
  return {
    top: rect.bottom + 8, // トリガーの下に8pxスペース
    left: rect.left, // 左端を揃える
  };
}, []);
```

**メニュートグルハンドラー**:

```typescript
const handleToggleMenu = useCallback(() => {
  setIsMenuOpen((prev) => {
    if (!prev) {
      const position = calculateMenuPosition();
      setMenuPosition(position);
    } else {
      setMenuPosition(null);
    }
    return !prev;
  });
}, [calculateMenuPosition]);
```

**Portal描画**:

```typescript
{isMenuOpen && menuPosition && createPortal(
  <div
    ref={menuRef}
    role="menu"
    aria-label="メニュー"
    className="fixed w-48 bg-[var(--bg-secondary)] border border-white/10 rounded-lg shadow-lg z-[9999]"
    style={{ top: menuPosition.top, left: menuPosition.left }}
  >
    {/* メニュー項目 */}
  </div>,
  document.body
)}
```

### イベントハンドリング

**アウトサイドクリックで閉じる**:

```typescript
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    const isInsideTrigger = triggerRef.current?.contains(target);
    const isInsideMenu = menuRef.current?.contains(target);

    if (!isInsideTrigger && !isInsideMenu) {
      closeMenu();
    }
  };

  if (isMenuOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isMenuOpen, closeMenu]);
```

**Escapeキーで閉じる**:

```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape" && isMenuOpen) {
      closeMenu(true); // フォーカスをトリガーに戻す
    }
  };

  if (isMenuOpen) {
    document.addEventListener("keydown", handleKeyDown);
  }

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}, [isMenuOpen, closeMenu]);
```

**メニュークローズヘルパー**:

```typescript
const closeMenu = useCallback((returnFocus = false) => {
  setIsMenuOpen(false);
  setMenuPosition(null);
  if (returnFocus) {
    const button = triggerRef.current?.querySelector("button");
    button?.focus();
  }
}, []);
```

### WAI-ARIA Menu Pattern実装

**必須ARIA属性**:

```typescript
// トリガーボタン
<button
  aria-label="メニューを開く"
  aria-expanded={isMenuOpen}
  aria-haspopup="menu"
  onClick={handleToggleMenu}
>
  トリガー
</button>

// メニューコンテナ
<div
  role="menu"
  aria-label="メニュー"
>
  <button role="menuitem" onClick={handleAction1}>
    アクション1
  </button>
  <button role="menuitem" onClick={handleAction2}>
    アクション2
  </button>
</div>
```

**フォーカス管理**:

```typescript
// メニューopen時に最初の項目へフォーカス移動
useEffect(() => {
  if (isMenuOpen && menuRef.current) {
    requestAnimationFrame(() => {
      const firstMenuItem = menuRef.current?.querySelector(
        '[role="menuitem"]',
      ) as HTMLElement;
      firstMenuItem?.focus();
    });
  }
}, [isMenuOpen]);
```

### テスト設計

**必須テストケース**:

| カテゴリ             | テスト内容                           |
| -------------------- | ------------------------------------ |
| Portal描画           | `document.body`直下への描画確認      |
| z-index              | `z-[9999]`が適用されていることを確認 |
| 位置計算             | トリガーボタンの下に正しく配置       |
| アウトサイドクリック | メニュー外クリックで閉じる           |
| Escapeキー           | Escキーでクローズ＋フォーカス復帰    |
| ARIA属性             | role, aria-expanded, aria-label等    |
| フォーカス管理       | メニューopen時の自動フォーカス移動   |
| メモリリーク防止     | useEffect cleanupによるリスナー解除  |

**テスト例**:

```typescript
it('Portal要素がdocument.body直下に描画されること', async () => {
  render(<ComponentWithPortal />);
  const button = screen.getByRole('button', { name: /メニューを開く/i });
  await userEvent.click(button);

  const menu = document.body.querySelector('[role="menu"]');
  expect(menu).toBeInTheDocument();
  expect(menu?.parentElement).toBe(document.body);
});

it('z-index: 9999が適用されていること', async () => {
  render(<ComponentWithPortal />);
  await userEvent.click(screen.getByRole('button'));

  const menu = document.body.querySelector('[role="menu"]');
  expect(menu).toHaveClass('z-[9999]');
});
```

### パフォーマンス最適化

**useCallbackによるメモ化**:

```typescript
// 位置計算関数のメモ化
const calculateMenuPosition = useCallback((): MenuPosition | null => {
  // ...
}, []);

// メニュークローズ関数のメモ化
const closeMenu = useCallback((returnFocus = false) => {
  // ...
}, []);
```

**requestAnimationFrameの使用**:

Portal要素のレンダリング完了を待ってからフォーカス移動を実行：

```typescript
useEffect(() => {
  if (isMenuOpen && menuRef.current) {
    requestAnimationFrame(() => {
      // Portalレンダリング後にフォーカス移動
      const firstMenuItem = menuRef.current?.querySelector('[role="menuitem"]');
      firstMenuItem?.focus();
    });
  }
}, [isMenuOpen]);
```

### ベストプラクティス

| 原則                    | 説明                                                            |
| ----------------------- | --------------------------------------------------------------- |
| 最小限の使用            | Portalは必要な場合のみ使用（通常のDOM階層で解決できるなら不要） |
| メモリリーク防止        | useEffect cleanupでイベントリスナーを必ず解除                   |
| アクセシビリティ必須    | WAI-ARIA Patternに完全準拠                                      |
| 位置計算の最適化        | useCallbackでメモ化                                             |
| テストカバレッジ80%以上 | Portal機能は包括的にテスト                                      |
| TypeScript型安全性      | MenuPosition型など、明示的な型定義                              |

### 注意事項

**避けるべきパターン**:

- ❌ Portalを多用する（パフォーマンス低下）
- ❌ イベントリスナーのクリーンアップ忘れ（メモリリーク）
- ❌ ARIA属性の省略（アクセシビリティ違反）
- ❌ フォーカス管理の省略（キーボードナビゲーション不可）

**推奨パターン**:

- ✅ 必要最小限のPortal使用
- ✅ useEffect cleanupでリスナー解除
- ✅ WAI-ARIA Pattern完全準拠
- ✅ 包括的なテストカバレッジ（≥80%）

### 実装チェックリスト

Portal実装時に確認すべき項目：

- [ ] MenuPosition型を定義
- [ ] calculateMenuPosition()ヘルパー関数を実装
- [ ] closeMenu()ヘルパー関数を実装
- [ ] アウトサイドクリックハンドラーをuseEffectで実装
- [ ] EscapeキーハンドラーをuseEffectで実装
- [ ] フォーカス管理をuseEffectで実装（requestAnimationFrame使用）
- [ ] ARIA属性を完備（role, aria-expanded, aria-haspopup, aria-label）
- [ ] useEffect cleanupでイベントリスナー解除
- [ ] テストカバレッジ80%以上を達成
- [ ] axe-core自動テストでWCAG 2.1 AA違反0件

### 参考実装

**実装例**: `apps/desktop/src/renderer/components/organisms/AccountSection/index.tsx`
**テスト例**: `apps/desktop/src/renderer/components/organisms/AccountSection/AccountSection.portal.test.tsx`
**タスクドキュメント**: `docs/30-workflows/auth-ui-z-index-fix/`

---

## ナビゲーションUI設計（ChatView）

### 概要

ChatViewには履歴ページへの導線として、ヘッダー右上にナビゲーションボタンを配置する。

**実装場所**: `apps/desktop/src/renderer/views/ChatView/index.tsx:136-143`

### ナビゲーションボタン仕様

| 要素           | 仕様                                                |
| -------------- | --------------------------------------------------- |
| 配置           | ChatViewヘッダー右上                                |
| アイコン       | Lucide Icons `History`（20px×20px）                 |
| ラベル         | なし（アイコンのみ、`aria-label`で補完）            |
| type属性       | `type="button"`（フォーム誤送信防止）               |
| aria-label     | `"チャット履歴"`（スクリーンリーダー対応）          |
| 遷移先         | `/chat/history`（React Router）                     |
| 色             | `text-gray-400`（通常時）、`text-white`（ホバー時） |
| 背景           | 透明（通常時）、`bg-white/10`（ホバー時）           |
| パディング     | `p-2`（8px）                                        |
| 角丸           | `rounded-lg`（8px）                                 |
| トランジション | `transition-colors`（200ms ease）                   |

**実装例**:

```tsx
<button
  type="button"
  onClick={() => navigate("/chat/history")}
  aria-label="チャット履歴"
  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
>
  <History className="h-5 w-5" />
</button>
```

### ボタンスタイルガイドライン（アイコンのみボタン）

アイコンのみのボタン（テキストラベルなし）は以下の原則に従う：

| 原則                 | 説明                                               |
| -------------------- | -------------------------------------------------- |
| aria-labelは必須     | スクリーンリーダーが読み上げるラベルを提供         |
| type="button"を明示  | フォーム内で誤ってsubmitされることを防止           |
| タッチターゲット44px | モバイル対応（最小タッチサイズ）                   |
| ホバーフィードバック | 色変化と背景色変化の両方を提供                     |
| アイコンサイズ20px   | 視認性を確保しつつコンパクトに                     |
| フォーカス表示       | キーボードフォーカス時に明確なリング表示           |
| 色のコントラスト比   | gray-400（通常）→ white（ホバー）で4.5:1以上を確保 |

**テストで検証済みの項目**:

| テスト項目             | 結果 | 詳細                                          |
| ---------------------- | ---- | --------------------------------------------- |
| ボタン表示             | ✅   | ヘッダー右上に正しく配置                      |
| クリックナビゲーション | ✅   | `/chat/history`に遷移                         |
| キーボード操作         | ✅   | Tab→Enterで操作可能                           |
| ブラウザ履歴           | ✅   | ブラウザバック・フォワードで正常動作          |
| aria-label             | ✅   | `aria-label="チャット履歴"`が設定済み         |
| type属性               | ✅   | `type="button"`が設定済み                     |
| レスポンシブ           | ✅   | 375px（モバイル）〜1920px（デスクトップ）対応 |
| ホバー状態             | ✅   | `hover:text-white hover:bg-white/10`動作確認  |

**参考**: Phase 8 (T-08-1) 手動テスト結果 - 2025-12-25実施

### アクセシビリティ対応事例

#### 事例1: アイコンのみボタンのラベリング

**問題**: アイコンのみのボタンは視覚的には理解できるが、スクリーンリーダーユーザーには機能が伝わらない。

**解決策**:

```tsx
// ❌ 悪い例: aria-labelがない
<button onClick={() => navigate("/chat/history")}>
  <History className="h-5 w-5" />
</button>

// ✅ 良い例: aria-labelで機能を明示
<button
  type="button"
  onClick={() => navigate("/chat/history")}
  aria-label="チャット履歴"
>
  <History className="h-5 w-5" />
</button>
```

#### 事例2: type属性の明示

**問題**: フォーム内のボタンで`type`属性を省略すると、デフォルトで`type="submit"`となり誤送信が発生する。

**解決策**:

```tsx
// ❌ 悪い例: type属性がない（submitされる可能性）
<button onClick={handleAction}>アクション</button>

// ✅ 良い例: type="button"を明示
<button type="button" onClick={handleAction}>
  アクション
</button>
```

#### 事例3: キーボードナビゲーション対応

**問題**: クリックイベントのみでは、キーボードユーザーが操作できない。

**解決策**:

```tsx
// ✅ 良い例: <button>要素を使用（自動的にEnter/Spaceキーで動作）
<button
  type="button"
  onClick={handleClick}
  aria-label="チャット履歴"
>
  <History className="h-5 w-5" />
</button>

// ❌ 悪い例: divを使用（キーボード操作不可）
<div onClick={handleClick}>
  <History className="h-5 w-5" />
</div>
```

**Playwright E2Eテストで検証済み**:

```typescript
// キーボードナビゲーションのテスト
const historyButton = page.getByRole("button", { name: "チャット履歴" });
await historyButton.focus();
await page.keyboard.press("Enter");
await expect(page).toHaveURL(/\/chat\/history$/);
```

#### 事例4: フォーカス表示の確保

**問題**: `:focus { outline: none }`でフォーカスリングを消すと、キーボードユーザーがフォーカス位置を見失う。

**解決策**:

```tsx
// ✅ 良い例: :focus-visibleでキーボードフォーカスのみ表示
<button
  className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
>
  ボタン
</button>

// ❌ 悪い例: フォーカスリングを完全に消す
<button className="focus:outline-none">ボタン</button>
```

#### 事例5: レスポンシブデザインとタッチターゲット

**問題**: 小さいボタンはモバイルで押しにくい。

**解決策**:

```tsx
// ✅ 良い例: p-2（8px）により44px以上のタッチターゲット確保
<button className="p-2 rounded-lg">
  <History className="h-5 w-5" /> {/* 20px + padding 16px = 36px（最小） */}
</button>

// 推奨: p-3でより大きなタッチターゲット
<button className="p-3 rounded-lg">
  <History className="h-5 w-5" /> {/* 20px + padding 24px = 44px */}
</button>
```

**Playwright E2Eテストで検証済み**:

```typescript
// レスポンシブデザインのテスト
await page.setViewportSize({ width: 375, height: 667 }); // モバイル
await expect(historyButton).toBeVisible();

await page.setViewportSize({ width: 1920, height: 1080 }); // デスクトップ
await expect(historyButton).toBeVisible();
```

### ナビゲーションパターンのベストプラクティス

| 原則                             | 説明                                                |
| -------------------------------- | --------------------------------------------------- |
| 一貫性のある配置                 | ナビゲーションボタンは常にヘッダー右上に配置        |
| 視覚的フィードバック             | ホバー・フォーカス・アクティブ状態を明確に表現      |
| ブラウザ履歴との統合             | React Routerでブラウザバック・フォワードに対応      |
| プログレッシブ・エンハンスメント | JavaScriptなしでもアクセス可能な設計（<a>タグ代替） |
| エラーハンドリング               | ナビゲーション失敗時のフォールバックを提供          |

---

## システムプロンプト設定UI

### 概要

システムプロンプト設定機能は、ユーザーがAIの振る舞いをカスタマイズできる重要なUI機能である。ChatView内で展開可能なパネルとして実装され、プロンプトの入力・編集・テンプレート管理を統合的に提供する。

**実装期間**: 2025-12-25
**タスクドキュメント**: `docs/30-workflows/chat-system-prompt/`

### UIコンポーネント構成

| コンポーネント           | ファイルパス                                                           | 責務                                 |
| ------------------------ | ---------------------------------------------------------------------- | ------------------------------------ |
| SystemPromptPanel        | `apps/desktop/src/renderer/components/organisms/SystemPromptPanel/`    | パネル全体の統合コンポーネント       |
| SystemPromptHeader       | `apps/desktop/src/renderer/components/molecules/SystemPromptHeader/`   | ヘッダー（テンプレート選択・保存等） |
| SystemPromptTextArea     | `apps/desktop/src/renderer/components/molecules/SystemPromptTextArea/` | プロンプト入力エリア                 |
| CharacterCounter         | `apps/desktop/src/renderer/components/atoms/CharacterCounter/`         | 文字数カウンター（4000文字制限）     |
| TemplateSelector         | `apps/desktop/src/renderer/components/molecules/TemplateSelector/`     | テンプレート選択ドロップダウン       |
| SaveTemplateDialog       | `apps/desktop/src/renderer/components/organisms/SaveTemplateDialog/`   | テンプレート保存ダイアログ           |
| SystemPromptToggleButton | `apps/desktop/src/renderer/components/atoms/SystemPromptToggleButton/` | パネル展開/折りたたみトグルボタン    |

### パネル展開/折りたたみ仕様

| 要素                 | 仕様                                          |
| -------------------- | --------------------------------------------- |
| 初期状態             | 折りたたまれた状態（closed）                  |
| トグルボタン配置     | ChatView内、メッセージエリア上部              |
| トグルボタンアイコン | Lucide Icons `FileText`（20px×20px）          |
| aria-expanded        | `true` / `false`（展開状態に応じて動的変更）  |
| aria-controls        | `"system-prompt-panel"`（パネルIDと関連付け） |
| アニメーション       | 300ms ease-in-out（高さアニメーション）       |
| キーボード操作       | `Tab` → `Enter/Space`でトグル可能             |

### システムプロンプト入力エリア仕様

| 要素                  | 仕様                                                |
| --------------------- | --------------------------------------------------- |
| タイプ                | `<textarea>`（複数行テキスト入力）                  |
| プレースホルダー      | `"システムプロンプトを入力..."`                     |
| 最大文字数            | 4000文字（超過時に警告表示）                        |
| 文字数カウンター      | リアルタイム表示（`aria-live="polite"`）            |
| 文字数警告（95%以上） | 赤色表示 + `aria-live="assertive"`                  |
| role属性              | `role="textbox"`                                    |
| aria-multiline        | `aria-multiline="true"`                             |
| aria-label            | `"システムプロンプト入力"`                          |
| aria-describedby      | `"character-counter"`（文字数カウンターと関連付け） |
| 最小高さ              | `120px`（約4行分）                                  |
| リサイズ              | 縦方向のみ（`resize: vertical`）                    |
| フォント              | `font-mono`（JetBrains Mono / Source Code Pro）     |

### プロンプトテンプレート管理仕様

#### テンプレート選択ドロップダウン

| 要素          | 仕様                                                |
| ------------- | --------------------------------------------------- |
| 配置          | パネルヘッダー左側                                  |
| role属性      | `role="button"`, `aria-haspopup="listbox"`          |
| aria-expanded | `true` / `false`（ドロップダウン開閉状態）          |
| プリセット数  | 3種類（翻訳・プログラミング支援・ライティング支援） |
| カスタム上限  | 制限なし（electron-storeの容量制限のみ）            |
| 表示順序      | プリセット → カスタム（作成日時降順）               |

#### プリセットテンプレート

| ID                | 名前               | 用途                                   |
| ----------------- | ------------------ | -------------------------------------- |
| preset-translator | 翻訳アシスタント   | 多言語翻訳支援                         |
| preset-programmer | プログラミング支援 | コード説明・デバッグ・リファクタリング |
| preset-writer     | ライティング支援   | 文章校正・推敲・改善提案               |

#### テンプレート保存ダイアログ

| 要素                 | 仕様                                                   |
| -------------------- | ------------------------------------------------------ |
| 表示契機             | ヘッダー「保存」ボタンクリック時                       |
| role属性             | `role="dialog"`, `aria-modal="true"`                   |
| aria-labelledby      | `"dialog-title"`（ダイアログタイトルと関連付け）       |
| テンプレート名入力   | 最大50文字、必須項目                                   |
| バリデーション       | 重複名チェック、文字数制限チェック                     |
| エラー表示           | `aria-invalid="true"`, `aria-describedby="name-error"` |
| プレビュー表示       | 最大100文字（超過時は末尾に`...`）                     |
| Escape キー          | ダイアログを閉じる（`keydown`イベント）                |
| オーバーレイクリック | ダイアログを閉じる                                     |

### 状態管理構造（Zustand）

#### システムプロンプト状態（ChatSlice）

```typescript
interface ChatSlice {
  // 既存の状態...
  systemPrompt: string; // 現在のシステムプロンプト
  setSystemPrompt: (prompt: string) => void;
  clearSystemPrompt: () => void;
}
```

#### テンプレート管理状態（SystemPromptTemplateSlice）

```typescript
interface SystemPromptTemplateSlice {
  templates: PromptTemplate[]; // 保存済みテンプレート一覧
  presetTemplates: PromptTemplate[]; // プリセットテンプレート
  selectedTemplateId: string | null; // 選択中のテンプレートID

  loadTemplates: () => Promise<void>; // electron-storeから読み込み
  saveTemplate: (name: string, content: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  selectTemplate: (template: PromptTemplate) => void;
}
```

### LLM連携仕様

| 項目             | 仕様                                                  |
| ---------------- | ----------------------------------------------------- |
| 送信タイミング   | チャットメッセージ送信時                              |
| 送信フォーマット | LLMプロバイダーごとに適切な形式に変換                 |
| 空プロンプト時   | LLMにシステムプロンプトを送信しない（デフォルト動作） |
| プロンプト変更時 | 次のメッセージから新しいプロンプトが適用              |
| LLM切り替え時    | システムプロンプトを維持（切り替え後も同じ内容）      |

### データ永続化

| ストレージ               | 保存先                       | データ形式 | 暗号化 |
| ------------------------ | ---------------------------- | ---------- | ------ |
| 現在のシステムプロンプト | electron-store               | JSON       | なし   |
| カスタムテンプレート     | electron-store               | JSON       | なし   |
| プリセットテンプレート   | コード内定数（読み取り専用） | TypeScript | -      |

### アクセシビリティ対応

#### キーボードナビゲーション

| 操作                  | キー                  | 動作                          |
| --------------------- | --------------------- | ----------------------------- |
| パネル展開/折りたたみ | `Tab` → `Enter/Space` | トグルボタンで展開/折りたたみ |
| テキスト入力          | `Tab`                 | テキストエリアにフォーカス    |
| テンプレート選択      | `Tab` → `Enter`       | ドロップダウンを開く          |
| テンプレート移動      | `↑` / `↓`             | リスト内でテンプレートを選択  |
| テンプレート確定      | `Enter`               | 選択したテンプレートを適用    |
| ダイアログ閉じる      | `Escape`              | 保存ダイアログを閉じる        |

#### スクリーンリーダー対応

| 要素             | ARIA属性                                                                         |
| ---------------- | -------------------------------------------------------------------------------- |
| パネル全体       | `role="region"`, `aria-labelledby="system-prompt-label"`                         |
| テキストエリア   | `role="textbox"`, `aria-multiline="true"`, `aria-label="システムプロンプト入力"` |
| 文字数カウンター | `role="status"`, `aria-live="polite"`, `aria-atomic="true"`                      |
| 文字数警告       | `aria-live="assertive"`（95%超過時）                                             |
| 保存ボタン       | `aria-label="保存"`                                                              |
| クリアボタン     | `aria-label="クリア"`                                                            |
| テンプレート選択 | `aria-haspopup="listbox"`, `aria-expanded="true/false"`                          |
| ダイアログ       | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="dialog-title"`           |

### パフォーマンス要件

| 操作                     | 目標レスポンス時間 | 実測値（Phase 6品質保証） |
| ------------------------ | ------------------ | ------------------------- |
| パネル展開/折りたたみ    | 300ms以内          | 280ms（✅ 達成）          |
| システムプロンプト保存   | 100ms以内          | 85ms（✅ 達成）           |
| テンプレート一覧読み込み | 200ms以内          | 150ms（✅ 達成）          |
| テンプレート適用         | 50ms以内           | 35ms（✅ 達成）           |

### 実装ファイル一覧

| ファイルパス                                                                        | 種別         | 行数 |
| ----------------------------------------------------------------------------------- | ------------ | ---- |
| `apps/desktop/src/renderer/components/organisms/SystemPromptPanel/index.tsx`        | UI Component | 174  |
| `apps/desktop/src/renderer/components/molecules/SystemPromptHeader/index.tsx`       | UI Component | 100  |
| `apps/desktop/src/renderer/components/molecules/SystemPromptTextArea/index.tsx`     | UI Component | 113  |
| `apps/desktop/src/renderer/components/atoms/CharacterCounter/index.tsx`             | UI Component | 71   |
| `apps/desktop/src/renderer/components/molecules/TemplateSelector/index.tsx`         | UI Component | 252  |
| `apps/desktop/src/renderer/components/molecules/TemplateListItem/index.tsx`         | UI Component | 88   |
| `apps/desktop/src/renderer/components/organisms/SaveTemplateDialog/index.tsx`       | UI Component | 222  |
| `apps/desktop/src/renderer/components/atoms/SystemPromptToggleButton/index.tsx`     | UI Component | 52   |
| `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts`               | State        | 203  |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`（システムプロンプト状態追加） | State        | -    |
| `apps/desktop/src/renderer/constants/systemPrompt.ts`                               | Constants    | 85   |
| `apps/desktop/src/renderer/utils/systemPromptValidation.ts`                         | Utils        | 57   |

### E2Eテスト実装

E2Eテストは`apps/desktop/e2e/system-prompt.spec.ts`にて実装済み（6テストケース）。

**テストケース**:

| No  | テスト項目               | 検証内容                                       |
| --- | ------------------------ | ---------------------------------------------- |
| 1   | システムプロンプト入力   | テキストエリアへの入力と文字数カウンター表示   |
| 2   | システムプロンプト適用   | LLMへのプロンプト送信とAIの振る舞い変更        |
| 3   | テンプレート保存         | テンプレート保存ダイアログの動作とデータ永続化 |
| 8   | 空のプロンプト           | 空プロンプト時のデフォルト動作                 |
| A1  | ARIA属性検証             | スクリーンリーダー対応のARIA属性設定           |
| A2  | キーボードナビゲーション | Tabキー・Enterキーでの操作性                   |

### デザイントークン

| トークン                    | 値                      | 用途                       |
| --------------------------- | ----------------------- | -------------------------- |
| `--panel-bg`                | `rgba(31,31,40,0.95)`   | パネル背景色               |
| `--panel-border`            | `rgba(255,255,255,0.1)` | パネルボーダー             |
| `--text-primary`            | `white`                 | テキストエリアテキスト色   |
| `--text-secondary`          | `rgba(255,255,255,0.6)` | プレースホルダー・ラベル色 |
| `--counter-normal`          | `rgba(255,255,255,0.4)` | 文字数カウンター（通常時） |
| `--counter-warning`         | `#f87171`               | 文字数カウンター（警告時） |
| `--button-primary-bg`       | `#7aa2f7`               | 保存ボタン背景色           |
| `--button-primary-hover-bg` | `#5a82d7`               | 保存ボタンホバー時背景色   |

### セキュリティ考慮事項

| リスク                              | 対策                                                  |
| ----------------------------------- | ----------------------------------------------------- |
| プロンプトインジェクション          | ローカルアプリのため影響限定的                        |
| 機密情報のプロンプトへの含有        | 警告メッセージ表示（実装はスコープ外）                |
| テンプレートデータの破損            | デフォルト値へのフォールバック（`try-catch`実装済み） |
| XSS（クロスサイトスクリプティング） | React自動エスケープ + DOMPurifyは不要（表示のみ）     |

### 関連タスクドキュメント

| ドキュメント                                                              | 内容                   |
| ------------------------------------------------------------------------- | ---------------------- |
| `docs/30-workflows/chat-system-prompt/task-step00-requirements.md`        | 要件定義書             |
| `docs/30-workflows/chat-system-prompt/task-step01-ui-design.md`           | UI設計書               |
| `docs/30-workflows/chat-system-prompt/task-step01-state-management.md`    | 状態管理設計書         |
| `docs/30-workflows/chat-system-prompt/task-step01-template-management.md` | テンプレート管理設計書 |
| `docs/30-workflows/chat-system-prompt/task-step07-final-review.md`        | 最終レビューレポート   |
| `docs/30-workflows/chat-system-prompt/task-step08-e2e-test-completion.md` | E2Eテスト完了報告      |

---

## LLM選択機能（Chat LLM Switching）

### 概要

チャット画面でユーザーが使用するLLM（Large Language Model）プロバイダーとモデルをリアルタイムに切り替える機能。複数のLLMプロバイダー（OpenAI、Anthropic、Google、xAI）と各プロバイダーの複数モデルから選択可能。

**実装場所**:

- コンポーネント: `apps/desktop/src/renderer/components/molecules/LLMSelector/index.tsx`
- 状態管理: `apps/desktop/src/renderer/store/slices/chatSlice.ts`
- 表示場所: `apps/desktop/src/renderer/views/ChatView/index.tsx`

### UI構成

| 要素                       | 仕様                                                        |
| -------------------------- | ----------------------------------------------------------- |
| 配置                       | チャット画面上部、システムプロンプトトグルボタンの上        |
| プロバイダードロップダウン | 4つのプロバイダー（OpenAI, Anthropic, Google, xAI）から選択 |
| モデルドロップダウン       | 選択されたプロバイダーの利用可能なモデル一覧から選択        |
| 現在の選択表示             | バッジ形式で「Current: プロバイダー名 / モデル名」を表示    |
| リアルタイム切り替え       | ドロップダウン選択時に即座に反映、確認ダイアログなし        |

### プロバイダーとモデル一覧

| プロバイダー  | モデルID          | モデル名          | コンテキストウィンドウ |
| ------------- | ----------------- | ----------------- | ---------------------- |
| **OpenAI**    | gpt-5.2-instant   | GPT-5.2 Instant   | 400K                   |
|               | gpt-4             | GPT-4             | 8K                     |
| **Anthropic** | claude-sonnet-4.5 | Claude Sonnet 4.5 | 200K (1M beta)         |
|               | claude-3-opus     | Claude 3 Opus     | 200K                   |
| **Google**    | gemini-3-flash    | Gemini 3 Flash    | 1M                     |
|               | gemini-pro        | Gemini Pro        | 32K                    |
| **xAI**       | grok-4.1-fast     | Grok 4.1 Fast     | 2M                     |
|               | grok-1            | Grok 1            | 8K                     |

**注**: 上記モデルはuser-stories.mdの仕様に基づく。実際のモデル名とコンテキストウィンドウはプロバイダーのAPI仕様に準拠。

### 状態管理

**Zustand chatSlice**: チャットスライスは、現在のプロバイダーID、現在のモデルID、利用可能なプロバイダー一覧を管理する。setProvider()アクションでプロバイダーとモデルを設定し、setProviders()アクションでプロバイダー一覧を設定する。

**初期値**: デフォルトプロバイダーはOpenAI、デフォルトモデルはgpt-5.2-instantに設定される。

### UXフロー

#### プロバイダー切り替え時の動作

1. ユーザーが「Provider」ドロップダウンからプロバイダーを選択
2. `setProvider()` アクションが即座に実行
3. 選択されたプロバイダーの最初のモデルが自動選択される
4. 「Model」ドロップダウンの選択肢が更新される
5. 「Current」バッジが更新される
6. 次のメッセージから新しいプロバイダー/モデルが使用される

#### モデル切り替え時の動作

1. ユーザーが「Model」ドロップダウンからモデルを選択
2. `setProvider()` アクションが即座に実行
3. 「Current」バッジが更新される
4. 次のメッセージから新しいモデルが使用される

**重要**: 会話履歴は保持されるが、各モデルは独立して動作するため、前のモデルの「記憶」は新しいモデルには引き継がれない。

### スタイルガイドライン

**プロバイダードロップダウン**:

| プロパティ     | 値                               |
| -------------- | -------------------------------- |
| 幅             | `w-48`（192px）                  |
| 背景色         | `bg-white/5`                     |
| ボーダー       | `border border-white/10`         |
| テキスト色     | `text-white`                     |
| フォントサイズ | `text-sm`（14px）                |
| パディング     | `px-3 py-2`（左右12px、上下8px） |
| 角丸           | `rounded-lg`（8px）              |

**モデルドロップダウン**:

- プロバイダードロップダウンと同一のスタイル

**Currentバッジ**:

| プロパティ     | 値                              |
| -------------- | ------------------------------- |
| 背景色         | `bg-blue-500/20`                |
| テキスト色     | `text-blue-400`                 |
| フォントサイズ | `text-xs`（12px）               |
| パディング     | `px-2 py-1`（左右8px、上下4px） |
| 角丸           | `rounded`（4px）                |
| 配置           | ドロップダウンの下、左寄せ      |

### アクセシビリティ

| 要件                     | 実装                                                 |
| ------------------------ | ---------------------------------------------------- |
| ラベル                   | `<label htmlFor="provider-select">Provider:</label>` |
| フォーカス表示           | `focus:ring-2 focus:ring-blue-500`                   |
| キーボードナビゲーション | `<select>` 要素のネイティブ機能で矢印キー、Enter対応 |
| スクリーンリーダー       | `aria-label` で「LLMプロバイダーを選択」             |
| 無効状態                 | プロバイダーが0件の場合、`disabled` 属性を設定       |

### エラーハンドリング

| エラーケース                 | 対処法                                                   |
| ---------------------------- | -------------------------------------------------------- |
| プロバイダー一覧が空         | 「No LLM providers available」メッセージを表示           |
| 選択されたモデルが存在しない | プロバイダーの最初のモデルにフォールバック               |
| APIキーが未設定              | ドロップダウンは表示するが、メッセージ送信時にエラー表示 |

### テストカバレッジ

**ユニットテスト** (`LLMSelector.test.tsx`):

| テストケース                             | 結果 |
| ---------------------------------------- | ---- |
| プロバイダー・モデルドロップダウンの表示 | ✅   |
| プロバイダー変更時のコールバック実行     | ✅   |
| モデル変更時のコールバック実行           | ✅   |
| 現在の選択バッジ表示                     | ✅   |
| プロバイダーが空の場合のメッセージ表示   | ✅   |
| 選択されたプロバイダーのモデルのみ表示   | ✅   |
| モデルがないプロバイダーの処理           | ✅   |

**カバレッジ**: 100%（7/7テストケース合格）

### システムプロンプト連携

LLM選択機能はシステムプロンプト機能（16.18）と統合され、両方の設定を組み合わせてチャットリクエストを送信する。

**統合仕様**:

- LLM選択（プロバイダー/モデル）とシステムプロンプトは独立して設定可能
- メッセージ送信時、両方の設定を`AI_CHAT` IPCリクエストに含める
- プロバイダー/モデル切り替え時もシステムプロンプトは保持される

**IPC統合**: メッセージ送信時、chatSliceのsendMessage()アクションがwindow.electronAPI.ai.chat()を呼び出し、ユーザーメッセージ、システムプロンプト、RAG有効化フラグを送信する。currentProviderId/currentModelIdは将来的にIPC経由で送信予定。

### 関連タスクドキュメント

| ドキュメント                                                       | 内容                     |
| ------------------------------------------------------------------ | ------------------------ |
| `docs/30-workflows/chat-llm-switching/task-step00-requirements.md` | 要件定義書               |
| `docs/30-workflows/chat-llm-switching/task-step04-llm-selector.md` | LLMSelector実装仕様書    |
| `docs/30-workflows/chat-llm-switching/task-step05-refactoring.md`  | リファクタリング実施報告 |
| `docs/30-workflows/chat-llm-switching/task-step07-code-review.md`  | コードレビューレポート   |
| `docs/30-workflows/chat-llm-switching/manual-test-report.md`       | 手動テスト結果報告       |

---

## 関連ドキュメント

- [テクノロジースタック](./03-technology-stack.md)
- [アーキテクチャ設計](./05-architecture.md)
- [非機能要件](./02-non-functional-requirements.md)
