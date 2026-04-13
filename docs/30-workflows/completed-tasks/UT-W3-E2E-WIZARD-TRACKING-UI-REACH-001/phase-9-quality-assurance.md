# Phase 9: 品質保証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| Phase      | 9                                                        |
| Phase名    | 品質保証                                                 |
| タスクID   | UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001                   |
| 機能名     | スキルウィザード trackEvent の E2E UI 到達確認テスト追加 |
| タスク種別 | E2E テスト追加（NON_VISUAL から E2E 昇格）               |
| 前提Phase  | Phase 8                                                  |
| 後続Phase  | Phase 10                                                 |
| ステータス | 完了                                                     |
| 作成日     | 2026-04-12                                               |

---

## 目的

Phase 4〜8 で作成・リファクタリングした E2E テストコードの品質を確認し、
Phase 10（最終レビューゲート）へ進める状態にあることを検証する。

---

## 背景

E2E テスト追加タスクの品質保証として、以下を実施する：

1. `pnpm --filter @repo/desktop test:e2e` の全テストケース通過確認
2. 既存 E2E テストへの影響がないことの確認（リグレッションテスト）
3. `pnpm --filter @repo/desktop typecheck` による型チェック PASS
4. `pnpm --filter @repo/desktop lint` による Lint チェック PASS
5. `wizard-tracking-stub.ts` と `trackEvent.e2e-stub.ts` が本番コードに混入していないことの確認

---

## 実行タスク

> **Task / Step 分離ルール**: このセクションには plan のみを書く。実行結果は `outputs/phase-9/` へ記録する。

### タスク1: E2E テスト全件実行

**目的**: Phase 4〜8 で作成した E2E テストが全て PASS することを確認する

**実行手順**:

1. 以下のコマンドで全 E2E テストを実行する:

```bash
pnpm --filter @repo/desktop test:e2e
```

2. テスト結果（PASS/FAIL 件数・所要時間）を記録する
3. 特定テストファイルのみ実行して詳細結果を確認する:

```bash
pnpm --filter @repo/desktop test:e2e -- e2e/skill-wizard-tracking.spec.ts
```

4. FAIL が発生した場合は Phase 5〜8 に戻り修正する
5. 実行結果を `outputs/phase-9/quality-report.md` に記録する

**期待結果**: 全テストケース PASS（TC-03/05/06/08/09/11/12 相当の AC-1〜AC-7 が全件 PASS）

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（E2E テスト実行結果セクション）

---

### タスク2: 既存 E2E テストへの影響確認

**目的**: 新規追加した E2E テストが既存テストに悪影響を与えていないことを確認する

**実行手順**:

1. `apps/desktop/e2e/` 配下の全テストファイルを確認する:

```bash
ls apps/desktop/e2e/
```

2. `skill-wizard-tracking.spec.ts` 以外の既存テストを個別実行し、結果を記録する
3. 既存テストで FAIL が発生した場合は原因を特定し修正する
4. 確認結果を `outputs/phase-9/quality-report.md` に追記する

**期待結果**: 既存 E2E テストへの影響がゼロであること

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（リグレッション確認セクション追記）

---

### タスク3: TypeScript 型チェック

**目的**: 追加・変更したファイルで型エラーが発生していないことを確認する

**実行手順**:

1. 以下のコマンドで型チェックを実行する:

```bash
pnpm --filter @repo/desktop typecheck
```

2. 型エラーが発生した場合は修正する
3. 実行結果を `outputs/phase-9/quality-report.md` に追記する

**確認対象ファイル**:

| ファイル                                           | 確認観点                                                |
| -------------------------------------------------- | ------------------------------------------------------- |
| `apps/desktop/e2e/skill-wizard-tracking.spec.ts`   | テストコードの型整合性                                  |
| `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` | capture ヘルパーの型定義が本番型と整合していること      |
| `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`  | trackEvent E2E スタブの型定義が本番型と整合していること |
| `apps/desktop/vite.e2e.config.ts`                  | E2E alias 設定の型が正しいこと                          |

**期待結果**: `pnpm --filter @repo/desktop typecheck` が PASS を返すこと

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（型チェック結果セクション追記）

---

### タスク4: Lint チェック

**目的**: 追加・変更したファイルで Lint エラーが発生していないことを確認する

**実行手順**:

1. 以下のコマンドで Lint チェックを実行する:

```bash
pnpm --filter @repo/desktop lint
```

2. Lint エラーが発生した場合は修正する
3. 実行結果を `outputs/phase-9/quality-report.md` に追記する

**期待結果**: `pnpm --filter @repo/desktop lint` が PASS を返すこと

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（Lint チェック結果セクション追記）

---

### タスク5: スタブの本番コード混入確認

**目的**: `wizard-tracking-stub.ts` のスタブコードが本番コードに混入していないことを確認する

**実行手順**:

1. 本番コード（`apps/desktop/src/` 配下）でスタブのシンボルがインポートされていないことを確認する:

```bash
grep -r "wizard-tracking-stub\|trackEvent.e2e-stub" apps/desktop/src/
grep -r "wizard-tracking-stub\|trackEvent.e2e-stub" packages/
```

2. 出力が空（0件）であることを確認する
3. スタブが `e2e/` ディレクトリ内にのみ存在することを確認する:

```bash
grep -r "wizard-tracking-stub\|trackEvent.e2e-stub" apps/desktop/
```

4. 確認結果（grep 証跡）を `outputs/phase-9/quality-report.md` に追記する

**期待結果**: 本番コードへの混入が 0 件であること

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（スタブ混入確認セクション追記）

---

### タスク6: Phase 1 受け入れ基準（AC-1〜AC-9）の確認

**目的**: 品質保証フェーズの総仕上げとして、AC-1〜AC-9 が全て充足されていることを確認する

**実行手順**:

1. `outputs/phase-1/acceptance-criteria.md` を参照し、AC-1〜AC-9 を確認する
2. 変更後のファイルが各 AC を充足していることを確認する
3. 充足状況を `outputs/phase-9/quality-report.md` の AC 確認テーブルに記録する

**AC 確認テーブル（記録フォーマット）**:

| AC番号 | 受け入れ基準                                                                                       | 充足状況 | 確認方法            |
| ------ | -------------------------------------------------------------------------------------------------- | -------- | ------------------- |
| AC-1   | InfoStep 完了 → ConversationRoundStep 遷移が確認できること                                         | TBD      | E2E テスト実行      |
| AC-2   | CompleteStep の 👍 で `skill_skeleton_quality_feedback(satisfied=true)` が発火すること             | TBD      | E2E テスト実行      |
| AC-3   | CompleteStep の 👎 で `skill_skeleton_quality_feedback(satisfied=false)` が発火すること            | TBD      | E2E テスト実行      |
| AC-4   | `complete-step-action-execute` で `skill_wizard_next_action(execute)` が発火すること               | TBD      | E2E テスト実行      |
| AC-5   | `complete-step-action-open-editor` で `skill_wizard_next_action(open_editor)` が発火すること       | TBD      | E2E テスト実行      |
| AC-6   | `complete-step-action-create-another` で `skill_wizard_next_action(create_another)` が発火すること | TBD      | E2E テスト実行      |
| AC-7   | 「もう一度作成」後に InfoStep に戻ること                                                           | TBD      | E2E テスト実行      |
| AC-8   | `wizard-tracking-stub.ts` と `trackEvent.e2e-stub.ts` が本番型定義と型整合していること             | TBD      | typecheck PASS 確認 |
| AC-9   | `.github/workflows/ci.yml` の `e2e-desktop` が E2E 自動実行・PR ブロックを担うこと                 | TBD      | CI 設定ファイル確認 |

**期待される成果物**:

- `outputs/phase-9/quality-report.md`（AC 確認テーブル完成版）

---

## 参照資料

| 参照資料                     | パス                                               | 内容                             |
| ---------------------------- | -------------------------------------------------- | -------------------------------- |
| Phase 1 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`           | AC-1〜AC-9 の定義                |
| Phase 8 リファクタリング記録 | `outputs/phase-8/refactoring-log.md`               | リファクタリング後の変更内容確認 |
| E2E テスト実装ファイル       | `apps/desktop/e2e/skill-wizard-tracking.spec.ts`   | テスト実行対象                   |
| E2E スタブヘルパー           | `apps/desktop/e2e/helpers/wizard-tracking-stub.ts` | スタブ混入確認対象               |
| E2E trackEvent スタブ        | `apps/desktop/e2e/helpers/trackEvent.e2e-stub.ts`  | スタブ混入確認対象               |
| Vite E2E 設定                | `apps/desktop/vite.e2e.config.ts`                  | テスト実行設定                   |
| CI 設定ファイル              | `.github/workflows/ci.yml`                         | E2E テスト実行ステップ確認       |

---

## 成果物

| 成果物       | パス                                | 内容                                          |
| ------------ | ----------------------------------- | --------------------------------------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 全検証の実施記録・AC-1〜AC-9 最終充足確認結果 |

**`outputs/phase-9/quality-report.md` のフォーマット**:

```markdown
# Phase 9 品質レポート

## 1. E2E テスト全件実行

- 実行コマンド: `pnpm --filter @repo/desktop test:e2e`
- 結果: PASS N件 / FAIL 0件
- skill-wizard-tracking.spec.ts: [PASS/FAIL + 詳細]

## 2. 既存 E2E テストへの影響確認

- リグレッション: なし / あり（修正済み）

## 3. TypeScript 型チェック

- 実行結果: PASS / FAIL
- エラー: なし / N件（修正済み）

## 4. Lint チェック

- 実行結果: PASS / FAIL
- エラー: なし / N件（修正済み）

## 5. スタブの本番コード混入確認

- grep 証跡: [出力内容]
- 混入件数: 0件

## 6. AC-1〜AC-9 最終確認

| AC番号 | 受け入れ基準 | 充足状況 | 確認方法 |
| ------ | ------------ | -------- | -------- |
| AC-1   | ...          | PASS     | E2E実行  |
| ...    | ...          | ...      | ...      |

## 総合判定

- E2E テスト: PASS / FAIL
- 型チェック: PASS / FAIL
- Lint: PASS / FAIL
- スタブ混入: なし
- AC 充足: 全件 PASS / 未充足 N 件
- Phase 10 進行可否: 可 / 不可（要修正）
```

---

## 統合テスト連携

- `pnpm --filter @repo/desktop test:e2e` で AC-1〜AC-7 に対応する全テストケースが PASS することを確認する
- 既存 E2E テストへの影響がゼロであることを確認する
- スタブが本番コードに混入していないことを grep 証跡として記録する

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop test:e2e` の全テストケースが PASS していること
- [ ] 既存 E2E テストへの影響がゼロであること（リグレッションなし）
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS していること
- [ ] `pnpm --filter @repo/desktop lint` が PASS していること
- [ ] スタブの本番コード混入が 0 件であることが grep 証跡で確認されていること
- [ ] AC-1〜AC-9 が全件 PASS であることが `outputs/phase-9/quality-report.md` に記録されていること
- [ ] 本Phase内の全タスクを100%実行完了

---

## タスク100%実行確認【必須】

- [ ] タスク1（E2E テスト全件実行）を100%完了し、完了を明記した
- [ ] タスク2（既存 E2E テストへの影響確認）を100%完了し、完了を明記した
- [ ] タスク3（TypeScript 型チェック）を100%完了し、完了を明記した
- [ ] タスク4（Lint チェック）を100%完了し、完了を明記した
- [ ] タスク5（スタブの本番コード混入確認）を100%完了し、完了を明記した
- [ ] タスク6（AC-1〜AC-9 の確認）を100%完了し、完了を明記した
- [ ] 成果物 `outputs/phase-9/quality-report.md` が生成されていることを確認した

---

## 依存関係

- **前提**: Phase 8 が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 9 実行記録

### 実行タスク

- E2E テスト全件実行: [PASS/FAIL + 件数]
- 既存 E2E テストへの影響確認: [影響件数]
- TypeScript 型チェック: [PASS/FAIL]
- Lint チェック: [PASS/FAIL]
- スタブの本番コード混入確認: [混入件数]
- AC-1〜AC-9 最終確認: [全件PASS / 未充足件数]

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次Phase

完了後、以下のファイルを実行してください:

`docs/30-workflows/UT-W3-E2E-WIZARD-TRACKING-UI-REACH-001/phase-10-final-review.md`
