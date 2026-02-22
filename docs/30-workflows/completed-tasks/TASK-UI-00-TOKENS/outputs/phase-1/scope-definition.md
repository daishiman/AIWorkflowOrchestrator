# スコープ定義書 — TASK-UI-00-TOKENS Phase 1

## メタ情報

| 項目     | 値                |
| -------- | ----------------- |
| タスクID | TASK-UI-00-TOKENS |
| Phase    | 1（要件定義）     |
| 作成日   | 2026-02-22        |

---

## 1. スコープ内（In Scope）

### 1-1. tokens.css Light テーマ定義

| 対象                                                              | 内容                                                           | 要件ID             |
| ----------------------------------------------------------------- | -------------------------------------------------------------- | ------------------ |
| `[data-theme="light"]` セレクタ                                   | Apple HIG System Colors に全面置き換え                         | FR-L-001〜FR-L-012 |
| 背景色（bg-primary/secondary/tertiary/elevated/glass/selection）  | Apple System Background Colors + elevated/glass/selection 拡張 | FR-L-002〜FR-L-005 |
| テキスト色（text-primary/secondary/muted/inverse）                | Apple Label Colors + inverse                                   | FR-L-006〜FR-L-007 |
| ボーダー色（border-default/emphasis/subtle）                      | Apple Separator Colors                                         | FR-L-008           |
| ステータス色（status-primary/success/warning/error/info + hover） | Apple System Tint Colors + ホバー色                            | FR-L-009〜FR-L-011 |
| Syntax Highlighting                                               | Xcode Light 準拠（8変数）                                      | FR-L-012           |

### 1-2. tokens.css Dark テーマ定義

| 対象                                                              | 内容                                         | 要件ID             |
| ----------------------------------------------------------------- | -------------------------------------------- | ------------------ |
| `[data-theme="dark"]` セレクタ                                    | Apple HIG System Colors (Dark) に新規定義    | FR-D-001〜FR-D-012 |
| 背景色（bg-primary/secondary/tertiary/elevated/glass/selection）  | Apple System Background Colors (Dark) + 拡張 | FR-D-002〜FR-D-005 |
| テキスト色（text-primary/secondary/muted/inverse）                | Apple Label Colors (Dark) + inverse          | FR-D-006〜FR-D-007 |
| ボーダー色（border-default/emphasis/subtle）                      | Apple Separator Colors (Dark)                | FR-D-008           |
| ステータス色（status-primary/success/warning/error/info + hover） | Apple System Tint Colors (Dark) + ホバー色   | FR-D-009〜FR-D-011 |
| Syntax Highlighting                                               | Xcode Dark 準拠（8変数）                     | FR-D-012           |

### 1-3. マイクロインタラクション変数

| 対象                           | 内容                                         | 要件ID               |
| ------------------------------ | -------------------------------------------- | -------------------- |
| `:root` CSS カスタムプロパティ | イージング関数2種 + スケール値3種            | FR-MI-001〜FR-MI-005 |
| `@keyframes success-bounce`    | 成功フィードバック用バウンスアニメーション   | FR-MI-006            |
| `@keyframes error-shake`       | エラーフィードバック用シェイクアニメーション | FR-MI-007            |

### 1-4. renderWithTheme テストヘルパー

| 対象                     | 内容                                                          | 要件ID               |
| ------------------------ | ------------------------------------------------------------- | -------------------- |
| `renderWithTheme` 関数   | `@testing-library/react` の `render` をテーマ対応でラップ     | FR-TH-001〜FR-TH-005 |
| テーマ横断ユニットテスト | 3テーマでの正常レンダリング + デフォルト値 + 状態リセット検証 | FR-TT-001〜FR-TT-004 |

---

## 2. スコープ外（Out of Scope）

### 2-1. kanagawa-dragon テーマの変更

| 除外対象                                  | 理由                                                              |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `[data-theme="kanagawa-dragon"]` の値変更 | 既存テーマは保護対象。本タスクではlight/darkの追加のみ（NFR-004） |
| kanagawa-dragon テーマの削除              | 引き続きデフォルトテーマとして使用される                          |

### 2-2. settingsSlice のテーマ切替UI

| 除外対象                   | 理由                                                         |
| -------------------------- | ------------------------------------------------------------ |
| テーマ切替UIの実装         | TASK-UI-00-ATOMS / TASK-UI-00-ORGANISMS 等の後続タスクで対応 |
| settingsSlice への状態追加 | tokens.css レベルの定義が完了した後に着手する                |
| テーマ永続化ロジック       | electron-store / Zustand persist は後続タスクのスコープ      |

### 2-3. Component Tokens（コンポーネント固有トークン）

| 除外対象                                  | 理由                                                                          |
| ----------------------------------------- | ----------------------------------------------------------------------------- |
| `--button-*`, `--card-*` 等の部品トークン | Design Token 3層体系の Component Token 層は後続タスクで定義                   |
| Tailwind CSS ユーティリティマッピング     | tokens.css のセマンティック変数をTailwind `theme.extend` に反映する作業は後続 |

### 2-4. テスト範囲外

| 除外対象                       | 理由                                               |
| ------------------------------ | -------------------------------------------------- |
| E2Eテスト（Playwright）        | Phase 11 の手動テスト/E2Eテストフェーズで対応      |
| ビジュアルリグレッションテスト | スクリーンショット比較は別タスクで検討             |
| パフォーマンス計測テスト       | CSS変数追加の影響は計測不能レベルと想定（NFR-003） |

---

## 3. 前提条件

| 前提                                                                             | 根拠                            |
| -------------------------------------------------------------------------------- | ------------------------------- |
| `apps/desktop/src/renderer/styles/tokens.css` が存在する                         | 既存コードベース                |
| `apps/desktop/src/renderer/store/types.ts` に `ResolvedTheme` 型が定義されている | FR-TH-005 の型参照先            |
| happy-dom テスト環境が設定済み                                                   | `apps/desktop/vitest.config.ts` |
| `@testing-library/react` がインストール済み                                      | package.json の devDependencies |

---

## 4. 依存関係

### ブロックするタスク（本タスクの完了が前提）

| タスクID             | タスク名                 | 依存理由                                    |
| -------------------- | ------------------------ | ------------------------------------------- |
| TASK-UI-00-ATOMS     | Atoms コンポーネント     | tokens.css のセマンティック変数を参照する   |
| TASK-UI-00-MOLECULES | Molecules コンポーネント | Atoms + tokens.css のトークンを組み合わせる |
| TASK-UI-00-ORGANISMS | Organisms コンポーネント | Molecules + tokens.css のトークンを使用する |

### 依存するタスク（本タスクの前提）

なし（本タスクは最初に実行される基盤タスク）

---

## 5. 影響範囲

| 変更対象ファイル                                                           | 変更種別 | 影響                                                   |
| -------------------------------------------------------------------------- | -------- | ------------------------------------------------------ |
| `apps/desktop/src/renderer/styles/tokens.css`                              | 修正     | light/darkテーマ追加、マイクロインタラクション変数追加 |
| `apps/desktop/src/renderer/tests/helpers/renderWithTheme.ts`（新規）       | 新規作成 | テストヘルパー関数                                     |
| `apps/desktop/src/renderer/tests/helpers/renderWithTheme.test.tsx`（新規） | 新規作成 | テストヘルパーのユニットテスト                         |

---

## 6. リスク

| リスク                                   | 影響度 | 緩和策                                                   |
| ---------------------------------------- | ------ | -------------------------------------------------------- |
| kanagawa-dragon テーマへの意図しない変更 | 高     | AC-003: `git diff` による差分確認を完了条件に含める      |
| `--text-muted` のコントラスト比不足      | 中     | AC-006: 使用制限をドキュメント化し、使用箇所で個別検証   |
| 既存テストへの影響                       | 低     | 全テスト回帰実行（`cd apps/desktop && pnpm vitest run`） |
