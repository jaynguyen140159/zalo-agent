export type KmGiftFlowType = "customised" | "ready_stock";

export type SlaStageTemplate = {
  stepOrder: number;
  title: string;
  slaDays: number;
  phase: "pre_deposit" | "deposit" | "post_deposit";
  defaultTaskTitle: string;
  defaultChecklist: string[];
};

export type CalculatedSlaStage = SlaStageTemplate & {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
};

export const KM_GIFT_CUSTOMISED_FLOW: SlaStageTemplate[] = [
  {
    stepOrder: 1,
    title: "Báo giá",
    slaDays: 2,
    phase: "pre_deposit",
    defaultTaskTitle: "Lập & gửi báo giá quà tặng cho khách",
    defaultChecklist: ["Tiếp nhận yêu cầu & số lượng", "Tính cost & gửi bảng báo giá", "Khách phản hồi xác nhận giá"],
  },
  {
    stepOrder: 2,
    title: "Ký hợp đồng",
    slaDays: 2,
    phase: "pre_deposit",
    defaultTaskTitle: "Soạn & ký hợp đồng nguyên tắc / đơn hàng",
    defaultChecklist: ["Soạn dự thảo hợp đồng", "Hai bên duyệt điều khoản", "Ký kết hợp đồng chính thức"],
  },
  {
    stepOrder: 3,
    title: "Tạm ứng 50% HĐ",
    slaDays: 3,
    phase: "deposit",
    defaultTaskTitle: "Xác nhận thanh toán tạm ứng 50% HĐ",
    defaultChecklist: ["Gửi đề nghị tạm ứng 50%", "Kế toán xác nhận tiền về tài khoản"],
  },
  {
    stepOrder: 4,
    title: "Thiết kế",
    slaDays: 7,
    phase: "post_deposit",
    defaultTaskTitle: "Thiết kế mẫu & mockup in ấn logo",
    defaultChecklist: ["Lên moodboard & concept chủ đạo", "Thiết kế bản vẽ 2D & quy cách", "Dựng phối cảnh 3D mockup sản phẩm"],
  },
  {
    stepOrder: 5,
    title: "Chốt thiết kế",
    slaDays: 2,
    phase: "post_deposit",
    defaultTaskTitle: "Gửi khách duyệt & ký chốt file thiết kế cuối",
    defaultChecklist: ["Gửi khách duyệt mẫu thiết kế", "Chốt file in ấn/sản xuất cuối cùng"],
  },
  {
    stepOrder: 6,
    title: "Sản xuất",
    slaDays: 14,
    phase: "post_deposit",
    defaultTaskTitle: "Triển khai sản xuất & gia công hàng loạt",
    defaultChecklist: ["Chuẩn bị vật tư & khuôn mẫu", "Gia công sản xuất hàng loạt", "Hoàn thiện bề mặt & phụ kiện"],
  },
  {
    stepOrder: 7,
    title: "Kiểm hàng",
    slaDays: 2,
    phase: "post_deposit",
    defaultTaskTitle: "QC kiểm tra chất lượng & số lượng thành phẩm",
    defaultChecklist: ["Kiểm đếm đủ số lượng đơn hàng", "QC kiểm tra chất lượng & ngoại quan"],
  },
  {
    stepOrder: 8,
    title: "Đóng gói",
    slaDays: 2,
    phase: "post_deposit",
    defaultTaskTitle: "Đóng gói hộp quà, tem nhãn & chuẩn bị giao",
    defaultChecklist: ["In ấn hộp quà & tem nhãn", "Đóng gói thành phẩm vào hộp"],
  },
  {
    stepOrder: 9,
    title: "Bàn giao + BBNT + ĐNTT",
    slaDays: 2,
    phase: "post_deposit",
    defaultTaskTitle: "Giao hàng, ký BBNT & gửi ĐNTT phần còn lại",
    defaultChecklist: ["Vận chuyển bàn giao cho khách", "Ký Biên bản nghiệm thu (BBNT)", "Gửi Đề nghị thanh toán (ĐNTT) phần còn lại"],
  },
];

export const KM_GIFT_READY_STOCK_FLOW: SlaStageTemplate[] = [
  {
    stepOrder: 1,
    title: "Báo giá",
    slaDays: 1,
    phase: "pre_deposit",
    defaultTaskTitle: "Báo giá sản phẩm có sẵn & kiểm tồn kho",
    defaultChecklist: ["Kiểm tồn kho & xác nhận mẫu", "Gửi báo giá khách hàng"],
  },
  {
    stepOrder: 2,
    title: "Ký hợp đồng",
    slaDays: 1,
    phase: "pre_deposit",
    defaultTaskTitle: "Ký hợp đồng / xác nhận đơn hàng",
    defaultChecklist: ["Soạn hợp đồng / đơn đặt hàng", "Hai bên ký xác nhận"],
  },
  {
    stepOrder: 3,
    title: "Tạm ứng 50% HĐ",
    slaDays: 3,
    phase: "deposit",
    defaultTaskTitle: "Xác nhận thanh toán tạm ứng 50% HĐ",
    defaultChecklist: ["Gửi đề nghị tạm ứng 50%", "Xác nhận tiền về tài khoản"],
  },
  {
    stepOrder: 4,
    title: "Đóng gói",
    slaDays: 2,
    phase: "post_deposit",
    defaultTaskTitle: "Soạn hàng từ kho & đóng gói theo yêu cầu",
    defaultChecklist: ["Xuất kho đủ số lượng", "Đóng gói hộp & tem nhãn"],
  },
  {
    stepOrder: 5,
    title: "Bàn giao + ĐNTT",
    slaDays: 2,
    phase: "post_deposit",
    defaultTaskTitle: "Bàn giao hàng hóa & gửi ĐNTT thanh toán",
    defaultChecklist: ["Giao hàng tận nơi", "Gửi Đề nghị thanh toán phần còn lại"],
  },
];

export function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

/**
 * Tính lịch SLA dây chuyền cho dự án Khởi Minh Gift từ ngày Tạm ứng 50% HĐ.
 * - Các bước sau tạm ứng (Thiết kế -> Chốt thiết kế -> Sản xuất -> ...) cộng dồn tiến về phía trước.
 * - Các bước trước tạm ứng (Báo giá -> Ký HĐ -> Tạm ứng) tính lùi từ ngày tạm ứng.
 */
export function calculateKmGiftSchedule(params: {
  flowType: KmGiftFlowType;
  depositDate: string; // YYYY-MM-DD
  slaOverrides?: Record<string, number>;
}): CalculatedSlaStage[] {
  const template = params.flowType === "ready_stock" ? KM_GIFT_READY_STOCK_FLOW : KM_GIFT_CUSTOMISED_FLOW;
  const anchor = params.depositDate || new Date().toISOString().slice(0, 10);

  const stagesWithSla = template.map((st) => ({
    ...st,
    slaDays:
      params.slaOverrides && typeof params.slaOverrides[st.title] === "number"
        ? Math.max(0, params.slaOverrides[st.title]!)
        : st.slaDays,
  }));

  const results: CalculatedSlaStage[] = [];

  // 1. Pre-deposit & deposit stages end at anchor date
  const preAndDeposit = stagesWithSla.filter((s) => s.phase !== "post_deposit");
  let cursorBack = anchor;
  const preReversed: CalculatedSlaStage[] = [];
  for (let i = preAndDeposit.length - 1; i >= 0; i--) {
    const st = preAndDeposit[i]!;
    const endDate = cursorBack;
    const startDate = addDaysIso(endDate, -st.slaDays);
    preReversed.push({ ...st, startDate, endDate });
    cursorBack = startDate;
  }
  results.push(...preReversed.reverse());

  // 2. Post-deposit stages cascade forward from anchor date
  let cursorForward = anchor;
  for (const st of stagesWithSla.filter((s) => s.phase === "post_deposit")) {
    const startDate = cursorForward;
    const endDate = addDaysIso(startDate, st.slaDays);
    results.push({ ...st, startDate, endDate });
    cursorForward = endDate;
  }

  return results;
}
