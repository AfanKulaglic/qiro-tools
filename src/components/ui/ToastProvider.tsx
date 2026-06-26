import { Toaster } from 'sonner'

/** App-wide toast portal. Styled to match the dark glass theme. */
export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'rgba(11,16,32,0.92)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff',
          backdropFilter: 'blur(12px)',
          borderRadius: '14px',
        },
      }}
    />
  )
}
