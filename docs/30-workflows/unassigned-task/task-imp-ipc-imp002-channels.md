# IMP-002チャネル本体実装 - タスク指示書

## メタ情報

```yaml
issue_number: 656
```

## メタ情報

| 項目         | 内容                                                  |
| ------------ | ----------------------------------------------------- |
| タスクID     | task-imp-ipc-imp002-channels-001                      |
| タスク名     | IMP-002チャネル本体実装（settings/permissions/cache） |
| 分類         | 改善                                                  |
| 対象機能     | Skill IPC Handler（skillHandlers.ts）                 |
| 優先度       | 中                                                    |
| 見積もり規模 | 中規模                                                |
| ステータス   | 未実施                                                |
| 発見元       | TASK-8C-A Phase 12（IPC統合テスト実装時）             |
| 発見日       | 2026-02-02                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-8C-A（IPC統合テスト）の実装時に、IMP-002で定義された9つのIPCチャネル（skill:settings:\*、skill:permissions:\*、skill:cache:\*）が`skillHandlers.ts`に未実装であることが判明した。テスト側では`invokeOptionalHandler`ヘルパーを使用した条件付きテスト（TC-13〜TC-22）が準備済みだが、ハンドラー未登録パスのみが実行されている。

### 1.2 問題点・課題

- `skill:settings:get` / `skill:settings:update`: スキルごとの設定管理が利用不可
- `skill:permissions:get` / `skill:permissions:grant` / `skill:permissions:revoke`: スキル権限の動的管理が利用不可
- `skill:cache:get` / `skill:cache:set` / `skill:cache:invalidate`: スキルキャッシュ管理が利用不可
- 合計9チャネルのハンドラーが未実装のため、Renderer側からこれらの機能を利用できない

### 1.3 放置した場合の影響

- スキル設定のカスタマイズ機能が利用不可のまま
- スキル権限の細粒度制御ができない
- キャッシュによるパフォーマンス最適化が行えない
- TASK-8C-Aの統合テスト10件（TC-13〜TC-22）が本来のパスで実行されない

---

## 2. 何を達成するか（What）

### 2.1 目的

IMP-002で定義された9つのIPCチャネルのハンドラーを`skillHandlers.ts`に実装し、SkillServiceに対応メソッドを追加する。

### 2.2 最終ゴール

- 9チャネル全てのIPCハンドラーが`registerSkillHandlers`で登録される
- SkillServiceに設定/権限/キャッシュ管理メソッドが追加される
- TASK-8C-AのTC-13〜TC-22がハンドラー登録パスで実行される
- 全テストがPASSする

### 2.3 スコープ

#### 含むもの

- `skillHandlers.ts`への9チャネルハンドラー追加
- `SkillService`への対応メソッド追加（get/update settings、get/grant/revoke permissions、get/set/invalidate cache）
- 既存統合テスト（TC-13〜TC-22）の正常パス通過確認
- `interfaces-agent-sdk-skill.md`へのチャネル仕様追加

#### 含まないもの

- 設定/権限/キャッシュのUI実装
- 永続化レイヤーの実装（メモリ管理のみ）
- E2Eテストの実装

### 2.4 成果物

| 成果物                 | パス                                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| ハンドラー実装         | `apps/desktop/src/main/ipc/skillHandlers.ts`                                      |
| Serviceメソッド追加    | `apps/desktop/src/main/services/skill/SkillService.ts`                            |
| 型定義（必要に応じて） | `packages/shared/src/types/skill.ts`                                              |
| 仕様書更新             | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-8C-A完了（統合テストフレームワーク準備済み）
- `skillHandlers.ts`の既存ハンドラー構造を理解していること

### 3.2 依存タスク

| タスクID  | 状態 | 内容                              |
| --------- | ---- | --------------------------------- |
| TASK-8C-A | 完了 | IPC統合テスト（テスト側準備済み） |
| TASK-4-2  | 完了 | IPCハンドラー基盤実装             |

### 3.3 必要な知識

- Electron IPC（ipcMain.handle/invoke）
- SkillServiceのアーキテクチャ
- OperationResult<T>型のレスポンスパターン
- validateIpcSenderによるセキュリティ検証

### 3.4 システム仕様書参照

本タスクの実装に必要なシステム仕様書の参照先一覧。

| 仕様書                                                                                                                                        | セクション                       | 参照理由                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| [architecture-implementation-patterns.md](../../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) | IPC通信設計原則                  | Whitelist方式、型安全性、エラーハンドリング                       |
| [architecture-implementation-patterns.md](../../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) | IPC通信テストパターン            | Handler Map方式、SkillService Partial Mock、invokeOptionalHandler |
| [interfaces-agent-sdk-skill.md](../../../.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md)                     | IPCチャンネル（スキル管理）      | 既存8チャネルの仕様・OperationResult型定義                        |
| [interfaces-agent-sdk-skill.md](../../../.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md)                     | テストアーキテクチャ             | テスト構成、ヘルパー関数、テストデータ定数                        |
| [security-skill-ipc.md](../../../.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md)                                     | パストラバーサル防止・sender検証 | validateIpcSenderの仕様                                           |

### 3.5 推奨アプローチ

既存の`skill:list-available`等のハンドラーパターンに従い、9チャネルを追加する。各ハンドラーは`validateIpcSender`によるセキュリティ検証→SkillServiceメソッド呼び出し→OperationResult返却の流れで実装する。TASK-8C-Aで確立されたHandler Map方式テストパターンにより、実装後は既存テスト（TC-13〜TC-22）が自動的に正常パスを通過する。

---

## 4. 実行手順

### Phase構成

Phase 1-13の標準フローに従って実装する。

### 主要実装ステップ

1. `SkillService`に設定/権限/キャッシュ管理メソッドを追加
2. `skillHandlers.ts`の`registerSkillHandlers`に9チャネルのハンドラーを追加
3. `unregisterSkillHandlers`の解除リストに9チャネルを追加
4. 既存テスト（TC-13〜TC-22）が正常パスで通過することを確認
5. 必要に応じて追加テストケースを作成

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `skill:settings:get` ハンドラーが登録・動作する
- [ ] `skill:settings:update` ハンドラーが登録・動作する
- [ ] `skill:permissions:get` ハンドラーが登録・動作する
- [ ] `skill:permissions:grant` ハンドラーが登録・動作する
- [ ] `skill:permissions:revoke` ハンドラーが登録・動作する
- [ ] `skill:cache:get` ハンドラーが登録・動作する
- [ ] `skill:cache:set` ハンドラーが登録・動作する
- [ ] `skill:cache:invalidate` ハンドラーが登録・動作する
- [ ] 全ハンドラーがvalidateIpcSenderによるセキュリティ検証を実施する

### 品質要件

- [ ] TC-13〜TC-22がハンドラー登録パスでPASSする
- [ ] 行カバレッジ90%以上
- [ ] 型安全性が維持されている

### ドキュメント要件

- [ ] `interfaces-agent-sdk-skill.md`にチャネル仕様が追加されている
- [ ] 実装ガイドが作成されている

---

## 6. 検証方法

### テストケース

TASK-8C-Aで作成済みのTC-13〜TC-22が本タスクの検証に使用可能：

| TC    | チャネル                 | 検証内容                 |
| ----- | ------------------------ | ------------------------ |
| TC-13 | skill:settings:get       | 設定取得の正常系         |
| TC-14 | skill:settings:get       | 存在しないスキル設定     |
| TC-15 | skill:settings:update    | 設定更新の正常系         |
| TC-16 | skill:settings:update    | バリデーションエラー     |
| TC-17 | skill:permissions:get    | 権限取得の正常系         |
| TC-18 | skill:permissions:grant  | 権限付与の正常系         |
| TC-19 | skill:permissions:revoke | 権限取消の正常系         |
| TC-20 | skill:cache:get          | キャッシュ取得の正常系   |
| TC-21 | skill:cache:set          | キャッシュ設定の正常系   |
| TC-22 | skill:cache:invalidate   | キャッシュ無効化の正常系 |

### 検証手順

```bash
pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts
```

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                       |
| -------------------------- | ------ | -------- | ------------------------------------------ |
| SkillService APIの設計変更 | 中     | 低       | 既存パターンに従った最小限の実装           |
| 永続化なしによるデータ消失 | 低     | 中       | メモリ管理を明示し、永続化は別タスクで対応 |
| 既存テストとの競合         | 低     | 低       | invokeOptionalHandler方式が互換性を保証    |

---

## 8. 参照情報

### 関連ドキュメント

- [TASK-8C-A 実装ガイド](../TASK-8C-A/outputs/phase-12/implementation-guide.md)
- [interfaces-agent-sdk-skill.md](../../.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md)
- [security-skill-ipc.md](../../.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md)

### 参考資料

- `skillHandlers.ts` 既存ハンドラー実装パターン
- `SkillService` クラス定義

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 3 M-01: IMP-002定義チャネル（settings/permissions/cache）のハンドラーが未実装
Phase 10 M-01: TC-13〜TC-22はhandler未登録パスのみ実行
```

### 補足事項

- TASK-8C-Aの`invokeOptionalHandler`ヘルパーにより、ハンドラー追加後も既存テストとの互換性が保証される
- テストデータ定数（MOCK_SETTINGS、MOCK_PERMISSIONS、MOCK_CACHE_DATA）はTASK-8C-Aで定義済み
