# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目      | 内容             |
| --------- | ---------------- |
| Phase     | 8                |
| Phase名   | リファクタリング |
| カテゴリ  | 品質改善         |
| 前提Phase | Phase 7          |
| 後続Phase | Phase 9          |

## 目的

テストで保護されている前提を崩さずに、可読性と責務境界の誤解余地を減らす。
特に `SkillCreatorOutputHandler` が別系統パイプラインであることを、コード上の固定コメントとして残す。

## 実行タスク

### タスク1: OutputHandler の責務明文化

- `SkillCreatorOutputHandler.ts` の先頭（JSDoc）に、別系統パイプラインである旨と正式パス（Facade 側）を明記する
- `toSlug()` は path-safe 前提（`/` `\\` `..` `\\0` を無効化、空は `unnamed-skill`）

### タスク2: 重複/曖昧さの除去

- Facade 側の `persistResult` 型を `PersistResult` に寄せ、インライン型のドリフトを防ぐ
- エラー表現が `persistError` に集約されていることを維持する

### タスク3: 回帰確認（テスト）

```bash
pnpm --filter @repo/desktop test -- --testPathPattern=persist-integration
```

## 統合テスト連携（Current Facts）

| 観点                    | テスト           |
| ----------------------- | ---------------- |
| 正常系                  | F-01, F-02       |
| スキップ系              | F-05, F-06, E-28 |
| DI 未注入               | F-04, E-16, E-29 |
| エラーパターン          | E-10 ~ E-15      |
| PATH_TRAVERSAL/rollback | E-21 ~ E-25      |
| 回帰ガード              | E-26 ~ E-29      |
