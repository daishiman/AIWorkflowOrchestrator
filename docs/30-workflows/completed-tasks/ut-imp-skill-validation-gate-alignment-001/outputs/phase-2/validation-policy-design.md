# 検証経路統一方針（Validation Policy Design）

## メタ情報

| 項目     | 値                                          |
| -------- | ------------------------------------------- |
| タスクID | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001  |
| Phase    | 2                                           |
| 作成日   | 2026-02-26                                  |
| 目的     | primary / fallback 経路の使い分けルール定義 |

## 1. 検証経路の優先順位テーブル

| 経路     | スクリプト                                                                                               | 優先度  | 使用条件                                                             |
| -------- | -------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| primary  | `node .claude/skills/skill-creator/scripts/quick_validate.js <skill-path>`                               | 第1優先 | Node.js ランタイム（v18 以上）が利用可能な環境で使用する             |
| fallback | `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py <skill-path> --verbose` | 第2優先 | Node.js が利用不可で、Python 3.10 以上が利用可能な環境でのみ使用する |

## 2. 正規経路（primary）の統一コマンドフォーマット

Phase 12 の検証コマンドとして、以下の3コマンドを順次実行する:

```bash
# 正規経路: quick_validate.js（全3スキルを順次実行）
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

### コマンド仕様

| 項目         | 値                                                                  |
| ------------ | ------------------------------------------------------------------- |
| ランタイム   | Node.js v18 以上（ES Modules 対応必須）                             |
| 引数         | 第1引数: スキルディレクトリへの相対パス                             |
| オプション   | `--verbose`: 全検証項目の詳細結果を出力する                         |
| 終了コード   | 0: 成功、1: 一般エラー、2: 引数エラー、3: ファイル不在、4: 検証失敗 |
| 合格判定基準 | 終了コード 0（Error 0件）で合格。Warning は合否に影響しない         |

## 3. 補助経路（fallback）の使用条件

fallback 経路を使用してよいのは、以下の**全条件**を満たす場合のみ:

1. Node.js ランタイム（`node` コマンド）が利用不可である
2. Python 3.10 以上（`python3` コマンド）がインストールされている
3. PyYAML ライブラリがインストールされている

fallback 使用時の追加ルール:

- Phase 12 成果物の `documentation-changelog.md` に「fallback 経路（quick_validate.py）を使用した」旨を明記する
- fallback は Warning を検出しないため、Warning 運用ルールは適用されない
- fallback の検証結果は primary と同等の合格基準（Error/Fail 0件で合格）を適用する

## 4. 経路選択フローチャート

```
Phase 12 検証開始
  │
  ├─ Node.js (node) v18以上が利用可能か？
  │   │
  │   ├─ YES → primary 経路を使用
  │   │         └─ 3スキルを順次実行
  │   │             └─ Error 0件 → 合格
  │   │             └─ Error 1件以上 → 不合格（修正後に再実行）
  │   │             └─ Warning → 3段階分類に基づき対応
  │   │
  │   └─ NO → fallback 条件チェック
  │       │
  │       ├─ python3 (v3.10以上) + PyYAML が利用可能か？
  │       │   │
  │       │   ├─ YES → fallback 経路を使用
  │       │   │         └─ 成果物に「fallback 使用」を明記
  │       │   │         └─ Fail 0件 → 合格
  │       │   │         └─ Fail 1件以上 → 不合格（修正後に再実行）
  │       │   │
  │       │   └─ NO → 検証スキップ
  │       │             └─ 成果物に「検証環境なし: Node.js/Python3 未検出」と記録
  │       │             └─ Phase 12 完了条件に「検証スキップ」を明記
```

## 5. 経路間の差異と運用上の注意

| 観点               | primary (.js)                         | fallback (.py)           | 運用上の注意                                           |
| ------------------ | ------------------------------------- | ------------------------ | ------------------------------------------------------ |
| 検証項目数         | 8項目（Warning 含む）                 | 7項目（Error/Fail のみ） | fallback では参照リンク切れ等の Warning は検出されない |
| 判定粒度           | 3段階（Pass/Warning/Error）           | 2段階（Pass/Fail）       | fallback では Warning 運用ルールは適用対象外           |
| 出力情報量         | 構造化テキスト（詳細セクション）      | 単一行（Pass/Fail のみ） | primary のほうが問題特定が容易                         |
| バージョン管理     | repo 内（PR 経由で更新可能）          | .codex 配下（管理外）    | primary を正本とし、fallback は参考用                  |
| Error 判定の一致性 | 全3スキルで一致（Phase 1 で検証済み） | 同左                     | AC-006 で検証済み（一致率 100%）                       |

## 6. FR/NFR 対応

| 要件    | 本設計での対応                                                        |
| ------- | --------------------------------------------------------------------- |
| FR-001  | primary 経路として `quick_validate.js` を第1優先に指定                |
| FR-002  | fallback 経路として `quick_validate.py` を使用条件限定で位置づけ      |
| NFR-001 | 同一コマンドで同一結果を出力する設計（コマンドフォーマットを固定）    |
| NFR-003 | 検証ルールは `quick_validate.js` の1ファイルに集約                    |
| NFR-005 | 既存の Error 判定ロジックは変更しない（Warning の運用ルールのみ追加） |
