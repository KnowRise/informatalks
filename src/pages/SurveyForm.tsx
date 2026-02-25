import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

interface FormData {
  name: string
  topics: string[]
  description: string
  podcast_formats: string[]
  suggested_guest: string
}

const TOPICS = [
  'Technology',
  'Business',
  'Health & Wellness',
  'Entertainment',
  'Education',
  'Science',
  'Politics',
  'Sports',
  'Arts & Culture',
  'Other',
]

const PODCAST_FORMATS = [
  'Interview',
  'Solo Commentary',
  'Panel Discussion',
  'Storytelling',
  'News & Analysis',
  'Educational',
  'Comedy',
  'Debate',
]

function SurveyForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    topics: [],
    description: '',
    podcast_formats: [],
    suggested_guest: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleCheckboxChange = (field: 'topics' | 'podcast_formats', value: string) => {
    setFormData((prev) => {
      const currentArray = prev[field]
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value]
      return { ...prev, [field]: newArray }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (formData.topics.length === 0) {
      setError('Please select at least one topic')
      return
    }

    if (formData.podcast_formats.length === 0) {
      setError('Please select at least one podcast format')
      return
    }

    setLoading(true)

    try {
      // Insert single row with arrays
      const { error: insertError } = await supabase.from('surveys').insert({
        name: formData.name,
        topics: formData.topics,
        description: formData.description,
        podcast_formats: formData.podcast_formats,
        suggested_guest: formData.suggested_guest || null,
      })

      if (insertError) {
        throw insertError
      }

      setSuccess(true)
      setFormData({
        name: '',
        topics: [],
        description: '',
        podcast_formats: [],
        suggested_guest: '',
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '20px' }}>
      <h1>Podcast Survey</h1>
      <p style={{ marginBottom: '20px' }}>
        Help us create better podcast content by sharing your preferences!
      </p>

      {success && (
        <div
          style={{
            color: 'green',
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid green',
            borderRadius: '4px',
            backgroundColor: '#d4edda',
          }}
        >
          Thank you for your submission! 🎉
        </div>
      )}

      {error && (
        <div
          style={{
            color: 'red',
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid red',
            borderRadius: '4px',
            backgroundColor: '#f8d7da',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Your Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Topics of Interest *</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {TOPICS.map((topic) => (
              <label key={topic} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.topics.includes(topic)}
                  onChange={() => handleCheckboxChange('topics', topic)}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                {topic}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Description / Additional Comments *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            Preferred Podcast Format *
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
            {PODCAST_FORMATS.map((format) => (
              <label key={format} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.podcast_formats.includes(format)}
                  onChange={() => handleCheckboxChange('podcast_formats', format)}
                  style={{ marginRight: '8px', cursor: 'pointer' }}
                />
                {format}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="suggested_guest" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Suggested Guest
          </label>
          <input
            id="suggested_guest"
            type="text"
            value={formData.suggested_guest}
            onChange={(e) => setFormData({ ...formData, suggested_guest: e.target.value })}
            style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            backgroundColor: loading ? '#ccc' : '#646cff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Submitting...' : 'Submit Survey'}
        </button>
      </form>
    </div>
  )
}

export default SurveyForm
