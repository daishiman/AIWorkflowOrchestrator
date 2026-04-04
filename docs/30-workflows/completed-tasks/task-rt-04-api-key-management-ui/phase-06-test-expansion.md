# Phase 6: テスト拡充 - Skill Runtime API Key Panel

## メタ情報

| 項目       | 値                  |
| ---------- | ------------------- |
| タスクID   | TASK-RT-04          |
| Phase      | 6 - テスト拡充      |
| 前提Phase  | Phase 5（実装）完了 |
| 関連Issue  | #1881               |
| ステータス | pending             |

## 目的

フェイルパス・エッジケース・回帰ガードのテストを追加する。

## 実行タスク

- `auth-key:*` の失敗系と境界値を追加する
- `ApiKeySettingsPanel` の回帰ケースを追加する
- `SkillLifecyclePanel` への統合回帰を追加する
- サニタイズと状態遷移を固定する

## 参照資料

| 資料名               | パス                                                     | 説明               |
| -------------------- | -------------------------------------------------------- | ------------------ |
| Phase 5 実装         | [phase-05-implementation.md](phase-05-implementation.md) | 実装済み挙動       |
| Phase 4 テスト作成   | [phase-04-test-creation.md](phase-04-test-creation.md)   | Red ケース         |
| Phase 2 設計         | [phase-02-design.md](phase-02-design.md)                 | エラーハンドリング |
| Phase 3 設計レビュー | [phase-03-design-review.md](phase-03-design-review.md)   | 回帰観点           |

## 統合テスト連携

- Phase 5 実装の回帰を追加ケースで再確認する
- UI と IPC のフェイルパスを同時に再現できることを確認する

## 成果物

| 成果物         | パス                                     |
| -------------- | ---------------------------------------- |
| 拡充テスト結果 | outputs/phase-6/test-expansion-result.md |
| エラーパス一覧 | outputs/phase-6/error-path-cases.md      |
| 回帰ガード一覧 | outputs/phase-6/regression-guards.md     |

## 完了条件

- [ ] 失敗系と境界値が追加されている
- [ ] `ApiKeySettingsPanel` の回帰ケースが追加されている
- [ ] `SkillLifecyclePanel` への統合回帰が追加されている
- [ ] 本Phase内の全タスクを100%実行完了
