# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                 |
| ---------- | ------------------------------------ |
| Phase      | 7                                    |
| 名称       | カバレッジ確認                       |
| タスクID   | UT-SKILL-WIZARD-CATEGORY-UI-ICON-001 |
| 作成日     | 2026-04-11                           |
| ステータス | 未実施                               |

---

## 目的

- 変更した関数・ブロックの line カバレッジと branch カバレッジを可視化する
- カバレッジ目標（Line 80%以上、Branch 60%以上）を達成していることを確認する
- **[Feedback BEFORE-QUIT-002] 対応**: カバレッジ対象範囲を変更ブロックに絞り込み、局所検証の意図を明確にする

---

## 実行タスク

### Task 1: カバレッジ対象範囲の明示

**対象範囲（変更したブロック）:**

| 対象ファイル                                                          | 対象ブロック                                        |
| --------------------------------------------------------------------- | --------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx` | `CATEGORY_OPTIONS` マップ内のボタンレンダリング処理 |
| 同上                                                                  | `handleCategoryClick` 関数                          |

**対象外:**

- `formData.purpose` バリデーション（本タスクで変更なし）
- `isNextEnabled` 計算（本タスクで変更なし）
- `onNext` ハンドラ（本タスクで変更なし）

### Task 2: カバレッジ計測コマンド

```bash
# targeted coverage（対象ファイル指定）
pnpm vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/SkillInfoStep.test.tsx \
  --coverage \
  --coverage.include="apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx"
```

### Task 3: カバレッジ目標確認

| 指標              | 目標    | 対象ブロック                |
| ----------------- | ------- | --------------------------- |
| Line Coverage     | 80%以上 | CATEGORY_OPTIONS マップ処理 |
| Branch Coverage   | 60%以上 | `isSelected` 条件分岐       |
| Function Coverage | 80%以上 | `handleCategoryClick`       |

**[Feedback 5] 対応**: 変更した関数・ブロックの line カバレッジと branch カバレッジの実測値を証跡に残す。

記録フォーマット（outputs/phase-7/ に記録）:

```
対象: CATEGORY_OPTIONS ボタンレンダリング
  Line Coverage: XX% （目標: 80%）
  Branch Coverage: XX% （目標: 60%、isSelected 条件）

対象: handleCategoryClick 関数
  Line Coverage: XX%
  Branch Coverage: XX% （既存値と同等）
```

### Task 4: カバレッジ未達時の対処

カバレッジが目標未達の場合は Phase 6 へ戻り、テストを追加する。

| 未達ケース                      | 対処                                            |
| ------------------------------- | ----------------------------------------------- |
| `isSelected` 分岐が Branch 未達 | 選択済み/未選択の両状態をテストするケースを追加 |
| アイコン span が Line 未達      | アイコン表示のレンダリングテストを追加          |

---

## 参照資料

- `phase-6-test-expansion.md` - 拡充テストケース
- `.claude/skills/task-specification-creator/references/coverage-standards.md`

---

## 統合テスト連携

- カバレッジ計測後、全テストが継続 PASS することを確認
- 対象外ブロックのカバレッジは本タスクの責任範囲外（既存テストで担保済み）

---

## 成果物

| 成果物                                 | 配置先                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| Phase 7 カバレッジ確認書（本ファイル） | `docs/30-workflows/skill-info-step-category-ui-icon/phase-7-coverage-check.md`          |
| カバレッジレポート                     | `docs/30-workflows/skill-info-step-category-ui-icon/outputs/phase-7/coverage-report.md` |

---

## 完了条件

- [ ] カバレッジ対象範囲を変更ブロックに絞り込み明示
- [ ] `pnpm vitest run --coverage` 実行
- [ ] Line Coverage 80%以上を確認（変更ブロック）
- [ ] Branch Coverage 60%以上を確認（`isSelected` 分岐）
- [ ] 実測値を証跡として記録

---

## タスク100%実行確認【必須】

- [ ] Task 1 完了: カバレッジ対象範囲明示
- [ ] Task 2 完了: カバレッジ計測コマンド実行
- [ ] Task 3 完了: 目標値確認・実測値記録
- [ ] Task 4 完了: 未達時の対処方針確認

---

## 次Phase

- カバレッジ目標達成 → **Phase 8: リファクタリング** へ進む
- カバレッジ未達 → **Phase 6: テスト拡充** へ戻る
