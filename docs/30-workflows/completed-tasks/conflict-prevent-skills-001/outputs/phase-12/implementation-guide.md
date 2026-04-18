# Implementation Guide: conflict-prevent-skills-001

## Part 1: なぜこれが必要か（中学生向け）

Git でチーム開発をすると、同じファイルを複数の人が同時に変えたとき「どっちを使う？」という問題（コンフリクト）が起きます。

このプロジェクトでは `.claude/skills/` というフォルダに「スキル」ファイルがたくさんあります。10本の作業ブランチが同時に走るので、特に次の2種類のファイルでコンフリクトが頻発していました。

1. **自動生成ファイル**（`topic-map.md` など）— スクリプトが作るファイルなので、手でマージするより「今のブランチのを使い、後で再生成する」方が確実
2. **ログファイル**（`LOGS.md` など）— 両方のブランチの記録を残したいので「両方くっつける」方がよい

そこで、ファイルの種類ごとにマージの方法を分けるルールを設定しました。

---

## Part 2: 技術的な実装内容

### 1. 対象ファイルと責務

```ts
type ConflictManagedAsset =
  | { kind: "generated-index"; pathGlob: string; merge: "ours"; recovery: "regenerate" }
  | { kind: "append-only-log"; pathGlob: string; merge: "union"; recovery: "none" }
  | { kind: "volatile-metadata"; pathGlob: string; merge: "ours"; recovery: "manual-audit" };

type RegenerateCommand = {
  target: "aiworkflow-requirements";
  command: string;
  trigger: "manual" | "post-merge-hook";
};
```

| 種別 | 代表パス | merge 方針 | 復旧方法 |
| --- | --- | --- | --- |
| generated index | `.claude/skills/*/indexes/*.md`, `.json` | `merge=ours` | `generate-index.js` 再実行 |
| append-only log | `.claude/skills/*/LOGS.md` | `merge=union` | 追記統合 |
| volatile metadata | `.claude/skills/*/EVALS.json` | `merge=ours` | consumer 監査前提で手動確認 |

### 2. `.gitattributes` の修正

**修正箇所**: `indexes/*.md` のポリシーを `merge=union` → `merge=ours` に変更

```gitattributes
# 修正後
.claude/skills/*/indexes/*.json   merge=ours
.claude/skills/*/indexes/*.md     merge=ours
.agents/skills/*/indexes/*.json   merge=ours
.agents/skills/*/indexes/*.md     merge=ours
```

`merge=ours` はカスタムドライバー名（Git 組み込みではない）。事前に bootstrap が必要。

### 3. custom merge driver bootstrap + hook install

```bash
bash .claude/scripts/setup-merge-drivers.sh
# または: git config merge.ours.driver true
```

`setup-merge-drivers.sh` は `merge.ours.driver` 登録に加えて、`install-git-hooks.sh` を呼び出して `post-merge` hook も入れる。各開発者が clone / worktree 作成後に1回だけ実行する。`session-init.sh` が未設定を検知して警告する。

### 4. post-merge 再生成フロー

```ts
export function setupMergeDrivers(): void;
export function installGitHooks(): void;
export function regenerateAiworkflowIndexes(): Promise<void>;
```

```bash
# 手動 bootstrap
bash .claude/scripts/setup-merge-drivers.sh

# merge 後の自動再生成
.git/hooks/post-merge
```

`post-merge-index-regenerate.sh` は aiworkflow-requirements の `indexes/*.md` と `indexes/*.json` を再生成する。これで `merge=ours` により現ブランチ側が優先された後も、generated index を current facts に戻せる。

### 5. `generate-index.js` の deterministic 化

`topic-map.md` の先頭にあった日付ヘッダー（`> 自動生成: YYYY-MM-DD`）を除去。これにより、毎回の regenerate で余計な diff が発生しなくなる。行番号索引（`| L\d+`）は維持。

### 6. session-init.sh への警告追加

`merge.ours.driver` が未設定の場合、セッション開始時に警告と修正コマンドを表示する。

### 7. API シグネチャと使用例

```bash
# 正本 index 再生成
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js

# mirror 側 index 再生成
node .agents/skills/aiworkflow-requirements/scripts/generate-index.js

# workflow 検証
node .agents/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/conflict-prevent-skills-001
```

### 8. エラーハンドリング

| ケース | 検知方法 | 対応 |
| --- | --- | --- |
| `merge.ours.driver` 未設定 | `session-init.sh` warning | `bash .claude/scripts/setup-merge-drivers.sh` |
| post-merge hook 未導入 | `.git/hooks/post-merge` 不在 | `install-git-hooks.sh` を再実行 |
| mirror drift 残存 | `diff -qr` | full sync は未タスクに切り出す |
| EVALS consumer 未監査 | Phase 12 review | schema 変更を保留する |

### 9. エッジケース

| ケース | 振る舞い |
| --- | --- |
| generated index が current branch 側に残る | merge 後 regenerate で正本に戻す |
| `.claude` だけ更新され `.agents` が stale | partial sync と full sync を分離記録する |
| structured docs へ `merge=union` を広く適用 | follow-up で再評価し、append-only と分離する |

### 10. 設定値・定数一覧

| 項目 | 値 / パターン | 用途 |
| --- | --- | --- |
| merge driver 名 | `merge.ours.driver` | generated index 用 custom driver |
| canonical root | `.claude/skills/` | 正本 |
| mirror root | `.agents/skills/` | mirror |
| generated index script | `*/scripts/generate-index.js` | index 再生成 |

### 11. EVALS.json の取り扱い

schema は本 task では変更しない。`merge=ours` policy のみ適用（既存設定と同じ）。

## 視覚証跡

UI/UX変更なしのため Phase 11 スクリーンショット不要

## follow-up タスク

- `.claude` / `.agents` full mirror sync の完了条件を guard 化する
- EVALS consumer audit 完全版を実施する
- `references/*.md merge=union` の適用範囲を再設計する
