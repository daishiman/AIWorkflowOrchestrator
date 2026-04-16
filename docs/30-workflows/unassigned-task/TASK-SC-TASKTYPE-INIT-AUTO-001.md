# taskType 自動初期化標準化 - タスク指示書

```yaml
issue_number: 2205
```

## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | TASK-SC-TASKTYPE-INIT-AUTO-001                                  |
| タスク名     | init-artifacts.js でのtaskType自動判別・初期化標準化            |
| 分類         | 改善                                                            |
| 対象機能     | task-specification-creator / タスク種別管理                     |
| 優先度       | 低                                                              |
| 見積もり規模 | 小規模                                                          |
| ステータス   | 未実施                                                          |
| 発見元       | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 Phase 11/12 苦戦箇所 |
| 発見日       | 2026-04-16                                                      |
| Issue番号    | #2205                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`task-specification-creator` スキルで生成されるタスクの `taskType` フィールドが
`init-artifacts.js` によって自動設定されない。NON_VISUALタスク（UIを持たない実装タスク等）では
Phase 11 の手動テスト時にスクリーンショット要件チェックをスキップするために
手動で `taskType: "NON_VISUAL"` を設定する必要があった。

### 1.2 問題点・課題

- `artifacts.json` の `taskType` が未設定の場合、`validate-phase-output.js` が screenshot を要求する
- NON_VISUAL タスク（コード実装・スクリプト修正・CI設定等）でもスクリーンショット添付を求められる
- 手動で taskType を設定する手順がドキュメント化されておらず、設定漏れが発生しやすい

### 1.3 発見時の状況（苦戦箇所）

TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 は純粋なコード実装タスク（UIなし）だったが、
Phase 11 の validator が screenshot を要求してきた。`init-artifacts.js` を確認したところ
taskType フィールドの自動設定がなく、手動で `"NON_VISUAL"` を設定することで回避した。
同様の問題が他のNON_VISUALタスクでも繰り返し発生している可能性が高い。

---

## 2. 何を達成するか（What）

### 2.1 目的

`init-artifacts.js` がタスク種別（UI変更か否か）を自動判別し、
`artifacts.json` に適切な `taskType` を設定することで、手動設定の手間をなくす。

### 2.2 スコープ

#### 含むもの

- `init-artifacts.js` へのtaskType自動判別ロジック追加
- タスクの命名規則・フォルダ名からNON_VISUAL判定する簡易ヒューリスティック
- `generate-index.js` との整合性確認

#### 含まないもの

- taskType の多値対応（VISUAL / NON_VISUAL / HYBRID 等の拡張）
- 既存タスクの一括マイグレーション

---

## 3. 実行手順

| Phase | 内容                       | 目安 |
| ----- | -------------------------- | ---- |
| 1     | 自動判別ルールの設計       | 0.5h |
| 2     | init-artifacts.js への実装 | 1h   |
| 3     | テスト追加・既存テスト確認 | 0.5h |

---

## 4. 完了条件チェックリスト

- [ ] `init-artifacts.js` がタスク種別を自動判別して `taskType` を設定する
- [ ] NON_VISUAL タスクで Phase 11 の screenshot 要件チェックが自動スキップされる
- [ ] 既存の `generate-index.test.mjs` が PASS する
- [ ] 新規テストが追加されている

---

## 5. 参照情報

- `.claude/skills/task-specification-creator/scripts/init-artifacts.js`
- `.claude/skills/task-specification-creator/scripts/validate-phase-output.js`
- `.claude/skills/task-specification-creator/scripts/generate-index.js`
- `.claude/skills/task-specification-creator/scripts/__tests__/generate-index.test.mjs`

---

## 6. 備考

TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 の Phase 11/12 で発見された苦戦箇所から派生した改善タスク。
`validate-phase-output.js` の NON_VISUAL チェック緩和（本タスクで既に実施）とセットで実施すると効果的。
