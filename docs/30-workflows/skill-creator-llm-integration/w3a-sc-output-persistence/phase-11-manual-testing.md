# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 11                            |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |

## 目的

execute() を実際に実行し、`.claude/skills/{skillName}/` 配下に SKILL.md / agents / scripts / references が正しく生成されることを実環境で確認する。

## 実行タスト

1. **環境準備**
   - Electron アプリを開発モードで起動する（`pnpm --filter @repo/desktop dev`）
   - `.claude/skills/` ディレクトリに書き込み権限があることを確認する
2. **正常系テスト**
   - シナリオ A: `skillName: "test-skill-01"` で execute() を呼び出す
     - `.claude/skills/test-skill-01/SKILL.md` が生成されることを確認する
     - `.claude/skills/test-skill-01/agents/` サブディレクトリが生成されることを確認する
     - `.claude/skills/test-skill-01/scripts/` サブディレクトリが生成されることを確認する
     - `.claude/skills/test-skill-01/references/` サブディレクトリが生成されることを確認する
   - シナリオ B: 同じ `skillName` で再度 execute() を呼び出す
     - `SKILL_ALREADY_EXISTS` エラーが返ることを確認する
3. **パストラバーサル防止テスト**
   - `skillName: "../malicious"` で execute() を呼び出す
   - バリデーションエラーが返り、ファイルが生成されないことを確認する
4. **テスト後のクリーンアップ**
   - テスト用に生成した `.claude/skills/test-skill-01/` を削除する
5. **P53 対策: スクリーンショット取得**
   - CLI 環境の場合、生成されたファイルの `ls -la .claude/skills/test-skill-01/` の出力を記録する

## 参照資料

- `docs/30-workflows/skill-creator-llm-integration/04-phase-10-final-review.md`
- `.claude/rules/06-known-pitfalls.md`（P53: CLI 環境でのスクリーンショット取得制約）

## 成果物

- `docs/30-workflows/skill-creator-llm-integration/04-phase-11-manual-test-output.md`（手動テスト結果記録）
  - 生成されたファイル一覧（`ls -la` 出力）
  - 上書き防止エラーの確認記録
  - パストラバーサル防止の確認記録

## 完了条件

- [ ] execute() を呼び出し、`.claude/skills/{skillName}/` 配下にファイルが生成された
- [ ] SKILL.md の内容が正しいことを確認した
- [ ] agents / scripts / references サブディレクトリが生成されたことを確認した
- [ ] 同名スキルの上書き防止が動作することを確認した
- [ ] パストラバーサル防止が動作することを確認した
- [ ] テスト後にテスト用ファイルを削除した
- [ ] 結果を `04-phase-11-manual-test-output.md` に記録した

## 次のPhase

Phase 12: ドキュメント
