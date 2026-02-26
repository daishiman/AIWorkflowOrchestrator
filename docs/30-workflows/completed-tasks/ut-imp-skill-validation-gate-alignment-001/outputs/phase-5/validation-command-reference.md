# 検証コマンドリファレンス

## メタ情報

| 項目     | 値                                         |
| -------- | ------------------------------------------ |
| タスクID | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 |
| Phase    | 5                                          |
| 作成日   | 2026-02-26                                 |

---

## 1. 正規経路コマンド（primary）

### 前提条件

- Node.js v18 以上がインストールされていること
- カレントディレクトリがプロジェクトルート（`.claude/skills/` が存在する階層）であること

### コマンドライン

```bash
# skill-creator 自身の検証
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator

# task-specification-creator の検証
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator

# aiworkflow-requirements の検証
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

### オプション

| オプション  | 説明                                                     |
| ----------- | -------------------------------------------------------- |
| `--verbose` | 詳細な検証結果を表示する（パスした項目も含めて全て出力） |
| `-h`        | ヘルプを表示する                                         |
| `--help`    | ヘルプを表示する                                         |

### 使用例

```bash
# 通常実行（Error/Warning のみ表示）
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator

# 詳細モード（全項目の結果を表示）
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator --verbose
```

---

## 2. 出力フォーマット

### プレフィックス記号

| 記号 | 意味    | 説明                                                                 |
| ---- | ------- | -------------------------------------------------------------------- |
| `✓`  | Pass    | 検証項目をパスした（`--verbose` 指定時のみ表示）                     |
| `⚠`  | Warning | 合否に影響しないが注意が必要。分類は Step 1-G.3.1 の判定フローに従う |
| `✗`  | Error   | 修正必須。Error が 1件でもある場合、検証失敗となる                   |

### 結果サマリー行の形式

```
結果: ✓ 検証成功 (N項目パス, 0エラー, M警告)
```

または

```
結果: ✗ 検証失敗 (N項目パス, Eエラー, M警告)
```

---

## 3. 終了コード一覧

| コード | 定数名              | 意味                                     |
| ------ | ------------------- | ---------------------------------------- |
| 0      | `SUCCESS`           | 成功（全ての検証をパス。Warning は許容） |
| 1      | `ERROR`             | 一般的なエラー（予期しない例外等）       |
| 2      | `ARGS_ERROR`        | 引数エラー（スキルパスが未指定）         |
| 3      | `FILE_NOT_FOUND`    | ファイル不在（指定パスが存在しない）     |
| 4      | `VALIDATION_FAILED` | 検証失敗（Error が 1件以上存在）         |

---

## 4. 検証項目一覧

### Error 項目（修正必須）

| #   | 検証項目                     | 説明                                                                  |
| --- | ---------------------------- | --------------------------------------------------------------------- |
| 1   | SKILL.md の存在              | スキルディレクトリ直下に SKILL.md が存在すること                      |
| 2   | SKILL.md が 500 行以内       | 行数が 500 行を超えていないこと                                       |
| 3   | YAML frontmatter の有効性    | `---` で囲まれた有効な YAML frontmatter が存在すること                |
| 4   | name フィールドの存在        | frontmatter に `name` フィールドが定義されていること                  |
| 5   | name が 64 文字以内          | name フィールドの文字数が 64 以内であること                           |
| 6   | name がハイフンケース        | `/^[a-z0-9]+(-[a-z0-9]+)*$/` に一致すること                           |
| 7   | description フィールドの存在 | frontmatter に `description` フィールドが定義されていること           |
| 8   | description が 1024 文字以内 | description フィールドの文字数が 1024 以内であること                  |
| 9   | description に角括弧なし     | `<` または `>` が含まれていないこと                                   |
| 10  | 不要な補助ドキュメントの不在 | README.md, INSTALLATION_GUIDE.md, QUICK_REFERENCE.md が存在しないこと |

### Warning 項目（合否に影響しない）

| #   | 検証項目                               | 説明                                                                      |
| --- | -------------------------------------- | ------------------------------------------------------------------------- |
| W1  | name とディレクトリ名の一致            | name フィールドの値がスキルディレクトリ名と一致すること                   |
| W2  | description に Anchors が含まれる      | `Anchors:` または箇条書き記号 `•` が含まれること                          |
| W3  | description に Trigger が含まれる      | `Trigger:` または `use when` が含まれること                               |
| W4  | references/ ファイルの SKILL.md リンク | `references/` 配下の各 .md ファイルが SKILL.md 内からリンクされていること |
| W5  | agents/\*.md の必須セクション          | Task仕様書テンプレートの必須5セクションが存在すること                     |

### agents/\*.md 必須セクション（W5 の詳細）

| セクション               |
| ------------------------ |
| `## 1. メタ情報`         |
| `## 2. プロフィール`     |
| `## 3. 知識ベース`       |
| `## 4. 実行仕様`         |
| `## 5. インターフェース` |

---

## 5. Warning の3段階分類（判定基準: spec-update-workflow.md Step 1-G.3.1）

| 分類   | 定義                                                                   | 対応方針                                           |
| ------ | ---------------------------------------------------------------------- | -------------------------------------------------- |
| 許容   | 運用上避けられない Warning で、修正コストが高く機能影響がない          | 件数を記録し、前回比で増加傾向がないことを確認する |
| 要監視 | 新規に発生した Warning で、放置すると品質低下の兆候となる              | 次回 Phase 12 までに対応方針を決定                 |
| 要対応 | 機能やスキル構造の正確性に直接影響する Warning で、本Phase内で修正必要 | 本 Phase 内で修正。修正不可の場合は未タスク化      |

---

## 6. fallback 経路コマンド

### 使用条件

以下の**全条件**を満たす場合のみ使用可:

1. Node.js ランタイム（v18以上）が利用不可である
2. Python 3.10 以上がインストールされている
3. PyYAML ライブラリがインストールされている

### コマンドライン

```bash
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/aiworkflow-requirements
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/task-specification-creator
```

### 注意事項

- fallback 経路では `skill-creator` 自身の検証はスキップされる（Python 版は外部パスの検証ツール）
- fallback 使用時は `documentation-changelog.md` に「fallback 経路を使用した」旨を明記すること
- `--verbose` オプションは Python 版ではサポートされない（Phase 3 M-2 対応で仕様書から削除済み）
