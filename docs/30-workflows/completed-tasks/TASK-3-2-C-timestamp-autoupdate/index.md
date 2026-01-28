# TASK-3-2-C: SkillStreamDisplay タイムスタンプ自動更新

## メタ情報

```yaml
task_id: TASK-3-2-C
task_name: SkillStreamDisplay タイムスタンプ自動更新
issue_number: 533
category: 改善
target_feature: SkillStreamDisplay MessageTimestampコンポーネント
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 8（TASK-3-2-A リファクタリング）
created_date: 2026-01-28
dependencies:
  - TASK-3-2-A（完了）
```

---

## 1. 概要

### 1.1 目的

MessageTimestampコンポーネントの相対時刻表示を定期的に自動更新し、常に正確な経過時間を表示する。

### 1.2 背景

TASK-3-2-AでMessageTimestampコンポーネントを実装し、各メッセージに相対時刻（「X秒前」「X分前」等）を表示する機能を追加した。現在、タイムスタンプはメッセージ受信時に一度だけ計算され、その後は更新されない。

### 1.3 問題点

| ID  | 課題                     | 現状                                        |
| --- | ------------------------ | ------------------------------------------- |
| T1  | タイムスタンプが静的     | 「5秒前」のまま時間が経過しても更新されない |
| T2  | 長時間実行時の正確性低下 | 実行開始から時間が経つと表示が古くなる      |
| T3  | ユーザー混乱の可能性     | 「1分前」が10分後も「1分前」のまま          |

### 1.4 解決策

1. 更新間隔の最適化（経過時間に応じた適応的な更新間隔）
2. useIntervalカスタムフックの実装
3. 可視状態検知による更新制御（バッテリー/パフォーマンス最適化）
4. Context APIによるバッチ更新

---

## 2. スコープ

### 2.1 含むもの

- MessageTimestampコンポーネントの自動更新機能実装
- useIntervalカスタムフックの作成
- 更新間隔の最適化ロジック
- 可視状態に応じた更新停止機能
- パフォーマンス最適化（React.memo、バッチ処理）
- 関連ユニットテストの追加

### 2.2 含まないもの

- formatRelativeTime関数の変更
- 他のコンポーネントへの影響
- 絶対時刻表示モードの追加
- バックエンド（Main Process）の変更

---

## 3. 成果物

| 成果物                        | パス                                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| 改善済みコンポーネント        | `apps/desktop/src/renderer/components/AgentView/SkillStreamDisplay.tsx`                |
| useIntervalフック             | `apps/desktop/src/renderer/hooks/useInterval.ts`                                       |
| TimestampProviderコンテキスト | `apps/desktop/src/renderer/contexts/TimestampContext.tsx`                              |
| 追加テスト                    | `apps/desktop/src/renderer/components/AgentView/__tests__/SkillStreamDisplay.test.tsx` |
| 追加テスト                    | `apps/desktop/src/renderer/hooks/__tests__/useInterval.test.ts`                        |

---

## 4. Phase構成

| Phase | 名称                   | 概要                                 |
| ----- | ---------------------- | ------------------------------------ |
| 1     | 要件定義               | 更新間隔仕様・パフォーマンス要件確定 |
| 2     | 設計                   | コンポーネント設計・フック設計       |
| 3     | 設計レビューゲート     | 設計の妥当性検証                     |
| 4     | テスト作成（TDD: Red） | タイマーテストケース作成             |
| 5     | 実装（TDD: Green）     | 自動更新機能実装                     |
| 6     | テスト拡充             | カバレッジ向上                       |
| 7     | カバレッジ確認         | テストカバレッジ維持確認             |
| 8     | リファクタリング       | コード品質改善                       |
| 9     | 品質保証               | 品質基準検証                         |
| 10    | 最終レビューゲート     | 実装全体の検証                       |
| 11    | 手動テスト検証         | 長時間実行動作確認                   |
| 12    | ドキュメント更新       | 実装ガイド更新                       |
| 13    | PR作成                 | PR作成・CI確認                       |

---

## 5. 前提条件

- TASK-3-2-Aが完了していること
- MessageTimestampコンポーネントが正常に動作していること
- 既存テストが全てPASSしていること

---

## 6. 必要な技術知識

| 技術領域    | 必要な知識                   |
| ----------- | ---------------------------- |
| React       | useEffect、useState、useRef  |
| React       | useContext、createContext    |
| React       | React.memo、useMemo          |
| JavaScript  | setInterval、clearInterval   |
| Web API     | Page Visibility API          |
| Performance | メモ化、レンダリング最適化   |
| Testing     | タイマーモック、非同期テスト |

---

## 7. 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 説明                         |
| ------------------------ | ------------------------------------------------------------------------------- | ---------------------------- |
| UIコンポーネント仕様     | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`         | 共通UIコンポーネント設計指針 |
| 機能別コンポーネント仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | SkillStreamDisplay仕様       |
| デザイン原則             | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md`  | UI/UX設計原則                |

### 外部参考資料

| 資料名              | URL/パス                                                             |
| ------------------- | -------------------------------------------------------------------- |
| useInterval Hook    | https://usehooks-ts.com/react-hook/use-interval                      |
| Page Visibility API | https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API |
| React Performance   | https://react.dev/reference/react/memo                               |

### タスク関連ドキュメント

| ドキュメント         | パス                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| TASK-3-2-A実装ガイド | `docs/30-workflows/TASK-3-2-A-skill-stream-ux-improvements/outputs/phase-12/implementation-guide.md` |
| 元タスク指示書       | `docs/30-workflows/unassigned-task/task-skill-stream-timestamp-autoupdate.md`                        |

---

## 8. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                     |
| ------------------ | ------ | -------- | ------------------------ |
| パフォーマンス低下 | 中     | 中       | バッチ更新、可視状態検知 |
| メモリリーク       | 中     | 低       | useEffect cleanupの徹底  |
| バッテリー消費増加 | 低     | 中       | 非表示時の更新停止       |

---

## 9. 完了条件チェックリスト

### 機能要件

- [ ] T1: タイムスタンプが定期的に自動更新される
- [ ] T2: 更新間隔が経過時間に応じて最適化されている
- [ ] T3: タブが非表示の時は更新が停止する

### 品質要件

- [ ] 既存テストが全てPASS
- [ ] 自動更新関連テストが追加されている
- [ ] カバレッジが100%を維持（該当ファイル）
- [ ] TypeScript型エラーなし
- [ ] ESLintエラーなし

### パフォーマンス要件

- [ ] 100メッセージでもFPSが60を維持
- [ ] メモリリークがない
- [ ] CPUスパイクがない

### ドキュメント要件

- [ ] 自動更新仕様がドキュメント化されている
- [ ] 実装ガイドが作成されている

---

## 10. 備考

- この改善は任意タスクであり、他の優先タスクがある場合は後回しにしてよい
- パフォーマンス影響を慎重に検証すること
- バッテリー消費への影響を考慮し、モバイル版では無効化を検討

---

## 変更履歴

| 日付       | 変更内容 | 担当 |
| ---------- | -------- | ---- |
| 2026-01-28 | 初版作成 | AI   |
