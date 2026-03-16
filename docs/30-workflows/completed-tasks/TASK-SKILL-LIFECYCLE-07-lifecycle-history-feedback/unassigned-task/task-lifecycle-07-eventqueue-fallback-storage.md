# UT-IMPL-EVENTQUEUE-FALLBACK-STORAGE-001 EventQueue フォールバック保存機構 - タスク指示書

## メタ情報

```yaml
issue_number: 1256
```

## メタ情報

| 項目         | 内容                                                            |
| ------------ | --------------------------------------------------------------- |
| タスクID     | UT-IMPL-EVENTQUEUE-FALLBACK-STORAGE-001                         |
| タスク名     | EventQueue SQLite書き込み失敗時のファイルシステムフォールバック |
| 分類         | 改善                                                            |
| 対象機能     | EventQueue バッファのフォールバック保存機構                     |
| 優先度       | 中                                                              |
| 見積もり規模 | 中規模                                                          |
| ステータス   | 未実施                                                          |
| 発見元       | TASK-SKILL-LIFECYCLE-07 Phase 11 Note-05                        |
| 発見日       | 2026-03-16                                                      |
| 関連タスク   | TASK-SKILL-LIFECYCLE-07                                         |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-07 の Phase 11 ウォークスルーで、`data-flow-design.md` の EventQueue 設計において、SQLite 書き込みが3回連続で失敗した場合にバッファ内のイベントが破棄される点が Note-05 として記録された。現状の設計ではリトライ3回を超えるとイベントデータが完全に失われるが、ライフサイクル履歴はスキルの品質評価・公開判断の基盤データであり、データ損失は許容しにくい。

### 1.2 問題点・課題

- SQLite ファイルロック、ディスク容量不足、プロセスクラッシュ等で書き込みが連続失敗した場合、貴重なライフサイクルイベントが完全に破棄される
- 特に実行メトリクス（success/failure、latency）やフィードバックデータの損失は、`PublishReadinessMetrics` の精度に直接影響する
- 現状の設計にはフォールバックパスが存在せず、「ベストエフォート型の永続化」に留まっている

### 1.3 放置した場合の影響

- SQLite の一時的な障害でイベント履歴が欠損し、スキルの品質スコアや公開判断メトリクスの信頼性が低下する
- ユーザーのフィードバックが失われ、改善サイクルが途切れる
- 障害発生時のデータ復旧手段がなく、運用上のリスクが高い

## 2. 何を達成するか（What）

### 2.1 目的

EventQueue の SQLite 書き込みが3回失敗した際に、イベントを破棄する前にファイルシステムへフォールバック保存する機構を設計・実装する。

### 2.2 最終ゴール

1. SQLite 書き込み3回失敗時にイベントが JSON ファイルとしてフォールバックディレクトリに保存される
2. アプリケーション再起動時またはSQLite回復時にフォールバックファイルからイベントが自動復旧される
3. フォールバックファイルの自動クリーンアップ（復旧済みファイルの削除）が実装されている

### 2.3 スコープ

#### 含むもの

- フォールバック保存先ディレクトリの設計（例: `~/.aiworkflow/event-fallback/`）
- JSON ファイルフォーマットの定義（イベント配列 + メタデータ）
- フォールバック書き込みロジックの実装
- 起動時のフォールバック復旧ロジックの実装
- 復旧済みファイルのクリーンアップ
- フォールバック関連のテスト

#### 含まないもの

- SQLite 自体のリトライ回数の変更
- EventQueue のバッファサイズの変更
- リアルタイム通知（フォールバック発生時のUI通知は別タスク）

### 2.4 成果物

- 設計ドキュメント（`data-flow-design.md` への追記）
- フォールバック保存/復旧の実装コード
- テストコード（正常系・異常系）

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-LIFECYCLE-07 の EventQueue 設計が確定していること
- `data-flow-design.md` のバッファリング仕様を把握していること
- Electron の `app.getPath('userData')` でユーザーデータディレクトリが取得可能であること
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` の lifecycleHistorySlice セクション（二層永続化設計）を理解済みであること
- Phase 2 data-flow-design.md の EventQueue バッファ設計（100件バッファ、5秒フラッシュ）を理解済みであること
- イベントソーシングにおけるイベント損失ゼロの原則を理解していること

### 3.2 依存タスク

なし（ただし EventQueue の実装タスクと同時または後続で実施することを推奨）。

### 3.3 必要な知識

- Node.js ファイルシステム API（`fs.promises`）
- JSON シリアライゼーション
- Electron のユーザーデータディレクトリ
- エラーハンドリングパターン（`Result<T, E>`）
- P13: タイマーテストの無限ループ回避

### 3.4 推奨アプローチ

```typescript
// フォールバック保存の概念設計
interface FallbackStorage {
  // SQLite書き込み失敗時にイベントをファイルに保存
  saveEvents(events: SkillLifecycleEvent[]): Promise<Result<string, Error>>;
  // 起動時にフォールバックファイルからイベントを復旧
  recoverEvents(): Promise<Result<SkillLifecycleEvent[], Error>>;
  // 復旧済みファイルを削除
  cleanup(filePath: string): Promise<Result<void, Error>>;
}
```

フォールバックファイルフォーマット:

```json
{
  "version": 1,
  "createdAt": "2026-03-16T12:00:00Z",
  "reason": "sqlite_write_failure",
  "retryCount": 3,
  "events": [...]
}
```

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                    | 発見経緯                                                                           | 解決策                                              | 教訓                                                         |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------ |
| SQLite書き込み失敗時のデータ損失リスク                  | Phase 11 ウォークスルーでデータフロー追跡中に発見                                  | ファイルシステムへのフォールバック保存を追加        | 永続化パスは単一障害点を避け、フォールバックを設ける         |
| フォールバックファイルの無限蓄積                        | 設計検討時に想定                                                                   | 復旧成功後の自動クリーンアップ + 最大ファイル数制限 | フォールバック保存にもライフサイクル管理が必要               |
| EventQueue バッファのイベント破棄とデータ保全方針の矛盾 | Phase 11 ウォークスルーシナリオB で「削除しない」方針と3回失敗時破棄の不整合を発見 | ファイルシステムへのフォールバック保存を実装        | イベントソーシング設計では「イベント損失ゼロ」を原則とすべき |
| Phase 12 サブエージェントが実ファイル更新を保留         | Phase 12 Step 2 で仕様書更新が計画のみで保留された                                 | 設計タスクでも Phase 12 の実ファイル更新は必須      | サブエージェントに「計画記録のみ」を許容しない               |
| バックグラウンドエージェントの TaskOutput timeout       | 並列エージェント10分 timeout 後も成果物は完了済み                                  | find/ls で成果物存在を直接確認                      | 大量ファイル生成 Phase は timeout を想定して設計する         |
| aggregateViews の二層永続化設計判断                     | Phase 3 TECH-M-01 で persist 矛盾を検出                                            | SQLite=正本、Zustand=キャッシュの二層構造を明確化   | EventQueue は SQLite への書き込み失敗時の代替経路が必要      |

## 4. 実行手順

### Phase構成

設計 -> 実装 -> テスト -> 検証。

### Phase 1: フォールバック設計

#### 目的

フォールバック保存/復旧の詳細設計を確定する。

#### 手順

1. `data-flow-design.md` のEventQueue仕様を確認する
2. フォールバック保存先ディレクトリとファイルフォーマットを設計する
3. 復旧フローとクリーンアップポリシーを設計する
4. 設計を `data-flow-design.md` に追記する

#### 成果物

- 更新済み `data-flow-design.md`（フォールバックセクション追加）

#### 完了条件

- フォールバック保存/復旧の仕様が明確に文書化されている

### Phase 2: 実装

#### 目的

フォールバック保存/復旧機構を実装する。

#### 手順

1. `FallbackStorage` クラスを実装する
2. EventQueue にフォールバック呼び出しを組み込む
3. アプリケーション起動時の復旧ロジックを実装する
4. クリーンアップロジックを実装する

#### 成果物

- フォールバック保存/復旧の実装コード

#### 完了条件

- SQLite 書き込み3回失敗時にフォールバック保存が発動する
- 起動時にフォールバックファイルから復旧が実行される

### Phase 3: テスト

#### 目的

フォールバック機構の信頼性を検証する。

#### 手順

1. 正常系テスト: フォールバック保存→復旧→クリーンアップの一連フロー
2. 異常系テスト: フォールバック先のディスク容量不足、ファイル権限エラー
3. 境界値テスト: 最大ファイル数制限、空イベント配列のフォールバック
4. 統合テスト: EventQueue と FallbackStorage の連携

#### 成果物

- テストコード

#### 完了条件

- 全テストが PASS する
- カバレッジ基準（Line 80%、Branch 60%）を満たす

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SQLite 書き込み3回失敗時にイベントがファイルに保存される
- [ ] 起動時にフォールバックファイルからイベントが復旧される
- [ ] 復旧済みファイルが自動クリーンアップされる
- [ ] フォールバックファイル数の上限が設定されている

### 品質要件

- [ ] Line Coverage 80% 以上
- [ ] Branch Coverage 60% 以上
- [ ] `Result<T, E>` パターンでエラーが明示的に返される
- [ ] ファイルパスのバリデーション（パストラバーサル防止）が実装されている

### ドキュメント要件

- [ ] `data-flow-design.md` にフォールバック仕様が追記されている
- [ ] 変更内容が変更履歴に記録されている

## 6. 検証方法

### テストケース

- Case 1: SQLite 書き込み3回失敗 -> フォールバックファイルが生成される
- Case 2: アプリ再起動 -> フォールバックファイルからイベントが SQLite に復旧される
- Case 3: 復旧成功 -> フォールバックファイルが削除される
- Case 4: フォールバック先もエラー -> エラーがログに記録され、イベントは破棄される（最終手段）
- Case 5: フォールバックファイル数が上限に達した -> 最古のファイルが削除される

### 検証手順

1. SQLite モックで書き込みエラーを3回発生させ、フォールバックファイルの生成を確認する
2. フォールバックファイルを手動配置し、復旧ロジックの動作を確認する
3. `pnpm vitest run` で全テストが PASS することを確認する

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                                                       |
| ---------------------------------------- | ------ | -------- | -------------------------------------------------------------------------- |
| フォールバック先のファイルシステムも障害 | 高     | 低       | ログに記録して最終的にイベントを破棄する（二重フォールバックは実装しない） |
| フォールバックファイルの無限蓄積         | 中     | 中       | 最大ファイル数制限（デフォルト100件）と古いファイルの自動削除              |
| 復旧時のデータ整合性（重複イベント）     | 中     | 中       | イベント ID のユニーク制約で重複を防止する                                 |
| テストでのタイマーテスト無限ループ       | 低     | 中       | P13 準拠で `advanceTimersByTime` を使用する                                |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/` 配下の Phase 2 成果物（data-flow-design.md）、Phase 11 成果物
- `.claude/rules/02-code-quality.md#エラーハンドリング`
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — lifecycleHistorySlice の二層永続化設計
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` — SkillLifecycleEvent 型定義
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-history.md` — ライフサイクルイベントモデル（18イベント分類）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` — TASK-SKILL-LIFECYCLE-07 教訓セクション
- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/phase-2/data-flow-design.md` — EventQueue バッファ設計（元の設計仕様）

### 参考資料

- `.claude/rules/06-known-pitfalls.md#P13`（タイマーテスト無限ループ防止）
- `.claude/rules/04-electron-security.md`（ファイルパスバリデーション）

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 11 Note-05: EventQueue バッファで SQLite 書き込み3回失敗時のイベント破棄前にファイルシステムへフォールバック保存する機構を検討・実装すべき
```

### 補足事項

本タスクは EventQueue の実装タスクと並行または後続で実施することを推奨する。設計タスク（TASK-SKILL-LIFECYCLE-07）の時点では仕様追記のみ、実装タスクの時点でコード実装を行う。
