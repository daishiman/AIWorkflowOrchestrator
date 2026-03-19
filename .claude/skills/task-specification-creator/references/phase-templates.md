# Phase別テンプレートリファレンス

> 読み込み条件:
> `phase-*.md` を新規作成または大幅更新する時。

## family 構成

| file | 対象 | 役割 |
| --- | --- | --- |
| [phase-template-core.md](phase-template-core.md) | Phase 1-3 | 要件定義、設計、設計レビューの共通構造 |
| [phase-template-execution.md](phase-template-execution.md) | Phase 4-10 | テスト、実装、品質、最終レビュー |
| [phase-template-phase11.md](phase-template-phase11.md) | Phase 11 | manual walkthrough と screenshot evidence。設計タスク向けウォークスルー方式（NON_VISUAL判定）を含む |
| [phase-template-phase12.md](phase-template-phase12.md) | Phase 12 | implementation guide、spec sync、未タスク、feedback。設計タスク向け2段階更新方式（SF-02）と未タスク4パターン（SF-03）を含む |
| [phase-template-phase13.md](phase-template-phase13.md) | Phase 13 | user approval と PR blocked ルール |

---

## 成果物配置ルール（重要）

**成果物には2種類あり、配置先が異なる:**

| 成果物タイプ       | 配置先                         | Phase         |
| ------------------ | ------------------------------ | ------------- |
| ドキュメント成果物 | `outputs/phase-N/`             | 全Phase       |
| コード成果物       | プロジェクトの該当ディレクトリ | Phase 4, 5, 6 |

**コード成果物（テストコード、実装コード）は `outputs/` 配下に配置しない。**
必ず `packages/*/src/` や `apps/*/src/` に配置すること。

---

## 変数一覧

テンプレートで使用する変数の定義：

| 変数名              | 説明                   | 例                                 |
| ------------------- | ---------------------- | ---------------------------------- |
| `{{FEATURE_NAME}}`  | 機能名（ケバブケース） | `search-replace-ui`                |
| `{{PHASE_NUMBER}}`  | Phase番号（1-13）      | `4`                                |
| `{{PHASE_NAME}}`    | Phase名称              | `テスト作成`                       |
| `{{CREATED_DATE}}`  | 作成日（ISO形式）      | `2026-01-06`                       |
| `{{PREV_PHASE}}`    | 前のPhase番号          | `3`                                |
| `{{NEXT_PHASE}}`    | 次のPhase番号          | `5`                                |
| `{{TASK_NAME}}`     | タスク名               | `search-replace-ui-implementation` |
| `{{ISO_TIMESTAMP}}` | ISO8601タイムスタンプ  | `2026-01-06T10:00:00Z`             |
| `{{TASK_ID}}`       | workflow 全体の task ID |                                   |
| `{{ARTIFACT_PATH}}` | `outputs/phase-N/...` の相対パス |                            |
| `{{SYSTEM_SPEC_PATH}}` | aiworkflow-requirements 側の更新対象 |                     |

---

## 共通ルール

1. タイトルは `# Phase N: ...` を維持する。
2. `## メタ情報`、`## 目的`、`## 実行タスク`、`## 参照資料`、`## 成果物`、`## 完了条件` を省略しない。
3. Phase 1-11 では `## 統合テスト連携` を必ず残す。
4. `完了条件` と `タスク100%実行確認` はチェックリストで書く。
5. outputs と phase 本文の名称は 1:1 に揃える。

---

## 共通構造

すべてのPhaseドキュメントは以下の共通構造を持つ。
共通部分は `assets/common-header-template.md` と `assets/common-footer-template.md` を参照。

````markdown
# Phase {{PHASE_NUMBER}}: {{PHASE_NAME}}

## メタ情報

| 項目   | 値               |
| ------ | ---------------- |
| Phase  | {{PHASE_NUMBER}} |
| 機能名 | {{FEATURE_NAME}} |
| 作成日 | {{CREATED_DATE}} |

## 目的

{{PHASE_PURPOSE}}

## 実行タスク

{{#each TASKS}}
- {{TASK_NAME}}: {{TASK_PURPOSE}}
{{/each}}

## 参照資料

| 資料名       | パス         | 説明                |
| ------------ | ------------ | ------------------- |
| {{REF_NAME}} | {{REF_PATH}} | {{REF_DESCRIPTION}} |

## 実行手順

### ステップ1: {{STEP_NAME}}

{{STEP_DESCRIPTION}}

## 統合テスト連携（Phase 1-11は必須）

{{INTEGRATION_TEST_ACTIONS}}

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

## 成果物

| 成果物            | パス              | 説明                     |
| ----------------- | ----------------- | ------------------------ |
| {{ARTIFACT_NAME}} | {{ARTIFACT_PATH}} | {{ARTIFACT_DESCRIPTION}} |

## 完了条件

- [ ] {{COMPLETION_CRITERION_1}}
- [ ] {{COMPLETION_CRITERION_2}}
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1-11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/{{FEATURE_NAME}} --phase {{PHASE_NUMBER}}
```

## 次のPhase

Phase {{NEXT_PHASE}}: {{NEXT_PHASE_NAME}}
````

---

## Phase 1: 要件定義

```markdown
# Phase 1: 要件定義

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 1                  |
| 機能名 | {{FEATURE_NAME}}   |
| 作成日 | {{CREATED_DATE}}   |

## 目的

タスクの目的、スコープ、受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: ユーザー要求から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名       | パス                        | 説明             |
| ------------ | --------------------------- | ---------------- |
| システム要件 | `docs/00-requirements/*.md` | 既存システム要件 |
| ユーザー要求 | （会話履歴参照）            | 元のユーザー要求 |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

Phase 1 開始時に、対象ファイルの現在の実装状態を確認する。

```bash
# 対象ファイルの最近のコミット履歴
git log --oneline -20 -- <対象ファイルパス>

# 対象関数/機能が既に実装されているか確認
grep -n "<対象関数名>" <対象ファイルパス>
```

| 判定 | 条件 | 対応 |
| file | 対象 | 役割 |
| --- | --- | --- |
| [phase-template-core.md](phase-template-core.md) | Phase 1-3 | 要件定義、設計、設計レビューの共通構造 |
| [phase-template-execution.md](phase-template-execution.md) | Phase 4-10 | テスト、実装、品質、最終レビュー |
| [phase-template-phase11.md](phase-template-phase11.md) | Phase 11 | manual walkthrough と screenshot evidence。設計タスク向けウォークスルー方式（NON_VISUAL判定）を含む |
| [phase-template-phase12.md](phase-template-phase12.md) | Phase 12 | implementation guide、spec sync、未タスク、feedback。設計タスク向け2段階更新方式（SF-02）と未タスク4パターン（SF-03）を含む |
| [phase-template-phase13.md](phase-template-phase13.md) | Phase 13 | user approval と PR blocked ルール |

## 共通ルール

1. タイトルは `# Phase N: ...` を維持する。
2. `## メタ情報`、`## 目的`、`## 実行タスク`、`## 参照資料`、`## 成果物`、`## 完了条件` を省略しない。
3. Phase 1〜11 では `## 統合テスト連携` を必ず残す。
4. `完了条件` と `タスク100%実行確認` はチェックリストで書く。
5. outputs と phase 本文の名称は 1:1 に揃える。

出力レポートをPhase 7成果物に含める。判定はハンドラ単位で行う（quality-requirements.md参照）。

## vitest 実行不可時のフォールバック: 構造的カバレッジ分析

esbuild アーキテクチャ不一致（ネイティブモジュールのバイナリ不一致等、P7参照）により worktree 環境で vitest が実行できない場合、以下の手順で構造的カバレッジ分析を実施する。

### Step 1: テストケース数の正確なカウント

```bash
# テストファイル内の it() / test() 呼び出し数をカウント
grep -c "it(\|test(" <対象テストファイル>

# 全テストファイルの合計
find <対象ディレクトリ> -name "*.test.ts" -o -name "*.test.tsx" | xargs grep -c "it(\|test(" | tail -1
```

### Step 2: テストケースID → ソースコード行のマッピング表

テストケースごとに、カバーするソースコード行を対応付ける:

| テストケースID | テスト内容 | カバー対象ファイル | カバー対象行（概算） |
| -------------- | ---------- | ------------------ | -------------------- |
| TC-01          | 正常系     | `target.ts`        | L10-L25              |
| TC-02          | 異常系     | `target.ts`        | L26-L40              |

### Step 3: 構造的カバレッジ判定

マッピング表に基づき、ソースコードの各分岐・関数・行がテストでカバーされているかを判定する:

| 指標              | カバー対象数 | カバー済み数 | カバレッジ率 | 基準  |
| ----------------- | ------------ | ------------ | ------------ | ----- |
| Line Coverage     | {{N}}        | {{M}}        | {{%}}        | 80%+  |
| Branch Coverage   | {{N}}        | {{M}}        | {{%}}        | 60%+  |
| Function Coverage | {{N}}        | {{M}}        | {{%}}        | 80%+  |

**注意**: 構造的カバレッジ分析は vitest 実測値の代替であり、CI 環境での正式なカバレッジ測定を免除しない。PR マージ前に CI で vitest カバレッジが基準を達成していることを確認すること。

## 統合テスト連携【必須】

統合テストの再実行とゲート判定:

| 判定項目                 | 基準 | 結果       |
| ------------------------ | ---- | ---------- |
| ユニットテストLine       | 80%+ | {{RESULT}} |
| ユニットテストBranch     | 60%+ | {{RESULT}} |
| ユニットテストFunction   | 80%+ | {{RESULT}} |
| 結合テストAPI            | 100% | {{RESULT}} |
| 結合テストシナリオ正常系 | 100% | {{RESULT}} |
| 結合テストシナリオ異常系 | 80%+ | {{RESULT}} |

## 成果物

| 成果物             | パス                                  | 説明               |
| ------------------ | ------------------------------------- | ------------------ |
| カバレッジレポート | `outputs/phase-7/coverage-report.md`  | 再測定結果         |
| 統合テスト結果     | `outputs/phase-7/integration-test.md` | 統合テスト実行結果 |

## 完了条件

- [ ] ユニットテストカバレッジ基準を達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] 結合テストカバレッジ基準を達成（API 100%, シナリオ 100%/80%）
- [ ] 統合テストが全て成功
- [ ] フロントエンド・バックエンド接続テストが成功
- [ ] カバレッジレポートが出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング（TDD: Refactor）

````

---

## Phase 8: リファクタリング（TDD: Refactor）

```markdown
# Phase 8: リファクタリング（TDD: Refactor）

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 8                  |
| 機能名 | {{FEATURE_NAME}}   |
| 作成日 | {{CREATED_DATE}}   |

## 目的

動作を変えずにコード品質を改善する。

## 実行タスク

- リファクタリング: コード構造の改善（重複排除、命名改善、構造整理）
- コードスメル検出: 問題のあるコードパターンの特定と修正
- SOLID原則適用: 設計原則に基づくコード改善

## 統合テスト連携【必須】

リファクタ後の統合テスト継続成功を確認:

```bash
# リファクタリング後のテスト実行
pnpm test
pnpm test:integration
pnpm test:e2e
````

## 成果物

| 成果物               | パス                                          | 説明                                |
| -------------------- | --------------------------------------------- | ----------------------------------- |
| リファクタリングログ | `outputs/phase-8/refactoring-log.md`          | 変更内容と改善理由の記録            |
| コード品質チェック   | `outputs/phase-8/code-quality-check.md`       | Lint/型チェック結果（PASS 確認用）  |
| テスト通過確認       | `outputs/phase-8/test-pass-confirmation.md`   | リファクタ後の全テスト PASS の証跡  |

## 完了条件

- [ ] テストが継続成功
- [ ] コード品質が改善されている
- [ ] 重複が排除されている
- [ ] 統合テストが継続成功
- [ ] **本Phase内の全タスクを100%実行完了**

## TDD検証

```bash
# テスト実行コマンド
pnpm test

# 確認項目
# - [ ] リファクタリング後もテストが成功することを確認
```

## 次のPhase

Phase 9: 品質保証

````

---

## Phase 9: 品質保証

```markdown
# Phase 9: 品質保証

## メタ情報

| 項目   | 値                 |
| ------ | ------------------ |
| Phase  | 9                  |
| 機能名 | {{FEATURE_NAME}}   |
| 作成日 | {{CREATED_DATE}}   |

## 目的

定義された品質基準をすべて満たすことを検証する。

## 品質ゲート

- 機能検証: 自動テストの完全成功
- コード品質: Lint/型チェッククリア
- テスト網羅性: カバレッジ基準達成
- セキュリティ: 重大な脆弱性の不在

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目 | 確認内容 | 結果 |
| -------- | -------- | ---- |
| 機能検証 | 全自動テスト成功 | {{RESULT}} |
| 統合テスト | 全統合テスト成功 | {{RESULT}} |
| E2Eテスト | 全E2Eテスト成功 | {{RESULT}} |
| セキュリティ | 脆弱性スキャン通過 | {{RESULT}} |

## 成果物

| 成果物                   | パス                                        | 説明                                        |
| ------------------------ | ------------------------------------------- | ------------------------------------------- |
| 品質レポート             | `outputs/phase-9/quality-report.md`         | 品質検証結果（全ゲート通過の総括）          |
| セキュリティチェック結果 | `outputs/phase-9/security-check.md`         | 脆弱性スキャン・OWASP確認結果              |
| テスト実行ログ           | `outputs/phase-9/test-execution-log.md`     | 全テストスイートの実行結果とカバレッジ集計  |

## 完了条件

- [ ] 全品質ゲートをクリア
- [ ] セキュリティチェック完了
- [ ] 統合テスト結果が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビューゲート
````

---

## Phase 10: 最終レビューゲート

```markdown
# Phase 10: 最終レビューゲート

## メタ情報

| 項目   | 値               |
| ------ | ---------------- |
| Phase  | 10               |
| 機能名 | {{FEATURE_NAME}} |
| 作成日 | {{CREATED_DATE}} |

## 目的

実装完了後、全体的な品質・整合性を検証する。

## 判定基準

| 判定     | 条件             | 対応                                   |
| -------- | ---------------- | -------------------------------------- |
| PASS     | 全観点で問題なし | Phase 11へ進行                         |
| MINOR    | 軽微な指摘あり   | 未完了タスクとして記録後Phase 11へ進行 |
| MAJOR    | 重大な問題あり   | 影響範囲に応じて戻り先を決定           |
| CRITICAL | 致命的な問題あり | Phase 1へ戻りユーザーと要件を再確認    |

## 統合テスト連携【必須】

最終レビューで統合テスト結果を確認:

| レビュー項目 | 確認内容                  |
| ------------ | ------------------------- |
| 全テスト結果 | ユニット/統合/E2E全て成功 |
| カバレッジ   | 基準達成                  |
| 接続テスト   | フロント/バック接続成功   |

## 成果物

| 成果物       | パス                                      | 説明     |
| ------------ | ----------------------------------------- | -------- |
| レビュー結果 | `outputs/phase-10/final-review-result.md` | 判定結果 |

## 完了条件

- [ ] 全レビュー観点で確認完了
- [ ] 判定結果が記録されている
- [ ] 統合テスト結果が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 11: 手動テスト検証
```

---

## Phase 11: 手動テスト検証

````markdown
# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値               |
| ------ | ---------------- |
| Phase  | 11               |
| 機能名 | {{FEATURE_NAME}} |
| 作成日 | {{CREATED_DATE}} |

## 目的

自動テストでは検証できないユーザー体験・UI/UX・実環境動作を手動で確認し、**UI/UX品質の問題を発見・修正する**。スクリーンショットは品質改善のための手段であり、撮影自体が目的ではない。

## 実行タスク

- 機能テスト: 正常系/異常系/境界値/状態遷移の手動検証
- UI/UXテスト: レイアウト/レスポンシブ/アクセシビリティ（WCAG準拠）確認
- 統合テスト: API連携/認証フロー/データ永続化の手動確認
- リグレッションテスト: 既存機能/関連機能への影響確認
- UI/UX品質評価: UI/UX対象タスクの場合、全画面状態を撮影→品質基準で評価→問題発見→修正→再検証

## 参照資料

| 資料名         | パス                                      | 説明                           |
| -------------- | ----------------------------------------- | ------------------------------ |
| 最終レビュー   | `outputs/phase-10/final-review-result.md` | Phase 10成果物（判定結果）     |
| 設計書         | `outputs/phase-2/design.md`               | Phase 2成果物（画面設計）      |
| 実行ガイダンス | `references/phase-11-12-guide.md`         | 撮影コマンド詳細・レポート形式 |

## テストカテゴリ

- **機能テスト**: 正常系/異常系/境界値/状態遷移
- **UI/UXテスト**: レイアウト/レスポンシブ/フィードバック/アクセシビリティ
- **統合テスト**: API連携/認証連携/データ永続化
- **リグレッションテスト**: 既存機能/関連機能

## スクリーンショット撮影ガイドライン

### 適用判断

| タスク種別                    | スクリーンショット | 判断基準                           |
| ----------------------------- | ------------------ | ---------------------------------- |
| UI/UX変更あり                 | **必須**           | Rendererコンポーネントの追加・変更 |
| IPC/API変更のみ               | 推奨               | DevTools動作確認エビデンスとして   |
| バックエンド/ドキュメントのみ | 不要               | UI変更を伴わないタスク             |

### 撮影規定

| 項目           | 規定                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| 命名規則       | `TC-{番号}-{状態ラベル}-{テーマ}.png`（例: `TC-01-default-light.png`, `TC-02-default-dark.png`）          |
| 配置先         | `outputs/phase-11/screenshots/`                                                                           |
| 必須タイミング | (1) 操作後の結果状態 (2) エラー発生時のUI （※before撮影はPhase 5開始前に実施。Phase 11ではafter撮影のみ） |
| 紐付け規定     | `manual-test-result.md` のテスト結果表で **各TCに最低1枚** の証跡を紐付ける                               |

### 仕様照合チェックリスト（UI/UX変更時）

- [ ] レイアウトがPhase 2設計書の画面設計と一致
- [ ] カラーパレットがApple HIG準拠（`.claude/rules/01-architecture.md`参照）
- [ ] スペーシングが8pxグリッドに従っている
- [ ] ダークモード/ライトモード両方で確認（該当時）
- [ ] エラー状態のUI表示が設計書と一致

### 撮影コマンド

撮影は Step 3 の撮影計画（`screenshot-plan.md` または capture script の対象一覧）に基づいて一括実行するのが推奨。
個別撮影コマンドの詳細オプション（`--plan`, `--selector`, `--action`, `--action-target`, `--dark`, `--dry-run` 等）は
`references/phase-11-12-guide.md` の「スクリーンショット撮影コマンド」セクションを参照。

```bash
# 推奨: 撮影計画から一括撮影
node .claude/skills/task-specification-creator/scripts/capture-screenshots.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --plan outputs/phase-11/screenshot-plan.json
```
````

**注意**: `--plan` を使わず個別撮影する場合は、`--routes` にタスクで変更したUI画面のルートを指定すること。

### 網羅性検証コマンド（UI/UX変更タスク）

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}}
```

非視覚TCのみ例外許可する場合:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase11-screenshot-coverage.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --allow-non-visual-tc TC-08
```

### 撮影不可時の代替

CI/ビルド環境制約でElectronを起動できない場合（スクリプトが自動で `NOTE.txt` を生成）:

1. `outputs/phase-11/screenshots/NOTE.txt` に理由を記載（自動生成）
2. DevToolsログまたはテスト実行結果をエビデンスとして記録

### CLI環境でのスクリーンショット代替方法（P53対策）

CLI環境（SSHリモート、ヘッドレスサーバー等）でGUI操作によるスクリーンショットが取得できない場合、以下の優先順で代替する:

| 優先度 | 方法                                      | 条件                          |
| ------ | ----------------------------------------- | ----------------------------- |
| 1      | Playwright `page.screenshot()` スクリプト | Vite dev server 起動可能時    |
| 2      | Electron `webContents.capturePage()` API  | Electron ヘッドレス起動可能時 |
| 3      | テスト結果による間接検証                  | 上記いずれも不可の場合        |

**優先度1: Playwright による自動撮影**

```bash
# Vite dev server を起動してから Playwright で撮影
pnpm --filter @repo/desktop dev &
npx playwright test --project=screenshots
```

**優先度2: Electron API による撮影**

```typescript
// Main Process から capturePage() を呼び出すスクリプト
const image = await mainWindow.webContents.capturePage();
fs.writeFileSync("outputs/phase-11/screenshots/TC-01.png", image.toPNG());
```

**優先度3: テスト結果による間接検証**

自動テスト（Vitest / Playwright）の実行結果をエビデンスとして記録する:

- `pnpm test` の全テスト PASS 結果をコピー
- コンポーネントテストのスナップショット差分なしを確認
- `manual-test-result.md` のスクリーンショット列に「テスト結果で間接検証済み」と記載

**注意**: 優先度3は視覚的検証の代替であり、UI/UX品質の完全な保証ではない。PR レビュー時にレビュアーが実機で視覚確認することを推奨する。

### 画面カバレッジマトリクス（UI/UX変更時は必須）

> `phase-11-manual-test.md` の実際の見出しは **`## 画面カバレッジマトリクス`** を固定で使う。  
> `validate-phase11-screenshot-coverage.js` は H2 完全一致でセクション抽出するため、装飾付き見出し（例: `### ...【必須】`）は使用しない。

> **重要**: ルートベースの撮影だけでは、コンポーネントの個別UI状態が漏れる。
> 機能追加・変更した**変更コンポーネントの必須UI状態**を漏れなく撮影するため、
> 以下の4ステップで撮影計画を作成してから撮影を開始する。
>
> **実行上の制約**:
>
> - Vite dev server経由のため、IPC通信に依存するElectron固有画面は完全再現不可の場合がある
> - Playwright非対応環境では NOTE.txt で代替（前述の「撮影不可時の代替」参照）
> - before撮影はPhase 11時点では非現実的（Step 4末尾の注意事項参照）

#### Step 1: 変更コンポーネント一覧の洗い出し

Phase 5 で追加・変更した全 React コンポーネントを列挙する:

```bash
# 今回の変更で追加・変更されたコンポーネントファイルを特定
git diff main --name-only -- '*.tsx' '*.jsx' | grep -E '(components|views|pages)/'
```

| #   | コンポーネント    | 種別      | 配置ルート | 表示トリガー                           |
| --- | ----------------- | --------- | ---------- | -------------------------------------- |
| 1   | {{ComponentName}} | 新規/変更 | {{/route}} | {{常時表示/ボタンクリック/条件分岐等}} |

**完了基準**: `git diff` で検出された全コンポーネントが列挙されていること。0件の場合でも、upstream UI surface の統合再確認やユーザー要求で画面検証が必要なら representative screenshots を取得する。

#### Step 2: UI状態カバレッジの定義

各コンポーネントについて、以下の状態を確認し、該当するものを撮影対象に含める。
「該当しない」場合は N/A と明記する（**暗黙のスキップは禁止**）。
該当状態の優先度は **2軸（撮影の容易さ × 検証の価値）** で判断する:

- **[A] 高価値・容易**: 正常表示/ダーク・ライトモード/主要操作後 → **必須**
- **[B] 高価値・困難**: エラー状態/空状態/モーダル表示中 → **該当時必須**
- **[C] 低価値・容易**: フォーカス/スクロール位置 → **推奨**
- **[D] 低価値・困難**: ホバー/アニメーション中間 → **任意（N/A理由を記録すれば省略可）**

**表示状態（Visual States）**:

| 状態                   | 説明                           | 該当判定                       |
| ---------------------- | ------------------------------ | ------------------------------ |
| デフォルト表示         | コンポーネント初期表示         | **全コンポーネント必須**       |
| データあり表示         | 通常データが存在する状態       | データ表示コンポーネントは必須 |
| 空状態（Empty State）  | データ0件時の表示              | データ表示コンポーネントは必須 |
| ローディング中         | 非同期データ取得中の表示       | 非同期処理があれば必須         |
| エラー表示             | エラー発生時のUI               | エラーハンドリングがあれば必須 |
| 成功フィードバック     | 操作成功時の表示（トースト等） | CUD操作があれば必須            |
| 無効化状態（Disabled） | 操作不可時の表示               | disabled条件があれば必須       |
| 境界値表示             | 長文テキスト/大量データ/最小値 | テキスト入力・リスト表示は推奨 |

**インタラクション状態（Interaction States）**:

| 状態                    | 説明                         | 該当判定                     |
| ----------------------- | ---------------------------- | ---------------------------- |
| ホバー                  | マウスオーバー時の変化       | ホバーエフェクトがあれば必須 |
| フォーカス              | Tab/クリックでフォーカス     | フォーム要素は必須           |
| モーダル/ダイアログ表示 | ポップアップ表示中           | モーダルがあれば必須         |
| ドロップダウン展開      | セレクト/メニュー展開中      | ドロップダウンがあれば必須   |
| フォーム入力中          | バリデーションメッセージ表示 | フォームがあれば必須         |
| 確認ダイアログ          | 破壊的操作の確認表示         | 削除等の操作があれば必須     |

**テーマ状態（Theme States）**:

| 状態         | 説明          | 該当判定                 |
| ------------ | ------------- | ------------------------ |
| ライトモード | テーマ: light | **全コンポーネント必須** |
| ダークモード | テーマ: dark  | **全コンポーネント必須** |

#### Step 3: 撮影計画の作成

Step 1-2 のマトリクスから、具体的な撮影計画を `outputs/phase-11/screenshot-plan.json` に作成する:
Step 1-2 のマトリクスから、具体的な撮影計画を `outputs/phase-11/screenshot-plan.md` へ整理し、必要なら自動撮影用 `screenshot-plan.json` か task 専用 capture script の対象一覧へ落とし込む:

**テーブル形式（manual-test-result.md に記載）**:

| テストケース | コンポーネント | 状態           | 撮影方法                     | テーマ | ファイル名                |
| ------------ | -------------- | -------------- | ---------------------------- | ------ | ------------------------- |
| TC-01        | {{Component}}  | デフォルト表示 | route: /xxx                  | light  | `TC-01-default-light.png` |
| TC-02        | {{Component}}  | デフォルト表示 | route: /xxx --dark           | dark   | `TC-02-default-dark.png`  |
| TC-03        | {{Component}}  | エラー表示     | route: /xxx + エラー操作     | light  | `TC-03-error-light.png`   |
| TC-04        | {{Component}}  | モーダル表示   | route: /xxx + ボタンクリック | light  | `TC-04-modal-light.png`   |
| TC-05        | {{Component}}  | 空状態         | route: /xxx（データなし）    | light  | `TC-05-empty-light.png`   |

**撮影計画の命名規則**: `TC-{番号}-{状態ラベル}-{テーマ}.png`

**整合ルール（必須）**:

- `manual-test-result.md` の先頭列は `テストケース`（推奨）または `TC-ID`/`TC` を使用する（`validate-phase11-screenshot-coverage.js` 互換）
- 証跡ファイル名は、実際に撮影した状態と意味を一致させる（例: 未保存離脱ダイアログは `*-unsaved-dialog-*.png`）

**JSON形式（一括自動撮影用）**:

```json
{
  "taskId": "{{TASK_ID}}",
  "components": [
    {
      "name": "{{ComponentName}}",
      "route": "/xxx",
      "states": [
        { "id": "TC-01", "label": "default", "theme": "light" },
        { "id": "TC-02", "label": "default", "theme": "dark" },
        {
          "id": "TC-03",
          "label": "error",
          "theme": "light",
          "action": "click",
          "actionTarget": "[data-testid='trigger-error']",
          "waitAfterAction": 500
        },
        {
          "id": "TC-04",
          "label": "modal-open",
          "theme": "light",
          "action": "click",
          "actionTarget": "[data-testid='open-modal']"
        },
        {
          "id": "TC-05",
          "label": "empty",
          "theme": "light",
          "note": "データなし状態でアプリ起動後に撮影"
        },
        {
          "id": "TC-06",
          "label": "component-detail",
          "theme": "light",
          "selector": "[data-testid='my-component']",
          "note": "要素単位キャプチャ（selectorでコンポーネントを指定）"
        }
      ]
    }
  ]
}
```

撮影コマンドの詳細は `references/phase-11-12-guide.md` の「スクリーンショット撮影コマンド」セクションを参照。

#### Step 4: 画面カバレッジレポート

撮影完了後、以下のカバレッジを算出して `outputs/phase-11/screenshot-coverage.md` に記録する:

| カバレッジ種別                                 | 対象数    | 撮影数    | カバレッジ率 | 基準         |
| ---------------------------------------------- | --------- | --------- | ------------ | ------------ |
| コンポーネントカバレッジ                       | {{N}}     | {{M}}     | {{%}}        | **100%必須** |
| 表示状態カバレッジ（該当必須項目）             | {{N}}     | {{M}}     | {{%}}        | **100%必須** |
| インタラクション状態カバレッジ（該当必須項目） | {{N}}     | {{M}}     | {{%}}        | **100%必須** |
| テーマカバレッジ                               | {{N}}     | {{M}}     | {{%}}        | **100%必須** |
| **総合カバレッジ**                             | **{{N}}** | **{{M}}** | **{{%}}**    | **100%必須** |

**N/A理由テーブル**（該当しないと判定した状態の根拠を全て記録）:

| コンポーネント | スキップした状態 | N/A理由                  |
| -------------- | ---------------- | ------------------------ |
| {{Component}}  | ローディング中   | 同期処理のみのため非該当 |

**完了基準**: 全カバレッジ種別で該当必須項目（優先度[A][B]）の**100%撮影**が完了していること。推奨[C]・任意[D]はN/A理由の記録で代替可。

> **before撮影に関する注意**: Phase 11の時点で実装は完了済みのため、mainブランチに
> 切り替えてbefore撮影を行うのは非現実的。before撮影が必要な場合は、**Phase 5（実装）
> 開始前にmainブランチのスクリーンショットを事前に撮影しておく**こと。
> Phase 11ではafter撮影のみを実施する。

## 統合テスト連携【必須】

手動統合テスト（UI/API接続）を確認:

| テスト項目         | 確認内容                          | 期待結果             | 実行結果   |
| ------------------ | --------------------------------- | -------------------- | ---------- |
| API接続            | エンドポイント疎通                | 200レスポンス        | {{RESULT}} |
| 認証フロー         | ログイン→トークン取得→API呼び出し | 正常完了             | {{RESULT}} |
| データ永続化       | 保存→リロード→表示                | データ保持           | {{RESULT}} |
| エラーハンドリング | API障害時のUI表示                 | エラーメッセージ表示 | {{RESULT}} |
| 状態同期           | 複数タブでの同期                  | リアルタイム反映     | {{RESULT}} |

## テストケーステンプレート

| No          | カテゴリ          | テスト項目    | 前提条件         | 操作手順  | 期待結果     | 実行結果   | スクリーンショット | 備考      |
| ----------- | ----------------- | ------------- | ---------------- | --------- | ------------ | ---------- | ------------------ | --------- |
| {{TEST_NO}} | {{TEST_CATEGORY}} | {{TEST_NAME}} | {{PRECONDITION}} | {{STEPS}} | {{EXPECTED}} | {{ACTUAL}} | {{SCREENSHOT}}     | {{NOTES}} |

## 成果物

| 成果物             | パス                                      | 必須   | 説明                                  |
| ------------------ | ----------------------------------------- | ------ | ------------------------------------- |
| テスト結果         | `outputs/phase-11/manual-test-result.md`  | 必須   | 手動テスト結果                        |
| 発見課題一覧       | `outputs/phase-11/discovered-issues.md`   | 必須   | 発見した課題（0件でも出力）           |
| スクリーンショット | `outputs/phase-11/screenshots/`           | 条件付 | UI/UX変更時は必須、それ以外は任意     |
| 撮影計画           | `outputs/phase-11/screenshot-plan.md` または capture script 対象一覧 | 条件付 | UI/UX変更時は必須（画面カバレッジ用） |
| カバレッジレポート | `outputs/phase-11/screenshot-coverage.md` | 条件付 | UI/UX変更時は必須（100%達成確認用）   |

## 完了条件

- [ ] すべてのテストケースが実行済み
- [ ] すべてのテストケースがPASS
- [ ] 統合テスト手動確認が完了
- [ ] UI/UX対象タスクの場合: `git diff` で変更コンポーネント一覧を洗い出し済み、または representative screenshots の対象UI surface を列挙済み
- [ ] UI/UX対象タスクの場合: 各コンポーネント/画面の全UI状態（表示/インタラクション/テーマ）を列挙済み（N/A理由も記録）
- [ ] UI/UX対象タスクの場合: 撮影計画 `screenshot-plan.md` または capture script の対象一覧が作成済み
- [ ] UI/UX対象タスクの場合: 撮影計画の**全項目**のスクリーンショットが `outputs/phase-11/screenshots/` に配置済み
- [ ] UI/UX対象タスクの場合: 各TCにスクリーンショット証跡が紐付き、`validate-phase11-screenshot-coverage.js` がPASS
- [ ] UI/UX対象タスクの場合: 画面カバレッジレポートの必須項目（優先度[A][B]）が**100%**（推奨[C]・任意[D]はN/A記録で代替可）
- [ ] UI/UX対象タスクの場合: 各スクリーンショットに対してUI/UX品質評価を実施済み（仕様照合チェックリスト全項目確認）
- [ ] UI/UX対象タスクの場合: 品質評価で発見したUI/UX問題を全て修正済み（または `discovered-issues.md` に記録済み）
- [ ] UI/UX対象タスクの場合: 修正後の再撮影が完了し、品質基準をクリアしていることを確認済み
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新

`````

---

## Phase 12: ドキュメント更新

````markdown
# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値               |
| ------ | ---------------- |
| Phase  | 12               |
| 機能名 | {{FEATURE_NAME}} |
| 作成日 | {{CREATED_DATE}} |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P26: システム仕様書更新遅延
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成

## 実行タスク

| Task | 内容 | 主成果物 |
| ---- | ---- | -------- |
| Task 12-1 | 技術ドキュメント作成（実装ガイド作成） | `outputs/phase-12/implementation-guide.md` |
| Task 12-2 | システムドキュメント更新（aiworkflow-requirements 等） | `outputs/phase-12/spec-update-summary.md` |
| Task 12-3 | ドキュメント更新履歴作成 | `outputs/phase-12/documentation-changelog.md` |
| Task 12-4 | 未タスク検出（残課題の検出と記録） | `outputs/phase-12/unassigned-task-detection.md` |
| Task 12-5 | スキルフィードバックレポート作成 | `outputs/phase-12/skill-feedback-report.md` |

- Task 12-1: 技術ドキュメント作成（実装ガイド作成）
- Task 12-2: システムドキュメント更新（aiworkflow-requirements等の更新）
- Task 12-3: ドキュメント更新履歴作成（変更履歴の記録）
- Task 12-4: 未タスク検出（残課題の検出と記録）
- Task 12-5: スキルフィードバックレポート作成（ワークフロー改善点と技術的教訓の記録）

> **必須**: 実行タスクは「表」と「`- Task 12-X:` 箇条書き」を**両方**残すこと（表のみ・箇条書きのみは不合格）。

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**テンプレート**: `assets/implementation-guide-template.md`

**validator 安定化ルール（Task 1）**:
- Part 1 の「日常の例え」段落には `たとえば` を最低1回含める
- Part 1 は「なぜ必要か」→「何をするか」の順序を維持する

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**2ステップで実行**（両方必須確認）:

#### Step 1: タスク完了記録【必須・全タスク】

##### Step 1-A: 仕様書完了記録
- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.mdにタスク完了記録を追加（**2ファイル両方必須** -- P1, P25）
- [ ] aiworkflow-requirements/SKILL.md 変更履歴更新
- [ ] task-specification-creator/SKILL.md 変更履歴更新

**4ファイル更新確認コマンド**（P1/P25/P29 対策 — 更新後に必ず実行）:

```bash
# LOGS.md × 2 + SKILL.md × 2 に TASK_ID が含まれているか確認
grep -rn "{{TASK_ID}}" \
  .claude/skills/aiworkflow-requirements/LOGS.md \
  .claude/skills/task-specification-creator/LOGS.md \
  .claude/skills/aiworkflow-requirements/SKILL.md \
  .claude/skills/task-specification-creator/SKILL.md
# → 4ファイル全てにマッチしなければ更新漏れ
```

##### Step 1-B: 実装状況テーブル更新（該当する場合）
- [ ] api-endpoints.md等の実装ステータスを「完了」に更新

##### Step 1-C: 関連タスクテーブル更新（該当する場合）
- [ ] `grep -rn "TASK_ID" references/` で関連仕様書を検索して更新
- [ ] 未タスクIDがある場合、配置先判定を記録（未完了=`docs/30-workflows/unassigned-task/`、completed workflow 由来の継続 backlog=`docs/30-workflows/completed-tasks/<workflow>/unassigned-task/`、完了済み standalone UT=`docs/30-workflows/completed-tasks/*.md`、legacy=`docs/30-workflows/completed-tasks/unassigned-task/`）
- [ ] completed-only area（`docs/30-workflows/completed-tasks/*.md` と `docs/30-workflows/completed-tasks/unassigned-task/`）に未完了指示書（`未実施` / `未着手`）が混在していないことを確認

**検索コマンド例**（TASK_IDを実際のタスクIDに置換して実行）:
```bash
# 関連仕様書の検索（references/配下）
grep -rn "TASK-UI-03" .claude/skills/aiworkflow-requirements/references/

# 残課題テーブルでの参照検索（task-workflow.md）
grep -n "TASK-UI-03" .claude/skills/aiworkflow-requirements/references/task-workflow.md

# 未タスク指示書の関連検索
grep -rn "TASK-UI-03" docs/30-workflows/unassigned-task/

# 完了タスク配下の関連検索
grep -rn "TASK-UI-03" docs/30-workflows/completed-tasks/
`````

##### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** -- P2, P27）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されていることを確認

```markdown
## 完了タスク

### タスク: {{TASK_NAME}}（{{COMPLETION_DATE}}完了）

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| タスクID   | {{TASK_ID}}                  |
| ステータス | **完了**                     |
| テスト数   | {{N}}（自動）+ {{N}}（手動） |

> **注意**: テスト数は `pnpm test` 実行結果の実測値のみを記載すること。推定値・概算値は使用不可。
```

````

#### Step 2: システム仕様更新【条件付き】

以下の判断基準で更新要否を判断:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

- 更新対象: `.claude/skills/aiworkflow-requirements/references/`
- 更新対象: `docs/00-requirements/` 配下
- 更新原則: 概要のみ記載、Single Source of Truth遵守
- **更新不要の場合**: `documentation-changelog.md` に「更新なし」と理由を明記

> **SKILL 検証**: `spec-update-workflow.md` Step 1-G.3 に定義された正規経路コマンドで3スキル全てが Error 0件であることを確認する。

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

ドキュメント更新履歴（documentation-changelog.md）を作成し、artifacts.jsonを更新する:

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/{{FEATURE_NAME}}

# Step 2: Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/{{FEATURE_NAME}} \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**artifacts.json必須項目**:
- Phase 12のステータスが`completed`に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics`セクションに品質指標が記録されていること

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を作成（TASK-4-1形式を参照）
- 更新したドキュメントと変更内容を一覧化

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

### Task 5: スキルフィードバックレポート作成【必須】

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可）。**

| セクション         | 記載内容                                             |
| ------------------ | ---------------------------------------------------- |
| ワークフロー改善点 | Phase実行中に発見したワークフロー上の改善提案         |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                  |
| スキル改善提案     | task-specification-creator/skill-creatorへの改善提案  |
| 新規Pitfall候補    | 06-known-pitfalls.mdに追加すべき新規Pitfall           |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

### IPC機能開発時の追加更新対象ファイル（該当する場合）

IPC チャンネルの追加・変更を伴うタスクの場合、Task 2 Step 2 で以下のファイルの更新要否を確認する:

| # | 更新対象ファイル                          | 更新内容                                                 | 必須/任意 |
|---|-------------------------------------------|----------------------------------------------------------|-----------|
| 1 | `api-ipc-agent.md`                        | 新規チャンネル一覧、型定義、完了タスク記録               | 必須      |
| 2 | `security-electron-ipc.md`                | セキュリティ検証パターン（sender検証、ホワイトリスト）   | 必須      |
| 3 | `architecture-overview.md`                | IPCハンドラー登録一覧（registerAllIpcHandlers）           | 必須      |
| 4 | `interfaces-agent-sdk-skill.md`           | インターフェース定義、完了タスク記録                     | 必須      |
| 5 | `task-workflow.md`                        | 残課題テーブル更新、完了タスクセクション追加             | 必須      |
| 6 | `lessons-learned.md`                      | 実装教訓（新規パターン・落とし穴がある場合）             | 任意      |
| 7 | `architecture-implementation-patterns.md` | 実装パターン（新規パターンがある場合）                   | 任意      |

## アーキテクチャ層別ドキュメント（AIが判断）

実装ガイドPart 2（技術的詳細）では、タスクの性質に応じて以下の層別にドキュメントを作成する：

| 層                 | ドキュメント内容                            | 更新対象                        |
| ------------------ | ------------------------------------------- | ------------------------------- |
| Renderer Process   | コンポーネント設計、状態管理、Hooks使用方法 | `ui-ux-*.md`, `interfaces-*.md` |
| Main Process       | サービス設計、ビジネスロジック、API仕様     | `architecture-*.md`, `api-*.md` |
| IPC通信            | チャンネル定義、リクエスト/レスポンス型     | `interfaces-*.md`, `api-*.md`   |
| Preload            | 公開API一覧、セキュリティ考慮事項           | `security-api-electron.md`      |
| データ層           | スキーマ定義、リポジトリパターン            | `database-*.md`                 |
| エラーハンドリング | エラーコード、エラーメッセージ、復旧手順    | `error-handling.md`             |

## 成果物

| 成果物                     | パス                                            | 必須 | 説明                         |
| -------------------------- | ----------------------------------------------- | ---- | ---------------------------- |
| 実装ガイド                 | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント    |
| ドキュメント更新履歴       | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                     |
| 未タスク検出レポート       | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）     |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ✅   | 改善点（なしでも出力必須）   |
| 未完了タスク指示書         | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成               |

## 完了条件

- [ ] 実行タスクを「表」と「`- Task 12-X:` 箇条書き」の両方で記載している
- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] 実装ガイドのテストカテゴリテーブルがPhase 6後の実測値を反映している
- [ ] **【Task 2 Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/SKILL.md変更履歴テーブルを更新した** ⚠️ 漏れやすい（P29）
- [ ] **【Task 2 Step 1】task-specification-creator/SKILL.md変更履歴テーブルを更新した** ⚠️ 漏れやすい（P29）
- [ ] **【Task 2 Step 1-D】topic-map.mdを再生成した** ⚠️ 漏れやすい（P2, P27参照）
  - 再生成トリガー: セクション追加/削除/更新、行数変更
  - コマンド: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した（該当する場合）**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **アーキテクチャ層別のドキュメントが作成されている（該当する層のみ）**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）
- [ ] 未タスク配置先判定（未完了=`docs/30-workflows/unassigned-task/` / completed workflow 由来の継続 backlog=`docs/30-workflows/completed-tasks/<workflow>/unassigned-task/` / 完了済み standalone UT=`docs/30-workflows/completed-tasks/*.md` / legacy=`docs/30-workflows/completed-tasks/unassigned-task/`）を記録した
- [ ] **スキルフィードバックレポートが出力されている**【必須・改善点なしでも作成】
- [ ] artifacts.jsonが更新されている
- [ ] **artifacts.jsonの全完了Phase（1-12）のステータスがcompletedであること**
- [ ] **苦戦箇所セクションを記録した**（下記参照）
- [ ] **本Phase内の全タスクを100%実行完了**

## 苦戦箇所の記録【推奨】

タスク実行中に苦戦した箇所があれば、以下に記録する。将来の類似タスクの参考になる。

### 記録テンプレート

```markdown
## 苦戦箇所

### 1. {{問題の概要}}

- **症状**: {{発生した問題の具体的な症状}}
- **原因**: {{問題の根本原因}}
- **解決策**: {{採用した解決策}}
- **学び**: {{将来のタスクへの教訓}}
- **関連Pitfall**: {{該当する場合はPitfall ID（例: P31）}}
```

### 記録が特に有用なケース

| ケース | 記録すべき内容 |
| ------ | -------------- |
| 予期しないエラー | エラーメッセージ、原因、解決策 |
| 仕様理解の齟齬 | 誤解の内容、正しい理解、確認方法 |
| 設計変更 | 変更前後の設計、変更理由 |
| 時間のかかった調査 | 調査内容、発見方法、参考資料 |
| 06-known-pitfalls.mdに追加すべき教訓 | Pitfall ID候補、パターン、対策 |

### 苦戦箇所を未タスク化する3ステップ（P3準拠）

苦戦箇所を記録した場合は、以下を同一ターンで実行する。

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成する
2. `task-workflow.md` の残課題テーブルへ登録する
3. 関連仕様書に未タスク参照リンクを追加する

苦戦箇所が0件の場合でも、成果物に「苦戦箇所なし（0件）」を明記する。

📖 **参考**: `.claude/rules/06-known-pitfalls.md`、`references/patterns.md`

## 漏れやすいポイント（06-known-pitfalls.md参照）

| ID | ポイント | 対策 |
| -- | -------- | ---- |
| P1 | LOGS.md 2ファイル更新漏れ | aiworkflow-requirements + task-specification-creator 両方を同時更新 |
| P2 | topic-map.md 再生成忘れ | セクション変更時は必ず `generate-index.js` を実行 |
| P27 | topic-map.md 再生成トリガー判断ミス | 追加だけでなく削除・更新も再生成トリガー |
| P29 | SKILL.md 変更履歴の更新漏れ | LOGS.md とは別に SKILL.md の変更履歴テーブルも必ず更新 |
| P3 | 未タスク管理の3ステップ不完全 | ①指示書 → ②task-workflow.md登録 → ③関連仕様書リンク |

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成（`outputs/phase-12/documentation-changelog.md`の形式に従う）                  |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                    |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                                   |

#### スキル検証

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

判定基準: `spec-update-workflow.md` Step 1-G.3.1 を参照。

## 次のPhase

Phase 13: PR作成

````

---

## Phase 13: PR作成

```markdown
# Phase 13: PR作成

## メタ情報

| 項目   | 値               |
| ------ | ---------------- |
| Phase  | 13               |
| 機能名 | {{FEATURE_NAME}} |
| 作成日 | {{CREATED_DATE}} |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てからPull Requestを作成し、CIを確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示しPR作成の許可を確認
- PR作成: ユーザーの許可後に`/ai:diff-to-pr`を実行
- CI確認: CIが通過したことを確認

## 参照資料

| 資料名       | パス                                          | 説明           |
| ------------ | --------------------------------------------- | -------------- |
| 最終レビュー | `outputs/phase-10/final-review-result.md`     | Phase 10成果物 |
| 手動テスト   | `outputs/phase-11/manual-test-result.md`      | Phase 11成果物 |
| ドキュメント | `outputs/phase-12/documentation-changelog.md` | Phase 12成果物 |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼【必須】

PR作成前に、ユーザーにローカル環境での動作確認を依頼する。

### 2. 変更サマリーの提示と許可確認【必須】

変更内容のサマリーを提示し、PRを作成してよいかユーザーに確認する。

**重要**: ユーザーから明示的な許可を得るまでPR作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR作成を実行する。
```

/ai:diff-to-pr

````

**PR作成時の自動投稿内容（`/ai:diff-to-pr`）**:

1. **PR本文**（`.github/pull_request_template.md` 準拠）:
   概要・変更内容・変更タイプ・テスト・関連 Issue・破壊的変更・（UI/UX変更時のみ）スクリーンショット・チェックリスト・その他
2. **PRコメント1**: 実装の詳細・レビュー注意点・テスト方法・参考資料
3. **PRコメント2**（Phase 12成果物あり時）: implementation-guide.md の全文
4. **PRコメント3**（Phase 11スクリーンショットあり時）: スクリーンショットギャラリー

**PR本文セクション連携ルール（必須）**:

- `/ai:diff-to-pr` の Phase 3.6 で、staged差分から `TARGET_WORKFLOW_DIR` を1件特定する
- Phase 11/12成果物パス（`implementation-guide.md` / `screenshot-coverage.md` / `screenshots/`）は `TARGET_WORKFLOW_DIR` 配下のみ参照する
- PR本文 `## その他` に、Phase 12 実装ガイド反映元パスと要点（Part 1/Part 2）を必ず記載する
- `implementation-guide.md` の全文を PRコメントとして必ず投稿し、`## 📖 実装ガイド（全文）` 見出しと Part 1/Part 2 を含むことを `gh api .../issues/<PR_NUMBER>/comments` で検証する
- UI/UX変更時は `outputs/phase-11/screenshots/*.png` を検出し、PR本文 `## スクリーンショット` に画像リンクを自動挿入する
- PR本文/PRコメントで画像を埋め込む場合は `raw.githubusercontent.com/<repo>/<commit>/<path>` の絶対URLを使う（相対パス直貼りは禁止）
- UI/UX変更がない場合は PR本文 `## スクリーンショット` セクションを削除する
- workflow候補が複数ある場合は、PR作成前にユーザーへ対象workflowを確認する

### 4. 実行結果の確認

- PRが作成されていること
- CIが通過していること

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLIで手動対応する。

## 成果物

| 成果物 | パス                          | 説明     |
| ------ | ----------------------------- | -------- |
| PR情報 | `outputs/phase-13/pr-info.md` | PR URL等 |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示しPR作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PRが作成されている
- [ ] CIが通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリがcompleted-tasksに移動されている
- [ ] **本Phase内の全作業を100%完了（PR作成・CI確認・移動）**

## タスク完了処理【必須】

**PRが作成され、CIが通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリをcompleted-tasksに移動
mv docs/30-workflows/{{TASK_NAME}}/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep {{TASK_NAME}}

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): {{TASK_NAME}}をcompleted-tasksに移動"
git push
````

## 次のPhase
## 変数一覧

| 変数 | 意味 |
| --- | --- |
| `{{TASK_ID}}` | workflow 全体の task ID |
| `{{FEATURE_NAME}}` | workflow ディレクトリ名 |
| `{{PHASE_NAME}}` | phase 名称 |
| `{{ARTIFACT_PATH}}` | `outputs/phase-N/...` の相対パス |
| `{{SYSTEM_SPEC_PATH}}` | aiworkflow-requirements 側の更新対象 |

## 関連テンプレート

- [../assets/phase-spec-template.md](../assets/phase-spec-template.md)
- [../assets/main-task-template.md](../assets/main-task-template.md)
- [../assets/review-result-template.md](../assets/review-result-template.md)
- [../assets/implementation-guide-template.md](../assets/implementation-guide-template.md)
- [../assets/documentation-changelog-template.md](../assets/documentation-changelog-template.md)

## 変更履歴

| Date | Changes |
| --- | --- |
| 2026-03-18 | 1241行のmonolithからインデックス+共通構造に縮小。Phase 7-13テンプレート本文をファミリーファイルに完全移管 |
| 2026-03-12 | 1818行の monolith から family file 構成へ再編 |
