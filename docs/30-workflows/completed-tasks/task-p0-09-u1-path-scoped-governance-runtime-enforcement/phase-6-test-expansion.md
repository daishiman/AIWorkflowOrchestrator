# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 6                                          |
| Phase名    | テスト拡充                                 |
| 前提Phase  | Phase 5                                    |
| 後続Phase  | Phase 7                                    |
| ステータス | 完了                                       |
| 作成日     | 2026-04-06                                 |
| 機能名     | path-scoped-governance-runtime-enforcement |

---

## 目的

エッジケースを追加してカバレッジを向上させ、実装の堅牢性を確認する。

---

## 実行タスク

### タスク1: TC-PATH-04〜TC-PATH-06 の実装

**目的**: エッジケースのテストを追加する

**テストケース**:
| テストID | 説明 | 期待値 |
| ---------- | -------------------------------------------------- | -------------------------- |
| TC-PATH-04 | `input.path` キー（`file_path` なし）からの抽出 | deny/allow（パスに依存） |
| TC-PATH-05 | `improve` phase での path-scoped deny | deny |
| TC-PATH-06 | skill root が未設定（empty string）の場合の動作 | context なし扱い（後方互換）|

**実行手順**:

1. TC-PATH-04: `input = { path: "/outside/skill/root/file.ts" }` で `deny` が返ることを確認するテストを追加
2. TC-PATH-05: `improve` phase での同様の deny を確認するテストを追加（Phase 5 の実装に依存）
3. TC-PATH-06: `skillRoot` が空文字列の場合に context なし扱いになることを確認するテストを追加

**期待される成果物**:

- TC-PATH-04〜TC-PATH-06 の実装

### タスク2: 回帰ガードテストの確認

**目的**: 既存 90 件テストが全 PASS を維持していることを確認する

**実行手順**:

1. 全 governance テストを実行する
2. 新規追加テスト（TC-PATH-01〜TC-PATH-06）が全 PASS することを確認する
3. 既存 90 件テストが全 PASS することを確認する

```bash
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/
```

**期待される成果物**:

- テスト結果記録

### タスク3: `improve` phase テストの完整性確認

**目的**: `improve` phase の path-scoped deny が適切にテストされていることを確認する

**実行手順**:

1. `improve` phase 用のテストが TC-PATH-05 に含まれているか確認する
2. `execute` と `improve` で同一の path-scoped logic が動作することを確認する
3. 不足があれば追加する

**期待される成果物**:

- `improve` phase テスト完整性の確認記録

---

## 参照資料

| 参照資料       | パス                                                                                          | 内容             |
| -------------- | --------------------------------------------------------------------------------------------- | ---------------- |
| Phase 5 成果物 | `outputs/phase-5/test-results.txt`                                                            | 実装確認         |
| Phase 4 テスト | `apps/desktop/src/main/services/runtime/__tests__/governance/path-scoped-enforcement.test.ts` | 既存テスト       |
| Phase 2 設計   | `outputs/phase-2/design.md`                                                                   | テストケース設計 |

---

## 成果物

| 成果物                          | パス                                                                                          | 内容                   |
| ------------------------------- | --------------------------------------------------------------------------------------------- | ---------------------- |
| path-scoped-enforcement.test.ts | `apps/desktop/src/main/services/runtime/__tests__/governance/path-scoped-enforcement.test.ts` | TC-PATH-04〜06 追加    |
| テスト結果記録                  | `outputs/phase-6/test-results.txt`                                                            | 全テスト PASS 確認記録 |

---

## 統合テスト連携

統合テストの拡充（全カテゴリのカバレッジ向上：path-scoped enforcement の全パス）を行う。

---

## 完了条件

- [ ] TC-PATH-04 が実装され PASS している（`input.path` キーからの抽出）
- [ ] TC-PATH-05 が実装され PASS している（`improve` phase での deny）
- [ ] TC-PATH-06 が実装され PASS している（`skillRoot` 空文字列の後方互換）
- [ ] 既存 90 件テストが全 PASS している
- [ ] `outputs/phase-6/test-results.txt` が作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 5 が完了していること（Green状態達成）
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-7-coverage-check.md`
