# TASK-RALLY-002-VITEST-RERUN-001 - タスク指示書

## メタ情報

```yaml
issue_number: 2405
```

## メタ情報

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | TASK-RALLY-002-VITEST-RERUN-001                                      |
| タスク名     | esbuild version mismatch解消後のConversationalInterview vitest再実行 |
| 分類         | テスト                                                               |
| 対象機能     | ConversationalInterview - restoredPendingRequest テストスイート      |
| 優先度       | 中                                                                   |
| 見積もり規模 | 小規模                                                               |
| ステータス   | 未実施                                                               |
| 発見元       | TASK-RALLY-002 Phase 5/9 環境制約記録                                |
| 発見日       | 2026-04-22                                                           |
| 関連タスク   | TASK-RALLY-002（前提完了）                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-RALLY-002では新規テストファイル `ConversationalInterview.restoredPendingRequest.test.tsx`（529行）を作成した。
しかし、実行環境が git worktree（`task-20260421-171055-wt-4`）であったため、
esbuildのバージョン不整合（ホスト: `0.21.5` / バイナリ: `0.25.12`）が発生し、
`pnpm --filter @repo/desktop test` が起動時点でクラッシュした。

その結果、テストの内容自体はコンポーネント実装との整合性が取れているが、
**一度も実際に実行されていない**状態でタスクが完了扱いになっている。

### 1.2 問題点・課題

| 問題                               | 詳細                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| テストが一度も実行されていない     | `ConversationalInterview.restoredPendingRequest.test.tsx` の全529行が未実行                                     |
| esbuildバージョン不整合エラー      | `"The version of esbuild used to start this process (0.21.5) does not match the version found in node_modules"` |
| TASK-RALLY-002の品質保証が書面のみ | テストの GREEN 確認が未完了のため、実装の動作保証が文書上のみに留まっている                                     |

### 1.3 放置した場合の影響

- `ConversationalInterview.restoredPendingRequest.test.tsx` が実際には壊れているにもかかわらず、
  問題が発見されずに後続タスクへ進む可能性がある
- RALLY-002 で追加した `restoredPendingRequest` 系のロジックがリグレッションしても、
  テストが動いていないため検知できない
- 将来 CI に取り込んだ際に初めてエラーが発覚し、修正コストが増大する

---

## 2. 何を達成するか（What）

### 2.1 目的

main環境（非worktree）でesbuildのversion mismatchを解消し、
TASK-RALLY-002で作成した新規テストスイートをGreenで通過させる。

### 2.2 最終ゴール

`pnpm --filter @repo/desktop test` を実行した際に、
`ConversationalInterview.restoredPendingRequest.test.tsx` の全テストケースが **GREEN** で通過すること。

### 2.3 スコープ

**含むもの**:

- main環境（非worktree）での `pnpm install` 実行によるesbuild version mismatch解消
- `ConversationalInterview.restoredPendingRequest.test.tsx` のvitest実行と結果確認
- 失敗ケースがある場合のみ、テストコードの軽微な修正（実装コードは変更しない）
- 実行ログの記録（`outputs/phase-9-rerun/test-results.md`）

**含まないもの**:

- `ConversationalInterview.tsx` 本体の実装変更
- 既存の他テストファイルの修正
- esbuild自体のアップグレード対応（`pnpm install` で自動解消する想定）
- vitest設定（`vitest.config.ts`）の変更（TASK-IPC-VITEST-SIGKILL-MITIGATION-001 のスコープ）

### 2.4 成果物

| 成果物                                       | 内容                                                                   |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `outputs/phase-9-rerun/test-results.md`      | vitestの実行ログと全PASS確認記録                                       |
| テストコード修正（失敗ケースがある場合のみ） | `ConversationalInterview.restoredPendingRequest.test.tsx` の軽微な修正 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 確認項目                                      | 確認方法                                                                                     |
| --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| main環境（非worktree）であること              | `git worktree list` で確認し、mainブランチのディレクトリで作業すること                       |
| TASK-RALLY-002が完了済みであること            | `git log --oneline` で TASK-RALLY-002 の関連コミットが main または対象ブランチに含まれること |
| `pnpm install` が完了していること             | worktree外の main 環境で `pnpm install` を実行し、esbuild バイナリが正しく解決されること     |
| esbuild version mismatch が解消されていること | `pnpm --filter @repo/desktop test -- --run --reporter=verbose` が起動エラーなく開始すること  |

### 3.2 依存タスク

| タスクID       | 状態     | 関係                                                               |
| -------------- | -------- | ------------------------------------------------------------------ |
| TASK-RALLY-002 | 完了済み | 本タスクで実行するテストファイルを作成したタスク。コード変更は不要 |

本タスクは環境問題のみの解消であり、コード変更は原則不要。

### 3.3 必要な知識

| 知識領域                              | 参照先                                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| esbuild version mismatch の原因と解消 | `TASK-IPC-VITEST-SIGKILL-MITIGATION-001.md` §「worktree環境でのesbuildバイナリdrift」                          |
| pnpm monorepo でのテスト実行方法      | `CLAUDE.md` §「テスト」セクション                                                                              |
| ConversationalInterview テスト構造    | `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx` |

### 3.4 推奨アプローチ

1. mainブランチをcheckoutした**非worktree環境**で `pnpm install` を実行する
2. esbuildバイナリが正しく解決されたことを確認する（起動エラーがないことを確認）
3. 対象テストファイルのみを指定して実行する:
   ```bash
   pnpm --filter @repo/desktop test -- --run --reporter=verbose --testPathPattern ConversationalInterview.restoredPendingRequest
   ```
4. 失敗ケースがあれば原因を調査する（テストコードと実装の乖離を確認）
5. 失敗原因がテストコードの軽微な記述ミスであれば修正する（実装コードは変更しない）
6. 全PASS後、実行ログを `outputs/phase-9-rerun/test-results.md` に記録する

---

## 4. 実行手順（Phase 構成）

### Phase 構成概要

| Phase | 名称               | 目的                                         |
| ----- | ------------------ | -------------------------------------------- |
| 1     | 要件定義           | 実行対象テストと環境前提条件の確認           |
| 2     | 設計               | 実行コマンドと失敗時の対応方針を決定         |
| 3     | 設計レビューゲート | Phase 2 の方針を Phase 4 へ進めるか判定      |
| 4     | テスト設計         | 成功判定基準（全PASS）の定義                 |
| 5     | 実装計画           | 環境セットアップ手順を確定                   |
| 6     | テスト拡充（任意） | 失敗ケース発見時のテスト修正方針             |
| 7     | カバレッジ確認     | テストケース網羅性の確認                     |
| 8     | リファクタリング   | テストコードの可読性確認（修正した場合のみ） |
| 9     | 品質保証           | テスト実行・全PASSの確認・ログ記録           |
| 10    | 最終レビュー       | 完了条件チェックリストの最終判定             |
| 11    | 手動テスト         | NON_VISUAL宣言と実行証跡の記録               |
| 12    | ドキュメント更新   | 実装ガイド・未タスク検出・フィードバック記録 |
| 13    | PR作成             | ユーザー承認後のPR作成（承認なし実行禁止）   |

---

### Phase 1: 要件定義

**目的**: 実行対象テストファイルの状態と環境前提条件を確認する。

**作業内容**:

1. `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx` を読み、テストケースの一覧を把握する
2. `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` の `restoredPendingRequest` 関連実装を確認し、テストとの整合性を事前チェックする
3. esbuildのバージョン不整合が発生していたworktreeと、mainブランチの `node_modules` の状態を比較する
4. 作業するブランチ（mainまたはTASK-RALLY-002が含まれるブランチ）を決定する

**完了条件**:

- テストケース一覧が把握されている（何ケースあるか）
- テストと実装の整合性に明らかな問題がないことが確認されている
- 作業ブランチが決定している

---

### Phase 2: 設計

**目的**: 実行コマンドと失敗時の対応方針を設計する。

**作業内容**:

1. 実行するvitestコマンドを決定する（テストファイル指定方法）
2. esbuild version mismatch が解消されない場合の代替手順（`node_modules/.cache` 削除等）を設計する
3. テスト失敗時の対応判断基準を定義する:
   - テストコードの修正で解消できる範囲
   - 実装コードの変更が必要になる場合の escalation 判断
4. 設計内容を `outputs/phase-2/design.md` に記録する

**完了条件**:

- 実行コマンドが確定している
- 失敗時の対応フローが定義されている

---

### Phase 3: 設計レビューゲート

**目的**: Phase 2 の設計を Phase 4 へ進めるか判定する。

**レビュー観点**:

| 観点                     | 確認内容                                                   |
| ------------------------ | ---------------------------------------------------------- |
| 前提条件の充足性         | main環境でesbuild mismatchが解消できる見通しが立っているか |
| 対象テストファイルの特定 | 正しいファイルパスが指定されているか                       |
| 失敗時フローの妥当性     | 実装変更なしで解消できる範囲の判断基準が明確か             |
| 作業ブランチの妥当性     | TASK-RALLY-002のコードが含まれるブランチであることを確認   |

**判定基準**:

- PASS: 全観点がクリアされれば Phase 4 へ進む
- MAJOR: 前提条件に問題がある場合は Phase 1 または Phase 2 に戻る

---

### Phase 4: テスト設計

**目的**: 成功判定基準を定義する。

**成功判定基準**:

| VC ID | 確認内容                                                            | 確認方法                                       |
| ----- | ------------------------------------------------------------------- | ---------------------------------------------- |
| VC-01 | vitestが起動エラーなく開始する                                      | esbuild関連のエラーが出ないことを確認          |
| VC-02 | 全テストケースがPASSする                                            | vitestの出力で `X passed` と表示されること     |
| VC-03 | FAILしているテストケースがゼロである                                | vitestの出力で `0 failed` であることを確認     |
| VC-04 | 実行ログが `outputs/phase-9-rerun/test-results.md` に記録されている | ファイルが存在し、実行結果が記載されていること |

---

### Phase 5: 実装計画

**目的**: 環境セットアップと実行手順を確定する。

**実装ステップ**:

1. mainブランチ（非worktree）に移動する
2. `pnpm install` を実行してesbuildバイナリを解決する
3. esbuild version mismatchが解消されたことを確認する
4. テストを実行する:
   ```bash
   pnpm --filter @repo/desktop test -- --run --reporter=verbose --testPathPattern ConversationalInterview.restoredPendingRequest
   ```
5. 結果を `outputs/phase-9-rerun/test-results.md` に記録する

**esbuild mismatch が解消されない場合の代替手順**:

```bash
# キャッシュをクリアしてから再インストール
rm -rf apps/desktop/node_modules/.cache
pnpm install
# または
pnpm --filter @repo/desktop exec node node_modules/.bin/esbuild --version
```

---

### Phase 6: テスト拡充（任意）

**目的**: テスト失敗ケースが発見された場合のみ、テストコードを修正する。

> **注記**: テスト失敗がない場合はこのPhaseはスキップする。

**修正方針**:

- 修正対象: `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx`
- 修正しないもの: `ConversationalInterview.tsx` 本体の実装コード
- 失敗原因が実装バグと判断される場合は、本タスクのスコープ外とし、別タスクを起票する

---

### Phase 7: カバレッジ確認

**目的**: テストケースの網羅性を確認する。

**確認項目**:

| 確認項目                                              | 基準                                                           |
| ----------------------------------------------------- | -------------------------------------------------------------- |
| `restoredPendingRequest` シナリオが網羅されている     | テストケース数が TASK-RALLY-002 の設計と一致する               |
| 境界値ケース（null / undefined / 空配列等）が含まれる | テストコードを目視でレビューし、境界値の取りこぼしがないか確認 |

---

### Phase 8: リファクタリング（任意）

**目的**: テストコードを修正した場合のみ、可読性と保守性を確認する。

> **注記**: Phase 6 でテストコードを修正しなかった場合はスキップする。

**確認観点**:

- テストの命名が describe/it で意図を明確に示しているか
- setup/teardown（beforeEach/afterEach）が適切に定義されているか
- モックの設定が過剰でないか

---

### Phase 9: 品質保証

**目的**: テスト実行・全PASSの確認・ログ記録を行う。

**実行コマンド**:

```bash
# esbuild バージョン確認（mismatch解消確認）
pnpm --filter @repo/desktop exec node -e "require('esbuild').version" 2>&1

# 対象テストファイルの実行
pnpm --filter @repo/desktop test -- --run --reporter=verbose --testPathPattern ConversationalInterview.restoredPendingRequest

# 全体テスト実行（デスクトップパッケージ）
pnpm --filter @repo/desktop test -- --run
```

**合格基準**:

- VC-01: vitestが起動エラーなく開始する
- VC-02 / VC-03: `ConversationalInterview.restoredPendingRequest.test.tsx` の全ケースがPASS（0 failed）
- VC-04: 実行ログが `outputs/phase-9-rerun/test-results.md` に記録されている

---

### Phase 10: 最終レビュー

**目的**: 完了条件チェックリストの最終判定を行う。

**確認チェックリスト**:

- [ ] esbuild version mismatchが解消されたことが確認されている
- [ ] `ConversationalInterview.restoredPendingRequest.test.tsx` の全テストケースがGREEN
- [ ] 実行ログが `outputs/phase-9-rerun/test-results.md` に記録されている
- [ ] 実装コードは変更していない（テストコードのみの変更であること）

**判定基準**:

- PASS: 全チェックがクリアされれば Phase 11 へ進む
- MAJOR: テストがFAILしている場合は Phase 6 に戻る
- CRITICAL: esbuild mismatchが解消されない場合は環境調査タスクを別途起票し、本タスクをブロック状態で終了する

---

### Phase 11: 手動テスト

**目的**: NON_VISUAL宣言と実行証跡を記録する。

> **注記**: 本タスクは UI 変更なしの NON_VISUAL タスク。スクリーンショット取得は不要。
> 代替証跡として `outputs/phase-11/manual-test-result.md` を作成する。

**Phase 11 NON_VISUAL 宣言**:

```
NON_VISUAL: true
理由: テスト実行のみのタスクであり、UI変更を含まない
代替証跡: outputs/phase-9-rerun/test-results.md（vitestの実行ログ）
```

**確認手順**:

1. `outputs/phase-9-rerun/test-results.md` の内容を確認し、全PASS記録があることを確認する
2. `outputs/phase-11/manual-test-result.md` に NON_VISUAL 宣言と実行証跡のリンクを記録する

---

### Phase 12: ドキュメント更新

**目的**: 実装ガイド・未タスク検出・フィードバックレポートを記録する。

**作成する成果物**:

| 成果物                                          | 内容                                                    |
| ----------------------------------------------- | ------------------------------------------------------- |
| `outputs/phase-12/implementation-guide.md`      | esbuild解消手順・テスト実行コマンド・苦戦箇所の記録     |
| `outputs/phase-12/unassigned-task-detection.md` | 本タスク実施中に発見された未タスクの一覧（0件でも記録） |
| `outputs/phase-12/skill-feedback-report.md`     | スキル・プロセスへのフィードバック（なしでも記録）      |

**記録必須項目（implementation-guide.md）**:

- esbuild version mismatch の解消方法（実際に行った手順）
- テストの実行結果（ケース数・PASS数・実行時間）
- テストコードを修正した場合はその内容と理由
- 苦戦箇所と解決策

---

### Phase 13: PR作成

**目的**: ユーザーの承認を得た後にPRを作成する。

> **重要**: このフェーズはユーザーの明示的な承認なしに実行禁止。

**PR作成手順**:

1. `git status` で変更ファイルを確認する
2. `git diff` で変更内容を最終確認する
3. コミットメッセージ案をユーザーに提示し承認を得る
4. `gh pr create` でPRを作成する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] esbuild version mismatch が main環境で解消されている
- [ ] `ConversationalInterview.restoredPendingRequest.test.tsx` の全テストケースがGREEN
- [ ] `pnpm --filter @repo/desktop test` が全体としてPASSする

### 品質要件

- [ ] テストコードを修正した場合、実装コードへの変更がないこと
- [ ] 修正はテストの記述ミスの修正範囲に留まること

### ドキュメント要件

- [ ] `outputs/phase-9-rerun/test-results.md` が作成されている（vitestの実行ログ）
- [ ] `outputs/phase-11/manual-test-result.md` が作成されている（NON_VISUAL宣言含む）
- [ ] `outputs/phase-12/implementation-guide.md` が作成されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも出力）
- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている

---

## 6. 検証方法

### 6.1 esbuild バージョン整合性確認

```bash
# ホストとバイナリのバージョン一致を確認
pnpm --filter @repo/desktop exec node -e "require('esbuild').version"
```

エラーが出ずにバージョン番号が表示されれば解消済み。

### 6.2 テスト実行コマンド

```bash
# 対象テストファイルのみ実行（高速確認）
pnpm --filter @repo/desktop test -- --run --reporter=verbose \
  --testPathPattern ConversationalInterview.restoredPendingRequest

# 全体実行（最終確認）
pnpm --filter @repo/desktop test -- --run
```

### 6.3 成功判定

vitestの出力で以下が確認できれば成功:

```
Test Files  1 passed (1)
Tests       X passed (X)
Duration    X.XXs
```

---

## 7. リスクと対策

| リスク                                                         | 影響度 | 発生確率 | 対策                                                                                                                                               |
| -------------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install` 後もesbuild mismatchが解消されない              | 高     | 低       | `node_modules/.cache` を削除してから `pnpm install` を再実行する。それでも解消しない場合は `pnpm store prune` を実行してキャッシュを完全クリアする |
| テストコードと実装の乖離が発見される（テスト自体が壊れている） | 高     | 中       | テストコードの修正範囲で対応できる場合のみ本タスクで修正。実装バグが発見された場合は別タスクを起票してエスカレーションする                         |
| テスト実行中に SIGKILL が発生する（大規模テスト実行時の問題）  | 中     | 低       | `VITEST_MAX_FORKS=1 VITEST_FILE_PARALLELISM=false` を設定してシングルフォークで実行する（TASK-IPC-VITEST-SIGKILL-MITIGATION-001 参照）             |
| TASK-RALLY-002 のコードがmainブランチに未マージ                | 高     | 中       | Phase 1 で `git log` を確認し、対象ブランチを正しく選択する                                                                                        |
| テストの実行時間が長く、他の開発フローをブロックする           | 低     | 低       | `--testPathPattern` で対象ファイルを絞り込んで実行する                                                                                             |

---

## 8. 参照情報

| 参照先                                                                                                         | 目的                                    |
| -------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `apps/desktop/src/renderer/components/skill/__tests__/ConversationalInterview.restoredPendingRequest.test.tsx` | 実行対象テストファイル                  |
| `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`                                       | テスト対象の実装コード                  |
| `docs/30-workflows/unassigned-task/TASK-IPC-VITEST-SIGKILL-MITIGATION-001.md`                                  | esbuild drift と SIGKILL 問題の詳細情報 |
| `docs/30-workflows/skill-create-flow-gaps/wave0-par-RALLY-002/phase-9-quality-assurance.md`                    | TASK-RALLY-002でのesbuildエラー記録     |

---

## 9. 備考（苦戦箇所【記入必須】）

### 9.1 事前に予測される苦戦箇所

実施前の時点での予測リスクを記録する。**実施後は各行の「実際の結果」列を更新すること**
（Phase 12 の `skill-feedback-report.md` へ転記できる粒度で記載する）。

| 苦戦箇所                                                            | 原因                                                                                                                                           | 対応策（予測）                                                                                                                                               | 実際の結果（実施後に記入） |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| worktree環境でのesbuild version drift                               | git worktreeは `node_modules` をメインworktreeと共有するが、esbuildはホストOS向けのバイナリを `.pnpm` キャッシュから解決するため不整合が生じる | 非worktree環境（mainブランチの直接チェックアウト）で `pnpm install` を実行し、バイナリを正しく解決する                                                       | （実施後に記入）           |
| `pnpm install` 後もesbuild mismatchが解消されない                   | pnpmキャッシュが古いバイナリを保持しており、`install` だけでは解消されないケースがある                                                         | `node_modules/.cache` 削除後に `pnpm install` を再試行。それでも解消しない場合は `pnpm store prune` を実行する                                               | （実施後に記入）           |
| テストコードが実装の変更を前提に書かれており修正が必要になる        | TASK-RALLY-002の実装とテストの作成に時間差があった場合、インターフェースが変更されている可能性がある                                           | Phase 1 で実装コードとテストコードの差分を事前確認し、修正が必要かどうかを判断する。修正が大規模になる場合は本タスクのスコープを超えるため別タスクを起票する | （実施後に記入）           |
| TASK-RALLY-002のコードがmainブランチに未マージ                      | ブランチ戦略によっては、TASK-RALLY-002が worktree ブランチのままマージされていない可能性がある                                                 | Phase 1 で `git log` を確認し、対象のテストファイルが含まれるブランチを特定してから作業を開始する                                                            | （実施後に記入）           |
| vitestの `--testPathPattern` オプションで対象ファイルが絞り込めない | vitestのバージョンによってオプション名が異なる可能性がある（`--testPathPattern` vs `--reporter` の組み合わせ）                                 | `pnpm --filter @repo/desktop test -- --help` でオプションを確認し、ファイル指定方法を調整する                                                                | （実施後に記入）           |

### 9.2 背景コンテキスト（将来実装者へ）

- 本タスクは純粋な「環境問題の解消とテストの動作確認」タスクである。
  コードの変更は原則不要であり、テストを実行して GREEN を確認するだけで完了する。

- esbuild version mismatch は git worktree 特有の問題であり、
  main ブランチを直接チェックアウトした環境では `pnpm install` を実行するだけで解消される。
  詳細は `TASK-IPC-VITEST-SIGKILL-MITIGATION-001.md` の「worktree環境でのesbuildバイナリdrift」を参照。

- テストファイル `ConversationalInterview.restoredPendingRequest.test.tsx` は
  TASK-RALLY-002 Phase 5 で作成された529行のテストスイートである。
  内容的には実装との整合性が確認されているが、一度も実行されていない点が唯一の懸念事項。

- **100人中100人が同じ理解で実行できるために特に重要なポイント**:
  1. 非worktree環境（main直接チェックアウト）で作業すること
  2. `pnpm install` を実行してからテストを実行すること
  3. テストが失敗した場合、実装コードを変更するのではなくテストコードの修正で対応すること
  4. 実装コードの変更が必要と判断された場合は本タスクのスコープ外として別タスクを起票すること
  5. Phase 13 はユーザーの承認なしに絶対に実行しないこと
