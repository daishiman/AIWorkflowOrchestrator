# SkillEditorView 実装ガイド

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | UT-UI-05A                                          |
| 対象         | SkillEditorView クロージャ（7 機能統合）           |
| 作成日       | 2026-03-03                                         |
| Phase        | 12 (ドキュメント)                                  |
| 対象ファイル | `apps/desktop/src/renderer/views/SkillEditorView/` |

---

## Part 1: 概念説明（中学生レベル）

### スキルエディターって何？

パソコンの「メモ帳」アプリを想像してください。SkillEditorView は、AI が使う**スキル（お仕事のやり方マニュアル）** を編集するための「メモ帳」です。

左側にファイルの一覧（目次）があって、右側にファイルの中身を表示・編集できます。学校の教科書を想像すると、左が「もくじページ」、右が「本文ページ」です。

### 7 つの新機能を日常生活で例えると

#### 1. キーボードナビゲーション（UT-UI-05A-001）

本の目次を指でたどる代わりに、**キーボードの矢印キーで目次の項目を移動**できる機能です。

- **Tab** キーでファイル一覧に移動（目次ページを開く）
- **矢印キー**で上下に移動（目次の項目を指でたどる）
- **Enter** キーで選択（「ここを読む！」と決める）
- **左矢印**でフォルダを閉じる（章の中身を隠す）
- **右矢印**でフォルダを開く（章の中身を見る）

マウスが壊れても、キーボードだけで全部操作できます。

#### 2. モバイルドロワー（UT-UI-05A-002）

スマホで見るとき、画面が小さいので左側のファイル一覧を隠しておいて、**左端からスライドして出てくる引き出し（ドロワー）**にします。

- ハンバーガーメニューボタン（三本線のアイコン）を押すと開く
- ファイルを選ぶと自動で閉じる
- 背景の暗い部分をタッチしても閉じる
- Escape キーでも閉じる

洋服ダンスの引き出しと同じ。必要なときだけ引き出して、選んだら閉める。

#### 3. 保存ショートカット（UT-UI-05A-003）

**Ctrl+S（Mac だと Command+S）でサッと保存**できます。いちいちマウスで保存ボタンを探して押さなくていい。

- 読み取り専用モードでは保存ショートカットは無視される（安全装置）
- 保存中に重ねて押しても二重保存しない（連打防止）
- ブラウザの「ページ保存」が誤って動かないように、ブラウザの動作をブロックする

#### 4. 保存 Toast（UT-UI-05A-004）

保存したときに画面の右下に**「保存しました」とポップアップ通知**が出ます。

- 成功したら緑色のチェックマーク付き通知（2.5 秒で自動消滅）
- 失敗したら赤色のバツマーク付き通知（自分で閉じるまで残る）

コンビニのレジで「ピッ」と音が鳴るのと同じ。「ちゃんと処理したよ」というお知らせです。

#### 5. 読み取り専用モード（UT-UI-05A-005）

**「見るだけモード」** です。大事な設定ファイルを間違えて変えちゃうのを防ぎます。

- 鍵マークのアイコンが表示される
- 「読み取り専用 --- 編集できません」というバナーが出る
- 保存ボタンが消える
- テキストを打ち込もうとしても入力できない

図書館の本と同じ。読めるけど書き込めない。

#### 6. ナビゲーション導線（UT-UI-05A-006）

**「保存してないけど画面を閉じていい？」と聞いてくれる安全ネット**です。

- まだ保存していない編集がある状態で閉じようとすると、確認ダイアログが出る
- 「保存して続行」「保存せず続行」「キャンセル」の 3 つから選べる
- 別のファイルに切り替えるときも同じ確認が出る

Word で保存せずに閉じようとすると「保存しますか？」と聞かれるのと同じです。

#### 7. マイクロアニメーション（UT-UI-05A-007）

ボタンにマウスを乗せると**フワッと色が変わる**、ドロワーが**スーッとスライドして出てくる**など、自然な動きを追加する機能です。

- 全てのアニメーションは 150ms 〜 250ms（まばたき 1 回分ぐらい）
- 「動きが苦手」という設定をしている人には、アニメーションを自動でオフにする（`prefers-reduced-motion`）
- CSS の `motion-reduce:transition-none` でアニメーションを無効化

遊園地の乗り物と同じで、乗りたくない人は無理に乗らなくていい仕組みです。

---

## Part 2: 開発者向け実装詳細

### アーキテクチャ全体像

```
SkillEditorView (organism) - index.tsx
├── FileTreePanel (molecule)
│   ├── FileTreeNode (atom) x N
│   └── useKeyboardNavigation (hook)
├── EditorPanel (molecule)
│   ├── EditorStatusBar (atom)
│   └── useSkillEditor (hook)
├── EditorToolBar (molecule)
├── MobileDrawer (molecule)
├── ReadOnlyBanner (atom)
├── Toast (atom)
├── UnsavedChangesDialog (molecule)
├── BackupMenu (molecule)
├── useFileTree (hook)
├── useUnsavedWarning (hook)
├── useToast (hook)
├── useReducedMotion (hook)
├── useMediaQuery (inline hook in index.tsx)
└── utils/keyboardUtils.ts
```

### 状態管理設計

| 状態           | 管理方法          | 責務                                      |
| -------------- | ----------------- | ----------------------------------------- |
| content        | useSkillEditor    | エディター内のテキストコンテンツ          |
| hasChanges     | useSkillEditor    | 元コンテンツとの差分有無（derived state） |
| currentPath    | useSkillEditor    | 現在編集中のファイルパス                  |
| language       | useSkillEditor    | ファイル拡張子から推定した言語            |
| fileTree       | useFileTree       | ファイルツリー構造データ                  |
| selectedFile   | useFileTree       | ファイルツリー上の選択ファイル            |
| isDialogOpen   | useUnsavedWarning | 未保存変更ダイアログの開閉                |
| pendingPath    | useUnsavedWarning | ダイアログ確認後の遷移先パス              |
| toasts         | useToast          | 表示中の Toast 通知リスト                 |
| isSaving       | useState          | 保存処理実行中フラグ                      |
| isPendingClose | useState          | 閉じる操作の保留フラグ                    |
| isDrawerOpen   | useState          | モバイルドロワーの開閉                    |
| isMobile       | useMediaQuery     | 768px 未満のレスポンシブ判定              |

### キーフロー詳細

#### 1. ファイル選択フロー

```
handleSelectFile(path)
  ├── hasChanges? ─── Yes ─── requestNavigation(path) → UnsavedChangesDialog 表示
  │                                                        ├── 「保存して続行」→ saveFile → loadFile(pendingPath)
  │                                                        ├── 「保存せず続行」→ loadFile(pendingPath)
  │                                                        └── 「キャンセル」→ 何もしない
  └── No ─── treeSelectFile(path) → loadFile(path) → setIsDrawerOpen(false)
```

#### 2. 保存フロー

```
handleSave()
  ├── isSaving? → return（重複実行防止）
  ├── setIsSaving(true)
  ├── try: saveFile() → showToast({ type: "success", message: "保存しました" })
  ├── catch: showToast({ type: "error", message: "保存に失敗しました" })
  └── finally: setIsSaving(false)
```

#### 3. 閉じるフロー

```
handleClose()
  ├── hasChanges? ─── Yes ─── setIsPendingClose(true) → requestNavigation("__close__")
  │                                                       └── UnsavedChangesDialog 表示
  │                                                            ├── 「保存して続行」→ saveFile → onClose()
  │                                                            ├── 「保存せず続行」→ onClose()
  │                                                            └── 「キャンセル」→ setIsPendingClose(false)
  └── No ─── onClose()
```

#### 4. Cmd/Ctrl+S ショートカット

```
useEffect keydown リスナー
  ├── isPlatformSaveKey(e)? → No → return
  ├── e.preventDefault()（ブラウザの「保存」動作を抑止）
  ├── isReadOnly || isSaving || !currentPath? → return
  └── handleSave()
```

### IPC 通信

SkillEditorView は以下の Preload API 経由で Main Process と通信する:

| API                                                            | 用途               | 呼び出し元     |
| -------------------------------------------------------------- | ------------------ | -------------- |
| `window.electronAPI.skill.readFile(skillName, path)`           | ファイル読み込み   | useSkillEditor |
| `window.electronAPI.skill.writeFile(skillName, path, content)` | ファイル保存       | useSkillEditor |
| `window.electronAPI.skill.getFileTree(skillName)`              | ファイルツリー取得 | useFileTree    |

### テスト構成

| カテゴリ                   | ファイル数 | テスト数 |
| -------------------------- | ---------- | -------- |
| 基本コンポーネント         | 4          | 33       |
| キーボードナビ (05A-001)   | 1          | 15       |
| Hook                       | 3          | 23       |
| モバイルドロワー (05A-002) | 1          | 7        |
| ショートカット (05A-003)   | 1          | 5        |
| Toast (05A-004)            | 2          | 12       |
| 読み取り専用 (05A-005)     | 2          | 9        |
| ナビゲーション (05A-006)   | 1          | 4        |
| アニメーション (05A-007)   | 2          | 14       |
| カバレッジ補完             | 1          | 19       |
| 拡張テスト                 | 1          | 24       |
| BackupMenu                 | 1          | 6        |
| UnsavedChangesDialog       | 1          | 6        |
| useSkillEditor.shortcut    | 1          | 6        |
| **合計**                   | **23**     | **191**  |

#### テスト方針（P39/P40/P31 対策）

- **fireEvent 限定**: P39 対策として `userEvent` を使用せず、`fireEvent` のみを使用。happy-dom 環境では `userEvent.setup()` が Symbol 操作エラーを引き起こすため
- **happy-dom 環境**: P40 対策として `cd apps/desktop` からテストを実行。モノレポルートからの実行では `vitest.config.ts` の environment 設定が読み込まれない
- **個別セレクタモック**: P31 対策として合成 Store Hook ではなく個別セレクタをモック。合成 Hook の戻り値関数を useEffect 依存配列に含めると無限ループが発生するため

### 既知の制約

#### index.tsx Function Coverage 62.5%（P41 制約）

- **原因**: Vitest の v8 カバレッジプロバイダが、インライン arrow function（`() => setIsDrawerOpen(false)` 等）を独立した関数としてカウントする
- **影響**: Lines/Stmts Coverage は 100% であり、実コードは全てカバーされている。v8 のカウント方法による見かけ上の低下
- **試行**: `useCallback` への抽出を試みたが、可読性低下と不要な依存配列追加で逆効果のため元に戻した
- **結論**: P41 として文書化済み。実質的なカバレッジ問題ではない

#### act() warnings in SkillEditorView.readonly.test.tsx

- **原因**: 非同期状態更新のタイミングに起因する React Testing Library の既知パターン
- **影響**: テスト結果に影響なし（全テスト PASS）
- **結論**: MINOR 指摘として未タスク化推奨。`waitFor` / `act` の適用範囲を見直すことで解消可能

### CSS 変数依存

コンポーネントで使用している CSS 変数（デザイントークン）:

| CSS 変数           | 用途               |
| ------------------ | ------------------ |
| `--bg-primary`     | メイン背景         |
| `--bg-secondary`   | セカンダリ背景     |
| `--bg-tertiary`    | ターシャリ背景     |
| `--text-primary`   | メインテキスト     |
| `--text-secondary` | セカンダリテキスト |
| `--border-default` | ボーダー           |
| `--status-primary` | アクセントカラー   |
| `--status-success` | 成功状態           |
| `--status-error`   | エラー状態         |
