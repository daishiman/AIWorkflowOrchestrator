# 未タスク検出レポート: TASK-CI-FIX-001

## 検出結果サマリー

| ソース                | 確認項目                           | 検出数                |
| --------------------- | ---------------------------------- | --------------------- |
| 元タスク仕様書        | 「スコープ外」として明示された項目 | 3件（うち1件解決済）  |
| Phase 3 設計レビュー  | PASS判定（指摘なし）               | 0件                   |
| Phase 10 最終レビュー | PASS判定（指摘なし）               | 0件                   |
| Phase 11 手動テスト   | スコープ外の発見事項・改善提案     | 2件（既存問題）       |
| コードコメント        | TODO/FIXME/HACK/XXX                | 0件                   |
| **合計**              |                                    | **4件（指示書作成）** |

## 検出タスク一覧

| ID  | タスク候補                                                 | 発見元              | 優先度 | 指示書ファイル                               | ステータス |
| --- | ---------------------------------------------------------- | ------------------- | ------ | -------------------------------------------- | ---------- |
| U1  | Next.js 16 その他の破壊的変更対応                          | 元タスク仕様書      | 中     | `task-nextjs16-breaking-changes.md`          | 作成済み   |
| U2  | eslint-config-next の FlatCompat 依存解消（将来的）        | 元タスク仕様書      | -      | -（実装中に解決済み）                        | 解決済み   |
| U3  | apps/web の同様の lint 修正                                | 元タスク仕様書      | 低     | `task-web-lint-migration.md`                 | 作成済み   |
| U4  | ルートの `.eslintignore` → `eslint.config.js` ignores 移行 | Phase 11 手動テスト | 低     | `task-eslintignore-flat-config-migration.md` | 作成済み   |
| U5  | packages/shared の `no-explicit-any` warning 解消          | Phase 11 手動テスト | 低     | `task-shared-no-explicit-any-fix.md`         | 作成済み   |

## 指示書配置先

```
docs/30-workflows/unassigned-task/
├── task-nextjs16-breaking-changes.md          (U1: 中優先度)
├── task-web-lint-migration.md                 (U3: 低優先度)
├── task-eslintignore-flat-config-migration.md (U4: 低優先度)
└── task-shared-no-explicit-any-fix.md         (U5: 低優先度)
```

## 備考

- **U1**: dependabot PR #562 の一部として別途対応が必要
- **U2**: `eslint-config-next@16+` がネイティブ flat config を出力することが実装段階で判明したため、FlatCompat依存解消の必要はなくなった（タスク仕様書作成時の想定が不要になった）。指示書は作成不要。
- **U4, U5**: 既存の技術的負債であり、本タスクの変更によって新たに発生したものではない
- 全指示書はWhy/What/How形式で記述し、Level A品質（100人中100人が同じ理解で実行可能）を目標に作成
