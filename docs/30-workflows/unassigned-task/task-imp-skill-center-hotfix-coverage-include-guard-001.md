# UT-IMP-SKILL-CENTER-HOTFIX-COVERAGE-INCLUDE-GUARD-001 - タスク指示書

## メタ情報

```yaml
issue_number: 974
```

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | UT-IMP-SKILL-CENTER-HOTFIX-COVERAGE-INCLUDE-GUARD-001                 |
| タスク名     | SkillCenter hotfix 対象カバレッジ include path ガード導入             |
| 分類         | 改善                                                                  |
| 対象機能     | SkillCenterView 削除導線ホットフィックスの回帰検証フロー              |
| 優先度       | 中                                                                    |
| 見積もり規模 | 小規模                                                                |
| ステータス   | 未実施                                                                |
| 発見元       | Phase 12（TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001 再確認） |
| 発見日       | 2026-03-04                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

SkillCenter 削除導線ホットフィックスの再検証で、対象3ファイルの coverage を再計測した際に `--coverage.include` のパス指定を誤ると、実測値が大きく変動し、品質判定が不安定になることが確認された。

### 1.2 問題点・課題

- `views/SkillCenterView/hooks/*` と `src/renderer/hooks/*` を取り違えると、想定対象外の計測になる。
- 実行コマンドが都度手作業で組み立てられ、対象テストセットが `25 tests` と `30 tests` で揺れやすい。
- 計測前に include パス実在確認をしていないため、原因切り分けに時間がかかる。

### 1.3 放置した場合の影響

- hotfix の品質判定が再現不能になり、レビュー差し戻しが増える。
- Phase 12 成果物（implementation-guide / coverage-report / spec同期）の数値ドリフトが再発する。
- 同種タスクで同じ手戻り（コマンド修正→再計測→再同期）が繰り返される。

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillCenter hotfix の対象 coverage 計測を「実在パス検証 + 対象テスト固定 + 記録値固定」で標準化し、実測値ドリフトを防ぐ。

### 2.2 最終ゴール

- 対象3ファイル（`index.tsx` / `useSkillCenter.ts` / `useFeaturedSkills.ts`）を確実に計測できる。
- hotfix用回帰セットを `3 files / 30 tests` に固定化できる。
- Phase 12 仕様同期（`task-workflow` / `lessons` / outputs）が1回で一致する。

### 2.3 スコープ

#### 含むもの

- hotfix対象 coverage コマンドの標準化（include path固定）
- 実行前のパス実在チェック手順追加（`rg --files`）
- Phase 12 成果物への記録フォーマット統一

#### 含まないもの

- SkillCenter 機能実装そのものの追加修正
- 他機能（SkillAnalysisView/SkillCreateWizard）への横展開実装

### 2.4 成果物

- hotfix coverage 実行手順（標準コマンド）
- Phase 12 記録テンプレート追補（対象ファイル・対象テストの固定項目）
- 再発防止ルールを反映した仕様更新（task-workflow / lessons-learned）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `pnpm --filter @repo/desktop exec vitest` が実行可能であること
- `apps/desktop/src/renderer/views/SkillCenterView/` 配下に対象ファイルが存在すること
- Phase 12 成果物の更新権限があること

### 3.2 依存タスク

- `03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001`（完了済み）

### 3.3 必要な知識

- Vitest coverage 設定（`--coverage.include`）
- Phase 12 仕様同期ルール（実測値を仕様書へ同一ターン反映）
- `audit-unassigned-tasks` の current/baseline 判定

### 3.4 推奨アプローチ

1. 計測前に `rg --files` で include パス実在を確認する。
2. hotfix 対象テストを3ファイルに固定して coverage を取得する。
3. 取得値を outputs と `aiworkflow-requirements` に同一ターン反映する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                            | 発見経緯                                                    | 解決策                                                                     | 教訓                                         |
| ------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------- |
| coverage include path の誤指定  | hotfix再計測で `hooks` 配下パスを取り違え、閾値エラーが再発 | `rg --files` による実在確認を計測前必須にする                              | 計測前検証を省略すると数値の信頼性が失われる |
| 対象テストセットの揺れ（25/30） | `SkillCenterView.test.tsx` を含む/含まないが実行ごとに変化  | hotfix対象は `delete-confirm/useSkillCenter/useFeaturedSkills` の3本へ固定 | 「どのテストで測った値か」を仕様書に明記する |
| 仕様同期の手戻り                | outputs と system spec の反映順が分かれ、ドリフト発生       | `verify`→`validate`→`links`→`audit` 後に一括同期する                       | 数値更新は証跡確定後に一括反映する           |

---

## 4. 実行手順

### Phase構成

- Phase A: 対象固定
- Phase B: 計測実行
- Phase C: 仕様同期

### Phase A: 対象固定

#### 目的

計測対象ファイルとテストセットを機械的に固定する。

#### 手順

1. `rg --files apps/desktop/src/renderer/views/SkillCenterView | rg "index.tsx|hooks/useSkillCenter.ts|hooks/useFeaturedSkills.ts"` を実行
2. 対象テスト3ファイルを確認
3. 記録テンプレートへ対象一覧を転記

#### 成果物

- 対象ファイル一覧
- 対象テスト一覧

#### 完了条件

- 対象3ファイル/3テストが固定されている

### Phase B: 計測実行

#### 目的

固定対象で coverage を取得し、実測値を確定する。

#### 手順

1. `pnpm --filter @repo/desktop exec vitest run` で対象3テストを実行
2. 同コマンドで `--coverage.include` に対象3ファイルを指定して再実行
3. `Stmts/Lines`, `Branch`, `Functions` を抽出

#### 成果物

- テスト結果（3 files / 30 tests）
- coverage 実測値

#### 完了条件

- 全指標が閾値（80%以上）を満たし、実測値が採番付きで記録されている

### Phase C: 仕様同期

#### 目的

実測値を system spec と Phase 12 成果物へ反映し、ドリフトを防止する。

#### 手順

1. `task-workflow.md` と `lessons-learned.md` の関連セクションに反映
2. `outputs/phase-6/7/12` の該当値を更新
3. `verify-unassigned-links` と `audit --diff-from HEAD` を実行

#### 成果物

- 同期済み仕様書
- 同期済み Phase 12 成果物

#### 完了条件

- `verify-unassigned-links` が PASS
- `audit --diff-from HEAD` で `currentViolations=0`

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] hotfix coverage 実行手順が3ファイル固定で定義されている
- [ ] include path 実在確認手順が明記されている

### 品質要件

- [ ] `3 files / 30 tests` の回帰セットで再計測できる
- [ ] coverage 3指標が80%以上を満たす

### ドキュメント要件

- [ ] `task-workflow.md` に未タスク登録がある
- [ ] `lessons-learned.md` に苦戦箇所と解決策が同期されている
- [ ] outputs の数値と system spec の数値が一致している

---

## 6. 検証方法

### テストケース

- TC-01: include path 実在確認が PASS する
- TC-02: 対象3テストで `3 files / 30 tests` になる
- TC-03: coverage 3指標が80%以上になる
- TC-04: 反映後に `verify-unassigned-links` が PASS する

### 検証手順

1. `rg --files` で対象ファイルの存在確認
2. `pnpm --filter @repo/desktop exec vitest run ... --coverage ...` 実行
3. `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`
4. `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD`

---

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                                                       |
| ----------------------- | ------ | -------- | ---------------------------------------------------------- |
| テスト対象の固定漏れ    | 中     | 中       | 実行コマンドをコピーペースト可能な定型として保存する       |
| include path の再誤指定 | 中     | 中       | 計測前 `rg --files` を完了条件に組み込む                   |
| 仕様書反映漏れ          | 中     | 低       | `verify/validate/links/audit` 後に同一ターンで一括更新する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `docs/30-workflows/completed-tasks/03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001/outputs/phase-7/coverage-report.md`

### 参考資料

- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/SkillCenterView.delete-confirm.test.tsx`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useSkillCenter.test.ts`
- `apps/desktop/src/renderer/views/SkillCenterView/__tests__/useFeaturedSkills.test.ts`

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Coverage for functions/branches does not meet threshold
(原因: hotfix対象coverage include pathの誤指定)
```

### 補足事項

- 本タスクは「coverage計測運用ガード」の追加が目的であり、機能追加はスコープ外。
- 実装時は parent task の苦戦箇所（Section 3.5）を必ずチェックすること。
