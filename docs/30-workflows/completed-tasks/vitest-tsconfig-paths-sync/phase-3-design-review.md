# Phase 3: 設計レビュー - UT-FIX-TS-VITEST-TSCONFIG-PATHS-001

## メタ情報

| 項目      | 内容                                |
| --------- | ----------------------------------- |
| Phase     | 3                                   |
| 機能名    | vitest-tsconfig-paths-sync          |
| 作成日    | 2026-02-24                          |
| タスクID  | UT-FIX-TS-VITEST-TSCONFIG-PATHS-001 |
| 前提Phase | Phase 2（設計）完了済み             |

## 目的

Phase 1（要件定義）と Phase 2（設計）の成果物を多角的にレビューし、PASS / MINOR / MAJOR 判定を行う。設計の妥当性・実現可能性・既存システムへの影響を検証する。

## 実行タスク

- タスク一覧: 以下のTask 1以降を順に実行し、各成果物を生成する。

### Task 1: 要件充足レビュー

Phase 2 の設計が Phase 1 の全要件（FR-1〜FR-4 / NFR-1〜NFR-4）を充足しているか検証する。

### Task 2: 技術的妥当性レビュー

設計の技術的実現可能性と、プロジェクトアーキテクチャ（三層モジュール解決）との整合性を検証する。

### Task 3: 影響範囲レビュー

既存テスト（224件）・CI パイプライン・開発ワークフローへの影響を評価する。

### Task 4: 判定

レビュー結果に基づき PASS / MINOR / MAJOR 判定を行い、Phase 4 への移行可否を決定する。

## 参照資料

| 資料                   | パス                                                                         | 用途                          |
| ---------------------- | ---------------------------------------------------------------------------- | ----------------------------- |
| Phase 1 要件定義       | `outputs/phase-1/requirements.md`                                            | 要件充足の検証基準            |
| Phase 2 設計書         | `outputs/phase-2/design-document.md`                                         | レビュー対象                  |
| 既存チェックスクリプト | `scripts/check-shared-module-sync.ts`                                        | エクスポート API の互換性確認 |
| 既存テスト             | `scripts/__tests__/check-shared-module-sync.test.ts`                         | テスト互換性確認              |
| CI設定                 | `.github/workflows/ci.yml`                                                   | CI パイプライン影響確認       |
| vitest設定             | `apps/desktop/vitest.config.ts`                                              | 変更対象の現状確認            |
| 三層アーキテクチャ仕様 | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | 設計整合性の正本              |
| 品質要件仕様           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 品質基準の正本                |
| CI/CD仕様              | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`     | CI整合性レビューの正本        |

## 実行手順

### Step 1: 要件充足マトリクス

Phase 2 の設計が Phase 1 の各要件を充足しているかをマトリクスで検証する。

#### 機能要件充足

| 要件ID | 要件名               | パターン A での充足 | パターン B での充足 | 検証観点                                             |
| ------ | -------------------- | ------------------- | ------------------- | ---------------------------------------------------- |
| FR-1   | プラグイン導入評価   | 直接実現            | 代替案として実現    | 評価基準6項目が定義され、分岐条件が明確か            |
| FR-2   | 余剰エントリ解消     | 実現可能            | 実現可能            | 削除前確認手順が定義されているか                     |
| FR-3   | pnpm スクリプト追加  | 実現可能            | 実現可能            | スクリプト名・ランナー・終了コードが設計されているか |
| FR-4   | 運用手順ドキュメント | 実現可能            | 実現可能            | パターン A/B 両方の手順が設計されているか            |

**検証ポイント**:

- [ ] FR-1: パターン A の評価基準6項目が Phase 1 の基準と一致しているか
- [ ] FR-1: パターン A 不合格時のパターン B フォールバック手順が明確か
- [ ] FR-2: 余剰エントリの削除前確認が4ステップ（grep検索 → 代替パス確認 → 移行 or 削除）で網羅的か
- [ ] FR-3: `check:module-sync` の終了コードが既存スクリプトの `process.exitCode` 設定と一致するか
- [ ] FR-4: サブパス追加手順がパターン A（3ステップ）/ B（5ステップ）で分岐記載されているか

#### 非機能要件充足

| 要件ID | 要件名         | 設計での充足 | 検証観点                                           |
| ------ | -------------- | ------------ | -------------------------------------------------- |
| NFR-1  | パフォーマンス | 充足         | テスト実行時間 +10% 以内の測定方法が設計されている |
| NFR-2  | 保守性         | 充足         | 変更ファイル数が設計で明示されている               |
| NFR-3  | 後方互換性     | 充足         | エクスポート API 変更なしが明記されている          |
| NFR-4  | 開発者体験     | 充足         | エラーメッセージ改善が設計されている               |

**検証ポイント**:

- [ ] NFR-1: パフォーマンス測定の before/after 比較手順が実行可能か
- [ ] NFR-2: パターン A の「変更2ファイル」が正確か（exports + typesVersions = 2ファイル、だが paths も変更必要では?）
- [ ] NFR-3: `check-shared-module-sync.ts` のエクスポート関数（`parseExports`, `parsePaths`, `parseAliases`, `parseTypesVersions`, `checkExportsVsPaths`, `checkPathsVsExports`, `checkExportsVsAliases`, `checkAliasesVsExports`, `checkExportsVsTypesVersions`, `formatReport`, `printSummary`, `main`）のシグネチャが変更されないことの確認
- [ ] NFR-4: エラーメッセージのフォーマット例が設計に含まれているか

### Step 2: 技術的妥当性レビュー

#### 2-1. vite-tsconfig-paths プラグイン互換性

| レビュー項目                            | 確認事項                                                                          | リスク等級 |
| --------------------------------------- | --------------------------------------------------------------------------------- | ---------- |
| Vitest バージョン互換                   | 現行 Vitest バージョンと `vite-tsconfig-paths` の互換性マトリクスを確認           | 中         |
| tsconfig `extends` 対応                 | desktop の tsconfig が `extends` を使用している場合、プラグインが正しく解決するか | 低         |
| `resolve.alias` との優先順位            | 手動 alias（`@`, `@renderer` 等）とプラグイン自動 alias の競合がないか            | 中         |
| `@anthropic-ai/claude-agent-sdk` モック | テスト用モックパスが tsconfig paths ではなく alias で定義されることの確認         | 低         |
| monorepo ルート tsconfig                | プラグインがどの tsconfig を読み込むか（desktop の tsconfig のみか？）            | 中         |

**検証ポイント**:

- [ ] プラグインが `apps/desktop/tsconfig.json` の `compilerOptions.paths` のみを読み込むことを確認する方法が設計されているか
- [ ] `resolve.alias` に定義されたエントリがプラグインの自動解決より優先されることが保証されているか（Vite の仕様として `resolve.alias` が plugins より優先）
- [ ] `@repo/shared/types/llm/schemas` のような3階層以上のサブパスが正しく解決されるか

#### 2-2. 既存スクリプトとの整合性

| レビュー項目                      | 確認事項                                                                          |
| --------------------------------- | --------------------------------------------------------------------------------- |
| alias 0件時のチェック3/4 スキップ | `parseAliases()` が空 Map を返した場合、チェック3/4 を SKIP する設計は妥当か      |
| エラーメッセージのフォーマット    | 既存の `formatReport()` の出力形式を壊さずに Action ヒントを追加できるか          |
| 既存テスト（43件）への影響        | `formatReport()` の出力変更により、出力文字列をアサートしているテストが壊れないか |

**検証ポイント**:

- [ ] `formatReport()` のテストが出力文字列の完全一致でアサートしているか、部分一致かを確認
- [ ] alias 0件時に `checkExportsVsAliases` / `checkAliasesVsExports` がエラーではなく PASS を返す設計が妥当か（空集合の検証は論理的に PASS）

#### 2-3. pnpm スクリプトの設計妥当性

| レビュー項目              | 確認事項                                                                         |
| ------------------------- | -------------------------------------------------------------------------------- |
| `tsx` の依存              | ルート package.json に `tsx` が devDependencies にあるか                         |
| CI との整合性             | CI は `pnpm tsx scripts/...` で実行。`pnpm check:module-sync` は同じ結果を返すか |
| 既存 scripts との命名規則 | `check:` プレフィックスが既存の scripts 命名規則に合致するか                     |

### Step 3: 影響範囲レビュー

#### 3-1. テスト影響

| テストカテゴリ                  | テスト数 | 影響予測                                                                                                   |
| ------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| module-resolution               | 57件     | パターン A: alias 解決方法が変わるため要確認。パターン B: 影響なし                                         |
| shared-module-resolution        | 59件     | パターン A: 同上。パターン B: 影響なし                                                                     |
| vitest-alias-consistency        | 108件    | パターン A: alias 定義が削減されるため、alias の存在チェックテストが FAIL する可能性。パターン B: 影響なし |
| check-shared-module-sync テスト | 43件     | エラーメッセージ変更により出力アサートが壊れる可能性                                                       |

**リスク指摘**:

- [ ] **RV-1**: vitest-alias-consistency テスト（108件）は `vitest.config.ts` の alias エントリを直接検証している可能性がある。プラグイン導入で alias が削除された場合、テスト自体の修正が必要か
- [ ] **RV-2**: check-shared-module-sync テスト（43件）のうち、`formatReport()` の出力を検証するテストは、エラーメッセージ改善により修正が必要か

#### 3-2. CI パイプライン影響

| CI ジョブ         | 影響予測                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| check-module-sync | パターン A: alias 0件により チェック3/4 が SKIP される可能性。ジョブの PASS/FAIL ロジックに影響しないか |
| build             | 依存関係に変更なし。check-module-sync は build の needs に含まれるが、ジョブ自体の動作は変わらない      |
| test              | パターン A: テスト実行時の alias 解決方法が変わる。CI 環境でもプラグインが正しく動作するか              |

#### 3-3. 開発ワークフロー影響

| ワークフロー       | 影響予測                                                                              |
| ------------------ | ------------------------------------------------------------------------------------- |
| ローカルテスト実行 | パターン A: プラグイン導入により alias 解決が暗黙的になるが、開発者の操作は変わらない |
| 新規サブパス追加   | パターン A: 変更ファイルが4→2に減少し、作業が簡素化される                             |
| コードレビュー     | vitest.config.ts の差分が大きくなるが、削除のみなので理解は容易                       |

### Step 4: セキュリティレビュー

| レビュー項目           | 確認事項                                                                          |
| ---------------------- | --------------------------------------------------------------------------------- |
| 依存パッケージの信頼性 | `vite-tsconfig-paths` の npm ダウンロード数・メンテナンス状況・既知の脆弱性を確認 |
| スクリプト実行の安全性 | `check-shared-module-sync.ts` は fs.readFileSync のみ使用（書き込み・実行なし）   |
| サプライチェーンリスク | 新規依存パッケージがビルド成果物に含まれるか（devDependencies のみなら影響なし）  |

### Step 5: 判定

#### 判定基準

| 判定  | 条件                                                                                |
| ----- | ----------------------------------------------------------------------------------- |
| PASS  | 全要件充足・技術的妥当・影響範囲が管理可能                                          |
| MINOR | 軽微な指摘があるが Phase 4 に進行可能。指摘事項は未タスク化                         |
| MAJOR | 要件未充足 or 技術的問題がある。Phase 1（要件問題）or Phase 2（設計問題）へ差し戻し |

#### レビュー指摘テンプレート

```markdown
### 指摘 RV-N: {{タイトル}}

- **深刻度**: MINOR / MAJOR
- **カテゴリ**: 要件充足 / 技術的妥当性 / 影響範囲 / セキュリティ
- **詳細**: （指摘の詳細）
- **推奨対応**: （対応方針）
- **差し戻し先**: （MAJOR の場合のみ: Phase 1 or Phase 2）
```

#### 想定される指摘事項

##### 指摘 RV-1: vitest-alias-consistency テストの影響調査不足

- **深刻度**: MINOR
- **カテゴリ**: 影響範囲
- **詳細**: Phase 2 の設計で vitest-alias-consistency テスト（108件）がプラグイン導入後も PASS するかの具体的な調査手順が不足している。108件のテストが `vitest.config.ts` の alias セクションをどのように検証しているか（alias エントリの存在チェック vs モジュール解決の動作チェック）を事前に調査する必要がある
- **推奨対応**: Phase 4（テスト設計）開始前に、108件のテスト内容を分類し、パターン A 導入時の影響を定量的に評価する

##### 指摘 RV-2: NFR-2 の変更ファイル数の正確性

- **深刻度**: MINOR
- **カテゴリ**: 要件充足
- **詳細**: パターン A でのサブパス追加時の変更ファイル数は「2ファイル」ではなく「3ファイル」（exports + typesVersions + tsconfig paths）になる。プラグインは tsconfig の paths を読み込むため、paths への追加は引き続き必要。削減されるのは vitest alias の1ファイルのみ（4→3）
- **推奨対応**: Phase 2 の NFR-2 記載と設計書の運用手順を修正する（変更ファイル数: パターン A は3ファイル、パターン B は4ファイル）

##### 指摘 RV-3: formatReport テストの後方互換性

- **深刻度**: MINOR
- **カテゴリ**: 技術的妥当性
- **詳細**: `formatReport()` にエラーメッセージ（Action ヒント）を追加する場合、既存の43件のテストで出力文字列の完全一致アサーションが存在すると破壊される。テストが `toContain` か `toBe` かを確認し、必要なテスト修正を Phase 4 のスコープに含める
- **推奨対応**: Phase 4 で `formatReport()` のテストケースを確認し、Action ヒント追加の影響を評価する

## 統合テスト連携

| 連携対象        | 確認内容                                                                 |
| --------------- | ------------------------------------------------------------------------ |
| 既存43テスト    | `formatReport` 変更時のアサーション互換性（完全一致/部分一致）を確認する |
| alias整合テスト | プラグイン導入時の `alias` 期待値変更有無を事前に洗い出す                |
| CIジョブ        | `check-module-sync` ジョブへの影響有無をレビュー結果に明記する           |

## 多角的チェック観点

| 観点                | 適用判断 | 仕様参照先                                                                   |
| ------------------- | -------- | ---------------------------------------------------------------------------- |
| アーキテクチャ      | 必須     | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` |
| 品質/テスタビリティ | 必須     | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |
| CI/CD               | 必須     | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`     |
| セキュリティ        | 条件付き | `.claude/skills/aiworkflow-requirements/references/security-principles.md`   |
| エラーハンドリング  | 条件付き | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        |

## 成果物

| 成果物             | パス                                      | 説明                       |
| ------------------ | ----------------------------------------- | -------------------------- |
| 設計レビュー報告書 | `outputs/phase-3/design-review-result.md` | 本文書を成果物としてコピー |

## 完了条件

- [ ] 要件充足マトリクス（FR-1〜FR-4 / NFR-1〜NFR-4）が全件検証されている
- [ ] 技術的妥当性レビュー（プラグイン互換性・既存スクリプト整合性・pnpm スクリプト）が完了している
- [ ] 影響範囲レビュー（テスト224件 + 43件・CI・開発ワークフロー）が完了している
- [ ] セキュリティレビュー（依存パッケージの信頼性）が完了している
- [ ] PASS / MINOR / MAJOR 判定が記録されている
- [ ] MINOR 指摘は全て未タスク仕様書に変換する準備ができている
- [ ] MAJOR 指摘がある場合、差し戻し先（Phase 1 or Phase 2）が明示されている

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/vitest-tsconfig-paths-sync --phase 3
```

## 次のPhase

Phase 4: テスト作成（設計レビュー判定が PASS or MINOR の場合）
