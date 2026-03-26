# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容         |
| ---------- | ------------ |
| タスクID   | TASK-SDK-01  |
| Phase      | 6            |
| Phase名    | テスト拡充   |
| ステータス | spec_created |
| 前提Phase  | Phase 5      |
| 後続Phase  | Phase 7      |
| 作成日     | 2026-03-26   |

## 目的

初回 red case だけでは拾えない互換性と stale cache の境界を補い、manifest 更新時の壊れ方を先に見える化する。

## 実行タスク

- backward compatibility case 追加: schemaVersion 互換と field deprecation を扱う
- cache drift case 追加: mtime 変化、resource hash 変化、schemaVersion 変化を扱う
- phase graph case 追加: phase 順序不正、entry 参照不正、exit 参照不正を扱う
- relative path case 追加: resource path の正規化と欠落を扱う

## 参照資料

| 資料名                    | パス                                           | 説明             |
| ------------------------- | ---------------------------------------------- | ---------------- |
| Phase 4                   | `phase-4-test-creation.md`                     | 初回 test plan   |
| Phase 5                   | `phase-5-implementation.md`                    | 実装対象         |
| manifest-sample           | `outputs/phase-5/manifest-sample.json`         | 拡充ケース基準   |
| implementation-sequence   | `outputs/phase-5/implementation-sequence.md`   | 実装順           |
| cache-invalidation-design | `outputs/phase-2/cache-invalidation-design.md` | stale cache 条件 |

### システム仕様（aiworkflow-requirements）

| 参照資料                                                 | パス                                                                                                            | 内容                                       |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| arch-electron-services-details-part2                     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services-details-part2.md`                     | runtime facade の互換性前提                |
| arch-execution-capability-contract                       | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md`                       | route authority を manifest へ入れない確認 |
| lessons-learned-auth-ipc-skill-creator-sync-auth-timeout | `.claude/skills/aiworkflow-requirements/references/lessons-learned-auth-ipc-skill-creator-sync-auth-timeout.md` | drift 再発防止                             |

## 実行手順

1. schemaVersion 互換テーブルを作り、受理する version と拒否する version を分ける。
2. cache key 変更条件ごとに stale / refresh の期待結果を書く。
3. entry、exit、phase graph の不正パターンを failure case として追加する。
4. resource path の相対参照と欠落を分けて記録する。

## 統合テスト連携

- Phase 7 で AC と追加ケースの対応を確認する。
- Phase 8 で互換性のために残す field 名と削る field 名を決める。
- Phase 10 で backward compatibility の open item を再評価する。

## 成果物

| 成果物                       | パス                                              | 説明                             |
| ---------------------------- | ------------------------------------------------- | -------------------------------- |
| backward-compatibility-cases | `outputs/phase-6/backward-compatibility-cases.md` | version 互換ケース               |
| cache-drift-cases            | `outputs/phase-6/cache-drift-cases.md`            | stale cache ケース               |
| edge-case-matrix             | `outputs/phase-6/edge-case-matrix.md`             | graph / path / invalidation 一覧 |

## 完了条件

- [ ] schemaVersion 互換ケースが記録されている
- [ ] cache drift case に mtime、resource hash、schemaVersion の3条件が含まれている
- [ ] phase graph の不正パターンが entry、exit、順序の3種で定義されている
- [ ] relative path と resource 欠落が分けて記録されている
- [ ] **本Phase内の全タスクを100%実行完了**
