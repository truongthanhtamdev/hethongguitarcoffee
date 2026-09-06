/**
 * Đàn bán tại shop Sài Thành Guitar. Giá ở đây là bản chụp lúc cập nhật —
 * mỗi cây bấm được sang trang sản phẩm để xem giá và tồn kho mới nhất.
 */

export const SHOP_UPDATED = "06/09/2026";

export interface Guitar {
  name: string;
  price: string;
  /** Giá gốc trước giảm; rỗng nếu không giảm */
  priceOld: string;
  soldOut: boolean;
  /** Mã dùng trong đường dẫn /shop/<slug> */
  slug: string;
  /** Trang gốc của nhà cung cấp — chỉ dùng nội bộ, không hiện cho khách */
  url: string;
  /** Rỗng khi shop chặn dẫn ảnh từ ngoài — lúc đó hiện icon thay thế */
  img: string;
}

export function guitarBySlug(slug: string): Guitar | undefined {
  return GUITARS.find((g) => g.slug === slug);
}

export const GUITARS: Guitar[] = [
  { name: "Đàn Guitar Acoustic Mini DIY-01 Tự Lắp Ráp Sáng Tạo",
    price: "790.000 ₫", priceOld: "", soldOut: false,
    slug: "dan-guitar-acoustic-mini-diy-01-tu-lap-rap-sang-tao",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-mini-diy-01-tu-lap-rap-sang-tao",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/253c36c8-2482-4769-b4f5-d83f65898346.jpg" },
  { name: "Đàn Guitar Acoustic Mã ST - X1 Chính Hãng ST.Real Có Ty Chỉnh Cần",
    price: "920.000 ₫", priceOld: "1.340.000 ₫", soldOut: false,
    slug: "dan-guitar-acoustic-ma-st-x1-chinh-hang-st-real-co-ty-chinh-can",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-ma-st-x1-chinh-hang-st-real-co-ty-chinh-can",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/6daa93ab-9e50-44df-a06f-0cf1a2a03854.webp" },
  { name: "(Mẫu Nâng Cấp Tĩnh Điện) Đàn Guitar Acoustic ST.Real Mã STX1",
    price: "1.110.000 ₫", priceOld: "", soldOut: false,
    slug: "mau-nang-cap-tinh-dien-dan-guitar-acoustic-st-real-ma-stx1",
    url: "https://saithanhguitar.com/san-pham/mau-nang-cap-tinh-dien-dan-guitar-acoustic-st-real-ma-stx1",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/39cfb3df-72e3-42ea-99c4-28bdbb0fad53.webp" },
  { name: "Đàn Guitar Acoustic Mã X1-Pro Gỗ Ebony",
    price: "1.150.000 ₫", priceOld: "", soldOut: false,
    slug: "dan-guitar-acoustic-ma-x1-pro-go-ebony",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-ma-x1-pro-go-ebony",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/0f63a4e4-6783-4de6-bd64-ce2dd503e966.webp" },
  { name: "Đàn Guitar Mini Acoustic Chính Hãng ST.Real Guitar Sài Thành",
    price: "1.250.000 ₫", priceOld: "", soldOut: false,
    slug: "dan-guitar-mini-acoustic-chinh-hang-st-real-guitar-sai-thanh",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-mini-acoustic-chinh-hang-st-real-guitar-sai-thanh",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/c1cdb938-bd01-49a8-b913-e9a99458b68e.webp" },
  { name: "Đàn Guitar Acoustic X1 Có Lắp EQ7545 Kết Nối Loa",
    price: "1.250.000 ₫", priceOld: "", soldOut: false,
    slug: "dan-guitar-acoustic-x1-co-lap-eq7545-ket-noi-loa",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-x1-co-lap-eq7545-ket-noi-loa",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/9b073451-033d-4e1a-9671-48803315bce4.webp" },
  { name: "Đàn Guitar Acoustic ST.Real ST-X3 Full Solid | Guitar Tập Chơi Giá Rẻ Sài Thành",
    price: "1.300.000 ₫", priceOld: "", soldOut: true,
    slug: "dan-guitar-acoustic-st-real-st-x3-full-solid-guitar-tap-choi-gia-re-sai-thanh",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-st-real-st-x3-full-solid-guitar-tap-choi-gia-re-sai-thanh",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/4a71a61e-729e-47fb-b1f6-9e5de46a85f0.webp" },
  { name: "Đàn Guitar Vọng Cổ ST-VC1 Phím Lõm",
    price: "1.350.000 ₫", priceOld: "", soldOut: false,
    slug: "dan-guitar-vong-co-st-vc1-phim-lom",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-vong-co-st-vc1-phim-lom",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/64449199-b874-40b8-a7fe-b5625ab3d1db.webp" },
  { name: "Đàn Guitar Acoustic X1 Pro Có Lắp EQ 7545 Kết Nối Loa",
    price: "1.500.000 ₫", priceOld: "2.100.000 ₫", soldOut: false,
    slug: "dan-guitar-acoustic-x1-pro-co-lap-eq-7545-ket-noi-loa",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-x1-pro-co-lap-eq-7545-ket-noi-loa",
    img: "" },
  { name: "Đàn Guitar Vọng Cổ Phím Lõm Mã ST-VC02 Gỗ Bắc Phi Nguyên Tấm Chính Hãng ST.Real Guitar Sài Thành",
    price: "1.500.000 ₫", priceOld: "2.000.000 ₫", soldOut: false,
    slug: "dan-guitar-vong-co-phim-lom-ma-st-vc02-go-bac-phi-nguyen-tam-chinh-hang-st-real-guitar-sai-thanh",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-vong-co-phim-lom-ma-st-vc02-go-bac-phi-nguyen-tam-chinh-hang-st-real-guitar-sai-thanh",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/dac16bff-eea8-449d-858d-77559027084f.webp" },
  { name: "Đàn Guitar Acoustic Mã ST-X2 Gỗ Còng Đỏ Full Solid ST.Real Guitar Sài Thành",
    price: "1.550.000 ₫", priceOld: "", soldOut: false,
    slug: "dan-guitar-acoustic-ma-st-x2-go-cong-do-full-solid-st-real-guitar-sai-thanh",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-ma-st-x2-go-cong-do-full-solid-st-real-guitar-sai-thanh",
    img: "" },
  { name: "Đàn Guitar Acoustic Mã ST-X4 Có Vát Bavel Top Thông Nguyên Tấm Back Side Landspace Chính Hãng ST.Real Guitar Sài Thành",
    price: "1.650.000 ₫", priceOld: "2.800.000 ₫", soldOut: false,
    slug: "dan-guitar-acoustic-ma-st-x4-co-vat-bavel-top-thong-nguyen-tam-back-side-landspace-chinh-hang-st-real-guitar-sai-thanh",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-ma-st-x4-co-vat-bavel-top-thong-nguyen-tam-back-side-landspace-chinh-hang-st-real-guitar-sai-thanh",
    img: "" },
  { name: "Đàn Guitar Classic Mã ST-C4 Gỗ Thịt Hoạ Tiết Viền Bông Lúa",
    price: "1.800.000 ₫", priceOld: "", soldOut: false,
    slug: "dan-guitar-classic-ma-st-c4-go-thit-hoa-tiet-vien-bong-lua",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-classic-ma-st-c4-go-thit-hoa-tiet-vien-bong-lua",
    img: "" },
  { name: "Đàn Guitar Acoustic Mã ST-X5 Full KOA Nguyên Tấm",
    price: "1.990.000 ₫", priceOld: "", soldOut: false,
    slug: "dan-guitar-acoustic-ma-st-x5-full-koa-nguyen-tam",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-ma-st-x5-full-koa-nguyen-tam",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/2e66ee35-c1db-47ac-8609-4bb093456756.jpeg" },
  { name: "Đàn Guitar Acoustic ST-X7",
    price: "2.350.000 ₫", priceOld: "", soldOut: false,
    slug: "dan-guitar-acoustic-st-x7",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-st-x7",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/e82a2b8c-e993-48c0-9589-60f647a1d159.webp" },
  { name: "Đàn Guitar Classic ST-C2 Gỗ Koa",
    price: "2.400.000 ₫", priceOld: "3.000.000 ₫", soldOut: false,
    slug: "dan-guitar-classic-st-c2-go-koa",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-classic-st-c2-go-koa",
    img: "" },
  { name: "Đàn Guitar Vọng Cổ ST-VC3 Chất Liệu Gỗ Điệp Phím Lõm",
    price: "2.550.000 ₫", priceOld: "", soldOut: false,
    slug: "dan-guitar-vong-co-st-vc3-chat-lieu-go-diep-phim-lom",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-vong-co-st-vc3-chat-lieu-go-diep-phim-lom",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/fe563d38-a469-40f2-bf27-84499ca5ec1e.webp" },
  { name: "Đàn Guitar Acoustic ST-X6 Full Sồi Pháp",
    price: "2.550.000 ₫", priceOld: "4.000.000 ₫", soldOut: false,
    slug: "dan-guitar-acoustic-st-x6-full-soi-phap",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-st-x6-full-soi-phap",
    img: "" },
  { name: "Đàn Guitar Acoustic X5 Lắp EQ M2 Có Loa Trên Thùng Full Gỗ KOA ST.Real Guitar Sài Thành Bảo Hành 3 Năm Chống Bám Bụi Act",
    price: "2.700.000 ₫", priceOld: "3.000.000 ₫", soldOut: false,
    slug: "dan-guitar-acoustic-x5-lap-eq-m2-co-loa-tren-thung-full-go-koa-st-real-guitar-sai-thanh-bao-hanh-3-nam-chong-bam-bui-act",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-x5-lap-eq-m2-co-loa-tren-thung-full-go-koa-st-real-guitar-sai-thanh-bao-hanh-3-nam-chong-bam-bui-act",
    img: "" },
  { name: "Đàn Guitar Acoustic Mã AL-01 Gỗ Điệp Bọc Tút Full Solid Chính Hãng ST.Real Guitar Sài Thành",
    price: "2.900.000 ₫", priceOld: "3.100.000 ₫", soldOut: false,
    slug: "dan-guitar-acoustic-ma-al-01-go-diep-boc-tut-full-solid-chinh-hang-st-real-guitar-sai-thanh",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-ma-al-01-go-diep-boc-tut-full-solid-chinh-hang-st-real-guitar-sai-thanh",
    img: "https://mekship-develop.s3.ap-southeast-1.amazonaws.com/guitarst/e5063a93-2ef8-4a44-86a7-74fdca028861.webp" },
  { name: "Đàn Guitar Acoustic Mã ST-X8 Full KOA Nguyên Tấm",
    price: "3.200.000 ₫", priceOld: "", soldOut: false,
    slug: "dan-guitar-acoustic-ma-st-x8-full-koa-nguyen-tam",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-ma-st-x8-full-koa-nguyen-tam",
    img: "" },
  { name: "Đàn Guitar Acoustic Gỗ Cẩm Ấn Chính Hãng ST.Real Guitar Sài Thành Mã ST-CA5",
    price: "5.500.000 ₫", priceOld: "6.000.000 ₫", soldOut: false,
    slug: "dan-guitar-acoustic-go-cam-an-chinh-hang-st-real-guitar-sai-thanh-ma-st-ca5",
    url: "https://saithanhguitar.com/san-pham/dan-guitar-acoustic-go-cam-an-chinh-hang-st-real-guitar-sai-thanh-ma-st-ca5",
    img: "" },
];
