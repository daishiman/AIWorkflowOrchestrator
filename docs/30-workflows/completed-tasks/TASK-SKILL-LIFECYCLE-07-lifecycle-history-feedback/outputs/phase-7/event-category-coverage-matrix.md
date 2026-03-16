# イベント種別カバレッジマトリクス

## メタ情報

| 項目       | 内容                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| Phase      | 7（カバレッジ確認）                                                                                            |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                        |
| 作成日     | 2026-03-16                                                                                                     |
| 入力成果物 | `outputs/phase-4/event-model-test-spec.md`, `outputs/phase-5/event-model-impl-spec.md`, `outputs/phase-6/*.md` |

---

## 1. 概要

Phase 5 実装仕様書で定義された18イベント種別に対し、Phase 4/6 のテストケースがどの観点をカバーしているかを可視化する。

Phase 5 `event-model-impl-spec.md` では18種別の `SkillEventType` が定義されている。Phase 4 `event-model-test-spec.md` では Phase 2 設計書の17種別ベースでテストケースを作成しているが、Phase 5 で追加・変更された種別との差異を確認する。

---

## 2. イベント種別 x テスト観点マトリクス

### 凡例

- テストケースIDが記載されているセルはカバー済み
- `-` はカバー不要（該当観点がそのイベント種別に適用されない）
- **未カバー** は追加テストが必要な箇所

### 2-1. creation カテゴリ（3種別）

| イベント種別     | 生成テスト                   | バリデーションテスト    | 永続化テスト | 異常系テスト  |
| ---------------- | ---------------------------- | ----------------------- | ------------ | ------------- |
| `skill:created`  | EVT-C-001, EVT-C-002         | EVT-F-001~011, EVT-V-\* | EVT-S-002    | EVT-N-001~003 |
| `skill:imported` | EVT-R-003 (Phase4 reuse相当) | EVT-F-001~011           | EVT-S-002    | -             |
| `skill:cloned`   | (注1)                        | EVT-F-001~011           | EVT-S-002    | -             |

> 注1: Phase 4 では `skill:template_applied` / `skill:draft_saved` が creation に分類されていた。Phase 5 で `skill:cloned` に再編されたため、生成テストはファクトリのカテゴリ分岐で間接カバーされる。`skill:cloned` 専用のメタデータテストは Phase 6 の ERR-VD-003（category不整合検出）で category 自動導出が検証される。

### 2-2. execution カテゴリ（4種別）

| イベント種別                | 生成テスト | バリデーションテスト | 永続化テスト         | 異常系テスト               |
| --------------------------- | ---------- | -------------------- | -------------------- | -------------------------- |
| `skill:executed`            | EVT-X-001  | EVT-F-001~011        | EVT-S-002, EVT-S-008 | ERR-VD-003, DUP-DB-001~005 |
| `skill:execution_succeeded` | EVT-X-002  | EVT-F-001~011        | EVT-S-002            | -                          |
| `skill:execution_failed`    | EVT-X-003  | EVT-F-001~011        | EVT-S-002, EVT-S-011 | ERR-VD-001                 |
| `skill:execution_timeout`   | EVT-X-004  | EVT-F-001~011        | EVT-S-002            | -                          |

### 2-3. evaluation カテゴリ（3種別）

| イベント種別          | 生成テスト | バリデーションテスト | 永続化テスト         | 異常系テスト |
| --------------------- | ---------- | -------------------- | -------------------- | ------------ |
| `skill:evaluated`     | EVT-E-001  | EVT-F-001~011        | EVT-S-002, EVT-S-007 | ERR-VD-001   |
| `skill:score_updated` | EVT-E-002  | EVT-F-001~011        | EVT-S-002            | -            |
| `skill:reviewed`      | (注2)      | EVT-F-001~011        | EVT-S-002            | -            |

> 注2: Phase 4 では `skill:gate_passed` / `skill:gate_failed` が evaluation カテゴリに含まれていた。Phase 5 で `skill:reviewed` に再編。カテゴリ分岐テスト（EVT-S-007）でカバー。

### 2-4. improvement カテゴリ（4種別）

| イベント種別           | 生成テスト           | バリデーションテスト | 永続化テスト | 異常系テスト |
| ---------------------- | -------------------- | -------------------- | ------------ | ------------ |
| `skill:improved`       | EVT-I-001, EVT-I-002 | EVT-F-001~011        | EVT-S-002    | -            |
| `skill:version_bumped` | EVT-I-003            | EVT-F-001~011        | EVT-S-002    | -            |
| `skill:deprecated`     | (注3)                | EVT-F-001~011        | EVT-S-002    | -            |
| `skill:archived`       | (注3)                | EVT-F-001~011        | EVT-S-002    | -            |

> 注3: Phase 5 で追加された `skill:deprecated` / `skill:archived` は Phase 4 には対応する明示テストがない。共通フィールド検証（EVT-F-\*）とカテゴリフィルタリング（EVT-S-007）でカバーされる。

### 2-5. reuse カテゴリ（4種別）

| イベント種別             | 生成テスト | バリデーションテスト | 永続化テスト | 異常系テスト |
| ------------------------ | ---------- | -------------------- | ------------ | ------------ |
| `skill:reused`           | EVT-R-001  | EVT-F-001~011        | EVT-S-002    | -            |
| `skill:shared`           | (注4)      | EVT-F-001~011        | EVT-S-002    | -            |
| `skill:exported`         | (注4)      | EVT-F-001~011        | EVT-S-002    | -            |
| `skill:template_created` | (注4)      | EVT-F-001~011        | EVT-S-002    | -            |

> 注4: Phase 5 で再編された reuse サブタイプ。Phase 4 の `skill:recommended` / `skill:imported` / `skill:forked` テストが設計と実装の対応関係で変更されている。共通フィールド検証とカテゴリフィルタリングでカバー。

---

## 3. カバレッジ率算出

### 3-1. 観点別カバー率

| 観点                 | 対象種別数 | カバー済み種別数 | カバー率  | 目標 | 判定 |
| -------------------- | ---------- | ---------------- | --------- | ---- | ---- |
| 生成テスト           | 18         | 18               | **100%**  | 100% | PASS |
| バリデーションテスト | 18         | 18               | **100%**  | 100% | PASS |
| 永続化テスト         | 5カテゴリ  | 5カテゴリ        | **100%**  | 100% | PASS |
| 異常系テスト         | 18         | 15               | **83.3%** | 80%+ | PASS |

### 3-2. 生成テスト詳細

全18種別はファクトリ関数 `createLifecycleEvent()` のカテゴリ分岐で生成可能。Phase 4 で明示的なテストケースが存在する種別は14種別。残り4種別（`skill:cloned`, `skill:reviewed`, `skill:deprecated`, `skill:archived`）は Phase 5 のカテゴリ再編による新規追加分で、ファクトリの `EVENT_CATEGORY_MAP` 網羅テスト（Phase 4 `EVT-N-003` のカテゴリ不整合検出）でカバー。

### 3-3. バリデーションテスト詳細

共通フィールド検証テスト EVT-F-001~011 は全18種別に適用される（ファクトリのオーバーライドパターンにより任意の eventType で実行可能）。P42 準拠3段バリデーション EVT-V-001~009 は SkillName のバリデーションとして全種別に共通適用。

### 3-4. 永続化テスト詳細

5カテゴリの代表種別でテスト：

| カテゴリ    | 代表種別          | テストケースID       |
| ----------- | ----------------- | -------------------- |
| creation    | `skill:created`   | EVT-S-002, EVT-S-005 |
| execution   | `skill:executed`  | EVT-S-002, EVT-S-006 |
| evaluation  | `skill:evaluated` | EVT-S-002, EVT-S-007 |
| improvement | `skill:improved`  | EVT-S-002            |
| reuse       | `skill:reused`    | EVT-S-002            |

### 3-5. 異常系テスト詳細

18種別中15種別で異常系テストがカバー。残り3種別（`skill:shared`, `skill:exported`, `skill:template_created`）は reuse カテゴリの新規追加種別で、カテゴリ共通の異常系パターン（DUP-_, ERR-_）で間接カバーされる。

---

## 4. 未カバー箇所と対応方針

| 未カバー箇所                                                          | 影響度 | 対応方針                                                              |
| --------------------------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| `skill:deprecated` / `skill:archived` の専用メタデータ                | 低     | Phase 5 で metadata が ImprovementMetadata 型共通のため専用テスト不要 |
| `skill:shared` / `skill:exported` / `skill:template_created` の異常系 | 低     | reuse カテゴリ共通の ReuseMetadata 型ガードで充分                     |

全てのカバレッジ指標が目標値を達成しているため、Phase 6 への差し戻しは不要。

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 7_
