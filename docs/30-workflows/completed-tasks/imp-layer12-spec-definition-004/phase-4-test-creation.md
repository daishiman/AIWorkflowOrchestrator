# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 4                               |
| 機能名    | imp-layer12-spec-definition-004 |
| 作成日    | 2026-04-03                      |
| 前提Phase | Phase 3                         |
| 後続Phase | Phase 5                         |

## 目的

Phase 5（実装＝仕様書への check ID 体系追記）の前に、検証コマンドスイートを作成し、全て FAIL（check ID 未記載）であることを確認する。これにより TDD Red フェーズを確立する。

> 本タスクは docs-only のため「テスト」は grep/検証コマンドによる確認を指す。

## 実行タスク

### タスク1: 検証コマンドスイートの作成

**目的**: check ID が仕様書に記載されているか確認する grep パターンを作成する

**手順**:

1. Phase 2 で決定した追記先ファイルのパスを確認する
2. 以下の grep パターンを作成し、各 Layer の check ID 記載数を検証するコマンドとする:

```bash
# Layer 1: 5 checks が記載されているか
grep -c "L1-00[1-5]" <追記先ファイル>
# 期待値: 5（Phase 4 時点では 0 = FAIL）

# Layer 2: 7 checks が記載されているか
grep -c "L2-00[1-7]" <追記先ファイル>
# 期待値: 7（Phase 4 時点では 0 = FAIL）

# Layer 3: 4 checks が記載されているか
grep -c "L3-00[1-4]" <追記先ファイル>
# 期待値: 4（Phase 4 時点では 0 = FAIL）

# Layer 4: 3 checks が記載されているか
grep -c "L4-00[1-3]" <追記先ファイル>
# 期待値: 3（Phase 4 時点では 0 = FAIL）
```

3. 全 Layer 合計 19 checks の総数検証コマンドを作成する:

```bash
# 全 check ID の総数検証
grep -cE "L[1-4]-[0-9]{3}" <追記先ファイル>
# 期待値: 19（Phase 4 時点では 0 = FAIL）
```

**成果物**: `outputs/phase-4/test-commands.md` 内「基本検証コマンド」セクション

### タスク2: 実装突き合わせ検証パターンの作成

**目的**: `SkillCreatorVerificationEngine.ts` から check ID を抽出し、仕様書との差分を検出するコマンドを作成する

**手順**:

1. 実装ファイルから check ID を抽出するコマンドを作成する:

```bash
# 実装ファイルから check ID を抽出してソート
grep -oE "L[1-4]-[0-9]{3}" <SkillCreatorVerificationEngine.ts のパス> | sort -u > /tmp/impl-check-ids.txt

# 仕様書から check ID を抽出してソート
grep -oE "L[1-4]-[0-9]{3}" <追記先ファイル> | sort -u > /tmp/spec-check-ids.txt

# 差分検出（差分がなければ PASS）
diff /tmp/impl-check-ids.txt /tmp/spec-check-ids.txt
```

2. 差分が空であれば PASS、差分があれば FAIL とする判定基準を定義する
3. Phase 4 時点では仕様書側が空のため、必ず FAIL（差分あり）となることを確認する

**成果物**: `outputs/phase-4/test-commands.md` 内「実装突き合わせ検証」セクション

### タスク3: Markdown 構文検証パターンの作成

**目的**: テーブル構文、見出し構造の検証コマンドを作成する

**手順**:

1. Markdown テーブル構文の検証コマンドを作成する:

```bash
# テーブルヘッダー行の存在確認（各 Layer テーブル）
grep -c "| Check ID" <追記先ファイル>
# 期待値: 4（Layer 1〜4 各1テーブル、Phase 4 時点では 0 = FAIL）

# テーブル区切り行の構文検証
grep -cE "^\| -+" <追記先ファイル>
# 期待値: 4 以上（Phase 4 時点では 0 = FAIL）
```

2. 見出し構造の検証コマンドを作成する:

```bash
# Layer 見出しの存在確認
grep -cE "^#{2,3} Layer [1-4]" <追記先ファイル>
# 期待値: 4（Phase 4 時点では 0 = FAIL）
```

3. 全コマンドの判定基準（期待値とFAIL条件）を明記する

**成果物**: `outputs/phase-4/test-commands.md` 内「Markdown 構文検証」セクション

### TDD Red 確認

Phase 5（実装＝追記）前に上記の全検証コマンドを実行し、以下を確認する:

| 検証カテゴリ         | 期待結果         | 確認方法              |
| -------------------- | ---------------- | --------------------- |
| Layer 別 check ID 数 | 全て 0（未記載） | grep -c の出力が 0    |
| 実装突き合わせ       | 差分あり（FAIL） | diff の出力が空でない |
| Markdown 構文        | テーブル未存在   | grep -c の出力が 0    |
| check ID 総数        | 0（未記載）      | grep -cE の出力が 0   |

> 全て FAIL であることを確認した上で Phase 5 に進行する。

## 参照資料

| 資料名                            | パス                                      | 説明                       |
| --------------------------------- | ----------------------------------------- | -------------------------- |
| Phase 1 棚卸し結果                | `outputs/phase-1/`                        | check ID の網羅性確認      |
| Phase 2 設計書                    | `outputs/phase-2/design.md`               | 追記先ファイル・構成の確認 |
| Phase 3 レビュー結果              | `outputs/phase-3/design-review-result.md` | レビュー判定の確認         |
| SkillCreatorVerificationEngine.ts | 実装ファイルパス（Phase 1 で特定済み）    | check ID の実装元          |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                              | 内容                       |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル関連インターフェース |

## 統合テスト連携

本タスクは docs-only のため、統合テストは N/A。検証コマンドスイートによる代替を実施する。

- grep/diff ベースの検証コマンドが統合テストの役割を担う
- Phase 5 実装後に全コマンドが PASS に遷移することで Green を確認する

## 成果物

| 成果物               | パス                               | 説明                               |
| -------------------- | ---------------------------------- | ---------------------------------- |
| 検証コマンドスイート | `outputs/phase-4/test-commands.md` | grep/diff ベースの全検証コマンド集 |

## 完了条件

- [ ] Layer 別 check ID 検証コマンドが作成されている（Layer 1〜4 各1コマンド）
- [ ] check ID 総数検証コマンドが作成されている（合計 19 checks）
- [ ] 実装突き合わせ検証コマンドが作成されている（diff ベース）
- [ ] Markdown 構文検証コマンドが作成されている（テーブル・見出し）
- [ ] TDD Red 確認: 全検証コマンドを実行し、全て FAIL であることを確認済み
- [ ] 検証コマンドスイートが `outputs/phase-4/test-commands.md` に記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 5: 実装（TDD: Green）
