#!/bin/bash
# ============================================================
# 崧豚电竞 — 静态网站部署脚本
# 支持 Nginx / 简单 HTTP 服务器 两种方式
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEPLOY_DIR="${1:-/var/www/stdj}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo ""
echo "  ╔══════════════════════════════════════╗"
echo "  ║     崧豚电竞 · 网站部署工具       ║"
echo "  ╚══════════════════════════════════════╝"
echo ""

# ---- 检查必要文件 ----
check_files() {
    local missing=0
    for f in index.html style.css script.js icon.jpg; do
        if [ ! -f "$SCRIPT_DIR/$f" ]; then
            log_error "缺少文件: $f"
            missing=1
        fi
    done
    for d in 沙头 南沙 佛山; do
        if [ ! -d "$SCRIPT_DIR/$d" ]; then
            log_error "缺少目录: $d"
            missing=1
        fi
    done
    if [ $missing -eq 1 ]; then
        exit 1
    fi
    log_info "文件完整性检查通过"
}

# ---- 方式1：Nginx 部署 ----
deploy_nginx() {
    log_info "使用 Nginx 部署到 $DEPLOY_DIR"

    sudo mkdir -p "$DEPLOY_DIR"

    log_info "复制文件到 $DEPLOY_DIR ..."
    sudo cp "$SCRIPT_DIR/index.html" "$DEPLOY_DIR/"
    sudo cp "$SCRIPT_DIR/style.css" "$DEPLOY_DIR/"
    sudo cp "$SCRIPT_DIR/script.js" "$DEPLOY_DIR/"
    sudo cp "$SCRIPT_DIR/icon.jpg" "$DEPLOY_DIR/"
    for d in 沙头 南沙 佛山; do
        sudo mkdir -p "$DEPLOY_DIR/$d"
        sudo cp "$SCRIPT_DIR/$d/"* "$DEPLOY_DIR/$d/"
    done

    sudo chown -R www-data:www-data "$DEPLOY_DIR" 2>/dev/null || \
    sudo chown -R nginx:nginx "$DEPLOY_DIR" 2>/dev/null || true
    sudo chmod -R 755 "$DEPLOY_DIR"

    log_info "文件部署完成: $DEPLOY_DIR"
    echo ""
    echo "  接下来请配置 Nginx server block："
    echo ""
    echo "  server {"
    echo "      listen 80;"
    echo "      server_name your-domain.com;"
    echo "      root $DEPLOY_DIR;"
    echo "      index index.html;"
    echo ""
    echo "      location / {"
    echo "          try_files \$uri \$uri/ =404;"
    echo "      }"
    echo ""
    echo "      # 静态资源缓存"
    echo "      location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {"
    echo "          expires 30d;"
    echo "          add_header Cache-Control \"public, immutable\";"
    echo "      }"
    echo "  }"
    echo ""
    log_warn "配置完成后执行: sudo nginx -t && sudo systemctl reload nginx"
}

# ---- 方式2：Python 简易服务器 ----
deploy_simple() {
    log_info "启动简易 HTTP 服务器（端口: ${PORT:-8080}）"
    log_info "访问地址: http://localhost:${PORT:-8080}"
    log_warn "按 Ctrl+C 停止服务器"
    echo ""
    cd "$SCRIPT_DIR"
    python3 -m http.server "${PORT:-8080}"
}

# ---- 方式3：仅复制文件 ----
copy_only() {
    local target="$1"
    if [ -z "$target" ]; then
        target="$SCRIPT_DIR/dist"
    fi
    log_info "导出静态文件到 $target"

    mkdir -p "$target"
    cp "$SCRIPT_DIR/index.html" "$target/"
    cp "$SCRIPT_DIR/style.css" "$target/"
    cp "$SCRIPT_DIR/script.js" "$target/"
    cp "$SCRIPT_DIR/icon.jpg" "$target/"
    for d in 沙头 南沙 佛山; do
        mkdir -p "$target/$d"
        cp "$SCRIPT_DIR/$d/"* "$target/$d/"
    done

    log_info "导出完成: $target"
    echo ""
    echo "  可以将此目录复制到任意 Web 服务器："
    echo "  rsync -avz $target/ user@server:/var/www/stdj/"
}

# ---- 主菜单 ----
check_files

case "${2:-menu}" in
    nginx)
        deploy_nginx
        ;;
    serve)
        PORT="${3:-8080}" deploy_simple
        ;;
    export)
        copy_only "${3:-$SCRIPT_DIR/dist}"
        ;;
    *)
        echo "  请选择部署方式："
        echo ""
        echo "  1) Nginx 部署"
        echo "     ./deploy.sh /var/www/stdj nginx"
        echo ""
        echo "  2) 本地预览（Python HTTP Server）"
        echo "     ./deploy.sh . serve [端口号]"
        echo "     示例: ./deploy.sh . serve 8080"
        echo ""
        echo "  3) 导出静态文件到指定目录"
        echo "     ./deploy.sh . export [目标目录]"
        echo "     示例: ./deploy.sh . export ./dist"
        echo ""
        ;;
esac
