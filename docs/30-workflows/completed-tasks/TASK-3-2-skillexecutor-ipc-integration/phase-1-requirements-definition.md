# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 1                                      |
| Phase名    | 要件定義                               |
| 前提Phase  | なし                                   |
| 後続Phase  | Phase 2（設計）                        |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-25                             |
| 機能名     | TASK-3-2-skillexecutor-ipc-integration |

---

## 目的

SkillExecutor IPC Handler統合の詳細要件を定義し、実装スコープと受け入れ基準を明確にする。

## 背景

TASK-3-1-AでSkillExecutor（SDK query()基本実装）が完了した。Main ProcessからRenderer Processへのストリーミング配信機能が実装されているが、Renderer側の受信・表示機能が未実装のため、本タスクでその部分を実装する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存実装の確認

**目的**: 現在の実装状況を把握し、本タスクで実装すべき範囲を特定する

**実行手順**:

1. SkillExecutor実装を確認する
   - パス: `apps/desktop/src/main/services/skill/SkillExecutor.ts`
   - 確認項目: `skill:stream`送信のAPI、メッセージ形式
2. 既存のPreload APIを確認する
   - パス: `apps/desktop/src/preload/index.ts`
   - 確認項目: 既存の`skillAPI`の実装状況
3. 型定義を確認する
   - パス: `packages/shared/src/types/skill-execution.ts`
   - 確認項目: `SkillStreamMessage`型の定義

**期待される成果物**:

- `outputs/phase-1/existing-implementation-review.md`

---

### タスク2: IPC統合要件の定義

**目的**: Preload API拡張・IPC Handler・UI連携の詳細要件を定義する

**実行手順**:

1. Preload API要件を定義する
   - `skillAPI.onStream(callback)`: ストリーミングメッセージ受信
   - `skillAPI.abort(executionId)`: 実行中断
2. IPC Handler要件を定義する
   - `skill:stream`チャンネルのリスナー登録
   - メッセージフィルタリング（executionId別）
3. UI要件を定義する
   - ストリーミング表示コンポーネント
   - 中断ボタン
   - エラー表示
   - 完了状態表示

**期待される成果物**:

- `outputs/phase-1/ipc-integration-requirements.md`

---

### タスク3: 受け入れ基準の作成

**目的**: 本タスクの完了を判定する具体的な基準を定義する

**実行手順**:

1. 機能要件の受け入れ基準を定義する

   | 要件ID | 要件                | 受け入れ基準                                           |
   | ------ | ------------------- | ------------------------------------------------------ |
   | FR-001 | onStream登録        | コールバックが正しく登録され、解除関数が返される       |
   | FR-002 | メッセージ受信      | `skill:stream`からのメッセージがコールバックに渡される |
   | FR-003 | executionIdフィルタ | 指定したexecutionIdのメッセージのみ受信する            |
   | FR-004 | abort呼び出し       | 実行中断が成功し、trueが返される                       |
   | FR-005 | UI表示              | メッセージがリアルタイムで表示される                   |
   | FR-006 | エラー表示          | エラーメッセージが適切に表示される                     |
   | FR-007 | 完了表示            | 完了時に完了状態が表示される                           |

2. 非機能要件の受け入れ基準を定義する

   | 要件ID  | 要件             | 受け入れ基準                            |
   | ------- | ---------------- | --------------------------------------- |
   | NFR-001 | メモリリーク防止 | useEffect cleanupでリスナーが解除される |
   | NFR-002 | 型安全性         | TypeScript strictモードでエラーなし     |
   | NFR-003 | テストカバレッジ | 80%以上                                 |

**期待される成果物**:

- `outputs/phase-1/acceptance-criteria.md`

---

## 参照資料

| 参照資料          | パス                                                                        | 内容                       |
| ----------------- | --------------------------------------------------------------------------- | -------------------------- |
| Agent SDK仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | IPC・型定義・API仕様       |
| SkillExecutor実装 | `apps/desktop/src/main/services/skill/SkillExecutor.ts`                     | Main Process実装           |
| 型定義            | `packages/shared/src/types/skill-execution.ts`                              | ストリーミングメッセージ型 |
| Preload API       | `apps/desktop/src/preload/index.ts`                                         | 既存Preload API            |

---

## 成果物

| 成果物           | パス                                                | 内容         |
| ---------------- | --------------------------------------------------- | ------------ |
| 既存実装レビュー | `outputs/phase-1/existing-implementation-review.md` | 現状分析結果 |
| IPC統合要件      | `outputs/phase-1/ipc-integration-requirements.md`   | 詳細要件定義 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`            | 完了判定基準 |

---

## 統合テスト連携

本Phaseでは統合テストの実装は不要。Phase 4以降で統合テストを作成する。

---

## 完了条件

- [ ] 既存実装（SkillExecutor、Preload API、型定義）の確認が完了
- [ ] Preload API拡張要件が定義されている
- [ ] IPC Handler要件が定義されている
- [ ] UI要件（ストリーミング表示・中断・エラー）が定義されている
- [ ] 受け入れ基準が定義されている
- [ ] 全ての成果物が`outputs/phase-1/`に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（本タスクの開始Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/TASK-3-2-skillexecutor-ipc-integration/phase-2-design.md`
