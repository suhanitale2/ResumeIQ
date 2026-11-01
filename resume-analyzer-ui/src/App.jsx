import { useEffect, useState } from 'react'
import './App.css'

function cleanInterviewText(text) {
  if (!text) return ''

  return text
    .replace(/\\([#>*_`-])/g, '$1')
    .replace(/^#DIL0\s*/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`{1,3}/g, '')
    .replace(/^---+$/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^\s*\*\s+/gm, '• ')
    .replace(/&nbsp;/g, ' ')
    .trim()
}

function App() {
  const [profileEmail, setProfileEmail] = useState('')
const [profileLoading, setProfileLoading] = useState(false)
const [profileError, setProfileError] = useState('')
  const [activePage, setActivePage] = useState('Home')
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [resumeHistory, setResumeHistory] = useState([])
  const [aiReviewHistory, setAiReviewHistory] = useState([])
  const [recentResumes, setRecentResumes] = useState([])
const [recentResumesLoading, setRecentResumesLoading] = useState(false)
const [recentResumesError, setRecentResumesError] = useState('')
const [aiReviewHistoryLoading, setAiReviewHistoryLoading] = useState(false)
const [historyLoading, setHistoryLoading] = useState(false)
const [historyError, setHistoryError] = useState('')
const [careerCoachHistory, setCareerCoachHistory] = useState([])
const [coachHistoryLoading, setCoachHistoryLoading] = useState(false)
const [coachHistoryError, setCoachHistoryError] = useState('')
const [selectedFile, setSelectedFile] = useState(null)
const [jobDescription, setJobDescription] = useState('')
const [analysisLoading, setAnalysisLoading] = useState(false)
const [analysisError, setAnalysisError] = useState('')
const [analysisResult, setAnalysisResult] = useState(null)
const [aiReviewFile, setAiReviewFile] = useState(null)
const [aiReviewLoading, setAiReviewLoading] = useState(false)
const [aiReviewError, setAiReviewError] = useState('')
const [aiReviewResult, setAiReviewResult] = useState('')
const [coachFile, setCoachFile] = useState(null)
const [targetRole, setTargetRole] = useState('')
const [coachFocus, setCoachFocus] = useState('complete-plan')
const [coachLoading, setCoachLoading] = useState(false)
const [coachError, setCoachError] = useState('')
const [careerPlan, setCareerPlan] = useState('')
const [coachHistory, setCoachHistory] = useState([])
const [isAuthenticated, setIsAuthenticated] = useState(false)
const [authChecking, setAuthChecking] = useState(true)
// AI Interview Coach states
const [interviewResumeId, setInterviewResumeId] = useState('')
const [interviewTargetRole, setInterviewTargetRole] = useState('')
const [interviewQuestion, setInterviewQuestion] = useState('')
const [interviewAnswer, setInterviewAnswer] = useState('')
const [interviewFeedback, setInterviewFeedback] = useState('')
const [interviewLoading, setInterviewLoading] = useState(false)
const [interviewEvaluating, setInterviewEvaluating] = useState(false)
const [interviewError, setInterviewError] = useState('')
const [interviewHistory, setInterviewHistory] = useState([])
const [previousInterviewQuestions, setPreviousInterviewQuestions] = useState([])
const [showInterviewHistory, setShowInterviewHistory] = useState(false)

useEffect(() => {
  if (activePage !== 'History' && activePage !== 'Home') return

  const loadHistory = async () => {
    setHistoryLoading(true)
    setHistoryError('')

    try {
      const response = await fetch(
        'http://localhost:8081/api/resume/history',
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? 'Access denied. Please check your login session and backend security settings.'
            : `Could not load history. Status: ${response.status}`
        )
      }

      const data = await response.json()
      setResumeHistory(Array.isArray(data) ? data : [])
    } catch (error) {
      setHistoryError(
        error.message ||
          'Could not connect to the backend. Please check that Spring Boot is running.'
      )
    } finally {
      setHistoryLoading(false)
    }
  }

  loadHistory()
}, [activePage])

useEffect(() => {
  if (
    activePage !== 'Home' &&
    activePage !== 'History'
  ) {
    return
  }

  if (!isAuthenticated) {
    setAiReviewHistory([])
    return
  }

  const loadAIReviewHistory = async () => {
    setAiReviewHistoryLoading(true)

    try {
      const response = await fetch(
        'http://localhost:8081/api/resume/ai-review/history',
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Could not load AI Review history. Status: ${response.status}`
        )
      }

      const data = await response.json()

      setAiReviewHistory(
        Array.isArray(data) ? data : []
      )
    } catch (error) {
      console.error(
        'Could not load AI Review history:',
        error
      )
    } finally {
      setAiReviewHistoryLoading(false)
    }
  }

  loadAIReviewHistory()
}, [activePage, isAuthenticated])
useEffect(() => {
  if (activePage !== 'History') return

  if (!isAuthenticated) {
    setRecentResumes([])
    return
  }

  const loadRecentResumes = async () => {
    setRecentResumesLoading(true)
    setRecentResumesError('')

    try {
      const response = await fetch(
        'http://localhost:8081/api/resume/recent',
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Could not load recent resumes. Status: ${response.status}`
        )
      }

      const data = await response.json()

      setRecentResumes(Array.isArray(data) ? data : [])
    } catch (error) {
      setRecentResumesError(
        error.message || 'Could not load recent resumes.'
      )
    } finally {
      setRecentResumesLoading(false)
    }
  }

  loadRecentResumes()
}, [activePage, isAuthenticated])
useEffect(() => {
  if (activePage !== 'My Recent Resumes' || !isAuthenticated) {
    return;
  }

  const loadRecentResumes = async () => {
    setRecentResumesLoading(true);
    setRecentResumesError('');

    try {
      const response = await fetch(
        'http://localhost:8081/api/resume/recent',
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Could not load your recent resumes.');
      }

      const data = await response.json();
      setRecentResumes(Array.isArray(data) ? data : []);
    } catch (error) {
      setRecentResumesError(
        error.message || 'Could not load your recent resumes.'
      );
    } finally {
      setRecentResumesLoading(false);
    }
  };

  loadRecentResumes();
}, [activePage, isAuthenticated]);
useEffect(() => {
  checkAuthSession()
}, [])
// Load AI Interview Coach history when its page opens
useEffect(() => {
  if (activePage !== 'AI Interview Coach' || !isAuthenticated) {
    return
  }

  loadInterviewHistory()
}, [activePage, isAuthenticated])
  const menuItems = [
    { name: 'Home', icon: '⌂' },
    { name: 'Analyze Resume', icon: '▤' },
    { name: 'History', icon: '◷' },
    { name: 'My Recent Resumes', icon: '▣' },
    { name: 'AI Review', icon: '✧' },
    { name: 'Career Coach', icon: '◎' },
    { name: 'AI Interview Coach', icon: '🎤' },
    { name: 'Profile', icon: '♙' },
  ]

  const changePage = (page) => {
    setActivePage(page)
    setMobileMenuOpen(false)
  }
  const handleAnalyzeResume = async () => {
  if (!selectedFile) {
    setAnalysisError('Please select a resume PDF first.')
    return
  }

  if (selectedFile.type !== 'application/pdf') {
    setAnalysisError('Please select a valid PDF file.')
    return
  }

  setAnalysisLoading(true)
  setAnalysisError('')
  setAnalysisResult(null)

  try {
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('jobDescription', jobDescription)

    const response = await fetch(
      'http://localhost:8081/api/resume/upload',
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error(
        response.status === 401 || response.status === 403
          ? 'Login required. Please sign in to the existing backend first.'
          : `Resume analysis failed (HTTP ${response.status}).`
      )
    }

    const data = await response.json()
    setAnalysisResult(data)
  } catch (error) {
    setAnalysisError(
      error.message || 'Could not connect to the Spring Boot backend.'
    )
  } finally {
    setAnalysisLoading(false)
  }
}

const handleAIReview = async () => {
  if (!aiReviewFile) {
    setAiReviewError('Please select a resume PDF first.')
    return
  }

  if (!aiReviewFile.name.toLowerCase().endsWith('.pdf')) {
    setAiReviewError('Please select a PDF file.')
    return
  }

  setAiReviewLoading(true)
  setAiReviewError('')
  setAiReviewResult('')

  try {
    const formData = new FormData()
    formData.append('file', aiReviewFile)

    const response = await fetch(
      'http://localhost:8081/api/resume/ai-review',
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    )

    const responseText = await response.text()
    let data

    try {
      data = JSON.parse(responseText)
    } catch {
      data = responseText
    }

    if (!response.ok) {
      const message =
        typeof data === 'string'
          ? data
          : data.message || `AI Review failed (HTTP ${response.status}).`

      throw new Error(message)
    }

    const review =
      typeof data === 'object' && data !== null
        ? data.aiReview
        : null

    if (!review) {
      throw new Error('The backend did not return an AI review.')
    }

    setAiReviewResult(review)
  } catch (error) {
    setAiReviewError(
      error.message || 'Could not connect to the backend.'
    )
  } finally {
    setAiReviewLoading(false)
  }
}
const handleCareerCoach = async () => {
  if (!coachFile) {
    setCoachError('Please select your resume PDF first.')
    return
  }

  if (!targetRole.trim()) {
    setCoachError('Please enter your target job role.')
    return
  }

  if (coachFile.type !== 'application/pdf') {
    setCoachError('Please select a valid PDF file.')
    return
  }

  setCoachLoading(true)
  setCoachError('')
  setCareerPlan('')

  try {
    const formData = new FormData()
    formData.append('file', coachFile)
    formData.append('targetRole', targetRole.trim())
    formData.append('jobDescription', jobDescription)
    formData.append('focusArea', coachFocus)

    const response = await fetch(
      'http://localhost:8081/api/resume/career-coach',
      {
        method: 'POST',
        credentials: 'include',
        body: formData,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data.message ||
          (response.status === 401 || response.status === 403
            ? 'Please log in before using Career Coach.'
            : `Career Coach failed (HTTP ${response.status}).`)
      )
    }

    setCareerPlan(data.careerCoach || 'No career plan was returned.')
  } catch (error) {
    setCoachError(
      error.message || 'Could not connect to the Spring Boot backend.'
    )
  } finally {
    setCoachLoading(false)
  }
}
const loadCareerCoachHistory = async () => {
  setCoachHistoryLoading(true)
  setCoachHistoryError('')

  try {
    const response = await fetch(
      'http://localhost:8081/api/resume/career-coach/history',
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(
        response.status === 401 || response.status === 403
          ? 'Please log in to view your saved career plans.'
          : 'Could not load career plan history.'
      )
    }

    const data = await response.json()

    setCareerCoachHistory(
      Array.isArray(data)
        ? data
        : Array.isArray(data.history)
          ? data.history
          : []
    )
  } catch (error) {
    setCoachHistoryError(error.message)
  } finally {
    setCoachHistoryLoading(false)
  }
}

const loadProfile = async () => {
  setProfileLoading(true)
  setProfileError('')

  try {
    const response = await fetch(
      'http://localhost:8081/api/auth/session',
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Could not load profile information.')
    }

    const data = await response.json()

    if (data.authenticated !== true &&
        data.authenticated !== 'true') {
      throw new Error('Please log in to view your profile.')
    }

    setProfileEmail(data.email || '')
  } catch (error) {
    setProfileError(error.message)
    setProfileEmail('')
    setIsAuthenticated(false)
  } finally {
    setProfileLoading(false)
  }
}

const logoutUser = async () => {
  try {
    const response = await fetch(
      'http://localhost:8081/api/auth/logout',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error('Logout failed. Please try again.')
    }

    setProfileEmail('')
    setProfileError('')
    setCareerPlan(null)

    window.location.href = 'http://localhost:8081/login.html'
  } catch (error) {
    setProfileError(error.message || 'Could not log out.')
  }
}

const checkAuthSession = async () => {
  try {
    const response = await fetch(
      'http://localhost:8081/api/auth/session',
      {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      }
    )

    if (!response.ok) {
      setIsAuthenticated(false)
      return
    }

    const data = await response.json()

    setIsAuthenticated(
      data.authenticated === true ||
      data.authenticated === 'true'
    )
  } catch (error) {
    setIsAuthenticated(false)
  } finally {
    setAuthChecking(false)
  }
}

const totalResumeAnalyses = resumeHistory.length

const latestResumeScore =
  resumeHistory.length > 0
    ? resumeHistory.reduce((latest, item) => {
        const latestDate = new Date(latest.analyzedAt || 0).getTime()
        const itemDate = new Date(item.analyzedAt || 0).getTime()

        return itemDate > latestDate ? item : latest
      }).resumeScore
    : null
const handleDownloadRecentResume = async (id, fileName) => {
  try {
    const response = await fetch(
      `http://localhost:8081/api/resume/recent/${id}/download`,
      {
        method: 'GET',
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Could not download this resume.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'Resume.pdf';

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert(error.message || 'Download failed.');
  }
};
// Load interview history
const loadInterviewHistory = async () => {
  try {
    const response = await fetch(
      'http://localhost:8081/api/interview/history',
      {
        method: 'GET',
        credentials: 'include',
      }
    )

    if (!response.ok) {
      throw new Error('Could not load interview history.')
    }

    const data = await response.json()
    setInterviewHistory(data)
  } catch (error) {
    setInterviewError(error.message)
  }
}

// Generate interview question
const generateInterviewQuestion = async () => {
  if (!interviewResumeId || !interviewTargetRole.trim()) {
    setInterviewError('Please select a resume and enter your target role.')
    return
  }

  setInterviewLoading(true)
  setInterviewError('')
  setInterviewFeedback('')
  setInterviewAnswer('')

  try {
    const formData = new URLSearchParams()
    formData.append('resumeId', interviewResumeId)
    formData.append('targetRole', interviewTargetRole.trim())
    formData.append(
      'previousQuestions',
      previousInterviewQuestions.join('\n')
    )

    const response = await fetch(
      'http://localhost:8081/api/interview/question',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Could not generate question.')
    }

    setInterviewQuestion(data.question)
    setPreviousInterviewQuestions((previous) => [
      ...previous,
      data.question,
    ])
  } catch (error) {
    setInterviewError(error.message)
  } finally {
    setInterviewLoading(false)
  }
}

// Evaluate submitted interview answer
const submitInterviewAnswer = async () => {
  if (!interviewQuestion || !interviewAnswer.trim()) {
    setInterviewError('Please enter your answer first.')
    return
  }

  setInterviewEvaluating(true)
  setInterviewError('')

  try {
    const formData = new URLSearchParams()
    formData.append('resumeId', interviewResumeId)
    formData.append('question', interviewQuestion)
    formData.append('answer', interviewAnswer.trim())
    formData.append('targetRole', interviewTargetRole.trim())

    const response = await fetch(
      'http://localhost:8081/api/interview/evaluate',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Could not evaluate your answer.')
    }

    setInterviewFeedback(data.feedback)
    await loadInterviewHistory()
  } catch (error) {
    setInterviewError(error.message)
  } finally {
    setInterviewEvaluating(false)
  }
}
  const renderPage = () => {
    switch (activePage) {
      case 'Analyze Resume':
        return (
          <section className="content-card">
            <span className="eyebrow">RESUME TOOLS</span>
            <h2>Analyze your resume</h2>
            <p className="muted">
              Upload your resume to evaluate its strengths and identify
              improvements for your target job.
            </p>

            <div className="upload-box">
              <div className="upload-icon">↑</div>
              <h3>Upload your resume</h3>
              <p>Choose a PDF file from your computer.</p>
             <input
  type="file"
  accept=".pdf,application/pdf"
  aria-label="Choose resume PDF"
  onChange={(event) => {
    setSelectedFile(event.target.files?.[0] || null)
    setAnalysisError('')
    setAnalysisResult(null)
  }}
/>
              <p className="helper-text">
                 PDF only · Maximum file size 5 MB · Your resume analysis is saved
  to your account history.
              </p>
            </div>

            <label className="field-label" htmlFor="jobDescription">
              Target job description
            </label>
            <textarea
              id="jobDescription"
              className="text-field"
              placeholder="Paste the job description here..."
              rows="5"
              value={jobDescription}
onChange={(event) => setJobDescription(event.target.value)}
            />

            <button
  className="primary-button"
  onClick={handleAnalyzeResume}
  disabled={analysisLoading}
>
  {analysisLoading ? 'Analyzing...' : 'Analyze Resume →'}
</button>
          {analysisError && (
  <div className="notice" role="alert">
    {analysisError}
  </div>
)}

{analysisResult && (
  <div className="analysis-result">
    <h2>Analysis Results</h2>

    <p>
      Resume Score:{' '}
      <strong>{analysisResult.resumeScore ?? 'N/A'}/100</strong>
    </p>

    <h3>Detected Skills</h3>
    {analysisResult.detectedSkills?.length ? (
      <ul>
        {analysisResult.detectedSkills.map((skill, index) => (
          <li key={`${skill}-${index}`}>{skill}</li>
        ))}
      </ul>
    ) : (
      <p>No skills were returned.</p>
    )}

    <h3>Improvement Suggestions</h3>
    {analysisResult.suggestions?.length ? (
      <ul>
        {analysisResult.suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
    ) : (
      <p>
        Analysis completed. Some result fields may use different names
        in the backend response.
      </p>
    )}
  </div>
)}
          </section>
        )

      case 'History':
  return (
    <section className="content-card">
      <span className="eyebrow">YOUR PROGRESS</span>
      <h2>Resume analysis history</h2>
      <p className="muted">
        Your saved resume analyses, loaded from your existing backend.
      </p>

      {historyLoading && (
        <p className="muted">Loading your resume history...</p>
      )}

      {historyError && (
        <div className="notice">
          {historyError}
        </div>
      )}

      {!historyLoading && !historyError && resumeHistory.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">◷</div>
          <h3>No resume history found</h3>
          <p>Your saved analyses will appear here when available.</p>
        </div>
      )}

      {!historyLoading && !historyError && resumeHistory.length > 0 && (
        <>
          <div className="history-summary">
            <strong>{resumeHistory.length}</strong>
            <span>saved resume analyses</span>
          </div>

          <div className="history-list">
            {resumeHistory.map((item) => (
              <article className="history-item" key={item.id}>
                <div className="history-file-icon">PDF</div>

                <div className="history-details">
                  <h3>{item.fileName || 'Resume PDF'}</h3>
                  <p>
                    {item.analyzedAt
                      ? new Date(item.analyzedAt).toLocaleString()
                      : 'Date unavailable'}
                  </p>
                  <p>
                    {item.skillCount ?? item.detectedSkills?.length ?? 0}{' '}
                    skills · {item.wordCount ?? 0} words
                  </p>
                </div>

                <div className="history-score">
                  <strong>{item.resumeScore ?? '—'}</strong>
                  <span>/100</span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      {/* RECENT RESUMES */}
<div className="history-section">
  <span className="eyebrow">YOUR SAVED FILES</span>
  <h2>Recent Resumes</h2>

  <p className="muted">
    Your latest 5 uploaded resume PDFs, stored securely.
  </p>

  {recentResumesLoading && (
    <p className="muted">Loading your saved resumes...</p>
  )}

  {recentResumesError && (
    <div className="notice">{recentResumesError}</div>
  )}

  {!recentResumesLoading &&
    !recentResumesError &&
    recentResumes.length === 0 && (
      <div className="empty-state">
        <div className="empty-icon">PDF</div>
        <h3>No saved resumes yet</h3>
        <p>Your uploaded resume PDFs will appear here.</p>
      </div>
    )}

  {!recentResumesLoading &&
    !recentResumesError &&
    recentResumes.length > 0 && (
      <div className="history-list">
        {recentResumes.map((item) => (
          <article className="history-item" key={item.id}>
            <div className="history-file-icon">PDF</div>

            <div className="history-details">
              <h3>{item.fileName || 'Resume PDF'}</h3>

              <p>
                {item.uploadedAt
                  ? new Date(item.uploadedAt).toLocaleString()
                  : 'Date unavailable'}
              </p>

              <p>
                {item.fileSize
                  ? `${(item.fileSize / 1024).toFixed(1)} KB`
                  : 'Size unavailable'}
              </p>
            </div>

            <div className="history-actions">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `http://localhost:8081/api/resume/recent/${item.id}/download`,
                      { credentials: 'include' }
                    )

                    if (!response.ok) {
                      throw new Error('Could not download resume.')
                    }

                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')

                    link.href = url
                    link.download = item.fileName || 'Resume.pdf'
                    document.body.appendChild(link)
                    link.click()
                    link.remove()

                    window.URL.revokeObjectURL(url)
                  } catch (error) {
                    alert(error.message || 'Download failed.')
                  }
                }}
              >
                Download
              </button>

              <button
                type="button"
                onClick={async () => {
                  const confirmed = window.confirm(
                    'Are you sure you want to delete this saved resume?'
                  )

                  if (!confirmed) return

                  try {
                    const response = await fetch(
                      `http://localhost:8081/api/resume/recent/${item.id}`,
                      {
                        method: 'DELETE',
                        credentials: 'include',
                      }
                    )

                    if (!response.ok) {
                      throw new Error('Could not delete resume.')
                    }

                    setRecentResumes((previous) =>
                      previous.filter((resume) => resume.id !== item.id)
                    )
                  } catch (error) {
                    alert(error.message || 'Delete failed.')
                  }
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    )}
</div>
            {/* AI REVIEW HISTORY */}
      <div className="history-section">
        <span className="eyebrow">YOUR AI ACTIVITY</span>
        <h2>AI Review History</h2>

        <p className="muted">
          Your previously generated AI resume feedback.
        </p>

        {aiReviewHistoryLoading && (
          <p className="muted">Loading your AI Review history...</p>
        )}

        {!aiReviewHistoryLoading && aiReviewHistory.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">✧</div>
            <h3>No AI reviews found</h3>
            <p>Your saved AI reviews will appear here.</p>
          </div>
        )}

        {!aiReviewHistoryLoading && aiReviewHistory.length > 0 && (
          <div className="history-list">
            {aiReviewHistory.map((item) => (
              <article className="history-item" key={item.id}>
                <div className="history-file-icon">AI</div>

                <div className="history-details">
                  <h3>{item.fileName || 'Resume PDF'}</h3>

                  <p>
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : 'Date unavailable'}
                  </p>

                  <details>
                    <summary>View AI Feedback</summary>
                    
<div className="ai-review-text">
  {item.aiReview?.split('\n').map((line, index) => {
    const text = line.trim();

    if (!text || /^-{3,}$/.test(text)) {
      return <div key={index} className="review-spacer" />;
    }

    if (/^#{1,6}\s/.test(text)) {
      return (
        <h3 key={index} className="review-heading">
          {text.replace(/^#{1,6}\s*/, '')}
        </h3>
      );
    }

    if (/^[-*•]\s/.test(text)) {
      return (
        <p key={index} className="review-bullet">
          • {text.replace(/^[-*•]\s*/, '')}
        </p>
      );
    }

    if (/^\d+\.\s/.test(text)) {
      return (
        <h3 key={index} className="review-heading">
          {text}
        </h3>
      );
    }

    const parts = text.split(/(\*\*.*?\*\*)/g);

    return (
      <p key={index}>
        {parts.map((part, partIndex) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={partIndex}>
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  })}
</div>

                  </details>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  ) 
  case 'My Recent Resumes':
  return (
    <section className="content-card">
      <span className="eyebrow">YOUR DOCUMENTS</span>
      <h2>My Recent Resumes</h2>
      <p className="muted">
        Your latest 5 uploaded resume PDFs, securely saved in your account.
      </p>

      {recentResumesLoading && (
        <p className="muted">Loading your saved resumes...</p>
      )}

      {recentResumesError && (
        <div className="notice">{recentResumesError}</div>
      )}

      {!recentResumesLoading &&
        !recentResumesError &&
        recentResumes.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">▣</div>
            <h3>No saved resumes yet</h3>
            <p>
              Upload a PDF in Analyze Resume and it will appear here.
            </p>
          </div>
        )}

      {!recentResumesLoading &&
        !recentResumesError &&
        recentResumes.length > 0 && (
          <>
            <div className="history-summary">
              <strong>{recentResumes.length}/5</strong>
              <span>recently saved resumes</span>
            </div>

            <div className="history-list">
              {recentResumes.map((item) => (
                <article className="history-item" key={item.id}>
                  <div className="history-file-icon">PDF</div>

                  <div className="history-details">
                    <h3>{item.fileName}</h3>
                    <p>
                      {item.uploadedAt
                        ? new Date(item.uploadedAt).toLocaleString()
                        : 'Date unavailable'}
                    </p>
                    <p>
                      {item.fileSize
                        ? (item.fileSize / (1024 * 1024)).toFixed(2) + ' MB'
                        : 'Size unavailable'}
                    </p>
                    <button
  type="button"
  className="primary-button"
  onClick={() =>
    handleDownloadRecentResume(item.id, item.fileName)
  }
>
  Download PDF
</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
    </section>
  )         
case 'AI Review':
  return (
    <section className="content-card">
      <span className="eyebrow">AI-POWERED FEEDBACK</span>

      <h2>AI Resume Review</h2>

      <p className="muted">
        Get personalized feedback on your summary, skills,
        projects and experience using your existing AI service.
      </p>

      <div className="upload-box">
        <div className="upload-icon">✧</div>

        <h3>Upload your resume</h3>

        <p>Choose a readable PDF file under 5 MB.</p>

        <input
          type="file"
          accept=".pdf,application/pdf"
          aria-label="Choose resume PDF for AI review"
          onChange={(event) => {
            setAiReviewFile(event.target.files?.[0] || null)
            setAiReviewError('')
            setAiReviewResult('')
          }}
        />
      </div>

      <button
        className="primary-button"
        onClick={handleAIReview}
        disabled={aiReviewLoading}
      >
        {aiReviewLoading ? 'Reviewing Resume...' : 'Get AI Review →'}
      </button>

      {aiReviewLoading && (
        <p className="muted" role="status">
          AI is reviewing your resume. Please wait...
        </p>
      )}

      {aiReviewError && (
        <div className="notice" role="alert">
          {aiReviewError}
        </div>
      )}

      {aiReviewResult && (
        <div className="analysis-result">
          <h2>Your AI Resume Feedback</h2>

<div className="ai-review-text">
  {aiReviewResult.split('\n').map((line, index) => {
    const text = line
      .trim()
      .replace(/\*\*/g, '')
      .replace(/\\\*/g, '*');

    if (!text || /^-{3,}$/.test(text)) {
      return <div key={index} className="review-spacer" />;
    }

    if (/^#{1,6}\s/.test(text)) {
      return (
        <h3 key={index} className="review-heading">
          {text.replace(/^#{1,6}\s*/, '')}
        </h3>
      );
    }

    if (/^\d+\.\s/.test(text)) {
      return (
        <h3 key={index} className="review-heading">
          {text}
        </h3>
      );
    }

    if (/^[-*•]\s/.test(text)) {
      return (
        <p key={index} className="review-bullet">
          • {text.replace(/^[-*•]\s*/, '')}
        </p>
      );
    }

    return <p key={index}>{text}</p>;
  })}
</div>

        </div>
      )}
    </section>
  )
      case 'Career Coach':
  return (
    <section className="content-card">
      <span className="eyebrow">YOUR CAREER JOURNEY</span>
      <h2>AI Career Coach</h2>
      <p className="muted">
        Upload your resume and get a personalized career plan
        for your target job role.
      </p>

      <label className="field-label" htmlFor="coachFile">
        Resume PDF
      </label>
      <input
        id="coachFile"
        type="file"
        accept=".pdf,application/pdf"
        onChange={(event) => {
          setCoachFile(event.target.files?.[0] || null)
          setCoachError('')
          setCareerPlan('')
        }}
      />

      <label className="field-label" htmlFor="targetRole">
        Target job role
      </label>
      <input
        id="targetRole"
        className="text-field"
        type="text"
        placeholder="e.g. Java Developer"
        value={targetRole}
        onChange={(event) => setTargetRole(event.target.value)}
        maxLength={120}
      />

      <label className="field-label" htmlFor="coachFocus">
        What do you want help with?
      </label>
      <select
        id="coachFocus"
        className="text-field"
        value={coachFocus}
        onChange={(event) => setCoachFocus(event.target.value)}
      >
        <option value="complete-plan">Complete career plan</option>
        <option value="skill-gaps">Skills to improve</option>
        <option value="projects">Portfolio projects</option>
        <option value="interview">Interview preparation</option>
        <option value="30-day-plan">30-day action plan</option>
      </select>

      <label className="field-label" htmlFor="coachJobDescription">
        Job description (optional)
      </label>
      <textarea
        id="coachJobDescription"
        className="text-field"
        rows="5"
        placeholder="Paste the target job description here..."
        value={jobDescription}
        onChange={(event) => setJobDescription(event.target.value)}
      />

      <button
        className="primary-button"
        onClick={handleCareerCoach}
        disabled={coachLoading}
      >
        {coachLoading ? 'Creating your plan...' : 'Create Career Plan →'}
      </button>

      {coachError && (
        <div className="notice" role="alert">
          {coachError}
        </div>
      )}

      {careerPlan && (
        <div className="analysis-result">
          <h2>Your Personalized Career Plan</h2>
          <div className="ai-review-text">
            {careerPlan.split('\n').map((line, index) => {
              const text = line.trim().replace(/\*\*/g, '')

              if (!text || /^-{3,}$/.test(text)) {
                return <div key={index} className="review-spacer" />
              }

              if (/^#{1,6}\s/.test(text)) {
                return (
                  <h3 key={index} className="review-heading">
                    {text.replace(/^#{1,6}\s*/, '')}
                  </h3>
                )
              }

              if (/^\d+\.\s/.test(text)) {
                return (
                  <h3 key={index} className="review-heading">
                    {text}
                  </h3>
                )
              }

              if (/^[-*•]\s/.test(text)) {
                return (
                  <p key={index} className="review-bullet">
                    • {text.replace(/^[-*•]\s*/, '')}
                  </p>
                )
              }

              return <p key={index}>{text}</p>
            })}
          </div>
        </div>
      )}
      <div className="content-card career-history-section">
  <div className="section-heading-row">
    <div>
      <span className="eyebrow">YOUR PROGRESS</span>
      <h2>Saved Career Plans</h2>
      <p className="muted">
        Review your previously generated career plans.
      </p>
    </div>

    <button
      className="secondary-button"
      onClick={loadCareerCoachHistory}
      disabled={coachHistoryLoading}
    >
      {coachHistoryLoading ? 'Loading...' : 'Refresh History'}
    </button>
  </div>

  {coachHistoryLoading && (
    <p>Loading your saved career plans...</p>
  )}

  {coachHistoryError && (
    <p className="error-message">{coachHistoryError}</p>
  )}

  {!coachHistoryLoading &&
    !coachHistoryError &&
    careerCoachHistory.length === 0 && (
      <p className="muted">
        No saved career plans found. Generate your first plan to get started.
      </p>
    )}

  {!coachHistoryLoading &&
    careerCoachHistory.length > 0 && (
      <div className="career-history-list">
        {careerCoachHistory.map((plan, index) => (
          <div
            className="career-history-item"
            key={plan.id || plan._id || index}
          >
            <h3>
              {plan.targetRole || plan.role || `Career Plan ${index + 1}`}
            </h3>

            {plan.focusArea && (
              <p>
                <strong>Focus:</strong> {plan.focusArea}
              </p>
            )}

            {plan.createdAt && (
              <p className="muted">
                Created: {new Date(plan.createdAt).toLocaleString()}
              </p>
            )}

            {plan.careerPlan && (
              <pre className="career-plan-output">
                {plan.careerPlan}
              </pre>
            )}

            {plan.plan && (
              <pre className="career-plan-output">
                {typeof plan.plan === 'string'
                  ? plan.plan
                  : JSON.stringify(plan.plan, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    )}
</div>
    </section>
  )
  
case 'AI Interview Coach':
  return (
    <div className="page-content">
      <div className="content-card">
        <h2>AI Interview Coach</h2>
        <p className="muted">
          Practice job interviews using questions generated from your saved resume.
        </p>

        {interviewError && (
          <div className="notice">{interviewError}</div>
        )}

        <div className="form-group">
          <label className="field-label">Select Your Saved Resume</label>
          <select
            className="text-field"
            value={interviewResumeId}
            onChange={(e) => setInterviewResumeId(e.target.value)}
          >
            <option value="">Choose a resume</option>
            {recentResumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.fileName}
              </option>
            ))}
          </select>

          {recentResumes.length === 0 && (
            <p className="muted">
              No saved resumes found. Upload a PDF first from Analyze Resume.
            </p>
          )}
        </div>

        <div className="form-group">
          <label className="field-label">Target Job Role</label>
          <input
            className="text-field"
            type="text"
            placeholder="Example: Java Developer"
            value={interviewTargetRole}
            onChange={(e) => setInterviewTargetRole(e.target.value)}
          />
        </div>

        <button
          className="primary-button"
          onClick={generateInterviewQuestion}
          disabled={interviewLoading}
        >
          {interviewLoading ? 'Generating Question...' : 'Generate Interview Question'}
        </button>
      </div>

      {interviewQuestion && (
  <div className="content-card">
    <h3>Your Interview Question</h3>
    <p>{interviewQuestion}</p>

          <div className="form-group">
            <label className="field-label">Your Answer</label>
            <textarea
              className="text-field"
              rows="6"
              placeholder="Type your interview answer here..."
              value={interviewAnswer}
              onChange={(e) => setInterviewAnswer(e.target.value)}
            />
          </div>

          <button
            className="primary-button"
            onClick={submitInterviewAnswer}
            disabled={interviewEvaluating}
          >
            {interviewEvaluating ? 'Evaluating Answer...' : 'Submit Answer for AI Feedback'}
          </button>
        </div>
      )}

      
{interviewFeedback && (
  <div className="content-card">
    <h3>AI Feedback</h3>

    <div className="interview-feedback-text">
      {cleanInterviewText(interviewFeedback).split('\n').map((line, index) => {
        const trimmedLine = line.trim()

        if (!trimmedLine) return null

        if (/^SCORE:/i.test(trimmedLine)) {
          return (
            <h3 className="interview-score" key={index}>
              {trimmedLine}
            </h3>
          )
        }

        if (
          /^(STRENGTHS:|AREAS TO IMPROVE:|TECHNICAL ACCURACY:|IMPROVED ANSWER:)/i.test(trimmedLine)
        ) {
          return (
            <h4 className="interview-feedback-heading" key={index}>
              {trimmedLine}
            </h4>
          )
        }

        return (
          <p className="interview-feedback-line" key={index}>
            {trimmedLine}
          </p>
        )
      })}
    </div>

    <button
      className="primary-button"
      onClick={generateInterviewQuestion}
      disabled={interviewLoading}
    >
      {interviewLoading ? 'Generating...' : 'Next Question'}
    </button>
  </div>
)}

     <div className="content-card interview-history-container">

  <div className="interview-history-toggle">
    <div>
      <h3>Interview Practice History</h3>
      <p className="muted">
        Review your previous interview attempts and AI feedback.
      </p>
    </div>

    <button
      className="secondary-button"
      onClick={() => setShowInterviewHistory(!showInterviewHistory)}
    >
      {showInterviewHistory
        ? 'Hide History'
        : 'View Interview History'}
    </button>
  </div>

  {showInterviewHistory && (
    <div className="interview-history-content">

      {interviewHistory.length === 0 ? (
        <p className="muted">
          Your completed interview attempts will appear here.
        </p>
      ) : (
        interviewHistory.map((item) => (
          <div className="interview-history-card" key={item.id}>

            <div className="interview-history-header">
              <strong>{item.targetRole}</strong>

              <span className="muted">
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : ''}
              </span>
            </div>

            <div className="interview-history-section">
              <h4>Interview Question</h4>
              <p>{item.question}</p>
            </div>

            <div className="interview-history-section">
              <h4>Your Answer</h4>
              <p>{item.answer}</p>
            </div>

            <div className="interview-history-section">
              <h4>AI Feedback</h4>
              <p>{cleanInterviewText(item.feedback)}</p>
            </div>

          </div>
        ))
      )}

    </div>
  )}
</div>
    </div>
  )

      
      case 'Profile':
        return (
          <section className="content-card">
            <span className="eyebrow">ACCOUNT SETTINGS</span>
            <h2>Your profile</h2>
            <p className="muted">
              View your account information and manage your session.
            </p>

            <div className="profile-placeholder">
              <div className="avatar large">
                {profileEmail ? profileEmail.charAt(0).toUpperCase() : 'U'}
              </div>

              <div>
                <h3>
                  {profileEmail
                    ? profileEmail.split('@')[0]
                    : 'Your Account'}
                </h3>

                <p className="muted">
                  {profileLoading
                    ? 'Loading your account information...'
                    : profileEmail || 'Your account email will appear here.'}
                </p>
              </div>
            </div>

            {profileError && (
              <div className="notice">
                {profileError}
              </div>
            )}

            {!profileLoading && !profileError && profileEmail && (
              <div className="notice">
                Your profile is connected to your existing Spring Boot
                login session.
              </div>
            )}

            {!profileLoading && !profileError && !profileEmail && (
              <div className="notice">
                No account information is available yet. Please log in
                and open your profile again.
              </div>
            )}

            <div className="content-card">
              <h3>Account information</h3>

              <p className="muted">Email address</p>
              <p>
                <strong>
                  {profileLoading
                    ? 'Loading...'
                    : profileEmail || 'Not available'}
                </strong>
              </p>

              <p className="muted">
                Authentication: Spring Boot session
              </p>

              <button
                className="secondary-button"
                onClick={loadProfile}
                disabled={profileLoading}
              >
                {profileLoading ? 'Refreshing...' : 'Refresh Profile'}
              </button>
              
<button
  className="secondary-button"
  onClick={logoutUser}
  style={{ marginLeft: '10px' }}
>
  Logout
</button>

            </div>
          </section>
        )


      default:
        return (
          <>
            <section className="welcome-banner">
              <div className="welcome-copy">
                <span className="banner-tag">YOUR CAREER, YOUR FUTURE</span>
                <h2>Build a resume that opens doors.</h2>
                <p>
                  Analyze your resume, understand your strengths, and take
                  the next step in your career journey.
                </p>
                <button
                  className="banner-button"
                  onClick={() => changePage('Analyze Resume')}
                >
                  Analyze My Resume <span>→</span>
                </button>
              </div>

              <div className="banner-art" aria-hidden="true">
                <div className="art-circle">
                  <div className="art-document">
                    <div className="document-avatar">✓</div>
                    <div className="document-line long" />
                    <div className="document-line medium" />
                    <div className="document-line short" />
                    <div className="document-score">ATS Ready</div>
                  </div>
                  <div className="floating-check">✓</div>
                  <div className="floating-star">✦</div>
                </div>
              </div>
            </section>

            <div className="section-heading">
              <div>
                <h2>Your dashboard</h2>
                <p>Everything you need to move forward.</p>
              </div>
              <span className="status-pill">
                <span className="status-dot" />
                Dashboard preview
              </span>
            </div>

            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">Resumes Analyzed</span>
                  <span className="stat-icon blue">▤</span>
                </div>
                
<div className="stat-value">
  {historyLoading ? '...' : totalResumeAnalyses}
</div>
<p className="stat-note">
  {historyLoading
    ? 'Loading your resume data...'
    : 'Saved resume analyses'}
</p>

              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">Latest Resume Score</span>
                  <span className="stat-icon purple">✧</span>
                </div>
                
<div className="stat-value">
  {historyLoading
    ? '...'
    : latestResumeScore ?? '—'}
  <small>/100</small>
</div>
<p className="stat-note">
  {historyLoading
    ? 'Loading your latest score...'
    : resumeHistory.length > 0
      ? 'From your latest saved analysis'
      : 'Analyze a resume to see your score'}
</p>

              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">AI Reviews</span>
                  <span className="stat-icon green">✦</span>
                </div>
                <div className="stat-value">
  {aiReviewHistoryLoading ? '...' : aiReviewHistory.length}
</div>
                <p className="stat-note">AI review activity</p>
              </div>
            </section>

            <section className="section-heading quick-heading">
              <div>
                <h2>Quick actions</h2>
                <p>Choose what you want to work on today.</p>
              </div>
            </section>

            <section className="actions-grid">
              <button
                className="action-card"
                onClick={() => changePage('Analyze Resume')}
              >
                <span className="action-icon blue">▤</span>
                <span className="action-text">
                  <strong>Analyze Resume</strong>
                  <small>Check your resume and skills</small>
                </span>
                <span className="action-arrow">→</span>
              </button>

              <button
                className="action-card"
                onClick={() => changePage('AI Review')}
              >
                <span className="action-icon purple">✧</span>
                <span className="action-text">
                  <strong>AI Resume Review</strong>
                  <small>Get personalized feedback</small>
                </span>
                <span className="action-arrow">→</span>
              </button>

              <button
                className="action-card"
                onClick={() => changePage('Career Coach')}
              >
                <span className="action-icon green">◎</span>
                <span className="action-text">
                  <strong>Career Coach</strong>
                  <small>Plan your next career step</small>
                </span>
                <span className="action-arrow">→</span>
              </button>

              <button
                className="action-card"
                onClick={() => changePage('History')}
              >
                <span className="action-icon orange">◷</span>
                <span className="action-text">
                  <strong>Resume History</strong>
                  <small>Review previous analyses</small>
                </span>
                <span className="action-arrow">→</span>
              </button>
            </section>

            <section className="content-card next-step-card">
              <div className="next-step-icon">✦</div>
              <div>
                <h3>Your career toolkit, in one place</h3>
                <p>
                  The new React interface is set up. Next, we'll connect it
                  to your existing Spring Boot backend so your real resume
                  scores, history and AI feedback appear here.
                </p>
              </div>
              <button
                className="secondary-button"
                onClick={() => changePage('Analyze Resume')}
              >
                Get Started
              </button>
            </section>
          </>
        )
    }
  }

  return (
    <div className="app-shell">
      {mobileMenuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">R</div>
          <div className="brand-text">
            <strong>Resume<span>IQ</span></strong>
            <small>CAREER INTELLIGENCE</small>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="nav-caption">WORKSPACE</div>

        <nav className="main-nav" aria-label="Main navigation">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? 'nav-item-active' : ''
              }`}
              onClick={() => changePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
              {activePage === item.name && <span className="active-marker" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          

{!authChecking && (
  isAuthenticated ? (
    <button
      className="secondary-button"
      style={{ width: '100%', marginBottom: '14px' }}
      onClick={logoutUser}
    >
      Logout
    </button>
  ) : (
    <button
      className="secondary-button"
      style={{ width: '100%', marginBottom: '14px' }}
      onClick={() => {
        window.location.href = 'http://localhost:8081/login.html'
      }}
    >
      Login to ResumeIQ
    </button>
  )
)}

          <div className="help-card">
            <div className="help-symbol">?</div>
            <strong>Need a little help?</strong>
            <p>Take your next career step with confidence.</p>
            <button onClick={() => changePage('Career Coach')}>
              Explore Career Coach →
            </button>
          </div>

          <div className="sidebar-footer">
            <span className="footer-dot" />
            React UI preview
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              ☰
            </button>
            <div className="breadcrumb">
              <span>Workspace</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{activePage}</strong>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-date">Your career starts here</div>
            <button
              className="profile-button"
              onClick={() => changePage('Profile')}
              aria-label="Open profile"
            >
              <span className="avatar">U</span>
              <span className="profile-name">My Profile</span>
              <span className="profile-chevron">⌄</span>
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-title-row">
            <div>
              <p className="page-greeting">HELLO, WELCOME BACK 👋</p>
              <h1>{activePage === 'Home' ? 'Your Career Hub' : activePage}</h1>
              <p className="page-subtitle">
                {activePage === 'Home'
                  ? 'A smarter way to prepare for your next opportunity.'
                  : `Manage your ${activePage.toLowerCase()} in one place.`}
              </p>
            </div>
            <div className="date-chip">
              <span>◷</span> Career workspace
            </div>
          </div>

          {renderPage()}

          <footer className="page-footer">
            <span>ResumeIQ <span className="footer-separator">·</span> Career Intelligence</span>
            <span>Built to help you move forward.</span>
          </footer>
        </div>
      </main>
    </div>
  )
}

export default App