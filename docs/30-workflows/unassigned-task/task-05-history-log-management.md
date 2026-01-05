# 履歴/ログ管理 - タスク指示書

## メタ情報

| 項目             | 内容                 |
| ---------------- | -------------------- |
| タスクID         | CONV-05              |
| タスク名         | 履歴/ログ管理        |
| 分類             | 要件/新規機能        |
| 対象機能         | ファイル変換システム |
| 優先度           | 高                   |
| 見積もり規模     | 中規模               |
| ステータス       | 未実施               |
| 発見元           | 初期要件定義         |
| 発見日           | 2025-12-15           |
| 発見エージェント | .claude/agents/sre-observer.md        |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

ファイル変換のバージョン履歴をUIで閲覧・管理し、変換処理のログを適切に記録・表示する機能が必要。ユーザーが過去の変換履歴を確認し、必要に応じて特定バージョンに戻せるようにする。

### 1.2 問題点・課題

- バージョン履歴をUIで確認する手段がない
- 変換処理のログが記録・表示されない
- 過去バージョンへの復元操作のUIがない
- 履歴データのフィルタリング・検索機能がない

### 1.3 放置した場合の影響

- ユーザーが変換履歴を確認できない
- 問題発生時のトラブルシューティングが困難
- 過去バージョンへの復元がCLI操作のみになり、UXが低下

---

## 2. 何を達成するか（What）

### 2.1 目的

ファイル変換の履歴表示・ログ管理UIと、バックエンドのログ記録機能を実装する。

### 2.2 最終ゴール

- ファイルごとのバージョン履歴一覧表示
- 各バージョンの詳細表示（変換内容、メタデータ）
- バージョン間の差分表示（オプション）
- 特定バージョンへの復元UI
- 変換処理ログの記録と表示
- 履歴のフィルタリング・検索機能

### 2.3 スコープ

#### 含むもの

- 履歴一覧UIコンポーネント
- バージョン詳細表示UIコンポーネント
- 復元操作UI
- ログ記録サービス
- ログ表示UIコンポーネント
- フィルタリング・検索機能

#### 含まないもの

- 外部ログ集約サービスとの連携（将来対応）
- 変換処理自体（CONV-02で対応）
- データベース操作のコアロジック（CONV-04で対応）

### 2.4 成果物

- `apps/desktop/src/renderer/components/VersionHistory.tsx` - 履歴一覧UI
- `apps/desktop/src/renderer/components/VersionDetail.tsx` - バージョン詳細UI
- `apps/desktop/src/renderer/components/ConversionLogs.tsx` - ログ表示UI
- `packages/shared/src/services/conversion-logger.ts` - ログ記録サービス
- `packages/shared/src/services/history-service.ts` - 履歴取得サービス
- ユニットテスト・統合テスト

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- データベース保存・バージョン管理（CONV-04）が完成済み
- ファイル選択機能（CONV-01）が完成済み
- React + Zustand環境がセットアップ済み

### 3.2 依存タスク

- CONV-04: データベース保存・バージョン管理（履歴データの取得元）
- CONV-01: ファイル選択機能（ファイル情報の連携）

### 3.3 必要な知識・スキル

- React コンポーネント設計
- Zustand 状態管理
- ログ設計・実装
- UIデザインパターン（リスト表示、詳細表示）
- 日付フォーマット・タイムゾーン処理

### 3.4 推奨アプローチ

1. 履歴データ取得サービスを実装
2. ログ記録サービスを実装
3. 履歴一覧UIを実装
4. バージョン詳細・復元UIを実装
5. ログ表示UIを実装
6. TDDでテストを先に作成

---

## 4. 実行手順

### Phase構成

```
Phase 0: 要件定義 → Phase 1: 設計 → Phase 2: 設計レビュー →
Phase 3: テスト作成 → Phase 4: 実装 → Phase 5: リファクタリング →
Phase 6: 品質保証 → Phase 7: 最終レビュー → Phase 8: 手動テスト
```

### Phase 0: 要件定義

#### 目的

履歴表示・ログ管理の詳細要件を明確化する。

#### Claude Code スラッシュコマンド

```
/ai:gather-requirements history-log-management
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/req-analyst.md
- **選定理由**: 機能要件の詳細化、ユーザー体験の設計に適任
- **代替候補**: .claude/agents/ui-designer.md（UI要件が中心の場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名                | 活用方法           | 選定理由                   |
| ----------------------- | ------------------ | -------------------------- |
| .claude/skills/use-case-modeling/SKILL.md       | ユースケースの特定 | ユーザー操作フローの明確化 |
| .claude/skills/log-rotation-strategies/SKILL.md | ログ管理戦略       | ログ量の管理               |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- 履歴表示要件定義書
- ログ管理仕様書
- UI画面設計（ワイヤーフレーム）

#### 完了条件

- [ ] 履歴表示のUIフローが定義
- [ ] ログ記録項目が決定
- [ ] 復元操作のフローが定義

---

### Phase 1: 設計

#### 目的

履歴表示・ログ管理のUIとバックエンド設計を行う。

#### Claude Code スラッシュコマンド

```
/ai:create-component VersionHistory history
/ai:design-architecture history-log
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: UIコンポーネントの設計に特化
- **代替候補**: .claude/agents/electron-ui-dev.md（Electron固有のUIパターンが必要な場合）
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名               | 活用方法             | 選定理由             |
| ---------------------- | -------------------- | -------------------- |
| .claude/skills/progressive-disclosure/SKILL.md | 段階的情報開示       | 複雑な履歴情報の整理 |
| .claude/skills/accessibility-wcag/SKILL.md     | アクセシビリティ対応 | ユーザビリティの確保 |
| .claude/skills/custom-hooks-patterns/SKILL.md  | カスタムフック設計   | ロジックの再利用     |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- UIコンポーネント設計書
- カスタムフック設計
- ログサービス設計

#### 完了条件

- [ ] UIコンポーネント構成が決定
- [ ] 状態管理の設計が完了
- [ ] ログサービスのインターフェースが定義

---

### Phase 3: テスト作成 (TDD: Red)

#### 目的

履歴表示・ログ管理のテストを先に作成する。

#### Claude Code スラッシュコマンド

```
/ai:generate-component-tests apps/desktop/src/renderer/components/VersionHistory.tsx
/ai:generate-unit-tests packages/shared/src/services/conversion-logger.ts
/ai:generate-unit-tests packages/shared/src/services/history-service.ts
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/frontend-tester.md
- **選定理由**: フロントエンドコンポーネントのテストに特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名           | 活用方法             | 選定理由               |
| ------------------ | -------------------- | ---------------------- |
| .claude/skills/test-doubles/SKILL.md       | モック・スタブの活用 | バックエンド依存の分離 |
| .claude/skills/playwright-testing/SKILL.md | E2Eテスト設計        | UIフローの検証         |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- `apps/desktop/src/renderer/components/__tests__/VersionHistory.test.tsx`
- `packages/shared/src/services/__tests__/conversion-logger.test.ts`
- `packages/shared/src/services/__tests__/history-service.test.ts`

#### 完了条件

- [ ] UIコンポーネントのテストが作成済み
- [ ] サービスのテストが作成済み
- [ ] テストが失敗すること（Red状態）を確認

---

### Phase 4: 実装 (TDD: Green)

#### 目的

テストを通すための最小限の実装を行う。

#### Claude Code スラッシュコマンド

```
/ai:create-component VersionHistory list
/ai:create-component VersionDetail detail
/ai:create-component ConversionLogs logs
```

#### 使用エージェントリスト（動的選定）

- **エージェント**: .claude/agents/electron-ui-dev.md
- **選定理由**: Electron UIコンポーネントの実装に特化
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキルリスト（動的選定）

| スキル名          | 活用方法           | 選定理由             |
| ----------------- | ------------------ | -------------------- |
| .claude/skills/state-lifting/SKILL.md     | 状態の適切な配置   | コンポーネント間連携 |
| .claude/skills/error-boundary/SKILL.md    | エラーハンドリング | UX向上               |
| .claude/skills/localization-i18n/SKILL.md | 日付表示の国際化   | 多言語対応準備       |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

- 履歴表示UIコンポーネント一式
- ログ記録・表示サービス
- 状態管理ストア

#### 完了条件

- [ ] テストが成功すること（Green状態）を確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] ファイルごとの履歴一覧が表示される
- [ ] 各バージョンの詳細が表示される
- [ ] 特定バージョンへの復元が動作する
- [ ] 変換ログが記録される
- [ ] ログが表示される
- [ ] 履歴のフィルタリングが動作する

### 品質要件

- [ ] 全テストがパス
- [ ] TypeScript型エラーなし
- [ ] ESLint警告なし
- [ ] テストカバレッジ80%以上
- [ ] 100件以上の履歴でのパフォーマンスが1秒以内

### ドキュメント要件

- [ ] 各コンポーネントのJSDocが記述されている
- [ ] ログフォーマットが文書化されている
- [ ] 復元操作の手順が文書化されている

---

## 6. 検証方法

### テストケース

1. 履歴一覧の表示
2. 履歴のページネーション（大量データ対応）
3. バージョン詳細の表示
4. バージョン復元の実行
5. 復元後の履歴更新
6. ログの記録と表示
7. フィルタリング・検索の動作

### 検証手順

1. `pnpm --filter @repo/desktop test:run` でユニットテスト実行
2. `pnpm --filter @repo/desktop dev` で手動確認
3. 大量データでのパフォーマンステスト

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                               |
| ------------------------------ | ------ | -------- | ---------------------------------- |
| 大量履歴での表示パフォーマンス | 中     | 中       | 仮想スクロール、ページネーション   |
| ログ量の肥大化                 | 中     | 中       | ログローテーション、古いログの削除 |
| 復元操作の誤クリック           | 高     | 低       | 確認ダイアログの実装               |
| タイムゾーン表示の不整合       | 低     | 中       | UTC基準 + ローカル変換の統一       |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/00-requirements/master_system_design.md`
- `docs/00-requirements/16-ui-ux-guidelines.md`
- CONV-04: データベース保存・バージョン管理（データソース）

### 参考資料

- React Virtualized: https://github.com/bvaughn/react-virtualized
- date-fns Documentation: https://date-fns.org/

---

## 9. 備考

### 推奨UIコンポーネント構造（参考）

```tsx
// VersionHistory.tsx - 履歴一覧
interface VersionHistoryProps {
  fileId: string;
}

// VersionDetail.tsx - バージョン詳細
interface VersionDetailProps {
  conversionId: string;
  onRestore: () => void;
}

// ConversionLogs.tsx - ログ表示
interface ConversionLogsProps {
  fileId?: string; // 特定ファイルのログのみ表示する場合
  level?: "info" | "warn" | "error"; // フィルタリング
}
```

### ログ記録項目（参考）

```typescript
interface ConversionLog {
  id: string;
  timestamp: Date;
  level: "info" | "warn" | "error";
  fileId: string;
  fileName: string;
  action: "convert" | "restore" | "delete";
  message: string;
  details?: Record<string, unknown>;
}
```

### 補足事項

- このタスクはCONV-04（データベース保存・バージョン管理）完了後に実装
- ログは初期段階ではローカルストレージ、将来的には外部サービス連携も検討
- 差分表示機能は初期リリースではオプションとし、ユーザーフィードバックに基づいて実装判断
