# 基本命令汇总

根据提供的 Microsoft Learn 文档，以下是 **WSL (Windows Subsystem for Linux)** 的基本命令汇总。

## 基础命令

### 安装 WSL

```powershell
wsl --install
```

- 安装 WSL 和默认的 Ubuntu Linux 发行版
- 选项：

- `--distribution <Distribution Name>`：指定要安装的 Linux 发行版
- `--no-launch`：安装但不自动启动
- `--web-download`：从在线源安装，而非 Microsoft Store
- `--location <路径>`：指定安装文件夹
- `--inbox`：使用 Windows 组件安装（非 Store 版本）
- `--enable-wsl1`：启用 WSL 1
- `--no-distribution`：只安装 WSL，不安装发行版

### 列出 Linux 发行版

```powershell
# 列出可用的在线发行版
wsl --list --online
# 或
wsl -l -o

# 列出已安装的发行版（含详细信息）
wsl --list --verbose
# 或
wsl -l -v
```

- 其他列表选项：

- `--all`：列出所有发行版
- `--running`：仅列出正在运行的发行版
- `--quiet`：仅显示发行版名称

### 设置 WSL 版本

```powershell
# 为特定发行版设置 WSL 版本
wsl --set-version <distribution name> <versionNumber>

# 设置默认 WSL 版本（用于新安装的发行版）
wsl --set-default-version <Version>
```

- `<versionNumber>` 和 `<Version>` 值为 1 或 2
- WSL 2 仅在 Windows 11 或 Windows 10 版本 1903 (18362+) 中可用
- **警告**：在 WSL 1 和 WSL 2 之间切换可能耗时，且大型项目可能会失败，建议先备份

### 设置默认发行版

```powershell
wsl --set-default <Distribution Name>
```

- 设置 WSL 命令默认使用的 Linux 发行版

### 启动 WSL

```powershell
# 在用户主目录中启动
wsl ~

# 以特定用户身份运行特定发行版
wsl --distribution <Distribution Name> --user <User Name>
```

### 管理用户

```powershell
# 以特定用户身份运行
wsl --user <Username>

# 更改发行版的默认用户
<DistributionName> config --default-user <Username>
# 例如：ubuntu config --default-user johndoe
```

- **警告**：`config --default-user` 命令不适用于导入的发行版，这类发行版应使用 `/etc/wsl.conf` 文件配置

## 系统维护

### 更新和状态

```powershell
# 更新 WSL
wsl --update
# 选项：--web-download（从 GitHub 而非 Store 下载最新更新）

# 检查 WSL 状态
wsl --status

# 检查 WSL 版本
wsl --version

# 查看帮助
wsl --help
```

### 关闭与终止

```powershell
# 关闭所有运行中的发行版和 WSL 2 虚拟机
wsl --shutdown

# 终止指定的发行版
wsl --terminate <Distribution Name>
```

## 高级操作

### 网络相关

```bash
# 获取 WSL 2 发行版的 IP 地址
wsl hostname -I

# 获取 Windows 主机在 WSL 2 中的 IP 地址
ip route show | grep -i default | awk '{ print $3}'
```

### 导入/导出发行版

```powershell
# 导出发行版
wsl --export <Distribution Name> <FileName>
# 选项：--vhd（导出为 .vhdx 格式，仅限 WSL 2）

# 导入发行版
wsl --import <Distribution Name> <InstallLocation> <FileName>
# 选项：
#   --vhd（导入 .vhdx 文件，仅限 WSL 2）
#   --version <1/2>（指定导入为 WSL 1 或 2）

# 就地导入 .vhdx 文件
wsl --import-in-place <Distribution Name> <FileName>
# 要求：虚拟硬盘必须格式化为 ext4 文件系统
```

### 管理磁盘

```powershell
# 挂载磁盘
wsl --mount <DiskPath>
# 选项：
#   --vhd：指定是虚拟硬盘
#   --name：自定义挂载点名称
#   --bare：只附加不挂载
#   --type <Filesystem>：指定文件系统类型（默认 ext4）
#   --partition <Partition Number>：指定分区（默认整个磁盘）
#   --options <MountOptions>：文件系统特定选项

# 卸载磁盘
wsl --unmount <DiskPath>
# 不指定路径时，卸载并分离所有挂载的磁盘
```

### 卸载发行版

```powershell
wsl --unregister <DistributionName>
```

- **警告**：卸载后，该发行版的所有数据、设置和软件将永久丢失



## 其他注意事项

- 在 WSL 命令提示符内，使用 `cd ~` 可返回主目录
- 32 位进程中访问 wsl.exe 时，可能需要使用：`C:\Windows\Sysnative\wsl.exe --command`
- 要从 Bash/Linux 发行版命令行运行这些命令，需将 `wsl` 替换为 `wsl.exe`
- 完整命令列表可通过运行 `wsl --help` 查看
- 建议通过 Microsoft Store 安装 WSL，以便及时接收更新