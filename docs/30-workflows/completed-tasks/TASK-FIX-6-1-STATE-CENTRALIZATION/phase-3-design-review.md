# Phase 3: 設計レビュー

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| タスクID   | TASK-FIX-6-1-STATE-CENTRALIZATION         |
| タスク名   | スキル状態管理のZustand集約（仕様書準拠） |
| Phase      | 3 - 設計レビュー                          |
| 分類       | リファクタリング                          |
| 作成日     | 2026-02-09                                |
| 最終更新日 | 2026-02-09                                |
| 依存       | Phase 2: phase-2-design.md                |

---

## 1. レビュー観点

本設計レビューでは、以下の5つの観点から設計を検証する。

| 観点           | 説明                                                              | 重要度 |
| -------------- | ----------------------------------------------------------------- | ------ |
| 仕様書準拠     | arch-state-management.md、interfaces-agent-sdk-skill.mdとの整合性 | 必須   |
| 型安全性       | TypeScript strictモードでの型整合性、型アサーション排除           | 必須   |
| IPC連携        | Main ProcessとのIPC通信設計の妥当性                               | 必須   |
| 後方互換性     | 既存APIの互換性維持、移行影響範囲                                 | 必須   |
| パフォーマンス | 状態更新・レンダリングの効率性                                    | 推奨   |

---

## 2. 仕様書準拠レビュー

### 2.1 arch-state-management.mdとの整合性

#### チェック項目

| 項目                   | 仕様書の記載                               | 設計との整合性                                 | 判定                 |
| ---------------------- | ------------------------------------------ | ---------------------------------------------- | -------------------- |
| Slice配置              | agentSliceがエージェント・スキル管理を担当 | 全スキル状態をagentSliceに統合                 | PASS                 |
| 既存Slice一覧          | skillSliceがTASK-6-1で追加                 | 本タスクでskillSliceを削除し、agentSliceに統合 | PASS（要仕様書更新） |
| 状態定義テーブル       | agentSlice詳細セクションに状態一覧         | 設計で定義した状態がテーブルに含まれる         | PASS                 |
| アクション定義テーブル | agentSlice詳細セクションにアクション一覧   | 設計で定義したアクションがテーブルに含まれる   | PASS                 |
| cross-sliceアクセス    | permissionHistorySliceへのアクセスパターン | respondToPermissionで履歴記録を維持            | PASS                 |

#### 仕様書更新が必要な箇所

| 仕様書                        | 更新箇所                   | 更新内容                               |
| ----------------------------- | -------------------------- | -------------------------------------- |
| arch-state-management.md      | 既存Slice一覧              | skillSlice行を削除                     |
| arch-state-management.md      | agentSlice詳細セクション   | スキル実行関連の状態・アクションを追加 |
| interfaces-agent-sdk-skill.md | SkillSlice型定義セクション | 「統合完了: agentSliceへ移行」と記載   |

### 2.2 interfaces-agent-sdk-skill.mdとの整合性

#### チェック項目

| 項目                  | 仕様書の記載                | 設計との整合性                                    | 判定 |
| --------------------- | --------------------------- | ------------------------------------------------- | ---- |
| SkillExecutionRequest | skillName, prompt           | executionIdをoptionalで追加（後方互換性維持）     | PASS |
| SkillStreamMessage    | executionId必須             | 内部ハンドラでexecutionIdフィルタリング           | PASS |
| IPCチャンネル         | skill:\*チャンネル一覧      | 設計で使用するチャンネルが一覧に存在              | PASS |
| Preload API           | window.electronAPI.skill.\* | AgentViewからの直接呼び出しをアクション経由に変更 | PASS |

---

## 3. 型安全性レビュー

### 3.1 型アサーション排除状況

現在の型アサーション箇所と解消方法。

| 箇所                | 現在の型アサーション                           | 解消方法                            | 判定  |
| ------------------- | ---------------------------------------------- | ----------------------------------- | ----- |
| AgentView L150-151  | `imported as unknown as Skill[]`               | agentSliceで型変換ロジックを実装    | PASS  |
| AgentView L167-168  | `available as unknown as Skill[]`              | agentSliceで型変換ロジックを実装    | PASS  |
| skillSlice L317-318 | `(get() as unknown as PermissionHistorySlice)` | 維持（cross-sliceアクセスパターン） | MINOR |

### 3.2 型定義の整合性

| 確認項目                                    | 状態             | 判定 |
| ------------------------------------------- | ---------------- | ---- |
| AgentState全プロパティに明示的な型指定      | 設計書で定義済み | PASS |
| AgentActions全メソッドにシグネチャ定義      | 設計書で定義済み | PASS |
| 内部ハンドラ（\_handleXxx）の型定義         | 設計書で定義済み | PASS |
| SkillExecutionRequest.executionIdのoptional | 設計書で定義済み | PASS |

### 3.3 型安全性に関する懸念事項

| 懸念                              | リスク                 | 対策                                              | 判定  |
| --------------------------------- | ---------------------- | ------------------------------------------------- | ----- |
| cross-sliceアクセスでの型キャスト | 型安全性低下           | as unknown as パターンを1箇所に限定、コメント明記 | MINOR |
| useSkillStoreの戻り値型           | セレクター結果の型推論 | 明示的な戻り値型インターフェースを定義            | PASS  |

---

## 4. IPC連携レビュー

### 4.1 Race Condition対策の妥当性

#### 設計フローの検証

```
[検証フロー]
1. generateExecutionId()でID生成 ←─── クライアント側で一意性保証
2. set({ currentExecutionId })    ←─── State設定が先
3. window.electronAPI.skill.execute({ executionId }) ←─── リクエストにID含む
4. Main Process実行開始
5. ストリームメッセージ到着     ←─── この時点でIDがStateに存在
6. _handleStreamMessageでフィルタリング ←─── 正しいIDのみ処理
```

| チェック項目                      | 状態                        | 判定 |
| --------------------------------- | --------------------------- | ---- |
| executionIdの生成タイミング       | IPC呼び出し前               | PASS |
| executionIdのState設定タイミング  | IPC呼び出し前               | PASS |
| メッセージフィルタリングの実装    | \_handleStreamMessageで実装 | PASS |
| 不正なexecutionIdのメッセージ処理 | 無視（早期リターン）        | PASS |

#### 懸念事項と対策

| 懸念                                            | リスク                     | 対策                               | 判定 |
| ----------------------------------------------- | -------------------------- | ---------------------------------- | ---- |
| Main Processが異なるexecutionIdを返却する可能性 | IDの不一致による状態不整合 | コンソール警告を出力、処理は継続   | PASS |
| 複数の実行が同時に発生した場合                  | 前の実行のメッセージが混入 | executionIdフィルタリングで防止    | PASS |
| Main ProcessでexecutionIdがnullの場合           | レガシー互換性             | Main Processで生成、後方互換性維持 | PASS |

### 4.2 IPCチャンネル使用状況

| チャンネル               | 用途                     | 呼び出し元               | 判定 |
| ------------------------ | ------------------------ | ------------------------ | ---- |
| skill:list               | 利用可能スキル取得       | fetchSkillsアクション    | PASS |
| skill:getImported        | インポート済みスキル取得 | fetchSkillsアクション    | PASS |
| skill:rescan             | スキル再スキャン         | rescanSkillsアクション   | PASS |
| skill:import             | スキルインポート         | importSkillアクション    | PASS |
| skill:remove             | スキル削除               | removeSkillアクション    | PASS |
| skill:execute            | スキル実行               | executeSkillアクション   | PASS |
| skill:abort              | 実行中断                 | abortExecutionアクション | PASS |
| skill:stream             | ストリームメッセージ受信 | setupSkillListeners      | PASS |
| skill:complete           | 実行完了通知             | setupSkillListeners      | PASS |
| skill:error              | エラー通知               | setupSkillListeners      | PASS |
| skill:permission-request | 権限リクエスト           | setupSkillListeners      | PASS |

---

## 5. 後方互換性レビュー

### 5.1 公開APIの互換性

| API                     | 変更内容                   | 互換性   | 判定 |
| ----------------------- | -------------------------- | -------- | ---- |
| useSkillExecution戻り値 | 内部実装のみ変更、型は維持 | 完全互換 | PASS |
| useSkillStore戻り値     | 内部実装のみ変更、型は維持 | 完全互換 | PASS |
| ChatPanelProps          | 変更なし                   | 完全互換 | PASS |
| ChatPanelHandle         | 変更なし                   | 完全互換 | PASS |
| AgentViewProps          | 変更なし                   | 完全互換 | PASS |

### 5.2 移行影響範囲

| 影響を受けるファイル          | 変更種別 | 影響度 | 移行難易度     |
| ----------------------------- | -------- | ------ | -------------- |
| store/slices/agentSlice.ts    | 拡張     | 大     | 中             |
| store/slices/skillSlice.ts    | 削除     | 大     | 低（単純削除） |
| store/index.ts                | 変更     | 中     | 低             |
| store/setupSkillListeners.ts  | 変更     | 中     | 低             |
| hooks/useSkillExecution.ts    | 変更     | 中     | 中             |
| views/AgentView/index.tsx     | 変更     | 中     | 中             |
| components/chat/ChatPanel.tsx | 微修正   | 低     | 低             |
| テストファイル（113件）       | 移行     | 大     | 中             |

### 5.3 破壊的変更の有無

| 項目                | 破壊的変更 | 理由                           |
| ------------------- | ---------- | ------------------------------ |
| 公開API             | なし       | 全ての公開APIは型互換性を維持  |
| IPCチャンネル       | なし       | チャンネル仕様は変更なし       |
| 永続化データ        | なし       | 永続化対象プロパティに変更なし |
| コンポーネントProps | なし       | 全て維持                       |

---

## 6. パフォーマンスレビュー

### 6.1 セレクターの最適化

| セレクター              | 最適化状況                                     | 判定  |
| ----------------------- | ---------------------------------------------- | ----- |
| useSkillStore           | オブジェクト全体を返却（再レンダリングリスク） | MINOR |
| useSkillExecutionStatus | 単一プロパティ選択（最適）                     | PASS  |
| useStreamingMessages    | 単一プロパティ選択（最適）                     | PASS  |
| usePendingPermission    | 単一プロパティ選択（最適）                     | PASS  |
| useIsExecuting          | 単一プロパティ選択（最適）                     | PASS  |

#### 改善提案

```typescript
// useSkillStoreの最適化提案（shallow比較を追加）
import { shallow } from "zustand/shallow";

export const useSkillStore = () =>
  useAppStore(
    (state) => ({
      // ... プロパティ
    }),
    shallow, // shallow比較を追加
  );
```

### 6.2 状態更新の効率性

| 状態更新パターン          | 効率性                       | 判定 |
| ------------------------- | ---------------------------- | ---- |
| streamingMessagesへの追加 | スプレッド演算子使用（O(n)） | PASS |
| executionStatusの更新     | 単一プロパティ更新（O(1)）   | PASS |
| 複数プロパティの同時更新  | 単一set呼び出しでバッチ更新  | PASS |

### 6.3 メモリ使用量

| 項目                        | 上限設定                         | 判定  |
| --------------------------- | -------------------------------- | ----- |
| streamingMessages           | 最大1000件で古いメッセージを削除 | PASS  |
| rememberedPermissionChoices | 上限なし（ツール名数に依存）     | MINOR |

#### 懸念事項

| 懸念                                | リスク               | 対策案                     | 判定  |
| ----------------------------------- | -------------------- | -------------------------- | ----- |
| rememberedPermissionChoicesの肥大化 | 長期使用でメモリ増加 | 将来タスクで上限設定を検討 | MINOR |

---

## 7. レビュー結果サマリー

### 7.1 判定基準

| 判定              | 意味             | 対応                          |
| ----------------- | ---------------- | ----------------------------- |
| PASS              | 問題なし         | Phase 4へ進行可能             |
| MINOR             | 軽微な課題あり   | 指摘対応後Phase 4へ進行可能   |
| MAJOR（要件問題） | 要件の問題あり   | Phase 1へ差し戻し             |
| MAJOR（設計問題） | 設計の問題あり   | Phase 2へ差し戻し             |
| CRITICAL          | 根本的な問題あり | Phase 1へ差し戻し、要件再確認 |

### 7.2 観点別判定

| 観点           | 判定  | MINOR指摘数                                              |
| -------------- | ----- | -------------------------------------------------------- |
| 仕様書準拠     | PASS  | 0                                                        |
| 型安全性       | MINOR | 1（cross-sliceアクセスの型キャスト）                     |
| IPC連携        | PASS  | 0                                                        |
| 後方互換性     | PASS  | 0                                                        |
| パフォーマンス | MINOR | 2（useSkillStoreのshallow、rememberedPermissionChoices） |

### 7.3 総合判定

| 項目            | 値                          |
| --------------- | --------------------------- |
| 総合判定        | **MINOR**                   |
| Phase 4への進行 | **可能**（MINOR指摘対応後） |
| 差し戻し        | なし                        |

---

## 8. MINOR指摘事項と対応

### 8.1 指摘一覧

| 指摘ID | 観点           | 内容                                                     | 優先度 | 対応方針                                                |
| ------ | -------------- | -------------------------------------------------------- | ------ | ------------------------------------------------------- |
| M-001  | 型安全性       | cross-sliceアクセスでの型キャスト（as unknown as）が残存 | 低     | 未タスクとして登録（型安全なcross-sliceパターンの調査） |
| M-002  | パフォーマンス | useSkillStoreにshallow比較が未適用                       | 中     | Phase 5実装時に対応                                     |
| M-003  | パフォーマンス | rememberedPermissionChoicesの上限未設定                  | 低     | 未タスクとして登録（将来対応）                          |

### 8.2 対応計画

| 指摘ID | 対応タイミング           | 対応内容                                   |
| ------ | ------------------------ | ------------------------------------------ |
| M-001  | Phase 12（未タスク検出） | 未タスク仕様書を作成、残課題テーブルに登録 |
| M-002  | Phase 5（実装）          | useSkillStoreにshallow比較を追加           |
| M-003  | Phase 12（未タスク検出） | 未タスク仕様書を作成、残課題テーブルに登録 |

---

## 9. レビュー実施記録

### 9.1 レビュー実施情報

| 項目           | 内容                                                 |
| -------------- | ---------------------------------------------------- |
| レビュー実施日 | 2026-02-09                                           |
| レビュアー     | Claude Code Agent                                    |
| レビュー対象   | phase-2-design.md                                    |
| レビュー手法   | セルフレビュー（設計レビューチェックリストに基づく） |

### 9.2 レビューチェックリスト完了状況

| カテゴリ       | チェック項目数 | 完了数 | 完了率  |
| -------------- | -------------- | ------ | ------- |
| 仕様書準拠     | 9              | 9      | 100%    |
| 型安全性       | 7              | 6      | 86%     |
| IPC連携        | 15             | 15     | 100%    |
| 後方互換性     | 8              | 8      | 100%    |
| パフォーマンス | 7              | 5      | 71%     |
| **合計**       | **46**         | **43** | **93%** |

---

## 10. 統合テスト連携【必須】

統合テスト観点のレビューゲートを実施:

| レビュー観点       | 確認項目                              |
| ------------------ | ------------------------------------- |
| IPC設計            | チャンネル名定数化、contextBridge経由 |
| 状態同期           | agentSlice単一ソース、セレクタ最適化  |
| エラーハンドリング | エラー伝達経路、UIフィードバック      |
| race condition対策 | executionId事前生成の設計妥当性       |

---

## 11. 完了条件

- [ ] 仕様書準拠の確認が完了
- [ ] 型安全性の確認が完了
- [ ] IPC連携の確認が完了
- [ ] 後方互換性の確認が完了
- [ ] パフォーマンスの確認が完了
- [ ] 判定結果（PASS/MINOR/MAJOR）が記録されている

---

## 12. 成果物

| 成果物                   | 説明                           |
| ------------------------ | ------------------------------ |
| phase-3-design-review.md | 本ドキュメント（設計レビュー） |

---

## 13. 次Phase

Phase 4: テスト作成 → `phase-4-test-creation.md`

**前提条件**: MINOR指摘（M-002）の対応方針をPhase 5実装時に適用することを確認
