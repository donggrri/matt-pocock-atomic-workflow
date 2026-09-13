#Requires -Version 5.1
<#
.SYNOPSIS
  atomic-pocock-workflow 항목을 agy / codex / cursor / opencode CLI로 비대화형 실행한다.
.EXAMPLE
  ./invoke-worker.ps1 -Worker agy -Workspace C:\proj -PromptFile C:\brief.md -LogFile C:\run.log
#>
param(
  [Parameter(Mandatory)]
  [ValidateSet('agy', 'codex', 'cursor', 'opencode')]
  [string]$Worker,

  [Parameter(Mandatory)]
  [string]$Workspace,

  [Parameter(Mandatory)]
  [string]$PromptFile,

  [string]$LogFile,

  [string]$LastMessageFile,

  [int]$TimeoutMin = 45
)

$ErrorActionPreference = 'Stop'

function Refresh-Path {
  $machine = [System.Environment]::GetEnvironmentVariable('Path', 'Machine')
  $user = [System.Environment]::GetEnvironmentVariable('Path', 'User')
  $env:Path = @($machine, $user, $env:Path) -join ';'
}

function Resolve-Bin {
  param([string[]]$Names)
  foreach ($name in $Names) {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
  }
  return $null
}

Refresh-Path

if (-not (Test-Path -LiteralPath $Workspace)) {
  throw "Workspace not found: $Workspace"
}
if (-not (Test-Path -LiteralPath $PromptFile)) {
  throw "Prompt file not found: $PromptFile"
}

$ws = (Resolve-Path -LiteralPath $Workspace).Path
$promptPath = (Resolve-Path -LiteralPath $PromptFile).Path
$prompt = Get-Content -LiteralPath $promptPath -Raw -Encoding UTF8
if ([string]::IsNullOrWhiteSpace($prompt)) {
  throw "Prompt file is empty: $promptPath"
}

if (-not $LogFile) {
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  $LogFile = Join-Path $env:TEMP "atomic-pocock-workflow-$Worker-$stamp.log"
}
$logDir = Split-Path -Parent $LogFile
if ($logDir) {
  New-Item -ItemType Directory -Force -Path $logDir | Out-Null
}
if (-not $LastMessageFile) {
  $LastMessageFile = [System.IO.Path]::ChangeExtension($LogFile, '.last.md')
}

$timeoutSpan = [TimeSpan]::FromMinutes($TimeoutMin)
$agyTimeout = '{0}m0s' -f $TimeoutMin

Push-Location -LiteralPath $ws
$exitCode = 1
try {
  "worker=$Worker workspace=$ws started=$(Get-Date -Format o)" | Set-Content -LiteralPath $LogFile -Encoding UTF8

  switch ($Worker) {
    'agy' {
      $bin = Resolve-Bin @('agy.exe', 'agy')
      if (-not $bin) { throw 'agy not on PATH. Run scripts/ensure-workers.ps1 -Workers agy' }
      # Never launch bare `agy` (that opens the TUI and hangs).
      & $bin -p --output-format text --mode accept-edits --dangerously-skip-permissions --print-timeout $agyTimeout --add-dir $ws $prompt 2>&1 |
        Tee-Object -FilePath $LogFile -Append
      $exitCode = $LASTEXITCODE
    }
    'codex' {
      $bin = Resolve-Bin @('codex.exe', 'codex')
      if (-not $bin) { throw 'codex not on PATH. Run scripts/ensure-workers.ps1 -Workers codex' }
      $prompt | & $bin exec - --sandbox workspace-write -c 'approval_policy="never"' -C $ws --color never -o $LastMessageFile 2>&1 |
        Tee-Object -FilePath $LogFile -Append
      $exitCode = $LASTEXITCODE
    }
    'cursor' {
      $bin = Resolve-Bin @('cursor-agent.cmd', 'cursor-agent')
      if (-not $bin) { throw 'cursor-agent not on PATH.' }
      & $bin -p --force --trust --workspace $ws --output-format text $prompt 2>&1 |
        Tee-Object -FilePath $LogFile -Append
      $exitCode = $LASTEXITCODE
    }
    'opencode' {
      $bin = Resolve-Bin @('opencode.exe', 'opencode')
      if (-not $bin) { throw 'opencode not on PATH. Run scripts/ensure-workers.ps1 -Workers opencode' }
      & $bin run --dir $ws --auto --title "atomic-pocock-workflow" $prompt 2>&1 |
        Tee-Object -FilePath $LogFile -Append
      $exitCode = $LASTEXITCODE
    }
  }
} finally {
  Pop-Location
}

if ($null -eq $exitCode) { $exitCode = 0 }
"finished=$(Get-Date -Format o) exit=$exitCode" | Add-Content -LiteralPath $LogFile -Encoding UTF8
Write-Host "log=$LogFile"
Write-Host "exit=$exitCode"
exit $exitCode
