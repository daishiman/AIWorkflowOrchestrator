# skill:get-detail引数名ドリフト修正 - タスク指示書（再評価クローズ）

## メタ情報

```yaml
issue_number: 861
```

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001                    |
| タスク名     | skill:get-detail引数名ドリフト修正（P45パターン）          |
| 分類         | リファクタリング                                           |
| 対象機能     | skill:get-detail IPCハンドラ                               |
| 優先度       | 低                                                         |
| 見積もり規模 | 小規模                                                     |
| ステータス   | 再評価クローズ（対応不要）                                 |
| 発見元       | Phase 12（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 コード調査） |
| 発見日       | 2026-02-21                                                 |
| クローズ日   | 2026-02-25                                                 |
| issue_number | 861                                                        |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-SKILL-REMOVE-INTERFACE-001 で P45（IPC引数命名ドリフト）が実際に発生していたため、同系統の `skill:get-detail` も再点検対象として登録された。

### 1.2 再評価で判明した事実

2026-02-25 の再監査で以下を確認し、当初の前提（`skillId` が実態は `skillName`）は成立しないと判定した。

- `SkillService.scanAvailableSkills()` は `this.cache.set(skill.id, skill)` で ID キー保存
- `SkillService.getSkillById(id)` は `this.cache.get(id)` で ID 検索
- `skill:get-detail` ハンドラは `args.skillId` を `getSkillById` に渡しており、命名と実装セマンティクスが一致

### 1.3 放置時の影響

誤検知のまま未タスクを残すと、実装契約に問題がない箇所を不要変更するリスクがあるため、台帳の状態を正しくクローズする必要がある。

## 2. 何を達成するか（What）

### 2.1 目的

本未タスクを「実装不要（再評価クローズ）」として明確化し、仕様・台帳の整合性を回復する。

### 2.2 最終ゴール

- 未タスク指示書のステータスがクローズへ更新されている
- aiworkflow-requirements 側の残課題テーブルがクローズ状態に同期されている
- 再監査成果物に判断根拠が記録されている

### 2.3 スコープ

#### 含むもの

- 本指示書のクローズ更新
- `task-workflow.md` / `interfaces-agent-sdk-skill.md` へのクローズ反映
- 再監査成果物への根拠記録

#### 含まないもの

- `skill:get-detail` の実装変更
- Preload API/テストの命名変更

### 2.4 成果物

| 成果物                     | パス                                                                                                |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| クローズ済み未タスク指示書 | `docs/30-workflows/unassigned-task/task-skill-getdetail-naming-drift.md`                            |
| 残課題テーブル更新         | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                                |
| 関連未タスクテーブル更新   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                   |
| 再監査レポート             | `docs/30-workflows/completed-tasks/task-013-subagent-team/outputs/compliance-recheck-2026-02-25.md` |

## 3. どのように実行するか（How）

### 3.1 前提条件

- `skillHandlers.ts` と `SkillService.ts` の現行実装を確認済みであること
- 旧監査（2026-02-25 初回）結果との差分を把握していること

### 3.2 依存タスク

| タスクID                                | 状態 | 依存内容                                          |
| --------------------------------------- | ---- | ------------------------------------------------- |
| UT-FIX-SKILL-VALIDATION-CONSISTENCY-001 | 完了 | P42バリデーション整合（命名ドリフト判定とは独立） |

### 3.3 必要な知識

- P45（IPC引数命名ドリフト）の判定基準
- `SkillService` の ID/Name 検索の役割分離

### 3.4 推奨アプローチ

1. ID検索実体（`cache.set(skill.id, skill)`）を先に確認する
2. ハンドラ引数と呼び出し先メソッドの意味一致を確認する
3. 未タスクを「実装」ではなく「再評価クローズ」で整理する

### 3.5 実装課題と解決策（親タスクからの教訓）

| #   | 課題                                        | 解決策                                         | 教訓                                                     |
| --- | ------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------- |
| 1   | P45は命名だけでなく実データの意味確認が必要 | サービス層のキャッシュキー定義まで遡って確認   | IPC引数名の是正は実データ構造を確認してから判断する      |
| 2   | 旧監査結果が先行して残課題化される          | 再監査フェーズで「誤検知クローズ」を台帳へ反映 | 未タスクは「追加」だけでなく「クローズ」も同等に運用する |

## 4. 実行手順

### Phase構成

| Phase | 名称       | 概要                                 |
| ----- | ---------- | ------------------------------------ |
| 1     | 実装再確認 | Handler/Service のセマンティクス確認 |
| 2     | 台帳同期   | 仕様書テーブルをクローズ状態へ更新   |
| 3     | 証跡出力   | 再監査成果物へ根拠を出力             |

## 5. 完了条件チェックリスト

### 機能要件

- [x] `skill:get-detail` が ID 検索契約であることを確認
- [x] 本未タスクのステータスを再評価クローズへ更新
- [x] 仕様書テーブル（2箇所）をクローズ状態へ同期

### 品質要件

- [x] 参照リンクが実在パスを指している
- [x] 再監査根拠が outputs に残っている

### ドキュメント要件

- [x] aiworkflow-requirements の LOGS/SKILL へ反映
- [x] task-specification-creator の LOGS/SKILL へ反映

## 6. 検証方法

### テストケース

1. `SkillService.scanAvailableSkills()` が `skill.id` キーでキャッシュ保存していること
2. `SkillService.getSkillById()` が `Map#get(id)` で取得していること
3. `skill:get-detail` が `args.skillId` をそのまま `getSkillById` に渡していること

### 検証手順

```bash
rg -n "cache\.set\(skill\.id|getSkillById\(|skill:get-detail" apps/desktop/src/main
```

## 7. リスクと対策

| リスク                           | 影響度 | 発生確率 | 対策                                                                          |
| -------------------------------- | ------ | -------- | ----------------------------------------------------------------------------- |
| 過去成果物に「未解消」記載が残る | 低     | 中       | 再監査レポートで supersede を明記する                                         |
| 今後 ID/Name 契約が変わる        | 中     | 低       | 変更時に `interfaces-agent-sdk-skill.md` と `task-workflow.md` を同時更新する |

## 8. 参照情報

- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/services/skill/SkillService.ts`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

## 9. 備考

本タスクは「実装不足」ではなく「監査時の仮説が不成立」と判定されたため、完了ではなく**再評価クローズ**として管理する。
