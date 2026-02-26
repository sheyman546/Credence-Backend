import express from 'express'
import { createHealthRouter } from './routes/health.js'
import { createDefaultProbes } from './services/health/probes.js'

import { AttestationRepository } from './repositories/attestationRepository.js'
import { createAttestationRouter } from './routes/attestations.js'

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())

// Attestation API
const attestationRepo = new AttestationRepository()
app.use('/api/attestations', createAttestationRouter(attestationRepo))

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'credence-backend' })
})

app.get('/api/trust/:address', (req, res) => {
  const { address } = req.params
  // Placeholder: in production, fetch from DB / reputation engine
  res.json({
    address,
    score: 0,
    bondedAmount: '0',
    bondStart: null,
    attestationCount: 0,
  })
})

app.get('/api/bond/:address', (req, res) => {
  const { address } = req.params
  res.json({
    address,
    bondedAmount: '0',
    bondStart: null,
    bondDuration: null,
    active: false,
  })
})

// Bulk verification endpoint (Enterprise)
app.use('/api/bulk', bulkRouter)

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Credence API listening on http://localhost:${PORT}`)
  })
}

export default app
