from fastapi import APIRouter
from app.api.v1 import auth, users, shops, logs, statistics, tools, reports

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(users.router, prefix="/users", tags=["用户管理"])
api_router.include_router(shops.router, prefix="/shops", tags=["商店管理"])
api_router.include_router(logs.router, prefix="/logs", tags=["日志管理"])
api_router.include_router(statistics.router, prefix="", tags=["统计"])
api_router.include_router(reports.router, prefix="/dataset", tags=["报表处理"])
api_router.include_router(tools.router, prefix="/toolset", tags=["工具集"])
