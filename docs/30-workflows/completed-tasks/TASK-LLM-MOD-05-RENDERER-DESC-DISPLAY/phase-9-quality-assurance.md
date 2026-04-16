# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 9                                     |
| Phase名    | 品質保証                              |
| 対象機能   | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY |
| 前提Phase  | Phase 8: リファクタリング             |
| 次Phase    | Phase 10: 最終レビュー                |
| ステータス | pending                               |
| 作成日     | 2026-04-16                            |

## 目的

line budget・link・mirror parity を一括判定し、PR 提出前品質を保証する。

## 実行タスク

### Task 1: line budget チェック

各修正ファイルの変更行数が最小限であることを確認する:

```bash
git diff --stat HEAD
```

| ファイル                | 想定追加行数 | 判定基準                       |
| ----------------------- | ------------ | ------------------------------ |
| InlineModelSelector.tsx | ~20 行       | tooltip / helper text 追加のみ |
| テストファイル          | ~60 行       | T-1〜T-15 + 境界値テスト追加   |

### Task 2: リンク確認

仕様書内のリンク整合性を確認する:

- `phase-1-requirements.md` → `phase-2-design.md` リンクが有効か
- 各 Phase ファイルの `次Phase` リンクが正確か
- `artifacts.json` のパスが実際のファイルと一致しているか

### Task 3: mirror parity チェック

`.claude/skills/` と `.agents/skills/` の mirror が最新状態か確認する（本タスクでは skill 変更なし）:

```bash
# mirror parity の確認（差分がないことを確認）
diff .claude/skills/task-specification-creator/SKILL.md .agents/skills/task-specification-creator/SKILL.md
```

### Task 4: 全品質チェックの実行

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# Lint
pnpm --filter @repo/desktop lint

# テスト（カバレッジ付き）
pnpm --filter @repo/desktop test -- --coverage

# ビルド確認
pnpm --filter @repo/desktop build
```

### Task 5: AC 達成確認

| AC   | 内容                                                | 確認方法                               | 判定 |
| ---- | --------------------------------------------------- | -------------------------------------- | ---- |
| AC-1 | `InlineModelSelector` で description 表示           | T-1, T-6, T-12 テスト PASS + 手動確認  | -    |
| AC-2 | description 未設定時の安全処理                      | T-2, T-3, T-10, T-15 テスト PASS       | -    |
| AC-3 | 既存の model selection フロー・アクセシビリティ維持 | T-4, T-5, T-13, T-14, T-15 テスト PASS | -    |
| AC-4 | 既存テストへ description の期待値追加               | T-1〜T-15 追加確認                     | -    |
| AC-5 | TypeScript 型エラー・ESLint エラーなし              | typecheck + lint PASS                  | -    |
| AC-6 | docs と UI の文言が一致                             | 仕様書と実装の文言を目視確認           | -    |

## 参照資料

| 資料名             | パス                        | 説明           |
| ------------------ | --------------------------- | -------------- |
| テスト拡充記録     | `phase-6-test-expansion.md` | T-1〜T-15      |
| カバレッジレポート | `phase-7-coverage-check.md` | カバレッジ数値 |

## 成果物

| 成果物           | パス                                | 説明                                         |
| ---------------- | ----------------------------------- | -------------------------------------------- |
| 品質保証レポート | `outputs/phase-9/quality-report.md` | line budget・AC 達成確認・全品質チェック結果 |

## 完了条件

- [ ] line budget が想定範囲内である
- [ ] 仕様書リンクが全て有効である
- [ ] 全品質チェック（typecheck / lint / test / build）が PASS している
- [ ] AC-1〜AC-6 が全て達成されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 10: 最終レビュー](./phase-10-final-review.md)
