# 苦戦箇所・教訓 - task-imp-layer12-pr-creation-005

> 元タスク `task-imp-layer12-spec-definition-004`（Phase 1-12）の実行中に発生した
> 苦戦箇所を記録する。本タスク（Phase 13 PR作成）の実行前に必ず参照すること。

## 苦戦箇所 1: Phase 5 grep パターン設計 — 例示値の誤検知

### 発生フェーズ

Phase 5（実装）

### 何が起きたか

拡張ガイドラインに記述した例示値 `L2-008` が grep パターンで誤検知された。
grep スクリプトが「存在しない check ID の混入」と判定し、実装との突き合わせが fail した。

実際には `L2-008` は「次に追加する場合は L2-008 を使う」という**例示値**であり、
`SkillCreatorVerificationEngine.ts` に実装されている check ID ではない。

### 根本原因

テーブル行全体をスコープにした grep パターンを使っていたため、
「定義行」と「例示行」を区別できなかった。

### 再発防止策

- grep パターンは「定義テーブルの行のみ」に絞る（例: `| L2-` で始まる行のみ）
- 拡張ガイドラインの例示値には `# 例示` や `<!-- example -->` などのマーカーを付けて、grep スクリプトが除外できるようにする
- 仕様書作成時に「定義セクション」と「ガイドラインセクション」を明確に分離する

### PR 作成時の注意

本 Phase 13 では grep パターン設計の問題は解決済みのため、追加対応は不要。
ただし今後の docs タスクで同様の check ID 定義 + 拡張ガイドライン構成を使う場合は
上記の設計ルールを適用すること。

---

## 苦戦箇所 2: Phase 12 validate-phase-output が Phase 11 補助証跡不足で警告

### 発生フェーズ

Phase 12（ドキュメント更新）の事前チェック

### 何が起きたか

`validate-phase-output.js` を実行したところ、Phase 11 の補助証跡（以下 3 点）が
不足しているという警告が出た:

1. `outputs/phase-11/manual-test-checklist.md`
2. `outputs/phase-11/screenshot-plan.json`
3. `outputs/phase-11/screenshots/non-visual-placeholder.png`

Phase 11 を NON_VISUAL タスクとして処理していたが、
**補助証跡の 3 点セット自体は NON_VISUAL でも配置必須**だった。

### 根本原因

docs-only / NON_VISUAL タスクの Phase 11 では「実スクリーンショットが不要」という
認識から、補助証跡も省略可能と誤解していた。

実際のルール（SKILL.md Phase 12 苦戦防止 Tips 参照）:

- `screenshots/` ディレクトリが空（PNG 0件）のまま残るとvalidator error
- NON_VISUAL 判定で実スクリーンショットが不要な場合は `screenshots/.gitkeep` を削除
- 代わりに `non-visual-placeholder.png`（ダミー画像）を配置する

### 再発防止策

docs-only / NON_VISUAL タスクでも Phase 11 に入る前に以下の 3 点を用意する:

```
outputs/phase-11/
├── manual-test-checklist.md  # NON_VISUAL 代替確認リスト
├── screenshot-plan.json       # NON_VISUAL 宣言 + 理由記載
└── screenshots/
    └── non-visual-placeholder.png  # ダミー PNG（1x1 px 等）
```

### PR 作成時の注意

本タスクでは Phase 12 完了時に補助証跡 3 点セットを追加配置済み（32/32 PASS）。
PR 作成前に `outputs/phase-11/` に 3 ファイルが存在することを確認すること:

```bash
ls docs/30-workflows/imp-layer12-spec-definition-004/outputs/phase-11/
# 期待: manual-test-checklist.md, screenshot-plan.json, discovered-issues.md,
#       manual-test-result.md, screenshots/non-visual-placeholder.png
```

---

## 苦戦箇所 3: artifacts.json の件数不一致（root と outputs の非同期）

### 発生フェーズ

Phase 12（ドキュメント更新）のタスク 12-6

### 何が起きたか

Phase 12 成果物を当初 5 件として `artifacts.json` に登録していたが、
タスク 12-6 の `phase12-task-spec-compliance-check.md` を追加したため 6 件になった。

以下の 2 ファイルを両方更新し直す必要が生じた:

1. `docs/30-workflows/imp-layer12-spec-definition-004/artifacts.json`（root）
2. `docs/30-workflows/imp-layer12-spec-definition-004/outputs/artifacts.json`（outputs）

片方だけ更新すると `validate-phase-output.js` が「artifacts.json と outputs/artifacts.json の不一致」を検知して fail する。

### 根本原因

Phase 12 の成果物数を Phase 12 着手前に確定させていなかった（Task 12-6 が後から追加された）。

SKILL.md の Feedback 2 対策:

> Phase 12 の最初の作業として `outputs/artifacts.json` と各 `phase-*.md` に記載された
> artifact 名を 1 対 1 で突合し、不一致があれば着手前に修正する

### 再発防止策

- Phase 12 着手前に `phase-12-documentation.md` の成果物テーブルと
  `artifacts.json` の Phase 12 artifacts を突合する
- 成果物が増える場合は **root と outputs の両 `artifacts.json` を同時に更新する**
- `validate-phase-output.js` を実行して不一致がないことを確認してから次の作業に進む

### PR 作成時の注意

PR 作成前に以下のコマンドで両 `artifacts.json` の Phase 12 成果物が 6 件であることを確認:

```bash
# root artifacts.json
cat docs/30-workflows/imp-layer12-spec-definition-004/artifacts.json | \
  python3 -c "import sys,json; d=json.load(sys.stdin); arts=d['phases']['12']['artifacts']; print(len(arts), '件'); [print(' -', a) for a in arts]"

# outputs artifacts.json
cat docs/30-workflows/imp-layer12-spec-definition-004/outputs/artifacts.json | \
  python3 -c "import sys,json; d=json.load(sys.stdin); arts=d['phases']['12']['artifacts']; print(len(arts), '件'); [print(' -', a) for a in arts]"
```

期待される 6 件:

```
outputs/phase-12/implementation-guide.md
outputs/phase-12/system-spec-update-summary.md
outputs/phase-12/documentation-changelog.md
outputs/phase-12/unassigned-task-detection.md
outputs/phase-12/skill-feedback-report.md
outputs/phase-12/phase12-task-spec-compliance-check.md
```

---

## 苦戦箇所 4: implementation-guide.md の validator 要件不足

### 発生フェーズ

Phase 12（ドキュメント更新）のタスク 12-6

### 何が起きたか

`validate-phase12-implementation-guide.js` を実行したところ FAIL した。
Part 2（技術者レベル）の記述が不十分で、以下が不足していた:

| 不足項目                 | validator が要求する内容                      |
| ------------------------ | --------------------------------------------- |
| TypeScript 型定義        | check ID 型、Layer 型の TypeScript interface  |
| API シグネチャ           | `verify()` メソッドのシグネチャと戻り値型     |
| 使用例（コードブロック） | `SkillCreatorVerificationEngine` の呼び出し例 |
| エラーハンドリング       | fail 時の挙動、エラー型                       |
| エッジケース             | 空入力、不正 ID、Layer 範囲外等の扱い         |

SKILL.md の Task 1（実装ガイド）Part 2 必須要件:

> - インターフェース/型定義（TypeScript）を含める
> - API シグネチャと使用例を記載
> - エラーハンドリングとエッジケースを説明

### 根本原因

Part 1（中学生レベル）の概念説明に注力するあまり、
Part 2 が「check ID 一覧テーブルと命名規則の説明」だけで完結してしまった。
validator が要求する技術的詳細（型・API・使用例・エラー）が欠落していた。

### 再発防止策

Part 2 の記述前に `validate-phase12-implementation-guide.js` の
チェック観点（下記）を箇条書きで把握し、全項目を網羅してから執筆する:

1. TypeScript interface または type alias が 1 つ以上存在する
2. メソッドシグネチャ（関数名・引数・戻り値型）が記載されている
3. コードブロック（`typescript または `ts）が 1 つ以上存在する
4. エラーハンドリングの説明が存在する
5. エッジケースの説明が存在する

### PR 作成時の注意

PR 作成前に validator を再実行して PASS であることを確認:

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  docs/30-workflows/imp-layer12-spec-definition-004
# 期待: PASS（全チェック項目クリア）
```

---

## まとめ: PR 作成前の最終確認コマンド

```bash
# 1. 未コミット変更の確認
git status

# 2. Phase 11 補助証跡の確認（苦戦箇所 2）
ls docs/30-workflows/imp-layer12-spec-definition-004/outputs/phase-11/

# 3. artifacts.json の件数確認（苦戦箇所 3）
echo "=== root artifacts.json Phase 12 ===" && \
  cat docs/30-workflows/imp-layer12-spec-definition-004/artifacts.json | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['phases']['12']['artifacts']), '件')"
echo "=== outputs/artifacts.json Phase 12 ===" && \
  cat docs/30-workflows/imp-layer12-spec-definition-004/outputs/artifacts.json | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d['phases']['12']['artifacts']), '件')"

# 4. implementation-guide validator 確認（苦戦箇所 4）
node .claude/skills/task-specification-creator/scripts/validate-phase12-implementation-guide.js \
  docs/30-workflows/imp-layer12-spec-definition-004

# 5. 全体 validator 確認
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/imp-layer12-spec-definition-004
```

全て OK であれば PR 作成に進む。
