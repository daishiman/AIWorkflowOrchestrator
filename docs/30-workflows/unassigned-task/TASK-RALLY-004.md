# TASK-RALLY-004: selectedOptionIds/selectedValues重複整理

## メタ情報

- 検出元: TASK-RALLY-001 Phase 12 レビュー・型定義ギャップ分析
- 優先度: Low
- GitHub Issue: #2389
- Wave: 0（RALLY-001, RALLY-002 と並列実行可）
- 後続タスク: RALLY-009（getSkillCreatorApi()型ガード強化）
- 衝突ドメイン: skillCreator型定義
- 関連ファイル:
  - `packages/shared/src/types/skillCreator.ts`

## 目的

`selectedOptionIds`（正規フィールド）と `selectedValues`（重複フィールド）の役割を明示し、`@deprecated` マーキングで将来の削除パスを確立する。型安全性を高め、RALLY-009 の型ガード実装の前提を整える。

## 背景

`skillCreator.ts` の型定義に `selectedOptionIds` と `selectedValues` という類似フィールドが共存し、どちらが正規（canonical）かが不明瞭。コンシューマーコードで混用が生じており、RALLY-009 で型ガードを追加するには先に正規フィールドを確定する必要がある。

## 実行タスク

- [ ] `selectedOptionIds` を `@canonical` として JSDoc コメントで明示する
- [ ] `selectedValues` に `@deprecated` マーキングを追加する
- [ ] 既存コンシューマーコードを `selectedOptionIds` に統一する（`rg` で全参照調査）
- [ ] 型定義の変更に伴う TypeScript エラーを修正する

## 完了条件

- [ ] `selectedValues` に `@deprecated` が明示されていること
- [ ] コンシューマーコードが `selectedOptionIds` のみ参照していること
- [ ] TypeScript 型チェック PASS
- [ ] 既存テスト PASS

## 苦戦箇所（RALLY-001実装知見）

| 苦戦箇所                    | 問題                                                   | 解決策                                                       |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| 参照の網羅性                | モノレポ全体で使われているフィールドの全参照特定が困難 | `pnpm --filter` と `rg` を組み合わせて全パッケージを横断検索 |
| @deprecated後の型エラー連鎖 | 一箇所を変更すると連鎖的にエラーが発生する可能性       | 変更前に全参照リストを作成してから一括置換                   |

## 参照

- 詳細Phase仕様書: `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-004/`
- 後続: TASK-RALLY-009（型ガード強化のためにこのタスクが前提）
