# [#1150] "[UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001] Phase 12 dual skill-root mirror sync ガード"

## メタ情報

```yaml
task_id: UT-IMP-PHASE12-DUAL-SKILL-ROOT-MIRROR-SYNC-GUARD-001
task_name: Phase 12 dual skill-root mirror sync ガード
category: 改善
target_feature: Phase 12 の system spec / skill docs 同期（`.claude/skills` 正本 + `.agents/skills` mirror）
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-UI-07-DASHBOARD-ENHANCEMENT Phase 12 再監査（実装苦戦箇所・2026-03-11）
created_date: 2026-03-11
dependencies: []
spec_path: docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-dual-skill-root-mirror-sync-guard-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-07 の Phase 12 再監査では、ユーザー指定の正本が `.claude/skills/...` である一方、既存 workflow・旧成果物・検証ガイドの一部が `.agents/skills/...` を参照していた。  
そのため、正本だけ更新して validator を通しても mirror 側が stale のまま残りやすく、再確認時に path drift が再発する構造が露出した。

### 1.2 問題点・課題

- repository に dual skill-root（`.claude` / `.agents`）があるのに、Phase 12 の正本判定と mirror sync の完了条件が分離定義されていない。
- validator 実行経路は user 指定root に寄せられても、旧成果物や workflow のコマンド例が mirror root を指し続けることがある。
- `diff -qr` / `rsync --checksum` などの root 間整合確認がテンプレート必須条件になっておらず、片側だけ更新して完了扱いにしやすい。

### 1.3 放置した場合の影響

- system spec と skill docs の正本/ミラーが再び分岐し、後続タスクで「どちらが正しいか」の判断コストが発生する。
- `quick_validate` や `verify-*` が通っても、旧参照経路から見た成果物は stale のまま残り、再監査で差し戻しが起きる。
- dual root を持つ repository ごとに毎回手動判断が必要になり、Phase 12 の再利用性が下がる。

---

## 2. 何を達成するか（What）

### 2.1 目的

dual skill-root repository に対して、Phase 12 完了時に「user 指定root を正本とする」「mirror root を同期する」「両 root の drift を検証する」を 1 セットで実行する標準ガードを定義する。

### 2.2 最終ゴール

1. dual root repository で canonical root と mirror root の役割分担が明文化される。
2. `task-specification-creator` / `skill-creator` / `aiworkflow-requirements` のテンプレート・ガイドが同一ルールで canonical root を扱う。
3. Phase 12 完了前に root 間 `diff` または等価チェックを必須化し、mirror drift を未管理のまま残さない。
4. 新規タスク実行時に、同種課題を 5 分で閉じられる運用カードが system spec に残る。

### 2.3 スコープ

#### 含むもの

- `.claude/skills/...` と `.agents/skills/...` の dual root 判定ルール
- canonical root の選定基準（user 指定root 優先）
- mirror sync 手順（`rsync --checksum` / `diff -qr` など）
- Phase 12 成果物・system spec・skill template への反映ルール

#### 含まないもの

- `aiworkflow-requirements` の warning 137 件を直接ゼロにする作業
- すべての repository を単一 root へ物理統合するリファクタリング
- GitHub Issue 作成や PR 運用の自動化

### 2.4 成果物

- 本未タスク指示書
- dual root 判定 + mirror sync の Phase 12 ガード仕様
- 更新済み system spec（`task-workflow.md` / `lessons-learned.md` / UI関連仕様）
- 必要に応じた template / validator 改善差分

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `.claude/skills` と `.agents/skills` の両方が repository 内に存在すること
- `task-specification-creator` と `skill-creator` の検証スクリプトを実行可能であること
- Phase 12 完了済みまたは再監査中の workflow を 1 つ以上用意できること

### 3.2 依存タスク

- UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001
- UT-IMP-PHASE12-WORKFLOW-PATH-CANONICALIZATION-001

### 3.3 必要な知識

- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

### 3.4 推奨アプローチ

1. dual root を持つ repository を preflight で検知し、user 指定root を canonical root として固定する。
2. validator・テンプレート・成果物のコマンド例を canonical root に統一する。
3. Phase 12 完了前に mirror sync を実行し、`diff -qr` で drift なしを確認する。
4. その結果を `task-workflow.md` / `lessons-learned.md` / 対象 domain spec に同一ターンで記録する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                     | 発見経緯                                                        | 解決策                                                                             | 教訓                                                                              |
| ------------------------------------------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| user 指定の正本は `.claude` なのに、旧成果物が `.agents` を参照していた  | TASK-UI-07 Phase 12 再監査で path drift を再確認                | user 指定root を canonical root に固定し、旧参照は mirror として同期対象へ分離した | dual root repo では「どちらを更新するか」ではなく「どちらが正本か」を先に固定する |
| canonical root だけ更新しても mirror 側が stale のまま残る               | `quick_validate` は通るのに `diff -qr` で差分が残った           | `rsync --checksum` 後に `diff -qr` を実行し、0差分を完了条件へ昇格した             | validator PASS だけで root 間整合は保証されない                                   |
| template / guide のコマンド例が `.agents` のまま残り、再利用時に混乱した | `skill-creator` / `task-specification-creator` の資産再読で発見 | command path を canonical root 基準へ置換し、mirror は sync 運用として別扱いにした | command path はドキュメント drift の起点なので、テンプレートを先に正す            |
| TASK-UI-07 の Phase 12 では root 間整合が outputs に明示されていなかった | unassigned-task-detection / spec-update-summary 再確認で露出    | 新規未タスクとして formalize し、current task の検出レポートにも追記する           | 苦戦箇所は教訓化だけで終えず、未タスクへ formalize して再利用導線まで閉じる       |

---

## 4. 実行手順

### Phase構成

- Phase A: dual root 検出と canonical root 固定
- Phase B: template / guide / workflow の command path 是正
- Phase C: mirror sync / drift 検証 / 台帳反映

### Phase A: dual root 検出と canonical root 固定

#### 目的

repository に複数の skill root があるかを判定し、正本を確定する。

#### 手順

1. `.claude/skills` と `.agents/skills` の存在を確認する。
2. user 指定root がある場合はそれを canonical root として宣言する。
3. workflow・成果物・テンプレートの既存参照 root を棚卸しする。

#### 成果物

- root 判定メモ
- canonical / mirror の役割定義

#### 完了条件

- canonical root が 1 つに確定している。

### Phase B: template / guide / workflow の command path 是正

#### 目的

validator / template / guide の command path を canonical root 基準へ揃える。

#### 手順

1. `task-specification-creator` / `skill-creator` / `aiworkflow-requirements` の command path を grep で抽出する。
2. canonical root と矛盾する記述を置換する。
3. dual root repository 向けの mirror sync 手順をテンプレートへ追加する。

#### 成果物

- 更新済み template / guide / system spec

#### 完了条件

- 新規に参照される command path が canonical root に統一されている。

### Phase C: mirror sync / drift 検証 / 台帳反映

#### 目的

mirror root を同期し、台帳と教訓へ再利用可能な形で固定する。

#### 手順

1. canonical root から mirror root へ `rsync --checksum` または等価手段で同期する。
2. `diff -qr` で root 間 drift がないことを確認する。
3. `task-workflow.md` / `lessons-learned.md` / 関連 domain spec に本未タスクを登録する。
4. `audit-unassigned-tasks --target-file` と `verify-unassigned-links` で未タスク指示書と参照整合を検証する。

#### 成果物

- mirror sync ログ
- 更新済み台帳・教訓

#### 完了条件

- root 間 `diff` が 0 件で、未タスク監査が PASS する。

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] dual skill-root repository の canonical / mirror 定義が明文化されている
- [ ] user 指定root を優先するルールが定義されている
- [ ] mirror sync 手順と drift 検証手順が標準化されている

### 品質要件

- [ ] command path が canonical root 基準で統一されている
- [ ] `diff -qr` または等価手段で root 間 drift 0 を確認できる
- [ ] `quick_validate` / `verify-all-specs` / `verify-unassigned-links` の再実行手順が明文化されている

### ドキュメント要件

- [ ] 本未タスク指示書が `docs/30-workflows/unassigned-task/` に配置されている
- [ ] `task-workflow.md` 残課題テーブルに登録されている
- [ ] `lessons-learned.md` と関連 domain spec に苦戦箇所と再利用手順が追記されている

---

## 6. 検証方法

### テストケース

- Case 1: dual root repository を検知し、canonical root を 1 つに固定できる
- Case 2: template / guide の command path が canonical root に揃う
- Case 3: mirror sync 後の `diff -qr` が 0 件になる
- Case 4: 未タスク指示書の監査が PASS する

### 検証手順

```bash
test -d .claude/skills && test -d .agents/skills
rg -n "\.agents/skills|\.(claude|agents)/skills" .claude/skills/task-specification-creator .claude/skills/skill-creator .claude/skills/aiworkflow-requirements
rsync -a --checksum .claude/skills/aiworkflow-requirements/ .agents/skills/aiworkflow-requirements/
rsync -a --checksum .claude/skills/task-specification-creator/ .agents/skills/task-specification-creator/
rsync -a --checksum .claude/skills/skill-creator/ .agents/skills/skill-creator/
diff -qr .claude/skills/aiworkflow-requirements .agents/skills/aiworkflow-requirements
diff -qr .claude/skills/task-specification-creator .agents/skills/task-specification-creator
diff -qr .claude/skills/skill-creator .agents/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --target-file docs/30-workflows/completed-tasks/unassigned-task/task-imp-phase12-dual-skill-root-mirror-sync-guard-001.md
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD
```

---

## 7. リスクと対策

| リスク                                                 | 影響度 | 発生確率 | 対策                                                                                                    |
| ------------------------------------------------------ | ------ | -------- | ------------------------------------------------------------------------------------------------------- |
| canonical root の判断が人依存になる                    | 高     | 中       | user 指定root 優先を明文化し、明示要求がない場合は preflight で判定ルールを記録する                     |
| mirror sync を毎回手動で忘れる                         | 中     | 中       | `phase12-checklist-definition.md` と template に完了条件として固定する                                  |
| command path だけ直して mirror 実体が stale のまま残る | 高     | 中       | `diff -qr` 0件確認を完了条件へ昇格する                                                                  |
| 既存の warning 137 件と本タスクの責務が混ざる          | 中     | 中       | `UT-IMP-AIWORKFLOW-SKILL-ENTRYPOINT-COVERAGE-GUARD-001` を入口整流、本タスクを dual root 同期に分離する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`
- `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`
- `.claude/skills/task-specification-creator/references/phase12-checklist-definition.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`

### 参考資料

- `docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/outputs/phase-12/spec-update-summary.md`
- `docs/30-workflows/completed-tasks/task-058d-ui-07-dashboard-enhancement/outputs/phase-12/unassigned-task-detection.md`
- `docs/30-workflows/unassigned-task/task-imp-aiworkflow-skill-entrypoint-coverage-guard-001.md`

---

## 9. 備考

- 本タスクは `quick_validate` warning 群そのものを解消するタスクではなく、dual root repository での Phase 12 完了条件を安定化するための運用ガードである。
- GitHub Issue は未作成のため、`issue_number` は `null` で記録している。
