// 🎨 SVG 아이콘 시스템 (TONE C: 얇고 세련)
// Stroke 1.5px, round line caps, currentColor

const baseProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
};

// ===== 카테고리 아이콘 =====
export function IconWork({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <rect x="3" y="8" width="18" height="12" rx="1.5" />
      <path d="M9 8V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
      <line x1="3" y1="13" x2="21" y2="13" />
    </svg>
  );
}

export function IconLove({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function IconFamily({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

export function IconSchool({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M4 19V5a1 1 0 0 1 1-1h14v15H5a1 1 0 0 0-1 1z" />
      <path d="M4 19a1 1 0 0 0 1 1h14" />
      <line x1="8" y1="8" x2="15" y2="8" />
    </svg>
  );
}

export function IconMoney({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10M14.5 9.5h-3.5a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3H9.5" />
    </svg>
  );
}

export function IconSecret({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <rect x="4" y="11" width="16" height="10" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function IconGuilt({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M17 10h-1.5A6 6 0 1 0 9 18h8a4 4 0 0 0 0-8z" />
      <line x1="9" y1="20" x2="9" y2="22" />
      <line x1="13" y1="20" x2="13" y2="22" />
      <line x1="17" y1="20" x2="17" y2="22" />
    </svg>
  );
}

export function IconEtc({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <circle cx="5" cy="12" r="1" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

// ===== 감정 버튼 아이콘 =====
export function IconEmpathy({ size = 24, ...props }) {
  // 하트 (공감해요)
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function IconMeToo({ size = 24, ...props }) {
  // 사람 (나도예요)
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  );
}

export function IconCheer({ size = 24, ...props }) {
  // 별 (응원해요)
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <polygon points="12 2 14.7 8.6 21.8 9.2 16.4 13.9 18.1 20.8 12 17 5.9 20.8 7.6 13.9 2.2 9.2 9.3 8.6 12 2" />
    </svg>
  );
}

export function IconHeard({ size = 24, ...props }) {
  // 헤드폰 (들어줬어요)
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1v-7h3zM3 19a2 2 0 0 0 2 2h1v-7H3z" />
    </svg>
  );
}

// ===== UI 아이콘 =====
export function IconPen({ size = 24, ...props }) {
  // FAB 만년필
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M3 21l3.5-1 11-11-2.5-2.5-11 11z" />
      <path d="M14 7l3-3 3 3-3 3z" />
      <path d="M4 20l0.7-2" />
    </svg>
  );
}

export function IconUser({ size = 24, ...props }) {
  // MY 버튼 (사람)
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  );
}

export function IconBack({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function IconClose({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function IconReport({ size = 24, ...props }) {
  // 깃발 (신고)
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <line x1="5" y1="22" x2="5" y2="3" />
      <path d="M5 4h12l-2 4 2 4H5" />
    </svg>
  );
}

export function IconLock({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <rect x="4" y="11" width="16" height="10" rx="1.5" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function IconHeart({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function IconCandle({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M12 2c-1 2-2 3-2 5a2 2 0 0 0 4 0c0-2-1-3-2-5z" />
      <rect x="9" y="10" width="6" height="12" rx="1" />
      <line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

export function IconEnvelope({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3 7 12 13 21 7" />
    </svg>
  );
}

export function IconBell({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ===== 카테고리 키 → 아이콘 매핑 =====
export const CATEGORY_ICONS = {
  work:   IconWork,
  love:   IconLove,
  family: IconFamily,
  school: IconSchool,
  money:  IconMoney,
  secret: IconSecret,
  guilt:  IconGuilt,
  etc:    IconEtc,
};

export const REACTION_ICONS = {
  hug:    IconEmpathy,
  laugh:  IconMeToo,
  me_too: IconMeToo,
  bless:  IconCheer,
};
