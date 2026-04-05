# Phase 1: SkillCreatorOutputHandler 調査結果

## 調査日時

2026-04-05

## 概要

- **パス**: `apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts`
- **責務**: SDK セッション完了時にスキル出力を捕捉し、ファイル保存・Registry 登録・IPC 通知を行う
- **重要**: `RuntimeSkillCreatorFacade` の正式パス（TASK-P0-05）とは **別系統パイプライン**

## 抽出アプローチ（Current Facts）

- **戦略A（マーカーベース）**: `<!-- SKILL_START: {skillName} -->` / `<!-- SKILL_END: {skillName} -->`
- **戦略B（フォールバック）**: マーカーなしの場合、出力全体を候補として `name:` を検索

## saveSkill() の書き出し先

- `{projectRoot}/.claude/skills/{dirName}/SKILL.md`
- `dirName` は `toSlug()` で生成（path-safe）
  - 小文字化
  - 空白を `-` に置換
  - `/` `\\` `..` `\\0` を無効化（`-` 置換）
  - 連続 `-` 圧縮、前後 `-` 除去
  - 空結果は `unnamed-skill`

## 呼び出し経路

- `SkillCreatorIpcBridge` 経由で `handleSessionComplete()` が呼ばれる
- `RuntimeSkillCreatorFacade` から直接は呼ばれない（統合対象ではない）

## 結論

`SkillCreatorOutputHandler` は session-output 用の別系統として維持し、TASK-P0-05 の統合パス（Facade -> Writer）と混同しないように明文化する。
