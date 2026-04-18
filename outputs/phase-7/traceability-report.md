# TASK-CONFLICT-PREVENT-001: Phase 7 トレーサビリティレポート

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| タスクID   | TASK-CONFLICT-PREVENT-001 |
| Phase      | 7                         |
| 作成日     | 2026-04-18                |
| ステータス | completed                 |

## 要件 → 設計 → テスト → 実装 対応表

| AC   | 要件 (Phase 1)                                                        | 設計 (Phase 2)                                                         | テスト (Phase 4/6)                        | 実装 (Phase 5)                                                       | 判定    |
| ---- | --------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------- | ------- |
| AC-1 | 13 phase 骨格が task-specification-creator 必須セクションを満たす     | phase 骨格定義 (phase-02-design.md §必須セクション)                    | TC-4-01: verify-all-specs.js 実行         | docs/30-workflows/conflict-prevent-skills-001/ 全 phase ファイル整備 | PASS    |
| AC-2 | G1/G2/G3/G4 の 4 分類が混同なく定義される                             | merge policy table (phase-02-design.md §競合分類)                      | TC-4-02: document review                  | Phase 2 を正本として Phase 5/8 で wording 統一                       | PASS    |
| AC-3 | merge=ours は custom driver 前提で記述し Git 組み込み仕様と矛盾しない | custom keep-ours driver 設計 (phase-02-design.md §driver)              | TC-4-01: .gitattributes + driver check    | .gitattributes 修正 + setup-merge-drivers.sh 作成                    | PASS    |
| AC-4 | .claude canonical / .agents mirror の方針が Phase 2/5/9/12 で一貫する | canonical/mirror 分離方針 (phase-02-design.md §mirror)                 | TC-4-04: diff -qr .claude .agents         | parity diff 実施・差分記録                                           | PARTIAL |
| AC-5 | topic-map.md の date diff 増幅除去・行番号索引維持                    | generate-index.js deterministic 化方針 (phase-02-design.md §generator) | TC-4-03: rg "自動生成:" + rg "\| L[0-9]+" | generate-index.js から日付ヘッダ除去                                 | PASS    |
| AC-6 | EVALS schema 不変                                                     | EVALS policy: schema 変更なし (phase-02-design.md §EVALS)              | TC-4-05: schema diff                      | EVALS は JSON 向け merge policy のみ適用、schema 変更なし            | PASS    |
| AC-7 | Phase 13 は blocked 維持                                              | Phase 13 blocked 方針 (phase-02-design.md §close-out)                  | artifacts / phase-13 review               | index.md と artifacts.json で blocked 明記                           | PASS    |

## 縦断トレース詳細

### AC-3: custom merge driver トレース

```
要件: "merge=ours を使う箇所は custom merge driver 登録前提で記述する"
  ↓
設計: phase-02-design.md
      .gitattributes: indexes/*.md merge=ours (custom driver 前提)
      driver: merge.ours.driver = true (bootstrap スクリプトで設定)
  ↓
テスト: TC-4-01
      git config --get merge.ours.driver → "true" 期待値
  ↓
実装: .gitattributes: merge=union → merge=ours に修正
      .claude/scripts/setup-merge-drivers.sh 新規作成
      session-init.sh: driver 未設定時 warn 追加
  ↓
検証 (Phase 9): git config --get merge.ours.driver → "true" 実測
```

### AC-5: topic-map deterministic 化トレース

```
要件: "topic-map.md の日付など diff 増幅要因に deterministic 対策があり
       行番号索引契約は維持される"
  ↓
設計: generate-index.js から date ヘッダ出力を除去する
  ↓
テスト: TC-4-03
      rg "自動生成:" topic-map.md → 0 件 期待値
      rg "\| L[0-9]+" topic-map.md → 件数 > 0 期待値
  ↓
実装: generate-index.js の date ヘッダ出力コードを削除
  ↓
検証 (Phase 9): rg "自動生成:" → 0 件 / rg "\| L[0-9]+" → 行番号索引あり 実測
```

## ギャップとの対応

| gap                            | AC        | 対応                                     |
| ------------------------------ | --------- | ---------------------------------------- |
| GAP-01 (mirror full sync)      | AC-4      | PARTIAL / follow-up 登録済み             |
| GAP-02 (consumer audit 完全版) | AC-6      | EVALS のみ確認・残は follow-up           |
| GAP-03 (LOGS archive 詳細)     | AC-2 (G3) | 基本 union policy 確定・詳細は follow-up |

## 接続先

- coverage-matrix.md: AC × TC の集約判定
- gap-list.md: 未到達 gap 詳細
- Phase 9 quality-report.md: 実測値の正本
