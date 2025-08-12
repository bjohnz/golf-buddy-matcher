'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Target, Check, Star, Crown, ArrowRight, Users, MapPin, Filter, Eye, MessageCircle, Zap, Shield, Heart, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SUBSCRIPTION_PLANS, SubscriptionService } from '@/lib/subscriptions'
import { SubscriptionPlan } from '@/types'
import toast from 'react-hot-toast'

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState<string | null>(null)

  const plans = SUBSCRIPTION_PLANS.filter(plan => 
    plan.billingPeriod === billingPeriod || plan.id === 'free'
  )

  const handleSubscribe = async (planId: string) => {
    setLoading(planId)
    
    try {
      // TODO: Get actual user ID from auth context
      const userId = 'current-user-id'
      
      const result = await SubscriptionService.subscribeToPlan(userId, planId)
      
      if (result.success) {
        toast.success('Subscription activated successfully!')
        // TODO: Redirect to dashboard or show success modal
      } else {
        toast.error(result.error || 'Subscription failed')
      }
    } catch (error) {
      console.error('Error subscribing:', error)
      toast.error('Failed to process subscription')
    } finally {
      setLoading(null)
    }
  }

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('likes')) return <Heart className="h-4 w-4" />
    if (feature.includes('radius')) return <MapPin className="h-4 w-4" />
    if (feature.includes('filters')) return <Filter className="h-4 w-4" />
    if (feature.includes('liked you')) return <Eye className="h-4 w-4" />
    if (feature.includes('support')) return <MessageCircle className="h-4 w-4" />
    if (feature.includes('boosts')) return <Zap className="h-4 w-4" />
    if (feature.includes('receipts')) return <Check className="h-4 w-4" />
    return <Check className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                <ArrowRight className="h-6 w-6 rotate-180" />
              </Link>
              <div className="flex items-center space-x-2">
                <Target className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900">Golf Buddy Matcher</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Start free and upgrade when you&apos;re ready to unlock unlimited golf partner matching
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${billingPeriod === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-green-600 transition-colors"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingPeriod === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save 17%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                plan.popular 
                  ? 'border-green-500 scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Crown className="h-4 w-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center mb-4">
                  {plan.tier === 'premium' ? (
                    <Crown className="h-8 w-8 text-green-600" />
                  ) : (
                    <Target className="h-8 w-8 text-gray-600" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 ml-2">
                      /{plan.billingPeriod === 'yearly' ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                {plan.price === 0 && (
                  <p className="text-sm text-gray-600">Perfect for getting started</p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getFeatureIcon(feature)}
                    </div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="text-center">
                {plan.price === 0 ? (
                  <Link href="/auth/register">
                    <Button className="w-full bg-gray-600 hover:bg-gray-700">
                      Get Started Free
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {loading === plan.id ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        Start {plan.name} Trial
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Feature Comparison
          </h2>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Free</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-green-600">Premium</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Daily Likes</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">15</td>
                    <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Search Radius</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">25 miles</td>
                    <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">100 miles</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Advanced Filters</td>
                    <td className="px-6 py-4 text-center">
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">See Who Liked You</td>
                    <td className="px-6 py-4 text-center">
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Priority Support</td>
                    <td className="px-6 py-4 text-center">
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Profile Boosts</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-900">0</td>
                    <td className="px-6 py-4 text-center text-sm text-green-600 font-semibold">3 per month</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-700">Read Receipts</td>
                    <td className="px-6 py-4 text-center">
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes! You can cancel your subscription at any time. You&apos;ll continue to have access to premium features until the end of your billing period.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 text-sm">
                Yes! New users get a 7-day free trial of Premium features. No credit card required to start.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">What happens if I reach my daily limit?</h3>
              <p className="text-gray-600 text-sm">
                Free users get 15 likes per day. When you reach the limit, you can upgrade to Premium for unlimited likes or wait until tomorrow.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">How do profile boosts work?</h3>
              <p className="text-gray-600 text-sm">
                Profile boosts make your profile appear more frequently in other users&apos; discovery feed for 30 minutes, increasing your chances of getting matches.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Find Your Perfect Golf Partner?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of golfers who have found their ideal playing partners with Golf Buddy Matcher
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-green-600">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 