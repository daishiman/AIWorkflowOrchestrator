# `int-test-skill` を `.agents/skills/` mirror へ追加 - タスク指示書

## メタ情報

```yaml
issue_number: 2280
```

## メタ情報

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | TASK-INT-TEST-SKILL-MIRROR-001                                        |
| タスク名     | `int-test-skill` を `.agents/skills/` mirror へ追加                   |
| 分類         | 改善                                                                  |
| 対象機能     | スキル管理 / mirror sync 機構                                         |
| 優先度       | 低                                                                    |
| 見積もり規模 | 小規模                                                                |
| ステータス   | 未実施                                                                |
| 発見元       | Phase 12（TASK-CONFLICT-PREVENT-001 の unassigned-task-detection.md） |
| 発見日       | 2026-04-18                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`.claude/skills/int-test-skill/`（canonical）は存在するが、`.agents/skills/int-test-skill/` は未作成の状態にある。
TASK-CONFLICT-PREVENT-001 で構築した mirror sync 機構では、`.claude/skills/` 配下の各スキルを
`.agents/skills/` 配下に同期させることで、AI エージェントと Claude Code の両方から同一のスキル定義を
参照できる設計になっている。

しかし `int-test-skill` は SKILL.md が TODO 状態（概要説明・Anchor・Trigger が未記入）のため、
mirror sync 対象から意図的に除外されていた。

### 1.2 問題点・課題

- `int-test-skill` が canonical（`.claude/skills/`）に存在するにもかかわらず mirror（`.agents/skills/`）には存在しないため、対称性が崩れている
- mirror sync 機構の適用範囲に `int-test-skill` が含まれておらず、将来の一括 sync 時に混乱が生じる可能性がある
- SKILL.md が TODO 状態のままでは、AI エージェントがスキルの目的・用途・発動条件を把握できない

### 1.3 放置した場合の影響

- `.claude/skills/` と `.agents/skills/` の対称性が継続して崩れ、mirror sync 機構の信頼性が低下する
- `int-test-skill` を利用しようとする AI エージェントが `.agents/skills/` 側で見つけられず、スキルの活用機会が失われる
- SKILL.md の TODO 状態が長期間放置され、技術的負債として蓄積する

---

## 2. 何を達成するか（What）

### 2.1 目的

`int-test-skill` の SKILL.md を完成させた上で `.agents/skills/int-test-skill/` を作成し、
mirror sync 機構の対称性を回復する。

### 2.2 最終ゴール

- `.claude/skills/int-test-skill/SKILL.md` が TODO なし・完成状態になっている
- `.agents/skills/int-test-skill/` が canonical と同内容で存在している
- mirror sync 機構の対象スキル一覧に `int-test-skill` が含まれている

### 2.3 スコープ

#### 含むもの

- `.claude/skills/int-test-skill/SKILL.md` の TODO 箇所の完成（概要説明・Anchor・Trigger）
- `.agents/skills/int-test-skill/` ディレクトリの作成と SKILL.md の同期
- mirror sync 機構の対象スキル一覧への `int-test-skill` 追加

#### 含まないもの

- `int-test-skill` の機能拡張・新規実装（別タスク推奨）
- `int-test-skill` 以外のスキルの mirror 追加
- mirror sync の自動化スクリプト改修（既存機構の活用のみ）

### 2.4 成果物

| 種別 | ファイル                                                         |
| ---- | ---------------------------------------------------------------- |
| 更新 | `.claude/skills/int-test-skill/SKILL.md`（TODO 箇所の完成）      |
| 新規 | `.agents/skills/int-test-skill/SKILL.md`（mirror として同期）    |
| 更新 | mirror sync 機構の対象スキル一覧（設定ファイルまたはスクリプト） |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- **ブロッカー**: `.claude/skills/int-test-skill/SKILL.md` の TODO 箇所が完成していること
  - 概要説明（2〜3 行）・Anchor・Trigger が記入されていること
- TASK-CONFLICT-PREVENT-001 で構築した mirror sync 機構が動作していること
- `.agents/skills/` ディレクトリが存在し、他スキルが mirror 済みであること

### 3.2 依存タスク

| タスクID                  | 状態 | 内容                           |
| ------------------------- | ---- | ------------------------------ |
| TASK-CONFLICT-PREVENT-001 | 完了 | mirror sync 機構の構築（前提） |

### 3.3 必要な知識

- `int-test-skill` の現在の SKILL.md 内容と TODO 箇所
- mirror sync 機構の対象スキル一覧の管理方法（設定ファイルの場所と形式）
- SKILL.md のフォーマット（skill-creator の出力仕様）

### 3.4 推奨アプローチ

1. `.claude/skills/int-test-skill/SKILL.md` を読み、TODO 箇所を特定する
2. `int-test-skill` の実際の用途（スキルの内容・利用シーン）を調査し、SKILL.md を完成させる
3. mirror sync 機構を使って `.agents/skills/int-test-skill/` を作成・同期する
4. mirror sync の対象スキル一覧に `int-test-skill` を追加する
5. 同期後に canonical と mirror の内容が一致することを確認する

---

## 4. 実行手順

### Phase 構成

| Phase | 内容                            | 目安 |
| ----- | ------------------------------- | ---- |
| 1     | 現状調査・SKILL.md 完成         | 1h   |
| 2     | mirror 作成と sync 対象への追加 | 0.5h |
| 3     | 整合性確認                      | 0.5h |

### Phase 1: 現状調査・SKILL.md 完成

#### 目的

`int-test-skill` の実態を把握し、SKILL.md の TODO 箇所を完成させる。

#### 手順

1. `.claude/skills/int-test-skill/SKILL.md` を読み、TODO 箇所を一覧化する
2. `int-test-skill` ディレクトリ内の他ファイル（プロンプト・設定等）を確認し、スキルの実際の用途を把握する
3. 概要説明（2〜3 行）・Anchor（アンカー名・適用範囲・目的）・Trigger（発動条件）を記入して SKILL.md を完成させる

#### 成果物

- TODO なし・完成状態の `.claude/skills/int-test-skill/SKILL.md`

#### 完了条件

- SKILL.md 内に TODO 文字列が残っていない
- 概要説明・Anchor・Trigger が具体的に記入されている

### Phase 2: mirror 作成と sync 対象への追加

#### 目的

`.agents/skills/int-test-skill/` を作成し、mirror sync 機構の対象に追加する。

#### 手順

1. mirror sync 機構を使って `.agents/skills/int-test-skill/` ディレクトリを作成し、SKILL.md を同期する
2. mirror sync の対象スキル一覧（設定ファイルまたはスクリプト）に `int-test-skill` を追加する

#### 成果物

- `.agents/skills/int-test-skill/SKILL.md`（canonical と同内容）
- 更新済みの mirror sync 対象スキル一覧

#### 完了条件

- `.agents/skills/int-test-skill/SKILL.md` が存在し、canonical と内容が一致する
- mirror sync 対象スキル一覧に `int-test-skill` が記載されている

### Phase 3: 整合性確認

#### 目的

canonical と mirror の内容が一致し、mirror sync 機構が正しく動作することを確認する。

#### 手順

1. `.claude/skills/int-test-skill/SKILL.md` と `.agents/skills/int-test-skill/SKILL.md` の内容を比較する
2. mirror sync スクリプトを実行し、`int-test-skill` が正常に処理されることを確認する
3. 他のスキルの mirror 状態に影響がないことを確認する

#### 成果物

- 整合性確認済みの報告メモ

#### 完了条件

- canonical と mirror の SKILL.md が同一内容である
- mirror sync スクリプト実行後にエラーが発生しない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `.claude/skills/int-test-skill/SKILL.md` に TODO が残っていない
- [ ] 概要説明・Anchor・Trigger が SKILL.md に記入されている
- [ ] `.agents/skills/int-test-skill/SKILL.md` が存在する
- [ ] canonical と mirror の SKILL.md 内容が一致する
- [ ] mirror sync 機構の対象スキル一覧に `int-test-skill` が含まれている

### 品質要件

- [ ] mirror sync スクリプト実行時にエラーが発生しない
- [ ] 他スキルの mirror 状態に影響がない

### ドキュメント要件

- [ ] mirror sync 対象スキル一覧が更新されている

---

## 6. 検証方法

### テストケース

| 確認項目                        | 確認方法                                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------------- |
| SKILL.md に TODO が残っていない | `grep "TODO" .claude/skills/int-test-skill/SKILL.md` が 0 件                                    |
| mirror が存在する               | `ls .agents/skills/int-test-skill/SKILL.md` が成功する                                          |
| canonical と mirror が一致する  | `diff .claude/skills/int-test-skill/SKILL.md .agents/skills/int-test-skill/SKILL.md` が差分なし |

### 検証コマンド例

```bash
# TODO の残存確認
grep "TODO" .claude/skills/int-test-skill/SKILL.md

# mirror の存在確認
ls .agents/skills/int-test-skill/SKILL.md

# canonical と mirror の差分確認
diff .claude/skills/int-test-skill/SKILL.md .agents/skills/int-test-skill/SKILL.md
```

---

## 7. リスクと対策

| リスク                                                       | 影響度 | 発生確率 | 対策                                                                               |
| ------------------------------------------------------------ | ------ | -------- | ---------------------------------------------------------------------------------- |
| SKILL.md の記入内容が実際のスキル用途と乖離する              | 中     | 中       | `int-test-skill` ディレクトリ内の全ファイルを読んだ上で概要・Trigger を記入する    |
| mirror sync スクリプトが `int-test-skill` を正しく処理しない | 中     | 低       | 追加後にスクリプトを実行し、出力ログで `int-test-skill` が処理されたことを確認する |
| 他スキルの mirror sync に副作用が生じる                      | 低     | 低       | Phase 3 で全スキルの mirror 状態を確認し、変化がないことを検証する                 |
| SKILL.md 完成前に mirror 作成を進めてしまう                  | 中     | 低       | Phase 1（SKILL.md 完成）を完了条件としてから Phase 2 へ進む手順を厳守する          |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/conflict-prevent-skills-001/`（TASK-CONFLICT-PREVENT-001 の成果物）
- `.claude/skills/int-test-skill/SKILL.md`（canonical の現行状態）
- `.claude/skills/aiworkflow-requirements/references/`（参照仕様）

### 関連ファイル

- `.claude/skills/int-test-skill/`（canonical ディレクトリ）
- `.agents/skills/`（mirror 配置先）
- mirror sync 機構の設定ファイル（TASK-CONFLICT-PREVENT-001 で作成されたもの）

---

## 9. 備考

### 苦戦箇所【記入必須】

| 症状                                                                     | 原因                                                                                                  | 対応                                                                 | 再発防止                                                                                                          |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `int-test-skill` が mirror sync 対象から除外されていた                   | SKILL.md が TODO 状態（概要説明・Anchor・Trigger 未記入）だったため、意図的に sync から除外されていた | mirror sync の対象から除外したまま運用を続けた                       | 新規スキルを canonical に追加する際は、SKILL.md 完成を必須条件として明記し、TODO 状態での追加を防ぐルールを設ける |
| canonical に存在するが mirror に存在しない非対称な状態が発見されなかった | mirror sync 機構の対象スキル一覧が明示的に管理されておらず、除外されたスキルの追跡が困難だった        | TASK-CONFLICT-PREVENT-001 の Phase 12 で発見され、未タスクとして記録 | mirror sync 機構に「canonical 存在・mirror 未存在」を検出するチェックを追加することを検討する                     |
