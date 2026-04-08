# カバレッジレポート - TASK-FIX-WORKTREE-CONFLICT-001

## AC 充足状況

| AC   | 基準                                     | 充足状況                    | 対応 TC                  |
| ---- | ---------------------------------------- | --------------------------- | ------------------------ |
| AC-1 | LOGS.md マージコンフリクトなし           | ✅ 前提条件（実施済み）     | -                        |
| AC-2 | EVALS.json JSON 構造有効                 | ✅ 充足                     | TC-A-01, TC-A-02         |
| AC-3 | .claude/\*\* CI スキップ                 | ✅ 充足（設定確認）         | TC-B-01, TC-B-02         |
| AC-4 | indexes/\*.json マージ後再生成           | ✅ 充足                     | TC-C-01〜03, TC-C-04〜05 |
| AC-5 | SKILL-changelog.md コンフリクトなし      | ✅ 充足（merge=union 設定） | TC-D-01                  |
| AC-6 | 全スキル SKILL-changelog.md 存在         | ✅ 充足（16/16）            | TC-D-02, TC-D-03         |
| AC-7 | gwt 後 post-merge フック自動インストール | ✅ 充足                     | TC-E-01, TC-E-02         |
| AC-8 | gwt-layout-init 重いフックスキップ       | ✅ 充足                     | TC-F-01                  |

## カバレッジ: 8/8 AC 充足（100%）

## 未実施 TC（環境依存）

| TC         | 理由                           | 代替確認                                 |
| ---------- | ------------------------------ | ---------------------------------------- |
| TC-A-01    | 2ブランチのマージが必要        | merge=ours 設定を .gitattributes で確認  |
| TC-B-01/02 | GitHub CI の実際の push が必要 | paths-ignore 設定を ci.yml で確認        |
| TC-C-01    | git merge の実行が必要         | フック単体動作確認で代替（TC-C-03 PASS） |

これらの TC は Phase 11 の手動テストで実際に push・merge して検証する。
