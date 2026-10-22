# VT Workspace — ungdungvt

Cổng tĩnh tiếng Việt cho bốn công cụ GitHub Pages, giao diện điện thoại/máy tính, menu, iframe và liên kết mở tab luôn sẵn có.

## Trạng thái

Đã xác nhận GitHub Pages hiển thị giao diện mới tại https://adamavaadam.github.io/ungdungvt/ ngày 21/10/2026. Đăng nhập bị khóa cho tới khi cấu hình Supabase; không có tài khoản/mật khẩu mặc định hoặc chế độ bỏ qua đăng nhập. Trình duyệt đã mở trực tiếp được cả bốn URL; BHVer1 là Báo giá nhanh, Bản đồ nhiệt có màn hình đăng nhập riêng, Phân tích số có dashboard kèm nội dung văn bản dư từ cuộc trò chuyện cũ, Công nợ có khung ứng dụng. Không sửa các công cụ gốc. Chưa kiểm chứng nhúng iframe và tác vụ bên trong: môi trường shell không phân giải được tên miền, công cụ web không truy cập được URL và chưa có phiên Admin để kiểm thử dashboard thực. Sự kiện iframe load không chứng minh nội dung tải thành công nên giao diện không tuyên bố nhúng thành công.

## Đưa lên GitHub Pages

Đặt index.html, styles.css, app.js, config.js ở gốc repo AdamAvaAdam/ungdungvt. Trong Settings → Pages → Build and deployment chọn Deploy from a branch, branch main, thư mục /(root), rồi Save. Kiểm tra tác vụ Pages hoàn tất và mở https://adamavaadam.github.io/ungdungvt/. Địa chỉ này chỉ là mục tiêu cho đến khi Pages xác nhận xuất bản.

## Bật tài khoản Admin qua Supabase

1. Tạo dự án Supabase của bạn. Trong Authentication, tắt Allow new users to sign up. Cổng không có chức năng đăng ký.
2. Trong Authentication → Users, tạo tài khoản bằng email bạn sở hữu và mật khẩu MỚI. Không dùng lại mật khẩu đã gửi trong chat; đổi ở mọi nơi đang dùng lại. Không đưa mật khẩu vào repo, issue hay file cấu hình.
3. Dùng công cụ quản trị Supabase đáng tin cậy để đặt app_metadata của user thành {"portal_role":"admin"}. Có thể chạy SQL sau trong SQL Editor, thay UUID bằng ID tài khoản vừa tạo:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"portal_role":"admin"}'::jsonb
where id = 'THAY-BANG-UUID-TAI-KHOAN'::uuid;
```

4. Trong config.js điền supabaseUrl (https://PROJECT.supabase.co) và publishableKey (sb_publishable_...). Đây là cấu hình công khai. Tuyệt đối không dùng secret key hoặc service_role. Không thêm mật khẩu vào file. Legacy anon key cũng được hỗ trợ, nhưng ưu tiên publishable key.
5. Đăng nhập bằng email quản trị và mật khẩu mới. Tên hiển thị là Admin; không dùng username Admin giả làm địa chỉ email. Đăng xuất rồi đăng nhập lại sau khi thay quyền.
6. Tự kiểm tra: sai mật khẩu bị từ chối, user không có portal_role bị từ chối, user admin vào dashboard được, đăng xuất xóa khung ứng dụng, tải lại trang phải đăng nhập lại. Token chỉ giữ trong bộ nhớ; phiên cổng tối đa một giờ, không lưu password/token vào localStorage. Nếu đăng xuất máy chủ thất bại, thông báo hiển thị rõ.

Xác thực dùng HTTPS trực tiếp với Supabase Auth; máy chủ kiểm tra mật khẩu và cổng kiểm tra quyền trong app_metadata được Auth trả về. Không dùng user_metadata để cấp quyền vì người dùng có thể tự sửa trường đó. Chưa kiểm thử với dự án Supabase thật do chưa có cấu hình.

## Giới hạn bảo vệ và dữ liệu

GitHub Pages phục vụ HTML/JS công khai. Việc khóa dashboard không làm bốn URL gốc trở thành riêng tư. Người biết đường dẫn vẫn mở trực tiếp được. Muốn bảo vệ dữ liệu thực sự, mỗi công cụ cần xác thực và backend kiểm tra JWT/quyền trên mỗi yêu cầu; nếu dùng Supabase Database, bật RLS và chính sách dựa trên quyền do máy chủ cấp. Không đưa dữ liệu nhạy cảm vào tệp tĩnh hoặc khóa bí mật trong trình duyệt. Chưa có thay đổi nào được thực hiện cho backend hay dữ liệu bốn công cụ.

Cổng và bốn công cụ đang có cùng origin adamavaadam.github.io. Iframe cần allow-scripts + allow-same-origin để tương thích ứng dụng cũ; đây KHÔNG phải ranh giới cách ly an toàn với mã không tin cậy. Chỉ nhúng các công cụ do bạn kiểm soát. Nếu cần cách ly, chuyển công cụ sang origin khác và dùng mở tab hoặc chính sách sandbox chặt hơn sau khi thử tương thích.

## Kiểm tra iframe sau khi xuất bản

Mở từng công cụ từ dashboard; so sánh thao tác, đăng nhập riêng, tải tệp và lưu dữ liệu với khi mở tab. Trong DevTools → Network kiểm tra phản hồi cuối sau redirect: X-Frame-Options và Content-Security-Policy frame-ancestors. SAMEORIGIN thường cho phép cổng cùng origin; DENY hoặc frame-ancestors không cho phép cổng sẽ chặn. Khung trống cũng có thể do lỗi mạng hoặc chính ứng dụng. Liên kết Mở tab mới luôn có; không tự mở popup theo bộ hẹn giờ. Không thể tin cậy tự phát hiện chặn iframe khác origin chỉ từ onload/onerror. Cổng không chuyển session Supabase sang công cụ con và không giả lập SSO.

Tài liệu: https://supabase.com/docs/guides/auth/passwords
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Doanh số chương trình 22–31/10/2026

Đã thêm công cụ thứ năm **Doanh số chương trình** vào menu và dashboard. Mở trong khung của cổng hoặc mở tab riêng tại `doanh-so/`. Các ứng dụng cũ và cấu hình đăng nhập được giữ nguyên.

Công cụ đọc tab **Đơn hàng** (`gid=912353833`) của Google Sheets Tồn - Giá. Trong ứng dụng, chọn **Google Sheets → Đọc & kiểm tra nguồn → Lưu & kết nối nguồn**. Chỉ xác nhận cột Tổng tiền đã gồm VAT 8% khi đã đối chiếu. Có cập nhật thủ công hoặc mỗi 5 phút khi mở trang. Không ghi vào bảng nguồn và không nhúng thông tin đăng nhập.

Theo dõi doanh số cộng dồn 22–31/10, loại điều hòa Daikin; chỉ Hùng Thanh và Tuấn Ngoan áp dụng S-VIP, các khách khác là **Khách hàng**. Mốc một đơn/ngày chỉ là ghi chú, không tính vào thanh tiến độ cộng dồn. Giữ nhập Excel và bổ sung doanh số, xuất CSV, sao lưu/phục hồi JSON. Không đưa dữ liệu khách, Excel hay bản sao lưu vào repository.

Dữ liệu và xác nhận lưu trong trình duyệt, không đồng bộ giữa thiết bị. Đồng bộ Sheets thay dữ liệu Google đã quản lý, giữ doanh số thủ công; lần đầu kết nối cần đối soát Excel cũ hoặc dòng thủ công có trùng giao dịch. Đường dẫn ứng dụng tĩnh riêng vẫn có cùng giới hạn bảo vệ như các công cụ GitHub Pages khác đã mô tả ở trên.
