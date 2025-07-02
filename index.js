require('dotenv').config()
const express = require('express')
const People = require('./models/person')

const app = express()
const morgan = require('morgan')
const cors = require('cors')


app.use(express.json())
app.use(express.static('dist'))
morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

app.get('/api/persons', (request, response, next) => {
  People
    .find({})
    .then(people => {
      response.json(people)
    })
    .catch(error => next(error))
})

app.get('/info', (request, response, next) => {
  People
    .find({})
    .then(people => {
      const amount = people.length
      const d = new Date()
      const timeNow = d.toString()

      response.send(`
        <p>Phonebook has info for ${amount} people</p>
        <p>${timeNow}</p>
        `)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  People
    .findById(request.params.id)
    .then(people => {
      if (people) {
        response.json(people)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  People
    .findById(request.params.id)
    .then(people => {
      if (!people) {
        return response.status(404).end()
      }

      people.name = name
      people.number = number

      return people.save().then((updatedPeople) => {
        response.json(updatedPeople)
      })
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  People
    .findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  const people = new People ({
    name: body.name,
    number: body.number
  })

  people
    .save()
    .then(savedPeople => {
      response.json(savedPeople)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

const port = process.env.PORT
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
