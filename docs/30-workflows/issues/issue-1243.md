# [#1243] "[TASK-IMP-SKILL-LIFECYCLE-05-CUSTOMSTORAGE-VALIDATION-GUARD-001] TASK"

## メタ情報

```yaml
task_id: TASK-IMP-SKILL-LIFECYCLE-05-CUSTOMSTORAGE-VALIDATION-GUARD-001
task_name: TASK
category: -
target_feature: -
priority: 低
scale: small
status: 未着手
source_phase: -
created_date: 2026-03-15
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-skill-lifecycle-05-customstorage-validation-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | small  |
| ステータス | 未着手 |

---

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-SKILL-LIFECYCLE-05 の favoriteSkillNames 設計で、customStorage の Set 型復元処理に `as string[]` 型キャストが使用されている。P19（型キャストによる実行時検証バイパス）に該当し、破損データで実行時エラーが発生するリスクがある。

### 問題点

`JSON.parse()` 結果を `as string[]` でキャストする設計は、TypeScript コンパイルを通過させるだけで実行時の型安全性を保証しない。localStorage の破損、ブラウザ拡張による汚染、バージョン移行時のスキーマ変更で不正データが混入した場合、`new Set(corrupted)` でアプリがクラッシュする。

### 放置時の影響

- 破損データで favorite 情報が失われ、ユーザーが再設定を強いられる
- persist migration との責務分離が曖昧なまま放置される
- P19/P48 パターンの未修正箇所として技術的負債が累積する

## 2. 何を達成するか（What）

### 目的

customStorage 復元処理を runtime validation ベースへ統一し、`as` キャスト依存を除去する。

### 最終ゴール

`JSON.parse()` 結果を `unknown` 型で受け取り、3段バリデーション（`Array.isArray()` → 要素型検証 → Set 構築）で安全に復元される。

### スコープ

- **含む**: customStorage の `getItem` 内の Set 型復元ロジック
- **含まない**: persist migration バージョン管理（別タスク）、他の型キャスト箇所

### 成果物

| 名前               | 説明                                                               |
| ------------------ | ------------------------------------------------------------------ |
| validator 関数     | `unknown` → `string[]` の安全な変換関数                            |
| customStorage 修正 | `as string[]` を validator 呼び出しに置換                          |
| 破損データテスト   | `null`, `undefined`, `[1, 2, 3]`, `"not-array"` 等の異常入力テスト |

## 3. どのように実行するか（How）

### 前提条件

- `apps/desktop/src/renderer/store/index.ts` に customStorage 実装が存在する
- P19/P48 パターンが `06-known-pitfalls.md` に記録されている

### 推奨アプローチ

`unknown` 受け取り + `Array.isArray` + `.filter(item => typeof item === "string")` の3段でデータを正規化する。invalid データは空 Set にフォールバックし、`console.warn` で警告ログを出力する。

### 3.5. 苦戦しやすいポイント（TASK-SKILL-LIFECYCLE-05 実体験ベース）

- **persist migration との責務分離**: customStorage のバリデーションと persist の migration 処理は異なる責務。バリデーションは「現在のスキーマで読めるか」、migration は「旧スキーマを新スキーマに変換するか」で判断する
- **NaN 境界値の教訓**: TASK-SKILL-LIFECYCLE-05 で `NaN` が `normalizeScore()` で 0 にクランプされる挙動の把握に時間がかかった。同様に、customStorage でも予期しない型（number 配列など）が混入する可能性があり、要素レベルの型検証が必須
- **validation 追加後の snapshot 破損**: Vitest の snapshot テストがある場合、validator 追加で戻り値の形が変わると snapshot が壊れる。テスト更新を先に計画する

```typescript
// ❌ P19 違反: 型キャストで実行時検証バイパス
const items = JSON.parse(stored) as string[];

// ✅ 3段バリデーション
const parsed: unknown = JSON.parse(stored);
const items = Array.isArray(parsed)
  ? parsed.filter((item): item is string => typeof item === "string")
  : [];
```

## 4. 実行手順

1. `apps/desktop/src/renderer/store/index.ts` の customStorage 復元コードを特定する
2. `validateStringArray(input: unknown): string[]` バリデーション関数を作成する
3. `as string[]` を `validateStringArray()` 呼び出しに置換する
4. 破損 payload ケース（`null`, `undefined`, `[1, 2, 3]`, `"not-array"`, `{key: "value"}`）をテストに追加する
5. persist 復元→バリデーション→Set 構築のフロー全体をテストする

## 5. 完了条件チェックリスト

- [ ] `as string[]` 依存が除去されている
- [ ] `validateStringArray()` 関数が `unknown` → `string[]` 変換を実装している
- [ ] 破損 payload（5パターン以上）からのフォールバックが実装されている
- [ ] persist 復元テストが追加されている
- [ ] 型安全性（`pnpm typecheck` PASS）と実行時安全性の両方を満たしている
- [ ] `console.warn` で破損データ検出時の警告ログが出力される

## 6. 検証方法

```bash
# Store テスト
pnpm --filter @repo/desktop exec vitest run src/renderer/store/**/*.test.ts

# 型チェック
pnpm --filter @repo/desktop typecheck

# P19 パターン残存チェック
grep -rn "as string\[\]" apps/desktop/src/renderer/store/
```

## 7. リスクと対策

| リスク                                | 影響度 | 確率 | 対策                                                                             |
| ------------------------------------- | ------ | ---- | -------------------------------------------------------------------------------- |
| 既存 persist データが読み込めなくなる | 高     | 低   | migration path を定義して段階導入。バリデーション失敗時は空 Set にフォールバック |
| validation 過剰で正常データを捨てる   | 中     | 低   | 許容スキーマ（`string[]`）を先に固定しテストで境界を確認                         |
| snapshot テスト破損                   | 低     | 中   | テスト更新を先に計画し、`--update` で snapshot を更新                            |

## 8. 参照情報

| ドキュメント              | パス                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Phase 12 未タスクレポート | `docs/30-workflows/skill-lifecycle-unification/tasks/step-04-seq-task-05-created-skill-usage-journey/outputs/phase-12/unassigned-task-report.md` |
| 状態管理仕様              | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                                                     |
| workflow 正本             | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md`                                      |
| P19 パターン              | `.claude/rules/06-known-pitfalls.md#P19`                                                                                                         |
| P48 パターン              | `.claude/rules/06-known-pitfalls.md#P48`                                                                                                         |
| Store実装                 | `apps/desktop/src/renderer/store/index.ts`                                                                                                       |

## 9. 備考

- persist schema バージョン更新が必要な場合は別未タスクへ分離する
- TASK-SKILL-LIFECYCLE-05 で NaN 境界値テストの重要性を学んだ経験を、customStorage の異常入力テスト設計に活かす
- validator 関数は将来的に他の persist データ（recentlyUsedSkills 等）にも再利用可能
