# クイック復旧手順（同種課題向け）

1. 監査を先行実行する。
   - `node scripts/audit_task9_spec_sync.js --format markdown`
2. 問題を2分類する。
   - 参照パス差分 (`oldPaths`)
   - artifacts 欠落 (`missingArtifacts`)
3. 参照差分を一括置換し、artifacts は task単位で補完する。
4. 再監査して 0 件化を確認する。
5. `task-workflow.md` と `lessons-learned.md` に完了記録・苦戦箇所・再発防止手順を反映する。
