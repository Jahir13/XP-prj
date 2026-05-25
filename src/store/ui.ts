import { atom } from 'nanostores';

export const $isClientMode = atom<boolean>(false);
export const $isSidebarCollapsed = atom<boolean>(false);
export const $activeModal = atom<string | null>(null);
export const $commandPaletteOpen = atom<boolean>(false);

export function toggleClientMode() {
  $isClientMode.set(!$isClientMode.get());
}

export function toggleSidebar() {
  $isSidebarCollapsed.set(!$isSidebarCollapsed.get());
}

export function openModal(id: string) {
  $activeModal.set(id);
}

export function closeModal() {
  $activeModal.set(null);
}

export function toggleCommandPalette() {
  $commandPaletteOpen.set(!$commandPaletteOpen.get());
}
