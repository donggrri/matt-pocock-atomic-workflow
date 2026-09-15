# 워커

SKILL.md의 오케스트레이션 절을 먼저 읽는다. 위임할 때만 이 문서를 연다. 모델 표는 [models.md](models.md).

## Pi (기본)

오케스트레이터는 현재 Pi 세션이다. `agy` / `codex` / `cursor-agent` / `opencode`를 직접 실행하지 않는다. `scripts/*.ps1`도 쓰지 않는다.

위임은 `subagent` 툴만 쓴다.

| 워커 | 역할 | 비대화형 |
|---|---|---|
| `planner` | Phase 1 PLAN | `subagent({ agent: "planner", task })` |
| `tasker` | Phase 2 TASKS | `subagent({ agent: "tasker", task })` |
| `worker` | Phase 3 구현 | `subagent({ agent: "worker", task })` |
| `reviewer` | Phase 4 REVIEW | `subagent({ agent: "reviewer", task })` |
| `scout` / `oracle` | 선택 보조 | 같은 `subagent` 툴 |
| `self` | 부모 세션 | 툴 없음 |

브리프는 `~/.pi/agent/matt-pocock-atomic-workflow/runs/<slug>/<task-id>.brief.md`에 쓴다. 비밀·토큰·`.env`를 넣지 않는다.

```markdown
역할: 구현 워커. 오케스트레이터는 Pi 부모 세션이다. 이 항목만 한다.
작업공간: <절대 경로>
항목: T1 <제목>
할 일: <구체적>
파일: <건드릴 경로>
완료 조건: <테스트/확인>
하지 말 것: git commit, git push, 범위 확대, 비밀 파일, PLAN/TASKS 삭제
끝나면: 변경 파일, 실행한 테스트, 실패, 남은 위험을 짧게.
```

호출 예:

```js
subagent({
  agent: "worker",
  task: "<브리프 본문 또는 요약>",
  cwd: "<worktree>",
  async: true
})
```

Cursor/Antigravity는 확장 프로바이더라서 이 모델들을 쓰는 자식은 **백그라운드(`async: true`)** 여야 한다. 포그라운드면 프로바이더가 안 올라간다. 띄운 뒤에는 완료를 기다린다.

`/matt-pocock-atomic-execute agy|flash|pro|sonnet`이면 `model`을 [models.md](models.md) 별칭으로 덮어쓴다. 쿼터 부족은 `fallbackModels`가 처리한다.

`AskAntigravity`는 폴백 체인이 없다. 사용자가 agy CLI 원샷을 분명히 원할 때만 쓴다.

돌아온 뒤 (필수):

1. 해당 워크트리에서 `git status`, `git diff`
2. 항목의 `done` 조건(테스트)을 오케스트레이터가 실행
3. 통과면 TASKS `[x]`, 아니면 `막힘:` + 로그/런 id
4. 워커는 커밋하지 않는다. `/matt-pocock-atomic-commit`만 커밋한다.

병렬: 파일이 겹치지 않고 워크트리가 다를 때만. **워크트리당 쓰기 워커는 하나.**

## Cursor (Pi가 아닐 때)

기본 구현 워커는 Task `worker`이다. TASKS `worker:`가 `agy|pi|opencode|codex|claude`이면 Task **`cli-delegate`**로 위임한다. `cli-delegate`만 `invoke-worker` 스크립트를 실행한다. 부모는 bare `agy`/`pi`를 직접 실행하지 않는다.

### 브리프 (CLI worker 공통)

```markdown
역할: matt-pocock-atomic-workflow 구현 워커 (CLI: <worker>).
MUST read skills (first tool calls):
- <abs>/.agents/skills/matt-pocock-atomic-workflow/SKILL.md
- <abs>/.agents/skills/tdd/SKILL.md
작업공간: <절대 경로>
항목: T1 <제목>
할 일: <구체적>
파일: <건드릴 경로>
완료 조건: <테스트/확인>
하지 말 것: git commit, git push, 범위 확대, 비밀 파일, PLAN/TASKS 삭제
끝나면: 변경 파일, 실행한 테스트, 실패, 남은 위험을 짧게.
```

`--skills matt-pocock-atomic-workflow,tdd` 또는 `--skills-file`을 쓰면 `invoke-worker`가 위 블록을 brief 앞에 자동 prepend한다. `--dry-run`은 실제 CLI 대신 최종 명령줄만 로그에 남긴다.

### Bash (WSL / Linux / macOS)

- `scripts/ensure-workers.sh` — PATH에 5종 CLI 있는지 확인
- `scripts/invoke-worker.sh` — 비대화형 실행 (단일 진입점)

| 워커 | CLI | 비고 |
|---|---|---|
| `agy` | `agy -p …` | `--add-dir`로 workspace·skills |
| `pi` | `pi -p --no-session` | matt-pocock pi 패키지·에이전트는 workspace에서 해석 |
| `codex` | `codex exec` | stdin + workspace-write |
| `opencode` | `opencode run --auto` | `--dir` workspace |
| `claude` | `claude -p` | `--add-dir` + skills prepend |
| `cli-delegate` | (위임 전용) | brief 작성 후 `invoke-worker.sh`만 Shell |
| `self` | (없음) | 현재 에이전트가 구현 |

```bash
SKILL=".agents/skills/matt-pocock-atomic-workflow/scripts"
RUNS="$HOME/.cursor/matt-pocock-atomic-workflow/runs/<slug>"
mkdir -p "$RUNS"

bash "$SKILL/invoke-worker.sh" \
  --worker agy \
  --workspace "<worktree>" \
  --prompt-file "$RUNS/T1.brief.md" \
  --log-file "$RUNS/T1.log" \
  --timeout-min 45 \
  --skills matt-pocock-atomic-workflow,tdd
```

### PowerShell (Windows)

- `scripts/ensure-workers.ps1` — 없으면 설치
- `scripts/invoke-worker.ps1` — 비대화형 실행 (`-Skills` 동일 계약)

절대 경로: `$env:USERPROFILE\.agents\skills\matt-pocock-atomic-workflow\scripts\...`

| 워커 | CLI | 비대화형 |
|---|---|---|
| `agy` | `agy` | `-p --mode accept-edits --dangerously-skip-permissions` |
| `pi` | `pi` | `-p --no-session` |
| `codex` | `codex exec` | stdin + `--sandbox workspace-write` + `approval_policy=never` |
| `claude` | `claude` | `-p --dangerously-skip-permissions` |
| `cursor` | `cursor-agent` | `-p --force --trust --workspace` (v1 TASKS roster 밖) |
| `opencode` | `opencode run` | `--dir --auto` |
| `self` | (없음) | 현재 에이전트가 구현 |

`agy`/`pi`를 인자 없이 실행하지 않는다. TUI가 떠서 멈춘다.

설치:

```powershell
& "$env:USERPROFILE\.agents\skills\matt-pocock-atomic-workflow\scripts\ensure-workers.ps1" -Workers agy,codex
```

없는 것만 설치한다.

- agy: `irm https://antigravity.google/cli/install.ps1 | iex`
- codex: `winget install --id OpenAI.Codex -e`
- opencode: `npm install -g opencode-ai`
- cursor-agent: 자동 설치하지 않는다. 없으면 사용자에게 알린다.

인증 오류는 설치로 덮지 않는다.

- `codex login` (이미 ChatGPT면 `codex login status`)
- agy는 최초 한 번 대화형 로그인이 필요할 수 있다.

브리프는 `~/.cursor/matt-pocock-atomic-workflow/runs/<slug>/<task-id>.brief.md`.

```powershell
$skill = Join-Path $env:USERPROFILE ".agents\skills\matt-pocock-atomic-workflow\scripts"
$runs = Join-Path $env:USERPROFILE ".cursor\matt-pocock-atomic-workflow\runs\<slug>"
New-Item -ItemType Directory -Force -Path $runs | Out-Null

& "$skill\invoke-worker.ps1" `
  -Worker agy `
  -Workspace "<worktree>" `
  -PromptFile "$runs\T1.brief.md" `
  -LogFile "$runs\T1.log" `
  -TimeoutMin 45
```

코딩 작업은 오래 걸린다. 셸 `block_until_ms`를 충분히 잡거나 백그라운드로 돌리고 로그를 본다.

돌아온 뒤 규칙은 Pi와 같다. 워커 「완료」로그를 믿지 않는다.
