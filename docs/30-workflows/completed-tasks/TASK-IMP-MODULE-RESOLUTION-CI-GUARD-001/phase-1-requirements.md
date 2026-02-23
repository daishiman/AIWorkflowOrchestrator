# Phase 1: 要件定義

## メタ情報

| 項目     | 内容                                                    |
| -------- | ------------------------------------------------------- |
| Phase    | 1                                                       |
| 機能名   | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001                 |
| タスク名 | `@repo/shared` モジュール解決3層整合CIガード            |
| 作成日   | 2026-02-22                                              |
| Issue    | #845                                                    |
| 発見元   | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 Phase 10 MINOR |

## 目的

`package.json exports` / `tsconfig.json paths` / `vitest.config.ts alias` / `typesVersions` の4設定間の整合性をCIで常時検証し、不整合をPR段階で検出・停止させる。TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001で発生した228件のTS2307エラーの再発を防止する。

## 実行タスク

- 実行タスク一覧: 本Phaseで定義したTaskを上から順に実施する

### Task 1: 要件抽出

#### 1.1 正本定義

`package.json` の `exports` フィールドを Source of Truth（正本）として確定する。他の3設定（`paths`、`alias`、`typesVersions`）は `exports` から導出される副次設定として扱う。

**根拠**: TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 の苦戦箇所1で、正本が曖昧だったことにより修正順序が定まらず手戻りが発生した。`exports` はNode.jsのサブパスエクスポート仕様の公式メカニズムであり、パッケージの公開APIを定義する唯一の場所である。

#### 1.2 現在のエントリ数（2026-02-22時点）

| 設定          | ファイル                        | 全エントリ数 | @repo/shared関連数    |
| ------------- | ------------------------------- | ------------ | --------------------- |
| exports       | `packages/shared/package.json`  | 27           | 27（ルート `.` 含む） |
| typesVersions | `packages/shared/package.json`  | 26           | 26（ルート `.` 除外） |
| paths         | `apps/desktop/tsconfig.json`    | 29           | 27                    |
| alias         | `apps/desktop/vitest.config.ts` | 31           | 27                    |

**注記**: `paths` には `@renderer/*`、`@/*` の2エントリが @repo/shared 以外に存在する。`alias` には `@`、`@renderer`、`@main`、`@anthropic-ai/claude-agent-sdk` の4エントリが @repo/shared 以外に存在する。チェックスクリプトは @repo/shared 関連エントリのみを検証対象とする。

#### 1.3 5段階チェックの要件定義

| チェック# | 検証方向                | 目的                                                         | 検証ロジック                                                                                                       |
| --------- | ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 1         | exports → paths         | exportsの全サブパスに対応するpathsエントリが存在するか       | `exports` の各キー（`"./core"` → `"@repo/shared/core"`）に対応する `paths` エントリの存在を検証                    |
| 2         | paths → exports         | pathsに孤立エントリ（exportsに存在しない）がないか           | `paths` の `@repo/shared` で始まる各エントリに対応する `exports` キーの存在を検証                                  |
| 3         | exports → alias         | exportsの全サブパスに対応するaliasエントリが存在するか       | `exports` の各キー（`"./core"` → `"@repo/shared/core"`）に対応する `alias` エントリの存在を検証                    |
| 4         | alias → exports         | aliasに孤立エントリ（exportsに存在しない）がないか           | `alias` の `@repo/shared` で始まる各エントリに対応する `exports` キーの存在を検証                                  |
| 5         | exports → typesVersions | exportsのサブパスに対応するtypesVersionsエントリが存在するか | `exports` のルート `.` 以外の各サブパスからプレフィックス `./` を除去し、`typesVersions["*"]` のキーとの一致を検証 |

#### 1.4 キー変換ルール

| 変換元                         | 変換先                                  | 例                                               |
| ------------------------------ | --------------------------------------- | ------------------------------------------------ |
| exports `"."`                  | paths `"@repo/shared"`                  | `"."` → `"@repo/shared"`                         |
| exports `"./core"`             | paths `"@repo/shared/core"`             | `"./core"` → `"@repo/shared/core"`               |
| exports `"./core"`             | alias `"@repo/shared/core"`             | `"./core"` → `"@repo/shared/core"`               |
| exports `"./core"`             | typesVersions `"core"`                  | `"./core"` → `"core"`（`./` プレフィックス除去） |
| exports `"./src/ipc/channels"` | paths `"@repo/shared/src/ipc/channels"` | パスは変換なしでそのまま連結                     |

#### 1.5 ワイルドカードエントリの扱い

`tsconfig.json paths` にワイルドカード（`*`）を含むエントリ（`@repo/shared/*`）が将来追加された場合、チェックスクリプトはそのエントリをスキップし、個別のサブパスエントリのみを検証対象とする。現時点（2026-02-22）では `paths` にワイルドカードエントリは存在しない。

### Task 2: 受入基準定義

以下の全条件を満たした場合に本タスクを完了とする。

#### 2.1 CIガード実行

- [ ] `.github/workflows/ci.yml` に `check-module-sync` ジョブが定義されている
- [ ] `check-module-sync` ジョブは `lint` と並列に実行される（`build-shared` に依存しない）
- [ ] `check-module-sync` ジョブは `build` ジョブの `needs` に含まれている
- [ ] PR作成時に `check-module-sync` ジョブが自動実行される
- [ ] main ブランチへのpush時に `check-module-sync` ジョブが自動実行される

#### 2.2 不整合検出

- [ ] `exports` にあるが `paths` にないエントリを検出し、exit code 1で終了する
- [ ] `exports` にあるが `alias` にないエントリを検出し、exit code 1で終了する
- [ ] `exports` にあるが `typesVersions` にないエントリを検出し、exit code 1で終了する
- [ ] `paths` にあるが `exports` にないエントリを検出し、exit code 1で終了する
- [ ] `alias` にあるが `exports` にないエントリを検出し、exit code 1で終了する
- [ ] 全層が整合している場合、exit code 0で正常終了する

#### 2.3 差分レポート

- [ ] 不整合検出時に、どの層のどのエントリが不足しているかを標準出力に出力する
- [ ] レポートに修正方法のガイダンス（4ステップ: exports確認 → paths追加 → alias追加 → typesVersions追加）を含める
- [ ] サマリーセクションに各層のエントリ数と不足数を表示する

#### 2.4 チェックスクリプト品質

- [ ] `scripts/check-shared-module-sync.ts` が作成されている
- [ ] チェックスクリプトのユニットテストが全てPASSする
- [ ] `pnpm lint` がPASSする
- [ ] `pnpm typecheck` がPASSする
- [ ] テストカバレッジが Line 80% / Branch 60% / Function 80% を満たす

### Task 3: スコープ確認

#### 3.1 含むもの

| #   | スコープ項目               | 説明                                                                      |
| --- | -------------------------- | ------------------------------------------------------------------------- |
| 1   | チェックスクリプト         | `scripts/check-shared-module-sync.ts`（5段階チェック + 差分レポート出力） |
| 2   | チェックスクリプトのテスト | `scripts/__tests__/check-shared-module-sync.test.ts`                      |
| 3   | CIジョブ追加               | `.github/workflows/ci.yml` に `check-module-sync` ジョブを追加            |
| 4   | CIジョブ依存更新           | `build` ジョブの `needs` に `check-module-sync` を追加                    |
| 5   | 開発ガイドライン更新       | 新規サブパス追加時の3層同時更新手順の文書化                               |

#### 3.2 含まないもの

| #   | 除外項目                                         | 理由                                                                                |
| --- | ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| 1   | 既存テストファイルの内容変更                     | `shared-module-resolution.test.ts`、`vitest-alias-consistency.test.ts` は変更しない |
| 2   | `@repo/shared` 以外のパッケージへの拡張          | `@repo/ui` 等は別タスクで対応                                                       |
| 3   | 3層の自動生成・自動同期ツール                    | 別タスク: TASK-IMP-VITEST-ALIAS-SYNC-AUTOMATION-001                                 |
| 4   | `exports` / `paths` / `alias` の個別エントリ修正 | 本タスクは検証のみ。個別修正は検出結果に基づいて別途対応                            |

## 参照資料

| #   | ファイル                                                                     | 役割                               |
| --- | ---------------------------------------------------------------------------- | ---------------------------------- |
| 1   | `docs/30-workflows/completed-tasks/task-imp-module-resolution-ci-guard.md`   | 元タスク指示書                     |
| 2   | `packages/shared/package.json`                                               | 正本: `exports` と `typesVersions` |
| 3   | `apps/desktop/tsconfig.json`                                                 | TypeScript `paths` 設定            |
| 4   | `apps/desktop/vitest.config.ts`                                              | Vitest `alias` 設定                |
| 5   | `.github/workflows/ci.yml`                                                   | CIワークフロー設定                 |
| 6   | `apps/desktop/src/__tests__/shared-module-resolution.test.ts`                | 既存整合性テスト（exports↔paths）  |
| 7   | `apps/desktop/src/__tests__/vitest-alias-consistency.test.ts`                | 既存整合性テスト（alias↔paths）    |
| 8   | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | モノレポアーキテクチャ仕様         |
| 9   | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`     | CI/CD技術仕様                      |
| 10  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 品質ゲート・テスト要件             |
| 11  | `.claude/skills/aiworkflow-requirements/references/deployment-gha.md`        | GitHub Actions設計要件             |
| 12  | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | 失敗時の出力・終了コード方針       |

## aiworkflow-requirements 抽出要件（今回実装で必須）

| 要件ID | 出典仕様                                       | 抽出した必須情報                                                                                                   | 本仕様での反映先         |
| ------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| R1     | `architecture-monorepo.md`                     | 正本は `packages/shared/package.json` の `exports`/`typesVersions` とし、`paths`/`alias` と三層整合を取る          | Task 1.1, Task 1.3       |
| R2     | `architecture-monorepo.md`                     | `paths` は「具体サブパス → ルート `@repo/shared`」順で定義する                                                     | Task 1.4, Task 1.5       |
| R3     | `quality-requirements.md`                      | 三層整合の回帰防止として3スイート（module-resolution/shared-module-resolution/vitest-alias-consistency）を維持する | 参照資料, 統合テスト連携 |
| R4     | `quality-requirements.md`, `deployment-gha.md` | CIでは品質チェックを並列実行し、最終ゲート（build）でブロック可能にする                                            | Task 2.1（CIガード実行） |
| R5     | `error-handling.md`                            | 不整合検出時は機械判定可能な失敗終了（exit code 1）、整合時は成功終了（exit code 0）を徹底する                     | Task 2.2                 |
| R6     | `quality-requirements.md`                      | 新規チェック追加後も lint/typecheck/test の品質ゲートを維持する                                                    | Task 2.4                 |

## 多角的チェック観点

### アーキテクチャ観点

- `package.json exports` を正本とする設計が、Node.jsサブパスエクスポート仕様（[Node.js Docs: Subpath exports](https://nodejs.org/api/packages.html#subpath-exports)）に準拠していること
- モノレポ構造（`packages/shared` → `apps/desktop`）の依存方向と一致していること

### CI/CD観点

- `check-module-sync` ジョブが `lint` と並列実行可能であること（`build-shared` に依存しない設計）
- ジョブのtimeoutが適切であること（ソースファイルの読み取りのみのため2分で十分）
- `build` ジョブの最終ゲートに組み込まれ、不整合PRのマージを防止すること

### 品質観点

- 5段階チェックが exports ↔ paths、exports ↔ alias、exports ↔ typesVersions の全組み合わせを網羅していること
- 双方向チェック（exports→paths と paths→exports）により、孤立エントリも検出可能であること

### セキュリティ観点

- チェックスクリプトはファイルシステムの読み取りのみを行い、書き込みを行わないこと
- CIジョブの permissions は既存の `contents: read` で十分であり、追加権限を要求しないこと

## 統合テスト連携

チェックスクリプトと既存テストの役割分担:

| 検証メカニズム                        | 実行タイミング      | 検証対象                       | 目的                |
| ------------------------------------- | ------------------- | ------------------------------ | ------------------- |
| `check-shared-module-sync.ts`（新規） | CI早期ステージ      | 4設定間のエントリ整合性        | 早期検出（1分以内） |
| `shared-module-resolution.test.ts`    | test-desktop ジョブ | exports↔paths のランタイム解決 | 深層検証            |
| `vitest-alias-consistency.test.ts`    | test-desktop ジョブ | alias↔paths のランタイム解決   | 深層検証            |

チェックスクリプトは既存テスト（224テスト、3スイート）を補完する早期検出メカニズムとして機能し、既存テストの代替ではない。

## 成果物

| #   | ファイル                                                                            | 説明     |
| --- | ----------------------------------------------------------------------------------- | -------- |
| 1   | `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-1-requirements.md` | 本仕様書 |

## 完了条件

- [ ] `package.json exports` が正本（Source of Truth）として正式に決定されている
- [ ] 5段階チェックの要件（検証方向、検証ロジック、キー変換ルール）が全て定義されている
- [ ] 受入基準がチェックリスト形式で15項目以上定義されている
- [ ] スコープ（含むもの5項目、含まないもの4項目）が明確に定義されている
- [ ] 現在のエントリ数（exports 27、typesVersions 26、paths 27、alias 27）が確認されている
- [ ] CIジョブの実行タイミング（`lint` と並列、`build-shared` に依存しない）が確認されている
- [ ] チェックスクリプトと既存テストの役割分担が定義されている
- [ ] ワイルドカードエントリの扱い（スキップ）が定義されている
- [ ] 本Phase内の全タスク（Task 1〜3）を100%実行完了

## 次Phase

Phase 2: 設計 → `phase-2-design.md`
