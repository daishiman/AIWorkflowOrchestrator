# [#602] "[task-imp-permission-history-001] Permission要求履歴トラッキングUI"

## メタ情報

```yaml
task_id: task-imp-permission-history-001
task_name: Permission要求履歴トラッキングUI
category: 改善
target_feature: PermissionSettings、PermissionStore
priority: 高
scale: 中規模
status: 未実施
source_phase: システム仕様書分析（ui-ux-settings.md と security-skill-execution.md）
created_date: 2026-01-31
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-permission-history-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ui-ux-settings.mdの「ツール許可設定（Permission Settings）」セクションでは、許可済みツール一覧の表示と個別取り消し機能が定義されている。しかし、権限要求の履歴（いつ、どのツールが、どの引数で要求され、ユーザーがどう判断したか）を記録・表示する仕組みがない。security-skill-execution.mdではPermission Store（権限永続化）が定義されているが、許可/拒否の履歴ログは含まれていない。

### 1.2 問題点・課題

- ユーザーが過去の権限判断を振り返る手段がない
- セキュリティ監査時に「いつ何を許可したか」を確認できない
- 誤って「常に許可」を設定した場合に、その判断時の文脈を確認できない
- 権限取り消しの判断材料（頻度・パターン）が不足している

### 1.3 放置した場合の影響

- セキュリティインシデント発生時の原因調査が困難になる
- ユーザーが自身の権限許可パターンを把握できず、セキュリティ意識が向上しない
- 権限管理がブラックボックス化し、不要な永続許可が蓄積する

---

## 2. 何を達成するか（What）

### 2.1 目的

PermissionSettingsに権限要求履歴パネルを追加し、過去の権限判断を時系列で確認可能にする。

### 2.2 最終ゴール

- PermissionSettingsに「権限履歴」タブまたはセクションが表示される
- 各エントリにタイムスタンプ・ツール名・引数要約・判断結果（許可/拒否/1回許可）が含まれる
- 履歴のフィルタリング（ツール別・判断別・期間別）が可能

### 2.3 スコープ

#### 含むもの

- 権限要求履歴のデータモデル定義
- PermissionStoreへの履歴記録ロジック追加
- PermissionSettings UIへの履歴表示パネル追加
- フィルタリング機能（ツール名、判断結果）
- ユニットテスト・コンポーネントテスト

#### 含まないもの

- 履歴のエクスポート機能（別タスク: task-imp-permission-export-import-001）
- 履歴に基づく自動推奨ロジック
- 外部ログサービスとの連携
- Main Processでのログファイル出力

### 2.4 成果物

| 成果物                 | パス                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------- |
| 履歴データモデル       | `apps/desktop/src/renderer/components/skill/permissionHistory.ts`                      |
| PermissionStore拡張    | 既存PermissionStoreに履歴記録メソッド追加                                              |
| 履歴表示コンポーネント | `apps/desktop/src/renderer/components/skill/PermissionHistoryPanel.tsx`                |
| ユニットテスト         | `apps/desktop/src/renderer/components/skill/__tests__/permissionHistory.test.ts`       |
| コンポーネントテスト   | `apps/desktop/src/renderer/components/skill/__tests__/PermissionHistoryPanel.test.tsx` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- task-imp-permission-readable-ui-001が完了していること
- PermissionStoreが実装されていること（security-skill-execution.md準拠）

### 3.2 依存タスク

| タスクID                            | 状態 | 依存内容                                     |
| ----------------------------------- | ---- | -------------------------------------------- |
| task-imp-permission-readable-ui-001 | 完了 | PermissionDialog・permissionDescriptions基盤 |

### 3.3 必要な知識

- Zustand状態管理パターン（Store-direct）
- React コンポーネント設計（Atomic Design）
- PermissionStore永続化メカニズム
- ui-ux-settings.md PermissionSettings仕様

### 3.4 推奨アプローチ

1. 履歴エントリの型定義（PermissionHistoryEntry: timestamp, toolName, args, decision, sessionId）
2. PermissionStoreに`addHistoryEntry()`メソッドを追加
3. PermissionDialogの応答処理で自動的に履歴記録
4. PermissionSettingsに履歴パネルを追加（仮想スクロール推奨）
5. フィルタリングはクライアントサイドで実装

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 内容                                 |
| ----- | ---------------- | ------------------------------------ |
| 1-3   | 要件定義・設計   | データモデル設計、UIワイヤーフレーム |
| 4     | テスト作成       | TDD: 履歴記録・表示・フィルタテスト  |
| 5     | 実装             | permissionHistory.ts、HistoryPanel   |
| 6-9   | テスト拡充・品質 | カバレッジ確認、パフォーマンステスト |
| 10-12 | レビュー・文書化 | 最終レビュー、仕様書更新             |

### Phase 4-5: テスト・実装

#### 目的

履歴データモデルと表示パネルを実装する。

#### 手順

1. `PermissionHistoryEntry`型を定義（timestamp, toolName, argsSnapshot, decision, sessionContext）
2. PermissionStoreに`history: PermissionHistoryEntry[]`と操作メソッドを追加
3. PermissionDialogの`respondToSkillPermission`呼び出し時に自動記録
4. `PermissionHistoryPanel`コンポーネントを作成（時系列リスト表示）
5. フィルタ用UIを追加（ドロップダウン: ツール名、判断結果）

#### 成果物

- 履歴データモデル、PermissionStore拡張
- PermissionHistoryPanelコンポーネント
- テストファイル2件

#### 完了条件

- 権限判断が自動的に履歴に記録されること
- PermissionSettingsから履歴を閲覧できること
- フィルタリングが正常に動作すること

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 権限判断時に自動的に履歴エントリが記録される
- [ ] PermissionSettingsに履歴パネルが表示される
- [ ] 履歴エントリにタイムスタンプ・ツール名・判断結果が含まれる
- [ ] ツール名・判断結果でフィルタリングできる
- [ ] 履歴のクリア機能がある

### 品質要件

- [ ] テストカバレッジ Lines 95%以上
- [ ] 1000件以上の履歴でもスムーズに表示される（仮想スクロール）
- [ ] TypeScript strict modeでエラーなし

### ドキュメント要件

- [ ] ui-ux-settings.mdに履歴パネル仕様を追記
- [ ] security-skill-execution.mdに履歴記録仕様を追記

---

## 6. 検証方法

### テストケース

| #   | テストケース                            | 期待結果                       |
| --- | --------------------------------------- | ------------------------------ |
| 1   | 権限許可後に履歴パネルを確認            | 最新エントリが追加されている   |
| 2   | 権限拒否後に履歴パネルを確認            | 拒否エントリが記録されている   |
| 3   | ツール名フィルタで「Bash」を選択        | Bash関連エントリのみ表示される |
| 4   | 「全てクリア」ボタンをクリック          | 履歴が空になる                 |
| 5   | 100件の履歴が蓄積された状態でスクロール | スムーズにスクロールできる     |

### 検証手順

1. `pnpm vitest run`で全テストがPASSすることを確認
2. PermissionDialogで許可/拒否を複数回実行し、履歴パネルで確認
3. フィルタリング操作の動作を確認

---

## 7. リスクと対策

| リスク                                | 影響度 | 発生確率 | 対策                                        |
| ------------------------------------- | ------ | -------- | ------------------------------------------- |
| 履歴データの肥大化                    | 中     | 高       | 最大件数制限（1000件）+自動古いエントリ削除 |
| PermissionStoreの永続化形式変更が必要 | 中     | 中       | マイグレーション関数を用意                  |
| パフォーマンス劣化（大量履歴時）      | 中     | 中       | 仮想スクロール + メモ化で対応               |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント           | パス                                                                                      |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| PermissionSettings仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md` L186-L277           |
| Permission Store仕様   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` L240-L324 |
| PermissionDialog仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`              |
| 状態管理パターン       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`              |

### 参考資料

- Zustand persist middleware ドキュメント
- React Virtual（TanStack Virtual）仮想スクロール

---

## 9. 備考

### 補足事項

- 履歴データはRenderer Process内のZustand storeで管理し、localStorageに永続化する方式を推奨
- 引数のスナップショットはsafeString()で安全化した要約テキストのみを保存する（セキュリティ考慮）
- セッションIDはagentSliceの現在セッションから取得
