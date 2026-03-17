# 同時操作競合テスト仕様書

## メタ情報

| 項目        | 内容                                                               |
| ----------- | ------------------------------------------------------------------ |
| 文書        | Phase 6 - テスト拡充 成果物 4/5                                    |
| タスクID    | TASK-SKILL-LIFECYCLE-08                                            |
| 作成日      | 2026-03-17                                                         |
| 設計参照    | `outputs/phase-2/distribution-operations-design.md`                |
| Phase 4参照 | `outputs/phase-4/distribution-test-spec.md`                        |
| 受入基準    | AC-4（Skill Center フロー）、AC-2（互換性チェック）                |
| テスト対象  | import-update 同時実行・fork-deprecation 競合・share-teamId 無効化 |

---

## 1. 目的

Phase 4 の配布テスト仕様（DT-01〜DT-28）は、各操作の単独実行における正常系・異常系を検証している。

本仕様書は Phase 4 でカバーされていない以下の競合シナリオを追加する。

- **import-update 同時実行**: update 進行中に import が発生した場合のメタデータ整合性保証
- **pendingApproval 中の import ブロック**: 手動承認待ち状態での import 拒否
- **fork-deprecation 競合**: deprecate 中/remove 後の fork 操作の成否
- **share-teamId 無効化**: 有効な ShareLink の teamId が無効化された場合のエラー処理

---

## 2. テストケース一覧テーブル

| ID     | テスト名                                              | 入力                                                                       | 期待結果                                                                   | 対応AC |
| ------ | ----------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------ |
| COC-01 | import-update 同時実行: update 完了後に import が実行 | update 進行中のスキルに importSkill() を実行                               | import は update 完了後に実行され、メタデータが破損しない                  | AC-4   |
| COC-02 | import-update 同時実行: メタデータ整合性確認          | COC-01 完了後にスキルのメタデータを取得                                    | version が update 後の値と一致し、name/description に破損がない            | AC-4   |
| COC-03 | pendingApproval 中の import ブロック                  | status="pending-approval" のスキルに importSkill() を実行                  | `{ success: false, error: { code: "SKILL_DIST_IMPORT_BLOCKED_PENDING" } }` | AC-4   |
| COC-04 | fork-deprecation 競合: deprecate 中の fork は成功     | deprecate 済み（grace period 内）のスキルに forkSkill() を実行             | `{ success: true, data: { newSkillId, parentRef } }`                       | AC-4   |
| COC-05 | fork-deprecation 競合: fork の parentRef が保持される | COC-04 で fork されたスキルの parentRef を確認                             | `data.parentRef` が deprecate 中の元スキル ID と一致する                   | AC-4   |
| COC-06 | fork-remove 競合: remove 後の fork はエラー           | remove 済みのスキルに forkSkill() を実行                                   | `{ success: false, error: { code: "SKILL_DIST_NOT_FOUND_ERROR" } }`        | AC-2   |
| COC-07 | fork-remove 競合: エラーコードが Business Error 範囲  | COC-06 のエラーコードを確認                                                | エラーコード範囲: 2000-2999                                                | AC-2   |
| COC-08 | share-teamId 無効化: 有効 ShareLink の teamId 無効化  | 有効な ShareLink が存在する状態で teamId を無効化し、その ShareLink を使用 | `{ success: false, error: { code: "SKILL_DIST_TEAM_AUTH_ERROR" } }`        | AC-4   |
| COC-09 | share-teamId 無効化: 無効化後の再 share もエラー      | teamId が無効化された状態で shareSkill() を再実行                          | `{ success: false, error: { code: "SKILL_DIST_TEAM_AUTH_ERROR" } }`        | AC-4   |
| COC-10 | share-teamId 無効化: エラーレスポンスが P60 準拠      | COC-08/COC-09 のレスポンス形式を確認                                       | `{ success: false, error: { code: string, message: string } }` 形式        | AC-4   |

---

## 3. テストケース詳細仕様

### COC-01: import-update 同時実行 - update 完了後に import が実行

**前提条件**:

- スキル "target-skill"（version: "1.0.0"）が Skill Center に公開済み
- update 操作が進行中（version: "1.0.0" → "1.1.0"、compatible 判定で自動承認）

**実行手順**:

1. `SkillRegistryService.update(skillId, newVersion)` を開始する（非同期、進行中）
2. update 処理中に `SkillDistributionService.importSkill(sourceUrl)` を呼び出す
3. 両操作の完了を待つ

**期待される結果**:

- update が正常完了する
- import は update 完了後に実行される（排他制御により直列化）
- import されたスキルの version が update 後の "1.1.0" である

**アサーション**:

```typescript
expect(updateResult.success).toBe(true);
expect(importResult.success).toBe(true);
expect(importResult.data.skillId).not.toBe("");
```

---

### COC-02: import-update 同時実行 - メタデータ整合性確認

**前提条件**:

- COC-01 が完了済み

**実行手順**:

1. import されたスキルのメタデータを取得する

**期待される結果**:

- `version` が "1.1.0"（update 後の値）と一致する
- `name` フィールドが非空文字列である
- `description` フィールドが非空文字列である
- メタデータに破損（undefined フィールド、型不整合）がない

**アサーション**:

```typescript
expect(metadata.version).toBe("1.1.0");
expect(typeof metadata.name).toBe("string");
expect(metadata.name.length).toBeGreaterThan(0);
expect(typeof metadata.description).toBe("string");
expect(metadata.description.length).toBeGreaterThan(0);
```

---

### COC-03: pendingApproval 中の import ブロック

**前提条件**:

- スキル "reviewed-skill" が update 済みだが手動承認待ち（status: "pending-approval"）
- update の compatibilityResult.level が "breaking" で手動承認が必要

**実行手順**:

1. `SkillDistributionService.importSkill(sourceUrl, { autoResolveDependencies: false })` を呼び出す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"SKILL_DIST_IMPORT_BLOCKED_PENDING"` である（エラーコード範囲: 2000-2999、Business Error）
- `error.message` に承認待ち状態であることを示す情報が含まれる

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("SKILL_DIST_IMPORT_BLOCKED_PENDING");
expect(typeof result.error.message).toBe("string");
expect(result.error.message.length).toBeGreaterThan(0);
```

---

### COC-04: fork-deprecation 競合 - deprecate 中の fork は成功

**前提条件**:

- スキル "base-lib"（skillId: "skill-base-lib-001"）が deprecate 済み（grace period 内、20 日経過）
- grace period は 30 日

**実行手順**:

1. `SkillDistributionService.forkSkill("skill-base-lib-001", "my-fork-lib")` を呼び出す

**期待される結果**:

- `success` が `true` である（deprecation は fork を妨げない）
- `data.newSkillId` が非空文字列である
- `data.parentRef` が `"skill-base-lib-001"` と一致する
- `data.forkedAt` が ISO 8601 形式である

**アサーション**:

```typescript
expect(result.success).toBe(true);
expect(result.data.newSkillId).not.toBe("");
expect(result.data.parentRef).toBe("skill-base-lib-001");
expect(result.data.forkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
```

---

### COC-05: fork-deprecation 競合 - fork の parentRef が保持される

**前提条件**:

- COC-04 で fork が成功済み

**実行手順**:

1. fork されたスキル（newSkillId）のメタデータを取得する
2. parentRef フィールドを確認する

**期待される結果**:

- `parentRef` が deprecate 中の元スキル ID（"skill-base-lib-001"）と一致する
- fork されたスキルの visibility が "local" である（fork は local として作成される）

**アサーション**:

```typescript
expect(forkedSkill.parentRef).toBe("skill-base-lib-001");
expect(forkedSkill.visibility).toBe("local");
```

---

### COC-06: fork-remove 競合 - remove 後の fork はエラー

**前提条件**:

- スキル "removed-skill"（skillId: "skill-removed-001"）が remove 済み（grace period 経過後に削除完了）

**実行手順**:

1. `SkillDistributionService.forkSkill("skill-removed-001", "fork-attempt")` を呼び出す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"SKILL_DIST_NOT_FOUND_ERROR"` である

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("SKILL_DIST_NOT_FOUND_ERROR");
```

---

### COC-07: fork-remove 競合 - エラーコードが Business Error 範囲

**前提条件**:

- COC-06 と同一

**実行手順**:

1. COC-06 のエラーレスポンスを確認する

**期待される結果**:

- エラーコードが Business Error 範囲（2000-2999）に属する
- レスポンス形式が P60 準拠である（`{ success: false, error: { code, message } }`）

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error).toBeDefined();
expect(typeof result.error.code).toBe("string");
expect(typeof result.error.message).toBe("string");
```

---

### COC-08: share-teamId 無効化 - 有効 ShareLink の teamId 無効化

**前提条件**:

- スキル "shared-tool" が teamId="team-alpha-001" に share 済み
- ShareLink（url, token）が有効
- その後 teamId="team-alpha-001" が無効化される（チーム解散、メンバー除外）

**実行手順**:

1. 無効化された teamId の ShareLink を使用してスキルにアクセスする

**期待される結果**:

- `success` が `false` である
- `error.code` が `"SKILL_DIST_TEAM_AUTH_ERROR"` である（エラーコード範囲: 2000-2999、Business Error）

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("SKILL_DIST_TEAM_AUTH_ERROR");
```

---

### COC-09: share-teamId 無効化 - 無効化後の再 share もエラー

**前提条件**:

- COC-08 と同一（teamId が無効化済み）

**実行手順**:

1. `SkillDistributionService.shareSkill(skillId, { teamId: "team-alpha-001", expiresIn: 86400 })` を呼び出す

**期待される結果**:

- `success` が `false` である
- `error.code` が `"SKILL_DIST_TEAM_AUTH_ERROR"` である

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(result.error.code).toBe("SKILL_DIST_TEAM_AUTH_ERROR");
```

---

### COC-10: share-teamId 無効化 - エラーレスポンスが P60 準拠

**前提条件**:

- COC-08 または COC-09 のエラーレスポンス

**実行手順**:

1. エラーレスポンスの構造を検証する

**期待される結果**:

- レスポンスが `{ success: false, error: { code: string, message: string } }` 形式である
- `error.code` が文字列型である
- `error.message` が文字列型かつ非空である

**アサーション**:

```typescript
expect(result.success).toBe(false);
expect(typeof result.error.code).toBe("string");
expect(typeof result.error.message).toBe("string");
expect(result.error.message.length).toBeGreaterThan(0);
```

---

## 4. Phase 4 との差分

| 観点                       | Phase 4 カバー範囲                             | Phase 6 追加範囲                                                 |
| -------------------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| import 操作の競合          | DT-01〜DT-08（単独実行の正常系・異常系）       | COC-01〜COC-03（update 進行中/pendingApproval 中の import 動作） |
| fork 操作の競合            | DT-15〜DT-20（単独実行の正常系・権限エラー）   | COC-04〜COC-07（deprecate 中/remove 後の fork 成否）             |
| share の teamId 無効化     | DT-21〜DT-28（正常共有・バリデーションエラー） | COC-08〜COC-10（有効 ShareLink の teamId 無効化後のエラー処理）  |
| メタデータ整合性確認       | なし                                           | COC-02（同時操作後のメタデータ破損がないことの確認）             |
| P60 準拠レスポンス形式検証 | DT テスト内で暗黙的に検証                      | COC-10（競合エラーでも P60 形式が維持されることの明示的検証）    |

---

## 5. Phase 7 カバレッジ確認への引き継ぎ

- COC-01〜COC-02: `importSkill()` 内の排他制御パス（update 進行中の待機分岐）
- COC-03: `importSkill()` 内の pendingApproval ステータスチェック分岐
- COC-04〜COC-05: `forkSkill()` 内の deprecation ステータスチェック分岐（grace period 内は fork 許可）
- COC-06〜COC-07: `forkSkill()` 内の存在確認分岐（remove 済みスキルへの fork 拒否）
- COC-08〜COC-10: `shareSkill()` / ShareLink アクセス時の teamId 有効性チェック分岐
- Phase 7 では COC-01〜COC-03 の排他制御パスが Branch Coverage に反映されていることを重点確認する
