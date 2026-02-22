#!/usr/bin/env python3
"""
初始化数据库并创建默认用户
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import User

def init_db():
    print("正在创建数据库表...")
    Base.metadata.create_all(bind=engine)
    print("数据库表创建完成")
    
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.username == 'damonrock').first()
        if not existing:
            user = User(
                username='damonrock',
                password_hash=get_password_hash('jrway2012'),
                role='admin'
            )
            db.add(user)
            db.commit()
            print('✓ 默认用户已创建: damonrock (admin)')
        else:
            print('✓ 用户 damonrock 已存在')
            
        existing_user2 = db.query(User).filter(User.username == 'user').first()
        if not existing_user2:
            user2 = User(
                username='user',
                password_hash=get_password_hash('user123'),
                role='user'
            )
            db.add(user2)
            db.commit()
            print('✓ 默认用户已创建: user (user)')
        else:
            print('✓ 用户 user 已存在')
            
    finally:
        db.close()
    
    print("\n初始化完成！")

if __name__ == "__main__":
    init_db()
