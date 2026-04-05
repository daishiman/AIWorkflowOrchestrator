# Phase 12: ドキュメント -- Skill Output Integration

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 12                       |
| 機能名     | skill-output-integration |
| タスクID   | TASK-SDK-SC-04           |
| 作成日     | 2026-04-02               |
| 依存 Phase | Phase 11（手動テスト）   |

## 目的

スキル出力フォーマット仕様とパース戦略について、開発者が参照できるドキュメントを整備する。中学生レベルでも理解できる概念説明と、技術者向けリファレンスの両方を提供する。

## 実行タスク

### Task 12-1: 概念説明（中学生レベル）

#### スキル生成の仕組みをわかりやすく説明する

---

**「スキル」ってなに？**

スキルとは、Claude Code に新しい機能を追加するための「レシピカード」のようなものです。たとえば「コードのバグを自動で直す」「テストを書いてくれる」といった機能を、SKILL.md というファイルに書いておくことで、いつでも使えるようになります。

**どうやってスキルが生まれるの？**

1. あなたが「どんなスキルを作りたいか」を質問に答えながら教えます
2. Claude（AI）がその情報をもとにスキルの内容を考えて書き出します
3. 書き出した内容の前後に目印（`<!-- SKILL_START: スキル名 -->` と `<!-- SKILL_END: スキル名 -->`）をつけます
4. プログラムがその目印を探して、中身を取り出します
5. 取り出した内容を `.claude/skills/スキル名/SKILL.md` というファイルに保存します
6. 保存したら「スキルができたよ！」という通知が画面に表示されます

**マーカーとは？**

`<!-- SKILL_START: スキル名 -->` と `<!-- SKILL_END: スキル名 -->` は HTML のコメント記法を使った「目印」です。人間には見えないメモのようなものですが、プログラムはこの目印を探して「ここからここまでがスキルの内容だ」と判断できます。

---

### Task 12-2: スキル出力フォーマット仕様

#### SKILL.md フォーマット

SDK セッションが出力するスキル定義は、以下のマーカーで囲まれた SKILL.md 形式である。

```markdown
<!-- SKILL_START: スキル名 -->

name: スキル名
description: スキルの説明（2-3行）

## 目的

スキルが何をするかの説明

## トリガー

スキルが発動する条件

## 使い方

スキルの使い方の説明

...（SKILL.md の残りの内容）

<!-- SKILL_END: スキル名 -->
```

#### 必須フィールド

| フィールド | 形式                          | 説明                                               |
| ---------- | ----------------------------- | -------------------------------------------------- |
| `name`     | `name: スキル名`（1行目推奨） | スキルの一意識別子。ディレクトリ名として使用される |

#### ディレクトリ名変換ルール（スラッグ化）

`name` フィールドの値を以下のルールで変換してディレクトリ名（`dirName`）を生成する。

| 変換ルール                     | 例                           |
| ------------------------------ | ---------------------------- |
| 全て小文字に変換               | `My Skill` → `my skill`      |
| 空白文字をハイフンに変換       | `my skill` → `my-skill`      |
| パス区切りと `..` を除去       | `../malicious` → `malicious` |
| NULL バイトをハイフンに置換    | `skill\0name` → `skill-name` |
| 連続ハイフンを圧縮し前後を除去 | `--my--skill--` → `my-skill` |

例: `name: GitHub Issue Manager` → `dirName: github-issue-manager`

### Task 12-3: パース戦略の説明

#### マーカー検出アルゴリズム

`SkillCreatorOutputHandler.extractSkillFromOutput()` が使用するパース戦略を説明する。

```text
入力: SDK セッション出力テキスト（複数行文字列）

ステップ1: SKILL_START_MARKER_RE の位置を match() で検索
  → 見つからない場合: フォールバック戦略Bへ（出力全体をスキル内容として扱う）

ステップ2: SKILL_END_MARKER_RE の位置を match() で検索
  → 見つからない場合: フォールバック戦略Bへ
  → SKILL_END が SKILL_START より前にある場合: フォールバック戦略Bへ

ステップ3: 2つのマーカーの間のテキストを slice() で抽出
  → 先頭・末尾の空白を trim() で除去

ステップ4: 抽出テキストから name フィールドを正規表現で検索
  → パターン: /^name:\s*(.+)$/m（行頭から始まる name: フィールド）
  → 見つからない場合: マーカー属性名（SKILL_START の {skillName} 部分）を使用
  → どちらも見つからない場合: null を返す

ステップ5: ParsedSkillOutput を返す
  → { name, content, dirName }
```

#### フォールバック戦略B

マーカーが存在しない場合、アシスタントメッセージ全体をスキル内容として扱います。
`name:` フィールドが見つかればスキルとして処理し、見つからなければ null を返して処理をスキップします。

#### エラーケースのまとめ

| エラーケース                         | `extractSkillFromOutput()` の戻り値   | `handleSessionComplete()` の動作 |
| ------------------------------------ | ------------------------------------- | -------------------------------- |
| SKILL_START マーカーなし + name なし | `null`                                | 処理スキップ                     |
| SKILL_START マーカーなし + name あり | `ParsedSkillOutput`（フォールバック） | 正常処理                         |
| SKILL_END マーカーなし               | `null`（name 見つからない場合）       | 処理スキップ                     |
| マーカー内に `name` フィールドなし   | マーカー属性名で補完                  | 正常処理                         |
| パス区切りや `..` を含む name        | `ParsedSkillOutput`（安全な dirName） | 正常処理                         |
| NULL バイトを含む name               | `ParsedSkillOutput`（安全な dirName） | 正常処理                         |
| ファイル保存失敗（権限エラー等）     | -                                     | エラーログ出力、IPC 通知なし     |
| SkillRegistry 登録失敗               | -                                     | エラーログ出力、IPC 通知は続行   |

### Task 12-4: 技術者向けリファレンス

#### クラス・コンポーネント一覧

| 名前                               | 種別           | ファイルパス                                                                     | 責務                                 |
| ---------------------------------- | -------------- | -------------------------------------------------------------------------------- | ------------------------------------ |
| `SkillCreatorOutputHandler`        | クラス         | `apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts`            | スキル出力捕捉・保存・登録・IPC 通知 |
| `SkillCreatorResultPanel`          | コンポーネント | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx` | スキル生成完了 UI・プレビュー表示    |
| `SkillRegistry`                    | クラス         | `apps/desktop/src/main/services/runtime/SkillRegistry.ts`                        | インメモリスキル登録管理             |
| `SkillRegistry.registerFromPath()` | メソッド       | 同上                                                                             | パスからスキルを登録・上書き         |

### メソッド一覧（SkillCreatorOutputHandler）

| メソッド                                | 説明                                                                |
| --------------------------------------- | ------------------------------------------------------------------- |
| `extractSkillFromOutput(sessionOutput)` | SDK 出力からスキル定義を抽出（マーカーベース + フォールバック）     |
| `saveSkill(skill)`                      | `.claude/skills/{dirName}/SKILL.md` にファイル保存                  |
| `registerToRegistry(skillPath)`         | SkillRegistry にパスから登録                                        |
| `notifyOutputReady(payload)`            | IPC `skill-creator:output-ready` で Renderer に通知                 |
| `handleSessionComplete(sessionOutput)`  | メインエントリ: extract -> 上書き確認 -> save -> register -> notify |
| `handleOverwriteApproved(payload)`      | 上書き確認後の保存・登録再開                                        |

### 型定義一覧

| 型名                      | ファイルパス                                              | 説明                             |
| ------------------------- | --------------------------------------------------------- | -------------------------------- |
| `ParsedSkillOutput`       | `packages/shared/src/types/skillCreator.ts`               | SDK 出力から抽出されたスキル定義 |
| `SkillOutputReadyPayload` | `packages/shared/src/types/skillCreator.ts`               | IPC 通知ペイロード               |
| `RegistrySkillEntry`      | `apps/desktop/src/main/services/runtime/SkillRegistry.ts` | Registry 内のスキルエントリ      |

### IPC チャネル一覧

| 定数名                       | 値                           | 方向             | 説明               |
| ---------------------------- | ---------------------------- | ---------------- | ------------------ |
| `SKILL_CREATOR_OUTPUT_READY` | `skill-creator:output-ready` | Main -> Renderer | スキル生成完了通知 |

### エクスポート定数（SkillCreatorOutputHandler.ts）

| 定数名                  | 値                                  | 説明                                  |
| ----------------------- | ----------------------------------- | ------------------------------------- |
| `SKILL_START_MARKER_RE` | `/<!-- SKILL_START:\s*(.+?)\s*-->/` | 属性付き SKILL_START マーカー正規表現 |
| `SKILL_END_MARKER_RE`   | `/<!-- SKILL_END:\s*(.+?)\s*-->/`   | 属性付き SKILL_END マーカー正規表現   |

---

## テスト一覧

### SkillCreatorOutputHandler テスト（22件）

| テストID | テスト内容                                                |
| -------- | --------------------------------------------------------- |
| T-01     | マーカーで囲まれた内容を抽出する                          |
| T-01b    | マーカーなしでも name があればフォールバック抽出する      |
| T-01c    | マーカー内に name がない場合はマーカー属性名を採用する    |
| T-02     | 正しいパスに保存する                                      |
| T-03     | SkillRegistry.registerFromPath() が正しく呼び出される     |
| T-04     | 既存スキル存在時に上書き確認フラグが立つ                  |
| T-04b    | ユーザー承認後に handleOverwriteApproved() が続行する     |
| T-04c    | handleSessionComplete() の保存失敗時は通知しない          |
| T-04d    | handleOverwriteApproved() の保存失敗時は通知しない        |
| T-05     | SKILL_CREATOR_OUTPUT_READY チャネルに送信する             |
| T-07a    | SKILL_START のみで SKILL_END がない場合は null            |
| T-07b    | マーカー間に name がない場合はマーカー属性名を採用        |
| T-07c    | スキル名スペースを dirName ハイフン区切りにスラッグ化     |
| T-07d    | パス区切りや `..` を含むスキル名でも安全な dirName にする |
| T-07e    | NULL バイトを含むスキル名でも安全な dirName にする        |
| T-07f    | パース失敗時は何も実行しない                              |
| T-08a    | mkdir 失敗時は Error をスロー                             |
| T-08b    | writeFile 失敗時は Error をスロー                         |
| T-09a    | Registry 失敗でもエラーをスローせず処理続行               |
| T-09b    | 同名スキルを上書き登録できる                              |
| T-10a    | saveSkill 失敗時は通知せずに終了                          |
| T-10b    | handleOverwriteApproved で saveSkill 失敗時は通知しない   |

### SkillCreatorResultPanel テスト（4件）

| テストID | テスト内容                                         |
| -------- | -------------------------------------------------- |
| T-06     | スキル名と SKILL.md 内容プレビューを表示する       |
| T-06b    | payload が null の場合は何も表示しない             |
| T-06c    | requiresOverwriteConfirm true で上書きボタンを表示 |
| T-06d    | スキルを開くボタンで onOpenSkill が呼ばれる        |

### SkillRegistry テスト（7件）

| テスト内容                                            |
| ----------------------------------------------------- |
| register でエントリを追加し get で取得できる          |
| unregister でエントリを削除できる                     |
| getAll で全エントリを返す                             |
| register 同名スキルは上書きされる                     |
| registerFromPath で SKILL.md を読み込んで登録する     |
| 同名スキルが存在する場合は上書き登録する              |
| name: フィールドが存在しない場合は Error をスローする |

## 参照資料

| 資料名              | パス                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 11 手動テスト | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-11-manual-testing.md` |
| Phase 2 設計        | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-2-design.md`          |

## 成果物

| 成果物                     | パス                                                                                                                                                               | 形式     |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| ドキュメント（本ファイル） | `docs/30-workflows/skill-creator-agent-sdk-lane/task-spec-sdk-interactive-skill-creator-v3/step-03-seq-task-04-skill-output-integration/phase-12-documentation.md` | Markdown |

## 完了条件

- [ ] 概念説明（中学生レベル）を記述した
- [ ] スキル出力フォーマット仕様（マーカー・必須フィールド・スラッグ化ルール）を記述した
- [ ] パース戦略（アルゴリズム・エラーケース）を記述した
- [ ] 技術者向けリファレンス（クラス・型・IPC 一覧）を記述した

## 次の Phase: Phase 13 (phase-13-completion.md)
