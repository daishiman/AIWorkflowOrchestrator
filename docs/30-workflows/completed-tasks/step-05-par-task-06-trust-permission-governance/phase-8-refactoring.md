# Phase 8: リファクタリング - TASK-SKILL-LIFECYCLE-06 信頼・権限・ガバナンス統合

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスク ID    | TASK-SKILL-LIFECYCLE-06                                        |
| Phase        | 8: リファクタリング                                            |
| ステータス   | not_started                                                    |
| 担当         | 設計専門エージェント                                           |
| 依存成果物   | `outputs/phase-7/coverage-report.md`（Phase 7 完了が前提条件） |
| ブロック対象 | `phase-9-quality-assurance.md`                                 |
| 作成日       | 2026-03-16                                                     |
| 仕様書分類   | 設計タスク（実装なし）                                         |

---

## 目的

Phase 1-7 の設計成果物（計10ファイル）を対象として、以下の3つの品質問題を解消する。

1. **用語表記ゆれの統一**: `riskLevel` / `dangerLevel` / `risk_level` 等の混在を1つの正規表現に統一する
2. **重複定義の集約**: 複数ファイルに分散した型定義・判定ロジック・チェックルールを正本ファイルに集約し、他ファイルからの参照に書き換える
3. **参照リンクの整合**: Phase 1-2 の成果物間の相互参照リンクが正しいパスを指しているか検証し、断絶があれば修正する

本 Phase はコードを生成しない。**設計文書の構造・用語・参照の整合性を高める文書リファクタリング**が対象範囲である。

---

## 実行タスク

### Task 1: 用語表記ゆれの洗い出しと統一

Phase 1-2 の全成果物（10ファイル）を対象に、以下の表記ゆれを検出して統一する。

#### 統一対象の用語リスト

| 正規表記（採用）         | 廃止表記（置換対象）                                    | 理由                                                    |
| ------------------------ | ------------------------------------------------------- | ------------------------------------------------------- |
| `riskLevel`              | `dangerLevel`, `risk_level`, `riskClass`, `threatLevel` | Phase 2 `ToolRiskConfig.level` の正式フィールド名に統一 |
| `ToolRiskLevel`          | `DangerLevel`, `RiskLevel`, `ThreatLevel`               | Phase 2 で確定した型名に統一                            |
| `AllowedToolEntryV2`     | `ToolEntry`, `AllowedEntry`, `PermissionEntry`          | Phase 2 の拡張型名に統一                                |
| `SafetyGatePort`         | `SafetyGate`, `PublishGate`, `SecurityGate`             | Phase 2 ステップ 6 で確定したインターフェース名に統一   |
| `approved_once`          | `approve_once`, `approveOnce`, `session_approval`       | Phase 1 Task 2 の権限状態4モードの正規表記に統一        |
| `expiryPolicy`           | `expiry_policy`, `expirationPolicy`, `expireMode`       | Phase 2 `AllowedToolEntryV2` の正式フィールド名に統一   |
| `CRITICAL_TOOL_REQUIRED` | `DANGEROUS_TOOL`, `CRITICAL_CHECK`, `RISK_BLOCK`        | Phase 2 ステップ 6 の安全性チェック ID に統一           |
| `SafetyGrade`            | `SafetyStatus`, `PublishStatus`, `SecurityGrade`        | Phase 2 `SafetyGateResult.overallGrade` の型名に統一    |

#### 検出手順

1. `outputs/phase-1/` 配下の5ファイルに対して廃止表記リストの全語を `grep -rn` で検索する
2. `outputs/phase-2/` 配下の5ファイルに対して同様に検索する
3. 検出した箇所を Task 1 成果物（`outputs/phase-8/terminology-audit.md`）に記録する
4. 正規表記への置換を実施し、置換後の文書を保存する

---

### Task 2: 重複定義の検出と集約

同一の内容が複数の設計ファイルに記述されている箇所を検出し、正本1箇所からの参照に統一する。

#### 重複定義の対象チェック項目

| 定義内容                                  | 期待される正本ファイル                             | 重複が疑われる箇所                                |
| ----------------------------------------- | -------------------------------------------------- | ------------------------------------------------- |
| `ToolRiskConfig` 型定義とテーブル         | `outputs/phase-2/risk-level-design.md`             | `outputs/phase-1/risk-level-classification.md`    |
| リスクレベル4段階の判定基準（条件式）     | `outputs/phase-1/risk-level-classification.md`     | `outputs/phase-2/risk-level-design.md`            |
| `AllowedToolEntryV2` の TypeScript 型定義 | `outputs/phase-2/permission-persistence-design.md` | `outputs/phase-1/permission-state-flow.md`        |
| 失効ポリシー4種テーブル                   | `outputs/phase-2/permission-persistence-design.md` | `outputs/phase-1/approval-history-policy.md`      |
| `SafetyGatePort` インターフェース定義     | `outputs/phase-2/safety-gate-contract.md`          | `outputs/phase-1/skill-safety-contract.md`        |
| 安全性チェックルール5件のテーブル         | `outputs/phase-2/safety-gate-contract.md`          | `outputs/phase-1/skill-safety-contract.md`        |
| 権限拒否後の abort/skip/retry フロー定義  | `outputs/phase-2/abort-fallback-design.md`         | `outputs/phase-1/permission-state-flow.md`        |
| 説明責任 UI 挿入点 INS-01〜INS-03 の定義  | `outputs/phase-2/accountability-ui-design.md`      | `outputs/phase-1/accountability-insertion-map.md` |

#### 集約ルール

- 正本ファイルには定義を**そのまま保持**する
- 重複箇所は定義を削除し、`> 正本: [ファイルパス] の [セクション名] を参照` の形式で参照リンクに置換する
- 正本ファイルのパスは `outputs/` からの相対パスで記述する（絶対パス禁止）

---

### Task 3: 参照リンクの整合性検証と修正

Phase 1-2 の成果物に含まれる全相互参照リンクを抽出し、リンク先が実際に存在するファイル・セクションを指しているか検証する。

#### 検証対象のリンクパターン

- `[テキスト](../../../path/to/file.md)` 形式のマークダウンリンク
- `正本: path/to/file.md` 形式のテキスト参照
- `→ [別ファイル名]` 形式の非公式参照

#### 検証手順

1. `outputs/phase-1/` と `outputs/phase-2/` の全ファイルからリンクを抽出する
2. 各リンクのファイルが `docs/30-workflows/` ディレクトリ配下に実在するか確認する
3. セクション参照（`#セクション名`）については、対象ファイル内に該当見出しが存在するか確認する
4. 断絶（404相当）のリンクを `outputs/phase-8/link-audit.md` に記録する
5. 修正可能なリンクは正しいパスに更新する。修正不可能なリンク（参照先ファイルが未作成の場合）は「未作成 - Phase XX で作成予定」と注記を付ける

---

### Task 4: Phase 2 設計文書と Phase 1 要件定義との整合確認

Phase 2 の設計が Phase 1 の受入基準（AC-1〜AC-4）を充足するかを、以下の対応表で再確認する。

| 受入基準 | Phase 1 での要件定義箇所                                 | Phase 2 での設計対応箇所                                                  | 整合判定 |
| -------- | -------------------------------------------------------- | ------------------------------------------------------------------------- | -------- |
| AC-1     | `risk-level-classification.md` の4段階定義               | `risk-level-design.md` の `TOOL_RISK_CONFIG` 型定義                       | 要確認   |
| AC-1     | リスクレベル別デフォルト権限状態テーブル                 | `PermissionDialog` ワイヤーフレームの `autoDenyDefault` フラグ設計        | 要確認   |
| AC-2     | `approval-history-policy.md` の履歴エントリ7フィールド   | `permission-persistence-design.md` の `AllowedToolEntryV2` 型拡張         | 要確認   |
| AC-2     | 取り消し条件（approved のみ対象）の定義                  | `permission-persistence-design.md` の取り消し UI フロー設計               | 要確認   |
| AC-3     | `accountability-insertion-map.md` の INS-01〜INS-03 定義 | `accountability-ui-design.md` の挿入点ワイヤーフレーム設計                | 要確認   |
| AC-4     | `skill-safety-contract.md` の `SkillSafetyContract` 型   | `safety-gate-contract.md` の `SafetyGatePort` / `SafetyGateResult` 型定義 | 要確認   |

**整合判定の基準:**

- `OK`: Phase 1 の要件を Phase 2 の設計が具体化している（条件式・型定義・ワイヤーフレームのいずれかで）
- `GAP`: Phase 1 に要件はあるが Phase 2 に対応する設計が存在しない（未タスク候補として記録）
- `CONFLICT`: Phase 1 の定義と Phase 2 の設計が矛盾している（Phase 2 を正として Phase 1 を修正、または設計根拠を明記）

---

## 参照資料

| 資料名                                               | パス                                                                                                        | 用途                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Phase 1 要件成果物                                   | `outputs/phase-1/*.md`                                                                                      | 用語・受入基準の正本             |
| Phase 2 設計成果物                                   | `outputs/phase-2/*.md`                                                                                      | 型定義・接続契約の正本           |
| Phase 5 実装成果物                                   | `outputs/phase-5/`                                                                                          | 正式化済み型定義・契約の参照     |
| Phase 6 テスト拡充成果物                             | `outputs/phase-6/`                                                                                          | 境界値・組合せ仕様の参照         |
| Phase 7 カバレッジ結果                               | `outputs/phase-7/coverage-report.md`                                                                        | リファクタリング対象の優先度決定 |
| security-skill-execution                             | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                             | リスク分類の語彙統一             |
| interfaces-agent-sdk-executor-details                | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`                | Permission 契約名の統一          |
| workflow-skill-lifecycle-created-skill-usage-journey | `.claude/skills/aiworkflow-requirements/references/workflow-skill-lifecycle-created-skill-usage-journey.md` | Scoring/CTA用語の統一            |

---

## 実行手順

### Step 1: 対象ファイルの列挙（所要: 約10分）

1. `outputs/phase-1/` の全ファイルをリストアップし、ファイル名と最終更新日時を記録する
2. `outputs/phase-2/` の全ファイルをリストアップし、ファイル名と最終更新日時を記録する
3. 合計ファイル数（期待値: 10ファイル）と実際のファイル数を照合する

### Step 2: 用語表記ゆれ検出・修正（所要: 約40分）

1. Task 1 の統一対象用語リストを使って全ファイルを grep で検索する
2. 検出した表記ゆれを `outputs/phase-8/terminology-audit.md` に記録する（ファイル名・行番号・現在の表記・正規表記）
3. 置換を実施し、置換後のファイルを上書き保存する
4. 置換後に再度 grep を実行し、廃止表記が0件になったことを確認する

### Step 3: 重複定義の集約（所要: 約60分）

1. Task 2 の対象チェック項目リストを順番に確認する
2. 正本ファイルに完全な定義が存在し、重複ファイルに同一内容がある場合は集約する
3. 集約した箇所を `outputs/phase-8/duplication-audit.md` に記録する（集約前ファイル・集約後ファイル・置換した内容のサマリー）

### Step 4: 参照リンク検証・修正（所要: 約30分）

1. 全ファイルのリンクを抽出し `outputs/phase-8/link-audit.md` に記録する
2. リンク先の実在確認を行い、断絶リンクを特定する
3. 修正可能なリンクは正しいパスに更新する

### Step 5: AC 整合確認（所要: 約30分）

1. Task 4 の対応表を1行ずつ確認し、`OK` / `GAP` / `CONFLICT` を記入する
2. `GAP` の項目は未タスク候補として `outputs/phase-8/ac-gap-report.md` に記録する
3. `CONFLICT` の項目は Phase 2 成果物の当該箇所に修正コメントを追記し、Phase 2 正本として確定する

### Step 6: リファクタリング後の自己検証（所要: 約20分）

以下のコマンドをリファクタリング後に実行し、全廃止表記が0件であることを確認する。

```bash
# 廃止表記の残存確認（全件0件が合格）
grep -rn "dangerLevel\|risk_level\|riskClass\|approve_once\|expiry_policy\|DANGEROUS_TOOL\|SafetyStatus" \
  outputs/phase-1/ outputs/phase-2/
```

---

## 統合テスト連携

本 Phase はコードを生成しないため、実装テストは存在しない。ただし、以下の設計レベルでの検証を実施する。

| 検証項目                               | 検証方法                | 合格条件                                   |
| -------------------------------------- | ----------------------- | ------------------------------------------ |
| 廃止表記の完全排除                     | Step 6 の grep コマンド | 検出件数 = 0                               |
| Phase 1-2 の全相互参照リンクの実在確認 | Step 4 の手動リンク検証 | 断絶リンク件数 = 0（または注記付きで明示） |
| AC-1〜AC-4 の整合確認                  | Step 5 の対応表確認     | `GAP` / `CONFLICT` 件数 = 0                |

---

## 成果物

成果物はすべて `outputs/phase-8/` 配下に配置する。

| 成果物 ID | ファイルパス                           | 内容                                                                             |
| --------- | -------------------------------------- | -------------------------------------------------------------------------------- |
| OUT-8-1   | `outputs/phase-8/terminology-audit.md` | 表記ゆれ検出結果（ファイル名・行番号・廃止表記・正規表記）と置換完了の証跡       |
| OUT-8-2   | `outputs/phase-8/duplication-audit.md` | 重複定義の集約結果（集約前後のファイル一覧と置換サマリー）                       |
| OUT-8-3   | `outputs/phase-8/link-audit.md`        | 参照リンク検証結果（実在確認・断絶箇所・修正内容の記録）                         |
| OUT-8-4   | `outputs/phase-8/ac-gap-report.md`     | AC-1〜AC-4 整合確認結果（`OK`/`GAP`/`CONFLICT` 判定と GAP の未タスク候補リスト） |

---

## 完了条件

以下の全チェックボックスを満たすことで Phase 8 完了とする。

- [ ] `outputs/phase-8/terminology-audit.md` に廃止表記の検出結果と置換完了の証跡が記録されている
- [ ] Step 6 の grep コマンドの実行結果が0件であることが `terminology-audit.md` 内に記録されている
- [ ] `outputs/phase-8/duplication-audit.md` に重複定義の集約結果が記録されている
- [ ] `outputs/phase-8/link-audit.md` に全参照リンクの検証結果が記録されており、断絶リンクが0件（または注記付き）である
- [ ] `outputs/phase-8/ac-gap-report.md` に AC-1〜AC-4 の整合確認結果が記録されており、`GAP` と `CONFLICT` がそれぞれ0件である
- [ ] Phase 1-2 の成果物10ファイルが全て修正後の内容で保存されている（リファクタリング前後の差分が `duplication-audit.md` で追跡可能）

---

## タスク100%実行確認【必須】

Phase 8 完了前に以下を逐次確認する。

1. **廃止表記0件確認**: Step 6 の grep コマンドを実行し、出力が空であることをスクリーンキャプチャまたは実行ログとして `terminology-audit.md` に貼り付ける
2. **成果物4件の存在確認**: `ls outputs/phase-8/` を実行し、OUT-8-1〜OUT-8-4 の全ファイルが存在することを確認する
3. **AC 整合0件ギャップ確認**: `ac-gap-report.md` の判定欄に `GAP` または `CONFLICT` が含まれていないことを確認する
4. **Phase 2 設計ファイルの整合確認**: `outputs/phase-2/` の全5ファイルがリファクタリング後の状態で保存されており、廃止表記を含まないことを確認する

---

## 次 Phase

Phase 9: 品質検証

- 成果物パス: `phase-9-quality-assurance.md`
- 前提条件: 本ファイルの「完了条件」チェックリストが全項目チェック済みであること
- Phase 9 でのインプット: `outputs/phase-8/` の4成果物と、リファクタリング済みの `outputs/phase-1/`・`outputs/phase-2/` の全10ファイル
