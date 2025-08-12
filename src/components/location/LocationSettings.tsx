'use client'

import { useState, useEffect } from 'react'
import { MapPin, Navigation, Globe, Settings, Save, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface LocationSettingsProps {
  currentLocation: {
    latitude: number
    longitude: number
    address: string
  }
  searchRadius: number
  onLocationUpdate: (location: { latitude: number; longitude: number; address: string }) => void
  onRadiusUpdate: (radius: number) => void
  onClose?: () => void
}

export default function LocationSettings({
  currentLocation,
  searchRadius,
  onLocationUpdate,
  onRadiusUpdate,
  onClose
}: LocationSettingsProps) {
  const [location, setLocation] = useState(currentLocation)
  const [radius, setRadius] = useState(searchRadius)
  const [loading, setLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [manualAddress, setManualAddress] = useState(currentLocation.address)

  const radiusOptions = [
    { value: 10, label: '10 miles', description: 'Very local matches' },
    { value: 25, label: '25 miles', description: 'Recommended range' },
    { value: 50, label: '50 miles', description: 'Extended area' },
    { value: 100, label: '100 miles', description: 'Wide search area' }
  ]

  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    setDetectingLocation(true)
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords
      
      // Reverse geocode to get address
      const address = await reverseGeocode(latitude, longitude)
      
      const newLocation = {
        latitude,
        longitude,
        address
      }
      
      setLocation(newLocation)
      setManualAddress(address)
      toast.success('Location detected successfully!')
    } catch (error) {
      console.error('Error detecting location:', error)
      toast.error('Failed to detect location. Please enter manually.')
    } finally {
      setDetectingLocation(false)
    }
  }

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Use server-side geocoding service for security
      // In production, this should call a backend API that uses the API key securely
      console.warn('Geocoding service not configured - using mock data in development')
      
      // Mock response for development
      return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    } catch (error) {
      console.error('Error reverse geocoding:', error)
      return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
    }
  }

  const handleManualAddressSearch = async () => {
    if (!manualAddress.trim()) {
      toast.error('Please enter an address')
      return
    }

    setLoading(true)
    
    try {
      // TODO: Replace with actual geocoding service
      const coordinates = await geocodeAddress(manualAddress)
      
      if (coordinates) {
        const newLocation = {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          address: manualAddress
        }
        
        setLocation(newLocation)
        toast.success('Location updated!')
      } else {
        toast.error('Could not find that address')
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
      toast.error('Failed to find address')
    } finally {
      setLoading(false)
    }
  }

  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      // Use server-side geocoding service for security
      // In production, this should call a backend API that uses the API key securely
      console.warn('Geocoding service not configured - using mock data in development')
      
      // Mock coordinates based on common city names
      const mockLocations: Record<string, { lat: number; lng: number }> = {
        'san francisco': { lat: 37.7749, lng: -122.4194 },
        'new york': { lat: 40.7128, lng: -74.0060 },
        'los angeles': { lat: 34.0522, lng: -118.2437 },
        'chicago': { lat: 41.8781, lng: -87.6298 },
        'default': { lat: 37.7749, lng: -122.4194 }
      }
      
      const city = address.toLowerCase()
      for (const [key, coords] of Object.entries(mockLocations)) {
        if (city.includes(key)) {
          return coords
        }
      }
      
      // Fallback to default coordinates
      return mockLocations.default
    } catch (error) {
      console.error('Error geocoding:', error)
      return null
    }
  }

  const handleSave = () => {
    onLocationUpdate(location)
    onRadiusUpdate(radius)
    toast.success('Location settings saved!')
    onClose?.()
  }

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <MapPin className="h-6 w-6 text-green-600" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Location Settings</h2>
          <p className="text-sm text-gray-600">Update your location and search radius</p>
        </div>
      </div>

      {/* Current Location */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Navigation className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-blue-900">Current Location</h3>
          </div>
          <Button
            onClick={detectCurrentLocation}
            disabled={detectingLocation}
            size="sm"
            variant="outline"
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            {detectingLocation ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Detect
              </>
            )}
          </Button>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-blue-800 font-medium">{location.address}</p>
          <p className="text-xs text-blue-600">
            Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
        </div>
      </div>

      {/* Manual Address Input */}
      <div className="space-y-3">
        <h3 className="text-md font-semibold text-gray-900 flex items-center">
          <Globe className="h-4 w-4 mr-2" />
          Manual Address
        </h3>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="Enter your address or city"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleManualAddressSearch()}
          />
          <Button
            onClick={handleManualAddressSearch}
            disabled={loading || !manualAddress.trim()}
            size="sm"
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </div>
        
        <p className="text-xs text-gray-600">
          Enter your city, address, or zip code to update your location
        </p>
      </div>

      {/* Search Radius */}
      <div className="space-y-4">
        <h3 className="text-md font-semibold text-gray-900 flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Search Radius
        </h3>
        
        <div className="space-y-3">
          {radiusOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                radius === option.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="radius"
                value={option.value}
                checked={radius === option.value}
                onChange={() => handleRadiusChange(option.value)}
                className="sr-only"
              />
              <div className={`w-4 h-4 border-2 rounded-full mr-3 flex items-center justify-center ${
                radius === option.value
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300'
              }`}>
                {radius === option.value && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">
            <strong>Current setting:</strong> {radius} mile radius from {location.address}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            This affects how far we search for potential golf partners
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-900 mb-2">💡 Location Tips</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Use your home course or preferred golf area for best matches</li>
          <li>• 25 miles is usually the sweet spot for finding golf partners</li>
          <li>• You can temporarily expand your radius if you need more options</li>
          <li>• Update your location when you travel to find local golfers</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  )
} 