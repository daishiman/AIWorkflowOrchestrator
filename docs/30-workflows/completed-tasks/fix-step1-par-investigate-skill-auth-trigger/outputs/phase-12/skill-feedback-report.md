# Phase 12: スキルフィードバック — TASK-TRACE-SKILL-AUTH-001

## 学び

1. `auth:login` のような副作用は、静的 grep だけでなく `never-resolving mock` を使う回帰テストで押さえると再発検知しやすい
2. `SkillLifecyclePanel` のような複合コンポーネントは、UI 表層と store ルートを分けて検証すると spec drift を減らせる
3. Phase 12 は implementation guide だけでなく、system spec / unassigned / compliance まで揃えて初めて bundle として完結する
4. UI 変更がない場合でも、`N/A` と書いて証跡を残すと後続のレビューで迷いが減る

## next action

- もし再び `auth:login` タイムアウトが報告されたら、`App.tsx` の `initializeAuth` と `AuthGuard` の実行タイミングを優先して再確認する
- 似た問題では、最初に `login()` の入口へ trace を入れ、次に回帰テストで `never-resolving` 条件を作る
