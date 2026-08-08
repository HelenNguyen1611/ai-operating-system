# Báo cáo đầu ngày — Vietnamese Output Template

Use with `commands/_base/morning.base.md` and `templates/i18n/_morning-layout.md`.

**Morning Card thống nhất** — cùng layout trên Claude App desktop, mobile, và Claude Code. Tối ưu **đọc trong 1 phút**.

```markdown
# Báo cáo đầu ngày
**{weekday}, {date}** · {timezone} · {brief|standard|full}

---

### Tóm tắt nhanh
**Việc đầu tiên →** {bước cụ thể tiếp theo}
**Mục tiêu →** {một câu}
**Độ tin cậy →** {Cao|Trung bình|Thấp} · Jira {✓|○} · Team {✓|○} · Calendar {✓|○} · Email {✓|○}

---

### Tổng quan
- **Team:** {copy `live.team_summary.line_vi` verbatim — 🟢 xanh = full team; 🟡 vàng = có nghỉ/WFH}
- **Lịch team:** {các bảng Markdown theo tuần, tối đa 7 cột ngày mỗi bảng; bên dưới là danh sách compact cho mobile}
- **Lịch:** {sự kiện sắp tới hoặc "không có meeting" — giờ local}
- **Jira:** {open_count} mở · due hôm nay {n} · quá hạn {n} · [Xem tất cả task mở →]({filter_url})

---

### Ưu tiên

**Issue mở đã xếp hạng**
_Đang hiển thị {showing} / tổng {total} issue mở_
1. **[Q_]** [{KEY}]({url}) — {lý do}
2. **[Q_]** [{KEY hoặc việc}]({url nếu có}) — {lý do}
...
10. **[Q_]** [{KEY}]({url}) — {lý do}

{Link xem đầy đủ khi total > showing}

---

### Rủi ro
- {rủi ro hoặc chưa xác minh — tối đa 3 ở brief/standard}

---

### Stand-up
Yesterday: {one line — English}
Today: {one line — English}
Blockers: {one line or None — English}

---
```

## Quy tắc hiển thị

**Tóm tắt nhanh:** bắt buộc ngay sau tiêu đề. User nắm Việc đầu tiên + Mục tiêu trong **10 giây**.

**Tổng quan:** bắt buộc. Dòng Team luôn có. Dòng Jira luôn có khi đã gọi `jira_get_morning_context`; nếu không: `Jira: chưa load`.

**Ưu tiên:** hiển thị tối đa 10 issue mở đã xếp hạng. Luôn ghi `đang hiển thị / tổng`; khi bị cắt, thêm link Jira xem đầy đủ. Key Jira phải là link.

**Rủi ro:** brief/standard tối đa **3** bullet. Gộp nguồn thiếu (không phải Team) vào đây.

**Stand-up:** mặc định English (xem `_language-rules.md`).

**Nhãn quadrant:** `[Q1]` Làm ngay · `[Q2]` Lên lịch · `[Q3]` Phối hợp · `[Q4]` Xem xét — từ Runtime 48; không phải Jira priority.

**brief:** Cùng cấu trúc card — dòng ngắn hơn; Rủi ro tối đa 3.

**standard:** Mặc định cho Claude App — dùng template này.

**full:** Sau card, thêm: Context Budget, Team mở rộng (Verified/Inferred/Unknown), lịch chi tiết, email/Teams highlights, ma trận tuỳ chọn, learning note.

```markdown
## Ma trận ưu tiên (full only, tuỳ chọn)
| | Quan trọng | Không quan trọng |
|---|---|---|
| **Khẩn cấp** | Q1: | Q3: |
| **Không khẩn cấp** | Q2: | Q4: |
```

Q4 = đề xuất hoãn/xem xét — không tự xóa hoặc đóng task.
