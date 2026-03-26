# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                      |
| ---------- | ------------------------- |
| タスクID   | TASK-SDK-01               |
| Phase      | 4                         |
| Phase名    | テスト作成                |
| ステータス | spec_created              |
| 前提Phase  | Phase 1, Phase 2, Phase 3 |
| 後続Phase  | Phase 5                   |
| 作成日     | 2026-03-26                |

## 目的

manifest schema と loader boundary を red case へ変換し、scope 逸脱と invalidation 漏れを実装前に固定する。

## 実行タスク

- schema positive case 作成: 最小 manifest、複数 phase、複数 resource を通す fixture を定義する
- schema negative case 作成: 不明 field、version 不一致、entry-exit 欠落を失敗ケースとして定義する
- loader boundary case 作成: relative path 正規化、resource 欠落、cache stale の失敗条件を定義する
- authority drift case 作成: manifest に `authMode`、permission、session を入れたときに失敗させる

## 参照資料

| 資料名                    | パス                                           | 説明                 |
| ------------------------- | ---------------------------------------------- | -------------------- |
| Phase 1                   | `phase-1-requirements.md`                      | scope 条件           |
| Phase 2                   | `phase-2-design.md`                            | schema / loader 条件 |
| Phase 3                   | `phase-3-design-review.md`                     | gate 条件            |
| manifest-schema-design    | `outputs/phase-2/manifest-schema-design.md`    | fixture 作成元       |
| cache-invalidation-design | `outputs/phase-2/cache-invalidation-design.md` | stale case 作成元    |
| downstream-handoff        | `outputs/phase-3/downstream-handoff.md`        | downstream contract  |

### システム仕様（aiworkflow-requirements）

| 参照資料                   | パス                                                                              | 内容                               |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------------------- |
| api-ipc-system-core        | `.claude/skills/aiworkflow-requirements/references/api-ipc-system-core.md`        | public IPC へ侵入しない確認        |
| security-electron-ipc      | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | preload / IPC authority 逸脱ケース |
| architecture-overview-core | `.claude/skills/aiworkflow-requirements/references/architecture-overview-core.md` | SRP 観点                           |

## 実行手順

1. manifest-schema-design から正常系 fixture を `minimal / standard / downstream-ready` の3種に分ける。
2. 禁止フィールドと invalidation 条件から異常系 fixture を作る。
3. loader boundary ごとに `input / expected failure / owner` を test matrix に記録する。
4. command plan を `schema validation / loader unit / contract lint` の3本で固定する。

## 統合テスト連携

- Phase 5 は Phase 4 の test matrix を入力として実装順を決める。
- Phase 6 は Phase 4 の negative case を edge case matrix へ拡張する。
- Phase 7 は Phase 4 のケースを AC と結び直す。

## 成果物

| 成果物                | パス                                       | 説明                     |
| --------------------- | ------------------------------------------ | ------------------------ |
| test-matrix           | `outputs/phase-4/test-matrix.md`           | 正常系 / 異常系一覧      |
| schema-fixture-plan   | `outputs/phase-4/schema-fixture-plan.md`   | fixture 設計             |
| negative-case-catalog | `outputs/phase-4/negative-case-catalog.md` | 禁止フィールドと失敗条件 |
| test-command-plan     | `outputs/phase-4/test-command-plan.md`     | 実行コマンド計画         |

## 完了条件

- [ ] 正常系 fixture が 3 種で定義されている
- [ ] 異常系 fixture に不明 field、version mismatch、entry-exit 欠落が含まれている
- [ ] loader boundary の失敗条件が input と expected failure で記録されている
- [ ] authority drift case に `authMode`、permission、session の3項目が含まれている
- [ ] **本Phase内の全タスクを100%実行完了**
