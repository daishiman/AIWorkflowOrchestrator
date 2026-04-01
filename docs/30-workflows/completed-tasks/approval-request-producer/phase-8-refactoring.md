# Phase 8: リファクタリング

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 8                         |
| 機能名 | approval-request-producer |
| 作成日 | 2026-04-01                |

## 目的

Phase 5〜7 の実装・テスト完了後に、コードの品質・可読性・保守性を確認する。producer 本体の変更は `HooksFactory.ts` に局所化されているため、大規模なリファクタリングは不要と判断しているが、不要な import・残存 TODO コメント・SRP 違反がないことを確認する。

---

## 実行タスク

- 不要 import チェック: Phase 5 実装で追加した import が全て使用されているか確認
- TODO(human) コメント残存チェック: 実装後に TODO が残っていないか確認
- SRP 維持確認: `HooksFactory.ts` の責務が単一であることを確認
- 重複コード確認: `pushApprovalRequest` 呼び出しが二重になっていないか確認
- Phase 9 開始条件: 本 Phase PASS 後のみ Phase 9 へ進む gate を明記

---

## Step 1: 不要 import チェック

### 確認コマンド

```bash
# Phase 5 で追加した import の使用状況確認
grep -n "^import" apps/desktop/src/main/services/agent/HooksFactory.ts

# uuidv4 の使用箇所確認
grep -n "uuidv4" apps/desktop/src/main/services/agent/HooksFactory.ts

# pushApprovalRequest の使用箇所確認
grep -n "pushApprovalRequest" apps/desktop/src/main/services/agent/HooksFactory.ts
```

### 判定基準

| 確認項目                                                 | 合格基準                          |
| -------------------------------------------------------- | --------------------------------- |
| `uuidv4` import が使用されている                         | `createPreToolUseHook()` 内で使用 |
| `pushApprovalRequest` import が使用されている            | `createPreToolUseHook()` 内で使用 |
| Phase 5 で新規追加した import が存在する場合、全て使用中 | 未使用 import ゼロ                |

---

## Step 2: TODO(human) コメント残存チェック

### 確認コマンド

```bash
# HooksFactory.ts 内の TODO(human) 残存確認
grep -n "TODO(human)" apps/desktop/src/main/services/agent/HooksFactory.ts

# より広範な TODO チェック
grep -n "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/services/agent/HooksFactory.ts
```

### 判定基準

| 確認項目                          | 合格基準                                                  |
| --------------------------------- | --------------------------------------------------------- |
| `TODO(human)` が残存していない    | 0 件（Phase 5 で実装コードに置換済みであること）          |
| `FIXME` / `HACK` が残存していない | 0 件（またはフォローアップ Issue に紐付けられていること） |

---

## Step 3: SRP 維持確認

### 確認観点

`HooksFactory.ts` の単一責務:

- **責務**: `SDKHooks` オブジェクトを生成し、危険コマンド検出時に IPC を通じて承認リクエストを送信する
- **SRP 違反チェック**: 承認ロジック（`approvalGate` の実装）が `HooksFactory.ts` に混入していないか確認

```bash
# SkillCreatorHooksFactory.ts が変更されていないことを確認
git diff HEAD -- apps/desktop/src/main/services/agent/SkillCreatorHooksFactory.ts

# approvalHandlers.ts が変更されていないことを確認
git diff HEAD -- apps/desktop/src/main/ipc/approvalHandlers.ts
```

### 判定基準

| 確認項目                                                        | 合格基準                      |
| --------------------------------------------------------------- | ----------------------------- |
| `SkillCreatorHooksFactory.ts` が変更されていない                | `git diff` が空               |
| `approvalHandlers.ts` が変更されていない                        | `git diff` が空               |
| `HooksFactory.ts` 内に承認承認ロジック（wait/poll）が混入しない | `approvalGate` 呼び出しがない |

---

## Step 4: 重複コード確認

### 確認コマンド

```bash
# pushApprovalRequest の呼び出し箇所が1箇所であることを確認
grep -c "pushApprovalRequest" apps/desktop/src/main/services/agent/HooksFactory.ts
```

### 判定基準

| 確認項目                                    | 合格基準               |
| ------------------------------------------- | ---------------------- |
| `pushApprovalRequest` 呼び出しが1箇所のみ   | `grep -c` の結果が `1` |
| `operationId` 生成（`uuidv4()`）が1箇所のみ | 二重 UUID 生成なし     |

---

## リファクタリング不要判定

producer 本体の変更は `HooksFactory.ts` の `for...of` ループ内に局所化されているため、以下の判断とする:

| リファクタリング候補                             | 判断   | 理由                                                                                                      |
| ------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------- |
| `pushApprovalRequest` 呼び出しを別メソッドに抽出 | 不要   | 1 箇所のみの呼び出しであり、抽出による可読性向上が見込めない                                              |
| `operationId` 生成ロジックの共通化               | 不要   | `PermissionRequest` Hook でも同様の `uuidv4()` 呼び出しが存在するが、両者は独立した用途であり共通化は過剰 |
| import 整理                                      | 要確認 | 未使用 import が存在する場合のみ削除                                                                      |

---

## 参照資料

| 資料名                    | パス                                                   | 説明                                 |
| ------------------------- | ------------------------------------------------------ | ------------------------------------ |
| phase-5-implementation.md | `./phase-5-implementation.md`                          | 実装内容（Phase 5 で作成）           |
| phase-7-coverage-check.md | `./phase-7-coverage-check.md`                          | カバレッジ確認結果（Phase 7 で確認） |
| HooksFactory.ts           | `apps/desktop/src/main/services/agent/HooksFactory.ts` | リファクタリング対象                 |

---

## 成果物

| 成果物               | パス                     | 説明       |
| -------------------- | ------------------------ | ---------- |
| リファクタリング結果 | `phase-8-refactoring.md` | 本ファイル |

---

## 完了条件

- [ ] 不要 import が存在しないことが確認されている
- [ ] `TODO(human)` コメントが残存していないことが確認されている
- [ ] SRP 違反がないことが確認されている（`SkillCreatorHooksFactory.ts` / `approvalHandlers.ts` 変更なし）
- [ ] `pushApprovalRequest` 呼び出しが重複していないことが確認されている
- [ ] リファクタリング不要判定の根拠が明記されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

---

## Phase 9 開始条件

**Phase 9 への進行は本 Phase（リファクタリング）が PASS 判定を得た後のみ許可される。**

| 条件                                   | 状態   |
| -------------------------------------- | ------ |
| 不要 import ゼロが確認されている       | 要確認 |
| `TODO(human)` 残存ゼロが確認されている | 要確認 |
| SRP 維持が確認されている               | 要確認 |
| 重複コードがないことが確認されている   | 要確認 |

## 次の Phase

Phase 9: 品質保証 → [phase-9-quality-assurance.md](phase-9-quality-assurance.md)

## 統合テスト連携

- Phase 5 で導入した producer 接続が `HooksFactory.ts` の単一責務を壊していないか回帰確認する
- `HooksFactory.producer.test.ts` と `HooksFactory.test.ts` の両方で重複呼び出しがないことを確認する
