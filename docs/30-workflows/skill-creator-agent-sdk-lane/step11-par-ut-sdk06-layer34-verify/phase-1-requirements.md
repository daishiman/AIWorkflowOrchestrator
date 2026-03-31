# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 1                                 |
| 機能名 | ut-sdk06-layer34-verify-expansion |
| 作成日 | 2026-03-31                        |

## 目的

Layer3/4 verify 拡張テストの検証対象、チェック項目体系、結合テストのスコープを要件として固定する。

## 実行タスク

- Layer1/2 の既存実装からテスト追加対象を識別する
- Layer3（実行時 lint/schema 検証）のチェック項目を定義する
- Layer4（セマンティック整合性チェック）のチェック項目を定義する
- verify→improve→reverify 結合テストの範囲を定義する
- AC-1〜AC-8 への写像を確認する
- 30種の思考法を Phase 1-3 に割り当て、後続 Phase が再利用できる形に固定する
- commit / PR / push は user 指示があるまで実行しない前提を固定する

## 参照資料

### コード/既存タスク

| 資料名              | パス                                                                                         | 説明                                    |
| ------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------- |
| Layer1/2 テスト実装 | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`    | 既存テスト構造と fixture 設計の参考     |
| Layer1/2 実装       | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                   | チェック ID 体系と verify 方式の参考    |
| 既存設計仕様書      | `docs/30-workflows/completed-tasks/ut-imp-task-sdk-06-layer34-verify-expansion-001/index.md` | Layer3/4 の concern inventory           |
| 型定義              | `packages/shared/src/types/skillCreator.ts`                                                  | `RuntimeSkillCreatorVerifyCheck` 現行型 |

### skill 正本（検証根拠）

| 資料名                       | パス                                                                                   | 目的                                |
| ---------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------- |
| task-specification-creator   | `.claude/skills/task-specification-creator/SKILL.md`                                   | Phase 1-13 構造、Phase 12/13 の正本 |
| aiworkflow-requirements      | `.claude/skills/aiworkflow-requirements/SKILL.md`                                      | canonical spec 参照・更新の正本     |
| Phase 12 documentation guide | `.claude/skills/task-specification-creator/references/phase-12-documentation-guide.md` | Task 12-1〜12-6 の必須要件          |
| spec update workflow         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`         | Step 1/2 の判定誤り防止             |

## 要件レビュー一次結論

| 観点                 | 結論                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 真の論点             | Layer3/4 追加は「テスト数を増やす」ことではなく、check ID/fixture/loop/QA を矛盾なく閉じ、後続の実装・運用で drift を起こさないこと                    |
| 依存関係・責務境界   | `createSkillFixture` の拡張を起点に、unit（Layer3/4）→ integration（loop）→ QA（型/デグレ/AC）→ Phase 12 close-out の順で閉じる                        |
| 価値とコスト         | 先に check ID と pass/fail の期待値を固定すると、実装の揺れ・テストの揺れ・ドキュメントの揺れをまとめて抑えられる（再作業コスト最小）                  |
| 改善優先順位         | 1. check ID + severity の固定 2. fixture 拡張 3. loop 結合テスト 4. coverage/QA の証跡化 5. Phase 12 で evidence を閉じる                              |
| スコープ境界（固定） | 本 workflow は「テスト拡張 + テストが要求する必要最小限の検証実装」までを含む。IPC/preload/renderer/governance/session semantics の owner は増やさない |
| 思考法配分           | 30種の思考法は Phase 1-3 に集約し、Phase 4 以降は Phase 1-3 の結論（チェック定義/境界/優先順位）を消費するだけにする                                   |
| 4条件評価            | 価値性: 高（verify信頼性向上）/ 実現性: 中（fixture/loopが重い）/ 整合性: owner境界固定で高 / 運用性: Phase 12 で evidence を固定すれば高              |

## 30思考法の配分（Phase 1-3 に集約）

Phase 4 以降はこの配分で確定した「結論」を再利用し、思考法の再発散をしない（解釈 drift の防止）。

| カテゴリ     | 思考法               | 主な適用フェーズ | このタスクでの使いどころ（要件として固定する内容）                      |
| ------------ | -------------------- | ---------------- | ----------------------------------------------------------------------- |
| 論理分析系   | 批判的思考           | Phase 1 / 3      | 「その要件は本当に必要か」「逆に害はないか」の検証                      |
| 論理分析系   | 演繹思考             | Phase 1 / 3      | AC（大前提）→ check ID / test case（小前提）→ 充足（結論）              |
| 論理分析系   | 帰納的思考           | Phase 1          | Layer1/2 実績から「壊れやすい点」を抽出して優先順位化                   |
| 論理分析系   | アブダクション       | Phase 1          | 失敗の最良説明を「実装不足」ではなく「境界/証跡不足」として固定         |
| 論理分析系   | 垂直思考             | Phase 2 / 3      | 最短の実装順（fixture→unit→loop→QA）へ収束させる                        |
| 構造分解系   | 要素分解             | Phase 1 / 2      | check/fixture/test/QA/docs を最小単位に分割する                         |
| 構造分解系   | MECE                 | Phase 1 / 3      | check ID と AC の漏れ/重複を排除する                                    |
| 構造分解系   | 2軸思考              | Phase 2 / 3      | `owner変更有無`×`テストで観測可能` で scope を固定する                  |
| 構造分解系   | プロセス思考         | Phase 1 / 2      | 実行順と gate を「実行可能な手順」に落とす                              |
| メタ・抽象系 | メタ思考             | Phase 1 / 3      | 「この仕様は何のための仕様か（実装仕様か/検証仕様か）」を固定           |
| メタ・抽象系 | 抽象化思考           | Phase 1 / 2      | Layer3/4 を「検証の種類」として抽象化し、具体例は Phase 4 へ分離        |
| メタ・抽象系 | ダブル・ループ思考   | Phase 1 / 3      | 目的を「深いverify」ではなく「owner境界を崩さずに深くする」へ再定義     |
| 発想・拡張系 | ブレインストーミング | Phase 2          | fixture戦略（mock/実ファイル/差分更新）を発散して比較する               |
| 発想・拡張系 | 水平思考             | Phase 2          | 直接実装しない代替（fixtureで再現、最小実装で閉じる）を探す             |
| 発想・拡張系 | 逆説思考             | Phase 1 / 3      | もし scope を広げたら何が壊れるか（IPC/UI侵食）を先に列挙する           |
| 発想・拡張系 | 類推思考             | Phase 12         | Part 1 の比喩（採点→修正→再採点）を固定する                             |
| 発想・拡張系 | if思考               | Phase 3          | もし loop が重い/不安定なら、どこまでを unit へ戻すかを条件化する       |
| 発想・拡張系 | 素人思考             | Phase 12         | 初見が理解できる説明順（なぜ→なに→どう）を固定する                      |
| システム系   | システム思考         | Phase 1 / 2      | 変更が shared types / engine / facade / docs に波及する前提を固定       |
| システム系   | 因果関係分析         | Phase 1 / 3      | 「fixtureが揺れる→テストが揺れる→QAが揺れる」因果を抑える               |
| システム系   | 因果ループ           | Phase 3          | drift が増える強化ループを、境界固定と証跡固定で止める                  |
| 戦略・価値系 | トレードオン思考     | Phase 1 / 2      | coverage と実行時間の両立条件（最小のedge case）を固定する              |
| 戦略・価値系 | プラスサム思考       | Phase 2          | L3/4 の深さを増やしても owner を増やさない案に寄せる                    |
| 戦略・価値系 | 価値提案思考         | Phase 1          | 誰が得するか（実装者/レビュア/運用者）を一次結論に入れる                |
| 戦略・価値系 | 戦略的思考           | Phase 1 / 3      | 後続タスクの迷いを減らすため、最初に contract-first で固定する          |
| 問題解決系   | why思考              | Phase 1          | なぜ今やるか（Layer1/2直後で境界知識が新鮮）を固定する                  |
| 問題解決系   | 改善思考             | Phase 3          | MINOR を Phase 6/12 へ追跡する運用を固定する                            |
| 問題解決系   | 仮説思考             | Phase 1 / 3      | 「テスト先行で boundary を崩さず green まで行ける」を仮説として検証する |
| 問題解決系   | 論点思考             | Phase 1          | 論点を Layer3/4 の contract と loop の最小シナリオへ限定する            |
| 問題解決系   | KJ法                 | Phase 2 / 3      | 発散した案を fixture / unit / loop / QA / docs のクラスタへ束ねる       |

## Layer3 チェック項目（実行時 lint/schema 検証）

| チェックID | 検証対象                                                                     | severity | 備考                                          |
| ---------- | ---------------------------------------------------------------------------- | -------- | --------------------------------------------- |
| L3-001     | `output-schema.json` が JSON Schema draft-07 の `$schema` フィールドを持つか | warning  | `$schema` キーの存在確認                      |
| L3-002     | `output-schema.json` の `type` フィールドが有効な JSON Schema type か        | error    | `"object"`, `"array"` 等の許容値チェック      |
| L3-003     | agent ファイルの `## 責務` セクションの記述が最低 20 文字以上か              | warning  | 空白行のみや 1 語のみを弾く品質チェック       |
| L3-004     | `SKILL.md` の `## Trigger` セクションの記述が最低 10 文字以上か              | warning  | 意味のある Trigger 記述かどうかの簡易チェック |

## Layer4 チェック項目（セマンティック整合性チェック）

| チェックID | 検証対象                                                                                    | severity | 備考                                                               |
| ---------- | ------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------ |
| L4-001     | `SKILL.md` の `## Anchors` セクションにリスト項目が 1 件以上存在するか                      | error    | `- ` または `* ` で始まる行が 1 件以上あることを確認               |
| L4-002     | `references/` ディレクトリが存在する場合、`SKILL.md` 内の参照パス記述と実在ファイルの整合性 | warning  | `references/` 内への相対パス言及が実在するファイルと対応するか確認 |
| L4-003     | agents/ 配下のファイル名が `SKILL.md` 内でいずれかの場所で参照されているか                  | warning  | agent ファイル名の記述整合性確認（過剰制約を避けて warning）       |

## 結合テストのスコープ

| 種別                    | 内容                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------- |
| verify のみ             | `SkillCreatorVerificationEngine.verify()` が Layer3/4 チェック結果を返すことの確認 |
| verify→improve          | `RuntimeSkillCreatorFacade.verifySkill()` 後に improve が呼べることの確認          |
| verify→improve→reverify | improve 後の再 verify で Layer3/4 チェックが変化することの確認（mock を使用）      |

## 実行手順

### ステップ1: 既存テストの構造を確認する

- `SkillCreatorVerificationEngine.test.ts` の `createSkillFixture` ヘルパーを読了する
- Layer1/2 テストのパターン（pass/fail fixture、check ID 特定、severity 検証）を把握する
- 追加するテストが同一パターンで記述できることを確認する

### ステップ2: Layer3/4 チェック要件を固定する

- 上記チェック項目表を確定する（Phase 2 の設計インプットとなる）
- 各チェックの severity（error/warning）の根拠を記録する
- `layer` フィールド値として `"layer3"` と `"layer4"` を使用することを確定する

### ステップ3: 結合テストの範囲を固定する

- `WorkflowEngine` と `VerificationEngine` の結合テストが mock ベースかどうかを決定する
- verify→improve→reverify ループの「最低限のシナリオ」を 1 ケース定義する
- Facade 経由のみを結合テスト対象とし、内部実装の詳細には立ち入らない

### ステップ4: AC-1〜AC-8 への写像を確認する

- 各受入基準に対応するチェック ID またはテストケース ID が存在することを確認する
- 未対応の受入基準があれば Phase 4 でテストケースを追加する

## 統合テスト連携

- Phase 4 で Layer3/4 全チェック項目を test case へ変換する
- Phase 5 で `SkillCreatorVerificationEngine.ts` への Layer3/4 実装をテストが駆動する
- Phase 7 で Layer3/4 全チェック ID の coverage を確認する

## 成果物

| 成果物     | パス                      | 説明                                      |
| ---------- | ------------------------- | ----------------------------------------- |
| 要件定義書 | `phase-1-requirements.md` | Layer3/4 チェック項目と結合テストスコープ |

## 完了条件

- [ ] Layer3 チェック項目が ID 付きで列挙されている
- [ ] Layer4 チェック項目が ID 付きで列挙されている
- [ ] 結合テストのスコープが明確に定義されている
- [ ] AC-1〜AC-8 への写像が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**
