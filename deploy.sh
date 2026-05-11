#!/bin/bash
# ============================================================
# 崧豚电竞 — 静态网站部署脚本
# 支持：后台常驻 / Nginx / 导出 / 停止 / 状态查看
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/.server.pid"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_tip()   { echo -e "${CYAN}[TIP]${NC} $1"; }

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

# ---- 检查服务是否在运行 ----
is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid
        pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# ---- 启动后台服务 ----
start_serve() {
    local port="${1:-8080}"

    if is_running; then
        local old_pid
        old_pid=$(cat "$PID_FILE")
        log_warn "服务器已在运行中 (PID: $old_pid, 端口: $port)"
        log_tip "如需重启请先执行: ./deploy.sh stop"
        return 0
    fi

    log_info "启动后台 HTTP 服务器（端口: $port）"
    cd "$SCRIPT_DIR"
    nohup python3 -m http.server "$port" > /dev/null 2>&1 &
    local pid=$!
    echo "$pid" > "$PID_FILE"

    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
        log_info "服务器已启动 (PID: $pid)"
        log_info "访问地址: http://localhost:$port"
        log_tip "git pull 更新代码后，直接刷新浏览器即可看到最新内容"
        log_tip "停止服务器: ./deploy.sh stop"
    else
        log_error "启动失败"
        rm -f "$PID_FILE"
        exit 1
    fi
}

# ---- 停止服务 ----
stop_serve() {
    if ! is_running; then
        log_warn "没有正在运行的服务器"
        return 0
    fi

    local pid
    pid=$(cat "$PID_FILE")
    log_info "正在停止服务器 (PID: $pid) ..."
    kill "$pid" 2>/dev/null || true
    rm -f "$PID_FILE"
    log_info "服务器已停止"
}

# ---- 查看状态 ----
status_serve() {
    if is_running; then
        local pid
        pid=$(cat "$PID_FILE")
        log_info "服务器运行中 (PID: $pid)"
        echo ""
        ss -tlnp 2>/dev/null | grep "$pid" || \
        lsof -p "$pid" 2>/dev/null | grep LISTEN || \
        echo "  无法获取端口信息"
    else
        log_warn "服务器未运行"
    fi
}

# ---- Nginx 部署 ----
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

# ---- 导出文件 ----
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

# ---- 主入口 ----
check_files

DEPLOY_DIR="${2:-/var/www/stdj}"

case "${1:-menu}" in
    start)
        start_serve "${2:-8080}"
        ;;
    stop)
        stop_serve
        ;;
    restart)
        stop_serve
        sleep 1
        start_serve "${2:-8080}"
        ;;
    status)
        status_serve
        ;;
    nginx)
        deploy_nginx
        ;;
    export)
        copy_only "${2:-$SCRIPT_DIR/dist}"
        ;;
    *)
        echo "  用法: ./deploy.sh <命令> [参数]"
        echo ""
        echo "  ┌─────────────────────────────────────────────────────┐"
        echo "  │  后台服务（推荐）                                   │"
        echo "  ├─────────────────────────────────────────────────────┤"
        echo "  │  ./deploy.sh start [端口]   启动后台服务（默认8080）│"
        echo "  │  ./deploy.sh stop           停止后台服务            │"
        echo "  │  ./deploy.sh restart [端口] 重启后台服务            │"
        echo "  │  ./deploy.sh status         查看运行状态            │"
        echo "  ├─────────────────────────────────────────────────────┤"
        echo "  │  其他部署方式                                       │"
        echo "  ├─────────────────────────────────────────────────────┤"
        echo "  │  ./deploy.sh nginx          Nginx 部署              │"
        echo "  │  ./deploy.sh export [目录]  导出静态文件            │"
        echo "  └─────────────────────────────────────────────────────┘"
        echo ""
        ;;
esac
