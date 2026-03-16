# 重複防止テスト仕様書

## メタ情報

| 項目       | 内容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| Phase      | 6（テスト拡充）                                                              |
| タスクID   | TASK-SKILL-LIFECYCLE-07                                                      |
| 作成日     | 2026-03-16                                                                   |
| 入力成果物 | `outputs/phase-4/*.md`, `outputs/phase-5/*.md`                               |
| テスト状態 | Red（Phase 5 実装後に Green へ移行）                                         |
| 実装先     | `packages/shared/src/skill/lifecycle/__tests__/duplicate-prevention.test.ts` |

---

## 1. 目的

Phase 4 テスト仕様では正常系・異常系・境界値を網羅したが、以下の観点が未カバーであった。

- 同一IDイベントの重複記録防止
- 短時間内の同一内容イベントのデバウンス
- 並行記録時の整合性保証

本仕様書でこれらを補完し、`lifecycleHistorySlice.recordEvent` およびイベントファクトリの堅牢性を検証する。

---

## 2. テストケース一覧

### 2-1. ID重複検出テスト

| テストID   | テストケース                                         | 入力                                                                    | 期待結果                                                                     | 分類   |
| ---------- | ---------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| DUP-ID-001 | 同一idのイベントを2回記録した場合、2件目が拒否される | `recordEvent(event1)` 後に `recordEvent({...event1})` を実行（同一 id） | 2件目の recordEvent がエラーを返す、または State の events に1件のみ存在する | 異常系 |
| DUP-ID-002 | 拒否時にエラーレスポンスが返される                   | 同一 id のイベントを2回記録                                             | エラーオブジェクトに `code: "DUPLICATE_EVENT"` と `message` が含まれる       | 異常系 |
| DUP-ID-003 | id が異なれば同一内容でも両方記録される              | 同一 skillId・eventType・timestamp だが id が異なる2イベント            | State の events に2件とも存在する                                            | 正常系 |
| DUP-ID-004 | UUID v4 ファクトリが毎回一意な id を生成する         | `createLifecycleEvent()` を100回連続呼び出し                            | 100件の id が全て一意（`new Set(ids).size === 100`）                         | 正常系 |

### 2-2. 内容重複デバウンステスト

| テストID   | テストケース                                                          | 入力                                                                                                                 | 期待結果                                                                     | 分類   |
| ---------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------ |
| DUP-DB-001 | 同一 skillId + eventType で timestamp が1秒以内の場合デバウンスされる | event1: `{skillId:"s1", eventType:"skill:executed", timestamp:"2026-03-16T07:00:00.000Z"}`, event2: 同条件 + 500ms後 | event2 がデバウンスにより記録されない（または警告ログが出力される）          | 異常系 |
| DUP-DB-002 | 同一 skillId + eventType で timestamp が1秒以上離れていれば別イベント | event1 と同条件だが timestamp が 1001ms 後                                                                           | 両方とも正常に記録される                                                     | 正常系 |
| DUP-DB-003 | 同一 skillId で異なる eventType は1秒以内でもデバウンスされない       | event1: `eventType:"skill:executed"`, event2: `eventType:"skill:execution_succeeded"`, 同一 skillId, 500ms 差        | 両方とも正常に記録される（eventType が異なるため）                           | 正常系 |
| DUP-DB-004 | 異なる skillId で同一 eventType は1秒以内でもデバウンスされない       | event1: `skillId:"s1"`, event2: `skillId:"s2"`, 同一 eventType, 500ms 差                                             | 両方とも正常に記録される（skillId が異なるため）                             | 正常系 |
| DUP-DB-005 | デバウンス判定後にキャッシュが正しく更新される                        | event1 記録後 1001ms 待機、event2 記録、500ms 待機、event3（event2 と同条件）記録                                    | event1, event2 は記録され、event3 は event2 とのデバウンスにより記録されない | 正常系 |

### 2-3. 並行記録テスト

| テストID   | テストケース                                                       | 入力                                                                         | 期待結果                                                          | 分類   |
| ---------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------ |
| DUP-CC-001 | 異なる skillId の同時記録が両方正常に完了する                      | `Promise.all([recordEvent(eventA), recordEvent(eventB)])`, skillId が異なる  | State の events に eventA, eventB の両方が存在する                | 正常系 |
| DUP-CC-002 | 同一 skillId の異なる eventType の同時記録が整合性を保つ           | `Promise.all([recordEvent(executed), recordEvent(evaluated)])`, 同一 skillId | State の events に両方が存在し、aggregateViews が正しく更新される | 正常系 |
| DUP-CC-003 | 10件の同時記録で全件が正しく State に反映される                    | `Promise.all(events.map(recordEvent))`, 10件の異なるイベント                 | State の events.length >= 10（重複なし前提で10件）                | 正常系 |
| DUP-CC-004 | 同時記録中に1000件上限を超えた場合、古いイベントが正しく削除される | State に990件存在する状態で、20件を同時に recordEvent                        | State の events.length === 1000、最古の10件が削除されている       | 境界値 |

---

## 3. テスト実装方針

### 3-1. テストファイル構成

```
packages/shared/src/skill/lifecycle/__tests__/
  duplicate-prevention.test.ts  # DUP-ID-*, DUP-DB-*, DUP-CC-*
```

### 3-2. 既知パターン対策

| パターン | 対策                                                                                       |
| -------- | ------------------------------------------------------------------------------------------ |
| P9       | 各テストで `beforeEach` により Store 状態をリセット（テスト間の状態リーク防止）            |
| P13      | デバウンステストでは `vi.useFakeTimers()` + `vi.advanceTimersByTime()` で1ステップずつ進行 |
| P42      | skillId は `toSkillName()` 経由で生成（3段バリデーション済み）                             |

### 3-3. テストデータ依存

- `createMockLifecycleEvent()` ファクトリ（`test-data-factory-definition.md` 参照）を使用
- デバウンステストでは `timestamp` を明示指定して決定論的に検証

---

## 4. テストケース件数サマリー

| カテゴリ                 | 件数   |
| ------------------------ | ------ |
| ID重複検出テスト         | 4      |
| 内容重複デバウンステスト | 5      |
| 並行記録テスト           | 4      |
| **合計**                 | **13** |

---

_作成日: 2026-03-16_
_タスクID: TASK-SKILL-LIFECYCLE-07 / Phase 6_
