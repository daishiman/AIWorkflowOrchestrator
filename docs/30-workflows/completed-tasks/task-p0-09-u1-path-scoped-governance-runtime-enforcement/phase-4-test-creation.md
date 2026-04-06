# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 値                                         |
| ---------- | ------------------------------------------ |
| Phase      | 4                                          |
| Phase名    | テスト作成（TDD Red）                      |
| 前提Phase  | Phase 3                                    |
| 後続Phase  | Phase 5                                    |
| ステータス | 完了                                       |
| 作成日     | 2026-04-06                                 |
| 機能名     | path-scoped-governance-runtime-enforcement |

---

## 目的

失敗するテストを先に書き（TDD Red）、実装の完了基準を明確化する。

---

## 事前確認【必須】

**Phase 4 着手前に既存テストが PASS していることを確認する**:

```bash
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/
```

**命名規則の整合確認（Phase 1-3 で確認した内容）**:

- テスト命名: `TC-PATH-XX` 形式
- describe ブロック: `createExecuteGovernanceCanUseTool` 等のメソッド名
- ファイル配置: `apps/desktop/src/main/services/runtime/__tests__/governance/`

---

## 実行タスク

### タスク1: TC-PATH-01〜TC-PATH-03 の実装

**目的**: 基本的な path-scoped enforcement テストを実装する

**テストケース**:
| テストID | 説明 | 入力 | 期待値 |
| ---------- | --------------------------------------------- | ---------------------------------------- | ------ |
| TC-PATH-01 | skill root 外の Write → `deny` が返る | `file_path` = skill root 外のパス | deny |
| TC-PATH-02 | skill root 内の Write → `allow` が返る | `file_path` = skill root 内のパス | allow |
| TC-PATH-03 | context なし（input にパスがない）→ tool判定 | `input` = `{}` （パスなし） | tool-level判定 |

**実行手順**:

1. `__tests__/governance/` 内に `path-scoped-enforcement.test.ts` を作成する（または既存ファイルに追記）
2. TC-PATH-01 を実装し、失敗することを確認する
3. TC-PATH-02 を実装し、失敗することを確認する
4. TC-PATH-03 を実装し、失敗することを確認する

**TDD 検証コマンド**:

```bash
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/path-scoped-enforcement.test.ts
```

**期待される成果物**:

- 失敗する TC-PATH-01〜TC-PATH-03 のテストコード

### タスク2: 既存 90 件テストの継続 PASS 確認

**目的**: 新規テスト追加後も既存テストが PASS することを確認する

**実行手順**:

1. 既存 90 件テストを実行する
2. 新規テストファイル追加による影響がないことを確認する（新規テストは失敗、既存は PASS）

```bash
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/
```

**期待される成果物**:

- 既存 90 件 PASS の確認記録

---

## TDD サイクル確認

```bash
# テスト実行コマンド（path-scoped テストのみ）
cd apps/desktop && npx vitest run src/main/services/runtime/__tests__/governance/path-scoped-enforcement.test.ts
```

**確認項目**:

- [ ] TC-PATH-01〜TC-PATH-03 のテストが失敗することを確認（Red状態）
- [ ] 既存 90 件テストは引き続き PASS であることを確認

---

## 参照資料

| 参照資料                 | パス                                                                                | 内容             |
| ------------------------ | ----------------------------------------------------------------------------------- | ---------------- |
| Phase 2 設計             | `outputs/phase-2/design.md`                                                         | テストケース設計 |
| Phase 3 レビュー結果     | `outputs/phase-3/design-review-result.md`                                           | レビュー通過確認 |
| 既存 governance テスト   | `apps/desktop/src/main/services/runtime/__tests__/governance/`                      | 参照・整合確認   |
| CanUseToolContext 型定義 | `apps/desktop/src/main/services/runtime/governance/SkillCreatorPermissionPolicy.ts` | 型定義           |

---

## 成果物

| 成果物                          | パス                                                                                          | 内容                      |
| ------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------- |
| path-scoped-enforcement.test.ts | `apps/desktop/src/main/services/runtime/__tests__/governance/path-scoped-enforcement.test.ts` | TC-PATH-01〜03 失敗テスト |

---

## 統合テスト連携

統合テストシナリオ（path-scoped deny の全カテゴリ）を作成する。

---

## 完了条件

- [ ] Phase 4 着手前に既存 90 件テストが PASS していることを確認済み
- [ ] TC-PATH-01 が実装されており、失敗することを確認済み（skill root 外 Write → deny）
- [ ] TC-PATH-02 が実装されており、失敗することを確認済み（skill root 内 Write → allow）
- [ ] TC-PATH-03 が実装されており、失敗することを確認済み（context なし → tool-level判定）
- [ ] 既存 90 件テストは引き続き PASS であることを確認済み
- [ ] テスト命名が Phase 1-3 で確認した命名規則と整合している
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3 が完了（設計レビュー PASS）していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-5-implementation.md`
