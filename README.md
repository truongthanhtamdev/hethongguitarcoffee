# Piano Guitar Đệm Hát — Quản lý điểm danh & chấm công giáo viên

Web app cho trung tâm dạy guitar online 1 kèm 1 (~200 lớp): điểm danh buổi học,
chấm công theo buổi, quản lý khung giờ rảnh của giáo viên, và giao lớp học
dựa trên lịch rảnh. Xây bằng Next.js (App Router) + SQLite, chạy được trên
một VPS nhỏ, không cần dịch vụ ngoài.

## Vai trò

| Vai trò | Quyền |
|---|---|
| **Admin** | Toàn quyền: tạo tài khoản cho Giáo vụ/Giáo viên/Học viên, quản lý giáo viên & lương/buổi, quản lý lớp, giao lớp, sửa điểm danh, xem/xuất báo cáo lương, quản lý doanh thu & lợi nhuận. |
| **Giáo vụ** (coordinator) | Tạo/sửa lớp học, giao lớp cho giáo viên, xem & sửa nhật ký điểm danh. Không xem/sửa được lương hay tài khoản. |
| **Giáo viên** | Xem lớp được giao, **tự thêm lớp mới của mình** (học sinh + thứ/giờ học) và sửa lịch lớp mình đang dạy, điểm danh buổi học hôm nay (kèm nội dung bài học + tick "đã điểm danh trên Facebook"), đánh dấu khung giờ bận trong tuần, xem lịch dạy & thu nhập của mình. |
| **Học viên** | Đăng nhập xem lớp học của mình: tiến độ gói học (đã học/còn lại bao nhiêu tiết) và nội dung các buổi học gần đây — phần này chỉ xem, không sửa. Ngoài ra có khu **tự học guitar**: lộ trình 36 buổi tự đánh dấu hoàn thành, thư viện hợp âm, metronome, lên dây đàn bằng mic và máy đệm hát. |

Lưu ý: hệ thống **không thay thế** việc điểm danh trên nhóm Facebook — giáo
viên vẫn cần điểm danh song song ở cả hai nơi như quy định hiện tại của
trung tâm; hệ thống chỉ có ô tick để xác nhận đã làm việc đó.

## Tài khoản khi chạy lần đầu

Lần đầu khởi động, hệ thống chỉ tạo sẵn **1 tài khoản Admin**, không có dữ
liệu demo nào khác:

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@musicnote.local | admin123 |

**Đổi mật khẩu này ngay khi đăng nhập lần đầu.** Sau đó Admin là người tạo
toàn bộ tài khoản còn lại (Giáo vụ ở trang **Nhân sự quản lý**, Giáo viên ở
trang **Giáo viên**, Học viên ở trang **Học viên**) và nhập lớp học (thủ công
hoặc import CSV hàng loạt).

Riêng **học viên còn có thể tự đăng ký** ở trang `/register` — tài khoản tạo
theo đường này luôn là vai trò Học viên, dùng ngay được khu tự học nhưng chưa
gắn với lớp nào. Muốn học viên đó xem được lịch học, admin vào **chi tiết
lớp → gắn tài khoản học viên** bằng email họ đã đăng ký.

Đăng nhập nhận **email hoặc số điện thoại** đã lưu trong hồ sơ.

## Chạy thử (development)

```bash
npm install
cp .env.example .env.local   # rồi sửa AUTH_SECRET
npm run dev
```

Mở http://localhost:3000 — lần chạy đầu tiên hệ thống tự tạo file SQLite tại
`data/musicnote.db` và chèn sẵn tài khoản Admin ở trên.

## Triển khai (production)

Ứng dụng dùng SQLite lưu trên đĩa cục bộ, nên cần máy chủ Node.js **có ổ đĩa
lưu trữ lâu dài** (VPS, Docker container có volume...). Không chạy được trên
nền tảng serverless không lưu trạng thái (Vercel mặc định, v.v.) vì mỗi lần
gọi hàm dữ liệu sẽ mất.

**Bắt buộc có HTTPS**: phần lên dây đàn dùng micro, mà trình duyệt chỉ cho
phép truy cập micro trên `https` hoặc `localhost`. Chạy tạm qua
`http://<ip>:<port>` thì mọi thứ khác vẫn dùng được, riêng tuner sẽ báo không
truy cập được micro.

### Cách 1 — Docker Compose (khuyến nghị)

Kèm sẵn `Dockerfile`, `docker-compose.yml` và `Caddyfile`. Caddy đứng trước lo
HTTPS: tự xin chứng chỉ Let's Encrypt và tự gia hạn, không phải cấu hình gì
thêm.

Chuẩn bị: một VPS đã cài Docker, và tên miền đã trỏ bản ghi A về IP của VPS.

```bash
git clone <repo> && cd musicnote/app

cat > .env <<EOF
DOMAIN=hocguitar.tenmien.com
AUTH_SECRET=$(openssl rand -base64 48)
EOF

docker compose up -d --build
```

Mở `https://hocguitar.tenmien.com` và đăng nhập bằng tài khoản admin mặc
định — **đổi mật khẩu ngay**.

Dữ liệu nằm trong volume `musicnote-data`. Sao lưu:

```bash
docker compose exec -T app sh -c 'cat /data/musicnote.db' > backup-$(date +%F).db
```

Cập nhật phiên bản mới:

```bash
git pull && docker compose up -d --build
```

### Cách 2 — Chạy trực tiếp bằng Node

```bash
npm ci
npm run build
AUTH_SECRET="chuoi-bi-mat-rat-dai-va-ngau-nhien" DATA_DIR="/var/lib/musicnote/data" COOKIE_SECURE=true npm run start -- -p 3000
```

Rồi đặt Nginx/Caddy phía trước để có HTTPS, và dùng `pm2` hoặc systemd để tự
khởi động lại khi VPS reboot.

### Lưu ý chung

- `COOKIE_SECURE=true` chỉ đặt **khi đã có HTTPS thật**. Đặt `true` lúc còn
  chạy `http://` sẽ khiến trình duyệt từ chối lưu cookie và người dùng bị đá
  về trang đăng nhập liên tục.
- `AUTH_SECRET` là chuỗi ngẫu nhiên dài, giữ bí mật và **không đổi** sau khi
  đã có người đăng nhập (đổi sẽ làm mất hiệu lực mọi phiên hiện tại).
- Sao lưu định kỳ `DATA_DIR` — đó là toàn bộ dữ liệu: giáo viên, lớp học,
  điểm danh, học phí, tiến độ tự học.
- **Không đưa database lúc dev lên máy chủ.** `next build` có kéo `data/` vào
  `.next/standalone/`; `.dockerignore` đã loại thư mục này nên bản Docker
  luôn khởi tạo database mới, nhưng nếu copy tay `.next/standalone` lên server
  thì nhớ xoá `data/` trước.

### Cài như một app trên điện thoại (PWA)

Không cần lên App Store / CH Play. Sau khi có HTTPS, mở trang bằng trình duyệt
trên điện thoại rồi:

- **Android (Chrome)**: menu ⋮ → *Cài đặt ứng dụng* / *Thêm vào màn hình chính*
- **iPhone (Safari)**: nút Chia sẻ → *Thêm vào MH chính*

App sẽ có icon riêng, mở toàn màn hình không còn thanh địa chỉ, và vào thẳng
màn hình lộ trình 36 buổi. Cấu hình nằm ở `src/app/manifest.ts`.

## Các luồng chính

- **Admin/Giáo vụ → Lớp học**: thêm lớp mới (học sinh, thứ/giờ học cố
  định hàng tuần, thời lượng), sửa thông tin, tạm dừng/kết thúc lớp. Lớp có
  thể chọn **Linh động** (không có lịch cố định hàng tuần) thay vì cố định —
  lớp linh động không hiện trong "Hôm nay"/"Buổi tiếp theo" (vì không có
  ngày cố định để tính), giáo viên điểm danh từng buổi qua "Lịch sử điểm
  danh → + Điểm danh buổi học bù" mỗi khi có buổi học thực tế. Giáo viên tự
  thêm lớp của mình cũng sửa/xoá được lớp đó (ví dụ thêm nhầm hoặc cần cập
  nhật lại lịch đã điền).
- **Admin/Giáo vụ → Giao lớp**: danh sách lớp chưa có giáo viên; hệ thống
  gợi ý giáo viên đang rảnh khung giờ đó (đánh dấu ✓), bấm để giao ngay. Khi
  admin/Giáo vụ **tạo lớp mới rồi gán luôn giáo viên**, hoặc giao một lớp có
  sẵn cho giáo viên ở trang này, hệ thống tự gửi **thông báo** cho giáo viên
  đó (hiện ở đầu trang khi họ đăng nhập, bấm "Đã đọc" để ẩn) và **tự động
  tính buổi đầu tiên là buổi học thử** (50.000đ/tiết, không cần tick tay) —
  chỉ áp dụng cho lớp đi qua luồng này; lớp giáo viên **tự thêm** (thường là
  lớp cũ đang backfill dữ liệu) không tự tính buổi thử.
- **Admin → Chi tiết giáo viên**: có **1 bảng lịch dạng lưới** theo ngày/giờ
  gộp chung lớp đang dạy và khung giờ bận — ô vàng là lớp (bấm để xem chi
  tiết), ô xám là giáo viên tự đánh dấu bận, ô trống là rảnh (bấm để thêm lớp
  mới ngay khung giờ đó, tự gán cho giáo viên này).
- **Giáo viên → Lịch dạy**: tự thêm lớp học mới của mình (tên học sinh, thứ/giờ
  học cố định hàng tuần, môn học, ngôn ngữ giảng dạy, và nguồn lớp — "Trung tâm
  giao" hay "GV tự tìm học viên") — hệ thống tự gán lớp cho chính giáo viên đó,
  và có thể sửa lại/xoá lớp mình đang dạy nếu nhập sai. Bấm "Lịch sử" trên
  từng lớp để xem riêng lịch sử điểm danh của học viên đó (không lẫn với các
  học viên khác).
- **Môn học & ngôn ngữ**: mỗi lớp có môn học (Guitar/Piano/Violin/Saxophone/
  Thanh nhạc — hoặc tự gõ môn khác) và ngôn ngữ giảng dạy (Tiếng Việt/Tiếng
  Anh). Mỗi giáo viên khai báo chuyên môn (chọn được nhiều môn) và ngôn ngữ
  mình dạy được — trang Giao lớp sẽ cảnh báo nếu định giao lớp cho giáo viên
  chưa khai chuyên môn đó hoặc chưa dạy được tiếng Anh (giáo viên chưa khai
  chuyên môn thì mặc định coi như dạy được mọi môn, để không ảnh hưởng giáo
  viên đã tạo từ trước).
- **Phụ huynh**: với học sinh là trẻ em, có thể ghi thêm tên phụ huynh/người
  đóng học phí (khác với tên học sinh) để tiện liên hệ, thu học phí.
- **Gói học (20/50/100 tiết)**: mỗi lớp có thể gắn 1 gói học; hệ thống tự đếm
  số buổi "Đã dạy" tính từ ngày bắt đầu gói để ra số tiết đã học/còn lại
  (cảnh báo màu cam khi còn ≤ 3 tiết). Bấm "Gia hạn (làm mới)" khi học viên
  mua gói mới — chỉ tính lại từ ngày gia hạn, không xoá lịch sử cũ. Trang
  Tổng quan của Admin có mục **"Học viên sắp hết khóa"** liệt kê tất cả học
  viên còn ≤ 3 tiết trên toàn hệ thống. Số buổi "Đã học" tự đếm được, nhưng
  Admin (trang chi tiết lớp) hoặc Giáo viên (trang Lịch dạy, hoặc ngay trên
  thẻ điểm danh ở "Hôm nay") đều bấm **"Sửa"** để nhập tay một mốc — ví dụ
  nhập lớp cũ vào hệ thống mà học viên đã học sẵn 15 buổi thì nhập "15" —
  **từ lúc đó số buổi tự cộng thêm mỗi khi điểm danh mới**, không bị đứng yên
  ở mốc đã nhập. Bấm nút bên cạnh để bỏ mốc tay, quay về tính tự động hoàn
  toàn theo điểm danh từ ngày bắt đầu gói.
- **Học nhiều buổi/tuần**: khi thêm lớp mới (cả ở trang Admin/Giáo vụ và
  trang Giáo viên tự thêm), bấm **"+ Thêm buổi/tuần"** để khai nhiều Thứ/giờ
  cùng lúc cho 1 học viên — ví dụ học Thứ 2 và Thứ 5 mỗi tuần — hệ thống tự
  tạo các lịch học riêng và **dùng chung 1 gói** cho tất cả (nếu chọn gói).
  Sau này vẫn có thể dùng chung/tách gói thủ công ở trang chi tiết lớp như
  trước.
- **Buổi học bù / dời lịch**: khi 1 buổi bị dời qua ngày khác với lịch cố
  định hàng tuần, giáo viên vào **Lịch sử điểm danh → "+ Điểm danh buổi học
  bù"**, chọn đúng lớp và ngày dạy bù thực tế để điểm danh — buổi này vẫn
  tính vào gói học của học viên như bình thường.
- **Buổi thứ mấy khi điểm danh**: mỗi lần điểm danh (cả ở "Hôm nay", khi sửa
  lại trong Lịch sử điểm danh, và ở form điểm danh bù) đều có ô **"Buổi thứ
  mấy"** — hệ thống tự điền sẵn số buổi đang tính, giáo viên sửa lại được nếu
  sai (ví dụ lớp cũ đã học sẵn 15 buổi thì gõ 15). Số vừa gõ thành mốc mới và
  các buổi sau **tự đếm tiếp** từ đó; để nguyên số hệ thống điền sẵn thì vẫn
  chạy tự động như bình thường.
- **Buổi học thử**: không cần tick tay — **buổi 0 chính là buổi học thử**. Lớp
  vừa được center tạo/giao cho giáo viên (mục Giao lớp ở trên) tự điền sẵn
  "buổi 0" ở lần điểm danh đầu, tính lương theo giá cố định 50.000đ/tiết
  (không theo đơn giá thường) và không trừ vào gói học; các buổi sau đánh số
  1, 2, 3... và tính lương bình thường. Giáo viên cũng có thể tự gõ 0 cho bất
  kỳ buổi nào đúng là buổi thử. Trang Chấm công/Lương và file CSV xuất ra có
  cột riêng đếm số buổi thử.
- **Buổi tiếp theo & cảnh báo quên điểm danh**: trang Lớp học hiện cột "Buổi
  tiếp theo" (ngày của buổi kế tiếp theo lịch cố định hàng tuần) và tô đỏ
  dòng nào đã quá lịch tuần này mà chưa có điểm danh. Trang Tổng quan cũng tô
  đỏ các lớp hôm nay đã quá giờ học mà giáo viên vẫn chưa điểm danh, để admin
  dễ theo dõi và quyết định miss công hay du di.
- **Nội dung bài học**: mỗi lần điểm danh, giáo viên ghi lại buổi đó đã dạy
  gì; nội dung này hiện trong lịch sử điểm danh (Admin/Giáo vụ/Giáo viên) và
  trong trang của Học viên, giúp theo dõi học viên đã học tới đâu.
- **Tài khoản Học viên**: Admin tạo tài khoản rồi gắn vào lớp (ở trang chi
  tiết lớp học) để học viên tự đăng nhập xem tiến độ gói học và nội dung các
  buổi học gần đây. Đăng nhập bằng Email hoặc SĐT tuỳ theo cách tạo tài khoản.
- **Giáo viên → Lịch tuần**: lưới theo tuần (30 phút/ô, 07:00–22:00) gộp
  chung lớp đang dạy (ô vàng, chỉ xem) và khung giờ bận cá nhân (ô xám) —
  **mặc định mọi ô đều rảnh**, chỉ cần bấm đánh dấu những khung giờ mình bận
  (không nhận lớp được); bấm lại để bỏ đánh dấu, hoặc "rảnh cả ngày" ở đầu
  cột để bỏ hết trong 1 ngày.
- **Admin/Giáo vụ → Nhập dữ liệu**: tải lên file CSV để tạo hàng loạt
  giáo viên/lớp học một lần (hữu ích khi đưa ~200 lớp có sẵn vào hệ thống),
  có file mẫu tải sẵn và báo lỗi theo từng dòng.
- **Giáo viên → Hôm nay**: danh sách lớp trong ngày, điểm danh 1 lần/lớp/buổi
  (trạng thái: Đã dạy / GV vắng / HS vắng / Dời lịch), có ô ghi chú và ô tick
  xác nhận đã điểm danh Facebook.
- **Admin → Chấm công / Lương**: chọn khoảng ngày, hệ thống tính
  `số buổi "Đã dạy" × đơn giá/buổi` cho từng giáo viên, xuất file CSV để trả
  lương. Bấm vào **tên giáo viên** để xem ngay nhật ký điểm danh của người đó
  trong đúng khoảng ngày đang tính lương (đối chiếu từng buổi).
- **Admin → Doanh thu**: ghi nhận từng khoản học phí thu được (số tiền, ngày,
  có thể gắn với 1 lớp cụ thể) và chi phí phát sinh (quảng cáo, vận hành...,
  loại tự gõ). Khi chọn 1 lớp có gói học, số tiền tự điền sẵn theo bảng giá
  (Guitar 20 tiết: 7,5tr, 50 tiết: 15tr · Piano/Violin/Thanh nhạc 20 tiết:
  8tr, 50 tiết: 16tr — gói 100 tiết hoặc môn khác tự nhập tay), admin vẫn sửa
  lại được nếu giá thực tế khác. Chọn khoảng ngày (mặc định theo tháng hiện
  tại) để xem
  **Doanh thu, Lương giáo viên, Chi phí khác, Lợi nhuận** (= doanh thu − lương
  − chi phí), xuất file CSV hàng tháng để gửi báo cáo.

- **Học viên → Học guitar**: lộ trình 36 buổi chia 6 chặng (làm quen đàn →
  14 hợp âm → Slow Rock → Ballad → quạt chả → bài tốt nghiệp). Đánh dấu xong
  một buổi thì các hợp âm mới của buổi đó tự vào danh sách "đã thuộc" và cộng
  30 phút luyện tập. Tiến độ tự học lưu riêng với điểm danh: điểm danh là buổi
  giáo viên dạy thật, còn đây là bài học viên tự làm ở nhà — màn hình lộ trình
  hiện cả hai để đối chiếu, và admin thấy cột **Tự học** ở trang Học viên.
- **Học viên → Hợp âm / Luyện tập**: 20 hợp âm vẽ sơ đồ thế bấm, chạm để nghe
  tiếng đàn mẫu; metronome (2/4, 3/4, 4/4, 6/8, tap tempo), lên dây đàn bằng
  micro (hiện sai số theo cent) và máy đệm hát 5 kiểu điệu × 8 vòng hợp âm.
  Tiếng đàn được tổng hợp trực tiếp trong trình duyệt (Karplus-Strong) nên
  không cần file âm thanh nào. **Lưu ý:** phần lên dây cần micro nên trang
  phải chạy trên `https` hoặc `localhost` thì trình duyệt mới cho phép.

## Ngăn xếp công nghệ

Next.js 16 (App Router, Server Actions) · TypeScript · Tailwind CSS ·
SQLite qua `better-sqlite3` · JWT trong cookie httpOnly cho phiên đăng nhập.
