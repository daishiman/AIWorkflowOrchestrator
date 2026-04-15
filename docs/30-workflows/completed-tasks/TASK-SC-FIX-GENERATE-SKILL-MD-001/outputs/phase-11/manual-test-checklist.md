# Phase 11 成果物: 手動テストチェックリスト

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 11                                |
| Phase名    | 手動テスト                        |
| タスクID   | TASK-SC-FIX-GENERATE-SKILL-MD-001 |
| ステータス | 完了（N/A）                       |
| 作成日     | 2026-04-15                        |

## N/A 判定

本タスクは UI 層への変更を含まないため、視覚的な手動テストは **N/A** とする。

**根拠**:

- 変更対象: `SkillCreatorService.ts`（mainプロセスのサービス層）と `SkillCreatorService.test.ts`
- renderer プロセスのコンポーネントへの変更なし
- ユーザーが視覚的に確認できる画面変更が発生しない
- AC-1〜AC-5 の全条件は自動テスト（TC-01〜TC-07）で網羅済み

## チェックリスト（自動テスト代替）

- [x] TC-01: `generate_skill_md.js` が `--plan`/`--output` 引数で呼ばれる
- [x] TC-02: `--plan` の次要素が `os.tmpdir()` 配下のパスである
- [x] TC-03: `--output` の次要素が `skillDir/SKILL.md` である
- [x] TC-04: スクリプト失敗時に `ensureSkillMdExists` が 2 回以上呼ばれる
- [x] TC-05: スクリプト不在時に例外が throw されない
- [x] TC-06: スクリプト成功時に `fs.unlink` が `skill-plan-` を含むパスで呼ばれる
- [x] TC-07: スクリプト失敗時にも `fs.unlink` が呼ばれる（finally 保証）
