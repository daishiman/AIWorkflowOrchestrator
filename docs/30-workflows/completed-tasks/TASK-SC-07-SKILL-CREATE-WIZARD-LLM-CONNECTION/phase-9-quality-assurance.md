# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                          |
| ---------- | --------------------------------------------- |
| Phase      | 9                                             |
| Phase名    | 品質保証                                      |
| 前提Phase  | Phase 8                                       |
| 後続Phase  | Phase 10                                      |
| ステータス | 未実施                                        |
| 作成日     | 2026-03-24                                    |
| 機能名     | TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION |

---

## 目的

実装・リファクタリング完了後のコードに対し、型チェック・Lint・テストを一括実行し、CI 相当の品質ゲートを満たしていることを確認する。セキュリティ観点（XSS・入力バリデーション）の確認も本 Phase で実施する。

## 背景

Phase 8 のリファクタリングで共通化・整理を行ったコードに対して、最終的な品質確認を行う。CI で検出される問題を事前に解消しておくことで、Phase 13 の PR 作成後の CI 失敗を防ぐ。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: TypeScript 型チェック

**目的**: 型エラーがないことを確認する

**実行手順**:

1. 型チェックを実行する:
   ```bash
   pnpm --filter @repo/desktop typecheck
   ```
2. エラーが出た場合は修正し、エラーが消えるまで繰り返す
3. エラーが出ない場合は成功を記録する
4. 結果（エラー件数・修正内容）を `outputs/phase-9/typecheck-result.md` に記録する

**期待される成果物**:

- `outputs/phase-9/typecheck-result.md`（型チェック結果）

**合格基準**: 型エラー 0 件

---

### タスク2: ESLint チェック

**目的**: Lint エラー・警告がないことを確認する

**実行手順**:

1. Lint を実行する:
   ```bash
   pnpm --filter @repo/desktop lint
   ```
2. エラーが出た場合は修正し、エラーが消えるまで繰り返す
3. 警告（warning）についても確認し、抑制が妥当かどうか判断する
4. 結果（エラー件数・警告件数・修正内容）を `outputs/phase-9/lint-result.md` に記録する

**期待される成果物**:

- `outputs/phase-9/lint-result.md`（Lint 実行結果）

**合格基準**: Lint エラー 0 件

---

### タスク3: 全テスト実行

**目的**: 全テストが成功していることを確認する

**実行手順**:

1. テストを実行する:
   ```bash
   pnpm --filter @repo/desktop vitest run
   ```
2. 失敗しているテストがある場合は原因を特定し修正する
3. 全テストが成功するまで繰り返す
4. テスト実行結果（件数・成功/失敗）を `outputs/phase-9/test-result.md` に記録する

**期待される成果物**:

- `outputs/phase-9/test-result.md`（テスト実行結果）

**合格基準**: 全テスト成功（失敗 0 件）

---

### タスク4: セキュリティチェック

**目的**: LLM 生成フロー追加に伴うセキュリティリスクを確認する

**実行手順**:

1. 以下の観点で実装コードを目視レビューする:

   **XSS チェック**:
   - `planSkill` の応答データ（`guidance`, `type`, `estimatedSteps`）を JSX でレンダリングする箇所を確認する
   - `dangerouslySetInnerHTML` が使用されていないことを確認する
   - LLM 生成テキストがエスケープなしで innerHTML に渡されていないことを確認する

   **入力バリデーションチェック**:
   - DescribeStep の prompt 入力値が `planSkill` に渡る前にバリデーションされているか確認する
   - 空文字・異常に長い文字列に対する処理が実装されているか確認する
   - `planId` が `executePlan` に渡る前に存在チェックされているか確認する

   **IPC セキュリティチェック**:
   - `window.electronAPI.skillCreator` へのアクセスに不正な引数が渡されない設計になっているか確認する
   - エラーメッセージに機密情報が含まれていないか確認する（API キー等）
   - Preload API のシグネチャが `api-ipc-agent-core.md` の契約と一致していることを確認する

2. 発見した問題は修正する
3. 結果を `outputs/phase-9/security-check.md` に記録する

**期待される成果物**:

- `outputs/phase-9/security-check.md`（セキュリティチェック結果）

**合格基準**: 重大なセキュリティリスクが存在しないこと

---

### タスク5: 品質チェック一括サマリー作成

**目的**: タスク1〜4 の結果を統合し、Phase 10 に引き渡す

**実行手順**:

1. タスク1〜4 の結果を以下の表形式でまとめる:

   | チェック項目          | 結果        | 件数/備考    |
   | --------------------- | ----------- | ------------ |
   | TypeScript 型チェック | PASS / FAIL | エラー N 件  |
   | ESLint                | PASS / FAIL | エラー N 件  |
   | 全テスト              | PASS / FAIL | 失敗 N 件    |
   | XSS チェック          | PASS / FAIL | 問題点の記述 |
   | 入力バリデーション    | PASS / FAIL | 問題点の記述 |
   | IPC セキュリティ      | PASS / FAIL | 問題点の記述 |

2. 全項目が PASS の場合は Phase 10 に進む
3. FAIL がある場合は修正して全 PASS になるまで繰り返す
4. 結果を `outputs/phase-9/qa-summary.md` に記録する

**期待される成果物**:

- `outputs/phase-9/qa-summary.md`（品質保証サマリー）

---

## 参照資料

| 参照資料          | パス                                                                 | 内容                                     |
| ----------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| SkillCreateWizard | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | 品質チェック対象（メインコンポーネント） |
| GenerateStep      | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx` | 品質チェック対象（LLM 結果表示 UI）      |
| DescribeStep      | `apps/desktop/src/renderer/components/skill/wizard/DescribeStep.tsx` | 品質チェック対象（入力 UI）              |
| Phase 8 成果物    | `outputs/phase-8/`                                                   | リファクタリング完了後のコード状態       |
| ESLint 設定       | `.eslintrc.*` / `eslint.config.*`                                    | Lint ルール確認用                        |
| TypeScript 設定   | `apps/desktop/tsconfig.json`                                         | 型チェック設定確認用                     |

### システム仕様（aiworkflow-requirements）

| 参照資料              | パス                                                                              | 内容                             |
| --------------------- | --------------------------------------------------------------------------------- | -------------------------------- |
| UI コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/arch-ui-components-core.md`    | コンポーネント設計との整合性確認 |
| 状態管理仕様          | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` | Zustand store 設計との整合性確認 |
| IPC Agent API         | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent-core.md`         | planSkill/executePlan 契約確認   |

---

## 成果物

| 成果物                   | パス                                  | 内容                                              |
| ------------------------ | ------------------------------------- | ------------------------------------------------- |
| 型チェック結果           | `outputs/phase-9/typecheck-result.md` | TypeScript 型エラーの有無と修正内容               |
| Lint 結果                | `outputs/phase-9/lint-result.md`      | ESLint エラー・警告の有無と修正内容               |
| テスト実行結果           | `outputs/phase-9/test-result.md`      | 全テスト成否と件数                                |
| セキュリティチェック結果 | `outputs/phase-9/security-check.md`   | XSS・入力バリデーション・IPC セキュリティ確認結果 |
| 品質保証サマリー         | `outputs/phase-9/qa-summary.md`       | 全チェック項目の統合結果                          |

---

## 統合テスト連携（Phase 9）

- `vitest run` の実行結果に SkillCreateWizard / GenerateStep / DescribeStep の LLM フロー関連テストが含まれていることを確認する
- planSkill mock / executePlan mock が正しく機能していることをテスト結果から確認する
- エラーパス（planSkill 失敗・executePlan 失敗）のテストが含まれていることを確認する

---

## 完了条件

- [ ] TypeScript 型チェックがエラー 0 件で通過している
- [ ] ESLint がエラー 0 件で通過している
- [ ] 全テストが成功している（失敗 0 件）
- [ ] XSS リスクが存在しないことが確認されている
- [ ] 入力バリデーションが適切に実装されていることが確認されている
- [ ] IPC セキュリティに問題がないことが確認されている
- [ ] `outputs/phase-9/qa-summary.md` が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8（リファクタリング）が完了し、全テストが成功していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION/phase-10-final-review.md`
