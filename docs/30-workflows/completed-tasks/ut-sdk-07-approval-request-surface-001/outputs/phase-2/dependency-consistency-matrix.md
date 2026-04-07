# 依存整合マトリクス - UT-SDK-07-APPROVAL-REQUEST-SURFACE-001

## 作成日: 2026-04-06

## Phase: 2

---

## 変更ファイル間の依存関係

```
skill-creator-api.ts
  ├─ 依存: channels.ts（IPC_CHANNELS.APPROVAL_REQUEST）← 変更なし
  ├─ 依存: ipc-utils.ts（invokeWithTimeout）← 変更なし
  └─ 依存: @repo/shared/types（型インポート）← 変更なし

SkillLifecyclePanel.tsx
  ├─ 依存: skill-creator-api.ts（onApprovalRequest 追加後）← 変更
  ├─ 依存: ApprovalSheet.tsx（再利用）← 変更なし
  ├─ 依存: getSkillCreatorApi() ヘルパー（既存）← 変更なし
  └─ 依存: disclosureInfo state（既存）← 変更なし
```

---

## 依存関係チェックリスト

| 依存                                           | 変更有無 | 影響評価                  |
| ---------------------------------------------- | -------- | ------------------------- |
| `IPC_CHANNELS.APPROVAL_REQUEST` in channels.ts | 変更なし | ✅ 影響なし               |
| `ALLOWED_ON_CHANNELS` in channels.ts           | 変更なし | ✅ 登録済み               |
| `ApprovalSheet.tsx` コンポーネント             | 変更なし | ✅ 再利用のみ             |
| `respondToApproval` メソッド                   | 変更なし | ✅ 接続先として使用       |
| `getDisclosureInfo` メソッド                   | 変更なし | ✅ 参照なし（state 流用） |
| `disclosureInfo` state                         | 変更なし | ✅ 既存 state を流用      |

---

## 型依存チェック

| 型                                     | 定義元                       | 変更有無 | 備考                                |
| -------------------------------------- | ---------------------------- | -------- | ----------------------------------- |
| `ApprovalRequestPayload` (local alias) | `SkillLifecyclePanel.tsx` 内 | 新規     | shared に逃がさない                 |
| `SkillCreatorRuntimeApi`               | `SkillLifecyclePanel.tsx` 内 | 追加     | `onApprovalRequest?` フィールド追加 |
| `IPC_CHANNELS.APPROVAL_REQUEST`        | `channels.ts`                | 変更なし | 既存定数                            |

---

## リスク評価

| リスク                                           | 深刻度 | 対策                       |
| ------------------------------------------------ | ------ | -------------------------- |
| `SkillCreatorRuntimeApi` への追加忘れ            | HIGH   | Phase 5 実装時に必ず確認   |
| `normalizeApprovalOperationType` の変換ミス      | MEDIUM | Phase 4 でテストケース追加 |
| approval 後に `pendingApproval` がクリアされない | MEDIUM | TC-APPR-17/18 で検証       |
| cleanup 漏れ（useEffect return）                 | LOW    | TC-APPR-10 で検証          |
