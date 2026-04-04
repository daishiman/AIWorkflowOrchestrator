# リソースマップ

> Progressive Disclosure:
> まず本ファイルでカテゴリを特定し、必要な family file だけを読む。

## agents/（9ファイル）

| Agent | 読み込み条件 | 責務 |
| --- | --- | --- |
| [decompose-task.md](../agents/decompose-task.md) | create 開始時 | タスク分解 |
| [identify-scope.md](../agents/identify-scope.md) | 分解後 | スコープ、前提、制約定義 |
| [design-phases.md](../agents/design-phases.md) | scope 固定後 | phase 構成設計 |
| [generate-task-specs.md](../agents/generate-task-specs.md) | phase 設計後 | workflow 仕様生成 |
| [output-phase-files.md](../agents/output-phase-files.md) | 仕様生成後 | `phase-*.md` 出力 |
| [update-dependencies.md](../agents/update-dependencies.md) | 仕様生成後 | `artifacts.json` 更新 |
| [verify-specs.md](../agents/verify-specs.md) | review gate 時 | LLM 観点レビュー |
| [update-system-specs.md](../agents/update-system-specs.md) | Phase 12 Task 2 | system spec 同期 |
| [generate-unassigned-task.md](../agents/generate-unassigned-task.md) | Phase 12 Task 4 | 未タスク formalize |

## references/（36ファイル）

### workflow core

| Reference | 読み込み条件 | 内容 |
| --- | --- | --- |
| [resource-map.md](resource-map.md) | 導線確認時 | 本ファイル |
| [create-workflow.md](create-workflow.md) | create 実行時 | create フロー詳細 |
| [execute-workflow.md](execute-workflow.md) | execute 実行時 | Phase 1〜13 実行フロー |
| [commands.md](commands.md) | command 実行時 | CLI 早見表 |
| [coverage-standards.md](coverage-standards.md) | Phase 6-7 | coverage 基準 |
| [quality-standards.md](quality-standards.md) | Phase 9-10 | 品質基準 |
| [review-gate-criteria.md](review-gate-criteria.md) | Phase 3/10 | review 判定基準 |
| [artifact-naming-conventions.md](artifact-naming-conventions.md) | outputs 作成時 | 命名規則 |
| [evidence-sync-rules.md](evidence-sync-rules.md) | Phase 12 | 台帳・証跡同期 |
| [self-improvement-cycle.md](self-improvement-cycle.md) | 改善分析時 | feedback ループ |

### templates family

| Reference | 読み込み条件 | 内容 |
| --- | --- | --- |
| [phase-templates.md](phase-templates.md) | template の全体像が欲しい時 | template family index |
| [phase-template-core.md](phase-template-core.md) | Phase 1-3 作成時 | core template |
| [phase-template-execution.md](phase-template-execution.md) | Phase 4-10 作成時 | execution template |
| [phase-template-phase11.md](phase-template-phase11.md) | Phase 11 作成時 | manual test template |
| [phase-template-phase12.md](phase-template-phase12.md) | Phase 12 作成時 | documentation template |
| [phase-template-phase13.md](phase-template-phase13.md) | Phase 13 作成時 | approval / PR template |

### Phase 11/12 family

| Reference | 読み込み条件 | 内容 |
| --- | --- | --- |
| [phase-11-12-guide.md](phase-11-12-guide.md) | Phase 11/12 開始時 | split guide index |
| [phase-11-screenshot-guide.md](phase-11-screenshot-guide.md) | UI task の Phase 11 | screenshot と manual walkthrough |
| [phase-12-documentation-guide.md](phase-12-documentation-guide.md) | Phase 12 全般 | Task 12-1〜12-6 の出力条件 |
| [phase12-checklist-definition.md](phase12-checklist-definition.md) | 再監査時 | 完了定義 |
| [technical-documentation-guide.md](technical-documentation-guide.md) | implementation guide 作成時 | 技術文書の詳細 |
| [screenshot-verification-procedure.md](screenshot-verification-procedure.md) | Apple UI/UX 視覚検証時 | capture / review 手順 |

### spec update family

| Reference | 読み込み条件 | 内容 |
| --- | --- | --- |
| [spec-update-workflow.md](spec-update-workflow.md) | Phase 12 Task 2 開始時 | index と判断フロー |
| [spec-update-step1-completion.md](spec-update-step1-completion.md) | Step 1-A〜1-G 実行時 | 完了記録と台帳同期 |
| [spec-update-step2-domain-sync.md](spec-update-step2-domain-sync.md) | Step 2 判定時 | domain spec の更新判断 |
| [spec-update-validation-matrix.md](spec-update-validation-matrix.md) | final validation 時 | command matrix と pass 基準 |

### pattern family

| Reference | 読み込み条件 | 内容 |
| --- | --- | --- |
| [patterns.md](patterns.md) | 問題が起きた時 | pattern family index |
| [patterns-workflow-generation.md](patterns-workflow-generation.md) | workflow 設計時 | phase / lane / artifact パターン |
| [patterns-validation-and-audit.md](patterns-validation-and-audit.md) | validator 失敗時 | line budget、mirror、audit パターン |
| [patterns-phase12-sync.md](patterns-phase12-sync.md) | Phase 12 失敗時 | implementation guide、spec sync、未タスク化パターン |

### logs and archives

| Reference | 読み込み条件 | 内容 |
| --- | --- | --- |
| [logs-archive-index.md](logs-archive-index.md) | 過去ログ参照時 | archive 入口 |
| [logs-archive-2026-march.md](logs-archive-2026-march.md) | 2026-03 の知見参照 | 月次要約 |
| [logs-archive-2026-feb.md](logs-archive-2026-feb.md) | 2026-02 の知見参照 | 月次要約 |
| [logs-archive-legacy.md](logs-archive-legacy.md) | 2026-01 以前 | legacy summary |
| [changelog-archive.md](changelog-archive.md) | version 履歴参照時 | 詳細 changelog |

### supporting guides

| Reference | 読み込み条件 | 内容 |
| --- | --- | --- |
| [unassigned-task-guidelines.md](unassigned-task-guidelines.md) | 未タスク出力時 | 未タスク仕様ルール |

## schemas/（8ファイル）

| Schema | 用途 |
| --- | --- |
| [mode.json](../schemas/mode.json) | モード定義検証 |
| [task-definition.json](../schemas/task-definition.json) | タスク定義 |
| [phase-spec.json](../schemas/phase-spec.json) | phase 仕様検証 |
| [artifact-definition.json](../schemas/artifact-definition.json) | artifact 定義 |
| [unassigned-task.json](../schemas/unassigned-task.json) | 未タスク検証 |
| [verification-report.json](../schemas/verification-report.json) | verification report 検証 |
| [review-gate-result.json](../schemas/review-gate-result.json) | review result 検証 |
| [scope-definition.json](../schemas/scope-definition.json) | scope 検証 |

## scripts/（16ファイル）

| Script | 用途 |
| --- | --- |
| `detect-mode.js` | create / update / execute 判定 |
| `init-artifacts.js` | workflow 初期化 |
| `validate-phase-output.js` | phase 仕様検証 |
| `complete-phase.js` | phase 完了登録 |
| `verify-all-specs.js` | 全 phase 一括検証 |
| `detect-unassigned-tasks.js` | TODO/FIXME 検出 |
| `audit-unassigned-tasks.js` | 未タスク監査 |
| `verify-unassigned-links.js` | 未タスクリンク整合 |
| `generate-documentation-changelog.js` | changelog 生成 |
| `validate-schema.js` | schema 検証 |
| `log-usage.js` | feedback 記録 |
| `generate-index.js` | workflow index 再生成 |
| `capture-screenshots.js` | screenshot capture |
| `validate-phase11-screenshot-coverage.js` | screenshot coverage 検証 |
| `validate-phase12-implementation-guide.js` | implementation guide 検証 |
| `evidence-bundle-validator.ts` | evidence bundle 検証 |

## assets/（11ファイル）

| Asset | 用途 |
| --- | --- |
| [phase-spec-template.md](../assets/phase-spec-template.md) | phase spec 雛形 |
| [common-header-template.md](../assets/common-header-template.md) | 共通 header |
| [common-footer-template.md](../assets/common-footer-template.md) | 共通 footer |
| [main-task-template.md](../assets/main-task-template.md) | main task 雛形 |
| [integration-test-template.md](../assets/integration-test-template.md) | Phase 4/6 雛形 |
| [unassigned-task-template.md](../assets/unassigned-task-template.md) | 未タスク雛形 |
| [implementation-guide-template.md](../assets/implementation-guide-template.md) | Phase 12 guide 雛形 |
| [documentation-changelog-template.md](../assets/documentation-changelog-template.md) | changelog 雛形 |
| [evidence-bundle-template.md](../assets/evidence-bundle-template.md) | evidence bundle 雛形 |
| [phase12-task-spec-compliance-template.md](../assets/phase12-task-spec-compliance-template.md) | Phase 12 compliance 雛形 |
| [review-result-template.md](../assets/review-result-template.md) | review gate 雛形 |

## 変更履歴

| Date | Changes |
| --- | --- |
| 2026-03-12 | references を 36 ファイルへ更新。family file と logs archive を追加し、500行超 guide を責務分離した |
| 2026-03-06 | assets/11 に更新（Phase 12 compliance template 追加） |
| 2026-03-03 | screenshot / evidence sync 関連の reference と script を追加 |
