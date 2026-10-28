<p align="center">[简体中文](README.md) · [English](README.en.md) · [Español](README.es.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [ไทย](README.th.md)</p>

# arch-diagram · Skill วาดแผนภาพสถาปัตยกรรมสำหรับ Claude Code และ Codex

ส่ง GitHub repository บทความเทคนิค ไฟล์ PDF หรือโปรเจกต์ในเครื่องให้ แล้ว Claude Code หรือ Codex จะอ่านโครงสร้างและวาดแผนภาพสถาปัตยกรรมโทนมืดสไตล์ "พิมพ์เขียวเทอร์มินัล" มีแพ็กเก็ตวิ่งไปตามเส้นเชื่อม และ log ด้านล่างจะเพิ่มบรรทัดใหม่แบบเรียลไทม์ทุกครั้งที่โมดูลส่งข้อมูลถึงกัน

![แผนภาพสถาปัตยกรรมของ REA](docs/rea.png)

## ทำอะไรได้บ้าง

- **เลือกโครงสร้างตามเนื้อหา**: ระบบแบบเลเยอร์ ไปป์ไลน์ กระบวนการที่มีลูป แบบศูนย์กลาง-ซี่ล้อ สวิมเลน หรือแผนผังลำดับชั้น ไม่ใช้เทมเพลตตายตัว
- **สีที่มีความหมาย**: กล่องใช้สีตามประเภท เส้นเชื่อมแยกสีและเส้นทึบ/เส้นประตามชนิดของการไหล (คำขอ การเขียน การตอบกลับ แบบอะซิงก์ ฯลฯ) กรอบกลุ่มแสดงความสัมพันธ์แบบอยู่ภายใน
- **live trace log**: เมื่อแพ็กเก็ตไปถึงปลายเส้น จะเพิ่มบรรทัด `เวลา · ประเภท · A → B · รายละเอียด` ที่ด้านล่าง
- **ตรวจสอบตัวเอง**: ใช้ Chrome แบบ headless ตรวจหากล่องซ้อนกัน ข้อความล้น เส้นที่ทะลุกล่อง และป้ายที่ถูกบัง แล้ว Claude จะแก้จนเลย์เอาต์เรียบร้อย
- **ส่งออกได้หลายรูปแบบ**:
  - HTML ไฟล์เดียวแบบโต้ตอบได้
  - PNG (ความละเอียด 2 เท่า)
  - MP4: ค่าเริ่มต้น 20 วินาที กำหนดความยาวได้ตามต้องการ วนซ้ำทุก 4 วินาทีอย่างไร้รอยต่อ
  - GIF: หนึ่งรอบ
  - ผังงาน Mermaid

![ตัวอย่างภาพเคลื่อนไหว](docs/elephant-goldfish.gif)

## ภาษาของแผนภาพเป็นไปตามภาษาของพรอมต์

แผนภาพจะเขียนด้วยภาษาเดียวกับที่คุณใช้สั่ง:

- เขียนพรอมต์เป็น**ภาษาไทย** แผนภาพทั้งหมดจะเป็นภาษาไทย
- เขียนเป็น**ภาษาอังกฤษ** ก็จะได้ภาษาอังกฤษ
- เขียนเป็น**ภาษาจีน** หัวข้อ คำอธิบาย ป้ายกำกับ และ log จะเป็นภาษาจีน
- เขียนเป็น**ภาษาญี่ปุ่น** เนื้อหาทั้งหมดจะเป็นภาษาญี่ปุ่น

แม้บทความหรือซอร์สโค้ดต้นฉบับจะเป็นภาษาอื่นก็ตาม ชื่อในโค้ด พาธ และคำสั่งจะคงไว้ตามเดิม ข้อความส่วนติดต่อ เช่น คำอธิบายสัญลักษณ์และป้ายสถานะ มีในตัวสำหรับภาษาจีน อังกฤษ ญี่ปุ่น เกาหลี สเปน และไทย ส่วนภาษาอื่น Claude จะเขียนเป็นภาษานั้นให้

## การติดตั้ง

ต้องมี Node 18 ขึ้นไป และ Chrome, Chromium หรือ Edge การส่งออกวิดีโอและ GIF ต้องมี `ffmpeg` ด้วย (`brew install ffmpeg`)

**วิธีที่ 1: npm** (ง่ายที่สุด)

```bash
npx @rokoai/arch-diagram install
```

จะติดตั้งไว้ที่ `~/.claude/skills/arch-diagram` ถ้าเติม `--project` จะติดตั้งใน `.claude/skills/` ของโปรเจกต์ปัจจุบัน รันอีกครั้งเพื่ออัปเดต และถอนการติดตั้งด้วย `npx @rokoai/arch-diagram uninstall`

ถ้าติดตั้ง Codex ไว้ (มีโฟลเดอร์ `~/.codex`) จะติดตั้งลง `~/.codex/skills/arch-diagram` ด้วย ถ้าต้องการติดตั้งให้ตัวใดตัวหนึ่งเท่านั้น ให้เติม `--claude` หรือ `--codex`

**วิธีที่ 2: ปลั๊กอิน** ใน Claude Code ให้รัน:

```
/plugin marketplace add bassnova42/arch-diagram-skill
/plugin install arch-diagram@arch-diagram
```

ใน Codex CLI:

```bash
codex plugin marketplace add bassnova42/arch-diagram-skill
codex plugin add arch-diagram@arch-diagram
```

**วิธีที่ 3: คัดลอกเอง**

```bash
git clone https://github.com/bassnova42/arch-diagram-skill
cp -R arch-diagram-skill/skills/arch-diagram ~/.claude/skills/
cp -R arch-diagram-skill/skills/arch-diagram ~/.codex/skills/   # Codex
```

รีสตาร์ต Claude Code หรือ Codex หลังติดตั้ง

## วิธีใช้

สั่งใน Claude Code หรือ Codex ได้เลย เช่น:

- `วาดแผนภาพสถาปัตยกรรมของ https://github.com/plausible/analytics`
- `ทำบทความนี้เป็นผังงาน: <URL> แล้วส่งออกเป็นวิดีโอ 30 วินาที`
- `ส่งออกแผนภาพเมื่อกี้เป็นรูปภาพ` / `เป็น mermaid`
- ถ้าต้องการเรียก Skill นี้โดยตรง: ใน Claude Code พิมพ์ `/arch-diagram <URL>` ใน Codex พิมพ์ `$arch-diagram <URL>`

ต้นฉบับของแต่ละแผนภาพคือ `<slug>.spec.json` ถ้าต้องการแก้ ให้บอก Claude Code หรือ Codex แก้ spec แล้วสร้างใหม่ หรือจะใช้บรรทัดคำสั่งโดยตรงก็ได้:

```bash
npx @rokoai/arch-diagram build  my.spec.json my.html
npx @rokoai/arch-diagram check  my.html
npx @rokoai/arch-diagram export my.html my.png my.mp4 --seconds 30
```

## โครงสร้างไดเรกทอรี

```
skills/arch-diagram/
  SKILL.md            ขั้นตอน: อ่านต้นทาง → เลือกโครงสร้าง → จัดวาง → ตรวจสอบ → ส่งออก
  assets/             เอนจินเรนเดอร์ สไตล์ เทมเพลต
  scripts/            build / check / export
  references/         คำอธิบายฟิลด์ spec สไตล์ภาพ
  examples/           rea (repository), plausible (repository), elephant-goldfish (บทความ)
bin/cli.mjs           คำสั่ง npm: install / uninstall / build / check / export
```

## สัญญาอนุญาต

MIT
