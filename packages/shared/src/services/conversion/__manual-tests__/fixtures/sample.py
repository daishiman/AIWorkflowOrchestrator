"""
サンプルPythonファイル

手動テスト用のPythonコードサンプル
"""

# インポート
import json
import os
from typing import List, Dict, Optional
from dataclasses import dataclass


# データクラス
@dataclass
class User:
    """ユーザー情報を表すデータクラス"""
    id: str
    name: str
    email: str
    age: Optional[int] = None


# クラス定義
class UserRepository:
    """ユーザーリポジトリクラス"""

    def __init__(self):
        """初期化"""
        self.users: Dict[str, User] = {}

    def add_user(self, user: User) -> None:
        """ユーザーを追加"""
        self.users[user.id] = user

    def get_user(self, user_id: str) -> Optional[User]:
        """ユーザーを取得"""
        return self.users.get(user_id)

    def get_all_users(self) -> List[User]:
        """すべてのユーザーを取得"""
        return list(self.users.values())


# 関数定義
def greet(name: str) -> str:
    """挨拶メッセージを生成"""
    return f"Hello, {name}!"


def calculate_sum(numbers: List[int]) -> int:
    """リストの合計を計算"""
    return sum(numbers)


async def fetch_data(url: str) -> Dict:
    """非同期でデータを取得"""
    # 実装は省略
    pass


def main():
    """メイン関数"""
    repo = UserRepository()
    user = User(id="1", name="Alice", email="alice@example.com", age=30)
    repo.add_user(user)
    print(greet(user.name))


if __name__ == "__main__":
    main()
