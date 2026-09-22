// Shared control styles for the black/red/white design system.
// Bold, squared-off, high-contrast — matching the nav's solid black/red pills.

export const BTN_PRIMARY =
  "px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-md bg-red-600 text-white " +
  "hover:bg-black transition-colors disabled:opacity-40 disabled:pointer-events-none"

export const BTN_SECONDARY =
  "px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-md border-2 border-black " +
  "text-black hover:bg-black hover:text-white transition-colors disabled:opacity-40 " +
  "disabled:pointer-events-none"

export const BTN_DANGER_OUTLINE =
  "px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-md border-2 border-red-600 " +
  "text-red-600 hover:bg-red-600 hover:text-white transition-colors disabled:opacity-40 " +
  "disabled:pointer-events-none"

export const BTN_TEXT =
  "text-sm font-bold text-red-600 hover:underline disabled:opacity-40 " +
  "disabled:no-underline disabled:pointer-events-none"

export const BTN_TEXT_MUTED =
  "text-sm font-semibold text-slate-500 hover:text-black disabled:opacity-40 " +
  "disabled:pointer-events-none"

export const BTN_ICON =
  "shrink-0 w-8 h-8 flex items-center justify-center rounded-md border-2 border-black " +
  "text-black hover:bg-black hover:text-white transition-colors disabled:opacity-30 " +
  "disabled:pointer-events-none"

export const BTN_ICON_PRIMARY =
  "shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-red-600 text-white " +
  "hover:bg-black transition-colors disabled:opacity-30 disabled:pointer-events-none"

export const SELECT =
  "border-2 border-black rounded-md px-3 py-1.5 text-sm font-medium bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-40"

export const INPUT =
  "border-2 border-black rounded-md px-3 py-2 text-sm focus:outline-none " +
  "focus:ring-2 focus:ring-red-500"

export const INPUT_ERROR =
  "border-2 border-red-600 rounded-md px-3 py-2 text-sm focus:outline-none " +
  "focus:ring-2 focus:ring-red-500"
