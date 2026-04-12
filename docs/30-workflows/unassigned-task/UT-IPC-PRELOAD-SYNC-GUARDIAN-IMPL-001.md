# ipc-preload-spec-sync-guardian スキル実装タスク - タスク指示書

## メタ情報

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-IPC-PRELOAD-SYNC-GUARDIAN-IMPL-001                                      |
| タスク名     | ipc-preload-spec-sync-guardian スキル実装タスク                            |
| 分類         | 改善（ツール整備）                                                         |
| 対象機能     | `.agents/skills/ipc-preload-spec-sync-guardian/` スキルの実装スクリプト群  |
| 優先度       | 中                                                                         |
| 見積もり規模 | 中規模                                                                     |
| ステータス   | 未実施                                                                     |
| 発見元       | Phase 1 ブランチ分析（2026-04-11）                                         |
| 発見日       | 2026-04-11                                                                 |
| 関連タスク   | task-9D〜9J（IPC channel SSoT）/ UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`ipc-preload-spec-sync-guardian` スキルは `SKILL.md` と `SKILL-changelog.md` のみが存在する状態で、実際の監査・検証スクリプト群（grep/validator）が未作成である。

SKILL.md には以下のスクリプトが参照されている：

- `scripts/audit_task9_spec_sync.js` — task-9D〜9J の旧参照・artifacts不足を監査
- `scripts/validate_all.js` — スキル構造と監査結果をまとめて検証
- `scripts/log_usage.js` — 使用ログ記録

また、エージェント定義ファイル（`agents/audit-task9-spec.md` / `agents/patch-task9-spec.md` / `agents/sync-system-spec.md`）とリファレンスファイル（`references/spec-sync-checklist.md` / `references/quick-recovery-playbook.md` / `references/patterns.md`）も未作成である。

### 1.2 問題点・課題

- スキルが参照するスクリプトが存在しないため、`ipc-preload-spec-sync-guardian` スキルを実際に呼び出しても監査が実行できない
- `preload/channels.ts` と `packages/shared/src/ipc/channels.ts` の整合性チェックを人手で行う必要があり、ドリフト検出が後手になる
- UT-SDK-07 以降、APPROVAL/EXECUTION チャネルの正本が `packages/shared/src/ipc/channels.ts` に移管されたが、`preload/channels.ts` との parity を自動検証する仕組みがない
- 監査スコープ（Skill Creator ワークフロー IPC / 外部API IPC / 出力統合 IPC）が SKILL.md に定義されているにもかかわらず、検証できる状態になっていない

### 1.3 放置した場合の影響

- IPC チャネルの SSoT（Single Source of Truth）が `packages/shared/src/ipc/channels.ts` に移管されても、`preload/channels.ts` との差分が検出されず仕様ドリフトが蓄積する
- task-9D〜9J 仕様書の旧参照パス混在（`preload/skillAPI.ts` vs `preload/skill-api.ts` 等）が再発した際に、手動での発見まで時間がかかる
- `UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001`（CI ガード運用タスク）の前提となる監査スクリプトが存在しないため、CI 組み込みも不可能なまま停滞する

---

## 2. 何を達成するか（What）

### 2.1 目的

`ipc-preload-spec-sync-guardian` スキルで参照されているスクリプト群・エージェント定義・リファレンスファイルを実際に作成し、IPC/Preload 仕様の整合性を自動監査できる状態にする。

### 2.2 最終ゴール

1. `scripts/audit_task9_spec_sync.js` が実行可能で、旧参照パス・artifacts 不足・Date 方針ドリフトを検出できる
2. `scripts/validate_all.js` がスキル構造全体を検証できる
3. `scripts/log_usage.js` が使用ログを記録できる
4. エージェント定義ファイル（3ファイル）が spec に従って実行可能である
5. リファレンスファイル（`spec-sync-checklist.md` / `quick-recovery-playbook.md` / `references/patterns.md`）が整備されている
6. `node .agents/skills/ipc-preload-spec-sync-guardian/scripts/audit_task9_spec_sync.js --format markdown` が markdown 形式の差分レポートを出力できる

### 2.3 スコープ

#### 含むもの

- `scripts/` 配下の 3 スクリプト実装（audit_task9_spec_sync.js / validate_all.js / log_usage.js）
- `agents/` 配下の 3 エージェント定義 MD 作成（audit-task9-spec.md / patch-task9-spec.md / sync-system-spec.md）
- `references/` 配下の 3 リファレンス MD 作成（spec-sync-checklist.md / quick-recovery-playbook.md / patterns.md）
- `.claude/skills/ipc-preload-spec-sync-guardian/` への mirror 同期（`.agents` 側が正本）
- 実装内容の基本テスト（スクリプト実行が成功すること）

#### 含まないもの

- task-9D〜9J 仕様書自体の修正（別タスク: UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001）
- CI 組み込み（別タスク: UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001）
- IPC チャネルの実装コード変更（別タスク: UT-IPC-EXECUTION-CHANNELS-PARITY-001 等）
- SKILL.md・SKILL-changelog.md の内容変更（既に存在するため）

### 2.4 成果物

| 種別             | 成果物                                              | 配置先                                                         |
| ---------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| スクリプト       | audit_task9_spec_sync.js                            | `.agents/skills/ipc-preload-spec-sync-guardian/scripts/`       |
| スクリプト       | validate_all.js                                     | `.agents/skills/ipc-preload-spec-sync-guardian/scripts/`       |
| スクリプト       | log_usage.js                                        | `.agents/skills/ipc-preload-spec-sync-guardian/scripts/`       |
| エージェント定義 | audit-task9-spec.md                                 | `.agents/skills/ipc-preload-spec-sync-guardian/agents/`        |
| エージェント定義 | patch-task9-spec.md                                 | `.agents/skills/ipc-preload-spec-sync-guardian/agents/`        |
| エージェント定義 | sync-system-spec.md                                 | `.agents/skills/ipc-preload-spec-sync-guardian/agents/`        |
| リファレンス     | spec-sync-checklist.md                              | `.agents/skills/ipc-preload-spec-sync-guardian/references/`    |
| リファレンス     | quick-recovery-playbook.md                          | `.agents/skills/ipc-preload-spec-sync-guardian/references/`    |
| リファレンス     | patterns.md                                         | `.agents/skills/ipc-preload-spec-sync-guardian/references/`    |
| mirror           | .claude/skills/ipc-preload-spec-sync-guardian/ 全体 | `.claude/skills/ipc-preload-spec-sync-guardian/`（rsync 同期） |
| タスク仕様書     | Phase 1〜13 完了記録                                | このファイル（UT-IPC-PRELOAD-SYNC-GUARDIAN-IMPL-001.md）       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.agents/skills/ipc-preload-spec-sync-guardian/SKILL.md` が存在すること（確認済み）
- `.agents/skills/ipc-preload-spec-sync-guardian/SKILL-changelog.md` が存在すること（確認済み）
- Node.js 実行環境が利用可能であること
- `apps/desktop/src/preload/channels.ts` と `packages/shared/src/ipc/channels.ts` が存在すること

### 3.2 依存タスク

| タスクID                                  | ステータス  | 関係                                                 |
| ----------------------------------------- | ----------- | ---------------------------------------------------- |
| task-9D（IPC channel SSoT 定義）          | 完了/進行中 | 監査スコープの正本定義元                             |
| task-9E〜9J（各 IPC 実装）                | 完了/進行中 | 監査対象ファイルの存在前提                           |
| UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001 | 未実施      | 本タスク完了後に CI 組み込みが可能になる（後続依存） |
| UT-IPC-EXECUTION-CHANNELS-PARITY-001      | 未実施      | 監査で検出される不整合の修正タスク（独立実行可能）   |

### 3.3 必要な知識

- IPC/Preload アーキテクチャ（Main プロセス / Renderer プロセス / Preload スクリプトの役割）
- `packages/shared/src/ipc/channels.ts` の SSoT 構造（`APPROVAL_CHANNELS` / `EXECUTION_CHANNELS` / `SKILL_CREATOR_EXTERNAL_API_CHANNELS`）
- task-9D〜9J 仕様書の artifacts 構造と必須項目
- Node.js スクリプト実装（fs / path / readline）
- grep パターンおよび TypeScript AST の概念

### 3.4 推奨アプローチ

1. **Script First 原則**：先に `scripts/audit_task9_spec_sync.js` の基本骨格を作成し、実行が通ることを確認する
2. **段階的スコープ拡張**：最初は旧パス検出（grep ベース）のみ実装し、その後 artifacts 検証・Date 方針チェックを追加する
3. **テスト前検証**：スクリプト実行前にターゲットファイルの存在確認を必ず行う
4. **AST は将来拡張**：TypeScript compiler API による型解析は今回スコープ外とし、正規表現ベースで対応できる範囲の検証を優先する（苦戦箇所参照）

---

## 4. 実行手順

### Phase構成

本タスクは task-specification-creator の Phase 1〜13 に従って実行する。
スクリプト実装（Phase 5）とエージェント/リファレンス定義（Phase 5 並列）を中心に進める。

### Phase 1: 要件定義

#### 目的

監査スクリプトの仕様を確定し、実装対象を固定する。

#### 手順

1. `.agents/skills/ipc-preload-spec-sync-guardian/SKILL.md` を読んで監査スコープを確認する
2. `apps/desktop/src/preload/channels.ts` と `packages/shared/src/ipc/channels.ts` の現在の状態を確認する
3. 監査観点を3軸（旧パス残存 / artifacts不足 / IPC チャネル parity）に確定する
4. 既存の命名規則（camelCase / kebab-case）を記録する
5. タスク分類を「ツール整備（docs-only ではない）」として宣言する

#### 成果物

- 監査観点定義メモ（要件定義記録）
- 対象ファイル一覧

#### 完了条件

- 監査観点3軸が明文化されている
- 実装対象ファイルが一覧化されている

---

### Phase 2: 設計

#### 目的

スクリプト・エージェント・リファレンスの構造を設計する。

#### 手順

1. `audit_task9_spec_sync.js` のアーキテクチャを設計する（入力/処理/出力）
2. 旧パス検出の grep パターンを定義する（`preload/skillAPI.ts` / `main/ipc/channels.ts` 等）
3. artifacts 必須項目セット（4項目 + domain型）を定義する
4. `--format markdown` オプション時の出力形式を定義する
5. エージェント定義 MD の責務分担テーブルを設計する（audit/patch/sync の3役）

#### 成果物

- スクリプト設計書（入力・処理・出力の定義）
- grep パターン一覧
- エージェント責務分担表

#### 完了条件

- スクリプトの入力・処理・出力が明文化されている
- 正規表現ベースで対応できる範囲と AST が必要な範囲が分離されている

---

### Phase 3: 設計レビュー

#### 目的

Phase 4 へ進める設計品質かを判定する。

#### 手順

1. 設計で定義した grep パターンが false positive を生まないか確認する
2. 旧参照パスの検出漏れリスクがないか確認する
3. エージェント責務の重複・漏れを確認する

#### 完了条件

- PASS / MINOR / MAJOR の3段階で判定し、MAJOR がなければ Phase 4 へ進む
- MINOR 指摘は未タスクとして記録してから進む

---

### Phase 4: テスト作成（TDD Red）

#### 目的

スクリプト実装前に期待動作を定義する。

#### 手順

1. `audit_task9_spec_sync.js` の期待出力テストケースを定義する（TC-01〜TC-05）
   - TC-01: 旧パス `preload/skillAPI.ts` が存在する場合 fail を返す
   - TC-02: 旧パス `main/ipc/channels.ts` が存在する場合 fail を返す
   - TC-03: 必須 artifacts が欠落している場合 fail を返す
   - TC-04: Date 方針違反（`Date` 型がIPC境界に残存）を検出する
   - TC-05: 全指摘なしの場合 pass を返す
2. `validate_all.js` のテストケースを定義する（TC-06〜TC-08）
3. テストが現時点では実行できない（Red）ことを確認する

#### 完了条件

- テストケース TC-01〜TC-08 が定義されている
- スクリプトが存在しないため全テストが Red であることを確認している

---

### Phase 5: 実装

#### 目的

スクリプト・エージェント・リファレンスを実際に作成する。

#### 新規作成ファイル

| ファイル                                                                              | 種別                     |
| ------------------------------------------------------------------------------------- | ------------------------ |
| `.agents/skills/ipc-preload-spec-sync-guardian/scripts/audit_task9_spec_sync.js`      | スクリプト（新規）       |
| `.agents/skills/ipc-preload-spec-sync-guardian/scripts/validate_all.js`               | スクリプト（新規）       |
| `.agents/skills/ipc-preload-spec-sync-guardian/scripts/log_usage.js`                  | スクリプト（新規）       |
| `.agents/skills/ipc-preload-spec-sync-guardian/agents/audit-task9-spec.md`            | エージェント定義（新規） |
| `.agents/skills/ipc-preload-spec-sync-guardian/agents/patch-task9-spec.md`            | エージェント定義（新規） |
| `.agents/skills/ipc-preload-spec-sync-guardian/agents/sync-system-spec.md`            | エージェント定義（新規） |
| `.agents/skills/ipc-preload-spec-sync-guardian/references/spec-sync-checklist.md`     | リファレンス（新規）     |
| `.agents/skills/ipc-preload-spec-sync-guardian/references/quick-recovery-playbook.md` | リファレンス（新規）     |
| `.agents/skills/ipc-preload-spec-sync-guardian/references/patterns.md`                | リファレンス（新規）     |

#### 手順

1. `audit_task9_spec_sync.js` を実装する（grep ベース、旧パス検出 → artifacts 検証 → Date 方針チェックの順）
2. `validate_all.js` を実装する（スキル構造チェックと audit 実行をまとめる）
3. `log_usage.js` を実装する（`--result` / `--phase` オプションをサポート）
4. エージェント定義 3 ファイルを実装する
5. リファレンス 3 ファイルを実装する
6. `.claude/skills/ipc-preload-spec-sync-guardian/` へ rsync で mirror する

#### 完了条件

- `node .agents/skills/ipc-preload-spec-sync-guardian/scripts/audit_task9_spec_sync.js --format markdown` が実行できる
- `node .agents/skills/ipc-preload-spec-sync-guardian/scripts/validate_all.js` が実行できる

---

### Phase 6: テスト拡充

#### 目的

エッジケース・回帰ガードを追加する。

#### 手順

1. 複数の旧パスが混在する場合のテストケースを追加する（TC-09）
2. 対象外ファイル（task-9系以外）を誤検出しないことを確認する（TC-10）
3. `--format markdown` 出力の形式を検証するテストケースを追加する（TC-11）

#### 完了条件

- TC-09〜TC-11 が定義・実行されている

---

### Phase 7: カバレッジ確認

#### 目的

変更したスクリプトの主要分岐が検証されていることを確認する。

#### 手順

1. `audit_task9_spec_sync.js` の主要分岐（旧パス検出 / artifacts 検証 / Date 方針 / pass 判定）のカバレッジを確認する
2. 未検証の分岐があれば TC を追加する

#### 完了条件

- 主要分岐のカバレッジが確保されている（具体的数値はスクリプト規模による）

---

### Phase 8: リファクタリング

#### 目的

重複・ナビゲーションドリフトを除去する。

#### 手順

1. `audit_task9_spec_sync.js` の旧パスパターン定義を定数化する
2. エラーメッセージの文言を統一する
3. SKILL.md のスクリプト参照パスと実際の配置が一致していることを確認する

| 対象             | Before           | After                    | 理由               |
| ---------------- | ---------------- | ------------------------ | ------------------ |
| 旧パスパターン   | インライン文字列 | `OLD_PATH_PATTERNS` 定数 | 変更箇所の一元管理 |
| エラーメッセージ | 各箇所で個別定義 | `MESSAGES` オブジェクト  | 文言統一           |

#### 完了条件

- 同一パターンが複数箇所に散在していない

---

### Phase 9: 品質保証

#### 目的

lint・typecheck・構造検証を一括確認する。

#### 手順

1. `pnpm lint` を実行してエラーがないことを確認する
2. スクリプトが Node.js で実行できることを確認する（`node --check`）
3. `.agents/skills/ipc-preload-spec-sync-guardian/` と `.claude/skills/ipc-preload-spec-sync-guardian/` の parity を `diff -qr` で確認する

#### 完了条件

- lint PASS
- Node.js 実行可能
- `.claude` mirror が `.agents` 正本と一致している

---

### Phase 10: 最終レビュー

#### 目的

受入条件の充足と blocker の有無を判定する。

#### 手順

1. 全成果物ファイルの存在を確認する
2. `audit_task9_spec_sync.js --format markdown` の出力が SKILL.md の期待仕様と一致しているか確認する
3. エージェント定義の責務分担に重複・漏れがないか確認する

#### 完了条件

- PASS / MAJOR の判定でMAJORがなければ Phase 11 へ進む

---

### Phase 11: 手動テスト

#### 目的

実際のリポジトリ上でスクリプトを実行し、誤検出・見落としがないかを確認する。

#### 手順

1. `node .agents/skills/ipc-preload-spec-sync-guardian/scripts/audit_task9_spec_sync.js --format markdown` を実際のリポジトリで実行する
2. 検出結果を記録する（0件または実際の差分レポート）
3. `validate_all.js` を実行して PASS することを確認する

#### Phase 分類

本タスクはスクリプト実装タスクのため NON_VISUAL（スクリーンショット不要）。

#### 完了条件

- スクリプトが実リポジトリで実行できる
- 誤検出・クラッシュがない
- 実行結果を `outputs/phase-11/manual-test-result.md` に記録している

---

### Phase 12: ドキュメント更新

#### 目的

実装ガイド作成・仕様同期・未タスク検出を完了する。

#### 手順（Task 12-1〜12-5）

**Task 12-1: 実装ガイド作成（2パート構成）**

- Part 1（中学生レベル）: IPC 仕様の整合性チェックを「住所録の確認」に例えて説明
- Part 2（技術者レベル）: スクリプト API シグネチャ・使用例・エラーハンドリング

**Task 12-2: システム仕様書更新**

- Step 1-A: `aiworkflow-requirements/references/task-workflow.md` に完了記録を追加
- Step 1-B: 実装状況テーブルを `completed` へ更新
- Step 1-C: 関連タスクテーブルのステータスを更新
- LOGS.md（2ファイル）を更新
- SKILL.md 変更履歴を更新

**Task 12-3: ドキュメント更新履歴作成**

- `outputs/phase-12/documentation-changelog.md` を出力

**Task 12-4: 未タスク検出レポート作成（0件でも出力必須）**

- `outputs/phase-12/unassigned-task-detection.md` を出力

**Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力必須）**

- `outputs/phase-12/skill-feedback-report.md` を出力

#### 完了条件

- Phase 12 の 5 成果物が全て出力されている
- `task-workflow.md` の完了記録が追加されている
- LOGS.md 2 ファイルが更新されている

---

### Phase 13: PR作成

#### 目的

ユーザーの明示承認後に PR を作成する。

**PR 作成は自動実行しない。ユーザーの明示的な許可を得てから実行すること。**

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `audit_task9_spec_sync.js` が旧参照パス（`preload/skillAPI.ts` / `main/ipc/channels.ts`）を検出できる
- [ ] `audit_task9_spec_sync.js` が必須 artifacts 欠落を検出できる
- [ ] `audit_task9_spec_sync.js` が IPC 境界 Date 方針違反を検出できる
- [ ] `audit_task9_spec_sync.js --format markdown` が markdown 形式レポートを出力できる
- [ ] `validate_all.js` が実行できる
- [ ] `log_usage.js --result success --phase Phase4` が実行できる
- [ ] エージェント定義 3 ファイルが存在する
- [ ] リファレンス 3 ファイルが存在する

### 品質要件

- [ ] スクリプトが対象外ファイルを誤検出しない
- [ ] 監査コマンドが再現可能（同一入力で同一結果）
- [ ] `.agents/skills/ipc-preload-spec-sync-guardian/` と `.claude/skills/ipc-preload-spec-sync-guardian/` が同期されている

### ドキュメント要件

- [ ] `outputs/phase-12/implementation-guide.md` が Part 1/2 を満たしている
- [ ] `outputs/phase-12/documentation-changelog.md` が作成されている
- [ ] `outputs/phase-12/unassigned-task-detection.md` が作成されている（0件でも必須）
- [ ] `outputs/phase-12/skill-feedback-report.md` が作成されている
- [ ] `task-workflow.md` に完了記録が追加されている
- [ ] LOGS.md 2 ファイルが更新されている

---

## 6. 検証方法

### テストケース

| TC-ID | 観点                               | 期待結果            |
| ----- | ---------------------------------- | ------------------- |
| TC-01 | 旧パス `preload/skillAPI.ts` 残存  | fail + 箇所列挙     |
| TC-02 | 旧パス `main/ipc/channels.ts` 残存 | fail + 箇所列挙     |
| TC-03 | 必須 artifacts 欠落                | fail + 欠落項目列挙 |
| TC-04 | IPC 境界 Date 型残存               | fail + 箇所列挙     |
| TC-05 | 全指摘なし                         | pass                |
| TC-06 | validate_all.js 実行成功           | exit code 0         |
| TC-07 | 対象外ファイルの誤検出なし         | pass（検出0件）     |
| TC-08 | --format markdown 出力             | markdown 形式を確認 |

### 検証手順

```bash
# Phase 2: 監査スクリプト実行
node .agents/skills/ipc-preload-spec-sync-guardian/scripts/audit_task9_spec_sync.js \
  --format markdown

# Phase 2: スキル全体検証
node .agents/skills/ipc-preload-spec-sync-guardian/scripts/validate_all.js

# Phase 4: 使用ログ記録
node .agents/skills/ipc-preload-spec-sync-guardian/scripts/log_usage.js \
  --result success --phase Phase4

# mirror parity 確認
diff -qr \
  .agents/skills/ipc-preload-spec-sync-guardian \
  .claude/skills/ipc-preload-spec-sync-guardian

# 未タスクリンク整合
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js \
  --target .claude/skills/aiworkflow-requirements/references/task-workflow.md
```

---

## 7. リスクと対策

| リスク                                               | 影響度 | 発生確率 | 対策                                                                            |
| ---------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------- |
| grep ベースの旧パス検出で false positive 発生        | 中     | 中       | パターンを `path.basename` でファイル名単位に絞り、コンテキストを確認する       |
| TypeScript compiler API が必要なケースが出現         | 高     | 中       | 初回は正規表現ベースで実装し、compiler API は次フェーズの未タスクとして登録する |
| `.agents` と `.claude` の mirror がずれる            | 中     | 低       | Phase 9 で `diff -qr` を実行して確認する                                        |
| task-9D〜9J 仕様書パスが変更されてスクリプトが誤検知 | 中     | 低       | 対象ファイル一覧を設定ファイルで管理し、パス変更時は一覧も更新する              |
| Node.js バージョン差異でスクリプトが動作しない       | 低     | 低       | `#!/usr/bin/env node` を先頭に付与し、ES modules/CommonJS を明示する            |

---

## 8. 参照情報

### 関連ドキュメント

- `.agents/skills/ipc-preload-spec-sync-guardian/SKILL.md` — スキル定義（監査スコープ・ワークフロー）
- `.agents/skills/ipc-preload-spec-sync-guardian/SKILL-changelog.md` — スキル変更履歴
- `docs/30-workflows/unassigned-task/task-imp-ipc-preload-spec-sync-ci-guard-001.md` — CI 組み込みタスク（後続）
- `docs/30-workflows/unassigned-task/UT-IPC-EXECUTION-CHANNELS-PARITY-001.md` — 検出される不整合の修正タスク
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` — タスク台帳
- `.claude/skills/task-specification-creator/SKILL.md` — タスク仕様書スキル

### 参考スクリプト（同プロジェクト内の類似実装）

- `.claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js` — 未タスク検出スクリプトの参考実装
- `.claude/skills/task-specification-creator/scripts/verify-all-specs.js` — 仕様書全体検証スクリプトの参考実装

---

## 9. 備考

### 苦戦箇所【記入必須】

- L-ICON-001: Native title tooltip の overlay capture パターン（別タスクの教訓だが参考）
  - SKILL.md の `リソース参照` セクションに記載された `scripts/audit_task9_spec_sync.js` は、SKILL 定義時点では「将来実装予定」として記述されており、実際には存在しない。スキルを呼び出しても動作しない状態が長期間放置されていた点が今回の発見元。

- IPC channel の SSoT 定義と `preload/channels.ts` の差分検出は正規表現ベースでは限界があり、AST 解析または TypeScript compiler API が必要な可能性がある。
  - 具体的には、`packages/shared/src/ipc/channels.ts` で定義された定数が `preload/channels.ts` で `spread` or `re-export` されているかどうかを検証する際、単純な文字列検索では dynamic import パターンや条件付きエクスポートを見落とす可能性がある。
  - 初回実装は正規表現ベースで対応できる範囲（定数名の存在確認・旧パス検索）に限定し、型レベルの整合性チェックは別タスクとして切り出すことを推奨する。

| 項目     | 内容                                                                                               |
| -------- | -------------------------------------------------------------------------------------------------- |
| 症状     | SKILL.md に参照されているスクリプトが実際には存在しない                                            |
| 原因     | スキル定義時に「機能実装は別」とコメントされ、実装スクリプト作成が後回しにされた                   |
| 対応     | 本タスクで実装スクリプトを作成する                                                                 |
| 再発防止 | スキル作成時は SKILL.md で参照するスクリプトを同時に作成するか、参照パスに `（未実装）` を明記する |

### 補足事項

- 本タスクは `UT-IMP-IPC-PRELOAD-SPEC-SYNC-CI-GUARD-001`（CI 組み込みタスク）の前提となる。本タスク完了後に CI ガードタスクが実行可能になる。
- スクリプトの正本は `.agents/skills/ipc-preload-spec-sync-guardian/scripts/` に配置し、`.claude/skills/ipc-preload-spec-sync-guardian/scripts/` は mirror とする（`.claude` Canonical 原則に従い `.agents` ではなく `.claude` が正本となる可能性があるため、プロジェクト規約を Phase 1 で確認すること）。
