# Phase 5: 変更ファイル一覧

**タスクID**: TASK-CONFLICT-PREVENT-001
**フェーズ**: Phase 5 — 実装
**作成日**: 2026-04-18

---

## 変更ファイル一覧

| #   | ファイルパス                             | 変更種別 | 変更概要                                                             |
| --- | ---------------------------------------- | -------- | -------------------------------------------------------------------- |
| 1   | `.gitattributes`                         | 修正     | `indexes/*.md merge=union` → `merge=ours`                            |
| 2   | `scripts/generate-index.js`              | 修正     | date ヘッダー行の除去 (deterministic 化)                             |
| 3   | `.claude/scripts/session-init.sh`        | 修正     | `merge.ours.driver` 未設定時の warn 追加                             |
| 4   | `.claude/scripts/setup-merge-drivers.sh` | 新規     | `git config merge.ours.driver true` を登録するセットアップスクリプト |

---

## 変更詳細

### 1. `.gitattributes`

**変更行数**: 1行変更

```diff
-indexes/*.md merge=union
+indexes/*.md merge=ours
```

**目的**: インデックスファイルは自動生成物であるため、merge 時は常に current branch 側を採用する。

---

### 2. `scripts/generate-index.js`

**変更行数**: 1行変更

```diff
-const header = `# Index\n\n自動生成: ${new Date().toISOString()}\n\n`;
+const header = `# Index\n\n`;
```

**目的**: 実行のたびに変化する日付行を除去し、`topic-map.md` を deterministic にする。

---

### 3. `.claude/scripts/session-init.sh`

**変更行数**: 追加 7行

```diff
+# merge.ours.driver チェック
+if ! git config --get merge.ours.driver > /dev/null 2>&1; then
+  echo "[WARN] merge.ours.driver が未設定です。" >&2
+  echo "       次のコマンドで登録してください:" >&2
+  echo "         bash .claude/scripts/setup-merge-drivers.sh" >&2
+fi
```

**目的**: 新規開発者や CI 環境でのドライバー未設定を早期発見する。

---

### 4. `.claude/scripts/setup-merge-drivers.sh` (新規)

**行数**: 9行

```bash
#!/usr/bin/env bash
# setup-merge-drivers.sh
# カスタム merge driver (ours) をローカル git config に登録する

set -euo pipefail

git config merge.ours.driver true
echo "[INFO] merge.ours.driver = true を登録しました。"
echo "       git config --get merge.ours.driver で確認できます。"
```

**目的**: ワンコマンドで merge driver を登録できるオンボーディング補助スクリプト。

---

## 変更の影響範囲まとめ

| 影響カテゴリ           | 影響あり                 | 説明                                              |
| ---------------------- | ------------------------ | ------------------------------------------------- |
| merge 動作             | `.gitattributes`         | `indexes/*.md` の merge 戦略が変わる              |
| index 生成             | `generate-index.js`      | 出力ファイルから日付行が消える                    |
| 開発体験               | `session-init.sh`        | セッション開始時に警告が表示される場合がある      |
| セットアップ           | `setup-merge-drivers.sh` | 新規ファイルのため既存動作への影響なし            |
| EVALS.json             | なし                     | schema 変更なし (consumer-audit-decision.md 参照) |
| アプリケーションコード | なし                     | UI / ビジネスロジックへの影響なし                 |

---

## git diff --stat (想定)

```
 .gitattributes                           |  2 +-
 scripts/generate-index.js               |  2 +-
 .claude/scripts/session-init.sh         |  7 +++++++
 .claude/scripts/setup-merge-drivers.sh  |  9 +++++++++
 4 files changed, 17 insertions(+), 2 deletions(-)
 create mode 100755 .claude/scripts/setup-merge-drivers.sh
```

---

## 関連ドキュメント

- `outputs/phase-5/implementation-log.md` — 変更内容の詳細ログ
- `outputs/phase-5/consumer-audit-decision.md` — EVALS.json コンシューマー監査結果
