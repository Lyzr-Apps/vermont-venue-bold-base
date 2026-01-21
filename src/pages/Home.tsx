import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  MapPin,
  Users,
  DollarSign,
  Heart,
  Phone,
  Mail,
  ExternalLink,
  Star,
  ChevronDown,
  ChevronUp,
  Loader2,
  Map,
  List,
  X,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { callAIAgent, type NormalizedAgentResponse } from '@/utils/aiAgent'
import { cn } from '@/lib/utils'

// Agent ID from workflow
const AGENT_ID = '6970f69cd6d0dcaec11185b7'

// TypeScript interfaces based on actual response schema
interface VenueResult {
  name?: string
  price?: string
  price_numeric?: number
  capacity?: string | number
  rating?: string | number
  location?: string
  description?: string
  amenities?: string[]
  images?: string[]
  contact?: {
    phone?: string
    email?: string
    website?: string
  }
  availability?: string
  reviews?: string[]
  [key: string]: any
}

interface SearchResponse {
  status: 'success' | 'error'
  result: {
    venues: VenueResult[]
    total_count: number
    search_query: string
    notes?: string
  }
  metadata?: {
    agent_name: string
    timestamp: string
  }
}

// Vermont regions
const VT_REGIONS = [
  'Stowe',
  'Burlington',
  'Manchester',
  'Woodstock',
  'Killington',
  'Middlebury',
  'Lake Champlain',
  'Green Mountains',
  'Northeast Kingdom',
]

// Amenity filters
const AMENITIES = [
  { id: 'outdoor', label: 'Outdoor Ceremony' },
  { id: 'barn', label: 'Barn Venue' },
  { id: 'waterfront', label: 'Waterfront' },
  { id: 'mountain', label: 'Mountain Views' },
  { id: 'historic', label: 'Historic Building' },
  { id: 'catering', label: 'In-House Catering' },
]

// VenueCard component
function VenueCard({
  venue,
  index,
  isFavorite,
  onToggleFavorite,
}: {
  venue: VenueResult
  index: number
  isFavorite: boolean
  onToggleFavorite: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const images = venue.images || []
  const hasImages = images.length > 0

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Parse price for display
  const priceValue = venue.price_numeric || 0
  const priceDisplay = venue.price || `$${priceValue.toLocaleString()}`

  return (
    <Card className="relative border-sage-200 hover:shadow-lg transition-shadow">
      {/* Favorite Heart */}
      <button
        onClick={onToggleFavorite}
        className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
      >
        <Heart
          className={cn(
            'h-5 w-5 transition-colors',
            isFavorite ? 'fill-rose-400 text-rose-400' : 'text-gray-400'
          )}
        />
      </button>

      {/* Best Price Badge */}
      {index === 0 && (
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-gradient-to-r from-sage-600 to-sage-500 text-white border-0">
            <Sparkles className="h-3 w-3 mr-1" />
            Best Price
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start pr-10">
          <div className="flex-1">
            <CardTitle className="text-xl text-sage-900 font-serif">
              {venue.name || 'Unnamed Venue'}
            </CardTitle>
            {venue.location && (
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <MapPin className="h-3 w-3" />
                {venue.location}
              </div>
            )}
          </div>
          <Badge className="bg-gradient-to-r from-sage-100 to-emerald-100 text-sage-800 border-sage-200 text-base font-semibold px-3 py-1">
            {priceDisplay}
          </Badge>
        </div>

        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
          {venue.capacity && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {venue.capacity} guests
            </div>
          )}
          {venue.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {venue.rating}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Image Carousel */}
        {hasImages && (
          <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={images[currentImageIndex]}
              alt={`${venue.name} - ${currentImageIndex + 1}`}
              className="w-full h-48 object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-1 hover:bg-white transition-colors"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm rounded-full p-1 hover:bg-white transition-colors"
                >
                  <ChevronUp className="h-4 w-4 rotate-90" />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        )}

        {/* Description */}
        {venue.description && (
          <p className="text-sm text-gray-700 mb-3 line-clamp-2">{venue.description}</p>
        )}

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {venue.amenities.slice(0, expanded ? undefined : 4).map((amenity, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-xs border-sage-300 text-sage-700 bg-sage-50"
              >
                {amenity}
              </Badge>
            ))}
            {!expanded && venue.amenities.length > 4 && (
              <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                +{venue.amenities.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Expandable Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Full Description */}
            {venue.description && (
              <div>
                <h4 className="font-semibold text-sm text-sage-900 mb-1">About</h4>
                <p className="text-sm text-gray-700">{venue.description}</p>
              </div>
            )}

            {/* Reviews */}
            {venue.reviews && venue.reviews.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-sage-900 mb-2">Reviews</h4>
                <div className="space-y-2">
                  {venue.reviews.map((review, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 italic">{review}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {venue.availability && (
              <div>
                <h4 className="font-semibold text-sm text-sage-900 mb-1">Availability</h4>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="h-4 w-4" />
                  {venue.availability}
                </div>
              </div>
            )}

            {/* Contact Information */}
            {venue.contact && (
              <div className="bg-gradient-to-br from-sage-50 to-rose-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-sage-900 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  {venue.contact.phone && (
                    <a
                      href={`tel:${venue.contact.phone}`}
                      className="flex items-center gap-2 text-sm text-sage-700 hover:text-sage-900 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {venue.contact.phone}
                    </a>
                  )}
                  {venue.contact.email && (
                    <a
                      href={`mailto:${venue.contact.email}`}
                      className="flex items-center gap-2 text-sm text-sage-700 hover:text-sage-900 transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                      {venue.contact.email}
                    </a>
                  )}
                  {venue.contact.website && (
                    <a
                      href={venue.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-sage-700 hover:text-sage-900 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visit Website
                    </a>
                  )}
                  <p className="text-xs text-gray-600 mt-2 italic">
                    Click to check availability for your date
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          className="w-full mt-3 text-sage-700 hover:text-sage-900 hover:bg-sage-50"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              View Details
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// SearchSection component
function SearchSection({
  guestCount,
  setGuestCount,
  budgetRange,
  setBudgetRange,
  region,
  setRegion,
  onSearch,
  loading,
}: {
  guestCount: string
  setGuestCount: (value: string) => void
  budgetRange: [number, number]
  setBudgetRange: (value: [number, number]) => void
  region: string
  setRegion: (value: string) => void
  onSearch: () => void
  loading: boolean
}) {
  return (
    <Card className="border-sage-200 shadow-lg bg-gradient-to-br from-white to-sage-50/30">
      <CardHeader>
        <CardTitle className="text-2xl text-sage-900 font-serif flex items-center gap-2">
          <Search className="h-6 w-6 text-sage-600" />
          Find Your Perfect Vermont Venue
        </CardTitle>
        <CardDescription className="text-gray-600">
          Search for wedding venues that match your needs and budget
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Guest Count */}
        <div className="space-y-2">
          <Label htmlFor="guests" className="text-sage-900 font-semibold">
            Number of Guests
          </Label>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <Input
              id="guests"
              type="number"
              min="50"
              max="500"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              placeholder="e.g., 150"
              className="border-sage-200 focus:border-sage-400 focus:ring-sage-400"
            />
          </div>
          <p className="text-xs text-gray-500">50 - 500 guests</p>
        </div>

        {/* Budget Range */}
        <div className="space-y-3">
          <Label className="text-sage-900 font-semibold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            Budget Range
          </Label>
          <div className="px-2">
            <Slider
              min={5000}
              max={50000}
              step={1000}
              value={budgetRange}
              onValueChange={(value) => setBudgetRange(value as [number, number])}
              className="[&_[role=slider]]:bg-sage-600 [&_[role=slider]]:border-sage-700"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-sage-700 font-semibold">
              ${budgetRange[0].toLocaleString()}
            </span>
            <span className="text-sage-700 font-semibold">
              ${budgetRange[1].toLocaleString()}+
            </span>
          </div>
        </div>

        {/* Region Selection */}
        <div className="space-y-2">
          <Label htmlFor="region" className="text-sage-900 font-semibold">
            Vermont Region
          </Label>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="border-sage-200 focus:border-sage-400 focus:ring-sage-400">
                <SelectValue placeholder="Select a region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {VT_REGIONS.map((r) => (
                  <SelectItem key={r} value={r.toLowerCase()}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Button */}
        <Button
          onClick={onSearch}
          disabled={loading}
          className="w-full bg-gradient-to-r from-sage-600 to-sage-500 hover:from-sage-700 hover:to-sage-600 text-white shadow-md"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Searching Venues...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Find Venues
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

// Main Home component
export default function Home() {
  // Search parameters
  const [guestCount, setGuestCount] = useState('150')
  const [budgetRange, setBudgetRange] = useState<[number, number]>([15000, 25000])
  const [region, setRegion] = useState('all')

  // Search state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<SearchResponse | null>(null)

  // UI state
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('vt-wedding-favorites')
    return stored ? new Set(JSON.parse(stored)) : new Set()
  })
  const [showFavoritesModal, setShowFavoritesModal] = useState(false)
  const [amenityFilters, setAmenityFilters] = useState<Set<string>>(new Set())
  const [capacityFilter, setCapacityFilter] = useState<[number, number]>([50, 500])

  // Handle search
  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      // Build search query
      const regionText = region === 'all' ? 'any region in Vermont' : region
      const query = `Find Vermont wedding venues for ${guestCount} guests with budget $${budgetRange[0].toLocaleString()}-$${budgetRange[1].toLocaleString()} in ${regionText}. Include name, price, capacity, rating, location, description, amenities, images, contact info (phone, email, website), availability, and reviews. Rank by price (lowest first).`

      const result = await callAIAgent(query, AGENT_ID)

      if (result.success) {
        setResponse(result.response as SearchResponse)
      } else {
        setError(result.error || 'Search failed. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // Toggle favorite
  const toggleFavorite = (venueName: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(venueName)) {
      newFavorites.delete(venueName)
    } else {
      newFavorites.add(venueName)
    }
    setFavorites(newFavorites)
    localStorage.setItem('vt-wedding-favorites', JSON.stringify(Array.from(newFavorites)))
  }

  // Toggle amenity filter
  const toggleAmenityFilter = (amenityId: string) => {
    const newFilters = new Set(amenityFilters)
    if (newFilters.has(amenityId)) {
      newFilters.delete(amenityId)
    } else {
      newFilters.add(amenityId)
    }
    setAmenityFilters(newFilters)
  }

  // Filter venues
  const filteredVenues = useMemo(() => {
    if (!response?.result?.venues) return []

    let venues = [...response.result.venues]

    // Filter by amenities
    if (amenityFilters.size > 0) {
      venues = venues.filter((venue) => {
        const venueAmenities = (venue.amenities || []).map((a) =>
          a.toLowerCase()
        )
        return Array.from(amenityFilters).some((filter) =>
          venueAmenities.some((a) => a.includes(filter))
        )
      })
    }

    // Filter by capacity
    venues = venues.filter((venue) => {
      const capacity = typeof venue.capacity === 'number'
        ? venue.capacity
        : parseInt(String(venue.capacity || '0').replace(/\D/g, ''))
      return capacity >= capacityFilter[0] && capacity <= capacityFilter[1]
    })

    // Sort by price (lowest first)
    venues.sort((a, b) => {
      const priceA = a.price_numeric || 0
      const priceB = b.price_numeric || 0
      return priceA - priceB
    })

    return venues
  }, [response, amenityFilters, capacityFilter])

  // Get favorite venues
  const favoriteVenues = useMemo(() => {
    return filteredVenues.filter((venue) => favorites.has(venue.name || ''))
  }, [filteredVenues, favorites])

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory-50 via-white to-sage-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-sage-700 to-sage-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold flex items-center gap-3">
            <MapPin className="h-8 w-8" />
            Vermont Wedding Venue Finder
          </h1>
          <p className="mt-2 text-sage-100 text-sm md:text-base">
            Discover your dream wedding venue in the Green Mountain State
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <SearchSection
            guestCount={guestCount}
            setGuestCount={setGuestCount}
            budgetRange={budgetRange}
            setBudgetRange={setBudgetRange}
            region={region}
            setRegion={setRegion}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {response && (
          <div>
            {/* Results Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-serif font-bold text-sage-900">
                  {response.result.total_count > 0
                    ? `${filteredVenues.length} Venue${filteredVenues.length !== 1 ? 's' : ''} Found`
                    : 'No Venues Found'}
                </h2>
                {response.result.notes && (
                  <p className="text-sm text-gray-600 mt-1">{response.result.notes}</p>
                )}
              </div>

              {/* View Toggle & Favorites */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFavoritesModal(true)}
                  className="border-rose-300 text-rose-700 hover:bg-rose-50"
                >
                  <Heart className="h-4 w-4 mr-1 fill-rose-400" />
                  Favorites ({favorites.size})
                </Button>

                <div className="flex rounded-md border border-sage-300 overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'rounded-none',
                      viewMode === 'list'
                        ? 'bg-sage-100 text-sage-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <List className="h-4 w-4 mr-1" />
                    List
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('map')}
                    className={cn(
                      'rounded-none border-l border-sage-300',
                      viewMode === 'map'
                        ? 'bg-sage-100 text-sage-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Map className="h-4 w-4 mr-1" />
                    Map
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            {filteredVenues.length > 0 && (
              <Card className="mb-6 border-sage-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-sage-900">Filter Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Amenity Filters */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Amenities</Label>
                    <div className="flex flex-wrap gap-2">
                      {AMENITIES.map((amenity) => (
                        <Badge
                          key={amenity.id}
                          variant="outline"
                          className={cn(
                            'cursor-pointer transition-colors',
                            amenityFilters.has(amenity.id)
                              ? 'bg-sage-600 text-white border-sage-600'
                              : 'border-sage-300 text-sage-700 hover:bg-sage-50'
                          )}
                          onClick={() => toggleAmenityFilter(amenity.id)}
                        >
                          {amenity.label}
                        </Badge>
                      ))}
                      {amenityFilters.size > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAmenityFilters(new Set())}
                          className="h-6 text-xs text-gray-600"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Capacity Filter */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">
                      Capacity Range: {capacityFilter[0]} - {capacityFilter[1]} guests
                    </Label>
                    <Slider
                      min={50}
                      max={500}
                      step={25}
                      value={capacityFilter}
                      onValueChange={(value) => setCapacityFilter(value as [number, number])}
                      className="[&_[role=slider]]:bg-sage-600 [&_[role=slider]]:border-sage-700"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Display */}
            <Tabs value={viewMode} className="w-full">
              <TabsContent value="list" className="mt-0">
                {filteredVenues.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredVenues.map((venue, index) => (
                      <VenueCard
                        key={venue.name || index}
                        venue={venue}
                        index={index}
                        isFavorite={favorites.has(venue.name || '')}
                        onToggleFavorite={() => toggleFavorite(venue.name || '')}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="border-gray-200">
                    <CardContent className="pt-12 pb-12 text-center">
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">
                        No venues match your current filters. Try adjusting your search criteria.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="map" className="mt-0">
                <Card className="border-sage-200">
                  <CardContent className="pt-12 pb-12 text-center">
                    <Map className="h-16 w-16 text-sage-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-sage-900 mb-2">
                      Interactive Map View
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Map view with venue pins and location clustering coming soon
                    </p>
                    <p className="text-sm text-gray-500">
                      {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''} would be displayed on the map
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Empty State */}
        {!loading && !response && !error && (
          <Card className="border-sage-200 bg-gradient-to-br from-white to-sage-50/30">
            <CardContent className="pt-16 pb-16 text-center">
              <div className="bg-gradient-to-br from-sage-100 to-rose-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-sage-600" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-sage-900 mb-2">
                Start Your Venue Search
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Enter your wedding details above to discover beautiful Vermont venues perfect for
                your special day
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Favorites Comparison Modal */}
      <Dialog open={showFavoritesModal} onOpenChange={setShowFavoritesModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-sage-900 flex items-center gap-2">
              <Heart className="h-6 w-6 fill-rose-400 text-rose-400" />
              Your Favorite Venues
            </DialogTitle>
            <DialogDescription>
              Compare your saved venues to make the perfect choice
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            {favoriteVenues.length > 0 ? (
              <div className="space-y-4">
                {favoriteVenues.map((venue, index) => (
                  <Card key={venue.name || index} className="border-sage-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-serif text-sage-900">
                            {venue.name}
                          </CardTitle>
                          {venue.location && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3" />
                              {venue.location}
                            </div>
                          )}
                        </div>
                        <Badge className="bg-gradient-to-r from-sage-100 to-emerald-100 text-sage-800 border-sage-200">
                          {venue.price || `$${(venue.price_numeric || 0).toLocaleString()}`}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex items-center gap-4 text-gray-600">
                        {venue.capacity && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {venue.capacity} guests
                          </div>
                        )}
                        {venue.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            {venue.rating}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFavorite(venue.name || '')}
                        className="border-rose-300 text-rose-700 hover:bg-rose-50"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  You haven't saved any favorites yet. Click the heart icon on venue cards to save them for comparison.
                </p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Custom CSS for color theme */}
      <style>{`
        :root {
          --sage-50: #f6f7f6;
          --sage-100: #e8ebe8;
          --sage-200: #d1d7d1;
          --sage-300: #b4bfb4;
          --sage-400: #93a593;
          --sage-500: #758a75;
          --sage-600: #5d705d;
          --sage-700: #4a594a;
          --sage-800: #3d4a3d;
          --sage-900: #333f33;
          --ivory-50: #fdfcfa;
          --rose-400: #fb7185;
        }

        .from-sage-50 { --tw-gradient-from: var(--sage-50); }
        .from-sage-100 { --tw-gradient-from: var(--sage-100); }
        .from-sage-600 { --tw-gradient-from: var(--sage-600); }
        .from-sage-700 { --tw-gradient-from: var(--sage-700); }
        .to-sage-50 { --tw-gradient-to: var(--sage-50); }
        .to-sage-500 { --tw-gradient-to: var(--sage-500); }
        .to-sage-600 { --tw-gradient-to: var(--sage-600); }
        .to-emerald-100 { --tw-gradient-to: #d1fae5; }
        .to-rose-50 { --tw-gradient-to: #fff1f2; }
        .from-ivory-50 { --tw-gradient-from: var(--ivory-50); }
        .from-rose-100 { --tw-gradient-from: #ffe4e6; }

        .bg-sage-50 { background-color: var(--sage-50); }
        .bg-sage-100 { background-color: var(--sage-100); }
        .bg-sage-600 { background-color: var(--sage-600); }
        .text-sage-100 { color: var(--sage-100); }
        .text-sage-600 { color: var(--sage-600); }
        .text-sage-700 { color: var(--sage-700); }
        .text-sage-800 { color: var(--sage-800); }
        .text-sage-900 { color: var(--sage-900); }
        .border-sage-200 { border-color: var(--sage-200); }
        .border-sage-300 { border-color: var(--sage-300); }
        .border-sage-600 { border-color: var(--sage-600); }
        .border-sage-700 { border-color: var(--sage-700); }
        .hover\\:bg-sage-50:hover { background-color: var(--sage-50); }
        .hover\\:text-sage-900:hover { color: var(--sage-900); }
        .hover\\:from-sage-700:hover { --tw-gradient-from: var(--sage-700); }
        .hover\\:to-sage-600:hover { --tw-gradient-to: var(--sage-600); }
        .fill-rose-400 { fill: var(--rose-400); }
        .text-rose-400 { color: var(--rose-400); }
      `}</style>
    </div>
  )
}
