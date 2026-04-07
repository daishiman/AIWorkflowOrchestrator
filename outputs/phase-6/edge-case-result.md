# Phase 6: エッジケーステスト結果

## UT-SDK-07-APPROVAL-REQUEST-SURFACE-001 Phase 6

## 対象エッジケース

### TC-APPR-11: 多重購読シナリオ

**シナリオ**: onApprovalRequest を2回呼び出して複数のコールバックを登録した場合

**検証内容**:

- 各登録ごとに独立した listener が生成される
- 各 listener を発火すると対応するコールバックが呼ばれる
- 一方の listener 発火が他方のコールバックに影響しない

**結果**: PASS

### TC-APPR-12: アンサブスクライブ後の再購読シナリオ

**シナリオ**: unsubscribe 後に再度 onApprovalRequest を呼び出す

**検証内容**:

- unsubscribe が removeListener を呼ぶ
- 再購読で新しい listener が ipcRenderer.on に登録される
- ipcRenderer.on の呼び出し回数が2回になる

**結果**: PASS

### TC-APPR-13: チャンネルホワイトリスト検証

**シナリオ**: APPROVAL_REQUEST チャンネルが ALLOWED_ON_CHANNELS に含まれている場合の safeOn 動作

**検証内容**:

- APPROVAL_REQUEST は許可チャンネルのため console.error が発生しない
- ipcRenderer.on が正常に呼ばれる

**結果**: PASS

### TC-APPR-16: 初期状態（approval 未発火）

**シナリオ**: コンポーネントレンダリング直後、approval callback を発火させない

**検証内容**:

- approval-sheet が DOM に存在しない
- pendingApproval state が null の状態を反映している

**結果**: PASS

### TC-APPR-17/18: approve/reject 後のクリア

**シナリオ**: approval-sheet 表示後にボタンを押下

**検証内容**:

- approve/reject 後に approval-sheet が DOM から消える
- pendingApproval state がクリアされる

**結果**: PASS（両方）

## エッジケーステスト総合評価

全エッジケース PASS。実装は多重購読・再購読・未発火・アクション後クリアの各シナリオで正しく動作する。
