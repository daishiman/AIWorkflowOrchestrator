# UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001

## 概要

スキル名バリデーション正規表現 `SKILL_NAME_PATTERN` を shared 定数へ一元化する。

## 背景

- `SkillService.ts` の `toWizardSkillName()` と `init_skill.js` が同型のバリデーションルール `/^[a-z0-9]+(-[a-z0-9]+)*$/` を個別に保持している。
- TASK-FIX-IPC-SKILL-NAME-001（2026-04-06）で `SkillService.ts` の正規化フローを修正したが、定数一元化は変更最小性のためスコープ外とした。
- 将来的に命名ルールが変更された場合、両ファイルを同期して更新する必要があり、見落としリスクがある。

## 実行タスク

1. `packages/shared/src/constants/skillName.ts`（または同等ファイル）に `SKILL_NAME_PATTERN` 定数を定義する。
2. `apps/desktop/src/main/services/skill/SkillService.ts` の `toWizardSkillName()` から定数を参照する。
3. `apps/desktop/scripts/init_skill.js` のバリデーション正規表現を同じ定数へ差し替える。
4. `@repo/shared` パッケージのビルド設定・エクスポートを更新する。
5. 影響範囲テストを実行して回帰がないことを確認する。

## 完了条件

- `SKILL_NAME_PATTERN` の定義が1箇所に集約されている。
- `SkillService.ts` と `init_skill.js` がともに shared 定数を参照している。
- 全テスト PASS・typecheck PASS。

## 由来

TASK-FIX-IPC-SKILL-NAME-001 Phase 12 / task-4-untasked-report.md UT-01（2026-04-06）
優先度: Medium
