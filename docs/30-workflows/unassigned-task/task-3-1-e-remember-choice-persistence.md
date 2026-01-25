# rememberChoice機能永続化実装 - タスク指示書

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-3-1-E                               |
| タスク名     | rememberChoice機能の永続化実装           |
| 分類         | 新機能                                   |
| 対象機能     | スキル実行権限確認の選択記憶機能         |
| 優先度       | 低                                       |
| 見積もり規模 | 小規模                                   |
| ステータス   | 未実施                                   |
| 発見元       | TASK-3-1-C（PermissionRequest Hook統合） |
| 発見日       | 2026-01-25                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-1-C（PermissionRequest Hook統合）で、PermissionResponse型に`rememberChoice`フィールドが定義されている。このフィールドは「次回から確認しない」オプションをサポートするためのものだが、現在は永続化機能が未実装であり、アプリ再起動後に選択が失われる。

### 1.2 問題点・課題

- `rememberChoice: true`を送信してもアプリ再起動後に設定が失われる
- 毎回同じツールの権限確認ダイアログが表示される
- ユーザー体験の低下（頻繁な確認による作業中断）

### 1.3 放置した場合の影響

- ユーザーが同じツールに対して何度も許可を求められる
- スキル実行のワークフローが煩雑になる
- 「次回から確認しない」オプションが機能しないため、UIの期待と実際の動作が乖離

---

## 2. 何を達成するか（What）

### 2.1 目的

ユーザーが「次回から確認しない」を選択した権限設定を永続化し、アプリ再起動後も設定を維持する。

### 2.2 最終ゴール

- 「次回から確認しない」チェックボックスで許可したツールは、次回から自動許可
- 設定がelectron-storeに永続化される
- 設定画面から許可済みツールの確認・削除が可能

### 2.3 スコープ

#### 含むもの

- PermissionStore（永続化ストア）の実装
- SkillExecutorへの永続化連携追加
- 設定画面への「許可済みツール管理」セクション追加
- ユニットテスト・統合テスト

#### 含まないもの

- 時間ベースの有効期限設定
- ツール引数ごとの細粒度設定
- 権限レベル（読み取り/書き込み等）の区別

### 2.4 成果物

| 成果物               | パス                                                                     |
| -------------------- | ------------------------------------------------------------------------ |
| PermissionStore      | `apps/desktop/src/main/services/skill/PermissionStore.ts`                |
| SkillExecutor更新    | `apps/desktop/src/main/services/skill/SkillExecutor.ts`（修正）          |
| 設定UIコンポーネント | `apps/desktop/src/renderer/components/PermissionSettings.tsx`            |
| テストファイル       | `apps/desktop/src/main/services/skill/__tests__/PermissionStore.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-3-1-C（PermissionRequest Hook統合）が完了していること
- TASK-3-1-D（Renderer側権限ダイアログUI実装）が完了していること
- `rememberChoice`チェックボックスがダイアログUIに実装されていること

### 3.2 依存タスク

| タスク                                  | ステータス |
| --------------------------------------- | ---------- |
| TASK-3-1-C (PermissionRequest Hook統合) | 完了       |
| TASK-3-1-D (Renderer側権限ダイアログUI) | 未実施     |

### 3.3 必要な知識

- TypeScript
- Electron（electron-store）
- React（設定画面UI）
- Zustand状態管理

### 3.4 推奨アプローチ

1. PermissionStoreクラスを作成（electron-store使用）
2. SkillExecutorのsendPermissionRequest前に永続化チェックを追加
3. handlePermissionResponseでrememberChoice=trueの場合に保存
4. 設定画面に「許可済みツール」一覧と削除機能を追加

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 目的                       |
| ----- | ---------------- | -------------------------- |
| 1     | 要件定義         | ストア設計・データ構造定義 |
| 2     | 設計             | PermissionStore詳細設計    |
| 4     | テスト作成       | ユニットテスト作成         |
| 5     | 実装             | PermissionStore・連携実装  |
| 7     | カバレッジ確認   | テスト実行・カバレッジ確認 |
| 11    | 手動テスト検証   | 再起動後の設定維持確認     |
| 12    | ドキュメント更新 | システム仕様書更新         |

### Phase 5: 実装

#### 目的

PermissionStoreを実装し、SkillExecutorと連携させる。

#### 手順

1. `PermissionStore.ts`を作成
   - `isToolAllowed(toolName: string): boolean`
   - `allowTool(toolName: string): void`
   - `revokeTool(toolName: string): void`
   - `getAllowedTools(): string[]`
2. SkillExecutor.sendPermissionRequestを修正
   - 呼び出し前に`isToolAllowed()`をチェック
   - trueの場合はダイアログをスキップして自動許可
3. SkillExecutor.handlePermissionResponseを修正
   - `rememberChoice=true && approved=true`の場合に`allowTool()`を呼び出し
4. テストを実行し全件PASSを確認

#### 完了条件

- rememberChoice=trueで許可したツールが永続化される
- アプリ再起動後も設定が維持される
- 設定画面から許可済みツールを確認・削除できる

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] PermissionStoreが作成されている
- [ ] 「次回から確認しない」で許可したツールが永続化される
- [ ] アプリ再起動後も設定が維持される
- [ ] 許可済みツールは権限ダイアログをスキップする
- [ ] 設定画面から許可済みツールを削除できる

### 品質要件

- [ ] ユニットテストカバレッジ80%以上
- [ ] TypeScript strict PASS
- [ ] ESLint PASS

### ドキュメント要件

- [ ] システム仕様書（interfaces-agent-sdk.md）が更新されている
- [ ] PermissionStore APIが文書化されている

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容               | 期待結果                                       |
| ------ | ------------------------ | ---------------------------------------------- |
| TC-001 | rememberChoice保存       | allowTool()で永続化される                      |
| TC-002 | 自動許可チェック         | 許可済みツールでisToolAllowed()=true           |
| TC-003 | ダイアログスキップ       | 許可済みツールでダイアログが表示されない       |
| TC-004 | 設定削除                 | revokeTool()後にisToolAllowed()=false          |
| TC-005 | アプリ再起動後の設定維持 | 再起動後も許可済みツールがisToolAllowed()=true |

### 統合テスト

| テスト項目               | 結果   | 備考                           |
| ------------------------ | ------ | ------------------------------ |
| 権限許可→再起動→自動許可 | 未実施 | E2Eテストで検証                |
| 設定削除→再許可要求      | 未実施 | 設定画面からの削除後の動作確認 |

---

## 7. リスクと対策

| リスク               | 影響度 | 発生確率 | 対策                                         |
| -------------------- | ------ | -------- | -------------------------------------------- |
| 設定ファイル破損     | 中     | 低       | 読み込みエラー時はデフォルト値で初期化       |
| セキュリティ上の懸念 | 高     | 低       | 危険なツールは自動許可対象外にするオプション |
| 設定移行（将来）     | 低     | 中       | バージョン付きスキーマ設計                   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                     | パス                                                                   |
| -------------------------------- | ---------------------------------------------------------------------- |
| PermissionRequest Hook実装ガイド | `docs/guides/permission-request-hook.md`                               |
| TASK-3-1-Cタスク仕様書           | `docs/30-workflows/task-3-1-c-permission-request/`                     |
| TASK-3-1-D（依存タスク）         | `docs/30-workflows/unassigned-task/task-3-1-d-permission-dialog-ui.md` |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                         | 内容                                   |
| ------------------------- | ---------------------------------------------------------------------------- | -------------------------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | PermissionResponse型（rememberChoice） |
| アーキテクチャパターン    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | PermissionResolverパターン             |

---

## 9. 備考

### PermissionResponse型定義（参照）

```typescript
interface PermissionResponse {
  requestId: string;
  approved: boolean;
  rememberChoice?: boolean; // 本タスクで永続化を実装
  rejectReason?: string;
}
```

### 想定ストアスキーマ

```typescript
interface PermissionStoreSchema {
  version: number;
  allowedTools: string[]; // 許可済みツール名リスト
  updatedAt: string; // 最終更新日時（ISO8601）
}
```

### 補足事項

- TASK-3-1-D完了後に着手可能
- 優先度は低いが、ユーザー体験向上に貢献
- セキュリティ上の考慮：Bashツールなど危険なツールは自動許可対象外にするオプションを検討
