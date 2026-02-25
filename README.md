# Social Network Frontend

Frontend cho dự án mạng xã hội, được xây dựng bằng **React**, **TypeScript** và **Vite**. Dự án sử dụng **Tailwind CSS** cho styling và **Shadcn UI** cho các component.

## 🚀 Hướng dẫn chạy dự án

### Điều kiện tiên quyết
- Node.js (phiên bản 18 trở lên)
- npm hoặc pnpm

### Các bước cài đặt

1. **Cài đặt dependencies:**
   ```bash
   npm install
   # hoặc
   pnpm install
   ```

2. **Chạy dự án ở chế độ phát triển:**
   ```bash
   npm run dev
   # hoặc
   pnpm dev
   ```

3. **Truy cập ứng dụng:**
   Mở trình duyệt và truy cập: [http://localhost:5173](http://localhost:5173)

---

## 🏗️ Cấu trúc thư mục (Feature-Based Architecture)

Dự án được tổ chức theo kiến trúc **Feature-Based**, giúp dễ dàng mở rộng và quản lý code theo từng tính năng cụ thể.

```text
src/
├── app/              # Cấu hình chính của ứng dụng (Router, Layout tổng)
├── assets/           # Hình ảnh, font, và các tài nguyên tĩnh
├── components/       # Các UI Component dùng chung (Button, Input,...)
│   └── ui/           # Các component từ Shadcn UI
├── features/         # Nơi chứa các tính năng chính của dự án
│   ├── auth/         # Tính năng đăng nhập, đăng ký
│   ├── post/         # Tính năng bài viết
│   ├── chat/         # Tính năng nhắn tin
│   ├── notification/ # Tính năng thông báo
│   ├── user/         # Tính năng trang cá nhân, thông tin người dùng
│   └── ...           # Các tính năng khác (follow, comment, reaction,...)
├── hooks/            # Các Custom Hooks dùng chung cho toàn dự án
├── lib/              # Cấu hình cho các thư viện bên thứ 3 (utils, axios,...)
├── services/         # Các service kết nối API, Socket
├── types/            # Định nghĩa các TypeScript Interface/Type dùng chung
└── utils/            # Các hàm tiện ích (format date, validation,...)
```

### Chi tiết bên trong mỗi Feature
Mỗi folder trong `src/features` sẽ bao gồm:
- `components/`: Các component chỉ dùng riêng cho feature đó.
- `hooks/`: Các custom hooks phục vụ logic của feature.
- `services/`: Các hàm gọi API liên quan.
- `types/`: Kiểu dữ liệu riêng cho tính năng.

---

## 🛠️ Công nghệ sử dụng

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) (nếu có)
- **Networking:** [Axios](https://axios-http.com/), [Socket.io Client](https://socket.io/docs/v4/client-api/)
