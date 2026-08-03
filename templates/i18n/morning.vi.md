# Báo cáo đầu ngày — Vietnamese Output Template

Use with `commands/_base/morning.base.md`.

Keep Vietnamese concise. Do not over-explain. Stand-up section remains English by default (see `templates/i18n/_language-rules.md`).

```markdown
# Báo cáo đầu ngày

## Ngữ cảnh
- Có dữ liệu:
- Thiếu dữ liệu:
- Độ tin cậy:
- Thời gian hiển thị theo giờ Việt Nam.

## Mục tiêu hôm nay
-

## Top 3 ưu tiên
1. [Q_] — (lý do ngắn, dựa trên bằng chứng)
2. [Q_] — (lý do ngắn, dựa trên bằng chứng)
3. [Q_] — (lý do ngắn, dựa trên bằng chứng)

## Rủi ro / Chưa xác minh
-

## Stand-up
Yesterday:
Today:
Blockers:

## Việc đầu tiên
-
```

**Nhãn quadrant:** `[Q1]` Làm ngay · `[Q2]` Lên lịch / Quyết định · `[Q3]` Phối hợp / Giao phù hợp / Xử lý theo nhóm · `[Q4]` Hoãn / Loại khỏi ưu tiên / Xem xét. Nhãn phản ánh phân loại Eisenhower từ Runtime 48 — **không** đồng nghĩa với Jira priority.

**brief:** Bỏ section Ngữ cảnh. Gộp nguồn thiếu vào Rủi ro / Chưa xác minh. Top 3 chỉ cần nhãn + lý do một dòng — không có ma trận.

**standard:** Giữ cấu trúc trên; mỗi mục Top 3 có nhãn + lý do ngắn. Không có ma trận đầy đủ.

**full:** Mở rộng Ngữ cảnh thành Context Budget; thêm tóm tắt điều hành, team, lịch, Jira chi tiết, và learning note. Tuỳ chọn thêm:

```markdown
## Ma trận ưu tiên (tuỳ chọn)
| | Quan trọng | Không quan trọng |
|---|---|---|
| **Khẩn cấp** | Q1: | Q3: |
| **Không khẩn cấp** | Q2: | Q4: |
```

Ghi độ tin cậy hoặc ngữ cảnh thiếu chỉ khi bằng chứng mỏng. Q4 là đề xuất hoãn hoặc xem xét — **không** tự xóa hoặc đóng task.
