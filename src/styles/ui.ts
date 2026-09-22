// Shared control styles for the blue/white monospace "blueprint" design system.
// Sharp corners, thin brand-blue borders/rules, bold uppercase monospace labels.

export const BTN_PRIMARY =
  "px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-sm bg-brand text-white " +
  "hover:bg-brand-dark transition-colors disabled:opacity-40 disabled:pointer-events-none"

export const BTN_INVERSE =
  "px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-sm bg-white text-brand " +
  "hover:bg-blue-50 transition-colors disabled:opacity-40 disabled:pointer-events-none"

export const BTN_SECONDARY =
  "px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-sm border border-brand " +
  "text-brand hover:bg-brand hover:text-white transition-colors disabled:opacity-40 " +
  "disabled:pointer-events-none"

export const BTN_DANGER_OUTLINE =
  "px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-sm border border-red-600 " +
  "text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-40 " +
  "disabled:pointer-events-none"

export const BTN_TEXT =
  "text-sm font-bold text-brand hover:underline disabled:opacity-40 " +
  "disabled:no-underline disabled:pointer-events-none"

export const BTN_TEXT_MUTED =
  "text-sm font-semibold text-slate-500 hover:text-brand disabled:opacity-40 " +
  "disabled:pointer-events-none"

export const BTN_ICON =
  "shrink-0 w-8 h-8 flex items-center justify-center rounded-sm border border-brand " +
  "text-brand hover:bg-brand hover:text-white transition-colors disabled:opacity-30 " +
  "disabled:pointer-events-none"

export const BTN_ICON_PRIMARY =
  "shrink-0 w-8 h-8 flex items-center justify-center rounded-sm bg-brand text-white " +
  "hover:bg-brand-dark transition-colors disabled:opacity-30 disabled:pointer-events-none"

export const SELECT =
  "border border-brand rounded-sm px-3 py-1.5 text-sm font-medium bg-white text-slate-900 " +
  "focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-40"

export const INPUT =
  "border border-brand rounded-sm px-3 py-2 text-sm focus:outline-none " +
  "focus:ring-2 focus:ring-brand"

export const INPUT_ERROR =
  "border border-red-600 rounded-sm px-3 py-2 text-sm focus:outline-none " +
  "focus:ring-2 focus:ring-red-500"

// Card: white surface with a thin brand-blue rule, sharp corners.
export const CARD = "bg-white border border-brand rounded-sm p-4"

// Small bordered eyebrow/label tag, like the reference's "PRIVATE BETA" boxes.
export const TAG =
  "inline-block border border-brand px-2 py-0.5 text-xs font-bold uppercase " +
  "tracking-wide text-brand rounded-sm"

export const TAG_DASHED =
  "inline-block border border-dashed border-brand/60 px-2 py-0.5 text-xs font-bold " +
  "uppercase tracking-wide text-brand rounded-sm"

export const SECTION_HEADING = "text-sm font-black uppercase tracking-wide text-slate-900"
