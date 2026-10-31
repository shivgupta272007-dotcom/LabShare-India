'use client'

import React, { useState } from 'react'
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Expand,
  Image as ImageIcon,
  Layers,
  Sparkles,
  X,
} from 'lucide-react'
import { Lab, LabPhoto } from '@labshare/shared'

interface PhotoGalleryProps {
  lab: Lab
  className?: string
  locale?: 'en' | 'hi'
}

export function PhotoGallery({ lab, className = '', locale = 'en' }: PhotoGalleryProps) {
  // Curated fallback photos based on lab type if lab has none
  const defaultPhotos = getDefaultLabPhotos(lab.type, lab.name)
  const photos = lab.photos && lab.photos.length > 0 ? lab.photos : defaultPhotos

  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const activePhoto = photos[activeIndex] || photos[0]

  const nextPhoto = () => {
    setActiveIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Main Feature Photo Viewport */}
      <div className="relative w-full h-[320px] sm:h-[420px] rounded-2xl overflow-hidden bg-slate-900 shadow-md group">
        <img
          src={activePhoto.url}
          alt={activePhoto.caption || lab.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-xs flex items-center space-x-1.5 border border-white/20">
            <Camera className="w-3.5 h-3.5 text-primary-400" />
            <span>
              {activeIndex + 1} / {photos.length}
            </span>
          </span>
          <span className="px-3 py-1 rounded-full bg-primary/90 text-white font-bold text-xs backdrop-blur-md shadow-sm">
            {lab.type.replace('_', ' ')}
          </span>
        </div>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          title="Open Fullscreen"
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all border border-white/20 z-10"
        >
          <Expand className="w-4 h-4" />
        </button>

        {/* Prev / Next Arrows (Always visible on touch mobile, hover on desktop) */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-2 rounded-full bg-black/55 hover:bg-black/80 text-white backdrop-blur-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10 shadow-md"
              aria-label="Previous Photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-2 rounded-full bg-black/55 hover:bg-black/80 text-white backdrop-blur-md transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 z-10 shadow-md"
              aria-label="Next Photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Bottom Caption & School Label */}
        <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
          <p className="text-sm sm:text-base font-bold leading-snug drop-shadow-md">
            {activePhoto.caption || lab.name}
          </p>
          <p className="text-xs text-slate-300 drop-shadow-sm flex items-center space-x-2 mt-0.5">
            <span>{lab.organization?.name}</span>
            <span>•</span>
            <span>Floor {lab.floor}, {lab.buildingName || 'Main Campus'}</span>
          </p>
        </div>
      </div>

      {/* Thumbnails Row */}
      {photos.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {photos.map((p, idx) => {
            const isCurrent = idx === activeIndex
            return (
              <button
                key={p.id || idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`relative w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden shrink-0 transition-all border-2 ${
                  isCurrent
                    ? 'border-primary ring-2 ring-primary/40 scale-102'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-102'
                }`}
              >
                <img
                  src={p.url}
                  alt={p.caption || `Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            )
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-lg flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="flex justify-between items-center text-white z-10">
            <span className="font-bold text-sm">
              {lab.name} — {activePhoto.caption} ({activeIndex + 1}/{photos.length})
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center my-4">
            <img
              src={activePhoto.url}
              alt={activePhoto.caption || lab.name}
              className="max-w-full max-h-[82vh] object-contain rounded-xl shadow-2xl"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/30 text-white"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
          </div>

          <div className="text-center text-xs text-slate-400">
            Press ESC or click ✕ to close
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Curated high-resolution imagery for each lab category
 */
export function getDefaultLabPhotos(type: string, labName: string = ''): LabPhoto[] {
  const isRobotics =
    type === 'WORKSHOP' ||
    labName.toLowerCase().includes('robotics') ||
    labName.toLowerCase().includes('robot') ||
    labName.toLowerCase().includes('engineering') ||
    labName.toLowerCase().includes('stem')

  if (isRobotics) {
    return [
      {
        id: 'p-ws-0',
        labId: 'auto',
        url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        caption: 'High-Tech Robotics Automation & STEM Innovation Lab',
        isPrimary: true,
        order: 1,
      },
      {
        id: 'p-ws-1',
        labId: 'auto',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
        caption: 'Robotics Engineering Workbench & Rapid Prototyping Station',
        isPrimary: false,
        order: 2,
      },
      {
        id: 'p-ws-2',
        labId: 'auto',
        url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1200&q=80',
        caption: 'Arduino Microcontroller Breadboards, Sensors & Circuitry',
        isPrimary: false,
        order: 2,
      },
      {
        id: 'p-ws-3',
        labId: 'auto',
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80',
        caption: 'Electronic Soldering Station & Digital Oscilloscope Testing',
        isPrimary: false,
        order: 3,
      },
      {
        id: 'p-ws-4',
        labId: 'auto',
        url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
        caption: 'Student STEM Rover Chassis & Autonomous Motors',
        isPrimary: false,
        order: 4,
      },
    ]
  }

  switch (type) {
    case 'COMPUTER_LAB':
      return [
        {
          id: 'p-cs-1',
          labId: 'auto',
          url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
          caption: 'High-Performance Workstation Floor (40 Terminals)',
          isPrimary: true,
          order: 1,
        },
        {
          id: 'p-cs-2',
          labId: 'auto',
          url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
          caption: 'Collaborative Coding & Project Bench',
          isPrimary: false,
          order: 2,
        },
        {
          id: 'p-cs-3',
          labId: 'auto',
          url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
          caption: 'Dedicated Python & Linux Server Rack',
          isPrimary: false,
          order: 3,
        },
      ]
    case 'PROJECTOR_ROOM':
      return [
        {
          id: 'p-av-1',
          labId: 'auto',
          url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
          caption: 'Tiered 4K Laser Projection Hall & Surround Acoustics',
          isPrimary: true,
          order: 1,
        },
        {
          id: 'p-av-2',
          labId: 'auto',
          url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
          caption: 'Interactive Smart Board & Video Demonstration Station',
          isPrimary: false,
          order: 2,
        },
      ]
    case 'LIBRARY':
      return [
        {
          id: 'p-lib-1',
          labId: 'auto',
          url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80',
          caption: 'Senior Reference Library & Scientific Journal Section',
          isPrimary: true,
          order: 1,
        },
      ]
    case 'SCIENCE_LAB':
    default:
      return [
        {
          id: 'p-sci-1',
          labId: 'auto',
          url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
          caption: 'Chemical Titration, Beakers & Reagent Testing Station',
          isPrimary: true,
          order: 1,
        },
        {
          id: 'p-sci-2',
          labId: 'auto',
          url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80',
          caption: 'High-Power Compound Optical Microscopes',
          isPrimary: false,
          order: 2,
        },
        {
          id: 'p-sci-3',
          labId: 'auto',
          url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80',
          caption: 'Student Experimentation & Observation Workbenches',
          isPrimary: false,
          order: 3,
        },
        {
          id: 'p-sci-4',
          labId: 'auto',
          url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
          caption: 'Physics Mechanics & Electronics Bench',
          isPrimary: false,
          order: 4,
        },
      ]
  }
}
