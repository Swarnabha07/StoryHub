// constants.js

// =========================
// BOOK DIMENSIONS
// =========================

export const BOOK_WIDTH = 2.2;
export const BOOK_HEIGHT = 3.1;

export const COVER_WIDTH = BOOK_WIDTH;
export const COVER_HEIGHT = BOOK_HEIGHT;

// Pages are slightly smaller than the covers
export const PAGE_WIDTH = BOOK_WIDTH - 0.08;
export const PAGE_HEIGHT = BOOK_HEIGHT - 0.08;

export const COVER_THICKNESS = 0.12;
export const PAGE_THICKNESS = 0.008;

export const PAGE_COUNT = 40;

// Total thickness occupied by every page
export const PAGE_STACK_THICKNESS = PAGE_COUNT * PAGE_THICKNESS;

// Entire book thickness
export const BOOK_DEPTH = PAGE_STACK_THICKNESS + COVER_THICKNESS * 2;

// Offset so pages start just after front cover
export const PAGE_START_OFFSET = -PAGE_STACK_THICKNESS / 2 + PAGE_THICKNESS / 2;
