import { useSyncStore } from '@/store/syncSlice'

declare global {
  interface Window {
    google: any
  }
}

let tokenClient: any = null

export const initGoogleAuth = (clientId: string, retries = 0) => {
  if (!window.google || !window.google.accounts) {
    if (retries < 10) {
      setTimeout(() => initGoogleAuth(clientId, retries + 1), 500)
    } else {
      console.error('Google Identity Services script failed to load')
    }
    return
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/drive.appdata',
    callback: (response: any) => {
      if (response.error) {
        console.error('Google Auth Error:', response.error)
        return
      }
      useSyncStore.getState().setAccessToken(response.access_token)
    },
  })
  
  useSyncStore.getState().setClientReady(true)
}

export const requestAccessToken = () => {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'consent' })
  } else {
    console.error('Token client not initialized')
  }
}

export const revokeToken = (token: string) => {
  if (window.google) {
    window.google.accounts.oauth2.revoke(token, () => {
      useSyncStore.getState().signOut()
    })
  }
}
