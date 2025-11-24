#!/usr/bin/env python3
"""
RICE Score Calculator
優先順位付けのためのRICEスコア計算ツール

Usage: python rice-calculator.py
"""

import json
import sys
from typing import List, Dict, Tuple
from dataclasses import dataclass
from datetime import datetime

@dataclass
class Feature:
    """機能/タスクのデータクラス"""
    name: str
    reach: float  # ユーザー数/四半期
    impact: float  # 0.25, 0.5, 1, 2, 3
    confidence: float  # 0.5, 0.8, 1.0
    effort: float  # 人月
    description: str = ""
    owner: str = ""

    @property
    def rice_score(self) -> float:
        """RICEスコアを計算"""
        if self.effort == 0:
            return float('inf')
        return (self.reach * self.impact * self.confidence) / self.effort

    def to_dict(self) -> dict:
        """辞書形式に変換"""
        return {
            'name': self.name,
            'reach': self.reach,
            'impact': self.impact,
            'confidence': self.confidence,
            'effort': self.effort,
            'rice_score': round(self.rice_score, 2),
            'description': self.description,
            'owner': self.owner
        }

class RICECalculator:
    """RICE Score計算機"""

    IMPACT_MAPPING = {
        'massive': 3,
        'high': 2,
        'medium': 1,
        'low': 0.5,
        'minimal': 0.25
    }

    CONFIDENCE_MAPPING = {
        'high': 1.0,
        'medium': 0.8,
        'low': 0.5
    }

    def __init__(self):
        self.features: List[Feature] = []

    def add_feature_interactive(self) -> Feature:
        """対話的に機能を追加"""
        print("\n=== 新規機能/タスクの追加 ===")

        name = input("機能名: ").strip()
        if not name:
            raise ValueError("機能名は必須です")

        # Reach
        print("\nReach: 影響を受けるユーザー数（四半期あたり）")
        while True:
            try:
                reach = float(input("ユーザー数: "))
                if reach < 0:
                    raise ValueError("正の数を入力してください")
                break
            except ValueError as e:
                print(f"エラー: {e}")

        # Impact
        print("\nImpact: 影響の大きさ")
        print("  massive (3): 劇的な改善")
        print("  high (2): 大きな改善")
        print("  medium (1): 中程度の改善")
        print("  low (0.5): 小さな改善")
        print("  minimal (0.25): 最小限の改善")
        while True:
            impact_str = input("Impact [massive/high/medium/low/minimal]: ").lower()
            if impact_str in self.IMPACT_MAPPING:
                impact = self.IMPACT_MAPPING[impact_str]
                break
            print("正しい値を選択してください")

        # Confidence
        print("\nConfidence: 成功の確信度")
        print("  high (100%): データで実証済み")
        print("  medium (80%): 強い根拠あり")
        print("  low (50%): 仮説レベル")
        while True:
            conf_str = input("Confidence [high/medium/low]: ").lower()
            if conf_str in self.CONFIDENCE_MAPPING:
                confidence = self.CONFIDENCE_MAPPING[conf_str]
                break
            print("正しい値を選択してください")

        # Effort
        print("\nEffort: 必要な工数")
        while True:
            try:
                effort = float(input("人月: "))
                if effort <= 0:
                    raise ValueError("正の数を入力してください")
                break
            except ValueError as e:
                print(f"エラー: {e}")

        # Optional fields
        description = input("\n説明（オプション）: ").strip()
        owner = input("担当者（オプション）: ").strip()

        feature = Feature(
            name=name,
            reach=reach,
            impact=impact,
            confidence=confidence,
            effort=effort,
            description=description,
            owner=owner
        )

        self.features.append(feature)
        print(f"\n✓ 追加完了: {name} (RICE Score: {feature.rice_score:.2f})")
        return feature

    def add_feature(self, name: str, reach: float, impact: float,
                   confidence: float, effort: float,
                   description: str = "", owner: str = "") -> Feature:
        """プログラムから機能を追加"""
        feature = Feature(name, reach, impact, confidence, effort, description, owner)
        self.features.append(feature)
        return feature

    def get_sorted_features(self) -> List[Feature]:
        """RICEスコアでソートされた機能リストを取得"""
        return sorted(self.features, key=lambda f: f.rice_score, reverse=True)

    def display_results(self):
        """結果を表示"""
        if not self.features:
            print("評価する機能がありません")
            return

        sorted_features = self.get_sorted_features()

        print("\n" + "="*80)
        print("RICE Score ランキング")
        print("="*80)

        print(f"\n{'順位':<4} {'機能名':<30} {'RICE':<10} {'Reach':<10} {'Impact':<8} {'Conf':<6} {'Effort':<8}")
        print("-"*80)

        for i, feature in enumerate(sorted_features, 1):
            impact_str = [k for k, v in self.IMPACT_MAPPING.items() if v == feature.impact][0]
            conf_str = [k for k, v in self.CONFIDENCE_MAPPING.items() if v == feature.confidence][0]

            print(f"{i:<4} {feature.name[:30]:<30} {feature.rice_score:<10.2f} "
                  f"{feature.reach:<10.0f} {impact_str:<8} {conf_str:<6} {feature.effort:<8.2f}")

            if feature.description:
                print(f"     説明: {feature.description}")
            if feature.owner:
                print(f"     担当: {feature.owner}")

    def export_to_json(self, filename: str = None):
        """JSON形式でエクスポート"""
        if filename is None:
            filename = f"rice_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

        sorted_features = self.get_sorted_features()
        data = {
            'timestamp': datetime.now().isoformat(),
            'total_features': len(self.features),
            'features': [f.to_dict() for f in sorted_features]
        }

        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"\n✓ 結果をエクスポート: {filename}")

    def export_to_markdown(self, filename: str = None):
        """Markdown形式でエクスポート"""
        if filename is None:
            filename = f"rice_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"

        sorted_features = self.get_sorted_features()

        with open(filename, 'w', encoding='utf-8') as f:
            f.write("# RICE Score 優先順位付け結果\n\n")
            f.write(f"**生成日時**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"**評価項目数**: {len(self.features)}\n\n")

            f.write("## ランキング\n\n")
            f.write("| 順位 | 機能名 | RICE Score | Reach | Impact | Confidence | Effort |\n")
            f.write("|------|--------|------------|--------|---------|------------|--------|\n")

            for i, feature in enumerate(sorted_features, 1):
                impact_str = [k for k, v in self.IMPACT_MAPPING.items() if v == feature.impact][0]
                conf_pct = f"{int(feature.confidence * 100)}%"

                f.write(f"| {i} | {feature.name} | {feature.rice_score:.2f} | "
                       f"{feature.reach:.0f} | {impact_str} | {conf_pct} | {feature.effort:.1f} |\n")

            f.write("\n## 詳細\n\n")
            for i, feature in enumerate(sorted_features, 1):
                f.write(f"### {i}. {feature.name}\n\n")
                f.write(f"- **RICE Score**: {feature.rice_score:.2f}\n")
                if feature.description:
                    f.write(f"- **説明**: {feature.description}\n")
                if feature.owner:
                    f.write(f"- **担当者**: {feature.owner}\n")
                f.write("\n")

        print(f"✓ Markdownエクスポート: {filename}")

    def load_sample_data(self):
        """サンプルデータをロード"""
        samples = [
            ("ダッシュボードリデザイン", 10000, 2, 0.8, 3, "UXの全面改善", "Design Team"),
            ("API高速化", 15000, 1, 1.0, 2, "レスポンス時間50%短縮", "Backend Team"),
            ("ソーシャルログイン", 5000, 0.5, 0.8, 1, "OAuth2実装", "Auth Team"),
            ("AIレコメンド機能", 8000, 3, 0.5, 5, "機械学習による推奨", "ML Team"),
            ("モバイルアプリ", 20000, 3, 0.8, 8, "iOS/Android対応", "Mobile Team"),
            ("ダークモード", 12000, 0.5, 1.0, 0.5, "UI テーマ切り替え", "Frontend Team"),
        ]

        for sample in samples:
            self.add_feature(*sample)

        print(f"✓ {len(samples)}件のサンプルデータをロードしました")

def main():
    """メイン処理"""
    calculator = RICECalculator()

    print("="*80)
    print("RICE Score Calculator")
    print("優先順位付けのためのRICEスコア計算ツール")
    print("="*80)

    while True:
        print("\n[メニュー]")
        print("1. 新規機能を追加")
        print("2. サンプルデータをロード")
        print("3. 結果を表示")
        print("4. JSONエクスポート")
        print("5. Markdownエクスポート")
        print("6. 終了")

        choice = input("\n選択 [1-6]: ").strip()

        if choice == '1':
            try:
                calculator.add_feature_interactive()
            except (ValueError, KeyboardInterrupt) as e:
                print(f"\n追加をキャンセル: {e}")

        elif choice == '2':
            calculator.load_sample_data()

        elif choice == '3':
            calculator.display_results()

        elif choice == '4':
            calculator.export_to_json()

        elif choice == '5':
            calculator.export_to_markdown()

        elif choice == '6':
            print("\n終了します")
            break

        else:
            print("正しい選択肢を入力してください")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n中断されました")
        sys.exit(0)