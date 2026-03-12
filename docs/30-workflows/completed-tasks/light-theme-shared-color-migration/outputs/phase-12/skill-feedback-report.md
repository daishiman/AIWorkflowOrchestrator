# Phase 12 Output: Skill Feedback Report

## 対象

- `aiworkflow-requirements`
- `task-specification-creator`
- `skill-creator`

## 反映した改善

### 1. screenshot plan の route 単位制約を明示したい

`capture-screenshots.js` は `states[].route` を読まず `components[].route` を使う。  
state ごとに route を切り替えたい場合は component entry を分ける必要があるため、この制約を `.claude/skills/task-specification-creator/references/phase-11-12-guide.md` に反映した。

### 2. Playwright module resolution の注意書きが欲しい

workspace package に `playwright` が入っていても、workflow root script からの temp ESM import では解決できない場合がある。  
root `node_modules/playwright` の解決経路を前提条件として guide に書き、`require.resolve('playwright')` preflight を追加した。

### 3. verification-only blind spot の再監査チェックを強めたい

inventory が 0 件でも、status color や warning banner のような shared color は漏れやすい。  
verification-only 対象にも blind spot 再監査ステップを guide へ追加し、`SettingsView` の residual hardcode を current task 内で吸収した。

### 4. skill-creator の Phase 12 テンプレートへ同じ guard を還元したい

同種課題を次回短く閉じるには、guide だけでなく Phase 12 テンプレート本体にも残す必要がある。  
`phase12-system-spec-retrospective-template.md` / `phase12-spec-sync-subagent-template.md` に verification-only blind spot、`components[].route`、`require.resolve('playwright')`、user 指定 canonical root + mirror sync を追記し、`references/patterns.md` に成功/失敗パターンを追加した。

### 5. PASS した test の stderr warning を 0件扱いしない guard が欲しい

`SettingsView.integration.test.tsx` は PASS でも `ApiKeysSection` 起因の `act()` warning が継続し、Phase 10 residual note と結び付けないと `unassigned-task-detection.md` を 0件で閉じやすい。  
`task-specification-creator` には「PASS でも residual warning / existing backlog を照合する」ルールを、`skill-creator` には「既存未タスク再利用時も root `unassigned-task/` で正規化し、`--diff-from HEAD --target-file` まで記録する」パターンを追加した。

## 今回見送った改善

- Phase 4 / 7 テンプレート自体への横展開は、今回の guide 強化で代替し、別タスクへは切り出していない
- `task-specification-creator/SKILL.md` の 500 行超過 baseline は current task 起因ではないため、今回は範囲外とした

## validator メモ

- `.claude` / `.agents` の `aiworkflow-requirements`: 0 errors / 135 warnings（未リンク references が多い）
- `.claude` / `.agents` の `task-specification-creator`: existing error `SKILL.md` 508行
- `.claude` / `.agents` の `skill-creator`: PASS
