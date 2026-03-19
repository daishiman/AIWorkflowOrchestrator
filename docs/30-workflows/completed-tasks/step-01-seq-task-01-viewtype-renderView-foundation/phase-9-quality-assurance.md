# Phase 9: 品質検証 - タスク仕様書

## メタ情報

| 項目       | 内容                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| タスクID   | TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001                                                                                                       |
| Phase      | 9 - 品質検証                                                                                                                                      |
| 前 Phase   | Phase 8 - リファクタリング（`phase-8-refactoring.md`）                                                                                            |
| 次 Phase   | Phase 10 - 最終レビュー（`phase-10-final-review.md`）                                                                                             |
| 依存成果物 | `phase-8-refactoring.md`（リファクタリング完了後の実装）、`outputs/phase-8/refactoring-log.md`                                                    |
| 成果物パス | `docs/30-workflows/completed-tasks/skill-lifecycle-routing/tasks/step-01-seq-task-01-viewtype-renderView-foundation/phase-9-quality-assurance.md` |
| ステータス | not_started                                                                                                                                       |

## 目的

`pnpm lint`・`pnpm typecheck`・`pnpm vitest run` の 3 コマンドを全て実行し、全件 PASS することを確認する。エラー種別ごとに戻り先 Phase を定め、品質基準を満たすまで修正を繰り返す。検証結果は `outputs/phase-9/qa-results.md` にサマリーとして記録し、Phase 10 最終レビューへ引き継ぐ。

## 実行タスク

1. **ESLint 検証**: 変更した 3 ファイル + テストファイル群を対象に lint を実行し、ERROR 件数を記録する
2. **TypeScript 型チェック**: `pnpm typecheck` を実行し、ViewType 新メンバー・optional chaining・switch exhaustiveness を重点確認する
3. **テスト全件実行**: `pnpm vitest run` を apps/desktop ディレクトリから実行し、Phase 4・Phase 6 で追加したテストを含む全テストの PASS を確認する
4. **全パッケージ型チェック（条件付き）**: `packages/shared` の型に依存する変更がある場合のみ実行する
5. **結果サマリー記録**: 各チェックの結果・エラー件数・テスト件数を `outputs/phase-9/qa-results.md` に記録する

## 参照資料

### タスク関連

| 資料名             | パス                                     | 説明                                         |
| ------------------ | ---------------------------------------- | -------------------------------------------- |
| Phase 5 実装仕様書 | `phase-5-implementation.md`              | 検証対象実装と変更ファイル範囲の確認         |
| Phase 8 成果物     | `outputs/phase-8/refactoring-log.md`     | リファクタリング変更内容（検証スコープ）     |
| Phase 4 テスト設計 | `phase-4-test-creation.md`               | TC-VT/TC-RV/TC-SL 各テストケース定義         |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`              | カバレッジ補完テストケース定義               |
| 落とし穴 P40       | `.claude/rules/06-known-pitfalls.md#P40` | テスト実行は対象パッケージのディレクトリから |
| 落とし穴 P39       | `.claude/rules/06-known-pitfalls.md#P39` | happy-dom 環境では fireEvent を使用          |

### システム仕様（aiworkflow-requirements）

| 資料名                 | パス                                  | 説明                                  |
| ---------------------- | ------------------------------------- | ------------------------------------- |
| コード品質ルール       | `.claude/rules/02-code-quality.md`    | カバレッジ基準・テスト設計の注意      |
| Git & ツーリングルール | `.claude/rules/07-git-and-tooling.md` | コミット前チェックリスト・Husky Hooks |
| CLAUDE.md              | `CLAUDE.md`                           | フック環境変数・pnpm コマンド例       |

## 実行手順

### Task 1: ESLint 検証

変更した 3 ファイルとテストファイル群を対象に ESLint を実行する。

```bash
cd apps/desktop && pnpm lint
```

**確認対象ファイル:**

| ファイル                                                               | 変更種別   |
| ---------------------------------------------------------------------- | ---------- |
| `apps/desktop/src/renderer/store/types.ts`                             | 変更       |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.ts`        | 変更       |
| `apps/desktop/src/renderer/App.tsx`                                    | 変更       |
| `apps/desktop/src/renderer/store/types.test.ts`                        | テスト追記 |
| `apps/desktop/src/renderer/__tests__/App.renderView.viewtype.test.tsx` | テスト新規 |
| `apps/desktop/src/renderer/navigation/skillLifecycleJourney.test.ts`   | テスト追記 |

**期待出力:**

```
✓ No ESLint warnings or errors
```

または

```
/path/to/file.ts
  10:5  warning  ... (WARNING は PASS 扱い)

✖ 0 errors, N warnings
```

**判断基準:**

| 結果          | 対応                                       |
| ------------- | ------------------------------------------ |
| ERROR 0件     | PASS - Task 2 に進む                       |
| WARNING のみ  | PASS - 内容を記録して Task 2 に進む        |
| ERROR 1件以上 | FAIL - Phase 8 に戻り修正後 Phase 9 再実行 |

---

### Task 2: TypeScript 型チェック

```bash
cd apps/desktop && pnpm typecheck
```

**重点確認項目:**

| 確認項目                           | 期待動作                                                           |
| ---------------------------------- | ------------------------------------------------------------------ |
| ViewType 新メンバー型解決          | `"skillAnalysis"` / `"skillCreate"` が ViewType として型解決される |
| renderView() switch exhaustiveness | TypeScript が未処理 case を検出しない（default が残存している）    |
| `onAction?: () => void` optional   | `onAction?.()` の呼び出しで型エラーが出ない                        |
| SkillAnalysisView props 整合       | `skillName: string`, `onClose: () => void` が正しく渡されている    |
| SkillCreateWizard props 整合       | `onClose: () => void` が正しく渡されている                         |

**期待出力:**

```
tsc --noEmit  (0 errors)
```

**判断基準:**

| 結果           | 対応                                                  |
| -------------- | ----------------------------------------------------- |
| エラー 0件     | PASS - Task 3 に進む                                  |
| エラー 1件以上 | FAIL - Phase 5（実装修正）に戻り修正後 Phase 9 再実行 |

---

### Task 3: テスト全件実行

**重要 (P40対策):** テストは必ず `apps/desktop` ディレクトリから実行する。プロジェクトルートから実行すると `vitest.config.ts` の `environment: 'happy-dom'` 設定が適用されず失敗する。

```bash
cd apps/desktop && pnpm vitest run
```

**確認対象テストケース:**

| テストID  | ファイル                                     | 内容                                                      | Phase 追加 |
| --------- | -------------------------------------------- | --------------------------------------------------------- | ---------- |
| TC-VT-01  | `store/types.test.ts`                        | skillAnalysis が ViewType に含まれること                  | Phase 4    |
| TC-VT-02  | `store/types.test.ts`                        | skillCreate が ViewType に含まれること                    | Phase 4    |
| TC-VT-03  | `store/types.test.ts`                        | 既存 ViewType member が引き続き有効であること             | Phase 4    |
| TC-VT-04  | `store/types.test.ts`                        | ViewType union が合計 17 member を持つこと                | Phase 4    |
| TC-RV-01  | `__tests__/App.renderView.viewtype.test.tsx` | skillAnalysis case が SkillAnalysisView を描画            | Phase 4    |
| TC-RV-01b | `__tests__/App.renderView.viewtype.test.tsx` | currentSkillName null 時の demo-skill フォールバック      | Phase 4    |
| TC-RV-02  | `__tests__/App.renderView.viewtype.test.tsx` | skillCreate case が SkillCreateWizard を描画              | Phase 4    |
| TC-RV-03  | `__tests__/App.renderView.viewtype.test.tsx` | 既存 dashboard case が引き続き正しく描画                  | Phase 4    |
| TC-SL-01  | `navigation/skillLifecycleJourney.test.ts`   | onAction?: () => void を受け入れること                    | Phase 4    |
| TC-SL-02  | `navigation/skillLifecycleJourney.test.ts`   | onAction を省略できること                                 | Phase 4    |
| TC-SL-03  | `navigation/skillLifecycleJourney.test.ts`   | 既存定数が onAction なしで有効であること                  | Phase 4    |
| TC-SL-04  | `navigation/skillLifecycleJourney.test.ts`   | normalizeSkillLifecycleView が skillAnalysis を変換しない | Phase 4    |
| TC-SL-05  | `navigation/skillLifecycleJourney.test.ts`   | normalizeSkillLifecycleView が skillCreate を変換しない   | Phase 4    |

**期待出力（抜粋）:**

```
Test Files  N passed (N)
Tests       N passed (N)
Duration    N.Ns
```

**判断基準:**

| 結果                   | 原因推定               | 対応                                  |
| ---------------------- | ---------------------- | ------------------------------------- |
| 全件 PASS              | -                      | PASS - Task 4 へ                      |
| TC-VT-\* 失敗          | ViewType 型定義の誤り  | Phase 5（実装修正）に戻る             |
| TC-RV-\* 失敗          | renderView case の誤り | Phase 5（実装修正）に戻る             |
| TC-SL-\* 失敗          | onAction 型定義の誤り  | Phase 5（実装修正）に戻る             |
| Phase 6 追加テスト失敗 | カバレッジ補完の誤り   | Phase 6（テスト修正）に戻る           |
| 既存テスト失敗         | リグレッション発生     | Phase 8（リファクタリング修正）に戻る |

---

### Task 4: 全パッケージ型チェック（条件付き）

このタスクの変更（ViewType・renderView・SkillLifecycleJobGuide）は `apps/desktop` 内で完結するため、通常は不要。ただし以下の場合に実行する:

- `packages/shared` の型定義を参照する変更を行った場合
- Phase 8 リファクタリングログに shared への変更が記録されている場合

```bash
# プロジェクトルートから実行
pnpm typecheck
```

---

### Task 5: 結果サマリー記録

全チェック完了後に `outputs/phase-9/` ディレクトリを作成し、結果を記録する。

```bash
mkdir -p outputs/phase-9
```

`outputs/phase-9/qa-results.md` に以下のフォーマットで記録する:

```markdown
# Phase 9 品質検証結果

**タスクID**: TASK-IMP-VIEWTYPE-RENDERVIEW-FOUNDATION-001
**実施日**: YYYY-MM-DD

## チェック結果サマリー

| チェック             | 結果      | エラー件数 | WARNING 件数 | 備考     |
| -------------------- | --------- | ---------- | ------------ | -------- |
| ESLint               | PASS/FAIL | 0          | N            | -        |
| TypeScript typecheck | PASS/FAIL | 0          | -            | -        |
| Vitest (全件)        | PASS/FAIL | 0 失敗     | -            | N件 PASS |

## テスト件数内訳

| テストファイル                             | テスト件数 | PASS  | FAIL  |
| ------------------------------------------ | ---------- | ----- | ----- |
| store/types.test.ts                        | N          | N     | 0     |
| **tests**/App.renderView.viewtype.test.tsx | N          | N     | 0     |
| navigation/skillLifecycleJourney.test.ts   | N          | N     | 0     |
| (その他既存テスト)                         | N          | N     | 0     |
| **合計**                                   | **N**      | **N** | **0** |

## ESLint WARNING 一覧（あれば記録）

| ファイル | 行  | ルール | 内容 |
| -------- | --- | ------ | ---- |
| -        | -   | -      | -    |

## 判定

- [ ] ESLint: ERROR 0件 - PASS
- [ ] TypeScript: エラー 0件 - PASS
- [ ] Vitest: 全件 PASS
- [ ] Phase 10 最終レビューへ引き継ぎ可能
```

## 統合テスト連携

Phase 9 完了後、以下のコマンドで Phase 4・Phase 6 のテストが全件 PASS していることを最終確認する:

```bash
cd apps/desktop && pnpm vitest run \
  src/renderer/store/types.test.ts \
  src/renderer/__tests__/App.renderView.viewtype.test.tsx \
  src/renderer/navigation/skillLifecycleJourney.test.ts
```

この結果を `outputs/phase-9/qa-results.md` のテスト件数内訳に反映してから Phase 10 に進む。

## 成果物

| 成果物               | パス                            | 種別     |
| -------------------- | ------------------------------- | -------- |
| 品質検証結果サマリー | `outputs/phase-9/qa-results.md` | 検証記録 |

## 完了条件

- [ ] `cd apps/desktop && pnpm lint` が ERROR 0件で完了する
- [ ] `cd apps/desktop && pnpm typecheck` がエラー 0件で完了する
- [ ] `cd apps/desktop && pnpm vitest run` が全件 PASS する（P40対策: apps/desktop から実行）
- [ ] TC-VT-01〜TC-VT-04 の 4テストが PASS している
- [ ] TC-RV-01・TC-RV-01b・TC-RV-02・TC-RV-03 の 4テストが PASS している
- [ ] TC-SL-01〜TC-SL-05 の 5テストが PASS している
- [ ] `outputs/phase-9/qa-results.md` に結果サマリーとテスト件数内訳が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-lifecycle-routing --phase 9
```

## 次Phase

Phase 10: 最終レビュー（`phase-10-final-review.md`）
