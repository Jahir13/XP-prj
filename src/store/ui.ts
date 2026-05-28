// DATA AUDIT: Contains UI control atoms like $isClientMode.
// Status: REAL project state (non-fictional local reactive layout variables).

import { atom } from 'nanostores';

export const $isClientMode = atom<boolean>(false);

// TODO: unused store — pending removal
// $isSidebarCollapsed is currently not imported or used in any UI components.
export const $isSidebarCollapsed = atom<boolean>(false);

// TODO: unused store — pending removal
// $activeModal is currently not imported or used.
export const $activeModal = atom<string | null>(null);

// TODO: unused store — pending removal
// $commandPaletteOpen is currently not used.
export const $commandPaletteOpen = atom<boolean>(false);

export function toggleClientMode() {
  $isClientMode.set(!$isClientMode.get());
}

// TODO: unused store — pending removal
export function toggleSidebar() {
  $isSidebarCollapsed.set(!$isSidebarCollapsed.get());
}

// TODO: unused store — pending removal
export function openModal(id: string) {
  $activeModal.set(id);
}

// TODO: unused store — pending removal
export function closeModal() {
  $activeModal.set(null);
}

// TODO: unused store — pending removal
export function toggleCommandPalette() {
  $commandPaletteOpen.set(!$commandPaletteOpen.get());
}
