export function getCookie(name) {
  const cookieValue = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))

  return cookieValue ? decodeURIComponent(cookieValue.split('=')[1]) : ''
}

export async function getCsrfToken() {
  let csrfToken = getCookie('csrftoken')

  if (!csrfToken) {
    await fetch('/api/', {
      credentials: 'include',
    })
    csrfToken = getCookie('csrftoken')
  }

  return csrfToken
}