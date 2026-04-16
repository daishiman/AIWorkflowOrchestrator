# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 7                                     |
| Phase名    | カバレッジ確認                        |
| 対象機能   | TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY |
| 前提Phase  | Phase 6: テスト拡充                   |
| 次Phase    | Phase 8: リファクタリング             |
| ステータス | pending                               |
| 作成日     | 2026-04-16                            |

## 目的

`InlineModelSelector` の concern と dependency edge の coverage を可視化し、AC-4 を満たすことを確認する。

## 実行タスク

### Task 1: カバレッジ計測

```bash
pnpm --filter @repo/desktop test -- --coverage
```

### Task 2: カバレッジ目標の確認

| カテゴリ | 対象                                                       | 目標     |
| -------- | ---------------------------------------------------------- | -------- |
| ユニット | InlineModelSelector: description ありの表示確認            | 100%     |
| ユニット | InlineModelSelector: description なし（undefined）の非表示 | 100%     |
| ユニット | InlineModelSelector: description 空文字の非表示            | 100%     |
| ユニット | InlineModelSelector: tooltip / aria-describedby 設定       | 100%     |
| 回帰     | モデル選択イベントの正常動作                               | 再発防止 |
| 回帰     | アクセシビリティ（フォーカス・キーボード操作）             | 再発防止 |

### Task 3: カバレッジレポートの解釈

カバレッジが目標を下回る場合の対応:

| 状況                     | 対応                                      |
| ------------------------ | ----------------------------------------- |
| ブランチカバレッジ < 80% | InlineModelSelector の分岐テストを追加    |
| ライン カバレッジ < 80%  | 未カバー行のテストケースを Phase 6 で追加 |
| スナップショットが stale | Phase 6 に戻ってスナップショット更新      |

### Task 4: dependency edge の確認

- `LLMModel.description` → `InlineModelSelector` → DOM 表示 の依存チェーンが全て確認されているか記録する

## 参照資料

| 資料名         | パス                        | 説明                   |
| -------------- | --------------------------- | ---------------------- |
| テスト拡充記録 | `phase-6-test-expansion.md` | T-1〜T-15 テストケース |

## 成果物

| 成果物             | パス                                 | 説明                                   |
| ------------------ | ------------------------------------ | -------------------------------------- |
| カバレッジレポート | `outputs/phase-7/coverage-report.md` | カバレッジ数値・未カバー箇所・対応記録 |

## 完了条件

- [ ] カバレッジ計測が実行されている
- [ ] カバレッジ目標が全て達成されている（未達の場合は理由と対応が記録されている）
- [ ] dependency edge が全て確認されている
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

## 次Phase

→ [Phase 8: リファクタリング](./phase-8-refactoring.md)
