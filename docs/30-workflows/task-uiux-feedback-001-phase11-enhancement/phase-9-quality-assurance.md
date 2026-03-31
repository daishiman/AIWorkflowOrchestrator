# Phase 9: 品質保証

## メタ情報

| 項目   | 値                                    |
| ------ | ------------------------------------- |
| Phase  | 9                                     |
| 機能名 | phase11-ui-ux-auto-eval-feedback-loop |
| 作成日 | 2026-03-31                            |
| 担当   | 設計書作成エージェント                |

## 目的

line budget・link 整合性・型安全性を一括判定する。TypeScript 型チェック・ESLint/Prettier 検証・Phase 11 テンプレートのマークダウン構造検証・フィードバックループの実行シミュレーション・TASK-RT-05 Phase 11 の受入条件検証を実施し、Phase 10（最終レビュー）への移行可否を判定する。

## 実行タスク

- TypeScript 型チェック（Claude API の型定義）
- ESLint / Prettier 検証
- Phase 11 テンプレートのマークダウン構造検証
- フィードバックループの実行シミュレーション
- TASK-RT-05 Phase 11 の受入条件検証

## 参照資料

| 資料名                   | パス                                                                                    | 説明                                  |
| ------------------------ | --------------------------------------------------------------------------------------- | ------------------------------------- |
| Phase 8 リファクタリング | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-8-refactoring.md`   | 品質確認対象の構造整理内容            |
| Phase 11/12 ガイド       | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | screenshot coverage と close-out 条件 |
| Phase 11 テンプレート    | `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md` | Markdown 構造の検証対象               |

---

## 実行手順

### ステップ 1: 型安全性確認

**目的**: Phase 4〜8 で実装・リファクタリングしたスクリプトの TypeScript 型整合性を確認する。

```bash
pnpm typecheck
```

#### 確認ポイント

| 確認対象                                   | 期待結果                                                                                                       | 確認内容                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Claude API レスポンス型定義                | `UXEvaluationResult` が `@anthropic-ai/sdk` の型と整合している                                                 | `content[0].type` の型ガード（`content.type !== "text"` の分岐） |
| `SemanticTestResult` 型                    | `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-types.d.ts` に定義され、全インポート先で一致 | Phase 8 で集約した型定義が正しく参照されている                   |
| `EvaluationError` 型                       | `utils/error-handler.ts` の型定義が全呼び出し元で利用されている                                                | `handleEvaluationError()` の引数型が一致している                 |
| Playwright `_electron` 統合の型            | `ElectronApplication` / `Page` が `@playwright/test` からインポート済み                                        | `import type` での型安全な参照                                   |
| `page.accessibility.snapshot()` の戻り値型 | `unknown` として型付けされている                                                                               | アクセシビリティスナップショットの型処理が安全                   |
| `window.__lastSubmitPayload__` のキャスト  | `Record<string, unknown>` 経由で型安全にアクセスされている                                                     | M11-2 テストの payload 検証でキャスト漏れがない                  |

#### エラー時の対処方針

| エラー種別                   | 対処方針                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `any` 型の使用               | 具体的な型定義に置き換える（`.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-types.d.ts` に追加） |
| 型ガードの漏れ               | `if (content.type !== "text") throw new Error(...)` パターンを追加                                                 |
| インポートパスエラー         | Phase 8 のリファクタリングによるパス変更を確認し修正                                                               |
| 型定義ファイルが見つからない | `tsconfig.json` の `include` に `.claude/skills/task-specification-creator/scripts/**` が含まれているか確認        |

---

### ステップ 2: フォーマット・lint 確認

**目的**: Phase 4〜8 で作成・変更したファイルの品質を ESLint / Prettier で確認する。

```bash
pnpm lint
pnpm format:check
```

#### 確認対象ファイル

| ファイル                                                                               | lint 確認観点                                              |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-playwright-e2e.ts`   | 不要な `console.log` がないか、非同期処理が適切か          |
| `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js`                  | `any` 型の使用がないか                                     |
| `.claude/skills/task-specification-creator/scripts/layers/semantic-layer.ts`           | Phase 8 で分離後の lint 適合を確認                         |
| `.claude/skills/task-specification-creator/scripts/layers/visual-layer.ts`             | Phase 8 で分離後の lint 適合を確認                         |
| `.claude/skills/task-specification-creator/scripts/layers/ai-ux-layer.ts`              | Phase 8 で分離後の lint 適合を確認                         |
| `.claude/skills/task-specification-creator/scripts/utils/error-handler.ts`             | エラーハンドリングの実装がプロジェクトルールに沿っているか |
| `.claude/skills/task-specification-creator/scripts/evaluate-ui-ux-report-formatter.js` | テンプレートリテラルのフォーマットが適切か                 |

#### lint エラー時の対処方針

| エラー種別                          | 対処方針                                                          |
| ----------------------------------- | ----------------------------------------------------------------- |
| `no-explicit-any`                   | 適切な型定義に置き換える                                          |
| `@typescript-eslint/no-unused-vars` | 不要な変数を削除するか `_` プレフィックスを付与                   |
| `no-console`（警告レベル）          | `console.log` を `console.error` に変更、または logger に置き換え |
| Prettier フォーマット不一致         | `pnpm format` を実行して自動修正                                  |

---

### ステップ 3: テンプレート構造確認

**目的**: Phase 5 で更新した `phase-11-test-report-template.md` のマークダウン構造を確認し、既存テンプレートとの後方互換性を検証する。

#### 3-1: マークダウン構造検証

以下の観点で `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md` を確認する。

| 確認観点                                             | 期待結果                                                                                          | 確認方法                         |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------- |
| `## 3層評価` セクションが存在する                    | Phase 8 整理後の `##` 階層で定義されている                                                        | ファイル内の見出し構造を確認     |
| 既存セクション（`## 機能テスト` 等）が保持されている | Phase 2 で追加した 3 層評価セクションの影響を受けていない                                         | 既存セクションの有無・内容を確認 |
| `### 層1` / `### 層2` / `### 層3` が `##` 配下にある | Phase 8 の見出し階層整理が適用されている                                                          | マークダウン見出しのネストを確認 |
| `### 3層評価サマリー` テーブルが存在する             | 層ごとの結果・検出問題数・unassigned-task 生成数のテーブルがある                                  | テーブルの列構成を確認           |
| リンク切れがない                                     | `.claude/skills/task-specification-creator/scripts/` 等へのパス参照が存在するファイルを指している | 参照先ファイルの存在を確認       |

#### 3-2: 後方互換性確認

以下のテストで既存の UI タスクが Phase 11 テンプレートを正しく使用できることを確認する。

| 確認観点                                             | 確認方法                                                                 | 期待結果                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------- |
| 3 層評価なし（既存 UI タスク）でも成立するか         | 3 層評価セクションをすべて省略したテンプレートがマークダウンとして有効か | 既存タスクへの影響がない     |
| スクリーンショット命名ルールが統一されているか       | `TC-VIS-{連番}-{状態名}.png` と既存命名が矛盾していないか                | 命名ルールの衝突がない       |
| SKILL.md の Phase 11 説明が 3 層評価を反映しているか | `.claude/skills/task-specification-creator/SKILL.md` line 118 付近を確認 | 「3 層評価」に言及されている |

---

### ステップ 4: フィードバックループの動作シミュレーション

**目的**: 実際の Claude API を呼ばずに、モックで評価 → unassigned-task 生成のフローを確認する（ドライラン）。

#### 4-1: ドライランの実行手順

```bash
# モックデータで evaluate-ui-ux.js を動作確認
# MOCK_MODE=1 を設定すると実際の API 呼び出しをスキップ
MOCK_MODE=1 npx ts-node .claude/skills/task-specification-creator/scripts/evaluate-ui-ux.js \
  --screenshot outputs/phase-11/screenshots/M11-1-multi-select-display.png \
  --output outputs/phase-9/dry-run \
  --task-id TASK-UIUX-FEEDBACK-001-DRY-RUN
```

#### 4-2: ドライラン確認ポイント

| 確認項目                                                    | 期待結果                                            |
| ----------------------------------------------------------- | --------------------------------------------------- |
| `outputs/phase-9/dry-run/ai-ux-evaluation.md` が生成される  | ファイルが作成されている                            |
| モックデータの HIGH 問題が unassigned-task として出力される | `unassigned-task/ui-ux-issue-*.md` が生成されている |
| 生成ファイルのメタ情報テーブルが正しいフォーマット          | `タスクID` / `発見元` / `重要度` 等の列が揃っている |
| HIGH 問題 0 件の場合に unassigned-task が生成されない       | モックデータを HIGH 0 件に変更して再確認            |

#### 4-3: モックデータの形式

```json
{
  "usabilityIssues": [
    {
      "id": "UX-001",
      "description": "[ドライラン] チェックボックスの選択領域が狭い",
      "severity": "HIGH"
    }
  ],
  "accessibilityConcerns": [
    {
      "id": "A11Y-001",
      "concern": "[ドライラン] aria-label が空文字になっている",
      "wcagCriteria": "1.3.1",
      "severity": "HIGH"
    }
  ],
  "improvements": [
    {
      "priority": 1,
      "suggestion": "[ドライラン] タッチターゲットサイズを 44px 以上に変更",
      "effort": "LOW"
    }
  ]
}
```

---

### ステップ 5: リスク評価

**目的**: Phase 11（手動テスト）実行前に既知のリスクを把握し、軽減策を定義する。

#### 5-1: Claude API コスト試算

| 条件                                | 概算トークン数             | 備考                                        |
| ----------------------------------- | -------------------------- | ------------------------------------------- |
| スクリーンショット 1 枚（1024x768） | 入力: 約 1,200 tokens      | PNG の複雑さにより変動（±200 tokens）       |
| スクリーンショット 10 枚            | 入力: 約 12,000 tokens     | M11-1〜M11-4 の全スクリーンショット想定     |
| プロンプト（評価指示）              | 入力: 約 300 tokens        | Phase 2 設計のプロンプトテキスト            |
| レスポンス（JSON 出力）             | 出力: 約 500 tokens        | 問題 5〜10 件の JSON 想定                   |
| **合計（10 枚想定）**               | **入力: 約 12,300 tokens** | `claude-opus-4-5` 使用時: 約 $0.18 / 実行回 |
| **合計（1 枚想定）**                | **入力: 約 1,500 tokens**  | `claude-opus-4-5` 使用時: 約 $0.02 / 実行回 |

> **判定**: Phase 11 実行頻度（タスクごとに 1 回）を考慮すると月 $2〜5 の範囲。許容範囲内。

#### 5-2: リスク登録簿

**成果物**: `outputs/phase-9/risk-register.md`

| リスクID | リスク内容                                        | 発生確率 | 影響度 | 対処方針                                                                  |
| -------- | ------------------------------------------------- | -------- | ------ | ------------------------------------------------------------------------- |
| RISK-001 | Playwright Electron 起動がCI環境で失敗する        | 中       | 高     | `ELECTRON_IS_TEST=1` 環境変数での headless 起動を確認。CI設定を事前に確認 |
| RISK-002 | `toHaveScreenshot()` のベースライン画像が未作成   | 高       | 高     | 初回実行時に `--update-snapshots` フラグで生成（CON-1 対処）              |
| RISK-003 | Claude API レート制限による評価の中断             | 低       | 中     | リトライロジック（最大 3 回、指数バックオフ）を実装                       |
| RISK-004 | スクリーンショット保存先ディレクトリが未存在      | 低       | 低     | `fs.mkdirSync(..., { recursive: true })` で自動作成                       |
| RISK-005 | `window.__lastSubmitPayload__` が設定されていない | 中       | 中     | テスト実行前に Electron アプリのデバッグ用グローバル変数設定を確認        |
| RISK-006 | Phase 8 リファクタリング後のインポートパスエラー  | 中       | 中     | `pnpm typecheck` でリファクタリング後に必ず確認                           |

---

## 統合テスト連携

```bash
# 型チェック
pnpm typecheck

# lint / format 確認
pnpm lint
pnpm format:check

# ユニットテスト（モック含む）
pnpm test

# 統合テスト
pnpm test:integration

# E2E テスト
pnpm test:e2e
```

---

## 成果物

| 成果物名                     | パス                                                                                        | 説明                                |
| ---------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------- |
| 品質保証仕様書（本ファイル） | `docs/30-workflows/task-uiux-feedback-001-phase11-enhancement/phase-9-quality-assurance.md` | Phase 9 成果物                      |
| 品質レポート                 | `outputs/phase-9/quality-report.md`                                                         | typecheck・lint・構造確認の結果一覧 |
| リスク登録簿                 | `outputs/phase-9/risk-register.md`                                                          | RISK-001〜RISK-006 と対処方針       |

---

## 完了条件チェックリスト

- [ ] `pnpm typecheck` がエラー 0 件で完了している
- [ ] `pnpm lint` がエラー 0 件（警告は許容）で完了している
- [ ] `pnpm format:check` がエラー 0 件で完了している
- [ ] Claude API レスポンス型定義（`UXEvaluationResult`）の型整合性が確認されている
- [ ] Playwright `_electron` 統合の型定義（`ElectronApplication` / `Page`）が正しくインポートされている
- [ ] Phase 11 テンプレートに `## 3層評価` セクションが `##` 階層で存在している
- [ ] Phase 11 テンプレートの既存セクション（機能テスト・エラーハンドリング等）が保持されている
- [ ] 後方互換性（既存 UI タスクへの影響なし）が確認されている
- [ ] ドライラン（`MOCK_MODE=1`）で `ai-ux-evaluation.md` と unassigned-task が正しく生成されている
- [ ] HIGH 問題 0 件の場合に unassigned-task が生成されないことが確認されている
- [ ] リスク登録簿（`outputs/phase-9/risk-register.md`）が作成されている（RISK-001〜RISK-006）
- [ ] Claude API コスト試算が記録されている（許容範囲内）
- [ ] 品質レポート（`outputs/phase-9/quality-report.md`）が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**
