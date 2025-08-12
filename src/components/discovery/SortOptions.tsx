'use client'

import { useState } from 'react'
import { ChevronDown, MapPin, Star, Clock, Users } from 'lucide-react'

export type SortOption = 'distance' | 'rating' | 'recently_active' | 'compatibility'

interface SortOptionsProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
  isOpen: boolean
  onToggle: () => void
}

const sortOptions = [
  {
    value: 'distance' as SortOption,
    label: 'Distance',
    description: 'Closest to you first',
    icon: MapPin
  },
  {
    value: 'rating' as SortOption,
    label: 'Rating',
    description: 'Highest rated first',
    icon: Star
  },
  {
    value: 'recently_active' as SortOption,
    label: 'Recently Active',
    description: 'Active in last 7 days',
    icon: Clock
  },
  {
    value: 'compatibility' as SortOption,
    label: 'Compatibility',
    description: 'Best match for you',
    icon: Users
  }
]

export default function SortOptions({
  currentSort,
  onSortChange,
  isOpen,
  onToggle
}: SortOptionsProps) {
  const currentOption = sortOptions.find(option => option.value === currentSort)

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        {currentOption && <currentOption.icon className="h-4 w-4 text-gray-600" />}
        <span className="text-sm font-medium text-gray-700">
          Sort by: {currentOption?.label}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="py-2">
            {sortOptions.map((option) => {
              const Icon = option.icon
              const isSelected = currentSort === option.value
              
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value)
                    onToggle()
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-green-50 text-green-700' : 'text-gray-700'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? 'text-green-600' : 'text-gray-500'}`} />
                  <div className="flex-1">
                    <div className={`font-medium ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
} 