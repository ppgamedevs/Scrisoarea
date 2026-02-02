"use client"

import React, { useRef, useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"

export interface SignaturePadRef {
    clear: () => void
    isEmpty: () => boolean
    toDataURL: () => string | null
}

interface SignaturePadProps {
    onChange?: () => void
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(({ onChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [isEmpty, setIsEmpty] = useState(true)

    // Context ref
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        // Handle High DPI
        const ratio = Math.max(window.devicePixelRatio || 1, 1)
        canvas.width = canvas.offsetWidth * ratio
        canvas.height = canvas.offsetHeight * ratio

        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.scale(ratio, ratio)
            ctx.lineCap = 'round'
            ctx.lineJoin = 'round'
            ctx.lineWidth = 2
            ctx.strokeStyle = 'black'
            ctxRef.current = ctx
        }
    }, [])

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const ctx = ctxRef.current
        if (!ctx) return

        // Prevent scrolling on touch
        if (e.type === 'touchstart') document.body.style.overflow = 'hidden'

        const { offsetX, offsetY } = getCoordinates(e)
        ctx.beginPath()
        ctx.moveTo(offsetX, offsetY)
        setIsDrawing(true)
        setIsEmpty(false)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !ctxRef.current) return
        const { offsetX, offsetY } = getCoordinates(e)
        ctxRef.current.lineTo(offsetX, offsetY)
        ctxRef.current.stroke()
    }

    const stopDrawing = () => {
        if (ctxRef.current) ctxRef.current.closePath()
        setIsDrawing(false)
        document.body.style.overflow = '' // Restore scroll
        if (onChange) onChange()
    }

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { offsetX: 0, offsetY: 0 }

        if ('touches' in e) {
            const rect = canvas.getBoundingClientRect()
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            }
        } else {
            return {
                offsetX: (e as React.MouseEvent).nativeEvent.offsetX,
                offsetY: (e as React.MouseEvent).nativeEvent.offsetY
            }
        }
    }

    useImperativeHandle(ref, () => ({
        clear: () => {
            const canvas = canvasRef.current
            const ctx = ctxRef.current
            if (canvas && ctx) {
                ctx.clearRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1))
                // Actually clearRect uses backing store pixels, so use full width/height or reset transform
                // Safest:
                canvas.width = canvas.width // Resets context
                // Re-init context
                const ratio = Math.max(window.devicePixelRatio || 1, 1)
                ctx.scale(ratio, ratio)
                ctx.lineCap = 'round'
                ctx.lineJoin = 'round'
                ctx.lineWidth = 2
                ctx.strokeStyle = 'black'
            }
            setIsEmpty(true)
            if (onChange) onChange()
        },
        isEmpty: () => isEmpty,
        toDataURL: () => canvasRef.current?.toDataURL('image/png') || null
    }))

    return (
        <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-white touch-none relative h-48 w-full">
            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair block"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
            <div className="absolute top-2 right-2 text-xs text-slate-400 pointer-events-none select-none">
                Semnează în căsuță
            </div>
            {!isEmpty && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-2 right-2 text-xs h-6 bg-slate-100 hover:bg-red-50 hover:text-red-600 z-10"
                    onClick={() => {
                        const canvas = canvasRef.current
                        const ctx = ctxRef.current
                        if (canvas && ctx) {
                            canvas.width = canvas.width // Reset
                            // Re-apply scale
                            const ratio = Math.max(window.devicePixelRatio || 1, 1)
                            ctx.scale(ratio, ratio)
                            ctx.lineCap = 'round'
                            ctx.lineJoin = 'round'
                            ctx.lineWidth = 2
                            ctx.strokeStyle = 'black'
                        }
                        setIsEmpty(true)
                        if (onChange) onChange()
                    }}
                >
                    Șterge
                </Button>
            )}
        </div>
    )
})

SignaturePad.displayName = "SignaturePad"
