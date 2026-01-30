# Phase 3: 設計レビューゲート - PermissionDialog コンポーネント

## メタ情報

| 項目      | 値                                      |
| --------- | --------------------------------------- |
| Phase     | 3                                       |
| Phase名   | 設計レビューゲート                      |
| カテゴリ  | ゲート                                  |
| Feature   | skill-import-agent-system               |
| Task      | TASK-7C PermissionDialog コンポーネント |
| 前提Phase | Phase 2（設計）                         |
| 次Phase   | Phase 4（テスト作成）                   |
| 作成日    | 2026-01-30                              |

## 目的

Phase 2の設計成果物をレビューし、実装に進む前に設計品質を検証する。PASS/MINOR/MAJORの判定を行い、ゲート通過可否を決定する。

## 実行タスク

### Task 1: 設計成果物の網羅性検証

**目的**: Phase 2で作成した全設計成果物の存在と網羅性を確認する

**手順**:

1. `outputs/phase-2/architecture-design.md` の存在を確認する
2. 以下のチェックリストで網羅性を検証する:

| 検証項目                           | 基準                                          |
| ---------------------------------- | --------------------------------------------- |
| コンポーネント階層が定義されている | ルート〜末端までの全階層が図示されている      |
| 状態管理設計が完了している         | 内部状態、Store接続、アクションハンドラの定義 |
| アクセシビリティ設計が完了している | ARIA属性、フォーカス管理、キーボード操作      |
| スタイリング仕様が策定されている   | Tailwind CSSクラスの一覧                      |
| ヘルパー関数が設計されている       | formatArgs の入出力仕様                       |

### Task 2: 要件カバレッジ検証

**目的**: Phase 1の全要件が設計でカバーされていることを確認する

**手順**:

1. Phase 1の要件定義書（FR/NFR一覧）を読む
2. Phase 2の設計が各要件をカバーしているかマッピングする:

| 要件ID  | 設計箇所                        | カバー状態 |
| ------- | ------------------------------- | ---------- |
| FR-001  | 条件付きレンダリング設計        | □          |
| FR-002  | モーダル構造設計                | □          |
| FR-003  | ToolInfo コンポーネント         | □          |
| FR-004  | formatArgs 関数                 | □          |
| FR-005  | formatArgs: command 分岐        | □          |
| FR-006  | formatArgs: path 分岐           | □          |
| FR-007  | formatArgs: JSON フォールバック | □          |
| FR-008  | ReasonDisplay 条件表示          | □          |
| FR-009  | handleDeny ハンドラ             | □          |
| FR-010  | handleApproveOnce ハンドラ      | □          |
| FR-011  | handleApprove ハンドラ          | □          |
| FR-012  | RememberCheckbox                | □          |
| FR-013  | setRememberChoice(false)        | □          |
| FR-014  | 閉じるボタン onClick            | □          |
| NFR-001 | ARIA role="dialog"              | □          |
| NFR-002 | aria-labelledby                 | □          |
| NFR-003 | aria-describedby                | □          |
| NFR-004 | フォーカストラップ設計          | □          |
| NFR-005 | Escape キーハンドリング         | □          |

### Task 3: 既存実装との整合性検証

**目的**: 既存の PermissionDialog との設計上の整合性を確認する

**手順**:

1. `apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx` を読む
2. 新コンポーネント（`components/skill/PermissionDialog.tsx`）との差異を確認する:

| 観点             | 既存実装                 | 新設計                        | 判定 |
| ---------------- | ------------------------ | ----------------------------- | ---- |
| 配置場所         | `components/Permission/` | `components/skill/`           | □    |
| 状態接続         | Props経由                | Store直結                     | □    |
| ボタン数         | 2（拒否/許可）           | 3（拒否/1回許可/許可）        | □    |
| チェックボックス | なし or 別実装           | rememberChoice あり           | □    |
| アクセシビリティ | ARIA属性あり             | ARIA属性 + フォーカストラップ | □    |

### Task 4: ゲート判定

**目的**: レビュー結果に基づきゲート通過判定を行う

**判定基準**:

| 判定  | 条件                               | 次のアクション             |
| ----- | ---------------------------------- | -------------------------- |
| PASS  | 全検証項目がクリア、MINOR指摘なし  | Phase 4に進む              |
| MINOR | 軽微な改善点があるが実装に影響なし | 指摘を記録し Phase 4に進む |
| MAJOR | 設計に重大な欠陥がある             | Phase 1 or 2 に戻る        |

## 統合テスト連携

| カテゴリ     | 確認内容                                                        |
| ------------ | --------------------------------------------------------------- |
| 設計整合性   | Store（SkillSlice）のインターフェースと設計の整合性             |
| データフロー | pendingPermission → ダイアログ表示 → respondToPermission の設計 |
| エラー処理   | 不正な pendingPermission データへの対処設計                     |

## 成果物

| 成果物名         | パス                                      | タイプ   |
| ---------------- | ----------------------------------------- | -------- |
| 設計レビュー結果 | `outputs/phase-3/design-review-result.md` | document |

## 完了条件

- [ ] 設計成果物の網羅性が確認されている
- [ ] 全要件（FR/NFR）が設計でカバーされている
- [ ] 既存実装との整合性が確認されている
- [ ] ゲート判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MAJOR判定の場合は差し戻し先が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog --phase 3
```

## 次のPhase

Phase 4: テスト作成（TDD: Red）

`docs/30-workflows/skill-import-agent-system/tasks/TASK-7C-permission-dialog/phase-04-test-creation.md`

## 参照資料

| 参照資料      | パス                                                                   | 説明               |
| ------------- | ---------------------------------------------------------------------- | ------------------ |
| Phase 1成果物 | `outputs/phase-1/`                                                     | 要件定義書         |
| Phase 2成果物 | `outputs/phase-2/`                                                     | アーキテクチャ設計 |
| 既存実装      | `apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx` | 比較対象           |
