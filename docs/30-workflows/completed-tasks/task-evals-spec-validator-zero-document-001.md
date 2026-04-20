# EVALS validator=0 件の事実と暫定運用を正本へ記載 - タスク指示書

## メタ情報

```yaml
issue_number: TBD
task_id: UNASSIGNED-EVALS-SPEC-VALIDATOR-ZERO-DOCUMENT-001
task_name: EVALS validator=0 件の事実と暫定運用を正本へ記載
category: 要件（docs-only）
target_feature: skill-fixture-runner / SkillScanner - EVALS.json 検証
priority: 中
scale: 小規模
status: completed
completed_date: 2026-04-19
completed_in: TASK-EVALS-CONSUMER-AUDIT-001-SKILL-REFLECT-WAVE
source_phase: TASK-EVALS-CONSUMER-AUDIT-001 Phase 9/12
created_date: 2026-04-19
dependencies: [task-skill-fixture-runner-evals-schema-validate-001]
spec_path: docs/30-workflows/completed-tasks/task-evals-spec-validator-zero-document-001.md
```

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | UNASSIGNED-EVALS-SPEC-VALIDATOR-ZERO-DOCUMENT-001     |
| タスク名     | EVALS validator=0 件の事実と暫定運用を正本へ記載      |
| 分類         | 要件（docs-only）                                     |
| 対象機能     | skill-fixture-runner / SkillScanner - EVALS.json 検証 |
| 優先度       | 中                                                    |
| 見積もり規模 | 小規模                                                |
| ステータス   | 完了（2026-04-19）                                    |
| 発見元       | TASK-EVALS-CONSUMER-AUDIT-001 Phase 9/12              |
| 発見日       | 2026-04-19                                            |
| 関連タスク   | task-skill-fixture-runner-evals-schema-validate-001   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-EVALS-CONSUMER-AUDIT-001 Phase 9/12 の監査で、EVALS.json に対する自動バリデータが**一つも存在しない**ことが確認された。
`docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/implementation-guide.md` §3.1 の通り、`validate-schemas.js` は `schemas/*.json` のみを対象とし、EVALS.json は型チェック・構造チェックのいずれも受けていない。
一方で SkillScanner.ts は EVALS.json の「存在・size・type（形式）」のみを確認し、中身の整合性には関与しない。
この状況は正本（要件・スキル仕様）に明記されていないため、読み手は「自動検証済み」と誤認するリスクがある。

### 1.2 問題点・課題

- EVALS.json のキー欠落・型不一致・enum 逸脱があっても CI / Hooks で検出できない（silent break）
- `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md` §7 の「3 カテゴリ手動検証」が暫定運用として必要だが、正本に導線がない
- validator 実装タスク（task-skill-fixture-runner-evals-schema-validate-001）への参照が正本側にないため、運用者が補完計画の存在に到達できない
- TypeScript 型定義も未整備で、Consumer 側で型ガードが効かない

### 1.3 放置した場合の影響

- EVALS.json の構造変更が気づかれずにマージされ、下流 Consumer（SkillScanner / SkillLifecyclePanel 等）が silent に壊れる
- 監査で露見した事実が正本に戻らず、同じ発見が再発する（知見の漏洩）
- validator 実装タスクが孤立し、優先度判断・着手判断の根拠が不明瞭になる

---

## 2. 何を達成するか（What）

### 2.1 目的

EVALS.json に対する validator が 0 件である事実・リスク・暫定運用・補完タスク導線を、正本ドキュメントへ一次情報として追記する。

### 2.2 最終ゴール

- 正本に「EVALS.json は自動検証されていない」ことが明記されている
- 3 カテゴリ手動検証コマンドが暫定運用として正本に記載されている
- validator 実装タスク（task-skill-fixture-runner-evals-schema-validate-001）への導線が張られている
- 読み手が「silent break リスクと回避手順」にアクセスできる

### 2.3 スコープ

#### 含むもの

- 正本（要件ドキュメント / skill-fixture-runner SKILL.md / skill-scanner 関連ドキュメント等）への事実追記
- 暫定運用（3 カテゴリ手動検証）の手順明記
- 補完タスクへの相互リンク
- 根拠資料（phase-8 / phase-9 / phase-12）への参照

#### 含まないもの

- validator の実装（別タスク：task-skill-fixture-runner-evals-schema-validate-001）
- TypeScript 型定義の追加（実装タスク側で扱う）
- SkillScanner.ts の中身検証強化（実装タスク側）
- EVALS.json スキーマそのものの変更

### 2.4 成果物

| 成果物                   | パス                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------ |
| 更新済み正本（要件側）   | `references/` 配下で EVALS.json を扱う章（aiworkflow-requirements 経由で特定）             |
| 更新済みスキル SKILL.md  | `.claude/skills/skill-fixture-runner/SKILL.md`                                             |
| 補完タスク参照           | `docs/30-workflows/unassigned-task/task-skill-fixture-runner-evals-schema-validate-001.md` |
| 参照元（根拠）           | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/implementation-guide.md` §3.1 |
| 参照元（暫定運用）       | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-8/schema-change-guide.md` §7     |
| 参照元（整合性レポート） | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-9/spec-alignment-report.md`      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-EVALS-CONSUMER-AUDIT-001 Phase 9/12 の成果物が参照可能
- `.claude/skills/skill-fixture-runner/scripts/validate-schemas.js` の現状把握（schemas/\*.json のみ対象）
- SkillScanner.ts の検証範囲把握（存在・size・type のみ）
- 補完タスク task-skill-fixture-runner-evals-schema-validate-001 が既に unassigned として起票されている

### 3.2 依存タスク

| タスクID                                            | 関係     | ステータス |
| --------------------------------------------------- | -------- | ---------- |
| TASK-EVALS-CONSUMER-AUDIT-001                       | 発見元   | 進行中     |
| task-skill-fixture-runner-evals-schema-validate-001 | 相互参照 | 未実施     |

### 3.3 必要な知識

- EVALS.json の現行構造（phase-9 レポート参照）
- skill-fixture-runner スキルの検証境界
- aiworkflow-requirements スキルによる正本の特定手順
- Markdown による相互リンク記述

### 3.4 推奨アプローチ

1. **正本箇所の特定**: aiworkflow-requirements skill で EVALS.json に関する既存記述を `resource-map` / `keywords` から検索
2. **事実の追記**: validator=0 件である旨を、短く・事実ベースで明記（implementation-guide.md §3.1 を根拠として引用）
3. **暫定運用の転記**: schema-change-guide.md §7 の 3 カテゴリ手動検証コマンドを正本にコピーし、実行タイミング（EVALS.json 更新時）を併記
4. **補完タスク導線**: task-skill-fixture-runner-evals-schema-validate-001 への相対パスを正本側から張る
5. **クロスチェック**: spec-alignment-report.md の該当項目と齟齬がないことを確認

---

## 4. 苦戦箇所記録

### 4.1 記録1: validator が schemas/\*.json 限定で EVALS.json 未対象

`.claude/skills/skill-fixture-runner/scripts/validate-schemas.js` は現状、`schemas/` 配下の JSON しか走査していない。
EVALS.json はスキーマではなく「評価指標データ」として扱われているため検証パイプライン外にある。

**対処方針**: 事実を正本に明記し、補完タスク（実装タスク）への導線を張る。実装は別タスクで扱う。

### 4.2 記録2: SkillScanner.ts が中身を検証しない

SkillScanner.ts は `existsSync` / `statSync` / ファイル形式チェックのみで、EVALS.json のキーや値の整合性は見ていない。
そのため、キー名変更や enum 逸脱が起きても Scanner 層では検出できない。

**対処方針**: 「Scanner の検証範囲」を正本に明文化し、読み手が誤認しないようにする。中身検証の強化は実装タスクのスコープ。

### 4.3 記録3: TypeScript 型定義がなく型ガードが効かない

EVALS.json を読み込む Consumer 側に TypeScript 型定義が存在しない。
結果として、構造変更が TypeScript コンパイル段階でも検出されず、ランタイム到達後に初めて壊れる。

**対処方針**: 型定義の不在をリスクとして正本に記載し、補完タスクでの対応対象であることを明示する。

### 4.4 記録4: 暫定運用（3 カテゴリ手動検証）が正本に書かれていない

schema-change-guide.md §7 の手動検証手順は Phase 8 成果物に閉じており、正本からの導線がない。
運用者が「validator がない期間、どう壊れを防ぐか」を知る経路が断たれている。

**対処方針**: 手動検証コマンドを正本に転記し、EVALS.json 更新時の運用手順として明記する。

### 4.5 記録5: 補完タスクへの導線欠如

task-skill-fixture-runner-evals-schema-validate-001 は unassigned ディレクトリに存在するが、正本からの参照がないため発見困難。

**対処方針**: 正本の該当章末尾に「補完タスク」節を設け、相対パスでリンクする。

---

## 5. 完了条件

- [ ] 正本に「EVALS.json には validator が存在しない（validator=0 件）」事実が記載されている
- [ ] 事実の根拠として implementation-guide.md §3.1 / phase-9 spec-alignment-report.md が引用されている
- [ ] silent break リスク（キー欠落・型不一致・enum 逸脱）が正本に明記されている
- [ ] 暫定運用として schema-change-guide.md §7 の 3 カテゴリ手動検証コマンドが正本に転記されている
- [ ] 暫定運用の実行タイミング（EVALS.json 更新時）が明記されている
- [ ] validator 実装タスク（task-skill-fixture-runner-evals-schema-validate-001）への導線が正本側から張られている
- [ ] SkillScanner.ts の検証範囲（存在・size・type のみ）が正本に明文化されている
- [ ] TypeScript 型定義が存在しないことと、それによる型ガード不在のリスクが記述されている
- [ ] 追記箇所に対し既存記述との矛盾がなく、phase-9 spec-alignment-report.md と整合している
- [ ] docs-only の変更のため、typecheck / test は既存水準を維持（新規実装なし）

---

## 完了記録

- **完了ステータス**: completed
- **完了日**: 2026-04-19
- **完了方法**: aiworkflow-requirements skill への反映（UPDATE-SPEC-003）
- **実装場所**:
  - `.claude/skills/aiworkflow-requirements/references/claude-code-overview.md` §272 直下（validator=0 事実と暫定運用）
  - `.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md` §7（validator 暫定運用の詳細）
  - `.agents/` 側の dual-root mirror
- **完了の根拠**: TASK-EVALS-CONSUMER-AUDIT-001 Phase-12 close-out に続く skill 反映 wave（TASK-EVALS-CONSUMER-AUDIT-001-SKILL-REFLECT-WAVE）で UPDATE-SPEC-003 として実装完了
- **関連**: `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/system-spec-update-summary.md` UPDATE-SPEC-003
- **後続タスクへの影響**: 実装系後続タスク `task-skill-fixture-runner-evals-schema-validate-001`（validator 実装）は別タスクとして保持
