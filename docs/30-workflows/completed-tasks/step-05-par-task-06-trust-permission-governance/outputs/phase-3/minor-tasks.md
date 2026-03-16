# Phase 3: MINOR 指摘一覧と対応方針

## 1. メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| タスク ID | TASK-SKILL-LIFECYCLE-06          |
| Phase     | 3: 設計レビュー                  |
| 作成日    | 2026-03-16                       |
| 指摘件数  | 3件                              |
| 総合判定  | MINOR（未タスク化後 Phase 4 へ） |

---

## 2. MINOR 指摘一覧

| 指摘 ID  | 観点 # | 概要                                                     | 影響度 | 対応方針                      |
| -------- | ------ | -------------------------------------------------------- | ------ | ----------------------------- |
| MINOR-01 | 2      | Criticalダイアログの「キャンセル（保留）」選択肢が未定義 | 低     | Phase 5 以降で設計判断を追加  |
| MINOR-02 | 3      | AllowedToolEntryV2 拡張フィールドの Phase 1/2 間不統一   | 中     | Phase 5 開始前に統合型を確定  |
| MINOR-03 | 5      | 承認履歴の時間ベース保持期間ポリシーの判断根拠が未記載   | 低     | Phase 12 で設計判断根拠を追記 |

---

## 3. 各指摘の詳細と対応方針

### MINOR-01: Criticalダイアログの「キャンセル（保留）」選択肢の追加

**観点:** 2（UX とセキュリティのバランス）

**不足内容:**

Phase 2 abort-fallback-design.md の Critical ダイアログに「キャンセル（保留）」選択肢が定義されていない。abort/skip/retry の3種フローは定義済みだが、「操作を保留して後で判断する」選択肢が未考慮。ユーザーが X ボタンや Escape キーでダイアログを閉じた場合の挙動が未定義。

**対応 Phase:** Phase 5（型定義正式化時に追加）

**対応要否:** 要（セキュリティ UX の完全性確保）

**対応方針:**

Phase 5（実装）の PermissionDialog 拡張時に以下の設計判断を追加する:

- X ボタン / Escape キー押下時は `denied` として処理する（フェイルセキュア原則に準拠）
- タイムアウト（300秒）で `denied` にフォールバックする既存設計と一貫性を持たせる
- 「保留」状態は新たな権限状態モードの追加を伴うため、初期リリースでは実装しない

**委譲先:** Phase 5 実装時に abort-fallback-design.md を補完。後続タスクへの委譲は不要（Phase 5 内で完結可能な範囲）。

---

### MINOR-02: AllowedToolEntryV2 型定義の統一

**観点:** 3（既存契約との整合性）

**不足内容:**

Phase 1 OUT-3 の `AllowedToolEntryV2` 拡張フィールド:

- `riskLevel: RiskLevel`
- `skillId: string`
- `skillVersion: string`
- `triggerContext: TriggerContext`

Phase 2 permission-persistence-design.md の `AllowedToolEntryV2` 拡張フィールド:

- `expiresAt?: number`
- `skillName?: string`
- `expiryPolicy?: "session" | "time_24h" | "time_7d" | "permanent"`

両 Phase 間でフィールド説明の表現揺れがあり、統合した最終的な `AllowedToolEntryV2` 型が未確定。

**対応 Phase:** Phase 5（正式版型定義で統一）

**対応要否:** 要（型定義の正本一元化）

**対応方針:**

Phase 5（実装）開始前に統合型を確定する。統合後の `AllowedToolEntryV2` は以下の全フィールドを含む:

```typescript
interface AllowedToolEntryV2 extends AllowedToolEntry {
  // Phase 1 由来
  riskLevel?: RiskLevel;
  skillId?: string;
  skillVersion?: string;
  triggerContext?: TriggerContext;
  // Phase 2 由来
  expiresAt?: number;
  skillName?: string;
  expiryPolicy?: "session" | "time_24h" | "time_7d" | "permanent";
}
```

全フィールドを optional とし、V1 エントリとの後方互換性を維持する。配置先は `packages/shared/src/types/permission.ts`。

**委譲先:** Phase 5 実装時に型定義を確定。Phase 4（テスト作成）ではテストモック内で統合型を先行使用する。

---

### MINOR-03: 時間ベース保持ポリシー不採用の設計根拠が未記載

**観点:** 5（失効・取り消しの完全性）

**不足内容:**

承認履歴の保持期間は FIFO 件数制限（1000件）のみで設計されている。時間ベースの保持期間制限（例: 90日後の自動削除）を実装しない設計判断の根拠が明示されていない。

**対応 Phase:** Phase 12（ドキュメント）

**対応要否:** 要（設計意図の文書化）

**対応方針:**

Phase 12（ドキュメント）で以下の設計判断根拠を追記する:

1. **件数制限で十分な理由**: 一般的なスキル利用頻度（1日10-50件の権限判断）では、1000件の FIFO バッファで20-100日分の履歴が保持される。初期リリースではこの範囲で十分と判断する。
2. **時間ベース制限を初期リリースで実装しない理由**: 時間ベース削除は定期的なバックグラウンドタスク（タイマーまたは `setInterval`）の実装が必要であり、Electron の Main Process のライフサイクル管理と連携する設計が追加で必要になる。件数制限の方が実装が単純で、FIFO 削除は `addHistoryEntry` の呼び出し時に同期的に実行できる。
3. **将来的な拡張ポイント**: GDPR 等のデータ保持規制への対応が必要になった場合、`purgeExpired()` メソッド（Phase 2 permission-persistence-design.md セクション8.2 で定義済み）を拡張して時間ベース削除を追加する。

**委譲先:** Phase 12（ドキュメント）の documentation-changelog.md に記録。後続タスクへの委譲は不要。
