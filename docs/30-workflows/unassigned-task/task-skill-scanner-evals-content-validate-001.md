# SkillScanner EVALS.json 内容バリデーション追加 - タスク指示書

## メタ情報

```yaml
issue_number: null
task_id: UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001
task_name: SkillScanner EVALS.json 内容バリデーション追加
category: 改善
target_feature: apps/desktop SkillScanner - EVALS.json 検出
priority: 中
scale: 中規模
status: 未実施
source_phase: TASK-EVALS-CONSUMER-AUDIT-001 Phase 12
created_date: 2026-04-19
dependencies:
  - task-skill-fixture-runner-evals-schema-validate-001
spec_path: docs/30-workflows/unassigned-task/task-skill-scanner-evals-content-validate-001.md
```

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001            |
| タスク名     | SkillScanner EVALS.json 内容バリデーション追加                 |
| 分類         | 改善                                                           |
| 対象機能     | apps/desktop SkillScanner - EVALS.json 検出                    |
| 優先度       | 中                                                             |
| 見積もり規模 | 中規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | TASK-EVALS-CONSUMER-AUDIT-001 Phase 12                         |
| 発見日       | 2026-04-19                                                     |
| 関連タスク   | task-skill-fixture-runner-evals-schema-validate-001 (先行推奨) |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`apps/desktop/src/main/services/skill/SkillScanner.ts` は `EVALS.json` の
**存在とファイルサイズ** しか確認しておらず、JSON の中身を検査していない。
結果、`type=evals` タグを付けて返す前に、ファイル内容が仕様に沿っているかを
判定する機構が無い。

TASK-EVALS-CONSUMER-AUDIT-001 Phase 5 の Consumer 監査（`§8 未タスク候補 #4`）
および Phase 12 の既知制約整理（`implementation-guide.md §3.1 / §11`）で、
SkillScanner がバリデーション空白地帯として明記された。

### 1.2 問題点・課題

- 空 `{}` / 破損 JSON / 必須キー欠落の `EVALS.json` があっても
  SkillScanner は `valid` 扱いでリストに載せる
- Consumer 側（lifecycle / runner / reporter）でようやく失敗する
  ため、エラー発生箇所と原因の距離が遠い
- camelCase / snake_case の二重スキーマが存在するため、
  バリデータの方言許容方針が定義されないままでは実装できない
- 既存 3 テスト（`with-evals` / `with-all-others` / `with-sized-evals`）は
  「中身を期待しない」契約のまま残っており、テスト設計ごと方針更新が要る

### 1.3 放置した場合の影響

- CI や UI 表示で破損 `EVALS.json` による失敗が継続的に発生する
- evals 関連の障害解析コストが Consumer 側に恒常的に降り積もる
- fixture / snake_case との互換方針が未定義のまま時間が経ち、
  後続タスク（`task-evals-schema-dialect-unification-001` 等）との
  整合が難しくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillScanner が `EVALS.json` を検出した時点で、
**最低限の内容バリデーション** を行い破損ファイルを早期に切り分ける。

### 2.2 最終ゴール

- `SkillScanner.ts` が `EVALS.json` の内容を読み、
  パース可否と必須キー有無で `valid` / `invalid`（または警告）を分岐できる
- 二重スキーマ（camelCase / snake_case）を両方許容する方針が明文化されている
- 既存 3 テストが新しい契約に沿って更新され、
  壊れ EVALS ケースが追加されている

### 2.3 スコープ

#### 含むもの

- `SkillScanner.ts` への内容バリデーションフック追加
- バリデーション結果を既存戻り値構造へ反映する型変更
- 既存 3 テストの契約更新 + 壊れ EVALS の新規ケース
- camelCase / snake_case 両許容ポリシーのコード内コメント化

#### 含まないもの

- 共通 evals validator の実装そのもの（先行タスク側で担当）
- fixture EVALS（`skill-creator/complete-skill/EVALS.json`）の
  snake_case → camelCase 移行
- UI 表示側のエラー文言リデザイン
- runner / reporter 側の挙動変更

### 2.4 成果物

| 成果物                     | パス                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| 更新された Scanner 本体    | `apps/desktop/src/main/services/skill/SkillScanner.ts`                                     |
| 更新された Scanner テスト  | `apps/desktop/src/main/services/skill/__tests__/SkillScanner.test.ts`                      |
| 実装ガイド追記             | `docs/30-workflows/evals-consumer-audit-001/outputs/phase-12/implementation-guide.md` §3.1 |
| validator 呼び出し箇所メモ | `SkillScanner.ts` 内 JSDoc / コメント                                                      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `task-skill-fixture-runner-evals-schema-validate-001` 側で
  共通 validator 仕様が先行確定していること（推奨）
- 先行確定していない場合は SkillScanner 内ローカルで最小版を実装し、
  共通 validator 完成後に差し替える前提を明記する
- fixture EVALS（snake_case）は現行のまま壊さない

### 3.2 依存タスク

| タスクID                                            | ステータス |
| --------------------------------------------------- | ---------- |
| task-skill-fixture-runner-evals-schema-validate-001 | 未実施     |
| task-evals-schema-dialect-unification-001           | 未実施     |

### 3.3 必要な知識

- TypeScript 同期 I/O と非同期化のトレードオフ
- JSON スキーマ検証（ajv など）最小構成
- camelCase / snake_case 方言の扱い
- SkillScanner 既存戻り値構造と Consumer 側の期待

### 3.4 推奨アプローチ

1. **方針定義**: 「存在 + パース可 + 必須キー有り」を `valid` 条件に昇格
2. **方言許容**: camelCase / snake_case どちらかに一致すれば OK
3. **フェイルソフト**: 破損時は `valid=false` で返し、
   スキャン自体は落とさない（他スキルのスキャンを止めない）
4. **性能配慮**: ファイルサイズ閾値を設け、
   大きすぎる `EVALS.json` は警告だけで深い検証を避ける選択肢を残す
5. **テスト契約更新**: 既存 3 ケースへ「内容を持つ EVALS」を足し、
   壊れ JSON / 空 `{}` / 必須キー欠落の 3 ケースを追加

---

## 4. 苦戦箇所記録

### 4.1 記録1: Scanner が内容を見ない契約のまま長く運用されていた

`SkillScanner` は `type=evals` タグと size を返すだけで、中身を読まない。
結果、Consumer 側が「存在 = 有効」と誤認する呼び出しが蓄積している。

**対処方針**: `valid` の意味を「存在」から「存在 + パース可 + 必須キー」に
昇格し、Consumer の期待を内部で吸収する。

### 4.2 記録2: camelCase / snake_case 二重スキーマ

repo には `reliability_dashboard` などの snake_case 仕様と、
TS 側の camelCase 仕様が併存する。
fixture EVALS（`skill-creator/complete-skill/EVALS.json`）は snake_case。

**対処方針**: validator は両方を許容し、
どちらか一方を壊す変更を SkillScanner 内で行わない。
統一はあくまで `task-evals-schema-dialect-unification-001` 側で扱う。

### 4.3 記録3: 同期前提の性能トレードオフ

`SkillScanner` は同期寄りに呼ばれる前提のコードパスがあり、
重量級 JSON スキーマ検証を挟むとスキャン全体が遅くなる恐れがある。

**対処方針**: 「パース + 必須キー有無」までを最低線とし、
詳細 schema 検証は Consumer 側 / 先行タスクの共通 validator 側に委ねる。

### 4.4 記録4: 既存 3 テストが「中身を期待しない」契約

`with-evals` / `with-all-others` / `with-sized-evals` の 3 ケースは
内容を検査しない前提で書かれており、契約更新なしで壊れるテストがある。

**対処方針**: 既存 3 ケースの assertion を更新し、
破損 / 空 / 必須キー欠落の 3 ケースを追加して、
新しい契約（valid の定義昇格）をテストで明文化する。

### 4.5 記録5: fixture EVALS を壊さない validator 設計

`skill-creator/complete-skill/EVALS.json` は snake_case。
validator が snake_case を `invalid` と判定すると fixture が一気に壊れる。

**対処方針**: 方言許容を「両方許容 + 将来片側にそろえる」方針で運用し、
本タスク内では fixture を一切触らないことを成果物に明記する。

---

## 5. 完了条件

- [ ] `SkillScanner.ts` で `EVALS.json` の内容を読み、
      パース可否と必須キー有無で `valid` 判定ができている
- [ ] camelCase / snake_case 両方言を許容する方針が
      コード内コメント / 実装ガイドに明記されている
- [ ] 破損 JSON / 空 `{}` / 必須キー欠落の 3 ケースが
      `SkillScanner.test.ts` に追加されている
- [ ] 既存 3 ケース（`with-evals` / `with-all-others` / `with-sized-evals`）が
      新しい契約に沿って更新されている
- [ ] fixture EVALS（snake_case）が本タスクでは変更されていない
- [ ] `pnpm --filter @repo/desktop typecheck` / `test` が通る
- [ ] `implementation-guide.md` §3.1 に SkillScanner の新契約が追記されている
