# スキル実行進捗ストリーミング通知 - タスク指示書

## メタ情報

```yaml
issue_number: 419
```

## メタ情報

| 項目         | 内容                             |
| ------------ | -------------------------------- |
| タスクID     | TASK-SKILL-EXEC-STREAMING        |
| タスク名     | スキル実行進捗ストリーミング通知 |
| 分類         | 改善                             |
| 対象機能     | スキル実行機能全体               |
| 優先度       | 低                               |
| 見積もり規模 | 中規模                           |
| ステータス   | 未実施                           |
| 発見元       | Phase 12（ドキュメント更新）     |
| 発見日       | 2026-01-18                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在のスキル実行は「実行開始」→「実行完了（または失敗）」の2状態のみで、実行中の進捗は表示されない。長時間実行されるスキル（例：大規模なスライド生成）では、ユーザーが進捗を把握できず、待機時間の不安が生じる。

### 1.2 問題点・課題

- 実行中に進捗状況が分からない
- 長時間実行時にユーザーが「フリーズしているのでは」と不安になる
- 部分的な結果をリアルタイムで確認できない

### 1.3 放置した場合の影響

- ユーザー体験の低下
- 不必要な中断・再試行が発生
- 大規模処理への信頼感低下

---

## 2. 何を達成するか（What）

### 2.1 目的

スキル実行中の進捗状況をリアルタイムでUI側にストリーミング通知し、プログレスバーやログ表示で可視化する。

### 2.2 最終ゴール

- 実行進捗（0-100%）をIPC経由でRenderer Processに通知
- UIでプログレスバー表示
- 部分的なログ/出力のストリーミング表示（オプション）

### 2.3 スコープ

#### 含むもの

- IPC経由の進捗通知チャンネル（`skill:progress`）
- Main → Renderer方向のイベント通知
- プログレスバーUIコンポーネント
- 進捗コールバックの実装

#### 含まないもの

- 過去の実行履歴表示（別タスク）
- 複数スキル同時実行の進捗管理（別タスク）

### 2.4 成果物

- `skill:progress` IPCチャンネル
- `SkillProgressEvent`型定義
- プログレスバーUIコンポーネント
- 更新されたAgentView

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- skill-execution-implementation（Phase 1-12）が完了していること
- TASK-SKILL-EXEC-LOGIC（実行ロジック実装）が完了していること

### 3.2 依存タスク

- skill-execution-implementation（完了済み）
- TASK-SKILL-EXEC-LOGIC（実行ロジック実装）

### 3.3 必要な知識

- Electron IPC（Main → Renderer方向のイベント送信）
- React状態管理（進捗状態の管理）
- UI/UXデザイン（プログレスバー）

### 3.4 推奨アプローチ

#### IPC設計

```typescript
// Main Process → Renderer Process への進捗通知
interface SkillProgressEvent {
  executionId: string;
  skillId: string;
  progress: number; // 0-100
  status: 'running' | 'completed' | 'failed';
  message?: string; // 現在の処理内容
  output?: string;  // 部分的な出力（オプション）
}

// Main Process側
function emitProgress(event: SkillProgressEvent) {
  mainWindow.webContents.send('skill:progress', event);
}

// Renderer Process側 (Preload)
skillAPI.onProgress((event: SkillProgressEvent) => void): () => void
```

#### UI実装

```tsx
// AgentView内
const [progress, setProgress] = useState<SkillProgressEvent | null>(null);

useEffect(() => {
  const unsubscribe = skillAPI.onProgress((event) => {
    if (event.skillId === selectedSkill?.id) {
      setProgress(event);
    }
  });
  return unsubscribe;
}, [selectedSkill]);

return (
  <>
    {progress && progress.status === "running" && (
      <ProgressBar value={progress.progress} message={progress.message} />
    )}
  </>
);
```

---

## 4. 実行手順

### Phase構成

5フェーズ構成（小〜中規模改善）

### Phase 1: 要件定義・設計

#### 目的

進捗通知の要件とIPC設計を明確化する

#### 手順

1. `SkillProgressEvent`型を定義
2. `skill:progress` IPCチャンネルを設計
3. UI要件（プログレスバー仕様）を定義

#### 成果物

- `outputs/phase-1/progress-notification-requirements.md`
- `outputs/phase-2/ipc-design.md`

#### 完了条件

- 型定義が完了
- IPC設計が完了

### Phase 2: Main Process実装

#### 目的

進捗通知のMain Process側実装

#### 手順

1. `skill:progress` イベント送信機能を実装
2. SkillServiceに進捗コールバック機能を追加
3. 進捗更新のタイミングを定義

#### 成果物

- 更新された`SkillService.ts`
- 進捗送信ユーティリティ

#### 完了条件

- 進捗イベントが送信される

### Phase 3: Preload API・Renderer実装

#### 目的

Renderer Process側の進捗受信・表示実装

#### 手順

1. `skillAPI.onProgress`を実装
2. プログレスバーコンポーネントを作成
3. AgentViewに統合

#### 成果物

- 更新されたPreload API
- `ProgressBar.tsx`コンポーネント
- 更新されたAgentView

#### 完了条件

- プログレスバーが表示される

### Phase 4-5: テスト・ドキュメント

標準ワークフローに従う

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 進捗イベントがMain → Rendererに送信される
- [ ] プログレスバーが正しく表示される
- [ ] 進捗が0%から100%まで更新される
- [ ] 完了/失敗時にプログレスバーが適切に終了する

### 品質要件

- [ ] ユニットテストが追加されている
- [ ] 統合テストがPASS
- [ ] UIコンポーネントテストがPASS

### ドキュメント要件

- [ ] システム仕様書が更新されている
- [ ] 実装ガイドが更新されている

---

## 6. 検証方法

### テストケース

| TC-ID    | テスト内容         | 期待結果                         |
| -------- | ------------------ | -------------------------------- |
| TC-S-001 | 進捗イベント受信   | onProgressコールバックが呼ばれる |
| TC-S-002 | プログレスバー表示 | 進捗に応じてバーが伸びる         |
| TC-S-003 | 完了時のバー状態   | 100%になり完了状態になる         |
| TC-S-004 | 失敗時のバー状態   | エラー状態で停止する             |
| TC-S-005 | 複数回実行         | 前回の進捗がリセットされる       |

### 検証手順

1. 自動テストを実行
2. 長時間スキルを実行して手動で進捗表示を確認

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                         |
| ------------------------------ | ------ | -------- | ---------------------------- |
| 高頻度イベントのパフォーマンス | 中     | 中       | デバウンス、最大更新頻度制限 |
| UI更新の競合                   | 低     | 低       | 適切な状態管理               |
| イベントリスナーのメモリリーク | 中     | 中       | クリーンアップを確実に実装   |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-execution-implementation/outputs/phase-12/implementation-guide.md`
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`

### 参考資料

- 既存のAgent SDK進捗通知: `agent:progress` チャンネル実装を参照
- Electron IPC: https://www.electronjs.org/docs/latest/tutorial/ipc

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
現在は実行完了後に結果を返却するのみ。
実行進捗のリアルタイム通知は未対応。
```

### 補足事項

- 既存のAgent SDK統合で実装済みの`agent:progress`パターンを参考にすることを推奨
- Slide機能の進捗コールバック（`apps/desktop/src/main/slide/skill-executor.ts`）も参考になる
