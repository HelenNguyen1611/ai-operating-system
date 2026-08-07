# Power Automate — Team Availability Snapshot Checklist

Checklist để flow Power Automate ghi file JSON mà MCP gateway đọc qua `TEAM_AVAILABILITY_SNAPSHOT_PATH`.

**Mục tiêu:** Morning Brief hiển thị đúng Team line (🟢 full / 🟡 có nghỉ), **kể cả leave chưa approve**.

**File output mặc định (ví dụ):**  
`/Users/admin/Library/CloudStorage/OneDrive-WooDesign/TeamAvailability/team-availability.json`

---

## 1. Contract JSON (gateway yêu cầu)

### Root object

```json
{
  "generated_at": "2026-08-07T05:30:00+07:00",
  "people": [
    /* array of person objects */
  ]
}
```

| Field          | Bắt buộc | Quy tắc                                                               |
| -------------- | -------- | --------------------------------------------------------------------- |
| `generated_at` | Yes      | ISO 8601 **có offset** (`+07:00` hoặc `Z`) — thời điểm flow chạy xong |
| `people`       | Yes      | Mảng; có thể rỗng `[]` nhưng không được null                          |

### Mỗi phần tử trong `people`

```json
{
  "name": "Alice Nguyen",
  "start_date": "2026-08-06",
  "end_date": "2026-08-07",
  "availability_type": "Annual Leave",
  "approval_status": ""
}
```

| Field               | Excel column (tham khảo) | Quy tắc                                                        |
| ------------------- | ------------------------ | -------------------------------------------------------------- |
| `name`              | Full name                | Trim; không để trống                                           |
| `start_date`        | Start date               | **`YYYY-MM-DD` only** — không dùng `06-Aug-26`                 |
| `end_date`          | End date                 | **`YYYY-MM-DD` only**; `end_date >= start_date`                |
| `availability_type` | Leave type               | Ví dụ: `Annual Leave`, `Work from home`, `Sick/ Carer's Leave` |
| `approval_status`   | Approval Status          | Xem mục 3 — **bắt buộc export cả row chưa approve**            |

### Không được ghi vào JSON (gateway loại bỏ / không đọc)

- Reason
- Note
- Upload relevant document
- Leave approver email
- Employee email
- Cột Q hay cột phụ trợ khác

---

## 2. Trước khi sửa flow — kiểm tra Excel nguồn

- [ ] Row Alice 06–07/08/2026 **có trên sheet** (ví dụ row 343)
- [ ] `Full name` = `Alice Nguyen`
- [ ] `Leave type` = `Annual Leave`
- [ ] `Start date` / `End date` đúng 6–7 Aug 2026
- [ ] `Approval Status` **trống** hoặc khác `Approve` (Travis chưa approve)
- [ ] Flow đọc **đúng workbook / table / sheet** (không phải bản copy cũ)

---

## 3. Quy tắc Approval Status (quan trọng)

### Phải làm

- [ ] Export **tất cả** row leave/WFH **còn hiệu lực hoặc sắp tới** — không chỉ `Approve`
- [ ] Row **Approval Status trống** → ghi `"approval_status": ""`
- [ ] Row `Pending` / `Reject` / bất kỳ giá trị khác `Approve` → ghi **nguyên chuỗi** (gateway coi là chưa approve)

### Chỉ coi là đã duyệt khi

```text
approval_status === "Approve"   // đúng chữ hoa A, không có khoảng trắng thừa
```

### Không được làm

- [ ] ~~Filter chỉ `Approval Status = Approve` trước khi ghi JSON~~
- [ ] ~~Bỏ qua row có Approval Status trống~~
- [ ] ~~Gán mặc định `"Approve"` khi ô trống~~

### Hiển thị trên Morning Brief

| `approval_status`       | Gateway                             |
| ----------------------- | ----------------------------------- |
| `"Approve"`             | 🟡 `{name} — {type}`                |
| `""`, `Pending`, …      | 🟡 `{name} — {type} (chưa approve)` |
| Không có row trong JSON | Không hiện — coi như chưa sync      |

---

## 4. Quy tắc ngày (Start / End)

Excel thường hiện `06-Aug-26` — **phải convert** trước khi ghi JSON.

### Power Automate — gợi ý

**Cách 1 — FormatDateTime (khuyên dùng):**

```text
formatDateTime(item()?['Start date'], 'yyyy-MM-dd')
formatDateTime(item()?['End date'], 'yyyy-MM-dd')
```

**Cách 2 — Compose:**

- Input locale: `en-GB` hoặc parse từ Excel serial date
- Output luôn: `2026-08-06`

### Checklist ngày

- [ ] Mọi `start_date` / `end_date` match regex `^\d{4}-\d{2}-\d{2}$`
- [ ] Năm **2026** (không còn stuck ở 2025)
- [ ] `end_date >= start_date` cho từng row
- [ ] Row nghỉ 1 ngày: `start_date === end_date` (ví dụ `2026-08-06`)

### Phạm vi row cần export

Chọn một trong hai (nhất quán):

| Chiến lược                           | Mô tả                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| **A — Rolling window (khuyên dùng)** | Export row có `end_date >= today - 30 days` HOặc `start_date <= today + 90 days` |
| **B — Full table**                   | Export toàn bộ table leave (file lớn hơn nhưng đơn giản)                         |

Hiện tại snapshot cũ dừng ở `2026-02-25` → flow **không lấy row mới** hoặc **filter quá hẹp**.

- [ ] Đã mở rộng / bỏ filter ngày cũ
- [ ] Row tháng 8/2026 xuất hiện trong JSON sau khi chạy flow

---

## 5. Các bước flow Power Automate (template)

### Trigger

- [ ] Recurrence: mỗi **15–30 phút** trong giờ làm việc, hoặc **khi file Excel/table thay đổi**
- [ ] Hoặc: manual + scheduled (ít nhất 1 lần trước Morning Brief)

### Lấy dữ liệu

- [ ] Action: **List rows present in a table** (Excel Online) hoặc tương đương SharePoint list
- [ ] Đúng site / workbook / table name
- [ ] **Không** filter Approval Status ở bước này (filter ngày nhẹ nếu cần — xem mục 4)

### Select / Map từng row

- [ ] **Apply to each** row
- [ ] Map:
  - `name` ← Full name (trim)
  - `start_date` ← FormatDateTime Start date → `yyyy-MM-dd`
  - `end_date` ← FormatDateTime End date → `yyyy-MM-dd`
  - `availability_type` ← Leave type
  - `approval_status` ← Approval Status (để trống nếu null → `""`)

### Bỏ row không hợp lệ (optional)

- [ ] Skip nếu `name` trống
- [ ] Skip nếu `start_date` hoặc `end_date` parse fail
- [ ] **Không** skip chỉ vì approval trống

### Gom JSON

- [ ] Compose object:

```json
{
  "generated_at": "@{utcNow()}",
  "people": @{body('Select')}
}
```

- [ ] `generated_at` nên có timezone (ví dụ convert sang `SE Asia Standard Time` rồi format ISO offset)

### Ghi file

- [ ] Action: **Create file** hoặc **Update file** (OneDrive / SharePoint)
- [ ] Path trùng `TEAM_AVAILABILITY_SNAPSHOT_PATH` trong `.env` gateway
- [ ] Ghi **atomic** nếu có thể: ghi temp → rename (tránh gateway đọc file đang ghi dở)
- [ ] Encoding: **UTF-8**

---

## 6. Cấu hình gateway (.env)

```bash
TEAM_AVAILABILITY_SNAPSHOT_PATH=/Users/admin/Library/CloudStorage/OneDrive-WooDesign/TeamAvailability/team-availability.json
TEAM_AVAILABILITY_MAX_AGE_MINUTES=180   # optional — cảnh báo nếu snapshot quá cũ
```

- [ ] Path trong `.env` **trùng** path flow ghi
- [ ] OneDrive đã sync file lên máy chạy gateway
- [ ] Sau khi sửa flow: **restart gateway**

---

## 7. Verification sau khi chạy flow

### 7.1 Kiểm tra nhanh JSON (terminal)

```bash
cd apps/mcp-gateway

# Đếm pending
npx tsx --env-file=.env -e "
import { readFile } from 'node:fs/promises';
import { loadTeamAvailabilityConfig } from './src/adapters/team-availability/config.js';
import { isApprovedLeave } from './src/adapters/team-availability/mapper.js';
const cfg = loadTeamAvailabilityConfig();
const snap = JSON.parse(await readFile(cfg.snapshotPath, 'utf8'));
const pending = snap.people.filter(p => !isApprovedLeave(p.approval_status));
console.log('total:', snap.people.length, '| pending:', pending.length);
console.log('Alice:', snap.people.filter(p => p.name.includes('Alice')));
"
```

**Pass criteria:**

- [ ] `pending >= 1` nếu Excel có row chưa approve (Alice)
- [ ] Có record `Alice Nguyen` với `start_date: 2026-08-06`, `end_date: 2026-08-07`
- [ ] `approval_status` của Alice là `""` hoặc không phải `"Approve"`
- [ ] `generated_at` mới hơn lần chạy trước

### 7.2 Kiểm tra gateway tool

```bash
npx tsx --env-file=.env -e "
import { loadTeamAvailabilityConfig } from './src/adapters/team-availability/config.js';
import { createTeamAvailabilityAdapter } from './src/adapters/team-availability/index.js';
const cfg = loadTeamAvailabilityConfig();
const r = await createTeamAvailabilityAdapter(cfg).getAvailability({ date: '2026-08-06' });
console.log(JSON.stringify(r.events, null, 2));
"
```

- [ ] Alice xuất hiện với `approved: false`

### 7.3 Kiểm tra Morning Brief

- [ ] Gọi `morning_brief` `{ language: "vi", detail: "standard" }`
- [ ] Dòng Team **🟡 vàng**: `Alice Nguyen — Annual Leave (chưa approve)`
- [ ] Không còn 🟢 "Full team" nếu Alice đang nghỉ

---

## 8. Troubleshooting

| Triệu chứng                                    | Nguyên nhân thường gặp        | Việc cần làm                                 |
| ---------------------------------------------- | ----------------------------- | -------------------------------------------- |
| `pending: 0` nhưng Excel có row trống Approval | Flow filter Approve-only      | Bỏ filter; map `""` khi trống                |
| Không có row tháng 8/2026                      | Filter ngày cũ / sai table    | Mở rộng window; kiểm tra nguồn Excel         |
| Alice có trong Excel, không có trong JSON      | Flow chưa chạy lại / sai path | Chạy manual flow; kiểm tra OneDrive path     |
| Gateway `SNAPSHOT_NOT_FOUND`                   | Path `.env` ≠ path flow       | Đồng bộ path                                 |
| Gateway `SNAPSHOT_STALE`                       | `generated_at` quá cũ         | Tăng tần suất trigger hoặc `MAX_AGE_MINUTES` |
| Date parse error / invalid snapshot            | Format `06-Aug-26`            | Dùng `formatDateTime(..., 'yyyy-MM-dd')`     |
| 🟢 Full team dù Alice nghỉ                     | JSON chưa có Alice            | Quay lại mục 7.1                             |

---

## 9. Test case mẫu (Alice — chưa approve)

**Input Excel (row 343):**

| Full name    | Leave type   | Start date | End date  | Approval Status |
| ------------ | ------------ | ---------- | --------- | --------------- |
| Alice Nguyen | Annual Leave | 06-Aug-26  | 07-Aug-26 | _(trống)_       |

**Expected JSON fragment:**

```json
{
  "name": "Alice Nguyen",
  "start_date": "2026-08-06",
  "end_date": "2026-08-07",
  "availability_type": "Annual Leave",
  "approval_status": ""
}
```

**Expected Morning Brief (VI):**

```markdown
- **Team:** 🟡 Alice Nguyen — Annual Leave (chưa approve)
```

---

## 10. Sign-off checklist (lần deploy flow mới)

- [ ] Flow export **Approve + pending** (approval trống)
- [ ] Date format `YYYY-MM-DD` verified trên ≥3 row mẫu
- [ ] Row mới tháng 8/2026 có trong JSON
- [ ] `generated_at` cập nhật mỗi lần chạy
- [ ] Path JSON khớp `.env`
- [ ] Gateway restart
- [ ] `morning_brief` hiển thị 🟡 đúng
- [ ] Travis approve sau → row chuyển `"Approve"` → vẫn 🟡 nhưng **không** còn `(chưa approve)`

---

_Tài liệu này bám contract tại `apps/mcp-gateway/src/adapters/team-availability/mapper.ts` và hiển thị tại `apps/mcp-gateway/src/lib/team-summary.ts`._
