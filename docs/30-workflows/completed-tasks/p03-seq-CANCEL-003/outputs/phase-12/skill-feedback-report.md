# スキルフィードバックレポート - TASK-SW-CANCEL-003

## メタ情報

| 項目     | 内容               |
| -------- | ------------------ |
| タスクID | TASK-SW-CANCEL-003 |
| 作成日   | 2026-04-19         |

## task-specification-creator への改善提案

### 指摘1: 既実装 verification モードの欠如

**問題**: 本 workflow は初版で「新規実装」テンプレートとして生成されたが、実際には既実装が存在していた。その結果、Phase 4/5 が「RED 作成」「新規実装」として記述されており、「差分確認」への読み替えが必要だった。

**改善提案**: `task-specification-creator` に以下の分岐を追加する:

- `implementation_mode: "new"` — 通常の RED/GREEN サイクル
- `implementation_mode: "verify_existing"` — 既実装差分確認モード（Phase 4 = targeted test 設計、Phase 5 = diff check）

### 指摘2: NON_VISUAL 既実装 verification モードの template 不備

**問題**: NON_VISUAL かつ既実装確認の task では、Phase 11 の「screenshot 不要」を自動的に指定できると良い。現状は手動で「NON_VISUAL のため screenshot 不要」と記載する必要がある。

**改善提案**: `taskType: "NON_VISUAL"` かつ `implementation_mode: "verify_existing"` の組み合わせでは、Phase 11 の primary evidence を自動的に `outputs/phase-11/{TASK-ID}-manual-test-report.md` に設定するロジックを追加する。

### 指摘3: cancel chain の分割タスク管理

**問題**: CANCEL-001〜004 が cancel chain を構成しているが、各 task の仕様書に「CANCEL-003 単体では E2E 完了にならない」という明示が不足していた。

**改善提案**: chain task（複数 task が連携する場合）では、各 task の `scope` セクションに「chain における位置と完了定義」を明記するフィールドを追加する。

## 改善不要な点

- 4条件レビュー（gate 設計）は実用的で有効だった
- `NON_VISUAL` / `VISUAL` の分岐は適切に機能した
- canonical 6成果物の構造は Phase 12 の close-out として機能した
