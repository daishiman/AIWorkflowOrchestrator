# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                 |
| ---------- | ---------------------------------------------------- |
| Phase      | 9                                                    |
| 前提 Phase | 8（リファクタリング）                                |
| 後続 Phase | 10（最終レビューゲート）                             |
| タスクID   | UT-SKILL-WIZARD-W3-USAGE-TRACKING-001                |
| タスク分類 | NON_VISUAL（Renderer 内部の計装のみ / 視覚差分なし） |
| 担当 AC    | AC-1〜AC-9 すべての最終確認                          |

---

## 目的

Phase 5〜8 の成果物全体に対して typecheck / lint / test の 3 ツールをすべて通過させ、
既存の `trackEvent` 呼び出し箇所への影響がないことを確認する。
本 Phase を通過した状態が Phase 10（最終レビューゲート）の入力となる。

本 Phase は NON_VISUAL タスクであるため、スクリーンショットは取得しない。
typecheck / lint / test の実行ログを主証跡とする。

---

## 実行タスク

### タスク 1: TypeScript 型チェック

#### 手順 1-1: `@repo/desktop` 全体の型チェックを実行する

```bash
pnpm --filter @repo/desktop typecheck
```

エラー件数が 0 であることを確認する。

#### 手順 1-2: `skill_wizard_*` 型定義に型エラーがないことを確認する

手順 1-1 のエラーが 0 件であれば本手順は完了とする。

エラーが出た場合は、エラーメッセージに含まれるファイル名・行番号・TypeScript エラーコードを
以下の観点で分類して対処する：

| エラーコード | 発生原因の候補                                                   | 対処方法                                                                                        |
| ------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| TS2345       | `trackEvent` の引数型不一致                                      | 呼び出し箇所のイベント名またはペイロードの型を修正する                                          |
| TS2339       | `SkillWizardEvents` に存在しないキーを参照                       | `trackEvent.ts` にキーが追加されているか確認する                                                |
| TS2322       | `action` の値が型定義の union に含まれない                       | `CompleteStep.tsx` の `action` 値が `'edit' \| 'execute' \| 'close'` と一致しているか確認する   |
| TS7006       | `source` prop の型が `SkillCreateWizardProps` に追加されていない | `SkillCreateWizardProps` に `source?: 'lifecycle_panel' \| 'direct'` が追加されているか確認する |

エラー修正後、手順 1-1 を再実行する。

#### 手順 1-3: `@repo/shared` の型チェックも実施する（影響確認）

`trackEvent.ts` は `@repo/shared/types/skillCreator` から `SkillCategory` を
`WizardSkillCategory` としてインポートしている。共有型の変更が波及していないことを確認する。

```bash
pnpm --filter @repo/shared typecheck
```

エラーが出た場合は、`@repo/shared` の型定義ファイルを確認する。
本タスクで `@repo/shared` の型定義を変更していない場合、エラーは本タスクの影響でないため
別タスクとして対処する。

---

### タスク 2: ESLint チェック

#### 手順 2-1: `@repo/desktop` 全体の lint を実行する

```bash
pnpm --filter @repo/desktop lint
```

エラー件数が 0 であることを確認する（warning は許容するが、error は 0 件とする）。

#### 手順 2-2: 計装コードに lint エラーがないことを確認する

手順 2-1 のエラーが 0 件であれば本手順は完了とする。

エラーが出た場合は、エラーメッセージに含まれるファイル名・行番号・ルール名を
以下の観点で対処する：

| lint ルール                                   | 発生原因の候補                                       | 対処方法                                                                                                                         |
| --------------------------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `react-hooks/exhaustive-deps`                 | `useEffect` の依存配列に `source` が含まれていない   | `source` は意図的に依存配列から除外しているため `// eslint-disable-next-line` コメントを追加する（理由を必ずコメントに記載する） |
| `@typescript-eslint/no-unsafe-assignment`     | `trackEvent` の呼び出しで型推論が `any` になっている | `trackEvent.ts` の型定義が正しく機能しているか確認する                                                                           |
| `no-console`                                  | `trackEvent.ts` 内の `console.info` 呼び出し         | 既存コードに `// eslint-disable-next-line no-console` が付いているか確認する。付いていなければ追加する                           |
| `@typescript-eslint/no-unnecessary-condition` | `source ?? 'direct'` の null チェック                | `source` が `undefined` になりうる prop 型であれば false positive のため `// eslint-disable` で対処する                          |

lint 自動修正を試みる場合：

```bash
pnpm --filter @repo/desktop lint --fix
```

自動修正後、手順 2-1 を再実行してエラーが 0 件になったことを確認する。

#### 手順 2-3: lint 修正後の型チェック再確認

lint の `--fix` による自動修正がファイルを変更した場合、型チェックが通ることを再確認する：

```bash
pnpm --filter @repo/desktop typecheck
```

エラー 0 件であることを確認する。

---

### タスク 3: テスト全通過確認

#### 手順 3-1: `@repo/desktop` の全テストを実行する

```bash
pnpm --filter @repo/desktop test:run
```

失敗したテストケースが 0 件であることを確認する。

失敗があった場合は、失敗したテストのファイル名・テストケース名・エラーメッセージを
記録し、以下の観点で対処する：

- Phase 8 のリファクタリング（STEPS 参照への置き換え）によって
  テストの期待値（`stepName: "スキル情報入力"` 等の文字列リテラル）が
  `STEPS[0]` の値と一致しているか確認する。
- `skill_wizard_next_action` の `action` 値変更（`"open_editor"` → `"edit"`、
  `"create_another"` → `"close"`）に対応してテストの期待値が更新されているか確認する。
- `SkillCreateWizardProps` に追加した `source` prop がテスト内でのレンダー時に
  問題を起こしていないか確認する（任意 prop のため `source` なしのレンダーも正常動作するはず）。

修正後、手順 3-1 を再実行する。

#### 手順 3-2: AC-7〜AC-9 のカバレッジ基準を満たすことを確認する

```bash
pnpm --filter @repo/desktop test:coverage -- \
  --coverage.include="src/renderer/utils/trackEvent.ts" \
  --coverage.include="src/renderer/components/skill/SkillCreateWizard.tsx" \
  --coverage.include="src/renderer/components/skill/wizard/CompleteStep.tsx"
```

以下の数値をすべて確認する：

| ファイル                | Stmts  | Branch | Funcs  | Lines  | 目標     |
| ----------------------- | ------ | ------ | ------ | ------ | -------- |
| `trackEvent.ts`         | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | 100%     |
| `SkillCreateWizard.tsx` | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | 90% 以上 |
| `CompleteStep.tsx`      | \_\_\_ | \_\_\_ | \_\_\_ | \_\_\_ | 90% 以上 |

（実行後、空欄に実測値を記入すること）

いずれかが目標を下回っている場合は Phase 7 のカバレッジ確認フローに従って対処する。

#### 手順 3-3: 既存テストに回帰がないことを確認する

手順 3-1 の実行結果で `trackEvent`・`SkillCreateWizard`・`CompleteStep` 以外の
テストファイルに失敗がないことを確認する。

特に以下のファイルに注意する：

- `SkillCreateWizard.test.tsx` の既存テストケース（Phase 4 以前から存在するもの）
- `skill_wizard_next_action` の呼び出し箇所を含むその他のテストファイル

```bash
# skill_wizard_next_action の既存呼び出し箇所を特定する
grep -rn "skill_wizard_next_action" \
  apps/desktop/src/renderer/ \
  --include="*.ts" --include="*.tsx"
```

出力されたファイルのうち、`trackEvent.ts` / `SkillCreateWizard.tsx` /
`CompleteStep.tsx` 以外に呼び出し箇所がある場合は、
その箇所の `action` 値が新しい型定義（`'edit' | 'execute' | 'close'`）と
一致しているかを確認する。

---

### タスク 4: 既存 `trackEvent` 呼び出し箇所への影響確認

#### 手順 4-1: `trackEvent` の既存呼び出し箇所を特定する

```bash
grep -rn "trackEvent(" \
  apps/desktop/src/renderer/ \
  --include="*.ts" --include="*.tsx"
```

出力されたすべての呼び出し箇所を確認する。本タスクで変更したファイル以外に
`trackEvent` を呼び出しているファイルが存在する場合は、それらのファイルも
型チェックが通ることを確認する（手順 1-1 の typecheck で一括確認済みのはず）。

#### 手順 4-2: `skill_wizard_next_action` の型変更による影響を確認する

`skill_wizard_next_action` の `action` 型が `"execute" | "open_editor" | "create_another"`
から `'edit' | 'execute' | 'close'` に変更されている。この変更によって
`SkillCreateWizard.tsx` 内の `handleExecuteNow` / `handleOpenInEditor` /
`handleCreateAnother` の呼び出しが正しく更新されているかを確認する。

```bash
grep -A 2 "trackEvent.*skill_wizard_next_action" \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

出力に以下の 3 行がすべて含まれていることを確認する：

- `action: "execute"` または `action: 'execute'`
- `action: "edit"` または `action: 'edit'`
- `action: "close"` または `action: 'close'`

`"open_editor"` や `"create_another"` が残っている場合は型エラーになるはずだが、
念のため目視でも確認する。

---

## 品質ゲートチェックリスト

以下のすべての項目にチェックが入った状態で Phase 10 へ進むこと。
1 項目でも未達の場合は対応する手順に戻って修正する。

### TypeScript 型チェック（AC-1〜AC-4 の型安全性確認）

- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件で PASS する
- [ ] `skill_wizard_open` の型が `{ source: 'lifecycle_panel' | 'direct' }` で定義されている（AC-1）
- [ ] `skill_wizard_step_complete` の型が `{ step: number; stepName: string }` で定義されている（AC-2）
- [ ] `skill_wizard_next_action` の型が `{ action: 'edit' | 'execute' | 'close' }` で定義されている（AC-3）
- [ ] `skill_wizard_abandon` の型が `{ lastStep: number }` で定義されている（AC-4）

### ESLint チェック

- [ ] `pnpm --filter @repo/desktop lint` がエラー 0 件で PASS する
- [ ] `react-hooks/exhaustive-deps` の意図的な除外箇所にコメントが付いている

### テスト・カバレッジ（AC-5〜AC-9 の動作確認）

- [ ] `pnpm --filter @repo/desktop test:run` が全テスト PASS する（0 failures）
- [ ] `SkillCreateWizard.tsx` の 5 計装ポイントすべてでテストが PASS している（AC-5）
- [ ] `CompleteStep.tsx` の `skill_wizard_next_action` テストが PASS している（AC-6）
- [ ] `trackEvent.ts` のカバレッジが 100%（AC-7）
- [ ] `SkillCreateWizard.tsx` のカバレッジが 90% 以上（AC-8）
- [ ] `CompleteStep.tsx` のカバレッジが 90% 以上（AC-9）
- [ ] 既存テストに回帰がない（Phase 4 以前から存在するテストケースがすべて PASS）

### 既存呼び出し箇所への影響確認

- [ ] `trackEvent` の既存呼び出し箇所（`SkillCreateWizard.tsx` 以外）に型エラーがない
- [ ] `skill_wizard_next_action` の `action` 値が新しい型定義と一致している

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS する（エラー 0 件）
- [ ] `pnpm --filter @repo/desktop lint` が PASS する（エラー 0 件）
- [ ] `pnpm --filter @repo/desktop test:run` が PASS する（failures 0 件）
- [ ] カバレッジ目標をすべて達成している（trackEvent.ts 100% / SkillCreateWizard.tsx 90%+ / CompleteStep.tsx 90%+）
- [ ] 品質ゲートチェックリストの全項目にチェックが入っている
