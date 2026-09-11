# g-workflow 템플릿

SKILL.md를 먼저 읽는다. 파일을 쓸 때만 이 문서를 연다.

## 워크트리 (PowerShell)

저장소 루트에서:

```powershell
$repoRoot = git rev-parse --show-toplevel
$repoName = Split-Path $repoRoot -Leaf
$parent = Split-Path $repoRoot -Parent
$slug = "example-slug"   # PLAN과 동일한 슬러그
$branch = "feat/$slug"
$wt = Join-Path $parent "$repoName-$slug"

git fetch origin 2>$null
git worktree add -b $branch $wt HEAD
```

이미 `$wt`가 있으면 `add` 하지 말고 그 경로를 재사용한다. 만든 직후 `move_agent_to_root`의 `rootPath`에 `$wt`를 넣는다.

형제 워크트리 목록:

```powershell
git worktree list
```

## PLAN-\<slug\>.md

```markdown
# PLAN: <짧은 제목>

상태: Phase 1
슬러그: <slug>
워크트리: <경로 또는 (없음)>
브랜치: <feat/slug 또는 (현재)>
기준: <커밋 해시 또는 (git 아님)>

## 한 줄 목표

<한 문장>

## 하지 않을 것

- <이번 범위 밖>

## 막힌 질문

없음. 또는:
- <답 없이 구현하면 안 되는 것>

## 의존 순서

1. <먼저>
2. <그다음>

## 설계

<파일·API·데이터. 짧게>

## 검증

- 자동: `npm test`
- mutation: `/g-review`에서 이번 로직 파일만 (`npx stryker run --mutate <파일>`)
- 수동: <있을 때만 `tests/release/*.md`>

## 문서

<docs/README.md 표에 따라 고칠 파일. 워크플로-only면 "제품 문서 없음">

## 오케스트레이션

기본 워커: g-worker (Pi) 또는 self (Cursor)
허용 워커: g-worker, scout, oracle, reviewer, self, agy, codex, cursor, opencode
```

## TASKS-\<slug\>.md

```markdown
# TASKS: <제목>

PLAN: PLAN-<slug>.md
상태: Phase 2

## 진행

- [ ] Ttest <실패해야 할 동작>
  - id: Ttest
  - files: `tests/mcp/server.test.mjs`
  - depends: (없음)
  - parallel: no
  - worker: self
  - done: `npm test` 해당 케이스 red 후 구현에서 green

- [ ] T1 <한 검증 단위>
  - id: T1
  - files: `path`
  - depends: (없음)
  - parallel: no
  - worker: self
  - done: <테스트나 확인>

- [ ] T2 ...
  - id: T2
  - files: `path`
  - depends: T1
  - parallel: no
  - worker: agy
  - done: ...

- [ ] Tdoc 문서 갱신
  - id: Tdoc
  - files: `docs/FEATURES.md`, `docs/CONTINUE.md`
  - depends: <구현 항목>
  - parallel: no
  - worker: self
  - done: FEATURES 상태가 코드와 같음
```

독립이고 파일이 안 겹치면 `parallel: yes`. Execute는 `[x]`로만 완료 표시한다. 막히면 항목 아래에 `막힘:` 한 줄을 남긴다.

## REVIEW-\<slug\>.md

```markdown
# REVIEW: <제목>

TASKS: TASKS-<slug>.md
상태: Phase 4

## 명령

- `<테스트>` → 통과/실패 (요약)
- mutation `<파일>` → 점수 / survived 요약 / 건너뜀 이유
- `<린트>` → 통과/실패/없음

## TASKS 대조

- T1: 충족 / 빠짐
- T2: ...

## 결함

없음. 또는:
- <파일:증상>

## 문서

<갱신함 / 해당 없음 / 아직>

## 다음

`/g-commit` 가능. 또는 고칠 항목.
```

## 증거 아카이브

Pi:

```powershell
$stamp = Get-Date -Format "yyyy-MM-dd"
$dest = Join-Path $env:USERPROFILE ".pi\agent\g-workflow\evidence\$stamp-<slug>"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item PLAN-<slug>.md, TASKS-<slug>.md, REVIEW-<slug>.md $dest -ErrorAction SilentlyContinue
```

Cursor는 `.pi\agent` 대신 `.cursor`를 쓴다.

원본은 워크트리에 남긴다. `~/.gemini/evidence`는 쓰지 않는다.
