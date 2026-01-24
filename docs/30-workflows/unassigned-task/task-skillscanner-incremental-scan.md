# SkillScanner 増分スキャン機能 - タスク指示書

## メタ情報

```yaml
issue_number: 476
```

## メタ情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| タスクID     | task-perf-skillscanner-incr-001 |
| タスク名     | SkillScanner 増分スキャン機能   |
| 分類         | パフォーマンス                  |
| 対象機能     | SkillScanner                    |
| 優先度       | 低                              |
| 見積もり規模 | 中規模                          |
| ステータス   | 未実施                          |
| 発見元       | Phase 12: ドキュメント更新      |
| 発見日       | 2026-01-24                      |
| 関連タスク   | TASK-2A（SkillScanner実装）     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-2Aで実装されたSkillScannerは、scanAll()呼び出しごとに全スキルディレクトリを
フルスキャンする設計となっている。スキルファイルの変更は頻繁には発生しないため、
変更があったスキルのみを検出・更新する増分スキャン機能を実装することで、
より効率的なスキル管理が可能となる。

### 1.2 問題点・課題

| 問題点                             | 影響                               |
| ---------------------------------- | ---------------------------------- |
| 変更がなくても毎回フルスキャン     | 不要なI/O・CPU負荷                 |
| スキル追加/削除/更新の即座検出不可 | ユーザーがUIをリロードする必要あり |
| ファイル変更の追跡なし             | スキル更新のリアルタイム反映が困難 |

### 1.3 放置した場合の影響

| 影響カテゴリ | 内容                                     |
| ------------ | ---------------------------------------- |
| ユーザー体験 | スキル変更時に手動リロードが必要         |
| 開発効率     | スキル開発時のフィードバックループが遅い |
| システム効率 | 変更がなくても不要なスキャンが実行される |

---

## 2. 何を達成するか（What）

### 2.1 目的

ファイルシステムの変更監視（fs.watch）を活用し、変更があったスキルのみを
増分更新する仕組みを実装する。これによりスキャン効率を向上させ、
スキル変更のリアルタイム検出を可能にする。

### 2.2 最終ゴール

- スキルディレクトリの変更（追加/削除/更新）をリアルタイム検出
- 変更があったスキルのみをパース・更新
- 変更イベントをRendererへ通知（IPC経由）
- フルスキャンと増分スキャンの併用が可能

### 2.3 スコープ

#### 含むもの

- fs.watch/chokidarによるファイル監視
- 変更検出時の増分スキャンロジック
- SkillScannerへのwatchモード追加
- 変更イベントのIPC通知

#### 含まないもの

- クロスプラットフォームファイルロック
- ネットワークドライブ対応
- シンボリックリンク先の変更監視

### 2.4 成果物

| 成果物           | 説明                         |
| ---------------- | ---------------------------- |
| ファイル監視実装 | `SkillScanner.ts`に追加      |
| 変更イベント型   | `@repo/shared`に追加         |
| IPC通知実装      | `skill:changed`チャネル追加  |
| ユニットテスト   | 増分スキャン動作の検証テスト |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-2A（SkillScanner実装）が完了していること
- Node.js fs.watch APIの理解
- オプション: chokidarライブラリの追加

### 3.2 依存タスク

| タスクID | タイトル         | 状態 |
| -------- | ---------------- | ---- |
| TASK-2A  | SkillScanner実装 | 完了 |

### 3.3 必要な知識

- Node.js fs.watch / chokidar
- Electron IPC通信
- イベント駆動アーキテクチャ

### 3.4 推奨アプローチ

```typescript
// 変更イベント型
interface SkillChangeEvent {
  type: "added" | "modified" | "removed";
  skillPath: string;
  skillName: string;
  timestamp: number;
}

// SkillScanner拡張
class SkillScanner {
  private watcher: FSWatcher | null = null;
  private onChangeCallback?: (event: SkillChangeEvent) => void;

  startWatching(callback: (event: SkillChangeEvent) => void): void {
    this.onChangeCallback = callback;
    this.watcher = chokidar.watch(this.watchPaths, {
      ignoreInitial: true,
      depth: 2,
      ignored: /(^|[\/\\])\../, // 隠しファイルを無視
    });

    this.watcher.on("add", (path) => this.handleChange("added", path));
    this.watcher.on("change", (path) => this.handleChange("modified", path));
    this.watcher.on("unlink", (path) => this.handleChange("removed", path));
  }

  stopWatching(): void {
    this.watcher?.close();
    this.watcher = null;
  }

  private handleChange(type: SkillChangeEvent["type"], path: string): void {
    const skillName = this.extractSkillName(path);
    this.onChangeCallback?.({
      type,
      skillPath: path,
      skillName,
      timestamp: Date.now(),
    });
  }
}
```

---

## 4. 実行手順

### Phase構成

| Phase | 名称       | 目的                         |
| ----- | ---------- | ---------------------------- |
| 1     | 設計       | ファイル監視の詳細設計       |
| 2     | テスト作成 | 変更検出のテスト             |
| 3     | 実装       | ファイル監視機能の実装       |
| 4     | IPC統合    | Renderer通知の実装           |
| 5     | 検証       | 動作検証・エッジケーステスト |

### Phase 1: 設計

#### 目的

ファイル監視の詳細設計を行う。

#### 手順

1. 監視対象パスの決定
2. SkillChangeEvent型の設計
3. startWatching/stopWatching APIの設計
4. IPC通知チャネルの設計

#### 成果物

- 設計ドキュメント（outputs/phase-1/design.md）

#### 完了条件

- [ ] 監視対象パスが明確に定義されている
- [ ] イベント型が設計されている
- [ ] API設計が完了している

### Phase 2: テスト作成（TDD Red）

#### 目的

変更検出を検証するテストを作成する。

#### 手順

1. ファイル追加時の検出テスト
2. ファイル変更時の検出テスト
3. ファイル削除時の検出テスト
4. 監視開始/停止のテスト

#### 成果物

- `SkillScanner.test.ts`へのテスト追加

#### 完了条件

- [ ] 変更検出テストが5件以上作成されている
- [ ] テストがFAIL状態（未実装のため）

### Phase 3: 実装（TDD Green）

#### 目的

ファイル監視機能を実装してテストをPASSさせる。

#### 手順

1. chokidarをdevDependenciesに追加
2. SkillChangeEvent型を@repo/sharedに追加
3. startWatching()を実装
4. stopWatching()を実装
5. handleChange()を実装

#### 成果物

- `SkillScanner.ts`の更新
- `packages/shared/src/types/skill.ts`の更新

#### 完了条件

- [ ] 全テストがPASS
- [ ] 型チェックがPASS
- [ ] Lintエラーなし

### Phase 4: IPC統合

#### 目的

Rendererへの変更通知を実装する。

#### 手順

1. `skill:changed` IPCチャネルを定義
2. Main ProcessでSkillScanner.startWatching()を呼び出し
3. 変更イベントをRendererへ送信
4. Renderer側でイベントリスナーを実装

#### 成果物

- IPCハンドラーの更新
- Preload APIの更新

#### 完了条件

- [ ] 変更イベントがRendererで受信可能
- [ ] UIがリアルタイムで更新される

### Phase 5: 検証

#### 目的

動作検証とエッジケースのテストを行う。

#### 手順

1. 実環境でスキル追加/削除/更新をテスト
2. 高頻度変更時の動作確認
3. Watcher停止後の再開テスト

#### 成果物

- 検証レポート

#### 完了条件

- [ ] 全動作シナリオが正常動作
- [ ] エッジケースでエラーが発生しない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] startWatching()でファイル監視が開始される
- [ ] stopWatching()で監視が停止される
- [ ] ファイル追加時にaddedイベントが発火
- [ ] ファイル変更時にmodifiedイベントが発火
- [ ] ファイル削除時にremovedイベントが発火
- [ ] skill:changed IPC経由でRendererに通知される

### 品質要件

- [ ] テストカバレッジ: Line 80%以上
- [ ] 型チェック: PASS
- [ ] Lint: エラーなし

### ドキュメント要件

- [ ] システム仕様書（interfaces-agent-sdk.md）に記載
- [ ] IPCチャネル仕様を更新

---

## 6. 検証方法

### テストケース

| TC-ID  | シナリオ             | 期待結果                     |
| ------ | -------------------- | ---------------------------- |
| TC-001 | スキル追加           | addedイベントが発火          |
| TC-002 | SKILL.md更新         | modifiedイベントが発火       |
| TC-003 | スキル削除           | removedイベントが発火        |
| TC-004 | stopWatching()後     | イベントが発火しない         |
| TC-005 | 高頻度変更（1秒5件） | 全イベントが正確に検出される |

### 検証手順

1. ユニットテストを実行: `pnpm --filter @repo/desktop test SkillScanner`
2. 手動でスキルファイルを追加/変更/削除してUI反映を確認
3. 型チェック: `pnpm --filter @repo/desktop typecheck`

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                           |
| ---------------------------- | ------ | -------- | ------------------------------ |
| 高頻度変更でのイベント漏れ   | 中     | 低       | debounce処理の追加             |
| クロスプラットフォーム互換性 | 中     | 中       | chokidarで抽象化               |
| メモリリーク（Watcher）      | 中     | 低       | stopWatching()の適切な呼び出し |
| 隠しファイル誤検出           | 低     | 低       | ignoredパターンで除外          |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント               | パス                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| SkillScanner型定義         | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  |
| SkillScannerアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` |
| TASK-2A実装ガイド          | `docs/30-workflows/TASK-2A/outputs/phase-12/implementation-guide.md`         |

### 参考資料

- [chokidar - Minimal and efficient cross-platform file watching](https://github.com/paulmillr/chokidar)
- [Node.js fs.watch](https://nodejs.org/api/fs.html#fswatchfilename-options-listener)

---

## 9. 備考

### 発見経緯

TASK-2A Phase 12でのドキュメント更新時に「将来の改善提案」として記録された項目。
スキル開発のワークフロー改善に効果的だが、現状は優先度「低」。

### 補足事項

- キャッシュ機能（別タスク）と組み合わせることで更に効果的
- Electron環境ではMain Processでのみファイル監視を実行

---

## 変更履歴

| Version | Date       | Changes  |
| ------- | ---------- | -------- |
| 1.0.0   | 2026-01-24 | 初版作成 |
