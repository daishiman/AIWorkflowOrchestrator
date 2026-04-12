# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 11                                   |
| 名称       | 手動テスト                           |
| タスクID   | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 作成日     | 2026-04-11                           |
| ステータス | 未実施                               |

---

## 目的

- **本タスクは UIタスク（VISUAL）** のため、スクリーンショット取得と視覚的検証を実施する
- 3層評価（Semantic / Visual / AI UX）を実行する
- HIGH 問題を `unassigned-task/` へ自動生成する

---

## UIタスク / VISUAL 判定

Phase 1 で宣言済み: **UIタスク / VISUAL**

```bash
# Phase 11 開始前に確認
jq '.taskId' outputs/phase-11/phase11-capture-metadata.json
# → "UT-SKILL-WIZARD-CATEGORY-UI-ICON-001" と一致することを確認
```

---

## 実行タスク

### Task 1: 手動テスト環境準備

```bash
# Electron 開発サーバー起動
pnpm --filter @repo/desktop dev
```

スキルウィザード Step 0（SkillInfoStep）を表示する操作手順：

1. デスクトップアプリを起動
2. スキル作成ウィザードを開く
3. Step 0（スキル基本情報入力画面）が表示されることを確認

### Task 2: Semantic テスト（機能動作確認）

| 確認項目                                               | 期待動作                                         | 結果 |
| ------------------------------------------------------ | ------------------------------------------------ | ---- |
| 各カテゴリボタンにアイコン（絵文字）が表示される       | ⚡ 🔗 📊 💻 📦 が各ボタンに表示                  | [ ]  |
| カテゴリボタンにマウスをホバーするとツールチップが表示 | `title` 属性のブラウザネイティブツールチップ表示 | [ ]  |
| カテゴリをクリックすると選択状態に変わる               | ボタンが青色ハイライト表示                       | [ ]  |
| 選択済みカテゴリを再クリックしても状態が変わらない     | 選択状態が維持される                             | [ ]  |
| 「次へ」ボタンがカテゴリ選択後に活性化する             | disabled が解除されクリック可能になる            | [ ]  |

### Task 3: Visual テスト（スクリーンショット取得）

**VISUAL タスクのため、以下のスクリーンショットを取得・保存する:**

`screenshot-plan.json` に SS-01〜SS-04 の目的・対象操作・対応 TC を先に固定してから取得する。

| ショット ID | 状態                             | 保存先                                              |
| ----------- | -------------------------------- | --------------------------------------------------- |
| SS-01       | カテゴリ未選択（初期状態）       | `outputs/phase-11/screenshots/ss-01-initial.png`    |
| SS-02       | 「自動化」カテゴリ選択済み       | `outputs/phase-11/screenshots/ss-02-automation.png` |
| SS-03       | ホバー時ツールチップ表示         | `outputs/phase-11/screenshots/ss-03-tooltip.png`    |
| SS-04       | 全カテゴリボタン（アイコン確認） | `outputs/phase-11/screenshots/ss-04-all-icons.png`  |

```bash
# screenshot ディレクトリ作成
mkdir -p docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-11/screenshots
```

#### 画面カバレッジマトリクス

| ショット ID | 対応テスト                                | 確認ポイント                         |
| ----------- | ----------------------------------------- | ------------------------------------ |
| SS-01       | TC-EC-01                                  | 初期状態で全ボタンが未選択であること |
| SS-02       | TC-EC-02 / TC-A1-03                       | 選択状態が切り替わること             |
| SS-03       | TC-TT-01 / TC-TT-02                       | `title` に説明文が乗ること           |
| SS-04       | TC-IC-01 / TC-IC-02 / TC-IC-03 / TC-IC-04 | 全カテゴリのアイコンが表示されること |

### Task 4: AI UX テスト（視覚検証）

Apple UI/UX ガイドラインに基づく視覚検証：

| 観点                 | 確認内容                                                   | 判定 |
| -------------------- | ---------------------------------------------------------- | ---- |
| 視覚的一貫性         | アイコン絵文字のサイズ・配置が他のボタン要素と調和している | [ ]  |
| 選択状態の視認性     | 選択済みカテゴリが青色ハイライトで明確に識別できる         | [ ]  |
| ツールチップの可読性 | `title` 属性のツールチップが判読可能                       | [ ]  |
| アイコンと文字の間隔 | アイコン `span` と `label` `span` の間隔が適切             | [ ]  |

`manual-test-report.md` には、Semantic / Visual / AI UX の3層評価を要約し、`ui-sanity-visual-review.md` には視覚所見を詳細に記録する。

### Task 5: 発見問題の記録

```
## 発見事項（discovered-issues.md 記録欄）
HIGH 問題: （あれば記録 → unassigned-task 生成）
MEDIUM 問題: （あれば記録）
LOW 問題: （あれば記録）
```

HIGH 問題が発見された場合は `unassigned-task/` に新規 `.md` ファイルを生成する。

`manual-test-result.md` には、Semantic テスト結果・スクリーンショット取得結果・発見事項をまとめる。

### Task 6: スクリーンショットカバレッジ検証

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  docs/30-workflows/skill-info-step-category-ui-icon --phase 11
```

`manual-test-checklist.md` に、TC-ID と evidence の対応を残し、`validate-phase11-screenshot-coverage.js` の判定と一致させる。

---

## 参照資料

- `.claude/skills/task-specification-creator/references/phase-11-screenshot-guide.md`
- `.claude/skills/task-specification-creator/references/screenshot-verification-procedure.md`

---

## 統合テスト連携

- 手動 UI 確認（アイコン表示・ツールチップ動作・アクセシビリティ）を実施
- 自動テスト（Phase 4/6）で検証済みの動作を視覚的に確認する

---

## 成果物

| 成果物                              | 配置先                                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------------------- |
| Phase 11 手動テスト書（本ファイル） | `docs/30-workflows/skill-info-step-category-ui-icon/phase-11-manual-test.md`                        |
| screenshot-plan.json                | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-11/screenshot-plan.json`          |
| スクリーンショット（4枚）           | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-11/screenshots/`                  |
| manual-test-checklist.md            | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-11/manual-test-checklist.md`      |
| manual-test-result.md               | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-11/manual-test-result.md`         |
| manual-test-report.md               | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-11/manual-test-report.md`         |
| ui-sanity-visual-review.md          | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-11/ui-sanity-visual-review.md`    |
| discovered-issues.md                | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-11/discovered-issues.md`          |
| screenshot-coverage.md              | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-11/screenshot-coverage.md`        |
| phase11-capture-metadata.json       | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-11/phase11-capture-metadata.json` |

---

## 完了条件

- [ ] VISUAL 判定を確認（UIタスク / VISUAL）
- [ ] Semantic テスト（機能動作）全項目確認
- [ ] スクリーンショット 4枚取得・保存
- [ ] AI UX テスト（視覚検証）実施
- [ ] `screenshot-plan.json` 作成
- [ ] `manual-test-checklist.md` 作成
- [ ] `manual-test-result.md` に証跡記録
- [ ] `manual-test-report.md` 作成
- [ ] `ui-sanity-visual-review.md` 作成
- [ ] `discovered-issues.md` 作成（0件でも出力必須）
- [ ] `screenshot-coverage.md` 作成
- [ ] `validate-phase11-screenshot-coverage.js` 実行
- [ ] HIGH 問題があれば `unassigned-task/` に登録

---

## タスク100%実行確認【必須】

- [ ] Task 1 完了: 手動テスト環境準備
- [ ] Task 2 完了: Semantic テスト
- [ ] Task 3 完了: スクリーンショット取得（SS-01〜SS-04）
- [ ] Task 4 完了: AI UX テスト
- [ ] Task 5 完了: 発見問題記録
- [ ] Task 6 完了: スクリーンショットカバレッジ検証

---

## 次Phase

Phase 11 完了後 → **Phase 12: ドキュメント更新** へ進む
