# 崧豚电竞 · 宣传网页

纯静态单页网站，无后端依赖，适配电脑与手机端。

## 项目结构

```
├── index.html          主页面
├── style.css           全站样式
├── script.js           交互逻辑（滚动动画、照片墙、门店滑动）
├── deploy.sh           部署脚本（macOS / Linux）
├── icon.jpg            品牌 Logo
├── 沙头/               沙头店展示图
├── 南沙/               南沙店展示图
└── 佛山/               佛山店展示图
```

## 快速启动（macOS / Linux）

```bash
# 后台启动（默认端口 8080）
./deploy.sh start

# 指定端口
./deploy.sh start 3000

# 查看运行状态
./deploy.sh status

# 重启
./deploy.sh restart

# 停止
./deploy.sh stop
```

服务后台运行，关闭终端不影响。`git pull` 更新代码后刷新浏览器即可看到最新效果。

## Windows Server 部署

使用系统自带的 IIS：

1. 服务器管理器 → 添加角色和功能 → 勾选 **Web 服务器（IIS）**
2. 将所有项目文件复制到 `C:\inetpub\wwwroot\`
3. 浏览器访问 `http://服务器IP` 即可

## 项目依赖

无。纯静态 HTML / CSS / JS，不需要安装 Node.js、Python 或任何构建工具。
