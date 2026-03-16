# .claude 正本への反映計画

<!-- Task-06 Phase 5 成果物: システム仕様書への反映計画（Phase 12 で実施） -->

## メタ情報

| 項目             | 内容                        |
| ---------------- | --------------------------- |
| 作成フェーズ     | Phase 5（実装仕様）         |
| 反映実施フェーズ | Phase 12（ドキュメント）    |
| 担当             | Phase 12 エージェント       |
| 参照成果物       | Phase 5 outputs/ 全ファイル |

---

## 反映対象ファイル一覧

| #   | 対象ファイルパス                                                                                                    | 変更種別             | 反映タイミング |
| --- | ------------------------------------------------------------------------------------------------------------------- | -------------------- | -------------- |
| 1   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                                     | セクション追加       | Phase 12       |
| 2   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-details.md`                        | メソッド仕様追加     | Phase 12       |
| 3   | `.claude/skills/aiworkflow-requirements/references/arch-state-management-reference-permissions-import-lifecycle.md` | 型定義・ポリシー追加 | Phase 12       |

---

## ファイル 1: security-skill-execution.md

### 変更箇所

ファイル末尾（または既存の「ToolRisk」セクションが存在する場合はその直後）に以下のセクションを追加する。

### 変更内容

````markdown
## ToolRiskLevel / ToolRiskConfig / TOOL_RISK_CONFIG（Task-06 追加）

### 型定義

正本ファイル: `packages/shared/src/constants/security.ts`

```typescript
export type ToolRiskLevel = "critical" | "high" | "medium" | "low";
```
````

### TOOL_RISK_CONFIG 不変条件

以下の不変条件を変更することは禁止する。変更する場合は Phase 3 設計レビューを再実施すること。

- `critical.allowPermanent === false`（Critical ツールへの恒久許可を禁止）
- `critical.allowApproveOnce === false`（Critical ツールへの一時許可を禁止）
- `critical.autoDenyDefault === true`（Critical ツールはデフォルト自動拒否）

### リスクレベル別の動作設定

| レベル   | allowApproveOnce | allowPermanent | autoDenyDefault | dialogWidth |
| -------- | ---------------- | -------------- | --------------- | ----------- |
| critical | false            | false          | true            | 640px       |
| high     | true             | false          | false           | 480px       |
| medium   | true             | true           | false           | 400px       |
| low      | true             | true           | false           | 400px       |

### 検証

TC-T-001 で不変条件を自動検証する。
`scripts/validate-trust-governance-design.ts` の項目 1 で確認可能。

````

### 反映確認チェックリスト

- [ ] セクション見出しが既存の見出し体系（`##` レベル）に合致すること
- [ ] 不変条件テーブルが正確に転記されていること
- [ ] 正本ファイルパスが `packages/shared/src/constants/security.ts` であること
- [ ] TC-T-001 への参照リンクが含まれていること

---

## ファイル 2: interfaces-agent-sdk-executor-details.md

### 変更箇所

`PermissionStore` または `PermissionService` の既存セクションが存在する場合はその後、存在しない場合はファイル末尾に以下のセクションを追加する。

### 変更内容

```markdown
## PermissionStoreInterface（Task-06 追加）

### インターフェース定義

正本ファイル: `apps/desktop/src/main/permissions/permission-store-interface.ts`

### isToolAllowed の 6 分岐フロー

TC-ST-001 で検証するフロー:

1. entry が存在しない → `false` を返す
2. `expiresAt === undefined` → `true` を返す（無期限有効）
3. `expiresAt < Date.now()` → electron-store から削除して `false` を返す（失効）
4. `expiresAt >= Date.now()` → `true` を返す（有効期限内）
5. `skillName` が定義されており呼び出し時の `skillName` と不一致 → `false` を返す
6. 全条件クリア → `true` を返す

### メソッド一覧

| メソッド名             | 引数                                 | 戻り値               | 説明                                                      |
| ---------------------- | ------------------------------------ | -------------------- | --------------------------------------------------------- |
| `isToolAllowed`        | `toolName: string, skillName?: string` | `boolean`          | 指定ツールが許可済みかを 6 分岐フローで判定する           |
| `allowTool`            | `entry: AllowedToolEntryV2`          | `void`               | ツールを許可リストに追加する（同一 toolName は上書き）    |
| `revokeTool`           | `toolName: string`                   | `void`               | 指定ツールの許可を取り消す                                |
| `revokeAll`            | なし                                 | `void`               | 全ての許可エントリを削除する                              |
| `revokeSessionEntries` | `sessionId: string`                  | `void`               | セッション中の approve_once エントリを全て削除する        |
| `getAllowedTools`       | なし                                 | `AllowedToolEntryV2[]` | 現在有効な許可エントリを全て返す                        |

### 関連定数

- `PERMISSION_HISTORY_MAX_ENTRIES = 1000`（承認履歴の最大保持件数）
````

### 反映確認チェックリスト

- [ ] isToolAllowed の 6 分岐フローが全て記載されていること
- [ ] メソッド一覧テーブルが 6 メソッド全て含むこと
- [ ] TC-ST-001 への参照が含まれていること
- [ ] 正本ファイルパスが `apps/desktop/src/main/permissions/permission-store-interface.ts` であること

---

## ファイル 3: arch-state-management-reference-permissions-import-lifecycle.md

### 変更箇所

`AllowedToolEntry` の既存セクションが存在する場合はその直後、存在しない場合はファイル末尾に以下を追加する。

### 変更内容

```markdown
## AllowedToolEntryV2 型定義と失効ポリシー（Task-06 追加）

### 型定義

正本ファイル: `apps/desktop/src/main/permissions/permission-store-interface.ts`

`AllowedToolEntryV2` は既存の `AllowedToolEntry` を extends する拡張型。

### 後方互換性ルール

既存の `AllowedToolEntry` 型（`expiresAt` なし）のエントリが electron-store に存在する場合:

- `expiresAt` が `undefined` → 無期限有効として扱う
- `skillName` が `undefined` → 全スキルに適用として扱う
- `expiryPolicy` が `undefined` → `"permanent"` として扱う

TypeScript の構造的部分型により、`AllowedToolEntry` は `AllowedToolEntryV2` に代入可能（TC-T-004 で検証）。

### 失効ポリシー一覧

| ポリシー  | expiresAt 計算式        | electron-store 書込み | 説明                 |
| --------- | ----------------------- | --------------------- | -------------------- |
| session   | undefined               | しない                | セッション終了で削除 |
| time_24h  | allowedAt + 86_400_000  | する                  | 24時間後に失効       |
| time_7d   | allowedAt + 604_800_000 | する                  | 7日後に失効          |
| permanent | undefined               | する                  | 明示取り消しまで有効 |

### 計算関数

`calcExpiresAt(policy, allowedAt)`: 失効ポリシーと allowedAt から `expiresAt` を計算する。
TC-ST-002 で全ポリシーの計算正確性を検証する。
```

### 反映確認チェックリスト

- [ ] AllowedToolEntry との後方互換性ルールが 3 点全て記載されていること
- [ ] 失効ポリシーテーブルが 4 ポリシー全て含むこと
- [ ] calcExpiresAt への参照が含まれていること
- [ ] TC-T-004 / TC-ST-002 への参照が含まれていること
- [ ] 正本ファイルパスが `apps/desktop/src/main/permissions/permission-store-interface.ts` であること

---

## 反映実施時の注意事項

### P1/P25 対策（LOGS.md 2ファイル更新）

Phase 12 では以下 2 ファイルを同時に更新すること:

1. `.claude/skills/aiworkflow-requirements/LOGS.md`
2. `.claude/skills/task-specification-creator/LOGS.md`

片方の更新漏れが発生しやすいため、Phase 12 チェックリストで「2ファイル確認済み」を明示する。

### P2 対策（topic-map.md 再生成）

上記 3 ファイルの更新後、以下を実行して topic-map.md を再生成すること:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

セクションの追加があるため、再生成が必須。

### P3 対策（未タスク管理の 3 ステップ）

Phase 12 で未タスクを検出した場合:

1. `.claude/skills/task-specification-creator/tasks/unassigned-task/` に指示書を作成する
2. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` の残課題テーブルに登録する
3. 関連仕様書（上記 3 ファイルのうち該当するもの）に参照リンクを追加する
