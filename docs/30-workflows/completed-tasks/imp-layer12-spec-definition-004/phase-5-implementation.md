# Phase 5: 実装（TDD: Green） - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 5                               |
| 機能名    | imp-layer12-spec-definition-004 |
| 作成日    | 2026-04-03                      |
| 前提Phase | Phase 4                         |
| 後続Phase | Phase 6                         |

## 目的

Phase 2 の設計に基づき、aiworkflow-requirements の追記先ファイルに FR-04 verify 契約の check ID 体系を追記し、Phase 4 の全検証コマンドが PASS になること（TDD Green）を確認する。

## 実行タスク

### タスク1: 追記先ファイルの準備

**目的**: Phase 2 で決定した追記先ファイルを開き、追記位置を確認する

**手順**:

1. Phase 2 設計書から追記先ファイルのパスを確認する
2. 追記先ファイルの現在の内容を確認し、追記位置を特定する
3. 追記前のファイルのバックアップを取得する（差分確認用）
4. 追記位置の前後のコンテキスト（見出し・セクション構成）を記録する

**成果物**: 追記位置の特定と記録

### タスク2: FR-04 verify 契約セクションの追記

**目的**: check ID 体系を仕様書に追記する

**手順**:

1. 以下の構成で追記先ファイルに追記する:

   **追記セクション構成**:
   - **概要**: verify の目的と Layer 構成の説明
     - verify がスキル定義の品質を保証する検証エンジンであること
     - 4 Layer 構成（Layer 1〜4）の概要と各 Layer の責務
   - **Layer 命名規則**: `L{N}-{NNN}` 形式の定義、severity 方針
     - `L` = Layer、`N` = Layer 番号（1〜4）、`NNN` = 連番（001〜）
     - severity: `error`（必須違反）/ `warning`（推奨違反）の方針
   - **Layer 1 check ID テーブル**（L1-001〜L1-005）
     - カラム: Check ID | 説明 | Severity | エラーメッセージ
   - **Layer 2 check ID テーブル**（L2-001〜L2-007）
     - カラム: Check ID | 説明 | Severity | エラーメッセージ
   - **Layer 3 check ID テーブル**（L3-001〜L3-004）
     - カラム: Check ID | 説明 | Severity | エラーメッセージ
   - **Layer 4 check ID テーブル**（L4-001〜L4-003）
     - カラム: Check ID | 説明 | Severity | エラーメッセージ
   - **Layer 拡張ガイドライン**
     - 新規 Layer 追加時の採番ルール
     - 新規 check ID 追加時の手順
     - 仕様書と実装の同期ルール

2. 各 check ID テーブルの内容は `SkillCreatorVerificationEngine.ts` の実装と完全に一致させる
3. エラーメッセージは実装の英語メッセージをそのまま転記する

**成果物**: 追記先ファイルへの FR-04 verify 契約セクション追記

### タスク3: Phase 4 検証コマンドの実行（TDD Green 確認）

**目的**: Phase 4 の検証コマンドを実行し、全て PASS になることを確認する

**手順**:

1. `outputs/phase-4/test-commands.md` の検証コマンドを順次実行する
2. 各コマンドの実行結果を記録する:

| 検証カテゴリ        | 期待値     | 実行結果 | 判定 |
| ------------------- | ---------- | -------- | ---- |
| Layer 1 check ID 数 | 5          |          |      |
| Layer 2 check ID 数 | 7          |          |      |
| Layer 3 check ID 数 | 4          |          |      |
| Layer 4 check ID 数 | 3          |          |      |
| check ID 総数       | 19         |          |      |
| 実装突き合わせ      | 差分なし   |          |      |
| Markdown テーブル   | 4 テーブル |          |      |
| Layer 見出し        | 4 見出し   |          |      |

3. 全て PASS であることを確認する。FAIL がある場合はタスク2に戻り修正する

**成果物**: 検証結果の記録

### 新規作成/修正ファイルパス一覧

> 本 Phase で新規作成または修正するファイルの一覧（必須記載）

| 操作 | ファイルパス                                | 説明                            |
| ---- | ------------------------------------------- | ------------------------------- |
| 修正 | （Phase 2 で決定した追記先ファイルパス）    | FR-04 verify 契約セクション追記 |
| 作成 | `outputs/phase-5/implementation-summary.md` | 実装サマリー                    |

## 参照資料

| 資料名               | パス                               | 説明                     |
| -------------------- | ---------------------------------- | ------------------------ |
| Phase 2 設計書       | `outputs/phase-2/design.md`        | 追記先・構成の確認       |
| Phase 4 検証コマンド | `outputs/phase-4/test-commands.md` | TDD Green 確認用コマンド |
| Phase 1 棚卸し結果   | `outputs/phase-1/`                 | check ID の実装情報      |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                              | 内容                       |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル関連インターフェース |

## 統合テスト連携

本タスクは docs-only のため、統合テストは N/A。Phase 4 の検証コマンドスイートによる代替を実施する。

- Phase 4 で作成した grep/diff ベースの検証コマンドを実行し、全 PASS を確認する
- 実装（追記）と検証の TDD サイクルで品質を保証する

## 成果物

| 成果物       | パス                                        | 説明                         |
| ------------ | ------------------------------------------- | ---------------------------- |
| 実装サマリー | `outputs/phase-5/implementation-summary.md` | 追記内容・検証結果のサマリー |

## 完了条件

- [ ] 追記先ファイルの追記位置が特定されている
- [ ] FR-04 verify 契約セクションが追記されている（概要・命名規則・Layer 1〜4 テーブル・拡張ガイドライン）
- [ ] Layer 1 check ID テーブル: L1-001〜L1-005（5 checks）が記載されている
- [ ] Layer 2 check ID テーブル: L2-001〜L2-007（7 checks）が記載されている
- [ ] Layer 3 check ID テーブル: L3-001〜L3-004（4 checks）が記載されている
- [ ] Layer 4 check ID テーブル: L4-001〜L4-003（3 checks）が記載されている
- [ ] check ID 総数が 19 であることが確認されている
- [ ] 全 check ID の severity・エラーメッセージが実装と一致している
- [ ] Phase 4 の全検証コマンドが PASS になっている（TDD Green）
- [ ] 新規作成/修正ファイルパス一覧が記載されている
- [ ] 実装サマリーが `outputs/phase-5/implementation-summary.md` に記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 6: テスト拡充
