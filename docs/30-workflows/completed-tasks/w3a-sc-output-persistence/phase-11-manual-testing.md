# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 11                            |
| 機能名   | w3a-sc-output-persistence     |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |
| 更新日   | 2026-03-23                    |

## 目的

execute() を実際に実行し、`.claude/skills/{skillName}/` 配下に SKILL.md / agents / scripts / references が正しく生成されることを実環境で確認する。

## 実行タスク

1. 環境準備
2. 正常系テスト
3. パストラバーサル防止テスト
4. テスト後のクリーンアップ
5. P53 対策: スクリーンショット取得

## テストカテゴリ

- **機能テスト**: 正常系（ファイル生成）/ 異常系（上書き防止・パストラバーサル）/ 境界値（空配列）
- **統合テスト**: execute() → persist() → ファイル生成の一連フロー
- **リグレッションテスト**: 既存 execute() 機能が影響を受けていないこと

> **UI/UX変更判定**: 本タスクはバックエンド（Main Process）のファイル書き込み機能のみ。Renderer コンポーネントの変更なし。UI/UXテスト・スクリーンショット撮影は**非適用**。

## 実行手順

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

- `docs/30-workflows/w3a-sc-output-persistence/phase-10-final-review.md`
- `.claude/rules/06-known-pitfalls.md`（P53: CLI 環境でのスクリーンショット取得制約）

## 成果物

- `docs/30-workflows/w3a-sc-output-persistence/phase-11-manual-test-output.md`（手動テスト結果記録）
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
- [ ] 結果を `phase-11-manual-test-output.md` に記録した
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

手動統合テスト確認:

| テスト項目           | 確認内容                                                      | 期待結果                        | 実行結果   |
| -------------------- | ------------------------------------------------------------- | ------------------------------- | ---------- |
| ファイル生成         | execute() 後に .claude/skills/{skillName}/ 配下にファイル生成 | SKILL.md + サブディレクトリ生成 | {{RESULT}} |
| 上書き防止           | 同名スキルで再実行                                            | SKILL_ALREADY_EXISTS エラー     | {{RESULT}} |
| パストラバーサル防止 | `../malicious` でexecute()                                    | バリデーションエラー            | {{RESULT}} |
| クリーンアップ       | テスト用ファイル削除                                          | ディレクトリ完全削除            | {{RESULT}} |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                                     | 仕様参照先                                   |
| ------------------ | -------------------------------------------- | -------------------------------------------- |
| セキュリティ       | **適用**: パストラバーサル防止・書き込み制限 | `aiworkflow-requirements: security-*.md`     |
| エラーハンドリング | **適用**: ロールバック動作                   | `aiworkflow-requirements: error-handling.md` |
| UI/UX              | **非適用**: バックエンド変更のみ             | -                                            |
| アクセシビリティ   | **非適用**                                   | -                                            |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 12: ドキュメント
