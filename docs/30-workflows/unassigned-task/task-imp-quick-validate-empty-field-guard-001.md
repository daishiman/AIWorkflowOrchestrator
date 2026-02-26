# UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001: quick_validate.js name/description 空フィールドガード追加

## メタ情報

```yaml
issue_number: 913
```

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001                  |
| タスク名     | quick_validate.js name/description 空フィールドガード追加    |
| 分類         | バグ修正                                                     |
| 優先度       | 中                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001 Phase 10 MINOR #2 |
| 発見日       | 2026-02-26                                                   |
| 対象         | `.claude/skills/skill-creator/scripts/quick_validate.js`     |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`name` / `description` が空や未定義のとき、`toLowerCase()` 実行でランタイムエラーが起きるケースが報告された。

### 1.2 問題点・課題

- 検証処理が例外で中断する。
- 利用者には構文エラーではなくスタックトレースが見える。

### 1.3 放置した場合の影響

- 生成途中の `SKILL.md` で検証失敗時の診断品質が低下する。
- CI/手動検証の再現性が落ちる。

## 2. 何を達成するか（What）

### 2.1 目的

空/未定義フィールドを明示的な検証エラーとして扱い、ランタイム例外を防止する。

### 2.2 最終ゴール

- 空/未定義 `name` / `description` で例外が発生しない。
- 検証結果として明示的なエラーが返る。

### 2.3 スコープ

#### 含むもの

- `name` / `description` の型・空文字ガード。
- 該当エッジケースのテスト追加/更新。

#### 含まないもの

- 他フィールド（Anchors/Trigger等）の網羅的ガード追加。
- 出力フォーマット全面改修。

### 2.4 成果物

- `.claude/skills/skill-creator/scripts/quick_validate.js`
- `.claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js`

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js v18以上。
- quick_validate テスト環境が利用可能。

### 3.2 依存タスク

- UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001（親タスク）

### 3.3 推奨アプローチ

- 文字列メソッド実行前に `typeof value === "string" && value.trim() !== ""` を判定。
- エラー時は runtime exception ではなく validation error として返す。

### 3.4 実装課題と解決策（親タスクからの教訓）

| 課題                     | 解決策                                |
| ------------------------ | ------------------------------------- |
| 例外で処理が中断する     | 早期ガード + 明示エラー出力へ統一     |
| 空文字と未定義の扱いぶれ | 同一ルール（空/未定義=invalid）で統一 |

## 4. 実行手順

1. `name` / `description` の利用箇所を抽出する。
2. 型/空文字ガードを追加する。
3. 空/未定義ケースのテストを追加・更新する。
4. テストと手動実行で例外非発生を確認する。

## 5. 完了条件チェックリスト

- [ ] 空/未定義 `name` でランタイム例外が発生しない。
- [ ] 空/未定義 `description` でランタイム例外が発生しない。
- [ ] validation error が明示的に出力される。
- [ ] 回帰テストがPASSする。

## 6. 検証方法

```bash
pnpm -C .claude/skills/skill-creator test -- quick_validate
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
```

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                       |
| ------------------------------ | ------ | -------- | ------------------------------------------ |
| ガード追加で既存判定件数が変化 | 中     | 低       | 期待値を固定したテストを同時更新           |
| エラーメッセージ互換性が崩れる | 低     | 低       | 既存フォーマットを踏襲して文言のみ最小変更 |

## 8. 参照情報

- `docs/30-workflows/ut-imp-skill-validation-gate-alignment-001/outputs/phase-10/minor-issues.md`
- `.claude/skills/task-specification-creator/references/spec-update-workflow.md`

## 9. 備考

本タスクは Phase 10 MINOR #2 の是正タスク。Phase 12で台帳・参照を整備済み、実装は未着手。
