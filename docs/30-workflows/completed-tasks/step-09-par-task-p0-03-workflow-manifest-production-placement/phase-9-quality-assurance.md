# Phase 9: 品質保証

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 9                                      |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

manifest の resource descriptor が skill-creator ディレクトリの実ファイルと整合していることを cross-reference で確認し、Phase 10 最終レビューへ渡す。

## 実行タスク

- cross-reference 検証: manifest の全 resource path が skill-creator ディレクトリ内の実ファイルを指すことを検証する
- phase-resource 整合確認: 各 phase の resourceIds が実在する resource を参照していることを確認する
- hook 整合確認: 全 phase の entryHookId / exitHookId が entry[] / exit[] に存在することを確認する
- risk register 更新: 残リスクを severity 付きで整理する

## 参照資料

| 資料名                 | パス                                                  | 説明              |
| ---------------------- | ----------------------------------------------------- | ----------------- |
| phase-5 implementation | `phase-5-implementation.md`                           | 実装済み manifest |
| phase-7 coverage check | `phase-7-coverage-check.md`                           | カバレッジ        |
| phase-8 refactoring    | `phase-8-refactoring.md`                              | 最適化結果        |
| workflow-manifest.json | `.claude/skills/skill-creator/workflow-manifest.json` | 検証対象          |
| skill-creator 正本     | `.claude/skills/skill-creator/`                       | ファイル実在確認  |
| skill-creator mirror   | `.agents/skills/skill-creator/`                       | parity 確認対象   |

## 品質保証チェックリスト

### cross-reference 検証

| 確認項目                                               | 検証方法                 |
| ------------------------------------------------------ | ------------------------ |
| 全 resource.path が実在するファイルを指す              | `fs.existsSync()` で確認 |
| 全 phase.resourceIds の resource が resources[] に存在 | id 照合                  |
| 全 phase.entryHookId が entry[] に存在                 | id 照合                  |
| 全 phase.exitHookId が exit[] に存在                   | id 照合                  |
| 全 phase.dependsOn の phase id が phases[] に存在      | id 照合                  |
| canonical / mirror に差分がない                        | `diff -qr` で確認        |

### 品質基準

| 基準           | 判定条件                                           |
| -------------- | -------------------------------------------------- |
| path integrity | 全 resource path が実在ファイルを指す              |
| ref integrity  | 全 id 参照が解決できる                             |
| schema compat  | schemaVersion === WORKFLOW_MANIFEST_SCHEMA_VERSION |
| json validity  | JSON.parse でエラーなし                            |
| mirror parity  | canonical と mirror が byte-equivalent             |

## 実行手順

### ステップ1: cross-reference を実行する

manifest の全 resource path を skill-creator ディレクトリのファイル一覧と照合する。

### ステップ2: phase-resource-hook 整合を確認する

phases[] → resources[] → entry[]/exit[] の参照チェーンを全て検証する。

### ステップ3: risk register を更新する

残リスク（TASK-P0-04 で必要な対応等）を severity 付きで整理する。

## 統合テスト連携

| 観点            | 実施内容                                              |
| --------------- | ----------------------------------------------------- |
| path integrity  | 全 resource path の実在確認                           |
| ref integrity   | 全 id 参照の解決確認                                  |
| risk assessment | TASK-P0-04 向けの remaining risk が整理されていること |

## 多角的チェック観点

| 観点     | この Phase で確認する内容                                     |
| -------- | ------------------------------------------------------------- |
| 厳密性   | cross-reference の結果が再現可能か                            |
| 監査性   | 品質検証の結果が文書として残っているか                        |
| 境界意識 | 本タスクで残した risk が TASK-P0-04 の scope に含まれているか |

## サブタスク管理

1. cross-reference 検証実行
2. phase-resource-hook 整合確認
3. risk register 更新
4. Phase 10 input 整理

## 成果物

| 成果物              | パス                                     | 説明         |
| ------------------- | ---------------------------------------- | ------------ |
| quality checklist   | `outputs/phase-9/quality-checklist.md`   | 品質確認結果 |
| cross-reference log | `outputs/phase-9/cross-reference-log.md` | 照合結果     |
| risk register       | `outputs/phase-9/risk-register.md`       | 残リスク     |

## 完了条件

- [ ] cross-reference 検証が完了している
- [ ] phase-resource-hook 整合が確認されている
- [ ] risk register が更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 5 を参照した
- [ ] Phase 7 を参照した
- [ ] Phase 8 を参照した
- [ ] cross-reference を実行した
- [ ] risk register を更新した

## 次のPhase

Phase 10: 最終レビュー
