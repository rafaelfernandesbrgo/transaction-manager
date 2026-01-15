import { useState, useEffect, type FormEvent } from 'react'
import './Home.css'

interface Transaction {
  id: number
  amount: number
  description: string
  createdAt: string
}

const API_URL = 'http://localhost:4000'

export function Home() {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  async function fetchTransactions() {
    try {
      const res = await fetch(`${API_URL}/transactions`)
      if (res.ok) {
        const data = await res.json()
        setTransactions(data)
      }
    } catch {
      console.error('Failed to fetch transactions')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const amountNum = parseFloat(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }
    if (!description.trim()) {
      setError('Please enter a description')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountNum, description: description.trim() })
      })

      if (res.ok) {
        const newTx = await res.json()
        setTransactions(prev => [...prev, newTx])
        setAmount('')
        setDescription('')
      } else {
        const data = await res.json()
        setError(data.message || 'Failed to save transaction')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="home">
      <h1>Transaction Manager</h1>

      <form className="transaction-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">Amount ($)</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input
            id="description"
            type="text"
            placeholder="Enter description"
            maxLength={200}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Add Transaction'}
        </button>
      </form>

      <section className="transactions-list">
        <h2>Transactions</h2>
        {transactions.length === 0 ? (
          <p className="empty-state">No transactions yet. Add one above!</p>
        ) : (
          <ul>
            {transactions.map((tx) => (
              <li key={tx.id} className="transaction-item">
                <div className="tx-info">
                  <span className="tx-description">{tx.description}</span>
                  <span className="tx-date">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="tx-amount">${tx.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
