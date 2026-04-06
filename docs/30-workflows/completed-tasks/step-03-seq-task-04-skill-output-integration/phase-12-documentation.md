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
3. 書き出した内容の前後に目印（`<!-- SKILL_START: {skillName} -->` と `<!-- SKILL_END: {skillName} -->`）をつけます
4. プログラムがその目印を探して、中身を取り出します
5. 取り出した内容を `.claude/skills/スキル名/SKILL.md` というファイルに保存します
6. 保存したら「スキルができたよ！」という通知が画面に表示されます

**マーカーとは？**

`<!-- SKILL_START: {skillName} -->` と `<!-- SKILL_END: {skillName} -->` は HTML のコメント記法を使った「目印」です。人間には見えないメモのようなものですが、プログラムはこの目印を探して「ここからここまでがスキルの内容だ」と判断できます。

---

### Task 12-2: スキル出力フォーマット仕様

#### SKILL.md フォーマット

SDK セッションが出力するスキル定義は、以下のマーカーで囲まれた SKILL.md 形式である。

```
<!-- SKILL_START: {skillName} -->
name: スキル名
description: スキルの説明（2-3行）

## 目的
スキルが何をするかの説明

## トリガー
スキルが発動する条件

## 使い方
スキルの使い方の説明

...（SKILL.md の残りの内容）
<!-- SKILL_END: {skillName} -->
```

#### 必須フィールド

| フィールド | 形式                          | 説明                                               |
| ---------- | ----------------------------- | -------------------------------------------------- |
| `name`     | `name: スキル名`（1行目推奨） | スキルの一意識別子。ディレクトリ名として使用される |

#### ディレクトリ名変換ルール（スラッグ化）

`name` フィールドの値を以下のルールで変換してディレクトリ名（`dirName`）を生成する。

| 変換ルール               | 例                      |
| ------------------------ | ----------------------- |
| 全て小文字に変換         | `My Skill` → `my skill` |
| 空白文字をハイフンに変換 | `my skill` → `my-skill` |

例: `name: GitHub Issue Manager` → `dirName: github-issue-manager`

### Task 12-3: パース戦略の説明

#### マーカー検出アルゴリズム

`SkillCreatorOutputHandler.extractSkillFromOutput()` が使用するパース戦略を説明する。

```
入力: SDK セッション出力テキスト（複数行文字列）

ステップ1: SKILL_START_PATTERN で開始マーカーを検索
  → 見つからない場合: フォールバックとして出力全体を SKILL.md として扱う

ステップ2: SKILL_END_PATTERN で終了マーカーを検索
  → 見つからない場合: フォールバックとして出力全体を SKILL.md として扱う
  → SKILL_END が SKILL_START より前にある場合: null を返す

ステップ3: 2つのマーカーの間のテキストを slice() で抽出
  → 先頭・末尾の空白を trim() で除去

ステップ4: 抽出テキストから name フィールドを正規表現で検索
  → パターン: /^name:\s*(.+)$/m（行頭から始まる name: フィールド）
  → 見つからない場合: 開始マーカー内の skillName を採用
  → マーカーが無い場合は `name:` が必須（無ければ null）

ステップ5: ParsedSkillOutput を返す
  → { name, content, dirName }
```

#### マーカーが複数存在する場合の動作

`match()` は最初に一致した位置を返すため、`<!-- SKILL_START: {skillName} -->` が複数存在する場合は最初のマーカーペアが採用される。

#### エラーケースのまとめ

| エラーケース                                                                          | `extractSkillFromOutput()` の戻り値 | `handleSessionComplete()` の動作 |
| ------------------------------------------------------------------------------------- | ----------------------------------- | -------------------------------- |
| `<!-- SKILL_START: {skillName} -->` マーカーなし                                      | フォールバック（出力全体）          | `name:` が無ければ処理スキップ   |
| `<!-- SKILL_END: {skillName} -->` マーカーなし                                        | フォールバック（出力全体）          | `name:` が無ければ処理スキップ   |
| `<!-- SKILL_END: {skillName} -->` が `<!-- SKILL_START: {skillName} -->` より前にある | `null`                              | 処理スキップ                     |
| `name` フィールドなし（マーカーあり）                                                 | マーカー内の skillName を採用       | 処理継続                         |
| `name` フィールドなし（マーカーなし）                                                 | `null`                              | 処理スキップ                     |
| ファイル保存失敗（権限エラー等）                                                      | -                                   | エラーログ出力、IPC 通知なし     |
| SkillRegistry 登録失敗                                                                | -                                   | エラーログ出力、IPC 通知は続行   |

### Task 12-4: 技術者向けリファレンス

#### クラス・コンポーネント一覧

| 名前                                                  | 種別           | ファイルパス                                                                           | 責務                                                                                                |
| ----------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `SkillCreatorOutputHandler`                           | クラス         | `apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts`                  | スキル出力捕捉・保存・登録・IPC 通知・上書き承認後の再実行                                          |
| `SkillCreatorOutputHandler.handleOverwriteApproved()` | メソッド       | `apps/desktop/src/main/services/runtime/SkillCreatorOutputHandler.ts`                  | 上書き確認後の保存・登録再開                                                                        |
| `SkillCreatorConversationPanel`                       | コンポーネント | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorConversationPanel.tsx` | `skillCreatorAPI.onOutputReady()` を購読し、`SkillCreatorResultPanel` を表示                        |
| `SkillCreatorResultPanel`                             | コンポーネント | `apps/desktop/src/renderer/components/skill-creator/SkillCreatorResultPanel.tsx`       | スキル生成完了 UI・プレビュー表示・上書き確認アクション（`SkillCreatorConversationPanel` 内で表示） |
| `SkillRegistry.registerFromPath()`                    | メソッド       | `apps/desktop/src/main/services/runtime/SkillRegistry.ts`                              | パスからスキルを登録・上書き                                                                        |

#### 型定義一覧

| 型名                      | ファイルパス                                | 説明                             |
| ------------------------- | ------------------------------------------- | -------------------------------- |
| `ParsedSkillOutput`       | `packages/shared/src/types/skillCreator.ts` | SDK 出力から抽出されたスキル定義 |
| `SkillOutputReadyPayload` | `packages/shared/src/types/skillCreator.ts` | IPC 通知ペイロード               |

#### IPC チャネル一覧

| 定数名                       | 値                           | 方向            | 説明               |
| ---------------------------- | ---------------------------- | --------------- | ------------------ |
| `SKILL_CREATOR_OUTPUT_READY` | `skill-creator:output-ready` | Main → Renderer | スキル生成完了通知 |

## 参照資料

| 資料名              | パス                           |
| ------------------- | ------------------------------ |
| Phase 11 手動テスト | `./phase-11-manual-testing.md` |
| Phase 2 設計        | `./phase-2-design.md`          |

## 成果物

| 成果物                     | パス                          | 形式     |
| -------------------------- | ----------------------------- | -------- |
| ドキュメント（本ファイル） | `./phase-12-documentation.md` | Markdown |

## 完了条件

- [ ] 概念説明（中学生レベル）を記述した
- [ ] スキル出力フォーマット仕様（マーカー・必須フィールド・スラッグ化ルール）を記述した
- [ ] パース戦略（アルゴリズム・エラーケース）を記述した
- [ ] 技術者向けリファレンス（クラス・型・IPC 一覧）を記述した

## 次の Phase: Phase 13 (phase-13-completion.md)
