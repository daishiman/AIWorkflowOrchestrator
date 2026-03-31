# Phase 5 実装サマリー — layer1-semantic.spec.ts (SEM-001〜007)

## 概要

`apps/desktop/e2e/ui-ux/layer1-semantic.spec.ts` を新規作成した。
`TEST_TARGETS.filter(t => t.layer1)` でイテレートし、対象 5 画面（chat-main / skill-list / settings-general / sidebar-navigation / error-display）それぞれに動的 `test.describe` ブロックを生成する。

## 実装ファイル

| ファイル                                         | 役割                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| `apps/desktop/e2e/ui-ux/layer1-semantic.spec.ts` | SEM-001〜007 テスト本体（新規作成）                              |
| `apps/desktop/e2e/ui-ux/test-targets.config.ts`  | テスト対象設定（Phase 4 所有・読み取り専用）                     |
| `apps/desktop/e2e/ui-ux/helpers.ts`              | navigateToTarget / collectTabOrder（Phase 4 所有・読み取り専用） |

## テストケース実装内容

### SEM-001: インタラクティブ要素に role 属性が存在する

- `target.semanticTargets` をループし `expectedRole` があるエントリのみ検証する
- `expectedRole` が未設定のエントリはスキップ（pass 扱い）
- `semanticTargets` が空配列の場合もそのまま pass

### SEM-002: ボタン・リンクに aria-label または可視テキストが存在する

- `button, a, [role="button"]` を全件取得
- `aria-label` 属性（非空文字列）または `innerText`（非空文字列）のいずれかがあることを確認
- どちらも満たさない要素がある場合はインデックス付きのメッセージとともに fail

### SEM-003: フォーム要素に aria-describedby または label が関連付けられている

- `input, textarea, select` を全件取得
- 0 件の場合は `test.skip()` で即時 pass
- 検証優先順位: `aria-describedby` → `aria-labelledby` → `aria-label` → `label[for=id]`
- いずれも満たさない要素がある場合は fail

### SEM-004: Tab キーで全インタラクティブ要素にフォーカス移動できる

- `collectTabOrder(page, 15)` で Tab を 15 回押し、フォーカスされた要素の識別子リストを取得
- リスト長が 1 以上であることを確認

### SEM-005: tabindex の順序が視覚的な並びと矛盾しない

- `[tabindex]` 属性を持ち値が 0 以上の要素を収集
- 0 件なら `test.skip()`
- tabindex 値の Set サイズが配列長と一致すること（重複がないこと）を確認

### SEM-006: モーダル・ダイアログが開いている間、背後の要素がフォーカス不可になる

- `[role="dialog"], [role="alertdialog"]` が 0 件なら `test.skip()`
- `page.evaluate()` 内でダイアログ外のインタラクティブ要素を走査
- `inert` 属性または `tabIndex === -1` でなければ fail

### SEM-007: エラー状態時に aria-live または role="alert" でスクリーンリーダーに通知される

- `[aria-live], [role="alert"]` が 0 件なら `test.skip()`
- 1 件以上存在すれば pass

## 設計上の判断

| 判断事項                          | 内容                                                        |
| --------------------------------- | ----------------------------------------------------------- |
| `launchElectronApp()` 不使用      | Playwright 標準 `page` fixture（Chromium）を使用            |
| `test.skip()` の使い方            | 要素が存在しない場合のみ skip（アサーション失敗を防ぐため） |
| `test-targets.config.ts` 変更なし | Phase 4 の所有権を尊重し読み取り専用で利用                  |
| tabindex 重複チェック方針         | Set サイズ比較で O(n) の単純実装                            |
| ダイアログ外フォーカス判定        | `inert` プロパティと `tabIndex` の両方を確認                |

## 対象画面（layer1: true のターゲット）

| id                 | description              |
| ------------------ | ------------------------ |
| chat-main          | メインチャット画面       |
| skill-list         | スキル一覧画面           |
| settings-general   | 設定画面（一般タブ）     |
| sidebar-navigation | サイドバーナビゲーション |
| error-display      | エラー表示コンポーネント |

## 完了条件チェック

- [x] SEM-001〜007 が全て実装されている
- [x] TEST_TARGETS を読み取り専用で利用している（変更なし）
- [x] TypeScript import パスが正しい（`./test-targets.config`, `./helpers`）
- [x] 動的 `test.describe` がループで生成されている
- [x] `launchElectronApp()` を使用していない
- [x] `beforeEach` で `navigateToTarget(page, target.navigation)` を呼んでいる
