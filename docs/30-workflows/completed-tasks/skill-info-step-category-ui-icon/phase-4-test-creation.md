# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 4                                    |
| 名称       | テスト作成                           |
| タスクID   | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 作成日     | 2026-04-11                           |
| ステータス | 未実施                               |

---

## 目的

- TDD Red フェーズ: 実装前にテストを作成し、失敗することを確認する
- Phase 1-3 で確認した命名規則と整合したテストパターンを適用する
- アイコン・ツールチップ・A11y のテストケースを網羅する

---

## 実行タスク

### Task 1: 命名規則との整合確認（TDD Red 前に必須）

Phase 1 で確認した命名規則をテストに適用する：

| テスト観点          | 命名規則                                      | 例                                                 |
| ------------------- | --------------------------------------------- | -------------------------------------------------- |
| `describe` ブロック | コンポーネント名（PascalCase）                | `describe("SkillInfoStep", ...)`                   |
| `it` / `test`       | 「〜すること」形式（日本語）                  | `it("各カテゴリボタンにアイコンが表示されること")` |
| セレクタ            | `getByRole` / `getByLabelText` / `getByTitle` | `getByRole("button", { name: ... })`               |

### Task 2: テストケース一覧

対象ファイル: `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx`

#### TC-ICON: アイコン表示テスト

| TC ID    | テストケース                                                   | 期待結果                                 |
| -------- | -------------------------------------------------------------- | ---------------------------------------- |
| TC-IC-01 | 各カテゴリボタンにアイコン（絵文字）が表示されること           | 全5カテゴリの icon 絵文字がDOMに存在する |
| TC-IC-02 | アイコンが `aria-hidden="true"` の `<span>` で包まれていること | スクリーンリーダーがアイコンを読み飛ばす |
| TC-IC-03 | `automation` カテゴリのアイコンが "⚡" であること              | `textContent` が "⚡" を含む             |
| TC-IC-04 | `external-integration` カテゴリのアイコンが "🔗" であること    | `textContent` が "🔗" を含む             |

#### TC-TOOLTIP: ツールチップテスト

| TC ID    | テストケース                                         | 期待結果                             |
| -------- | ---------------------------------------------------- | ------------------------------------ |
| TC-TT-01 | 各カテゴリボタンに `title` 属性が設定されていること  | `getAttribute("title")` が非空文字列 |
| TC-TT-02 | `automation` ボタンの `title` に説明文が含まれること | `title` が "自動化" 関連の説明を含む |
| TC-TT-03 | 全5カテゴリボタンの `title` が互いに異なること       | 各 `title` が一意                    |

#### TC-A11Y: アクセシビリティテスト

| TC ID    | テストケース                                                          | 期待結果                                                   |
| -------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| TC-A1-01 | 各カテゴリボタンに `aria-label` が設定されていること                  | `getAttribute("aria-label")` が非空                        |
| TC-A1-02 | `aria-label` がカテゴリ名と一致していること                           | `aria-label` が `label` と一致し、`description` を含まない |
| TC-A1-03 | `aria-pressed` が選択状態に応じて true/false を返すこと（既存テスト） | 選択時 `true`、未選択時 `false`                            |

#### TC-REG: 回帰テスト（既存動作の保護）

| TC ID    | テストケース                                                             | 期待結果                         |
| -------- | ------------------------------------------------------------------------ | -------------------------------- |
| TC-RG-01 | カテゴリをクリックすると `onFormDataChange` が呼ばれること（既存）       | mock 関数が呼び出される          |
| TC-RG-02 | 既にクリック済みのカテゴリを再クリックしても状態が変わらないこと（既存） | `onFormDataChange` が呼ばれない  |
| TC-RG-03 | `label` テキストがボタン内に表示されること（既存）                       | `getByText("自動化")` が見つかる |

### Task 3: テスト実装方針

#### private method テスト方針（[Feedback P0-09-U1] 対応）

本タスクの変更対象は全てパブリックな props/レンダリング結果のため、private method テストは不要。
テスト対象は全て DOM 属性（`aria-label`、`title`、`aria-hidden`、`aria-pressed`）で検証する。

#### テスト実行コマンド

```bash
# 対象ファイルを指定した targeted run（SIGKILL回避）
pnpm --filter @repo/desktop vitest run \
  src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx

# または
pnpm vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

### Task 4: TDD Red 確認

実装前にテストを実行し、新規テストケース（TC-IC-01〜TC-A1-03）が **FAIL** することを確認する。

```bash
# Red 確認コマンド
pnpm vitest run apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
# → TC-IC-*, TC-TT-*, TC-A1-* が FAIL することを記録する
```

---

## 参照資料

- `phase-2-design.md` - ボタン UI 設計・`CategoryOption` 型設計
- `phase-3-design-review.md` - MINOR 指摘一覧
- `apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx` - 既存テスト

---

## 統合テスト連携

- アイコン・ツールチップ・A11y の統合テストシナリオを全カテゴリ（5種）で作成する
- `aria-label` を `label` と一致させることで `getByRole("button", { name: label })` が安定して使える

---

## 多角的チェック観点（AIが判断）

| 観点         | 確認内容                                             |
| ------------ | ---------------------------------------------------- |
| テスト網羅性 | アイコン・ツールチップ・A11y・回帰の4カテゴリを網羅  |
| 命名規則整合 | Phase 1 記録の命名規則（describe/it/セレクタ）に準拠 |
| TDD 手順     | テスト作成 → Red 確認 → Phase 5 実装 の順序を守る    |
| 絵文字テスト | 絵文字は `textContent` / `innerHTML` で検証可能      |

---

## 成果物

| 成果物                             | 配置先                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| Phase 4 テスト作成書（本ファイル） | `docs/30-workflows/skill-info-step-category-ui-icon/phase-4-test-creation.md`      |
| テストケース一覧                   | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-4/test-cases.md` |

---

## 完了条件

- [ ] TC-IC-01〜TC-IC-04（アイコン）テストケース作成
- [ ] TC-TT-01〜TC-TT-03（ツールチップ）テストケース作成
- [ ] TC-A1-01〜TC-A1-03（A11y）テストケース作成
- [ ] TC-RG-01〜TC-RG-03（回帰）テストケース確認
- [ ] TDD Red 確認（新規テストが FAIL することを記録）

---

## タスク100%実行確認【必須】

- [ ] Task 1 完了: 命名規則との整合確認
- [ ] Task 2 完了: テストケース一覧作成
- [ ] Task 3 完了: テスト実装方針確定
- [ ] Task 4 完了: TDD Red 確認

---

## 次Phase

Phase 4 完了後 → **Phase 5: 実装** へ進む
