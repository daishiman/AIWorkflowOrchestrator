# Phase 2: アーキテクチャ設計書 — SubAgent責務マトリクス + 監査基準設計

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| タスクID   | UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001               |
| Phase      | 2                                                        |
| 作成日     | 2026-03-03                                               |
| ステータス | completed                                                |
| 担当タスク | Task 2-1（SubAgent責務マトリクス）/ Task 2-4（監査基準） |

---

## 1. SubAgent責務マトリクス設計（Task 2-1）

### 1.1 設計原則

- **粒度**: 1仕様書=1SubAgent を厳守する。複数仕様書を1SubAgentに割り当てない
- **依存方向**: 実装系（interfaces/api-ipc/security）→ 台帳系（task-workflow）→ 教訓系（lessons）の一方向チェーン
- **完了条件**: 各SubAgentが自律的に判定可能な条件を設定する（外部確認不要）
- **P43対策**: 1SubAgentあたり3ファイル以下の更新に限定する

### 1.2 プロファイル一覧と選択基準

| プロファイルID | プロファイル名            | 適用タスク種別                        | SubAgent数 |
| -------------- | ------------------------- | ------------------------------------- | ---------- |
| P-STD5         | 標準5仕様書プロファイル   | IPC/API変更あり + コード実装あり      | 5          |
| P-UI6          | UI機能6仕様書プロファイル | UI変更あり + コード実装あり           | 6          |
| P-RECHECK      | 再確認プロファイル        | コード変更なし + ドキュメント改善のみ | 5          |

#### プロファイル選択基準（一意に決定できる判定木）

```
Phase 12 開始時:

(1) コード変更あり？
    YES → (2) へ
    NO  → プロファイル P-RECHECK を適用

(2) UI変更あり（新規コンポーネント/機能 UI追加）？
    YES → プロファイル P-UI6 を適用
    NO  → (3) へ

(3) IPC/API変更あり（新規チャネル/型定義変更）？
    YES → プロファイル P-STD5 を適用
    NO  → (4) へ

(4) task-workflow.md に Step 2 更新対象（arch/api/interfaces/security）の記載あり？
    YES → プロファイル P-STD5 を適用
    NO  → プロファイル P-RECHECK を適用
```

---

### 1.3 プロファイル P-STD5: 標準5仕様書プロファイル

**適用条件**: IPC/API変更あり + コード実装あり（新規チャネル、型定義変更、Main/Preload変更）

| SubAgent   | 担当仕様書                      | 主担当作業                                         | 依存関係       | 完了条件                                                |
| ---------- | ------------------------------- | -------------------------------------------------- | -------------- | ------------------------------------------------------- |
| SubAgent-A | `references/interfaces-*.md`    | 型/API契約の同期                                   | 実装差分確定後 | 実装型と仕様型の差分ゼロ。Preload公開型が明記されている |
| SubAgent-B | `references/api-ipc-*.md`       | IPCチャネル契約（request/response/validation）同期 | A完了後        | チャネル表・実装状況表が実装と一致                      |
| SubAgent-C | `references/security-*.md`      | sender/P42/入力検証/エラーサニタイズ同期           | B完了後        | セキュリティ要件の欠落ゼロ。許可値リスト最新            |
| SubAgent-D | `references/task-workflow.md`   | 完了台帳・検証証跡・残課題同期                     | A/B/C完了後    | 実装内容 + 証跡 + 苦戦箇所が同一ターンで記録済み        |
| SubAgent-E | `references/lessons-learned.md` | 苦戦箇所の再利用可能化                             | D完了後        | 再発条件付きで簡潔解決手順が記録済み                    |

**依存チェーン**: A → B → C → D → E（一方向、各段階で前段の完了を確認してから開始）

---

### 1.4 プロファイル P-UI6: UI機能6仕様書プロファイル

**適用条件**: UI変更あり + コード実装あり（新規コンポーネント、feature UI追加）

| SubAgent   | 担当仕様書                               | 主担当作業                       | 依存関係       | 完了条件                                   |
| ---------- | ---------------------------------------- | -------------------------------- | -------------- | ------------------------------------------ |
| SubAgent-A | `references/ui-ux-components.md`         | 主要UI一覧・完了タスク・導線同期 | 実装差分確定後 | UI正本へ反映済み                           |
| SubAgent-B | `references/ui-ux-feature-components.md` | 機能仕様・未タスク・苦戦箇所同期 | A完了後        | 機能仕様と再利用手順が記録済み             |
| SubAgent-C | `references/arch-ui-components.md`       | UI構造と責務境界の同期           | A/B完了後      | コンポーネント階層・責務が整合             |
| SubAgent-D | `references/arch-state-management.md`    | 状態管理設計の同期               | C完了後        | 状態境界が整合。P31対策記録済み            |
| SubAgent-E | `references/task-workflow.md`            | 完了台帳・検証証跡・残課題同期   | A/B/C/D完了後  | 実装 + 証跡 + 未タスクが同一ターン記録済み |
| SubAgent-F | `references/lessons-learned.md`          | 再発条件付き教訓の同期           | E完了後        | 苦戦箇所と簡潔手順が再利用可能             |

**依存チェーン**: A → B → C → D → E → F（一方向）

---

### 1.5 プロファイル P-RECHECK: 再確認プロファイル

**適用条件**: コード変更なし + ドキュメント改善のみ（Phase 12運用改善タスクに該当）

本タスク（UT-IMP-PHASE12-SUBAGENT-ARTIFACT-GUARD-001）はこのプロファイルを適用する。

| SubAgent   | 担当範囲                                                  | 主担当作業                                   | 依存関係     | 完了条件                                                                                                 |
| ---------- | --------------------------------------------------------- | -------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| SubAgent-A | `references/task-workflow.md`                             | 完了台帳・残課題テーブル・検証証跡同期       | 成果物確定後 | 完了タスク + 証跡 + 苦戦箇所が記録済み                                                                   |
| SubAgent-B | `references/lessons-learned.md`                           | 苦戦箇所の再発条件付き教訓化                 | A完了後      | 再発条件 + 簡潔解決手順が記録済み                                                                        |
| SubAgent-C | `docs/30-workflows/unassigned-task/`                      | 未タスク指示書配置・10見出し確認・監査実行   | B完了後      | `missing=0` かつ `currentViolations=0` かつ `rg -n '^## メタ情報$' <unassigned-file>` が1件のみ          |
| SubAgent-D | 検証スクリプト実行                                        | verify/validate/audit/links の順次実行と記録 | C完了後      | 4スクリプト全PASS。`current=合否/baseline=監視`で記録                                                    |
| SubAgent-E | `spec-update-summary.md` / `spec-sync-subagent-report.md` | Step 2判定同期・三点突合確認                 | D完了後      | `spec-sync-subagent-report.md` が outputs/phase-12/ に存在し、かつ summary/report/changelog の三点が整合 |

**依存チェーン**: A → B → C → D → E（一方向）

---

### 1.6 Step 2 判定同期チーム（全プロファイル共通）

Step 2判定を三点突合するための専任SubAgentチームを全プロファイルに追加する。

| SubAgent      | 担当範囲                                      | 主担当作業                              | 完了条件                                                  |
| ------------- | --------------------------------------------- | --------------------------------------- | --------------------------------------------------------- |
| SubAgent-S2-A | `phase-12-documentation.md`                   | Step 2 更新対象の要否判定を確定         | 更新対象に応じて Step 2 を「完了」/「該当なし」で説明可能 |
| SubAgent-S2-B | `outputs/phase-12/documentation-changelog.md` | Step 判定（1-A〜2）と理由の同期         | Step 2 判定が実装実体と一致                               |
| SubAgent-S2-C | `outputs/phase-12/spec-update-summary.md`     | Step 2 更新仕様書の一覧化と反映内容同期 | changelog の Step 2 判定と更新対象一覧が一致              |

**Step 2 判定同期チームの実行タイミング**: 各プロファイルのメインSubAgentが全て完了した後に実行する。

---

## 2. 監査基準設計（Task 2-4）

### 2.1 current/baseline分離判定ルール

**目的**: 今回タスクが新たに作り出した違反（current）と、着手前から存在する違反（baseline）を分離することで、合否判定を「今回変更分のみ」に限定する。

| 区分                 | 定義                                             | 合否判定への使用       | 記録方法           |
| -------------------- | ------------------------------------------------ | ---------------------- | ------------------ |
| `currentViolations`  | 今回タスクの変更（新規作成・編集）で発生した違反 | **合否判定に使用**     | 0でPASS、>0でFAIL  |
| `baselineViolations` | 着手前から存在する既存の違反                     | **監視値として別記録** | 件数を記録するのみ |

### 2.2 合否基準

| 条件                           | 判定       | 対応                                         |
| ------------------------------ | ---------- | -------------------------------------------- |
| `currentViolations.total = 0`  | **PASS**   | Phase 12完了可。baselineViolationsは別記録   |
| `currentViolations.total > 0`  | **FAIL**   | 今回タスク内で修正必須。FAIL解消まで完了不可 |
| `baselineViolations.total > 0` | 判定対象外 | 監視値として記録。本タスクの合否に影響しない |

**重要**: baselineViolationsが多数存在しても、currentViolations=0であればPASS。baselineViolations解消は本タスクのスコープ外。

### 2.3 記録フォーマット（標準形式）

```
audit-unassigned-tasks: 全体 PASS/FAIL（baseline: N件, current: M件）→ current PASS/FAIL
```

**記録例（PASS）:**

```
audit-unassigned-tasks: 全体 FAIL（baseline: 12件, current: 0件）→ current PASS
```

**記録例（FAIL）:**

```
audit-unassigned-tasks: 全体 FAIL（baseline: 12件, current: 3件）→ current FAIL（今回修正必須）
```

### 2.4 判定に使用するスクリプトと引数対応表

| スクリプト                                              | 引数               | 用途                 | 判定対象             | 合格条件                           |
| ------------------------------------------------------- | ------------------ | -------------------- | -------------------- | ---------------------------------- |
| `audit-unassigned-tasks.js --json`                      | なし               | 全体監査（全件）     | `baselineViolations` | 合否判定に使用しない（監視値のみ） |
| `audit-unassigned-tasks.js --json --target-file <path>` | 対象ファイルのパス | 対象ファイル形式監査 | `currentViolations`  | `currentViolations.total = 0`      |
| `audit-unassigned-tasks.js --json --diff-from HEAD`     | `HEAD`             | 今回差分監査         | `currentViolations`  | `currentViolations.total = 0`      |

### 2.5 判定スクリプト実行順序（Step 1-G準拠）

以下の順序で実行し、全て合格することを確認する。前スクリプトの失敗は後続スクリプトに影響しないが、全件の合否を独立して記録する。

```bash
# ステップ1: 参照リンク整合確認（前提条件）
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
# 期待: missing: 0

# ステップ2: 対象ファイル形式監査（currentViolations確認）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --target-file <unassigned-file-path>
# 期待: currentViolations.total = 0

# ステップ3: 今回差分監査（currentViolations確認）
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json --diff-from HEAD
# 期待: currentViolations.total = 0（baselineViolationsは別記録）

# ステップ4: 仕様書準拠確認
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/completed-tasks/phase12-subagent-artifact-guard --json
# 期待: errors: 0
```

### 2.6 監査基準と受入基準（AC-FR-04）の対応

| 受入基準                                          | 監査スクリプト           | 合格条件                      |
| ------------------------------------------------- | ------------------------ | ----------------------------- |
| AC-FR-04 (1): target-fileのcurrentViolations=0    | `audit --target-file`    | `currentViolations.total = 0` |
| AC-FR-04 (2): diff-from HEADのcurrentViolations=0 | `audit --diff-from HEAD` | `currentViolations.total = 0` |
| AC-FR-04 (3): baselineViolationsは別記録          | `audit --json`（全体）   | 件数を監視値として記録        |

---

## 3. 親タスク教訓4件の反映確認

| 教訓No | 教訓内容                                | 設計での反映箇所                                                                |
| ------ | --------------------------------------- | ------------------------------------------------------------------------------- |
| 教訓①  | Main/Preload契約差（IpcResult<T> vs T） | P-STD5のSubAgent-Aの完了条件に「Preload公開型が明記されている」を追加           |
| 教訓②  | Phase 12成果物名のドリフト              | Step 2判定同期チーム（SubAgent-S2-A/B/C）で三点突合を義務化                     |
| 教訓③  | 未タスク`## メタ情報`重複               | P-RECHECKのSubAgent-Cの完了条件に`rg -n '^## メタ情報$'`検証を含める            |
| 教訓④  | SubAgent責務が成果物に残らない          | P-RECHECK適用時、SubAgent-Eで`spec-sync-subagent-report.md`作成を完了条件にする |

---

## 4. 多角的チェック観点

| 観点     | 確認内容                              | 設計での対応                                                               |
| -------- | ------------------------------------- | -------------------------------------------------------------------------- |
| 一意性   | プロファイル選択が一意に決定できるか  | §1.2の判定木で3条件（コード変更/UI変更/IPC変更）で一意決定                 |
| 機械検証 | SubAgent完了条件がgrep/rgで確認可能か | 各完了条件に「差分ゼロ」「ゼロ件」「存在確認」等の機械検証可能な表現を使用 |
| P43対策  | 1SubAgentの更新ファイル数が3以下か    | 各SubAgentが1仕様書のみを担当（最大2ファイル：仕様書本体 + 変更履歴）      |
| 依存方向 | 実装系→台帳系→教訓系の一方向か        | §1.3〜1.5の依存チェーンで一方向を明示                                      |
| 再利用性 | 別タスクに適用できるか                | プロファイルIDとプレースホルダーで汎用化                                   |

---

## 5. 変更履歴

| バージョン | 日付       | 内容                                                                                                            |
| ---------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| 1.0.0      | 2026-03-03 | Phase 2アーキテクチャ設計書初版作成                                                                             |
| 1.1.0      | 2026-03-03 | Phase 3 MINOR修正適用: [3-1-M1]判定木4段階化、[3-5-M2]SubAgent-C rgコマンド明示、[3-5-M3]SubAgent-E存在確認追加 |
