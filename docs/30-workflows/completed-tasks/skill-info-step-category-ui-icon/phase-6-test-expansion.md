# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 6                                    |
| 名称       | テスト拡充                           |
| タスクID   | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 作成日     | 2026-04-11                           |
| ステータス | 未実施                               |

---

## 目的

- Phase 4 テストケースに加え、エッジケース・A11y 深掘り・回帰ガード テストを追加する
- Phase 5 実装後に新たに発見したエッジケースを網羅する
- 全テストが継続 PASS することを確認する

---

## 実行タスク

### Task 1: エッジケーステスト追加

| TC ID    | テストケース                                                                           | 期待結果                           |
| -------- | -------------------------------------------------------------------------------------- | ---------------------------------- |
| TC-EC-01 | `formData.category` が `null` の初期状態で全ボタンが `aria-pressed="false"` であること | 全5ボタンが `aria-pressed={false}` |
| TC-EC-02 | カテゴリ選択後に別カテゴリを選択すると `aria-pressed` が正しく切り替わること           | 旧選択が `false`、新選択が `true`  |
| TC-EC-03 | 全5カテゴリのアイコンが一意（重複なし）であること                                      | 5つのアイコン絵文字が全て異なる    |
| TC-EC-04 | 全5カテゴリの `description`（title属性）が一意であること                               | 5つの説明文が全て異なる            |

### Task 2: A11y 深掘りテスト追加

| TC ID    | テストケース                                                                          | 期待結果                                 |
| -------- | ------------------------------------------------------------------------------------- | ---------------------------------------- |
| TC-A2-01 | `aria-label` がカテゴリ名と一致し、説明文を含まないこと（全5カテゴリ）                | 各 `aria-label` が `label` と一致する    |
| TC-A2-02 | `title` が説明文を含むこと（全5カテゴリ）                                             | 各 `title` が `description` と一致する   |
| TC-A2-03 | カテゴリグループに `role="group"` と `aria-label="カテゴリを選択"` があること（既存） | グループのセマンティクスが維持されている |

### Task 3: 回帰ガードテスト確認

Phase 5 実装後に既存テストが全て継続 PASS することを確認する：

```bash
# 既存テストの回帰確認
pnpm vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx
```

確認項目：

- [ ] `formData.purpose` バリデーション関連テストが PASS
- [ ] `isNextEnabled` 制御（目的10文字以上 + カテゴリ選択）テストが PASS
- [ ] `onNext` コールバックテストが PASS

### Task 4: 補助コマンド確認

```bash
# 拡充後のテスト全件実行
pnpm vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx

# 型チェック継続確認
pnpm typecheck
```

---

## 参照資料

- `phase-4-test-creation.md` - 初回テストケース一覧
- `phase-5-implementation.md` - 実装内容

---

## 統合テスト連携

- 全カテゴリ（5種）のアイコン・ツールチップ・A11y テストが拡充されていることを確認
- 既存テストとの回帰が発生していないことを確認

---

## 成果物

| 成果物                             | 配置先                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| Phase 6 テスト拡充書（本ファイル） | `docs/30-workflows/skill-info-step-category-ui-icon/phase-6-test-expansion.md`         |
| 拡充テストケース一覧               | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-6/test-expansion.md` |

---

## 完了条件

- [ ] TC-EC-01〜TC-EC-04（エッジケース）追加
- [ ] TC-A2-01〜TC-A2-03（A11y 深掘り）追加
- [ ] 既存テスト回帰なし確認
- [ ] 全テスト PASS 確認

---

## タスク100%実行確認【必須】

- [ ] Task 1 完了: エッジケーステスト追加
- [ ] Task 2 完了: A11y 深掘りテスト追加
- [ ] Task 3 完了: 回帰ガード確認
- [ ] Task 4 完了: 補助コマンド実行

---

## 次Phase

Phase 6 完了後 → **Phase 7: カバレッジ確認** へ進む
