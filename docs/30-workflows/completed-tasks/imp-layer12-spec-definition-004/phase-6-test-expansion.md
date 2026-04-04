# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 6                               |
| 機能名    | imp-layer12-spec-definition-004 |
| 作成日    | 2026-04-03                      |
| 前提Phase | Phase 5                         |
| 後続Phase | Phase 7                         |

## 目的

Phase 5 で追記した check ID 体系の正確性をさらに深く検証する拡張検証コマンドを作成し、回帰ガードと境界値テストにより将来の仕様書更新漏れを防止する。

## 実行タスク

### タスク1: 追加検証パターンの作成

**目的**: severity・エラーメッセージの正確性と check ID の一意性を検証する

**手順**:

1. **severity 記載の正確性検証**: error/warning が実装と一致するか確認するコマンドを作成する

```bash
# 実装から severity を抽出
grep -oE "L[1-4]-[0-9]{3}.*?(error|warning)" <SkillCreatorVerificationEngine.ts のパス> \
  | sort > /tmp/impl-severity.txt

# 仕様書から severity を抽出
grep -oE "L[1-4]-[0-9]{3}.*?(error|warning)" <追記先ファイル> \
  | sort > /tmp/spec-severity.txt

# 差分検出（差分がなければ PASS）
diff /tmp/impl-severity.txt /tmp/spec-severity.txt
```

2. **エラーメッセージの記載検証**: 英語メッセージが実装と一致するか確認するコマンドを作成する

```bash
# 実装のエラーメッセージと仕様書のエラーメッセージを突き合わせる
# 各 check ID について、実装のメッセージが仕様書に含まれているか検証
for id in L1-001 L1-002 L1-003 L1-004 L1-005 \
          L2-001 L2-002 L2-003 L2-004 L2-005 L2-006 L2-007 \
          L3-001 L3-002 L3-003 L3-004 \
          L4-001 L4-002 L4-003; do
  impl_msg=$(grep "$id" <SkillCreatorVerificationEngine.ts のパス> | grep -oE '"[^"]*"' | head -1)
  spec_msg=$(grep "$id" <追記先ファイル> | grep -oE '"[^"]*"' | head -1)
  if [ "$impl_msg" != "$spec_msg" ]; then
    echo "MISMATCH: $id impl=$impl_msg spec=$spec_msg"
  fi
done
```

3. **Layer 間の check ID 番号の重複検証**: 重複がないか確認するコマンドを作成する

```bash
# 仕様書から全 check ID を抽出し、重複を検出
grep -oE "L[1-4]-[0-9]{3}" <追記先ファイル> | sort | uniq -d
# 期待値: 出力なし（重複なし = PASS）
```

**成果物**: `outputs/phase-6/extended-test-commands.md` 内「追加検証パターン」セクション

### タスク2: 回帰ガードの作成

**目的**: 将来の check ID 追加時に仕様書更新漏れを検知するパターンを作成する

**手順**:

1. **仕様書更新漏れ検知パターン**: 実装に新しい check ID が追加された際に仕様書との差分を検出するコマンドを作成する

```bash
# SkillCreatorVerificationEngine.ts の check ID 総数
impl_count=$(grep -coE "L[1-4]-[0-9]{3}" <SkillCreatorVerificationEngine.ts のパス>)

# 仕様書の check ID 総数
spec_count=$(grep -coE "L[1-4]-[0-9]{3}" <追記先ファイル>)

# 総数比較（一致すれば PASS）
if [ "$impl_count" -eq "$spec_count" ]; then
  echo "PASS: check ID 総数一致 ($impl_count)"
else
  echo "FAIL: 実装=$impl_count, 仕様書=$spec_count"
fi
```

2. **Layer 別の総数比較**: 各 Layer ごとに実装と仕様書の check ID 数を比較するコマンドを作成する

```bash
for layer in 1 2 3 4; do
  impl=$(grep -coE "L${layer}-[0-9]{3}" <SkillCreatorVerificationEngine.ts のパス>)
  spec=$(grep -coE "L${layer}-[0-9]{3}" <追記先ファイル>)
  if [ "$impl" -eq "$spec" ]; then
    echo "PASS: Layer $layer ($impl)"
  else
    echo "FAIL: Layer $layer impl=$impl spec=$spec"
  fi
done
```

3. 上記コマンドを CI やレビュー時に実行可能な形式でドキュメント化する

**成果物**: `outputs/phase-6/extended-test-commands.md` 内「回帰ガード」セクション

### タスク3: 境界値テスト

**目的**: check ID のフォーマットと連番の整合性を検証する

**手順**:

1. **check ID フォーマット検証**: `L{数字}-{3桁数字}` パターンに準拠しているか確認するコマンドを作成する

```bash
# 仕様書から check ID らしきパターンを抽出し、正規表現で検証
# 不正なフォーマット（例: L1-01, L1-0001, LA-001）を検出
grep -oE "L[0-9]+-[0-9]+" <追記先ファイル> | grep -vE "^L[1-4]-[0-9]{3}$"
# 期待値: 出力なし（不正フォーマットなし = PASS）
```

2. **各 Layer の check ID 連番に欠番がないか確認**: 連番の連続性を検証するコマンドを作成する

```bash
# Layer 1: L1-001〜L1-005 の連番確認
for i in $(seq -w 1 5); do
  if ! grep -q "L1-00${i}" <追記先ファイル>; then
    echo "MISSING: L1-00${i}"
  fi
done

# Layer 2: L2-001〜L2-007 の連番確認
for i in $(seq -w 1 7); do
  if ! grep -q "L2-00${i}" <追記先ファイル>; then
    echo "MISSING: L2-00${i}"
  fi
done

# Layer 3: L3-001〜L3-004 の連番確認
for i in $(seq -w 1 4); do
  if ! grep -q "L3-00${i}" <追記先ファイル>; then
    echo "MISSING: L3-00${i}"
  fi
done

# Layer 4: L4-001〜L4-003 の連番確認
for i in $(seq -w 1 3); do
  if ! grep -q "L4-00${i}" <追記先ファイル>; then
    echo "MISSING: L4-00${i}"
  fi
done
# 期待値: 出力なし（欠番なし = PASS）
```

3. 全境界値テストの判定基準を明記する

**成果物**: `outputs/phase-6/extended-test-commands.md` 内「境界値テスト」セクション

## 参照資料

| 資料名                            | パス                                        | 説明              |
| --------------------------------- | ------------------------------------------- | ----------------- |
| Phase 4 検証コマンド              | `outputs/phase-4/test-commands.md`          | 基本検証コマンド  |
| Phase 5 実装サマリー              | `outputs/phase-5/implementation-summary.md` | 追記内容の確認    |
| SkillCreatorVerificationEngine.ts | 実装ファイルパス（Phase 1 で特定済み）      | check ID の実装元 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                   | パス                                                                              | 内容                       |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | スキル関連インターフェース |

## 統合テスト連携

本タスクは docs-only のため、統合テストは N/A。拡張検証コマンドスイートによる代替を実施する。

- Phase 4 の基本検証コマンドに加え、severity・メッセージ・フォーマット・連番の拡張検証を追加
- 回帰ガードにより将来の実装変更時にも仕様書との乖離を自動検出可能にする

## 成果物

| 成果物                   | パス                                        | 説明                                     |
| ------------------------ | ------------------------------------------- | ---------------------------------------- |
| 拡張検証コマンドスイート | `outputs/phase-6/extended-test-commands.md` | severity・メッセージ・回帰ガード・境界値 |

## 完了条件

- [ ] severity 記載の正確性検証コマンドが作成されている（error/warning の実装一致）
- [ ] エラーメッセージの記載検証コマンドが作成されている（英語メッセージの実装一致）
- [ ] Layer 間 check ID 重複検証コマンドが作成されている
- [ ] 回帰ガード: 実装と仕様書の check ID 総数比較コマンドが作成されている
- [ ] 回帰ガード: Layer 別の総数比較コマンドが作成されている
- [ ] 境界値: check ID フォーマット検証コマンドが作成されている（`L{数字}-{3桁数字}` パターン）
- [ ] 境界値: 各 Layer の連番欠番検証コマンドが作成されている
- [ ] 全拡張検証コマンドを実行し、全て PASS であることを確認済み
- [ ] 拡張検証コマンドスイートが `outputs/phase-6/extended-test-commands.md` に記録されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 7: カバレッジ確認
