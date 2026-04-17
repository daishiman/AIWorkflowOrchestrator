# Phase 1: 要件定義 - TASK-CONFLICT-PREVENT-001

## ステータス: 完了

## 目的

`.claude/skills/`配下のマージコンフリクトを引き起こす全ファイルパターンを特定し、受入条件を確定する。

---

## タスク分類

- **タスク種別**: NON_VISUAL（UI/UX変更なし）
- **変更対象**: Git設定ファイル / Huskyフック / .gitignore

---

## コンフリクト実績分析（過去10PR調査結果）

### 確認したコンフリクト解消コミット

| コミット    | 内容                                                     |
| ----------- | -------------------------------------------------------- |
| `cc6c7a9f3` | main → docs/workflow-skill-wizard-tasks コンフリクト解消 |
| `626630db2` | SKILL.md + keywords.json（main側3082キーワードを採用）   |
| `5939943fe` | SKILL.md changelog entries コンフリクト解消              |
| `5dfad6831` | skill-definitions-sync コンフリクト解消                  |
| `d3a53cd04` | settings.local.json・SKILL.md コンフリクト解消           |

### コンフリクト頻出ファイル分類

| カテゴリ             | ファイルパターン              | 頻度   | サイズ             |
| -------------------- | ----------------------------- | ------ | ------------------ |
| スキル版管理         | `.claude/skills/*/SKILL.md`   | 毎PR   | 200-650行          |
| 自動生成インデックス | `indexes/keywords.json`       | 毎PR   | 15000行            |
| 追記ログ             | `LOGS.md`                     | 毎PR   | 3000-70000行       |
| インデックスMD       | `indexes/topic-map.md`        | 2PR毎  | 1000行超           |
| 設定                 | `.claude/settings.local.json` | 3PR毎  | 23KB               |
| バックアップ         | `.backups/`                   | 不定期 | タイムスタンプ付き |

---

## 既存の`.gitattributes`状態（実装前）

```
.claude/skills/*/LOGS.md          merge=union  ✓
.agents/skills/*/LOGS.md          merge=union  ✓
.claude/skills/*/EVALS.json       merge=ours   ✓
.claude/skills/*/references/*.md  merge=union  ✓
.claude/skills/*/SKILL-changelog.md merge=union ✓
.claude/skills/*/indexes/*.json   merge=ours   ✓
.claude/skills/*/indexes/*.md     merge=union  ✓
```

**未設定（コンフリクト継続中）:**

- `.claude/skills/*/SKILL.md` ← バージョンテーブル追記競合
- `.claude/settings.local.json` ← allow配列追記競合
- `.backups/` ← .gitignore未登録

**接続未完了:**

- `.husky/post-merge` ← スクリプトはあるがgitフック未接続

---

## 受入条件

| ID   | 条件                                                               | 検証方法                                                     |
| ---- | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| AC-1 | `.claude/skills/*/SKILL.md merge=union`が`.gitattributes`に設定    | `git check-attr merge .claude/skills/skill-creator/SKILL.md` |
| AC-2 | `.agents/skills/*/SKILL.md merge=union`が`.gitattributes`に設定    | 同上（.agents/側）                                           |
| AC-3 | `.husky/post-merge`が`generate-index.js`を呼び出し失敗時exit 1する | `sh .husky/post-merge`でexit codeを確認                      |
| AC-4 | `.agents/`ミラーがpost-mergeフックで`indexes/*.json`同期           | フック実行後に`.agents/`のタイムスタンプ確認                 |
| AC-5 | `.claude/settings.local.json merge=ours`が`.gitattributes`に設定   | `git check-attr merge .claude/settings.local.json`           |
| AC-6 | `.backups/`が`.gitignore`に追加されており追跡対象外                | `git status .claude/skills/.backups/` で表示なし             |

---

## スコープ

**含む:**

- `.gitattributes`へのマージ戦略追加
- `.husky/post-merge`の作成・改善
- `.gitignore`への`.backups/`追加
- husky v10互換性対応

**含まない:**

- `keywords.json`の`.gitignore`移行（中長期対策）
- LOGS.mdのアーカイブ化（中長期対策）
- SKILL.md月別changelog分割（中長期対策）

---

## 命名規則の確認

| 対象                  | 命名パターン                                           |
| --------------------- | ------------------------------------------------------ |
| gitattributesパターン | globパターン（`*`でシングルレベル、`**`で全レベル）    |
| mergeドライバー       | `union`（行レベル追記統合） / `ours`（現ブランチ優先） |
| huskyフック           | `.husky/post-merge`（shell script）                    |
