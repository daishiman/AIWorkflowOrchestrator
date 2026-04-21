# Phase 2: 設計

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 2                    |
| タスクID   | TASK-RALLY-011       |
| 機能名     | 送信中競合防止UI強化 |
| 前提Phase  | Phase 1              |
| 後続Phase  | Phase 3              |
| 作成日     | 2026-04-21           |
| ステータス | pending              |

## 目的

`pendingSnapshotRef` バッファリングと `activeSnapshot` state による2段構成の実装設計を固定する。

## 直列/並列情報

- **バッファリング実装方針の設計は直列**（競合するロジックが多く、並列設計は矛盾を生むリスクがある）
- RALLY-010 で追加された `isRallyCompleted` との整合も確認する

## 問題と解決策

```
問題: isSubmitting中にonWorkflowStateChangedで新snapshotが来ると
      「送信中ローディング」と「次の質問」が同時表示される競合が起きる

解決: pendingSnapshotRefにpush受信内容をバッファし、
      submit完了時（finally）にactiveSnapshotへ移行する2段構成
```

## 変更箇所設計

**対象ファイル**: `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx`

### 1. `pendingSnapshotRef` と `activeSnapshot` の追加

```tsx
// isSubmitting中に届いたworkflowSnapshotをバッファリングするref
const pendingSnapshotRef = useRef<SkillCreatorWorkflowUiSnapshot | null>(null);
// 内部で管理するworkflowSnapshotの表示用ステート
const [activeSnapshot, setActiveSnapshot] =
  useState<SkillCreatorWorkflowUiSnapshot | null>(workflowSnapshot);
```

### 2. `workflowSnapshot` props変化のバッファリング制御

```tsx
// workflowSnapshot propsが変化したとき
// isSubmitting中はバッファに入れ、完了後に適用する
useEffect(() => {
  if (isSubmitting) {
    pendingSnapshotRef.current = workflowSnapshot;
  } else {
    setActiveSnapshot(workflowSnapshot);
  }
}, [workflowSnapshot, isSubmitting]);
```

### 3. isSubmitting完了時にバッファを適用

```tsx
// isSubmittingがfalseに変わったとき、バッファにスナップショットがあれば適用
useEffect(() => {
  if (!isSubmitting && pendingSnapshotRef.current !== null) {
    setActiveSnapshot(pendingSnapshotRef.current);
    pendingSnapshotRef.current = null;
  }
}, [isSubmitting]);
```

### 4. UI表示での `workflowSnapshot` 参照を `activeSnapshot` に置き換え

`pendingRequest` の導出やUI表示制御での `workflowSnapshot` 参照を `activeSnapshot` に切り替える。
ただし、submitの実際のIPC呼び出しには最新の `workflowSnapshot`（props）を使用する。

## 参照資料

| 資料名           | パス                                            | 説明           |
| ---------------- | ----------------------------------------------- | -------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`    | Phase 1 成果物 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`        | Phase 1 成果物 |
| 競合シナリオ分析 | `outputs/phase-1/conflict-scenario-analysis.md` | Phase 1 成果物 |

## 成果物

| 成果物               | パス                                    | 説明                     |
| -------------------- | --------------------------------------- | ------------------------ |
| バッファリング設計書 | `outputs/phase-2/buffering-design.md`   | 2段構成の詳細設計        |
| 変更差分設計         | `outputs/phase-2/change-diff-design.md` | 変更前後のコード差分設計 |

## 完了条件

- [ ] `pendingSnapshotRef` と `activeSnapshot` の役割が明確に設計されていること
- [ ] バッファリング制御 useEffect が設計されていること
- [ ] IPC呼び出し（submitのみ）は props の `workflowSnapshot` を参照することが明記されていること
- [ ] RALLY-010 の `isRallyCompleted` との整合が確認されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js \
  docs/30-workflows/skill-create-flow-gaps/p11-seq-RALLY-011
```

## 次のPhase

Phase 3: 設計レビューゲート
