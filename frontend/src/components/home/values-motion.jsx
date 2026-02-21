import React, { useEffect } from "react"
import { animate, motion, useMotionValue, useTransform } from "framer-motion"

export function MotionMergedBubble({ className, style, gradientId, toneStyles, label, matchedScore }) {
  const mergeProgress = useMotionValue(0)

  useEffect(() => {
    mergeProgress.set(0)
    const controls = animate(mergeProgress, [0, 0.58, 0.86, 1], {
      duration: 0.74,
      times: [0, 0.44, 0.76, 1],
      ease: ["easeOut", "easeInOut", "easeOut"],
    })

    return () => controls.stop()
  }, [matchedScore])

  const squashX = useTransform(mergeProgress, (p) => 1 + contactPulse(p) * 0.07)
  const squashY = useTransform(mergeProgress, (p) => 1 - contactPulse(p) * 0.06)
  const path = useTransform(mergeProgress, (progress) => getMergedPath(matchedScore, progress))
  const leftCx = useTransform(mergeProgress, (progress) => getMergeGeometry(matchedScore, progress).cx1)
  const rightCx = useTransform(mergeProgress, (progress) => getMergeGeometry(matchedScore, progress).cx2)
  const separateOpacity = useTransform(mergeProgress, [0, 0.5, 0.68], [1, 1, 0])
  const mergedOpacity = useTransform(mergeProgress, [0.45, 0.72, 1], [0, 1, 1])

  return (
    <motion.div
      className={className}
      style={{
        ...style,
        scaleX: squashX,
        scaleY: squashY,
      }}
      transition={{ type: "spring" }}
    >
      <svg className="value-bubble-merged-svg" viewBox="0 0 226 132" aria-hidden>
        <defs>
          <linearGradient id={`${gradientId}-fill`} x1="8%" y1="52%" x2="92%" y2="48%">
            <stop offset="0%" stopColor={toneStyles.fillLeft} />
            <stop offset="100%" stopColor={toneStyles.fillRight} />
          </linearGradient>
          <linearGradient id={`${gradientId}-stroke`} x1="8%" y1="52%" x2="92%" y2="48%">
            <stop offset="0%" stopColor={toneStyles.strokeLeft} />
            <stop offset="100%" stopColor={toneStyles.strokeRight} />
          </linearGradient>
        </defs>

        <motion.path
          d={path}
          fill={`url(#${gradientId}-fill)`}
          stroke={`url(#${gradientId}-stroke)`}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: mergedOpacity }}
        />
        <motion.circle
          cx={leftCx}
          cy="66"
          r="56"
          fill={toneStyles.fillLeft}
          stroke={toneStyles.strokeLeft}
          strokeWidth="1.8"
          style={{ opacity: separateOpacity }}
        />
        <motion.circle
          cx={rightCx}
          cy="66"
          r="56"
          fill={toneStyles.fillRight}
          stroke={toneStyles.strokeRight}
          strokeWidth="1.8"
          style={{ opacity: separateOpacity }}
        />
      </svg>

      <div className="value-bubble-merged-copy">
        <span>{label}</span>
        <strong>{`${matchedScore}% Match`}</strong>
      </div>
    </motion.div>
  )
}

function getMergedPath(matchPercent, mergeProgress) {
  const geometry = getMergeGeometry(matchPercent, mergeProgress)
  const { cx1, cx2, cy, r, topNeck, bottomNeck, edgePull, neckPull } = geometry
  const midX = (cx1 + cx2) / 2

  return [
    `M ${cx1} ${cy - r}`,
    `A ${r} ${r} 0 1 0 ${cx1} ${cy + r}`,
    `C ${cx1 + edgePull} ${cy + r}, ${midX - neckPull} ${bottomNeck}, ${midX} ${bottomNeck}`,
    `C ${midX + neckPull} ${bottomNeck}, ${cx2 - edgePull} ${cy + r}, ${cx2} ${cy + r}`,
    `A ${r} ${r} 0 1 0 ${cx2} ${cy - r}`,
    `C ${cx2 - edgePull} ${cy - r}, ${midX + neckPull} ${topNeck}, ${midX} ${topNeck}`,
    `C ${midX - neckPull} ${topNeck}, ${cx1 + edgePull} ${cy - r}, ${cx1} ${cy - r}`,
    "Z",
  ].join(" ")
}

function getMergeGeometry(matchPercent, mergeProgress) {
  const pct = clamp(matchPercent, 0, 100)

  const cx1 = 80
  const cy = 66
  const r = 56

  const minDistance = 52
  const maxDistance = 110

  const t = pct / 100
  const smooth = t * t * (3 - 2 * t)
  const finalDistance = maxDistance - (maxDistance - minDistance) * smooth
  const startDistance = Math.min(maxDistance + 20, finalDistance + 34)
  const approach = easeOutCubic(mergeProgress)
  const distance = lerp(startDistance, finalDistance, approach)

  const center = 113
  const leftOffset = distance / 2
  const leftCx = center - leftOffset
  const rightCx = center + leftOffset

  const settle = smoothstep(mergeProgress)
  const topNeck = cy - r
  const bottomNeck = cy + r

  const edgePull = lerp(42, 52, settle)
  const neckPull = lerp(3, 6, settle)

  return {
    cx1: leftCx,
    cx2: rightCx,
    cy,
    r,
    topNeck,
    bottomNeck,
    edgePull,
    neckPull,
  }
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function lerp(start, end, t) {
  return start + (end - start) * t
}

function easeOutCubic(t) {
  const x = clamp(t, 0, 1)
  return 1 - (1 - x) * (1 - x) * (1 - x)
}

function smoothstep(t) {
  const x = clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

function contactPulse(t) {
  const x = clamp(t, 0, 1)
  const center = 0.62
  const width = 0.22
  const normalized = 1 - Math.min(1, Math.abs(x - center) / width)
  return normalized * normalized
}
