# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目             | 値                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------- |
| タスク ID        | UT-UI-05A-IMPLEMENTATION-CLOSURE-001                                                     |
| Phase            | 4 — テスト作成                                                                           |
| 前提 Phase       | Phase 3（設計レビュー）PASS                                                              |
| 作成日           | 2026-03-03                                                                               |
| 対象課題         | UT-UI-05A-001〜007（FileTree KB / Mobile Drawer / Cmd+S / Toast / RO / Nav / Animation） |
| テスト環境       | Vitest + @testing-library/react + happy-dom                                              |
| テストファイル数 | 9 ファイル（hooks 4 + components 5）                                                     |

## 目的

7 課題（FileTree キーボードナビゲーション・モバイルドロワー・Cmd/Ctrl+S 保存ショートカット・保存成功 Toast・読み取り専用表示強化・ナビゲーション導線配線・マイクロアニメーション）のテストコードをテストファーストで作成する。全テストが Red（失敗）状態であることを確認し、Phase 5 での実装基盤を整える。

## 実行タスク

- テスト設計方針定義: 7 課題共通のテスト方針を定義する
- モック基盤構築: IPC/Store/Timer の共通ユーティリティを整備する
- 課題別テスト設計: UT-UI-05A-001〜007 の Red テストケースを設計する
- アクセシビリティテスト接続: WCAG 2.1 AA 要件をテストで検証する
- P39/P40/P13 対策組み込み: fireEvent・advanceTimersByTime・cd実行を徹底する
- Red 確認: 全テストが Red で失敗理由が妥当であることを確認する

### Task 1: テスト設計方針の策定

**目的**: 7 課題共通のテスト設計方針を定め、テストの一貫性を確保する。

**方針定義項目**:

- テスト環境: happy-dom（jsdom 不使用）
- イベントシミュレーション: `fireEvent` のみ使用（`userEvent` 禁止 — P39 対策）
- タイマーテスト: `vi.advanceTimersByTime()` のみ使用（`vi.runAllTimers()` 禁止 — P13 対策）
- Store モック: SkillEditorStore の個別セレクタを使用（合成 Hook 禁止 — P31 対策）
- IPC モック: `window.electronAPI.skill.*` の全対象チャネルをモック化
- CSS 変数テスト: `variantStyles` Record 定数を import して期待値生成（P47 対策）
- prefers-reduced-motion: `window.matchMedia` をモックして無効化テストを実施

**成果物**: `outputs/phase-4/test-specification.md`

### Task 2: 共通テストユーティリティ作成

**目的**: 7 課題共通で使用するモック定義とテストヘルパーを作成する。

**作成ファイル**: `apps/desktop/src/renderer/views/SkillEditorView/__tests__/test-utils.ts`

**定義内容**:

#### 2-1: IPC モック定義

| IPC チャネルグループ | モック対象メソッド                |
| -------------------- | --------------------------------- |
| `skill:file:save`    | `save`（保存成功/失敗バリアント） |
| `skill:file:read`    | `read`                            |
| `skill:navigation:*` | `navigateTo`, `getCurrentView`    |

#### 2-2: Store モック定義

| ストアスライス        | モック個別セレクタ                                           |
| --------------------- | ------------------------------------------------------------ |
| `useSkillEditorStore` | `useSelectedFile`, `useIsEditorDirty`, `useIsSaving`         |
| `useNavigationStore`  | `useCurrentView`, `useSetCurrentView`, `useCurrentSkillName` |

#### 2-3: テストレンダリングヘルパー

```typescript
// 共通レンダリングラッパー（IPC モック・Store モック付き）
renderSkillEditor(options?: {
  isReadOnly?: boolean;
  selectedFile?: string | null;
  isDirty?: boolean;
  isMobile?: boolean; // viewport width < 768px
}): RenderResult
```

**成果物**: `outputs/phase-4/test-utilities-design.md`

### Task 3: UT-UI-05A-001 FileTree キーボードナビゲーション テスト作成

**テストファイル**: `apps/desktop/src/renderer/views/SkillEditorView/__tests__/FileTreePanel.test.tsx`

| テストケース                                         | 検証内容                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------ |
| Tab キーでツリーにフォーカスを入れられる             | ツリーコンテナの `tabIndex={0}` 存在確認                           |
| ArrowDown で次のノードにフォーカスが移動する         | `fireEvent.keyDown(tree, { key: 'ArrowDown' })` 後のフォーカス位置 |
| ArrowUp で前のノードにフォーカスが移動する           | `fireEvent.keyDown(tree, { key: 'ArrowUp' })` 後のフォーカス位置   |
| ArrowRight でディレクトリを展開する                  | `aria-expanded="true"` への変化                                    |
| ArrowRight でファイルを選択する（ディレクトリ以外）  | `onFileSelect` コールバックの呼び出し                              |
| ArrowLeft でディレクトリを折り畳む                   | `aria-expanded="false"` への変化                                   |
| ArrowLeft で展開済みの場合は閉じる、閉じていれば親へ | 開閉状態に応じた動作分岐                                           |
| Enter でファイルを選択する                           | `onFileSelect` コールバックの呼び出し引数                          |
| Space でファイルを選択する                           | `onFileSelect` コールバックの呼び出し引数                          |
| Escape でフォーカスをツリーから解放する              | ツリーの focus が外れること                                        |
| Home で最初の表示ノードへ移動する                    | 最初のノードがフォーカスされること                                 |
| End で最後の表示ノードへ移動する                     | 最後のノードがフォーカスされること                                 |
| キーボード操作中にフォーカスリングが表示される       | `ring-2` または `focus:ring-2` クラスの存在                        |
| スクリーンリーダー用 ARIA 属性が正確に設定されている | `role="tree"`, `role="treeitem"`, `aria-selected`, `aria-expanded` |

**テストファイル**: `apps/desktop/src/renderer/views/SkillEditorView/__tests__/useKeyboardNavigation.test.ts`

| テストケース                                      | 検証内容                       |
| ------------------------------------------------- | ------------------------------ |
| 初期状態でフォーカスインデックスが -1 である      | `focusedIndex` の初期値        |
| moveFocus('down') で次のインデックスに移動する    | `focusedIndex` の増加          |
| moveFocus('up') で前のインデックスに移動する      | `focusedIndex` の減少          |
| インデックスが 0 未満にならない                   | 境界値での `focusedIndex` 固定 |
| インデックスがノード数を超えない                  | 末尾での `focusedIndex` 固定   |
| toggleExpand でディレクトリの展開状態を切り替える | `expandedNodes` セットの変化   |

### Task 4: UT-UI-05A-002 モバイルドロワー テスト作成

**テストファイル**: `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.drawer.test.tsx`

| テストケース                                               | 検証内容                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| 画面幅 767px 以下でドロワーモードに切り替わる              | ハンバーガーボタンの存在、FileTreePanel の非表示              |
| 768px 以上で 2 ペインレイアウトになる                      | ハンバーガーボタンの非表示、FileTreePanel の常時表示          |
| ハンバーガーボタンクリックでドロワーが開く                 | ドロワーコンテナの `aria-hidden="false"` または表示クラス変化 |
| ドロワー外（オーバーレイ）クリックでドロワーが閉じる       | ドロワーの非表示、`aria-hidden="true"`                        |
| Escape キーでドロワーが閉じる                              | `fireEvent.keyDown(document, { key: 'Escape' })` 後の閉じ動作 |
| ファイル選択後にドロワーが自動的に閉じる                   | ファイル選択後のドロワー状態確認                              |
| ハンバーガーボタンに `aria-expanded` が設定されている      | `aria-expanded` 属性の真偽値変化                              |
| ドロワーにスライドインアニメーションクラスが適用されている | `transform` / `transition` 関連クラスの存在                   |

### Task 5: UT-UI-05A-003 Cmd/Ctrl+S 保存ショートカット テスト作成

**テストファイル**: `apps/desktop/src/renderer/views/SkillEditorView/__tests__/useSkillEditor.shortcut.test.ts`

| テストケース                                                        | 検証内容                                        |
| ------------------------------------------------------------------- | ----------------------------------------------- |
| Cmd+S（metaKey=true, key='s'）で保存が実行される（macOS）           | `handleSave` または IPC の呼び出し確認          |
| Ctrl+S（ctrlKey=true, key='s'）で保存が実行される（Win/Linux）      | `handleSave` または IPC の呼び出し確認          |
| `e.preventDefault()` が呼び出されブラウザ既定動作がキャンセルされる | `preventDefault` の呼び出し確認                 |
| `isReadOnly=true` のとき保存が実行されない                          | `handleSave` が呼ばれないこと                   |
| `isSaving=true` のとき重複実行されない                              | `handleSave` が 1 回しか呼ばれないこと          |
| ファイルが未選択のとき保存が実行されない                            | `selectedFile === null` 時の無動作確認          |
| cleanup 時にキーボードリスナーが解除される                          | `removeEventListener` の呼び出し確認（P5 対策） |

### Task 6: UT-UI-05A-004 保存成功 Toast テスト作成

**テストファイル**: `apps/desktop/src/renderer/views/SkillEditorView/__tests__/useToast.test.ts`

| テストケース                                                         | 検証内容                                            |
| -------------------------------------------------------------------- | --------------------------------------------------- |
| `showToast({ type: 'success', message: '...' })` で Toast を表示する | Toast の isVisible 状態が true になること           |
| 2500ms 後に Toast が自動消去される                                   | `vi.advanceTimersByTime(2500)` 後の isVisible=false |
| `dismissToast()` で手動消去できる                                    | isVisible=false への変化                            |
| showToast を連続呼び出しするとタイマーがリセットされる               | 2500ms 前に再呼び出し後、合計 2500ms で消去         |
| `type: 'error'` のとき自動消去されない                               | 5000ms 後も isVisible=true であること               |
| 複数 Toast の管理（スタック動作）                                    | toasts 配列の適切な管理                             |

**テストファイル**: `apps/desktop/src/renderer/views/SkillEditorView/__tests__/Toast.test.tsx`

| テストケース                                                 | 検証内容                                           |
| ------------------------------------------------------------ | -------------------------------------------------- |
| 成功 Toast に `role="status"` が設定されている               | `role` 属性の値確認                                |
| エラー Toast に `role="alert"` が設定されている              | `role` 属性の値確認                                |
| Toast に × ボタンが存在し、クリックで `onDismiss` が呼ばれる | ボタン存在確認、コールバック呼び出し確認           |
| 成功 Toast に CheckCircle アイコンが表示される               | アイコン要素の存在                                 |
| エラー Toast に XCircle アイコンが表示される                 | アイコン要素の存在                                 |
| Toast 表示中に `aria-live` 領域から読み上げられる            | `role="status"` または `aria-live="polite"` の存在 |

### Task 7: UT-UI-05A-005 読み取り専用表示強化 テスト作成

**テストファイル**: `apps/desktop/src/renderer/views/SkillEditorView/__tests__/ReadOnlyBanner.test.tsx`

| テストケース                                               | 検証内容                                         |
| ---------------------------------------------------------- | ------------------------------------------------ |
| `isReadOnly=true` のとき「読み取り専用」バナーが表示される | バナー要素の存在、テキスト「読み取り専用」の確認 |
| バナーに Lock アイコンが表示される                         | `lucide-react` の Lock アイコン要素の存在        |
| バナーのテキストが「読み取り専用 — 編集できません」        | テキストコンテンツの確認                         |
| `isReadOnly=false` のときバナーが非表示になる              | バナー要素の非存在                               |

**テストファイル**: `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.readonly.test.tsx`

| テストケース                                                       | 検証内容                                     |
| ------------------------------------------------------------------ | -------------------------------------------- |
| `isReadOnly=true` のときロックアイコンがファイル名付近に表示される | Lock アイコン要素の存在                      |
| `isReadOnly=true` のとき保存ボタンが非表示になる                   | 保存ボタン要素の非存在                       |
| `isReadOnly=true` のとき`aria-readonly="true"` が設定されている    | エディター要素の `aria-readonly` 属性確認    |
| `isReadOnly=true` でもテキスト選択（コピー）ができる               | `user-select: none` が未設定であることの確認 |
| `isReadOnly=false` のときバナー・ロックアイコムが非表示            | 両要素の非存在確認                           |

### Task 8: UT-UI-05A-006 ナビゲーション導線配線 テスト作成

**テストファイル**: `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.navigation.test.tsx`

| テストケース                                                             | 検証内容                                   |
| ------------------------------------------------------------------------ | ------------------------------------------ |
| 閉じるボタンクリックで `'skill-center'` ビューに遷移する                 | Store の `currentView` 変化確認            |
| 未保存変更がある状態で閉じようとすると UnsavedChangesDialog が表示される | ダイアログの表示確認                       |
| UnsavedChangesDialog で「破棄」を選択すると遷移する                      | `currentView='skill-center'` への変化確認  |
| UnsavedChangesDialog で「キャンセル」を選択すると遷移しない              | `currentView` が変化しないこと             |
| `currentSkillName` が Store に格納されている                             | `useCurrentSkillName` セレクタの返り値確認 |
| `ViewType` に `'skill-editor'` が含まれている                            | 型定義または定数の確認                     |

### Task 9: UT-UI-05A-007 マイクロアニメーション テスト作成

**テストファイル**: `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.animation.test.tsx`

| テストケース                                                          | 検証内容                                                   |
| --------------------------------------------------------------------- | ---------------------------------------------------------- |
| ファイル選択時に選択背景色のトランジションクラスが適用される          | `transition-colors` または `transition-all` クラスの存在   |
| ディレクトリ展開/折り畳みに高さアニメーションクラスがある             | `transition` / `overflow-hidden` 関連クラスの存在          |
| エディターコンテンツ切り替えに opacity トランジションクラスがある     | `transition-opacity` クラスの存在                          |
| `prefers-reduced-motion: reduce` 設定時にアニメーションが無効化される | `window.matchMedia` モック後にアニメーションクラスが非存在 |
| ツールバーボタンにホバートランジションクラスが適用されている          | `hover:` プレフィックスまたは `transition` クラスの存在    |

## 参照資料

| 資料                   | パス / 参照先                                                                     |
| ---------------------- | --------------------------------------------------------------------------------- |
| Phase 1 要件定義書     | `phase-1-requirements.md`                                                         |
| Phase 2 設計書         | `phase-2-design.md`                                                               |
| Phase 3 設計レビュー   | `phase-3-design-review.md`                                                        |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`（P5, P9, P13, P31, P39, P40, P41, P47）      |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                                                |
| アーキテクチャルール   | `.claude/rules/01-architecture.md#アクセシビリティ`                               |
| SkillEditorView 実装   | `apps/desktop/src/renderer/views/SkillEditorView/`                                |
| Preload チャネル定義   | `apps/desktop/src/preload/channels.ts`                                            |
| aiworkflow Feature仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   |
| aiworkflow テスト規約  | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |
| aiworkflow a11yテスト  | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      |

## 実行手順

### Step 1: テスト設計方針の文書化

1. `outputs/phase-4/test-specification.md` を作成する
2. テスト環境（happy-dom）、イベント方針（fireEvent）、タイマー方針（advanceTimersByTime）、Store モック方針（個別セレクタ）を記載する
3. 各課題のテストケース一覧を記載する

### Step 2: 共通テストユーティリティの作成

1. `apps/desktop/src/renderer/views/SkillEditorView/__tests__/test-utils.ts` を作成する
2. IPC モック定義を実装する
3. Store モック定義を実装する
4. `renderSkillEditor` ヘルパーを実装する
5. `outputs/phase-4/test-utilities-design.md` を作成する

### Step 3: UT-UI-05A-001 テスト作成

1. `FileTreePanel.test.tsx`（14 テスト）を作成する
2. `useKeyboardNavigation.test.ts`（6 テスト）を作成する
3. 全テストが Red（失敗）であることを `cd apps/desktop && pnpm vitest run --reporter=verbose src/renderer/views/SkillEditorView/__tests__/FileTreePanel.test.tsx` で確認する

### Step 4: UT-UI-05A-002 テスト作成

1. `SkillEditorView.drawer.test.tsx`（8 テスト）を作成する
2. 全テストが Red（失敗）であることを確認する

### Step 5: UT-UI-05A-003 テスト作成

1. `useSkillEditor.shortcut.test.ts`（7 テスト）を作成する
2. 全テストが Red（失敗）であることを確認する

### Step 6: UT-UI-05A-004 テスト作成

1. `useToast.test.ts`（6 テスト）を作成する
2. `Toast.test.tsx`（6 テスト）を作成する
3. 全テストが Red（失敗）であることを確認する

### Step 7: UT-UI-05A-005 テスト作成

1. `ReadOnlyBanner.test.tsx`（4 テスト）を作成する
2. `SkillEditorView.readonly.test.tsx`（5 テスト）を作成する
3. 全テストが Red（失敗）であることを確認する

### Step 8: UT-UI-05A-006 テスト作成

1. `SkillEditorView.navigation.test.tsx`（6 テスト）を作成する
2. 全テストが Red（失敗）であることを確認する

### Step 9: UT-UI-05A-007 テスト作成

1. `SkillEditorView.animation.test.tsx`（5 テスト）を作成する
2. 全テストが Red（失敗）であることを確認する

### Step 10: 全体確認

1. 全 9 テストファイルが存在することを確認する
2. `userEvent` が使用されていないことを `grep -rn "userEvent" apps/desktop/src/renderer/views/SkillEditorView/__tests__/` で確認する（期待値: 0 件、P39 対策）
3. `runAllTimers` が使用されていないことを `grep -rn "runAllTimers" apps/desktop/src/renderer/views/SkillEditorView/__tests__/` で確認する（期待値: 0 件、P13 対策）
4. 全テストが Red 状態であることを確認する

## 統合テスト連携【必須】

| 連携元  | 連携内容                              | 反映先                                     |
| ------- | ------------------------------------- | ------------------------------------------ |
| Phase 1 | FR/NFR と受け入れ基準のテスト ID 対応 | `outputs/phase-4/test-specification.md`    |
| Phase 2 | Props/Hook/IPC 設計の契約テスト       | `outputs/phase-4/test-utilities-design.md` |
| Phase 3 | MINOR/MAJOR 指摘の再発防止テスト      | `outputs/phase-4/test-specification.md`    |

## 成果物

| 成果物                            | パス                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------- |
| テスト仕様書                      | `outputs/phase-4/test-specification.md`                                                         |
| テストユーティリティ設計書        | `outputs/phase-4/test-utilities-design.md`                                                      |
| 共通テストヘルパー                | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/test-utils.ts`                       |
| 001: FileTree KB テスト           | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/FileTreePanel.test.tsx`              |
| 001: useKeyboardNavigation テスト | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/useKeyboardNavigation.test.ts`       |
| 002: Mobile Drawer テスト         | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.drawer.test.tsx`     |
| 003: Cmd+S ショートカット テスト  | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/useSkillEditor.shortcut.test.ts`     |
| 004: useToast テスト              | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/useToast.test.ts`                    |
| 004: Toast コンポーネント テスト  | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/Toast.test.tsx`                      |
| 005: ReadOnlyBanner テスト        | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/ReadOnlyBanner.test.tsx`             |
| 005: ReadOnly 統合テスト          | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.readonly.test.tsx`   |
| 006: ナビゲーション テスト        | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.navigation.test.tsx` |
| 007: アニメーション テスト        | `apps/desktop/src/renderer/views/SkillEditorView/__tests__/SkillEditorView.animation.test.tsx`  |

## 完了条件

- [ ] テスト仕様書 `outputs/phase-4/test-specification.md` が作成されている
- [ ] テストユーティリティ設計書 `outputs/phase-4/test-utilities-design.md` が作成されている
- [ ] 共通テストヘルパーファイルが作成されている
- [ ] テストファイルが 9 ファイル全て作成されている（UT-UI-05A-001 対応 2 件 + 各課題各 1 件）
- [ ] テストケース合計: 001=20件 / 002=8件 / 003=7件 / 004=12件 / 005=9件 / 006=6件 / 007=5件 — 合計 67 テストケース
- [ ] 全テストが Red（失敗）状態である（実装未完了のため）
- [ ] `userEvent` が全テストファイルで未使用である（P39 対策）
- [ ] `runAllTimers` が全テストファイルで未使用である（P13 対策）
- [ ] `vi.advanceTimersByTime()` で Toast タイマーテストを実施している（P13 対策）
- [ ] テスト実行は `cd apps/desktop` から行っている（P40 対策）
- [ ] **本 Phase 内の全タスクを 100% 実行完了していること**

## 次 Phase

Phase 5（実装 — TDD Green）へ進む。Phase 4 で作成した全テストを Green にすることが Phase 5 の目標となる。
