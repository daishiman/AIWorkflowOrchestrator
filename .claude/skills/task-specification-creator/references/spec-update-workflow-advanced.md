# システム仕様更新ワークフロー（詳細手順）

> 元ファイル: [spec-update-workflow.md](spec-update-workflow.md)
> 読み込み条件: Phase 12 Task 2 の Step 1/Step 2 を実行する時。

## 更新フロー（2ステップ）

### Step 1: タスク完了記録（必須）

**全タスクで必須**。バグ修正でも新機能でも必ず実行。

```
Phase 12 Task 2 開始
    |
該当する仕様書を特定
  -- 例: skill関連 -> interfaces-agent-sdk.md
    |
「## 完了タスク」セクションを追加（末尾近く）
  -- 必須: 「タスク完了ステータス更新」セクションの詳細テンプレートを使用
  -- テスト結果サマリー表・成果物表を含む詳細記録を追加すること
    |
「## 関連ドキュメント」セクションに実装ガイドリンク追加
    |
「変更履歴」にバージョン追記
    |
aiworkflow-requirements/LOGS.md にタスク完了エントリを追加
    |
task-specification-creator/LOGS.md にタスク完了記録を追加
    |
topic-map.md に新規セクションエントリを追加
    |
完了
```

#### Step 1 完了チェックリスト

##### Step 1-A: タスク完了記録
- [ ] 該当仕様書の「完了タスク」テーブルにタスクIDと完了日を追加した
- [ ] 「タスク完了ステータス更新」セクションの**詳細テンプレート**で完了記録を追加した
  - [ ] テスト結果サマリー表（機能/エラーハンドリング/アクセシビリティ/統合テスト）
  - [ ] 成果物テーブル（テスト結果レポート、実装ガイド、発見課題リスト）
- [ ] 「関連ドキュメント」セクションに実装ガイドリンクを追加した
- [ ] 「変更履歴」にバージョン番号を追記した

##### Step 1-B: 実装状況テーブル更新
- [ ] 該当仕様書に「実装状況」テーブルがある場合、該当行を「完了」に更新した
- [ ] 仕様書作成のみのタスクは、該当行を `spec_created` に更新した（`completed` にしない）
- [ ] 更新対象として列挙した仕様書が実在することを `test -f <path>` で確認した
- [ ] `phase-*.md` が `../task-*.md` を参照している場合、ブリッジ仕様の実在または参照修正を確認した

##### Step 1-C: 関連タスクテーブル更新
- [ ] arch-state-management.md、interfaces-agent-sdk.md、security-api-electron.md、task-workflow.md の「関連タスク」テーブルを確認した
- [ ] 該当タスクのステータスを「**完了**」に更新した

##### Step 1-D: topic-map.md再生成
- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行した
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されている

##### Step 1-E: 未タスク指示書作成・登録（1件以上検出時は必須）
- [ ] 未タスク候補が1件以上の場合、`docs/30-workflows/unassigned-task/` に指示書を作成・配置した
- [ ] 未タスクごとに配置先判定を記録した
- [ ] `task-workflow.md` の残課題テーブルに新規未タスクを登録した
- [ ] 関連仕様書の残課題テーブルに新規未タスクを登録した
- [ ] `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js` を実行し、`ALL_LINKS_EXIST` を確認した

##### Step 1-F: DevOps関連ファイル更新（CI/CD最適化タスクの場合は必須）
- [ ] `deployment-gha.md` にCI/CD変更内容を記載した
- [ ] `technology-devops.md` にパターン・完了タスクを追加した
- [ ] `quality-requirements.md` に品質関連設定を追加した

##### Step 1-G: 検証コマンド順次実行（Phase 12同期ガード）

**1. 未タスク参照リンク検証**
```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

**2. 索引再生成**
```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js
git diff --stat -- .claude/skills/*/indexes/topic-map.md .claude/skills/*/indexes/keywords.json
```

**3. SKILL 検証（3スキル）**
```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

合格基準: Error 0件。Warning は3段階分類（許容/要監視/要対応）に基づき対応する。
詳細な判定フローは [spec-update-workflow.md](spec-update-workflow.md) の Step 1-G.3.1 を参照。

**4. Phase仕様書参照と outputs 実体の整合確認**
```bash
rg -n "docs/30-workflows/unassigned-task/task-.*\\.md" docs/30-workflows/{{FEATURE_NAME}}/phase-*.md
```

#### Step 1-G.1: baseline / current 分離監査

```bash
# 1) 全体監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json

# 2) 対象ファイル監査
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json \
  --diff-from HEAD \
  --target-file docs/30-workflows/unassigned-task/<task>.md
```

判定ルール:
- `baseline`: 着手前から存在する違反。スコープ外として記録
- `current`: 今回変更で新規発生した違反。今回タスク内で修正必須

### 必須更新ファイル（全タスク共通）
- [ ] aiworkflow-requirements/LOGS.md を更新した
- [ ] task-specification-creator/LOGS.md を更新した
- [ ] aiworkflow-requirements/SKILL.md の変更履歴にバージョンを追記した
- [ ] task-specification-creator/SKILL.md の変更履歴にバージョンを追記した

#### LOGS.md 更新（必須：2ファイル）

**1. aiworkflow-requirements/LOGS.md** に以下の形式でエントリを追加:

```markdown
## {{DATE}}: {{TASK_NAME}}（{{TASK_ID}}）

| 項目         | 内容                     |
| ------------ | ------------------------ |
| タスクID     | {{TASK_ID}}              |
| 操作         | update-spec              |
| 対象ファイル | {{更新したファイル一覧}} |
| 結果         | success                  |
| 備考         | {{実装内容の概要}}       |
```

**2. task-specification-creator/LOGS.md** に以下の形式でエントリを追加:

```markdown
## {{DATE}} - {{TASK_NAME}}（{{TASK_ID}}）タスク完了

### コンテキスト
- スキル: task-specification-creator
- タスクID: {{TASK_ID}}

### 成果
- テストカバレッジ: {{TEST_COUNT}}テスト全件PASS
- 実装内容:
  - {{主要な実装内容1}}
  - {{主要な実装内容2}}

### 結果
- ステータス: success
- 完了日時: {{DATE}}
```

### Step 1-C: 関連タスクテーブル更新（詳細）

確認すべきファイル（タスク種別による）:

| タスク種別              | 確認すべきファイル                        | テーブル名                 |
| ----------------------- | ----------------------------------------- | -------------------------- |
| Skill/Agent関連         | `arch-state-management.md`                | 関連タスク                 |
| Skill/Agent関連         | `interfaces-agent-sdk-history.md`         | 未タスク候補               |
| IPC/Preload関連         | `security-api-electron.md`                | 関連タスク                 |
| IPC/Preload関連         | `api-ipc-agent.md`                        | チャンネル一覧・完了タスク |
| UI/UXコンポーネント関連 | `ui-ux-components.md`                     | 関連タスク                 |
| データベース関連        | `database-schema.md`                      | 関連タスク                 |

> **Step 1-C 発見手順**: `grep -rl "TASK_ID_OR_NAME" .claude/skills/aiworkflow-requirements/references/`

---

### IPC機能開発時の追加更新対象（Step 2該当時）

| # | 更新対象ファイル                          | 更新内容                                                 | 必須/任意 |
|---|-------------------------------------------|----------------------------------------------------------|-----------|
| 1 | `api-ipc-agent.md`                        | 新規チャンネル一覧、型定義、完了タスク記録               | 必須      |
| 2 | `security-electron-ipc.md`                | セキュリティ検証パターン（sender検証、ホワイトリスト）   | 必須      |
| 3 | `architecture-overview.md`                | IPCハンドラー登録一覧（registerAllIpcHandlers）           | 必須      |
| 4 | `interfaces-agent-sdk-skill.md`           | インターフェース定義、完了タスク記録                     | 必須      |
| 5 | `task-workflow.md`                        | 残課題テーブル更新、完了タスクセクション追加             | 必須      |
| 6 | `lessons-learned.md`                      | 実装教訓（新規パターン・落とし穴がある場合）             | 任意      |
| 7 | `architecture-implementation-patterns.md` | 実装パターン（新規パターンがある場合）                   | 任意      |

---

### Step 2: システム仕様更新（条件付き）

**更新判断基準に該当する場合のみ**実行。

```
[仕様変更有り？]（更新判断基準で判断）
    +-- No -> 「更新なし」をdocumentation-changelog.mdに明記して終了
    +-- Yes
         |
aiworkflow-requirements/references/{{該当ファイル}}.md を編集
         |
インデックス再生成
         |
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
         |
変更履歴に追記（aiworkflow-requirements/SKILL.md も必須更新）
```

## タスク完了ステータス更新テンプレート

```markdown
### タスク: {{TASK_NAME}}（{{COMPLETION_DATE}}完了）

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | {{TASK_ID}}                                                                |
| 完了日       | {{COMPLETION_DATE}}                                                        |
| ステータス   | **完了**                                                                   |
| テスト数     | {{AUTO_TEST_COUNT}}（自動テスト）+ {{MANUAL_TEST_COUNT}}（手動テスト項目） |
| 発見課題     | {{ISSUE_COUNT}}件                                                          |
| ドキュメント | `docs/30-workflows/{{TASK_NAME}}/`                                         |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS  | FAIL  |
| ------------------ | -------- | ----- | ----- |
| 機能テスト         | {{N}}    | {{N}} | {{N}} |
| エラーハンドリング | {{N}}    | {{N}} | {{N}} |
| アクセシビリティ   | {{N}}    | {{N}} | {{N}} |
| 統合テスト連携     | {{N}}    | {{N}} | {{N}} |
```

### 変更履歴更新

仕様書の`## 変更履歴`セクションに以下の形式で追記:

```markdown
| {{NEXT_VERSION}} | {{DATE}} | {{TASK_NAME}}完了 |
```

- 追記前に対象ファイルの既存 `Version` 列を確認し、同一番号を再利用しない。
- 同日に追補が複数回入る場合は、既存最大値に対して `+0.0.1` で採番する。

### 残課題更新

該当タスクが「残課題」にある場合、取り消し線で完了をマーク:

```markdown
| ~~{{TASK_NAME}}~~ | ~~{{依存タスク}}~~ | ~~{{優先度}}~~ | ~~{{未タスク指示書}}~~ -- **完了** |
```

---

## 参照リソース

| リソース                   | パス                                                                           |
| -------------------------- | ------------------------------------------------------------------------------ |
| 仕様スキル                 | `.claude/skills/aiworkflow-requirements/SKILL.md`                              |
| トピックマップ             | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  |
| 記述ガイドライン           | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`         |
| 仕様テンプレート           | `.claude/skills/aiworkflow-requirements/assets/spec-template.md`               |
| ドキュメント更新履歴テンプレート | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md` |

---

- [phase-12-documentation-guide.md](phase-12-documentation-guide.md)
- [phase12-checklist-definition.md](phase12-checklist-definition.md)
- [technical-documentation-guide.md](technical-documentation-guide.md)
- [patterns-phase12-sync.md](patterns-phase12-sync.md)

## 変更履歴

| Date | Changes |
| ---- | ------- |
| 2026-04-07 | よくある誤判断テーブル・入口ファイル誤判断パターンを spec-update-workflow.md から移動 |
| 2026-03-18 | 925行のmonolithから詳細手順を分離。親ファイルはインデックス+判断基準に縮小 |
| 2026-03-12 | Step 1 / Step 2 / validation の 3 ファイルへ責務分離 |

---

## よくある誤判断

| 誤判断 | 正しい扱い |
| --- | --- |
| 「実装ガイドを書いたので Step 1 は完了」 | 実装ガイドは Task 12-1。Step 1 は別物 |
| 「`.agents` を更新したから spec sync も終わった」 | 正本は `.claude`。mirror は代替不可 |
| 「spec_created task なので Step 1-B は不要」 | `spec_created` の記録も Step 1 で残す |
| 「warning だけなら Phase 12 を閉じてよい」 | pass 基準は validator ごとに明文化する |
| 「設計タスクなので Step 2 は計画だけ書けばよい」 | `spec_created` でも system spec / lessons / backlog / LOGS の実更新が必要 |
| 「実装先行タスクなので Before/After が同じなら書かなくてよい」 | current contract と target delta を分けて残し、同一ならその理由を明記する |
| 「state-only 修正でも screenshot を必ず要求する」 | 視覚差分がないなら `NON_VISUAL` と自動テストを優先し、スクリーンショットを捏造しない |
| 「IPC callback の回帰は手動でしか確認できない」 | `setupCallbackCapture()` 相当で callback を確定的に replay し、`render` + `act` で検証する |
| 「`spec_created` task に後から code 実装が入っても Step 2 は N/A のままでよい」 | shared / IPC / preload / renderer の current fact が変わった時点で Step 2 を再判定し、Phase 11 screenshot 方針も見直す |
| 「設計タスクの workflow root も `completed` にしてよい」 | workflow root は `implementation_ready`、completed records は `spec_created`。実装 gap は follow-up task として formalize する |
| 「generic なファイル名へ書いておけば十分」 | 実際の責務分割に沿った primary target file list を先に確定する |
| 「shared component を作ったので consumer surface 仕様も completed にしてよい」 | shared component の contract だけを更新し、ChatView / Workspace など mount 先の completed は consumer task 完了まで保留する |
| 「既存型を再利用しているので更新不要」 | **Step 1-B必須**。実装状況テーブルの更新は必須 |
| 「実装未着手の仕様書タスクも completed にすべき」 | **`spec_created` を適用**。仕様書作成のみ完了したタスクは `spec_created` を使用する |
| 「内部実装のみなので更新不要」 | **Step 1-A必須**。タスク完了記録は常に必須 |
| 「Renderer側で定義済みなので更新不要」 | **Step 2必要**。Main Process側のインターフェース追加は仕様追加に該当 |
| 「型は別タスクで追加済みなので更新不要」 | **Step 2必要**。新規クラス/コンポーネントは独自の仕様セクションが必要 |
| 「関連タスクテーブルは確認不要」 | **Step 1-C必須**。Grepで全箇所を確認が必要 |
| 「未タスク指示書のunassigned-task/配置は見送り」 | **作成が必要**。ガイドラインの「条件」要件を確認し、検出件数が1件以上の場合は原則作成する |
| 「実行タスクは表だけ記載すれば十分」 | **表+箇条書きの両方必須**。`phase-12-documentation.md` は実行タスクの表と `- Task 12-X:` 箇条書きを両方残すこと |
| 「未完了の未タスクを completed-tasks/unassigned-task に置いてよい」 | **配置先判定を必須記録**。未完了は `docs/30-workflows/unassigned-task/`、完了移管済みのみ `docs/30-workflows/completed-tasks/unassigned-task/` |
| 「workflow 個別配下の `unassigned-task/` を作ってよい」 | **global canonical path を使う**。未タスク指示書は `docs/30-workflows/unassigned-task/` を正本とする |
| 「task-workflow.md の未タスクリンクは後で直す」 | **Step 1-Eで即時整合**。`verify-unassigned-links.js` で機械検証する |
| 「task-specification-creator/LOGS.mdは後で更新」 | **Step 1-A必須**。両方のLOGS.md を同時に更新すること |
| 「worktree環境なのでStep 1-Aはマージ後でよい」 | **Step 1-A必須**。worktreeでも仕様書更新は実施可能 |
| 「`outputs/phase-12` が揃っていれば `phase-12-documentation.md` は未更新でもよい」 | **更新必須**。Task 1〜5 の結果を `phase-12-documentation.md` へ同期する |
| 「Phase 12 成果物を task root 直下へ置いてもよい」 | **`outputs/phase-12/` へ配置必須** |
| 「`artifacts.json` か `outputs/artifacts.json` の片方だけ更新すればよい」 | **両方同期必須** |
| 「`index.md` が completed なら `phase-*.md` と `artifacts*` は見なくてよい」 | **4点同期必須**。`index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` がずれると false positive |
| 「`artifacts.json` が completed なら `index.md` は見なくてよい」 | **`generate-index.js --workflow ... --regenerate` で再生成必須** |
| 「`artifacts.json` / `index.md` が completed なら `phase-1..11` 本文は pending のままでよい」 | **本文仕様書も同期必須** |
| 「`.agents/skills/...` を更新したので system spec 更新は完了」 | **`.claude/skills/...` が正本。mirror は代替不可** |
| 「mirror sync 完了は summary 記述だけでよい」 | **`diff -qr <canonical> <mirror>` の実行結果が必須** |
| 「foundation / internal-contract task は system spec 本文が既に current なら Phase 12 で触らなくてよい」 | **Step 1 と no-op 根拠記録は必須** |
| 「test runner blocker を見つけたら毎回新規未タスクを作る」 | **既存未タスクとの重複確認を先行** |
| 「user が正本 root を明示していても既定の root ルールを優先してよい」 | **user 指定rootを canonical root として扱う** |
| 「`origin/main...HEAD` が 0 件なら current worktree も未実装だ」 | **`origin/main...HEAD` と `git diff HEAD` を分離記録** |
| 「Phase 9の成果物名は `phase-9-quality.md` でも問題ない」 | **`phase-9-quality-assurance.md` に統一** |
| 「`documentation-changelog.md` だけあれば Phase 12 は完了扱いにできる」 | **必須5成果物を揃える** |
| 「Phase 12 成果物に `計画済み` / `更新予定` / `PRマージ後` が残っていても completed にできる」 | **planned wording が1件でも残れば未完了** |
| 「`manual-test-result.md` が `not_run` でも Phase 11/12 は completed にできる」 | **manual evidence 更新が必須** |
| 「Phase 13 ファイルを作ったので status は completed にしてよい」 | **user 承認がない限り `blocked` のまま** |
| 「`ipc-documentation.md` は概要説明だけでよい」 | **実装契約一致が必須** |
| 「internal adapter を追加したので public IPC / preload も更新済みと書いてよい」 | **到達面の確認が必須** |
| 「`audit-unassigned-tasks` のFAILは今回差分の失敗」 | **baseline/currentを分離** |
| 「仕様書参照パスは後で直す」 | **Step 1-B前に実在確認**。`test -f <path>` で事前に実在確認する |
| 「workflow ディレクトリがあるので `../task-xxx.md` はなくてもよい」 | **ブリッジ仕様または参照修正が必須** |
| 「task-00 参照切れは後続タスクで直す」 | **Phase 12内で即時修正** |
| 「current workflow だけ直せば親タスク/統合indexは後回しでよい」 | **親導線も同一ターンで正規化** |
| 「implementation anchor の markdown 追記だけなので source path 実在確認は不要」 | **target path 実在確認が必須** |
| 「duplicate source / ID collision を見つけたら毎回新規未タスクを作る」 | **current diff 起因か baseline かを先に分離** |
| 「standalone task へ移設したので current workflow だけ差し替えれば十分」 | **downstream consumer まで同一 wave で更新** |
| 「ディレクトリを移設したので workflow 本文はそのままでよい」 | **workflow 本文の canonical path と検証レポートも再生成する** |
| 「current workflow に code diff がないので Phase 11 screenshot は不要」 | **統合UI再確認なら Phase 11 実施** |
| 「docs-heavy screenshot 再監査は current build 再撮影しか認めない」 | **representative review board も許可** |
| 「visual TC と dismiss/keyboard 確認に同じ `TC-ID` を使ってよい」 | **`TC-*` と `NV-*`/automated を分離** |
| 「related unassigned row を completed 実績へ移した後も `verify-unassigned-links` の total は据え置きでよい」 | **exact count 再取得が必須** |
| 「IPC拡張済みでも旧チャンネル数のままでよい」 | **Step 2で仕様更新必須** |
| 「topic-map.mdは変更なし」 | **再生成が必要**。仕様書にセクション追加・削除・更新・行数変更があった場合、`generate-index.js`で行番号を再同期すること |
| 「arch-state-management.mdの関連タスクは確認済み」 | **Grep必須**。仕様書のSliceセクション内「関連タスク」テーブルは見落としやすい |
| 「Slice統合は内部リファクタリングなので更新不要」 | **Step 2必要**。Slice統合（例: skillSlice→agentSlice）はarch-state-management.mdの更新が必須 |
| 「スキル改善なし」と判断 | **フィードバック必須**。Phase 12で必ずスキル改善検討を実施し、改善点がなくても「改善点なし」としてskill-feedback-report.mdを作成すること |
| 「aiworkflow/task-spec だけ直せば十分」 | **`skill-creator` も条件付きで更新** |
| 「テストリファクタリングなので仕様更新不要」 | **Step 2必要な場合あり**。テスト戦略変更はStep 2対象 |
