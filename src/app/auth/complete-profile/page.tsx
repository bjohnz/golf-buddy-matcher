'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Target, Upload, MapPin, Calendar, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { PlayingTime, UserProfile } from '@/types'

export default function CompleteProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    handicap: '',
    location: '',
    latitude: 0,
    longitude: 0,
    preferredCourses: [] as string[],
    preferredTimes: [] as PlayingTime[]
  })
  
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [newCourse, setNewCourse] = useState('')

  const playingTimeOptions: { value: PlayingTime; label: string }[] = [
    { value: 'early_morning', label: 'Early Morning (6-8 AM)' },
    { value: 'morning', label: 'Morning (8-12 PM)' },
    { value: 'afternoon', label: 'Afternoon (12-5 PM)' },
    { value: 'evening', label: 'Evening (5-8 PM)' },
    { value: 'weekends_only', label: 'Weekends Only' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return
      }
      
      setProfileImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddCourse = () => {
    if (newCourse.trim() && !formData.preferredCourses.includes(newCourse.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredCourses: [...prev.preferredCourses, newCourse.trim()]
      }))
      setNewCourse('')
    }
  }

  const handleRemoveCourse = (course: string) => {
    setFormData(prev => ({
      ...prev,
      preferredCourses: prev.preferredCourses.filter(c => c !== course)
    }))
  }

  const handleTimeToggle = (time: PlayingTime) => {
    setFormData(prev => ({
      ...prev,
      preferredTimes: prev.preferredTimes.includes(time)
        ? prev.preferredTimes.filter(t => t !== time)
        : [...prev.preferredTimes, time]
    }))
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }))
          // TODO: Reverse geocode to get location name
          toast.success('Location detected!')
        },
        (error) => {
          toast.error('Could not detect location. Please enter manually.')
        }
      )
    } else {
      toast.error('Geolocation not supported. Please enter location manually.')
    }
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.fullName.trim() !== '' && formData.handicap !== ''
      case 2:
        return formData.location.trim() !== '' && formData.preferredTimes.length > 0
      case 3:
        return true // Bio and courses are optional
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3))
    } else {
      toast.error('Please fill in all required fields')
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Implement actual profile creation with Supabase
      console.log('Profile creation:', { ...formData, profileImage })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Profile created successfully!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Failed to create profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Target className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-600">
            Help us find your perfect golf partner by sharing your preferences
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of 3
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / 3) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              
              <div className="space-y-4">
                {/* Profile Photo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Profile preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Upload className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 bg-green-600 text-white p-1 rounded-full hover:bg-green-700"
                      >
                        <Upload className="h-3 w-3" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Add a photo to help others recognize you
                      </p>
                      <p className="text-xs text-gray-500">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Full Name */}
                <Input
                  label="Full Name *"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />

                {/* Handicap */}
                <Input
                  label="Golf Handicap *"
                  name="handicap"
                  type="number"
                  value={formData.handicap}
                  onChange={handleInputChange}
                  placeholder="e.g., 12 (or -2 for scratch golfers)"
                  helperText="Enter your current handicap. Use negative numbers for scratch golfers."
                  required
                />
              </div>
            </div>
          )}

          {/* Step 2: Location & Schedule */}
          {currentStep === 2 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Location & Schedule
              </h2>
              
              <div className="space-y-4">
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, State"
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getLocation}
                      className="whitespace-nowrap"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Detect
                    </Button>
                  </div>
                </div>

                {/* Preferred Playing Times */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Playing Times *
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Select all that apply
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {playingTimeOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.preferredTimes.includes(option.value)
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.preferredTimes.includes(option.value)}
                          onChange={() => handleTimeToggle(option.value)}
                          className="sr-only"
                        />
                        <Calendar className={`h-4 w-4 mr-2 ${
                          formData.preferredTimes.includes(option.value)
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`} />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Info */}
          {currentStep === 3 && (
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Additional Information
              </h2>
              
              <div className="space-y-4">
                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell other golfers about yourself, your playing style, or what you're looking for in a golf partner..."
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Help others get to know you better
                  </p>
                </div>

                {/* Preferred Golf Courses */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Golf Courses
                  </label>
                  <div className="flex space-x-2 mb-3">
                    <Input
                      value={newCourse}
                      onChange={(e) => setNewCourse(e.target.value)}
                      placeholder="Add a golf course"
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCourse())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddCourse}
                      disabled={!newCourse.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  
                  {formData.preferredCourses.length > 0 && (
                    <div className="space-y-2">
                      {formData.preferredCourses.map((course, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm">{course}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCourse(course)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Add courses you frequently play or prefer
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                loading={loading}
                disabled={!validateStep(currentStep)}
              >
                Complete Profile
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 