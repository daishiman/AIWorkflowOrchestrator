# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                    |
| ---------- | ----------------------- |
| Phase      | 1                       |
| Phase名    | 要件定義                |
| 前提Phase  | -                       |
| 後続Phase  | Phase 2                 |
| ステータス | 未実施                  |
| 作成日     | 2026-01-25              |
| 機能名     | PermissionResolver 実装 |

---

## 目的

PermissionResolver の要件を明確化し、受け入れ基準を定義する。

## 背景

Claude Agent SDK を使用したスキル実行では、Hooks 機能による権限確認が必要となる。
PermissionResolver は Main Process で権限確認リクエストを管理し、
Renderer Process からの応答を待機・解決する責務を持つ。

---

## 実行タスク

### タスク 1: 機能要件の明確化

**目的**: PermissionResolver が満たすべき機能を定義する

**実行手順**:

1. 元タスク定義（`task-3-2-permission-resolver.md`）を読み込む
2. システム仕様（`interfaces-agent-sdk.md`）から関連型定義を確認
3. 以下の機能要件を文書化:
   - 権限応答の待機機能
   - 権限リクエストの解決機能
   - 個別キャンセル機能
   - 全キャンセル機能
   - 保留中リクエスト数の取得

**期待される成果物**:

- 機能要件一覧（本ドキュメント内に記載）

### タスク 2: 非機能要件の明確化

**目的**: パフォーマンス・信頼性要件を定義する

**実行手順**:

1. タイムアウト要件を定義（デフォルト: 5分 = 300,000ms）
2. 並行リクエスト処理要件を定義
3. メモリ管理要件を定義（タイマーのクリーンアップ）
4. AbortSignal 対応要件を定義

**期待される成果物**:

- 非機能要件一覧

### タスク 3: 受け入れ基準の策定

**目的**: テスト可能な受け入れ基準を定義する

**実行手順**:

1. 各機能に対応する受け入れテストシナリオを作成
2. 境界条件を明確化
3. エラーケースを列挙

**期待される成果物**:

- 受け入れ基準チェックリスト

---

## 参照資料

| 参照資料            | パス                                                                                | 内容                 |
| ------------------- | ----------------------------------------------------------------------------------- | -------------------- |
| タスク元定義        | `docs/30-workflows/skill-import-agent-system/tasks/task-3-2-permission-resolver.md` | 元のタスク仕様       |
| 型定義仕様          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`         | PermissionRequest 等 |
| TASK-1-1 完了成果物 | `packages/shared/src/types/skill.ts`                                                | 共通型定義           |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                        | 内容                              |
| -------------------- | --------------------------------------------------------------------------- | --------------------------------- |
| interfaces-agent-sdk | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | PermissionRequest/Response 型仕様 |

---

## 成果物

| 成果物       | パス                      | 内容                     |
| ------------ | ------------------------- | ------------------------ |
| 要件定義書   | 本ドキュメント（Phase 1） | 機能・非機能要件         |
| 受け入れ基準 | 本ドキュメント内          | テスト可能な基準チェック |

---

## 機能要件（タスク 1 成果物）

### FR-1: 権限応答待機

- `waitForResponse(requestId, signal?)` メソッドを提供
- Promise を返し、応答を受信するまで待機
- タイムアウト時は Error を throw
- AbortSignal でキャンセル可能

### FR-2: 権限リクエスト解決

- `resolveRequest(response)` メソッドを提供
- `requestId` に対応する待機中 Promise を解決
- 存在しない `requestId` の場合は無視（エラーなし）

### FR-3: 個別キャンセル

- `cancelRequest(requestId, reason?)` メソッドを提供
- 指定した待機中リクエストを Error で reject
- タイマーをクリア

### FR-4: 全キャンセル

- `cancelAll()` メソッドを提供
- 全ての待機中リクエストをキャンセル
- 全タイマーをクリア

### FR-5: 保留中リクエスト数

- `pendingCount` ゲッターを提供
- 現在待機中のリクエスト数を返す

---

## 非機能要件（タスク 2 成果物）

### NFR-1: タイムアウト

- デフォルト: 300,000ms（5分）
- コンストラクタで設定可能

### NFR-2: 並行処理

- 複数リクエストを同時に管理可能
- リクエスト間で干渉しない

### NFR-3: メモリ管理

- 完了/キャンセル時に必ずタイマーをクリア
- Map からエントリを削除

### NFR-4: AbortSignal 対応

- `abort` イベント時に待機を中断
- タイマーをクリア

---

## 受け入れ基準（タスク 3 成果物）

### AC-1: 正常系

- [ ] `waitForResponse` → `resolveRequest` で Promise が解決される
- [ ] 解決値が `PermissionResponse` と一致する

### AC-2: タイムアウト

- [ ] 設定時間経過後に Promise が reject される
- [ ] エラーメッセージに `requestId` が含まれる

### AC-3: AbortSignal

- [ ] `signal.abort()` 呼び出しで Promise が reject される
- [ ] タイマーがクリアされる

### AC-4: キャンセル

- [ ] `cancelRequest` で個別リクエストが reject される
- [ ] `cancelAll` で全リクエストが reject される

### AC-5: 存在しない requestId

- [ ] `resolveRequest` が例外を throw しない
- [ ] `cancelRequest` が例外を throw しない

### AC-6: pendingCount

- [ ] 待機中リクエスト数が正確に反映される
- [ ] 完了/キャンセル後に減少する

---

## 完了条件

- [ ] 機能要件（FR-1〜FR-5）が定義されている
- [ ] 非機能要件（NFR-1〜NFR-4）が定義されている
- [ ] 受け入れ基準（AC-1〜AC-6）が策定されている
- [ ] 各要件がテスト可能な形式で記述されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（本タスクの開始Phase）
- **後続**: Phase 2 へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-3-2-permission-resolver/phase-2-design.md`
