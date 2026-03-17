# TASK-SKILL-LIFECYCLE-08 命名規約是正 - タスク指示書

## メタ情報

| 項目         | 内容                                   |
| ------------ | -------------------------------------- |
| タスクID     | UT-SKILL-LIFECYCLE-08-NAMING-FIX       |
| タスク名     | TASK-SKILL-LIFECYCLE-08 命名規約対応   |
| 分類         | リファクタリング                       |
| 対象機能     | スキル公開・共有・互換性統合           |
| 優先度       | 低                                     |
| 見積もり規模 | 小規模                                 |
| ステータス   | 未実施                                 |
| 発見元       | Phase 10/12（TASK-SKILL-LIFECYCLE-08） |
| 発見日       | 2026-03-17                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 9/10 で boolean 命名規約（is/has/should/can）に違反する候補が検出された。

### 1.2 問題点・課題

命名が曖昧だと判定ロジックの意図が読み取りづらく、レビューで誤解が発生する。

### 1.3 放置した場合の影響

後続実装で命名スタイルが分岐し、仕様と実装の対応表が崩れる。

---

## 2. 何を達成するか（What）

### 2.1 目的

TASK-08 関連ドメインで boolean 命名を規約準拠へ統一する。

### 2.2 最終ゴール

検出済み命名違反が 0 件になり、lint と設計書が一致している。

### 2.3 スコープ

#### 含むもの

- `autoResolveDependencies` 系の規約是正
- `includeMetadata` 系の規約是正
- `passed` 系フラグの規約是正

#### 含まないもの

- 機能仕様の変更
- 新規機能追加

### 2.4 成果物

- 命名修正済み型・実装
- 仕様書の同名更新
- 変更履歴追記

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 対象コード/仕様の一覧化が完了

### 3.2 依存タスク

- UT-SKILL-LIFECYCLE-08-TYPE-IMPL（同時対応推奨）

### 3.3 必要な知識

- boolean naming convention
- リネーム時の互換性管理

### 3.4 推奨アプローチ

まず型定義を正本として改名し、参照箇所を一括置換後に test/lint で回帰確認する。

### 3.5 親タスクの苦戦箇所（継承）

> 出典: TASK-SKILL-LIFECYCLE-08 lessons-learned / UT-06-001 / 06-known-pitfalls.md

#### P29/P25: SKILL.md / LOGS.md 変更履歴の更新漏れ

| 項目   | 内容                                                                                                                                                |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| リスク | LOGS.md 2ファイルを更新しても SKILL.md x2 の変更履歴テーブル更新を忘れる。Phase 12 Step 1-A は「LOGS.md x2 + SKILL.md x2」の4ファイル更新が最小単位 |
| 回避策 | Phase 12 完了条件チェックリストに「SKILL.md x2 変更履歴更新」を明示的に含める                                                                       |

#### 55ファイル間の参照チェイン整合（TASK-08 教訓）

| 項目   | 内容                                                                                                          |
| ------ | ------------------------------------------------------------------------------------------------------------- |
| リスク | 命名変更は Phase 2/4/5/9 の成果物全体に波及する。`passed` → `hasPassed` 等の変更は仕様書 8〜15 件の修正が必要 |
| 回避策 | 改名時は `grep -rn "旧名" outputs/` で全成果物の参照を検索し、同ターンで更新する                              |

#### テンプレートリテラル型で値域を制限（UT-06-001 教訓）

| 項目   | 内容                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| リスク | boolean フィールド名を `string` 型で管理するとタイポが型チェックをすり抜ける                                                   |
| 回避策 | 命名規約をテンプレートリテラル型（`` `is${string}` \| `has${string}` \| `should${string}` ``）で強制し、コンパイル時に検出する |

#### 5分解決カード

1. `grep -rn "autoResolveDependencies\|includeMetadata\|\\bpassed\\b" outputs/ packages/shared/ apps/desktop/` で全参照箇所を確定する。
2. 型定義ファイルを正本として改名し、`rg` で旧名残存を確認する。
3. Phase 12 Step 1-A は4ファイル（LOGS.md x2 + SKILL.md x2）を最小単位で更新する。
4. `pnpm lint && pnpm typecheck` で回帰を確認する。

---

## 4. 実行手順

### Phase構成

Phase A（対象抽出）→ Phase B（改名）→ Phase C（仕様同期）

### Phase A: 対象抽出

#### 目的

修正対象を漏れなく確定する。

#### 手順

1. naming-audit の検出結果を再確認
2. 対象フィールドを一覧化
3. 互換影響を評価

#### 成果物

命名修正リスト

#### 完了条件

対象一覧に曖昧さがない

### Phase B: 改名

#### 目的

規約準拠へ改名する。

#### 手順

1. 型定義を改名
2. 実装・テスト参照を追随
3. lint/typecheck を実行

#### 成果物

改名済みコード

#### 完了条件

lint/typecheck が PASS

### Phase C: 仕様同期

#### 目的

仕様書名寄せを完了する。

#### 手順

1. task workflow / interfaces / phase docs を更新
2. 変更履歴を追記
3. mirror 同期を確認

#### 成果物

更新済み仕様書

#### 完了条件

仕様とコードの命名差分が 0 件

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 検出済み命名違反を全修正

### 品質要件

- [ ] `pnpm lint` PASS
- [ ] `pnpm typecheck` PASS

### ドキュメント要件

- [ ] 仕様書の命名表を更新
- [ ] 変更履歴に記録

---

## 6. 検証方法

### テストケース

- boolean フィールドが is/has/should/can を持つ
- 旧名参照が残っていない

### 検証手順

1. `rg -n "autoResolveDependencies|includeMetadata|\bpassed\b" <target>`
2. `pnpm lint`
3. `pnpm typecheck`

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                                 |
| -------------------- | ------ | -------- | ------------------------------------ |
| 参照漏れでビルド失敗 | 中     | 中       | 一括置換後に `rg` で旧名残存チェック |
| 仕様書更新漏れ       | 中     | 中       | Step 1-B/1-C 同時更新を必須化        |
| 外部依存破壊         | 低     | 低       | rename map を一時記録する            |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-06-seq-task-08-skill-publishing-version-compatibility/outputs/phase-9/naming-audit.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-backlog.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md`（P29/P25 更新漏れパターン）
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`（命名変更対象の型定義正本）

### 参考資料

- `eslint` naming convention rule

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 9 D2-NAM: boolean フィールド命名規約違反 3 件。
```

### 補足事項

リネームは TYPE-IMPL と同一ブランチで実施すると手戻りが少ない。
