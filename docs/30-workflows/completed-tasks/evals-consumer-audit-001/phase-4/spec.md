# Phase 4: 静的検索による全 consumer 初期リストアップ - タスク仕様書

## メタ情報

| 項目             | 内容                                                               |
| ---------------- | ------------------------------------------------------------------ |
| phase_id         | 4                                                                  |
| task_id          | TASK-EVALS-CONSUMER-AUDIT-001                                      |
| Phase名          | 静的検索・Raw Evidence 収集                                        |
| 前提Phase        | Phase 3（Phase 設計完了）                                          |
| 後続Phase        | Phase 5（consumer 整理・field map）／Phase 6（dual root 差分抽出） |
| ステータス       | 未実施                                                             |
| 作成日           | 2026-04-19                                                         |
| 機能名           | evals-consumer-audit                                               |
| depends_on       | Phase 3（design-docs/phase-3-phase-design.md）                     |
| taskType         | NON_VISUAL / 調査タスク（コード実装なし）                          |
| 並列可否         | 完全並列可（検索パターン × root ごとに独立）                       |
| 対応品質ゲート   | QG-2（漏れ 0 件・raw 出力が Phase 5 整理対象に全て含まれる）       |
| 所属ウェーブ     | W1                                                                 |
| 出力ディレクトリ | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/`      |

---

## 1. 目的（Why）

`.claude/skills/*/EVALS.json` および `.agents/skills/*/EVALS.json` の**全 consumer を網羅的に特定する前段として**、`rg` / `grep` / `find` による静的検索を実行し、一次データ（raw evidence）を不可変ファイルに固定する。

この Phase 4 の成果物は「未分類の生検索結果」であり、Phase 5 での consumer 分類・field map 作成、Phase 6 での dual root diff、Phase 7 での漏れ再検索すべての根拠となる。

---

## 2. 入力（前 Phase 成果物・参照資料）

| 入力                         | パス                                                                                   | 用途                                               |
| ---------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Phase 1 要件定義             | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-1-requirements.md`       | FR-1 / FR-2 / NFR-2 / NFR-3 / NFR-4 の検索範囲要件 |
| Phase 2 スコープ             | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-2-scope-architecture.md` | §1.1 含むもの・§7.2 再現コマンド                   |
| Phase 3 Phase 設計           | `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-3-phase-design.md`       | §1 Phase 4 設計（6 種 raw ファイル・完了条件）     |
| 元タスク指示書               | `docs/30-workflows/unassigned-task/TASK-EVALS-CONSUMER-AUDIT-001.md`                   | 調査対象の背景・consumer 候補の例示                |
| 代表 EVALS スキーマ          | `.claude/skills/task-specification-creator/EVALS.json`                                 | 検索対象フィールド名の把握                         |
| aiworkflow-requirements 正本 | `.claude/skills/aiworkflow-requirements/references/`                                   | EVALS 言及箇所の存在確認（Phase 9 で本格突合）     |

---

## 3. 実行手順

### Step 0: P50 前提チェック（並行作業の不在確認）

1. 最新 main との差分確認を行う。

   ```bash
   git fetch origin main
   git log --oneline origin/main..HEAD -- .claude/skills .agents/skills | head -50
   ```

2. EVALS.json 関連ファイルが直近で変更されていないか確認する。

   ```bash
   git log -20 --name-only -- '.claude/skills/*/EVALS.json' '.agents/skills/*/EVALS.json'
   ```

3. 並行ブランチで同作業が進行していないかを確認する（GitHub 上で `EVALS` キーワードの open PR / branch をチェック）。

### Step 1: 出力ディレクトリ作成と実行ログ初期化

1. 出力ディレクトリを作成する。

   ```bash
   mkdir -p docs/30-workflows/evals-consumer-audit-001/outputs/phase-4
   ```

2. 各 raw ファイルの先頭にはコマンドとタイムスタンプ（ISO 8601, UTC）をコメントとして記録する。
   各ファイル先頭 3 行のフォーマット:

   ```text
   # command: <実行したコマンドの完全形>
   # executed_at: 2026-04-19T00:00:00Z
   # working_directory: <リポジトリルート>
   ```

### Step 2: 静的検索 6 本を実行（完全並列可）

以下 6 本は相互に独立しているため **W1 内で並列実行**してよい。各検索の標準出力を `tee` で対応する raw ファイルに保存する。

#### 2-1. `.claude/skills/` 配下のコード／スクリプト参照

```bash
rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' \
  .claude/skills/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' \
  -g '*.{js,ts,tsx,mjs,cjs}' \
  | tee docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-claude.txt
```

#### 2-2. `.agents/skills/` 配下のコード／スクリプト参照

```bash
rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' \
  .agents/skills/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' \
  -g '*.{js,ts,tsx,mjs,cjs}' \
  | tee docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-agents.txt
```

#### 2-3. `apps/` 配下の TS/TSX consumer 検索

```bash
rg -n 'EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE' \
  apps/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' \
  -g '*.{js,ts,tsx,mjs,cjs}' \
  | tee docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-apps.txt
```

#### 2-4. 動的パス生成の補完検索（RISK-1 対策）

`path.join(..., 'EVALS.json')` などテンプレートリテラル・文字列連結で生成されるパスを補足する。

```bash
rg -n "join\([^)]*EVALS|\`[^\`]*EVALS\.json|'EVALS\.json'|\"EVALS\.json\"" \
  .claude/skills/ .agents/skills/ apps/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' \
  -g '*.{js,ts,tsx,mjs,cjs}' \
  | tee docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-dynamic.txt
```

#### 2-5. エージェント定義・ドキュメント内参照

```bash
rg -n 'EVALS\.json|EVALS' \
  .claude/skills/ .agents/skills/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' \
  -g '*.md' \
  | tee docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-docs.txt
```

#### 2-6. EVALS.json ファイル自体の全列挙（Phase 6 で使用）

```bash
find .claude .agents apps \
  -type f -name 'EVALS.json' \
  -not -path '*/node_modules/*' \
  -not -path '*/.backups/*' \
  | sort \
  | tee docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-find-evals.txt
```

### Step 3: テスト consumer の追加検索

上記 2-3 に含まれるが、テストを明示的に分離して把握するため追加検索を行う（同一パターン、対象ディレクトリのみ絞り込み）。

```bash
rg -n 'EVALS' \
  apps/desktop/src/__tests__/ \
  -g '*.{ts,tsx}' \
  | tee docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-tests.txt
```

### Step 4: 各 raw ファイルに実行メタデータを付与

すべての raw ファイルについて、Step 1 のフォーマットに従って先頭 3 行のメタデータ（コマンド／実行時刻／作業ディレクトリ）が記録されていることを確認する。不足していれば手動で追記する。

### Step 5: 生結果の初期要約を `raw-consumer-list.md` に集約

Phase 5 の入口となる「未分類の生の検索結果一覧」として、6〜7 本の raw ファイルを統合したサマリを作成する。

1. ファイル名: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-consumer-list.md`
2. 構成:
   - メタ情報（実行日時・コマンド一覧）
   - 各 raw ファイルごとのヒット件数
   - 初見で気づいた重複・dynamic path 候補の箇条書き
   - 次 Phase（Phase 5）での分類観点（A/B/C/D × 2 root）

このファイルは「解釈を含まない素の一覧」であり、分類は Phase 5 で行う。

---

## 4. 成果物（ファイルパス・フォーマット・スキーマ）

| 成果物                      | パス                                                                              | フォーマット | スキーマ                               |
| --------------------------- | --------------------------------------------------------------------------------- | ------------ | -------------------------------------- |
| `.claude` 配下 raw 検索結果 | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-claude.txt`  | text         | `path:line:matched` 形式（rg 標準）    |
| `.agents` 配下 raw 検索結果 | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-agents.txt`  | text         | 同上                                   |
| `apps/` 配下 raw 検索結果   | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-apps.txt`    | text         | 同上                                   |
| 動的パス補完検索結果        | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-dynamic.txt` | text         | 同上                                   |
| ドキュメント参照結果        | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-docs.txt`    | text         | 同上                                   |
| EVALS.json 全列挙結果       | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-find-evals.txt`   | text         | 1 行 1 パス（sort 済み）               |
| テスト consumer raw         | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-grep-tests.txt`   | text         | `path:line:matched` 形式               |
| 生結果サマリ                | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-consumer-list.md` | Markdown     | §3 Step 5 の構成（未分類の初期リスト） |

全ファイル先頭 3 行に `# command:` / `# executed_at:` / `# working_directory:` メタコメントを持つ（NFR-2 の再現性要件）。

---

## 5. 完了条件チェックリスト

- [ ] `raw-grep-claude.txt` が生成され、先頭 3 行にメタコメントが記録されている
- [ ] `raw-grep-agents.txt` が生成され、先頭 3 行にメタコメントが記録されている
- [ ] `raw-grep-apps.txt` が生成され、先頭 3 行にメタコメントが記録されている
- [ ] `raw-grep-dynamic.txt` が生成され、先頭 3 行にメタコメントが記録されている（0 ヒットでも空ファイルとして作成）
- [ ] `raw-grep-docs.txt` が生成され、先頭 3 行にメタコメントが記録されている
- [ ] `raw-find-evals.txt` に `.claude/skills/` と `.agents/skills/` 両方の EVALS.json が少なくとも 1 件ずつ含まれる
- [ ] `raw-grep-tests.txt` が生成されている
- [ ] `raw-consumer-list.md` が作成され、各 raw ファイルのヒット件数が記載されている
- [ ] 検索除外条件（`.backups/` と `node_modules/`）が全コマンドに適用されている
- [ ] Step 0 の P50 チェックで並行作業が無いことを確認した
- [ ] Phase 5 エージェントが分類可能な粒度の一覧になっている

---

## 6. 検証方法（自己検証コマンド）

### 6.1 すべての raw ファイルが存在し空でないこと

```bash
for f in raw-grep-claude.txt raw-grep-agents.txt raw-grep-apps.txt \
         raw-grep-dynamic.txt raw-grep-docs.txt raw-find-evals.txt \
         raw-grep-tests.txt raw-consumer-list.md; do
  path="docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/$f"
  if [ -f "$path" ]; then
    echo "OK: $f ($(wc -l < "$path") lines)"
  else
    echo "MISSING: $f"
  fi
done
```

全エントリが `OK` であり、`raw-find-evals.txt` が 0 行でないこと。

### 6.2 メタコメント（先頭 3 行）の存在確認

```bash
for f in raw-grep-claude.txt raw-grep-agents.txt raw-grep-apps.txt \
         raw-grep-dynamic.txt raw-grep-docs.txt raw-find-evals.txt \
         raw-grep-tests.txt; do
  path="docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/$f"
  head -3 "$path" | grep -q '^# command:' && echo "META OK: $f" || echo "META MISSING: $f"
done
```

### 6.3 `raw-find-evals.txt` の root 対称性の初期確認

```bash
claude_count=$(grep -c '^\.claude/' docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-find-evals.txt)
agents_count=$(grep -c '^\.agents/' docs/30-workflows/evals-consumer-audit-001/outputs/phase-4/raw-find-evals.txt)
echo ".claude: $claude_count / .agents: $agents_count"
```

値が大きく乖離する場合は RISK-2（片方欠損）の候補であり、Phase 6 で精査する。

---

## 7. リスクと対策

| ID     | リスク                                                   | 対策                                                                                  |
| ------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| P4-R-1 | 動的パス生成を rg で見落とす                             | Step 2-4 の補完検索（`raw-grep-dynamic.txt`）＋ Phase 7 の漏れ再検索で二重化          |
| P4-R-2 | `.backups/` や `node_modules/` からの誤検出              | 全コマンドに `-g '!**/node_modules/**'` と `-g '!**/.backups/**'` を徹底              |
| P4-R-3 | rg 未インストール環境でのフォールバック漏れ              | rg 不在時は `grep -rn` 同等コマンドを使い、raw ファイル先頭メタに `tool: grep` と記録 |
| P4-R-4 | 監査中に EVALS.json が書き換わりスナップショットがブレる | Step 0 で並行作業を確認。検索中は EVALS.json を変更しない（Phase 2 §2.3 の方針）      |
| P4-R-5 | raw ファイルサイズが肥大化して Phase 5 で扱いにくい      | NFR-8（1000 行以内目安）を超過する場合、root 別・拡張子別に分割する                   |

---

## 8. 前後 Phase との依存

- **前提**: Phase 3（`design-docs/phase-3-phase-design.md`）が完了し、§1 で定義された 6 種 raw ファイル出力要件が確定していること。
- **後続**:
  - **Phase 5**: `raw-grep-*.txt` を入力として `consumer-audit-report.md` / `evals-field-map.md` を作成する。
  - **Phase 6**: `raw-find-evals.txt` を入力としてスキル単位 diff を実行する。
  - **Phase 7**: Phase 4 と同じ検索コマンドを再実行し、Phase 5 で整理した consumer 集合との差分を 0 件にすることを確認する。

本 Phase の成果物は Phase 5 / 6 / 7 すべての入力源であり、**変更後に Phase 5 以降を再実行しない場合、raw ファイルの再生成は禁止**（監査スナップショットの整合性を担保するため）。
