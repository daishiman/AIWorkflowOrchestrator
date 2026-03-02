# Phase 11 Worktree環境テストプロトコル標準化 - タスク指示書

## メタ情報

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| タスクID     | UT-IMP-PHASE11-WORKTREE-PROTOCOL-001        |
| タスク名     | Phase 11 Worktree環境テストプロトコル標準化 |
| 分類         | 改善                                        |
| 対象機能     | Phase 11（手動テスト）、CI/CD、E2Eテスト    |
| 優先度       | 中                                          |
| 見積もり規模 | 中規模                                      |
| ステータス   | 完了（Phase 1-12）                          |
| 発見元       | Phase 11                                    |
| 発見日       | 2026-02-21                                  |
| Issue番号    | #853                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-SKILL-REMOVE-INTERFACE-001 タスクの Phase 11（手動テスト）実行時に、Git Worktree 環境では Electron アプリが起動できず、計画していた手動テストケース（TC-001〜TC-008）が全て未実施となった。テストケースには以下が含まれていた:

- **TC-001〜TC-002**: UI操作によるスキル削除テスト・削除永続化（再起動確認）
- **TC-003〜TC-006**: DevTools コンソール直接呼び出し（存在するスキル・存在しないスキル・空文字列・スペースのみ）
- **TC-007〜TC-008**: コンソールエラーログ確認（起動時・操作後）

Phase 11 仕様書では「代替手段: メインリポジトリでの実施」と記載したが、実施タイミングの管理方法が未定義のままであった。

### 1.2 問題点・課題

| #   | 問題                                                  | 具体的な影響                                                                                                    |
| --- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | Worktree 環境で Electron アプリが起動できない         | `pnpm --filter @repo/desktop dev` がメインリポジトリの `node_modules` を参照するため、Worktree からは動作しない |
| 2   | Phase 11 の代替テスト手順が標準化されていない         | 各タスクで個別に対応方針を決めるため、品質のばらつきと手戻りが発生する                                          |
| 3   | Worktree 環境で未実施のテストケースの追跡方法が未定義 | 「メインリポジトリで実施予定」としたテストが放置されるリスクがある                                              |
| 4   | IPC通信の実環境テストが自動化されていない             | Main/Renderer間のプロセス間通信はユニットテストのモックでは検証しきれない境界がある                             |

### 1.3 放置した場合の影響

- **品質リスク**: ユニットテストでは検出できないプロセス間通信の不具合（P44パターン）が本番で顕在化する
- **テスト漏れの常態化**: Worktree環境でのタスク実行が増加するにつれ、Phase 11未実施のタスクが蓄積する
- **手動テストの属人化**: 代替手順が標準化されていないため、実施者によって検証範囲と品質が異なる
- **CI/CDの信頼性低下**: 自動テストでカバーされない領域（UI操作・IPC実環境通信）の品質が保証されない

---

## 2. 何を達成するか（What）

### 2.1 目的

Git Worktree 環境で Phase 11（手動テスト）を実行する際の標準化されたプロトコルを定義し、Electron アプリ起動不可の制約下でも品質を担保する代替テスト手順を確立する。

### 2.2 最終ゴール

1. Worktree 環境用の Phase 11 代替テスト手順書が存在し、全タスクで統一的に使用されている
2. CI/CD パイプラインに Electron E2E テストが統合され、IPC通信の実環境検証が自動化されている
3. Phase 11 仕様書テンプレートに「Worktree 代替手順」セクションが追加されている
4. 未実施テストケースの追跡と完了管理のワークフローが定義されている

### 2.3 スコープ

#### 含むもの

- Worktree 環境用 Phase 11 代替テスト手順の標準プロトコル定義
- CI/CD パイプラインでの Electron E2E テスト統合設計
- Playwright または Spectron を使った自動化された手動テスト代替の設計と実装
- Phase 11 仕様書テンプレートへの「Worktree 代替手順」セクション追加
- 未実施テストケースの追跡ワークフロー定義

#### 含まないもの

- 既存の Phase 11 仕様書（完了済みタスク）の遡及的修正
- Worktree 環境そのものの Electron 起動対応（Electron のアーキテクチャ制約のため非現実的）
- Phase 11 以外の Phase（Phase 1〜10、Phase 12〜13）のWorktree対応
- E2E テストフレームワーク自体の選定評価（Playwright を前提とする）

### 2.4 成果物

| #   | 成果物                           | 説明                                                |
| --- | -------------------------------- | --------------------------------------------------- |
| 1   | Worktree Phase 11 プロトコル文書 | 代替テスト手順の標準プロトコル定義                  |
| 2   | E2E テストスクリプト             | Playwright ベースの IPC 通信 E2E テスト             |
| 3   | CI/CD ワークフロー更新           | `.github/workflows/ci.yml` への E2E ジョブ追加      |
| 4   | Phase 11 テンプレート更新        | `phase-11-12-guide.md` への Worktree セクション追加 |
| 5   | 未実施テスト追跡テンプレート     | 未実施テストケースの管理用テンプレート              |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 22.x がインストール済みであること
- pnpm がグローバルインストール済みであること
- Playwright がプロジェクトの devDependencies に追加可能であること
- GitHub Actions ランナー（ubuntu-latest）で Electron の headless 起動が可能であること（`xvfb-run` 使用）

### 3.2 依存タスク

| 依存                              | 種別     | 理由                                                |
| --------------------------------- | -------- | --------------------------------------------------- |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | 完了済み | 発見元タスク。Phase 11 の制約事項が文書化されている |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | 完了済み | 同様の Phase 11 制約が確認されたタスク              |

### 3.3 必要な知識

- **Electron アーキテクチャ**: Main/Preload/Renderer の3プロセスモデルと IPC 通信の仕組み（`.claude/skills/aiworkflow-requirements/references/architecture-overview.md`）
- **Playwright**: Electron アプリケーションの自動テストフレームワーク。`_electron.launch()` による Electron アプリの自動操作
- **Git Worktree**: Git の worktree 機能と `node_modules` 共有の制約
- **GitHub Actions**: CI/CD ワークフロー構文、Electron の headless テスト実行（`xvfb-run`）
- **IPC セキュリティ**: `validateIpcSender`、`safeInvoke`/`safeOn` パターン（`.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`）

### 3.4 推奨アプローチ

#### 3.4.1 Worktree 環境用 Phase 11 代替テスト手順の標準化

Phase 11 テストを以下の3層に分類し、Worktree 環境では Layer 1〜2 を実施、Layer 3 はメインリポジトリまたは CI で実施する:

| Layer   | テスト種別           | Worktree 実施可否 | 代替手段                                          |
| ------- | -------------------- | ----------------- | ------------------------------------------------- |
| Layer 1 | 自動テスト確認       | 可能              | `pnpm vitest run` で関連テストを実行              |
| Layer 2 | コード静的検証       | 可能              | IPC契約の静的解析（引数型・チャンネル名一致）     |
| Layer 3 | UI操作・実環境テスト | 不可              | Playwright E2E テスト（CI）またはメインリポジトリ |

#### 3.4.2 CI/CD パイプラインでの Electron E2E テスト統合

Playwright の Electron サポートを使用して、Phase 11 で定義される典型的なテストケースを自動化する:

```typescript
// e2e/skill-remove.spec.ts（イメージ）
import { _electron as electron } from "playwright";

test("skill:remove - 存在するスキルの削除", async () => {
  const app = await electron.launch({ args: ["apps/desktop/dist/main.js"] });
  const page = await app.firstWindow();
  // DevTools相当のIPC呼び出しをevaluateで実行
  const result = await page.evaluate(async () => {
    return await window.electronAPI.skill.removeSkill("test-skill");
  });
  expect(result).toBeDefined();
  await app.close();
});
```

#### 3.4.3 Phase 11 仕様書テンプレートへの Worktree セクション追加

`phase-11-12-guide.md` に以下のセクションを追加する:

- **Worktree 環境判定チェックリスト**: `.git` がファイルかディレクトリかで Worktree 環境を判定
- **Layer 別テスト実施ガイド**: 各 Layer のテスト手順と代替手段
- **未実施テスト記録テンプレート**: 未実施テストケースの追跡用フォーマット

#### 3.4.4 未実施テストケースの追跡ワークフロー

1. Phase 11 仕様書の成果物に `outputs/phase-11/deferred-tests.md` を追加
2. 未実施テストケースの ID、理由、代替実施予定を記録
3. PR マージ前に `deferred-tests.md` の全項目が解消されていることを確認

### 3.5 実装課題と解決策（親タスクからの教訓）

UT-FIX-SKILL-REMOVE-INTERFACE-001 の Phase 11 実行時に以下の課題が判明した。本タスクのプロトコル設計にこれらの教訓を反映する。

| #   | 課題                                                                                                      | 発見経緯                                                                                                                                                                                                                                                            | 解決策                                                                                                                                                                                                                                                           | 教訓                                                                                                                                 |
| --- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Git Worktree 環境では Electron のメインプロセスが起動しないため、Renderer/Main間の IPC 通信テストが不可能 | `pnpm --filter @repo/desktop dev` を Worktree ディレクトリから実行すると、`node_modules` のシンボリックリンク解決がメインリポジトリを参照し、Electron バイナリのパス解決に失敗する                                                                                  | Playwright の `_electron.launch()` を CI パイプラインで実行し、メインリポジトリの `node_modules` を正しく参照する環境で E2E テストを自動実行する。Worktree 環境では Layer 1（自動テスト）と Layer 2（静的検証）のみ実施する                                      | Worktree 環境の制約は回避ではなく、テスト戦略の3層分離で対応する。全てのテストを1環境で実行しようとしない                            |
| 2   | 自動テスト（Vitest）は通るが、実環境での UI フロー検証ができない                                          | `pnpm vitest run src/main/ipc/__tests__/skillHandlers` は全 PASS だが、TC-001（UI操作での削除）や TC-003（DevTools直接呼び出し）は Electron 実環境が必要。モックベースのユニットテストでは IPC の実際の引数シリアライゼーションやプロセス間通信の動作を検証できない | Playwright E2E テストで `page.evaluate()` を使い、Renderer プロセスから実際の `window.electronAPI` を呼び出すテストを作成する。これにより TC-003〜TC-006（DevTools 直接呼び出し相当）を自動化できる。TC-001〜TC-002（UI操作）は Playwright の DOM 操作で代替する | ユニットテストと E2E テストは補完関係にある。IPC 境界のテストは E2E でカバーし、ビジネスロジックのテストはユニットテストでカバーする |
| 3   | Phase 11 仕様書で「代替手段: メインリポジトリでの実施」と記載したが、実施タイミングの管理方法が未定義     | Phase 11 完了条件に「TC-001〜TC-008 が全て PASS」と記載されているが、Worktree 環境では実施不可。Phase 12 に進むために未実施テストを「記録のみ」で完了扱いとしたが、その後の追跡メカニズムがない                                                                     | `outputs/phase-11/deferred-tests.md` テンプレートを標準化し、未実施テストの追跡を Phase 13（完了・PR準備）の必須チェック項目に追加する。PR のチェックリストに「deferred-tests.md の全項目が解消済み」を含める                                                    | 「後で実施」の約束は仕組みで管理しないと忘れられる。追跡メカニズムを Phase 13 の完了条件に組み込むことで漏れを防止する               |

---

## 4. 実行手順

### Phase構成

本タスクは以下の4フェーズで実行する。各フェーズは独立して進行可能だが、Phase 3（実装）は Phase 2（プロトコル設計）の成果物に依存する。

### Phase 1: 現状分析

#### 目的

Worktree 環境での Phase 11 制約を体系的に分析し、影響範囲を特定する。

#### 手順

1. 過去の Phase 11 仕様書を調査し、Worktree 環境で未実施となったテストケースを洗い出す
   ```bash
   grep -rn "Worktree\|worktree\|手動テスト.*未実施\|代替手段" docs/30-workflows/*/phase-11-*.md
   ```
2. Electron アプリが Worktree 環境で起動しない根本原因を技術的に分析する
   - `node_modules` のシンボリックリンク解決パスを調査
   - Electron バイナリの検索パスを確認
3. 既存の E2E テスト基盤（Playwright/Spectron の導入状況）を調査する
   ```bash
   grep -rn "playwright\|spectron\|@playwright" package.json apps/desktop/package.json
   ```
4. CI/CD パイプラインの現状構成を確認する（`.github/workflows/ci.yml`）

#### 成果物

- `outputs/phase-1/worktree-constraint-analysis.md`（Worktree制約の技術分析）
- `outputs/phase-1/affected-tasks-list.md`（影響を受けたタスク一覧）

#### 完了条件

- [ ] Worktree 環境で Electron が起動しない根本原因が文書化されている
- [ ] 影響を受けた過去タスクの一覧が作成されている
- [ ] 既存 E2E テスト基盤の調査が完了している

---

### Phase 2: プロトコル設計

#### 目的

Worktree 環境用の Phase 11 代替テストプロトコルを設計する。

#### 手順

1. テスト3層分類（Layer 1〜3）の詳細定義を作成する
2. 各 Layer のテスト手順テンプレートを設計する
3. Playwright E2E テストの技術設計を行う
   - Electron アプリの起動方法（`_electron.launch()` の設定）
   - テストケースの構成（IPC 通信テスト、UI 操作テスト）
   - CI 環境での headless 実行設定（`xvfb-run`）
4. 未実施テスト追跡ワークフローを設計する
5. Phase 11 テンプレートへの追加セクションを設計する

#### 成果物

- `outputs/phase-2/protocol-design.md`（プロトコル設計書）
- `outputs/phase-2/e2e-test-architecture.md`（E2E テストアーキテクチャ設計）
- `outputs/phase-2/template-additions.md`（テンプレート追加セクション設計）

#### 完了条件

- [ ] テスト3層分類が定義され、各 Layer の実施基準が明確になっている
- [ ] Playwright E2E テストの技術設計が完了している
- [ ] 未実施テスト追跡ワークフローが設計されている
- [ ] Phase 11 テンプレートの追加セクションが設計されている

---

### Phase 3: 実装

#### 目的

設計に基づき、E2E テストスクリプト、CI/CD 統合、テンプレート更新を実装する。

#### 手順

1. Playwright を devDependencies に追加する
   ```bash
   pnpm --filter @repo/desktop add -D @playwright/test playwright
   ```
2. E2E テストスクリプトを作成する
   - `apps/desktop/e2e/ipc-skill-remove.spec.ts`（skill:remove の E2E テスト）
   - `apps/desktop/e2e/ipc-skill-import.spec.ts`（skill:import の E2E テスト）
   - テストケースは Phase 11 仕様書の TC-001〜TC-008 に対応させる
3. `playwright.config.ts` を設定する（Electron 用）
4. `.github/workflows/ci.yml` に E2E テストジョブを追加する
   ```yaml
   issue_number: 853
   e2e-desktop:
     name: E2E Desktop Tests
     runs-on: ubuntu-latest
     needs: [build-shared]
     timeout-minutes: 15
     steps:
       - uses: actions/checkout@v4
       - uses: pnpm/action-setup@v4
       - uses: actions/setup-node@v6
         with:
           node-version: "22"
           cache: "pnpm"
       - run: pnpm install --frozen-lockfile
       - run: pnpm --filter @repo/shared build
       - run: pnpm --filter @repo/desktop build
       - run: xvfb-run pnpm --filter @repo/desktop test:e2e
   ```
5. `phase-11-12-guide.md` に Worktree 代替手順セクションを追加する
6. `deferred-tests.md` テンプレートを作成する

#### 成果物

- E2E テストスクリプト（`apps/desktop/e2e/` 配下）
- `playwright.config.ts`（Electron 用設定）
- `.github/workflows/ci.yml` 更新
- `phase-11-12-guide.md` 更新
- `deferred-tests.md` テンプレート

#### 完了条件

- [ ] E2E テストスクリプトが作成され、ローカルで実行可能である
- [ ] CI/CD ワークフローに E2E テストジョブが追加されている
- [ ] Phase 11 テンプレートに Worktree 代替手順が追加されている
- [ ] `deferred-tests.md` テンプレートが作成されている

---

### Phase 4: 検証

#### 目的

実装されたプロトコルが Worktree 環境と CI 環境の両方で正しく動作することを確認する。

#### 手順

1. メインリポジトリで E2E テストを実行し、全テストが PASS することを確認する
   ```bash
   cd /path/to/main-repo && pnpm --filter @repo/desktop test:e2e
   ```
2. Worktree 環境で Layer 1〜2 のテストを実行し、PASS することを確認する
   ```bash
   cd /path/to/worktree && pnpm vitest run src/main/ipc/__tests__/skillHandlers
   ```
3. CI で E2E テストジョブが正常に実行されることを確認する（PR 作成によるトリガー）
4. `deferred-tests.md` を使った追跡ワークフローを模擬実行する
5. Phase 11 テンプレートの Worktree セクションを使って模擬 Phase 11 を実行する

#### 成果物

- `outputs/phase-4/validation-report.md`（検証結果レポート）

#### 完了条件

- [ ] メインリポジトリで E2E テストが全 PASS している
- [ ] Worktree 環境で Layer 1〜2 テストが全 PASS している
- [ ] CI で E2E テストジョブが正常実行されている
- [ ] 追跡ワークフローの模擬実行が成功している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Worktree 環境用 Phase 11 代替テストプロトコルが文書化されている
- [ ] テスト3層分類（Layer 1〜3）が定義され、各 Layer の実施基準が明確である
- [ ] Playwright ベースの E2E テストスクリプトが作成され、IPC 通信テストが自動化されている
- [ ] 未実施テスト追跡用の `deferred-tests.md` テンプレートが作成されている
- [ ] Phase 13 の完了条件に「deferred-tests.md の全項目解消」が含まれている

### 品質要件

- [ ] E2E テストが CI 環境（ubuntu-latest + xvfb-run）で安定して実行される
- [ ] E2E テストのカバレッジが Phase 11 の典型的テストケース（IPC通信・UI操作）を網羅している
- [ ] `pnpm lint` が PASS する
- [ ] `pnpm typecheck` が PASS する
- [ ] 全テスト（ユニットテスト + E2E テスト）が PASS する

### ドキュメント要件

- [ ] `phase-11-12-guide.md` に Worktree 代替手順セクションが追加されている
- [ ] プロトコル文書が100人中100人が同じ理解で実行できる粒度である
- [ ] 実装ガイド（Part 1: 概念説明、Part 2: 実装詳細）が作成されている

---

## 6. 検証方法

### テストケース

| TC-ID | テスト内容                                                   | 期待結果                                       |
| ----- | ------------------------------------------------------------ | ---------------------------------------------- |
| V-001 | メインリポジトリで E2E テストを実行                          | 全テストが PASS する                           |
| V-002 | Worktree 環境で Layer 1（自動テスト）を実行                  | 全テストが PASS する                           |
| V-003 | Worktree 環境で Layer 2（静的検証）を実行                    | IPC 契約の整合性が確認される                   |
| V-004 | CI で E2E テストジョブを実行                                 | ジョブが正常完了し、テスト結果がレポートされる |
| V-005 | Phase 11 テンプレートの Worktree セクションで模擬実行        | 手順に従って Layer 1〜2 テストが実施できる     |
| V-006 | `deferred-tests.md` に未実施テストを記録し追跡               | Phase 13 で未実施テストの存在が検出される      |
| V-007 | Worktree 環境判定（`.git` がファイルかディレクトリか）を実行 | Worktree 環境が正しく判定される                |

### 検証手順

1. **ローカル検証**:

   ```bash
   # メインリポジトリで E2E テスト実行
   cd /path/to/main-repo
   pnpm --filter @repo/desktop build
   pnpm --filter @repo/desktop test:e2e

   # Worktree 環境で Layer 1 テスト実行
   cd /path/to/worktree
   pnpm vitest run src/main/ipc/__tests__/skillHandlers --reporter=verbose
   ```

2. **CI 検証**:

   ```bash
   # PR を作成して CI トリガー
   gh pr create --draft --title "test: e2e desktop tests integration"
   # Actions タブで e2e-desktop ジョブの実行を確認
   ```

3. **Worktree 環境判定検証**:
   ```bash
   # Worktree 環境の判定
   if [ -f .git ]; then
     echo "Worktree environment detected"
   else
     echo "Main repository"
   fi
   ```

---

## 7. リスクと対策

| リスク                                                                 | 影響度 | 発生確率 | 対策                                                                                                               |
| ---------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| Playwright の Electron サポートが不安定で CI で flaky テストが発生する | 高     | 中       | リトライ機構（`retries: 2`）を設定する。flaky テストは `test.fixme()` で一時的に無効化し、Issue を作成して追跡する |
| CI 環境（ubuntu-latest）で Electron の headless 起動が失敗する         | 中     | 中       | `xvfb-run` を使用する。失敗時は `apt-get install -y xvfb libgtk-3-0 libnss3` で依存パッケージを追加する            |
| E2E テストの実行時間が CI 全体の実行時間を大幅に増加させる             | 中     | 低       | E2E テストは `build` の `needs` に含めず、並列実行とする。タイムアウトを15分に設定する                             |
| Worktree 環境の制約が Electron バージョンアップで変化する              | 低     | 低       | Electron メジャーバージョンアップ時にプロトコルの動作確認を実施する。変更があればプロトコル文書を更新する          |
| `deferred-tests.md` の追跡が形骸化する                                 | 中     | 中       | Phase 13 の完了条件チェックリストに組み込み、CI で `deferred-tests.md` の未解消項目を検出するスクリプトを追加する  |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                                                 | 内容                                          |
| ---------------------------------------------------------------------------- | --------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | Electron 3プロセスモデルの概要                |
| `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | IPC 通信のセキュリティ原則                    |
| `.claude/rules/06-known-pitfalls.md`                                         | 既知の落とし穴（P40, P11, P44, P45）          |
| `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`  | Phase 11/12 実行ガイド                        |
| `docs/30-workflows/ut-fix-skill-remove-interface/phase-11-manual-test.md`    | 発見元 Phase 11 仕様書（TC-001〜TC-008 定義） |

### 関連 Pitfall

| Pitfall ID | タイトル                                       | 関連性                                                |
| ---------- | ---------------------------------------------- | ----------------------------------------------------- |
| P40        | テスト実行ディレクトリ依存（モノレポ）         | Worktree 環境での vitest.config.ts 読み込みパスの問題 |
| P11        | PostToolUse フックによる Edit 失敗             | Worktree 環境でのフック実行パスの問題                 |
| P44        | skill:import/remove IPC インターフェース不整合 | Phase 11 で検出対象だった IPC 不整合パターン          |
| P45        | IPC引数命名の契約ドリフト                      | Phase 11 で検出対象だった引数命名不整合パターン       |

### 関連タスク

| タスクID                          | 関係   | 説明                                      |
| --------------------------------- | ------ | ----------------------------------------- |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | 発見元 | Phase 11 で Worktree 制約が判明したタスク |
| UT-FIX-SKILL-IMPORT-INTERFACE-001 | 関連   | 同様の Phase 11 制約が確認されたタスク    |

### 参考資料

- [Playwright Electron テスト公式ドキュメント](https://playwright.dev/docs/api/class-electron)
- [GitHub Actions での Electron テスト実行](https://www.electronjs.org/docs/latest/tutorial/automated-testing#with-playwright)

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
UT-FIX-SKILL-REMOVE-INTERFACE-001 Phase 11:
Worktree環境ではElectronアプリが起動できず、計画していた手動テストケース（TC-001〜TC-008）が
全て未実施。Phase 11仕様書に「代替手段: メインリポジトリでの実施」と記載したが、
実施タイミングの管理方法が未定義。
```

### 補足事項

- 本指示書は未実施タスクとして `docs/30-workflows/unassigned-task/` に配置する
- 完了時は `completed-tasks/unassigned-task/` へ移管し、`task-workflow.md` の参照先を同時更新する
- Worktree 環境判定は `.git` がファイル（Worktree）かディレクトリ（メインリポジトリ）かで判定可能: `[ -f .git ]` が true なら Worktree 環境
- 本プロトコルは skill:remove/import に限らず、全ての IPC 関連タスクの Phase 11 に適用される汎用プロトコルとして設計する
