<p align="center">[简体中文](README.md) · [English](README.en.md) · [Español](README.es.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [ไทย](README.th.md)</p>

# arch-diagram · Claude Code용 아키텍처 다이어그램 Skill

GitHub 저장소, 기술 글, PDF, 로컬 프로젝트를 주면 Claude가 구조를 파악해 어두운 "터미널 설계도" 스타일의 아키텍처 다이어그램을 그립니다. 연결선 위로 패킷이 흐르고, 모듈끼리 데이터를 주고받을 때마다 하단 로그에 한 줄씩 실시간으로 추가됩니다.

![REA 아키텍처 다이어그램](docs/rea.png)

## 주요 기능

- **내용에 맞춘 구조**: 계층형 시스템, 파이프라인, 반복이 있는 프로세스, 허브 앤 스포크, 스윔레인, 계층 트리. 고정 템플릿을 쓰지 않습니다.
- **의미 있는 색 구분**: 박스는 종류별로 색을 입히고, 연결선은 흐름 유형(요청, 쓰기, 콜백, 비동기 등)에 따라 색과 실선/점선으로 구분합니다. 그룹 테두리는 포함 관계를 나타냅니다.
- **실시간 트레이스 로그**: 패킷이 연결선 끝에 닿으면 하단에 `시간 · 유형 · A → B · 설명` 한 줄이 추가됩니다.
- **자체 점검**: 헤드리스 Chrome으로 박스 겹침, 글자 넘침, 박스를 관통하는 선, 가려진 라벨을 찾아내고, 깔끔해질 때까지 Claude가 고칩니다.
- **다양한 출력 형식**:
  - 인터랙티브 단일 HTML 파일
  - PNG (2배 해상도)
  - MP4: 기본 20초, 원하는 길이로 지정 가능, 4초 주기로 끊김 없이 반복
  - GIF: 한 주기
  - Mermaid 플로차트

![애니메이션 예시](docs/elephant-goldfish.gif)

## 다이어그램 언어는 프롬프트 언어를 따릅니다

요청한 언어로 다이어그램이 작성됩니다:

- **한국어**로 프롬프트를 쓰면 다이어그램 전체가 한국어
- **영어**로 쓰면 영어
- **중국어**로 쓰면 제목, 설명, 라벨, 로그가 모두 중국어
- **일본어**로 쓰면 모든 내용이 일본어

원문 글이나 소스 코드가 다른 언어여도 마찬가지입니다. 코드 식별자, 경로, 명령어는 그대로 둡니다. 범례와 상태 라벨 같은 UI 문구는 중국어·영어·일본어·한국어·스페인어·태국어가 내장되어 있고, 그 밖의 언어는 Claude가 해당 언어로 작성합니다.

## 설치

Node 18 이상과 Chrome, Chromium 또는 Edge가 필요합니다. 동영상과 GIF를 출력하려면 `ffmpeg`도 필요합니다(`brew install ffmpeg`).

**방법 1: npm** (가장 간단)

```bash
npx arch-diagram-skill install
```

`~/.claude/skills/arch-diagram`에 설치됩니다. `--project`를 붙이면 현재 프로젝트의 `.claude/skills/`에 설치됩니다. 업데이트하려면 다시 실행하고, 삭제는 `npx arch-diagram-skill uninstall`입니다.

**방법 2: Claude Code 플러그인**. Claude Code에서 다음을 실행합니다:

```
/plugin marketplace add bassnova42/arch-diagram-skill
/plugin install arch-diagram@arch-diagram
```

**방법 3: 직접 복사**

```bash
git clone https://github.com/bassnova42/arch-diagram-skill
cp -R arch-diagram-skill/skills/arch-diagram ~/.claude/skills/
```

설치 후 Claude Code를 다시 시작하세요.

## 사용법

Claude Code에서 바로 요청하면 됩니다. 예:

- `https://github.com/plausible/analytics 아키텍처 다이어그램 그려 줘`
- `이 글을 플로차트로 만들어 줘: <URL>, 30초 동영상으로 출력`
- `방금 그림을 이미지로 출력해 줘` / `mermaid로 출력해 줘`
- `/arch-diagram <저장소 또는 글 URL>`

다이어그램의 원본은 `<slug>.spec.json`입니다. 수정하려면 Claude에게 spec을 고쳐서 다시 생성해 달라고 하면 됩니다. 명령줄에서 직접 다룰 수도 있습니다:

```bash
npx arch-diagram-skill build  my.spec.json my.html
npx arch-diagram-skill check  my.html
npx arch-diagram-skill export my.html my.png my.mp4 --seconds 30
```

## 디렉터리 구성

```
skills/arch-diagram/
  SKILL.md            작업 흐름: 소스 읽기 → 구조 선택 → 배치 → 자체 점검 → 출력
  assets/             렌더링 엔진, 스타일, 템플릿
  scripts/            build / check / export
  references/         spec 필드 설명, 시각 스타일
  examples/           rea(저장소), plausible(저장소), elephant-goldfish(글)
bin/cli.mjs           npm 명령: install / uninstall / build / check / export
```

## 라이선스

MIT
