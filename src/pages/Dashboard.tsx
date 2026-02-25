import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface Survey {
  id: string
  name: string
  topics: string[]
  description: string
  podcast_formats: string[]
  suggested_guest: string | null
  created_at: string
}

interface Stats {
  [key: string]: number
}

function Dashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [filteredSurveys, setFilteredSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [topicFilter, setTopicFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [topicStats, setTopicStats] = useState<Stats>({})
  const [formatStats, setFormatStats] = useState<Stats>({})
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    fetchSurveys()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [surveys, topicFilter, formatFilter, searchTerm])

  const checkAuth = async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) {
      navigate('/login?admin')
    }
  }

  const fetchSurveys = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching surveys:', error)
    } else if (data) {
      setSurveys(data)
      calculateStats(data)
    }
    setLoading(false)
  }

  const calculateStats = (data: Survey[]) => {
    const topics: Stats = {}
    const formats: Stats = {}

    data.forEach((survey) => {
      // Count each topic/format from arrays
      survey.topics.forEach((topic) => {
        topics[topic] = (topics[topic] || 0) + 1
      })
      survey.podcast_formats.forEach((format) => {
        formats[format] = (formats[format] || 0) + 1
      })
    })

    setTopicStats(topics)
    setFormatStats(formats)
  }

  const applyFilters = () => {
    let filtered = [...surveys]

    if (topicFilter !== 'all') {
      filtered = filtered.filter((s) => s.topics.includes(topicFilter))
    }

    if (formatFilter !== 'all') {
      filtered = filtered.filter((s) => s.podcast_formats.includes(formatFilter))
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.description.toLowerCase().includes(term) ||
          (s.suggested_guest && s.suggested_guest.toLowerCase().includes(term))
      )
    }

    setFilteredSurveys(filtered)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login?admin')
  }

  const uniqueTopics = Array.from(new Set(surveys.flatMap((s) => s.topics))).sort()
  const uniqueFormats = Array.from(new Set(surveys.flatMap((s) => s.podcast_formats))).sort()

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>Survey Dashboard</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Statistics Section */}
          <div style={{ marginBottom: '30px' }}>
            <h2>Statistics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div
                style={{
                  padding: '20px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <h3 style={{ marginTop: 0 }}>Topics ({Object.keys(topicStats).length})</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {Object.entries(topicStats)
                    .sort(([, a], [, b]) => b - a)
                    .map(([topic, count]) => (
                      <div
                        key={topic}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 0',
                          borderBottom: '1px solid #dee2e6',
                        }}
                      >
                        <span>{topic}</span>
                        <span style={{ fontWeight: 'bold' }}>{count}</span>
                      </div>
                    ))}
                </div>
              </div>

              <div
                style={{
                  padding: '20px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa',
                }}
              >
                <h3 style={{ marginTop: 0 }}>Podcast Formats ({Object.keys(formatStats).length})</h3>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {Object.entries(formatStats)
                    .sort(([, a], [, b]) => b - a)
                    .map(([format, count]) => (
                      <div
                        key={format}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 0',
                          borderBottom: '1px solid #dee2e6',
                        }}
                      >
                        <span>{format}</span>
                        <span style={{ fontWeight: 'bold' }}>{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div
            style={{
              marginBottom: '20px',
              padding: '20px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa',
            }}
          >
            <h3 style={{ marginTop: 0 }}>Filters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Topic</label>
                <select
                  value={topicFilter}
                  onChange={(e) => setTopicFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '16px', borderRadius: '4px' }}
                >
                  <option value="all">All Topics</option>
                  {uniqueTopics.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Format</label>
                <select
                  value={formatFilter}
                  onChange={(e) => setFormatFilter(e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '16px', borderRadius: '4px' }}
                >
                  <option value="all">All Formats</option>
                  {uniqueFormats.map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Search (Name/Description/Guest)
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type to search..."
                  style={{ width: '100%', padding: '8px', fontSize: '16px', borderRadius: '4px' }}
                />
              </div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => {
                  setTopicFilter('all')
                  setFormatFilter('all')
                  setSearchTerm('')
                }}
                style={{ padding: '8px 16px', cursor: 'pointer' }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results */}
          <div>
            <h3>
              Survey Results ({filteredSurveys.length} of {surveys.length})
            </h3>
            {filteredSurveys.length === 0 ? (
              <p>No surveys found with the current filters.</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {filteredSurveys.map((survey) => (
                  <div
                    key={survey.id}
                    style={{
                      padding: '15px',
                      border: '1px solid #ccc',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ fontSize: '18px' }}>{survey.name}</strong>
                      <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
                        {new Date(survey.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        {survey.topics.map((topic) => (
                          <span
                            key={topic}
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              backgroundColor: '#e7f3ff',
                              borderRadius: '4px',
                              marginRight: '8px',
                              marginBottom: '4px',
                              fontSize: '14px',
                            }}
                          >
                            📂 {topic}
                          </span>
                        ))}
                      </div>
                      <div>
                        {survey.podcast_formats.map((format) => (
                          <span
                            key={format}
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              backgroundColor: '#fff3cd',
                              borderRadius: '4px',
                              marginRight: '8px',
                              marginBottom: '4px',
                              fontSize: '14px',
                            }}
                          >
                            🎙️ {format}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p style={{ margin: '10px 0' }}>{survey.description}</p>
                    {survey.suggested_guest && (
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Suggested Guest:</strong> {survey.suggested_guest}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
