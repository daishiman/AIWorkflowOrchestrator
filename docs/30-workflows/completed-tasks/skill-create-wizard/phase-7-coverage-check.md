# Phase 7: カバレッジ確認 - タスク仕様書

## メタ情報

| 項目       | 内容                |
| ---------- | ------------------- |
| Phase      | 7                   |
| Phase名    | カバレッジ確認      |
| 前提Phase  | Phase 6             |
| 後続Phase  | Phase 8             |
| ステータス | 未実施              |
| 作成日     | 2026-03-03          |
| 機能名     | skill-create-wizard |
| タスクID   | TASK-10A-C          |

---

## 目的

Phase 6 のテスト拡充結果を検証し、カバレッジ基準を満たしていることを確認する。リファクタリング（Phase 8）に進む前の品質ゲートとして機能する。未達の場合は Phase 6 へ戻りテストを追加する。

## 背景

テスト拡充が完了した。リファクタリングに進む前に、カバレッジ目標が達成されていることを確認するゲートフェーズ。カバレッジ数値だけでなく、テストの品質（独立性・可読性・境界値網羅）も検証する。

---

## テストカバレッジ基準

### ユニットテスト

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### コンポーネント別品質基準

| コンポーネント    | 必須テストカテゴリ                     |
| ----------------- | -------------------------------------- |
| SkillCreateWizard | 正常遷移 / IPC呼び出し / エラー表示    |
| DescribeStep      | バリデーション / 境界値 / コールバック |
| ConfigureStep     | 全チェックボックス / ボタン動作        |
| GenerateStep      | ローディング / 全エラーパターン        |
| CompleteStep      | パス表示 / 閉じる操作                  |
| StepIndicator     | 全ステップ状態 / ARIA属性              |

---

## 実行タスク

- カバレッジ判定タスク: 最終計測と品質ゲート判定を実施する。

> 以下のタスクを順番に実行してください。

### タスク1: カバレッジ最終計測

**目的**: 正確なカバレッジ数値を取得する

**実行手順**:

1. カバレッジを計測する（P40: `apps/desktop` ディレクトリから実行）:

```bash
cd apps/desktop
pnpm vitest run --coverage src/renderer/components/skill/
```

2. カバレッジレポート（HTML/JSON）を確認する

3. コンポーネント別のカバレッジ数値を記録する:

```markdown
## カバレッジ計測結果

### 全体カバレッジ

| 指標              | 計測値 | 最低基準 |
| ----------------- | ------ | -------- |
| Line Coverage     | XX%    | 80%      |
| Branch Coverage   | XX%    | 60%      |
| Function Coverage | XX%    | 80%      |

### コンポーネント別カバレッジ

| コンポーネント    | Line% | Branch% | Function% |
| ----------------- | ----- | ------- | --------- |
| SkillCreateWizard | XX%   | XX%     | XX%       |
| StepIndicator     | XX%   | XX%     | XX%       |
| DescribeStep      | XX%   | XX%     | XX%       |
| ConfigureStep     | XX%   | XX%     | XX%       |
| GenerateStep      | XX%   | XX%     | XX%       |
| CompleteStep      | XX%   | XX%     | XX%       |
```

**期待される成果物**:

- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/coverage-report.md`（計測結果）

---

### タスク2: ユニットテストカバレッジ判定

**目的**: ユニットテストカバレッジが基準を満たしているか判定する

**実行手順**:

1. 以下の基準で判定する:

| 指標              | 計測値 | 最低基準 | 判定      |
| ----------------- | ------ | -------- | --------- |
| Line Coverage     | XX%    | 80%+     | PASS/FAIL |
| Branch Coverage   | XX%    | 60%+     | PASS/FAIL |
| Function Coverage | XX%    | 80%+     | PASS/FAIL |

2. 判定結果:
   - **全項目PASS**: タスク3へ進む
   - **いずれかFAIL**: Phase 6 へ戻り、未達指標のテストを追加する

3. FAIL の場合は以下を記録する:
   - 未達のファイル名と行番号
   - 追加すべきテストケースの説明
   - Phase 6 の対応タスク番号

**期待される成果物**:

- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/coverage-report.md`（判定結果追記）

---

### タスク3: テスト品質確認

**目的**: カバレッジ数値だけでなくテストの品質を検証する

**実行手順**:

1. 以下の品質観点を確認する:

| 観点                   | チェック項目                                           | OK/NG |
| ---------------------- | ------------------------------------------------------ | ----- |
| テスト独立性           | 各テストが `beforeEach` でリセットされているか（P9）   | -     |
| happy-dom 制約         | `userEvent` が混入していないか（P39）                  | -     |
| テスト実行ディレクトリ | `apps/desktop` から実行しているか（P40）               | -     |
| モック品質             | `vi.stubGlobal` で IPC が正しくモックされているか      | -     |
| CSS変数テスト          | Record 定数 export パターンが使われているか（P47）     | -     |
| テスト命名             | テスト名から何を検証しているかが明確か                 | -     |
| アサーション           | 適切な matcher が使用されているか（`toBeDisabled` 等） | -     |
| エラーケース           | 境界値・異常系が網羅されているか                       | -     |

2. NG の項目がある場合は修正する

3. テスト品質確認レポートを作成する:
   - `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/test-quality-check.md`

**期待される成果物**:

- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/test-quality-check.md`

---

### タスク4: 全テスト実行・確認

**目的**: テスト追加後も全テストが PASS することを確認する

**実行手順**:

1. 全テストを実行する:

```bash
cd apps/desktop
pnpm vitest run src/renderer/components/skill/
```

2. 全テストが PASS することを確認する

3. テスト実行結果を記録する:

```markdown
## テスト実行結果

### SkillCreateWizard.test.tsx

- ✓ 初期表示 > Step 1 が最初に表示される
- ✓ 初期表示 > StepIndicator に全4ステップが表示される
- ✓ ステップ遷移 > 説明入力後「次へ」クリックで Step 2 に遷移する
- ✓ ステップ遷移 > ...
  (以下省略)

### wizard/**tests**/DescribeStep.test.tsx

- ✓ 初期レンダリング > 説明入力テキストエリアが表示される
- ✓ ...

### wizard/**tests**/ConfigureStep.test.tsx

- ✓ チェックボックス表示 > generateTasks チェックボックスが表示される
- ✓ ...

### wizard/**tests**/GenerateStep.test.tsx

- ✓ ローディング状態 > isGenerating=true のときスピナーが表示される
- ✓ ...

### wizard/**tests**/CompleteStep.test.tsx

- ✓ 完了UI > 完了メッセージが表示される
- ✓ ...

### wizard/**tests**/StepIndicator.test.tsx

- ✓ ステップ表示 > 全ステップのラベルが表示される
- ✓ ...

### 総計

- テスト総数: XX
- 成功: XX
- 失敗: 0
- スキップ: 0
```

**期待される成果物**:

- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/coverage-report.md`（テスト結果追記）

---

### タスク5: 型チェックの実行

**目的**: テストファイルおよびコンポーネントに型エラーがないことを確認する

**実行手順**:

1. 型チェックを実行する:

```bash
cd apps/desktop
pnpm typecheck
```

または

```bash
pnpm --filter @repo/desktop typecheck
```

2. 型エラーが0件であることを確認する

3. エラーがある場合は修正してから次のタスクへ進む

4. 結果を coverage-report.md に記録する:

```markdown
## 型チェック結果

- 型エラー: 0件（PASS）/ XX件（FAIL）
- 修正したエラー: (あれば記載)
```

**期待される成果物**:

- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/coverage-report.md`（型チェック結果追記）

---

### タスク6: ゲート判定

**目的**: Phase 8（リファクタリング）への進行可否を判定する

**実行手順**:

1. 全チェック結果を集約する:

| チェック項目             | 結果      | 備考                |
| ------------------------ | --------- | ------------------- |
| ユニットテストカバレッジ | PASS/FAIL | Line/Branch/Fn 全て |
| テスト品質確認           | PASS/FAIL | P39/P9等の遵守      |
| 全テスト実行             | PASS/FAIL | 失敗数 0            |
| 型チェック               | PASS/FAIL | エラー数 0          |

2. 判定を行う:
   - **全項目PASS**: Phase 8 へ進行
   - **いずれかFAIL**: 対応する Phase へ戻る

| FAIL した項目  | 戻る Phase | 対応方針                     |
| -------------- | ---------- | ---------------------------- |
| カバレッジ未達 | Phase 6    | 未達箇所のテスト追加         |
| テスト品質問題 | Phase 6    | P39/P9違反のテスト修正       |
| テスト失敗     | Phase 5    | 実装またはテストの修正       |
| 型エラー       | Phase 5    | 型定義・コンポーネントの修正 |

3. ゲート判定レポートを作成する:
   - `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/coverage-report.md`（ゲート判定追記）

```markdown
## ゲート判定結果

### 判定: PASS / FAIL（いずれかを記載）

| チェック項目             | 結果 | 詳細             |
| ------------------------ | ---- | ---------------- |
| ユニットテストカバレッジ | PASS | Line:XX%, Br:XX% |
| テスト品質確認           | PASS | 全項目OK         |
| 全テスト実行             | PASS | XX/XX PASS       |
| 型チェック               | PASS | エラー0件        |

### 結論: Phase 8（リファクタリング）へ進行 / Phase X へ戻る
```

**期待される成果物**:

- `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/coverage-report.md`（完成版）

---

## 実行手順

1. カバレッジを最終計測する（P40: `apps/desktop` ディレクトリから実行）: `cd apps/desktop && pnpm vitest run --coverage src/renderer/components/skill/`
2. コンポーネント別のカバレッジ数値を記録する（Line/Branch/Function/Statement）
3. カバレッジ基準（Line 80%+, Branch 60%+, Function 80%+）との照合を行う
4. 基準未達の場合: Phase 6 へ戻り不足テストを追加する
5. 基準充足の場合: カバレッジレポート（`outputs/phase-7/coverage-report.md`）を作成する
6. テスト品質チェック（P39/P9/P40/P47 遵守確認）を行う
7. ゲート判定結果を記録する

---

## 参照資料

| 参照資料                 | パス                                                                                             | 内容                  |
| ------------------------ | ------------------------------------------------------------------------------------------------ | --------------------- |
| Phase 5 実装             | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-5-implementation.md`                | 実装対象の網羅確認    |
| Phase 6 テスト拡充       | `docs/30-workflows/completed-tasks/skill-create-wizard/phase-6-test-expansion.md`                | 拡充内容の確認        |
| Phase 6 拡充レポート     | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-6/test-expansion-report.md` | 拡充後のカバレッジ値  |
| コード品質ルール         | `.claude/rules/02-code-quality.md`                                                               | カバレッジ基準        |
| 実装パターン集           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`      | P39,P40,P9,P47 確認用 |
| 品質要件仕様             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                      | カバレッジゲート基準  |
| コンポーネントテスト仕様 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                | テスト品質判定基準    |
| IPC API 仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                             | IPC 連携の検証観点    |

---

## 統合テスト連携

**Phase 7 での必須アクション**:

- [ ] カバレッジ数値をコンポーネント別に記録
- [ ] テスト品質チェック（P39/P9/P47 遵守）を全テストファイルで実施
- [ ] 全テストが失敗0件であることを確認
- [ ] 型チェック（`pnpm typecheck`）が通ることを確認
- [ ] ゲート判定を行い、結論を明記

---

## 多角的チェック観点

- **カバレッジ計測正確性**: `apps/desktop` ディレクトリから実行しているか（P40）
- **P39 最終確認**: テストファイル全体に `userEvent` が混入していないか
- **P9 最終確認**: 全 `describe` ブロックに `beforeEach` でのリセットがあるか
- **P47 最終確認**: CSS変数スタイルのアサーションに Record 定数が使われているか
- **テスト対称性**: 正常系と異常系の比率が偏りすぎていないか
- **実装カバレッジ**: IPC ハンドラー（`skillHandlers.ts` の `skill:create`）のテストが含まれているか

---

## 成果物

| 成果物             | パス                                                                                          | 内容                   |
| ------------------ | --------------------------------------------------------------------------------------------- | ---------------------- |
| カバレッジレポート | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/coverage-report.md`    | 計測・判定・ゲート結果 |
| テスト品質チェック | `docs/30-workflows/completed-tasks/skill-create-wizard/outputs/phase-7/test-quality-check.md` | 品質確認結果           |

---

## 完了条件

- [ ] カバレッジが Line 80%+, Branch 60%+, Function 80%+ を達成している
- [ ] テスト品質確認（P39/P9/P47）が完了している
- [ ] 全テストが PASS（失敗0件）している
- [ ] 型チェック（`pnpm typecheck`）が通っている
- [ ] ゲート判定がPASSとなっている
- [ ] カバレッジレポートにゲート結論が明記されている

---

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスク（タスク1〜6）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物（カバレッジレポート + テスト品質チェック）が全て生成されていることを確認
- [ ] ゲート判定が明示されていること（「Phase 8 へ進行」または「Phase X へ戻る」）
- [ ] artifacts.json の Phase 7 ステータスを更新

---

## サブタスク管理

Phase 7 完了後に以下を確認:

- ゲート PASS: Phase 8 仕様書へ進む
- ゲート FAIL:
  1. `coverage-report.md` に FAIL 箇所を明記
  2. Phase 6 の対応タスクへ戻る
  3. テスト追加後に Phase 7 を再実行する

---

## 依存関係

- **前提**: Phase 6（テスト拡充）が完了していること
- **後続**: Phase 8（リファクタリング）へ進む（ゲートPASSの場合）
- **戻り**: カバレッジ未達・テスト品質問題の場合、Phase 6 へ戻る

---

## 次のPhase

完了後（ゲートPASSの場合）、以下のファイルを実行してください:

`docs/30-workflows/completed-tasks/skill-create-wizard/phase-8-refactoring.md`
