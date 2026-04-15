# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 6                                 |
| Phase名    | テスト拡充                        |
| 対象機能   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| 前提Phase  | Phase 5: 実装                     |
| 次Phase    | Phase 7: カバレッジ確認           |
| ステータス | pending                           |
| 作成日     | 2026-04-14                        |

## 目的

`--plan`/`--output`引数渡しおよび`finally`クリーンアップの境界条件を補強し、
バグ再発と回帰の両方を防止するテストカバレッジを確保する。

## 実行タスク

### Task 1: `--plan`にUUIDが含まれること（一意性確認）

- `generateSkillMd`を呼び出した際に`scriptExecutor.execute("generate_skill_md.js", [...])` へ渡される`--plan`引数が一時ファイルパスを指していることを確認する
- 一時ファイルパスにUUIDが含まれ、呼び出しごとに異なる値になることを確認する
- 同一`skillDir`で2回呼び出した際に異なる一時ファイルパスが使われることを確認する

### Task 2: generateResultがsuccessかつSKILL.mdが存在する場合、ensureSkillMdExistsが呼ばれないこと

- `scriptExecutor.execute` が終了コード0で返り、SKILL.mdが存在する場合に`ensureSkillMdExists`が呼ばれないことを確認する
- `scriptExecutor.execute` が終了コード0で返ってもSKILL.mdが存在しない場合は`ensureSkillMdExists`が呼ばれることを確認する
- フォールバック分岐とメイン成功分岐のどちらを通るかが`generateResult.success`とSKILL.mdの存在で決まることを確認する

### Task 3: fs.unlinkが例外をthrowしても全体処理が継続すること

- `finally`節内で`fs.unlink`がエラーをthrowした場合でも、`generateSkillMd`が正常に値を返すことを確認する
- `finally`節のエラーがメインの戻り値（generateResult）を上書きしないことを確認する
- `fs.unlink`の失敗が上位の呼び出し元へ伝播しないことを確認する

### Task 4: スクリプトの標準エラーが非空の場合でもsuccessがfalseなら正しくフォールバックに入ること

- `scriptExecutor.execute` が終了コード1（失敗）で返った際に`ensureSkillMdExists`が呼ばれることを確認する
- 標準エラー出力が空でない場合でも、終了コードが0でなければsuccessがfalseになることを確認する
- フォールバック経路でも最終的なSKILL.mdが存在することを確認する

## 参照資料

| 資料名       | パス                                     | 説明           |
| ------------ | ---------------------------------------- | -------------- |
| 実装記録     | `phase-5-implementation.md`              | 実装後の観測点 |
| テスト仕様書 | `outputs/phase-4/test-specifications.md` | 拡充元         |

## 統合テスト連携

- 境界ケースがAC-1〜AC-5の補強として機能することを確認する
- 拡充したテストがPhase 7のカバレッジ確認の入力となる

## 成果物

| 成果物         | パス                                      | 説明           |
| -------------- | ----------------------------------------- | -------------- |
| テスト拡充記録 | `outputs/phase-6/extended-test-record.md` | 境界ケース一覧 |

## 完了条件

- [ ] `--plan`引数のUUID一意性テストが追加されている
- [ ] generateResult成功時のフォールバック非実行テストが追加されている
- [ ] `finally`節でのfs.unlink失敗が処理継続に影響しないことが確認されている
- [ ] 終了コード非0のフォールバック経路テストが追加されている
- [ ] 既存の正常フローへの回帰がない
- [ ] 追加観点が成果物に記録されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage-check.md)
