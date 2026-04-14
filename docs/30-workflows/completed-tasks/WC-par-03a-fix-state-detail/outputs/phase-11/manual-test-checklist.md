# Phase 11: 手動テストチェックリスト

## 対象: TASK-SW-FIX-STATE-DETAIL-001

### VISUAL 確認項目一覧

---

## MTC-01: キャンセルボタン表示（templateMode + エラー状態）

**対応 AC**: AC-2

**前提条件**:

- SkillCreateWizard が templateMode で起動している
- `isTemplateMode=true` が `GenerateStep` に渡されている
- 生成処理がエラー状態（`stage="error"`）である

**操作手順**:

1. templateMode でウィザードを開く
2. Step 0〜2 を完了して GenerateStep に進む
3. 意図的にエラーが発生する状態で生成ボタンを押す（またはモック環境でエラー注入）
4. `GenerateStep` のエラー表示を確認する

**確認観点**:

- [ ] エラーカードの下にキャンセルボタンが表示されている
- [ ] ボタンラベルが「キャンセル」である
- [ ] ボタンのスタイル（border / text-secondary / hover）が既存 UI と整合している
- [ ] ボタンがエラーカードの直下、垂直中央揃えで配置されている

**証跡**: `screenshots/MTC-01-template-error-cancel.png`

---

## MTC-02: キャンセルボタン押下 → Step 0 遷移

**対応 AC**: AC-2

**前提条件**: MTC-01 の状態（templateMode + エラー表示中）

**操作手順**:

1. MTC-01 の状態でキャンセルボタンをクリックする

**確認観点**:

- [ ] Step 0（スキル情報入力画面）に遷移する
- [ ] GenerateStep が非表示になる
- [ ] ウィザードが初期状態に戻り、再入力可能である

**証跡**: `screenshots/MTC-02-template-cancel-step0.png`

---

## MTC-03: キャンセルボタン非表示（非 templateMode）

**対応 AC**: AC-2 回帰確認

**前提条件**:

- SkillCreateWizard が通常モード（templateMode=false）で起動している
- 生成処理がエラー状態である

**操作手順**:

1. 通常モードでウィザードを開く
2. 生成エラーを発生させる

**確認観点**:

- [ ] エラーカードが表示される
- [ ] templateMode 専用のキャンセルボタンが **表示されない**
- [ ] 既存のリトライボタンのみが表示される

**証跡**: `screenshots/MTC-03-normal-error-no-cancel.png`

---

## MTC-04: internalAnswers リトライリセット（AC-1 視覚確認）

**対応 AC**: AC-1

**前提条件**:

- SkillCreateWizard の Step 1（ConversationRoundStep）が表示されている

**操作手順**:

1. Step 1 でいくつかの質問に回答する（例: q1 で「自分のみ」を選択）
2. ウィザードをリトライ操作でリセットする
3. Step 1 に戻る

**確認観点**:

- [ ] 以前の選択状態がクリアされている（`aria-pressed="false"` に戻っている）
- [ ] 入力フィールドが空値になっている
- [ ] 前回の選択が残留していない

**証跡**: `screenshots/MTC-04-retry-reset-step1.png`

---

## MTC-05: q5 変更後の外部統合 UI 更新（AC-3 補足確認）

**対応 AC**: AC-3

**前提条件**:

- Step 1 の質問 q5（外部ツール連携）が変更可能な状態

**操作手順**:

1. q5 で外部ツール連携を「あり」に設定する
2. 外部ツール名が表示されることを確認する
3. q5 を「なし」に変更する

**確認観点**:

- [ ] q5 変更後に外部統合関連の UI（ツール名表示など）が即時更新される
- [ ] q1〜q4 を変更しても外部統合 UI が不変であること

**証跡**: `screenshots/MTC-05-q5-external-checklist.png`

---

## 確認環境

| 項目             | 内容                                                          |
| ---------------- | ------------------------------------------------------------- |
| アプリ種別       | Electron デスクトップアプリ（`apps/desktop`）                 |
| 起動コマンド     | `pnpm --filter @repo/desktop dev`                             |
| モック環境       | Vitest との組み合わせではなく実アプリでの動作確認             |
| templateMode起動 | `SkillCreateWizard` に `isTemplateMode=true` を渡す経路を使用 |

---

## Phase 12 への引き継ぎ

- MTC-01〜MTC-05 の実施結果を `manual-test-result.md` に記録する
- PASS の場合は Phase 12 ドキュメント更新へ進む
- FAIL の場合は該当 AC の修正箇所に戻る
