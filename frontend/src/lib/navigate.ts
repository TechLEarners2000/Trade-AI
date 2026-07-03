type NavigateFn = (path: string) => void

let navigateFn: NavigateFn | null = null

export function setNavigate(fn: NavigateFn) {
  navigateFn = fn
}

export function navigate(path: string) {
  if (navigateFn) {
    navigateFn(path)
  } else {
    window.location.href = path
  }
}

let logoutFn: (() => void) | null = null

export function setLogoutHandler(fn: () => void) {
  logoutFn = fn
}

export function triggerLogout() {
  logoutFn?.()
}
