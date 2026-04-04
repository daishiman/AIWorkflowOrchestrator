# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目      | 内容                            |
| --------- | ------------------------------- |
| Phase     | 2                               |
| 機能名    | imp-layer12-spec-definition-004 |
| 作成日    | 2026-04-03                      |
| 前提Phase | Phase 1                         |
| 後続Phase | Phase 3                         |

## 目的

Phase 1 の調査結果に基づき、check ID 体系の追記先ファイル・ドキュメント構成・記載フォーマットを設計する。

## 実行タスク

### タスク1: 追記先ファイルの決定

**目的**: check ID 体系を追記する最適なファイルを決定する

**手順**:

1. Phase 1 の `fr04-current-state.md` から追記候補先を確認する
2. 以下の方針で追記先を決定する:
   - **方針 A**: 既存ファイル（`interfaces-agent-sdk-skill-core.md` / `interfaces-agent-sdk-skill-details.md` / `interfaces-agent-sdk-skill.md`）に FR-04 セクションとして追記
   - **方針 B**: 新規ファイル `interfaces-skill-verify-contract.md` を作成
   - **方針 C**: `arch-execution-capability-contract.md` に verify 契約セクションとして追記
3. 判断基準:
   - 仕様書の Single Source of Truth 原則に従い、最も参照されやすい場所に配置する
   - 既存ファイルのサイズが過大にならないか確認する
   - 新規ファイル作成は最終手段（Issue #1738 の方針に従う）

**設計判断の記録**:

| 方針   | メリット                                        | デメリット                         | 推奨度 |
| ------ | ----------------------------------------------- | ---------------------------------- | ------ |
| 方針 A | 既存ファイルに統合、参照が容易                  | ファイルが肥大化する可能性         | 中     |
| 方針 B | 独立したファイルで明確、将来拡張が容易          | 新規ファイル作成（最終手段の原則） | 高     |
| 方針 C | execution-capability 契約と近い位置に配置できる | 既存ファイルの責務が広がりすぎる   | 低     |

**推奨**: 方針 B — verify 契約は独立した関心事であり、Layer 拡張に伴い内容が増大するため、専用ファイルが適切。ただし Phase 1 の調査で既存ファイルに適切な場所が見つかった場合は方針 A を採用する。

**期待される成果物**:

- `outputs/phase-2/design.md` — 追記先決定と設計全体

### タスク2: ドキュメント構成の設計

**目的**: 追記するドキュメントの構造を設計する

**手順**:

1. 以下のセクション構成を設計する:

```markdown
## FR-04 verify 契約 — check ID 体系

### 概要

- verify の目的と Layer 構成の概説

### Layer 命名規則

- L{N}-{NNN} 形式の定義
- Layer 番号の意味（1=構造, 2=コンテンツ, 3=詳細コンテンツ, 4=参照整合性）
- 連番の採番ルール（Layer 内で 001 から連番）
- severity の割り当て方針（error: 必須要件違反, warning: 推奨要件違反）

### Layer 1: 構造検証（Structural Validation）

- check ID テーブル（ID / 検証内容 / severity / 判定基準 / エラーメッセージ）

### Layer 2: コンテンツ検証（Content Validation）

- check ID テーブル

### Layer 3: 詳細コンテンツ検証（Detailed Content Validation）

- check ID テーブル

### Layer 4: 参照整合性・結合検証（Reference Integrity Validation）

- check ID テーブル

### Layer 拡張ガイドライン

- 新規 Layer 追加時の手順
- check ID 追加時の採番ルール
```

2. check ID テーブルのカラム定義:

| カラム名         | 内容                                      |
| ---------------- | ----------------------------------------- |
| check ID         | L{N}-{NNN} 形式の識別子                   |
| 検証内容         | 何を検証するかの日本語説明                |
| severity         | `error`（hard gate）/ `warning`（通過可） |
| 判定基準         | 合格となる条件                            |
| エラーメッセージ | fail 時の出力メッセージ（英語）           |

**期待される成果物**:

- `outputs/phase-2/design.md` に構成設計を含める

### タスク3: 追記量の見積もりとファイルサイズ検証

**目的**: 追記による既存ファイルへの影響を見積もる

**手順**:

1. 追記内容の行数見積もり:
   - 概要セクション: 約 15 行
   - Layer 命名規則: 約 20 行
   - Layer 1 テーブル: 約 15 行（5 checks + ヘッダー）
   - Layer 2 テーブル: 約 17 行（7 checks + ヘッダー）
   - Layer 3 テーブル: 約 14 行（4 checks + ヘッダー）
   - Layer 4 テーブル: 約 13 行（3 checks + ヘッダー）
   - Layer 拡張ガイドライン: 約 15 行
   - **合計: 約 110 行**
2. 追記先ファイルの現在の行数を確認し、肥大化しないか判定する

**期待される成果物**:

- `outputs/phase-2/design.md` に見積もり結果を含める

## 参照資料

| 資料名          | パス                                    | 説明                     |
| --------------- | --------------------------------------- | ------------------------ |
| Phase 1 成果物  | `outputs/phase-1/`                      | 現状調査結果             |
| check ID 棚卸し | `outputs/phase-1/check-id-inventory.md` | 全 check ID の詳細一覧   |
| FR-04 現状調査  | `outputs/phase-1/fr04-current-state.md` | 追記先候補と現状記載状況 |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                                 | パス                                                                                      | 内容                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------- |
| interfaces-agent-sdk-skill               | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`         | スキル関連インターフェース |
| task-workflow-completed（UT-IMP-SDK-06） | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`            | verify 拡張の実装記録      |
| arch-execution-capability-contract       | `.claude/skills/aiworkflow-requirements/references/arch-execution-capability-contract.md` | 実行能力契約の仕様         |

## 統合テスト連携

本タスクは docs-only のため、統合テストは N/A。設計の妥当性は Phase 3 レビューで確認する。

## 成果物

| 成果物 | パス                        | 説明                               |
| ------ | --------------------------- | ---------------------------------- |
| 設計書 | `outputs/phase-2/design.md` | 追記先決定・構成設計・見積もり結果 |

## 完了条件

- [ ] 追記先ファイルが決定されている（方針 A/B/C のいずれかを選択し、理由を記載）
- [ ] ドキュメント構成（セクション構造）が設計されている
- [ ] check ID テーブルのカラム定義が決定されている
- [ ] 追記量の見積もりが完了し、ファイルサイズの影響が評価されている
- [ ] Layer 命名規則のドキュメント構成が設計されている
- [ ] Layer 拡張ガイドラインの構成が設計されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 3: 設計レビュー
