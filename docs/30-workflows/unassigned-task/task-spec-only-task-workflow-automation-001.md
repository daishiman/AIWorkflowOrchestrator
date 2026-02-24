# 仕様書修正のみタスクのワークフロー自動化 - タスク指示書

## メタ情報

```yaml
issue_number: 890
```

## メタ情報

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | UT-SPEC-ONLY-TASK-WORKFLOW-001                              |
| タスク名     | 仕様書修正のみタスクのPhaseテンプレート・grep検証TDD標準化  |
| 分類         | 改善                                                        |
| 対象機能     | task-specification-creator スキル                           |
| 優先度       | 低                                                          |
| 見積もり規模 | 小規模                                                      |
| ステータス   | 未実施                                                      |
| 発見元       | UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 実装知見（2026-02-24） |
| 発見日       | 2026-02-24                                                  |
| ブロック対象 | なし                                                        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 は「仕様書修正のみ」という特殊なタスク種別であった。この種のタスクでは以下の特殊な処理が必要だったが、現在のPhaseテンプレートは「コード実装タスク」を前提としており、spec-onlyタスクに対する標準的なガイダンスが存在しない:

1. **Phase 6-8（テスト拡充・カバレッジ・リファクタリング）が N/A**: コード変更がないため該当しない
2. **Phase 4 のテスト設計が grep ベース**: コードテストではなく、仕様書内のキーワード検索がテストケースとなる
3. **Phase 5 の実装が Markdown 編集**: TypeScript ではなく仕様書ファイルの修正が「実装」となる

### 1.2 問題点

- 現在の Phase テンプレート（`phase-templates.md`）には、spec-only タスク向けのガイダンスがない
- Phase 6-8 を「N/A」とする判断が実行者の主観に依存している
- grep ベースの仕様書 TDD（Red-Green-Refactor）は有効な手法だが、再利用可能なテンプレートとして標準化されていない
- Phase 4 でのテスト設計時に、修正箇所数の見積もりが概算に依存しやすい（P37パターン）

### 1.3 放置した場合の影響

- 仕様書修正のみタスクが実行されるたびに、Phase N/A の判断を個別に行う必要がある
- grep 検証テストの設計パターンが実行者ごとに異なり、品質のばらつきが生じる
- Phase 4 の修正箇所数見積もり誤差が繰り返し発生する（P37パターンの再発）
- spec-only タスクの先例（UT-SKILL-IMPORT-CHANNEL-CONFLICT-001）の知見が後続タスクに活かされない

---

## 2. 何を達成するか（What）

### 2.1 目的

仕様書修正のみタスク向けの Phase テンプレートと grep ベース仕様書 TDD テンプレートを標準化し、task-specification-creator スキルに組み込む。

### 2.2 最終ゴール

- [ ] `phase-templates.md` に spec-only タスク向けのテンプレートバリアントが追加されている
- [ ] Phase 6-8 の N/A 判定条件が明確に文書化されている
- [ ] grep ベース仕様書 TDD の標準テンプレートが作成されている
- [ ] Phase 4 の修正箇所数見積もり手法（`grep -c` ベース）が標準化されている
- [ ] `detect-mode.js` が spec-only タスクを自動判別できる（オプション）

### 2.3 スコープ

#### 含むもの

- `phase-templates.md` への spec-only タスクバリアント追加（Phase 4, 5, 6-8 のテンプレート）
- grep ベース仕様書 TDD テンプレートの作成（Phase 4 テスト設計用）
- Phase 6-8 N/A 判定条件の文書化
- `spec-update-workflow.md` への spec-only タスク手順追加
- Phase 4 修正箇所数見積もり手法の標準化

#### 含まないもの

- `detect-mode.js` の自動判別機能実装（将来拡張として記録のみ）
- 既存の完了済みタスクのフォーマット変更
- コード実装タスク向けのテンプレート変更

### 2.4 成果物

| 成果物                       | パス                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| spec-only Phase テンプレート | `references/phase-templates.md`（追記）                      |
| grep TDD テンプレート        | `references/grep-spec-tdd-template.md`（新規）               |
| N/A 判定ガイドライン         | `references/phase-templates.md`（追記）                      |
| 修正箇所数見積もりガイド     | `references/grep-spec-tdd-template.md`（新規、同ファイル内） |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 が完了していること（先例として参照）
- task-specification-creator スキルの `references/` ディレクトリにアクセスできること

### 3.2 依存タスク

| タスクID                             | 状態         | 依存内容               |
| ------------------------------------ | ------------ | ---------------------- |
| UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 | spec_created | spec-only タスクの先例 |

### 3.3 必要な知識

- task-specification-creator スキルの Phase テンプレート構造
- grep / regex の基本的な使い方
- TDD（Red-Green-Refactor）の概念
- P37パターン（ドキュメント数値の早期固定）

### 3.4 推奨アプローチ

1. UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 の Phase 4/5 成果物を分析し、パターンを抽出
2. `phase-templates.md` の既存構造を確認し、spec-only バリアントの追加箇所を特定
3. grep ベース TDD テンプレートを設計（テストケース設計 → 実行 → 修正のサイクル）
4. Phase 6-8 の N/A 判定条件を定義（「コード変更なし」以外の条件も考慮）
5. 修正箇所数の事前カウント手法（`grep -c`）を標準化

### 3.5 実装課題と解決策（UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 からの教訓）

| 課題                                        | 発見経緯                                                                                    | 解決策                                                                               | 教訓                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| Phase 4 修正箇所数の見積もり誤差（P37再発） | Phase 4 で「task-022 に3箇所」と見積もったが、実際は「1箇所」だった                         | `grep -c "対象キーワード" 対象ファイル` で実測値を取得してからテスト期待値を設定する | 概算ではなく `grep -c` の実測値ベースで検証テストを設計する                           |
| Phase 6-8 の N/A 判断が手動                 | spec-only タスクで Phase 6-8 を「N/A: 仕様書修正のみ」として手動で記録した                  | N/A 判定条件を文書化し、`not-applicable.md` テンプレートを用意する                   | spec-only タスクの N/A 処理パターンをテンプレートとして再利用可能にする               |
| grep 検証の Red-Green-Refactor サイクル     | Phase 4 で設計した grep コマンドが Phase 5 実装前は「Red」、実装後に「Green」となるパターン | grep コマンドをテストケースとして設計する標準テンプレートを作成する                  | 仕様書修正でも TDD 原則を適用できる。grep の期待値が「存在確認」と「不在確認」の2種類 |

**参照**:

- [skill-creator/references/patterns.md — 仕様書修正のみタスクの Phase テンプレート（N/A記録）](../../../.claude/skills/skill-creator/references/patterns.md)
- [skill-creator/references/patterns.md — grepベース仕様書整合性検証（仕様書TDD）](../../../.claude/skills/skill-creator/references/patterns.md)
- [lessons-learned.md — grep ベース仕様書 TDD の有効性](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md)

---

## 4. 実行手順

### Phase構成

| Phase | 名称                           | 概要                                       |
| ----- | ------------------------------ | ------------------------------------------ |
| 1-3   | 要件定義・設計・レビュー       | 先例分析、テンプレート設計、レビュー       |
| 4-5   | テスト作成・実装               | テンプレート検証基準策定、テンプレート作成 |
| 6-8   | N/A                            | 本タスクはスキル改善のみでコード変更なし   |
| 9-10  | 品質検証・最終レビュー         | テンプレート品質確認                       |
| 11-13 | 手動テスト・ドキュメント・完了 | テンプレート試用、ドキュメント更新、PR     |

### Phase 1: 要件定義

1. UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 の Phase 4/5 成果物を分析
2. spec-only タスクの Phase テンプレート要件を定義
3. grep TDD テンプレートの要件を定義

### Phase 5: 実装

1. `phase-templates.md` に spec-only タスクバリアントを追加
2. `grep-spec-tdd-template.md` を新規作成
3. N/A 判定条件セクションを追加
4. 修正箇所数見積もりガイドを作成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `phase-templates.md` に spec-only タスクの Phase 4/5 テンプレートが追加されている
- [ ] Phase 6-8 の N/A 判定条件が文書化されている
- [ ] grep ベース仕様書 TDD テンプレートが作成されている
- [ ] 修正箇所数の `grep -c` ベース見積もり手法が標準化されている
- [ ] `not-applicable.md` テンプレートが用意されている

### 品質要件

- [ ] テンプレートが「100人中100人が同じ理解で使用できる」粒度
- [ ] 先例（UT-SKILL-IMPORT-CHANNEL-CONFLICT-001）との整合性が確認されている
- [ ] 既存のコード実装タスク向けテンプレートとの衝突がない

### ドキュメント要件

- [ ] Phase 12 実装ガイド作成（Part 1/Part 2）
- [ ] LOGS.md 2ファイル更新（P1対策）
- [ ] topic-map.md 再生成（P2対策）
- [ ] SKILL.md 変更履歴更新（P29対策）

---

## 6. 検証方法

### テストケース

1. spec-only タスクテンプレートを使って新規タスクの Phase 4 を設計し、grep コマンドが正しく生成されることを確認
2. N/A 判定条件に基づいて、Phase 6-8 を N/A と判定できることを確認
3. `not-applicable.md` テンプレートが正しいフォーマットであることを確認
4. `grep -c` ベースの見積もり手法で、実際の修正箇所数と一致することを確認

### 検証手順

```bash
# テンプレート内のリンク参照が有効であることを確認
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js --workflow docs/30-workflows/{{テスト用ワークフロー}}

# grep TDD テンプレートの構文が正しいことを確認
grep -c "TODO" references/grep-spec-tdd-template.md  # 0件であること
```

---

## 7. リスクと対策

| リスク                                                          | 影響度 | 発生確率 | 対策                                                                                |
| --------------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------------------------- |
| spec-only タスクの種類が多様で単一テンプレートでカバーできない  | 中     | 中       | 基本テンプレート + バリアント（仕様書追記/仕様書リネーム/仕様書構造変更）で対応     |
| N/A 判定条件が厳格すぎてコード変更を伴うタスクも N/A 扱いされる | 高     | 低       | 「コード変更なし AND テスト追加なし」の両条件を満たす場合のみ N/A とする            |
| grep TDD テンプレートが複雑すぎて採用されない                   | 中     | 中       | 最小限のテンプレート（5項目以内）から開始し、必要に応じて拡張                       |
| 既存の phase-templates.md との構造的衝突                        | 低     | 低       | 独立セクション（`## spec-only タスクバリアント`）として追加し、既存構造を変更しない |

---

## 8. 参照情報

### 関連ドキュメント

- [phase-templates.md](../../.claude/skills/task-specification-creator/references/phase-templates.md) — 既存の Phase テンプレート
- [spec-update-workflow.md](../../.claude/skills/task-specification-creator/references/spec-update-workflow.md) — 仕様書更新ワークフロー
- [skill-creator/references/patterns.md](../../../.claude/skills/skill-creator/references/patterns.md) — 仕様書修正タスク Phase テンプレートパターン
- [lessons-learned.md](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md) — grep TDD・見積もり精度の教訓

### 関連完了タスク

- UT-SKILL-IMPORT-CHANNEL-CONFLICT-001（spec-only タスクの先例、`spec_created`）

### 既知の落とし穴（06-known-pitfalls.md）

| Pitfall ID | タイトル                         | 本タスクへの影響                        |
| ---------- | -------------------------------- | --------------------------------------- |
| P37        | ドキュメント数値の早期固定       | 修正箇所数は `grep -c` 実測値で設計する |
| P4         | documentation-changelog 早期完了 | 全 Step 確認前に「完了」と記載しない    |
| P2         | topic-map.md 再生成忘れ          | テンプレート追加後に必ず再生成を実行    |

---

## 9. 備考

### 設計判断の根拠

1. **テンプレートバリアントとした理由**: 新規ファイル（`spec-only-phase-templates.md`）ではなく、既存の `phase-templates.md` に追記する方針。理由は、Phase テンプレートが1ファイルに集約されていることで、実行者が参照先を迷わないため
2. **grep TDD テンプレートを独立ファイルとした理由**: `phase-templates.md` に含めると肥大化するため、詳細な grep パターン集は独立ファイルとし、`phase-templates.md` からリンクで参照する構成

### UT-SKILL-IMPORT-CHANNEL-CONFLICT-001 で確立した grep TDD パターン

```
Phase 4（Red）: grep コマンドを設計 → 期待結果を定義
  例: `grep -c "skill:importFromSource" task-022.md` → 期待値: 1件以上

Phase 5（Green）: 仕様書を修正 → grep コマンドを再実行
  例: `skill:import` を `skill:importFromSource` に修正 → grep が 1件以上にマッチ

Phase 9（Refactor）: 全 grep コマンドを再実行し、品質ゲートとして使用
  例: 10項目の grep 検証を一括実行 → 全 PASS
```

この Red-Green-Refactor サイクルは、コード変更がないタスクでも品質保証を実現する有効な手法であり、標準テンプレートとして再利用価値が高い。

### 補足

本タスクは task-specification-creator スキルの改善タスクであり、実装時は `.claude/skills/task-specification-creator/references/` 配下のファイルを修正する。pnpm lint / typecheck はスキップ可能（Markdown のみの変更）。
