# phase-templates.md テスト専用タスク Phase 12 判定ガイダンス追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1078
```

## メタ情報

| 項目         | 内容                                                                       |
| ------------ | -------------------------------------------------------------------------- |
| タスクID     | UT-08-FB03-PHASE-TEMPLATES-TEST-ONLY-GUIDANCE                              |
| タスク名     | phase-templates.md テスト専用タスク Phase 12 判定ガイダンス追加            |
| 分類         | 仕様書改善                                                                 |
| 対象機能     | task-specification-creator/references/phase-templates.md                   |
| 優先度       | 低                                                                         |
| 見積もり規模 | 小規模                                                                     |
| ステータス   | 未実施                                                                     |
| 発見元       | Phase 12 FB-03（08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001） |
| 発見日       | 2026-03-08                                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 の Phase 12 実行時に、各 Step（Step 1-A ~ Step 3）の該当/非該当判定に迷いが生じた。このタスクはテストコードのみの変更であり、プロダクションコードの変更を伴わない。そのため、Step 1-B（API/IPC 実装ステータス更新）、Step 2（システム仕様更新）、Step 3（IPC 契約検証）は「該当なし」となるが、これを判定するための明確なガイダンスが phase-templates.md に存在しない。

### 1.2 問題点・課題

1. **判定基準の不在**: テスト専用タスクで Phase 12 の各 Step が該当するかどうかの判定基準がない
2. **判定時間の浪費**: 判定基準がないため、毎回「この Step は該当するか？」を個別に考える必要がある
3. **documentation-changelog の曖昧記載**: 「該当なし」と判定した Step の記載方法が統一されていない

### 1.3 放置した場合の影響

- テスト追加タスクの Phase 12 実行時間が不必要に長くなる
- 「該当なし」を見落として不要な仕様書更新を実施してしまうリスク
- AIエージェントが Phase 12 を実行する際に、不要な Step で rate limit を消費する（P43 再発リスク）

---

## 2. 何を達成するか（What）

### 2.1 目的

phase-templates.md の Phase 12 テンプレートに「テストコードのみのタスクにおける Step 該当/非該当判定ガイダンス」を追加する。

### 2.2 最終ゴール

- phase-templates.md に判定ガイダンステーブルが追加されている
- テスト専用タスクで Phase 12 実行時に、各 Step の該当/非該当を即座に判定できる

### 2.3 スコープ

#### 含むもの

- phase-templates.md への判定ガイダンス追加
- 判定例の記載（テスト追加、テストリファクタリング、カバレッジ改善）

#### 含まないもの

- phase-templates.md の既存セクション変更
- 他のテンプレートファイルの変更

### 2.4 成果物

- 更新済み `.claude/skills/task-specification-creator/references/phase-templates.md`

---

## 3. どのように実行するか（How）

### 3.1 実装手順

#### Step 1: phase-templates.md の Phase 12 セクション確認

```bash
cat .claude/skills/task-specification-creator/references/phase-templates.md
```

#### Step 2: 判定ガイダンスの追加

Phase 12 テンプレートに以下を追加:

```markdown
### テストコードのみのタスクにおける Step 判定

テストコードの追加・修正のみで、プロダクションコードの変更を伴わないタスクでは、
以下の Step が「該当なし」となる場合がある:

| Step     | 判定基準                                 | 該当タスク例               |
| -------- | ---------------------------------------- | -------------------------- |
| Step 1-A | LOGS.md 更新は常に必須                   | -                          |
| Step 1-B | API/IPC 変更がなければ「該当なし」       | テスト追加、カバレッジ改善 |
| Step 1-C | テストパターン仕様への追記を検討         | 新パターン確立時           |
| Step 1-D | topic-map 再生成は仕様書変更時のみ       | テスト追加                 |
| Step 2   | アーキテクチャ変更がなければ「該当なし」 | テストリファクタリング     |
| Step 3   | IPC 変更がなければ「該当なし」           | テスト追加                 |

「該当なし」と判定した場合でも、documentation-changelog.md にその旨を明記すること。
記載例: `Step 1-B: 該当なし（API/IPC 変更を伴わないテスト追加タスク）`
```

### 3.2 実装時の苦戦箇所と解決策（08-TASK 知見）

#### 苦戦箇所1: Phase 12 の各 Step 該当判定に迷った

**問題**: 08-TASK はテストコードのみのタスクだが、Phase 12 の Step 1-A ~ Step 3 が全て必須のように記載されていた。特に Step 1-B（API/IPC 実装ステータス更新）と Step 3（IPC 契約検証）は該当しないが、「本当に不要か？」の判断に時間がかかった。

**解決策**: テスト専用タスクの判定フローチャートまたは判定テーブルを phase-templates.md に追加し、即座に判定できるようにする。

#### 苦戦箇所2: P43（SubAgent rate limit 中断）の再発リスク

**問題**: Phase 12 の各 Step を SubAgent に委譲する際、不要な Step まで実行すると rate limit を消費する。08-TASK の直前タスク（TASK-10A-F）で P43 が発生しており、7ファイル一括更新で49ツール使用後に中断した。

**解決策**: Phase 12 開始時に該当/非該当を判定し、該当する Step のみを SubAgent に委譲する。3ファイル以下/エージェントの分割ルール（P43 対策）も併用する。

---

## 4. 受け入れ基準

- [ ] phase-templates.md に Step 判定ガイダンスが追加されている
- [ ] テスト専用タスクの3パターン（テスト追加、テストリファクタリング、カバレッジ改善）に対する判定例が含まれている
- [ ] documentation-changelog への「該当なし」記載例が含まれている

---

## 5. 参照資料

| 資料                           | パス                                                                                                                   |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| phase-templates.md             | `.claude/skills/task-specification-creator/references/phase-templates.md`                                              |
| Phase 12 skill-feedback-report | `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/phase-12/skill-feedback-report.md` |
| P43 pitfall                    | `.claude/rules/06-known-pitfalls.md#P43`                                                                               |

---

## 6. 関連タスク

| タスクID                                                 | 関係            |
| -------------------------------------------------------- | --------------- |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 | 発見元（FB-03） |
