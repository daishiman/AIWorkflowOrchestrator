# onProgress IPC 契約設計書

## メタ情報

| 項目       | 内容                                                                        |
| ---------- | --------------------------------------------------------------------------- |
| Phase      | 2                                                                           |
| 機能名     | TASK-SC-08-ON-PROGRESS-REALTIME-UPDATE                                      |
| タスク名   | onProgressコールバック接続・useStreamingProgressモード別phaseマッピング拡張 |
| 作成日     | 2026-04-19                                                                  |
| ステータス | completed                                                                   |

---

## 1. IPC チャネル契約

### チャネル仕様

| 項目         | 内容                                        |
| ------------ | ------------------------------------------- |
| チャネル名   | `SKILL_CREATOR_PROGRESS`                    |
| 通信方向     | Main プロセス → Renderer プロセス（一方向） |
| 発火条件     | スキル生成処理の各 phase 完了時             |
| ペイロード型 | `SkillCreatorProgress`                      |

### ペイロード型定義

```typescript
interface SkillCreatorProgress {
  phase: string; // 処理フェーズ名（mode 依存）
  percentage: number; // 進捗率（0〜100）
  message: string; // 表示メッセージ
}
```

### phase 名の列挙（全モード）

| モード         | phase 名            | percentage 範囲 | メッセージ例                      |
| -------------- | ------------------- | --------------- | --------------------------------- |
| create         | `planning`          | 0〜25           | "スキルの構造を計画しています..." |
| create         | `generating-skill`  | 25〜60          | "SKILL.md を生成しています..."    |
| create         | `generating-agents` | 60〜85          | "エージェントを生成しています..." |
| create         | `validating`        | 85〜99          | "スキルを検証しています..."       |
| create         | `done`              | 100             | "生成完了"                        |
| update         | `loading-skill`     | 0〜20           | "スキルを読み込んでいます..."     |
| update         | `analyzing`         | 20〜50          | "変更内容を分析しています..."     |
| orchestrate    | `engine-selection`  | 0〜30           | "実行エンジンを選択しています..." |
| improve-prompt | `improving`         | 0〜100          | "プロンプトを改善しています..."   |
| すべて         | `error`             | -               | エラーメッセージ文字列            |

---

## 2. Preload API 契約

### skillCreatorAPI.onProgress

```typescript
type OnProgressCallback = (progress: {
  phase: string;
  percentage: number;
  message: string;
}) => void;

type OnProgressUnsubscribe = () => void;

interface SkillCreatorAPI {
  onProgress?: (callback: OnProgressCallback) => OnProgressUnsubscribe;
}
```

### 契約上の保証

| 保証事項                       | 内容                                                      |
| ------------------------------ | --------------------------------------------------------- |
| コールバック呼び出し保証       | 各 phase 完了時に必ず呼び出される                         |
| クリーンアップ関数返却         | `onProgress` は必ずクリーンアップ関数を返す               |
| クリーンアップ後の呼び出しなし | クリーンアップ関数呼び出し後はコールバックが呼ばれない    |
| スレッドセーフ                 | `contextBridge` 経由のため、Renderer 側は安全に受け取れる |

---

## 3. Renderer 側受信契約

### useStreamingProgress Hook の受信処理

```typescript
useEffect(() => {
  const api = getSkillCreatorApi();
  if (!api?.onProgress) return;

  const cleanup = api.onProgress((progress) => {
    // エラー phase の特殊処理
    if (progress.phase === "error") {
      const errorCode = parseErrorCode(progress.message);
      setStage("error");
      setError({ code: errorCode, message: progress.message });
      return;
    }

    // 通常 phase のマッピングと Store 更新
    const mappedStage = mapPhaseToStage(progress.phase);
    updateProgress({
      stage: mappedStage,
      percent: progress.percentage,
      message: progress.message,
    });
  });

  return () => {
    cleanup(); // リスナー解除（P5対策）
    resetProgress(); // Store リセット
  };
}, [updateProgress, setStage, setError, resetProgress]);
```

### mapPhaseToStage の入出力契約

| 入力（phase: string） | 出力（StreamingGenerationStage） |
| --------------------- | -------------------------------- |
| `"planning"`          | `"planning"`                     |
| `"generating-skill"`  | `"generating-skill"`             |
| `"generating-agents"` | `"generating-agents"`            |
| `"validating"`        | `"validating"`                   |
| `"done"`              | `"done"`                         |
| `"loading-skill"`     | `"planning"`                     |
| `"analyzing"`         | `"planning"`                     |
| `"engine-selection"`  | `"planning"`                     |
| `"improving"`         | `"generating-skill"`             |
| その他（未知）        | `"planning"`（フォールバック）   |

---

## 4. エラー処理契約

| エラー条件                   | 処理内容                                         |
| ---------------------------- | ------------------------------------------------ |
| `phase === "error"`          | `setStage("error")` + `setError(...)` を呼び出す |
| `API_KEY` / `api key` を含む | `errorCode = "API_KEY_NOT_SET"`                  |
| `NETWORK` / `network` を含む | `errorCode = "NETWORK_ERROR"`                    |
| その他                       | `errorCode = "LLM_ERROR"`                        |

---

## 5. 変更スコープの確認

| 契約項目                     | TASK-SC-08 での変更       | 理由                                      |
| ---------------------------- | ------------------------- | ----------------------------------------- |
| IPC チャネル名               | なし                      | 既存のまま流用可能                        |
| ペイロード型                 | なし                      | `phase: string` で新 phase も受け入れ可能 |
| Preload API 型               | なし                      | 汎用型のため変更不要                      |
| `PHASE_TO_STAGE` マップ      | **あり（4エントリ追加）** | 新 phase 名の明示的マッピング追加         |
| `mapPhaseToStage` 関数       | なし                      | フォールバックロジック維持                |
| `StreamingGenerationStage`型 | なし                      | 既存 stage で全モード対応可能             |
