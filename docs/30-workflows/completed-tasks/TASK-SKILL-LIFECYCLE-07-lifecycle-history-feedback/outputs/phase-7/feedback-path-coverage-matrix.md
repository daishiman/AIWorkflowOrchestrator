# フィードバック還流パスカバレッジマトリクス

## メタ情報

| 項目       | 内容                                                                                                                |
| ---------- | ------------------------------------------------------------------------------------------------------------------- |
| Phase      | 7（カバレッジ確認）                                                                                                 |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                                                             |
| 作成日     | 2026-03-16                                                                                                          |
| 入力成果物 | `outputs/phase-4/feedback-loop-test-spec.md`, `outputs/phase-5/feedback-model-impl-spec.md`, `outputs/phase-6/*.md` |

---

## 1. 概要

フィードバック還流の全パスが Phase 4/6 のテストケースでカバーされているかを検証する。Phase 5 `feedback-model-impl-spec.md` で定義された以下のフローを対象とする。

1. フィードバック記録（4種別）
2. ステータス遷移（pending -> applied / dismissed）
3. 還流ルールエンジン（7ルール）
4. 改善優先度計算

---

## 2. フィードバックパス一覧とカバレッジ

### パス定義

10パスを特定し、各パスに対応するテストケースIDを逆引き記載する。

| パスID | パス名                           | 説明                                                         | Phase 4 テストケースID              | Phase 6 テストケースID | カバー状態 |
| ------ | -------------------------------- | ------------------------------------------------------------ | ----------------------------------- | ---------------------- | ---------- |
| FP-01  | auto_metric -> alert             | 自動メトリクスが低下 -> LOW_SUCCESS_RATE_CRITICAL 発火       | FB-REC-001, FB-RL-001~004           | BND-TH-001~002         | カバー済み |
| FP-02  | user_rating -> alert             | ユーザーレーティング低下 -> LOW_USER_RATING 発火             | FB-REC-002, FB-RL-008~010           | BND-TH-003~004         | カバー済み |
| FP-03  | user_text -> accumulate          | テキストフィードバック蓄積 -> TEXT_FEEDBACK_ACCUMULATED 発火 | FB-REC-003, FB-RL-014~017           | -                      | カバー済み |
| FP-04  | improvement_suggestion -> auto   | 高優先度改善提案 -> HIGH_IMPROVEMENT_SUGGESTION 発火         | FB-REC-004, FB-RL-018~020           | -                      | カバー済み |
| FP-05  | pending -> applied               | フィードバックを改善に反映                                   | FB-ST-001, FB-ST-003~005            | -                      | カバー済み |
| FP-06  | pending -> dismissed             | フィードバックを却下                                         | FB-ST-002, FB-ST-003~005            | -                      | カバー済み |
| FP-07  | applied -> pending（不正遷移）   | 終端状態からの巻き戻し拒否                                   | FB-ST-006~007, FB-ST-010            | -                      | カバー済み |
| FP-08  | dismissed -> applied（不正遷移） | 終端状態からの再適用拒否                                     | FB-ST-008~009                       | -                      | カバー済み |
| FP-09  | critical feedback                | critical severity アクション発火 -> hasCriticalFeedback=true | FB-RL-001, FB-RL-021~022, FB-RL-025 | BND-TH-014~015         | カバー済み |
| FP-10  | no feedback（空配列）            | フィードバックなし -> 全ルール非発火                         | FB-RL-026                           | BND-EM-005             | カバー済み |

---

## 3. ステータス遷移マトリクス

### 3-1. 許可遷移

| 遷移元  | 遷移先    | テストケースID           | processedAt 検証 | イミュータブル検証 |
| ------- | --------- | ------------------------ | ---------------- | ------------------ |
| pending | applied   | FB-ST-001, FB-ST-004~005 | FB-ST-004~005    | FB-ST-003          |
| pending | dismissed | FB-ST-002, FB-ST-004~005 | FB-ST-004~005    | FB-ST-003          |

### 3-2. 禁止遷移

| 遷移元    | 遷移先    | テストケースID | エラーコード検証 | メッセージ検証 |
| --------- | --------- | -------------- | ---------------- | -------------- |
| applied   | pending   | FB-ST-006      | FB-ST-006        | FB-ST-010      |
| applied   | dismissed | FB-ST-007      | FB-ST-007        | FB-ST-010      |
| dismissed | pending   | FB-ST-008      | FB-ST-008        | FB-ST-010      |
| dismissed | applied   | FB-ST-009      | FB-ST-009        | FB-ST-010      |

全6パターンの遷移（許可2 + 禁止4）がカバーされている。

---

## 4. 改善優先度計算パスカバレッジ

| パス                                      | テストケースID                   | カバー状態 |
| ----------------------------------------- | -------------------------------- | ---------- |
| 全パラメータ通常値                        | FB-PR-001, FB-PR-002             | カバー済み |
| successRate = null → 0 として扱う         | FB-PR-003                        | カバー済み |
| latestScore = null → 0 として扱う         | FB-PR-003                        | カバー済み |
| feedbackCount = 0 → feedbackComponent = 0 | FB-PR-007, BND-EM-004            | カバー済み |
| feedbackCount = 10 → 頭打ち               | FB-PR-004, FB-PR-006, BND-TH-013 | カバー済み |
| feedbackCount > 10 → 10 と同一結果        | FB-PR-006, BND-TH-013            | カバー済み |
| カスタム重みパラメータ                    | FB-PR-005                        | カバー済み |
| 下限クランプ（0.0未満防止）               | FB-PR-010                        | カバー済み |
| 上限クランプ（1.0超過防止）               | FB-PR-011                        | カバー済み |
| latestScore = 0 → normalizedScore = 0.0   | FB-PR-008                        | カバー済み |
| latestScore = 100 → normalizedScore = 1.0 | FB-PR-009                        | カバー済み |

---

## 5. IPC フィードバック契約カバレッジ

| IPC チャンネル                | 正常系テスト | P42 バリデーション      | エラー系テスト |
| ----------------------------- | ------------ | ----------------------- | -------------- |
| `skill:feedback:submit`       | IPC-FB-001   | IPC-FB-002, REG-P42-009 | IPC-FB-003~005 |
| `skill:feedback:updateStatus` | IPC-FS-001   | IPC-FS-002, REG-P42-009 | IPC-FS-003~005 |
| `skill:getPublishReadiness`   | IPC-PR-001   | IPC-PR-009, REG-P42-010 | IPC-PR-008     |
| `skill:getSkillHealthReport`  | IPC-HR-001   | REG-P42-011             | IPC-HR-005     |

---

## 6. カバレッジ率算出

| 指標                             | 対象パス数  | カバー済みパス数 | カバー率 | 目標 | 判定 |
| -------------------------------- | ----------- | ---------------- | -------- | ---- | ---- |
| フィードバック還流パス（10パス） | 10          | 10               | **100%** | 80%  | PASS |
| ステータス遷移（6パターン）      | 6           | 6                | **100%** | 100% | PASS |
| 改善優先度計算パス               | 11          | 11               | **100%** | 100% | PASS |
| IPC フィードバック契約           | 4チャンネル | 4チャンネル      | **100%** | 100% | PASS |

全指標が目標値を達成しているため、Phase 6 への差し戻しは不要。

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 7_
