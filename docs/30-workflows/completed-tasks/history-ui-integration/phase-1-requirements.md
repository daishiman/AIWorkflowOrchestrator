# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 1                      |
| Phase名    | 要件定義               |
| 前提Phase  | なし                   |
| 後続Phase  | Phase 2                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-10             |
| 機能名     | history-ui-integration |

---

## 目的

履歴UIコンポーネントをElectronアプリケーションに統合するための要件を明確化し、受け入れ基準を定義する。

## 背景

CONV-05-03で開発した履歴/ログ表示UIコンポーネントは単体テストで動作検証済み（カバレッジ94.43%）だが、実際のElectronアプリケーションには未統合。ユーザーが履歴/ログ表示機能を利用できるようにするため、統合作業が必要。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: システム仕様確認

**目的**: 既存システム仕様との整合性を確認する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md` を確認
2. 既存のIPC通信チャンネル名、型定義を把握
3. CONV-05-01、CONV-05-02、CONV-05-03の成果物を確認

**期待される成果物**:

- システム仕様との整合性確認結果

---

### タスク2: 機能要件抽出

**目的**: 統合に必要な機能要件を抽出する

**実行手順**:

1. 未タスク指示書（task-history-ui-integration.md）から機能要件を抽出
2. 履歴UIコンポーネントの機能を整理
3. Electron統合に必要な追加機能を特定

**期待される成果物**:

- 機能要件一覧

---

### タスク3: 受け入れ基準作成

**目的**: 各機能要件に対する受け入れ基準を定義する

**実行手順**:

1. 各機能要件に対してテスト可能な受け入れ基準を作成
2. 成功条件と失敗条件を明確化
3. 境界条件を特定

**期待される成果物**:

- 受け入れ基準一覧

---

## 参照資料

| 参照資料             | パス                                                                         | 内容                                |
| -------------------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| 履歴/ログ表示UI仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-history-panel.md`   | IPC通信・型定義・コンポーネント仕様 |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/task-history-ui-integration.md`           | 元のタスク要件                      |
| Electronセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC セキュリティパターン            |
| 履歴UIコンポーネント | `apps/desktop/src/renderer/components/history/`                              | 既存コンポーネント                  |
| 履歴フック           | `apps/desktop/src/renderer/hooks/`                                           | useVersionHistory等                 |

---

## 成果物

| 成果物       | パス                                         | 内容             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

---

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| IPC接続          | `history:getFileHistory`, `history:getVersionDetail`, `history:getConversionLogs`, `history:restoreVersion` |
| 認証フロー       | N/A（本タスクでは認証不要）                                                                                 |
| データフロー     | Renderer → preload → Main → HistoryService → SQLite → Main → preload → Renderer                             |

---

## 完了条件

- [ ] システム仕様（ui-ux-history-panel.md）を確認済み
- [ ] IPC通信チャンネル名が仕様と一致することを確認
- [ ] 型定義（HistoryAPI）が仕様と一致することを確認
- [ ] 機能要件が抽出されている
- [ ] 各要件に受け入れ基準がある
- [ ] スコープが明確に定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] artifacts.jsonが更新されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. システム仕様確認（ui-ux-history-panel.md）
2. 機能要件抽出
3. 受け入れ基準作成
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/history-ui-integration --phase 1
```

---

## 依存関係

- **前提**: なし（初期Phase）
- **後続**: Phase 2（設計）へ進む

---

## 機能要件（参考）

本タスクで実現する機能要件:

### FR-1: 履歴一覧表示

- ファイルIDを指定して履歴一覧を取得・表示できる
- ページネーション（追加読み込み）が動作する

### FR-2: バージョン詳細表示

- 選択したバージョンの詳細情報を表示できる
- 変換ログを表示できる

### FR-3: ログフィルタリング

- ログレベル（info/warn/error/debug）でフィルタできる

### FR-4: バージョン復元

- 過去のバージョンに復元できる
- 復元前に確認ダイアログを表示する

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/history-ui-integration/phase-2-design.md`
