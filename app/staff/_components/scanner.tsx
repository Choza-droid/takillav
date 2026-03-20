'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { CheckCircle, XCircle, ScanLine, RefreshCw, CameraOff } from 'lucide-react'
import { validateTicket, type ValidationResult } from '../actions'

type ScanState = 'scanning' | 'loading' | 'result'

export default function Scanner() {
  const videoRef        = useRef<HTMLVideoElement>(null)
  const scannerRef      = useRef<any>(null)
  const lastHashRef     = useRef('')
  const [state, setState]   = useState<ScanState>('scanning')
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [camError, setCamError] = useState<string | null>(null)

  const handleScan = useCallback(async (hash: string) => {
    if (hash === lastHashRef.current || state !== 'scanning') return
    lastHashRef.current = hash

    setState('loading')
    scannerRef.current?.pause()

    const res = await validateTicket(hash)
    setResult(res)
    setState('result')
  }, [state])

  const reset = useCallback(() => {
    setResult(null)
    lastHashRef.current = ''
    setState('scanning')
    scannerRef.current?.start()
  }, [])

  // Auto-reset after 5 seconds on success
  useEffect(() => {
    if (state !== 'result' || !result?.success) return
    const t = setTimeout(reset, 5000)
    return () => clearTimeout(t)
  }, [state, result, reset])

  useEffect(() => {
    if (!videoRef.current) return

    let mounted = true

    import('qr-scanner').then(({ default: QrScanner }) => {
      if (!mounted || !videoRef.current) return

      // Tell qr-scanner where the worker lives
      QrScanner.WORKER_PATH = '/qr-scanner-worker.min.js'

      const scanner = new QrScanner(
        videoRef.current,
        (result) => handleScan(result.data),
        {
          preferredCamera:    'environment',
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
        }
      )

      scannerRef.current = scanner

      scanner.start().catch(() => {
        if (mounted) setCamError('No se pudo acceder a la cámara. Verifica los permisos del navegador.')
      })
    })

    return () => {
      mounted = false
      scannerRef.current?.destroy()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center bg-zinc-950">

      {/* Camera */}
      <div className="relative w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Scan region indicator */}
        {state === 'scanning' && !camError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-52 h-52">
              <span className="absolute top-0    left-0  w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-lg" />
              <span className="absolute top-0    right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-lg" />
              <span className="absolute bottom-0 left-0  w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-lg" />
              <ScanLine size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/40 animate-pulse" />
            </div>
          </div>
        )}

        {/* Camera error */}
        {camError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/95 p-6 text-center">
            <CameraOff size={36} className="text-zinc-500" />
            <p className="text-sm text-zinc-400">{camError}</p>
          </div>
        )}

        {/* Loading */}
        {state === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Result overlay */}
        {state === 'result' && result && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 transition-colors ${
            result.success ? 'bg-green-600/95' : 'bg-red-600/95'
          }`}>
            {result.success
              ? <CheckCircle size={64} strokeWidth={1.5} className="text-white" />
              : <XCircle    size={64} strokeWidth={1.5} className="text-white" />
            }

            <p className="text-3xl font-bold text-white">
              {result.success ? '¡VÁLIDO!' : 'INVÁLIDO'}
            </p>
            <p className="text-white/80 text-sm">{result.message}</p>

            {result.success && (
              <div className="w-full bg-white/15 rounded-xl p-4 text-sm space-y-1.5 text-white">
                <p><span className="text-white/60">Evento</span><br />{result.ticket.eventTitle}</p>
                <p><span className="text-white/60">Tier</span><br />{result.ticket.tierName}</p>
                <p><span className="text-white/60">Titular</span><br />{result.ticket.ownerName}</p>
              </div>
            )}

            <button
              onClick={reset}
              className="mt-2 flex items-center gap-2 bg-white text-zinc-900 px-6 py-2.5 rounded-xl text-sm font-semibold"
            >
              <RefreshCw size={15} />
              Escanear otro
            </button>
            {result.success && (
              <p className="text-white/40 text-xs">Reanuda automáticamente en 5s</p>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-sm text-zinc-500 text-center px-4">
        {state === 'scanning' && 'Apunta la cámara al QR del boleto'}
        {state === 'loading'  && 'Validando...'}
      </p>
    </div>
  )
}
