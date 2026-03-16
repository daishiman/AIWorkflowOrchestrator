# 未検証組合せ一覧

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| タスクID   | TASK-SKILL-LIFECYCLE-06                             |
| Phase      | 7 - カバレッジ確認                                  |
| 作成日     | 2026-03-16                                          |
| 参照成果物 | `outputs/phase-4/decision-table-risk-permission.md` |
|            | `outputs/phase-6/tc-expiry-risk-matrix.md`          |
|            | `outputs/phase-7/coverage-report.md`                |

---

## 概要

Phase 4 + Phase 6 のテストケース（計 32 件 / サブケース 90 件）に対して、
`decision-table-risk-permission.md` Section 7（失効ポリシー × リスクレベル 16 組合せ）の
網羅状況を確認した結果、以下の組合せが未検証または処理対象として特定された。

---

## 未検証・処理対象組合せ一覧

| #   | 組合せ               | カテゴリ      | 処理方針            | 理由                                                                                                                                    |
| --- | -------------------- | ------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | critical × time_7d   | 失効 × リスク | 到達不可（除外）    | critical は全承認ボタン非表示（autoDenyDefault=true + allowApproveOnce=false）。時間制ポリシー選択 UI が存在しない                      |
| 2   | critical × time_24h  | 失効 × リスク | 到達不可（除外）    | 同上。TC-ST-008b で「ダイアログ自体が表示されないため time_24h 選択不可」として明示的に確認済み                                         |
| 3   | critical × session   | 失効 × リスク | 到達不可（除外）    | 同上。TC-ST-008a で autoDenyDefault による全ボタン非表示を確認済み                                                                      |
| 4   | critical × permanent | 失効 × リスク | 到達不可（除外）    | 同上。TC-ST-008c で allowPermanent=false による恒久許可ボタン非表示を確認済み                                                           |
| 5   | high × time_24h      | 失効 × リスク | 未タスク化（MINOR） | high は「今回のみ」（session/approved_once）のみ表示が現設計の想定用途。time_24h 選択 UI が現設計では存在しないが、将来拡張の可能性あり |
| 6   | high × time_7d       | 失効 × リスク | 未タスク化（MINOR） | 同上。さらに decision-table Section 7 では high × time_7d は「不可」と定義されている（allowPermanent=false の帰結）                     |
| 7   | medium × session     | 失効 × リスク | 代替確認済み        | TC-ST-002a（session ポリシーの expiresAt=undefined）で計算ロジックを検証済み。session の expiresAt 計算はリスクレベル非依存             |
| 8   | low × session        | 失効 × リスク | 代替確認済み        | 同上                                                                                                                                    |
| 9   | low × time_24h       | 失効 × リスク | 代替確認済み        | TC-ST-008h（medium × time_24h）と同一計算ロジック（expiresAt = allowedAt + 86400000）。計算式はリスクレベル非依存                       |
| 10  | medium × time_7d     | 失効 × リスク | 代替確認済み        | TC-ST-008i（low × time_7d）と同一計算ロジック（expiresAt = allowedAt + 604800000）。計算式はリスクレベル非依存                          |

---

## 分類別サマリー

| 分類                | 件数 | 説明                                                                  |
| ------------------- | ---- | --------------------------------------------------------------------- |
| 到達不可（除外）    | 4件  | critical 行全セル。設計上の制約により到達不可能                       |
| 未タスク化（MINOR） | 2件  | high × time_24h、high × time_7d。現設計では非到達だが将来拡張時に必要 |
| 代替確認済み        | 4件  | 同一計算ロジックをカバーする別テストで間接検証済み                    |

---

## 到達不可判定の根拠詳細

### critical 行（4件）が到達不可である理由

`decision-table-risk-permission.md` Section 7 に以下の定義がある:

> criticalが全ポリシー不可の根拠: `allowApproveOnce === false`（デフォルト）かつ `allowPermanent === false`

これは以下の連鎖で UI 到達が不可能であることを意味する:

1. `autoDenyDefault === true` → PermissionDialog 自体が表示されない
2. PermissionDialog が表示されない → 失効ポリシー選択 UI が存在しない
3. 失効ポリシー選択 UI が存在しない → いかなる失効ポリシーも選択不可能

したがって critical × （session / time_24h / time_7d / permanent）はすべて「到達不可」として除外する。

---

## 未タスク化対象の詳細

### high × time_24h（UT-TASK06-HIGH-TIME24H）

**現状の設計根拠**:

`decision-table-risk-permission.md` Section 7 によると high × time_24h は「可」と定義されているが、
Section 5 の承認ボタン表示条件では high は `allowApproveOnce === true` かつ `allowPermanent === false` のため
「今回のみ許可（session）」のみが表示される。time_24h ポリシーを選択する UI パスが現設計に存在しない。

**未タスク化する理由**:

- 設計上「可」と明記されているため、将来の UI 拡張でアクセス可能になる可能性がある
- 計算ロジック（expiresAt = allowedAt + 86400000）は medium × time_24h（TC-ST-008h）で確認済みであり、
  リスクレベルを変えた場合も同一ロジックが適用される想定だが、型レベルの制約の有無が未確認

**未タスクID**: UT-TASK06-HIGH-TIME24H

### high × time_7d（UT-TASK06-HIGH-TIME7D）

**現状の設計根拠**:

`decision-table-risk-permission.md` Section 7 によると high × time_7d は「不可」と定義されている。
`allowPermanent === false` の帰結として、7日間の有期承認（permanent 寄りの長期ポリシー）が禁止される。

**未タスク化する理由**:

- 「不可」と定義されているため、将来的に `TOOL_RISK_CONFIG.high` の制約が緩和された場合に必要
- 「不可」の UI レベルでの強制（ボタン非表示等）を直接テストするケースが現時点では存在しない
- 型レベルでの禁止保証を追加テストで確認する価値がある

**未タスクID**: UT-TASK06-HIGH-TIME7D

---

## 代替確認の詳細

### medium × session（代替: TC-ST-002a）

TC-ST-002a は session ポリシーの expiresAt 計算を検証する:

- session ポリシー選択時に `expiresAt === undefined` が設定されること
- この計算ロジックは `ExpiryPolicyCalculator` に実装されており、リスクレベルを引数に取らない
- medium × session と low × session の両方が同一コードパスを通るため代替確認とみなす

### low × time_24h（代替: TC-ST-008h）

TC-ST-008h は medium × time_24h の計算を検証する:

- `expiresAt = allowedAt + 86400000` の計算式を確認
- `ExpiryPolicyCalculator.calculate(policy: "time_24h")` の実装はリスクレベル非依存
- low × time_24h も同一コードパスを通るため代替確認とみなす

### medium × time_7d（代替: TC-ST-008i）

TC-ST-008i は low × time_7d の計算を検証する:

- `expiresAt = allowedAt + 604800000` の計算式を確認
- 同様にリスクレベル非依存の計算ロジックを適用
- medium × time_7d も同一コードパスを通るため代替確認とみなす

---

## 関連成果物パス

| 成果物種別                         | パス                                                |
| ---------------------------------- | --------------------------------------------------- |
| 総合カバレッジレポート             | `outputs/phase-7/coverage-report.md`                |
| カバレッジギャップ（未タスク一覧） | `outputs/phase-7/coverage-gaps.md`                  |
| デシジョンテーブル（設計根拠）     | `outputs/phase-4/decision-table-risk-permission.md` |
| 失効×リスク組合せテスト仕様        | `outputs/phase-6/tc-expiry-risk-matrix.md`          |
