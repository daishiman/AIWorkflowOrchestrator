# Phase 11: 手動テスト（NON_VISUAL）

## メタ情報

| 項目       | 内容                                                       |
| ---------- | ---------------------------------------------------------- |
| Phase      | 11                                                         |
| タスクID   | UT-SKILL-WIZARD-W2-SKILL-CREATE-WIZARD-001                 |
| 機能名     | SkillCreateWizard.tsx 実装（オーケストレーション・Wave 2） |
| 前提Phase  | Phase 10                                                   |
| 後続Phase  | Phase 12                                                   |
| 作成日     | 2026-04-08                                                 |
| ステータス | 未実施                                                     |

---

## 目的

NON_VISUAL タスクの手動検証を実施し、証跡を記録する。

## 背景

本タスクは NON_VISUAL タスク（UI スクリーンショット不要）であるため、REPL / CLI の出力ログを主証跡として手動テストを実施する。`inferSmartDefaults` の呼び出し結果と計装ポイントのログ出力を確認する。

---

## Phase 11 手動テスト方針（NON_VISUAL）

- `manual-test-checklist.md` を必ず作成する
- `discovered-issues.md` を必ず作成する
- `screenshot-plan.json` は生成しない（NON_VISUAL のため）
- primary evidence は `vitest` / `typecheck` / `lint` / REPL 確認記録
- `manual-test-result.md` には `TC-ID ↔ evidence`、NON_VISUAL である理由、代替 evidence を明記する
- placeholder-only の証跡は PASS 扱いにしない

---

## 実行タスク

### タスク1: REPL / CLI での `inferSmartDefaults` 動作確認

**目的**: `inferSmartDefaults` の呼び出し結果を REPL で確認する

**実行手順**:

1. 以下のコマンドで動作確認を行う：
   ```bash
   cd packages/shared
   node -e "
   const { inferSmartDefaults } = require('./dist/services/skillCreator/index.js');
   const result = inferSmartDefaults({ purpose: 'Slackに毎日通知する', category: null });
   console.log(JSON.stringify(result, null, 2));
   "
   ```
2. 出力結果を証跡として記録する
3. `tool: 'slack'` と `timing: 'scheduled'` が返ることを確認する

**期待される成果物**:

- REPL 実行ログ（`outputs/phase-11/manual-test-result.md` 内）

---

### タスク2: `pnpm vitest run` の出力を証跡として記録

**目的**: テスト通過・カバレッジを証跡として記録する

**実行手順**:

1. 以下のコマンドを実行する：
   ```bash
   cd apps/desktop && pnpm vitest run src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
   ```
2. テスト通過の出力を証跡として `outputs/phase-11/manual-test-result.md` に記録する
3. TC-01〜TC-15 の全通過を確認する

**期待される成果物**:

- テスト通過証跡

---

### タスク3: `console.log` 計装ポイント出力の確認

**目的**: 5 つの計装ポイントのログ出力を確認する

**実行手順**:

1. Node.js 環境またはブラウザコンソールで `SkillCreateWizard` の動作を確認する
2. 以下の 5 つのログが出力されることを確認する：
   - `wizard:start`
   - `wizard:step0:complete`
   - `wizard:smartDefaults:result`
   - `wizard:step1:complete`
   - `wizard:complete`
3. ログ出力の証跡を記録する

**期待される成果物**:

- 計装ポイントログ証跡

---

### タスク4: 手動テスト成果物の作成

**目的**: Phase 11 の必須成果物を作成する

**実行手順**:

1. `outputs/phase-11/manual-test-checklist.md` を作成する（TC-ID と確認項目）
2. `outputs/phase-11/manual-test-result.md` を作成する（TC-ID ↔ evidence 対応）
3. `outputs/phase-11/discovered-issues.md` を作成する（発見した問題の記録）

**期待される成果物**:

- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/discovered-issues.md`

---

## 参照資料

| 参照資料              | パス                                                 | 内容          |
| --------------------- | ---------------------------------------------------- | ------------- |
| Phase 4 テストケース  | `outputs/phase-4/test-cases.md`                      | TC-01〜TC-15  |
| Phase 10 最終レビュー | `outputs/phase-10/final-review-result.md`            | AC 達成確認   |
| 推論サービス          | `packages/shared/src/services/skillCreator/index.ts` | REPL 確認対象 |

---

## 成果物

| 成果物                   | パス                                        | 内容                                   |
| ------------------------ | ------------------------------------------- | -------------------------------------- |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md` | TC-ID 確認リスト                       |
| 手動テスト結果           | `outputs/phase-11/manual-test-result.md`    | TC-ID ↔ evidence 対応・NON_VISUAL 理由 |
| 発見問題記録             | `outputs/phase-11/discovered-issues.md`     | 手動テストで発見した問題               |

---

## 完了条件

- [ ] REPL で `inferSmartDefaults` の動作確認が完了していること
- [ ] `pnpm vitest run` の出力が証跡として記録されていること
- [ ] 計装ポイント 5 つのログ出力が確認されていること
- [ ] `manual-test-checklist.md` が作成されていること
- [ ] `manual-test-result.md` に TC-ID ↔ evidence が明記されていること
- [ ] `discovered-issues.md` が作成されていること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

---

## Phase末端アクション【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクを 100% 完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート・PASS）が完了していること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次の Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/W2-seq-03a-skill-create-wizard-2/phase-12-documentation.md`
