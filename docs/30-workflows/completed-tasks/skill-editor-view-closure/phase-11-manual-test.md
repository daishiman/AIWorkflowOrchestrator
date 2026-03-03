# Phase 11: 手動テスト — SkillEditorView 実装残課題収束

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| Phase        | 11                                          |
| タスクID     | UT-UI-05A-IMPLEMENTATION-CLOSURE-001        |
| 機能名       | SkillEditorView 実装残課題収束              |
| 作成日       | 2026-03-03                                  |
| 前提Phase    | Phase 10（最終レビュー）完了・PASS 判定済み |
| 担当者       | 実装担当者                                  |
| GitHub Issue | #947                                        |

## 目的

Phase 5-10 で実装した SkillEditorView の7課題（UT-UI-05A-001〜007）について、
実際の Electron アプリ上で動作確認を行い、受入基準を満たすことを検証する。
自動テストでは検出できない視覚的なフィードバック・操作感・アニメーションを人間の目で確認する。

## 対象課題

| ID            | 課題名                            | カテゴリ         | 優先度 |
| ------------- | --------------------------------- | ---------------- | ------ |
| UT-UI-05A-001 | FileTree キーボードナビゲーション | アクセシビリティ | 高     |
| UT-UI-05A-002 | モバイルドロワー                  | レスポンシブ     | 高     |
| UT-UI-05A-003 | Cmd/Ctrl+S 保存ショートカット     | 操作性           | 高     |
| UT-UI-05A-004 | 保存成功 Toast 通知               | フィードバック   | 中     |
| UT-UI-05A-005 | 読み取り専用表示強化              | UI表示           | 中     |
| UT-UI-05A-006 | ナビゲーション導線配線            | 導線             | 高     |
| UT-UI-05A-007 | マイクロアニメーション            | UX               | 低     |

## テストケース

| テストケース | 対応課題        | 検証観点                                 | 必須証跡                                     |
| ------------ | --------------- | ---------------------------------------- | -------------------------------------------- |
| TC-01        | UT-UI-05A-001   | FileTree キーボードフォーカス遷移        | `screenshots/01-filetree-keyboard-focus.png` |
| TC-02        | UT-UI-05A-002   | モバイル幅でドロワー閉状態               | `screenshots/02-mobile-drawer-closed.png`    |
| TC-03        | UT-UI-05A-002   | モバイル幅でドロワー開状態               | `screenshots/03-mobile-drawer-open.png`      |
| TC-04        | UT-UI-05A-003/4 | 保存操作 + 成功 Toast 表示               | `screenshots/04-save-toast-success.png`      |
| TC-05        | UT-UI-05A-005   | 読み取り専用バナー + 編集不可            | `screenshots/05-readonly-indicator.png`      |
| TC-06        | UT-UI-05A-006   | 未保存変更時の離脱確認ダイアログ         | `screenshots/06-navigation-breadcrumb.png`   |
| TC-07        | UT-UI-05A-007   | 動きのある UI 状態（展開アニメーション） | `screenshots/07-animation-motion.png`        |
| TC-08        | 統合確認        | SkillEditorView 全体表示（デスクトップ） | `screenshots/08-full-editor-view.png`        |

## 画面カバレッジマトリクス

| テストケース | 画面状態                           | 証跡                                                          |
| ------------ | ---------------------------------- | ------------------------------------------------------------- |
| TC-01        | デスクトップ: キーボードフォーカス | `outputs/phase-11/screenshots/01-filetree-keyboard-focus.png` |
| TC-02        | モバイル: ドロワー閉               | `outputs/phase-11/screenshots/02-mobile-drawer-closed.png`    |
| TC-03        | モバイル: ドロワー開               | `outputs/phase-11/screenshots/03-mobile-drawer-open.png`      |
| TC-04        | 保存成功 Toast                     | `outputs/phase-11/screenshots/04-save-toast-success.png`      |
| TC-05        | 読み取り専用                       | `outputs/phase-11/screenshots/05-readonly-indicator.png`      |
| TC-06        | 未保存離脱ダイアログ               | `outputs/phase-11/screenshots/06-navigation-breadcrumb.png`   |
| TC-07        | マイクロアニメーション状態         | `outputs/phase-11/screenshots/07-animation-motion.png`        |
| TC-08        | 全体ビュー                         | `outputs/phase-11/screenshots/08-full-editor-view.png`        |

## 実行タスク

### Task 1: アプリ起動確認

**手順:**

1. `pnpm --filter @repo/desktop dev` でElectronアプリを起動する
2. SkillEditorView に遷移する（ダッシュボード → スキル一覧 → 任意のスキルを選択）
3. コンソールエラーがないことを確認する

**期待結果:**

- アプリが正常に起動している
- SkillEditorView が表示されている
- ブラウザコンソール（DevTools）にエラーが出力されていない

---

### Task 2: UT-UI-05A-001 — FileTree キーボードナビゲーション検証

**前提:** スキルファイルが複数存在するスキルを開いた状態

**手順:**

1. FileTree エリア（左ペイン）にマウスでフォーカスを当てる
2. `Tab` キーを押し、最初のファイルアイテムにフォーカスが移ることを確認
3. `↓` 矢印キーで次のファイルに移動できることを確認
4. `↑` 矢印キーで前のファイルに戻れることを確認
5. `Enter` キーでファイルが選択・エディタにロードされることを確認
6. `Home` キーで最初のアイテムに移動できることを確認
7. `End` キーで最後のアイテムに移動できることを確認
8. フォーカス中のアイテムに視覚的なフォーカスリング（outline）が表示されることを確認

**期待結果:**

- キーボード操作のみで全ファイルを選択・移動できる
- フォーカスリングが明確に表示される（コントラスト比 3:1 以上）
- `aria-selected` 属性が正しく更新される（DevTools Accessibility ツールで確認）

**スクリーンショット:** `screenshots/01-filetree-keyboard-focus.png`

---

### Task 3: UT-UI-05A-002 — モバイルドロワー検証

**前提:** DevTools の Responsive Design Mode を使用

**手順:**

1. DevTools を開き（Cmd+Option+I）、Responsive Design Mode に切り替える
2. 画面幅を 768px 未満に設定する（例: iPhone 14 Pro = 390px）
3. FileTree が非表示になり、ハンバーガーアイコン（≡）または引き出しボタンが表示されることを確認
4. ドロワーボタンをクリックして FileTree が右/左からスライドインすることを確認
5. ドロワー外側をクリックしてドロワーが閉じることを確認
6. Esc キーでドロワーが閉じることを確認
7. 画面幅を 768px 以上に戻したとき、FileTree が通常表示に戻ることを確認

**期待結果:**

- モバイル幅（768px 未満）でドロワーレイアウトが適用される
- ドロワー開閉アニメーション（translateX）が滑らかに動作する（≤16ms/frame）
- ドロワーが開いているとき `role="dialog"` と `aria-modal="true"` が設定されている

**スクリーンショット:**

- `screenshots/02-mobile-drawer-closed.png`（ドロワー閉じた状態）
- `screenshots/03-mobile-drawer-open.png`（ドロワー開いた状態）

---

### Task 4: UT-UI-05A-003 — Cmd/Ctrl+S 保存ショートカット検証

**手順:**

1. エディタエリアでスキル内容を編集する
2. `Cmd+S`（macOS）または `Ctrl+S`（Windows/Linux）を押す
3. ファイルが保存されることを確認（タイトルバーの unsaved インジケーター消滅）
4. ショートカットが別のページでは動作しないことを確認（ナビゲーション後に戻ってテスト）
5. 読み取り専用ファイルに対してショートカットを押したとき、保存が実行されないことを確認

**期待結果:**

- `Cmd/Ctrl+S` でスキルが保存される
- 保存後、エディタの変更フラグ（ダーティ状態）がリセットされる
- 保存成功 Toast が表示される（Task 5 と連動）

---

### Task 5: UT-UI-05A-004 — 保存成功 Toast 通知検証

**手順:**

1. スキルを編集し、保存ボタンまたは Cmd+S で保存する
2. 画面右下（または右上）に Toast 通知が表示されることを確認
3. Toast に「保存しました」または同等のメッセージが表示されることを確認
4. Toast が 3秒後に自動的に消えることを確認
5. 保存エラー時（ネットワーク障害等を模擬）に赤いエラー Toast が表示されることを確認
6. 複数回連続保存した場合、Toast が最大3件までスタック表示され、古い Toast から自動消去されることを確認

**期待結果:**

- 保存成功時: 緑色（または success 色）の Toast が表示される
- 保存失敗時: 赤色（または error 色）の Toast が表示される
- Toast は 3秒（±500ms）後に自動消去される
- `role="status"` または `role="alert"` でスクリーンリーダーに通知される

**スクリーンショット:** `screenshots/04-save-toast-success.png`

---

### Task 6: UT-UI-05A-005 — 読み取り専用表示強化検証

**前提:** 読み取り専用スキル（例: システム組み込みスキル）を開いた状態

**手順:**

1. 読み取り専用スキルをスキルリストから選択する
2. エディタ上部に「読み取り専用」バッジ/バナーが表示されることを確認
3. エディタ本文が編集不可能（cursor: not-allowed またはグレーアウト）であることを確認
4. 保存ボタンが無効化（disabled）されていることを確認
5. Cmd+S を押しても保存が実行されないことを確認
6. バッジ/バナーのカラーコントラストが WCAG AA 基準（4.5:1）を満たすことを確認

**期待結果:**

- 読み取り専用スキルに明確な視覚的インジケーターが表示される
- 編集操作が全てブロックされている
- `aria-readonly="true"` または `contenteditable="false"` が設定されている

**スクリーンショット:** `screenshots/05-readonly-indicator.png`

---

### Task 7: UT-UI-05A-006 — ナビゲーション導線配線検証

**手順:**

1. ダッシュボードから SkillEditorView への遷移をテストする
   - 「スキルを編集」ボタン/リンクをクリック
   - SkillEditorView が正常に開く
2. SkillEditorView からスキルリストへの「戻る」ナビゲーションをテストする
   - ブレッドクラム「スキル一覧」リンクをクリック
   - スキルリストに戻る
3. エディタ内でファイルを切り替えたとき、URL が更新されることを確認（ブラウザバックが機能する）
4. ブラウザバックボタンで前のファイルに戻れることを確認
5. 未保存変更がある状態でナビゲートしたとき、確認ダイアログが表示されることを確認

**期待結果:**

- 全ての導線が正しく機能する
- URL の変更が各操作に追従する
- 未保存変更がある場合、離脱防止ダイアログが表示される

**スクリーンショット:** `screenshots/06-navigation-breadcrumb.png`

---

### Task 8: UT-UI-05A-007 — マイクロアニメーション視覚確認

**手順:**

1. ファイルツリーで別ファイルを選択したとき、エディタ内容の切り替えアニメーションを確認
2. 保存ボタンにホバーしたとき、微妙なスケール/色変化があることを確認
3. Toast 通知の表示/非表示アニメーション（フェードイン/アウト）を確認
4. モバイルドロワーのスライドアニメーションが 200-300ms 以内で完了することを確認
5. OS の「モーション低減」設定を有効にしたとき、アニメーションが無効化または簡略化されることを確認
   - macOS: システム環境設定 → アクセシビリティ → ディスプレイ → 視差効果を減らす

**期待結果:**

- 全アニメーションが 200-300ms 以内で完了する
- `prefers-reduced-motion: reduce` 時にアニメーションが無効化される
- 60fps を維持している（DevTools Performance パネルで確認）

---

### Task 9: スクリーンショット撮影

**撮影対象と保存先:**

| ファイル名                                   | 内容                         |
| -------------------------------------------- | ---------------------------- |
| `screenshots/01-filetree-keyboard-focus.png` | キーボードフォーカス状態     |
| `screenshots/02-mobile-drawer-closed.png`    | モバイル：ドロワー閉じた状態 |
| `screenshots/03-mobile-drawer-open.png`      | モバイル：ドロワー開いた状態 |
| `screenshots/04-save-toast-success.png`      | 保存成功 Toast               |
| `screenshots/05-readonly-indicator.png`      | 読み取り専用バッジ           |
| `screenshots/06-navigation-breadcrumb.png`   | ナビゲーション導線           |
| `screenshots/07-animation-motion.png`        | アニメーション動作状態       |
| `screenshots/08-full-editor-view.png`        | エディタ全体ビュー           |

**撮影手順:**

1. Electron アプリで対象状態を再現する
2. `Cmd+Shift+4`（macOS）でスクリーンショットを撮影する
3. `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-11/screenshots/` に保存する

---

### Task 10: 発見した問題の記録

手動テスト中に発見した問題は `discovered-issues.md` に記録する。

**記録フォーマット:**

```markdown
## 発見した問題 #<番号>

- **発見日**: YYYY-MM-DD
- **対象課題**: UT-UI-05A-00X
- **重大度**: 致命的 / 重大 / 軽微 / 改善提案
- **再現手順**:
  1. ...
- **期待動作**: ...
- **実際の動作**: ...
- **スクリーンショット**: screenshots/XXX.png
```

## 参照資料

| 資料名                   | パス                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| 要件定義                 | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-1-requirements.md`      |
| 設計書                   | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-2-design.md`            |
| 実装結果                 | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-5-implementation.md`    |
| テスト拡充結果           | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-6-test-expansion.md`    |
| カバレッジ確認           | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-7-coverage-check.md`    |
| リファクタリング結果     | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-8-refactoring.md`       |
| 品質保証結果             | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-9-quality-assurance.md` |
| ナビゲーション仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`                    |
| UI/UX設計原則            | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`             |
| UI/UX 機能コンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`            |
| アクセシビリティ基準     | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                  |
| 最終レビュー結果         | `docs/30-workflows/completed-tasks/skill-editor-view-closure/phase-10-final-review.md`     |

## システム仕様参照

| 仕様カテゴリ          | 参照先                                                            |
| --------------------- | ----------------------------------------------------------------- |
| UI コンポーネント設計 | `aiworkflow-requirements/references/arch-ui-components.md`        |
| Apple HIG 準拠方針    | `.claude/rules/01-architecture.md` — UI/UX デザイン哲学セクション |
| アクセシビリティ基準  | WCAG 2.1 AA（コントラスト比 4.5:1 以上、キーボード操作完全対応）  |

## 統合テスト連携

本 Phase は自動テスト（Phase 4-9）の補完として実施する。

| 自動テスト対象（カバー済み） | 手動テスト対象（本 Phase）     |
| ---------------------------- | ------------------------------ |
| キーボードイベントの発火     | フォーカスリングの視覚的確認   |
| Toast レンダリングの有無     | Toast の色・アニメーション確認 |
| ルーティング変更の検証       | 実際の画面遷移・URL 変化の確認 |
| `aria-*` 属性の設定確認      | スクリーンリーダーでの動作確認 |

## 多角的チェック観点

### アクセシビリティ

- [ ] キーボードのみで全機能を操作できる
- [ ] フォーカスリングが常に表示されている
- [ ] スクリーンリーダー向け ARIA ラベルが適切

### レスポンシブデザイン

- [ ] 390px（モバイル）でドロワーレイアウトが機能する
- [ ] 768px（タブレット）でレイアウトが崩れない
- [ ] 1440px（デスクトップ）で通常レイアウトが機能する

### ユーザビリティ

- [ ] ショートカットキーが直感的に機能する
- [ ] 保存フィードバックが明確に伝わる
- [ ] 読み取り専用状態が一目で判断できる

### パフォーマンス

- [ ] ファイル切り替えが 200ms 以内で完了する
- [ ] アニメーションが 60fps を維持する
- [ ] モーション低減設定が尊重される

## 成果物

| 成果物               | パス                                                                                                 | 状態     |
| -------------------- | ---------------------------------------------------------------------------------------------------- | -------- |
| 手動テスト結果       | `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-11/manual-test-result.md` | 作成済み |
| 発見した問題リスト   | `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-11/discovered-issues.md`  | 作成済み |
| スクリーンショット群 | `docs/30-workflows/completed-tasks/skill-editor-view-closure/outputs/phase-11/screenshots/`          | 取得済み |

## 完了条件

以下のチェックリストを全て完了してから Phase 12 に進むこと:

- [ ] Task 1: アプリが正常起動し、SkillEditorView が表示される
- [ ] Task 2: UT-UI-05A-001 キーボードナビゲーションが全手順で動作する
- [ ] Task 3: UT-UI-05A-002 モバイルドロワーが 768px 未満で正常動作する
- [ ] Task 4: UT-UI-05A-003 Cmd/Ctrl+S 保存ショートカットが動作する
- [ ] Task 5: UT-UI-05A-004 保存成功 Toast が正しく表示・消去される
- [ ] Task 6: UT-UI-05A-005 読み取り専用表示が明確に表示される
- [ ] Task 7: UT-UI-05A-006 全ナビゲーション導線が正常に動作する
- [ ] Task 8: UT-UI-05A-007 アニメーションが正常動作し、モーション低減設定を尊重する
- [ ] Task 9: スクリーンショット 8枚が `screenshots/` に保存されている
- [ ] Task 10: 発見した問題が `discovered-issues.md` に記録されている
- [ ] `manual-test-result.md` に全テスト結果（PASS/FAIL/SKIP）が記録されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## 次 Phase

Phase 12: ドキュメント更新 → [phase-12-documentation.md](phase-12-documentation.md)

**Phase 12 移行前チェック:**

- 発見した問題が致命的・重大の場合 → 問題を修正後に Phase 12 へ
- 軽微・改善提案の場合 → `discovered-issues.md` に記録し、未タスク化の上 Phase 12 へ
